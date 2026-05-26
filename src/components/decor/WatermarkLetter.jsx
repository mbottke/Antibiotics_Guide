/* component · WatermarkLetter — Wave 7 W7-A oversized character decoration.

   A massive italic serif letter rendered as a backdrop watermark in
   a section corner. The trick is borrowed from print editorial design
   — a dropped initial that has escaped its line and settled into the
   margin — and lends a section header a sense of confidence without
   adding chrome.

   Use sparingly: one per section, in the corner farthest from where
   the eye lands first (typically top-right of a left-aligned header).
   Default 240px tall, 8% opacity — large enough to register as
   structure, faint enough not to compete with body type.

   The element is absolutely positioned, so the parent must establish
   a positioning context. It's marked aria-hidden and user-select:none
   so it stays out of the accessibility tree and out of copy/paste.

   USAGE
     <section style={{ position: "relative" }}>
       <WatermarkLetter letter="S" />
       <h2>Syndromes</h2>
     </section>

     <WatermarkLetter letter="R" position="bottom-left" size={320} /> */

import React from "react";

const POS = {
  "top-right": { top: -32, right: -16 },
  "top-left": { top: -32, left: -16 },
  "bottom-right": { bottom: -32, right: -16 },
  "bottom-left": { bottom: -32, left: -16 },
};

export function WatermarkLetter({
  letter,
  size = 240,
  color = "var(--neon-cyan, var(--ox))",
  opacity = 0.08,
  position = "top-right",
  className,
  style,
}) {
  const pos = POS[position] || POS["top-right"];
  return (
    <span
      aria-hidden="true"
      data-testid="watermark-letter"
      data-position={position}
      className={className}
      style={{
        position: "absolute",
        ...pos,
        fontFamily: "var(--serif)",
        fontStyle: "italic",
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1,
        color,
        opacity,
        pointerEvents: "none",
        userSelect: "none",
        ...style,
      }}
    >
      {letter}
    </span>
  );
}

export default WatermarkLetter;
