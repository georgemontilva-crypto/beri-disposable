/**
 * Ambient colour glow that rises from the bottom of the page and drifts through
 * the hue wheel.
 *
 * Built from two nested elements on purpose: `transform` and `filter` are
 * separate animatable properties, and running both on one element means every
 * keyframe has to restate the other. Splitting them lets the drift and the
 * colour cycle run at different speeds without interfering.
 *
 * Fixed rather than absolute so the glow stays anchored to the viewport while
 * the page scrolls, which reads as light in the room rather than a decal stuck
 * to the document.
 */
export default function AuroraGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="aurora-hue absolute inset-0">
        <div className="aurora-drift absolute -bottom-[35vh] left-1/2 h-[110vh] w-[150vw] -translate-x-1/2 rounded-[50%]" />
      </div>
    </div>
  );
}
