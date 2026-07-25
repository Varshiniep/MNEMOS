"""GET /api/metrics/{run_id}"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request

from mnemos.services.metrics_service import compute_metrics

router = APIRouter()


@router.get("/metrics/{run_id}")
async def get_metrics(run_id: str, request: Request):
    mgr = request.app.state.run_manager
    loop = mgr.get_run(run_id)
    if loop is None:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found")
    return compute_metrics(loop)
