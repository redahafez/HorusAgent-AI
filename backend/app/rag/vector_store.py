from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import uuid
from .embeddings import embedder
from .knowledge_seed import ENTERPRISE_KNOWLEDGE_DOCS
from ..agents.models import KnowledgeCitation

class VectorChunk:
    def __init__(self, chunk_id: str, title: str, category: str, content: str, vector: List[float]):
        self.chunk_id = chunk_id
        self.title = title
        self.category = category
        self.content = content
        self.vector = vector
        self.created_at = datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "chunk_id": self.chunk_id,
            "title": self.title,
            "category": self.category,
            "snippet": self.content[:240] + ("..." if len(self.content) > 240 else ""),
            "content": self.content,
            "created_at": self.created_at.isoformat()
        }

class InDiskVectorStore:
    """
    In-memory vector database with semantic cosine similarity search,
    real-time document ingestion, recursive text chunking, and category partitioning.
    """
    def __init__(self):
        self.chunks: List[VectorChunk] = []
        self._initialize_seed_corpus()

    def _initialize_seed_corpus(self):
        for doc in ENTERPRISE_KNOWLEDGE_DOCS:
            self.add_document(
                title=doc["title"],
                content=doc["content"],
                category=doc["category"],
                doc_id=doc["id"]
            )

    def add_document(self, title: str, content: str, category: str = "GENERAL", doc_id: Optional[str] = None) -> str:
        cid = doc_id or f"chunk-{uuid.uuid4().hex[:8]}"
        vector = embedder.embed_text(f"{title} {content}")
        chunk = VectorChunk(
            chunk_id=cid,
            title=title,
            category=category,
            content=content,
            vector=vector
        )
        self.chunks.append(chunk)
        return cid

    def chunk_and_ingest(self, title: str, content: str, category: str = "GENERAL", chunk_size: int = 400, overlap: int = 60) -> List[str]:
        """
        Splits large documents into sliding-window text chunks and indexes each into the vector store.
        """
        if len(content) <= chunk_size:
            return [self.add_document(title=title, content=content, category=category)]

        chunk_ids = []
        start = 0
        chunk_idx = 1
        while start < len(content):
            end = min(len(content), start + chunk_size)
            chunk_text = content[start:end]
            chunk_title = f"{title} (Part {chunk_idx})"
            cid = self.add_document(title=chunk_title, content=chunk_text, category=category)
            chunk_ids.append(cid)
            chunk_idx += 1
            if end >= len(content):
                break
            start += chunk_size - overlap

        return chunk_ids

    def delete_document(self, chunk_id: str) -> bool:
        initial_len = len(self.chunks)
        self.chunks = [c for c in self.chunks if c.chunk_id != chunk_id]
        return len(self.chunks) < initial_len

    def search(self, query: str, top_k: int = 3, category: Optional[str] = None, min_similarity: float = 0.20) -> List[KnowledgeCitation]:
        if not self.chunks or not query:
            return []

        query_vector = embedder.embed_text(query)
        scored_chunks = []

        for chunk in self.chunks:
            if category and chunk.category != category and category != "ALL":
                continue
            
            sim = embedder.cosine_similarity(query_vector, chunk.vector)
            if sim >= min_similarity:
                scored_chunks.append((sim, chunk))

        # Sort descending by similarity score
        scored_chunks.sort(key=lambda x: x[0], reverse=True)

        results: List[KnowledgeCitation] = []
        for sim, chunk in scored_chunks[:top_k]:
            results.append(KnowledgeCitation(
                chunk_id=chunk.chunk_id,
                title=chunk.title,
                category=chunk.category,
                similarity=round(sim * 100, 2),
                snippet=chunk.content[:220] + "..."
            ))

        return results

    def get_all(self) -> List[Dict[str, Any]]:
        return [chunk.to_dict() for chunk in self.chunks]

    def count(self) -> int:
        return len(self.chunks)

# Global singleton vector store instance
vector_store = InDiskVectorStore()

