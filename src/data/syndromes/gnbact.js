/* ===========================================================
   GRAM-NEGATIVE BACTEREMIA — BALANCE 7 d if source controlled. = */

const regimen = {
  "Empiric": [
    {
      rx: /cefepime|piperacillin|antipseudomonal/i,
      pickIf: "GNR bacteremia, source unclear or culture pending.",
      whyPick: [
        "**Antipseudomonal β-lactam** until species + susceptibilities back",
        "Cefepime or pip-tazo; meropenem if ESBL risk",
        "Source control determines duration — line, abscess, urinary",
      ],
      watchOut: [
        { sev: "warn", text: "Don't ride empiric broad after 48–72 h — narrow on cultures" },
        { sev: "note", text: "**Short-course GNR bacteremia** — 7 d sufficient for uncomplicated (Yahav 2019)" },
      ],
    },
  ],
  "Directed": [
    {
      rx: /ceftriaxone|narrowest/i,
      pickIf: "Identified organism + susceptibilities — narrow.",
      whyPick: [
        "**Ceftriaxone** for susceptible E. coli / Klebsiella / Proteus",
        "**Cefepime** if AmpC-producing (Enterobacter, Serratia, Citrobacter)",
        "**Carbapenem** for ESBL; novel β-lactams for CRE",
        "Oral step-down (FQ, TMP-SMX, β-lactam) per susceptibilities and source",
      ],
      watchOut: [
        { sev: "warn", text: "**AmpC induction** with ceftriaxone in ESCAPPM organisms — use cefepime" },
        { sev: "note", text: "Repeat cultures at 48 h if persistent fever to rule out endovascular" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "7 d for source-controlled GNR bacteremia (BALANCE); 10-14 d for ESBL/CRE or uncontrolled.",
    evidence: "BALANCE 2024 (NEJM) — 7 vs 14 d non-inferior in source-controlled bacteremia",
    branches: [
      { label: "Source controlled, susceptible", days: "7 d",
        detail: "From first negative BCx; BALANCE bands apply" },
      { label: "ESBL / AmpC / KPC", days: "10–14 d",
        detail: "Carbapenem or novel β-lactam; ID input mandatory",
        matchAgent: /ertapenem|ceftolozane|ceftazidime-?avibactam|imipenem-?relebactam/i },
      { label: "Persistent bacteremia / inadequate source", days: "14–28 d",
        detail: "From first negative BCx after source control achieved" },
      { label: "Endovascular / hardware seeding", days: "≥ 4 wk",
        detail: "Endocarditis workup; TEE; hardware management drives total" },
    ],
    stopWhen: [
      "Source controlled",
      "Blood cultures negative ≥ 48 h",
      "Afebrile ≥ 48 h",
      "Speciation + susceptibility narrowing complete",
      "No new metastatic foci",
      "Minimum 7 d (BALANCE) completed",
    ],
    extendIf: [
      { text: "**ESBL / CRE / DTR-Pseudomonas** — extend per ID",
        matchCtx: { esblRisk: true } },
      "Persistent bacteremia > 72 h",
      "Endovascular seeding / hardware retained",
      { text: "**Septic shock + MDR substrate** — extend per response",
        matchCtx: { severe: true } },
    ],
  },
  monitoring: {
    headline: "BALANCE 7 d for controlled-source; narrow on culture data; ID for resistant flora.",
    items: [
      { sev: "required", what: "**Blood cultures q48h until clearance**",
        why: "Persistent BCx triggers source hunt + endovascular workup" },
      { sev: "required", what: "**Narrow on culture data** at 48-72 h",
        why: "Continued broad therapy drives resistance + collateral damage" },
      { sev: "required", what: "**Source control workup** — line, urinary, abdominal, lung",
        why: "Source identification + control is the inflection point" },
      { sev: "trigger", what: "**Add carbapenem or novel β-lactam** for ESBL / CRE",
        why: "MERINO 2018: pip-tazo inferior to meropenem for ESBL bacteremia",
        matchCtx: { esblRisk: true } },
      { sev: "trigger", what: "**TEE if endovascular foci suspected**",
        why: "GNR endocarditis rare but consequential; workup persistent bacteremia" },
      { sev: "consider", what: "**Procalcitonin trend** for duration debate at day 5",
        why: "Falling PCT supports BALANCE-style early stop" },
    ],
  },
  rationale: {
    driver: "BALANCE (NEJM 2025, n=3,608) is the modern anchor — 7 d non-inferior to 14 d at the 4% margin for 90-day mortality in GNR bacteremia with adequate source control, displacing the legacy 14-d default. The 7-d clock starts at the first negative blood culture, requires source control achieved, and excludes endovascular focus + immunocompromise + non-fermenters without control. Resistance phenotype redirects the agent: ESBL → carbapenem (MERINO showed pip-tazo mortality 12.3% vs 3.7% on meropenem and stopped early); AmpC → cefepime; KPC-CRE → ceftaz-avi or mero-vabor; metallo-CRE → cefiderocol or ceftaz-avi + aztreonam.",
    guideline: "balance",
    rejected: "The reflexive 14-d course was deliberately rejected — BALANCE 2025 and Yahav (CID 2019) both established 7 d non-inferior in source-controlled GNR bacteremia, and longer courses simply expose patients to AKI, C. difficile, and selection of resistant flora without benefit. Empiric piperacillin-tazobactam for serious ESBL bloodstream infection was rejected by MERINO (JAMA 2018): in-vitro susceptibility does not equal clinical efficacy at the inoculum + pK exposure of bacteremia — use a carbapenem." },
  objections: [
    { q: "Why 7 d for GNR bacteremia — legacy says 14 d?",
      a: "BALANCE (NEJM 2025, n=3,608) [cite:balance] established 7 d non-inferior to 14 d for 90-d mortality (14.5% vs 14.4%) in source-controlled bloodstream infection, including most GNR substrates; Yahav (CID 2019) earlier showed the same in a 604-patient cohort. The 7-d clock starts at the first negative blood culture and requires source control. Reserve 14+ d only for endovascular focus, undrained source, S. aureus, or immunocompromise — populations BALANCE excluded. The reflexive 14 d adds AKI + C. difficile + resistance with no survival benefit." },
    { q: "Why carbapenem for ESBL — pip-tazo is susceptible in vitro?",
      a: "MERINO (JAMA 2018 Harris, n=378) [cite:merino] showed pip-tazo mortality 12.3% vs meropenem 3.7% in ceftriaxone-resistant E. coli / K. pneumoniae bacteremia despite documented in-vitro susceptibility — the β-lactamase inhibitor fails at bacteremic inoculum. IDSA AMR-GN 2024 [cite:amrgn] mandates a carbapenem (ertapenem outpatient, meropenem severe) for bacteremic ESBL Enterobacterales. MIC does not predict in-vivo outcome at high-burden bloodstream substrate; the susceptibility report misleads in this specific scenario." },
    { q: "Why cefepime for AmpC — guidance used to say carbapenem?",
      a: "IDSA AMR-GN 2024 [cite:amrgn] withdrew the old caution against cefepime at MIC 4–8 for Enterobacter, K. aerogenes, and C. freundii — cefepime is stable to AmpC and now preferred over a carbapenem for moderate-risk inducers, sparing carbapenem pressure. The decades-old principle that AmpC inducers required carbapenem was based on in-vitro hyperexpression concerns that did not translate to clinical outcomes when cefepime PK targets were met. Reserve carbapenem for severe sepsis or shock with AmpC-positive isolates." },
    { q: "Why narrow at 48-72 h — patient stable on empirics?",
      a: "Stewardship-mandated narrowing at 48–72 h on culture data is one of the strongest mortality-neutral interventions per IDSA / SHEA 2016 [cite:stew] — continued broad coverage in a stable patient drives AKI, C. difficile, and resistance selection without survival benefit. The empiric breadth bought time during diagnostic uncertainty; once organism + susceptibilities define the substrate, the bargain ends. The default is narrow; reflexive continuation of broad therapy is an audit failure even when the patient looks fine." },
  ],
  research: {
    headline: "BALANCE established 7 d non-inferior to 14 d in source-controlled GNR bacteremia; MERINO showed pip-tazo inferior for ESBL.",
    trials: [
      { name: "BALANCE NEJM 2024",
        n: "3,608",
        question: "7 vs 14 d in GNR bacteremia",
        finding: "7 d non-inferior to 14 d at 4% margin for 90-d mortality; supports short-course in controlled-source GNR bacteremia",
        bias: "Excluded immunocompromised + endovascular focus" },
      { name: "MERINO JAMA 2018 (Harris)",
        n: "391",
        question: "Pip-tazo vs meropenem for ceftriaxone-resistant E. coli / K. pneumoniae bacteremia",
        finding: "Pip-tazo inferior — 30-d mortality 12.3% vs 3.7%; stopped early; use carbapenem for serious ESBL bloodstream infection",
        bias: "Susceptibility-defined cohort; clear signal" },
      { name: "Yahav CID 2019",
        n: "604",
        question: "7 vs 14 d in GNR bacteremia (Israeli cohort)",
        finding: "7 d non-inferior; first major RCT establishing short-course paradigm",
        bias: "Single-region; underrepresented Pseudomonas + ESBL" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2024,
        topic: "MDR Gram-negative empiric (Tamma)",
        keypoint: "ESBL → carbapenem; AmpC → cefepime; KPC-CRE → ceftaz-avi or mero-vabor; metallo-CRE → cefiderocol or ceftaz-avi + aztreo" },
    ],
    openQuestions: [
      "Optimal duration in Pseudomonas bacteremia — BALANCE excluded; 7–14 d range",
      "Empiric ESBL coverage in HCAQ — antibiogram-driven",
      "Routine post-treatment cultures — not standard absent persistent fever",
    ],
  },
};

export default { id: "gnbact", regimen, decision };
