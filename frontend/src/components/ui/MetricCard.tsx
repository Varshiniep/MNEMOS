interface Props {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function MetricCard({ label, value, sub, accent, icon }: Props) {
  return (
    <div className={`card card-hover p-5 space-y-3 ${accent ? 'glow-indigo' : ''}`}
      style={accent ? { borderColor: 'rgba(79,70,229,0.4)' } : {}}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
        {icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(79,70,229,0.15)' }}>
            {icon}
          </div>
        )}
      </div>
      <p className={`text-3xl font-black leading-none ${accent ? 'gradient-text' : 'text-white'}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
