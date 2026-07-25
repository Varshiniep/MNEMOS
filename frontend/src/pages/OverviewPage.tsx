import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Zap, Globe, Brain, GitBranch } from 'lucide-react';
import { fetchHealth, startRun } from '../services/api';
import type { HealthResponse } from '../types/api';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState } from '../components/LoadingState';
import { useRunId } from '../hooks/useRunId';

export function OverviewPage() {
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [runId, setRunId] = useRunId();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const h = await fetchHealth();
      setHealth(h);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cannot connect to backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleStartDemo = async () => {
    setStarting(true);
    try {
      const res = await startRun({
        objective: 'Find the target object in the storage room',
        environment_type: 'demo',
        max_turns: 20,
        use_ollama: health?.ollama_available ?? false,
      });
      setRunId(res.run_id);
      navigate('/run');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start run');
    } finally {
      setStarting(false);
    }
  };

  if (loading) return (
    <div className="p-8"><LoadingState message="Connecting to MNEMOS backend…" /></div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">MNEMOS</h1>
            <p className="text-sm text-slate-500 mt-0.5">Self-Correcting Bounded-Context World Model</p>
          </div>
          <button onClick={load} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error} — make sure the backend is running: <code className="font-mono">uvicorn mnemos.api.app:app --reload --port 8000</code>
        </div>
      )}

      {/* System status */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">System Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatusRow label="Backend"     status={health ? 'ok' : 'offline'} />
          <StatusRow label="Ollama"      status={health?.ollama_available ? 'online' : 'offline'} />
          <StatusRow label="Demo env"    status={health?.demo_available ? 'ok' : 'error'} />
          <StatusRow label="TextWorld"   status={health?.textworld_available ? 'ok' : 'offline'} />
        </div>
        {health && (
          <div className="text-xs text-slate-400 space-y-0.5">
            <p>Ollama URL: <span className="font-mono">{health.ollama_url}</span></p>
            <p>Model: <span className="font-mono text-indigo-600">{health.model}</span></p>
            {!health.ollama_available && (
              <p className="text-amber-600">
                Ollama offline — agent will use deterministic fallback (no LLM needed for demo).
              </p>
            )}
          </div>
        )}
      </section>

      {/* Quick start */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Quick Start</h2>
        {runId && (
          <div className="text-xs bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 text-indigo-700">
            Active run: <span className="font-mono font-bold">{runId}</span>
            <button onClick={() => navigate('/run')} className="ml-3 underline">Go to run →</button>
          </div>
        )}
        <button
          onClick={handleStartDemo}
          disabled={starting || !health}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition text-sm font-medium"
        >
          <Zap size={15} />
          {starting ? 'Starting…' : 'Start Demo Run'}
        </button>
        <p className="text-xs text-slate-400">
          Starts the built-in demo environment (no Ollama required). You can also configure a custom run on the Agent Run page.
        </p>
      </section>

      {/* Feature overview */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">What MNEMOS Does</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FeatureCard icon={<Brain size={18} className="text-indigo-500" />}
            title="Bounded Context"
            desc="Only the relevant world slice is sent to the agent — never the full history." />
          <FeatureCard icon={<GitBranch size={18} className="text-amber-500" />}
            title="Self-Correction"
            desc="Contradicting observations trigger belief corrections with a full audit trail." />
          <FeatureCard icon={<Globe size={18} className="text-green-500" />}
            title="World Model"
            desc="Structured beliefs about rooms, objects, and states, persisted as JSON." />
        </div>
      </section>
    </div>
  );
}

function StatusRow({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
      <span className="text-xs text-slate-500">{label}</span>
      <StatusBadge status={status} size="sm" />
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
      <div className="flex items-center gap-2">{icon}<span className="font-medium text-sm text-slate-700">{title}</span></div>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  );
}
