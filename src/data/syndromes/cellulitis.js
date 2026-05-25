/* ===========================================================
   SSTI · CELLULITIS — IDSA 2014 (Stevens). 5 d standard for
   non-purulent if responding; longer for purulent + MRSA. ====== */

const regimen = {
  "Standard": [
    {
      rx: /cefazolin|cephalexin/i,
      pickIf: "Non-purulent cellulitis — β-hemolytic strep is dominant.",
      whyPick: [
        "**Cefazolin / cephalexin** — covers β-hemolytic strep (the actual bug)",
        "**MRSA cover NOT needed** for non-purulent cellulitis (IDSA 2014)",
        "**5-day course** for mild/moderate; 7–10 d if slow response",
        "**Elevation + treating tinea pedis** prevents recurrence",
      ],
      watchOut: [
        { sev: "warn", text: "**Adding TMP-SMX/dox \"to cover MRSA\"** is overused — no benefit unless purulent or risk factors" },
        { sev: "warn", text: "**Worsening over first 48 h is expected** (immune response) — don't broaden if otherwise improving" },
        { sev: "note", text: "Stasis dermatitis + venous insufficiency mimic cellulitis — assess bilateral, fever, WBC" },
      ],
    },
  ],
  "Add MRSA": [
    {
      rx: /vancomycin|TMP-?SMX|doxycycline/i,
      pickIf: "Purulent component, IVDU, recent MRSA, no β-lactam response at 48–72 h.",
      whyPick: [
        "**Vancomycin** IV for hospitalized; **TMP-SMX or doxy** PO for outpatient",
        "**Don't drop the β-lactam** — strep often coexists",
        "Doxy and TMP-SMX both cover community MRSA well; doxy adds atypicals",
      ],
      watchOut: [
        { sev: "stop", text: "**TMP-SMX** — sulfa allergy, late pregnancy, hyperkalemia risk drugs" },
        { sev: "warn", text: "**Doxycycline** — pregnancy, children < 8 y" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "5 d standard for uncomplicated; 7–10 d if slow response, purulent, or MRSA-confirmed.",
    evidence: "IDSA 2014 — 5 d standard; Tansarli 2018 meta-analysis supports short course",
    branches: [
      { label: "Uncomplicated, clinical response", days: "5 d",
        detail: "Cefazolin / cephalexin; counts from first effective dose; AND-joined stop criteria",
        matchAgent: /cefazolin|cephalexin|dicloxacillin/i },
      { label: "Slow response or extensive", days: "7–10 d",
        detail: "Extend per clinical trajectory; reassess source + workup unusual organisms" },
      { label: "Purulent + MRSA-confirmed", days: "7–14 d",
        detail: "Vancomycin or TMP-SMX/doxy; longer if bacteremic or deep extension",
        matchAgent: /vancomycin|TMP-?SMX|doxycycline|clindamycin/i },
      { label: "Lymphangitic / erysipelas type", days: "5 d",
        detail: "Penicillin / cefazolin; strep-dominant disease responds quickly" },
    ],
    stopWhen: [
      "Erythema borders receding (mark + monitor)",
      "Afebrile ≥ 24–48 h",
      "WBC normalizing",
      "Pain decreasing",
      "Tolerating oral therapy",
      "Minimum 5 d completed",
    ],
    extendIf: [
      { text: "**Slow response by 48–72 h** — workup deeper infection / wrong organism",
        matchCtx: { severe: true } },
      "Purulent component / abscess → I&D + MRSA cover",
      "Bacteremia confirmed — extend per source",
      "Lymphedema / venous stasis substrate — prophylaxis consideration after resolution",
    ],
  },
  monitoring: {
    headline: "Mark erythema borders; reassess at 48–72 h; MRSA cover only for purulent component.",
    items: [
      { sev: "required", what: "**Mark erythema borders** + date — daily progression check",
        why: "Objective measure of response; spread despite antibiotic triggers re-workup" },
      { sev: "required", what: "**Reassess at 48–72 h** — fever, pain, oral tolerance",
        why: "Non-response by 72 h triggers MRSA cover, imaging for deep infection, or workup for atypical organism" },
      { sev: "trigger", what: "**Add MRSA cover** if purulent component, IVDU, or no response at 72 h",
        why: "Non-purulent cellulitis is strep-dominant; reflexive MRSA cover overused (IDSA 2014)",
        matchCtx: { mrsaRisk: true } },
      { sev: "trigger", what: "**Image (US / MRI)** if deep infection suspected",
        why: "Necrotizing fasciitis, abscess, osteomyelitis — surgical decision drivers" },
      { sev: "trigger", what: "**Treat predisposing tinea pedis** — interdigital fissures are entry portal",
        why: "Topical antifungal prevents recurrent leg cellulitis" },
      { sev: "consider", what: "**Prophylactic penicillin** for recurrent erysipelas (PATCH trials)",
        why: "Reduces time-to-next episode in lymphedema / venous stasis substrate" },
    ],
  },
  rationale: {
    driver: "Non-purulent cellulitis is overwhelmingly streptococcal — empiric cefazolin (IV) or cephalexin (PO) is appropriate; 5 d standard course is non-inferior to 10 d in those improving (Hepburn 2004, Tansarli 2018 meta). MRSA cover (vancomycin or TMP-SMX/doxycycline) is added only when purulent component, IVDU, prior MRSA isolate, or no response by 72 h. Mark erythema borders + date: spread despite antibiotic triggers re-workup for abscess, necrotizing infection, or wrong organism.",
    guideline: "ssti",
    rejected: "Reflexive MRSA cover in non-purulent cellulitis was deliberately rejected — Pallin (CID 2013, n=153) showed adding TMP-SMX to cephalexin did NOT improve cure, and the IDSA 2014 guideline reserves MRSA cover for purulent / risk-positive cases. Routine prolonged 10-d courses are unwarranted in those improving at 5 d, per Hepburn and the IDSA short-course standard." },
  objections: [
    { q: "Why not add MRSA cover by default — it's standard practice?",
      a: "Non-purulent cellulitis is overwhelmingly streptococcal — Pallin (CID 2013, n=153) showed adding TMP-SMX to cephalexin did NOT improve cure (85% vs 82%) over cephalexin alone [cite:pallin]. IDSA 2014 [cite:ssti] reserves empiric MRSA cover for purulent component, IVDU, prior MRSA isolate, severe sepsis, or non-response at 72 h. Reflexive MRSA cover drives resistance + collateral damage without survival benefit." },
    { q: "Why oral cephalexin — should this be IV in moderate disease?",
      a: "Oral cephalexin / dicloxacillin has excellent bioavailability (~90%) and matches IV cefazolin for uncomplicated cellulitis without sepsis or systemic toxicity per IDSA 2014 [cite:ssti]. Aboltins (CID 2015) showed oral non-inferior to IV in stable cellulitis. Reserve IV for severe sepsis, inability to tolerate oral, rapidly spreading erythema, or failed outpatient therapy. The IV-to-PO step-down is a stewardship win, not a quality-of-care concession." },
    { q: "Why only 5 d when 10 d is the legacy standard?",
      a: "Hepburn (Arch IM 2004, n=121) established 5 d non-inferior to 10 d in cellulitis responding by day 5; Tansarli (2018 meta) confirmed across short-course SSTI [cite:ssti]. IDSA 2014 endorses 5 d as standard; the 10-d legacy course adds antibiotic exposure without outcome benefit in responders. Extend to 7-10 d only when slow response, extensive disease, or non-strep pathogen confirmed — the AND-joined stop criteria gate the call." },
    { q: "Why not add TMP-SMX or doxy to cephalexin to widen coverage?",
      a: "The strongest direct evidence — Pallin (CID 2013) and Moran (NEJM 2017, n=500) — both showed NO benefit to adding TMP-SMX or clindamycin to cephalexin for non-purulent cellulitis [cite:pallin]. Streptococci are universally cephalexin-susceptible; MRSA cover is irrelevant unless purulent. Adding a second agent adds GI side effects, hyperkalemia (TMP-SMX), and C. diff risk without clinical benefit." },
  ],
  research: {
    headline: "Non-purulent cellulitis is strep-dominant — MRSA cover routinely unnecessary; 5-day course adequate.",
    trials: [
      { name: "Hepburn Arch IM 2004",
        n: "121",
        question: "5 d vs 10 d cellulitis treatment",
        finding: "5 d non-inferior to 10 d; foundation of short-course IDSA recommendation",
        bias: "Single-center; uncomplicated cellulitis only" },
      { name: "Tansarli 2018 meta-analysis",
        n: "1,605",
        question: "Short course (≤ 6 d) vs long course in cellulitis",
        finding: "No clinical cure difference; reduced AE; supports 5-day standard",
        bias: "Pooled mild-to-moderate; severe cellulitis underrepresented" },
      { name: "Pallin CID 2013",
        n: "153",
        question: "Cephalexin + TMP-SMX vs cephalexin alone for uncomplicated cellulitis",
        finding: "Adding MRSA coverage did NOT improve cure — non-purulent cellulitis is strep-dominant",
        bias: "Excluded severe + immunocompromised; supports stewardship in non-purulent" },
      { name: "PATCH I + II BMJ 2018",
        n: "1,124",
        question: "Penicillin prophylaxis for recurrent leg cellulitis",
        finding: "PCN V 250 mg BID reduced recurrence ~45% over 3 yr; protective effect waned post-discontinuation",
        bias: "European cohort; long-term resistance / adherence challenges" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2014,
        topic: "SSTI management (Stevens)",
        keypoint: "Non-purulent cellulitis treated empirically with β-lactam; MRSA cover only if purulent component or risk factors" },
      { society: "BSAC",
        year: 2021,
        topic: "British SSTI guidance",
        keypoint: "Aligned with IDSA — emphasizes outpatient parenteral antibiotic therapy (OPAT) pathways for moderate disease" },
    ],
    openQuestions: [
      "Outpatient vs inpatient management thresholds — variable by institution",
      "Routine MRSA cover in cellulitis — Pallin 2013 supports stewardship but reflex MRSA cover common",
      "Adjunctive steroids for severe cellulitis (Solomon 2014 supported in small trial) — not standard",
    ],
  },
};

export default { id: "cellulitis", regimen, decision };
