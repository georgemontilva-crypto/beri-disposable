import { PublicLayout } from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { CONTACT_WHOLESALE_EMAIL } from "@shared/const";
import { ExternalLink, FolderOpen, Loader2, LogOut, Mail, Newspaper } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function WholesalePortal() {
  const [, navigate] = useLocation();
  const me = trpc.wholesale.me.useQuery();
  const utils = trpc.useUtils();
  const logout = trpc.wholesale.logout.useMutation({
    onSuccess: async () => {
      await utils.wholesale.me.invalidate();
      navigate("/wholesale/login");
    },
  });

  useEffect(() => {
    if (!me.isLoading && !me.data) {
      navigate("/wholesale/login");
    }
  }, [me.isLoading, me.data, navigate]);

  if (me.isLoading) {
    return (
      <PublicLayout>
        <div className="container flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PublicLayout>
    );
  }

  if (!me.data) return null;

  return (
    <PublicLayout>
      <section className="container py-16">
        <div className="mx-auto max-w-3xl">
          <div className="glass rounded-[1.75rem] p-8 shadow-xl">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Wholesale Portal
                </span>
                <h1 className="mt-2 font-display text-3xl font-bold">
                  Welcome{me.data.name ? `, ${me.data.name}` : ""}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {me.data.company ? `${me.data.company} · ` : ""}
                  {me.data.email}
                </p>
              </div>
              <button
                onClick={() => logout.mutate()}
                className="press inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>

          <PartnerNews />
          <PartnerResources />

          <div className="glass mt-6 rounded-2xl p-6">
            <div className="inline-flex rounded-xl bg-foreground p-2.5 text-background">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold">Need anything?</h2>
            <p className="mt-1.5 text-sm text-neutral-400">
              Reach our wholesale team at{" "}
              <a
                href={`mailto:${CONTACT_WHOLESALE_EMAIL}`}
                className="font-medium text-white underline underline-offset-4"
              >
                {CONTACT_WHOLESALE_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}


/**
 * Brand news. Only published items reach here — the server filters drafts out
 * rather than sending everything and hiding some in the browser.
 */
function PartnerNews() {
  const news = trpc.partner.news.useQuery();

  if (news.isLoading || !news.data?.length) return null;

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
        <Newspaper className="h-4 w-4" /> Brand news
      </div>

      <div className="space-y-4">
        {news.data.map((item) => (
          <article key={item.id} className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold text-white">
              {item.title}
            </h3>
            <time className="mt-1 block text-xs text-neutral-500">
              {new Date(item.createdAt).toLocaleDateString()}
            </time>
            {/* whitespace-pre-line so paragraph breaks typed in the admin box
                survive, without accepting HTML from the form. */}
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-300">
              {item.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

/**
 * Downloadable assets, grouped by category.
 *
 * Every link opens in a new tab with `rel="noreferrer"`: these point at Drive
 * and similar, and a partner who follows one shouldn't lose the portal, nor
 * should the destination be handed the page they came from.
 */
function PartnerResources() {
  const resources = trpc.partner.resources.useQuery();

  if (resources.isLoading || !resources.data?.length) return null;

  const groups = new Map<string, typeof resources.data>();
  for (const r of resources.data) {
    const key = r.category ?? "General";
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
        <FolderOpen className="h-4 w-4" /> Resources
      </div>

      <div className="space-y-6">
        {Array.from(groups.entries()).map(([category, items]) => (
          <div key={category}>
            <h3 className="mb-2 text-sm font-semibold text-white">{category}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((r) => (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="glass group flex items-start justify-between gap-3 rounded-2xl p-5 transition-colors hover:bg-white/10"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-white">{r.title}</div>
                    {r.description && (
                      <div className="mt-1 text-sm text-neutral-400">
                        {r.description}
                      </div>
                    )}
                  </div>
                  <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-neutral-500 transition-colors group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
