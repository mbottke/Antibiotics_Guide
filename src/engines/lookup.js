/* engine · knowledge-graph lookups: drug<->monograph, organism cards, spectrum (pure).
   Inpatient Antibiotic Guide — module graph documented in README.md. */
import { DRUG_ALIASES, FORMULARY, PEN, SAFE, TDM } from "../data/drugs.js";
import { _coretok, _normd } from "../lib/util.js";
import { SPX_AGENTS, SPX_ORG_BY } from "../spectrum/Spectrum.jsx";
import { RENAL_DOSING } from "../data/dosing.js";
import { resolveDrug } from "./dosing.js";
import { DIRECTED, SYNDROMES } from "../data/syndromes.js";
import { ORG_BY_ID, ORG_DIR_HINT, ORG_XWALK } from "../data/organisms.js";

function _looseFind(arr, key, name){
  if(!name) return null;
  const exact = arr.find(r => r[key] === name); if(exact) return exact;
  const alias = DRUG_ALIASES[name]; if(alias){ const a = arr.find(r => r[key] === alias); if(a) return a; }
  const rev = Object.keys(DRUG_ALIASES).find(k => DRUG_ALIASES[k] === name);
  if(rev){ const r = arr.find(x => x[key] === rev); if(r) return r; }
  const core = _coretok(name);
  if(core.length <= 3) return null;
  return arr.find(r => r[key] && _normd(r[key]).split(/[/,]/).some(p => p.trim().startsWith(core))) || null;
}

function drugLookup(name){
  const form  = FORMULARY.flatMap(c => c.drugs.map(dr => ({ ...dr, cls:c.cls }))).find(dr => dr.name === name) || null;
  const spx   = SPX_AGENTS.find(a => a.name === (DRUG_ALIASES[name] || name)) || _looseFind(SPX_AGENTS, "name", name);
  const pen   = _looseFind(PEN.filter(r => !r.band), "ag", name);
  const tox   = _looseFind(SAFE.filter(r => !r.band), "ag", name);
  const renal = RENAL_DOSING[name] || RENAL_DOSING[resolveDrug(name)] || null;
  const tdm   = TDM.find(t => _coretok(t.d) === _coretok(name)) || null;
  const core  = _coretok(name);
  const anchors = (core.length > 3)
    ? SYNDROMES.filter(s => s.tiers.some(t => _normd(t.rx).includes(core))).map(s => ({ id:s.id, name:s.name }))
    : [];
  return { name, form, spx, pen, tox, renal, tdm, anchors };
}

function orgLookup(id){
  const o = ORG_BY_ID[id]; if(!o) return null;
  const xwalk = ORG_XWALK[id] || [];
  const hints = ORG_DIR_HINT[id] || [];
  const directed = [];
  DIRECTED.forEach(g => g.items.forEach(it => {
    if(hints.some(h => _normd(it.org).includes(h))) directed.push(it);
  }));
  /* derived spectrum column: which agents are active against this organism's
     spectrum members, split into drug-of-choice / first-line / alternative. */
  const seen = new Set();
  const tiers = { doc:[], first:[], sec:[] };
  xwalk.forEach(sx => {
    SPX_AGENTS.forEach(a => {
      const lvl = a.c[sx];
      if(lvl !== "first" && lvl !== "sec") return;
      if(seen.has(a.name)) return;
      const star = (a.doc || []).includes(sx);
      if(star){ tiers.doc.push(a.name); seen.add(a.name); }
      else if(lvl === "first"){ tiers.first.push(a.name); seen.add(a.name); }
      else { tiers.sec.push(a.name); seen.add(a.name); }
    });
  });
  const members = xwalk.map(sx => SPX_ORG_BY[sx]).filter(Boolean);
  const syndromes = SYNDROMES.filter(s => (s.bugs || []).includes(id)).map(s => ({ id:s.id, name:s.name }));
  return { id, label:o.label, xwalk, members, directed, tiers, syndromes };
}

/* D4b · derived formulary filters (coverage via ORG_XWALK, route via spectrum) */
function _spxFor(name){ return SPX_AGENTS.find(a => a.name === (DRUG_ALIASES[name] || name)) || _looseFind(SPX_AGENTS, "name", name); }

function drugCoversOrg(name, orgId){
  const spx = _spxFor(name); if(!spx) return false;
  return (ORG_XWALK[orgId] || []).some(sx => spx.c[sx] === "first" || spx.c[sx] === "sec");
}

function drugRoute(name){ const spx = _spxFor(name); return spx ? (spx.route || "") : ""; }

export { _looseFind, drugLookup, orgLookup, _spxFor, drugCoversOrg, drugRoute };
