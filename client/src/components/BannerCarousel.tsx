/**
 * The product banners, one at a time, full width.
 *
 * Slides are built from the same per-range slots the product pages use, so
 * whatever is uploaded there appears here without a second upload. A range with
 * no banner of its own falls back to the product's default, and identical URLs
 * are collapsed — otherwise a product without per-range art would repeat the
 * same picture five times running.
 *
 * Each banner is shown whole: the frame takes the shape of the image currently
 * on screen instead of cropping it into a common box, the same way the pinned
 * banner on the product pages does.
 */
import { useSiteImages } from "@/hooks/useSiteImages";
import { PRODUCTS, rangeBannerSlot } from "@/lib/products";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const INTERVAL_MS = 5000;
const RESUME_DELAY_MS = 9000;
const DEFAULT_ASPECT = 16 / 9;

export default function BannerCarousel() {
  const media = useSiteImages();
  const [index, setIndex] = useState(0);
  const [aspects, setAspects] = useState<Record<string, number>>({});
  const [paused, setPaused] = useState(false);
  const resumeAt = useRef(0);

  const slides = useMemo(() => {
    const out: { key: string; url: string; label: string }[] = [];
    const seen = new Set<string>();

    for (const p of PRODUCTS) {
      const editions = Array.from(
        new Set(p.flavors.map((f) => f.edition).filter((e): e is string => !!e))
      );
      const present = [p.baseRangeLabel, ...editions];
      const ordered = p.rangeOrder
        ? [
            ...p.rangeOrder.filter((r) => present.includes(r)),
            ...present.filter((r) => !p.rangeOrder!.includes(r)),
          ]
        : present;

      for (const range of ordered) {
        const url =
          media[rangeBannerSlot(p.key, range)]?.url ?? media[`${p.key}_banner`]?.url;
        if (!url || seen.has(url)) continue;
        seen.add(url);
        out.push({ key: `${p.key}-${range}`, url, label: `${p.name} · ${range}` });
      }
    }
    return out;
  }, [media]);

  // Measured off-document: the frame needs each shape before that slide is
  // shown, or it would resize a moment after arriving.
  useEffect(() => {
    slides.forEach((s) => {
      if (aspects[s.url]) return;
      const probe = new Image();
      probe.onload = () => {
        if (probe.naturalWidth && probe.naturalHeight) {
          setAspects((prev) => ({
            ...prev,
            [s.url]: probe.naturalWidth / probe.naturalHeight,
          }));
        }
      };
      probe.src = s.url;
    });
  }, [slides, aspects]);

  const go = useCallback(
    (direction: 1 | -1) => {
      setIndex((i) => (i + direction + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (slides.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      if (paused || document.hidden || Date.now() < resumeAt.current) return;
      go(1);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused, go, slides.length]);

  const defer = () => {
    resumeAt.current = Date.now() + RESUME_DELAY_MS;
  };

  if (!slides.length) return null;

  const current = slides[Math.min(index, slides.length - 1)];
  const ratio = aspects[current.url] ?? DEFAULT_ASPECT;

  return (
    <div
      className="relative"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className="relative w-full overflow-hidden rounded-[1.5rem] border border-white/10 transition-[aspect-ratio] duration-500"
        style={{ aspectRatio: `${ratio}`, maxHeight: "80vh" }}
      >
        {/* All slides stay mounted and crossfade. Swapping the src instead
            would show a blank frame while the next file decodes. */}
        {slides.map((s, i) => (
          <img
            key={s.key}
            src={s.url}
            alt={s.label}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <Arrow side="left" onClick={() => { defer(); go(-1); }} />
          <Arrow side="right" onClick={() => { defer(); go(1); }} />

          <div className="mt-4 flex items-center justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.key}
                type="button"
                aria-label={s.label}
                aria-current={i === index}
                onClick={() => { defer(); setIndex(i); }}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Arrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous banner" : "Next banner"}
      className={`absolute top-1/2 hidden -translate-y-1/2 rounded-full border border-white/15 bg-black/60 p-3 text-white backdrop-blur transition hover:bg-black/80 md:block ${
        side === "left" ? "left-4" : "right-4"
      }`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
