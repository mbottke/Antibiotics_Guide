/* layer · ans-start — the regimen itself. Each tier (Core / Add MRSA /
   Add resistant-GNR cover / etc.) renders through RxLine; allergy
   guidance and patient-specific dose summary follow.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js. */

import React from "react";
import { Crosshair, Calculator, ShieldAlert } from "lucide-react";
import { Section } from "../Section.jsx";
import { RxLine } from "../RxLine.jsx";

export const startLayer = {
  id: "ans-start",
  group: "core",
  spineLabel: "Start",
  when: () => true,
  render: (shared) => {
    const { ans, allergy, coreRefinements, onDrug, onOpenMechanism, dose, setTierPick, s } = shared;
    return (
      <Section kicker="Start now" icon={Crosshair} glyph="core" sticky id="ans-start">
        <RxLine kind="core" tier={ans.core} refinements={coreRefinements} onDrug={onDrug}
          onOpenMechanism={onOpenMechanism}
          ctx={ans.ctx} d={ans.d} synId={s.id}
          onAgentSelect={setTierPick(ans.core.k)} />
        {ans.adds.map((a, i) => (
          <RxLine key={i} kind="add" tier={a} refinements={[]} onDrug={onDrug}
            onOpenMechanism={onOpenMechanism}
            ctx={ans.ctx} d={ans.d} synId={s.id}
            onAgentSelect={setTierPick(a.k)} />
        ))}
        {allergy && (
          <div style={{
            display:"flex", gap:9, alignItems:"flex-start",
            padding:"10px 12px", background: allergy.tone === "ox" ? "var(--ox-soft)" : "var(--amber-soft)",
            border: `1px solid ${allergy.tone === "ox" ? "var(--ox-line)" : "var(--amber-line)"}`,
            borderRadius:8, fontSize:12, color: allergy.tone === "ox" ? "var(--ox-deep)" : "var(--amber)",
            lineHeight:1.55, marginTop:8,
          }}>
            <ShieldAlert size={14} style={{ flex:"0 0 auto", marginTop:1 }} />
            <div><b>{allergy.head}.</b> {allergy.body}</div>
          </div>
        )}
        {ans.ctx.on && ans.empiricAgents.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop:"1px dashed var(--line2)" }}>
            <div style={{ fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".1em", textTransform:"uppercase", color:"var(--muted)", fontWeight:600, marginBottom:7 }}>
              <Calculator size={11} style={{ verticalAlign:"-1px", marginRight:5 }}/>Dosing for this patient
              {ans.d.crcl != null && <span style={{ marginLeft:8, color:"var(--ink2)", textTransform:"none", letterSpacing:0, fontFamily:"var(--sans)", fontSize:11.5 }}>CrCl {ans.d.crcl} mL/min</span>}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:6 }}>
              {ans.empiricAgents.map(n => {
                const a = dose(n);
                const stat = (a && (a.kind === "band" || a.kind === "level") && a.adjusted) ? a.adjusted : (a ? a.normal : null);
                const changed = a && a.kind === "band" && a.changed;
                return (
                  <div key={n} style={{
                    display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, flexWrap:"wrap",
                    padding:"5px 10px", background: changed ? "var(--decision-adjusted-bg)" : "var(--paper2)",
                    border:`1px solid ${changed ? "var(--decision-adjusted-line)" : "var(--line)"}`, borderRadius:6,
                    fontSize:12, fontFamily:"var(--mono)",
                  }}>
                    <button type="button" onClick={() => onDrug && onDrug(n)}
                      style={{ fontFamily:"var(--sans)", fontSize:12.5, fontWeight:600, color:"var(--ink)",
                        background:"none", border:"none", cursor:"pointer", padding:0, textAlign:"left", minWidth:0, overflow:"hidden", textOverflow:"ellipsis" }}>
                      {n.split(" / ")[0]}
                    </button>
                    <span style={{ color: changed ? "var(--decision-adjusted)" : "var(--ink2)", fontWeight:600, minWidth:0, overflowWrap:"anywhere" }}>{stat || ""}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize:11, color:"var(--muted)", fontStyle:"italic", marginTop:7 }}>
              First (loading) doses are full doses regardless of clearance — adjustments are maintenance only.
            </div>
          </div>
        )}
      </Section>
    );
  },
};
