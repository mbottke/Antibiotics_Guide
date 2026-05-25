/* ===========================================================
   OPSI — Overwhelming post-splenectomy infection. ============== */

const regimen = {
  "Empiric": [
    {
      rx: /ceftriaxone/i,
      pickIf: "Asplenic patient + fever — true emergency, treat at triage.",
      whyPick: [
        "**Ceftriaxone 2 g IV** within minutes of arrival",
        "**Add vancomycin** for resistant pneumococcus / meningitis suspicion",
        "Mortality 40–70% if delayed",
        "**Standby home antibiotic** (amox-clav) for these patients",
      ],
      watchOut: [
        { sev: "stop", text: "**No delay for cultures** — first dose at triage" },
        { sev: "warn", text: "Capnocytophaga risk (dog bite + asplenia) → DIC" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "10–14 d ceftriaxone for stable; 14 d + vanco for shock/meningitis; OPSI = emergency.",
    evidence: "Society consensus — minutes matter; pneumococcal + Hib + meningococcal coverage",
    branches: [
      { label: "Stable encapsulated bacteremia", days: "10–14 d",
        detail: "Ceftriaxone IV → oral step-down per susceptibilities",
        matchAgent: /ceftriaxone/i },
      { label: "Septic shock / meningitis", days: "14 d",
        detail: "Ceftriaxone + vancomycin + dexamethasone if meningitis suspected" },
      { label: "Capnocytophaga (animal exposure)", days: "14–21 d",
        detail: "Pip-tazo or carbapenem; DIC + purpura fulminans risk",
        matchAgent: /piperacillin|carbapenem/i },
    ],
    stopWhen: [
      "Afebrile ≥ 48 h, off vasopressors",
      "Blood cultures cleared ≥ 48 h",
      "Clinical recovery",
      "Vaccination plan documented",
      "Standing home antibiotic prescription provided",
      "Minimum 10–14 d completed",
    ],
    extendIf: [
      { text: "**Capnocytophaga + DIC** — extend per response",
        matchCtx: { severe: true } },
      "Meningitis complication — extend per meningitis bands",
      "Endovascular / metastatic foci",
      "Functional asplenia — same protocol",
    ],
  },
  monitoring: {
    headline: "Treat at triage; vaccinate; standing home prescription; counsel lifelong.",
    items: [
      { sev: "required", what: "**First dose within minutes** of suspicion — don't wait for cultures",
        why: "Mortality 40–70% if delayed" },
      { sev: "required", what: "**Vaccinate** PCV20 or PCV13+PPSV23, MenACWY, Hib",
        why: "Long-term prevention of recurrent OPSI" },
      { sev: "required", what: "**Standing home antibiotic prescription** (amox-clav or similar)",
        why: "Patient self-administers at first fever; bridges to ED" },
      { sev: "trigger", what: "**Capnocytophaga workup** if animal exposure",
        why: "Fulminant DIC pattern in asplenic" },
      { sev: "trigger", what: "**Counsel lifelong** — every fever = ED visit; medical alert bracelet",
        why: "Lifelong risk; patient education drives outcomes" },
      { sev: "consider", what: "**Annual flu + COVID vaccination**",
        why: "Reduces secondary bacterial infection risk" },
    ],
  },
  rationale: {
    driver: "OPSI is the lethal late complication of splenectomy or functional asplenia — fulminant pneumococcal, meningococcal, or H. influenzae bacteremia within hours of mild prodromal symptoms, with mortality 38–69% even with treatment (Bisharat Lancet ID 2001) because the spleen's loss of opsonization and clearance of encapsulated organisms removes a critical line of defense. First-dose-at-triage is the survival lever — ceftriaxone 2 g IV before cultures resolve, vancomycin added for shock or meningitis (resistant pneumococcus), pip-tazo or carbapenem for Capnocytophaga after dog-bite exposure with DIC. Lifelong prevention bundle: PCV20 (or PCV15 + PPSV23), MenACWY + MenB, Hib + standby amox-clav + medical alert bracelet (CDC ACIP 2024; IDSA/ASH 2014).",
    guideline: "bisharat",
    rejected: "Waiting on culture data before initiating empiric antibiotics was deliberately rejected — Bisharat and successor cohorts show mortality compounds by the minute, and the OPSI guidance is uniform that first-dose-at-triage precedes the diagnostic workup. Reflexive narrow-spectrum monotherapy without considering Capnocytophaga in the dog-bite history was tempered — pip-tazo or carbapenem are required when the bite history + DIC kinetics fit. Skipping the long-term prevention bundle at discharge was rejected: every readmission for OPSI represents a system failure of the vaccination + standby-antibiotic + medical-alert tripod that ASH and BSH both anchor as the durable mortality lever." },
  objections: [
    { q: "Why empiric ceftriaxone at triage — even before cultures?",
      a: "OPSI mortality is 38–69% without timely antibiotics per Bisharat Lancet ID 2001 [cite:bisharat] and compounds by the minute — the spleen's loss of opsonization of encapsulated organisms (pneumococcus, meningococcus, H. influenzae) drives fulminant bacteremia within hours of mild prodromal symptoms. Davies BSH 2011 [cite:davies_bsh] and IDSA / ASH 2014 anchor first-dose-at-triage. Ceftriaxone 2 g IV covers > 90% of OPSI pathogens; vancomycin added for shock or suspected resistant pneumococcal meningitis." },
    { q: "Why vaccinate + standby antibiotic + medical alert — isn't one enough?",
      a: "Theilacker CID 2016 and Davies BSH 2011 [cite:davies_bsh] show OPSI breakthrough in fully vaccinated patients because pneumococcal vaccines cover serotype-specific antibody with blunted response in asplenic hosts. The IDSA / ASH 2014 tripod — vaccination + standby antibiotic + medical-alert ID — is the durable mortality lever; missing any single leg drives most modern OPSI deaths. CDC ACIP 2024 [cite:cdc_acip] mandates PCV20 (or PCV15 + PPSV23), MenACWY + MenB, Hib for asplenic adults." },
    { q: "Why broaden to pip-tazo or carbapenem after a dog bite?",
      a: "Capnocytophaga canimorsus in the asplenic host produces fulminant DIC + purpura fulminans with mortality > 30% per Janda CID 1999 — ceftriaxone covers most strains but pip-tazo or meropenem provides broader cover for β-lactamase-producing isolates + the polymicrobial bite-wound substrate per IDSA SSTI 2014 [cite:ssti]. The dog-exposure plus asplenic combination triggers automatic broadening at triage. ICU-level resuscitation is concurrent because the DIC + purpura fulminans phenotype evolves over hours." },
  ],
  research: {
    headline: "Vaccination + standby antibiotic + medical alert ID reduce OPSI mortality; minutes matter at presentation.",
    trials: [
      { name: "Bisharat Lancet ID 2001",
        n: "Cohort review",
        question: "OPSI epidemiology + outcomes",
        finding: "Mortality 38–69% without timely treatment; pneumococcus drives 50–90% of cases; minutes-to-antibiotic critical",
        bias: "Pre-vaccination-era epidemiology; modern rates lower but mortality still substantial" },
      { name: "Theilacker CID 2016",
        n: "Cohort",
        question: "Compliance with asplenia prophylaxis",
        finding: "Adherence to vaccination + standby antibiotic + medical alert drives OPSI mortality reduction; gaps common in transitions of care",
        bias: "Self-report adherence; underestimates non-adherence" },
      { name: "Davies Br J Haematol 2011",
        n: "Cohort review",
        question: "Optimal vaccination + ppx schedule for asplenia",
        finding: "PCV + PPSV + Hib + MCV4 + B vaccines + daily PCN for children + first 2 y; lifetime standby antibiotic",
        bias: "BSH consensus; minor variation by country" },
    ],
    guidelines: [
      { society: "IDSA / ASH",
        year: 2014,
        topic: "Asplenia immunization + ppx",
        keypoint: "Lifetime pneumococcal + meningococcal + Hib vaccination; standby antibiotic; medical alert bracelet" },
      { society: "CDC ACIP",
        year: 2024,
        topic: "Asplenia vaccination schedule",
        keypoint: "PCV20 or PCV15 + PPSV23 + MCV4 + MenB + Hib; up-to-date schedule mandatory" },
    ],
    openQuestions: [
      "Optimal daily prophylaxis duration — children + 2 y post-splenectomy minimum; longer in some adults",
      "Standby antibiotic agent choice — amoxicillin vs cefuroxime vs amox-clav; institutional variation",
      "Pneumococcal vaccine schedule revisions — sequential vs concurrent PCV + PPSV23 debated",
    ],
  },
};

export default { id: "opsi", regimen, decision };
