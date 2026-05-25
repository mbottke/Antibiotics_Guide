/* ===========================================================
   MASTITIS & BREAST ABSCESS — lactational vs non-lactational;
   S. aureus dominant; continue breastfeeding; drain abscess. = */

const regimen = {
  "Lactational mastitis": [
    {
      rx: /dicloxacillin|cephalexin/i,
      pickIf: "Lactating woman with mastitis — continue breastfeeding from affected side.",
      whyPick: [
        "**Dicloxacillin or cephalexin × 10–14 d** — covers MSSA (predominant)",
        "**Continue breastfeeding** — improves drainage; safe for infant",
        "Add **TMP-SMX or clindamycin** if MRSA risk (but TMP-SMX caution in neonates < 1 mo)",
        "Frequent feeding / pumping is the actual therapy",
      ],
      watchOut: [
        { sev: "warn", text: "**Abscess** if fluctuant — needle aspiration or surgical drainage" },
        { sev: "note", text: "**Inflammatory breast cancer** mimics — re-evaluate if not resolved at 2 wk" },
      ],
    },
  ],
  "Breast abscess": [
    {
      rx: /drainage|MRSA/i,
      pickIf: "Fluctuant collection in breast — drainage required.",
      whyPick: [
        "**Drainage** (needle aspiration or surgical) + anti-staph including MRSA cover",
        "**Vancomycin** if hospitalized; **TMP-SMX or clindamycin PO** if outpatient",
        "**Ultrasound-guided aspiration** is first-line — repeat q48h if reaccumulation",
        "Continue **breastfeeding from contralateral side** + manual expression on affected side",
      ],
      watchOut: [
        { sev: "warn", text: "**Recurrence common** if incomplete drainage — image-guide and re-aspirate at 48 h" },
        { sev: "warn", text: "**Inflammatory breast cancer** mimics non-lactational abscess — biopsy if non-lactating or post-menopausal" },
        { sev: "note", text: "MRSA decolonization (mupirocin + chlorhexidine) for recurrent lactational abscess in the household" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "10–14 d antibiotics + continued breastfeeding / pumping; drain abscess; longer for granulomatous.",
    evidence: "ABM 2022 + IDSA — continue breastfeeding (safe for infant); abscess drainage drives cure; cover S. aureus",
    branches: [
      { label: "Lactational mastitis, no abscess", days: "10–14 d",
        detail: "Dicloxacillin / cephalexin; vanco / TMP-SMX if MRSA risk; continue breastfeeding / pumping",
        matchAgent: /dicloxacillin|cephalexin|cefazolin/i },
      { label: "Lactational abscess (drained)", days: "10–14 d",
        detail: "Aspiration + antibiotics; surgical I&D if loculated; continue breastfeeding contralateral" },
      { label: "Non-lactational / sub-areolar (smoker, diabetes)", days: "10–14 d",
        detail: "Cover anaerobes + S. aureus — amox-clav or clinda; recurrence common; surgical excision for fistula",
        matchAgent: /amoxicillin-?clavulanate|clindamycin/i },
      { label: "Granulomatous mastitis (idiopathic)", days: "Per pathology",
        detail: "Steroids + extended drainage; rule out TB / sarcoid / IGM; breast surgery + ID" },
      { label: "MRSA-confirmed", days: "10–14 d",
        detail: "Vancomycin then TMP-SMX or clinda PO; pediatrician input for nursing infant safety",
        matchAgent: /vancomycin|trimethoprim-?sulfamethoxazole/i },
    ],
    stopWhen: [
      "Erythema + tenderness resolved",
      "Abscess drained + cavity healing",
      "Afebrile",
      "Breastfeeding restored (if lactational)",
      "Minimum 10–14 d completed",
    ],
    extendIf: [
      { text: "**Granulomatous mastitis** — extended steroid course per pathology",
        matchCtx: { severe: true } },
      "Persistent abscess — repeat drainage or surgical excision",
      "MRSA bacteremia — per SAB bands",
      "Sub-areolar fistula — surgical excision",
    ],
  },
  monitoring: {
    headline: "US for abscess; continue breastfeeding; needle aspiration before surgical I&D; rule out IBC if non-response.",
    items: [
      { sev: "required", what: "**Bedside US** if abscess suspected",
        why: "Identifies drainable collection; guides needle aspiration vs. surgical drainage" },
      { sev: "required", what: "**Continue breastfeeding / pumping** unless infant ill",
        why: "Effective drainage; safe for infant; abrupt weaning drives engorgement + abscess" },
      { sev: "required", what: "**Needle aspiration** before surgical I&D when feasible",
        why: "Less morbid; preserves breastfeeding; effective for most lactational abscesses" },
      { sev: "trigger", what: "**Cover MRSA** if recurrent, severe, or community MRSA prevalent",
        why: "Increasing MRSA in lactational mastitis; TMP-SMX safe for infant > 2 mo",
        matchCtx: { mrsaRisk: true } },
      { sev: "trigger", what: "**Inflammatory breast cancer workup** if non-response by 1 week",
        why: "IBC mimics mastitis (peau d'orange, redness); biopsy if non-response — DO NOT delay" },
      { sev: "trigger", what: "**Smoking cessation** for non-lactational / sub-areolar disease",
        why: "Modifiable risk; reduces recurrence + need for surgical excision" },
      { sev: "trigger", what: "**TB / sarcoid / IGM workup** for granulomatous disease",
        why: "Different treatment paradigms — antibiotics alone fail in granulomatous mastitis" },
      { sev: "consider", what: "**Lactation consultant** referral for technique + comfort",
        why: "Improves drainage + continuation of breastfeeding; reduces recurrence" },
    ],
  },
  rationale: {
    driver: "Lactational mastitis is S. aureus-dominant — empiric dicloxacillin or cephalexin × 10–14 d, with vancomycin or TMP-SMX added per MRSA prevalence and infant safety (TMP-SMX safe > 2 mo old). Continued breastfeeding / pumping is mandated by ABM 2022 — it provides effective drainage, is safe for the infant, and abrupt weaning drives engorgement + abscess. Suspected abscess gets bedside US + needle aspiration before surgical I&D (less morbid, preserves breastfeeding). Non-lactational sub-areolar disease covers anaerobes (amox-clav / clinda) and demands smoking cessation; inflammatory breast cancer mimics mastitis and must be excluded at 1 wk of non-response.",
    guideline: "ssti",
    rejected: "Abrupt weaning during lactational mastitis was deliberately rejected — ABM 2022 documents that stopping nursing drives engorgement, milk stasis, and abscess; continued effective drainage is therapeutic. Reflexive surgical I&D before needle aspiration was tempered: aspiration is less morbid, preserves breastfeeding, and is effective for most lactational abscesses (Dixon CMR 2017). Empiric coverage that misses MRSA in high-prevalence settings was rejected: rising community MRSA in lactational mastitis warrants risk-stratified empirics rather than reflexive narrow β-lactam." },
  objections: [
    { q: "Why continue breastfeeding through mastitis — won't it harm baby?",
      a: "ABM 2022 and IDSA endorse continued breastfeeding or pumping; milk stasis perpetuates inflammation and infection. Maternal flora is already in the infant's environment, and the antibiotics used (dicloxacillin, cephalexin, clindamycin) are compatible with lactation. Stopping breastfeeding worsens mastitis and risks abscess [cite:ssti]." },
    { q: "Why dicloxacillin — not broader cover for MRSA?",
      a: "Lactational mastitis is overwhelmingly methicillin-susceptible Staphylococcus aureus; dicloxacillin or cephalexin is first-line. Add MRSA cover (TMP-SMX, clindamycin) only for prior MRSA, no response at 48 h, abscess, or high-prevalence settings. Reflexive MRSA cover overtreats most cases [cite:ssti]." },
    { q: "Why image at 48–72 h if no improvement?",
      a: "Persistent fever or tenderness beyond 48–72 h of appropriate antibiotics signals abscess (10% of mastitis), requiring ultrasound-guided drainage. Continuing antibiotics without addressing collected pus is a stewardship and outcome failure. Image early when trajectory disappoints; drain when abscess confirmed [cite:mono]." },
  ],
  research: {
    headline: "Continue breastfeeding (safe for infant); aspirate abscess before surgical I&D; rule out IBC if non-response.",
    trials: [
      { name: "ABM Clinical Protocol 2022",
        n: "Guideline",
        question: "Modern lactational mastitis management",
        finding: "Continue breastfeeding/pumping; effective drainage; abrupt weaning drives engorgement + abscess; 10–14 d antibiotic",
        bias: "Consensus protocol" },
      { name: "Dixon Clin Microbiol Rev 2017",
        n: "Cohort review",
        question: "Lactational vs non-lactational mastitis",
        finding: "Lactational: S. aureus dominant + continue breastfeeding; non-lactational/sub-areolar: anaerobic + smoking-driven + recurrent",
        bias: "Pre-modern MRSA epidemiology; rising MRSA in some regions" },
    ],
    guidelines: [
      { society: "ABM",
        year: 2022,
        topic: "Lactational mastitis (Academy of Breastfeeding Medicine)",
        keypoint: "Continue breastfeeding; needle aspiration before surgical I&D; rule out IBC if non-response by 1 wk" },
    ],
    openQuestions: [
      "Optimal MRSA empiric coverage threshold — local prevalence-driven",
      "Granulomatous mastitis treatment — steroids + extended drainage; not bacterial",
      "Sub-areolar fistula surgical timing — after acute resolution",
    ],
  },
};

export default { id: "mastitis", regimen, decision };
