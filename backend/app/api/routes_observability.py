from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

router = APIRouter(prefix="/observability", tags=["Observability & Command Center"])

# -------------------------------------------------------------
# In-memory State for Command Center Approvals & Telemetry
# -------------------------------------------------------------

approval_queue_state: List[Dict[str, Any]] = [
    {
        "id": "appr-1",
        "title": "Contract Review",
        "subtitle": "Vendor Agreement - $120,000",
        "status": "Needs review",
        "reviewer": "Sarah Chen",
        "category": "legal",
        "amount": 120000.0,
        "avatar": "👩‍💼",
        "timestamp": "10m ago"
    },
    {
        "id": "appr-2",
        "title": "Invoice Agent",
        "subtitle": "INV-8732 - $8,430.50",
        "status": "Approved",
        "reviewer": "Alex R.",
        "category": "finance",
        "amount": 8430.50,
        "avatar": "👨‍💻",
        "timestamp": "25m ago"
    },
    {
        "id": "appr-3",
        "title": "Support Copilot",
        "subtitle": "Policy Update - v2.4",
        "status": "Escalated",
        "reviewer": "System Governance",
        "category": "governance",
        "amount": 0.0,
        "avatar": "👩‍🔬",
        "timestamp": "1h ago"
    }
]

class ApprovalActionRequest(BaseModel):
    item_id: str
    action: str = Field(..., description="'Approved', 'Needs review', or 'Escalated'")
    reviewer: Optional[str] = "Sarah Chen (Platform Admin)"


@router.get("/command-center")
async def get_command_center_overview():
    """
    Returns AI Workflow Command Center metrics, routing map, approval queue,
    cost pulse, agent health, and system alerts (AetherOps Reference).
    """
    return {
        "title": "AI Workflow Command Center",
        "subtitle": "Monitor routing, quality, approvals, cost, and agent health in one place.",
        "kpis": {
            "monthly_spend": 48320.0,
            "monthly_spend_trend": "+12.4% vs last month",
            "workflow_health_pct": 98.6,
            "workflow_health_trend": "+2.1% vs last week",
            "approval_rate_pct": 94.0,
            "approval_rate_trend": "+3.4% vs last week",
            "active_agents": 18,
            "active_agents_trend": "+2 vs last week"
        },
        "workflow_routing_map": {
            "stages": ["Intake", "Classify", "Review", "Fallback", "Deliver"],
            "primary_path_pct": 68,
            "secondary_path_pct": 22,
            "fallback_path_pct": 10,
            "flow_rates": {
                "intake_to_classify": {"primary": 68, "secondary": 22, "fallback": 10},
                "classify_to_review": {"approved": 72, "diverted": 18, "unresolved": 10},
                "review_to_deliver": {"verified": 91, "fallback_trigger": 46, "unmatched": 63}
            }
        },
        "approval_queue": approval_queue_state,
        "cost_pulse": {
            "total_spend": 48320.0,
            "trend": "+12.4% vs last month",
            "highlight_date": "May 24",
            "highlight_amount": 2840.0,
            "time_series": [
                {"date": "May 1", "spend": 1200},
                {"date": "May 5", "spend": 1450},
                {"date": "May 8", "spend": 1820},
                {"date": "May 12", "spend": 1690},
                {"date": "May 15", "spend": 2100},
                {"date": "May 19", "spend": 2350},
                {"date": "May 22", "spend": 2480},
                {"date": "May 24", "spend": 2840, "spike": True},
                {"date": "May 26", "spend": 2200},
                {"date": "May 29", "spend": 3100}
            ]
        },
        "agent_health": [
            {"name": "Support Copilot", "version": "v2.4.1", "uptime_pct": 98.2, "status": "Healthy", "sparkline": [96, 97, 98, 97, 98.2]},
            {"name": "Doc Agent", "version": "v1.8.3", "uptime_pct": 97.1, "status": "Healthy", "sparkline": [95, 96, 96.5, 97, 97.1]},
            {"name": "Policy Agent", "version": "v1.6.2", "uptime_pct": 99.0, "status": "Healthy", "sparkline": [98, 98.5, 99, 98.9, 99.0]},
            {"name": "Refactor Agent", "version": "v3.1.0", "uptime_pct": 99.4, "status": "Healthy", "sparkline": [97, 98, 98.5, 99, 99.4]}
        ],
        "system_alerts": [
            {
                "id": "alert-1",
                "title": "High cost spike detected",
                "subtitle": "Invoice Agent · May 24, 2:14 PM",
                "severity": "warning",
                "action": "Review"
            },
            {
                "id": "alert-2",
                "title": "Fallback volume increased",
                "subtitle": "22% higher than usual threshold",
                "severity": "info",
                "action": "Review"
            }
        ]
    }


@router.post("/approval")
async def update_approval_status(req: ApprovalActionRequest):
    """
    Updates the human-in-the-loop approval status for an item in the queue.
    """
    for item in approval_queue_state:
        if item["id"] == req.item_id:
            item["status"] = req.action
            item["reviewer"] = req.reviewer
            item["timestamp"] = "Just now"
            return {
                "success": True,
                "message": f"Item {req.item_id} status updated to {req.action}",
                "item": item
            }
    raise HTTPException(status_code=404, detail=f"Approval item {req.item_id} not found")


@router.get("/rag-telemetry")
async def get_rag_observability_telemetry():
    """
    Returns end-to-end RAG Observability & Operations telemetry (RAG Dashboard Reference).
    """
    return {
        "title": "RAG OBSERVABILITY & OPERATIONS",
        "subtitle": "Operational telemetry, ingestion visibility, semantic drift monitoring, and governance workflows for AI-enabled systems.",
        "kpis": {
            "total_queries": 64982,
            "total_queries_trend": "+18.6%",
            "answer_success_rate": 92.7,
            "answer_success_trend": "+4.3%",
            "avg_latency_s": 1.24,
            "avg_latency_trend": "-12.7%",
            "tokens_generated": "2.1M",
            "tokens_generated_trend": "+16.8%",
            "cost_usd": 342.21,
            "cost_usd_trend": "-8.4%"
        },
        "pipeline_overview": [
            {"stage": "Ingestion", "status": "Healthy", "icon": "Database"},
            {"stage": "Indexing", "status": "Healthy", "icon": "Layers"},
            {"stage": "Retrieval", "status": "Healthy", "icon": "Search"},
            {"stage": "Generation", "status": "Healthy", "icon": "Cpu"},
            {"stage": "Evaluation", "status": "Warning", "icon": "CheckSquare"}
        ],
        "query_volume_time_series": [
            {"time": "00:00", "queries": 1100},
            {"time": "04:00", "queries": 850},
            {"time": "08:00", "queries": 2800},
            {"time": "12:00", "queries": 3950},
            {"time": "16:00", "queries": 3400},
            {"time": "20:00", "queries": 2900},
            {"time": "24:00", "queries": 1650}
        ],
        "top_data_sources": [
            {"name": "Confluence", "documents": 128721, "color": "#38bdf8", "pct": 85},
            {"name": "SharePoint", "documents": 96432, "color": "#818cf8", "pct": 65},
            {"name": "Google Drive", "documents": 72158, "color": "#fbbf24", "pct": 50},
            {"name": "Notion", "documents": 41556, "color": "#34d399", "pct": 32},
            {"name": "Web Crawler", "documents": 31204, "color": "#f472b6", "pct": 24}
        ],
        "retrieval_quality": {
            "metric": "nDCG@10",
            "score": 0.78,
            "trend": "+6.1%",
            "history": [0.68, 0.71, 0.70, 0.74, 0.75, 0.73, 0.78]
        },
        "semantic_drift": {
            "drift_score": 0.28,
            "trend": "-9.3%",
            "threshold": 0.50,
            "status": "Stable",
            "history": [0.35, 0.33, 0.31, 0.32, 0.29, 0.28]
        },
        "evaluation_summary": {
            "total_evaluations": 1248,
            "breakdown": [
                {"label": "Correct", "pct": 72.1, "count": 900, "color": "#10b981"},
                {"label": "Incomplete", "pct": 15.4, "count": 192, "color": "#06b6d4"},
                {"label": "Incorrect", "pct": 9.8, "count": 122, "color": "#f59e0b"},
                {"label": "Hallucinated", "pct": 2.7, "count": 34, "color": "#a855f7"}
            ]
        },
        "knowledge_graph": {
            "node_count": 24,
            "edge_count": 38,
            "coverage_pct": 91.4,
            "nodes": [
                {"id": "n1", "label": "Enterprise Auth", "level": "High", "x": 20, "y": 30},
                {"id": "n2", "label": "ALCOA+ Integrity", "level": "High", "x": 45, "y": 20},
                {"id": "n3", "label": "Vector Embeddings", "level": "Medium", "x": 75, "y": 35},
                {"id": "n4", "label": "Zero-Trust Ingress", "level": "Medium", "x": 30, "y": 70},
                {"id": "n5", "label": "SPIRE mTLS", "level": "Low", "x": 60, "y": 80},
                {"id": "n6", "label": "Redis Distributed Lock", "level": "Medium", "x": 80, "y": 65}
            ],
            "links": [
                {"source": "n1", "target": "n2"},
                {"source": "n2", "target": "n3"},
                {"source": "n1", "target": "n4"},
                {"source": "n4", "target": "n5"},
                {"source": "n5", "target": "n6"},
                {"source": "n3", "target": "n6"}
            ]
        },
        "recent_alerts": [
            {
                "id": "rag-alert-1",
                "title": "Retrieval latency is above threshold",
                "timestamp": "2m ago",
                "severity": "error"
            },
            {
                "id": "rag-alert-2",
                "title": "Embedding failure rate increased",
                "timestamp": "15m ago",
                "severity": "warning"
            },
            {
                "id": "rag-alert-3",
                "title": 'Data source "Confluence" delayed',
                "timestamp": "47m ago",
                "severity": "info"
            }
        ]
    }


class FallbackSimulationRequest(BaseModel):
    initial_model: str = "gpt-4o"
    failure_mode: str = "HTTP_429_RATE_LIMIT"


class AlertResolutionRequest(BaseModel):
    alert_id: str
    action_taken: str = "SEMANTIC_CACHE_ENABLED"
    operator: Optional[str] = "Sarah Chen (Platform Admin)"


@router.post("/simulate-fallback")
async def simulate_model_failover(req: FallbackSimulationRequest):
    """
    Simulates real-time circuit-breaker failover across sequential model tiers.
    """
    return {
        "simulation_id": "sim-failover-8841",
        "initial_model": req.initial_model,
        "failure_mode": req.failure_mode,
        "circuit_broken": True,
        "failover_steps": [
            {
                "step": 1,
                "model": "GPT-4o",
                "status": "FAILED",
                "error_code": 429 if "429" in req.failure_mode else 503,
                "error_message": "Rate limit exceeded (TPM quota reached). Circuit breaker tripped.",
                "latency_ms": 118
            },
            {
                "step": 2,
                "model": "Claude 3.5 Sonnet",
                "status": "SUCCEEDED",
                "error_code": None,
                "latency_ms": 342,
                "tokens_generated": 684,
                "cost_usd": 0.00205
            }
        ],
        "total_recovery_ms": 460,
        "sla_preserved": True,
        "lost_tokens": 0,
        "verdict": "Sovereign Swarm Resilience: 100% Mission Continuity via Fallback Tier 2."
    }


@router.post("/resolve-alert")
async def resolve_system_alert(req: AlertResolutionRequest):
    """
    Applies mitigation policy or dismisses a system alert.
    """
    return {
        "success": True,
        "alert_id": req.alert_id,
        "action_taken": req.action_taken,
        "operator": req.operator,
        "resolved_at": datetime.now(timezone.utc).isoformat(),
        "mitigation_status": "ACTIVE_APPLIED",
        "message": f"Alert {req.alert_id} resolved. Policy '{req.action_taken}' enforced on agent swarm."
    }

