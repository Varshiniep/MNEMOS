import { useState, useEffect, useCallback } from 'react';
import { fetchWorldSlice } from '../services/api';
import type { WorldSliceResponse } from '../types/api';
import { ContextViewer } from '../components/ContextViewer';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { useRunId } from '../hooks/useRunId';
import { RefreshCw } from 'lucide-react';

export function BoundedContextPage() {
  const [runId]     = useRunId();
  const [data, setData]       = useState<WorldSliceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    if (!runId) return;
    setLoading(true); setError('');
    try { setData(await fetchWorldSlice(runId)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to load slice'); }
    finally { setLoading(false); }
  }, [runId]);

  useEffect(() => { void load(); }, [load]);

  if (!runId) return (
    <div className="p-8">
      <EmptyState title="No active run" message="Start a run on the Agent Run page first." />
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Bounded Context</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Exactly what the agent sees — nothing more.
          </p>
        </div>
        <button onClick={load} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition">
          <RefreshCw size={16} />
        </button>
      </div>

      {loading && <LoadingState />}
      {error   && <ErrorState message={error} retry={load} />}
      {!loading && !error && !data && (
        <EmptyState
          title="No slice available"
          message="Execute at least one step so the agent builds its first bounded context."
        />
      )}
      {data && <ContextViewer slice={data.slice} />}
    </div>
  );
}
