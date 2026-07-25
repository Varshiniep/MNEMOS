interface Props { value: number; size?: 'sm' | 'md' }

export function ConfidenceBar({ value, size = 'sm' }: Props) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400';
  const h = size === 'sm' ? 'h-1.5' : 'h-2';
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-slate-100 rounded-full ${h} min-w-[48px]`}>
        <div className={`${h} rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-8 text-right">{pct}%</span>
    </div>
  );
}
