/* test · AnswerCanvas LAYERS registry — Wave 5 PR-3.

   Verifies the layer-registry contract that the canvas spine + render
   block + future tab strip + future snapshot-refine patch system all
   consume. The registry is the single source of truth: a layer
   appears in the spine when `when(shared)` is true, and the matching
   JSX wrapper in AnswerCanvas.jsx renders under the same predicate.
   Drift between the two is the bug class this test guards against. */

import { describe, expect, it } from "vitest";
import { LAYERS } from "../src/components/AnswerCanvas.jsx";

const VALID_GROUPS = new Set(["core", "risks", "duration", "local", "special", "evidence"]);

describe("AnswerCanvas LAYERS registry", () => {
  it("exports a non-empty array", () => {
    expect(Array.isArray(LAYERS)).toBe(true);
    expect(LAYERS.length).toBeGreaterThan(0);
  });

  it("every entry has the required shape", () => {
    for (const layer of LAYERS) {
      expect(typeof layer.id, `${layer.id}.id`).toBe("string");
      expect(layer.id.length, `${layer.id}.id non-empty`).toBeGreaterThan(0);
      expect(VALID_GROUPS.has(layer.group), `${layer.id}.group "${layer.group}" must be one of ${[...VALID_GROUPS].join("/")}`).toBe(true);
      expect(typeof layer.when, `${layer.id}.when`).toBe("function");
      // spineLabel is optional. When present it can be a string or a
      // function(shared)→string. No entry today omits it but the
      // contract permits surfaceless layers.
      if (layer.spineLabel != null) {
        const t = typeof layer.spineLabel;
        expect(t === "string" || t === "function", `${layer.id}.spineLabel must be string|function, got ${t}`).toBe(true);
      }
    }
  });

  it("duplicate ids are restricted to ans-duration with mutually exclusive predicates", () => {
    const idCounts = new Map();
    for (const layer of LAYERS) {
      idCounts.set(layer.id, (idCounts.get(layer.id) || 0) + 1);
    }
    for (const [id, count] of idCounts) {
      if (count > 1) {
        expect(id, `duplicate id "${id}" not allowed`).toBe("ans-duration");
        const dupes = LAYERS.filter((L) => L.id === id);
        expect(dupes.length).toBe(2);
        // Build a shared-bag with _duration present, then absent.
        const withDuration = { _duration: { headline: "test" }, _shared: true };
        const withoutDuration = { _duration: null, _shared: true };
        const matchesWith = dupes.filter((L) => L.when(withDuration));
        const matchesWithout = dupes.filter((L) => L.when(withoutDuration));
        expect(matchesWith.length, "exactly one ans-duration entry fires when _duration is present").toBe(1);
        expect(matchesWithout.length, "exactly one ans-duration entry fires when _duration is absent").toBe(1);
        expect(matchesWith[0]).not.toBe(matchesWithout[0]);
      }
    }
  });

  it("predicates return false on an empty shared bag (graceful-fallback contract)", () => {
    // Construct a minimal shared bag that simulates "nothing authored,
    // no picks, no antibiogram." Layers must not throw on absent
    // arrays / null values; those that gate on data must return false.
    const empty = {
      ans: { ctx: {}, pearls: [] },
      ctx: {},
      antibiogram: null,
      pickedAgents: [],
      _duration: null, _monitoring: null, _research: null, _rationale: null,
      _objections: [], _regional: [], _novel: [], _surgeTier1: [], _surgeOther: [],
      _siteP: [], _pedsPreg: [], _ctxPedsPreg: false, _pedsPregShow: [],
    };
    const visible = LAYERS.filter((L) => L.when(empty));
    // Core sections (Start, Covers, 48–72 h, State) always render.
    // The legacy ans-duration fallback fires when _duration is null.
    // That should be the entire visible set for the empty bag.
    const visibleIds = visible.map((L) => L.id);
    expect(visibleIds).toContain("ans-start");
    expect(visibleIds).toContain("ans-covers");
    expect(visibleIds).toContain("ans-deesc");
    expect(visibleIds).toContain("ans-state");
    expect(visibleIds.filter((id) => id === "ans-duration").length, "legacy ans-duration fires when _duration is null").toBe(1);
    expect(visibleIds, "no other layers render on empty bag").not.toContain("ans-risks");
    expect(visibleIds).not.toContain("ans-rationale");
    expect(visibleIds).not.toContain("ans-objections");
    expect(visibleIds).not.toContain("ans-monitoring");
    expect(visibleIds).not.toContain("ans-antibiogram");
    expect(visibleIds).not.toContain("ans-regional");
    expect(visibleIds).not.toContain("ans-novel");
    expect(visibleIds).not.toContain("ans-surge");
    expect(visibleIds).not.toContain("ans-pedspreg");
    expect(visibleIds).not.toContain("ans-depth");
    expect(visibleIds).not.toContain("ans-pearls");
  });

  it("spineLabel function for ans-pedspreg flips on ctx.pregnancy", () => {
    const layer = LAYERS.find((L) => L.id === "ans-pedspreg");
    expect(typeof layer.spineLabel).toBe("function");
    expect(layer.spineLabel({ ans: { ctx: { pregnancy: true } } })).toBe("Pregnancy");
    expect(layer.spineLabel({ ans: { ctx: { pregnancy: false } } })).toBe("Pediatrics");
  });
});
