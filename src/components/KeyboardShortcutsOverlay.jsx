/* component · KeyboardShortcutsOverlay — Wave 6 W6-D first-impression piece.

   `?` opens a printable cheat-sheet of the global keybindings. Settings-
   modal already documents these, but this is the discoverability path —
   the overlay teaches users WITHOUT requiring they discover the gear icon
   first. Implements the W6-D "what's at your fingertips" affordance.

   Architecture:
     • Single global `keydown` listener on `?` toggles open.
     • Portal-mounted so it floats above any open modal / drawer.
     • Focus-trapped via useFocusTrap; Escape closes; backdrop click closes.
     • Snapshot-only — no preference state to persist; pure UI.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Keyboard, X } from "lucide-react";
import { useFocusTrap } from "./util/useFocusTrap.js";

const SHORTCUTS = [
  { keys: "⌘ K", what: "Open the search palette — jump to any syndrome, agent, organism, or trial." },
  { keys: "?", what: "Toggle this keyboard cheat-sheet." },
  { keys: "Esc", what: "Close the active drawer, modal, or palette." },
  { keys: "Enter / Space", what: "Activate the focused chip, button, or option card." },
  { keys: "Tab", what: "Cycle focus inside an open drawer (focus-trapped). Shift+Tab reverses." },
  { keys: "Click chip", what: "Open the inline popover; for class / resistance terms, the popover footer offers a 'Read the mechanism' drawer." },
  { keys: "Click footnote", what: "Open the Decision Attribution drawer — see the rule, evidence, and mechanism behind a refinement." },
];

function KeyboardShortcutsOverlay() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);

  /* Global ? listener — only fires when the focus isn't inside an input.
     This is important: a clinician typing "What's that pneumonia?" in
     the Case Bar must not have a question mark hijacked by the overlay. */
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      const tag = t && t.tagName;
      const isText = tag === "INPUT" || tag === "TEXTAREA" || (t && t.isContentEditable);
      if(e.key === "?" && !isText && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen(v => !v);
      } else if(e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useFocusTrap(dialogRef, open);

  if(!open) return null;

  const tree = (
    <div
      role="dialog"
      aria-label="Keyboard shortcuts"
      aria-modal="true"
      onClick={(e) => { e.stopPropagation(); setOpen(false); }}
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
        data-testid="keyboard-shortcuts-overlay"
        style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 10,
          width: "min(540px, 100%)",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: 22,
          boxShadow: "var(--shadow-drawer)",
          outline: "none",
        }}
      >
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          gap: 12, marginBottom: 16,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Keyboard size={14} aria-hidden color="var(--ox)" />
              <span style={{
                fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
                color: "var(--ink2)", letterSpacing: ".1em",
                textTransform: "uppercase",
              }}>Keyboard</span>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
              Shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close keyboard shortcuts"
            style={{
              background: "transparent", border: "1px solid var(--line)",
              borderRadius: 6, padding: 4, cursor: "pointer",
              color: "var(--ink2)",
            }}
          >
            <X size={14} aria-hidden />
          </button>
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
          {SHORTCUTS.map((s, i) => (
            <li key={i} style={{
              display: "grid", gridTemplateColumns: "auto 1fr",
              gap: 14, alignItems: "start",
              padding: "8px 11px",
              background: "var(--paper2)",
              border: "1px solid var(--line)",
              borderRadius: 6,
            }}>
              <kbd style={{
                fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 700,
                background: "var(--panel)", border: "1px solid var(--line)",
                borderRadius: 4, padding: "3px 8px",
                color: "var(--ink)", whiteSpace: "nowrap", minWidth: 60, textAlign: "center",
              }}>{s.keys}</kbd>
              <span style={{ fontSize: 12, lineHeight: 1.5, color: "var(--ink2)" }}>{s.what}</span>
            </li>
          ))}
        </ul>

        <p style={{
          fontSize: 11, lineHeight: 1.5, color: "var(--muted)",
          marginTop: 14, marginBottom: 0, fontStyle: "italic",
        }}>
          The same list lives in the Settings modal under "Keyboard shortcuts."
          Press <kbd style={{
            fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
            background: "var(--panel)", border: "1px solid var(--line)",
            borderRadius: 3, padding: "1px 5px",
          }}>?</kbd> again to dismiss.
        </p>
      </div>
    </div>
  );

  if(typeof document === "undefined") return tree;
  return createPortal(tree, document.body);
}

export { KeyboardShortcutsOverlay };
