/* ===========================================================
   STREPTOCOCCAL BACTEREMIA — penicillin-susceptible vs toxic. == */

const regimen = {
  "Penicillin-susceptible": [
    {
      rx: /penicillin|ceftriaxone/i,
      pickIf: "Penicillin-susceptible streptococcal bacteremia (viridans, S. gallolyticus, GBS, GAS).",
      whyPick: [
        "**Penicillin G or ceftriaxone** — narrow, cheap, well-studied",
        "**Workup endocarditis** for viridans / S. gallolyticus / S. anginosus group — TEE if any suspicion",
        "**S. gallolyticus → colonoscopy** for colon cancer (25–80% association)",
      ],
      watchOut: [
        { sev: "warn", text: "**GAS bacteremia** → workup for necrotizing infection / TSS — look for soft-tissue source aggressively" },
        { sev: "warn", text: "**S. anginosus (milleri) group** → invariably destructive; image-search for abscess (liver, brain, lung)" },
        { sev: "note", text: "Duration: 14 d uncomplicated; 4–6 wk for endocarditis / deep-tissue source" },
      ],
    },
  ],
  "Severe / toxic (group A)": [
    {
      rx: /penicillin.*clindamycin/i,
      pickIf: "Severe GAS bacteremia, TSS, or necrotizing soft-tissue source.",
      whyPick: [
        "**Penicillin G + clindamycin** — cidal + toxin suppression (ribosomal block)",
        "**IVIG 1–2 g/kg** for confirmed streptococcal TSS — mortality benefit",
        "**Source control** — debridement if NF; drainage if abscess",
        "**Continue clindamycin ≥ 5 d** even after narrowing — premature stop risks toxin resurgence",
      ],
      watchOut: [
        { sev: "stop", text: "**Surgical source control drives mortality** more than antibiotics — operate on clinical suspicion of NF" },
        { sev: "warn", text: "**Linezolid alternative** to clinda if clinda-resistant or C. diff history (also suppresses toxin)" },
        { sev: "note", text: "Notify public health + contact prophylaxis for invasive GAS exposure (household close contacts)" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "10-14 d for PCN-susceptible; per IE / TSS / necfasc bands for complications.",
    evidence: "Society consensus — penicillin G or ceftriaxone first-line; longer for IE",
    branches: [
      { label: "PCN-susceptible, no complications", days: "10-14 d",
        detail: "Penicillin G or ceftriaxone; viridans/anginosus/gallolyticus" },
      { label: "S. gallolyticus + colonoscopy workup", days: "14 d + workup",
        detail: "Treat + colonoscopy for colon cancer (25-80% association)" },
      { label: "Severe / toxic GAS", days: "10-14 d + clinda",
        detail: "Penicillin + clindamycin; per TSS bands if shock",
        matchAgent: /clindamycin/i },
      { label: "Streptococcal IE", days: "4-6 wk per IE",
        detail: "Per IE bands; 2 wk regimen + gent for uncomplicated low-risk" },
    ],
    stopWhen: [
      "Blood cultures cleared ≥ 48 h",
      "Afebrile",
      "Clinical recovery",
      "Echo negative (or per IE bands)",
      "Source workup complete",
      "Minimum 10-14 d completed",
    ],
    extendIf: [
      { text: "**Endocarditis** — per IE bands",
        matchCtx: { severe: true } },
      { text: "**Streptococcal TSS** — per TSS bands + IVIG",
        matchCtx: { severe: true } },
      "Necrotizing infection — per necfasc bands",
      "Mycotic aneurysm",
    ],
  },
  monitoring: {
    headline: "TEE for IE workup; colonoscopy for S. gallolyticus; necrotizing workup for GAS.",
    items: [
      { sev: "required", what: "**TEE for IE workup**",
        why: "Strep IE common; veg + duration drivers" },
      { sev: "required", what: "**Colonoscopy** if S. gallolyticus",
        why: "25-80% associated with colon cancer / polyps" },
      { sev: "trigger", what: "**Necrotizing infection workup** if GAS",
        why: "GAS + TSS + necrotizing infection common cluster" },
      { sev: "trigger", what: "**IVIG for streptococcal TSS confirmed**",
        why: "Mortality benefit specific to GAS-TSS",
        matchBranch: ["Severe / toxic GAS"] },
      { sev: "trigger", what: "**Clindamycin for toxin suppression** if GAS/TSS",
        why: "Ribosomal block reduces exotoxin; continue 5+ d after stable" },
      { sev: "consider", what: "**Source workup** — skin, abscess, sinus, dental",
        why: "Identify entry portal for prevention" },
    ],
  },
  rationale: {
    driver: "Streptococcal bacteremia management forks by species — penicillin-susceptible viridans / anginosus / gallolyticus complete 10–14 d of penicillin G or ceftriaxone, while S. gallolyticus mandates colonoscopy regardless of age (25–80% association with colon cancer or polyps; Klein JAMA Surg 2019). Severe invasive GAS adds clindamycin for ribosomal toxin suppression — Linnér (CID 2014) supported the combination + IVIG signal in streptococcal TSS; routine ribosomal block continues 5+ d past clinical stability. Streptococcal IE shifts to 4–6 wk per IE bands; the 2-wk PCN + gent regimen is restricted to strictly uncomplicated low-risk viridans (Sexton 1998).",
    guideline: "ssti",
    rejected: "Single-agent penicillin without clindamycin for severe invasive GAS was deliberately rejected — toxin-mediated tissue destruction continues even when the organism is being killed, and ribosomal block (clindamycin) is the only mechanism that halts exotoxin production. Skipping colonoscopy after S. gallolyticus bacteremia was rejected: the 25–80% colon-cancer association is too high to defer workup regardless of patient age — colonoscopy at bacteremia diagnosis is the standard." },
  objections: [
    { q: "Why colonoscopy after S. gallolyticus — patient has no GI symptoms?",
      a: "Klein (JAMA Surg 2019) [cite:ssti] and decades of cohort data establish a 25–80% association between S. gallolyticus (formerly S. bovis biotype I) bacteremia and colon cancer or advanced polyps — the bacteremia is often the first clinical signal of an occult malignancy. IDSA 2014 [cite:ssti] mandates colonoscopy at bacteremia diagnosis regardless of age or GI symptoms; deferring workup to a screening interval misses the window when intervention is highest-yield. The cost of the colonoscopy is trivial relative to the missed-cancer consequence." },
    { q: "Why add clindamycin for severe GAS — penicillin kills it?",
      a: "Severe invasive GAS adds clindamycin for ribosomal toxin suppression — Linnér (CID 2014) [cite:ssti] and IDSA 2014 [cite:ssti] showed combination + IVIG associated with improved survival in streptococcal TSS. Toxin-mediated tissue destruction continues even when the organism is being killed by penicillin (Eagle effect at high inoculum), and clindamycin's ribosomal block is the only mechanism that halts exotoxin production. Continue clindamycin 5+ d past clinical stability; penicillin alone is inadequate for the toxin-driven substrate." },
    { q: "Why 10-14 d when BALANCE supports 7 d for bacteremia?",
      a: "BALANCE (NEJM 2025) [cite:balance] established 7 d non-inferior in source-controlled GNR bacteremia and most Gram-positive sets, but the streptococcal IE risk and slower clearance kinetics in invasive strep substrate justify the 10–14 d band per IDSA 2014 [cite:ssti]. PCN-susceptible viridans / anginosus / gallolyticus complete 10–14 d; S. gallolyticus often runs longer if IE is documented. Reserve 7 d only for source-controlled, low-risk substrate with confirmed organism clearance — most invasive strep substrate warrants the 10–14 d default." },
    { q: "Why TEE in routine strep bacteremia — IE is uncommon?",
      a: "Streptococcal IE complicates approximately 15–25% of viridans / S. gallolyticus / anginosus group bacteremia per AHA 2015 [cite:ie] — substantially higher than coliform bacteremia, and TEE finds vegetations TTE misses in roughly one-third of cases. IDSA 2014 [cite:ssti] supports TEE workup for community-onset strep bacteremia, persistent positivity, or any prosthetic material. Missed IE here means a 10–14-d course where 4–6 wk + potential surgery were needed; the false-negative cost is high." },
  ],
  research: {
    headline: "10–14 d for PCN-susceptible; S. gallolyticus → colonoscopy; clindamycin + IVIG for GAS-TSS.",
    trials: [
      { name: "Klein JAMA Surg 2019",
        n: "Cohort",
        question: "S. gallolyticus bacteremia + colon cancer association",
        finding: "25–80% association with colon cancer / polyps; colonoscopy mandatory at bacteremia regardless of age",
        bias: "Observational; selection bias by colonoscopy referral" },
      { name: "Linnér CID 2014",
        n: "Cohort",
        question: "Clindamycin + IVIG in invasive GAS",
        finding: "Combination + IVIG associated with improved survival in STSS; not in polymicrobial necrotizing infection",
        bias: "Observational; signal limited to GAS subgroup" },
      { name: "Lamy CID 2010",
        n: "Cohort",
        question: "Streptococcal bacteremia outcomes by organism",
        finding: "Viridans / anginosus / gallolyticus / GAS each have distinct epidemiology; pathogen-specific workup essential",
        bias: "Pre-modern molecular speciation; some shifts in epidemiology" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2014,
        topic: "Streptococcal infections (Stevens)",
        keypoint: "PCN first-line; clindamycin + IVIG for GAS-TSS; colonoscopy for S. gallolyticus" },
      { society: "AHA",
        year: 2015,
        topic: "Strep IE (Baddour)",
        keypoint: "Viridans + S. gallolyticus IE 4 wk PCN; 2 wk + gent for selected low-risk viridans" },
    ],
    openQuestions: [
      "IVIG dosing + timing in GAS-TSS — observational data only",
      "Optimal duration for S. anginosus group bacteremia + abscess — drainage drives",
      "Colonoscopy timing after S. gallolyticus bacteremia — early vs convalescent",
    ],
  },
};

export default { id: "strep-bact", regimen, decision };
