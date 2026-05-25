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

/* Wave 5 CL-2 · OPAT-demotion gate.

   The legacy OPAT constant in src/data/content.js was a general primer
   that became per-syndrome content in PR-8a (OPAT_PROFILES + OPATBlock).
   The legacy constant survives ONLY to render the Principles-page primer.
   Any other consumer (syndrome answer canvas, an answer-layer module, a
   non-Principles section) would resurrect the drift problem PR-8a closed.

   This gate reads the source tree and asserts that only PrinciplesSection
   imports the legacy OPAT identifier from content.js. */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC_ROOT = new URL("../src/", import.meta.url).pathname;
const ALLOWED_IMPORTERS = new Set([
  "src/sections/PrinciplesSection.jsx",
]);

function walkFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkFiles(full, acc);
    else if (/\.(jsx?|tsx?)$/.test(name)) acc.push(full);
  }
  return acc;
}

describe("Wave 5 CL-2 · OPAT demotion gate", () => {
  it("only PrinciplesSection imports the legacy OPAT constant", () => {
    const files = walkFiles(SRC_ROOT);
    const importPattern = /import\s*\{[^}]*\bOPAT\b[^}]*\}\s*from\s*["'][^"']*data\/content["']/;
    const violations = [];
    for (const f of files) {
      const content = readFileSync(f, "utf8");
      if (!importPattern.test(content)) continue;
      const rel = f.slice(f.indexOf("src/"));
      if (!ALLOWED_IMPORTERS.has(rel)) violations.push(rel);
    }
    expect(violations, `legacy OPAT imported outside PrinciplesSection: ${violations.join(", ")}`)
      .toEqual([]);
  });
});
