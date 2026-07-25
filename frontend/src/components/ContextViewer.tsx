import type { WorldSlice } from '../types/api';

interface Props { slice: WorldSlice }

function val(v: unknown) { return v === null || v === undefined ? '—' : String(v); }

export function ContextViewer({ slice }: Props) {
  return (
    <div className="space-y-4">
      {/* Notice */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 text-sm text-indigo-800">
        <strong>Bounded Context:</strong> The agent receives only this slice — never its full interaction history or the complete world model.
      </div>

      {/* Metrics strip */}
      <div className="flex flex-wrap gap-3">
        {[
          ['Characters',         slice.metrics.char_count],
          ['≈ Tokens',           slice.metrics.approx_tokens],
          ['Beliefs included',   slice.metrics.beliefs_included],
          ['Beliefs excluded',   slice.metrics.beliefs_excluded],
        ].map(([label, value]) => (
          <div key={label as string} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-center min-w-[90px]">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-lg font-bold text-slate-700">{value}</p>
          </div>
        ))}
      </div>

      {/* Slice fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Objective"       value={slice.objective} />
        <Field label="Current room"    value={slice.current_room} />
        <Field label="Room description" value={slice.room_description} />
        <Field label="Exits"           value={Object.keys(slice.exits).join(', ') || '—'} />
        <Field label="Visible objects" value={slice.visible_objects.join(', ') || '—'} />
        <Field label="Inventory"       value={slice.inventory.join(', ') || '(empty)'} />
      </div>

      {/* Active beliefs */}
      {slice.active_beliefs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Included beliefs ({slice.active_beliefs.length})</p>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-1.5 text-left text-slate-500 font-semibold">Entity</th>
                  <th className="px-3 py-1.5 text-left text-slate-500 font-semibold">Attribute</th>
                  <th className="px-3 py-1.5 text-left text-slate-500 font-semibold">Value</th>
                  <th className="px-3 py-1.5 text-left text-slate-500 font-semibold">Conf.</th>
                </tr>
              </thead>
              <tbody>
                {slice.active_beliefs.map(b => (
                  <tr key={b.id} className="border-t border-slate-100">
                    <td className="px-3 py-1.5 font-mono text-indigo-700">{b.entity}</td>
                    <td className="px-3 py-1.5 font-mono text-slate-600">{b.attribute}</td>
                    <td className="px-3 py-1.5 font-mono text-slate-800">{val(b.value)}</td>
                    <td className="px-3 py-1.5">{Math.round(b.confidence * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Valid commands */}
      {slice.valid_commands.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Valid commands</p>
          <div className="flex flex-wrap gap-1.5">
            {slice.valid_commands.map(cmd => (
              <span key={cmd} className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{cmd}</span>
            ))}
          </div>
        </div>
      )}

      {/* Raw prompt */}
      <details className="text-xs">
        <summary className="cursor-pointer text-slate-500 hover:text-slate-700 select-none py-1">Show raw prompt text</summary>
        <pre className="mt-2 p-3 bg-slate-900 text-green-300 rounded-lg overflow-x-auto text-xs whitespace-pre-wrap">
          {[
            `Objective: ${slice.objective}`,
            `Current room: ${slice.current_room}`,
            slice.room_description && `Room description: ${slice.room_description}`,
            Object.keys(slice.exits).length > 0 && `Exits: ${Object.keys(slice.exits).join(', ')}`,
            slice.visible_objects.length > 0 && `Visible objects: ${slice.visible_objects.join(', ')}`,
            slice.inventory.length > 0 && `Inventory: ${slice.inventory.join(', ')}`,
            slice.valid_commands.length > 0 && `Valid commands: ${slice.valid_commands.join(', ')}`,
          ].filter(Boolean).join('\n')}
        </pre>
      </details>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 px-3 py-2">
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm text-slate-700">{value || '—'}</p>
    </div>
  );
}
