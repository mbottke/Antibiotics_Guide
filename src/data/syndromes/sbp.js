/* ===========================================================
   SBP — Spontaneous bacterial peritonitis. AASLD 2021. Cirrhotic
   ascites; albumin reduces HRS + mortality. ====================== */

const regimen = {
  "Empiric": [
    {
      rx: /ceftriaxone/i,
      pickIf: "Cirrhotic ascites + PMN ≥ 250 in ascitic fluid.",
      whyPick: [
        "**Ceftriaxone 2 g IV q24h** — first-line for community SBP",
        "**5-day course** sufficient (was 10 d, shortened)",
        "**Repeat paracentesis at 48 h** — > 25% PMN drop = response",
      ],
      watchOut: [
        { sev: "warn", text: "**Hospital-acquired SBP / prior antibiotic exposure** → broaden to pip-tazo or meropenem" },
        { sev: "note", text: "PMN < 250 + symptoms / fever → still treat as SBP variant (CNNA)" },
      ],
    },
  ],
  "Add albumin": [
    {
      rx: /albumin/i,
      pickIf: "Cr > 1, BUN > 30, or bilirubin > 4 — high-risk SBP for HRS.",
      whyPick: [
        "**Albumin 1.5 g/kg day 1, 1 g/kg day 3** — Sort 1999 NEJM",
        "**Reduces HRS** and mortality in high-risk SBP",
        "Use **25% albumin** (concentrated, low-volume) — avoids overload risk",
      ],
      watchOut: [
        { sev: "warn", text: "**Volume overload** — caution in cardiac dysfunction; monitor JVP / pulmonary status during infusion" },
        { sev: "warn", text: "**Hyponatremia** can worsen with rapid colloid shift — check electrolytes before + after each dose" },
        { sev: "note", text: "**No albumin benefit** in low-risk SBP (Cr ≤ 1, BUN ≤ 30, bilirubin ≤ 4) — stewardship-sensitive" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "5 d ceftriaxone for community SBP; broaden + extend for healthcare-associated or non-response.",
    evidence: "AASLD 2021 — 5-day course standard; albumin 1.5/1 g/kg reduces HRS + mortality in high-risk SBP",
    branches: [
      { label: "Community SBP, susceptible", days: "5 d",
        detail: "Ceftriaxone 2 g IV q24h × 5 d; repeat paracentesis at 48 h confirms response",
        matchAgent: /ceftriaxone/i },
      { label: "Healthcare-associated SBP", days: "7–10 d",
        detail: "Broaden to pip-tazo or carbapenem; extend per response + susceptibility data",
        matchAgent: /piperacillin|meropenem|cefepime/i },
      { label: "Secondary peritonitis (mimic SBP)", days: "Per source",
        detail: "Surgical intervention + treat per peritonitis bands — not standard SBP duration" },
    ],
    stopWhen: [
      "Repeat paracentesis at 48 h: PMN drop > 25% from baseline",
      "Afebrile, hemodynamically stable",
      "Renal function stable or improving (HRS not progressing)",
      "Cultures cleared or appropriately treated",
      "Minimum 5 d completed for community SBP",
    ],
    extendIf: [
      { text: "**Inadequate PMN response** at 48-h paracentesis (< 25% drop) — broaden coverage + extend",
        matchCtx: { severe: true } },
      "Healthcare-associated organism identified — extend to 7–10 d",
      "Secondary peritonitis suspected — different treatment paradigm",
      "Spontaneous bacterial empyema co-infection — extend",
    ],
  },
  monitoring: {
    headline: "Repeat paracentesis at 48 h; albumin for HRS prevention; secondary peritonitis workup if no response.",
    items: [
      { sev: "required", what: "**Repeat paracentesis at 48 h** — PMN count + culture",
        why: "PMN drop > 25% confirms response; failure triggers broader coverage + secondary-peritonitis workup" },
      { sev: "required", what: "**Albumin 1.5 g/kg day 1 + 1 g/kg day 3** for high-risk SBP",
        why: "Cr > 1, BUN > 30, bilirubin > 4 → albumin reduces HRS + mortality (Sort 1999 NEJM)" },
      { sev: "required", what: "**Daily SCr** monitoring — HRS surveillance",
        why: "HRS is leading SBP complication; early detection drives albumin + terlipressin response" },
      { sev: "trigger", what: "**Secondary peritonitis workup** if PMN response inadequate + multiple organisms",
        why: "Surgical condition masquerading as SBP — perforation, abscess; CT + surgical consult" },
      { sev: "trigger", what: "**Secondary prophylaxis** post-resolution — ciprofloxacin 500 mg PO daily or TMP-SMX DS daily",
        why: "≥ 1 prior SBP episode → 70% recurrence within 1 year without prophylaxis; norfloxacin discontinued in U.S. since 2014" },
      { sev: "trigger", what: "**Hepatic stage reassessment** — Child-Pugh / MELD score driving transplant candidacy",
        why: "SBP episode marks decompensation; trigger for transplant evaluation if not already listed",
        matchCtx: { hepStage: { in: ["B", "C"] } } },
      { sev: "consider", what: "**Beta-blocker reduction** if HRS develops or hemodynamic instability",
        why: "Non-selective beta-blockers may worsen HRS; case-by-case decision" },
    ],
  },
  rationale: {
    driver: "SBP is enteric GNR (E. coli, Klebsiella) translocating across cirrhotic gut in over 70% of community episodes — empiric ceftriaxone 2 g IV q24h × 5 d covers this substrate without the breadth that drives resistance. The single most impactful adjunct is albumin (1.5 g/kg day 1 + 1 g/kg day 3) in high-risk hosts (Cr > 1, BUN > 30, bilirubin > 4) — Sort (NEJM 1999) showed HRS fell from 30% → 10% and in-hospital mortality 29% → 10%. Healthcare-associated or recent-hospitalization SBP broadens to pip-tazo or carbapenem given a >30% 3GC failure rate (Fernandez 2019).",
    guideline: "aasld",
    rejected: "Routine 10–14 d courses were deliberately rejected — 5 d ceftriaxone is non-inferior to longer regimens in community SBP with documented PMN response at 48 h, and longer courses select for resistant flora without changing outcomes. Universal albumin was tempered: Sigal (Gut 2007) and AASLD restrict the benefit to high-risk (Cr > 1 or bilirubin > 4), so routine administration in low-risk SBP wastes a costly resource without measurable gain." },
  objections: [
    { q: "Why 5 d — surely peritoneal infection needs longer?",
      a: "5 d ceftriaxone is the AASLD 2021 [cite:aasld] standard for community SBP with documented PMN response at 48 h (> 25% drop on repeat paracentesis) — Runyon's foundational cohorts and subsequent meta-analyses show no benefit from 10–14 d, and longer courses select for resistant gut flora without changing relapse. The 5-d floor is gated by AND-joined response criteria, not arbitrary; non-responders pivot to broaden + workup for secondary peritonitis, not reflexive extension." },
    { q: "Why ceftriaxone alone — should we broaden empirically?",
      a: "Community SBP is enteric GNR (E. coli, Klebsiella) translocating across cirrhotic gut in > 70% of episodes — ceftriaxone 2 g IV q24h covers this substrate without driving collateral resistance. AASLD 2021 [cite:aasld] reserves pip-tazo or carbapenem for healthcare-associated or recent-hospitalization SBP where Fernandez (2019) documented > 30% 3GC failure. Reflexive broad-spectrum empirics in community SBP wastes spectrum and selects MDR flora in a population that will be re-admitted." },
    { q: "Why mandatory albumin — adds cost without obvious need?",
      a: "Sort (NEJM 1999, n=126) showed albumin 1.5 g/kg day 1 + 1 g/kg day 3 dropped HRS from 30% → 10% and in-hospital mortality 29% → 10% in high-risk SBP — Sigal (Gut 2007) confirmed benefit is restricted to Cr > 1, BUN > 30, or bilirubin > 4 per AASLD 2021 [cite:aasld]. Universal albumin in low-risk SBP wastes a costly resource; selective use in the high-risk substrate is one of the most cost-effective interventions in hepatology." },
    { q: "Why secondary prophylaxis — drives resistance long-term?",
      a: "AASLD 2021 [cite:aasld] mandates secondary prophylaxis (cipro 500 mg PO daily or TMP-SMX DS daily) after first SBP episode — recurrence is ~70% within 1 year without it, and each recurrence carries 20–30% mortality. The resistance cost is real but the benefit-risk skews strongly toward prophylaxis; episode marks decompensation and trigger for transplant evaluation. Norfloxacin was historically preferred but discontinued in U.S. since 2014." },
  ],
  research: {
    headline: "5-d ceftriaxone + albumin reduces HRS + mortality in high-risk SBP; secondary prophylaxis prevents recurrence.",
    trials: [
      { name: "Sort NEJM 1999",
        n: "126",
        question: "Albumin (1.5 g/kg + 1 g/kg) adjunct to cefotaxime in SBP",
        finding: "Reduced HRS 30 → 10% and in-hospital mortality 29 → 10%; cornerstone of SBP management",
        bias: "Single-center Spanish cohort; replicated by subsequent trials and meta-analyses" },
      { name: "Sigal Gut 2007",
        n: "Meta-analysis",
        question: "Albumin restriction in low-risk SBP",
        finding: "Benefit limited to high-risk (bilirubin > 4 or Cr > 1) — supports selective albumin use",
        bias: "Pooled heterogeneous severity scoring" },
      { name: "Fernandez Hepatology 2019",
        n: "Various",
        question: "Healthcare-associated vs community SBP empiric choice",
        finding: "HA-SBP requires broader empiric (carbapenem or pip-tazo); 3GC fails > 30% of HA cases",
        bias: "Observational; reflects local epidemiology variation" },
    ],
    guidelines: [
      { society: "AASLD",
        year: 2021,
        topic: "Cirrhosis ascites + SBP (Biggins)",
        keypoint: "5-d course; albumin for high-risk; secondary prophylaxis with ciprofloxacin or TMP-SMX after first episode (norfloxacin no longer available in U.S.)" },
      { society: "EASL",
        year: 2018,
        topic: "European cirrhosis ascites + SBP",
        keypoint: "Aligned with AASLD; emphasizes daptomycin or vancomycin for nosocomial SBP" },
    ],
    openQuestions: [
      "Optimal SBP prophylaxis agent (cipro vs TMP-SMX vs rifaximin) — adherence + resistance variable",
      "Albumin dose in moderate-risk SBP — IDSA does not define hard threshold",
      "Empiric carbapenem in HA-SBP — local antibiogram-driven; institutional variation",
    ],
  },
};

export default { id: "sbp", regimen, decision };
