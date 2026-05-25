/* ===========================================================
   COPD EXACERBATION — Anthonisen criteria; 5 d standard; longer
   for bronchiectasis substrate or P. aeruginosa. ============= */

const regimen = {
  "Standard": [
    {
      rx: /aminopenicillin|amox/i,
      pickIf: "Outpatient COPD exacerbation, no Pseudomonas risk, no recent abx.",
      whyPick: [
        "**Amox-clavulanate** — covers H. influenzae, Moraxella, S. pneumoniae",
        "**5 days oral** — REDUCE trial showed equivalence to longer courses",
        "Cheap, well-tolerated, oral",
      ],
      watchOut: [
        { sev: "warn", text: "**GI side effects** common; counsel before discharge" },
        { sev: "warn", text: "Cholestatic hepatitis — rare but classic" },
        { sev: "note", text: "Doxycycline / macrolide acceptable alternatives" },
      ],
    },
    {
      rx: /doxycycline/i,
      pickIf: "Penicillin allergy; outpatient setting; no Pseudomonas risk.",
      whyPick: [
        "**Atypical + typical** coverage in one agent",
        "Cheap, oral, well-tolerated",
        "**Anti-inflammatory** properties (sub-MIC) — debated benefit in COPD",
      ],
      watchOut: [
        { sev: "warn", text: "**Photosensitivity** — counsel sun avoidance" },
        { sev: "warn", text: "**Pill esophagitis** — take with full glass of water, upright × 30 min" },
        { sev: "stop", text: "Pregnancy / children < 8 y — tooth staining + bone effects" },
      ],
    },
    {
      rx: /macrolide|azithromycin|clarithromycin/i,
      pickIf: "Penicillin allergy alternative; atypical coverage desired.",
      whyPick: [
        "**Anti-inflammatory** properties — chronic azithro reduces exacerbations (controversial)",
        "Atypical + typical respiratory pathogen cover",
        "Single daily dose — adherence advantage",
      ],
      watchOut: [
        { sev: "warn", text: "**QT prolongation** — check meds list" },
        { sev: "warn", text: "Macrolide resistance in pneumococcus rising regionally" },
        { sev: "note", text: "Long-term azithro for prevention raises NTM + cardiovascular risk" },
      ],
    },
  ],
  "Pseudomonas risk": [
    {
      rx: /levofloxacin|antipseudomonal/i,
      pickIf: "Prior Pseudomonas isolate, FEV1 < 30%, bronchiectasis, recent broad abx.",
      whyPick: [
        "**Levofloxacin 750 mg PO daily** — oral antipseudomonal option",
        "**Ciprofloxacin** alternative — better Pseudomonas, less pneumococcal",
        "IV antipseudomonal β-lactam if hospitalized + severe",
      ],
      watchOut: [
        { sev: "warn", text: "**Tendinopathy, QT, dysglycemia** — black-box risks" },
        { sev: "warn", text: "**Pseudomonas resistance** to FQ rising — culture-direct when possible" },
        { sev: "note", text: "Avoid FQ if recent FQ exposure within 90 d" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "5 d for most bacterial AECOPD; longer for bronchiectasis substrate or P. aeruginosa.",
    evidence: "GOLD 2024 + Falagas 2008 meta — 5 d non-inferior to longer courses; antibiotics benefit purulent + Anthonisen-1 / 2",
    branches: [
      { label: "Anthonisen type 1 or 2 + purulent sputum", days: "5 d",
        detail: "Macrolide or doxy or amox-clav per local antibiogram; no clear winner head-to-head",
        matchAgent: /azithromycin|doxycycline|amoxicillin-?clavulanate/i },
      { label: "Severe exacerbation requiring ICU / NIV", days: "5–7 d",
        detail: "Extend by 2 d for ICU substrate; cover P. aeruginosa if frequent exacerbations / prior cultures",
        matchAgent: /piperacillin|cefepime|levofloxacin/i },
      { label: "P. aeruginosa colonized / cultured", days: "10–14 d",
        detail: "Cipro or levo or β-lactam; per prior sensitivity; eradication not the goal in chronic colonization" },
      { label: "Bronchiectasis overlap", days: "Per bronchiectasis bands",
        detail: "Treat per bronchiectasis exacerbation; longer courses" },
      { label: "Non-purulent / Anthonisen type 3 alone", days: "0 d",
        detail: "Antibiotics not indicated; manage with steroids + bronchodilators ± non-invasive ventilation" },
    ],
    stopWhen: [
      "Sputum purulence resolved",
      "Dyspnea returned to baseline",
      "Oxygenation stable off acute escalation",
      "Steroid course complete or tapering",
      "Minimum 5 d (uncomplicated) or pathogen-specific course completed",
    ],
    extendIf: [
      { text: "**P. aeruginosa** cultured or colonized with risk factors",
        matchCtx: { pseudoRisk: true } },
      "Bronchiectasis substrate — longer per bronchiectasis bands",
      "ICU / NIV severity — extend to 5–7 d",
      "Inadequate response by day 3 — re-eval pathogen, viral cause, embolus",
    ],
  },
  monitoring: {
    headline: "Anthonisen criteria for antibiotic decision; steroids 5 d; avoid antibiotics for non-purulent.",
    items: [
      { sev: "required", what: "**Anthonisen criteria** — ↑ dyspnea + ↑ sputum + ↑ purulence",
        why: "Antibiotics benefit 2-of-3 (esp. if purulence); skip in type 3 alone" },
      { sev: "required", what: "**Prednisone 40 mg × 5 d** (REDUCE trial)",
        why: "5 d non-inferior to 14 d; reduces readmission + length of stay" },
      { sev: "required", what: "**Sputum culture** if frequent exacerbations or prior P. aeruginosa",
        why: "Pseudomonal colonization drives antibiotic choice + duration" },
      { sev: "trigger", what: "**Cover P. aeruginosa** if prior cultures + risk factors",
        why: "Frequent exacerbations + structural disease + prior antibiotics predict P. aeruginosa",
        matchCtx: { pseudoRisk: true } },
      { sev: "trigger", what: "**NIV / BiPAP** for hypercapnic respiratory failure",
        why: "Reduces intubation + mortality in COPD exacerbation with respiratory acidosis" },
      { sev: "trigger", what: "**Re-eval at 72 h** if non-response — viral, embolus, heart failure, pneumothorax",
        why: "Mimics drive treatment failure — image + d-dimer + BNP indicated" },
      { sev: "consider", what: "**Influenza / RSV / COVID PCR** in season",
        why: "Viral exacerbations common; antivirals change course if early" },
      { sev: "consider", what: "**Smoking cessation counseling + pulmonary rehab referral**",
        why: "Highest-impact long-term interventions; addressable at every admission" },
    ],
  },
  rationale: {
    driver: "Antibiotics in AECOPD benefit only those meeting Anthonisen criteria — 2 of 3 (increased dyspnea, sputum volume, or purulence), with purulence the strongest single predictor. Five days is non-inferior to longer courses (Falagas Chest 2008 meta) for amox-clav, doxycycline, or a macrolide chosen against the local antibiogram; severe / ICU substrate extends to 5–7 d. Anti-pseudomonal cover is reserved for frequent exacerbators, prior P. aeruginosa, or bronchiectasis overlap. Adjunctive prednisone 40 mg × 5 d is mandated (REDUCE).",
    guideline: "reduce",
    rejected: "Empiric antibiotics for Anthonisen-type-3 (dyspnea alone, no sputum change) were deliberately rejected — Anthonisen 1987 and the Cochrane 2018 update show no benefit without purulence or 2-of-3, and reflexive treatment drives resistance + collateral damage. The legacy 7–14 d course was tempered by Falagas 2008: 5 d is non-inferior and reduces adverse events. Routine anti-pseudomonal cover for every admission was rejected — reserve for frequent exacerbators + prior cultures." },
  objections: [
    { q: "Why 5 d for AECOPD when historical practice was 7-14 d?",
      a: "Falagas Chest 2008 meta and GOLD 2024 [cite:cap] established that 5 d is non-inferior to longer courses for bacterial AECOPD, with fewer adverse events and reduced selection pressure. The REDUCE trial (JAMA 2013) [cite:reduce] separately validated 5 d of prednisone vs 14 d; the antibiotic decision is independent. Reserve > 5 d only for P. aeruginosa, bronchiectasis overlap, or ICU / NIV severity per [cite:stew] short-course defaults." },
    { q: "Why withhold antibiotics for Anthonisen type 3 alone?",
      a: "Anthonisen (Ann Intern Med 1987, n=362) showed antibiotic benefit accrues to 2-of-3 criteria (dyspnea + sputum volume + purulence), with purulence carrying most weight. Type 3 alone — increased dyspnea without sputum change — does not benefit, and GOLD 2024 [cite:cap] preserves this framework. Reflexive prescription in type 3 drives C. difficile and resistance without outcome gain; stewardship [cite:stew] supports observation with steroids and bronchodilators." },
    { q: "Why cover P. aeruginosa empirically — isn't colonization not infection?",
      a: "Frequent exacerbations (≥ 2 / yr), structural disease (FEV1 < 50%), prior antibiotic courses, and prior P. aeruginosa cultures predict P. aeruginosa as the exacerbation pathogen — GOLD 2024 [cite:cap] triggers anti-pseudomonal cover (cipro, levo, or β-lactam) in this substrate. In chronic colonization the goal is symptom control, not eradication; duration extends to 10-14 d. Sputum culture at every severe exacerbation refines empiric choice." },
  ],
  research: {
    headline: "Anthonisen criteria + 5-day REDUCE steroid; antibiotics benefit purulent + 2-of-3 criteria.",
    trials: [
      { name: "Anthonisen Ann Intern Med 1987",
        n: "362",
        question: "Antibiotic indication in AECOPD",
        finding: "Antibiotics benefit 2-of-3 criteria (dyspnea + sputum + purulence); type-3 alone NOT benefited; framework still standard",
        bias: "Pre-modern microbiology era; principle replicated" },
      { name: "REDUCE JAMA 2013 (Leuppi)",
        n: "311",
        question: "5 d vs 14 d prednisone in AECOPD",
        finding: "5 d non-inferior to 14 d; reduced AEs; lower glucose / sleep disturbance burden",
        bias: "Adjunctive steroid only; antibiotic decision separate" },
      { name: "Falagas Chest 2008 meta",
        n: "Meta",
        question: "5 d vs longer course antibiotics in AECOPD",
        finding: "5 d non-inferior; reduced AE burden; supports IDSA / GOLD short-course",
        bias: "Heterogeneous antibiotic class; pooled" },
    ],
    guidelines: [
      { society: "GOLD",
        year: 2024,
        topic: "Global COPD strategy",
        keypoint: "Anthonisen criteria for antibiotic decision; 5 d steroid; NIV for hypercapnic respiratory failure" },
      { society: "ATS / ERS",
        year: 2023,
        topic: "Joint AECOPD guidance",
        keypoint: "Aligned with GOLD; emphasizes sputum culture if prior Pseudomonas / frequent exacerbations" },
    ],
    openQuestions: [
      "Antibiotic vs no-antibiotic in mild AECOPD without purulence — observation acceptable",
      "Optimal first-line agent — local antibiogram + prior cultures drive",
      "Inhaled triple therapy for prevention — IMPACT + ETHOS support but adherence variable",
    ],
  },
};

export default { id: "copd", regimen, decision };
