import { PlaceholderImage } from "@/components/PlaceholderImage";
import { PublicLayout } from "@/components/PublicLayout";
import { useReveal } from "@/hooks/useReveal";
import { trpc } from "@/lib/trpc";
import { useSiteImages } from "@/hooks/useSiteImages";
import { CONTACT_WHOLESALE_EMAIL } from "@shared/const";
import { CheckCircle2, Loader2, Lock, Store, TrendingUp, Truck } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Wholesale() {
  const images = useSiteImages();
  const revealRef = useReveal<HTMLDivElement>();
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);

  const submit = trpc.wholesale.submitInquiry.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    submit.mutate({
      name: form.name.trim(),
      company: form.company.trim() || undefined,
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
    });
  };

  const benefits = [
    { icon: TrendingUp, title: "Competitive Margins", desc: "Pricing built for retail and distribution partners." },
    { icon: Truck, title: "Reliable Supply", desc: "Consistent stock of the full BERI lineup." },
    { icon: Store, title: "Brand Support", desc: "Marketing assets and authentication tools included." },
  ];

  return (
    <PublicLayout>
      <div ref={revealRef}>
        <section className="relative overflow-hidden noise-bg">
          <div className="container grid items-center gap-12 py-16 md:grid-cols-2 md:py-20">
            <div className="reveal">
              <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 backdrop-blur">
                <Store className="h-3.5 w-3.5" />
                Wholesale Program
              </span>
              <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Become a BERI partner
              </h1>
              <p className="mt-4 max-w-md text-lg text-muted-foreground">
                Join our wholesale network and stock the premium BERI lineup. Submit
                your application and our team will review it shortly.
              </p>
              <div className="mt-8 space-y-3">
                {benefits.map((b) => (
                  <div key={b.title} className="flex items-start gap-3">
                    <div className="rounded-lg bg-foreground p-2 text-background">
                      <b.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold">{b.title}</div>
                      <div className="text-sm text-muted-foreground">{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-sm text-muted-foreground">
                Already approved?{" "}
                <Link href="/wholesale/login" className="inline-flex items-center gap-1 font-semibold text-foreground underline underline-offset-4">
                  <Lock className="h-3.5 w-3.5" />
                  Partner login
                </Link>
              </p>
            </div>

            {/* Form / Success */}
            <div className="reveal" data-reveal-delay="120">
              {submitted ? (
                <div className="glass rounded-[1.75rem] p-8 text-center shadow-xl">
                  <CheckCircle2 className="mx-auto h-14 w-14" />
                  <h2 className="mt-4 font-display text-2xl font-bold">Application received</h2>
                  <p className="mt-3 text-muted-foreground">
                    Thank you for your interest in BERI. Our team will review your
                    application and, once approved, you'll receive an email to complete
                    your account registration.
                  </p>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Questions? Email{" "}
                    <a href={`mailto:${CONTACT_WHOLESALE_EMAIL}`} className="font-medium text-foreground underline underline-offset-4">
                      {CONTACT_WHOLESALE_EMAIL}
                    </a>
                  </p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="glass rounded-[1.75rem] p-6 shadow-xl sm:p-8">
                  <h2 className="font-display text-xl font-bold">Wholesale application</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Fields marked with * are required.
                  </p>
                  <div className="mt-5 space-y-4">
                    <Field label="Full name *">
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10"
                        placeholder="Jane Doe"
                      />
                    </Field>
                    <Field label="Company">
                      <input
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10"
                        placeholder="Your business name"
                      />
                    </Field>
                    <Field label="Email *">
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10"
                        placeholder="you@company.com"
                      />
                    </Field>
                    <Field label="Phone">
                      <input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-foreground focus:ring-2 focus:ring-foreground/10"
                        placeholder="+1 555 000 0000"
                      />
                    </Field>
                  </div>
                  {submit.isError && (
                    <p className="mt-4 text-sm text-destructive">
                      Something went wrong. Please try again.
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={submit.isPending}
                    className="press mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
                  >
                    {submit.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="container pb-20">
          <div className="reveal">
            <PlaceholderImage
              slot="wholesale_banner"
              imageMap={images}
              width={1280}
              height={360}
              label="Wholesale lifestyle banner"
              rounded="rounded-[2rem]"
            />
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
