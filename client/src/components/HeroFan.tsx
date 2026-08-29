/**
 * Fan-card hero.
 *
 * Four product cards splayed in an arc; hovering one straightens it, lifts it
 * and brings it to the front. The overshoot easing is what sells the effect —
 * the card travels past its resting position and settles back.
 *
 * Layout notes:
 *  - The fan is absolutely positioned and only runs at md+. Four rotated
 *    240px cards need ~900px to read as an arc; below that they collapse into
 *    an unreadable stack, so small screens get a plain scrollable row instead.
 *  - The background image is optional and sits under a scrim so the headline
 *    stays legible whatever the client uploads.
 */
import { useSiteImages } from "@/hooks/useSiteImages";
import { PRODUCTS } from "@/lib/products";
import { ArrowRight, ImageIcon, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

/** Resting position of each card in the arc, in DOM order. */
const FAN = [
  { tx: -279, ty: 44, rot: -12, z: 10 },
  { tx: -93, ty: 0, rot: -4, z: 20 },
  { tx: 93, ty: 2, rot: 4, z: 30 },
  { tx: 279, ty: 46, rot: 12, z: 20 },
];

export default function HeroFan() {
  const media = useSiteImages();
  const bg = media["home_hero_bg"];

  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white">
      {/* Background image (optional) */}
      {bg?.url && (
        <img
          src={bg.url}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/* Scrim: keeps the headline readable over any uploaded image */}
      <div
        className="absolute inset-0"
        style={{
          background: bg?.url
            ? "linear-gradient(180deg, rgba(10,10,10,0.82) 0%, rgba(10,10,10,0.68) 45%, rgba(10,10,10,0.94) 100%)"
            : "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 60%)",
        }}
      />

      <div className="container relative z-10 flex flex-col items-center pb-20 pt-24 md:pb-28 md:pt-28">
        <span className="inline-block rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
          Four devices. One standard.
        </span>

        <h1 className="mt-6 max-w-4xl text-center font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
          Pick Your Beri
        </h1>

        <p className="mt-5 max-w-lg text-center text-neutral-400">
          Crush, Cliq, Cirql and E-Liquid. Engineered for flavor that holds from
          the first pull to the last, and verified authentic on every unit.
        </p>

        {/* ── Fan (md and up) ────────────────────────────────────────── */}
        <div className="relative mt-14 hidden h-[420px] w-full max-w-[1300px] items-center justify-center md:flex">
          {PRODUCTS.map((product, i) => {
            const pos = FAN[i] ?? FAN[0];
            const entry = media[`${product.key}_hero_card`];
            return (
              <Link
                key={product.key}
                href={`/products/${product.key}`}
                className="fan-card group absolute h-[320px] w-[240px] overflow-hidden rounded-[24px] border-[1.5px] border-white/25 bg-neutral-900 shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
                style={{
                  ["--tx" as string]: `${pos.tx}px`,
                  ["--ty" as string]: `${pos.ty}px`,
                  ["--rot" as string]: `${pos.rot}deg`,
                  zIndex: pos.z,
                }}
                aria-label={product.name}
              >
                <CardMedia url={entry?.url} product={product.name} slot={`${product.key}_hero_card`} />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-5 pt-12">
                  <div className="font-display text-2xl font-bold tracking-wide">
                    {product.name}
                  </div>
                  <div className="mt-0.5 text-xs text-neutral-400">{product.tagline}</div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── Scrollable row (small screens) ─────────────────────────── */}
        <div className="-mx-5 mt-12 flex w-[calc(100%+2.5rem)] snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:hidden">
          {PRODUCTS.map((product) => {
            const entry = media[`${product.key}_hero_card`];
            return (
              <Link
                key={product.key}
                href={`/products/${product.key}`}
                className="relative h-[300px] w-[225px] shrink-0 snap-center overflow-hidden rounded-[24px] border-[1.5px] border-white/25 bg-neutral-900"
              >
                <CardMedia url={entry?.url} product={product.name} slot={`${product.key}_hero_card`} />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4 pt-10">
                  <div className="font-display text-xl font-bold tracking-wide">
                    {product.name}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/products/crush"
            className="press inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-200"
          >
            Explore The Line-Up <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/authenticate"
            className="press inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <ShieldCheck className="h-4 w-4" /> Verify Your Device
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Card media / placeholder ────────────────────────────────────────────── */

function CardMedia({
  url,
  product,
  slot,
}: {
  url?: string;
  product: string;
  slot: string;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt={product}
        className="h-full w-full object-cover"
        width={240}
        height={320}
        loading="eager"
      />
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-900 text-neutral-600">
      <ImageIcon className="h-7 w-7" strokeWidth={1.5} />
      <span className="font-mono text-[11px]">240 × 320</span>
      <span className="max-w-[170px] text-center font-mono text-[10px] text-neutral-700">
        {slot}
      </span>
    </div>
  );
}
