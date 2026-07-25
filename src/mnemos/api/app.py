"""
api/app.py - FastAPI application factory for MNEMOS.

Start with:
    uvicorn mnemos.api.app:app --reload --port 8000
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from mnemos.agent.ollama_client import OllamaClient
from mnemos.services.run_manager import RunManager

# Import all routers
from mnemos.api.routes.health import router as health_router
from mnemos.api.routes.settings import router as settings_router
from mnemos.api.routes.agent import router as agent_router
from mnemos.api.routes.world import router as world_router
from mnemos.api.routes.corrections import router as corrections_router
from mnemos.api.routes.metrics import router as metrics_router

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Application lifecycle
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise shared services on startup."""
    data_dir = os.getenv("MNEMOS_DATA_DIR", "data")
    ollama = OllamaClient()
    app.state.run_manager = RunManager(data_dir=data_dir, ollama_client=ollama)
    logger.info("MNEMOS API started. Ollama available: %s", ollama.is_available())
    yield
    logger.info("MNEMOS API shutting down.")


# ---------------------------------------------------------------------------
# App creation
# ---------------------------------------------------------------------------

def create_app() -> FastAPI:
    application = FastAPI(
        title="MNEMOS API",
        description=(
            "Self-Correcting Bounded-Context World Model for text-based autonomous agents. "
            "Visit /docs for the interactive Swagger UI."
        ),
        version="0.1.0",
        lifespan=lifespan,
    )

    # CORS — allow the local Vite dev server
    application.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Global exception handler
    @application.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error("Unhandled exception: %s", exc, exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc), "type": type(exc).__name__},
        )

    # Mount all routers under /api prefix
    prefix = "/api"
    application.include_router(health_router, prefix=prefix, tags=["Health"])
    application.include_router(settings_router, prefix=prefix, tags=["Settings"])
    application.include_router(agent_router, prefix=prefix, tags=["Agent"])
    application.include_router(world_router, prefix=prefix, tags=["World Model"])
    application.include_router(corrections_router, prefix=prefix, tags=["Corrections"])
    application.include_router(metrics_router, prefix=prefix, tags=["Metrics"])

    return application


app = create_app()
