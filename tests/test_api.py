"""
test_api.py - Tests for the FastAPI endpoints using TestClient.
"""
import pytest
from fastapi.testclient import TestClient
from mnemos.api.app import app


@pytest.fixture(scope="module")
def client(tmp_path_factory):
    import os
    tmp = tmp_path_factory.mktemp("data")
    os.makedirs(tmp / "world_models", exist_ok=True)
    os.makedirs(tmp / "logs", exist_ok=True)

    # Override data_dir via env var before the app initialises
    from mnemos.agent.ollama_client import OllamaClient
    from mnemos.services.run_manager import RunManager
    import mnemos.api.app as app_module

    with TestClient(app, raise_server_exceptions=True) as c:
        # Inject a fresh RunManager with temp dir
        app.state.run_manager = RunManager(
            data_dir=str(tmp),
            ollama_client=OllamaClient(),
        )
        yield c


class TestHealthEndpoint:
    def test_health_returns_200(self, client):
        resp = client.get("/api/health")
        assert resp.status_code == 200

    def test_health_has_status_ok(self, client):
        resp = client.get("/api/health")
        data = resp.json()
        assert data["status"] == "ok"

    def test_health_has_timestamp(self, client):
        resp = client.get("/api/health")
        assert "timestamp" in resp.json()

    def test_health_has_ollama_fields(self, client):
        data = client.get("/api/health").json()
        assert "ollama_available" in data
        assert "model" in data


class TestSettingsEndpoint:
    def test_settings_returns_200(self, client):
        assert client.get("/api/settings").status_code == 200

    def test_settings_has_model(self, client):
        data = client.get("/api/settings").json()
        assert "ollama_model" in data


class TestCorrectionDemoEndpoint:
    def test_correction_demo_returns_200(self, client):
        resp = client.post("/api/demo/correction")
        assert resp.status_code == 200

    def test_correction_demo_has_correction_event(self, client):
        data = client.post("/api/demo/correction").json()
        assert "correction_event" in data
        assert data["correction_event"]["old_value"] is True
        assert data["correction_event"]["new_value"] is False

    def test_correction_demo_superseded_by_matches(self, client):
        data = client.post("/api/demo/correction").json()
        assert data["world_state_summary"]["ids_match"] is True

    def test_correction_demo_old_belief_inactive(self, client):
        data = client.post("/api/demo/correction").json()
        assert data["superseded_belief"]["active"] is False

    def test_correction_demo_new_belief_active(self, client):
        data = client.post("/api/demo/correction").json()
        assert data["new_belief"]["active"] is True


class TestAgentRunEndpoints:
    def test_start_run_returns_201(self, client):
        resp = client.post("/api/agent/start", json={
            "objective": "find the target object",
            "environment_type": "demo",
            "max_turns": 5,
            "use_ollama": False,
        })
        assert resp.status_code == 201

    def test_start_run_returns_run_id(self, client):
        resp = client.post("/api/agent/start", json={
            "objective": "test",
            "environment_type": "demo",
            "max_turns": 3,
            "use_ollama": False,
        })
        data = resp.json()
        assert "run_id" in data

    def test_get_run_returns_state(self, client):
        resp = client.post("/api/agent/start", json={
            "objective": "test",
            "environment_type": "demo",
            "max_turns": 3,
            "use_ollama": False,
        })
        run_id = resp.json()["run_id"]
        state = client.get(f"/api/agent/{run_id}").json()
        assert state["run_id"] == run_id

    def test_step_run(self, client):
        resp = client.post("/api/agent/start", json={
            "objective": "test",
            "environment_type": "demo",
            "max_turns": 5,
            "use_ollama": False,
        })
        run_id = resp.json()["run_id"]
        turn = client.post(f"/api/agent/{run_id}/step").json()
        assert "action" in turn

    def test_stop_run(self, client):
        resp = client.post("/api/agent/start", json={
            "objective": "test",
            "environment_type": "demo",
            "max_turns": 5,
            "use_ollama": False,
        })
        run_id = resp.json()["run_id"]
        stopped = client.post(f"/api/agent/{run_id}/stop").json()
        assert stopped["status"] == "stopped"

    def test_get_turns(self, client):
        resp = client.post("/api/agent/start", json={
            "objective": "test",
            "environment_type": "demo",
            "max_turns": 5,
            "use_ollama": False,
        })
        run_id = resp.json()["run_id"]
        turns = client.get(f"/api/agent/{run_id}/turns").json()
        assert isinstance(turns, list)
        assert len(turns) >= 1

    def test_unknown_run_id_returns_404(self, client):
        assert client.get("/api/agent/nonexistent").status_code == 404

    def test_world_endpoint(self, client):
        resp = client.post("/api/agent/start", json={
            "objective": "test",
            "environment_type": "demo",
            "max_turns": 3,
            "use_ollama": False,
        })
        run_id = resp.json()["run_id"]
        world = client.get(f"/api/world/{run_id}").json()
        assert "beliefs" in world

    def test_corrections_endpoint(self, client):
        resp = client.post("/api/agent/start", json={
            "objective": "test",
            "environment_type": "demo",
            "max_turns": 3,
            "use_ollama": False,
        })
        run_id = resp.json()["run_id"]
        corr = client.get(f"/api/corrections/{run_id}").json()
        assert "corrections" in corr

    def test_metrics_endpoint(self, client):
        resp = client.post("/api/agent/start", json={
            "objective": "test",
            "environment_type": "demo",
            "max_turns": 3,
            "use_ollama": False,
        })
        run_id = resp.json()["run_id"]
        metrics = client.get(f"/api/metrics/{run_id}").json()
        assert "total_turns" in metrics
        assert "active_beliefs" in metrics
