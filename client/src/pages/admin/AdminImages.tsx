import { AdminLayout } from "@/components/AdminLayout";
import { TableCard } from "@/components/admin/AdminTable";
import { BERI_CLIQ, BERI_CRUSH } from "@/lib/products";
import { trpc } from "@/lib/trpc";
import { Film, Image as ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type SlotDef = {
  slot: string;
  label: string;
  section: string;
  size: string;
  type?: "image" | "video";
};

function buildSlots(): SlotDef[] {
  const slots: SlotDef[] = [
    // Video hero
    {
      slot: "home_hero_video",
      label: "Home — Hero Video",
      section: "Home",
      size: "1920×1080 MP4",
      type: "video",
    },
    // Spec grid images — Beri Crush
    { slot: "crush_spec_main",   label: "Crush — Main Device (tall)",       section: "Beri Crush", size: "600×1200" },
    { slot: "crush_spec_coil",   label: "Crush — Quad Coil Technology",    section: "Beri Crush", size: "600×600" },
    { slot: "crush_spec_screen", label: "Crush — Interactive HD Screen",   section: "Beri Crush", size: "600×600" },
    { slot: "crush_spec_bottom", label: "Crush — 2.5x Charging Speed",    section: "Beri Crush", size: "600×600" },
    { slot: "crush_spec_puffs",  label: "Crush — 50K Puffs (stat card)",  section: "Beri Crush", size: "600×600" },
    { slot: "crush_spec_power",  label: "Crush — Auto-Adaptive Power",    section: "Beri Crush", size: "600×600" },
    // Spec grid images — Beri Cliq
    { slot: "cliq_spec_main",    label: "Cliq — Main Device (tall)",        section: "Beri Cliq",  size: "600×1200" },
    { slot: "cliq_spec_tank",    label: "Cliq — 360° Crystal Tank",        section: "Beri Cliq",  size: "600×600" },
    { slot: "cliq_spec_coil",    label: "Cliq — Dual Mesh Coil",           section: "Beri Cliq",  size: "600×600" },
    { slot: "cliq_spec_bottom",  label: "Cliq — Light On/Off",            section: "Beri Cliq",  size: "600×600" },
    { slot: "cliq_spec_puffs",   label: "Cliq — 50K Puffs (stat card)",   section: "Beri Cliq",  size: "600×600" },
    { slot: "cliq_spec_display", label: "Cliq — LED Display (stat card)", section: "Beri Cliq",  size: "600×600" },
    // Existing slots
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
    const map: Record<string, { id: number; url: string; mimeType?: string }> = {};
    for (const img of list.data ?? []) {
      if (!(img.slot in map)) map[img.slot] = { id: img.id, url: img.url, mimeType: img.mimeType ?? undefined };
    }
    return map;
  }, [list.data]);

  const upload = trpc.images.adminUpload.useMutation({
    onSuccess: (_, vars) => {
      utils.images.adminList.invalidate();
      const isVideo = vars.mimeType.startsWith("video/");
      toast.success(isVideo ? "Video uploaded" : "Image uploaded");
    },
    onError: (e) => toast.error(e.message || "Upload failed"),
  });

  const del = trpc.images.adminDelete.useMutation({
    onSuccess: () => {
      utils.images.adminList.invalidate();
      toast.success("File removed");
    },
  });

  const filtered = section === "All" ? slots : slots.filter((s) => s.section === section);

  return (
    <AdminLayout title="Site Images & Video">
      <p className="mb-4 text-sm text-neutral-500">
        Upload images and videos for each section. The <strong>Home Hero Video</strong> slot accepts MP4 files (max 50 MB) and is displayed as a full-width video on the homepage. All other slots accept images. Empty slots render gray placeholders on the public site.
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
  current?: { id: number; url: string; mimeType?: string };
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
  const isVideo = def.type === "video";
  const maxBytes = isVideo ? 50 * 1024 * 1024 : 8 * 1024 * 1024;
  const accept = isVideo ? "video/mp4,video/*" : "image/*";

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxBytes) {
      toast.error(isVideo ? "Video must be under 50 MB" : "Image must be under 8 MB");
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
      mimeType: file.type || (isVideo ? "video/mp4" : "image/jpeg"),
      base64,
    });
    if (inputRef.current) inputRef.current.value = "";
  };

  const isCurrentVideo = current?.mimeType?.startsWith("video/") || (current && def.type === "video");

  return (
    <div className={`overflow-hidden rounded-xl border ${isVideo ? "border-blue-200 bg-blue-50/30" : "border-neutral-200"}`}>
      <div className="relative aspect-square bg-neutral-100">
        {current ? (
          isCurrentVideo ? (
            <video
              src={current.url}
              className="h-full w-full object-cover"
              muted
              loop
              autoPlay
              playsInline
            />
          ) : (
            <img src={current.url} alt={def.label} className="h-full w-full object-cover" />
          )
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-neutral-400">
            {isVideo ? <Film className="h-6 w-6 text-blue-400" /> : <ImageIcon className="h-6 w-6" />}
            <span className="text-xs font-medium">{def.size}</span>
            {isVideo && <span className="text-[10px] text-blue-400">MP4 video</span>}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-700" />
          </div>
        )}
        {isVideo && (
          <div className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
            VIDEO
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="truncate text-sm font-semibold" title={def.label}>
          {def.label}
        </div>
        <div className="mt-0.5 font-mono text-[11px] text-neutral-400">{def.slot}</div>
        <div className="mt-3 flex gap-1.5">
          <input ref={inputRef} type="file" accept={accept} onChange={onFile} className="hidden" />
          <button
            onClick={() => inputRef.current?.click()}
            className={`press inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white ${isVideo ? "bg-blue-600 hover:bg-blue-700" : "bg-neutral-950"}`}
          >
            <Upload className="h-3.5 w-3.5" />
            {current ? "Replace" : isVideo ? "Upload Video" : "Upload"}
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
