"""GET /api/health"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel

from mnemos.agent.ollama_client import OllamaClient
from mnemos.environment.textworld_adapter import _TEXTWORLD_AVAILABLE

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    ollama_available: bool
    ollama_url: str
    model: str
    textworld_available: bool
    demo_available: bool
    timestamp: str


@router.get("/health", response_model=HealthResponse)
def health():
    client = OllamaClient()
    return HealthResponse(
        status="ok",
        ollama_available=client.is_available(),
        ollama_url=client.base_url,
        model=client.model,
        textworld_available=_TEXTWORLD_AVAILABLE,
        demo_available=True,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
