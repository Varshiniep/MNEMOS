"""
services/run_manager.py - In-memory manager for agent runs.

Creates, stores, and retrieves AgentLoop instances keyed by run_id.
"""

from __future__ import annotations

import logging
import uuid
from typing import Dict, Optional

from mnemos.agent.loop import AgentLoop, RunState
from mnemos.agent.ollama_client import OllamaClient
from mnemos.environment.base import BaseEnvironment
from mnemos.environment.demo_environment import DemoEnvironment
from mnemos.environment.textworld_adapter import TextWorldAdapter

logger = logging.getLogger(__name__)


def _make_environment(env_type: str) -> BaseEnvironment:
    """Create an environment by name."""
    if env_type == "textworld":
        adapter = TextWorldAdapter()
        if adapter.is_available:
            return adapter
        logger.warning("TextWorld not available — falling back to demo.")
    return DemoEnvironment()


class RunManager:
    """
    Manages the lifecycle of agent runs.
    All runs are kept in memory; world states are also persisted to disk.
    """

    def __init__(self, data_dir: str = "data", ollama_client: Optional[OllamaClient] = None):
        self._data_dir = data_dir
        self._ollama = ollama_client or OllamaClient()
        self._runs: Dict[str, AgentLoop] = {}

    def create_run(
        self,
        objective: str,
        environment_type: str = "demo",
        max_turns: int = 20,
        use_ollama: bool = True,
    ) -> AgentLoop:
        """Create a new run and return its AgentLoop."""
        run_id = str(uuid.uuid4())[:8]
        env = _make_environment(environment_type)
        loop = AgentLoop(
            environment=env,
            run_id=run_id,
            objective=objective,
            max_turns=max_turns,
            use_ollama=use_ollama,
            data_dir=self._data_dir,
            ollama_client=self._ollama if use_ollama else None,
        )
        self._runs[run_id] = loop
        logger.info("Created run %s (env=%s, max_turns=%d)", run_id, environment_type, max_turns)
        return loop

    def get_run(self, run_id: str) -> Optional[AgentLoop]:
        return self._runs.get(run_id)

    def list_runs(self) -> Dict[str, RunState]:
        return {rid: loop.state for rid, loop in self._runs.items()}

    def delete_run(self, run_id: str) -> bool:
        if run_id in self._runs:
            del self._runs[run_id]
            return True
        return False
