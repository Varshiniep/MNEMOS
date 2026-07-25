import { ArrowRight } from 'lucide-react';
import type { CorrectionEvent } from '../../types/api';

interface Props { correction: CorrectionEvent }

function val(v: unknown) { return v === null || v === undefined ? '—' : String(v); }

export function CorrectionCard({ correction: c }: Props) {
  return (
    <div className="card card-hover p-5 space-y-4 relative overflow-hidden"
      style={{ borderLeft: '2px solid rgba(139,92,246,0.5)' }}>
      {/* Glow */}
      <div className="absolute top-0 left-0 w-32 h-full pointer-events-none"
        style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.04), transparent)' }} />

      <div className="flex items-center justify-between relative z-10">
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span className="mono" style={{ fontSize:11, padding:'2px 8px', borderRadius:6, background:'rgba(139,92,246,0.1)', color:'#a78bfa', border:'1px solid rgba(139,92,246,0.15)' }}>
            {c.entity}
          </span>
          <span style={{ fontSize:11, color:'#2d3748' }}>·</span>
          <span className="mono" style={{ fontSize:11, color:'#374151' }}>{c.attribute}</span>
        </div>
        <span className="mono" style={{ fontSize:9, color:'#2d3748', letterSpacing:'0.1em' }}>
          {new Date(c.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:10 }} className="relative z-10">
        <span className="mono" style={{ fontSize:12, padding:'5px 10px', borderRadius:7, background:'rgba(239,68,68,0.08)', color:'#f87171', border:'1px solid rgba(239,68,68,0.15)', textDecoration:'line-through' }}>
          {val(c.old_value)}
        </span>
        <ArrowRight size={14} style={{ color:'#374151' }} />
        <span className="mono" style={{ fontSize:12, padding:'5px 10px', borderRadius:7, background:'rgba(16,185,129,0.08)', color:'#34d399', border:'1px solid rgba(16,185,129,0.15)' }}>
          {val(c.new_value)}
        </span>
      </div>

      <p style={{ fontSize:12, color:'#374151', lineHeight:1.6 }} className="relative z-10">{c.reason}</p>

      <div style={{ display:'flex', gap:20, paddingTop:8, borderTop:'1px solid rgba(255,255,255,0.04)' }} className="relative z-10">
        <span className="mono" style={{ fontSize:9, color:'#2d3748' }}>
          OLD: {c.old_belief_id.slice(0,10)}…
        </span>
        <span className="mono" style={{ fontSize:9, color:'#2d3748' }}>
          NEW: {c.new_belief_id.slice(0,10)}…
        </span>
      </div>
    </div>
  );
}
