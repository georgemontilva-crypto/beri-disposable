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
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[ProductViewer3D] failed to render model:", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* ─── Placeholder shown when no model has been uploaded yet ───────────────── */

function ViewerPlaceholder({ slot, label }: { slot: string; label: string }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-dashed border-white/15 bg-neutral-900/60 text-center">
      <div className="rounded-2xl bg-white/5 p-4">
        <Box className="h-8 w-8 text-neutral-500" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-display text-lg tracking-wide text-neutral-300">{label}</p>
        <p className="mt-1 text-xs text-neutral-500">
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
  className = "",
}: {
  slot: string;
  productName: string;
  className?: string;
}) {
  const media = useSiteImages();
  const entry = media[slot];
  const url = entry?.url;

  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

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

  const placeholder = <ViewerPlaceholder slot={slot} label={`${productName} in 3D`} />;

  return (
    <div
      ref={containerRef}
      className={`relative aspect-square w-full overflow-hidden rounded-[1.75rem] bg-neutral-950 ${className}`}
    >
      {!url ? (
        placeholder
      ) : (
        <ViewerErrorBoundary fallback={placeholder}>
          {visible && (
            <Suspense fallback={<div className="h-full w-full animate-pulse bg-neutral-900" />}>
              <Canvas3D url={url} autoRotate={autoRotate} />
            </Suspense>
          )}

          {/* Affordance hint + autorotate toggle */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
            <span className="rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-medium tracking-wide text-neutral-300 backdrop-blur">
              Drag to rotate · Scroll to zoom
            </span>
            <button
              type="button"
              onClick={() => setAutoRotate((v) => !v)}
              aria-label={autoRotate ? "Pause auto-rotation" : "Resume auto-rotation"}
              className="pointer-events-auto rounded-full bg-black/50 p-2 text-neutral-300 backdrop-blur transition hover:bg-black/70 hover:text-white"
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
