/* ===========================================================
   SEPSIS — Toxic shock (staph / strep). Source control + IVIG. == */

const regimen = {
  "Empiric": [
    {
      rx: /β-?lactam|piperacillin|carbapenem/i,
      pickIf: "Rapid-onset shock + diffuse erythroderma / soft-tissue pain out of proportion.",
      whyPick: [
        "**β-lactam + vancomycin + clindamycin** — full triple coverage",
        "**Clindamycin** suppresses TSST-1 / streptococcal exotoxin (ribosomal block)",
        "Pip-tazo or carbapenem covers gut translocation + GNR sepsis",
        "Add **IVIG 1–2 g/kg** for streptococcal TSS — mortality benefit",
        "Source control: remove tampon, debride, drain — antibiotics are adjunctive",
      ],
      watchOut: [
        { sev: "stop", text: "**Surgical source control delayed** → mortality climbs hour by hour" },
        { sev: "warn", text: "**Clindamycin diarrhea / C. difficile** — accept the risk in TSS; stop early" },
        { sev: "note", text: "Linezolid alternative to clinda for toxin suppression if clinda resistant" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "14 d clindamycin + targeted antibiotic; IVIG for streptococcal TSS; source control essential.",
    evidence: "IDSA + society consensus — clindamycin for toxin suppression; IVIG mortality benefit in GAS-TSS",
    branches: [
      { label: "Streptococcal TSS confirmed", days: "14 d",
        detail: "Penicillin + clindamycin × 14 d; IVIG 1 g/kg + 0.5 g/kg ×2",
        matchAgent: /penicillin|clindamycin/i },
      { label: "Staphylococcal TSS confirmed", days: "10–14 d",
        detail: "Vancomycin (or nafcillin if MSSA) + clindamycin; source removal essential" },
      { label: "Empiric pre-confirmation", days: "Until pathogen known",
        detail: "Vancomycin + pip-tazo + clindamycin; narrow on cultures + clinical clues" },
    ],
    stopWhen: [
      "Afebrile ≥ 48 h",
      "Off vasopressors",
      "Source removed (tampon, foreign body, abscess drained)",
      "Cultures cleared",
      "Rash desquamation / clinical resolution",
      "Minimum 10–14 d completed",
    ],
    extendIf: [
      { text: "**Streptococcal TSS with necrotizing infection** — extend per necfasc",
        matchCtx: { severe: true } },
      "Persistent shock / multi-organ failure — extend per ICU course",
      "Source not removed — failure to clear without it",
      "Bacteremia + endocarditis workup — extend per source",
    ],
  },
  monitoring: {
    headline: "Source removal + IVIG for GAS; clindamycin for toxin; ICU partnership.",
    items: [
      { sev: "required", what: "**Source removal** — tampon, foreign body, abscess drainage",
        why: "Source control is the inflection point; antibiotic alone fails with source in place" },
      { sev: "required", what: "**Continue clindamycin** until toxin-producing organism excluded",
        why: "Ribosomal block suppresses TSST-1 + streptococcal exotoxin; cidal antibiotic alone insufficient" },
      { sev: "required", what: "**ICU + ID consult** at presentation",
        why: "Multi-organ failure typical; team coordination drives mortality" },
      { sev: "trigger", what: "**IVIG 1 g/kg day 1, 0.5 g/kg days 2–3** only for streptococcal TSS confirmed",
        why: "Mortality benefit specific to GAS-TSS; not indicated for staphylococcal TSS",
        matchBranch: ["Streptococcal TSS confirmed"] },
      { sev: "trigger", what: "**Workup necrotizing infection** if streptococcal",
        why: "Necrotizing fasciitis frequent companion of GAS-TSS; surgical exploration low threshold" },
      { sev: "consider", what: "**Public-health notification** + contact prophylaxis for invasive GAS",
        why: "Mandatory reporting + household close-contact prophylaxis per CDC" },
    ],
  },
  rationale: {
    driver: "Sepsis with a toxin-mediated pattern — shock out of proportion to apparent local findings — is the high-acuity differential that captures undifferentiated TSS, necrotizing soft-tissue infection, and clostridial myonecrosis BEFORE the pathogen is confirmed. Empiric coverage is a triple combination: a broad β-lactam (pip-tazo or carbapenem) for the GNR/mixed substrate, vancomycin for MRSA, AND clindamycin 900 mg q8h for ribosomal toxin suppression in any toxin-producer (Eagle effect, IDSA SSTI 2014). Source control — urgent surgical exploration if necrotizing infection is plausible, tampon/foreign-body removal in suspected menstrual or post-partum TSS — drives outcome more than any antibiotic decision. IVIG is added in confirmed streptococcal TSS once microbiology returns; duration follows the confirmed source, ≥ 14 d typical.",
    guideline: "ssti",
    rejected: "β-lactam monotherapy without clindamycin was deliberately rejected — even bactericidal therapy fails to suppress the superantigen synthesis driving distributive shock (Stevens IDSA 2014), so clindamycin pairs with the cidal agent until a toxin producer is excluded. Routine empiric IVIG before microbiologic confirmation was tempered — Linnér (CID 2014) and Darenberg (CID 2003) anchor the mortality benefit to GAS-TSS specifically, and pre-emptive dosing in undifferentiated toxin-pattern sepsis wastes a scarce product without changing outcome." },
  objections: [
    { q: "Why empiric triple combination — narrower would suffice?",
      a: "Undifferentiated toxin-pattern sepsis spans GAS-TSS, staphylococcal TSS, necrotizing soft-tissue infection, and clostridial myonecrosis — the pathogen is unknown at presentation and the shock kinetics do not allow waiting. IDSA SSTI 2014 [cite:ssti] anchors broad β-lactam (pip-tazo or carbapenem) + vancomycin (MRSA) + clindamycin (toxin suppression) until microbiology speciates. Narrow empirics miss MRSA staphylococcal TSS or necrotizing GNR coverage — uniformly fatal in shock. De-escalate aggressively at 48–72 h on culture data." },
    { q: "Why clindamycin even with a cidal β-lactam already running?",
      a: "Cidal β-lactams kill organisms but do not suppress superantigen synthesis — TSST-1, SpeA, and SpeC continue to crosslink MHC-II to Vβ-TCR at high inoculum, driving cytokine storm and shock. The Eagle effect (saturated PBPs at stationary phase) further blunts β-lactam efficacy. Clindamycin's 50S ribosomal block halts toxin translation independent of growth phase per IDSA SSTI 2014 [cite:ssti]. Continue clindamycin until a toxin-producing organism is excluded — Mascini 2001 + Carapetis 2014 support adjunctive benefit in invasive GAS." },
    { q: "Why IVIG only for confirmed GAS-TSS, not pre-emptive?",
      a: "Linnér CID 2014 and Darenberg CID 2003 anchor IVIG mortality benefit to confirmed streptococcal TSS only [cite:ssti] — pooled IgG neutralizes circulating GAS superantigens. No comparable signal exists for staphylococcal TSS or undifferentiated toxin-pattern sepsis. Pre-emptive dosing in unconfirmed disease wastes a scarce, expensive product (cost ~$10K/dose, volume challenge in shock) without changing outcome. Add IVIG once GAS-TSS confirmed by culture or rapid antigen — 1 g/kg load + 0.5 g/kg × 2 d." },
    { q: "Why is source control more important than antibiotics here?",
      a: "Antibiotics + IVIG fail without source eradication — retained tampon, packed wound, necrotizing focus, or undrained abscess continuously seeds superantigen production. IDSA SSTI 2014 [cite:ssti] mandates emergent surgical exploration when necrotizing infection is plausible, tampon/foreign-body removal in suspected menstrual or post-partum TSS, and aggressive debridement of any wound source. Low threshold for OR exploration if GAS plus extremity involvement (necrotizing fasciitis cluster). The surgical alarm drives mortality reduction more than any antibiotic decision." },
  ],
  research: {
    headline: "Source control + clindamycin for toxin suppression; IVIG mortality benefit specific to GAS-TSS, not Staph TSS.",
    trials: [
      { name: "Linnér CID 2014",
        n: "Cohort",
        question: "IVIG in streptococcal toxic shock",
        finding: "IVIG associated with improved survival in confirmed GAS-TSS; benefit NOT generalizable to S. aureus TSS",
        bias: "Observational; subgroup-specific signal" },
      { name: "Stevens IDSA 2014",
        n: "Guideline",
        question: "TSS empiric strategy",
        finding: "Source control + clindamycin until toxin-producer excluded; IVIG for GAS-TSS confirmed",
        bias: "Guideline synthesis" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2014,
        topic: "TSS / toxic shock (Stevens)",
        keypoint: "Source control + clindamycin + IVIG for GAS-TSS; aggressive resuscitation + ICU" },
    ],
    openQuestions: [
      "Optimal IVIG dose + timing — early loading typical",
      "Clindamycin duration — 5+ d after stability",
      "Staph TSS IVIG — no clear benefit; controversy",
    ],
  },
};

export default { id: "sepsis-toxic", regimen, decision };
