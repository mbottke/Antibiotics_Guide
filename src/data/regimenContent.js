/* data · regimenContent — Phase D1.5 per-option clinical content.
   The single source of truth for the per-card decision content shown
   inside each regimen option in the Answer Canvas. Authored at the
   apex-quality bar: every entry is action-oriented, evidence-aware,
   and dense enough that a clinician can decide between options from
   the card alone — without scrolling, without opening Reference, and
   without re-reading the same fact in three places on the screen.

   SHAPE
   -----
   REGIMEN_CONTENT[syndromeId][tierLabel] is an array of matchers, each
   tested against the option text produced by splitRegimenOptions.
   First match wins, so order entries from most-specific to least-
   specific within each tier.

       {
         rx: /nitrofurantoin/i,             // regex against option text

         pickIf:  "5-second verdict — one sentence.",   // card subtitle

         whyPick: [                          // strengths bullets
           "**Killer fact in bold** plus explanation.",
           "Next bullet…",
         ],

         watchOut: [                         // cautions bullets
           { sev: "stop", text: "**Hard contraindication** — why." },
           { sev: "warn", text: "**Dangerous interaction** — why." },
           { sev: "note", text: "Important to know, not a deal-breaker." },
         ],
       }

   WRITING THE CONTENT
   -------------------
   pickIf
     - One sentence. ≤ 20 words. Reads like a stop-and-decide cue.
     - Compare implicitly to the sibling options ("when nitrofurantoin
       is contraindicated", "shortest course", "best adherence").

   whyPick
     - Bullets, not paragraphs. ≤ 12 words each.
     - **Bold** the single fact that makes this drug the right pick
       (the number, the cutoff, the class advantage).
     - 3–5 bullets per drug. Skip filler.
     - Cite evidence in compressed form ("60× urinary conc",
       "AUC/MIC 400–600", "IDSA 2010").
     - No "consider", "may", "can"; be declarative.

   watchOut[].sev
     - "stop" — hard contraindication, the kind that ends a career
       (renal cutoff, allergy class, pregnancy stage, drug interaction
       that kills). Renders red. Use sparingly — every "stop" should
       be a true do-not-use.
     - "warn" — important interaction or spectrum gap. Renders amber.
     - "note" — useful to know, not action-forcing. Renders muted.

   watchOut[].text
     - **Bold** the cutoff or interaction trigger. Then the why.
     - Concrete numbers. CrCl 30, not "renal impairment". 38 weeks,
       not "late pregnancy".
     - ≤ 18 words per bullet.

   The renderer parses **bold** in any text field and accents it in
   the entry's color (orange for whyPick, amber for watchOut warn /
   note, red for watchOut stop).

   FALLBACK & TIER-NOTE DEDUPE
   ----------------------------
   * Options without an entry render with just the drug fragment +
     route badge + dose chips. The file fills in over time without
     breaking anything that renders.
   * When ANY option in a tier has content authored, AnswerCanvas
     suppresses the tier-level italic `note` to eliminate the
     "card duplicates the note below the cards" redundancy. If the
     note carries non-drug-specific framing that the cards don't
     subsume, fold it into the syndrome's tier rx/note or into one
     of the per-card whyPick lists.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

import { REGIMEN_PARTIALS } from "./syndromes/_index.js";

/* Wave 5 PR-1 + PR-2 — every authored syndrome's regimen content now
   lives in src/data/syndromes/<id>.js. REGIMEN_CONTENT below merges
   REGIMEN_PARTIALS (the source of truth) over a now-empty inline
   shim. The shim is retained as a hatch for one-off inline entries
   that may be authored before a per-syndrome module exists; spreading
   it costs nothing when empty. Every downstream consumer —
   lookupOptionContent, tierHasContent, RegimenOptions, AnswerCanvas,
   and the content-audit test — reads the same dictionary shape as
   before the split. */

const REGIMEN_CONTENT_INLINE = {

};

/* Merge the per-syndrome modules over the inline shim. REGIMEN_PARTIALS
   wins on collision, but PR-1 guarantees the migrated keys (cystitis,
   sepsis, cap) are gone from REGIMEN_CONTENT_INLINE, so the spread is
   effectively a disjoint union. Once PR-2 completes, the inline shim
   is empty and REGIMEN_CONTENT == REGIMEN_PARTIALS. */
const REGIMEN_CONTENT = { ...REGIMEN_CONTENT_INLINE, ...REGIMEN_PARTIALS };

/* Look up content for a given option. Returns the matched entry or
   null. The renderer treats null as "no decision content" and renders
   only the drug fragment + route + dose chips. */
function lookupOptionContent(synId, tierLabel, optionText) {
  const tier = REGIMEN_CONTENT[synId]?.[tierLabel];
  if(!tier || !optionText) return null;
  for(const entry of tier) {
    if(entry.rx.test(optionText)) return entry;
  }
  return null;
}

/* Has-content check for the entire tier — used by AnswerCanvas to
   decide whether to suppress the tier-level italic note (which would
   otherwise duplicate per-card content). Returns true if any option
   in the tier has authored content. */
function tierHasContent(synId, tierLabel, rx, splitFn) {
  const tier = REGIMEN_CONTENT[synId]?.[tierLabel];
  if(!tier || !rx || !splitFn) return false;
  const opts = splitFn(rx);
  return opts.some(o => tier.some(entry => entry.rx.test(o.text)));
}

export { REGIMEN_CONTENT, lookupOptionContent, tierHasContent };
