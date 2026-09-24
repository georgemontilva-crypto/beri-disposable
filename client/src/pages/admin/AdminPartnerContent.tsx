import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const INPUT =
  "w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition focus:border-neutral-900";

/**
 * Both kinds of partner content on one screen.
 *
 * They're small, related and edited in the same sitting — splitting them across
 * two admin pages would mean two nav entries and two page loads for what is one
 * task: keeping the portal current.
 */
export default function AdminPartnerContent() {
  return (
    <AdminLayout title="Partner Portal">
      <div className="space-y-8">
        <NewsSection />
        <ResourcesSection />
      </div>
    </AdminLayout>
  );
}

/* ─── News ─────────────────────────────────────────────────────────────── */
function NewsSection() {
  const utils = trpc.useUtils();
  const list = trpc.partner.adminListNews.useQuery();
  const [form, setForm] = useState({ title: "", body: "", published: true });

  const create = trpc.partner.adminCreateNews.useMutation({
    onSuccess: () => {
      utils.partner.adminListNews.invalidate();
      setForm({ title: "", body: "", published: true });
      toast.success("Post added");
    },
    onError: (e) => toast.error(e.message),
  });
  const setPublished = trpc.partner.adminSetNewsPublished.useMutation({
    onSuccess: () => utils.partner.adminListNews.invalidate(),
  });
  const remove = trpc.partner.adminDeleteNews.useMutation({
    onSuccess: () => {
      utils.partner.adminListNews.invalidate();
      toast.success("Post deleted");
    },
  });

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="font-display text-lg font-semibold">Brand news</h2>
      <p className="mt-0.5 text-sm text-neutral-500">
        Shown to approved wholesale partners inside the portal.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Title"
          className={`${INPUT} sm:col-span-2`}
        />
        <textarea
          rows={4}
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          placeholder="Write the update. Blank lines become paragraphs."
          className={`${INPUT} resize-none sm:col-span-2`}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="h-4 w-4"
          />
          Publish immediately
        </label>
        <button
          type="button"
          disabled={!form.title.trim() || !form.body.trim() || create.isPending}
          onClick={() => create.mutate(form)}
          className="press inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {create.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add post
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {list.isLoading && <p className="text-sm text-neutral-400">Loading…</p>}
        {!list.isLoading && !list.data?.length && (
          <p className="text-sm text-neutral-400">No posts yet.</p>
        )}
        {list.data?.map((n) => (
          <div
            key={n.id}
            className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200 p-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{n.title}</span>
                {!n.published && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                    Draft
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{n.body}</p>
              <span className="mt-1 block text-xs text-neutral-400">
                {new Date(n.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setPublished.mutate({ id: n.id, published: !n.published })
                }
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold hover:bg-neutral-50"
              >
                {n.published ? "Unpublish" : "Publish"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete “${n.title}”?`)) remove.mutate({ id: n.id });
                }}
                className="rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Resources ────────────────────────────────────────────────────────── */
function ResourcesSection() {
  const utils = trpc.useUtils();
  const list = trpc.partner.adminListResources.useQuery();
  const [form, setForm] = useState({
    title: "",
    description: "",
    url: "",
    category: "General",
    sortOrder: 0,
  });

  const create = trpc.partner.adminCreateResource.useMutation({
    onSuccess: () => {
      utils.partner.adminListResources.invalidate();
      setForm({ title: "", description: "", url: "", category: "General", sortOrder: 0 });
      toast.success("Resource added");
    },
    onError: (e) => toast.error(e.message),
  });
  const remove = trpc.partner.adminDeleteResource.useMutation({
    onSuccess: () => {
      utils.partner.adminListResources.invalidate();
      toast.success("Resource deleted");
    },
  });

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="font-display text-lg font-semibold">Resources</h2>
      <p className="mt-0.5 text-sm text-neutral-500">
        Links to Drive folders, logo packs and sell sheets. Links rather than
        uploads, so the folder stays current without re-uploading here.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Title — e.g. Crush product photography"
          className={INPUT}
        />
        <input
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="Category — e.g. Photography"
          className={INPUT}
        />
        <input
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          placeholder="https://drive.google.com/…"
          className={`${INPUT} sm:col-span-2`}
        />
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Short description (optional)"
          className={`${INPUT} sm:col-span-2`}
        />
        <button
          type="button"
          disabled={!form.title.trim() || !form.url.trim() || create.isPending}
          onClick={() =>
            create.mutate({
              ...form,
              description: form.description.trim() || undefined,
            })
          }
          className="press inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {create.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add resource
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {list.isLoading && <p className="text-sm text-neutral-400">Loading…</p>}
        {!list.isLoading && !list.data?.length && (
          <p className="text-sm text-neutral-400">No resources yet.</p>
        )}
        {list.data?.map((r) => (
          <div
            key={r.id}
            className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200 p-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{r.title}</span>
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-neutral-500">
                  {r.category}
                </span>
              </div>
              {r.description && (
                <p className="mt-1 text-sm text-neutral-500">{r.description}</p>
              )}
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-900"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="truncate">{r.url}</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete “${r.title}”?`)) remove.mutate({ id: r.id });
              }}
              className="shrink-0 rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
