import pytest
from app.rag.embeddings import embedder
from app.rag.vector_store import vector_store

def test_embedder_dimension_and_normalization():
    vec = embedder.embed_text("Zero trust microservices architecture")
    assert len(vec) == 128
    
    # Check L2 unit length
    magnitude = sum(x * x for x in vec)
    assert 0.98 <= magnitude <= 1.02

def test_cosine_similarity_identical_and_orthogonal():
    v1 = embedder.embed_text("FDA 21 CFR Part 11 Electronic Records")
    v2 = embedder.embed_text("FDA 21 CFR Part 11 Electronic Records")
    sim_identical = embedder.cosine_similarity(v1, v2)
    assert sim_identical > 0.99

    v3 = embedder.embed_text("Quantum orbital mechanics satellite")
    sim_different = embedder.cosine_similarity(v1, v3)
    assert sim_different < sim_identical

def test_vector_store_seed_and_search():
    assert vector_store.count() >= 6
    
    hits = vector_store.search("Zero Trust mTLS and SPIFFE", top_k=5)
    assert len(hits) > 0
    titles = [h.title for h in hits]
    assert any("Zero-Trust" in t for t in titles)
    assert hits[0].similarity > 30.0

def test_chunk_and_ingest_and_delete():
    long_doc = "Chapter 1: Security protocols for enterprise AI. " * 20
    chunk_ids = vector_store.chunk_and_ingest(
        title="Automated Swarm Hardening Manual",
        content=long_doc,
        category="SECURITY_AUDIT",
        chunk_size=300,
        overlap=50
    )
    assert len(chunk_ids) > 1, "Long document should be partitioned into multiple sliding-window chunks"
    
    # Verify search finds the new chunks
    search_hits = vector_store.search("enterprise AI Security protocols", top_k=2)
    assert len(search_hits) > 0
    
    # Delete first chunk
    deleted = vector_store.delete_document(chunk_ids[0])
    assert deleted is True
    
    # Deleting non-existent returns False
    assert vector_store.delete_document("non-existent-id-999") is False
