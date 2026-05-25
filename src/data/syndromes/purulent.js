/* ===========================================================
   PURULENT SSTI / CUTANEOUS ABSCESS — I&D is the treatment;
   antibiotics adjunctive; MRSA-dominant in U.S. ============== */

const regimen = {
  "Drainage": [
    {
      rx: /incision|drainage/i,
      pickIf: "Cutaneous abscess — drainage is the definitive treatment.",
      whyPick: [
        "**I&D alone** cures most simple abscesses < 5 cm with no cellulitis",
        "**Add antibiotics** (TMP-SMX or doxy) for: ≥ 5 cm, cellulitis surrounding, fever, immunosuppression, hands/face/genitals",
        "**7-day course** post-drainage for the above",
      ],
      watchOut: [
        { sev: "warn", text: "**Failure to fluctuate → don't drain prematurely** — empiric antibiotics + warm compress while organizing" },
        { sev: "note", text: "**Routine packing of small abscesses is unnecessary** — increases pain without benefit" },
        { sev: "note", text: "**Loop drainage** (versus traditional incision/packing) reduces follow-up burden and is equally effective for moderate abscesses" },
      ],
    },
  ],
  "Add MRSA coverage": [
    {
      rx: /TMP-?SMX|doxycycline|vancomycin/i,
      pickIf: "Abscess with cellulitis, large (>5 cm), systemic signs, or recurrent.",
      whyPick: [
        "**TMP-SMX or doxycycline** PO outpatient",
        "**Vancomycin** IV if hospitalized or severe",
        "Add **β-lactam (cephalexin)** if extensive cellulitis component — covers β-hemolytic strep co-infection",
      ],
      watchOut: [
        { sev: "warn", text: "**Recurrent abscesses** → decolonization protocol (mupirocin nares ×5 d + chlorhexidine baths ×5 d, repeat household members)" },
        { sev: "warn", text: "**TMP-SMX** — sulfa allergy, hyperkalemia risk on ACE-I/ARB, 3rd-trimester pregnancy",
          matchCtx: { any: [{ blAllergy: "severe" }] } },
        { sev: "note", text: "**Doxycycline** — photosensitivity, pill esophagitis; avoid in pregnancy / children < 8 y" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "I&D is the cure; antibiotics adjunct for fever / systemic signs / large / surrounding cellulitis.",
    evidence: "IDSA 2014 + Talan 2016 NEJM — TMP-SMX after I&D ↑ cure rate ~7%; small simple abscesses heal with drainage alone",
    branches: [
      { label: "Simple abscess < 2 cm, drained, no cellulitis", days: "0 d",
        detail: "I&D alone; antibiotics not required; ensure follow-up + return precautions" },
      { label: "Abscess + surrounding cellulitis / systemic signs", days: "5–7 d",
        detail: "TMP-SMX or doxy or clinda; cover MRSA empirically; cefazolin for MSSA-confirmed",
        matchAgent: /trimethoprim-?sulfamethoxazole|doxycycline|clindamycin/i },
      { label: "Recurrent MRSA / household clusters", days: "7 d + decolonization",
        detail: "Treat + decolonize: mupirocin nares + chlorhexidine wash × 5–10 d; household coordination" },
      { label: "Diabetic / immunocompromised / large > 5 cm", days: "7–14 d",
        detail: "Extend per host + size; lower threshold to IV + ID consult" },
    ],
    stopWhen: [
      "Abscess drained + wound healing / packed",
      "Surrounding erythema resolved or receding",
      "Afebrile + systemic signs cleared",
      "Tolerating oral therapy",
      "Minimum course completed if antibiotics started",
    ],
    extendIf: [
      { text: "**Bacteremia** confirmed — extend per pathogen + source",
        matchCtx: { severe: true } },
      "Inadequate drainage — re-I&D or IR drain for deep / loculated",
      { text: "**Immunocompromised host** — extend per ID + host substrate",
        matchCtx: { severe: true } },
      "Recurrent disease — decolonization + screen contacts",
    ],
  },
  monitoring: {
    headline: "I&D drives outcome; culture pus; decolonize for recurrent; antibiotics adjunct not primary.",
    items: [
      { sev: "required", what: "**I&D** at presentation — primary treatment",
        why: "Source control — antibiotics alone fail for established abscess > 2 cm" },
      { sev: "required", what: "**Wound culture** from drained pus",
        why: "MRSA-dominant in U.S.; pathogen-directed therapy if non-response or recurrence" },
      { sev: "trigger", what: "**Decolonization** for recurrent disease — mupirocin + chlorhexidine",
        why: "Reduces recurrence; coordinate with household contacts for cluster outbreaks" },
      { sev: "trigger", what: "**MRSA cover empirically** when antibiotics indicated",
        why: "Community MRSA dominates U.S. purulent SSTI; TMP-SMX / doxy / clinda are first-line",
        matchCtx: { mrsaRisk: true } },
      { sev: "trigger", what: "**Bedside US** if collection vs. cellulitis ambiguous",
        why: "Identifies drainable fluid; avoids unnecessary I&D in pure cellulitis" },
      { sev: "trigger", what: "**Wound packing + dressing changes** + follow-up in 48 h",
        why: "Recurrence common without adequate cavity collapse; ensures completion of drainage" },
      { sev: "consider", what: "**Hidradenitis / pilonidal workup** for recurrent abscesses in characteristic sites",
        why: "Underlying disease drives recurrence; different long-term management" },
      { sev: "consider", what: "**Antibiotic stewardship** — skip antibiotics for small drained abscess without systemic signs",
        why: "IDSA 2014 + outcome data — drainage alone sufficient; avoids selection pressure" },
    ],
  },
  rationale: {
    driver: "Purulent SSTI is community-MRSA-dominant in the US, but I&D is the cure — antibiotics are adjunctive. Talan (NEJM 2016, n=1,265) showed TMP-SMX × 7 d after I&D raises cure ~7% over placebo, with benefit concentrated in abscesses > 2 cm, surrounding cellulitis, or systemic signs; small simple abscesses heal with drainage alone. Empiric MRSA cover (TMP-SMX, doxycycline, or clindamycin) is appropriate when antibiotics are indicated. Recurrent disease triggers decolonization (mupirocin nares + chlorhexidine wash × 5–10 d) plus household-contact coordination per IDSA 2014.",
    guideline: "ssti",
    rejected: "Reflexive antibiotic courses for every drained abscess were deliberately rejected — IDSA 2014 and outcome data both support drainage alone for simple, small abscesses without surrounding cellulitis or systemic signs, and adjunctive antibiotics drive resistance without changing wound trajectory. Empiric β-lactam monotherapy (cephalexin alone) was tempered: in community-MRSA-prevalent regions it under-covers the dominant pathogen, and Daum NEJM 2017 (n=786) shows TMP-SMX + drainage outperforms placebo + drainage for cure." },
  objections: [
    { q: "Why I&D alone for a small abscess — no antibiotics?",
      a: "For uncomplicated abscess <2 cm without surrounding cellulitis or systemic signs in an immunocompetent host, incision and drainage alone is sufficient. IDSA 2014 endorses this; antibiotics add marginal benefit and select for resistance. Reserve TMP-SMX or doxycycline for larger, multiple, or systemic disease [cite:ssti]." },
    { q: "Then why did Talan show TMP-SMX improved cure?",
      a: "Talan NEJM 2016 (n=1,265) found TMP-SMX improved cure ~7% in drained abscesses overall, but absolute benefit was small and concentrated in larger lesions or surrounding cellulitis. For truly small isolated abscesses the number-needed-to-treat is high. Shared decision-making and stewardship still apply [cite:ssti]." },
    { q: "Why not clindamycin — it covers MRSA too?",
      a: "Clindamycin has rising MRSA resistance regionally (often 20–40%) and a high Clostridioides difficile risk. TMP-SMX and doxycycline retain reliable activity against community MRSA and have favorable safety profiles. Use clindamycin only when inducible resistance excluded and alternatives contraindicated [cite:ssti]." },
  ],
  research: {
    headline: "I&D primary; antibiotics adjunct only for cellulitis / systemic / immunocompromised; Talan 2016 supports TMP-SMX.",
    trials: [
      { name: "Talan NEJM 2016",
        n: "1,265",
        question: "TMP-SMX adjunct after I&D for cutaneous abscess",
        finding: "TMP-SMX × 7 d after I&D ↑ cure rate ~7% vs placebo; benefit greatest in large abscesses or surrounding cellulitis",
        bias: "U.S. cohort; MRSA-dominant region" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2014,
        topic: "Purulent SSTI (Stevens)",
        keypoint: "I&D primary; antibiotics adjunct for fever/systemic/large/surrounding cellulitis" },
    ],
    openQuestions: [
      "Decolonization for recurrent — mupirocin + chlorhexidine",
      "Antibiotic-free observation for small simple abscess — supported",
    ],
  },
};

export default { id: "purulent", regimen, decision };
