from fastapi import APIRouter, HTTPException, UploadFile, File, Form
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
    
    chunk_ids = vector_store.chunk_and_ingest(
        title=payload.title,
        content=payload.content,
        category=payload.category
    )
    return {
        "status": "INGESTED",
        "chunk_ids": chunk_ids,
        "total_chunks": vector_store.count()
    }

@router.delete("/documents/{chunk_id}")
async def delete_document(chunk_id: str):
    deleted = vector_store.delete_document(chunk_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document chunk not found")
    return {
        "status": "DELETED",
        "chunk_id": chunk_id,
        "total_chunks": vector_store.count()
    }

@router.post("/upload")
async def upload_document_file(
    file: UploadFile = File(...),
    category: str = Form("GENERAL"),
    title: Optional[str] = Form(None)
):
    try:
        content_bytes = await file.read()
        content = content_bytes.decode("utf-8", errors="ignore")
        doc_title = title or file.filename or "Uploaded Document"
        
        chunk_ids = vector_store.chunk_and_ingest(
            title=doc_title,
            content=content,
            category=category
        )
        return {
            "status": "UPLOADED_AND_CHUNKED",
            "filename": file.filename,
            "chunks_created": len(chunk_ids),
            "chunk_ids": chunk_ids,
            "total_chunks": vector_store.count()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file upload: {str(e)}")

@router.post("/search", response_model=List[KnowledgeCitation])
async def search_vector_store(payload: SearchQueryRequest):
    results = vector_store.search(
        query=payload.query,
        top_k=payload.top_k,
        category=payload.domain
    )
    return results

