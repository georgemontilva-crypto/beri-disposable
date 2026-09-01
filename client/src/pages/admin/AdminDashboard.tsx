import { AdminLayout } from "@/components/AdminLayout";
import { PRODUCTS } from "@/lib/products";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  ScrollText,
  Mail,
  Store,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "wouter";

/**
 * Every media slot the public site reads, grouped the way the admin thinks
 * about the site. Derived from PRODUCTS so it stays in sync with AdminImages.
 */
function mediaGroups(): { section: string; slots: string[] }[] {
  const groups: { section: string; slots: string[] }[] = [
    { section: "Home", slots: ["home_hero_bg"] },
    { section: "Other pages", slots: ["authenticate_banner", "wholesale_banner"] },
  ];
  for (const p of PRODUCTS) {
    groups.push({
      section: p.name,
      slots: [
        `${p.key}_hero_card`,
        p.heroSlot,
        p.modelSlot,
        `${p.key}_banner`,
        ...p.specSlots.map((s) => s.slot),
        ...p.flavors.map((f) => f.slot),
      ],
    });
  }
  return groups;
}

function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "";
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminDashboard() {
  const overview = trpc.adminAuth.dashboardOverview.useQuery(undefined, { retry: false });
  const data = overview.data;

  const groups = useMemo(mediaGroups, []);
  const filled = useMemo(() => new Set(data?.filledSlots ?? []), [data?.filledSlots]);

  const totalSlots = groups.reduce((n, g) => n + g.slots.length, 0);
  const totalFilled = groups.reduce(
    (n, g) => n + g.slots.filter((s) => filled.has(s)).length,
    0
  );

  const cards = [
    { label: "Verify Codes", value: data?.counts.codes, icon: KeyRound, href: "/admin/codes" },
    {
      label: "Verifications",
      value: data?.counts.logs,
      icon: ScrollText,
      href: "/admin/logs",
      sub: data ? `${data.counts.validLogs} genuine` : undefined,
    },
    {
      label: "Wholesale Inquiries",
      value: data?.counts.inquiries,
      icon: Store,
      href: "/admin/inquiries",
      sub: data?.counts.pendingInquiries
        ? `${data.counts.pendingInquiries} awaiting review`
        : undefined,
      alert: !!data?.counts.pendingInquiries,
    },
    { label: "Wholesale Users", value: data?.counts.users, icon: Users, href: "/admin/users" },
    {
      label: "Newsletter",
      value: data?.counts.subscribers,
      icon: Mail,
      href: "/admin/subscribers",
      sub: "Homepage sign-ups",
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      {data && !data.storage.configured && (
        <div className="mb-6 flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm text-amber-900">
            <strong>Media storage is not connected.</strong> Uploads will fail until
            these variables are set on the server:{" "}
            <code className="font-mono text-xs">{data.storage.missing.join(", ")}</code>
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Link key={c.href} href={c.href}>
            <div className="group h-full rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div className="inline-flex rounded-xl bg-neutral-950 p-2.5 text-white">
                  <c.icon className="h-5 w-5" />
                </div>
                <span className="text-3xl font-bold tabular-nums">{c.value ?? "—"}</span>
              </div>
              <div className="mt-4 text-sm font-medium text-neutral-600 group-hover:text-neutral-900">
                {c.label}
              </div>
              {c.sub && (
                <div
                  className={`mt-1 text-xs font-medium ${
                    c.alert ? "text-amber-600" : "text-neutral-400"
                  }`}
                >
                  {c.sub}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Site media</h2>
              <p className="mt-0.5 text-sm text-neutral-500">
                Empty slots render placeholders on the public site.
              </p>
            </div>
            <Link
              href="/admin/images"
              className="press shrink-0 rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white"
            >
              Upload
            </Link>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-neutral-900 transition-all duration-500"
                style={{ width: totalSlots ? `${(totalFilled / totalSlots) * 100}%` : "0%" }}
              />
            </div>
            <span className="text-sm font-semibold tabular-nums text-neutral-600">
              {totalFilled} / {totalSlots}
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {groups.map((g) => {
              const done = g.slots.filter((s) => filled.has(s)).length;
              const complete = done === g.slots.length;
              return (
                <div key={g.section} className="flex items-center gap-3">
                  {complete ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <span className="h-4 w-4 shrink-0 rounded-full border-2 border-neutral-200" />
                  )}
                  <span className="w-32 shrink-0 truncate text-sm font-medium">{g.section}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        complete ? "bg-emerald-500" : "bg-neutral-400"
                      }`}
                      style={{ width: `${(done / g.slots.length) * 100}%` }}
                    />
                  </div>
                  <span className="w-14 shrink-0 text-right text-xs tabular-nums text-neutral-500">
                    {done}/{g.slots.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Latest checks</h2>
            <Link
              href="/admin/logs"
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {data?.recentLogs.length ? (
              data.recentLogs.map((l) => (
                <div key={l.id} className="flex items-center gap-3">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      l.result === "valid" ? "bg-emerald-500" : "bg-red-400"
                    }`}
                  />
                  <span className="flex-1 truncate font-mono text-xs">{l.code}</span>
                  <span className="shrink-0 text-xs text-neutral-400">
                    {timeAgo(l.createdAt)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-400">No verifications yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent wholesale inquiries</h2>
          <Link
            href="/admin/inquiries"
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-900"
          >
            View all
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {data?.recentInquiries.length ? (
            data.recentInquiries.map((i) => (
              <div
                key={i.id}
                className="flex items-center gap-3 rounded-xl border border-neutral-100 px-4 py-3"
              >
                <span className="flex-1 truncate text-sm font-medium">{i.name}</span>
                <span className="hidden flex-1 truncate text-sm text-neutral-500 sm:block">
                  {i.company || "—"}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${
                    i.status === "pending"
                      ? "bg-amber-100 text-amber-800"
                      : i.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {i.status}
                </span>
                <span className="hidden w-16 shrink-0 text-right text-xs text-neutral-400 sm:block">
                  {timeAgo(i.createdAt)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-400">No inquiries yet.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
