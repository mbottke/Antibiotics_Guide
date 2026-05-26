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
   corners (10/3) and a 2px cyan accent rail along the left edge. */
function SettingsSection({ icon: Icon, title, children }) {
  return (
    <section style={{ marginBottom: 16 }}>
      <header style={{
        display: "flex", alignItems: "center", gap: 8,
        marginBottom: 8,
      }}>
        {Icon && <Icon size={14} aria-hidden color="var(--neon-cyan, var(--ox))" />}
        <h3 style={{
          fontSize: 13, fontWeight: 700, color: "var(--ink)", margin: 0,
          fontFamily: "var(--sans)", letterSpacing: "-.005em",
        }}>{title}</h3>
      </header>
      <div style={{
        position: "relative",
        background: "rgba(255, 255, 255, 0.55)",
        border: "1px solid var(--line)",
        borderLeft: "2px solid var(--neon-cyan, var(--ox))",
        /* Asymmetric 10/3 pair — slightly tighter than the panel itself
            (22/4), so the visual hierarchy reads (card ⊂ panel). */
        borderRadius: "10px 3px 10px 3px",
        padding: "11px 13px",
        fontSize: 12.5, lineHeight: 1.55, color: "var(--ink2)",
      }}>
        {children}
      </div>
    </section>
  );
}

function ShortcutRow({ keys, label }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "auto 1fr",
      gap: 12, alignItems: "center", padding: "3px 0",
    }}>
      <kbd style={{
        fontFamily: "var(--mono)", fontSize: 10,
        background: "var(--panel)", border: "1px solid var(--line)",
        borderRadius: 4, padding: "2px 6px", color: "var(--ink)",
        whiteSpace: "nowrap",
      }}>{keys}</kbd>
      <span style={{ color: "var(--ink2)" }}>{label}</span>
    </div>
  );
}

/* Switch-style toggle — cyan when on, paper when off. Wraps the
   underlying checkbox so RTL tests can still find the labeled
   input. The checkbox itself is visually hidden but accessible. */
function SwitchToggle({ checked, onChange, ariaLabel }) {
  return (
    <span style={{
      position: "relative",
      display: "inline-block",
      width: 36, height: 20,
      flex: "0 0 auto",
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
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
          boxShadow: checked ? "0 0 14px rgba(0, 212, 255, 0.45)" : "none",
        }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 18 : 2,
          width: 16, height: 16,
          background: "#fff",
          borderRadius: "50%",
          boxShadow: "0 1px 2px rgba(0,0,0,.15)",
          transition: "left .22s var(--ease-out, ease-out)",
        }}
      />
    </span>
  );
}

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

function SettingsModal({ open, onClose, onOpenAntibiogramManager }) {
  const dialogRef = useRef(null);
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
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15, 23, 42, 0.42)",
        backdropFilter: "blur(24px) saturate(140%)",
        WebkitBackdropFilter: "blur(24px) saturate(140%)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "8vh 16px",
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        data-testid="settings-modal"
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

        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          gap: 12, marginBottom: 14,
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
          Text-size adjustment is the gear icon's twin in the global header — use the
          dedicated typography control there for live A+/A− steps. The same scale
          persists across sessions.
        </SettingsSection>

        <SettingsSection icon={Activity} title="Microbiome ranking">
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
              <span style={{ display: "block", fontWeight: 600, color: "var(--ink)" }}>
                Rank by collateral damage
              </span>
              <span style={{ fontSize: 11.5, color: "var(--ink2)" }}>
                Sort multi-option empiric tiers by ascending worst-case C. difficile risk
                so the gentler microbiome choice surfaces first. Per-card score chips
                always render; this only flips the default order. Stewardship-forward.
              </span>
            </span>
          </label>
        </SettingsSection>

        <SettingsSection icon={ShieldAlert} title="Antibiogram overlays">
          <p style={{ margin: "0 0 10px" }}>
            Local-resistance overlays live in the Antibiogram manager — upload a CSV
            once per site to drive every regimen panel against your unit's data.
          </p>
          {onOpenAntibiogramManager && (
            <button
              type="button"
              onClick={() => { onOpenAntibiogramManager(); if(onClose) onClose(); }}
              className="rx-magnetic rx-shine-sweep"
              style={{
                background: "rgba(0, 212, 255, 0.08)",
                border: "1px solid var(--neon-cyan-line, var(--ox-line))",
                borderRadius: "8px 3px 8px 3px",
                padding: "6px 12px",
                fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
                letterSpacing: ".08em", textTransform: "uppercase",
                color: "var(--ink)", cursor: "pointer",
                transition: "background .18s, border-color .18s",
              }}
            >
              Open antibiogram manager
            </button>
          )}
        </SettingsSection>

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
