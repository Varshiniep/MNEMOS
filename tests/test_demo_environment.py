"""
test_demo_environment.py - Tests for the demo environment.
"""
import pytest
from mnemos.environment.demo_environment import DemoEnvironment


@pytest.fixture
def env():
    e = DemoEnvironment()
    e.reset()
    return e


class TestDemoEnvironment:
    def test_reset_returns_observation(self, env):
        result = env.reset()
        assert result.observation != ""
        assert "Hall" in result.observation

    def test_look_returns_description(self, env):
        result = env.step("look")
        assert result.observation != ""

    def test_inventory_empty_initially(self, env):
        result = env.step("inventory")
        assert "nothing" in result.observation.lower() or "not carrying" in result.observation.lower()

    def test_go_to_kitchen(self, env):
        result = env.step("go east")
        assert "Kitchen" in result.observation

    def test_take_brass_key(self, env):
        env.step("go east")
        result = env.step("take brass key")
        assert "brass key" in result.observation.lower()

    def test_cannot_go_south_when_door_locked(self, env):
        result = env.step("go south")
        assert "locked" in result.observation.lower()

    def test_unlock_door_requires_key(self, env):
        result = env.step("unlock wooden door")
        assert "don't have" in result.observation.lower() or "need" in result.observation.lower()

    def test_full_walkthrough(self):
        """Complete the game end-to-end."""
        env = DemoEnvironment()
        env.reset()
        env.step("go east")         # → Kitchen
        env.step("take brass key")  # pick up key
        env.step("go west")         # → Hall
        env.step("unlock wooden door")
        env.step("open wooden door")
        env.step("go south")        # → Storage Room
        env.step("unlock chest")
        env.step("open chest")
        result = env.step("take target object")
        assert result.done is True
        assert result.reward >= 1.0

    def test_valid_commands_not_empty(self, env):
        assert len(env.get_valid_commands()) > 0

    def test_is_available(self):
        env = DemoEnvironment()
        assert env.is_available is True

    def test_name_is_demo(self):
        assert DemoEnvironment().name == "demo"
