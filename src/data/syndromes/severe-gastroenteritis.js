/* ===========================================================
   SEVERE BACTERIAL GASTROENTERITIS — Shigella, Campy, Salmonella,
   Yersinia, EHEC. Most don't need antibiotics; severe + invasive
   do; avoid AB in EHEC (HUS risk). =========================== */

const regimen = {
  "Selective therapy": [
    {
      rx: /azithromycin/i,
      pickIf: "Invasive diarrhea (bloody, febrile, dysentery) — Shigella, Campylobacter, non-Typhi Salmonella in high-risk.",
      whyPick: [
        "**Azithromycin** preferred — covers Shigella + Campylobacter + Salmonella",
        "FQs have rising resistance",
        "**Don't treat** non-Typhi Salmonella in immunocompetent — prolongs carriage",
      ],
      watchOut: [
        { sev: "stop", text: "**Don't treat EHEC** (E. coli O157) — risk of HUS with antibiotics" },
        { sev: "warn", text: "Most gastroenteritis is viral or self-limited bacterial — supportive care only" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Most don't need antibiotics; treat severe / invasive / immunocompromised; AVOID in EHEC (HUS risk).",
    evidence: "IDSA 2017 — selective antibiotic use; benefit modest; EHEC contraindicated; resistance + carriage prolongation",
    branches: [
      { label: "Mild-moderate, immunocompetent", days: "0 d antibiotics",
        detail: "Hydration + supportive care; self-limited; antibiotics rarely change course" },
      { label: "Shigella (invasive, dysentery)", days: "3 d",
        detail: "Azithromycin or ceftriaxone or cipro per sensitivity; treat all symptomatic Shigella",
        matchAgent: /azithromycin/i },
      { label: "Campylobacter (severe / immunocompromised)", days: "3–5 d",
        detail: "Azithromycin first-line; FQ resistance ↑ globally" },
      { label: "Non-typhoidal Salmonella (severe / immunocompromised)", days: "7–14 d",
        detail: "Ceftriaxone or cipro per sensitivity; longer in HIV / immunocompromised",
        matchAgent: /ceftriaxone/i },
      { label: "EHEC / STEC (suspected or confirmed)", days: "0 d antibiotics",
        detail: "Antibiotics CONTRAINDICATED — increase HUS risk via toxin release; supportive only" },
      { label: "Cholera (Vibrio cholerae)", days: "Single dose doxy",
        detail: "Doxycycline 300 mg PO × 1 or azithro 1 g × 1; aggressive ORS / IV hydration",
        matchAgent: /doxycycline/i },
    ],
    stopWhen: [
      "Diarrhea resolving",
      "Hydration restored",
      "Afebrile",
      "Stool cultures cleared (if invasive)",
      "Course completed (if treated)",
    ],
    extendIf: [
      { text: "**Bacteremia** confirmed — per pathogen",
        matchCtx: { severe: true } },
      "Immunocompromised / HIV — extended Salmonella course",
      "Endovascular focus (Salmonella + aorta) — per mycotic aneurysm bands",
      "Inadequate hydration — IV + electrolyte correction",
    ],
  },
  monitoring: {
    headline: "Selective antibiotic use; EHEC contraindicated; hydration is the core; report outbreaks.",
    items: [
      { sev: "required", what: "**Avoid antibiotics in EHEC / STEC** — HUS risk",
        why: "Antibiotic-induced toxin release; HUS in 10–15% of pediatric STEC + antibiotic exposure" },
      { sev: "required", what: "**Stool culture + Shiga toxin / EHEC PCR** if bloody diarrhea",
        why: "EHEC must be excluded before any antibiotic decision in bloody diarrhea" },
      { sev: "required", what: "**Hydration** — oral or IV — is the core treatment",
        why: "Most morbidity is volume / electrolyte; antibiotics secondary" },
      { sev: "trigger", what: "**Treat all symptomatic Shigella**",
        why: "Reduces transmission + symptom duration; community-acquired resistance rising" },
      { sev: "trigger", what: "**Extended Salmonella course in HIV / immunocompromised**",
        why: "Recurrence + bacteremia risk; 14 d standard, longer per response" },
      { sev: "trigger", what: "**Mycotic aneurysm workup** for non-typhoidal Salmonella + age > 50",
        why: "Endovascular seeding; CT aorta if persistent bacteremia or risk substrate" },
      { sev: "trigger", what: "**Public health reporting** — Salmonella, Shigella, Vibrio, EHEC",
        why: "Notifiable; outbreak investigation + source identification" },
      { sev: "consider", what: "**Avoid antimotility agents** in invasive disease",
        why: "Prolongs toxin exposure + bacterial contact; supportive in non-invasive only" },
    ],
  },
  rationale: {
    driver: "Most acute bacterial gastroenteritis is self-limited and antibiotics are NOT indicated — hydration is the core treatment, and reflexive empiric antibiotics for non-invasive diarrhea prolong carriage, accelerate resistance, and provide minimal symptom benefit (IDSA 2017, Shane). Treatment is reserved for specific substrates: all symptomatic Shigella (azithromycin × 3 d), severe or immunocompromised Campylobacter (azithromycin × 3–5 d, FQs avoided given > 50% global resistance), severe or immunocompromised non-typhoidal Salmonella (ceftriaxone/cipro 7–14 d, longer in HIV with focal disease), and cholera (single-dose doxycycline + aggressive ORS). Bloody diarrhea must clear EHEC before any antibiotic decision.",
    guideline: "stew",
    rejected: "Empiric antibiotics in suspected or confirmed EHEC / STEC were deliberately rejected outright — Wong (NEJM 2000) showed ~10× higher HUS risk in pediatric EHEC + antibiotic exposure via Shiga-toxin release on bacterial lysis, and the contraindication holds firm in adults (Reuter Lancet ID 2023). Empiric FQs for suspected Campylobacter were tempered: global ciprofloxacin resistance now exceeds 50% per Reller (CID 2019), so azithromycin is first-line. Routine treatment of non-typhoidal Salmonella in immunocompetent hosts was rejected — prolongs carriage without clinical benefit." },
  objections: [
    { q: "Why no empiric antibiotics for bloody diarrhea on admission?",
      a: "EHEC / STEC must be excluded before any antibiotic decision in bloody diarrhea — Wong (NEJM 2000, n=71) showed antibiotic exposure increased HUS by ~10x in pediatric EHEC, attributed to Shiga toxin release from bacterial lysis [cite:wongehec]. IDSA 2017 mandates stool culture + Shiga toxin EIA / PCR first; empiric antibiotics in bloody diarrhea before EHEC exclusion is a stewardship and patient-safety violation. Hydration and supportive care are the bridge." },
    { q: "Why treat Shigella but not non-typhoid Salmonella in healthy adults?",
      a: "Shigella has low infectious dose (~10-100 organisms), high secondary transmission rate, and antibiotic therapy shortens shedding and symptoms — IDSA 2017 [cite:stew] endorses treating all symptomatic cases (3 d azithro, cipro, or ceftriaxone). Non-typhoid Salmonella in immunocompetent adults is self-limited, antibiotics prolong stool carriage by ~weeks, and do not reduce symptom duration — reserved for severe disease, age > 50, bacteremia risk, or immunocompromise. Substrate determines treatment, not the bloody-stool finding alone." },
    { q: "Why mycotic-aneurysm workup for non-typhoid Salmonella bacteremia?",
      a: "Non-typhoidal Salmonella has tropism for atherosclerotic endothelium — Salmonella + age > 50 + bacteremia carries 25% risk of endovascular seeding (aorta most common), with > 50% mortality if missed. IDSA 2017 [cite:stew] mandates CT aorta on persistent bacteremia or risk-positive substrate; suppressive therapy if vascular focus identified. The mycotic aneurysm presents weeks-months later with rupture — workup at the index admission is the only window to prevent it." },
    { q: "Why azithromycin over ciprofloxacin for Campylobacter?",
      a: "FQ resistance in Campylobacter exceeds 50% globally (Reller CID 2019 meta) and approaches 90% in parts of Southeast Asia from poultry-industry use — empiric cipro is no longer adequate. IDSA 2017 [cite:stew] elevates azithromycin to first-line for severe Campylobacter (3-5 d), with susceptibility-guided cipro reserved for confirmed-susceptible isolates. Macrolide resistance is rising but still well below FQ; default azithro until local antibiogram says otherwise." },
  ],
  research: {
    headline: "Most acute gastroenteritis is viral or self-limited; EHEC antibiotics CONTRAINDICATED (HUS risk); selective use.",
    trials: [
      { name: "Wong CID 2000 (EHEC)",
        n: "71",
        question: "Antibiotics + HUS risk in pediatric EHEC",
        finding: "Antibiotic exposure increased HUS by ~10x — established EHEC antibiotic contraindication; toxin release mechanism",
        bias: "Pediatric cohort; signal replicated in adults" },
      { name: "IDSA 2017 (Shane)",
        n: "Guideline",
        question: "Modern gastroenteritis antibiotic indications",
        finding: "Treat: Shigella (3 d), severe Campy (3–5 d azithro), severe/immunocompromised non-typhoid Salmonella (7–14 d); avoid EHEC + most non-invasive",
        bias: "Guideline synthesis" },
      { name: "Reller CID 2019 (Campy)",
        n: "Meta",
        question: "FQ resistance in Campylobacter globally",
        finding: "FQ resistance > 50% globally; azithromycin first-line",
        bias: "Geographic variation" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2017,
        topic: "Infectious diarrhea (Shane)",
        keypoint: "Selective antibiotic use; EHEC contraindicated; hydration is the core; mycotic aneurysm workup for Salmonella + age > 50" },
      { society: "CDC",
        year: 2024,
        topic: "Gastroenteritis surveillance + reporting",
        keypoint: "Notifiable: Salmonella + Shigella + STEC + Vibrio; outbreak investigation infrastructure" },
    ],
    openQuestions: [
      "Optimal Salmonella duration in HIV/immunocompromised — 14 d standard; longer with focal",
      "Single-dose vs 3-d for severe Shigella — limited evidence",
      "Adjunctive zinc / probiotics — supportive in pediatric, limited adult data",
    ],
  },
};

export default { id: "severe-gastroenteritis", regimen, decision };
