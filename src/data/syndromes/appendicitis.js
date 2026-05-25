/* ===========================================================
   APPENDICITIS — surgical standard with antibiotic-only
   emerging for selected. CODA + STOP-IT bands. ==================== */

const regimen = {
  "Empiric": [
    {
      rx: /ceftriaxone.*metronidazole|piperacillin|ertapenem/i,
      pickIf: "Acute appendicitis — adjunct to surgery, or sole therapy in selected.",
      whyPick: [
        "**Ceftriaxone + metronidazole** OR **pip-tazo** OR **ertapenem**",
        "**Single preop dose** sufficient if uncomplicated and removed promptly",
        "**4 days postop** for perforated (STOP-IT)",
        "Antibiotics-only management (CODA trial) — non-inferior in selected, but ~30% recurrence at 5 y",
      ],
      watchOut: [
        { sev: "warn", text: "**Perforation / abscess** → surgical or percutaneous source control before declaring failure" },
        { sev: "warn", text: "**Antibiotics-alone (CODA trial)** non-inferior at 90 d but ~30% recurrence at 5 y — counsel + plan follow-up",
          matchCtx: { severe: false } },
        { sev: "note", text: "Appendicolith on CT favors surgery — antibiotic-only fails more often" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Single preop dose for uncomplicated; 4 d postop for perforated (STOP-IT); 10 d antibiotic-only.",
    evidence: "STOP-IT 2015 (perforated) + CODA 2020 (antibiotic-only non-inferior at 90 d, ~30% recurrence at 5 y)",
    branches: [
      { label: "Uncomplicated + prompt appendectomy", days: "Single preop dose",
        detail: "Ceftriaxone + metronidazole or pip-tazo; no postop antibiotics needed if uncomplicated" },
      { label: "Perforated + adequate source control", days: "4 d",
        detail: "Post-surgical course; STOP-IT bands apply" },
      { label: "Abscess / phlegmon (interval appendectomy)", days: "7–10 d",
        detail: "Percutaneous drainage + IV course; interval appendectomy 6–8 wk later" },
      { label: "Antibiotic-only management (selected)", days: "10 d",
        detail: "CODA-eligible patients; ~30% recurrence at 5 y — counsel before opting in" },
    ],
    stopWhen: [
      "Afebrile ≥ 24 h post-surgery",
      "Tolerating oral diet",
      "Wound / drain output appropriate",
      "WBC trending toward normal",
      "No new abdominal findings",
      "Minimum course completed per branch",
    ],
    extendIf: [
      { text: "**Free perforation + peritonitis** — extend per STOP-IT plus clinical state",
        matchCtx: { severe: true } },
      "Postoperative abscess — drainage + extension",
      "Immunocompromised host — lower threshold for extended course",
      "Appendicolith on imaging + antibiotic-only — higher recurrence; consider surgery instead",
    ],
  },
  monitoring: {
    headline: "Surgical management first-line; postop wound + abscess surveillance; colonoscopy ≥ 40 y.",
    items: [
      { sev: "required", what: "**Surgical management within 24 h** for uncomplicated appendicitis",
        why: "Antibiotics + delayed surgery acceptable in CODA-eligible; immediate surgery remains standard" },
      { sev: "required", what: "**Postop daily exam** + WBC trend",
        why: "Wound infection, postop abscess, anastomotic complications surface in first 5–7 d" },
      { sev: "trigger", what: "**CT abdomen** for postop fever / non-improvement",
        why: "Abscess, leak, retained foreign body — drainage / surgical re-eval" },
      { sev: "trigger", what: "**Interval appendectomy** at 6–8 wk for phlegmon / abscess managed nonoperatively",
        why: "Standard practice for delayed surgery after drainage; ID + surgery coordination" },
      { sev: "trigger", what: "**Colonoscopy** if age ≥ 40 y after antibiotic-only management",
        why: "Rule out underlying malignancy mimicking appendicitis" },
      { sev: "consider", what: "Counsel patients on CODA: 30% recurrence at 5 y vs surgical near-zero",
        why: "Patient autonomy choice; surgical option remains available at any time",
        matchBranch: ["Antibiotic-only management (selected)"] },
    ],
  },
  rationale: {
    driver: "Appendectomy within 24 h remains the gold standard for uncomplicated appendicitis — antibiotics (single preop dose of ceftriaxone + metronidazole or pip-tazo) cover enteric GNR + anaerobes during the operative period, and no postop course is needed when the appendix is removed intact. Perforated disease with adequate source control completes 4 d post-procedure per STOP-IT (NEJM 2015). CODA (NEJM 2020, n=1,552) opened a door for antibiotic-only management in CT-selected uncomplicated cases — non-inferior at 90 d for quality of life, but with ~30% requiring appendectomy by 5 years; appendicolith subgroup did worse with antibiotics alone.",
    guideline: "coda",
    rejected: "Reflexive 7–10 d postop antibiotic courses for uncomplicated appendectomy were deliberately rejected — a single preoperative dose is the proph standard (Bratzler 2013), and continued therapy without an indication drives resistance + C. difficile without changing wound or abscess rates. Antibiotic-only management as default was tempered: the appendicolith subgroup of CODA carries a higher failure rate, and surgical management remains preferable in patients without explicit contraindications or strong preference for non-operative approach." },
  objections: [
    { q: "Why a single preop dose — shouldn't we continue postop?",
      a: "ASHP/IDSA/SIS surgical prophylaxis guidance (Bratzler 2013) [cite:proph] establishes a single preoperative dose of ceftriaxone + metronidazole (or pip-tazo) as adequate for uncomplicated appendectomy when the appendix is removed intact — no postoperative course needed. Continued antibiotics without an indication drive C. diff + collateral resistance without changing wound infection or abscess rates. Reserve postoperative continuation for perforated disease (4 d per STOP-IT [cite:stopit]) or abscess management." },
    { q: "Why 4 d post-source-control — appendicitis seems different?",
      a: "STOP-IT (NEJM 2015, n=518) [cite:stopit] included perforated appendicitis in the complicated IAI cohort and established 4 d fixed non-inferior to symptom-guided (8+ d) regimens — same SSI, recurrence, and death rates. Extension only for inadequate source control (persistent abscess, leak), bacteremia, or immunocompromise. Reflexive 7–10 d postoperative courses after perforated appendicitis fail audit and drive collateral harm without changing outcomes." },
    { q: "Why offer antibiotic-only management — surgery is standard?",
      a: "CODA (NEJM 2020, n=1,552) [cite:coda] established antibiotic-only management non-inferior to appendectomy at 90 d for QoL in CT-confirmed uncomplicated cases, opening a defined option for shared decision-making. The trade-off: ~30% require appendectomy by 5 y, and the appendicolith subgroup did worse with antibiotics alone. Surgery remains gold standard; the antibiotic-only path is for selected patients with strong preference for non-operative trial — counsel honestly on the recurrence rate." },
    { q: "Why interval appendectomy after abscess — drainage suffices?",
      a: "Phlegmon or periappendiceal abscess managed nonoperatively (drainage + 7–10 d antibiotics) is the appropriate acute strategy, but interval appendectomy at 6–8 weeks is standard per WSES 2020 to prevent recurrence and exclude underlying malignancy — particularly important in patients ≥ 40 y where colon cancer presenting as appendicitis is a real consideration [cite:coda]. Colonoscopy after antibiotic-only management in older patients is the same logic." },
  ],
  research: {
    headline: "CODA 2020 + APPAC opened antibiotic-only door for selected uncomplicated; surgery remains gold standard.",
    trials: [
      { name: "CODA NEJM 2020",
        n: "1,552",
        question: "Antibiotic vs surgery for uncomplicated appendicitis",
        finding: "Antibiotic non-inferior at 90 d for QoL; ~30% required appendectomy by 5 y; appendicolith subgroup worse with antibiotics",
        bias: "Pragmatic trial; quality-of-life rather than hard outcomes primary endpoint" },
      { name: "APPAC JAMA 2018",
        n: "530",
        question: "Antibiotic vs appendectomy for uncomplicated appendicitis (Finland)",
        finding: "39% antibiotic-treated required appendectomy by 5 y; supports antibiotic option in shared decision-making",
        bias: "Single-country cohort; CT-confirmed uncomplicated only" },
      { name: "STOP-IT NEJM 2015 (Sawyer)",
        n: "518",
        question: "Fixed 4-d antibiotics vs symptom-guided for complicated intra-abdominal infection (incl. perforated appendicitis)",
        finding: "Fixed 4 d non-inferior; supports STOP-IT-aligned 4-d post-source-control standard",
        bias: "Excluded persistent source / inadequate control" },
    ],
    guidelines: [
      { society: "WSES",
        year: 2020,
        topic: "World Society Emergency Surgery appendicitis (Di Saverio)",
        keypoint: "Surgery within 24 h for uncomplicated; antibiotic-only for selected with shared decision-making; CT-driven" },
      { society: "EAES",
        year: 2018,
        topic: "European endoscopic surgery appendicitis",
        keypoint: "Laparoscopic appendectomy preferred; aligned with WSES on antibiotic-only option" },
    ],
    openQuestions: [
      "Optimal patient selection for antibiotic-only — appendicolith carries higher failure rate",
      "Interval appendectomy after antibiotic-only — practice varies; AGA notes 30% recurrence",
      "Outpatient management with oral antibiotics — emerging area; institutional protocols variable",
    ],
  },
};

export default { id: "appendicitis", regimen, decision };
