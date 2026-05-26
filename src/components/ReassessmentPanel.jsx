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
import { NotchedBanner } from "./decor/NotchedBanner.jsx";
import { GradientHairline } from "./decor/GradientHairline.jsx";

function _bugChips(empiric) {
  // Quick-pick organisms = the syndrome's empiric `bugs` list. We show
  // those first as the most likely cultures-back path, then expose every
  // remaining ORGS entry through a dropdown for the off-script cases.
  const syn = empiric.syndrome;
  const synBugs = (syn.bugs || []).filter(b => ORG_BY_ID[b]);
  const remaining = ORGS.filter(o => !synBugs.includes(o.id));
  return { synBugs, remaining };
}

function ReassessmentPanel({ caseState, setCaseState, empiric, onDrug, onOrg, hasStructuredDuration = false }) {
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
      {/* Wave 10 — when ANY trigger has fired, the change-summary line is
          promoted from flat italic to a NotchedBanner with the "trigger"
          severity (amber). The notch + tile + uppercase label match the
          "REGIMEN CHANGED" semantic exactly — the visual gravity equals
          the clinical gravity. Zero triggers → no banner (no chrome). */}
      {r && r.activeTriggers.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <NotchedBanner
            severity="trigger"
            label={`Regimen has changed · ${r.activeTriggers.length} trigger${r.activeTriggers.length === 1 ? "" : "s"} active`}
            icon={<TrendingDown size={14} aria-hidden />}
          />
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
                  /* W10 · asymmetric 10/3 corners + glass tint + cyan caret +
                      cyan focus halo. Inline style so we don't need to inject
                      a component-scoped stylesheet for a single dropdown. */
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--neon-cyan, var(--ox-bright))";
                    e.currentTarget.style.boxShadow = "0 0 0 2px var(--neon-cyan, var(--ox-bright)), 0 0 14px color-mix(in srgb, var(--neon-cyan, var(--ox-bright)) 30%, transparent)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--line)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  style={{
                    flex:"0 1 auto", fontFamily:"var(--sans)", fontSize:12, color:"var(--ink)",
                    background:`linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(245,250,253,0.55) 100%), url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'><path d='M1 1.5L6 6.5L11 1.5' stroke='%2300D4FF' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/></svg>")`,
                    backgroundRepeat:"no-repeat, no-repeat",
                    backgroundPosition:"0 0, right 9px center",
                    backgroundSize:"cover, 12px 8px",
                    border:"1px solid var(--line)",
                    borderRadius:"10px 3px 10px 3px",
                    padding:"7px 28px 7px 10px",
                    cursor:"pointer",
                    appearance:"none",
                    WebkitAppearance:"none",
                    MozAppearance:"none",
                    outline:"none",
                    transition:"border-color .15s var(--ease-out, ease), box-shadow .18s var(--ease-out, ease)",
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
          <div data-testid="reassessment-output" style={{ marginTop: 16 }}>
            {/* Wave 10 — gradient hairline replaces the flat dashed top
                border. The cyan-blue gradient knot signals "below this
                line, the system has computed what's different" — same
                separator vocabulary the rest of the answer-canvas uses
                between question and answer phases. */}
            <GradientHairline variant="cyan-blue" withDot style={{ margin: "0 0 14px" }} />
            <div style={{
              fontFamily:"var(--mono)", fontSize:10, letterSpacing:".12em",
              textTransform:"uppercase", color:"var(--ox-deep)", fontWeight:700,
              marginBottom:10, display:"flex", alignItems:"center", gap:6,
            }}>
              <TrendingDown size={12}/>
              <span>What changes today</span>
            </div>

            {/* Wave 10 — NARROW TO panel picks up the rx-glass-bleed inner
                cyan glow + outer halo so the post-cultures "this is the
                directed regimen" reads with the headline-panel chrome
                used by Monitoring + Duration headlines elsewhere. */}
            {r.directed && (
              <div className="rx-glass-bleed" style={{
                padding:"10px 12px", background:"var(--ox-softer)", border:"1px solid var(--ox-line)",
                borderRadius:8, marginBottom:8, position: "relative",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5, position: "relative", zIndex: 2 }}>
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
                <div style={{ fontSize:13, color:"var(--ink)", lineHeight:1.55, fontWeight:600, position: "relative", zIndex: 2 }}>
                  {renderRich(r.directed.first, onDrug)}
                </div>
                {r.directed.alt && (
                  <div style={{ fontSize:12, color:"var(--ink2)", marginTop:4, position: "relative", zIndex: 2 }}>
                    <span style={{ fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".08em", textTransform:"uppercase", color:"var(--muted)", marginRight:6 }}>ALT</span>
                    {renderRich(r.directed.alt, onDrug)}
                  </div>
                )}
                {r.directed.cav && (
                  <div style={{ fontSize:11.5, color:"var(--muted)", marginTop:5, lineHeight:1.5, fontStyle:"italic", position: "relative", zIndex: 2 }}>
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

            {/* Duration clock: rendered only as a FALLBACK when the
                syndrome has no structured DurationBlock content
                (i.e., not yet authored in syndromeDecision.js). When
                DurationBlock exists, it owns the duration display
                + start-date input + computed stop-date, and this
                panel suppresses its own clock to avoid showing the
                same fact in two places. Until the remaining ~104
                syndromes are bulk-authored, this graceful fallback
                keeps the duration affordance intact everywhere. */}
            {r.duration && !hasStructuredDuration && (
              <div style={{
                padding:"10px 12px", background:"var(--paper2)", border:"1px solid var(--line)",
                borderRadius:8,
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                  <Clock size={12} color="var(--ink2)"/>
                  <span style={{ fontSize:11.5, fontWeight:700, color:"var(--ink)", letterSpacing:".02em" }}>DURATION CLOCK</span>
                </div>
                <div style={{ fontSize:13, color:"var(--ink)", lineHeight:1.55 }}>
                  <b>{r.duration.days} days</b> from the first effective dose. Once the syndrome's structured duration content is authored, the clock and start date move into the Duration block above.
                </div>
              </div>
            )}
          </div>
        )}
      </>
    </Section>
  );
}

export { ReassessmentPanel };
