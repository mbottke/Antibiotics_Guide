/* test · AnswerCanvas LAYERS registry — Wave 5 PR-3.

   Verifies the layer-registry contract that the canvas spine + render
   block + future tab strip + future snapshot-refine patch system all
   consume. The registry is the single source of truth: a layer
   appears in the spine when `when(shared)` is true, and the matching
   JSX wrapper in AnswerCanvas.jsx renders under the same predicate.
   Drift between the two is the bug class this test guards against. */

import { describe, expect, it } from "vitest";
import React from "react";
import { LAYERS } from "../src/components/answer-layers/_index.js";

const VALID_GROUPS = new Set(["core", "risks", "duration", "local", "special", "evidence"]);

/* A fully-populated shared bag for the per-layer render smoke tests.
   Every render function must produce a React element (or null) when
   handed this bag. The point of these tests is structural: catch
   crashes, undefined accesses, missing imports — not behavioral
   correctness. Behavioral correctness is covered by the e2e
   baseline (62 desktop / 26 mobile) which mounts the full canvas
   in a real browser. */
function makeSharedBag(overrides = {}) {
  const ans = {
    syndrome: { id: "test-syn", name: "Test", line: "test line", cover: { empiric: "empiric", drop: "drop" }, deesc: "deesc", duration: "5 d", evidence: null },
    ctx: { on: false, pregnancy: false },
    d: { crcl: null },
    core: { k: "Core", rx: "ceftriaxone", note: null },
    adds: [],
    bugs: [],
    deesc: [],
    sourceControl: null,
    refinement: { steps: [] },
    pearls: [],
    empiricAgents: [],
  };
  return {
    ans,
    s: ans.syndrome,
    ctx: ans.ctx,
    pickedAgents: [],
    effectiveBranch: null,
    handleBranchSelect: () => {},
    startDate: "",
    setStartDate: () => {},
    picksByTier: {},
    setTierPick: () => () => {},
    caseState: { startDate: null },
    setCaseState: () => {},
    antibiogram: null,
    onDrug: () => {},
    onOrg: () => {},
    onCite: () => {},
    onOpenAntibiogramManager: () => {},
    allergy: null,
    dose: () => null,
    coreRefinements: [],
    _duration: null,
    _monitoring: null,
    _research: null,
    _rationale: null,
    _objections: [],
    _regional: [],
    _novel: [],
    _surgeTier1: [],
    _surgeOther: [],
    _siteP: [],
    _pedsPreg: [],
    _ctxPedsPreg: false,
    _pedsPregShow: [],
    ...overrides,
  };
}

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

  it("every layer has a render function", () => {
    for (const layer of LAYERS) {
      expect(typeof layer.render, `${layer.id}.render`).toBe("function");
    }
  });
});

/* Per-layer render smoke tests. Each test invokes the layer's render
   function with a complete shared bag and verifies it produces a
   React element (or null when the layer's data is absent and the
   render function chooses to bail). These are structural checks —
   they guard against crashes, undefined accesses, missing imports,
   and refactor regressions where a render function references a
   field the shared bag does not expose. Behavioral correctness
   (visual output, interactivity) is covered by the e2e baseline. */
describe("AnswerCanvas layer render functions", () => {
  it("every layer's render produces a React element or null on an empty-but-shaped bag", () => {
    const bag = makeSharedBag();
    for (const layer of LAYERS) {
      const out = layer.render(bag);
      const ok = out === null || React.isValidElement(out);
      expect(ok, `${layer.id}.render must return null or a React element; got ${typeof out}`).toBe(true);
    }
  });

  it("renderSourceControl returns null when ans.sourceControl is absent", () => {
    const layer = LAYERS.find((L) => L.id === "ans-source-control");
    const bag = makeSharedBag();
    expect(layer.render(bag)).toBeNull();
  });

  it("renderSourceControl returns a React element when ans.sourceControl is present", () => {
    const layer = LAYERS.find((L) => L.id === "ans-source-control");
    const bag = makeSharedBag({ ans: { ...makeSharedBag().ans, sourceControl: "Drain the abscess." } });
    const out = layer.render(bag);
    expect(React.isValidElement(out)).toBe(true);
  });

  it("renderStart consumes the bag's ans/allergy/onDrug/dose/setTierPick/s without crashing", () => {
    const layer = LAYERS.find((L) => L.id === "ans-start");
    const bag = makeSharedBag();
    const out = layer.render(bag);
    expect(React.isValidElement(out)).toBe(true);
  });

  it("renderDurationStructured threads _duration/pickedBranch/handleBranchSelect/startDate/setStartDate", () => {
    const layer = LAYERS.find((L) => L.id === "ans-duration" && L.when({ _duration: { headline: "x" } }));
    expect(layer).toBeDefined();
    const bag = makeSharedBag({ _duration: { headline: "5 d", evidence: "test", branches: [], stopWhen: [], extendIf: [] } });
    const out = layer.render(bag);
    expect(React.isValidElement(out)).toBe(true);
  });

  it("renderDurationLegacy fires only when _duration is absent and renders s.duration", () => {
    const dupes = LAYERS.filter((L) => L.id === "ans-duration");
    expect(dupes.length).toBe(2);
    const legacy = dupes.find((L) => L.when({ _duration: null }));
    expect(legacy).toBeDefined();
    const bag = makeSharedBag();
    const out = legacy.render(bag);
    expect(React.isValidElement(out)).toBe(true);
  });

  it("renderPearls renders only when ans.pearls has entries (gate is in `when`, not in render)", () => {
    const layer = LAYERS.find((L) => L.id === "ans-pearls");
    // Render still produces a React element even with empty pearls;
    // the `when` predicate is what gates visibility.
    const bag = makeSharedBag();
    expect(React.isValidElement(layer.render(bag))).toBe(true);
    // And the predicate gates correctly.
    expect(layer.when(makeSharedBag())).toBe(false);
    expect(layer.when(makeSharedBag({ ans: { ...makeSharedBag().ans, pearls: ["a pearl"] } }))).toBe(true);
  });
});
