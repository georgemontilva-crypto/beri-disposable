import { PlaceholderImage } from "@/components/PlaceholderImage";
import { PublicLayout } from "@/components/PublicLayout";
import { useReveal } from "@/hooks/useReveal";
import AuroraGlow from "@/components/AuroraGlow";
import PinnedBanner from "@/components/PinnedBanner";
import FlavorShowcase from "@/components/FlavorShowcase";
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

  const logoUrl = images[product.logoSlot]?.url;

  const goToNext = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(`/products/${next.key}`);
  };

  return (
    <PublicLayout>
      <AuroraGlow hue={productHue} />
      <div ref={revealRef} className="relative z-10 text-white">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-white/15">
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
                <span
                  className="text-xs font-semibold uppercase tracking-[0.25em]"
                  style={{ color: product.accent }}
                >
                  Beri Disposable
                </span>

                {/*
                  The uploaded lockup replaces the h1 visually but the h1 stays
                  in the markup, screen-reader only: an image alone would leave
                  the page with no heading for assistive tech or search engines.
                */}
                {logoUrl ? (
                  <>
                    <h1 className="sr-only">{product.name}</h1>
                    <img
                      src={logoUrl}
                      alt={product.name}
                      className="mt-4 h-20 w-auto object-contain sm:h-24"
                      width={520}
                      height={192}
                    />
                  </>
                ) : (
                  <h1 className="mt-3 text-left font-display text-5xl font-bold tracking-tight sm:text-6xl">
                    {product.name}
                  </h1>
                )}
                <p className="mt-3 text-left text-xl font-medium text-neutral-300">
                  {product.tagline}
                </p>
                <p className="mt-5 max-w-md leading-relaxed text-neutral-300">
                  {product.description}
                </p>
                <div className="mt-7 grid max-w-md grid-cols-2 gap-3">
                  {product.specs.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl border border-white/15 bg-white/5 px-4 py-3"
                    >
                      <div className="text-xs uppercase tracking-wider text-neutral-300">
                        {s.label}
                      </div>
                      <div className="mt-0.5 text-sm font-semibold">{s.value}</div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/authenticate"
                  className="press mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-neutral-950 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: product.accent }}
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
        <section className="border-y border-white/10 bg-white/[0.03] py-12 text-white">
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
                    <div
                      className="font-display text-3xl font-bold"
                      style={{ color: product.accent }}
                    >
                      {s.value}
                    </div>
                    <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-neutral-300">
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <FlavorShowcase product={product} images={images} />

        {/* ── Pinned banner: holds still while the page scrolls over it ── */}
        <PinnedBanner
          slot={`${product.key}_banner`}
          label={`${product.name} lifestyle banner`}
          className="h-[75vh] min-h-[420px]"
        />

        {/* ── Cross-sell (scroll to top + navigate) ────────────────────── */}
        <section className="container py-24">
          <button onClick={goToNext} className="w-full text-left">
            <div className="reveal group relative flex items-center justify-between overflow-hidden rounded-[2rem] border border-white/15 bg-white/5 px-8 py-10 text-white transition-transform duration-300 hover:scale-[1.01] hover:bg-white/10 md:px-12">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-300">
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
