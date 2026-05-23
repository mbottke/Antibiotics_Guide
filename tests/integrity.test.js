import { describe, it, expect } from "vitest";
import { checkIntegrity, integrityLine } from "../src/engines/integrity.js";

/* The integrity gate. This is the headless, build-failing twin of the on-mount
   self-check in App.jsx — same computation (engines/integrity.js), but here a
   broken cross-reference fails the suite instead of whispering in the console.

   A content edit that introduces an unknown bug-id, an unresolvable dose-table
   agent, a dangling guideline reference, or a duplicate syndrome id will turn
   this red with a precise, actionable message. */

describe("referential integrity", () => {
  const result = checkIntegrity();

  it("has no referential problems", () => {
    if (!result.ok) {
      // Surface every problem in the failure output, not just the first.
      throw new Error(integrityLine(result));
    }
    expect(result.ok).toBe(true);
    expect(result.problems).toEqual([]);
  });

  it("covers the expected content surface (guards against silent data loss)", () => {
    // Floor values, not exact counts — they catch a table being emptied or an
    // import silently resolving to undefined, without breaking on legitimate
    // content growth.
    expect(result.stats.syndromes).toBeGreaterThanOrEqual(100);
    expect(result.stats.guidelines).toBeGreaterThanOrEqual(20);
    expect(result.stats.doseAgents).toBeGreaterThanOrEqual(20);
    expect(result.stats.orgXwalk).toBeGreaterThanOrEqual(10);
  });
});
