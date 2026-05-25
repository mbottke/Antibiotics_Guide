/* engine · compare two regimens · Wave 5 PR-5b

   compareRegimens(regimenA, regimenB, syndrome) → diff

   A pure, symmetric side-by-side read of two empiric regimens along four
   independent dimensions. Used by the Compare → Regimens sub-tab (PR-13)
   and surfaceable inline from the Reassessment "What's changed?" field.

   The contract is *symmetric*: swapping the arguments swaps every
   per-side field cleanly (aOnly ↔ bOnly, evidence.a ↔ evidence.b,
   etc.). No mutation, no caseState/URL writes, no I/O.

   DIMENSIONS
   ----------
   • coverage   — per-organism boolean intersect using drugCoversOrg.
                  Organism set defaults to syndrome.bugs when provided,
                  else the full 14-organism ORGS list. Reports aOnly /
                  bOnly / shared / gap (neither covers).

   • toxicity   — DRUG_IX rows per agent via interactionsForAgent.
                  Surfaces per-side flag count, major-severity count,
                  and host-factor-flagged count for at-a-glance read.

   • microbiome — aggregates the PR-4 FORMULARY fields:
                  cdiffScore (1–5)  → cdiffMax + cdiffAvg
                  mdrPressure (low/med/high) → tally
                  Winner = lower cdiffMax, tiebreak cdiffAvg, then
                  mdrCount.high. "tie" only when both are identical.

   • evidence   — tier position within the syndrome:
                  tier 0          → preferred
                  tier 1+         → alternative
                  not in any tier → offProtocol
                  Winner = more preferred wins, tiebreak more
                  alternative, tiebreak fewer offProtocol.
                  Returns empty lists when syndrome lacks tiers.

   GRACEFUL FALLBACKS
   ------------------
   • Empty / non-array inputs → returns the empty diff shape, never
     throws. The Compare component reads the shape and renders a
     "pick both regimens" empty state.
   • Unknown agent names → still scored; drugCoversOrg returns false,
     interactionsForAgent returns [], DRUG_BY_NAME lookup is null →
     the agent counts in microbiome.mdrUnknown.
   • Null syndrome → coverage uses all ORGS; evidence collapses every
     agent into offProtocol with score 0 (no winner). */

import { AGENT_RX, DRUG_ALIASES, FORMULARY } from "../data/drugs.js";
import { ORGS } from "../data/organisms.js";
import { drugCoversOrg } from "./lookup.js";
import { interactionsForAgent } from "./clinical.js";

/* FORMULARY-keyed lookup for the PR-4 schema fields. Built once. */
const _DRUG_BY_NAME = (() => {
  const m = {};
  FORMULARY.forEach(c => c.drugs.forEach(d => { m[d.name] = d; }));
  return m;
})();

function _normRegimen(reg){
  if(!Array.isArray(reg)) return [];
  const out = [];
  reg.forEach(name => {
    if(typeof name !== "string") return;
    const trimmed = name.trim();
    if(!trimmed) return;
    if(!out.includes(trimmed)) out.push(trimmed);
  });
  return out;
}

/* Resolve a free-text or aliased agent name to its canonical FORMULARY name.
   Handles three sources of name drift:
     1. Already canonical (exact FORMULARY hit) → unchanged.
     2. DRUG_ALIASES reverse map (the SPX-style alias, e.g.
        "Meropenem / imipenem / doripenem" → "Meropenem").
     3. AGENT_RX pattern match (free text "zosyn" → "Piperacillin-tazobactam"). */
function _canonical(name){
  if(_DRUG_BY_NAME[name]) return name;
  const reverse = Object.keys(DRUG_ALIASES).find(k => DRUG_ALIASES[k] === name);
  if(reverse && _DRUG_BY_NAME[reverse]) return reverse;
  const rx = AGENT_RX.find(a => a.rx.test(name));
  if(rx && _DRUG_BY_NAME[rx.canon]) return rx.canon;
  return name;
}

function _coverage(a, b, syndrome){
  const orgIds = (syndrome && Array.isArray(syndrome.bugs) && syndrome.bugs.length)
    ? syndrome.bugs
    : ORGS.map(o => o.id);
  const organisms = orgIds.map(id => {
    const meta = ORGS.find(o => o.id === id);
    const label = meta ? meta.label : id;
    const aCov = a.some(name => drugCoversOrg(name, id));
    const bCov = b.some(name => drugCoversOrg(name, id));
    let delta = "neither";
    if(aCov && bCov) delta = "both";
    else if(aCov) delta = "aOnly";
    else if(bCov) delta = "bOnly";
    return { id, label, a:aCov, b:bCov, delta };
  });
  return {
    organisms,
    aOnly:  organisms.filter(o => o.delta === "aOnly").map(o => o.id),
    bOnly:  organisms.filter(o => o.delta === "bOnly").map(o => o.id),
    shared: organisms.filter(o => o.delta === "both").map(o => o.id),
    gap:    organisms.filter(o => o.delta === "neither").map(o => o.id),
  };
}

function _toxicity(names){
  const flags = [];
  let majorCount = 0, hostCount = 0;
  names.forEach(name => {
    interactionsForAgent(name).forEach(x => {
      flags.push({ agent:name, tag:x.tag, sev:x.sev, with:x.with, mech:x.mech, host:x.host || null });
      if(x.sev === "major") majorCount++;
      if(x.host) hostCount++;
    });
  });
  return { flags, total:flags.length, majorCount, hostCount };
}

function _microbiome(names){
  let cdiffSum = 0, cdiffMax = 0, scored = 0;
  const mdrCount = { low:0, med:0, high:0 };
  let mdrUnknown = 0;
  names.forEach(name => {
    const d = _DRUG_BY_NAME[name];
    if(!d){ mdrUnknown++; return; }
    if(typeof d.cdiffScore === "number"){
      cdiffSum += d.cdiffScore;
      if(d.cdiffScore > cdiffMax) cdiffMax = d.cdiffScore;
      scored++;
    }
    if(d.mdrPressure && Object.prototype.hasOwnProperty.call(mdrCount, d.mdrPressure)){
      mdrCount[d.mdrPressure]++;
    } else {
      mdrUnknown++;
    }
  });
  return {
    cdiffMax,
    cdiffAvg: scored ? cdiffSum / scored : 0,
    cdiffTotal: cdiffSum,
    mdrCount,
    mdrUnknown,
    scored,
  };
}

function _microbiomeWinner(a, b){
  if(a.cdiffMax !== b.cdiffMax) return a.cdiffMax < b.cdiffMax ? "a" : "b";
  if(a.cdiffAvg !== b.cdiffAvg) return a.cdiffAvg < b.cdiffAvg ? "a" : "b";
  if(a.mdrCount.high !== b.mdrCount.high) return a.mdrCount.high < b.mdrCount.high ? "a" : "b";
  if(a.mdrCount.med !== b.mdrCount.med) return a.mdrCount.med < b.mdrCount.med ? "a" : "b";
  return "tie";
}

function _evidence(names, syndrome){
  const empty = { preferred:[], alternative:[], offProtocol:[...names] };
  if(!syndrome || !Array.isArray(syndrome.tiers) || !syndrome.tiers.length){
    return empty;
  }
  const tierHay = syndrome.tiers.map(t => (typeof t.rx === "string" ? t.rx : ""));
  const preferred = [], alternative = [], offProtocol = [];
  names.forEach(name => {
    const rxEntry = AGENT_RX.find(a => a.canon === name);
    let foundTier = -1;
    for(let i = 0; i < tierHay.length; i++){
      const hay = tierHay[i];
      if(!hay) continue;
      const haystackLower = hay.toLowerCase();
      const nameLower = name.toLowerCase();
      if(haystackLower.includes(nameLower)){ foundTier = i; break; }
      if(rxEntry && rxEntry.rx.test(hay)){ foundTier = i; break; }
    }
    if(foundTier === 0) preferred.push(name);
    else if(foundTier > 0) alternative.push(name);
    else offProtocol.push(name);
  });
  return { preferred, alternative, offProtocol };
}

function _evidenceWinner(a, b){
  if(a.preferred.length !== b.preferred.length) return a.preferred.length > b.preferred.length ? "a" : "b";
  if(a.alternative.length !== b.alternative.length) return a.alternative.length > b.alternative.length ? "a" : "b";
  if(a.offProtocol.length !== b.offProtocol.length) return a.offProtocol.length < b.offProtocol.length ? "a" : "b";
  return "tie";
}

function _emptyDiff(){
  return {
    regimenA: [], regimenB: [],
    coverage:  { organisms:[], aOnly:[], bOnly:[], shared:[], gap:[] },
    toxicity:  {
      a: { flags:[], total:0, majorCount:0, hostCount:0 },
      b: { flags:[], total:0, majorCount:0, hostCount:0 },
    },
    microbiome:{
      a: { cdiffMax:0, cdiffAvg:0, cdiffTotal:0, mdrCount:{low:0,med:0,high:0}, mdrUnknown:0, scored:0 },
      b: { cdiffMax:0, cdiffAvg:0, cdiffTotal:0, mdrCount:{low:0,med:0,high:0}, mdrUnknown:0, scored:0 },
      winner: "tie",
    },
    evidence:  {
      a: { preferred:[], alternative:[], offProtocol:[] },
      b: { preferred:[], alternative:[], offProtocol:[] },
      winner: "tie",
    },
  };
}

function compareRegimens(regimenA, regimenB, syndrome){
  const a = _normRegimen(regimenA).map(_canonical);
  const b = _normRegimen(regimenB).map(_canonical);
  if(!a.length && !b.length) return _emptyDiff();

  const coverage = _coverage(a, b, syndrome);
  const toxA = _toxicity(a), toxB = _toxicity(b);
  const mbA  = _microbiome(a), mbB  = _microbiome(b);
  const evA  = _evidence(a, syndrome), evB = _evidence(b, syndrome);

  return {
    regimenA: a, regimenB: b,
    coverage,
    toxicity:  { a: toxA, b: toxB },
    microbiome:{ a: mbA, b: mbB, winner: _microbiomeWinner(mbA, mbB) },
    evidence:  { a: evA, b: evB, winner: _evidenceWinner(evA, evB) },
  };
}

export { compareRegimens };
