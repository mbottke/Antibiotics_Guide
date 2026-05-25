/* ===========================================================
   TSS — Streptococcal & Staphylococcal toxic shock. Source
   control + clindamycin + IVIG (GAS); supportive care; rapid
   escalation. ATS / IDSA + CDC case definitions. ============= */

const regimen = {
  "Empiric": [
    {
      rx: /vancomycin.*clindamycin|piperacillin/i,
      pickIf: "Toxic shock syndrome — hypotension + rash + multi-organ failure.",
      whyPick: [
        "**Vancomycin + clindamycin ± β-lactam** — broad cover + toxin suppression",
        "**Clindamycin suppresses toxin** (ribosomal block) — keep on board until source confirmed",
        "**Source control** — remove tampon, drain abscess, debride necrotic tissue",
        "**IVIG 1–2 g/kg** for streptococcal TSS — mortality benefit",
      ],
      watchOut: [
        { sev: "stop", text: "**Source removal delayed → shock persists** — even with appropriate antibiotics, source control is the inflection point" },
        { sev: "warn", text: "**Vasopressor escalation** + multi-organ failure typical — early ICU + ID involvement mandatory",
          matchCtx: { severe: true } },
        { sev: "note", text: "Staph vs strep TSS distinguishable late — empiric treats both pathways; narrow on cultures + clinical clues (desquamation favors staph)" },
      ],
    },
  ],
  "Directed (GAS)": [
    {
      rx: /penicillin.*clindamycin/i,
      pickIf: "Streptococcal TSS confirmed.",
      whyPick: [
        "**Penicillin G + clindamycin × 14 d** — combined cidal + toxin suppression",
        "**IVIG 1–2 g/kg day 1** — consider repeat if clinical non-response by 48 h",
        "**Linezolid alternative** to clinda if clinda-resistant or C. diff history",
        "**Surgical re-look every 24 h** for the necrotizing component — silent extension under antibiotics",
      ],
      watchOut: [
        { sev: "warn", text: "**ICU + ID notification within hours** — mortality 30–80% despite optimal therapy" },
        { sev: "warn", text: "**Continue clindamycin × 5 d** even after narrowing — premature stop risks toxin resurgence" },
        { sev: "note", text: "Contacts of severe invasive GAS: prophylaxis per public-health (penicillin or first-gen cephalosporin)" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "10–14 d after source controlled + shock resolved; clindamycin until toxin-producer excluded.",
    evidence: "IDSA 2014 + CDC — no fixed duration; source control + clindamycin + IVIG for confirmed GAS-TSS drive outcome",
    branches: [
      { label: "Streptococcal TSS (GAS) confirmed", days: "10–14 d",
        detail: "Penicillin + clindamycin + IVIG; source control critical (debridement, drainage, FB removal)",
        matchAgent: /penicillin/i },
      { label: "Staphylococcal TSS (menstrual or non-menstrual)", days: "10–14 d",
        detail: "Anti-staph + clindamycin; remove tampon / FB / packing; vancomycin until MSSA confirmed",
        matchAgent: /vancomycin|nafcillin|oxacillin|cefazolin/i },
      { label: "Severe (refractory shock, multi-organ failure)", days: "≥ 14 d + ICU",
        detail: "Combination + IVIG + aggressive source control; ECMO if needed; ID + CC consult" },
      { label: "Probable / culture-negative", days: "10–14 d empiric",
        detail: "Cover GAS + S. aureus + clinda; treat empirically pending culture data" },
    ],
    stopWhen: [
      "Source controlled — wound debrided, FB removed, drainage adequate",
      "Off vasopressors ≥ 48 h",
      "Afebrile + multi-organ dysfunction resolving",
      "Cultures negative or appropriately treated",
      "Minimum 10–14 d completed after source control",
    ],
    extendIf: [
      { text: "**Persistent source** — surgical or anatomic — extend until controlled",
        matchCtx: { severe: true } },
      "Bacteremia confirmed — per pathogen + source",
      "Necrotizing infection co-existing — per necfasc bands",
      "Multi-organ failure persisting — per ICU + ID",
    ],
  },
  monitoring: {
    headline: "Source control mandatory; clindamycin for toxin suppression; IVIG for confirmed GAS-TSS.",
    items: [
      { sev: "required", what: "**Source control** — surgical debridement, FB removal, drainage",
        why: "Antibiotics alone fail; mortality benefit anchored to source eradication" },
      { sev: "required", what: "**Clindamycin 900 mg IV q8h** until toxin-producer excluded",
        why: "Ribosomal block suppresses exotoxin production; cidal agent alone insufficient" },
      { sev: "required", what: "**Blood cultures × 2 + wound / source cultures**",
        why: "Identifies pathogen + drives narrowing; differentiates GAS vs S. aureus toxic shock" },
      { sev: "trigger", what: "**IVIG 1 g/kg day 1, 0.5 g/kg days 2–3** for confirmed streptococcal TSS",
        why: "Mortality benefit limited to GAS-TSS (observational + small RCTs); not for S. aureus TSS",
        matchBranch: ["Streptococcal TSS (GAS) confirmed"] },
      { sev: "trigger", what: "**Remove tampon / vaginal packing** for menstrual TSS",
        why: "Foreign body harbors toxin-producing organism; removal is source control" },
      { sev: "trigger", what: "**Aggressive fluid resuscitation + vasopressors**",
        why: "Distributive shock from superantigen-driven cytokine storm" },
      { sev: "trigger", what: "**Workup necrotizing fasciitis** if GAS + extremity involvement",
        why: "GAS-TSS + necrotizing infection common cluster; surgical exploration low threshold" },
      { sev: "consider", what: "**Hyperbaric oxygen** if clostridial component (rarely indicated)",
        why: "Evidence weak; reserve for clostridial myonecrosis; never delay surgery" },
    ],
  },
  rationale: {
    driver: "TSS is superantigen-driven distributive shock — TSST-1 (S. aureus) and SpeA/SpeC (GAS) crosslink MHC-II to Vβ-TCR, triggering polyclonal T-cell activation and a cytokine storm. Multi-modal therapy is mandatory: source control (debride wound, remove tampon/packing, drain abscess) + a cidal anti-staph or anti-strep agent (vancomycin until MSSA confirmed; penicillin + cefazolin for GAS) + clindamycin 900 mg IV q8h to halt ribosomal toxin synthesis + IVIG 1 g/kg load then 0.5 g/kg × 2 d for confirmed streptococcal TSS to neutralize circulating superantigen. Aggressive fluid + vasopressor support and ICU admission round out the bundle.",
    guideline: "ssti",
    rejected: "Cidal monotherapy without clindamycin was deliberately rejected — β-lactams alone fail to suppress ongoing toxin production at the high inocula seen in TSS (the Eagle effect), and clindamycin's ribosomal block is the toxin-suppression rationale (IDSA 2014). IVIG for staphylococcal TSS was tempered: the mortality benefit established by Linnér (CID 2014) and Darenberg (CID 2003) is anchored to GAS-TSS only — no similar signal for S. aureus TSS, where source control and removal of the tampon/foreign body dominate." },
  objections: [
    { q: "Why clindamycin alongside penicillin — isn't PCN cidal enough?",
      a: "Penicillin is cidal but does not suppress superantigen (TSST-1, SpeA/C) production — exotoxin drives the cytokine storm and shock. Clindamycin (ribosomal block at the 50S subunit) halts ongoing toxin synthesis independent of inoculum or growth phase per IDSA 2014 [cite:ssti]. Mascini 2001 + Carapetis 2014 cohorts show survival benefit with adjunctive clindamycin in invasive GAS. Continue until toxin-producing organism excluded." },
    { q: "Why IVIG for streptococcal TSS but not staphylococcal?",
      a: "IVIG mortality benefit is observational + small RCT-supported for streptococcal TSS only (Linnér CID 2014, Darenberg 2003) — pooled IgG neutralizes circulating GAS superantigens [cite:ssti]. Staphylococcal TSS has no comparable signal, and IDSA 2014 does not endorse routine IVIG outside GAS-TSS. Dose 1 g/kg day 1, then 0.5 g/kg days 2-3 in confirmed GAS-TSS with refractory shock; skip in S. aureus TSS." },
    { q: "Why source control if antibiotics + IVIG are working?",
      a: "Antibiotics + IVIG fail without source eradication — retained tampon, packed wound, abscess, or necrotizing focus continues to seed superantigen. IDSA 2014 [cite:ssti] mandates surgical debridement, foreign-body removal, and drainage as the outcome-determining step; mortality benefit is anchored to source control. Low threshold for OR exploration if GAS + extremity involvement (necrotizing fasciitis cluster). Antibiotics alone are not sufficient therapy." },
    { q: "Why empiric vanco — can't we start narrow with cefazolin?",
      a: "Empiric cover must include both GAS and S. aureus (including MRSA) until cultures speciate — the two TSS phenotypes are clinically indistinguishable at presentation, and missing MRSA in staphylococcal TSS is uniformly fatal in shock [cite:ssti]. Vancomycin + clindamycin covers both. Narrow to penicillin + clindamycin once GAS confirmed; narrow to cefazolin + clindamycin for MSSA. Reflexive narrow cover at presentation is the unsafe move." },
  ],
  research: {
    headline: "Source control mandatory; clindamycin for toxin suppression; IVIG mortality benefit limited to GAS-TSS.",
    trials: [
      { name: "Linnér CID 2014",
        n: "Cohort",
        question: "IVIG in streptococcal toxic shock",
        finding: "IVIG associated with improved survival in confirmed GAS-TSS; benefit NOT generalizable to staphylococcal TSS",
        bias: "Observational; subgroup-specific signal" },
      { name: "Darenberg CID 2003",
        n: "21 (small RCT)",
        question: "IVIG in invasive GAS",
        finding: "Stopped early for low enrollment; trend favored IVIG; signal consistent with Linnér + Kaul observational",
        bias: "Small + early-stopped" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2014,
        topic: "SSTI including toxic shock (Stevens)",
        keypoint: "Source control + clindamycin + IVIG for GAS-TSS; avoid IVIG for staphylococcal TSS" },
      { society: "CDC",
        year: 2024,
        topic: "Streptococcal disease + TSS",
        keypoint: "Notifiable; contact prophylaxis for household + close contacts of invasive GAS" },
    ],
    openQuestions: [
      "IVIG dosing in GAS-TSS — 1 g/kg load + 0.5 g/kg × 2 d typical",
      "Optimal duration of clindamycin for toxin suppression — 5+ d after stability",
      "Activated protein C in TSS — removed from market; supportive only now",
    ],
  },
};

export default { id: "tss", regimen, decision };
