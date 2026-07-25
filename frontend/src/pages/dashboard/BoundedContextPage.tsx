import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Layers } from 'lucide-react';
import { fetchWorldSlice } from '../../services/api';
import type { WorldSliceResponse } from '../../types/api';
import { ContextViewer } from '../../components/ui/ContextViewer';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { useRunId } from '../../hooks/useRunId';

export function BoundedContextPage() {
  const [runId]               = useRunId();
  const [data, setData]       = useState<WorldSliceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    if (!runId) return;
    setLoading(true); setError('');
    try { setData(await fetchWorldSlice(runId)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }, [runId]);

  useEffect(() => { void load(); }, [load]);

  if (!runId) return (
    <div className="p-8">
      <EmptyState title="No active run" message="Start a run to generate the bounded context slice."
        icon={<Layers size={22} />} />
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Bounded Context</h2>
          <p className="text-sm text-slate-500 mt-0.5">Exactly what the agent sees — nothing more</p>
        </div>
        <button onClick={load} className="btn-ghost p-2" aria-label="Refresh"><RefreshCw size={15} /></button>
      </div>

      {loading && <LoadingState />}
      {error   && <ErrorState message={error} retry={load} />}
      {!loading && !error && !data && (
        <EmptyState title="No slice available"
          message="Execute at least one step so the agent builds its first bounded context." />
      )}
      {data && <ContextViewer slice={data.slice} />}
    </div>
  );
}
