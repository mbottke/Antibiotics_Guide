/* component · DecisionAttributionDrawer — Wave 5 PR-14
   Wave 8 W8 chrome pass — full-takeover drawer with cyan top-strip,
   asymmetric 24/4 radius, large italic-serif title, glassmorphic
   backdrop blur, and a pill close button with ripple.

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

function CloseButton({ onClose, label }) {
  const ref = useRef(null);
  useRipple(ref);
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClose}
      aria-label={label}
      className="rx-magnetic rx-shine-sweep rx-ripple"
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

function DecisionAttributionDrawer({ step, open, onClose, onOpenMechanism }) {
  const dialogRef = useRef(null);

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
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15, 23, 42, 0.42)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "6vh 16px",
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        data-testid="decision-attribution-drawer"
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

        {/* Header — mono kicker + rule/sev badges, then italic-serif title. */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 16,
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

        {/* Reason */}
        <div style={{
          background: rule.bg,
          border: "1px solid " + rule.line,
          borderRadius: "12px 3px 12px 3px",
          padding: "12px 14px", marginBottom: 16,
        }}>
          <div style={{
            fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
            color: "var(--ink2)", letterSpacing: ".12em",
            textTransform: "uppercase", marginBottom: 6,
          }}>
            Why this fired
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink)" }}>
            <_RichText text={step.reason || ""} accentColor={rule.color} />
          </div>
        </div>

        {/* Citation chip — when the rule was tagged with one */}
        {step.cite && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
              color: "var(--ink2)", letterSpacing: ".12em",
              textTransform: "uppercase", marginBottom: 6,
            }}>
              Evidence anchor
            </div>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 12.5, lineHeight: 1.45, color: "var(--ink)",
              padding: "5px 10px",
              background: "var(--paper2)",
              border: "1px solid var(--line)",
              borderRadius: "8px 3px 8px 3px",
            }}>
              <CheckCircle2 size={12} color="var(--neon-cyan, var(--ox))" aria-hidden />
              {CITE_LABEL[step.cite] || step.cite}
            </span>
          </div>
        )}

        {/* Mechanism link — when the reason text mentions a known mechanism */}
        {mechMatch && onOpenMechanism && (
          <div style={{ marginBottom: 6 }}>
            <button
              type="button"
              onClick={() => { onOpenMechanism(mechMatch); }}
              className="rx-magnetic rx-shine-sweep"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 700,
                letterSpacing: ".08em", textTransform: "uppercase",
                color: "var(--ink)",
                background: "rgba(0, 212, 255, 0.08)",
                border: "1px solid var(--neon-cyan-line, var(--ox-line))",
                padding: "6px 12px",
                borderRadius: "8px 3px 8px 3px",
                cursor: "pointer",
                transition: "background .18s, border-color .18s",
              }}
            >
              <BookOpen size={12} aria-hidden />
              Read the mechanism · {mechMatch}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if(typeof document === "undefined") return drawerTree;
  return createPortal(drawerTree, document.body);
}

export { DecisionAttributionDrawer };
