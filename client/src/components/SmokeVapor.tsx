/**
 * Vapour rising from the bottom of the page.
 *
 * One canvas rather than DOM nodes: thirty blurred divs would have the browser
 * compositing thirty layers every frame.
 *
 * The puffs are drawn from a single pre-rendered sprite. Building a radial
 * gradient per particle per frame is the expensive part of an effect like this
 * — creating the gradient object costs far more than blitting an image — so the
 * soft blob is rasterised once and then stamped with drawImage at different
 * scales and alphas.
 */
import { useEffect, useRef } from "react";

type Puff = {
  x: number;
  y: number;
  /** Current radius in px. */
  r: number;
  growth: number;
  vy: number;
  drift: number;
  phase: number;
  /** 0 → 1 through the puff's life, drives the fade in and out. */
  life: number;
  lifeSpeed: number;
  alpha: number;
};

const COUNT = 26;

/** Rasterises the soft blob once; every puff is a scaled copy of this. */
function makeSprite(): HTMLCanvasElement {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,0.9)");
  g.addColorStop(0.35, "rgba(255,255,255,0.35)");
  g.addColorStop(0.7, "rgba(255,255,255,0.08)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return c;
}

function spawn(p: Puff, w: number, h: number, initial = false) {
  p.x = Math.random() * w;
  // Stagger the first fill so the page doesn't open with one solid band.
  p.y = initial ? h * (0.5 + Math.random() * 0.9) : h + 60 + Math.random() * 80;
  p.r = 60 + Math.random() * 110;
  p.growth = 14 + Math.random() * 26;
  p.vy = -(16 + Math.random() * 34);
  p.drift = -14 + Math.random() * 28;
  p.phase = Math.random() * Math.PI * 2;
  p.life = initial ? Math.random() * 0.7 : 0;
  p.lifeSpeed = 0.045 + Math.random() * 0.05;
  p.alpha = 0.1 + Math.random() * 0.13;
}

export default function SmokeVapor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sprite = makeSprite();
    // Soft, diffuse effect: 1.5 is plenty and keeps fill rate down on retina.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let running = false;
    const puffs: Puff[] = Array.from({ length: COUNT }, () => ({}) as Puff);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      puffs.forEach((p) => spawn(p, w, h, true));
    };

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      ctx.clearRect(0, 0, w, h);

      for (const p of puffs) {
        p.life += p.lifeSpeed * dt;
        if (p.life >= 1 || p.y + p.r < -40) {
          spawn(p, w, h);
          continue;
        }
        p.phase += dt * 0.6;
        p.y += p.vy * dt;
        p.x += (p.drift + Math.sin(p.phase) * 16) * dt;
        p.r += p.growth * dt;

        // Fade in over the first fifth of the life, out across the rest, so a
        // puff never pops into existence at full strength.
        const envelope =
          p.life < 0.2 ? p.life / 0.2 : 1 - (p.life - 0.2) / 0.8;

        ctx.globalAlpha = Math.max(0, p.alpha * envelope);
        ctx.drawImage(sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    start();

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      stop();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
