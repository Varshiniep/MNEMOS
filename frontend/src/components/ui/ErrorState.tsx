import { AlertTriangle } from 'lucide-react';

interface Props { message: string; retry?: () => void }

export function ErrorState({ message, retry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <AlertTriangle size={20} style={{ color: '#ef4444' }} />
      </div>
      <p style={{ fontSize: 13, color: '#f87171', maxWidth: 360, lineHeight: 1.6 }}>{message}</p>
      {retry && (
        <button onClick={retry} className="btn-danger" style={{ fontSize: 12, padding: '7px 16px' }}>
          Retry
        </button>
      )}
    </div>
  );
}
