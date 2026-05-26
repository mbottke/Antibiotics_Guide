/* component · AsymmetricCard — Wave 7 W7-A decorative shape.

   A card wrapper with intentionally asymmetric corner radii. The eye
   reads a 16/4/16/4 corner pattern as "designed", not "default" — the
   trick is borrowed from product surfaces that want to feel handmade
   without resorting to skeuomorphism. We use it for hero callouts and
   for the "considered choice" panels where a stock rounded-rect would
   undersell the editorial pedigree of the underlying content.

   Patterns
     tl-br     top-left + bottom-right sharp (4px), opposites soft (16px)
     tr-bl     mirror — top-right + bottom-left sharp
     all-soft  fully symmetric 16px (escape hatch for parity layouts)

   Elevation prop maps directly onto the existing `--shadow-eN` tokens
   so the card sits in the established elevation system. Defaults
   match the rest of the cards module (border + panel background).

   USAGE
     <AsymmetricCard>{children}</AsymmetricCard>
     <AsymmetricCard pattern="tr-bl" elevation="e2">{children}</AsymmetricCard>
     <AsymmetricCard pattern="all-soft" style={{ padding: 24 }}>{children}</AsymmetricCard> */

import React from "react";

const PATTERN = {
  // top-left / top-right / bottom-right / bottom-left
  "tl-br": "4px 16px 4px 16px",
  "tr-bl": "16px 4px 16px 4px",
  "all-soft": "16px 16px 16px 16px",
};

export function AsymmetricCard({
  pattern = "tl-br",
  elevation = "e1",
  children,
  className,
  style,
  ...rest
}) {
  const borderRadius = PATTERN[pattern] || PATTERN["tl-br"];
  return (
    <div
      data-pattern={pattern}
      data-elevation={elevation}
      className={className}
      style={{
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderRadius,
        boxShadow: `var(--shadow-${elevation})`,
        padding: 16,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export default AsymmetricCard;
