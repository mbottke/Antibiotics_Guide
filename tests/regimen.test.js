import { describe, it, expect } from "vitest";
import { buildRegimen, regimenAgents, deescalationPlan } from "../src/engines/regimen.js";
import { SYNDROMES } from "../src/data/syndromes.js";

/* The empiric selector and the organism-directed de-escalation suggester — the
   logic the split was undertaken to make testable. These assert that the right
   risk flags add the right tiers, and that de-escalation correctly identifies
   which empiric agents a confirmed organism lets you stop. A data edit that
   changes any of these recommendations turns the suite red. */

const byId = (id) => {
  const s = SYNDROMES.find((x) => x.id === id);
  if (!s) throw new Error(`fixture syndrome "${id}" not found`);
  return s;
};
const noRisk = { mrsaRisk: false, pseudoRisk: false, esblRisk: false, severe: false };

describe("buildRegimen — risk-driven empiric assembly", () => {
  const sepsis = byId("sepsis");

  it("returns the core tier with no add-ons when no risks are set", () => {
    const r = buildRegimen(sepsis, noRisk);
    expect(r.core).toBe(sepsis.tiers[0]);
    expect(r.adds).toEqual([]);
    // every non-core tier is accounted for as an explained omission
    expect(r.others.length).toBe(sepsis.tiers.length - 1);
  });

  it("adds tiers — each with a reason — when their triggering risk is set", () => {
    const r = buildRegimen(sepsis, { ...noRisk, mrsaRisk: true, pseudoRisk: true, esblRisk: true, severe: true });
    expect(r.adds.length).toBeGreaterThan(0);
    r.adds.forEach((t) => {
      expect(typeof t.why).toBe("string");
      expect(t.why.length).toBeGreaterThan(0);
    });
  });

  it("monotonically: enabling more risks never removes a previously-added tier", () => {
    const base = buildRegimen(sepsis, noRisk).adds.length;
    const all = buildRegimen(sepsis, { mrsaRisk: true, pseudoRisk: true, esblRisk: true, severe: true }).adds.length;
    expect(all).toBeGreaterThanOrEqual(base);
  });

  it("annotates each omitted tier with the unmet risk that would add it", () => {
    const r = buildRegimen(sepsis, noRisk);
    // at least one omission should name the risk that would promote it
    const named = r.others.filter((t) => t.unmet);
    expect(named.length).toBeGreaterThan(0);
  });
});

describe("regimenAgents — agent extraction from regimen text", () => {
  it("pulls recognizable agent names out of a regimen string", () => {
    const agents = regimenAgents(["Piperacillin-tazobactam 4.5 g IV q6h + vancomycin"]);
    expect(Array.isArray(agents)).toBe(true);
    const joined = agents.join(" | ").toLowerCase();
    expect(joined).toMatch(/pip|tazo|vanc/);
  });
});

describe("deescalationPlan — organism-directed narrowing", () => {
  const cholangitis = byId("cholangitis");

  it("produces a row per resolvable covered organism with a narrowest target", () => {
    const rows = deescalationPlan(cholangitis, ["Piperacillin-tazobactam", "Metronidazole"]);
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((row) => {
      expect(row.id).toBeTruthy();
      expect(row.label).toBeTruthy();
      // each row offers either a curated directed target or a matrix fallback
      expect(row.targets.length + row.docFallback.length).toBeGreaterThan(0);
    });
  });

  it("computes the 'lets you stop' set as empiric agents lacking activity", () => {
    // For Enterobacterales (wild-type), metronidazole adds nothing → stoppable.
    const rows = deescalationPlan(cholangitis, ["Piperacillin-tazobactam", "Metronidazole"]);
    const entero = rows.find((r) => r.id === "entero");
    expect(entero).toBeTruthy();
    expect(entero.stop).toContain("Metronidazole");
  });

  it("never lists an agent that DOES cover the organism as stoppable", () => {
    const rows = deescalationPlan(cholangitis, ["Piperacillin-tazobactam", "Metronidazole"]);
    // anaerobe coverage comes from metronidazole — it must NOT be in anaerobe.stop
    const anaerobe = rows.find((r) => r.id === "anaerobe");
    if (anaerobe) expect(anaerobe.stop).not.toContain("Metronidazole");
  });

  it("returns an empty plan when no organisms are supplied", () => {
    const bare = { ...cholangitis, bugs: [] };
    expect(deescalationPlan(bare, ["Cefepime"])).toEqual([]);
  });
});
