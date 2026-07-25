"""
world_model/repository.py - JSON-backed persistence for WorldState.

Each run gets its own JSON file under data/world_models/<run_id>.json.
The repository is the single source of truth for reading and writing
the world state for a given run.
"""

from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Optional

from mnemos.world_model.models import WorldState

logger = logging.getLogger(__name__)


class WorldModelRepository:
    """
    Loads and saves WorldState to a JSON file.

    Usage:
        repo = WorldModelRepository("data/world_models", run_id="abc123")
        state = repo.load()          # returns empty WorldState if not found
        repo.save(state)
    """

    def __init__(self, data_dir: str | Path = "data/world_models", run_id: str = "default"):
        self._dir = Path(data_dir)
        self._dir.mkdir(parents=True, exist_ok=True)
        self.run_id = run_id

    @property
    def path(self) -> Path:
        return self._dir / f"{self.run_id}.json"

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def load(self) -> WorldState:
        """
        Load the WorldState from disk.
        Returns an empty WorldState if the file does not exist yet.
        """
        if not self.path.exists():
            logger.debug("No world model found at %s — returning empty state.", self.path)
            return WorldState()

        try:
            raw = self.path.read_text(encoding="utf-8")
            data = json.loads(raw)
            return WorldState.model_validate(data)
        except Exception as exc:
            logger.error("Failed to load world model from %s: %s", self.path, exc)
            return WorldState()

    def save(self, state: WorldState) -> None:
        """
        Persist the WorldState to disk as JSON.
        Raises on write failure so callers know persistence failed.
        """
        try:
            raw = state.model_dump_json(indent=2)
            self.path.write_text(raw, encoding="utf-8")
            logger.debug("Saved world model to %s", self.path)
        except Exception as exc:
            logger.error("Failed to save world model to %s: %s", self.path, exc)
            raise

    def delete(self) -> None:
        """Remove the persisted file for this run."""
        if self.path.exists():
            self.path.unlink()
            logger.debug("Deleted world model at %s", self.path)

    def exists(self) -> bool:
        """Return True if a persisted file exists for this run."""
        return self.path.exists()
