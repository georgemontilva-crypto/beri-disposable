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

type DocKind =
  | "business-license"
  | "tobacco-license"
  | "fein"
  | "resale-certificate";

const DOC_FIELDS: { kind: DocKind; label: string }[] = [
  { kind: "business-license", label: "Business License" },
  { kind: "resale-certificate", label: "Resale Certificate / Sales Tax Permit" },
  { kind: "tobacco-license", label: "Applicable Tobacco / Vapor License" },
  { kind: "fein", label: "Federal EIN Document (FEIN)" },
];

const BUSINESS_TYPES = ["Retailer", "Distributor", "Chain", "Other"];

/** Product interest, as check boxes. Values are stored joined on the record. */
const INTERESTS = [
  "BERI CRUSH",
  "BERI CLIQ",
  "BERI CIRQL",
  "BERI E-Liquid",
  "Full Lineup",
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
    businessType: "",
    locations: "",
    website: "",
    about: "",
  });
  const [docs, setDocs] = useState<Record<DocKind, string>>({
    "business-license": "",
    "resale-certificate": "",
    "tobacco-license": "",
    fein: "",
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const submit = trpc.wholesale.submitInquiry.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const missingDocs = DOC_FIELDS.filter((d) => !docs[d.kind]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.company.trim() ||
      !form.shippingAddress.trim() ||
      !form.businessType
    ) {
      toast.error("Please complete the required fields.");
      return;
    }
    if (missingDocs.length) {
      toast.error(`Please upload: ${missingDocs.map((d) => d.label).join(", ")}`);
      return;
    }
    submit.mutate({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      company: form.company.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      shippingAddress: form.shippingAddress.trim(),
      businessType: form.businessType,
      locations: form.locations.trim() || undefined,
      website: form.website.trim() || undefined,
      interestedIn: interests.length ? interests : undefined,
      about: form.about.trim() || undefined,
      businessLicenseUrl: docs["business-license"],
      tobaccoLicenseUrl: docs["tobacco-license"],
      feinUrl: docs.fein,
      resaleCertUrl: docs["resale-certificate"],
    });
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: "Wholesale Pricing",
      desc: "Competitive pricing for qualified retail and distribution partners.",
    },
    {
      icon: Truck,
      title: "Full-Line Access",
      desc: "Access to BERI products, flavors, and new releases.",
    },
    {
      icon: Store,
      title: "Brand Support",
      desc: "Marketing assets, product information, and partner support.",
    },
  ];

  return (
    <PublicLayout>
      <div ref={revealRef}>
        {/* Same treatment as verification but a different accent, so the two
            functional pages read as a pair without looking like the same
            section repeated. */}
        <section
          className="tech-grid form-glow relative overflow-hidden"
          style={{ ["--form-glow" as string]: "124 92 255" }}
        >
          <div className="container grid items-center gap-12 py-16 md:grid-cols-2 md:py-20">
            <div className="reveal">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-300 backdrop-blur">
                <Store className="h-3.5 w-3.5" />
                Wholesale Program
              </span>
              <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Become a BERI Partner
              </h1>
              <p className="mt-4 max-w-md text-lg text-neutral-400">
                Join the BERI wholesale network and bring the full lineup to your
                customers. Submit your application and our team will review it
                for approval.
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
                  Partner Login
                </Link>
              </p>
            </div>

            {/* Form / Success */}
            <div className="reveal" data-reveal-delay="120">
              {submitted ? (
                <div className="glass rounded-[1.75rem] p-8 text-center shadow-xl">
                  <CheckCircle2 className="mx-auto h-14 w-14" />
                  <h2 className="mt-4 font-display text-2xl font-bold uppercase">
                    Application Received
                  </h2>
                  <p className="mt-3 text-neutral-300">
                    Thank you for your interest in becoming a BERI partner. Our
                    wholesale team will review your information and contact you
                    regarding the next steps.
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
                  <h2 className="font-display text-xl font-bold uppercase">
                    Wholesale Application
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Fields marked with * are required.
                  </p>
                  <SectionLabel>Contact Information</SectionLabel>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="First Name *">
                      <input
                        required
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        className={INPUT}
                        placeholder="Jane"
                      />
                    </Field>
                    <Field label="Last Name *">
                      <input
                        required
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
                    <Field label="Phone Number *">
                      <input
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className={INPUT}
                        placeholder="+1 555 000 0000"
                      />
                    </Field>
                  </div>

                  <SectionLabel>Business Information</SectionLabel>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Company Name *" className="sm:col-span-2">
                      <input
                        required
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className={INPUT}
                        placeholder="Your business name"
                      />
                    </Field>
                    <Field label="Business / Shipping Address *" className="sm:col-span-2">
                      <textarea
                        required
                        rows={2}
                        value={form.shippingAddress}
                        onChange={(e) =>
                          setForm({ ...form, shippingAddress: e.target.value })
                        }
                        className={`${INPUT} resize-none`}
                        placeholder="Street, city, state, ZIP"
                      />
                    </Field>
                    <Field label="Business Type *">
                      <select
                        required
                        value={form.businessType}
                        onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                        className={INPUT}
                      >
                        <option value="">Select one</option>
                        {BUSINESS_TYPES.map((t) => (
                          <option key={t} value={t} className="bg-neutral-900">
                            {t}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Number of Locations">
                      <input
                        value={form.locations}
                        onChange={(e) => setForm({ ...form, locations: e.target.value })}
                        className={INPUT}
                        placeholder="e.g. 3"
                      />
                    </Field>
                    <Field label="Website / Social Media" className="sm:col-span-2">
                      <input
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                        className={INPUT}
                        placeholder="Optional"
                      />
                    </Field>
                  </div>

                  <SectionLabel>Documents</SectionLabel>
                  <div className="space-y-3">
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

                  <SectionLabel>Interested In</SectionLabel>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {INTERESTS.map((item) => {
                      const checked = interests.includes(item);
                      return (
                        <label
                          key={item}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm transition-colors hover:bg-white/10"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setInterests((prev) =>
                                checked ? prev.filter((v) => v !== item) : [...prev, item]
                              )
                            }
                            className="h-4 w-4 accent-white"
                          />
                          {item}
                        </label>
                      );
                    })}
                  </div>

                  <SectionLabel>Tell us about your business</SectionLabel>
                  <textarea
                    rows={3}
                    value={form.about}
                    onChange={(e) => setForm({ ...form, about: e.target.value })}
                    className={`${INPUT} resize-none`}
                    placeholder="Optional"
                  />

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


/** Groups the form into the sections the application is organised around. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 first:mt-5">
      {children}
    </p>
  );
}
