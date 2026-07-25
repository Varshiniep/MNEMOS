"""
environment/base.py - Common interface for all environments.

All environment adapters (TextWorld, Demo, etc.) must implement this protocol.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class StepResult:
    """The result of executing one action in the environment."""
    observation: str
    reward: float = 0.0
    done: bool = False
    valid_commands: List[str] = field(default_factory=list)
    info: dict = field(default_factory=dict)


class BaseEnvironment(ABC):
    """Abstract base class for all MNEMOS environments."""

    @abstractmethod
    def reset(self) -> StepResult:
        """Reset the environment and return the initial observation."""

    @abstractmethod
    def step(self, action: str) -> StepResult:
        """Execute an action and return the result."""

    @abstractmethod
    def get_valid_commands(self) -> List[str]:
        """Return the list of currently valid commands."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable name of this environment."""

    @property
    @abstractmethod
    def is_available(self) -> bool:
        """Return True if this environment is usable on the current platform."""
