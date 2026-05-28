/* component · SettingsModal — Wave 5 CL-4 consolidated settings surface.
   Wave 8 W8 chrome pass — converted from a 560px modal box into a
   480px glass card with:
     • Asymmetric 22/4 corner radius
     • Backdrop-filter blur(24px) on the overlay
     • 4px cyan top-strip + 1px gradient hairline under the header
     • Section cards with asymmetric corners + cyan accent rail
     • A switch-style toggle for the microbiome preference (cyan ON,
       paper OFF) — replaces the bare HTML checkbox
     • Mono kicker + italic-serif "Preferences" title

   Closes the deferred UI gap: the microbiome-sort default flag has
   shipped since PR-10 but only as a localStorage key with no UI to
   flip it; FontSizeControl + AntibiogramManager lived in fragmented
   surfaces with no shared shell.

   WCAG: portal-mounted; focus trapped via useFocusTrap; Escape
   closes; restore focus to the trigger on close. Snapshot contract
   intact — site preferences persist via localStorage.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Activity, Keyboard, Settings as SettingsIcon, ShieldAlert, Type, X,
} from "lucide-react";
import { useFocusTrap } from "./util/useFocusTrap.js";
import { useRipple } from "./util/useRipple.js";
import { useReducedMotion } from "./util/useReducedMotion.js";
import { MeshWash } from "./decor/MeshWash.jsx";
import { GradientHairline } from "./decor/GradientHairline.jsx";
import { FontSizeControl } from "./FontSizeControl.jsx";

const MICROBIOME_KEY = "ab_microbiome_sort_default";

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

function _readBool(key) {
  try {
    if(typeof window === "undefined") return false;
    const v = window.localStorage?.getItem(key);
    return v === "1" || v === "true";
  } catch(e) { return false; }
}

function _writeBool(key, val) {
  try {
    if(typeof window === "undefined") return;
    window.localStorage?.setItem(key, val ? "1" : "0");
  } catch(e) { /* private mode */ }
}

/* W8 chrome · settings section — small glass card with asymmetric
   corners (10/3) and a 2px cyan accent rail along the left edge.
   Wave 10 W10 atomized pass — gains .rx-glass-bleed for the inner-edge
   cyan glow + outer halo (the "frosted card under a cyan light bar"
   feel), and the leading icon now rides in a 22×22 gradient tile so
   the visual reads as "icon tile + heading" rather than "icon next
   to heading". */
function SettingsSection({ icon: Icon, title, children, active }) {
  return (
    <section style={{ marginBottom: 16 }}>
      <header style={{
        display: "flex", alignItems: "center", gap: 9,
        marginBottom: 8,
      }}>
        {Icon && (
          <span
            aria-hidden
            style={{
              flex: "0 0 auto",
              width: 22, height: 22,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              borderRadius: "6px 2px 6px 2px",
              background:
                "linear-gradient(135deg," +
                " var(--ox-deep, #0B0F14) 0%," +
                " var(--electric-blue, var(--ox)) 50%," +
                " var(--neon-cyan, #00D4FF) 100%)",
              color: "#fff",
              boxShadow: "0 2px 6px -2px rgba(0,212,255,.45), inset 0 1px 0 rgba(255,255,255,.32)",
            }}
          >
            <Icon size={11} aria-hidden />
          </span>
        )}
        <h3 style={{
          fontSize: 13, fontWeight: 700, color: "var(--ink)", margin: 0,
          fontFamily: "var(--sans)", letterSpacing: "-.005em",
        }}>{title}</h3>
      </header>
      <div
        className="rx-glass-bleed"
        style={{
          position: "relative",
          background: active
            ? "linear-gradient(135deg, rgba(0,212,255,0.10) 0%, rgba(255,255,255,0.55) 100%)"
            : "rgba(255, 255, 255, 0.55)",
          border: "1px solid var(--line)",
          borderLeft: "2px solid var(--neon-cyan, var(--ox))",
          /* Asymmetric 10/3 pair — slightly tighter than the panel itself
              (22/4), so the visual hierarchy reads (card ⊂ panel). */
          borderRadius: "10px 3px 10px 3px",
          padding: "12px 13px",
          fontSize: 12.5, lineHeight: 1.55, color: "var(--ink2)",
          boxShadow: active
            ? "inset 0 0 0 1px var(--neon-cyan-line, var(--ox-line)), inset 0 0 24px -6px rgba(0,212,255,0.32)"
            : undefined,
        }}
      >
        {children}
      </div>
    </section>
  );
}

function ShortcutRow({ keys, label }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "auto 1fr",
      gap: 12, alignItems: "center", padding: "4px 0",
    }}>
      <kbd style={{
        fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
        background: "rgba(0, 212, 255, 0.08)",
        border: "1px solid var(--neon-cyan-line, var(--ox-line))",
        borderRadius: 5, padding: "2px 7px",
        color: "var(--ink)",
        whiteSpace: "nowrap",
        boxShadow: "inset 0 -1px 0 rgba(0, 212, 255, 0.18)",
        letterSpacing: ".06em",
        textTransform: "uppercase",
      }}>{keys}</kbd>
      <span style={{ color: "var(--ink2)" }}>{label}</span>
    </div>
  );
}

/* Switch-style toggle — cyan when on, paper when off. Wraps the
   underlying checkbox so RTL tests can still find the labeled
   input. The checkbox itself is visually hidden but accessible.
   W10 forms/inputs polish: stronger cyan halo when ON (two-layer
   glow matching the .rx-focus-halo aesthetic), plus a click-feedback
   pulse keyframe that fires whenever the checked state flips. The
   pulse is gated by prefers-reduced-motion. Also picks up the
   .rx-shine-sweep class so the toggle catches a diagonal light band
   on hover, reinforcing the chrome vocabulary. */
function _ensureW10SwitchStyles() {
  if(typeof document === "undefined") return;
  if(document.querySelector("style[data-w10-switch]")) return;
  const tag = document.createElement("style");
  tag.setAttribute("data-w10-switch", "");
  tag.textContent = `
    @keyframes rxW10SwitchPulse {
      0%   { transform: scale(1); }
      45%  { transform: scale(1.10); }
      100% { transform: scale(1); }
    }
    [data-w10-switch-host] {
      position: relative;
      display: inline-block;
      width: 36px; height: 20px;
      flex: 0 0 auto;
    }
    [data-w10-switch-host][data-w10-pulse="1"] [data-w10-switch-knob] {
      animation: rxW10SwitchPulse 280ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    @media (prefers-reduced-motion: reduce) {
      [data-w10-switch-host][data-w10-pulse="1"] [data-w10-switch-knob] {
        animation: none !important;
      }
    }
  `;
  document.head.appendChild(tag);
}
function SwitchToggle({ checked, onChange, ariaLabel }) {
  _ensureW10SwitchStyles();
  const [pulse, setPulse] = useState(0);
  const onChangeWithPulse = (e) => {
    setPulse(p => p + 1);
    if(onChange) onChange(e);
    // Reset the data-attr after the animation completes so re-checks
    // re-trigger the keyframe.
    if(typeof window !== "undefined") {
      window.setTimeout(() => setPulse(0), 320);
    }
  };
  return (
    <span data-w10-switch-host data-w10-pulse={pulse ? "1" : "0"} className="rx-shine-sweep" style={{ borderRadius: 999, overflow: "hidden" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChangeWithPulse}
        aria-label={ariaLabel}
        style={{
          position: "absolute",
          opacity: 0,
          width: 36, height: 20,
          margin: 0,
          top: 0, left: 0,
          cursor: "pointer",
          zIndex: 2,
        }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: checked
            ? "linear-gradient(135deg, var(--ox-deep, #0B0F14) 0%, var(--ox, #1F2937) 50%, var(--neon-cyan, #00D4FF) 240%)"
            : "var(--paper2)",
          border: "1px solid " + (checked ? "var(--neon-cyan, var(--ox))" : "var(--line)"),
          borderRadius: 999,
          transition: "background .22s, border-color .22s, box-shadow .22s",
          boxShadow: checked
            ? "0 0 0 1px rgba(0, 212, 255, 0.40), 0 0 16px rgba(0, 212, 255, 0.55), 0 0 28px 4px rgba(0, 212, 255, 0.22)"
            : "none",
        }}
      />
      <span
        data-w10-switch-knob
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 18 : 2,
          width: 16, height: 16,
          background: "#fff",
          borderRadius: "50%",
          boxShadow: checked
            ? "0 1px 2px rgba(0,0,0,.15), 0 0 6px rgba(0, 212, 255, 0.55)"
            : "0 1px 2px rgba(0,0,0,.15)",
          transition: "left .22s var(--ease-out, ease-out), box-shadow .22s",
        }}
      />
    </span>
  );
}

/* W10 · Open-antibiogram-manager — chrome-CTA-ghost variant with magnetic
   pointer pull, sheen sweep, and pointer-down ripple. */
function OpenAntibiogramButton({ onClick }) {
  const ref = useRef(null);
  useRipple(ref);
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className="rx-magnetic rx-shine-sweep rx-ripple"
      style={{
        background: "rgba(0, 212, 255, 0.08)",
        border: "1px solid var(--neon-cyan-line, var(--ox-line))",
        borderRadius: "10px 3px 10px 3px",
        padding: "8px 14px",
        fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
        letterSpacing: ".08em", textTransform: "uppercase",
        color: "var(--ink)", cursor: "pointer",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.4), 0 0 12px -4px rgba(0,212,255,.35)",
        transition: "background var(--duration-base, .18s) var(--ease-out, ease), border-color var(--duration-base, .18s) var(--ease-out, ease), box-shadow var(--duration-base, .18s) var(--ease-out, ease)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,.5), 0 0 22px -2px rgba(0,212,255,.55)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,.4), 0 0 12px -4px rgba(0,212,255,.35)";
      }}
    >
      Open antibiogram manager
    </button>
  );
}

/* Shared close-affordance — 28×28 icon button + 6/2/6/2 asymmetric
   corners. Identical pattern across every drawer + modal in the chrome
   family so the dismiss gesture is a single, recognizable affordance. */
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

function SettingsModal({ open, onClose, onOpenAntibiogramManager }) {
  const dialogRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [microbiomeSort, setMicrobiomeSort] = useState(() => _readBool(MICROBIOME_KEY));

  useEffect(() => {
    if(!open) return;
    const onKey = (e) => { if(e.key === "Escape") onClose && onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Re-read the localStorage value every time the modal opens so the toggle
  // reflects whatever the latest stored value is — even if it was flipped
  // by another tab.
  useEffect(() => {
    if(open) setMicrobiomeSort(_readBool(MICROBIOME_KEY));
  }, [open]);

  useFocusTrap(dialogRef, open);

  const onToggleMicrobiome = () => {
    setMicrobiomeSort(prev => {
      const next = !prev;
      _writeBool(MICROBIOME_KEY, next);
      return next;
    });
  };

  if(!open) return null;

  const panelStyle = {
    position: "relative",
    background: "rgba(255, 255, 255, 0.92)",
    backdropFilter: "saturate(180%) blur(12px)",
    WebkitBackdropFilter: "saturate(180%) blur(12px)",
    border: "1px solid var(--line)",
    /* Asymmetric 22/4 corner pair. */
    borderRadius: "22px 4px 22px 4px",
    width: "min(480px, 100%)",
    maxHeight: "82vh",
    overflowY: "auto",
    padding: "24px 24px 22px",
    boxShadow: "var(--shadow-drawer)",
    outline: "none",
  };

  const tree = (
    <div
      role="dialog"
      aria-label="Settings"
      aria-modal="true"
      onClick={(e) => { e.stopPropagation(); if(onClose) onClose(); }}
      className="rx-mercury-backdrop"
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "8vh 16px",
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        data-testid="settings-modal"
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
            borderTopLeftRadius: 22,
            pointerEvents: "none",
          }}
        />

        {/* Wave 9 W9 · molten-chrome band behind the settings header. */}
        <MeshWash
          variant="band"
          intensity="normal"
          palette="cyan-blue"
        />
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          gap: 12, marginBottom: 14,
          position: "relative", zIndex: 1,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <SettingsIcon size={14} aria-hidden color="var(--neon-cyan, var(--ox))" />
              <span style={{
                fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700,
                color: "var(--ink2)", letterSpacing: ".14em",
                textTransform: "uppercase",
              }}>Settings</span>
            </div>
            <h2 style={{
              /* Italic-serif title — matches the BrandMark subtitle voice. */
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              fontSize: 26,
              fontWeight: 500,
              color: "var(--ink)",
              margin: 0,
              letterSpacing: "-0.012em",
              lineHeight: 1.15,
            }}>
              Preferences
            </h2>
          </div>
          <CloseButton onClose={onClose} label="Close settings" />
        </div>

        {/* Gradient hairline under the header. */}
        <span
          aria-hidden="true"
          style={{
            display: "block",
            height: 1,
            background: HAIRLINE_BG,
            margin: "0 0 16px",
          }}
        />

        <SettingsSection icon={Type} title="Typography">
          {/* Wave 13 header consolidation — FontSizeControl now lives inside
              Settings rather than as a separate chip in the global chrome.
              The reference shell's gear icon opens this modal; the bedside
              shell still mounts its own copy of the modal. Scale persists
              via localStorage. */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <FontSizeControl />
            <span style={{ fontSize: 11.5, color: "var(--ink2)", flex: "1 1 180px", minWidth: 0, lineHeight: 1.45 }}>
              Scales the whole canvas — text, padding, icons. 5% steps from 80% to 150%; persists across sessions.
            </span>
          </div>
        </SettingsSection>
        <GradientHairline variant="cyan-blue" style={{ margin: "12px 0 16px", opacity: 0.65 }} />

        <SettingsSection icon={Activity} title="Microbiome ranking" active={microbiomeSort}>
          <label style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            cursor: "pointer",
          }}>
            <SwitchToggle
              checked={microbiomeSort}
              onChange={onToggleMicrobiome}
              ariaLabel="Rank empiric options by collateral damage"
            />
            <span style={{ minWidth: 0 }}>
              <span style={{
                display: "flex", alignItems: "center", gap: 6,
                fontWeight: 600, color: "var(--ink)",
              }}>
                Rank by collateral damage
                {microbiomeSort && (
                  <span aria-hidden className="rx-light-ring-cyan" style={{ marginLeft: 4 }} />
                )}
              </span>
              <span style={{ display: "block", fontSize: 11.5, color: "var(--ink2)", marginTop: 2 }}>
                Sort multi-option empiric tiers by ascending worst-case C. difficile risk
                so the gentler microbiome choice surfaces first. Per-card score chips
                always render; this only flips the default order. Stewardship-forward.
              </span>
            </span>
          </label>
        </SettingsSection>
        <GradientHairline variant="cyan-blue" style={{ margin: "12px 0 16px", opacity: 0.65 }} />

        <SettingsSection icon={ShieldAlert} title="Antibiogram overlays">
          <p style={{ margin: "0 0 12px" }}>
            Local-resistance overlays live in the Antibiogram manager — upload a CSV
            once per site to drive every regimen panel against your unit's data.
          </p>
          {onOpenAntibiogramManager && (
            <OpenAntibiogramButton
              onClick={() => { onOpenAntibiogramManager(); if(onClose) onClose(); }}
            />
          )}
        </SettingsSection>
        <GradientHairline variant="cyan-blue" style={{ margin: "12px 0 16px", opacity: 0.65 }} />

        <SettingsSection icon={Keyboard} title="Keyboard shortcuts">
          <div style={{ display: "grid", gap: 4 }}>
            <ShortcutRow keys="⌘ K" label="Open the search palette (jump to any syndrome / agent / organism)" />
            <ShortcutRow keys="Esc" label="Close the active drawer or modal" />
            <ShortcutRow keys="Enter / Space" label="Activate the focused chip, button, or option card" />
            <ShortcutRow keys="Tab" label="Cycle focus inside an open drawer (focus trap, with Shift+Tab to reverse)" />
          </div>
        </SettingsSection>
      </div>
    </div>
  );

  if(typeof document === "undefined") return tree;
  return createPortal(tree, document.body);
}

export { SettingsModal };
