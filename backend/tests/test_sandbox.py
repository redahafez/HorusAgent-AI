import pytest
from app.sandbox.runner import sandbox_runner
from app.agents.store import mission_store
from app.agents.models import MissionResult, DAGNode, AgentRole, AgentState

def test_sandbox_valid_code_execution():
    code = """
import math
def compute(x):
    return math.sqrt(x)

result = compute(144)
assert result == 12.0
print(f"Computed: {result}")
"""
    res = sandbox_runner.execute_code_snippet(code)
    assert res.passed is True
    assert res.exit_code == 0
    assert "Computed: 12.0" in res.stdout
    assert res.duration_ms >= 0

def test_sandbox_failing_code_execution():
    code = """
def broken():
    raise ValueError("Simulation of deliberate runtime failure")

broken()
"""
    res = sandbox_runner.execute_code_snippet(code)
    assert res.passed is False
    assert res.exit_code != 0
    assert "ValueError" in res.stderr
    assert res.error_type == "RUNTIME_ERROR"

def test_sandbox_timeout_safety():
    # Attempt infinite loop
    code = """
import time
while True:
    time.sleep(0.1)
"""
    # 0.5s timeout for fast test
    res = sandbox_runner.execute_code_snippet(code, timeout_sec=0.5)
    assert res.passed is False
    assert res.error_type == "TIMEOUT_EXPIRED"
    assert "timed out" in res.stderr

def test_sandbox_pytest_runner():
    code = """
def add(a, b):
    return a + b
"""
    test_code = """
import service

def test_add():
    assert service.add(2, 3) == 5
"""
    res = sandbox_runner.execute_code_with_tests(code, test_code)
    assert res.passed is True
    assert res.tests_passed >= 1
    assert res.tests_failed == 0

def test_mission_store_persistence():
    dummy = MissionResult(
        mission_id="msn-test-sandbox-001",
        objective="Verify sandbox durability",
        domain="SECURITY_AUDIT",
        status="SUCCESS",
        dag_nodes=[
            DAGNode(id="n1", name="Research", role=AgentRole.RESEARCHER, description="test", state=AgentState.COMPLETED)
        ],
        final_output="Output",
        total_tokens=100,
        total_latency_ms=250,
        verification_score=98.5,
        compliance_passed=True
    )
    mission_store.save_mission(dummy)
    retrieved = mission_store.get_mission("msn-test-sandbox-001")
    assert retrieved is not None
    assert retrieved.objective == "Verify sandbox durability"
    
    listing = mission_store.list_missions()
    assert any(m["mission_id"] == "msn-test-sandbox-001" for m in listing)
