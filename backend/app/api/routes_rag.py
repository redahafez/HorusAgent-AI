from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from ..rag.vector_store import vector_store
from ..agents.models import KnowledgeCitation

router = APIRouter(prefix="/rag", tags=["Vector RAG"])

class DocumentIngestRequest(BaseModel):
    title: str
    content: str
    category: str = "GENERAL"

class SearchQueryRequest(BaseModel):
    query: str
    domain: Optional[str] = "ALL"
    top_k: int = 3

@router.get("/documents")
async def list_documents():
    return {
        "total_chunks": vector_store.count(),
        "documents": vector_store.get_all()
    }

@router.post("/documents")
async def ingest_document(payload: DocumentIngestRequest):
    if not payload.title.strip() or not payload.content.strip():
        raise HTTPException(status_code=400, detail="Title and content are required.")
    
    chunk_id = vector_store.add_document(
        title=payload.title,
        content=payload.content,
        category=payload.category
    )
    return {
        "status": "INGESTED",
        "chunk_id": chunk_id,
        "total_chunks": vector_store.count()
    }

@router.post("/search", response_model=List[KnowledgeCitation])
async def search_vector_store(payload: SearchQueryRequest):
    results = vector_store.search(
        query=payload.query,
        top_k=payload.top_k,
        category=payload.domain
    )
    return results
