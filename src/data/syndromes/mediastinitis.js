/* ===========================================================
   MEDIASTINITIS — post-sternotomy or descending necrotizing;
   surgical debridement + broad antibiotics; high mortality. == */

const regimen = {
  "Post-sternotomy": [
    {
      rx: /vancomycin.*antipseudomonal|cefepime|piperacillin/i,
      pickIf: "Post-cardiac-surgery mediastinitis (deep sternal wound infection).",
      whyPick: [
        "**Vancomycin + antipseudomonal β-lactam** — covers staph + hospital GNR",
        "**Surgical debridement + sternal closure / flap** drives outcomes — antibiotics adjunctive",
        "Long course: **4–6 weeks IV** + step-down depending on hardware + clinical response",
        "Coordinate cardiothoracic + ID + plastics for sternal-flap planning",
      ],
      watchOut: [
        { sev: "stop", text: "**Surgical debridement is the treatment** — antibiotics alone with hardware in place uniformly fail" },
        { sev: "warn", text: "**MRSA + Pseudomonas** drive most cases — broaden if culture pending; narrow when speciated" },
        { sev: "note", text: "Mortality 15–30% even with optimal care; long-term sternal instability common" },
      ],
    },
  ],
  "Descending necrotizing": [
    {
      rx: /piperacillin|carbapenem/i,
      pickIf: "Descending necrotizing mediastinitis from oropharyngeal source.",
      whyPick: [
        "**Pip-tazo or carbapenem** — polymicrobial + anaerobes + GNR",
        "**Emergent surgical drainage** — cervical + thoracic exploration mandatory",
        "**Source the oropharynx** — dental, pharyngeal, retropharyngeal abscess; ENT + OMFS",
        "ICU + airway team; tracheostomy often needed",
      ],
      watchOut: [
        { sev: "stop", text: "**Surgery urgent** — mortality high with delay; descending infection can outpace antibiotics" },
        { sev: "warn", text: "**Repeat surgical exploration** until margins clean — necrosis extends through fascial planes silently" },
        { sev: "note", text: "Add clindamycin for streptococcal toxin suppression if polymicrobial with GAS confirmed" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Surgical debridement + 4–6 wk antibiotics; per pathogen; cardiac surgery + ID coordination critical.",
    evidence: "STS + IDSA — surgical debridement drives outcome; pathogen-directed long course; high mortality without surgery",
    branches: [
      { label: "Post-sternotomy (cardiac surgery)", days: "4–6 wk",
        detail: "Vancomycin + cefepime or pip-tazo; cover MRSA + GNR; cardiac surgery for debridement + closure",
        matchAgent: /vancomycin|cefepime|piperacillin/i },
      { label: "Descending necrotizing (oropharyngeal source)", days: "4–6 wk",
        detail: "Pip-tazo + clinda or carbapenem + metronidazole; ENT + cardiothoracic + ID",
        matchAgent: /clindamycin|metronidazole/i },
      { label: "Esophageal perforation / Boerhaave", days: "4–6 wk",
        detail: "Broad — pip-tazo or carbapenem; surgical / endoscopic source control + drainage" },
      { label: "MRSA-confirmed", days: "4–6 wk",
        detail: "Vancomycin or daptomycin; AUC monitoring; oral step-down with linezolid when stable",
        matchAgent: /daptomycin|linezolid/i },
    ],
    stopWhen: [
      "Surgical debridement complete + clean margins",
      "Mediastinum closed or stable on negative-pressure",
      "Afebrile + clinical recovery",
      "Cultures cleared",
      "Minimum 4–6 wk completed",
    ],
    extendIf: [
      { text: "**Persistent surgical disease** — extend until margins clean",
        matchCtx: { severe: true } },
      "Bacteremia confirmed — per pathogen + source",
      "Osteomyelitis of sternum — per chronic osteo bands",
      "Inadequate source control — re-debridement",
    ],
  },
  monitoring: {
    headline: "Surgical debridement is the cure; cardiac surgery + ID; sternal osteomyelitis common; NPWT.",
    items: [
      { sev: "required", what: "**Cardiothoracic surgery emergent consult**",
        why: "Surgical debridement + drainage drives outcome; antibiotic alone fails" },
      { sev: "required", what: "**CT chest with contrast** at presentation",
        why: "Defines extent + identifies abscess + planning surgical approach" },
      { sev: "required", what: "**Blood cultures + wound / deep tissue cultures**",
        why: "Pathogen identification drives narrowing; deep cultures often polymicrobial" },
      { sev: "trigger", what: "**Negative-pressure wound therapy (NPWT)** post-debridement",
        why: "Accelerates granulation + reduces re-debridement; standard adjunct" },
      { sev: "trigger", what: "**Cover MRSA + GNR + anaerobes** empirically",
        why: "Polymicrobial substrate; narrow on culture data at 48–72 h" },
      { sev: "trigger", what: "**ENT consult** for descending necrotizing mediastinitis",
        why: "Oropharyngeal source needs surgical + airway management" },
      { sev: "trigger", what: "**Workup sternal osteomyelitis** with MRI / CT",
        why: "Common complication; drives extended duration + surgical extent" },
      { sev: "consider", what: "**Cardiac rehab + nutrition support** during recovery",
        why: "Long-course IV + extended hospitalization; multi-modal recovery" },
    ],
  },
  rationale: {
    driver: "Acute mediastinitis is a surgical disease — emergent cardiothoracic debridement drives outcome and antibiotics are adjunctive over a long course (4–6 wk). Post-sternotomy disease is MRSA + GNR-dominant, so empiric vancomycin + cefepime or pip-tazo is the substrate-matched empiric (STS / IDSA 2017). Descending necrotizing disease from an oropharyngeal source adds anaerobic + clindamycin coverage and ENT participation; esophageal perforation / Boerhaave demands urgent surgical or endoscopic source control + broad-spectrum coverage. NPWT post-debridement, sternal osteomyelitis surveillance, and multi-team coordination (cardiac surgery + ENT + ID) define the recovery course.",
    guideline: "ssti",
    rejected: "Antibiotic-only management was deliberately rejected — Trouillet (J Thorac Cardiovasc Surg 1996) and Pairolero (Ann Thorac Surg 2010) both document that aggressive debridement drives outcomes, and antibiotics without surgical source control have near-uniform failure with mortality > 50%. Narrow empiric coverage was tempered: the polymicrobial substrate of post-sternotomy + descending + esophageal-source disease demands broad coverage from the first dose pending operative cultures. Withholding NPWT post-debridement was rejected — it accelerates granulation + reduces re-debridement and is standard adjunct." },
  objections: [
    { q: "Why surgical debridement before broadening antibiotics?",
      a: "Post-sternotomy mediastinitis is a deep space infection with retained hardware and devitalized bone; antibiotics cannot sterilize until source control achieved. Debridement, wire removal where appropriate, and negative-pressure wound therapy are foundational. Antibiotics treat surrounding tissue and bacteremia, not the cavity [cite:ssti]." },
    { q: "Why empiric vancomycin plus gram-negative cover?",
      a: "Post-cardiac-surgery mediastinitis is staph-dominant (including MRSA), but enteric gram-negatives and Pseudomonas occur in 15–30%, especially with prolonged ICU exposure. Vancomycin plus cefepime or pip-tazo covers empirically; de-escalate on operative cultures within 48–72 h per stewardship [cite:stew]." },
    { q: "Why 4–6 weeks of IV therapy after debridement?",
      a: "Sternal osteomyelitis with retained wires or unstable bone requires prolonged courses analogous to native bone osteomyelitis. Duration shortens with complete debridement and clean margins; extends with retained hardware or persistent collection. Anchor to source control adequacy and inflammatory marker trend [cite:mono]." },
  ],
  research: {
    headline: "Surgical debridement drives outcome; cardiothoracic + ENT + ID coordination; NPWT + sternal osteo surveillance.",
    trials: [
      { name: "Trouillet J Thorac Cardiovasc Surg 1996",
        n: "Cohort",
        question: "Post-sternotomy mediastinitis management",
        finding: "Aggressive surgical debridement + 4–6 wk antibiotics drive outcomes; mortality 10–25% with timely surgery",
        bias: "Cardiac-surgery-specific cohort" },
      { name: "Pairolero Ann Thorac Surg 2010",
        n: "Cohort review",
        question: "Modern mediastinitis classification + outcomes",
        finding: "Sternal closure technique + NPWT improve healing; flap reconstruction for complex defects",
        bias: "Tertiary-center cohort" },
    ],
    guidelines: [
      { society: "STS / IDSA",
        year: 2017,
        topic: "Post-cardiac-surgery infection",
        keypoint: "Emergent debridement + 4–6 wk antibiotics; cover MRSA + GNR; sternal osteo surveillance" },
    ],
    openQuestions: [
      "Optimal antibiotic duration in sternal osteo — case-by-case extended",
      "NPWT timing post-debridement — early use increasingly standard",
      "Descending necrotizing — ENT + thoracic combined operation",
    ],
  },
};

export default { id: "mediastinitis", regimen, decision };
