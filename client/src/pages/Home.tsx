import AuroraGlow from "@/components/AuroraGlow";
import { useTilt } from "@/hooks/useTilt";
import SmokeVapor from "@/components/SmokeVapor";
import HeroFan from "@/components/HeroFan";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { PublicLayout } from "@/components/PublicLayout";
import { useReveal } from "@/hooks/useReveal";
import { useSiteImages, type PublicMediaEntry } from "@/hooks/useSiteImages";
import { PRODUCTS, type Product } from "@/lib/products";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Home() {
  const images = useSiteImages();
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <PublicLayout overlayHeader>
      <AuroraGlow />
      {/* Sits above the glow so the vapour picks up its colour. */}
      <SmokeVapor />
      {/* Sits above the glow; the hero's own video covers it at the top. */}
      <div ref={revealRef} className="relative z-10">
        <HeroFan />
        <Marquee />
        <ProductSummary images={images} />
        <CtaPair />
        <Newsletter images={images} />
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
    <div className="overflow-hidden border-y border-white/10 bg-neutral-950/80 py-4 backdrop-blur-sm">
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

/* ─── Product summary ───────────────────────────────────────────────────────
   The homepage is a router: one comparable card per product, then straight to
   the product page. Full specs, flavor galleries and the 3D viewer live there,
   so nothing here repeats what the visitor will see next. */
function ProductSummary({ images }: { images: Record<string, PublicMediaEntry> }) {
  return (
    <section className="container py-20 md:py-28">
      <div className="reveal mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">
          The line-up
        </span>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
          Four Devices, One Standard
        </h2>
        <p className="mt-4 text-neutral-400">
          From the auto-adaptive flagship to authentic shisha and bottled
          e-liquid. Every Beri product runs the same flavor engineering and
          ships with a verifiable authenticity code.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {PRODUCTS.map((product, i) => (
          <div
            key={product.key}
            className="reveal drop-in"
            // Staggered so the four land in sequence rather than as one block.
            style={{ animationDelay: `${i * 130}ms` }}
          >
            <ProductCard product={product} images={images} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductCard({
  product,
  images,
  index,
}: {
  product: Product;
  images: Record<string, PublicMediaEntry>;
  index: number;
}) {
  // Offset each card so the four don't bob in unison, which would read as the
  // whole grid pulsing rather than four objects floating independently.
  const floatDelay = -(index * 1.6);
  const tilt = useTilt<HTMLElement>(7);

  return (
    <Link href={`/products/${product.key}`}>
      <article
        ref={tilt.ref}
        onPointerMove={tilt.onPointerMove}
        onPointerLeave={tilt.onPointerLeave}
        // The Tailwind hover translate is gone on purpose: useTilt owns
        // `transform`, and two sources writing the same property fight.
        className="tilt-card group flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.07]"
      >
        {/* Visual */}
        <div className="rainbow-ring relative aspect-[16/10] overflow-hidden rounded-t-[2rem] bg-neutral-950">
          {/*
            Two nested wrappers on purpose. The float is a CSS animation and the
            hover zoom is a transition — both drive `transform`, so on one
            element the animation would simply win and the hover would do
            nothing. Outer bobs, inner zooms.
          */}
          <div
            className="float-media h-full w-full"
            style={{ animationDelay: `${floatDelay}s` }}
          >
            <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.14]">
              <PlaceholderImage
                slot={`${product.key}_banner`}
                imageMap={images}
                width={800}
                height={500}
                label={product.name}
                rounded="rounded-none"
                className="h-full w-full"
              />
            </div>
          </div>
          {/* Headline number */}
          <div className="pointer-events-none absolute bottom-0 left-0 flex items-end gap-2 bg-gradient-to-t from-black/80 to-transparent p-6 pr-16 pt-16 text-white">
            <span
              className="font-display text-5xl font-bold leading-none"
              style={{ color: product.accent }}
            >
              {product.highlight.value}
            </span>
            <span className="pb-1 text-sm font-medium text-neutral-300">
              {product.highlight.unit}
            </span>
          </div>
        </div>

        {/* Copy */}
        <div className="flex flex-1 flex-col p-7">
          <h3 className="font-display text-3xl font-bold tracking-tight text-white">
            {product.name}
          </h3>
          <p
            className="mt-1 text-sm font-medium"
            style={{ color: product.accent }}
          >
            {product.tagline}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-neutral-400">
            {product.summary}
          </p>

          <ul className="mt-5 space-y-2">
            {product.keySpecs.map((spec) => (
              <li key={spec} className="flex items-center gap-2 text-sm text-neutral-300">
                <Check
                  className="h-4 w-4 shrink-0"
                  style={{ color: product.accent }}
                  strokeWidth={2.5}
                />
                {spec}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-center justify-between pt-6">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              {product.flavors.length} flavors
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white transition-transform duration-300 group-hover:translate-x-1">
              Explore <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ─── Split CTA pair ────────────────────────────────────────────────────────
   Two full-height cards in contrasting fills. The pairing does the work: the
   same card twice would read as a list, while light against dark reads as a
   choice between two directions. */
function CtaPair() {
  return (
    <section className="container pb-8">
      <div className="grid gap-6 md:grid-cols-2">
        <CtaCard
          title={<>Explore<br />The<br />Line-Up</>}
          body="Four devices, one standard. Compare Crush, Cliq, Cirql and E-Liquid, browse every flavor and see each one in 3D."
          cta="Explore Now"
          href="/products/crush"
          variant="light"
        />
        <CtaCard
          title={<>Work<br />With<br />Us</>}
          body="Stock Beri in your store. Displays, master cases and full flavor coverage across all four lines, with pricing from our team."
          cta="Apply For Wholesale"
          href="/wholesale"
          variant="dark"
        />
      </div>
    </section>
  );
}

function CtaCard({
  title,
  body,
  cta,
  href,
  variant,
}: {
  title: React.ReactNode;
  body: string;
  cta: string;
  href: string;
  variant: "light" | "dark";
}) {
  const light = variant === "light";
  return (
    <Link href={href}>
      <article
        className={`reveal drop-in group flex h-full flex-col justify-between rounded-[2rem] p-8 transition-transform duration-500 hover:-translate-y-1 md:min-h-[520px] md:p-12 ${
          light ? "bg-[#e2d3fb] text-neutral-950" : "bg-[#4a1fb8] text-white"
        }`}
      >
        <h2 className="font-display text-5xl font-bold uppercase leading-[0.92] tracking-tight md:text-6xl lg:text-7xl">
          {title}
        </h2>

        <div className="mt-12">
          <p
            className={`max-w-md text-sm font-semibold leading-relaxed ${
              light ? "text-neutral-800" : "text-white/85"
            }`}
          >
            {body}
          </p>
          <div
            className={`mt-6 flex items-center justify-between gap-4 rounded-full px-7 py-4 text-base font-bold transition-colors ${
              light
                ? "bg-[#d6c2f8] group-hover:bg-[#c9b0f5]"
                : "bg-white/15 group-hover:bg-white/25"
            }`}
          >
            <span>{cta}</span>
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ─── Newsletter ───────────────────────────────────────────────────────────── */
function Newsletter({ images }: { images: Record<string, PublicMediaEntry> }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);
  const [done, setDone] = useState(false);

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      setDone(true);
      setEmail("");
    },
    onError: (e) => toast.error(e.message || "Could not subscribe"),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      toast.error("Please tick the box to subscribe.");
      return;
    }
    subscribe.mutate({ email: email.trim() });
  };

  return (
    <section className="container pb-24">
      <div className="reveal drop-in grid gap-8 rounded-[2rem] bg-gradient-to-b from-[#3a2b63] to-neutral-950 p-6 md:grid-cols-[minmax(0,320px)_1fr] md:items-center md:gap-10 md:p-8">
        <div className="overflow-hidden rounded-[1.5rem]">
          <PlaceholderImage
            slot="newsletter_image"
            imageMap={images}
            width={640}
            height={720}
            label="Newsletter"
            rounded="rounded-[1.5rem]"
          />
        </div>

        <div>
          <span className="inline-block rounded-full border border-white/30 px-4 py-1 text-xs font-semibold text-white">
            Subscribe
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
            Be the first to know about new flavors, limited editions and drops
          </h2>

          {done ? (
            <p className="mt-8 text-sm font-semibold text-emerald-300">
              You&apos;re on the list. Watch your inbox.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-8">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address*"
                aria-label="Email address"
                className="w-full rounded-full bg-white px-6 py-4 text-neutral-900 outline-none ring-white/30 transition placeholder:text-neutral-500 focus:ring-4"
              />
              <label className="mt-4 flex items-start gap-2.5 text-sm text-white/85">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-white"
                />
                Yes, subscribe me to your newsletter.*
              </label>
              <button
                type="submit"
                disabled={subscribe.isPending}
                className="press mt-6 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-200 disabled:opacity-60"
              >
                {subscribe.isPending ? "Subscribing…" : "Subscribe"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
