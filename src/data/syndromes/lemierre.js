/* ===========================================================
   LEMIERRE SYNDROME — Fusobacterium necrophorum + IJ
   thrombophlebitis + septic emboli. Penicillin-clindamycin or
   pip-tazo; 4–6 wk; anticoag controversial. =================== */

const regimen = {
  "Empiric": [
    {
      rx: /ampicillin-?sulbactam|piperacillin|carbapenem/i,
      pickIf: "Lemierre's syndrome — septic IJ thrombophlebitis post-pharyngitis (F. necrophorum).",
      whyPick: [
        "**Amp-sulbactam, pip-tazo, or carbapenem** — covers Fusobacterium + anaerobes + strep",
        "**Long course 4–6 weeks IV** then PO step-down to amox-clav",
        "**Anticoagulation controversial** — case-by-case (clot extent, bleeding risk, embolic activity)",
        "**Workup metastatic septic emboli** — lung (most common), joint, brain, liver",
      ],
      watchOut: [
        { sev: "warn", text: "**Septic pulmonary emboli** common (~80%) — get CT chest; image-search for distal embolic foci" },
        { sev: "warn", text: "**ENT involvement** if tonsillar / peritonsillar source — drainage may be needed alongside antibiotics" },
        { sev: "note", text: "Workup MRSA if recent oropharyngeal instrumentation — coverage expands accordingly" },
      ],
    },
  ],
  "Penicillin allergy": [
    {
      rx: /carbapenem|metronidazole.*cephalosporin/i,
      pickIf: "Lemierre's with severe penicillin allergy.",
      whyPick: [
        "**Carbapenem** (meropenem 1 g IV q8h) — single-agent broad coverage",
        "**Metronidazole + 3rd-gen cephalosporin** alternative — covers anaerobes + GNR",
        "**Consider PCN desensitization** for prolonged course if alternatives have toxicity / cost barriers",
        "Long course 4–6 weeks IV either pathway",
      ],
      watchOut: [
        { sev: "warn", text: "**Clindamycin alternative** acceptable but Fusobacterium resistance rising — culture-confirm susceptibility" },
        { sev: "warn", text: "**Carbapenem stewardship** — document allergy + indication; narrow to metronidazole + ceftriaxone if Fusobacterium confirmed and susceptible" },
        { sev: "note", text: "Doxycycline lacks reliable Fusobacterium coverage — don't substitute alone" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "4–6 wk IV → PO; cover Fusobacterium necrophorum; manage IJ thrombus + septic emboli + metastatic sites.",
    evidence: "Society consensus — F. necrophorum dominant; extended course for septic thrombophlebitis + metastatic foci; anticoagulation case-by-case",
    branches: [
      { label: "Classic — F. necrophorum + IJ thrombus", days: "4–6 wk",
        detail: "Pip-tazo or ampicillin-sulbactam IV → PO amox-clav or metronidazole; ID-driven duration",
        matchAgent: /piperacillin|ampicillin-?sulbactam/i },
      { label: "Severe sepsis + metastatic septic emboli", days: "6 wk + ICU",
        detail: "Carbapenem + clindamycin + drainage of any drainable focus; aggressive ICU support",
        matchAgent: /meropenem|imipenem/i },
      { label: "PCN allergy (severe)", days: "4–6 wk",
        detail: "Meropenem or moxifloxacin + metronidazole; ID consult",
        matchAgent: /moxifloxacin|metronidazole/i },
      { label: "Concomitant pleural empyema / pulmonary abscess", days: "6 wk + drainage",
        detail: "Per empyema bands + drainage; chest tube + serial imaging" },
    ],
    stopWhen: [
      "Blood cultures cleared",
      "Septic emboli resolved on serial imaging",
      "IJ thrombus stable or resolving",
      "Source addressed — drainage of empyema / abscess",
      "Pathogen-specific minimum 4–6 wk completed",
    ],
    extendIf: [
      { text: "**Septic metastases** — chest, brain, joint — extend per site",
        matchCtx: { severe: true } },
      "Empyema or lung abscess — drainage + extend",
      "Brain abscess — per brain abscess bands (8–12 wk)",
      "Persistent bacteremia — re-workup + extend",
    ],
  },
  monitoring: {
    headline: "CT neck + chest at presentation; ID consult; anticoagulation case-by-case; drainage of metastatic foci.",
    items: [
      { sev: "required", what: "**CT neck with contrast + chest** at presentation",
        why: "Confirms IJ thrombophlebitis + identifies pulmonary septic emboli / cavities / empyema" },
      { sev: "required", what: "**Blood cultures × 2** with anaerobic media",
        why: "F. necrophorum slow-growing anaerobe; alert lab to extend incubation" },
      { sev: "required", what: "**ID consult** at presentation",
        why: "Pathogen-specific + extended course + metastatic-focus management requires specialist input" },
      { sev: "trigger", what: "**Drainage of accessible septic foci** — empyema, abscess, joint",
        why: "Source control accelerates clearance + reduces mortality" },
      { sev: "trigger", what: "**Anticoagulation case-by-case** for IJ thrombus",
        why: "No clear RCT data; consider for propagation, persistent bacteremia, or cavernous sinus involvement" },
      { sev: "trigger", what: "**Repeat imaging at 2 wk** to assess metastatic resolution",
        why: "Persistent septic emboli drives extension; serial imaging tracks response" },
      { sev: "trigger", what: "**Workup brain involvement** (CT/MRI) if neurologic signs",
        why: "Cavernous sinus thrombosis + brain abscess can complicate; extends duration significantly" },
      { sev: "consider", what: "**ENT consult** if persistent pharyngeal source",
        why: "Peritonsillar abscess or chronic pharyngitis may need surgical drainage" },
    ],
  },
  rationale: {
    driver: "Lemierre is septic thrombophlebitis of the internal jugular vein — Fusobacterium necrophorum > 80% (Karkos Laryngoscope 2009), seeded from an oropharyngeal source. Treatment runs 4–6 wk because the IJ thrombus and the typical pulmonary septic emboli are slow to clear; standard empirics are pip-tazo or ampicillin-sulbactam IV with anaerobic coverage built in, transitioning to oral amox-clav or metronidazole when stable. CT neck + chest at presentation confirms IJ thrombus + identifies pulmonary emboli, empyema, or abscesses requiring drainage. ID consult early; metastatic foci (brain, joint, vertebrae) drive extension beyond the 4–6-wk baseline.",
    guideline: "ssti",
    rejected: "Standard short-course bacteremia management (7–14 d) was deliberately rejected for Lemierre — the IJ thrombus and pulmonary septic emboli have substantially slower clearance kinetics than uncomplicated bacteremia, and shorter courses risk relapse + persistent metastatic seeding. Routine anticoagulation for all IJ thrombi was tempered: Phua (Eur J Clin Microbiol 2013) and successor reviews showed heterogeneous practice without clear mortality benefit — anticoagulation is reserved for propagation, persistent bacteremia, or cavernous sinus involvement." },
  objections: [
    { q: "Why 4-6 wk — septic thrombophlebitis needs that long?",
      a: "Lemierre syndrome runs 4–6 wk because the IJ thrombus + typical pulmonary septic emboli clear slowly even with appropriate antibiotics — Karkos (Laryngoscope 2009) [cite:ssti] and Phua (Eur J Clin Microbiol 2013) [cite:ssti] cohort reviews document this kinetic. Standard 7–14 d bacteremia management risks relapse + persistent metastatic seeding in this substrate. ID consult at presentation; the duration reflects the slow biological clearance of septic emboli + organized thrombus, not antibiotic potency." },
    { q: "Why pip-tazo when Fusobacterium responds to penicillin?",
      a: "Pip-tazo or ampicillin-sulbactam IV is the standard empiric choice per IDSA 2014 [cite:ssti] because F. necrophorum is increasingly β-lactamase-positive (Brook 2007 + successor data), and pure penicillin G can fail microbiologically. The β-lactamase inhibitor coverage matters at the empiric window; transition to PO amox-clav or metronidazole is acceptable when stable + organism susceptibility confirmed. Oral metronidazole alone is reserved for the back half once IV stabilization is complete; reflexive PCN monotherapy is no longer the audit-defensible default." },
    { q: "Why anticoagulation case-by-case — shouldn't all IJ thrombi get it?",
      a: "Phua (Eur J Clin Microbiol 2013) [cite:ssti] and successor reviews documented heterogeneous practice without clear mortality benefit from routine anticoagulation in Lemierre IJ thrombus — no RCT, observational signal limited. IDSA 2014 [cite:ssti] reserves anticoagulation for propagation, persistent bacteremia despite appropriate therapy, or cavernous sinus involvement; the bleeding risk in a frequently young patient with septic emboli is real. Decision is patient-specific with hematology / ID coordination; routine anticoagulation is not the default." },
    { q: "Why drain accessible septic foci — antibiotics should clear them?",
      a: "Septic emboli to lung (empyema, abscess), joint, or soft tissue represent closed-space infections that antibiotics cannot reliably clear without source control — IDSA 2014 [cite:ssti] mandates drainage of accessible foci to accelerate clearance + reduce mortality. The principle generalizes from STOP-IT [cite:stopit] source-control logic. Chest tube for empyema, IR drainage for organized lung abscess, or arthroscopic washout for septic arthritis each shortens the antibiotic course needed and prevents relapse. Antibiotics + drainage is bundled, not optional." },
  ],
  research: {
    headline: "F. necrophorum dominant; 4–6 wk pathogen-directed; anticoagulation case-by-case for IJ thrombus.",
    trials: [
      { name: "Karkos Laryngoscope 2009",
        n: "Cohort review",
        question: "Modern Lemierre syndrome epidemiology + outcomes",
        finding: "F. necrophorum > 80% of cases; extended IV → PO course; mortality ~5% with timely diagnosis",
        bias: "Modern diagnostic shifts increasing detection" },
      { name: "Phua Eur J Clin Microbiol 2013",
        n: "Cohort review",
        question: "Anticoagulation in Lemierre IJ thrombus",
        finding: "Heterogeneous practice; anticoagulation associated with reduced propagation but no clear mortality benefit; case-by-case",
        bias: "Observational; no RCT data" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2014,
        topic: "Head/neck infections (Stevens)",
        keypoint: "Pip-tazo or amp-sulbactam first-line; clindamycin alternative; metronidazole for anaerobic coverage" },
    ],
    openQuestions: [
      "Anticoagulation indications — propagation + persistent bacteremia + cavernous sinus involvement most agreed",
      "Optimal IV → PO transition timing — 2–3 wk standard",
      "Routine ENT evaluation — variable by source identification",
    ],
  },
};

export default { id: "lemierre", regimen, decision };
