/**
 * Publishes scroll progress as a hue on the document root.
 *
 * A single listener feeding one CSS variable, rather than each decorative
 * element wiring up its own scroll handler: the drips, the scrollbar and any
 * future scroll-tinted element all read `--scroll-hue` and stay in step for
 * free.
 */
import { useEffect } from "react";

export default function ScrollHue() {
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      // A full turn of the wheel across the page: top and bottom land on the
      // same hue, so returning to the top never looks like a jump.
      doc.style.setProperty("--scroll-hue", String(Math.round(progress * 360)));
    };

    // Scroll fires far more often than the screen refreshes; coalescing into
    // one rAF keeps this to a single style write per frame.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
