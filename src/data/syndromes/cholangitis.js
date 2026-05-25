/* ===========================================================
   CHOLANGITIS — acute ascending. Tokyo TG18 + IDSA / SIS 2017.
   Source control (ERCP) is the inflection point. ================ */

const regimen = {
  "Empiric": [
    {
      rx: /ceftriaxone.*metronidazole|piperacillin/i,
      pickIf: "Acute ascending cholangitis — Charcot triad or Reynolds pentad.",
      whyPick: [
        "**Ceftriaxone + metronidazole** OR **pip-tazo** — covers gut flora",
        "**ERCP / drainage within 24–48 h** — antibiotics fail without decompression",
        "**4-day post-drainage course** sufficient if source controlled (Tokyo TG18)",
        "Add vancomycin if healthcare-associated or septic shock",
      ],
      watchOut: [
        { sev: "stop", text: "**Source control essential** — antibiotics alone don't drain pus" },
        { sev: "warn", text: "Enterococcus more common in healthcare-associated — pip-tazo covers it" },
        { sev: "note", text: "Repeat blood cultures 48 h post-drainage — clearance expected" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "4 d post-drainage for adequate source control; longer if drainage incomplete or healthcare flora.",
    evidence: "Tokyo TG18 + STOP-IT-style 4-d post-source-control regimens; ID input for ESBL/CRE durations",
    branches: [
      { label: "Successful drainage + susceptible organism", days: "4–7 d",
        detail: "From drainage day; ceftriaxone + metronidazole or pip-tazo standard" },
      { label: "Inadequate drainage / persistent obstruction", days: "10–14 d",
        detail: "Surgical re-eval; continue broad coverage until source controlled" },
      { label: "Bacteremic cholangitis", days: "7–10 d",
        detail: "Blood-culture-positive drives duration even with adequate drainage" },
      { label: "ESBL / CRE / healthcare flora", days: "10–14 d",
        detail: "Carbapenem or novel β-lactam; ID input mandatory",
        matchAgent: /ceftolozane|ceftazidime-?avibactam/i },
    ],
    stopWhen: [
      "Source controlled — biliary drainage achieved (ERCP / PTC / surgery)",
      "Afebrile ≥ 48 h",
      "Bilirubin trending toward normal",
      "WBC normalizing",
      "Blood cultures negative ≥ 48 h (if bacteremic)",
      "Minimum 4 d post-drainage for community cholangitis",
    ],
    extendIf: [
      { text: "**Drainage incomplete** or stent malfunction — extend until source controlled",
        matchCtx: { severe: true } },
      { text: "**Bacteremia** confirmed — extend to 7–10 d minimum",
        matchCtx: { severe: true } },
      { text: "**Healthcare-associated** or prior antibiotic exposure — broaden + extend",
        matchCtx: { esblRisk: true } },
      "Recurrent cholangitis episodes — workup for stricture, malignancy, retained stones",
    ],
  },
  monitoring: {
    headline: "ERCP within 24-48 h for severe; daily LFT trend; blood cultures if bacteremic.",
    items: [
      { sev: "required", what: "**ERCP / biliary drainage within 24–48 h** for severe cholangitis",
        why: "Antibiotic therapy alone insufficient with obstruction; source control is the inflection point" },
      { sev: "required", what: "**Daily LFT + bilirubin trend** + clinical assessment",
        why: "Bilirubin decline correlates with drainage adequacy + treatment response" },
      { sev: "required", what: "**Blood cultures at presentation** + repeat at 48 h if bacteremic",
        why: "~25–40% bacteremic; clearance documentation drives duration decisions" },
      { sev: "trigger", what: "**Repeat imaging** if no improvement by day 3–4",
        why: "Stent malfunction, abscess evolution, retained stones — re-drainage targets" },
      { sev: "trigger", what: "**Add vancomycin** if healthcare-associated or persistent bacteremia",
        why: "Enterococcal cholangitis more common in HCAQ; vancomycin or amp + ceftriaxone synergy",
        matchCtx: { esblRisk: true } },
      { sev: "trigger", what: "**Surgical consult** if drainage anatomically impossible or unsuccessful",
        why: "Surgical drainage / decompression when endoscopic / percutaneous fails" },
      { sev: "consider", what: "Workup for primary biliary cause — stricture, choledocholithiasis, malignancy",
        why: "Underlying anatomic / oncologic cause drives recurrence prevention strategy" },
    ],
  },
  rationale: {
    driver: "Cholangitis is a source-control disease — antibiotic adequacy is necessary but biliary decompression (ERCP, PTC, or surgery) is the inflection point that drops mortality. Tokyo TG18 grades severity: Grade I (mild) gets elective drainage, Grade II (moderate) within 48 h, Grade III (severe with organ failure) emergent ERCP plus ICU. Empirics cover enteric GNR + anaerobes (ceftriaxone + metronidazole or pip-tazo); 4 d post-drainage is non-inferior to longer courses (Karasawa 2019, STOP-IT-aligned). Bacteremic patients complete by organism (7–10 d); ESBL or healthcare flora shifts to a carbapenem with ID partnership.",
    guideline: "tokyo",
    rejected: "Routine empiric anti-pseudomonal + anti-enterococcal coverage was deliberately rejected for community cholangitis — Tokyo TG18 and IDSA reserve these for healthcare-associated, postoperative, or immunocompromised hosts, and reflexive pip-tazo plus ampicillin in community disease wastes spectrum. Prolonged 10–14 d courses after adequate biliary drainage were tempered: Karasawa (2019) showed 4 d non-inferior, applying STOP-IT principles to source-controlled biliary infection." },
  objections: [
    { q: "Why ERCP first — can we trial antibiotics alone?",
      a: "Cholangitis is a source-control disease — Lai (Gut 1992, n=82) established emergent ERCP superior to surgery for severe cholangitis, with lower mortality + complications, and Tokyo TG18 [cite:tokyo] codifies it: Grade III (severe with organ failure) gets emergent ERCP, Grade II within 48 h, Grade I elective. Antibiotics alone cannot decompress an obstructed biliary tree; the obstructed system is a closed-space abscess equivalent. Delaying drainage in favor of antibiotic optimization carries unacceptable mortality." },
    { q: "Why 4 d post-drainage — STOP-IT was for IAI, not biliary?",
      a: "Karasawa (Surgery Today 2019) applied STOP-IT principles directly to cholangitis after adequate biliary drainage — 4 d non-inferior to longer symptom-guided courses, mirroring STOP-IT [cite:stopit] in source-controlled IAI. Tokyo TG18 [cite:tokyo] now endorses short-course post-drainage; extension only for inadequate drainage (stent malfunction, retained stones), bacteremia (extend to 7–10 d on organism), or healthcare/ESBL flora needing carbapenem. The principle generalizes: source control is the gate." },
    { q: "Why not anti-pseudomonal + enterococcal cover routinely?",
      a: "Tokyo TG18 [cite:tokyo] and IDSA / SIS reserve anti-pseudomonal pip-tazo + ampicillin or vanco for healthcare-associated, post-procedural, or immunocompromised cholangitis — community cholangitis is enteric E. coli / Klebsiella / Bacteroides dominant, where ceftriaxone + metronidazole covers > 90% at lower cost and resistance pressure. Reflexive broad-spectrum empirics in community disease drives carbapenem-sparing failure and AKI without survival benefit." },
    { q: "Why carbapenem for ESBL — pip-tazo is susceptible?",
      a: "MERINO (JAMA 2018, n=378) [cite:merino] showed pip-tazo mortality 12.3% vs meropenem 3.7% in ceftriaxone-resistant Enterobacterales bacteremia despite in-vitro susceptibility — the β-lactamase inhibitor fails at bacteremic biliary inoculum. For bacteremic ESBL cholangitis, IDSA AMR-GN 2024 [cite:amrgn] mandates a carbapenem (ertapenem outpatient, meropenem severe). In-vitro MIC does not predict in-vivo outcome at high-burden biliary substrate." },
  ],
  research: {
    headline: "Tokyo TG18 grades severity + drives source-control timing; antibiotics adjunct after biliary decompression.",
    trials: [
      { name: "Tokyo TG18 / TG13 (Yokoe / Kiriyama)",
        n: "Guideline",
        question: "Severity grading + source-control timing for cholangitis",
        finding: "Grade I → elective drainage; Grade II → drainage within 48 h; Grade III → emergent ERCP + ICU; structured grading drives outcomes",
        bias: "Guideline synthesis; widely adopted internationally" },
      { name: "Karasawa Surgery Today 2019",
        n: "Multi-center",
        question: "Antibiotic duration post-source-control in cholangitis",
        finding: "4-d post-drainage non-inferior to longer course; supports STOP-IT-aligned standard",
        bias: "Asian cohort; ESBL prevalence higher; may need adjustment for U.S. setting" },
      { name: "Lai Gut 1992",
        n: "82",
        question: "Emergency ERCP vs surgery for severe cholangitis",
        finding: "ERCP superior — lower mortality + complications; established endoscopic-first paradigm",
        bias: "Pre-modern surgical era; ERCP availability + expertise variable" },
    ],
    guidelines: [
      { society: "TG18",
        year: 2018,
        topic: "Tokyo Guidelines acute cholangitis",
        keypoint: "Severity grading + biliary drainage timing standardized; antibiotic choice per risk + local resistance" },
      { society: "SIS / IDSA",
        year: 2017,
        topic: "Complicated intra-abdominal infection",
        keypoint: "4-d post-source-control standard; cover GNR + anaerobes per substrate" },
    ],
    openQuestions: [
      "Routine enterococcal coverage in cholangitis — IDSA reserves for high-risk; institutional variation",
      "Cholecystectomy timing post-cholangitis — early vs delayed debated; outcomes equivalent in modern series",
      "Empiric anti-MDR coverage for healthcare-associated cholangitis — antibiogram-driven",
    ],
  },
};

export default { id: "cholangitis", regimen, decision };
