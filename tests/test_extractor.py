"""
test_extractor.py - Tests for the deterministic extractor.
"""
import pytest
from mnemos.extractor.deterministic import DeterministicExtractor


@pytest.fixture
def extractor():
    return DeterministicExtractor()


class TestDeterministicExtractor:
    def test_extracts_room_from_header(self, extractor):
        obs = "-= Kitchen =-\n\nYou are in the Kitchen. A brass key sits here."
        result = extractor.extract(obs)
        assert "kitchen" in result.current_room.lower()

    def test_extracts_room_from_you_are_in(self, extractor):
        obs = "You are in the Hall. There is a door to the south."
        result = extractor.extract(obs)
        assert result.current_room != ""

    def test_extracts_exits(self, extractor):
        obs = "You can go north and east from here."
        result = extractor.extract(obs)
        assert "north" in result.exits or "east" in result.exits

    def test_extracts_objects(self, extractor):
        obs = "You see a brass key on the table. There is also a wooden door."
        result = extractor.extract(obs)
        assert any("key" in o for o in result.visible_objects)

    def test_extracts_locked_state(self, extractor):
        obs = "The wooden door is locked."
        result = extractor.extract(obs)
        locked_facts = [f for f in result.facts if f.attribute == "locked" and f.value is True]
        assert len(locked_facts) > 0

    def test_extracts_inventory(self, extractor):
        obs = "You are carrying: a brass key."
        result = extractor.extract(obs)
        assert any("brass key" in item or "key" in item for item in result.inventory)

    def test_returns_extraction_result(self, extractor):
        from mnemos.extractor.models import ExtractionResult
        result = extractor.extract("You are in the Hall.")
        assert isinstance(result, ExtractionResult)

    def test_success_flag(self, extractor):
        result = extractor.extract("You are in the Hall.")
        assert result.success is True

    def test_no_llm_fallback_flag(self, extractor):
        result = extractor.extract("A quiet room.")
        assert result.used_llm_fallback is False

    def test_facts_have_correct_structure(self, extractor):
        obs = "-= Hall =-\nYou are in the Hall. The wooden door is locked. Exits: north."
        result = extractor.extract(obs)
        for fact in result.facts:
            assert hasattr(fact, "entity")
            assert hasattr(fact, "attribute")
            assert hasattr(fact, "confidence")
            assert 0.0 <= fact.confidence <= 1.0
