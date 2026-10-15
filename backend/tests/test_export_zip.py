import pytest
import io
import zipfile
import json
import httpx
from httpx import ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_export_mission_project_bundle_zip():
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "objective": "Design an enterprise zero-trust microservices mesh with mTLS",
            "domain": "CLOUD_ARCH",
            "deliverable": """# System Blueprint
This document describes the zero-trust ingress mesh.

```python
import os
from fastapi import FastAPI

app = FastAPI(title="ZeroTrustMesh")

@app.get("/health")
def health():
    return {"status": "ok", "mesh": "active"}
```
""",
            "critic_critique": "Verified 100% compliant with zero hallucination.",
            "citations": [
                {
                    "chunk_id": "chunk-1",
                    "title": "Zero-Trust Mesh Best Practices",
                    "category": "CLOUD_ARCH",
                    "similarity": 0.94
                }
            ],
            "verification_score": 0.98,
            "execution_time_ms": 1150
        }

        response = await client.post("/api/v1/missions/export-zip", json=payload)
        assert response.status_code == 200
        assert "application/zip" in response.headers.get("content-type", "")
        assert "Content-Disposition" in response.headers
        assert "horus-cloud_arch-project.zip" in response.headers["Content-Disposition"]

        # Parse ZIP from bytes
        zip_bytes = io.BytesIO(response.content)
        with zipfile.ZipFile(zip_bytes, "r") as zf:
            file_list = zf.namelist()
            assert "README.md" in file_list
            assert "src/architecture.md" in file_list
            assert "src/service.py" in file_list
            assert "docs/CRITIC_AUDIT.md" in file_list
            assert "docs/VECTOR_CITATIONS.json" in file_list
            assert "docs/FDA_GOVERNANCE_SEAL.json" in file_list
            assert "Dockerfile" in file_list
            assert "docker-compose.yml" in file_list
            assert ".env.example" in file_list
            assert "requirements.txt" in file_list
            assert "tests/test_service.py" in file_list
            assert "sbom.json" in file_list
            assert "CHECKSUMS.sha256" in file_list
            assert "checksums.txt.sig" in file_list
            assert "checksums.txt.pem" in file_list

            # Verify runnable test code in ZIP bundle
            test_file_content = zf.read("tests/test_service.py").decode("utf-8")
            assert "test_seal_integrity" in test_file_content
            service_code = zf.read("src/service.py").decode("utf-8")
            assert "ZeroTrustMesh" in service_code

            # Verify CycloneDX SBOM
            sbom = json.loads(zf.read("sbom.json").decode("utf-8"))
            assert sbom["bomFormat"] == "CycloneDX"
            assert len(sbom["components"]) >= 5

            # Verify CHECKSUMS.sha256 manifest
            checksums = zf.read("CHECKSUMS.sha256").decode("utf-8")
            assert "src/service.py" in checksums
            assert "tests/test_service.py" in checksums

            # Verify FDA Governance Seal
            seal_data = json.loads(zf.read("docs/FDA_GOVERNANCE_SEAL.json").decode("utf-8"))
            assert seal_data["platform"] == "HorusAgent-AI"
            assert seal_data["pii_sanitization"] == "PASSED (Zero Secrets Detected)"
            assert "sha256_deliverable_seal" in seal_data
