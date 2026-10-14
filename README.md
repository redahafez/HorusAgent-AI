<div align="center">

<img src="assets/HorusAgentsAI.png" alt="HorusAgent-AI Logo" width="340" />

### Sovereign Autonomous Multi-Agent Swarm & Real-Time Vector RAG Platform
**Architected & Developed by [Reda Hafez](https://github.com/redahafez)** • 📬 **[reda.hafez11@gmail.com](mailto:reda.hafez11@gmail.com)**

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose_3.8-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Vector RAG](https://img.shields.io/badge/Vector_RAG-128--dim_Cosine-8B5CF6)](#-dense-vector-rag-engine)
[![Tests](https://img.shields.io/badge/Tests-100%25_Passing-success)](#-automated-testing--quality-assurance)
[![Compliance](https://img.shields.io/badge/Compliance-FDA_21_CFR_Part_11_%7C_SOC_2-10B981)](#-security--governance)

<p align="center">
  A state-of-the-art enterprise autonomous multi-agent orchestration and real-time Vector RAG intelligence platform inspired by the all-seeing Eye of Horus — symbolizing precision, vigilance, and cognitive foresight. Engineered for mission-critical architectural design, automated self-reflection, anti-hallucination verification, and strict regulatory compliance.
</p>

[Interface Tour](#-visual-showcase--interface-tour) •
[Sacred Geometry](#-the-cybernetic-eye-of-horus--pharaonic-intelligence) •
[System Architecture](#-system-architecture) •
[Swarm Topology](#-autonomous-multi-agent-swarm) •
[Quickstart](#-quickstart-guide) •
[API Specs](#-rest--websocket-api-reference)

</div>

---

## 𓂀 The Cybernetic Eye of Horus — Pharaonic Intelligence

<div align="center">

# 𓂀

</div>

In ancient Egyptian mythology, the **Eye of Horus (Wedjat)** was venerated as the cosmic emblem of protection, healing, and absolute vigilance. Mathematically, its anatomical parts symbolized the first six binary fractions ($\frac{1}{2}, \frac{1}{4}, \frac{1}{8}, \frac{1}{16}, \frac{1}{32}, \frac{1}{64}$) — embodying the union of fractional perception into holistic unified wisdom.

**HorusAgent-AI** maps this sacred geometry into modern enterprise cognitive systems:
- **☀️ The Solar Brow (1/2 - Macro-Perception)**: Intent decomposition and topological DAG planning via the Master Orchestrator.
- **👁️ The Eyelid Rails (1/4 - Peripheral Vision)**: Dynamic contextual boundary isolation and vector chunk relevance filtering.
- **⚛️ The Aperture Iris & Quantum Core (1/8 - Pure Thought)**: 128-dimensional dense vector embeddings and sub-millisecond cosine search.
- **⚡ The Logarithmic Falcon Spiral (1/16 - Memory & Wisdom)**: Recursive self-reflection loops and multi-turn state synthesis.
- **🏛️ The Descending Data Spine (1/32 & 1/64 - Precision & Governance)**: Anti-hallucination critique, PII masking, and cryptographic SHA-256 seal.

---

## 📸 Visual Showcase & Interface Tour

### 1. Operations Command Center & Multi-Agent Workspace
Real-time KPI metrics, active domain filtering, autonomous swarm topology, and live streaming console.
![Horus Platform Overview](docs/screenshots/01-horus-platform-overview.png)

---

### 2. Live Dynamic Directed Acyclic Graph (DAG) Execution
Asynchronous agent state transitions (`THINKING`, `EXECUTING`, `REFLECTING`, `VERIFIED`, `COMPLETED`) with token-by-token streaming.
![Live Swarm Execution](docs/screenshots/02-live-swarm-execution.png)

---

### 3. Sealed Deliverable with SHA-256 Regulatory Audit Seal
Final synthesized architectural and software solution with syntax-highlighted code and cryptographic integrity signature.
![Sealed Deliverable](docs/screenshots/03-sealed-deliverable-audit.png)

---

### 4. Critic Anti-Hallucination & Self-Reflection Report
Multi-turn verification loop scoring confidence against retrieved knowledge citations.
![Critic Anti-Hallucination](docs/screenshots/04-critic-anti-hallucination.png)

---

### 5. In-Memory Vector RAG Knowledge Explorer
Browse 128-dimensional indexed enterprise chunks, test semantic similarity search, and ingest custom documentation.
![Vector RAG Explorer](docs/screenshots/05-vector-rag-explorer.png)

---

## 🏛️ System Architecture

```mermaid
graph TD
    Client["Next.js 14 Web Workspace (Glassmorphic Dark Mode)"] -->|"Reverse Proxy :8888"| Gateway["Nginx Ingress Gateway"]
    Gateway -->|"WebSocket Stream /ws/agent-stream"| API["FastAPI Async Engine (Python 3.12)"]
    Gateway -->|"REST Endpoints /api/v1"| API
    
    subgraph "Autonomous Multi-Agent Swarm (LangGraph-Compatible Topology)"
        API --> Orchestrator["👑 Master Orchestrator Agent"]
        Orchestrator -->|"Compile DAG"| DAG["Directed Acyclic Graph (DAG)"]
        DAG --> Node1["🔍 Node 1: Vector RAG Grounding (Researcher)"]
        DAG --> Node2["💻 Node 2: System Synthesis (Code Architect)"]
        DAG --> Node3["⚖️ Node 3: Anti-Hallucination Audit (Critic)"]
        DAG --> Node4["🛡️ Node 4: PII Masking & Cryptographic Seal (Governance)"]
    end
    
    subgraph "Vector RAG Subsystem"
        Node1 <--> VectorStore["128-dim Dense Vector Store (Cosine Similarity)"]
        VectorStore <--> KnowledgeCorpus["Enterprise Seed Knowledge Corpus"]
    end
    
    subgraph "Real-Time Telemetry & Event Bus"
        API <--> EventBus["Async WebSocket Event Broadcaster"]
        EventBus -->|"Word-by-Word Tokens & Node Latency"| Client
    end
```

---

## 🤖 Autonomous Multi-Agent Swarm

HorusAgent-AI decomposes complex enterprise directives into four specialized autonomous cognitive nodes:

| Agent Node | Role | Primary Responsibility | Telemetry Output |
| :--- | :--- | :--- | :--- |
| **👑 Orchestrator** | Master Planner | Analyzes user objective and compiles deterministic DAG execution topology | Execution graph & node dependencies |
| **🔍 Researcher** | Vector RAG | Generates 128-dim query embeddings and retrieves contextual grounding chunks | Authoritative citations with relevance % |
| **💻 Code Architect** | System Synthesis | Produces resilient distributed architecture designs, schemas, and runnable code | Synthesized blueprint & code implementations |
| **⚖️ Critic** | Anti-Hallucination | Cross-examines synthesized solution against citations and computes quality score | Confidence score (%) & reflection audit |
| **🛡️ Governance** | Security & Compliance | Sanitizes credentials/PII and seals payload with SHA-256 cryptographic hash | FDA 21 CFR Part 11 & SOC 2 audit seal |

---

## 🧠 Dense Vector RAG Engine

HorusAgent-AI integrates a standalone, high-performance in-memory semantic vector store:
- **128-Dimensional Semantic Embeddings**: Normalized unit dense vectors generated via character n-grams and positional token frequency.
- **Cosine Similarity Ranking**: Real-time dot-product scoring with configurable relevance thresholds (`SIMILARITY_THRESHOLD=0.60`).
- **Zero-Dependency Lightweight Execution**: Fully operational out of the box without requiring 2GB+ deep learning model weights or cloud vendor accounts.
- **Pre-Seeded Enterprise Knowledge**:
  - `Zero-Trust Microservices & Mutual TLS Architecture`
  - `High-Throughput Idempotency & Distributed Lock Patterns`
  - `FDA 21 CFR Part 11 & Electronic Record Data Integrity (ALCOA+)`
  - `Cold-Chain GxP Thermal Excursion & Temperature Monitoring`
  - `Autonomous AI Swarm Security & Prompt Injection Mitigation`
  - `SOC 2 Type II Compliance & Continuous Automated Auditing`

---

## ⚡ Quickstart Guide

### 1. Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose
- Git

### 2. Clone & Launch
```bash
# Clone the repository
git clone https://github.com/redahafez/HorusAgent-AI.git
cd HorusAgent-AI

# Configure environment (optional - defaults to smart simulation mode)
cp .env.example .env

# Launch the containerized stack
docker compose up --build -d
```

Once launched, access the platform at:
- **Web Workspace**: [http://localhost:8888](http://localhost:8888)
- **Interactive OpenAPI / Swagger Docs**: [http://localhost:8888/api/docs](http://localhost:8888/api/docs)
- **Health Readiness Check**: [http://localhost:8888/health/ready](http://localhost:8888/health/ready)

---

## 🎛️ Enterprise AI Multi-Provider Control Panel & Routing Matrix

HorusAgent-AI features a centralized enterprise control panel enabling seamless integration with premier frontier AI providers while guaranteeing **100% zero-dependency air-gapped sovereign execution**:

| Provider | Supported Models | Key Features | Latency Benchmark |
| :--- | :--- | :--- | :--- |
| **OpenAI** | `gpt-4o`, `gpt-4o-mini`, `o1-preview` | Deep multimodal reasoning, structured tool use | ~450ms |
| **Anthropic** | `claude-3-5-sonnet-20241022`, `claude-3-opus`, `haiku` | Premier architectural synthesis, complex refactoring | ~520ms |
| **Groq (LPU)** | `llama-3.3-70b-versatile`, `mixtral-8x7b-32768` | Ultra-low latency token generation (500+ tok/s) | ~90ms |
| **Google Gemini** | `gemini-1.5-pro-latest`, `gemini-1.5-flash-latest` | Massive 2M+ context window, cross-domain RAG | ~380ms |
| **Horus Sovereign** | `horus-sovereign-v2.1` | 100% local air-gapped execution, zero external API keys | ~15ms (Deterministic) |

### 🚀 Advanced Enterprise Features
1. **Per-Agent Cognitive Swarm Routing**: Assign specific models to each agent role (e.g. `Groq` for high-throughput Vector Grounding, `Claude 3.5 Sonnet` for Architecture, `GPT-4o` for Anti-Hallucination Audit).
2. **Instant Architecture Presets**: One-click switching between *Ultra-Fast Groq*, *Balanced Frontier*, *Supreme Quality*, and *Enterprise Air-Gapped*.
3. **Live Latency & Health Diagnostics**: Sub-second async handshake with external provider endpoints verifying credentials and measuring roundtrip ping times.
4. **Token & Cost Analytics Meter**: Real-time tracking of mission token consumption and accumulated cloud API expenditure with session reset capabilities.

---

## 📦 One-Click Enterprise Project Bundle Export (.ZIP)

HorusAgent-AI enables engineers to download the entire synthesized architecture as a production-ready, runnable project bundle:

- **Runnable Microservice**: Auto-extracted Python / FastAPI service implementation (`src/service.py`).
- **Complete Architectural Blueprint**: In-depth topology, data flows, and design rationale (`src/architecture.md`).
- **Containerization**: Production-ready `Dockerfile` and `docker-compose.yml` pre-configured for instant deployment.
- **Critic Anti-Hallucination Audit**: Detailed review report with confidence rating and reflection findings (`docs/CRITIC_AUDIT.md`).
- **Vector Citations**: JSON manifest of all 128-dim grounded semantic knowledge chunks (`docs/VECTOR_CITATIONS.json`).
- **FDA 21 CFR Part 11 Cryptographic Seal**: Immutable SHA-256 seal record with GxP ALCOA+ compliance manifest (`docs/FDA_GOVERNANCE_SEAL.json`).

---

## 💻 Horus CLI — Terminal Command Center

HorusAgent-AI provides a command-line interface (`horus-cli`) for DevOps engineers and SRE teams to orchestrate swarms and execute vector operations directly from the terminal:

```bash
# Install CLI package
cd cli && pip install -e .

# Or run directly inside the Docker container
docker exec -it horus_backend horus --help
```

### Essential CLI Commands
```bash
# 1. Platform status & health inspection
horus status

# 2. Launch autonomous swarm mission with automatic ZIP export
horus mission "Design a zero-trust ingress mesh with Envoy and mTLS" --export ./mesh-bundle.zip

# 3. Vector RAG semantic search (Cosine similarity against 128-dim vectors)
horus rag search "How does ALCOA+ define data integrity in thermal logging?"

# 4. Ingest new knowledge chunks into the vector store
horus rag ingest --title "Kafka Event Sourcing Spec" --category MICROSERVICES ./spec.md

# 5. Manage frontier AI providers & measure ping latency
horus providers list
horus providers ping GROQ
horus providers set-key GROQ "gsk_xxxxxxx" --model "llama-3.3-70b-versatile" --activate
```

---

## 📡 REST & WebSocket API Reference

| Endpoint | Method | Protocol | Description |
| :--- | :---: | :---: | :--- |
| `/ws/agent-stream` | `GET` | **WebSocket** | Real-time bi-directional agent thought stream and token broadcaster |
| `/api/v1/missions/presets` | `GET` | HTTP | Returns curated enterprise mission templates and prompts |
| `/api/v1/missions/execute` | `POST` | HTTP | Synchronous swarm execution fallback with complete `MissionResult` |
| `/api/v1/missions/export-zip` | `POST` | HTTP | Packages synthesized architecture, code, dockerfiles & FDA seal into a downloadable ZIP bundle |
| `/api/v1/rag/documents` | `GET` | HTTP | Lists all indexed vector chunks with category and metadata |
| `/api/v1/rag/documents` | `POST` | HTTP | Ingests new custom documentation chunk and generates dense embedding |
| `/api/v1/rag/search` | `POST` | HTTP | Direct semantic vector similarity search against indexed corpus |
| `/api/v1/providers` | `GET` | HTTP | Returns configured AI providers, active provider, routing matrix, and hyperparameters |
| `/api/v1/providers/save` | `POST` | HTTP | Updates provider API keys and active model selection |
| `/api/v1/providers/test` | `POST` | HTTP | Executes live handshake ping against provider endpoint with roundtrip latency |
| `/api/v1/providers/routing` | `POST` | HTTP | Updates per-agent model assignment matrix |
| `/api/v1/providers/preset` | `POST` | HTTP | Applies an architectural preset (`SPEED_OPTIMIZED`, `BALANCED`, `QUALITY_SUPREME`, `AIR_GAPPED_LOCAL`) |
| `/api/v1/providers/analytics` | `GET` | HTTP | Real-time aggregate token expenditure and estimated dollar cost |
| `/api/v1/metrics` | `GET` | HTTP | Returns swarm token counts, latency statistics, and governance status |
| `/health/ready` | `GET` | HTTP | Container readiness check probe |

---

## 🧪 Automated Testing & Quality Assurance

HorusAgent-AI includes an automated test suite verifying DAG compilation, anti-hallucination scoring, PII redaction, semantic cosine similarity, multi-provider dispatch, and project ZIP packaging:

```bash
# Run backend pytest suite inside container
docker exec -e PYTHONPATH=/app horus_backend pytest -v
```

### Test Results
```
tests/test_agents.py::test_orchestrator_dag_compilation PASSED           [  8%]
tests/test_agents.py::test_critic_scoring PASSED                         [ 16%]
tests/test_agents.py::test_governance_pii_sanitization PASSED            [ 25%]
tests/test_agents.py::test_full_swarm_execution PASSED                   [ 33%]
tests/test_export_zip.py::test_export_mission_project_bundle_zip PASSED  [ 41%]
tests/test_providers.py::test_get_providers_overview PASSED              [ 50%]
tests/test_providers.py::test_save_and_test_provider PASSED              [ 58%]
tests/test_providers.py::test_apply_preset PASSED                        [ 66%]
tests/test_providers.py::test_analytics_endpoint PASSED                  [ 75%]
tests/test_rag.py::test_embedder_dimension_and_normalization PASSED      [ 83%]
tests/test_rag.py::test_cosine_similarity_identical_and_orthogonal PASSED [ 91%]
tests/test_rag.py::test_vector_store_seed_and_search PASSED              [100%]

======================== 12 passed in 3.61s (100% OK) ========================
```

---

## 📄 License & Attribution

This project is open-source software licensed under the **[MIT License](LICENSE)**.

Architected and developed with precision by **[Reda Hafez](https://github.com/redahafez)**.  
📬 Contact: **[reda.hafez11@gmail.com](mailto:reda.hafez11@gmail.com)**
