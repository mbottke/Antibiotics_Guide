/* ===========================================================
   BRONCHIECTASIS EXACERBATION — 14 d standard; per pathogen
   (Pseudomonas eradication); inhaled antibiotics adjunctive. = */

const regimen = {
  "No Pseudomonas history": [
    {
      rx: /amoxicillin-?clavulanate|respiratory.*fluoroquinolone/i,
      pickIf: "Acute exacerbation, no prior Pseudomonas in sputum.",
      whyPick: [
        "**Amox-clav** first-line — covers H. flu, S. pneumoniae, M. cat",
        "**Levofloxacin** if PCN allergy or atypical concern",
        "**14-day course** for bronchiectasis exacerbations (longer than CAP)",
        "Send sputum **before** starting — guide step-down",
      ],
      watchOut: [
        { sev: "warn", text: "**Underdose risk** — bronchiectasis has poor penetration" },
        { sev: "note", text: "Many require chronic suppression — coordinate with pulmonologist" },
      ],
    },
  ],
  "Pseudomonas colonized": [
    {
      rx: /ciprofloxacin|antipseudomonal/i,
      pickIf: "Documented Pseudomonas in sputum; outpatient or stable.",
      whyPick: [
        "**Cipro 750 mg PO BID × 14 d** — oral antipseudomonal option",
        "**IV β-lactam** if severely ill or oral fails — pip-tazo, cefepime, meropenem",
        "Always **culture-direct** — resistance patterns vary widely",
      ],
      watchOut: [
        { sev: "warn", text: "**FQ resistance** in chronic Pseudomonas — rotation strategies common" },
        { sev: "warn", text: "**Tendinopathy / QT / dysglycemia** — black-box risks" },
        { sev: "note", text: "Inhaled tobramycin / aztreonam for chronic suppression (separate decision)" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "14 d for most bronchiectasis exacerbations; longer for P. aeruginosa eradication or NTM.",
    evidence: "BTS 2019 + Chalmers — 14 d standard; eradication of first P. aeruginosa isolate reduces colonization",
    branches: [
      { label: "Standard bronchiectasis exacerbation", days: "14 d",
        detail: "Cover per prior sputum cultures; oral if mild, IV if severe",
        matchAgent: /amoxicillin-?clavulanate|doxycycline|azithromycin/i },
      { label: "P. aeruginosa — first isolate (eradication attempt)", days: "14 d IV + 3 mo inhaled",
        detail: "IV cipro / β-lactam × 14 d then inhaled tobi or colistin × 3 mo per BTS",
        matchAgent: /ciprofloxacin|tobramycin|colistin/i },
      { label: "P. aeruginosa — chronic colonization, exacerbation", days: "14 d",
        detail: "Per sensitivity; eradication not goal; consider inhaled suppressive maintenance" },
      { label: "Non-tuberculous mycobacteria (MAC, abscessus)", days: "≥ 12 mo macrolide-based",
        detail: "Per ATS / IDSA 2020 NTM bands; ID-driven combination" },
      { label: "Aspergillus / ABPA overlap", days: "Per ABPA bands",
        detail: "Steroids ± itraconazole; not standard antibiotic course" },
    ],
    stopWhen: [
      "Sputum volume + purulence returned to baseline",
      "Dyspnea + cough returned to baseline",
      "Afebrile",
      "CRP / WBC normalizing if elevated",
      "Minimum 14 d completed (most pathogens)",
    ],
    extendIf: [
      { text: "**First P. aeruginosa isolate** — extend per eradication protocol",
        matchCtx: { pseudoRisk: true } },
      "NTM identified — per ATS / IDSA NTM bands",
      "ABPA / aspergillus overlap — per ABPA bands",
      "Inadequate response — re-eval pathogen + airway clearance + adherence",
    ],
  },
  monitoring: {
    headline: "Sputum culture every exacerbation; airway clearance; eradication on first P. aeruginosa.",
    items: [
      { sev: "required", what: "**Sputum culture** with every exacerbation",
        why: "Pathogen drift over time — P. aeruginosa, S. aureus, NTM drive choice" },
      { sev: "required", what: "**Airway clearance therapy** — PEP, vest, postural drainage",
        why: "Non-pharmacologic backbone; antibiotic course alone often inadequate" },
      { sev: "required", what: "**Eradication attempt on first P. aeruginosa isolate**",
        why: "First isolate eradication reduces transition to chronic colonization",
        matchBranch: ["P. aeruginosa — first isolate (eradication attempt)"] },
      { sev: "trigger", what: "**NTM workup** — AFB sputum × 3 + HRCT if recurrent or mod-severe",
        why: "MAC + abscessus common; underdiagnosed; pathogen-specific treatment" },
      { sev: "trigger", what: "**Macrolide maintenance** if ≥ 3 exacerbations / yr (without NTM)",
        why: "BAT trial + EMBRACE — macrolide ↓ exacerbations; QTc + LFT monitoring",
        matchAgent: /azithromycin/i },
      { sev: "trigger", what: "**Inhaled antibiotic maintenance** for chronic P. aeruginosa + frequent exacerbations",
        why: "Inhaled tobramycin / colistin / aztreonam reduces bacterial burden + exacerbation rate" },
      { sev: "trigger", what: "**Etiology workup** if new diagnosis — CF, PCD, immune deficiency, ABPA, NTM",
        why: "20–30% of bronchiectasis has identifiable + treatable etiology" },
      { sev: "consider", what: "**Pulmonary rehab + vaccinations** — flu, pneumococcal, COVID, RSV",
        why: "Reduce exacerbations + improve functional status" },
    ],
  },
  rationale: {
    driver: "Bronchiectasis exacerbations sit on a structural-lung-disease substrate where pathogen drift is the norm — sputum culture every exacerbation is mandated. Empirics follow prior cultures: amox-clav or doxycycline for H. influenzae / Moraxella; anti-pseudomonal β-lactam or ciprofloxacin once P. aeruginosa is established. Standard course is 14 d (BTS 2019 / Hill), with first P. aeruginosa isolate triggering an eradication attempt (14 d IV + 3 mo inhaled). Airway clearance is the non-pharmacologic backbone — antibiotics alone underperform without it.",
    guideline: "cap",
    rejected: "Routine 7-day short courses were deliberately rejected — BTS 2019 anchors 14 d for the structural-lung substrate because shorter courses correlate with earlier recurrence in non-CAP airway disease, and Chalmers (PROMISE 2018) shows severity drives the relapse trajectory. Symptomatic-only management of a first P. aeruginosa isolate was rejected because eradication while colonization is fresh reduces conversion to chronic carriage, which independently worsens outcomes." },
  objections: [
    { q: "Why 14 d for bronchiectasis exacerbation when COPD takes 5 d?",
      a: "Bronchiectasis substrate carries structural damage, persistent colonization (often P. aeruginosa or NTM), and impaired mucociliary clearance — BTS 2019 and Chalmers (Lancet 2018 PROMISE) anchor 14 d as the floor for symptomatic exacerbations. Shorter courses correlate with early relapse and progressive lung-function decline. Anti-pseudomonal selection [cite:amrgn] also drives longer durations; the goal is symptom return-to-baseline, not eradication of chronic flora." },
    { q: "Why attempt eradication on the first P. aeruginosa isolate?",
      a: "First P. aeruginosa isolation in bronchiectasis predicts chronic colonization, accelerated decline, and worse mortality — BTS 2019 mandates an eradication attempt with IV anti-pseudomonal × 14 d followed by inhaled tobramycin or colistin × 3 mo. Established colonization reverses outcomes minimally; the first-isolate window is the highest-yield intervention. Subsequent exacerbations are treated per sensitivity without eradication intent [cite:amrgn]." },
    { q: "Why inhaled antibiotics maintenance — isn't that overkill?",
      a: "Inhaled tobramycin, colistin, or aztreonam suppression in chronic P. aeruginosa colonizers (≥ 3 exacerbations / yr) reduces exacerbation frequency, sputum bacterial load, and systemic antibiotic exposure — BTS 2019 and Haworth (Lancet RM 2014) support maintenance in select substrate. Avoiding systemic anti-pseudomonal courses preserves stewardship [cite:stew] and reduces resistance pressure. Reserve for symptomatic colonizers with frequent exacerbations, not all isolates." },
  ],
  research: {
    headline: "14-day standard; first P. aeruginosa isolate → eradication attempt; airway clearance non-pharmacologic backbone.",
    trials: [
      { name: "Chalmers Lancet 2018 (PROMISE)",
        n: "Cohort",
        question: "Modern bronchiectasis severity stratification + outcomes",
        finding: "Bronchiectasis Severity Index drives risk stratification; P. aeruginosa colonization + frequent exacerbations + radiographic severity predict outcomes",
        bias: "European cohort; principles apply broadly" },
      { name: "Hill BTS 2019",
        n: "Guideline",
        question: "Modern bronchiectasis exacerbation management",
        finding: "14-d standard; macrolide maintenance for ≥ 3 exacerbations/yr (BAT + EMBRACE); inhaled antibiotics for chronic Pseudomonas",
        bias: "Guideline synthesis; quality of evidence variable" },
      { name: "BAT + EMBRACE trials 2013",
        n: "Combined ~250",
        question: "Macrolide maintenance for exacerbation prevention",
        finding: "Azithromycin reduced exacerbations ~50%; QTc + LFT monitoring required; resistance signal",
        bias: "Selected cohorts; long-term resistance trajectory uncertain" },
    ],
    guidelines: [
      { society: "BTS",
        year: 2019,
        topic: "Bronchiectasis (Hill)",
        keypoint: "14-d standard; eradication for first P. aeruginosa; macrolide maintenance for frequent exacerbations" },
      { society: "ERS",
        year: 2017,
        topic: "European bronchiectasis guidance",
        keypoint: "Aligned with BTS; emphasizes etiology workup (CF, PCD, ABPA, NTM, immune defects)" },
    ],
    openQuestions: [
      "Optimal eradication protocol for first P. aeruginosa — IV + 3-mo inhaled standard",
      "NTM treatment thresholds + duration — ≥ 12 mo macrolide-based per ATS / IDSA 2020",
      "Etiology-specific treatment modifications — CF + ABPA + NTM each have distinct paradigms",
    ],
  },
};

export default { id: "bronchiectasis", regimen, decision };
