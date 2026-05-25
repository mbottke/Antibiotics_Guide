/* ===========================================================
   CAUTI — IDSA 2009 + 2010 update. 7 d standard; remove
   catheter if possible. =========================================== */

const regimen = {
  "Empiric": [
    {
      rx: /ceftriaxone|antipseudomonal/i,
      pickIf: "Symptomatic catheter-associated UTI (fever + localizing or no other source).",
      whyPick: [
        "**Ceftriaxone** if no Pseudomonas risk; antipseudomonal β-lactam if recent hospitalization",
        "**Remove or change the catheter** — biofilm renders antibiotics partially ineffective",
        "**7-day course** if prompt response; **10–14 d** if delayed response",
        "Send urine culture **after catheter change**, not before — biofilm contamination",
      ],
      watchOut: [
        { sev: "stop", text: "**Don't treat asymptomatic bacteriuria** in catheterized patients (except pregnancy / pre-urologic surgery)" },
        { sev: "warn", text: "Pseudomonas common in long-term catheters — empirically cover if hospitalized > 1 wk" },
        { sev: "note", text: "Funguria in catheter usually colonization — remove catheter first, recheck" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "7 d if prompt resolution; 10–14 d if delayed response or catheter retained.",
    evidence: "IDSA 2010 — 7 d for prompt response, 10–14 d for delayed; remove or change catheter if possible",
    branches: [
      { label: "Prompt response, catheter removed", days: "7 d",
        detail: "Removal / change of catheter is essential; antibiotic course from change day",
        matchAgent: /ceftriaxone|ciprofloxacin/i },
      { label: "Delayed response or catheter retained", days: "10–14 d",
        detail: "Catheter biofilm prolongs treatment; switch catheter at start of therapy" },
      { label: "ESBL / Pseudomonas / MDR", days: "10–14 d",
        detail: "Cefepime, pip-tazo, or carbapenem per susceptibilities",
        matchAgent: /cefepime|piperacillin|meropenem/i },
    ],
    stopWhen: [
      "Afebrile ≥ 48 h",
      "Urinary symptoms resolved (when assessable)",
      "WBC normalizing",
      "Catheter removed or changed",
      "Source controlled (obstruction relieved)",
      "Minimum 7 d completed",
    ],
    extendIf: [
      "Catheter cannot be removed or changed",
      { text: "**Pseudomonas / ESBL / MDR** identified — extend per organism",
        matchCtx: { esblRisk: true } },
      "Bacteremia confirmed — extend per source",
      { text: "**Septic shock** at presentation — extend per ICU + response",
        matchCtx: { severe: true } },
    ],
  },
  monitoring: {
    headline: "Remove or change catheter; treat ASB only in pregnancy / pre-procedure; minimize catheter days.",
    items: [
      { sev: "required", what: "**Remove or change the urinary catheter** if at all possible",
        why: "Biofilm renders antibiotics partially effective; new catheter = better drainage" },
      { sev: "required", what: "**Treat asymptomatic bacteriuria only** in pregnancy or pre-urologic procedure",
        why: "ASB treatment in catheterized patients drives resistance without benefit (IDSA 2019)" },
      { sev: "required", what: "**Urine culture from new catheter** if cultures needed",
        why: "Cultures from old catheter reflect biofilm colonization, not bladder infection" },
      { sev: "trigger", what: "**Imaging** if no response by 72 h or sepsis",
        why: "Obstruction, abscess, papillary necrosis drive surgical / interventional decisions" },
      { sev: "trigger", what: "**Catheter-day reduction protocol** — daily review of catheter necessity",
        why: "Each catheter day adds infection risk; bladder retraining + intermittent cath alternatives" },
      { sev: "consider", what: "**Bladder scan + intermittent cath** alternatives for chronic catheter patients",
        why: "Reduces ongoing infection risk + improves quality of life" },
    ],
  },
  rationale: {
    driver: "CAUTI is a device-driven biofilm infection — Hooton (IDSA 2010 / 2024) anchors catheter removal or exchange as the dominant outcome lever because antibiotics alone are only partially effective against catheter biofilm, and the antibiotic clock should start from the change day. Empirics cover Enterobacterales + Pseudomonas + enterococci with broadening for resistant flora in prolonged-catheter hosts; 7 d if responding promptly, 10–14 d if delayed response or catheter retained, and 10–14 d for ESBL / Pseudomonas / MDR per susceptibility. Cultures must be drawn from a new catheter — old-catheter samples reflect biofilm colonization, not bladder infection.",
    guideline: "balance",
    rejected: "Reflexive treatment of asymptomatic catheter-associated bacteriuria was deliberately rejected — Trautner (CID 2014) + Nicolle (IDSA 2019) show treatment drives resistance, AKI, and C. difficile without preventing symptomatic CAUTI; only pregnancy and pre-urologic-procedure are validated exceptions. Standard 14-d courses for prompt responders were tempered: IDSA 2010 + the BALANCE short-course principle now support 7 d when source control (catheter change) is achieved and the patient responds." },
  objections: [
    { q: "Why not treat catheter-colonization bacteriuria — UA is loaded?",
      a: "Catheter-associated asymptomatic bacteriuria is a stewardship do-not-treat per Nicolle IDSA 2019 [cite:stew] — Trautner (CID 2014) showed treatment drives resistance, AKI, and C. difficile without preventing symptomatic CAUTI. Old-catheter urine reflects biofilm colonization, not bladder infection. Treat only fever, suprapubic / flank pain, systemic signs, or pregnancy / pre-urologic-procedure. Cloudy urine and odor alone are NOT indications." },
    { q: "Why exchange the catheter — antibiotics will work?",
      a: "Catheter biofilm is the source — antibiotics achieve only partial penetration into the polysaccharide matrix, and a retained device drives relapse per Hooton IDSA 2010 [cite:balance]. Removing or exchanging the catheter at therapy initiation re-starts the antibiotic clock from the change day and improves cure. CDC CAUTI bundle [cite:stew] anchors daily review of catheter necessity — each catheter day adds infection risk." },
    { q: "Why 7 d not 14 d for CAUTI with prompt response?",
      a: "IDSA Hooton 2010 [cite:balance] established 7 d for prompt clinical response with catheter exchange — BALANCE (NEJM 2025) extends the short-course principle to bacteremic GNR UTI [cite:balance]. Reserve 10–14 d for delayed response, retained catheter, or ESBL / Pseudomonas / MDR per susceptibilities [cite:amrgn]. Default short, extend only on specific triggers." },
  ],
  research: {
    headline: "Catheter removal/exchange drives outcome; 7 d if responding, 10–14 d if delayed; do NOT treat ASB in catheterized patients.",
    trials: [
      { name: "Hooton IDSA 2010 / 2024",
        n: "Guideline",
        question: "CAUTI diagnosis + treatment standard",
        finding: "7 d standard for prompt response; 10–14 d if delayed; catheter removal or exchange is the source-control intervention",
        bias: "Guideline synthesis; resistance epidemiology evolves" },
      { name: "Trautner CID 2014",
        n: "Cohort",
        question: "ASB vs symptomatic CAUTI distinction",
        finding: "Treating asymptomatic catheter-associated bacteriuria drives resistance + AKI + CDI without benefit; symptom-driven only",
        bias: "Multi-center observational; replicated" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2010,
        topic: "CAUTI diagnosis + treatment (Hooton)",
        keypoint: "Symptom-driven treatment; remove or exchange catheter; do NOT treat ASB" },
      { society: "CDC",
        year: 2024,
        topic: "CAUTI prevention bundle",
        keypoint: "Daily review of catheter necessity; alternatives (intermittent cath, condom drainage); aseptic insertion" },
    ],
    openQuestions: [
      "Optimal duration for delayed-response — 10–14 d most agreed",
      "Catheter exchange vs removal — removal preferred when feasible",
      "Routine post-treatment culture — not recommended absent symptoms",
    ],
  },
};

export default { id: "cauti", regimen, decision };
