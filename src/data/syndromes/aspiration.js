/* ===========================================================
   ASPIRATION PNEUMONIA / LUNG ABSCESS — chemical pneumonitis vs
   bacterial superinfection; anaerobes overstated, GNR + oral
   strep dominate; abscess 3–6 wk + drainage if possible. ====== */

const regimen = {
  "Community-acquired aspiration": [
    {
      rx: /ceftriaxone/i,
      pickIf: "Witnessed aspiration in stable community-dwelling patient.",
      whyPick: [
        "**Modern data** — aspiration pneumonia is largely upper-airway strep, not anaerobic",
        "Ceftriaxone alone usually sufficient — anaerobes overcalled historically",
        "Add metronidazole only if **abscess, empyema, putrid sputum, poor dentition**",
      ],
      watchOut: [
        { sev: "warn", text: "**Aspiration pneumonitis ≠ pneumonia** — chemical injury, NO antibiotics needed 48 h" },
        { sev: "note", text: "Reserve broad anaerobic cover for true cavitary / abscess findings" },
      ],
    },
    {
      rx: /ampicillin-?sulbactam/i,
      pickIf: "Anaerobic risk high (periodontal disease, alcoholic, vomiting witnessed).",
      whyPick: [
        "**Built-in anaerobic** + streptococcal cover — single agent",
        "Covers oral flora better than ceftriaxone in true aspiration",
        "**3 g IV q6h** — extended infusion if critically ill",
      ],
      watchOut: [
        { sev: "warn", text: "**Penicillin allergy** — clindamycin alternative (but C. diff risk)" },
        { sev: "note", text: "Cost-equivalent to ceftriaxone — pick by anaerobic risk profile" },
      ],
    },
  ],
  "Abscess / empyema / necrotizing": [
    {
      rx: /ampicillin-?sulbactam|piperacillin/i,
      pickIf: "Lung abscess, empyema, or necrotizing pneumonia (cavitary).",
      whyPick: [
        "**True anaerobic coverage** required — abscess flora",
        "Pip-tazo if Pseudomonas risk; ampicillin-sulbactam otherwise",
        "**Source control** — image-guided drainage if > 4 cm or no improvement at 7 d",
        "Long course: **3–6 weeks** with PO step-down (amox-clav)",
      ],
      watchOut: [
        { sev: "warn", text: "Penicillin allergy → clindamycin + ceftriaxone (C. diff risk)" },
        { sev: "warn", text: "Suspect **TB / fungal / lung cancer** if cavitary in atypical host" },
        { sev: "note", text: "Treat until **radiographic resolution** of cavity, not just fever resolution" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "5–7 d uncomplicated; 3–6 wk for lung abscess until cavity resolves on imaging.",
    evidence: "Mandell 2007 + ATS 2019 — anaerobic coverage overstated for hospital aspiration; abscess driven by source control + cavity resolution",
    branches: [
      { label: "Chemical pneumonitis (witnessed, no fever / leukocytosis by 48 h)", days: "0 d",
        detail: "Observe without antibiotics; treat only if fever / leukocytosis / new infiltrate persist > 48 h" },
      { label: "Community-acquired aspiration pneumonia", days: "5–7 d",
        detail: "Per CAP; anaerobic coverage NOT routinely needed unless poor dentition + putrid sputum" },
      { label: "Hospital-acquired aspiration + polymicrobial", days: "7 d",
        detail: "Per HAP / VAP; cover GNR + MRSA per risk; de-escalate on cultures",
        matchAgent: /piperacillin|cefepime|meropenem/i },
      { label: "Lung abscess (cavitary, putrid)", days: "3–6 wk",
        detail: "Until cavity resolves on serial imaging; oral step-down acceptable when stable; drainage if accessible",
        matchAgent: /clindamycin|amoxicillin-?clavulanate|metronidazole/i },
      { label: "Necrotizing aspiration + immunocompromised", days: "≥ 6 wk",
        detail: "ID + thoracic surgery; consider mold workup; per pathogen" },
    ],
    stopWhen: [
      "Afebrile ≥ 48 h",
      "Stable oxygenation + work of breathing",
      "Imaging shows cavity resolution (if abscess)",
      "Oral step-down complete + tolerating",
      "Source — dental, GERD, dysphagia — addressed or workup booked",
      "Minimum 5–7 d (uncomplicated) or 3–6 wk (abscess) completed",
    ],
    extendIf: [
      { text: "**Lung abscess / cavitary disease** — until radiographic resolution",
        matchCtx: { severe: true } },
      "Empyema co-existing — per empyema bands + drainage",
      "Immunocompromised host — extend per pathogen + ANC / immune recovery",
      "Inadequate drainage or anatomic obstruction (mass, foreign body)",
      "MDR / non-fermenting GNR — per culture + ID",
    ],
  },
  monitoring: {
    headline: "Imaging at 4–6 wk for abscess; dysphagia workup; oral hygiene + GERD review.",
    items: [
      { sev: "required", what: "**Dysphagia / swallow evaluation** by speech pathology",
        why: "Recurrence prevention — modifiable risk in stroke / dementia / neuromuscular hosts" },
      { sev: "required", what: "**Repeat imaging at 4–6 wk** if abscess or cavity",
        why: "Cavity persistence > 6 wk drives workup for malignancy / TB / mold",
        matchBranch: ["Lung abscess (cavitary, putrid)"] },
      { sev: "trigger", what: "**Drainage** — IR or thoracic surgery — for abscess > 6 cm or non-response",
        why: "Source control accelerates resolution; large or peripheral abscesses amenable to percutaneous drain" },
      { sev: "trigger", what: "**Dental + oral hygiene review** in lung abscess",
        why: "Poor dentition drives recurrence + putrid anaerobic burden" },
      { sev: "trigger", what: "**Avoid empiric anaerobic coverage** in hospital aspiration without abscess / putrid sputum",
        why: "Anaerobic coverage overstated; collateral damage; favor narrower regimen" },
      { sev: "trigger", what: "**Bronchoscopy** if mass, foreign body, or non-response by day 7",
        why: "Post-obstructive pneumonia + retained foreign body mimic refractory aspiration" },
      { sev: "consider", what: "Procalcitonin trend if duration debate at day 5",
        why: "Falling PCT in clinical responder supports stopping" },
      { sev: "consider", what: "**Mold / fungal workup** if immunocompromised + non-response",
        why: "Aspergillus or mucor can mimic bacterial abscess in immunocompromised" },
    ],
  },
  rationale: {
    driver: "Aspiration splits into two diseases — chemical pneumonitis (witnessed event, no fever / leukocytosis by 48 h) needs no antibiotics, while bacterial aspiration pneumonia is treated per CAP / HAP for the host substrate (ceftriaxone + azithromycin community; pip-tazo or cefepime for hospital-acquired). Anaerobic coverage is reserved for putrid sputum, poor dentition, or cavitary disease — Marik (NEJM 2001) and Mandell 2007 reframed the microbiology to oral streptococci + GNR rather than reflexive Bacteroides. Lung abscess runs 3–6 wk anchored to radiographic cavity resolution plus drainage when accessible.",
    guideline: "cap",
    rejected: "Routine empiric anaerobic coverage was deliberately rejected for non-cavitary hospital aspiration — Mandell IDSA 2007 and ATS / IDSA 2019 found anaerobes are not the dominant pathogen absent putrid sputum, poor dentition, or cavity. Reflexive clindamycin invites C. difficile + collateral damage without benefit, and antibiotics for pure chemical pneumonitis (no fever / leukocytosis by 48 h) drive selection pressure without changing outcome." },
  objections: [
    { q: "Why no anaerobic cover — aspiration is anaerobic, right?",
      a: "Routine anaerobic coverage was deliberately dropped for hospital aspiration absent putrid sputum, poor dentition, or cavitary disease. Marik (NEJM 2001) and ATS / IDSA 2019 [cite:cap] reframed the microbiology — oral streptococci + Gram-negative rods dominate, not Bacteroides. Reflexive clindamycin or metronidazole drives C. difficile and selection pressure without outcome benefit. Reserve anaerobic add-on for putrid sputum, poor dentition, or radiographic cavity per [cite:stew]." },
    { q: "Why withhold antibiotics after a witnessed aspiration event?",
      a: "Chemical pneumonitis (Mendelson syndrome) is gastric-acid injury, not infection — Marik (NEJM 2001) showed witnessed aspiration without fever, leukocytosis, or new infiltrate by 48 h is chemical and antibiotics drive selection pressure without changing outcome. ATS / IDSA 2019 [cite:cap] permits observation in this substrate, triggering treatment only for persistent fever, rising leukocytosis, or new infiltrate at 48-72 h. Stewardship [cite:stew] frames reflexive treatment as net harm." },
    { q: "Why 3-6 wk for lung abscess — extend to radiographic resolution?",
      a: "Lung abscess duration anchors to cavity resolution on serial imaging, not a fixed calendar — Bartlett (CID 2013) and ATS / IDSA 2019 [cite:cap] recommend 3-6 wk with oral step-down acceptable once stable. IR percutaneous drainage of accessible abscess > 6 cm or non-response accelerates resolution. Cavity persistence > 6 wk triggers workup for malignancy, TB, or mold rather than indefinite antibiotic extension [cite:mono]." },
  ],
  research: {
    headline: "Anaerobic coverage overstated for hospital aspiration; abscess driven by source control + cavity resolution.",
    trials: [
      { name: "Mandell IDSA 2007",
        n: "Guideline",
        question: "Anaerobic coverage indication in aspiration pneumonia",
        finding: "Routine anaerobic coverage NOT required absent putrid sputum, poor dentition, or cavitary disease — bacterial pathogens dominate",
        bias: "Guideline synthesis; pre-CAP-2019 update but principle holds" },
      { name: "Marik NEJM 2001 review",
        n: "Review",
        question: "Chemical pneumonitis vs bacterial aspiration pneumonia distinction",
        finding: "Witnessed aspiration without fever/leukocytosis at 48 h → chemical pneumonitis; antibiotics NOT indicated",
        bias: "Pre-procalcitonin era; PCT may refine distinction" },
      { name: "Bartlett CID 2013",
        n: "Cohort review",
        question: "Lung abscess management modernization",
        finding: "3–6 wk antibiotics + drainage if accessible drives outcomes; clindamycin alternative to amox-clav; oral step-down acceptable",
        bias: "Pre-modern resistance data; principles validated" },
    ],
    guidelines: [
      { society: "ATS / IDSA",
        year: 2019,
        topic: "CAP including aspiration (Metlay)",
        keypoint: "Aspiration pneumonia treated per CAP unless putrid sputum / poor dentition / abscess; anaerobic coverage selective" },
      { society: "BTS",
        year: 2023,
        topic: "British CAP guidance",
        keypoint: "Aligned with IDSA; emphasizes dysphagia workup + offloading + bedside swallow evaluation" },
    ],
    openQuestions: [
      "Routine swallow evaluation timing — varies by institution; speech pathology consult standard",
      "Drainage vs antibiotic alone for abscess < 6 cm — case-by-case",
      "Optimal duration for lung abscess — 3–6 wk standard but radiographic resolution drives",
    ],
  },
};

export default { id: "aspiration", regimen, decision };
