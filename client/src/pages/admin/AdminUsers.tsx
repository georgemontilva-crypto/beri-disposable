import { AdminLayout } from "@/components/AdminLayout";
import { Pagination, TableCard } from "@/components/admin/AdminTable";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const list = trpc.wholesale.adminListUsers.useQuery(
    { search: query || undefined, page, pageSize: 50 },
    { retry: false }
  );

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  return (
    <AdminLayout title="Wholesale Users">
      <p className="mb-4 text-sm text-neutral-500">
        Approved partners. Users with status <strong>approved</strong> have been
        invited and pending password setup; <strong>active</strong> users have
        completed registration.
      </p>

      <form onSubmit={onSearch} className="mb-4 flex gap-2">
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
                <th className="px-5 py-3 font-semibold">Last sign-in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {list.isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-neutral-400">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : list.data && list.data.rows.length > 0 ? (
                list.data.rows.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50">
                    <td className="px-5 py-3 text-neutral-500">{u.id}</td>
                    <td className="px-5 py-3 font-medium">{u.name ?? "—"}</td>
                    <td className="px-5 py-3 text-neutral-600">{u.company ?? "—"}</td>
                    <td className="px-5 py-3 text-neutral-600">{u.email}</td>
                    <td className="px-5 py-3 text-neutral-600">{u.phone ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                          u.status === "active"
                            ? "bg-neutral-900 text-white"
                            : u.status === "approved"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-neutral-100 text-neutral-600"
                        )}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-neutral-500">
                      {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-neutral-400">
                    No wholesale users yet.
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
