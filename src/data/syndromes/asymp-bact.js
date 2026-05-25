/* ===========================================================
   ASYMPTOMATIC BACTERIURIA — stewardship-only entry; treat
   pregnancy + pre-uro-instrumentation; do NOT treat elderly /
   catheter / diabetic / spinal cord injury. ================== */

const regimen = {
  "Treat only when indicated": [
    {
      rx: /pregnancy|urologic|do not/i,
      pickIf: "Pregnancy or pre-invasive urologic procedure ONLY.",
      whyPick: [
        "**Treat in pregnancy** — reduces pyelonephritis and preterm birth",
        "**Treat before urologic procedure** with mucosal trauma (TURP, stone surgery)",
        "**Don't treat** in any other adult — including elderly with delirium",
      ],
      watchOut: [
        { sev: "stop", text: "**Delirium alone is NOT a UTI** in catheterized / elderly — don't treat reflexively" },
        { sev: "stop", text: "Cloudy/smelly urine alone — colonization, not infection" },
        { sev: "warn", text: "Treating ASB in non-indicated populations = drives resistance + C. diff without benefit" },
        { sev: "note", text: "IDSA 2019 strong recommendation against treatment outside the two indications" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Treat ONLY pregnancy + pre-urologic instrumentation; do NOT treat most asymptomatic bacteriuria.",
    evidence: "IDSA 2019 ASB guidelines — treatment of non-pregnant ASB drives resistance + AKI without benefit; pregnant + pre-procedural exception",
    branches: [
      { label: "Pregnancy (any trimester)", days: "5–7 d",
        detail: "Nitrofurantoin (avoid term + G6PD) or amoxicillin or cephalexin per sensitivity",
        matchAgent: /nitrofurantoin|amoxicillin|cephalexin/i },
      { label: "Pre-urologic instrumentation (TURP, ureteroscopy)", days: "Single dose pre-op",
        detail: "Single targeted dose ~30 min before procedure; pathogen-directed per pre-op culture" },
      { label: "Elderly / catheter / diabetic / functional disability", days: "0 d antibiotics",
        detail: "Do NOT treat; antibiotic exposure drives resistance + collateral; treat symptomatic UTI only" },
      { label: "Renal transplant — first 1 mo post-tx", days: "5–7 d",
        detail: "Per transplant ID; treat ASB in immediate post-tx period; later ASB NOT treated" },
      { label: "Post-renal-tx > 1 mo", days: "0 d antibiotics",
        detail: "AST 2019 — do NOT treat asymptomatic; treat symptomatic UTI per transplant-uti bands" },
    ],
    stopWhen: [
      "Pregnancy treatment course completed",
      "Pre-procedural single dose given",
      "Asymptomatic state confirmed (no fever / dysuria / suprapubic pain)",
      "Symptomatic UTI ruled out by clinical re-eval",
    ],
    extendIf: [
      { text: "**Symptomatic infection** developing — treat per UTI bands",
        matchCtx: { severe: true } },
      "Pyelonephritis on imaging — per pyelonephritis bands",
      "Bacteremia — per source pathogen",
      "Pre-procedural extended course if delayed procedure",
    ],
  },
  monitoring: {
    headline: "Stewardship-only entry; treat pregnancy + pre-procedural; do NOT treat the rest; explicit education.",
    items: [
      { sev: "required", what: "**Stewardship** — do NOT treat asymptomatic bacteriuria",
        why: "IDSA 2019 — treatment of non-pregnant non-procedural ASB drives resistance + AKI + CDI without benefit" },
      { sev: "required", what: "**Symptom assessment** — fever, dysuria, suprapubic pain, flank pain, costovertebral angle tenderness",
        why: "Symptomatic UTI distinct from ASB; presence of any symptom changes paradigm" },
      { sev: "required", what: "**Pregnancy test** in childbearing age + bacteriuria",
        why: "Pregnancy is the indication for treatment; alters all subsequent decisions" },
      { sev: "trigger", what: "**Pre-procedural single dose** for urologic instrumentation",
        why: "Reduces bacteremia + UTI post-procedure; single dose adequate" },
      { sev: "trigger", what: "**Foley removal** if catheter-associated ASB",
        why: "Catheter is the source; removal alone often resolves; antibiotic adds no benefit" },
      { sev: "trigger", what: "**Cloudy urine + odor are NOT indications**",
        why: "Stewardship — common in elderly + dehydrated; misinterpretation drives unnecessary treatment" },
      { sev: "trigger", what: "**Mental status change alone is NOT an indication** in elderly",
        why: "Multiple confounders; ASB ≠ delirium cause; broader workup needed before antibiotics" },
      { sev: "consider", what: "**Patient + family education** on ASB stewardship",
        why: "Shared decision-making; reduces requests for unnecessary urine cultures + treatment" },
    ],
  },
  rationale: {
    driver: "Asymptomatic bacteriuria is a stewardship entry — Nicolle (IDSA 2019) anchors do-not-treat in the elderly, catheterized, diabetic, spinal-cord-injured, and functionally disabled because antibiotic exposure drives resistance, AKI, and C. difficile without preventing symptomatic UTI. The validated exceptions are narrow: pregnancy (any trimester, 5–7 d nitrofurantoin or amoxicillin or cephalexin to reduce preterm-birth and pyelonephritis risk) and pre-urologic-instrumentation (single targeted dose ~30 min pre-procedure to prevent bacteremia at TURP or ureteroscopy). Early renal-transplant ASB (< 1 month) is also treated. Cloudy urine, odor, and isolated mental-status change are NOT indications — Trautner (CID 2014) anchors broader workup before reflexive treatment in delirium.",
    guideline: "balance",
    rejected: "Reflexive treatment of catheter-associated, diabetic, or elderly ASB was deliberately rejected — Trautner + Nicolle anchor stewardship: antibiotics drive resistance and collateral damage with zero benefit on symptomatic UTI prevention. Treating mental-status change in the elderly with positive urine culture as default was tempered: IDSA + AGS now recommend broader workup (dehydration, drug effect, infection elsewhere) before committing to antibiotics, because ASB is rarely the delirium cause and reflexive treatment delays the real diagnosis." },
  objections: [
    { q: "Why not treat asymptomatic bacteriuria — UA is grossly positive?",
      a: "Nicolle IDSA 2019 [cite:stew] anchors a do-not-treat stance for ASB in elderly, catheter, diabetic, SCI, and functionally disabled patients — Trautner CID 2014 + Nicolle showed treatment drives resistance, AKI, CDI, and adverse events without preventing a single symptomatic UTI [cite:cdi]. The validated exceptions are narrow: pregnancy and pre-urologic-instrumentation. Pyuria + positive culture without symptoms is colonization, not infection. The UA alone is not the indication." },
    { q: "Why treat ASB in pregnancy when others get nothing?",
      a: "Untreated ASB in pregnancy progresses to pyelonephritis in 20–30% with associated preterm birth and low birth weight per Smaill (Cochrane 2019) [cite:stew]. Nicolle IDSA 2019 anchors 5–7 d nitrofurantoin (avoid term + G6PD), amoxicillin, or cephalexin by susceptibility. The placental + ureteric dilation + immunologic changes of pregnancy convert colonization into ascending infection — the risk/benefit inverts compared to non-pregnant adults [cite:balance]." },
    { q: "Why single-dose pre-TURP — surely a full course is safer?",
      a: "A single targeted dose ~30 min before urologic instrumentation prevents bacteremia and post-procedure UTI per Nicolle IDSA 2019 [cite:stew] — extended courses drive resistance without further benefit. Pre-op culture targets the empiric choice; second-generation cephalosporin or pathogen-directed agent suffices. ASB after the procedure reverts to do-not-treat unless symptomatic [cite:cdi]. Stewardship contracts the antibiotic exposure to the procedural window only." },
    { q: "Why no antibiotics for elderly with delirium + positive UA?",
      a: "AGS + IDSA 2019 explicitly recommend broader delirium workup (dehydration, hypoxia, drug effect, infection elsewhere) before committing to antibiotics — ASB is rarely the delirium cause and reflexive treatment delays the real diagnosis [cite:stew]. Trautner CID 2014 showed cloudy urine, odor, and isolated mental-status change are NOT indications. Cohort data: treatment-as-default in this scenario worsens outcomes by delaying actual diagnosis [cite:cdi]." },
  ],
  research: {
    headline: "IDSA 2019 — do NOT treat asymptomatic bacteriuria; treat ONLY pregnancy + pre-procedural urologic instrumentation.",
    trials: [
      { name: "Nicolle IDSA 2019",
        n: "Guideline",
        question: "Modern ASB management",
        finding: "Treating non-pregnant non-procedural ASB drives resistance + AKI + CDI without benefit; symptom-driven only",
        bias: "Guideline synthesis" },
      { name: "Trautner CID 2014",
        n: "Cohort",
        question: "ASB stewardship in catheterized patients",
        finding: "Catheter-associated ASB treatment harmful; cloudy urine + odor are NOT indications",
        bias: "Multi-center observational" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2019,
        topic: "Asymptomatic bacteriuria (Nicolle)",
        keypoint: "Do NOT treat ASB in elderly / catheter / diabetic / SCI; pregnancy + pre-procedural exception" },
    ],
    openQuestions: [
      "Mental status change in elderly + bacteriuria — broader workup",
      "Pre-procedural single dose timing — ~30 min before",
    ],
  },
};

export default { id: "asymp-bact", regimen, decision };
