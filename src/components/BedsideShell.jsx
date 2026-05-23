/* component · Bedside-mode shell — Phase 0 stub.
   Phase 0 places this component behind the `?bedside=1` URL flag so the
   reframe has a real mount point without disturbing the classic UI.
   Phases A–D will replace this stub with the Case Bar, Answer Canvas, and
   workflow loop. The stub also smoke-tests the new DecisionTag primitive so
   the decision-color tokens have at least one render path in the build.
   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { Activity, ArrowLeft, Stethoscope } from "lucide-react";
import { DecisionTag } from "./primitives.jsx";

function BedsideShell({ caseState, onExit }) {
  return (
    <div className="rx-root" style={{ minHeight: "100vh", padding: "32px 22px 80px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
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

        <h1 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 600, letterSpacing: "-.014em", margin: "20px 0 6px" }}>
          Bedside mode
        </h1>
        <p style={{ color: "var(--ink2)", fontSize: 14, margin: "0 0 24px", lineHeight: 1.55, maxWidth: "62ch" }}>
          Phase 0 scaffold. The Case Bar (Phase A.1) and Answer Canvas (Phase A.2) will mount here.
          Visiting <code style={{ fontFamily: "var(--mono)", fontSize: 12, background: "var(--line2)", padding: "1px 5px", borderRadius: 4 }}>?bedside=1</code>
          {" "}flips the app into this surface; the default URL still serves the full classic UI.
        </p>

        <div style={{
          background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 12,
          padding: 18, marginBottom: 18,
        }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ox)", fontWeight: 700, marginBottom: 10 }}>
            <Stethoscope size={12} style={{ verticalAlign: "-2px", marginRight: 6 }} />Case state
          </div>
          <pre style={{
            fontFamily: "var(--mono)", fontSize: 11.5, lineHeight: 1.55,
            color: "var(--ink2)", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>
            {JSON.stringify({
              patient: { on: caseState.patient.on, age: caseState.patient.age, weightKg: caseState.patient.weightKg, scr: caseState.patient.scr, sex: caseState.patient.sex, hepatic: caseState.patient.hepatic, hd: caseState.patient.hd },
              syndrome: caseState.syndrome,
              cultures: caseState.cultures,
              dayOfTx: caseState.dayOfTx,
              startDate: caseState.startDate,
            }, null, 2)}
          </pre>
        </div>

        <div style={{
          background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 12,
          padding: 18,
        }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ox)", fontWeight: 700, marginBottom: 10 }}>
            <Activity size={12} style={{ verticalAlign: "-2px", marginRight: 6 }} />Decision channel preview
          </div>
          <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 12px", lineHeight: 1.55 }}>
            Phase 0.3 added four semantic states. Phases B–D wire them into the Answer Canvas dose rows and refinement footnotes.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <DecisionTag state="start">Cefazolin 2 g IV q8h</DecisionTag>
            <DecisionTag state="adjusted">Cefepime 1 g q12h (CrCl 35)</DecisionTag>
            <DecisionTag state="avoid">Pip-tazo + vancomycin</DecisionTag>
            <DecisionTag state="pending">MRSA culture</DecisionTag>
          </div>
        </div>
      </div>
    </div>
  );
}

export { BedsideShell };
