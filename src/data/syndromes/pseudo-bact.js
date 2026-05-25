/* ===========================================================
   PSEUDOMONAS BACTEREMIA — single antipseudomonal sufficient. == */

const regimen = {
  "Susceptible": [
    {
      rx: /cefepime|piperacillin|meropenem|ceftazidime/i,
      pickIf: "Pseudomonas bacteremia, susceptible to standard antipseudomonal agents.",
      whyPick: [
        "**One active antipseudomonal agent** — equivalent to combination therapy (no mortality benefit)",
        "Cefepime, pip-tazo, meropenem, or ceftaz — pick by site + susceptibility + stewardship",
        "**Extended-infusion β-lactam** (4-hour) at MIC ≥ 4 improves PK/PD",
        "**Combination unnecessary** in most cases — combination drives toxicity without benefit",
      ],
      watchOut: [
        { sev: "warn", text: "**Persistence** → search source (line, lung, urinary obstruction); consider second-agent synergy + repeat MIC" },
        { sev: "warn", text: "**Inducible AmpC** in some strains — risk of breakthrough on cephalosporins; meropenem or cefepime preferred if mechanism uncertain" },
        { sev: "note", text: "Duration: 7–14 d for uncomplicated bacteremia (Yahav 2019); longer for endocarditis / immunocompromised" },
      ],
    },
  ],
  "DTR-Pseudomonas": [
    {
      rx: /ceftolozane|ceftazidime-?avibactam|imipenem-?relebactam/i,
      pickIf: "Difficult-to-treat Pseudomonas (resistant to all 1st-line antipseudomonals).",
      whyPick: [
        "**Ceftolozane-tazo** — first-choice DTR-Pseudomonas",
        "**Ceftaz-avi or imipenem-relebactam** alternatives by resistance mechanism",
        "**Cefiderocol** salvage for ceftolozane-resistant or MBL producers",
        "**ID consult mandatory** — match drug to resistance mechanism + colonization history",
      ],
      watchOut: [
        { sev: "warn", text: "**Cost ~$1k+/day** — stewardship review + duration discipline; document outcome-changing indication" },
        { sev: "warn", text: "**Combination + ID consult** if persistent bacteremia on novel agent — emerging resistance documented mid-course in case series" },
        { sev: "note", text: "Match drug to mechanism: KPC → ceftaz-avi or imipenem-relebactam; MBL → cefiderocol or aztreonam + ceftaz-avi; OXA → cefiderocol or polymyxin combo" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "7-14 d single antipseudomonal; novel β-lactams for DTR-Pseudomonas.",
    evidence: "Yahav 2019 — 7 d acceptable for uncomplicated; DTR-Pseudo per IDSA 2024 update",
    branches: [
      { label: "Susceptible, source controlled", days: "7-14 d",
        detail: "Cefepime, pip-tazo, meropenem, or ceftazidime; extended infusion if MIC ≥ 4" },
      { label: "DTR-Pseudomonas (CRPa)", days: "10–14 d",
        detail: "Ceftolozane-tazo, ceftaz-avi, or imipenem-relebactam per mechanism",
        matchAgent: /ceftolozane|ceftazidime-?avibactam|imipenem-?relebactam/i },
      { label: "Endocarditis / endovascular", days: "≥ 6 wk",
        detail: "Per IE bands; surgery often needed for Pseudomonas IE" },
      { label: "Cystic fibrosis exacerbation", days: "10–14 d",
        detail: "Often combination therapy; tobramycin / colistin adjunct" },
    ],
    stopWhen: [
      "Blood cultures cleared ≥ 48 h",
      "Source controlled",
      "Afebrile ≥ 48 h",
      "Clinical recovery (off pressors, lactate normal)",
      "Minimum 7 d (BALANCE-style) completed",
    ],
    extendIf: [
      { text: "**DTR / CRPa** — extend per ID",
        matchCtx: { esblRisk: true } },
      "Persistent bacteremia > 72 h",
      { text: "**Endocarditis / mycotic aneurysm** — extend per IE",
        matchCtx: { severe: true } },
      "Cystic fibrosis chronic colonization — long course typical",
    ],
  },
  monitoring: {
    headline: "Susceptibility-driven choice; combination unnecessary in most; ID for DTR.",
    items: [
      { sev: "required", what: "**Susceptibility testing** — cefepime, pip-tazo, meropenem, ceftazidime + novels",
        why: "Mechanism-driven novel β-lactam choice for DTR" },
      { sev: "required", what: "**Single antipseudomonal sufficient** in most",
        why: "Combination therapy lacks mortality benefit; drives toxicity" },
      { sev: "trigger", what: "**Novel β-lactam selection** per resistance mechanism",
        why: "KPC → ceftaz-avi or imipenem-rele; MBL → cefiderocol; OXA → cefiderocol or polymyxin",
        matchBranch: ["DTR-Pseudomonas (CRPa)"] },
      { sev: "trigger", what: "**ID consult mandatory** for DTR-Pseudomonas",
        why: "Mechanism-matched drug + dosing critical" },
      { sev: "trigger", what: "**TEE + endocarditis workup** if persistent bacteremia",
        why: "Pseudomonas IE rare but high-mortality" },
      { sev: "consider", what: "**Source workup** — line, lung, urinary, abdominal",
        why: "Identify + control source for cure" },
    ],
  },
  rationale: {
    driver: "Susceptible Pseudomonas bacteremia is managed with a single anti-pseudomonal β-lactam (cefepime, pip-tazo, meropenem, or ceftazidime) sufficient in most cases — Paul (BMJ 2014 meta) showed combination therapy does not reduce mortality overall and drives nephrotoxicity. Duration is 7–14 d in source-controlled disease; BALANCE excluded Pseudomonas, so the 7-d floor is extrapolated rather than proven. DTR-Pseudomonas (CRPa) requires mechanism-matched novel β-lactams per IDSA 2024 (Tamma): ceftolozane-tazobactam or ceftazidime-avibactam for most KPC-mediated, imipenem-relebactam alternative, cefiderocol for metallo-β-lactamases or pan-resistant strains. Extended-infusion β-lactams improve PK target attainment.",
    guideline: "amrgn",
    rejected: "Routine empiric β-lactam + aminoglycoside combination for Pseudomonas bacteremia was deliberately tempered — Paul 2014 and IDSA 2024 confirm no mortality benefit outside neutropenic / septic-shock empirics, and the renal cost of combination is unjustified after susceptibility narrowing. Inhaled adjunctive antibiotics for Pseudomonas pneumonia / bacteremia were rejected: IASIS + INHALE trials both negative for nebulized aminoglycoside or colistin add-on, despite intuitive appeal." },
  objections: [
    { q: "Why single antipseudomonal — combination feels safer?",
      a: "Paul (BMJ 2014 meta) [cite:amrgn] showed combination β-lactam + aminoglycoside did NOT reduce mortality vs monotherapy in Gram-negative bacteremia, including the Pseudomonas subgroup, while doubling AKI from aminoglycoside exposure. IDSA 2024 AMR-GN [cite:amrgn] supports single anti-pseudomonal β-lactam (cefepime, pip-tazo, meropenem, or ceftazidime) for susceptible disease; reserve empiric combination for neutropenic / septic-shock substrate where coverage probability matters at the empiric window. De-escalate at 48–72 h on susceptibility data even if started empirically." },
    { q: "Why ceftolozane-tazo for DTR-Pseudomonas — meropenem worked before?",
      a: "IDSA AMR-GN 2024 [cite:amrgn] matches the agent to the resistance mechanism, not the legacy MIC alone — DTR-Pseudomonas (carbapenem-resistant + ceftaz-resistant + cefepime-resistant) typically reflects efflux + porin loss + AmpC hyperexpression, where ceftolozane-tazobactam or ceftazidime-avibactam retain activity that older β-lactams have lost. Cefiderocol is the choice for metallo-β-lactamase or pan-resistant strains. Reflexive meropenem in DTR fails clinically because the resistance mechanism encompasses all classic β-lactams; mechanism-typing changes the agent." },
    { q: "Why 7 d for Pseudomonas — BALANCE excluded it?",
      a: "BALANCE (NEJM 2025) [cite:balance] explicitly excluded non-fermenters, so the 7-d signal in source-controlled GNR bacteremia is extrapolated rather than proven for Pseudomonas — 7–14 d is the accepted band per IDSA 2024 [cite:amrgn]. Yahav (CID 2019) included a Pseudomonas subgroup at 7 d non-inferior. Reserve 14 d for endovascular focus, persistent bacteremia, immunocompromise (BALANCE excluded these too), or DTR substrate where MIC ceiling makes longer exposure prudent. The default is short with a defined stop." },
    { q: "Why no inhaled colistin or tobramycin for Pseudomonas pneumonia?",
      a: "Adjunctive inhaled antibiotics for Pseudomonas pneumonia were rejected — IASIS and INHALE trials [cite:hapvap] both negative for survival or clinical cure in MDR Pseudomonas VAP. Aerosolized colistin or aminoglycoside has nephrotoxicity and bronchospasm risk without offsetting benefit when systemic therapy is adequately dosed (extended-infusion β-lactam to PK target). Reserve inhaled adjuncts for extreme-resistance scenarios with ID input — not as routine for Pseudomonas pneumonia or bacteremia." },
  ],
  research: {
    headline: "Anti-pseudomonal β-lactam ± aminoglycoside synergy; ID consult mandatory; novel β-lactams for MDR strains.",
    trials: [
      { name: "Hilf Am J Med 1989",
        n: "200",
        question: "Combination β-lactam + aminoglycoside vs monotherapy in Pseudomonas bacteremia",
        finding: "Combination reduced mortality in neutropenic + shock subgroup; monotherapy adequate in stable non-neutropenic",
        bias: "Pre-modern resistance era; combination data weaker in current literature" },
      { name: "Paul BMJ 2014",
        n: "Meta",
        question: "Combination vs monotherapy in Gram-negative bacteremia (incl. Pseudomonas)",
        finding: "Combination did NOT reduce mortality overall; supports empiric combination but de-escalation to monotherapy on susceptibility",
        bias: "Heterogeneous severity + organism mix" },
      { name: "Wagenlehner Lancet 2019 (RECAPTURE)",
        n: "Various",
        question: "Ceftolozane-tazobactam + ceftazidime-avibactam in MDR Pseudomonas",
        finding: "Novel β-lactams effective for ceftaz-resistant Pseudomonas; cefiderocol alternative for pan-resistant",
        bias: "Sponsored; cost + access limitations" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2024,
        topic: "Empiric therapy for MDR Pseudomonas (Tamma)",
        keypoint: "Anti-pseudomonal β-lactam first-line; novel β-lactams for MDR; combination only for empirical / severe / neutropenic" },
      { society: "ESCMID",
        year: 2022,
        topic: "European MDR Gram-negative",
        keypoint: "Aligned with IDSA; cefiderocol for pan-resistant; polymyxin combination limited indication" },
    ],
    openQuestions: [
      "Optimal duration in Pseudomonas bacteremia — BALANCE excluded; 7-14 d range",
      "Combination therapy persistence beyond empiric — generally NOT supported by RCT",
      "Inhaled adjunctive for Pseudomonas pneumonia — IASIS / INHALE negative",
    ],
  },
};

export default { id: "pseudo-bact", regimen, decision };
