import { useState, useEffect, useCallback } from 'react';
import { fetchCorrections, runCorrectionDemo } from '../services/api';
import type { CorrectionsResponse, CorrectionDemoResponse } from '../types/api';
import { CorrectionCard } from '../components/CorrectionCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { useRunId } from '../hooks/useRunId';
import { RefreshCw, Zap, ArrowRight } from 'lucide-react';

function val(v: unknown) { return v === null || v === undefined ? '—' : String(v); }

export function CorrectionsPage() {
  const [runId] = useRunId();
  const [data, setData]       = useState<CorrectionsResponse | null>(null);
  const [demo, setDemo]       = useState<CorrectionDemoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError]     = useState('');

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
        <h1 className="text-xl font-bold text-slate-800">Correction Log</h1>
        <div className="flex gap-2">
          <button onClick={handleDemo} disabled={demoLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition">
            <Zap size={14} />{demoLoading ? 'Running…' : 'Run Demo'}
          </button>
          {runId && (
            <button onClick={load} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition">
              <RefreshCw size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Demo result */}
      {demo && <DemoResult demo={demo} />}

      {error && <ErrorState message={error} retry={runId ? load : undefined} />}

      {/* Live corrections */}
      {runId && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700">
            Run Corrections {data && <span className="text-slate-400 font-normal">({data.count})</span>}
          </h2>
          {loading ? <LoadingState /> :
           !data || data.corrections.length === 0 ? (
             <EmptyState title="No corrections yet" message="Contradicting observations will appear here as corrections." />
           ) : (
             <div className="space-y-3">
               {[...data.corrections].reverse().map(c => (
                 <CorrectionCard key={c.id} correction={c} />
               ))}
             </div>
           )}
        </div>
      )}

      {!runId && !demo && (
        <EmptyState title="No run active" message="Click 'Run Demo' to see a correction scenario, or start a run on the Agent Run page." />
      )}
    </div>
  );
}

function DemoResult({ demo }: { demo: CorrectionDemoResponse }) {
  const s = demo.superseded_belief;
  const n = demo.new_belief;
  return (
    <div className="bg-white rounded-xl border border-amber-300 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Zap size={16} className="text-amber-500" />
        <h2 className="font-semibold text-slate-700 text-sm">Deterministic Correction Demo</h2>
        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Demo scenario</span>
      </div>
      <p className="text-xs text-slate-500">{demo.description}</p>

      {/* Side-by-side belief comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 space-y-1.5">
          <p className="text-xs font-semibold text-red-700 uppercase">Old belief (superseded)</p>
          <BeliefRow label="ID"         value={s.id.slice(0,12) + '…'} />
          <BeliefRow label="Value"      value={val(s.value)} />
          <BeliefRow label="Confidence" value={`${Math.round(s.confidence * 100)}%`} />
          <BeliefRow label="Active"     value="false" />
          <BeliefRow label="Superseded by" value={s.superseded_by ? s.superseded_by.slice(0,8)+'…' : '—'} />
        </div>
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 space-y-1.5">
          <p className="text-xs font-semibold text-green-700 uppercase">New belief (active)</p>
          <BeliefRow label="ID"         value={n.id.slice(0,12) + '…'} />
          <BeliefRow label="Value"      value={val(n.value)} />
          <BeliefRow label="Confidence" value={`${Math.round(n.confidence * 100)}%`} />
          <BeliefRow label="Active"     value="true" />
          <BeliefRow label="Source"     value={n.source} />
        </div>
      </div>

      {/* Correction event */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1.5">
        <p className="text-xs font-semibold text-amber-700 uppercase">Correction event</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded line-through">{val(demo.correction_event.old_value)}</span>
          <ArrowRight size={14} className="text-slate-400" />
          <span className="font-mono text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{val(demo.correction_event.new_value)}</span>
        </div>
        <p className="text-xs text-slate-500">{demo.correction_event.reason}</p>
        <p className="text-xs text-green-700 font-medium">
          ✓ IDs match: {String(demo.world_state_summary.ids_match)}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {([
          ['Total beliefs',   demo.world_state_summary.total_beliefs],
          ['Active',          demo.world_state_summary.active_beliefs],
          ['Superseded',      demo.world_state_summary.superseded_beliefs],
          ['Corrections',     demo.world_state_summary.corrections],
        ] as [string, number][]).map(([l, v]) => (
          <div key={l} className="bg-slate-50 rounded-lg p-2">
            <p className="text-lg font-bold text-slate-700">{v}</p>
            <p className="text-xs text-slate-400">{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BeliefRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="font-mono text-slate-700 text-right ml-2">{value}</span>
    </div>
  );
}
