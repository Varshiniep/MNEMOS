import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import "./IntroSplash.css";

import { MnemosLogo } from "./MnemosLogo";
import { markIntroShown } from "./introStorage";

// ─── constants ────────────────────────────────────────────────────────────────

const INTRO_DURATION    = 10_000; // ms
const PARTICLE_COUNT    = 72;
const CONNECTION_DIST   = 130;

// Phases and the elapsed-ms threshold that triggers each one
const PHASE_THRESHOLDS = [
  400,   // 1 — particles settle, seed node appears
  1800,  // 2 — logo draws in
  3400,  // 3 — eyebrow + title
  5100,  // 4 — subtitle
  6700,  // 5 — tagline
  8100,  // 6 — status indicator
] as const;

// ─── particle helpers ─────────────────────────────────────────────────────────

interface Particle {
  x: number; y: number;
  r: number;
  vx: number; vy: number;
  opacity: number;
  colour: string;
}

const COLOURS = [
  "139, 92, 246",   // violet
  "99, 102, 241",   // indigo
  "34, 211, 238",   // cyan
  "255, 255, 255",  // white
];

function makeParticles(w: number, h: number): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.6 + 0.4,
    vx: (Math.random() - 0.5) * 0.26,
    vy: (Math.random() - 0.5) * 0.20,
    opacity: Math.random() * 0.45 + 0.18,
    colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
  }));
}

function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  w: number,
  h: number,
  reduced: boolean,
) {
  ctx.clearRect(0, 0, w, h);

  // Connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < CONNECTION_DIST) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(124,58,237,${(1 - d / CONNECTION_DIST) * 0.13})`;
        ctx.lineWidth   = 0.6;
        ctx.stroke();
      }
    }
  }

  // Nodes
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.colour},${p.opacity})`;
    ctx.fill();

    if (!reduced) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; else if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; else if (p.y > h) p.y = 0;
    }
  }
}

// ─── component ────────────────────────────────────────────────────────────────

interface Props { onComplete: () => void }

export function IntroSplash({ onComplete }: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number | null>(null);
  const startRef     = useRef(0);
  const finishedRef  = useRef(false);
  const particlesRef = useRef<Particle[]>([]);

  const [phase,    setPhase]    = useState(0);
  const [progress, setProgress] = useState(0);
  const [exiting,  setExiting]  = useState(false);

  // ── finish ─────────────────────────────────────────────────────────────────
  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    markIntroShown();
    setProgress(100);
    setExiting(true);
    setTimeout(onComplete, 850);
  }, [onComplete]);

  // ── main animation loop ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w   = window.innerWidth;
      const h   = window.innerHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particlesRef.current = makeParticles(w, h);
    };

    resize();
    window.addEventListener("resize", resize);
    startRef.current = performance.now();

    const tick = (now: number) => {
      if (finishedRef.current) return;

      const elapsed = now - startRef.current;
      const pct     = Math.min(100, (elapsed / INTRO_DURATION) * 100);
      setProgress(pct);

      // Phase gates — only advance
      setPhase(prev => {
        let next = prev;
        for (let i = prev; i < PHASE_THRESHOLDS.length; i++) {
          if (elapsed >= PHASE_THRESHOLDS[i]) next = i + 1;
        }
        return next;
      });

      renderParticles(
        ctx,
        particlesRef.current,
        window.innerWidth,
        window.innerHeight,
        reduced,
      );

      if (elapsed >= INTRO_DURATION) { finish(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };

    // Reduced-motion: skip immediately
    if (reduced) { finish(); return; }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [finish]);

  // ── render ─────────────────────────────────────────────────────────────────

  const phaseClass = (n: number) => phase >= n ? "is-visible" : "";

  return (
    <div
      className={`mnemos-intro${exiting ? " mnemos-intro--exiting" : ""}`}
      aria-label="MNEMOS is loading"
      aria-live="polite"
    >
      {/* Neural particle canvas */}
      <canvas
        ref={canvasRef}
        className="mnemos-intro__canvas"
        aria-hidden="true"
      />

      {/* Subtle fine grid */}
      <div className="mnemos-intro__grid" aria-hidden="true" />

      {/* Ambient aurora blobs */}
      <div className="mnemos-intro__aurora mnemos-intro__aurora--one" aria-hidden="true" />
      <div className="mnemos-intro__aurora mnemos-intro__aurora--two" aria-hidden="true" />

      {/* Skip button */}
      <button
        type="button"
        className="mnemos-intro__skip"
        onClick={finish}
      >
        Skip intro
      </button>

      {/* Central content */}
      <main className="mnemos-intro__content">

        {/* Seed node — pulses before logo appears */}
        <div
          className={`mnemos-intro__seed ${phaseClass(1)} ${phase >= 2 ? "is-expanded" : ""}`}
          aria-hidden="true"
        >
          <span className="mnemos-intro__seed-core" />
          <span className="mnemos-intro__seed-ring mnemos-intro__seed-ring--one" />
          <span className="mnemos-intro__seed-ring mnemos-intro__seed-ring--two" />
          <span className="mnemos-intro__seed-ring mnemos-intro__seed-ring--three" />
        </div>

        {/* Logo mark — draws in at phase 2 */}
        <div className={`mnemos-intro__logo ${phaseClass(2)}`}>
          <div className="mnemos-intro__logo-glow" aria-hidden="true" />
          <MnemosLogo size={96} variant="icon" />
        </div>

        {/* Eyebrow label */}
        <p className={`mnemos-intro__eyebrow ${phaseClass(3)}`}>
          AUTONOMOUS WORLD INTELLIGENCE
        </p>

        {/* Main title */}
        <h1 className={`mnemos-intro__title ${phaseClass(3)}`}>
          MNEMOS
        </h1>

        {/* Subtitle */}
        <div className={`mnemos-intro__subtitle ${phaseClass(4)}`}>
          <span>A SELF-CORRECTING WORLD MODEL</span>
          <span>FOR AUTONOMOUS AGENTS</span>
        </div>

        {/* Tagline */}
        <p className={`mnemos-intro__tagline ${phaseClass(5)}`}>
          BOUNDED CONTEXT
          <span>·</span>
          VERSIONED BELIEFS
          <span>·</span>
          TRANSPARENT CORRECTION
        </p>

        {/* Progress bar */}
        <div className={`mnemos-intro__loader ${phaseClass(1)}`}>
          <div className="mnemos-intro__loader-track">
            <div
              className="mnemos-intro__loader-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mnemos-intro__loader-meta">
            <span>
              {phase < 2
                ? "INITIALISING NEURAL FIELD"
                : phase < 4
                  ? "FORMING WORLD MODEL"
                  : phase < 6
                    ? "SYNCHRONISING BELIEFS"
                    : "SYSTEM READY"}
            </span>
            <span>{String(Math.round(progress)).padStart(3, "0")}%</span>
          </div>
        </div>

      </main>

      {/* Bottom-right status indicator */}
      <div className={`mnemos-intro__status ${phaseClass(6)}`}>
        <span />
        LOCAL-FIRST SYSTEM ONLINE
      </div>
    </div>
  );
}

// ─── sessionStorage helpers ───────────────────────────────────────────────────

export { introAlreadyShown, clearIntroFlag } from "./introStorage";
