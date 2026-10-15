import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login_success_super_admin():
    payload = {
        "email": "reda.hafez@horusagent.ai",
        "password": "Horus@Root2026!",
        "mfa_code": "777888"
    }
    res = client.post("/api/v1/auth/login", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert "session_token" in data
    assert data["user"]["name"] == "Reda Hafez"
    assert data["user"]["role"] == "SUPER_ADMIN"
    assert data["user"]["is_super_admin"] is True

def test_login_two_step_mfa_flow():
    # Step 1: Submit email & password without MFA code
    payload = {
        "email": "sarah.chen@horusagent.ai",
        "password": "Sarah@Horus2026!"
    }
    res = client.post("/api/v1/auth/login", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["requires_mfa"] is True
    assert "temp_token" in data
    
    # Step 2: Submit valid MFA code
    mfa_payload = {
        "temp_token": data["temp_token"],
        "mfa_code": "123456"
    }
    mfa_res = client.post("/api/v1/auth/verify-mfa", json=mfa_payload)
    assert mfa_res.status_code == 200
    mfa_data = mfa_res.json()
    assert mfa_data["status"] == "SUCCESS"
    assert mfa_data["user"]["name"] == "Sarah Chen"
    assert "session_token" in mfa_data

def test_brute_force_lockout_protection():
    test_email = "brute_target@horusagent.ai"
    # Register this test user first
    reg_payload = {
        "name": "Brute Target User",
        "email": test_email,
        "password": "Valid@Password2026!"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    # Now attempt 5 bad passwords consecutively
    for i in range(1, 5):
        bad_res = client.post("/api/v1/auth/login", json={"email": test_email, "password": "WrongPassword!"})
        assert bad_res.status_code == 401
        assert f"Attempt {i} of 5" in bad_res.json()["detail"]

    # 5th attempt must trigger Anti-Breach Lockout
    locked_res = client.post("/api/v1/auth/login", json={"email": test_email, "password": "WrongPassword!"})
    assert locked_res.status_code == 429
    assert "Account locked" in locked_res.json()["detail"]

def test_registration_entropy_validation():
    # Weak password should be rejected
    weak_payload = {
        "name": "Weak User",
        "email": "weak@horusagent.ai",
        "password": "password"
    }
    res_weak = client.post("/api/v1/auth/register", json=weak_payload)
    assert res_weak.status_code == 400
    assert "special symbols" in res_weak.json()["detail"]

    # Strong password should succeed
    strong_payload = {
        "name": "Engineer Nour",
        "email": "nour@horusagent.ai",
        "password": "Nour@SecurePass2026!"
    }
    res_strong = client.post("/api/v1/auth/register", json=strong_payload)
    assert res_strong.status_code == 200
    data = res_strong.json()
    assert data["status"] == "SUCCESS"
    assert "session_token" in data
    assert data["user"]["name"] == "Engineer Nour"

def test_logout_and_session_invalidation():
    # 1. Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "marcus.brody@horusagent.ai",
        "password": "Marcus@Swarm2026!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["session_token"]

    # 2. Verify /me works
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["user"]["name"] == "Marcus Brody"

    # 3. Logout
    logout_res = client.post("/api/v1/auth/logout", headers=headers)
    assert logout_res.status_code == 200

    # 4. Subsequent /me must fail with 401
    me_after_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_after_res.status_code == 401

def test_security_audit_log():
    res = client.get("/api/v1/auth/audit-log")
    assert res.status_code == 200
    data = res.json()
    assert data["total_events"] > 0
    assert len(data["events"]) > 0
    assert "PBKDF2" in data["security_policy"]
