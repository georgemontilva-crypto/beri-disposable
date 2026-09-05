import { CONTACT_AUTHENTIC_EMAIL, CONTACT_WHOLESALE_EMAIL } from "@shared/const";
import { Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSiteImages } from "@/hooks/useSiteImages";
import { Link } from "wouter";
import { NicotineWarning } from "./NicotineWarning";

export function SiteFooter() {
  const media = useSiteImages();
  const logo = media["site_logo_footer"]?.url;

  const year = new Date().getFullYear();
  return (
    /*
      `relative z-10` matters as much as the colour: the ambient glow and vapour
      are fixed layers at z-0, and a footer with no stacking context of its own
      paints underneath them, letting the glow wash straight through.
    */
    <footer className="relative z-10 bg-black text-neutral-300">
      <FooterNewsletter />
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            {logo ? (
              <img
                src={logo}
                alt="Beri Disposable"
                className="h-14 w-auto object-contain"
                width={280}
                height={56}
              />
            ) : (
              <div className="font-display text-2xl font-bold tracking-[0.25em] text-white">
                BERI DISPOSABLE
              </div>
            )}
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-300">
              Premium disposable and pod systems. Verify the authenticity of your
              genuine BERI product and explore the full lineup.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              Explore
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/" className="text-neutral-400 transition-colors hover:text-white">Home</Link></li>
              <li><Link href="/products/crush" className="text-neutral-400 transition-colors hover:text-white">Beri Crush</Link></li>
              <li><Link href="/products/cliq" className="text-neutral-400 transition-colors hover:text-white">Beri Cliq</Link></li>
              <li><Link href="/products/cirql" className="text-neutral-400 transition-colors hover:text-white">Beri Cirql</Link></li>
              <li><Link href="/products/eliquid" className="text-neutral-400 transition-colors hover:text-white">Beri E-Liquid</Link></li>
              <li><Link href="/authenticate" className="text-neutral-400 transition-colors hover:text-white">Authenticate</Link></li>
              <li><Link href="/wholesale" className="text-neutral-400 transition-colors hover:text-white">Wholesale</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${CONTACT_AUTHENTIC_EMAIL}`}
                  className="flex items-center gap-2 text-neutral-400 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4" />
                  {CONTACT_AUTHENTIC_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_WHOLESALE_EMAIL}`}
                  className="flex items-center gap-2 text-neutral-400 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4" />
                  {CONTACT_WHOLESALE_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <NicotineWarning variant="footer" />
        </div>

        <div className="rainbow-edge-top mt-8 flex flex-col items-center justify-between gap-4 pt-6 text-xs text-neutral-400 sm:flex-row">
          <span>© {year} Beri Disposable. All rights reserved.</span>
          <span>For adult use only. 21+</span>
        </div>
      </div>
    </footer>
  );
}


/* ─── Newsletter ───────────────────────────────────────────────────────────
   In the footer rather than as its own section: it is one input, and giving it
   a full screen of the homepage cost more attention than it returns. */
function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      setDone(true);
      setEmail("");
    },
    onError: (e) => toast.error(e.message || "Could not subscribe"),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    subscribe.mutate({ email: trimmed });
  };

  return (
    <div className="rainbow-edge">
      <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">
            Get the drop first
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            New drops, limited editions and restocks, straight to your inbox.
          </p>
        </div>

        {done ? (
          <p className="text-sm font-semibold text-emerald-400">
            You&apos;re on the list.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="flex w-full max-w-md gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              aria-label="Email address"
              className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-white/40"
            />
            <button
              type="submit"
              disabled={subscribe.isPending}
              className="press inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-200 disabled:opacity-60"
            >
              {subscribe.isPending ? "…" : "Subscribe"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
