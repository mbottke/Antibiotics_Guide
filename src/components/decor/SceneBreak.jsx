/* component · SceneBreak — Wave 12 W12 hierarchical breathing rooms.

   A magazine-feature "scene break" primitive that gives long-scrolling
   sections a sense of rhythm — a beat between epochs of content. Used
   between major content blocks where a single hairline would feel too
   thin but a section header would feel too loud.

   The bedside Answer Canvas can be 17 stacked layers deep; the reference
   panels can carry 40+ subsections. The SceneBreak is the unit of
   editorial pause we drop between clinical-reasoning epochs (empiric →
   escalation → reassessment → adjuncts → closure) so the reader feels
   a chapter wall before they crash into the next argument.

   VARIANTS

     numeral   — oversized 96–128px italic-serif numeral (chapter number),
                 low-opacity (0.4), centered with cyan gradient hairlines
                 extending left + right. Reads as "Chapter 02" without
                 saying the word.

     phrase    — a short italic-serif phrase ("on de-escalation" /
                 "what changes" / "evidence overlay") flanked by gradient
                 hairlines. The text carries the editorial framing.

     ornament  — a centered 32×32 SVG fleuron flanked by gradient
                 hairlines. Quiet, decorative; reads as "...the next
                 movement begins" without imposing semantics.

     minimal   — just a thin 1px gradient hairline at higher opacity
                 (0.6) with bumped vertical padding. The least-loud
                 variant — for spots where SceneBreak is rhythm only,
                 not statement.

   All variants render with role="presentation" + aria-hidden="true";
   the screen-reader graph treats them as pure decoration so they never
   interrupt the semantic flow of headings + landmarks.

   Animation (subtle fade-in of the central mark) is gated behind
   prefers-reduced-motion; the variant's static layout is identical
   either way.

   USAGE
     <SceneBreak variant="numeral" mark="02" />
     <SceneBreak variant="phrase" mark="on de-escalation" />
     <SceneBreak variant="phrase" kicker="Chapter" mark="evidence overlay" />
     <SceneBreak variant="ornament" />
     <SceneBreak variant="minimal" />

   Inpatient Antibiotic Guide — module graph documented in README.md. */

import React from "react";

/* Shared hairline gradient — cyan-blue at modest opacity. The left + right
   linework converges on the central mark from both sides. Stops are tuned
   so the line fades out near the mark rather than running into it. */
const HAIRLINE_LEFT =
  "linear-gradient(90deg, transparent 0%, var(--neon-cyan, var(--ox)) 60%, var(--electric-blue, var(--ox)) 100%)";
const HAIRLINE_RIGHT =
  "linear-gradient(90deg, var(--electric-blue, var(--ox)) 0%, var(--neon-cyan, var(--ox)) 40%, transparent 100%)";

function Hairline({ side, opacity = 0.5, height = 1 }) {
  /* The cyan-blue hairlines that flank the central mark. Side is purely
     a flag for which gradient direction to render; the visual is the
     same line gently fading toward the mark from either edge. */
  return (
    <span
      aria-hidden="true"
      style={{
        flex: 1,
        height,
        background: side === "left" ? HAIRLINE_LEFT : HAIRLINE_RIGHT,
        opacity,
        minWidth: 24,
      }}
    />
  );
}

function NumeralMark({ mark }) {
  /* The oversized italic-serif chapter numeral. 96–128px clamps to the
     viewport so on phones it scales down without crushing. Low opacity
     (0.4) keeps it from competing with the content that follows. */
  return (
    <span
      aria-hidden="true"
      data-testid="scene-break-mark-numeral"
      style={{
        fontFamily: "var(--serif)",
        fontStyle: "italic",
        fontWeight: 700,
        fontSize: "clamp(72px, 9vw, 128px)",
        lineHeight: 0.9,
        letterSpacing: "-.04em",
        color: "var(--neon-cyan, var(--ox))",
        opacity: 0.4,
        padding: "0 18px",
        userSelect: "none",
      }}
    >
      {mark || "·"}
    </span>
  );
}

function PhraseMark({ mark, kicker }) {
  /* A short italic-serif phrase (and optional uppercase mono kicker
     stacked above). The kicker offers a "Chapter / Epoch / Movement"
     framing word when the consumer wants it; it's optional. */
  return (
    <span
      data-testid="scene-break-mark-phrase"
      aria-hidden="true"
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        padding: "0 18px",
        color: "var(--ink2)",
      }}
    >
      {kicker ? (
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: "var(--neon-cyan, var(--ox))",
            opacity: 0.85,
          }}
        >
          {kicker}
        </span>
      ) : null}
      <span
        style={{
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: "clamp(15px, 1.6vw, 19px)",
          letterSpacing: "-.01em",
          lineHeight: 1.1,
          color: "var(--ink)",
          opacity: 0.78,
          whiteSpace: "nowrap",
        }}
      >
        {mark || "·"}
      </span>
    </span>
  );
}

function OrnamentMark() {
  /* A 32×32 SVG fleuron — a centered horizontal flourish with two
     opposing curls and a small diamond at the center. The shape is
     deliberately editorial-magazine (think the dingbat at a chapter
     change in a hardcover novel) and matches the cyan stroke family
     used by the existing SectionGlyph fleurons. */
  return (
    <svg
      data-testid="scene-break-mark-ornament"
      aria-hidden="true"
      width={32}
      height={32}
      viewBox="0 0 32 32"
      focusable="false"
      style={{ flex: "0 0 auto", margin: "0 14px", opacity: 0.85 }}
    >
      <g
        fill="none"
        stroke="var(--neon-cyan, var(--ox))"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Two opposing curls meeting at the center diamond. The curls
            taper outward and curl back in — a stylized fleuron flourish. */}
        <path d="M3 16 C 7 16, 9 13, 11 13 C 13 13, 14 15, 13.5 16" />
        <path d="M29 16 C 25 16, 23 19, 21 19 C 19 19, 18 17, 18.5 16" />
        {/* Center diamond — small filled mark anchoring the ornament. */}
        <polygon
          points="16,13 19,16 16,19 13,16"
          fill="var(--neon-cyan, var(--ox))"
          stroke="none"
        />
        {/* Subtle terminal dots at the outer ends of each curl. */}
        <circle cx="3" cy="16" r="0.9" fill="var(--neon-cyan, var(--ox))" />
        <circle cx="29" cy="16" r="0.9" fill="var(--neon-cyan, var(--ox))" />
      </g>
    </svg>
  );
}

/* Animation class — gentle fade-up of the central mark. Gated behind
   prefers-reduced-motion via the @media inside the injected style block
   below so the SceneBreak respects the system setting. The variant's
   geometry / layout is identical regardless of motion preference. */
const W12_CSS = `
[data-scene-break] [data-scene-break-mark] {
  opacity: 0;
  transform: translateY(4px);
  animation: rx-scene-break-in 520ms cubic-bezier(0.16,1,0.3,1) forwards;
}
@media (prefers-reduced-motion: reduce) {
  [data-scene-break] [data-scene-break-mark] {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
@keyframes rx-scene-break-in {
  to { opacity: 1; transform: translateY(0); }
}
`;
function _ensureSceneBreakStyles() {
  if (typeof document === "undefined") return;
  if (document.querySelector("style[data-scene-break-styles]")) return;
  const tag = document.createElement("style");
  tag.setAttribute("data-scene-break-styles", "");
  tag.textContent = W12_CSS;
  document.head.appendChild(tag);
}

const VARIANT_PADDING = {
  numeral: "36px 0",
  phrase: "30px 0",
  ornament: "28px 0",
  minimal: "32px 0",
};

export function SceneBreak({
  variant = "phrase",
  mark,
  kicker,
  className,
  style,
}) {
  _ensureSceneBreakStyles();

  const known = ["numeral", "phrase", "ornament", "minimal"].includes(variant)
    ? variant
    : "phrase";

  /* The minimal variant is a single thicker-opacity hairline with extra
     vertical padding. The other three slot a central mark between two
     converging hairlines. */
  if (known === "minimal") {
    return (
      <div
        role="presentation"
        aria-hidden="true"
        data-scene-break
        data-variant="minimal"
        className={className}
        style={{
          width: "100%",
          padding: VARIANT_PADDING.minimal,
          pointerEvents: "none",
          ...style,
        }}
      >
        <div
          data-scene-break-mark
          style={{
            height: 1,
            width: "100%",
            background: HAIRLINE_LEFT,
            opacity: 0.6,
          }}
        />
      </div>
    );
  }

  let centerMark = null;
  if (known === "numeral") centerMark = <NumeralMark mark={mark} />;
  else if (known === "ornament") centerMark = <OrnamentMark />;
  else centerMark = <PhraseMark mark={mark} kicker={kicker} />;

  return (
    <div
      role="presentation"
      aria-hidden="true"
      data-scene-break
      data-variant={known}
      className={className}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: VARIANT_PADDING[known],
        pointerEvents: "none",
        ...style,
      }}
    >
      <Hairline side="left" />
      <span data-scene-break-mark style={{ display: "inline-flex", alignItems: "center" }}>
        {centerMark}
      </span>
      <Hairline side="right" />
    </div>
  );
}

export default SceneBreak;
