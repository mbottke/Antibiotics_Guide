/* engine · referential-integrity self-check — pure, browser-free (DAG: engines).
   Inpatient Antibiotic Guide — module graph documented in README.md.

   Single source of truth for content integrity. Every cross-reference in the
   data layer must resolve: syndrome categories, organism bug-ids, duration and
   guideline ids, the org/drug cross-walks, dose-table monograph resolution, the
   interaction layer, and source-control keys; syndrome ids must be unique.

   Consumed by:
     - src/App.jsx  (on mount → console.info/warn; invisible to end users)
     - tests/integrity.test.js  (hard CI gate → fails the build on any problem)

   checkIntegrity() returns { ok, problems, stats } and performs NO logging, so
   the same computation drives both the dev console line and the test assertion. */

import { SYNDROMES, SYN_CATS, SYN_GUIDE, SRC_CONTROL } from "../data/syndromes.js";
import { ORGS, ORG_BY_ID, ORG_XWALK } from "../data/organisms.js";
import { DURATIONS, DUR_REF, DUR_BY_DX, GUIDELINES, TRIAL_DETAIL } from "../data/evidence.js";
import {
  FORMULARY, DRUG_ALIASES, DRUG_IX,
} from "../data/drugs.js";
import { RENAL_DOSING, WEIGHT_DOSING, HEPATIC_DOSING, HD_DOSING } from "../data/dosing.js";
import { SPX_ORGS, SPX_AGENTS } from "../spectrum/Spectrum.jsx";
import { drugLookup } from "./lookup.js";

/**
 * Run the full referential-integrity sweep over the data layer.
 * @returns {{ ok: boolean, problems: string[], stats: object }}
 */
export function checkIntegrity() {
  const problems = [];

  // --- syndromes: id present + unique, category known, bugs resolve, durKey resolves ---
  const catIds = new Set(SYN_CATS.map((c) => c.id));
  const seen = new Set();
  SYNDROMES.forEach((s) => {
    if (!s.id) problems.push(`syndrome "${s.name}" has no id`);
    else if (seen.has(s.id)) problems.push(`duplicate syndrome id "${s.id}"`);
    else seen.add(s.id);
    if (!catIds.has(s.cat)) problems.push(`syndrome "${s.id}" → unknown category "${s.cat}"`);
    (s.bugs || []).forEach((b) => {
      if (!ORG_BY_ID[b]) problems.push(`syndrome "${s.id}" → unknown bug id "${b}"`);
    });
    if (s.durKey && !DUR_BY_DX[s.durKey])
      problems.push(`syndrome "${s.id}" → durKey "${s.durKey}" matches no duration row`);
  });

  // --- durations ↔ guidelines ---
  Object.entries(DUR_REF).forEach(([dx, ref]) => {
    if (!GUIDELINES[ref]) problems.push(`DUR_REF["${dx}"] → unknown guideline id "${ref}"`);
  });
  const dxSet = new Set(DURATIONS.flatMap((g) => g.rows.map((r) => r.dx)));
  Object.keys(DUR_REF).forEach((dx) => {
    if (!dxSet.has(dx)) problems.push(`DUR_REF key "${dx}" matches no duration row`);
  });

  // --- spectrum cross-walks ---
  const spxIds = new Set(SPX_ORGS.map((o) => o.id));
  const spxNames = new Set(SPX_AGENTS.map((a) => a.name));
  const formNames = new Set(FORMULARY.flatMap((c) => c.drugs.map((dr) => dr.name)));
  // ORG_XWALK: every outer id present; every mapped value a real Spectrum id.
  ORGS.forEach((o) => {
    if (!(o.id in ORG_XWALK)) problems.push(`ORG_XWALK missing outer org id "${o.id}"`);
  });
  Object.entries(ORG_XWALK).forEach(([k, arr]) => {
    if (!ORG_BY_ID[k]) problems.push(`ORG_XWALK key "${k}" is not an outer org id`);
    arr.forEach((v) => {
      if (!spxIds.has(v)) problems.push(`ORG_XWALK["${k}"] → unknown Spectrum org id "${v}"`);
    });
  });
  // DRUG_ALIASES: key = real formulary drug; value = real Spectrum agent.
  Object.entries(DRUG_ALIASES).forEach(([f, s]) => {
    if (!formNames.has(f)) problems.push(`DRUG_ALIASES key "${f}" is not a formulary drug`);
    if (!spxNames.has(s)) problems.push(`DRUG_ALIASES["${f}"] → unknown Spectrum agent "${s}"`);
  });

  // --- dose-table monograph resolution ---
  // Every agent named in a dose table must resolve through drugLookup to a
  // non-empty monograph (the same path DoseAdjustBar's chips use). A dose-table
  // edit that introduces an unresolvable name fails here instead of opening an
  // empty drawer at the bedside.
  const _doseResolves = (name) => {
    const lk = drugLookup(name);
    return !!(lk && (lk.form || lk.spx || lk.pen || lk.tox));
  };
  [
    ["RENAL_DOSING", RENAL_DOSING],
    ["WEIGHT_DOSING", WEIGHT_DOSING],
    ["HEPATIC_DOSING", HEPATIC_DOSING],
    ["HD_DOSING", HD_DOSING],
  ].forEach(([label, table]) => {
    Object.keys(table).forEach((k) => {
      if (table[k] && table[k].alias) return; // alias entries point elsewhere; not drug names
      if (!_doseResolves(k))
        problems.push(`${label} agent "${k}" does not resolve through drugLookup (would open an empty monograph)`);
    });
  });

  // --- interaction layer: agent names resolve (Tier 0/1 links) ---
  DRUG_IX.forEach((x, i) =>
    x.agents.forEach((a) => {
      if (!_doseResolves(a)) problems.push(`DRUG_IX[${i}] agent "${a}" does not resolve through drugLookup`);
    })
  );

  // --- trial/guideline detail + syndrome→guideline map reference real guidelines ---
  Object.keys(TRIAL_DETAIL).forEach((k) => {
    if (!GUIDELINES[k]) problems.push(`TRIAL_DETAIL key "${k}" → unknown guideline id`);
  });
  const synIds = new Set(SYNDROMES.map((s) => s.id));
  Object.entries(SYN_GUIDE).forEach(([sy, gid]) => {
    if (!synIds.has(sy)) problems.push(`SYN_GUIDE key "${sy}" is not a syndrome id`);
    if (!GUIDELINES[gid]) problems.push(`SYN_GUIDE["${sy}"] → unknown guideline id "${gid}"`);
  });

  // --- source-control keys are real syndrome ids ---
  Object.keys(SRC_CONTROL).forEach((k) => {
    if (!synIds.has(k)) problems.push(`SRC_CONTROL key "${k}" is not a syndrome id`);
  });

  const doseAgents = new Set(
    [...Object.keys(RENAL_DOSING), ...Object.keys(WEIGHT_DOSING), ...Object.keys(HEPATIC_DOSING)].filter(
      (k) => !((RENAL_DOSING[k] || WEIGHT_DOSING[k] || HEPATIC_DOSING[k] || {}).alias)
    )
  );

  const stats = {
    syndromes: SYNDROMES.length,
    guidelineAnchored: SYNDROMES.filter((s) => SYN_GUIDE[s.id]).length,
    durationLinked: SYNDROMES.filter((s) => s.durKey).length,
    guidelines: Object.keys(GUIDELINES).length,
    orgXwalk: Object.keys(ORG_XWALK).length,
    dosingRules: Object.keys(RENAL_DOSING).length,
    doseAgents: doseAgents.size,
  };

  return { ok: problems.length === 0, problems, stats };
}

/** Human-readable one-liner mirroring the historical console output. */
export function integrityLine(result = checkIntegrity()) {
  const { ok, problems, stats } = result;
  if (!ok)
    return `[abx-guide] integrity check found ${problems.length} issue(s):\n  - ${problems.join("\n  - ")}`;
  return (
    `[abx-guide] integrity check: clean (${stats.syndromes} syndromes, ` +
    `${stats.guidelineAnchored} guideline-anchored, ${stats.durationLinked} duration-linked, ` +
    `${stats.guidelines} guidelines, ${stats.orgXwalk} org-xwalk, ${stats.dosingRules} dosing rules, ` +
    `${stats.doseAgents} dose-table agents → all monograph-resolved).`
  );
}
