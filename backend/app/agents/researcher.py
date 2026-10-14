import asyncio
from typing import List, Tuple
from .models import AgentRole, KnowledgeCitation
from ..rag.vector_store import vector_store

class ResearchAgent:
    """
    Retrieves dense vector embeddings and relevant knowledge chunks
    to ground the multi-agent swarm in verified enterprise domain context.
    """
    def __init__(self):
        self.role = AgentRole.RESEARCHER

    async def execute(self, query: str, domain: str = "ALL") -> Tuple[str, List[KnowledgeCitation]]:
        citations = vector_store.search(query=query, top_k=3, category=domain)
        
        # Fallback to global search if domain search yields no hits
        if not citations:
            citations = vector_store.search(query=query, top_k=3, category="ALL")

        if citations:
            summary_lines = [
                f"### 🔍 Grounded Vector Context Retrieved ({len(citations)} citations):"
            ]
            for idx, c in enumerate(citations, 1):
                summary_lines.append(
                    f"{idx}. **[{c.title}]** (Relevance: {c.similarity}%)\n"
                    f"   > *Snippet:* {c.snippet}"
                )
            context_summary = "\n\n".join(summary_lines)
        else:
            context_summary = "No high-confidence vector matches found. Proceeding with fundamental domain heuristics."

        return context_summary, citations
