/* component · OnboardingModal — Wave 6 W6-D first-visit overlay.

   Gated on a localStorage flag so it auto-shows on the very first
   visit and never again (unless the user clears site data or
   explicitly re-opens it via the help affordance). Three short
   screens, each one a single idea, with Skip + Next / Done CTAs.

   Why a modal at all (the user said "never popups in the workflow
   path"): the first-visit overlay is the explicit exception — a
   clinician who lands here cold needs the 30-second orientation
   before they reach for a regimen. Once dismissed, it never
   interrupts again.

   Snapshot contract: dismissal lives in localStorage (site
   preference, same pattern as antibiograms + microbiome-sort flag).
   No per-syndrome state ever lands here.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft, ArrowRight, BookOpen, Crosshair, Layers, Sparkles, X,
} from "lucide-react";
import { useFocusTrap } from "./util/useFocusTrap.js";

const DISMISS_KEY = "ab_onboarding_dismissed_v1";

function _readDismissed() {
  try {
    if(typeof window === "undefined") return false;
    return window.localStorage?.getItem(DISMISS_KEY) === "1";
  } catch(e) { return false; }
}

function _writeDismissed() {
  try {
    if(typeof window === "undefined") return;
    window.localStorage?.setItem(DISMISS_KEY, "1");
  } catch(e) {}
}

const SCREENS = [
  {
    icon: Sparkles,
    kicker: "What this is",
    title: "A snapshot consult, not a chart.",
    body:
      "Describe the case once — free text or chips — and the Answer Canvas " +
      "composes the empiric regimen, refinements, monitoring, duration, and " +
      "evidence. Nothing persists between visits. The page is yours; close " +
      "the tab and it forgets.",
  },
  {
    icon: Crosshair,
    kicker: "How to ask",
    title: "Describe the patient in one line.",
    body:
      "\"72M HAP prior MRSA CrCl 35\" is enough. The parser extracts age, sex, " +
      "syndrome, host factors, organism risks, and renal function; the engine " +
      "composes the regimen + refinements. Add or correct any field in the " +
      "Case Bar — the answer recomposes immediately.",
  },
  {
    icon: Layers,
    kicker: "What's at your fingertips",
    title: "Drill from chip to mechanism.",
    body:
      "Every drug-class and resistance-term chip opens an inline popover; the " +
      "popover offers \"Read the mechanism\" when there's biochemistry behind " +
      "the choice. Footnote markers next to refinement steps open the rule + " +
      "evidence behind that step. Press ? any time for the keyboard cheat-sheet.",
  },
];

function OnboardingModal({ forceOpen = false, onClose }) {
  const [open, setOpen] = useState(forceOpen || !_readDismissed());
  const [idx, setIdx] = useState(0);
  const dialogRef = useRef(null);

  useEffect(() => {
    if(forceOpen) setOpen(true);
  }, [forceOpen]);

  useEffect(() => {
    if(!open) return;
    const onKey = (e) => { if(e.key === "Escape") _dismiss(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useFocusTrap(dialogRef, open);

  const _dismiss = () => {
    _writeDismissed();
    setOpen(false);
    setIdx(0);
    if(onClose) onClose();
  };

  if(!open) return null;

  const screen = SCREENS[idx];
  const Icon = screen.icon;
  const isLast = idx === SCREENS.length - 1;

  const tree = (
    <div
      role="dialog"
      aria-label="Welcome to the Inpatient Antibiotic Guide"
      aria-modal="true"
      onClick={(e) => { e.stopPropagation(); _dismiss(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1100,
        background: "var(--scrim)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "8vh 16px",
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        data-testid="onboarding-modal"
        style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          width: "min(560px, 100%)",
          maxHeight: "85vh",
          overflowY: "auto",
          padding: 26,
          boxShadow: "var(--shadow-drawer)",
          outline: "none",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          gap: 12, marginBottom: 18,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon size={16} aria-hidden color="var(--ox)" />
            <span style={{
              fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
              color: "var(--ink2)", letterSpacing: ".1em",
              textTransform: "uppercase",
            }}>
              {screen.kicker}
            </span>
          </div>
          <button
            type="button"
            onClick={_dismiss}
            aria-label="Skip onboarding"
            style={{
              background: "transparent", border: "1px solid var(--line)",
              borderRadius: 6, padding: 4, cursor: "pointer",
              color: "var(--ink2)",
            }}
          >
            <X size={14} aria-hidden />
          </button>
        </div>

        {/* Body */}
        <h2 style={{
          fontFamily: "var(--serif)", fontSize: 24, fontWeight: 600,
          color: "var(--ink)", margin: "0 0 12px",
          letterSpacing: "-.01em", lineHeight: 1.2,
        }}>
          {screen.title}
        </h2>
        <p style={{
          fontSize: 14, lineHeight: 1.65, color: "var(--ink2)",
          margin: 0, maxWidth: "60ch",
        }}>
          {screen.body}
        </p>

        {/* Footer · progress dots + nav */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: 24, paddingTop: 16,
          borderTop: "1px solid var(--line2)",
        }}>
          <div role="presentation" style={{ display: "flex", gap: 5 }}>
            {SCREENS.map((_, i) => (
              <span key={i} aria-hidden style={{
                width: i === idx ? 18 : 6, height: 6,
                background: i === idx ? "var(--ox)" : "var(--line)",
                borderRadius: 999,
                transition: "width .15s, background .15s",
              }} />
            ))}
            <span style={{
              fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600,
              color: "var(--muted)", marginLeft: 8, letterSpacing: ".06em",
            }}>
              {idx + 1} / {SCREENS.length}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {idx > 0 && (
              <button
                type="button"
                onClick={() => setIdx(i => Math.max(0, i - 1))}
                aria-label="Previous"
                style={{
                  background: "var(--panel)", border: "1px solid var(--line)",
                  borderRadius: 6, padding: "5px 11px", cursor: "pointer",
                  fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
                  letterSpacing: ".06em", textTransform: "uppercase",
                  color: "var(--ink2)",
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}
              >
                <ArrowLeft size={11} aria-hidden /> Back
              </button>
            )}
            {!isLast && (
              <button
                type="button"
                onClick={() => setIdx(i => Math.min(SCREENS.length - 1, i + 1))}
                aria-label="Next"
                style={{
                  background: "var(--ox)", border: "1px solid var(--ox)",
                  borderRadius: 6, padding: "5px 13px", cursor: "pointer",
                  fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
                  letterSpacing: ".06em", textTransform: "uppercase",
                  color: "#fff",
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}
              >
                Next <ArrowRight size={11} aria-hidden />
              </button>
            )}
            {isLast && (
              <button
                type="button"
                onClick={_dismiss}
                aria-label="Done — start using the guide"
                style={{
                  background: "var(--ox)", border: "1px solid var(--ox)",
                  borderRadius: 6, padding: "5px 13px", cursor: "pointer",
                  fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
                  letterSpacing: ".06em", textTransform: "uppercase",
                  color: "#fff",
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}
              >
                <BookOpen size={11} aria-hidden /> Start
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if(typeof document === "undefined") return tree;
  return createPortal(tree, document.body);
}

export { OnboardingModal };
