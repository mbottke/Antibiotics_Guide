/* data · syndromeDecision — Phase D2 duration + monitoring depth.
   The structured "when to stop" and "what to check" layer that sits
   below the regimen options in the Answer Canvas. Authored at the
   same apex bar as regimenContent (Phase D1.5): every clinical
   decision point is concrete, evidence-anchored, and severity-
   tagged so a clinician can read the block as a checklist.

   The legacy `syndrome.duration` string field stays as the source
   of truth for the simple duration clock parser in ReassessmentPanel
   (it pulls the first integer and computes a stop date). This file
   adds the *richer* structured content next to it — branches by
   clinical state, stop criteria, extension triggers, monitoring
   items with severity-tagged urgency. The two coexist; the rich
   content augments the clock, doesn't replace it.

   SHAPE
   -----
   SYNDROME_DECISION[syndromeId] = {
     duration: {
       headline: "string — the bottom line, ≤ 20 words",
       evidence: "string — trial / guideline + year + finding",
       branches: [
         {
           label: "string — the clinical state branch label",
           days:  "string — MUST carry explicit units ('5 d', '1 dose',
                  '4–6 wk', 'Indefinite'); units are a safety contract,
                  never render a bare number",
           detail:"string — what counts as day 1 + extension rules",
           matchAgent?: RegExp,  // when picked agent matches, branch
                                 // highlights as the "active" duration
                                 // (cystitis Nitrofurantoin branch lights
                                 // when nitrofurantoin card is picked)
         },
       ],
       stopWhen: [ "criterion 1", "criterion 2", ... ],
       extendIf: [ "trigger 1", ... ],
     },
     monitoring: {
       headline: "string — one-sentence summary",
       items: [
         { sev: "required" | "trigger" | "consider",
           what: "string — the check / order / threshold",
           why:  "string — clinical rationale, ≤ 18 words",
           matchAgent?:  RegExp,    // optional agent filter
           matchBranch?: ["label"], // optional duration-branch filter
         },
       ],
     },
     research?: {                              // Phase F — evidence depth
       headline: "string — what the literature actually says",
       trials: [                               // landmark RCTs / meta-analyses
         { name:  "string — trial acronym + year (BALANCE 2024)",
           n:     "string | number — sample size (1,623)",
           question: "string — the trial's primary question",
           finding:  "string — the headline result, ≤ 30 words",
           bias?:    "string — known limitation / generalizability caveat",
         },
       ],
       guidelines: [                           // major society documents
         { society: "string — IDSA / ATS / WHO / CDC / ACG",
           year:    "number — 2024",
           topic:   "string — what it addresses",
           keypoint: "string — bottom-line recommendation",
         },
       ],
       openQuestions?: ["string — actively debated topic, ≤ 18 words"],
     },
   };

   CROSS-SECTION HIGHLIGHTING
   --------------------------
   When the clinician picks a regimen card (sets pickedAgent) or
   clicks a duration branch (sets pickedBranch), monitoring items
   carrying a `matchAgent` regex or `matchBranch` list that matches
   light up with an accent left-border + "MATCHES" chip. Items
   WITHOUT filter tags are agent/branch-agnostic and render at
   default emphasis regardless of selection.

   Items are never HIDDEN by filtering — safety contract. Hiding
   important checks because the user happened to pick a different
   card would let critical monitoring slip through the cracks.
   Filtering only EMPHASIZES; everything stays visible.

   WRITING THE CONTENT
   -------------------
   duration.headline
     - One sentence. The "write this on the chart" answer.
     - Pick the *modal* case; branches handle the deviations.

   duration.evidence
     - Anchor the headline. Compressed citation form: trial year,
       finding. Examples: "BALANCE 2024 — 7 vs 14 d non-inferior in
       controlled-source GNR bacteremia"; "IDSA 2010 — 5-day
       nitrofurantoin equals 7-day".
     - Skip if there is no trial-grade anchor — say "guideline-level"
       or omit.

   duration.branches
     - One per clinical state that materially changes duration.
     - `days` is rendered as a prominent chip; keep it short
       ("7", "14", "4–6 wk", "indefinite").
     - `detail` carries the day-1 anchor and any qualifier.

   duration.stopWhen
     - The discharge / stop checklist. ≤ 8 items. Every item is
       individually verifiable at the bedside (afebrile, BCx
       negative, source controlled, off pressors).
     - Items are AND-joined: ALL must be true to stop.

   duration.extendIf
     - Triggers that legitimately add days. ≤ 5 items.

   monitoring.headline
     - One sentence. The "what to order today" answer.

   monitoring.items[].sev
     - "required" — must-do, hard-stop if missed. Renders red label
       "REQUIRED". Use for: repeat BCx in S. aureus bacteremia,
       AUC for vancomycin, echo for bacteremia, etc.
     - "trigger" — conditional / "if X then do Y". Renders amber
       label "TRIGGER". Use for: CK weekly on dapto, PET-CT if
       bacteremia persists, etc.
     - "consider" — optional escalation. Renders muted label
       "CONSIDER". Use for: PJP prophylaxis, follow-up imaging
       for abscess response, etc.

   monitoring.items[].what / .why
     - Concrete. "Repeat blood cultures q48h until clearance" not
       "monitor cultures". Numbers, not adjectives.
     - **bold** markers parsed the same way as regimenContent.

   FALLBACK
   --------
   Syndromes without an entry render no DurationBlock /
   MonitoringBlock — the legacy duration string and the
   ReassessmentPanel clock still show. The file fills in over time.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

import { DECISION_PARTIALS } from "./syndromes/_index.js";

/* Wave 5 PR-1 + PR-2 — every authored syndrome's decision content now
   lives in src/data/syndromes/<id>.js. SYNDROME_DECISION below merges
   DECISION_PARTIALS (the source of truth) over a now-empty inline
   shim. The shim is retained as a hatch for one-off inline entries
   that may be authored before a per-syndrome module exists; spreading
   it costs nothing when empty. Every downstream consumer — the five
   getSyndromeX helpers, evidenceMap.js, the AnswerCanvas depth
   layers, and the content-audit test — reads the same dictionary
   shape as before the split. */

const SYNDROME_DECISION_INLINE = {

};

/* Merge the per-syndrome modules over the inline shim. DECISION_PARTIALS
   wins on collision, but PR-1 guarantees the migrated keys (cystitis,
   sepsis, cap) are gone from SYNDROME_DECISION_INLINE, so the spread is
   effectively a disjoint union. Once PR-2 completes, the inline shim
   is empty and SYNDROME_DECISION == DECISION_PARTIALS. */
const SYNDROME_DECISION = { ...SYNDROME_DECISION_INLINE, ...DECISION_PARTIALS };

/* Lookup helpers — used by DurationBlock + MonitoringBlock + ResearchBlock.
   Return null when the syndrome has no authored content, which signals the
   components to render nothing (legacy duration clock still shows in
   ReassessmentPanel). */
function getSyndromeDecision(synId) {
  return SYNDROME_DECISION[synId] || null;
}

function getSyndromeDuration(synId) {
  return SYNDROME_DECISION[synId]?.duration || null;
}

function getSyndromeMonitoring(synId) {
  return SYNDROME_DECISION[synId]?.monitoring || null;
}

function getSyndromeResearch(synId) {
  return SYNDROME_DECISION[synId]?.research || null;
}

/* Phase D1 — reasoning-trace accessor. Mirrors the duration / monitoring /
   research helpers above: returns the syndrome's `rationale` object
   (driver / guideline / rejected) when authored, null otherwise. The
   ReasoningTraceBlock renders nothing on null, so the partial Phase D1
   rollout coexists gracefully with the rest of the canvas. */
function getReasoningForSyndrome(synId) {
  return SYNDROME_DECISION[synId]?.rationale || null;
}

/* Phase D2 — pharmacist's-challenge accessor. Returns the authored
   `objections` array on a syndrome (predictable pushback + pre-authored
   answers as `{ q, a }` pairs) or `[]` when the syndrome has no
   objections authored yet. Always returns an array so the
   ObjectionsBlock can call `.length` safely; the block itself decides
   whether to render based on the array length. The graceful-fallback
   contract matches getReasoningForSyndrome + the rest of the depth
   helpers. */
function getObjectionsForSyndrome(synId) {
  const o = SYNDROME_DECISION[synId]?.objections;
  return Array.isArray(o) ? o : [];
}

export { SYNDROME_DECISION, getSyndromeDecision, getSyndromeDuration, getSyndromeMonitoring, getSyndromeResearch, getReasoningForSyndrome, getObjectionsForSyndrome };
