/* component · Stripes — Wave 7 W7-A decorative accent block.

   A small block of diagonal stripes rendered via repeating-linear-gradient.
   We use it as a section seam (think construction tape, but quiet) and
   as a "this is decoration, not content" marker on otherwise empty
   layout slots. The diagonal angle defaults to 135deg — the same
   direction as the brand's hex glyph stroke — so it ties back into
   the BrandMark's geometric vocabulary.

   Variants pick a single accent token. Stripes intentionally use only
   one colour against transparent gaps; multi-colour stripes feel
   carnival and pull focus away from the body content.

   USAGE
     <Stripes />                                  // 80x40 cyan
     <Stripes variant="magenta" width={120} />
     <Stripes variant="neutral" height={24} angle={45} /> */

import React from "react";

const ACCENT = {
  cyan: "var(--neon-cyan, var(--ox))",
  magenta: "var(--hot-magenta, var(--ox))",
  lime: "var(--electric-lime, var(--ox))",
  neutral: "var(--line)",
};

export function Stripes({
  variant = "cyan",
  angle = 135,
  width = 80,
  height = 40,
  className,
  style,
}) {
  const color = ACCENT[variant] || ACCENT.cyan;
  /* Bad-prop tolerance — non-finite numeric props fall back to defaults
     so a downstream typo (NaN, null, string) can't poison the CSS string. */
  const safeAngle = (typeof angle === "number" && Number.isFinite(angle)) ? angle : 135;
  const safeWidth = (typeof width === "number" && Number.isFinite(width) && width > 0) ? width : 80;
  const safeHeight = (typeof height === "number" && Number.isFinite(height) && height > 0) ? height : 40;
  return (
    <div
      aria-hidden="true"
      data-testid="stripes"
      data-variant={variant}
      className={className}
      style={{
        width: safeWidth,
        height: safeHeight,
        borderRadius: 8,
        pointerEvents: "none",
        background: `repeating-linear-gradient(${safeAngle}deg, ${color} 0px, ${color} 3px, transparent 3px, transparent 9px)`,
        ...style,
      }}
    />
  );
}

export default Stripes;
