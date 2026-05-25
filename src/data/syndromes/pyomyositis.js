/* ===========================================================
   PYOMYOSITIS — primary muscle infection; S. aureus dominant;
   imaging-guided drainage; longer courses for deep abscess. = */

const regimen = {
  "Empiric": [
    {
      rx: /vancomycin/i,
      pickIf: "Pyomyositis with abscess on imaging — typically tropical or immunocompromised.",
      whyPick: [
        "**Vancomycin** — S. aureus (incl. MRSA) is dominant",
        "**Drainage** if abscess > 3 cm or not improving",
        "Workup HIV — common substrate",
      ],
      watchOut: [
        { sev: "warn", text: "**MRI** to define collection — exam often misses early disease, especially deep / iliopsoas locations" },
        { sev: "warn", text: "**HIV + diabetes + IVDU + tropical exposure** are common substrates — workup the host even when bacterial cause is clear" },
        { sev: "note", text: "S. aureus accounts for >90% (USA300 in temperate areas); GAS, salmonella, Burkholderia in tropical exposure" },
      ],
    },
  ],
  "Directed (MSSA)": [
    {
      rx: /cefazolin|nafcillin/i,
      pickIf: "MSSA confirmed pyomyositis.",
      whyPick: [
        "**Cefazolin** — narrow, BID, lower toxicity than nafcillin",
        "**2–4 week course** depending on collection size + clinical response",
        "**Drainage** is the actual treatment for collections > 3 cm — antibiotic course timed from drainage day 0",
      ],
      watchOut: [
        { sev: "warn", text: "**Re-image at 2 wk** if clinical plateau — undetected loculations or new abscesses common" },
        { sev: "note", text: "Long course (>14 d) — monitor CBC + LFTs weekly for cefazolin-induced cytopenia / hepatitis" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "3–4 wk total — drainage + IV → oral step-down on response; longer if multifocal or persistent abscess.",
    evidence: "IDSA + tropical medicine reviews — S. aureus 75–95% of cases; MRI early; drainage is curative",
    branches: [
      { label: "Single drained abscess, immunocompetent", days: "21 d",
        detail: "IV → PO step-down on response; cefazolin for MSSA, vancomycin / linezolid for MRSA",
        matchAgent: /cefazolin|nafcillin|oxacillin/i },
      { label: "MRSA-confirmed", days: "21–28 d",
        detail: "Vancomycin or linezolid or daptomycin; AUC for vanco; PO step-down to clinda or doxy when stable",
        matchAgent: /vancomycin|linezolid|daptomycin/i },
      { label: "Multifocal / immunocompromised", days: "4–6 wk",
        detail: "ID consult; serial imaging; cover MRSA + GNR initially; narrow on cultures" },
      { label: "Tropical pyomyositis (endemic exposure)", days: "3–4 wk",
        detail: "S. aureus dominant; MRI early; rule out HIV + diabetes as substrate" },
      { label: "Persistent abscess despite drainage", days: "Per IR + ID",
        detail: "Repeat drainage; consider biofilm + retained necrotic tissue; surgical washout" },
    ],
    stopWhen: [
      "Abscess drained + no residual collection on imaging",
      "Afebrile ≥ 48 h + clinical recovery",
      "Inflammatory markers (CRP, WBC) trending normal",
      "Oral step-down complete + tolerating",
      "Minimum 21 d (single) or 28+ d (MRSA / multifocal) completed",
    ],
    extendIf: [
      { text: "**Multifocal disease** or persistent abscess on serial imaging",
        matchCtx: { severe: true } },
      "Bacteremia confirmed — per SAB bands if S. aureus",
      "Immunocompromised host — extend per ID + immune status",
      "Inadequate drainage — repeat IR or surgical",
    ],
  },
  monitoring: {
    headline: "MRI early; drainage drives outcome; SAB workup if S. aureus; HIV + diabetes screen for new diagnosis.",
    items: [
      { sev: "required", what: "**MRI of affected muscle group** at presentation",
        why: "Defines abscess vs. phlegmon; guides drainage planning; tracks response" },
      { sev: "required", what: "**Drainage** — IR or surgical — for any organized abscess",
        why: "Source control — antibiotics alone fail in established muscle abscess" },
      { sev: "required", what: "**Blood cultures × 2** at presentation",
        why: "S. aureus bacteremia common; if positive, treat per SAB bands (longer course + TEE)" },
      { sev: "trigger", what: "**HIV + diabetes screen** in new diagnosis (especially tropical)",
        why: "Underlying immunosuppression common substrate; addressable" },
      { sev: "trigger", what: "**Repeat MRI** at week 2–3 if non-response",
        why: "Persistent or new abscess drives re-drainage; tracks response objectively" },
      { sev: "trigger", what: "**Vancomycin AUC 400–600** for MRSA",
        why: "Therapeutic monitoring drives efficacy + reduces AKI",
        matchAgent: /vancomycin/i },
      { sev: "trigger", what: "**Compartment pressures** if extensive disease + pain out of proportion",
        why: "Compartment syndrome risk in extensive pyomyositis; surgical emergency" },
      { sev: "consider", what: "**Oral step-down** to clinda / doxy / linezolid when stable",
        why: "Reduces line complications + length of stay; outpatient completion feasible" },
    ],
  },
  rationale: {
    driver: "Pyomyositis is S. aureus in 75–95% of cases (Crum CID 2004) — empiric coverage is cefazolin / nafcillin for MSSA, vancomycin or linezolid for MRSA, and drainage of any organized abscess is the inflection point. MRI defines abscess vs phlegmon and guides IR or surgical drainage. Blood cultures are mandatory because concurrent S. aureus bacteremia is common and elevates the workup to SAB bands (echocardiography + 14-d minimum + ID consult). Standard duration is 3 weeks for a single drained abscess + IV-to-PO step-down on response; 4–6 wk for multifocal or immunocompromised disease. New diagnosis triggers HIV + diabetes screening — modifiable substrates that predispose.",
    guideline: "ssti",
    rejected: "Antibiotic-only management of an organized pyomyositis abscess was deliberately rejected — undrained collections seed bacteremia and recur, and IR or surgical drainage is the inflection point. Reflexive broad GNR + anaerobe coverage was tempered: pyomyositis is staphylococcal in the overwhelming majority, and routine pip-tazo without bacteremia or polymicrobial concern wastes spectrum and drives collateral resistance without benefit." },
  objections: [
    { q: "Why drainage essential — antibiotics for organized abscess?",
      a: "Pyomyositis is overwhelmingly S. aureus (Crum CID 2004 — 75–95%) — antibiotics alone fail to sterilize an organized muscle abscess, which seeds bacteremia + recurs without drainage. MRI defines abscess vs phlegmon and guides IR or surgical drainage. IDSA 2014 SSTI [cite:ssti] is explicit: organized collections need source control. Reflexive antibiotic-only management of a drainable collection wastes time and risks decompensation; drainage is the inflection point." },
    { q: "Why mandatory blood cultures — pyomyositis is local?",
      a: "Concurrent S. aureus bacteremia is common in pyomyositis and escalates management to the SAB bundle (TEE for IE workup, 14-d minimum, ID consult, halved mortality with ID consult per IDSA 2011) [cite:ie]. Blood cultures × 2 at presentation are non-negotiable; positive cultures shift the case from a 3-wk SSTI to a 4–6+ wk endovascular workup. Missing bacteremia in pyomyositis is a missed SAB diagnosis with attributable mortality." },
    { q: "Why not broaden GNR + anaerobe cover routinely?",
      a: "Routine pip-tazo broad-spectrum was deliberately tempered for pyomyositis — the substrate is staphylococcal in 75–95% of cases per Crum / IDSA 2014 [cite:ssti], and reflexive GNR + anaerobic coverage wastes spectrum without changing outcomes. Reserve broader empirics for polymicrobial concern (bowel-adjacent muscle, post-traumatic, immunocompromised), tropical exposure with atypical pathogens, or bacteremic with non-staph identified. MSSA → cefazolin / nafcillin; MRSA → vancomycin / linezolid is the audit-defensible default." },
    { q: "Why HIV + DM screen on new diagnosis — feels off-target?",
      a: "Crum CID 2004 and subsequent series document that HIV (untreated cell-mediated compromise) and uncontrolled diabetes are the dominant modifiable substrates predisposing to pyomyositis — particularly tropical pyomyositis [cite:ssti]. Screening on new diagnosis catches treatable underlying disease that drives recurrence + complications. The cost of the labs is trivial; the downstream public-health + individual-care benefit is documented. Standard of care for new presentation." },
  ],
  research: {
    headline: "S. aureus 75-95%; MRI early + drainage drives outcomes; SAB workup if S. aureus; HIV + DM screen for new diagnosis.",
    trials: [
      { name: "Crum CID 2004",
        n: "Cohort review",
        question: "Modern pyomyositis epidemiology + outcomes",
        finding: "S. aureus dominant 75-95%; MRI early + drainage drives outcomes; HIV / DM screen for new diagnosis",
        bias: "U.S. cohort; tropical pyomyositis underrepresented" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2014,
        topic: "Pyomyositis (Stevens)",
        keypoint: "MRI + drainage + 3-4 wk targeted; longer for multifocal / immunocompromised" },
    ],
    openQuestions: [
      "Tropical vs temperate epidemiology — substrate variation",
      "MRSA empiric thresholds — local prevalence",
    ],
  },
};

export default { id: "pyomyositis", regimen, decision };
