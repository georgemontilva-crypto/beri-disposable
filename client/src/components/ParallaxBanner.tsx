/**
 * Layered parallax banner.
 *
 * Several images stacked in one frame, each translated by a different fraction
 * of the section's scroll progress. Nothing about a layer says "far away" on its
 * own — the depth comes entirely from the back moving less than the front, which
 * is how the eye reads distance in the real world.
 *
 * Implemented with transforms driven by a rAF-throttled scroll listener rather
 * than `background-attachment: fixed`, which mobile browsers either ignore or
 * repaint badly, and rather than scroll-driven CSS animations, which aren't
 * available everywhere yet.
 */
import { useSiteImages } from "@/hooks/useSiteImages";
import { useEffect, useRef, useState } from "react";

export type ParallaxLayer = {
  slot: string;
  /**
   * How far this layer travels, as a fraction of the scroll distance. Small
   * values sit far back; larger ones come toward the viewer. Keep the set
   * spread out — layers with similar speeds just look like a blurry stack.
   */
  speed: number;
  className?: string;
};

export default function ParallaxBanner({
  layers,
  className = "",
  children,
}: {
  layers: ParallaxLayer[];
  className?: string;
  children?: React.ReactNode;
}) {
  const media = useSiteImages();
  const sectionRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;
    let inView = false;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      // -1 when the section is just below the fold, +1 when just above it, 0 as
      // it passes the middle of the screen. Anchoring to the centre means the
      // layers sit in their neutral position exactly when the banner is being
      // looked at, so the extremes of travel are never the resting state.
      const progress =
        (rect.top + rect.height / 2 - window.innerHeight / 2) /
        (window.innerHeight / 2 + rect.height / 2);

      layerRefs.current.forEach((el, i) => {
        if (!el) return;
        const speed = layers[i]?.speed ?? 0;
        el.style.transform = `translate3d(0, ${(progress * speed * 100).toFixed(2)}px, 0)`;
      });
    };

    const onScroll = () => {
      if (inView && !frame) frame = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) update();
      },
      { rootMargin: "10% 0px" }
    );
    io.observe(section);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [layers, reduced]);

  const hasAny = layers.some((l) => media[l.slot]?.url);

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden bg-neutral-950 ${className}`}
    >
      {layers.map((layer, i) => {
        const url = media[layer.slot]?.url;
        return (
          <div
            key={layer.slot}
            ref={(el) => {
              layerRefs.current[i] = el;
            }}
            aria-hidden="true"
            // Oversized: a layer has to be taller than the frame or its edge
            // appears as it travels. 25% against a fastest speed of 0.9 (which
            // travels 18% of the height at the extremes) leaves real margin —
            // at 18% oversize the two are exactly equal and the edge grazes the
            // frame at the end of the scroll.
            className={`pointer-events-none absolute -inset-y-[25%] inset-x-0 will-change-transform ${layer.className ?? ""}`}
          >
            {url && (
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            )}
          </div>
        );
      })}

      {!hasAny && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-xs text-neutral-600">
            {layers.map((l) => l.slot).join(" · ")}
          </p>
        </div>
      )}

      {children && <div className="relative z-10">{children}</div>}
    </section>
  );
}
