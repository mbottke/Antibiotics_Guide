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

/* Mobile shrink — on viewports <=720px the watermark reads as decorative
   crowding rather than print confidence. Drop to ~96px and pull the
   anchor in 12px so it never bleeds past the section gutter. Scoped via
   a module-level <style> tag injected once so we don't need a global
   CSS edit. The class is added to every watermark span. */
const W_TRIM_CSS = `
@media (max-width: 720px) {
  [data-watermark-letter] {
    font-size: 96px !important;
    top: auto !important;
    bottom: auto !important;
    left: auto !important;
    right: auto !important;
  }
  [data-watermark-letter][data-position="top-right"]    { top: -12px !important; right: -4px !important; }
  [data-watermark-letter][data-position="top-left"]     { top: -12px !important; left: -4px !important; }
  [data-watermark-letter][data-position="bottom-right"] { bottom: -12px !important; right: -4px !important; }
  [data-watermark-letter][data-position="bottom-left"]  { bottom: -12px !important; left: -4px !important; }
}
`;
function _ensureWatermarkStyles() {
  if (typeof document === "undefined") return;
  if (document.querySelector("style[data-watermark-letter-styles]")) return;
  const tag = document.createElement("style");
  tag.setAttribute("data-watermark-letter-styles", "");
  tag.textContent = W_TRIM_CSS;
  document.head.appendChild(tag);
}

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
  _ensureWatermarkStyles();
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
      data-watermark-letter
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
