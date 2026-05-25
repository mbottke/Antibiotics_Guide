/* ===========================================================
   SEPSIS — Intra-abdominal source. STOP-IT bands + source control. */

const regimen = {
  "Empiric": [
    {
      rx: /piperacillin/i,
      pickIf: "Community-acquired intra-abdominal sepsis — single agent covers it all.",
      whyPick: [
        "**Single agent** covers enteric GNR + anaerobes + Enterococcus",
        "**Extended infusion** (4-hour) at MIC ≥ 8 in critically ill — better PK/PD",
        "Add **vancomycin** if healthcare-associated or instrumented",
        "Source control (drainage / surgery) is the actual treatment — antibiotics adjunctive",
      ],
      watchOut: [
        { sev: "warn", text: "**Pip-tazo + vanco AKI** — switch to ceftriaxone+metronidazole if renal-fragile" },
        { sev: "warn", text: "ESBL inoculum effect — switch to meropenem if not improving by 72 h" },
        { sev: "note", text: "De-escalate at 48–72 h on culture data — 4–5 d post-source-control is enough (STOP-IT)" },
      ],
    },
    {
      rx: /carbapenem|meropenem|ertapenem/i,
      pickIf: "Prior ESBL, recent broad β-lactam, or healthcare-associated abdominal sepsis.",
      whyPick: [
        "**Reliable ESBL kill** — pip-tazo less reliable at inoculum",
        "Single-agent broad cover (anaerobes + GNR + most enterococci)",
        "**Meropenem** for ICU/shock; **ertapenem** for stable HAI without Pseudomonas risk",
      ],
      watchOut: [
        { sev: "stop", text: "**Ertapenem misses Pseudomonas** — never empiric for septic shock" },
        { sev: "warn", text: "Meropenem ↓ valproate 60–90% — never in epileptics" },
        { sev: "note", text: "Promotes CRE — narrow ASAP on culture data" },
      ],
    },
  ],
  "Add antifungal risk": [
    {
      rx: /echinocandin|antifungal/i,
      pickIf: "Upper-GI perf, postoperative leak, recurrent intra-abdominal infection, TPN, immunosuppressed.",
      whyPick: [
        "**Echinocandin** (caspofungin/micafungin) — broad Candida coverage incl. C. glabrata / krusei",
        "Fluconazole acceptable for C. albicans + stable patient",
        "**Target Candida in peritoneal fluid** — don't wait for blood cultures",
      ],
      watchOut: [
        { sev: "warn", text: "**Fluconazole misses** C. glabrata (intermediate) and C. krusei (resistant)" },
        { sev: "warn", text: "Echinocandins **don't cover** Cryptococcus or molds (Aspergillus)" },
        { sev: "note", text: "Step down to PO fluconazole once species + sensitivities known" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "4 d post-source-control for community IAI (STOP-IT); 7–10 d if HCAQ or inadequate control.",
    evidence: "STOP-IT 2015 — 4 d non-inferior post-adequate-source-control IAI",
    branches: [
      { label: "Community IAI, source controlled", days: "4 d",
        detail: "Pip-tazo or ceftriaxone+metronidazole or ertapenem; from source-control day" },
      { label: "HCAQ IAI or shock", days: "7–10 d",
        detail: "Broaden empirics; pip-tazo or carbapenem; ICU + ID partnership" },
      { label: "Source not fully controllable", days: "10–14 d",
        detail: "Undrained collections, anastomotic leak, partial resection" },
      { label: "Fungal peritonitis confirmed", days: "≥ 14 d echinocandin",
        detail: "Echinocandin ± azole step-down; per Candida species + susceptibility",
        matchAgent: /echinocandin|caspofungin|micafungin|anidulafungin|fluconazole/i },
    ],
    stopWhen: [
      "Source controlled (drainage, surgery, leak repair)",
      "Afebrile ≥ 48 h, off vasopressors",
      "Bowel function returning, oral intake tolerated",
      "WBC trending, lactate normalized",
      "Imaging shows resolution / stable drained collection",
      "Minimum 4 d post-source-control",
    ],
    extendIf: [
      { text: "**Healthcare-associated** flora or recent broad antibiotics",
        matchCtx: { esblRisk: true } },
      "Undrained / uncontrolled source",
      { text: "**Septic shock** at presentation — extend per response",
        matchCtx: { severe: true } },
      "Fungal peritonitis — echinocandin × 14+ d",
      "Anastomotic leak — surgical re-exploration + extend",
    ],
  },
  monitoring: {
    headline: "Source-control review at 72 h; STOP-IT bands; echinocandin for upper-GI + post-op.",
    items: [
      { sev: "required", what: "**Source-control review at 48–72 h** — imaging, drain function, surgical re-eval",
        why: "Antibiotic failure most often source-control failure" },
      { sev: "required", what: "**Narrow on culture data** at 48–72 h",
        why: "Continued broad therapy drives resistance + collateral damage" },
      { sev: "required", what: "**Daily clinical assessment** + lactate trend",
        why: "Worsening signs trigger imaging + surgical re-eval; STOP-IT bands assume response" },
      { sev: "trigger", what: "**Echinocandin** for upper-GI perforation, postop leak, recurrent IAI",
        why: "Candida overgrowth common; carries mortality penalty if missed",
        matchBranch: ["Fungal peritonitis confirmed"] },
      { sev: "trigger", what: "**Repeat CT** at day 4–5 if no clinical improvement",
        why: "Undrained collections, leak, abscess evolution — drainage targets" },
      { sev: "trigger", what: "**Surgical re-exploration** for anastomotic leak / non-responsive collection",
        why: "Antibiotic alone fails with surgical complications",
        matchCtx: { severe: true } },
    ],
  },
  rationale: {
    driver: "Abdominal sepsis is a source-control disease — STOP-IT (NEJM 2015) anchors a fixed ~4-day post-source-control course as non-inferior to symptom-guided extension when drainage, surgery, or leak repair is adequate. Empirics cover enteric GNR + anaerobes: community → pip-tazo or ceftriaxone + metronidazole or ertapenem; HCAQ / shock / recent broad antibiotics → carbapenem with broader Pseudomonas + Enterococcus + Candida coverage as risk-stratified. Daily source-control reassessment at 48–72 h is the contract — antibiotic failure most often reflects an undrained or expanding focus, not a wrong drug. Candida overgrowth in upper-GI perforation, postoperative leak, or recurrent IAI triggers empiric echinocandin.",
    guideline: "stopit",
    rejected: "Reflexive 10–14 d courses after adequate source control were deliberately rejected — STOP-IT established 4 d post-source-control non-inferior, and Solomkin (IDSA / SIS 2017) endorses the short-course standard. Extending therapy without an undrained focus drives resistance, C. difficile, and Candida overgrowth without changing outcomes. Routine empiric anti-pseudomonal + anti-enterococcal coverage was tempered for community IAI: Solomkin reserves it for HCAQ, postoperative, or immunocompromised hosts, and reflexive carbapenem in community disease wastes spectrum." },
  objections: [
    { q: "Why only 4 d after source control — abdominal sepsis needs longer?",
      a: "STOP-IT (NEJM 2015 Sawyer, n=518) [cite:stopit] established a fixed 4-d course non-inferior to symptom-guided (8+ d) in complicated IAI with adequate source control — same surgical-site infection, recurrence, and death rates. Extending without an undrained focus drives resistance, CDI, and Candida overgrowth without changing outcomes [cite:cdi]. Reserve longer for inadequate source control, anastomotic leak, or persistent collection — those are surgical problems, not antibiotic-dose problems." },
    { q: "Why broaden to anti-pseudomonal + anti-enterococcal for HCAQ?",
      a: "HCAQ abdominal sepsis carries elevated baseline Pseudomonas, Enterobacter, ESBL, and Enterococcus prevalence that community-IAI regimens miss — Solomkin (IDSA / SIS 2017) anchors pip-tazo or carbapenem + ampicillin / vancomycin in postoperative, recent-broad-antibiotic, or immunocompromised hosts [cite:stopit]. Inadequate initial therapy in septic shock drives mortality per SSC 2021 [cite:ssc]. Narrow rapidly at 48–72 h on cultures [cite:amrgn]." },
    { q: "Why echinocandin for upper-GI perforation or postop leak?",
      a: "Upper-GI perforation, postoperative anastomotic leak, recurrent peritonitis, and immunocompromised IAI carry meaningful Candida prevalence (15–25%) with mortality penalty if missed — IDSA 2017 endorses empiric echinocandin pending culture [cite:stopit]. Fluconazole reserved for stable hosts in low-azole-pressure units; species-driven narrowing later [cite:amrgn]. Routine echinocandin is NOT for community appendicitis or diverticulitis — substrate-specific only." },
    { q: "Why source-control review at 72 h — antibiotics should work?",
      a: "Antibiotic failure most often reflects an undrained or expanding focus — Solomkin (IDSA / SIS 2017) and SSC 2021 [cite:ssc] anchor structured source-control reassessment at 48–72 h (imaging, drain function, surgical re-eval) because reflexive antibiotic broadening without addressing source is the dominant treatment-failure mode [cite:stopit]. Anastomotic leak, undrained collection, or partial resection trigger re-exploration; antibiotics alone do not rescue surgical failure." },
  ],
  research: {
    headline: "STOP-IT — 4 d post-source-control non-inferior; broad antifungal coverage for HCAQ peritonitis with persistent fever.",
    trials: [
      { name: "STOP-IT NEJM 2015",
        n: "518",
        question: "Fixed 4-d vs symptom-guided in complicated intra-abdominal infection",
        finding: "Fixed 4 d non-inferior after adequate source control; reduced antibiotic days without worsened outcomes",
        bias: "Excluded persistent source / inadequate control" },
      { name: "Solomkin IDSA / SIS 2017",
        n: "Guideline",
        question: "Risk-stratified empiric for complicated IAI",
        finding: "Community vs HCAQ stratification drives empiric; carbapenem for high-risk; STOP-IT-aligned short course",
        bias: "Synthesis with ongoing debate on enterococcus" },
    ],
    guidelines: [
      { society: "SIS / IDSA",
        year: 2017,
        topic: "Complicated intra-abdominal infection (Mazuski)",
        keypoint: "4-d STOP-IT-aligned post-source-control; broad → narrow on cultures; broaden for HCAQ" },
    ],
    openQuestions: [
      "Routine enterococcal coverage — high-risk only",
      "Antifungal empiric in HCAQ — institutional variation",
      "Optimal duration if source inadequate — clinical judgment",
    ],
  },
};

export default { id: "sepsis-abdominal", regimen, decision };
