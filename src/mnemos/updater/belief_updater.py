"""
updater/belief_updater.py - Belief insertion and contradiction correction.

Rules:
1. No active belief exists   → insert new belief.
2. Incoming fact agrees      → preserve belief, optionally raise confidence.
3. Incoming fact contradicts → deactivate old belief, insert new belief,
                               create CorrectionEvent, set superseded_by.

Contradictions are NEVER silently overwritten.
"""

from __future__ import annotations

import logging
from typing import List, Optional, Tuple

from mnemos.extractor.models import ExtractedFact
from mnemos.world_model.models import Belief, CorrectionEvent, WorldState

logger = logging.getLogger(__name__)

# Tolerance for comparing float values as "equal"
_FLOAT_TOLERANCE = 1e-6


def _values_equal(a, b) -> bool:
    """Return True if two values should be considered the same belief."""
    if type(a) is not type(b):
        # Allow int/float cross-comparison
        try:
            return abs(float(a) - float(b)) < _FLOAT_TOLERANCE
        except (TypeError, ValueError):
            return str(a).lower() == str(b).lower()
    if isinstance(a, float):
        return abs(a - b) < _FLOAT_TOLERANCE
    if isinstance(a, str):
        return a.strip().lower() == b.strip().lower()
    return a == b


class BeliefUpdater:
    """
    Applies a list of ExtractedFacts to a WorldState, following the
    three-rule contradiction detection protocol.
    """

    def update(
        self,
        state: WorldState,
        facts: List[ExtractedFact],
        source_context: str = "",
    ) -> Tuple[WorldState, List[CorrectionEvent]]:
        """
        Apply all extracted facts to the world state.

        Args:
            state:          Current WorldState (will be mutated in place).
            facts:          Facts to apply.
            source_context: Human-readable label for the evidence source.

        Returns:
            (updated_state, new_corrections)
        """
        new_corrections: List[CorrectionEvent] = []

        for fact in facts:
            corrections = self._apply_fact(state, fact, source_context)
            new_corrections.extend(corrections)

        return state, new_corrections

    # ------------------------------------------------------------------
    # Private logic
    # ------------------------------------------------------------------

    def _apply_fact(
        self,
        state: WorldState,
        fact: ExtractedFact,
        source_context: str,
    ) -> List[CorrectionEvent]:
        """Apply one fact and return any CorrectionEvents created."""
        active_belief = self._find_active_belief(state, fact.entity, fact.attribute)

        # ---- Rule 1: No existing belief → insert ----
        if active_belief is None:
            new_belief = Belief(
                entity=fact.entity,
                attribute=fact.attribute,
                value=fact.value,
                confidence=fact.confidence,
                source=source_context or fact.source,
                active=True,
            )
            state.beliefs.append(new_belief)
            logger.debug("Inserted new belief: %s.%s = %s", fact.entity, fact.attribute, fact.value)
            return []

        # ---- Rule 2: Agrees with existing belief → preserve / boost confidence ----
        if _values_equal(active_belief.value, fact.value):
            if fact.confidence > active_belief.confidence:
                active_belief.confidence = fact.confidence
                logger.debug(
                    "Reinforced belief %s.%s — confidence raised to %.2f",
                    fact.entity, fact.attribute, fact.confidence,
                )
            return []

        # ---- Rule 3: Contradiction → correct ----
        logger.info(
            "Contradiction detected for %s.%s: %s → %s",
            fact.entity, fact.attribute, active_belief.value, fact.value,
        )

        # Create the new belief first so we have its ID
        new_belief = Belief(
            entity=fact.entity,
            attribute=fact.attribute,
            value=fact.value,
            confidence=fact.confidence,
            source=source_context or fact.source,
            active=True,
        )

        # Deactivate old belief and set superseded_by
        active_belief.active = False
        active_belief.superseded_by = new_belief.id

        # Record the correction event
        reason = (
            f"New evidence from '{source_context or fact.source}' contradicts prior belief. "
            f"Source text: {fact.source_text[:120]}"
            if fact.source_text
            else f"New evidence from '{source_context or fact.source}' contradicts prior belief."
        )
        correction = CorrectionEvent(
            old_belief_id=active_belief.id,
            new_belief_id=new_belief.id,
            entity=fact.entity,
            attribute=fact.attribute,
            old_value=active_belief.value,
            new_value=fact.value,
            reason=reason,
        )

        state.beliefs.append(new_belief)
        state.corrections.append(correction)

        return [correction]

    @staticmethod
    def _find_active_belief(
        state: WorldState,
        entity: str,
        attribute: str,
    ) -> Optional[Belief]:
        """Return the first active belief matching (entity, attribute), or None."""
        for belief in state.beliefs:
            if (
                belief.active
                and belief.entity.lower() == entity.lower()
                and belief.attribute.lower() == attribute.lower()
            ):
                return belief
        return None
