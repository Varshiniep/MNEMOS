import { AlertTriangle } from 'lucide-react';

interface Props { message: string; retry?: () => void }

export function ErrorState({ message, retry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <AlertTriangle size={20} className="text-red-400" />
      </div>
      <p className="text-sm text-red-400 max-w-sm">{message}</p>
      {retry && (
        <button onClick={retry}
          className="text-xs px-4 py-2 rounded-lg transition-colors"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
          Retry
        </button>
      )}
    </div>
  );
}
