import { useLayoutEffect, useRef } from "react";
import CursorGlow from "./CursorGlow";
import { NicotineWarning } from "./NicotineWarning";
import { SiteFooter } from "./SiteFooter";
import { SiteNavbar } from "./SiteNavbar";

/**
 * The header is fixed and overlays the page, so the frosted bar has real
 * content moving behind it instead of a flat background. Its height is
 * published as --header-h: `main` uses it as top padding, and a hero that wants
 * to run underneath cancels it with a negative margin.
 *
 * The height is measured rather than hard-coded because the warning bar wraps
 * to two lines on narrow screens.
 */
export function PublicLayout({
  children,
  /** Let the first section slide under the header (used by the video hero). */
  overlayHeader = false,
}: {
  children: React.ReactNode;
  overlayHeader?: boolean;
}) {
  const headerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const measure = () =>
      document.documentElement.style.setProperty(
        "--header-h",
        `${el.offsetHeight}px`
      );
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    // `dark` flips the theme variables, so every text-foreground /
    // text-muted-foreground / bg-card on the public pages inverts at once
    // instead of needing a per-class rewrite.
    <div className="dark flex min-h-screen flex-col bg-neutral-900 text-foreground">
      {/* Ambient layer, shared by every public page */}
      <CursorGlow />

      <div ref={headerRef} className="fixed inset-x-0 top-0 z-50">
        {/* Legal nicotine warning, kept visible above the nav */}
        <NicotineWarning variant="bar" />
        <SiteNavbar />
      </div>

      <main
        className="flex-1"
        style={{ paddingTop: overlayHeader ? 0 : "var(--header-h, 96px)" }}
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
