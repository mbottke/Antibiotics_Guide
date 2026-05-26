/* component · DecisionAttributionDrawer — Wave 5 PR-14
   Wave 8 W8 chrome pass — full-takeover drawer with cyan top-strip,
   asymmetric 24/4 radius, large italic-serif title, glassmorphic
   backdrop blur, and a pill close button with ripple.

   Wave 10 W10 atomized internals pass — the body now reads as a
   step-card stack: the "Why this fired" reason becomes a
   .rx-glass-diffuse stepped card with a 64px italic-serif outline
   numeral, mono small-caps rule/ctx predicate, and a 2px gradient
   cyan→transparent rail running down the left edge; the citation
   chip wears the chrome year-chip treatment; the mechanism link
   gets a <Sparkle> + cyan accent; the final summary line is a
   <NotchedBanner severity="info"> so the closing read sits as a
   distinct editorial coda. Overlay scrim swapped to mercury-backdrop
   + soft cyan glow-trail entrance (reduced-motion gated).

   "Trace this decision" drawer that opens from every refinement-step
   FootMark in the Answer Canvas. The user clicks the small numbered
   superscript next to a refined agent and gets the full attribution:

     • what rule fired (eliminate / substitute / flag / note)
     • why (the rule's authored reason text)
     • the patient ctx that triggered it (when matchCtx-bearing)
     • the evidence citation chip (mono / stew / trial reference)
     • severity grade
     • a link out to the mechanism drawer when the rule references
       a drug class or resistance vocabulary

   Renders nothing when `open` is false or `step` is null. Closes on
   Escape, click-outside, and the explicit close button.

   SEVERITY VOCABULARY · two-grammar architecture
   ----------------------------------------------
   This drawer uses (high / med / low) — the engine-native severity
   grammar produced by refineRegimen in src/engines/regimen.js.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, BookOpen, CheckCircle2, Crosshair, Info, X } from "lucide-react";
import { RichText as _RichText } from "./util/richText.jsx";
import { useFocusTrap } from "./util/useFocusTrap.js";
import { useRipple } from "./util/useRipple.js";
import { useReducedMotion } from "./util/useReducedMotion.js";
import { MeshWash } from "./decor/MeshWash.jsx";
import { GradientHairline } from "./decor/GradientHairline.jsx";
import { NotchedBanner } from "./decor/NotchedBanner.jsx";
import { Sparkle } from "./decor/Sparkle.jsx";

/* Cyan-gradient top strip — same gradient as MechanismDrawer so the
   two drawers feel like part of one chrome system. */
const TOP_STRIP_BG =
  "linear-gradient(90deg," +
  " var(--neon-cyan, var(--ox))," +
  " var(--electric-blue, var(--ox))," +
  " var(--hot-magenta, var(--ox)))";

const HAIRLINE_BG =
  "linear-gradient(90deg," +
  " transparent 0%," +
  " rgba(0, 212, 255, 0.45) 18%," +
  " rgba(61, 122, 255, 0.45) 50%," +
  " rgba(255, 61, 188, 0.30) 82%," +
  " transparent 100%)";

function _ruleTone(type, sev) {
  if(type === "eliminate") return { color: "var(--red)", bg: "var(--red-soft)", line: "var(--red-line)", label: "Eliminate", Icon: AlertTriangle };
  if(type === "substitute") return { color: "var(--ox)", bg: "var(--ox-soft)", line: "var(--ox-line)", label: "Substitute", Icon: Crosshair };
  if(type === "flag")      return { color: "var(--amber)", bg: "var(--amber-soft)", line: "var(--amber-line)", label: "Flag", Icon: AlertTriangle };
  return { color: "var(--ink2)", bg: "var(--paper2)", line: "var(--line)", label: "Note", Icon: Info };
}

function _sevTone(sev) {
  if(sev === "high") return { color: "var(--red)", label: "HIGH" };
  if(sev === "med")  return { color: "var(--amber)", label: "MEDIUM" };
  return { color: "var(--ink2)", label: "LOW" };
}

const CITE_LABEL = {
  mono: "Drug monograph / IDSA guidance",
  stew: "Antimicrobial stewardship principle",
  trial: "Clinical trial",
};

/* Map citation source to a pseudo-year label for the chrome year-chip
   treatment — the bibliography flair the W10 vocabulary calls for. */
const CITE_YEAR_HINT = {
  mono: "REF",
  stew: "PRIN",
  trial: "RCT",
};

function CloseButton({ onClose, label }) {
  const ref = useRef(null);
  useRipple(ref);
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClose}
      aria-label={label}
      className="rx-magnetic rx-shine-sweep rx-ripple rx-focus-halo"
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: "rgba(0, 212, 255, 0.06)",
        border: "1px solid var(--neon-cyan-line, var(--ox-line))",
        borderRadius: 999,
        padding: "5px 12px 5px 10px", cursor: "pointer",
        color: "var(--ink)",
        fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
        letterSpacing: ".08em", textTransform: "uppercase",
        transition: "background .18s, color .18s, border-color .18s",
      }}
    >
      <X size={12} aria-hidden /> Close
    </button>
  );
}

/* The "stepped" reason card — a glass-diffuse panel with a 64px italic
   outline numeral painted in the top-left, the rule label in mono small
   caps, and the reason text in editorial body. A 2px gradient rail
   runs the full vertical height on the left, suggesting "this is one
   step in a chain" even though the drawer surfaces a single step. */
function ReasonStepCard({ rule, reason, ctx }) {
  return (
    <div
      className="rx-glass-diffuse"
      style={{
        position: "relative",
        borderRadius: "14px 4px 14px 4px",
        padding: "16px 18px 18px 28px",
        marginBottom: 16,
        overflow: "hidden",
      }}
    >
      {/* 2px gradient rail running floor-to-ceiling on the left. */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0, top: 0, bottom: 0, width: 2,
          background:
            "linear-gradient(180deg," +
            " var(--neon-cyan, var(--ox))," +
            " var(--electric-blue, var(--ox)) 35%," +
            " transparent 100%)",
        }}
      />
      {/* 64px outline numeral — cyan-toned via -webkit-text-stroke. */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 14, top: -6,
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontSize: 64,
          fontWeight: 500,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          color: "transparent",
          WebkitTextStroke: "1px var(--neon-cyan, var(--ox))",
          opacity: 0.42,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        1
      </span>
      <div style={{
        fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
        color: rule.color, letterSpacing: ".14em",
        textTransform: "uppercase", marginBottom: 10,
        display: "inline-flex", alignItems: "center", gap: 6,
      }}>
        <rule.Icon size={11} color={rule.color} aria-hidden />
        {rule.label} · Why this fired
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink)" }}>
        <_RichText text={reason || ""} accentColor={rule.color} />
      </div>
      {ctx && (
        <div style={{
          marginTop: 10,
          fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 600,
          color: "var(--ink2)", letterSpacing: ".06em",
          textTransform: "uppercase",
          background: "rgba(255, 255, 255, 0.45)",
          border: "1px solid var(--line)",
          borderRadius: "8px 2px 8px 2px",
          padding: "6px 9px",
        }}>
          <span style={{ opacity: 0.62 }}>ctx ▸ </span>{ctx}
        </div>
      )}
    </div>
  );
}

/* Chrome citation chip — italic-serif cyan year-style label on the
   left, mono uppercase source label on the right. */
function CitationChip({ cite }) {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "stretch",
      gap: 0,
      border: "1px solid var(--neon-cyan-line, var(--ox-line))",
      borderRadius: "10px 3px 10px 3px",
      overflow: "hidden",
      background: "rgba(0, 212, 255, 0.04)",
    }}>
      <span style={{
        display: "inline-flex", alignItems: "center",
        padding: "6px 10px",
        fontFamily: "var(--serif)",
        fontStyle: "italic",
        fontSize: 16,
        fontWeight: 500,
        color: "var(--neon-cyan, var(--ox))",
        letterSpacing: "-0.02em",
        background: "rgba(0, 212, 255, 0.10)",
        borderRight: "1px solid var(--neon-cyan-line, var(--ox-line))",
        textShadow: "0 0 10px rgba(0,212,255,.25)",
      }}>
        {CITE_YEAR_HINT[cite] || "·"}
      </span>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 12px",
        fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 700,
        letterSpacing: ".10em", textTransform: "uppercase",
        color: "var(--ink)",
      }}>
        <CheckCircle2 size={12} color="var(--neon-cyan, var(--ox))" aria-hidden />
        {CITE_LABEL[cite] || cite}
      </span>
    </div>
  );
}

function DecisionAttributionDrawer({ step, open, onClose, onOpenMechanism }) {
  const dialogRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if(!open) return;
    const onKey = (e) => { if(e.key === "Escape") onClose && onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // WCAG 2.4.3 / 2.1.2 — trap focus inside open dialog, restore on close.
  useFocusTrap(dialogRef, open && !!step);

  if(!open || !step) return null;

  const rule = _ruleTone(step.type, step.sev);
  const sev  = _sevTone(step.sev);

  /* When the step's reason mentions a known resistance / class vocab,
     the drawer surfaces a "Read the mechanism" button that calls back
     up to the canvas to open the MechanismDrawer with the right key. */
  const reasonText = step.reason || "";
  const MECH_HINTS = [
    "ESBL", "AmpC", "KPC", "Metallo-β-lactamase", "MBL", "NDM", "VIM",
    "MRSA", "PBP2a", "VRE", "vanA", "Daptomycin",
  ];
  const mechMatch = MECH_HINTS.find(h => reasonText.toLowerCase().includes(h.toLowerCase()));

  const panelStyle = {
    background: "var(--paper)",
    border: "1px solid var(--line)",
    /* Asymmetric 24/4 radius — the defining shape of every W8 drawer. */
    borderRadius: "24px 4px 24px 4px",
    width: "min(80vw, 880px)",
    maxHeight: "88vh",
    overflowY: "auto",
    padding: "26px 28px 24px",
    boxShadow: "var(--shadow-drawer)",
    outline: "none",
    position: "relative",
  };

  /* Wave 5 PR-14 fix: render through React portal so the overlay lives
     at document.body, not inside whatever interactive ancestor (e.g.,
     OptionCard <button>) is mounting the trigger. */
  const drawerTree = (
    <div
      role="dialog"
      aria-label={`Decision attribution · ${rule.label}`}
      aria-modal="true"
      onClick={(e) => { e.stopPropagation(); if(onClose) onClose(); }}
      className="rx-mercury-backdrop"
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "6vh 16px",
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        data-testid="decision-attribution-drawer"
        className={reducedMotion ? "" : "rx-glow-trail rx-fade-in-up"}
        style={panelStyle}
      >
        {/* 4px cyan-gradient top strip. */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0, right: 0, top: 0,
            height: 4,
            background: TOP_STRIP_BG,
            borderTopLeftRadius: 24,
            pointerEvents: "none",
          }}
        />

        {/* Wave 9 W9 · molten-chrome band behind the drawer header band. */}
        <MeshWash
          variant="band"
          intensity="normal"
          palette="cyan-magenta-lime"
        />
        {/* Header — mono kicker + rule/sev badges, then italic-serif title. */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 16,
          position: "relative",
          zIndex: 1,
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
              flexWrap: "wrap",
            }}>
              <rule.Icon size={14} color={rule.color} aria-hidden />
              <span style={{
                fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700,
                color: "var(--ink2)", letterSpacing: ".14em",
                textTransform: "uppercase",
              }}>
                Trace this decision
              </span>
              <span style={{
                fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700,
                letterSpacing: ".08em", textTransform: "uppercase",
                color: "#fff", background: rule.color,
                padding: "2px 7px", borderRadius: 4,
              }}>
                {rule.label}
              </span>
              <span style={{
                fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700,
                letterSpacing: ".08em", textTransform: "uppercase",
                color: sev.color, background: "transparent",
                border: "1px solid " + sev.color,
                padding: "1px 6px", borderRadius: 4,
              }}>
                {sev.label}
              </span>
            </div>
            <h2 style={{
              /* Big italic-serif title — agent → replacement. The "→"
                  is part of the editorial flow, not a separator. */
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              fontSize: "clamp(24px, 3.2vw, 40px)",
              fontWeight: 500,
              color: "var(--ink)",
              margin: 0,
              letterSpacing: "-0.012em",
              lineHeight: 1.1,
            }}>
              {step.agent}
              {step.replacement && (
                <>
                  <span style={{
                    color: "var(--neon-cyan, var(--ox))",
                    fontWeight: 500,
                    fontStyle: "normal",
                    margin: "0 8px",
                  }}>→</span>
                  {step.replacement}
                </>
              )}
            </h2>
          </div>
          <CloseButton onClose={onClose} label="Close decision attribution" />
        </div>

        {/* Hairline gradient under the header. */}
        <span
          aria-hidden="true"
          style={{
            display: "block",
            height: 1,
            background: HAIRLINE_BG,
            margin: "0 0 18px",
          }}
        />

        {/* Reason · stepped glass-diffuse card with the outline numeral +
            left rail. The reason is the editorial centerpiece of the drawer. */}
        <ReasonStepCard rule={rule} reason={step.reason} ctx={step.ctx} />

        {/* Citation chip — when the rule was tagged with one */}
        {step.cite && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
              color: "var(--ink2)", letterSpacing: ".12em",
              textTransform: "uppercase", marginBottom: 8,
            }}>
              Evidence anchor
            </div>
            <CitationChip cite={step.cite} />
          </div>
        )}

        {/* Mechanism link — when the reason text mentions a known mechanism.
            Sparkle leads the label so the cross-link reads as "considered /
            curated", not as a generic button. */}
        {mechMatch && onOpenMechanism && (
          <div style={{ marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => { onOpenMechanism(mechMatch); }}
              className="rx-magnetic rx-shine-sweep rx-focus-halo"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 700,
                letterSpacing: ".08em", textTransform: "uppercase",
                color: "var(--ink)",
                background: "rgba(0, 212, 255, 0.08)",
                border: "1px solid var(--neon-cyan-line, var(--ox-line))",
                padding: "7px 13px",
                borderRadius: "10px 3px 10px 3px",
                cursor: "pointer",
                transition: "background .18s, border-color .18s",
              }}
            >
              <Sparkle size={12} color="var(--neon-cyan, var(--ox))" />
              <BookOpen size={12} aria-hidden />
              Read the mechanism · <span style={{ color: "var(--neon-cyan, var(--ox))" }}>{mechMatch}</span>
            </button>
          </div>
        )}

        {/* Inter-section hairline before the closing coda. */}
        <GradientHairline variant="cyan-blue" style={{ margin: "18px 0 14px" }} />

        {/* Closing editorial coda — surfaces the rule label + severity
            as a NotchedBanner so the drawer reads as "you traced a
            decision; here is the takeaway in one industrial label". */}
        <NotchedBanner
          severity="info"
          label={`${rule.label} · ${sev.label}`}
          secondary="Decision trace · captured in your case"
        />
      </div>
    </div>
  );

  if(typeof document === "undefined") return drawerTree;
  return createPortal(drawerTree, document.body);
}

export { DecisionAttributionDrawer };
