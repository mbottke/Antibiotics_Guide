/* component · Bedside-mode shell.
   Phase 0 placed this component behind the `?bedside=1` URL flag as a stub.
   Phase A.1 wired the Case Bar; Phase A.2 mounts the Answer Canvas beneath.
   The shell owns the "edit vs view" toggle: once a case has a syndrome, the
   Case Bar collapses to a single-line summary so the Answer Canvas gets
   the full vertical real estate. The user can re-expand by clicking Edit.
   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState } from "react";
import { ArrowLeft, Pencil, Search, Settings as SettingsIcon } from "lucide-react";
import { CaseBar } from "./CaseBar.jsx";
import { AnswerCanvas } from "./AnswerCanvas.jsx";
import { FontSizeControl } from "./FontSizeControl.jsx";
import { SettingsModal } from "./SettingsModal.jsx";
import { KeyboardShortcutsOverlay } from "./KeyboardShortcutsOverlay.jsx";
import { OnboardingModal } from "./OnboardingModal.jsx";
import { BrandMark } from "./BrandMark.jsx";
import { DensityToggle } from "./DensityToggle.jsx";
import { ScrollHeader } from "./ScrollHeader.jsx";
import { useDensity } from "./util/useDensity.js";
import { SYNDROMES } from "../data/syndromes.js";

function _synName(id) {
  if(!id) return null;
  const s = SYNDROMES.find(x => x.id === id);
  return s ? s.name : id;
}

function BedsideShell({ caseState, setCaseState, onExit, onDrug, onOrg, onCite, onOpenPalette, antibiogram, onOpenAntibiogramManager }) {
  /* Edit / view mode. Once a syndrome is set, default to view; the user can
     re-open the Case Bar by clicking Edit. While the Case Bar is open, the
     Answer Canvas stays hidden so the screen has one job at a time. */
  const [editing, setEditing] = useState(!caseState.syndrome);

  /* Wave 5 CL-4 · settings modal — gear icon in the global header strip.
     Snapshot contract: site-level preferences land in localStorage (per
     the existing antibiogram pattern); per-syndrome UI state stays in
     component memory. */
  const [settingsOpen, setSettingsOpen] = useState(false);

  const applyCase = (update) => {
    setCaseState(c => ({
      ...c,
      patient: { ...c.patient, ...(update.patient || {}) },
      syndrome: update.syndrome ?? c.syndrome,
    }));
    // After applying a case with a syndrome, drop to view mode so the
    // Answer Canvas takes the screen.
    if(update.syndrome ?? caseState.syndrome) setEditing(false);
  };

  /* Drug / organism / trial chip handlers — provided by App.jsx so the
     decide-mode Answer Canvas can open the same Drawer monograph/organism/
     trial cards that the reference UI uses. The Drawer itself lives in
     App.jsx (hoisted out of the reference-only return) and is mounted in
     both decide and reference branches. */
  const _onDrug = onDrug || (() => {});
  const _onOrg = onOrg || (() => {});
  const _onCite = onCite || (() => {});

  const synName = _synName(caseState.syndrome);

  useDensity();

  return (
    <div className="rx-root rx-bedside">
      {/* Phase D2 responsive container: stays narrow on mobile/tablet
          (max 780 px below 1100 px viewport for typography comfort);
          expands smoothly on wide desktops up to 1480 px so the regimen
          options grid, duration branches grid, and monitoring blocks
          all get the side-by-side real estate they were designed for.
          The `min(96vw, 1480px)` caps the page on ultra-wide displays
          where line lengths would otherwise become unreadable. */}
      <div className="rx-bedside-container" style={{
        maxWidth: "min(96vw, 1480px)",
        margin: "0 auto",
      }}>
        <ScrollHeader style={{ marginBottom: 18 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onExit}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".08em",
              textTransform: "uppercase", color: "var(--muted)",
              background: "none", border: "1px solid var(--line)", borderRadius: 999,
              padding: "5px 11px", cursor: "pointer",
            }}>
            <ArrowLeft size={12} /> Reference
          </button>
          <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
            {onOpenPalette && (
              <button
                type="button"
                onClick={onOpenPalette}
                aria-label="Search the catalog — drugs, organisms, syndromes (⌘K)"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".06em",
                  color: "var(--muted)",
                  background: "var(--card)", border: "1px solid var(--line)", borderRadius: 8,
                  padding: "5px 10px", cursor: "pointer",
                }}>
                <Search size={12} />
                <span>Search</span>
                <span style={{
                  marginLeft: 4, padding: "1px 6px", borderRadius: 4,
                  background: "var(--surface)", border: "1px solid var(--line)",
                  fontSize: 10, color: "var(--ink2)",
                }}>⌘K</span>
              </button>
            )}
            <FontSizeControl />
            <DensityToggle />
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Open settings"
              title="Settings"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28,
                background: "var(--panel)",
                border: "1px solid var(--line)",
                borderRadius: 999,
                cursor: "pointer",
                color: "var(--ink2)",
              }}
            >
              <SettingsIcon size={13} aria-hidden />
            </button>
            <BrandMark size="small" subtitle="Bedside · Decision support" />
          </div>
        </div>
        </ScrollHeader>

        {/* Three states:
            INITIAL — no syndrome yet → full-width "Build the case" intro
              with the Case Bar (onboarding flow).
            EDIT — syndrome set + editing toggled → split layout with the
              Case Bar pinned as a side rail and the Answer Canvas
              continuing to render on the right, so the user never loses
              their reference point while adjusting context.
            VIEW — syndrome set, not editing → Answer Canvas full width. */}
        {editing && !caseState.syndrome && (
          <>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: 30, fontWeight: 600, letterSpacing: "-.014em", margin: "8px 0 6px" }}>
              Build the case
            </h1>
            <p style={{ color: "var(--ink2)", fontSize: 14, margin: "0 0 22px", lineHeight: 1.55, maxWidth: "62ch" }}>
              Describe the case in free text, or pick the chips directly. The Answer Canvas
              composes the empiric regimen, refinements, and de-escalation plan once a syndrome is set.
            </p>
            <CaseBar caseState={caseState} onApply={applyCase} onSkip={onExit} />
          </>
        )}
        {editing && caseState.syndrome && (
          <div className="rx-bedside-split">
            <aside className="rx-bedside-rail" aria-label="Edit case">
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid var(--line2)",
              }}>
                <div style={{
                  fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".14em",
                  textTransform: "uppercase", color: "var(--ox)", fontWeight: 700,
                }}>
                  Edit case
                </div>
                <button type="button" onClick={() => setEditing(false)}
                  aria-label="Close edit panel and return to answer"
                  style={{
                    fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".08em",
                    textTransform: "uppercase", color: "var(--muted)",
                    background: "none", border: "1px solid var(--line)", borderRadius: 999,
                    padding: "3px 9px", cursor: "pointer",
                  }}>
                  ✕ Done
                </button>
              </div>
              <CaseBar caseState={caseState} onApply={applyCase} onSkip={() => setEditing(false)} />
            </aside>
            <AnswerCanvas
              caseState={caseState}
              setCaseState={setCaseState}
              onEditCase={() => setEditing(true)}
              onDrug={_onDrug}
              onOrg={_onOrg}
              onCite={_onCite}
              antibiogram={antibiogram}
              onOpenAntibiogramManager={onOpenAntibiogramManager}
            />
          </div>
        )}
        {!editing && (
          <AnswerCanvas
            caseState={caseState}
            setCaseState={setCaseState}
            onEditCase={() => setEditing(true)}
            onDrug={_onDrug}
            onOrg={_onOrg}
            onCite={_onCite}
            antibiogram={antibiogram}
            onOpenAntibiogramManager={onOpenAntibiogramManager}
          />
        )}
      </div>

      {/* Wave 5 CL-4 · settings modal — gear-icon companion */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenAntibiogramManager={onOpenAntibiogramManager}
      />

      {/* Wave 6 W6-D · keyboard-shortcut overlay — `?` toggles. Owns its
          own open state via a global keydown listener so it can surface
          from anywhere in the bedside surface without prop drilling. */}
      <KeyboardShortcutsOverlay />

      {/* Wave 6 W6-D · first-visit onboarding overlay. Auto-shows
          the first time a user lands on the bedside surface; persists
          dismissal to localStorage so it never interrupts the
          workflow path again. */}
      <OnboardingModal />
    </div>
  );
}

export { BedsideShell };
