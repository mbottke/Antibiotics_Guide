/* ===========================================================
   UROSEPSIS — bacteremic UTI; source control + sepsis bands. === */

const regimen = {
  "Empiric": [
    {
      rx: /ceftriaxone|antipseudomonal/i,
      pickIf: "Sepsis + UTI source — start broadly, narrow on cultures.",
      whyPick: [
        "**Ceftriaxone** for community urosepsis; antipseudomonal β-lactam if HCAI",
        "Add **vancomycin** if instrumented or septic shock",
        "**Source control** — relieve obstruction (stent, nephrostomy) if hydronephrosis",
        "Switch to **culture-directed** within 48 h",
      ],
      watchOut: [
        { sev: "stop", text: "**Obstruction + sepsis** = urologic emergency; antibiotics fail without decompression" },
        { sev: "warn", text: "Prior ESBL → use carbapenem empirically" },
        { sev: "note", text: "7-day course standard for uncomplicated bacteremic UTI" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "7 d controlled-source bacteremic UTI (BALANCE); longer if abscess, obstruction, or ESBL.",
    evidence: "BALANCE 2024 — 7 d non-inferior in controlled-source UTI bacteremia; ID for resistant flora",
    branches: [
      { label: "Source controlled (drained, obstruction relieved)", days: "7 d",
        detail: "From first negative BCx; BALANCE bands apply" },
      { label: "Inadequate source control", days: "10–14 d",
        detail: "Obstructed kidney, undrained abscess, retained catheter" },
      { label: "ESBL / MDR organism", days: "10–14 d",
        detail: "Carbapenem or novel β-lactam; ID input",
        matchAgent: /ertapenem|meropenem|ceftolozane|ceftazidime-?avibactam/i },
    ],
    stopWhen: [
      "Source controlled (obstruction relieved, abscess drained, catheter changed)",
      "Blood cultures cleared ≥ 48 h",
      "Afebrile ≥ 48 h, off vasopressors",
      "Urinary symptoms resolved (when assessable)",
      "Renal function stable / improving",
      "Minimum 7 d from first negative BCx",
    ],
    extendIf: [
      { text: "**Urinary obstruction / stone / hydronephrosis** — relieve + extend",
        matchCtx: { severe: true } },
      "Renal or perinephric abscess — drainage + extension",
      { text: "**ESBL / CRE / MDR organism** — extend per ID input",
        matchCtx: { esblRisk: true } },
      "Persistent bacteremia > 72 h on appropriate therapy",
    ],
  },
  monitoring: {
    headline: "Source-control imaging first 24 h; urology consult for obstruction; broad empirics until cultures back.",
    items: [
      { sev: "required", what: "**Imaging (CT or US) within 24 h** to rule out obstruction / abscess",
        why: "Source control is the inflection point; antibiotics fail with obstruction" },
      { sev: "required", what: "**Blood + urine cultures** before first dose",
        why: "Empiric therapy halves yield; targeted therapy at 48 h drives outcomes" },
      { sev: "required", what: "**Urology consult** for obstructed sepsis — decompression (stent / nephrostomy)",
        why: "Decompression within hours of sepsis recognition drives mortality reduction",
        matchCtx: { severe: true } },
      { sev: "trigger", what: "**Repeat BCx at 48 h** to confirm clearance",
        why: "Persistent bacteremia triggers endocarditis workup + extended course" },
      { sev: "trigger", what: "**Daily SCr** + AKI surveillance",
        why: "Sepsis + obstruction + nephrotoxic antibiotics drive AKI risk",
        matchCtx: { any: [{ crcl: { lt: 60 } }, { age: { gte: 75 } }] } },
      { sev: "consider", what: "**MRSA / Enterococcus / Pseudomonas cover** if healthcare exposure",
        why: "Empiric broadening in HCAQ patients; narrow on cultures" },
    ],
  },
  rationale: {
    driver: "Urosepsis with obstruction is a urology emergency — Wagenlehner (Lancet 2015) and SSC 2021 anchor emergent decompression (ureteral stent or percutaneous nephrostomy) within 6 h of sepsis recognition as the dominant mortality lever, because antibiotics fail with an obstructed kidney. Empirics cover Enterobacterales + Pseudomonas + enterococci broadly until cultures return; ESBL risk (recent broad antibiotics, healthcare exposure, prior ESBL isolate) shifts to ertapenem or meropenem. Once source control is achieved, BALANCE 2024 supports 7 d post-clearance for controlled-source bacteremic UTI — non-inferior to 14 d at the 4% margin. Persistent bacteremia > 72 h triggers endovascular and abscess re-evaluation.",
    guideline: "balance",
    rejected: "Empiric piperacillin-tazobactam for serious ESBL bloodstream UTI was deliberately rejected — MERINO (JAMA 2018) showed 30-d mortality 12.3% vs 3.7% on meropenem and was stopped early, so in-vitro pip-tazo susceptibility does not equal carbapenem-grade adequacy in this context. Reflexive 14-d duration after source control was tempered: BALANCE established 7 d non-inferior in controlled-source GNR bacteremia, and extending therapy without an undrained focus or endovascular substrate drives resistance and AKI without survival benefit." },
  objections: [
    { q: "Why emergent decompression — can't antibiotics treat the obstruction?",
      a: "An obstructed kidney with sepsis is a closed-space abscess equivalent — Wagenlehner (Lancet 2015) and SSC 2021 [cite:ssc] anchor emergent ureteral stent or percutaneous nephrostomy within 6 h of sepsis recognition as the dominant mortality lever, because antibiotics cannot sterilize an obstructed system. Each hour of decompression delay compounds mortality. Urology consult at bedside — not next-day rounds — once CT confirms obstruction [cite:balance]." },
    { q: "Why meropenem for ESBL bacteremia — pip-tazo is susceptible?",
      a: "MERINO (JAMA 2018, n=378) [cite:merino] showed 30-d mortality 12.3% on pip-tazo vs 3.7% on meropenem in ceftriaxone-resistant E. coli / K. pneumoniae bacteremia — stopped early for harm. ESBL inoculum effect at bacteremic urinary burden defeats the β-lactamase inhibitor regardless of in-vitro MIC. IDSA AMR-GN 2024 [cite:amrgn] mandates carbapenem (meropenem severe, ertapenem step-down) for bacteremic ESBL UTI." },
    { q: "Why only 7 d post-source-control — bacteremia historically gets 14 d?",
      a: "BALANCE (NEJM 2025, n=3608) [cite:balance] established 7 d non-inferior to 14 d in source-controlled GNR bacteremia including the large urosepsis subset — 90-d mortality 14.5% vs 14.4%. Extending beyond 7 d after adequate decompression drives resistance, AKI, and CDI without survival benefit [cite:stew]. Reserve longer courses for undrained focus, endovascular substrate, or persistent bacteremia > 72 h." },
    { q: "Why broad empirics in HCAQ urosepsis — narrow ceftriaxone usually works?",
      a: "Healthcare-exposed urosepsis carries baseline ESBL / Pseudomonas / Enterococcus prevalence that ceftriaxone misses, and inadequate initial therapy drives mortality per SSC 2021 [cite:ssc]. Start pip-tazo or carbapenem in HCAQ + recent-broad-antibiotic + prior-MDR-isolate substrates, then de-escalate aggressively at 48–72 h on cultures [cite:amrgn]. Broad-then-narrow beats narrow-then-broaden in septic shock." },
  ],
  research: {
    headline: "7 d controlled-source bacteremic UTI (BALANCE); decompression of obstruction is critical; sepsis bundle drives outcome.",
    trials: [
      { name: "BALANCE NEJM 2024",
        n: "3,608 (UTI subset)",
        question: "7 vs 14 d in GNR bacteremia (urosepsis subset large)",
        finding: "7 d non-inferior in source-controlled urosepsis subset; supports short course post-decompression",
        bias: "Excluded immunocompromised + endovascular focus" },
      { name: "Wagenlehner Lancet 2015",
        n: "Cohort",
        question: "Modern urosepsis epidemiology + outcomes",
        finding: "Obstruction + decompression timing drive outcomes; FQ resistance > 30% in many regions; empiric carbapenem warranted for severe ESBL-risk",
        bias: "Multi-country cohort; resistance epidemiology evolves" },
      { name: "SSC 2021",
        n: "Guideline",
        question: "Hour-1 antibiotic delivery + bundle",
        finding: "Antibiotics within 1 h + fluid resuscitation + vasopressor for shock + lactate-guided drive mortality reduction",
        bias: "Bundle compliance + selection effects" },
    ],
    guidelines: [
      { society: "SSC",
        year: 2021,
        topic: "Surviving Sepsis Campaign (Evans)",
        keypoint: "Hour-1 antibiotics; broad initial empiric + de-escalation at 48–72 h on culture data" },
      { society: "EAU",
        year: 2024,
        topic: "European urological sepsis",
        keypoint: "Aligned with SSC; emphasizes obstruction decompression within 6 h" },
    ],
    openQuestions: [
      "Decompression timing — < 6 h vs 24 h debated, faster trends to better",
      "Empiric broadening for HCAQ vs community urosepsis — antibiogram-driven",
      "Routine post-treatment culture — not standard absent symptoms",
    ],
  },
};

export default { id: "urosepsis", regimen, decision };
