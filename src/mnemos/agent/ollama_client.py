"""
agent/ollama_client.py - Client for the local Ollama HTTP API.

Reads configuration from environment variables:
  OLLAMA_BASE_URL  (default: http://localhost:11434)
  OLLAMA_MODEL     (default: qwen2.5:3b)

Never calls any cloud API.
"""

from __future__ import annotations

import logging
import os
from typing import List, Optional

import requests

logger = logging.getLogger(__name__)

_DEFAULT_URL = "http://localhost:11434"
_DEFAULT_MODEL = "qwen2.5:3b"
_TIMEOUT = 60  # seconds


class OllamaError(Exception):
    """Base exception for Ollama client errors."""


class OllamaConnectionError(OllamaError):
    """Raised when the Ollama server cannot be reached."""


class OllamaModelNotFoundError(OllamaError):
    """Raised when the requested model is not installed."""


class OllamaClient:
    """
    Thin wrapper around the Ollama local REST API.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: int = _TIMEOUT,
    ):
        self.base_url = (base_url or os.getenv("OLLAMA_BASE_URL", _DEFAULT_URL)).rstrip("/")
        self.model = model or os.getenv("OLLAMA_MODEL", _DEFAULT_MODEL)
        self.timeout = timeout

    # ------------------------------------------------------------------
    # Health / availability
    # ------------------------------------------------------------------

    def is_available(self) -> bool:
        """Return True if the Ollama server is reachable."""
        try:
            resp = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return resp.status_code == 200
        except requests.exceptions.ConnectionError:
            return False
        except Exception:
            return False

    def list_models(self) -> List[str]:
        """Return list of installed model names."""
        try:
            resp = requests.get(f"{self.base_url}/api/tags", timeout=5)
            resp.raise_for_status()
            data = resp.json()
            return [m["name"] for m in data.get("models", [])]
        except requests.exceptions.ConnectionError as exc:
            raise OllamaConnectionError(f"Cannot connect to Ollama at {self.base_url}") from exc
        except Exception as exc:
            raise OllamaError(f"Failed to list models: {exc}") from exc

    def model_is_installed(self, model: Optional[str] = None) -> bool:
        """Return True if the given model (default: self.model) is installed."""
        target = model or self.model
        try:
            installed = self.list_models()
            # Allow prefix match: "qwen2.5:3b" matches "qwen2.5:3b" or "qwen2.5:3b-instruct"
            return any(m == target or m.startswith(target.split(":")[0]) for m in installed)
        except OllamaError:
            return False

    # ------------------------------------------------------------------
    # Generation
    # ------------------------------------------------------------------

    def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        max_tokens: int = 256,
        temperature: float = 0.2,
        system: Optional[str] = None,
    ) -> str:
        """
        Send a prompt to Ollama and return the response text.

        Args:
            prompt:      The user prompt.
            model:       Override the default model.
            max_tokens:  Approximate max tokens in the response.
            temperature: Sampling temperature (lower = more deterministic).
            system:      Optional system prompt.

        Returns:
            The generated text string.

        Raises:
            OllamaConnectionError: If the server is unreachable.
            OllamaModelNotFoundError: If the model is not installed.
            OllamaError: For other API errors.
        """
        target_model = model or self.model

        payload: dict = {
            "model": target_model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": max_tokens,
                "temperature": temperature,
            },
        }
        if system:
            payload["system"] = system

        try:
            resp = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=self.timeout,
            )
        except requests.exceptions.ConnectionError as exc:
            raise OllamaConnectionError(
                f"Cannot connect to Ollama at {self.base_url}. "
                "Make sure Ollama is running: ollama serve"
            ) from exc
        except requests.exceptions.Timeout as exc:
            raise OllamaError(f"Ollama request timed out after {self.timeout}s") from exc

        if resp.status_code == 404:
            raise OllamaModelNotFoundError(
                f"Model '{target_model}' is not installed. "
                f"Pull it with: ollama pull {target_model}"
            )

        try:
            resp.raise_for_status()
            data = resp.json()
            return data.get("response", "").strip()
        except Exception as exc:
            raise OllamaError(f"Unexpected response from Ollama: {exc}") from exc
