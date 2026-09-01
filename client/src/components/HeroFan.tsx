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
import { useBooleanSetting } from "@/hooks/useSiteSettings";
import { PRODUCTS } from "@/lib/products";
import { ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
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
  const showCards = useBooleanSetting("home_hero_cards", true);

  const bg = media["home_hero_bg"];
  const videoDesktop = media["home_hero_video"]?.url;
  const videoMobile = media["home_hero_video_mobile"]?.url;

  // Pick the cut in JS rather than with <source media="...">: browsers only
  // evaluate those once, so a resize or an orientation change would keep the
  // wrong file. Phones also shouldn't download the desktop cut at all.
  const [isPhone, setIsPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const videoUrl = (isPhone ? videoMobile : videoDesktop) ?? videoDesktop ?? videoMobile;
  const [videoReady, setVideoReady] = useState(false);

  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white">
      {/* Still background: paints immediately, and stays as the fallback for
          devices that block autoplay or fail to load the video. */}
      {bg?.url && (
        <img
          src={bg.url}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* Looping background animation. role="img" with no controls: it is
          decoration, not media the visitor is meant to operate. */}
      {videoUrl && (
        <video
          key={videoUrl}
          src={videoUrl}
          poster={bg?.url}
          autoPlay
          muted
          playsInline
          preload="auto"
          role="img"
          aria-hidden="true"
          tabIndex={-1}
          onCanPlay={() => setVideoReady(true)}
          onEnded={(e) => {
            // Hold the closing frame. Without pinning currentTime just short of
            // the end, some browsers rewind to zero on 'ended' and flash the
            // first frame before pausing.
            const v = e.currentTarget;
            v.pause();
            if (Number.isFinite(v.duration)) {
              v.currentTime = Math.max(0, v.duration - 0.05);
            }
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      {/* No scrim over video: the animation is the hero, and any wash on top
          would mute the colours it was graded for. The still-image case keeps a
          light vignette so the cards don't sit on a flat photo. */}
      {!videoUrl && (
        <div
          className="absolute inset-0"
          style={{
            background: bg?.url
              ? "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.2) 45%, rgba(10,10,10,0.8) 100%)"
              : "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 60%)",
          }}
        />
      )}

      <div
        className={`container relative z-10 flex flex-col items-center ${
          showCards ? "justify-end pb-16" : "justify-center"
        }`}
        style={{
          // The header overlays the hero, so reserve its height at the top:
          // the video runs behind the glass but the cards must not.
          paddingTop: "var(--header-h, 96px)",
          // Full viewport height. dvh rather than vh so mobile browsers measure
          // the visible area instead of the taller layout viewport, which on
          // iOS Safari would push the bottom of the hero under the URL bar.
          minHeight: "100dvh",
        }}
      >
        {/*
          The video carries the message, so the headline is visually removed but
          kept for assistive tech and search engines — a page with no h1 at all
          reads as untitled to both.
        */}
        <h1 className="sr-only">Beri Disposable — Crush, Cliq, Cirql and E-Liquid</h1>

        {/* ── Fan (md and up) ────────────────────────────────────────── */}
        {showCards && (
        <div className="relative hidden h-[420px] w-full max-w-[1300px] items-center justify-center md:flex">
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
        )}

        {/* ── Scrollable row (small screens) ─────────────────────────── */}
        {showCards && (
        <div className="-mx-5 flex w-[calc(100%+2.5rem)] snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:hidden">
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
        )}

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
