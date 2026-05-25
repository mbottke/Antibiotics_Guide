/* ===========================================================
   SCROTAL ABSCESS / FOURNIER'S — Fournier is surgical emergency;
   polymicrobial; aggressive debridement + broad antibiotics. == */

const regimen = {
  "Empiric + drainage": [
    {
      rx: /antipseudomonal|drainage|orchiectomy/i,
      pickIf: "Scrotal abscess — drainage is the treatment.",
      whyPick: [
        "**Drainage first** — antibiotics are adjunctive",
        "Cover age-appropriate flora (enteric in older; STI in young)",
        "**Fournier's risk** if necrotic spread — emergency",
      ],
      watchOut: [
        { sev: "stop", text: "**Fournier's gangrene** if necrotic spread / crepitus / pain out of proportion — emergent OR + broad coverage + clindamycin" },
        { sev: "warn", text: "**Testicular preservation** drives extent of drainage — urology now, not later, if testicle viability is in question",
          matchCtx: { severe: true } },
        { sev: "note", text: "Diabetic and immunocompromised: lower threshold for broad coverage + early imaging (CT) to delineate extent" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Simple abscess — I&D + 7 d; Fournier — emergent surgery + 14–21 d + ICU; urology mandatory.",
    evidence: "Society consensus — drainage drives outcome; Fournier's gangrene is surgical emergency with mortality 20–40%; broad polymicrobial",
    branches: [
      { label: "Simple scrotal abscess (drained)", days: "7 d",
        detail: "Per cellulitis / purulent SSTI bands; cover MRSA per institutional prevalence",
        matchAgent: /cephalexin|cefazolin|trimethoprim-?sulfamethoxazole/i },
      { label: "Fournier's gangrene (necrotizing perineal)", days: "14–21 d + surgery",
        detail: "Pip-tazo + vancomycin + clindamycin; aggressive serial debridement; urology + GS + ICU",
        matchAgent: /piperacillin|meropenem/i },
      { label: "Epididymo-orchitis with abscess", days: "14 d + drainage",
        detail: "Per epididymo-orchitis bands + drainage; urology consult" },
      { label: "Immunocompromised / diabetic", days: "14 d + extended workup",
        detail: "Lower threshold to broad coverage + extended course; ID + urology" },
    ],
    stopWhen: [
      "Abscess drained + wound healing",
      "Surgical debridement complete (Fournier)",
      "Afebrile + clinical recovery",
      "Source / underlying anatomy addressed",
      "Pathogen-specific minimum duration met",
    ],
    extendIf: [
      { text: "**Fournier's** — extend per surgical adequacy + clinical course",
        matchCtx: { severe: true } },
      "Bacteremia — per source pathogen",
      "Inadequate debridement — re-explore + extend",
      "Diabetic / immunocompromised — extend per ID",
    ],
  },
  monitoring: {
    headline: "Urology consult; differentiate simple from Fournier; aggressive resuscitation + surgery for Fournier.",
    items: [
      { sev: "required", what: "**Urology consult** at presentation",
        why: "Source identification + drainage planning + long-term management" },
      { sev: "required", what: "**Differentiate simple from Fournier's gangrene**",
        why: "Fournier — severe pain out of proportion, crepitus, skin necrosis; surgical emergency" },
      { sev: "required", what: "**CT pelvis with contrast** if Fournier suspected",
        why: "Defines extent + gas + planning surgical approach" },
      { sev: "trigger", what: "**Emergent surgical debridement** for Fournier",
        why: "Mortality 20–40% — surgery within hours; serial re-look q24h" },
      { sev: "trigger", what: "**Cover MRSA + GNR + anaerobes** for Fournier",
        why: "Polymicrobial substrate; broad coverage + clindamycin for toxin suppression" },
      { sev: "trigger", what: "**Diabetic workup + management**",
        why: "Most common substrate for Fournier; glycemic control + ID coordination" },
      { sev: "trigger", what: "**Diverting colostomy** if perianal extension",
        why: "Source diversion accelerates healing in extensive Fournier with perineal involvement" },
      { sev: "consider", what: "**Reconstructive surgery** referral after debridement complete",
        why: "Multi-stage closure planning; flap or graft typical for extensive defects" },
    ],
  },
  rationale: {
    driver: "Scrotal abscess management splits on physical exam — Sorensen (J Urol 2009) + Eke (Br J Surg 2000) anchor the differentiation of simple drained abscess (I&D + 7-d course per cellulitis bands, MRSA coverage by local prevalence) from Fournier's necrotizing fasciitis, where severe pain out of proportion, crepitus, and skin necrosis demand emergent CT plus serial surgical debridement plus polymicrobial coverage (pip-tazo + vancomycin + clindamycin for toxin suppression). Mortality is 20–40% in Fournier and tracks time-to-OR, extent of disease, and diabetic substrate; serial re-look every 24 h and ICU resuscitation are non-negotiable. Diverting colostomy is considered when perineal involvement is extensive.",
    guideline: "stopit",
    rejected: "Antibiotic-only management of Fournier's gangrene was deliberately rejected — Sorensen + Eke show medical-only management has near-uniform failure, and the dominant outcome lever is emergent serial debridement within hours of recognition. Dropping clindamycin from Fournier coverage was tempered: WSES 2018 retains clindamycin specifically for toxin suppression (Streptococcus pyogenes + Clostridium) even when individual susceptibilities suggest β-lactam adequacy, because protein-synthesis inhibition is the mechanistic anchor for limiting tissue damage during the debridement window." },
  objections: [
    { q: "Why emergent surgery — broad antibiotics should control Fournier?",
      a: "Fournier's necrotizing fasciitis is a surgical-time-dependent disease — Sorensen J Urol 2009 [cite:ssti] and Eke Br J Surg 2000 show time-to-OR, extent of disease, and diabetic substrate predict mortality (20–40%). Medical-only management has near-uniform failure because antibiotics cannot penetrate necrotic tissue. WSES 2018 anchors serial debridement every 24 h until no further necrosis, with ICU resuscitation in parallel [cite:ssc]. Antibiotics are adjunctive, not curative." },
    { q: "Why add clindamycin if pip-tazo covers anaerobes?",
      a: "Clindamycin inhibits bacterial protein synthesis (including toxin production by Streptococcus pyogenes and Clostridium species) — the Eagle effect — even when individual susceptibilities suggest β-lactam adequacy per WSES 2018 [cite:ssti]. Toxin-driven tissue damage compounds the surgical extent; pip-tazo or carbapenem alone covers the organisms but not the toxin. Keep clindamycin in the bundle for the first 48–72 h until cultures clarify and toxin production subsides." },
    { q: "Why simple abscess gets only 7 d after I&D?",
      a: "Simple drained scrotal abscess follows cellulitis / purulent SSTI bands — Stevens IDSA 2014 [cite:ssti] anchors 5–7 d after adequate I&D, with MRSA coverage per local prevalence (TMP-SMX, doxycycline, or clindamycin). Source control (drainage) is the dominant intervention; extending antibiotics beyond 7 d drives resistance + CDI without benefit [cite:stew]. Reserve longer courses for inadequate drainage, deep extension, or diabetic / immunocompromised hosts." },
  ],
  research: {
    headline: "Mortality 20–40% in Fournier; emergent serial debridement; broad polymicrobial + clindamycin for toxin suppression.",
    trials: [
      { name: "Sorensen J Urol 2009",
        n: "Cohort review",
        question: "Modern Fournier's gangrene outcomes",
        finding: "Time-to-OR + extent of disease + diabetic substrate predict mortality; aggressive debridement essential",
        bias: "Single-center cohort; signal replicated" },
      { name: "Eke Br J Surg 2000",
        n: "Cohort review",
        question: "Fournier epidemiology + risk factors",
        finding: "Diabetes + chronic alcoholic + immunocompromise drive incidence; mortality 20–40%; rapid surgery + broad antibiotics drive outcomes",
        bias: "Pre-modern surgical era; principles hold" },
    ],
    guidelines: [
      { society: "WSES",
        year: 2018,
        topic: "Necrotizing soft tissue infections",
        keypoint: "Emergent serial debridement + broad antibiotics + clindamycin for toxin suppression; diabetic + urology consult" },
    ],
    openQuestions: [
      "Diverting colostomy thresholds — perineal involvement extent",
      "HBO benefit — observational support; never delay surgery",
      "Optimal antibiotic duration post-debridement — clinical + surgical-margin driven",
    ],
  },
};

export default { id: "scrotal-abscess", regimen, decision };
