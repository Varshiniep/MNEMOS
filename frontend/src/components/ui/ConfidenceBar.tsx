interface Props { value: number; size?: 'sm' | 'md' }

export function ConfidenceBar({ value, size = 'sm' }: Props) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const h = size === 'sm' ? 'h-1.5' : 'h-2';
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 rounded-full ${h} min-w-[40px]`} style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className={`${h} rounded-full transition-all`} style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs w-8 text-right" style={{ color }}>{pct}%</span>
    </div>
  );
}
