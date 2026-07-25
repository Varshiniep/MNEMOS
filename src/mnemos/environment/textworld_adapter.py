"""
environment/textworld_adapter.py - Adapter for the TextWorld library.

TextWorld may not be available on Windows. This module gracefully handles
the ImportError so the rest of the application still works.
"""

from __future__ import annotations

import logging
from typing import List, Optional

from mnemos.environment.base import BaseEnvironment, StepResult

logger = logging.getLogger(__name__)

try:
    import textworld
    import textworld.gym
    _TEXTWORLD_AVAILABLE = True
except ImportError:
    _TEXTWORLD_AVAILABLE = False
    logger.info(
        "TextWorld is not installed. The demo environment will be used instead. "
        "To install TextWorld: pip install textworld (Linux/macOS only)."
    )


class TextWorldAdapter(BaseEnvironment):
    """
    Wraps a TextWorld game file as a MNEMOS environment.

    Falls back gracefully when TextWorld is not installed.
    """

    def __init__(self, game_path: Optional[str] = None):
        self._game_path = game_path
        self._env = None
        self._obs = ""

    @property
    def name(self) -> str:
        return "textworld"

    @property
    def is_available(self) -> bool:
        return _TEXTWORLD_AVAILABLE

    def reset(self) -> StepResult:
        if not _TEXTWORLD_AVAILABLE:
            return StepResult(
                observation="TextWorld is not available on this platform.",
                done=True,
            )
        if not self._game_path:
            return StepResult(
                observation="No TextWorld game path configured.",
                done=True,
            )
        try:
            import gym  # type: ignore
            request_infos = textworld.EnvInfos(
                description=True,
                inventory=True,
                admissible_commands=True,
            )
            env_id = textworld.gym.register_game(
                self._game_path,
                request_infos=request_infos,
                max_episode_steps=100,
            )
            self._env = gym.make(env_id)
            obs, info = self._env.reset()
            self._obs = str(obs)
            valid = list(info.get("admissible_commands", []))
            return StepResult(
                observation=self._obs,
                reward=0.0,
                done=False,
                valid_commands=valid,
                info=info,
            )
        except Exception as exc:
            logger.error("TextWorld reset failed: %s", exc)
            return StepResult(
                observation=f"TextWorld failed to initialise: {exc}",
                done=True,
            )

    def step(self, action: str) -> StepResult:
        if self._env is None:
            return StepResult(
                observation="Environment not initialised. Call reset() first.",
                done=True,
            )
        try:
            obs, reward, done, info = self._env.step(action)
            self._obs = str(obs)
            valid = list(info.get("admissible_commands", []))
            return StepResult(
                observation=self._obs,
                reward=float(reward),
                done=bool(done),
                valid_commands=valid,
                info=info,
            )
        except Exception as exc:
            logger.error("TextWorld step failed: %s", exc)
            return StepResult(
                observation=f"TextWorld error: {exc}",
                done=True,
            )

    def get_valid_commands(self) -> List[str]:
        return []
