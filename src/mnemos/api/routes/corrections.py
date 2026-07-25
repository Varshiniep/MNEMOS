"""
Corrections endpoints.

GET  /api/corrections/{run_id}
POST /api/demo/correction
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from mnemos.extractor.models import ExtractedFact
from mnemos.updater.belief_updater import BeliefUpdater
from mnemos.world_model.models import WorldState

router = APIRouter()


def _get_loop(run_id: str, request: Request):
    mgr = request.app.state.run_manager
    loop = mgr.get_run(run_id)
    if loop is None:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found")
    return loop


@router.get("/corrections/{run_id}")
async def get_corrections(run_id: str, request: Request):
    loop = _get_loop(run_id, request)
    ws = loop.get_world_state()
    return {
        "run_id": run_id,
        "count": len(ws.corrections),
        "corrections": [c.model_dump() for c in ws.corrections],
    }


# ---------------------------------------------------------------------------
# Deterministic correction demo
# ---------------------------------------------------------------------------

class CorrectionDemoResponse(BaseModel):
    description: str
    initial_belief: dict
    correction_event: dict
    superseded_belief: dict
    new_belief: dict
    world_state_summary: dict


@router.post("/demo/correction", response_model=CorrectionDemoResponse)
async def run_correction_demo():
    """
    Deterministic correction demonstration (no Ollama required).
    """
    state = WorldState()
    updater = BeliefUpdater()

    initial_fact = ExtractedFact(
        entity="wooden_door",
        attribute="locked",
        value=True,
        confidence=0.70,
        source_text="initial observation: the wooden door is locked",
        source="initial observation",
    )
    updater.update(state, [initial_fact], source_context="initial observation")
    initial_belief = next(
        b for b in state.beliefs
        if b.entity == "wooden_door" and b.attribute == "locked"
    )

    contradicting_fact = ExtractedFact(
        entity="wooden_door",
        attribute="locked",
        value=False,
        confidence=0.95,
        source_text="direct inspection: the wooden door opened without requiring a key",
        source="direct inspection",
    )
    updater.update(state, [contradicting_fact], source_context="direct inspection")

    new_belief = next(
        b for b in state.beliefs
        if b.entity == "wooden_door" and b.attribute == "locked" and b.active
    )
    superseded = next(
        b for b in state.beliefs
        if b.entity == "wooden_door" and b.attribute == "locked" and not b.active
    )
    correction = state.corrections[0]

    return CorrectionDemoResponse(
        description=(
            "Demonstration of MNEMOS belief correction. "
            "An initial belief that the wooden door is locked (confidence 0.70) "
            "is contradicted by direct inspection (confidence 0.95). "
            "The old belief is preserved as inactive with superseded_by set. "
            "A CorrectionEvent records the full audit trail."
        ),
        initial_belief=initial_belief.model_dump(),
        correction_event=correction.model_dump(),
        superseded_belief=superseded.model_dump(),
        new_belief=new_belief.model_dump(),
        world_state_summary={
            "total_beliefs": len(state.beliefs),
            "active_beliefs": sum(1 for b in state.beliefs if b.active),
            "superseded_beliefs": sum(1 for b in state.beliefs if not b.active),
            "corrections": len(state.corrections),
            "superseded_by": superseded.superseded_by,
            "new_belief_id": new_belief.id,
            "ids_match": superseded.superseded_by == new_belief.id,
        },
    )
