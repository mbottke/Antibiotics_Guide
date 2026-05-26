/* component · composite cards (regimen, drug, organism, trials, IV->PO, compare).
   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState } from "react";
import { Activity, AlertTriangle, ArrowRight, BookOpen, Bug, Calculator, Check, Clock, CornerDownRight, Crosshair, Droplets, FlaskConical, GitBranch, Info, LayoutGrid, ListChecks, Microscope, Network, Plus, Scissors, ShieldAlert, ShieldCheck, Star, Stethoscope, TrendingDown, X, Zap } from "lucide-react";
import { Cite, DoseAdjustBar, Ev, Num } from "./primitives.jsx";
import { drugLookup, orgLookup } from "../engines/lookup.js";
import { SPX_AGENTS, SPX_CLASSES, SPX_ORG_BY } from "../spectrum/Spectrum.jsx";
import { allergyGuidance, interactionsForAgent, penChips, regimenInteractions, synEvidence } from "../engines/clinical.js";
import { FORMULARY, TOX_LABEL } from "../data/drugs.js";
import { SYNDROMES } from "../data/syndromes.js";
import { buildRegimen, deescalationPlan, refineRegimen, regimenAgents } from "../engines/regimen.js";
import { deriveCtx } from "../engines/dosing.js";
import { renderGloss, renderRich } from "./rich-text.jsx";
import { CMP_LVL, CMP_ORGS, MRSA_CELL, ORG_BY_ID } from "../data/organisms.js";
import { GUIDELINES, TRIAL_DETAIL } from "../data/evidence.js";
import { getSyndromesForTrial } from "../data/evidenceMap.js";
import { IVPO_CRITERIA, PO_AGENTS, RAPID_DX, TIMEOUT_ITEMS } from "../data/content.js";
import { RDX_ICON } from "../data/ui-maps.js";
import { _cmpActive } from "../lib/util.js";

/* ---- A2 · PERSISTENT PATIENT-CONTEXT BAR ----------------------------------
   Thin strip under the nav, shown only when ctx.on. Mono/tabular numerals,
   the CrCl band chip, and an ARC flag when CrCl>130. Collapsible context that
   visually ties the calculators to every adjusted dose elsewhere. */
function PatientContextBar({ ctx, d, onClear, onJump }){
  if(!ctx.on) return null;
  const band = d.crclBand;
  const allergyLabel = { none:"no β-lactam allergy", mild:"mild β-lactam allergy", severe:"severe β-lactam allergy" }[ctx.blAllergy] || "";
  const risks = [ctx.mrsaRisk && "MRSA risk", ctx.pseudoRisk && "Pseudomonas risk", ctx.esblRisk && "ESBL risk", ctx.severe && "severe / shock"].filter(Boolean);
  return (
    <div className="rx-ctxbar" role="region" aria-label="Active patient context">
      <div className="rx-wrap rx-ctxbar-inner">
        <span className="rx-ctxbar-lab"><Activity size={13} aria-hidden /> Patient context</span>
        <span className="rx-ctxchip"><Num>{ctx.age}</Num> y</span>
        <span className="rx-ctxchip"><Num>{ctx.weightKg}</Num> kg</span>
        <span className="rx-ctxchip">SCr <Num>{ctx.scr}</Num></span>
        <span className="rx-ctxchip">{ctx.sex === "F" ? "Female" : "Male"}</span>
        {d.crcl != null
          ? <button className="rx-ctxchip rx-ctxchip-band clk" onClick={onJump} title="Open the dosing calculator"
              style={{ ["--bandc"]: band ? band.c : "var(--muted)" }}>
              CrCl <Num>{d.crcl}</Num> mL/min · {band ? band.t.split(" — ")[0] : ""}
            </button>
          : <button className="rx-ctxchip rx-ctxchip-warn clk" onClick={onJump}><AlertTriangle size={12} aria-hidden /> CrCl unavailable — check inputs</button>}
        {d.arc && <span className="rx-ctxchip rx-ctxchip-arc"><Zap size={12} aria-hidden /> ARC — risk of underdosing</span>}
        {risks.length > 0 && <span className="rx-ctxchip rx-ctxchip-risk">{risks.join(" · ")}</span>}
        {ctx.blAllergy !== "none" && <span className="rx-ctxchip rx-ctxchip-risk">{allergyLabel}</span>}
        {ctx.hepatic && ctx.hepatic !== "none" && <span className="rx-ctxchip rx-ctxchip-risk">{ctx.hepatic === "severe" ? "Child-Pugh C" : "Child-Pugh B"}</span>}
        {ctx.hd && <span className="rx-ctxchip rx-ctxchip-risk">on HD</span>}
        <button className="rx-ctxbar-clear" onClick={onClear} aria-label="Clear patient context"><X size={13} aria-hidden /> Clear</button>
      </div>
    </div>
  );
}

/* ---- Drug monograph card (rendered inside the shared Drawer) ---- */
function DrugCard({ name, doseFn, onSpectrum, onSyndrome, onOrg }){
  const lk = drugLookup(name);
  const adj = doseFn ? doseFn(name) : null;
  const docOrgs = lk.spx ? (lk.spx.doc || []).map(sx => (SPX_ORG_BY[sx] || {}).label).filter(Boolean) : [];
  const firstOrgs = lk.spx ? Object.keys(lk.spx.c || {}).filter(k => lk.spx.c[k] === "first" && !(lk.spx.doc || []).includes(k)).map(k => (SPX_ORG_BY[k] || {}).label).filter(Boolean) : [];
  const pen = penChips(lk.pen);
  const toxDomains = lk.tox ? Object.keys(lk.tox.c || {}).filter(k => lk.tox.c[k] === "hi" || lk.tox.c[k] === "mod").map(k => ({ k:TOX_LABEL[k] || k, hi:lk.tox.c[k] === "hi" })) : [];
  return (
    <div className="rx-dc">
      {lk.form && <div className="rx-dc-sub">{lk.form.spec} · {lk.form.cls}{lk.spx ? <> · <span className={lk.spx.cidal ? "rx-cidal-w" : "rx-static-w"}>{lk.spx.cidal ? "bactericidal" : "bacteriostatic"}</span> · {lk.spx.route}</> : null}</div>}

      {/* Dosing */}
      <div className="rx-dc-sec">
        <div className="rx-dc-h"><Calculator size={14}/> Dosing</div>
        {lk.form && (
          <div className="rx-dc-dose">
            {adj && adj.kind === "band" && adj.changed ? (
              <div><span className="rx-dc-dose-adj"><Num>{adj.adjusted}</Num></span> <s className="rx-fdose-was"><Num>{adj.normal}</Num></s> <span className="rx-dc-dosetag">adjusted for this patient</span></div>
            ) : adj && adj.kind === "level" ? (
              <div className="rx-dc-dose-adj">{adj.adjusted}</div>
            ) : (
              <div><Num>{lk.form.dose}</Num></div>
            )}
            <div className="rx-dc-renal"><b>Renal:</b> {lk.form.renal}</div>
            {adj && adj.note && <div className="rx-dc-note"><AlertTriangle size={12}/> {adj.note}</div>}
          </div>
        )}
        {!lk.form && <div className="rx-dc-muted">Not in the core formulary table.</div>}
      </div>

      {/* Spectrum */}
      {lk.spx && (
        <div className="rx-dc-sec">
          <div className="rx-dc-h"><Crosshair size={14}/> Spectrum</div>
          {docOrgs.length > 0 && <div className="rx-dc-line"><Star size={12} className="rx-star"/> <b>Drug of choice:</b> {docOrgs.join(", ")}</div>}
          {firstOrgs.length > 0 && <div className="rx-dc-line"><b>Reliable / first-line vs:</b> {firstOrgs.slice(0,10).join(", ")}{firstOrgs.length>10?` +${firstOrgs.length-10} more`:""}</div>}
          {lk.spx.notes && Object.keys(lk.spx.notes).length > 0 && (
            <ul className="rx-dc-ul">
              {Object.keys(lk.spx.notes).slice(0,4).map(k => <li key={k}><i>{(SPX_ORG_BY[k]||{}).label || k}:</i> {lk.spx.notes[k]}</li>)}
            </ul>
          )}
          <button className="rx-dc-btn" onClick={()=>onSpectrum && onSpectrum(name)}><LayoutGrid size={13}/> Open in the spectrum matrix</button>
        </div>
      )}

      {/* Penetration */}
      {pen && (pen.good.length || pen.poor.length) ? (
        <div className="rx-dc-sec">
          <div className="rx-dc-h"><Droplets size={14}/> Tissue penetration</div>
          {pen.good.length > 0 && <div className="rx-dc-chips">{pen.good.map(s => <span key={s} className="rx-tag t-green"><Check size={11}/> {s}</span>)}</div>}
          {pen.poor.length > 0 && <div className="rx-dc-chips" style={{marginTop:6}}>{pen.poor.map(s => <span key={s} className="rx-tag t-ox"><X size={11}/> {s}</span>)}</div>}
          {pen.note && <div className="rx-dc-note2">{pen.note}</div>}
        </div>
      ) : null}

      {/* TDM */}
      {lk.tdm && (
        <div className="rx-dc-sec">
          <div className="rx-dc-h"><FlaskConical size={14}/> Therapeutic monitoring</div>
          <div className="rx-dc-line"><b>{lk.tdm.t}</b></div>
          <div className="rx-dc-note2">{lk.tdm.note}</div>
        </div>
      )}

      {/* Toxicity */}
      {lk.tox && (
        <div className="rx-dc-sec">
          <div className="rx-dc-h"><ShieldAlert size={14}/> Safety</div>
          {toxDomains.length > 0 && (
            <div className="rx-dc-chips">{toxDomains.map(t => <span key={t.k} className={"rx-tag " + (t.hi ? "t-ox" : "t-amber")}>{t.k}</span>)}</div>
          )}
          <div className="rx-dc-note2">{lk.tox.note}</div>
        </div>
      )}

      {/* Tier 0 · high-yield interactions for this agent */}
      {interactionsForAgent(name).length > 0 && (
        <div className="rx-dc-sec">
          <div className="rx-dc-h"><Network size={14}/> High-yield interactions <span className="rx-dc-hsub">screening aid &mdash; not exhaustive</span></div>
          <div className="rx-ix-list">
            {interactionsForAgent(name).map((x,i) => (
              <div key={i} className={"rx-ix rx-ix-" + x.sev}>
                <span className="rx-ix-head">
                  <span className={"rx-ix-sev rx-ix-sev-" + x.sev}>{x.sev === "major" ? "Major" : "Moderate"}</span>
                  <span className="rx-ix-tag">{x.tag}</span>
                </span>
                <span className="rx-ix-with"><b>With:</b> {x.with}</span>
                <span className="rx-ix-mech">{x.mech}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anchoring syndromes */}
      {lk.anchors.length > 0 && (
        <div className="rx-dc-sec">
          <div className="rx-dc-h"><Stethoscope size={14}/> Appears in these regimens</div>
          <div className="rx-dc-chips">
            {lk.anchors.slice(0,12).map(a => <button key={a.id} className="rx-tag t-neutral clk" onClick={()=>onSyndrome && onSyndrome(a.id)}>{a.name}</button>)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Organism card (rendered inside the shared Drawer) ---- */
function OrgCard({ id, onSpectrum, onSyndrome, onDrug }){
  const lk = orgLookup(id);
  if(!lk) return <div className="rx-dc-muted">Unknown organism.</div>;
  return (
    <div className="rx-dc">
      <div className="rx-dc-sub">Spectrum members: {lk.members.map(m => m.label + (m.sub ? ` (${m.sub})` : "")).join(" · ")}</div>

      {lk.directed.length > 0 && (
        <div className="rx-dc-sec">
          <div className="rx-dc-h"><Crosshair size={14}/> Directed therapy</div>
          {lk.directed.map((it,i) => (
            <div key={i} className="rx-dc-dir">
              <div className="rx-dc-dir-org">{it.org} <span className="sub">{it.sub}</span></div>
              <div className="rx-dc-dir-first"><b>First:</b> {it.first}</div>
              <div className="rx-dc-dir-alt"><b>Alt:</b> {it.alt}</div>
              <div className="rx-dc-dir-cav"><AlertTriangle size={11}/> {it.cav}</div>
            </div>
          ))}
        </div>
      )}

      <div className="rx-dc-sec">
        <div className="rx-dc-h"><LayoutGrid size={14}/> Active agents <span className="rx-dc-hsub">(derived from the spectrum matrix)</span></div>
        {lk.tiers.doc.length > 0 && <div className="rx-dc-line"><Star size={12} className="rx-star"/> <b>Drug of choice:</b> {lk.tiers.doc.map((n,i,arr) => <React.Fragment key={n}><button className="rx-dc-druglink" onClick={()=>onDrug && onDrug(n)}>{n}</button>{i < arr.length-1 ? ", " : ""}</React.Fragment>)}</div>}
        {lk.tiers.first.length > 0 && <div className="rx-dc-line"><b>Reliable:</b> {lk.tiers.first.slice(0,12).map((n,i,arr) => <React.Fragment key={n}><button className="rx-dc-druglink" onClick={()=>onDrug && onDrug(n)}>{n}</button>{i < Math.min(arr.length,12)-1 ? ", " : ""}</React.Fragment>)}{lk.tiers.first.length>12?` +${lk.tiers.first.length-12} more`:""}</div>}
        {lk.tiers.sec.length > 0 && <div className="rx-dc-line rx-dc-muted"><b>Alternative:</b> {lk.tiers.sec.slice(0,10).join(", ")}{lk.tiers.sec.length>10?` +${lk.tiers.sec.length-10} more`:""}</div>}
        <button className="rx-dc-btn" onClick={()=>onSpectrum && onSpectrum(id)}><Microscope size={13}/> Open this column in the matrix</button>
      </div>

      {lk.syndromes.length > 0 && (
        <div className="rx-dc-sec">
          <div className="rx-dc-h"><Stethoscope size={14}/> Implicated in these syndromes</div>
          <div className="rx-dc-chips">
            {lk.syndromes.map(s => <button key={s.id} className="rx-tag t-neutral clk" onClick={()=>onSyndrome && onSyndrome(s.id)}>{s.name}</button>)}
          </div>
        </div>
      )}
    </div>
  );
}

function RegimenCard({ synId, ctx, doseFn, onDrug, onOrg, onCite, onFull }){
  const s = SYNDROMES.find(x => x.id === synId);
  const [copied, setCopied] = React.useState(false);
  if(!s) return <div className="rx-dc-muted">Pick a syndrome to assemble a regimen.</div>;
  const { core, adds, others } = buildRegimen(s, ctx);
  const dCtx = deriveCtx(ctx);
  const allergy = allergyGuidance(ctx.blAllergy);
  const activeTexts = [core.rx, ...adds.map(a => a.rx)];
  const agents = ctx.on ? regimenAgents(activeTexts) : [];
  const ixAgents = regimenAgents(activeTexts);          // interactions apply regardless of dosing context
  const ix = regimenInteractions(ixAgents);
  const riskLabels = [
    ctx.mrsaRisk && "MRSA", ctx.pseudoRisk && "Pseudomonas", ctx.esblRisk && "ESBL / resistant-GNR", ctx.severe && "severe / shock",
  ].filter(Boolean);

  const copy = () => {
    const lines = [
      s.name,
      "",
      `CORE — ${core.k}: ${core.rx}`,
      ...adds.map(a => `ADD — ${a.k}: ${a.rx}`),
      "",
      `Covers: ${s.cover.empiric}`,
      `Do not over-cover: ${s.cover.drop}`,
      `Duration: ${s.duration}`,
      `48–72 h: ${s.deesc}`,
      ctx.on && agents.length ? `\nDosing @ CrCl ${ctx.crcl ?? "—"}: ${agents.map(n => { const a = doseFn && doseFn(n); return `${n} ${a && a.adjusted ? a.adjusted : (FORMULARY.flatMap(c=>c.drugs).find(d=>d.name===n)||{}).dose || ""}`; }).join("; ")}` : "",
    ].filter(Boolean);
    const text = lines.join("\n");
    const done = () => { setCopied(true); setTimeout(()=>setCopied(false), 1800); };
    try {
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(done, done);
      } else { done(); }
    } catch(e){ done(); }
  };

  return (
    <div className="rx-dc">
      <div className="rx-dc-sub">{s.line}{riskLabels.length ? <> · assembled for <b>{riskLabels.join(", ")}</b></> : <> · core regimen (no host risks set)</>}</div>

      {/* core */}
      <div className="rx-dc-sec">
        <div className="rx-dc-h"><Crosshair size={14}/> Core regimen</div>
        <div className="rx-reg-core">
          <div className="rx-reg-k">{core.k}</div>
          <div className="rx-reg-rx">{renderRich(core.rx, onDrug)}</div>
          <DoseAdjustBar rx={core.rx} ctx={ctx} d={dCtx} onDrug={onDrug} synId={s.id} />
          {core.note && <div className="rx-reg-note">{renderGloss(core.note, onDrug)}</div>}
        </div>
      </div>

      {/* triggered add-ons */}
      {adds.length > 0 && (
        <div className="rx-dc-sec">
          <div className="rx-dc-h"><Plus size={14}/> Triggered add-ons</div>
          {adds.map((a,i) => (
            <div key={i} className="rx-reg-add">
              <div className="rx-reg-k rx-reg-k-add"><Plus size={11}/> {a.k}</div>
              <div className="rx-reg-rx">{renderRich(a.rx, onDrug)}</div>
              <DoseAdjustBar rx={a.rx} ctx={ctx} d={dCtx} onDrug={onDrug} synId={s.id} />
              {a.why && <div className="rx-reg-why"><CornerDownRight size={11}/> Added because {a.why}.</div>}
              {a.note && <div className="rx-reg-note">{renderGloss(a.note, onDrug)}</div>}
            </div>
          ))}
        </div>
      )}

      {others.filter(o => o.unmet).length > 0 && (
        <div className="rx-dc-sec">
          <div className="rx-dc-h rx-dc-h-quiet"><TrendingDown size={13}/> Not added &mdash; and why</div>
          {others.filter(o => o.unmet).map((o,i) => (
            <div key={i} className="rx-reg-omit">
              <span className="rx-reg-omit-k">{o.k}</span>
              <span className="rx-reg-omit-why">held &mdash; would be added with {o.unmet}</span>
            </div>
          ))}
        </div>
      )}

      {/* B3 · auto-assembly refinement — context-driven, only when context is applied */}
      {ctx.on && (() => {
        const rf = refineRegimen(activeTexts, ctx, dCtx);
        const VERB = { eliminate:"Remove", substitute:"Substitute", flag:"Review", note:"Confirmed" };
        const IcFor = (t) => t === "eliminate" ? Scissors : t === "substitute" ? ArrowRight : t === "note" ? Check : AlertTriangle;
        return (
          <div className="rx-dc-sec">
            <div className="rx-dc-h"><ShieldAlert size={14}/> Refined for this patient <span className="rx-dc-hsub">context-driven transformations &mdash; each shown with its reasoning</span></div>
            {rf.steps.length === 0 ? (
              <div className="rx-rf-clean"><Check size={14}/> No allergy, nephrotoxicity, or redundancy conflicts detected in this regimen for the current context.</div>
            ) : (
              <div className="rx-rf">
                {rf.steps.map((st, i) => {
                  const Ic = IcFor(st.type);
                  return (
                    <div key={i} className={"rx-rf-step " + (st.sev || "med")}>
                      <Ic size={15} className="rx-rf-ic" />
                      <div className="rx-rf-body">
                        <div className="rx-rf-head">
                          <span className="rx-rf-verb">{VERB[st.type] || "Review"}</span>
                          {st.type === "substitute" && st.replacement
                            ? <><span className="rx-rf-strike">{st.agent}</span><span className="rx-rf-to">&rarr;</span><span className="rx-rf-ag">{st.replacement}</span></>
                            : <span className={"rx-rf-ag" + (st.type === "eliminate" ? " rx-rf-strike" : "")}>{st.agent}</span>}
                        </div>
                        <div className="rx-rf-reason">{st.reason}{st.cite && <Cite id={st.cite} onClick={(cid)=>onCite && onCite(cid)} />}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* Tier 1 · regimen interaction scan (pairs + host-factor singles) */}
      {(ix.pairs.length > 0 || ix.singles.length > 0) && (
        <div className="rx-dc-sec">
          <div className="rx-dc-h"><Network size={14}/> Interaction check <span className="rx-dc-hsub">high-yield screening &mdash; not a substitute for pharmacy review</span></div>
          {ix.pairs.length > 0 && (
            <div className="rx-ix-list">
              {ix.pairs.map((pp,i) => (
                <div key={"p"+i} className={"rx-ix rx-ix-" + pp.sev}>
                  <span className="rx-ix-head">
                    <span className={"rx-ix-sev rx-ix-sev-" + pp.sev}>{pp.sev === "major" ? "Major" : "Moderate"}</span>
                    <span className="rx-ix-tag">{pp.tag}</span>
                    <span className="rx-ix-pair">within this regimen</span>
                  </span>
                  <span className="rx-ix-with"><b>{pp.agents[0].split(" / ")[0].replace(/\s*\(IV\)/,"")} + {pp.agents[1].split(" / ")[0].replace(/\s*\(IV\)/,"")}</b></span>
                  <span className="rx-ix-mech">{pp.mech}</span>
                </div>
              ))}
            </div>
          )}
          {ix.singles.length > 0 && (
            <div className="rx-ix-singles">
              <div className="rx-ix-singles-lab">Check the patient's medication list for:</div>
              <div className="rx-ix-list">
                {ix.singles.map((sg,i) => (
                  <div key={"s"+i} className={"rx-ix rx-ix-" + sg.sev}>
                    <span className="rx-ix-head">
                      <span className={"rx-ix-sev rx-ix-sev-" + sg.sev}>{sg.sev === "major" ? "Major" : "Moderate"}</span>
                      <button type="button" className="rx-ix-ag" onClick={()=>onDrug && onDrug(sg.agent)} title={"Open " + sg.agent + " monograph"}>{sg.agent.split(" / ")[0].replace(/\s*\(IV\)/,"")}</button>
                      <span className="rx-ix-tag">{sg.tag}</span>
                    </span>
                    <span className="rx-ix-with"><b>With:</b> {sg.with}</span>
                    <span className="rx-ix-mech">{sg.mech}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* allergy substitution */}
      {allergy && (
        <div className="rx-dc-sec">
          <div className="rx-dc-h"><ShieldAlert size={14}/> Allergy adjustment</div>
          <div className={"rx-callout " + (allergy.tone === "ox" ? "" : "rx-callout-amber")} style={{margin:0}}>
            {allergy.tone === "ox" ? <ShieldAlert size={15}/> : <Info size={15}/>}
            <span><b>{allergy.head}.</b> {allergy.body}</span>
          </div>
        </div>
      )}

      {/* this-patient dosing */}
      {ctx.on && agents.length > 0 && (
        <div className="rx-dc-sec">
          <div className="rx-dc-h"><Calculator size={14}/> Dosing for this patient <span className="rx-dc-hsub">CrCl {ctx.crcl ?? "—"} mL/min</span></div>
          <div className="rx-reg-dose">
            {agents.map(n => {
              const a = doseFn ? doseFn(n) : null;
              const stat = (FORMULARY.flatMap(c=>c.drugs).find(d=>d.name===n)||{}).dose;
              const shown = a && (a.kind==="band"||a.kind==="level") && a.adjusted ? a.adjusted : stat;
              const changed = a && a.kind==="band" && a.changed;
              return (
                <div key={n} className="rx-reg-doserow">
                  <button className="rx-dc-druglink" onClick={()=>onDrug && onDrug(n)}>{n}</button>
                  <span className={"rx-reg-doseval" + (changed ? " adj" : "")}><Num>{shown}</Num></span>
                </div>
              );
            })}
          </div>
          <div className="rx-dc-note2">First (loading) doses are full doses regardless of clearance. Adjustments above apply to maintenance only.</div>
        </div>
      )}

      {/* covers / omits */}
      <div className="rx-dc-sec">
        <div className="rx-dc-h"><Check size={14}/> Covers &amp; deliberate omissions</div>
        <div className="rx-reg-cover"><span className="lab">Cover</span> {renderGloss(s.cover.empiric, onDrug)}</div>
        <div className="rx-reg-omit"><span className="lab">Don&rsquo;t over-cover</span> {renderGloss(s.cover.drop, onDrug)}</div>
        <div className="rx-dc-chips" style={{marginTop:9}}>{(s.bugs||[]).map(b => <button key={b} className="rx-tag t-neutral clk" onClick={()=>onOrg && onOrg(b)}><Bug size={11}/> {(ORG_BY_ID[b]||{}).label || b}</button>)}</div>
      </div>

      {/* duration + de-escalation */}
      <div className="rx-dc-sec">
        <div className="rx-dc-h"><Clock size={14}/> Duration &amp; the 48–72 h move</div>
        <div className="rx-dc-line"><b>Duration:</b> {s.duration}{(() => { const e = synEvidence(s); return e ? <> <Cite id={e.ref} onClick={onCite} /></> : null; })()}</div>
        <div className="rx-reg-deesc"><ArrowRight size={13}/> <span>{renderGloss(s.deesc, onDrug)}</span></div>

        {/* B4 · de-escalation suggester — narrowest definitive agent by organism */}
        {(() => {
          const plan = deescalationPlan(s, ixAgents);
          if(!plan.length) return null;
          return (
            <div className="rx-deesc-sug">
              <div className="rx-deesc-sug-h">
                <Crosshair size={13}/> Narrow by organism
                <span className="rx-deesc-sug-sub">once cultures name the pathogen — the narrowest definitive agent, and what it lets you stop</span>
              </div>
              {plan.map(row => (
                <div key={row.id} className="rx-deesc-row">
                  <button className="rx-deesc-org" onClick={()=>onOrg && onOrg(row.id)} title={"Open the " + row.label + " organism card"}>
                    <Bug size={11}/> {row.label}
                  </button>
                  <div className="rx-deesc-detail">
                    {row.targets.length ? row.targets.map((t, i) => (
                      <div key={i} className="rx-deesc-narrow">
                        {row.targets.length > 1 && t.sub && <span className="rx-deesc-variant">{t.sub}</span>}
                        <span className="rx-deesc-to"><ArrowRight size={12}/>{renderRich(t.first, onDrug)}</span>
                        {t.cav && <span className="rx-deesc-cav">{renderGloss(t.cav, onDrug)}</span>}
                      </div>
                    )) : (
                      <div className="rx-deesc-narrow">
                        <span className="rx-deesc-to"><ArrowRight size={12}/>{row.docFallback.map((n, i) => (
                          <React.Fragment key={n}>{i ? ", " : ""}<button className="rx-deesc-drug" onClick={()=>onDrug && onDrug(n)}>{n}</button></React.Fragment>
                        ))}</span>
                        <span className="rx-deesc-cav rx-deesc-cav-derived">Drug of choice derived from the spectrum matrix; confirm against susceptibilities.</span>
                      </div>
                    )}
                    {row.stop.length > 0 && (
                      <div className="rx-deesc-stop">
                        <Scissors size={11}/>
                        <span><b>Lets you stop</b> if the sole pathogen: {row.stop.join(", ")} — no reliable activity here.</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* guardrail + actions */}
      <div className="rx-reg-guard"><ShieldCheck size={14}/> Empiric therapy is a time-limited bridge. Reassess against cultures at 48–72 h and narrow or stop — breadth held longer is harm, not safety.</div>
      <div className="rx-reg-actions">
        <button className="rx-dc-btn" onClick={copy}>{copied ? <><Check size={13}/> Copied</> : <><ListChecks size={13}/> Copy regimen</>}</button>
        {onFull && <button className="rx-dc-btn rx-dc-btn-ghost" onClick={()=>onFull(s.id)}><ArrowRight size={13}/> Open the full syndrome card</button>}
      </div>
    </div>
  );
}

function TrialCard({ id, onSyndrome }){
  const g = GUIDELINES[id]; if(!g) return <div className="rx-dc-muted">Reference not found.</div>;
  const t = TRIAL_DETAIL[id];
  /* Phase D3 · two-way evidence map: reverse links from this guideline /
     trial to the syndrome decisions that cite it. Empty array = render
     nothing (graceful fallback for orphan guidelines like `mono`/`stew`). */
  const syndromes = getSyndromesForTrial(id);
  return (
    <div className="rx-dc">
      <div className="rx-dc-sub" style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
        <Ev kind={g.kind === "rct" ? "rct" : "guide"} />
        <span>{g.body}{g.year ? ` · ${g.year}` : ""}</span>
        {g.strength && <span className="rx-tag t-ghost">{g.strength}</span>}
      </div>
      <div className="rx-dc-sec" style={{borderTop:"none",paddingTop:0}}>
        <div className="rx-trial-title">{g.title}</div>
        <div className="rx-trial-cite">{g.cite}</div>
      </div>
      {t && (
        <>
          <div className="rx-dc-sec"><div className="rx-dc-h"><FlaskConical size={14}/> Design</div><div className="rx-dc-line">{t.design}</div></div>
          <div className="rx-dc-sec"><div className="rx-dc-h"><Activity size={14}/> Result</div><div className="rx-dc-line">{t.result}</div></div>
          <div className="rx-dc-sec"><div className="rx-dc-h"><Check size={14}/> Bottom line</div><div className="rx-reg-guard" style={{marginTop:0}}><ShieldCheck size={14}/> {t.bottom}</div></div>
        </>
      )}
      {!t && <div className="rx-dc-note2">Primary source. Open the publication for full methods and results.</div>}
      {syndromes.length > 0 && (
        <div className="rx-dc-sec">
          <div className="rx-dc-h"><Stethoscope size={14}/> Decisions powered by this trial <span className="rx-dc-hsub">syndrome cards that cite this source</span></div>
          <div className="rx-dc-chips">
            {syndromes.map(s => (
              <button key={s.id} className="rx-tag t-neutral clk"
                onClick={()=>onSyndrome && onSyndrome(s.id)}
                title={"Open the " + s.name + " syndrome card"}>
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RapidDxTimeout({ onCite }){
  return (
    <>
      <h3 className="rx-h3"><span className="ic"><Microscope size={18}/></span>Rapid diagnostics that enable early de-escalation</h3>
      <p className="rx-stepb" style={{margin:"0 0 14px"}}>The most reliable route to a narrower regimen is to let the laboratory arrive first. Three results alter therapy before the formal susceptibility panel returns.</p>
      <div className="rx-rdx-grid">
        {RAPID_DX.map((dx,i) => { const DI = RDX_ICON[dx.icon] || FlaskConical; return (
          <div className="rx-rdx-card" key={i}>
            <div className="rx-rdx-h"><DI size={15}/> {dx.t}</div>
            <div className="rx-rdx-lead">{dx.lead}</div>
            <ul className="rx-rdx-points">
              {dx.points.map((p,pi) => <li key={pi}>{p}</li>)}
            </ul>
          </div>
        ); })}
      </div>

      <h3 className="rx-h3"><span className="ic"><ListChecks size={18}/></span>The 48–72-hour antibiotic reassessment</h3>
      <p className="rx-stepb" style={{margin:"0 0 14px"}}>A structured reassessment once early data return. Culture-guided narrowing does not worsen outcomes and reduces resistance, toxicity, and cost. The following criteria should be satisfied — or explicitly acted upon — at every ward review.</p>
      <ol className="rx-criteria">
        {TIMEOUT_ITEMS.map((it,i) => (
          <li className="rx-criterion" key={it.k}>
            <span className="rx-criterion-n rx-mono">{i+1}</span>
            <span className="rx-criterion-tx"><span className="t">{it.t}</span><span className="d">{it.d}</span></span>
          </li>
        ))}
      </ol>
      <div className="rx-reg-guard" style={{marginTop:16}}><ShieldCheck size={14}/> Most bacteremia with source control requires 7 days <Cite id="balance" onClick={onCite} />; intra-abdominal infection approximately 4 days after source control <Cite id="stopit" onClick={onCite} />. The default is a short course with a defined stop date.</div>
    </>
  );
}

function IVtoPO({ onDrug }){
  return (
    <div className="rx-card rx-mini rx-ivpo">
      <h4><span className="ic"><ArrowRight size={15}/></span>Intravenous-to-oral step-down</h4>
      <p className="rx-ivpo-intro">Oral conversion is appropriate once all of the following are satisfied:</p>
      <ol className="rx-criteria rx-criteria-tight">
        {IVPO_CRITERIA.map((c,i) => (
          <li className="rx-criterion" key={i}>
            <span className="rx-criterion-n rx-mono">{i+1}</span>
            <span className="rx-criterion-tx"><span className="t">{c}</span></span>
          </li>
        ))}
      </ol>
      <div className="rx-ivpo-agents">
        <span className="rx-ivpo-alab">High oral bioavailability</span>
        <div className="rx-dc-chips">
          {PO_AGENTS.map(a => (
            <button key={a.n} className="rx-tag t-green clk" onClick={()=>onDrug && onDrug(a.n)} title={"Open " + a.n}>
              {a.n.split(" / ")[0]} <span className="rx-ivpo-f"><Num>{a.f}</Num></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MrsaCell({ v }){
  const d = MRSA_CELL[v] || MRSA_CELL.na;
  return (
    <span className={"rx-mxcell " + d.cls} title={d.lab} aria-label={d.lab}>
      {d.glyph === "check" ? <Check size={14} strokeWidth={2.75}/> : d.glyph === "x" ? <X size={13} strokeWidth={2.75}/> : d.glyph === "dot" ? <span className="rx-mxdot" /> : <span className="rx-mxdash" />}
    </span>
  );
}

function CmpCell({ lv }){
  const d = CMP_LVL[lv] || CMP_LVL.none;
  return <span className={"rx-cmpcell " + d.cls} title={d.t} aria-label={d.t}>{d.ab}</span>;
}

function SpectrumCompare({ onDrug }){
  const [a, setA] = React.useState("Ceftriaxone / cefotaxime");
  const [b, setB] = React.useState("Cefepime");
  const A = SPX_AGENTS.find(x => x.name === a) || SPX_AGENTS[0];
  const B = SPX_AGENTS.find(x => x.name === b) || SPX_AGENTS[1];
  const rows = CMP_ORGS.map(id => {
    const la = (A.c || {})[id] || "none", lb = (B.c || {})[id] || "none";
    return { id, label:(SPX_ORG_BY[id]||{}).label || id, la, lb, diverge:_cmpActive(la) !== _cmpActive(lb) };
  });
  const nDiff = rows.filter(r => r.diverge).length;
  const sel = (val, set, label) => (
    <select value={val} onChange={e=>set(e.target.value)} className="rx-cmp-sel" aria-label={label}>
      {SPX_CLASSES.map(cl => (
        <optgroup key={cl.name} label={cl.name}>
          {cl.agents.map(ag => <option key={ag.name} value={ag.name}>{ag.name}</option>)}
        </optgroup>
      ))}
    </select>
  );
  return (
    <div className="rx-cmp">
      <div className="rx-cmp-head">
        <div className="rx-cmp-h"><GitBranch size={15}/> Compare two agents</div>
        <span className="rx-cmp-diff">{nDiff > 0 ? <><Num>{nDiff}</Num> of <Num>{rows.length}</Num> organisms diverge</> : "Identical coverage across this panel"}</span>
      </div>
      <div className="rx-cmp-pickers">
        <div className="rx-cmp-pick">{sel(a, setA, "First agent to compare")}<button className="rx-cmp-open" onClick={()=>onDrug && onDrug(A.name)} title="Open monograph"><BookOpen size={13}/></button></div>
        <span className="rx-cmp-vs">vs</span>
        <div className="rx-cmp-pick">{sel(b, setB, "Second agent to compare")}<button className="rx-cmp-open" onClick={()=>onDrug && onDrug(B.name)} title="Open monograph"><BookOpen size={13}/></button></div>
      </div>
      <table className="rx-cmptable">
        <thead><tr><th>Organism</th><th>{A.name.split(" / ")[0]}</th><th>{B.name.split(" / ")[0]}</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className={r.diverge ? "rx-cmp-div" : ""}>
              <td className="rx-cmp-org">{r.label}{r.diverge && <span className="rx-cmp-flag" title="Coverage differs">≠</span>}</td>
              <td><CmpCell lv={r.la} /></td>
              <td><CmpCell lv={r.lb} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="rx-cmp-legend">
        {["first","sec","var","intr","none"].map(k => <span key={k} className="rx-cmp-leg"><CmpCell lv={k} /> {CMP_LVL[k].t}</span>)}
      </div>
    </div>
  );
}

export { PatientContextBar, DrugCard, OrgCard, RegimenCard, TrialCard, RapidDxTimeout, IVtoPO, MrsaCell, CmpCell, SpectrumCompare };
