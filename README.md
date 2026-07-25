# MNEMOS

**Self-Correcting Bounded-Context World Model for text-based autonomous agents.**

MNEMOS gives a text-based autonomous agent a structured, self-correcting memory of the world it explores. Each observation is parsed into structured beliefs. Contradictions are detected, the old belief is preserved as inactive, a new belief is created, and a full correction audit trail is kept. The agent never receives its complete interaction history — only a compact, relevant slice of the world model.

---

## Architecture

```
Text Environment
  → Observation Extractor      (deterministic regex + optional Ollama fallback)
  → Belief Updater             (insert / reinforce / correct)
  → World Model (JSON)         (full belief + correction history)
  → Bounded Context Query      (minimal relevant slice only)
  → Local SLM Agent (Ollama)   (qwen2.5:3b, one command per turn)
  → Action Execution
  → World Model Update
```

The agent **never** receives the full history or full world model. The bounded context query assembles only what is relevant for the current turn.

---

## Features

- **Deterministic extraction** — parses room, exits, objects, states, inventory from raw text without LLM
- **Three-rule belief updater** — insert / reinforce / correct with full audit trail
- **Correction events** — contradictions are never silently overwritten; old beliefs are preserved
- **Bounded context query** — configurable belief cap, relevance-ranked, metrics included
- **Ollama integration** — `qwen2.5:3b` via local HTTP API; full graceful fallback when offline
- **Demo environment** — self-contained text adventure (Hall → Kitchen → Storage Room) with no external dependencies
- **FastAPI REST API** — full CRUD for runs, beliefs, corrections, metrics; Swagger at `/docs`
- **React dashboard** — 7-page UI: Overview, Agent Run, World Model, Bounded Context, Corrections, Metrics, Architecture
- **125 backend tests** — pytest suite covering all layers

---

## Technology Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11+, FastAPI, Uvicorn, Pydantic v2 |
| World model storage | JSON files |
| LLM inference | Ollama (local), qwen2.5:3b |
| Text environment | Built-in demo + TextWorld adapter |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Testing | pytest, pytest-asyncio, FastAPI TestClient |

---

## Windows Setup

### 1. Clone and enter the project

```powershell
git clone <your-repo-url>
cd MNEMOS
```

### 2. Create and activate a virtual environment

```powershell
python -m venv .venv
.venv\Scripts\activate
```

### 3. Install backend dependencies

```powershell
pip install -r requirements.txt
```

### 4. Configure environment variables

```powershell
copy .env.example .env
```

Edit `.env` if needed (defaults work out of the box).

### 5. Install and start Ollama (optional — app works without it)

Download from https://ollama.com and run:

```powershell
ollama serve
ollama pull qwen2.5:3b
```

---

## Running the Backend

```powershell
uvicorn mnemos.api.app:app --reload --port 8000
```

- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/api/health

---

## Running the Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## Running Tests

```powershell
pytest -v
```

Expected: **125 passed**

## Frontend Production Build

```powershell
cd frontend
npm run build
```

---

## CLI Commands

```powershell
# System health check
python -m mnemos.cli health

# Deterministic correction demonstration (no Ollama needed)
python -m mnemos.cli correction-demo

# Run the demo agent loop
python -m mnemos.cli run-agent

# Inspect the last saved world model
python -m mnemos.cli inspect-world
```

---

## Correction Demo

The correction demo shows belief contradiction detection with no setup required:

```powershell
python -m mnemos.cli correction-demo
```

Or via API:

```powershell
curl -X POST http://localhost:8000/api/demo/correction
```

Or click **Run Demo** on the Corrections page in the UI.

The demo inserts an initial belief (`wooden_door.locked = True, confidence 0.70`) then applies contradicting evidence (`locked = False, confidence 0.95`). The UI shows the old belief marked inactive with `superseded_by` set, the new active belief, and the full CorrectionEvent.

---

## 5-Minute Jury Demo Sequence

1. **Start backend** — `uvicorn mnemos.api.app:app --reload --port 8000`
2. **Start frontend** — `cd frontend && npm run dev`, open http://localhost:5173
3. **Overview page** — show system status, Ollama indicator, "Start Demo Run" button
4. **Agent Run page** — start a demo run, execute steps one at a time, show observations and actions
5. **World Model page** — filter beliefs, show active vs superseded, confidence bars
6. **Bounded Context page** — show the exact slice the agent receives and metrics (chars/tokens/beliefs in/out)
7. **Corrections page** — click "Run Demo", walk through the wooden_door correction scenario side-by-side
8. **Metrics page** — show token usage chart and belief status bar chart after several turns
9. **Architecture page** — walk through the 7-step loop and component table

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `qwen2.5:3b` | Model to use for inference |
| `MNEMOS_DATA_DIR` | `data` | Root directory for JSON world models and logs |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend URL for the frontend |

---

## Troubleshooting

**Backend won't start** — make sure `.venv` is activated and `pip install -r requirements.txt` has been run.

**Ollama offline** — the app runs fully in deterministic mode. The agent uses a rule-based fallback; no LLM is required for the demo.

**TextWorld not available on Windows** — this is expected. The built-in demo environment is used automatically.

**Frontend can't reach backend** — confirm the backend is on port 8000 and `VITE_API_BASE_URL` in `frontend/.env` is correct.

**Port 8000 already in use** — `uvicorn mnemos.api.app:app --reload --port 8001` and update `VITE_API_BASE_URL=http://localhost:8001` in `frontend/.env`.

---

## License

MIT
