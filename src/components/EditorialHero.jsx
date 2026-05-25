/* component · EditorialHero — Wave 6 W6-B aesthetic.

   The magazine-spread hero for the Answer Canvas in Bedside mode. This is
   the "stop and breathe" moment a clinician sees the second the answer
   composes: a serif display title big enough to land as a headline, the
   syndrome's `.line` set as an italic standfirst beneath it, the patient
   context laid out as tasteful chip pills, and a small action slot on
   the right. Designed in the spirit of a *New York Times* magazine
   front-page spread married to an Apple keynote slide — but for a
   serious bedside reference tool.

   Composition (left → right; stacks on narrow viewports):
     1. Mono kicker         "THE ANSWER · BEDSIDE" — oxblood, .22em
     2. Display headline    serif, 48-58px, the syndrome name
     3. Italic standfirst   serif italic, ~17px, the syndrome `.line`
     4. Patient byline      mono "PATIENT" eyebrow + chip row
     5. Edit affordance     right-aligned pencil button (slot)

   The block paints a faint oxblood radial-gradient in the upper-right
   corner (the magazine color block) over a top-tinted base gradient,
   adds a 3px oxblood vertical rule down the left edge of the headline
   stack (the magazine "rule"), and lifts on a shadow-e2 elevation
   inside a hairline ox-line border. The block also opts into the
   global `rx-reveal` cascade so the answer arrives with a slow,
   considered fade-rise.

   USAGE
     <EditorialHero
       syndromeName="Sepsis / septic shock"
       syndromeLine="Empiric pip-tazo within the first hour; narrow at 48 h."
       patientChips={[{ label:"72M", tone:"neutral" }, { label:"CrCl 35", tone:"ox" }]}
       riskLabels={["MRSA", "Pseudomonas"]}
       onEditCase={() => setEditing(true)}
     />

   The parent (AnswerCanvas) is responsible for building `patientChips`
   and `riskLabels` from caseState — the hero is a pure presentation
   surface and does no clinical computation.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useEffect, useState } from "react";
import { Pencil } from "lucide-react";

/* ---------- chip palette ----------
   Four tones, each mapping a chip into the existing token palette.
   `ox`  → active patient context (CrCl, age, risk that drives a change).
   `amber` → caution-grade risk (MRSA, ESBL, severe allergy non-severe path).
   `red`  → required-severity context (severe β-lactam allergy, septic shock).
   `neutral` → static demographic descriptors (age, sex). */
const CHIP_TONES = {
  ox:      { bg: "var(--ox-soft)",    border: "var(--ox-line)",    color: "var(--ox)" },
  amber:   { bg: "var(--amber-soft)", border: "var(--amber-line)", color: "var(--amber)" },
  red:     { bg: "var(--red-soft)",   border: "var(--red-line)",   color: "var(--red)" },
  neutral: { bg: "var(--paper2)",     border: "var(--line)",       color: "var(--ink2)" },
};

/* ---------- size-aware headline ----------
   Long syndrome strings ("Healthcare-associated ventriculitis and
   meningitis") would visually crash at the maximum 58px. We taper the
   display size in two steps based on rendered character count so the
   headline always lands as a one-line punch on a desktop hero and
   wraps gracefully on mobile. The mobile breakpoint reduces this
   further (handled in useNarrow + the inline media style). */
function pickHeadlineSize(name) {
  const n = (name || "").length;
  if (n <= 18) return 58;
  if (n <= 32) return 52;
  return 48;
}

/* ---------- narrow-viewport hook ----------
   The spec calls for inline media-query behavior at <640px without
   shipping a separate breakpoint object. A tiny `matchMedia` listener
   flips a boolean that the component reads when picking padding /
   headline / action-row layout. Guarded for SSR and for environments
   without matchMedia (older jsdom in tests). */
function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(max-width: 640px)");
    const onChange = () => setNarrow(mq.matches);
    onChange();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    // Older Safari fallback.
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);
  return narrow;
}

export function EditorialHero({
  syndromeName,
  syndromeLine,
  patientChips,
  riskLabels,
  onEditCase,
}) {
  const narrow = useNarrow();
  const headlineSize = narrow ? 36 : pickHeadlineSize(syndromeName);
  const chips = Array.isArray(patientChips) ? patientChips : [];
  const risks = Array.isArray(riskLabels) ? riskLabels : [];

  /* Padding ramp — generous on desktop, tight on mobile so the hero
     stays bold without crowding the chrome of narrow screens. */
  const padTop    = narrow ? 22 : 36;
  const padSide   = narrow ? 18 : 32;
  const padBottom = narrow ? 22 : 30;

  return (
    <section
      data-bedside-editorial-hero="true"
      className="rx-reveal"
      style={{
        position: "relative",
        overflow: "hidden",
        marginTop: 6, marginBottom: 18,
        padding: `${padTop}px ${padSide}px ${padBottom}px`,
        border: "1px solid var(--ox-line)",
        borderRadius: 18,
        boxShadow: "var(--shadow-e2)",
        // Base gradient: faint oxblood wash at the top, neutral paper toward
        // the bottom — a "page turn" feel borrowed from print spreads.
        background:
          "linear-gradient(180deg, var(--ox-softer) 0%, color-mix(in srgb, var(--paper) 88%, var(--ox-softer) 12%) 100%)",
      }}
    >
      {/* Decorative oxblood radial block in the upper-right — the
          magazine "color field" that anchors the headline diagonally.
          Pointer-events disabled; purely visual. Sits behind content via
          z-index 0 with the content stack at z-index 1. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          background:
            "radial-gradient(circle at 95% 20%, var(--ox-soft) 0%, transparent 38%)",
        }}
      />

      {/* Outer flex container: headline stack on the left, edit slot
          on the right. On narrow viewports the slot drops below the
          stack (column layout) so the headline keeps the full width. */}
      <div
        style={{
          position: "relative", zIndex: 1,
          display: "flex",
          flexDirection: narrow ? "column" : "row",
          alignItems: narrow ? "stretch" : "flex-start",
          justifyContent: "space-between",
          gap: narrow ? 18 : 20,
        }}
      >
        {/* HEADLINE STACK ------------------------------------------------- */}
        <div style={{ position: "relative", minWidth: 0, flex: 1, paddingLeft: narrow ? 14 : 18 }}>
          {/* Magazine left-rule — a 3px oxblood hairline running the full
              height of the headline + standfirst region. Anchored 20px
              from the top and 20px from the bottom of THIS column so it
              feels like a typographic mark rather than a full border.
              On narrow viewports the rule shortens proportionally. */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0, top: narrow ? 12 : 20, bottom: narrow ? 12 : 20,
              width: 3, borderRadius: 2,
              background: "var(--ox)",
            }}
          />

          {/* 1 · Mono kicker — small caps, oxblood, ~10px, .22em.
                 The label that orients a clinician at-a-glance: this
                 surface is "THE ANSWER · BEDSIDE", not a sidebar. */}
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: ".22em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "var(--ox)",
              marginBottom: 14,
            }}
          >
            The Answer · Bedside
          </div>

          {/* 2 · Display headline — the syndrome name. Serif, massive,
                 tight tracking, almost-1.0 leading. The showstopper. */}
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: headlineSize,
              fontWeight: 600,
              letterSpacing: "-.025em",
              lineHeight: 1.04,
              color: "var(--ink)",
              margin: 0,
            }}
          >
            {syndromeName}
          </h1>

          {/* 3 · Italic standfirst — the syndrome `.line`. One-sentence
                 framing; serif italic so it reads as the editorial deck
                 below the title. max-width ~62ch keeps the line length
                 inside the magazine zone. */}
          {syndromeLine && (
            <p
              style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: narrow ? 16 : 17.5,
                fontWeight: 400,
                lineHeight: 1.5,
                color: "var(--ink2)",
                margin: "14px 0 0",
                maxWidth: "62ch",
              }}
            >
              {syndromeLine}
            </p>
          )}

          {/* 4 · Patient byline — mono "PATIENT" eyebrow + chip row.
                 Chips reflect age + sex, CrCl, risk flags (MRSA /
                 Pseudomonas / ESBL / severe), allergy state. Each chip
                 is a pill in the tone the parent supplies; no clinical
                 logic lives here, just presentation. */}
          {(chips.length > 0 || risks.length > 0) && (
            <div style={{ marginTop: narrow ? 18 : 22 }}>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 9.5,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "var(--muted)",
                  marginBottom: 8,
                }}
              >
                Patient
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {chips.map((chip, i) => {
                  const tone = CHIP_TONES[chip.tone] || CHIP_TONES.neutral;
                  const Icon = chip.icon || null;
                  return (
                    <span
                      key={`chip-${i}`}
                      data-hero-chip-tone={chip.tone || "neutral"}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        fontFamily: "var(--mono)",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: ".06em",
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: tone.bg,
                        color: tone.color,
                        border: `1px solid ${tone.border}`,
                        boxShadow: "var(--shadow-e0)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {Icon ? <Icon size={11} aria-hidden /> : null}
                      {chip.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT-ALIGNED ACTIONS SLOT ------------------------------------
             Optional: the pencil "Edit" button only renders when the
             parent provides onEditCase. On narrow viewports the slot
             aligns left under the chip row; on desktop it aligns to
             the top-right as a precision-placed affordance. */}
        {onEditCase && (
          <div
            style={{
              flex: "0 0 auto",
              display: "flex",
              justifyContent: narrow ? "flex-start" : "flex-end",
              paddingTop: narrow ? 0 : 4,
            }}
          >
            <button
              type="button"
              onClick={onEditCase}
              title="Edit the case"
              aria-label="Edit case"
              className="rx-cta-glow"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--mono)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "var(--ox)",
                background: "var(--panel)",
                border: "1px solid var(--ox-line)",
                borderRadius: 999,
                padding: "7px 14px",
                cursor: "pointer",
                boxShadow: "var(--shadow-e1)",
                transition:
                  "box-shadow var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out)",
              }}
            >
              <Pencil size={11} aria-hidden />
              Edit case
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default EditorialHero;
