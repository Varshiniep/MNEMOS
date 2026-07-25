import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Search, Globe } from 'lucide-react';
import { fetchWorld, fetchBeliefs } from '../../services/api';
import type { WorldStateResponse, Belief } from '../../types/api';
import { BeliefTable } from '../../components/ui/BeliefTable';
import { MetricCard } from '../../components/ui/MetricCard';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { useRunId } from '../../hooks/useRunId';

export function WorldModelPage() {
  const [runId]                 = useRunId();
  const [data, setData]         = useState<WorldStateResponse | null>(null);
  const [beliefs, setBeliefs]   = useState<Belief[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState('');
  const [activeOnly, setActiveOnly] = useState(false);

  const load = useCallback(async () => {
    if (!runId) return;
    setLoading(true); setError('');
    try {
      const [world, bl] = await Promise.all([fetchWorld(runId), fetchBeliefs(runId)]);
      setData(world); setBeliefs(bl.beliefs);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
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
      <EmptyState title="No active run" message="Start a run from the Agent Run page to populate the world model."
        icon={<Globe size={22} />} />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">World Model</h2>
          <p className="text-sm text-slate-500 mt-0.5">All structured beliefs about the current world</p>
        </div>
        <button onClick={load} className="btn-ghost p-2" aria-label="Refresh"><RefreshCw size={15} /></button>
      </div>

      {error && <ErrorState message={error} retry={load} />}

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Total Beliefs"   value={data.belief_count} />
          <MetricCard label="Active"          value={data.active_beliefs} accent />
          <MetricCard label="Superseded"      value={data.superseded_beliefs} />
          <MetricCard label="Corrections"     value={data.correction_count} />
        </div>
      )}

      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 flex flex-wrap items-center gap-3"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="relative flex-1 min-w-[180px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              placeholder="Search entity, attribute, value…"
              value={filter} onChange={e => setFilter(e.target.value)}
              className="input-dark pl-8 py-2"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input type="checkbox" checked={activeOnly}
              onChange={e => setActiveOnly(e.target.checked)}
              className="accent-indigo-500 w-3.5 h-3.5" />
            Active only
          </label>
          <span className="text-xs text-slate-600">{filtered.length} of {beliefs.length}</span>
        </div>

        {loading ? <LoadingState /> :
         filtered.length === 0 ? (
           <div className="py-8">
             <EmptyState title="No beliefs found" message="Beliefs are created as the agent explores the environment." />
           </div>
         ) : (
           <BeliefTable beliefs={filtered} showSuperseded={!activeOnly} />
         )}
      </div>
    </div>
  );
}
