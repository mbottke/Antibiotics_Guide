import { describe, it, expect } from "vitest";
import { deriveCtx, cockcroftGault, ckdEpi2021, childPugh } from "../src/engines/dosing.js";

/* Pure dosing logic — the math that drives the patient-context bar and the
   per-line dose-adjustment chips. These assert clinical behavior (bands, flags,
   loading vs maintenance), not pixels, and run with no browser. */

describe("Cockcroft–Gault clearance", () => {
  it("computes a plausible CrCl for a typical elderly patient", () => {
    // 70 yo male, 90 kg, SCr 2.2 → moderate impairment
    const crcl = cockcroftGault(70, 90, 2.2, "M");
    expect(crcl).toBeGreaterThan(30);
    expect(crcl).toBeLessThan(55);
  });

  it("applies the 0.85 female coefficient", () => {
    const male = cockcroftGault(60, 80, 1.0, "M");
    const female = cockcroftGault(60, 80, 1.0, "F");
    expect(female).toBeCloseTo(male * 0.85, 0);
  });

  it("returns null on missing/invalid inputs rather than NaN", () => {
    expect(cockcroftGault(undefined, 80, 1.0, "M")).toBeNull();
    expect(cockcroftGault(60, 0, 1.0, "M")).toBeNull();
  });
});

describe("deriveCtx — the single patient-context transform", () => {
  it("bands a moderate-impairment patient and estimates vancomycin q24h", () => {
    const d = deriveCtx({ age: 70, weightKg: 90, heightCm: 175, scr: 2.2, sex: "M", hd: false });
    expect(d.crcl).toBe(40);
    expect(d.crclBand.t).toMatch(/moderate/i);
    expect(d.arc).toBe(false);
    // vancomycin: actual-weight loading band (20–25 mg/kg) and interval set by CrCl
    expect(d.vanco.lo).toBe(1800); // 20 * 90
    expect(d.vanco.hi).toBe(2250); // 25 * 90
    expect(d.vanco.interval).toBe("q24h");
    expect(d.vanco.byLevels).toBe(false);
  });

  it("flags augmented renal clearance in a young patient with low SCr", () => {
    const d = deriveCtx({ age: 25, weightKg: 75, heightCm: 180, scr: 0.5, sex: "M", hd: false });
    expect(d.crcl).toBeGreaterThan(130);
    expect(d.arc).toBe(true);
  });

  it("routes vancomycin to level-guided dosing on hemodialysis", () => {
    const d = deriveCtx({ age: 65, weightKg: 80, heightCm: 175, scr: 5.0, sex: "M", hd: true });
    expect(d.vanco.byLevels).toBe(true);
  });

  it("records an error for implausible weight instead of throwing", () => {
    const d = deriveCtx({ age: 50, weightKg: 999, heightCm: 175, scr: 1.0, sex: "M", hd: false });
    expect(d.errors).toContain("weight");
  });
});

describe("CKD-EPI 2021 (race-free)", () => {
  it("returns a higher eGFR for lower creatinine", () => {
    const better = ckdEpi2021(0.8, 50, "M");
    const worse = ckdEpi2021(2.5, 50, "M");
    expect(better).toBeGreaterThan(worse);
  });
});

describe("Child–Pugh", () => {
  it("scores minimal disease as class A and severe as class C", () => {
    const a = childPugh({ bili: 1, alb: 4.0, inr: 1.0, ascites: "none", enceph: "none" });
    const c = childPugh({ bili: 4, alb: 2.5, inr: 2.5, ascites: "severe", enceph: "severe" });
    expect(a.cls).toBe("A");
    expect(c.cls).toBe("C");
    expect(c.total).toBeGreaterThan(a.total);
    expect(a.stage).toBe("none");
    expect(c.stage).toBe("severe");
  });

  it("returns null until every component is supplied", () => {
    expect(childPugh({ bili: 1, alb: 4.0 })).toBeNull(); // incomplete
    expect(childPugh(null)).toBeNull();
  });
});
