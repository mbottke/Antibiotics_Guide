/* component · ReassessmentPanel — Phase B.2 of the bedside reframe.
   The stateful 48–72 h workflow. Three structured inputs feed the pure
   applyReassessment engine (engines/regimen.js); whenever any trigger
   fires, the panel renders the structured delta — what to narrow to,
   what to stop, IV→PO candidates, and the computed stop date.

   Inputs:
     · Cultures status: "Pending" / "Back" → organism quick-pick from
       the syndrome's empiric bugs, plus a dropdown for anything else
     · Clinical status: three toggle chips (Stable + improving,
       Tolerating oral, Source controlled)
     · Start date: optional date input that, when combined with source
       control, computes the stop date from the syndrome duration

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import {
  AlertTriangle, ArrowRight, Bug, Calendar, Check, Clock, Crosshair,
  FlaskConical, Pill, Scissors, Stethoscope, TrendingDown,
} from "lucide-react";
import { applyReassessment } from "../engines/regimen.js";
import { ORGS, ORG_BY_ID } from "../data/organisms.js";
import { renderRich } from "./rich-text.jsx";
import { Section } from "./Section.jsx";

function _bugChips(empiric) {
  // Quick-pick organisms = the syndrome's empiric `bugs` list. We show
  // those first as the most likely cultures-back path, then expose every
  // remaining ORGS entry through a dropdown for the off-script cases.
  const syn = empiric.syndrome;
  const synBugs = (syn.bugs || []).filter(b => ORG_BY_ID[b]);
  const remaining = ORGS.filter(o => !synBugs.includes(o.id));
  return { synBugs, remaining };
}

function ReassessmentPanel({ caseState, setCaseState, empiric, onDrug, onOrg }) {
  if(!empiric) return null;

  const cultures = caseState.cultures || { status: "pending", organism: null };
  const clinical = caseState.clinical || { stable:false, absorbing:false, sourceControlled:false };
  // startDate moved to DurationBlock; ReassessmentPanel no longer reads it.

  const r = applyReassessment(empiric, caseState);
  const { synBugs, remaining } = _bugChips(empiric);

  /* Mutators — each input pushes a single, scoped update into caseState
     so the controlled-input contract holds and the URL hash stays in sync. */
  const setCultureStatus = (status) => setCaseState(c => ({
    ...c, cultures: { status, organism: status === "back" ? (c.cultures && c.cultures.organism) || null : null },
  }));
  const setOrganism = (organism) => setCaseState(c => ({
    ...c, cultures: { status: "back", organism },
  }));
  const setClinical = (key, val) => setCaseState(c => ({
    ...c, clinical: { ...(c.clinical || {}), [key]: val },
  }));

  const orgChip = (id, selected) => {
    const o = ORG_BY_ID[id];
    if(!o) return null;
    return (
      <button key={id} type="button"
        onClick={() => setOrganism(id)}
        aria-pressed={!!selected}
        style={{
          display:"inline-flex", alignItems:"center", gap:5,
          fontSize:11.5, fontWeight:600, padding:"4px 10px", borderRadius:999,
          background: selected ? "var(--ox)" : "var(--ox-softer)",
          color: selected ? "#fff" : "var(--ox)",
          border: `1px solid ${selected ? "var(--ox)" : "var(--ox-line)"}`,
          cursor:"pointer", whiteSpace:"nowrap",
        }}>
        <Bug size={10}/> {o.label}
      </button>
    );
  };

  const clinChip = (key, label, IconC) => (
    <button type="button"
      onClick={() => setClinical(key, !clinical[key])}
      aria-pressed={!!clinical[key]}
      style={{
        display:"inline-flex", alignItems:"center", gap:6,
        fontSize:12, fontWeight:600, padding:"6px 11px", borderRadius:8,
        background: clinical[key] ? "var(--decision-start-bg)" : "var(--paper2)",
        color: clinical[key] ? "var(--decision-start)" : "var(--ink2)",
        border: `1px solid ${clinical[key] ? "var(--decision-start-line)" : "var(--line)"}`,
        cursor:"pointer",
      }}>
      {clinical[key] ? <Check size={12}/> : <IconC size={12}/>} {label}
    </button>
  );

  return (
    <Section kicker="Current state" icon={Stethoscope} testId="reassessment-panel">
      {r && r.activeTriggers.length > 0 && (
        <div style={{ fontSize:11, color:"var(--ink2)", fontStyle:"italic", marginBottom: 10 }}>
          {r.activeTriggers.length} trigger{r.activeTriggers.length === 1 ? "" : "s"} active — regimen has changed
        </div>
      )}
      <>
        {/* ----- INPUT: cultures ---------------------------------------- */}
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".1em",
            textTransform:"uppercase", color:"var(--muted)", fontWeight:600,
            marginBottom:6, display:"flex", alignItems:"center", gap:5,
          }}>
            <FlaskConical size={11}/> Cultures
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
            {[["pending","Pending"], ["back","Back"]].map(([k, lab]) => (
              <button key={k} type="button" onClick={() => setCultureStatus(k)}
                aria-pressed={cultures.status === k}
                style={{
                  fontSize:12, fontWeight:600, padding:"5px 12px", borderRadius:8,
                  background: cultures.status === k ? "var(--ox)" : "var(--paper2)",
                  color: cultures.status === k ? "#fff" : "var(--ink2)",
                  border: `1px solid ${cultures.status === k ? "var(--ox)" : "var(--line)"}`,
                  cursor:"pointer",
                }}>
                {lab}
              </button>
            ))}
            {cultures.status === "back" && (
              <span style={{ fontSize:11.5, color:"var(--muted)", marginLeft:6 }}>
                — organism:
              </span>
            )}
          </div>

          {cultures.status === "back" && (
            <div style={{ marginTop: 9 }}>
              {synBugs.length > 0 && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:6 }}>
                  {synBugs.map(id => orgChip(id, cultures.organism === id))}
                </div>
              )}
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:10.5, color:"var(--muted)", fontFamily:"var(--mono)", letterSpacing:".06em" }}>OTHER:</span>
                <select
                  value={cultures.organism || ""}
                  onChange={e => setOrganism(e.target.value || null)}
                  aria-label="Pick a cultures-back organism"
                  style={{
                    flex:"0 1 auto", fontFamily:"var(--sans)", fontSize:12, color:"var(--ink)",
                    background:"var(--paper)", border:"1px solid var(--line)", borderRadius:7,
                    padding:"5px 9px", cursor:"pointer",
                  }}>
                  <option value="">— pick —</option>
                  {remaining.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ----- INPUT: clinical ---------------------------------------- */}
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".1em",
            textTransform:"uppercase", color:"var(--muted)", fontWeight:600,
            marginBottom:6, display:"flex", alignItems:"center", gap:5,
          }}>
            <Crosshair size={11}/> Clinical status
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {clinChip("stable",            "Stable & improving", Check)}
            {clinChip("absorbing",         "Tolerating oral",    Pill)}
            {clinChip("sourceControlled",  "Source controlled",  Crosshair)}
          </div>
        </div>

        {/* Start date + duration clock moved to DurationBlock in
            Phase D2 v3 — they're a duration concern, not a current-
            state one. ReassessmentPanel now focuses on cultures +
            clinical chips + reassessment output. */}

        {/* ----- OUTPUT: structured delta from applyReassessment -------- */}
        {r && (
          <div data-testid="reassessment-output" style={{ marginTop: 16, paddingTop: 14, borderTop: "1px dashed var(--line2)" }}>
            <div style={{
              fontFamily:"var(--mono)", fontSize:10, letterSpacing:".12em",
              textTransform:"uppercase", color:"var(--ox-deep)", fontWeight:700,
              marginBottom:10, display:"flex", alignItems:"center", gap:6,
            }}>
              <TrendingDown size={12}/>
              <span>What changes today</span>
            </div>

            {r.directed && (
              <div style={{
                padding:"10px 12px", background:"var(--ox-softer)", border:"1px solid var(--ox-line)",
                borderRadius:8, marginBottom:8,
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                  <Crosshair size={12} color="var(--ox)"/>
                  <span style={{ fontSize:11.5, fontWeight:700, color:"var(--ox-deep)", letterSpacing:".02em" }}>NARROW TO</span>
                  <button type="button" onClick={() => onOrg && onOrg(r.cultures.organism)}
                    style={{
                      fontSize:11.5, fontWeight:600, color:"var(--ox)", background:"var(--panel)",
                      border:"1px solid var(--ox-line)", borderRadius:5, padding:"2px 7px", cursor:"pointer",
                    }}>
                    <Bug size={10} style={{ verticalAlign:"-1px", marginRight:3 }}/> {r.cultures.label}
                  </button>
                </div>
                <div style={{ fontSize:13, color:"var(--ink)", lineHeight:1.55, fontWeight:600 }}>
                  {renderRich(r.directed.first, onDrug)}
                </div>
                {r.directed.alt && (
                  <div style={{ fontSize:12, color:"var(--ink2)", marginTop:4 }}>
                    <span style={{ fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".08em", textTransform:"uppercase", color:"var(--muted)", marginRight:6 }}>ALT</span>
                    {renderRich(r.directed.alt, onDrug)}
                  </div>
                )}
                {r.directed.cav && (
                  <div style={{ fontSize:11.5, color:"var(--muted)", marginTop:5, lineHeight:1.5, fontStyle:"italic" }}>
                    <AlertTriangle size={10} style={{ verticalAlign:"-1px", marginRight:4 }}/>
                    {r.directed.cav}
                  </div>
                )}
              </div>
            )}

            {r.drop.length > 0 && (
              <div style={{
                padding:"10px 12px", background:"var(--decision-avoid-bg)", border:"1px solid var(--decision-avoid-line)",
                borderRadius:8, marginBottom:8,
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                  <Scissors size={12} color="var(--decision-avoid)"/>
                  <span style={{ fontSize:11.5, fontWeight:700, color:"var(--decision-avoid)", letterSpacing:".02em" }}>STOP THESE</span>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {r.drop.map(n => (
                    <button key={n} type="button" onClick={() => onDrug && onDrug(n)}
                      style={{
                        display:"inline-flex", alignItems:"center", gap:4,
                        fontSize:11.5, fontWeight:600, padding:"3px 9px", borderRadius:999,
                        background:"var(--panel)", color:"var(--decision-avoid)",
                        border:"1px solid var(--decision-avoid-line)",
                        textDecoration:"line-through", textDecorationColor:"var(--decision-avoid)",
                        cursor:"pointer",
                      }}>
                      {n.split(" / ")[0].replace(/\s*\(IV\)/i, "")}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize:11, color:"var(--muted)", marginTop:6, fontStyle:"italic" }}>
                  {r.narrow.note}
                </div>
              </div>
            )}

            {r.ivpo && (
              <div style={{
                padding:"10px 12px", background:"var(--decision-start-bg)", border:"1px solid var(--decision-start-line)",
                borderRadius:8, marginBottom:8,
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                  <ArrowRight size={12} color="var(--decision-start)"/>
                  <span style={{ fontSize:11.5, fontWeight:700, color:"var(--decision-start)", letterSpacing:".02em" }}>IV→PO CANDIDATES</span>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:5 }}>
                  {r.ivpo.candidates.map(n => (
                    <button key={n} type="button" onClick={() => onDrug && onDrug(n)}
                      style={{
                        display:"inline-flex", alignItems:"center", gap:3,
                        fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:999,
                        background:"var(--panel)", color:"var(--decision-start)",
                        border:"1px solid var(--decision-start-line)", cursor:"pointer",
                      }}>
                      <Pill size={9}/> {n}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize:11, color:"var(--muted)", fontStyle:"italic" }}>
                  Switch when all are true: {r.ivpo.criteria.join(" · ")}. Confirm the oral agent covers the pathogen.
                </div>
              </div>
            )}

            {/* Duration clock removed from this panel — DurationBlock
                now owns the stop-date display + start-date input. The
                applyReassessment engine still computes r.duration for
                use by other consumers but this UI doesn't render it
                here to avoid duplicating the same fact in two places. */}
          </div>
        )}
      </>
    </Section>
  );
}

export { ReassessmentPanel };
