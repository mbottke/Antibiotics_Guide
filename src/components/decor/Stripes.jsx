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
  return (
    <div
      aria-hidden="true"
      data-testid="stripes"
      data-variant={variant}
      className={className}
      style={{
        width,
        height,
        borderRadius: 8,
        pointerEvents: "none",
        background: `repeating-linear-gradient(${angle}deg, ${color} 0px, ${color} 3px, transparent 3px, transparent 9px)`,
        ...style,
      }}
    />
  );
}

export default Stripes;
