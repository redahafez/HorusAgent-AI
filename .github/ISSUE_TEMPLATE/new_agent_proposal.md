---
name: New AI Agent Proposal
about: Propose a new autonomous agent role or swarm capability
title: '[AGENT] '
labels: 'agent-proposal'
assignees: ''
---

**Agent Name & Role Identifier**
- Proposed Agent Name: (e.g. `Security Pentester Agent`, `Data Engineer Agent`)
- `AgentRole` Enum value: (e.g. `PENTESTER`, `DATA_ENGINEER`)

**Agent Capabilities & Responsibilities**
Detailed description of what this agent does in the multi-agent pipeline:
- Primary function:
- Expected Inputs:
- Generated Outputs:

**Recommended LLM Models & Temperature**
- Default Model: (e.g. `claude-3-5-sonnet`, `llama-3.3-70b-versatile`, `gpt-4o`)
- Recommended Temperature: (e.g. `0.0` for strict evaluation, `0.2` for synthesis)

**Tool & Sandbox Requirements**
- Does this agent need isolated container sandbox execution? [Yes/No]
- Does this agent query the 128-dim Vector RAG knowledge store? [Yes/No]
- Does this agent require strict 21 CFR Part 11 cryptographic sealing? [Yes/No]

**Example Prompt & Workflow Interaction**
Provide a sample task or objective demonstrating how this agent collaborates with other agents in a swarm.
