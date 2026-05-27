/* component · KeyboardShortcutsOverlay — Wave 6 W6-D first-impression piece.
   Wave 8 W8 chrome pass — converted from a small centered modal into a
   glassmorphic 90vw card with:
     • Asymmetric 24/4 corner radius
     • Cyan gradient top strip + gradient hairline
     • Two-column grid of shortcut chips
     • Each shortcut: monospace key in a cyan-bordered chip + label in
       serif italic
     • 64px italic-display "Shortcuts" title

   Wave 10 W10 atomized internals pass — shortcuts now ride in named
   groups (Navigation / Selection / Drawers / Search). Each group
   wears a mono kicker followed by a 32px GradientHairline; each row
   ships the key combo as a `.rx-chrome-cta`-styled mini-pill (steel
   vertical gradient + cyan glow + white mono uppercase glyph), and
   the description sits in italic-serif 14px on the right. Hover
   lifts the row + a soft cyan tint sweeps in. Overlay scrim swapped
   to `.rx-mercury-backdrop`; panel entrance is a soft `.rx-glow-trail`
   + `.rx-fade-in-up` (reduced-motion gated).

   `?` opens a printable cheat-sheet of the global keybindings. Settings-
   modal already documents these, but this is the discoverability path —
   the overlay teaches users WITHOUT requiring they discover the gear icon
   first. Implements the W6-D "what's at your fingertips" affordance.

   Architecture:
     • Single global `keydown` listener on `?` toggles open.
     • Portal-mounted so it floats above any open modal / drawer.
     • Focus-trapped via useFocusTrap; Escape closes; backdrop click closes.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Keyboard, X } from "lucide-react";
import { useFocusTrap } from "./util/useFocusTrap.js";
import { useRipple } from "./util/useRipple.js";
import { useReducedMotion } from "./util/useReducedMotion.js";
import { GradientHairline } from "./decor/GradientHairline.jsx";

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

/* W10 · shortcut groups. Each group wears a mono kicker + 32px
   gradient hairline beneath. Order: Search → Navigation → Selection
   → Drawers — broad to narrow / outer to inner. */
const SHORTCUT_GROUPS = [
  {
    label: "Search",
    rows: [
      { keys: "⌘ K", what: "Open the search palette — jump to any syndrome, agent, organism, or trial." },
      { keys: "?", what: "Toggle this keyboard cheat-sheet." },
    ],
  },
  {
    label: "Navigation",
    rows: [
      { keys: "Tab", what: "Cycle focus inside an open drawer (focus-trapped). Shift+Tab reverses." },
      { keys: "Esc", what: "Close the active drawer, modal, or palette." },
    ],
  },
  {
    label: "Selection",
    rows: [
      { keys: "Enter / Space", what: "Activate the focused chip, button, or option card." },
      { keys: "Click chip", what: "Open the inline popover; for class / resistance terms, the popover footer offers a 'Read the mechanism' drawer." },
    ],
  },
  {
    label: "Drawers",
    rows: [
      { keys: "Click footnote", what: "Open the Decision Attribution drawer — see the rule, evidence, and mechanism behind a refinement." },
    ],
  },
];

/* Shared close-affordance — see MechanismDrawer.CloseButton; the same
   28×28 icon button + 6/2/6/2 asymmetric-corner pattern lives across
   every drawer + modal in the chrome family. */
function CloseButton({ onClose, label }) {
  const ref = useRef(null);
  useRipple(ref);
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClose}
      aria-label={label}
      className="rx-magnetic rx-ripple rx-focus-halo"
      style={{
        flex: "0 0 auto",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 28, height: 28,
        background: "rgba(0, 212, 255, 0.06)",
        border: "1px solid var(--neon-cyan-line, var(--ox-line))",
        borderRadius: "6px 2px 6px 2px",
        cursor: "pointer",
        color: "var(--ink2)",
        transition: "background var(--duration-base, .18s) var(--ease-out, ease), color var(--duration-base, .18s) var(--ease-out, ease), border-color var(--duration-base, .18s) var(--ease-out, ease)",
      }}
    >
      <X size={14} aria-hidden />
    </button>
  );
}

/* Chrome key-combo mini-pill. Uses the rx-chrome-cta style (steel
   vertical gradient + sheen) but in a tighter mini footprint —
   12px mono uppercase glyph, white text, cyan glow halo. */
function KeyPill({ keys }) {
  return (
    <kbd
      className="rx-chrome-cta"
      style={{
        fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700,
        letterSpacing: ".08em", textTransform: "uppercase",
        color: "#fff",
        padding: "4px 10px",
        borderRadius: "8px 2px 8px 2px",
        minWidth: 78,
        textAlign: "center",
        whiteSpace: "nowrap",
        cursor: "default",
        lineHeight: 1.3,
        gap: 0,
      }}
    >
      {keys}
    </kbd>
  );
}

/* Hover-lift row — pure CSS via inline style + class trick. We pin
   the hover behaviour to a `rx-shortcut-row` class so the overlay's
   one inline <style> block can carry the cyan tint background. */
function ShortcutRow({ keys, what }) {
  return (
    <li
      className="rx-shortcut-row"
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 14,
        alignItems: "center",
        padding: "8px 12px",
        background: "rgba(255, 255, 255, 0.42)",
        border: "1px solid var(--line)",
        borderLeft: "2px solid var(--neon-cyan, var(--ox))",
        borderRadius: "10px 3px 10px 3px",
        transition: "background var(--duration-base, .18s) var(--ease-out, ease), transform var(--duration-base, .18s) var(--ease-out, ease), box-shadow var(--duration-base, .18s) var(--ease-out, ease)",
      }}
    >
      <KeyPill keys={keys} />
      <span style={{
        fontFamily: "var(--serif)",
        fontStyle: "italic",
        fontSize: 14,
        lineHeight: 1.5,
        color: "var(--ink2)",
      }}>
        {what}
      </span>
    </li>
  );
}

function GroupHeading({ label }) {
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{
        fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 700,
        color: "var(--ink2)", letterSpacing: ".14em",
        textTransform: "uppercase",
      }}>
        {label}
      </div>
      <GradientHairline
        variant="cyan-blue"
        style={{ width: 32, margin: "6px 0 12px", height: 2 }}
      />
    </div>
  );
}

function KeyboardShortcutsOverlay() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);
  const reducedMotion = useReducedMotion();

  /* Global ? listener — only fires when the focus isn't inside an input. */
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

  const panelStyle = {
    position: "relative",
    background: "rgba(255, 255, 255, 0.86)",
    backdropFilter: "saturate(180%) blur(20px)",
    WebkitBackdropFilter: "saturate(180%) blur(20px)",
    border: "1px solid var(--line)",
    /* Asymmetric 24/4 corners — same as drawer panels. */
    borderRadius: "24px 4px 24px 4px",
    width: "min(90vw, 880px)",
    maxHeight: "84vh",
    overflowY: "auto",
    padding: "28px 30px 26px",
    boxShadow: "var(--shadow-drawer)",
    outline: "none",
  };

  const tree = (
    <div
      role="dialog"
      aria-label="Keyboard shortcuts"
      aria-modal="true"
      onClick={(e) => { e.stopPropagation(); setOpen(false); }}
      className="rx-mercury-backdrop"
      style={{
        position: "fixed", inset: 0, zIndex: 1100,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "5vh 16px",
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        data-testid="keyboard-shortcuts-overlay"
        className={reducedMotion ? "" : "rx-glow-trail rx-fade-in-up"}
        style={panelStyle}
      >
        {/* Scoped hover style for the shortcut rows. Keeping this inline
            keeps the global stylesheet untouched per the W10 constraint. */}
        <style>{`
          .rx-shortcut-row:hover {
            background: rgba(0, 212, 255, 0.10);
            transform: translateY(-1px);
            box-shadow: 0 6px 16px -8px rgba(0, 212, 255, 0.32);
          }
        `}</style>
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

        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          gap: 12, marginBottom: 14,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Keyboard size={14} aria-hidden color="var(--neon-cyan, var(--ox))" />
              <span style={{
                fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700,
                color: "var(--ink2)", letterSpacing: ".14em",
                textTransform: "uppercase",
              }}>Keyboard</span>
            </div>
            <h2 style={{
              /* The display title — 64px italic serif. Reads as
                  "you opened a book, here are the chapter headings." */
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              fontSize: "clamp(38px, 6vw, 64px)",
              fontWeight: 500,
              color: "var(--ink)",
              margin: "0 0 4px",
              letterSpacing: "-0.018em",
              lineHeight: 1,
            }}>
              Shortcuts
            </h2>
          </div>
          <CloseButton onClose={() => setOpen(false)} label="Close keyboard shortcuts" />
        </div>

        {/* Gradient hairline under the header. */}
        <span
          aria-hidden="true"
          style={{
            display: "block",
            height: 1,
            background: HAIRLINE_BG,
            margin: "8px 0 22px",
          }}
        />

        {/* Grouped shortcuts — each group ships a mono kicker + 32px
            gradient hairline, then a 2-column grid of chrome-pill rows. */}
        <div style={{ display: "grid", gap: 22 }}>
          {SHORTCUT_GROUPS.map((group, gi) => (
            <div key={gi}>
              <GroupHeading label={group.label} />
              <ul style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                /* W12 viewport density · 300 was one step too wide for the
                   modal's `min(90vw, 880px)` envelope at narrow viewports —
                   at 768 the modal becomes 691px, the inner ul gets ≈630px,
                   and minmax(300, 1fr) forced 2 cols with a 30px-wide
                   shortcut label crammed against the key chips. 260 lets
                   the rows breathe at 768 while still hitting 2-up on the
                   880-wide desktop modal. */
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 10,
              }}>
                {group.rows.map((s, i) => (
                  <ShortcutRow key={i} keys={s.keys} what={s.what} />
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p style={{
          fontSize: 11.5, lineHeight: 1.55, color: "var(--muted)",
          marginTop: 22, marginBottom: 0,
          fontFamily: "var(--serif)",
          fontStyle: "italic",
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
