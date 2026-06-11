import { AdminLayout } from "@/components/AdminLayout";
import { Pagination, TableCard } from "@/components/admin/AdminTable";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Check, Download, Loader2, Search, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminInquiries() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const utils = trpc.useUtils();

  const list = trpc.wholesale.adminListInquiries.useQuery(
    { search: query || undefined, status, page, pageSize: 50 },
    { retry: false }
  );

  const approve = trpc.wholesale.adminApproveInquiry.useMutation({
    onSuccess: (r) => {
      utils.wholesale.adminListInquiries.invalidate();
      if (r.emailSent) {
        toast.success("Approved — registration email sent");
      } else {
        toast.success("Approved", {
          description:
            "Email not sent (configure email provider for production). Registration link copied to clipboard.",
        });
        navigator.clipboard?.writeText(r.registrationUrl).catch(() => {});
      }
    },
    onError: () => toast.error("Could not approve"),
  });

  const reject = trpc.wholesale.adminRejectInquiry.useMutation({
    onSuccess: () => {
      utils.wholesale.adminListInquiries.invalidate();
      toast.success("Inquiry rejected");
    },
  });

  // adminExportInquiries is a query; fetch on demand:
  const handleExport = async () => {
    try {
      const data = await utils.wholesale.adminExportInquiries.fetch();
      const blob = new Blob([data.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `beri-wholesale-inquiries-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed");
    }
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <AdminLayout title="Wholesale Inquiries">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form onSubmit={onSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name / company / email…"
              className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-neutral-900"
            />
          </div>
          <button className="press rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white">
            Search
          </button>
        </form>
        <button
          onClick={handleExport}
          className="press inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={cn(
              "press rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              status === s
                ? "bg-neutral-950 text-white"
                : "border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <TableCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-5 py-3 font-semibold">ID</th>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Company</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Phone</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Created</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {list.isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-neutral-400">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : list.data && list.data.rows.length > 0 ? (
                list.data.rows.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50">
                    <td className="px-5 py-3 text-neutral-500">{r.id}</td>
                    <td className="px-5 py-3 font-medium">{r.name}</td>
                    <td className="px-5 py-3 text-neutral-600">{r.company ?? "—"}</td>
                    <td className="px-5 py-3 text-neutral-600">{r.email}</td>
                    <td className="px-5 py-3 text-neutral-600">{r.phone ?? "—"}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-neutral-500">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3">
                      {r.status === "pending" ? (
                        <div className="flex gap-1.5">
                          <button
                            disabled={approve.isPending}
                            onClick={() => approve.mutate({ id: r.id, origin })}
                            className="press inline-flex items-center gap-1 rounded-lg bg-neutral-950 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </button>
                          <button
                            disabled={reject.isPending}
                            onClick={() => reject.mutate({ id: r.id })}
                            className="press inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-semibold text-neutral-600 disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-neutral-400">
                    No inquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {list.data && (
          <Pagination page={page} pageSize={50} total={list.data.total} onChange={setPage} />
        )}
      </TableCard>
    </AdminLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-neutral-900 text-white",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", map[status] ?? "bg-neutral-100 text-neutral-600")}>
      {status}
    </span>
  );
}
