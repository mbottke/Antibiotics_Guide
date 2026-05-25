/* data · syndromes/cystitis — uncomplicated lower-tract UTI.
   Short courses, simple monitoring. IDSA 2010 (Gupta).

   Migrated from regimenContent.js + syndromeDecision.js in Wave 5 PR-1
   as one of three sentinel syndromes (cystitis / sepsis / cap) that
   prove the per-syndrome module pattern before the mass migration in
   PR-2. The legacy aggregate dictionaries SYNDROME_DECISION and
   REGIMEN_CONTENT still export the same shape via the _index aggregator
   shim, so every downstream consumer is unchanged.

   Each syndrome module exports a default object:
     { id, regimen, decision }
   Both `regimen` and `decision` are optional — a module may carry
   only one if the other has not been authored. The aggregator filters
   missing keys gracefully.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

const regimen = {
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
        { sev: "stop", text: "**CrCl < 30** — urine concentration drops below MIC",
          matchCtx: { crcl: { lt: 30 } } },
        { sev: "stop", text: "**Pyelonephritis** / fever / flank pain — zero tissue penetration",
          matchCtx: { severe: true } },
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
        "**Oral narrow-ish spectrum** — better stewardship than fluoroquinolones",
        "Useful when nitrofurantoin fails (CrCl < 30) **AND** TMP-SMX is contraindicated",
        "**Pregnancy-safe across all trimesters** — first-choice when alternatives are out",
        "**Cefpodoxime** has the strongest cystitis data; cefdinir / cefuroxime acceptable substitutes",
      ],
      watchOut: [
        { sev: "warn", text: "**Cure rates 5–15 pp lower** than first-line; higher relapse" },
        { sev: "warn", text: "Do **not extend beyond 7 days** — no benefit, amplifies collateral resistance" },
        { sev: "note", text: "Cross-reactivity with **severe** penicillin allergy ~1%; rash alone is not a contraindication",
          matchCtx: { blAllergy: "severe" } },
        { sev: "note", text: "Promotes **C. difficile** and ESBL selection more than nitrofurantoin / fosfomycin" },
      ],
    },
    {
      rx: /amoxicillin-?clavulanate|augmentin/i,
      pickIf: "Cephalosporins contraindicated and antibiogram supports empiric use.",
      whyPick: [
        "**Oral, well-absorbed** — covers most community E. coli **when antibiogram allows**",
        "Useful when both cephalosporins and the first-line trio are out",
        "**Pregnancy-safe** — broadest-tolerated UTI agent in pregnancy",
      ],
      watchOut: [
        { sev: "stop", text: "**Empiric resistance often > 30%** in community E. coli — verify antibiogram" },
        { sev: "warn", text: "GI intolerance + antibiotic-associated diarrhea common — counsel before starting" },
        { sev: "warn", text: "**Cholestatic hepatitis** — rare but classic, may appear weeks after course" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Match the agent — 3 d TMP-SMX, 5 d nitrofurantoin, single dose fosfomycin.",
    evidence: "IDSA 2010 — agent-specific short courses; no advantage to extension in uncomplicated cystitis",
    branches: [
      { label: "Nitrofurantoin",  days: "5 d",      matchAgent: /nitrofurantoin/i,
        detail: "Full 5-day course; do **not** extend even if late response" },
      { label: "TMP-SMX",         days: "3 d",      matchAgent: /TMP-?\s?SMX|trimethoprim/i,
        detail: "Shortest first-line; covers early pyelo if dx wrong" },
      { label: "Fosfomycin",      days: "1 dose",   matchAgent: /fosfomycin/i,
        detail: "Single 3 g sachet; repeat dosing **does not** improve cure" },
      { label: "β-lactam (cefpodoxime, cefdinir)", days: "5–7 d",
        matchAgent: /cefpodoxime|cefdinir|β-?lactam|amoxicillin-?clavulanate/i,
        detail: "Lower cure than first-line; do not extend beyond 7 d" },
    ],
    stopWhen: [
      "Symptoms resolved (dysuria, urgency, frequency, suprapubic pain)",
      "No fever, no flank pain, no nausea/vomiting",
      "Course completed (5 d / 3 d / single dose by agent)",
    ],
    extendIf: [
      { text: "**Fever or flank pain develops** → treat as pyelonephritis (different drug + 7+ d)",
        matchCtx: { severe: true } },
      "Recurrent within 4 wk → 7-day course + culture-direct",
      "Indwelling catheter unchanged — change catheter first",
    ],
  },
  monitoring: {
    headline: "Symptoms-only follow-up in most; reculture for recurrence within 4 weeks.",
    items: [
      { sev: "required", what: "Symptom check at 48–72 h",
        why: "Persistent symptoms → reculture + alternative agent" },
      { sev: "trigger",  what: "Reculture **if** symptoms persist or recur within 4 wk",
        why: "Identifies resistant organism or upper-tract progression" },
      { sev: "trigger",  what: "**Workup pyelonephritis** if fever / flank / vomiting",
        why: "Lower-tract drug fails; needs IV β-lactam + 7+ d",
        matchBranch: ["Nitrofurantoin", "Fosfomycin"],
        matchCtx: { severe: true } },
      { sev: "consider", what: "Post-treatment urine culture in pregnancy",
        why: "ASB clearance documentation; reduces preterm birth risk" },
    ],
  },
  rationale: {
    driver: "Uncomplicated cystitis is overwhelmingly E. coli — Gupta (IDSA 2010) anchors agent-specific short courses that exploit pharmacokinetics: nitrofurantoin 5 d (urinary concentration), TMP-SMX 3 d (rapid bactericidal at empiric MICs < 20% local resistance), fosfomycin single 3 g dose (bladder reservoir effect). Fluoroquinolones are deliberately not first-line — collateral resistance damage to enteric flora plus tendon/aortic/QT toxicity outweigh modest cure-rate advantages. β-lactams (cefpodoxime, cefdinir) achieve lower cure rates and never extend past 7 d. Symptomatic improvement at 48–72 h confirms the choice; recurrence within 4 wk triggers reculture and pyelonephritis re-eval, not reflexive extension.",
    guideline: "balance",
    rejected: "Reflexive 7–10 d β-lactam courses were deliberately rejected — Huttner (JAMA 2018) and Gupta both demonstrate nitrofurantoin 5 d and TMP-SMX 3 d non-inferior to longer regimens with lower AE rates. Empiric fluoroquinolone was tempered: Nicolle (IDSA 2019) and Gupta restrict FQ to second-line because of tendon, aortic, and CNS toxicity plus collateral C. difficile and ESBL selection pressure that outlasts the patient's prescription." },
  objections: [
    { q: "Why 3 d TMP-SMX not 7 d — surely longer is safer?",
      a: "Gupta (IDSA 2010) [cite:talan] meta-analysis showed TMP-SMX 3 d non-inferior to 7-d regimens with substantially lower AE rates in uncomplicated cystitis. Huttner (JAMA 2018, n=513) confirmed nitrofurantoin 5 d achieved 70% cure vs 58% with single-dose fosfomycin — short agent-specific courses match drug kinetics. Extending past the agent-specific duration adds adverse events (rash, GI, CDI risk) without raising cure rates [cite:stew]." },
    { q: "Why not fluoroquinolone first-line — it's broad and oral?",
      a: "FQs are deliberately reserved as second-line in uncomplicated cystitis per Gupta IDSA 2010 [cite:talan] — Nicolle (IDSA 2019) and the FDA black-box warnings cite tendon rupture, aortic dissection, QT prolongation, and CNS toxicity. Collateral resistance damage (C. difficile, ESBL selection) outlasts the prescription [cite:stew]. Nitrofurantoin 5 d, TMP-SMX 3 d, or fosfomycin single dose deliver equivalent cure with substantially better safety [cite:cdi]." },
    { q: "Why avoid nitrofurantoin in CrCl < 30 mL/min?",
      a: "Nitrofurantoin requires renal excretion to achieve therapeutic urinary concentration — at CrCl < 30 mL/min the drug accumulates systemically while urinary levels drop below MIC, driving peripheral neuropathy and pulmonary toxicity without curing the UTI [cite:mono]. IDSA 2010 [cite:talan] and AGS Beers criteria flag this threshold. Switch to fosfomycin single dose or short-course β-lactam (cefpodoxime) when CrCl < 30." },
  ],
  research: {
    headline: "Short courses anchored by agent-specific kinetics + trial-grade evidence; longer courses give no benefit.",
    trials: [
      { name: "Gupta IDSA 2010 review",
        n: "Meta-analysis (multiple RCTs)",
        question: "What is the optimal duration for each first-line cystitis agent?",
        finding: "TMP-SMX 3 d, nitrofurantoin 5 d, fosfomycin single dose — all non-inferior to longer regimens with lower adverse-event rates",
        bias: "Older trials predate widespread TMP-SMX resistance — local antibiogram should guide" },
      { name: "Huttner JAMA 2018",
        n: "513",
        question: "Nitrofurantoin 5 d vs fosfomycin single dose in uncomplicated cystitis",
        finding: "Nitrofurantoin clinical cure 70% vs fosfomycin 58% at 28 d — nitrofurantoin superior; favors 5-day over single-dose strategy",
        bias: "European population — U.S. resistance patterns may differ" },
      { name: "Vazquez NEJM 2024 GAIN",
        n: "1,200",
        question: "Gepotidacin vs nitrofurantoin in uncomplicated cystitis",
        finding: "Gepotidacin non-inferior — new oral option for resistant strains; not first-line until antibiogram-driven",
        bias: "Sponsored by GSK; long-term resistance trajectory unknown" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2010,
        topic: "Uncomplicated cystitis + pyelonephritis (Gupta)",
        keypoint: "Agent-specific short courses preferred; avoid FQ first-line due to collateral resistance damage" },
      { society: "AUA",
        year: 2022,
        topic: "Recurrent UTI in women",
        keypoint: "Prophylaxis options (daily, post-coital, methenamine) + vaginal estrogen for post-menopausal" },
      { society: "EAU",
        year: 2024,
        topic: "Urological infections",
        keypoint: "Fosfomycin first-line in many European centers due to resistance patterns; aligns with U.S. IDSA" },
    ],
    openQuestions: [
      "Methenamine non-inferiority vs daily antibiotic prophylaxis (ALTAR 2022 supports)",
      "Cranberry products — meta-analyses inconsistent; modest benefit at best",
      "Asymptomatic bacteriuria in non-pregnant — definitively NOT to treat (IDSA 2019)",
    ],
  },
};

export default { id: "cystitis", regimen, decision };
