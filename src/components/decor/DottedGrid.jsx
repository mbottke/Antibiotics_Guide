/* component · DottedGrid — Wave 7 W7-A decorative backdrop.

   A full-bleed dotted background, drawn with a single radial-gradient
   tiled at a configurable size. Designed to live behind hero content
   (`position: absolute; inset: 0`) and add quiet texture without
   stealing focus from the typography on top.

   The dot is rendered as a 1px radial mark on transparent so the page
   background colour bleeds through — this is what keeps it from
   reading like graph paper. Default opacity 0.5 dampens it further so
   the grid only registers as "atmosphere".

   USAGE
     <div style={{ position: "relative" }}>
       <DottedGrid />
       <Hero />
     </div>

     <DottedGrid size={32} color="var(--neon-cyan)" opacity={0.35} /> */

import React from "react";

export function DottedGrid({
  size = 24,
  color = "var(--line)",
  opacity = 0.5,
  className,
  style,
}) {
  return (
    <div
      aria-hidden="true"
      data-testid="dotted-grid"
      data-size={size}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: `radial-gradient(circle at center, ${color} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        opacity,
        ...style,
      }}
    />
  );
}

export default DottedGrid;
