import { cn } from "@/lib/utils";
import { Film, ImageIcon } from "lucide-react";
import type { PublicMediaEntry } from "@/hooks/useSiteImages";

type PlaceholderImageProps = {
  /** Logical slot, e.g. "home_hero" — looked up in the managed image map. */
  slot?: string;
  /** Map of slot -> { url, mimeType } provided by the public images query. */
  imageMap?: Record<string, PublicMediaEntry>;
  /** Width in px to show in the placeholder label. */
  width: number;
  /** Height in px to show in the placeholder label. */
  height: number;
  /** Optional caption shown under the dimensions, e.g. the flavor name. */
  label?: string;
  className?: string;
  rounded?: string;
  /** object-fit when a real image exists. */
  fit?: "cover" | "contain";
  /** Extra video props (autoPlay, muted, loop, controls) */
  videoProps?: React.VideoHTMLAttributes<HTMLVideoElement>;
};

/**
 * Renders a managed image or video if one exists for `slot`; otherwise shows a
 * gray placeholder with the intended pixel dimensions clearly visible so a
 * designer knows exactly what asset to produce.
 */
export function PlaceholderImage({
  slot,
  imageMap,
  width,
  height,
  label,
  className,
  rounded = "rounded-2xl",
  fit = "cover",
  videoProps,
}: PlaceholderImageProps) {
  const entry = slot && imageMap ? imageMap[slot] : undefined;
  const aspect = `${width} / ${height}`;
  const isVideo = entry?.mimeType?.startsWith("video/");

  if (entry) {
    return (
      <div className={cn("overflow-hidden", rounded, className)} style={{ aspectRatio: aspect }}>
        {isVideo ? (
          <video
            src={entry.url}
            className={cn("h-full w-full", fit === "cover" ? "object-cover" : "object-contain")}
            autoPlay
            muted
            loop
            playsInline
            {...videoProps}
          />
        ) : (
          <img
            src={entry.url}
            alt={label ?? slot ?? "image"}
            loading="lazy"
            className={cn("h-full w-full", fit === "cover" ? "object-cover" : "object-contain")}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 overflow-hidden border border-dashed border-white/15 bg-white/[0.07] text-neutral-400 select-none",
        rounded,
        className
      )}
      style={{ aspectRatio: aspect }}
      data-slot-placeholder={slot}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 12px, transparent 12px 24px)",
        }}
      />
      {slot?.includes("video") ? (
        <Film className="relative h-6 w-6 opacity-60 text-blue-400" />
      ) : (
        <ImageIcon className="relative h-6 w-6 opacity-60" />
      )}
      <span className="relative font-mono text-sm font-semibold tracking-wide">
        {width} × {height}
      </span>
      {label ? (
        <span className="relative max-w-[90%] truncate px-2 text-center text-xs font-medium text-neutral-300">
          {label}
        </span>
      ) : null}
      {slot ? (
        <span className="relative font-mono text-[10px] text-neutral-300">{slot}</span>
      ) : null}
    </div>
  );
}
