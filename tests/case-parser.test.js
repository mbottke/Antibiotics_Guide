import { describe, it, expect } from "vitest";
import { parseCase } from "../src/engines/case-parser.js";

/* Phase A.1 acceptance — the case parser must round-trip the
   representative bedside case shorthands into a partial caseState that
   the Case Bar can render as chips and that the Answer Canvas can feed
   straight into the existing buildRegimen / refineRegimen engines.

   These cases are the parser's contract. New patterns added to
   case-parser.js should bring their own test row; a regression here
   will turn red with a precise field-level message. */

describe("parseCase — bedside shorthand", () => {
  it("handles the canonical 72M PNA prior MRSA CrCl 35 case", () => {
    const r = parseCase("72M PNA prior MRSA CrCl 35");
    expect(r.patient.age).toBe(72);
    expect(r.patient.sex).toBe("M");
    expect(r.patient.mrsaRisk).toBe(true);
    expect(r.syndrome).toBe("cap");
    // CrCl back-calc requires weight; with only age + sex we cannot derive SCr
    // (we never silently fabricate). SCr must remain undefined.
    expect(r.patient.scr).toBeUndefined();
    // Chips list every claim so the UI can render them.
    expect(r.chips.some(c => c.kind === "demo")).toBe(true);
    expect(r.chips.some(c => c.kind === "risk" && /MRSA/i.test(c.label))).toBe(true);
    expect(r.chips.some(c => c.kind === "lab" && /CrCl/i.test(c.label))).toBe(true);
    expect(r.chips.some(c => c.kind === "syndrome")).toBe(true);
  });

  it("back-calculates SCr from CrCl when age + weight + sex are all present", () => {
    const r = parseCase("72M 80 kg PNA CrCl 35");
    expect(r.patient.age).toBe(72);
    expect(r.patient.sex).toBe("M");
    expect(r.patient.weightKg).toBe(80);
    // CG inverted: (140-72)*80 / (72*35) = 5440/2520 = 2.158... → 2.2
    expect(r.patient.scr).toBeCloseTo(2.2, 1);
  });

  it("applies the 0.85 female coefficient in the CrCl back-calc", () => {
    const m = parseCase("70M 80 kg CrCl 50").patient.scr;
    const f = parseCase("70F 80 kg CrCl 50").patient.scr;
    // Female should require a LOWER scr to produce the same crcl (because
    // the female coefficient reduces clearance). i.e. f < m.
    expect(f).toBeLessThan(m);
  });

  it("parses a UTI case with age + sex + direct SCr", () => {
    const r = parseCase("65F UTI SCr 1.4");
    expect(r.patient.age).toBe(65);
    expect(r.patient.sex).toBe("F");
    expect(r.patient.scr).toBe(1.4);
    expect(r.syndrome).toBe("cystitis");
  });

  it("routes septic shock to sepsis with severe=true", () => {
    const r = parseCase("septic shock prior ESBL");
    expect(r.syndrome).toBe("sepsis");
    expect(r.patient.severe).toBe(true);
    expect(r.patient.esblRisk).toBe(true);
  });

  it("recognizes HAP and the on-HD flag", () => {
    const r = parseCase("HAP on HD");
    expect(r.syndrome).toBe("hap");
    expect(r.patient.hd).toBe(true);
  });

  it("classes a low-risk β-lactam allergy as mild", () => {
    const r = parseCase("CAP penicillin rash");
    expect(r.syndrome).toBe("cap");
    expect(r.patient.blAllergy).toBe("mild");
  });

  it("classes a SCAR / anaphylaxis as severe", () => {
    const r = parseCase("endocarditis SJS to ampicillin");
    expect(r.syndrome).toBe("ie");
    expect(r.patient.blAllergy).toBe("severe");
  });

  it("parses pyelonephritis with weight + SCr", () => {
    const r = parseCase("70F 80 kg pyelo SCr 1.8");
    expect(r.patient.age).toBe(70);
    expect(r.patient.sex).toBe("F");
    expect(r.patient.weightKg).toBe(80);
    expect(r.patient.scr).toBe(1.8);
    expect(r.syndrome).toBe("pyelo");
  });

  it("routes neutropenic fever to the neutropenic sepsis card", () => {
    const r = parseCase("neutropenic fever 50yo male");
    expect(r.syndrome).toBe("sepsis-neutropenic");
    expect(r.patient.age).toBe(50);
    expect(r.patient.sex).toBe("M");
  });

  it("classes Child-Pugh C cirrhosis as severe hepatic", () => {
    const r = parseCase("SBP CP-C cirrhosis 60M");
    expect(r.syndrome).toBe("sbp");
    expect(r.patient.hepatic).toBe("severe");
  });

  it("recognizes cellulitis with an MRSA history", () => {
    const r = parseCase("cellulitis MRSA history");
    expect(r.syndrome).toBe("cellulitis");
    expect(r.patient.mrsaRisk).toBe(true);
  });

  it("returns an empty result for empty input rather than throwing", () => {
    expect(parseCase("").syndrome).toBeNull();
    expect(parseCase(null).syndrome).toBeNull();
    expect(parseCase(undefined).chips).toEqual([]);
  });

  it("marks patient.on whenever any patient field is parsed", () => {
    expect(parseCase("72M PNA").patient.on).toBe(true);
    // A pure-syndrome input populates only patient.severe via the keyword
    // map (septic shock case). For a plain syndrome name without
    // demographics, no patient field is set → on stays undefined.
    const justSyn = parseCase("cellulitis");
    expect(justSyn.patient.on).toBeUndefined();
  });

  it("preserves the rump of input it could not parse, for UI correction", () => {
    const r = parseCase("72M PNA with productive cough and pleuritic chest pain");
    // Demographics + syndrome are claimed; the descriptive prose remains
    // in the rump so the Case Bar can prompt the user to flag risk
    // factors manually.
    expect(r.rump).toMatch(/cough|pleuritic/i);
  });

  it("classes meningitis correctly even at the end of a complex string", () => {
    const r = parseCase("immunosuppressed 60F with meningitis");
    expect(r.syndrome).toBe("meningitis");
    expect(r.patient.age).toBe(60);
    expect(r.patient.sex).toBe("F");
  });

  it("does not match a syndrome when none is present", () => {
    expect(parseCase("72M with general malaise").syndrome).toBeNull();
  });
});
