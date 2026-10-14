import pytest
import asyncio
from app.agents.models import MissionRequest, AgentRole, AgentState
from app.agents.orchestrator import HorusOrchestrator
from app.agents.critic import CriticAgent
from app.agents.governance import SecurityAuditorAgent
from app.agents.engine import swarm_engine

@pytest.mark.asyncio
async def test_orchestrator_dag_compilation():
    orchestrator = HorusOrchestrator()
    req = MissionRequest(objective="Audit multi-region failover", domain="CLOUD_ARCH")
    nodes = orchestrator.compile_dag(req)
    
    assert len(nodes) == 4
    assert nodes[0].id == "node-1-research"
    assert nodes[0].role == AgentRole.RESEARCHER
    assert nodes[1].dependencies == ["node-1-research"]
    assert nodes[2].dependencies == ["node-2-architect"]
    assert nodes[3].dependencies == ["node-3-critic"]

@pytest.mark.asyncio
async def test_critic_scoring():
    critic = CriticAgent()
    score, critique = await critic.verify(
        objective="Test Objective",
        proposed_output="### Section\n```python\nprint('hello')\n```",
        citations=[]
    )
    assert score >= 90.0
    assert "Anti-Hallucination Audit" in critique

@pytest.mark.asyncio
async def test_governance_pii_sanitization():
    governance = SecurityAuditorAgent()
    dirty_text = "Deploying key sk-abcdef12345678901234567890 and email admin@enterprise.com to server 192.168.1.100"
    sanitized, passed, seal_hash = await governance.audit_and_seal(dirty_text)
    
    assert "[REDACTED_API_KEY]" in sanitized
    assert "[REDACTED_EMAIL]" in sanitized
    assert "[REDACTED_IP]" in sanitized
    assert "sk-abcdef" not in sanitized
    assert passed is True
    assert len(seal_hash) == 64 # SHA-256 length

@pytest.mark.asyncio
async def test_full_swarm_execution():
    req = MissionRequest(objective="Architect zero-trust mesh", domain="CLOUD_ARCH")
    events = []
    
    def callback(evt):
        events.append(evt)
        
    result = await swarm_engine.run_mission_stream(req, event_callback=callback)
    
    assert result.status == "SUCCESS"
    assert len(result.dag_nodes) == 4
    for node in result.dag_nodes:
        assert node.state in (AgentState.COMPLETED, AgentState.VERIFIED)
    assert result.total_tokens > 0
    assert result.total_latency_ms > 0
    assert result.verification_score >= 90.0
    assert len(events) > 5
