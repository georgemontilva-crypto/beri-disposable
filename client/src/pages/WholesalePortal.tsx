import { PublicLayout } from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { CONTACT_WHOLESALE_EMAIL } from "@shared/const";
import { Loader2, LogOut, Mail, Package } from "lucide-react";
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
                className="press inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-neutral-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="glass rounded-2xl p-6">
              <div className="inline-flex rounded-xl bg-foreground p-2.5 text-background">
                <Package className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold">Your account is active</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Your wholesale partnership is approved. Our team will reach out with
                catalog and ordering details.
              </p>
            </div>
            <div className="glass rounded-2xl p-6">
              <div className="inline-flex rounded-xl bg-foreground p-2.5 text-background">
                <Mail className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold">Need anything?</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Reach our wholesale team at{" "}
                <a href={`mailto:${CONTACT_WHOLESALE_EMAIL}`} className="font-medium text-foreground underline underline-offset-4">
                  {CONTACT_WHOLESALE_EMAIL}
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
