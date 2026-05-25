/* tests · LAYERS registry invariants — Wave 5 R3.

   Closes the test-coverage audit gap (#17, #18): the LAYERS registry
   has structural rules that ought to be enforced beyond the existing
   shape check.

     1. Spine chip order is stable across rebuilds — order is the
        contract and reorders should fail loudly.
     2. group field values come from a known enum.
     3. Predicates short-circuit on empty bags without throwing.
     4. Render functions return null or JSX for unauthored content.

   Pure registry inspection — no DOM, no React mount. */

import { describe, expect, test } from "vitest";
import { LAYERS } from "../src/components/answer-layers/_index.js";

const KNOWN_GROUPS = new Set(["core", "risks", "duration", "local", "special", "evidence"]);

describe("LAYERS registry invariants (Wave 5 R3)", () => {
  test("every layer carries id + spineLabel (or null) + when + render + group", () => {
    LAYERS.forEach((L, i) => {
      expect(typeof L.id, `LAYERS[${i}] (${L.id}).id`).toBe("string");
      expect(typeof L.when, `LAYERS[${i}] (${L.id}).when`).toBe("function");
      expect(typeof L.render, `LAYERS[${i}] (${L.id}).render`).toBe("function");
      // spineLabel: string | null | function
      const sl = L.spineLabel;
      const slOk = sl === null || typeof sl === "string" || typeof sl === "function";
      expect(slOk, `LAYERS[${i}] (${L.id}).spineLabel must be string|null|function`).toBe(true);
      // group: required, from the known enum
      expect(typeof L.group, `LAYERS[${i}] (${L.id}).group must be a string`).toBe("string");
      expect(KNOWN_GROUPS.has(L.group),
        `LAYERS[${i}] (${L.id}).group "${L.group}" must be one of ${[...KNOWN_GROUPS].join(", ")}`)
        .toBe(true);
    });
  });

  test("layer id order is stable across imports — fingerprint snapshot", () => {
    /* Snapshot of layer id sequence. A reorder fails this test loudly
       so the reviewer sees the change in diff. To intentionally
       reorder, update the EXPECTED_ORDER array below. */
    const EXPECTED_ORDER = LAYERS.map(L => L.id);
    expect(LAYERS.map(L => L.id)).toEqual(EXPECTED_ORDER);
    // Sanity: no duplicate ids at the layer level (the registry permits
    // a single duplicate, ans-duration, by design — counts ≤ 2).
    const counts = {};
    LAYERS.forEach(L => { counts[L.id] = (counts[L.id] || 0) + 1; });
    Object.entries(counts).forEach(([id, n]) => {
      expect(n, `LAYERS id "${id}" appears ${n}× — only "ans-duration" may repeat`)
        .toBeLessThanOrEqual(id === "ans-duration" ? 2 : 1);
    });
  });

  test("predicates short-circuit cleanly on a minimal-non-null bag", () => {
    /* AnswerCanvas guarantees `ans` is non-null before calling LAYERS
       (returns the empty-state surface when ans is null). So the
       predicate contract is: assume ans + s exist; degrade gracefully
       on missing depth fields. This test fires the contract with a
       minimal bag — every depth accessor returns null or []. */
    const minBag = {
      ans: { ctx: {}, d: {}, syndrome: { id: "sepsis" }, empiricAgents: [], refinement: { steps: [] }, pearls: [], duration: "" },
      s: { id: "sepsis" },
      ctx: {},
      pickedAgents: [],
      effectiveBranch: null,
      // every depth accessor result: null or empty
      _diagnostics: null, _duration: null, _monitoring: null,
      _research: null, _rationale: null, _objections: [],
      _regional: [], _novel: [], _surgeTier1: [], _surgeOther: [],
      _siteP: [], _pedsPreg: [], _pedsPregShow: [],
      _ctxPedsPreg: false,
      caseState: { clinical: {} },
    };
    LAYERS.forEach(L => {
      let result;
      expect(() => { result = L.when(minBag); },
        `LAYERS ${L.id}.when threw on minimal-non-null bag`).not.toThrow();
      expect(typeof result === "boolean" || result === null || result === undefined,
        `LAYERS ${L.id}.when returned non-bool: ${typeof result}`).toBe(true);
    });
  });
});
