interface Props {
  status: string;
  size?: 'sm' | 'md';
}

const MAP: Record<string, string> = {
  ok:        'bg-green-100 text-green-800',
  running:   'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  stopped:   'bg-slate-100 text-slate-600',
  error:     'bg-red-100 text-red-700',
  idle:      'bg-slate-100 text-slate-500',
  online:    'bg-green-100 text-green-800',
  offline:   'bg-red-100 text-red-700',
};

export function StatusBadge({ status, size = 'md' }: Props) {
  const cls = MAP[status] ?? 'bg-slate-100 text-slate-600';
  const sz  = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs font-medium';
  return (
    <span className={`inline-flex items-center rounded-full ${sz} ${cls}`}>
      {status}
    </span>
  );
}
