import { AdminLayout } from "@/components/AdminLayout";
import { Pagination, TableCard } from "@/components/admin/AdminTable";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Search, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function AdminCodes() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [newCode, setNewCode] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const list = trpc.codes.adminList.useQuery(
    { search: query || undefined, page, pageSize: 50 },
    { retry: false }
  );

  const add = trpc.codes.adminAdd.useMutation({
    onSuccess: () => {
      setNewCode("");
      utils.codes.adminList.invalidate();
      toast.success("Code added");
    },
    onError: () => toast.error("Could not add code"),
  });

  const del = trpc.codes.adminDelete.useMutation({
    onSuccess: () => {
      utils.codes.adminList.invalidate();
      toast.success("Code deleted");
    },
  });

  const bulk = trpc.codes.adminBulkImport.useMutation({
    onSuccess: (r) => {
      utils.codes.adminList.invalidate();
      toast.success(`Imported ${r.processed} codes`);
      if (fileRef.current) fileRef.current.value = "";
    },
    onError: (e) => toast.error(e.message || "Import failed"),
  });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    bulk.mutate({ content });
  };

  return (
    <AdminLayout title="Verify Codes">
      {/* Import + add */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="font-display text-lg font-semibold">Import codes</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Upload a CSV or TXT file. One code per line (or comma-separated).
            Duplicates are ignored.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt,text/plain,text/csv"
              onChange={onFile}
              className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-neutral-800"
            />
            {bulk.isPending && <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="font-display text-lg font-semibold">Add single code</h2>
          <p className="mt-1 text-sm text-neutral-500">Manually add one authentication code.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newCode.trim()) add.mutate({ code: newCode.trim() });
            }}
            className="mt-4 flex gap-2"
          >
            <input
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="e.g. 708839800535"
              className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 font-mono text-sm outline-none focus:border-neutral-900"
            />
            <button
              type="submit"
              disabled={add.isPending || !newCode.trim()}
              className="press inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="mt-6">
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
                  <th className="px-5 py-3 font-semibold">Created</th>
                  <th className="px-5 py-3 font-semibold">Updated</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {list.isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-neutral-400">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </td>
                  </tr>
                ) : list.data && list.data.rows.length > 0 ? (
                  list.data.rows.map((c) => (
                    <tr key={c.id} className="hover:bg-neutral-50">
                      <td className="px-5 py-3 text-neutral-500">{c.id}</td>
                      <td className="px-5 py-3">
                        <span className="rounded-md bg-neutral-100 px-2 py-1 font-mono text-xs font-semibold">
                          {c.code}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-neutral-500">
                        {c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-5 py-3 text-neutral-500">
                        {c.updatedAt ? new Date(c.updatedAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => del.mutate({ id: c.id })}
                          className="press rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-neutral-400">
                      No codes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {list.data && (
            <Pagination
              page={page}
              pageSize={50}
              total={list.data.total}
              onChange={setPage}
            />
          )}
        </TableCard>
      </div>
    </AdminLayout>
  );
}
