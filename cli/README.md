# 𓂀 Horus CLI — Enterprise Autonomous Agent & Vector RAG Terminal Interface

The official command-line interface for **HorusAgent-AI**. Designed for DevOps engineers, software architects, and SRE teams to orchestrate autonomous multi-agent cognitive swarms, run sub-second vector RAG queries, test LLM provider handshakes, and export complete runnable project bundles directly from the terminal.

---

## ⚡ Installation

### Option A: Install via Pip (Host Machine)
```bash
cd HorusAgent-AI/cli
pip install -e .

# Or with Rich terminal colors:
pip install -e ".[rich]"
```

### Option B: Run Inside Docker Container
The CLI is built directly into the containerized stack:
```bash
docker exec -it horus_backend horus --help
```

---

## 🚀 Command Reference

### 1. Platform Status & Health Inspection
```bash
horus status
```
Outputs gateway health, active engine, token consumption metrics, and FDA 21 CFR Part 11 certification status.

---

### 2. Launch Autonomous Swarm Mission & Code Synthesis
```bash
# Basic Mission
horus mission "Design a zero-trust ingress mesh with Envoy and mTLS"

# Mission with Targeted Domain
horus mission "Architect an FDA-compliant GxP cold-chain telemetry pipeline" --domain CLINICAL_RAG

# Mission with Automatic Project Bundle ZIP Export
horus mission "Build a high-throughput event broker with Redis distributed locks" --export ./event_broker.zip
```

---

### 3. Export Existing Blueprint to Project ZIP
```bash
horus export --file ./docs/architecture.md --output ./production-bundle.zip
```
Packages the specification, extracted runnable Python microservices, `Dockerfile`, `docker-compose.yml`, `docs/CRITIC_AUDIT.md`, `docs/VECTOR_CITATIONS.json`, and `docs/FDA_GOVERNANCE_SEAL.json`.

---

### 4. Vector RAG Operations
```bash
# Semantic Similarity Search (Cosine Dot-Product against 128-dim vectors)
horus rag search "How does ALCOA+ define data integrity in thermal logging?"

# Ingest New Knowledge Chunks
horus rag ingest --title "Kubernetes Multi-Cluster Ingress Spec" --category CLOUD_ARCH ./k8s-spec.md
```

---

### 5. AI Provider Gateway & Diagnostics
```bash
# List all configured providers and models
horus providers list

# Ping provider with live roundtrip latency measurement
horus providers ping GROQ
horus providers ping ANTHROPIC
horus providers ping HORUS_SOVEREIGN

# Configure API Key & Activate Provider
horus providers set-key GROQ "gsk_xxxxxxx" --model "llama-3.3-70b-versatile" --activate
horus providers set-key OPENAI "sk-xxxxxxx" --model "gpt-4o" --activate
```

---

## ⚙️ Environment Variables
| Variable | Description | Default |
| :--- | :--- | :--- |
| `HORUS_API_URL` | Base URL of the Horus Gateway | `http://localhost:8888` |

---

## 📄 License & Attribution
Licensed under the **[MIT License](../LICENSE)**.  
Architected & Developed by **[Reda Hafez](https://github.com/redahafez)** (reda.hafez11@gmail.com).
