import { Database } from 'lucide-react';

interface Props {
  title: string;
  message: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, message, icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
      <div className="mb-3 text-slate-300">
        {icon ?? <Database size={36} />}
      </div>
      <p className="font-medium text-slate-500 text-sm">{title}</p>
      <p className="text-xs mt-1 max-w-xs">{message}</p>
    </div>
  );
}
