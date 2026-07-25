interface Props { value: number; size?: 'sm' | 'md' }

export function ConfidenceBar({ value, size = 'sm' }: Props) {
  const pct   = Math.round(value * 100);
  const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const h     = size === 'sm' ? 3 : 5;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ flex:1, height:h, background:'rgba(255,255,255,0.06)', borderRadius:999, minWidth:40, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:999, transition:'width 0.3s ease', boxShadow:`0 0 6px ${color}80` }} />
      </div>
      <span className="mono" style={{ fontSize:10, width:28, textAlign:'right', color }}>{pct}%</span>
    </div>
  );
}
