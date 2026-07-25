"""
query/bounded_context.py - Bounded context query layer.

Produces the minimal world slice the agent needs to act, without
exposing the full WorldState, complete action history, or inactive beliefs.
"""

from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Optional

from mnemos.world_model.models import Belief, WorldState

logger = logging.getLogger(__name__)

# Approximate tokens = characters / 4
_CHARS_PER_TOKEN = 4


class BoundedContext:
    """
    The world slice returned to the agent.
    Contains only what the agent needs to choose the next action.
    """

    def __init__(
        self,
        objective: str,
        current_room: str,
        room_description: str,
        visible_objects: List[str],
        object_states: Dict[str, Any],
        exits: Dict[str, str],
        inventory: List[str],
        active_beliefs: List[Dict],
        valid_commands: List[str],
        beliefs_included: int,
        beliefs_excluded: int,
    ):
        self.objective = objective
        self.current_room = current_room
        self.room_description = room_description
        self.visible_objects = visible_objects
        self.object_states = object_states
        self.exits = exits
        self.inventory = inventory
        self.active_beliefs = active_beliefs
        self.valid_commands = valid_commands
        self.beliefs_included = beliefs_included
        self.beliefs_excluded = beliefs_excluded

        # Compute metrics after assembly
        serialized = self.to_prompt_string()
        self.char_count = len(serialized)
        self.approx_tokens = self.char_count // _CHARS_PER_TOKEN

    def to_dict(self) -> dict:
        return {
            "objective": self.objective,
            "current_room": self.current_room,
            "room_description": self.room_description,
            "visible_objects": self.visible_objects,
            "object_states": self.object_states,
            "exits": self.exits,
            "inventory": self.inventory,
            "active_beliefs": self.active_beliefs,
            "valid_commands": self.valid_commands,
            "metrics": {
                "char_count": self.char_count,
                "approx_tokens": self.approx_tokens,
                "beliefs_included": self.beliefs_included,
                "beliefs_excluded": self.beliefs_excluded,
            },
        }

    def to_prompt_string(self) -> str:
        """Format the bounded context as a concise prompt for the LLM."""
        lines = [
            f"Objective: {self.objective}",
            f"Current room: {self.current_room}",
        ]
        if self.room_description:
            lines.append(f"Room description: {self.room_description}")
        if self.exits:
            exits_str = ", ".join(self.exits.keys())
            lines.append(f"Exits: {exits_str}")
        if self.visible_objects:
            lines.append(f"Visible objects: {', '.join(self.visible_objects)}")
        if self.object_states:
            states = "; ".join(f"{k}: {v}" for k, v in self.object_states.items())
            lines.append(f"Object states: {states}")
        if self.inventory:
            lines.append(f"Inventory: {', '.join(self.inventory)}")
        if self.active_beliefs:
            belief_lines = []
            for b in self.active_beliefs:
                belief_lines.append(
                    f"  - {b['entity']}.{b['attribute']} = {b['value']} "
                    f"(conf: {b['confidence']:.2f})"
                )
            lines.append("Known facts:\n" + "\n".join(belief_lines))
        if self.valid_commands:
            lines.append(f"Valid commands: {', '.join(self.valid_commands)}")
        return "\n".join(lines)


class BoundedContextQuery:
    """
    Builds a BoundedContext from a WorldState.

    Explicitly excludes:
    - Complete action history
    - Inactive (superseded) beliefs
    - Unrelated rooms / objects
    - Full world-model JSON
    - Correction history (unless directly relevant)
    """

    def query(
        self,
        state: WorldState,
        current_room: str,
        objective: str,
        room_description: str = "",
        visible_objects: Optional[List[str]] = None,
        exits: Optional[Dict[str, str]] = None,
        inventory: Optional[List[str]] = None,
        valid_commands: Optional[List[str]] = None,
        max_beliefs: int = 30,
    ) -> BoundedContext:
        """
        Build a BoundedContext from the WorldState and current turn data.

        Args:
            state:            The full WorldState.
            current_room:     Name of the room the agent is currently in.
            objective:        The agent's current goal.
            room_description: Prose description of the current room.
            visible_objects:  Objects visible this turn.
            exits:            Available exits from the current room.
            inventory:        Items the agent carries.
            valid_commands:   Commands the environment accepts this turn.
            max_beliefs:      Cap on active beliefs included in the slice.
        """
        visible_objects = visible_objects or []
        exits = exits or {}
        inventory = inventory or []
        valid_commands = valid_commands or []

        # Only include ACTIVE beliefs
        active = [b for b in state.beliefs if b.active]
        excluded_count = len([b for b in state.beliefs if not b.active])

        # Sort by relevance: beliefs about the current room or visible objects first
        room_key = current_room.lower().replace(" ", "_")
        visible_keys = {o.lower().replace(" ", "_") for o in visible_objects}
        inventory_keys = {i.lower().replace(" ", "_") for i in inventory}

        def relevance_score(b: Belief) -> int:
            entity_key = b.entity.lower()
            if entity_key == room_key:
                return 3
            if entity_key in visible_keys:
                return 2
            if entity_key in inventory_keys:
                return 2
            return 1

        active.sort(key=relevance_score, reverse=True)

        # Cap at max_beliefs
        included = active[:max_beliefs]
        excluded_count += len(active[max_beliefs:])

        # Extract object states from beliefs
        object_states: Dict[str, Any] = {}
        for b in included:
            if b.attribute in ("locked", "open", "lit", "state", "in_inventory"):
                obj_name = b.entity.replace("_", " ")
                object_states[f"{obj_name} ({b.attribute})"] = b.value

        belief_dicts = [
            {
                "id": b.id,
                "entity": b.entity,
                "attribute": b.attribute,
                "value": b.value,
                "confidence": b.confidence,
                "source": b.source,
                "timestamp": b.timestamp.isoformat(),
            }
            for b in included
        ]

        return BoundedContext(
            objective=objective,
            current_room=current_room,
            room_description=room_description,
            visible_objects=visible_objects,
            object_states=object_states,
            exits=exits,
            inventory=inventory,
            active_beliefs=belief_dicts,
            valid_commands=valid_commands,
            beliefs_included=len(included),
            beliefs_excluded=excluded_count,
        )
