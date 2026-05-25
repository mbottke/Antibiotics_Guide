/* ===========================================================
   DEFINED IMMUNE DEFECT: PATHOGEN PATTERNS — CGD, CVID, HIV,
   complement, neutropenia — specific organisms by defect. === */

const regimen = {
  "Empiric by defect": [
    {
      rx: /source-?directed|defect/i,
      pickIf: "CGD or other primary immunodeficiency — pathogen profile defect-specific.",
      whyPick: [
        "**Treat the characteristic pathogens** for the defect (substrate-specific empiric)",
        "**CGD** — Staph, Burkholderia, Aspergillus, Nocardia, Serratia",
        "**Hypogammaglobulinemia** — encapsulated organisms (pneumococcus, H. flu, meningococcus); IVIG replacement",
        "**Complement deficiency** — recurrent Neisseria; ceftriaxone empiric + meningococcal vaccination",
        "ID consult mandatory — disease-specific guidance + long-term prophylaxis decisions",
      ],
      watchOut: [
        { sev: "warn", text: "**Burkholderia cepacia in CGD** — multi-drug resistant; combination therapy + ID input mandatory" },
        { sev: "warn", text: "**Aspergillus / Mucor risk in CGD** — voriconazole prophylaxis is standard; rule out invasive fungal disease early" },
        { sev: "note", text: "Lifelong TMP-SMX + itraconazole prophylaxis baseline; gamma-interferon decreases infection rate in CGD" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Per defect + pathogen; defect-specific organism patterns; prophylaxis + immune-reconstitution.",
    evidence: "PIDTC + JMF — CGD → catalase-positive (S. aureus, Burkholderia, Serratia, Nocardia, Aspergillus); CVID → encapsulated; complement → Neisseria",
    branches: [
      { label: "CGD + catalase-positive infection", days: "Per pathogen",
        detail: "Often weeks–months; S. aureus → per SSTI / SAB bands; Aspergillus → per IFI; lifetime TMP-SMX + itraconazole + IFN-γ ppx",
        matchAgent: /trimethoprim-?sulfamethoxazole|itraconazole/i },
      { label: "CVID + encapsulated infection", days: "Per pathogen",
        detail: "Per pathogen bands; IVIG replacement therapy + treat acute infection" },
      { label: "Complement defect (terminal) + meningococcus", days: "Per meningitis bands",
        detail: "Per meningitis bands; eculizumab + ppx if on complement-inhibitor for PNH / aHUS" },
      { label: "Hyper-IgE / Job + S. aureus + Aspergillus", days: "Per pathogen",
        detail: "TMP-SMX prophylaxis; per SSTI / pneumonia bands" },
      { label: "Severe combined immunodeficiency (SCID)", days: "Per pathogen + HSCT",
        detail: "Per pathogen; HSCT curative; lifelong PJP prophylaxis until immune reconstitution" },
    ],
    stopWhen: [
      "Pathogen identified + pathogen-specific duration met",
      "Cultures cleared / imaging resolution",
      "Prophylaxis regimen documented + resumed",
      "Immunology consult + workup completed",
      "Family screening + counseling addressed",
    ],
    extendIf: [
      { text: "**Disseminated / refractory** infection in immune defect host",
        matchCtx: { severe: true } },
      "CGD + invasive aspergillosis — voriconazole + IFN-γ extended",
      "CVID + chronic infection — IVIG + extended antibiotics",
      "Family screening + transplant decision — extend ppx until decision",
    ],
  },
  monitoring: {
    headline: "Defect-specific organism + workup; immunology consult; prophylaxis + IVIG + IFN-γ as indicated.",
    items: [
      { sev: "required", what: "**Identify the defect** — CGD, CVID, complement, hyper-IgE, SCID",
        why: "Drives differential, empiric therapy, and prophylaxis; sometimes diagnosed by infection pattern itself" },
      { sev: "required", what: "**Immunology consult** at presentation",
        why: "Coordinated long-term management; family screening; transplant decision" },
      { sev: "required", what: "**Pathogen-specific workup** — catalase-positive (CGD), encapsulated (CVID), Neisseria (complement)",
        why: "Defect-organism patterns predict pathogen; expedites empiric choice" },
      { sev: "trigger", what: "**CGD prophylaxis** — TMP-SMX + itraconazole + IFN-γ",
        why: "Reduces infection incidence by ~50%; lifetime in confirmed CGD",
        matchAgent: /trimethoprim-?sulfamethoxazole|itraconazole/i },
      { sev: "trigger", what: "**CVID — IVIG replacement** therapy",
        why: "Replaces deficient immunoglobulin; reduces infection rate + severity" },
      { sev: "trigger", what: "**Complement defect + on eculizumab — meningococcal vaccination + ppx**",
        why: "Drug-induced complement defect; pre-treatment vaccination + standby penicillin" },
      { sev: "trigger", what: "**Genetic counseling + family screening**",
        why: "Inherited defects; family at risk; transplant or gene therapy may be curative" },
      { sev: "consider", what: "**Specialty center referral** — primary immunodeficiency clinic",
        why: "Coordinated multi-disciplinary care; trial enrollment for emerging therapies" },
    ],
  },
  rationale: {
    driver: "Defined immune defects predict their pathogen — chronic granulomatous disease (CGD, NADPH-oxidase loss) cannot kill catalase-positive organisms and develops S. aureus, Burkholderia, Serratia, Nocardia, and invasive Aspergillus; CVID (humoral defect) develops encapsulated bacterial sinopulmonary disease; terminal complement (C5–9) and eculizumab-induced complement defects develop recurrent Neisseria; hyper-IgE (Job) develops S. aureus + Aspergillus; SCID develops everything. The empiric anchored to the defect pattern (rather than the conventional immunocompetent differential) shortens time-to-pathogen-matched therapy, and lifelong prophylaxis (TMP-SMX + itraconazole + IFN-γ for CGD; IVIG replacement for CVID; meningococcal vaccination + standby PCN for complement) reduces incidence by ~50% (Marciano CID 2014).",
    guideline: "mono",
    rejected: "Treating a defined-immune-defect host with a conventional empiric was deliberately rejected — the defect-organism patterns are predictable and validated, and missing Aspergillus in CGD or Neisseria in complement defect carries high mortality. Discontinuing lifetime prophylaxis after an infection-free interval was tempered — Marciano 2014 and PIDTC anchor lifelong TMP-SMX + itraconazole + IFN-γ for CGD because the underlying genetic defect is unchanged, and breakthrough infections off ppx are common. Skipping family genetic counseling and transplant / gene-therapy referral was rejected: HSCT or gene therapy is curative for SCID and confirmed CGD in selected patients, and family screening identifies at-risk relatives." },
  objections: [
    { q: "Why empiric anti-mold cover for CGD pneumonia at admission?",
      a: "CGD hosts lose NADPH-oxidase respiratory burst and cannot kill catalase-positive organisms — invasive Aspergillus and Burkholderia are leading causes of CGD pneumonia and mortality, and the differential is fundamentally different from the immunocompetent CAP differential. Marciano CID 2014 and PIDTC consensus anchor early voriconazole + broad bacterial cover with galactomannan + chest CT at presentation [cite:mono]. Treating CGD pneumonia as standard CAP misses the dominant pathogen and is high-mortality." },
    { q: "Why lifelong TMP-SMX + itraconazole + IFN-γ if the patient is well?",
      a: "The NADPH-oxidase defect is genetic and unchanged by clinical quiescence — Marciano CID 2014 NIH cohort showed lifetime TMP-SMX + itraconazole + IFN-γ reduces serious infection incidence by roughly 50% [cite:mono], and breakthrough infections off prophylaxis are common and dangerous. PIDTC + JMF consensus anchor lifelong prophylaxis in confirmed CGD; discontinuation is appropriate only after curative HSCT or gene therapy with documented immune reconstitution." },
    { q: "Why standby penicillin for a complement-deficient patient on eculizumab?",
      a: "Terminal complement (C5–9) loss — congenital or eculizumab-induced — removes the membrane attack complex and produces a several-thousand-fold relative risk for invasive Neisseria. Meningococcal vaccination (MenACWY + MenB) before eculizumab plus standby ciprofloxacin or amoxicillin at first febrile symptom is the standard package per FDA REMS and CDC ACIP [cite:cdc_acip] [cite:mono]. Vaccination alone is insufficient — breakthrough disease in vaccinated eculizumab patients is documented." },
  ],
  research: {
    headline: "Defect-specific organism pattern; CGD → catalase-positive; CVID → encapsulated; complement → Neisseria.",
    trials: [
      { name: "Marciano CID 2014",
        n: "Cohort",
        question: "Modern CGD outcomes + ppx",
        finding: "Lifetime TMP-SMX + itraconazole + IFN-γ reduces infection by ~50%; immunology + family screening + transplant decision",
        bias: "Single-center NIH cohort" },
    ],
    guidelines: [
      { society: "PIDTC / JMF",
        year: 2020,
        topic: "Primary immunodeficiency management",
        keypoint: "Defect-specific organism patterns drive empiric; immunology consult + family screening" },
    ],
    openQuestions: [
      "Genetic counseling indications — inherited defects",
      "Transplant or gene therapy — curative for SCID + CGD",
    ],
  },
};

export default { id: "cgd-defect", regimen, decision };
