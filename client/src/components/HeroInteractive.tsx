/**
 * Interactive hero.
 *
 * The client doesn't want a video hero, so the headline element is a 3D model
 * the visitor can spin. Three constraints shape this component:
 *
 *  1. A WebGL canvas can't be the first paint — downloading three.js plus the
 *     model takes seconds on mobile. A poster image renders immediately and the
 *     canvas cross-fades in once the GLTF resolves.
 *  2. Scroll-wheel zoom is disabled and one-finger touch is left to the page,
 *     otherwise a full-bleed canvas traps mobile visitors trying to scroll past.
 *  3. Low-end devices and prefers-reduced-motion keep the poster and never boot
 *     the 3D runtime at all.
 */
import { useSiteImages } from "@/hooks/useSiteImages";
import { HERO_PRODUCT } from "@/lib/products";
import { ArrowRight, Box, ShieldCheck } from "lucide-react";
import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";

const Canvas3D = lazy(() => import("./ProductViewer3DCanvas"));

/* ─── Capability check ────────────────────────────────────────────────────── */

function canRun3D(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  // Rough proxy for low-end hardware; these devices render a heavy GLB at
  // single-digit frame rates, which looks worse than a still image.
  const cores = navigator.hardwareConcurrency;
  if (typeof cores === "number" && cores > 0 && cores <= 2) return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/* ─── Error boundary ──────────────────────────────────────────────────────── */

class HeroErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("[HeroInteractive] 3D failed, keeping poster:", error);
  }
  render() {
    // On failure we render nothing: the poster underneath stays visible.
    return this.state.failed ? null : this.props.children;
  }
}

/* ─── Hero ────────────────────────────────────────────────────────────────── */

export default function HeroInteractive() {
  const media = useSiteImages();
  const product = HERO_PRODUCT;

  const modelUrl = media[product.modelSlot]?.url;
  const posterUrl = media["home_hero_poster"]?.url;

  const [allow3D, setAllow3D] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    setAllow3D(canRun3D());
  }, []);

  const handleReady = useCallback(() => setModelReady(true), []);

  const show3D = allow3D && !!modelUrl;

  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white">
      <div
        className="container grid items-center gap-8 py-16 md:grid-cols-2 md:gap-12 md:py-20"
        style={{ minHeight: "min(85vh, 760px)" }}
      >
        {/* ── Copy ─────────────────────────────────────────────────────── */}
        <div className="relative z-10 order-2 md:order-1">
          <span className="inline-block rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
            {product.tagline}
          </span>
          <h1 className="mt-5 font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
            {product.name}
          </h1>
          <p className="mt-5 max-w-md text-neutral-400">{product.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/products/${product.key}`}
              className="press inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-200"
            >
              Explore {product.name} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/authenticate"
              className="press inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <ShieldCheck className="h-4 w-4" /> Verify Your Device
            </Link>
          </div>
        </div>

        {/* ── Visual ───────────────────────────────────────────────────── */}
        <div className="relative order-1 aspect-square w-full md:order-2">
          {/* Poster: paints immediately, stays as the fallback. */}
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={product.name}
              className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${
                modelReady ? "opacity-0" : "opacity-100"
              }`}
              fetchPriority="high"
            />
          ) : (
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[2rem] border border-dashed border-white/15 text-center transition-opacity duration-700 ${
                modelReady ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="rounded-2xl bg-white/5 p-4">
                <Box className="h-8 w-8 text-neutral-500" strokeWidth={1.5} />
              </div>
              <p className="font-display text-lg tracking-wide text-neutral-300">
                {product.name}
              </p>
              <p className="max-w-[220px] text-xs text-neutral-500">
                Upload a hero poster and a 3D model from the admin panel
              </p>
              <p className="font-mono text-[11px] text-neutral-600">home_hero_poster</p>
            </div>
          )}

          {show3D && (
            <HeroErrorBoundary>
              <Suspense fallback={null}>
                <div
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    modelReady ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Canvas3D
                    url={modelUrl}
                    autoRotate
                    enableZoom={false}
                    onReady={handleReady}
                  />
                </div>
              </Suspense>
            </HeroErrorBoundary>
          )}

          {modelReady && (
            <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium tracking-wide text-neutral-300 backdrop-blur">
              Drag to rotate
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
