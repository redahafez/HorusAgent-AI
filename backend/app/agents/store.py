from typing import Dict, List, Optional, Any
from .models import MissionResult
import threading

class MissionStateStore:
    """
    Thread-safe repository for mission executions, tracking durable DAG states,
    execution traces, AST verifications, and sandbox outcomes.
    """
    def __init__(self):
        self._lock = threading.Lock()
        self._missions: Dict[str, MissionResult] = {}
        self._mission_order: List[str] = []

    def save_mission(self, result: MissionResult):
        with self._lock:
            self._missions[result.mission_id] = result
            if result.mission_id not in self._mission_order:
                self._mission_order.insert(0, result.mission_id)

    def get_mission(self, mission_id: str) -> Optional[MissionResult]:
        with self._lock:
            return self._missions.get(mission_id)

    def list_missions(self, limit: int = 20) -> List[Dict[str, Any]]:
        with self._lock:
            results = []
            for mid in self._mission_order[:limit]:
                m = self._missions[mid]
                results.append({
                    "mission_id": m.mission_id,
                    "objective": m.objective,
                    "domain": m.domain,
                    "status": m.status,
                    "verification_score": m.verification_score,
                    "total_tokens": m.total_tokens,
                    "total_latency_ms": m.total_latency_ms,
                    "created_at": m.created_at.isoformat(),
                    "sandbox_passed": m.sandbox_report.get("passed", False) if m.sandbox_report else None,
                    "trace_steps_count": len(m.execution_trace)
                })
            return results

    def count(self) -> int:
        with self._lock:
            return len(self._missions)

mission_store = MissionStateStore()
