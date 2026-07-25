import { Play, StepForward, Square, RefreshCw } from 'lucide-react';

interface Props {
  status: string;
  onStart: () => void;
  onStep:  () => void;
  onRun:   () => void;
  onStop:  () => void;
  loading: boolean;
}

export function RunControls({ status, onStart, onStep, onRun, onStop, loading }: Props) {
  const active = status === 'running';
  const done   = status === 'completed' || status === 'stopped';

  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
      {!active && (
        <button onClick={onStart} disabled={loading} className="btn-primary">
          <RefreshCw size={13} />{done ? 'NEW RUN' : 'START'}
        </button>
      )}
      {active && (
        <>
          <button onClick={onStep} disabled={loading} className="btn-outline">
            <StepForward size={13} />STEP
          </button>
          <button onClick={onRun} disabled={loading} className="btn-primary">
            <Play size={13} />AUTO RUN
          </button>
          <button onClick={onStop} disabled={loading} className="btn-danger">
            <Square size={13} />STOP
          </button>
        </>
      )}
      {done && !active && (
        <button onClick={onStart} disabled={loading} className="btn-primary">
          <RefreshCw size={13} />NEW RUN
        </button>
      )}
      {loading && (
        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:'#374151', alignSelf:'center' }}>
          <span className="w-3.5 h-3.5 border border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="mono" style={{ letterSpacing:'0.1em' }}>WORKING</span>
        </div>
      )}
    </div>
  );
}
