import { AdminLayout } from "@/components/AdminLayout";
import { TableCard } from "@/components/admin/AdminTable";
import { BERI_CLIQ, BERI_CRUSH } from "@/lib/products";
import { trpc } from "@/lib/trpc";
import { Image as ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type SlotDef = { slot: string; label: string; section: string; size: string };

function buildSlots(): SlotDef[] {
  const slots: SlotDef[] = [
    { slot: "home_hero", label: "Home — Hero banner", section: "Home", size: "1920×1080" },
    { slot: "home_feature_1", label: "Home — Feature 1", section: "Home", size: "800×600" },
    { slot: "home_feature_2", label: "Home — Feature 2", section: "Home", size: "800×600" },
    { slot: "authenticate_banner", label: "Authenticate — Banner", section: "Authenticate", size: "1600×600" },
    { slot: "wholesale_banner", label: "Wholesale — Banner", section: "Wholesale", size: "1600×600" },
    { slot: BERI_CRUSH.heroSlot, label: "Beri Crush — Hero", section: "Beri Crush", size: "1200×900" },
    { slot: BERI_CLIQ.heroSlot, label: "Beri Cliq — Hero", section: "Beri Cliq", size: "1200×900" },
  ];
  for (const f of BERI_CRUSH.flavors) {
    slots.push({ slot: f.slot, label: `Crush — ${f.name}`, section: "Beri Crush", size: "600×600" });
  }
  for (const f of BERI_CLIQ.flavors) {
    slots.push({ slot: f.slot, label: `Cliq — ${f.name}`, section: "Beri Cliq", size: "600×600" });
  }
  return slots;
}

export default function AdminImages() {
  const slots = useMemo(buildSlots, []);
  const [section, setSection] = useState<string>("All");
  const utils = trpc.useUtils();
  const list = trpc.images.adminList.useQuery(undefined, { retry: false });

  const sections = useMemo(
    () => ["All", ...Array.from(new Set(slots.map((s) => s.section)))],
    [slots]
  );

  const bySlot = useMemo(() => {
    const map: Record<string, { id: number; url: string }> = {};
    for (const img of list.data ?? []) {
      if (!(img.slot in map)) map[img.slot] = { id: img.id, url: img.url };
    }
    return map;
  }, [list.data]);

  const upload = trpc.images.adminUpload.useMutation({
    onSuccess: () => {
      utils.images.adminList.invalidate();
      toast.success("Image uploaded");
    },
    onError: (e) => toast.error(e.message || "Upload failed"),
  });

  const del = trpc.images.adminDelete.useMutation({
    onSuccess: () => {
      utils.images.adminList.invalidate();
      toast.success("Image removed");
    },
  });

  const filtered = section === "All" ? slots : slots.filter((s) => s.section === section);

  return (
    <AdminLayout title="Site Images">
      <p className="mb-4 text-sm text-neutral-500">
        Upload imagery for each section. Images are stored in object storage
        (Manus storage in dev; configure Cloudflare R2 at deploy — see DEPLOY.md).
        Empty slots render gray placeholders with their dimensions on the public site.
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={
              section === s
                ? "press rounded-full bg-neutral-950 px-4 py-1.5 text-sm font-medium text-white"
                : "press rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
            }
          >
            {s}
          </button>
        ))}
      </div>

      <TableCard className="p-5">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((s) => (
            <SlotCard
              key={s.slot}
              def={s}
              current={bySlot[s.slot]}
              uploading={upload.isPending && upload.variables?.slot === s.slot}
              onUpload={(payload) => upload.mutate(payload)}
              onDelete={(id) => del.mutate({ id })}
            />
          ))}
        </div>
      </TableCard>
    </AdminLayout>
  );
}

function SlotCard({
  def,
  current,
  uploading,
  onUpload,
  onDelete,
}: {
  def: SlotDef;
  current?: { id: number; url: string };
  uploading: boolean;
  onUpload: (p: {
    slot: string;
    section: string;
    title: string;
    fileName: string;
    mimeType: string;
    base64: string;
  }) => void;
  onDelete: (id: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB");
      return;
    }
    const buf = await file.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);
    onUpload({
      slot: def.slot,
      section: def.section,
      title: def.label,
      fileName: file.name,
      mimeType: file.type || "image/jpeg",
      base64,
    });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200">
      <div className="relative aspect-square bg-neutral-100">
        {current ? (
          <img src={current.url} alt={def.label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-neutral-400">
            <ImageIcon className="h-6 w-6" />
            <span className="text-xs font-medium">{def.size}</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-700" />
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="truncate text-sm font-semibold" title={def.label}>
          {def.label}
        </div>
        <div className="mt-0.5 font-mono text-[11px] text-neutral-400">{def.slot}</div>
        <div className="mt-3 flex gap-1.5">
          <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
          <button
            onClick={() => inputRef.current?.click()}
            className="press inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-neutral-950 px-3 py-2 text-xs font-semibold text-white"
          >
            <Upload className="h-3.5 w-3.5" />
            {current ? "Replace" : "Upload"}
          </button>
          {current && (
            <button
              onClick={() => onDelete(current.id)}
              className="press rounded-lg border border-neutral-300 p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
