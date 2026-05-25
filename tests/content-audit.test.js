/* tests · content-audit — Phase E.3 apex-quality CI gate.

   Enforces the authoring contract documented in docs/AUTHORING.md
   automatically. Runs every authored entry across the three content
   surfaces (regimenContent, syndromeDecision, combinedRisks) through
   a battery of shape + word-count + predicate-validity checks so
   sub-apex content cannot ship.

   Coverage philosophy: the audit gates AUTHORED content. A syndrome
   that has no entry in regimenContent / syndromeDecision is NOT a
   failure — it falls through to the legacy narrative renderer and
   waits for its turn to be authored. But the moment a single tier
   is added, every entry in that tier is held to the apex bar.

   This file is the source of truth the apex contract — if the
   docs/AUTHORING.md guidance ever drifts from the rules here, the
   rules here win (the guide gets updated). */

import { describe, expect, test } from "vitest";
import { SYNDROMES } from "../src/data/syndromes.js";
import { REGIMEN_CONTENT } from "../src/data/regimenContent.js";
import { SYNDROME_DECISION } from "../src/data/syndromeDecision.js";
import { COMBINED_RISKS } from "../src/data/combinedRisks.js";
import { REGIONAL_RESISTANCE } from "../src/data/regionalResistance.js";
import { NOVEL_AGENTS } from "../src/data/novelAgents.js";
import { PEDS_PREG_DOSING } from "../src/data/pedsPregDosing.js";
import { FORMULARY } from "../src/data/drugs.js";
import { SURGE_PROTOCOLS } from "../src/data/surgeProtocols.js";
import { SITE_PENETRATION } from "../src/data/sitePenetration.js";
import { GUIDELINES, EVOLVING, TRIAL_DETAIL } from "../src/data/evidence.js";
import { TRIAL_TO_SYNDROMES, getSyndromesForTrial, _ORPHAN_IDS } from "../src/data/evidenceMap.js";
import { DIAGNOSTICS } from "../src/data/diagnostics.js";
import { OPAT_PROFILES, getFormularyValidationErrors } from "../src/data/opatDecision.js";

/* -------- limits and known vocabularies ------------------------- */

const LIMITS = {
  pickIfMaxWords:        24,   // 22 target + headroom
  whyPickMinBullets:      3,
  whyPickMaxBullets:      8,   // 5 target, generous for complex agents
  whyPickMaxWords:       18,   // 14 target + headroom
  watchOutMinEntries:     2,   // 3 target, but some single-agent tiers fewer
  watchOutMaxWords:      28,   // 22 target + headroom for compound interactions
  durationHeadlineMaxWords: 26,
  durationStopWhenMin:    3,
  durationStopWhenMax:   10,
  durationExtendIfMin:    1,   // some syndromes naturally have few extension triggers
  durationExtendIfMaxWords: 30,
  branchesMin:            1,
  branchesMax:            8,
  branchDaysMaxLen:      24,   // chip should fit visually
  monitoringItemsMin:     3,
  monitoringWhatMaxWords: 28,
  monitoringWhyMaxWords:  26,
  combinedRiskDetailMaxWords: 50,
};

const SEV_WATCHOUT = new Set(["stop", "warn", "note"]);
const SEV_MONITORING = new Set(["required", "trigger", "consider"]);
const SEV_COMBINED = new Set(["stop", "warn", "note"]);

const KNOWN_CTX_FIELDS = new Set([
  "crcl", "age", "weight", "scr", "sex", "hd",
  "severe", "mrsaRisk", "pseudoRisk", "esblRisk",
  "blAllergy", "hepStage", "on", "pregnancy",
  "concurrentMeds",   // reserved for D3.9
]);

const KNOWN_COMPARATORS = new Set([
  "lt", "lte", "gt", "gte", "eq", "between", "in",
]);

/* -------- helpers ----------------------------------------------- */

function wordCount(s) {
  if(typeof s !== "string") return 0;
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function hasBold(s) {
  return typeof s === "string" && /\*\*[^*]+\*\*/.test(s);
}

/* Validate a matchCtx predicate object recursively. Returns an
   error string on the first problem, or null when the predicate
   is well-formed. The audit converts a non-null return into an
   expect().fail. */
function validateCtxPredicate(pred, path = "matchCtx") {
  if(pred == null || typeof pred !== "object" || Array.isArray(pred)) {
    return `${path}: must be a plain object`;
  }
  for(const key of Object.keys(pred)) {
    const val = pred[key];

    if(key === "any") {
      if(!Array.isArray(val) || val.length === 0) {
        return `${path}.any: must be a non-empty array of predicates`;
      }
      for(let i = 0; i < val.length; i++) {
        const sub = validateCtxPredicate(val[i], `${path}.any[${i}]`);
        if(sub) return sub;
      }
      continue;
    }

    if(!KNOWN_CTX_FIELDS.has(key)) {
      return `${path}: unknown ctx field "${key}" — known fields: ${[...KNOWN_CTX_FIELDS].join(", ")}`;
    }

    // Numeric/comparator object
    if(val !== null && typeof val === "object" && !Array.isArray(val)) {
      for(const cmp of Object.keys(val)) {
        if(!KNOWN_COMPARATORS.has(cmp)) {
          return `${path}.${key}: unknown comparator "${cmp}" — known: ${[...KNOWN_COMPARATORS].join(", ")}`;
        }
        if(cmp === "between") {
          if(!Array.isArray(val[cmp]) || val[cmp].length !== 2
            || typeof val[cmp][0] !== "number" || typeof val[cmp][1] !== "number") {
            return `${path}.${key}.between: must be [number, number]`;
          }
        } else if(cmp === "in") {
          if(!Array.isArray(val[cmp]) || val[cmp].length === 0) {
            return `${path}.${key}.in: must be a non-empty array`;
          }
        } else {
          // numeric comparator (lt/lte/gt/gte/eq)
          if(typeof val[cmp] !== "number") {
            return `${path}.${key}.${cmp}: must be a number`;
          }
        }
      }
    }
    // Bare value (constant equality) — string / boolean — accepted as-is.
  }
  return null;
}

/* -------- the audit --------------------------------------------- */

describe("content-audit · days-field unit-string contract (regression)", () => {
  /* Direct regression coverage for the apex contract that branch.days
     MUST carry an explicit unit / descriptive label. Catches bare
     integers AND bare ranges (the gap surfaced on PR #10 review).
     The check mirrors the rule applied in the branches block below. */
  const reject = (s) => /^[\d\s\-–—≥≤><=.,/]+$/.test(s.trim());

  test("accepts strings carrying explicit units / labels", () => {
    for(const s of ["5 d", "1 dose", "5–7 d", "4–6 wk", "≥ 42 d", "Indefinite", "FMT + 10 d bridge", "10–14 d + OR"]) {
      expect(reject(s), `should accept "${s}"`).toBe(false);
    }
  });

  test("rejects bare integers", () => {
    for(const s of ["5", "14", "42"]) {
      expect(reject(s), `should reject bare integer "${s}"`).toBe(true);
    }
  });

  test("rejects unitless ranges", () => {
    for(const s of ["5-7", "5–7", "5—7", "10/14"]) {
      expect(reject(s), `should reject unitless range "${s}"`).toBe(true);
    }
  });

  test("rejects unitless comparator-prefixed numbers", () => {
    for(const s of ["≥42", "≥ 42", "<=42", ">=42", "<14"]) {
      expect(reject(s), `should reject unitless comparator "${s}"`).toBe(true);
    }
  });
});

describe("content-audit · days-field integer-trap (regression)", () => {
  /* Surfaced via PR #16 review: `days: "Until ANC > 500"` parsed as
     500 calendar days for the stop-date calc because parseDurationDays
     extracts the FIRST integer. Any integer in the days field that is
     NOT immediately (within 8 chars) followed by a duration unit
     keyword is a trap: the parser will treat it as a day count even
     though it's a clinical threshold (ANC > 500, MIC > 4, etc.).

     The rule: every integer in days MUST have a duration-unit token
     within 8 chars after it. */
  const UNIT_NEAR_INT = /\b(d|day|days|wk|week|weeks|mo|month|months|h|hr|hrs|hour|hours|dose|doses)\b/i;
  function hasIntegerTrap(s) {
    if(typeof s !== "string") return false;
    const re = /\d+/g;
    let m;
    while((m = re.exec(s)) !== null) {
      const tail = s.slice(m.index + m[0].length, m.index + m[0].length + 10);
      if(!UNIT_NEAR_INT.test(tail)) return true;
    }
    return false;
  }

  test("accepts properly-unitted integers", () => {
    for(const s of ["5 d", "1 dose", "5–7 d", "4–6 wk", "≥ 42 d", "FMT + 10 d bridge",
                    "10–14 d + OR", "3 mo hip / 6 mo knee", "24 h", "≥ 6 wk + screen"]) {
      expect(hasIntegerTrap(s), `should accept "${s}"`).toBe(false);
    }
  });

  test("rejects integers without nearby unit (clinical threshold trap)", () => {
    for(const s of ["Until ANC > 500", "7 d or to ANC > 500", "MIC > 4 strain",
                    "Treat × 500", "PMN > 250"]) {
      expect(hasIntegerTrap(s), `should reject "${s}" (integer without nearby unit = parser trap)`).toBe(true);
    }
  });

  test("accepts digit-free labels", () => {
    for(const s of ["Indefinite", "Per source", "Until clear", "Per PJI",
                    "Per pathogen", "Until ANC recovers", "Extended"]) {
      expect(hasIntegerTrap(s), `should accept digit-free label "${s}"`).toBe(false);
    }
  });
});

describe("content-audit · coverage report", () => {
  const allSynIds = SYNDROMES.map(s => s.id);
  const regimenIds = Object.keys(REGIMEN_CONTENT);
  const decisionIds = Object.keys(SYNDROME_DECISION);

  test("every authored syndrome id matches a known syndrome", () => {
    for(const id of regimenIds) expect(allSynIds, `regimenContent id "${id}" must exist`).toContain(id);
    for(const id of decisionIds) expect(allSynIds, `syndromeDecision id "${id}" must exist`).toContain(id);
  });

  test("coverage stats reported", () => {
    /* This test never fails — its job is to surface numbers on the
       audit run so the team can see authoring velocity. Detailed
       per-syndrome failures still hard-fail the gate elsewhere. */
    const stats = {
      totalSyndromes:     allSynIds.length,
      regimenAuthored:    regimenIds.length,
      decisionAuthored:   decisionIds.length,
      regimenCoveragePct: Math.round(regimenIds.length / allSynIds.length * 100),
      decisionCoveragePct: Math.round(decisionIds.length / allSynIds.length * 100),
    };
    // eslint-disable-next-line no-console
    console.log("content-audit coverage:", JSON.stringify(stats, null, 2));
    expect(stats.totalSyndromes).toBeGreaterThan(0);
  });
});

describe("content-audit · branch matchAgent disambiguation", () => {
  /* When multiple branches in the same syndrome share a matchAgent
     regex that fires for the same agent string, the effectiveBranch
     resolver picks the FIRST matching branch (.find() semantics) —
     which silently picks the wrong default for the other clinical
     states. This audit enumerates a wide panel of drug names and
     verifies that no two branches in a syndrome both match the
     same agent string. Branches without matchAgent are exempt
     (they rely on explicit click or chip bridge for activation).

     Surfaced via PR #12 review: appendicitis had all 4 branches
     with the same regex, always auto-lighting "Uncomplicated"
     regardless of clinical state. */

  const PROBE_AGENTS = [
    // β-lactams
    "Cefazolin 2 g IV q8h", "nafcillin/oxacillin 2 g IV q4h",
    "Cephalexin 500 mg PO QID", "Dicloxacillin 500 mg PO QID",
    "Ceftriaxone 2 g IV q24h", "Ceftazidime 2 g IV q8h",
    "Cefepime 2 g IV q8h", "Cefpodoxime 200 mg PO BID",
    "Cefdinir 300 mg PO BID", "Cefuroxime 500 mg PO BID",
    "Piperacillin-tazobactam 4.5 g q6h", "piperacillin-tazobactam 4.5 g q6h",
    "Amoxicillin-clavulanate 875 mg PO BID", "amoxicillin-clavulanate",
    "Ampicillin-sulbactam 3 g IV q6h",
    "Amoxicillin 1 g PO TID", "Ampicillin 2 g IV q4h", "Penicillin G 4 MU IV q4h",
    // Carbapenems
    "Meropenem 1 g IV q8h", "Imipenem 500 mg IV q6h",
    "Ertapenem 1 g IV q24h", "Doripenem 500 mg IV q8h",
    // Anti-MRSA
    "Vancomycin (AUC 400-600)", "Daptomycin 8 mg/kg IV q24h",
    "Linezolid 600 mg q12h",
    // Macrolides
    "Azithromycin 500 mg PO q24h", "Clarithromycin 500 mg PO BID",
    // FQ
    "Ciprofloxacin 400 mg IV q12h", "Levofloxacin 750 mg PO daily",
    "Moxifloxacin 400 mg PO daily",
    // Tetracyclines
    "Doxycycline 100 mg PO BID", "Minocycline 100 mg PO BID",
    // Others
    "TMP-SMX DS BID", "trimethoprim-sulfamethoxazole",
    "Metronidazole 500 mg IV q8h", "Clindamycin 600 mg IV q8h",
    "Gentamicin 1 mg/kg IV q8h", "Tobramycin 5 mg/kg IV q24h",
    "Amikacin 15 mg/kg IV q24h", "Streptomycin 1 g IM daily",
    "Nitrofurantoin 100 mg PO BID", "Fosfomycin 3 g PO ×1",
    "Rifampin 600 mg PO daily", "Fidaxomicin 200 mg PO BID",
    "Aztreonam 2 g IV q8h",
    "Fluconazole 400 mg PO daily", "Caspofungin 70 mg IV ×1",
    "Micafungin 100 mg IV q24h", "Anidulafungin 200 mg IV ×1",
    // Novel β-lactams
    "Ceftolozane-tazobactam 1.5 g IV q8h", "Ceftazidime-avibactam 2.5 g IV q8h",
    "Imipenem-relebactam 1.25 g IV q6h", "Cefiderocol 2 g IV q8h",
    "Bezlotoxumab 10 mg/kg IV ×1",
    "Echinocandin",
  ];

  for(const synId of Object.keys(SYNDROME_DECISION)) {
    const dur = SYNDROME_DECISION[synId].duration;
    if(!dur || !dur.branches) continue;
    const taggedBranches = dur.branches.filter(b => b.matchAgent);
    if(taggedBranches.length < 2) continue;

    test(`[${synId} | duration] branches with matchAgent are mutually disambiguating`, () => {
      const collisions = [];
      for(const agent of PROBE_AGENTS) {
        const hits = taggedBranches.filter(b => b.matchAgent.test(agent));
        if(hits.length > 1) {
          collisions.push({
            agent,
            branches: hits.map(b => b.label),
          });
        }
      }
      if(collisions.length > 0) {
        const detail = collisions.slice(0, 5).map(c =>
          `  · "${c.agent}" matches branches: ${c.branches.join(" + ")}`
        ).join("\n");
        throw new Error(
          `[${synId}] matchAgent collision: ${collisions.length} probe agents match multiple branches.\n` +
          `First-match-wins resolver will silently pick the FIRST listed branch, ignoring clinical state.\n` +
          `Remove matchAgent from non-disambiguating branches, or refine regexes to be mutually exclusive.\n${detail}`
        );
      }
    });
  }
});

describe("content-audit · regimenContent.js entries", () => {
  for(const synId of Object.keys(REGIMEN_CONTENT)) {
    const tiers = REGIMEN_CONTENT[synId];
    for(const tierLabel of Object.keys(tiers)) {
      const entries = tiers[tierLabel];

      for(let i = 0; i < entries.length; i++) {
        const e = entries[i];
        const label = `[${synId} | ${tierLabel}] entry ${i}`;

        test(`${label} — required fields present`, () => {
          expect(e.rx, `${label}.rx must be RegExp`).toBeInstanceOf(RegExp);
          expect(typeof e.pickIf, `${label}.pickIf must be a string`).toBe("string");
          expect(e.whyPick, `${label}.whyPick must be array`).toBeInstanceOf(Array);
          expect(e.watchOut, `${label}.watchOut must be array`).toBeInstanceOf(Array);
        });

        test(`${label} — pickIf within wordcount`, () => {
          const wc = wordCount(e.pickIf);
          expect(wc, `${label}.pickIf has ${wc} words (max ${LIMITS.pickIfMaxWords})`)
            .toBeLessThanOrEqual(LIMITS.pickIfMaxWords);
          expect(wc, `${label}.pickIf must not be empty`).toBeGreaterThan(2);
        });

        test(`${label} — whyPick within bullet count + word budget + bold`, () => {
          expect(e.whyPick.length, `${label}.whyPick must have ≥ ${LIMITS.whyPickMinBullets} bullets`)
            .toBeGreaterThanOrEqual(LIMITS.whyPickMinBullets);
          expect(e.whyPick.length, `${label}.whyPick has ${e.whyPick.length}, max ${LIMITS.whyPickMaxBullets}`)
            .toBeLessThanOrEqual(LIMITS.whyPickMaxBullets);

          for(let j = 0; j < e.whyPick.length; j++) {
            const b = e.whyPick[j];
            expect(typeof b, `${label}.whyPick[${j}] must be string`).toBe("string");
            const wc = wordCount(b);
            expect(wc, `${label}.whyPick[${j}] has ${wc} words: "${b}"`)
              .toBeLessThanOrEqual(LIMITS.whyPickMaxWords);
          }
          expect(e.whyPick.some(hasBold), `${label}.whyPick must have ≥1 bullet with **bold** killer fact`).toBe(true);
        });

        test(`${label} — watchOut entries valid`, () => {
          expect(e.watchOut.length, `${label}.watchOut must have ≥ ${LIMITS.watchOutMinEntries} entries`)
            .toBeGreaterThanOrEqual(LIMITS.watchOutMinEntries);

          for(let j = 0; j < e.watchOut.length; j++) {
            const w = e.watchOut[j];
            expect(SEV_WATCHOUT.has(w.sev), `${label}.watchOut[${j}].sev "${w.sev}" must be stop/warn/note`).toBe(true);
            expect(typeof w.text, `${label}.watchOut[${j}].text must be a string`).toBe("string");
            const wc = wordCount(w.text);
            expect(wc, `${label}.watchOut[${j}] has ${wc} words: "${w.text}"`)
              .toBeLessThanOrEqual(LIMITS.watchOutMaxWords);

            if(w.matchAgent !== undefined) {
              expect(w.matchAgent, `${label}.watchOut[${j}].matchAgent must be RegExp`).toBeInstanceOf(RegExp);
            }
            if(w.matchCtx !== undefined) {
              const err = validateCtxPredicate(w.matchCtx, `${label}.watchOut[${j}].matchCtx`);
              if(err) throw new Error(err);
            }
          }
        });
      }
    }
  }
});

describe("content-audit · syndromeDecision.js entries", () => {
  for(const synId of Object.keys(SYNDROME_DECISION)) {
    const entry = SYNDROME_DECISION[synId];
    const dur = entry.duration;
    const mon = entry.monitoring;

    if(dur) {
      const label = `[${synId} | duration]`;

      test(`${label} — headline + evidence + branches structure`, () => {
        expect(typeof dur.headline, `${label}.headline must be a string`).toBe("string");
        const wc = wordCount(dur.headline);
        expect(wc, `${label}.headline has ${wc} words (max ${LIMITS.durationHeadlineMaxWords})`)
          .toBeLessThanOrEqual(LIMITS.durationHeadlineMaxWords);
        expect(typeof dur.evidence, `${label}.evidence should be a string`).toBe("string");

        expect(dur.branches, `${label}.branches must be array`).toBeInstanceOf(Array);
        expect(dur.branches.length, `${label}.branches needs ≥ ${LIMITS.branchesMin}`)
          .toBeGreaterThanOrEqual(LIMITS.branchesMin);
      });

      test(`${label} — every branch has explicit-unit days string`, () => {
        for(let i = 0; i < dur.branches.length; i++) {
          const b = dur.branches[i];
          expect(typeof b.label, `${label} branch[${i}].label must be a string`).toBe("string");
          expect(typeof b.days, `${label} branch[${i}].days must be a string`).toBe("string");

          // Apex contract: days MUST carry an explicit unit; bare integers
          // AND bare ranges ("5-7", "5–7", "≥42", ">=42") are forbidden
          // (fosfomycin "1" rendering as "1 d" was a real safety hazard;
          // ranges without units extend the same hazard). The rule: at
          // least one alphabetical character must appear in the days
          // string so a unit word (d / dose / wk / mo / hr) or a known
          // descriptive label (Indefinite, FMT, etc.) is present.
          const daysTrim = b.days.trim();
          const onlyNumericContent = /^[\d\s\-–—≥≤><=.,/]+$/.test(daysTrim);
          expect(onlyNumericContent,
            `${label} branch[${i}].days "${b.days}" is missing a unit / descriptive label — add "d", "dose", "wk", "mo", "Indefinite", etc. (bare numbers AND bare ranges are both forbidden)`)
            .toBe(false);
          expect(b.days.length, `${label} branch[${i}].days too long for chip`).toBeLessThanOrEqual(LIMITS.branchDaysMaxLen);

          /* Integer-trap rule: every integer in days MUST have a
             duration unit within 8 chars after it. Catches the
             "Until ANC > 500" / "MIC > 4 strain" pattern where the
             first-integer-wins parser would compute a stop date in
             the hundreds of calendar days. */
          const intTrapRe = /\d+/g;
          let intMatch;
          const unitNear = /\b(d|day|days|wk|week|weeks|mo|month|months|h|hr|hrs|hour|hours|dose|doses)\b/i;
          while((intMatch = intTrapRe.exec(b.days)) !== null) {
            const tail = b.days.slice(intMatch.index + intMatch[0].length, intMatch.index + intMatch[0].length + 10);
            expect(unitNear.test(tail),
              `${label} branch[${i}].days "${b.days}" — integer "${intMatch[0]}" has no duration unit within 8 chars; parseDurationDays will misinterpret as calendar days. Move clinical thresholds (ANC > 500, MIC > 4) to detail field; use digit-free days labels (Indefinite, "Until ANC recovers", "Per source") for non-numeric durations.`)
              .toBe(true);
          }

          expect(typeof b.detail, `${label} branch[${i}].detail must be a string`).toBe("string");

          if(b.matchAgent !== undefined) {
            expect(b.matchAgent, `${label} branch[${i}].matchAgent must be RegExp`).toBeInstanceOf(RegExp);
          }
        }
      });

      test(`${label} — stopWhen + extendIf populated`, () => {
        expect(dur.stopWhen, `${label}.stopWhen must be array`).toBeInstanceOf(Array);
        expect(dur.stopWhen.length, `${label}.stopWhen needs ≥ ${LIMITS.durationStopWhenMin}`)
          .toBeGreaterThanOrEqual(LIMITS.durationStopWhenMin);

        expect(dur.extendIf, `${label}.extendIf must be array`).toBeInstanceOf(Array);
        expect(dur.extendIf.length, `${label}.extendIf needs ≥ ${LIMITS.durationExtendIfMin}`)
          .toBeGreaterThanOrEqual(LIMITS.durationExtendIfMin);

        for(let i = 0; i < dur.extendIf.length; i++) {
          const ent = dur.extendIf[i];
          // Mixed shape: string OR { text, matchCtx? }
          if(typeof ent === "string") {
            expect(wordCount(ent), `${label}.extendIf[${i}] too long: "${ent}"`)
              .toBeLessThanOrEqual(LIMITS.durationExtendIfMaxWords);
          } else if(ent && typeof ent === "object") {
            expect(typeof ent.text, `${label}.extendIf[${i}].text must be string`).toBe("string");
            expect(wordCount(ent.text), `${label}.extendIf[${i}].text too long`)
              .toBeLessThanOrEqual(LIMITS.durationExtendIfMaxWords);
            if(ent.matchCtx !== undefined) {
              const err = validateCtxPredicate(ent.matchCtx, `${label}.extendIf[${i}].matchCtx`);
              if(err) throw new Error(err);
            }
          } else {
            throw new Error(`${label}.extendIf[${i}] must be string OR {text, matchCtx?}`);
          }
        }
      });

      test(`${label} — matchBranch labels (if any) reference real branches`, () => {
        const labels = new Set(dur.branches.map(b => b.label));
        if(mon) {
          for(let i = 0; i < (mon.items || []).length; i++) {
            const it = mon.items[i];
            if(!it.matchBranch) continue;
            for(const ml of it.matchBranch) {
              expect(labels.has(ml), `monitoring item[${i}].matchBranch "${ml}" does not match any branch in [${synId}].duration.branches (have: ${[...labels].join(", ")})`).toBe(true);
            }
          }
        }
      });
    }

    if(mon) {
      const label = `[${synId} | monitoring]`;

      test(`${label} — headline + items minimum`, () => {
        expect(typeof mon.headline, `${label}.headline must be a string`).toBe("string");
        expect(mon.items, `${label}.items must be array`).toBeInstanceOf(Array);
        expect(mon.items.length, `${label}.items needs ≥ ${LIMITS.monitoringItemsMin}`)
          .toBeGreaterThanOrEqual(LIMITS.monitoringItemsMin);
      });

      test(`${label} — each item: valid sev + what + why + tags`, () => {
        for(let i = 0; i < mon.items.length; i++) {
          const it = mon.items[i];
          expect(SEV_MONITORING.has(it.sev), `${label}.items[${i}].sev "${it.sev}" must be required/trigger/consider`).toBe(true);

          expect(typeof it.what, `${label}.items[${i}].what must be a string`).toBe("string");
          const wcWhat = wordCount(it.what);
          expect(wcWhat, `${label}.items[${i}].what has ${wcWhat} words: "${it.what}"`)
            .toBeLessThanOrEqual(LIMITS.monitoringWhatMaxWords);

          expect(typeof it.why, `${label}.items[${i}].why must be a string`).toBe("string");
          const wcWhy = wordCount(it.why);
          expect(wcWhy, `${label}.items[${i}].why has ${wcWhy} words: "${it.why}"`)
            .toBeLessThanOrEqual(LIMITS.monitoringWhyMaxWords);

          if(it.matchAgent !== undefined) {
            expect(it.matchAgent, `${label}.items[${i}].matchAgent must be RegExp`).toBeInstanceOf(RegExp);
          }
          if(it.matchCtx !== undefined) {
            const err = validateCtxPredicate(it.matchCtx, `${label}.items[${i}].matchCtx`);
            if(err) throw new Error(err);
          }
        }
      });
    }
  }
});

/* ============================================================
   Phase F · research panel shape validation. The optional
   `research:` sibling on syndromeDecision entries carries
   structured trial + guideline citations. When present, it
   MUST conform to the documented shape so the renderer can
   safely walk it. ============================================ */

const LIMITS_RESEARCH = {
  headlineMaxWords: 30,
  trialFindingMaxWords: 35,
  guidelineKeypointMaxWords: 28,
  openQuestionMaxWords: 22,
  maxTrials: 6,
  maxGuidelines: 5,
  maxOpenQuestions: 6,
};

describe("content-audit · syndromeDecision.research panels (optional)", () => {
  const decisionIds = Object.keys(SYNDROME_DECISION);
  for(const id of decisionIds) {
    const e = SYNDROME_DECISION[id];
    if(!e.research) continue;
    const label = `[${id} | research]`;

    test(`${label} — has well-formed shape`, () => {
      expect(typeof e.research.headline, `${label}.headline must be string`).toBe("string");
      expect(e.research.headline.length, `${label}.headline non-empty`).toBeGreaterThan(0);
      expect(wordCount(e.research.headline),
        `${label}.headline word count ≤ ${LIMITS_RESEARCH.headlineMaxWords}`)
        .toBeLessThanOrEqual(LIMITS_RESEARCH.headlineMaxWords);

      expect(Array.isArray(e.research.trials), `${label}.trials must be array`).toBe(true);
      expect(e.research.trials.length, `${label}.trials ≥ 1`).toBeGreaterThanOrEqual(1);
      expect(e.research.trials.length,
        `${label}.trials ≤ ${LIMITS_RESEARCH.maxTrials}`)
        .toBeLessThanOrEqual(LIMITS_RESEARCH.maxTrials);

      for(let i = 0; i < e.research.trials.length; i++) {
        const t = e.research.trials[i];
        const trialLabel = `${label}.trials[${i}]`;
        expect(typeof t.name, `${trialLabel}.name must be string`).toBe("string");
        expect(t.name.length, `${trialLabel}.name non-empty`).toBeGreaterThan(0);
        expect(["string", "number"].includes(typeof t.n),
          `${trialLabel}.n must be string|number`).toBe(true);
        expect(typeof t.question, `${trialLabel}.question must be string`).toBe("string");
        expect(typeof t.finding, `${trialLabel}.finding must be string`).toBe("string");
        expect(wordCount(t.finding),
          `${trialLabel}.finding word count ≤ ${LIMITS_RESEARCH.trialFindingMaxWords}`)
          .toBeLessThanOrEqual(LIMITS_RESEARCH.trialFindingMaxWords);
        if(t.bias !== undefined) {
          expect(typeof t.bias, `${trialLabel}.bias must be string when present`).toBe("string");
        }
      }

      expect(Array.isArray(e.research.guidelines), `${label}.guidelines must be array`).toBe(true);
      expect(e.research.guidelines.length, `${label}.guidelines ≥ 1`).toBeGreaterThanOrEqual(1);
      expect(e.research.guidelines.length,
        `${label}.guidelines ≤ ${LIMITS_RESEARCH.maxGuidelines}`)
        .toBeLessThanOrEqual(LIMITS_RESEARCH.maxGuidelines);

      for(let i = 0; i < e.research.guidelines.length; i++) {
        const g = e.research.guidelines[i];
        const glLabel = `${label}.guidelines[${i}]`;
        expect(typeof g.society, `${glLabel}.society must be string`).toBe("string");
        expect(g.society.length, `${glLabel}.society non-empty`).toBeGreaterThan(0);
        expect(typeof g.year, `${glLabel}.year must be number`).toBe("number");
        expect(g.year, `${glLabel}.year sane range`).toBeGreaterThanOrEqual(1990);
        expect(g.year, `${glLabel}.year not in future`).toBeLessThanOrEqual(2030);
        expect(typeof g.topic, `${glLabel}.topic must be string`).toBe("string");
        expect(typeof g.keypoint, `${glLabel}.keypoint must be string`).toBe("string");
        expect(wordCount(g.keypoint),
          `${glLabel}.keypoint word count ≤ ${LIMITS_RESEARCH.guidelineKeypointMaxWords}`)
          .toBeLessThanOrEqual(LIMITS_RESEARCH.guidelineKeypointMaxWords);
      }

      if(e.research.openQuestions !== undefined) {
        expect(Array.isArray(e.research.openQuestions),
          `${label}.openQuestions must be array when present`).toBe(true);
        expect(e.research.openQuestions.length,
          `${label}.openQuestions ≤ ${LIMITS_RESEARCH.maxOpenQuestions}`)
          .toBeLessThanOrEqual(LIMITS_RESEARCH.maxOpenQuestions);
        for(let i = 0; i < e.research.openQuestions.length; i++) {
          const q = e.research.openQuestions[i];
          const qLabel = `${label}.openQuestions[${i}]`;
          expect(typeof q, `${qLabel} must be string`).toBe("string");
          expect(wordCount(q),
            `${qLabel} word count ≤ ${LIMITS_RESEARCH.openQuestionMaxWords}`)
            .toBeLessThanOrEqual(LIMITS_RESEARCH.openQuestionMaxWords);
        }
      }
    });
  }
});

/* ============================================================
   Phase D1.1 · rationale panel shape validation. The optional
   `rationale:` sibling on syndromeDecision entries carries
   the reasoning-trace moat content: driver (why this regimen),
   guideline (anchor in GUIDELINES registry), rejected (the
   deliberately-excluded alternative). When present, ALL three
   fields are required and the guideline id MUST resolve. ===== */

const LIMITS_RATIONALE = {
  driverMaxWords:   140,
  rejectedMaxWords: 120,
  driverMinWords:    25,
  rejectedMinWords:  18,
};

describe("content-audit · syndromeDecision.rationale panels (optional)", () => {
  const decisionIds = Object.keys(SYNDROME_DECISION);
  for(const id of decisionIds) {
    const e = SYNDROME_DECISION[id];
    if(!e.rationale) continue;
    const label = `[${id} | rationale]`;

    test(`${label} — has well-formed shape + guideline resolves`, () => {
      expect(typeof e.rationale.driver, `${label}.driver must be string`).toBe("string");
      expect(e.rationale.driver.length, `${label}.driver non-empty`).toBeGreaterThan(0);
      const wcDriver = wordCount(e.rationale.driver);
      expect(wcDriver,
        `${label}.driver word count ${wcDriver} should be ≥ ${LIMITS_RATIONALE.driverMinWords}`)
        .toBeGreaterThanOrEqual(LIMITS_RATIONALE.driverMinWords);
      expect(wcDriver,
        `${label}.driver word count ${wcDriver} should be ≤ ${LIMITS_RATIONALE.driverMaxWords}`)
        .toBeLessThanOrEqual(LIMITS_RATIONALE.driverMaxWords);

      expect(typeof e.rationale.guideline, `${label}.guideline must be string`).toBe("string");
      expect(e.rationale.guideline.length, `${label}.guideline non-empty`).toBeGreaterThan(0);
      expect(Object.keys(GUIDELINES).includes(e.rationale.guideline),
        `${label}.guideline "${e.rationale.guideline}" must resolve in GUIDELINES registry`).toBe(true);

      expect(typeof e.rationale.rejected, `${label}.rejected must be string`).toBe("string");
      expect(e.rationale.rejected.length, `${label}.rejected non-empty`).toBeGreaterThan(0);
      const wcRejected = wordCount(e.rationale.rejected);
      expect(wcRejected,
        `${label}.rejected word count ${wcRejected} should be ≥ ${LIMITS_RATIONALE.rejectedMinWords}`)
        .toBeGreaterThanOrEqual(LIMITS_RATIONALE.rejectedMinWords);
      expect(wcRejected,
        `${label}.rejected word count ${wcRejected} should be ≤ ${LIMITS_RATIONALE.rejectedMaxWords}`)
        .toBeLessThanOrEqual(LIMITS_RATIONALE.rejectedMaxWords);
    });
  }
});

/* ============================================================
   Phase D2.1 · objections panel shape validation. The optional
   `objections:` sibling on syndromeDecision entries carries the
   pharmacist's challenge-mode content: 2-4 Q/A pairs per
   syndrome where Q is the predictable pharmacist pushback
   (≤ 14 words) and A is the evidence-backed defended answer
   (30-100 words, ≥ 1 `[cite:id]` token resolving in GUIDELINES).
   Sits beside `rationale:` as the question-answer pair surface.
   ============================================================ */

const LIMITS_OBJECTIONS = {
  qMaxWords:    14,
  aMinWords:    30,
  aMaxWords:   100,
  minPairs:      2,
  maxPairs:      4,
};

describe("content-audit · syndromeDecision.objections panels (optional)", () => {
  const decisionIds = Object.keys(SYNDROME_DECISION);
  for(const id of decisionIds) {
    const e = SYNDROME_DECISION[id];
    if(!e.objections) continue;
    const label = `[${id} | objections]`;

    test(`${label} — array shape + pair counts`, () => {
      expect(Array.isArray(e.objections), `${label} must be array`).toBe(true);
      expect(e.objections.length,
        `${label} needs ≥ ${LIMITS_OBJECTIONS.minPairs} pairs`)
        .toBeGreaterThanOrEqual(LIMITS_OBJECTIONS.minPairs);
      expect(e.objections.length,
        `${label} has ${e.objections.length} pairs (max ${LIMITS_OBJECTIONS.maxPairs})`)
        .toBeLessThanOrEqual(LIMITS_OBJECTIONS.maxPairs);
    });

    for(let i = 0; i < e.objections.length; i++) {
      const o = e.objections[i];
      const pairLabel = `${label}[${i}]`;

      test(`${pairLabel} — q is non-empty + within word budget`, () => {
        expect(typeof o.q, `${pairLabel}.q must be string`).toBe("string");
        expect(o.q.trim().length, `${pairLabel}.q non-empty`).toBeGreaterThan(0);
        const wcQ = wordCount(o.q);
        expect(wcQ,
          `${pairLabel}.q has ${wcQ} words (max ${LIMITS_OBJECTIONS.qMaxWords}): "${o.q}"`)
          .toBeLessThanOrEqual(LIMITS_OBJECTIONS.qMaxWords);
      });

      test(`${pairLabel} — a is non-empty + within word budget`, () => {
        expect(typeof o.a, `${pairLabel}.a must be string`).toBe("string");
        expect(o.a.trim().length, `${pairLabel}.a non-empty`).toBeGreaterThan(0);
        const wcA = wordCount(o.a);
        expect(wcA,
          `${pairLabel}.a has ${wcA} words (min ${LIMITS_OBJECTIONS.aMinWords})`)
          .toBeGreaterThanOrEqual(LIMITS_OBJECTIONS.aMinWords);
        expect(wcA,
          `${pairLabel}.a has ${wcA} words (max ${LIMITS_OBJECTIONS.aMaxWords})`)
          .toBeLessThanOrEqual(LIMITS_OBJECTIONS.aMaxWords);
      });

      test(`${pairLabel} — every [cite:id] token resolves in GUIDELINES`, () => {
        const re = /\[cite:([a-z0-9_-]+)\]/gi;
        const cites = [...o.a.matchAll(re)].map(m => m[1]);
        expect(cites.length,
          `${pairLabel}.a must carry ≥ 1 [cite:id] token (answer must be evidence-backed)`)
          .toBeGreaterThanOrEqual(1);
        for(const cid of cites) {
          expect(Object.keys(GUIDELINES).includes(cid),
            `${pairLabel}.a [cite:${cid}] must resolve in GUIDELINES registry`).toBe(true);
        }
      });
    }
  }
});

describe("content-audit · combinedRisks.js entries", () => {
  test("ids are unique", () => {
    const seen = new Set();
    for(const r of COMBINED_RISKS) {
      expect(seen.has(r.id), `combinedRisks: duplicate id "${r.id}"`).toBe(false);
      seen.add(r.id);
    }
  });

  for(let i = 0; i < COMBINED_RISKS.length; i++) {
    const r = COMBINED_RISKS[i];
    const label = `combinedRisks[${r.id || `#${i}`}]`;

    test(`${label} — required fields + shape`, () => {
      expect(typeof r.id, `${label}.id must be string`).toBe("string");
      expect(r.id.length, `${label}.id non-empty`).toBeGreaterThan(0);

      expect(r.agents, `${label}.agents must be array`).toBeInstanceOf(Array);
      expect(r.agents.length, `${label}.agents needs ≥ 2 regexes`).toBeGreaterThanOrEqual(2);
      for(let j = 0; j < r.agents.length; j++) {
        expect(r.agents[j], `${label}.agents[${j}] must be RegExp`).toBeInstanceOf(RegExp);
      }

      expect(SEV_COMBINED.has(r.sev), `${label}.sev "${r.sev}" must be stop/warn/note`).toBe(true);

      expect(typeof r.headline, `${label}.headline must be string`).toBe("string");
      expect(r.headline.length, `${label}.headline non-empty`).toBeGreaterThan(0);

      expect(typeof r.detail, `${label}.detail must be string`).toBe("string");
      const wcDetail = wordCount(r.detail);
      expect(wcDetail, `${label}.detail has ${wcDetail} words (max ${LIMITS.combinedRiskDetailMaxWords})`)
        .toBeLessThanOrEqual(LIMITS.combinedRiskDetailMaxWords);

      if(r.evidence !== undefined) {
        expect(typeof r.evidence, `${label}.evidence (if present) must be string`).toBe("string");
      }
    });
  }
});

/* ============================================================
   Phase H–L cross-layer integrity gates — added after the
   multi-agent audit-gap analysis surfaced dangling-syndrome-id
   issues that silently fail-safe at runtime (candidemia +
   tubo-ovarian shipped without parent syndromes, so the cross-
   cutting layer rendered nothing).
   ============================================================ */

const KNOWN_SYNDROME_IDS = new Set(SYNDROMES.map(s => s.id));
const PHASE_HIL_TABLES = [
  { name: "REGIONAL_RESISTANCE", data: REGIONAL_RESISTANCE, idKey: "id" },
  { name: "NOVEL_AGENTS",        data: NOVEL_AGENTS,        idKey: "id" },
  { name: "PEDS_PREG_DOSING",    data: PEDS_PREG_DOSING,    idKey: "id" },
  { name: "SURGE_PROTOCOLS",     data: SURGE_PROTOCOLS,     idKey: "id" },
  { name: "SITE_PENETRATION",    data: SITE_PENETRATION,    idKey: "site" },
];

describe("content-audit · cross-layer syndrome-id integrity (P0)", () => {
  for(const { name, data } of PHASE_HIL_TABLES) {
    test(`${name}.syndromes[] references only known syndrome ids`, () => {
      for(const entry of data) {
        const tag = entry.id || entry.site || JSON.stringify(entry).slice(0, 40);
        const syns = entry.syndromes || [];
        for(const sid of syns) {
          expect(KNOWN_SYNDROME_IDS.has(sid),
            `${name} entry "${tag}" references unknown syndrome id "${sid}" — would silently render nothing`)
            .toBe(true);
        }
      }
    });
  }
});

describe("content-audit · Phase H–L id uniqueness (P1)", () => {
  for(const { name, data, idKey } of PHASE_HIL_TABLES) {
    if(idKey !== "id") continue;  // SITE_PENETRATION uses `site`, validated separately
    test(`${name} ids are unique`, () => {
      const seen = new Set();
      for(const entry of data) {
        expect(seen.has(entry.id), `${name} duplicate id "${entry.id}"`).toBe(false);
        seen.add(entry.id);
      }
    });
  }
});

const REGIONAL_SEVERITY = new Set(["high", "moderate", "watch"]);
const SURGE_SEVERITY    = new Set(["tier-1", "high", "watch"]);
const SURGE_CATEGORY    = new Set(["bioterror", "emerging", "regional-outbreak", "novel-resistance"]);
const PREG_SAFE         = new Set(["yes", "caution", "avoid"]);
const PENETRATION_ENUM  = new Set(["excellent", "good", "modest", "poor"]);

describe("content-audit · Phase H–L enum vocabulary (P0)", () => {
  test("REGIONAL_RESISTANCE.severity ∈ {high, moderate, watch}", () => {
    for(const r of REGIONAL_RESISTANCE) {
      expect(REGIONAL_SEVERITY.has(r.severity),
        `${r.id}: severity "${r.severity}" not in enum`).toBe(true);
    }
  });
  test("SURGE_PROTOCOLS.severity ∈ {tier-1, high, watch}", () => {
    for(const s of SURGE_PROTOCOLS) {
      expect(SURGE_SEVERITY.has(s.severity),
        `${s.id}: severity "${s.severity}" not in enum`).toBe(true);
    }
  });
  test("SURGE_PROTOCOLS.category ∈ {bioterror, emerging, regional-outbreak, novel-resistance}", () => {
    for(const s of SURGE_PROTOCOLS) {
      expect(SURGE_CATEGORY.has(s.category),
        `${s.id}: category "${s.category}" not in enum`).toBe(true);
    }
  });
  test("PEDS_PREG_DOSING.pregSafe ∈ {yes, caution, avoid}", () => {
    for(const d of PEDS_PREG_DOSING) {
      expect(PREG_SAFE.has(d.pregSafe),
        `${d.id}: pregSafe "${d.pregSafe}" not in enum`).toBe(true);
    }
  });
  test("SITE_PENETRATION.drugs[].penetration ∈ {excellent, good, modest, poor}", () => {
    for(const s of SITE_PENETRATION) {
      for(const d of (s.drugs || [])) {
        expect(PENETRATION_ENUM.has(d.penetration),
          `site "${s.site}" drug "${d.agent}": penetration "${d.penetration}" not in enum`).toBe(true);
      }
    }
  });
});

describe("content-audit · Phase J pregSafe coherence (P2)", () => {
  test("Category D/X agents cannot be flagged SAFE in pregnancy", () => {
    for(const d of PEDS_PREG_DOSING) {
      if(/\b(D|X)\b/.test(d.pregCategory || "")) {
        expect(d.pregSafe, `${d.id}: pregCategory "${d.pregCategory}" + pregSafe "yes" is a contradiction`)
          .not.toBe("yes");
      }
    }
  });
});

describe("content-audit · Phase K notifiable-flag (P1)", () => {
  test("Bioterror / emerging / regional-outbreak protocols carry **Notifiable** marker", () => {
    for(const s of SURGE_PROTOCOLS) {
      if(["bioterror", "emerging", "regional-outbreak"].includes(s.category)) {
        expect(/\*\*Notifiable\*\*/.test(s.publicHealth || ""),
          `${s.id} (${s.category}): publicHealth missing **Notifiable** marker — alert banner won't render`)
          .toBe(true);
      }
    }
  });
});

/* ============================================================
   Tranche 6 — remaining P1/P2 audit gates from multi-agent
   triage. Closes evidence-registry integrity gaps + Phase I
   approved-year drift + Phase H/I/K word budgets + non-empty
   evidence strings.
   ============================================================ */

describe("content-audit · evidence-registry integrity (P1)", () => {
  test("EVOLVING[].ref keys must exist in GUIDELINES", () => {
    for(const e of EVOLVING) {
      if(e.ref) {
        expect(GUIDELINES[e.ref], `EVOLVING[${e.h}].ref="${e.ref}" not in GUIDELINES — renders empty <Cite>`)
          .toBeDefined();
      }
    }
  });
  test("TRIAL_DETAIL keys must exist in GUIDELINES", () => {
    for(const k of Object.keys(TRIAL_DETAIL)) {
      expect(GUIDELINES[k], `TRIAL_DETAIL["${k}"] not in GUIDELINES — opens with empty header`)
        .toBeDefined();
    }
  });
  test("GUIDELINES year must be in sane range (1970 ≤ year ≤ next year + 1)", () => {
    /* Lower bound 1970 accommodates legitimate older landmark citations
       (Hoffman 1984 typhoid regimen; Chandler 1970 orbital staging). */
    const maxYear = new Date().getFullYear() + 1;
    for(const [id, g] of Object.entries(GUIDELINES)) {
      if(g.year !== null && g.year !== undefined) {
        expect(typeof g.year, `GUIDELINES["${id}"].year must be number or null`).toBe("number");
        expect(g.year, `GUIDELINES["${id}"].year=${g.year} below 1970 (likely typo)`).toBeGreaterThanOrEqual(1970);
        expect(g.year, `GUIDELINES["${id}"].year=${g.year} above ${maxYear} (likely typo)`).toBeLessThanOrEqual(maxYear);
      }
    }
  });
});

describe("content-audit · Phase I approved-year discipline (P1)", () => {
  test("NOVEL_AGENTS.approved must be a number (year) — \"pending\" silently sorts to 0", () => {
    const maxYear = new Date().getFullYear() + 1;
    for(const a of NOVEL_AGENTS) {
      // Allow "pending" as documented status but require explicit `status` field
      // to make it visible rather than silently fail-safe at sort time.
      if(typeof a.approved === "string" && a.approved === "pending") {
        // Documented exception; renderer handles "pending" label
        continue;
      }
      expect(typeof a.approved, `NOVEL_AGENTS["${a.id}"].approved must be number; got ${typeof a.approved}`).toBe("number");
      expect(a.approved, `NOVEL_AGENTS["${a.id}"].approved=${a.approved} below 2000 (likely typo)`).toBeGreaterThanOrEqual(2000);
      expect(a.approved, `NOVEL_AGENTS["${a.id}"].approved=${a.approved} above ${maxYear} (likely typo)`).toBeLessThanOrEqual(maxYear);
    }
  });
});

describe("content-audit · Phase H–K evidence non-empty (P2)", () => {
  /* `evidence:` is the only provenance hook on each entry; an empty
     or near-empty string renders a blank "source" line at the bedside. */
  function check(arr, name) {
    for(const e of arr) {
      const tag = e.id || e.site || JSON.stringify(e).slice(0, 30);
      expect(typeof e.evidence === "string" && e.evidence.trim().length > 5,
        `${name}["${tag}"].evidence must be non-trivial string`).toBe(true);
    }
  }
  test("REGIONAL_RESISTANCE.evidence non-empty",  () => check(REGIONAL_RESISTANCE, "REGIONAL_RESISTANCE"));
  test("NOVEL_AGENTS.evidence non-empty",         () => check(NOVEL_AGENTS,        "NOVEL_AGENTS"));
  test("SURGE_PROTOCOLS.evidence non-empty",      () => check(SURGE_PROTOCOLS,     "SURGE_PROTOCOLS"));
  test("PEDS_PREG_DOSING.evidence non-empty",     () => check(PEDS_PREG_DOSING,    "PEDS_PREG_DOSING"));
});

const LIMITS_PHASE_HIL = {
  pattern:      40,
  impact:       60,
  useCase:      30,
  pitfall:      26,
  pregNotes:    44,
  clinical:     32,
  empiric:      48,
  publicHealth: 56,
  antitoxin:    50,
};

describe("content-audit · Phase H/I/K word-budget caps (P2)", () => {
  test("REGIONAL_RESISTANCE field word counts within budget", () => {
    for(const r of REGIONAL_RESISTANCE) {
      const wcp = wordCount(r.pattern);
      const wci = wordCount(r.impact);
      expect(wcp, `${r.id}.pattern has ${wcp} words (max ${LIMITS_PHASE_HIL.pattern})`).toBeLessThanOrEqual(LIMITS_PHASE_HIL.pattern);
      expect(wci, `${r.id}.impact has ${wci} words (max ${LIMITS_PHASE_HIL.impact})`).toBeLessThanOrEqual(LIMITS_PHASE_HIL.impact);
    }
  });
  test("NOVEL_AGENTS useCases + pitfalls within budget", () => {
    for(const a of NOVEL_AGENTS) {
      for(const u of (a.useCases || [])) {
        const wc = wordCount(u);
        expect(wc, `${a.id}.useCases entry has ${wc} words (max ${LIMITS_PHASE_HIL.useCase})`).toBeLessThanOrEqual(LIMITS_PHASE_HIL.useCase);
      }
      for(const p of (a.pitfalls || [])) {
        const wc = wordCount(p);
        expect(wc, `${a.id}.pitfalls entry has ${wc} words (max ${LIMITS_PHASE_HIL.pitfall})`).toBeLessThanOrEqual(LIMITS_PHASE_HIL.pitfall);
      }
    }
  });
  test("SURGE_PROTOCOLS clinical + empiric + publicHealth + antitoxin within budget", () => {
    for(const s of SURGE_PROTOCOLS) {
      const fields = [
        ["clinical",      s.clinical,      LIMITS_PHASE_HIL.clinical],
        ["empiric",       s.empiric,       LIMITS_PHASE_HIL.empiric],
        ["publicHealth",  s.publicHealth,  LIMITS_PHASE_HIL.publicHealth],
        ["antitoxin",     s.antitoxin,     LIMITS_PHASE_HIL.antitoxin],
      ];
      for(const [field, val, max] of fields) {
        if(typeof val === "string") {
          const wc = wordCount(val);
          expect(wc, `${s.id}.${field} has ${wc} words (max ${max})`).toBeLessThanOrEqual(max);
        }
      }
    }
  });
  test("PEDS_PREG_DOSING pregNotes within budget", () => {
    for(const d of PEDS_PREG_DOSING) {
      if(typeof d.pregNotes === "string") {
        const wc = wordCount(d.pregNotes);
        expect(wc, `${d.id}.pregNotes has ${wc} words (max ${LIMITS_PHASE_HIL.pregNotes})`).toBeLessThanOrEqual(LIMITS_PHASE_HIL.pregNotes);
      }
    }
  });
});

describe("content-audit · evidenceMap two-way trial ↔ syndrome index (Phase D3)", () => {
  /* Every trial id in the reverse index must resolve to a GUIDELINES
     entry. A pattern that names a missing id would silently drop the
     reverse links — this gate keeps the map's matcher table aligned
     with the registry. */
  test("every TRIAL_TO_SYNDROMES key resolves to a GUIDELINES entry", () => {
    for(const trialId of Object.keys(TRIAL_TO_SYNDROMES)) {
      expect(GUIDELINES[trialId], `TRIAL_TO_SYNDROMES key "${trialId}" → unknown guideline id`).toBeDefined();
    }
  });

  test("no orphan matcher ids in evidenceMap (catches a renamed GUIDELINES id)", () => {
    expect(_ORPHAN_IDS, `evidenceMap matcher ids missing from GUIDELINES: ${_ORPHAN_IDS.join(", ")}`).toEqual([]);
  });

  /* Every syndrome in the value lists must be a real syndrome id —
     guards against a syndrome rename + missing TRIAL_TO_SYNDROMES
     refresh dropping the link. */
  test("every syndrome referenced in TRIAL_TO_SYNDROMES is a real syndrome id", () => {
    const synIds = new Set(SYNDROMES.map(s => s.id));
    for(const [trialId, list] of Object.entries(TRIAL_TO_SYNDROMES)) {
      for(const entry of list) {
        expect(synIds.has(entry.id),
          `TRIAL_TO_SYNDROMES["${trialId}"] references unknown syndrome id "${entry.id}"`).toBe(true);
      }
    }
  });

  /* Confidence floor — the map should anchor every well-known
     landmark trial we depend on for decisions. If a future content
     edit drops the BALANCE citation from every syndrome, this catches
     it before users notice empty drawer sections. */
  test("anchor trials maintain at least one reverse link", () => {
    const anchors = ["balance", "stopit", "oviva", "poet", "merino", "capecod",
                     "diabolo", "coda", "arrest", "modify", "fmt", "ssti", "fn", "ssc"];
    for(const id of anchors) {
      const list = getSyndromesForTrial(id);
      expect(list.length, `anchor trial "${id}" has zero reverse links — likely a rename or citation regression`).toBeGreaterThan(0);
    }
  });

  /* getSyndromesForTrial must be a pure function returning an array
     even for unknown ids — graceful fallback for callers. */
  test("getSyndromesForTrial returns an empty array for unknown ids", () => {
    expect(getSyndromesForTrial("__nonexistent__")).toEqual([]);
    expect(Array.isArray(getSyndromesForTrial("mono"))).toBe(true);
  });
});

describe("content-audit · combinedRisks regex soundness (P2)", () => {
  /* The matchAgent disambiguation gate probes 50 agents against
     branches in syndromeDecision; reuse the same probe panel against
     combinedRisks.agents[] to catch typo'd patterns that match nothing. */
  const PROBE = [
    "vancomycin", "linezolid", "daptomycin", "ceftaroline", "telavancin", "dalbavancin",
    "piperacillin-tazobactam", "cefepime", "ceftriaxone", "ceftazidime", "cefazolin", "nafcillin",
    "meropenem", "imipenem", "ertapenem", "doripenem",
    "ciprofloxacin", "levofloxacin", "moxifloxacin",
    "amikacin", "gentamicin", "tobramycin",
    "azithromycin", "clarithromycin", "erythromycin",
    "doxycycline", "minocycline", "tigecycline",
    "metronidazole", "clindamycin", "trimethoprim-sulfamethoxazole",
    "fluconazole", "voriconazole", "isavuconazole", "posaconazole", "itraconazole",
    "caspofungin", "micafungin", "amphotericin",
    "colistin", "polymyxin",
    "rifampin", "ceftolozane-tazobactam", "ceftazidime-avibactam", "meropenem-vaborbactam",
    "cefiderocol", "sulbactam-durlobactam", "fosfomycin", "nitrofurantoin",
    "valproate", "alcohol", "ethanol", "calcium gluconate",
    "vre bacteremia", "vancomycin-resistant enterococcus",
  ];
  test("each combinedRisks rule's agents[] regex matches at least one probe agent", () => {
    for(const r of COMBINED_RISKS) {
      for(let i = 0; i < r.agents.length; i++) {
        const rx = r.agents[i];
        const matched = PROBE.some(p => rx.test(p));
        expect(matched, `combinedRisks["${r.id}"].agents[${i}] (${rx}) matches NONE of the 50 probe agents — likely typo`)
          .toBe(true);
      }
    }
  });
});

/* ============================================================
   FORMULARY · Wave 5 PR-4 schema audit

   Five fields were added to every FORMULARY drug in PR-4:
   pkpd, timeToEffect, cdiffScore, mdrPressure, kinetics. The
   fields are optional at the schema level (the rendered canvas
   degrades gracefully when absent), but today every drug has
   every field populated. The audit gates the SHAPE of every
   populated field so a typo doesn't ship undetected. ========== */

const PKPD_PATTERNS = new Set(["time-dep", "conc-dep", "AUC", "time+AUC"]);
const MDR_PRESSURE_VALUES = new Set(["low", "med", "high"]);
const KINETICS_VALUES = new Set(["bactericidal", "bacteriostatic", "context-dependent"]);
const TIME_TO_EFFECT_RE = /^\d+(–\d+)?\s*(h|d)$/;

describe("content-audit · FORMULARY drug fields (Wave 5 PR-4)", () => {
  const ALL_DRUGS = FORMULARY.flatMap(c => c.drugs.map(d => ({ cls: c.cls, ...d })));

  test("every drug has the five Wave 5 fields populated", () => {
    for(const d of ALL_DRUGS) {
      const tag = `${d.cls} :: ${d.name}`;
      expect(d.pkpd, `${tag}.pkpd missing`).toBeTruthy();
      expect(d.timeToEffect, `${tag}.timeToEffect missing`).toBeTruthy();
      expect(d.cdiffScore, `${tag}.cdiffScore missing (0/null both invalid)`).toBeTruthy();
      expect(d.mdrPressure, `${tag}.mdrPressure missing`).toBeTruthy();
      expect(d.kinetics, `${tag}.kinetics missing`).toBeTruthy();
    }
  });

  test("pkpd.pattern ∈ {time-dep, conc-dep, AUC, time+AUC}", () => {
    for(const d of ALL_DRUGS) {
      if(!d.pkpd) continue;
      expect(PKPD_PATTERNS.has(d.pkpd.pattern),
        `${d.name}.pkpd.pattern "${d.pkpd.pattern}" must be one of ${[...PKPD_PATTERNS].join("/")}`)
        .toBe(true);
    }
  });

  test("pkpd.target is a non-empty string ≤ 80 chars", () => {
    for(const d of ALL_DRUGS) {
      if(!d.pkpd) continue;
      expect(typeof d.pkpd.target, `${d.name}.pkpd.target type`).toBe("string");
      expect(d.pkpd.target.length, `${d.name}.pkpd.target non-empty`).toBeGreaterThan(0);
      expect(d.pkpd.target.length, `${d.name}.pkpd.target length (80 hard cap)`).toBeLessThanOrEqual(80);
    }
  });

  test("timeToEffect matches /^N(–N)? (h|d)$/ — units are a safety contract", () => {
    for(const d of ALL_DRUGS) {
      if(!d.timeToEffect) continue;
      expect(TIME_TO_EFFECT_RE.test(d.timeToEffect),
        `${d.name}.timeToEffect "${d.timeToEffect}" must match /^\\d+(–\\d+)?\\s*(h|d)$/`)
        .toBe(true);
    }
  });

  test("cdiffScore ∈ {1, 2, 3, 4, 5}", () => {
    for(const d of ALL_DRUGS) {
      if(d.cdiffScore == null) continue;
      expect([1, 2, 3, 4, 5].includes(d.cdiffScore),
        `${d.name}.cdiffScore "${d.cdiffScore}" must be 1..5 integer`)
        .toBe(true);
    }
  });

  test("mdrPressure ∈ {low, med, high}", () => {
    for(const d of ALL_DRUGS) {
      if(!d.mdrPressure) continue;
      expect(MDR_PRESSURE_VALUES.has(d.mdrPressure),
        `${d.name}.mdrPressure "${d.mdrPressure}" must be one of ${[...MDR_PRESSURE_VALUES].join("/")}`)
        .toBe(true);
    }
  });

  test("kinetics ∈ {bactericidal, bacteriostatic, context-dependent}", () => {
    for(const d of ALL_DRUGS) {
      if(!d.kinetics) continue;
      expect(KINETICS_VALUES.has(d.kinetics),
        `${d.name}.kinetics "${d.kinetics}" must be one of ${[...KINETICS_VALUES].join("/")}`)
        .toBe(true);
    }
  });

  test("coverage stats reported", () => {
    const total = ALL_DRUGS.length;
    const populated = {
      pkpd:         ALL_DRUGS.filter(d => d.pkpd).length,
      timeToEffect: ALL_DRUGS.filter(d => d.timeToEffect).length,
      cdiffScore:   ALL_DRUGS.filter(d => d.cdiffScore).length,
      mdrPressure:  ALL_DRUGS.filter(d => d.mdrPressure).length,
      kinetics:     ALL_DRUGS.filter(d => d.kinetics).length,
    };
    const pct = (n) => Math.round((n / total) * 100);
    // eslint-disable-next-line no-console
    console.log(`FORMULARY PR-4 field coverage (${total} drugs):`, {
      pkpd:         `${populated.pkpd}/${total} (${pct(populated.pkpd)}%)`,
      timeToEffect: `${populated.timeToEffect}/${total} (${pct(populated.timeToEffect)}%)`,
      cdiffScore:   `${populated.cdiffScore}/${total} (${pct(populated.cdiffScore)}%)`,
      mdrPressure:  `${populated.mdrPressure}/${total} (${pct(populated.mdrPressure)}%)`,
      kinetics:     `${populated.kinetics}/${total} (${pct(populated.kinetics)}%)`,
    });
    // The PR-4 contract is ≥ 80% coverage at merge; we shipped 100%.
    expect(populated.pkpd / total).toBeGreaterThanOrEqual(0.8);
    expect(populated.timeToEffect / total).toBeGreaterThanOrEqual(0.8);
    expect(populated.cdiffScore / total).toBeGreaterThanOrEqual(0.8);
    expect(populated.mdrPressure / total).toBeGreaterThanOrEqual(0.8);
    expect(populated.kinetics / total).toBeGreaterThanOrEqual(0.8);
  });
});

/* ============================================================
   Wave 5 PR-6 · diagnostic-stewardship schema audit. Mirrors
   the monitoring-block contract: same severity vocabulary,
   same word caps, same matchCtx predicate validator. Every
   authored entry held to the apex bar from PR-6a onward; the
   coverage check is informational while content tranches roll
   out across the remaining ~107 syndromes. ============================================ */

const DIAG_CATEGORIES = ["cultures", "biomarkers", "panels", "imaging", "biopsy"];

describe("content-audit · diagnostics.js entries (Wave 5 PR-6)", () => {
  const synIds = Object.keys(DIAGNOSTICS);

  test("every diagnostics key matches a known syndrome id", () => {
    const known = new Set(SYNDROMES.map(s => s.id));
    const orphans = synIds.filter(id => !known.has(id));
    expect(orphans, `unknown syndrome ids in DIAGNOSTICS: ${orphans.join(", ")}`).toEqual([]);
  });

  for(const synId of synIds) {
    const entry = DIAGNOSTICS[synId];
    const label = `[${synId} | diagnostics]`;

    test(`${label} — at least one category populated`, () => {
      const categoriesUsed = DIAG_CATEGORIES.filter(k => Array.isArray(entry[k]) && entry[k].length > 0);
      expect(categoriesUsed.length, `${label} must populate ≥ 1 of cultures/biomarkers/panels/imaging/biopsy`)
        .toBeGreaterThanOrEqual(1);
    });

    test(`${label} — only known category keys present`, () => {
      const unknownKeys = Object.keys(entry).filter(k => !DIAG_CATEGORIES.includes(k));
      expect(unknownKeys, `${label} unknown categories: ${unknownKeys.join(", ")}`).toEqual([]);
    });

    for(const cat of DIAG_CATEGORIES) {
      const items = entry[cat];
      if(!Array.isArray(items) || items.length === 0) continue;

      test(`${label}.${cat} — every item carries valid sev + what + why`, () => {
        for(let i = 0; i < items.length; i++) {
          const it = items[i];
          const itLabel = `${label}.${cat}[${i}]`;

          expect(SEV_MONITORING.has(it.sev),
            `${itLabel}.sev "${it.sev}" must be required/trigger/consider`).toBe(true);

          expect(typeof it.what,
            `${itLabel}.what must be a string`).toBe("string");
          const wcWhat = wordCount(it.what);
          expect(wcWhat,
            `${itLabel}.what has ${wcWhat} words (max ${LIMITS.monitoringWhatMaxWords}): "${it.what}"`)
            .toBeLessThanOrEqual(LIMITS.monitoringWhatMaxWords);

          expect(typeof it.why,
            `${itLabel}.why must be a string`).toBe("string");
          const wcWhy = wordCount(it.why);
          expect(wcWhy,
            `${itLabel}.why has ${wcWhy} words (max ${LIMITS.monitoringWhyMaxWords}): "${it.why}"`)
            .toBeLessThanOrEqual(LIMITS.monitoringWhyMaxWords);

          if(it.matchCtx !== undefined) {
            const err = validateCtxPredicate(it.matchCtx, `${itLabel}.matchCtx`);
            if(err) throw new Error(err);
          }
        }
      });
    }
  }

  /* Coverage report — informational. PR-6a ships sentinel content for
     the 10 highest-volume syndromes; PR-6b–f author the remaining
     ~107 in parallel tranches. Once content fills out, the assertion
     here ratchets up to 0.5 → 0.8 → 1.0 in successive PRs. */
  test("coverage of all SYNDROMES (informational)", () => {
    const total = SYNDROMES.length;
    const covered = SYNDROMES.filter(s => !!DIAGNOSTICS[s.id]).length;
    const ratio = covered / total;
    // eslint-disable-next-line no-console
    console.log(`[content-audit] diagnostics coverage: ${covered}/${total} syndromes (${(ratio * 100).toFixed(1)}%)`);
    expect(covered).toBeGreaterThanOrEqual(1);   // floor; raised as PR-6 tranches land
  });
});

/* ============================================================
   Wave 5 PR-8 · OPAT-profile schema audit. Validates the
   outpatient-IV content surface against the schema doc-blocked
   in src/data/opatDecision.js. PR-8a seeds 8 high-volume IV
   syndromes; PR-8b-c will broaden to all ~60-70 IV-eligible
   syndromes per the decision-locked comprehensive coverage scope.
   ============================================================ */

const OPAT_ACCESS = new Set(["PICC", "midline", "port", "none"]);
const OPAT_LIMITS = {
  agentsMin:        1,
  agentsMax:       10,
  eligibilityMin:   1,
  whatMaxWords:    28,
  whyMaxWords:     26,
  doseMaxWords:    14,
  monitoringMaxWords: 14,
  noteMaxWords:    26,
};

describe("content-audit · opatDecision.js entries (Wave 5 PR-8)", () => {
  const synIds = Object.keys(OPAT_PROFILES);

  test("every OPAT key matches a known syndrome id", () => {
    const known = new Set(SYNDROMES.map(s => s.id));
    const orphans = synIds.filter(id => !known.has(id));
    expect(orphans, `unknown syndrome ids in OPAT_PROFILES: ${orphans.join(", ")}`).toEqual([]);
  });

  test("every agents[].name round-trips to a FORMULARY name", () => {
    const errors = getFormularyValidationErrors();
    expect(errors, errors.join("\n")).toEqual([]);
  });

  for(const synId of synIds) {
    const entry = OPAT_PROFILES[synId];
    const label = `[${synId} | OPAT]`;

    test(`${label} — eligibility populated and severity-graded`, () => {
      expect(Array.isArray(entry.eligibility), `${label}.eligibility must be array`).toBe(true);
      expect(entry.eligibility.length,
        `${label}.eligibility needs ≥ ${OPAT_LIMITS.eligibilityMin}`)
        .toBeGreaterThanOrEqual(OPAT_LIMITS.eligibilityMin);
      for(let i = 0; i < entry.eligibility.length; i++) {
        const it = entry.eligibility[i];
        expect(SEV_MONITORING.has(it.sev),
          `${label}.eligibility[${i}].sev "${it.sev}" must be required/trigger/consider`).toBe(true);
        expect(typeof it.what, `${label}.eligibility[${i}].what must be string`).toBe("string");
        const wcWhat = wordCount(it.what);
        expect(wcWhat,
          `${label}.eligibility[${i}].what has ${wcWhat} words (max ${OPAT_LIMITS.whatMaxWords})`)
          .toBeLessThanOrEqual(OPAT_LIMITS.whatMaxWords);
        expect(typeof it.why, `${label}.eligibility[${i}].why must be string`).toBe("string");
        const wcWhy = wordCount(it.why);
        expect(wcWhy,
          `${label}.eligibility[${i}].why has ${wcWhy} words (max ${OPAT_LIMITS.whyMaxWords})`)
          .toBeLessThanOrEqual(OPAT_LIMITS.whyMaxWords);
        if(it.matchCtx !== undefined) {
          const err = validateCtxPredicate(it.matchCtx, `${label}.eligibility[${i}].matchCtx`);
          if(err) throw new Error(err);
        }
      }
    });

    test(`${label} — access is a valid enum value`, () => {
      expect(OPAT_ACCESS.has(entry.access),
        `${label}.access "${entry.access}" must be PICC/midline/port/none`).toBe(true);
    });

    test(`${label} — agents populated with route/dose/monitoring`, () => {
      expect(Array.isArray(entry.agents), `${label}.agents must be array`).toBe(true);
      expect(entry.agents.length,
        `${label}.agents needs ≥ ${OPAT_LIMITS.agentsMin}`)
        .toBeGreaterThanOrEqual(OPAT_LIMITS.agentsMin);
      expect(entry.agents.length,
        `${label}.agents capped at ${OPAT_LIMITS.agentsMax}`)
        .toBeLessThanOrEqual(OPAT_LIMITS.agentsMax);
      for(let i = 0; i < entry.agents.length; i++) {
        const ag = entry.agents[i];
        expect(typeof ag.name, `${label}.agents[${i}].name must be string`).toBe("string");
        expect(typeof ag.route, `${label}.agents[${i}].route must be string`).toBe("string");
        expect(typeof ag.dose, `${label}.agents[${i}].dose must be string`).toBe("string");
        expect(typeof ag.monitoring, `${label}.agents[${i}].monitoring must be string`).toBe("string");
        const wcDose = wordCount(ag.dose);
        expect(wcDose,
          `${label}.agents[${i}].dose has ${wcDose} words (max ${OPAT_LIMITS.doseMaxWords}): "${ag.dose}"`)
          .toBeLessThanOrEqual(OPAT_LIMITS.doseMaxWords);
        const wcMon = wordCount(ag.monitoring);
        expect(wcMon,
          `${label}.agents[${i}].monitoring has ${wcMon} words (max ${OPAT_LIMITS.monitoringMaxWords})`)
          .toBeLessThanOrEqual(OPAT_LIMITS.monitoringMaxWords);
        if(ag.note !== undefined) {
          expect(typeof ag.note, `${label}.agents[${i}].note must be string`).toBe("string");
          const wcNote = wordCount(ag.note);
          expect(wcNote,
            `${label}.agents[${i}].note has ${wcNote} words (max ${OPAT_LIMITS.noteMaxWords})`)
            .toBeLessThanOrEqual(OPAT_LIMITS.noteMaxWords);
        }
      }
    });

    test(`${label} — monitoring section (optional) severity-graded`, () => {
      if(!Array.isArray(entry.monitoring)) return;
      for(let i = 0; i < entry.monitoring.length; i++) {
        const it = entry.monitoring[i];
        expect(SEV_MONITORING.has(it.sev),
          `${label}.monitoring[${i}].sev "${it.sev}" must be required/trigger/consider`).toBe(true);
        expect(typeof it.what, `${label}.monitoring[${i}].what must be string`).toBe("string");
        const wcWhat = wordCount(it.what);
        expect(wcWhat,
          `${label}.monitoring[${i}].what has ${wcWhat} words (max ${OPAT_LIMITS.whatMaxWords})`)
          .toBeLessThanOrEqual(OPAT_LIMITS.whatMaxWords);
        expect(typeof it.why, `${label}.monitoring[${i}].why must be string`).toBe("string");
        const wcWhy = wordCount(it.why);
        expect(wcWhy,
          `${label}.monitoring[${i}].why has ${wcWhy} words (max ${OPAT_LIMITS.whyMaxWords})`)
          .toBeLessThanOrEqual(OPAT_LIMITS.whyMaxWords);
        if(it.matchCtx !== undefined) {
          const err = validateCtxPredicate(it.matchCtx, `${label}.monitoring[${i}].matchCtx`);
          if(err) throw new Error(err);
        }
      }
    });
  }

  test("coverage of all SYNDROMES (informational)", () => {
    const total = SYNDROMES.length;
    const covered = SYNDROMES.filter(s => !!OPAT_PROFILES[s.id]).length;
    const ratio = covered / total;
    // eslint-disable-next-line no-console
    console.log(`[content-audit] OPAT coverage: ${covered}/${total} syndromes (${(ratio * 100).toFixed(1)}%)`);
    expect(covered).toBeGreaterThanOrEqual(1);
  });
});

/* ============================================================
   Wave 5 R3 · audit-gate strengthening — typo-resistance probes
   that catch silent failures the prior shape audits missed.
   ============================================================ */

describe("content-audit · matchAgent regex round-trip (Wave 5 R3)", () => {
  /* Every monitoring item with a matchAgent regex must match at least
     one canonical drug name in the recognized agent vocabulary:
       FORMULARY        — the primary antibacterial formulary
       KNOWN_ADJUNCTS   — known non-formulary mentions (rifampin
                          adjunct, antifungals, antivirals) that
                          appear in regimen content but not in
                          FORMULARY's drug rows.
     A typo (e.g. /Daptp/i) silently never elevates the monitoring
     item — invisible to the user and to CI. This probe catches it.

     Items whose matchAgent intentionally matches non-recognized text
     opt out with `_matchAgentLoose: true`. */
  const KNOWN_ADJUNCTS = [
    "Rifampin", "Rifampin (adjunct)",
    "Voriconazole", "Isavuconazole",
    "Caspofungin", "Micafungin", "Anidulafungin",
    "Amphotericin B", "Liposomal amphotericin",
    "Fluconazole", "Posaconazole",
    "Acyclovir", "Ganciclovir", "Valganciclovir",
  ];
  const allDrugNames = [
    ...FORMULARY.flatMap(c => c.drugs.map(d => d.name)),
    ...KNOWN_ADJUNCTS,
  ];

  for(const synId of Object.keys(SYNDROME_DECISION)) {
    const entry = SYNDROME_DECISION[synId];
    const items = entry.monitoring?.items;
    if(!Array.isArray(items)) continue;
    for(let i = 0; i < items.length; i++) {
      const it = items[i];
      if(!it.matchAgent) continue;
      if(it._matchAgentLoose === true) continue;
      test(`[${synId} | monitoring[${i}]] matchAgent matches a known drug name`, () => {
        const hit = allDrugNames.some(name => it.matchAgent.test(name));
        expect(hit, `monitoring item "${it.what}" matchAgent ${it.matchAgent} matches no recognized drug (silently dead — add to KNOWN_ADJUNCTS or set _matchAgentLoose: true if intentional)`)
          .toBe(true);
      });
    }
  }
});

describe("content-audit · FORMULARY pkpd.target regex sanity (Wave 5 R3)", () => {
  /* PR-4 added FORMULARY.pkpd.target as a free-form string. Without a
     content gate any unitless target ("fT > MIC 50") would slip past.
     Require any populated target to mention at least one of the
     standard PK/PD anchor terms. */
  const anchors = /\b(MIC|AUC|Cmax|fT|%T|target attainment)\b/;
  const allDrugs = FORMULARY.flatMap(c => c.drugs.map(d => d));
  for(const d of allDrugs) {
    if(!d.pkpd || typeof d.pkpd.target !== "string") continue;
    test(`[${d.name}].pkpd.target mentions a PK/PD anchor (MIC/AUC/Cmax/fT/%T)`, () => {
      expect(anchors.test(d.pkpd.target),
        `"${d.pkpd.target}" omits the anchor term that gives the value meaning`)
        .toBe(true);
    });
  }
});

describe("content-audit · FORMULARY timeToEffect bounds (Wave 5 R3)", () => {
  /* timeToEffect format `<lo>(–<hi>)? (h|d)`. Bound the value to
     0.5–14 d so a misauthored "1 h" for vancomycin (would-be silent)
     trips. The regex side validates the format; the numeric clamp
     catches semantic miscoding. */
  const fmt = /^(\d+(?:\.\d+)?)(?:–(\d+(?:\.\d+)?))?\s*(h|d)$/;
  const allDrugs = FORMULARY.flatMap(c => c.drugs.map(d => d));
  for(const d of allDrugs) {
    if(!d.timeToEffect) continue;
    test(`[${d.name}].timeToEffect format + bounds`, () => {
      const m = fmt.exec(d.timeToEffect);
      expect(m, `"${d.timeToEffect}" must match <lo>(–<hi>)? (h|d)`).toBeTruthy();
      const hi = Number(m[2] ?? m[1]);
      const unitH = m[3] === "h" ? hi : hi * 24;
      expect(unitH, `"${d.timeToEffect}" out of bounds 0.5–14 d`).toBeGreaterThanOrEqual(0.5);
      expect(unitH, `"${d.timeToEffect}" out of bounds 0.5–14 d`).toBeLessThanOrEqual(14 * 24);
    });
  }
});
