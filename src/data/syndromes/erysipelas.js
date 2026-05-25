/* ===========================================================
   ERYSIPELAS — superficial dermis + lymphatics; strep-dominant;
   PCN-class workhorse; prophylaxis for recurrent. ============ */

const regimen = {
  "First-line": [
    {
      rx: /penicillin|cefazolin/i,
      pickIf: "Sharp-bordered, raised, fiery red rash — classic erysipelas (strep).",
      whyPick: [
        "**Penicillin** (oral or IV) — strep is the only bug",
        "Cefazolin if PCN intolerance",
        "**No MRSA cover needed** — erysipelas is strep",
        "5–10 day course",
      ],
      watchOut: [
        { sev: "warn", text: "**Lymphedema substrate** — recurrent erysipelas predicts further episodes; address underlying lymphatic compromise" },
        { sev: "note", text: "**Prophylactic penicillin** (PATCH I/II trials) for recurrent leg erysipelas — extends time to next episode" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "5 d penicillin for uncomplicated; longer for atypical or slow response; prophylaxis for recurrent.",
    evidence: "IDSA 2014 + PATCH trials — 5 d adequate for uncomplicated; PCN prophylaxis reduces recurrence in lymphedema",
    branches: [
      { label: "Uncomplicated, clinical response", days: "5 d",
        detail: "Penicillin V / amoxicillin / cefazolin; strep-dominant + rapid response typical",
        matchAgent: /penicillin|amoxicillin|cefazolin/i },
      { label: "Slow response / extensive / bullous", days: "7–10 d",
        detail: "Extend per trajectory; reassess for deeper infection or atypical organism" },
      { label: "Recurrent (≥ 2 episodes / yr) on prophylaxis", days: "5 d + chronic ppx",
        detail: "PCN V 250 mg BID or benzathine PCN q4wk per PATCH; treat tinea pedis as entry portal" },
      { label: "PCN allergy", days: "5 d",
        detail: "Cephalexin (no severe PCN allergy) or clindamycin or macrolide; doxycycline alternative",
        matchAgent: /clindamycin|azithromycin|cephalexin/i },
    ],
    stopWhen: [
      "Erythema borders receding (mark + monitor)",
      "Afebrile ≥ 24–48 h",
      "Pain decreasing",
      "Tolerating oral therapy",
      "Tinea pedis / entry portal addressed",
      "Minimum 5 d completed",
    ],
    extendIf: [
      { text: "**Slow response by 48–72 h** — reassess deeper infection",
        matchCtx: { severe: true } },
      "Lymphedema substrate — start chronic suppression",
      "Bullous / hemorrhagic disease — workup superinfection",
      "Bacteremia confirmed — per pathogen",
    ],
  },
  monitoring: {
    headline: "Mark borders; PCN-class workhorse; treat tinea as entry portal; PATCH prophylaxis for recurrent.",
    items: [
      { sev: "required", what: "**Mark erythema borders** + date — daily progression check",
        why: "Objective measure of response; spread despite antibiotic triggers re-workup" },
      { sev: "required", what: "**Elevation + compression** for lower-extremity disease",
        why: "Reduces edema + accelerates clearance; standard adjunct" },
      { sev: "required", what: "**Treat tinea pedis** as entry portal",
        why: "Interdigital fissures are common portal; topical antifungal prevents recurrence" },
      { sev: "trigger", what: "**PCN prophylaxis** (PATCH) for ≥ 2 episodes / yr",
        why: "PCN V 250 mg BID reduces recurrence by ~50% in lymphedema / venous stasis substrate" },
      { sev: "trigger", what: "**Reassess at 48–72 h** if no response",
        why: "Non-response triggers MRSA cover, imaging for deeper infection, or workup for atypical organism" },
      { sev: "trigger", what: "**Workup lymphedema** in recurrent disease",
        why: "Modifiable substrate; compression + skin care reduces recurrence" },
      { sev: "consider", what: "**Differentiate from cellulitis** — sharp raised border + St. Anthony's fire",
        why: "Distinguishes superficial vs. deep dermal; pure erysipelas more PCN-responsive" },
      { sev: "consider", what: "**Skin care education** — moisturize, avoid trauma",
        why: "Prevention of recurrence; addressable at every visit" },
    ],
  },
  rationale: {
    driver: "Erysipelas is superficial-dermal streptococcal disease (St. Anthony's fire — sharp raised border distinguishes from cellulitis) and is overwhelmingly PCN-responsive. Empiric penicillin V or amoxicillin × 5 d is adequate for uncomplicated disease (Hepburn 2004, IDSA 2014); cefazolin or cephalexin substitute for mild PCN allergy. Tinea pedis as entry portal is treated concurrently — interdigital fissures are the dominant recurrence driver. PATCH I + II (BMJ 2018, n=1,124) established PCN V 250 mg BID prophylaxis cuts recurrence ~45% over 3 yr in lymphedema / venous stasis substrate, with protective effect waning post-discontinuation.",
    guideline: "ssti",
    rejected: "Reflexive MRSA cover for non-purulent erysipelas was deliberately rejected — erysipelas is strep-dominant per IDSA 2014, MRSA empirics drive resistance without benefit, and the rapid PCN response is diagnostic of correct organism. Prolonged 10–14 d courses for uncomplicated disease were tempered: Hepburn 2004 showed 5 d non-inferior to 10 d, and pure erysipelas responds quickly. Routine prophylaxis after a single episode was rejected — PATCH supports ppx for ≥ 2 episodes / yr in a lymphedema substrate, not first-episode disease." },
  objections: [
    { q: "Why no MRSA cover for erysipelas?",
      a: "Erysipelas is a sharply demarcated dermal/lymphatic infection caused almost exclusively by beta-hemolytic streptococci. Penicillin or cefazolin is curative; MRSA cover adds toxicity and resistance pressure without benefit. Pallin 2013 confirmed adding TMP-SMX did not improve cure in non-purulent SSTI [cite:pallin]." },
    { q: "Why only 5 days — surgeons and primary care expect 10?",
      a: "Hepburn 2004 and Tansarli 2018 meta-analysis demonstrate 5-day courses are non-inferior to 10-day courses in uncomplicated SSTI with clinical response. IDSA 2014 endorses the short course. Extend only for slow response, extensive involvement, or bacteremia [cite:ssti]." },
    { q: "Why treat tinea pedis when the infection is on the leg?",
      a: "Interdigital fissures from tinea pedis are the dominant portal of entry for streptococcal leg erysipelas. Untreated tinea drives recurrence; topical antifungal is a cheap, high-yield intervention. PATCH trials further support prophylactic penicillin in recurrent cases with addressable substrate [cite:ssti]." },
  ],
  research: {
    headline: "PATCH I + II established PCN prophylaxis reduces recurrence ~45% in lymphedema substrate.",
    trials: [
      { name: "PATCH I + II BMJ 2018",
        n: "1,124 (combined)",
        question: "Penicillin V prophylaxis for recurrent leg cellulitis / erysipelas",
        finding: "PCN V 250 mg BID reduced recurrence ~45% over 3 yr; protective effect waned post-discontinuation",
        bias: "European cohort; long-term resistance / adherence challenges" },
      { name: "Hepburn Arch IM 2004",
        n: "121",
        question: "5 vs 10 d treatment for uncomplicated cellulitis / erysipelas",
        finding: "5 d non-inferior; foundation of short-course recommendation",
        bias: "Excluded severe / immunocompromised" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2014,
        topic: "SSTI (Stevens)",
        keypoint: "5-day PCN-class workhorse; treat tinea pedis as entry portal; PATCH ppx for recurrent" },
    ],
    openQuestions: [
      "Optimal prophylaxis duration — 1–3 yr standard; relapse common post-discontinuation",
      "Lymphedema therapy concurrent — compression + manual drainage",
      "Vaccination role — no specific vaccine; prevention via hygiene",
    ],
  },
};

export default { id: "erysipelas", regimen, decision };
