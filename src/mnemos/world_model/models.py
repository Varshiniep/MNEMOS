"""
models.py - Core data models for the MNEMOS world model.

These models represent the agent's beliefs about the world,
corrections made to those beliefs, and the overall world state.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional
from uuid import uuid4

from pydantic import BaseModel, Field, field_validator


def _new_uuid() -> str:
    """Generate a new UUID string."""
    return str(uuid4())


def _utcnow() -> datetime:
    """Return the current UTC datetime."""
    return datetime.now(timezone.utc)


class Belief(BaseModel):
    """
    A single belief the agent holds about the world.

    A belief captures one fact: that a particular entity has a particular
    attribute with a particular value, along with how confident the agent
    is and where the belief came from.
    """

    # Unique identifier — generated automatically
    id: str = Field(default_factory=_new_uuid)

    # The thing this belief is about (e.g. "room_1", "door_north")
    entity: str

    # The property being described (e.g. "status", "location", "color")
    attribute: str

    # The value of the attribute — can be any type
    value: Any

    # How confident the agent is: 0.0 = no confidence, 1.0 = certain
    confidence: float = Field(..., ge=0.0, le=1.0)

    # When this belief was created
    timestamp: datetime = Field(default_factory=_utcnow)

    # Where this belief came from (e.g. "observation", "inference")
    source: str

    # Whether this belief is currently active (not replaced by a newer one)
    active: bool = True

    # If this belief was replaced, the ID of the belief that replaced it
    superseded_by: Optional[str] = None

    @field_validator("confidence")
    @classmethod
    def confidence_must_be_in_range(cls, v: float) -> float:
        """Double-check that confidence is between 0 and 1 (Pydantic's ge/le handles this)."""
        if not (0.0 <= v <= 1.0):
            raise ValueError(f"confidence must be between 0 and 1, got {v}")
        return v


class CorrectionEvent(BaseModel):
    """
    A record of a correction made to the world model.

    When a belief is updated or contradicted, a CorrectionEvent is created
    to track what changed and why. This gives the agent a full audit trail.
    """

    # Unique identifier — generated automatically
    id: str = Field(default_factory=_new_uuid)

    # The ID of the belief that was replaced
    old_belief_id: str

    # The ID of the new belief that replaced it
    new_belief_id: str

    # The entity both beliefs are about
    entity: str

    # The attribute that changed
    attribute: str

    # The old value
    old_value: Any

    # The new value
    new_value: Any

    # Why the correction was made
    reason: str

    # When the correction happened
    timestamp: datetime = Field(default_factory=_utcnow)


class WorldState(BaseModel):
    """
    The agent's complete view of the world at a point in time.

    Holds all active and historical beliefs, plus the log of every
    correction that has been applied.
    """

    # All beliefs the agent holds (active and inactive)
    beliefs: list[Belief] = Field(default_factory=list)

    # All corrections that have been applied to the world model
    corrections: list[CorrectionEvent] = Field(default_factory=list)
