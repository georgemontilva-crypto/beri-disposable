import { CONTACT_AUTHENTIC_EMAIL, CONTACT_WHOLESALE_EMAIL } from "@shared/const";
import { Mail } from "lucide-react";
import { useSiteImages } from "@/hooks/useSiteImages";
import { Link } from "wouter";
import { NicotineWarning } from "./NicotineWarning";

export function SiteFooter() {
  const media = useSiteImages();
  const logo = media["site_logo_footer"]?.url;

  const year = new Date().getFullYear();
  return (
    /*
      `relative z-10` matters as much as the gradient here: the ambient glow and
      vapour are fixed layers at z-0, and a footer with no stacking context of
      its own paints underneath them — which is why the green wash was showing
      straight through a supposedly solid background.
    */
    /*
      `relative z-10` matters as much as the colour: the ambient glow and vapour
      are fixed layers at z-0, and a footer with no stacking context of its own
      paints underneath them, letting the glow wash straight through.
    */
    <footer className="relative z-10 bg-black text-neutral-300">
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
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-400">
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

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-neutral-500 sm:flex-row">
          <span>© {year} Beri Disposable. All rights reserved.</span>
          <span>For adult use only. 21+</span>
        </div>
      </div>
    </footer>
  );
}
