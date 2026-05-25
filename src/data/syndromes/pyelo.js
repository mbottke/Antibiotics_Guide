/* ===========================================================
   PYELONEPHRITIS — IDSA 2010 (Gupta) + 2024 update. 7 d FQ for
   uncomplicated; 10–14 d β-lactam; carbapenem path for ESBL. ===  */

const regimen = {
  "Empiric": [
    {
      rx: /ceftriaxone/i,
      pickIf: "Acute pyelonephritis, no ESBL risk, no prior carbapenem need.",
      whyPick: [
        "**IDSA-preferred** empiric — covers most community E. coli + Klebsiella + Proteus",
        "**Once-daily IV**, easy OPAT transition",
        "**Switch to oral** at 24–48 h once afebrile: cefpodoxime, cefdinir, or culture-directed",
        "**7-day course** sufficient for most uncomplicated (FQ → 5–7 d trials)",
      ],
      watchOut: [
        { sev: "warn", text: "**Local E. coli ESBL > 10%** in pyelo → consider ertapenem empirically" },
        { sev: "warn", text: "FQs no longer first-line — community E. coli FQ resistance often > 20–30%" },
        { sev: "note", text: "Gallbladder sludge with prolonged use (>2 weeks)" },
      ],
    },
  ],
  "ESBL risk / directed": [
    {
      rx: /carbapenem|ertapenem|meropenem/i,
      pickIf: "Prior ESBL isolate, recent broad β-lactam, or healthcare-associated pyelo.",
      whyPick: [
        "**Ertapenem 1 g IV q24h** — once-daily, OPAT-friendly, covers ESBL",
        "**Meropenem** if Pseudomonas risk (ertapenem misses Pseudo)",
        "**Step down to PO** based on susceptibilities — fosfomycin (lower-tract relapse), TMP-SMX, FQ",
      ],
      watchOut: [
        { sev: "stop", text: "**Ertapenem misses Pseudomonas + Acinetobacter + Enterococcus**" },
        { sev: "warn", text: "Meropenem ↓ valproate 60–90%" },
        { sev: "note", text: "**MERINO trial** — pip-tazo INFERIOR to meropenem for ESBL bacteremia" },
        { sev: "note", text: "**Carbapenem-sparing**: pip-tazo at MIC ≤ 16 in mild ESBL UTI is debated, not endorsed" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "7 d FQ for uncomplicated; 10–14 d β-lactam; carbapenem for ESBL — outpatient feasible in many.",
    evidence: "IDSA 2010 + Tansarli 2018 meta — 7 d FQ non-inferior to 14 d; β-lactam needs 10–14 d",
    branches: [
      { label: "Uncomplicated, FQ-treated", days: "7 d",
        detail: "Cipro/levo; outpatient acceptable if afebrile + tolerating oral + reliable follow-up",
        matchAgent: /ciprofloxacin|levofloxacin/i },
      { label: "β-lactam-treated", days: "10–14 d",
        detail: "Ceftriaxone → oral cefpodoxime / amox-clav; longer course than FQ" },
      { label: "Complicated / ESBL", days: "10–14 d carbapenem",
        detail: "Ertapenem (outpatient) or meropenem (severe); ID for novel β-lactams if resistant",
        matchAgent: /ertapenem|meropenem/i },
      { label: "Pregnancy", days: "10–14 d",
        detail: "Ceftriaxone IV then oral cephalexin / amox-clav; FQ contraindicated",
        matchAgent: /cephalexin/i },
    ],
    stopWhen: [
      "Afebrile ≥ 48 h",
      "Flank pain resolving; nausea / vomiting cleared",
      "WBC normalizing",
      "Tolerating oral therapy + adequate intake",
      "Source / obstruction relieved if present",
      "Minimum 7 d FQ / 10–14 d β-lactam completed",
    ],
    extendIf: [
      { text: "**Urinary obstruction / stone / hydronephrosis** — relieve obstruction + extend",
        matchCtx: { severe: true } },
      "Renal / perinephric abscess on imaging — drainage + extend per source",
      { text: "**ESBL / CRE / MDR organism** confirmed — broaden + extend to 14 d",
        matchCtx: { esblRisk: true } },
      "Bacteremia confirmed — extend per organism (7–14 d typical)",
      "Immunocompromised host — extend per response",
    ],
  },
  monitoring: {
    headline: "Urine + blood cultures, imaging if no response by 72 h, urologic eval for obstruction.",
    items: [
      { sev: "required", what: "**Urine culture + susceptibilities** before empirics",
        why: "Narrowing on susceptibilities at 48–72 h drives stewardship + outcome" },
      { sev: "required", what: "**Blood cultures** if febrile + systemic signs",
        why: "Bacteremia in ~25%; positive culture drives broader workup + duration" },
      { sev: "required", what: "**Imaging (CT or US)** if no clinical response by 72 h",
        why: "Obstruction, abscess, emphysematous change — surgical / interventional decisions" },
      { sev: "trigger", what: "**Urology consult** for obstructed kidney + sepsis",
        why: "Decompression (stent, nephrostomy) is the inflection point for severe disease",
        matchCtx: { severe: true } },
      { sev: "trigger", what: "**Workup ESBL / MDR organism** if recurrent or recent broad antibiotics",
        why: "Empiric pivot to carbapenem; ID consult for resistant flora",
        matchCtx: { esblRisk: true } },
      { sev: "consider", what: "Workup for predisposing factors — stone disease, reflux, neurogenic bladder",
        why: "Recurrence prevention; urology follow-up for ongoing risk" },
    ],
  },
  rationale: {
    driver: "Pyelonephritis is E. coli–dominant — empiric ceftriaxone IV (or oral ciprofloxacin / levofloxacin if FQ resistance < 10% locally and outpatient eligible) covers > 90% of community isolates. Bacteremic GNR pyelo treats for 7 d post-clearance (BALANCE 2024). ESBL risk (recent broad antibiotics, healthcare exposure, prior ESBL isolate) shifts to ertapenem (outpatient) or meropenem (severe). Obstruction + sepsis = urology emergency; decompression (stent or nephrostomy) is the inflection point.",
    guideline: "balance",
    rejected: "Routine 14-d β-lactam was deliberately tempered — Talan (JAMA 2000) and Sandberg (Lancet 2012) established 5–7 d FQ non-inferior in uncomplicated pyelo, and BALANCE extended the 7-d principle to bacteremic GNR UTI. Empiric pip-tazo for ESBL pyelonephritis was rejected by MERINO (JAMA 2018): mortality 12.3% vs 3.7% on meropenem — use a carbapenem for serious ESBL bloodstream UTI." },
  objections: [
    { q: "Why not pip-tazo for ESBL pyelo — it's susceptible in vitro?",
      a: "MERINO (JAMA 2018 Harris, n=378) showed pip-tazo mortality 12.3% vs meropenem 3.7% in ceftriaxone-resistant E. coli / K. pneumoniae bacteremia — pip-tazo failed despite in-vitro susceptibility [cite:merino]. ESBL inoculum effect at urinary tract burden defeats the β-lactamase inhibitor; in-vitro MIC does not predict in-vivo outcome here. IDSA AMR-GN 2024 [cite:amrgn] mandates a carbapenem (ertapenem outpatient, meropenem severe) for ESBL bacteremic UTI." },
    { q: "Why 7 d ciprofloxacin not 14 d β-lactam?",
      a: "Talan (JAMA 2000, n=255) [cite:talan] showed cipro 7 d superior to TMP-SMX 14 d in uncomplicated pyelonephritis — faster defervescence and equal cure. Sandberg (Lancet 2012) confirmed 7 d FQ non-inferior to 14 d. BALANCE (NEJM 2025) [cite:balance] extends the 7-d principle to bacteremic GNR UTI. β-lactams need 10-14 d due to lower urinary concentrations + lack of the FQ tissue-penetration advantage; FQ short-course is the audit-defensible default in fluoroquinolone-eligible patients." },
    { q: "Why not oral step-down at 48 h if afebrile?",
      a: "Oral step-down at 48-72 h is strongly endorsed once the patient is afebrile, hemodynamically stable, tolerating oral, and has organism + susceptibilities back [cite:balance]. Cipro / levo (~100% bioavailability), TMP-SMX, or oral cephalosporin (cefpodoxime, cefdinir) all achieve adequate urinary levels. Reserve continued IV for septic shock, persistent fever, vomiting, severe obstruction with no source control, or no oral option (NPO post-op). Stewardship + LOS gains are real." },
    { q: "Why urology consult for obstruction — can't we just antibiotic-treat?",
      a: "Obstructed kidney + sepsis is a urology emergency — decompression (ureteral stent or nephrostomy) is the inflection point for survival per AUA and IDSA guidance [cite:balance]. Antibiotics cannot sterilize an obstructed system; the obstructed kidney becomes a closed-space abscess equivalent. Delaying drainage in favor of antibiotic optimization is high-mortality. Urology consult at the bedside, not the next-day rounds, when CT shows obstruction." },
  ],
  research: {
    headline: "FQ 5–7 d non-inferior to 10–14 d in uncomplicated; resistance + collateral damage drive alternatives.",
    trials: [
      { name: "Talan JAMA 2000",
        n: "255",
        question: "Ciprofloxacin 7 d vs TMP-SMX 14 d in pyelonephritis",
        finding: "Cipro 7 d superior in clinical cure + faster defervescence — established short-course FQ paradigm",
        bias: "Pre-resistance era; FQ resistance now > 20% in many U.S. centers" },
      { name: "Sandberg Lancet 2012",
        n: "248",
        question: "Cipro 7 d vs 14 d in women with pyelonephritis",
        finding: "7 d non-inferior to 14 d with fewer AEs — supports IDSA short course",
        bias: "Swedish cohort; low baseline resistance" },
      { name: "Eliakim-Raz CID 2013 meta-analysis",
        n: "8 trials",
        question: "Short course (≤ 7 d) vs longer course in pyelonephritis",
        finding: "Equivalent clinical cure; consistently lower AE rate with short course",
        bias: "Heterogeneous regimens + severity; conclusions hold across subgroups" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2010,
        topic: "Uncomplicated UTI in women (Gupta)",
        keypoint: "FQ 5–7 d outpatient; β-lactam 10–14 d if FQ resistant; treat empirically based on local antibiogram" },
      { society: "EAU",
        year: 2024,
        topic: "European urological infection guidance",
        keypoint: "Aligned with IDSA; cefepime / pip-tazo for severe; carbapenem for ESBL risk" },
    ],
    openQuestions: [
      "Source control timing in obstructive pyelo — early decompression (< 24 h) standard but resource-limited",
      "Single oral β-lactam dose plus stepdown — emerging area; not standard",
      "Outpatient management for moderate disease — variable institutional practice",
    ],
  },
};

export default { id: "pyelo", regimen, decision };
