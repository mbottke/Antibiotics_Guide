/* ===========================================================
   ENDOPHTHALMITIS — sight-threatening; intravitreal antibiotics
   PRIMARY; systemic adjunctive; ophtho emergency. ============= */

const regimen = {
  "Intravitreal (definitive)": [
    {
      rx: /intravitreal/i,
      pickIf: "Bacterial endophthalmitis — vision-threatening, treat at bedside.",
      whyPick: [
        "**Intravitreal vancomycin + ceftazidime (or amikacin)** — definitive route",
        "**Vitrectomy** if vision worse than hand-motion (EVS criteria) or vitreous opacity",
        "**Vitreous tap + culture BEFORE drug administration** — yields the pathogen + drives narrowing",
      ],
      watchOut: [
        { sev: "stop", text: "**Time = vision** — call ophthalmology immediately; minutes to hours determines outcome" },
        { sev: "warn", text: "**Post-cataract / post-injection endophthalmitis** is the most common cause — review recent ocular procedures + assume bacterial until proven fungal" },
        { sev: "note", text: "Topical antibiotics alone insufficient — intravitreal route mandatory; intravitreal corticosteroid use case-by-case" },
      ],
    },
  ],
  "Endogenous / systemic": [
    {
      rx: /systemic.*vancomycin|antipseudomonal/i,
      pickIf: "Endogenous endophthalmitis from bloodstream source.",
      whyPick: [
        "**Systemic vancomycin + antipseudomonal β-lactam** — covers gram-positive + gram-negative bloodstream source",
        "**Treat the bloodstream source** — K. pneumoniae liver abscess classic; SAB + line + IVDU other substrates",
        "**Antifungal (echinocandin)** for Candida endophthalmitis — common in TPN, IVDU, post-transplant",
        "Intravitreal agents in parallel — systemic alone often inadequate due to blood-eye barrier",
      ],
      watchOut: [
        { sev: "warn", text: "**Workup K. pneumoniae liver abscess** when endogenous + Asian-Pacific demographics — hypervirulent K. pneumoniae classic" },
        { sev: "warn", text: "**Bilateral involvement** at presentation — disseminated infection; broaden + image-search every other foci" },
        { sev: "note", text: "Vitrectomy yield highest within 24 h; later vitrectomy still therapeutic if no improvement" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Intravitreal vanco + ceftaz primary; systemic 7–14 d adjunctive; vitrectomy for severe / endogenous.",
    evidence: "EVS 1995 + AAO — intravitreal antibiotics drive outcome; vitrectomy if light-perception-only vision at presentation; endogenous needs systemic",
    branches: [
      { label: "Post-cataract / post-injection (acute exogenous)", days: "Intravitreal + 7 d",
        detail: "Intravitreal vancomycin 1 mg + ceftazidime 2.25 mg; tap-and-inject; oral fluoroquinolone systemic × 7 d",
        matchAgent: /vancomycin|ceftazidime/i },
      { label: "Severe (LP vision) — vitrectomy + intravitreal", days: "Vitrectomy + 14 d",
        detail: "Pars plana vitrectomy + intravitreal antibiotics + systemic × 14 d; per EVS LP-vision benefit; ophtho emergency" },
      { label: "Endogenous (hematogenous seeding)", days: "14–21 d + intravitreal",
        detail: "Systemic 14–21 d treats source (BCx + echo + abdominal imaging); intravitreal early" },
      { label: "Fungal (Candida, mold)", days: "6 wk + intravitreal",
        detail: "Voriconazole or ampho IV × 6 wk + intravitreal vori or ampho; vitrectomy for moderate-severe",
        matchAgent: /voriconazole|amphotericin/i },
      { label: "Bleb-related (post-trabeculectomy)", days: "Intravitreal + 14 d",
        detail: "Strep dominant; systemic × 14 d + intravitreal; ophtho + ID coordination" },
    ],
    stopWhen: [
      "Intravitreal antibiotics administered",
      "Vision stable or improving",
      "Cultures clear or appropriately treated",
      "Vitrectomy performed if indicated",
      "Source workup completed (endogenous)",
    ],
    extendIf: [
      { text: "**Endogenous source** — extend systemic per source + pathogen",
        matchCtx: { severe: true } },
      "Fungal pathogen — extend per IFI bands",
      "Persistent infection — repeat intravitreal + vitrectomy",
      "Bacteremia or other metastatic foci — per source",
    ],
  },
  monitoring: {
    headline: "Intravitreal is primary; ophtho emergency consult; tap-and-inject; vitrectomy for LP vision.",
    items: [
      { sev: "required", what: "**Emergent ophthalmology consult** — sight-threatening",
        why: "Intravitreal antibiotics within hours preserves vision; delay drives permanent loss" },
      { sev: "required", what: "**Vitreous tap + culture** before intravitreal antibiotics",
        why: "Pathogen-directed therapy + sensitivity drive escalation if non-response" },
      { sev: "required", what: "**Intravitreal vancomycin + ceftazidime**",
        why: "Primary therapy; systemic alone fails (poor vitreous penetration)" },
      { sev: "trigger", what: "**Pars plana vitrectomy** if vision LP or worse at presentation",
        why: "EVS — vitrectomy benefit limited to LP-vision subgroup; standard of care in severe" },
      { sev: "trigger", what: "**Workup endogenous source** if no recent ocular procedure",
        why: "BCx + echo + abdominal imaging + UA + IV access review; treats underlying cause" },
      { sev: "trigger", what: "**Repeat intravitreal at 48–72 h** if non-response",
        why: "Persistent infection may need re-injection; ophtho-driven decision" },
      { sev: "trigger", what: "**Fungal workup** if subacute / endogenous / immunocompromised",
        why: "Candida endophthalmitis common in candidemia; ophtho exam mandatory in candidemia" },
      { sev: "consider", what: "**Steroids (intravitreal dexamethasone) controversial**",
        why: "Not standard; may benefit non-fungal severe disease; ophtho-driven decision" },
    ],
  },
  rationale: {
    driver: "Endophthalmitis treatment is fundamentally a vitreous-penetration problem — systemic antibiotics fail because the blood–retinal barrier limits intravitreal drug levels, so intravitreal vancomycin 1 mg + ceftazidime 2.25 mg is the primary therapy delivered as tap-and-inject within hours of suspicion (EVS Arch Ophthalmol 1995). Vitrectomy adds benefit limited to the light-perception-only subgroup. Endogenous endophthalmitis (hematogenous seeding, often Candida or hypervirulent K. pneumoniae) needs 14–21 d systemic to treat the source plus intravitreal early. Fungal disease extends to 6 wk with voriconazole or amphotericin systemic + intravitreal. Ophthalmology emergency — delay drives permanent vision loss.",
    guideline: "ie",
    rejected: "Systemic-only therapy for endophthalmitis was deliberately rejected — the vitreous + aqueous compartments are poorly penetrated by systemic dosing, and intravitreal antibiotics within hours of suspicion are the only proven path to vision preservation (EVS 1995). Routine vitrectomy for all severities was tempered: EVS established benefit limited to the light-perception-only subgroup, and earlier or less severe cases do not benefit from the surgical exposure + complication risk." },
  objections: [
    { q: "Why intravitreal antibiotics — IV vancomycin should work?",
      a: "Endophthalmitis treatment is fundamentally a vitreous-penetration problem — systemic antibiotics fail because the blood–retinal barrier limits intravitreal drug levels below therapeutic concentrations for most pathogens. EVS (Arch Ophthalmol 1995, n=420) [cite:ie] established intravitreal vancomycin 1 mg + ceftazidime 2.25 mg as primary therapy delivered as tap-and-inject within hours of suspicion. Systemic adds for endogenous source treatment but cannot substitute. Ophthalmology emergency consult is mandatory; the intravitreal window closes fast." },
    { q: "Why vitrectomy only for LP-vision — vision matters at every stage?",
      a: "EVS (Arch Ophthalmol 1995) [cite:ie] specifically established that vitrectomy benefit is limited to the light-perception-only subgroup at presentation — patients with hand-motion or better vision did equally well with tap-and-inject + intravitreal antibiotics, and the surgical exposure + complication risk of vitrectomy outweighed benefit at higher visual acuity. AAO 2023 endorses the EVS-defined threshold. Reserve vitrectomy for the LP-vision presentation; less severe disease does not benefit." },
    { q: "Why work up endogenous source — even with no recent procedure?",
      a: "Endogenous endophthalmitis represents hematogenous seeding from an underlying source — blood cultures + echocardiogram + abdominal imaging + UA + IV access review per AAO 2023 [cite:ie] identify the source (endocarditis, candidemia, biliary, urinary, IVDU access) that drives both ocular outcome and systemic survival. Candida + hypervirulent K. pneumoniae are the highest-yield finds; treatment changes from ocular-focused to systemic-source-directed (14–21 d minimum systemic). Missing the source predicts recurrence." },
    { q: "Why ophthalmology consult for candidemia — vision intact?",
      a: "Endogenous Candida endophthalmitis complicates ~5–15% of candidemia and is vision-threatening if missed — IDSA / Pappas candidiasis guidance and AAO 2023 [cite:ie] mandate dilated fundoscopy in every candidemic patient regardless of visual symptoms. Treatment changes from systemic-only echinocandin to systemic voriconazole or amphotericin + intravitreal when chorioretinitis or vitritis is found. Progression to vitreous involvement is rapid; the cost of a fundoscopy exam is trivial relative to permanent vision loss." },
  ],
  research: {
    headline: "EVS 1995 — intravitreal antibiotics PRIMARY; vitrectomy for LP vision; systemic alone fails (poor vitreous penetration).",
    trials: [
      { name: "EVS Arch Ophthalmol 1995",
        n: "420",
        question: "Vitrectomy vs vitreous tap in postoperative endophthalmitis",
        finding: "Vitrectomy benefit limited to LP-vision subgroup; intravitreal antibiotics primary; established modern paradigm",
        bias: "Pre-modern intravitreal antibiotic combinations" },
      { name: "Mehta CID 2013",
        n: "Cohort review",
        question: "Modern endophthalmitis epidemiology + outcomes",
        finding: "Tap-and-inject standard; vancomycin + ceftazidime intravitreal; systemic for endogenous + fungal",
        bias: "Updated post-EVS; supports current AAO guidance" },
      { name: "Falavarjani Br J Ophthalmol 2017",
        n: "Cohort",
        question: "Post-injection endophthalmitis after anti-VEGF",
        finding: "~0.05% incidence; aseptic technique critical; immediate tap-and-inject improves outcomes",
        bias: "Subspecialty-specific" },
    ],
    guidelines: [
      { society: "AAO",
        year: 2023,
        topic: "American Academy of Ophthalmology endophthalmitis",
        keypoint: "Tap-and-inject intravitreal vancomycin + ceftazidime; vitrectomy for LP vision or severe; systemic adjunct" },
      { society: "ESCRS",
        year: 2024,
        topic: "European cataract surgery endophthalmitis",
        keypoint: "Intracameral antibiotic prophylaxis (moxifloxacin or cefuroxime); per AAO for treatment" },
    ],
    openQuestions: [
      "Intracameral prophylaxis post-cataract — increasingly standard",
      "Routine vitrectomy thresholds — vision-driven; EVS LP-vision benefit",
      "Steroid use intravitreal — contested; ophtho-driven case-by-case",
    ],
  },
};

export default { id: "endophthalmitis", regimen, decision };
