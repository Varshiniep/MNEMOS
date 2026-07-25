import { useEffect, useRef } from 'react';

interface Star { x: number; y: number; r: number; o: number; dx: number; dy: number }

interface Props {
  density?: number;
  className?: string;
}

export function StarField({ density = 160, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Respect reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let W = 0, H = 0;
    const stars: Star[] = [];

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };

    const spawn = () => {
      stars.length = 0;
      for (let i = 0; i < density; i++) {
        stars.push({
          x:  Math.random() * W,
          y:  Math.random() * H,
          r:  Math.random() * 1.2 + 0.2,
          o:  Math.random() * 0.7 + 0.1,
          dx: (Math.random() - 0.5) * 0.06,
          dy: (Math.random() - 0.5) * 0.04,
        });
      }
    };

    resize();
    spawn();

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.o})`;
        ctx.fill();

        if (!prefersReduced) {
          s.x += s.dx;
          s.y += s.dy;
          if (s.x < 0) s.x = W;
          if (s.x > W) s.x = 0;
          if (s.y < 0) s.y = H;
          if (s.y > H) s.y = 0;
        }
      }
      raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(() => { resize(); spawn(); });
    ro.observe(canvas);
    draw();

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
