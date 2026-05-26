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

/* ============================================================
   Wave 7 W7-B · cinematic section header tokens (with fallbacks)
   Mirrors the design language used in the Syndromes / Agents /
   Compare / Principles refresh agents.
   ============================================================ */
const W7_NEON   = "var(--w7-neon, var(--ox-bright, #9B2D2F))";
const W7_KICKER = "var(--w7-kicker, var(--muted, #6E675E))";
const W7_LINE   = "var(--w7-hairline, var(--ox-line, #E2C7C4))";
const W7_GLASS_BG     = "var(--w7-glass-bg, rgba(255, 255, 255, 0.72))";
const W7_GLASS_BORDER = "var(--w7-glass-border, var(--line, #E6E0D8))";
const W7_GLASS_SHADOW = "var(--w7-glass-shadow, 0 2px 8px rgba(15, 23, 42, 0.04), 0 12px 32px -16px rgba(15, 23, 42, 0.10))";

/* Cinematic kicker + display headline + italic byline + gradient hairline. */
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
          margin: "0 0 18px", maxWidth: "72ch",
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

/* Sub-section heading: small kicker line + serif sub-headline. */
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

/* Glass-style container with asymmetric radii.
   `flip` toggles which corners are sharp vs rounded so a sequence of
   cards builds a deliberate visual rhythm. */
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
      padding: 0,
      overflow: "hidden",
      ...radii,
      ...style,
    }} {...rest}>{children}</div>
  );
}

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
      <W7SectionHead
        kicker="ORGANISMS"
        title="Organisms and their resistance"
        lede="Every pathogen in the formulary's coverage matrix — from common Enterobacterales to MDR Acinetobacter — with directed-therapy hints and cross-walk to the syndromes where they appear."
      />
      <div className="rx-callout"><Info size={15}/><span>Definitive therapy is almost always narrower than the empiric regimen. The resistant-Gram-negative rows follow IDSA guidance <Cite id="amrgn" onClick={(cid)=>openTrial(cid)} />; confirm the carbapenemase type for CRE &mdash; it changes the agent.</span></div>

      <W7Glass style={{ marginTop: 18 }}>
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
      </W7Glass>

      <W7SubHead kicker="MRSA · BY SITE" icon={<Crosshair size={18}/>} title="MRSA agent selection by site" />
      <p className="rx-lede" style={{marginBottom:10}}>Choosing among the anti-MRSA agents is a site decision before it is a susceptibility decision — the body compartment rules out agents the antibiogram would still call &ldquo;susceptible.&rdquo;</p>
      <W7Glass flip>
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
      </W7Glass>
      <div className="rx-mxlegend">
        {MRSA_LEGEND.map(l => <span key={l.k} className="rx-mxleg-item"><MrsaCell v={l.k} /> {l.t}</span>)}
      </div>
      <ul className="rx-mxnotes">
        {MRSA_MATRIX.rows.map(r => <li key={r.ag}><b>{r.ag.split(" / ")[0]}:</b> {renderGloss(r.note, openDrug)}</li>)}
      </ul>

      <W7SubHead kicker="GRAM-NEGATIVE · MECHANISM" icon={<Network size={18}/>} title="Gram-negative backbone by resistance mechanism" />
      <p className="rx-lede" style={{marginBottom:10}}>Match the agent to the carbapenemase or resistance mechanism, not the MIC alone <Cite id="amrgn" onClick={(cid)=>openTrial(cid)} />. Confirm the mechanism before committing a reserve agent.</p>
      <W7Glass>
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
      </W7Glass>
    </>
  );
}

export { OrganismsSection };
