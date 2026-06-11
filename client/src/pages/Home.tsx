import { PlaceholderImage } from "@/components/PlaceholderImage";
import { PublicLayout } from "@/components/PublicLayout";
import { useReveal } from "@/hooks/useReveal";
import { useSiteImages } from "@/hooks/useSiteImages";
import { BERI_CLIQ, BERI_CRUSH, type Product } from "@/lib/products";
import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
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
        <ProductSection product={BERI_CRUSH} images={images} align="left" />
        <ProductSection product={BERI_CLIQ} images={images} align="right" />
        <FlavorCarousel images={images} />
        <AuthCta />
      </div>
    </PublicLayout>
  );
}

function Hero({ images }: { images: Record<string, string> }) {
  return (
    <section className="relative overflow-hidden noise-bg">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-neutral-200/50 blur-3xl" />
      <div className="container relative grid items-center gap-12 py-20 md:grid-cols-2 md:py-28">
        <div className="reveal">
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Premium Disposable & Pod Systems
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Taste the
            <br />
            <span className="bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-900 bg-clip-text text-transparent">
              real thing.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            Bold, true-to-taste flavor engineered for consistency. Verify your
            genuine BERI product in seconds and explore the full lineup.
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

function Marquee() {
  const items = [
    "BERI CRUSH",
    "BERI CLIQ",
    "AUTHENTIC",
    "PREMIUM FLAVOR",
    "VERIFIED",
    "MONOCHROME",
  ];
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

function FeatureStrip() {
  const features = [
    { icon: ShieldCheck, title: "Verified Authenticity", desc: "Every device carries a unique secret code you can verify instantly." },
    { icon: Zap, title: "Engineered Consistency", desc: "Smooth, true-to-taste flavor from the first puff to the last." },
    { icon: Sparkles, title: "Refined Design", desc: "Clean monochrome aesthetic with premium build quality." },
  ];
  return (
    <section className="container py-16 md:py-20">
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

function ProductSection({
  product,
  images,
  align,
}: {
  product: Product;
  images: Record<string, string>;
  align: "left" | "right";
}) {
  const imageFirst = align === "right";
  return (
    <section className="container py-16 md:py-24">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div className={imageFirst ? "md:order-2" : ""}>
          <div className="reveal">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Product
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              {product.name}
            </h2>
            <p className="mt-2 text-lg font-medium text-neutral-500">{product.tagline}</p>
            <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
              {product.description}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {product.specs.map((s) => (
                <div key={s.label} className="rounded-xl border border-neutral-200 bg-white/50 px-4 py-3 backdrop-blur">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                  <div className="mt-0.5 text-sm font-semibold">{s.value}</div>
                </div>
              ))}
            </div>
            <Link
              href={`/products/${product.key}`}
              className="press mt-7 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
            >
              Discover {product.name}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className={imageFirst ? "md:order-1" : ""}>
          <div className="reveal" data-reveal-delay="100">
            <PlaceholderImage
              slot={product.heroSlot}
              imageMap={images}
              width={640}
              height={640}
              label={`${product.name} render`}
              rounded="rounded-[2rem]"
              className="shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FlavorCarousel({ images }: { images: Record<string, string> }) {
  const flavors = BERI_CRUSH.flavors.slice(0, 8);
  return (
    <section className="bg-neutral-950 py-20 text-white">
      <div className="container">
        <div className="reveal flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
              Flavors
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">
              A flavor for every mood
            </h2>
          </div>
          <Link href="/products/crush" className="text-sm font-semibold text-neutral-300 underline-offset-4 hover:underline">
            View all flavors
          </Link>
        </div>
      </div>
      <div className="mt-10 flex gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {flavors.map((f, i) => (
          <div key={f.slug} className="reveal w-56 shrink-0" data-reveal-delay={i * 50}>
            <PlaceholderImage
              slot={f.slot}
              imageMap={images}
              width={320}
              height={400}
              label={f.name}
              rounded="rounded-2xl"
            />
            <div className="mt-3 px-1">
              <div className="font-semibold">{f.name}</div>
              <div className="text-xs text-neutral-500">Beri Crush</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

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
