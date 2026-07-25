import { ChevronRight, AlertCircle, Zap } from 'lucide-react';
import type { TurnRecord } from '../../types/api';

interface Props { turns: TurnRecord[]; maxVisible?: number }

export function TurnTimeline({ turns, maxVisible = 20 }: Props) {
  const visible = turns.slice(-maxVisible).reverse();
  if (visible.length === 0) return (
    <p className="mono" style={{ fontSize:10, color:'#2d3748', padding:'24px 0', textAlign:'center', letterSpacing:'0.1em' }}>
      NO TURNS YET
    </p>
  );
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {visible.map(t => (
        <div key={t.turn}
          style={{
            display:'flex', gap:10, alignItems:'flex-start',
            padding:'10px 12px', borderRadius:10,
            border:'1px solid rgba(255,255,255,0.04)',
            background:'rgba(255,255,255,0.015)',
            transition:'background 0.15s',
          }}
        >
          <div style={{
            flexShrink:0, width:24, height:24, borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:10, fontWeight:700, fontFamily:'monospace',
            background:'rgba(139,92,246,0.15)', color:'#a78bfa',
            border:'1px solid rgba(139,92,246,0.2)',
          }}>
            {t.turn}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:4 }}>
              <span style={{
                display:'inline-flex', alignItems:'center', gap:3,
                fontSize:11, fontWeight:600, padding:'2px 7px', borderRadius:6,
                background:'rgba(139,92,246,0.1)', color:'#a78bfa',
                border:'1px solid rgba(139,92,246,0.15)', fontFamily:'monospace',
              }}>
                <ChevronRight size={8} />{t.action || '[RESET]'}
              </span>
              {t.reward > 0 && (
                <span className="badge badge-green" style={{ fontSize:9 }}>
                  <Zap size={8} />+{t.reward}
                </span>
              )}
              {t.corrections.length > 0 && (
                <span className="badge badge-amber" style={{ fontSize:9 }}>
                  <AlertCircle size={8} />{t.corrections.length} CORRECTION{t.corrections.length > 1 ? 'S' : ''}
                </span>
              )}
              {t.approx_tokens > 0 && (
                <span className="mono" style={{ fontSize:9, color:'#2d3748' }}>~{t.approx_tokens}T</span>
              )}
            </div>
            <p style={{ fontSize:11, color:'#2d3748', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {t.observation?.slice(0, 90)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
