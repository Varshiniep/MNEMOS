import { Play, StepForward, Square, RefreshCw } from 'lucide-react';

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
        <button
          onClick={onStart}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          <RefreshCw size={14} />Start / Reset
        </button>
      )}
      {active && (
        <>
          <button
            onClick={onStep}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 disabled:opacity-50 transition"
          >
            <StepForward size={14} />Step
          </button>
          <button
            onClick={onRun}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            <Play size={14} />Run to end
          </button>
          <button
            onClick={onStop}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition"
          >
            <Square size={14} />Stop
          </button>
        </>
      )}
      {done && (
        <button
          onClick={onStart}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          <RefreshCw size={14} />New Run
        </button>
      )}
    </div>
  );
}
