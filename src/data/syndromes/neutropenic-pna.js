/* ===========================================================
   PNEUMONIA IN NEUTROPENIC / TRANSPLANT HOST — broad bacterial
   + mold + viral coverage; ANC recovery drives duration. ====== */

const regimen = {
  "Bacterial empiric": [
    {
      rx: /piperacillin|cefepime|meropenem/i,
      pickIf: "Pneumonia in neutropenic / transplant host with ANC < 500.",
      whyPick: [
        "**Antipseudomonal β-lactam first-line** per IDSA 2018 (Taplitz)",
        "Cefepime or pip-tazo for low-risk; **meropenem if septic shock + ESBL risk + prior broad antibiotics**",
        "**Add vancomycin** at presentation per local MRSA rate + line presence",
        "**CT chest within 24 h** — halo / reverse halo / cavitation predicts mold; CXR insensitive",
      ],
      watchOut: [
        { sev: "warn", text: "**Workup fungal early** — galactomannan (serum + BAL) + β-D-glucan biweekly; CT halo/air-crescent drives mold-active escalation" },
        { sev: "warn", text: "**Viral co-pathogens (CMV, RSV, influenza, COVID)** common — viral PCR panel + serology in parallel" },
        { sev: "note", text: "Bronchoscopy / BAL early unless thrombocytopenia / hypoxia contraindicates — diagnostic yield substantial" },
      ],
    },
  ],
  "MDR-Pseudomonas / CRAB salvage": [
    {
      rx: /ceftolozane-?tazobactam|ceftazidime-?avibactam|cefiderocol|sulbactam-?durlobactam/i,
      pickIf: "DTR-Pseudomonas / KPC-CRE / CRAB / metallo-CRE confirmed or strongly suspected.",
      whyPick: [
        "**Mechanism-typing drives choice** per IDSA AMR-GN 2024",
        "**Ceftolozane-tazo** for DTR-Pseudomonas; **ceftaz-avi** (+ aztreonam) for metallo",
        "**Sulbactam-durlobactam** first-line for CRAB (XACDURO 2023)",
        "**Cefiderocol** for pan-resistant salvage",
      ],
      watchOut: [
        { sev: "warn", text: "**ID consult mandatory** — carbapenemase typing + dose intensity drive outcome" },
        { sev: "warn", text: "Renal-adjusted; TDM where available" },
        { sev: "note", text: "Combine with inhaled tobi/colistin for pulmonary source — adjunct only" },
      ],
    },
  ],
  "Mold-active empiric (persistent fever ≥ 96 h)": [
    {
      rx: /voriconazole|isavuconazole|posaconazole|amphotericin|caspofungin|micafungin/i,
      pickIf: "Persistent neutropenic fever ≥ 96 h on broad antibiotics, OR CT halo/cavitation, OR confirmed mold.",
      whyPick: [
        "**Voriconazole** first-line for IPA — VfR / SECURE; load 6 mg/kg q12h × 2 then 4 mg/kg q12h",
        "**Isavuconazole** alternative — fewer interactions + visual AEs (SECURE 2018)",
        "**Liposomal amphotericin + isavuconazole** for mucormycosis — surgery + ID + thoracic",
        "**Echinocandin** for empiric Candida / breakthrough during azole prophylaxis",
      ],
      watchOut: [
        { sev: "stop", text: "**Vori + rifampin → vori levels drop** below MIC — switch one (CYP3A4 induction)" },
        { sev: "warn", text: "**Voriconazole TDM** trough 1–5.5 mg/L at day 5 — sub-target drives failure, supra drives toxicity" },
        { sev: "warn", text: "**Reduce immunosuppression** per transplant team — single highest-impact intervention" },
        { sev: "note", text: "EORTC/MSGERC 2020 — preemptive (test-driven) vs empiric — institutional protocol" },
      ],
    },
  ],
  "PJP coverage": [
    {
      rx: /trimethoprim-?sulfamethoxazole|sulfamethoxazole/i,
      pickIf: "Hypoxia + bilateral interstitial infiltrate + HIV / chronic steroid / transplant — PJP suspected or confirmed.",
      whyPick: [
        "**TMP-SMX 15–20 mg/kg/d TMP** divided q6–8h × 21 d",
        "**Add steroids** if PaO₂ < 70 or A-a > 35 — prednisone 40 mg BID, then taper",
        "**Secondary prophylaxis** after acute episode — TMP-SMX SS daily during ongoing IS",
      ],
      watchOut: [
        { sev: "warn", text: "**TMP-SMX hyperkalemia + AKI + cytopenias** at high dose — monitor K, SCr, CBC q3 d" },
        { sev: "warn", text: "**Sulfa allergy** — desensitize OR pentamidine 4 mg/kg/d (toxicity profile worse)" },
        { sev: "note", text: "Diagnosis: induced sputum / BAL PCR > silver stain; β-D-glucan supportive" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Broad bacterial + mold + viral coverage; duration anchored to pathogen + ANC / immune recovery.",
    evidence: "IDSA 2018 + EORTC — empiric anti-pseudomonal + mold-active workup; duration per pathogen + ≥ 7 d after ANC > 500",
    branches: [
      { label: "Bacterial CAP / HAP equivalent + ANC recovering", days: "7–14 d",
        detail: "Per CAP / HAP bands; extend until ≥ 5 d after ANC > 500 + clinical recovery",
        matchAgent: /piperacillin|cefepime|meropenem/i },
      { label: "Invasive pulmonary aspergillosis (IPA) confirmed / probable", days: "6–12 wk",
        detail: "Voriconazole first-line; isavuconazole alternative; per EORTC criteria + ANC + steroid trajectory",
        matchAgent: /voriconazole|isavuconazole|posaconazole/i },
      { label: "PJP (Pneumocystis jirovecii)", days: "21 d",
        detail: "TMP-SMX × 21 d; add steroids if PaO₂ < 70 or A-a > 35; secondary prophylaxis after",
        matchAgent: /trimethoprim-?sulfamethoxazole|sulfamethoxazole/i },
      { label: "CMV pneumonitis", days: "≥ 14 d + VL clear",
        detail: "Ganciclovir or foscarnet until viral load undetectable + ≥ 14 d total; reduce immunosuppression per transplant ID",
        matchAgent: /ganciclovir|foscarnet/i },
      { label: "Mucormycosis (Rhizopus, Mucor)", days: "Per IFI bands + surgery",
        detail: "Liposomal amphotericin + surgical debridement; ID + thoracic surgery",
        matchAgent: /amphotericin|isavuconazole|posaconazole/i },
      { label: "Persistent neutropenic fever + non-response", days: "Until ANC recovers",
        detail: "Add empiric antifungal (echinocandin or vori or ampho) per IDSA + image-driven workup; continue until ANC > 500 + clinical resolution" },
    ],
    stopWhen: [
      "Pathogen identified + pathogen-specific duration met",
      "ANC > 500 + sustained for ≥ 48 h",
      "Afebrile + clinical recovery",
      "Imaging shows resolution / stability",
      "Antifungal prophylaxis transitioned per protocol",
    ],
    extendIf: [
      { text: "**Persistent neutropenia / immunosuppression** — extend until recovery + clinical resolution",
        matchCtx: { severe: true } },
      "Invasive fungal infection — per IFI bands (weeks to months)",
      "Cavitary or necrotizing — per cavitary bands + surgery",
      "GVHD or rejection — coordinate with transplant team",
    ],
  },
  monitoring: {
    headline: "ID + transplant consult; galactomannan + BDG; CT chest early; mold-active empiric for persistent fever.",
    items: [
      { sev: "required", what: "**ID + transplant team consult** at presentation",
        why: "Pathogen + drug interaction + immunosuppression management requires specialist input" },
      { sev: "required", what: "**CT chest within 24 h** of presentation",
        why: "Halo / reverse halo / cavitation predict mold; CXR insensitive in neutropenic host" },
      { sev: "required", what: "**Serum galactomannan + 1,3-β-D-glucan** twice weekly",
        why: "Serial monitoring drives mold-active escalation + duration in IPA" },
      { sev: "required", what: "**Bronchoscopy + BAL** if non-diagnostic CT or empiric failure by 96 h",
        why: "Targeted pathogen identification — bacterial, mold, viral, PJP" },
      { sev: "trigger", what: "**Empiric antifungal** if persistent fever ≥ 96 h on broad antibiotics",
        why: "IDSA 2018 — empiric mold-active therapy reduces breakthrough IFI",
        matchAgent: /voriconazole|isavuconazole|caspofungin|micafungin|amphotericin/i },
      { sev: "trigger", what: "**Reduce immunosuppression** if feasible per transplant team",
        why: "Single highest-impact intervention in transplant pneumonia outcome" },
      { sev: "trigger", what: "**Voriconazole TDM** — trough 1–5.5 mg/L for IPA",
        why: "Sub-target drives failure; supra-target drives toxicity; check at day 5",
        matchAgent: /voriconazole/i },
      { sev: "trigger", what: "**Steroids for PJP** if PaO₂ < 70 or A-a gradient > 35",
        why: "Mortality benefit in moderate-severe PJP; taper over 21 d",
        matchBranch: ["PJP (Pneumocystis jirovecii)"] },
      { sev: "consider", what: "**Respiratory viral panel** — RSV, flu, COVID, parainfluenza, metapneumo",
        why: "Common in transplant + can drive bacterial / fungal superinfection" },
      { sev: "consider", what: "**Secondary prophylaxis** after PJP / IPA / mucor per pathogen",
        why: "Recurrence high without prophylaxis during ongoing immunosuppression" },
    ],
  },
  rationale: {
    driver: "Pneumonia in the neutropenic / transplant host demands broad bacterial + mold + viral coverage with simultaneous diagnostic work — CT chest within 24 h (CXR is insensitive without inflammatory cells), serial galactomannan + BDG, and BAL when imaging or empiric therapy fails. Empiric backbone is anti-pseudomonal β-lactam (pip-tazo, cefepime, or meropenem) ± vancomycin per IDSA 2018; mold-active therapy (voriconazole or isavuconazole) is added at 96 h of persistent fever or sooner on CT halo / reverse halo. Duration anchors to pathogen + ANC > 500 + clinical resolution.",
    guideline: "fn",
    rejected: "Empiric narrow β-lactam without anti-pseudomonal cover was deliberately rejected — IDSA 2018 mandates anti-pseudomonal coverage from the first dose because GNR + P. aeruginosa bacteremia drive early mortality and a missed dose halves survival. Withholding mold-active therapy at 96 h of persistent fever was rejected: Cordonnier EORTC and IDSA establish empiric or preemptive (galactomannan + CT driven) antifungal escalation; delay past 96 h drives breakthrough invasive fungal infection." },
  objections: [
    { q: "Why empiric mold cover at 96 h — can't we wait for galactomannan?",
      a: "Persistent fever ≥ 96 h on broad antibacterial cover in profound neutropenia predicts invasive fungal disease with mortality > 30% if treatment is delayed — IDSA febrile neutropenia guidance [cite:fn] and Cordonnier (CID 2009 EORTC) anchor empiric mold-active therapy (voriconazole, isavuconazole, or liposomal amphotericin) at the 96-h threshold. Galactomannan + BDG monitoring run in parallel but should not delay empiric escalation; SECURE (Maertens NEJM 2018) [cite:vfneo] established isavuconazole non-inferior to voriconazole." },
    { q: "Why CT chest within 24 h — CXR should suffice for screening?",
      a: "Chest X-ray is insensitive in neutropenic hosts because the lack of granulocytes blunts inflammatory infiltrate — halo sign, reverse halo, cavitation, and small nodules diagnostic of invasive pulmonary aspergillosis are visible only on CT. IDSA [cite:fn] mandates CT at fever onset in profound neutropenia (ANC < 100 expected > 7 d). Delayed imaging delays mold cover and worsens outcomes; CT is also the substrate for bronchoscopy / biopsy targeting." },
    { q: "Why broad anti-pseudomonal empiric — narrow if low MASCC?",
      a: "Febrile neutropenia is presumed Gram-negative bacteremia until proven otherwise — cefepime, piperacillin-tazobactam, or meropenem are first-line per IDSA [cite:fn] because P. aeruginosa carries highest mortality and demands timely adequate cover. MASCC score [cite:mascc] stratifies low-risk patients for outpatient oral (cipro + amox-clav per Taplitz [cite:taplitzfn]); inpatient substrate (hemodynamically unstable, prolonged neutropenia, comorbid) keeps IV anti-pseudomonal pending culture results [cite:amrgn]." },
    { q: "Why ID consult mandatory — isn't this oncology's call?",
      a: "Transplant + heme-malignancy infections (PJP, CMV, mold, atypical mycobacteria, nocardia) require pathogen-specific diagnostics and antifungal stewardship Fishman (NEJM 2007) [cite:fishman] frames as ID specialty domain. IDSA [cite:fn] recommends ID involvement at fever onset for persistent neutropenia. Secondary prophylaxis after IPA / PJP / mucor episodes requires ID-driven planning to balance breakthrough risk against drug-drug interactions with immunosuppression." },
  ],
  research: {
    headline: "CT chest within 24 h; galactomannan + BDG monitoring; empiric mold-active for persistent fever ≥ 96 h.",
    trials: [
      { name: "Cordonnier CID 2009 (EORTC)",
        n: "284",
        question: "Empiric vs preemptive antifungal in persistent neutropenic fever",
        finding: "Preemptive (test-driven by galactomannan + CT) achieved similar outcomes with lower antifungal exposure; both strategies acceptable",
        bias: "European cohort; institutional infrastructure variable" },
      { name: "Marr Blood 2015 (SECURE)",
        n: "527",
        question: "Isavuconazole vs voriconazole in invasive mold infection (incl. neutropenic)",
        finding: "Isavuconazole non-inferior; fewer drug interactions + hepatic/visual AEs; alternative first-line",
        bias: "Industry-sponsored; cost differential" },
      { name: "Maertens NEJM 2018",
        n: "545",
        question: "Isavuconazole for invasive aspergillosis",
        finding: "Non-inferior to voriconazole; supports class equivalence with safety advantage",
        bias: "Same registration trial; subset analysis applies" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2018,
        topic: "Neutropenic fever (Taplitz update)",
        keypoint: "Anti-pseudomonal β-lactam + risk-stratified vancomycin; empiric antifungal at 96 h persistent fever" },
      { society: "EORTC / MSGERC",
        year: 2020,
        topic: "Invasive fungal disease criteria",
        keypoint: "Galactomannan + BDG + CT halo guide preemptive vs empiric antifungal; mold-active for persistent" },
    ],
    openQuestions: [
      "Empiric vs preemptive antifungal strategy — institutional infrastructure-dependent",
      "Voriconazole vs isavuconazole vs posaconazole — relative safety + cost",
      "Reduced-IS coordination — single highest-impact intervention in transplant pneumonia",
    ],
  },
};

export default { id: "neutropenic-pna", regimen, decision };
