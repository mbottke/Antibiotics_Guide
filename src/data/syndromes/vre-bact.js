/* ===========================================================
   VRE BACTEREMIA — daptomycin high-dose vs linezolid. ============ */

const regimen = {
  "First-line": [
    {
      rx: /daptomycin/i,
      pickIf: "VRE bacteremia — daptomycin first-line at most centers.",
      whyPick: [
        "**High-dose daptomycin 10–12 mg/kg** — VRE requires top of dose range",
        "Bactericidal — preferred in endovascular sources",
        "Once-daily, OPAT-friendly",
      ],
      watchOut: [
        { sev: "warn", text: "Dapto MIC creep in VRE — use highest dose band; consider combo for refractory" },
        { sev: "warn", text: "CK monitoring weekly; hold statin if possible" },
        { sev: "stop", text: "Never for pneumonia" },
      ],
    },
    {
      rx: /linezolid/i,
      pickIf: "Dapto contraindicated, VRE pneumonia, or oral step-down needed.",
      whyPick: [
        "**Linezolid 600 mg q12h** — bacteriostatic but effective non-endovascular",
        "Oral = IV bioavailability",
        "No renal dose adjustment",
      ],
      watchOut: [
        { sev: "warn", text: "Bacteriostatic — inferior in endocarditis" },
        { sev: "stop", text: "Serotonin syndrome with SSRI/MAOI" },
        { sev: "warn", text: "Cytopenias, neuropathy, lactic acidosis with > 14 d use" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "7-14 d daptomycin HD or linezolid; longer for endocarditis or persistent.",
    evidence: "IDSA / society consensus — dapto-HD preferred; linezolid alternative",
    branches: [
      { label: "Uncomplicated, source controlled", days: "7-14 d",
        detail: "Daptomycin 10-12 mg/kg HD or linezolid 600 mg q12h",
        matchAgent: /daptomycin|linezolid/i },
      { label: "Persistent on monotherapy", days: "Extended + combo",
        detail: "Add ampicillin or ceftaroline for synergy; salvage" },
      { label: "VRE endocarditis", days: "≥ 6 wk",
        detail: "Per IE bands; surgery often needed; combination therapy" },
    ],
    stopWhen: [
      "Blood cultures cleared ≥ 48 h",
      "Source controlled",
      "Afebrile",
      "Echo negative (or per IE bands)",
      "Minimum 7-14 d completed",
    ],
    extendIf: [
      { text: "**Endocarditis** — per IE bands",
        matchCtx: { severe: true } },
      "Persistent bacteremia — combo salvage",
      "Hardware retained — suppression or removal",
      "Immunocompromised host — extend per response",
    ],
  },
  monitoring: {
    headline: "Dapto HD vs linezolid; combo for refractory; CK + cytopenia surveillance.",
    items: [
      { sev: "required", what: "**Daptomycin 10-12 mg/kg HD** for bacteremia (NOT 4-6 mg/kg)",
        why: "High-dose required for VRE; standard dose under-treats",
        matchBranch: ["Uncomplicated, source controlled"] },
      { sev: "required", what: "**CK weekly + statin hold** on daptomycin",
        why: "Rhabdomyolysis risk increases with HD dosing + statin combo" },
      { sev: "required", what: "**CBC weekly** on linezolid > 14 d",
        why: "Cytopenias + peripheral neuropathy + lactic acidosis with prolonged use" },
      { sev: "trigger", what: "**TEE + endocarditis workup**",
        why: "VRE IE seeds prosthetic + native valves" },
      { sev: "trigger", what: "**Combination salvage** (dapto + amp or ceftaroline)",
        why: "Synergy for persistent / refractory; ID-driven",
        matchBranch: ["Persistent on monotherapy"] },
      { sev: "consider", what: "**Source workup** — GI, GU, line",
        why: "Enterococcal translocation from gut common" },
    ],
  },
  rationale: {
    driver: "VRE bacteremia treatment hinges on dose, not just drug — daptomycin 10–12 mg/kg high-dose is primary, NOT the 4–6 mg/kg used for SSTI, because standard dosing under-treats the higher VRE MICs and selects dapto-resistant subpopulations (Britt CID 2017 — high-dose reduced mortality + microbiologic failure). Linezolid 600 mg q12h is an equally acceptable alternative with bacteriostatic mechanism, but cytopenias + peripheral neuropathy + lactic acidosis limit courses > 14 d. Persistent VRE bacteremia on monotherapy triggers combination salvage with ceftaroline or ampicillin synergy. CK weekly + statin hold mandatory on daptomycin high-dose.",
    guideline: "ie",
    rejected: "Standard daptomycin dosing (4–6 mg/kg) for VRE bacteremia was deliberately rejected — Britt 2017 and IDSA 2011 require 10–12 mg/kg high-dose for bacteremic disease, and standard doses are associated with treatment failure + selection of dapto-non-susceptible E. faecium. Routine empiric combination therapy was tempered: monotherapy with high-dose daptomycin or linezolid is sufficient for uncomplicated cases, and combination is reserved for persistent bacteremia after 5–7 d of failing monotherapy or for IE." },
  objections: [
    { q: "Why daptomycin 10-12 mg/kg HD — standard is 6 mg/kg?",
      a: "Britt (CID 2017) [cite:ie] documented mortality + microbiologic failure reduction with high-dose daptomycin (10–12 mg/kg) vs standard 4–6 mg/kg in VRE bacteremia — VRE MICs run higher than MSSA / MRSA (1–2 mg/L baseline range) and standard dosing under-treats, selecting dapto-non-susceptible E. faecium. IDSA 2011 [cite:ie] mandates high-dose for bacteremic disease. Standard 6 mg/kg dapto for VRE bacteremia is an audit failure even when MIC reports as susceptible; the dose-response is mechanism-driven." },
    { q: "Why not linezolid first — equally effective and oral?",
      a: "Linezolid 600 mg q12h is an acceptable alternative per IDSA 2011 [cite:ie] with bacteriostatic mechanism, 100% oral bioavailability, and the OPAT advantage — but cytopenias + peripheral neuropathy + lactic acidosis + MAOI interactions limit courses > 14 d and complicate the post-discharge plan. Daptomycin HD is preferred for severe bacteremia, IE, and longer planned courses. The choice is patient-specific: linezolid wins for oral step-down + short course; daptomycin HD wins for endovascular substrate + longer duration." },
    { q: "Why combination ceftaroline + dapto for persistent VRE?",
      a: "Persistent VRE bacteremia on daptomycin monotherapy ≥ 5–7 d triggers combination salvage with ampicillin or ceftaroline per IDSA 2011 [cite:ie] — β-lactam-mediated cell-wall remodeling opens membrane permeability that allows dapto re-entry against dapto-resistant subpopulations. Sakoulas (2014) and Smith / Justo cohorts documented mortality + clearance benefit. The toxicity is real but lower than letting persistent bacteremia smolder; ID-driven combination is the inflection point when monotherapy fails." },
    { q: "Why CK weekly + statin hold on high-dose dapto?",
      a: "Daptomycin causes dose-dependent skeletal muscle injury (rhabdomyolysis) — the risk roughly doubles at 10–12 mg/kg vs 4–6 mg/kg, and concomitant statin therapy multiplies the risk per FDA labeling and IDSA 2011 [cite:ie]. CK weekly + statin hold are mandatory at high dose; CK > 5× ULN or symptomatic myalgia triggers drug discontinuation. The toxicity is reversible if caught early; missing it predicts AKI from rhabdomyolysis + permanent muscle injury." },
  ],
  research: {
    headline: "Daptomycin high-dose (10-12 mg/kg) primary; linezolid alternative; combination salvage for persistent.",
    trials: [
      { name: "Britt CID 2017",
        n: "Cohort",
        question: "Daptomycin dose in VRE bacteremia",
        finding: "Higher dose (10-12 mg/kg) reduced mortality + microbiologic failure; CK + statin monitoring",
        bias: "Observational" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2011,
        topic: "VRE bacteremia (Liu)",
        keypoint: "Daptomycin-HD primary; linezolid alternative; combination salvage for persistent" },
    ],
    openQuestions: [
      "Optimal duration in uncomplicated — 7-14 d",
      "Daptomycin MIC creep — ceftaroline salvage",
    ],
  },
};

export default { id: "vre-bact", regimen, decision };
