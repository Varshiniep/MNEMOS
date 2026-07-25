import { ArrowRight } from 'lucide-react';
import type { CorrectionEvent } from '../types/api';

interface Props { correction: CorrectionEvent }

function val(v: unknown) {
  if (v === null || v === undefined) return '—';
  return String(v);
}

export function CorrectionCard({ correction: c }: Props) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-700 text-sm">
          <span className="text-indigo-700 font-mono">{c.entity}</span>
          {' · '}
          <span className="font-mono text-slate-500">{c.attribute}</span>
        </span>
        <span className="text-xs text-slate-400">{new Date(c.timestamp).toLocaleTimeString()}</span>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-mono text-xs line-through">{val(c.old_value)}</span>
        <ArrowRight size={14} className="text-slate-400" />
        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-mono text-xs">{val(c.new_value)}</span>
      </div>

      <p className="text-xs text-slate-500">{c.reason}</p>

      <div className="text-xs text-slate-400 space-y-0.5 pt-1 border-t border-amber-100">
        <div>Old ID: <span className="font-mono">{c.old_belief_id.slice(0,8)}…</span></div>
        <div>New ID: <span className="font-mono">{c.new_belief_id.slice(0,8)}…</span></div>
      </div>
    </div>
  );
}
