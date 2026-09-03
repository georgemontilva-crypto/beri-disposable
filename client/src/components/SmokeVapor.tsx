/**
 * Vapour rising from the bottom of the page.
 *
 * The naive version of this effect — soft radial gradients drifting upward —
 * reads as circles no matter how they move, because a radial gradient has a
 * perfectly even edge and smoke never does. Three things fix that:
 *
 *  1. The sprites are fractal value noise masked by a radial falloff, so every
 *     puff has a ragged, cloudy outline instead of a clean rim.
 *  2. Each puff rotates as it rises, which keeps the outline changing and stops
 *     the eye from locking onto a fixed shape.
 *  3. Puffs stretch horizontally as they climb and drift along two sine waves
 *     of different frequency, an approximation of the way real vapour shears
 *     and curls as it slows down.
 *
 * Several sprite variants are pre-rendered at mount so puffs don't repeat, and
 * are then stamped with drawImage: generating noise per frame would be far too
 * expensive, while blitting a cached bitmap is nearly free.
 */
import { makeNoiseSprite } from "@/lib/noiseSprite";
import { useEffect, useRef, useState } from "react";

type Puff = {
  x: number;
  y: number;
  r: number;
  growth: number;
  vy: number;
  drift: number;
  phase: number;
  phase2: number;
  rot: number;
  spin: number;
  /** Horizontal stretch; grows as the puff rises and slows. */
  stretch: number;
  life: number;
  lifeSpeed: number;
  alpha: number;
  sprite: number;
};

const COUNT = 22;
const SPRITE_VARIANTS = 4;
const SPRITE_SIZE = 192;

/* ─── Particles ───────────────────────────────────────────────────────────── */

function spawn(p: Puff, w: number, h: number, initial = false) {
  p.x = Math.random() * w;
  // Stagger the first fill so the page doesn't open with one solid band.
  p.y = initial ? h * (0.45 + Math.random() * 1.0) : h + 80 + Math.random() * 90;
  p.r = 70 + Math.random() * 120;
  p.growth = 18 + Math.random() * 30;
  p.vy = -(14 + Math.random() * 30);
  p.drift = -10 + Math.random() * 20;
  p.phase = Math.random() * Math.PI * 2;
  p.phase2 = Math.random() * Math.PI * 2;
  p.rot = Math.random() * Math.PI * 2;
  p.spin = (Math.random() - 0.5) * 0.22;
  p.stretch = 1;
  p.life = initial ? Math.random() * 0.7 : 0;
  p.lifeSpeed = 0.04 + Math.random() * 0.045;
  p.alpha = 0.13 + Math.random() * 0.16;
  p.sprite = Math.floor(Math.random() * SPRITE_VARIANTS);
}

export default function SmokeVapor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Off on phones. This is the heaviest thing on the page — a full-screen canvas
   * restamping twenty-two large sprites every frame — and it is pure
   * decoration, so it drains battery for no benefit on the devices least able
   * to spare it. The colour glow behind it is CSS-only and stays.
   *
   * Tracked as state rather than an early return so that crossing the
   * breakpoint (rotating a tablet, resizing a window) actually tears the canvas
   * down or brings it back, instead of leaving whatever was decided at mount.
   */
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const phone = window.matchMedia("(max-width: 767px)");
    const update = () => setEnabled(!reduced.matches && !phone.matches);
    update();
    reduced.addEventListener("change", update);
    phone.addEventListener("change", update);
    return () => {
      reduced.removeEventListener("change", update);
      phone.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sprites = Array.from({ length: SPRITE_VARIANTS }, (_, i) =>
      makeNoiseSprite(i * 7919 + 13, SPRITE_SIZE)
    );
    // The effect is diffuse; extra resolution buys nothing and costs fill rate.
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
        if (p.life >= 1 || p.y + p.r < -60) {
          spawn(p, w, h);
          continue;
        }

        p.phase += dt * 0.55;
        p.phase2 += dt * 0.23;
        p.rot += p.spin * dt;
        p.y += p.vy * dt;
        // Two sine waves at unrelated frequencies: a single one reads as a
        // regular S-curve, two of them wander.
        p.x += (p.drift + Math.sin(p.phase) * 14 + Math.sin(p.phase2) * 22) * dt;
        p.r += p.growth * dt;
        // Vapour spreads sideways as it loses momentum.
        p.stretch += dt * 0.16;

        const envelope = p.life < 0.18 ? p.life / 0.18 : 1 - (p.life - 0.18) / 0.82;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha * envelope);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(p.stretch, 1 / Math.sqrt(p.stretch));
        ctx.drawImage(sprites[p.sprite], -p.r, -p.r, p.r * 2, p.r * 2);
        ctx.restore();
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
  }, [enabled]);

  // Unmounted rather than hidden, so the canvas element and its backing store
  // are released instead of sitting idle in memory.
  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
