import { useState, useEffect, useCallback, useRef } from 'react';
import { startRun, stepRun, runToCompletion, stopRun, fetchRunState, fetchTurns } from '../services/api';
import type { RunState, TurnRecord } from '../types/api';
import { RunControls } from '../components/RunControls';
import { TurnTimeline } from '../components/TurnTimeline';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState } from '../components/LoadingState';
import { useRunId } from '../hooks/useRunId';

export function AgentRunPage() {
  const [runId, setRunId] = useRunId();
  const [runState, setRunState] = useState<RunState | null>(null);
  const [turns, setTurns]       = useState<TurnRecord[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const pollingRef               = useRef<ReturnType<typeof setInterval> | null>(null);

  // Config form
  const [objective, setObjective]   = useState('Find the target object in the storage room');
  const [envType, setEnvType]       = useState<'demo' | 'textworld'>('demo');
  const [maxTurns, setMaxTurns]     = useState(20);
  const [useOllama, setUseOllama]   = useState(false);

  const refresh = useCallback(async (id: string) => {
    const [state, t] = await Promise.all([fetchRunState(id), fetchTurns(id)]);
    setRunState(state);
    setTurns(t);
    return state;
  }, []);

  // Poll while running
  useEffect(() => {
    if (!runId || runState?.status !== 'running') {
      if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
      return;
    }
    pollingRef.current = setInterval(() => {
      refresh(runId).catch(() => null);
    }, 2000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [runId, runState?.status, refresh]);

  // Load existing run on mount
  useEffect(() => {
    if (runId) { refresh(runId).catch(() => null); }
  }, [runId, refresh]);

  const handleStart = async () => {
    setLoading(true); setError('');
    try {
      const res = await startRun({ objective, environment_type: envType, max_turns: maxTurns, use_ollama: useOllama });
      setRunId(res.run_id);
      await refresh(res.run_id);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to start'); }
    finally { setLoading(false); }
  };

  const handleStep = async () => {
    if (!runId) return;
    setLoading(true); setError('');
    try { await stepRun(runId); await refresh(runId); }
    catch (e) { setError(e instanceof Error ? e.message : 'Step failed'); }
    finally { setLoading(false); }
  };

  const handleRun = async () => {
    if (!runId) return;
    setLoading(true); setError('');
    try {
      await runToCompletion(runId);
      await refresh(runId);
    } catch (e) { setError(e instanceof Error ? e.message : 'Run failed'); }
    finally { setLoading(false); }
  };

  const handleStop = async () => {
    if (!runId) return;
    setLoading(true); setError('');
    try { await stopRun(runId); await refresh(runId); }
    catch (e) { setError(e instanceof Error ? e.message : 'Stop failed'); }
    finally { setLoading(false); }
  };

  const lastTurn = turns.length > 0 ? turns[turns.length - 1] : null;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <h1 className="text-xl font-bold text-slate-800">Agent Run</h1>

      {/* Config */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-500 block mb-1">Objective</label>
            <input
              value={objective} onChange={e => setObjective(e.target.value)}
              disabled={loading || runState?.status === 'running'}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Environment</label>
            <select
              value={envType} onChange={e => setEnvType(e.target.value as 'demo' | 'textworld')}
              disabled={loading || runState?.status === 'running'}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="demo">Demo (built-in)</option>
              <option value="textworld">TextWorld</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Max turns: {maxTurns}</label>
            <input type="range" min={1} max={100} value={maxTurns}
              onChange={e => setMaxTurns(Number(e.target.value))}
              disabled={loading || runState?.status === 'running'}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="ollama" checked={useOllama}
              onChange={e => setUseOllama(e.target.checked)}
              disabled={loading || runState?.status === 'running'}
              className="rounded"
            />
            <label htmlFor="ollama" className="text-sm text-slate-600">Use Ollama (requires local model)</label>
          </div>
        </div>

        <RunControls
          status={runState?.status ?? 'idle'}
          onStart={handleStart} onStep={handleStep}
          onRun={handleRun}    onStop={handleStop}
          loading={loading}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      {/* Status strip */}
      {runState && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status</span>
              <StatusBadge status={runState.status} />
            </div>
            <Stat label="Run ID"   value={runState.run_id} mono />
            <Stat label="Room"     value={runState.current_room || '—'} />
            <Stat label="Turns"    value={String(runState.turn_count)} />
            <Stat label="Reward"   value={runState.total_reward.toFixed(1)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Latest observation */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Latest Observation</h2>
          {loading && !lastTurn ? <LoadingState message="Waiting…" /> :
            lastTurn ? (
              <div className="space-y-3">
                <pre className="whitespace-pre-wrap font-mono text-xs text-slate-700 bg-slate-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {lastTurn.observation}
                </pre>
                {lastTurn.action && lastTurn.action !== '[reset]' && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Action taken</p>
                    <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">{lastTurn.action}</span>
                  </div>
                )}
                {lastTurn.corrections.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                    <p className="text-xs font-medium text-amber-700">{lastTurn.corrections.length} correction(s) this turn</p>
                    {lastTurn.corrections.map((c, i) => (
                      <p key={i} className="text-xs text-amber-600 mt-0.5">
                        {c.entity}.{c.attribute}: {String(c.old_value)} → {String(c.new_value)}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Start a run to see observations.</p>
            )}
        </div>

        {/* Turn timeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Turn Timeline</h2>
          <div className="max-h-80 overflow-y-auto">
            <TurnTimeline turns={turns} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-sm font-medium text-slate-700 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}
