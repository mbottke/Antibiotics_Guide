/* ===========================================================
   INFECTED PRESSURE INJURY — staging-driven; debridement +
   offloading; antibiotics only for cellulitis / sepsis. ====== */

const regimen = {
  "Empiric (systemic infection)": [
    {
      rx: /piperacillin|vancomycin/i,
      pickIf: "Infected pressure injury with systemic signs (cellulitis spread, fever, sepsis).",
      whyPick: [
        "**Pip-tazo ± vancomycin** — covers polymicrobial flora + MRSA",
        "**Debridement** drives outcomes — surface swabs are colonization, not infection",
        "**Deep tissue cultures** if osteo suspected",
        "Pressure relief + nutrition are non-antibiotic essentials",
      ],
      watchOut: [
        { sev: "warn", text: "**Surface swabs unhelpful** — always colonized" },
        { sev: "warn", text: "Underlying osteomyelitis common in stage 4 — bone biopsy if extended course planned" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Antibiotics ONLY for cellulitis / bacteremia / osteo; debridement + offloading drive cure.",
    evidence: "NPUAP + IDSA — surface colonization is universal in stage 3/4; antibiotics for invasive infection only",
    branches: [
      { label: "Colonization without cellulitis (stage 3/4 ulcer)", days: "0 d",
        detail: "Antibiotics NOT indicated; topical care, debridement, offloading; bacterial growth on swab is colonization" },
      { label: "Surrounding cellulitis, no systemic signs", days: "7 d",
        detail: "Per cellulitis bands; cefazolin / vancomycin per MRSA risk; debridement + offloading core" },
      { label: "Sepsis from pressure injury source", days: "7–14 d",
        detail: "Broad coverage — MRSA + GNR + anaerobes; per culture; ID consult" },
      { label: "Underlying osteomyelitis confirmed (MRI / bone bx)", days: "Per osteo bands",
        detail: "Per chronic osteo bands — 4–6 wk IV / oral with bioavailability; debridement of dead bone",
        matchAgent: /vancomycin|ceftriaxone|cefepime|piperacillin/i },
    ],
    stopWhen: [
      "Cellulitis resolved + systemic signs cleared",
      "Wound debrided + offloading in place",
      "Source addressed — pressure relief, nutrition, moisture control",
      "Course completed for invasive infection (if any)",
      "No bacteremia or osteo on workup",
    ],
    extendIf: [
      { text: "**Osteomyelitis** confirmed — extend per osteo bands",
        matchCtx: { severe: true } },
      "Bacteremia confirmed — extend per source pathogen",
      "Sepsis trajectory — per sepsis bands",
      "Inadequate debridement — surgical revision",
    ],
  },
  monitoring: {
    headline: "Antibiotic stewardship — colonization ≠ infection; debridement + offloading + nutrition; MRI for osteo.",
    items: [
      { sev: "required", what: "**Stewardship** — surface swab growth alone is NOT an indication to treat",
        why: "Stage 3/4 ulcers universally colonized; antibiotics drive resistance without benefit absent invasive signs" },
      { sev: "required", what: "**Pressure relief / offloading** + air-loss surface",
        why: "Without offloading, no antibiotic course succeeds; specialty bed + repositioning q2h" },
      { sev: "required", what: "**Wound care + sharp debridement** for slough / necrotic tissue",
        why: "Debridement is the primary intervention; surgical / enzymatic / mechanical" },
      { sev: "trigger", what: "**Deep tissue / bone culture** if osteo suspected (probe-to-bone, exposed bone)",
        why: "Surface swab misleading; deep culture drives pathogen-directed therapy" },
      { sev: "trigger", what: "**MRI** if osteomyelitis suspected",
        why: "Gold standard for osteo diagnosis + planning surgical extent" },
      { sev: "trigger", what: "**Nutrition consult + protein supplementation**",
        why: "Wound healing is protein-dependent; albumin / pre-albumin drive outcomes" },
      { sev: "trigger", what: "**Wound clinic / wound nurse referral**",
        why: "Specialized care drives healing + outpatient follow-up planning" },
      { sev: "consider", what: "**Negative-pressure wound therapy** for stage 3/4 cavities",
        why: "Accelerates granulation; complement to debridement + offloading" },
    ],
  },
  rationale: {
    driver: "Pressure injuries colonize universally — surface swab growth alone is NOT an indication to treat (NPUAP / IDSA 2019). Antibiotics are reserved for invasive infection: surrounding cellulitis, sepsis from the ulcer source, or underlying osteomyelitis on probe-to-bone / MRI. When indicated, empirics cover MRSA + GNR + anaerobes; pathogen-directed therapy follows deep tissue or bone culture, not surface swab. Cure is driven by debridement + offloading + nutrition support — without these, no antibiotic course succeeds, and the wound returns the moment pressure resumes.",
    guideline: "ssti",
    rejected: "Treating positive surface swabs without invasive signs was deliberately rejected — colonization is universal in stage 3/4 ulcers, and antibiotics for colonization alone drive resistance + C. difficile without benefit. Empiric antibiotic courses in lieu of offloading and debridement were tempered: NPUAP / IDSA frame these as the primary intervention, and antibiotics without pressure relief amount to selection pressure on a non-healing wound. Reflexive surface-culture-directed narrow therapy was rejected — deep tissue or bone culture is required to drive pathogen-specific decisions." },
  objections: [
    { q: "Why no antibiotics for a colonized pressure ulcer?",
      a: "All chronic wounds are colonized; positive surface swabs reflect biofilm, not infection. Treat only with cellulitis, systemic signs, or deep extension (osteomyelitis). Antibiotics for colonization drive resistance and C. difficile without improving healing. Local wound care, offloading, and debridement are the interventions that matter [cite:stew]." },
    { q: "Why not just culture and treat what grows?",
      a: "Surface swabs grow normal skin and colonizing flora; deep tissue biopsy after debridement is the meaningful sample. Treating swab organisms leads to overtreatment and missed pathogens. Reserve cultures for clinically infected wounds and obtain them appropriately — deep tissue or bone, not surface [cite:ssti]." },
    { q: "Why is offloading more important than antibiotics?",
      a: "Pressure ulcers result from sustained tissue ischemia; without pressure relief, no antibiotic course will heal them. Offloading, nutrition, moisture control, and debridement address the cause. Antibiotics are adjunctive for documented infection only, not a substitute for the wound care bundle [cite:mono]." },
  ],
  research: {
    headline: "Colonization is universal in stage 3/4 ulcers; antibiotics for invasive infection only; offloading + nutrition drive cure.",
    trials: [
      { name: "Lyder Adv Wound Care 1996",
        n: "Cohort",
        question: "Modern pressure injury management",
        finding: "Surface swab is colonization; antibiotics for cellulitis/sepsis/osteo only; offloading + nutrition + debridement primary",
        bias: "Pre-modern offloading; principle holds" },
    ],
    guidelines: [
      { society: "NPUAP / IDSA",
        year: 2019,
        topic: "Pressure injury management",
        keypoint: "Antibiotics ONLY for invasive infection; debridement + offloading + nutrition" },
    ],
    openQuestions: [
      "Deep tissue culture for osteo workup — probe-to-bone + MRI",
      "NPWT timing — stage 3/4 cavities increasingly standard",
    ],
  },
};

export default { id: "pressure", regimen, decision };
