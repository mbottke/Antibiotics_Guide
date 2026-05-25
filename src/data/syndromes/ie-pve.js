/* ===========================================================
   IE — Prosthetic valve (PVE). Rifampin + gent + extended duration. */

const regimen = {
  "Staphylococcal PVE": [
    {
      rx: /vancomycin.*rifampin|rifampin/i,
      pickIf: "Staphylococcal PVE — rifampin for biofilm + gent for synergy.",
      whyPick: [
        "**Vancomycin/β-lactam + rifampin + gentamicin × ≥6 weeks**",
        "**Rifampin** essential — penetrates biofilm on prosthetic material",
        "**Gentamicin × 2 weeks only** — first 2 weeks for synergy",
        "**Surgical replacement** often needed — early-PVE almost always",
      ],
      watchOut: [
        { sev: "warn", text: "**Rifampin interactions** — many drugs (warfarin, OCPs, antiretrovirals)" },
        { sev: "warn", text: "**Never start rifampin until cultures positive** — induces resistance fast" },
        { sev: "warn", text: "Gent: limit to 2 weeks; check trough" },
      ],
    },
  ],
  "Enterococcal / streptococcal PVE": [
    {
      rx: /native|6\s*weeks/i,
      pickIf: "Enterococcal or streptococcal PVE — same agents, longer duration.",
      whyPick: [
        "**Same regimens as native valve, but ≥ 6 weeks**",
        "**Surgery threshold lower** in PVE — early valve replacement frequent (failure of medical therapy → worse outcomes)",
        "Repeat blood cultures q48h until clearance; persistent BCx > 5 d → emergent surgery candidate",
      ],
      watchOut: [
        { sev: "warn", text: "**Persistent bacteremia > 5 d** on appropriate therapy → emergent surgery + workup new embolic foci" },
        { sev: "note", text: "**Multidisciplinary IE team** — surgery + ID + cardiology drives outcomes; involve all three by day 1" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "≥ 6 wk IV; rifampin for staphylococcal; gent for synergy first 2 wk; surgery threshold low.",
    evidence: "IDSA / AHA 2015 — PVE-specific bands with rifampin + aminoglycoside; surgery frequent",
    branches: [
      { label: "Staphylococcal PVE", days: "≥ 6 wk",
        detail: "Vanco / β-lactam + RIFAMPIN × 6+ wk + gent × 2 wk synergy; surgery often",
        matchAgent: /rifampin/i },
      { label: "Enterococcal / streptococcal PVE", days: "≥ 6 wk",
        detail: "Same agents as native valve but longer; surgery threshold lower" },
      { label: "Culture-negative PVE", days: "6 wk empiric",
        detail: "Vancomycin + cefepime + rifampin; workup atypicals" },
    ],
    stopWhen: [
      "BCx cleared ≥ 48 h",
      "Echo stable / improving",
      "Clinical resolution",
      "Surgery completed (if needed)",
      "No new complications",
      "Minimum 6 wk completed",
    ],
    extendIf: [
      { text: "**Persistent bacteremia > 5 d** — emergent surgery",
        matchCtx: { severe: true } },
      "Abscess / dehiscence — surgery + extend",
      "Mycotic aneurysm",
      "Recurrent embolic events",
    ],
  },
  monitoring: {
    headline: "Surgery threshold lower; rifampin LFT + interactions; gent trough monitoring; embolic surveillance.",
    items: [
      { sev: "required", what: "**Cardiac surgery consult at presentation** — surgery threshold lower in PVE",
        why: "Early-PVE (< 1 year) almost always needs replacement; late-PVE selective" },
      { sev: "required", what: "**Rifampin LFTs + drug-interaction review**",
        why: "Hepatotoxic; CYP3A4 inducer (warfarin, OCPs, statins, immunosuppressants)",
        matchAgent: /rifampin/i },
      { sev: "required", what: "**Gentamicin trough + audiometry** (first 2 wk only)",
        why: "Nephrotoxicity + ototoxicity; limit to synergy window" },
      { sev: "required", what: "**Daily blood cultures until clearance**",
        why: "Persistent BCx is the inflection point for surgery" },
      { sev: "trigger", what: "**Brain MRI** for neurologic symptoms",
        why: "Mycotic aneurysm + embolic workup" },
      { sev: "trigger", what: "**Emergent surgery** for HF, abscess, dehiscence, persistent BCx",
        why: "Class I indication; delay worsens mortality",
        matchCtx: { severe: true } },
      { sev: "consider", what: "Long-term suppression decisions if hardware retained",
        why: "Lifelong oral per ID + cardiac surgery" },
    ],
  },
  rationale: {
    driver: "PVE inverts the native-valve calculus — the foreign body is the source, biofilm dominates, and surgery is far more common (almost universal in early PVE < 1 year). Staphylococcal PVE adds rifampin to vancomycin or a β-lactam for biofilm penetration plus gentamicin × 2 wk synergy, with a minimum 6-wk IV course (AHA 2015 + ESC 2023 Class I). Streptococcal / enterococcal PVE uses the same agents as native valve but for ≥ 6 wk with a lower surgical threshold. Culture-negative PVE is empirically covered with vancomycin + cefepime + rifampin while atypical pathogens (HACEK, Bartonella, Coxiella) are worked up — these change agents fundamentally.",
    guideline: "ie",
    rejected: "The native-valve approach of omitting rifampin was deliberately rejected for staphylococcal PVE — Karchmer (JAMA 1993) and decades of cohort data establish rifampin combination as central to biofilm penetration on prosthetic material, the opposite of the ARREST native-valve verdict. Antibiotic monotherapy without surgical evaluation in early PVE (< 1 year) was rejected: paravalvular extension, valve dehiscence, and persistent bacteremia are surgical Class I indications, and delaying valve replacement worsens mortality." },
  objections: [
    { q: "Why rifampin for PVE but not native-valve staph?",
      a: "The cost-benefit flips between native and prosthetic substrate. ARREST (Lancet 2018, n=770) [cite:arrest] showed adjunctive rifampin in native-valve SAB had no mortality benefit and added AEs (hepatitis, GI, major CYP3A4 interactions). Rifampin retains its PVE role for biofilm penetration on prosthetic material — sterilizing biofilm-embedded staphylococci that vancomycin or β-lactam alone cannot reach per Karchmer (JAMA 1993) and AHA 2015 [cite:ie]. Native-valve has no biofilm substrate where the drug-interaction cost is worth paying." },
    { q: "Why 2 wk gentamicin synergy — adds nephrotoxicity risk?",
      a: "Gentamicin × 2 wk synergy is restricted to staphylococcal PVE per AHA 2015 + ESC 2023 [cite:ie] — bactericidal killing of biofilm-embedded organisms benefits from the synergistic effect during the high-burden first 2 wk, after which the renal / oto cost outweighs benefit. Strict trough monitoring + audiometry are mandated. We do NOT extend gent beyond 2 wk, and we omit it entirely if baseline renal dysfunction makes the risk-benefit unfavorable; the principle is restricted, not reflexive." },
    { q: "Why surgery threshold lower — can't antibiotics finish the job?",
      a: "Early-PVE (< 1 year) almost always requires valve replacement per AHA 2015 + ESC 2023 [cite:ie] — paravalvular extension, valve dehiscence, and persistent bacteremia are surgical Class I indications, and antibiotic-only management is futile when the foreign body is the source. Wang (JACC 2007) and Lalani (CID 2014) showed early surgery for these complications halved mortality. The native-valve threshold of waiting for clear surgical indication does not apply to early-PVE; surgical evaluation is mandatory at presentation." },
    { q: "Why empiric vanco + cefepime + rifampin for culture-negative?",
      a: "Culture-negative PVE empiric coverage targets the realistic substrate per AHA 2015 [cite:ie]: vancomycin for MRSA + CoNS biofilm, cefepime for Gram-negative + AmpC inducers, and rifampin for biofilm-embedded staph if prosthetic material involved. Atypical pathogens (HACEK, Bartonella, Coxiella) must be worked up in parallel — they change agents fundamentally. The triple regimen narrows quickly once organism + susceptibilities return; reflexive ceftriaxone alone misses the staphylococcal majority in PVE." },
  ],
  research: {
    headline: "Rifampin combination central to PVE staph; aminoglycoside synergy first 2 wk; surgery indicated for paravalvular extension.",
    trials: [
      { name: "Karchmer JAMA 1993",
        n: "Cohort",
        question: "Rifampin combination for staphylococcal PVE",
        finding: "Rifampin + nafcillin / vanco + gent reduced cure failure vs comparator; foundation of PVE staph regimen",
        bias: "Pre-MRSA era for some; principle replicated for MRSA-PVE" },
      { name: "Wang JACC 2007",
        n: "Cohort",
        question: "Surgical timing in PVE",
        finding: "Early surgery for HF, large veg, persistent BCx, paravalvular extension reduced mortality",
        bias: "Observational; treatment-by-indication confounding" },
      { name: "Lalani CID 2014",
        n: "PVE cohort",
        question: "Modern PVE outcomes + surgical decision drivers",
        finding: "Paravalvular extension + persistent bacteremia + new HF drive Class I surgical indication; mortality halves with timely surgery",
        bias: "Observational; selection bias possible" },
    ],
    guidelines: [
      { society: "AHA",
        year: 2015,
        topic: "Infective endocarditis (Baddour) — PVE",
        keypoint: "≥ 6 wk IV; rifampin + gent for staphylococcal; surgery for paravalvular / HF / large veg / persistent BCx" },
      { society: "ESC",
        year: 2023,
        topic: "European PVE (Habib update)",
        keypoint: "Aligned with AHA; endocarditis team mandatory; consider valve-sparing reconstruction" },
    ],
    openQuestions: [
      "Rifampin in MRSA-PVE — evidence weaker than MSSA-PVE; expert opinion supports",
      "Optimal aminoglycoside duration — 2 wk standard but renal-fragile substrate often limits",
      "Surgical timing after septic embolism (stroke) — earlier surgery increasingly supported by smaller cohorts",
    ],
  },
};

export default { id: "ie-pve", regimen, decision };
