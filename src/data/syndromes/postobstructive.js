/* ===========================================================
   POST-OBSTRUCTIVE PNEUMONIA — distal to bronchial obstruction
   (tumor, foreign body, mucus plug). Drainage is the cure. === */

const regimen = {
  "Empiric": [
    {
      rx: /β-?lactam|ampicillin-?sulbactam|piperacillin/i,
      pickIf: "Pneumonia distal to obstructing lesion (tumor, foreign body).",
      whyPick: [
        "**Anaerobic coverage** essential — stagnant secretions = polymicrobial",
        "Pip-tazo or ampicillin-sulbactam — single-agent broad cover",
        "**Relieve the obstruction** — bronch, stent, surgery — antibiotics alone fail",
        "Long course: **2–4 weeks** typical",
      ],
      watchOut: [
        { sev: "stop", text: "**Workup the obstruction** — postobstructive PNA in adult = tumor until proven otherwise" },
        { sev: "note", text: "Aspirated foreign body in kids — different workup" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Per CAP / HAP for episode; recurrence inevitable without obstruction relief — bronchoscopy mandatory.",
    evidence: "Society consensus — antibiotic course mirrors community / hospital pneumonia; durable cure requires obstruction relief",
    branches: [
      { label: "Acute episode + planned bronchoscopy / stent / RT", days: "7–10 d",
        detail: "Per CAP / HAP bands; extend slightly while planning definitive intervention",
        matchAgent: /piperacillin|cefepime|ceftriaxone/i },
      { label: "Necrotizing or cavitary post-obstructive", days: "3–6 wk",
        detail: "Per cavitary pneumonia bands; treat until cavity resolves" },
      { label: "Anaerobic / putrid sputum (poor dentition + obstruction)", days: "3–6 wk",
        detail: "Cover anaerobes — metronidazole, clinda, or amox-clav",
        matchAgent: /metronidazole|clindamycin|amoxicillin-?clavulanate/i },
      { label: "Recurrent without obstruction relief", days: "Per episode + suppress",
        detail: "Recurrence cycle; involve thoracic onc + IR; chronic suppression rarely durable" },
    ],
    stopWhen: [
      "Afebrile ≥ 48 h + clinical recovery",
      "Imaging shows resolution distal to obstruction",
      "Obstruction relief plan in place (bronchoscopy, stent, RT)",
      "Oral step-down complete",
      "Minimum 7–10 d (or longer per cavity) completed",
    ],
    extendIf: [
      { text: "**Cavitary / necrotizing** distal disease",
        matchCtx: { severe: true } },
      "Empyema co-existing — per empyema bands + drainage",
      "Persistent obstruction without relief — extend or chronic suppression",
      "Immunocompromised host — extend per ID",
    ],
  },
  monitoring: {
    headline: "Bronchoscopy + tumor workup mandatory; antibiotic alone never durably cures; thoracic onc.",
    items: [
      { sev: "required", what: "**Bronchoscopy + biopsy** at first episode",
        why: "Identifies obstruction etiology — tumor, foreign body, mucus plug, stricture" },
      { sev: "required", what: "**Thoracic oncology + IR consult** for definitive obstruction relief",
        why: "Stent, debulking, RT, or surgery — drives recurrence prevention" },
      { sev: "required", what: "**CT chest with contrast** to characterize obstruction + cavity",
        why: "Defines anatomy + drives bronchoscopy + intervention planning" },
      { sev: "trigger", what: "**Cover anaerobes** if putrid sputum or poor dentition",
        why: "Stagnant secretions distal to obstruction harbor anaerobes" },
      { sev: "trigger", what: "**Workup for empyema** if effusion present",
        why: "Post-obstructive effusions often complicated; drainage if loculated" },
      { sev: "trigger", what: "**Palliative care + goals of care** if metastatic / unresectable",
        why: "Recurrence inevitable; symptom-focused approach often appropriate" },
      { sev: "consider", what: "**Chronic suppression** if obstruction cannot be relieved",
        why: "Reserve for select cases; rarely durable; collateral risk" },
      { sev: "consider", what: "**Pulmonary rehab + smoking cessation**",
        why: "Functional optimization + risk reduction across underlying disease" },
    ],
  },
  rationale: {
    driver: "Post-obstructive pneumonia is a source-control disease — bronchoscopy plus relief of the obstructing tumor, foreign body, mucus plug, or stricture drives durable cure (Abers 2019). The acute episode is treated per CAP / HAP for 7–10 d (ceftriaxone or pip-tazo / cefepime depending on substrate), with anaerobic cover added for putrid sputum, poor dentition, or cavitation where stagnant distal secretions harbor oral anaerobes. Cavitary or necrotizing disease extends to 3–6 wk anchored to radiographic resolution, and thoracic-oncology coordination is mandated for any non-relievable obstruction.",
    guideline: "cap",
    rejected: "Chronic suppressive antibiotics in lieu of obstruction relief were deliberately rejected — Abers (J Thorac Oncol 2019) showed recurrence is inevitable without bronchoscopy + intervention, and suppression rarely produces durable benefit while driving resistance + C. difficile risk. Reflexive anaerobic coverage for every post-obstructive episode was tempered: Rolston (CID 2014) restricts anaerobic add-on to putrid sputum / poor dentition / cavitary disease, not as routine in clear-sputum cases." },
  objections: [
    { q: "Why bronchoscopy first — can we just treat the pneumonia?",
      a: "Post-obstructive pneumonia is a source-control disease — obstruction (tumor, foreign body, mucus plug, extrinsic compression) reseeds the distal airway, and antibiotic courses without obstruction relief produce relapse within weeks. Abers (J Thorac Oncol 2019) and ATS / IDSA [cite:cap] mandate bronchoscopy ± stenting at presentation; treating the pneumonia alone is incomplete care. The bronchoscopy also yields microbiology and tissue diagnosis simultaneously [cite:mono]." },
    { q: "Why extend duration beyond standard CAP 5-7 d?",
      a: "Persistent obstruction sustains the infectious nidus — ATS / IDSA [cite:cap] permits standard duration only after definitive obstruction relief; with residual obstruction, courses extend to 14-21 d or until obstruction is resolved. Post-obstructive empyema, abscess, or necrosis (common substrate) further extends. The duration anchors to source-control adequacy, not the initial pneumonia syndrome." },
    { q: "Why broader empiric cover than typical CAP?",
      a: "Stagnant distal airway substrate favors mixed flora — oral anaerobes, Gram-negative rods (including Klebsiella + Pseudomonas in cancer / radiation patients), and S. aureus dominate vs typical CAP organisms. ATS / IDSA [cite:cap] and Abers (J Thorac Oncol 2019) support beta-lactam-beta-lactamase inhibitor (e.g., piperacillin-tazobactam) or carbapenem in immunocompromised / heavily pretreated hosts. Narrowing follows culture per [cite:stew] de-escalation principles." },
  ],
  research: {
    headline: "Bronchoscopy + tumor workup mandatory; recurrence inevitable without obstruction relief.",
    trials: [
      { name: "Abers J Thorac Oncol 2019",
        n: "Cohort",
        question: "Post-obstructive pneumonia recurrence + outcomes",
        finding: "Recurrence inevitable without obstruction relief; bronchoscopy + IR + RT drive durable cure; chronic suppression rarely effective",
        bias: "Single-center oncology cohort; outcomes vary by malignancy substrate" },
      { name: "Rolston CID 2014",
        n: "Review",
        question: "Antibiotic strategy in post-obstructive pneumonia",
        finding: "Treat per CAP / HAP for acute episode; anaerobic coverage if putrid sputum / poor dentition / cavitation",
        bias: "Pre-modern resistance; principles still hold" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2019,
        topic: "CAP including post-obstructive (Metlay)",
        keypoint: "Treat per primary pneumonia bands for episode; emphasize obstruction relief via bronchoscopy + thoracic onc" },
      { society: "ACCP",
        year: 2017,
        topic: "Lung cancer-associated infection",
        keypoint: "Post-obstructive pneumonia driven by tumor obstruction; bronchoscopy + biopsy + multidisciplinary" },
    ],
    openQuestions: [
      "Chronic suppression for irretrievable obstruction — case-by-case",
      "Antibiotic class selection — depends on prior cultures + local antibiogram",
      "Palliative care timing for metastatic / unresectable — symptom-focused often appropriate",
    ],
  },
};

export default { id: "postobstructive", regimen, decision };
