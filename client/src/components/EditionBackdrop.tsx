/**
 * Ambient particle backdrop behind the flavor grid, themed per edition.
 *
 * Drawn on a single canvas rather than animated DOM nodes: sixty falling
 * elements as divs would have the browser recalculating layout every frame,
 * while one canvas is a single composited layer.
 *
 * The animation stops when it scrolls out of view, when the tab is hidden, and
 * when the visitor asks for reduced motion.
 */
import { useEffect, useRef } from "react";

export type EditionTheme = "none" | "winter" | "summer";

type Particle = {
  x: number;
  y: number;
  r: number;
  /** Horizontal and vertical speed, px per second. */
  vx: number;
  vy: number;
  alpha: number;
  /** Phase offset so particles sway out of step with each other. */
  phase: number;
  swayAmount: number;
};

const THEMES: Record<
  Exclude<EditionTheme, "none">,
  { count: number; color: (a: number) => string; glow?: string }
> = {
  winter: {
    count: 70,
    color: (a) => `rgba(226, 240, 255, ${a})`,
  },
  summer: {
    count: 45,
    // Warm amber, reading as sun-lit motes drifting upward.
    color: (a) => `rgba(255, 206, 120, ${a})`,
    glow: "rgba(255, 168, 76, 0.10)",
  },
};

function makeParticle(theme: Exclude<EditionTheme, "none">, w: number, h: number): Particle {
  if (theme === "winter") {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1 + Math.random() * 2.6,
      vx: -6 + Math.random() * 12,
      vy: 14 + Math.random() * 34, // falls
      alpha: 0.25 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      swayAmount: 8 + Math.random() * 18,
    };
  }
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    r: 1 + Math.random() * 3.2,
    vx: -4 + Math.random() * 8,
    vy: -(10 + Math.random() * 26), // rises
    alpha: 0.18 + Math.random() * 0.42,
    phase: Math.random() * Math.PI * 2,
    swayAmount: 10 + Math.random() * 22,
  };
}

export default function EditionBackdrop({ theme }: { theme: EditionTheme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (theme === "none") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const config = THEMES[theme];
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let last = 0;
    let running = false;
    let visible = false;

    // Retina would otherwise cost 4x the fill rate for a background effect.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: config.count }, () =>
        makeParticle(theme, width, height)
      );
    };

    const draw = (now: number) => {
      // A backgrounded tab resumes with a huge gap; clamp it.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      ctx.clearRect(0, 0, width, height);

      if (config.glow) {
        const g = ctx.createRadialGradient(
          width * 0.5,
          height * 0.15,
          0,
          width * 0.5,
          height * 0.15,
          Math.max(width, height) * 0.7
        );
        g.addColorStop(0, config.glow);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      }

      for (const p of particles) {
        p.phase += dt * 1.2;
        p.y += p.vy * dt;
        p.x += (p.vx + Math.sin(p.phase) * p.swayAmount * 0.35) * dt;

        // Wrap around the edges so the field never empties out.
        if (p.y > height + 12) {
          p.y = -12;
          p.x = Math.random() * width;
        } else if (p.y < -12) {
          p.y = height + 12;
          p.x = Math.random() * width;
        }
        if (p.x > width + 12) p.x = -12;
        else if (p.x < -12) p.x = width + 12;

        ctx.beginPath();
        ctx.fillStyle = config.color(p.alpha);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

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

    const observer = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !document.hidden) start();
        else stop();
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      stop();
      observer.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [theme]);

  if (theme === "none") return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
