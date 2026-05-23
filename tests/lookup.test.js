import { describe, it, expect } from "vitest";
import { drugLookup, orgLookup, drugCoversOrg, drugRoute } from "../src/engines/lookup.js";

/* Knowledge-graph lookups and the spectrum-derived coverage predicate. These
   are the joins the drawer and the de-escalation suggester depend on; a wrong
   answer here is a wrong answer at the bedside, so the assertions are concrete
   microbiology, not smoke tests. */

describe("drugLookup", () => {
  it("resolves a formulary β-lactam to a non-empty monograph", () => {
    const lk = drugLookup("Cefepime");
    expect(lk).toBeTruthy();
    expect(lk.form).toBeTruthy();
    expect(lk.form.name).toBe("Cefepime");
    expect(lk.spx).toBeTruthy(); // also present in the spectrum matrix
  });

  it("is tolerant of route suffixes and case", () => {
    expect(drugLookup("cefepime (IV)")).toBeTruthy();
    expect(drugLookup("VANCOMYCIN")).toBeTruthy();
  });

  it("returns a falsy/empty monograph for a non-drug string", () => {
    const lk = drugLookup("not-a-drug-xyzzy");
    const empty = !lk || !(lk.form || lk.spx || lk.pen || lk.tox);
    expect(empty).toBe(true);
  });
});

describe("orgLookup", () => {
  it("resolves curated organism ids to a labeled card", () => {
    expect(orgLookup("pseudo").label).toMatch(/aeruginosa/i);
    expect(orgLookup("mrsa").label).toMatch(/mrsa/i);
    expect(orgLookup("entero").label).toMatch(/enterobacterales/i);
  });

  it("returns null for an unknown id", () => {
    expect(orgLookup("not-an-org")).toBeNull();
  });
});

describe("drugCoversOrg — coverage predicate", () => {
  it("knows antipseudomonal agents cover P. aeruginosa", () => {
    expect(drugCoversOrg("Cefepime", "pseudo")).toBe(true);
    expect(drugCoversOrg("Meropenem", "pseudo")).toBe(true);
  });

  it("knows agents WITHOUT antipseudomonal activity do not cover it", () => {
    expect(drugCoversOrg("Metronidazole", "pseudo")).toBe(false);
    expect(drugCoversOrg("Ceftriaxone", "pseudo")).toBe(false);
  });

  it("knows only anti-MRSA agents cover MRSA", () => {
    expect(drugCoversOrg("Vancomycin", "mrsa")).toBe(true);
    expect(drugCoversOrg("Ceftriaxone", "mrsa")).toBe(false); // classic teaching point
  });

  it("knows metronidazole covers anaerobes but cephalosporins need it added", () => {
    expect(drugCoversOrg("Metronidazole", "anaerobe")).toBe(true);
    expect(drugCoversOrg("Ceftriaxone", "anaerobe")).toBe(false);
  });
});

describe("drugRoute", () => {
  it("returns route metadata for a known agent without throwing on unknowns", () => {
    expect(() => drugRoute("Cefepime")).not.toThrow();
    expect(() => drugRoute("not-a-drug")).not.toThrow();
  });
});
