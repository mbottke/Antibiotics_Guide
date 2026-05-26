import { defineConfig, devices } from "@playwright/test";

/* Render + accessibility gates run against the PRODUCTION build (npm run build →
   vite preview), so CI tests exactly what ships, not the dev server. The browser
   binary is resolved from PLAYWRIGHT_BROWSERS_PATH when set (CI caches it there).

   Desktop-Chromium only on CI. The mobile (Pixel 5) project was retired to
   keep the verify job under a sustainable runtime — every other gate
   (Vitest unit, integrity, RTL, axe-core via render.spec.ts) is viewport-
   agnostic, and the responsive container caps + media queries live in
   inline styles audited by Vitest. The previous double-build (webServer
   re-ran `npm run build` after CI already produced dist/) was likewise
   collapsed; webServer now just previews the existing dist. */

const PORT = 4317;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
