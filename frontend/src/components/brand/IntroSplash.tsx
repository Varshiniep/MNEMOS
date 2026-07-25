import { useEffect, useRef, useState } from 'react';
import { MnemosLogo } from './MnemosLogo';

interface Props {
  onComplete: () => void;
}

const DURATION_MS = 10_000;
const SKIP_KEY = 'mnemos_intro_done';

export function IntroSplash({ onComplete }: Props) {
  const [progress, setProgress]   = useState(0);
  const [phase, setPhase]         = useState(0); // 0=logo 1=title 2=subtitle 3=tagline 4=complete
  const [exiting, setExiting]     = useState(false);
  const startRef = useRef<number>(0);
  const rafRef   = useRef<number>(0);
  const doneRef  = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    sessionStorage.setItem(SKIP_KEY, '1');
    setExiting(true);
    setTimeout(onComplete, 700);
  };

  useEffect(() => {
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const pct = Math.min(100, (elapsed / DURATION_MS) * 100);
      setProgress(pct);

      if (elapsed > 1200 && phase < 1) setPhase(1);
      if (elapsed > 2600 && phase < 2) setPhase(2);
      if (elapsed > 4000 && phase < 3) setPhase(3);

      if (pct >= 100) { finish(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase gate needs current phase
  useEffect(() => {
    if (phase >= 3) {
      /* already updated via RAF */
    }
  }, [phase]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center
        transition-opacity duration-700 ${exiting ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'radial-gradient(ellipse at 50% 60%, #0d1333 0%, #050818 100%)' }}
    >
      {/* Animated dot grid */}
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

      {/* Subtle radial glow behind logo */}
      <div
        className="absolute"
        style={{
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(79,70,229,0.18) 0%, transparent 70%)',
          borderRadius: '50%',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Skip button */}
      <button
        onClick={finish}
        className="absolute top-6 right-6 text-xs text-slate-500 hover:text-slate-300
          transition-colors border border-slate-700 hover:border-slate-500
          px-3 py-1.5 rounded-lg"
        aria-label="Skip intro"
      >
        Skip intro
      </button>

      {/* Content */}
      <div className="flex flex-col items-center gap-8 text-center px-6">
        {/* Logo */}
        <div
          className={`transition-all duration-1000 ${phase >= 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
          style={{ filter: phase >= 0 ? 'drop-shadow(0 0 30px rgba(124,58,237,0.7))' : 'none' }}
        >
          <MnemosLogo size={88} variant="icon" />
        </div>

        {/* Project name */}
        <div
          className={`transition-all duration-700 delay-300 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <h1
            className="text-6xl font-black tracking-tighter text-white text-glow"
            style={{ letterSpacing: '-0.03em' }}
          >
            MNEMOS
          </h1>
        </div>

        {/* Subtitle */}
        <div
          className={`transition-all duration-700 delay-200 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <p className="text-xl text-slate-300 font-light max-w-xl leading-relaxed">
            A Self-Correcting World Model for Autonomous Agents
          </p>
        </div>

        {/* Tagline */}
        <div
          className={`transition-all duration-700 delay-200 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <p className="text-sm tracking-widest text-indigo-400 uppercase font-medium">
            Bounded Context&nbsp;&nbsp;·&nbsp;&nbsp;Correctable Beliefs&nbsp;&nbsp;·&nbsp;&nbsp;Transparent Reasoning
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-72 mt-4">
          <div className="progress-track h-[3px]">
            <div className="progress-fill h-[3px]" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-[11px] text-slate-600">
            <span>Initialising</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Returns true if the intro has already been shown this session */
export function introAlreadyShown(): boolean {
  return sessionStorage.getItem(SKIP_KEY) === '1';
}

/** Force-replay the intro on next load */
export function clearIntroFlag(): void {
  sessionStorage.removeItem(SKIP_KEY);
}
