"""
test_agent_loop.py - Tests for the AgentLoop.
"""
import pytest
from mnemos.agent.loop import AgentLoop
from mnemos.environment.demo_environment import DemoEnvironment


@pytest.fixture
def loop(tmp_path):
    env = DemoEnvironment()
    return AgentLoop(
        environment=env,
        run_id="test-loop",
        objective="find the target object",
        max_turns=5,
        use_ollama=False,
        data_dir=str(tmp_path),
    )


class TestAgentLoop:
    def test_start_returns_turn_record(self, loop):
        turn = loop.start()
        assert turn.turn == 0
        assert turn.observation != ""

    def test_status_running_after_start(self, loop):
        loop.start()
        assert loop.state.status == "running"

    def test_step_increases_turn_count(self, loop):
        loop.start()
        loop.step()
        assert len(loop.state.turns) >= 2

    def test_step_returns_turn_with_action(self, loop):
        loop.start()
        turn = loop.step()
        assert turn.action != ""
        assert turn.action != "[reset]"

    def test_stop_changes_status(self, loop):
        loop.start()
        loop.stop()
        assert loop.state.status == "stopped"

    def test_world_state_updated_after_step(self, loop):
        loop.start()
        loop.step()
        ws = loop.get_world_state()
        assert len(ws.beliefs) > 0

    def test_max_turns_respected(self, loop):
        loop.start()
        for _ in range(10):
            if loop.state.status != "running":
                break
            loop.step()
        assert len(loop.state.turns) <= loop.state.max_turns + 1

    def test_loop_detection_stops_run(self):
        """If the same action repeats enough times, the run should stop."""
        from unittest.mock import MagicMock
        from mnemos.agent.action_selector import ActionSelector

        env = DemoEnvironment()
        import tempfile, os
        with tempfile.TemporaryDirectory() as tmp:
            ag = AgentLoop(
                environment=env,
                run_id="loop-detect",
                objective="test",
                max_turns=20,
                use_ollama=False,
                data_dir=tmp,
            )
            # Monkey-patch action selector to always return "look"
            ag._selector = MagicMock()
            ag._selector.select.return_value = "look"
            ag.start()
            for _ in range(15):
                if ag.state.status != "running":
                    break
                ag.step()
            # Should have stopped due to loop detection
            assert ag.state.status != "running" or len(ag.state.turns) >= ag.state.max_turns
