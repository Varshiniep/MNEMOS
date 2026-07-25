"""
test_repository.py - Tests for WorldModelRepository.
"""
import pytest
from pathlib import Path
from mnemos.world_model.repository import WorldModelRepository
from mnemos.world_model.models import Belief, WorldState


@pytest.fixture
def tmp_repo(tmp_path):
    return WorldModelRepository(data_dir=tmp_path, run_id="test-run")


class TestRepository:
    def test_load_returns_empty_state_if_no_file(self, tmp_repo):
        state = tmp_repo.load()
        assert state.beliefs == []
        assert state.corrections == []

    def test_save_and_load_round_trip(self, tmp_repo):
        state = WorldState()
        state.beliefs.append(Belief(
            entity="door", attribute="locked", value=True,
            confidence=0.9, source="test",
        ))
        tmp_repo.save(state)
        loaded = tmp_repo.load()
        assert len(loaded.beliefs) == 1
        assert loaded.beliefs[0].entity == "door"
        assert loaded.beliefs[0].value is True

    def test_file_is_created_on_save(self, tmp_repo):
        tmp_repo.save(WorldState())
        assert tmp_repo.path.exists()

    def test_exists_false_before_save(self, tmp_repo):
        assert tmp_repo.exists() is False

    def test_exists_true_after_save(self, tmp_repo):
        tmp_repo.save(WorldState())
        assert tmp_repo.exists() is True

    def test_delete_removes_file(self, tmp_repo):
        tmp_repo.save(WorldState())
        tmp_repo.delete()
        assert not tmp_repo.path.exists()

    def test_load_preserves_belief_ids(self, tmp_repo):
        state = WorldState()
        belief = Belief(
            entity="chest", attribute="open", value=False,
            confidence=0.75, source="observation",
        )
        state.beliefs.append(belief)
        tmp_repo.save(state)
        loaded = tmp_repo.load()
        assert loaded.beliefs[0].id == belief.id
