import { useState, useEffect, useCallback, useRef } from 'react';
import { startRun, stepRun, runToCompletion, stopRun, fetchRunState, fetchTurns } from '../../services/api';
import type { RunState, TurnRecord } from '../../types/api';
import { RunControls } from '../../components/ui/RunControls';
import { TurnTimeline } from '../../components/ui/TurnTimeline';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { useRunId } from '../../hooks/useRunId';
import { Activity, Terminal, Clock, Cpu } from 'lucide-react';

const PANEL: React.CSSProperties = {
  background: 'rgba(8,10,22,0.9)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: 14,
  padding: 20,
};

export function AgentRunPage() {
  const [runId, setRunId]       = useRunId();
  const [runState, setRunState] = useState<RunState | null>(null);
  const [turns, setTurns]       = useState<TurnRecord[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const pollingRef               = useRef<ReturnType<typeof setInterval> | null>(null);
  const [objective, setObjective] = useState('Find the target object in the storage room');
  const [envType, setEnvType]     = useState<'demo' | 'textworld'>('demo');
  const [maxTurns, setMaxTurns]   = useState(20);
  const [useOllama, setUseOllama] = useState(false);

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
    <div style={{ padding:'28px 32px', maxWidth:1200, margin:'0 auto' }}>
      <div style={{ marginBottom:28 }}>
        <p className="label-overline" style={{ marginBottom:6 }}>Agent Control</p>
        <h2 style={{ fontSize:'clamp(1.5rem,3vw,2.2rem)', fontWeight:900, letterSpacing:'-0.04em', color:'#fff' }}>
          Agent Run
        </h2>
      </div>

      {/* Config panel */}
      <div style={{ ...PANEL, marginBottom:16 }}>
        <p className="label-overline" style={{ marginBottom:14 }}>Configuration</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={{ display:'block', fontSize:10, color:'#374151', marginBottom:6, letterSpacing:'0.08em', fontFamily:'monospace' }}>OBJECTIVE</label>
            <input value={objective} onChange={e => setObjective(e.target.value)}
              disabled={loading || runState?.status === 'running'}
              className="input-dark" />
          </div>
          <div>
            <label style={{ display:'block', fontSize:10, color:'#374151', marginBottom:6, letterSpacing:'0.08em', fontFamily:'monospace' }}>ENVIRONMENT</label>
            <select value={envType} onChange={e => setEnvType(e.target.value as 'demo' | 'textworld')}
              disabled={loading || runState?.status === 'running'}
              className="input-dark">
              <option value="demo">Demo (built-in)</option>
              <option value="textworld">TextWorld</option>
            </select>
          </div>
          <div>
            <label style={{ display:'block', fontSize:10, color:'#374151', marginBottom:6, letterSpacing:'0.08em', fontFamily:'monospace' }}>
              MAX TURNS: {maxTurns}
            </label>
            <input type="range" min={1} max={100} value={maxTurns}
              onChange={e => setMaxTurns(Number(e.target.value))}
              disabled={loading || runState?.status === 'running'}
              style={{ width:'100%', accentColor:'#8b5cf6' }} />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <input type="checkbox" id="ollama" checked={useOllama}
              onChange={e => setUseOllama(e.target.checked)}
              disabled={loading || runState?.status === 'running'}
              style={{ accentColor:'#8b5cf6', width:16, height:16 }} />
            <label htmlFor="ollama" style={{ fontSize:13, color:'#4b5563' }}>Use Ollama (qwen2.5:3b)</label>
          </div>
        </div>
        <RunControls status={runState?.status ?? 'idle'}
          onStart={handleStart} onStep={handleStep} onRun={handleRun} onStop={handleStop} loading={loading} />
        {error && <p className="mono" style={{ fontSize:11, color:'#ef4444', marginTop:10 }}>{error}</p>}
      </div>

      {/* Status strip */}
      {runState && (
        <div style={{ ...PANEL, marginBottom:16 }}>
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Activity size={13} style={{ color:'#374151' }} />
              <StatusBadge status={runState.status} />
            </div>
            <S icon={<Cpu size={11} />}      label="RUN" value={runState.run_id} mono />
            <S icon={<Terminal size={11} />}  label="ROOM" value={runState.current_room || '—'} />
            <S icon={<Clock size={11} />}     label="TURNS" value={String(runState.turn_count)} mono />
            <S                                label="REWARD" value={runState.total_reward.toFixed(1)} mono />
          </div>
        </div>
      )}

      {/* Three panels */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14 }}>
        {/* Observation */}
        <div style={PANEL}>
          <p className="label-overline" style={{ marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
            <Terminal size={11} />LATEST OBSERVATION
          </p>
          {loading && !lastTurn ? <LoadingState message="Waiting for turn…" /> :
           lastTurn ? (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <pre className="code-block" style={{ maxHeight:200, overflow:'auto' }}>{lastTurn.observation}</pre>
              {lastTurn.action && lastTurn.action !== '[reset]' && (
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span className="mono" style={{ fontSize:10, color:'#2d3748' }}>ACTION:</span>
                  <span className="mono" style={{ fontSize:12, padding:'5px 10px', borderRadius:8, background:'rgba(139,92,246,0.1)', color:'#a78bfa', border:'1px solid rgba(139,92,246,0.2)' }}>
                    {lastTurn.action}
                  </span>
                  {lastTurn.reward > 0 && (
                    <span className="badge badge-green mono" style={{ fontSize:9 }}>+{lastTurn.reward} REWARD</span>
                  )}
                </div>
              )}
              {lastTurn.corrections.length > 0 && (
                <div style={{ padding:12, borderRadius:10, background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.18)' }}>
                  <p className="mono" style={{ fontSize:9, color:'#f59e0b', marginBottom:6 }}>
                    {lastTurn.corrections.length} CORRECTION(S) THIS TURN
                  </p>
                  {lastTurn.corrections.map((c, i) => (
                    <p key={i} className="mono" style={{ fontSize:11, color:'#d97706' }}>
                      {c.entity}.{c.attribute}: {String(c.old_value)} → {String(c.new_value)}
                    </p>
                  ))}
                </div>
              )}
            </div>
           ) : (
            <p style={{ fontSize:13, color:'#2d3748' }}>Start a run to see observations.</p>
          )}
        </div>

        {/* Timeline */}
        <div style={PANEL}>
          <p className="label-overline" style={{ marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
            <Clock size={11} />TURN TIMELINE
          </p>
          <div style={{ maxHeight:380, overflowY:'auto' }}>
            <TurnTimeline turns={turns} />
          </div>
        </div>
      </div>
    </div>
  );
}

function S({ label, value, mono, icon }: { label: string; value: string; mono?: boolean; icon?: React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      {icon && <span style={{ color:'#374151' }}>{icon}</span>}
      <span className="mono" style={{ fontSize:9, color:'#2d3748', letterSpacing:'0.1em' }}>{label}:</span>
      <span className={mono ? 'mono' : ''} style={{ fontSize:12, color:'#4b5563', fontWeight:500 }}>{value}</span>
    </div>
  );
}
