import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import {
  Image as ImageIcon,
  KeyRound,
  ScrollText,
  Store,
  Users,
} from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const stats = trpc.adminAuth.dashboardStats.useQuery(undefined, { retry: false });

  const cards = [
    { label: "Verify Codes", value: stats.data?.codes, icon: KeyRound, href: "/admin/codes" },
    { label: "Verifications Logged", value: stats.data?.logs, icon: ScrollText, href: "/admin/logs" },
    { label: "Wholesale Inquiries", value: stats.data?.inquiries, icon: Store, href: "/admin/inquiries", sub: stats.data?.pendingInquiries ? `${stats.data.pendingInquiries} pending` : undefined },
    { label: "Wholesale Users", value: stats.data?.users, icon: Users, href: "/admin/users" },
    { label: "Site Images", value: stats.data?.images, icon: ImageIcon, href: "/admin/images" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href}>
            <div className="group rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div className="inline-flex rounded-xl bg-neutral-950 p-2.5 text-white">
                  <c.icon className="h-5 w-5" />
                </div>
                <span className="text-3xl font-bold tabular-nums">
                  {c.value ?? "—"}
                </span>
              </div>
              <div className="mt-4 text-sm font-medium text-neutral-600 group-hover:text-neutral-900">
                {c.label}
              </div>
              {c.sub ? (
                <div className="mt-1 text-xs font-medium text-amber-600">{c.sub}</div>
              ) : null}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold">Quick actions</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your authentication codes, review wholesale applications, and upload
          site imagery served from your storage.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/codes"
            className="press rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Import codes
          </Link>
          <Link
            href="/admin/inquiries"
            className="press rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold"
          >
            Review inquiries
          </Link>
          <Link
            href="/admin/images"
            className="press rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold"
          >
            Upload images
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
