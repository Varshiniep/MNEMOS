/**
 * IntroSplash.tsx
 *
 * Premium 10-second cinematic MNEMOS intro.
 *
 * Timeline (no external animation library required):
 *   0–2 s  → neural particles drift in; a central node pulses into existence
 *   2–4 s  → lines draw outward from the centre, revealing the logo mark
 *   4–6 s  → "MNEMOS" title fades + scales up with a violet glow
 *   6–8 s  → subtitle and tagline fade in sequentially
 *   8–10 s → progress bar fills; entire scene fades / scales out to landing page
 *
 * Only files edited: IntroSplash.tsx, index.css (intro section)
 * Nothing else is touched.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { MnemosLogo } from './MnemosLogo';

// ─── constants ────────────────────────────────────────────────────────────────

const DURATION_MS = 10_000;
const SKIP_KEY    = 'mnemos_intro_done';

// Neural-particle parameters
const PARTICLE_COUNT = 90;
const MAX_LINK_DIST  = 130;

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  opacity: number;
  color: string;
}

const PARTICLE_COLORS = [
  'rgba(139,92,246,',   // violet
  'rgba(99,102,241,',   // indigo
  'rgba(34,211,238,',   // cyan
  'rgba(255,255,255,',  // white
];

// ─── canvas helper ────────────────────────────────────────────────────────────

function initParticles(W: number, H: number): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x:  Math.random() * W,
    y:  Math.random() * H,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.25,
    r:  Math.random() * 1.6 + 0.4,
    opacity: Math.random() * 0.5 + 0.2,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
  }));
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  W: number, H: number,
  globalAlpha: number,
  prefersReduced: boolean,
) {
  ctx.clearRect(0, 0, W, H);

  // Draw links
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < MAX_LINK_DIST) {
        const linkAlpha = (1 - d / MAX_LINK_DIST) * 0.18 * globalAlpha;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(139,92,246,${linkAlpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }

  // Draw nodes
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `${p.color}${p.opacity * globalAlpha})`;
    ctx.fill();
  }

  // Move
  if (!prefersReduced) {
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0)  p.x = W;
      if (p.x > W)  p.x = 0;
      if (p.y < 0)  p.y = H;
      if (p.y > H)  p.y = 0;
    }
  }
}

// ─── component ────────────────────────────────────────────────────────────────

interface Props { onComplete: () => void }

export function IntroSplash({ onComplete }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const startRef   = useRef(0);
  const rafRef     = useRef(0);
  const doneRef    = useRef(false);
  const particles  = useRef<Particle[]>([]);

  const [phase,    setPhase]    = useState(0);   // 0→5  drives CSS transitions
  const [progress, setProgress] = useState(0);   // 0–100
  const [exiting,  setExiting]  = useState(false);

  // ── finish / skip ──────────────────────────────────────────────────────────

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    sessionStorage.setItem(SKIP_KEY, '1');
    setExiting(true);
    setTimeout(onComplete, 900);
  }, [onComplete]);

  // ── main RAF loop ──────────────────────────────────────────────────────────

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particles.current = initParticles(canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    startRef.current = performance.now();

    const tick = (now: number) => {
      if (doneRef.current) return;

      const elapsed = now - startRef.current;
      const pct     = Math.min(100, (elapsed / DURATION_MS) * 100);

      // Phase gate — only advance forward
      setPhase(prev => {
        if (elapsed > 400   && prev < 1) return 1;  // particles visible
        if (elapsed > 2000  && prev < 2) return 2;  // logo draws
        if (elapsed > 4000  && prev < 3) return 3;  // title appears
        if (elapsed > 5800  && prev < 4) return 4;  // subtitle appears
        if (elapsed > 7200  && prev < 5) return 5;  // tagline appears
        return prev;
      });

      setProgress(pct);

      // Particle global alpha — fade in over first 1.5 s
      const pAlpha = Math.min(1, elapsed / 1500);

      drawParticles(
        ctx,
        particles.current,
        canvas.width,
        canvas.height,
        pAlpha,
        prefersReduced,
      );

      if (pct >= 100) { finish(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };

    if (prefersReduced) {
      // Skip straight to end
      setPhase(5); setProgress(100);
      finish();
      return () => { ro.disconnect(); };
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [finish]);

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className={`intro-root ${exiting ? 'intro-exit' : ''}`}
      aria-live="polite"
      aria-label="MNEMOS loading"
    >
      {/* Neural particle canvas — full viewport */}
      <canvas ref={canvasRef} className="intro-canvas" aria-hidden="true" />

      {/* Deep glow blobs */}
      <div className="intro-glow-1" aria-hidden="true" />
      <div className="intro-glow-2" aria-hidden="true" />

      {/* Skip button */}
      <button
        onClick={finish}
        className="intro-skip"
        aria-label="Skip intro"
      >
        SKIP
      </button>

      {/* Central content stack */}
      <div className="intro-content">

        {/* ── Phase 1: central pulsing node (precedes logo) ── */}
        <div
          className={`intro-seed ${phase >= 1 ? 'visible' : ''} ${phase >= 2 ? 'hidden-node' : ''}`}
          aria-hidden="true"
        >
          <div className="intro-seed-core" />
          <div className="intro-seed-ring ring-1" />
          <div className="intro-seed-ring ring-2" />
          <div className="intro-seed-ring ring-3" />
        </div>

        {/* ── Phase 2: logo mark draws in ── */}
        <div className={`intro-logo-wrap ${phase >= 2 ? 'visible' : ''}`}>
          <div className="intro-logo-glow" aria-hidden="true" />
          <MnemosLogo size={88} variant="icon" />
        </div>

        {/* ── Phase 3: MNEMOS title ── */}
        <div className={`intro-title-wrap ${phase >= 3 ? 'visible' : ''}`}>
          <h1 className="intro-title">MNEMOS</h1>
        </div>

        {/* ── Phase 4: subtitle ── */}
        <div className={`intro-subtitle-wrap ${phase >= 4 ? 'visible' : ''}`}>
          <p className="intro-subtitle">
            A SELF-CORRECTING WORLD MODEL
          </p>
          <p className="intro-subtitle" style={{ transitionDelay: '180ms' }}>
            FOR AUTONOMOUS AGENTS
          </p>
        </div>

        {/* ── Phase 5: tagline ── */}
        <div className={`intro-tagline-wrap ${phase >= 5 ? 'visible' : ''}`}>
          <p className="intro-tagline">
            BOUNDED CONTEXT&nbsp;&nbsp;·&nbsp;&nbsp;VERSIONED BELIEFS&nbsp;&nbsp;·&nbsp;&nbsp;TRANSPARENT CORRECTION
          </p>
        </div>

        {/* ── Progress bar (always visible once phase ≥ 1) ── */}
        <div className={`intro-bar-wrap ${phase >= 1 ? 'visible' : ''}`}>
          <div className="intro-bar-track">
            <div
              className="intro-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="intro-bar-labels">
            <span>INITIALISING WORLD MODEL</span>
            <span className="intro-pct">{String(Math.round(progress)).padStart(3, '0')}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── public helpers ────────────────────────────────────────────────────────────

export function introAlreadyShown(): boolean {
  return sessionStorage.getItem(SKIP_KEY) === '1';
}

export function clearIntroFlag(): void {
  sessionStorage.removeItem(SKIP_KEY);
}
