import HeroInteractive from "@/components/HeroInteractive";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { PublicLayout } from "@/components/PublicLayout";
import { useReveal } from "@/hooks/useReveal";
import { useSiteImages, type PublicMediaEntry } from "@/hooks/useSiteImages";
import { BERI_CIRQL, BERI_CLIQ, BERI_CRUSH, BERI_ELIQUID, type Flavor, type Product } from "@/lib/products";
import { ArrowRight, ShieldCheck, Sparkles, Zap, Cpu, Battery, Monitor } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const images = useSiteImages();
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <PublicLayout>
      <div ref={revealRef}>
        <HeroInteractive />
        <Marquee />
        <FeatureStrip />
        <ProductDeepSection product={BERI_CRUSH} images={images} align="left" accentColor="from-neutral-900 to-neutral-600" badgeLabel="WORLD'S 1ST AUTO-ADAPTIVE POWER" />
        <ProductDeepSection product={BERI_CLIQ} images={images} align="right" accentColor="from-neutral-700 to-neutral-400" badgeLabel="FIND YOUR CLIQ" />
        <ProductDeepSection product={BERI_CIRQL} images={images} align="left" accentColor="from-neutral-900 to-neutral-600" badgeLabel="FULL CIRCLE PERFORMANCE" />
        <ProductDeepSection product={BERI_ELIQUID} images={images} align="right" accentColor="from-neutral-700 to-neutral-400" badgeLabel="THE FLAVOR, BOTTLED" />
        <AuthCta />
      </div>
    </PublicLayout>
  );
}

/* ─── Marquee ───────────────────────────────────────────────────────────── */
function Marquee() {
  const items = [
    "BERI CRUSH",
    "BERI CLIQ",
    "BERI CIRQL",
    "BERI E-LIQUID",
    "AUTHENTIC",
    "PREMIUM FLAVOR",
    "VERIFIED",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-neutral-200 bg-neutral-950 py-4">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="mx-8 font-display text-sm font-bold tracking-[0.25em] text-white/60"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Feature Strip ─────────────────────────────────────────────────────── */
function FeatureStrip() {
  const features = [
    { icon: Zap, title: "Auto-Adaptive Power", desc: "World's 1st AAP technology" },
    { icon: Monitor, title: "Interactive HD Screen", desc: "Real-time usage display" },
    { icon: Battery, title: "2.5x Charging Speed", desc: "Blazing fast recharge" },
    { icon: Cpu, title: "Quad Coil Technology", desc: "Unmatched flavor density" },
    { icon: Sparkles, title: "360° Crystal Tank", desc: "Full-view e-liquid window" },
    { icon: ShieldCheck, title: "Verified Authentic", desc: "Scratch & scan security" },
  ];
  return (
    <section className="container py-16">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {features.map((f) => (
          <div key={f.title} className="reveal flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950 text-white">
              <f.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">{f.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{f.desc}</div>
            </div>
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
  images: Record<string, PublicMediaEntry>;
  align: "left" | "right";
  accentColor: string;
  badgeLabel: string;
}) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % product.flavors.length);
    }, 3500);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [product.flavors.length]);

  const handleDot = (i: number) => {
    setCurrent(i);
    if (timerRef.current) clearInterval(timerRef.current);
    startTimer();
  };

  const flavor: Flavor = product.flavors[current];

  return (
    <section className="overflow-hidden bg-neutral-950 py-20 text-white">
      <div className="container">
        {/* Header */}
        <div className={`reveal mb-12 flex flex-col ${align === "right" ? "items-end text-right" : "items-start text-left"}`}>
          <span className="mb-3 inline-block rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
            {badgeLabel}
          </span>
          <h2 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
            {product.name}
          </h2>
          <p className="mt-3 max-w-md text-neutral-400">{product.tagline}</p>
        </div>

        {/* Grid */}
        <div className={`grid items-center gap-12 md:grid-cols-2 ${align === "right" ? "md:[direction:rtl]" : ""}`}>
          {/* Specs */}
          <div className="reveal space-y-6 md:[direction:ltr]">
            <div className="grid grid-cols-2 gap-3">
              {product.specs.map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
                  <div className="text-xs uppercase tracking-wider text-neutral-500">{s.label}</div>
                  <div className="mt-1 text-sm font-semibold text-white">{s.value}</div>
                </div>
              ))}
            </div>
            <Link
              href={`/products/${product.key}`}
              className="press inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-100"
            >
              Explore {product.name} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Flavor carousel */}
          <div className="reveal md:[direction:ltr]">
            <div className="overflow-hidden rounded-[2rem]">
              <PlaceholderImage
                slot={flavor.slot}
                imageMap={images}
                width={480}
                height={600}
                label={flavor.name}
                rounded="rounded-[2rem]"
                className="transition-opacity duration-500"
              />
            </div>
            <div className="mt-4 flex items-center justify-between px-1">
              <span className="text-sm font-semibold">{flavor.name}</span>
              <div className="flex gap-1.5">
                {product.flavors.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleDot(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-5 bg-white" : "w-1.5 bg-white/30"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Auth CTA ──────────────────────────────────────────────────────────── */
function AuthCta() {
  return (
    <section className="container py-24">
      <div className="reveal relative overflow-hidden rounded-[2rem] bg-neutral-950 px-8 py-16 text-center text-white md:px-16">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.15) 0%, transparent 70%)",
          }}
        />
        <ShieldCheck className="relative mx-auto mb-6 h-12 w-12 text-white/60" />
        <h2 className="relative font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Is Your Device Authentic?
        </h2>
        <p className="relative mx-auto mt-4 max-w-md text-neutral-400">
          Every Beri device ships with a unique security code. Scratch the label, scan the QR, or
          enter the code below to verify your product.
        </p>
        <Link
          href="/authenticate"
          className="press relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-100"
        >
          <ShieldCheck className="h-4 w-4" />
          Verify Now
        </Link>
      </div>
    </section>
  );
}
