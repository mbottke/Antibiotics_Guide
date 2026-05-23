/* engine · empiric assembly, context refinement, organism-directed de-escalation (pure).
   Inpatient Antibiotic Guide — module graph documented in README.md. */
import { RISK_KW } from "../data/risk-keywords.js";
import { _agentMatchTokens, _normd } from "../lib/util.js";
import { AGENT_RX, FORM_FLAT } from "../data/drugs.js";
import { SRC_CONTROL, SYNDROMES } from "../data/syndromes.js";
import { drugCoversOrg, orgLookup } from "./lookup.js";
import { deriveCtx } from "./dosing.js";
import { synEvidence } from "./clinical.js";

/* ============================================================================
   B4 · DE-ESCALATION SUGGESTER — narrowest definitive agent, by organism
   Given a syndrome's targeted organisms and the assembled empiric regimen,
   surface for each organism: the narrowest active agent once cultures name it
   (the DIRECTED first-choice, every matched variant — KPC vs MBL CRE are not
   collapsed), the guideline caveat, and the de-escalation yield — the empiric
   agents that carry no reliable activity against that organism and so add
   nothing if it proves the sole pathogen. Built on orgLookup (returns ALL
   matched DIRECTED rows, not the first) and the validated drugCoversOrg
   spectrum helper. Advisory: every suggestion is a named first-choice, shown
   with its reasoning and openable for full review. Pure; safe each render. */
function deescalationPlan(s, empiricAgents){
  const bugs = (s && s.bugs) || [];
  const empiric = (empiricAgents || []);
  const _short = n => String(n || "").replace(/\s*\(IV\)/, "").trim();
  return bugs.map(id => {
    const lk = orgLookup(id);
    if(!lk) return null;
    // narrowest definitive option(s): every matched DIRECTED row (variants kept distinct)
    const targets = (lk.directed || [])
      .filter(d => d && d.first)
      .map(d => ({ org:d.org, sub:d.sub, first:d.first, cav:d.cav }))
      .slice(0, 2);
    // matrix-derived fallback only when no curated DIRECTED row matched
    const docFallback = (!targets.length && lk.tiers && lk.tiers.doc.length)
      ? lk.tiers.doc.slice(0, 3) : [];
    // de-escalation yield: empiric agents with no reliable activity against this organism
    const stop = empiric.filter(n => !drugCoversOrg(n, id)).map(_short);
    return { id, label:lk.label, targets, docFallback, stop };
  }).filter(r => r && (r.targets.length || r.docFallback.length));
}

function buildRegimen(s, ctx){
  const core = s.tiers[0];
  const adds = [], others = [];
  const REASON = {
    mrsaRisk:"MRSA risk set (prior MRSA, recent hospitalization/antibiotics, or device)",
    pseudoRisk:"Pseudomonas risk set (structural lung disease, prior resistant GNR, or healthcare exposure)",
    esblRisk:"ESBL / resistant-GNR risk set",
    severe:"severe illness / septic shock",
  };
  s.tiers.slice(1).forEach(t => {
    const k = t.k || "";
    let trig = null;
    if(ctx.mrsaRisk   && RISK_KW.mrsaRisk.test(k))                 trig = "mrsaRisk";
    else if(ctx.pseudoRisk && RISK_KW.pseudoRisk.test(k))          trig = "pseudoRisk";
    else if(ctx.esblRisk   && RISK_KW.esblRisk.test(k))            trig = "esblRisk";
    else if(ctx.severe     && (t.sev || RISK_KW.severe.test(k)))   trig = "severe";
    if(trig) adds.push({ ...t, why: REASON[trig] });
    else {
      // why this tier is NOT in the active regimen: which risk would add it?
      let unmet = null;
      if(RISK_KW.mrsaRisk.test(k)) unmet = "MRSA risk";
      else if(RISK_KW.pseudoRisk.test(k)) unmet = "Pseudomonas risk";
      else if(RISK_KW.esblRisk.test(k)) unmet = "ESBL / resistant-GNR risk";
      else if(t.sev || RISK_KW.severe.test(k)) unmet = "severe illness / shock";
      others.push({ ...t, unmet });
    }
  });
  return { core, adds, others };
}

function regimenAgents(texts){
  const hay = _normd(texts.join("  ||  "));
  const found = [];
  FORM_FLAT.forEach(n => {
    const hit = _agentMatchTokens(n).some(t => {
      if(t.length < 4) return false;
      const esc = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // token must stand alone — not the head or tail of a longer hyphenated compound
      return new RegExp("(^|[^a-z])" + esc + "(?![a-z-])", "i").test(hay);
    });
    if(hit && !found.includes(n)) found.push(n);
  });
  return found;
}

/* Detect the property-tagged agents present in the assembled regimen text. */
function refineAgents(texts){
  const hay = (texts || []).join("  ||  ");
  const out = [];
  AGENT_RX.forEach(a => { if(a.rx.test(hay) && !out.some(o => o.canon === a.canon)) out.push(a); });
  return out;
}

/* Split each regimen line into option-groups on " or " boundaries, returning the
   property-tagged agents *within each option*. Co-occurrence rules (redundancy,
   nephrotoxic pairing) must reason per-option — "ceftriaxone + metronidazole, OR
   piperacillin-tazobactam" lists alternatives, so metronidazole is not redundant
   against pip-tazo. A combination uses "+" / "plus" / "and"; alternatives use
   "or" / ", or" / "/". */
function refineOptionGroups(texts){
  const groups = [];
  (texts || []).forEach(t => {
    if(typeof t !== "string") return;
    // split on " or " (with optional comma) — the alternative separator
    t.split(/\s*,?\s+or\s+/i).forEach(opt => {
      const inOpt = [];
      AGENT_RX.forEach(a => { if(a.rx.test(opt) && !inOpt.some(o => o.canon === a.canon)) inOpt.push(a); });
      if(inOpt.length) groups.push(inOpt);
    });
  });
  return groups;
}

/* refineRegimen → ordered, reviewable decision trail for the assembled regimen.
   Each step: { type:"eliminate"|"substitute"|"flag"|"note", agent, replacement?,
   reason, cite?, sev:"high"|"med"|"low" }. Pure; safe to call every render. */
function refineRegimen(texts, ctx, d){
  const present = refineAgents(texts);
  const groups = refineOptionGroups(texts);
  const has = (canon) => present.find(a => a.canon === canon);
  // co-occurs WITHIN a single option (combination), not merely across alternatives
  const coOccurs = (canonA, predB) => groups.some(g =>
    g.some(a => a.canon === canonA) && g.some(b => b.canon !== canonA && predB(b)));
  const steps = [];
  const crcl = (d && d.crcl != null) ? d.crcl : null;

  // ---- RULE 1 · β-LACTAM ALLERGY ----------------------------------------
  const betalactams = present.filter(a => a.bl);
  if(ctx.blAllergy === "severe" && betalactams.length){
    betalactams.forEach(a => {
      steps.push({ type:"eliminate", agent:a.canon, sev:"high",
        reason:"Severe β-lactam allergy (anaphylaxis / SJS-DRESS) — avoid penicillins and cephalosporins.",
        cite:"mono" });
    });
    // Direct, spectrum-preserving substitution scaffold (aztreonam if not already present).
    const needGN = betalactams.some(a => a.apsa) || betalactams.some(a => /Ceftriaxone|Ampicillin|Ertapenem|Meropenem|Piperacillin/.test(a.canon));
    if(needGN && !has("Aztreonam")){
      steps.push({ type:"substitute", agent:"β-lactam Gram-negative cover", replacement:"Aztreonam", sev:"high",
        reason:"Aztreonam carries no penicillin cross-reactivity (shares an R1 side chain only with ceftazidime) — the Gram-negative backbone in severe allergy.",
        cite:"mono" });
    }
    if(betalactams.some(a => a.ana) && !has("Metronidazole")){
      steps.push({ type:"substitute", agent:"anaerobic cover", replacement:"Metronidazole", sev:"med",
        reason:"The removed β-lactam carried anaerobic coverage — replace it explicitly when the source is intra-abdominal, biliary, or necrotizing." });
    }
  } else if(ctx.blAllergy === "mild"){
    const ceph = betalactams.filter(a => /Cef|Ceft/.test(a.canon));
    const carb = betalactams.filter(a => /Meropenem|Ertapenem/.test(a.canon));
    const truePen = betalactams.filter(a => /Penicillin|Ampicillin|Nafcillin|Piperacillin|Amoxicillin/.test(a.canon));
    if(ceph.length || carb.length){
      steps.push({ type:"note", agent:(ceph[0]||carb[0]).canon, sev:"low",
        reason:"Low-risk penicillin allergy — cephalosporins and carbapenems carry ~1–2% cross-reactivity (driven by R1 side chain, not the β-lactam ring). Proceed; consider allergy de-labeling.",
        cite:"mono" });
    }
    if(truePen.length){
      truePen.forEach(a => steps.push({ type:"flag", agent:a.canon, sev:"med",
        reason:"Aminopenicillin / antipseudomonal penicillin in a penicillin-allergic patient — confirm the reaction history before giving; a test dose or alternative may be safer." }));
    }
  }

  // ---- RULE 2 · VANCOMYCIN + PIP-TAZO NEPHROTOXICITY --------------------
  if(coOccurs("Vancomycin (IV)", b => b.canon === "Piperacillin-tazobactam")){
    const lowGfr = crcl != null && crcl < 60;
    steps.push({ type:"flag", agent:"Vancomycin + piperacillin-tazobactam", sev: lowGfr ? "high" : "med",
      reason:(lowGfr ? `Additive AKI signal at CrCl ${crcl}. ` : "Additive AKI signal (largely creatinine-based, debated). ")
        + "If anaerobic coverage is not required, cefepime preserves the antipseudomonal Gram-negative spectrum without the signal; otherwise a carbapenem is the alternative.",
      cite:"mono" });
  }

  // ---- RULE 3 · REDUNDANT ANAEROBIC COVERAGE (within one option only) ----
  if(has("Metronidazole")){
    const carrierGroup = groups.find(g =>
      g.some(a => a.canon === "Metronidazole") && g.some(a => a.ana && a.canon !== "Metronidazole"));
    if(carrierGroup){
      const carrier = carrierGroup.find(a => a.ana && a.canon !== "Metronidazole");
      steps.push({ type:"eliminate", agent:"Metronidazole", sev:"med",
        reason:`${carrier.canon} already provides reliable anaerobic coverage — added metronidazole is redundant double coverage.`,
        cite:"stew" });
    }
  }

  // ---- RULE 4 · REDUNDANT ANTI-MRSA / DOUBLE GRAM-POSITIVE (within one option) ----
  const mrsaGroup = groups.find(g => g.filter(a => a.mrsa).length >= 2);
  if(mrsaGroup){
    const ms = mrsaGroup.filter(a => a.mrsa);
    steps.push({ type:"flag", agent:ms.map(a=>a.canon.replace(/\s*\(IV\)/,"")).join(" + "), sev:"med",
      reason:"Two anti-MRSA agents — confirm the indication (e.g., persistent MRSA bacteremia salvage, or lung source requiring linezolid); otherwise this is redundant Gram-positive coverage." });
  }

  return { present, steps };
}

/* ============================================================================
   composeAnswer — the Bedside Answer Canvas's single engine entry point.
   Takes a caseState and returns everything the Answer Canvas needs to render
   in one pure call: the assembled regimen, the patient-specific refinement
   trail, the de-escalation plan, and the surrounding context (source
   control, evidence, target organisms, duration). Pure; safe to call every
   render; returns null when the syndrome is unknown or unset so the canvas
   can show the "pick a presentation" empty state instead. */
function composeAnswer(caseState){
  if(!caseState || !caseState.syndrome) return null;
  const s = SYNDROMES.find(x => x.id === caseState.syndrome);
  if(!s) return null;
  const patient = caseState.patient || {};
  const d = deriveCtx(patient);
  const ctx = { ...patient, crcl: d.crcl };
  const { core, adds, others } = buildRegimen(s, ctx);
  const activeTexts = [core.rx, ...adds.map(a => a.rx)];
  const refinement = refineRegimen(activeTexts, ctx, d);
  const empiricAgents = regimenAgents(activeTexts);
  const deesc = deescalationPlan(s, empiricAgents);
  return {
    syndrome: s,
    ctx,
    d,
    core,
    adds,
    others,
    refinement,
    deesc,
    empiricAgents,
    duration: s.duration,
    deescGuide: s.deesc,
    cover: s.cover,
    bugs: s.bugs || [],
    pearls: s.pearls || [],
    sourceControl: SRC_CONTROL[s.id] || null,
    evidence: synEvidence(s),
  };
}

export { buildRegimen, regimenAgents, refineAgents, refineOptionGroups, refineRegimen, deescalationPlan, composeAnswer };
