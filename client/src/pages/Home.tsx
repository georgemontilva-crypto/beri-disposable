import HeroFan from "@/components/HeroFan";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { PublicLayout } from "@/components/PublicLayout";
import { useReveal } from "@/hooks/useReveal";
import { useSiteImages, type PublicMediaEntry } from "@/hooks/useSiteImages";
import { PRODUCTS, type Product } from "@/lib/products";
import { ArrowRight, Check, ShieldCheck, Store } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const images = useSiteImages();
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <PublicLayout>
      <div ref={revealRef}>
        <HeroFan />
        <Marquee />
        <ProductSummary images={images} />
        <AuthCta />
        <WholesaleCta />
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
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Four Devices, One Standard
        </h2>
        <p className="mt-4 text-neutral-500">
          From the auto-adaptive flagship to authentic shisha and bottled
          e-liquid — every Beri product runs the same flavor engineering and
          ships with a verifiable authenticity code.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.key} product={product} images={images} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({
  product,
  images,
}: {
  product: Product;
  images: Record<string, PublicMediaEntry>;
}) {
  return (
    <Link href={`/products/${product.key}`}>
      <article className="reveal group flex h-full flex-col overflow-hidden rounded-[2rem] border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.3)]">
        {/* Visual */}
        <div className="relative aspect-[16/10] overflow-hidden bg-neutral-950">
          <PlaceholderImage
            slot={`${product.key}_banner`}
            imageMap={images}
            width={800}
            height={500}
            label={product.name}
            rounded="rounded-none"
            className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]"
          />
          {/* Headline number */}
          <div className="pointer-events-none absolute bottom-0 left-0 flex items-end gap-2 bg-gradient-to-t from-black/80 to-transparent p-6 pr-16 pt-16 text-white">
            <span className="font-display text-5xl font-bold leading-none">
              {product.highlight.value}
            </span>
            <span className="pb-1 text-sm font-medium text-neutral-300">
              {product.highlight.unit}
            </span>
          </div>
        </div>

        {/* Copy */}
        <div className="flex flex-1 flex-col p-7">
          <h3 className="font-display text-3xl font-bold tracking-tight">
            {product.name}
          </h3>
          <p className="mt-1 text-sm font-medium text-neutral-400">
            {product.tagline}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600">
            {product.summary}
          </p>

          <ul className="mt-5 space-y-2">
            {product.keySpecs.map((spec) => (
              <li key={spec} className="flex items-center gap-2 text-sm text-neutral-700">
                <Check className="h-4 w-4 shrink-0 text-neutral-400" strokeWidth={2.5} />
                {spec}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-center justify-between pt-6">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              {product.flavors.length} flavors
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold transition-transform duration-300 group-hover:translate-x-1">
              Explore <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ─── Auth CTA ──────────────────────────────────────────────────────────── */
function AuthCta() {
  return (
    <section className="container pb-10">
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

/* ─── Wholesale CTA ─────────────────────────────────────────────────────── */
function WholesaleCta() {
  return (
    <section className="container pb-24">
      <div className="reveal flex flex-col items-start gap-6 rounded-[2rem] border border-neutral-200 px-8 py-12 md:flex-row md:items-center md:justify-between md:px-12">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">
            <Store className="h-4 w-4" /> For retailers
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Carry Beri In Your Store
          </h2>
          <p className="mt-3 max-w-lg text-sm text-neutral-600">
            Displays, master cases and full flavor coverage across all four
            lines. Apply for a wholesale account and our team will get back to
            you with pricing.
          </p>
        </div>
        <Link
          href="/wholesale"
          className="press inline-flex shrink-0 items-center gap-2 rounded-full bg-neutral-950 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
        >
          Apply For Wholesale <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
