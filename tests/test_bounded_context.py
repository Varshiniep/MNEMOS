"""
test_bounded_context.py - Tests for the bounded context query layer.
"""
import pytest
from mnemos.query.bounded_context import BoundedContextQuery
from mnemos.world_model.models import Belief, WorldState


def make_belief(entity="door", attribute="locked", value=True, active=True, confidence=0.8):
    return Belief(entity=entity, attribute=attribute, value=value,
                  confidence=confidence, source="test", active=active)


class TestBoundedContextQuery:
    def test_excludes_inactive_beliefs(self):
        state = WorldState()
        state.beliefs.append(make_belief(active=False))
        state.beliefs.append(make_belief(entity="key", attribute="visible", active=True))
        q = BoundedContextQuery()
        ctx = q.query(state, current_room="Hall", objective="find key")
        entities = [b["entity"] for b in ctx.active_beliefs]
        assert "door" not in entities
        assert "key" in entities

    def test_includes_only_active_beliefs(self):
        state = WorldState()
        state.beliefs.append(make_belief(active=True))
        state.beliefs.append(make_belief(entity="chest", attribute="open", active=True))
        q = BoundedContextQuery()
        ctx = q.query(state, current_room="Hall", objective="open chest")
        assert ctx.beliefs_included == 2

    def test_excluded_count_counts_inactive(self):
        state = WorldState()
        for _ in range(3):
            state.beliefs.append(make_belief(active=False))
        state.beliefs.append(make_belief(active=True))
        q = BoundedContextQuery()
        ctx = q.query(state, current_room="Hall", objective="test")
        assert ctx.beliefs_excluded >= 3

    def test_char_count_is_positive(self):
        state = WorldState()
        q = BoundedContextQuery()
        ctx = q.query(state, current_room="Hall", objective="test")
        assert ctx.char_count > 0

    def test_approx_tokens_is_positive(self):
        state = WorldState()
        q = BoundedContextQuery()
        ctx = q.query(state, current_room="Hall", objective="test")
        assert ctx.approx_tokens > 0

    def test_objective_in_context(self):
        state = WorldState()
        q = BoundedContextQuery()
        ctx = q.query(state, current_room="Hall", objective="find the key")
        assert "find the key" in ctx.to_prompt_string()

    def test_valid_commands_included(self):
        state = WorldState()
        q = BoundedContextQuery()
        ctx = q.query(state, current_room="Hall", objective="test",
                      valid_commands=["go north", "look"])
        assert "go north" in ctx.valid_commands

    def test_to_dict_contains_metrics(self):
        state = WorldState()
        q = BoundedContextQuery()
        ctx = q.query(state, current_room="Hall", objective="test")
        d = ctx.to_dict()
        assert "metrics" in d
        assert "char_count" in d["metrics"]
        assert "approx_tokens" in d["metrics"]
        assert "beliefs_included" in d["metrics"]
        assert "beliefs_excluded" in d["metrics"]
