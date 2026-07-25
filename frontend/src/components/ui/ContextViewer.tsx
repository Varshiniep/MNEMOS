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
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Notice */}
      <div style={{ display:'flex', gap:10, padding:'14px 16px', borderRadius:12, background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.18)' }}>
        <div style={{ width:6, height:6, borderRadius:'50%', background:'#6366f1', flexShrink:0, marginTop:6, boxShadow:'0 0 8px #6366f1' }} />
        <p style={{ fontSize:13, color:'#6366f1', lineHeight:1.6 }}>
          The agent receives <strong>only this bounded slice</strong> — never its full interaction history or the complete world model.
        </p>
      </div>

      {/* Metrics */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
        {([
          ['CHARACTERS',       slice.metrics.char_count],
          ['≈ TOKENS',         slice.metrics.approx_tokens],
          ['BELIEFS INCLUDED', slice.metrics.beliefs_included],
          ['BELIEFS EXCLUDED', slice.metrics.beliefs_excluded],
        ] as [string, number][]).map(([label, value]) => (
          <div key={label} className="card" style={{ padding:'16px', textAlign:'center' }}>
            <p className="mono" style={{ fontSize:'clamp(1.4rem,3vw,1.8rem)', fontWeight:900, color:'#fff' }}>{value}</p>
            <p className="mono" style={{ fontSize:9, color:'#2d3748', marginTop:6, letterSpacing:'0.12em' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Fields grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:10 }}>
        {[
          ['OBJECTIVE',        slice.objective],
          ['CURRENT ROOM',     slice.current_room],
          ['ROOM DESCRIPTION', slice.room_description || '—'],
          ['EXITS',            Object.keys(slice.exits).join(', ') || '—'],
          ['VISIBLE OBJECTS',  slice.visible_objects.join(', ') || '—'],
          ['INVENTORY',        slice.inventory.join(', ') || '(empty)'],
        ].map(([l, v]) => (
          <div key={l} className="card" style={{ padding:'14px' }}>
            <p className="mono" style={{ fontSize:9, color:'#2d3748', letterSpacing:'0.12em', marginBottom:6 }}>{l}</p>
            <p style={{ fontSize:13, color:'#64748b' }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Included beliefs */}
      {slice.active_beliefs.length > 0 && (
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            <p className="mono" style={{ fontSize:9, color:'#374151', letterSpacing:'0.12em' }}>
              INCLUDED BELIEFS ({slice.active_beliefs.length})
            </p>
          </div>
          <table className="table-dark">
            <thead><tr><th>Entity</th><th>Attribute</th><th>Value</th><th>Conf.</th></tr></thead>
            <tbody>
              {slice.active_beliefs.map(b => (
                <tr key={b.id}>
                  <td className="mono" style={{ fontSize:11, color:'#a78bfa' }}>{b.entity}</td>
                  <td className="mono" style={{ fontSize:11, color:'#374151' }}>{b.attribute}</td>
                  <td className="mono" style={{ fontSize:11, color:'#4b5563' }}>{val(b.value)}</td>
                  <td><ConfidenceBar value={b.confidence} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Valid commands */}
      {slice.valid_commands.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <p className="mono" style={{ fontSize:9, color:'#2d3748', letterSpacing:'0.12em' }}>VALID COMMANDS</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {slice.valid_commands.map(cmd => (
              <span key={cmd} className="mono" style={{ fontSize:11, padding:'5px 10px', borderRadius:7, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'#4b5563' }}>
                {cmd}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Raw prompt */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <p className="mono" style={{ fontSize:9, color:'#374151', letterSpacing:'0.12em' }}>RAW PROMPT TEXT</p>
          <button onClick={copy} className="btn-ghost" style={{ padding:'4px 8px', fontSize:11 }}>
            {copied
              ? <><Check size={11} style={{ color:'#10b981' }} />COPIED</>
              : <><Copy size={11} />COPY</>}
          </button>
        </div>
        <pre className="code-block" style={{ borderRadius:0, border:'none', margin:0 }}>{rawText}</pre>
      </div>
    </div>
  );
}
