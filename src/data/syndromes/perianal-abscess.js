/* ===========================================================
   PERIANAL / PERIRECTAL ABSCESS — surgical drainage; antibiotics
   for cellulitis / sepsis / immunocompromised. =============== */

const regimen = {
  "Drainage ± antibiotics": [
    {
      rx: /amoxicillin-?clavulanate|ciprofloxacin.*metronidazole|incision/i,
      pickIf: "Perianal abscess — drainage is primary, antibiotics for selected.",
      whyPick: [
        "**I&D** is definitive — most cases need no antibiotics",
        "**Add antibiotics** (amox-clav or cipro+metronidazole) for: cellulitis, systemic signs, immunocompromise, deep/supralevator extension",
        "**Fistula develops in ~30%** post-drainage — colorectal surgery follow-up",
      ],
      watchOut: [
        { sev: "warn", text: "**Crohn's-associated** disease — different management; GI involvement" },
        { sev: "warn", text: "Supralevator / horseshoe extension → MRI + OR drainage" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Surgical drainage + antibiotics for cellulitis / sepsis / immunocompromised; 7–10 d if treated.",
    evidence: "ASCRS + IDSA — drainage drives outcome; antibiotics adjunct for cellulitis or sepsis; not routinely needed for simple abscess",
    branches: [
      { label: "Simple perianal abscess, drained, immunocompetent", days: "0 d antibiotics",
        detail: "I&D alone; antibiotics not routinely needed; sitz baths + wound care" },
      { label: "Cellulitis surrounding / systemic signs", days: "7–10 d",
        detail: "Amox-clav PO or ceftriaxone + metronidazole IV; cover anaerobes + GNR + GPC",
        matchAgent: /amoxicillin-?clavulanate|ceftriaxone|metronidazole/i },
      { label: "Complex (deep, ischiorectal, supralevator)", days: "10–14 d + EUA",
        detail: "Examination under anesthesia + drainage + broad antibiotics; colorectal surgery" },
      { label: "Diabetic / immunocompromised / IBD", days: "10–14 d",
        detail: "Lower threshold for IV + extended course + workup for fistula" },
      { label: "Fournier extension", days: "Per Fournier bands",
        detail: "Per scrotal-abscess bands for Fournier's gangrene management" },
    ],
    stopWhen: [
      "Drainage complete + cavity healing",
      "Surrounding cellulitis resolved",
      "Afebrile + clinical recovery",
      "Fistula workup planned if applicable",
      "Pathogen-specific course completed if antibiotics used",
    ],
    extendIf: [
      { text: "**Complex / deep abscess** — extend per colorectal + surgical adequacy",
        matchCtx: { severe: true } },
      "Underlying IBD — workup + extend per disease",
      "Fistula formation — surgical evaluation + extended",
      "Immunocompromised host — extend per ID",
    ],
  },
  monitoring: {
    headline: "Drainage drives outcome; colorectal surgery for complex; IBD workup for recurrent; antibiotic stewardship.",
    items: [
      { sev: "required", what: "**Surgical drainage** at presentation",
        why: "Source control; antibiotics alone fail for established abscess" },
      { sev: "required", what: "**Colorectal surgery consult** for complex / deep / recurrent",
        why: "Examination under anesthesia + definitive drainage + fistula assessment" },
      { sev: "required", what: "**Stewardship** — antibiotics not routinely needed after simple drainage",
        why: "ASCRS — drainage alone sufficient for immunocompetent simple abscess" },
      { sev: "trigger", what: "**Pelvic MRI** for complex / recurrent disease",
        why: "Defines anatomy + identifies fistula tract + drives surgical approach" },
      { sev: "trigger", what: "**IBD workup** for recurrent or atypical disease",
        why: "Perianal fistulizing Crohn's; alters long-term management + biologic decision" },
      { sev: "trigger", what: "**Diabetic + immunocompromised workup**",
        why: "Substrate for severe / Fournier extension; addressable" },
      { sev: "trigger", what: "**Sitz baths + bowel regimen** for symptom management",
        why: "Standard wound care + reduces straining + accelerates healing" },
      { sev: "consider", what: "**Fistula plan after acute resolution**",
        why: "30–50% of abscesses associated with fistula; planned definitive surgery" },
    ],
  },
  rationale: {
    driver: "Perianal abscess is fundamentally a surgical drainage disease — Sözener (Dis Colon Rectum 2011 RCT) and ASCRS 2016 both confirm that simple drained abscess in the immunocompetent host does NOT benefit from adjunctive antibiotics. Antibiotics are reserved for surrounding cellulitis, systemic signs, complex / deep / ischiorectal / supralevator disease (10–14 d + EUA), diabetic / immunocompromised / IBD substrate, or Fournier extension. Empirics cover anaerobes + enteric GNR + GPC (amox-clav PO or ceftriaxone + metronidazole IV). 30–50% of abscesses harbor an associated fistula; pelvic MRI defines the anatomy and drives the post-acute surgical plan.",
    guideline: "ssti",
    rejected: "Empiric antibiotics for every drained perianal abscess were deliberately rejected — Sözener's RCT and ASCRS 2016 establish that simple, immunocompetent, adequately drained disease does not benefit, and reflexive treatment drives resistance + C. difficile. Antibiotic-only management of complex / ischiorectal / supralevator disease was tempered: these require examination under anesthesia + definitive surgical drainage, not extended antibiotic courses alone. Missing the IBD workup in recurrent / atypical disease was rejected — perianal fistulizing Crohn's changes long-term management entirely." },
  objections: [
    { q: "Why drainage alone for simple perianal abscess?",
      a: "Sözener 2011 RCT showed antibiotics after adequate drainage did not reduce fistula formation or recurrence in immunocompetent patients. ASCRS endorses drainage-alone for simple disease without systemic signs, immunocompromise, or extensive cellulitis. Reflexive antibiotic prescribing adds resistance pressure without benefit [cite:mono]." },
    { q: "When do antibiotics actually add value?",
      a: "Add antibiotics for surrounding cellulitis, systemic inflammatory signs, immunocompromise (diabetes, neutropenia, HIV), valvular heart disease, or complex/recurrent disease. Cover enteric gram-negatives and anaerobes (amox-clav or metronidazole plus cephalosporin). Duration short (~5–7 d) after adequate drainage [cite:ssti]." },
    { q: "Why pelvic MRI for recurrent or complex disease?",
      a: "Recurrent perianal abscess raises concern for fistula-in-ano (30–50%) or Crohn disease; pelvic MRI maps tract anatomy and guides definitive surgery. Failure to investigate leads to repeated drainage cycles. Colorectal surgery referral is essential for complex, recurrent, or suspected IBD-related disease [cite:mono]." },
  ],
  research: {
    headline: "Drainage alone for simple immunocompetent (ASCRS); IBD workup for recurrent; pelvic MRI for complex.",
    trials: [
      { name: "Sözener Dis Colon Rectum 2011",
        n: "RCT",
        question: "Antibiotics after I&D for simple perianal abscess",
        finding: "No benefit from adjunctive antibiotics for simple drained abscess in immunocompetent; reserved for cellulitis or systemic signs",
        bias: "Single-center RCT; selected cases" },
      { name: "Steele ASCRS 2011",
        n: "Guideline",
        question: "Anorectal abscess management",
        finding: "I&D primary; antibiotics adjunct for cellulitis / sepsis / immunocompromised / hardware; IBD workup for recurrent",
        bias: "ASCRS consensus" },
    ],
    guidelines: [
      { society: "ASCRS",
        year: 2016,
        topic: "Anorectal abscess + fistula",
        keypoint: "I&D primary; antibiotics selective; colorectal surgery for complex / recurrent; IBD workup" },
    ],
    openQuestions: [
      "Fistula surgical timing — after acute resolution",
      "IBD biologic role — increasing as first-line for fistulizing Crohn's",
      "Optimal antibiotic duration in immunocompromised — 7–14 d standard",
    ],
  },
};

export default { id: "perianal-abscess", regimen, decision };
