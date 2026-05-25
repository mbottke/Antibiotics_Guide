/* ===========================================================
   INFECTIVE ENDOCARDITIS — IDSA / AHA 2015. Pathogen-driven
   4-6 wk IV; surgery for failure / complications. ================ */

const regimen = {
  "Native valve, empiric (acute)": [
    {
      rx: /vancomycin.*ceftriaxone|ceftriaxone.*vancomycin/i,
      pickIf: "Suspected acute native-valve IE before cultures result.",
      whyPick: [
        "**Vancomycin + ceftriaxone** — covers MRSA + most streptococci + HACEK",
        "Vancomycin: AUC 400–600 (load 25–30 mg/kg)",
        "**Get 3 sets of blood cultures** spaced ≥ 1 h apart BEFORE first dose if stable",
        "**TEE** within 24 h — sensitivity for vegetations > TTE",
      ],
      watchOut: [
        { sev: "warn", text: "Empiric broad therapy beyond 5–7 d → narrow on culture data" },
        { sev: "note", text: "Surgery consult early for large veg, abscess, heart failure, persistent bacteremia" },
      ],
    },
  ],
  "Prosthetic valve, empiric": [
    {
      rx: /vancomycin.*gentamicin.*cefepime/i,
      pickIf: "Suspected PVE — fever + prosthetic valve, any timeframe.",
      whyPick: [
        "**Triple coverage** — CoNS (vanco) + Pseudomonas (cefepime) + synergy (gent)",
        "**Add rifampin** once staph confirmed — biofilm penetration",
        "Surgery consult immediate — early-PVE = often needs replacement",
      ],
      watchOut: [
        { sev: "warn", text: "**Gentamicin** trough monitoring — limit to 2 weeks max" },
        { sev: "warn", text: "**Rifampin** — many interactions; never use until staph confirmed" },
        { sev: "warn", text: "Cefepime in CrCl < 60 — dose-reduce, watch neurotoxicity" },
      ],
    },
  ],
  "Viridans / S. gallolyticus (PCN-S)": [
    {
      rx: /penicillin|ceftriaxone/i,
      pickIf: "Viridans strep or S. gallolyticus bacteremia + IE, PCN-susceptible.",
      whyPick: [
        "**Penicillin G or ceftriaxone × 4 weeks** — IDSA standard",
        "**2-week regimen** with gentamicin for uncomplicated native-valve, low-risk patients",
        "**S. gallolyticus → colonoscopy** — 25–80% associated with colon cancer",
      ],
      watchOut: [
        { sev: "warn", text: "**Gentamicin synergy only** — 3 mg/kg/day once daily; limit 2 weeks" },
        { sev: "note", text: "Outpatient OPAT with ceftriaxone once stable" },
      ],
    },
  ],
  "Enterococcal": [
    {
      rx: /ampicillin.*ceftriaxone|ampicillin.*gentamicin/i,
      pickIf: "Enterococcal IE (E. faecalis amp-S preferred regimen).",
      whyPick: [
        "**Ampicillin + ceftriaxone** — preferred over amp+gent (Fernández-Hidalgo 2013)",
        "**Equivalent cure, far less nephrotoxicity** than amp+gent",
        "Treat **6 weeks** — endocarditis duration",
        "Use **amp+gent** if HLAR-negative AND ceftriaxone allergy",
      ],
      watchOut: [
        { sev: "stop", text: "**HLAR enterococcus** (high-level aminoglycoside resistance) → use amp+ceftriaxone, NOT amp+gent" },
        { sev: "warn", text: "**Gent nephro/oto** — avoid amp+gent if alternatives exist" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "4–6 wk IV pathogen-driven; surgery for HF / abscess / persistent BCx / large veg / embolic events.",
    evidence: "IDSA / AHA 2015 — pathogen-specific bands; multidisciplinary IE team drives surgical decisions",
    branches: [
      { label: "Viridans strep / S. gallolyticus (native)", days: "4 wk",
        detail: "Penicillin G or ceftriaxone × 4 wk; 2 wk + gent regimen for low-risk uncomplicated",
        matchAgent: /penicillin|ceftriaxone/i },
      { label: "Enterococcal native (amp+ceftriaxone)", days: "6 wk",
        detail: "Ampicillin + ceftriaxone (Fernández-Hidalgo 2013); HLAR-status drives regimen choice" },
      { label: "Staphylococcal native", days: "6 wk",
        detail: "MSSA: cefazolin/nafcillin; MRSA: vancomycin or daptomycin" },
      { label: "Prosthetic valve (PVE)", days: "≥ 6 wk + surgery often",
        detail: "Vancomycin + cefepime + rifampin × 6+ wk; surgery threshold lower",
        matchAgent: /rifampin/i },
      { label: "Culture-negative", days: "4–6 wk",
        detail: "Empiric vancomycin + ceftriaxone (or ampicillin-sulbactam); workup HACEK / Bartonella / Q fever" },
    ],
    stopWhen: [
      "Blood cultures cleared ≥ 48 h",
      "Clinical improvement (afebrile, peripheral signs receding)",
      "Echo shows stable or improved vegetation",
      "No new embolic events",
      "Renal / inflammatory markers normalizing",
      "Minimum 4–6 wk pathogen-specific duration completed",
    ],
    extendIf: [
      { text: "**Surgery needed** (HF, abscess, large veg, persistent BCx, embolic event) — extend post-op",
        matchCtx: { severe: true } },
      "Persistent bacteremia > 5 d on appropriate therapy",
      "Mycotic aneurysm complication",
      "PVE with abscess / dehiscence — surgery + extend",
      "Drug-resistant pathogen — ID-driven extension",
    ],
  },
  monitoring: {
    headline: "Multidisciplinary IE team; TEE early; daily BCx until cleared; embolic surveillance.",
    items: [
      { sev: "required", what: "**Multidisciplinary IE team** — ID, cardiology, cardiac surgery",
        why: "Society guideline-mandated; drives surgical timing + medical optimization" },
      { sev: "required", what: "**TEE at presentation** + repeat for changes",
        why: "Veg size, abscess, leaflet perforation drive surgical decisions" },
      { sev: "required", what: "**Daily blood cultures until clearance**",
        why: "Persistent bacteremia at 5 d triggers surgical consult + workup" },
      { sev: "required", what: "**Embolic surveillance** — neuro exam, splinter hemorrhages, Roth spots",
        why: "Embolic events change surgical timing + drive extra workup" },
      { sev: "trigger", what: "**Brain MRI** for new neuro symptoms — septic embolus / mycotic aneurysm",
        why: "Affects anticoagulation + surgical timing" },
      { sev: "trigger", what: "**Workup HACEK / Bartonella / Q fever** for culture-negative",
        why: "Specific organisms need specific drugs; serology + targeted PCR" },
      { sev: "trigger", what: "**Surgery within 1 week** for HF, large veg (> 10 mm + embolic), persistent BCx",
        why: "Class I indication per AHA 2015; delay worsens mortality",
        matchCtx: { severe: true } },
      { sev: "consider", what: "Dental + ENT workup for source",
        why: "Identify entry portal; address underlying source" },
    ],
  },
  rationale: {
    driver: "IE management hinges on pathogen + valve + complications — a multidisciplinary IE team (ID, cardiology, cardiac surgery) is guideline-mandated and reduces mortality from 27% → 13% (RHEA registry). Native viridans / S. gallolyticus: penicillin G or ceftriaxone × 4 wk. Native staph or enterococcus: 6 wk; PVE: ≥ 6 wk + rifampin for staphylococcal + gentamicin × 2 wk synergy. Early surgery for HF, abscess, large vegetation + embolus, or persistent BCx (Class I, AHA 2015 + ESC 2023) — delaying surgery worsens mortality.",
    guideline: "ie",
    rejected: "Adjunctive rifampin for native-valve staph IE was deliberately rejected — ARREST (Lancet 2018, n=770) showed no mortality benefit and increased AEs/drug interactions; rifampin retains its role only in PVE staph. Adjunctive routine aminoglycoside synergy for native-valve viridans IE was tempered: 2-wk PCN + gent regimen is restricted to strictly uncomplicated low-risk per Sexton 1998 — most patients get the standard 4-wk monotherapy without the renal/ototoxicity cost." },
  objections: [
    { q: "Why early surgery — antibiotics will sterilize the vegetation?",
      a: "EASE (NEJM 2012 Kang, n=76) showed early surgery in IE with large vegetations reduced the composite endpoint by 79% [cite:ease]. AHA 2015 + ESC 2023 [cite:ie] make early surgery Class I for heart failure, perivalvular abscess, persistent BCx > 5 d on appropriate therapy, large vegetations > 10 mm with embolic event, and dehiscence on PVE. Antibiotics alone cannot sterilize a paravalvular abscess or large vegetation; delaying surgery worsens mortality." },
    { q: "Why oral step-down — IE has always been 6 wk IV?",
      a: "POET (NEJM 2019 Iversen, n=400) [cite:poet] showed oral step-down non-inferior to continued IV in stabilized left-sided IE (composite primary endpoint, durable at extended follow-up). Select for: stable, susceptible organism, bioavailable oral regimen, structured ID-led follow-up, and ≥ 10 d initial IV stabilization. NOT for early-phase bacteremia, PVE without controlled course, or right-sided IE with unstable substrate. ESC 2023 [cite:ie] now formally endorses." },
    { q: "Why not add gentamicin synergy to PCN for viridans IE?",
      a: "Routine 2-wk PCN + gentamicin synergy for native-valve viridans IE is restricted to strictly uncomplicated, low-risk disease (no aortic root extension, no embolism, < 65 y, normal renal function) per Sexton 1998 + AHA 2015 [cite:ie]. Most patients receive standard 4-wk PCN monotherapy — the aminoglycoside synergy adds renal + ototoxicity without offsetting benefit at the population level. Reserve only when criteria met and short-course is goal." },
    { q: "Why rifampin for PVE but not native-valve staph?",
      a: "ARREST (Lancet 2018, n=770) [cite:arrest] showed adjunctive rifampin in native-valve SAB / IE had no mortality benefit and increased AEs (hepatitis, GI, CYP3A4 interactions). Rifampin retains its PVE role for biofilm penetration on prosthetic material — sterilizing biofilm-embedded staphylococci that vanco / β-lactam alone cannot reach per AHA 2015 [cite:ie]. Native-valve has no biofilm substrate; the cost-benefit flips." },
  ],
  research: {
    headline: "Early surgery improves outcomes in high-risk lesions; POET trial opened oral step-down door for stable patients.",
    trials: [
      { name: "EASE NEJM 2012 (Kang)",
        n: "76",
        question: "Early surgery vs conventional treatment in IE with large vegetations",
        finding: "Early surgery reduced composite endpoint by 79%; established surgical timing literature",
        bias: "Small + single-center Korean cohort; replicated by registries since" },
      { name: "POET NEJM 2019 (Iversen)",
        n: "400",
        question: "Oral step-down after initial IV in stable left-sided IE",
        finding: "Non-inferior to continued IV; reduced LOS by ~12 d; selected stable patients only",
        bias: "European cohort; strict eligibility (echo + BCx clearance + clinical stability before switch)" },
      { name: "ARREST Lancet 2018",
        n: "770 SAB",
        question: "Adjunctive rifampin in SAB (incl. IE subset)",
        finding: "No benefit, more harm — supports NOT adding rifampin to native-valve SAB-IE regimen",
        bias: "Excluded prosthetic device infection where rifampin retains role" },
      { name: "RHEA registry 2022",
        n: "4,000+",
        question: "Real-world outcomes with multidisciplinary endocarditis team approach",
        finding: "Endocarditis team reduced mortality 27% → 13% — strongest argument for centralized care",
        bias: "Observational; selection + center effects, but consistent across analyses" },
    ],
    guidelines: [
      { society: "AHA",
        year: 2015,
        topic: "Infective endocarditis (Baddour)",
        keypoint: "Defines vegetation + complication-driven surgical indications; emphasizes endocarditis team approach" },
      { society: "ESC",
        year: 2023,
        topic: "European IE guidance",
        keypoint: "Aligned with AHA + POET-supportive oral step-down for selected stable patients" },
      { society: "BSAC",
        year: 2023,
        topic: "British IE management",
        keypoint: "Endocarditis team mandatory; OPAT for stable continuation; surgery for AHA Class I indications" },
    ],
    openQuestions: [
      "Oral step-down generalizability outside POET selection — uptake variable",
      "Timing of surgery after septic embolism (stroke) — 7 d delay historical, smaller cohorts support earlier",
      "Daptomycin vs vancomycin for MRSA-IE — equivalent efficacy; daptomycin preferred for high-MIC vanco",
    ],
  },
};

export default { id: "ie", regimen, decision };
