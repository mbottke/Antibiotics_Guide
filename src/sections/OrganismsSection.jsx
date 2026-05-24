/* section · OrganismsSection — directed therapy + resistance mechanisms.
   Phase B4 of the Wave 2 IA restructure (per docs/EXECUTION_PLAN.md):
   the ORGANISMS section is the directed-therapy view — once the Gram
   stain, culture, or molecular result names the bug, this view narrows
   the regimen to the most targeted agent. Reuses the existing visual
   rhythm and primitives so this is a drop-in replacement for the
   `renderDirected()` block previously embedded in App.jsx.

   What this section renders (in order):
     1. Directed-therapy table  — DIRECTED groups × items (org / first /
        alt / caveat) with deep-link anchors (#dir-<slug>) so the
        command palette and section-nav can scroll a specific row
        into view.
     2. MRSA agent selection by site  — the MRSA_MATRIX (agent ×
        site) primary-decision grid with legend + per-agent notes;
        site rules out agents the antibiogram would still call
        susceptible (the resistance-trend half of the spec).
     3. Gram-negative backbone by resistance mechanism — GNR_MATRIX
        rows (mechanism / first / alt / caveat) under the IDSA AMR-GN
        rubric; resistance-mechanism, not MIC alone.

   Props (extracted from App.jsx state + handlers):
     · caseState / setCaseState — case state (unused here today, kept
       for parity with the section-component interface so future
       case-aware org gating is a prop addition only).
     · ctx / d / dose            — patient context + derived state +
       dose engine, mirrors the SyndromesSection signature.
     · openDrug / openOrg /      — knowledge-graph drawer openers (drug
       openTrial                   monograph, organism card, trial /
                                   guideline detail). `openOrg` is the
                                   drawer opener (id → opens OrgCard);
                                   distinct from the expanded-row state.
     · openOrgRow / setOpenOrgRow — the slug of the directed row to
                                    highlight + scroll into view (the
                                    state previously called `openOrg`
                                    in App.jsx). Renamed in this
                                    component to disambiguate from the
                                    drawer opener handler.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useEffect } from "react";
import { Info, Crosshair, Network } from "lucide-react";
import { Cite } from "../components/primitives";
import { MrsaCell } from "../components/cards";
import { renderRich, renderGloss } from "../components/rich-text";
import { DIRECTED } from "../data/syndromes";
import { MRSA_MATRIX, MRSA_LEGEND, GNR_MATRIX } from "../data/organisms";
import { slug } from "../lib/util";

function OrganismsSection({
  caseState, setCaseState,
  ctx, d, dose,
  openDrug, openOrg, openTrial,
  openOrgRow, setOpenOrgRow,
}) {
  /* When openOrgRow changes (e.g. the user picks "Open directed row" from
     the ⌘K palette, or follows a #dir-<slug> deep-link), scroll the
     matching directed-therapy <tr> into view. Mirrors the original
     effect in App.jsx but scopes to this component so the section is
     truly drop-in. Respects prefers-reduced-motion. */
  useEffect(() => {
    if (!openOrgRow) return;
    const el = document.getElementById("dir-" + openOrgRow);
    if (!el) return;
    const reduce = typeof window !== "undefined" && window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  }, [openOrgRow]);

  return (
    <>
      <h2 className="rx-h2">Directed therapy: organism in hand</h2>
      <p className="rx-lede">Once the Gram stain, culture, or rapid molecular result identifies the organism, selection narrows to the most targeted effective agent. Each row gives the first-line choice, the principal alternative, and the caveat that most often alters management.</p>
      <div className="rx-callout"><Info size={15}/><span>Definitive therapy is almost always narrower than the empiric regimen. The resistant-Gram-negative rows follow IDSA guidance <Cite id="amrgn" onClick={(cid)=>openTrial(cid)} />; confirm the carbapenemase type for CRE &mdash; it changes the agent.</span></div>

      <div style={{overflowX:"auto"}}>
        <table className="rx-dirtable">
          <thead><tr><th>Organism</th><th>First choice</th><th>Alternative</th><th>Caveat that matters</th></tr></thead>
          <tbody>
            {DIRECTED.map(g => (
              <React.Fragment key={g.grp}>
                <tr className="rx-dirgrp"><td colSpan={4}>{g.grp}</td></tr>
                {g.items.map((o,i) => (
                  <tr key={i} id={"dir-"+slug(o.org)} className={openOrgRow===slug(o.org)?"rx-dirhi":""}>
                    <td className="tddorg" data-l="Organism"><span className="rx-dirorg">{o.org}<span className="sub">{o.sub}</span></span></td>
                    <td data-l="First choice" className="rx-dirfirst">{renderRich(o.first, openDrug)}</td>
                    <td data-l="Alternative" className="rx-diralt">{renderGloss(o.alt, openDrug)}</td>
                    <td data-l="Caveat" className="rx-dircav">{renderGloss(o.cav, openDrug)}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="rx-h3"><span className="ic"><Crosshair size={18}/></span>MRSA agent selection by site</h3>
      <p className="rx-lede" style={{marginBottom:10}}>Choosing among the anti-MRSA agents is a site decision before it is a susceptibility decision — the body compartment rules out agents the antibiogram would still call &ldquo;susceptible.&rdquo;</p>
      <div style={{overflowX:"auto"}}>
        <table className="rx-mxtable">
          <thead>
            <tr><th className="rx-mx-ag">Agent</th>{MRSA_MATRIX.cols.map(c => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {MRSA_MATRIX.rows.map(r => (
              <tr key={r.ag}>
                <td className="rx-mx-ag"><button className="rx-fname-link" onClick={()=>openDrug(r.ag)} title="Open the drug monograph">{r.ag.split(" / ")[0]}</button></td>
                {r.c.map((v,i) => <td key={i} className="rx-mx-c"><MrsaCell v={v} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rx-mxlegend">
        {MRSA_LEGEND.map(l => <span key={l.k} className="rx-mxleg-item"><MrsaCell v={l.k} /> {l.t}</span>)}
      </div>
      <ul className="rx-mxnotes">
        {MRSA_MATRIX.rows.map(r => <li key={r.ag}><b>{r.ag.split(" / ")[0]}:</b> {renderGloss(r.note, openDrug)}</li>)}
      </ul>

      <h3 className="rx-h3"><span className="ic"><Network size={18}/></span>Gram-negative backbone by resistance mechanism</h3>
      <p className="rx-lede" style={{marginBottom:10}}>Match the agent to the carbapenemase or resistance mechanism, not the MIC alone <Cite id="amrgn" onClick={(cid)=>openTrial(cid)} />. Confirm the mechanism before committing a reserve agent.</p>
      <div style={{overflowX:"auto"}}>
        <table className="rx-gnrtable">
          <thead><tr><th>Mechanism</th><th>First-line</th><th>Alternative</th><th>Caveat that matters</th></tr></thead>
          <tbody>
            {GNR_MATRIX.map((r,i) => (
              <tr key={i}>
                <td data-l="Mechanism"><span className="rx-gnr-m">{renderGloss(r.m, openDrug)}</span></td>
                <td data-l="First-line" className="rx-gnr-first">{renderGloss(r.first, openDrug)}</td>
                <td data-l="Alternative" className="rx-gnr-alt">{renderGloss(r.alt, openDrug)}</td>
                <td data-l="Caveat" className="rx-gnr-cav">{renderGloss(r.cav, openDrug)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export { OrganismsSection };
