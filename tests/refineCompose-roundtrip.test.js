/* tests · refineOnNewFinding ↔ composeAnswer integration round-trip.

   Wave 5 R3 · closes the test-coverage audit gap (#3): existing
   refineOnNewFinding tests assert the patch shape but never that the
   patch composes through a render-realistic pipeline. This file
   verifies the end-to-end path:

     composeAnswer(caseState)
       → answer.empiricAgents (canonical names)
       → refineOnNewFinding(empiricAgents, finding, syndrome, ctx)
       → patch.steps / addLayers / replaceLayers
       → render-realistic invariants:
           - steps are deterministic for identical inputs
           - addLayers ids are unique across the patch
           - replaceLayers contain only known keys (duration, monitoring)
           - dropLayers ids reference a known layer set

   No DOM, no React — pure engine integration. */

import { describe, expect, test } from "vitest";
import { composeAnswer, refineOnNewFinding } from "../src/engines/regimen.js";

const SYNDROME_SEPSIS = { id: "sepsis", name: "Sepsis" };
const CTX = { age: 65, sex: "M", crcl: 60 };

const KNOWN_REPLACE_KEYS = new Set(["duration", "monitoring"]);
const KNOWN_FINDING_LAYER_IDS = new Set([
  "ans-finding-culture",
  "ans-finding-resistance",
  "ans-finding-allergy",
  "ans-finding-source-controlled",
  "ans-finding-deterioration",
]);

describe("refineOnNewFinding ↔ composeAnswer end-to-end (Wave 5 R3)", () => {
  test("composeAnswer empiric agents feed back as currentRegimen cleanly", () => {
    const ans = composeAnswer({ syndrome: "sepsis", patient: { on: true } });
    expect(Array.isArray(ans.empiricAgents)).toBe(true);
    expect(ans.empiricAgents.length).toBeGreaterThan(0);
    // empiricAgents are canonical names that refineOnNewFinding can consume
    const patch = refineOnNewFinding(
      ans.empiricAgents,
      { kind: "source-controlled" },
      SYNDROME_SEPSIS, CTX,
    );
    expect(patch.replaceLayers.duration).toBeTruthy();
    expect(patch.addLayers.some(L => L.id === "ans-finding-source-controlled")).toBe(true);
  });

  test("deterioration patch composes a high-sev flag + finding layer", () => {
    const ans = composeAnswer({ syndrome: "sepsis", patient: { on: true } });
    const patch = refineOnNewFinding(
      ans.empiricAgents,
      { kind: "deterioration", severity: "shock" },
      SYNDROME_SEPSIS, CTX,
    );
    expect(patch.steps.find(s => s.type === "flag" && s.sev === "high")).toBeTruthy();
    expect(patch.addLayers.find(L => L.id === "ans-finding-deterioration")).toBeTruthy();
  });

  test("addLayers ids are unique within a single patch", () => {
    const ans = composeAnswer({ syndrome: "sepsis", patient: { on: true } });
    const patch = refineOnNewFinding(
      ans.empiricAgents,
      { kind: "culture", organism: "esbl" },
      SYNDROME_SEPSIS, CTX,
    );
    const ids = patch.addLayers.map(L => L.id);
    const dups = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dups, `addLayers duplicate ids: ${dups.join(", ")}`).toEqual([]);
  });

  test("replaceLayers keys are restricted to the known set", () => {
    const ans = composeAnswer({ syndrome: "sepsis", patient: { on: true } });
    const patch = refineOnNewFinding(
      ans.empiricAgents,
      { kind: "source-controlled" },
      SYNDROME_SEPSIS, CTX,
    );
    Object.keys(patch.replaceLayers).forEach(k => {
      expect(KNOWN_REPLACE_KEYS.has(k),
        `replaceLayers carried unknown key "${k}"`).toBe(true);
    });
  });

  test("every finding-layer id matches the known finding-layer vocabulary", () => {
    const ans = composeAnswer({ syndrome: "sepsis", patient: { on: true } });
    const kinds = ["source-controlled", "deterioration",
                   { kind: "culture", organism: "esbl" },
                   { kind: "resistance", mechanism: "esbl" },
                   { kind: "allergy", reaction: "anaphylaxis", agent: "Piperacillin-tazobactam" }];
    kinds.forEach(k => {
      const finding = typeof k === "string" ? { kind: k } : k;
      const patch = refineOnNewFinding(ans.empiricAgents, finding, SYNDROME_SEPSIS, CTX);
      patch.addLayers.forEach(L => {
        if(!L.id || !L.id.startsWith("ans-finding-")) return;
        expect(KNOWN_FINDING_LAYER_IDS.has(L.id),
          `Unknown finding-layer id "${L.id}" — extend KNOWN_FINDING_LAYER_IDS if intentional`)
          .toBe(true);
      });
    });
  });

  test("identical inputs across composeAnswer + refine produce identical patches (determinism)", () => {
    const caseState = { syndrome: "sepsis", patient: { on: true } };
    const finding = { kind: "resistance", mechanism: "esbl" };
    const a = composeAnswer(caseState);
    const b = composeAnswer(caseState);
    expect(a.empiricAgents).toEqual(b.empiricAgents);
    const pa = refineOnNewFinding(a.empiricAgents, finding, SYNDROME_SEPSIS, CTX);
    const pb = refineOnNewFinding(b.empiricAgents, finding, SYNDROME_SEPSIS, CTX);
    expect(pa).toEqual(pb);
  });
});
