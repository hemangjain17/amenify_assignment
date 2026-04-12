"""
milvus_store.py
---------------
Milvus Lite vector store for the Amenify support bot.

Reads data/kb_records.json (produced by scraper.py), chunks the raw_markdown
per page, embeds chunks with OpenAI text-embedding-3-small, and upserts them
into a local Milvus Lite collection stored at data/amenify.db.

At query time, the same embedding model encodes the user's question and the
collection is searched for the most similar chunks, returning text + CTA links.

Run directly to (re)build the index after scraping:
    python milvus_store.py

Called automatically by knowledge_base.py after each scrape cycle.
"""

from __future__ import annotations

import json
import os
import re
import time
from pathlib import Path
from typing import Any

import numpy as np
from dotenv import load_dotenv
from pymilvus import (
    MilvusClient,
    DataType,
)

load_dotenv()

# ---------------------------------------------------------------------------
# Paths & constants
# ---------------------------------------------------------------------------
BASE_DIR        = Path(__file__).parent.parent
KB_RECORDS_PATH = BASE_DIR / "data" / "kb_records.json"
MILVUS_DB_PATH  = "http://localhost:19530"    # Milvus Standalone (Docker)

COLLECTION_NAME = "amenify_kb"
EMBEDDING_MODEL = "Qwen/Qwen3-Embedding-4B"
EMBEDDING_DIM   = 2560

CHUNK_SIZE      = 400   # words
CHUNK_OVERLAP   = 80    # words
EMBED_BATCH     = 16    # batch size for local encoding to avoid memory limits


# ---------------------------------------------------------------------------
# Local Sentence-Transformers Embedding Helpers
# ---------------------------------------------------------------------------

_local_embed_model = None

def _get_embedding_model():
    """Lazily load the 4B Qwen embedding model when first needed."""
    global _local_embed_model
    if _local_embed_model is None:
        try:
            from sentence_transformers import SentenceTransformer
        except ImportError as e:
            raise ImportError("Run: pip install sentence-transformers transformers") from e
        
        print(f"[Embedder] Loading {EMBEDDING_MODEL} (this may take a moment)...")
        # For lower memory usage (if flash_attn is installed), add model_kwargs={"attn_implementation": "flash_attention_2"}
        # But keeping it standard for broader compatibility.
        _local_embed_model = SentenceTransformer(EMBEDDING_MODEL)
    return _local_embed_model

def _embed_texts(texts: list[str]) -> list[list[float]]:
    """Return list of embedding vectors using local model."""
    if not texts:
        return []
    
    model = _get_embedding_model()
    all_vecs = []
    
    for i in range(0, len(texts), EMBED_BATCH):
        batch = texts[i : i + EMBED_BATCH]
        # Qwen3 uses prompt_name="query" optimally for retrieval
        batch_vecs = model.encode(batch, prompt_name="query")
        # Ensure returned as list of floats
        if isinstance(batch_vecs, np.ndarray):
            all_vecs.extend(batch_vecs.tolist())
        elif hasattr(batch_vecs, "cpu"):  # just in case it's a tensor
            all_vecs.extend(batch_vecs.cpu().tolist())
        else:
            all_vecs.extend(batch_vecs)
            
    return all_vecs


# ---------------------------------------------------------------------------
# Chunking
# ---------------------------------------------------------------------------

def _chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    words  = text.split()
    step   = size - overlap
    chunks = []
    for i in range(0, max(1, len(words) - overlap), step):
        segment = " ".join(words[i : i + size])
        if len(segment.split()) >= 30:
            chunks.append(segment)
    return chunks


def _clean_markdown(md: str) -> str:
    """Strip markdown syntax to produce plain text for chunking."""
    text = md
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", text)          # images
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)       # links → label
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)  # headings
    text = re.sub(r"\*{1,3}([^*]+)\*{1,3}", r"\1", text)       # bold/italic
    text = re.sub(r"_{1,3}([^_]+)_{1,3}", r"\1", text)
    text = re.sub(r"`[^`]+`", " ", text)                        # inline code
    text = re.sub(r"^[-*_]{3,}\s*$", " ", text, flags=re.MULTILINE)  # hr
    text = re.sub(r"\s+", " ", text).strip()
    return text


# ---------------------------------------------------------------------------
# Milvus collection setup
# ---------------------------------------------------------------------------

def _ensure_collection(client: MilvusClient) -> None:
    """Create the amenify_kb collection if it doesn't exist."""
    if client.has_collection(COLLECTION_NAME):
        return

    schema = client.create_schema(auto_id=True, enable_dynamic_field=False)
    schema.add_field("id",           DataType.INT64,        is_primary=True)
    schema.add_field("url",          DataType.VARCHAR,      max_length=1024)
    schema.add_field("page_title",   DataType.VARCHAR,      max_length=512)
    schema.add_field("text",         DataType.VARCHAR,      max_length=8192)
    schema.add_field("summary",      DataType.VARCHAR,      max_length=4096)
    schema.add_field("services_json",DataType.VARCHAR,      max_length=4096)
    schema.add_field("cta_links_json",DataType.VARCHAR,     max_length=8192)
    schema.add_field("embedding",    DataType.FLOAT_VECTOR, dim=EMBEDDING_DIM)

    index_params = client.prepare_index_params()
    index_params.add_index(
        field_name="embedding",
        index_type="FLAT",          # exact search — fine for <100K vectors
        metric_type="COSINE",
    )

    client.create_collection(
        collection_name=COLLECTION_NAME,
        schema=schema,
        index_params=index_params,
    )
    print(f"[Milvus] Created collection '{COLLECTION_NAME}'.")


# ---------------------------------------------------------------------------
# Build / upsert index
# ---------------------------------------------------------------------------

def build_milvus_index(
    records_path: Path = KB_RECORDS_PATH,
    db_path:      str  = MILVUS_DB_PATH,
) -> int:
    """
    Read kb_records.json, chunk raw_markdown, embed, and upsert into Milvus Lite.

    Steps:
    1. Drop + recreate collection (full rebuild for simplicity).
    2. For each record, chunk its raw_markdown.
    3. Embed all chunks in batches.
    4. Insert rows: chunk text + page-level metadata.
    5. Return total inserted count.
    """

    with open(records_path, encoding="utf-8") as f:
        records: list[dict[str, Any]] = json.load(f)

    if not records:
        print("[Milvus] No records to index.")
        return 0

    mc = MilvusClient(db_path)

    # Full rebuild: drop if exists, then recreate
    if mc.has_collection(COLLECTION_NAME):
        mc.drop_collection(COLLECTION_NAME)
        print(f"[Milvus] Dropped existing collection '{COLLECTION_NAME}'.")
    _ensure_collection(mc)

    # Prepare rows
    rows_text:  list[str]            = []
    rows_meta:  list[dict[str, Any]] = []

    for rec in records:
        raw_md   = rec.get("raw_markdown", "")
        clean    = _clean_markdown(raw_md)
        chunks   = _chunk_text(clean) if clean else []

        # Always include at least one row per page (summary-based)
        if not chunks:
            chunks = [rec.get("summary", rec.get("page_title", ""))]

        ctas_json    = json.dumps(rec.get("cta_links", []),  ensure_ascii=False)
        services_str = json.dumps(rec.get("services", []),   ensure_ascii=False)

        for chunk in chunks:
            rows_text.append(chunk)
            rows_meta.append({
                "url":            rec["url"],
                "page_title":     (rec.get("page_title") or "")[:512],
                "text":           chunk[:8192],
                "summary":        (rec.get("summary")    or "")[:4096],
                "services_json":  services_str[:4096],
                "cta_links_json": ctas_json[:8192],
            })

    print(f"[Milvus] Embedding {len(rows_text)} chunks from {len(records)} pages using local Qwen model...")
    vectors = _embed_texts(rows_text)

    # Assemble insert data
    insert_data = []
    for meta, vec in zip(rows_meta, vectors):
        row = dict(meta)
        row["embedding"] = vec
        insert_data.append(row)

    # Batch insert
    BATCH = 500
    total = 0
    for i in range(0, len(insert_data), BATCH):
        batch = insert_data[i : i + BATCH]
        res   = mc.insert(COLLECTION_NAME, batch)
        total += res.get("insert_count", len(batch)) if isinstance(res, dict) else len(batch)
        print(f"  Inserted rows {i}–{i + len(batch) - 1}  (running total: {total})")

    mc.flush(COLLECTION_NAME)
    print(f"[Milvus] Index built — {total} vectors in '{COLLECTION_NAME}' @ {db_path}")
    mc.close()
    return total


# ---------------------------------------------------------------------------
# MilvusKB — drop-in replacement for KnowledgeBase
# ---------------------------------------------------------------------------

class MilvusKB:
    """
    Semantic search over the Milvus Lite amenify_kb collection.

    Public interface mirrors the original KnowledgeBase:
        is_ready() -> bool
        search(query: str) -> list[dict]
        hot_reload() -> Coroutine   (async, called after each scrape)
    """

    def __init__(
        self,
        db_path:        str   = MILVUS_DB_PATH,
        top_k:          int   = 5,
        score_threshold: float = 0.30,
    ) -> None:
        self._db_path        = db_path
        self.top_k           = top_k
        self.score_threshold = score_threshold
        self._ready          = False

        self._init()

    def _init(self) -> None:
        # Check if collection exists and has rows

        try:
            mc = MilvusClient(self._db_path)
            if mc.has_collection(COLLECTION_NAME):
                stats = mc.get_collection_stats(COLLECTION_NAME)
                count = int(stats.get("row_count", 0))
                mc.close()
                if count > 0:
                    self._ready = True
                    print(f"[MilvusKB] Ready — {count} vectors loaded from {self._db_path}")
                    return
            mc.close()
            print("[MilvusKB] Collection not found or empty. Run python milvus_store.py to build.")
        except Exception as exc:
            print(f"[MilvusKB] WARN Init check failed: {exc}")

    def is_ready(self) -> bool:
        return self._ready

    def search(self, query: str) -> list[dict[str, Any]]:
        """
        Embed query and return top-k matching chunks as:
        [{"text", "source_url", "page_links", "score"}]

        page_links is populated from the stored cta_links_json so the
        chatbot can surface direct navigation / booking links.
        """
        if not self.is_ready():
            return []

        try:
            vec = _embed_texts([query])[0]
            mc  = MilvusClient(self._db_path)

            hits = mc.search(
                collection_name=COLLECTION_NAME,
                data=[vec],
                anns_field="embedding",
                search_params={"metric_type": "COSINE"},
                limit=self.top_k,
                output_fields=["url", "page_title", "text", "summary", "cta_links_json"],
            )
            mc.close()

            results: list[dict[str, Any]] = []
            for hit in hits[0]:
                score = float(hit.get("distance", 0))
                if score < self.score_threshold:
                    continue
                entity = hit["entity"]
                try:
                    cta_links = json.loads(entity.get("cta_links_json", "[]"))
                except json.JSONDecodeError:
                    cta_links = []

                results.append({
                    "text":       entity.get("text", ""),
                    "source_url": entity.get("url", ""),
                    "page_title": entity.get("page_title", ""),
                    "summary":    entity.get("summary", ""),
                    "page_links": cta_links,   # list of {label, url}
                    "score":      round(score, 4),
                })

            return results

        except Exception as exc:
            print(f"[MilvusKB] Search error: {exc}")
            return []

    async def hot_reload(self) -> None:
        """
        Async hot-reload — rebuild Milvus index from freshly scraped records,
        then mark self as ready.  Called by the API server after each scrape.
        """
        import asyncio
        loop = asyncio.get_event_loop()

        print("[MilvusKB] Hot-reload: rebuilding index from kb_records.json...")
        try:
            count = await loop.run_in_executor(None, build_milvus_index)
            self._ready = count > 0
            print(f"[MilvusKB] Hot-reload complete — {count} vectors.")
        except Exception as exc:
            print(f"[MilvusKB][ERROR] Hot-reload failed: {exc}")


# ---------------------------------------------------------------------------
# Direct execution — python milvus_store.py
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import sys

    print("=" * 60)
    print("  Amenify Milvus Index Builder")
    print(f"  Source : {KB_RECORDS_PATH}")
    print(f"  DB     : {MILVUS_DB_PATH}")
    print("=" * 60)

    if not KB_RECORDS_PATH.exists():
        print("[ERROR] kb_records.json not found. Run python scraper.py first.")
        sys.exit(1)

    start = time.time()
    try:
        total = build_milvus_index()
        elapsed = time.time() - start
        print()
        print("=" * 60)
        print(f"  Done!  {total} vectors indexed in {elapsed:.1f}s")
        print(f"  Start the server: uvicorn main:app --reload")
        print("=" * 60)

        # Quick sanity search
        print("\n[Test] Running sanity search: 'cleaning services'")
        kb = MilvusKB()
        hits = kb.search("cleaning services amenify")
        for h in hits:
            print(f"  score={h['score']:.3f}  url={h['source_url']}")
            print(f"  text={h['text'][:120]}...")
            print(f"  ctas={len(h['page_links'])} links")

        sys.exit(0)
    except EnvironmentError as exc:
        print(f"\n[ERROR] {exc}")
        sys.exit(1)
    except Exception as exc:
        import traceback
        traceback.print_exc()
        sys.exit(1)
