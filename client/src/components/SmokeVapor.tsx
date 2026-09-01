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
import { useEffect, useRef } from "react";

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

/* ─── Fractal value noise ─────────────────────────────────────────────────── */

function hash2(x: number, y: number, seed: number): number {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2147483647);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

/** Cubic smoothstep — linear interpolation would leave visible lattice creases. */
const fade = (t: number) => t * t * (3 - 2 * t);

function valueNoise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = fade(x - xi);
  const yf = fade(y - yi);
  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
}

/** Four octaves: enough structure to look like vapour, cheap enough at mount. */
function fbm(x: number, y: number, seed: number): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < 4; i++) {
    value += valueNoise(x * frequency, y * frequency, seed + i * 101) * amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

function makeSprite(seed: number): HTMLCanvasElement {
  const size = SPRITE_SIZE;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const data = img.data;
  const half = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm((x / size) * 3.2, (y / size) * 3.2, seed);

      // Radial falloff, squared so the centre stays dense and the rim dissolves.
      const dx = (x - half) / half;
      const dy = (y - half) / half;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const falloff = dist >= 1 ? 0 : Math.pow(1 - dist, 2.1);

      // Lifting the threshold is what carves the ragged holes; without it the
      // noise just modulates brightness and the silhouette stays a disc.
      const density = Math.max(0, n * 1.9 - 0.5) * falloff;

      const i = (y * size + x) * 4;
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = Math.min(255, density * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

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

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sprites = Array.from({ length: SPRITE_VARIANTS }, (_, i) => makeSprite(i * 7919 + 13));
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
