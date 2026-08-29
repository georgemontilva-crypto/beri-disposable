import { AdminLayout } from "@/components/AdminLayout";
import { TableCard } from "@/components/admin/AdminTable";
import { PRODUCTS } from "@/lib/products";
import { trpc } from "@/lib/trpc";
import { Box, Film, Image as ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type SlotDef = {
  slot: string;
  label: string;
  section: string;
  size: string;
  type?: "image" | "video" | "model";
};

function buildSlots(): SlotDef[] {
  const slots: SlotDef[] = [
    {
      slot: "home_hero_bg",
      label: "Home — Hero Background",
      section: "Home",
      size: "2400×1400 (optional)",
    },
    { slot: "authenticate_banner", label: "Authenticate — Banner", section: "Authenticate", size: "1600×600" },
    { slot: "wholesale_banner", label: "Wholesale — Banner", section: "Wholesale", size: "1600×600" },
  ];

  // Per-product slots are generated from the product catalogue, so adding a
  // product to lib/products.ts automatically surfaces all of its media slots
  // here — no need to edit this file again.
  for (const p of PRODUCTS) {
    const section = p.name;
    slots.push({
      slot: `${p.key}_hero_card`,
      label: `${p.name} — Home Fan Card`,
      section,
      size: "480×640 (portrait)",
    });
    slots.push({ slot: p.heroSlot, label: `${p.name} — Hero`, section, size: "1200×900" });
    slots.push({
      slot: p.modelSlot,
      label: `${p.name} — 3D Model`,
      section,
      size: ".glb / .gltf · max 25 MB",
      type: "model",
    });
    slots.push({ slot: `${p.key}_banner`, label: `${p.name} — Banner`, section, size: "1600×600" });
    for (const sp of p.specSlots) {
      slots.push({ slot: sp.slot, label: `${p.name} — ${sp.label}`, section, size: sp.tall ? "600×1200" : "600×600" });
    }
    for (const f of p.flavors) {
      slots.push({ slot: f.slot, label: `${p.name} — ${f.name}`, section, size: "600×600" });
    }
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

  const storage = trpc.images.storageStatus.useQuery(undefined, { retry: false });
  const presign = trpc.images.adminPresignUpload.useMutation();
  const confirm = trpc.images.adminConfirmUpload.useMutation();
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);

  /**
   * Two-step upload: ask the server for a presigned URL, PUT the file straight
   * to R2 from the browser, then record it in the database. The file never
   * passes through the Node process.
   */
  const handleUpload = async (p: {
    slot: string;
    section: string;
    title: string;
    file: File;
    mimeType: string;
  }) => {
    setUploadingSlot(p.slot);
    try {
      const { storageKey, uploadUrl, publicUrl } = await presign.mutateAsync({
        slot: p.slot,
        fileName: p.file.name,
        mimeType: p.mimeType,
      });

      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": p.mimeType },
        body: p.file,
      });
      if (!put.ok) {
        throw new Error(
          `R2 rejected the upload (${put.status}). Check the bucket CORS policy.`
        );
      }

      await confirm.mutateAsync({
        slot: p.slot,
        section: p.section,
        title: p.title,
        storageKey,
        url: publicUrl,
        mimeType: p.mimeType,
        sizeBytes: p.file.size,
      });

      utils.images.adminList.invalidate();
      toast.success("Uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingSlot(null);
    }
  };

  const del = trpc.images.adminDelete.useMutation({
    onSuccess: () => {
      utils.images.adminList.invalidate();
      toast.success("File removed");
    },
  });

  const filtered = section === "All" ? slots : slots.filter((s) => s.section === section);

  return (
    <AdminLayout title="Site Images & Video">
      {storage.data && !storage.data.configured && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Object storage is not configured.</strong> Uploads will fail until
          these environment variables are set on the server:{" "}
          <code className="font-mono text-xs">{storage.data.missing.join(", ")}</code>
        </div>
      )}
      <p className="mb-4 text-sm text-neutral-500">
        Upload media for each section. The <strong>Home Fan Card</strong> slots are the four portrait cards in the homepage hero (480×640, the product on a clean background). <strong>Home Hero Background</strong> is optional — the hero falls back to solid black. The <strong>3D Model</strong> slots accept web-ready <strong>.glb</strong> files (max 25 MB) and power the interactive viewer on each product page — CAD files (STEP/IGES) must be converted to GLB first. All other slots accept images. Empty slots render placeholders on the public site.
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
              uploading={uploadingSlot === s.slot}
              onUpload={handleUpload}
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
    file: File;
    mimeType: string;
  }) => void;
  onDelete: (id: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isVideo = def.type === "video";
  const maxBytes = isVideo
    ? 50 * 1024 * 1024
    : def.type === "model"
      ? 25 * 1024 * 1024
      : 8 * 1024 * 1024;
  const isModel = def.type === "model";
  const accept = isVideo
    ? "video/mp4,video/*"
    : isModel
      ? ".glb,.gltf,model/gltf-binary,model/gltf+json"
      : "image/*";

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxBytes) {
      const limitMb = Math.round(maxBytes / 1024 / 1024);
      toast.error(`File must be under ${limitMb} MB`);
      return;
    }
    // Browsers report an empty type for .glb, so fall back by slot kind.
    const mimeType =
      file.type ||
      (isVideo ? "video/mp4" : isModel ? "model/gltf-binary" : "image/jpeg");
    onUpload({
      slot: def.slot,
      section: def.section,
      title: def.label,
      file,
      mimeType,
    });
    if (inputRef.current) inputRef.current.value = "";
  };

  const isCurrentVideo = current?.mimeType?.startsWith("video/") || (current && def.type === "video");
  const isCurrentModel = current?.mimeType?.startsWith("model/") || (current && def.type === "model");

  return (
    <div
      className={`overflow-hidden rounded-xl border ${
        isVideo
          ? "border-blue-200 bg-blue-50/30"
          : isModel
            ? "border-violet-200 bg-violet-50/30"
            : "border-neutral-200"
      }`}
    >
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
          ) : isCurrentModel ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-violet-500">
              <Box className="h-8 w-8" strokeWidth={1.5} />
              <span className="text-xs font-semibold">Model uploaded</span>
              <a
                href={current.url}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] underline hover:text-violet-700"
              >
                Download
              </a>
            </div>
          ) : (
            <img src={current.url} alt={def.label} className="h-full w-full object-cover" />
          )
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-neutral-400">
            {isVideo ? (
              <Film className="h-6 w-6 text-blue-400" />
            ) : isModel ? (
              <Box className="h-6 w-6 text-violet-400" />
            ) : (
              <ImageIcon className="h-6 w-6" />
            )}
            <span className="text-xs font-medium">{def.size}</span>
            {isVideo && <span className="text-[10px] text-blue-400">MP4 video</span>}
            {isModel && <span className="text-[10px] text-violet-400">glTF binary</span>}
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
        {isModel && (
          <div className="absolute left-2 top-2 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white">
            3D
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
            className={`press inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white ${
              isVideo
                ? "bg-blue-600 hover:bg-blue-700"
                : isModel
                  ? "bg-violet-600 hover:bg-violet-700"
                  : "bg-neutral-950"
            }`}
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
