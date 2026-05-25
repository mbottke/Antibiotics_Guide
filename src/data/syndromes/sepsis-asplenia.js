/* ===========================================================
   SEPSIS — Asplenia / hyposplenia. OPSI emergency. ============== */

const regimen = {
  "Empiric": [
    {
      rx: /ceftriaxone/i,
      pickIf: "Any fever + asplenia/hyposplenia — treat as bacteremia until proven otherwise.",
      whyPick: [
        "**Ceftriaxone 2 g IV q12h** (meningitis dose) — covers pneumococcus + Capnocytophaga",
        "Mortality in OPSI **40–70%** — give within **minutes** of suspicion",
        "Add **vancomycin** for resistant pneumococcus / meningitis suspicion",
        "**Counsel patients**: every fever = ED visit; carry standby amox-clav at home",
      ],
      watchOut: [
        { sev: "stop", text: "**Do not wait for cultures** — give first dose at triage" },
        { sev: "warn", text: "Capnocytophaga canimorsus (dog bite + asplenia) → fulminant DIC" },
        { sev: "note", text: "Functional asplenia (SCD, celiac, post-XRT) carries similar risk" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "14 d standard for asplenic bacteremia; ceftriaxone IV → step-down by organism.",
    evidence: "Society consensus — long-course given fulminant kinetics; pneumococcal vaccine + counseling",
    branches: [
      { label: "Stable, susceptible organism", days: "10–14 d",
        detail: "Ceftriaxone IV → oral step-down per susceptibilities",
        matchAgent: /ceftriaxone/i },
      { label: "Septic shock at presentation", days: "14 d",
        detail: "Broaden empirics; add vancomycin if resistant pneumococcus or meningitis",
        matchAgent: /vancomycin/i },
      { label: "Capnocytophaga (animal exposure)", days: "14–21 d",
        detail: "Pip-tazo or carbapenem; DIC + purpura fulminans risk; ICU early",
        matchAgent: /piperacillin|carbapenem/i },
    ],
    stopWhen: [
      "Afebrile ≥ 48 h, off vasopressors",
      "Blood cultures cleared ≥ 48 h",
      "Clinical recovery (end-organ, WBC, lactate)",
      "Vaccination plan documented (PCV, MenACWY, Hib)",
      "Standing home antibiotic prescription provided",
      "Minimum 10–14 d completed",
    ],
    extendIf: [
      { text: "**Capnocytophaga + DIC / purpura fulminans** — extend per response",
        matchCtx: { severe: true } },
      "Meningitis complication — extend per meningitis bands",
      "Hardware retained / endovascular foci — extend per source",
      "Functional asplenia (SCD, post-XRT, celiac) — same protocol",
    ],
  },
  monitoring: {
    headline: "Treat at triage (no culture wait); vaccinate post-acute; standing home prescription.",
    items: [
      { sev: "required", what: "**First dose at triage** — don't wait for cultures",
        why: "Mortality 40–70% if delayed; minutes matter in OPSI" },
      { sev: "required", what: "**Vaccination plan** — PCV20 or PCV13+PPSV23, MenACWY, Hib (if not vaccinated)",
        why: "Prevention of subsequent OPSI; long-term immunity strategy" },
      { sev: "required", what: "**Standing home antibiotic prescription** at discharge",
        why: "Patient self-administers amox-clav (or alt) at first fever; bridge to ED" },
      { sev: "trigger", what: "**Capnocytophaga workup** if dog / cat / animal exposure",
        why: "Fulminant DIC pattern; ICU + ID partnership; emergent broad coverage" },
      { sev: "trigger", what: "**Counsel on functional asplenia substrate** — SCD, post-XRT, celiac",
        why: "Same OPSI risk profile; same prevention + treatment protocol" },
      { sev: "consider", what: "**Annual influenza + COVID vaccination**",
        why: "Reduces secondary bacterial infection risk; standard prevention" },
    ],
  },
  rationale: {
    driver: "Sepsis in the asplenic or hyposplenic host is OPSI until proven otherwise — minutes-to-antibiotic drive mortality, which sits at 38–69% if delayed (Bisharat Lancet ID 2001), and the spleen's loss of opsonization and clearance of encapsulated organisms makes pneumococcus, meningococcus, and H. influenzae the dominant pathogens. The empiric is ceftriaxone 2 g IV q24h at triage without waiting for cultures; vancomycin is added for septic shock or suspected resistant pneumococcal meningitis; pip-tazo or carbapenem if Capnocytophaga is suspected after dog-bite exposure with DIC kinetics. Functional asplenia (sickle cell, prior splenic XRT, celiac) follows the identical protocol per BSH (Davies 2011) and IDSA/ASH.",
    guideline: "davies_bsh",
    rejected: "Waiting on culture data before starting antibiotics was deliberately rejected — OPSI mortality compounds by the minute, and Davies BSH 2011 + Bisharat 2001 both anchor first-dose-at-triage even when the diagnosis is still uncertain. Narrow ceftriaxone alone in the shocked or meningitic presentation was tempered — vancomycin must be added until resistant pneumococcus is excluded, and broader cover (pip-tazo) added if Capnocytophaga is plausible. Skipping the vaccination + standby-antibiotic + medical-alert bundle at discharge was rejected — the BSH and IDSA/ASH guidance show these reduce recurrent OPSI more reliably than any acute regimen change." },
  objections: [
    { q: "Why first dose at triage — before cultures?",
      a: "OPSI mortality is 38–69% without timely antibiotics per Bisharat Lancet ID 2001 [cite:bisharat], and compounds by the minute because the spleen's loss of opsonization and clearance of encapsulated organisms removes the critical defense. Davies BSH 2011 [cite:davies_bsh] and IDSA / ASH 2014 anchor ceftriaxone 2 g IV at triage even when the diagnosis is uncertain. Cultures are drawn before the dose if they don't delay administration, but the dose is not gated by culture acquisition." },
    { q: "Why add vancomycin if encapsulated organisms are PCN-susceptible?",
      a: "Drug-resistant Streptococcus pneumoniae (DRSP) accounts for 20–40% of isolates in U.S. surveillance, and ceftriaxone monotherapy at meningitic CSF concentrations fails against high-level ceftriaxone-resistant pneumococcus — vancomycin is added at shock or suspected meningitis presentation per the IDSA / ASH 2014 asplenia bundle and Davies BSH 2011 [cite:davies_bsh]. Narrow to ceftriaxone or PCN once susceptibilities confirm; the empiric breadth is gated to severity, not retained beyond culture data." },
    { q: "Why pip-tazo or carbapenem if dog-bite history — ceftriaxone covers most?",
      a: "Capnocytophaga canimorsus after dog (or cat) exposure in an asplenic host produces fulminant DIC + purpura fulminans with mortality > 30% per Janda CID 1999 — ceftriaxone has activity but pip-tazo or meropenem provides broader cover for the polymicrobial bite-wound substrate + β-lactamase-producing strains per IDSA SSTI 2014 [cite:ssti]. The dog-exposure plus asplenic combination triggers automatic broadening; the time-cost of narrowing later is acceptable, the time-cost of missing Capnocytophaga is not." },
  ],
  research: {
    headline: "Encapsulated organisms drive OPSI; mortality > 50%; vaccination + standby antibiotic + medical alert ID prevent.",
    trials: [
      { name: "Bisharat Lancet ID 2001",
        n: "Cohort review",
        question: "OPSI mortality + epidemiology",
        finding: "Mortality 38–69% without timely treatment; pneumococcus drives 50–90%; minutes-to-antibiotic critical",
        bias: "Pre-vaccination-era; modern rates improved" },
      { name: "Davies BSH 2011",
        n: "Guideline",
        question: "Modern asplenia prevention strategy",
        finding: "Vaccination + daily PCN ppx (high-risk) + standby antibiotic + medical alert combination reduces OPSI",
        bias: "BSH consensus" },
    ],
    guidelines: [
      { society: "IDSA / ASH",
        year: 2014,
        topic: "Asplenia management",
        keypoint: "Lifetime vaccination + standby antibiotic + medical alert; OPSI mortality > 50% drives aggressive empiric" },
    ],
    openQuestions: [
      "Lifetime vs time-limited daily ppx — case-by-case",
      "Standby antibiotic agent — amoxicillin vs cefuroxime",
      "Functional asplenia (SCD, post-XRT) — same protocol",
    ],
  },
};

export default { id: "sepsis-asplenia", regimen, decision };
