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

const REGIMEN_CONTENT = {

  /* ===========================================================
     CYSTITIS — IDSA 2010 (Gupta) defines the first-line trio;
     β-lactams are explicitly worse and reserved for failures
     or contraindications. =========================================== */
  cystitis: {
    "First-line": [
      {
        rx: /nitrofurantoin/i,
        pickIf: "Uncomplicated cystitis, CrCl ≥ 30, no fever or flank pain.",
        whyPick: [
          "**IDSA-preferred** for 40+ years and counting",
          "**60× urinary concentration** with minimal systemic exposure",
          "**< 5% national E. coli resistance** despite decades of use",
          "Spares gut + vaginal flora — lowest collateral damage",
          "Safe in 1st & 2nd trimester pregnancy",
        ],
        watchOut: [
          { sev: "stop", text: "**CrCl < 30** — urine concentration drops below MIC" },
          { sev: "stop", text: "**Pyelonephritis** / fever / flank pain — zero tissue penetration" },
          { sev: "stop", text: "**Term pregnancy (≥ 38 wk)** — neonatal hemolysis risk" },
          { sev: "stop", text: "**G6PD deficiency** — acute hemolysis" },
          { sev: "warn", text: "**Long courses (months)** — pulmonary fibrosis, hepatotoxicity" },
        ],
      },
      {
        rx: /fosfomycin/i,
        pickIf: "Best adherence — one sachet, done. Use when nitrofurantoin is out.",
        whyPick: [
          "**Single 3 g PO dose** — best adherence in the trio",
          "Covers most **ESBL E. coli** and **VRE**",
          "Preserves fluoroquinolones for upper-tract disease",
          "Safe across pregnancy and in **CrCl < 30**",
          "Right pick when nitrofurantoin is contraindicated",
        ],
        watchOut: [
          { sev: "warn", text: "**Cure rate 5–10 pp lower** than 5-day nitrofurantoin" },
          { sev: "stop", text: "**Pyelonephritis / febrile UTI** — lower-tract drug only" },
          { sev: "warn", text: "Diarrhea in **~10%**" },
          { sev: "note", text: "Repeat dosing does **not** improve cystitis outcomes — single dose is the regimen" },
          { sev: "note", text: "Avoid if local E. coli **fosfomycin resistance > 10%**" },
        ],
      },
      {
        rx: /TMP-?\s?SMX|trimethoprim/i,
        pickIf: "Shortest course (3 d). Only first-line that also treats early pyelo.",
        whyPick: [
          "**Shortest course — 3 days PO**",
          "Achieves **urinary + tissue** concentrations (covers early pyelo if dx is wrong)",
          "Cheap, oral, well-tolerated",
          "Pick when local E. coli resistance **< 20%** and no sulfa allergy",
        ],
        watchOut: [
          { sev: "stop", text: "**Local E. coli resistance ≥ 20%** — do not use empirically (check antibiogram)" },
          { sev: "stop", text: "**Sulfa allergy** (SJS/TEN history is absolute)" },
          { sev: "stop", text: "**3rd trimester pregnancy** — kernicterus" },
          { sev: "warn", text: "**Hyperkalemia** with ACE-I, ARB, spironolactone" },
          { sev: "warn", text: "Boosts **warfarin INR**; raises **methotrexate**, **sulfonylureas**, **phenytoin**" },
        ],
      },
    ],
    "Second-line": [
      {
        rx: /β-?lactam|cefpodoxime|cefdinir/i,
        pickIf: "First-line trio is out (CrCl < 30 + sulfa allergy + fosfo unavailable).",
        whyPick: [
          "Oral, narrow-ish spectrum — better stewardship than fluoroquinolones",
          "Useful when nitrofurantoin fails (CrCl < 30) AND TMP-SMX is out",
          "Acceptable in pregnancy across all trimesters",
        ],
        watchOut: [
          { sev: "warn", text: "**Cure rates 5–15 pp lower** than first-line; higher relapse" },
          { sev: "warn", text: "Do **not extend beyond 7 days** — no benefit, amplifies collateral resistance" },
          { sev: "note", text: "Cross-reactivity with **severe** penicillin allergy ~1%; rash alone is not a contraindication" },
          { sev: "note", text: "Promotes **C. difficile** and ESBL selection more than nitrofurantoin / fosfomycin" },
        ],
      },
      {
        rx: /amoxicillin-?clavulanate|augmentin/i,
        pickIf: "Cephalosporins contraindicated and antibiogram supports empiric use.",
        whyPick: [
          "Oral, well-absorbed, covers most community E. coli **when antibiogram allows**",
          "Useful when both cephalosporins and first-line trio are out",
        ],
        watchOut: [
          { sev: "stop", text: "**Empiric resistance often > 30%** in community E. coli — verify antibiogram" },
          { sev: "warn", text: "GI intolerance + antibiotic-associated diarrhea common — counsel before starting" },
          { sev: "warn", text: "**Cholestatic hepatitis** — rare but classic, may appear weeks after course" },
        ],
      },
    ],
  },
};

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
