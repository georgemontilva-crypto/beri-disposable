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
import { FLAVOR_PROFILES, type Flavor, type Product } from "@/lib/products";
import { useMemo, useState } from "react";

export default function FlavorShowcase({
  product,
  images,
}: {
  product: Product;
  images: Record<string, PublicMediaEntry>;
}) {
  const [filter, setFilter] = useState<string>("All");
  const [selected, setSelected] = useState<string>(product.flavors[0]?.slug ?? "");

  // Only offer filters that would actually return something: an empty chip is
  // a dead end the visitor has to discover by tapping it.
  const availableProfiles = useMemo(() => {
    const present = new Set(product.flavors.map((f) => f.profile));
    return FLAVOR_PROFILES.filter((p) => present.has(p));
  }, [product]);

  const visible = useMemo(
    () =>
      filter === "All"
        ? product.flavors
        : product.flavors.filter((f) => f.profile === filter),
    [product, filter]
  );

  const featured: Flavor | undefined =
    product.flavors.find((f) => f.slug === selected) ?? product.flavors[0];

  const chips = ["All", ...availableProfiles];

  return (
    <section className="py-20 text-white">
      <div className="container">
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
            {product.flavors.length} signature flavors. Pick one to see it up close.
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
                {featured.profile}
              </span>
              <h3 className="mt-4 font-display text-4xl font-bold leading-tight">
                {featured.name}
              </h3>
              {featured.edition && (
                <p className="mt-2 text-sm font-semibold text-neutral-300">
                  {featured.edition}
                </p>
              )}
              <p className="mt-4 text-neutral-300">
                Available on {product.name}, with the same flavor engineering
                across the range and a verifiable authenticity code on every unit.
              </p>
            </div>
          </div>
        )}

        {/* ── Filters ─────────────────────────────────────────────────── */}
        <div role="tablist" aria-label="Flavor profiles" className="reveal mb-6 flex flex-wrap gap-2">
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
                  {chip === "All"
                    ? product.flavors.length
                    : product.flavors.filter((f) => f.profile === chip).length}
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
                className="group rounded-2xl border p-2 text-left transition-all duration-200 hover:-translate-y-1"
                style={{
                  borderColor: active ? product.accent : "rgba(255,255,255,0.1)",
                  backgroundColor: active
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(255,255,255,0.04)",
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
                  <div className="text-[11px] text-neutral-300">{f.profile}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
