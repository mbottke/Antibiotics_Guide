/* ===========================================================
   LIVER ABSCESS — pyogenic; drainage + 4–6 wk total course.
   Hypervirulent K. pneumoniae adds metastatic-screen layer. ===== */

const regimen = {
  "Empiric + drainage": [
    {
      rx: /ceftriaxone.*metronidazole|piperacillin/i,
      pickIf: "Pyogenic liver abscess on imaging.",
      whyPick: [
        "**Ceftriaxone + metronidazole** OR **pip-tazo** — covers enteric flora + anaerobes",
        "**Percutaneous drainage** for abscesses ≥ 3–5 cm",
        "Long course: **4–6 weeks** total (2 wk IV, 4 wk PO)",
        "Workup colonic source — colonoscopy if Streptococcus anginosus or hypervirulent K. pneumoniae",
      ],
      watchOut: [
        { sev: "warn", text: "**Amoebic liver abscess** mimics pyogenic — serology if travel/exposure" },
        { sev: "note", text: "Streptococcus anginosus / milleri group → look for colon cancer or perforation" },
      ],
    },
  ],
  "Hypervirulent Klebsiella": [
    {
      rx: /ceftriaxone|metastatic/i,
      pickIf: "K. pneumoniae liver abscess (often diabetic, Southeast Asian, K1/K2 serotypes).",
      whyPick: [
        "**Ceftriaxone** for susceptible isolates",
        "**Screen for metastatic spread** — endophthalmitis (mandatory ophthal eval), CNS, lung",
        "Long course (4–6 weeks); often requires drainage",
      ],
      watchOut: [
        { sev: "stop", text: "**Endophthalmitis screen mandatory** — vision-threatening if missed" },
        { sev: "warn", text: "Hypervirulent isolates seed brain, eye, lung — workup CNS + chest" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "4–6 wk total (2 wk IV + 4 wk PO step-down) for pyogenic; longer for hypervirulent K. pneumoniae.",
    evidence: "Society consensus — IV until clinical + imaging response, then oral step-down for total 4–6 wk",
    branches: [
      { label: "Pyogenic, drained + susceptible", days: "4–6 wk total",
        detail: "2 wk IV minimum + 4 wk PO step-down; oral agent per susceptibilities" },
      { label: "Hypervirulent K. pneumoniae", days: "≥ 6 wk + screen",
        detail: "K1/K2 serotypes — endophthalmitis, CNS, lung metastatic; treat per source spread" },
      { label: "Amoebic liver abscess", days: "10 d + luminal agent",
        detail: "Metronidazole 10 d + paromomycin or iodoquinol × 7 d for luminal cyst clearance" },
      { label: "Inadequate drainage", days: "Extended beyond 6 wk",
        detail: "Continue until imaging resolution; re-drainage / surgery considered" },
    ],
    stopWhen: [
      "Imaging shows abscess resolution or stable scar",
      "Afebrile ≥ 1 week with imaging response",
      "WBC + LFTs normalizing",
      "No new metastatic foci on exam / imaging",
      "Minimum 4–6 wk total course completed",
    ],
    extendIf: [
      { text: "**Hypervirulent K. pneumoniae** confirmed — extend + screen metastatic spread",
        matchCtx: { esblRisk: true } },
      "Multiple or large abscesses requiring serial drainage",
      "Streptococcus anginosus group — destructive; longer course typical",
      "Bacteremia at presentation — endocarditis workup + extend per source",
      "Immunocompromised host — extend per case",
    ],
  },
  monitoring: {
    headline: "Percutaneous drainage early; serial imaging at 2-4 wk intervals; endophthalmitis screen if hypervirulent.",
    items: [
      { sev: "required", what: "**Percutaneous drainage** for abscesses ≥ 3–5 cm",
        why: "Antibiotic-only management adequate only for small (< 3 cm) abscesses; drainage speeds resolution" },
      { sev: "required", what: "**Workup colonic source** — colonoscopy if Streptococcus anginosus or hypervirulent Klebsiella",
        why: "Underlying colorectal pathology (cancer, diverticulitis) often the seeding source" },
      { sev: "required", what: "**Serial imaging at 2–4 wk intervals** until resolution",
        why: "Image-driven duration; longer course needed if persistent collection" },
      { sev: "trigger", what: "**Endophthalmitis screen** (ophthalmology eval) if hypervirulent K. pneumoniae",
        why: "K1/K2 serotypes seed eye + CNS + lung; vision-threatening if missed",
        matchBranch: ["Hypervirulent K. pneumoniae"] },
      { sev: "trigger", what: "**TEE** if bacteremic at presentation",
        why: "Endocarditis source workup; changes duration to 4–6 wk IV course" },
      { sev: "trigger", what: "**Amoebic serology** if travel history or epidemiologic risk",
        why: "Amoebic abscess mimics pyogenic; serology + Entamoeba antigen drives drug change",
        matchBranch: ["Amoebic liver abscess"] },
      { sev: "consider", what: "Step-down oral agent: amox-clav, FQ, TMP-SMX per susceptibilities",
        why: "Long IV courses drive line complications; oral step-down at 2 wk standard" },
    ],
  },
  rationale: {
    driver: "Pyogenic liver abscess is a drainage-first disease — percutaneous catheter drainage for collections ≥ 3–5 cm sterilizes the cavity and yields culture data that drives a 4–6 wk total course (typically 2 wk IV + 4 wk oral step-down). Empirics cover enteric GNR + anaerobes (ceftriaxone + metronidazole or pip-tazo); Streptococcus anginosus group is destructive and warrants longer courses with colonoscopy to identify the seeding source. Hypervirulent K1/K2 K. pneumoniae (Chang 2012) seeds endophthalmitis, CNS, and lung in ~10% — mandates ophthalmology + brain MRI screening and an extended course. Amoebic abscess (positive serology) responds to metronidazole 10 d + a luminal agent without drainage.",
    guideline: "stopit",
    rejected: "Reflexive surgical drainage as first-line was deliberately rejected — Stalker (World J Surg 2014) established percutaneous catheter drainage as first-line for accessible unilocular abscesses ≥ 5 cm, with surgery reserved for multiloculated collections or PCD failure. Routine empiric antifungal coverage was tempered: Candida liver abscess is rare outside transplant/immunocompromised hosts, and reflexive echinocandin in immunocompetent pyogenic disease wastes spectrum without measurable benefit." },
  objections: [
    { q: "Why percutaneous drainage first — open surgery is definitive?",
      a: "Stalker (World J Surg 2014) established PCD first-line for accessible unilocular pyogenic liver abscesses ≥ 5 cm, with surgery reserved for multiloculated collections or PCD failure — lower morbidity than upfront surgery and equivalent durable cure when paired with 4–6 wk targeted antibiotics [cite:stopit]. AASLD aligns; reflexive surgical exploration in modern practice is overkill for the typical pyogenic abscess. Drainage is the inflection point — route is secondary." },
    { q: "Why 4–6 wk total — that's a long course for an abscess?",
      a: "Pyogenic liver abscess duration is anchored by AASLD + WSES consensus: 2 wk IV + 4 wk oral step-down = 4–6 wk total, tracked to imaging response. The hepatic substrate is poorly perfused once walled off, drainage is incomplete in most cases, and shorter courses carry > 20% relapse. Streptococcus anginosus group is destructive and warrants the longer end; hypervirulent K. pneumoniae (K1/K2) seeds endophthalmitis + CNS in ~10% (Chang 2012) and gets extended courses + metastatic screen [cite:aasld]." },
    { q: "Why oral step-down at 2 wk — IV feels safer?",
      a: "The OVIVA [cite:oviva] principle extends beyond bone/joint — once drainage is adequate, the patient is afebrile, cultures + susceptibilities are back, and a bioavailable oral option exists (amox-clav, FQ, TMP-SMX), oral step-down avoids 4+ wk of line complications without efficacy compromise. AASLD-aligned series support this transition. Reserve continued IV for bacteremic course with endovascular focus, hypervirulent disease, or no bioavailable oral target. The line-complication cost of 4 wk IV is real." },
    { q: "Why drain amoebic — metronidazole alone is curative?",
      a: "Amoebic liver abscess (Stanley Lancet 2003) responds to metronidazole 7–10 d + luminal agent (paromomycin or iodoquinol × 7 d) for cyst clearance — drainage is reserved for abscesses > 5 cm, left-lobe (rupture into pericardium), or non-response by 5–7 d. Serology + travel history differentiate from pyogenic; routine drainage in classic amoebic disease is unnecessary and risks bacterial superinfection. The diagnosis drives the management split [cite:aasld]." },
  ],
  research: {
    headline: "Drainage + 4–6 wk total course; hypervirulent K. pneumoniae prompts metastatic-screen workup; amoebic distinct.",
    trials: [
      { name: "Chang Lancet ID 2012",
        n: "Cohort",
        question: "Hypervirulent K. pneumoniae liver abscess outcomes",
        finding: "Hypervirulent (K1/K2 + magA / rmpA) → ~10% metastatic foci (endophthalmitis, meningitis, lung); screening ophtho + brain MRI mandatory",
        bias: "Asian cohort; rising in Western centers" },
      { name: "Stalker World J Surg 2014",
        n: "Cohort",
        question: "PCD vs surgical drainage for pyogenic liver abscess",
        finding: "PCD first-line for abscesses ≥ 5 cm; surgical drainage for multiloculated or PCD failure; lower morbidity than surgery",
        bias: "Single-center; outcomes vary by anatomy" },
      { name: "Stanley Lancet 2003 (amoebic)",
        n: "Cohort",
        question: "Treatment of amoebic vs pyogenic liver abscess",
        finding: "Amoebic responds to metronidazole 7–10 d + luminal agent (paromomycin); drainage rarely needed unless large/non-response",
        bias: "Distinct epidemiology + serology-driven dx" },
    ],
    guidelines: [
      { society: "AASLD",
        year: 2017,
        topic: "Liver abscess management",
        keypoint: "PCD + 2 wk IV → 4 wk PO; metronidazole + luminal agent for amoebic; metastatic screen for hypervirulent K. pneumoniae" },
      { society: "WSES",
        year: 2018,
        topic: "World Society Emergency Surgery liver abscess",
        keypoint: "Aligned with AASLD; surgical drainage for multiloculated / non-response" },
    ],
    openQuestions: [
      "Optimal duration in hypervirulent K. pneumoniae — extended courses common",
      "Step-down oral agent — depends on susceptibility + bioavailability",
      "Amoebic drainage thresholds — > 5 cm or non-response by 5 d typically",
    ],
  },
};

export default { id: "liverabscess", regimen, decision };
