import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_command_center():
    res = client.get("/api/v1/observability/command-center")
    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "AI Workflow Command Center"
    assert "kpis" in data
    assert data["kpis"]["workflow_health_pct"] == 98.6
    assert data["kpis"]["approval_rate_pct"] == 94.0
    assert len(data["workflow_routing_map"]["stages"]) == 5
    assert len(data["approval_queue"]) >= 3
    assert len(data["cost_pulse"]["time_series"]) > 0
    assert len(data["agent_health"]) >= 4
    assert len(data["system_alerts"]) >= 2

def test_update_approval_status():
    # Update appr-1 to Approved
    payload = {
        "item_id": "appr-1",
        "action": "Approved",
        "reviewer": "Dr. Sarah Chen"
    }
    res = client.post("/api/v1/observability/approval", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["item"]["status"] == "Approved"
    assert data["item"]["reviewer"] == "Dr. Sarah Chen"

    # Test not found
    err_res = client.post("/api/v1/observability/approval", json={"item_id": "nonexistent-item", "action": "Approved"})
    assert err_res.status_code == 404

def test_get_rag_telemetry():
    res = client.get("/api/v1/observability/rag-telemetry")
    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "RAG OBSERVABILITY & OPERATIONS"
    assert data["kpis"]["total_queries"] == 64982
    assert data["kpis"]["answer_success_rate"] == 92.7
    assert len(data["pipeline_overview"]) == 5
    assert len(data["top_data_sources"]) >= 5
    assert data["retrieval_quality"]["metric"] == "nDCG@10"
    assert data["retrieval_quality"]["score"] == 0.78
    assert data["semantic_drift"]["drift_score"] == 0.28
    assert len(data["evaluation_summary"]["breakdown"]) == 4
    assert data["knowledge_graph"]["node_count"] == 24
    assert len(data["recent_alerts"]) >= 3
