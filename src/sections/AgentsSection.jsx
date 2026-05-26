/* section · AgentsSection — Phase B3 of the Wave 2 reference IA restructure.

   The "Agents" section of the new 5-section IA. Encapsulates everything a
   clinician asks about a drug:
     · Formulary  — the alphabetized class list with renally-adjusted doses,
                    the β-lactamase resistance ladder, and the β-lactam
                    cross-reactivity / penicillin-allergy delabeling map.
     · Dose       — Cockcroft-Gault calculator, body-weight descriptors,
                    vancomycin / aminoglycoside loading, renal-tracking
                    agents, therapeutic drug monitoring, and the special
                    populations the calculator doesn't capture.
     · Safety     — the agent × organ-system toxicity matrix, monitoring
                    that catches harm early, high-yield interactions, and
                    hepatic dosing for the agents that escape the renal
                    reflex.

   Extracted verbatim from App.jsx's renderReference / renderDose /
   renderSafety so the visual output matches byte-for-byte. The parent owns
   the sub-nav and passes `activeTab` ∈ { "reference", "dose", "safety" };
   this component renders exactly one panel. Filter state local to the
   formulary view (route/cover) stays inside the component because it does
   not round-trip through the URL hash; the spectrum-selection state
   (pickOrg / pickDrug) is owned by App because the knowledge-graph
   drawer's "Spectrum" link writes to it from outside this section.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState } from "react";
import {
  Activity, AlertTriangle, Beaker, Brain, Calculator, Check, Droplets,
  Filter, FlaskConical, HeartPulse, Info, LayoutGrid, Microscope, Network,
  Pill, RotateCcw, ShieldAlert, ShieldCheck, Syringe, TrendingDown, X, Zap,
} from "lucide-react";
import { Num, ToxDot, ChildPughScorer } from "../components/primitives";
import { drugCoversOrg, drugRoute } from "../engines/lookup";
import {
  FORMULARY, FORM_FLAT, RENAL_TRIGGERS, TDM, TOX_COLS, SAFE, INTERACTIONS,
} from "../data/drugs";
import { ORGS, ORG_BY_ID, LADDER } from "../data/organisms";
import { ALLERGY_INTRO, ALLERGY, SPECIAL_POP } from "../data/content";
import { FORM_ICON } from "../data/ui-maps";

/* Local icon map for the high-yield interactions cards. The data model
   stores the icon by string key (it.ic) so the data layer stays decoupled
   from the icon library; this is the same map renderSafety used in App. */
const ICMAP_INT = {
  FlaskConical, Brain, HeartPulse, Droplets, X, Beaker,
};

function AgentsSection({
  activeTab,           // "reference" | "dose" | "safety"
  setTab,              // parent's tab setter (used by the formulary's "see Spectrum" link)
  ctx, d, dose,        // patient context + derived quantities + dose fn
  setCtxField,         // single-field updater for ctx (Dose tab inputs)
  setCpField,          // Child-Pugh single-field updater (Dose tab)
  pickOrg, pickDrug,   // spectrum-row selection from the drawer (Formulary tab)
  setPickOrg, setPickDrug,
  openDrug,            // monograph drawer opener
  openOrg,             // organism-card opener (reserved for future cross-links)
  openTrial,           // trial-card opener (reserved for future cross-links)
}) {
  /* Formulary-only filter state — class-flat covers/route filter. Not
     hash-encoded today; lift to props if a future PR adds shareable
     filter links. */
  const [fmRoute, setFmRoute] = useState("all"); // all | iv | po
  const [fmCover, setFmCover] = useState("");    // org id or ""

  /* Wave 5 PR-13c — spectrum + microbiome filter chips. Default OFF so
     existing screenshots / e2e baselines hold; activating any chip
     narrows the formulary instantly. The chip set is the common
     bedside taxonomy:
       apsa  antipseudomonal
       ana   anaerobic-active
       mrsa  anti-MRSA
       bl    β-lactam (subtract aztreonam for severe-allergy hunts)
     The microbiome chips use the PR-4 FORMULARY fields.   */
  const [fmSpectrum, setFmSpectrum] = useState({}); // { apsa, ana, mrsa, bl }
  const [fmCdiffMax, setFmCdiffMax] = useState(0); // 0 = no filter; 1–5 = max allowed
  const [fmMdrLevel, setFmMdrLevel] = useState(""); // "" | "low" | "med" | "high"

  /* Spectrum-chip filter — drives off the FORMULARY-derived activity
     matrix (drugCoversOrg) and the canonical drug class, NOT the
     intentionally-partial AGENT_RX registry.

     Codex review (PR #111) caught: AGENT_RX omits several FORMULARY
     agents (Ceftaroline, the novel β-lactam/inhibitor reserve set,
     etc.); driving spectrum chips from AGENT_RX silently excluded
     those valid matches. Sourcing from FORMULARY metadata is the
     correctness contract.

       apsa  →  drugCoversOrg(dr, "pseudo")
       mrsa  →  drugCoversOrg(dr, "mrsa")
       ana   →  drugCoversOrg(dr, "anaerobe")
       bl    →  drug class is a β-lactam class, excluding aztreonam
                (the monobactam — preserves the existing AGENT_RX
                semantic of "bl matches penicillins / cephalosporins
                / carbapenems but NOT aztreonam," which is the safety-
                relevant grouping for severe β-lactam allergy hunts). */
  const BETA_LACTAM_CLASSES = new Set([
    "Penicillins",
    "Cephalosporins",
    "Carbapenems & monobactam",
    "Novel reserve agents (IDSA 2024)",
  ]);
  /* FORMULARY stores class on the outer wrapper, not the inner drug
     record — flatten once so the predicate can resolve drug → class. */
  const _DRUG_CLASS_OF = (() => {
    const m = {};
    FORMULARY.forEach((c) => c.drugs.forEach((d) => { m[d.name] = c.cls; }));
    return m;
  })();
  const _isBetaLactam = (dr) =>
    BETA_LACTAM_CLASSES.has(_DRUG_CLASS_OF[dr.name]) && dr.name !== "Aztreonam";

  const _spectrumMatch = (dr) => {
    if(fmSpectrum.apsa && !drugCoversOrg(dr.name, "pseudo"))   return false;
    if(fmSpectrum.ana  && !drugCoversOrg(dr.name, "anaerobe")) return false;
    if(fmSpectrum.mrsa && !drugCoversOrg(dr.name, "mrsa"))     return false;
    if(fmSpectrum.bl   && !_isBetaLactam(dr))                  return false;
    return true;
  };

  const _microbiomeMatch = (dr) => {
    if(fmCdiffMax && typeof dr.cdiffScore === "number" && dr.cdiffScore > fmCdiffMax) return false;
    if(fmMdrLevel) {
      const levels = ["low", "med", "high"];
      const drIdx  = levels.indexOf(dr.mdrPressure || "");
      const fltIdx = levels.indexOf(fmMdrLevel);
      // "low" filter shows low only; "med" shows low+med; "high" shows all
      if(drIdx === -1 || drIdx > fltIdx) return false;
    }
    return true;
  };

  const toggleSpectrum = (key) => setFmSpectrum(prev => ({ ...prev, [key]: !prev[key] }));

  const crcl = d?.crcl;
  const crclBand = d?.crclBand;

  /* ============ PANEL: FORMULARY (was renderReference) ============ */
  const renderReference = () => {
    const selOrg = pickOrg, selDrug = pickDrug;
    const selHint = selOrg ? ("Showing activity against " + (ORG_BY_ID[selOrg]||{}).label + " — ★ marks a drug of choice.")
      : selDrug ? ("Showing the spectrum of " + selDrug + ".") : "";
    const _fmMatch = (dr) => {
      if (fmRoute === "iv" && !/iv/i.test(drugRoute(dr.name))) return false;
      if (fmRoute === "po" && !/po/i.test(drugRoute(dr.name))) return false;
      if (fmCover && !drugCoversOrg(dr.name, fmCover)) return false;
      if (!_spectrumMatch(dr)) return false;
      if (!_microbiomeMatch(dr)) return false;
      return true;
    };
    const fmClasses = FORMULARY.map(cl => ({ ...cl, drugs: cl.drugs.filter(_fmMatch) })).filter(cl => cl.drugs.length);
    const fmTotal = fmClasses.reduce((n, cl) => n + cl.drugs.length, 0);
    const fmActive = fmRoute !== "all" || !!fmCover ||
      Object.values(fmSpectrum).some(Boolean) || fmCdiffMax > 0 || !!fmMdrLevel;
    const clearAll = () => {
      setFmCover(""); setFmRoute("all"); setFmSpectrum({});
      setFmCdiffMax(0); setFmMdrLevel("");
    };
    return (
      <>
        <header style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{
              fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".24em",
              textTransform: "uppercase", color: "var(--neon-cyan, var(--ox))",
              fontWeight: 700,
            }}>FORMULARY</span>
            <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden style={{ color: "var(--neon-cyan, var(--ox))" }}>
              <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" fill="currentColor"/>
            </svg>
          </div>
          <h2 style={{
            fontFamily: "var(--serif)", fontSize: 48, fontWeight: 700,
            letterSpacing: "-.024em", lineHeight: 1.04,
            margin: "0 0 12px", color: "var(--ink)",
          }}>Antibiotic agents</h2>
          <p style={{
            fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 17,
            color: "var(--ink2)", lineHeight: 1.55, margin: 0, maxWidth: "62ch",
          }}>Every agent in the formulary, filterable by spectrum, route, and microbiome impact. Click an agent to open its monograph.</p>
          <div aria-hidden style={{
            height: 1, marginTop: 28,
            background: "linear-gradient(90deg, transparent, var(--neon-cyan, var(--ox)) 30%, var(--electric-blue, var(--ox)) 50%, var(--hot-magenta, var(--ox)) 70%, transparent)",
            opacity: 0.5,
          }} />
        </header>

        <h3 className="rx-h3"><span className="ic"><LayoutGrid size={18}/></span>Spectrum of activity</h3>
        <div className="rx-card" style={{display:"flex",gap:"14px",alignItems:"flex-start"}}>
          <div className="rx-accicon" style={{flex:"0 0 auto"}}><Microscope size={18}/></div>
          <div style={{minWidth:0}}>
            <div style={{fontWeight:700,fontSize:"14.5px",marginBottom:"3px"}}>
              The full spectrum chart now lives in the <button className="rx-tag t-ox clk" onClick={()=>setTab("spectrum")}>Spectrum tab</button>
            </div>
            <p style={{margin:0,fontSize:"12.5px",color:"var(--ink2)",lineHeight:1.55}}>
              {selHint
                ? selHint + " Open the Spectrum tab to see the full 49-agent × 49-organism map."
                : "The compact grid here has been replaced by a 49-agent × 49-organism interactive matrix that separates intrinsic from acquired resistance, marks drugs of choice, and carries the MIC / breakpoint / antibiogram primer."}
            </p>
            {(selOrg || selDrug) && (
              <button className="rx-resetbtn" style={{marginLeft:0,marginTop:"10px"}} onClick={()=>{setPickOrg(null);setPickDrug(null);}}><X size={13}/> Clear selection</button>
            )}
          </div>
        </div>

        <h3 className="rx-h3"><span className="ic"><Pill size={18}/></span>Formulary</h3>
        {ctx.on && <p className="rx-fnote-ctx"><Activity size={13}/> Doses below are adjusted for the active patient (CrCl <Num>{d.crcl ?? "—"}</Num> mL/min). Standard dose shown struck through where it changes.</p>}

        <div style={{
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: "14px 16px",
          boxShadow: "var(--shadow-e1)",
          marginBottom: 14,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>
        <div className="rx-fmbar">
          <span className="rx-fmbar-lab"><Filter size={13}/> Filter</span>
          <label className="rx-fmbar-field">
            <span>Covers</span>
            <select value={fmCover} onChange={e=>setFmCover(e.target.value)}>
              <option value="">Any organism</option>
              {ORGS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </label>
          <div className="rx-fmbar-seg" role="group" aria-label="Route">
            {[["all","All"],["iv","IV"],["po","PO"]].map(([k,lab]) => (
              <button key={k} aria-pressed={fmRoute===k} className={fmRoute===k?"on":""} onClick={()=>setFmRoute(k)}>{lab}</button>
            ))}
          </div>
          <span className="rx-fmbar-count"><Num>{fmTotal}</Num> of <Num>{FORM_FLAT.length}</Num> agents</span>
          {fmActive && <button className="rx-resetbtn" onClick={clearAll}><RotateCcw size={13}/> Clear</button>}
        </div>

        {/* Wave 5 PR-13c — spectrum + microbiome filter chips. Rendered
            on a second row beneath the route/coverage row so the existing
            visual baseline holds when no chip is active. */}
        <div className="rx-fmbar" style={{ flexWrap: "wrap", gap: 8 }}>
          <span className="rx-fmbar-lab" style={{ fontSize: 10 }}>
            <Activity size={13}/> Spectrum
          </span>
          {[
            ["apsa", "Antipseudomonal"],
            ["ana",  "Anaerobic"],
            ["mrsa", "Anti-MRSA"],
            ["bl",   "β-lactam"],
          ].map(([k, lab]) => (
            <button
              key={k}
              type="button"
              aria-pressed={!!fmSpectrum[k]}
              onClick={() => toggleSpectrum(k)}
              className={fmSpectrum[k] ? "rx-tag t-ox clk on" : "rx-tag t-neutral clk"}
              style={{ fontSize: 10, padding: "2px 8px" }}
            >
              {lab}
            </button>
          ))}
          <span style={{ width: 8 }} />
          <span className="rx-fmbar-lab" style={{ fontSize: 10 }}>
            <ShieldAlert size={13}/> Microbiome
          </span>
          <label className="rx-fmbar-field" style={{ fontSize: 10 }}>
            <span>Max C.diff</span>
            <select
              value={fmCdiffMax}
              onChange={(e) => setFmCdiffMax(Number(e.target.value))}
              aria-label="Max C. difficile risk score"
            >
              <option value={0}>Any</option>
              <option value={1}>≤ 1</option>
              <option value={2}>≤ 2</option>
              <option value={3}>≤ 3</option>
              <option value={4}>≤ 4</option>
            </select>
          </label>
          <label className="rx-fmbar-field" style={{ fontSize: 10 }}>
            <span>MDR pressure</span>
            <select
              value={fmMdrLevel}
              onChange={(e) => setFmMdrLevel(e.target.value)}
              aria-label="Maximum MDR-selection pressure"
            >
              <option value="">Any</option>
              <option value="low">low only</option>
              <option value="med">low + med</option>
              <option value="high">all</option>
            </select>
          </label>
        </div>
        </div>

        {fmCover && <p className="rx-fmbar-note">Showing agents with first- or second-line activity against <b>{(ORG_BY_ID[fmCover]||{}).label}</b> (derived from the spectrum matrix). Confirm against the local antibiogram.</p>}

        {fmTotal === 0
          ? <p className="rx-dc-muted" style={{padding:"8px 2px"}}>No formulary agent matches these filters. <button className="rx-dc-druglink" onClick={clearAll}>Clear filters</button>.</p>
          : fmClasses.map(cl => {
          const FI = FORM_ICON[cl.icon] || Pill;
          return (
            <div key={cl.cls} style={{
              borderRadius: "16px 4px 16px 4px",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              boxShadow: "var(--shadow-e1)",
              padding: "12px 14px 4px",
              marginBottom: 14,
              transition: "transform .18s ease, box-shadow .18s ease",
            }}>
              <div className="rx-classhdr"><span className="ic"><FI size={15}/></span>{cl.cls}</div>
              <table className="rx-ftable">
                <thead><tr><th>Agent</th><th>Typical adult IV dose</th><th>Renal</th><th>Decision-changing pearl</th></tr></thead>
                <tbody>
                  {cl.drugs.map(dr => {
                    const adj = dose(dr.name);
                    return (
                    <tr key={dr.name}>
                      <td className="tdname" data-l="Agent">
                        <button className="rx-fname rx-fname-link" onClick={()=>openDrug(dr.name)} title="Open the drug monograph">{dr.name}</button>
                        <div className="rx-fspec">{dr.spec}</div>
                      </td>
                      <td data-l="Dose">
                        {adj && adj.kind === "band" && adj.changed ? (
                          <span className="rx-fdose-wrap">
                            <span className="rx-fdose rx-fdose-adj"><Num>{adj.adjusted}</Num></span>
                            <s className="rx-fdose-was"><Num>{adj.normal}</Num></s>
                            {adj.note && <span className="rx-fdose-note">{adj.note}</span>}
                          </span>
                        ) : adj && adj.kind === "band" && !adj.changed ? (
                          <span className="rx-fdose-wrap"><span className="rx-fdose"><Num>{dr.dose}</Num></span><span className="rx-fdose-tag rx-tag-ok">unchanged at CrCl {crcl}</span></span>
                        ) : adj && adj.kind === "level" ? (
                          <span className="rx-fdose-wrap"><span className="rx-fdose">{adj.adjusted}</span>{adj.note && <span className="rx-fdose-note">{adj.note}</span>}</span>
                        ) : (
                          <span className="rx-fdose"><Num>{dr.dose}</Num></span>
                        )}
                      </td>
                      <td data-l="Renal"><span className="rx-frenal">{dr.renal}</span></td>
                      <td data-l="Pearl"><span className="rx-fpearl">{dr.pearl}</span></td>
                    </tr>
                  );})}
                </tbody>
              </table>
            </div>
          );
        })}

        <h3 className="rx-h3"><span className="ic"><Network size={18}/></span>The β-lactamase resistance ladder</h3>
        <p className="rx-lede" style={{marginBottom:6}}>Gram-negative resistance reads as a ladder of enzymes. Each rung defeats the agents below it and demands a specific escape — the organizing logic behind the resistant-GNR rows in Directed therapy.</p>
        <div className="rx-rung" style={{gridTemplateColumns:"1fr",marginBottom:6}}>
          <div className="rx-rung-grad" />
        </div>
        <div className="rx-ladder">
          {LADDER.map(r => (
            <div className="rx-rung" key={r.n}>
              <div className="rx-rung-rail"><div className="rx-rung-dot rx-mono">{r.n}</div><div className="rx-rung-line" /></div>
              <div className="rx-rung-body">
                <div className="rx-rung-name">{r.name} <span className="rx-rung-mech">{r.mech}</span></div>
                <div className="rx-rung-intensity" style={{["--w"]:r.intensity+"%"}} />
                <div className="rx-rung-detail">{r.detail}</div>
                <div className="rx-rung-agents">
                  {r.survive.map((a,ai) => <span key={ai} className="rx-tag t-ox">{a}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3 className="rx-h3"><span className="ic"><ShieldCheck size={18}/></span>β-lactam allergy cross-reactivity</h3>
        <div className="rx-callout"><Info size={15}/><span>{ALLERGY_INTRO}</span></div>
        <table className="rx-allergy">
          <thead><tr><th>Agent</th><th>Cross-reactivity</th><th>Shared structure / practical note</th></tr></thead>
          <tbody>
            {ALLERGY.map((a,i) => {
              const m = { hi:["xr-hi","xrd-hi","Higher"], lo:["xr-lo","xrd-lo","Low"], none:["xr-none","xrd-none","Negligible"] }[a.xreact];
              return (
                <tr key={i}>
                  <td><b>{a.a}</b></td>
                  <td><span className={"rx-xreact "+m[0]}><span className={"rx-xdot "+m[1]}/>{m[2]}</span><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{a.shares}</div></td>
                  <td>{a.note}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

      <h3 className="rx-h3"><span className="ic"><ShieldCheck size={18}/></span>Penicillin-allergy delabeling &mdash; reclaiming first-line &beta;-lactams</h3>
      <p className="rx-lede" style={{maxWidth:"82ch"}}>
        Roughly 10% of inpatients carry a penicillin-allergy label, yet <b>~90&ndash;95% are not truly allergic</b> &mdash;
        most have lost any IgE response over time or never had one. The label drives second-line agents, more
        vancomycin and fluoroquinolones, more <i>C. difficile</i>, and worse outcomes. Risk-stratify every label; the
        cross-reactivity map above shows that true penicillin&ndash;cephalosporin overlap is low (~1&ndash;2%) and is driven by
        <b> R1 side-chain similarity</b>, not the shared &beta;-lactam ring.
      </p>
      <div className="rx-tree" style={{marginTop:"4px"}}>
        <div className="rx-tier alt">
          <div className="rx-tierlab">Low-risk / unverified history</div>
          <div className="rx-rx">Proceed &mdash; use the indicated &beta;-lactam (cephalosporin); consider <b>direct oral amoxicillin challenge</b> to delabel</div>
          <div className="rx-rxnote">Isolated GI intolerance, remote/vague reaction, family history only, &ldquo;unknown,&rdquo; or non-allergic symptoms. Cefazolin&rsquo;s unique side chain makes it safe in nearly all penicillin allergy.</div>
        </div>
        <div className="rx-tier">
          <div className="rx-tierlab">Moderate-risk (benign IgE-suggestive)</div>
          <div className="rx-rx">Graded challenge (test dose) &mdash; or refer for penicillin skin testing</div>
          <div className="rx-rxnote">Remote urticaria or a reaction whose features are unclear. A two-step graded challenge under observation is reasonable; an unrelated-side-chain cephalosporin can usually be given directly.</div>
        </div>
        <div className="rx-tier sev">
          <div className="rx-tierlab">High-risk &mdash; do NOT challenge</div>
          <div className="rx-rx">Avoid the culprit and side-chain&ndash;related agents; ID/allergy referral</div>
          <div className="rx-rxnote">Anaphylaxis or recent severe IgE reaction &rarr; avoid and test before any re-exposure. <b>Severe cutaneous adverse reactions</b> (SJS/TEN, DRESS, AGEP), drug-induced hemolytic anemia, serum sickness, or organ involvement are an <b>absolute contraindication</b> to re-exposure &mdash; never challenge.</div>
        </div>
      </div>
      <div className="rx-callout"><Info size={15}/><span>Practical defaults: a documented penicillin allergy almost never precludes <b>cefazolin</b> (surgical prophylaxis, MSSA) or an unrelated-side-chain cephalosporin/carbapenem; <b>aztreonam</b> is safe in severe penicillin allergy (but shares a side chain with ceftazidime). Delabeling the low-risk majority is one of the highest-yield stewardship acts on the wards.</span></div>

      </>
    );
  };

  /* ============ PANEL: DOSE (was renderDose) ============ */
  const renderDose = () => (
    <>
      <h2 className="rx-h2">Dosing, renal adjustment & monitoring</h2>
      <p className="rx-lede">Correct dosing is as consequential as correct drug selection. Estimate clearance, identify which agents track renal function, and apply the rules that override the calculator: the loading dose, the site of infection, and body habitus.</p>

      <div className="rx-calc">
        <div className="rx-card">
          <h4 className="rx-h4"><span className="ic"><Calculator size={15}/></span>Patient &amp; clearance</h4>
          <div className="rx-field2">
            <div className="rx-field">
              <label>Age <span className="rx-mono" style={{color:"var(--muted)"}}>years</span></label>
              <input type="number" value={ctx.age} onChange={e=>setCtxField("age", e.target.value)} min="1" max="120"
                aria-invalid={d.errors.includes("age")} />
            </div>
            <div className="rx-field">
              <label>Sex</label>
              <div className="rx-seg">
                <button aria-pressed={ctx.sex==="M"} onClick={()=>setCtxField("sex","M")}>Male</button>
                <button aria-pressed={ctx.sex==="F"} onClick={()=>setCtxField("sex","F")}>Female</button>
              </div>
            </div>
          </div>
          <div className="rx-field2">
            <div className="rx-field">
              <label>Weight <span className="rx-mono" style={{color:"var(--muted)"}}>kg</span></label>
              <input type="number" value={ctx.weightKg} onChange={e=>setCtxField("weightKg", e.target.value)} min="1" max="400"
                aria-invalid={d.errors.includes("weight")} />
            </div>
            <div className="rx-field">
              <label>Height <span className="rx-mono" style={{color:"var(--muted)"}}>cm</span></label>
              <input type="number" value={ctx.heightCm} onChange={e=>setCtxField("heightCm", e.target.value)} min="120" max="220"
                aria-invalid={d.errors.includes("height")} />
            </div>
          </div>
          <div className="rx-field">
            <label>Serum creatinine <span className="rx-mono" style={{color:"var(--muted)"}}>mg/dL</span></label>
            <input type="number" step="0.1" value={ctx.scr} onChange={e=>setCtxField("scr", e.target.value)} min="0.1" max="25"
              aria-invalid={d.errors.includes("creatinine") || d.errors.includes("crcl-implausible")} />
          </div>
          <div className="rx-field2">
            <div className="rx-field">
              <label>Hepatic function <span className="rx-mono" style={{color:"var(--muted)"}}>Child-Pugh</span></label>
              <div className="rx-seg rx-seg-3">
                <button aria-pressed={ctx.hepatic==="none"} onClick={()=>setCtxField("hepatic","none")}>A / Normal</button>
                <button aria-pressed={ctx.hepatic==="moderate"} onClick={()=>setCtxField("hepatic","moderate")}>CP-B</button>
                <button aria-pressed={ctx.hepatic==="severe"} onClick={()=>setCtxField("hepatic","severe")}>CP-C</button>
              </div>
            </div>
            <div className="rx-field">
              <label>Renal replacement</label>
              <div className="rx-seg">
                <button aria-pressed={!ctx.hd} onClick={()=>setCtxField("hd", false)}>None</button>
                <button aria-pressed={ctx.hd} onClick={()=>setCtxField("hd", true)}>Intermittent HD</button>
              </div>
            </div>
          </div>
          <ChildPughScorer cp={ctx.cp} onField={setCpField} hepatic={ctx.hepatic} />
          <button className={"rx-ctxtoggle" + (ctx.on ? " on" : "")} aria-pressed={ctx.on}
            onClick={()=>setCtxField("on", !ctx.on)} disabled={!d.valid && !ctx.on}>
            {ctx.on ? <><Check size={15}/> Context applied — doses adjusted across the guide</>
                    : <><Activity size={15}/> Apply as patient context</>}
          </button>
          <p className="rx-fieldnote">When applied, the formulary shows <i>this</i> patient&rsquo;s renally-adjusted dose with the standard dose struck through, the bar above stays visible across tabs, and the empiric selector prefills host-resistance risks.</p>
        </div>
        <div>
          <div className="rx-result">
            <div className="num rx-num">{d.crcl==null ? "—" : d.crcl}</div>
            <div className="unit">mL/min · Cockcroft-Gault <span style={{opacity:.7}}>(the dosing standard)</span></div>
            {crclBand && <div className="band"><span style={{width:8,height:8,borderRadius:"50%",background:crclBand.c,display:"inline-block"}}/>{crclBand.t}</div>}
            <div className="eq">CrCl = (140 − age) × wt / (72 × SCr){ctx.sex==="F" ? " × 0.85" : ""}</div>
            {d.ckd != null && (
              <div className="rx-result-sub">
                CKD-EPI 2021 (race-free): <Num>{d.ckd}</Num> mL/min/1.73m²
                {d.discordant && <span className="disc"> · diverges from C-G at this habitus — dose by C-G, but flag</span>}
              </div>
            )}
          </div>

          {d.errors.length > 0 && (
            <div className="rx-disc" style={{marginTop:14}}>
              <AlertTriangle size={16}/>
              <span><b>Check inputs.</b> {(() => {
                const lbl = { age:"age (1–120 y)", weight:"weight (1–400 kg)", creatinine:"serum creatinine (0.1–25 mg/dL)", height:"height (90–250 cm)", "crcl-implausible":"this creatinine yields an implausible clearance (>250 mL/min) — recheck the value or use a minimum SCr of 0.8–1.0 in low-muscle-mass patients" };
                return d.errors.map(e => lbl[e] || e).join("; ");
              })()}. No clearance is shown until inputs are physiologically plausible.</span>
            </div>
          )}

          {d.arc && (
            <div className="rx-callout rx-callout-amber" style={{marginTop:14}}>
              <Zap size={16}/>
              <span><b>Augmented renal clearance (CrCl &gt; 130).</b> Standard doses may <b>under</b>-expose — consider extended or continuous β-lactam infusion and level-guided dosing. This is the young-trauma / hyperdynamic-sepsis underdosing trap that fixed renal tables never surface.</span>
            </div>
          )}

          {d.wt && (
            <div className="rx-card rx-wtcard" style={{marginTop:14}}>
              <div className="rx-wt-head">Body-weight descriptors</div>
              <div className="rx-wt-grid">
                <div className="rx-wt-cell"><span className="k">TBW</span><span className="v"><Num>{Math.round(d.wt.tbw)}</Num> kg</span></div>
                <div className="rx-wt-cell"><span className="k">IBW</span><span className="v"><Num>{Math.round(d.wt.ibw)}</Num> kg</span></div>
                <div className="rx-wt-cell"><span className="k">AdjBW</span><span className="v"><Num>{Math.round(d.wt.adjbw)}</Num> kg</span></div>
              </div>
              <p className="rx-wt-rule">
                Dose <b>vancomycin loading on actual (TBW)</b>; <b>aminoglycosides on adjusted (AdjBW)</b> when TBW exceeds IBW.
                {d.wt.tbw < d.wt.ibw && <> Here TBW is below IBW — dose by <b>actual</b> weight.</>}
              </p>
              {d.vanco && (
                <div className="rx-wt-vanco">
                  <div>Vancomycin load 20–25 mg/kg × actual = <Num>{d.vanco.lo}</Num>–<Num>{d.vanco.hi}</Num> mg{d.vanco.hi >= 3000 && " (capped ~3 g)"}.</div>
                  <div style={{marginTop:5}}>
                    {d.vanco.byLevels
                      ? <>Maintenance <b>by levels</b> — {ctx.hd ? "dose after each dialysis session; " : "CrCl too low or unavailable for a population estimate; "}target AUC 400–600 with pharmacy.</>
                      : <>Maintenance estimate <b>{d.vanco.mLo}–{d.vanco.mHi} mg {d.vanco.interval}</b> (15–20 mg/kg{d.vanco.capped && ", per-dose ~2 g cap"}) targeting AUC 400–600.{d.vanco.arc && <> ARC — expect higher requirement; sample early.</>}</>}
                  </div>
                  <div className="rx-wt-vanco-note">Population starting estimate, not a substitute for level-guided (Bayesian or two-level) AUC dosing. Confirm with pharmacy and adjust to levels.</div>
                </div>
              )}
              {d.amino && (
                <div className="rx-wt-vanco" style={{background:"var(--green-soft)", borderColor:"var(--green-line)", color:"var(--green)"}}>
                  <div>Gentamicin / tobramycin extended-interval 7 mg/kg × {d.amino.wtBasis} = <Num>{d.amino.dose}</Num> mg
                    {d.amino.byLevels
                      ? <>, then <b>by levels</b>{ctx.hd ? " (redose by pre-dialysis level)" : " (CrCl too low for a fixed interval)"}.</>
                      : <> <b>{d.amino.interval}</b>.</>}</div>
                  <div className="rx-wt-vanco-note" style={{borderTopColor:"var(--green-line)"}}>Extended-interval estimate (concentration-dependent killing). Confirm with a nomogram-timed level; avoid in evolving AKI. Use synergy dosing — not this — for enterococcal/staphylococcal endocarditis.</div>
                </div>
              )}
            </div>
          )}

          <div className="rx-callout" style={{marginTop:14}}><Info size={15}/><span>Cockcroft-Gault is the <b>dosing</b> reference (it is what drug labels were validated against), not an eGFR for staging CKD. CKD-EPI is shown alongside for staging; when the two diverge at weight or age extremes, dose by C-G but flag it. In unstable AKI no steady-state estimate is reliable — dose conservatively and monitor.</span></div>
        </div>
      </div>

      <h3 className="rx-h3"><span className="ic"><TrendingDown size={18}/></span>Which agents track renal function</h3>
      <div className="rx-card" style={{padding:0,overflow:"hidden"}}>
        <table className="rx-rentable">
          <thead><tr><th>Agent</th><th>Adjustment principle</th></tr></thead>
          <tbody>{RENAL_TRIGGERS.map((r,i)=>(<tr key={i}><td style={{fontWeight:600,whiteSpace:"nowrap"}}>{r[0]}</td><td>{r[1]}</td></tr>))}</tbody>
        </table>
      </div>
      <div className="rx-callout"><AlertTriangle size={15}/><span><b>The first dose is a full dose.</b> Loading doses are driven by volume of distribution, not clearance — never reduce or skip the first (loading) dose for renal impairment. Adjust the <i>maintenance</i> doses that follow.</span></div>

      <h3 className="rx-h3"><span className="ic"><FlaskConical size={18}/></span>Therapeutic drug monitoring</h3>
      <div className="rx-2col">
        {TDM.map((t,i)=>(
          <div className="rx-card" key={i}>
            <div style={{fontWeight:700,fontSize:14}}>{t.d}</div>
            <div className="rx-mono" style={{fontSize:12,color:"var(--ox)",margin:"3px 0 7px"}}>{t.t}</div>
            <div style={{fontSize:13,color:"var(--ink2)",lineHeight:1.5}}>{t.note}</div>
          </div>
        ))}
      </div>

      <h3 className="rx-h3"><span className="ic"><Info size={18}/></span>When the calculator is not enough</h3>
      <div className="rx-2col">
        {SPECIAL_POP.map((s,i)=>(
          <div className="rx-card rx-mini" key={i}>
            <h4><span className="ic"><Info size={15}/></span>{s.h}</h4>
            <ul>{s.pts.map((p,pi)=><li key={pi}>{p}</li>)}</ul>
          </div>
        ))}
      </div>
    </>
  );

  /* ============ PANEL: SAFETY (was renderSafety) ============ */
  const renderSafety = () => (
    <div>
      <h2 className="rx-h2">Adverse effects, monitoring &amp; interactions</h2>
      <p className="rx-lede">
        Toxicity decides as many regimens as spectrum does. The matrix maps the dominant organ-system harms by class;
        the cards below give the monitoring that catches them and the high-yield interactions that change a regimen
        before it starts. A filled square is a notable or boxed-warning concern, amber is moderate / dose- or
        duration-dependent, and the light square is low / class-typical.
      </p>

      <div className="rx-mtxwrap">
        <table className="rx-mtx">
          <thead>
            <tr>
              <th className="corner"><div className="cl">Agent &nbsp;&middot;&nbsp; toxicity &rarr;</div></th>
              {TOX_COLS.map(c => <th key={c.k}><div className="rx-mtx-colh">{c.label}</div></th>)}
            </tr>
          </thead>
          <tbody>
            {SAFE.map((r,i) => r.band ? (
              <tr key={"b"+i} className="band"><td colSpan={TOX_COLS.length+1}>{r.band}</td></tr>
            ) : (
              <tr key={r.ag}>
                <td className="lab">{r.ag}{r.note ? <small style={{whiteSpace:"normal",fontFamily:"var(--sans)",fontSize:"10.5px",lineHeight:1.35}}>{r.note}</small> : null}</td>
                {TOX_COLS.map(c => <td key={c.k} className="rx-cell2"><ToxDot lv={r.c[c.k]} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rx-mtxleg">
        <span className="li"><span className="tox-d tx-hi" /> Notable / boxed-warning</span>
        <span className="li"><span className="tox-d tx-mod" /> Moderate / dose- or duration-dependent</span>
        <span className="li"><span className="tox-d tx-lo" /> Low / class-typical</span>
        <span className="li"><span className="tx-dot-txt">&middot;</span> Not characteristic</span>
      </div>

      <h3 className="rx-h3"><span className="ic"><Syringe size={18} /></span>Monitoring that catches harm early</h3>
      <div className="rx-2col">
        <div className="rx-mini">
          <h4><span className="ic"><Calculator size={16} /></span>Drug levels</h4>
          <ul>
            <li><b>Vancomycin</b> &mdash; dose to <b>AUC/MIC 400&ndash;600</b> (Bayesian or two-level); troughs alone overshoot toward nephrotoxicity.</li>
            <li><b>Aminoglycosides</b> &mdash; extended-interval levels (or peak/trough); follow renal function and audiometry on prolonged courses.</li>
            <li><b>Some &beta;-lactams</b> &mdash; therapeutic drug monitoring is emerging for the critically ill (cefepime neurotoxicity, target attainment).</li>
          </ul>
        </div>
        <div className="rx-mini">
          <h4><span className="ic"><Activity size={16} /></span>Labs &amp; clinical surveillance</h4>
          <ul>
            <li><b>Linezolid</b> &mdash; weekly CBC; ask about vision/neuropathy beyond 2 weeks.</li>
            <li><b>Daptomycin</b> &mdash; weekly CPK; hold statins; watch for eosinophilic pneumonia.</li>
            <li><b>TMP-SMX</b> &mdash; potassium and creatinine within days; CBC on long courses.</li>
            <li><b>Rifampin / nafcillin / chloramphenicol</b> &mdash; LFTs (and CBC for chloramphenicol).</li>
            <li><b>Fluoroquinolones, macrolides</b> &mdash; baseline ECG + electrolytes when stacking QT risk.</li>
          </ul>
        </div>
      </div>

      <h3 className="rx-h3"><span className="ic"><AlertTriangle size={18} /></span>High-yield interactions</h3>
      <div className="rx-trig">
        {INTERACTIONS.map((it,i) => { const IC = ICMAP_INT[it.ic] || Info; return (
          <div key={i} className="rx-trigcard rx-card">
            <h4><span className="ic"><IC size={15} /></span>{it.h}</h4>
            <p style={{margin:"2px 0 0",fontSize:"12.5px",color:"var(--ink2)",lineHeight:1.55}}>{it.b}</p>
          </div>
        ); })}
      </div>

      <div className="rx-callout">
        <Info size={16} />
        <span>
          Two safety levers sit outside the matrix: <b>renal dose adjustment</b> (cefepime, carbapenems, aminoglycosides,
          vancomycin, TMP-SMX, nitrofurantoin, colistin all accumulate) and <b>duration</b> &mdash; linezolid marrow and
          optic toxicity, metronidazole neuropathy, and aminoglycoside oto-/nephrotoxicity are all duration-driven, so
          the shortest effective course is itself a safety intervention.
        </span>
      </div>

      <h3 className="rx-h3"><span className="ic"><ShieldAlert size={18}/></span>Hepatic dosing &amp; special populations</h3>
      <p className="rx-lede" style={{marginBottom:10}}>Most antibacterials are renally cleared, so hepatic adjustment is the exception — but a handful carry real liver considerations that the renal-dosing reflex misses.</p>
      <div className="rx-card" style={{padding:0,overflow:"hidden"}}>
        <table className="rx-heptable">
          <thead><tr><th>Agent</th><th>Hepatic consideration</th></tr></thead>
          <tbody>
            {[
              ["Nafcillin / oxacillin","Largely biliary/hepatic elimination — useful when renal function is poor, but hepatotoxicity and interstitial nephritis."],
              ["Ceftriaxone","Dual biliary + renal elimination; biliary sludging/pseudolithiasis. Caution in combined hepatic and renal failure."],
              ["Metronidazole","Reduce dose in severe hepatic impairment (Child-Pugh C) — it accumulates."],
              ["Clindamycin","Hepatic metabolism; caution and monitoring in severe liver disease."],
              ["Tigecycline","Reduce the maintenance dose in Child-Pugh C."],
              ["Rifampin","Hepatotoxic and a potent CYP3A inducer — monitor LFTs and anticipate drug interactions."],
              ["Chloramphenicol","Reduce in hepatic failure; dose-related marrow suppression."],
            ].map(([ag,c]) => (
              <tr key={ag}>
                <td className="rx-hep-ag"><button className="rx-fname-link" onClick={()=>openDrug(ag)} title="Open the drug monograph">{ag}</button></td>
                <td className="rx-hep-c">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rx-callout" style={{marginTop:14}}>
        <Info size={16}/>
        <span>
          <b>Pregnancy and lactation</b> sit outside this adult inpatient reference. As broad orientation only — not a substitute for an obstetric-pharmacy source or LactMed — β-lactams, azithromycin, and clindamycin are generally regarded as compatible, whereas fluoroquinolones, tetracyclines, and (near term or first trimester) trimethoprim-sulfamethoxazole are generally avoided. Confirm every choice against a dedicated resource.
        </span>
      </div>
    </div>
  );

  /* ============ ROUTER: parent-controlled sub-tab ============ */
  if (activeTab === "dose")    return renderDose();
  if (activeTab === "safety")  return renderSafety();
  return renderReference(); // "reference" + default
}

export { AgentsSection };
