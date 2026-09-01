import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Download } from "lucide-react";

export default function AdminSubscribers() {
  const { data, isLoading } = trpc.newsletter.adminList.useQuery({ limit: 500 });

  /** Exports what is on screen. Quotes every field so commas in an address
      can't shift the columns. */
  const exportCsv = () => {
    const rows = data?.rows ?? [];
    const csv = [
      "email,source,date",
      ...rows.map((r) =>
        [r.email, r.source ?? "", new Date(r.createdAt).toISOString()]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `beri-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Newsletter Subscribers">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold">
              {data?.total ?? 0} subscriber{data?.total === 1 ? "" : "s"}
            </h2>
            <p className="mt-0.5 text-sm text-neutral-500">
              Sign-ups from the homepage form.
            </p>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!data?.rows.length}
            className="press inline-flex shrink-0 items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wider text-neutral-400">
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Source</th>
                <th className="pb-3 text-right font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={3} className="py-6 text-neutral-400">
                    Loading…
                  </td>
                </tr>
              )}
              {!isLoading && !data?.rows.length && (
                <tr>
                  <td colSpan={3} className="py-6 text-neutral-400">
                    No sign-ups yet.
                  </td>
                </tr>
              )}
              {data?.rows.map((r) => (
                <tr key={r.id} className="border-b border-neutral-100">
                  <td className="py-3 font-medium">{r.email}</td>
                  <td className="py-3 text-neutral-500">{r.source}</td>
                  <td className="py-3 text-right text-neutral-500">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
