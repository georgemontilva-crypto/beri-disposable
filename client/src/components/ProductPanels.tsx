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
import { useState } from "react";
import { Link } from "wouter";

export default function ProductPanels() {
  const media = useSiteImages();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section
      className="relative w-full bg-black"
      // Full screen on desktop; on phones four stacked bands need more room
      // than a quarter viewport each to stay legible.
      style={{ minHeight: "100dvh" }}
      aria-label="The Beri line-up"
    >
      <div className="flex h-[100dvh] w-full flex-col md:flex-row">
        {PRODUCTS.map((product) => {
          const url = media[product.panelSlot]?.url;
          const active = hovered === product.key;
          const dimmed = hovered !== null && !active;

          return (
            <Link
              key={product.key}
              href={`/products/${product.key}`}
              onMouseEnter={() => setHovered(product.key)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(product.key)}
              onBlur={() => setHovered(null)}
              className="group relative block overflow-hidden border-white/10 md:border-l md:first:border-l-0"
              style={{
                flexGrow: active ? 2.2 : dimmed ? 0.75 : 1,
                flexBasis: 0,
                transition: "flex-grow 620ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {/* Image */}
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

              {/* Accent wash: what makes the four read as one palette rather
                  than four unrelated photographs. */}
              <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(180deg, ${product.accent}00 0%, ${product.accent}22 55%, ${product.accent}55 100%)`,
                  opacity: active ? 0.85 : 1,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40" />

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
