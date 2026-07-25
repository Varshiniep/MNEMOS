import { ArrowRight } from 'lucide-react';
import type { CorrectionEvent } from '../../types/api';

interface Props { correction: CorrectionEvent }

function val(v: unknown) { return v === null || v === undefined ? '—' : String(v); }

export function CorrectionCard({ correction: c }: Props) {
  return (
    <div className="card card-hover p-5 space-y-3"
      style={{ borderLeft: '3px solid rgba(245,158,11,0.5)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-2 py-0.5 rounded"
            style={{ background: 'rgba(79,70,229,0.15)', color: '#a78bfa' }}>
            {c.entity}
          </span>
          <span className="text-slate-600 text-xs">·</span>
          <span className="font-mono text-xs text-slate-400">{c.attribute}</span>
        </div>
        <span className="text-xs text-slate-600">{new Date(c.timestamp).toLocaleTimeString()}</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-mono text-xs px-2 py-1 rounded line-through"
          style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
          {val(c.old_value)}
        </span>
        <ArrowRight size={13} className="text-slate-600" />
        <span className="font-mono text-xs px-2 py-1 rounded"
          style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399' }}>
          {val(c.new_value)}
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">{c.reason}</p>

      <div className="flex gap-4 text-xs text-slate-600 pt-1 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <span>Old: <span className="font-mono">{c.old_belief_id.slice(0,8)}…</span></span>
        <span>New: <span className="font-mono">{c.new_belief_id.slice(0,8)}…</span></span>
      </div>
    </div>
  );
}
