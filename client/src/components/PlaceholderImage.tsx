import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

type PlaceholderImageProps = {
  /** Logical slot, e.g. "home_hero" — looked up in the managed image map. */
  slot?: string;
  /** Map of slot -> url provided by the public images query. */
  imageMap?: Record<string, string>;
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
};

/**
 * Renders a managed image if one exists for `slot`; otherwise shows a gray
 * placeholder with the intended pixel dimensions clearly visible so a designer
 * knows exactly what asset to produce.
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
}: PlaceholderImageProps) {
  const url = slot && imageMap ? imageMap[slot] : undefined;
  const aspect = `${width} / ${height}`;

  if (url) {
    return (
      <div className={cn("overflow-hidden", rounded, className)} style={{ aspectRatio: aspect }}>
        <img
          src={url}
          alt={label ?? slot ?? "image"}
          loading="lazy"
          className={cn("h-full w-full", fit === "cover" ? "object-cover" : "object-contain")}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 overflow-hidden border border-dashed border-neutral-300 bg-neutral-100 text-neutral-500 select-none",
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
            "repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0 12px, transparent 12px 24px)",
        }}
      />
      <ImageIcon className="relative h-6 w-6 opacity-60" />
      <span className="relative font-mono text-sm font-semibold tracking-wide">
        {width} × {height}
      </span>
      {label ? (
        <span className="relative max-w-[90%] truncate px-2 text-center text-xs font-medium text-neutral-600">
          {label}
        </span>
      ) : null}
      {slot ? (
        <span className="relative font-mono text-[10px] text-neutral-400">{slot}</span>
      ) : null}
    </div>
  );
}
