/* ===========================================================
   LUDWIG'S ANGINA — bilateral submandibular cellulitis; airway
   emergency; surgical + broad antibiotics. ==================== */

const regimen = {
  "Empiric": [
    {
      rx: /ampicillin-?sulbactam|piperacillin/i,
      pickIf: "Ludwig's angina — bilateral submandibular cellulitis, airway risk.",
      whyPick: [
        "**Amp-sulbactam or pip-tazo** — oral flora coverage (streptococci + anaerobes)",
        "Add **vancomycin** if MRSA risk / immunocompromised / failed prior antibiotics",
        "**Airway management priority** — fiberoptic intubation in OR; never delay airway for imaging",
        "**ENT or OMFS** for drainage + dental source control",
      ],
      watchOut: [
        { sev: "stop", text: "**Airway loss is the killer** — secure early; don't wait for stridor or impending obstruction" },
        { sev: "warn", text: "**Dental abscess source** in 80% — image-search molar teeth; extraction + drainage at same OR visit" },
        { sev: "note", text: "Bilateral submandibular firmness + elevated tongue + drooling triad → operate first, image second" },
      ],
    },
  ],
  "Severe / immunocompromised": [
    {
      rx: /piperacillin.*vancomycin/i,
      pickIf: "Severe Ludwig with sepsis or immunocompromised host.",
      whyPick: [
        "**Pip-tazo + vancomycin** — broader for resistant flora + MRSA",
        "**Emergent ENT / OMFS** for drainage — multi-space involvement requires surgical exploration",
        "**Consider carbapenem** if prior broad β-lactam exposure or ICU substrate",
        "**ICU + airway team** standing by — tracheostomy may be needed",
      ],
      watchOut: [
        { sev: "warn", text: "**Necrotizing soft-tissue extension** — low threshold for surgical exploration + repeated debridement" },
        { sev: "warn", text: "**Mediastinitis** complication — descending necrotizing infection through fascial planes; CT neck + chest at any spread suspicion" },
        { sev: "note", text: "Diabetic + immunocompromised need lower threshold for broad coverage + early imaging extension" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Airway management + broad anaerobic coverage + surgical drainage; 14 d IV → PO.",
    evidence: "ENT + ID consensus — bilateral submandibular cellulitis with airway compromise; dental + oral source; surgical drainage drives outcome",
    branches: [
      { label: "Ludwig's angina, no airway compromise", days: "14 d IV → PO",
        detail: "Ampicillin-sulbactam or clindamycin + cefoxitin; PO step-down when stable",
        matchAgent: /ampicillin-?sulbactam|clindamycin/i },
      { label: "Airway compromise / impending obstruction", days: "14 d + airway + surgery",
        detail: "Emergent airway (awake fiberoptic or trach) + IV broad + ENT + ICU",
        matchAgent: /piperacillin|meropenem/i },
      { label: "Descending mediastinitis complication", days: "Per mediastinitis bands",
        detail: "Per mediastinitis syndrome bands; cardiothoracic + ENT + ID" },
      { label: "Immunocompromised / diabetic", days: "14–21 d",
        detail: "Lower threshold to IV + extended course; consider fungal coverage if neutropenic" },
    ],
    stopWhen: [
      "Airway secured + extubated",
      "Surgical drainage complete",
      "Afebrile + clinical recovery",
      "Dental source addressed",
      "Minimum 14 d completed",
    ],
    extendIf: [
      { text: "**Mediastinitis** complication — per mediastinitis bands",
        matchCtx: { severe: true } },
      "Bacteremia confirmed — per pathogen",
      "Inadequate drainage — re-explore + extend",
      "Immunocompromised host — extend per ID",
    ],
  },
  monitoring: {
    headline: "Airway is the priority; ENT + anesthesia + ICU; surgical drainage; dental source mandatory.",
    items: [
      { sev: "required", what: "**Airway assessment + plan** before any intervention",
        why: "Airway compromise sudden; awake fiberoptic intubation safer than RSI; trach standby" },
      { sev: "required", what: "**ENT + anesthesia + ICU consult**",
        why: "Multidisciplinary airway management drives mortality reduction" },
      { sev: "required", what: "**CT neck with contrast** for surgical planning",
        why: "Defines extent + abscess + mediastinal extension; drives drainage approach" },
      { sev: "trigger", what: "**Surgical drainage** for any drainable collection",
        why: "Source control accelerates resolution; ENT-driven" },
      { sev: "trigger", what: "**Dental source identification + extraction**",
        why: "Most cases dental in origin; source eradication prevents recurrence" },
      { sev: "trigger", what: "**Cover anaerobes + GPC + GNR**",
        why: "Polymicrobial oral flora; broad coverage standard" },
      { sev: "trigger", what: "**Workup mediastinitis** with CT chest if persistent fever",
        why: "Descending necrotizing mediastinitis high mortality complication" },
      { sev: "consider", what: "**Steroids contested** — not standard; case-by-case",
        why: "May reduce edema but immunosuppression risk; ENT + ID decision" },
    ],
  },
  rationale: {
    driver: "Ludwig's angina is an airway emergency first and an antibiotic problem second — Saifeldeen (Emerg Med J 2004) and Reynolds (J Emerg Med 2007) anchor awake fiberoptic intubation with tracheostomy standby over RSI, because muscle relaxation collapses the swollen floor of mouth and loses the airway. Source is dental in 70–90%, so the empiric covers oral polymicrobial flora (streptococci, anaerobes including Prevotella + Fusobacterium, occasional MRSA): ampicillin-sulbactam 3 g IV q6h or clindamycin + ceftriaxone in PCN-allergic, with pip-tazo or meropenem reserved for septic shock or descending mediastinitis. Surgical drainage of any collection plus dental extraction drives duration — 14 d IV → PO per IDSA Stevens.",
    guideline: "ssti",
    rejected: "Rapid-sequence intubation in Ludwig's angina was deliberately rejected — paralysis collapses the airway in a patient who is already at edema-induced maximum compliance, and Saifeldeen documents catastrophic loss with RSI versus awake fiberoptic + trach standby. Antibiotic-only management without dental source eradication was tempered: untreated periodontal or apical infection recurs within weeks, and Reynolds shows extraction at index admission prevents 30-day recurrence. Routine empiric MRSA cover with vancomycin was rejected outside septic shock, trauma, or known colonization — IDSA Stevens reserves it for those substrates; reflexive vanco wastes spectrum without changing outcomes." },
  objections: [
    { q: "Why not RSI — patient is anxious and dropping sats?",
      a: "Saifeldeen (Emerg Med J 2004) and Reynolds (J Emerg Med 2007) document catastrophic airway loss with rapid-sequence intubation in Ludwig's angina because paralysis collapses the swollen floor-of-mouth in a patient already at edema-induced maximum compliance [cite:ssti]. Awake fiberoptic intubation with tracheostomy standby preserves spontaneous ventilation; RSI removes the only protective reflex left. The IDSA SSTI 2014 airway approach is non-negotiable." },
    { q: "Why ampicillin-sulbactam over empiric vancomycin?",
      a: "Ludwig's is dental-origin oral polymicrobial disease (streptococci + Prevotella + Fusobacterium) in 70–90% per Reynolds J Emerg Med 2007, and IDSA Stevens 2014 anchors ampicillin-sulbactam 3 g IV q6h as the empiric backbone [cite:ssti]. Routine MRSA cover with vancomycin is reserved for septic shock, trauma, or known colonization — reflexive vanco wastes spectrum, drives AKI risk, and does not change outcomes in the standard dental-source presentation." },
    { q: "Why insist on dental extraction — antibiotics are working?",
      a: "Untreated periodontal or apical infection recurs within weeks of antibiotic completion — Reynolds shows extraction at index admission prevents 30-day recurrence and removes the substrate driving the deep-neck-space pus [cite:ssti]. Antibiotic-only management without dental source eradication treats the cellulitis but leaves the originating focus intact; IDSA Stevens anchors source control alongside antibiotic therapy, not as an outpatient afterthought." },
  ],
  research: {
    headline: "Airway is the priority — awake fiberoptic safer than RSI; broad anaerobic + ENT + ICU; dental source identification.",
    trials: [
      { name: "Saifeldeen Emerg Med J 2004",
        n: "Cohort review",
        question: "Modern Ludwig's angina airway management",
        finding: "Awake fiberoptic intubation safer than RSI; tracheostomy standby; ICU mandatory until airway stable",
        bias: "Pre-modern but principle holds" },
      { name: "Reynolds J Emerg Med 2007",
        n: "Cohort",
        question: "Dental etiology + descending mediastinitis risk",
        finding: "70-90% dental in origin; descending necrotizing mediastinitis in ~5%; CT chest if persistent fever",
        bias: "Western country cohort" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2014,
        topic: "SSTI including Ludwig's (Stevens)",
        keypoint: "Ampi-sulbactam or pip-tazo + clindamycin; airway-first; ENT + anesthesia + ICU" },
    ],
    openQuestions: [
      "Steroid adjunct — limited evidence; case-by-case",
      "Routine surgical drainage thresholds — drainable collection",
      "Optimal antibiotic duration — 14 d standard; longer if mediastinitis",
    ],
  },
};

export default { id: "ludwig", regimen, decision };
