/* ===========================================================
   SSTI · NECROTIZING FASCIITIS — surgical emergency; antibiotics
   adjunct. Clindamycin until toxin-producing strep excluded. ===  */

const regimen = {
  "Immediate": [
    {
      rx: /SURGICAL|vancomycin.*piperacillin|clindamycin/i,
      pickIf: "Necrotizing fasciitis suspected — SURGERY NOW + broad antibiotics + clindamycin.",
      whyPick: [
        "**Surgery is the treatment** — antibiotics adjunctive; debridement within HOURS",
        "**Vancomycin + pip-tazo + clindamycin** — broad bacterial + toxin suppression",
        "**Clindamycin** suppresses streptococcal exotoxin (ribosomal block) — keep until GAS ruled out",
        "**IVIG** for streptococcal TSS (mortality benefit)",
        "Mortality: 20–40% even with optimal surgery + antibiotics",
      ],
      watchOut: [
        { sev: "stop", text: "**Imaging delay = death** — operate on clinical suspicion; don't wait for CT" },
        { sev: "warn", text: "**LRINEC** has poor sensitivity — negative score does NOT rule out NF" },
        { sev: "warn", text: "Pain out of proportion to exam, hard wood-like skin, hemorrhagic bullae, crepitus, anesthesia" },
        { sev: "note", text: "Type 1 (polymicrobial — diabetic/perineal), Type 2 (monomicrobial GAS), Type 3 (Vibrio in salt water)" },
      ],
    },
  ],
  "Group A strep / Clostridium confirmed": [
    {
      rx: /penicillin.*clindamycin/i,
      pickIf: "GAS or Clostridium confirmed — narrow to penicillin + keep clindamycin.",
      whyPick: [
        "**Penicillin G** narrow-spectrum cidal — preferred over broader β-lactam once confirmed",
        "**Continue clindamycin** for full toxin-suppression — don't drop just because narrowed",
        "**IVIG 1–2 g/kg** for streptococcal TSS — mortality benefit (observational + small RCTs)",
        "**Linezolid** alternative to clinda if clinda-resistant or C. diff history (also suppresses toxin)",
      ],
      watchOut: [
        { sev: "warn", text: "**Don't drop clindamycin** until clinically stable + tissue cultures growing only GAS — premature narrowing risks toxin resurgence" },
        { sev: "warn", text: "**Clindamycin → C. difficile** — accept the risk in TSS; switch to linezolid + metronidazole prophylaxis if recurrent C. diff history" },
        { sev: "note", text: "**Surgical re-look every 24 h** until margins clean — necrosis can extend silently under antibiotic coverage" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Continue IV until clinically clear; clindamycin until toxin-producing organism excluded.",
    evidence: "IDSA 2014 + society consensus — no fixed duration; surgical adequacy drives course",
    branches: [
      { label: "Polymicrobial type I (gut/perineal)", days: "Until clear",
        detail: "Pip-tazo or carbapenem + vancomycin + clindamycin; continue until clinical + surgical resolution" },
      { label: "Group A strep type II (limb)", days: "10–14 d post-surgical",
        detail: "Penicillin + clindamycin; IVIG for streptococcal TSS" },
      { label: "Vibrio / Aeromonas (water exposure)", days: "10–14 d",
        detail: "Doxycycline + ceftriaxone; salt water (Vibrio) vs fresh (Aeromonas) drives speciation" },
    ],
    stopWhen: [
      "Surgical margins clean on serial debridement",
      "Afebrile ≥ 48 h",
      "Off vasopressors; clinical stability",
      "Wound closing / negative-pressure dressing working",
      "Cultures cleared / appropriate narrowing complete",
    ],
    extendIf: [
      { text: "**Persistent surgical disease** — continue until margins are clean",
        matchCtx: { severe: true } },
      "Streptococcal TSS — extend clindamycin + IVIG per response",
      "Bacteremia — duration drives per pathogen",
      "Immunocompromised host — extended course typical",
    ],
  },
  monitoring: {
    headline: "Surgical re-look q24h until margins clean; clindamycin until toxin-producer excluded; IVIG for strep TSS.",
    items: [
      { sev: "required", what: "**Surgical re-look every 24 h** until margins are clean",
        why: "Necrosis extends silently under antibiotic cover; surgical adequacy is the bedside metric" },
      { sev: "required", what: "**Continue clindamycin** until toxin-producing strep / Clostridium excluded by culture",
        why: "Ribosomal block suppresses exotoxin production; cidal antibiotic alone insufficient in TSS" },
      { sev: "trigger", what: "**IVIG 1 g/kg day 1, 0.5 g/kg days 2–3** only if streptococcal TSS confirmed",
        why: "Mortality benefit limited to GAS toxic-shock (observational + small RCTs); not indicated in polymicrobial type I",
        matchBranch: ["Group A strep type II (limb)"] },
      { sev: "trigger", what: "**Anti-MRSA agent** (vancomycin or linezolid) if MRSA-risk substrate",
        why: "Community MRSA can present as necrotizing infection; standard part of empiric in U.S.",
        matchCtx: { mrsaRisk: true } },
      { sev: "consider", what: "Hyperbaric oxygen for clostridial myonecrosis where institutionally available",
        why: "Evidence weak / contested; NEVER delay surgical debridement; not standard of care" },
      { sev: "consider", what: "Reconstructive surgery referral for closure after debridement complete",
        why: "Flap / graft / negative-pressure dressing — multi-stage closure planning" },
    ],
  },
  rationale: {
    driver: "Necrotizing fasciitis is a surgical emergency — antibiotics are adjunctive, debridement is the disease. Mishra (Surgery Today 2017) shows mortality < 10% when the OR is within 12 h, climbing > 40% past 24 h, so time-to-debridement is the single most modifiable factor. Empiric coverage is broad polymicrobial (pip-tazo or carbapenem + vancomycin) plus clindamycin for toxin suppression in any GAS or clostridial substrate. Duration follows surgical adequacy — continued until margins are clean on serial re-look, typically 48–72 h after the last debridement (IDSA 2014; WSES 2018).",
    guideline: "ssti",
    rejected: "Antibiotic-driven 'wait and see' management was deliberately rejected — Stevens IDSA 2014 and WSES are emphatic that surgical exploration is required at clinical suspicion, and antibiotic-only treatment of established necrotizing infection has near-universal failure with mortality climbing 10% per hour of delay. Hyperbaric oxygen was tempered: evidence is weak and contested, and it must never delay surgical debridement. Reflexive IVIG outside of confirmed GAS toxic shock was rejected — benefit is GAS-specific, not polymicrobial type I." },
  objections: [
    { q: "Why rush to OR — can't antibiotics buy time?",
      a: "Antibiotics alone cannot penetrate non-perfused necrotic tissue; surgical debridement within 12–24 h is the single strongest predictor of survival. Mishra 2017 and other cohorts show mortality doubles with each delay tier. Antibiotics + clindamycin for toxin suppression are essential adjuncts but never a substitute for source control [cite:ssti]." },
    { q: "Why add clindamycin if pip-tazo already covers strep?",
      a: "Clindamycin is the Eagle-effect agent: it suppresses ribosomal exotoxin and M-protein production at stationary phase when β-lactam binding is reduced. Continue until toxin-producing group A strep or clostridia are excluded by culture. β-lactam alone treats the bug but not the toxin driving shock and tissue loss [cite:ssti]." },
    { q: "Why IVIG only for streptococcal TSS, not all nec fasc?",
      a: "IVIG neutralizes superantigens specific to group A strep TSS; the evidence base (observational + small RCTs) does not extend to polymicrobial type I or Vibrio disease. Reserve for GAS-confirmed or strongly suspected TSS with shock; institutional availability and cost preclude routine empiric use [cite:ssti]." },
  ],
  research: {
    headline: "Surgery drives outcome — antibiotic alone fails; clindamycin for toxin suppression; IVIG benefit GAS-specific.",
    trials: [
      { name: "Mishra Surgery Today 2017",
        n: "Cohort",
        question: "Timing of debridement and mortality in NF",
        finding: "Debridement < 12 h → mortality < 10%; delay > 24 h → mortality > 40%; time-to-OR is the most modifiable factor",
        bias: "Observational; selection by clinical severity" },
      { name: "Eckmann Lancet ID 2011",
        n: "Cohort",
        question: "Empiric antibiotic adequacy in NF",
        finding: "Broad-spectrum empiric coverage (carbapenem + vanco + clinda) reduces inadequate-coverage mortality",
        bias: "Single-country German cohort; replicated by registries" },
      { name: "Linnér CID 2014",
        n: "Cohort",
        question: "IVIG in streptococcal TSS / necrotizing infection",
        finding: "IVIG associated with improved survival in STSS subgroup; benefit limited to GAS — not polymicrobial NF",
        bias: "Observational; subgroup-specific signal" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2014,
        topic: "SSTI including necrotizing fasciitis (Stevens)",
        keypoint: "Surgical debridement is the cure; broad antibiotics + clindamycin until toxin-producer excluded" },
      { society: "WSES",
        year: 2018,
        topic: "Necrotizing soft tissue infections",
        keypoint: "Aligned with IDSA; emphasizes serial re-look + ICU coordination" },
    ],
    openQuestions: [
      "Hyperbaric oxygen for clostridial myonecrosis — institutional variation; never delay surgery",
      "IVIG dosing + timing for STSS — observational data only; small RCTs underpowered",
      "Adjunctive steroids for septic shock in NF — case-by-case; no specific RCT data",
    ],
  },
};

export default { id: "necfasc", regimen, decision };
