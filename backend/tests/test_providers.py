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
        assert len(data["providers"]) == 8
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

@pytest.mark.asyncio
async def test_openrouter_overview_and_chat_completions():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Test Router Overview (OpenRouter schema)
        router_resp = await ac.get("/api/v1/providers/router-overview")
        assert router_resp.status_code == 200
        r_data = router_resp.json()
        assert "model_comparison" in r_data
        assert len(r_data["model_comparison"]) >= 6
        assert "fallback_chain" in r_data
        assert len(r_data["fallback_chain"]) == 4
        assert "traffic_split" in r_data
        assert "routing_health" in r_data
        assert r_data["routing_health"]["success_rate_pct"] == 99.6
        assert "unified_endpoint" in r_data

        # 2. Test Fallback Chain Update
        new_chain = [
            {"step": 1, "role": "Primary Model", "model": "Claude 3.5 Sonnet", "model_id": "claude-3-5-sonnet-20241022", "on_event": "On Failure", "mode": "Auto"},
            {"step": 2, "role": "Final Fallback", "model": "Horus Sovereign", "model_id": "horus-cognitive-v2-local", "on_event": "Air-Gapped Local", "mode": "Auto"}
        ]
        chain_resp = await ac.post("/api/v1/providers/fallback-chain", json={"fallback_chain": new_chain})
        assert chain_resp.status_code == 200
        assert chain_resp.json()["success"] is True

        # 3. Test Direct OpenAI-Compatible /chat/completions Endpoint
        chat_payload = {
            "model": "horus-auto",
            "messages": [
                {"role": "system", "content": "You are Horus Agent Swarm."},
                {"role": "user", "content": "Design a resilient microservice mesh with zero trust"}
            ],
            "temperature": 0.2,
            "max_tokens": 1000
        }
        chat_resp = await ac.post("/api/v1/chat/completions", json=chat_payload)
        assert chat_resp.status_code == 200
        c_data = chat_resp.json()
        assert c_data["object"] == "chat.completion"
        assert len(c_data["choices"]) == 1
        assert "message" in c_data["choices"][0]
        assert "content" in c_data["choices"][0]["message"]
        assert "HORUS SWARM" in c_data["choices"][0]["message"]["content"]
        assert "usage" in c_data
        assert c_data["usage"]["total_tokens"] > 0

