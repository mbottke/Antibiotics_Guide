/* data · diagnostics — Wave 5 PR-6 diagnostic stewardship layer.

   The structured "what to order before / alongside empiric therapy"
   surface, sitting BEFORE the regimen in the Answer Canvas (workup
   precedes empiric — a contract). Mirrors the syndromeDecision.js
   schema verbatim: per-syndrome dictionary, graceful-fallback
   accessor, severity-tagged items with the same word caps and
   matchCtx predicate vocabulary used by MonitoringBlock.

   The architectural intent: the Answer Canvas should never start at
   "here's what to give" before answering "here's what to ORDER right
   now." Antimicrobial stewardship begins at the workup, not at the
   prescription. Cultures sent before the first dose; biomarkers
   anchoring duration; rapid panels that change the regimen at hour 4;
   imaging that distinguishes "drainable focus" from "antibiotics
   alone" — every empiric answer rests on these orders.

   FILE LAYOUT (Wave 5 PR-6b aggregator refactor)
   ---------------------------------------------
   This file is now an AGGREGATOR. Content lives in per-tranche
   modules under src/data/diagnostics/<chunk>.js so multiple authors
   (the plan's 4-agent matrix) can edit disjoint files in parallel
   without merge conflicts. The aggregator merges each tranche's
   default export into a single DIAGNOSTICS dictionary keyed by
   syndrome id. Mirrors the syndromes/_index.js split from PR-1.

     src/data/diagnostics/sentinels.js  · PR-6a 10 highest-volume
     src/data/diagnostics/tranche-b.js  · PR-6b ~25 syndromes
     src/data/diagnostics/tranche-c.js  · PR-6c ~25 syndromes
     src/data/diagnostics/tranche-d.js  · PR-6d ~25 syndromes
     src/data/diagnostics/tranche-e.js  · PR-6e ~25 syndromes

   The integrity check at the bottom asserts disjoint keys — if two
   tranches author the same syndrome id, CI fails loudly rather than
   silently letting one overwrite the other.

   SHAPE
   -----
   DIAGNOSTICS[syndromeId] = {
     cultures:   [{ what, why, sev, matchCtx? }],   // BCx, ECx, UCx, tissue
     biomarkers: [{ what, why, sev, matchCtx? }],   // lactate, procal, WBC
     panels:     [{ what, why, sev, matchCtx? }],   // BioFire, Verigene, Karius
     imaging:    [{ what, why, sev, matchCtx? }],   // CT, US, MRI, echo
     biopsy:     [{ what, why, sev, matchCtx? }],   // tissue, drainage
   };

   Every category is OPTIONAL — a syndrome may carry just cultures +
   biomarkers (cystitis), or the full five (sepsis). Empty / missing
   categories are skipped in render; null entry means "no authored
   diagnostics" and DiagnosticsBlock renders nothing.

   SEVERITY VOCABULARY
   -------------------
   Identical to MonitoringBlock — one severity language across the
   entire Answer Canvas:

     "required" — must-order, hard-stop if missed. Renders red
                  "REQUIRED" badge. Use for: blood cultures before
                  antibiotics in suspected bacteremia, MRI for spinal
                  epidural abscess on neuro deficit, etc.

     "trigger"  — conditional "if X then order Y". Renders amber
                  "TRIGGER" badge. Use for: PET-CT if BCx persist >
                  72 h, repeat lumbar puncture for persistent fever
                  in meningitis, echo on staphylococcal bacteremia.

     "consider" — optional escalation. Renders muted "CONSIDER"
                  badge. Use for: MRSA nares PCR for de-escalation
                  decision, rapid PCR panel where pre-test probability
                  is intermediate, broncho-alveolar lavage in
                  immunocompromised CAP.

   WRITING THE CONTENT
   -------------------
   what
     - Concrete and ordered. "Two sets of peripheral blood cultures
       before first antibiotic dose" not "consider blood cultures."
     - Numbers, not adjectives. ≤ 28 words.
     - **bold** highlights parsed by DiagnosticsBlock for the same
       visual emphasis system as MonitoringBlock.

   why
     - The clinical reasoning in one sentence. ≤ 26 words.
     - What changes about management if positive / negative.

   matchCtx (optional)
     - The same declarative predicate evaluated by ctxMatch.js the
       monitoring items use. When the patient ctx matches, the item
       gets a left-border accent + "MATCHES" chip in render.
     - Never hides items — only elevates them.

   GRACEFUL FALLBACK
   -----------------
   Syndromes without an entry render no DiagnosticsBlock. The Answer
   Canvas simply proceeds from the Start section into Covers as
   before. The file fills in over time without breaking anything.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

import { SENTINEL_DIAGNOSTICS } from "./diagnostics/sentinels.js";
import { TRANCHE_B_DIAGNOSTICS } from "./diagnostics/tranche-b.js";
import { TRANCHE_C_DIAGNOSTICS } from "./diagnostics/tranche-c.js";
import { TRANCHE_D_DIAGNOSTICS } from "./diagnostics/tranche-d.js";
import { TRANCHE_E_DIAGNOSTICS } from "./diagnostics/tranche-e.js";

/* Integrity check — two tranches authoring the same syndrome id is a
   silent-overwrite bug (the second spread wins). Detect it at module
   load and throw; CI catches the failure before any render. */
function _assertDisjoint(parts) {
  const seen = new Map();   // syndromeId → tranche-name
  for(const [name, part] of parts) {
    for(const id of Object.keys(part)) {
      if(seen.has(id)) {
        throw new Error(
          `[diagnostics] duplicate syndrome id "${id}" in both ${seen.get(id)} ` +
          `and ${name} — every syndrome must live in exactly one tranche.`,
        );
      }
      seen.set(id, name);
    }
  }
}

_assertDisjoint([
  ["sentinels", SENTINEL_DIAGNOSTICS],
  ["tranche-b", TRANCHE_B_DIAGNOSTICS],
  ["tranche-c", TRANCHE_C_DIAGNOSTICS],
  ["tranche-d", TRANCHE_D_DIAGNOSTICS],
  ["tranche-e", TRANCHE_E_DIAGNOSTICS],
]);

const DIAGNOSTICS = {
  ...SENTINEL_DIAGNOSTICS,
  ...TRANCHE_B_DIAGNOSTICS,
  ...TRANCHE_C_DIAGNOSTICS,
  ...TRANCHE_D_DIAGNOSTICS,
  ...TRANCHE_E_DIAGNOSTICS,
};

/* Lookup helper — used by DiagnosticsBlock. Returns null when the syndrome
   has no authored content, which signals the component to render nothing.
   Mirrors getSyndromeDuration / getSyndromeMonitoring / etc. for consistency
   across the depth-layer accessor pattern. */
function getDiagnosticsForSyndrome(synId) {
  return DIAGNOSTICS[synId] || null;
}

export { DIAGNOSTICS, getDiagnosticsForSyndrome };
