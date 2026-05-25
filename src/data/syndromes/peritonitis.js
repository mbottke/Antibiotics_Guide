/* ===========================================================
   PERITONITIS — secondary / intra-abdominal infection. SIS /
   IDSA 2017. STOP-IT drives the 4-d post-source-control regimen. */

const regimen = {
  "Community-acquired": [
    {
      rx: /ceftriaxone.*metronidazole|piperacillin|ertapenem/i,
      pickIf: "Community intra-abdominal infection, stable, no prior ESBL.",
      whyPick: [
        "**Ceftriaxone + metronidazole** OR **pip-tazo** OR **ertapenem** — equivalent",
        "**Source control** (drain, surgery) drives outcomes — antibiotics adjunctive",
        "**STOP-IT trial**: 4-day course after source control = 10 days",
        "Avoid empiric Enterococcus / Candida cover in community-acquired",
      ],
      watchOut: [
        { sev: "warn", text: "**Source control delayed** → mortality climbs by the hour" },
        { sev: "note", text: "Ertapenem misses Pseudomonas — community IAI rarely needs it" },
      ],
    },
  ],
  "Healthcare-associated / severe": [
    {
      rx: /piperacillin|meropenem/i,
      pickIf: "Hospital-acquired IAI or critically ill — broaden + cover MRSA.",
      whyPick: [
        "**Pip-tazo or meropenem** for healthcare-associated",
        "Add **vancomycin** for prior MRSA or shock",
        "Empirically cover **Candida** in upper-GI perf / postop / TPN-dependent",
      ],
      watchOut: [
        { sev: "warn", text: "Source control + de-escalation at 48–72 h" },
        { sev: "note", text: "Anti-Candida (echinocandin) if recurrent IAI or peritoneal Candida growth" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "4 d after source control for community IAI (STOP-IT); 7–10 d if source not controllable.",
    evidence: "STOP-IT 2015 (NEJM) — 4 vs 8+ d non-inferior in community IAI with adequate source control",
    branches: [
      { label: "Community IAI, source controlled", days: "4 d",
        detail: "From source-control day; STOP-IT bands cover appendicitis, diverticulitis, perforations" },
      { label: "Healthcare-associated / severe", days: "7–10 d",
        detail: "Extended for resistant flora + immunocompromise; broaden empirics accordingly" },
      { label: "Source not fully controllable", days: "10–14 d",
        detail: "Undrained collections, partial resection, ongoing leak; ID + surgery driven" },
      { label: "Fungal peritonitis confirmed", days: "≥ 14 d",
        detail: "Echinocandin × 14 d post-clearance; longer if recurrent or upper-GI source",
        matchAgent: /echinocandin|caspofungin|micafungin|anidulafungin|fluconazole/i },
    ],
    stopWhen: [
      "Source controlled (drainage, surgery, leak repair)",
      "Afebrile ≥ 48 h",
      "WBC trending toward normal; bowel function returning",
      "Tolerating oral / step-down where appropriate",
      "Imaging shows resolution / drained collection",
      "Minimum 4 d post-source-control (community IAI)",
    ],
    extendIf: [
      { text: "**Healthcare-associated** flora or recent antibiotic exposure",
        matchCtx: { esblRisk: true } },
      "Undrained / unidentified source",
      { text: "**Severe sepsis** at presentation — extend per response",
        matchCtx: { severe: true } },
      "Fungal peritonitis confirmed — echinocandin × 14+ d",
      "Persistent or recurrent abscess on imaging",
    ],
  },
  monitoring: {
    headline: "Source-control review at 72 h, cultures drive narrowing, imaging only if non-response.",
    items: [
      { sev: "required", what: "**Source-control review at 48–72 h** — imaging, drain function, surgical reassessment",
        why: "Antibiotic failure is most often source-control failure, not drug failure" },
      { sev: "required", what: "**Narrow on culture data** at 48–72 h",
        why: "Continued broad therapy drives resistance + collateral damage" },
      { sev: "required", what: "**Daily clinical assessment** — abdominal exam, WBC, lactate, sepsis trajectory",
        why: "Worsening signs trigger imaging + surgical re-eval; STOP-IT bands assume response" },
      { sev: "trigger", what: "**Repeat CT abdomen** at day 4–5 if no clinical improvement",
        why: "Undrained collections, anastomotic leak, abscess evolution — drainage targets" },
      { sev: "trigger", what: "**Echinocandin** if upper-GI perforation, post-op leak, or peritoneal Candida",
        why: "Fungal IAI carries mortality penalty if missed; species-driven narrowing later",
        matchBranch: ["Fungal peritonitis confirmed"] },
      { sev: "trigger", what: "**Daily SCr** on vanco + pip-tazo combination",
        why: "Combination AKI signal; switch to cefepime backbone if renal-fragile",
        matchAgent: /vancomycin/i,
        matchCtx: { crcl: { lt: 60 } } },
      { sev: "consider", what: "MRSA nares PCR if empiric vanco added",
        why: "Negative result enables early vanco stop",
        matchAgent: /vancomycin/i },
      { sev: "consider", what: "**Procalcitonin trend** if duration debate at day 4–5",
        why: "Falling PCT supports STOP-IT-style early stop" },
    ],
  },
  rationale: {
    driver: "Intra-abdominal infection is a source-control disease — antibiotic adequacy is necessary but not sufficient; drainage, surgery, or leak repair drive outcome. Empirics cover enteric GNR + anaerobes (ceftriaxone + metronidazole or pip-tazo for moderate; carbapenem for severe / HCAQ). Source control achieved → fixed 4-d course (STOP-IT, NEJM 2015) is non-inferior to longer symptom-guided regimens. Persistent source extends duration until drainage is adequate.",
    guideline: "stopit",
    rejected: "Routine empiric anti-pseudomonal coverage was deliberately rejected for community-acquired non-severe IAI — Davenport (CID 2014) and IDSA 2017 reserve it for HCAQ or recent broad-antibiotic exposure. Routine empiric enterococcal coverage was also restricted: IDSA reserves it for high-risk (postoperative, immunocompromised, prosthetic), and reflexive ampicillin pairing in community IAI is unwarranted." },
  objections: [
    { q: "Why only 4 d after source control — surely IAI needs longer?",
      a: "STOP-IT (NEJM 2015 Sawyer, n=518) established a fixed 4-d course non-inferior to symptom-guided (8+ d) in complicated IAI with adequate source control — same surgical-site infection, recurrence, and death rates [cite:stopit]. The trial excluded inadequate source control, where extension applies. Reserve longer courses for persistent collections, anastomotic leak, undrained focus, or fungal IAI — those are source-control problems, not antibiotic-dose problems." },
    { q: "Why no anti-pseudomonal cover for community IAI?",
      a: "Routine empiric anti-pseudomonal cover is deliberately restricted in community-acquired non-severe IAI per IDSA 2017 and SIS — Davenport (CID 2014) showed Pseudomonas prevalence < 5% in community IAI, and reflexive pip-tazo or carbapenem drives resistance + AKI without survival benefit [cite:stopit]. Reserve for HCAQ source, recent broad-antibiotic exposure (90 d), severe sepsis at presentation, or postoperative / immunocompromised substrate." },
    { q: "Why narrow ceftriaxone + metronidazole instead of pip-tazo?",
      a: "Community IAI is dominated by enteric GNR (E. coli, Klebsiella) and Bacteroides — ceftriaxone + metronidazole covers > 90% of community isolates at lower cost, less resistance pressure, and fewer drug interactions than pip-tazo [cite:stopit]. Pip-tazo is reserved for severe / HCAQ / recent broad-antibiotic exposure where coverage of resistant GNR + enterococci matters. The stewardship win is real and audit-defensible." },
    { q: "Why echinocandin for upper-GI perforation — not standard?",
      a: "Upper-GI perforation, post-op leak, recurrent peritonitis, and immunocompromised IAI carry meaningful Candida prevalence (15-25%) with mortality penalty if missed; IDSA 2017 endorses empiric echinocandin in this substrate pending culture [cite:stopit]. Fluconazole reserved for stable host + low-azole-pressure unit; species-driven narrowing later. Routine echinocandin is NOT for community appendicitis or diverticulitis — substrate-specific only." },
  ],
  research: {
    headline: "STOP-IT established 4-day post-source-control standard; source control + de-escalation drive outcomes.",
    trials: [
      { name: "STOP-IT NEJM 2015 (Sawyer)",
        n: "518",
        question: "Fixed 4-d antibiotics vs symptom-guided in complicated intra-abdominal infection",
        finding: "Fixed 4 d non-inferior to symptom-guided; reduced antibiotic days without worsened outcomes",
        bias: "Excluded persistent source / inadequate control; results apply only after adequate source control" },
      { name: "Davenport CID 2014",
        n: "319",
        question: "Empiric coverage strategies in complicated intra-abdominal infection",
        finding: "Broad anti-pseudomonal coverage NOT needed for community-acquired non-severe; reserve for healthcare-associated or risk factors",
        bias: "Multi-center observational; consistent with society guidance" },
      { name: "Solomkin SIS / IDSA 2017",
        n: "Guideline",
        question: "Risk stratification for intra-abdominal infection",
        finding: "Defines low-risk vs high-risk substrate; drives narrow vs broad empiric coverage choice",
        bias: "Guideline synthesis; ongoing debate about HACEK + enterococcus thresholds" },
    ],
    guidelines: [
      { society: "SIS / IDSA",
        year: 2017,
        topic: "Complicated intra-abdominal infection (Mazuski)",
        keypoint: "4-day post-source-control standard; broaden + extend only if source inadequate or risk factors" },
      { society: "WSES",
        year: 2017,
        topic: "World Society Emergency Surgery sepsis guidance",
        keypoint: "Damage-control laparotomy + early source control + de-escalation; aligned with STOP-IT" },
    ],
    openQuestions: [
      "Optimal duration in source-inadequate peritonitis — no RCT data; clinical judgement-driven",
      "Routine empiric enterococcal coverage — IDSA reserves for high-risk; institutional variation",
      "Source control timing thresholds — < 12 h vs < 24 h debated; faster trends to better",
    ],
  },
};

export default { id: "peritonitis", regimen, decision };
