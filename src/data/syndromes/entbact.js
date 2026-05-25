/* ===========================================================
   ENTEROCOCCAL BACTEREMIA — IDSA + AHA. Ampicillin for amp-S;
   daptomycin or linezolid for VRE; long course for IE. =========== */

const regimen = {
  "E. faecalis (amp-S)": [
    {
      rx: /ampicillin|penicillin/i,
      pickIf: "E. faecalis bacteremia, ampicillin susceptible.",
      whyPick: [
        "**Ampicillin first-line** — bactericidal, cheap",
        "**2 g IV q4h** for endovascular / endocarditis sources",
        "Add **ceftriaxone** (synergy) for endocarditis — replaces gentamicin",
      ],
      watchOut: [
        { sev: "warn", text: "**Rule out endocarditis** — TEE if persistent bacteremia, valve disease, or community-acquired" },
        { sev: "note", text: "Ampicillin + ceftriaxone equally effective as amp + gent for IE — far less nephrotoxic" },
      ],
    },
  ],
  "E. faecium / VRE": [
    {
      rx: /daptomycin/i,
      pickIf: "VRE bacteremia (E. faecium typically); first-line in most centers.",
      whyPick: [
        "**High-dose dapto (10–12 mg/kg)** — VRE requires the higher dose band",
        "Rapidly bactericidal — preferred in endovascular sources",
        "Once-daily, OPAT-friendly",
      ],
      watchOut: [
        { sev: "warn", text: "**Dapto MIC creep** in VRE — use highest band; check CK weekly" },
        { sev: "warn", text: "**Rhabdomyolysis** — hold statin if possible" },
        { sev: "stop", text: "**Never for pneumonia** — surfactant inactivation" },
        { sev: "note", text: "Combine with β-lactam for synergy in refractory cases" },
      ],
    },
    {
      rx: /linezolid/i,
      pickIf: "Dapto contraindicated (CK elevation), or VRE pneumonia.",
      whyPick: [
        "**Bacteriostatic but effective** in non-endovascular VRE",
        "**Oral 100% bioavailable** — OPAT advantage",
        "No renal dose adjustment",
      ],
      watchOut: [
        { sev: "warn", text: "**Bacteriostatic** — inferior in endovascular sources (endocarditis)" },
        { sev: "stop", text: "**+ SSRI/MAOI** = serotonin syndrome" },
        { sev: "warn", text: "**Cytopenias, neuropathy** with > 14 d courses" },
        { sev: "warn", text: "**Lactic acidosis** — check serially in long courses" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "7-14 d uncomplicated; 6 wk if endocarditis; daptomycin high-dose for VRE bacteremia.",
    evidence: "IDSA / AHA — pathogen-specific; ampicillin still preferred for amp-S; VRE = dapto-HD or linezolid",
    branches: [
      { label: "E. faecalis (amp-S), line out", days: "7–14 d",
        detail: "Ampicillin or penicillin G; from first negative BCx" },
      { label: "Enterococcal endocarditis", days: "6 wk",
        detail: "Amp + ceftriaxone (preferred over amp+gent); per IE bands" },
      { label: "E. faecium / VRE", days: "7–14 d",
        detail: "Daptomycin 10–12 mg/kg HD or linezolid; ID consult",
        matchAgent: /daptomycin|linezolid/i },
      { label: "Persistent VRE bacteremia", days: "Extended + combo",
        detail: "Add β-lactam (ceftaroline or ampicillin) for synergy; salvage" },
    ],
    stopWhen: [
      "Blood cultures cleared ≥ 48 h",
      "Afebrile ≥ 48 h",
      "Line / source controlled",
      "Echo negative (or per IE bands if positive)",
      "Minimum 7-14 d completed",
    ],
    extendIf: [
      { text: "**Endocarditis** — extend to IE bands",
        matchCtx: { severe: true } },
      "Persistent bacteremia > 72 h on appropriate therapy",
      "Hardware retained",
      "HLAR isolate — adjust regimen but duration unchanged",
    ],
  },
  monitoring: {
    headline: "Susceptibility-driven; HLAR check; dapto HD for VRE; TEE if persistent.",
    items: [
      { sev: "required", what: "**Susceptibility testing** — amp, vanc, HLAR, dapto MIC",
        why: "Pathogen-specific therapy critical; HLAR drives gent vs ceftriaxone choice" },
      { sev: "required", what: "**Repeat blood cultures** at 48 h",
        why: "Persistent positivity = endocarditis / source workup" },
      { sev: "trigger", what: "**TEE if persistent bacteremia or community-acquired**",
        why: "Enterococcal IE in 20-30% of bacteremic; changes duration" },
      { sev: "trigger", what: "**Daptomycin high-dose (10-12 mg/kg)** for VRE bacteremia",
        why: "Standard band; CK weekly + statin hold",
        matchBranch: ["E. faecium / VRE"] },
      { sev: "trigger", what: "**Add ceftaroline or ampicillin** for persistent VRE",
        why: "Synergy salvage; ID-driven combination",
        matchBranch: ["Persistent VRE bacteremia"] },
      { sev: "consider", what: "Source workup — colon, urinary, biliary",
        why: "Enterococcal seeding from GI/GU tract" },
    ],
  },
  rationale: {
    driver: "Enterococcal bacteremia management hinges on species + susceptibility — E. faecalis (typically amp-S) gets ampicillin or penicillin G × 7–14 d for uncomplicated disease; E. faecium / VRE requires daptomycin 10–12 mg/kg high-dose or linezolid (Britt CID 2017 — higher dose reduced mortality + microbiologic failure). TEE is mandatory for persistent bacteremia or community-onset disease because enterococcal IE complicates 20–30% of bacteremic episodes and shifts duration to 6 wk. For E. faecalis IE, ampicillin + ceftriaxone replaced amp + gent as the preferred regimen (Fernandez-Hidalgo, CID 2013, n=246) — equivalent cure with substantially less nephrotoxicity.",
    guideline: "ie",
    rejected: "Routine ampicillin + gentamicin synergy for E. faecalis IE was deliberately rejected — Fernandez-Hidalgo demonstrated amp + ceftriaxone equivalent cure with markedly less AKI, and the renal cost of 2 wk of synergistic gentamicin is unnecessary in most amp-S disease. Standard 4–6 mg/kg daptomycin dosing for VRE bacteremia was rejected: Britt 2017 and IDSA 2011 require 10–12 mg/kg high-dose for bacteremia, as standard doses under-treat the higher MICs and select dapto-resistant subpopulations." },
  objections: [
    { q: "Why amp + ceftriaxone — historic regimen is amp + gent?",
      a: "Fernandez-Hidalgo (CID 2013, n=246) [cite:ie] established amp + ceftriaxone equivalent cure to amp + gent for E. faecalis IE with substantially less nephrotoxicity — the renal cost of 2-wk synergistic gentamicin in a typically elderly, renal-fragile cohort outweighed any incremental killing benefit. AHA 2015 + ESC 2023 [cite:ie] now endorse amp-CTX as preferred regardless of HLAR status because the dual β-lactam mechanism does not depend on aminoglycoside synergy. The principle is established; amp + gent is now reserved for amp + ceftriaxone failure or specific resistance scenarios." },
    { q: "Why TEE in all enterococcal bacteremia — routine fishing?",
      a: "Enterococcal IE complicates 20–30% of enterococcal bacteremia per AHA 2015 [cite:ie] — substantially higher than streptococcal or coliform bacteremia, and TEE finds vegetations that TTE misses in approximately one-third of cases. The yield justifies routine TEE in community-onset or persistent enterococcal bacteremia, especially with prosthetic valves or hardware. Missed IE here means a 7–14-d course where 6 wk + potential surgery were needed; the false-negative cost is high relative to the procedural risk." },
    { q: "Why daptomycin HD 10-12 mg/kg for VRE — standard is 6 mg/kg?",
      a: "Britt (CID 2017) [cite:ie] and IDSA 2011 require high-dose daptomycin (10–12 mg/kg) for VRE bacteremia — the 4–6 mg/kg used for SSTI and uncomplicated bacteremia under-treats higher VRE MICs (1–2 mg/L baseline range) and selects dapto-non-susceptible E. faecium subpopulations. CK weekly + statin hold are mandatory at high dose, but the mortality + microbiologic failure reduction is well-documented. Standard-dose dapto for VRE is an audit failure even when MIC reports as 'susceptible'." },
    { q: "Why combination salvage for persistent VRE — adds toxicity?",
      a: "Persistent VRE bacteremia on monotherapy ≥ 5–7 d triggers combination salvage with ampicillin or ceftaroline + daptomycin per IDSA 2011 [cite:ie] — synergistic killing bypasses dapto resistance mechanisms (cell-wall remodeling) and addresses the high-burden substrate. Sakoulas (2013) and Smith / Justo cohorts documented mortality + clearance benefit. The toxicity cost (CK rise, hepatotoxicity) is real but lower than letting the bacteremia smolder; ID-driven combination is the inflection point when monotherapy fails." },
  ],
  research: {
    headline: "Fernandez-Hidalgo 2013 validated ampicillin + ceftriaxone for E. faecalis IE; daptomycin-HD for VRE bacteremia.",
    trials: [
      { name: "Fernandez-Hidalgo CID 2013",
        n: "246",
        question: "Ampicillin + ceftriaxone vs ampicillin + gentamicin for E. faecalis IE",
        finding: "Equivalent cure with substantially less nephrotoxicity; established ampi-CTX as preferred for amp-S E. faecalis IE",
        bias: "Multi-center European cohort; reproducible elsewhere" },
      { name: "Britt CID 2017",
        n: "Cohort",
        question: "Daptomycin dose in VRE bacteremia",
        finding: "Higher dose (10–12 mg/kg) reduced mortality + microbiologic failure; CK monitoring + statin hold required",
        bias: "Observational; dose-response signal consistent" },
    ],
    guidelines: [
      { society: "IDSA / AHA",
        year: 2015,
        topic: "Enterococcal IE (Baddour)",
        keypoint: "Ampi-CTX for amp-S E. faecalis IE; dapto-HD for VRE; linezolid alternative; 6 wk standard for IE" },
    ],
    openQuestions: [
      "Optimal duration in uncomplicated enterococcal bacteremia — 7–14 d range",
      "Daptomycin MIC creep — emerging in some centers; ceftaroline salvage",
      "Routine TEE in enterococcal bacteremia — 20–30% IE incidence",
    ],
  },
};

export default { id: "entbact", regimen, decision };
