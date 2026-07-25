"""
test_models.py - Tests for MNEMOS core data models.

Covers: Belief, CorrectionEvent, WorldState
"""

import pytest
from pydantic import ValidationError

from mnemos.world_model.models import Belief, CorrectionEvent, WorldState


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_belief(**overrides):
    """Return a valid Belief, with optional field overrides."""
    defaults = {
        "entity": "room_1",
        "attribute": "status",
        "value": "lit",
        "confidence": 0.9,
        "source": "observation",
    }
    defaults.update(overrides)
    return Belief(**defaults)


# ---------------------------------------------------------------------------
# Belief — id generation
# ---------------------------------------------------------------------------

class TestBeliefId:
    def test_id_is_generated_automatically(self):
        """A Belief created without an explicit id should receive one."""
        belief = make_belief()
        assert belief.id is not None
        assert isinstance(belief.id, str)
        assert len(belief.id) > 0

    def test_each_belief_gets_a_unique_id(self):
        """Two separately created Beliefs should have different ids."""
        b1 = make_belief()
        b2 = make_belief()
        assert b1.id != b2.id

    def test_explicit_id_is_respected(self):
        """If an id is supplied, it should be kept as-is."""
        belief = make_belief(id="custom-id-123")
        assert belief.id == "custom-id-123"


# ---------------------------------------------------------------------------
# Belief — default field values
# ---------------------------------------------------------------------------

class TestBeliefDefaults:
    def test_active_is_true_by_default(self):
        """A new Belief should be active."""
        belief = make_belief()
        assert belief.active is True

    def test_superseded_by_is_null_by_default(self):
        """A new Belief should not be superseded by anything."""
        belief = make_belief()
        assert belief.superseded_by is None

    def test_timestamp_is_set_automatically(self):
        """A new Belief should have a timestamp."""
        belief = make_belief()
        assert belief.timestamp is not None


# ---------------------------------------------------------------------------
# Belief — confidence validation
# ---------------------------------------------------------------------------

class TestBeliefConfidence:
    def test_confidence_zero_is_valid(self):
        belief = make_belief(confidence=0.0)
        assert belief.confidence == 0.0

    def test_confidence_one_is_valid(self):
        belief = make_belief(confidence=1.0)
        assert belief.confidence == 1.0

    def test_confidence_midpoint_is_valid(self):
        belief = make_belief(confidence=0.5)
        assert belief.confidence == 0.5

    def test_confidence_below_zero_raises_validation_error(self):
        """confidence < 0 must be rejected."""
        with pytest.raises(ValidationError):
            make_belief(confidence=-0.1)

    def test_confidence_above_one_raises_validation_error(self):
        """confidence > 1 must be rejected."""
        with pytest.raises(ValidationError):
            make_belief(confidence=1.1)

    def test_confidence_far_below_zero_raises_validation_error(self):
        with pytest.raises(ValidationError):
            make_belief(confidence=-999.0)

    def test_confidence_far_above_one_raises_validation_error(self):
        with pytest.raises(ValidationError):
            make_belief(confidence=100.0)


# ---------------------------------------------------------------------------
# Belief — value flexibility
# ---------------------------------------------------------------------------

class TestBeliefValue:
    def test_value_can_be_a_string(self):
        belief = make_belief(value="open")
        assert belief.value == "open"

    def test_value_can_be_an_integer(self):
        belief = make_belief(value=42)
        assert belief.value == 42

    def test_value_can_be_a_boolean(self):
        belief = make_belief(value=True)
        assert belief.value is True

    def test_value_can_be_a_dict(self):
        belief = make_belief(value={"x": 1, "y": 2})
        assert belief.value == {"x": 1, "y": 2}

    def test_value_can_be_none(self):
        belief = make_belief(value=None)
        assert belief.value is None


# ---------------------------------------------------------------------------
# CorrectionEvent
# ---------------------------------------------------------------------------

class TestCorrectionEvent:
    def make_correction(self, **overrides):
        defaults = {
            "old_belief_id": "old-id-abc",
            "new_belief_id": "new-id-xyz",
            "entity": "room_1",
            "attribute": "status",
            "old_value": "dark",
            "new_value": "lit",
            "reason": "new observation contradicts prior belief",
        }
        defaults.update(overrides)
        return CorrectionEvent(**defaults)

    def test_id_is_generated_automatically(self):
        correction = self.make_correction()
        assert correction.id is not None
        assert isinstance(correction.id, str)

    def test_each_correction_gets_a_unique_id(self):
        c1 = self.make_correction()
        c2 = self.make_correction()
        assert c1.id != c2.id

    def test_timestamp_is_set_automatically(self):
        correction = self.make_correction()
        assert correction.timestamp is not None

    def test_fields_are_stored_correctly(self):
        correction = self.make_correction()
        assert correction.entity == "room_1"
        assert correction.attribute == "status"
        assert correction.old_value == "dark"
        assert correction.new_value == "lit"
        assert correction.reason == "new observation contradicts prior belief"


# ---------------------------------------------------------------------------
# WorldState
# ---------------------------------------------------------------------------

class TestWorldState:
    def test_beliefs_starts_as_empty_list(self):
        """A new WorldState should have no beliefs."""
        ws = WorldState()
        assert ws.beliefs == []

    def test_corrections_starts_as_empty_list(self):
        """A new WorldState should have no corrections."""
        ws = WorldState()
        assert ws.corrections == []

    def test_beliefs_and_corrections_are_independent(self):
        """Two WorldState instances should not share the same list objects."""
        ws1 = WorldState()
        ws2 = WorldState()
        ws1.beliefs.append(make_belief())
        assert ws2.beliefs == []

    def test_can_add_a_belief(self):
        ws = WorldState()
        belief = make_belief()
        ws.beliefs.append(belief)
        assert len(ws.beliefs) == 1
        assert ws.beliefs[0].entity == "room_1"

    def test_can_add_a_correction(self):
        ws = WorldState()
        correction = CorrectionEvent(
            old_belief_id="a",
            new_belief_id="b",
            entity="door",
            attribute="locked",
            old_value=True,
            new_value=False,
            reason="player unlocked the door",
        )
        ws.corrections.append(correction)
        assert len(ws.corrections) == 1
