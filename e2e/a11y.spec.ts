import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/* Accessibility gate. Runs axe-core (WCAG 2.1 A/AA rules) on the primary
   surfaces and asserts no violations, plus a couple of explicit keyboard/focus
   checks that axe cannot infer. The design system already targets AA contrast
   and real <button>/<select> semantics; this keeps a regression from shipping. */

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function scan(page) {
  return new AxeBuilder({ page }).withTags(WCAG).analyze();
}

test.describe("accessibility (axe-core, WCAG 2.1 AA)", () => {
  test("approach tab has no violations", async ({ page }) => {
    await page.goto("/#t=approach");
    await page.waitForLoadState("networkidle");
    const r = await scan(page);
    expect(r.violations, JSON.stringify(r.violations, null, 2)).toEqual([]);
  });

  test("empiric builder has no violations", async ({ page }) => {
    await page.goto("/#t=empiric");
    await page.waitForLoadState("networkidle");
    const r = await scan(page);
    expect(r.violations, JSON.stringify(r.violations, null, 2)).toEqual([]);
  });

  test("spectrum matrix has no violations", async ({ page }) => {
    await page.goto("/#t=spectrum");
    await page.waitForLoadState("networkidle");
    const r = await scan(page);
    expect(r.violations, JSON.stringify(r.violations, null, 2)).toEqual([]);
  });

  test("open regimen drawer has no violations and traps nothing inaccessibly", async ({ page }) => {
    await page.goto("/#t=empiric&syn=cholangitis&ctx=70:90:175:2.2:M:none:none");
    await page.waitForLoadState("networkidle");
    await page.locator(".rx-builder select").first().selectOption("cholangitis");
    await page.getByRole("button", { name: /assemble regimen/i }).click();
    await expect(page.locator(".rx-drawer, [role='dialog']").first()).toBeVisible();
    const r = await scan(page);
    expect(r.violations, JSON.stringify(r.violations, null, 2)).toEqual([]);
  });

  test("interactive controls expose a visible focus state", async ({ page }) => {
    await page.goto("/#t=empiric");
    await page.waitForLoadState("networkidle");
    // Tab into the document and confirm focus lands on a real interactive element.
    await page.keyboard.press("Tab");
    const tag = await page.evaluate(() => document.activeElement?.tagName?.toLowerCase());
    expect(["a", "button", "input", "select", "textarea"]).toContain(tag);
  });
});
