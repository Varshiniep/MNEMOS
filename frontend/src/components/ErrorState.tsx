import { AlertTriangle } from 'lucide-react';

interface Props { message: string; retry?: () => void }

export function ErrorState({ message, retry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertTriangle className="text-red-400 mb-2" size={32} />
      <p className="text-sm text-red-600 max-w-sm">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="mt-3 text-xs px-3 py-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50"
        >
          Retry
        </button>
      )}
    </div>
  );
}
