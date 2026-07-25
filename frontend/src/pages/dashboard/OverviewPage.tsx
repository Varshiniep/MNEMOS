import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Zap, Brain, GitBranch, Globe, Activity, Target, Layers } from 'lucide-react';
import { fetchHealth, startRun } from '../../services/api';
import type { HealthResponse } from '../../types/api';
import { MetricCard } from '../../components/ui/MetricCard';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useRunId } from '../../hooks/useRunId';
import { NodeGraph } from '../../components/brand/NodeGraph';

export function OverviewPage() {
  const navigate = useNavigate();
  const [health, setHealth]     = useState<HealthResponse | null>(null);
  const [loading, setLoading]   = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError]       = useState('');
  const [runId, setRunId]       = useRunId();

  const load = useCallback(async () => {
    try { setLoading(true); setError(''); setHealth(await fetchHealth()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Cannot connect to backend'); }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await startRun({
        objective: 'Find the target object in the storage room',
        environment_type: 'demo', max_turns: 20,
        use_ollama: health?.ollama_available ?? false,
      });
      setRunId(res.run_id); navigate('/dashboard/run');
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally     { setStarting(false); }
  };

  if (loading) return <div className="p-8"><LoadingState message="Connecting to MNEMOS backend…" /></div>;

  return (
    <div style={{ padding:'28px 32px', maxWidth:1100, margin:'0 auto' }}>
      {/* Page header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:32 }}>
        <div>
          <p className="label-overline" style={{ marginBottom:6 }}>Dashboard</p>
          <h2 style={{ fontSize:'clamp(1.5rem,3vw,2.2rem)', fontWeight:900, letterSpacing:'-0.04em', color:'#fff' }}>
            System Overview
          </h2>
        </div>
        <button onClick={load} className="btn-ghost" style={{ padding:'7px' }} aria-label="Refresh">
          <RefreshCw size={14} />
        </button>
      </div>

      {error && (
        <div style={{ marginBottom:24 }}>
          <ErrorState message={`${error} — run: uvicorn mnemos.api.app:app --reload --port 8000`} retry={load} />
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginBottom:24 }}>
        <MetricCard label="Active Beliefs"  value="—" icon={<Brain size={13} style={{ color:'#8b5cf6' }} />} accent />
        <MetricCard label="Corrections"     value="—" icon={<GitBranch size={13} style={{ color:'#f59e0b' }} />} />
        <MetricCard label="Context Tokens"  value="—" icon={<Layers size={13} style={{ color:'#06b6d4' }} />} />
        <MetricCard label="Current Turn"    value="—" icon={<Activity size={13} style={{ color:'#10b981' }} />} />
      </div>

      {/* Main panels */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        {/* System health */}
        <div className="card" style={{ padding:20 }}>
          <p className="label-overline" style={{ marginBottom:16 }}>System Status</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { label:'Backend API',  status: health ? 'ok'     : 'offline',  color: health ? '#10b981' : '#ef4444' },
              { label:'Ollama LLM',   status: health?.ollama_available ? 'online' : 'offline', color: health?.ollama_available ? '#10b981' : '#ef4444' },
              { label:'Demo Env',     status: health?.demo_available ? 'ok' : 'error', color: health?.demo_available ? '#10b981' : '#ef4444' },
              { label:'TextWorld',    status: health?.textworld_available ? 'ok' : 'offline', color: health?.textworld_available ? '#10b981' : '#374151' },
            ].map(({ label, status, color }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:10, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize:13, color:'#4b5563' }}>{label}</span>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:color, boxShadow:`0 0 6px ${color}` }} />
                  <span className="mono" style={{ fontSize:9, color, letterSpacing:'0.1em' }}>
                    {status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {health && (
            <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.04)' }}>
              <p className="mono" style={{ fontSize:9, color:'#2d3748' }}>
                OLLAMA: {health.ollama_url}
              </p>
              <p className="mono" style={{ fontSize:9, color:'#6366f1', marginTop:4 }}>
                MODEL: {health.model.toUpperCase()}
              </p>
              {!health.ollama_available && (
                <p className="mono" style={{ fontSize:9, color:'#d97706', marginTop:6, lineHeight:1.5 }}>
                  OLLAMA OFFLINE — DETERMINISTIC FALLBACK ACTIVE
                </p>
              )}
            </div>
          )}
        </div>

        {/* World graph */}
        <div className="card" style={{ padding:20, display:'flex', flexDirection:'column', gap:12 }}>
          <p className="label-overline">World Graph</p>
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <NodeGraph width={260} height={170} animate />
          </div>
          <p className="mono" style={{ fontSize:9, color:'#2d3748', textAlign:'center', letterSpacing:'0.1em' }}>
            DEMO WORLD · HALL · KITCHEN · STORAGE ROOM
          </p>
        </div>
      </div>

      {/* Quick start */}
      <div className="card" style={{ padding:24, borderColor:'rgba(99,102,241,0.25)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
          <div style={{ width:42, height:42, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.2)', flexShrink:0 }}>
            <Target size={18} style={{ color:'#6366f1' }} />
          </div>
          <div>
            <p style={{ fontWeight:700, color:'#fff', fontSize:14 }}>Start Demo Run</p>
            <p className="mono" style={{ fontSize:10, color:'#374151', marginTop:2 }}>
              OBJECTIVE: FIND TARGET OBJECT IN STORAGE ROOM
            </p>
          </div>
        </div>
        {runId && (
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.15)', marginBottom:14 }}>
            <span className="mono" style={{ fontSize:10, color:'#4b5563' }}>ACTIVE RUN:</span>
            <span className="mono" style={{ fontSize:11, color:'#6366f1' }}>{runId.toUpperCase()}</span>
            <button onClick={() => navigate('/dashboard/run')}
              style={{ marginLeft:'auto', fontSize:11, color:'#6366f1', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>
              Resume →
            </button>
          </div>
        )}
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={handleStart} disabled={starting || !health} className="btn-primary">
            <Zap size={14} />{starting ? 'Starting…' : 'LAUNCH DEMO RUN'}
          </button>
          <button onClick={() => navigate('/dashboard/run')} className="btn-outline">
            Configure
          </button>
        </div>
      </div>

      {/* Feature cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginTop:20 }}>
        {[
          { icon: Brain,    color:'#8b5cf6', title:'BOUNDED CONTEXT',   desc:'Only relevant facts reach the agent — never the full history.' },
          { icon: GitBranch,color:'#f59e0b', title:'SELF-CORRECTION',   desc:'Contradictions are detected and corrected with a full audit trail.' },
          { icon: Globe,    color:'#10b981', title:'WORLD MODEL',       desc:'Structured beliefs persisted as JSON. Queryable, versioned, transparent.' },
        ].map(({ icon: Icon, color, title, desc }) => (
          <div key={title} className="card card-hover p-5 space-y-3">
            <Icon size={18} style={{ color }} />
            <p className="label-overline" style={{ color }}>{title}</p>
            <p style={{ fontSize:12, color:'#2d3748', lineHeight:1.6 }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
