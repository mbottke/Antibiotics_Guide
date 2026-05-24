/* data · evidenceMap — Phase D3 two-way evidence map.
   Inpatient Antibiotic Guide — module graph documented in README.md.

   PURPOSE
   -------
   Derives a bidirectional link graph between the 60-entry GUIDELINES
   registry and the per-syndrome research panels in syndromeDecision.
   Today the link is one-way (syndrome → trial via research.trials /
   research.guidelines); after D3, the reverse direction is reachable
   from the trial drawer — "decisions powered by this trial".

   SHAPE
   -----
     TRIAL_TO_SYNDROMES = {
       balance: [
         { id:"sepsis",    name:"Sepsis / Septic Shock", source:"research.trials" },
         { id:"gnbact",    name:"Gram-Negative Bacteremia", source:"research.trials" },
         ...
       ],
       capecod: [...],
       ...
     }

   Each entry: { id, name, source } — id is the syndrome id, name is
   the display label (looked up via SYNDROMES), source is the field
   that cites the trial (e.g., "research.trials", "research.guidelines",
   "duration.evidence"). When multiple sources cite the same
   syndrome-trial pair, only the first encountered wins (dedup by syn-id).

   MATCHING
   --------
   syndromeDecision.research entries store trial citations as free-text
   strings (e.g., "BALANCE NEJM 2024", "Stevens IDSA 2014") rather than
   GUIDELINES ids. This module owns a curated pattern table that maps
   those strings back to canonical guideline ids. Patterns are
   intentionally conservative — only confident matches (trial acronym,
   distinct first-author surname + year, or society + year + topic
   keywords) make the index. Ambiguous citations (e.g., generic
   "Cochrane 2010 meta-analysis") drop through, which is correct
   behaviour: the reverse-lookup card should list syndromes where the
   trial is unambiguously cited, not over-claim.

   The matcher walks every authored research panel:
     - research.trials[i].name             — trial-acronym + author patterns
     - research.guidelines[i] (society, year, topic) — society + year matchers

   It also harvests one additional cross-reference site:
     - duration.evidence string — short hyphen-tagged citations
       ("BALANCE 2024", "STOP-IT 2015", "OVIVA 2019") already used to
       anchor the duration headline. These point reliably at the same
       trials and add coverage for syndromes whose research panel
       doesn't repeat the headline trial in its trials[] array.

   At module-load time the matcher logs a console.warn for any orphan
   ids — i.e., a pattern that maps to a guideline id missing from
   GUIDELINES. This catches a future content edit that renames a
   GUIDELINES id without updating the patterns here.

   USAGE
   -----
     import { TRIAL_TO_SYNDROMES, getSyndromesForTrial } from "./evidenceMap.js";
     const list = getSyndromesForTrial("merino");
     // → [{ id:"sepsis-hcaq", name:"Healthcare-Associated Sepsis", source:"..." }, ...]

   The TrialCard component (src/components/cards.jsx) uses
   getSyndromesForTrial to render the "Decisions powered by this trial"
   section. When the trial has no syndrome citations, the helper
   returns an empty array and the section renders nothing — graceful
   fallback. */

import { GUIDELINES } from "./evidence.js";
import { SYNDROMES } from "./syndromes.js";
import { SYNDROME_DECISION } from "./syndromeDecision.js";

/* ===========================================================
   PATTERN TABLE — trial-name string → guideline id.

   Patterns run case-insensitive against the trial.name field of every
   research.trials entry. Order matters only for clarity; the matcher
   tries every pattern and dedupes by (guideline id, syndrome id).

   When adding a new GUIDELINES entry, add a pattern here so its
   syndrome citations show up in the reverse index. Patterns should
   prefer trial acronyms (BALANCE, MERINO) over author surnames when
   both are available — acronyms are much less ambiguous.
   ========================================================== */
const TRIAL_NAME_PATTERNS = [
  /* Landmark RCTs — anchored by stable acronyms. */
  { id:"balance",      pat:/\bBALANCE\b/i },
  { id:"stopit",       pat:/\bSTOP-?IT\b/i },
  { id:"oviva",        pat:/\bOVIVA\b/i },
  { id:"poet",         pat:/\bPOET\b/i },
  { id:"merino",       pat:/\bMERINO\b/i },
  { id:"capecod",      pat:/\bCAPE-?COD\b/i },
  { id:"pneuma",       pat:/\bPneumA\b/i },
  { id:"diabolo",      pat:/\bDIABOLO\b/i },
  { id:"coda",         pat:/\bCODA\b.*\b(NEJM|2020|appendi)/i },
  { id:"datipo",       pat:/\bDATIPO\b/i },
  { id:"modify",       pat:/\bMODIFY\b/i },
  { id:"reduce",       pat:/\bREDUCE\b.*\b(JAMA|2013|Leuppi|COPD)/i },
  { id:"ease",         pat:/\bEASE\b.*\b(NEJM|2012|Kang|endocardit)/i },
  { id:"arrest",       pat:/\bARREST\b/i },
  { id:"propatria",    pat:/\bPROPATRIA\b/i },
  { id:"avod",         pat:/\bAVOD\b/i },
  { id:"vfneo",        pat:/\b(SECURE|Maertens)\b.*\b(NEJM\s*2018|2018)/i },
  { id:"vosteo",       pat:/\bBernard\b.*\bLancet\b.*\b2015\b/i },
  { id:"dutchstepup",  pat:/\b(PANTER|Dutch Step-?Up|van Santvoort)\b/i },

  /* RCTs anchored by first-author + year. */
  { id:"degans",       pat:/\b(de Gans|van de Beek)\b.*\b(NEJM\s*2002|2002)/i },
  { id:"talan",        pat:/\bTalan\b.*\bJAMA\b.*\b2000\b/i },
  { id:"patch",        pat:/\bPATCH\b.*\b(BMJ|2018|cellulitis)/i },
  { id:"pallin",       pat:/\bPallin\b.*\b(CID|2013)/i },
  { id:"fmt",          pat:/\bvan Nood\b.*\b(NEJM|2013|FMT)/i },
  { id:"wongehec",     pat:/\bWong\b.*\b(CID|NEJM|2000|EHEC)/i },
  { id:"hoffman",      pat:/\bHoffman\b.*\b(NEJM|1984|typhoid|dexamethasone)/i },
  { id:"brouwerba",    pat:/\bBrouwer\b.*\b(NEJM\s*2014|2014).*\b(cohort|abscess)/i },
  { id:"darouicheea",  pat:/\bDarouiche\b.*\b(NEJM|2006|epidural)/i },
  { id:"fishman",      pat:/\bFishman\b.*\b(NEJM|2007|transplant)/i },
  { id:"bisharat",     pat:/\bBisharat\b.*\b(Lancet|2001|OPSI)/i },

  /* "ser109" — ECOSPOR III. */
  { id:"ser109",       pat:/\b(ECOSPOR|SER-?109|Vowst|Feuerstadt)\b/i },
];

/* ===========================================================
   GUIDELINE-PATTERN TABLE — for the research.guidelines[] entries
   that cite a society document. Patterns combine a society regex,
   an optional year exact-match, and an optional topic-keyword regex.
   ========================================================== */
const GUIDELINE_SOCIETY_PATTERNS = [
  /* Surviving Sepsis Campaign — SCCM/ESICM */
  { id:"ssc",          society:/\b(SSC|SCCM|ESICM)\b/i, year:2021 },
  /* CAP — ATS/IDSA 2019 (Metlay) */
  { id:"cap",          society:/\b(IDSA|ATS)\b/i, year:2019, topic:/\b(CAP|Metlay|community-acquired pneumonia)\b/i },
  /* HAP/VAP — ATS/IDSA 2016 (Kalil) */
  { id:"hapvap",       society:/\b(IDSA|ATS)\b/i, year:2016, topic:/\b(HAP|VAP|Kalil|ventilator)\b/i },
  /* SSTI — IDSA 2014 (Stevens) */
  { id:"ssti",         society:/\bIDSA\b/i, year:2014, topic:/\b(SSTI|Stevens|skin|soft-?tissue)\b/i },
  /* CDI — IDSA/SHEA 2021 */
  { id:"cdi",          society:/\b(IDSA|SHEA)\b/i, year:2021, topic:/\b(C\.?\s*difficile|CDI|Johnson)\b/i },
  /* IE — ESC/AHA 2023 */
  { id:"ie",           society:/\b(ESC|AHA|ESCMID)\b/i, year:2023, topic:/\b(endocardit|IE|valve)\b/i },
  /* Vancomycin TDM — ASHP/IDSA 2020 (Rybak) */
  { id:"vanco",        society:/\b(ASHP|IDSA|PIDS|SIDP)\b/i, year:2020, topic:/\b(vanc|AUC|Rybak|TDM)\b/i },
  /* Surgical prophylaxis — ASHP/IDSA/SIS 2013 */
  { id:"proph",        society:/\b(ASHP|IDSA|SIS)\b/i, year:2013, topic:/\b(prophylaxis|surgery|Bratzler)\b/i },
  /* Diabetic foot — IWGDF/IDSA 2023 */
  { id:"iwgdf_idsa",   society:/\b(IWGDF|IDSA)\b/i, year:2023, topic:/\b(diabet|foot|Senneville|Lipsky)\b/i },
  /* AMR-GN — IDSA 2024 (Tamma) */
  { id:"amrgn",        society:/\bIDSA\b/i, year:2024, topic:/\b(MDR|ESBL|CRE|AMR|resistance|Tamma|carbapenem)\b/i },
  /* AASLD — SBP 2021 (Biggins) */
  { id:"aasld",        society:/\bAASLD\b/i, year:2021, topic:/\b(SBP|ascites|Biggins|peritonitis)\b/i },
  /* Tokyo Guidelines — TG18 */
  { id:"tokyo",        society:/\b(TG\s?18|TG\s?13|Tokyo)\b/i },
  /* CRBSI — IDSA 2009 (Mermel) */
  { id:"crbsi_g",      society:/\bIDSA\b/i, year:2009, topic:/\b(catheter|CRBSI|Mermel|intravascular)\b/i },
  { id:"mermel",       society:/\bIDSA\b/i, year:2009, topic:/\b(catheter|CRBSI|Mermel|intravascular)\b/i },
  /* Febrile neutropenia — IDSA 2018 (Freifeld/Taplitz) */
  { id:"fn",           society:/\bIDSA\b/i, year:2018, topic:/\b(neutropen|Freifeld|Taplitz|MASCC)\b/i },
  { id:"taplitzfn",    society:/\b(ASCO|IDSA)\b/i, year:2018, topic:/\b(Taplitz|outpatient|fever|neutropen)\b/i },
  /* CDC vaccines — ACIP 2024 */
  { id:"cdc_acip",     society:/\b(CDC|ACIP)\b/i, year:2024, topic:/\b(vaccin|asplen|immuniz)\b/i },
  /* BSH Asplenia — Davies 2011 */
  { id:"davies_bsh",   society:/\b(BSH|Br J Haematol|British Society)\b/i, year:2011 },
  /* ACG Pancreatitis 2024 */
  { id:"acg_pancreatitis", society:/\bACG\b/i, year:2024, topic:/\b(pancreatit|Crockett)\b/i },
  /* CDC STI 2021 (Workowski) */
  { id:"cdc_sti",      society:/\bCDC\b/i, year:2021, topic:/\b(STI|sexual|PID|Workowski|MMWR)\b/i },
  /* CDC Anthrax/Tier-1 select agents */
  { id:"cdc_abx",      society:/\bCDC\b/i, topic:/\b(anthrax|plague|tularem|Q fever|select agent)\b/i },
  /* IDSA Stewardship 2016 (Barlam) */
  { id:"stew",         society:/\b(IDSA|SHEA)\b/i, year:2016, topic:/\b(stewardship|Barlam|de-?escalation)\b/i },
];

/* ===========================================================
   Helpers — quick lookups by syndrome id. The SYNDROMES list is
   the authoritative display-label source.
   ========================================================== */
const _SYN_BY_ID = (() => {
  const m = {};
  for(const s of SYNDROMES) m[s.id] = s;
  return m;
})();

function _synDisplayName(synId) {
  const s = _SYN_BY_ID[synId];
  return s ? s.name : synId;
}

/* Match a single trial.name string against the pattern table.
   Returns an array of matched guideline ids (deduped). A single
   trial-name can in principle match more than one pattern (e.g.,
   a combined citation "AVOD / DIABOLO" mentions both). */
function _matchTrialName(name) {
  if(typeof name !== "string") return [];
  const hits = new Set();
  for(const { id, pat } of TRIAL_NAME_PATTERNS) {
    if(pat.test(name)) hits.add(id);
  }
  return [...hits];
}

/* Match a single research.guidelines[] entry (society, year, topic, keypoint)
   against the society pattern table. Returns a guideline id or null. */
function _matchGuideline(entry) {
  if(!entry || typeof entry !== "object") return null;
  const society = entry.society || "";
  const year = entry.year;
  const topic = entry.topic || "";
  const keypoint = entry.keypoint || "";
  const blob = `${topic} ${keypoint}`;
  for(const rule of GUIDELINE_SOCIETY_PATTERNS) {
    if(!rule.society.test(society)) continue;
    if(rule.year != null && rule.year !== year) continue;
    if(rule.topic && !rule.topic.test(blob)) continue;
    return rule.id;
  }
  return null;
}

/* Match a duration.evidence string — short citation-bearing prose
   like "BALANCE 2024 — 7 vs 14 d non-inferior in controlled-source
   GNR bacteremia". Reuses the trial-name pattern table since the
   recognizable tokens (BALANCE, OVIVA, etc.) appear identically. */
function _matchEvidenceString(s) {
  if(typeof s !== "string") return [];
  return _matchTrialName(s);
}

/* ===========================================================
   INDEX BUILDER — walks SYNDROME_DECISION and computes the
   reverse index from trial id → syndrome list.

   Dedupes by (trialId, synId). The first source encountered wins
   for the `source` field so the order is deterministic:
     1. research.trials[]
     2. research.guidelines[]
     3. duration.evidence

   Validation: at the end, log a console.warn for any matcher id
   that is not present in GUIDELINES (catches a future renamed id).
   ========================================================== */
function _buildIndex() {
  const out = {};            // { trialId: Map<synId, sourceLabel> }
  const add = (trialId, synId, source) => {
    if(!trialId || !synId) return;
    if(!out[trialId]) out[trialId] = new Map();
    if(!out[trialId].has(synId)) out[trialId].set(synId, source);
  };

  for(const [synId, decision] of Object.entries(SYNDROME_DECISION)) {
    const research = decision && decision.research;
    if(research && Array.isArray(research.trials)) {
      for(const t of research.trials) {
        for(const id of _matchTrialName(t && t.name)) {
          add(id, synId, "research.trials");
        }
      }
    }
    if(research && Array.isArray(research.guidelines)) {
      for(const g of research.guidelines) {
        const id = _matchGuideline(g);
        if(id) add(id, synId, "research.guidelines");
      }
    }
    /* duration.evidence — short citation prose. Adds coverage for
       syndromes whose research.trials happens not to list the same
       headline trial. */
    const evidence = decision && decision.duration && decision.duration.evidence;
    for(const id of _matchEvidenceString(evidence)) {
      add(id, synId, "duration.evidence");
    }
  }

  /* Materialize to the export shape: { id, name, source } sorted by name. */
  const flat = {};
  for(const [trialId, synMap] of Object.entries(out)) {
    const arr = [...synMap.entries()].map(([id, source]) => ({
      id, name:_synDisplayName(id), source,
    }));
    arr.sort((a, b) => a.name.localeCompare(b.name));
    flat[trialId] = arr;
  }
  return flat;
}

/* ===========================================================
   VALIDATION — orphan-id check at module load.

   A pattern id pointing at a missing GUIDELINES entry is a content
   bug: a future rename of a GUIDELINES key would silently drop the
   reverse links. console.warn surfaces it on the dev console
   (parallels the App.jsx integrity self-check pattern). The
   regression test in tests/content-audit.test.js converts the same
   condition into a hard CI failure.
   ========================================================== */
function _validate(index) {
  const orphans = [];
  for(const trialId of Object.keys(index)) {
    if(!GUIDELINES[trialId]) orphans.push(trialId);
  }
  /* Also validate the matcher tables themselves — patterns may
     name an id that no trial ever matched but the id must still be
     present in GUIDELINES so a future content edit can't drift. */
  for(const { id } of TRIAL_NAME_PATTERNS) {
    if(!GUIDELINES[id]) orphans.push(id);
  }
  for(const { id } of GUIDELINE_SOCIETY_PATTERNS) {
    if(!GUIDELINES[id]) orphans.push(id);
  }
  const unique = [...new Set(orphans)];
  if(unique.length && typeof console !== "undefined" && console.warn) {
    console.warn(
      `[abx-guide] evidenceMap: ${unique.length} matcher id(s) missing from GUIDELINES — ` +
      `reverse-lookup will drop these entries silently. Affected: ${unique.join(", ")}`
    );
  }
  return unique;
}

const TRIAL_TO_SYNDROMES = _buildIndex();
const _ORPHAN_IDS = _validate(TRIAL_TO_SYNDROMES);

/* Public accessor. Returns the syndrome list for a trial id, or an
   empty array if the trial isn't cited by any syndrome. Pure — does
   no work beyond a property lookup. */
function getSyndromesForTrial(trialId) {
  return TRIAL_TO_SYNDROMES[trialId] || [];
}

/* Aggregate edge count — derived once at module load for test +
   summary use. Each edge is a (trial, syndrome) pair. */
const TRIAL_TO_SYNDROMES_EDGE_COUNT = Object.values(TRIAL_TO_SYNDROMES)
  .reduce((n, arr) => n + arr.length, 0);

export {
  TRIAL_TO_SYNDROMES,
  TRIAL_TO_SYNDROMES_EDGE_COUNT,
  getSyndromesForTrial,
  /* exported for tests + integrity self-check only — not part of the
     stable runtime API. */
  _ORPHAN_IDS,
};
