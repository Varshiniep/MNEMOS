import { ChevronRight, AlertCircle, Zap } from 'lucide-react';
import type { TurnRecord } from '../../types/api';

interface Props { turns: TurnRecord[]; maxVisible?: number }

export function TurnTimeline({ turns, maxVisible = 20 }: Props) {
  const visible = turns.slice(-maxVisible).reverse();
  if (visible.length === 0) return (
    <p className="text-sm text-slate-500 py-6 text-center">No turns yet.</p>
  );
  return (
    <div className="space-y-2">
      {visible.map(t => (
        <div key={t.turn}
          className="flex gap-3 items-start p-3 rounded-xl transition-colors hover:bg-white/[0.03]"
          style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: 'rgba(79,70,229,0.25)', color: '#a78bfa' }}>
            {t.turn}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded"
                style={{ background: 'rgba(79,70,229,0.15)', color: '#a78bfa' }}>
                <ChevronRight size={9} />{t.action || '[reset]'}
              </span>
              {t.reward > 0 && (
                <span className="badge badge-green flex items-center gap-1">
                  <Zap size={9} />+{t.reward}
                </span>
              )}
              {t.corrections.length > 0 && (
                <span className="badge badge-amber flex items-center gap-1">
                  <AlertCircle size={9} />{t.corrections.length} correction{t.corrections.length > 1 ? 's' : ''}
                </span>
              )}
              {t.approx_tokens > 0 && (
                <span className="text-[10px] text-slate-600">~{t.approx_tokens}t</span>
              )}
            </div>
            <p className="text-xs text-slate-600 truncate">{t.observation?.slice(0, 100)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
