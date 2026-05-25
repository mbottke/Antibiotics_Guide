/* ===========================================================
   PANCREATIC infection — IAP / APA / ACG / AGA aligned: no
   prophylactic antibiotics in sterile necrosis. =================== */

const regimen = {
  "Documented infection": [
    {
      rx: /carbapenem|meropenem|fluoroquinolone|metronidazole/i,
      pickIf: "Documented infected pancreatic necrosis (FNA-positive or gas on imaging).",
      whyPick: [
        "**Carbapenem (meropenem/imipenem)** — best pancreatic penetration",
        "Alternative: **metronidazole + cipro/levo** — both penetrate well",
        "**No prophylaxis** in sterile necrosis — increases resistant infections without benefit",
        "**Step-up drainage** (PCD → endoscopic/surgical) — open necrosectomy is last resort",
      ],
      watchOut: [
        { sev: "stop", text: "**No empiric antibiotics** for sterile necrosis — IAP/APA, ACG, AGA all agree" },
        { sev: "warn", text: "Fungal infections in long-course antibiotic use — common in necrosis" },
        { sev: "note", text: "Document infection (FNA / gas) before starting — confirms indication" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "2–3 wk for documented infected necrosis + drainage; no antibiotics for sterile necrosis.",
    evidence: "IAP / APA 2013 + ACG 2024 — no prophylaxis in sterile necrosis; carbapenem if documented infection",
    branches: [
      { label: "Documented infected necrosis", days: "2–3 wk",
        detail: "FNA-confirmed or gas-on-imaging infection; carbapenem ± step-down per cultures",
        matchAgent: /meropenem|imipenem|metronidazole/i },
      { label: "Post-drainage (PCD or surgical)", days: "1–2 wk post-drainage",
        detail: "Step-up approach; continue per clinical + drain output / culture data" },
      { label: "Sterile necrosis", days: "No antibiotics",
        detail: "Prophylactic antibiotics do NOT improve outcomes; increase fungal + MDR risk" },
    ],
    stopWhen: [
      "Documented infection cleared (cultures + imaging)",
      "Afebrile ≥ 48 h",
      "Drainage adequate (output decreasing, drain cultures negative)",
      "Clinical improvement (WBC, lipase trend, oral tolerance)",
      "Imaging shows resolution or stable collections",
    ],
    extendIf: [
      { text: "**Multi-organ failure** at presentation or evolving — extend per ICU + ID input",
        matchCtx: { severe: true } },
      "Fungal infection (Candida) in necrosis — extend per antifungal duration",
      "Repeat drainage / surgical necrosectomy needed",
      "Persistent drain output + positive cultures",
    ],
  },
  monitoring: {
    headline: "FNA / gas-on-imaging confirms infection; step-up drainage; avoid prophylaxis in sterile.",
    items: [
      { sev: "required", what: "**Confirm infection** before starting antibiotics — FNA or gas on imaging",
        why: "Sterile necrosis does NOT benefit from antibiotics; prophylaxis drives MDR + fungal infections" },
      { sev: "required", what: "**Step-up drainage approach** — PCD → endoscopic → surgical",
        why: "Minimally invasive first; PANTER trial supports step-up over upfront surgery" },
      { sev: "required", what: "**Daily clinical + lipase trend** + imaging at 7-14 d intervals",
        why: "Pancreatic infections evolve over weeks; imaging guides drain repositioning + extension" },
      { sev: "trigger", what: "**Antifungal coverage** (echinocandin) if persistent infection + Candida risk",
        why: "Long-course antibiotics + TPN drive Candida overgrowth; FNA-positive guides drug choice" },
      { sev: "trigger", what: "**Surgical consult** for walled-off necrosis or step-up failure",
        why: "Endoscopic necrosectomy or open surgical drainage if percutaneous insufficient" },
      { sev: "consider", what: "**Nutritional support** — enteral preferred over parenteral",
        why: "Enteral nutrition preserves gut barrier + reduces bacterial translocation" },
    ],
  },
  rationale: {
    driver: "Antibiotics in acute pancreatitis are reserved for documented infected necrosis — FNA-positive culture or gas-on-imaging — NOT for prophylaxis in sterile necrosis. Villatoro (Cochrane 2010) showed no mortality benefit and increased fungal + MDR risk with empiric prophylaxis. When infection is documented, a carbapenem (meropenem 1 g q8h or imipenem) penetrates necrotic pancreatic tissue and covers enteric GNR + anaerobes; duration is 2–3 wk and tracks the drainage procedure, not a fixed calendar. The Dutch step-up approach (PANTER, NEJM 2010) — PCD → endoscopic → surgical necrosectomy — drops major complications and mortality vs upfront open surgery.",
    guideline: "acg_pancreatitis",
    rejected: "Prophylactic antibiotics in sterile necrosis were deliberately rejected — PROPATRIA (Lancet 2008) showed probiotics INCREASED mortality in severe pancreatitis, and Villatoro confirmed no benefit and harm (fungal + MDR overgrowth) from antibiotic prophylaxis. Upfront open necrosectomy was also rejected: the Dutch step-up trial established minimally invasive escalation as superior, with ~35% resolving on PCD alone. Routine antifungal prophylaxis is similarly unjustified absent documented Candida infection." },
  objections: [
    { q: "Why no prophylactic antibiotics in sterile necrosis?",
      a: "Villatoro (Cochrane 2010 meta) showed no mortality benefit from prophylactic antibiotics in sterile necrosis and an increase in fungal + MDR overgrowth; PROPATRIA (Lancet 2008, n=298) [cite:propatria] showed probiotic prophylaxis actually INCREASED mortality in severe pancreatitis. ACG 2024 [cite:acg_pancreatitis] mandates antibiotics ONLY for documented infected necrosis (FNA-positive or gas-on-imaging). Reflexive prophylaxis in sterile disease is harm without benefit." },
    { q: "Why carbapenem when infection documented — overkill?",
      a: "Documented infected pancreatic necrosis is a high-burden, deep-tissue, polymicrobial GNR + anaerobic substrate where adequate pancreatic penetration matters — meropenem 1 g q8h or imipenem penetrate necrotic pancreatic tissue better than most alternatives and cover the substrate per ACG 2024 [cite:acg_pancreatitis]. Pip-tazo is acceptable for moderate disease + susceptible organism but carbapenem is the audit-defensible first-line in severe documented infection. Step-down on culture data drives narrowing." },
    { q: "Why step-up not upfront necrosectomy — surgery seems definitive?",
      a: "PANTER (NEJM 2010, n=88) [cite:dutchstepup] established minimally invasive step-up (PCD → endoscopic → VARD if needed) reduces major complications + mortality vs primary open necrosectomy — ~35% resolve on PCD alone, sparing surgery. ACG 2024 [cite:acg_pancreatitis] endorses step-up as standard; upfront open surgery in modern pancreatitis is hard to defend. Surgical timing follows the step-up algorithm: drain first, escalate only on failure." },
    { q: "Why no routine echinocandin — fungal infection seems common?",
      a: "Routine antifungal prophylaxis in pancreatic necrosis was deliberately rejected — Candida colonization is common but invasive infection in immunocompetent hosts is rare, and reflexive echinocandin drives resistance without benefit per ACG 2024 [cite:acg_pancreatitis]. Reserve echinocandin for documented FNA-positive Candida, protracted necrosis with risk factors (TPN, prolonged antibiotics, immunocompromise), or post-necrosectomy fungal isolates. Species-driven narrowing applies." },
  ],
  research: {
    headline: "PROPATRIA + Dutch step-up established no antibiotic prophylaxis in sterile necrosis; documented infection drives course.",
    trials: [
      { name: "Dutch Step-up NEJM 2010 (van Santvoort)",
        n: "88",
        question: "Step-up (PCD then VARD) vs primary open necrosectomy",
        finding: "Step-up reduced major complications + mortality; PCD alone resolved ~35% without further intervention",
        bias: "European cohort; reproducible elsewhere" },
      { name: "PROPATRIA Lancet 2008",
        n: "298",
        question: "Probiotic prophylaxis in severe pancreatitis",
        finding: "Probiotics INCREASED mortality — established no probiotic prophylaxis; informed broader no-prophylaxis stance",
        bias: "Specific probiotic mix; some debate about safety class effect" },
      { name: "Villatoro Cochrane 2010",
        n: "Meta",
        question: "Prophylactic antibiotics in sterile pancreatic necrosis",
        finding: "No mortality benefit; increased fungal + MDR risk; established NO prophylactic antibiotics for sterile necrosis",
        bias: "Heterogeneous severity scoring; conclusions consistent" },
    ],
    guidelines: [
      { society: "ACG",
        year: 2024,
        topic: "Acute pancreatitis (Crockett)",
        keypoint: "No antibiotic prophylaxis in sterile necrosis; FNA or gas-on-imaging for documented infection; carbapenem first-line" },
      { society: "IAP / APA",
        year: 2013,
        topic: "International pancreatitis guidance",
        keypoint: "Aligned with ACG; step-up approach for infected necrosis; early enteral nutrition" },
    ],
    openQuestions: [
      "Optimal step-up timing — PCD vs delayed open vs VARD; case-by-case",
      "Routine FNA vs imaging-based diagnosis of infected necrosis — practice variation",
      "Selective antifungal use in protracted necrosis — limited evidence",
    ],
  },
};

export default { id: "pancreatic", regimen, decision };
