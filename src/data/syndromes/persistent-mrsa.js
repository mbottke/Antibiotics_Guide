/* ===========================================================
   PERSISTENT MRSA BACTEREMIA — salvage protocols. ================ */

const regimen = {
  "Salvage": [
    {
      rx: /daptomycin|ceftaroline/i,
      pickIf: "MRSA bacteremia persisting > 7 d on vancomycin.",
      whyPick: [
        "**Dapto 8–10 mg/kg + ceftaroline** combination — synergy",
        "Or single-agent dapto high-dose (10–12 mg/kg)",
        "**Search for hidden source** — TEE, PET-CT, abscess",
      ],
      watchOut: [
        { sev: "warn", text: "Source control critical — antibiotics alone won't clear endocarditis with veg" },
        { sev: "note", text: "ID consult for all persistent MRSA bacteremia" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Extend per source + endovascular workup; salvage with dapto+ceftaroline if vanco-failing.",
    evidence: "Society consensus — persistent ≥ 7 d on vanco triggers salvage; surgical source control",
    branches: [
      { label: "Vanco-failing, source control achievable", days: "≥ 4 wk salvage",
        detail: "Switch to daptomycin 10 mg/kg ± ceftaroline; from first negative BCx",
        matchAgent: /daptomycin|ceftaroline/i },
      { label: "Endocarditis confirmed", days: "≥ 6 wk + surgery",
        detail: "Per IE bands; surgery threshold low for persistent" },
      { label: "Endovascular foci / mycotic aneurysm", days: "Extended + repair",
        detail: "Surgical repair + 6+ wk; ID + vascular surgery" },
    ],
    stopWhen: [
      "Blood cultures cleared ≥ 48 h",
      "Source identified + controlled",
      "Endovascular workup complete (TEE / PET-CT)",
      "Surgery completed if indicated",
      "Minimum 4-6 wk completed",
    ],
    extendIf: [
      { text: "**Endocarditis** — per IE bands",
        matchCtx: { severe: true } },
      "Mycotic aneurysm — surgical repair + extended",
      "Hardware retained — suppression or removal",
      "Persistent BCx on salvage — ID emergency",
    ],
  },
  monitoring: {
    headline: "Salvage with dapto+ceftaroline; PET-CT for occult source; surgery for endovascular.",
    items: [
      { sev: "required", what: "**Daptomycin 10 mg/kg + ceftaroline** for vanco failure",
        why: "Synergistic killing; mortality benefit in observational salvage data",
        matchBranch: ["Vanco-failing, source control achievable"] },
      { sev: "required", what: "**TEE + PET-CT** for occult source workup",
        why: "Persistent MRSA bacteremia has occult source in 30–50%" },
      { sev: "required", what: "**ID consult mandatory**",
        why: "Salvage protocols complex; mortality benefit with specialty input" },
      { sev: "trigger", what: "**Surgical consult for endovascular / abscess**",
        why: "Source control essential for cure" },
      { sev: "trigger", what: "**MRI spine + brain** for metastatic foci",
        why: "Vertebral osteo + brain abscess common; changes duration" },
      { sev: "consider", what: "**CK weekly + statin hold** on daptomycin",
        why: "Rhabdomyolysis risk; reversible if caught early" },
    ],
  },
  rationale: {
    driver: "Persistent MRSA bacteremia at ≥ 7 d on appropriate vancomycin is a salvage emergency — mortality climbs steeply, and an unidentified endovascular or metastatic focus is present in 30–50% of cases. The salvage protocol is daptomycin 10 mg/kg + ceftaroline combination (Geriak AAC 2019 — mortality 0% combination vs 26% vanco-only in small persistent cohort), with synergy that bypasses vancomycin failure mechanisms (MIC creep, biofilm, intracellular persistence). PET-CT identifies occult source in 30–50% (Holland CID 2019) and changes management. ID consult mandatory; mortality benefit replicates across registries.",
    guideline: "arrest",
    rejected: "Continuing higher-dose vancomycin alone past day 7 of persistent bacteremia was deliberately rejected — Geriak and successor cohorts established that the failure mechanism is vancomycin-specific (heteroresistance, AUC ceiling, biofilm penetration) and not dose-responsive; doubling down on the failing agent wastes time. Adding rifampin to vancomycin for persistent MRSA bacteremia was tempered: ARREST (Lancet 2018) showed no mortality benefit in SAB and increased drug interactions — rifampin retains its role only in PVE staph + retained hardware." },
  objections: [
    { q: "Why dapto + ceftaroline — can we push vanco AUC higher?",
      a: "Geriak (AAC 2019) [cite:arrest] documented daptomycin + ceftaroline mortality 0% (0/17) vs vancomycin-only 26% (6/23) in persistent MRSA bacteremia salvage — the failure mechanism in vanco-persistence is not dose-responsive (heteroresistance, AUC ceiling, biofilm + intracellular persistence), and pushing vanco AUC > 600 simply increases AKI without solving the killing problem. The β-lactam + dapto combination opens membrane permeability that dapto alone cannot overcome at the typical vanco-failing MIC range. Switch, don't escalate." },
    { q: "Why PET-CT at day 7 — TEE was already negative?",
      a: "Holland (CID 2019) [cite:arrest] documented that PET-CT identifies an occult metastatic focus in 30–50% of persistent MRSA bacteremia even when TEE is negative — vertebral osteomyelitis, paraspinal abscess, splenic foci, and lung emboli are the highest-yield finds. Each occult focus changes management (duration extension, surgical drainage, regimen choice). TEE addresses the endocardium; PET-CT addresses everything else metabolically. Both are required in persistent SAB, not either-or." },
    { q: "Why add rifampin for persistent MRSA — extends ARREST verdict?",
      a: "ARREST (Lancet 2018, n=770) [cite:arrest] showed no mortality benefit from adjunctive rifampin in SAB and increased AEs (hepatitis, GI, CYP3A4 interactions including warfarin) — the verdict extends to persistent MRSA bacteremia in the native-valve / non-hardware substrate. Rifampin retains its role only in PVE staph + retained hardware for biofilm penetration on prosthetic material per IDSA 2011 / AHA 2015 [cite:ie]. Adding it reflexively to persistent SAB exposes the patient to harm without offsetting benefit." },
    { q: "Why ID consult mandatory — we're already on guideline-driven regimen?",
      a: "ID consultation for SAB and persistent MRSA bacteremia carries roughly half-mortality benefit replicated across registry analyses (Vogel 2016, Lopez-Cortes 2013) [cite:ie] — the benefit is from systematic source workup, regimen optimization (PK-driven AUC, salvage timing), surgical input, and follow-up echo / imaging windows that protocol-only management misses. Skipping ID in persistent disease is an audit failure even when the empiric regimen is correct on paper; the consult is part of the bundle." },
  ],
  research: {
    headline: "Vanco failure → daptomycin + ceftaroline salvage; PET-CT for occult source; persistent ≥ 7 d triggers protocol.",
    trials: [
      { name: "Geriak AAC 2019",
        n: "Cohort",
        question: "Daptomycin + ceftaroline salvage for persistent MRSA bacteremia",
        finding: "Combination reduced mortality 0% (0/17) vs 26% (6/23) vanco-only in persistent MRSA bacteremia; small observational salvage cohort",
        bias: "Small + observational; ACTIVE-NA prospective" },
      { name: "Holland CID 2019",
        n: "Cohort",
        question: "Occult source workup in persistent MRSA bacteremia",
        finding: "PET-CT identifies occult focus in 30–50%; changes duration + management",
        bias: "Single-center; replicated" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2011,
        topic: "MRSA infections (Liu)",
        keypoint: "Daptomycin 10 mg/kg + ceftaroline for vanco failure; PET-CT + surgical consult mandatory" },
    ],
    openQuestions: [
      "Optimal combination — dapto + ceftaroline vs dapto + fosfomycin",
      "PET-CT timing — after 7 d persistent bacteremia",
      "Surgical threshold for occult source — vascular vs orthopedic",
    ],
  },
};

export default { id: "persistent-mrsa", regimen, decision };
