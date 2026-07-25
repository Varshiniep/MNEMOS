import { useState, useEffect, useCallback, useRef } from 'react';
import { startRun, stepRun, runToCompletion, stopRun, fetchRunState, fetchTurns } from '../../services/api';
import type { RunState, TurnRecord } from '../../types/api';
import { RunControls } from '../../components/ui/RunControls';
import { TurnTimeline } from '../../components/ui/TurnTimeline';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { useRunId } from '../../hooks/useRunId';
import { Activity, Terminal, Clock, Cpu } from 'lucide-react';

export function AgentRunPage() {
  const [runId, setRunId]       = useRunId();
  const [runState, setRunState] = useState<RunState | null>(null);
  const [turns, setTurns]       = useState<TurnRecord[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const pollingRef               = useRef<ReturnType<typeof setInterval> | null>(null);
  const [objective, setObjective]   = useState('Find the target object in the storage room');
  const [envType, setEnvType]       = useState<'demo' | 'textworld'>('demo');
  const [maxTurns, setMaxTurns]     = useState(20);
  const [useOllama, setUseOllama]   = useState(false);

  const refresh = useCallback(async (id: string) => {
    const [state, t] = await Promise.all([fetchRunState(id), fetchTurns(id)]);
    setRunState(state); setTurns(t); return state;
  }, []);

  useEffect(() => {
    if (!runId || runState?.status !== 'running') {
      if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
      return;
    }
    pollingRef.current = setInterval(() => { refresh(runId).catch(() => null); }, 2000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [runId, runState?.status, refresh]);

  useEffect(() => { if (runId) refresh(runId).catch(() => null); }, [runId, refresh]);

  const handleStart = async () => {
    setLoading(true); setError('');
    try {
      const res = await startRun({ objective, environment_type: envType, max_turns: maxTurns, use_ollama: useOllama });
      setRunId(res.run_id); await refresh(res.run_id);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  };
  const handleStep = async () => {
    if (!runId) return; setLoading(true); setError('');
    try { await stepRun(runId); await refresh(runId); }
    catch (e) { setError(e instanceof Error ? e.message : 'Step failed'); }
    finally { setLoading(false); }
  };
  const handleRun = async () => {
    if (!runId) return; setLoading(true); setError('');
    try { await runToCompletion(runId); await refresh(runId); }
    catch (e) { setError(e instanceof Error ? e.message : 'Run failed'); }
    finally { setLoading(false); }
  };
  const handleStop = async () => {
    if (!runId) return; setLoading(true); setError('');
    try { await stopRun(runId); await refresh(runId); }
    catch (e) { setError(e instanceof Error ? e.message : 'Stop failed'); }
    finally { setLoading(false); }
  };

  const lastTurn = turns.length > 0 ? turns[turns.length - 1] : null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <h2 className="text-2xl font-black text-white tracking-tight">Agent Run</h2>

      {/* Config */}
      <div className="card p-5 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Configuration</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Objective</label>
            <input value={objective} onChange={e => setObjective(e.target.value)}
              disabled={loading || runState?.status === 'running'}
              className="input-dark" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Environment</label>
            <select value={envType} onChange={e => setEnvType(e.target.value as 'demo' | 'textworld')}
              disabled={loading || runState?.status === 'running'}
              className="input-dark">
              <option value="demo">Demo (built-in)</option>
              <option value="textworld">TextWorld</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Max turns: {maxTurns}</label>
            <input type="range" min={1} max={100} value={maxTurns}
              onChange={e => setMaxTurns(Number(e.target.value))}
              disabled={loading || runState?.status === 'running'}
              className="w-full accent-indigo-500" />
          </div>
          <div className="flex items-center gap-2.5">
            <input type="checkbox" id="ollama" checked={useOllama}
              onChange={e => setUseOllama(e.target.checked)}
              disabled={loading || runState?.status === 'running'}
              className="accent-indigo-500 w-4 h-4" />
            <label htmlFor="ollama" className="text-sm text-slate-400">Use Ollama (local qwen2.5:3b)</label>
          </div>
        </div>
        <RunControls status={runState?.status ?? 'idle'}
          onStart={handleStart} onStep={handleStep} onRun={handleRun} onStop={handleStop} loading={loading} />
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>

      {/* Status strip */}
      {runState && (
        <div className="card p-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <Activity size={13} className="text-slate-600" />
              <StatusBadge status={runState.status} />
            </div>
            <Stat icon={<Cpu size={12} />}     label="Run ID"  value={runState.run_id} mono />
            <Stat icon={<Terminal size={12} />} label="Room"   value={runState.current_room || '—'} />
            <Stat icon={<Clock size={12} />}    label="Turns"  value={String(runState.turn_count)} />
            <Stat                               label="Reward" value={runState.total_reward.toFixed(1)} />
          </div>
        </div>
      )}

      {/* Three-panel layout */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Observation */}
        <div className="card p-5 space-y-3 lg:col-span-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Terminal size={13} />Latest Observation
          </h3>
          {loading && !lastTurn ? <LoadingState message="Waiting for turn…" /> :
           lastTurn ? (
            <div className="space-y-3">
              <pre className="font-mono text-xs text-green-300 p-4 rounded-xl leading-relaxed overflow-y-auto max-h-52 whitespace-pre-wrap"
                style={{ background: '#020817', border: '1px solid rgba(16,185,129,0.15)' }}>
                {lastTurn.observation}
              </pre>
              {lastTurn.action && lastTurn.action !== '[reset]' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">Action:</span>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-lg"
                    style={{ background: 'rgba(79,70,229,0.15)', color: '#a78bfa', border: '1px solid rgba(79,70,229,0.25)' }}>
                    {lastTurn.action}
                  </span>
                  {lastTurn.reward > 0 && (
                    <span className="badge badge-green ml-2">+{lastTurn.reward} reward</span>
                  )}
                </div>
              )}
              {lastTurn.corrections.length > 0 && (
                <div className="p-3 rounded-xl space-y-1"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <p className="text-xs font-semibold text-amber-400">{lastTurn.corrections.length} correction(s) this turn</p>
                  {lastTurn.corrections.map((c, i) => (
                    <p key={i} className="text-xs text-amber-500 font-mono">
                      {c.entity}.{c.attribute}: {String(c.old_value)} → {String(c.new_value)}
                    </p>
                  ))}
                </div>
              )}
            </div>
           ) : <p className="text-sm text-slate-600">Start a run to see observations.</p>}
        </div>

        {/* Timeline */}
        <div className="card p-5 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Clock size={13} />Turn Timeline
          </h3>
          <div className="max-h-80 overflow-y-auto space-y-1">
            <TurnTimeline turns={turns} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, mono, icon }: { label: string; value: string; mono?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon && <span className="text-slate-600">{icon}</span>}
      <span className="text-xs text-slate-600">{label}:</span>
      <span className={`text-xs text-slate-300 font-medium ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
