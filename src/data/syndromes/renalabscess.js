/* ===========================================================
   RENAL / PERINEPHRIC ABSCESS — drainage + 4–6 wk. ============== */

const regimen = {
  "Empiric": [
    {
      rx: /antipseudomonal|vancomycin/i,
      pickIf: "Renal / perinephric abscess — radiologic diagnosis.",
      whyPick: [
        "**Antipseudomonal β-lactam ± vancomycin** if hematogenous S. aureus suspected",
        "**Image-guided drainage** for collections > 5 cm or not improving at 48–72 h",
        "Long course: **4–6 weeks** total; transition to PO when oriented to organism",
      ],
      watchOut: [
        { sev: "warn", text: "**Look for urolithiasis** — often a struvite or obstructed system" },
        { sev: "note", text: "Diabetics: emphysematous pyelonephritis is a distinct emergency — needs urgent decompression" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "4–6 wk total (2 wk IV + oral step-down) for drained abscess; longer if undrained.",
    evidence: "Society consensus — drainage essential for > 3–5 cm; antibiotic course from drainage day",
    branches: [
      { label: "Drained renal abscess", days: "4–6 wk total",
        detail: "2 wk IV minimum + 2–4 wk oral step-down; agent per susceptibilities" },
      { label: "Perinephric abscess", days: "6 wk + drainage",
        detail: "Often requires surgical or percutaneous drainage; longer course typical" },
      { label: "Hematogenous S. aureus seeding", days: "4–6 wk + TEE",
        detail: "TEE + endocarditis workup; treat per S. aureus bacteremia bands" },
    ],
    stopWhen: [
      "Imaging shows abscess resolution",
      "Cultures cleared",
      "Afebrile ≥ 1 week + clinical improvement",
      "WBC + inflammatory markers normalizing",
      "Minimum 4–6 wk total completed",
    ],
    extendIf: [
      "Undrained abscess > 3 cm",
      { text: "**Hematogenous S. aureus** seeding — TEE + endocarditis workup",
        matchCtx: { mrsaRisk: true } },
      "Diabetic / immunocompromised host — extend per response",
      "Recurrent abscess — workup for predisposing GU pathology",
    ],
  },
  monitoring: {
    headline: "Percutaneous drainage ≥ 3 cm; image-driven duration; endocarditis workup if S. aureus.",
    items: [
      { sev: "required", what: "**Percutaneous drainage** for abscess ≥ 3–5 cm",
        why: "Antibiotic-only management adequate only for small abscesses; drainage speeds resolution" },
      { sev: "required", what: "**Serial imaging at 2–4 wk intervals**",
        why: "Image-driven duration; persistent collection extends therapy + re-drainage decisions" },
      { sev: "required", what: "**Urology consult** for predisposing factors — stones, reflux, neurogenic bladder",
        why: "Underlying pathology drives recurrence prevention" },
      { sev: "trigger", what: "**TEE + endocarditis workup** if hematogenous S. aureus",
        why: "Endovascular source seeds kidney; missed = treatment failure",
        matchCtx: { mrsaRisk: true } },
      { sev: "trigger", what: "**Diabetic ketoacidosis surveillance** if diabetic + abscess",
        why: "Emphysematous changes + DKA → emergent surgical decompression" },
      { sev: "consider", what: "Step-down oral agent: cipro, TMP-SMX per susceptibilities",
        why: "Long IV courses → line complications; oral step-down at 2 wk standard" },
    ],
  },
  rationale: {
    driver: "Renal and perinephric abscess is a drainage-first disease — Lin (Mayo Clin Proc 2008) anchors percutaneous catheter drainage for collections ≥ 3–5 cm with surgical management reserved for multiloculated or PCD-failure lesions. Total course is 4–6 weeks (≈ 2 wk IV + 2–4 wk oral step-down) from the drainage day, with serial imaging at 2–4 wk driving extension decisions. Empirics target Enterobacterales (E. coli, Klebsiella) and shift toward S. aureus when hematogenous seeding is suspected — TEE plus endocarditis workup becomes mandatory because endovascular source missed = treatment failure. Diabetic substrate raises the threshold for emergent surgical decompression given emphysematous evolution risk.",
    guideline: "balance",
    rejected: "Antibiotic-only management of an abscess ≥ 3–5 cm was deliberately rejected — Lin + EAU 2024 anchor PCD because medical-only management has higher failure rates and longer total durations, and drainage yields culture data that drives targeted narrowing. Reflexive treatment as ascending pyelonephritis was tempered: hematogenous S. aureus seeding to the kidney requires TEE plus 4–6-wk endocarditis bands, and skipping endovascular workup in S. aureus seeding drives recurrence at the original valvular focus." },
  objections: [
    { q: "Why drain a 4 cm abscess — antibiotics could work alone?",
      a: "Lin (Mayo Clin Proc 2008) and EAU 2024 [cite:balance] anchor percutaneous catheter drainage for collections ≥ 3–5 cm because medical-only management has higher failure rates, longer total durations, and missed culture data that drives targeted narrowing. Drainage day re-starts the antibiotic clock and shortens total course. Antibiotic-only management is acceptable only for small (< 3 cm) lesions in responding patients." },
    { q: "Why TEE if blood cultures grow S. aureus?",
      a: "Hematogenous S. aureus seeding to the kidney implies endovascular source, and missed endocarditis at this presentation drives recurrence at the valvular focus per IDSA SAB guidance [cite:ie]. TEE plus 4–6-wk endocarditis bands replace the 2-wk standard. ID consult mandatory in any S. aureus renal abscess — the mortality benefit of ID involvement in SAB is ~20% absolute [cite:ie]." },
    { q: "Why 4–6 wk total — pyelonephritis is only 7 d?",
      a: "Renal / perinephric abscess is a collection-bounded infection where antibiotics achieve subtherapeutic concentrations within necrotic tissue — Lin and Mayo cohort [cite:balance] anchor 4–6 wk total (2 wk IV + 2–4 wk oral step-down) from the drainage day, with serial imaging at 2–4 wk extending if collection persists. Shortening to pyelonephritis duration (7 d) drives 30–50% relapse [cite:stew]. Image-driven, not calendar-driven." },
  ],
  research: {
    headline: "Drainage drives outcome; > 3-5 cm collections percutaneously drained; 4-6 wk total with oral step-down.",
    trials: [
      { name: "Lin Mayo Clin Proc 2008",
        n: "Cohort",
        question: "Modern renal/perinephric abscess management",
        finding: "PCD for ≥ 3-5 cm collections; surgical for multiloculated or failure; 2 wk IV then oral × 2-4 wk",
        bias: "Single-center" },
    ],
    guidelines: [
      { society: "EAU / AUA",
        year: 2024,
        topic: "Renal abscess management",
        keypoint: "Drainage + 4-6 wk targeted antibiotic; workup endocarditis source for S. aureus" },
    ],
    openQuestions: [
      "Endovascular workup threshold — S. aureus or persistent",
      "Surgical thresholds — multiloculated or PCD failure",
    ],
  },
};

export default { id: "renalabscess", regimen, decision };
