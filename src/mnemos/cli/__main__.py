"""
cli/__main__.py - MNEMOS command-line interface.

Usage:
    python -m mnemos.cli health
    python -m mnemos.cli correction-demo
    python -m mnemos.cli run-agent
    python -m mnemos.cli inspect-world
"""

from __future__ import annotations

import json
import sys

from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich import box

load_dotenv()
console = Console()


# ---------------------------------------------------------------------------
# health
# ---------------------------------------------------------------------------

def cmd_health():
    """Check Ollama and environment status."""
    from mnemos.agent.ollama_client import OllamaClient
    from mnemos.environment.textworld_adapter import _TEXTWORLD_AVAILABLE

    console.print(Panel("[bold blue]MNEMOS Health Check[/bold blue]", expand=False))
    client = OllamaClient()

    ollama_ok = client.is_available()
    status_str = "[green]✓ Online[/green]" if ollama_ok else "[red]✗ Offline[/red]"
    console.print(f"  Ollama ({client.base_url}): {status_str}")
    console.print(f"  Model:    [cyan]{client.model}[/cyan]")

    if ollama_ok:
        models = client.list_models()
        installed_str = ", ".join(models) if models else "(none)"
        console.print(f"  Installed models: {installed_str}")
        model_ok = client.model_is_installed()
        if model_ok:
            console.print(f"  Target model [cyan]{client.model}[/cyan]: [green]✓ installed[/green]")
        else:
            console.print(
                f"  Target model [cyan]{client.model}[/cyan]: [yellow]✗ not found[/yellow]  "
                f"(run: ollama pull {client.model})"
            )

    tw_str = "[green]✓ available[/green]" if _TEXTWORLD_AVAILABLE else "[yellow]✗ not installed[/yellow]"
    console.print(f"  TextWorld: {tw_str}")
    console.print(f"  Demo environment: [green]✓ available[/green]")


# ---------------------------------------------------------------------------
# correction-demo
# ---------------------------------------------------------------------------

def cmd_correction_demo():
    """Run the deterministic correction demonstration."""
    from mnemos.extractor.models import ExtractedFact
    from mnemos.updater.belief_updater import BeliefUpdater
    from mnemos.world_model.models import WorldState

    console.print(Panel("[bold blue]MNEMOS Correction Demo[/bold blue]", expand=False))

    state = WorldState()
    updater = BeliefUpdater()

    # Initial belief
    initial = ExtractedFact(
        entity="wooden_door",
        attribute="locked",
        value=True,
        confidence=0.70,
        source_text="initial observation",
        source="initial observation",
    )
    updater.update(state, [initial], source_context="initial observation")
    console.print("\n[bold]Step 1 — Initial belief inserted:[/bold]")
    b0 = state.beliefs[0]
    console.print(f"  wooden_door.locked = [yellow]{b0.value}[/yellow]  "
                  f"confidence={b0.confidence:.2f}  active={b0.active}")

    # Contradicting evidence
    contradiction = ExtractedFact(
        entity="wooden_door",
        attribute="locked",
        value=False,
        confidence=0.95,
        source_text="direct inspection: the wooden door opened without requiring a key",
        source="direct inspection",
    )
    updater.update(state, [contradiction], source_context="direct inspection")
    console.print("\n[bold]Step 2 — Contradicting evidence applied:[/bold]")

    superseded = next(b for b in state.beliefs if not b.active)
    new_b = next(b for b in state.beliefs if b.active)
    correction = state.corrections[0]

    table = Table(box=box.SIMPLE, show_header=True)
    table.add_column("", style="dim")
    table.add_column("ID", style="dim", no_wrap=True)
    table.add_column("Value", style="bold")
    table.add_column("Confidence")
    table.add_column("Active")
    table.add_column("Superseded By")

    table.add_row(
        "OLD",
        superseded.id[:8] + "…",
        str(superseded.value),
        f"{superseded.confidence:.2f}",
        "[red]False[/red]",
        (new_b.id[:8] + "…"),
    )
    table.add_row(
        "NEW",
        new_b.id[:8] + "…",
        str(new_b.value),
        f"{new_b.confidence:.2f}",
        "[green]True[/green]",
        "—",
    )
    console.print(table)

    console.print(f"\n[bold]Correction Event:[/bold]")
    console.print(f"  old_value:  [red]{correction.old_value}[/red]")
    console.print(f"  new_value:  [green]{correction.new_value}[/green]")
    console.print(f"  reason:     {correction.reason}")
    console.print(f"  ids match:  {superseded.superseded_by == new_b.id}")

    console.print("\n[green]✓ Correction demo complete.[/green]")


# ---------------------------------------------------------------------------
# run-agent
# ---------------------------------------------------------------------------

def cmd_run_agent():
    """Run the demo agent loop interactively."""
    from mnemos.agent.loop import AgentLoop
    from mnemos.environment.demo_environment import DemoEnvironment

    console.print(Panel("[bold blue]MNEMOS Agent Run[/bold blue]", expand=False))
    objective = "find the target object in the storage room"
    console.print(f"Objective: [cyan]{objective}[/cyan]")
    console.print("Environment: [cyan]demo[/cyan]")
    console.print("Press Ctrl+C to stop.\n")

    loop = AgentLoop(
        environment=DemoEnvironment(),
        run_id="cli-run",
        objective=objective,
        max_turns=20,
        use_ollama=False,  # Safe default — no Ollama required
    )

    turn = loop.start()
    console.print(f"[dim]Turn 0 observation:[/dim] {turn.observation[:200]}")

    try:
        while loop.state.status == "running":
            turn = loop.step()
            console.print(
                f"[bold]Turn {turn.turn}[/bold]  "
                f"action=[cyan]{turn.action}[/cyan]  "
                f"reward={turn.reward}  "
                f"corrections={len(turn.corrections)}"
            )
            console.print(f"  [dim]{turn.observation[:120]}[/dim]")
            if turn.done:
                console.print("[green]✓ Objective complete![/green]")
                break
    except KeyboardInterrupt:
        loop.stop()
        console.print("\n[yellow]Run stopped by user.[/yellow]")

    from mnemos.services.metrics_service import compute_metrics
    m = compute_metrics(loop)
    console.print(f"\nSummary: turns={m['total_turns']}  "
                  f"corrections={m['corrections']}  "
                  f"active_beliefs={m['active_beliefs']}")


# ---------------------------------------------------------------------------
# inspect-world
# ---------------------------------------------------------------------------

def cmd_inspect_world():
    """Show the latest saved world model."""
    from pathlib import Path
    import json

    data_dir = Path("data/world_models")
    files = sorted(data_dir.glob("*.json")) if data_dir.exists() else []

    if not files:
        console.print("[yellow]No world model files found in data/world_models/[/yellow]")
        return

    latest = files[-1]
    console.print(Panel(f"[bold blue]World Model: {latest.name}[/bold blue]", expand=False))
    data = json.loads(latest.read_text(encoding="utf-8"))

    beliefs = data.get("beliefs", [])
    active = [b for b in beliefs if b.get("active")]
    superseded = [b for b in beliefs if not b.get("active")]

    console.print(f"  Total beliefs:     {len(beliefs)}")
    console.print(f"  Active:            {len(active)}")
    console.print(f"  Superseded:        {len(superseded)}")
    console.print(f"  Corrections:       {len(data.get('corrections', []))}")

    table = Table(box=box.SIMPLE, show_header=True)
    table.add_column("Entity")
    table.add_column("Attribute")
    table.add_column("Value")
    table.add_column("Conf.")
    table.add_column("Active")
    table.add_column("Source")

    for b in beliefs[:30]:
        active_str = "[green]✓[/green]" if b.get("active") else "[red]✗[/red]"
        table.add_row(
            b.get("entity", ""),
            b.get("attribute", ""),
            str(b.get("value", ""))[:40],
            f"{b.get('confidence', 0):.2f}",
            active_str,
            b.get("source", "")[:20],
        )
    console.print(table)


# ---------------------------------------------------------------------------
# Dispatch
# ---------------------------------------------------------------------------

_COMMANDS = {
    "health": cmd_health,
    "correction-demo": cmd_correction_demo,
    "run-agent": cmd_run_agent,
    "inspect-world": cmd_inspect_world,
}


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in _COMMANDS:
        console.print("[bold]MNEMOS CLI[/bold]")
        console.print("Usage: python -m mnemos.cli <command>")
        console.print("Commands:")
        for name in _COMMANDS:
            console.print(f"  {name}")
        sys.exit(1)
    _COMMANDS[sys.argv[1]]()


if __name__ == "__main__":
    main()
