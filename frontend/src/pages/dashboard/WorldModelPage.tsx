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
  const [runId]               = useRunId();
  const [data, setData]       = useState<WorldStateResponse | null>(null);
  const [beliefs, setBeliefs] = useState<Belief[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('');
  const [activeOnly, setActiveOnly] = useState(false);

  const load = useCallback(async () => {
    if (!runId) return; setLoading(true); setError('');
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
      <EmptyState title="No active run"
        message="Start a run from the Agent Run page to populate the world model."
        icon={<Globe size={22} />} />
    </div>
  );

  return (
    <div style={{ padding:'28px 32px', maxWidth:1200, margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <p className="label-overline" style={{ marginBottom:6 }}>Knowledge Base</p>
          <h2 style={{ fontSize:'clamp(1.5rem,3vw,2.2rem)', fontWeight:900, letterSpacing:'-0.04em', color:'#fff' }}>
            World Model
          </h2>
        </div>
        <button onClick={load} className="btn-ghost" style={{ padding:'7px' }} aria-label="Refresh">
          <RefreshCw size={14} />
        </button>
      </div>

      {error && <ErrorState message={error} retry={load} />}

      {data && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
          <MetricCard label="Total Beliefs"   value={data.belief_count} />
          <MetricCard label="Active"          value={data.active_beliefs} accent />
          <MetricCard label="Superseded"      value={data.superseded_beliefs} />
          <MetricCard label="Corrections"     value={data.correction_count} />
        </div>
      )}

      <div className="card" style={{ overflow:'hidden' }}>
        {/* Toolbar */}
        <div style={{
          padding:'14px 16px', display:'flex', flexWrap:'wrap', alignItems:'center', gap:12,
          borderBottom:'1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <Search size={12} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#2d3748' }} />
            <input placeholder="Search entity, attribute, value…"
              value={filter} onChange={e => setFilter(e.target.value)}
              className="input-dark" style={{ paddingLeft:32, paddingTop:8, paddingBottom:8 }} />
          </div>
          <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#4b5563', cursor:'pointer' }}>
            <input type="checkbox" checked={activeOnly}
              onChange={e => setActiveOnly(e.target.checked)}
              style={{ accentColor:'#8b5cf6', width:14, height:14 }} />
            Active only
          </label>
          <span className="mono" style={{ fontSize:9, color:'#2d3748' }}>
            {filtered.length}/{beliefs.length}
          </span>
        </div>

        {loading ? <LoadingState /> :
         filtered.length === 0 ? (
           <div style={{ padding:32 }}>
             <EmptyState title="No beliefs found" message="Beliefs are created as the agent explores the environment." />
           </div>
         ) : (
           <BeliefTable beliefs={filtered} showSuperseded={!activeOnly} />
         )}
      </div>
    </div>
  );
}
