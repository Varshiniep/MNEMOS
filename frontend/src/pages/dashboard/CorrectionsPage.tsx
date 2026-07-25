import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Zap, ArrowRight } from 'lucide-react';
import { fetchCorrections, runCorrectionDemo } from '../../services/api';
import type { CorrectionsResponse, CorrectionDemoResponse } from '../../types/api';
import { CorrectionCard } from '../../components/ui/CorrectionCard';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { useRunId } from '../../hooks/useRunId';

function val(v: unknown) { return v === null || v === undefined ? '—' : String(v); }

function DemoPanel({ demo }: { demo: CorrectionDemoResponse }) {
  const s = demo.superseded_belief;
  const n = demo.new_belief;
  return (
    <div className="card" style={{ borderColor:'rgba(139,92,246,0.3)', padding:24 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <Zap size={14} style={{ color:'#f59e0b' }} />
        <span style={{ fontWeight:700, color:'#fff', fontSize:14 }}>Deterministic Correction Demo</span>
        <span className="badge badge-amber mono" style={{ fontSize:9 }}>DEMO SCENARIO</span>
      </div>
      <p style={{ fontSize:12, color:'#374151', lineHeight:1.6, marginBottom:20 }}>{demo.description}</p>

      {/* Side-by-side */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
        <div style={{ borderRadius:12, padding:16, background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.2)' }}>
          <p className="mono" style={{ fontSize:9, color:'#ef4444', marginBottom:12, letterSpacing:'0.12em' }}>OLD BELIEF — SUPERSEDED</p>
          {[['ID', s.id.slice(0,14)+'…'],['VALUE',val(s.value)],['CONFIDENCE',`${Math.round(s.confidence*100)}%`],['ACTIVE','false'],['SUPERSEDED BY',s.superseded_by?s.superseded_by.slice(0,10)+'…':'—']].map(([l,v])=>(
            <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:11 }}>
              <span style={{ color:'#374151' }}>{l}</span>
              <span className="mono" style={{ color:'#4b5563' }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ borderRadius:12, padding:16, background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.2)' }}>
          <p className="mono" style={{ fontSize:9, color:'#10b981', marginBottom:12, letterSpacing:'0.12em' }}>NEW BELIEF — ACTIVE</p>
          {[['ID',n.id.slice(0,14)+'…'],['VALUE',val(n.value)],['CONFIDENCE',`${Math.round(n.confidence*100)}%`],['ACTIVE','true'],['SOURCE',n.source]].map(([l,v])=>(
            <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:11 }}>
              <span style={{ color:'#374151' }}>{l}</span>
              <span className="mono" style={{ color:'#4b5563' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Correction event */}
      <div style={{ borderRadius:10, padding:14, background:'rgba(245,158,11,0.05)', border:'1px solid rgba(245,158,11,0.18)', marginBottom:16 }}>
        <p className="mono" style={{ fontSize:9, color:'#f59e0b', marginBottom:10, letterSpacing:'0.12em' }}>CORRECTION EVENT</p>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
          <span className="mono" style={{ fontSize:12, padding:'4px 10px', borderRadius:6, background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)', textDecoration:'line-through' }}>
            {val(demo.correction_event.old_value)}
          </span>
          <ArrowRight size={13} style={{ color:'#374151' }} />
          <span className="mono" style={{ fontSize:12, padding:'4px 10px', borderRadius:6, background:'rgba(16,185,129,0.1)', color:'#34d399', border:'1px solid rgba(16,185,129,0.2)' }}>
            {val(demo.correction_event.new_value)}
          </span>
        </div>
        <p style={{ fontSize:12, color:'#374151' }}>{demo.correction_event.reason}</p>
        <p className="mono" style={{ fontSize:10, color:'#10b981', marginTop:8 }}>
          ✓ IDs MATCH: {String(demo.world_state_summary.ids_match).toUpperCase()}
        </p>
      </div>

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, textAlign:'center' }}>
        {([['TOTAL',demo.world_state_summary.total_beliefs],['ACTIVE',demo.world_state_summary.active_beliefs],['SUPERSEDED',demo.world_state_summary.superseded_beliefs],['CORRECTIONS',demo.world_state_summary.corrections]] as [string,number][]).map(([l,v])=>(
          <div key={l} style={{ padding:'12px 8px', borderRadius:10, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize:20, fontWeight:900, color:'#fff', fontFamily:'monospace' }}>{v}</p>
            <p className="mono" style={{ fontSize:8, color:'#2d3748', marginTop:4 }}>{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CorrectionsPage() {
  const [runId]                     = useRunId();
  const [data, setData]             = useState<CorrectionsResponse | null>(null);
  const [demo, setDemo]             = useState<CorrectionDemoResponse | null>(null);
  const [loading, setLoading]       = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError]           = useState('');

  const load = useCallback(async () => {
    if (!runId) return; setLoading(true); setError('');
    try { setData(await fetchCorrections(runId)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }, [runId]);

  useEffect(() => { void load(); }, [load]);

  const handleDemo = async () => {
    setDemoLoading(true); setError('');
    try { setDemo(await runCorrectionDemo()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Demo failed'); }
    finally { setDemoLoading(false); }
  };

  return (
    <div style={{ padding:'28px 32px', maxWidth:900, margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <p className="label-overline" style={{ marginBottom:6 }}>Audit Trail</p>
          <h2 style={{ fontSize:'clamp(1.5rem,3vw,2.2rem)', fontWeight:900, letterSpacing:'-0.04em', color:'#fff' }}>
            Belief Corrections
          </h2>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={handleDemo} disabled={demoLoading} className="btn-primary">
            <Zap size={13} />{demoLoading ? 'Running…' : 'RUN DEMO'}
          </button>
          {runId && (
            <button onClick={load} className="btn-ghost" style={{ padding:'7px' }} aria-label="Refresh">
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      {demo && <div style={{ marginBottom:20 }}><DemoPanel demo={demo} /></div>}
      {error && <ErrorState message={error} retry={runId ? load : undefined} />}

      {runId && (
        <div>
          <p className="label-overline" style={{ marginBottom:14 }}>
            RUN CORRECTIONS{data && <span style={{ color:'#2d3748', fontWeight:400, textTransform:'lowercase', marginLeft:8, fontSize:10 }}>({data.count})</span>}
          </p>
          {loading ? <LoadingState /> :
           !data || data.corrections.length === 0
             ? <EmptyState title="No corrections yet" message="Contradicting observations will appear here as corrections during the run." />
             : <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                 {[...data.corrections].reverse().map(c => <CorrectionCard key={c.id} correction={c} />)}
               </div>
          }
        </div>
      )}

      {!runId && !demo && (
        <EmptyState title="No run active"
          message="Click 'Run Demo' for the deterministic scenario, or start a run on the Agent Run page." />
      )}
    </div>
  );
}
