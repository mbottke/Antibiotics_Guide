import { test, expect } from "@playwright/test";

/* Render gate. Opens the assembled-regimen drawer for a representative syndrome
   from every category (plus the feature-bearing fixtures) and asserts the drawer
   renders real content with zero console errors / uncaught exceptions. This is
   the runtime complement to the headless integrity gate: integrity proves the
   data resolves; this proves the components render it without throwing. */

// One representative per category keeps the gate fast while covering every
// rendering path; the explicit fixtures exercise de-escalation + dose-adjust.
const FIXTURES = [
  "sepsis", "cap", "hap", "cholangitis", "meningitis",
  "cellulitis", "pyelo", "ie", "cdiff", "osteo",
];

test.describe("regimen drawer renders without runtime errors", () => {
  for (const syn of FIXTURES) {
    test(`assembles "${syn}" cleanly`, async ({ page }) => {
      const errors = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      page.on("pageerror", (e) => errors.push(`PAGEERROR ${e.message}`));

      await page.goto("/#t=empiric&syn=" + syn + "&ctx=70:90:175:2.2:M:none:none");
      await page.waitForLoadState("networkidle");

      // Select the syndrome (the option exists because integrity guarantees the id)
      // and assemble. The select carries every syndrome grouped by category.
      const select = page.locator(".rx-builder select").first();
      await select.selectOption(syn);
      await page.getByRole("button", { name: /assemble regimen/i }).click();

      // Drawer opens with the regimen card; assert it carries real content.
      const drawer = page.locator(".rx-drawer, [role='dialog']").first();
      await expect(drawer).toBeVisible();
      await expect(drawer).toContainText(/regimen|empiric|core/i);

      expect(errors, errors.join("\n")).toEqual([]);
    });
  }

  test("de-escalation suggester renders rows for a polymicrobial syndrome", async ({ page }) => {
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(`PAGEERROR ${e.message}`));

    await page.goto("/#t=empiric&syn=cholangitis&ctx=70:90:175:2.2:M:none:none");
    await page.waitForLoadState("networkidle");
    await page.locator(".rx-builder select").first().selectOption("cholangitis");
    await page.getByRole("button", { name: /assemble regimen/i }).click();

    const rows = page.locator(".rx-deesc-row");
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeGreaterThan(0);
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("logs the clean integrity line on load", async ({ page }) => {
    const info = [];
    page.on("console", (m) => (m.type() === "info" || m.type() === "log") && info.push(m.text()));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(info.some((l) => /integrity check: clean/.test(l))).toBe(true);
  });

  // No horizontal page overflow on any primary surface. This is the high-value
  // mobile-only check (axe + error-listening don't catch layout overflow); it
  // matters at the narrow viewport where the responsive grids must collapse.
  for (const [name, hash] of [["approach", "#t=approach"], ["empiric", "#t=empiric"], ["spectrum", "#t=spectrum"], ["course", "#t=course"]]) {
    test(`no horizontal overflow on ${name}`, async ({ page }) => {
      await page.goto("/" + hash);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => {
        const de = document.documentElement;
        return de.scrollWidth - de.clientWidth;
      });
      // allow 1px for sub-pixel rounding
      expect(overflow, `page overflows its viewport by ${overflow}px`).toBeLessThanOrEqual(1);
    });
  }
});

/* Bedside mode (Phase A) — the new case-driven surface behind `?bedside=1`.
   Runs against both the desktop and mobile projects defined in
   playwright.config.ts so the responsive layout is exercised, not just
   asserted to exist. */
test.describe("bedside mode renders without runtime errors", () => {
  test("Case Bar mounts on initial load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(`PAGEERROR ${e.message}`));

    await page.goto("/?bedside=1");
    await page.waitForLoadState("networkidle");

    // The Case Bar reuses the rx-builder shell; "Describe the case" is its
    // headline so this also asserts the header copy lands.
    await expect(page.getByText(/describe the case/i)).toBeVisible();
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("typing a case populates the parsed-chip preview", async ({ page }) => {
    await page.goto("/?bedside=1");
    await page.waitForLoadState("networkidle");

    const input = page.locator('input[type="text"]').first();
    await input.fill("72M HAP prior MRSA CrCl 35");

    // After typing, the parser fires and the "Parsed" label appears.
    await expect(page.getByText(/parsed/i).first()).toBeVisible();
  });

  test("applying a parsed case opens the Answer Canvas", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(`PAGEERROR ${e.message}`));

    await page.goto("/?bedside=1");
    await page.waitForLoadState("networkidle");

    const input = page.locator('input[type="text"]').first();
    await input.fill("HAP prior MRSA");
    // Apply the parsed case.
    await page.getByRole("button", { name: /apply case/i }).click();

    // The answer canvas headline strip kicker says "The answer".
    await expect(page.getByText(/the answer/i).first()).toBeVisible();
    // It surfaces the regimen prose.
    await expect(page.getByText(/start now/i).first()).toBeVisible();

    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("no horizontal overflow on the bedside surface", async ({ page }) => {
    await page.goto("/?bedside=1");
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      return de.scrollWidth - de.clientWidth;
    });
    expect(overflow, `bedside overflows its viewport by ${overflow}px`).toBeLessThanOrEqual(1);
  });

  test("no horizontal overflow after the Answer Canvas mounts", async ({ page }) => {
    await page.goto("/?bedside=1");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="text"]').first().fill("HAP prior MRSA");
    await page.getByRole("button", { name: /apply case/i }).click();
    await expect(page.getByText(/start now/i).first()).toBeVisible();
    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      return de.scrollWidth - de.clientWidth;
    });
    expect(overflow, `bedside answer canvas overflows by ${overflow}px`).toBeLessThanOrEqual(1);
  });
});
