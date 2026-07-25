"""GET /api/settings"""
from __future__ import annotations

import os

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class SettingsResponse(BaseModel):
    ollama_base_url: str
    ollama_model: str
    data_dir: str
    default_max_turns: int
    default_environment: str


@router.get("/settings", response_model=SettingsResponse)
def get_settings():
    return SettingsResponse(
        ollama_base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
        ollama_model=os.getenv("OLLAMA_MODEL", "qwen2.5:3b"),
        data_dir=os.getenv("MNEMOS_DATA_DIR", "data"),
        default_max_turns=20,
        default_environment="demo",
    )
