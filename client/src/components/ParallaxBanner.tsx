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
   * Portrait cut used on phones. A 2:1 scene cropped to a tall viewport loses
   * most of its width, which is exactly where the depth cues live. Falls back
   * to `slot` when not uploaded.
   */
  mobileSlot?: string;
  /**
   * How far this layer travels, as a fraction of the scroll distance. Small
   * values sit far back; larger ones come toward the viewer. Keep the set
   * spread out — layers with similar speeds just look like a blurry stack.
   */
  speed: number;
  className?: string;
};

/** Entrance: how far above its resting place a layer starts, in pixels. */
const DROP_DISTANCE = 220;
/** Seconds a layer takes to fall, and the gap between consecutive layers. */
const DROP_DURATION = 1.1;
const DROP_STAGGER = 0.16;

/**
 * Overshooting ease. Nothing heavy stops dead — the layer passes its resting
 * point and settles back, which is what makes the landing feel like weight
 * rather than a slide.
 */
function easeOutBack(t: number): number {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

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
  const [isPhone, setIsPhone] = useState(false);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Re-evaluated on change rather than read once: rotating a phone crosses the
  // breakpoint and should swap the cut.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const urlFor = (layer: ParallaxLayer): string | undefined => {
    const mobile = layer.mobileSlot ? media[layer.mobileSlot]?.url : undefined;
    return (isPhone && mobile) || media[layer.slot]?.url;
  };

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;
    let inView = false;
    const started = performance.now();

    /**
     * One loop computes all three motions and writes a single transform.
     *
     * Doing it any other way means two sources fighting over `transform`: a CSS
     * entrance animation would override the scroll offset while it ran, and a
     * CSS float loop would override it forever after. Summed here, they simply
     * add up.
     */
    const frame = (now: number) => {
      raf = 0;
      const elapsed = (now - started) / 1000;

      const rect = section.getBoundingClientRect();
      // -1 when the section is just below the fold, +1 when just above it, 0 as
      // it passes the middle of the screen. Anchoring to the centre means the
      // layers sit in their neutral position exactly when the banner is being
      // looked at, so the extremes of travel are never the resting state.
      const progress =
        (rect.top + rect.height / 2 - window.innerHeight / 2) /
        (window.innerHeight / 2 + rect.height / 2);

      let anyDropping = false;

      layerRefs.current.forEach((el, i) => {
        if (!el) return;
        const speed = layers[i]?.speed ?? 0;

        // Entrance: back layer lands first, so the scene assembles from the
        // depth of the image forward.
        const t = (elapsed - i * DROP_STAGGER) / DROP_DURATION;
        let drop = 0;
        let opacity = 1;
        if (t < 0) {
          drop = -DROP_DISTANCE;
          opacity = 0;
          anyDropping = true;
        } else if (t < 1) {
          drop = -DROP_DISTANCE * (1 - easeOutBack(t));
          opacity = Math.min(1, t * 2.5);
          anyDropping = true;
        }

        // Settled float. Periods are coprime across layers so the stack never
        // bobs in unison, which would read as the whole image wobbling.
        const floatY = Math.sin(elapsed * (0.34 + i * 0.11) + i * 1.7) * (5 + i * 3);

        const parallax = progress * speed * 100;

        el.style.opacity = String(opacity);
        el.style.transform = `translate3d(0, ${(parallax + drop + floatY).toFixed(2)}px, 0)`;
      });

      // Keep animating while in view; the drop must also finish even if the
      // banner is still below the fold, or it would land already visible.
      if (inView || anyDropping) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) start();
      },
      { rootMargin: "10% 0px" }
    );
    io.observe(section);
    start();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [layers, reduced]);

  const hasAny = layers.some((l) => urlFor(l));

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden bg-neutral-950 ${className}`}
    >
      {layers.map((layer, i) => {
        const url = urlFor(layer);
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
            // Starts hidden so the first painted frame is the layer already
            // lifted, not a flash of it in its final position.
            style={reduced ? undefined : { opacity: 0 }}
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
