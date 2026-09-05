/**
 * Optional tiling brand pattern behind a functional page.
 *
 * Sits on its own solid black base so the ambient colour glow can't bleed
 * through and tint the pattern, which turns a crisp brand mark into a stain.
 *
 * Held much fainter than the product textures: these pages carry forms, and a
 * pattern you consciously notice behind a form competes with it. Renders
 * nothing at all until an image is uploaded.
 */
import { useSiteImages } from "@/hooks/useSiteImages";

export default function PageTexture({ slot }: { slot: string }) {
  const media = useSiteImages();
  const url = media[slot]?.url;
  if (!url) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-black" />
      <div
        className="absolute inset-0 opacity-[0.34]"
        style={{
          backgroundImage: `url(${url})`,
          backgroundRepeat: "repeat",
          backgroundSize: "1200px auto",
          filter: "brightness(0.95)",
        }}
      />
      {/* Fades downward, but far later than before: the earlier ramp reached
          near-black by the middle of the section, which hid the pattern exactly
          where there was room to show it. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.65) 80%, rgba(0,0,0,0.95) 100%)",
        }}
      />
    </div>
  );
}
