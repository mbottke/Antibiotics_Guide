/* ===========================================================
   IE — Native valve (organism-specific). ========================== */

const regimen = {
  "MSSA": [
    {
      rx: /cefazolin|nafcillin|oxacillin/i,
      pickIf: "MSSA native-valve IE — 6-week course.",
      whyPick: [
        "**Cefazolin** preferred — equivalent efficacy, BID, lower toxicity than nafcillin",
        "**6 weeks IV** — non-negotiable for IE",
        "**No gentamicin** — adds toxicity without outcome benefit",
      ],
      watchOut: [
        { sev: "warn", text: "Nafcillin: AIN, neutropenia, hepatitis with long courses" },
        { sev: "note", text: "Surgery for: HF, abscess, persistent bacteremia, large veg, embolic events" },
      ],
    },
  ],
  "MRSA": [
    {
      rx: /vancomycin|daptomycin/i,
      pickIf: "MRSA native-valve IE — 6-week course.",
      whyPick: [
        "**Vancomycin or daptomycin** — equivalent efficacy in trials",
        "**Daptomycin 8–10 mg/kg** for IE — concentration-dependent killing",
        "Switch to dapto if vanco fails or MIC > 1.5",
        "Surgery indications same as MSSA — don't delay",
      ],
      watchOut: [
        { sev: "warn", text: "**Persistent MRSA bacteremia at 7 d** → salvage with dapto + ceftaroline" },
        { sev: "warn", text: "Dapto: CK weekly, never for pneumonia, eosinophilic PNA" },
      ],
    },
  ],
  "Enterococcal": [
    {
      rx: /ampicillin.*ceftriaxone/i,
      pickIf: "Enterococcal IE (E. faecalis) — preferred amp + ceftriaxone × 6 weeks.",
      whyPick: [
        "**Amp + ceftriaxone × 6 weeks** — preferred over amp + gentamicin (Fernández-Hidalgo 2013)",
        "**Equivalent cure** to amp + gent with **far less nephrotoxicity** — no AG monitoring burden",
        "Workup **HLAR status** at species ID — drives downstream regimen choice",
      ],
      watchOut: [
        { sev: "stop", text: "**HLAR isolates** — amp + ceftriaxone is REQUIRED (amp + gent ineffective)" },
        { sev: "warn", text: "**Amp + gent only** if HLAR-negative AND ceftriaxone allergy — limit gent to 4–6 weeks, monitor trough" },
      ],
    },
  ],
  "Viridans strep": [
    {
      rx: /penicillin|ceftriaxone/i,
      pickIf: "Viridans strep IE — PCN-susceptible.",
      whyPick: [
        "**Penicillin G or ceftriaxone × 4 weeks** for native valve",
        "**2-week regimen with gentamicin** for selected uncomplicated cases (low-risk patient, no embolic events)",
        "**Search for colonic source** if S. gallolyticus — colonoscopy mandatory (25–80% associated with colon cancer)",
      ],
      watchOut: [
        { sev: "warn", text: "**Tolerance / relative-resistance** (MIC 0.12–0.5) — extend regimen and re-test MIC; treat as Streptococcus with reduced PCN susceptibility" },
        { sev: "note", text: "Repeat blood cultures at 48 h — sterilization should be brisk; persistent BCx → escalate workup" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "4–6 wk pathogen-driven; viridans short course possible; surgical IE team essential.",
    evidence: "IDSA / AHA 2015 — native-valve durations + 2 wk gent synergy for selected viridans",
    branches: [
      { label: "Viridans / gallolyticus, PCN-sensitive", days: "4 wk",
        detail: "Penicillin G or ceftriaxone × 4 wk; 2 wk regimen with gent for uncomplicated low-risk" },
      { label: "Enterococcal (amp+ceftriaxone preferred)", days: "6 wk",
        detail: "HLAR-status check; amp + ceftriaxone replaces amp + gent for most" },
      { label: "MSSA", days: "6 wk",
        detail: "Cefazolin or nafcillin × 6 wk; surgery for complications" },
      { label: "MRSA", days: "6 wk",
        detail: "Vancomycin (AUC 400-600) or daptomycin 8–10 mg/kg × 6 wk" },
    ],
    stopWhen: [
      "Blood cultures cleared ≥ 48 h",
      "Echo stable / improving",
      "Clinical resolution",
      "No new embolic events / HF",
      "Minimum 4–6 wk completed",
    ],
    extendIf: [
      { text: "**Surgery needed** — extend post-op",
        matchCtx: { severe: true } },
      "Persistent bacteremia > 5 d",
      "Mycotic aneurysm complication",
      "Drug-resistant pathogen — ID-driven",
    ],
  },
  monitoring: {
    headline: "Multidisciplinary IE team; daily BCx; TEE; embolic surveillance.",
    items: [
      { sev: "required", what: "**IE team** (ID + cardiology + cardiac surgery)",
        why: "Mandated by AHA / IDSA guidelines" },
      { sev: "required", what: "**TEE within 24–48 h**",
        why: "Vegetation characterization + abscess assessment drives surgery decisions" },
      { sev: "required", what: "**Daily blood cultures until clearance**",
        why: "Persistent positivity at 5 d triggers surgical reconsideration" },
      { sev: "trigger", what: "**Brain MRI** for neurologic symptoms",
        why: "Septic embolism + mycotic aneurysm workup" },
      { sev: "trigger", what: "**Surgery within 1 wk** for HF, large vegetation + embolus, persistent BCx",
        why: "Mortality benefit with appropriately timed surgery",
        matchCtx: { severe: true } },
      { sev: "consider", what: "Dental + ENT workup for source",
        why: "Address entry portal" },
    ],
  },
  rationale: {
    driver: "Native-valve IE duration is organism-driven from the first negative blood culture, with an endocarditis team (ID + cardiology + cardiac surgery) mandated by AHA 2015 / ESC 2023 — coordinated care drops registry mortality from 27% → 13%. PCN-susceptible viridans / S. gallolyticus complete 4 wk of penicillin G or ceftriaxone; enterococcal disease prefers ampicillin + ceftriaxone × 6 wk (Fernandez-Hidalgo, CID 2013 — equivalent cure with substantially less nephrotoxicity than amp + gent); MSSA gets cefazolin or nafcillin × 6 wk; MRSA gets vancomycin (AUC 400–600) or daptomycin 8–10 mg/kg × 6 wk. Early surgery for HF, abscess, large vegetation + embolus, or persistent BCx is a Class I indication.",
    guideline: "ie",
    rejected: "Adjunctive rifampin for native-valve staphylococcal IE was deliberately rejected — ARREST (Lancet 2018, n=770) showed no mortality benefit and increased AEs / drug interactions; rifampin retains its role only in PVE staph where biofilm penetration matters. Routine 2-week aminoglycoside synergy for native-valve viridans IE was tempered: the short-course PCN + gent regimen is restricted to strictly uncomplicated low-risk per Sexton 1998 — most patients get standard 4-wk monotherapy without the renal / ototoxicity cost." },
  objections: [
    { q: "Why early surgery — antibiotics will sterilize the vegetation?",
      a: "EASE (NEJM 2012 Kang, n=76) [cite:ease] showed early surgery (< 48 h) in IE with large vegetations reduced the composite of in-hospital death + embolic events by 79% vs delayed; AHA 2015 + ESC 2023 [cite:ie] make early surgery Class I for heart failure, perivalvular abscess, persistent BCx > 5 d on appropriate therapy, or large vegetations > 10 mm with embolic event. Antibiotics cannot sterilize a paravalvular abscess or eradicate a large vegetation reliably; delay worsens mortality." },
    { q: "Why add rifampin for native-valve staph IE?",
      a: "We deliberately do NOT add rifampin to native-valve SAB or IE — ARREST (Lancet 2018, n=770) [cite:arrest] showed no mortality benefit and increased AEs (hepatitis, GI) plus major CYP3A4 interactions including warfarin INR collapse. Rifampin retains its role only in PVE staphylococcal disease where biofilm penetration on prosthetic material matters per AHA 2015 [cite:ie]. Adding it to native-valve disease exposes the patient to harm without offsetting benefit; the cost-benefit flips entirely between native and prosthetic substrate." },
    { q: "Why ampicillin + ceftriaxone — not the historic amp + gent?",
      a: "Fernandez-Hidalgo (CID 2013, n=246) [cite:ie] established ampicillin + ceftriaxone equivalent cure to amp + gent for E. faecalis IE with substantially less nephrotoxicity, and AHA 2015 endorses amp-CTX as preferred. The 2-wk gentamicin synergy that historically defined enterococcal IE drove AKI in a renal-fragile substrate; replacing the aminoglycoside with a second β-lactam keeps cure rates while removing the renal cost. HLAR status is irrelevant to amp-CTX — the regimen works regardless." },
    { q: "Why oral step-down — IE has always been 6 wk IV?",
      a: "POET (NEJM 2019 Iversen, n=400) [cite:poet] showed oral step-down non-inferior to continued IV in stabilized left-sided IE on the composite primary endpoint, durable at extended follow-up. Select for: stable course, susceptible organism, bioavailable oral regimen, structured ID-led follow-up, and ≥ 10 d initial IV stabilization. NOT for early-phase bacteremia, ongoing surgical decision, or right-sided IE with unstable substrate. ESC 2023 [cite:ie] now formally endorses; the OPAT alternative is well-validated for the back half." },
  ],
  research: {
    headline: "AHA 2015 + ESC 2023 align on pathogen-driven 4–6 wk; viridans short course (2 wk + gent) for selected low-risk.",
    trials: [
      { name: "Sexton CID 1998",
        n: "75",
        question: "2 wk PCN + gent vs 4 wk PCN alone for uncomplicated viridans IE",
        finding: "2 wk combination cure rate equivalent; supports short course for low-risk viridans subset",
        bias: "Strict eligibility (PCN-susceptible + non-complicated + early presentation)" },
      { name: "Wilson AAC 1984 / Habib EHJ 2015",
        n: "Cohort / guidance",
        question: "Native-valve organism-specific duration",
        finding: "4 wk for PCN-susceptible strep; 6 wk for enterococcus + S. aureus; foundation of modern dosing",
        bias: "Pre-MRSA era for some; updated by AHA 2015 + ESC 2023" },
      { name: "AHA Registry / EuRO-ENDO 2019",
        n: "3,500+",
        question: "Surgical timing in complicated IE",
        finding: "Early surgery (< 7 d) for HF, large veg, persistent BCx improves outcomes; replicated across registries",
        bias: "Observational; treatment-by-indication confounding" },
    ],
    guidelines: [
      { society: "AHA",
        year: 2015,
        topic: "Infective endocarditis (Baddour) — native valve",
        keypoint: "Pathogen-driven 4–6 wk; viridans short course (2 wk + gent) for low-risk; early surgery for HF / large veg" },
      { society: "ESC",
        year: 2023,
        topic: "European IE management (Habib update)",
        keypoint: "Aligned with AHA; endocarditis team mandatory; OPAT for stable continuation" },
    ],
    openQuestions: [
      "Optimal duration for HACEK + culture-negative IE — extrapolated from cohort data",
      "Daptomycin vs vancomycin for MRSA native-valve IE — equivalent but daptomycin preferred for MIC > 1",
      "Bacteriostatic + cidal combinations for enterococcus — ampicillin + ceftriaxone validated (Fernandez-Hidalgo 2013)",
    ],
  },
};

export default { id: "ie-native", regimen, decision };
