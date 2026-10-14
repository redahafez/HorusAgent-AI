from typing import List, Dict

ENTERPRISE_KNOWLEDGE_DOCS: List[Dict[str, str]] = [
    {
        "id": "kb-cloud-01",
        "title": "Zero-Trust Microservices & Mutual TLS Architecture",
        "category": "CLOUD_ARCH",
        "content": (
            "In zero-trust enterprise distributed architectures, no network segment is inherently trusted. "
            "All inter-service RPC communications require mutual TLS (mTLS) with cryptographic identity tokens (SPIFFE/SPIRE). "
            "API Gateways enforce strict ingress rate limiting, JWT token validation, and OAuth 2.0 scope checks. "
            "Database connections must utilize short-lived dynamic credentials managed by secret vaults with automated 12-hour rotation."
        )
    },
    {
        "id": "kb-cloud-02",
        "title": "High-Throughput Idempotency & Distributed Lock Patterns",
        "category": "MICROSERVICES",
        "content": (
            "To guarantee exactly-once message semantics in distributed event streams, client requests must carry an Idempotency-Key header. "
            "The backend generates a canonical SHA-256 payload hash and secures a distributed Redis lock with a 30-second TTL. "
            "If a duplicate request arrives with matching hash, the cached response is replayed immediately with an Idempotency-Replayed: true header. "
            "Conflicting payloads bearing an existing key return HTTP 409 Conflict to protect ledger data integrity."
        )
    },
    {
        "id": "kb-reg-01",
        "title": "FDA 21 CFR Part 11 & Electronic Record Data Integrity (ALCOA+)",
        "category": "CLINICAL_RAG",
        "content": (
            "FDA 21 CFR Part 11 mandates that electronic records and signatures are trustworthy, reliable, and equivalent to paper records. "
            "Core ALCOA+ principles require records to be Attributable, Legible, Contemporaneous, Original, and Accurate. "
            "Computerized systems must feature computer-generated, time-stamped audit trails that independently record the date and time "
            "of operator entries and actions that create, modify, or delete electronic records without obscuring previous data."
        )
    },
    {
        "id": "kb-reg-02",
        "title": "Cold-Chain GxP Thermal Excursion & Temperature Monitoring",
        "category": "CLINICAL_RAG",
        "content": (
            "Clinical trial biologics and mRNA vaccines require strict cold-chain compliance between 2°C and 8°C (ultra-cold below -70°C). "
            "Any thermal deviation exceeding Mean Kinetic Temperature (MKT) boundaries triggers immediate excursion alerts and quarantine. "
            "Hardware telemetry loggers must record temperature, humidity, GPS, and shock events at 15-minute intervals with cryptographically signed payloads."
        )
    },
    {
        "id": "kb-sec-01",
        "title": "Autonomous AI Swarm Security & Prompt Injection Mitigation",
        "category": "SECURITY_AUDIT",
        "content": (
            "Autonomous multi-agent swarms face unique adversarial risks including indirect prompt injection and tool execution hijacking. "
            "Defensive design mandates: 1. Strict delimiter sandboxing for untrusted data. 2. Output verification by a dedicated Critic Agent before tool execution. "
            "3. Hard limits on token budgets and iteration loops. 4. Redaction of Personally Identifiable Information (PII) before vector store embedding."
        )
    },
    {
        "id": "kb-sec-02",
        "title": "SOC 2 Type II Compliance & Continuous Automated Auditing",
        "category": "SECURITY_AUDIT",
        "content": (
            "SOC 2 compliance centers around five Trust Services Criteria: Security, Availability, Processing Integrity, Confidentiality, and Privacy. "
            "Continuous automated compliance monitors CI/CD pipelines for static analysis (SAST), container image vulnerability scanning, "
            "and real-time SIEM log aggregation. All administrative actions require multi-factor authentication (MFA) and immutable audit log exports."
        )
    }
]
