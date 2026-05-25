/* ===========================================================
   NOCARDIOSIS — gram-positive filamentous; cell-mediated immune
   deficits; TMP-SMX backbone; CNS workup mandatory; long course. */

const regimen = {
  "Severe / disseminated / CNS": [
    {
      rx: /TMP-?SMX.*imipenem|amikacin/i,
      pickIf: "Severe or disseminated Nocardia, or CNS involvement.",
      whyPick: [
        "**High-dose TMP-SMX + imipenem** initial",
        "Add **amikacin** for severe / CNS disease",
        "Long course: **6–12 months minimum**",
        "ID + neurosurgery for brain abscess",
      ],
      watchOut: [
        { sev: "warn", text: "Speciation matters — N. farcinica resistant to several agents" },
        { sev: "note", text: "Workup immunocompromise — HIV, transplant, steroid" },
      ],
    },
  ],
  "Localized / step-down": [
    {
      rx: /TMP-?SMX|linezolid/i,
      pickIf: "Localized pulmonary Nocardia, or oral step-down post-induction.",
      whyPick: [
        "**TMP-SMX** PO 6–12 months — primary maintenance therapy",
        "**Linezolid** alternative for TMP-SMX intolerance (cost barrier, toxicity ceiling)",
        "**Combination therapy** if disseminated even on step-down (TMP-SMX + minocycline or linezolid)",
        "ID-led monitoring — relapse common with premature stop",
      ],
      watchOut: [
        { sev: "warn", text: "**Linezolid > 1 month** → cytopenias, peripheral + optic neuropathy, lactic acidosis; CBC q2wk + neuro exam" },
        { sev: "warn", text: "**TMP-SMX long courses** → hyperkalemia, hyponatremia, AKI — check labs q2wk + adjust dose by SCr trend",
          matchCtx: { crcl: { lt: 60 } } },
        { sev: "note", text: "**Speciation matters** — N. brasiliensis treated similarly; N. otitidiscaviarum and N. transvalensis need different regimens (ID input)" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "6–12 mo + CNS workup mandatory; TMP-SMX backbone; combination IV for severe / disseminated.",
    evidence: "IDSA + ATS — TMP-SMX or sulfadiazine first-line; species-driven sensitivity; CNS involvement extends to 12 mo",
    branches: [
      { label: "Pulmonary, immunocompetent", days: "6 mo",
        detail: "TMP-SMX 5–10 mg/kg TMP component PO; PO step-down after initial IV if severe",
        matchAgent: /trimethoprim-?sulfamethoxazole|sulfadiazine/i },
      { label: "Disseminated / immunocompromised", days: "12 mo",
        detail: "TMP-SMX + imipenem or amikacin × 6 wk IV then PO; ID-driven combination",
        matchAgent: /imipenem|amikacin/i },
      { label: "CNS involvement (brain abscess)", days: "12 mo",
        detail: "TMP-SMX + imipenem + ceftriaxone or linezolid; neurosurgical drainage if large",
        matchAgent: /linezolid|meropenem/i },
      { label: "Cutaneous primary, immunocompetent", days: "3 mo",
        detail: "TMP-SMX or minocycline; rule out dissemination + CNS imaging at presentation" },
      { label: "Severe sulfa allergy", days: "6–12 mo",
        detail: "Linezolid or imipenem-based per sensitivity; species ID critical; ID-driven" },
    ],
    stopWhen: [
      "Clinical + imaging resolution",
      "CNS workup completed + cleared",
      "Pathogen-specific minimum duration met (6 mo / 12 mo)",
      "Immunosuppression unchanged or improved",
      "No recurrence over follow-up period",
    ],
    extendIf: [
      { text: "**CNS involvement** — extend to 12 mo + surgical drainage if large",
        matchCtx: { severe: true } },
      "Persistent immunosuppression — extend per host status",
      "Drug toxicity (TMP-SMX) — switch agent + extend per response",
      "Recurrence after stop — re-induction + indefinite suppression in some hosts",
    ],
  },
  monitoring: {
    headline: "TMP-SMX backbone; brain imaging mandatory; species ID + sensitivity; CBC + LFT + Cr on TMP-SMX.",
    items: [
      { sev: "required", what: "**Brain MRI** at presentation regardless of symptoms",
        why: "CNS involvement ~30% in disseminated; changes duration + escalates monitoring" },
      { sev: "required", what: "**Species identification + sensitivity** (16S, MALDI-TOF)",
        why: "Sensitivity drives therapy — N. farcinica intrinsic resistance to multiple agents; species-specific patterns critical" },
      { sev: "required", what: "**ID consult** at presentation",
        why: "Long course + drug interactions + immunosuppression management requires specialist input" },
      { sev: "trigger", what: "**Combination IV induction × 6 wk** for severe / disseminated",
        why: "TMP-SMX + carbapenem or amikacin; transition to PO when stable",
        matchAgent: /imipenem|amikacin|meropenem/i },
      { sev: "trigger", what: "**CBC + LFT + Cr weekly** on TMP-SMX",
        why: "Bone marrow suppression + hyperkalemia + AKI common at high doses" },
      { sev: "trigger", what: "**Reduce immunosuppression** if feasible per primary team",
        why: "Cell-mediated immunity defect drives disease; modifiable substrate in many" },
      { sev: "trigger", what: "**Linezolid alternative** for sulfa allergy or refractory",
        why: "Excellent CNS penetration; MAO-inhibitor + cytopenias on extended use",
        matchAgent: /linezolid/i },
      { sev: "consider", what: "**Workup HIV + cell-mediated immunity defect**",
        why: "Nocardiosis is a marker for cellular immune compromise" },
    ],
  },
  rationale: {
    driver: "Nocardia is a cell-mediated-immunity disease — disseminated nocardiosis is a marker for an underlying T-cell defect (transplant, prolonged steroids, untreated HIV with low CD4, lymphoma) and triggers HIV + immunology workup at presentation. TMP-SMX (or sulfadiazine) is the backbone, dosed at 5–10 mg/kg TMP component; severe / disseminated / CNS disease gets combination IV induction × 6 wk (TMP-SMX + imipenem or amikacin, plus linezolid or ceftriaxone if CNS) per ATS/IDSA 2017. Brain MRI at presentation is mandatory regardless of neurologic symptoms — ~30% have occult CNS involvement (Welsh 2008) that doubles duration to 12 months. N. farcinica carries intrinsic resistance to multiple agents, so species ID + susceptibilities drive choice.",
    guideline: "mono",
    rejected: "Empiric short-course TMP-SMX without species ID and CNS imaging was deliberately rejected — Welsh and Lerner both anchor brain MRI at presentation regardless of symptoms, and N. farcinica or other resistant species can fail standard sulfa monotherapy. Skipping HIV + cell-mediated-immunity workup was tempered — nocardiosis is a sentinel for occult immune defects, and finding and treating the substrate (resume ART, reduce IS, treat lymphoma) is as important as the antibacterial. Discontinuing therapy at clinical resolution without imaging follow-up was rejected: long-course (6–12 mo) is anchored to radiographic resolution, not symptom relief." },
  objections: [
    { q: "Why brain MRI at presentation when neuro exam is normal?",
      a: "Welsh Eur J Clin Microbiol 2008 cohort showed roughly 30% of disseminated nocardiosis has asymptomatic CNS involvement on imaging at presentation, and CNS disease extends therapy from 6 to 12 months and adds a CSF-penetrant agent (linezolid, meropenem, or ceftriaxone) per ATS / IDSA 2017 [cite:mono]. Missing occult CNS involvement leads to under-treatment and predictable relapse. Brain MRI is mandatory at presentation regardless of neurologic symptoms — the rule is positive imaging changes the regimen, not symptoms." },
    { q: "Why combination IV induction — TMP-SMX alone covers most?",
      a: "TMP-SMX is the backbone, but severe / disseminated / CNS disease requires combination IV induction for 6 wk (TMP-SMX + imipenem or amikacin, plus linezolid or ceftriaxone if CNS) per ATS / IDSA 2017 [cite:mono] — Lerner Clin Microbiol Rev 2010 documents in-vivo synergy and lower relapse with combination. N. farcinica and N. otitidiscaviarum carry intrinsic resistance to multiple agents, so species identification + susceptibilities drive choice. Sulfa monotherapy in severe disease fails predictably." },
    { q: "Why workup HIV + cell-mediated immunity in confirmed nocardiosis?",
      a: "Nocardiosis is a sentinel for occult T-cell defect — disseminated disease in particular triggers workup for HIV, lymphoma, prolonged steroids, biologic exposure, and transplant per ATS / IDSA 2017 [cite:mono]. Finding and treating the substrate (resume ART, reduce IS, treat lymphoma) is as important as the antibacterial regimen, because relapse off prophylaxis with unchanged immune defect approaches 100%. The infection is the presenting sign of the immune defect; treating only one half is incomplete therapy." },
    { q: "Why 6–12 mo of therapy — can't we stop at radiographic stability?",
      a: "ATS / IDSA 2017 [cite:mono] anchors 6 mo for pulmonary, 12 mo for disseminated or CNS, with stopping gated by radiographic resolution AND minimum duration met. Lerner 2010 and Welsh 2008 cohorts document relapse rates of 20–40% with premature discontinuation, particularly in transplant or unchanged-IS hosts. Long-course therapy is the price of the slow-growing intracellular biology; oral step-down to TMP-SMX or minocycline after IV induction makes it feasible." },
  ],
  research: {
    headline: "TMP-SMX backbone; CNS workup mandatory (~30% involvement); long course (6–12 mo); cell-mediated immune defect marker.",
    trials: [
      { name: "Lerner Clin Microbiol Rev 2010",
        n: "Cohort review",
        question: "Modern nocardiosis epidemiology + treatment",
        finding: "TMP-SMX or sulfadiazine first-line; species + sensitivity drive choice; N. farcinica resistant to multiple agents",
        bias: "Pre-modern speciation methods" },
      { name: "Welsh Eur J Clin Microbiol 2008",
        n: "Cohort",
        question: "CNS involvement + outcome in nocardiosis",
        finding: "Brain MRI at presentation regardless of symptoms — ~30% have asymptomatic CNS involvement; changes duration to 12 mo",
        bias: "Single-center cohort; signal replicated" },
    ],
    guidelines: [
      { society: "ATS / IDSA",
        year: 2017,
        topic: "Nontuberculous mycobacteria + Nocardia",
        keypoint: "TMP-SMX or sulfadiazine first-line; species-driven sensitivity; brain MRI mandatory" },
    ],
    openQuestions: [
      "Duration in localized cutaneous — 3 mo standard",
      "Combination IV induction — 6 wk for severe / disseminated",
      "Linezolid alternative for sulfa allergy — emerging evidence",
    ],
  },
};

export default { id: "nocardia", regimen, decision };
