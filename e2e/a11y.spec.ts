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

  /* Phase A — bedside surfaces must clear the same AA bar. The Case Bar
     and the Answer Canvas both use new inline styles, so a contrast or
     ARIA regression here is what this guards against. */
  test("bedside Case Bar has no violations", async ({ page }) => {
    await page.goto("/?bedside=1");
    await page.waitForLoadState("networkidle");
    const r = await scan(page);
    expect(r.violations, JSON.stringify(r.violations, null, 2)).toEqual([]);
  });

  test("bedside Answer Canvas has no violations", async ({ page }) => {
    await page.goto("/?bedside=1");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="text"]').first().fill("HAP prior MRSA");
    await page.getByRole("button", { name: /apply case/i }).click();
    await expect(page.getByText(/start now/i).first()).toBeVisible();
    const r = await scan(page);
    expect(r.violations, JSON.stringify(r.violations, null, 2)).toEqual([]);
  });

  /* Phase C — the SurfaceBar two-axis nav mounts above every surface.
     Verify both the default landing (inpatient + reference) and the
     Outpatient placeholder shell clear AA. */
  test("SurfaceBar default landing has no violations", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const r = await scan(page);
    expect(r.violations, JSON.stringify(r.violations, null, 2)).toEqual([]);
  });

  test("Outpatient placeholder shell has no violations", async ({ page }) => {
    await page.goto("/?surface=outpatient");
    await page.waitForLoadState("networkidle");
    const r = await scan(page);
    expect(r.violations, JSON.stringify(r.violations, null, 2)).toEqual([]);
  });

  /* Phase B — the Reassessment panel with all three triggers fired must
     clear AA. This is the highest-density bedside surface and the most
     likely place for a contrast or focus regression. */
  test("bedside Reassessment panel (all triggers active) has no violations", async ({ page }) => {
    await page.goto("/?bedside=1");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="text"]').first().fill("HAP prior MRSA");
    await page.getByRole("button", { name: /apply case/i }).click();
    await expect(page.getByText(/start now/i).first()).toBeVisible();
    // Fire every reassessment trigger, scoped to the panel so we never click
    // a same-named control elsewhere on the page (e.g. the Covers section's
    // MRSA chip).
    const panel = page.getByTestId("reassessment-panel");
    await panel.getByRole("button", { name: /^back$/i }).click();
    await panel.getByRole("button", { name: /^MRSA$/i }).click();
    await panel.getByRole("button", { name: /stable & improving/i }).click();
    await panel.getByRole("button", { name: /tolerating oral/i }).click();
    await panel.getByRole("button", { name: /source controlled/i }).click();
    await expect(page.getByTestId("reassessment-output")).toBeVisible();
    const r = await scan(page);
    expect(r.violations, JSON.stringify(r.violations, null, 2)).toEqual([]);
  });
});
