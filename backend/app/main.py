import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from .config import settings
from .api.routes_missions import router as missions_router
from .api.routes_rag import router as rag_router
from .api.routes_metrics import router as metrics_router
from .agents.models import MissionRequest, StreamEvent
from .agents.engine import swarm_engine

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Enterprise Autonomous Multi-Agent Orchestration & Real-Time Vector RAG Platform",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# Enable permissive CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST endpoints
app.include_router(missions_router, prefix="/api/v1")
app.include_router(rag_router, prefix="/api/v1")
app.include_router(metrics_router, prefix="/api/v1")

@app.get("/health/live")
async def health_live():
    return {"status": "LIVE", "platform": "HorusAgent-AI"}

@app.get("/health/ready")
async def health_ready():
    return {
        "status": "READY",
        "swarm_status": "ONLINE",
        "vector_store": "INITIALIZED"
    }

@app.websocket("/ws/agent-stream")
async def websocket_agent_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            raw_data = await websocket.receive_text()
            payload = json.loads(raw_data)
            
            # Construct MissionRequest
            mission_req = MissionRequest(
                objective=payload.get("objective", "Analyze enterprise system architecture"),
                domain=payload.get("domain", "CLOUD_ARCH"),
                use_rag=payload.get("use_rag", True),
                strict_verification=payload.get("strict_verification", True)
            )

            # Define real-time event broadcaster
            async def broadcast_stream_event(evt: StreamEvent):
                try:
                    await websocket.send_text(evt.model_dump_json())
                except Exception:
                    pass

            # Execute multi-agent swarm with live streaming
            await swarm_engine.run_mission_stream(mission_req, event_callback=broadcast_stream_event)

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_text(json.dumps({"event_type": "ERROR", "data": {"message": str(e)}}))
        except Exception:
            pass
