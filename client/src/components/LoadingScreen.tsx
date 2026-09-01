import { useEffect, useRef, useState } from "react";

/**
 * Full-screen loading screen with animated SVG progress circle.
 * The stroke color cycles through Beri device colors:
 *   yellow → blue → pink/fuchsia → green
 *
 * Props:
 *   onDone – called when the animation reaches 100% and the fade-out ends.
 */

const BERI_COLORS = ["#FFD700", "#4FC3F7", "#F472B6", "#4ADE80"];

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface Props {
  onDone: () => void;
}

export default function LoadingScreen({ onDone }: Props) {
  const [progress, setProgress] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  // Total duration of the loading animation in ms
  const DURATION = 2200;

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const raw = Math.min(elapsed / DURATION, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - raw, 3);
      const pct = Math.round(eased * 100);
      setProgress(pct);

      // Cycle color every 25%
      const ci = Math.min(Math.floor(eased * BERI_COLORS.length), BERI_COLORS.length - 1);
      setColorIndex(ci);

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // Start fade-out
        setFading(true);
        setTimeout(() => onDone(), 600);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [onDone]);

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress / 100);
  const color = BERI_COLORS[colorIndex];

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
      style={{
        transition: fading ? "opacity 0.6s ease" : undefined,
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      {/* Brand name */}
      <div
        className="mb-10 font-display text-3xl font-bold tracking-[0.3em] text-white"
        style={{ letterSpacing: "0.3em" }}
      >
        BERI
      </div>

      {/* SVG circle */}
      <div className="relative flex items-center justify-center">
        <svg width="140" height="140" viewBox="0 0 120 120">
          {/* Track */}
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="5"
          />
          {/* Progress arc */}
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke 0.4s ease, stroke-dashoffset 0.05s linear" }}
          />
        </svg>

        {/* Percentage */}
        <div className="absolute flex flex-col items-center justify-center">
          <span
            className="font-display text-3xl font-bold tabular-nums"
            style={{ color, transition: "color 0.4s ease" }}
          >
            {progress}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-300">
            %
          </span>
        </div>
      </div>

      {/* Subtitle */}
      <p className="mt-8 text-xs font-medium uppercase tracking-[0.3em] text-neutral-600">
        Loading
      </p>
    </div>
  );
}
