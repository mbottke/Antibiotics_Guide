/* ===========================================================
   VAT — Ventilator-associated tracheobronchitis. Treatment
   controversial; reduces VAP progression in select cohorts. == */

const regimen = {
  "Targeted (if treated)": [
    {
      rx: /organism-?directed|antipseudomonal/i,
      pickIf: "Persistent purulent sputum + tracheal cultures positive WITHOUT pneumonia.",
      whyPick: [
        "**Organism-directed** therapy — don't broadly empiricize",
        "Adds antipseudomonal cover ONLY if prior colonization",
        "**Most VAT does not benefit** from antibiotics — recolonization is rapid",
        "Treat only if **symptomatic + culture-positive + no pneumonia on imaging**",
      ],
      watchOut: [
        { sev: "warn", text: "**Overtreatment** breeds resistance; high false-positive ETA cultures" },
        { sev: "note", text: "Consider VAP if any infiltrate appears — escalate workup" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "7 d if treated; controversial — reserve for purulent secretions + clinical change without infiltrate.",
    evidence: "Nseir 2008 — IV antibiotics for VAT reduced VAP progression + ICU LOS; broader treatment debated",
    branches: [
      { label: "VAT with purulent secretions + no infiltrate (treat)", days: "7 d",
        detail: "Cover per ETA culture + local antibiogram; de-escalate aggressively",
        matchAgent: /piperacillin|cefepime|meropenem/i },
      { label: "VAT in immunocompromised / progressive disease", days: "7–10 d",
        detail: "Lower threshold to treat + extend; ID input" },
      { label: "Colonization without clinical change (do not treat)", days: "0 d",
        detail: "Positive ETA without fever / leukocytosis / clinical decline is colonization; avoid antibiotics" },
      { label: "MDR / non-fermenting GNR (P. aeruginosa, Acineto)", days: "7–10 d",
        detail: "Per sensitivity; high recurrence; consider inhaled adjunct" },
    ],
    stopWhen: [
      "Purulent secretions resolved",
      "Ventilator settings stable / improving",
      "No new infiltrate",
      "Afebrile + WBC normalizing",
      "Minimum 7 d completed (if treated)",
    ],
    extendIf: [
      { text: "**MDR / non-fermenting GNR** — extend per pathogen + ID",
        matchCtx: { pseudoRisk: true } },
      "Progression to VAP — per VAP bands",
      "Immunocompromised — extend per ID",
      "Inadequate response — re-eval pathogen + diagnosis (atelectasis, secretions vs infection)",
    ],
  },
  monitoring: {
    headline: "Treat only purulent + clinical change; avoid for colonization; monitor for VAP progression.",
    items: [
      { sev: "required", what: "**Distinguish VAT from colonization** — clinical + radiographic",
        why: "Treating colonization drives MDR + collateral damage without benefit" },
      { sev: "required", what: "**Daily CXR or LUS** to detect VAP progression",
        why: "New infiltrate = VAP, not VAT; changes treatment + duration" },
      { sev: "required", what: "**ETA / sputum culture** before starting",
        why: "Pathogen-directed therapy; de-escalation at 48–72 h on data" },
      { sev: "trigger", what: "**Inhaled colistin or tobramycin** for MDR GNR adjunct",
        why: "Improves clinical cure in MDR VAT with limited safety data",
        matchAgent: /colistin|tobramycin/i },
      { sev: "trigger", what: "**De-escalation at 48–72 h** on culture data",
        why: "Continued broad therapy drives MDR + collateral; narrow aggressively" },
      { sev: "trigger", what: "**Sub-glottic suction + oral hygiene + HOB elevation**",
        why: "VAP-bundle measures reduce VAT and VAP incidence" },
      { sev: "consider", what: "**Avoid treatment in low-risk colonization** — no fever, leukocytosis, infiltrate, or decline",
        why: "Antibiotic stewardship — treatment in pure colonization rarely benefits" },
    ],
  },
  rationale: {
    driver: "VAT is treated only when purulent secretions + clinical change occur in the absence of a new infiltrate — distinguishing VAT from colonization is the threshold decision (Martin-Loeches 2014; IDSA / ATS 2016). When treated, empirics target the ICU substrate (anti-pseudomonal β-lactam ± vancomycin per risk + ETA culture) for 7 d, with aggressive de-escalation at 48–72 h. Nseir (CCM 2008) supports treatment in the purulent VAT subset by reducing VAP progression; routine treatment across all positive endotracheal aspirates is not supported.",
    guideline: "hapvap",
    rejected: "Routine treatment of positive ETA without fever, leukocytosis, infiltrate, or clinical decline was deliberately rejected — IDSA 2016 and Martin-Loeches frame positive culture in a stable ventilated patient as colonization, not infection, and treating it drives MDR selection without benefit. Inhaled antibiotic monotherapy was tempered: limited data, and inactivation in the airway secretions limits efficacy without systemic backbone." },
  objections: [
    { q: "Why not just treat all VAT to prevent VAP progression?",
      a: "VAT lies between airway colonization and VAP — ATS / IDSA 2016 HAP / VAP guidance [cite:hapvap] does not endorse routine antibiotic treatment because most cases never progress, and reflexive treatment exposes all ventilated patients to broad-spectrum selection pressure. Only Nseir (CCM 2008, n=58) suggested reduced VAP progression with IV antibiotics, but the trial was small and unreplicated. Stewardship [cite:stew] reserves treatment for symptomatic substrate with quantitative culture support." },
    { q: "Why insist on quantitative culture thresholds before treating?",
      a: "Endotracheal aspirate > 10^6 CFU/mL or BAL > 10^4 CFU/mL distinguishes infection from colonization — [cite:hapvap] anchors this threshold to avoid treating chronic airway flora. Without quantitation, every ventilated patient with a positive culture risks empiric anti-pseudomonal cover, driving resistance and C. difficile [cite:stew]. The threshold combined with clinical signs (purulence, fever, leukocytosis) defines a treat-able entity vs colonization." },
    { q: "Why 7 d if treating — should VAT be longer than VAP?",
      a: "When VAT is treated (purulence + signs + quantitative threshold), 7 d aligns with the PneumA RCT [cite:pneuma] for VAP — Chastre (JAMA 2003, n=401) showed 8 d non-inferior to 15 d in VAP with lower resistance emergence. VAT is a lesser substrate with no evidence supporting longer courses; [cite:hapvap] applies the 7-d default. Extending beyond 7 d compounds resistance pressure without demonstrated benefit." },
  ],
  research: {
    headline: "Controversial entity; Nseir showed reduced VAP progression in selected; routine treatment NOT supported.",
    trials: [
      { name: "Nseir CCM 2008",
        n: "58",
        question: "IV antibiotics for VAT in ICU",
        finding: "Antibiotics reduced VAP progression + ICU LOS in purulent VAT subset; broader treatment debated",
        bias: "Small cohort; selection by purulence + clinical change without infiltrate" },
      { name: "Craven Crit Care Med 2013",
        n: "Cohort",
        question: "VAT epidemiology + outcomes",
        finding: "VAT progresses to VAP in ~30% if untreated; modifiable with targeted antibiotics in select cohorts",
        bias: "Observational; treatment-by-indication confounding" },
      { name: "Martin-Loeches Curr Opin Crit Care 2014",
        n: "Review",
        question: "Distinguishing VAT from colonization",
        finding: "Clinical + microbiological criteria distinguish; colonization should NOT be treated; VAT with purulence + signs warrants treatment",
        bias: "Subjective criteria; institutional variation" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2016,
        topic: "HAP / VAP including VAT (Kalil)",
        keypoint: "VAT treatment selective; reserve for purulent secretions + clinical change without infiltrate" },
      { society: "ERS / ESICM",
        year: 2017,
        topic: "European HAP / VAP",
        keypoint: "Aligned with IDSA; VAP-bundle measures reduce both VAT + VAP incidence" },
    ],
    openQuestions: [
      "Optimal antibiotic duration in VAT — 7 d typical but evidence weak",
      "Inhaled adjunctive antibiotics for MDR VAT — limited data; institutional variation",
      "Routine treatment vs observation for VAT — controversy continues",
    ],
  },
};

export default { id: "vat", regimen, decision };
