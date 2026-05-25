/* component · SectionGlyph — Wave 6 W6-B aesthetic ornamental marks.

   Tiny editorial-magazine fleurons that sit beside each section's
   kicker label. Each glyph is a small (16×16) inline SVG with a
   theme keyed to the existing answer-canvas layer groups:

     core      — filled oxblood diamond ("heart of the matter")
     risks     — outline triangle + dot (the alert archetype)
     duration  — concentric arcs + radial tick (the 48–72 h clock)
     local     — 4-point compass rose (orientation, place)
     special   — italic-ampersand flourish ("edge case worth attention")
     evidence  — small open book glyph (two leaves + spine)

   All marks share a 1.4 px stroke weight, the same oxblood family
   (`var(--ox)` by default), and sit centered within a 16×16 viewbox.
   They render with `aria-hidden="true"` because they're decorative —
   the kicker text carries the semantic load.

   Opt-in adoption from Section.jsx happens in a follow-up integrator
   commit; this module only defines the shape so the design language
   layer can stabilize independently.

   USAGE
     <SectionGlyph group="core" />
     <SectionGlyph group="duration" size={18} />
     <SectionGlyph group="risks" color="var(--ox-deep)" />

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";

/* Shared stroke weight + viewbox keep the family visually coherent. */
const SW = 1.4;
const VB = "0 0 16 16";

function CoreGlyph({ stroke }) {
  /* Filled oxblood diamond — an 8×8 rotated square, centered.
     Drawn as a polygon so the corners stay crisp at 16 px. */
  return (
    <polygon
      points="8,2 14,8 8,14 2,8"
      fill={stroke}
      stroke="none"
    />
  );
}

function RisksGlyph({ stroke }) {
  /* Outline triangle with a single inner dot — the alert archetype
     reduced to two elements. Apex up, base balanced. */
  return (
    <g fill="none" stroke={stroke} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round">
      <polygon points="8,2.5 14,13.5 2,13.5" />
      <circle cx="8" cy="10.5" r="0.85" fill={stroke} stroke="none" />
    </g>
  );
}

function DurationGlyph({ stroke }) {
  /* Two concentric arcs forming the bottom half of a clock face,
     with a small radial tick at the right edge — evokes time and
     the 48–72 h reassessment moment. */
  return (
    <g fill="none" stroke={stroke} strokeWidth={SW} strokeLinecap="round">
      <path d="M2.5 8 A 5.5 5.5 0 0 0 13.5 8" />
      <path d="M5 8 A 3 3 0 0 0 11 8" />
      <line x1="13.5" y1="8" x2="14.6" y2="8" />
    </g>
  );
}

function LocalGlyph({ stroke }) {
  /* 4-point compass rose: the vertical arm is longest (true north
     reading) and a small center dot anchors the cross. */
  return (
    <g fill="none" stroke={stroke} strokeWidth={SW} strokeLinecap="round">
      <line x1="8" y1="1.5" x2="8" y2="6.5" />
      <line x1="8" y1="9.5" x2="8" y2="14" />
      <line x1="2.5" y1="8" x2="6.5" y2="8" />
      <line x1="9.5" y1="8" x2="13.5" y2="8" />
      <circle cx="8" cy="8" r="0.9" fill={stroke} stroke="none" />
    </g>
  );
}

function SpecialGlyph({ stroke }) {
  /* Italicized ampersand-arc — a single flourish curve with a small
     terminal dot. Reads as "edge case worth your attention" without
     leaning on a warning archetype. */
  return (
    <g fill="none" stroke={stroke} strokeWidth={SW} strokeLinecap="round">
      <path d="M4.5 13.2 C 4.5 9.2, 11.5 9.2, 11.5 6.4 C 11.5 3.6, 7.5 3.2, 6.5 5.8 C 5.5 8.4, 9.5 11, 12 13.2" />
      <circle cx="12.2" cy="13.4" r="0.85" fill={stroke} stroke="none" />
    </g>
  );
}

function EvidenceGlyph({ stroke }) {
  /* Open-book glyph: two leaves (paths arcing down) split by a short
     vertical spine. Reads as "consult the source." */
  return (
    <g fill="none" stroke={stroke} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 4.5 C 4 4, 6.5 4, 8 5 C 9.5 4, 12 4, 13.5 4.5 L 13.5 12 C 12 11.5, 9.5 11.5, 8 12.5 C 6.5 11.5, 4 11.5, 2.5 12 Z" />
      <line x1="8" y1="5" x2="8" y2="12.5" />
    </g>
  );
}

const GLYPHS = {
  core: CoreGlyph,
  risks: RisksGlyph,
  duration: DurationGlyph,
  local: LocalGlyph,
  special: SpecialGlyph,
  evidence: EvidenceGlyph,
};

export function SectionGlyph({ group, size = 16, color, ...rest }) {
  const Glyph = GLYPHS[group];
  if (!Glyph) return null;
  const stroke = color || "var(--ox)";
  return (
    <svg
      data-testid={`section-glyph-${group}`}
      data-group={group}
      width={size}
      height={size}
      viewBox={VB}
      aria-hidden="true"
      focusable="false"
      style={{ color: stroke, display: "inline-block", verticalAlign: "middle", flex: "0 0 auto" }}
      {...rest}
    >
      <Glyph stroke={stroke} />
    </svg>
  );
}

export default SectionGlyph;
