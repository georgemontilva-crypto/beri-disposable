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
      {/* Left source. Centred on the very edge of the viewport, so only its
          inner half is visible and it reads as light coming from off-screen. */}
      <div className="aurora-hue absolute inset-0">
        <div className="aurora-drift absolute -bottom-[30vh] left-0 h-[110vh] w-[95vw] -translate-x-1/2 rounded-[50%]" />
      </div>

      {/* Right source. Every timing is deliberately coprime with the left one
          and offset by a negative delay, so the two never line up and the pair
          never reads as a repeating loop. */}
      <div className="aurora-hue-2 absolute inset-0">
        <div className="aurora-drift-2 absolute -bottom-[26vh] left-full h-[100vh] w-[95vw] -translate-x-1/2 rounded-[50%]" />
      </div>
    </div>
  );
}
