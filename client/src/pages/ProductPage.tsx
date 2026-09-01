import { PlaceholderImage } from "@/components/PlaceholderImage";
import { PublicLayout } from "@/components/PublicLayout";
import { useReveal } from "@/hooks/useReveal";
import AuroraGlow from "@/components/AuroraGlow";
import PinnedBanner from "@/components/PinnedBanner";
import EditionBackdrop, { type EditionTheme } from "@/components/EditionBackdrop";
import ProductViewer3D from "@/components/ProductViewer3D";
import { useSiteImages, type PublicMediaEntry } from "@/hooks/useSiteImages";
import { getNextProduct, getProductByKey, PRODUCTS } from "@/lib/products";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import NotFound from "./NotFound";

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function ProductPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const key = params.key ?? "";
  const product = getProductByKey(key);
  const images = useSiteImages();
  const revealRef = useReveal<HTMLDivElement>();

  if (!product) return <NotFound />;

  const next = getNextProduct(key);

  // Each product gets its own slice of the wheel, so the four pages read as
  // related but distinct without hand-picking colours.
  const productHue = PRODUCTS.findIndex((p) => p.key === product.key) * 78;

  // Flavors keep their sheet order but split by edition, so limited runs read
  // as their own range instead of disappearing into one long grid.
  const flavorGroups = useMemo<
    { title: string | null; flavors: typeof product.flavors }[]
  >(() => {
    const core = product.flavors.filter((f) => !f.edition);
    const editions = new Map<string, typeof product.flavors>();
    for (const f of product.flavors) {
      if (!f.edition) continue;
      const list = editions.get(f.edition) ?? [];
      list.push(f);
      editions.set(f.edition, list);
    }
    return [
      ...(core.length ? [{ title: editions.size ? "Core Range" : null, flavors: core }] : []),
      ...Array.from(editions, ([title, flavors]) => ({ title, flavors })),
    ];
  }, [product]);

  const [activeEdition, setActiveEdition] = useState(0);
  const activeGroup = flavorGroups[activeEdition] ?? flavorGroups[0];

  /** Maps an edition name to its ambient backdrop. */
  const editionTheme: EditionTheme = (() => {
    const title = activeGroup?.title?.toLowerCase() ?? "";
    if (title.includes("winter")) return "winter";
    if (title.includes("summer")) return "summer";
    return "none";
  })();

  const goToNext = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(`/products/${next.key}`);
  };

  return (
    <PublicLayout>
      <AuroraGlow hue={productHue} />
      <div ref={revealRef} className="relative z-10 text-white">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="container py-12 md:py-16">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            <div className="mt-8 grid items-center gap-12 md:grid-cols-2">
              {/* Left: title + text — title aligned LEFT */}
              <div className="reveal">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                  Beri Disposable
                </span>
                {/* Title LEFT-aligned */}
                <h1 className="mt-3 font-display text-5xl font-bold tracking-tight sm:text-6xl text-left">
                  {product.name}
                </h1>
                <p className="mt-3 text-xl font-medium text-neutral-500 text-left">{product.tagline}</p>
                <p className="mt-5 max-w-md leading-relaxed text-neutral-400">
                  {product.description}
                </p>
                <div className="mt-7 grid max-w-md grid-cols-2 gap-3">
                  {product.specs.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div className="text-xs uppercase tracking-wider text-neutral-500">
                        {s.label}
                      </div>
                      <div className="mt-0.5 text-sm font-semibold">{s.value}</div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/authenticate"
                  className="press mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-200"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Verify Authenticity
                </Link>
              </div>

              {/* Right: interactive 3D model, falling back to the hero shot */}
              <div className="reveal" data-reveal-delay="120">
                <ProductViewer3D
                  slot={product.modelSlot}
                  fallbackSlot={product.heroSlot}
                  productName={product.name}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar (black background) ─────────────────────────────── */}
        <section className="bg-black py-12 text-white">
          <div className="container">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {product.specs.map((s) => {
                const icon = s.iconSlot ? images[s.iconSlot]?.url : undefined;
                return (
                  <div key={s.label} className="reveal flex flex-col items-center text-center">
                    {/* Icons are optional: with none uploaded the row is exactly
                        what it was, so a partly filled set never looks broken. */}
                    {icon && (
                      <img
                        src={icon}
                        alt=""
                        aria-hidden="true"
                        className="mb-3 h-12 w-12 object-contain"
                        width={96}
                        height={96}
                        loading="lazy"
                      />
                    )}
                    <div className="font-display text-3xl font-bold text-white">{s.value}</div>
                    <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Flavors grid ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-black py-20 text-white">
          {/* Ambient particles themed to the selected edition. */}
          <EditionBackdrop theme={editionTheme} />

          <div className="container relative">
            <div className="reveal mb-8">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                The Lineup
              </span>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-white">
                {product.name} Flavors
              </h2>
              <p className="mt-3 max-w-md text-neutral-400">
                Explore the full range of {product.flavors.length} signature flavors.
              </p>
            </div>

            {/* Edition tabs — only rendered when the product actually has more
                than one range, so single-range products stay uncluttered. */}
            {flavorGroups.length > 1 && (
              <div
                role="tablist"
                aria-label="Flavor editions"
                className="reveal mb-10 flex flex-wrap gap-2"
              >
                {flavorGroups.map((group, i) => {
                  const active = i === activeEdition;
                  return (
                    <button
                      key={group.title ?? "core"}
                      role="tab"
                      type="button"
                      aria-selected={active}
                      onClick={() => setActiveEdition(i)}
                      className={`press rounded-full px-5 py-2.5 font-display text-sm font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                        active
                          ? "bg-white text-neutral-950"
                          : "border border-white/20 text-white/60 hover:border-white/40 hover:text-white"
                      }`}
                    >
                      {group.title ?? "All"}
                      <span className="ml-2 text-[11px] font-medium opacity-60">
                        {group.flavors.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Keyed on the tab so the grid re-runs its reveal animation on
                every switch instead of swapping content in place. */}
            <div
              key={activeEdition}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {activeGroup?.flavors.map((f, i) => (
                <div
                  key={f.slug}
                  className="reveal group"
                  data-reveal-delay={Math.min(i * 40, 320)}
                >
                  <div className="overflow-hidden rounded-2xl transition-transform duration-300 group-hover:-translate-y-1.5">
                    <PlaceholderImage
                      slot={f.slot}
                      imageMap={images}
                      // Landscape cell with object-contain: the flavor shots
                      // are wide (box beside device), so cover was cutting the
                      // packaging off at both sides. contain shows the whole
                      // asset whatever aspect it arrives in.
                      width={800}
                      height={600}
                      label={f.name}
                      fit="contain"
                      rounded="rounded-2xl"
                    />
                  </div>
                  <div className="mt-3 px-1">
                    <div className="font-semibold text-white">{f.name}</div>
                    <div className="text-xs text-neutral-500">{product.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pinned banner: holds still while the page scrolls over it ── */}
        <PinnedBanner
          slot={`${product.key}_banner`}
          label={`${product.name} lifestyle banner`}
          className="h-[75vh] min-h-[420px]"
        />

        {/* ── Cross-sell (scroll to top + navigate) ────────────────────── */}
        <section className="container py-24">
          <button onClick={goToNext} className="w-full text-left">
            <div className="reveal group relative flex items-center justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 px-8 py-10 text-white transition-transform duration-300 hover:scale-[1.01] hover:bg-white/10 md:px-12">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                  Discover more
                </div>
                <div className="mt-2 font-display text-3xl font-bold">{next.name}</div>
              </div>
              <ArrowRight className="h-8 w-8 transition-transform duration-300 group-hover:translate-x-2" />
            </div>
          </button>
        </section>
      </div>
    </PublicLayout>
  );
}
