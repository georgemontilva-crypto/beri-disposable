import { PlaceholderImage } from "@/components/PlaceholderImage";
import { PublicLayout } from "@/components/PublicLayout";
import { useReveal } from "@/hooks/useReveal";
import { useSiteImages, type PublicMediaEntry } from "@/hooks/useSiteImages";
import { getProductByKey, type SpecSlot } from "@/lib/products";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import NotFound from "./NotFound";

/* ─── Bento Spec Grid ──────────────────────────────────────────────────── */
function SpecGrid({
  specSlots,
  images,
  productName,
}: {
  specSlots: SpecSlot[];
  images: Record<string, PublicMediaEntry>;
  productName: string;
}) {
  return (
    <section className="bg-black py-20">
      <div className="container">
        <div className="reveal mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Engineering
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-white">
            Built Different
          </h2>
          <p className="mt-3 max-w-md text-neutral-400">
            Every detail of the {productName} is engineered for a premium experience.
          </p>
        </div>

        {/* Bento grid */}
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
            gridAutoRows: "220px",
          }}
        >
          {specSlots.map((s, i) => {
            const entry = images[s.slot];
            const hasMedia = !!entry;
            const isStatCard = !hasMedia && (s.bigValue || s.bigUnit);

            const cellClass = [
              "reveal relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 text-white transition-transform duration-300 hover:-translate-y-1",
              s.tall ? "row-span-2" : "",
              s.wide ? "col-span-2" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div key={s.slot} className={cellClass} style={{ transitionDelay: `${i * 60}ms` }}>
                {hasMedia ? (
                  <>
                    {entry.mimeType?.startsWith("video/") ? (
                      <video
                        src={entry.url}
                        className="h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={entry.url}
                        alt={s.label}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-10">
                      <p className="text-sm font-semibold leading-tight">{s.label}</p>
                    </div>
                  </>
                ) : isStatCard ? (
                  <div className="flex h-full flex-col items-center justify-center gap-1 p-6 text-center">
                    <span className="font-display text-5xl font-black tracking-tight text-white">
                      {s.bigValue}
                    </span>
                    <span className="text-sm font-semibold text-neutral-300">{s.bigUnit}</span>
                    <span className="mt-2 text-xs text-neutral-500">{s.label}</span>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 border border-dashed border-neutral-700 bg-neutral-900 text-neutral-500">
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 12px, transparent 12px 24px)",
                      }}
                    />
                    <span className="relative font-mono text-xs">{s.slot}</span>
                    <span className="relative text-xs font-medium text-neutral-400">{s.label}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function ProductPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const key = params.key ?? "";
  const product = getProductByKey(key);
  const images = useSiteImages();
  const revealRef = useReveal<HTMLDivElement>();

  if (!product) return <NotFound />;

  const other = key === "crush" ? "cliq" : "crush";
  const otherName = key === "crush" ? "Beri Cliq" : "Beri Crush";

  const goToOther = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(`/products/${other}`);
  };

  return (
    <PublicLayout>
      <div ref={revealRef}>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
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
              {/* Left: title + text — title aligned LEFT */}
              <div className="reveal">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Beri Disposable
                </span>
                {/* Title LEFT-aligned */}
                <h1 className="mt-3 font-display text-5xl font-bold tracking-tight sm:text-6xl text-left">
                  {product.name}
                </h1>
                <p className="mt-3 text-xl font-medium text-neutral-500 text-left">{product.tagline}</p>
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

              {/* Right: hero image */}
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

        {/* ── Stats bar (black background) ─────────────────────────────── */}
        <section className="bg-black py-12 text-white">
          <div className="container">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {product.specs.map((s) => (
                <div key={s.label} className="reveal text-center">
                  <div className="font-display text-3xl font-bold text-white">{s.value}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Banner ───────────────────────────────────────────────────── */}
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

        {/* ── Bento Spec Grid (black bg) ───────────────────────────────── */}
        <SpecGrid specSlots={product.specSlots} images={images} productName={product.name} />

        {/* ── Flavors grid ─────────────────────────────────────────────── */}
        <section className="bg-black py-20 text-white">
          <div className="container">
            <div className="reveal mb-10">
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
                    <div className="font-semibold text-white">{f.name}</div>
                    <div className="text-xs text-neutral-500">{product.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Cross-sell (scroll to top + navigate) ────────────────────── */}
        <section className="container py-24">
          <button onClick={goToOther} className="w-full text-left">
            <div className="reveal group relative flex items-center justify-between overflow-hidden rounded-[2rem] bg-neutral-950 px-8 py-10 text-white transition-transform duration-300 hover:scale-[1.01] md:px-12">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                  Discover more
                </div>
                <div className="mt-2 font-display text-3xl font-bold">{otherName}</div>
              </div>
              <ArrowRight className="h-8 w-8 transition-transform duration-300 group-hover:translate-x-2" />
            </div>
          </button>
        </section>
      </div>
    </PublicLayout>
  );
}
