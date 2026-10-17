# Contributing to HorusAgent AI 🦅

Thank you for your interest in contributing to **HorusAgent AI**! We welcome contributions from developers, researchers, and AI engineers across the open-source community.

This platform is architected by **[Reda Hafez](https://github.com/redahafez)** as an enterprise-grade autonomous AI multi-agent orchestration engine featuring:
- Dynamic multi-model routing (OpenAI, Anthropic Claude 3.5, Groq, Google Gemini, and Sovereign local models)
- Real-time 128-dim Vector RAG observability
- Interactive DAG Canvas Studio
- Automated 21 CFR Part 11 cryptographic audit trails

By contributing, you help make agentic AI workflows safer, faster, and more accessible.

---

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Local Development Setup](#local-development-setup)
4. [Project Architecture & Extension Points](#project-architecture--extension-points)
   - [Adding a New Autonomous Agent](#1-adding-a-new-autonomous-agent)
   - [Adding a New LLM Provider](#2-adding-a-new-llm-provider)
   - [Adding a New Workflow DAG Template](#3-adding-a-new-workflow-dag-template)
   - [Extending Frontend UI & Canvas](#4-extending-frontend-ui--canvas)
5. [Running Tests](#running-tests)
6. [Pull Request Workflow](#pull-request-workflow)
7. [Commit Message Conventions](#commit-message-conventions)
8. [Need Help?](#need-help)

---

## Code of Conduct

Please review our [Code of Conduct](CODE_OF_CONDUCT.md). We expect all contributors and maintainers to treat each other with respect, professionalism, and empathy.

---

## Getting Started

1. **Fork the Repository**:
   Click the **Fork** button at the top right of [https://github.com/redahafez/HorusAgent-AI](https://github.com/redahafez/HorusAgent-AI) to create your personal copy.

2. **Clone your fork locally**:
   ```bash
   git clone https://github.com/<your-username>/HorusAgent-AI.git
   cd HorusAgent-AI
   ```

3. **Set up upstream remote**:
   ```bash
   git remote add upstream https://github.com/redahafez/HorusAgent-AI.git
   ```

4. **Create a topic branch**:
   Always branch from `main`:
   ```bash
   git checkout -b feature/my-cool-agent
   ```

---

## Local Development Setup

### Option A: Complete Docker Setup (Recommended)
The fastest way to spin up the entire platform (Nginx Gateway `:8888`, FastAPI Backend `:8000`, and Next.js 14 Frontend `:3000`):

```bash
# 1. Copy environment configuration
cp .env.example .env

# 2. Build and launch all containers
docker-compose up --build
```
Once launched, open your browser at **`http://localhost:8888`**.

### Option B: Native Development Setup

#### Backend (Python 3.11+ / FastAPI):
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend (Node.js 18+ / Next.js 14 / Tailwind CSS):
```bash
cd frontend
npm install
npm run dev
```

---

## Project Architecture & Extension Points

HorusAgent AI is engineered modularly so you can extend its capabilities with minimal boilerplate:

### 1. Adding a New Autonomous Agent
Agent roles and swarm logic live under [`backend/app/agents/`](backend/app/agents/):
1. Define the role in `backend/app/agents/models.py` within `AgentRole`.
2. Implement your agent logic in `backend/app/agents/` (e.g., `pentest_agent.py` or `compliance_agent.py`).
3. Register the agent inside `backend/app/agents/orchestrator.py`.
4. Add the corresponding visual icon and badge in `frontend/src/components/VisualWorkflowStudio.tsx`.

### 2. Adding a New LLM Provider
Model router logic lives under [`backend/app/providers/`](backend/app/providers/):
1. Inherit from the base provider class in `backend/app/providers/base.py`.
2. Implement async completion with streaming tokens, latency tracking, and cost calculation.
3. Register your provider in `backend/app/providers/registry.py`.

### 3. Adding a New Workflow DAG Template
Workflow templates live in [`backend/app/api/routes_workflows.py`](backend/app/api/routes_workflows.py):
1. Add a new `WorkflowGraph` instance to `DEFAULT_TEMPLATES`.
2. Specify topological nodes starting at horizontal position `x: 290.0` (to maintain breathing room beside the Agent Palette) and connect them via `WorkflowEdge`.
3. Verify that topological sort passes via Kahn's cycle validation.

### 4. Extending Frontend UI & Canvas
Frontend components live in [`frontend/src/components/`](frontend/src/components/):
- `VisualWorkflowStudio.tsx`: Drag-and-drop interactive DAG canvas.
- `WorkflowRoutingMap.tsx`: Live telemetry Sankey ribbons and failover circuits.
- `VectorRagDashboard.tsx`: 128-dim cosine drift observability.
- `ModelRouterMatrix.tsx`: Multi-model latency and cost controls.
- `ApprovalsHub.tsx`: Human-in-the-loop audit signing.
- `AdminGovernanceHub.tsx`: Enterprise RBAC and team directory.

---

## Running Tests

All pull requests must pass the automated test suite before merging.

### Backend Pytest Suite (41+ tests)
```bash
# Inside Docker
docker exec horus_backend pytest -v

# Or Locally
cd backend
pytest -v
```

### Frontend Linting & Type Checks
```bash
cd frontend
npm run lint
npm run build
```

---

## Pull Request Workflow

1. **Keep Pull Requests Focused**: Each PR should address a single bug fix, performance optimization, or feature addition.
2. **Sync with Main**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
3. **Commit your changes**:
   Ensure meaningful commit messages following Conventional Commits (see below).
4. **Push to your fork**:
   ```bash
   git push origin feature/my-cool-agent
   ```
5. **Open a Pull Request**:
   Go to [https://github.com/redahafez/HorusAgent-AI/pulls](https://github.com/redahafez/HorusAgent-AI/pulls) and click **New Pull Request**.
6. **Fill out the PR Template**: Detail the motivation, screenshots (if UI changes), and validation steps.

---

## Commit Message Conventions

We adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature or agent capability (e.g., `feat(agent): add security red-team critic agent`)
- `fix:` A bug fix (e.g., `fix(dag): align palette and ensure node cards do not overlap`)
- `docs:` Documentation improvements (e.g., `docs: add RAG architecture guide`)
- `perf:` Performance optimizations (e.g., `perf: optimize vector cosine drift calculation`)
- `refactor:` Code refactoring without behavioral changes
- `test:` Adding or updating unit tests

---

## Need Help?

- **Issues**: Found a bug or have a suggestion? Open an [Issue](https://github.com/redahafez/HorusAgent-AI/issues).
- **Architecture Questions**: Contact the Chief Architect **Reda Hafez** via GitHub or project discussions.

Happy coding! 🦅✨
