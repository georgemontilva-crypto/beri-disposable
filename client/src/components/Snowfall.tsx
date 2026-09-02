/**
 * Snow across the whole viewport, switched on while the Winter range is open.
 *
 * Fixed rather than absolute so the flakes keep falling as the page scrolls,
 * and drawn above the content: snow that renders behind the cards reads as a
 * background texture, not as weather.
 *
 * One canvas, no DOM nodes — a hundred animated divs would each become their
 * own composited layer.
 */
import { useEffect, useRef } from "react";

type Flake = {
  x: number;
  y: number;
  r: number;
  vy: number;
  drift: number;
  phase: number;
  sway: number;
  alpha: number;
};

function makeFlake(w: number, h: number, seeded: boolean): Flake {
  return {
    x: Math.random() * w,
    // Seeded flakes start spread through the height; later ones enter from the
    // top, so switching the tab on doesn't paint a band of snow at y=0.
    y: seeded ? Math.random() * h : -20 - Math.random() * h * 0.3,
    r: 1 + Math.random() * 2.6,
    vy: 22 + Math.random() * 48,
    drift: -12 + Math.random() * 24,
    phase: Math.random() * Math.PI * 2,
    sway: 10 + Math.random() * 26,
    alpha: 0.35 + Math.random() * 0.5,
  };
}

export default function Snowfall({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Fewer flakes on a phone: the same count over a narrow viewport reads as a
    // blizzard, and costs more per pixel of screen.
    const count = window.innerWidth < 768 ? 55 : 110;

    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let flakes: Flake[] = [];

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      flakes = Array.from({ length: count }, () => makeFlake(w, h, true));
    };

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#ffffff";

      for (const f of flakes) {
        f.phase += dt * 1.1;
        f.y += f.vy * dt;
        f.x += (f.drift + Math.sin(f.phase) * f.sway) * dt;

        if (f.y - f.r > h) Object.assign(f, makeFlake(w, h, false));
        if (f.x < -20) f.x = w + 20;
        else if (f.x > w + 20) f.x = -20;

        ctx.globalAlpha = f.alpha;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    start();

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", resize);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  // Unmounted when off, so the canvas and its backing store are released
  // rather than sitting idle.
  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 h-full w-full"
    />
  );
}
