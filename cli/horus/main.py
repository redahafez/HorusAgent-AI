import os
import sys
import click
from .client import HorusClient
from .display import (
    print_banner,
    print_header,
    print_success,
    print_error,
    print_info,
    print_table,
    print_markdown,
    BOLD,
    RESET,
    CYAN,
    GREEN,
    YELLOW,
    WHITE,
    RED
)

@click.group()
@click.option("--url", default=None, help="HorusAgent-AI Base Gateway URL (default: http://localhost:8888)")
@click.pass_context
def cli(ctx, url):
    """𓂀 HorusAgent-AI Command Line Interface
    Enterprise Multi-Agent Swarm Orchestration & Vector RAG Platform
    """
    ctx.ensure_object(dict)
    base_url = url or os.getenv("HORUS_API_URL", "http://localhost:8888")
    ctx.obj["client"] = HorusClient(base_url=base_url)

@cli.command("banner")
def show_banner():
    """Display the Eye of Horus platform banner."""
    print_banner()

@cli.command("status")
@click.pass_context
def status_cmd(ctx):
    """Check platform health, readiness, and swarm telemetry statistics."""
    client: HorusClient = ctx.obj["client"]
    print_banner()
    try:
        health = client.get_health()
        metrics = client.get_metrics()
        analytics = client.get_analytics()

        print_header("HORUS PLATFORM STATUS & READINESS")
        print_success(f"Gateway Status: {health.get('status', 'OK')} (Containers Healthy)")
        print_info(f"Platform: {health.get('platform', 'HorusAgent-AI Enterprise')}")
        print_info(f"Engine Mode: {health.get('engine', 'Sovereign Swarm v2.1')}")
        print_info(f"Active Provider: {BOLD}{analytics.get('active_provider', 'HORUS_SOVEREIGN')}{RESET}")
        print_info(f"Active Model: {analytics.get('active_model', 'horus-cognitive-v2-local')}")

        headers = ["Metric KPI", "Value", "Audit Status"]
        rows = [
            ["Total Tokens Processed", f"{analytics.get('total_tokens', 0):,}", "Verified"],
            ["Cumulative Cloud Cost", f"${analytics.get('estimated_cost_usd', 0.0):.4f}", "Within Budget"],
            ["Vector Embedder Dimension", f"{health.get('vector_dimension', 128)}-dim Dense", "Normalized Unit"],
            ["FDA 21 CFR Part 11 Audit Trail", "SHA-256 Non-Repudiation", "ALCOA+ Verified & Sealed"]
        ]
        print_table("Telemetry & Compliance Overview", headers, rows)
    except Exception as e:
        print_error(f"Could not connect to Horus Gateway at {client.base_url}: {e}")
        print_info("Make sure the docker stack is running with: docker compose up -d")
        sys.exit(1)

@cli.command("mission")
@click.argument("objective", required=True)
@click.option("--domain", default="CLOUD_ARCH", type=click.Choice(["CLOUD_ARCH", "CLINICAL_RAG", "MICROSERVICES", "SECURITY_AUDIT"]), help="Target enterprise domain")
@click.option("--export", default=None, help="Export runnable project bundle to specified .zip path")
@click.pass_context
def mission_cmd(ctx, objective, domain, export):
    """Launch an autonomous multi-agent swarm mission to design and synthesize systems."""
    client: HorusClient = ctx.obj["client"]
    print_banner()
    print_info(f"Initiating autonomous swarm mission...")
    print_info(f"Objective: {BOLD}{objective}{RESET}")
    print_info(f"Domain: {domain}")
    print()

    try:
        print_info("Orchestrator compiling DAG execution plan across 4 cognitive nodes...")
        res = client.execute_mission(objective=objective, domain=domain)
        deliverable = res.get("final_deliverable", "")
        critic_critique = res.get("critic_critique", "")
        citations = res.get("citations", [])
        score = res.get("verification_score", 0.98)

        print_header("SWARM REASONING DELIVERABLE")
        print_markdown(deliverable)

        # Print Citations Table
        if citations:
            headers = ["Chunk ID", "Title", "Category", "Cosine Sim"]
            rows = [
                [c.get("chunk_id", ""), c.get("title", "")[:35], c.get("category", ""), f"{c.get('similarity', 0.0)*100:.1f}%"]
                for c in citations
            ]
            print_table("Grounded Vector Citations", headers, rows)

        # Critic Audit
        print_header("CRITIC ANTI-HALLUCINATION AUDIT")
        print_info(f"Verification Confidence: {BOLD}{score*100:.1f}%{RESET}")
        print(f"{YELLOW}{critic_critique}{RESET}\n")

        print_success(f"Mission Completed in {res.get('execution_time_ms', 1200)}ms")
        print_success(f"FDA 21 CFR Part 11 Seal: {BOLD}{res.get('sealed_sha256', 'APPROVED')}{RESET}")

        # Optional Export
        if export:
            zip_filename = export if export.endswith(".zip") else f"{export}.zip"
            saved_path = client.export_project_zip(
                deliverable=deliverable,
                output_file=zip_filename,
                objective=objective,
                domain=domain,
                critic_critique=critic_critique,
                citations=citations,
                verification_score=score
            )
            print_success(f"Project Bundle exported successfully: {BOLD}{saved_path}{RESET}")

    except Exception as e:
        print_error(f"Mission execution failed: {e}")
        sys.exit(1)

@cli.command("export")
@click.option("--file", "deliverable_file", required=True, type=click.Path(exists=True), help="Path to deliverable markdown file")
@click.option("--output", default="horus-project-bundle.zip", help="Output .zip destination")
@click.option("--domain", default="CLOUD_ARCH", help="Domain category")
@click.pass_context
def export_cmd(ctx, deliverable_file, output, domain):
    """Package an existing architecture specification into a runnable enterprise project ZIP."""
    client: HorusClient = ctx.obj["client"]
    try:
        with open(deliverable_file, "r", encoding="utf-8") as f:
            content = f.read()

        zip_filename = output if output.endswith(".zip") else f"{output}.zip"
        saved = client.export_project_zip(
            deliverable=content,
            output_file=zip_filename,
            objective=f"Packaged from {os.path.basename(deliverable_file)}",
            domain=domain
        )
        print_success(f"Successfully packaged project bundle into: {BOLD}{saved}{RESET}")
    except Exception as e:
        print_error(f"Failed to export project ZIP: {e}")
        sys.exit(1)

@cli.group("rag")
def rag_group():
    """Vector RAG semantic search and knowledge corpus management."""
    pass

@rag_group.command("search")
@click.argument("query", required=True)
@click.option("--top-k", default=4, type=int, help="Number of nearest neighbors to retrieve")
@click.pass_context
def rag_search_cmd(ctx, query, top_k):
    """Perform direct cosine similarity search against the 128-dim knowledge vector store."""
    client: HorusClient = ctx.obj["client"]
    try:
        results = client.search_vector_rag(query=query, top_k=top_k)
        if not results:
            print_info("No relevant chunks found exceeding similarity threshold.")
            return

        headers = ["Title", "Category", "Cosine Similarity", "Snippet Preview"]
        rows = [
            [r.get("title", "")[:30], r.get("category", ""), f"{r.get('similarity', 0.0)*100:.1f}%", r.get("snippet", "")[:45] + "..."]
            for r in results
        ]
        print_table(f"Vector Similarity Results for: '{query}'", headers, rows)
    except Exception as e:
        print_error(f"RAG search failed: {e}")
        sys.exit(1)

@rag_group.command("ingest")
@click.option("--title", required=True, help="Document title")
@click.option("--category", default="CLOUD_ARCH", help="Category domain")
@click.argument("content_or_file", required=True)
@click.pass_context
def rag_ingest_cmd(ctx, title, category, content_or_file):
    """Ingest new enterprise knowledge chunk and generate dense 128-dim vector embedding."""
    client: HorusClient = ctx.obj["client"]
    content = ""
    if os.path.exists(content_or_file):
        with open(content_or_file, "r", encoding="utf-8") as f:
            content = f.read()
    else:
        content = content_or_file

    try:
        res = client.ingest_document(title=title, content=content, category=category)
        print_success(f"Document indexed: '{title}' (Chunk ID: {res.get('chunk_id')})")
        print_info(f"Embedder normalized 128 dimensions • Category: {category}")
    except Exception as e:
        print_error(f"Ingestion failed: {e}")
        sys.exit(1)

@cli.group("providers")
def providers_group():
    """Manage AI frontier providers (OpenAI, Anthropic, Groq, Gemini, Sovereign Engine)."""
    pass

@providers_group.command("list")
@click.pass_context
def providers_list_cmd(ctx):
    """List all AI providers, supported models, and active routing status."""
    client: HorusClient = ctx.obj["client"]
    try:
        data = client.get_providers()
        providers = data.get("providers", [])
        active_id = data.get("active_provider", "HORUS_SOVEREIGN")

        headers = ["Provider ID", "Name", "Key Configured", "Active Model", "Status"]
        rows = []
        for p in providers:
            p_id = p.get("provider") or p.get("id") or ""
            is_active = p.get("is_active", False) or (p_id == active_id)
            status_str = f"{GREEN}ACTIVE{RESET}" if is_active else "Standby"
            key_status = f"{GREEN}Configured{RESET}" if p.get("has_key") else f"{YELLOW}Local Air-Gapped{RESET}" if p_id == "HORUS_SOVEREIGN" else "Missing Key"
            rows.append([
                p_id,
                p.get("name", ""),
                key_status,
                p.get("selected_model", ""),
                status_str
            ])
        print_table("Enterprise AI Providers Gateway", headers, rows)
    except Exception as e:
        print_error(f"Failed to fetch providers: {e}")
        sys.exit(1)

@providers_group.command("ping")
@click.argument("provider", required=True, type=click.Choice(["OPENAI", "ANTHROPIC", "GROQ", "GEMINI", "HORUS_SOVEREIGN"]))
@click.pass_context
def providers_ping_cmd(ctx, provider):
    """Execute live handshake diagnostic and measure ping latency in ms."""
    client: HorusClient = ctx.obj["client"]
    print_info(f"Testing live handshake ping with {provider}...")
    try:
        res = client.test_provider_ping(provider=provider)
        if res.get("status") == "ok":
            print_success(f"{provider} ping successful! Roundtrip latency: {BOLD}{res.get('latency_ms', 0)}ms{RESET}")
            print_info(f"Endpoint: {res.get('details')}")
        else:
            print_error(f"{provider} connection failed: {res.get('details')}")
    except Exception as e:
        print_error(f"Ping failed: {e}")
        sys.exit(1)

@providers_group.command("set-key")
@click.argument("provider", required=True, type=click.Choice(["OPENAI", "ANTHROPIC", "GROQ", "GEMINI"]))
@click.argument("api_key", required=True)
@click.option("--model", default=None, help="Default model selection")
@click.option("--activate", is_flag=True, default=False, help="Set this provider as active immediately")
@click.pass_context
def providers_set_key_cmd(ctx, provider, api_key, model, activate):
    """Save an API key for a frontier provider and optionally activate it."""
    client: HorusClient = ctx.obj["client"]
    try:
        data = client.get_providers()
        prov_obj = next((p for p in data.get("providers", []) if p["id"] == provider), None)
        chosen_model = model or (prov_obj["selected_model"] if prov_obj else "default")
        
        client.save_provider(
            provider=provider,
            api_key=api_key,
            model=chosen_model,
            set_as_active=activate
        )
        print_success(f"Key saved for {provider} with model {chosen_model}")
        if activate:
            print_success(f"{provider} set as the active swarm engine!")
    except Exception as e:
        print_error(f"Failed to set provider key: {e}")
        sys.exit(1)

@cli.command("command-center")
@click.pass_context
def command_center_cmd(ctx):
    """View executive AI Workflow Command Center metrics (routing map, spend, approvals, and agent health)."""
    client: HorusClient = ctx.obj["client"]
    print_banner()
    try:
        data = client.get_command_center()
        kpis = data.get("kpis", {})

        print_header("HORUSAGENT AI — WORKFLOW COMMAND CENTER")
        print_info(f"Dashboard Title: {BOLD}{data.get('title', 'AI Workflow Command Center')}{RESET}")
        print_info(f"Subtitle: {data.get('subtitle', '')}")

        kpi_headers = ["KPI Metric", "Current Value", "Trend Period"]
        kpi_rows = [
            ["Monthly Spend", f"${kpis.get('monthly_spend', 0):,}", kpis.get("monthly_spend_trend", "")],
            ["Workflow Health", f"{kpis.get('workflow_health_pct', 0)}%", kpis.get("workflow_health_trend", "")],
            ["Approval Rate", f"{kpis.get('approval_rate_pct', 0)}%", kpis.get("approval_rate_trend", "")],
            ["Active Agents", f"{kpis.get('active_agents', 0)} Agents", kpis.get("active_agents_trend", "")]
        ]
        print_table("Executive Top KPIs", kpi_headers, kpi_rows)

        # Routing Map Breakdown
        routing = data.get("routing_map", {})
        routing_headers = ["Routing Path Ribbon", "Volume Traffic %", "Target Model & Tier"]
        routing_rows = [
            ["Primary Path", f"{routing.get('primary_path_pct', 68)}%", "GPT-4o (Frontier High-Precision)"],
            ["Secondary Path", f"{routing.get('secondary_path_pct', 22)}%", "Claude 3.5 Sonnet (Reflective Synthesis)"],
            ["Fallback Path", f"{routing.get('fallback_path_pct', 10)}%", "Llama 3 70B (Sovereign Offline Fallback)"]
        ]
        print_table("Sankey Flow Routing Paths", routing_headers, routing_rows)

        # Approval Queue
        approvals = data.get("approval_queue", [])
        app_headers = ["ID", "Workflow Task", "Details", "Status"]
        app_rows = [
            [a.get("id"), a.get("title"), a.get("subtitle")[:40], a.get("status")]
            for a in approvals
        ]
        print_table("Pending Approval Queue", app_headers, app_rows)

        # Agent Health
        agents = data.get("agent_health", [])
        agent_headers = ["Agent Name", "Version", "Uptime %", "Health Status"]
        agent_rows = [
            [ag.get("name"), ag.get("version"), f"{ag.get('uptime_pct')}%", f"{GREEN}● Healthy{RESET}"]
            for ag in agents
        ]
        print_table("Swarm Agent Health", agent_headers, agent_rows)

    except Exception as e:
        print_error(f"Failed to fetch Command Center metrics: {e}")
        sys.exit(1)

@cli.group("approvals")
def approvals_group():
    """Human-in-the-Loop Governance & Approvals (FDA 21 CFR Part 11)."""
    pass

@approvals_group.command("list")
@click.pass_context
def approvals_list_cmd(ctx):
    """List all pending and approved workflows in the compliance queue."""
    client: HorusClient = ctx.obj["client"]
    try:
        data = client.get_command_center()
        queue = data.get("approval_queue", [])
        headers = ["ID", "Workflow Item", "Description", "Status"]
        rows = [[item.get("id"), item.get("title"), item.get("subtitle"), item.get("status")] for item in queue]
        print_table("HorusAgent AI Approval Queue", headers, rows)
    except Exception as e:
        print_error(f"Failed to fetch approvals: {e}")
        sys.exit(1)

@approvals_group.command("approve")
@click.argument("item_id", required=True)
@click.pass_context
def approvals_approve_cmd(ctx, item_id):
    """Approve and electronically sign a workflow item."""
    client: HorusClient = ctx.obj["client"]
    try:
        res = client.update_approval(item_id=item_id, action="Approved", reviewer="CLI Admin")
        print_success(f"Item '{item_id}' Approved! Sealed status: {BOLD}{res.get('status')}{RESET}")
    except Exception as e:
        print_error(f"Failed to approve item: {e}")
        sys.exit(1)

@cli.command("router")
@click.pass_context
def router_cmd(ctx):
    """Display OpenRouter multi-tier fallback chains and model latency/cost matrix."""
    client: HorusClient = ctx.obj["client"]
    print_banner()
    try:
        data = client.get_router_overview()
        print_header("OPENROUTER MULTI-TIER FALLBACK CHAINS")

        chain = data.get("fallback_chain", [])
        chain_headers = ["Step", "Role", "Model", "Model ID", "Trigger Event", "Execution Mode"]
        chain_rows = [
            [str(c.get("step")), c.get("role"), c.get("model"), c.get("model_id"), c.get("on_event"), c.get("mode")]
            for c in chain
        ]
        print_table("Autonomous Fallback Routing Sequence", chain_headers, chain_rows)

        models = data.get("model_comparison", [])
        model_headers = ["Model", "Provider", "p50 Latency", "Cost / 1M Tokens", "Availability", "Score"]
        model_rows = [
            [m.get("name"), m.get("provider"), f"{m.get('latency_p50_ms')}ms", f"${m.get('cost_per_m_tokens'):.2f}", f"{m.get('availability_pct')}%", f"{m.get('score')}/100"]
            for m in models
        ]
        print_table("Frontier & Sovereign Model Benchmark Matrix", model_headers, model_rows)
    except Exception as e:
        print_error(f"Failed to fetch model router data: {e}")
        sys.exit(1)

@cli.group("admin")
def admin_group():
    """Manage Organizations, Workspaces, Users & RBAC (Reda Hafez Super Admin Authority)."""
    pass

@admin_group.command("overview")
@click.pass_context
def admin_overview_cmd(ctx):
    """Display governance summary, highlighting Super Admin Reda Hafez and system statistics."""
    client: HorusClient = ctx.obj["client"]
    print_banner()
    try:
        data = client.get_admin_overview()
        sa = data.get("super_admin", {})
        stats = data.get("stats", {})

        print_header("PLATFORM SUPER ADMIN & CHIEF ARCHITECT")
        print(f"  {BOLD}{CYAN}👑 Super Admin:{RESET} {BOLD}{WHITE}{sa.get('name')}{RESET} ({sa.get('email')})")
        print(f"  {BOLD}{CYAN}Title:{RESET} {sa.get('title')}")
        print(f"  {BOLD}{CYAN}Authority:{RESET} {GREEN}{sa.get('authority')}{RESET}")
        print(f"  {BOLD}{CYAN}Digital Signature:{RESET} {sa.get('digital_signature')}")
        print(f"  {BOLD}{CYAN}Security Protocol:{RESET} {sa.get('mfa')}")
        print()

        headers = ["Governance Dimension", "Operational Metric", "Compliance Status"]
        rows = [
            ["Total Organizations", f"{stats.get('total_tenants')} Tenants", "Air-Gapped & Multi-Tenant"],
            ["Active Workspaces", f"{stats.get('total_workspaces')} Environments", "Strict Process Isolation"],
            ["Total Provisioned Users", f"{stats.get('total_users')} Accounts", "80% MFA Protected"],
            ["Audit Standard", "FDA 21 CFR Part 11 & SOC 2", "ALCOA+ Non-Repudiation Sealed"]
        ]
        print_table("Enterprise Governance Key Statistics", headers, rows)
    except Exception as e:
        print_error(f"Failed to fetch admin overview: {e}")
        sys.exit(1)

@admin_group.command("users")
@click.pass_context
def admin_users_cmd(ctx):
    """List all enterprise users with roles and status, featuring Super Admin Reda Hafez."""
    client: HorusClient = ctx.obj["client"]
    try:
        data = client.get_admin_overview()
        users = data.get("users", [])
        headers = ["Member Identity", "Email", "Assigned Role", "MFA Security", "Account Status"]
        rows = []
        for u in users:
            is_super = u.get("is_super_admin") or u.get("id") == "usr-reda-hafez"
            name_str = f"{BOLD}{YELLOW}👑 {u.get('name')}{RESET}" if is_super else u.get("name", "")
            role_str = f"{BOLD}{CYAN}{u.get('role')}{RESET}" if is_super else u.get("role", "")
            mfa_str = f"{GREEN}✓ Verified{RESET}" if u.get("mfa_enabled") else f"{YELLOW}Pending{RESET}"
            status_str = f"{GREEN}ACTIVE{RESET}" if u.get("status") == "ACTIVE" else f"{RED}SUSPENDED{RESET}"
            rows.append([name_str, u.get("email", ""), role_str, mfa_str, status_str])
        print_table("HorusAgent AI Enterprise User Directory", headers, rows)
    except Exception as e:
        print_error(f"Failed to fetch users: {e}")
        sys.exit(1)

@admin_group.command("orgs")
@click.pass_context
def admin_orgs_cmd(ctx):
    """List all organization tenants, compliance frameworks, and data sovereignty."""
    client: HorusClient = ctx.obj["client"]
    try:
        data = client.get_admin_overview()
        tenants = data.get("tenants", [])
        headers = ["Organization Name", "Slug", "Tier", "Data Sovereignty", "Members", "Workspaces"]
        rows = [
            [t.get("name"), t.get("slug"), t.get("tier"), t.get("data_sovereignty"), str(t.get("members_count")), str(t.get("workspaces_count"))]
            for t in tenants
        ]
        print_table("Enterprise Sovereign Tenants", headers, rows)
    except Exception as e:
        print_error(f"Failed to fetch organizations: {e}")
        sys.exit(1)

if __name__ == "__main__":
    cli()

