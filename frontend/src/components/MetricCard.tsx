interface Props {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export function MetricCard({ label, value, sub, accent }: Props) {
  return (
    <div className={`rounded-xl border p-4 bg-white shadow-sm ${accent ? 'border-indigo-200' : 'border-slate-200'}`}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ? 'text-indigo-600' : 'text-slate-800'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}
