from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class AgentRole(str, Enum):
    ORCHESTRATOR = "ORCHESTRATOR"     # Master Planner & DAG Coordinator
    RESEARCHER = "RESEARCHER"         # Vector RAG & Knowledge Retrieval
    ARCHITECT = "ARCHITECT"           # Code, System & Solution Synthesis
    CRITIC = "CRITIC"                 # Anti-Hallucination & Quality Verification
    GOVERNANCE = "GOVERNANCE"         # Compliance, PII Sanitizer & Policy Guard

class AgentState(str, Enum):
    IDLE = "IDLE"
    PLANNING = "PLANNING"
    THINKING = "THINKING"
    EXECUTING = "EXECUTING"
    REFLECTING = "REFLECTING"
    VERIFIED = "VERIFIED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class DAGNode(BaseModel):
    id: str
    name: str
    role: AgentRole
    description: str
    dependencies: List[str] = Field(default_factory=list)
    state: AgentState = AgentState.IDLE
    output: Optional[str] = None
    confidence: float = 0.0
    latency_ms: int = 0
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class KnowledgeCitation(BaseModel):
    chunk_id: str
    title: str
    category: str
    similarity: float
    snippet: str

class StreamEventType(str, Enum):
    MISSION_STARTED = "MISSION_STARTED"
    DAG_INITIALIZED = "DAG_INITIALIZED"
    AGENT_STATE_CHANGED = "AGENT_STATE_CHANGED"
    TOKEN_STREAM = "TOKEN_STREAM"
    CITATION_RETRIEVED = "CITATION_RETRIEVED"
    CRITIC_VERIFICATION = "CRITIC_VERIFICATION"
    GOVERNANCE_AUDIT = "GOVERNANCE_AUDIT"
    MISSION_COMPLETED = "MISSION_COMPLETED"
    ERROR = "ERROR"

class StreamEvent(BaseModel):
    event_type: StreamEventType
    mission_id: str
    agent: Optional[AgentRole] = None
    node_id: Optional[str] = None
    data: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=utc_now)

class MissionRequest(BaseModel):
    objective: str
    domain: str = "CLOUD_ARCH" # CLOUD_ARCH | CLINICAL_RAG | MICROSERVICES | SECURITY_AUDIT
    use_rag: bool = True
    strict_verification: bool = True
    session_id: Optional[str] = None

class MissionResult(BaseModel):
    mission_id: str
    objective: str
    domain: str
    status: str
    dag_nodes: List[DAGNode]
    final_output: str
    citations: List[KnowledgeCitation] = Field(default_factory=list)
    total_tokens: int
    total_latency_ms: int
    verification_score: float # 0.0 - 100.0%
    compliance_passed: bool
    created_at: datetime = Field(default_factory=utc_now)
