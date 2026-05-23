/* data · regimenContent — Phase D1.5 per-option clinical content.
   The single source of truth for "why pick this drug" / "watch out"
   content shown inside each regimen option card. Authored at the
   apex-quality bar: every entry is action-oriented, evidence-aware,
   and specific enough that a clinician can decide between options
   from the card alone.

   SHAPE
   -----
   REGIMEN_CONTENT[syndromeId][tierLabel] is an array of matchers, each
   tested against the option text produced by splitRegimenOptions.
   The FIRST matching entry wins, so order the entries from most-
   specific to least-specific within each tier.

       {
         rx:       /nitrofurantoin/i,      // regex against option text
         whyPick:  "When to pick this. ~25-60 words. Specific.",
         watchOut: "Hard contraindications + the dangerous-to-miss
                    interactions. ~25-60 words. Concrete cutoffs.",
       }

   WRITING THE CONTENT
   -------------------
   whyPick:
     - State the clinical situation that makes this drug the right pick.
     - Cite the underlying evidence or mechanism in compressed form
       (e.g., "60-fold urinary concentration", "AUC/MIC 400–600").
     - Compare implicitly to the sibling options when relevant.
     - Avoid "consider", "may", "if appropriate" — be declarative.
     - No filler. If you cannot say something specific, leave it short.

   watchOut:
     - Lead with the hard contraindication (CrCl threshold, allergy,
       pregnancy stage) — the kind of thing that ends a career if
       missed.
     - Then the drug interactions a clinician will not remember.
     - Then the spectrum gaps that matter for this syndrome.
     - Concrete numbers, not "monitor for". If a renal cutoff is 30,
       say 30 — not "in renal impairment".

   FALLBACK
   --------
   Tiers and options without content render as plain text. The
   renderer treats missing content as expected; this file fills in
   over time without breaking anything.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

const REGIMEN_CONTENT = {

  /* ===========================================================
     CYSTITIS — the gold-standard pattern for this file.
     IDSA 2010 (Gupta) defines the first-line trio; second-line
     β-lactams are explicitly worse and reserved for failures or
     contraindications. =========================================== */
  cystitis: {
    "First-line": [
      {
        rx: /nitrofurantoin/i,
        whyPick: "IDSA-preferred first-line. 60-fold urinary concentration with minimal systemic exposure keeps national resistance under 5% even decades into use. Preserves gut and vaginal flora — the lowest collateral-damage agent in the trio.",
        watchOut: "No tissue penetration — do not use for pyelonephritis or any flank pain, fever, or rigor. Avoid if CrCl < 30 (urine levels fall below therapeutic). Avoid at term (≥ 38 weeks) and in G6PD deficiency. Pulmonary fibrosis is the long-course toxicity to remember.",
      },
      {
        rx: /fosfomycin/i,
        whyPick: "Single 3-gram sachet — best adherence option, no missed doses. Covers most ESBL-producing E. coli and VRE; preserves fluoroquinolones for upper-tract disease. The right pick when nitrofurantoin is contraindicated (CrCl < 30, term pregnancy).",
        watchOut: "Cure rate runs 5–10 percentage points below 5-day nitrofurantoin in head-to-head trials. Strictly a lower-tract drug — zero role in pyelonephritis or febrile UTI. Diarrhea in ~10%. Repeat dosing does not improve cystitis outcomes — single dose is the regimen.",
      },
      {
        rx: /TMP-?\s?SMX|trimethoprim/i,
        whyPick: "Shortest course (3 days), oral, cheap, achieves both urinary and tissue concentrations — the only first-line that works for early pyelonephritis if you are wrong about lower-tract. Pick when local E. coli resistance is documented < 20% and no sulfa allergy.",
        watchOut: "Do NOT use empirically if local uropathogen resistance ≥ 20% — check the antibiogram. Contraindicated in third-trimester pregnancy (kernicterus). Hyperkalemia with ACE-I/ARB/spironolactone. Boosts warfarin INR; raises methotrexate, sulfonylurea, and phenytoin levels.",
      },
    ],
    "Second-line": [
      {
        rx: /β-?lactam|cefpodoxime|cefdinir/i,
        whyPick: "The fallback when the first-line trio is contraindicated — nitrofurantoin won't work (CrCl < 30 or upper-tract), fosfomycin failed, and TMP-SMX is out (allergy or local resistance ≥ 20%). Better than fluoroquinolones for stewardship.",
        watchOut: "Cure rates 5–15% lower than first-line; relapse rate higher. Do not extend beyond 7 days — longer courses do not improve cystitis outcomes and amplify collateral resistance. Cross-reactivity with documented severe penicillin allergy ~1%; rash history alone is not a contraindication.",
      },
      {
        rx: /amoxicillin-?clavulanate|augmentin/i,
        whyPick: "Used when the cephalosporins are contraindicated and the patient has a documented amoxicillin-susceptible isolate or an antibiogram supporting empiric use. Oral, well-absorbed, covers most uncomplicated community E. coli when local resistance allows.",
        watchOut: "Empiric resistance in community E. coli often exceeds 30% — verify the antibiogram before using as empiric therapy. GI intolerance and antibiotic-associated diarrhea are common; counsel before starting. Cholestatic hepatitis is rare but classic and may appear weeks after the course.",
      },
    ],
  },
};

/* Look up content for a given option. Returns { whyPick, watchOut } or
   null if no content authored for this tier/option. The renderer treats
   null as "render the option without micro-content" — the file grows
   over time without breaking anything that renders. */
function lookupOptionContent(synId, tierLabel, optionText) {
  const tier = REGIMEN_CONTENT[synId]?.[tierLabel];
  if(!tier || !optionText) return null;
  for(const entry of tier) {
    if(entry.rx.test(optionText)) return { whyPick: entry.whyPick, watchOut: entry.watchOut };
  }
  return null;
}

export { REGIMEN_CONTENT, lookupOptionContent };
