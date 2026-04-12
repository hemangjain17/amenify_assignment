"""
chroma_store.py
---------------
ChromaDB vector store for the Amenify support bot (Windows-native local alternative).

Reads data/kb_records.json, chunks the raw_markdown, embeds chunks with 
Qwen3-Embedding-4B, and upserts them into a local ChromaDB stored at data/chroma_db.
"""

from __future__ import annotations

import json
import os
import re
import time
from pathlib import Path
from typing import Any

import chromadb

# ---------------------------------------------------------------------------
# Paths & constants
# ---------------------------------------------------------------------------
BASE_DIR        = Path(__file__).parent.parent
KB_RECORDS_PATH = BASE_DIR / "data" / "kb_records.json"
CHROMA_DB_PATH  = str(BASE_DIR / "data" / "chroma_db") 

COLLECTION_NAME = "amenify_kb"
EMBEDDING_MODEL = "Qwen/Qwen3-Embedding-4B"
EMBEDDING_DIM   = 2560

CHUNK_SIZE      = 400
CHUNK_OVERLAP   = 80
EMBED_BATCH     = 16

# ---------------------------------------------------------------------------
# Embedding
# ---------------------------------------------------------------------------
_local_embed_model = None

def _get_embedding_model():
    global _local_embed_model
    if _local_embed_model is None:
        from sentence_transformers import SentenceTransformer
        print(f"[Embedder] Loading {EMBEDDING_MODEL} (this may take a moment)...")
        _local_embed_model = SentenceTransformer(EMBEDDING_MODEL)
    return _local_embed_model

def _embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    import numpy as np
    model = _get_embedding_model()
    all_vecs = []
    for i in range(0, len(texts), EMBED_BATCH):
        batch = texts[i : i + EMBED_BATCH]
        batch_vecs = model.encode(batch, prompt_name="query")
        if isinstance(batch_vecs, np.ndarray):
            all_vecs.extend(batch_vecs.tolist())
        elif hasattr(batch_vecs, "cpu"):
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
    text = md
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", text)          
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)       
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)  
    text = re.sub(r"\*{1,3}([^*]+)\*{1,3}", r"\1", text)       
    text = re.sub(r"_{1,3}([^_]+)_{1,3}", r"\1", text)
    text = re.sub(r"`[^`]+`", " ", text)                        
    text = re.sub(r"^[-*_]{3,}\s*$", " ", text, flags=re.MULTILINE)  
    text = re.sub(r"\s+", " ", text).strip()
    return text

# ---------------------------------------------------------------------------
# Build index
# ---------------------------------------------------------------------------
def build_chroma_index(records_path: Path = KB_RECORDS_PATH, db_path: str = CHROMA_DB_PATH) -> int:
    with open(records_path, encoding="utf-8") as f:
        records: list[dict[str, Any]] = json.load(f)

    if not records:
        print("[Chroma] No records to index.")
        return 0

    client = chromadb.PersistentClient(path=db_path)
    
    # Drop and recreate
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass
        
    collection = client.create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )

    rows_text: list[str] = []
    rows_meta: list[dict[str, Any]] = []
    rows_id: list[str] = []

    idx = 0
    for rec in records:
        raw_md = rec.get("raw_markdown", "")
        clean  = _clean_markdown(raw_md)
        chunks = _chunk_text(clean) if clean else []

        if not chunks:
            chunks = [rec.get("summary", rec.get("page_title", ""))]

        ctas_json = json.dumps(rec.get("cta_links", []), ensure_ascii=False)
        services_str = json.dumps(rec.get("services", []), ensure_ascii=False)

        for chunk in chunks:
            rows_text.append(chunk)
            rows_meta.append({
                "url":            rec["url"][:1024],
                "page_title":     (rec.get("page_title") or "")[:512],
                "summary":        (rec.get("summary")    or "")[:4096],
                "services_json":  services_str[:4096],
                "cta_links_json": ctas_json[:8192],
            })
            rows_id.append(f"doc_{idx}")
            idx += 1

    print(f"[Chroma] Embedding {len(rows_text)} chunks from {len(records)} pages using local Qwen model...")
    vectors = _embed_texts(rows_text)

    # Batch add
    BATCH = 1000
    for i in range(0, len(rows_text), BATCH):
        collection.add(
            documents=rows_text[i : i + BATCH],
            embeddings=vectors[i : i + BATCH],
            metadatas=rows_meta[i : i + BATCH],
            ids=rows_id[i : i + BATCH],
        )
        print(f"  Inserted rows {i}-{i+len(rows_text[i:i+BATCH])-1} (running total: {min(i+BATCH, len(rows_text))})")

    print(f"[Chroma] Index built — {len(rows_text)} vectors in '{COLLECTION_NAME}' @ {db_path}")
    return len(rows_text)

# ---------------------------------------------------------------------------
# ChromaKB Drop-in replacement
# ---------------------------------------------------------------------------
class ChromaKB:
    def __init__(self, db_path: str = CHROMA_DB_PATH, top_k: int = 5, score_threshold: float = 0.3) -> None:
        self._db_path = db_path
        self.top_k = top_k
        self.score_threshold = score_threshold
        self._ready = False
        self._init()

    def _init(self) -> None:
        try:
            client = chromadb.PersistentClient(path=self._db_path)
            col = client.get_collection(COLLECTION_NAME)
            count = col.count()
            if count > 0:
                self._ready = True
                print(f"[ChromaKB] Ready — {count} vectors loaded from {self._db_path}")
                return
            print("[ChromaKB] Collection not found or empty. Run python chroma_store.py to build.")
        except Exception as exc:
            pass
            
    def is_ready(self) -> bool:
        return self._ready

    def search(self, query: str) -> list[dict[str, Any]]:
        if not self.is_ready():
            return []
        
        try:
            vec = _embed_texts([query])[0]
            client = chromadb.PersistentClient(path=self._db_path)
            col = client.get_collection(COLLECTION_NAME)
            
            results = col.query(
                query_embeddings=[vec],
                n_results=self.top_k,
                include=["metadatas", "documents", "distances"]
            )
            
            hits = []
            if results["documents"] and results["documents"][0]:
                for i in range(len(results["documents"][0])):
                    # Chroma returns euclidean distances. Convert if necessary, but we do naive threshold here
                    dist = results["distances"][0][i]
                    if dist > 1.5: continue # Basic distance filter
                    
                    meta = results["metadatas"][0][i]
                    doc  = results["documents"][0][i]
                    
                    try:
                        cta_links = json.loads(meta.get("cta_links_json", "[]"))
                    except BaseException:
                        cta_links = []
                        
                    hits.append({
                        "text":       doc,
                        "source_url": meta.get("url", ""),
                        "page_title": meta.get("page_title", ""),
                        "summary":    meta.get("summary", ""),
                        "page_links": cta_links,
                        "score":      round(1.0 - dist/2, 4), # Very rough pseudo-cosine
                    })
            return hits
        except Exception as exc:
            print(f"[ChromaKB] Search error: {exc}")
            return []

    async def hot_reload(self) -> None:
        import asyncio
        loop = asyncio.get_event_loop()
        print("[ChromaKB] Hot-reload: rebuilding index from kb_records.json...")
        try:
            count = await loop.run_in_executor(None, build_chroma_index)
            self._ready = count > 0
            print(f"[ChromaKB] Hot-reload complete — {count} vectors.")
        except Exception as exc:
            print(f"[ChromaKB][ERROR] Hot-reload failed: {exc}")

if __name__ == "__main__":
    import sys
    print("=" * 60)
    print("  Amenify Chroma Index Builder")
    print("=" * 60)
    if not KB_RECORDS_PATH.exists():
        print("[ERROR] kb_records.json not found. Run python scraper.py first.")
        sys.exit(1)
    try:
        total = build_chroma_index()
        print(f"  Done! {total} vectors indexed")
        sys.exit(0)
    except Exception as exc:
        import traceback
        traceback.print_exc()
        sys.exit(1)
