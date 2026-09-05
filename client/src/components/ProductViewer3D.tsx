/**
 * Interactive 3D product viewer.
 *
 * Renders an orbitable GLB model when the admin has uploaded one to the
 * product's `modelSlot`. Until then it shows a deliberate placeholder rather
 * than an empty box, so unfinished products still look intentional.
 *
 * The three.js runtime lives in ProductViewer3DCanvas and is code-split: it is
 * only fetched once a model actually exists AND the viewer scrolls into view.
 */
import { useSiteImages } from "@/hooks/useSiteImages";
import { Box, RotateCcw, RotateCw } from "lucide-react";
import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";

const Canvas3D = lazy(() => import("./ProductViewer3DCanvas"));

/* ─── Error boundary: a corrupt GLB must not blank the whole page ─────────── */

class ViewerErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onFail: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(
      "[ProductViewer3D] the model could not be loaded or rendered. " +
        "Common causes: the bucket is missing a CORS rule for GET from this " +
        "origin, the file is not a valid .glb, or WebGL is unavailable.",
      error
    );
    this.props.onFail();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* ─── Placeholder shown when no model has been uploaded yet ───────────────── */

function ViewerPlaceholder({
  slot,
  label,
  failed = false,
}: {
  slot: string;
  label: string;
  failed?: boolean;
}) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-dashed border-white/15 bg-neutral-900/60 text-center">
      <div className="rounded-2xl bg-white/5 p-4">
        <Box className="h-8 w-8 text-neutral-300" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-display text-lg tracking-wide text-neutral-300">{label}</p>
        <p className="mt-1 text-xs text-neutral-300">
          Upload a .glb model to this slot from the admin panel
        </p>
        <p className="mt-2 font-mono text-[11px] text-neutral-600">{slot}</p>
      </div>
    </div>
  );
}

/* ─── Public component ────────────────────────────────────────────────────── */

export default function ProductViewer3D({
  slot,
  productName,
  fallbackSlot,
  transparent = false,
  className = "",
}: {
  slot: string;
  productName: string;
  /**
   * Image shown when no model has been uploaded. Lets the viewer sit in the
   * hero from day one: it degrades to the ordinary product shot instead of a
   * dashed "upload a model" box in the most visible spot on the page.
   */
  fallbackSlot?: string;
  /** Hero usage: no dark plate, so the viewer sits on the page background. */
  transparent?: boolean;
  className?: string;
}) {
  const media = useSiteImages();
  const entry = media[slot];
  const url = entry?.url;

  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [failed, setFailed] = useState(false);

  // Defer mounting the canvas until the viewer is near the viewport.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  const fallbackImage = fallbackSlot ? media[fallbackSlot]?.url : undefined;

  /**
   * Two different failures used to look identical: no model uploaded, and a
   * model that exists but won't load. Both fell back to the product photo, so
   * there was no way to tell which one was happening.
   *
   * Now the photo only stands in when there is genuinely nothing to show. A
   * model that failed keeps the diagnostic panel, which names the slot and
   * points at the console.
   */
  const placeholder =
    fallbackImage && !url ? (
      <img
        src={fallbackImage}
        alt={productName}
        className="h-full w-full object-contain"
      />
    ) : (
      <ViewerPlaceholder
        slot={slot}
        label={`${productName} in 3D`}
        failed={failed}
      />
    );

  return (
    <div
      ref={containerRef}
      className={`relative aspect-square w-full overflow-hidden ${
        transparent ? "" : "rounded-[1.75rem] bg-neutral-900"
      } ${className}`}
    >
      {!url ? (
        placeholder
      ) : (
        <ViewerErrorBoundary fallback={placeholder} onFail={() => setFailed(true)}>
          {visible && (
            <Suspense fallback={<div className="h-full w-full animate-pulse bg-neutral-900" />}>
              <Canvas3D url={url} autoRotate={autoRotate} />
            </Suspense>
          )}

          {/* Affordance hint + autorotate toggle */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
            <span
              className={`rounded-full px-3 py-1.5 text-[11px] font-medium tracking-wide backdrop-blur ${
                transparent
                  ? "bg-black/10 text-neutral-600"
                  : "bg-black/50 text-neutral-300"
              }`}
            >
              Drag to spin
            </span>
            <button
              type="button"
              onClick={() => setAutoRotate((v) => !v)}
              aria-label={autoRotate ? "Pause auto-rotation" : "Resume auto-rotation"}
              className={`pointer-events-auto rounded-full p-2 backdrop-blur transition ${
                transparent
                  ? "bg-black/10 text-neutral-600 hover:bg-black/20 hover:text-neutral-900"
                  : "bg-black/50 text-neutral-300 hover:bg-black/70 hover:text-white"
              }`}
            >
              {autoRotate ? (
                <RotateCcw className="h-4 w-4" />
              ) : (
                <RotateCw className="h-4 w-4" />
              )}
            </button>
          </div>
        </ViewerErrorBoundary>
      )}
    </div>
  );
}
