/* engine · antibiogram overlay — Phase E2
   Bridges a parsed antibiogram (from Phase E1) and a syndrome's empiric
   regimens (from data/syndromes.js + data/syndromeDecision.js) into a
   structured "local %S overlay" the UI can render.

   THE QUESTION THIS ENGINE ANSWERS
   ---------------------------------
   For each likely organism in a syndrome's bugs[] array, what does the
   institution's actual antibiogram say about the susceptibility of the
   agents this syndrome's empiric tiers would deploy? And: does any tier
   include an agent whose local %S falls below the IDSA / CLSI gate of
   80% for the most likely organism?

   TWO LAYERS
   ----------
   1. Bug-level coverage (`overlayForSyndrome`)
      For each orgId in syndrome.bugs[], pulls every antibiogram row
      that maps to that bucket, surfacing %S + caveats for the agents
      relevant to that organism class.

   2. Tier-level flag (`flagTierAgainstAntibiogram`)
      Scans a tier's rx string for known agents (via AGENT_RX), looks
      up their %S against the likely organisms, and returns a worst-
      case flag (ok / borderline / poor / unknown) plus the per-agent
      breakdown the UI can render as chips.

   THRESHOLDS
   ----------
   Default susceptibility gate per IDSA antibiotic-stewardship guidance
   and CLSI / EUCAST cumulative-susceptibility convention:
     - ok          · %S ≥ 80    (acceptable empiric choice)
     - borderline  · %S 60-79   (use with caution; consider alternative)
     - poor        · %S < 60    (do not use empirically)
     - unknown     · no %S recorded OR insufficient isolates (smallN)
   Caveats override numerically: e.g. AmpC-induction caveat downgrades
   ceftriaxone to "poor" regardless of the raw %S.

   CONTEXT-AWARE BREAKPOINTS
   -------------------------
   syndrome.cat === "gu"   → use the agent:urine breakpoint when present
   syndrome.cat === "cns"  → use the agent:meningitis breakpoint when present
   Otherwise the bare default breakpoint is used.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

import {
  rowsForOrgId, getSusceptibility, ANTIBIOGRAM_AGENTS,
} from "../data/antibiograms/index.js";
import { AGENT_RX } from "../data/drugs.js";

/* AGENT_RX.canon → ANTIBIOGRAM_AGENTS canonical key. AGENT_RX is the
   engine's drug-name parser; ANTIBIOGRAM_AGENTS is the antibiogram's
   data shape. Most strings line up after lowercasing + matching by
   substring, but a handful need an explicit bridge (e.g. "Nafcillin /
   oxacillin" → "oxacillin", "Vancomycin (IV)" → "vancomycin"). */
const _CANON_TO_ANTIBIOGRAM_KEY = {
  "Piperacillin-tazobactam": "piperacillin-tazobactam",
  "Ampicillin-sulbactam":    "ampicillin-sulbactam",
  "Amoxicillin-clavulanate": "amoxicillin-clavulanate",
  "Meropenem":               "meropenem",
  "Ertapenem":               "ertapenem",
  "Cefepime":                "cefepime",
  "Ceftazidime":             "ceftazidime",
  "Ceftriaxone":             "ceftriaxone",
  "Cefazolin":               "cefazolin",
  "Nafcillin / oxacillin":   "oxacillin",
  "Ampicillin":              "ampicillin",
  "Penicillin G":            "penicillin",
  "Aztreonam":               "aztreonam",
  "Vancomycin (IV)":         "vancomycin",
  "Moxifloxacin":            null,         // not on most antibiograms; skip silently
  "Levofloxacin":            "levofloxacin",
  "Ciprofloxacin":           "ciprofloxacin",
  "Daptomycin":              null,         // not on most antibiograms
  "Linezolid / tedizolid":   null,         // not on most antibiograms
  "Metronidazole":           null,         // anaerobic; not on antibiogram
};

/* Supplementary patterns — agents on antibiograms that aren't in
   AGENT_RX (which is scoped to the inpatient IV-β-lactam decision tree).
   Order matters: longest / most specific aliases first. */
const _EXTRA_AGENT_PATTERNS = [
  { rx: /nitrofurantoin|macrobid|macrodantin/i,                                       key: "nitrofurantoin" },
  { rx: /trimethoprim[-\/\s]*sulfamethoxazole|tmp[-\/]*smx|sxt|bactrim|septra|co-trimoxazole/i, key: "tmp-smx" },
  { rx: /doxycycline|vibramycin/i,                                                    key: "doxycycline" },
  { rx: /tetracycline\b/i,                                                            key: "tetracycline" },
  { rx: /erythromycin/i,                                                              key: "erythromycin" },
  { rx: /clindamycin|cleocin/i,                                                       key: "clindamycin" },
  { rx: /cefuroxime|zinacef/i,                                                        key: "cefuroxime" },
  { rx: /gentamicin/i,                                                                key: "gentamicin" },
  { rx: /tobramycin/i,                                                                key: "tobramycin" },
];

/* Thresholds */
const _OK_GATE = 80;
const _BORDERLINE_GATE = 60;

/* Classify a single %S → flag. */
function _classify(susc, hasCaveat) {
  if(susc == null) return "unknown";
  if(hasCaveat) return "poor";
  if(susc >= _OK_GATE) return "ok";
  if(susc >= _BORDERLINE_GATE) return "borderline";
  return "poor";
}

/* Pick the worst flag across a list (poor > borderline > unknown > ok). */
const _WORST_RANK = { ok: 0, unknown: 1, borderline: 2, poor: 3 };
function _worstFlag(flags) {
  let worst = "ok";
  for(const f of flags) {
    if((_WORST_RANK[f] || 0) > (_WORST_RANK[worst] || 0)) worst = f;
  }
  return worst;
}

/* Map a syndrome category to the antibiogram lookup context. */
function _contextForSyndrome(syndrome) {
  if(!syndrome) return null;
  if(syndrome.cat === "gu") return "urine";
  if(syndrome.cat === "cns") return "meningitis";
  return null;
}

/* Parse a tier.rx string for known agents. Returns canonical antibiogram
   agent keys. Returns the same key only once even if the rx mentions
   the agent multiple times. Skips agents that don't appear on
   antibiograms (metronidazole, daptomycin, linezolid). */
function agentsForTier(rxText) {
  if(!rxText) return [];
  const found = new Set();
  for(const a of AGENT_RX) {
    if(a.rx.test(rxText)) {
      const key = _CANON_TO_ANTIBIOGRAM_KEY[a.canon];
      if(key) found.add(key);
    }
  }
  for(const p of _EXTRA_AGENT_PATTERNS) {
    if(p.rx.test(rxText)) found.add(p.key);
  }
  return Array.from(found);
}

/* Compute the bug-level coverage breakdown for one syndrome.
   Returns { bugRows: [...], context, missingOrgs: [...] }. */
function overlayForSyndrome(antibiogram, syndrome, options = {}) {
  if(!antibiogram || !syndrome) {
    return { bugRows: [], context: null, missingOrgs: [], agentsOfInterest: [] };
  }
  const context = options.context || _contextForSyndrome(syndrome);
  const bugs = syndrome.bugs || [];

  // Build the set of agents this syndrome would consider — union of every
  // tier's rx. The overlay only renders %S for relevant agents (otherwise
  // every cell is noise).
  const agentsOfInterest = new Set();
  for(const tier of syndrome.tiers || []) {
    for(const a of agentsForTier(tier.rx)) agentsOfInterest.add(a);
  }
  const agentsList = Array.from(agentsOfInterest);

  const bugRows = [];
  const missingOrgs = [];
  for(const orgId of bugs) {
    const rows = rowsForOrgId(antibiogram, orgId);
    if(rows.length === 0) {
      missingOrgs.push(orgId);
      continue;
    }
    for(const row of rows) {
      const agents = {};
      for(const ak of agentsList) {
        const value = getSusceptibility(row, ak, context);
        const caveat = row.caveats ? row.caveats[ak] : null;
        agents[ak] = {
          value,
          contextValue: context ? getSusceptibility(row, ak, context) : null,
          defaultValue: getSusceptibility(row, ak, null),
          flag: row.smallN ? "unknown" : _classify(value, !!caveat),
          caveat: caveat || null,
        };
      }
      bugRows.push({
        orgId: row.orgId,
        species: row.species,
        gram: row.gram,
        n: row.n,
        smallN: row.smallN,
        agents,
      });
    }
  }

  return {
    bugRows,
    context,
    missingOrgs,
    agentsOfInterest: agentsList,
  };
}

/* Flag one tier of one syndrome against the antibiogram. Returns
   { tierIdx, label, agents, worst, perAgent, issues }. */
function flagTierAgainstAntibiogram(antibiogram, syndrome, tierIdx) {
  const empty = { tierIdx, label: "", agents: [], worst: "unknown", perAgent: {}, issues: [] };
  if(!antibiogram || !syndrome) return empty;
  const tier = (syndrome.tiers || [])[tierIdx];
  if(!tier) return empty;

  const context = _contextForSyndrome(syndrome);
  const tierAgents = agentsForTier(tier.rx);
  if(tierAgents.length === 0) return { ...empty, label: tier.k || "" };

  const bugs = syndrome.bugs || [];
  const perAgent = {};
  const issues = [];
  const flags = [];

  for(const ak of tierAgents) {
    // For each likely-bug bucket, take the worst (lowest) %S across rows.
    let worstSusc = null;
    let worstRow = null;
    let caveat = null;
    let anyRowFound = false;
    let anySmallN = false;
    for(const orgId of bugs) {
      const rows = rowsForOrgId(antibiogram, orgId);
      for(const row of rows) {
        anyRowFound = true;
        if(row.smallN) anySmallN = true;
        const v = getSusceptibility(row, ak, context);
        const c = row.caveats ? row.caveats[ak] : null;
        if(c && !caveat) caveat = c;
        if(v != null) {
          if(worstSusc == null || v < worstSusc) {
            worstSusc = v;
            worstRow = row;
          }
        }
      }
    }
    const flag = !anyRowFound ? "unknown"
      : (anySmallN && worstSusc == null) ? "unknown"
      : _classify(worstSusc, !!caveat);
    perAgent[ak] = { susceptibility: worstSusc, flag, caveat, species: worstRow ? worstRow.species : null };
    flags.push(flag);
    if(flag === "poor" || flag === "borderline") {
      const label = (ANTIBIOGRAM_AGENTS[ak] && ANTIBIOGRAM_AGENTS[ak].display) || ak;
      const species = worstRow ? worstRow.species : "covered organisms";
      if(caveat) {
        issues.push(`${label}: ${caveat} (local %S ${worstSusc != null ? worstSusc + "%" : "n/a"} for ${species})`);
      } else {
        issues.push(`${label}: local %S ${worstSusc}% for ${species} — below ${_OK_GATE}% empiric gate.`);
      }
    }
  }

  return {
    tierIdx,
    label: tier.k || "",
    agents: tierAgents,
    worst: _worstFlag(flags),
    perAgent,
    issues,
  };
}

/* Flag every tier in a syndrome. Convenience batch wrapper. */
function flagAllTiers(antibiogram, syndrome) {
  if(!antibiogram || !syndrome || !Array.isArray(syndrome.tiers)) return [];
  return syndrome.tiers.map((_, i) => flagTierAgainstAntibiogram(antibiogram, syndrome, i));
}

/* Full overlay summary for one syndrome — bug-level + tier-level. */
function summarizeSyndrome(antibiogram, syndrome) {
  return {
    syndromeId: syndrome ? syndrome.id : null,
    syndromeName: syndrome ? syndrome.name : null,
    antibiogramId: antibiogram ? antibiogram.id : null,
    antibiogramName: antibiogram ? antibiogram.name : null,
    period: antibiogram ? antibiogram.period : null,
    coverage: overlayForSyndrome(antibiogram, syndrome),
    tiers: flagAllTiers(antibiogram, syndrome),
  };
}

export {
  overlayForSyndrome,
  flagTierAgainstAntibiogram,
  flagAllTiers,
  summarizeSyndrome,
  agentsForTier,
  _CANON_TO_ANTIBIOGRAM_KEY,
};
