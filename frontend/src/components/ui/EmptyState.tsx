import { Database } from 'lucide-react';

interface Props {
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, message, icon, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-600"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {icon ?? <Database size={22} />}
      </div>
      <p className="font-semibold text-slate-300 text-sm">{title}</p>
      <p className="text-xs text-slate-500 max-w-xs leading-relaxed">{message}</p>
      {action}
    </div>
  );
}
