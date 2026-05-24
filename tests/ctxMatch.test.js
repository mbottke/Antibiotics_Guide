/* tests · ctxMatch — coverage for the Phase D3.4 patient-state-aware
   predicate evaluator. Covers the full comparator surface (lt / lte /
   gt / gte / eq / between / in / constant-equality), AND-across-keys
   semantics, OR-via-{any:[]}, defensive nulls, and the field-missing
   safety contract. The evaluator runs on every content render so any
   regression here would silently elevate or fail to elevate items
   across the entire app surface. */
import { describe, expect, test } from "vitest";
import { matchesCtx } from "../src/engines/ctxMatch.js";

describe("matchesCtx — numeric comparators", () => {
  test("lt — strictly less than", () => {
    expect(matchesCtx({ crcl: { lt: 60 } }, { crcl: 45 })).toBe(true);
    expect(matchesCtx({ crcl: { lt: 60 } }, { crcl: 60 })).toBe(false);
    expect(matchesCtx({ crcl: { lt: 60 } }, { crcl: 80 })).toBe(false);
  });

  test("lte — less than or equal", () => {
    expect(matchesCtx({ crcl: { lte: 60 } }, { crcl: 60 })).toBe(true);
    expect(matchesCtx({ crcl: { lte: 60 } }, { crcl: 61 })).toBe(false);
  });

  test("gt — strictly greater than", () => {
    expect(matchesCtx({ age: { gt: 65 } }, { age: 70 })).toBe(true);
    expect(matchesCtx({ age: { gt: 65 } }, { age: 65 })).toBe(false);
  });

  test("gte — greater than or equal", () => {
    expect(matchesCtx({ age: { gte: 65 } }, { age: 65 })).toBe(true);
    expect(matchesCtx({ age: { gte: 65 } }, { age: 64 })).toBe(false);
  });

  test("eq — strict equality", () => {
    expect(matchesCtx({ age: { eq: 18 } }, { age: 18 })).toBe(true);
    expect(matchesCtx({ age: { eq: 18 } }, { age: 19 })).toBe(false);
  });

  test("between — inclusive range", () => {
    expect(matchesCtx({ crcl: { between: [30, 60] } }, { crcl: 30 })).toBe(true);
    expect(matchesCtx({ crcl: { between: [30, 60] } }, { crcl: 60 })).toBe(true);
    expect(matchesCtx({ crcl: { between: [30, 60] } }, { crcl: 45 })).toBe(true);
    expect(matchesCtx({ crcl: { between: [30, 60] } }, { crcl: 29 })).toBe(false);
    expect(matchesCtx({ crcl: { between: [30, 60] } }, { crcl: 61 })).toBe(false);
  });
});

describe("matchesCtx — string / boolean / set", () => {
  test("constant string equality", () => {
    expect(matchesCtx({ blAllergy: "severe" }, { blAllergy: "severe" })).toBe(true);
    expect(matchesCtx({ blAllergy: "severe" }, { blAllergy: "mild" })).toBe(false);
    expect(matchesCtx({ blAllergy: "severe" }, { blAllergy: null })).toBe(false);
  });

  test("constant boolean equality", () => {
    expect(matchesCtx({ hd: true }, { hd: true })).toBe(true);
    expect(matchesCtx({ hd: true }, { hd: false })).toBe(false);
    expect(matchesCtx({ hd: true }, { hd: undefined })).toBe(false);
  });

  test("in — set membership", () => {
    expect(matchesCtx({ hepStage: { in: ["B", "C"] } }, { hepStage: "B" })).toBe(true);
    expect(matchesCtx({ hepStage: { in: ["B", "C"] } }, { hepStage: "A" })).toBe(false);
  });
});

describe("matchesCtx — AND across keys (default)", () => {
  test("all keys must satisfy", () => {
    const pred = { crcl: { lt: 60 }, severe: true };
    expect(matchesCtx(pred, { crcl: 45, severe: true })).toBe(true);
    expect(matchesCtx(pred, { crcl: 45, severe: false })).toBe(false);
    expect(matchesCtx(pred, { crcl: 80, severe: true })).toBe(false);
  });
});

describe("matchesCtx — OR via { any: [...] }", () => {
  test("any — at least one branch must hold", () => {
    const pred = { any: [{ crcl: { lt: 30 } }, { hd: true }] };
    expect(matchesCtx(pred, { crcl: 25, hd: false })).toBe(true);
    expect(matchesCtx(pred, { crcl: 80, hd: true  })).toBe(true);
    expect(matchesCtx(pred, { crcl: 80, hd: false })).toBe(false);
  });

  test("any combined with sibling AND key", () => {
    const pred = {
      severe: true,
      any: [{ crcl: { lt: 60 } }, { age: { gte: 80 } }],
    };
    expect(matchesCtx(pred, { severe: true,  crcl: 45, age: 50 })).toBe(true);
    expect(matchesCtx(pred, { severe: true,  crcl: 80, age: 85 })).toBe(true);
    expect(matchesCtx(pred, { severe: false, crcl: 45, age: 85 })).toBe(false);
    expect(matchesCtx(pred, { severe: true,  crcl: 80, age: 50 })).toBe(false);
  });
});

describe("matchesCtx — defensive / safety contract", () => {
  test("null / undefined predicate → false", () => {
    expect(matchesCtx(null, { crcl: 50 })).toBe(false);
    expect(matchesCtx(undefined, { crcl: 50 })).toBe(false);
  });

  test("null / undefined ctx → false", () => {
    expect(matchesCtx({ crcl: { lt: 60 } }, null)).toBe(false);
    expect(matchesCtx({ crcl: { lt: 60 } }, undefined)).toBe(false);
  });

  test("ctx field missing → false (NOT thrown)", () => {
    expect(matchesCtx({ pregnancy: "3rd" }, { age: 30 })).toBe(false);
  });

  test("malformed between → false (safe)", () => {
    expect(matchesCtx({ crcl: { between: [30] } }, { crcl: 45 })).toBe(false);
    expect(matchesCtx({ crcl: { between: "not-array" } }, { crcl: 45 })).toBe(false);
  });

  test("unknown comparator key ignored (other valid keys still apply)", () => {
    expect(matchesCtx({ crcl: { lt: 60, futureKey: "x" } }, { crcl: 45 })).toBe(true);
  });
});
