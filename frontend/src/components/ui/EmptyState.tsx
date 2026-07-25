import { Database } from 'lucide-react';

interface Props {
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, message, icon, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ color: '#2d3748' }}>{icon ?? <Database size={22} />}</span>
      </div>
      <div className="space-y-1.5">
        <p style={{ fontWeight: 600, color: '#4b5563', fontSize: 14 }}>{title}</p>
        <p style={{ fontSize: 12, color: '#2d3748', maxWidth: 300, lineHeight: 1.6 }}>{message}</p>
      </div>
      {action}
    </div>
  );
}
