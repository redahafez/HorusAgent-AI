import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_workflows_templates():
    response = client.get("/api/v1/workflows")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3
    # Check default template presence
    template_ids = [w["id"] for w in data]
    assert "wf-zero-trust-mesh" in template_ids
    assert "wf-dual-critic-adversarial" in template_ids
    assert "wf-sandbox-runner-ci" in template_ids

def test_validate_valid_dag_topology():
    payload = {
        "name": "Linear Test DAG",
        "description": "A -> B -> C",
        "category": "CLOUD_ARCH",
        "nodes": [
            {"id": "node-a", "name": "Node A", "role": "RESEARCHER"},
            {"id": "node-b", "name": "Node B", "role": "ARCHITECT"},
            {"id": "node-c", "name": "Node C", "role": "CRITIC"}
        ],
        "edges": [
            {"id": "e1", "source": "node-a", "target": "node-b"},
            {"id": "e2", "source": "node-b", "target": "node-c"}
        ]
    }
    response = client.post("/api/v1/workflows/validate-canvas", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["has_cycles"] is False
    assert data["execution_order"] == ["node-a", "node-b", "node-c"]
    assert data["root_nodes"] == ["node-a"]
    assert data["sink_nodes"] == ["node-c"]

def test_cycle_detection_in_dag():
    # Circular loop: A -> B -> C -> A
    cyclic_payload = {
        "name": "Circular Broken DAG",
        "description": "Loop test",
        "category": "CLOUD_ARCH",
        "nodes": [
            {"id": "node-1", "name": "Node 1", "role": "RESEARCHER"},
            {"id": "node-2", "name": "Node 2", "role": "ARCHITECT"},
            {"id": "node-3", "name": "Node 3", "role": "CRITIC"}
        ],
        "edges": [
            {"id": "e1", "source": "node-1", "target": "node-2"},
            {"id": "e2", "source": "node-2", "target": "node-3"},
            {"id": "e3", "source": "node-3", "target": "node-1"} # Cycle!
        ]
    }
    response = client.post("/api/v1/workflows/validate-canvas", json=cyclic_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is False
    assert data["has_cycles"] is True
    assert len(data["errors"]) > 0

def test_create_and_execute_custom_workflow():
    payload = {
        "name": "Custom FinTech Validation Swarm",
        "description": "Synthesizes fraud rules and verifies with critic",
        "category": "FINTECH",
        "nodes": [
            {"id": "fin-rag", "name": "Banking Knowledge", "role": "RESEARCHER", "position": {"x": 100, "y": 200}},
            {"id": "fin-code", "name": "Rule Generator", "role": "ARCHITECT", "position": {"x": 400, "y": 200}},
            {"id": "fin-seal", "name": "Compliance Seal", "role": "GOVERNANCE", "position": {"x": 700, "y": 200}}
        ],
        "edges": [
            {"id": "edge-1", "source": "fin-rag", "target": "fin-code"},
            {"id": "edge-2", "source": "fin-code", "target": "fin-seal"}
        ]
    }
    # Create workflow
    res_create = client.post("/api/v1/workflows", json=payload)
    assert res_create.status_code == 200
    wf = res_create.json()
    wf_id = wf["id"]
    assert wf["name"] == "Custom FinTech Validation Swarm"
    assert wf["is_template"] is False

    # Execute workflow
    exec_payload = {
        "objective": "Build zero-latency fraud anomaly scoring microservice",
        "domain": "FINTECH"
    }
    res_exec = client.post(f"/api/v1/workflows/{wf_id}/execute", json=exec_payload)
    assert res_exec.status_code == 200
    exec_data = res_exec.json()
    assert exec_data["status"] == "SUCCESS"
    assert exec_data["total_nodes_executed"] == 3
    assert exec_data["execution_order"] == ["fin-rag", "fin-code", "fin-seal"]
    assert len(exec_data["execution_trace"]) == 3

    # Delete custom workflow
    res_del = client.delete(f"/api/v1/workflows/{wf_id}")
    assert res_del.status_code == 200
    assert res_del.json()["status"] == "DELETED"

def test_template_deletion_protection():
    # Attempt to delete built-in template should be rejected with 403 Forbidden
    response = client.delete("/api/v1/workflows/wf-zero-trust-mesh")
    assert response.status_code == 403
