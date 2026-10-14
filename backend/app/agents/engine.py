import asyncio
import time
import uuid
from datetime import datetime
from typing import AsyncGenerator, Callable, Optional, List, Any

from .models import (
    MissionRequest, MissionResult, DAGNode, AgentRole, AgentState,
    StreamEvent, StreamEventType, KnowledgeCitation
)
from .orchestrator import HorusOrchestrator
from .researcher import ResearchAgent
from .architect import CodeArchitectAgent
from .critic import CriticAgent
from .governance import SecurityAuditorAgent
from ..providers.manager import provider_manager, LLMProviderType

class SwarmExecutionEngine:
    """
    Coordinates asynchronous execution of the multi-agent swarm across the DAG.
    Emits granular real-time stream events for live WebSocket and SSE consumers.
    """
    def __init__(self):
        self.orchestrator = HorusOrchestrator()
        self.researcher = ResearchAgent()
        self.architect = CodeArchitectAgent()
        self.critic = CriticAgent()
        self.governance = SecurityAuditorAgent()

    async def run_mission_stream(
        self,
        request: MissionRequest,
        event_callback: Optional[Callable[[StreamEvent], Any]] = None
    ) -> MissionResult:
        mission_id = f"mission-{uuid.uuid4().hex[:8]}"
        start_time = time.time()
        total_tokens = 0

        async def emit(event_type: StreamEventType, agent: Optional[AgentRole] = None, node_id: Optional[str] = None, data: dict = None):
            evt = StreamEvent(
                event_type=event_type,
                mission_id=mission_id,
                agent=agent,
                node_id=node_id,
                data=data or {}
            )
            if event_callback:
                if asyncio.iscoroutinefunction(event_callback):
                    await event_callback(evt)
                else:
                    event_callback(evt)

        # 1. Mission Started & DAG Initialization
        active_prov = provider_manager.global_active_provider
        active_mdl = provider_manager.selected_models.get(active_prov, "horus-cognitive-v2-local")
        await emit(
            StreamEventType.MISSION_STARTED,
            AgentRole.ORCHESTRATOR,
            data={
                "objective": request.objective,
                "domain": request.domain,
                "provider": active_prov.value,
                "model": active_mdl,
                "temperature": provider_manager.hyperparameters.temperature,
                "anti_hallucination": provider_manager.hyperparameters.anti_hallucination_level
            }
        )
        dag_nodes = self.orchestrator.compile_dag(request)
        await emit(StreamEventType.DAG_INITIALIZED, AgentRole.ORCHESTRATOR, data={"nodes": [n.model_dump() for n in dag_nodes]})

        citations: List[KnowledgeCitation] = []
        research_context = ""
        synthesized_code = ""
        critic_critique = ""
        final_sealed_output = ""
        verification_score = 95.0

        # 2. Execute Node 1: Research & Vector RAG
        node1 = dag_nodes[0]
        node1.state = AgentState.EXECUTING
        node1.started_at = datetime.utcnow()
        await emit(StreamEventType.AGENT_STATE_CHANGED, AgentRole.RESEARCHER, node1.id, {"state": node1.state})

        t0 = time.time()
        research_context, citations = await self.researcher.execute(request.objective, request.domain)
        node1.latency_ms = int((time.time() - t0) * 1000)
        node1.output = research_context
        node1.state = AgentState.COMPLETED
        node1.completed_at = datetime.utcnow()
        node1.confidence = 0.98
        total_tokens += 450

        for cit in citations:
            await emit(StreamEventType.CITATION_RETRIEVED, AgentRole.RESEARCHER, node1.id, cit.model_dump())
        await emit(StreamEventType.AGENT_STATE_CHANGED, AgentRole.RESEARCHER, node1.id, {"state": node1.state, "latency_ms": node1.latency_ms})

        # 3. Execute Node 2: Architect & Code Synthesis
        node2 = dag_nodes[1]
        node2.state = AgentState.EXECUTING
        node2.started_at = datetime.utcnow()
        await emit(StreamEventType.AGENT_STATE_CHANGED, AgentRole.ARCHITECT, node2.id, {"state": node2.state})

        t0 = time.time()
        synthesized_code = await self.architect.execute(request.objective, request.domain, research_context)
        
        # Dynamic token streaming speed governed by hyperparameters
        delay = max(0.005, provider_manager.hyperparameters.stream_chunk_delay_ms / 1000.0)
        words = synthesized_code.split(" ")
        chunk_size = 14 if provider_manager.hyperparameters.stream_chunk_delay_ms <= 20 else 10
        for i in range(0, len(words), chunk_size):
            chunk = " ".join(words[i:i+chunk_size]) + " "
            await emit(StreamEventType.TOKEN_STREAM, AgentRole.ARCHITECT, node2.id, {"token": chunk})
            await asyncio.sleep(delay)

        node2.latency_ms = int((time.time() - t0) * 1000)
        node2.output = synthesized_code
        node2.state = AgentState.COMPLETED
        node2.completed_at = datetime.utcnow()
        node2.confidence = 0.96
        total_tokens += 1280
        await emit(StreamEventType.AGENT_STATE_CHANGED, AgentRole.ARCHITECT, node2.id, {"state": node2.state, "latency_ms": node2.latency_ms})

        # 4. Execute Node 3: Critic Reflection & Anti-Hallucination
        node3 = dag_nodes[2]
        node3.state = AgentState.REFLECTING
        node3.started_at = datetime.utcnow()
        await emit(StreamEventType.AGENT_STATE_CHANGED, AgentRole.CRITIC, node3.id, {"state": node3.state})

        t0 = time.time()
        verification_score, critic_critique = await self.critic.verify(request.objective, synthesized_code, citations)
        await asyncio.sleep(0.2)
        node3.latency_ms = int((time.time() - t0) * 1000)
        node3.output = critic_critique
        node3.state = AgentState.VERIFIED
        node3.completed_at = datetime.utcnow()
        node3.confidence = verification_score / 100.0
        total_tokens += 380
        await emit(StreamEventType.CRITIC_VERIFICATION, AgentRole.CRITIC, node3.id, {"score": verification_score, "critique": critic_critique})
        await emit(StreamEventType.AGENT_STATE_CHANGED, AgentRole.CRITIC, node3.id, {"state": node3.state, "latency_ms": node3.latency_ms})

        # 5. Execute Node 4: Governance & PII Sealing
        node4 = dag_nodes[3]
        node4.state = AgentState.EXECUTING
        node4.started_at = datetime.utcnow()
        await emit(StreamEventType.AGENT_STATE_CHANGED, AgentRole.GOVERNANCE, node4.id, {"state": node4.state})

        t0 = time.time()
        combined_payload = f"{synthesized_code}\n\n{critic_critique}"
        final_sealed_output, compliance_passed, seal_hash = await self.governance.audit_and_seal(combined_payload)
        await asyncio.sleep(0.15)
        node4.latency_ms = int((time.time() - t0) * 1000)
        node4.output = f"Audit Seal: {seal_hash}"
        node4.state = AgentState.COMPLETED
        node4.completed_at = datetime.utcnow()
        node4.confidence = 1.0
        total_tokens += 260
        await emit(StreamEventType.GOVERNANCE_AUDIT, AgentRole.GOVERNANCE, node4.id, {"hash": seal_hash, "passed": compliance_passed})
        await emit(StreamEventType.AGENT_STATE_CHANGED, AgentRole.GOVERNANCE, node4.id, {"state": node4.state, "latency_ms": node4.latency_ms})

        total_latency_ms = int((time.time() - start_time) * 1000)

        result = MissionResult(
            mission_id=mission_id,
            objective=request.objective,
            domain=request.domain,
            status="SUCCESS",
            dag_nodes=dag_nodes,
            final_output=final_sealed_output,
            citations=citations,
            total_tokens=total_tokens,
            total_latency_ms=total_latency_ms,
            verification_score=verification_score,
            compliance_passed=compliance_passed
        )

        # Record usage metrics in ProviderManager
        active_model = provider_manager.selected_models.get(provider_manager.global_active_provider, "horus-cognitive-v2-local")
        provider_manager.record_usage(active_model, tokens_in=total_tokens // 2, tokens_out=total_tokens // 2)

        completion_data = result.model_dump(mode="json")
        completion_data["analytics"] = provider_manager.get_analytics()
        completion_data["active_provider"] = provider_manager.global_active_provider.value
        completion_data["active_model"] = active_model

        await emit(StreamEventType.MISSION_COMPLETED, AgentRole.ORCHESTRATOR, data=completion_data)
        return result

# Singleton Swarm Engine
swarm_engine = SwarmExecutionEngine()
