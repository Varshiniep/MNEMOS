interface Props {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  icon?: React.ReactNode;
}

export function MetricCard({ label, value, sub, accent, icon }: Props) {
  return (
    <div
      className="card card-hover p-5 space-y-3 relative overflow-hidden group"
      style={accent ? {
        borderColor: 'rgba(139,92,246,0.35)',
        background: 'rgba(16,21,40,0.8)',
      } : {}}
    >
      {accent && (
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'radial-gradient(ellipse at 30% 30%, rgba(139,92,246,0.1), transparent 70%)' }} />
      )}
      <div className="flex items-start justify-between relative z-10">
        <p className="mono" style={{ fontSize: 9, letterSpacing: '0.15em', color: '#374151' }}>
          {label.toUpperCase()}
        </p>
        {icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.15)' }}>
            {icon}
          </div>
        )}
      </div>
      <p className="relative z-10" style={{
        fontSize: 'clamp(1.6rem,3vw,2.2rem)',
        fontWeight: 900,
        lineHeight: 1,
        fontFamily: 'monospace',
        color: accent ? '#a78bfa' : '#fff',
      }}>
        {value}
      </p>
      {sub && (
        <p className="relative z-10 mono" style={{ fontSize: 9, color: '#2d3748', letterSpacing: '0.08em' }}>{sub}</p>
      )}
    </div>
  );
}
