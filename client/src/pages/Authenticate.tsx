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

export default function Authenticate() {
  const [code, setCode] = useState("");
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
    { icon: Eraser, title: "Scratch", desc: "Gently scratch off the security label on your BERI product to reveal the secret code." },
    { icon: ScanLine, title: "Scan / Enter", desc: "Type the revealed code into the field below exactly as it appears." },
    { icon: ShieldCheck, title: "Certify", desc: "We instantly check it against our database to confirm authenticity." },
  ];

  return (
    <PublicLayout>
      <div ref={revealRef}>
        <section className="relative overflow-hidden noise-bg-dark">
          <div className="container py-16 md:py-20">
            <div className="reveal mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-300 backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5" />
                Product Authentication
              </span>
              <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Verify your genuine BERI
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Protect yourself from counterfeits. Enter the secret code from your
                product to confirm it's 100% authentic.
              </p>
            </div>

            {/* Steps */}
            <div className="reveal mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3" data-reveal-delay="80">
              {steps.map((s, i) => (
                <div key={s.title} className="glass relative rounded-2xl p-6">
                  <div className="absolute right-5 top-5 font-display text-3xl font-bold text-neutral-200">
                    {i + 1}
                  </div>
                  <div className="inline-flex rounded-xl bg-foreground p-2.5 text-background">
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
                  Enter your secret code
                </label>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. 708839800535"
                    autoComplete="off"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 font-mono text-base text-white outline-none transition placeholder:text-neutral-500 focus:border-white/40 focus:ring-2 focus:ring-white/10"
                  />
                  <button
                    type="submit"
                    disabled={verify.isPending || !code.trim()}
                    className="press inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-foreground px-7 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
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

function ResultCard({ result }: { result: NonNullable<Result> }) {
  if (result.valid) {
    return (
      <div className="mt-6 flex items-start gap-4 rounded-2xl border border-neutral-900 bg-neutral-950 p-5 text-white">
        <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0" />
        <div>
          <div className="font-display text-lg font-bold">Authentic Product</div>
          <p className="mt-1 text-sm text-neutral-300">
            Code <span className="font-mono font-semibold text-white">{result.code}</span> is
            valid. Your BERI product is 100% genuine. Enjoy with confidence.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-6 flex items-start gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
      <AlertTriangle className="mt-0.5 h-7 w-7 shrink-0 text-destructive" />
      <div>
        <div className="font-display text-lg font-bold text-destructive">Code Not Found</div>
        <p className="mt-1 text-sm text-muted-foreground">
          The code <span className="font-mono font-semibold">{result.code}</span> was not found
          in our database. This may indicate a counterfeit product. Please contact{" "}
          <a href={`mailto:${CONTACT_AUTHENTIC_EMAIL}`} className="font-medium text-foreground underline underline-offset-2">
            {CONTACT_AUTHENTIC_EMAIL}
          </a>{" "}
          and double-check the code.
        </p>
      </div>
    </div>
  );
}
