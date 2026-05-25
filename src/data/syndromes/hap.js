/* ===========================================================
   HAP / VAP — IDSA 2016 (Kalil). 7 d for most; extend by
   pathogen + clinical response. =================================== */

const regimen = {
  "Empiric backbone": [
    {
      rx: /piperacillin/i,
      pickIf: "Standard HAP without ESBL risk; broad enough to cover gut anaerobes.",
      whyPick: [
        "**Antipseudomonal + anaerobic + GNR** in one agent",
        "Extended-infusion **4-hour dosing** at MIC ≥ 4 — improves outcomes in VAP",
        "Preferred when aspiration suspected (anaerobic cover)",
        "Cheapest of the three antipseudomonal β-lactams",
      ],
      watchOut: [
        { sev: "warn", text: "**Pip-tazo + vanco → AKI** — favor cefepime backbone if renal-fragile" },
        { sev: "warn", text: "ESBL inoculum effect — switch to meropenem if not improving" },
        { sev: "note", text: "Duration: **7 days** for most HAP/VAP (PneumA, IDSA) — fixed duration beats clinical judgment" },
      ],
    },
    {
      rx: /cefepime/i,
      pickIf: "HAP without aspiration risk; renal-fragile patient where pip-tazo+vanco AKI feared.",
      whyPick: [
        "**Cleanest pseudomonal β-lactam** — no anaerobes (less VRE selection)",
        "**Avoids the pip-tazo + vanco AKI** signal",
        "Renally cleared — easy adjustment in evolving AKI",
      ],
      watchOut: [
        { sev: "stop", text: "**No anaerobic cover** — add metronidazole if aspiration / abscess" },
        { sev: "warn", text: "**Neurotoxicity** if CrCl < 60 and not dose-reduced (myoclonus, NCSE)" },
        { sev: "note", text: "Equivalent efficacy to pip-tazo in VAP trials with lower nephrotoxicity signal" },
      ],
    },
    {
      rx: /meropenem/i,
      pickIf: "Prior ESBL colonization or broad β-lactam in last 90 days.",
      whyPick: [
        "**Reliable ESBL kill** — pip-tazo/cefepime fail at inoculum",
        "Broadest single-agent (anaerobes + GNR + most enterococci)",
        "Use for **septic shock** while waiting for culture data",
      ],
      watchOut: [
        { sev: "warn", text: "**↓ valproate 60–90%** — never combine in epilepsy" },
        { sev: "warn", text: "Promotes CRE — narrow ASAP once cultures back" },
        { sev: "note", text: "Stewardship-sensitive — document the indication" },
      ],
    },
  ],
  "Add MRSA": [
    {
      rx: /vancomycin/i,
      pickIf: "Prior MRSA, septic shock, recent broad abx, or local MRSA HAP > 10–20%.",
      whyPick: [
        "**First-line MRSA pneumonia** — cheap, bactericidal, AUC-guided",
        "AUC **400–600** target (Bayesian preferred over trough-only)",
        "Load **25–30 mg/kg ABW** in shock — don't underdose hour 1",
      ],
      watchOut: [
        { sev: "warn", text: "**AUC > 600** — sharp nephrotoxicity rise; troughs alone underdose" },
        { sev: "warn", text: "**+ pip-tazo AKI signal** — consider cefepime backbone if renal-fragile" },
        { sev: "warn", text: "**Lung penetration only 17%** of plasma — high target needed" },
        { sev: "note", text: "Linezolid arguable advantage in MRSA pneumonia (lung penetration); meta-analyses mixed" },
      ],
    },
    {
      rx: /linezolid/i,
      pickIf: "Vancomycin failure, MIC > 1, renal-fragile, or AKI-developing.",
      whyPick: [
        "**Superior lung penetration** — alveolar fluid > plasma",
        "**No renal dose adjustment** — same dose in AKI",
        "Oral = IV bioavailability (~100%) — easy step-down",
        "Effective at vanco-MIC creep > 1.5",
      ],
      watchOut: [
        { sev: "stop", text: "**Linezolid + SSRI/MAOI** — serotonin syndrome; stop SSRI or pick another agent" },
        { sev: "warn", text: "**> 14 days** — cytopenias, optic + peripheral neuropathy, lactic acidosis" },
        { sev: "warn", text: "Bacteriostatic — not first-line for **MRSA bacteremia**" },
        { sev: "note", text: "Cost ~$200/day vs vanco ~$10/day — use when indicated, not default" },
      ],
    },
  ],
  "Double GNR (high risk)": [
    {
      rx: /aminoglycoside|fluoroquinolone|FQ/i,
      pickIf: "Septic shock + prior MDR-GNR colonization or known high local resistance.",
      whyPick: [
        "**Add aminoglycoside** (tobramycin) — synergy, rapid bactericidal, no β-lactam cross-resistance",
        "**Add cipro/levo** if aminoglycoside avoided — oral option, easier",
        "**Stop the 2nd agent at 48–72 h** once susceptibilities back — don't ride double cover",
      ],
      watchOut: [
        { sev: "warn", text: "**Aminoglycoside nephro/ototoxicity** — limit to 48–72 h; check trough" },
        { sev: "warn", text: "**FQ tendinopathy / QT** — avoid in elderly + steroids" },
        { sev: "note", text: "Most HAP/VAP guidelines: **single agent suffices** for most — reserve double for true MDR risk" },
      ],
    },
  ],
  "DTR-Pseudomonas / CRAB salvage (IDSA AMR-GN 2024)": [
    {
      rx: /ceftolozane-?tazobactam/i,
      pickIf: "DTR-Pseudomonas confirmed or carbapenem-resistant Pseudomonas HAP/VAP.",
      whyPick: [
        "**First-line for DTR-Pseudomonas** per IDSA AMR-GN 2024",
        "ASPECT-NP NEJM 2019 non-inferior in HAP/VAP",
        "**3 g IV q8h** for pneumonia — higher than UTI dose",
      ],
      watchOut: [
        { sev: "warn", text: "**NOT for KPC / metallo / OXA-48** — use ceftaz-avi or cefiderocol" },
        { sev: "warn", text: "Renal-adjusted dosing — recheck SCr q48h" },
        { sev: "note", text: "ID + carbapenemase typing mandatory" },
      ],
    },
    {
      rx: /ceftazidime-?avibactam/i,
      pickIf: "KPC-CRE or OXA-48-producing GNR HAP/VAP.",
      whyPick: [
        "**First-line for KPC-CRE + OXA-48** per IDSA AMR-GN 2024",
        "Active vs Ambler A + C + some D β-lactamases",
        "**Combine with aztreonam** for metallo-CRE",
      ],
      watchOut: [
        { sev: "warn", text: "**NOT for metallo-CRE alone** — pair with aztreonam or use cefiderocol" },
        { sev: "warn", text: "Resistance mutations emerging at < 5% — TDM if salvage" },
        { sev: "note", text: "Extended-infusion q8h — 2.5 g over 2 h" },
      ],
    },
    {
      rx: /sulbactam-?durlobactam/i,
      pickIf: "Carbapenem-resistant Acinetobacter baumannii (CRAB) HAP/VAP — first-line per IDSA AMR-GN 2024.",
      whyPick: [
        "**XACDURO Lancet ID 2023** — first-line CRAB by IDSA AMR-GN 2024",
        "Sulbactam targets Acinetobacter PBP3; durlobactam protects from β-lactamases",
        "**Replaces polymyxin combinations** for most CRAB",
      ],
      watchOut: [
        { sev: "stop", text: "**Acinetobacter only** — narrow spectrum; not for other GNR" },
        { sev: "warn", text: "Limited real-world experience — coordinate with ID" },
        { sev: "note", text: "1 g IV q6h each component — renal-adjusted" },
      ],
    },
    {
      rx: /cefiderocol/i,
      pickIf: "Pan-resistant Gram-negative (metallo-CRE / CRAB / Stenotrophomonas) salvage.",
      whyPick: [
        "**Siderophore cephalosporin** — exploits bacterial iron-uptake to penetrate",
        "Active vs **metallo-CRE (NDM/VIM/IMP)** — only monotherapy option",
        "Broad GNR including S. maltophilia",
      ],
      watchOut: [
        { sev: "warn", text: "**CREDIBLE-CR signal** of increased mortality in Acinetobacter subset — controversial; consider sulbactam-durlobactam first for CRAB" },
        { sev: "warn", text: "Renal-adjusted; extended infusion 3 h" },
        { sev: "note", text: "Reserve for pan-resistant where no alternative" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "7 d for most HAP/VAP regardless of pathogen; longer for non-fermenting GNR + immunocompromise.",
    evidence: "PneumA 2003 + IDSA 2016 — 7 d vs 15 d non-inferior; same for Pseudomonas in non-immunocompromised",
    branches: [
      { label: "Standard HAP / VAP, clinical response", days: "7 d",
        detail: "Fixed-duration regimen non-inferior to clinical-guided in most pathogens" },
      { label: "Non-fermenting GNR + immunocompromised", days: "10–14 d",
        detail: "Pseudomonas / Acinetobacter / Stenotrophomonas with immunocompromise; ID-driven",
        matchAgent: /ceftolozane|ceftazidime-?avibactam/i },
      { label: "Necrotizing / cavitary HAP", days: "3–4 wk",
        detail: "Tissue invasion + cavitation extends per radiographic + clinical response" },
      { label: "MRSA bacteremia + HAP source", days: "≥ 14 d",
        detail: "Bacteremia duration drives total; TEE indicated",
        matchAgent: /daptomycin/i },
    ],
    stopWhen: [
      "Afebrile ≥ 48 h",
      "WBC normalizing",
      "Ventilator settings improving (FiO₂, PEEP) if VAP",
      "Cultures negative or appropriately treated",
      "No persistent purulent secretions / new infiltrates",
      "Minimum 7 d completed",
    ],
    extendIf: [
      { text: "**Pseudomonas / Acinetobacter / Stenotrophomonas** + immunocompromised host",
        matchCtx: { pseudoRisk: true } },
      "Necrotizing or cavitary disease on imaging",
      { text: "**MRSA bacteremia + pulmonary source** — bacteremia duration drives total",
        matchCtx: { mrsaRisk: true } },
      "Empyema or lung abscess — add drainage + extend per source",
      "Clinical non-response by day 5 — re-eval pathogen + diagnosis before reflexive extension",
    ],
  },
  monitoring: {
    headline: "CPIS / clinical scores at 72 h; repeat sputum / ETA only if non-response; AUC vanco.",
    items: [
      { sev: "required", what: "**Clinical pulmonary infection score (CPIS)** trend at 72 h",
        why: "CPIS ≤ 6 at 72 h supports shorter course; ≥ 7 supports re-workup" },
      { sev: "required", what: "**Vancomycin AUC 400–600** if MRSA empiric or confirmed",
        why: "Both under- and over-target linked to worse outcomes + AKI; Bayesian preferred",
        matchAgent: /vancomycin/i },
      { sev: "required", what: "**Daily ventilator + sputum assessment** if VAP — settings + purulence",
        why: "Improving settings + decreasing purulent secretions are clinical proxies for response" },
      { sev: "trigger", what: "**Repeat ETA / BAL** if non-response by day 4",
        why: "MDR pathogen evolution + fungal / viral co-pathogens common in VAP" },
      { sev: "trigger", what: "**MRSA nares PCR** at presentation if empiric vanco started",
        why: "Negative result drives early vanco stop (NPV ~96%)",
        matchAgent: /vancomycin|linezolid/i },
      { sev: "trigger", what: "**Daily SCr** on combination + age + renal substrate",
        why: "Vanco + pip-tazo AKI signal; renal-fragile substrate amplifies",
        matchCtx: { any: [{ crcl: { lt: 60 } }, { age: { gte: 75 } }] } },
      { sev: "trigger", what: "**De-escalation review at 48–72 h** on culture data",
        why: "Continued broad therapy in HAP drives MDR resistance + collateral damage" },
      { sev: "consider", what: "Procalcitonin trend if duration debate",
        why: "Falling PCT in HAP supports shorter course" },
      { sev: "consider", what: "Aspergillus galactomannan if immunocompromised + non-response",
        why: "Invasive fungal pneumonia in immunocompromised drives empiric β-lactam failure" },
    ],
  },
  rationale: {
    driver: "HAP / VAP empirics target the nosocomial substrate: anti-pseudomonal β-lactam (cefepime, pip-tazo, or meropenem if recent broad exposure) + MRSA cover (vancomycin or linezolid) when risk factors are present. Pathogen-directed narrowing at 48–72 h is mandated. 7 d holds for most pathogens including Pseudomonas in non-immunocompromised hosts — PneumA established this 20+ years ago and Kalil 2016 confirmed across pathogens. Extended-infusion β-lactams improve PK target attainment in critical illness.",
    guideline: "hapvap",
    rejected: "The legacy ≥ 14-d course for non-fermenting GNR was deliberately rejected — PneumA (JAMA 2003) and the IDSA 2016 meta-analysis both showed 8–7 d non-inferior to 15 d, including the Pseudomonas subgroup in non-immunocompromised patients. Routine inhaled adjunctive antibiotics for MDR VAP were rejected: IASIS and INHALE trials both negative." },
  objections: [
    { q: "Why 7 d for Pseudomonas — should this not be 14?",
      a: "PneumA (Chastre JAMA 2003, n=401) established 8 d non-inferior to 15 d in VAP overall, and importantly in the Pseudomonas subgroup of non-immunocompromised patients [cite:pneuma]. IDSA 2016 meta-analysis [cite:hapvap] confirmed 7 d non-inferior across pathogens. The legacy 14-d Pseudomonas course was driven by inoculum fear, not outcomes; extend only for immunocompromise, cavitation, persistent purulence, or bacteremic pulmonary source." },
    { q: "Why empiric MRSA + Pseudomonas for ward HAP?",
      a: "IDSA 2016 HAP/VAP guidance limits dual MRSA + anti-pseudomonal cover to risk-positive substrate: IV antibiotics within 90 d, septic shock at presentation, ARDS, ≥ 5 d hospitalization before HAP, or unit MRSA prevalence > 10-20% [cite:hapvap]. For stable ward HAP without these features, mono-anti-pseudomonal cover (cefepime or pip-tazo) is appropriate; reflexive vancomycin invites AKI and selects VRE. MRSA nares PCR enables 24-48 h vanco stop when negative." },
    { q: "Why not add inhaled colistin for MDR VAP?",
      a: "Adjunctive inhaled antibiotics for MDR VAP were rejected — IASIS and INHALE trials both negative for survival or clinical cure in MDR Gram-negative VAP. Aerosolized colistin has nephrotoxicity and bronchospasm risk without offsetting benefit when systemic therapy adequately dosed (extended-infusion β-lactam to PK target) [cite:hapvap]. Reserve inhaled adjuncts for extreme-resistance scenarios with ID input — not as routine VAP empirics." },
    { q: "Why extended-infusion β-lactam instead of standard?",
      a: "Critical illness alters PK — increased volume of distribution, augmented renal clearance, and hypoalbuminemia all reduce time-above-MIC for β-lactams. Extended (3-4 h) or continuous-infusion cefepime, pip-tazo, and meropenem improve PK target attainment (% T > MIC) substantially in VAP per Roberts (Lancet ID 2014) and BLISS (2018); IDSA endorses for high-MIC organisms and critical illness [cite:hapvap]. Especially valuable when MIC is at the susceptibility breakpoint." },
  ],
  research: {
    headline: "Fixed 7-day course non-inferior to clinical-guided in most HAP/VAP — PneumA established it 20+ years ago.",
    trials: [
      { name: "PneumA Chastre JAMA 2003",
        n: "401",
        question: "8 d vs 15 d in VAP",
        finding: "8 d non-inferior overall; same for Pseudomonas in non-immunocompromised — original short-course evidence",
        bias: "Pseudomonas subgroup small; later trials confirmed but generated lingering debate" },
      { name: "Kalil IDSA 2016 Guidelines + meta-analysis",
        n: "Multiple trials",
        question: "Short-course validity across pathogens in HAP/VAP",
        finding: "7 d standard adequate for most HAP/VAP including Pseudomonas in non-immunocompromised hosts",
        bias: "Synthesizes RCTs; some heterogeneity in severity scoring" },
      { name: "DALI Lancet ID 2014",
        n: "248",
        question: "Pharmacokinetic adequacy of β-lactams in ICU",
        finding: "Hours-above-MIC commonly inadequate at standard dosing — supports extended-infusion β-lactam in severe VAP",
        bias: "PK endpoints; clinical outcome benefit suggestive not definitive" },
      { name: "ZEPHyR + EPIC-2/3",
        n: "Various",
        question: "Linezolid vs vancomycin in MRSA HAP",
        finding: "Linezolid clinical cure higher in confirmed MRSA HAP (post-hoc subset); both options remain first-line",
        bias: "Industry-sponsored; mortality outcomes equivalent" },
    ],
    guidelines: [
      { society: "IDSA / ATS",
        year: 2016,
        topic: "HAP / VAP management (Kalil)",
        keypoint: "7-day standard; pathogen-directed; extended infusion β-lactam in critical illness; AUC for vanco" },
      { society: "ERS / ESICM",
        year: 2017,
        topic: "European HAP / VAP guidance",
        keypoint: "Aligned with IDSA short-course + extended-infusion β-lactam recommendations" },
    ],
    openQuestions: [
      "Routine procalcitonin-guided shortening — evidence supports modest LOS reduction; not standard",
      "Inhaled adjunctive antibiotics for MDR VAP — IASIS / INHALE trials negative; not standard",
      "Tracheal aspirate vs BAL for diagnosis — IDSA prefers BAL but clinical outcomes equivalent",
    ],
  },
};

export default { id: "hap", regimen, decision };
