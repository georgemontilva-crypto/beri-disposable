import AuroraGlow from "@/components/AuroraGlow";
import HeroFan from "@/components/HeroFan";
import ProductPanels from "@/components/ProductPanels";
import { PublicLayout } from "@/components/PublicLayout";
import SmokeVapor from "@/components/SmokeVapor";
import { useReveal } from "@/hooks/useReveal";
import { useSiteImages } from "@/hooks/useSiteImages";
import { ArrowRight, ShieldCheck, Store } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

/**
 * Two screens and a strip. Nothing appears twice: the products live in the
 * panels, verification and wholesale get one band each, and the newsletter
 * moves to the footer rather than taking a whole screen for a single input.
 */
export default function Home() {
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <PublicLayout overlayHeader>
      <AuroraGlow />
      <SmokeVapor />
      <div ref={revealRef} className="relative z-10">
        <HeroFan />
        <ProductPanels />
        <ActionStrip />
      </div>
    </PublicLayout>
  );
}

/* ─── Verification + wholesale ─────────────────────────────────────────────
   Side by side rather than stacked: they speak to two different visitors, and
   one row makes that a choice instead of a sequence. */
function ActionStrip() {
  const media = useSiteImages();
  const bg = media["home_action_bg"]?.url;

  const sectionRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  /**
   * Parallax on the banner: the layer is taller than the band and slides
   * within it as the section crosses the viewport.
   *
   * The travel is driven by a scroll listener coalesced into one rAF rather
   * than `background-attachment: fixed`, which mobile browsers either ignore or
   * repaint badly, and it stops entirely while the section is off screen.
   */
  useEffect(() => {
    if (!bg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const section = sectionRef.current;
    const layer = layerRef.current;
    if (!section || !layer) return;

    let frame = 0;
    let inView = false;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      // -1 just below the fold, +1 just above it, 0 as the band passes the
      // middle of the screen — so the neutral position is the one on show.
      const progress =
        (rect.top + rect.height / 2 - window.innerHeight / 2) /
        (window.innerHeight / 2 + rect.height / 2);
      // Stays inside the 15% of extra height the layer has above and below.
      layer.style.transform = `translate3d(0, ${(progress * 12).toFixed(2)}%, 0)`;
    };

    const onScroll = () => {
      if (inView && !frame) frame = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        if (inView) update();
      },
      { rootMargin: "15% 0px" }
    );
    io.observe(section);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [bg]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-white/10 bg-black"
    >
      {bg && (
        <>
          {/*
            Scaled to the band's height at its own aspect ratio and repeated
            across, rather than stretched or cropped.

            Cropping (object-cover) on a portrait asset scaled it to the width,
            overflowed the height and left only the middle stripe visible —
            the part of a top-to-bottom gradient with no colour in it.
            Stretching fixed that but smeared the pattern sideways. Repeating
            does neither: proportions are untouched, the full gradient always
            reaches both edges, and because the colour bands run horizontally
            they line up across every repeat, so the joins don't read as seams.
          */}
          <div
            ref={layerRef}
            aria-hidden="true"
            // Taller than the band on both sides: the layer has to overhang or
            // its edges appear as it travels.
            className="absolute -inset-y-[15%] inset-x-0 will-change-transform"
            style={{
              backgroundImage: `url(${bg})`,
              backgroundSize: "auto 100%",
              backgroundRepeat: "repeat-x",
              backgroundPosition: "center",
            }}
          />
          {/*
            Two layers rather than one: a flat wash strong enough to carry body
            text would bury the image, while a wash plus a left-to-right ramp
            keeps the picture readable on the right of each column and dense
            under the copy on the left, where the words actually sit.

            The vertical wash is lightest at the top, where nothing but the
            eyebrow sits, so the pattern is visible as the band opens and only
            closes in under the headings and buttons below.
          */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/50 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-black/60" />
        </>
      )}

      <div className="container relative grid min-h-[420px] md:grid-cols-2">
        <VerifyBand />
        <WholesaleBand />
      </div>
    </section>
  );
}

function VerifyBand() {
  const [code, setCode] = useState("");
  const [, navigate] = useLocation();

  /**
   * The field lives here but the result does not: a code check has several
   * outcomes (genuine, already claimed, not found) that each need explaining,
   * so this hands off to /authenticate with the code prefilled and lets that
   * page do the work.
   */
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error("Enter the code from your device label.");
      return;
    }
    navigate(`/authenticate?code=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="reveal flex flex-col justify-center px-6 py-16 md:px-12">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
        <ShieldCheck className="h-4 w-4" /> Authenticity
      </div>
      <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Verify Your Beri
      </h2>
      <p className="mt-3 max-w-sm text-sm text-neutral-400">
        Scratch the authentication label to reveal your security code, then
        enter it below.
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex max-w-sm gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Security code"
          aria-label="Security code"
          className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 font-mono text-white outline-none transition placeholder:text-neutral-500 focus:border-white/40"
        />
        <button
          type="submit"
          className="press shrink-0 rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-200"
        >
          Verify
        </button>
      </form>
    </div>
  );
}

function WholesaleBand() {
  return (
    <div className="reveal flex flex-col justify-center border-white/20 px-6 py-16 md:border-l md:px-12">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
        <Store className="h-4 w-4" /> Wholesale partners
      </div>
      <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Carry Beri
      </h2>
      <p className="mt-3 max-w-sm text-sm text-neutral-400">
        5-unit displays, 20-display master cases, and full flavor assortments
        across all four BERI product lines.
      </p>
      <Link
        href="/wholesale"
        className="press mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
      >
        Apply For Wholesale <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
