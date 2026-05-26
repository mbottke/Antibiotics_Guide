/* component · PatientContextStrip — Wave 6 W6-B aesthetic.

   A kinetic row of designed pill chips for the bedside answer canvas
   patient-context bar. Replaces the previous flat run-on string
   ("Sepsis · 72M, CrCl 35, risks MRSA, Pseudomonas, severe β-lactam
   allergy") with a row of distinct, color-coded chips — each piece of
   context is its own pill, tone-mapped to its clinical channel:

     • primary (oxblood) — neutral identifying facts (age/sex)
     • caution (amber)   — actionable but not stop-the-world (CrCl,
                           low-risk allergy, ESBL risk)
     • alert   (red)     — required-action flags (severe allergy,
                           MRSA, Pseudomonas, severe / shock)
     • neutral (paper)   — informational, no special handling
     • info    (blue)    — evidence / annotation provenance

   Parent (AnswerCanvas) builds the chips array — this component is a
   pure renderer with no clinical logic, no parsing, no derivation.

   USAGE
     <PatientContextStrip
       chips={[
         { label: "72M",          tone: "primary",  icon: User },
         { label: "CrCl 35",      tone: "caution",  icon: Activity },
         { label: "MRSA",         tone: "alert",    icon: ShieldAlert },
         { label: "Pseudomonas",  tone: "alert" },
         { label: "Severe β-lactam allergy", tone: "alert" },
       ]}
       eyebrow="Patient"
     />

   DESIGN INTENT
     Each chip is an inline-flex pill with a soft inner highlight
     (inset 0 1px 0 rgba(255,255,255,.5)) over the e0 shadow, a
     hairline tonal border, and a 1px lift on hover. The label uses
     IBM Plex Mono at 11px / 700 / .04em for tabular-numeric
     legibility under the clinician's eye-line. Each chip should feel
     like a designed object, not a generic span.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";

/* Tone palette — each row maps a logical channel to existing tokens.
   The `info` row uses hex fallbacks until the evidence-blue tokens
   (`--evidence-blue*`) land from the sibling palette agent. When they
   do, swap the hex literals for `var(--evidence-blue)` etc.; the
   contract here is "tone → {text, bg, line}", nothing more. */
const TONES = {
  primary: { text: "var(--ox)",   bg: "var(--ox-soft)",     line: "var(--ox-line)" },
  caution: { text: "var(--amber)", bg: "var(--amber-soft)",  line: "var(--amber-line)" },
  alert:   { text: "var(--red)",   bg: "var(--red-soft)",    line: "var(--red-line)" },
  neutral: { text: "var(--ink2)",  bg: "var(--paper2)",      line: "var(--line)" },
  info:    { text: "#1F4E7A",      bg: "#E8EEF5",            line: "#B5C8DA" },
};

/* Component-scoped CSS. Co-located so the chip's hover behavior travels
   with the file — no global stylesheet edit, no className contract
   with main. Idempotent injection: keyed by `data-pcs-styles`, only
   the first instance to render writes to <head>. */
const PCS_CSS = `
[data-pcs-chip] {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: none;
  white-space: nowrap;
  box-shadow: var(--shadow-e0), inset 0 1px 0 rgba(255,255,255,.5);
  transition:
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}
[data-pcs-chip]:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-e1), inset 0 1px 0 rgba(255,255,255,.5);
}
@media (prefers-reduced-motion: reduce) {
  [data-pcs-chip] { transition: none; }
  [data-pcs-chip]:hover { transform: none; }
}
`;

function ensurePcsStyles() {
  if (typeof document === "undefined") return;
  if (document.querySelector("style[data-pcs-styles]")) return;
  const tag = document.createElement("style");
  tag.setAttribute("data-pcs-styles", "");
  tag.textContent = PCS_CSS;
  document.head.appendChild(tag);
}

export function PatientContextStrip({
  chips = [],
  hideEmpty = false,
  eyebrow = "Patient",
  className,
  style,
  ...rest
}) {
  // Inject component styles once per document — no-op on subsequent renders.
  ensurePcsStyles();

  if (hideEmpty && (!chips || chips.length === 0)) return null;

  return (
    <div
      data-testid="patient-context-strip"
      className={className}
      style={{
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        alignItems: "center",
        ...style,
      }}
      {...rest}
    >
      {eyebrow && (
        <span
          data-testid="patient-context-eyebrow"
          style={{
            fontFamily: "var(--mono)",
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginRight: 4,
          }}
        >
          {eyebrow}
        </span>
      )}
      {chips.map((chip, i) => {
        const toneKey = chip.tone || "neutral";
        const tone = TONES[toneKey] || TONES.neutral;
        const Icon = chip.icon;
        return (
          <span
            key={`${chip.label}-${i}`}
            data-pcs-chip
            data-tone={toneKey}
            style={{
              color: tone.text,
              background: tone.bg,
              border: `1px solid ${tone.line}`,
            }}
          >
            {Icon && <Icon size={11} aria-hidden />}
            {chip.label}
          </span>
        );
      })}
    </div>
  );
}

export default PatientContextStrip;
