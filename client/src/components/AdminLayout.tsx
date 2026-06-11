import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useAdminGuard } from "@/hooks/useAdminAuth";
import {
  BarChart3,
  Image as ImageIcon,
  KeyRound,
  Loader2,
  LogOut,
  Menu,
  ScrollText,
  Store,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: BarChart3 },
  { label: "Verify Codes", href: "/admin/codes", icon: KeyRound },
  { label: "Query Logs", href: "/admin/logs", icon: ScrollText },
  { label: "Wholesale Inquiries", href: "/admin/inquiries", icon: Store },
  { label: "Wholesale Users", href: "/admin/users", icon: Users },
  { label: "Site Images", href: "/admin/images", icon: ImageIcon },
];

export function AdminLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { admin, isLoading } = useAdminGuard();
  const [location, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const logout = trpc.adminAuth.logout.useMutation({
    onSuccess: async () => {
      await utils.adminAuth.me.invalidate();
      navigate("/admin/login");
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }
  if (!admin) return null;

  const isActive = (href: string) =>
    href === "/admin" ? location === "/admin" : location.startsWith(href);

  return (
    <div className="flex min-h-screen bg-neutral-100">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-neutral-950 text-neutral-300 transition-transform duration-300 md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href="/admin" className="font-display text-lg font-bold tracking-[0.2em] text-white">
            BERI ADMIN
          </Link>
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-white text-neutral-950"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 p-3">
          <div className="px-3.5 pb-2 text-xs text-neutral-500">{admin.email}</div>
          <button
            onClick={() => logout.mutate()}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Backdrop on mobile */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-neutral-200 bg-white px-5">
          <button className="md:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display text-xl font-bold tracking-tight">{title}</h1>
          <Link
            href="/"
            className="ml-auto text-sm font-medium text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
          >
            View site →
          </Link>
        </header>
        <div className="flex-1 p-5 md:p-8">{children}</div>
      </div>
    </div>
  );
}
