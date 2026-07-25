"""
test_action_selector.py - Tests for ActionSelector.
"""
import pytest
from unittest.mock import MagicMock
from mnemos.agent.action_selector import ActionSelector, _clean_response, _is_valid_command
from mnemos.query.bounded_context import BoundedContext


def make_context(valid_commands=None):
    return BoundedContext(
        objective="test",
        current_room="Hall",
        room_description="A hall.",
        visible_objects=[],
        object_states={},
        exits={"north": "north"},
        inventory=[],
        active_beliefs=[],
        valid_commands=valid_commands or ["go north", "look"],
        beliefs_included=0,
        beliefs_excluded=0,
    )


class TestCleanResponse:
    def test_strips_markdown_fences(self):
        assert _clean_response("```go north```") == "go north"

    def test_strips_quotes(self):
        assert _clean_response('"go north"') == "go north"

    def test_takes_first_line(self):
        assert _clean_response("go north\nThis is extra text") == "go north"

    def test_strips_action_prefix(self):
        result = _clean_response("Action: go north")
        assert result == "go north"

    def test_handles_empty(self):
        assert _clean_response("") == ""


class TestIsValidCommand:
    def test_valid_command_in_list(self):
        assert _is_valid_command("go north", ["go north", "look"]) is True

    def test_invalid_command_not_in_list(self):
        assert _is_valid_command("fly away", ["go north", "look"]) is False

    def test_empty_string_invalid(self):
        assert _is_valid_command("", []) is False

    def test_too_long_invalid(self):
        assert _is_valid_command("x" * 100, []) is False

    def test_valid_without_list(self):
        assert _is_valid_command("go north", []) is True


class TestActionSelector:
    def test_uses_valid_command_from_list(self):
        ctx = make_context(valid_commands=["go north", "look"])
        selector = ActionSelector(ollama_client=None)
        action = selector.select(ctx)
        assert action in ctx.valid_commands or action == "go north"

    def test_fallback_when_no_client(self):
        ctx = make_context(valid_commands=["take key"])
        selector = ActionSelector(ollama_client=None)
        action = selector.select(ctx)
        assert isinstance(action, str)
        assert len(action) > 0

    def test_uses_ollama_when_available(self):
        mock_client = MagicMock()
        mock_client.is_available.return_value = True
        mock_client.generate.return_value = "go north"
        ctx = make_context(valid_commands=["go north", "look"])
        selector = ActionSelector(ollama_client=mock_client)
        action = selector.select(ctx)
        assert action == "go north"

    def test_retries_on_invalid_response(self):
        mock_client = MagicMock()
        mock_client.is_available.return_value = True
        # First response invalid, second valid
        mock_client.generate.side_effect = ["INVALID MARKDOWN\n```json{}```", "look"]
        ctx = make_context(valid_commands=["go north", "look"])
        selector = ActionSelector(ollama_client=mock_client)
        action = selector.select(ctx)
        assert isinstance(action, str)
        assert len(action) > 0
