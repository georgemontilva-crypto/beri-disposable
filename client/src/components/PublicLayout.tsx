import { NicotineWarning } from "./NicotineWarning";
import { SiteFooter } from "./SiteFooter";
import { SiteNavbar } from "./SiteNavbar";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950">
      {/* Legal nicotine warning in the header (top bar) */}
      <NicotineWarning variant="bar" />
      <SiteNavbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
