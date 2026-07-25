"""
extractor/models.py - Data models for the observation extractor.

An ExtractedFact is one structured piece of information pulled from
a raw text observation. A set of ExtractedFacts forms an ExtractionResult.
"""

from __future__ import annotations

from typing import Any, List, Optional
from pydantic import BaseModel, Field


class ExtractedFact(BaseModel):
    """
    One structured fact extracted from a text observation.

    Every fact maps to a (entity, attribute, value) triple so it can
    be directly fed into the belief updater.
    """

    # The thing this fact is about (e.g. "wooden_door", "brass_key", "hall")
    entity: str

    # The property being described (e.g. "locked", "location", "description")
    attribute: str

    # The observed value
    value: Any

    # How confident we are this extraction is correct (0.0–1.0)
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)

    # The raw text snippet that produced this fact
    source_text: str = ""

    # Where this fact came from: "deterministic" or "llm_fallback"
    source: str = "deterministic"


class ExtractionResult(BaseModel):
    """
    The full result of processing one text observation.
    """

    # The raw observation text that was processed
    raw_observation: str

    # The current room name (empty string if not detected)
    current_room: str = ""

    # The room description prose
    room_description: str = ""

    # Objects visible in the scene
    visible_objects: List[str] = Field(default_factory=list)

    # Known exits from the current room  {"north": "kitchen", ...}
    exits: dict = Field(default_factory=dict)

    # Inventory items the agent currently carries
    inventory: List[str] = Field(default_factory=list)

    # All structured facts extracted from the observation
    facts: List[ExtractedFact] = Field(default_factory=list)

    # Whether the extraction succeeded with high confidence
    success: bool = True

    # Optional message if extraction partially failed
    message: str = ""

    # Whether the LLM fallback was used
    used_llm_fallback: bool = False
