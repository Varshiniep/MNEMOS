import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { WorldSlice } from '../../types/api';
import { ConfidenceBar } from './ConfidenceBar';

interface Props { slice: WorldSlice }

function val(v: unknown) { return v === null || v === undefined ? '—' : String(v); }

export function ContextViewer({ slice }: Props) {
  const [copied, setCopied] = useState(false);

  const rawText = [
    `Objective: ${slice.objective}`,
    `Current room: ${slice.current_room}`,
    slice.room_description && `Room description: ${slice.room_description}`,
    Object.keys(slice.exits).length > 0 && `Exits: ${Object.keys(slice.exits).join(', ')}`,
    slice.visible_objects.length > 0 && `Visible objects: ${slice.visible_objects.join(', ')}`,
    slice.inventory.length > 0 && `Inventory: ${slice.inventory.join(', ')}`,
    slice.valid_commands.length > 0 && `Valid commands: ${slice.valid_commands.join(', ')}`,
  ].filter(Boolean).join('\n');

  const copy = () => {
    void navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl"
        style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)' }}>
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
        <p className="text-sm text-indigo-300">
          The agent receives <strong>only this bounded slice</strong> — never its full interaction history or the complete world model.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {([
          ['Characters',       slice.metrics.char_count],
          ['≈ Tokens',         slice.metrics.approx_tokens],
          ['Beliefs included', slice.metrics.beliefs_included],
          ['Beliefs excluded', slice.metrics.beliefs_excluded],
        ] as [string, number][]).map(([label, value]) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Fields */}
      <div className="grid md:grid-cols-2 gap-3">
        {[
          ['Objective',        slice.objective],
          ['Current Room',     slice.current_room],
          ['Room Description', slice.room_description],
          ['Exits',            Object.keys(slice.exits).join(', ') || '—'],
          ['Visible Objects',  slice.visible_objects.join(', ') || '—'],
          ['Inventory',        slice.inventory.join(', ') || '(empty)'],
        ].map(([l, v]) => (
          <div key={l} className="card p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1">{l}</p>
            <p className="text-sm text-slate-300">{v || '—'}</p>
          </div>
        ))}
      </div>

      {/* Active beliefs */}
      {slice.active_beliefs.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Included beliefs ({slice.active_beliefs.length})
            </p>
          </div>
          <table className="table-dark">
            <thead><tr><th>Entity</th><th>Attribute</th><th>Value</th><th>Conf.</th></tr></thead>
            <tbody>
              {slice.active_beliefs.map(b => (
                <tr key={b.id}>
                  <td className="font-mono text-xs" style={{ color: '#a78bfa' }}>{b.entity}</td>
                  <td className="font-mono text-xs text-slate-400">{b.attribute}</td>
                  <td className="font-mono text-xs text-slate-300">{val(b.value)}</td>
                  <td><ConfidenceBar value={b.confidence} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Valid commands */}
      {slice.valid_commands.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">Valid commands</p>
          <div className="flex flex-wrap gap-1.5">
            {slice.valid_commands.map(cmd => (
              <span key={cmd} className="font-mono text-xs px-2.5 py-1 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                {cmd}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Raw prompt */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">Raw Prompt Text</p>
          <button onClick={copy} className="btn-ghost py-1 px-2 text-xs">
            {copied ? <><Check size={12} className="text-emerald-400" />Copied</> : <><Copy size={12} />Copy</>}
          </button>
        </div>
        <pre className="p-4 font-mono text-xs text-green-300 whitespace-pre-wrap overflow-x-auto leading-relaxed"
          style={{ background: '#020817' }}>
          {rawText}
        </pre>
      </div>
    </div>
  );
}
