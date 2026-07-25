import { ChevronRight, AlertCircle } from 'lucide-react';
import type { TurnRecord } from '../types/api';

interface Props { turns: TurnRecord[]; maxVisible?: number }

export function TurnTimeline({ turns, maxVisible = 20 }: Props) {
  const visible = turns.slice(-maxVisible).reverse();
  if (visible.length === 0) return (
    <p className="text-sm text-slate-400 py-4 text-center">No turns yet.</p>
  );
  return (
    <div className="space-y-2">
      {visible.map(t => (
        <div key={t.turn} className="flex gap-3 items-start">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold mt-0.5">
            {t.turn}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                <ChevronRight size={10} />{t.action || '[reset]'}
              </span>
              {t.reward > 0 && (
                <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">+{t.reward}</span>
              )}
              {t.corrections.length > 0 && (
                <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <AlertCircle size={10} />{t.corrections.length} correction{t.corrections.length > 1 ? 's' : ''}
                </span>
              )}
              {t.approx_tokens > 0 && (
                <span className="text-xs text-slate-400">~{t.approx_tokens}t</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{t.observation?.slice(0, 100)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
