/* engine · penetration, allergy, interactions, evidence, class/glossary builders (pure).
   Inpatient Antibiotic Guide — module graph documented in README.md. */
import { DRUG_CLASSES, DRUG_IX, PEN_SITE_LABEL } from "../data/drugs.js";
import { DUR_BY_DX, GUIDELINES } from "../data/evidence.js";
import { SYN_GUIDE } from "../data/syndromes.js";
import { GLOSSARY } from "../data/content.js";

function penChips(pen){
  if(!pen) return null;
  const good = [], poor = [];
  Object.keys(pen.c || {}).forEach(k => {
    if(pen.c[k] === "good") good.push(PEN_SITE_LABEL[k] || k);
    if(pen.c[k] === "poor") poor.push(PEN_SITE_LABEL[k] || k);
  });
  return { good, poor, note:pen.note };
}

/* concise allergy guidance keyed to the β-lactam-allergy severity in ctx */
function allergyGuidance(level){
  if(level === "severe") return {
    tone:"ox",
    head:"Severe β-lactam allergy (anaphylaxis / SJS-DRESS)",
    body:"Avoid penicillins and side-chain-shared cephalosporins. Aztreonam is the Gram-negative backbone (no penicillin cross-reactivity — except prior ceftazidime, with which it shares an R1 chain). Use vancomycin / linezolid / daptomycin for Gram-positives and a fluoroquinolone or aminoglycoside as the situation requires. Carbapenem cross-reactivity is <1% but is reserved for confirmed need after risk assessment.",
  };
  if(level === "mild") return {
    tone:"amber",
    head:"Low-risk / delayed penicillin reaction",
    body:"Cefazolin and 3rd/4th-generation cephalosporins carry negligible cross-reactivity (distinct side chains) and are generally safe. Proceed with the standard regimen; consider an inpatient test-dose or allergy de-labeling rather than defaulting to broader agents.",
  };
  return null;
}

/* Tier 0 — interactions for one agent (DrugCard). */
function interactionsForAgent(name){
  return DRUG_IX.filter(x => x.agents.includes(name));
}

/* Tier 1 — regimen-level flags from a list of resolved agent names.
   Returns { pairs:[{tag,sev,agents,mech}], singles:[{agent,tag,sev,with,mech}] }.
   `pairs` = two regimen agents sharing a pairKey (additive risk made concrete);
   `singles` = each agent's major/host-relevant interactions, surfaced once. */
function regimenInteractions(agentNames){
  const set = agentNames;
  const pairs = [], seenPair = new Set();
  // pairwise: shared pairKey among DISTINCT regimen agents
  for(let i=0;i<set.length;i++){
    for(let j=i+1;j<set.length;j++){
      const a = set[i], bb = set[j];
      const ka = DRUG_IX.filter(x => x.pairKey && x.agents.includes(a));
      const kb = DRUG_IX.filter(x => x.pairKey && x.agents.includes(bb));
      ka.forEach(xa => kb.forEach(xb => {
        if(xa.pairKey === xb.pairKey){
          const id = [a,bb].sort().join("|")+":"+xa.pairKey;
          if(!seenPair.has(id)){
            seenPair.add(id);
            pairs.push({ tag:xa.tag, sev: xa.sev === "major" || xb.sev === "major" ? "major" : "moderate",
              agents:[a,bb], mech:xa.mech });
          }
        }
      }));
    }
  }
  // singles: surface each agent's major interactions (host-factor reminders)
  const singles = [];
  set.forEach(a => interactionsForAgent(a).forEach(x => {
    if(x.sev === "major" || x.host) singles.push({ agent:a, tag:x.tag, sev:x.sev, with:x.with, mech:x.mech });
  }));
  return { pairs, singles };
}

function classData(phrase){
  let k = phrase.toLowerCase();
  let d = DRUG_CLASSES[k] || DRUG_CLASSES[k.replace(/s$/, "")];
  let guard = 0;
  while(d && d.alias && guard++ < 4) d = DRUG_CLASSES[d.alias];
  return d;
}

function glossData(p){ let d = GLOSSARY[p] || GLOSSARY[p.replace(/s$/, "")]; let g = 0; while(d && d.alias && g++ < 4) d = GLOSSARY[d.alias]; return d; }

/* Single resolver for a syndrome's evidence link. Prefers the shared durations
   registry (so the citation + RCT/Guideline tier match the Course table exactly);
   falls back to the SYN_GUIDE map for cards without a duration-table row. Returns
   { ref, ev } | null. This removes the drift between SYN_GUIDE and DUR_REF. */
function synEvidence(s){
  if(!s) return null;
  if(s.durKey && DUR_BY_DX[s.durKey]){
    const row = DUR_BY_DX[s.durKey];
    if(row.ref) return { ref:row.ref, ev:row.ev || null };
  }
  const g = SYN_GUIDE[s.id];
  return g ? { ref:g, ev:(GUIDELINES[g]||{}).kind || null } : null;
}

export { penChips, allergyGuidance, interactionsForAgent, regimenInteractions, synEvidence, classData, glossData };
