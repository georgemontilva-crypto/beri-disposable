import { PlaceholderImage } from "@/components/PlaceholderImage";
import { PublicLayout } from "@/components/PublicLayout";
import { useReveal } from "@/hooks/useReveal";
import { trpc } from "@/lib/trpc";
import { useSiteImages } from "@/hooks/useSiteImages";
import { CONTACT_WHOLESALE_EMAIL } from "@shared/const";
import { CheckCircle2, Check, Loader2, Lock, Store, TrendingUp, Truck, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

type DocKind = "business-license" | "tobacco-license" | "fein";

const DOC_FIELDS: { kind: DocKind; label: string }[] = [
  { kind: "business-license", label: "Business license image" },
  { kind: "tobacco-license", label: "OTP / Vape / Tobacco License" },
  { kind: "fein", label: "Federal EIN Document (FEIN)" },
];

const INPUT =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-neutral-400 focus:border-white/40 focus:ring-2 focus:ring-white/10";

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,.heic";
/** Licences are documents, not media; anything larger is a scan gone wrong. */
const MAX_DOC_BYTES = 10 * 1024 * 1024;

export default function Wholesale() {
  const images = useSiteImages();
  const revealRef = useReveal<HTMLDivElement>();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    shippingAddress: "",
  });
  const [docs, setDocs] = useState<Record<DocKind, string>>({
    "business-license": "",
    "tobacco-license": "",
    fein: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submit = trpc.wholesale.submitInquiry.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const missingDocs = DOC_FIELDS.filter((d) => !docs[d.kind]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.company.trim()) return;
    if (missingDocs.length) {
      toast.error(`Please upload: ${missingDocs.map((d) => d.label).join(", ")}`);
      return;
    }
    submit.mutate({
      firstName: form.firstName.trim() || undefined,
      lastName: form.lastName.trim() || undefined,
      company: form.company.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      shippingAddress: form.shippingAddress.trim() || undefined,
      businessLicenseUrl: docs["business-license"],
      tobaccoLicenseUrl: docs["tobacco-license"],
      feinUrl: docs.fein,
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
        <section className="relative overflow-hidden noise-bg-dark">
          <div className="container grid items-center gap-12 py-16 md:grid-cols-2 md:py-20">
            <div className="reveal">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-300 backdrop-blur">
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
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Field label="First Name">
                      <input
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        className={INPUT}
                        placeholder="Jane"
                      />
                    </Field>
                    <Field label="Last Name">
                      <input
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        className={INPUT}
                        placeholder="Doe"
                      />
                    </Field>
                    <Field label="Email *">
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={INPUT}
                        placeholder="you@company.com"
                      />
                    </Field>
                    <Field label="Phone / Mobile">
                      <input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className={INPUT}
                        placeholder="+1 555 000 0000"
                      />
                    </Field>
                    <Field label="Company Name *" className="sm:col-span-2">
                      <input
                        required
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className={INPUT}
                        placeholder="Your business name"
                      />
                    </Field>
                    <Field label="Shipping Address" className="sm:col-span-2">
                      <textarea
                        rows={2}
                        value={form.shippingAddress}
                        onChange={(e) =>
                          setForm({ ...form, shippingAddress: e.target.value })
                        }
                        className={`${INPUT} resize-none`}
                        placeholder="Street, city, state, ZIP"
                      />
                    </Field>
                  </div>

                  <div className="mt-6 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Required documents
                    </p>
                    {DOC_FIELDS.map((d) => (
                      <DocUpload
                        key={d.kind}
                        kind={d.kind}
                        label={d.label}
                        url={docs[d.kind]}
                        onUploaded={(url) => setDocs((prev) => ({ ...prev, [d.kind]: url }))}
                      />
                    ))}
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

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

/**
 * One licence document.
 *
 * The file goes straight from the browser to storage with a presigned URL, and
 * only the resulting link is submitted with the form. Sending the documents
 * inside the form post would mean holding three multi-megabyte files in the
 * server's memory, and losing all three if the submission failed validation.
 */
function DocUpload({
  kind,
  label,
  url,
  onUploaded,
}: {
  kind: DocKind;
  label: string;
  url: string;
  onUploaded: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState("");
  const presign = trpc.wholesale.presignDocument.useMutation();

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_DOC_BYTES) {
      toast.error("File must be under 10 MB.");
      return;
    }

    setBusy(true);
    try {
      const { uploadUrl, publicUrl } = await presign.mutateAsync({
        kind,
        fileName: file.name,
        // Browsers report an empty type for some scans; PDF is the safe guess
        // for a document picker and the server re-checks it anyway.
        mimeType: (file.type || "application/pdf") as
          | "application/pdf"
          | "image/jpeg"
          | "image/png"
          | "image/webp"
          | "image/heic",
      });

      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/pdf" },
        body: file,
      });
      if (!put.ok) throw new Error(`Upload failed (${put.status})`);

      setFileName(file.name);
      onUploaded(publicUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium text-white">
          {label} <span className="text-neutral-400">*</span>
        </div>
        <div className="truncate text-xs text-neutral-400">
          {fileName || "PDF or image, up to 10 MB"}
        </div>
      </div>

      <label
        className={`press inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
          url
            ? "bg-emerald-500/20 text-emerald-300"
            : "bg-white text-neutral-950 hover:bg-neutral-200"
        }`}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : url ? (
          <Check className="h-4 w-4" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {busy ? "Uploading" : url ? "Replace" : "Upload"}
        <input type="file" accept={ACCEPT} onChange={onPick} className="sr-only" />
      </label>
    </div>
  );
}
