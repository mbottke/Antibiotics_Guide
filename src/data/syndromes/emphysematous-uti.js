/* ===========================================================
   EMPHYSEMATOUS UTI — surgical emergency in diabetics. ============ */

const regimen = {
  "Empiric": [
    {
      rx: /antipseudomonal|piperacillin|cefepime/i,
      pickIf: "Gas in renal parenchyma / collecting system — urologic emergency.",
      whyPick: [
        "**Antipseudomonal β-lactam** + urgent urologic intervention",
        "Predominantly diabetic patients; gas-producing E. coli or Klebsiella",
        "**Decompression / nephrostomy / nephrectomy** drives outcomes",
        "Mortality ~25% even with optimal management",
      ],
      watchOut: [
        { sev: "stop", text: "**Antibiotics alone fail** — urology now, not after antibiotics" },
        { sev: "warn", text: "DKA management concurrent — feeds the bacterial growth" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Surgical / urologic emergency; nephrectomy + 2–4 wk antibiotics for severe.",
    evidence: "Society consensus — type-stratified outcomes; type 1 (parenchymal) = nephrectomy frequently",
    branches: [
      { label: "Mild gas (collecting system only)", days: "2–3 wk",
        detail: "Pip-tazo or carbapenem + drainage / stent; nephrectomy if no response",
        matchAgent: /piperacillin|meropenem/i },
      { label: "Severe parenchymal involvement", days: "Nephrectomy + 4 wk",
        detail: "Mortality 25–50%; emergent surgery + extended antibiotic course" },
      { label: "Bilateral or transplant kidney", days: "Extended",
        detail: "Renal-preserving approaches; multidisciplinary team essential" },
    ],
    stopWhen: [
      "Imaging shows resolution of gas + parenchymal changes",
      "Cultures cleared",
      "Afebrile ≥ 1 week",
      "Renal function stabilized (or replacement therapy if needed)",
      "Glycemic control optimized",
    ],
    extendIf: [
      { text: "**Parenchymal extension** (type 1) — surgical emergency",
        matchCtx: { severe: true } },
      "Diabetic ketoacidosis or hyperosmolar state — complex co-management",
      "Bilateral involvement — extend per response + renal preservation",
      "Persistent gas on imaging at 2 wk — drainage / surgery escalation",
    ],
  },
  monitoring: {
    headline: "Emergent urology / surgery; glycemic control; DKA surveillance; multidisciplinary team.",
    items: [
      { sev: "required", what: "**Emergent urology / surgery consult** at presentation",
        why: "Type 1 parenchymal involvement → nephrectomy often required" },
      { sev: "required", what: "**DKA / hyperosmolar surveillance + correction**",
        why: "Underlying metabolic decompensation drives outcomes; co-management mandatory" },
      { sev: "required", what: "**Imaging (CT preferred) within hours** of suspicion",
        why: "Type stratification (parenchymal vs collecting system) drives surgical decision" },
      { sev: "trigger", what: "**Drainage / stenting** for collecting-system disease",
        why: "Decompression may preserve kidney if parenchyma intact" },
      { sev: "trigger", what: "**Nephrectomy** for parenchymal disease + sepsis",
        why: "Mortality 25–50% with parenchymal involvement; surgical emergency",
        matchCtx: { severe: true } },
      { sev: "consider", what: "**Glycemic control protocol** post-acute phase",
        why: "Recurrence prevention; HbA1c < 7 reduces re-infection risk" },
    ],
  },
  rationale: {
    driver: "Emphysematous pyelonephritis is a diabetic urology emergency with class-stratified mortality — Huang (Kidney Int 2007) anchors emergent CT for type stratification: Class I (collecting system gas only) is drainage-treatable, Class II (parenchymal) usually requires PCD + broad antibiotics, Class III–IV (extension to perinephric or systemic involvement) carries 25–50% mortality and most often requires emergent nephrectomy. Empiric pip-tazo or carbapenem covers the dominant Enterobacterales (E. coli, Klebsiella) substrate, with antibiotic course of 2–4 weeks following surgical adequacy. DKA / hyperosmolar correction and tight glycemic control run in parallel with the surgical pathway — the metabolic substrate drives outcomes.",
    guideline: "balance",
    rejected: "Antibiotic-only management of parenchymal (Class III–IV) emphysematous pyelonephritis was deliberately rejected — Huang + AUA 2024 show medical-only management has near-uniform failure at this class, and emergent nephrectomy is the rescue intervention with measurable survival benefit. Conservative trial of severe disease was tempered: each hour of delay in surgical decompression compounds mortality, and the diabetic metabolic substrate cannot be corrected fast enough to obviate the surgical decision." },
  objections: [
    { q: "Why emergent nephrectomy — can't we trial antibiotics first?",
      a: "Class III–IV emphysematous pyelonephritis (parenchymal extension) has near-uniform medical-only failure with 25–50% mortality per Huang Kidney Int 2007 [cite:balance]. AUA 2024 anchors emergent nephrectomy as the rescue intervention because each hour of delay compounds mortality and the diabetic metabolic substrate cannot be corrected fast enough to obviate surgery. Class I (collecting-system gas only) accepts PCD + broad antibiotics; parenchymal disease does not [cite:ssc]." },
    { q: "Why broad pip-tazo or carbapenem — UTI is usually narrow?",
      a: "Emphysematous pyelo carries high baseline ESBL / MDR prevalence (diabetic substrate, prior healthcare exposure, gas-forming pathogens like K. pneumoniae and proteus) — IDSA AMR-GN 2024 [cite:amrgn] anchors empiric pip-tazo or carbapenem until cultures return. Inadequate initial therapy in septic shock drives mortality per SSC 2021 [cite:ssc]. De-escalate aggressively at 48–72 h on susceptibilities; broad-then-narrow is the right risk balance here." },
    { q: "Why DKA correction in parallel — focus on the infection?",
      a: "The diabetic metabolic substrate is the driver — DKA and hyperosmolar state perpetuate gas-forming pathogen growth and impair phagocyte function per Huang [cite:balance]. SSC 2021 [cite:ssc] anchors parallel resuscitation: aggressive insulin + fluid + electrolyte correction runs alongside surgery and antibiotics. Glycemic control post-acute (HbA1c < 7) reduces recurrence. Sequential management (treat sepsis then DKA) is wrong; both are emergent." },
  ],
  research: {
    headline: "Mortality 25-50% with parenchymal involvement; emergent surgical decompression + urology; diabetic control critical.",
    trials: [
      { name: "Huang Kidney Int 2007",
        n: "Cohort",
        question: "Emphysematous pyelonephritis classification + surgery thresholds",
        finding: "Class I-II → conservative + drainage; Class III-IV → emergent nephrectomy; diabetic substrate drives outcomes",
        bias: "Asian cohort; classification widely adopted" },
    ],
    guidelines: [
      { society: "AUA",
        year: 2024,
        topic: "Emphysematous urinary tract infection",
        keypoint: "Class-stratified surgical thresholds; diabetic glycemic control; broad antibiotics + PCD" },
    ],
    openQuestions: [
      "Class III-IV conservative trial — high mortality without surgery",
      "Renal-preserving surgical approach — selected cases",
    ],
  },
};

export default { id: "emphysematous-uti", regimen, decision };
