/* component · Bedside-mode shell.
   Phase 0 placed this component behind the `?bedside=1` URL flag as a stub.
   Phase A.1 wired the Case Bar; Phase A.2 mounts the Answer Canvas beneath.
   The shell owns the "edit vs view" toggle: once a case has a syndrome, the
   Case Bar collapses to a single-line summary so the Answer Canvas gets
   the full vertical real estate. The user can re-expand by clicking Edit.
   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import { CaseBar } from "./CaseBar.jsx";
import { AnswerCanvas } from "./AnswerCanvas.jsx";
import { SYNDROMES } from "../data/syndromes.js";

function _synName(id) {
  if(!id) return null;
  const s = SYNDROMES.find(x => x.id === id);
  return s ? s.name : id;
}

function BedsideShell({ caseState, setCaseState, onExit }) {
  /* Edit / view mode. Once a syndrome is set, default to view; the user can
     re-open the Case Bar by clicking Edit. While the Case Bar is open, the
     Answer Canvas stays hidden so the screen has one job at a time. */
  const [editing, setEditing] = useState(!caseState.syndrome);

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

  /* Drug / organism / trial open callbacks. The Bedside Answer Canvas does
     not have its own Drawer wired up yet (the existing Drawer lives in App.jsx
     and is tied to the classic UI). For Phase A.2 we no-op these so the
     monograph buttons in the answer are inert; Phase B will introduce a
     bedside-scoped drawer. */
  const onDrug = () => {};
  const onOrg = () => {};
  const onCite = () => {};

  const synName = _synName(caseState.syndrome);

  return (
    <div className="rx-root" style={{ minHeight: "100vh", padding: "32px 22px 80px" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
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
            <ArrowLeft size={12} /> Classic mode
          </button>
          <div style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:".18em", textTransform:"uppercase", color:"var(--ox)", fontWeight:600 }}>
            Bedside — Phase A
          </div>
        </div>

        {/* When in edit mode: show the headline + Case Bar. When in view mode:
            show a compact summary strip with an Edit affordance. */}
        {editing ? (
          <>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: 30, fontWeight: 600, letterSpacing: "-.014em", margin: "8px 0 6px" }}>
              Build the case
            </h1>
            <p style={{ color: "var(--ink2)", fontSize: 14, margin: "0 0 22px", lineHeight: 1.55, maxWidth: "62ch" }}>
              Describe the case in free text, or pick the chips directly. The Answer Canvas
              composes the empiric regimen, refinements, and de-escalation plan once a syndrome is set.
            </p>
            <CaseBar caseState={caseState} onApply={applyCase} onSkip={onExit} />
            {caseState.syndrome && (
              <button type="button" onClick={() => setEditing(false)}
                style={{
                  display:"inline-flex", alignItems:"center", gap:6,
                  fontFamily:"var(--mono)", fontSize:11, letterSpacing:".08em", textTransform:"uppercase",
                  color:"var(--muted)", background:"none", border:"none", padding:"6px 8px", cursor:"pointer",
                  marginTop:-4,
                }}>
                ↩ Back to the answer
              </button>
            )}
          </>
        ) : (
          <AnswerCanvas
            caseState={caseState}
            setCaseState={setCaseState}
            onEditCase={() => setEditing(true)}
            onDrug={onDrug}
            onOrg={onOrg}
            onCite={onCite}
          />
        )}
      </div>
    </div>
  );
}

export { BedsideShell };
