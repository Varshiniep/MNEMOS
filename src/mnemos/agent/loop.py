"""
agent/loop.py - The autonomous agent loop.

Steps:
1. Reset environment
2. Receive observation
3. Extract structured facts
4. Update world model
5. Build bounded world slice
6. Request one action
7. Validate action
8. Execute action
9. Record metrics
10. Repeat
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from mnemos.agent.action_selector import ActionSelector
from mnemos.agent.ollama_client import OllamaClient
from mnemos.environment.base import BaseEnvironment
from mnemos.extractor.deterministic import DeterministicExtractor
from mnemos.extractor.llm_fallback import LLMFallbackExtractor
from mnemos.query.bounded_context import BoundedContextQuery
from mnemos.updater.belief_updater import BeliefUpdater
from mnemos.world_model.models import WorldState
from mnemos.world_model.repository import WorldModelRepository

logger = logging.getLogger(__name__)

# How many recent actions to check for repetition loops
_LOOP_DETECTION_WINDOW = 5
_LOOP_DETECTION_THRESHOLD = 3  # if same action N times in window → stop


@dataclass
class TurnRecord:
    """Full record of one agent turn."""
    turn: int
    observation: str
    extracted_facts: List[Dict] = field(default_factory=list)
    world_slice: Optional[Dict] = None
    action: str = ""
    action_result: str = ""
    reward: float = 0.0
    corrections: List[Dict] = field(default_factory=list)
    char_count: int = 0
    approx_tokens: int = 0
    done: bool = False
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@dataclass
class RunState:
    """The mutable state of an active agent run."""
    run_id: str
    objective: str
    environment_type: str
    max_turns: int
    use_ollama: bool

    turns: List[TurnRecord] = field(default_factory=list)
    current_room: str = ""
    inventory: List[str] = field(default_factory=list)
    status: str = "idle"   # idle | running | completed | stopped | error
    completed: bool = False
    total_reward: float = 0.0
    started_at: Optional[str] = None
    stopped_at: Optional[str] = None
    error: Optional[str] = None


class AgentLoop:
    """
    Orchestrates the full MNEMOS agent loop for one run.
    """

    def __init__(
        self,
        environment: BaseEnvironment,
        run_id: str,
        objective: str,
        max_turns: int = 20,
        use_ollama: bool = True,
        data_dir: str = "data",
        ollama_client: Optional[OllamaClient] = None,
    ):
        self._env = environment
        self._run_id = run_id
        self._objective = objective
        self._max_turns = max_turns

        # Components
        self._extractor = DeterministicExtractor()
        self._updater = BeliefUpdater()
        self._query = BoundedContextQuery()
        client = ollama_client if use_ollama else None
        self._selector = ActionSelector(ollama_client=client)
        self._llm_extractor = LLMFallbackExtractor(ollama_client=client if use_ollama else None)

        # Persistence
        self._repo = WorldModelRepository(
            data_dir=f"{data_dir}/world_models",
            run_id=run_id,
        )

        # Run state
        self.state = RunState(
            run_id=run_id,
            objective=objective,
            environment_type=environment.name,
            max_turns=max_turns,
            use_ollama=use_ollama,
        )
        self._world_state = WorldState()
        self._last_result = None
        self._recent_actions: List[str] = []

    # ------------------------------------------------------------------
    # Public API (used by RunManager)
    # ------------------------------------------------------------------

    def start(self) -> TurnRecord:
        """Reset the environment and record turn 0."""
        self.state.started_at = datetime.now(timezone.utc).isoformat()
        self.state.status = "running"
        result = self._env.reset()
        self._last_result = result
        turn = self._process_observation(result, turn_num=0, action="[reset]")
        self._repo.save(self._world_state)
        return turn

    def step(self) -> TurnRecord:
        """Execute one agent turn. Returns the TurnRecord."""
        if self.state.status not in ("running", "idle"):
            raise RuntimeError(f"Run is not active (status={self.state.status})")
        if self._last_result is None:
            return self.start()

        turn_num = len(self.state.turns)
        if turn_num >= self._max_turns:
            self._finish("max_turns_reached")
            return self.state.turns[-1]

        # ---- Build context ----
        ctx = self._query.query(
            state=self._world_state,
            current_room=self.state.current_room,
            objective=self._objective,
            room_description=self._last_extraction.room_description if hasattr(self, "_last_extraction") else "",
            visible_objects=self._last_extraction.visible_objects if hasattr(self, "_last_extraction") else [],
            exits=self._last_extraction.exits if hasattr(self, "_last_extraction") else {},
            inventory=self.state.inventory,
            valid_commands=self._last_result.valid_commands,
        )

        # ---- Select action ----
        action = self._selector.select(ctx, recent_actions=self._recent_actions)

        # ---- Detect action loops ----
        if self._is_looping(action):
            logger.warning("Repeated-action loop detected on '%s' — stopping run.", action)
            self._finish("loop_detected")
            return self.state.turns[-1]

        self._recent_actions.append(action)

        # ---- Execute ----
        result = self._env.step(action)
        self._last_result = result

        # ---- Process observation ----
        turn = self._process_observation(result, turn_num=turn_num, action=action)
        turn.world_slice = ctx.to_dict()
        turn.char_count = ctx.char_count
        turn.approx_tokens = ctx.approx_tokens
        turn.reward = result.reward
        self.state.total_reward += result.reward

        # ---- Persist ----
        self._repo.save(self._world_state)

        # ---- Check completion ----
        if result.done:
            self._finish("completed")

        return turn

    def stop(self):
        """Gracefully stop the run."""
        self._finish("stopped")

    def get_world_state(self) -> WorldState:
        return self._world_state

    def get_latest_context(self):
        if not self.state.turns:
            return None
        last = self.state.turns[-1]
        return last.world_slice

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _process_observation(
        self,
        result,
        turn_num: int,
        action: str,
    ) -> TurnRecord:
        """Extract facts, update world model, record the turn."""
        context_hint = {"current_room": self.state.current_room}
        extraction = self._extractor.extract(result.observation, context=context_hint)
        self._last_extraction = extraction

        # Optional LLM augmentation
        extraction = self._llm_extractor.extract(result.observation, extraction, context=context_hint)

        if extraction.current_room:
            self.state.current_room = extraction.current_room
        if extraction.inventory is not None:
            self.state.inventory = extraction.inventory

        # Update world model
        _, corrections = self._updater.update(
            self._world_state,
            extraction.facts,
            source_context=f"turn_{turn_num}",
        )

        turn = TurnRecord(
            turn=turn_num,
            observation=result.observation,
            extracted_facts=[
                {
                    "entity": f.entity,
                    "attribute": f.attribute,
                    "value": f.value,
                    "confidence": f.confidence,
                    "source": f.source,
                }
                for f in extraction.facts
            ],
            action=action,
            action_result=result.observation[:200],
            corrections=[
                {
                    "entity": c.entity,
                    "attribute": c.attribute,
                    "old_value": c.old_value,
                    "new_value": c.new_value,
                    "reason": c.reason,
                }
                for c in corrections
            ],
            done=result.done,
        )
        self.state.turns.append(turn)
        return turn

    def _is_looping(self, action: str) -> bool:
        """Return True if the same action has been repeated too many times recently."""
        window = self._recent_actions[-_LOOP_DETECTION_WINDOW:]
        count = sum(1 for a in window if a.lower() == action.lower())
        return count >= _LOOP_DETECTION_THRESHOLD

    def _finish(self, reason: str):
        self.state.status = reason if reason in ("completed", "stopped", "error") else "stopped"
        if reason == "completed":
            self.state.completed = True
        self.state.stopped_at = datetime.now(timezone.utc).isoformat()
        logger.info("Run %s finished: %s", self._run_id, reason)
