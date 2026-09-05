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
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: `url(${url})`,
          backgroundRepeat: "repeat",
          backgroundSize: "1200px auto",
          filter: "brightness(0.7)",
        }}
      />
      {/* Fades out downward so the pattern never runs under the form itself. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.9) 65%, #000 100%)",
        }}
      />
    </div>
  );
}
