/* tests · regimenCompare — Wave 5 PR-5b engine.

   Verifies the side-by-side regimen comparator returns a symmetric,
   four-dimensional diff (coverage / toxicity / microbiome / evidence)
   and degrades gracefully on missing inputs. Pure — no caseState
   mutation, no I/O. */

import { describe, expect, test } from "vitest";
import { compareRegimens } from "../src/engines/regimenCompare.js";

const SEPSIS = {
  id: "sepsis",
  name: "Sepsis",
  bugs: ["entero","pseudo","esbl","mrsa","strep","anaerobe"],
  tiers: [
    { k: "Broad empiric", rx: "Antipseudomonal β-lactam (piperacillin-tazobactam, cefepime, or meropenem) ± vancomycin" },
    { k: "Add MRSA", rx: "Vancomycin or linezolid" },
    { k: "Add resistant-GNR cover", rx: "Carbapenem (ESBL risk) or novel agent by colonization history" },
  ],
};

describe("compareRegimens · contract", () => {
  test("returns empty diff when both regimens are empty", () => {
    const d = compareRegimens([], [], SEPSIS);
    expect(d.regimenA).toEqual([]);
    expect(d.regimenB).toEqual([]);
    expect(d.coverage.organisms).toEqual([]);
    expect(d.microbiome.winner).toBe("tie");
    expect(d.evidence.winner).toBe("tie");
  });

  test("returns empty diff when both inputs are non-array", () => {
    const d = compareRegimens(null, undefined, SEPSIS);
    expect(d.regimenA).toEqual([]);
    expect(d.regimenB).toEqual([]);
  });

  test("ignores non-string entries and dedupes", () => {
    const d = compareRegimens(
      ["Cefepime", null, "Cefepime", 42, "Vancomycin (IV)"],
      ["Meropenem"],
      SEPSIS,
    );
    expect(d.regimenA).toEqual(["Cefepime", "Vancomycin (IV)"]);
    expect(d.regimenB).toEqual(["Meropenem"]);
  });

  test("same inputs produce same output (determinism)", () => {
    const a = compareRegimens(["Cefepime"], ["Meropenem"], SEPSIS);
    const b = compareRegimens(["Cefepime"], ["Meropenem"], SEPSIS);
    expect(a).toEqual(b);
  });

  test("does not mutate input arrays", () => {
    const aIn = ["Cefepime", "Vancomycin (IV)"];
    const bIn = ["Meropenem"];
    const aBefore = aIn.slice(), bBefore = bIn.slice();
    compareRegimens(aIn, bIn, SEPSIS);
    expect(aIn).toEqual(aBefore);
    expect(bIn).toEqual(bBefore);
  });
});

describe("compareRegimens · symmetry", () => {
  test("swapping the regimens swaps every per-side field cleanly", () => {
    const fwd = compareRegimens(["Cefepime", "Vancomycin (IV)"], ["Meropenem"], SEPSIS);
    const rev = compareRegimens(["Meropenem"], ["Cefepime", "Vancomycin (IV)"], SEPSIS);
    expect(rev.regimenA).toEqual(fwd.regimenB);
    expect(rev.regimenB).toEqual(fwd.regimenA);
    expect(rev.coverage.aOnly).toEqual(fwd.coverage.bOnly);
    expect(rev.coverage.bOnly).toEqual(fwd.coverage.aOnly);
    expect(rev.coverage.shared).toEqual(fwd.coverage.shared);
    expect(rev.coverage.gap).toEqual(fwd.coverage.gap);
    expect(rev.toxicity.a).toEqual(fwd.toxicity.b);
    expect(rev.toxicity.b).toEqual(fwd.toxicity.a);
    expect(rev.microbiome.a).toEqual(fwd.microbiome.b);
    expect(rev.microbiome.b).toEqual(fwd.microbiome.a);
    expect(rev.evidence.a).toEqual(fwd.evidence.b);
    expect(rev.evidence.b).toEqual(fwd.evidence.a);
    // winners flip
    const flip = (w) => w === "a" ? "b" : w === "b" ? "a" : "tie";
    expect(rev.microbiome.winner).toBe(flip(fwd.microbiome.winner));
    expect(rev.evidence.winner).toBe(flip(fwd.evidence.winner));
  });
});

describe("compareRegimens · coverage", () => {
  test("organism set comes from syndrome.bugs when provided", () => {
    const d = compareRegimens(["Cefepime"], ["Ceftriaxone"], SEPSIS);
    const ids = d.coverage.organisms.map(o => o.id);
    expect(ids).toEqual(SEPSIS.bugs);
  });

  test("organism set falls back to all ORGS when syndrome is null", () => {
    const d = compareRegimens(["Cefepime"], ["Meropenem"], null);
    expect(d.coverage.organisms.length).toBeGreaterThan(SEPSIS.bugs.length);
  });

  test("vancomycin covers MRSA; cefepime does not — aOnly captures the delta", () => {
    const d = compareRegimens(
      ["Cefepime", "Vancomycin (IV)"],
      ["Cefepime"],
      SEPSIS,
    );
    expect(d.coverage.aOnly).toContain("mrsa");
    expect(d.coverage.bOnly).not.toContain("mrsa");
    expect(d.coverage.shared).toContain("pseudo");
  });

  test("neither regimen covers CRE → reported as a gap", () => {
    const d = compareRegimens(
      ["Cefepime"],
      ["Meropenem"],
      { ...SEPSIS, bugs: ["cre"] },
    );
    expect(d.coverage.gap).toContain("cre");
  });

  test("each organism row carries a, b, delta", () => {
    const d = compareRegimens(["Cefepime"], ["Meropenem"], SEPSIS);
    d.coverage.organisms.forEach(o => {
      expect(typeof o.a).toBe("boolean");
      expect(typeof o.b).toBe("boolean");
      expect(["both","aOnly","bOnly","neither"]).toContain(o.delta);
    });
  });
});

describe("compareRegimens · toxicity", () => {
  test("linezolid carries the serotonergic major flag", () => {
    const d = compareRegimens(["Linezolid"], ["Vancomycin (IV)"], SEPSIS);
    expect(d.toxicity.a.flags.some(f => f.tag === "Serotonergic")).toBe(true);
    expect(d.toxicity.a.majorCount).toBeGreaterThan(0);
  });

  test("agents with no interactions contribute zero flags", () => {
    const d = compareRegimens(["Cefazolin"], ["Cefazolin"], SEPSIS);
    expect(d.toxicity.a.total).toBe(0);
    expect(d.toxicity.b.total).toBe(0);
  });

  test("host-factor flags are tallied separately from severity", () => {
    const d = compareRegimens(["Trimethoprim-sulfamethoxazole"], [], SEPSIS);
    expect(d.toxicity.a.hostCount).toBeGreaterThan(0);
  });
});

describe("compareRegimens · microbiome", () => {
  test("lower cdiffMax wins — ceftriaxone (4) vs ciprofloxacin (5)", () => {
    const d = compareRegimens(["Ceftriaxone"], ["Ciprofloxacin"], SEPSIS);
    expect(d.microbiome.a.cdiffMax).toBe(4);
    expect(d.microbiome.b.cdiffMax).toBe(5);
    expect(d.microbiome.winner).toBe("a");
  });

  test("tiebreaks on cdiffAvg when cdiffMax is equal", () => {
    // both regimens hit cdiffMax 5 (cipro), but B adds a low-score agent
    // → B has a lower average.
    const d = compareRegimens(
      ["Ciprofloxacin"],
      ["Ciprofloxacin", "Metronidazole"],
      SEPSIS,
    );
    expect(d.microbiome.a.cdiffMax).toBe(d.microbiome.b.cdiffMax);
    expect(d.microbiome.b.cdiffAvg).toBeLessThan(d.microbiome.a.cdiffAvg);
    expect(d.microbiome.winner).toBe("b");
  });

  test("mdrPressure tally captures high-pressure agents", () => {
    const d = compareRegimens(["Cefepime"], ["Cefazolin"], SEPSIS);
    expect(d.microbiome.a.mdrCount.high).toBe(1);
    expect(d.microbiome.b.mdrCount.low).toBe(1);
    expect(d.microbiome.winner).toBe("b");
  });

  test("unknown agent names land in mdrUnknown without throwing", () => {
    const d = compareRegimens(["Made-up drug"], ["Cefepime"], SEPSIS);
    expect(d.microbiome.a.mdrUnknown).toBe(1);
    expect(d.microbiome.a.scored).toBe(0);
  });

  test("identical regimens tie", () => {
    const d = compareRegimens(["Cefepime"], ["Cefepime"], SEPSIS);
    expect(d.microbiome.winner).toBe("tie");
  });
});

describe("compareRegimens · evidence-grade", () => {
  test("agents in tier 0 are graded preferred", () => {
    const d = compareRegimens(["Cefepime"], ["Vancomycin (IV)"], SEPSIS);
    expect(d.evidence.a.preferred).toContain("Cefepime");
    // vancomycin is mentioned in tier 0 ("± vancomycin") so it's preferred too
    expect(d.evidence.b.preferred).toContain("Vancomycin (IV)");
  });

  test("agents only in tier 1+ are graded alternative", () => {
    // linezolid appears only in tier 1 of SEPSIS
    const d = compareRegimens(["Linezolid"], [], SEPSIS);
    expect(d.evidence.a.alternative).toContain("Linezolid");
    expect(d.evidence.a.preferred).not.toContain("Linezolid");
  });

  test("agents not in any tier are off-protocol", () => {
    const d = compareRegimens(["Daptomycin"], [], SEPSIS);
    expect(d.evidence.a.offProtocol).toContain("Daptomycin");
  });

  test("more preferred agents wins; ties cascade to alternative count", () => {
    const d = compareRegimens(
      ["Cefepime", "Vancomycin (IV)"],
      ["Daptomycin"],
      SEPSIS,
    );
    expect(d.evidence.winner).toBe("a");
  });

  test("when syndrome is null, every agent collapses to offProtocol", () => {
    const d = compareRegimens(["Cefepime"], ["Meropenem"], null);
    expect(d.evidence.a.offProtocol).toEqual(["Cefepime"]);
    expect(d.evidence.b.offProtocol).toEqual(["Meropenem"]);
    expect(d.evidence.a.preferred).toEqual([]);
    expect(d.evidence.b.preferred).toEqual([]);
  });
});

describe("compareRegimens · name normalization", () => {
  test("free-text alias resolves through AGENT_RX (zosyn → Piperacillin-tazobactam)", () => {
    const d = compareRegimens(["zosyn"], ["Cefepime"], SEPSIS);
    expect(d.regimenA).toEqual(["Piperacillin-tazobactam"]);
    // and the canonical name is then recognized for microbiome lookup
    expect(d.microbiome.a.scored).toBe(1);
  });

  test("SPX-style alias resolves through DRUG_ALIASES reverse map", () => {
    const d = compareRegimens(["Linezolid / tedizolid"], [], SEPSIS);
    expect(d.regimenA).toEqual(["Linezolid"]);
  });

  test("unknown name passes through unchanged but does not crash", () => {
    const d = compareRegimens(["Mystery-cillin"], [], SEPSIS);
    expect(d.regimenA).toEqual(["Mystery-cillin"]);
    expect(d.toxicity.a.total).toBe(0);
    expect(d.microbiome.a.scored).toBe(0);
  });
});
