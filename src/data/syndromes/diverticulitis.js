/* ===========================================================
   DIVERTICULITIS — uncomplicated vs complicated. DIABOLO trial
   supports observation for uncomplicated in selected patients. == */

const regimen = {
  "Inpatient/complicated": [
    {
      rx: /ceftriaxone.*metronidazole|piperacillin|ertapenem/i,
      pickIf: "Complicated diverticulitis (abscess, perforation, sepsis) requiring admission.",
      whyPick: [
        "**Ceftriaxone + metronidazole** OR **pip-tazo** OR **ertapenem** — equivalent",
        "**Percutaneous drainage** for abscess > 4 cm",
        "**Surgery** for free perforation / non-improvement / recurrent disease",
        "Uncomplicated outpatient: amox-clav or cipro+metronidazole for 4–7 d (or even none — DIABOLO trial)",
      ],
      watchOut: [
        { sev: "warn", text: "**Free perforation** → emergent surgery, not antibiotics" },
        { sev: "note", text: "Colonoscopy 6 weeks after first episode (rule out cancer)" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "4 d post-source-control for complicated; 4–7 d outpatient for uncomplicated; observation OK for selected.",
    evidence: "STOP-IT 2015 (NEJM) for complicated; DIABOLO 2017 for uncomplicated antibiotic-free observation",
    branches: [
      { label: "Complicated, source controlled", days: "4 d",
        detail: "Post-drainage of abscess or post-surgery; STOP-IT bands apply" },
      { label: "Uncomplicated outpatient", days: "4–7 d",
        detail: "Amox-clav or cipro+metronidazole; DIABOLO supports antibiotic-free observation in selected" },
      { label: "Free perforation / peritonitis", days: "7–10 d",
        detail: "Post-surgical exploration; broaden empirics for hospital flora" },
      { label: "Recurrent / chronic disease", days: "Per episode",
        detail: "Treat each episode; surgical consult for elective resection if frequent recurrence" },
    ],
    stopWhen: [
      "Afebrile ≥ 24–48 h",
      "Abdominal pain resolving; bowel function normalizing",
      "WBC trending toward normal",
      "Source controlled (abscess drained, perforation repaired)",
      "Tolerating oral diet (clear → regular advance)",
      "Minimum 4 d completed",
    ],
    extendIf: [
      { text: "**Free perforation** or peritonitis at presentation — extend post-surgery",
        matchCtx: { severe: true } },
      "Undrained abscess > 4 cm — extend until drainage successful",
      "Persistent fever or non-improvement by day 3",
      "Immunocompromised host — lower threshold for extended therapy",
    ],
  },
  monitoring: {
    headline: "Imaging if no response by 72 h; drainage for abscess > 4 cm; colonoscopy after first episode.",
    items: [
      { sev: "required", what: "**Reassess at 48–72 h** — fever, abdominal exam, WBC, oral tolerance",
        why: "Non-responders by 72 h need imaging + drainage / surgical eval" },
      { sev: "required", what: "**Percutaneous drainage** for abscess > 4 cm",
        why: "Source control is decision-critical; antibiotics alone fail with large undrained collections" },
      { sev: "required", what: "**Surgery consult** for free perforation, persistent abscess, recurrent disease",
        why: "Surgical intervention drives outcomes in complicated disease",
        matchCtx: { severe: true } },
      { sev: "trigger", what: "**Repeat imaging** if no improvement by day 3–4",
        why: "Abscess evolution, microperforation, new collections — drainage / surgical re-eval" },
      { sev: "trigger", what: "**Colonoscopy 6 weeks post-episode** (first episode)",
        why: "Rule out malignancy / IBD mimicking diverticulitis; standard of care first-episode" },
      { sev: "consider", what: "Elective sigmoid resection for frequent recurrences or fistula",
        why: "Surgical referral after ≥ 2 episodes; case-by-case decision with colorectal surgery" },
    ],
  },
  rationale: {
    driver: "Uncomplicated CT-confirmed diverticulitis often resolves without antibiotics in immunocompetent hosts — DIABOLO (Br J Surg 2017, n=528) and AVOD (JAMA Surg 2012, n=623) established observation non-inferior at 6 months for recurrence + readmission + complications, displacing the reflex prescription. When antibiotics are used, amox-clav or cipro + metronidazole × 4–7 d covers enteric GNR + anaerobes. Complicated disease (abscess, perforation) is a source-control problem — abscess > 3–4 cm requires percutaneous drainage, and after adequate source control, 4 d post-procedure (STOP-IT) is non-inferior to longer regimens. Colonoscopy at 6–8 weeks after first episode rules out underlying malignancy.",
    guideline: "diabolo",
    rejected: "Reflexive antibiotics for uncomplicated CT-confirmed diverticulitis were deliberately rejected — both DIABOLO and AVOD showed no benefit, and routine prescription drives C. difficile + collateral resistance without changing outcomes. Prolonged 7–10 d post-source-control courses were also tempered: STOP-IT (NEJM 2015) demonstrated 4 d sufficient after adequate drainage or surgery, and extending therapy with an unresolved source merely delays the necessary procedural intervention." },
  objections: [
    { q: "Why no antibiotics for uncomplicated — that feels wrong?",
      a: "DIABOLO (Br J Surg 2017, n=528) [cite:diabolo] and AVOD (JAMA Surg 2012, n=623) [cite:avod] both showed observation non-inferior to antibiotics in CT-confirmed uncomplicated diverticulitis at 6-month recurrence + complications + readmission — most episodes resolve on bowel rest alone, and reflexive prescription drives C. diff + collateral resistance without changing outcomes. AGA / ACG endorse selective antibiotic use. Reserve antibiotics for immunocompromised, severe presentation, or non-response by 72 h; the stewardship win is documented." },
    { q: "Why 4 d post-source control — these patients are still tender?",
      a: "STOP-IT (NEJM 2015, n=518) [cite:stopit] established 4 d non-inferior to symptom-guided (8+ d) in complicated IAI after adequate source control — same SSI, recurrence, and death rates including the post-drainage diverticulitis cohort. Persistent tenderness without fever, leukocytosis, or imaging progression at day 4 is post-inflammatory, not infection; extending antibiotics drives nothing forward. Persistent fever or rising markers triggers re-imaging + re-drainage, not reflexive extension." },
    { q: "Why amox-clav + cipro/metronidazole — why not pip-tazo?",
      a: "Community diverticulitis is enteric GNR + Bacteroides — amox-clav or cipro + metronidazole covers > 90% of community isolates at lower cost, less resistance pressure, and oral availability for outpatient pathway [cite:diabolo]. Pip-tazo is reserved for severe / HCAQ / immunocompromised / recent broad-antibiotic exposure where resistant GNR or enterococcal cover matters. Reflexive IV broad-spectrum in moderate disease wastes spectrum and prevents the outpatient transition that AGA 2015 endorses." },
    { q: "Why drain abscesses ≥ 4 cm — why not just antibiotics?",
      a: "Abscess > 3–4 cm represents a contained collection that antibiotics alone cannot sterilize — percutaneous drainage is the inflection point per AGA / ACG, with antibiotic course shortened to 4 d post-drainage per STOP-IT [cite:stopit]. Smaller pericolic abscesses may resolve on antibiotics, but the threshold matters: undrained collection drives recurrence + chronic sinus formation. Surgery is reserved for free perforation, ongoing peritonitis, or recurrent disease where elective resection becomes appropriate." },
  ],
  research: {
    headline: "DIABOLO + AVOD established antibiotic-free observation for uncomplicated; STOP-IT covers complicated.",
    trials: [
      { name: "DIABOLO Br J Surg 2017",
        n: "528",
        question: "Observation vs antibiotics in uncomplicated CT-confirmed diverticulitis",
        finding: "Observation non-inferior at 6 mo for recurrence + readmission + complications — antibiotics not required for uncomplicated",
        bias: "Selected by CT severity; immunocompromised + complicated excluded" },
      { name: "AVOD JAMA Surg 2012",
        n: "623",
        question: "Antibiotics vs observation in uncomplicated diverticulitis",
        finding: "No difference in complications or recurrence; supports observation strategy",
        bias: "Swedish cohort; outpatient management favored locally" },
      { name: "Strate ACG 2021 review",
        n: "Guideline synthesis",
        question: "Modern management of uncomplicated vs complicated diverticulitis",
        finding: "Outpatient management increasingly preferred; emphasizes shared decision-making + risk stratification",
        bias: "Synthesizes evidence; ongoing practice variation" },
    ],
    guidelines: [
      { society: "AGA",
        year: 2015,
        topic: "Acute diverticulitis (Strate)",
        keypoint: "Selective antibiotic use; CT-driven severity grading; colonoscopy after first episode" },
      { society: "ACG",
        year: 2021,
        topic: "Diverticulitis (Strate update)",
        keypoint: "Observation acceptable for uncomplicated immunocompetent; antibiotics + drainage for complicated" },
    ],
    openQuestions: [
      "Routine colonoscopy after uncomplicated episode — practice varies; AGA recommends",
      "Outpatient vs inpatient management thresholds — shared decision-making",
      "Mesalamine + rifaximin for prevention — meta-analyses inconsistent; not standard",
    ],
  },
};

export default { id: "diverticulitis", regimen, decision };
