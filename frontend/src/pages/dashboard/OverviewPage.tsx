import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw, Zap, Brain, GitBranch, Globe,
  Activity, Target, Layers, AlertTriangle, BarChart2,
} from 'lucide-react';
import { fetchHealth, startRun } from '../../services/api';
import type { HealthResponse } from '../../types/api';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useRunId } from '../../hooks/useRunId';
import { NodeGraph } from '../../components/brand/NodeGraph';

export function OverviewPage() {
  const navigate = useNavigate();
  const [health, setHealth]   = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError]     = useState('');
  const [runId, setRunId]     = useRunId();

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
        environment_type: 'demo',
        max_turns: 20,
        use_ollama: health?.ollama_available ?? false,
      });
      setRunId(res.run_id);
      navigate('/dashboard/run');
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to start'); }
    finally     { setStarting(false); }
  };

  if (loading) return <div className="p-8"><LoadingState message="Connecting to MNEMOS backend…" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Overview</h2>
          <p className="text-sm text-slate-500 mt-0.5">System status and quick actions</p>
        </div>
        <button onClick={load} className="btn-ghost p-2" aria-label="Refresh">
          <RefreshCw size={15} />
        </button>
      </div>

      {error && <ErrorState message={`${error} — run: uvicorn mnemos.api.app:app --reload --port 8000`} retry={load} />}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Active Beliefs"  value="—" icon={<Brain size={14} className="text-indigo-400" />} accent />
        <MetricCard label="Corrections"     value="—" icon={<GitBranch size={14} className="text-amber-400" />} />
        <MetricCard label="Context Tokens"  value="—" icon={<Layers size={14} className="text-cyan-400" />} />
        <MetricCard label="Turn"            value="—" icon={<Activity size={14} className="text-violet-400" />} />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* System health */}
        <div className="lg:col-span-2 card p-5 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">System Status</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Backend API',  status: health ? 'ok'     : 'offline' },
              { label: 'Ollama LLM',   status: health?.ollama_available ? 'online' : 'offline' },
              { label: 'Demo Env',     status: health?.demo_available   ? 'ok'     : 'error' },
              { label: 'TextWorld',    status: health?.textworld_available ? 'ok'   : 'offline' },
            ].map(({ label, status }) => (
              <div key={label}
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-sm text-slate-400">{label}</span>
                <StatusBadge status={status} size="sm" />
              </div>
            ))}
          </div>
          {health && (
            <div className="pt-2 border-t space-y-1 text-xs text-slate-600"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <p>Ollama: <span className="font-mono text-slate-400">{health.ollama_url}</span></p>
              <p>Model: <span className="font-mono text-indigo-400">{health.model}</span></p>
              {!health.ollama_available && (
                <p className="text-amber-500">Ollama offline — deterministic fallback active. Demo runs without LLM.</p>
              )}
            </div>
          )}
        </div>

        {/* World graph preview */}
        <div className="card p-5 flex flex-col items-center justify-center gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 self-start">World Graph</h3>
          <NodeGraph width={220} height={160} animate />
          <p className="text-xs text-slate-600 text-center">Demo world: Hall · Kitchen · Storage Room</p>
        </div>
      </div>

      {/* Quick start */}
      <div className="card p-6 space-y-4" style={{ borderColor: 'rgba(79,70,229,0.3)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(79,70,229,0.2)', border: '1px solid rgba(79,70,229,0.3)' }}>
            <Target size={18} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Start a Demo Run</h3>
            <p className="text-xs text-slate-500">Objective: find the target object in the storage room</p>
          </div>
        </div>
        {runId && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs"
            style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)' }}>
            <span className="text-indigo-400">Active run:</span>
            <span className="font-mono text-indigo-300">{runId}</span>
            <button onClick={() => navigate('/dashboard/run')}
              className="ml-auto text-indigo-400 hover:text-indigo-300 transition-colors">
              Resume →
            </button>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <button onClick={handleStart} disabled={starting || !health} className="btn-primary">
            <Zap size={15} />{starting ? 'Starting…' : 'Start Demo Run'}
          </button>
          <button onClick={() => navigate('/dashboard/run')} className="btn-outline">
            Configure Run
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: Brain,         color: '#818cf8', title: 'Bounded Context',  desc: 'Only relevant world facts reach the agent — never the full history.' },
          { icon: GitBranch,     color: '#fbbf24', title: 'Self-Correction',  desc: 'Contradictions are detected and corrected with a full audit trail.' },
          { icon: Globe,         color: '#34d399', title: 'World Model',      desc: 'Structured beliefs persisted as JSON. Queryable, versioned, transparent.' },
        ].map(({ icon: Icon, color, title, desc }) => (
          <div key={title} className="card card-hover p-5 space-y-3">
            <Icon size={20} style={{ color }} />
            <p className="font-semibold text-white text-sm">{title}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
