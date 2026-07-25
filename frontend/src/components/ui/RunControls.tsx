import { Play, StepForward, Square, RefreshCw, Pause } from 'lucide-react';

interface Props {
  status: string;
  onStart: () => void;
  onStep: () => void;
  onRun: () => void;
  onStop: () => void;
  loading: boolean;
}

export function RunControls({ status, onStart, onStep, onRun, onStop, loading }: Props) {
  const active = status === 'running';
  const done   = status === 'completed' || status === 'stopped';

  return (
    <div className="flex flex-wrap gap-2">
      {!active && (
        <button onClick={onStart} disabled={loading} className="btn-primary">
          <RefreshCw size={14} />{done ? 'New Run' : 'Start'}
        </button>
      )}
      {active && (
        <>
          <button onClick={onStep} disabled={loading} className="btn-outline">
            <StepForward size={14} />Step
          </button>
          <button onClick={onRun} disabled={loading} className="btn-primary">
            <Play size={14} />Auto Run
          </button>
          <button onClick={onStop} disabled={loading}
            className="btn-outline"
            style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#f87171' }}>
            <Square size={14} />Stop
          </button>
        </>
      )}
      {done && !active && (
        <button onClick={onStart} disabled={loading} className="btn-primary">
          <RefreshCw size={14} />New Run
        </button>
      )}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-500 self-center">
          <span className="w-3.5 h-3.5 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
          Working…
        </div>
      )}
    </div>
  );
}
