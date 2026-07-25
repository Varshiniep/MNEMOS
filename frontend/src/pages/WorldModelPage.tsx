import { useState, useEffect, useCallback } from 'react';
import { fetchWorld, fetchBeliefs } from '../services/api';
import type { WorldStateResponse, Belief } from '../types/api';
import { BeliefTable } from '../components/BeliefTable';
import { MetricCard } from '../components/MetricCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { useRunId } from '../hooks/useRunId';
import { RefreshCw } from 'lucide-react';

export function WorldModelPage() {
  const [runId]       = useRunId();
  const [data, setData]           = useState<WorldStateResponse | null>(null);
  const [beliefs, setBeliefs]     = useState<Belief[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [filter, setFilter]       = useState('');
  const [activeOnly, setActiveOnly] = useState(false);

  const load = useCallback(async () => {
    if (!runId) return;
    setLoading(true); setError('');
    try {
      const [world, bl] = await Promise.all([
        fetchWorld(runId),
        fetchBeliefs(runId),
      ]);
      setData(world);
      setBeliefs(bl.beliefs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load world model');
    } finally { setLoading(false); }
  }, [runId]);

  useEffect(() => { void load(); }, [load]);

  const filtered = beliefs.filter(b => {
    if (activeOnly && !b.active) return false;
    if (!filter) return true;
    const q = filter.toLowerCase();
    return b.entity.toLowerCase().includes(q) ||
           b.attribute.toLowerCase().includes(q) ||
           String(b.value).toLowerCase().includes(q);
  });

  if (!runId) return (
    <div className="p-8">
      <EmptyState title="No active run" message="Start a run on the Agent Run page first." />
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">World Model</h1>
        <button onClick={load} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition">
          <RefreshCw size={16} />
        </button>
      </div>

      {error && <ErrorState message={error} retry={load} />}

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Total Beliefs"    value={data.belief_count} />
          <MetricCard label="Active"           value={data.active_beliefs} accent />
          <MetricCard label="Superseded"       value={data.superseded_beliefs} />
          <MetricCard label="Corrections"      value={data.correction_count} />
        </div>
      )}

      {/* Beliefs table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input
            placeholder="Search entity / attribute / value…"
            value={filter} onChange={e => setFilter(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 min-w-[180px]"
          />
          <label className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={activeOnly} onChange={e => setActiveOnly(e.target.checked)} />
            Active only
          </label>
          <span className="text-xs text-slate-400">{filtered.length} of {beliefs.length}</span>
        </div>

        {loading ? <LoadingState /> :
         filtered.length === 0 ? (
           <EmptyState title="No beliefs" message="Beliefs will appear here as the agent explores." />
         ) : (
           <BeliefTable beliefs={filtered} showSuperseded={!activeOnly} />
         )}
      </div>
    </div>
  );
}
