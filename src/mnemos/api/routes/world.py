"""
World model endpoints.

GET  /api/world/{run_id}
GET  /api/world/{run_id}/slice
GET  /api/world/{run_id}/beliefs
GET  /api/world/{run_id}/belief-history
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query, Request

router = APIRouter()


def _get_loop(run_id: str, request: Request):
    mgr = request.app.state.run_manager
    loop = mgr.get_run(run_id)
    if loop is None:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found")
    return loop


@router.get("/world/{run_id}")
async def get_world(run_id: str, request: Request):
    loop = _get_loop(run_id, request)
    ws = loop.get_world_state()
    return {
        "run_id": run_id,
        "belief_count": len(ws.beliefs),
        "active_beliefs": sum(1 for b in ws.beliefs if b.active),
        "superseded_beliefs": sum(1 for b in ws.beliefs if not b.active),
        "correction_count": len(ws.corrections),
        "beliefs": [b.model_dump() for b in ws.beliefs],
        "corrections": [c.model_dump() for c in ws.corrections],
    }


@router.get("/world/{run_id}/slice")
async def get_world_slice(run_id: str, request: Request):
    loop = _get_loop(run_id, request)
    ctx = loop.get_latest_context()
    if ctx is None:
        raise HTTPException(status_code=404, detail="No context slice available yet.")
    return {"run_id": run_id, "slice": ctx}


@router.get("/world/{run_id}/beliefs")
async def get_beliefs(
    run_id: str,
    request: Request,
    entity: Optional[str] = Query(None),
    attribute: Optional[str] = Query(None),
    active: Optional[bool] = Query(None),
):
    loop = _get_loop(run_id, request)
    ws = loop.get_world_state()

    beliefs = ws.beliefs
    if entity is not None:
        beliefs = [b for b in beliefs if b.entity.lower() == entity.lower()]
    if attribute is not None:
        beliefs = [b for b in beliefs if b.attribute.lower() == attribute.lower()]
    if active is not None:
        beliefs = [b for b in beliefs if b.active == active]

    return {
        "run_id": run_id,
        "count": len(beliefs),
        "beliefs": [b.model_dump() for b in beliefs],
    }


@router.get("/world/{run_id}/belief-history")
async def get_belief_history(
    run_id: str,
    request: Request,
    entity: str = Query(...),
    attribute: str = Query(...),
):
    loop = _get_loop(run_id, request)
    ws = loop.get_world_state()

    history = [
        b for b in ws.beliefs
        if b.entity.lower() == entity.lower()
        and b.attribute.lower() == attribute.lower()
    ]
    history.sort(key=lambda b: b.timestamp)

    return {
        "run_id": run_id,
        "entity": entity,
        "attribute": attribute,
        "version_count": len(history),
        "history": [b.model_dump() for b in history],
    }
