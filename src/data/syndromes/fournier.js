/* ===========================================================
   SSTI · FOURNIER'S GANGRENE — perineal necrotizing emergency. == */

const regimen = {
  "Immediate": [
    {
      rx: /SURGICAL|piperacillin|vancomycin|clindamycin/i,
      pickIf: "Fournier's gangrene — perineal / scrotal necrotizing infection. SURGERY NOW.",
      whyPick: [
        "**Surgical debridement is the treatment** — within HOURS",
        "**Pip-tazo (or carbapenem) + vancomycin + clindamycin** — polymicrobial + toxin",
        "Diversion (colostomy) often needed",
        "Mortality 20–40% — predictors include sepsis, comorbidities, delay to OR",
      ],
      watchOut: [
        { sev: "stop", text: "**Delay to surgery = death** — operate on suspicion" },
        { sev: "warn", text: "Diabetic, immunocompromised, alcoholic — common substrate" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Continue IV until surgical clearance; clindamycin throughout for toxin suppression.",
    evidence: "Society consensus — surgical-driven; no fixed duration; mortality 20–40% with delay",
    branches: [
      { label: "Standard polymicrobial", days: "Until clear",
        detail: "Pip-tazo + vancomycin + clindamycin; serial debridement to clean margins" },
      { label: "Clostridial confirmed", days: "10–14 d post-clearance",
        detail: "Penicillin + clindamycin + broad coverage; hyperbaric oxygen if available" },
      { label: "Severe sepsis / shock at presentation", days: "Extended",
        detail: "Per ICU + ID + surgery; long-course typical given mortality" },
    ],
    stopWhen: [
      "Surgical margins clean on serial debridement",
      "Afebrile ≥ 48 h",
      "Off vasopressors; clinical recovery",
      "Wound closing or negative-pressure dressing controlling",
      "Diverting colostomy / urinary diversion in place if needed",
    ],
    extendIf: [
      { text: "**Persistent surgical disease** — continue until margins clean",
        matchCtx: { severe: true } },
      "Bacteremia confirmed — extend per source",
      "Streptococcal TSS — clindamycin + IVIG for full course",
      "Reconstructive surgery planning — extend per multi-stage closure",
    ],
  },
  monitoring: {
    headline: "Surgery within hours; serial debridement q24h; ICU + ID + urology + general surgery team.",
    items: [
      { sev: "required", what: "**Emergent surgical debridement within hours** of presentation",
        why: "Mortality climbs 10% per hour of delay; clinical suspicion alone justifies OR" },
      { sev: "required", what: "**Serial debridement q24h** until margins are clean",
        why: "Necrosis extends through fascial planes silently under antibiotic cover" },
      { sev: "required", what: "**ICU + multi-team coordination** — urology, general surgery, ID",
        why: "Multi-organ failure common; team-based care drives outcomes" },
      { sev: "trigger", what: "**Diverting colostomy** for perineal involvement",
        why: "Fecal contamination perpetuates infection + impairs wound healing",
        matchCtx: { severe: true } },
      { sev: "trigger", what: "**Suprapubic catheter** for urinary diversion",
        why: "Indwelling urethral catheter risk in penile / scrotal involvement" },
      { sev: "consider", what: "Hyperbaric oxygen for clostridial component",
        why: "Adjunctive only; never delay surgery; institutional availability varies" },
    ],
  },
  rationale: {
    driver: "Fournier's gangrene is the perineal subset of necrotizing fasciitis — antibiotics are adjunctive, emergent debridement is the disease, and mortality climbs ~10% per hour of OR delay (Sorensen J Urol 2009). Empirics are broad polymicrobial (pip-tazo + vancomycin + clindamycin) covering enteric GNR + anaerobes + MRSA + toxin-producing strep; clindamycin runs throughout for ribosomal toxin suppression. Diabetes is the dominant substrate, multi-team coordination (urology + general surgery + ID + ICU) is mandated, and diverting colostomy / suprapubic catheter address ongoing fecal or urinary contamination of the wound bed.",
    guideline: "ssti",
    rejected: "Antibiotic-only management or waiting for imaging was deliberately rejected — clinical suspicion alone justifies the OR (WSES 2018 / Stevens IDSA 2014), and CT or MRI must never delay surgery in the deteriorating patient because mortality is time-to-debridement-driven. Hyperbaric oxygen as primary therapy was rejected: observational support only, never delay surgical debridement, and institutional availability varies. Narrow-spectrum empirics were tempered — the polymicrobial substrate demands enteric + anaerobic + MRSA + GAS coverage from the first dose." },
  objections: [
    { q: "Why emergency OR — can broad antibiotics stabilize first?",
      a: "Fournier gangrene is necrotizing fasciitis of perineum; every hour of delay to debridement increases mortality. Resuscitate in parallel, not sequentially — antibiotics + surgery within 12 h. Polymicrobial gut/skin flora seeded into fascial planes cannot be cleared by antibiotics alone [cite:ssti]." },
    { q: "Why pip-tazo + vancomycin + clindamycin — isn't that overkill?",
      a: "Polymicrobial type I infection requires gram-negative, anaerobic, MRSA, and toxin-suppressive coverage simultaneously. Clindamycin adds ribosomal toxin suppression for streptococcal/clostridial components. De-escalate based on operative cultures within 48–72 h; empiric overlap is appropriate until pathogens identified [cite:ssti]." },
    { q: "Why diverting colostomy for some patients?",
      a: "Fecal contamination of a fresh perineal wound impairs healing and reseeds infection. Selective diversion is considered for extensive perianal/perineal involvement, sphincter destruction, or repeated soiling. Decision is surgical and case-specific; not all patients require it but threshold should be low in extensive disease [cite:mono]." },
  ],
  research: {
    headline: "Mortality 20–40%; emergent serial debridement; broad polymicrobial + clindamycin; diabetic substrate.",
    trials: [
      { name: "Sorensen J Urol 2009",
        n: "Cohort review",
        question: "Modern Fournier outcomes",
        finding: "Time-to-OR + extent of disease + diabetic substrate predict mortality; aggressive debridement essential",
        bias: "Single-center cohort" },
    ],
    guidelines: [
      { society: "WSES",
        year: 2018,
        topic: "Necrotizing soft tissue infection",
        keypoint: "Emergent serial debridement + broad antibiotics + clindamycin; diabetic + urology consult" },
    ],
    openQuestions: [
      "Diverting colostomy timing — perineal involvement extent",
      "HBO benefit — observational support only",
    ],
  },
};

export default { id: "fournier", regimen, decision };
