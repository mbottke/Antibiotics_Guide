/* data · syndromes/_index — per-syndrome module aggregator.

   Wave 5 PR-1 anchor refactor. Each `src/data/syndromes/<id>.js`
   exports a default object:
       { id, regimen?, decision? }
   Either content key is optional — a module may carry only `regimen`
   while leaving `decision` to be authored in a later tranche, or
   vice-versa.

   This file lists the modules explicitly (no `import.meta.glob`).
   Explicit imports are intentional:
     · grep-able dependency graph
     · zero risk of glob-resolution surprises in Vite vs Vitest vs
       production build
     · the cost is one new import line per new syndrome — paid by
       PR-2 when the remaining 114 syndromes migrate
     · the auto-aggregating partial dictionaries below are pure
       data, so the consumers in `syndromeDecision.js` and
       `regimenContent.js` need only `import { REGIMEN_PARTIALS,
       DECISION_PARTIALS } from "./syndromes/_index.js"` — never
       touch individual modules

   PR-1 ships three sentinel syndromes (cystitis, sepsis, cap).
   PR-2 ships the remaining 114.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

import cap from "./cap.js";
import cystitis from "./cystitis.js";
import sepsis from "./sepsis.js";

const SYNDROME_MODULES = { cap, cystitis, sepsis };

/* Verify module integrity once at module-load. A module that ships
   a mismatched `id` field is a copy-paste bug we want to catch
   loudly during test or first dev-server load, not silently lose
   to a key collision in the merged dictionary. */
for (const [key, mod] of Object.entries(SYNDROME_MODULES)) {
  if (!mod || mod.id !== key) {
    throw new Error(
      `syndromes/_index: module key "${key}" does not match its default-export id "${mod && mod.id}"`
    );
  }
}

const REGIMEN_PARTIALS = Object.fromEntries(
  Object.entries(SYNDROME_MODULES)
    .filter(([, m]) => m && m.regimen)
    .map(([id, m]) => [id, m.regimen])
);

const DECISION_PARTIALS = Object.fromEntries(
  Object.entries(SYNDROME_MODULES)
    .filter(([, m]) => m && m.decision)
    .map(([id, m]) => [id, m.decision])
);

export { SYNDROME_MODULES, REGIMEN_PARTIALS, DECISION_PARTIALS };
