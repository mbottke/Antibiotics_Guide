/* ===========================================================
   ASPLENIA: ACUTE FEBRILE ILLNESS — OPSI risk; ceftriaxone +
   vancomycin empiric; standby antibiotic + prophylaxis. ===== */

const regimen = {
  "Empiric": [
    {
      rx: /ceftriaxone/i,
      pickIf: "Asplenic patient febrile — empiric until OPSI ruled out.",
      whyPick: [
        "**Ceftriaxone 2 g IV** at triage — encapsulated cover (pneumococcus, H. flu, meningococcus)",
        "Add **vancomycin** if meningitis suspected or septic shock",
        "**Standing home prescription** (amox-clav) for self-administration on any fever",
        "**OPSI mortality 40–70%** with delay — every minute matters",
      ],
      watchOut: [
        { sev: "stop", text: "**Don't wait for cultures** — first dose within minutes of triage; cultures after" },
        { sev: "warn", text: "**Capnocytophaga canimorsus** (dog/cat exposure + asplenia) → fulminant DIC — broaden if any exposure history" },
        { sev: "note", text: "Functional asplenia (SCD, celiac, post-XRT) carries the same risk — treat identically" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Ceftriaxone + vancomycin empiric; per pathogen + source; OPSI prophylaxis + vaccination review.",
    evidence: "IDSA + ASH — encapsulated organism risk; OPSI mortality > 50%; lifelong vaccination + standby antibiotic strategy",
    branches: [
      { label: "Acute febrile illness, no clear source", days: "Empiric per culture",
        detail: "Ceftriaxone 2 g IV q24h + vancomycin per institutional MRSA risk; broaden if shock; narrow on culture data",
        matchAgent: /ceftriaxone|vancomycin/i },
      { label: "OPSI / fulminant sepsis", days: "10–14 d per pathogen",
        detail: "Broad empiric — pip-tazo or carbapenem + vancomycin + ICU; per pathogen after cultures",
        matchAgent: /piperacillin|meropenem/i },
      { label: "Pneumococcal bacteremia / pneumonia", days: "10–14 d",
        detail: "Ceftriaxone or PCN per sensitivity; per CAP / bacteremia bands" },
      { label: "Capnocytophaga (dog bite exposure)", days: "Per capno bands",
        detail: "Per Capnocytophaga syndrome bands" },
      { label: "Babesiosis (tick exposure)", days: "Per parasitemia",
        detail: "Atovaquone + azithromycin or clinda + quinine; exchange transfusion if > 10% parasitemia" },
    ],
    stopWhen: [
      "Pathogen identified + treated per source",
      "Afebrile + clinical recovery",
      "Standby antibiotic prescription written",
      "Vaccination status reviewed + updated",
      "Discharge education on OPSI risk completed",
    ],
    extendIf: [
      { text: "**OPSI / fulminant course** — extended ICU + per pathogen",
        matchCtx: { severe: true } },
      "Endocarditis — per IE bands",
      "Meningitis — per meningitis bands",
      "Babesiosis — extended per parasitemia clearance",
    ],
  },
  monitoring: {
    headline: "ER fever = OPSI until proven otherwise; vaccinate + standby antibiotic; medical alert ID.",
    items: [
      { sev: "required", what: "**ER fever workup as OPSI** until proven otherwise",
        why: "OPSI mortality > 50% if delayed; treat first, investigate after; aggressive resuscitation" },
      { sev: "required", what: "**Pneumococcal vaccination** — PCV20 or PCV15 + PPSV23 series",
        why: "Encapsulated organism is the modal OPSI pathogen; up-to-date schedule mandatory" },
      { sev: "required", what: "**Meningococcal + Hib vaccination** — per CDC asplenia schedule",
        why: "Other encapsulated organisms; ACWY + B + Hib protect against second-tier OPSI pathogens" },
      { sev: "required", what: "**Standby antibiotic prescription** — amoxicillin or amox-clav",
        why: "Self-treatment of any febrile illness; immediate dose + ER visit reduces mortality" },
      { sev: "trigger", what: "**Daily prophylaxis** in children + first 2 yr post-splenectomy + immunocompromised",
        why: "Penicillin V or amoxicillin BID; ASH 2014 recommends in high-risk subgroups" },
      { sev: "trigger", what: "**Travel medicine + malaria + babesiosis counseling**",
        why: "Encapsulated organism + protozoal risks elevated; pre-travel ID consult" },
      { sev: "trigger", what: "**Medical alert bracelet + wallet card**",
        why: "Alerts ER staff to OPSI risk + accelerates empiric coverage" },
      { sev: "consider", what: "**Annual flu + COVID + RSV vaccines**",
        why: "Influenza drives bacterial superinfection in asplenic; routine adult immunization" },
    ],
  },
  rationale: {
    driver: "Any febrile illness in an asplenic (or functionally asplenic — sickle cell, post-XRT, celiac) host is OPSI until proven otherwise — Davies BSH 2011 and IDSA/ASH 2014 are uniform that the spleen's loss of opsonization and clearance of encapsulated organisms drives fulminant pneumococcal, meningococcal, and H. influenzae bacteremia within hours. Empiric ceftriaxone 2 g IV + vancomycin (for shock or suspected resistant pneumococcal meningitis) is the floor; pip-tazo or carbapenem broadens for Capnocytophaga after dog-bite exposure. The lifelong prevention bundle is the durable mortality lever: PCV20 (or PCV15 + PPSV23), MenACWY + MenB, Hib (CDC ACIP 2024) + standby amoxicillin or amox-clav + medical-alert bracelet + every-fever-equals-ED education.",
    guideline: "davies_bsh",
    rejected: "Discharging an asplenic patient with mild febrile illness without inpatient observation and broad empirics was deliberately rejected — Davies BSH 2011 and Bisharat 2001 both anchor admission + empiric coverage given the fulminant kinetics, even when the patient looks well at triage. Skipping the standby antibiotic + medical alert ID at discharge was tempered — Theilacker CID 2016 shows compliance gaps drive most modern OPSI cases, and transitions of care are where the bundle is lost. Reflexive lifelong daily penicillin prophylaxis in every adult asplenic was rejected: IDSA/ASH reserve daily ppx for children and the first 2 y post-splenectomy or immunocompromised subgroups." },
  objections: [
    { q: "Why empiric broad antibiotics for a well-looking asplenic with fever?",
      a: "Davies BSH 2011 [cite:davies_bsh] and Bisharat Lancet ID 2001 [cite:bisharat] both anchor that any febrile illness in an asplenic host is OPSI until proven otherwise — patients decompensate to fulminant sepsis within hours of mild prodromal symptoms, and the asymptomatic-looking phase is exactly when first-dose-at-triage saves life. Ceftriaxone 2 g IV + vancomycin (for shock or suspected resistant pneumococcal meningitis) is the floor; pip-tazo or carbapenem broadens for Capnocytophaga after dog-bite exposure." },
    { q: "Why standby amox-clav at discharge — drives resistance?",
      a: "Theilacker CID 2016 documents that the major mortality driver in modern OPSI is the gap between symptom onset and first antibiotic dose — standby amoxicillin or amox-clav given at the first febrile symptom bridges the patient from home to ED with measurable mortality benefit per IDSA / ASH 2014 and Davies BSH 2011 [cite:davies_bsh]. The resistance cost is real but small at intermittent self-dosing; the survival benefit substantially outweighs. Pair with explicit ED-instruction: take the dose, then come in." },
    { q: "Why CDC ACIP vaccine bundle — pneumococcal alone covers OPSI?",
      a: "Pneumococcal vaccination covers the majority of OPSI but CDC ACIP 2024 [cite:cdc_acip] mandates the full bundle (PCV20 or PCV15 + PPSV23, MenACWY + MenB, Hib) because meningococcus accounts for 5–15% of OPSI and H. influenzae remains a recognized cause in non-vaccinated adults. Sequential vaccination with documented intervals matters — incomplete schedules drive vaccine failure. Pair with annual influenza vaccination because flu drives bacterial superinfection in asplenic hosts." },
  ],
  research: {
    headline: "OPSI mortality > 50% — minutes matter; vaccination + standby antibiotic + medical alert ID drive prevention.",
    trials: [
      { name: "Davies BSH 2011",
        n: "Cohort review",
        question: "Asplenia prevention strategy effectiveness",
        finding: "Combined vaccination + daily PCN ppx (in high-risk) + standby antibiotic reduces OPSI incidence; gaps drive most modern cases",
        bias: "BSH consensus; institutional variation" },
      { name: "Theilacker CID 2016",
        n: "Cohort",
        question: "Adherence to asplenia prophylaxis",
        finding: "Suboptimal vaccination + standby compliance common; transitions of care drive gaps; education + medical alert ID help",
        bias: "Self-report; underestimates non-adherence" },
      { name: "CDC ACIP 2024",
        n: "Guideline",
        question: "Asplenia vaccination schedule",
        finding: "PCV20 or PCV15 + PPSV23 + MCV4 + MenB + Hib mandatory; sequential schedule with intervals",
        bias: "U.S.-specific; international guidance similar" },
    ],
    guidelines: [
      { society: "IDSA / ASH",
        year: 2014,
        topic: "Asplenia management",
        keypoint: "Lifetime vaccination; standby antibiotic; medical alert; daily ppx in children + first 2 y" },
      { society: "BSH",
        year: 2011,
        topic: "British asplenia guidance (Davies)",
        keypoint: "Aligned with IDSA/ASH; emphasizes travel + animal-exposure counseling" },
    ],
    openQuestions: [
      "Optimal standby antibiotic agent — amoxicillin vs cefuroxime; institutional variation",
      "Pneumococcal vaccine schedule sequential vs concurrent PCV + PPSV23 — debated",
      "Lifetime vs time-limited daily prophylaxis in adults — case-by-case",
    ],
  },
};

export default { id: "asplenia-prophylaxis", regimen, decision };
