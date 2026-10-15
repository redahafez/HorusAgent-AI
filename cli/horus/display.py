import sys
from typing import List, Dict, Any, Optional

try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.text import Text
    from rich.markdown import Markdown
    from rich import print as rprint
    HAS_RICH = True
    console = Console()
except ImportError:
    HAS_RICH = False
    console = None

# ANSI Fallback Colors
CYAN = "\033[96m"
SKY = "\033[94m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
MAGENTA = "\033[95m"
BOLD = "\033[1m"
DIM = "\033[2m"
RESET = "\033[0m"

BANNER_ASCII = r"""
  ██╗  ██╗ ██████╗ ██████╗ ██╗   ██╗███████╗   █████╗ ██╗
  ██║  ██║██╔═══██╗██╔══██╗██║   ██║██╔════╝  ██╔══██╗██║
  ███████║██║   ██║██████╔╝██║   ██║███████╗  ███████║██║
  ██╔══██║██║   ██║██╔══██╗██║   ██║╚════██║  ██╔══██║██║
  ██║  ██║╚██████╔╝██║  ██║╚██████╔╝███████║██╗██║  ██║██║
  ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝╚═╝  ╚═╝╚═╝
              𓂀 SOVEREIGN AGENT SWARM & VECTOR RAG
"""

def print_banner():
    if HAS_RICH:
        panel = Panel(
            Text(BANNER_ASCII, style="bold cyan"),
            subtitle="[bold gold1]FDA 21 CFR Part 11 Audit Trail Controls • Zero-Trust Mesh[/]",
            border_style="bright_blue"
        )
        console.print(panel)
    else:
        print(f"{CYAN}{BOLD}{BANNER_ASCII}{RESET}")
        print(f"{YELLOW}  [ FDA 21 CFR Part 11 Audit Trail Controls • Zero-Trust Mesh ]{RESET}\n")

def print_header(title: str):
    if HAS_RICH:
        console.rule(f"[bold cyan]{title}[/]")
    else:
        print(f"\n{CYAN}{BOLD}=== {title} ==={RESET}")

def print_success(msg: str):
    if HAS_RICH:
        console.print(f"[bold green]✓[/] {msg}")
    else:
        print(f"{GREEN}{BOLD}✓{RESET} {msg}")

def print_error(msg: str):
    if HAS_RICH:
        console.print(f"[bold red]✗ ERROR:[/] {msg}")
    else:
        print(f"{RED}{BOLD}✗ ERROR:{RESET} {msg}")

def print_info(msg: str):
    if HAS_RICH:
        console.print(f"[bold cyan]ℹ[/] {msg}")
    else:
        print(f"{CYAN}ℹ{RESET} {msg}")

def print_table(title: str, headers: List[str], rows: List[List[str]]):
    if HAS_RICH:
        table = Table(title=title, border_style="cyan")
        for h in headers:
            table.add_column(h, style="bold")
        for r in rows:
            table.add_row(*r)
        console.print(table)
    else:
        print(f"\n{BOLD}{title}{RESET}")
        # Calculate col widths
        col_widths = [len(h) for h in headers]
        for r in rows:
            for idx, cell in enumerate(r):
                col_widths[idx] = max(col_widths[idx], len(str(cell)))
        
        header_line = " | ".join(h.ljust(col_widths[i]) for i, h in enumerate(headers))
        sep_line = "-+-".join("-" * col_widths[i] for i in range(len(headers)))
        print(f"{CYAN}{header_line}{RESET}")
        print(sep_line)
        for r in rows:
            row_line = " | ".join(str(cell).ljust(col_widths[i]) for i, cell in enumerate(r))
            print(row_line)
        print()

def print_markdown(content: str):
    if HAS_RICH:
        console.print(Markdown(content))
    else:
        print(f"\n{content}\n")
