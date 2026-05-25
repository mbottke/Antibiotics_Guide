/* ===========================================================
   TRANSPLANT UTI — recurrent, atypical pathogens, drug interactions. */

const regimen = {
  "Empiric": [
    {
      rx: /antipseudomonal|carbapenem/i,
      pickIf: "Renal-transplant UTI — broaden for prior MDR, anticipate ESBL/CRE.",
      whyPick: [
        "**Pick by transplant patient's prior cultures** — they're colonized with resistant flora",
        "**Carbapenem** if ESBL history",
        "**Avoid FQ + immunosuppressants** — interactions (cyclosporine, tacrolimus levels)",
      ],
      watchOut: [
        { sev: "warn", text: "**Coordinate with transplant ID** — antibiotic choice affects graft" },
        { sev: "note", text: "BK virus reactivation in graft — check if culture-negative pyuria" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "7-14 d per pathogen + immunosuppression; treat asymptomatic in first 3 months post-tx.",
    evidence: "AST 2019 — early post-tx ASB treated; later asymptomatic not treated; longer course for resistant",
    branches: [
      { label: "Early post-tx (< 3 mo), symptomatic", days: "10-14 d",
        detail: "Treat aggressively; broad empiric until cultures back; carbapenem if prior MDR" },
      { label: "Late post-tx, symptomatic", days: "7-14 d",
        detail: "Per non-transplant UTI bands; tailor to local antibiogram + prior cultures" },
      { label: "ESBL / MDR (common in recurrent)", days: "10-14 d",
        detail: "Carbapenem or novel β-lactam; ID consult",
        matchAgent: /ertapenem|meropenem/i },
      { label: "Asymptomatic bacteriuria (early post-tx)", days: "5-7 d",
        detail: "Treat in first 3 mo post-tx; do NOT treat later asymptomatic" },
    ],
    stopWhen: [
      "Cultures cleared",
      "Symptoms resolved",
      "Renal function stable",
      "Immunosuppression unchanged or addressed",
      "Minimum 7-14 d completed",
    ],
    extendIf: [
      { text: "**Resistant organism / MDR** — extend per ID",
        matchCtx: { esblRisk: true } },
      "Inadequate source control (obstruction, abscess)",
      "Bacteremia — extend per source",
      "Recurrent infection — workup anatomic/immune",
    ],
  },
  monitoring: {
    headline: "Coordinate with transplant ID; check drug interactions; early-post-tx ASB treated.",
    items: [
      { sev: "required", what: "**Coordinate with transplant ID** at presentation",
        why: "Drug-immunosuppressant interactions complex; specialty input critical" },
      { sev: "required", what: "**Drug interaction screen** — cyclosporine, tacrolimus, sirolimus levels",
        why: "FQ ↑ tacrolimus levels; rifampin ↓; many critical interactions" },
      { sev: "required", what: "**Treat asymptomatic bacteriuria** in first 3 mo post-tx",
        why: "AST 2019 — early post-tx period high-risk; later asymptomatic not treated" },
      { sev: "trigger", what: "**Imaging if no response by 72 h**",
        why: "Obstruction, abscess, graft involvement" },
      { sev: "trigger", what: "**Workup graft pyelonephritis** — graft tenderness, fever, dysuria",
        why: "Renal-transplant pyelonephritis presents differently; image early" },
      { sev: "consider", what: "**BK virus workup** if culture-negative pyuria",
        why: "BK reactivation common in transplant + dysuria" },
    ],
  },
  rationale: {
    driver: "Renal transplant UTI is calibrated by post-transplant interval and immunosuppression — AST IDCOP 2019 (Fishman) anchors a treat-the-asymptomatic stance only in the first 3 months post-tx (when graft tolerance, ureteric stent, and immunosuppression converge), and an explicit do-not-treat stance for ASB beyond that window. Empirics broaden empirically to cover prior MDR isolates and ESBL substrate (carbapenem when prior history positive), with 10–14 d for symptomatic early disease and 7–14 d later. Drug-interaction screen for calcineurin-inhibitor levels (FQ + macrolide raise tacrolimus; rifampin drops it) runs in parallel — transplant ID coordination is mandatory.",
    guideline: "balance",
    rejected: "Reflexive ASB treatment beyond the early post-transplant window was deliberately rejected — AST 2019 + Nicolle (IDSA 2019) anchor stewardship: antibiotic exposure drives resistance, AKI, and C. difficile without preventing symptomatic UTI. Empiric narrow ceftriaxone in patients with prior MDR isolates was tempered: transplant cohort UTI carries a high ESBL / carbapenem-resistant baseline, and broader empiric coverage with rapid de-escalation is preferred over a narrow start that risks under-treatment in a high-acuity host." },
  objections: [
    { q: "Why no antibiotics for asymptomatic transplant beyond 2 months?",
      a: "AST IDCOP 2019 [cite:fishman] anchors a do-not-treat stance for asymptomatic bacteriuria beyond 1–3 months post-transplant — Origuen (Transpl Infect Dis 2016) RCT showed no difference in graft pyelonephritis, graft loss, or mortality with treatment, but more resistance and CDI [cite:stew]. The early window (immediate post-tx with stent in place) is the validated exception. Beyond that, antibiotic exposure drives harm without benefit." },
    { q: "Why broaden empirics — narrow ceftriaxone usually works?",
      a: "Renal transplant UTI carries elevated baseline ESBL / carbapenem-resistant prevalence from prior healthcare exposure and prophylaxis pressure per AST 2019 [cite:fishman] — narrow ceftriaxone misses up to 30–40% of isolates in this cohort. IDSA AMR-GN 2024 [cite:amrgn] supports empiric carbapenem when prior MDR isolate or recent broad antibiotics are present; de-escalate rapidly on cultures. Under-treatment in a high-acuity host outweighs the stewardship cost of broad-then-narrow." },
    { q: "Why check tacrolimus levels with FQ start?",
      a: "Fluoroquinolones and macrolides inhibit CYP3A4 / P-gp and raise tacrolimus and cyclosporine levels by 30–100%, driving nephrotoxicity and neurotoxicity within days per AST 2019 [cite:fishman]. Rifampin does the opposite, dropping levels and risking rejection. Transplant ID coordination plus daily calcineurin-inhibitor levels for the first week of any new antibiotic is mandatory [cite:stew]. Drug interactions are a survival issue in this cohort." },
  ],
  research: {
    headline: "AST 2019 — early post-tx ASB treated; later asymptomatic NOT treated; drug interactions complex.",
    trials: [
      { name: "AST IDCOP 2019",
        n: "Guideline",
        question: "Modern transplant UTI management",
        finding: "Early post-tx (< 3 mo) ASB treated; later asymptomatic NOT treated; broaden empiric per prior cultures",
        bias: "Society consensus" },
    ],
    guidelines: [
      { society: "AST",
        year: 2019,
        topic: "Solid-organ transplant UTI",
        keypoint: "Transplant ID + drug interaction screen; treat early ASB; pathogen-directed long course for resistant" },
    ],
    openQuestions: [
      "BK virus workup — when culture-negative + dysuria",
      "Graft pyelonephritis imaging threshold",
    ],
  },
};

export default { id: "transplant-uti", regimen, decision };
