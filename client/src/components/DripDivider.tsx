/**
 * Liquid drips hanging from a section edge, tinted by scroll position.
 *
 * The shape is a single SVG path rather than a row of elements: drips need to
 * merge into the bar they hang from, and separate circles would show seams
 * where they meet.
 *
 * Colour comes from `--scroll-hue`, so the drips shift through the spectrum as
 * the visitor moves down the page without this component knowing anything about
 * scrolling.
 */
export default function DripDivider({
  flip = false,
  className = "",
}: {
  /** Hang the drips upward, for the top edge of a section. */
  flip?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`drip-divider pointer-events-none relative h-12 w-full ${className}`}
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      <svg
        viewBox="0 0 1200 48"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path
          className="drip-path"
          d="M0,0 H1200 V10
             C1180,10 1176,30 1160,30 C1144,30 1140,10 1120,10
             C1092,10 1086,42 1062,42 C1038,42 1032,10 1004,10
             C978,10 974,24 956,24 C938,24 934,10 908,10
             C876,10 870,38 844,38 C818,38 812,10 780,10
             C752,10 748,28 728,28 C708,28 704,10 676,10
             C644,10 638,44 610,44 C582,44 576,10 544,10
             C518,10 514,26 494,26 C474,26 470,10 442,10
             C410,10 404,36 378,36 C352,36 346,10 314,10
             C288,10 284,22 266,22 C248,22 244,10 216,10
             C184,10 178,40 152,40 C126,40 120,10 88,10
             C64,10 60,24 42,24 C24,24 20,10 0,10 Z"
        />
      </svg>
    </div>
  );
}
