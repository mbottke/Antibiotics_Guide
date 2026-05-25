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
   can show the "pick a presentation" empty state instead.

   Wave 5 PR-5a — optional `currentRegimen` parameter. When the caller
   passes an array of agent canonical names (e.g. ["Cefepime",
   "Vancomycin (IV)"]), the engine treats those as the empiric baseline
   for de-escalation analysis and downstream patches; the assembled
   `core`/`adds`/`refinement` still reflect the syndrome's modeled
   regimen so the answer can show the contrast between "what's running"
   and "what the protocol would prescribe." Omitting the argument
   preserves the legacy behavior verbatim. */
function composeAnswer(caseState, currentRegimen = null){
  if(!caseState || !caseState.syndrome) return null;
  const s = SYNDROMES.find(x => x.id === caseState.syndrome);
  if(!s) return null;
  const patient = caseState.patient || {};
  const d = deriveCtx(patient);
  const ctx = { ...patient, crcl: d.crcl };
  const { core, adds, others } = buildRegimen(s, ctx);
  const activeTexts = [core.rx, ...adds.map(a => a.rx)];
  const refinement = refineRegimen(activeTexts, ctx, d);
  const derivedEmpiric = regimenAgents(activeTexts);
  const empiricAgents = Array.isArray(currentRegimen) && currentRegimen.length
    ? currentRegimen.slice()
    : derivedEmpiric;
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

/* ============================================================================
   refineOnNewFinding — the snapshot-refine engine. Pure function that
   takes (currentRegimen, newFinding, syndrome, ctx) and returns a
   structured patch the AnswerCanvas can merge into the rendered answer
   without persisting anything to caseState.

   The patch shape:
     {
       steps:         [{ type, agent, replacement?, sev, reason, cite? }, ...]
                      — refinement steps to APPEND to the canvas's existing
                      refinement list. Same shape as refineRegimen's steps.
       replaceLayers: { duration?, monitoring? }
                      — when present, the AnswerCanvas swaps the named
                      layer's data for this version. e.g. source-controlled
                      finding replaces duration with the BALANCE 7-day band.
       addLayers:     [{ id, group, title, body }, ...]
                      — ephemeral layers the canvas renders ABOVE the
                      registry order, surfacing the finding itself.
       dropLayers:    [layerId, ...]
                      — registry layer ids the canvas should hide.
                      (Empty in PR-5a; reserved for future findings that
                      obviate an existing layer.)
     }

   The finding-kind vocabulary covers the five most common course events:
     · culture        — { kind:"culture", organism: <orgId>, susceptibility? }
     · resistance     — { kind:"resistance", organism?, mechanism: <esbl|kpc|mbl|mrsa-vri|vre> }
     · allergy        — { kind:"allergy", reaction: <anaphylaxis|sjs|rash>, agent? }
     · source-controlled — { kind:"source-controlled" }
     · deterioration  — { kind:"deterioration", severity: <shock|failing> }

   Unknown kinds yield an empty patch ({ steps:[], replaceLayers:{},
   addLayers:[], dropLayers:[] }) — the canvas re-renders unchanged.
   The contract is snapshot-only: nothing persists to caseState, nothing
   writes to the URL hash, nothing saves to localStorage. The patch
   lives in component-local state and is dropped on tab close. */
function refineOnNewFinding(currentRegimen, newFinding, syndrome, ctx){
  const empty = { steps: [], replaceLayers: {}, addLayers: [], dropLayers: [] };
  if(!Array.isArray(currentRegimen) || !newFinding || !newFinding.kind) return empty;
  const regimen = currentRegimen.slice();
  const steps = [];
  const replaceLayers = {};
  const addLayers = [];
  const dropLayers = [];

  if(newFinding.kind === "culture" && newFinding.organism){
    const lk = orgLookup(newFinding.organism);
    if(lk){
      const directed = (lk.directed || []).find(d => d && d.first);
      const directedAgent = directed ? directed.first : null;
      const uncovered = regimen.filter(n => !drugCoversOrg(n, newFinding.organism));
      uncovered.forEach(a => steps.push({
        type: "eliminate",
        agent: a,
        sev: "high",
        reason: `${a} does not reliably cover ${lk.label} — substitute when susceptibility data permit.`,
        cite: "amrgn",
      }));
      if(directedAgent){
        steps.push({
          type: "substitute",
          agent: "directed therapy",
          replacement: directedAgent,
          sev: "high",
          reason: `${lk.label} confirmed in culture — narrow to ${directedAgent} per directed-therapy guidance.`,
          cite: "amrgn",
        });
      }
      addLayers.push({
        id: "ans-finding-culture",
        group: "core",
        title: `Culture: ${lk.label}`,
        body: directedAgent
          ? `New finding — ${lk.label} grew in culture. Directed therapy: ${directedAgent}.`
          : `New finding — ${lk.label} grew in culture. Narrow per susceptibility.`,
      });
    }
  }

  else if(newFinding.kind === "resistance" && newFinding.mechanism){
    const has = (n) => regimen.includes(n);
    const mech = newFinding.mechanism;
    if(mech === "esbl" && !has("Meropenem") && !has("Ertapenem")){
      steps.push({
        type: "substitute",
        agent: "β-lactam Gram-negative cover",
        replacement: "Meropenem",
        sev: "high",
        reason: "ESBL confirmed — pip-tazo / cefepime unreliable at inoculum (MERINO 2018); switch to carbapenem.",
        cite: "merino",
      });
      addLayers.push({
        id: "ans-finding-resistance",
        group: "risks",
        title: "ESBL detected",
        body: "Switch to a carbapenem (meropenem first-line; ertapenem acceptable for non-Pseudomonas sources). MERINO 2018 showed pip-tazo inferior in ESBL BSI even at MIC ≤ 16.",
      });
    } else if(mech === "kpc"){
      steps.push({
        type: "substitute",
        agent: "carbapenem",
        replacement: "Ceftazidime-avibactam OR meropenem-vaborbactam",
        sev: "high",
        reason: "KPC-CRE confirmed — novel β-lactam required; carbapenem monotherapy inadequate.",
        cite: "amrgn",
      });
      addLayers.push({
        id: "ans-finding-resistance",
        group: "risks",
        title: "KPC-CRE detected",
        body: "Novel β-lactam first-line per IDSA AMR-GN 2024. ID consult mandatory; aztreonam pairing required if MBL co-resistance suspected.",
      });
    } else if(mech === "mbl"){
      steps.push({
        type: "substitute",
        agent: "carbapenem / cephalosporin",
        replacement: "Cefiderocol OR aztreonam + ceftazidime-avibactam",
        sev: "high",
        reason: "MBL (NDM/VIM/IMP) inactivates all β-lactams except cefiderocol and the aztreonam + ceftaz-avi combination.",
        cite: "amrgn",
      });
      addLayers.push({
        id: "ans-finding-resistance",
        group: "risks",
        title: "MBL-CRE detected",
        body: "Cefiderocol or aztreonam + ceftaz-avi (combination provides cross-coverage). ID + pharmacy partnership mandatory.",
      });
    } else if(mech === "mrsa-vri"){
      if(has("Vancomycin (IV)")){
        steps.push({
          type: "substitute",
          agent: "Vancomycin (IV)",
          replacement: "Daptomycin OR ceftaroline",
          sev: "high",
          reason: "Vancomycin-intermediate or persistent MRSA — switch to daptomycin (8–10 mg/kg) or salvage with ceftaroline; ID consult.",
          cite: "amrgn",
        });
      }
      addLayers.push({
        id: "ans-finding-resistance",
        group: "risks",
        title: "MRSA with elevated vanco MIC",
        body: "Vancomycin MIC ≥ 2 mg/L or persistent bacteremia → switch agent. Daptomycin first-line for non-pulmonary; ceftaroline salvage; combination therapy for endocarditis / persistent BSI.",
      });
    }
  }

  else if(newFinding.kind === "allergy" && newFinding.reaction){
    const r = newFinding.reaction;
    const agent = newFinding.agent || "current agent";
    if(r === "anaphylaxis" || r === "sjs"){
      steps.push({
        type: "eliminate",
        agent,
        sev: "high",
        reason: `Severe reaction (${r}) — discontinue immediately. Substitute to a non-cross-reacting class; consider aztreonam for Gram-negative needs.`,
        cite: "mono",
      });
      addLayers.push({
        id: "ans-finding-allergy",
        group: "risks",
        title: `Severe reaction: ${r}`,
        body: `Discontinue ${agent}. Severe penicillin allergy retains ~1% cross-reactivity with cephalosporins (lower with cefazolin/ceftriaxone vs cefepime); aztreonam is the safe Gram-negative anchor. Document the reaction explicitly.`,
      });
    } else if(r === "rash"){
      steps.push({
        type: "flag",
        agent,
        sev: "med",
        reason: `Rash on ${agent} — assess severity. Mild morbilliform may continue with daily review; pruritic, spreading, or mucosal involvement → discontinue and substitute.`,
      });
    }
  }

  else if(newFinding.kind === "source-controlled"){
    replaceLayers.duration = {
      headline: "Source controlled → enter the BALANCE 7-day band; reassess for stop.",
      evidence: "BALANCE 2024 — 7-day non-inferior to 14-day in source-controlled GNR bacteremia.",
      branches: [
        { label: "Source controlled, stable bacteremia", days: "7 d",
          detail: "Count from first negative BCx; AND-joined stop criteria (afebrile, BCx neg, off pressors)." },
      ],
      stopWhen: [
        "Afebrile ≥ 48 h",
        "BCx negative ≥ 48 h",
        "Off vasopressors; lactate normalized",
        "Minimum 7 d from first negative BCx if bacteremic",
      ],
      extendIf: [],
    };
    addLayers.push({
      id: "ans-finding-source-controlled",
      group: "duration",
      title: "Source control achieved",
      body: "Re-enter the BALANCE 7-day band. Daily review against the AND-joined stop criteria; stop on the earlier of (a) all criteria met + minimum 7 d, or (b) day 14.",
    });
  }

  else if(newFinding.kind === "deterioration"){
    const sev = newFinding.severity || "failing";
    steps.push({
      type: "flag",
      agent: "regimen",
      sev: "high",
      reason: sev === "shock"
        ? "Deterioration to shock — broaden empiric coverage (add MRSA / Pseudomonas / anaerobic per source), re-image for missed focus, ID consult."
        : "Clinical failure on current regimen — reassess source control (imaging, drainage, line removal), confirm susceptibility, broaden empirically if not already maximal, ID consult.",
      cite: "ssc",
    });
    addLayers.push({
      id: "ans-finding-deterioration",
      group: "risks",
      title: sev === "shock" ? "Deterioration to shock" : "Clinical failure",
      body: sev === "shock"
        ? "Surviving Sepsis 2021 — broaden empiric within Hour-1, repeat lactate q2-4h until normalized, imaging for missed focus. The wrong drug at the right time is the most common cause of failure."
        : "Failure-to-improve checklist: (1) source control — imaging, drainage, hardware; (2) susceptibility — culture data, MIC, mechanism; (3) penetration — site-appropriate agent at adequate dose; (4) host — immune state, deep-seated focus, endocarditis.",
    });
  }

  return { steps, replaceLayers, addLayers, dropLayers };
}

/* ============================================================================
   applyReassessment — Phase B's stateful 48–72 h move.
   Takes the empiric composed-answer bundle plus the day-3 inputs from
   caseState (cultures back? stable + absorbing? source controlled?) and
   returns the structured "what changes" delta. Each section is null when
   its trigger has not fired, so the UI can render only the parts that
   apply. Pure; safe to call every render.

   Output shape:
     {
       cultures: { status, organism, label } | null,
       directed: { org, first, alt, cav } | null,   // matched DIRECTED row
       drop:    [agent, ...],                       // empiric agents lacking activity
       narrow:  { agents: [...], note },            // header for the dropped set
       ivpo:    { criteria, candidates } | null,    // oral conversion plan
       duration: { days, source: "syndrome" } | null,
       stopDate: "yyyy-mm-dd" | null,               // requires startDate + days
       activeTriggers: ["cultures"|"ivpo"|"duration"|...] // for UI
     }
   Returns null when no trigger has fired (so the Reassess panel can stay
   collapsed). */
function _extractDurationDays(durStr){
  if(!durStr || typeof durStr !== "string") return null;
  // Match the FIRST integer day-count: "7 days", "5-7 days", "~4 d after"
  const m = durStr.match(/(\d+)\s*(?:d(?!eep)|day)/i);
  return m ? +m[1] : null;
}

function _addDays(yyyymmdd, n){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(yyyymmdd)) return null;
  const [y,mo,da] = yyyymmdd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, da));
  if(Number.isNaN(dt.getTime())) return null;
  dt.setUTCDate(dt.getUTCDate() + n);
  const z = (v) => String(v).padStart(2, "0");
  return `${dt.getUTCFullYear()}-${z(dt.getUTCMonth()+1)}-${z(dt.getUTCDate())}`;
}

function applyReassessment(empiric, caseState){
  if(!empiric || !caseState) return null;
  const cult = caseState.cultures || {};
  const clin = caseState.clinical || {};
  const triggers = [];

  const cultBack = cult.status === "back" && cult.organism;
  const stableAbsorbing = !!(clin.stable && clin.absorbing);
  const sourceOK = !!clin.sourceControlled;
  if(!cultBack && !stableAbsorbing && !sourceOK) return null;

  const out = {
    cultures: null, directed: null, drop: [], narrow: null,
    ivpo: null, duration: null, stopDate: null, activeTriggers: triggers,
  };

  // ---- Trigger 1 · cultures back → directed therapy + stop set --------
  if(cultBack){
    triggers.push("cultures");
    const lk = orgLookup(cult.organism);
    out.cultures = {
      status: cult.status,
      organism: cult.organism,
      label: lk ? lk.label : cult.organism,
    };
    if(lk && lk.directed && lk.directed.length){
      // Prefer the first matched DIRECTED row (every variant is kept distinct
      // in orgLookup's output, so subtype-narrowing comes for free).
      out.directed = lk.directed[0];
    }
    out.drop = (empiric.empiricAgents || []).filter(n => !drugCoversOrg(n, cult.organism));
    if(out.drop.length){
      out.narrow = {
        agents: out.drop,
        note: `These empiric agents lack reliable activity against ${out.cultures.label} — discontinue.`,
      };
    }
  }

  // ---- Trigger 2 · stable + absorbing → IV→PO -------------------------
  if(stableAbsorbing){
    triggers.push("ivpo");
    out.ivpo = {
      criteria: ["Hemodynamically stable", "Tolerating enteral intake", "Adequate oral option for pathogen"],
      // Curated high-F PO agents (the Course tab's IV→PO table). v1 returns
      // the agent names; the UI can cross-reference PO_AGENTS for F values.
      candidates: ["Levofloxacin", "Linezolid", "Metronidazole", "TMP-SMX", "Doxycycline", "Clindamycin"],
    };
  }

  // ---- Trigger 3 · source controlled → duration clock + stop date -----
  if(sourceOK){
    triggers.push("duration");
    const days = _extractDurationDays(empiric.duration);
    if(days != null){
      out.duration = { days, source: "syndrome" };
      if(caseState.startDate){
        // Day 1 is the start day; the last dose lands on startDate + (days-1).
        out.stopDate = _addDays(caseState.startDate, days - 1);
      }
    }
  }

  return out;
}

export { buildRegimen, regimenAgents, refineAgents, refineOptionGroups, refineRegimen, deescalationPlan, composeAnswer, refineOnNewFinding, applyReassessment, _extractDurationDays };
