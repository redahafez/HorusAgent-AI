import sys
import os
import tempfile
import subprocess
import time
from typing import Dict, Any, Optional, Tuple

class SandboxExecutionResult:
    def __init__(
        self,
        passed: bool,
        exit_code: int,
        duration_ms: int,
        stdout: str,
        stderr: str,
        tests_passed: int = 0,
        tests_failed: int = 0,
        error_type: Optional[str] = None
    ):
        self.passed = passed
        self.exit_code = exit_code
        self.duration_ms = duration_ms
        self.stdout = stdout
        self.stderr = stderr
        self.tests_passed = tests_passed
        self.tests_failed = tests_failed
        self.error_type = error_type

    def to_dict(self) -> Dict[str, Any]:
        return {
            "passed": self.passed,
            "exit_code": self.exit_code,
            "duration_ms": self.duration_ms,
            "stdout": self.stdout[:2000],
            "stderr": self.stderr[:2000],
            "tests_passed": self.tests_passed,
            "tests_failed": self.tests_failed,
            "error_type": self.error_type
        }

class CodeSandboxRunner:
    """
    Executes Python source code and automated test assertions inside an isolated,
    timeout-bounded temporary sandbox directory. Captures execution traces, exit codes,
    and stdout/stderr for empirical verification by the Critic agent.
    """
    def __init__(self, default_timeout_sec: float = 8.0):
        self.default_timeout_sec = default_timeout_sec

    def execute_code_snippet(self, code: str, timeout_sec: Optional[float] = None) -> SandboxExecutionResult:
        timeout = timeout_sec or self.default_timeout_sec
        t0 = time.time()

        with tempfile.TemporaryDirectory(prefix="horus_sandbox_") as tmpdir:
            file_path = os.path.join(tmpdir, "sandbox_run.py")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)

            try:
                # Execute in an isolated Python subprocess with environment isolation
                env = {
                    "PYTHONPATH": tmpdir,
                    "PATH": os.environ.get("PATH", ""),
                    "PYTHONUNBUFFERED": "1"
                }

                proc = subprocess.run(
                    [sys.executable, file_path],
                    cwd=tmpdir,
                    capture_output=True,
                    text=True,
                    timeout=timeout,
                    env=env
                )
                duration_ms = int((time.time() - t0) * 1000)

                passed = (proc.returncode == 0)
                return SandboxExecutionResult(
                    passed=passed,
                    exit_code=proc.returncode,
                    duration_ms=duration_ms,
                    stdout=proc.stdout,
                    stderr=proc.stderr,
                    tests_passed=1 if passed else 0,
                    tests_failed=0 if passed else 1,
                    error_type="RUNTIME_ERROR" if not passed else None
                )
            except subprocess.TimeoutExpired:
                duration_ms = int((time.time() - t0) * 1000)
                return SandboxExecutionResult(
                    passed=False,
                    exit_code=-1,
                    duration_ms=duration_ms,
                    stdout="",
                    stderr=f"Execution timed out after {timeout} seconds (potential infinite loop or blocking I/O)",
                    tests_passed=0,
                    tests_failed=1,
                    error_type="TIMEOUT_EXPIRED"
                )
            except Exception as e:
                duration_ms = int((time.time() - t0) * 1000)
                return SandboxExecutionResult(
                    passed=False,
                    exit_code=-2,
                    duration_ms=duration_ms,
                    stdout="",
                    stderr=str(e),
                    tests_passed=0,
                    tests_failed=1,
                    error_type="EXECUTION_FAILURE"
                )

    def execute_code_with_tests(self, code: str, test_code: str, timeout_sec: Optional[float] = None) -> SandboxExecutionResult:
        timeout = timeout_sec or self.default_timeout_sec
        t0 = time.time()

        with tempfile.TemporaryDirectory(prefix="horus_test_sandbox_") as tmpdir:
            # 1. Write implementation module
            src_path = os.path.join(tmpdir, "service.py")
            with open(src_path, "w", encoding="utf-8") as f:
                f.write(code)

            # 2. Write test module
            test_path = os.path.join(tmpdir, "test_service.py")
            with open(test_path, "w", encoding="utf-8") as f:
                f.write(test_code)

            try:
                env = {
                    "PYTHONPATH": tmpdir,
                    "PATH": os.environ.get("PATH", ""),
                    "PYTHONUNBUFFERED": "1"
                }

                # Run pytest against the test module
                proc = subprocess.run(
                    [sys.executable, "-m", "pytest", test_path, "-v", "--tb=short"],
                    cwd=tmpdir,
                    capture_output=True,
                    text=True,
                    timeout=timeout,
                    env=env
                )
                duration_ms = int((time.time() - t0) * 1000)

                passed = (proc.returncode == 0)
                # Count passed/failed from pytest output
                tests_passed = proc.stdout.count("PASSED")
                tests_failed = proc.stdout.count("FAILED")

                return SandboxExecutionResult(
                    passed=passed,
                    exit_code=proc.returncode,
                    duration_ms=duration_ms,
                    stdout=proc.stdout,
                    stderr=proc.stderr,
                    tests_passed=tests_passed,
                    tests_failed=tests_failed,
                    error_type="TESTS_FAILED" if not passed else None
                )
            except subprocess.TimeoutExpired:
                duration_ms = int((time.time() - t0) * 1000)
                return SandboxExecutionResult(
                    passed=False,
                    exit_code=-1,
                    duration_ms=duration_ms,
                    stdout="",
                    stderr=f"Test runner timed out after {timeout} seconds",
                    tests_passed=0,
                    tests_failed=1,
                    error_type="TIMEOUT_EXPIRED"
                )
            except Exception as e:
                duration_ms = int((time.time() - t0) * 1000)
                return SandboxExecutionResult(
                    passed=False,
                    exit_code=-2,
                    duration_ms=duration_ms,
                    stdout="",
                    stderr=str(e),
                    tests_passed=0,
                    tests_failed=1,
                    error_type="EXECUTION_FAILURE"
                )

# Global singleton runner
sandbox_runner = CodeSandboxRunner()
