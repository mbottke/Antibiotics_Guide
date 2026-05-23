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

    // The Case Bar mounts inside the rx-builder shell; assert both the shell
    // header lands and the input is rendered. Two different elements use the
    // phrase "Describe the case" (the page intro paragraph and the bar
    // header), so we anchor to the class-scoped header to avoid ambiguity.
    await expect(page.locator(".rx-builder-h").filter({ hasText: /describe the case/i })).toBeVisible();
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
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

/* Phase C — SurfaceBar two-axis navigation. The bar is mounted above
   every surface; default landing is inpatient + reference (the current
   11-tab UI), so existing links see no behavior change. */
test.describe("SurfaceBar (Phase C two-axis nav)", () => {
  test("default landing is inpatient + reference (classic 11-tab UI)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // The SurfaceBar mounts above the classic header.
    await expect(page.getByTestId("surface-bar")).toBeVisible();
    // The classic 11-tab nav is still here.
    await expect(page.locator(".rx-nav")).toBeVisible();
    // The Approach lede still renders (the classic landing).
    await expect(page.getByText(/principles of empiric antibacterial therapy/i)).toBeVisible();
  });

  test("clicking Decide switches the inpatient surface to the Bedside flow", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const bar = page.getByTestId("surface-bar");
    await bar.getByRole("button", { name: /^Decide/i }).click();
    // BedsideShell mounts; the Case Bar header lands.
    await expect(page.locator(".rx-builder-h").filter({ hasText: /describe the case/i })).toBeVisible();
  });

  test("clicking Outpatient surfaces the planned-roadmap shell", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const bar = page.getByTestId("surface-bar");
    await bar.getByRole("button", { name: /^Outpatient/i }).click();
    await expect(page.getByText(/outpatient antibiotic guidance is on the roadmap/i)).toBeVisible();
  });

  test("legacy ?bedside=1 still routes to inpatient + decide", async ({ page }) => {
    await page.goto("/?bedside=1");
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".rx-builder-h").filter({ hasText: /describe the case/i })).toBeVisible();
  });
});

/* Day-3 reassessment workflow (Phase B). The panel mounts inside the
   Answer Canvas and mutates the regimen view as the user toggles its
   three structured inputs. */
test.describe("bedside reassessment panel", () => {
  async function openHapAnswer(page) {
    await page.goto("/?bedside=1");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="text"]').first().fill("HAP prior MRSA");
    await page.getByRole("button", { name: /apply case/i }).click();
    await expect(page.getByText(/start now/i).first()).toBeVisible();
  }

  test("panel mounts with the three structured inputs", async ({ page }) => {
    await openHapAnswer(page);
    const panel = page.getByTestId("reassessment-panel");
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("button", { name: /pending/i })).toBeVisible();
    await expect(panel.getByRole("button", { name: /stable & improving/i })).toBeVisible();
    await expect(panel.getByRole("button", { name: /tolerating oral/i })).toBeVisible();
    await expect(panel.getByRole("button", { name: /source controlled/i })).toBeVisible();
  });

  test("marking cultures back + picking an organism reveals 'Narrow to'", async ({ page }) => {
    await openHapAnswer(page);
    const panel = page.getByTestId("reassessment-panel");
    await panel.getByRole("button", { name: /^back$/i }).click();
    await panel.getByRole("button", { name: /^MRSA$/i }).click();
    await expect(page.getByTestId("reassessment-output")).toBeVisible();
    await expect(panel.getByText(/narrow to/i).first()).toBeVisible();
  });

  test("toggling stable + absorbing surfaces IV→PO candidates", async ({ page }) => {
    await openHapAnswer(page);
    const panel = page.getByTestId("reassessment-panel");
    await panel.getByRole("button", { name: /stable & improving/i }).click();
    await panel.getByRole("button", { name: /tolerating oral/i }).click();
    await expect(panel.getByText(/iv.po candidates/i).first()).toBeVisible();
  });

  test("toggling source controlled surfaces the duration clock", async ({ page }) => {
    await openHapAnswer(page);
    const panel = page.getByTestId("reassessment-panel");
    await panel.getByRole("button", { name: /source controlled/i }).click();
    await expect(panel.getByText(/duration clock/i).first()).toBeVisible();
    // HAP duration is "7 days for most VAP/HAP" — the panel should surface
    // the 7-day count even before a start date is set.
    await expect(panel.getByText(/7 days/i).first()).toBeVisible();
  });
});
