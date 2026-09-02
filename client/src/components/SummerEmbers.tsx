/**
 * Warm motes rising across the viewport, plus two orange lights washing the
 * background, shown while the Summer range is open.
 *
 * The lights sit behind the page content and the motes in front of it: heat is
 * something you see through, so the glow belongs underneath, while the specks
 * carrying it drift past the viewer.
 */
import { useEffect, useRef } from "react";

type Ember = {
  x: number;
  y: number;
  r: number;
  vy: number;
  drift: number;
  phase: number;
  sway: number;
  alpha: number;
  hue: number;
};

function makeEmber(w: number, h: number, seeded: boolean): Ember {
  return {
    x: Math.random() * w,
    // Seeded ones fill the height; later ones enter from below, so switching
    // the tab on doesn't paint a band of specks along the bottom edge.
    y: seeded ? Math.random() * h : h + 20 + Math.random() * h * 0.3,
    r: 1 + Math.random() * 2.4,
    vy: -(18 + Math.random() * 46),
    drift: -10 + Math.random() * 20,
    phase: Math.random() * Math.PI * 2,
    sway: 8 + Math.random() * 24,
    alpha: 0.35 + Math.random() * 0.5,
    // A narrow band from amber to orange: a wider spread stops reading as one
    // source of heat and starts looking like confetti.
    hue: 22 + Math.random() * 22,
  };
}

export default function SummerEmbers({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const count = window.innerWidth < 768 ? 45 : 90;

    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let embers: Ember[] = [];

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      embers = Array.from({ length: count }, () => makeEmber(w, h, true));
    };

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, w, h);

      for (const e of embers) {
        e.phase += dt * 1.2;
        e.y += e.vy * dt;
        e.x += (e.drift + Math.sin(e.phase) * e.sway) * dt;

        if (e.y + e.r < 0) Object.assign(e, makeEmber(w, h, false));
        if (e.x < -20) e.x = w + 20;
        else if (e.x > w + 20) e.x = -20;

        ctx.globalAlpha = e.alpha;
        ctx.fillStyle = `hsl(${e.hue} 95% 62%)`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
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

  if (!active) return null;

  return (
    <>
      {/* Orange wash, behind the page content. Pure CSS: two soft radial
          gradients drifting is far cheaper than painting a glow per frame. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="summer-light summer-light-a absolute -bottom-[30vh] left-[12%] h-[95vh] w-[85vw] -translate-x-1/2 rounded-[50%]" />
        <div className="summer-light summer-light-b absolute -bottom-[26vh] left-[88%] h-[85vh] w-[80vw] -translate-x-1/2 rounded-[50%]" />
      </div>

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 h-full w-full"
      />
    </>
  );
}
