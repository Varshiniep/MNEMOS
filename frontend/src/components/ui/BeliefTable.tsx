import type { Belief } from '../../types/api';
import { ConfidenceBar } from './ConfidenceBar';

interface Props { beliefs: Belief[]; showSuperseded?: boolean }

function rv(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export function BeliefTable({ beliefs, showSuperseded = true }: Props) {
  const rows = showSuperseded ? beliefs : beliefs.filter(b => b.active);
  if (rows.length === 0) return (
    <p className="mono" style={{ fontSize:10, color:'#2d3748', padding:'28px 0', textAlign:'center', letterSpacing:'0.1em' }}>
      NO BELIEFS TO DISPLAY
    </p>
  );
  return (
    <div style={{ overflowX:'auto' }}>
      <table className="table-dark">
        <thead>
          <tr>
            <th>Entity</th><th>Attribute</th><th>Value</th>
            <th style={{ width:140 }}>Confidence</th><th>Status</th><th>Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(b => (
            <tr key={b.id} style={{ opacity: b.active ? 1 : 0.35 }}>
              <td>
                <span className="mono" style={{ fontSize:11, padding:'2px 7px', borderRadius:5, background:'rgba(139,92,246,0.1)', color:'#a78bfa', border:'1px solid rgba(139,92,246,0.12)' }}>
                  {b.entity}
                </span>
              </td>
              <td className="mono" style={{ fontSize:11, color:'#374151' }}>{b.attribute}</td>
              <td className="mono" style={{ fontSize:11, color:'#4b5563' }}>{rv(b.value)}</td>
              <td><ConfidenceBar value={b.confidence} /></td>
              <td>
                {b.active
                  ? <span className="badge badge-green" style={{ fontSize:9 }}>ACTIVE</span>
                  : <span className="badge badge-slate" style={{ fontSize:9 }}>SUPERSEDED</span>}
              </td>
              <td className="mono" style={{ fontSize:10, color:'#2d3748', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {b.source}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
