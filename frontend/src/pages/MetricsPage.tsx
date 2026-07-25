import { useState, useEffect, useCallback } from 'react';
import { fetchMetrics } from '../services/api';
import type { MetricsResponse } from '../types/api';
import { MetricCard } from '../components/MetricCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { useRunId } from '../hooks/useRunId';
import { RefreshCw } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';

export function MetricsPage() {
  const [runId] = useRunId();
  const [data, setData]       = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    if (!runId) return;
    setLoading(true); setError('');
    try { setData(await fetchMetrics(runId)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to load metrics'); }
    finally { setLoading(false); }
  }, [runId]);

  useEffect(() => { void load(); }, [load]);

  if (!runId) return (
    <div className="p-8"><EmptyState title="No active run" message="Start a run to see metrics." /></div>
  );

  // Build chart data from token_counts_per_turn
  const tokenData = (data?.token_counts_per_turn ?? []).map((v, i) => ({ turn: i, tokens: v }));
  const beliefData = data ? [
    { name: 'Active',     value: data.active_beliefs },
    { name: 'Superseded', value: data.superseded_beliefs },
  ] : [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Metrics</h1>
        <button onClick={load} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition">
          <RefreshCw size={16} />
        </button>
      </div>

      {loading && <LoadingState />}
      {error   && <ErrorState message={error} retry={load} />}

      {data && (
        <>
          {/* Top metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="Total Turns"    value={data.total_turns} />
            <MetricCard label="Total Actions"  value={data.total_actions} />
            <MetricCard label="Rooms Explored" value={data.unique_rooms_explored} />
            <MetricCard label="Corrections"    value={data.corrections} />
            <MetricCard label="Active Beliefs"  value={data.active_beliefs} accent />
            <MetricCard label="Superseded"     value={data.superseded_beliefs} />
            <MetricCard label="Avg Tokens"     value={data.avg_bounded_context_tokens}
              sub="per bounded context" />
            <MetricCard label="Max Tokens"     value={data.max_bounded_context_tokens} />
          </div>

          {data.elapsed_seconds !== null && (
            <p className="text-xs text-slate-400">
              Elapsed: {data.elapsed_seconds}s · Status: <span className="font-medium text-slate-600">{data.completion_status}</span>
            </p>
          )}

          {/* Token usage chart */}
          {tokenData.length > 1 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Bounded Context Tokens per Turn
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={tokenData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="turn" tick={{ fontSize: 11 }} label={{ value: 'Turn', position: 'insideBottom', offset: -4 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="tokens" stroke="#4f6ef7" strokeWidth={2} dot={false} name="Tokens" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Belief bar chart */}
          {beliefData.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Belief Status
              </h2>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={beliefData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Beliefs" fill="#4f6ef7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {tokenData.length <= 1 && (
            <p className="text-xs text-slate-400 text-center py-4">
              Charts appear after multiple agent turns.
            </p>
          )}
        </>
      )}
    </div>
  );
}
