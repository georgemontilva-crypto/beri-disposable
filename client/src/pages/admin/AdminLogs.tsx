import { AdminLayout } from "@/components/AdminLayout";
import { Pagination, TableCard } from "@/components/admin/AdminTable";
import { trpc } from "@/lib/trpc";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";

export default function AdminLogs() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const list = trpc.codes.adminLogs.useQuery(
    { search: query || undefined, page, pageSize: 50 },
    { retry: false }
  );

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  return (
    <AdminLayout title="Query Logs">
      <form onSubmit={onSearch} className="mb-4 flex gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code…"
            className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-neutral-900"
          />
        </div>
        <button className="press rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white">
          Search
        </button>
      </form>

      <TableCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-5 py-3 font-semibold">ID</th>
                <th className="px-5 py-3 font-semibold">Code</th>
                <th className="px-5 py-3 font-semibold">Result</th>
                <th className="px-5 py-3 font-semibold">Time</th>
                <th className="px-5 py-3 font-semibold">IP</th>
                <th className="px-5 py-3 font-semibold">User Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {list.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-neutral-400">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : list.data && list.data.rows.length > 0 ? (
                list.data.rows.map((l) => (
                  <tr key={l.id} className="hover:bg-neutral-50">
                    <td className="px-5 py-3 text-neutral-500">{l.id}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-md bg-neutral-100 px-2 py-1 font-mono text-xs font-semibold">
                        {l.code}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          l.result === "valid"
                            ? "inline-flex rounded-full bg-neutral-900 px-2.5 py-0.5 text-xs font-semibold text-white"
                            : "inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700"
                        }
                      >
                        {l.result}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-neutral-500">
                      {l.createdAt ? new Date(l.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-neutral-500">{l.ip ?? "—"}</td>
                    <td className="max-w-xs truncate px-5 py-3 text-xs text-neutral-400" title={l.userAgent ?? ""}>
                      {l.userAgent ?? "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-neutral-400">
                    No logs yet.
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
