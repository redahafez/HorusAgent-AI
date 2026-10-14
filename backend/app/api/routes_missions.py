from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from ..agents.models import MissionRequest, MissionResult
from ..agents.engine import swarm_engine

router = APIRouter(prefix="/missions", tags=["Missions"])

PRESET_MISSIONS: List[Dict[str, Any]] = [
    {
        "id": "preset-cloud",
        "domain": "CLOUD_ARCH",
        "title": "Zero-Trust Cloud Mesh & Microservices Resilience Audit",
        "description": "Orchestrates multi-agent swarm to design an enterprise zero-trust ingress gateway with mTLS service mesh, Redis distributed caching, and 99.999% SLA.",
        "objective": "Design an enterprise-scale zero-trust cloud microservices mesh with automated failover, SPIRE mTLS identities, and sub-3s disaster recovery."
    },
    {
        "id": "preset-clinical",
        "domain": "CLINICAL_RAG",
        "title": "FDA 21 CFR Part 11 & GxP Thermal Compliance Pipeline",
        "description": "Grounds agents in ALCOA+ data integrity standards to architect cold-chain telemetry validation with electronic audit trails and MKT threshold enforcement.",
        "objective": "Architect a GxP-compliant IoT telemetry ingestion pipeline with 21 CFR Part 11 electronic signature stamps and automated thermal excursion quarantines."
    },
    {
        "id": "preset-microservices",
        "domain": "MICROSERVICES",
        "title": "Sub-Millisecond Idempotent Event Broker & Outbox Engine",
        "description": "Constructs a distributed event-driven broker using Redis distributed locks, SHA-256 payload fingerprinting, and transactional outbox patterns.",
        "objective": "Build a high-throughput event ingestion endpoint with SHA-256 idempotency locks, duplicate replay headers, and HTTP 409 conflict detection."
    },
    {
        "id": "preset-security",
        "domain": "SECURITY_AUDIT",
        "title": "Autonomous AI Swarm Security & Prompt Injection Defense",
        "description": "Runs threat modeling against indirect prompt injection, PII leakages, and unauthorized tool calls using a dedicated reflection critic loop.",
        "objective": "Formulate a zero-trust multi-agent defense protocol with PII redaction, sandbox boundaries, and cryptographic SHA-256 output verification."
    }
]

@router.get("/presets")
async def get_preset_missions():
    return PRESET_MISSIONS

@router.post("/execute", response_model=MissionResult)
async def execute_mission(request: MissionRequest):
    try:
        result = await swarm_engine.run_mission_stream(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
