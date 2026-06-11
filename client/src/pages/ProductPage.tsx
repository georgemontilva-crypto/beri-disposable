import { PlaceholderImage } from "@/components/PlaceholderImage";
import { PublicLayout } from "@/components/PublicLayout";
import { useReveal } from "@/hooks/useReveal";
import { useSiteImages } from "@/hooks/useSiteImages";
import { getProductByKey } from "@/lib/products";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { Link, useParams } from "wouter";
import NotFound from "./NotFound";

export default function ProductPage() {
  const params = useParams();
  const key = params.key ?? "";
  const product = getProductByKey(key);
  const images = useSiteImages();
  const revealRef = useReveal<HTMLDivElement>();

  if (!product) return <NotFound />;

  const other = key === "crush" ? "cliq" : "crush";
  const otherName = key === "crush" ? "Beri Cliq" : "Beri Crush";

  return (
    <PublicLayout>
      <div ref={revealRef}>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-neutral-200 noise-bg">
          <div className="container py-12 md:py-16">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <div className="mt-8 grid items-center gap-12 md:grid-cols-2">
              <div className="reveal">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Beri Disposable
                </span>
                <h1 className="mt-3 font-display text-5xl font-bold tracking-tight sm:text-6xl">
                  {product.name}
                </h1>
                <p className="mt-3 text-xl font-medium text-neutral-500">{product.tagline}</p>
                <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
                <div className="mt-7 grid max-w-md grid-cols-2 gap-3">
                  {product.specs.map((s) => (
                    <div key={s.label} className="glass rounded-xl px-4 py-3">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                      <div className="mt-0.5 text-sm font-semibold">{s.value}</div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/authenticate"
                  className="press mt-7 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Verify Authenticity
                </Link>
              </div>
              <div className="reveal" data-reveal-delay="120">
                <div className="animate-float">
                  <PlaceholderImage
                    slot={product.heroSlot}
                    imageMap={images}
                    width={680}
                    height={760}
                    label={`${product.name} hero render`}
                    rounded="rounded-[2rem]"
                    className="shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Banner */}
        <section className="container py-14">
          <div className="reveal">
            <PlaceholderImage
              slot={`${product.key}_banner`}
              imageMap={images}
              width={1280}
              height={420}
              label={`${product.name} lifestyle banner`}
              rounded="rounded-[2rem]"
            />
          </div>
        </section>

        {/* Flavors grid */}
        <section className="container pb-20">
          <div className="reveal mb-10 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              The Lineup
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">
              {product.name} Flavors
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Explore the full range of {product.flavors.length} signature flavors.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {product.flavors.map((f, i) => (
              <div
                key={f.slug}
                className="reveal group"
                data-reveal-delay={Math.min(i * 40, 320)}
              >
                <div className="overflow-hidden rounded-2xl transition-transform duration-300 group-hover:-translate-y-1.5">
                  <PlaceholderImage
                    slot={f.slot}
                    imageMap={images}
                    width={400}
                    height={500}
                    label={f.name}
                    rounded="rounded-2xl"
                  />
                </div>
                <div className="mt-3 px-1">
                  <div className="font-semibold">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{product.name}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cross-sell */}
        <section className="container pb-24">
          <Link href={`/products/${other}`}>
            <div className="reveal group relative flex items-center justify-between overflow-hidden rounded-[2rem] bg-neutral-950 px-8 py-10 text-white transition-transform duration-300 hover:scale-[1.01] md:px-12">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                  Discover more
                </div>
                <div className="mt-2 font-display text-3xl font-bold">{otherName}</div>
              </div>
              <ArrowRight className="h-8 w-8 transition-transform duration-300 group-hover:translate-x-2" />
            </div>
          </Link>
        </section>
      </div>
    </PublicLayout>
  );
}
