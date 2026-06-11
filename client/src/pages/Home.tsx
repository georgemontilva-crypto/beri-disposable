import { PlaceholderImage } from "@/components/PlaceholderImage";
import { PublicLayout } from "@/components/PublicLayout";
import { useReveal } from "@/hooks/useReveal";
import { useSiteImages } from "@/hooks/useSiteImages";
import { BERI_CLIQ, BERI_CRUSH, type Flavor, type Product } from "@/lib/products";
import { ArrowRight, ShieldCheck, Sparkles, Zap, Cpu, Battery, Monitor } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const images = useSiteImages();
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <PublicLayout>
      <div ref={revealRef}>
        <Hero images={images} />
        <Marquee />
        <FeatureStrip />
        <ProductDeepSection product={BERI_CRUSH} images={images} align="left" accentColor="from-neutral-900 to-neutral-600" badgeLabel="WORLD'S 1ST AUTO-ADAPTIVE POWER" />
        <ProductDeepSection product={BERI_CLIQ} images={images} align="right" accentColor="from-neutral-700 to-neutral-400" badgeLabel="FIND YOUR CLIQ" />
        <AuthCta />
      </div>
    </PublicLayout>
  );
}

/* ─── Hero ─────────────────────────────────────────────────────────────── */
function Hero({ images }: { images: Record<string, string> }) {
  return (
    <section className="relative overflow-hidden noise-bg">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-neutral-200/50 blur-3xl" />
      <div className="container relative grid items-center gap-12 py-20 md:grid-cols-2 md:py-28">
        <div className="reveal">
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Premium Disposable &amp; Pod Systems
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Taste the
            <br />
            <span className="bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-900 bg-clip-text text-transparent">
              real thing.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            Bold, true-to-taste flavor engineered for consistency. Two iconic lines — Beri Crush and Beri Cliq — each crafted to deliver a premium experience every time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/authenticate"
              className="press inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
            >
              <ShieldCheck className="h-4 w-4" />
              Authenticate Product
            </Link>
            <Link
              href="/products/crush"
              className="press inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white/50 px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-white"
            >
              Explore Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="reveal relative" data-reveal-delay="120">
          <div className="animate-float">
            <PlaceholderImage
              slot="home_hero"
              imageMap={images}
              width={720}
              height={840}
              label="Hero product render"
              className="shadow-2xl"
              rounded="rounded-[2rem]"
            />
          </div>
          <div className="glass absolute -bottom-6 -left-6 hidden items-center gap-3 rounded-2xl px-5 py-4 shadow-xl sm:flex">
            <div className="rounded-full bg-foreground p-2 text-background">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold">100% Authentic</div>
              <div className="text-xs text-muted-foreground">Verified by code</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Marquee ───────────────────────────────────────────────────────────── */
function Marquee() {
  const items = ["BERI CRUSH", "BERI CLIQ", "AUTHENTIC", "PREMIUM FLAVOR", "VERIFIED", "MONOCHROME"];
  const doubled = [...items, ...items];
  return (
    <div className="border-y border-neutral-200 bg-neutral-950 py-4 text-white">
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap px-6">
        {doubled.map((t, i) => (
          <span key={i} className="font-display text-sm font-semibold tracking-[0.3em] text-neutral-400">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Feature strip ─────────────────────────────────────────────────────── */
function FeatureStrip() {
  const features = [
    { icon: ShieldCheck, title: "Verified Authenticity", desc: "Every device carries a unique secret code you can verify instantly." },
    { icon: Zap, title: "Engineered Consistency", desc: "Smooth, true-to-taste flavor from the first puff to the last." },
    { icon: Sparkles, title: "Two Iconic Lines", desc: "Beri Crush for raw power. Beri Cliq for magnetic versatility." },
  ];
  return (
    <section className="container py-16 md:py-20">
      <div className="reveal text-center mb-10">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">The Beri Lineup</span>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Two products. One standard.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Whether you choose the raw power of Beri Crush or the magnetic versatility of Beri Cliq, every device is built to the same uncompromising standard.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="reveal glass rounded-2xl p-7 transition-transform duration-300 hover:-translate-y-1"
            data-reveal-delay={i * 80}
          >
            <div className="inline-flex rounded-xl bg-foreground p-2.5 text-background">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Product Deep Section ──────────────────────────────────────────────── */
function ProductDeepSection({
  product,
  images,
  align,
  accentColor,
  badgeLabel,
}: {
  product: Product;
  images: Record<string, string>;
  align: "left" | "right";
  accentColor: string;
  badgeLabel: string;
}) {
  const imageFirst = align === "right";
  const isCliq = product.key === "cliq";

  return (
    <section className={`relative overflow-hidden py-20 md:py-28 ${isCliq ? "bg-neutral-950 text-white" : "bg-white"}`}>
      {/* Decorative blobs */}
      <div className={`pointer-events-none absolute -top-32 ${imageFirst ? "left-0" : "right-0"} h-96 w-96 rounded-full blur-3xl ${isCliq ? "bg-white/5" : "bg-neutral-100/80"}`} />

      <div className="container relative">
        {/* Header */}
        <div className="reveal mb-12 text-center">
          <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur ${isCliq ? "border-white/20 bg-white/10 text-white/70" : "border-neutral-200 bg-white/60 text-neutral-600"}`}>
            {badgeLabel}
          </span>
          <h2 className={`mt-4 font-display text-5xl font-bold tracking-tight sm:text-6xl ${isCliq ? "text-white" : "text-foreground"}`}>
            {product.name}
          </h2>
          <p className={`mt-2 text-xl font-medium ${isCliq ? "text-white/60" : "text-neutral-500"}`}>
            {product.tagline}
          </p>
        </div>

        {/* Main grid: image + info */}
        <div className={`grid items-center gap-12 md:grid-cols-2 mb-16`}>
          {/* Image */}
          <div className={`reveal ${imageFirst ? "md:order-1" : "md:order-2"}`} data-reveal-delay="60">
            <div className="animate-float">
              <PlaceholderImage
                slot={product.heroSlot}
                imageMap={images}
                width={640}
                height={640}
                label={`${product.name} render`}
                rounded="rounded-[2rem]"
                className="shadow-2xl"
              />
            </div>
          </div>

          {/* Info */}
          <div className={`reveal ${imageFirst ? "md:order-2" : "md:order-1"}`}>
            <p className={`max-w-md text-lg leading-relaxed ${isCliq ? "text-white/70" : "text-muted-foreground"}`}>
              {product.description}
            </p>

            {/* Puff count highlight */}
            <div className={`mt-8 grid grid-cols-2 gap-4`}>
              {product.specs.slice(0, 2).map((s) => (
                <div
                  key={s.label}
                  className={`rounded-2xl p-5 text-center ${isCliq ? "bg-white/10 border border-white/20" : "bg-neutral-950 text-white"}`}
                >
                  <div className={`font-display text-4xl font-black tracking-tight ${isCliq ? "text-white" : "text-white"}`}>
                    {s.value}
                  </div>
                  <div className={`mt-1 text-xs font-semibold uppercase tracking-wider ${isCliq ? "text-white/50" : "text-neutral-400"}`}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Feature badges */}
            <div className="mt-6 flex flex-wrap gap-2">
              {product.specs.slice(2).map((s) => (
                <span
                  key={s.label}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${isCliq ? "border-white/20 bg-white/10 text-white/80" : "border-neutral-200 bg-neutral-50 text-neutral-700"}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isCliq ? "bg-white/60" : "bg-neutral-400"}`} />
                  {s.label}: {s.value}
                </span>
              ))}
            </div>

            <Link
              href={`/products/${product.key}`}
              className={`press mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-colors ${isCliq ? "bg-white text-neutral-950 hover:bg-white/90" : "bg-foreground text-background hover:bg-foreground/90"}`}
            >
              Discover {product.name}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Flavor carousel */}
        <FlavorCarouselAuto product={product} images={images} dark={isCliq} />
      </div>
    </section>
  );
}

/* ─── Auto-play Flavor Carousel ─────────────────────────────────────────── */
function FlavorCarouselAuto({
  product,
  images,
  dark,
}: {
  product: Product;
  images: Record<string, string>;
  dark: boolean;
}) {
  const flavors = product.flavors;
  const VISIBLE = 4; // cards visible at once (desktop)
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = flavors.length;
  const maxIndex = total - VISIBLE;

  const next = () => setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
  const prev = () => setCurrent((c) => (c <= 0 ? maxIndex : c - 1));

  // Autoplay every 3.5 s
  useEffect(() => {
    timerRef.current = setInterval(next, 3500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [maxIndex]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 3500);
  };

  const handlePrev = () => { prev(); resetTimer(); };
  const handleNext = () => { next(); resetTimer(); };

  return (
    <div className="reveal mt-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className={`text-xs font-semibold uppercase tracking-[0.25em] ${dark ? "text-white/40" : "text-muted-foreground"}`}>
            Flavors
          </span>
          <h3 className={`mt-1 font-display text-2xl font-bold ${dark ? "text-white" : "text-foreground"}`}>
            {product.name} — All Flavors
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            aria-label="Previous flavors"
            className={`press rounded-full border p-2.5 transition-colors ${dark ? "border-white/20 bg-white/10 text-white hover:bg-white/20" : "border-neutral-200 bg-white text-foreground hover:bg-neutral-50"}`}
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next flavors"
            className={`press rounded-full border p-2.5 transition-colors ${dark ? "border-white/20 bg-white/10 text-white hover:bg-white/20" : "border-neutral-200 bg-white text-foreground hover:bg-neutral-50"}`}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sliding window */}
      <div className="overflow-hidden">
        <div
          className="flex gap-4 transition-transform duration-500"
          style={{ transform: `translateX(calc(-${current} * (100% / ${VISIBLE} + 1rem)))` }}
        >
          {flavors.map((f: Flavor) => (
            <div
              key={f.slug}
              className="shrink-0"
              style={{ width: `calc(${100 / VISIBLE}% - ${(VISIBLE - 1) * 16 / VISIBLE}px)` }}
            >
              <PlaceholderImage
                slot={f.slot}
                imageMap={images}
                width={320}
                height={400}
                label={f.name}
                rounded="rounded-2xl"
                className="shadow-md"
              />
              <div className="mt-3 px-1">
                <div className={`font-semibold text-sm ${dark ? "text-white" : "text-foreground"}`}>{f.name}</div>
                <div className={`text-xs mt-0.5 ${dark ? "text-white/40" : "text-muted-foreground"}`}>{product.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="mt-5 flex justify-center gap-1.5">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); resetTimer(); }}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? (dark ? "w-6 bg-white" : "w-6 bg-foreground") : (dark ? "w-1.5 bg-white/30" : "w-1.5 bg-neutral-300")}`}
          />
        ))}
      </div>

      {/* Link to full product page */}
      <div className="mt-6 text-center">
        <Link
          href={`/products/${product.key}`}
          className={`text-sm font-semibold underline-offset-4 hover:underline ${dark ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"}`}
        >
          View all {product.flavors.length} flavors →
        </Link>
      </div>
    </div>
  );
}

/* ─── Auth CTA ──────────────────────────────────────────────────────────── */
function AuthCta() {
  return (
    <section className="container py-20">
      <div className="reveal relative overflow-hidden rounded-[2.5rem] bg-foreground px-8 py-16 text-center text-background md:px-16">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
        <ShieldCheck className="mx-auto h-12 w-12" />
        <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Make sure your BERI is the real deal
        </h2>
        <p className="mx-auto mt-4 max-w-md text-background/70">
          Scratch the label, scan the code and certify your product is 100% authentic.
        </p>
        <Link
          href="/authenticate"
          className="press mt-8 inline-flex items-center gap-2 rounded-full bg-background px-8 py-3.5 text-sm font-semibold text-foreground transition-transform hover:scale-[1.02]"
        >
          Authenticate Now
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
