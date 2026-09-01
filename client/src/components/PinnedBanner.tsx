/**
 * Full-bleed banner that stays put while the page scrolls over it.
 *
 * The image is `position: fixed`, but the section carries `clip-path: inset(0)`.
 * A clip-path makes an element the containing block for fixed descendants, so
 * the image is pinned to the viewport *and* clipped to the section: it holds
 * still while the section travels, and disappears behind the following content
 * as the section scrolls away. No scroll listener, no transform per frame — the
 * compositor does all of it.
 *
 * Phones fall back to a normal image. iOS Safari resolves fixed positioning
 * against a viewport that changes height as the URL bar hides, which makes a
 * pinned layer drift and jump mid-scroll.
 */
import { useSiteImages } from "@/hooks/useSiteImages";
import { useEffect, useState } from "react";

export default function PinnedBanner({
  slot,
  label,
  className = "",
  children,
}: {
  slot: string;
  label?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const media = useSiteImages();
  const url = media[slot]?.url;
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setPinned(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section
      className={`relative w-full overflow-hidden ${className}`}
      // Only while pinned: an unnecessary clip-path still forces its own
      // compositing layer.
      style={pinned ? { clipPath: "inset(0)" } : undefined}
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
        <div className="absolute inset-0 flex items-center justify-center border border-dashed border-white/15 bg-white/[0.07]">
          <span className="font-mono text-[11px] text-neutral-300">{slot}</span>
        </div>
      )}

      {children && <div className="relative z-10">{children}</div>}
    </section>
  );
}
