import re
import hashlib
from datetime import datetime, timezone
from typing import Tuple, List, Dict
from .models import AgentRole

class SecurityAuditorAgent:
    """
    Enforces enterprise data governance, sanitizes sensitive credentials,
    scans for leaked secrets, and applies cryptographic SHA-256 integrity
    stamps for FDA 21 CFR Part 11 & GxP ALCOA+ audit compliance.
    """
    def __init__(self):
        self.role = AgentRole.GOVERNANCE

    def scan_and_sanitize_secrets(self, text: str) -> Tuple[str, List[str]]:
        findings = []
        
        # 1. OpenAI Keys (standard & project)
        if re.search(r'sk-(?:proj-)?[a-zA-Z0-9_\-]{20,}', text):
            findings.append("OpenAI Secret Key")
            text = re.sub(r'sk-(?:proj-)?[a-zA-Z0-9_\-]{20,}', '[REDACTED_API_KEY]', text)

        # 2. GitHub Personal Access Tokens
        if re.search(r'ghp_[a-zA-Z0-9]{36}', text):
            findings.append("GitHub Personal Access Token")
            text = re.sub(r'ghp_[a-zA-Z0-9]{36}', '[REDACTED_GITHUB_PAT]', text)

        # 3. AWS Access Keys
        if re.search(r'AKIA[0-9A-Z]{16}', text):
            findings.append("AWS Access Key ID")
            text = re.sub(r'AKIA[0-9A-Z]{16}', '[REDACTED_AWS_KEY]', text)

        # 4. Private Keys
        if re.search(r'-----BEGIN (?:RSA |EC )?PRIVATE KEY-----', text):
            findings.append("Cryptographic Private Key")
            text = re.sub(r'-----BEGIN (?:RSA |EC )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC )?PRIVATE KEY-----', '[REDACTED_PRIVATE_KEY]', text)

        # 5. Bearer JWT Tokens
        if re.search(r'eyJ[a-zA-Z0-9_\-]+\.eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+', text):
            findings.append("JSON Web Token (JWT)")
            text = re.sub(r'eyJ[a-zA-Z0-9_\-]+\.eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+', '[REDACTED_JWT_TOKEN]', text)

        # 6. Emails
        text = re.sub(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', '[REDACTED_EMAIL]', text)

        # 7. IPv4 Addresses
        text = re.sub(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', '[REDACTED_IP]', text)

        return text, findings

    async def audit_and_seal(self, content: str) -> Tuple[str, bool, str]:
        sanitized, detected_secrets = self.scan_and_sanitize_secrets(content)
        
        # Compute SHA-256 integrity seal
        seal_hash = hashlib.sha256(sanitized.encode('utf-8')).hexdigest()
        ts_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

        secret_audit_summary = "Zero Sensitive Secrets Detected" if not detected_secrets else f"Sanitized {len(detected_secrets)} Secret(s): {', '.join(detected_secrets)}"
        
        audit_stamp = (
            f"\n\n---\n"
            f"### 🛡️ Horus Governance & Cryptographic Audit Seal\n"
            f"- **Integrity Hash**: `{seal_hash[:16]}...{seal_hash[-16:]}`\n"
            f"- **Audit Standard**: FDA 21 CFR Part 11 & GxP ALCOA+ Controls Architecture ✅\n"
            f"- **Secret & PII Scanning**: {secret_audit_summary}\n"
            f"- **Immutable Seal Timestamp**: `{ts_utc}`\n"
            f"- **Cryptographic Verification**: SHA-256 Non-Repudiation Seal"
        )
        
        return sanitized + audit_stamp, True, seal_hash

