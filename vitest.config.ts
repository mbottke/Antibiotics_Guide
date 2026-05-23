import { defineConfig } from "vitest/config";

// Engines and data are pure ES modules with no DOM dependency, so the default
// node environment is correct and fast. (Component tests, if added later, can
// opt into jsdom per-file via a `// @vitest-environment jsdom` docblock.)
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.{js,jsx,ts,tsx}"],
    globals: false,
    reporters: "default",
  },
});
