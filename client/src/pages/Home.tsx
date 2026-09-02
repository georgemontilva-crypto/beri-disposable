import AuroraGlow from "@/components/AuroraGlow";
import HeroFan from "@/components/HeroFan";
import ProductPanels from "@/components/ProductPanels";
import { PublicLayout } from "@/components/PublicLayout";
import SmokeVapor from "@/components/SmokeVapor";
import { useReveal } from "@/hooks/useReveal";
import { ArrowRight, ShieldCheck, Store } from "lucide-react";
import { useState } from "react";
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
  return (
    <section className="border-t border-white/10 bg-black">
      <div className="container grid md:grid-cols-2">
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
        Is Your Beri Real?
      </h2>
      <p className="mt-3 max-w-sm text-sm text-neutral-400">
        Scratch the label and enter the code. Every genuine device carries one.
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
    <div className="reveal flex flex-col justify-center border-white/10 px-6 py-16 md:border-l md:px-12">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
        <Store className="h-4 w-4" /> For retailers
      </div>
      <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Carry Beri
      </h2>
      <p className="mt-3 max-w-sm text-sm text-neutral-400">
        Displays of 5, master cases of 20, and full flavor coverage across all
        four lines.
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
