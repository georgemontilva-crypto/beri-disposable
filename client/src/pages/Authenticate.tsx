import { PublicLayout } from "@/components/PublicLayout";
import { useReveal } from "@/hooks/useReveal";
import { trpc } from "@/lib/trpc";
import { CONTACT_AUTHENTIC_EMAIL } from "@shared/const";
import {
  AlertTriangle,
  CheckCircle2,
  Eraser,
  Loader2,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

type Result = { valid: boolean; code: string } | null;

/**
 * Verification gets one accent of its own rather than borrowing a product's:
 * the page serves all four lines, so tying it to any single accent would imply
 * it only covers that one.
 */
const ACCENT = "#4ade80";

export default function Authenticate() {
  // Prefilled from ?code= so the homepage field can hand off here without the
  // visitor retyping what they already entered.
  const [code, setCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("code") ?? "";
  });
  const [result, setResult] = useState<Result>(null);
  const revealRef = useReveal<HTMLDivElement>();

  const verify = trpc.codes.verify.useMutation({
    onSuccess: (data) => setResult(data),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    setResult(null);
    verify.mutate({ code: trimmed });
  };

  const steps = [
    {
      icon: Eraser,
      title: "Scratch",
      desc: "Scratch the security label on your BERI product to reveal the code.",
    },
    {
      icon: ScanLine,
      title: "Enter",
      desc: "Enter the revealed code below exactly as it appears.",
    },
    {
      icon: ShieldCheck,
      title: "Verify",
      desc: "We'll check the code against our database and confirm the result.",
    },
  ];

  return (
    <PublicLayout>
      <div ref={revealRef}>
        {/* Calm and technical: a faint dot grid plus one soft pool of light
            behind the form, rather than product imagery or strong colour. */}
        <section
          className="tech-grid form-glow relative overflow-hidden"
          style={{ ["--form-glow" as string]: "74 222 128" }}
        >
          <div className="container py-16 md:py-20">
            <div className="reveal mx-auto max-w-2xl text-center">
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-950"
                style={{ backgroundColor: ACCENT }}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Product Authentication
              </span>
              <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Verify Your BERI
              </h1>
              <p className="mt-4 text-lg text-neutral-400">
                Enter the security code from your BERI product to verify its
                authenticity.
              </p>
            </div>

            {/* Steps */}
            <div className="reveal mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3" data-reveal-delay="80">
              {steps.map((s, i) => (
                <div key={s.title} className="glass relative rounded-2xl p-6">
                  <div className="absolute right-5 top-5 font-display text-3xl font-bold text-neutral-200">
                    {i + 1}
                  </div>
                  <div
                    className="inline-flex rounded-xl p-2.5 text-neutral-950"
                    style={{ backgroundColor: ACCENT }}
                  >
                    <s.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Verification form */}
            <div className="reveal mx-auto mt-10 max-w-xl" data-reveal-delay="140">
              <form onSubmit={onSubmit} className="glass rounded-[1.75rem] p-6 shadow-xl sm:p-8">
                <label htmlFor="code" className="text-sm font-semibold">
                  Enter your security code
                </label>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. 708839800535"
                    autoComplete="off"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 font-mono text-base text-white outline-none transition placeholder:text-neutral-400 focus:border-white/40 focus:ring-2 focus:ring-white/10"
                  />
                  <button
                    type="submit"
                    disabled={verify.isPending || !code.trim()}
                    className="press inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-neutral-950 transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: ACCENT }}
                  >
                    {verify.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Checking
                      </>
                    ) : (
                      "Verify"
                    )}
                  </button>
                </div>

                {/* Result */}
                {result && <ResultCard result={result} />}
              </form>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                Having trouble? Contact{" "}
                <a
                  href={`mailto:${CONTACT_AUTHENTIC_EMAIL}`}
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  {CONTACT_AUTHENTIC_EMAIL}
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

/**
 * The result is the whole point of the page, so both outcomes are written to be
 * acted on.
 *
 * A failure in particular never stops at "invalid": a code can fail because it
 * was mistyped, because the label was already scratched by someone else, or
 * because the product is counterfeit — and the visitor can't tell which. So it
 * lists what to try, in the order most likely to resolve it, before raising
 * the possibility of a fake.
 */
function ResultCard({ result }: { result: NonNullable<Result> }) {
  if (result.valid) {
    return (
      <div
        className="mt-6 flex items-start gap-4 rounded-2xl border p-5"
        style={{ borderColor: `${ACCENT}55`, backgroundColor: `${ACCENT}14` }}
      >
        <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0" style={{ color: ACCENT }} />
        <div>
          <div className="font-display text-lg font-bold" style={{ color: ACCENT }}>
            Authentic BERI Product
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-300">
            Code <span className="font-mono font-semibold text-white">{result.code}</span>{" "}
            matched our database. This is a genuine BERI product.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
      <div className="flex items-start gap-4">
        <AlertTriangle className="mt-0.5 h-7 w-7 shrink-0 text-amber-400" />
        <div>
          <div className="font-display text-lg font-bold text-amber-300">
            We couldn&apos;t verify this code
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-300">
            Code <span className="font-mono font-semibold text-white">{result.code}</span>{" "}
            wasn&apos;t found in our database. Before assuming the worst, try this:
          </p>

          <ul className="mt-4 space-y-2 text-sm text-neutral-300">
            <li className="flex gap-2">
              <span className="text-amber-400">1.</span>
              Check the code again, character by character. Zero and the letter O
              are easy to confuse, as are one and the letter I.
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400">2.</span>
              Make sure the whole label is scratched off, so no character is
              hidden.
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400">3.</span>
              If the code still doesn&apos;t work, send us a photo of the label
              and of the product, and we&apos;ll look into it.
            </li>
          </ul>

          <a
            href={`mailto:${CONTACT_AUTHENTIC_EMAIL}?subject=${encodeURIComponent(
              `Code verification: ${result.code}`
            )}`}
            className="press mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-200"
          >
            Contact us about this code
          </a>

          <p className="mt-4 text-xs leading-relaxed text-neutral-400">
            If you bought this product from an unauthorised seller, it may be
            counterfeit. Genuine BERI products are only sold through approved
            retailers.
          </p>
        </div>
      </div>
    </div>
  );
}
