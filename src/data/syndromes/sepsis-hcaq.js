/* ===========================================================
   SEPSIS — Healthcare-associated. Prior colonization + recent
   antibiotic exposure expand the empiric breadth and the
   duration considerations. ========================================= */

const regimen = {
  "Broad empiric": [
    {
      rx: /antipseudomonal|cefepime|piperacillin|meropenem/i,
      pickIf: "Hospital-onset sepsis or ≥ 90 d ICU / hemodialysis / SNF exposure.",
      whyPick: [
        "**Antipseudomonal β-lactam + vancomycin** is the standard backbone",
        "Pick **meropenem** if prior ESBL or broad β-lactam in last 90 d",
        "**Extended infusion** β-lactam preferred — better PK/PD vs nosocomial GNR",
        "Always pair with **vancomycin** (or linezolid) — MRSA carriage is common",
      ],
      watchOut: [
        { sev: "warn", text: "**Pip-tazo + vanco AKI** — favor cefepime in renal-fragile" },
        { sev: "warn", text: "**Cefepime neurotoxicity** if renal dosing missed" },
        { sev: "stop", text: "Recent CRE colonization — empiric carbapenem may fail; ID consult" },
      ],
    },
  ],
  "Resistant-GNR risk": [
    {
      rx: /carbapenem|novel|β-?lactam/i,
      pickIf: "Prior ESBL, CRE, DTR-Pseudomonas, or recent broad β-lactam.",
      whyPick: [
        "**Meropenem** covers most ESBL; **ceftaz-avi** or **imipenem-relebactam** for KPC-CRE",
        "**Ceftolozane-tazo** for DTR-Pseudomonas — preserves carbapenems",
        "**Cefiderocol** salvage for MBL producers + Acinetobacter / Stenotrophomonas",
        "Match drug to **resistance mechanism**, not just antibiogram MIC",
      ],
      watchOut: [
        { sev: "stop", text: "**MBL CRE** — ceftaz-avi inactive; use aztreonam + ceftaz-avi OR cefiderocol" },
        { sev: "warn", text: "Novel β-lactams cost $1k+/day — get ID stewardship sign-off" },
        { sev: "note", text: "Re-culture every 48 h — switch the moment a narrower active agent appears" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "7–10 d for controlled-source bacteremia; longer if MDR organism or persistent bacteremia.",
    evidence: "BALANCE 2024 — non-inferiority of 7 d holds in healthcare cohort; ID input for ESBL/CRE durations",
    branches: [
      { label: "Source controlled, susceptible organism", days: "7 d",
        detail: "From first negative BCx; same BALANCE bands as community sepsis" },
      { label: "ESBL / AmpC / KPC bacteremia", days: "10–14 d",
        detail: "Longer course standard; ID input mandatory; carbapenem or novel β-lactam",
        matchAgent: /ceftolozane|ceftazidime-?avibactam|imipenem-?relebactam/i },
      { label: "Persistent bacteremia / line not removed", days: "14–28 d",
        detail: "From first negative BCx after source-control achieved" },
      { label: "Septic shock + MDR substrate", days: "14 d",
        detail: "Extended course standard; ICU + ID partnership; reassess at day 7 for de-escalation feasibility" },
    ],
    stopWhen: [
      "Source controlled (line removed, abscess drained, urinary obstruction relieved)",
      "All blood cultures negative ≥ 48 h",
      "Afebrile ≥ 48 h, off vasopressors",
      "Speciation + susceptibility data narrowing complete",
      "No new metastatic foci on exam / imaging",
      "Minimum 7 d for susceptible organism; 10–14 d for ESBL+",
    ],
    extendIf: [
      { text: "**ESBL / CRE / DTR-Pseudomonas** confirmed — extend minimum to 10–14 d",
        matchCtx: { esblRisk: true } },
      "Persistent bacteremia > 72 h on appropriate therapy",
      "Indwelling hardware retained (catheter, port, valve)",
      { text: "**Septic shock** + MDR substrate — extend to 14 d minimum",
        matchCtx: { severe: true } },
      "Metastatic foci identified — extend per source (osteo 6 wk, IE 4–6 wk, abscess by drainage)",
    ],
  },
  monitoring: {
    headline: "BCx q48h, MDR colonization workup, narrow on speciation, ID partnership early.",
    items: [
      { sev: "required", what: "**Blood cultures q48h** until clearance + speciation",
        why: "Persistent BCx in healthcare cohort triggers MDR workup + source re-search" },
      { sev: "required", what: "**Review prior cultures + colonization history** before narrowing",
        why: "Healthcare-cohort patients carry their own resistance signature; narrow toward known susceptibilities" },
      { sev: "required", what: "**ID consult** for any DTR-Pseudomonas / CRE / ESBL identification",
        why: "Novel β-lactam selection requires mechanism-matched drug — ID-driven",
        matchCtx: { esblRisk: true } },
      { sev: "required", what: "**Source control** — imaging + procedural eval; line removal threshold low",
        why: "Healthcare-acquired bacteremia is line-source until proven otherwise" },
      { sev: "trigger", what: "**Daily SCr** on combination + nephrotoxic exposure",
        why: "Concurrent AKI substrate common in HCAQ patients (contrast, prior abx, age)",
        matchCtx: { any: [{ crcl: { lt: 60 } }, { age: { gte: 75 } }] } },
      { sev: "trigger", what: "**TDM (vancomycin AUC; aminoglycoside trough)** strict in this cohort",
        why: "Higher renal/oto risk + frequent under- or over-dosing in complex hosts",
        matchAgent: /vancomycin|gentamicin|tobramycin|amikacin/i },
      { sev: "trigger", what: "**HD coordination** — dialytic vancomycin / β-lactam adjustment",
        why: "Dialytic clearance reshapes PK fundamentally; nephrology + pharmacy partnership",
        matchCtx: { hd: true } },
      { sev: "consider", what: "Antibiogram-driven adjustments — institution-specific resistance patterns",
        why: "Local data overrides published norms in HCAQ flora" },
    ],
  },
  rationale: {
    driver: "Healthcare-associated sepsis carries the patient's prior antibiotic and colonization signature — recent hospitalization, indwelling devices, nursing-facility residence, and dialysis all shift the empiric substrate toward MRSA, ESBL, AmpC, and DTR-Pseudomonas. The empiric backbone is mechanism-matched per IDSA 2024 (Tamma) anchored to the local antibiogram: anti-pseudomonal β-lactam (cefepime or pip-tazo) + vancomycin for severe shock or known MRSA colonization; carbapenem or novel β-lactam (ceftolozane-tazobactam, ceftazidime-avibactam) only when an ESBL / CRE / DTR risk profile is present. Duration follows BALANCE — 7 d for source-controlled GNR bacteremia, 10–14 d for ESBL/CRE — and Hour-1 bundles (SSC 2021) drive survival.",
    guideline: "ssc",
    rejected: "Reflexive empiric pip-tazo + vancomycin in every HCAQ host was deliberately tempered — the combination roughly doubles AKI risk vs cefepime + vancomycin without survival benefit, and the substrate often allows a narrower empiric anchored to local antibiogram + prior colonization data. Empiric carbapenem-as-default was rejected: blanket coverage accelerates carbapenem resistance and loses activity for true CRE / DTR cases (IDSA 2024). Continuing 14-d courses past BALANCE was tempered — 7 d non-inferior in controlled-source GNR bacteremia, even in HCAQ subset analyses." },
  objections: [
    { q: "Why pip-tazo + vanco — cefepime spares AKI risk?",
      a: "IDSA 2024 AMR-GN guidance [cite:amrgn] permits either anti-pseudomonal β-lactam empirically, but pip-tazo + vancomycin roughly doubles AKI vs cefepime + vancomycin in retrospective cohorts (Luther 2018) without survival benefit per Surviving Sepsis [cite:ssc]. Default to cefepime + vancomycin unless the patient has known pip-tazo-susceptible ESBL colonization or anaerobic source. The AKI signal is most pronounced in baseline CrCl < 60 and dialysis substrate — exactly the HCAQ host." },
    { q: "Why empiric carbapenem at admission for HCAQ sepsis?",
      a: "Reflexive empiric carbapenem in every HCAQ presentation drives resistance without survival benefit — IDSA 2024 [cite:amrgn] reserves meropenem for documented ESBL bacteremia, severe-shock + ESBL colonization history, or anti-pseudomonal failure. Cefepime or pip-tazo anchored to the local antibiogram covers the dominant HCAQ flora at lower collateral damage. Carbapenem stewardship preserves activity for true CRE / DTR cases where it remains the backbone; blanket use accelerates the resistance arc." },
    { q: "Why stop at 7 d when MERINO showed ESBL needs longer?",
      a: "BALANCE NEJM 2024 [cite:balance] established 7 d non-inferior to 14 d in source-controlled GNR bacteremia including the HCAQ subset — the duration extends to 10–14 d only for confirmed ESBL / CRE per IDSA AMR-GN 2024 [cite:amrgn] because in-vivo response in resistant bacteremia trails susceptibility data. MERINO addressed agent choice (pip-tazo vs meropenem in ESBL), not duration. Walk 7 d for susceptible, 10–14 d for ESBL/CRE; persistent bacteremia extends per source." },
    { q: "Why broad MRSA cover — patient nares-negative on prior swab?",
      a: "A negative MRSA nares PCR has 96–99% NPV for MRSA pneumonia and roughly 90% NPV for non-pulmonary MRSA infection — but Surviving Sepsis 2021 [cite:ssc] mandates empiric vanco at shock presentation until cultures return, because mortality from inadequate empiric MRSA cover in shock is catastrophic. Use nares-negative status to drive 48–72 h de-escalation, not to skip the empiric. Stewardship lives in the de-escalation step, not the initial Hour-1 bundle." },
  ],
  research: {
    headline: "Same 7-day BALANCE principle as community sepsis with broader empiric coverage for HCAQ flora.",
    trials: [
      { name: "BALANCE NEJM 2024",
        n: "3,608",
        question: "7 vs 14 d in GNR bacteremia (including HCAQ subset)",
        finding: "7 d non-inferior; HCAQ subset performed similarly to community after de-escalation to targeted therapy",
        bias: "Excluded immunocompromised + endovascular focus" },
      { name: "Tabah Intensive Care Med 2020",
        n: "Cohort meta",
        question: "Empiric coverage adequacy in HCAQ vs community sepsis",
        finding: "Initial inadequate empiric coverage drives mortality; broader anti-pseudomonal + MRSA empiric in HCAQ reduces mismatch",
        bias: "Local antibiogram + risk-stratification variability" },
      { name: "Magill JAMA 2014 (CDC)",
        n: "National surveillance",
        question: "Healthcare-associated infection epidemiology + MDR burden",
        finding: "HCAQ MRSA + Pseudomonas + ESBL drive empiric strategy; antibiogram-driven choice essential",
        bias: "U.S. surveillance; regional variation important" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2024,
        topic: "Empiric antibiotic selection in MDR pathogens (Tamma)",
        keypoint: "Risk-stratified empiric broad coverage; de-escalation at 48–72 h on culture data" },
      { society: "SCCM / SSC",
        year: 2021,
        topic: "Surviving Sepsis Campaign",
        keypoint: "Hour-1 antibiotics + adequate empiric coverage for substrate (community vs HCAQ)" },
    ],
    openQuestions: [
      "Optimal duration in HCAQ Pseudomonas bacteremia — 7 d data weaker than community",
      "Routine MRSA empiric coverage in HCAQ — antibiogram-driven; institutional variation",
      "De-escalation timing thresholds — 48 vs 72 h debated",
    ],
  },
};

export default { id: "sepsis-hcaq", regimen, decision };
