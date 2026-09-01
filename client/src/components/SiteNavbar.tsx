import { cn } from "@/lib/utils";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSiteImages } from "@/hooks/useSiteImages";
import { Link, useLocation } from "wouter";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Authenticate", href: "/authenticate" },
  { label: "Wholesale", href: "/wholesale" },
];

const PRODUCT_LINKS = [
  { label: "Beri Crush", href: "/products/crush" },
  { label: "Beri Cliq", href: "/products/cliq" },
  { label: "Beri Cirql", href: "/products/cirql" },
  { label: "Beri E-Liquid", href: "/products/eliquid" },
];

export function SiteNavbar() {
  const media = useSiteImages();
  const logo = media["site_logo_header"]?.url;

  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProductsOpen(false);
  }, [location]);

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);
  const productActive = location.startsWith("/products");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 glass-nav transition-all duration-300",
        scrolled && "glass-nav-scrolled"
      )}
      style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
    >
      <nav className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="Beri Disposable, home">
          {logo ? (
            // Height-constrained, width auto: a logo is delivered at whatever
            // aspect its lettering needs, and forcing a box would distort it.
            <img
              src={logo}
              alt="Beri"
              className="h-8 w-auto object-contain"
              width={160}
              height={32}
            />
          ) : (
            <span className="font-display text-xl font-bold tracking-[0.2em] text-foreground">
              BERI
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          <NavItem href="/" active={isActive("/")}>
            Home
          </NavItem>

          {/* Products dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <button
              className={cn(
                "flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                productActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setProductsOpen((v) => !v)}
            >
              Products
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform duration-200", productsOpen && "rotate-180")}
              />
            </button>
            <div
              className={cn(
                "absolute left-0 top-full w-48 origin-top pt-2 transition-all duration-200",
                productsOpen
                  ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-y-1 scale-95 opacity-0"
              )}
              style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
            >
              <div className="glass-panel overflow-hidden rounded-2xl p-1.5">
                {PRODUCT_LINKS.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="block rounded-xl px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <NavItem href="/authenticate" active={isActive("/authenticate")}>
            Authenticate
          </NavItem>
          <NavItem href="/wholesale" active={isActive("/wholesale")}>
            Wholesale
          </NavItem>

          <Link
            href="/authenticate"
            className="press ml-3 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
          >
            Verify Code
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="press rounded-full p-2 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={cn(
          "overflow-hidden md:hidden transition-all duration-300",
          mobileOpen ? "max-h-[26rem]" : "max-h-0"
        )}
        style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
      >
        <div className="glass-panel container space-y-1 py-4">
          {NAV_LINKS.slice(0, 1).map((l) => (
            <MobileLink key={l.href} href={l.href} active={isActive(l.href)}>
              {l.label}
            </MobileLink>
          ))}
          <div className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Products
          </div>
          {PRODUCT_LINKS.map((p) => (
            <MobileLink key={p.href} href={p.href} active={isActive(p.href)}>
              {p.label}
            </MobileLink>
          ))}
          <MobileLink href="/authenticate" active={isActive("/authenticate")}>
            Authenticate
          </MobileLink>
          <MobileLink href="/wholesale" active={isActive("/wholesale")}>
            Wholesale
          </MobileLink>
        </div>
      </div>
    </header>
  );
}

function NavItem({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative rounded-full px-4 py-2 text-sm font-semibold transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
      <span
        className={cn(
          "absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-foreground transition-transform duration-300",
          active ? "scale-x-100" : "scale-x-0"
        )}
        style={{ transformOrigin: "left", transitionTimingFunction: "var(--ease-out-expo)" }}
      />
    </Link>
  );
}

function MobileLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-xl px-4 py-2.5 text-base font-medium transition-colors",
        active ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:bg-foreground/5"
      )}
    >
      {children}
    </Link>
  );
}
