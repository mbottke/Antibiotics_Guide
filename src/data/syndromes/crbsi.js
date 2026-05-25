/* ===========================================================
   CRBSI — Catheter-related bloodstream infection. ============== */

const regimen = {
  "Empiric": [
    {
      rx: /vancomycin/i,
      pickIf: "Suspected line infection — fever + line, no other source.",
      whyPick: [
        "**Vancomycin** covers MRSA + CoNS (most common organisms)",
        "Add antipseudomonal β-lactam if **neutropenic, ICU, or HD line**",
        "**Pull the line** for S. aureus, Pseudomonas, Candida, or persistent bacteremia",
      ],
      watchOut: [
        { sev: "stop", text: "**S. aureus / Pseudomonas / Candida** — line MUST come out, no salvage" },
        { sev: "warn", text: "Differential time-to-positivity > 2 h between line and peripheral cultures = line source" },
        { sev: "note", text: "Catheter-tip culture only useful with concurrent peripheral culture" },
      ],
    },
  ],
  "Directed": [
    {
      rx: /tailor|directed|organism/i,
      pickIf: "Organism identified — narrow + decide on line.",
      whyPick: [
        "**Narrow to organism** + susceptibilities",
        "**Salvage attempt** (lock therapy) only for CoNS / GNR with intact line + no shock",
        "S. aureus: 14 d minimum from first negative culture; longer if endocarditis ruled in",
      ],
      watchOut: [
        { sev: "warn", text: "Persistent bacteremia 72 h post-line removal → endovascular workup (TEE)" },
        { sev: "note", text: "Echo for S. aureus bacteremia is standard of care" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Pathogen-driven 7-14 d for short-term lines (S. aureus 14 d min, CoNS 7 d); line out for severe.",
    evidence: "IDSA 2009 — pathogen-specific bands + line management decision algorithm",
    branches: [
      { label: "CoNS, line removed", days: "7 d",
        detail: "Short course post-line-removal; longer if persistent positivity",
        matchAgent: /vancomycin/i },
      { label: "S. aureus, line removed", days: "14 d minimum",
        detail: "TEE + endocarditis workup; from first negative BCx" },
      { label: "Gram-negative", days: "7–14 d",
        detail: "Per organism + susceptibilities; line removal for persistence" },
      { label: "Candidemia", days: "14 d post-clearance",
        detail: "Echinocandin → fluconazole step-down; ophthal exam mandatory",
        matchAgent: /echinocandin|caspofungin|micafungin|anidulafungin|fluconazole/i },
      { label: "Line retained (lock therapy)", days: "10–14 d + lock",
        detail: "Salvage only for CoNS + stable patient + no shock; lock + systemic" },
    ],
    stopWhen: [
      "Line removed or sterilized via lock therapy",
      "Blood cultures cleared ≥ 48 h",
      "Afebrile ≥ 48 h",
      "No metastatic foci",
      "Endocarditis workup negative if S. aureus",
      "Minimum pathogen-specific duration completed",
    ],
    extendIf: [
      { text: "**S. aureus + endocarditis** — extend per IE bands",
        matchCtx: { mrsaRisk: true } },
      "Persistent bacteremia > 72 h post-line removal",
      "Endovascular complication (septic thrombus, mycotic aneurysm)",
      { text: "**Pseudomonas / Candida / persistent BCx** — line MUST come out",
        matchCtx: { severe: true } },
    ],
  },
  monitoring: {
    headline: "Pull the line for severe organisms; TEE for S. aureus; ophth for candida; repeat BCx.",
    items: [
      { sev: "required", what: "**Remove the line** for S. aureus / Pseudomonas / Candida / persistent BCx",
        why: "No salvage attempt for these; biofilm + virulence drive failure" },
      { sev: "required", what: "**Differential time-to-positivity** (line vs peripheral cultures)",
        why: "> 2 h difference favors line source; documents diagnosis" },
      { sev: "required", what: "**TEE for S. aureus bacteremia**",
        why: "Endocarditis in 15–25%; changes duration to 4–6 wk" },
      { sev: "required", what: "**Ophthalmology consult for candidemia**",
        why: "Endogenous endophthalmitis in ~5–15%; vision-threatening if missed",
        matchBranch: ["Candidemia"] },
      { sev: "trigger", what: "**Repeat blood cultures at 48 h**",
        why: "Persistent positivity triggers line removal + endocarditis workup" },
      { sev: "trigger", what: "**ID consult for persistent / complicated bacteremia**",
        why: "Mortality benefit; complex cases require specialty input" },
      { sev: "consider", what: "**Lock therapy attempt** only for CoNS + stable + lock-amenable",
        why: "Limited indication; failure rate substantial",
        matchBranch: ["Line retained (lock therapy)"] },
    ],
  },
  rationale: {
    driver: "CRBSI is fundamentally a hardware-removal problem — biofilm on the catheter renders systemic-only therapy inadequate, and line removal is mandatory for S. aureus, Pseudomonas, Candida, and any persistent bacteremia (Mermel / IDSA 2009). Duration runs from the first negative culture after line removal and is pathogen-specific: uncomplicated CoNS 5–7 d, S. aureus 14 d minimum with TEE workup (15–25% endocarditis risk), Candida 14 d after clearance with mandatory dilated fundoscopy, and GNR 7 d under BALANCE bands. Differential time-to-positivity > 2 h between line and peripheral cultures favors line source — useful when both stay in.",
    guideline: "crbsi_g",
    rejected: "Antibiotic lock therapy as a salvage strategy was deliberately tempered — Raad (CID 2013) showed ~70% salvage for CoNS but substantially lower for S. aureus and Pseudomonas, and IDSA 2009 reserves lock therapy for CoNS + clinically stable + long-term-line-essential patients. Routine empiric continuation of broad coverage past 48 h was rejected: pathogen identification + speciation drive narrowing to a single targeted agent, and persistent broad coverage drives AKI + C. difficile + resistance without clinical benefit." },
  objections: [
    { q: "Why pull the line — can we trial lock therapy first?",
      a: "Line removal is mandatory for S. aureus, Pseudomonas, Candida, and any persistent bacteremia per IDSA / Mermel 2009 [cite:crbsi_g] — biofilm + virulence drive systemic-only failure, and salvage attempts in this substrate predict relapse + metastatic seeding. Lock therapy retains a narrow role for CoNS + clinically stable + long-term-line-essential patients (Raad CID 2013 — ~70% salvage for CoNS only). The decision is pathogen-specific, not patient-preference; the line stays in only when the organism allows." },
    { q: "Why TEE if S. aureus — TTE was already negative?",
      a: "S. aureus bacteremia carries 15–25% endocarditis risk even from a line source, and TTE has only ~70% sensitivity for vegetations — TEE is mandated for any line-related SAB per IDSA 2009 [cite:crbsi_g] and IDSA / AHA IE guidance [cite:ie]. Missed IE here means a 14-d course where 4–6 wk + surgery were needed; the missed-IE relapse mortality is 30–50%. The TEE cost is trivial relative to the consequences of stopping at the 14-d floor in an undiagnosed endovascular focus." },
    { q: "Why 14 d minimum for S. aureus — line is out, BCx cleared?",
      a: "The 14-d floor for S. aureus bacteremia runs from the FIRST negative blood culture post-line-removal, not from day of presentation — Fowler (CID 2003) and IDSA 2011 [cite:crbsi_g] establish that endovascular seeding occurs even in apparently uncomplicated line-source SAB, and shorter courses double relapse + metastatic seeding rates. SABATO (2023) opened oral step-down for the back half but kept the 14-d floor intact. Walk the 14 d; reserve any shortening for ID-driven specific scenarios." },
    { q: "Why ophthalmology consult for candidemia — vision intact?",
      a: "Endogenous endophthalmitis complicates ~5–15% of candidemia and is vision-threatening if missed — Pappas / IDSA candidiasis guidance and Mermel 2009 [cite:crbsi_g] mandate dilated fundoscopy in every candidemic patient regardless of visual symptoms. Treatment changes from systemic-only to intravitreal + extended systemic when found, and progression to chorioretinitis is rapid. The cost of a fundoscopy exam is trivial relative to permanent vision loss; this is one of the highest-yield routine consults in CRBSI." },
  ],
  research: {
    headline: "Line removal drives outcome; pathogen-specific duration (S. aureus 14 d min, CoNS 7 d); echo for S. aureus.",
    trials: [
      { name: "Mermel IDSA 2009",
        n: "Guideline",
        question: "Catheter-related bloodstream infection management algorithm",
        finding: "Line removal mandatory for S. aureus / Candida / persistent bacteremia; lock therapy limited indication for CoNS + retained line",
        bias: "Guideline synthesis" },
      { name: "Raad CID 2013",
        n: "Cohort",
        question: "Antibiotic lock therapy in long-term lines",
        finding: "Lock therapy + systemic antibiotics ~70% salvage rate for CoNS; lower for S. aureus + Pseudomonas",
        bias: "Observational; selection by line type + organism" },
      { name: "Fowler CID 2003",
        n: "Cohort",
        question: "Duration of S. aureus bacteremia therapy from line source",
        finding: "Minimum 14 d after line removal + cultures clear; longer if endovascular focus identified",
        bias: "Observational; informs IDSA / Liu" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2009,
        topic: "Catheter-related bloodstream infection (Mermel)",
        keypoint: "Line removal for severe + S. aureus + Candida + persistent; pathogen-specific duration after clearance" },
      { society: "ESCMID",
        year: 2024,
        topic: "Vascular catheter infection",
        keypoint: "Aligned with IDSA; emphasizes early line removal + targeted antibiotic" },
    ],
    openQuestions: [
      "Tunneled-line salvage vs removal in cancer patients — case-by-case",
      "Optimal lock-therapy duration — 2 wk typical but variable evidence",
      "Time-to-positivity differential for line vs peripheral cultures — useful but not definitive",
    ],
  },
};

export default { id: "crbsi", regimen, decision };
