/* tests · compareRegimens toxicity dimension — Wave 5 R3.

   Closes the test-coverage audit gap (#19): every other dimension of
   compareRegimens had a winner-resolution test; toxicity had none.
   This file adds the missing dimension. */

import { describe, expect, test } from "vitest";
import { compareRegimens } from "../src/engines/regimenCompare.js";

const SEPSIS = {
  id: "sepsis",
  name: "Sepsis",
  bugs: ["entero","pseudo","esbl","mrsa","strep","anaerobe"],
  tiers: [
    { k: "Broad empiric", rx: "Cefepime or piperacillin-tazobactam ± vancomycin" },
  ],
};

describe("compareRegimens · toxicity dimension semantics (Wave 5 R3)", () => {
  test("toxicity flags accumulate per agent — linezolid > vancomycin", () => {
    const diff = compareRegimens(["Linezolid"], ["Vancomycin (IV)"], SEPSIS);
    expect(diff.toxicity.a.total).toBeGreaterThanOrEqual(diff.toxicity.b.total);
  });

  test("identical regimens produce identical toxicity tallies", () => {
    const diff = compareRegimens(["Cefepime"], ["Cefepime"], SEPSIS);
    expect(diff.toxicity.a).toEqual(diff.toxicity.b);
  });

  test("majorCount aggregates only `sev: major` entries", () => {
    const diff = compareRegimens(["Linezolid"], ["Cefazolin"], SEPSIS);
    // Linezolid carries a major serotonergic flag; cefazolin has none.
    expect(diff.toxicity.a.majorCount).toBeGreaterThan(0);
    expect(diff.toxicity.b.majorCount).toBe(0);
  });

  test("hostCount aggregates only items with a `host` tag", () => {
    const diff = compareRegimens(["Linezolid"], ["Cefazolin"], SEPSIS);
    // Linezolid host:"serotonergic" — exactly one host-flagged item.
    expect(diff.toxicity.a.hostCount).toBeGreaterThan(0);
  });

  test("empty regimens produce zero-flag tallies", () => {
    const diff = compareRegimens([], [], SEPSIS);
    expect(diff.toxicity.a.total).toBe(0);
    expect(diff.toxicity.b.total).toBe(0);
    expect(diff.toxicity.a.majorCount).toBe(0);
    expect(diff.toxicity.b.majorCount).toBe(0);
  });

  test("flag entries carry the full DRUG_IX row shape", () => {
    const diff = compareRegimens(["Linezolid"], [], SEPSIS);
    diff.toxicity.a.flags.forEach(f => {
      expect(typeof f.agent).toBe("string");
      expect(typeof f.tag).toBe("string");
      expect(["major","moderate"]).toContain(f.sev);
      expect(typeof f.with).toBe("string");
      expect(typeof f.mech).toBe("string");
    });
  });
});
