/* component · Sparkle — Wave 7 W7-A decorative glyph.

   A 4-point sparkle / diamond rendered as a single inline SVG path.
   12px by default so it sits inline with body type. We use it as a
   "premium" or "considered" marker — next to curated options, against
   the editorial hero subtitle, or after a regimen line that warrants
   visual emphasis without earning a chip.

   Shape: a four-pointed star, drawn as a closed path with the long
   axis vertical and the short axis horizontal. The vertices land on
   (12, 2), (22, 12), (12, 22), (2, 12) with the inflection points at
   (13.5, 10.5) etc — these inflections are what give the glyph its
   characteristic pinched waist.

   USAGE
     <Sparkle />
     <Sparkle size={16} color="var(--hot-magenta)" />
     <span>Considered <Sparkle /></span> */

import React from "react";

export function Sparkle({
  size = 12,
  color = "var(--neon-cyan, var(--ox))",
  className,
  style,
  ...rest
}) {
  /* Bad-prop tolerance — non-finite or non-positive size falls back to
     12 so a stray NaN doesn't render a 0x0 sparkle. */
  const safeSize = (typeof size === "number" && Number.isFinite(size) && size > 0) ? size : 12;
  return (
    <svg
      width={safeSize}
      height={safeSize}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      data-testid="sparkle"
      className={className}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        pointerEvents: "none",
        ...style,
      }}
      {...rest}
    >
      <path
        d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"
        fill={color}
      />
    </svg>
  );
}

export default Sparkle;
