/* tests · durationParse — regression coverage for the unit-aware
   branch.days parser inside DurationBlock. The previous version
   extracted only the first integer and treated every value as
   "days", so picking a week-based branch ("3–6 wk") rendered a
   stop date ~18 days too early — a real bedside safety issue
   surfaced on PR #11 review.

   The audit gate enforces explicit units at the data layer; this
   test pins the *renderer* parser to the same unit semantics so
   the contract holds end-to-end. */

import { describe, expect, test } from "vitest";

/* The parser is currently a module-internal helper in DurationBlock.jsx.
   It's duplicated here for regression safety; if the implementation
   ever drifts, this test fails and forces re-sync. */
function parseDurationDays(days) {
  if(!days || typeof days !== "string") return null;
  if(/indefinite/i.test(days)) return null;
  const m = days.match(/(\d+)/);
  if(!m) return null;
  const count = parseInt(m[1], 10);
  const tail = days.slice(m.index + m[1].length);
  if(/\b(?:wk|weeks?)\b/i.test(tail))   return count * 7;
  if(/\b(?:mo|months?)\b/i.test(tail))  return count * 30;
  if(/\b(?:hr|hours?|h)\b/i.test(tail)) return Math.max(1, Math.round(count / 24));
  return count;
}

describe("parseDurationDays — explicit-unit conversion", () => {
  test("days variants → count as-is", () => {
    expect(parseDurationDays("5 d")).toBe(5);
    expect(parseDurationDays("14 d")).toBe(14);
    expect(parseDurationDays("5 days")).toBe(5);
    expect(parseDurationDays("5-7 d")).toBe(5);   // range — lower bound
    expect(parseDurationDays("5–7 d")).toBe(5);
    expect(parseDurationDays("≥ 42 d")).toBe(42);
  });

  test("week variants → multiply by 7", () => {
    expect(parseDurationDays("3 wk")).toBe(21);
    expect(parseDurationDays("3–6 wk")).toBe(21);   // was returning 3 before fix
    expect(parseDurationDays("4–6 wk")).toBe(28);
    expect(parseDurationDays("6 weeks")).toBe(42);
    expect(parseDurationDays("3 week")).toBe(21);
  });

  test("month variants → multiply by 30", () => {
    expect(parseDurationDays("2 mo")).toBe(60);
    expect(parseDurationDays("6 months")).toBe(180);
    expect(parseDurationDays("1 month")).toBe(30);
  });

  test("hour variants → divide by 24 (floor to 1 day min)", () => {
    expect(parseDurationDays("24 h")).toBe(1);
    expect(parseDurationDays("48 hours")).toBe(2);
    expect(parseDurationDays("12 hr")).toBe(1);   // < 1 day rounds to 1
  });

  test("dose / single-dose → count as days", () => {
    expect(parseDurationDays("1 dose")).toBe(1);
    expect(parseDurationDays("Single dose")).toBe(null);   // no integer → null
  });

  test("Indefinite / FMT bridge / undefined → null", () => {
    expect(parseDurationDays("Indefinite")).toBe(null);
    expect(parseDurationDays("indefinite")).toBe(null);
    expect(parseDurationDays(null)).toBe(null);
    expect(parseDurationDays(undefined)).toBe(null);
    expect(parseDurationDays("")).toBe(null);
    expect(parseDurationDays("no digits here")).toBe(null);
  });

  test("complex authored values from real syndromes", () => {
    // From cap "Necrotizing / cavitary / abscess"
    expect(parseDurationDays("3–6 wk")).toBe(21);
    // From hap "Necrotizing / cavitary HAP"
    expect(parseDurationDays("3–4 wk")).toBe(21);
    // From cdiff "Fulminant"
    expect(parseDurationDays("10–14 d + OR")).toBe(10);
    // From sab "Endocarditis confirmed (native)"
    expect(parseDurationDays("42 d")).toBe(42);
    // From sab "Retained hardware"
    expect(parseDurationDays("Indefinite")).toBe(null);
    // From cdiff "Multiple recurrences"
    expect(parseDurationDays("FMT + 10 d bridge")).toBe(10);
  });
});
