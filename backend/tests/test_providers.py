import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.providers.manager import LLMProviderType, provider_manager

@pytest.mark.asyncio
async def test_get_providers_overview():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/providers")
        assert response.status_code == 200
        data = response.json()
        assert "providers" in data
        assert len(data["providers"]) == 5
        assert "active_provider" in data
        assert "routing_matrix" in data
        assert "hyperparameters" in data
        assert "analytics" in data

@pytest.mark.asyncio
async def test_save_and_test_provider():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Test Horus Sovereign (Always 200 without network)
        test_resp = await ac.post("/api/v1/providers/test", json={
            "provider": "HORUS_SOVEREIGN",
            "model": "horus-cognitive-v2-local"
        })
        assert test_resp.status_code == 200
        res = test_resp.json()
        assert res["success"] is True
        assert res["latency_ms"] >= 0

        # Test Save Provider Config
        save_resp = await ac.post("/api/v1/providers/save", json={
            "provider": "GROQ",
            "api_key": "gsk_test_mock_key_12345678",
            "selected_model": "llama-3.3-70b-versatile",
            "set_as_active": True
        })
        assert save_resp.status_code == 200
        assert save_resp.json()["active_provider"] == "GROQ"

@pytest.mark.asyncio
async def test_apply_preset():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        preset_resp = await ac.post("/api/v1/providers/preset", json={
            "preset_name": "SOVEREIGN_AIRGAP"
        })
        assert preset_resp.status_code == 200
        data = preset_resp.json()
        assert data["active_provider"] == "HORUS_SOVEREIGN"
        assert data["hyperparameters"]["temperature"] == 0.0

@pytest.mark.asyncio
async def test_analytics_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/v1/providers/analytics")
        assert resp.status_code == 200
        data = resp.json()
        assert "total_tokens" in data
        assert "estimated_cost_usd" in data
