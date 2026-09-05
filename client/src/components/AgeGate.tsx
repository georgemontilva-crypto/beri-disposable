/**
 * 21+ age confirmation, shown before anything else on the public site.
 *
 * Blocking on purpose: this is a legal gate on a nicotine site, not a cookie
 * banner. It can't be dismissed by clicking away or pressing Escape, and the
 * page behind it doesn't scroll while it's open.
 *
 * The stored answer is read synchronously during the first render rather than
 * in an effect, so a returning visitor never sees the panel flash before it
 * decides to hide itself.
 */
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "beri_age_ok";
/** Re-ask after this long. A shared or public computer shouldn't stay unlocked. */
const REMEMBER_MS = 1000 * 60 * 60 * 24 * 30;

function alreadyVerified(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const at = Number(raw);
    // A corrupt or hand-edited value re-asks rather than silently unlocking.
    if (!Number.isFinite(at)) return false;
    const age = Date.now() - at;
    // Rejecting future timestamps too: the value sits in localStorage where
    // anyone can edit it, and a date far enough ahead would otherwise keep the
    // gate open forever.
    return age >= 0 && age < REMEMBER_MS;
  } catch {
    // Private mode can throw on access; asking again is the safe failure.
    return false;
  }
}

export default function AgeGate() {
  const [open, setOpen] = useState(() => !alreadyVerified());
  const [declined, setDeclined] = useState(false);

  // The page behind must not scroll while the gate is up, or the visitor can
  // read the whole site around it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const confirm = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // Storage unavailable: let them through for this visit and ask again next
      // time, rather than trapping them behind a gate that can't be satisfied.
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-5"
    >
      <div className="absolute inset-0 bg-black/92 backdrop-blur-xl" />

      <div className="relative w-full max-w-md rounded-[2rem] border border-white/15 bg-neutral-900 p-8 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
        <div className="mx-auto mb-5 inline-flex rounded-2xl bg-white/10 p-3">
          <ShieldCheck className="h-7 w-7 text-white" />
        </div>

        {declined ? (
          <>
            <h2 id="age-gate-title" className="font-display text-3xl font-bold text-white">
              Come back later
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
              You must be 21 or older to view this site. Thanks for stopping by.
            </p>
            <button
              type="button"
              onClick={() => setDeclined(false)}
              className="press mt-7 text-sm font-semibold text-neutral-400 underline underline-offset-4 hover:text-white"
            >
              Go back
            </button>
          </>
        ) : (
          <>
            <h2 id="age-gate-title" className="font-display text-3xl font-bold text-white">
              Are you 21 or older?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
              This site contains nicotine products and is intended for adults of
              legal smoking age only.
            </p>

            <div className="mt-7 flex flex-col gap-3">
              <button
                type="button"
                onClick={confirm}
                autoFocus
                className="press w-full rounded-full bg-white px-6 py-3.5 text-sm font-bold text-neutral-950 transition-colors hover:bg-neutral-200"
              >
                Yes, I am 21 or older
              </button>
              <button
                type="button"
                onClick={() => setDeclined(true)}
                className="press w-full rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                No, I am under 21
              </button>
            </div>

            <p className="mt-6 text-[11px] leading-relaxed text-neutral-500">
              WARNING: This product contains nicotine. Nicotine is an addictive
              chemical.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
