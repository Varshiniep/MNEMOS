"""
extractor/deterministic.py - Deterministic text observation extractor.

Uses regex and heuristics to parse TextWorld-style observations into
structured ExtractedFacts without calling any external API.
"""

from __future__ import annotations

import re
from typing import List, Optional

from mnemos.extractor.models import ExtractedFact, ExtractionResult

# ---------------------------------------------------------------------------
# Room detection
# ---------------------------------------------------------------------------

# Matches lines like "-= Kitchen =-" or "Kitchen" at the start of an observation
_ROOM_HEADER = re.compile(
    r"^(?:-=\s*)?([A-Z][A-Za-z\s']+?)(?:\s*=-)?$",
    re.MULTILINE,
)

# Matches "You are in the Kitchen." / "You are in a dark hallway."
_YOU_ARE_IN = re.compile(
    r"[Yy]ou are in (?:the |a |an )?([A-Za-z\s']+?)[\.,]",
)


def _extract_room(text: str) -> str:
    """Return the best guess at the current room name."""
    m = _ROOM_HEADER.search(text)
    if m:
        candidate = m.group(1).strip()
        # Ignore very short or clearly non-room matches
        if 3 < len(candidate) < 40:
            return candidate
    m = _YOU_ARE_IN.search(text)
    if m:
        return m.group(1).strip().title()
    return ""


# ---------------------------------------------------------------------------
# Exit detection
# ---------------------------------------------------------------------------

_EXIT_LINE = re.compile(
    r"[Yy]ou (?:can go|see exits?)(.*?)(?:\.|$)",
    re.IGNORECASE,
)
_DIRECTION_MAP = {
    "north": "north", "south": "south", "east": "east", "west": "west",
    "up": "up", "down": "down", "n": "north", "s": "south",
    "e": "east", "w": "west",
}
_DIR_PATTERN = re.compile(
    r"\b(north|south|east|west|up|down)\b",
    re.IGNORECASE,
)


def _extract_exits(text: str) -> dict:
    """Return a dict of {direction: direction} for each detected exit."""
    exits: dict = {}

    # Look for "exits: north, south" style
    exit_section = re.search(
        r"[Ee]xits?\s*[:\-–]\s*([^\n\.]+)",
        text,
    )
    if exit_section:
        for m in _DIR_PATTERN.finditer(exit_section.group(1)):
            d = m.group(1).lower()
            exits[d] = d
        return exits

    # Look for "You can go north, east."
    m = _EXIT_LINE.search(text)
    if m:
        for dm in _DIR_PATTERN.finditer(m.group(1)):
            d = dm.group(1).lower()
            exits[d] = d
        return exits

    # Last resort: scan all directions mentioned after "go"
    for m in re.finditer(r"\bgo\s+(north|south|east|west|up|down)\b", text, re.IGNORECASE):
        d = m.group(1).lower()
        exits[d] = d

    return exits


# ---------------------------------------------------------------------------
# Object detection
# ---------------------------------------------------------------------------

_OBJECT_KEYWORDS = {
    "door": ["locked", "unlocked", "open", "closed"],
    "chest": ["locked", "unlocked", "open", "closed"],
    "key": [],
    "table": [],
    "box": ["open", "closed"],
    "candle": ["lit", "unlit"],
    "book": [],
    "sword": [],
    "bag": ["open", "closed"],
}

_OBJECT_PATTERN = re.compile(
    r"\b((?:(?:wooden|brass|iron|silver|golden|small|large|old|rusty)\s+)?(?:"
    + "|".join(_OBJECT_KEYWORDS.keys())
    + r"))\b",
    re.IGNORECASE,
)

_STATE_PATTERNS = {
    "locked": re.compile(r"\b(locked)\b", re.IGNORECASE),
    "unlocked": re.compile(r"\b(unlocked|not locked)\b", re.IGNORECASE),
    "open": re.compile(r"\b(open(?:ed)?)\b", re.IGNORECASE),
    "closed": re.compile(r"\b(closed?|shut)\b", re.IGNORECASE),
    "lit": re.compile(r"\b(lit|bright|illuminated)\b", re.IGNORECASE),
    "dark": re.compile(r"\b(dark|dim|unlit)\b", re.IGNORECASE),
}


def _extract_objects(text: str) -> List[str]:
    """Return list of unique objects mentioned in the text."""
    found = []
    seen = set()
    for m in _OBJECT_PATTERN.finditer(text):
        name = m.group(1).lower().strip()
        if name not in seen:
            seen.add(name)
            found.append(name)
    return found


def _extract_object_states(text: str, objects: List[str]) -> List[ExtractedFact]:
    """Return facts describing the state of each detected object."""
    facts: List[ExtractedFact] = []
    for obj in objects:
        entity = obj.replace(" ", "_")
        # Search a window around the object mention for state words
        obj_re = re.compile(re.escape(obj), re.IGNORECASE)
        for m in obj_re.finditer(text):
            start = max(0, m.start() - 60)
            end = min(len(text), m.end() + 60)
            window = text[start:end]

            for state, pattern in _STATE_PATTERNS.items():
                if pattern.search(window):
                    # Determine the canonical attribute
                    if state in ("locked", "unlocked"):
                        attribute = "locked"
                        value = state == "locked"
                    elif state in ("open", "closed"):
                        attribute = "open"
                        value = state == "open"
                    elif state in ("lit", "dark"):
                        attribute = "lit"
                        value = state == "lit"
                    else:
                        attribute = "state"
                        value = state

                    facts.append(ExtractedFact(
                        entity=entity,
                        attribute=attribute,
                        value=value,
                        confidence=0.80,
                        source_text=window.strip(),
                        source="deterministic",
                    ))
                    break  # one state per object per mention
    return facts


# ---------------------------------------------------------------------------
# Inventory detection
# ---------------------------------------------------------------------------

_INVENTORY_SECTION = re.compile(
    r"(?:You are carrying|Your inventory|Inventory)\s*[:\-–]?\s*\n((?:.+\n?)+?)(?:\n\n|$)",
    re.IGNORECASE,
)
_CARRYING_INLINE = re.compile(
    r"[Yy]ou (?:are carrying|have|pick up|take)\s+(?:the |a |an )?([A-Za-z\s]+?)[\.,!]",
)
_NOTHING_CARRYING = re.compile(
    r"[Yy]ou (?:are carrying nothing|have nothing|aren't carrying)",
    re.IGNORECASE,
)


def _extract_inventory(text: str) -> List[str]:
    """Return list of items the agent currently carries."""
    if _NOTHING_CARRYING.search(text):
        return []

    # Block-style inventory section (multi-line)
    m = _INVENTORY_SECTION.search(text)
    if m:
        items = []
        for line in m.group(1).splitlines():
            line = line.strip().lstrip("-*• ").strip()
            if line:
                items.append(line.lower())
        if items:
            return items

    # Inline single-line: "You are carrying: a brass key."
    inline = re.search(
        r"[Yy]ou are carrying[:\s]+([^\n\.]+)",
        text,
    )
    if inline:
        raw = inline.group(1).strip()
        # Split by comma if multiple items
        parts = [p.strip().lstrip("a an the ").strip() for p in raw.split(",")]
        return [p.lower() for p in parts if p]

    # "You are carrying a brass key."
    for m in _CARRYING_INLINE.finditer(text):
        item = m.group(1).strip().lower()
        if item and len(item) < 40:
            return [item]
    return []


# ---------------------------------------------------------------------------
# Public extractor
# ---------------------------------------------------------------------------

class DeterministicExtractor:
    """
    Extracts structured facts from a text observation using only
    pattern-matching — no external API calls required.
    """

    def extract(self, observation: str, context: Optional[dict] = None) -> ExtractionResult:
        """
        Parse a raw observation string into an ExtractionResult.

        Args:
            observation: The raw text observation from the environment.
            context: Optional dict with hints (e.g. current_room from prior turn).

        Returns:
            ExtractionResult with all detected facts.
        """
        text = observation.strip()
        facts: List[ExtractedFact] = []

        # Room
        current_room = _extract_room(text)
        if not current_room and context:
            current_room = context.get("current_room", "")

        if current_room:
            facts.append(ExtractedFact(
                entity=current_room.lower().replace(" ", "_"),
                attribute="current_room",
                value=True,
                confidence=0.90,
                source_text=text[:80],
                source="deterministic",
            ))

        # Room description (take first paragraph after the room name)
        room_description = ""
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        if paragraphs:
            # First non-header paragraph
            for para in paragraphs:
                if para and not re.match(r"^-=", para):
                    room_description = para
                    break

        if room_description and current_room:
            facts.append(ExtractedFact(
                entity=current_room.lower().replace(" ", "_"),
                attribute="description",
                value=room_description,
                confidence=0.85,
                source_text=room_description[:120],
                source="deterministic",
            ))

        # Exits
        exits = _extract_exits(text)
        if exits:
            room_key = current_room.lower().replace(" ", "_") if current_room else "current_room"
            facts.append(ExtractedFact(
                entity=room_key,
                attribute="exits",
                value=exits,
                confidence=0.88,
                source_text=text[:80],
                source="deterministic",
            ))

        # Objects and their states
        visible_objects = _extract_objects(text)
        object_state_facts = _extract_object_states(text, visible_objects)
        facts.extend(object_state_facts)

        for obj in visible_objects:
            facts.append(ExtractedFact(
                entity=obj.replace(" ", "_"),
                attribute="visible",
                value=True,
                confidence=0.82,
                source_text=obj,
                source="deterministic",
            ))

        # Inventory
        inventory = _extract_inventory(text)
        for item in inventory:
            facts.append(ExtractedFact(
                entity=item.replace(" ", "_"),
                attribute="in_inventory",
                value=True,
                confidence=0.90,
                source_text=text[:80],
                source="deterministic",
            ))

        return ExtractionResult(
            raw_observation=observation,
            current_room=current_room,
            room_description=room_description,
            visible_objects=visible_objects,
            exits=exits,
            inventory=inventory,
            facts=facts,
            success=True,
        )
