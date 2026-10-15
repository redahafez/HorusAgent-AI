import os
import httpx
from typing import Dict, Any, List, Optional

DEFAULT_API_URL = os.getenv("HORUS_API_URL", "http://localhost:8888")

class HorusClient:
    def __init__(self, base_url: str = DEFAULT_API_URL):
        self.base_url = base_url.rstrip("/")
        self.timeout = 120.0

    def get_health(self) -> Dict[str, Any]:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(f"{self.base_url}/health/ready")
            resp.raise_for_status()
            return resp.json()

    def get_metrics(self) -> Dict[str, Any]:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(f"{self.base_url}/api/v1/metrics")
            resp.raise_for_status()
            return resp.json()

    def execute_mission(self, objective: str, domain: str = "CLOUD_ARCH") -> Dict[str, Any]:
        payload = {
            "objective": objective,
            "domain": domain,
            "parameters": {"temperature": 0.2, "max_tokens": 4096}
        }
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.post(f"{self.base_url}/api/v1/missions/execute", json=payload)
            resp.raise_for_status()
            return resp.json()

    def export_project_zip(
        self,
        deliverable: str,
        output_file: str,
        objective: str = "CLI Swarm Synthesis",
        domain: str = "CLOUD_ARCH",
        critic_critique: str = "",
        citations: Optional[List[Dict[str, Any]]] = None,
        verification_score: float = 0.98
    ) -> str:
        payload = {
            "deliverable": deliverable,
            "objective": objective,
            "domain": domain,
            "critic_critique": critic_critique,
            "citations": citations or [],
            "verification_score": verification_score
        }
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(f"{self.base_url}/api/v1/missions/export-zip", json=payload)
            resp.raise_for_status()
            
            with open(output_file, "wb") as f:
                f.write(resp.content)
            
            return os.path.abspath(output_file)

    def search_vector_rag(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        payload = {"query": query, "top_k": top_k}
        with httpx.Client(timeout=10.0) as client:
            resp = client.post(f"{self.base_url}/api/v1/rag/search", json=payload)
            resp.raise_for_status()
            return resp.json()

    def ingest_document(self, title: str, content: str, category: str = "CLOUD_ARCH") -> Dict[str, Any]:
        payload = {"title": title, "content": content, "category": category}
        with httpx.Client(timeout=10.0) as client:
            resp = client.post(f"{self.base_url}/api/v1/rag/documents", json=payload)
            resp.raise_for_status()
            return resp.json()

    def get_providers(self) -> Dict[str, Any]:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(f"{self.base_url}/api/v1/providers")
            resp.raise_for_status()
            return resp.json()

    def save_provider(self, provider: str, api_key: str, model: str, set_as_active: bool = False) -> Dict[str, Any]:
        payload = {
            "provider": provider,
            "api_key": api_key,
            "model": model,
            "set_as_active": set_as_active
        }
        with httpx.Client(timeout=10.0) as client:
            resp = client.post(f"{self.base_url}/api/v1/providers/save", json=payload)
            resp.raise_for_status()
            return resp.json()

    def test_provider_ping(self, provider: str, api_key: Optional[str] = None, model: Optional[str] = None) -> Dict[str, Any]:
        payload = {
            "provider": provider,
            "api_key": api_key,
            "model": model
        }
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(f"{self.base_url}/api/v1/providers/test", json=payload)
            resp.raise_for_status()
            return resp.json()

    def get_analytics(self) -> Dict[str, Any]:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(f"{self.base_url}/api/v1/providers/analytics")
            resp.raise_for_status()
            return resp.json()

    def get_command_center(self) -> Dict[str, Any]:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{self.base_url}/api/v1/observability/command-center")
            resp.raise_for_status()
            return resp.json()

    def update_approval(self, item_id: str, action: str, reviewer: str = "CLI Operator") -> Dict[str, Any]:
        payload = {"item_id": item_id, "action": action, "reviewer": reviewer}
        with httpx.Client(timeout=10.0) as client:
            resp = client.post(f"{self.base_url}/api/v1/observability/approval", json=payload)
            resp.raise_for_status()
            return resp.json()

    def get_rag_telemetry(self) -> Dict[str, Any]:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{self.base_url}/api/v1/observability/rag-telemetry")
            resp.raise_for_status()
            return resp.json()

    def get_router_overview(self) -> Dict[str, Any]:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{self.base_url}/api/v1/providers/router-overview")
            resp.raise_for_status()
            return resp.json()

    def get_admin_overview(self) -> Dict[str, Any]:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{self.base_url}/api/v1/admin/overview")
            resp.raise_for_status()
            return resp.json()

