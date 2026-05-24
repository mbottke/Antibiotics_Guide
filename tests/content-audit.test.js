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
