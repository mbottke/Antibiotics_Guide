/* component · DecisionAttributionDrawer — Wave 5 PR-14
   "Trace this decision" drawer that opens from every refinement-step
   FootMark in the Answer Canvas. The user clicks the small numbered
   superscript next to a refined agent and gets the full attribution:

     • what rule fired (eliminate / substitute / flag / note)
     • why (the rule's authored reason text)
     • the patient ctx that triggered it (when matchCtx-bearing)
     • the evidence citation chip (mono / stew / trial reference)
     • severity grade
     • a link out to the mechanism drawer when the rule references
       a drug class or resistance vocabulary (e.g. β-lactam allergy
       → opens the β-lactam-class mechanism panel)

   Renders nothing when `open` is false or `step` is null. Closes on
   Escape, click-outside, and the explicit close button.

   Visual language matches the rest of the answer canvas — Section-
   style chrome on a modal overlay, monospace severity badges, oxblood
   accent. Same severity grammar (high / med / low) the refineRegimen
   engine uses.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, BookOpen, CheckCircle2, Crosshair, Info, X } from "lucide-react";

/* Shared **bold** parser — same shape as MonitoringBlock / DiagnosticsBlock
   / OPATBlock / MechanismDrawer. Will fold into a shared util in the
   Phase R2 consolidation PR. */
function _parseBold(text) {
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
function _RichText({ text, accentColor }) {
  return (
    <>
      {_parseBold(text).map((p, i) => p.bold ? (
        <span key={i} style={{ fontWeight: 700, color: accentColor || "inherit" }}>{p.text}</span>
      ) : <span key={i}>{p.text}</span>)}
    </>
  );
}

function _ruleTone(type, sev) {
  if(type === "eliminate") return { color: "#b91c1c", bg: "rgba(185, 28, 28, 0.08)", line: "rgba(185, 28, 28, 0.25)", label: "Eliminate", Icon: AlertTriangle };
  if(type === "substitute") return { color: "var(--ox)", bg: "var(--ox-soft)", line: "var(--ox-line)", label: "Substitute", Icon: Crosshair };
  if(type === "flag")      return { color: "var(--amber)", bg: "var(--amber-soft)", line: "var(--amber-line)", label: "Flag", Icon: AlertTriangle };
  return { color: "var(--ink2)", bg: "var(--paper2)", line: "var(--line)", label: "Note", Icon: Info };
}

function _sevTone(sev) {
  if(sev === "high") return { color: "#b91c1c", label: "HIGH" };
  if(sev === "med")  return { color: "var(--amber)", label: "MEDIUM" };
  return { color: "var(--ink2)", label: "LOW" };
}

const CITE_LABEL = {
  mono: "Drug monograph / IDSA guidance",
  stew: "Antimicrobial stewardship principle",
  trial: "Clinical trial",
};

function DecisionAttributionDrawer({ step, open, onClose, onOpenMechanism }) {
  useEffect(() => {
    if(!open) return;
    const onKey = (e) => { if(e.key === "Escape") onClose && onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if(!open || !step) return null;

  const rule = _ruleTone(step.type, step.sev);
  const sev  = _sevTone(step.sev);

  /* When the step's reason mentions a known resistance / class vocab,
     the drawer surfaces a "Read the mechanism" button that calls back
     up to the canvas to open the MechanismDrawer with the right key.
     The matched key is the canonical mechanism vocabulary; the parent
     decides whether MECHANISMS has an authored entry (PR-7 graceful-
     fallback). */
  const reasonText = step.reason || "";
  /* MECH_HINTS — keys that MechanismDrawer can resolve via getMechanism().
     Audit found "β-lactam" had no matching MECHANISMS entry (would render
     a dead button); dropped until either authored or aliased. */
  const MECH_HINTS = [
    "ESBL", "AmpC", "KPC", "Metallo-β-lactamase", "MBL", "NDM", "VIM",
    "MRSA", "PBP2a", "VRE", "vanA", "Daptomycin",
  ];
  const mechMatch = MECH_HINTS.find(h => reasonText.toLowerCase().includes(h.toLowerCase()));

  /* Wave 5 PR-14 fix: render through React portal so the overlay lives
     at document.body, not inside whatever interactive ancestor (e.g.,
     OptionCard <button>) is mounting the trigger. Without this, a click
     on the backdrop bubbles up to the parent button and silently
     changes the selected regimen. */
  const drawerTree = (
    <div
      role="dialog"
      aria-label={`Decision attribution · ${rule.label}`}
      aria-modal="true"
      onClick={(e) => { e.stopPropagation(); if(onClose) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "8vh 16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        data-testid="decision-attribution-drawer"
        style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 10,
          width: "min(620px, 100%)",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: 22,
          boxShadow: "0 24px 48px -16px rgba(15, 23, 42, 0.35)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <rule.Icon size={14} color={rule.color} aria-hidden />
              <span style={{
                fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
                color: "var(--ink2)", letterSpacing: ".1em",
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
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
              {step.agent}
              {step.replacement && (
                <>
                  <span style={{ color: "var(--ink2)", fontWeight: 500, margin: "0 6px" }}>→</span>
                  {step.replacement}
                </>
              )}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close decision attribution"
            style={{
              background: "transparent", border: "1px solid var(--line)",
              borderRadius: 6, padding: 4, cursor: "pointer",
              color: "var(--ink2)",
            }}
          >
            <X size={14} aria-hidden />
          </button>
        </div>

        {/* Reason */}
        <div style={{
          background: rule.bg, border: "1px solid " + rule.line,
          borderRadius: 7, padding: "10px 12px", marginBottom: 14,
        }}>
          <div style={{
            fontFamily: "var(--mono)", fontSize: 9.5, fontWeight: 700,
            color: "var(--ink2)", letterSpacing: ".08em",
            textTransform: "uppercase", marginBottom: 4,
          }}>
            Why this fired
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.55, color: "var(--ink)" }}>
            <_RichText text={step.reason || ""} accentColor={rule.color} />
          </div>
        </div>

        {/* Citation chip — when the rule was tagged with one */}
        {step.cite && (
          <div style={{ marginBottom: 14 }}>
            <div style={{
              fontFamily: "var(--mono)", fontSize: 9.5, fontWeight: 700,
              color: "var(--ink2)", letterSpacing: ".08em",
              textTransform: "uppercase", marginBottom: 4,
            }}>
              Evidence anchor
            </div>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 11.5, lineHeight: 1.45, color: "var(--ink)",
              padding: "4px 8px",
              background: "var(--paper2)", border: "1px solid var(--line)",
              borderRadius: 5,
            }}>
              <CheckCircle2 size={11} color="var(--ox)" aria-hidden />
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
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
                letterSpacing: ".06em", textTransform: "uppercase",
                color: "var(--ox)", background: "var(--ox-soft)",
                border: "1px solid var(--ox-line)",
                padding: "5px 10px", borderRadius: 5, cursor: "pointer",
              }}
            >
              <BookOpen size={11} aria-hidden />
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
