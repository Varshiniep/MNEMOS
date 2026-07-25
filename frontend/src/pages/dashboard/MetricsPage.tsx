import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, BarChart2 } from 'lucide-react';
import { fetchMetrics } from '../../services/api';
import type { MetricsResponse } from '../../types/api';
import { MetricCard } from '../../components/ui/MetricCard';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { useRunId } from '../../hooks/useRunId';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

const CHART_STYLE = {
  background: 'transparent',
  border: 'none',
};
const TOOLTIP_STYLE = {
  background: '#0c1225',
  border: '1px solid rgba(79,70,229,0.3)',
  borderRadius: 8,
  color: '#f1f5f9',
  fontSize: 12,
};

export function MetricsPage() {
  const [runId]               = useRunId();
  const [data, setData]       = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    if (!runId) return;
    setLoading(true); setError('');
    try { setData(await fetchMetrics(runId)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }, [runId]);

  useEffect(() => { void load(); }, [load]);

  if (!runId) return (
    <div className="p-8">
      <EmptyState title="No active run" message="Start a run to see live performance metrics."
        icon={<BarChart2 size={22} />} />
    </div>
  );

  const tokenData  = (data?.token_counts_per_turn ?? []).map((v, i) => ({ turn: i, tokens: v, traditional: v * 8 }));
  const beliefData = data ? [
    { name: 'Active',     value: data.active_beliefs,     fill: '#4f46e5' },
    { name: 'Superseded', value: data.superseded_beliefs, fill: '#7c3aed' },
  ] : [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Performance Metrics</h2>
          <p className="text-sm text-slate-500 mt-0.5">Live data from the current run</p>
        </div>
        <button onClick={load} className="btn-ghost p-2" aria-label="Refresh"><RefreshCw size={15} /></button>
      </div>

      {loading && <LoadingState />}
      {error   && <ErrorState message={error} retry={load} />}

      {data && (
        <>
          {/* Top metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="Total Turns"    value={data.total_turns} />
            <MetricCard label="Total Actions"  value={data.total_actions} />
            <MetricCard label="Rooms Explored" value={data.unique_rooms_explored} />
            <MetricCard label="Corrections"    value={data.corrections} />
            <MetricCard label="Active Beliefs" value={data.active_beliefs} accent />
            <MetricCard label="Superseded"     value={data.superseded_beliefs} />
            <MetricCard label="Avg Tokens"     value={data.avg_bounded_context_tokens} sub="per bounded context" />
            <MetricCard label="Max Tokens"     value={data.max_bounded_context_tokens} />
          </div>

          {data.elapsed_seconds !== null && (
            <p className="text-xs text-slate-600">
              Elapsed: <span className="text-slate-400">{data.elapsed_seconds}s</span>
              {' · '}Status: <span className="text-slate-400">{data.completion_status}</span>
              {' · '}Reward: <span className="text-emerald-400">{data.total_reward.toFixed(1)}</span>
            </p>
          )}

          {/* Token chart */}
          {tokenData.length > 1 ? (
            <div className="card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">
                Bounded Context Tokens vs Traditional History (estimated)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={tokenData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }} style={CHART_STYLE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="turn" tick={{ fontSize: 11, fill: '#475569' }}
                    label={{ value: 'Turn', position: 'insideBottom', offset: -2, fill: '#475569', fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="traditional" stroke="#ef4444" strokeWidth={1.5}
                    dot={false} name="Traditional (est.)" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="tokens" stroke="#4f46e5" strokeWidth={2}
                    dot={false} name="MNEMOS Bounded Context" />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-slate-600 mt-3 text-center">
                Traditional history grows 8× faster per turn (estimated). MNEMOS stays bounded.
              </p>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-sm text-slate-600">Charts appear after multiple agent turns.</p>
            </div>
          )}

          {/* Belief chart */}
          {beliefData.some(d => d.value > 0) && (
            <div className="card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">
                Belief Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={beliefData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }} style={CHART_STYLE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                    {beliefData.map((entry, i) => (
                      <rect key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
