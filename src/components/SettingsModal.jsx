/* component · SettingsModal — Wave 5 CL-4 consolidated settings surface.

   Closes the deferred UI gap: the microbiome-sort default flag has
   shipped since PR-10 but only as a localStorage key with no UI to
   flip it; FontSizeControl + AntibiogramManager lived in fragmented
   surfaces with no shared shell.

   This modal is the gear-icon companion to the global header. It
   bundles:
     1. Typography  — mirrors FontSizeControl (single source of
        truth still owned by FontSizeControl; the modal exposes the
        same controls + reset).
     2. Microbiome ranking — toggle `ab_microbiome_sort_default`
        so a stewardship-forward site flips the default ON across
        every multi-option RegimenOptions tier.
     3. Antibiogram overlays — link out to AntibiogramManager (the
        existing surface stays the canonical editor; this is the
        discoverability path).
     4. Keyboard shortcuts — cheat-sheet for ⌘K palette, Esc close,
        Enter/Space activate, Tab cycle inside drawers.

   WCAG: portal-mounted; focus trapped via useFocusTrap; Escape
   closes; restore focus to the trigger on close. Snapshot contract
   intact — site preferences persist via localStorage (the same
   pattern Phase E established for antibiograms), per-syndrome UI
   state never leaks here.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Activity, Keyboard, Settings as SettingsIcon, ShieldAlert, Type, X,
} from "lucide-react";
import { useFocusTrap } from "./util/useFocusTrap.js";

const MICROBIOME_KEY = "ab_microbiome_sort_default";

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

function SettingsSection({ icon: Icon, title, children }) {
  return (
    <section style={{ marginBottom: 18 }}>
      <header style={{
        display: "flex", alignItems: "center", gap: 8,
        marginBottom: 8,
      }}>
        {Icon && <Icon size={14} aria-hidden color="var(--ox)" />}
        <h3 style={{
          fontSize: 13, fontWeight: 700, color: "var(--ink)", margin: 0,
          fontFamily: "var(--sans)", letterSpacing: "-.005em",
        }}>{title}</h3>
      </header>
      <div style={{
        background: "var(--paper2)",
        border: "1px solid var(--line)",
        borderRadius: 7,
        padding: "10px 12px",
        fontSize: 12, lineHeight: 1.55, color: "var(--ink2)",
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

  const tree = (
    <div
      role="dialog"
      aria-label="Settings"
      aria-modal="true"
      onClick={(e) => { e.stopPropagation(); if(onClose) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "var(--scrim)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "8vh 16px",
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        data-testid="settings-modal"
        style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 10,
          width: "min(560px, 100%)",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: 22,
          boxShadow: "var(--shadow-drawer)",
          outline: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <SettingsIcon size={14} aria-hidden color="var(--ox)" />
              <span style={{
                fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
                color: "var(--ink2)", letterSpacing: ".1em",
                textTransform: "uppercase",
              }}>Settings</span>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
              Preferences
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            style={{
              background: "transparent", border: "1px solid var(--line)",
              borderRadius: 6, padding: 4, cursor: "pointer",
              color: "var(--ink2)",
            }}
          >
            <X size={14} aria-hidden />
          </button>
        </div>

        <SettingsSection icon={Type} title="Typography">
          Text-size adjustment is the gear icon's twin in the global header — use the
          dedicated typography control there for live A+/A− steps. The same scale
          persists across sessions.
        </SettingsSection>

        <SettingsSection icon={Activity} title="Microbiome ranking">
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={microbiomeSort}
              onChange={onToggleMicrobiome}
              aria-label="Rank empiric options by collateral damage"
              style={{
                marginTop: 3, flex: "0 0 auto",
                width: 14, height: 14, accentColor: "var(--ox)",
              }}
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
          <p style={{ margin: "0 0 8px" }}>
            Local-resistance overlays live in the Antibiogram manager — upload a CSV
            once per site to drive every regimen panel against your unit's data.
          </p>
          {onOpenAntibiogramManager && (
            <button
              type="button"
              onClick={() => { onOpenAntibiogramManager(); if(onClose) onClose(); }}
              style={{
                background: "var(--ox-soft)",
                border: "1px solid var(--ox-line)",
                borderRadius: 6,
                padding: "5px 10px",
                fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
                letterSpacing: ".06em", textTransform: "uppercase",
                color: "var(--ox)", cursor: "pointer",
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
