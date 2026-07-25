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

function DemoResult({ demo }: { demo: CorrectionDemoResponse }) {
  const s = demo.superseded_belief;
  const n = demo.new_belief;
  return (
    <div className="card p-5 space-y-4" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
      <div className="flex items-center gap-2 flex-wrap">
        <Zap size={15} className="text-amber-400" />
        <h3 className="font-semibold text-white text-sm">Deterministic Correction Demo</h3>
        <span className="badge badge-amber">demo scenario</span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{demo.description}</p>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Old belief */}
        <div className="rounded-xl p-4 space-y-2.5"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Old Belief — Superseded</p>
          {[
            ['ID',           s.id.slice(0,12) + '…'],
            ['Value',        val(s.value)],
            ['Confidence',   `${Math.round(s.confidence * 100)}%`],
            ['Active',       'false'],
            ['Superseded by', s.superseded_by ? s.superseded_by.slice(0,10)+'…' : '—'],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-xs">
              <span className="text-slate-600">{l}</span>
              <span className="font-mono text-slate-400">{v}</span>
            </div>
          ))}
        </div>
        {/* New belief */}
        <div className="rounded-xl p-4 space-y-2.5"
          style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">New Belief — Active</p>
          {[
            ['ID',          n.id.slice(0,12) + '…'],
            ['Value',       val(n.value)],
            ['Confidence',  `${Math.round(n.confidence * 100)}%`],
            ['Active',      'true'],
            ['Source',      n.source],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-xs">
              <span className="text-slate-600">{l}</span>
              <span className="font-mono text-slate-400">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Correction event */}
      <div className="rounded-xl p-4 space-y-2"
        style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">Correction Event</p>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs px-2 py-1 rounded line-through"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
            {val(demo.correction_event.old_value)}
          </span>
          <ArrowRight size={13} className="text-slate-600" />
          <span className="font-mono text-xs px-2 py-1 rounded"
            style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399' }}>
            {val(demo.correction_event.new_value)}
          </span>
        </div>
        <p className="text-xs text-slate-500">{demo.correction_event.reason}</p>
        <p className="text-xs font-medium text-emerald-400">
          ✓ IDs match: {String(demo.world_state_summary.ids_match)}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {([
          ['Total',      demo.world_state_summary.total_beliefs],
          ['Active',     demo.world_state_summary.active_beliefs],
          ['Superseded', demo.world_state_summary.superseded_beliefs],
          ['Corrections',demo.world_state_summary.corrections],
        ] as [string, number][]).map(([l, v]) => (
          <div key={l} className="rounded-xl p-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xl font-black text-white">{v}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{l}</p>
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
    if (!runId) return;
    setLoading(true); setError('');
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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Belief Corrections</h2>
          <p className="text-sm text-slate-500 mt-0.5">Every contradiction is preserved and auditable</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDemo} disabled={demoLoading} className="btn-primary">
            <Zap size={14} />{demoLoading ? 'Running…' : 'Run Demo'}
          </button>
          {runId && (
            <button onClick={load} className="btn-ghost p-2" aria-label="Refresh">
              <RefreshCw size={15} />
            </button>
          )}
        </div>
      </div>

      {demo && <DemoResult demo={demo} />}
      {error && <ErrorState message={error} retry={runId ? load : undefined} />}

      {runId && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Run Corrections {data && <span className="text-slate-600 font-normal normal-case ml-1">({data.count})</span>}
            </h3>
          </div>
          {loading ? <LoadingState /> :
           !data || data.corrections.length === 0
             ? <EmptyState title="No corrections yet"
                 message="Contradicting observations will appear here as corrections during the run." />
             : [...data.corrections].reverse().map(c => (
                 <CorrectionCard key={c.id} correction={c} />
               ))
          }
        </div>
      )}

      {!runId && !demo && (
        <EmptyState title="No run active"
          message="Click 'Run Demo' for the deterministic correction scenario, or start a run on the Agent Run page." />
      )}
    </div>
  );
}
