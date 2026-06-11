import { PublicLayout } from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { CONTACT_WHOLESALE_EMAIL } from "@shared/const";
import { Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function WholesaleLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const utils = trpc.useUtils();

  const login = trpc.wholesale.login.useMutation({
    onSuccess: async () => {
      await utils.wholesale.me.invalidate();
      navigate("/wholesale/portal");
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email: email.trim(), password });
  };

  return (
    <PublicLayout>
      <section className="relative noise-bg">
        <div className="container flex min-h-[70vh] items-center justify-center py-16">
          <div className="w-full max-w-md">
            <div className="glass rounded-[1.75rem] p-8 shadow-xl">
              <div className="inline-flex rounded-xl bg-foreground p-2.5 text-background">
                <Lock className="h-5 w-5" />
              </div>
              <h1 className="mt-4 font-display text-2xl font-bold">Partner Login</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Approved wholesale partners only.
              </p>
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10"
                  />
                </div>
                {login.isError && (
                  <p className="text-sm text-destructive">
                    Invalid credentials or your account is not active yet.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={login.isPending}
                  className="press inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
                >
                  {login.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                </button>
              </form>
            </div>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Not a partner yet?{" "}
              <Link href="/wholesale" className="font-semibold text-foreground underline underline-offset-4">
                Apply here
              </Link>
              {" · "}
              <a href={`mailto:${CONTACT_WHOLESALE_EMAIL}`} className="font-medium text-foreground underline underline-offset-4">
                Need help?
              </a>
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
