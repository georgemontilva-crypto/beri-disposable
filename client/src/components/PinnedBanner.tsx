/**
 * Full-bleed banner that takes its shape from the image it is given.
 *
 * The section used to be a fixed 75vh and the image was cropped to fill it,
 * which meant every banner had to be authored to that exact proportion or lose
 * its top and bottom. Now the natural size of the file decides the height:
 * whatever is uploaded is shown whole.
 *
 * The image is `position: fixed`, but the section carries `clip-path: inset(0)`.
 * A clip-path makes an element the containing block for fixed descendants, so
 * the image is pinned and clipped to the section: it holds still while the
 * section travels, and disappears behind the following content as the section
 * scrolls away. No scroll listener, no transform per frame.
 *
 * Phones fall back to a normal image. iOS Safari resolves fixed positioning
 * against a viewport that changes height as the URL bar hides, which makes a
 * pinned layer drift and jump mid-scroll.
 */
import { useSiteImages } from "@/hooks/useSiteImages";
import { useEffect, useState } from "react";

/** Used until the file's real proportions are known, and for the placeholder. */
const DEFAULT_ASPECT = 16 / 9;
/**
 * A banner taller than the screen can't be seen at once however it is scaled,
 * and it pushes the rest of the page far out of reach, so very tall uploads are
 * capped rather than honoured exactly.
 */
const MAX_ASPECT_HEIGHT_VH = 92;

export default function PinnedBanner({
  slot,
  fallbackSlot,
  label,
  className = "",
  children,
}: {
  slot: string;
  /** Used when `slot` has no image, so a range without its own banner still
      shows the product's rather than an empty panel. */
  fallbackSlot?: string;
  label?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const media = useSiteImages();
  const url =
    media[slot]?.url ?? (fallbackSlot ? media[fallbackSlot]?.url : undefined);

  const [aspect, setAspect] = useState<number | null>(null);
  const [pinned, setPinned] = useState(false);

  // Measured off-document rather than from the rendered element: the section
  // needs its height before the visible image is laid out, or it would resize
  // under the reader a moment after they reach it.
  useEffect(() => {
    setAspect(null);
    if (!url) return;
    const probe = new Image();
    probe.onload = () => {
      if (probe.naturalWidth && probe.naturalHeight) {
        setAspect(probe.naturalWidth / probe.naturalHeight);
      }
    };
    probe.src = url;
  }, [url]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setPinned(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const ratio = aspect ?? DEFAULT_ASPECT;

  return (
    <section
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        aspectRatio: `${ratio}`,
        maxHeight: `${MAX_ASPECT_HEIGHT_VH}vh`,
        ...(pinned ? { clipPath: "inset(0)" } : {}),
      }}
    >
      {url ? (
        <div className={pinned ? "fixed inset-0" : "absolute inset-0"}>
          <img
            src={url}
            alt={label ?? ""}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center border border-dashed border-white/15 bg-white/[0.04]">
          <span className="font-mono text-[11px] text-neutral-500">
            {fallbackSlot ?? slot}
          </span>
        </div>
      )}

      {children && <div className="relative z-10">{children}</div>}
    </section>
  );
}
