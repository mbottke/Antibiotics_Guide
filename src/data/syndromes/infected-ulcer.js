/* ===========================================================
   INFECTED VENOUS / ARTERIAL LEG ULCER — colonization vs
   infection distinction; address substrate disease. ========== */

const regimen = {
  "Infected (systemic or local signs)": [
    {
      rx: /cephalexin|doxycycline|TMP-?SMX/i,
      pickIf: "Ulcer with cellulitis or systemic signs — covers strep + MSSA.",
      whyPick: [
        "**Cephalexin** for strep + MSSA cover",
        "**Doxycycline or TMP-SMX** if MRSA risk",
        "**Wound care + offloading + vascular assessment** drive outcomes — antibiotics adjunctive",
        "Broaden for deep / limb-threatening infection (**pip-tazo + vanco**)",
      ],
      watchOut: [
        { sev: "warn", text: "**Treat infection, not colonization** — surface swabs are always positive in chronic ulcers; culture only deep tissue and only if clinical signs of infection" },
        { sev: "warn", text: "**Probe-to-bone positive** → osteomyelitis; get bone biopsy + extend course to 4–6 wk" },
        { sev: "note", text: "Charcot foot, ischemia, immunocompromise change presentation — keep low threshold for advanced imaging (MRI) + multidisciplinary consult" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Antibiotics ONLY for cellulitis / bacteremia / osteo; compression + wound care drive cure.",
    evidence: "Wound society + IDSA — colonization is universal in chronic ulcers; antibiotics for invasive infection only",
    branches: [
      { label: "Colonization without cellulitis", days: "0 d",
        detail: "Antibiotics NOT indicated; topical wound care, compression (venous), revascularization (arterial)" },
      { label: "Surrounding cellulitis, no systemic signs", days: "7 d",
        detail: "Per cellulitis bands; cefazolin / cephalexin; vanco for MRSA risk",
        matchAgent: /cefazolin|cephalexin/i },
      { label: "Sepsis from ulcer source", days: "7–14 d",
        detail: "Broad — MRSA + GNR + anaerobes — narrow on cultures; ID consult" },
      { label: "Underlying osteomyelitis (probe-to-bone, MRI)", days: "Per osteo bands",
        detail: "Per chronic osteo bands; debridement + 4–6 wk pathogen-directed" },
      { label: "Diabetic foot ulcer (refer to diabetic-foot syndrome)", days: "Per diabetic-foot bands",
        detail: "Distinct algorithm — see diabetic-foot syndrome" },
    ],
    stopWhen: [
      "Cellulitis resolved + systemic signs cleared",
      "Wound bed clean + granulating",
      "Substrate addressed — compression (venous) or revascularization (arterial)",
      "Course completed for invasive infection (if any)",
      "No osteo or bacteremia on workup",
    ],
    extendIf: [
      { text: "**Osteomyelitis** confirmed — extend per osteo bands",
        matchCtx: { severe: true } },
      "Bacteremia confirmed — per source pathogen",
      "Inadequate vascular supply — revascularization + extend",
      "Recurrent infection — workup arterial / venous insufficiency",
    ],
  },
  monitoring: {
    headline: "Stewardship — colonization ≠ infection; compression + revascularization core; rule out osteo.",
    items: [
      { sev: "required", what: "**Stewardship** — surface swab growth alone is NOT an indication to treat",
        why: "Chronic ulcers universally colonized; antibiotics drive resistance without benefit absent invasive signs" },
      { sev: "required", what: "**Compression therapy** for venous ulcers — 30–40 mmHg",
        why: "Single highest-impact intervention; healing-rate driver" },
      { sev: "required", what: "**Vascular assessment + ABI** for arterial ulcers",
        why: "Arterial insufficiency requires revascularization; healing impossible without flow" },
      { sev: "trigger", what: "**Deep tissue / bone culture** if osteo suspected (probe-to-bone, exposed bone)",
        why: "Surface swab misleading; deep culture drives pathogen-directed therapy" },
      { sev: "trigger", what: "**MRI** if osteomyelitis suspected",
        why: "Gold standard for osteo diagnosis + planning surgical extent" },
      { sev: "trigger", what: "**Sharp debridement** for slough / necrotic tissue",
        why: "Removes biofilm + non-viable tissue; mechanical / surgical / enzymatic" },
      { sev: "trigger", what: "**Wound clinic referral** for chronic ulcers",
        why: "Specialized care drives healing; complex multi-modal management" },
      { sev: "consider", what: "**Nutrition + glycemic optimization**",
        why: "Wound healing is protein + glycemic-dependent; modifiable" },
    ],
  },
  rationale: {
    driver: "Chronic leg ulcers colonize universally — surface swab growth alone is NOT an indication to treat (Margolis Cochrane 2014; IDSA + Wound Society 2019). Antibiotics are reserved for invasive infection: surrounding cellulitis, sepsis from the ulcer source, or underlying osteomyelitis on probe-to-bone / MRI. Cure is substrate-driven — compression (30–40 mmHg) for venous ulcers, revascularization + ABI assessment for arterial ulcers; without these, no antibiotic course succeeds. When antibiotics are indicated, deep tissue or bone culture (not surface swab) drives pathogen-directed therapy, and the diabetic foot ulcer subset routes to its own algorithm.",
    guideline: "ssti",
    rejected: "Treating positive surface swabs in chronic leg ulcers was deliberately rejected — colonization is universal, antibiotics for colonization alone confer no benefit (Margolis 2014), and reflexive treatment drives resistance + C. difficile. Empiric antibiotic courses in lieu of compression or revascularization were tempered: the substrate disease (venous insufficiency or arterial occlusion) drives healing, and antibiotics without addressing the substrate are insufficient. Routine MRSA empirics without invasive signs were rejected per stewardship principles." },
  objections: [
    { q: "Why no antibiotics for a clean-looking diabetic foot ulcer?",
      a: "IWGDF/IDSA 2023 defines infection by clinical criteria — purulence, two or more inflammatory signs, deep extension. A clean ulcer without these is colonization, not infection. Antibiotics for colonization drive resistance and C. difficile while offloading, debridement, and glycemic control heal the wound [cite:iwgdf_idsa]." },
    { q: "Why probe-to-bone matters more than imaging?",
      a: "Positive probe-to-bone in a diabetic foot ulcer has high positive predictive value for osteomyelitis and shifts duration from days to weeks. MRI confirms when uncertain. Bedside probe is cheap, immediate, and changes management; pair with deep tissue or bone culture, not surface swabs [cite:dfi]." },
    { q: "Why is offloading equal in importance to antibiotics?",
      a: "Pressure repeatedly applied to a neuropathic ulcer prevents healing regardless of antibiotic regimen. Total contact casting or removable cast walker offloads load and accelerates closure. Antibiotic stewardship without offloading is failure; treat the infection AND the cause [cite:iwgdf_idsa]." },
  ],
  research: {
    headline: "Colonization universal; antibiotics for invasive only; compression (venous) + revascularization (arterial) drive cure.",
    trials: [
      { name: "Margolis Cochrane 2014",
        n: "Meta",
        question: "Antibiotic strategy in chronic leg ulcer",
        finding: "Antibiotics for colonization alone NOT beneficial; reserve for cellulitis / sepsis / osteo",
        bias: "Heterogeneous ulcer types" },
    ],
    guidelines: [
      { society: "Wound society / IDSA",
        year: 2019,
        topic: "Chronic ulcer infection",
        keypoint: "Stewardship; compression (venous) or revascularization (arterial); MRI for osteo workup" },
    ],
    openQuestions: [
      "Deep tissue culture in osteo workup — probe-to-bone signal",
      "NPWT in chronic ulcer — supportive",
    ],
  },
};

export default { id: "infected-ulcer", regimen, decision };
