/**
 * Every product banner in catalogue order, as one horizontal strip.
 *
 * Slides are built from the same per-range slots the product pages use, so
 * whatever is uploaded there appears here without a second upload. A range with
 * no banner of its own falls back to the product's default, and identical URLs
 * are collapsed — otherwise a product without per-range art would repeat the
 * same picture five times in a row.
 *
 * Images are contained rather than cropped: the banners are authored at
 * whatever shape suits each product, and cropping them to a common box would
 * cut the artwork the page exists to show.
 */
import { useSiteImages } from "@/hooks/useSiteImages";
import { PRODUCTS, rangeBannerSlot } from "@/lib/products";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const INTERVAL_MS = 4500;
/** How long autoplay stays out of the way after a manual scroll. */
const RESUME_DELAY_MS = 8000;

export default function BannerCarousel() {
  const media = useSiteImages();
  const trackRef = useRef<HTMLDivElement>(null);
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
          media[rangeBannerSlot(p.key, range)]?.url ??
          media[`${p.key}_banner`]?.url;
        if (!url || seen.has(url)) continue;
        seen.add(url);
        out.push({ key: `${p.key}-${range}`, url, label: `${p.name} · ${range}` });
      }
    }
    return out;
  }, [media]);

  const step = useCallback((direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    if (!first) return;
    // Measured, not assumed: slide width is a viewport percentage and the gap
    // is in rem, so both change with the breakpoint and the root font size.
    const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 0;
    const amount = first.offsetWidth + gap;

    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (direction === 1 && atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else el.scrollBy({ left: amount * direction, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      if (paused || document.hidden || Date.now() < resumeAt.current) return;
      step(1);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused, step, slides.length]);

  const deferAutoplay = useCallback(() => {
    resumeAt.current = Date.now() + RESUME_DELAY_MS;
  }, []);

  if (!slides.length) return null;

  return (
    <div
      className="relative"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        onWheel={deferAutoplay}
        onTouchStart={deferAutoplay}
        onPointerDown={deferAutoplay}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth"
      >
        {slides.map((s) => (
          <figure
            key={s.key}
            className="w-[88%] shrink-0 snap-center sm:w-[70%] lg:w-[55%]"
          >
            <div className="flex h-[42vh] min-h-[240px] items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04]">
              <img
                src={s.url}
                alt={s.label}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </div>
            <figcaption className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              {s.label}
            </figcaption>
          </figure>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <ArrowButton side="left" onClick={() => { deferAutoplay(); step(-1); }} />
          <ArrowButton side="right" onClick={() => { deferAutoplay(); step(1); }} />
        </>
      )}
    </div>
  );
}

function ArrowButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous banner" : "Next banner"}
      className={`absolute top-[21vh] hidden -translate-y-1/2 rounded-full border border-white/15 bg-black/60 p-3 text-white backdrop-blur transition hover:bg-black/80 md:block ${
        side === "left" ? "-left-3" : "-right-3"
      }`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
