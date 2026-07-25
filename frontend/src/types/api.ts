// api.ts — TypeScript interfaces matching the MNEMOS backend schemas exactly.

export interface HealthResponse {
  status: string;
  ollama_available: boolean;
  ollama_url: string;
  model: string;
  textworld_available: boolean;
  demo_available: boolean;
  timestamp: string;
}

export interface SettingsResponse {
  ollama_base_url: string;
  ollama_model: string;
  data_dir: string;
  default_max_turns: number;
  default_environment: string;
}

// ── Belief ──────────────────────────────────────────────────────────────────

export interface Belief {
  id: string;
  entity: string;
  attribute: string;
  value: unknown;
  confidence: number;
  timestamp: string;
  source: string;
  active: boolean;
  superseded_by: string | null;
}

// ── CorrectionEvent ──────────────────────────────────────────────────────────

export interface CorrectionEvent {
  id: string;
  old_belief_id: string;
  new_belief_id: string;
  entity: string;
  attribute: string;
  old_value: unknown;
  new_value: unknown;
  reason: string;
  timestamp: string;
}

// ── WorldState ───────────────────────────────────────────────────────────────

export interface WorldStateResponse {
  run_id: string;
  belief_count: number;
  active_beliefs: number;
  superseded_beliefs: number;
  correction_count: number;
  beliefs: Belief[];
  corrections: CorrectionEvent[];
}

export interface BeliefHistoryResponse {
  run_id: string;
  entity: string;
  attribute: string;
  version_count: number;
  history: Belief[];
}

// ── BoundedContext / world slice ──────────────────────────────────────────────

export interface ContextMetrics {
  char_count: number;
  approx_tokens: number;
  beliefs_included: number;
  beliefs_excluded: number;
}

export interface WorldSlice {
  objective: string;
  current_room: string;
  room_description: string;
  visible_objects: string[];
  object_states: Record<string, unknown>;
  exits: Record<string, string>;
  inventory: string[];
  active_beliefs: {
    id: string;
    entity: string;
    attribute: string;
    value: unknown;
    confidence: number;
    source: string;
    timestamp: string;
  }[];
  valid_commands: string[];
  metrics: ContextMetrics;
}

export interface WorldSliceResponse {
  run_id: string;
  slice: WorldSlice;
}

// ── Agent run ──────────────────────────────────────────────────────────────

export interface StartRunRequest {
  objective: string;
  environment_type: 'demo' | 'textworld';
  max_turns: number;
  use_ollama: boolean;
}

export interface StartRunResponse {
  run_id: string;
  status: string;
  message: string;
}

export interface RunState {
  run_id: string;
  objective: string;
  environment_type: string;
  max_turns: number;
  status: string;
  completed: boolean;
  total_reward: number;
  current_room: string;
  turn_count: number;
  started_at: string | null;
  stopped_at: string | null;
  error: string | null;
}

export interface TurnRecord {
  turn: number;
  observation: string;
  action: string;
  action_result: string;
  reward: number;
  corrections: {
    entity: string;
    attribute: string;
    old_value: unknown;
    new_value: unknown;
    reason: string;
  }[];
  char_count: number;
  approx_tokens: number;
  done: boolean;
  timestamp: string;
  extracted_facts: {
    entity: string;
    attribute: string;
    value: unknown;
    confidence: number;
    source: string;
  }[];
}

// ── Corrections ────────────────────────────────────────────────────────────

export interface CorrectionsResponse {
  run_id: string;
  count: number;
  corrections: CorrectionEvent[];
}

// ── Metrics ────────────────────────────────────────────────────────────────

export interface MetricsResponse {
  run_id: string;
  total_turns: number;
  total_actions: number;
  unique_rooms_explored: number;
  active_beliefs: number;
  superseded_beliefs: number;
  corrections: number;
  avg_bounded_context_tokens: number;
  max_bounded_context_tokens: number;
  completion_status: string;
  completed: boolean;
  total_reward: number;
  elapsed_seconds: number | null;
  token_counts_per_turn: number[];
}

// ── Demo correction ───────────────────────────────────────────────────────

export interface CorrectionDemoResponse {
  description: string;
  initial_belief: Belief;
  correction_event: CorrectionEvent;
  superseded_belief: Belief;
  new_belief: Belief;
  world_state_summary: {
    total_beliefs: number;
    active_beliefs: number;
    superseded_beliefs: number;
    corrections: number;
    superseded_by: string;
    new_belief_id: string;
    ids_match: boolean;
  };
}
