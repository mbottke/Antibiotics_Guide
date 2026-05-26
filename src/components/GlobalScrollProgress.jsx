/* component · GlobalScrollProgress — Wave 8 W8 chrome aesthetic pass.

   A 2px viewport-fixed cyan-gradient progress strip painted along the
   very top edge of the page. It fills horizontally as the user scrolls
   from the top of the document toward the bottom — giving every
   surface (bedside, reference, outpatient) a continuous "where am I in
   this page?" cue.

   The strip is *purely decorative*: it carries `aria-hidden="true"`,
   `pointer-events: none`, and `position: fixed; top: 0; left: 0` so it
   never participates in tab order or hit-testing.

   The rAF-coalesced `useScrollProgress` hook drives the width. On
   `prefers-reduced-motion: reduce` the global stylesheet collapses the
   `width` transition to 0.01ms, so the strip still tracks the scroll —
   it just snaps instantly instead of easing.

   USAGE

     <GlobalScrollProgress />     // mount once near the root of every shell

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { useScrollProgress } from "./util/useScrollProgress.js";
import { useReducedMotion } from "./util/useReducedMotion.js";

/* The gradient matches every other chrome accent: cyan → electric-blue →
   hot-magenta. A graceful fallback to var(--ox) keeps the strip visible
   on branches that haven't merged the neon tokens yet. */
const STRIP_GRADIENT =
  "linear-gradient(90deg," +
  " var(--neon-cyan, var(--ox))," +
  " var(--electric-blue, var(--ox))," +
  " var(--hot-magenta, var(--ox)))";

function GlobalScrollProgress({ zIndex = 9999, height = 2 }) {
  const { progress } = useScrollProgress(0);
  /* Bug fix · the strip is mounted outside .rx-root in the outpatient
     surface (App.jsx returns the strip as a sibling to OutpatientShell)
     so the global .rx-root * { transition-duration: 0.01ms } reduced-
     motion clamp does NOT collapse the inline 60ms width transition.
     Honor the preference at the component level so the strip snaps
     instantly under reduced-motion regardless of mount context. */
  const reducedMotion = useReducedMotion();

  /* Hide the strip when there is nothing to scroll. Otherwise a
     full-width strip would paint at 0% and just look like a dead
     hairline along the top of every page. */
  const widthPct = Math.max(0, Math.min(100, progress * 100));
  const opacity = widthPct > 0.5 ? 0.9 : 0;

  return (
    <div
      aria-hidden="true"
      data-testid="rx-global-scroll-progress"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height,
        width: widthPct + "%",
        background: STRIP_GRADIENT,
        opacity,
        zIndex,
        pointerEvents: "none",
        transition: reducedMotion
          ? "none"
          : "width 60ms linear, opacity 200ms var(--ease-out, ease-out)",
        /* The strip itself carries a subtle outer glow so it reads as a
           "live" element rather than a static border. Tuned low enough
           that it never competes with editorial type below. */
        boxShadow: "0 0 12px rgba(0, 212, 255, 0.45)",
      }}
    />
  );
}

export { GlobalScrollProgress };
export default GlobalScrollProgress;
