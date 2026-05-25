/* component/util · richText — shared bold-emphasis parser + renderer.

   Single source of truth for the in-component bold-emphasis system
   that originally lived (identically) inside MonitoringBlock,
   DiagnosticsBlock, OPATBlock, MechanismDrawer, DecisionAttribution-
   Drawer, and RegimenOptions. Wave 5 R2 consolidation — extracted to
   eliminate the six-fold duplication tech-debt the UI audit surfaced.

   USAGE
     import { RichText } from "./util/richText.jsx";
     <RichText text="Order **AUC** vancomycin levels"
               accentColor="var(--ox)"
               accentBg="rgba(15, 76, 129, 0.08)" />

   Honors the same shape every call site used:
     - parseBold splits on the bold-emphasis pattern with double-star
       delimiters and a greedy non-star body group.
     - Bold runs render bold + accentColor; optional accentBg pads
       them with 0 3px and rounds the corners.
     - Plain runs render unchanged.
     - Empty/non-string input returns [].

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";

export function parseBold(text) {
  if(!text) return [];
  const parts = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0, m;
  while((m = re.exec(text)) !== null) {
    if(m.index > last) parts.push({ text: text.slice(last, m.index), bold: false });
    parts.push({ text: m[1], bold: true });
    last = m.index + m[0].length;
  }
  if(last < text.length) parts.push({ text: text.slice(last), bold: false });
  return parts;
}

export function RichText({ text, accentColor, accentBg }) {
  return (
    <>
      {parseBold(text).map((p, i) => p.bold ? (
        <span key={i} style={{
          fontWeight: 700,
          color: accentColor || "inherit",
          background: accentBg || "transparent",
          padding: accentBg ? "0 3px" : 0,
          borderRadius: accentBg ? 3 : 0,
        }}>{p.text}</span>
      ) : <span key={i}>{p.text}</span>)}
    </>
  );
}
