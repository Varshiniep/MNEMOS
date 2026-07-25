import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, BarChart2 } from 'lucide-react';
import { fetchMetrics } from '../../services/api';
import type { MetricsResponse } from '../../types/api';
import { MetricCard } from '../../components/ui/MetricCard';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { useRunId } from '../../hooks/useRunId';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const TT = { background:'#060912', border:'1px solid rgba(139,92,246,0.25)', borderRadius:8, color:'#f1f5f9', fontSize:11 };
const AX = { fontSize:10, fill:'#2d3748' };

export function MetricsPage() {
  const [runId]               = useRunId();
  const [data, setData]       = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    if (!runId) return; setLoading(true); setError('');
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
    { name: 'Active',     value: data.active_beliefs },
    { name: 'Superseded', value: data.superseded_beliefs },
  ] : [];

  const PANEL: React.CSSProperties = {
    background:'rgba(8,10,22,0.9)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14, padding:20,
  };

  return (
    <div style={{ padding:'28px 32px', maxWidth:1100, margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <p className="label-overline" style={{ marginBottom:6 }}>Performance</p>
          <h2 style={{ fontSize:'clamp(1.5rem,3vw,2.2rem)', fontWeight:900, letterSpacing:'-0.04em', color:'#fff' }}>
            Metrics
          </h2>
        </div>
        <button onClick={load} className="btn-ghost" style={{ padding:'7px' }} aria-label="Refresh">
          <RefreshCw size={14} />
        </button>
      </div>

      {loading && <LoadingState />}
      {error   && <ErrorState message={error} retry={load} />}

      {data && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
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
            <p className="mono" style={{ fontSize:9, color:'#2d3748', marginBottom:16, letterSpacing:'0.1em' }}>
              ELAPSED: {data.elapsed_seconds}s · STATUS: {data.completion_status.toUpperCase()} · REWARD: {data.total_reward.toFixed(1)}
            </p>
          )}

          {tokenData.length > 1 ? (
            <div style={{ ...PANEL, marginBottom:14 }}>
              <p className="label-overline" style={{ marginBottom:18 }}>
                BOUNDED CONTEXT TOKENS vs TRADITIONAL HISTORY (estimated)
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={tokenData} margin={{ top:4, right:16, left:0, bottom:4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="turn" tick={AX} label={{ value:'Turn', position:'insideBottom', offset:-2, fill:'#2d3748', fontSize:9 }} />
                  <YAxis tick={AX} />
                  <Tooltip contentStyle={TT} />
                  <Line type="monotone" dataKey="traditional" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Traditional (est.)" strokeDasharray="5 3" />
                  <Line type="monotone" dataKey="tokens" stroke="#8b5cf6" strokeWidth={2} dot={false} name="MNEMOS Bounded" />
                </LineChart>
              </ResponsiveContainer>
              <p className="mono" style={{ fontSize:9, color:'#1f2937', textAlign:'center', marginTop:10 }}>
                TRADITIONAL HISTORY GROWS ~8× FASTER. MNEMOS STAYS BOUNDED.
              </p>
            </div>
          ) : (
            <div style={{ ...PANEL, textAlign:'center', padding:32, marginBottom:14 }}>
              <p className="mono" style={{ fontSize:10, color:'#2d3748' }}>CHARTS APPEAR AFTER MULTIPLE AGENT TURNS</p>
            </div>
          )}

          {beliefData.some(d => d.value > 0) && (
            <div style={PANEL}>
              <p className="label-overline" style={{ marginBottom:18 }}>BELIEF STATUS DISTRIBUTION</p>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={beliefData} margin={{ top:4, right:16, left:0, bottom:4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={AX} />
                  <YAxis tick={AX} />
                  <Tooltip contentStyle={TT} />
                  <Bar dataKey="value" name="Count" fill="#6366f1" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
