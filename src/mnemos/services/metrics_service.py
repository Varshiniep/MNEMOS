"""
services/metrics_service.py - Compute metrics from a run's state.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Optional

from mnemos.agent.loop import AgentLoop


def compute_metrics(loop: AgentLoop) -> Dict[str, Any]:
    """Return metrics dict for a given run."""
    state = loop.state
    world = loop.get_world_state()

    turns = state.turns
    total_turns = len(turns)
    total_actions = sum(1 for t in turns if t.action and t.action != "[reset]")

    # Rooms explored (unique current_room values from facts)
    rooms: set = set()
    for t in turns:
        for fact in t.extracted_facts:
            if fact.get("attribute") == "current_room":
                rooms.add(fact.get("entity", ""))

    active_beliefs = sum(1 for b in world.beliefs if b.active)
    superseded_beliefs = sum(1 for b in world.beliefs if not b.active)
    corrections = len(world.corrections)

    token_counts = [t.approx_tokens for t in turns if t.approx_tokens > 0]
    avg_tokens = int(sum(token_counts) / len(token_counts)) if token_counts else 0
    max_tokens = max(token_counts) if token_counts else 0

    elapsed: Optional[float] = None
    if state.started_at:
        start = datetime.fromisoformat(state.started_at)
        end_str = state.stopped_at
        end = datetime.fromisoformat(end_str) if end_str else datetime.now(timezone.utc)
        elapsed = round((end - start).total_seconds(), 2)

    return {
        "run_id": state.run_id,
        "total_turns": total_turns,
        "total_actions": total_actions,
        "unique_rooms_explored": len(rooms),
        "active_beliefs": active_beliefs,
        "superseded_beliefs": superseded_beliefs,
        "corrections": corrections,
        "avg_bounded_context_tokens": avg_tokens,
        "max_bounded_context_tokens": max_tokens,
        "completion_status": state.status,
        "completed": state.completed,
        "total_reward": state.total_reward,
        "elapsed_seconds": elapsed,
        "token_counts_per_turn": token_counts,
    }
