interface Props { status: string; size?: 'sm' | 'md' }

const MAP: Record<string, string> = {
  ok:        'badge-green',
  running:   'badge-blue',
  completed: 'badge-green',
  stopped:   'badge-slate',
  error:     'badge-red',
  idle:      'badge-slate',
  online:    'badge-green',
  offline:   'badge-red',
  active:    'badge-green',
  superseded:'badge-slate',
};

export function StatusBadge({ status, size = 'md' }: Props) {
  const cls = MAP[status] ?? 'badge-slate';
  const sz  = size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : '';
  return <span className={`badge ${cls} ${sz} mono`}>{status.toUpperCase()}</span>;
}
