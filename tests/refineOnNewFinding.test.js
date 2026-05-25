/* tests · refineOnNewFinding — Wave 5 PR-5a engine.

   Verifies the snapshot-refine engine returns deterministic patches
   for each finding kind. The contract is snapshot-only: nothing
   mutates caseState, nothing writes to URL hash, nothing persists. */

import { describe, expect, test } from "vitest";
import { composeAnswer, refineOnNewFinding } from "../src/engines/regimen.js";

const SYNDROME = { id: "sepsis", name: "Sepsis" };
const CTX = { age: 65, sex: "M", crcl: 60 };

describe("composeAnswer · currentRegimen extension", () => {
  test("when currentRegimen is null, empiricAgents derives from the syndrome", () => {
    const ans = composeAnswer({ syndrome: "sepsis", patient: { on: true } });
    expect(ans).toBeTruthy();
    expect(Array.isArray(ans.empiricAgents)).toBe(true);
    expect(ans.empiricAgents.length).toBeGreaterThan(0);
  });

  test("when currentRegimen is provided, empiricAgents is the caller's list", () => {
    const supplied = ["Cefepime", "Vancomycin (IV)"];
    const ans = composeAnswer({ syndrome: "sepsis", patient: { on: true } }, supplied);
    expect(ans).toBeTruthy();
    expect(ans.empiricAgents).toEqual(supplied);
    expect(ans.empiricAgents).not.toBe(supplied); // defensive copy
  });

  test("empty array currentRegimen falls back to syndrome-derived", () => {
    const ans = composeAnswer({ syndrome: "sepsis", patient: { on: true } }, []);
    expect(ans.empiricAgents.length).toBeGreaterThan(0);
  });

  test("non-array currentRegimen is ignored gracefully", () => {
    const ans = composeAnswer({ syndrome: "sepsis", patient: { on: true } }, "not an array");
    expect(Array.isArray(ans.empiricAgents)).toBe(true);
  });

  test("returns null for unknown syndrome (unchanged contract)", () => {
    expect(composeAnswer({ syndrome: "unknown-syn" })).toBeNull();
    expect(composeAnswer({ syndrome: "unknown-syn" }, ["Cefepime"])).toBeNull();
    expect(composeAnswer(null)).toBeNull();
  });
});

describe("refineOnNewFinding · contract", () => {
  test("returns empty patch when inputs are missing", () => {
    const empty = { steps: [], replaceLayers: {}, addLayers: [], dropLayers: [] };
    expect(refineOnNewFinding(null, { kind: "culture" }, SYNDROME, CTX)).toEqual(empty);
    expect(refineOnNewFinding(["Cefepime"], null, SYNDROME, CTX)).toEqual(empty);
    expect(refineOnNewFinding(["Cefepime"], {}, SYNDROME, CTX)).toEqual(empty);
  });

  test("returns empty patch for unknown finding kind", () => {
    const patch = refineOnNewFinding(["Cefepime"], { kind: "lunar-eclipse" }, SYNDROME, CTX);
    expect(patch.steps).toEqual([]);
    expect(patch.replaceLayers).toEqual({});
    expect(patch.addLayers).toEqual([]);
  });

  test("is pure — does not mutate currentRegimen", () => {
    const regimen = ["Cefepime", "Vancomycin (IV)"];
    const before = regimen.slice();
    refineOnNewFinding(regimen, { kind: "source-controlled" }, SYNDROME, CTX);
    expect(regimen).toEqual(before);
  });

  test("same inputs produce same patch (determinism)", () => {
    const a = refineOnNewFinding(["Cefepime"], { kind: "source-controlled" }, SYNDROME, CTX);
    const b = refineOnNewFinding(["Cefepime"], { kind: "source-controlled" }, SYNDROME, CTX);
    expect(a).toEqual(b);
  });
});

describe("refineOnNewFinding · culture finding", () => {
  test("known organism produces directed-therapy step + finding layer", () => {
    const patch = refineOnNewFinding(
      ["Cefepime", "Vancomycin (IV)"],
      { kind: "culture", organism: "esbl" },
      SYNDROME, CTX,
    );
    // We don't assert on the specific directed agent (the engine reads
    // orgLookup data) — just on the patch shape and the layer presence.
    expect(patch.addLayers.some(L => L.id === "ans-finding-culture")).toBe(true);
  });

  test("unknown organism yields a culture finding without crashes", () => {
    const patch = refineOnNewFinding(
      ["Cefepime"],
      { kind: "culture", organism: "completely-made-up-organism" },
      SYNDROME, CTX,
    );
    // orgLookup returns null → the engine bails on the directed-therapy
    // branch and leaves the patch empty rather than throwing.
    expect(patch.steps).toEqual([]);
    expect(patch.addLayers).toEqual([]);
  });
});

describe("refineOnNewFinding · resistance findings", () => {
  test("ESBL with no carbapenem on regimen → substitute to meropenem", () => {
    const patch = refineOnNewFinding(
      ["Cefepime", "Vancomycin (IV)"],
      { kind: "resistance", mechanism: "esbl" },
      SYNDROME, CTX,
    );
    const sub = patch.steps.find(s => s.type === "substitute" && s.replacement === "Meropenem");
    expect(sub).toBeTruthy();
    expect(sub.sev).toBe("high");
    expect(patch.addLayers.some(L => L.id === "ans-finding-resistance")).toBe(true);
  });

  test("ESBL with meropenem already on regimen → no substitution", () => {
    const patch = refineOnNewFinding(
      ["Meropenem", "Vancomycin (IV)"],
      { kind: "resistance", mechanism: "esbl" },
      SYNDROME, CTX,
    );
    expect(patch.steps.find(s => s.replacement === "Meropenem")).toBeUndefined();
  });

  test("KPC mechanism prescribes novel β-lactam", () => {
    const patch = refineOnNewFinding(
      ["Meropenem"],
      { kind: "resistance", mechanism: "kpc" },
      SYNDROME, CTX,
    );
    const sub = patch.steps.find(s => s.type === "substitute");
    expect(sub.replacement).toMatch(/Ceftazidime-avibactam|meropenem-vaborbactam/);
  });

  test("MBL mechanism prescribes cefiderocol or aztreonam combo", () => {
    const patch = refineOnNewFinding(
      ["Meropenem"],
      { kind: "resistance", mechanism: "mbl" },
      SYNDROME, CTX,
    );
    const sub = patch.steps.find(s => s.type === "substitute");
    expect(sub.replacement).toMatch(/Cefiderocol|aztreonam/);
  });

  test("MRSA-VRI on vancomycin → switch to daptomycin/ceftaroline", () => {
    const patch = refineOnNewFinding(
      ["Vancomycin (IV)"],
      { kind: "resistance", mechanism: "mrsa-vri" },
      SYNDROME, CTX,
    );
    const sub = patch.steps.find(s => s.type === "substitute" && s.agent === "Vancomycin (IV)");
    expect(sub).toBeTruthy();
    expect(sub.replacement).toMatch(/Daptomycin|ceftaroline/);
  });
});

describe("refineOnNewFinding · allergy findings", () => {
  test("anaphylaxis → eliminate step at high severity", () => {
    const patch = refineOnNewFinding(
      ["Piperacillin-tazobactam"],
      { kind: "allergy", reaction: "anaphylaxis", agent: "Piperacillin-tazobactam" },
      SYNDROME, CTX,
    );
    const elim = patch.steps.find(s => s.type === "eliminate");
    expect(elim).toBeTruthy();
    expect(elim.sev).toBe("high");
    expect(patch.addLayers.some(L => L.id === "ans-finding-allergy")).toBe(true);
  });

  test("SJS → same elimination path as anaphylaxis", () => {
    const patch = refineOnNewFinding(
      ["Cefepime"],
      { kind: "allergy", reaction: "sjs", agent: "Cefepime" },
      SYNDROME, CTX,
    );
    expect(patch.steps.find(s => s.type === "eliminate" && s.sev === "high")).toBeTruthy();
  });

  test("rash → flag at medium severity (not eliminate)", () => {
    const patch = refineOnNewFinding(
      ["Cefepime"],
      { kind: "allergy", reaction: "rash", agent: "Cefepime" },
      SYNDROME, CTX,
    );
    const flag = patch.steps.find(s => s.type === "flag");
    expect(flag).toBeTruthy();
    expect(flag.sev).toBe("med");
  });
});

describe("refineOnNewFinding · source-controlled", () => {
  test("replaceLayers.duration carries the BALANCE 7-day band", () => {
    const patch = refineOnNewFinding(
      ["Cefepime", "Vancomycin (IV)"],
      { kind: "source-controlled" },
      SYNDROME, CTX,
    );
    expect(patch.replaceLayers.duration).toBeTruthy();
    expect(patch.replaceLayers.duration.headline).toMatch(/source controlled/i);
    expect(patch.replaceLayers.duration.branches[0].days).toBe("7 d");
    expect(patch.addLayers.some(L => L.id === "ans-finding-source-controlled")).toBe(true);
  });
});

describe("refineOnNewFinding · deterioration", () => {
  test("shock severity adds a high-severity flag + finding layer", () => {
    const patch = refineOnNewFinding(
      ["Cefepime"],
      { kind: "deterioration", severity: "shock" },
      SYNDROME, CTX,
    );
    const flag = patch.steps.find(s => s.type === "flag" && s.sev === "high");
    expect(flag).toBeTruthy();
    expect(flag.reason).toMatch(/shock|broaden/i);
    expect(patch.addLayers.find(L => L.id === "ans-finding-deterioration").title).toMatch(/shock/i);
  });

  test("default failing severity yields the failure-to-improve layer", () => {
    const patch = refineOnNewFinding(
      ["Cefepime"],
      { kind: "deterioration" },
      SYNDROME, CTX,
    );
    expect(patch.addLayers.find(L => L.id === "ans-finding-deterioration").title).toMatch(/failure/i);
  });
});
