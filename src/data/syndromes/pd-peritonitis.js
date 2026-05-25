/* ===========================================================
   PD-PERITONITIS — peritoneal dialysis catheter peritonitis;
   ISPD 2022 guidelines — intraperitoneal antibiotics; catheter
   removal for refractory. =================================== */

const regimen = {
  "Empiric (intraperitoneal)": [
    {
      rx: /intraperitoneal|vancomycin.*ceftazidime/i,
      pickIf: "PD patient with cloudy fluid + PMN > 100 in PD effluent.",
      whyPick: [
        "**Intraperitoneal vancomycin + ceftazidime** — ISPD 2022",
        "Add aminoglycoside (gentamicin IP) if cefepime/ceftaz unavailable",
        "**Continuous vs intermittent IP dosing** — both effective; intermittent simpler",
        "**Remove catheter** if not improving by day 5 or for fungal / refractory peritonitis",
      ],
      watchOut: [
        { sev: "warn", text: "**Fungal peritonitis** → remove catheter immediately + antifungal" },
        { sev: "note", text: "Send fluid for cell count, Gram stain, culture — 90% sensitive at higher volume" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Intraperitoneal antibiotics 14–21 d per pathogen; catheter removal for refractory / relapsing.",
    evidence: "ISPD 2022 — IP antibiotics first-line; effluent cell count + culture drive diagnosis; catheter removal at day 5 if non-response",
    branches: [
      { label: "Gram-positive (S. aureus, CoNS, Strep)", days: "14 d IP",
        detail: "IP cefazolin or vancomycin per local resistance; convert to IV if bacteremic",
        matchAgent: /cefazolin|vancomycin/i },
      { label: "Gram-negative (E. coli, Klebsiella, Pseudomonas)", days: "14–21 d IP",
        detail: "IP ceftazidime or aminoglycoside + cefazolin combination; per sensitivity",
        matchAgent: /ceftazidime|gentamicin/i },
      { label: "Polymicrobial / enteric source (perforation)", days: "21 d + surgical workup",
        detail: "Broad IP + IV + surgical evaluation for bowel perforation source",
        matchAgent: /piperacillin|meropenem|metronidazole/i },
      { label: "Fungal (Candida, mold)", days: "Catheter removal",
        detail: "Catheter MUST be removed; antifungal × 2–3 wk after; rarely safe to retain",
        matchAgent: /caspofungin|fluconazole|amphotericin/i },
      { label: "Refractory (≥ 5 d non-response)", days: "Catheter removal",
        detail: "Catheter removal + transition to HD + targeted antibiotic per pathogen; biofilm + tunnel infection" },
    ],
    stopWhen: [
      "Effluent cell count < 100/μL with < 50% PMN",
      "Cultures cleared",
      "Afebrile + clinical recovery",
      "Catheter retained or removed per protocol",
      "Pathogen-specific minimum duration met",
    ],
    extendIf: [
      { text: "**Refractory or relapsing** — catheter removal + extend",
        matchCtx: { severe: true } },
      "Tunnel or exit-site infection — extend + surgical",
      "Fungal pathogen — catheter removal + antifungal",
      "Polymicrobial / enteric source — workup perforation",
    ],
  },
  monitoring: {
    headline: "Effluent cell count + culture at presentation; IP antibiotics first-line; remove for fungal or refractory.",
    items: [
      { sev: "required", what: "**Effluent cell count + culture + Gram stain** at presentation",
        why: "Diagnostic — cell count > 100/μL + PMN > 50% = peritonitis; culture drives narrowing" },
      { sev: "required", what: "**IP antibiotics first-line** per ISPD",
        why: "Achieves higher local concentrations than IV; standard of care; bag-based dosing" },
      { sev: "required", what: "**Nephrology + PD nurse coordination**",
        why: "Dosing complex; PD prescription adjustment during treatment; outpatient transition" },
      { sev: "trigger", what: "**Catheter removal mandatory for fungal**",
        why: "Biofilm + recurrence; rare safe retention; transition to HD" },
      { sev: "trigger", what: "**Catheter removal at day 5 if non-response**",
        why: "Refractory disease drives biofilm + tunnel infection; transition to HD" },
      { sev: "trigger", what: "**Workup tunnel / exit-site infection** if recurrent",
        why: "Underlying tunnel infection drives recurrent peritonitis; surgical revision" },
      { sev: "trigger", what: "**Surgical evaluation for bowel perforation** if polymicrobial / enteric",
        why: "Enteric source drives perforation workup; CT + surgical consult" },
      { sev: "consider", what: "**Patient PD technique review** post-recovery",
        why: "Touch contamination most common source; education reduces recurrence" },
    ],
  },
  rationale: {
    driver: "PD peritonitis diagnosis hinges on effluent cell count + culture + Gram stain (cell count > 100/μL with > 50% PMN is diagnostic) — intraperitoneal antibiotics achieve higher local concentrations than IV and are first-line per ISPD 2022. Empirics cover gram-positive + gram-negative substrate: IP cefazolin or vancomycin (per local resistance) + IP ceftazidime or aminoglycoside, then narrow on culture. Standard 14-d (gram-positive) or 14–21 d (gram-negative) duration tracks source — and the catheter is the source. Mandatory triggers for catheter removal: any fungal isolate, refractory disease at day 5, recurrent peritonitis with tunnel involvement, or enteric polymicrobial flora suggesting perforation.",
    guideline: "stopit",
    rejected: "Reflexive IV-only therapy was deliberately rejected — ISPD 2022 establishes IP delivery as first-line because the catheter is a peritoneal-cavity device and IP dosing achieves the requisite local concentrations without systemic toxicity. Catheter retention in fungal peritonitis was rejected outright: biofilm prevents sterilization, recurrence is near-universal, and the catheter must come out with transition to HD. Routine carbapenem empiric coverage was tempered to enteric polymicrobial or known MDR cases only." },
  objections: [
    { q: "Why IP antibiotics — IV is easier and adequate?",
      a: "ISPD 2022 (Li update) establishes IP antibiotics first-line because the catheter IS a peritoneal-cavity device — IP dosing achieves substantially higher local concentrations than IV without systemic toxicity, and the route matches the infection compartment. Reflexive IV-only therapy was deliberately rejected by ISPD; IV is reserved for systemic sepsis or bacteremic substrate. IP cefazolin + ceftazidime (or vancomycin + aminoglycoside per local antibiogram) is the standard backbone, dosed per bag with nephrology + PD-nurse coordination [cite:stopit]." },
    { q: "Why catheter removal for fungal — biofilm can be suppressed?",
      a: "Fungal PD peritonitis mandates catheter removal — biofilm prevents sterilization and recurrence is near-universal with retention per ISPD 2022 + Boudville (Kidney Int 2012). Transition to HD is non-negotiable; the catheter cannot be salvaged. This is the cleanest source-control mandate in PD peritonitis [cite:stopit]. The same logic applies to refractory bacterial peritonitis at day 5 (non-response) — biofilm + tunnel involvement drives recurrence, and the catheter must come out." },
    { q: "Why 14–21 d — peritonitis duration in cirrhosis is 5 d?",
      a: "PD peritonitis duration is longer than SBP because the catheter substrate harbors biofilm flora that requires extended therapy to suppress + clear — ISPD 2022 mandates 14 d for gram-positive (S. aureus, CoNS, Strep), 14–21 d for gram-negative (E. coli, Klebsiella, Pseudomonas), and surgical workup for polymicrobial / enteric flora suggesting perforation. The duration tracks the source (the catheter), not just the bacteremic milieu [cite:stopit]. Effluent cell count > 100/μL + PMN > 50% drives ongoing-infection assessment." },
    { q: "Why not routine carbapenem empiric — covers everything?",
      a: "Routine empiric carbapenem in PD peritonitis was tempered to enteric polymicrobial source (suggesting perforation), known MDR colonization, or recent broad-antibiotic exposure — community PD peritonitis is touch-contamination skin flora (S. aureus, CoNS, Strep) + occasional GNR, where IP cefazolin + ceftazidime covers > 90% of isolates [cite:stopit]. Reflexive carbapenem drives collateral resistance + replaces a narrow IP backbone without changing outcomes. Reserve for documented MDR or polymicrobial enteric." },
  ],
  research: {
    headline: "ISPD 2022 — IP antibiotics first-line; catheter removal mandatory for fungal + refractory at day 5; effluent cell count drives diagnosis.",
    trials: [
      { name: "Li ISPD 2022 (Update)",
        n: "Guideline",
        question: "Modern PD peritonitis management",
        finding: "IP antibiotics first-line; cell count > 100/μL + PMN > 50% diagnostic; catheter removal at day 5 if non-response",
        bias: "International consensus" },
      { name: "Boudville Kidney Int 2012",
        n: "Cohort",
        question: "PD peritonitis outcomes by pathogen",
        finding: "Fungal → catheter must be removed; CoNS / S. aureus / GNR each have distinct outcomes; tunnel infection drives recurrence",
        bias: "Multi-center observational" },
    ],
    guidelines: [
      { society: "ISPD",
        year: 2022,
        topic: "International PD peritonitis (Li update)",
        keypoint: "IP first-line; pathogen-specific 14–21 d; catheter removal for fungal or refractory; patient PD technique review" },
    ],
    openQuestions: [
      "Optimal IP dosing schedule — bag-based; nephrology + PD-nurse coordination",
      "Tunnel infection surgical revision timing — case-by-case",
      "Probiotics for prevention — limited evidence",
    ],
  },
};

export default { id: "pd-peritonitis", regimen, decision };
