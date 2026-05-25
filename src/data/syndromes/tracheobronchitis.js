/* ===========================================================
   ACUTE TRACHEOBRONCHITIS (non-ventilated) — predominantly
   viral; antibiotics rarely indicated; pertussis exception. == */

const regimen = {
  "Selective therapy": [
    {
      rx: /macrolide|pertussis|viral/i,
      pickIf: "Most acute bronchitis is viral — antibiotics for documented pertussis only.",
      whyPick: [
        "**Acute bronchitis is viral in >90%** — no antibiotics indicated",
        "Treat **documented pertussis** with macrolide × 5 d (azithro) or 7 d (clarithro)",
        "Treatment for pertussis is for **transmission**, not symptom relief (already in cough phase)",
      ],
      watchOut: [
        { sev: "warn", text: "**No antibiotics** for purulent sputum alone — color doesn't equal bacteria" },
        { sev: "note", text: "Pertussis: notify public health; prophylax close contacts" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Antibiotics rarely indicated — most cases viral; treat pertussis + bacterial-confirmed only.",
    evidence: "ACP 2016 — antibiotics not recommended for uncomplicated acute bronchitis; harms exceed benefits in viral disease",
    branches: [
      { label: "Acute uncomplicated bronchitis (viral)", days: "0 d",
        detail: "Symptomatic care only; cough persists 2–3 wk normally; antibiotics not indicated" },
      { label: "Pertussis confirmed or strongly suspected", days: "5 d",
        detail: "Azithromycin × 5 d; reduces transmission but minimal symptom benefit beyond 1 wk illness",
        matchAgent: /azithromycin/i },
      { label: "Mycoplasma or chlamydophila confirmed", days: "5–7 d",
        detail: "Doxycycline or macrolide; symptom benefit modest",
        matchAgent: /doxycycline/i },
      { label: "Bacterial superinfection (purulent + persistent + new fever)", days: "5–7 d",
        detail: "Per CAP-light or sinopulmonary infection; document indication" },
      { label: "Underlying COPD / bronchiectasis exacerbation", days: "Per substrate",
        detail: "Per COPD or bronchiectasis bands; standalone tracheobronchitis rarely applies in chronic lung disease" },
    ],
    stopWhen: [
      "Course completed (if treated)",
      "Cough resolved or returning to baseline",
      "Afebrile",
      "No bacterial superinfection signal",
      "Transmission isolation lifted (pertussis)",
    ],
    extendIf: [
      { text: "**Bacterial superinfection** confirmed by culture + clinical change",
        matchCtx: { severe: true } },
      "Underlying COPD / bronchiectasis — per substrate bands",
      "Immunocompromised host — lower threshold to treat + extend",
      "Inadequate response — re-image for pneumonia",
    ],
  },
  monitoring: {
    headline: "Symptomatic care; antibiotics rarely indicated; pertussis exposure + transmission focus.",
    items: [
      { sev: "required", what: "**Antibiotic stewardship** — explain natural history (cough 2–3 wk)",
        why: "Acute bronchitis is viral; antibiotics drive resistance + side effects without benefit" },
      { sev: "required", what: "**Pertussis PCR** if cough > 2 wk or paroxysmal / post-tussive emesis",
        why: "Public health reporting + post-exposure prophylaxis + isolation drive transmission control" },
      { sev: "required", what: "**Image (CXR) if fever, tachycardia, focal exam, or hypoxia**",
        why: "Rule out pneumonia — changes diagnosis + duration + escalation" },
      { sev: "trigger", what: "**Symptomatic care** — bronchodilators if wheezing, lozenges, hydration",
        why: "Mainstay of care; sets expectations + reduces antibiotic pressure" },
      { sev: "trigger", what: "**Pertussis post-exposure prophylaxis** for household + close contacts",
        why: "Public health — azithro × 5 d for contacts; protects infants + immunocompromised" },
      { sev: "trigger", what: "**Influenza + COVID PCR** in season",
        why: "Antivirals change course if early; isolation planning" },
      { sev: "consider", what: "**Smoking cessation counseling**",
        why: "Highest-impact intervention; addressable at every visit" },
      { sev: "consider", what: "**Vaccinations review** — flu, COVID, pertussis (Tdap), pneumococcal",
        why: "Prevention reduces recurrent bronchitis incidence" },
    ],
  },
  rationale: {
    driver: "Acute bronchitis is overwhelmingly viral — Smith Cochrane 2017 (n=5099) showed antibiotics shorten cough by ~12 h while increasing AEs ~25%, and ACP 2016 explicitly recommends against treatment for uncomplicated bronchitis. The carve-outs are pertussis (azithromycin × 5 d; reduces transmission rather than symptoms) and confirmed bacterial superinfection with new fever / purulent sputum / focal exam. CXR is obtained whenever fever, tachycardia, focal exam, or hypoxia raises concern for pneumonia, which changes the entire calculus.",
    guideline: "stew",
    rejected: "Empiric antibiotics for the typical viral acute bronchitis presentation were deliberately rejected — IDSA / SHEA 2016 stewardship and ACP 2016 both identify acute bronchitis as a high-value de-prescribing target, and Smith Cochrane 2017 quantified the harm-to-benefit imbalance. Azithromycin for symptomatic benefit (rather than transmission control) in pertussis was tempered: macrolides given beyond the first week have minimal effect on cough duration." },
  objections: [
    { q: "Why no antibiotic for acute bronchitis — patient expects one?",
      a: "Acute bronchitis is overwhelmingly viral — Smith Cochrane 2017 meta (n=5,099) showed antibiotics produce a half-day cough reduction at the cost of adverse events and resistance. ACP 2016 + IDSA + CDC stewardship [cite:stew] explicitly discourage antibiotics for uncomplicated acute bronchitis. The conversation reframes patient expectations toward symptomatic care; reflexive prescription drives C. difficile and selection pressure without outcome benefit [cite:mono]." },
    { q: "Why treat suspected pertussis with macrolide if cough is established?",
      a: "Macrolide (azithromycin × 5 d) for pertussis is for transmission interruption, not symptom modification — by the time paroxysmal cough is established, the toxin-mediated phase has begun and antibiotics rarely alter clinical course. CDC pertussis guidance treats within 3 wk of cough onset to limit household + healthcare-worker spread. Index case workup and prophylaxis of close contacts is the public-health imperative [cite:cdc_abx]." },
    { q: "Why workup for atypical / pertussis instead of empiric azithromycin?",
      a: "Empiric azithromycin for every cough drives macrolide resistance in S. pneumoniae and selects for non-typhoidal Salmonella — [cite:stew] cautions against reflexive macrolide use. Targeted workup (PCR for Bordetella, mycoplasma, chlamydia, influenza) identifies pathogens warranting specific therapy. Stewardship reserves antibiotics for confirmed bacterial pathogens or substrate (post-viral bacterial superinfection in COPD per [cite:cap])." },
  ],
  research: {
    headline: "ACP 2016 + Smith Cochrane 2017 — acute bronchitis viral; antibiotics drive resistance without benefit.",
    trials: [
      { name: "Smith Cochrane 2017",
        n: "Meta (5,099)",
        question: "Antibiotics for acute bronchitis",
        finding: "Antibiotics give small reduction in cough by ~12 h but increase AEs ~25%; clinically not warranted",
        bias: "Heterogeneous severity + antibiotic class" },
      { name: "Stuart NEJM 2014",
        n: "Cohort",
        question: "Adult pertussis epidemiology + duration",
        finding: "Cough > 2 wk + paroxysmal + post-tussive emesis predict pertussis; PCR diagnostic + macrolide reduces transmission",
        bias: "Western country cohort; resource-limited may differ" },
    ],
    guidelines: [
      { society: "ACP / CDC",
        year: 2016,
        topic: "Acute bronchitis antibiotic stewardship",
        keypoint: "Antibiotics NOT recommended for uncomplicated acute bronchitis; pertussis + bacterial superinfection are exceptions" },
      { society: "IDSA",
        year: 2024,
        topic: "Adult vaccination including pertussis",
        keypoint: "Tdap every 10 yr; addresses pertussis transmission + protects infants + immunocompromised" },
    ],
    openQuestions: [
      "Bronchodilator efficacy in acute bronchitis — meta-analyses inconsistent",
      "Pertussis post-exposure prophylaxis efficacy — observational support; RCT lacking",
      "Procalcitonin-guided antibiotic decision in bronchitis — institutional variation",
    ],
  },
};

export default { id: "tracheobronchitis", regimen, decision };
