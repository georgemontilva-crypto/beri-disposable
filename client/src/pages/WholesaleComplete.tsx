import { PublicLayout } from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";

export default function WholesaleComplete() {
  const [, navigate] = useLocation();
  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("token") ?? "";
  }, []);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const tokenCheck = trpc.wholesale.validateRegistrationToken.useQuery(
    { token },
    { enabled: !!token }
  );

  const complete = trpc.wholesale.completeRegistration.useMutation({
    onSuccess: () => navigate("/wholesale/portal"),
    onError: (e) => setError(e.message),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    complete.mutate({ token, password });
  };

  return (
    <PublicLayout>
      <section className="relative noise-bg-dark">
        <div className="container flex min-h-[70vh] items-center justify-center py-16">
          <div className="w-full max-w-md">
            <div className="glass rounded-[1.75rem] p-8 shadow-xl">
              {!token || (tokenCheck.data && !tokenCheck.data.valid) ? (
                <div className="text-center">
                  <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                  <h1 className="mt-4 font-display text-2xl font-bold">Invalid or expired link</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This registration link is no longer valid. Please contact our
                    wholesale team for a new invitation.
                  </p>
                  <Link
                    href="/wholesale"
                    className="press mt-6 inline-flex rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background"
                  >
                    Back to Wholesale
                  </Link>
                </div>
              ) : tokenCheck.isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <CheckCircle2 className="h-12 w-12" />
                  <h1 className="mt-4 font-display text-2xl font-bold">Complete your registration</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Welcome{tokenCheck.data?.name ? `, ${tokenCheck.data.name}` : ""}! Set a
                    password for <span className="font-medium text-foreground">{tokenCheck.data?.email}</span>.
                  </p>
                  <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium">Password</label>
                      <input
                        required
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-neutral-400 focus:border-white/40 focus:ring-2 focus:ring-white/10"
                        placeholder="At least 8 characters"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Confirm password</label>
                      <input
                        required
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-neutral-400 focus:border-white/40 focus:ring-2 focus:ring-white/10"
                      />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <button
                      type="submit"
                      disabled={complete.isPending}
                      className="press inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
                    >
                      {complete.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
