/* component · OutpatientShell — Phase C placeholder for the outpatient
   surface. Rendered when SurfaceBar.surface === "outpatient". The content
   makes the future scope explicit so visitors who land here understand the
   roadmap — both Reference (outpatient formulary, syndrome bank,
   stewardship) and Decide (case-driven outpatient antibiotic selection)
   are planned future builds. The Inpatient surface remains the
   functional default until then.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { ArrowLeft, BookOpen, Crosshair, Hospital, Stethoscope } from "lucide-react";

function _planCard({ Icon, kicker, head, body }) {
  return (
    <div style={{
      background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12,
      padding:18,
    }}>
      <div style={{
        fontFamily:"var(--mono)", fontSize:10, letterSpacing:".14em",
        textTransform:"uppercase", color:"var(--ox)", fontWeight:700, marginBottom:8,
        display:"inline-flex", alignItems:"center", gap:6,
      }}>
        <Icon size={12} aria-hidden /> {kicker}
      </div>
      <div style={{ fontFamily:"var(--serif)", fontSize:16, fontWeight:600, color:"var(--ink)", marginBottom:6, letterSpacing:"-.005em" }}>
        {head}
      </div>
      <div style={{ fontSize:13, color:"var(--ink2)", lineHeight:1.55 }}>{body}</div>
    </div>
  );
}

function OutpatientShell({ onSwitchInpatient }) {
  return (
    <div className="rx-root rx-bedside" style={{ paddingTop: 36 }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{
          fontFamily:"var(--mono)", fontSize:10, letterSpacing:".18em",
          textTransform:"uppercase", color:"var(--muted)", fontWeight:600,
          marginBottom: 8,
        }}>
          <Stethoscope size={11} style={{ verticalAlign:"-1px", marginRight:5, color:"var(--ox)" }}/>
          Outpatient surface · planned
        </div>
        <h1 style={{
          fontFamily:"var(--serif)", fontSize:30, fontWeight:600,
          letterSpacing:"-.014em", margin:"0 0 8px",
        }}>
          Outpatient antibiotic guidance is on the roadmap
        </h1>
        <p style={{
          color:"var(--ink2)", fontSize:14.5, lineHeight:1.6,
          margin:"0 0 22px", maxWidth:"62ch",
        }}>
          The Inpatient surface is fully built. The Outpatient surface will follow,
          mirroring the same Reference / Decide split tuned for ambulatory clinical
          decision making — outpatient syndromes (acute otitis media, sinusitis,
          pharyngitis, cellulitis, UTI, STI, traveler's diarrhea, etc.), discharge
          step-down, prophylaxis, antibiotic stewardship for primary care, and
          patient-specific selection with the same engine.
        </p>

        <div style={{ display:"grid", gap:12, gridTemplateColumns:"1fr 1fr" }}>
          {_planCard({
            Icon: BookOpen,
            kicker: "Reference · planned",
            head: "Outpatient formulary, syndromes, stewardship",
            body: "An ambulatory parallel to the inpatient Reference: oral-first formulary, outpatient syndrome bank, antibiotic stewardship in primary care, and the cross-walks from inpatient discharge to outpatient completion.",
          })}
          {_planCard({
            Icon: Crosshair,
            kicker: "Decide · planned",
            head: "Outpatient case-driven decision tool",
            body: "The Bedside model adapted to the visit: enter the case, get the recommended oral regimen with patient-specific dosing, follow-up criteria, and stewardship-aware narrowing — same engine, outpatient-tuned data.",
          })}
        </div>

        <div style={{
          marginTop: 22, padding: "14px 16px",
          background:"var(--ox-softer)", border:"1px solid var(--ox-line)", borderRadius: 10,
          fontSize: 13, color:"var(--ink2)", lineHeight: 1.55,
        }}>
          <Hospital size={13} style={{ verticalAlign:"-2px", marginRight:6, color:"var(--ox)" }}/>
          For now the Inpatient surface is the functional tool. Switch back using the bar
          above, or with the button below.
        </div>

        <div style={{ marginTop: 18 }}>
          <button type="button" onClick={onSwitchInpatient}
            style={{
              display:"inline-flex", alignItems:"center", gap:7,
              fontFamily:"var(--sans)", fontSize:13, fontWeight:600, color:"#fff",
              background:"var(--ox)", border:"1px solid var(--ox)", borderRadius:9,
              padding:"10px 16px", cursor:"pointer",
            }}>
            <ArrowLeft size={13}/> Back to Inpatient
          </button>
        </div>
      </div>
    </div>
  );
}

export { OutpatientShell };
