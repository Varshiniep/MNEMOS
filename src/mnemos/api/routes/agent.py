"""
Agent run endpoints.

POST /api/agent/start
POST /api/agent/{run_id}/step
POST /api/agent/{run_id}/run
POST /api/agent/{run_id}/stop
GET  /api/agent/{run_id}
GET  /api/agent/{run_id}/turns
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from mnemos.services.run_manager import RunManager

logger = logging.getLogger(__name__)
router = APIRouter()

# ---------------------------------------------------------------------------
# Request / response schemas
# ---------------------------------------------------------------------------

class StartRunRequest(BaseModel):
    objective: str = Field(..., min_length=1, description="What the agent should try to achieve")
    environment_type: str = Field("demo", description="'demo' or 'textworld'")
    max_turns: int = Field(20, ge=1, le=100)
    use_ollama: bool = Field(True)


class StartRunResponse(BaseModel):
    run_id: str
    status: str
    message: str


class RunStateResponse(BaseModel):
    run_id: str
    objective: str
    environment_type: str
    max_turns: int
    status: str
    completed: bool
    total_reward: float
    current_room: str
    turn_count: int
    started_at: Optional[str]
    stopped_at: Optional[str]
    error: Optional[str]


class TurnResponse(BaseModel):
    turn: int
    observation: str
    action: str
    action_result: str
    reward: float
    corrections: List[Dict]
    char_count: int
    approx_tokens: int
    done: bool
    timestamp: str
    extracted_facts: List[Dict] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_mgr(request: Request) -> RunManager:
    return request.app.state.run_manager


def _run_state_response(loop) -> RunStateResponse:
    s = loop.state
    return RunStateResponse(
        run_id=s.run_id,
        objective=s.objective,
        environment_type=s.environment_type,
        max_turns=s.max_turns,
        status=s.status,
        completed=s.completed,
        total_reward=s.total_reward,
        current_room=s.current_room,
        turn_count=len(s.turns),
        started_at=s.started_at,
        stopped_at=s.stopped_at,
        error=s.error,
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/agent/start", response_model=StartRunResponse, status_code=201)
async def start_run(body: StartRunRequest, request: Request):
    mgr = _get_mgr(request)
    loop = mgr.create_run(
        objective=body.objective,
        environment_type=body.environment_type,
        max_turns=body.max_turns,
        use_ollama=body.use_ollama,
    )
    first_turn = loop.start()
    return StartRunResponse(
        run_id=loop.state.run_id,
        status=loop.state.status,
        message=f"Run started. Turn 0: {first_turn.observation[:100]}...",
    )


@router.post("/agent/{run_id}/step", response_model=TurnResponse)
async def step_run(run_id: str, request: Request):
    mgr = _get_mgr(request)
    loop = mgr.get_run(run_id)
    if loop is None:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found")
    if loop.state.status not in ("running", "idle"):
        raise HTTPException(
            status_code=400,
            detail=f"Run is not active (status={loop.state.status})",
        )
    turn = loop.step()
    return TurnResponse(
        turn=turn.turn,
        observation=turn.observation,
        action=turn.action,
        action_result=turn.action_result,
        reward=turn.reward,
        corrections=turn.corrections,
        char_count=turn.char_count,
        approx_tokens=turn.approx_tokens,
        done=turn.done,
        timestamp=turn.timestamp,
        extracted_facts=turn.extracted_facts,
    )


@router.post("/agent/{run_id}/run", response_model=RunStateResponse)
async def run_to_completion(run_id: str, request: Request):
    """Run until done, max_turns reached, or a stop condition triggers."""
    mgr = _get_mgr(request)
    loop = mgr.get_run(run_id)
    if loop is None:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found")

    while loop.state.status == "running" and len(loop.state.turns) <= loop.state.max_turns:
        loop.step()
        if loop.state.completed or loop.state.status not in ("running",):
            break

    return _run_state_response(loop)


@router.post("/agent/{run_id}/stop", response_model=RunStateResponse)
async def stop_run(run_id: str, request: Request):
    mgr = _get_mgr(request)
    loop = mgr.get_run(run_id)
    if loop is None:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found")
    loop.stop()
    return _run_state_response(loop)


@router.get("/agent/{run_id}", response_model=RunStateResponse)
async def get_run(run_id: str, request: Request):
    mgr = _get_mgr(request)
    loop = mgr.get_run(run_id)
    if loop is None:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found")
    return _run_state_response(loop)


@router.get("/agent/{run_id}/turns", response_model=List[TurnResponse])
async def get_turns(run_id: str, request: Request):
    mgr = _get_mgr(request)
    loop = mgr.get_run(run_id)
    if loop is None:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found")
    return [
        TurnResponse(
            turn=t.turn,
            observation=t.observation,
            action=t.action,
            action_result=t.action_result,
            reward=t.reward,
            corrections=t.corrections,
            char_count=t.char_count,
            approx_tokens=t.approx_tokens,
            done=t.done,
            timestamp=t.timestamp,
            extracted_facts=t.extracted_facts,
        )
        for t in loop.state.turns
    ]
