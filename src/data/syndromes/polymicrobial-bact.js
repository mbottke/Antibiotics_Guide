/* ===========================================================
   POLYMICROBIAL BACTEREMIA — gut/abdominal source typical. ====== */

const regimen = {
  "Empiric": [
    {
      rx: /piperacillin|carbapenem/i,
      pickIf: "Polymicrobial bacteremia (GNR + anaerobes + strep) — typically gut source.",
      whyPick: [
        "**Pip-tazo or carbapenem** — covers GNR + anaerobes + most streptococci",
        "**Source control** drives outcomes — find the gut perforation / urinary obstruction / abscess",
        "Tailor to cultures once back; species-level data within 48–72 h drives narrowing",
      ],
      watchOut: [
        { sev: "warn", text: "**Surgery consult if source not obvious** — perforation often subtle on initial imaging; serial exam + repeat imaging" },
        { sev: "warn", text: "**Candida + Enterococcus** often missed — broaden to echinocandin + ampicillin if upper-GI / post-op / TPN substrate" },
        { sev: "note", text: "STOP-IT-style 4-day post-source-control regimens sufficient when adequate drainage achieved" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "7-14 d per dominant organism + source control; abdominal source most common.",
    evidence: "Society consensus — pathogen + source-specific; STOP-IT bands when abdominal",
    branches: [
      { label: "Abdominal source + source controlled", days: "4-7 d post-control",
        detail: "Pip-tazo or carbapenem; STOP-IT bands apply" },
      { label: "GU source", days: "7-14 d",
        detail: "Per urosepsis bands + susceptibilities" },
      { label: "Skin/SSTI source", days: "Per SSTI bands",
        detail: "Often Group A strep + S. aureus; treat per source" },
      { label: "Inadequate source / unknown", days: "14 d minimum",
        detail: "Empiric broad spectrum; ID + surgical workup" },
    ],
    stopWhen: [
      "Source controlled",
      "Blood cultures cleared ≥ 48 h",
      "Afebrile",
      "Speciation + narrowing complete",
      "Imaging shows resolution",
      "Minimum 7 d completed",
    ],
    extendIf: [
      "Inadequate source control",
      { text: "**Septic shock** — extend per ICU course",
        matchCtx: { severe: true } },
      "Resistant organisms — extend per ID",
      "Recurrent / chronic source — workup",
    ],
  },
  monitoring: {
    headline: "Source-control imaging early; broad coverage initially; narrow per cultures.",
    items: [
      { sev: "required", what: "**Source workup imaging** within 24 h",
        why: "Source control is the inflection point" },
      { sev: "required", what: "**Broad coverage initially** — pip-tazo + vanco typical",
        why: "Polymicrobial implies multiple pathogen classes" },
      { sev: "required", what: "**Narrow on culture data** at 48-72 h",
        why: "Multiple organisms simplify on speciation; stewardship-critical" },
      { sev: "trigger", what: "**Surgical consult** for abdominal / abscess source",
        why: "Definitive drainage / debridement" },
      { sev: "trigger", what: "**Echinocandin** if upper-GI perf / postop / immunocompromised",
        why: "Candida co-infection drives mortality if missed" },
      { sev: "consider", what: "**Workup endocarditis** if persistent BCx",
        why: "Polymicrobial IE rare but reported" },
    ],
  },
  rationale: {
    driver: "Polymicrobial bacteremia almost always reflects an uncontrolled deep source — gut translocation (abdominal abscess, ischemic bowel, biliary obstruction) drives the majority, and source control is the inflection point that determines outcome. Empiric coverage starts broad (pip-tazo + vanco typical) to cover enteric GNR + anaerobes + Gram-positives, with narrowing on speciation at 48–72 h essential for stewardship. STOP-IT bands apply once the abdominal source is controlled (~4 d post-control non-inferior to longer regimens). Upper-GI perforation or postoperative substrate should add empiric echinocandin coverage — Candida co-infection carries substantial mortality if missed.",
    guideline: "stopit",
    rejected: "Sustained broad empiric coverage beyond 72 h was deliberately rejected — by the time speciation is back, polymicrobial sets typically simplify to one or two dominant pathogens, and persistent multi-agent therapy without narrowing drives AKI + C. difficile + resistance without benefit. Antibiotic-only management without surgical / interventional source control was tempered: persistent polymicrobial bacteremia without an identified drainable focus mandates re-imaging and re-intervention; antibiotic escalation merely buys time the source still needs surgery to fix." },
  objections: [
    { q: "Why image early — patient is responding to empirics?",
      a: "Polymicrobial bacteremia almost always reflects an uncontrolled deep source — gut translocation from abdominal abscess, ischemic bowel, or biliary obstruction drives the majority. STOP-IT (NEJM 2015 Sawyer) [cite:stopit] and SIS / IDSA 2017 establish source control as the outcome inflection point; antibiotics alone in an undrained polymicrobial focus predict relapse. Imaging within 24 h identifies the drainable target before the patient deteriorates; a deceptively stable patient on broad coverage with an undrained focus is the high-mortality scenario." },
    { q: "Why 4 d post-source-control — polymicrobial feels more serious?",
      a: "STOP-IT (NEJM 2015, n=518) [cite:stopit] established 4-d fixed course non-inferior to symptom-guided 8+ d in complicated IAI with adequate source control — same surgical-site infection, recurrence, and death rates regardless of polymicrobial substrate. The principle generalizes to gut-translocated polymicrobial bacteremia once source is controlled. Reserve longer courses for persistent collections, anastomotic leak, undrained focus, or fungal IAI — those are source-control problems, not antibiotic-dose problems." },
    { q: "Why echinocandin in upper-GI perf — Candida coverage routine?",
      a: "Upper-GI perforation, post-operative leak, recurrent peritonitis, and immunocompromised polymicrobial substrate carry meaningful Candida prevalence (15–25%) with mortality penalty if missed — IDSA 2017 [cite:stopit] endorses empiric echinocandin in this substrate pending culture. Fluconazole reserved for stable host + low-azole-pressure unit; species-driven narrowing later. Routine echinocandin is NOT for community-acquired polymicrobial bacteremia from a colonic source where Candida prevalence is < 5%; substrate-specific only." },
    { q: "Why narrow on cultures — broad coverage is working?",
      a: "Persistent broad coverage past 72 h in polymicrobial bacteremia drives AKI, C. difficile, and resistance selection without survival benefit per IDSA / SHEA 2016 [cite:stew] — by the time speciation returns, polymicrobial sets typically simplify to one or two dominant pathogens (E. coli + Bacteroides, S. aureus + GNR, etc.) that allow targeted therapy. The empiric breadth bought time during diagnostic uncertainty; once the substrate is defined, the bargain ends. Daily de-escalation review is the stewardship contract." },
  ],
  research: {
    headline: "Surgical source control drives outcome; broad initial → narrow on cultures; echinocandin for upper-GI perf.",
    trials: [
      { name: "Solomkin SIS / IDSA 2017",
        n: "Guideline",
        question: "Modern polymicrobial intra-abdominal bacteremia",
        finding: "Broad-spectrum + source control + echinocandin for upper-GI substrate; STOP-IT-aligned 4 d post-source-control",
        bias: "Guideline synthesis" },
    ],
    guidelines: [
      { society: "SIS / IDSA",
        year: 2017,
        topic: "Polymicrobial / intra-abdominal infection (Mazuski)",
        keypoint: "Broad → narrow; surgical source control + echinocandin for high-risk; STOP-IT 4 d" },
    ],
    openQuestions: [
      "Routine echinocandin in upper-GI perf — high-risk dependent",
      "Endocarditis workup threshold — persistent BCx",
    ],
  },
};

export default { id: "polymicrobial-bact", regimen, decision };
