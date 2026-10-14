from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from pydantic import BaseModel

from ..providers.manager import (
    provider_manager, LLMProviderType, Hyperparameters
)

router = APIRouter(prefix="/providers", tags=["AI Providers & Keys"])

class SaveProviderRequest(BaseModel):
    provider: LLMProviderType
    api_key: Optional[str] = None
    selected_model: Optional[str] = None
    set_as_active: Optional[bool] = False

class TestProviderRequest(BaseModel):
    provider: LLMProviderType
    api_key: Optional[str] = None
    model: Optional[str] = None

class SaveHyperparametersRequest(BaseModel):
    temperature: float = 0.2
    top_p: float = 0.9
    max_tokens: int = 4096
    anti_hallucination_level: str = "FDA_STRICT"
    stream_chunk_delay_ms: int = 40

class RoutingMatrixUpdateRequest(BaseModel):
    role: str
    provider: LLMProviderType
    model: str

class PresetApplyRequest(BaseModel):
    preset_name: str # GROQ_LIGHTNING | DEEP_ARCHITECTURE | SOVEREIGN_AIRGAP | COST_OPTIMIZED

@router.get("")
async def get_providers_overview():
    """
    Returns the real-time configuration of all LLM providers,
    including masked keys, active provider, models, routing rules, and metrics.
    """
    return {
        "providers": provider_manager.get_providers_state(),
        "active_provider": provider_manager.global_active_provider,
        "routing_matrix": provider_manager.routing_matrix,
        "hyperparameters": provider_manager.hyperparameters,
        "analytics": provider_manager.get_analytics()
    }

@router.post("/save")
async def save_provider_config(req: SaveProviderRequest):
    """
    Saves an API key and optional active model selection.
    """
    try:
        if req.api_key is not None:
            provider_manager.update_key(req.provider, req.api_key)
        
        if req.selected_model:
            provider_manager.selected_models[req.provider] = req.selected_model
            
        if req.set_as_active:
            provider_manager.set_active_provider(req.provider, req.selected_model)
            
        return {
            "success": True,
            "message": f"{req.provider.value} settings saved successfully",
            "active_provider": provider_manager.global_active_provider,
            "providers": provider_manager.get_providers_state()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/test")
async def test_provider_connection(req: TestProviderRequest):
    """
    Executes live network ping to verify API key validity and measure response latency.
    """
    result = await provider_manager.test_connection(req.provider, req.api_key, req.model)
    return result

@router.post("/hyperparameters")
async def save_hyperparameters(req: SaveHyperparametersRequest):
    """
    Updates global AI execution parameters (temperature, token limits, strictness).
    """
    provider_manager.hyperparameters.temperature = req.temperature
    provider_manager.hyperparameters.top_p = req.top_p
    provider_manager.hyperparameters.max_tokens = req.max_tokens
    provider_manager.hyperparameters.anti_hallucination_level = req.anti_hallucination_level
    provider_manager.hyperparameters.stream_chunk_delay_ms = req.stream_chunk_delay_ms
    return {"success": True, "hyperparameters": provider_manager.hyperparameters}

@router.post("/routing")
async def update_agent_routing(req: RoutingMatrixUpdateRequest):
    """
    Customizes which provider and model powers a specific agent role in the swarm.
    """
    if req.role not in provider_manager.routing_matrix:
        raise HTTPException(status_code=404, detail=f"Unknown agent role {req.role}")
    
    provider_manager.routing_matrix[req.role].provider = req.provider
    provider_manager.routing_matrix[req.role].model = req.model
    return {"success": True, "routing_matrix": provider_manager.routing_matrix}

@router.post("/preset")
async def apply_preset_profile(req: PresetApplyRequest):
    """
    Applies recommended architectural configurations with one click.
    """
    p = req.preset_name.upper()
    if p == "GROQ_LIGHTNING":
        provider_manager.set_active_provider(LLMProviderType.GROQ, "llama-3.3-70b-versatile")
        provider_manager.hyperparameters.stream_chunk_delay_ms = 15
        msg = "Applied Groq Lightning Profile: Sub-150ms LPU Swarm Execution."
    elif p == "DEEP_ARCHITECTURE":
        provider_manager.set_active_provider(LLMProviderType.ANTHROPIC, "claude-3-5-sonnet-20241022")
        provider_manager.hyperparameters.temperature = 0.1
        provider_manager.hyperparameters.anti_hallucination_level = "FDA_STRICT"
        msg = "Applied Deep Architecture Profile: Claude 3.5 Sonnet & High-Precision Verification."
    elif p == "SOVEREIGN_AIRGAP":
        provider_manager.set_active_provider(LLMProviderType.HORUS_SOVEREIGN, "horus-cognitive-v2-local")
        provider_manager.hyperparameters.temperature = 0.0
        provider_manager.hyperparameters.anti_hallucination_level = "FDA_STRICT"
        msg = "Applied Sovereign Air-Gap: 100% Local Offline Swarm (Zero External Cloud Calls)."
    else: # COST_OPTIMIZED
        provider_manager.set_active_provider(LLMProviderType.OPENAI, "gpt-4o-mini")
        msg = "Applied Cost-Optimized Profile: Ultra-Low API Burn Rate."

    return {
        "success": True,
        "message": msg,
        "active_provider": provider_manager.global_active_provider,
        "hyperparameters": provider_manager.hyperparameters,
        "providers": provider_manager.get_providers_state()
    }

@router.get("/analytics")
async def get_provider_analytics():
    """
    Returns cumulative token consumption, estimated USD cost, and query counts.
    """
    return provider_manager.get_analytics()
