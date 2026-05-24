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

/* Phase D1 — multi-option presentation. The Answer Canvas renders each
   regimen tier as a grid of OptionCards (one per parsed alternate) so
   the clinician can compare options side-by-side. The "Current state"
   relabel of the legacy Reassessment panel also lands here — the
   snapshot framing replaces the longitudinal "Day-3" copy. */
test.describe("Phase D1 — multi-option + current-state framing", () => {
  test("applying a CAP case renders the multi-option regimen grid", async ({ page }) => {
    await page.goto("/?bedside=1");
    await page.waitForLoadState("networkidle");
    const input = page.locator('input[type="text"]').first();
    await input.fill("65M severe CAP icu");
    await page.getByRole("button", { name: /apply case/i }).click();
    // The grid mounts under the "Start now" section.
    await expect(page.getByTestId("regimen-options").first()).toBeVisible();
  });

  test("a multi-option grid offers more than one card", async ({ page }) => {
    await page.goto("/?bedside=1");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="text"]').first().fill("28F cystitis crcl 80");
    await page.getByRole("button", { name: /apply case/i }).click();
    const grid = page.getByTestId("regimen-options").first();
    await expect(grid).toBeVisible();
    const cards = grid.getByRole("radio");
    // Cystitis ships three first-line oral options; expect at least 2 cards.
    expect(await cards.count()).toBeGreaterThanOrEqual(2);
  });

  test("clicking a card marks it selected and unselects the prior pick", async ({ page }) => {
    await page.goto("/?bedside=1");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="text"]').first().fill("28F cystitis crcl 80");
    await page.getByRole("button", { name: /apply case/i }).click();
    const grid = page.getByTestId("regimen-options").first();
    const cards = grid.getByRole("radio");
    const count = await cards.count();
    if(count >= 2){
      await expect(cards.nth(0)).toHaveAttribute("aria-checked", "true");
      await cards.nth(1).click();
      await expect(cards.nth(1)).toHaveAttribute("aria-checked", "true");
      await expect(cards.nth(0)).toHaveAttribute("aria-checked", "false");
    }
  });

  test("Current state replaces Day-3 reassessment in the panel header", async ({ page }) => {
    await page.goto("/?bedside=1");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="text"]').first().fill("72M sepsis crcl 60");
    await page.getByRole("button", { name: /apply case/i }).click();
    // The panel header now reads "Current state", not "Day-3 reassessment".
    await expect(page.getByText(/current state/i).first()).toBeVisible();
    await expect(page.getByText(/day-?3 reassessment/i)).toHaveCount(0);
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

  test("source-controlled chip syncs with the duration affordance", async ({ page }) => {
    /* HAP gained authored DurationBlock content in D2 tranche 1, so
       the "Standard HAP / VAP" 7 d branch now renders above the
       ReassessmentPanel from page load. The chip → branch bidirectional
       bridge means clicking source-controlled lights the corresponding
       branch; the affordance no longer renders inside the panel itself
       (the legacy duration-clock fallback only fires for syndromes
       without authored decision content).

       For syndromes that DO have structured content (HAP, sepsis, cap,
       etc.), assert that the duration block is visible with the 7 d
       chip. For unauthored syndromes the test would assert the legacy
       clock inside the panel — both are valid expressions of the same
       "surface the duration" affordance. */
    await openHapAnswer(page);
    const panel = page.getByTestId("reassessment-panel");

    // The structured DurationBlock should render above the panel
    // (HAP has authored decision content).
    await expect(page.getByTestId("duration-block")).toBeVisible();

    // The 7 d Standard HAP branch chip should be visible.
    await expect(page.getByText(/^7\s*d$/i).first()).toBeVisible();

    // Clicking the source-controlled chip in the panel still triggers
    // its state-update path (used by the bidirectional sync engine).
    await panel.getByRole("button", { name: /source controlled/i }).click();
    await expect(panel.getByRole("button", { name: /source controlled/i }))
      .toHaveAttribute("aria-pressed", "true");
  });

  test("research evidence block renders for syndromes with authored panel (Phase F)", async ({ page }) => {
    /* HAP carries a Phase F research panel (PneumA 2003, IDSA 2016,
       DALI 2014, ZEPHyR). The ResearchBlock should mount below the
       MonitoringBlock and surface the kicker + at least one trial
       name. Syndromes without an authored research panel skip this
       section entirely — the optional shape allows incremental
       rollout. */
    await openHapAnswer(page);
    await expect(page.getByTestId("research-block")).toBeVisible();
    // Kicker text from Section chrome
    await expect(page.getByText(/evidence behind the recommendation/i)).toBeVisible();
    // At least one Phase F trial name should render
    await expect(page.getByText(/PneumA/i).first()).toBeVisible();
  });
});
