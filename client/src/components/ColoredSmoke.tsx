/**
 * Coloured smoke ribbons for the zero-nicotine range.
 *
 * Same fractal-noise sprites as the vapour on the homepage, but tinted and
 * shaped differently: cigarette smoke rises in thin ribbons rather than round
 * puffs, so each stamp is stretched vertically and the sway is wider than it
 * is fast.
 *
 * Drawn additively. On a near-black section, overlapping colours brighten where
 * they cross instead of muddying — which is what makes coloured smoke read as
 * light rather than as paint.
 */
import { makeNoiseSprite, tintSprite } from "@/lib/noiseSprite";
import { useEffect, useRef, useState } from "react";

type Puff = {
  x: number;
  y: number;
  r: number;
  growth: number;
  vy: number;
  drift: number;
  phase: number;
  rot: number;
  spin: number;
  life: number;
  lifeSpeed: number;
  alpha: number;
  sprite: number;
};

const COUNT = 26;
/** One tinted set per hue; puffs pick from these rather than tinting per draw. */
const COLORS = [
  "#ff2f87",
  "#a855f7",
  "#35b8ff",
  "#3ddc97",
  "#ffd23d",
  "#ff7a3d",
];
const SHAPES = 3;

function spawn(
  p: Puff,
  w: number,
  h: number,
  variants: number,
  intensity: number,
  initial = false
) {
  p.x = Math.random() * w;
  // Seeded puffs fill the height; later ones enter from below, so switching to
  // this tab doesn't paint a band along the bottom edge.
  p.y = initial ? Math.random() * h : h + 60 + Math.random() * 120;
  p.r = 50 + Math.random() * 90;
  p.growth = 12 + Math.random() * 22;
  p.vy = -(20 + Math.random() * 38);
  p.drift = -8 + Math.random() * 16;
  p.phase = Math.random() * Math.PI * 2;
  p.rot = Math.random() * Math.PI * 2;
  p.spin = (Math.random() - 0.5) * 0.18;
  p.life = initial ? Math.random() * 0.7 : 0;
  p.lifeSpeed = 0.05 + Math.random() * 0.05;
  p.alpha = (0.1 + Math.random() * 0.16) * intensity;
  p.sprite = Math.floor(Math.random() * variants);
}

export default function ColoredSmoke({
  active,
  intensity = 1,
}: {
  active: boolean;
  /**
   * Scales opacity and puff count together. Raising only the opacity turns the
   * ribbons into flat washes; adding puffs with it keeps the layering that
   * makes them read as smoke.
   */
  intensity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    if (!active || !enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Every shape in every colour, built once.
    const masks = Array.from({ length: SHAPES }, (_, i) => makeNoiseSprite(i * 7919 + 31));
    const sprites = COLORS.flatMap((color) => masks.map((m) => tintSprite(m, color)));

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const count = Math.round(COUNT * Math.min(intensity, 2));
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    const puffs: Puff[] = Array.from({ length: count }, () => ({}) as Puff);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      puffs.forEach((p) => spawn(p, w, h, sprites.length, intensity, true));
    };

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (const p of puffs) {
        p.life += p.lifeSpeed * dt;
        if (p.life >= 1 || p.y + p.r < -80) {
          spawn(p, w, h, sprites.length, intensity);
          continue;
        }
        p.phase += dt * 0.5;
        p.rot += p.spin * dt;
        p.y += p.vy * dt;
        p.x += (p.drift + Math.sin(p.phase) * 26) * dt;
        p.r += p.growth * dt;

        const envelope = p.life < 0.2 ? p.life / 0.2 : 1 - (p.life - 0.2) / 0.8;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha * envelope);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        // Taller than wide: a ribbon, not a cloud.
        ctx.scale(0.62, 1.5);
        ctx.drawImage(sprites[p.sprite], -p.r, -p.r, p.r * 2, p.r * 2);
        ctx.restore();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
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
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      stop();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active, enabled, intensity]);

  if (!active || !enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
