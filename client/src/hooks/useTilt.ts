import { useCallback, useRef } from "react";

/**
 * Subtle 3D tilt that follows the pointer across an element.
 *
 * The transform is written directly to the node inside a rAF rather than
 * through React state: a pointermove-driven setState would re-render the card
 * on every mouse event, and nothing about the card's markup changes.
 *
 * Disabled on coarse pointers, where there is no hover and a tap would leave
 * the card stuck at an angle.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(maxDeg = 7) {
  const ref = useRef<T | null>(null);
  const frame = useRef(0);

  const apply = useCallback((transform: string) => {
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      if (ref.current) ref.current.style.transform = transform;
    });
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<T>) => {
      const el = ref.current;
      if (!el || e.pointerType !== "mouse") return;
      const rect = el.getBoundingClientRect();
      // -0.5 … 0.5 from the centre of the card.
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      apply(
        // Y follows horizontal movement and X is inverted, so the corner under
        // the pointer lifts toward the viewer instead of away from them.
        `perspective(1100px) rotateX(${(-py * maxDeg).toFixed(2)}deg) rotateY(${(px * maxDeg).toFixed(2)}deg) translateY(-6px) scale(1.015)`
      );
    },
    [apply, maxDeg]
  );

  const onPointerLeave = useCallback(() => {
    apply("perspective(1100px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)");
  }, [apply]);

  return { ref, onPointerMove, onPointerLeave };
}
