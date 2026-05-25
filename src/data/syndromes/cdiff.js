/* ===========================================================
   C. DIFFICILE INFECTION — IDSA / SHEA 2021 (Johnson). Initial
   vs recurrence drives drug choice; fulminant adds IV metro +
   surgery threshold. =============================================== */

const regimen = {
  "Initial episode": [
    {
      rx: /fidaxomicin/i,
      pickIf: "Initial C. diff episode — IDSA-preferred (2021 update).",
      whyPick: [
        "**IDSA 2021 first-line** (upgraded from vanco)",
        "**Lower recurrence** rate than vanco (~13% vs ~25%)",
        "**Narrow spectrum** — spares gut flora better",
        "**200 mg PO BID × 10 d**",
      ],
      watchOut: [
        { sev: "warn", text: "**Cost barrier** — ~$5,000 / course; may need PA / restricted formulary" },
        { sev: "note", text: "Vancomycin acceptable if fidax unaffordable / unavailable" },
      ],
    },
    {
      rx: /vancomycin/i,
      pickIf: "Initial C. diff when fidaxomicin unavailable or cost-prohibitive.",
      whyPick: [
        "**Oral vancomycin 125 mg PO QID × 10 d** — equivalent cure to fidax",
        "Cheap, broadly available",
        "**Higher recurrence** than fidaxomicin (~25% vs ~13%)",
      ],
      watchOut: [
        { sev: "stop", text: "**IV vancomycin doesn't treat C. diff** — must be oral or rectal" },
        { sev: "warn", text: "Not absorbed orally — minimal systemic side effects" },
        { sev: "note", text: "Don't use metronidazole as first-line anymore (inferior efficacy)" },
      ],
    },
  ],
  "Fulminant": [
    {
      rx: /vancomycin.*metronidazole|oral|NG/i,
      pickIf: "Fulminant C. diff — hypotension, ileus, megacolon, or organ failure.",
      whyPick: [
        "**Oral/NG vancomycin 500 mg q6h + IV metronidazole 500 mg q8h**",
        "**Rectal vancomycin** (500 mg in 100 mL NS retention enema q6h) if ileus",
        "**Surgical consult immediately** — subtotal colectomy if no improvement at 24–48 h",
        "Diverting loop ileostomy + colonic lavage emerging alternative",
      ],
      watchOut: [
        { sev: "stop", text: "**Surgery delay = death** in fulminant disease" },
        { sev: "warn", text: "STOP loperamide, opiates, anticholinergics" },
        { sev: "warn", text: "Avoid PPIs when possible during treatment + post" },
      ],
    },
  ],
  "Recurrence": [
    {
      rx: /fidaxomicin|tapered|pulsed|bezlotoxumab|FMT/i,
      pickIf: "Second or later C. diff episode.",
      whyPick: [
        "**Fidaxomicin** (standard or extended-pulsed) — preferred for first recurrence",
        "**Tapered/pulsed vancomycin** acceptable alternative",
        "**Bezlotoxumab** infusion to prevent further recurrence (high-risk patients)",
        "**FMT** for ≥ 2 recurrences — 80–90% cure rates",
      ],
      watchOut: [
        { sev: "warn", text: "Bezlotoxumab caution in CHF — fluid overload signal" },
        { sev: "note", text: "Refer to GI / ID for FMT planning" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "10 d for initial / first-recurrence (fidaxomicin or vancomycin PO); fulminant requires combo + surgery threshold.",
    evidence: "IDSA / SHEA 2021 — fidaxomicin preferred over vanco; fulminant managed with combo + early surgical consultation",
    branches: [
      { label: "Initial episode, non-fulminant", days: "10 d",
        detail: "Fidaxomicin 200 mg BID × 10 d preferred; PO vancomycin 125 mg QID × 10 d acceptable alternative",
        matchAgent: /fidaxomicin/i },
      { label: "First recurrence", days: "10 d or pulsed",
        detail: "Fidaxomicin × 10 d OR pulsed/tapered vanco × 6–8 wk; bezlotoxumab adjunct for high-risk",
        matchAgent: /bezlotoxumab/i },
      { label: "Fulminant (ileus, megacolon, shock)", days: "10–14 d + OR",
        detail: "PO/NG vancomycin 500 mg QID + IV metronidazole; rectal vanco + early colectomy threshold",
        matchAgent: /metronidazole/i },
      { label: "Multiple recurrences (≥ 2)", days: "FMT + 10 d bridge",
        detail: "Fecal microbiota transplant or bezlotoxumab — long-term recurrence prevention" },
    ],
    stopWhen: [
      "Diarrhea resolved (≤ 3 unformed stools / day baseline)",
      "Afebrile and clinically improved",
      "WBC trending toward normal",
      "Minimum 10 d course completed",
      "No new abdominal pain / distension",
      "Discontinue offending antibiotics from inciting course if possible",
    ],
    extendIf: [
      { text: "**Fulminant disease** (ileus, megacolon, shock) — combo + extend per response",
        matchCtx: { severe: true } },
      "Persistent diarrhea > 7 d despite appropriate therapy — re-eval diagnosis + alternate etiology",
      "Pulsed / tapered course in recurrence — extends total drug exposure to 6–8 wk",
      "Severe colitis on imaging — extend by drainage + surgical eval",
    ],
  },
  monitoring: {
    headline: "Daily clinical assessment; stop offending antibiotics if possible; surgical consult low threshold for fulminant.",
    items: [
      { sev: "required", what: "**Stop offending antibiotics from inciting course** when clinically possible",
        why: "Microbiome recovery essential for cure; continued broad therapy perpetuates dysbiosis" },
      { sev: "required", what: "**Daily clinical assessment** — diarrhea frequency, abdominal exam, WBC, lactate",
        why: "Fulminant disease can evolve quickly; daily reassessment catches escalation early" },
      { sev: "required", what: "**Surgical consult** for fulminant disease at presentation + daily",
        why: "Subtotal colectomy or diverting ileostomy at right window improves mortality",
        matchCtx: { severe: true } },
      { sev: "trigger", what: "**Abdominal imaging (CT)** if abdominal distension / sepsis / no improvement",
        why: "Toxic megacolon, microperforation, pneumatosis — surgical indications" },
      { sev: "trigger", what: "**IV metronidazole + rectal vancomycin** for ileus preventing oral delivery",
        why: "Standard PO vanco useless in ileus; rectal route ensures luminal delivery",
        matchBranch: ["Fulminant (ileus, megacolon, shock)"] },
      { sev: "trigger", what: "**Bezlotoxumab** infusion at first recurrence for high-risk hosts",
        why: "Monoclonal antibody to TcdB; reduces further recurrence ~40% in high-risk",
        matchBranch: ["First recurrence"] },
      { sev: "trigger", what: "**FMT referral** at 2+ recurrences",
        why: "FMT cure rate > 90% in recurrent disease; far superior to repeated antibiotic courses",
        matchBranch: ["Multiple recurrences (≥ 2)"] },
      { sev: "consider", what: "Probiotics — controversial; some evidence for primary + secondary prevention",
        why: "S. boulardii + L. rhamnosus most-studied; institutional variation in practice" },
      { sev: "consider", what: "Infection-control measures — single room, gown + glove, environmental cleaning",
        why: "C. diff spores survive standard hand sanitizer; hand-washing + bleach essential" },
    ],
  },
  rationale: {
    driver: "Fidaxomicin 200 mg BID × 10 d is preferred over oral vancomycin for initial episode and first recurrence — Louie / Cornely RCTs showed equivalent cure with recurrence cut from 25% → 13% (IDSA / SHEA 2021 elevated fidaxomicin to first-line). Fulminant disease (ileus, megacolon, shock) requires PO/NG vancomycin 500 mg QID + IV metronidazole ± rectal vancomycin and early surgical consult. The single most impactful adjunct is stopping the offending inciting antibiotic when clinically feasible.",
    guideline: "cdi",
    rejected: "Metronidazole as first-line was deliberately rejected in the 2021 IDSA/SHEA focused update — it has lower cure and higher recurrence than fidaxomicin or vancomycin and is now reserved for when neither preferred oral agent is available. Routine probiotics for primary prevention were tempered: PROPATRIA (Lancet 2008) showed increased mortality with Lactobacillus prophylaxis in severe pancreatitis, and signals across other settings are heterogeneous." },
  objections: [
    { q: "Why fidaxomicin over PO vancomycin — cost is significant?",
      a: "Fidaxomicin is preferred over PO vancomycin per IDSA / SHEA 2021 — Louie (NEJM 2011) and Cornely (Lancet ID 2012) RCTs (n=1,164) showed equivalent clinical cure with recurrence reduced from 25% to 13% [cite:cdi]. Each recurrence prevented avoids ~30-d hospital readmission, lost workdays, and downstream FMT cost. Cost-effectiveness is favorable in high-recurrence-risk patients (age > 65, prior CDI, severe disease); reserve vanco for cost-constrained low-risk cases." },
    { q: "Why not IV metronidazole for non-fulminant CDI?",
      a: "IV (or PO) metronidazole for non-fulminant CDI was deliberately rejected in the IDSA / SHEA 2021 focused update — lower cure rates, more failures, and substantially higher recurrence than fidaxomicin or vancomycin in head-to-head data [cite:cdi]. Reserved only for fulminant disease (added to PO/NG vanco for combined gut + systemic effect) or when neither preferred oral agent is available. PO metronidazole monotherapy is no longer the standard." },
    { q: "Why early surgery threshold for fulminant CDI?",
      a: "Fulminant CDI (ileus, megacolon, WBC > 25, lactate > 5, shock) has 30-50% mortality with medical therapy alone; early subtotal colectomy or diverting loop ileostomy + colonic vancomycin lavage halves mortality when done at the right window per Sailhamer + IDSA / SHEA 2021 [cite:cdi]. Daily surgical re-eval is mandated; delaying surgery in the rapidly deteriorating patient is a higher-mortality bet than the surgery itself." },
    { q: "Why FMT at 2 recurrences — can we just retry fidaxomicin?",
      a: "FMT cure rate is > 90% for recurrent CDI per van Nood (NEJM 2013, stopped early for efficacy) and meta-analyses; repeated antibiotic courses for 2nd+ recurrence have < 50% durable cure [cite:fmt]. SER-109 (Vowst, NEJM 2022) and Rebyota now offer standardized oral / per-rectal microbiome products as FDA-approved alternatives. Bezlotoxumab adjunct for high-risk first recurrence further reduces recurrence (~40%) per MODIFY I/II [cite:modify]." },
  ],
  research: {
    headline: "Fidaxomicin reduces recurrence vs vancomycin; FMT is the recurrence breaker; bezlotoxumab adjunct for high-risk.",
    trials: [
      { name: "Louie NEJM 2011 + Cornely Lancet ID 2012",
        n: "1,164",
        question: "Fidaxomicin vs vancomycin for CDI",
        finding: "Fidaxomicin clinical cure equivalent; recurrence reduced from 25% to 13% — drives IDSA 2021 preference",
        bias: "Industry-sponsored; cost-effectiveness debated outside high-risk groups" },
      { name: "MODIFY I + II NEJM 2017 (Wilcox)",
        n: "2,655",
        question: "Bezlotoxumab vs placebo as adjunct in CDI",
        finding: "Bezlotoxumab reduced recurrence ~10% absolute; benefit concentrated in high-risk (age > 65, prior CDI, severe, immunocompromised)",
        bias: "Expensive; access limited; HF + cancer subgroups carry warnings" },
      { name: "van Nood NEJM 2013 (FMT)",
        n: "Trial stopped early",
        question: "FMT vs vancomycin for recurrent CDI",
        finding: "FMT cure rate 81% (single infusion) vs 31% vancomycin — trial stopped early for ethical reasons",
        bias: "Small + open-label; subsequent meta-analyses confirm > 90% efficacy" },
      { name: "ECOSPOR III NEJM 2022 (Feuerstadt — SER-109 / Vowst)",
        n: "182",
        question: "Standardized oral microbiome therapeutic vs placebo for recurrent CDI",
        finding: "Recurrence at 8 wk 12% (SER-109) vs 40% (placebo); now FDA-approved (Vowst 2023)",
        bias: "Novel mechanism; long-term safety + cost trajectory unknown" },
    ],
    guidelines: [
      { society: "IDSA / SHEA",
        year: 2021,
        topic: "C. difficile (Johnson update)",
        keypoint: "Fidaxomicin preferred over vancomycin for initial + recurrence; metronidazole only when others unavailable" },
      { society: "ACG",
        year: 2021,
        topic: "C. difficile (Kelly)",
        keypoint: "FMT for second recurrence; bezlotoxumab adjunct for high-risk; surgical consult for fulminant" },
    ],
    openQuestions: [
      "Optimal duration / route for fulminant CDI — IV metronidazole + oral / rectal vancomycin standard but evidence quality C",
      "Bezlotoxumab cost-effectiveness in average-risk recurrence — most analyses unfavorable outside high-risk",
      "Microbiome-based therapeutics (Vowst, Rebyota) vs conventional FMT — emerging head-to-head pending",
    ],
  },
};

export default { id: "cdiff", regimen, decision };
