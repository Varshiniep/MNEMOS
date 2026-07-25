"""
test_updater.py - Tests for the BeliefUpdater.
"""
import pytest
from mnemos.extractor.models import ExtractedFact
from mnemos.updater.belief_updater import BeliefUpdater
from mnemos.world_model.models import WorldState


def make_fact(**kw):
    defaults = dict(
        entity="door", attribute="locked", value=True,
        confidence=0.8, source_text="test", source="test",
    )
    defaults.update(kw)
    return ExtractedFact(**defaults)


class TestBeliefInsertion:
    def test_inserts_new_belief(self):
        state = WorldState()
        updater = BeliefUpdater()
        fact = make_fact()
        updater.update(state, [fact])
        assert len(state.beliefs) == 1
        assert state.beliefs[0].value is True
        assert state.beliefs[0].active is True

    def test_no_correction_on_insert(self):
        state = WorldState()
        updater = BeliefUpdater()
        _, corrections = updater.update(state, [make_fact()])
        assert corrections == []


class TestMatchingBelief:
    def test_preserves_belief_when_value_agrees(self):
        state = WorldState()
        updater = BeliefUpdater()
        updater.update(state, [make_fact(value=True, confidence=0.6)])
        _, corrections = updater.update(state, [make_fact(value=True, confidence=0.6)])
        assert len(state.beliefs) == 1
        assert corrections == []

    def test_raises_confidence_on_agreement(self):
        state = WorldState()
        updater = BeliefUpdater()
        updater.update(state, [make_fact(confidence=0.5)])
        updater.update(state, [make_fact(confidence=0.9)])
        assert state.beliefs[0].confidence == pytest.approx(0.9)
        assert len(state.beliefs) == 1


class TestContradiction:
    def test_creates_new_belief_on_contradiction(self):
        state = WorldState()
        updater = BeliefUpdater()
        updater.update(state, [make_fact(value=True)])
        updater.update(state, [make_fact(value=False)])
        assert len(state.beliefs) == 2

    def test_old_belief_deactivated(self):
        state = WorldState()
        updater = BeliefUpdater()
        updater.update(state, [make_fact(value=True)])
        updater.update(state, [make_fact(value=False)])
        old = next(b for b in state.beliefs if b.value is True)
        assert old.active is False

    def test_new_belief_active(self):
        state = WorldState()
        updater = BeliefUpdater()
        updater.update(state, [make_fact(value=True)])
        updater.update(state, [make_fact(value=False)])
        new = next(b for b in state.beliefs if b.value is False)
        assert new.active is True

    def test_superseded_by_set(self):
        state = WorldState()
        updater = BeliefUpdater()
        updater.update(state, [make_fact(value=True)])
        updater.update(state, [make_fact(value=False)])
        old = next(b for b in state.beliefs if b.value is True)
        new = next(b for b in state.beliefs if b.value is False)
        assert old.superseded_by == new.id

    def test_correction_event_created(self):
        state = WorldState()
        updater = BeliefUpdater()
        updater.update(state, [make_fact(value=True)])
        _, corrections = updater.update(state, [make_fact(value=False)])
        assert len(corrections) == 1
        assert corrections[0].old_value is True
        assert corrections[0].new_value is False

    def test_correction_event_stored_in_state(self):
        state = WorldState()
        updater = BeliefUpdater()
        updater.update(state, [make_fact(value=True)])
        updater.update(state, [make_fact(value=False)])
        assert len(state.corrections) == 1

    def test_correction_preserves_history(self):
        """Three transitions: True → False → True should produce 3 beliefs."""
        state = WorldState()
        updater = BeliefUpdater()
        updater.update(state, [make_fact(value=True)])
        updater.update(state, [make_fact(value=False)])
        updater.update(state, [make_fact(value=True)])
        assert len(state.beliefs) == 3
        assert sum(1 for b in state.beliefs if b.active) == 1
        assert len(state.corrections) == 2
