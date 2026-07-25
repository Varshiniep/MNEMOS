// api.ts — Centralised API client for the MNEMOS backend.
// All calls go through this module; components never use fetch/axios directly.

import axios from 'axios';
import type {
  HealthResponse,
  SettingsResponse,
  StartRunRequest,
  StartRunResponse,
  RunState,
  TurnRecord,
  WorldStateResponse,
  WorldSliceResponse,
  CorrectionsResponse,
  MetricsResponse,
  CorrectionDemoResponse,
  Belief,
} from '../types/api';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8000';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Generic error wrapper ────────────────────────────────────────────────────

function apiError(err: unknown): never {
  if (axios.isAxiosError(err)) {
    const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
    throw new Error(detail ?? err.message);
  }
  throw err;
}

// ── Health / settings ────────────────────────────────────────────────────────

export async function fetchHealth(): Promise<HealthResponse> {
  try {
    const r = await client.get<HealthResponse>('/api/health');
    return r.data;
  } catch (e) { return apiError(e); }
}

export async function fetchSettings(): Promise<SettingsResponse> {
  try {
    const r = await client.get<SettingsResponse>('/api/settings');
    return r.data;
  } catch (e) { return apiError(e); }
}

// ── Agent runs ───────────────────────────────────────────────────────────────

export async function startRun(req: StartRunRequest): Promise<StartRunResponse> {
  try {
    const r = await client.post<StartRunResponse>('/api/agent/start', req);
    return r.data;
  } catch (e) { return apiError(e); }
}

export async function stepRun(runId: string): Promise<TurnRecord> {
  try {
    const r = await client.post<TurnRecord>(`/api/agent/${runId}/step`);
    return r.data;
  } catch (e) { return apiError(e); }
}

export async function runToCompletion(runId: string): Promise<RunState> {
  try {
    const r = await client.post<RunState>(`/api/agent/${runId}/run`);
    return r.data;
  } catch (e) { return apiError(e); }
}

export async function stopRun(runId: string): Promise<RunState> {
  try {
    const r = await client.post<RunState>(`/api/agent/${runId}/stop`);
    return r.data;
  } catch (e) { return apiError(e); }
}

export async function fetchRunState(runId: string): Promise<RunState> {
  try {
    const r = await client.get<RunState>(`/api/agent/${runId}`);
    return r.data;
  } catch (e) { return apiError(e); }
}

export async function fetchTurns(runId: string): Promise<TurnRecord[]> {
  try {
    const r = await client.get<TurnRecord[]>(`/api/agent/${runId}/turns`);
    return r.data;
  } catch (e) { return apiError(e); }
}

// ── World model ───────────────────────────────────────────────────────────────

export async function fetchWorld(runId: string): Promise<WorldStateResponse> {
  try {
    const r = await client.get<WorldStateResponse>(`/api/world/${runId}`);
    return r.data;
  } catch (e) { return apiError(e); }
}

export async function fetchWorldSlice(runId: string): Promise<WorldSliceResponse> {
  try {
    const r = await client.get<WorldSliceResponse>(`/api/world/${runId}/slice`);
    return r.data;
  } catch (e) { return apiError(e); }
}

export async function fetchBeliefs(
  runId: string,
  filters?: { entity?: string; attribute?: string; active?: boolean }
): Promise<{ run_id: string; count: number; beliefs: Belief[] }> {
  try {
    const r = await client.get(`/api/world/${runId}/beliefs`, { params: filters });
    return r.data as { run_id: string; count: number; beliefs: Belief[] };
  } catch (e) { return apiError(e); }
}

export async function fetchBeliefHistory(
  runId: string,
  entity: string,
  attribute: string
): Promise<{ run_id: string; entity: string; attribute: string; version_count: number; history: Belief[] }> {
  try {
    const r = await client.get(`/api/world/${runId}/belief-history`, { params: { entity, attribute } });
    return r.data as { run_id: string; entity: string; attribute: string; version_count: number; history: Belief[] };
  } catch (e) { return apiError(e); }
}

// ── Corrections ───────────────────────────────────────────────────────────────

export async function fetchCorrections(runId: string): Promise<CorrectionsResponse> {
  try {
    const r = await client.get<CorrectionsResponse>(`/api/corrections/${runId}`);
    return r.data;
  } catch (e) { return apiError(e); }
}

export async function runCorrectionDemo(): Promise<CorrectionDemoResponse> {
  try {
    const r = await client.post<CorrectionDemoResponse>('/api/demo/correction');
    return r.data;
  } catch (e) { return apiError(e); }
}

// ── Metrics ───────────────────────────────────────────────────────────────────

export async function fetchMetrics(runId: string): Promise<MetricsResponse> {
  try {
    const r = await client.get<MetricsResponse>(`/api/metrics/${runId}`);
    return r.data;
  } catch (e) { return apiError(e); }
}
