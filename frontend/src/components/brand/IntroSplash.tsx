import { useEffect, useRef, useState } from 'react';
import { MnemosLogo } from './MnemosLogo';
import { StarField } from './StarField';

interface Props { onComplete: () => void }

const DURATION_MS = 9_000;
const SKIP_KEY = 'mnemos_intro_done';

export function IntroSplash({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase]       = useState(0);
  const [exiting, setExiting]   = useState(false);
  const startRef = useRef<number>(0);
  const rafRef   = useRef<number>(0);
  const doneRef  = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    sessionStorage.setItem(SKIP_KEY, '1');
    setExiting(true);
    setTimeout(onComplete, 800);
  };

  useEffect(() => {
    startRef.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const pct = Math.min(100, (elapsed / DURATION_MS) * 100);
      setProgress(pct);
      if (elapsed > 600  && phase < 1) setPhase(1);
      if (elapsed > 1800 && phase < 2) setPhase(2);
      if (elapsed > 3200 && phase < 3) setPhase(3);
      if (elapsed > 4800 && phase < 4) setPhase(4);
      if (pct >= 100) { finish(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { /* phase sync only */ }, [phase]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none
        transition-opacity duration-700 ease-in-out ${exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ background: '#000' }}
    >
      {/* Star field */}
      <StarField density={200} />

      {/* Deep radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 60% at 50% 55%, rgba(99,102,241,0.12) 0%, transparent 70%)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 40% 40% at 50% 52%, rgba(139,92,246,0.08) 0%, transparent 60%)',
      }} />

      {/* Skip */}
      <button
        onClick={finish}
        className="absolute top-6 right-6 text-[11px] text-slate-600 hover:text-slate-400
          transition-colors border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg
          font-mono tracking-widest uppercase"
        aria-label="Skip intro"
      >
        Skip
      </button>

      {/* Main content */}
      <div className="flex flex-col items-center gap-10 text-center px-6 relative z-10">

        {/* Logo */}
        <div
          className="transition-all duration-1000"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'scale(1)' : 'scale(0.6)',
            filter: phase >= 1 ? 'drop-shadow(0 0 40px rgba(139,92,246,0.8)) drop-shadow(0 0 80px rgba(99,102,241,0.4))' : 'none',
          }}
        >
          <MnemosLogo size={96} variant="icon" />
        </div>

        {/* System name */}
        <div
          className="transition-all duration-800"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '100ms',
          }}
        >
          <h1
            className="text-glow"
            style={{
              fontSize: 'clamp(3.5rem, 10vw, 7rem)',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              color: '#ffffff',
              lineHeight: 1,
            }}
          >
            MNEMOS
          </h1>
        </div>

        {/* Subtitle */}
        <div
          className="transition-all duration-700 space-y-2"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(16px)',
            transitionDelay: '80ms',
          }}
        >
          <p style={{ fontSize: 16, fontWeight: 300, color: '#94a3b8', letterSpacing: '0.02em' }}>
            A SELF-CORRECTING WORLD MODEL
          </p>
          <p style={{ fontSize: 16, fontWeight: 300, color: '#94a3b8', letterSpacing: '0.02em' }}>
            FOR AUTONOMOUS AGENTS
          </p>
        </div>

        {/* Tagline */}
        <div
          className="transition-all duration-700"
          style={{
            opacity: phase >= 4 ? 1 : 0,
            transform: phase >= 4 ? 'translateY(0)' : 'translateY(12px)',
            transitionDelay: '60ms',
          }}
        >
          <p className="mono" style={{ fontSize: 11, color: 'rgba(139,92,246,0.85)', letterSpacing: '0.2em' }}>
            BOUNDED CONTEXT · CORRECTABLE BELIEFS · TRANSPARENT REASONING
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ width: 280, marginTop: 8 }}>
          <div className="progress-track" style={{ height: 2 }}>
            <div className="progress-fill" style={{ width: `${progress}%`, height: '100%' }} />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 8,
            fontFamily: 'monospace',
            fontSize: 10,
            color: '#2d3748',
            letterSpacing: '0.1em',
          }}>
            <span>LOADING SYSTEM</span>
            <span>{Math.round(progress).toString().padStart(3,'0')}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function introAlreadyShown(): boolean {
  return sessionStorage.getItem(SKIP_KEY) === '1';
}

export function clearIntroFlag(): void {
  sessionStorage.removeItem(SKIP_KEY);
}
