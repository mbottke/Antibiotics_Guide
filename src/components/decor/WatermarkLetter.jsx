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

import React, { useRef } from "react";
import { useParallaxScroll } from "../util/useParallaxScroll.js";

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
  parallax = 0.2,
  className,
  style,
}) {
  const pos = POS[position] || POS["top-right"];
  const ref = useRef(null);
  /* Bad-prop tolerance — non-finite size/opacity/parallax fall back to
     defaults so a downstream typo (NaN, null) can't break layout. */
  const safeSize = (typeof size === "number" && Number.isFinite(size) && size > 0) ? size : 240;
  const safeOpacity = (typeof opacity === "number" && Number.isFinite(opacity)) ? opacity : 0.08;
  const safeParallax = (typeof parallax === "number" && Number.isFinite(parallax)) ? parallax : 0.2;
  // Wave 9 · z-axis parallax. Watermark drifts opposite to scroll for an
  // editorial depth effect. parallax=0 disables. Reduced-motion no-ops in
  // the hook itself.
  useParallaxScroll(ref, { speed: safeParallax });
  return (
    <span
      ref={ref}
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
        fontSize: safeSize,
        lineHeight: 1,
        color,
        opacity: safeOpacity,
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
