/**
 * The whole catalogue on one screen: four full-height columns, one per product.
 * Hovering a column widens it and narrows the rest.
 *
 * The widths are flex-grow values rather than percentages, so the four always
 * fill the row exactly however the numbers change — no rounding gap opening at
 * the right edge mid-transition.
 *
 * Hover is a desktop affordance only. On phones the columns become four
 * stacked bands, each already at its full size, so nothing is hidden behind an
 * interaction that can't happen.
 */
import { useSiteImages } from "@/hooks/useSiteImages";
import { PRODUCTS } from "@/lib/products";
import { ArrowRight, ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

export default function ProductPanels() {
  const media = useSiteImages();
  const [hovered, setHovered] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /**
   * On a phone the panels become a horizontal strip, and there is no hover to
   * decide which one is open. The card nearest the centre of the strip takes
   * that role, so scrolling brings each card to life as it arrives.
   *
   * Tracking the ratio per card and picking the maximum, rather than reacting
   * to whichever entry fired last: two cards are usually intersecting at once
   * mid-swipe, and the last callback is not necessarily the nearer one.
   */
  useEffect(() => {
    if (isDesktop) return;
    const track = trackRef.current;
    if (!track) return;

    const cards = Array.from(track.children) as HTMLElement[];
    const ratios = new Map<Element, number>();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => ratios.set(e.target, e.intersectionRatio));
        let best: Element | null = null;
        let bestRatio = 0;
        ratios.forEach((r, el) => {
          if (r > bestRatio) {
            bestRatio = r;
            best = el;
          }
        });
        const key = best && (best as HTMLElement).dataset.key;
        setHovered(bestRatio > 0.55 && key ? key : null);
      },
      { root: track, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [isDesktop]);

  return (
    <section
      className="relative w-full bg-black"
      // Full screen on desktop; on phones four stacked bands need more room
      // than a quarter viewport each to stay legible.
      style={{ minHeight: "100dvh" }}
      aria-label="The Beri line-up"
    >
      {/* Phone: a snapping horizontal strip, so each product still gets a full
          card with its video instead of a quarter-height band. */}
      <div
        ref={trackRef}
        className="no-scrollbar flex h-[100dvh] w-full snap-x snap-mandatory overflow-x-auto md:snap-none md:overflow-x-hidden"
      >
        {PRODUCTS.map((product) => {
          const url = media[product.panelSlot]?.url;
          const videoUrl = media[product.panelVideoSlot]?.url;
          const active = hovered === product.key;
          const dimmed = hovered !== null && !active;

          return (
            <Link
              key={product.key}
              href={`/products/${product.key}`}
              data-key={product.key}
              onMouseEnter={() => isDesktop && setHovered(product.key)}
              onMouseLeave={() => isDesktop && setHovered(null)}
              onFocus={() => isDesktop && setHovered(product.key)}
              onBlur={() => isDesktop && setHovered(null)}
              className="group relative block shrink-0 snap-center overflow-hidden border-white/10 md:shrink md:border-l md:first:border-l-0"
              style={
                isDesktop
                  ? {
                      flexGrow: active ? 2.2 : dimmed ? 0.75 : 1,
                      flexBasis: 0,
                      transition: "flex-grow 620ms cubic-bezier(0.22, 1, 0.36, 1)",
                    }
                  : // Just under a full screen, so the edge of the next card is
                    // visible and the strip reads as scrollable without a hint.
                    { width: "86vw" }
              }
            >
              {/* Still image: always present, and the poster the loop fades
                  over. Four videos playing at once would be both heavy and
                  visually chaotic, so the loop belongs to the open column. */}
              {url ? (
                <img
                  src={url}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-900 text-neutral-600">
                  <ImageIcon className="h-7 w-7" strokeWidth={1.5} />
                  <span className="font-mono text-[11px]">{product.panelSlot}</span>
                </div>
              )}

              {videoUrl && (
                <PanelVideo url={videoUrl} poster={url} active={active} />
              )}

              {/* Shade only under the copy. Four stops rather than two: a
                  straight fade from solid to clear leaves a visible band across
                  the middle of the panel, while an eased ramp reads as the
                  footage darkening on its own. */}
              <div
                className="absolute inset-x-0 bottom-0 h-1/2"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.82) 22%, rgba(0,0,0,0.42) 55%, rgba(0,0,0,0) 100%)",
                }}
              />

              {/* Copy */}
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center p-6 text-center md:p-8">
                <PanelLogo product={product} media={media} />
                <div
                  className="mt-3 font-display text-4xl font-bold leading-none"
                  style={{ color: product.accent }}
                >
                  {product.highlight.value}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  {product.highlight.unit}
                </div>

                {/* Revealed on widen: the extra room is what makes room for it,
                    so it appears exactly when there is space. */}
                <div
                  className="overflow-hidden transition-all duration-500"
                  style={{
                    maxHeight: active ? 96 : 0,
                    opacity: active ? 1 : 0,
                  }}
                >
                  <p className="mt-4 max-w-xs text-sm text-white/80">{product.tagline}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                    Explore <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function PanelLogo({
  product,
  media,
}: {
  product: (typeof PRODUCTS)[number];
  media: Record<string, { url: string }>;
}) {
  const logo = media[product.logoSlot]?.url;
  if (logo) {
    return (
      <img
        src={logo}
        alt={product.name}
        className="h-12 w-auto max-w-full object-contain md:h-14"
      />
    );
  }
  return (
    <div className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
      {product.name}
    </div>
  );
}


/**
 * Short clip sitting on the panel.
 *
 * Always visible, not faded in on hover: `preload="metadata"` gets the browser
 * to paint the opening frame, so a closed column already shows the footage
 * rather than a separate still that then swaps.
 *
 * It plays once and holds its closing frame — no loop. Leaving mid-play pauses
 * where it is rather than rewinding, so the column never snaps backwards under
 * the pointer; a clip that already finished restarts on the next hover.
 */
function PanelVideo({
  url,
  poster,
  active,
}: {
  url: string;
  poster?: string;
  active: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    if (active) {
      // A finished clip has nothing left to show, so start it over.
      if (v.ended) v.currentTime = 0;
      // play() rejects when autoplay is blocked; the frame on screen stays,
      // which is the right outcome, so the rejection is ignored.
      void v.play().catch(() => undefined);
    } else {
      v.pause();
    }
  }, [active]);

  return (
    <video
      ref={ref}
      src={url}
      poster={poster}
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
      onEnded={(e) => {
        // Pause only, no seek: seeking decodes another frame and settles onto
        // it, visible as a twitch right as the clip stops.
        e.currentTarget.pause();
      }}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
