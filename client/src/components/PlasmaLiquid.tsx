/**
 * Lava-lamp blobs for the regular range.
 *
 * The merging is an SVG "goo" filter: blur the layer, then push the alpha
 * channel through a steep colour matrix. Blurred edges that overlap add up past
 * the threshold and snap into one shape, while lone blobs keep their round
 * outline — which is exactly how liquid behaves. Without the filter these are
 * just circles drifting past each other.
 *
 * The alpha matrix is used rather than CSS `contrast()`, which acts on colour
 * channels and leaves the soft halo visible.
 *
 * Section-sized rather than viewport-fixed, and off on phones: an SVG filter
 * re-runs over its whole area every frame its children move, so the cost scales
 * with the pixels covered.
 */
import { useEffect, useState } from "react";

const BLOBS = [
  { color: "#ff2f87", size: 46, left: 8, delay: 0, duration: 19 },
  { color: "#22d3ee", size: 38, left: 26, delay: -6, duration: 24 },
  { color: "#a855f7", size: 52, left: 46, delay: -12, duration: 21 },
  { color: "#84cc16", size: 34, left: 66, delay: -3, duration: 27 },
  { color: "#f97316", size: 44, left: 84, delay: -16, duration: 22 },
];

export default function PlasmaLiquid({ active }: { active: boolean }) {
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

  if (!active || !enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="beri-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="26" result="blur" />
            {/* The last row is the threshold: multiply alpha hard, then subtract
                so only the dense middle survives. */}
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11"
            />
          </filter>
        </defs>
      </svg>

      <div className="absolute inset-0 opacity-40" style={{ filter: "url(#beri-goo)" }}>
        {BLOBS.map((b) => (
          <span
            key={b.color}
            className="plasma-blob absolute rounded-full"
            style={{
              background: b.color,
              width: `${b.size}vh`,
              height: `${b.size}vh`,
              left: `${b.left}%`,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
