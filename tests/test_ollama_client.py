"""
test_ollama_client.py - Tests for the Ollama client (using mocks).
"""
import pytest
from unittest.mock import MagicMock, patch
from mnemos.agent.ollama_client import (
    OllamaClient,
    OllamaConnectionError,
    OllamaModelNotFoundError,
    OllamaError,
)


class TestOllamaClientAvailability:
    def test_is_available_returns_true_on_200(self):
        client = OllamaClient()
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        with patch("requests.get", return_value=mock_resp):
            assert client.is_available() is True

    def test_is_available_returns_false_on_connection_error(self):
        import requests
        client = OllamaClient()
        with patch("requests.get", side_effect=requests.exceptions.ConnectionError()):
            assert client.is_available() is False

    def test_list_models_returns_names(self):
        client = OllamaClient()
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"models": [{"name": "qwen2.5:3b"}, {"name": "llama3:8b"}]}
        mock_resp.raise_for_status = MagicMock()
        with patch("requests.get", return_value=mock_resp):
            models = client.list_models()
        assert "qwen2.5:3b" in models

    def test_model_is_installed_true(self):
        client = OllamaClient(model="qwen2.5:3b")
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"models": [{"name": "qwen2.5:3b"}]}
        mock_resp.raise_for_status = MagicMock()
        with patch("requests.get", return_value=mock_resp):
            assert client.model_is_installed() is True

    def test_model_is_installed_false_when_absent(self):
        client = OllamaClient(model="missing-model:latest")
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"models": [{"name": "qwen2.5:3b"}]}
        mock_resp.raise_for_status = MagicMock()
        with patch("requests.get", return_value=mock_resp):
            assert client.model_is_installed() is False


class TestOllamaClientGenerate:
    def test_generate_returns_text(self):
        client = OllamaClient()
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"response": "go north"}
        mock_resp.raise_for_status = MagicMock()
        with patch("requests.post", return_value=mock_resp):
            result = client.generate("What should I do?")
        assert result == "go north"

    def test_generate_raises_connection_error(self):
        import requests
        client = OllamaClient()
        with patch("requests.post", side_effect=requests.exceptions.ConnectionError()):
            with pytest.raises(OllamaConnectionError):
                client.generate("test")

    def test_generate_raises_model_not_found(self):
        client = OllamaClient()
        mock_resp = MagicMock()
        mock_resp.status_code = 404
        with patch("requests.post", return_value=mock_resp):
            with pytest.raises(OllamaModelNotFoundError):
                client.generate("test")
