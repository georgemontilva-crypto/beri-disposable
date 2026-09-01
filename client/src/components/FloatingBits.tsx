/**
 * Ambient droplets and bubbles drifting up the page.
 *
 * Drawn on one canvas: a couple of dozen blurred DOM nodes would each become
 * their own composited layer.
 *
 * Bubbles are stroked rings with a small specular highlight rather than filled
 * circles — a filled disc reads as a dot, while the rim plus highlight is what
 * makes the eye see a bubble. Droplets are teardrops, drawn as a circle with a
 * quadratic tip so they have direction.
 */
import { useEffect, useRef } from "react";

type Kind = "bubble" | "droplet" | "seed";

type Bit = {
  kind: Kind;
  x: number;
  y: number;
  r: number;
  vy: number;
  drift: number;
  phase: number;
  rot: number;
  spin: number;
  alpha: number;
  hueOffset: number;
};

function spawn(b: Bit, w: number, h: number, initial = false): void {
  const roll = Math.random();
  b.kind = roll < 0.45 ? "bubble" : roll < 0.8 ? "droplet" : "seed";
  b.x = Math.random() * w;
  b.y = initial ? Math.random() * h : h + 30 + Math.random() * 60;
  b.r = b.kind === "seed" ? 2 + Math.random() * 2.5 : 4 + Math.random() * 11;
  b.vy = -(10 + Math.random() * 26);
  b.drift = -8 + Math.random() * 16;
  b.phase = Math.random() * Math.PI * 2;
  b.rot = Math.random() * Math.PI * 2;
  b.spin = (Math.random() - 0.5) * 0.9;
  b.alpha = 0.18 + Math.random() * 0.3;
  b.hueOffset = Math.random() * 90;
}

export default function FloatingBits({ count = 24 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let running = false;
    const bits: Bit[] = Array.from({ length: count }, () => ({}) as Bit);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bits.forEach((b) => spawn(b, w, h, true));
    };

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, w, h);

      // Follows the page tint so the bits belong to the background rather than
      // sitting on top of it as a separate palette.
      const baseHue = Number(
        getComputedStyle(document.documentElement).getPropertyValue("--scroll-hue") || 265
      );

      for (const b of bits) {
        b.phase += dt * 0.8;
        b.rot += b.spin * dt;
        b.y += b.vy * dt;
        b.x += (b.drift + Math.sin(b.phase) * 12) * dt;

        if (b.y + b.r < -20) {
          spawn(b, w, h);
          continue;
        }

        const hue = (baseHue + b.hueOffset) % 360;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.globalAlpha = b.alpha;

        if (b.kind === "bubble") {
          ctx.strokeStyle = `hsl(${hue} 85% 72%)`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(0, 0, b.r, 0, Math.PI * 2);
          ctx.stroke();
          // Specular dot: without it the ring reads as an outlined circle.
          ctx.globalAlpha = b.alpha * 0.8;
          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.beginPath();
          ctx.arc(-b.r * 0.32, -b.r * 0.34, Math.max(0.8, b.r * 0.16), 0, Math.PI * 2);
          ctx.fill();
        } else if (b.kind === "droplet") {
          ctx.fillStyle = `hsl(${hue} 85% 66%)`;
          ctx.beginPath();
          ctx.arc(0, 0, b.r, 0, Math.PI);
          ctx.quadraticCurveTo(b.r * 0.75, -b.r * 0.6, 0, -b.r * 2);
          ctx.quadraticCurveTo(-b.r * 0.75, -b.r * 0.6, -b.r, 0);
          ctx.fill();
        } else {
          ctx.fillStyle = `hsl(${hue} 70% 60%)`;
          ctx.beginPath();
          ctx.ellipse(0, 0, b.r, b.r * 1.9, 0, 0, Math.PI * 2);
          ctx.fill();
        }
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
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
