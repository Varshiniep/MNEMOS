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
    if (!runId) return; setLoading(true); setError('');
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
    <div style={{ padding:'28px 32px', maxWidth:900, margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <p className="label-overline" style={{ marginBottom:6 }}>Agent Perception</p>
          <h2 style={{ fontSize:'clamp(1.5rem,3vw,2.2rem)', fontWeight:900, letterSpacing:'-0.04em', color:'#fff' }}>
            Bounded Context
          </h2>
          <p style={{ fontSize:13, color:'#2d3748', marginTop:4 }}>
            Exactly what the agent sees — nothing more.
          </p>
        </div>
        <button onClick={load} className="btn-ghost" style={{ padding:'7px' }} aria-label="Refresh">
          <RefreshCw size={14} />
        </button>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} retry={load} />}
      {!loading && !error && !data && (
        <EmptyState title="No slice available"
          message="Execute at least one agent step to build the first bounded context." />
      )}
      {data && <ContextViewer slice={data.slice} />}
    </div>
  );
}
