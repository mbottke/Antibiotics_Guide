/* ===========================================================
   ZOONOTIC & ATYPICAL PNEUMONIA — Q fever, psittacosis, tularemia,
   plague, leptospira. Doxycycline / FQ workhorse; specific durations. */

const regimen = {
  "Empiric by exposure": [
    {
      rx: /doxycycline/i,
      pickIf: "Atypical pneumonia + zoonotic exposure (birds, livestock, ticks, raw milk).",
      whyPick: [
        "**Doxycycline 100 mg BID** covers Coxiella, C. psittaci, tularemia, Anaplasma",
        "Long-course (14–21 d) for Q fever; longer for chronic Q fever (months)",
        "Add **FQ or aminoglycoside** for severe tularemia",
        "Take exposure history seriously — pneumonia + bird exposure = psittacosis",
      ],
      watchOut: [
        { sev: "stop", text: "**Pregnancy + children** — choose alternative (macrolide for psittacosis)" },
        { sev: "warn", text: "Photosensitivity, pill esophagitis" },
        { sev: "note", text: "Notify ID and public health for confirmed zoonosis" },
      ],
    },
    {
      rx: /fluoroquinolone|aminoglycoside|tularemia/i,
      pickIf: "Severe tularemia (pulmonary or typhoidal) — add aminoglycoside or FQ.",
      whyPick: [
        "**Streptomycin or gentamicin** historically first-line for severe tularemia",
        "**Ciprofloxacin** acceptable alternative — oral bioavailability advantage",
        "Combine with doxycycline for severe disease",
        "Notify state health department — tularemia is reportable + bioterror agent",
      ],
      watchOut: [
        { sev: "warn", text: "Aminoglycoside nephro/ototoxicity — monitor trough" },
        { sev: "warn", text: "FQ resistance reported — confirm susceptibility" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Pathogen-specific durations — doxycycline backbone for most; pulmonary tularemia / plague distinct.",
    evidence: "CDC + Mandell — doxycycline first-line for Q fever, psittacosis, ehrlichia; FQ alternative; plague + tularemia per specific bands",
    branches: [
      { label: "Q fever pneumonia (acute, Coxiella burnetii)", days: "14 d",
        detail: "Doxycycline 100 mg BID; longer (12–18 mo + HCQ) if chronic / endocarditis",
        matchAgent: /hydroxychloroquine/i },
      { label: "Psittacosis (Chlamydophila psittaci, bird exposure)", days: "10–14 d",
        detail: "Doxycycline first-line; macrolide alternative; exposure history is the diagnostic key" },
      { label: "Pulmonary tularemia (Francisella tularensis)", days: "10–14 d",
        detail: "Cipro 10–14 d, or doxycycline / streptomycin / gentamicin 14 d; tier 1 select agent — alert lab + public health",
        matchAgent: /streptomycin/i },
      { label: "Pneumonic plague (Yersinia pestis)", days: "10–14 d",
        detail: "Streptomycin or gentamicin or cipro or doxy; isolate + report; post-exposure prophylaxis × 7 d for contacts",
        matchAgent: /gentamicin/i },
      { label: "Leptospirosis with pulmonary hemorrhage", days: "7 d",
        detail: "Ceftriaxone or doxy or PCN; ICU support; ID + nephrology",
        matchAgent: /ceftriaxone/i },
      { label: "Anthrax (inhalational, Bacillus anthracis)", days: "60 d + combination",
        detail: "Cipro or doxy + clinda + raxibacumab/obiltoxaximab per CDC; post-exposure prophylaxis × 60 d",
        matchAgent: /raxibacumab|obiltoxaximab/i },
    ],
    stopWhen: [
      "Pathogen-specific duration completed",
      "Clinical recovery + afebrile",
      "Imaging stable / resolving",
      "Public health reporting completed (notifiable diseases)",
      "Contacts notified + prophylaxis given as indicated",
    ],
    extendIf: [
      { text: "**Chronic Q fever / endocarditis** — 12–18 mo + hydroxychloroquine",
        matchCtx: { severe: true } },
      "Inhalational anthrax — 60 d + combination + antitoxin",
      "Plague / tularemia — bioterror context, escalate per CDC",
      "Immunocompromised — extend per ID",
    ],
  },
  monitoring: {
    headline: "Exposure history is the diagnostic key; report notifiable diseases; doxycycline workhorse.",
    items: [
      { sev: "required", what: "**Exposure history** — animals, travel, vectors, occupation",
        why: "Birds → psittacosis; livestock → Q fever / brucella; ticks → ehrlichia / RMSF; rabbits → tularemia" },
      { sev: "required", what: "**Public health reporting** for plague, anthrax, tularemia, Q fever",
        why: "Notifiable; tier 1 select agents drive lab + contact tracing response" },
      { sev: "required", what: "**Alert lab before sending** for plague / tularemia / anthrax",
        why: "BSL-3 organisms; lab worker exposure risk; specimen handling requirements" },
      { sev: "trigger", what: "**Post-exposure prophylaxis** for plague / anthrax close contacts",
        why: "Doxy or cipro × 7 d (plague) or 60 d (anthrax); protects contacts" },
      { sev: "trigger", what: "**Echo + chronic Q fever workup** if persistent fever > 6 mo",
        why: "Chronic Q fever endocarditis high mortality; 12–18 mo doxy + HCQ" },
      { sev: "trigger", what: "**Antitoxin (raxibacumab / obiltoxaximab)** for inhalational anthrax",
        why: "CDC-recommended adjunct to combination antibiotics" },
      { sev: "consider", what: "**Serology + PCR** for confirmation",
        why: "Most zoonotic pneumonia diagnoses confirmed retrospectively by paired serology" },
      { sev: "consider", what: "**ID consult** at presentation",
        why: "Unusual pathogens; specific therapeutic and reporting requirements" },
    ],
  },
  rationale: {
    driver: "Exposure history is the diagnostic key — birds → psittacosis; livestock / parturient animals → Q fever; rabbits / ticks → tularemia; rodents → plague; freshwater + leptospirosis. Doxycycline 100 mg BID is the workhorse for Q fever (14 d), psittacosis (10–14 d), and ehrlichia; fluoroquinolone is an alternative. Pneumonic plague and pulmonary tularemia are tier-1 select agents and require streptomycin or gentamicin (or cipro / doxy) plus public-health reporting + lab alert. Inhalational anthrax gets 60 d combination cipro + clindamycin + antitoxin per CDC.",
    guideline: "cdc_abx",
    rejected: "Empiric β-lactam monotherapy was deliberately rejected for suspected zoonotic atypical pneumonia — Q fever (Coxiella) is intracellular and resistant to cell-wall agents, and the same applies to psittacosis and ehrlichia. The legacy short course for chronic Q fever was rejected: chronic / endocarditis Q fever needs 12–18 mo doxycycline + hydroxychloroquine, and stopping at 14 d misses the relapsing intracellular reservoir." },
  objections: [
    { q: "Why doxycycline first when β-lactams cover most CAP?",
      a: "Zoonotic pneumonia pathogens — Coxiella burnetii (Q fever), Francisella tularensis (tularemia), Chlamydia psittaci (psittacosis), Rickettsia — are intracellular or atypical and intrinsically resistant to β-lactams. Doxycycline penetrates intracellularly and is first-line per CDC tier-1 guidance [cite:cdc_abx]. Anderson (Lancet ID 2013) showed empiric doxycycline in atypical pneumonia covers the common zoonotic pathogens; β-lactam empirics miss the diagnosis and propagate untreated disease." },
    { q: "Why pursue exposure history when most CAP is empirically treated?",
      a: "Exposure history is the diagnostic key — bird contact (psittacosis), parturient livestock or unpasteurized dairy (Q fever, brucella), rabbit / tick (tularemia), bat / rodent (hantavirus) — none are uncovered by ATS / IDSA empiric CAP regimens [cite:cap]. Without exposure-driven workup, retrospective serology is the only diagnostic, delaying targeted therapy by weeks. CDC tier-1 reporting [cite:cdc_abx] is also legally required for select agents." },
    { q: "Why immediate public-health reporting for suspected zoonotic?",
      a: "Tularemia, anthrax, plague, brucellosis, and Q fever are CDC nationally notifiable / tier-1 select agents — [cite:cdc_abx] mandates reporting at suspicion, not confirmation. Bioterrorism workup, source investigation (slaughterhouse, lab exposure, intentional release), and contact prophylaxis depend on early notification. Reporting is parallel to treatment, not sequential; delays compound public-health risk and miss outbreak signals [cite:mono]." },
  ],
  research: {
    headline: "Exposure history is the diagnostic key; doxycycline workhorse; CDC reporting for tier-1 select agents.",
    trials: [
      { name: "Anderson Lancet ID 2013",
        n: "Cohort",
        question: "Modern epidemiology of zoonotic atypical pneumonia",
        finding: "Q fever + psittacosis frequently missed; exposure history drives diagnostic suspicion; doxycycline empirical for atypical pneumonia covers common zoonotic",
        bias: "Western country surveillance; tropical exposures different" },
      { name: "CDC Anthrax Guidance 2014",
        n: "Guideline",
        question: "Inhalational anthrax management",
        finding: "60-d combination cipro / doxy + clinda + raxibacumab/obiltoxaximab antitoxin; post-exposure prophylaxis × 60 d for contacts",
        bias: "Tier-1 select agent; specific protocol" },
    ],
    guidelines: [
      { society: "CDC",
        year: 2024,
        topic: "Tier-1 select agents (anthrax, plague, tularemia, Q fever)",
        keypoint: "Public health reporting + lab alert + post-exposure prophylaxis; specific antibiotic protocols per pathogen" },
      { society: "ATS / IDSA",
        year: 2019,
        topic: "CAP including atypical (Metlay)",
        keypoint: "Doxycycline or macrolide covers common atypical pneumonia; zoonotic exposures drive workup intensity" },
    ],
    openQuestions: [
      "Optimal chronic Q fever / endocarditis duration — 12–18 mo doxy + HCQ standard",
      "Post-exposure prophylaxis cost-effectiveness — outbreak-context only",
      "Tularemia / plague antibiotic equivalence — streptomycin vs gentamicin vs cipro",
    ],
  },
};

export default { id: "zoonotic-pna", regimen, decision };
