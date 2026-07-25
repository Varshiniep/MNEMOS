import type { Belief } from '../types/api';
import { ConfidenceBar } from './ConfidenceBar';

interface Props {
  beliefs: Belief[];
  showSuperseded?: boolean;
}

function renderValue(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export function BeliefTable({ beliefs, showSuperseded = true }: Props) {
  const rows = showSuperseded ? beliefs : beliefs.filter(b => b.active);
  if (rows.length === 0) return (
    <p className="text-sm text-slate-400 py-4 text-center">No beliefs to display.</p>
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Entity</th>
            <th className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Attribute</th>
            <th className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Value</th>
            <th className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide w-36">Confidence</th>
            <th className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
            <th className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(b => (
            <tr key={b.id} className={`border-b border-slate-100 hover:bg-slate-50 ${!b.active ? 'opacity-50' : ''}`}>
              <td className="px-3 py-2 font-mono text-xs text-indigo-700">{b.entity}</td>
              <td className="px-3 py-2 font-mono text-xs text-slate-600">{b.attribute}</td>
              <td className="px-3 py-2 font-mono text-xs text-slate-800">{renderValue(b.value)}</td>
              <td className="px-3 py-2"><ConfidenceBar value={b.confidence} /></td>
              <td className="px-3 py-2">
                {b.active
                  ? <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">active</span>
                  : <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">superseded</span>}
              </td>
              <td className="px-3 py-2 text-xs text-slate-400 truncate max-w-[120px]">{b.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
