"""
knowledge_base.py
-----------------
Thin facade that re-exports ChromaKB as KnowledgeBase so that main.py
requires zero changes.

All logic lives in chroma_store.py for Windows compatibility.

CLI usage (rebuild the index):
    python knowledge_base.py
"""

from chroma_store import ChromaKB as KnowledgeBase   # noqa: F401
from chroma_store import build_chroma_index as build_index  # noqa: F401

__all__ = ["KnowledgeBase", "build_index"]

# ---------------------------------------------------------------------------
# CLI kept for backward compatibility
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import sys
    from chroma_store import build_chroma_index, KB_RECORDS_PATH

    if not KB_RECORDS_PATH.exists():
        print("[ERROR] kb_records.json not found. Run python scraper.py first.")
        sys.exit(1)

    total = build_chroma_index()
    print(f"[KnowledgeBase] Index built — {total} vectors.")
