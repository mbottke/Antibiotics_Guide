/* component · Bedside-mode shell.
   Phase 0 placed this component behind the `?bedside=1` URL flag as a stub.
   Phase A.1 wires the Case Bar into it; Phase A.2 will add the Answer Canvas
   beneath. The shell remains the mount point for the entire bedside surface
   and owns the local "show me the answer" toggle once a case is applied.
   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useMemo } from "react";
import { ArrowLeft, Stethoscope } from "lucide-react";
import { CaseBar } from "./CaseBar.jsx";
import { SYNDROMES } from "../data/syndromes.js";
import { deriveCtx } from "../engines/dosing.js";

function _synName(id) {
  if(!id) return null;
  const s = SYNDROMES.find(x => x.id === id);
  return s ? s.name : id;
}

function BedsideShell({ caseState, setCaseState, onExit }) {
  /* Apply a partial case-state update from the Case Bar. The update merges
     into the patient object (not replaces) so manual chip toggles do not
     wipe out demographics that were parsed in an earlier round. */
  const applyCase = (update) => {
    setCaseState(c => ({
      ...c,
      patient: { ...c.patient, ...(update.patient || {}) },
      syndrome: update.syndrome ?? c.syndrome,
    }));
  };

  // Derived patient quantities (CrCl, weight descriptors, etc.) — exact same
  // engine the classic dose tab uses. Memoised so it only recomputes when the
  // patient slice actually changes.
  const d = useMemo(() => deriveCtx(caseState.patient), [caseState.patient]);
  const synName = _synName(caseState.syndrome);
  const caseApplied = !!caseState.syndrome || caseState.patient.on;

  return (
    <div className="rx-root" style={{ minHeight: "100vh", padding: "32px 22px 80px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
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
            Bedside — Phase A.1
          </div>
        </div>

        <h1 style={{ fontFamily: "var(--serif)", fontSize: 30, fontWeight: 600, letterSpacing: "-.014em", margin: "8px 0 6px" }}>
          Build the case
        </h1>
        <p style={{ color: "var(--ink2)", fontSize: 14, margin: "0 0 22px", lineHeight: 1.55, maxWidth: "62ch" }}>
          Describe the case in free text, or pick the chips directly. The Answer Canvas
          (Phase A.2) will compose the empiric regimen, refinements, and de-escalation plan
          beneath the bar once a syndrome is set.
        </p>

        <CaseBar caseState={caseState} onApply={applyCase} onSkip={onExit} />

        {caseApplied && (
          <div style={{
            background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 12,
            padding: 18, marginBottom: 18,
          }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ox)", fontWeight: 700, marginBottom: 10 }}>
              <Stethoscope size={12} style={{ verticalAlign: "-2px", marginRight: 6 }} />Applied case
            </div>
            <div style={{ fontSize:13.5, color:"var(--ink2)", lineHeight:1.6 }}>
              {synName && <div><b>Presentation:</b> {synName}</div>}
              {caseState.patient.on && (
                <div><b>Patient:</b>{" "}
                  {[
                    caseState.patient.age && `${caseState.patient.age} y`,
                    caseState.patient.sex,
                    caseState.patient.weightKg && `${caseState.patient.weightKg} kg`,
                    caseState.patient.scr && `SCr ${caseState.patient.scr}`,
                    d.crcl != null && `CrCl ${d.crcl}`,
                    caseState.patient.hd && "on HD",
                    caseState.patient.hepatic && caseState.patient.hepatic !== "none" && (caseState.patient.hepatic === "severe" ? "Child-Pugh C" : "Child-Pugh B"),
                  ].filter(Boolean).join(" · ")}
                </div>
              )}
              {[
                caseState.patient.mrsaRisk && "MRSA risk",
                caseState.patient.pseudoRisk && "Pseudomonas risk",
                caseState.patient.esblRisk && "ESBL / R-GNR risk",
                caseState.patient.severe && "severe / shock",
              ].filter(Boolean).length > 0 && (
                <div><b>Risks:</b> {[
                  caseState.patient.mrsaRisk && "MRSA",
                  caseState.patient.pseudoRisk && "Pseudomonas",
                  caseState.patient.esblRisk && "ESBL / R-GNR",
                  caseState.patient.severe && "severe / shock",
                ].filter(Boolean).join(" · ")}</div>
              )}
              {caseState.patient.blAllergy && caseState.patient.blAllergy !== "none" && (
                <div><b>β-lactam allergy:</b> {caseState.patient.blAllergy === "severe" ? "severe / anaphylaxis" : "low-risk / delayed"}</div>
              )}
            </div>
            <div style={{ marginTop:14, paddingTop:12, borderTop:"1px dashed var(--line2)", fontSize:12, color:"var(--muted)", fontStyle:"italic" }}>
              Phase A.2 will render the empiric regimen, patient-specific dosing, and the 48–72 h reassessment plan here.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { BedsideShell };
