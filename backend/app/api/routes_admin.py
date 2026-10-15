from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

router = APIRouter(prefix="/admin", tags=["Organization, User & Workspace Administration"])

# -------------------------------------------------------------
# In-Memory State for Tenants, Workspaces, Roles & Members
# -------------------------------------------------------------

tenants_state: List[Dict[str, Any]] = [
    {
        "id": "org-horus-core",
        "name": "Horus Sovereign Enterprise",
        "slug": "horus-core",
        "tier": "Sovereign Air-Gap Tier",
        "region": "Global Multi-Region (Private Mesh)",
        "members_count": 5,
        "workspaces_count": 4,
        "status": "ACTIVE",
        "compliance_framework": "FDA 21 CFR Part 11 & SOC 2 Type II",
        "data_sovereignty": "Isolated Air-Gapped",
        "created_at": "2026-01-01T00:00:00Z"
    },
    {
        "id": "org-biopharma-us",
        "name": "BioPharma Health Sciences",
        "slug": "biopharma-us",
        "tier": "GxP Enterprise",
        "region": "US-East (HIPAA Encrypted)",
        "members_count": 18,
        "workspaces_count": 3,
        "status": "ACTIVE",
        "compliance_framework": "FDA 21 CFR Part 11 / Annex 11",
        "data_sovereignty": "Hybrid Sovereign Cloud",
        "created_at": "2026-02-15T10:30:00Z"
    },
    {
        "id": "org-atlaslogix-coldchain",
        "name": "AtlasLogix Cold-Chain Telemetry",
        "slug": "atlaslogix-iot",
        "tier": "IoT Enterprise",
        "region": "EU-Central (GDPR Compliant)",
        "members_count": 9,
        "workspaces_count": 2,
        "status": "ACTIVE",
        "compliance_framework": "ISO 27001 & GxP Logistics",
        "data_sovereignty": "Multi-Tenant Isolated",
        "created_at": "2026-03-20T14:15:00Z"
    }
]

workspaces_state: List[Dict[str, Any]] = [
    {
        "id": "ws-core-swarm",
        "tenant_id": "org-horus-core",
        "name": "Autonomous Core Swarm & DAG",
        "description": "Primary orchestrator, reasoning topology, and multi-agent coordination.",
        "active_agents": ["Orchestrator", "Code Architect", "Critic", "Governance"],
        "monthly_token_quota": 25000000,
        "tokens_used": 3482100,
        "members_count": 5,
        "isolation_level": "Strict Process Sandbox",
        "status": "ACTIVE"
    },
    {
        "id": "ws-rag-lab",
        "tenant_id": "org-horus-core",
        "name": "Vector RAG & Cognitive Memory Lab",
        "description": "128-dimensional dense vector embeddings, hybrid search, and semantic indexing.",
        "active_agents": ["Researcher", "Orchestrator"],
        "monthly_token_quota": 15000000,
        "tokens_used": 1945200,
        "members_count": 4,
        "isolation_level": "Memory Encrypted",
        "status": "ACTIVE"
    },
    {
        "id": "ws-devsecops",
        "tenant_id": "org-horus-core",
        "name": "DevSecOps & Microservice Synthesis",
        "description": "Autonomous code synthesis, pytest suites, and SLSA provenance generation.",
        "active_agents": ["Code Architect", "Critic"],
        "monthly_token_quota": 10000000,
        "tokens_used": 2189000,
        "members_count": 3,
        "isolation_level": "Subprocess Isolated",
        "status": "ACTIVE"
    },
    {
        "id": "ws-governance",
        "tenant_id": "org-horus-core",
        "name": "Executive Governance & Audit Trail",
        "description": "ALCOA+ 21 CFR Part 11 digital signatures, approval workflows, and immutable logs.",
        "active_agents": ["Governance Agent", "Critic"],
        "monthly_token_quota": 5000000,
        "tokens_used": 421000,
        "members_count": 5,
        "isolation_level": "Cryptographic HSM",
        "status": "ACTIVE"
    }
]

users_state: List[Dict[str, Any]] = [
    {
        "id": "usr-reda-hafez",
        "name": "Reda Hafez",
        "email": "reda.hafez@horusagent.ai",
        "avatar": "RH",
        "role": "SUPER_ADMIN",
        "role_title": "Platform Super Admin & Chief Architect",
        "is_super_admin": True,
        "status": "ACTIVE",
        "mfa_enabled": True,
        "mfa_method": "FIPS 140-2 Hardware Token / WebAuthn",
        "tenant_id": "org-horus-core",
        "tenant_name": "Horus Sovereign Enterprise",
        "workspaces": ["ws-core-swarm", "ws-rag-lab", "ws-devsecops", "ws-governance"],
        "digital_signature": "HORUS-SIG-REDA-HAFEZ-001",
        "last_active": "Active now",
        "badge_color": "from-cyan-500 via-indigo-500 to-purple-600",
        "permissions_scope": "Full Sovereign Access (*:*)",
        "created_at": "2026-01-01T00:00:00Z"
    },
    {
        "id": "usr-sarah-chen",
        "name": "Sarah Chen",
        "email": "sarah.chen@horusagent.ai",
        "avatar": "SC",
        "role": "ORG_ADMIN",
        "role_title": "Platform Operations Manager",
        "is_super_admin": False,
        "status": "ACTIVE",
        "mfa_enabled": True,
        "mfa_method": "TOTP Authenticator",
        "tenant_id": "org-horus-core",
        "tenant_name": "Horus Sovereign Enterprise",
        "workspaces": ["ws-core-swarm", "ws-governance"],
        "digital_signature": "HORUS-SIG-SARAH-CHEN-002",
        "last_active": "8m ago",
        "badge_color": "from-indigo-500 to-blue-600",
        "permissions_scope": "Tenant Admin & Approvals",
        "created_at": "2026-01-15T09:30:00Z"
    },
    {
        "id": "usr-elena-rostova",
        "name": "Dr. Elena Rostova",
        "email": "elena.rostova@horusagent.ai",
        "avatar": "ER",
        "role": "COMPLIANCE_AUDITOR",
        "role_title": "Chief Regulatory & 21 CFR Part 11 Auditor",
        "is_super_admin": False,
        "status": "ACTIVE",
        "mfa_enabled": True,
        "mfa_method": "Hardware Security Key",
        "tenant_id": "org-horus-core",
        "tenant_name": "Horus Sovereign Enterprise",
        "workspaces": ["ws-governance"],
        "digital_signature": "HORUS-SIG-ELENA-ROSTOVA-003",
        "last_active": "22m ago",
        "badge_color": "from-emerald-500 to-teal-600",
        "permissions_scope": "GxP Audit Trail & Electronic Signatures",
        "created_at": "2026-02-01T11:00:00Z"
    },
    {
        "id": "usr-marcus-brody",
        "name": "Marcus Brody",
        "email": "marcus.brody@horusagent.ai",
        "avatar": "MB",
        "role": "AGENT_ARCHITECT",
        "role_title": "Staff AI Swarm & Cloud Engineer",
        "is_super_admin": False,
        "status": "ACTIVE",
        "mfa_enabled": True,
        "mfa_method": "TOTP Authenticator",
        "tenant_id": "org-horus-core",
        "tenant_name": "Horus Sovereign Enterprise",
        "workspaces": ["ws-core-swarm", "ws-devsecops"],
        "digital_signature": "HORUS-SIG-MARCUS-BRODY-004",
        "last_active": "1h ago",
        "badge_color": "from-purple-500 to-pink-600",
        "permissions_scope": "Mission Dispatch & Code Sandbox",
        "created_at": "2026-02-10T14:20:00Z"
    },
    {
        "id": "usr-tariq-mansour",
        "name": "Tariq Al-Mansour",
        "email": "tariq.mansour@horusagent.ai",
        "avatar": "TM",
        "role": "AGENT_ARCHITECT",
        "role_title": "Senior Cognitive RAG Specialist",
        "is_super_admin": False,
        "status": "ACTIVE",
        "mfa_enabled": False,
        "mfa_method": "Password + SMS Fallback",
        "tenant_id": "org-horus-core",
        "tenant_name": "Horus Sovereign Enterprise",
        "workspaces": ["ws-rag-lab"],
        "digital_signature": "HORUS-SIG-TARIQ-MANSOUR-005",
        "last_active": "3h ago",
        "badge_color": "from-amber-500 to-orange-600",
        "permissions_scope": "Vector Store Ingestion & Model Testing",
        "created_at": "2026-03-01T16:45:00Z"
    }
]

roles_matrix: List[Dict[str, Any]] = [
    {
        "role": "SUPER_ADMIN",
        "title": "Platform Super Admin",
        "description": "Full sovereign control over tenants, circuit-breakers, model router, and governance keys.",
        "holder": "Reda Hafez",
        "permissions": {
            "swarm_dispatch": True,
            "sandbox_execution": True,
            "vector_rag_manage": True,
            "model_router_override": True,
            "sign_21cfr11_stamps": True,
            "tenant_provisioning": True,
            "user_lifecycle_manage": True,
            "view_audit_trail": True
        }
    },
    {
        "role": "ORG_ADMIN",
        "title": "Organization Administrator",
        "description": "Manages workspaces, team member invitations, and quota assignments within tenant.",
        "holder": "Sarah Chen",
        "permissions": {
            "swarm_dispatch": True,
            "sandbox_execution": True,
            "vector_rag_manage": True,
            "model_router_override": False,
            "sign_21cfr11_stamps": True,
            "tenant_provisioning": False,
            "user_lifecycle_manage": True,
            "view_audit_trail": True
        }
    },
    {
        "role": "AGENT_ARCHITECT",
        "title": "Agent & Swarm Architect",
        "description": "Authoring multi-agent missions, running isolated Python sandbox, and prompt tuning.",
        "holder": "Marcus Brody / Tariq Al-Mansour",
        "permissions": {
            "swarm_dispatch": True,
            "sandbox_execution": True,
            "vector_rag_manage": True,
            "model_router_override": False,
            "sign_21cfr11_stamps": False,
            "tenant_provisioning": False,
            "user_lifecycle_manage": False,
            "view_audit_trail": True
        }
    },
    {
        "role": "COMPLIANCE_AUDITOR",
        "title": "GxP & 21 CFR Part 11 Auditor",
        "description": "Authorized to review, stamp, and electronically sign audit trails and review RCA incident logs.",
        "holder": "Dr. Elena Rostova",
        "permissions": {
            "swarm_dispatch": False,
            "sandbox_execution": False,
            "vector_rag_manage": False,
            "model_router_override": False,
            "sign_21cfr11_stamps": True,
            "tenant_provisioning": False,
            "user_lifecycle_manage": False,
            "view_audit_trail": True
        }
    },
    {
        "role": "VIEWER",
        "title": "Observer / Auditor Guest",
        "description": "Read-only access to observability charts, telemetries, and completed deliverables.",
        "holder": "Guest Observers",
        "permissions": {
            "swarm_dispatch": False,
            "sandbox_execution": False,
            "vector_rag_manage": False,
            "model_router_override": False,
            "sign_21cfr11_stamps": False,
            "tenant_provisioning": False,
            "user_lifecycle_manage": False,
            "view_audit_trail": True
        }
    }
]

# -------------------------------------------------------------
# Request Schemas
# -------------------------------------------------------------

class CreateTenantRequest(BaseModel):
    name: str
    slug: str
    tier: Optional[str] = "Sovereign Enterprise"
    region: Optional[str] = "Global Multi-Region"
    compliance_framework: Optional[str] = "FDA 21 CFR Part 11 & SOC 2 Type II"
    data_sovereignty: Optional[str] = "Isolated Air-Gapped"

class CreateWorkspaceRequest(BaseModel):
    tenant_id: str
    name: str
    description: str
    active_agents: Optional[List[str]] = ["Orchestrator", "Code Architect", "Critic"]
    monthly_token_quota: Optional[int] = 10000000
    isolation_level: Optional[str] = "Strict Process Sandbox"

class InviteUserRequest(BaseModel):
    name: str
    email: str
    role: str = "AGENT_ARCHITECT"
    role_title: Optional[str] = "AI Software Engineer"
    tenant_id: str = "org-horus-core"
    workspaces: Optional[List[str]] = ["ws-core-swarm"]

class UpdateUserStatusRequest(BaseModel):
    status: str = Field(..., description="'ACTIVE' or 'SUSPENDED'")

class UpdateUserRoleRequest(BaseModel):
    role: str
    role_title: Optional[str] = None


# -------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------

@router.get("/overview")
async def get_admin_overview():
    """
    Returns complete governance state: Tenants, Workspaces, Users (highlighting Super Admin Reda Hafez),
    and Roles/RBAC Permission Matrix.
    """
    return {
        "platform": "HorusAgent AI",
        "super_admin": {
            "name": "Reda Hafez",
            "title": "Platform Super Admin & Chief Architect",
            "email": "reda.hafez@horusagent.ai",
            "avatar": "RH",
            "digital_signature": "HORUS-SIG-REDA-HAFEZ-001",
            "mfa": "Hardware Token (FIPS 140-2)",
            "authority": "Universal Sovereign Root (*:*)"
        },
        "stats": {
            "total_tenants": len(tenants_state),
            "total_workspaces": len(workspaces_state),
            "total_users": len(users_state),
            "active_mfa_pct": 80.0,
            "governance_standard": "FDA 21 CFR Part 11 & SOC 2 Type II"
        },
        "tenants": tenants_state,
        "workspaces": workspaces_state,
        "users": users_state,
        "roles_matrix": roles_matrix
    }

@router.post("/tenants")
async def create_tenant(req: CreateTenantRequest):
    new_tenant = {
        "id": f"org-{req.slug.lower()}",
        "name": req.name,
        "slug": req.slug.lower(),
        "tier": req.tier,
        "region": req.region,
        "members_count": 1,
        "workspaces_count": 0,
        "status": "ACTIVE",
        "compliance_framework": req.compliance_framework,
        "data_sovereignty": req.data_sovereignty,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    tenants_state.append(new_tenant)
    return {"status": "SUCCESS", "tenant": new_tenant}

@router.post("/workspaces")
async def create_workspace(req: CreateWorkspaceRequest):
    new_ws = {
        "id": f"ws-{len(workspaces_state) + 1}",
        "tenant_id": req.tenant_id,
        "name": req.name,
        "description": req.description,
        "active_agents": req.active_agents,
        "monthly_token_quota": req.monthly_token_quota,
        "tokens_used": 0,
        "members_count": 1,
        "isolation_level": req.isolation_level,
        "status": "ACTIVE"
    }
    workspaces_state.append(new_ws)
    # Increment tenant workspace count
    for t in tenants_state:
        if t["id"] == req.tenant_id:
            t["workspaces_count"] += 1
    return {"status": "SUCCESS", "workspace": new_ws}

@router.post("/users")
async def invite_user(req: InviteUserRequest):
    initials = "".join([part[0].upper() for part in req.name.split() if part])[:2] or "US"
    tenant_name = next((t["name"] for t in tenants_state if t["id"] == req.tenant_id), "Horus Sovereign Enterprise")
    
    new_user = {
        "id": f"usr-{req.email.split('@')[0].lower()}",
        "name": req.name,
        "email": req.email,
        "avatar": initials,
        "role": req.role,
        "role_title": req.role_title or req.role.replace("_", " ").title(),
        "is_super_admin": False,
        "status": "ACTIVE",
        "mfa_enabled": False,
        "mfa_method": "Pending Setup",
        "tenant_id": req.tenant_id,
        "tenant_name": tenant_name,
        "workspaces": req.workspaces,
        "digital_signature": f"HORUS-SIG-{initials}-{len(users_state) + 1:03d}",
        "last_active": "Never (Invited)",
        "badge_color": "from-slate-600 to-slate-800",
        "permissions_scope": f"Role Assigned: {req.role}",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    users_state.append(new_user)
    # Increment tenant member count
    for t in tenants_state:
        if t["id"] == req.tenant_id:
            t["members_count"] += 1
    return {"status": "SUCCESS", "user": new_user}

@router.patch("/users/{user_id}/status")
async def toggle_user_status(user_id: str, req: UpdateUserStatusRequest):
    if user_id == "usr-reda-hafez":
        raise HTTPException(status_code=400, detail="Cannot suspend Platform Super Admin Reda Hafez (Root Protection)")
    for u in users_state:
        if u["id"] == user_id:
            u["status"] = req.status
            return {"status": "SUCCESS", "user": u}
    raise HTTPException(status_code=404, detail=f"User {user_id} not found")

@router.patch("/users/{user_id}/role")
async def update_user_role(user_id: str, req: UpdateUserRoleRequest):
    if user_id == "usr-reda-hafez":
        raise HTTPException(status_code=400, detail="Cannot alter Platform Super Admin Reda Hafez role (Root Protection)")
    for u in users_state:
        if u["id"] == user_id:
            u["role"] = req.role
            if req.role_title:
                u["role_title"] = req.role_title
            return {"status": "SUCCESS", "user": u}
    raise HTTPException(status_code=404, detail=f"User {user_id} not found")
