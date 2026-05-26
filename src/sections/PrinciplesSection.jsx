/* section · PrinciplesSection — PRINCIPLES section of the 5-section IA.
   Renders the union of the legacy renderApproach + renderCourse +
   renderAdjuncts tabs (approach / course / adjuncts) selected by the
   `activeTab` prop, which the parent's section sub-nav controls.

   Extracted from App.jsx in Wave 2 · Phase B6 (reference IA restructure):
   the component is intentionally self-contained — no `../App` imports —
   so the parent owns sub-tab state and the section is free to move.

   The prop surface mirrors the other Wave-2 sections (ctx / d / dose
   are accepted for signature stability even when the three panels do
   not currently consume them) so a sibling switch is a straight swap.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import {
  Activity, AlertTriangle, ArrowRight, BookOpen, Check, ChevronRight,
  Clock, CornerDownRight, Crosshair, GitBranch, Hospital, Info,
  Layers, ListChecks, Plus, Scissors, TrendingDown, X, Zap,
} from "lucide-react";
import { Cite, Ev, SectionDisc } from "../components/primitives";
import { IVtoPO, RapidDxTimeout } from "../components/cards";
import { SEPSIS_FLOW, PROPHYLAXIS, OPAT, TREES } from "../data/content";
import { TREE_ICON } from "../data/ui-maps";
import { EVOLVING, REFS, DURATIONS, DUR_MAX, DUR_BY_DX, CLOCK } from "../data/evidence";
import { SYNDROMES } from "../data/syndromes";

/* ============================================================
   Wave 7 W7-B · cinematic section header tokens (with fallbacks)
   Shared design language across Syndromes / Agents / Compare /
   Principles / Organisms reference sections. Tokens reference
   var(--ox) and friends from styles/tokens.css; the explicit
   fallbacks here keep the surface rendering correctly if a
   future token rename lands ahead of this section.
   ============================================================ */
const W7_NEON   = "var(--w7-neon, var(--ox-bright, #9B2D2F))";
const W7_KICKER = "var(--w7-kicker, var(--muted, #6E675E))";
const W7_LINE   = "var(--w7-hairline, var(--ox-line, #E2C7C4))";
const W7_GLASS_BG     = "var(--w7-glass-bg, rgba(255, 255, 255, 0.72))";
const W7_GLASS_BORDER = "var(--w7-glass-border, var(--line, #E6E0D8))";
const W7_GLASS_SHADOW = "var(--w7-glass-shadow, 0 2px 8px rgba(15, 23, 42, 0.04), 0 12px 32px -16px rgba(15, 23, 42, 0.10))";

/* Cinematic kicker + display headline + italic byline + gradient hairline.
   Used at the top of each sub-panel. */
function W7SectionHead({ kicker, title, lede }) {
  return (
    <header style={{ margin: "0 0 28px", position: "relative" }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.18em",
        textTransform: "uppercase", color: W7_KICKER, marginBottom: 14,
      }}>
        <span aria-hidden="true" style={{
          display: "inline-block", width: 6, height: 6, borderRadius: 999,
          background: W7_NEON,
          boxShadow: `0 0 0 3px ${W7_NEON}22, 0 0 12px ${W7_NEON}55`,
        }}/>
        {kicker}
        <span aria-hidden="true" style={{ opacity: 0.55, fontSize: 9 }}>✦</span>
      </div>
      <h2 className="rx-h2" style={{
        fontFamily: "var(--serif)", fontSize: "clamp(32px, 4.4vw, 48px)",
        lineHeight: 1.04, letterSpacing: "-0.015em", margin: "0 0 14px",
        color: "var(--ink)",
      }}>{title}</h2>
      {lede && (
        <p className="rx-lede" style={{
          fontFamily: "var(--serif)", fontStyle: "italic",
          fontSize: 17, lineHeight: 1.55, color: "var(--ink2)",
          margin: "0 0 18px", maxWidth: "70ch",
        }}>{lede}</p>
      )}
      <div aria-hidden="true" style={{
        height: 1, width: "100%",
        background: `linear-gradient(90deg, ${W7_NEON} 0%, ${W7_LINE} 38%, transparent 100%)`,
        marginTop: 4,
      }}/>
    </header>
  );
}

/* Sub-section heading: small kicker line + serif sub-headline.
   The gradient hairline above echoes the section head. */
function W7SubHead({ icon, kicker, title }) {
  return (
    <div style={{ margin: "32px 0 14px" }}>
      <div aria-hidden="true" style={{
        height: 1, width: "100%",
        background: `linear-gradient(90deg, ${W7_NEON}, ${W7_LINE} 32%, transparent 70%)`,
        marginBottom: 14,
      }}/>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.16em",
        textTransform: "uppercase", color: W7_KICKER, marginBottom: 6,
      }}>
        {kicker}
      </div>
      <h3 className="rx-h3" style={{
        fontFamily: "var(--serif)", fontSize: "clamp(22px, 2.4vw, 28px)",
        lineHeight: 1.18, letterSpacing: "-0.01em", margin: 0,
        display: "flex", alignItems: "center", gap: 10, color: "var(--ink)",
      }}>
        {icon && <span className="ic" style={{ color: W7_NEON }}>{icon}</span>}
        {title}
      </h3>
    </div>
  );
}

/* Glass-style container with asymmetric radii — a soft-elevation
   panel used to host decision trees, sepsis flow, and similar
   visually prominent blocks. */
function W7Glass({ children, flip = false, style = {}, ...rest }) {
  const radii = flip
    ? { borderRadius: "4px 16px 4px 16px" }
    : { borderRadius: "16px 4px 16px 4px" };
  return (
    <div style={{
      background: W7_GLASS_BG,
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      border: `1px solid ${W7_GLASS_BORDER}`,
      boxShadow: W7_GLASS_SHADOW,
      padding: 20,
      ...radii,
      ...style,
    }} {...rest}>{children}</div>
  );
}

function PrinciplesSection({
  activeTab,            // "approach" | "course" | "adjuncts" — controlled by App's sub-nav
  setTab,               // handler to switch sub-tab (kept for signature symmetry)
  ctx, d, dose,         // patient context + derived quantities + dose() lookup (signature symmetry)
  openDrug, openOrg, openTrial,
}) {
  /* ============ PANEL: APPROACH ============ */
  const approachPanel = (
    <>
      <W7SectionHead
        kicker="PRINCIPLES"
        title="Empiric principles"
        lede="The reasoning sequence behind every regimen on this page — from sepsis recognition to allergy delabeling, OPAT eligibility, and the iv-to-PO switch criteria."
      />
      <SectionDisc />

      <div className="rx-quick">
        <div className="rx-qc"><div className="k"><Zap size={13}/> A time-limited bridge</div><div className="b">In septic shock, deliver effective therapy within <b>one hour</b>. Empiric breadth is provisional — reassess against culture data at <b>48&ndash;72 hours</b> in every case.</div></div>
        <div className="rx-qc"><div className="k"><Crosshair size={13}/> Source determines all</div><div className="b">The probable organisms, the appropriate agent, and the treatment duration each follow from the <b>anatomic source</b>. An undrained focus is not salvaged by any antibiotic.</div></div>
        <div className="rx-qc"><div className="k"><TrendingDown size={13}/> De-escalation is standard</div><div className="b">Narrowing to the single most targeted agent does <b>not</b> compromise outcomes; it reduces resistance selection, toxicity, and <i>C. difficile</i> risk.</div></div>
      </div>

      <W7SubHead kicker="SEQUENCE · 01" icon={<ListChecks size={18}/>} title="The empiric reasoning sequence" />
      <p className="rx-stepb" style={{margin:"0 0 16px"}}>Seven questions, addressed in order. Each constrains the next: the anatomic source predicts the flora, the flora and host define the spectrum, and the spectrum and site determine the agent and its dose.</p>
      <W7Glass style={{ padding: 20, margin: "0 0 8px" }}>
      <div className="rx-spine">
        {[
          ["Is this infection, and is it severe?","Distinguish infection from colonization and from non-infectious inflammation. Establish whether sepsis or septic shock is present, as this sets both the urgency and the required breadth. Obtain cultures before antibiotics whenever doing so will not delay therapy in shock."],
          ["What is the anatomic source?","The source predicts the likely flora and dictates the regimen. Commit to the most probable site and cover its characteristic pathogens; an unstated source is an unstated organism list."],
          ["What are the likely organisms?","From the source and host, enumerate the realistic pathogens. Cover what is plausible rather than everything conceivable. The spectrum matrix and syndrome cards make this explicit."],
          ["What are the host's resistance risks?","Prior resistant isolates, recent antimicrobial exposure or hospitalization, indwelling devices, immunosuppression, and relevant travel raise the empiric ceiling. The local antibiogram calibrates the remainder."],
          ["Which agent, and at what dose?","Select the narrowest agent that reliably covers the plausible pathogens. Dose for the site of infection (central nervous system, bone, deep focus) and for renal function, while giving a full first dose regardless of clearance."],
          ["When and how will therapy be narrowed?","Pre-commit to reassessment at 48–72 hours: culture data and clinical trajectory guide de-escalation to a single targeted agent, intravenous-to-oral conversion, and discontinuation of redundant coverage."],
          ["What is the duration and the stop date?","Establish an evidence-based duration at the outset. Most courses are shorter than traditional practice; document the stop date in the plan rather than deferring indefinitely."],
        ].map(([h,b],i) => (
          <div className="rx-step" key={i}>
            <div className="rx-stepnum rx-mono">{i+1}</div>
            <div className="rx-steph">{h}</div>
            <p className="rx-stepb">{b}</p>
          </div>
        ))}
      </div>
      </W7Glass>

      <W7SubHead kicker="SEQUENCE · 02" icon={<Activity size={18}/>} title="Sepsis and septic shock: the first-hour sequence" />
      <W7Glass flip style={{ padding: 18, margin: "0 0 8px" }}>
      <div className="rx-tflow" tabIndex={0} role="group" aria-label="Sepsis first-hour sequence (scrollable)">
        {SEPSIS_FLOW.map((s,i) => (
          <div className="rx-tflow-step" key={i}>
            <div className={"rx-tflow-box " + (s.kind || "")}>
              <div className="rx-tflow-lab rx-mono">{s.lab}</div>
              <div className="rx-tflow-tx">{s.tx}</div>
            </div>
            {i < SEPSIS_FLOW.length - 1 && <span className="rx-tflow-arrow"><ArrowRight size={18}/></span>}
          </div>
        ))}
      </div>
      </W7Glass>

      <W7SubHead kicker="DECISION" icon={<GitBranch size={18}/>} title="Indications to broaden or to withhold coverage" />
      <div className="rx-trig">
        <div className="rx-card rx-trigcard">
          <h4><span className="ic"><Plus size={15}/></span>Broaden coverage when</h4>
          <ul>
            <li><b>MRSA:</b> prior MRSA, purulent or device-associated source, severe sepsis, or high local prevalence &rarr; add vancomycin (linezolid for pulmonary infection).</li>
            <li><b>Pseudomonas:</b> neutropenia, structural lung disease, HAP/VAP, or recent broad-spectrum exposure &rarr; antipseudomonal &beta;-lactam.</li>
            <li><b>ESBL / resistant GNR:</b> prior isolate or high-prevalence exposure &rarr; empiric carbapenem.</li>
            <li><b>Septic shock:</b> the broadest defensible regimen with full loading doses within the hour.</li>
          </ul>
        </div>
        <div className="rx-card rx-trigcard">
          <h4><span className="ic"><Check size={15}/></span>Withhold or de-escalate when</h4>
          <ul>
            <li><b>No MRSA risk:</b> empiric vancomycin is not reflexive &mdash; it adds nephrotoxicity and an acute kidney injury signal alongside piperacillin-tazobactam.</li>
            <li><b>No Pseudomonas risk:</b> a narrower &beta;-lactam (ceftriaxone) suffices and spares antipseudomonal selection pressure.</li>
            <li><b>Cultures returned:</b> narrow to the single most targeted active agent at 48&ndash;72 hours.</li>
            <li><b>Stable and absorbing:</b> convert intravenous to oral therapy and set the stop date.</li>
          </ul>
        </div>
      </div>

      <W7SubHead kicker="ALGORITHMS" icon={<Layers size={18}/>} title="Core decision algorithms" />
      <p className="rx-stepb" style={{margin:"0 0 12px"}}>Four high-frequency decisions, each reducible to a single pivotal branch. Use the summary below for rapid reference; the full algorithm follows.</p>
      <div className="rx-algindex">
        {TREES.map(tree => {
          const TI = TREE_ICON[tree.icon] || GitBranch;
          return (
            <a key={tree.id} href={"#alg-" + tree.id} className="rx-algchip"
               onClick={(e)=>{ e.preventDefault(); const el=document.getElementById("alg-"+tree.id); if(el) el.scrollIntoView({behavior:"smooth", block:"start"}); }}>
              <span className="rx-algchip-ic"><TI size={15}/></span>
              <span className="rx-algchip-tx"><span className="t">{tree.title}</span><span className="d">{tree.pivot}</span></span>
            </a>
          );
        })}
      </div>
      {TREES.map((tree, idx) => {
        const TI = TREE_ICON[tree.icon] || GitBranch;
        return (
          <div key={tree.id} id={"alg-" + tree.id} style={{margin:"0 0 18px", scrollMarginTop:"16px"}}>
            <h4 className="rx-h4"><span className="ic" style={{ color: W7_NEON }}><TI size={15}/></span>{tree.title}</h4>
            <p className="rx-stepb" style={{margin:"0 0 10px"}}>{tree.intro}</p>
            <W7Glass flip={idx % 2 === 1} style={{ padding: 16 }}>
            <div className="rx-tree">
              {tree.nodes.map((node,ni) => (
                <div className="rx-tnode" key={ni}>
                  <div className="rx-tq"><span className="dot rx-mono">{ni+1}</span><span className="q">{node.q}</span></div>
                  <div className="rx-tbranches">
                    {node.branches.map((br,bi) => (
                      <div className="rx-tbranch" key={bi}>
                        <span className="rx-tcond"><CornerDownRight size={12}/> {br.cond}</span>
                        <div className="rx-trx">{br.rx}</div>
                        <div className="rx-twhy">{br.why}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            </W7Glass>
          </div>
        );
      })}

      <RapidDxTimeout onCite={(id)=>openTrial(id)} />
    </>
  );

  /* ============ PANEL: COURSE ============ */
  const coursePanel = (
    <>
      <W7SectionHead
        kicker="PRINCIPLES · COURSE"
        title="Duration, de-escalation, and step-down"
        lede="Evidence-based courses are shorter than traditional practice, with most durations now defined by randomized trials. Fix the duration at the outset, start the clock at the appropriate moment, and convert to oral therapy once the criteria are met."
      />

      <W7SubHead kicker="DURATION" icon={<Clock size={18}/>} title="Evidence-based durations" />
      <div className="rx-card" style={{padding:0,overflow:"hidden"}}>
        <table className="rx-durtable">
          <thead><tr><th>Indication</th><th style={{width:170}}>Course</th><th>Days</th><th>Evidence</th></tr></thead>
          <tbody>
            {DURATIONS.map(g => (
              <React.Fragment key={g.group}>
                <tr className="rx-durgroup"><td colSpan={4}>{g.group}</td></tr>
                {g.rows.map((r,i)=>(
                  <tr key={i}>
                    <td><div style={{fontWeight:600}}>{r.dx}</div>{r.ext && <div className="rx-durext">{r.ext}</div>}</td>
                    <td>
                      <div className="rx-barwrap" title={r.days + " days"}>
                        <div className="rx-barbase" style={{width:Math.min(100,(r.base/DUR_MAX)*100)+"%"}} />
                        {r.max>r.base && <div className="rx-barext" style={{left:(r.base/DUR_MAX)*100+"%",width:((r.max-r.base)/DUR_MAX)*100+"%"}} />}
                      </div>
                    </td>
                    <td><span className="rx-durdays">{r.days}</span></td>
                    <td><Ev kind={r.ev} />{r.trial && <div style={{fontSize:10,color:"var(--muted)",fontFamily:"var(--mono)",marginTop:3}}>{r.trial}</div>}{(DUR_BY_DX[r.dx]||{}).ref && <div style={{marginTop:4}}><Cite id={DUR_BY_DX[r.dx].ref} onClick={(cid)=>openTrial(cid)} /></div>}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rx-2col" style={{marginTop:18}}>
        <div className="rx-card rx-mini">
          <h4><span className="ic"><Clock size={15}/></span>Start the clock correctly</h4>
          <ul>{CLOCK.map((c,i)=><li key={i}><b>{c[0]}:</b> {c[1]}</li>)}</ul>
        </div>
        <IVtoPO onDrug={openDrug} />
      </div>

      <W7SubHead kicker="NARROW" icon={<TrendingDown size={18}/>} title="De-escalation discipline" />
      <div className="rx-card rx-mini">
        <ul>
          <li><b>Reassess at 48–72 h in every patient.</b> Cultures and clinical trajectory drive the narrowing decision at a scheduled review.</li>
          <li><b>Narrow to one targeted agent.</b> De-escalation does not worsen outcomes and reduces resistance, C. difficile, and toxicity.</li>
          <li><b>Stop redundant coverage.</b> Drop empiric vancomycin at 48 h if MRSA is not isolated; collapse double Gram-negative coverage to a single active agent.</li>
          <li><b>Source control takes precedence over spectrum.</b> Apparent failure most often reflects an undrained focus rather than a resistant organism — re-image before escalating.</li>
          <li><b>Procalcitonin can support stopping</b> in respiratory infection and sepsis, but never gates starting therapy.</li>
        </ul>
      </div>

      <W7SubHead kicker="OPAT" icon={<Hospital size={18}/>} title="Outpatient parenteral antimicrobial therapy" />
      <p className="rx-lede" style={{marginBottom:10}}>{OPAT.intro}</p>
      <div className="rx-2col">
        <div className="rx-card rx-mini">
          <h4><span className="ic"><Check size={15}/></span>Candidate criteria</h4>
          <ul>{OPAT.criteria.map((c,i)=><li key={i}>{c}</li>)}</ul>
        </div>
        <div className="rx-card" style={{padding:0,overflow:"hidden"}}>
          <table className="rx-rentable">
            <thead><tr><th>Agent</th><th>OPAT role</th></tr></thead>
            <tbody>{OPAT.agents.map((a,i)=>(<tr key={i}><td style={{fontWeight:600,whiteSpace:"nowrap"}}>{a[0]}</td><td>{a[1]}</td></tr>))}</tbody>
          </table>
        </div>
      </div>
      <div className="rx-callout"><Info size={15}/><span>{OPAT.oral}</span></div>

      <W7SubHead kicker="IV → PO" icon={<ArrowRight size={18}/>} title="Intravenous-to-oral conversion: bioavailability as the determinant" />
      <p className="rx-lede" style={{maxWidth:"82ch"}}>
        The instinct to keep a stable patient on IV antibiotics is rarely justified. Several oral agents achieve
        serum levels indistinguishable from IV; for these, switching once the patient is improving shortens length of
        stay, removes line risk, and does not compromise cure &mdash; trials such as <b>POET</b> (endocarditis) and
        <b>OVIVA</b> (bone &amp; joint) extended early oral therapy even into deep-seated infection. The agent&rsquo;s
        oral bioavailability, not the severity label, decides whether the switch is sound.
      </p>
      <div className="rx-card" style={{padding:0,overflow:"hidden"}}>
        <table className="rx-rentable">
          <thead><tr><th>Agent</th><th>Oral F</th><th>IV : PO</th><th>Note</th></tr></thead>
          <tbody>
            <tr><td style={{fontWeight:600}}>Levofloxacin / moxifloxacin</td><td className="rx-mono">~99%</td><td className="rx-mono">1 : 1</td><td>Essentially complete &mdash; switch is seamless.</td></tr>
            <tr><td style={{fontWeight:600}}>Ciprofloxacin</td><td className="rx-mono">~70%</td><td className="rx-mono">400 IV &asymp; 500&ndash;750 PO</td><td>Separate from di-/trivalent cations by 2&ndash;4 h.</td></tr>
            <tr><td style={{fontWeight:600}}>Linezolid</td><td className="rx-mono">~100%</td><td className="rx-mono">1 : 1</td><td>No advantage to IV once tolerating enteral.</td></tr>
            <tr><td style={{fontWeight:600}}>Metronidazole</td><td className="rx-mono">~100%</td><td className="rx-mono">1 : 1</td><td>Reserve IV for the patient who cannot take oral.</td></tr>
            <tr><td style={{fontWeight:600}}>TMP-SMX</td><td className="rx-mono">~90&ndash;100%</td><td className="rx-mono">1 : 1</td><td>Same exposure orally; watch K&#8314; and creatinine.</td></tr>
            <tr><td style={{fontWeight:600}}>Doxycycline</td><td className="rx-mono">~90&ndash;100%</td><td className="rx-mono">1 : 1</td><td>Take with water, sit upright (esophagitis).</td></tr>
            <tr><td style={{fontWeight:600}}>Fluconazole (cross-ref)</td><td className="rx-mono">~90%</td><td className="rx-mono">1 : 1</td><td>Antifungal &mdash; same principle; see the antifungal reference.</td></tr>
            <tr><td style={{fontWeight:600}}>Clindamycin</td><td className="rx-mono">~90%</td><td className="rx-mono">~1 : 1</td><td>Reliable oral step-down for soft-tissue/toxin indications.</td></tr>
            <tr><td style={{fontWeight:600}}>Azithromycin</td><td className="rx-mono">~37%</td><td className="rx-mono">1 : 1</td><td>Low serum but tissue/intracellular driven &mdash; dosed 1:1 by design.</td></tr>
            <tr><td style={{fontWeight:600}}>Rifampin</td><td className="rx-mono">high</td><td className="rx-mono">1 : 1</td><td>Adjunct only; take on an empty stomach.</td></tr>
            <tr><td style={{fontWeight:600}}>&beta;-lactams (amoxicillin, cephalexin, cefuroxime/cefpodoxime)</td><td className="rx-mono">~50&ndash;90%</td><td className="rx-mono">dose up</td><td>Lower/variable F &mdash; adequate for step-down in stable patients to complete a course, not for the unstable.</td></tr>
          </tbody>
        </table>
      </div>
      <div className="rx-2col" style={{marginTop:"14px"}}>
        <div className="rx-mini">
          <h4><span className="ic"><Check size={16}/></span>Switch when all are true</h4>
          <ul>
            <li>Hemodynamically <b>stable and improving</b>; afebrile &asymp;24&ndash;48 h.</li>
            <li><b>Functioning, absorbing GI tract</b> and able to take oral.</li>
            <li>An oral agent with <b>adequate bioavailability and spectrum</b> for the pathogen.</li>
            <li><b>Source controlled</b> (drained/debrided) where applicable.</li>
          </ul>
        </div>
        <div className="rx-mini">
          <h4><span className="ic"><AlertTriangle size={16}/></span>Keep IV (or individualize) for</h4>
          <ul>
            <li>Endovascular infection, <b>CNS infection</b>, and undrained deep collections (unless an OVIVA/POET-type oral strategy is deliberately chosen with ID).</li>
            <li>Malabsorption, ileus, vomiting, or unreliable enteral access.</li>
            <li>No oral option with adequate F against the organism (e.g., most Pseudomonas outside the fluoroquinolones).</li>
          </ul>
        </div>
      </div>

    </>
  );

  /* ============ PANEL: ADJUNCTS & EVIDENCE ============ */
  const adjunctsPanel = (
    <>
      <W7SectionHead
        kicker="PRINCIPLES · ADJUNCTS"
        title="Adjuncts & evidence"
        lede="Surgical prophylaxis (prevention, not treatment), the explicit scope boundary of this reference, and the primary sources behind every recommendation."
      />

      <W7SubHead kicker="PROPHYLAXIS" icon={<Scissors size={18}/>} title="Surgical antimicrobial prophylaxis" />
      <p className="rx-lede" style={{marginBottom:10}}>{PROPHYLAXIS.intro}</p>
      <div className="rx-2col" style={{marginBottom:16}}>
        <div className="rx-card rx-mini">
          <h4><span className="ic"><ListChecks size={15}/></span>Principles</h4>
          <ul>{PROPHYLAXIS.principles.map((p,i)=><li key={i}><b>{p[0]}:</b> {p[1]}</li>)}</ul>
        </div>
        <div className="rx-card" style={{padding:0,overflow:"hidden"}}>
          <table className="rx-rentable">
            <thead><tr><th>Procedure</th><th>Agent</th></tr></thead>
            <tbody>{PROPHYLAXIS.table.map((r,i)=>(<tr key={i}><td style={{fontWeight:600}}>{r[0]}</td><td>{r[1]}</td></tr>))}</tbody>
          </table>
        </div>
      </div>

      <W7SubHead kicker="SCOPE" icon={<Layers size={18}/>} title="Scope of this reference" />
      <div className="rx-2col">
        <div className="rx-card rx-mini">
          <h4><span className="ic"><Check size={15}/></span>In scope</h4>
          <ul>
            <li>Adult, hospital-based <b>antibacterial</b> selection, dosing, and duration</li>
            <li>Empiric and directed therapy across {SYNDROMES.length} inpatient syndromes</li>
            <li>Resistant Gram-negative strategy (IDSA 2024) and the resistance ladder</li>
            <li>Surgical prophylaxis and OPAT as the bordering blur outward</li>
          </ul>
        </div>
        <div className="rx-card rx-mini">
          <h4><span className="ic"><X size={15}/></span>Deliberately out of scope</h4>
          <ul>
            <li><b>Antifungals</b> (candidemia, invasive mold, PJP) — a separate reference</li>
            <li><b>Antivirals</b> (HSV, CMV, influenza, hepatitis, HIV) — a separate reference</li>
            <li>Antimycobacterial and antiparasitic therapy</li>
            <li>Pediatric and neonatal dosing; pregnancy-specific regimens</li>
          </ul>
        </div>
      </div>
      <div className="rx-callout"><Info size={15}/><span>Where a regimen above references an antifungal (empiric candidemia coverage in sepsis, neutropenic enterocolitis, persistent febrile neutropenia), the pointer is intentional — the agent and dose live in the antifungal reference.</span></div>

      <W7SubHead kicker="EVOLVING" icon={<TrendingDown size={18}/>} title="What's changing" />
      <p className="rx-lede" style={{marginBottom:10}}>Fronts where the evidence is actively moving — flagged so the guidance above is read with its half-life in mind.</p>
      <div className="rx-evolve">
        {EVOLVING.map((e,i)=>(
          <div className="rx-evcard" key={i}>
            <div className="evh">{e.h}{e.ref && <Cite id={e.ref} onClick={(cid)=>openTrial(cid)} />}</div>
            <p className="evb">{e.b}</p>
            <span className="evdir">{e.dir}</span>
          </div>
        ))}
      </div>

      <W7SubHead kicker="REFERENCES" icon={<BookOpen size={18}/>} title="Primary sources" />
      <div className="rx-card" style={{padding:"4px 4px"}}>
        <table className="rx-reftable">
          <tbody>
            {REFS.map((r,i)=>(
              <tr key={i} className="rx-refrow" tabIndex={0} role="button"
                onClick={()=>openTrial(r.id)}
                onKeyDown={e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); openTrial(r.id); } }}
                title="Open the evidence card">
                <td style={{width:130}}><span className="rx-reftag">{r.tag}</span></td>
                <td><div style={{fontWeight:600,fontSize:13}}>{r.t}</div><div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>{r.src}</div></td>
                <td className="rx-refchev"><ChevronRight size={15}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <W7SubHead kicker="COMBINATION" icon={<Plus size={18}/>} title="Combination therapy: established synergy versus unsupported use" />
      <p className="rx-lede" style={{maxWidth:"82ch"}}>
        Adding a second agent is justified by a specific mechanism &mdash; documented synergy, guaranteeing one active
        drug against a resistant organism before susceptibilities return, or toxin suppression. Continued reflexively
        after the culture is back, it adds toxicity, cost, <i>C. difficile</i>, and resistance pressure without benefit.
      </p>
      <div className="rx-2col">
        <div className="rx-mini">
          <h4><span className="ic"><Check size={16}/></span>Where combination is supported</h4>
          <ul>
            <li><b>Enterococcal endocarditis</b> &mdash; ampicillin + ceftriaxone (E. faecalis) or ampicillin + gentamicin: documented bactericidal synergy.</li>
            <li><b>Empiric severe / neutropenic Pseudomonas</b> &mdash; two antipseudomonals empirically to raise the odds of one active agent, then <b>de-escalate to monotherapy</b> once susceptible.</li>
            <li><b>Necrotizing GAS / toxic shock</b> &mdash; &beta;-lactam + clindamycin for toxin suppression (Eagle effect).</li>
            <li><b>Prosthetic-material staph</b> (PJI, PVE, hardware) &mdash; add <b>rifampin</b> for biofilm (never alone).</li>
            <li><b>MBL-producing CRE</b> &mdash; ceftazidime-avibactam + aztreonam; selected MDR-GNR combinations.</li>
          </ul>
        </div>
        <div className="rx-mini">
          <h4><span className="ic"><X size={16}/></span>Where combination is not supported</h4>
          <ul>
            <li><b>Double Gram-negative coverage continued after susceptibilities</b> &mdash; no outcome benefit once one active agent is confirmed; de-escalate.</li>
            <li><b>&beta;-lactam + aminoglycoside &ldquo;synergy&rdquo; for Gram-negative bacteremia</b> &mdash; no mortality benefit, more nephrotoxicity.</li>
            <li><b>Redundant anaerobic cover</b> &mdash; metronidazole added to a carbapenem or piperacillin-tazobactam that already covers anaerobes.</li>
            <li><b>Empiric vancomycin continued</b> without MRSA evidence; &ldquo;broader is better&rdquo; as a reflex.</li>
          </ul>
        </div>
      </div>
      <div className="rx-callout"><TrendingDown size={15}/><span>The discipline is symmetrical with empiric breadth: start broad enough to be safe, then <b>de-escalate to the narrowest single agent the susceptibilities allow</b> &mdash; combination therapy earns its place only by a named mechanism, not by anxiety.</span></div>

    </>
  );

  if (activeTab === "course") return coursePanel;
  if (activeTab === "adjuncts") return adjunctsPanel;
  return approachPanel;
}

export { PrinciplesSection };
