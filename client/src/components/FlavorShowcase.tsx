/**
 * Flavour section: one large featured flavour, plus every flavour as a small
 * tile below.
 *
 * A grid of twenty-three equal tiles is a wall nobody reads, and a carousel
 * hides most of them behind an autoplay nobody waits for. Splitting the two
 * jobs fixes both: the featured slot gives the artwork room to be seen, and the
 * tiles stay small enough that the whole range fits on screen at once.
 *
 * Filtering is by taste family rather than by edition, because "what does it
 * taste like" is the question a visitor actually has. Editions survive as a
 * badge on the tile.
 */
import { PlaceholderImage } from "@/components/PlaceholderImage";
import type { PublicMediaEntry } from "@/hooks/useSiteImages";
import type { Flavor, Product } from "@/lib/products";
import { useMemo, useState } from "react";
import ColoredSmoke from "./ColoredSmoke";
import Snowfall from "./Snowfall";
import SummerEmbers from "./SummerEmbers";

export default function FlavorShowcase({
  product,
  images,
}: {
  product: Product;
  images: Record<string, PublicMediaEntry>;
}) {
  const texture = images[product.textureSlot]?.url;
  const [filter, setFilter] = useState<string>(product.baseRangeLabel);

  /**
   * Only flavours whose image has been uploaded. A tile with a placeholder is
   * an advert for something the visitor can't see, so an unshot flavour simply
   * isn't listed yet.
   *
   * If nothing at all has been uploaded the full list is shown instead —
   * otherwise the section would vanish and there would be no sign of what is
   * missing.
   */
  const mounted = useMemo(() => {
    const withImages = product.flavors.filter((f) => images[f.slot]?.url);
    return withImages.length ? withImages : product.flavors;
  }, [product, images]);

  /** Regular first, then whatever editions actually exist for this product. */
  const chips = useMemo(() => {
    const editions: string[] = [];
    for (const f of mounted) {
      if (f.edition && !editions.includes(f.edition)) editions.push(f.edition);
    }
    const hasBase = mounted.some((f) => !f.edition);
    return [...(hasBase ? [product.baseRangeLabel] : []), ...editions];
  }, [mounted, product.baseRangeLabel]);

  const visible = useMemo(
    () =>
      filter === product.baseRangeLabel
        ? mounted.filter((f) => !f.edition)
        : mounted.filter((f) => f.edition === filter),
    [mounted, filter, product.baseRangeLabel]
  );

  const [selected, setSelected] = useState<string>("");
  // Falls back to the first flavour of the active tab, so switching tabs never
  // leaves the featured slot showing something the wall below no longer lists.
  const featured: Flavor | undefined =
    visible.find((f) => f.slug === selected) ?? visible[0];

  return (
    <section className="relative overflow-hidden py-20 text-white">
      {/* Page-wide, not section-wide: the flakes are meant to fall over the
          whole site while the winter range is open. */}
      <Snowfall active={/winter/i.test(filter)} />
      <SummerEmbers active={/summer/i.test(filter)} />

      {/* Tiling brand pattern. Held at low opacity under a dark scrim: at full
          strength a repeating logo competes with the product shots, which are
          the thing the section exists to show. */}
      {texture && (
        <>
          {/*
            Solid black base. Without it the ambient colour glow sits behind the
            pattern and tints it olive — the texture has to be embossed on black
            to read as embossing rather than as a stain.
          */}
          <div aria-hidden="true" className="absolute inset-0 bg-black" />

          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage: `url(${texture})`,
              backgroundRepeat: "repeat",
              backgroundSize: "1500px auto",
              // Stripped of colour: the pattern is a surface finish, not
              // artwork, and any hue in it competes with the product shots.
              filter: "grayscale(1) brightness(0.55)",
            }}
          />

        </>
      )}

      {/*
        After the texture, not before it: that block lays down a solid black
        base at `absolute inset-0`, and anything declared earlier at the same
        stacking level is painted straight over. The snow and embers escape
        this because they are fixed to the viewport at z-40.
      */}
      <ColoredSmoke active={/zero/i.test(filter)} />

      <div className="container relative">
        <div className="reveal mb-10">
          <span
            className="text-xs font-semibold uppercase tracking-[0.25em]"
            style={{ color: product.accent }}
          >
            The Lineup
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">
            {product.name} Flavors
          </h2>
          <p className="mt-3 max-w-md text-neutral-300">
            {mounted.length} signature flavors. Pick one to see it up close.
          </p>
        </div>

        {/* ── Featured ────────────────────────────────────────────────── */}
        {featured && (
          <div className="reveal mb-10 grid items-center gap-8 rounded-[2rem] border border-white/15 bg-white/[0.06] p-6 md:grid-cols-[1.3fr_1fr] md:p-8">
            {/* Keyed on the flavour so the image re-runs its fade on each pick,
                instead of swapping in place with no sense of change. */}
            <div key={featured.slug} className="animate-fade-in overflow-hidden rounded-[1.5rem]">
              <PlaceholderImage
                slot={featured.slot}
                imageMap={images}
                width={900}
                height={640}
                label={featured.name}
                fit="contain"
                rounded="rounded-[1.5rem]"
              />
            </div>

            <div>
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-950"
                style={{ backgroundColor: product.accent }}
              >
                {featured.edition ?? product.baseRangeLabel}
              </span>
              <h3 className="mt-4 font-display text-4xl font-bold leading-tight">
                {featured.name}
              </h3>
              <p className="mt-4 text-neutral-300">
                Available on {product.name}, with the same flavor engineering
                across the range and a verifiable authenticity code on every unit.
              </p>
            </div>
          </div>
        )}

        {/* ── Filters ─────────────────────────────────────────────────── */}
        <div role="tablist" aria-label="Flavor ranges" className="reveal mb-6 flex flex-wrap gap-2">
          {chips.map((chip) => {
            const active = filter === chip;
            return (
              <button
                key={chip}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setFilter(chip)}
                className={`press rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "text-neutral-950"
                    : "border border-white/20 text-neutral-300 hover:border-white/40 hover:text-white"
                }`}
                style={active ? { backgroundColor: product.accent } : undefined}
              >
                {chip}
                <span className="ml-1.5 text-xs opacity-70">
                  {chip === product.baseRangeLabel
                    ? mounted.filter((f) => !f.edition).length
                    : mounted.filter((f) => f.edition === chip).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Wall ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {visible.map((f) => {
            const active = f.slug === featured?.slug;
            return (
              <button
                key={f.slug}
                type="button"
                onClick={() => setSelected(f.slug)}
                aria-pressed={active}
                className="group rounded-2xl border p-2 text-left backdrop-blur-xl backdrop-saturate-150 transition-all duration-200 hover:-translate-y-1 hover:bg-black/60"
                style={{
                  borderColor: active ? product.accent : "rgba(255,255,255,0.12)",
                  // Dark glass rather than a white tint: over a patterned
                  // backdrop a light panel goes milky, while a dark one keeps
                  // the product shots reading against it.
                  backgroundColor: active ? "rgba(0,0,0,0.62)" : "rgba(0,0,0,0.45)",
                }}
              >
                <div className="overflow-hidden rounded-xl">
                  <PlaceholderImage
                    slot={f.slot}
                    imageMap={images}
                    width={400}
                    height={300}
                    label={f.name}
                    fit="contain"
                    rounded="rounded-xl"
                  />
                </div>
                <div className="mt-2 px-1 pb-1">
                  <div className="truncate text-sm font-semibold">{f.name}</div>
                  <div className="text-[11px] text-neutral-400">
                    {f.edition ?? product.baseRangeLabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
