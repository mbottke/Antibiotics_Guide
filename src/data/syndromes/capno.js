/* ===========================================================
   CAPNOCYTOPHAGA INFECTION — dog bite + asplenic / alcoholic;
   fulminant sepsis; ceftriaxone or pip-tazo; high mortality. = */

const regimen = {
  "Empiric / directed": [
    {
      rx: /ampicillin-?sulbactam|piperacillin|carbapenem/i,
      pickIf: "Capnocytophaga infection (dog/cat exposure + asplenia/cirrhosis/alcoholism).",
      whyPick: [
        "**Amp-sulbactam or pip-tazo** standard — covers fastidious oral flora",
        "**Carbapenem** for septic shock or asplenic-OPSI presentation",
        "**Mortality 25–60% in asplenic / cirrhotic** — treat as emergency",
        "Source the exposure: dog/cat lick or bite is classic; 1–14 d incubation",
      ],
      watchOut: [
        { sev: "stop", text: "**DIC + purpura fulminans** — fast supportive care + early surgical consult for tissue necrosis" },
        { sev: "warn", text: "**Asplenia / functional asplenia (SCD, post-XRT) + dog exposure** → highest mortality — broaden + ICU early",
          matchCtx: { severe: true } },
        { sev: "note", text: "Counsel asplenic patients: avoid contact with dog saliva, especially abraded skin; standing home antibiotic prescription advisable" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "14 d for bacteremia; longer for IE / meningitis; aggressive resuscitation in asplenic + alcoholic hosts.",
    evidence: "Society consensus — Capnocytophaga canimorsus after dog bite causes fulminant sepsis in asplenic / cirrhotic; PCN or ceftriaxone first-line",
    branches: [
      { label: "Bacteremia, immunocompetent", days: "14 d",
        detail: "Penicillin G or ampicillin or ceftriaxone; treat per sensitivity",
        matchAgent: /penicillin|ceftriaxone/i },
      { label: "Severe sepsis (asplenic / cirrhotic / immunocompromised)", days: "14–21 d",
        detail: "Pip-tazo or carbapenem broad initially + ICU; high mortality without rapid escalation",
        matchAgent: /piperacillin|meropenem/i },
      { label: "Endocarditis", days: "4–6 wk",
        detail: "Per IE bands; ceftriaxone or amp-sulbactam; valve surgery for vegetation / failure" },
      { label: "Meningitis (rare)", days: "21 d",
        detail: "Ceftriaxone + dexamethasone per meningitis bands" },
      { label: "Local wound infection only", days: "7–10 d",
        detail: "Amox-clav PO; per bite wound bands; ID consult if asplenic" },
    ],
    stopWhen: [
      "Blood cultures cleared",
      "Afebrile + off vasopressors",
      "DIC / purpura fulminans resolved",
      "Source addressed — wound, asplenic status, alcoholic state",
      "Pathogen-specific minimum duration met",
    ],
    extendIf: [
      { text: "**Asplenic / cirrhotic substrate** — extend per host + clinical course",
        matchCtx: { severe: true } },
      "Endocarditis — per IE bands",
      "Purpura fulminans / DIC — supportive + extended",
      "Inadequate source control — wound debridement",
    ],
  },
  monitoring: {
    headline: "Asplenic + dog bite triggers high-risk admission; aggressive resuscitation; pneumovax for asplenic.",
    items: [
      { sev: "required", what: "**Aggressive resuscitation** for septic shock in asplenic host",
        why: "Mortality > 30% in asplenic Capnocytophaga sepsis; rapid escalation life-saving" },
      { sev: "required", what: "**Dog bite history** — single largest risk factor",
        why: "~75% of Capnocytophaga sepsis cases have dog exposure; asks about lick / bite / scratch" },
      { sev: "required", what: "**Blood cultures × 2** at presentation",
        why: "Slow-growing organism — hold cultures 7+ d; alert lab to extend incubation" },
      { sev: "trigger", what: "**ICU admission** + vasopressor support for septic shock",
        why: "Fulminant course in high-risk hosts; line + pressor support common" },
      { sev: "trigger", what: "**Purpura fulminans / DIC monitoring**",
        why: "DIC + symmetric peripheral gangrene common; coag panel + supportive measures" },
      { sev: "trigger", what: "**Pneumococcal + meningococcal + Hib vaccination review** for asplenic",
        why: "Standard asplenia prophylaxis reduces future fulminant episodes" },
      { sev: "trigger", what: "**Standby amoxicillin** prescription for asplenic with dog bite",
        why: "Early self-treatment of febrile bite reduces sepsis incidence" },
      { sev: "consider", what: "**Workup HIV + chronic alcoholic / hepatic disease**",
        why: "Common substrate; addressable comorbidities" },
    ],
  },
  rationale: {
    driver: "Capnocytophaga canimorsus drives fulminant sepsis after dog (or cat) exposure when the host substrate is asplenic, alcoholic, or cirrhotic — Janda (CID 1999) anchors ~75% of cases to dog exposure and mortality > 30% in the asplenic subset because impaired opsonization of encapsulated organisms removes the critical defense. Ceftriaxone or penicillin G is first-line for the immunocompetent host (14 d for uncomplicated bacteremia); pip-tazo or meropenem with ICU-level resuscitation is the severe-host regimen because the DIC + purpura-fulminans phenotype evolves over hours. The organism is fastidious and slow-growing — the lab must be alerted to extend blood-culture incubation past the standard 5-day window.",
    guideline: "ssti",
    rejected: "Standard 5-day blood-culture incubation without alerting the lab was deliberately rejected — Capnocytophaga is fastidious and slow-growing, and routine clearance protocols miss the organism in patients with the right substrate and history. Discharging an asplenic patient with a dog-exposure febrile illness without inpatient observation was tempered — Stevens IDSA 2014 and Janda 1999 both anchor low threshold for admission + broad coverage given the fulminant kinetics. Skipping standby amoxicillin + vaccination review at discharge in the asplenic host was rejected: every subsequent dog-bite carries the same OPSI-equivalent risk." },
  objections: [
    { q: "Why broad pip-tazo or carbapenem in an asplenic dog-bite sepsis?",
      a: "Capnocytophaga canimorsus in the asplenic, alcoholic, or cirrhotic host produces fulminant DIC + purpura fulminans with mortality > 30% per Janda CID 1999 [cite:ssti] — ceftriaxone or PCN G covers immunocompetent disease (14 d for uncomplicated bacteremia), but the severe-host substrate evolves over hours and the broader empiric is anchored by IDSA SSTI 2014 [cite:ssti]. Time-cost of narrowing later is acceptable; time-cost of missing fulminant Capnocytophaga in a high-risk host is catastrophic. ICU-level resuscitation is concurrent." },
    { q: "Why alert the lab to extend blood-culture incubation?",
      a: "Capnocytophaga is fastidious and slow-growing — standard 5-day blood-culture incubation often clears as negative before the organism is detected per Janda CID 1999 [cite:ssti]. The lab must be alerted to extend incubation past 7 d, particularly when the clinical picture fits (dog exposure + asplenic / alcoholic / cirrhotic host + sepsis). MALDI-TOF or 16S sequencing accelerates identification on the bottle. Missing the speciation drives mis-targeted empirics and missed source-tracing for the bite/exposure history." },
    { q: "Why standby amox-clav for asplenic patient with future dog exposure?",
      a: "IDSA SSTI 2014 [cite:ssti] anchors prophylactic amox-clav for high-risk dog bites — the asplenic + dog-bite combination carries OPSI-equivalent risk for Capnocytophaga and other oral flora (Pasteurella, Eikenella, anaerobes). Standby self-administered amox-clav at first bite or febrile symptom bridges to ED with measurable mortality benefit. Pair with PCV20 + MenACWY + Hib vaccination review and a medical-alert ID per IDSA / ASH asplenia guidance; the bundle is what reduces recurrent fulminant disease." },
  ],
  research: {
    headline: "Dog-bite + asplenic + cirrhotic substrate drives fulminant sepsis; slow-growing — alert lab for extended incubation.",
    trials: [
      { name: "Janda CID 1999",
        n: "Cohort review",
        question: "Capnocytophaga canimorsus epidemiology",
        finding: "~75% of cases have dog exposure; asplenic + alcoholic + cirrhotic substrate predicts fulminant DIC; mortality > 30% in asplenic",
        bias: "Pre-modern microbiology; signal replicated" },
      { name: "Lion CID 1996",
        n: "Series",
        question: "DIC + purpura fulminans in Capnocytophaga sepsis",
        finding: "DIC + symmetric peripheral gangrene common in fulminant cases; supportive measures + aggressive resuscitation drive outcomes",
        bias: "Small series; consistent observational signal" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2014,
        topic: "Bite-wound infections including Capnocytophaga (Stevens)",
        keypoint: "Amox-clav prophylaxis for dog bites in high-risk; ceftriaxone or pip-tazo empiric for sepsis; asplenic substrate alerts" },
    ],
    openQuestions: [
      "Optimal empiric coverage in dog-bite + febrile asplenic — broad initial standard",
      "Asplenia vaccination + standby antibiotic compliance — variable",
      "Routine dog-bite prophylaxis indications — high-risk subset only",
    ],
  },
};

export default { id: "capno", regimen, decision };
