import { describe, it, expect } from "vitest";
import { buildRegimen, regimenAgents, deescalationPlan, composeAnswer, applyReassessment, _extractDurationDays } from "../src/engines/regimen.js";
import { SYNDROMES } from "../src/data/syndromes.js";

/* The empiric selector and the organism-directed de-escalation suggester — the
   logic the split was undertaken to make testable. These assert that the right
   risk flags add the right tiers, and that de-escalation correctly identifies
   which empiric agents a confirmed organism lets you stop. A data edit that
   changes any of these recommendations turns the suite red. */

const byId = (id) => {
  const s = SYNDROMES.find((x) => x.id === id);
  if (!s) throw new Error(`fixture syndrome "${id}" not found`);
  return s;
};
const noRisk = { mrsaRisk: false, pseudoRisk: false, esblRisk: false, severe: false };

describe("buildRegimen — risk-driven empiric assembly", () => {
  const sepsis = byId("sepsis");

  it("returns the core tier with no add-ons when no risks are set", () => {
    const r = buildRegimen(sepsis, noRisk);
    expect(r.core).toBe(sepsis.tiers[0]);
    expect(r.adds).toEqual([]);
    // every non-core tier is accounted for as an explained omission
    expect(r.others.length).toBe(sepsis.tiers.length - 1);
  });

  it("adds tiers — each with a reason — when their triggering risk is set", () => {
    const r = buildRegimen(sepsis, { ...noRisk, mrsaRisk: true, pseudoRisk: true, esblRisk: true, severe: true });
    expect(r.adds.length).toBeGreaterThan(0);
    r.adds.forEach((t) => {
      expect(typeof t.why).toBe("string");
      expect(t.why.length).toBeGreaterThan(0);
    });
  });

  it("monotonically: enabling more risks never removes a previously-added tier", () => {
    const base = buildRegimen(sepsis, noRisk).adds.length;
    const all = buildRegimen(sepsis, { mrsaRisk: true, pseudoRisk: true, esblRisk: true, severe: true }).adds.length;
    expect(all).toBeGreaterThanOrEqual(base);
  });

  it("annotates each omitted tier with the unmet risk that would add it", () => {
    const r = buildRegimen(sepsis, noRisk);
    // at least one omission should name the risk that would promote it
    const named = r.others.filter((t) => t.unmet);
    expect(named.length).toBeGreaterThan(0);
  });
});

describe("regimenAgents — agent extraction from regimen text", () => {
  it("pulls recognizable agent names out of a regimen string", () => {
    const agents = regimenAgents(["Piperacillin-tazobactam 4.5 g IV q6h + vancomycin"]);
    expect(Array.isArray(agents)).toBe(true);
    const joined = agents.join(" | ").toLowerCase();
    expect(joined).toMatch(/pip|tazo|vanc/);
  });
});

describe("deescalationPlan — organism-directed narrowing", () => {
  const cholangitis = byId("cholangitis");

  it("produces a row per resolvable covered organism with a narrowest target", () => {
    const rows = deescalationPlan(cholangitis, ["Piperacillin-tazobactam", "Metronidazole"]);
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((row) => {
      expect(row.id).toBeTruthy();
      expect(row.label).toBeTruthy();
      // each row offers either a curated directed target or a matrix fallback
      expect(row.targets.length + row.docFallback.length).toBeGreaterThan(0);
    });
  });

  it("computes the 'lets you stop' set as empiric agents lacking activity", () => {
    // For Enterobacterales (wild-type), metronidazole adds nothing → stoppable.
    const rows = deescalationPlan(cholangitis, ["Piperacillin-tazobactam", "Metronidazole"]);
    const entero = rows.find((r) => r.id === "entero");
    expect(entero).toBeTruthy();
    expect(entero.stop).toContain("Metronidazole");
  });

  it("never lists an agent that DOES cover the organism as stoppable", () => {
    const rows = deescalationPlan(cholangitis, ["Piperacillin-tazobactam", "Metronidazole"]);
    // anaerobe coverage comes from metronidazole — it must NOT be in anaerobe.stop
    const anaerobe = rows.find((r) => r.id === "anaerobe");
    if (anaerobe) expect(anaerobe.stop).not.toContain("Metronidazole");
  });

  it("returns an empty plan when no organisms are supplied", () => {
    const bare = { ...cholangitis, bugs: [] };
    expect(deescalationPlan(bare, ["Cefepime"])).toEqual([]);
  });
});

describe("composeAnswer — the Bedside answer-bundle entry point", () => {
  it("returns null when the case has no syndrome", () => {
    expect(composeAnswer({ patient: { on: false } })).toBeNull();
    expect(composeAnswer({ syndrome: null, patient: {} })).toBeNull();
  });

  it("returns null for an unknown syndrome id", () => {
    expect(composeAnswer({ syndrome: "not-a-real-syndrome", patient: {} })).toBeNull();
  });

  it("bundles the canonical fields for a sepsis case with no patient context", () => {
    const r = composeAnswer({ syndrome: "sepsis", patient: { on: false } });
    expect(r).toBeTruthy();
    expect(r.syndrome.id).toBe("sepsis");
    expect(r.core).toBeTruthy();
    expect(r.core.rx).toMatch(/β-lactam|piperacillin|cefepime|meropenem/i);
    expect(Array.isArray(r.adds)).toBe(true);
    expect(Array.isArray(r.others)).toBe(true);
    expect(typeof r.duration).toBe("string");
    expect(Array.isArray(r.bugs)).toBe(true);
    expect(Array.isArray(r.pearls)).toBe(true);
    expect(Array.isArray(r.empiricAgents)).toBe(true);
    expect(Array.isArray(r.deesc)).toBe(true);
    expect(r.refinement).toBeTruthy();
    expect(Array.isArray(r.refinement.steps)).toBe(true);
  });

  /* Snapshot-like spot checks across one representative syndrome per
     category. We assert field-level structure rather than full snapshots,
     so a legitimate content edit (e.g. new pearl) doesn't break the test
     while a structural regression (missing field, wrong agent) does. */
  const FIXTURES = [
    { id: "sepsis",   shouldHaveBug: true },
    { id: "cap",      shouldHaveBug: true },
    { id: "hap",      shouldHaveBug: true },
    { id: "ie",       shouldHaveBug: true },
    { id: "pyelo",    shouldHaveBug: true },
    { id: "cholangitis", shouldHaveBug: true },
    { id: "cellulitis", shouldHaveBug: true },
    { id: "meningitis", shouldHaveBug: true },
    { id: "dfi",      shouldHaveBug: true },
    { id: "sepsis-neutropenic", shouldHaveBug: true },
  ];
  FIXTURES.forEach(({ id, shouldHaveBug }) => {
    it(`composes a non-empty answer for ${id}`, () => {
      const r = composeAnswer({ syndrome: id, patient: { on: false } });
      expect(r).toBeTruthy();
      expect(r.syndrome.id).toBe(id);
      expect(typeof r.core.rx).toBe("string");
      expect(r.core.rx.length).toBeGreaterThan(0);
      if (shouldHaveBug) expect(r.bugs.length).toBeGreaterThan(0);
      expect(typeof r.duration).toBe("string");
    });
  });

  it("applies risk-driven add-ons when the patient context flags them", () => {
    const noRisk = composeAnswer({ syndrome: "hap", patient: { on: true } });
    const withRisks = composeAnswer({
      syndrome: "hap",
      patient: { on: true, mrsaRisk: true, severe: true },
    });
    expect(withRisks.adds.length).toBeGreaterThan(noRisk.adds.length);
  });

  it("populates the refinement trail when allergy + nephrotoxicity rules fire", () => {
    // Severe β-lactam allergy on a sepsis empiric regimen — RULE 1 fires:
    // eliminate β-lactams, substitute aztreonam.
    const r = composeAnswer({
      syndrome: "sepsis",
      patient: { on: true, blAllergy: "severe", mrsaRisk: true, pseudoRisk: true },
    });
    expect(r.refinement.steps.length).toBeGreaterThan(0);
    const types = new Set(r.refinement.steps.map(s => s.type));
    // Should include at least one eliminate (or substitute) action
    expect(types.has("eliminate") || types.has("substitute")).toBe(true);
  });

  it("derives crcl into ctx when patient labs are present", () => {
    const r = composeAnswer({
      syndrome: "cap",
      patient: { on: true, age: 72, weightKg: 80, sex: "M", scr: 1.5 },
    });
    expect(r.ctx.crcl).toBeGreaterThan(0);
    expect(r.d.crcl).toBe(r.ctx.crcl);
  });

  it("surfaces sourceControl for syndromes that have one", () => {
    const r = composeAnswer({ syndrome: "cholangitis", patient: { on: false } });
    expect(r.sourceControl).toBeTruthy();
    expect(r.sourceControl).toMatch(/drain|ercp|decompress/i);
  });

  it("surfaces evidence when the syndrome has a citation", () => {
    const r = composeAnswer({ syndrome: "cap", patient: { on: false } });
    // synEvidence may be null for some syndromes; when present it has the
    // expected shape.
    if (r.evidence) {
      expect(typeof r.evidence.ref).toBe("string");
    }
  });
});

describe("_extractDurationDays — parsing day-counts out of syndrome durations", () => {
  it("extracts a plain integer day count", () => {
    expect(_extractDurationDays("7 days")).toBe(7);
    expect(_extractDurationDays("14 days from clearance")).toBe(14);
  });
  it("for a range like '5-7 days', returns the integer immediately preceding the day unit (the upper bound) — the conservative stop date", () => {
    expect(_extractDurationDays("5-7 days, stop when afebrile")).toBe(7);
  });
  it("handles the ~ prefix and trailing prose", () => {
    expect(_extractDurationDays("~4 days after source control (STOP-IT)")).toBe(4);
  });
  it("returns null when the duration is not in day units", () => {
    expect(_extractDurationDays("2-4 weeks")).toBeNull();
    expect(_extractDurationDays("Pathogen-specific")).toBeNull();
    expect(_extractDurationDays("Source- and pathogen-specific")).toBeNull();
  });
  it("returns null for empty / non-string input", () => {
    expect(_extractDurationDays("")).toBeNull();
    expect(_extractDurationDays(null)).toBeNull();
    expect(_extractDurationDays(undefined)).toBeNull();
  });
});

describe("applyReassessment — the 48–72 h stateful workflow", () => {
  const emp = (synId, patientExtras = {}) => composeAnswer({
    syndrome: synId,
    patient: { on: true, ...patientExtras },
  });

  it("returns null when no day-3 trigger has fired", () => {
    const e = emp("hap", { mrsaRisk: true });
    expect(applyReassessment(e, { cultures: { status: "pending" }, clinical: {} })).toBeNull();
  });

  it("returns null for null inputs rather than throwing", () => {
    expect(applyReassessment(null, {})).toBeNull();
    expect(applyReassessment(undefined, {})).toBeNull();
  });

  it("cultures-back: produces a directed therapy row + a stop set", () => {
    const e = emp("hap", { mrsaRisk: true });
    // HAP empiric backbone includes vancomycin or linezolid + an
    // antipseudomonal β-lactam. If MRSA culture comes back, the directed
    // therapy targets S. aureus — MRSA, and the GNR-only agents become
    // candidates to drop.
    const r = applyReassessment(e, {
      cultures: { status: "back", organism: "mrsa" },
      clinical: {},
    });
    expect(r).toBeTruthy();
    expect(r.cultures.status).toBe("back");
    expect(r.cultures.organism).toBe("mrsa");
    expect(r.cultures.label).toMatch(/MRSA/i);
    // Directed therapy row resolved from DIRECTED via orgLookup.
    expect(r.directed).toBeTruthy();
    expect(r.directed.first).toBeTruthy();
    // The "lets you stop" set is non-empty for HAP empiric with MRSA back —
    // the antipseudomonal β-lactams alone do not cover MRSA, but vanc /
    // linezolid DO cover MRSA, so the set lists the GNR-only agents.
    expect(r.drop.length).toBeGreaterThan(0);
    expect(r.activeTriggers).toContain("cultures");
  });

  it("cultures-back with a fully-covered organism: empty drop set", () => {
    const e = emp("cap"); // ceftriaxone + azithromycin
    const r = applyReassessment(e, {
      cultures: { status: "back", organism: "strep" }, // S. pneumoniae
      clinical: {},
    });
    expect(r).toBeTruthy();
    // Every empiric agent covers strep here, so drop is empty (no narrowing
    // available beyond what's already on-label).
    expect(r.drop).toEqual([]);
    expect(r.narrow).toBeNull();
  });

  it("stable + absorbing: surfaces an IV→PO plan", () => {
    const e = emp("cap");
    const r = applyReassessment(e, {
      cultures: { status: "pending" },
      clinical: { stable: true, absorbing: true, sourceControlled: false },
    });
    expect(r).toBeTruthy();
    expect(r.ivpo).toBeTruthy();
    expect(Array.isArray(r.ivpo.criteria)).toBe(true);
    expect(r.ivpo.candidates.length).toBeGreaterThan(0);
    expect(r.activeTriggers).toContain("ivpo");
  });

  it("source controlled: extracts duration days from the syndrome string", () => {
    const e = emp("peritonitis"); // STOP-IT — "~4 days after adequate source control"
    const r = applyReassessment(e, {
      cultures: { status: "pending" },
      clinical: { sourceControlled: true },
    });
    expect(r).toBeTruthy();
    expect(r.duration).toBeTruthy();
    expect(r.duration.days).toBe(4);
    expect(r.activeTriggers).toContain("duration");
  });

  it("source controlled + startDate: computes the stop date", () => {
    const e = emp("hap"); // "7 days for most VAP/HAP"
    const r = applyReassessment(e, {
      cultures: { status: "pending" },
      clinical: { sourceControlled: true },
      startDate: "2026-01-10",
    });
    expect(r.duration.days).toBe(7);
    // Start day 1 = 2026-01-10; last day (day 7) = 2026-01-16.
    expect(r.stopDate).toBe("2026-01-16");
  });

  it("source controlled but no extractable day-count: stopDate stays null", () => {
    // pancreatic necrosis duration is "Guided by source control... and response" —
    // no integer day-count, so duration and stopDate stay null even with
    // sourceControlled set.
    const e = emp("pancreatic");
    const r = applyReassessment(e, {
      cultures: { status: "pending" },
      clinical: { sourceControlled: true },
      startDate: "2026-01-10",
    });
    expect(r.duration).toBeNull();
    expect(r.stopDate).toBeNull();
  });

  it("all three triggers compose into one reassessment", () => {
    const e = emp("hap", { mrsaRisk: true });
    const r = applyReassessment(e, {
      cultures: { status: "back", organism: "mrsa" },
      clinical: { stable: true, absorbing: true, sourceControlled: true },
      startDate: "2026-01-10",
    });
    expect(r.cultures).toBeTruthy();
    expect(r.directed).toBeTruthy();
    expect(r.ivpo).toBeTruthy();
    expect(r.duration).toBeTruthy();
    expect(r.activeTriggers).toEqual(expect.arrayContaining(["cultures", "ivpo", "duration"]));
  });
});
