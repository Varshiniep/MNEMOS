import type { Belief } from '../../types/api';
import { ConfidenceBar } from './ConfidenceBar';

interface Props { beliefs: Belief[]; showSuperseded?: boolean }

function renderValue(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export function BeliefTable({ beliefs, showSuperseded = true }: Props) {
  const rows = showSuperseded ? beliefs : beliefs.filter(b => b.active);
  if (rows.length === 0) return (
    <p className="text-sm text-slate-500 py-8 text-center">No beliefs to display.</p>
  );
  return (
    <div className="overflow-x-auto">
      <table className="table-dark">
        <thead>
          <tr>
            <th>Entity</th>
            <th>Attribute</th>
            <th>Value</th>
            <th className="w-36">Confidence</th>
            <th>Status</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(b => (
            <tr key={b.id} className={!b.active ? 'opacity-40' : ''}>
              <td>
                <span className="font-mono text-xs px-2 py-0.5 rounded"
                  style={{ background: 'rgba(79,70,229,0.15)', color: '#a78bfa' }}>
                  {b.entity}
                </span>
              </td>
              <td className="font-mono text-xs text-slate-400">{b.attribute}</td>
              <td className="font-mono text-xs text-slate-300">{renderValue(b.value)}</td>
              <td><ConfidenceBar value={b.confidence} /></td>
              <td>
                {b.active
                  ? <span className="badge badge-green">active</span>
                  : <span className="badge badge-slate">superseded</span>}
              </td>
              <td className="text-xs text-slate-600 truncate max-w-[120px]">{b.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
