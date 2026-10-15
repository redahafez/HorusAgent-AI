import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_admin_overview_and_super_admin_reda_hafez():
    res = client.get("/api/v1/admin/overview")
    assert res.status_code == 200
    data = res.json()
    
    # Verify Super Admin is prominently Reda Hafez
    assert data["super_admin"]["name"] == "Reda Hafez"
    assert "Chief Architect" in data["super_admin"]["title"]
    assert "reda.hafez" in data["super_admin"]["email"]
    assert data["super_admin"]["avatar"] == "RH"
    assert data["super_admin"]["digital_signature"] == "HORUS-SIG-REDA-HAFEZ-001"
    
    # Verify collections
    assert len(data["tenants"]) >= 1
    assert len(data["workspaces"]) >= 1
    assert len(data["users"]) >= 1
    assert len(data["roles_matrix"]) >= 4
    
    # Verify Reda Hafez is marked as Root Super Admin in users list
    reda = next((u for u in data["users"] if u["id"] == "usr-reda-hafez"), None)
    assert reda is not None
    assert reda["is_super_admin"] is True
    assert reda["role"] == "SUPER_ADMIN"
    assert reda["mfa_enabled"] is True

def test_create_tenant():
    payload = {
        "name": "Quantum Defense AI",
        "slug": "quantum-defense",
        "tier": "National Security Air-Gap",
        "region": "US-GovCloud",
        "compliance_framework": "DoD IL6 & FDA 21 CFR Part 11",
        "data_sovereignty": "Zero-Egress Air-Gapped"
    }
    res = client.post("/api/v1/admin/tenants", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert data["tenant"]["slug"] == "quantum-defense"
    assert data["tenant"]["id"] == "org-quantum-defense"

def test_create_workspace():
    payload = {
        "tenant_id": "org-horus-core",
        "name": "Predictive Splicing AI Swarm",
        "description": "Biological sequence and non-coding variant impact forecasting.",
        "active_agents": ["Researcher", "Critic"],
        "monthly_token_quota": 8000000,
        "isolation_level": "Strict Process Sandbox"
    }
    res = client.post("/api/v1/admin/workspaces", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert data["workspace"]["name"] == "Predictive Splicing AI Swarm"

def test_invite_user_and_toggle_status():
    payload = {
        "name": "Dr. Layla Hachem",
        "email": "layla.hachem@horusagent.ai",
        "role": "AGENT_ARCHITECT",
        "role_title": "Senior Bio-ML Engineer",
        "tenant_id": "org-horus-core",
        "workspaces": ["ws-core-swarm"]
    }
    res = client.post("/api/v1/admin/users", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    user_id = data["user"]["id"]
    assert user_id == "usr-layla.hachem"
    assert data["user"]["avatar"] == "DL"
    
    # Toggle status to SUSPENDED
    res_status = client.patch(f"/api/v1/admin/users/{user_id}/status", json={"status": "SUSPENDED"})
    assert res_status.status_code == 200
    assert res_status.json()["user"]["status"] == "SUSPENDED"

def test_root_protection_for_super_admin_reda_hafez():
    # Attempt to suspend Reda Hafez should be blocked
    res = client.patch("/api/v1/admin/users/usr-reda-hafez/status", json={"status": "SUSPENDED"})
    assert res.status_code == 400
    assert "Root Protection" in res.json()["detail"]
    
    # Attempt to alter role of Reda Hafez should be blocked
    res_role = client.patch("/api/v1/admin/users/usr-reda-hafez/role", json={"role": "VIEWER"})
    assert res_role.status_code == 400
    assert "Root Protection" in res_role.json()["detail"]
