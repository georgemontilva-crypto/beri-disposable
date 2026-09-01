/**
 * Horizontal flavour carousel, four visible at a time, advancing on its own.
 *
 * Movement is native scrolling with CSS snap points rather than a transformed
 * track. That keeps the trackpad, touch, arrow keys and the scrollbar all
 * working for free, and it degrades to a plain scroller if the script never
 * runs.
 *
 * Autoplay yields to the visitor: it stops while the pointer is over the strip,
 * while anything inside has keyboard focus, and for a few seconds after any
 * manual scroll. An autoplay that fights the person reading is worse than none.
 */
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const INTERVAL_MS = 3200;
/** How long autoplay stays out of the way after a manual scroll. */
const RESUME_DELAY_MS = 6000;

export default function FlavorCarousel({
  children,
  itemCount,
}: {
  children: React.ReactNode;
  itemCount: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const resumeAt = useRef(0);

  const step = useCallback((direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    if (!first) return;
    // Measure the real item width instead of assuming: the column count changes
    // with the breakpoint and the gap is in rem.
    const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 0;
    const amount = first.offsetWidth + gap;

    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (direction === 1 && atEnd) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollBy({ left: amount * direction, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (itemCount <= 1) return;

    const id = window.setInterval(() => {
      if (paused || document.hidden || Date.now() < resumeAt.current) return;
      step(1);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused, step, itemCount]);

  // Any manual scroll defers autoplay rather than cancelling it, so the strip
  // stays alive but never yanks the view while someone is browsing it.
  const deferAutoplay = useCallback(() => {
    resumeAt.current = Date.now() + RESUME_DELAY_MS;
  }, []);

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
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5"
      >
        {children}
      </div>

      <CarouselButton side="left" onClick={() => { deferAutoplay(); step(-1); }} />
      <CarouselButton side="right" onClick={() => { deferAutoplay(); step(1); }} />
    </div>
  );
}

function CarouselButton({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous flavors" : "Next flavors"}
      className={`absolute top-1/2 hidden -translate-y-1/2 rounded-full border border-white/15 bg-black/60 p-3 text-white backdrop-blur transition hover:bg-black/80 md:block ${
        side === "left" ? "-left-2" : "-right-2"
      }`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
