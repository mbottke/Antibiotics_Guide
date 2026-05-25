/* ===========================================================
   PID — pelvic inflammatory disease. CDC 2021 — ceftriaxone +
   doxy + metronidazole; outpatient feasible for mild. ======== */

const regimen = {
  "Inpatient (severe / TOA)": [
    {
      rx: /ceftriaxone.*doxycycline.*metronidazole/i,
      pickIf: "Severe PID, TOA, or pregnancy / failed outpatient therapy.",
      whyPick: [
        "**Ceftriaxone + doxycycline + metronidazole** — CDC 2021 guideline",
        "**Doxycycline IV** if oral not tolerated; switch to oral when stable",
        "**Drainage** for TOA > 7–8 cm or non-responding at 48–72 h",
        "**14-day total course** — IV-to-PO transition guided by clinical improvement",
      ],
      watchOut: [
        { sev: "warn", text: "**Screen for HIV, syphilis, GC/CT, hepatitis** — treat partners; mandatory STI screen panel" },
        { sev: "warn", text: "**IUD in place** — generally retain unless severe disease or persistent fever > 72 h on therapy" },
        { sev: "note", text: "Long-term sequelae: infertility (12–18% per episode), chronic pelvic pain, ectopic pregnancy 6× baseline risk" },
      ],
    },
  ],
  "Tubo-ovarian abscess": [
    {
      rx: /drainage|abscess/i,
      pickIf: "TOA large (> 7–8 cm) or not responding to antibiotics.",
      whyPick: [
        "**Add drainage** for large or non-responding collections — IR percutaneous first-line",
        "**Surgery for ruptured TOA** — laparoscopic / open exploration emergent",
        "**Image-guided drainage success rate ~70–90%** in unruptured collections — preferred over surgery when feasible",
      ],
      watchOut: [
        { sev: "stop", text: "**Ruptured TOA → surgical emergency** — sepsis + peritonitis; OR within hours" },
        { sev: "warn", text: "**Persistent fever > 72 h** on appropriate antibiotics → reassess for drainage / repeat imaging" },
        { sev: "note", text: "Post-drainage course continues IV until afebrile + WBC normalizing; total 14+ days standard" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "14 d for outpatient (CTX + doxy + metro); IV → PO step-down for inpatient; longer for TOA.",
    evidence: "CDC 2021 STI guidelines — ceftriaxone 500 mg IM + doxy + metro × 14 d; TOA needs IV + drainage consideration",
    branches: [
      { label: "Outpatient (mild-moderate)", days: "14 d",
        detail: "Ceftriaxone 500 mg IM × 1 + doxy 100 mg PO BID + metronidazole 500 mg PO BID × 14 d",
        matchAgent: /ceftriaxone|doxycycline|metronidazole/i },
      { label: "Inpatient (severe / failed outpatient / pregnancy)", days: "14 d (IV → PO)",
        detail: "Cefoxitin or cefotetan IV + doxy → PO step-down when stable; OR clinda + gentamicin",
        matchAgent: /cefoxitin|cefotetan/i },
      { label: "Tubo-ovarian abscess (TOA)", days: "14–21 d + drain?",
        detail: "IV regimen + drainage if > 8 cm or non-response by 72 h; gyn + IR coordination" },
      { label: "Pregnant", days: "14 d IV",
        detail: "Avoid doxy + metro 1st trimester; cef + azithro alternative; OB-GYN driven" },
      { label: "IUD in place", days: "14 d + IUD decision",
        detail: "Removal not required if responding; consider removal if no improvement by 48–72 h" },
    ],
    stopWhen: [
      "Clinical improvement + afebrile",
      "Pelvic exam improving",
      "TOA drained or resolving on imaging",
      "Partner notified + treated",
      "Minimum 14 d completed",
    ],
    extendIf: [
      { text: "**TOA** > 8 cm or non-response — drainage + extend",
        matchCtx: { severe: true } },
      "Pregnancy — extend per OB-GYN",
      "Recurrence — re-treatment + partner workup",
      "Inadequate clinical response — re-image + escalate",
    ],
  },
  monitoring: {
    headline: "CDC 2021 regimen; partner notification + treatment; HIV + STI screen; TOA needs drainage if large.",
    items: [
      { sev: "required", what: "**Partner notification + treatment** — gonorrhea + chlamydia",
        why: "Re-infection common; expedited partner therapy (EPT) where legally permitted" },
      { sev: "required", what: "**HIV + syphilis + hepatitis screen**",
        why: "Co-infection common; STI screen mandatory at PID diagnosis" },
      { sev: "required", what: "**Pregnancy test** before treatment",
        why: "Affects drug choice (doxy + metro 1st trimester contraindicated)" },
      { sev: "trigger", what: "**Pelvic US or CT** for TOA workup",
        why: "Distinguishes uncomplicated PID from TOA; drives drainage decision" },
      { sev: "trigger", what: "**Hospitalize if pregnant / severe / failed outpatient / TOA / unable to tolerate PO**",
        why: "CDC inpatient criteria; reduces complications + ensures adherence" },
      { sev: "trigger", what: "**Drainage for TOA** > 8 cm or non-response by 72 h",
        why: "Source control accelerates resolution; IR or surgical" },
      { sev: "trigger", what: "**Counseling on long-term sequelae** — infertility, chronic pain, ectopic",
        why: "Patient education + planning; addresses recurrence prevention" },
      { sev: "consider", what: "**STI re-screen at 3 mo**",
        why: "Re-infection common; routine re-screening per CDC" },
    ],
  },
  rationale: {
    driver: "PID is a polymicrobial pelvic infection treated by triple coverage — Workowski (CDC MMWR 2021) + ACOG 2022 anchor ceftriaxone 500 mg IM × 1 + doxycycline 100 mg PO BID + metronidazole 500 mg PO BID × 14 d for outpatient management, covering N. gonorrhoeae, C. trachomatis, anaerobes, and enteric flora. Inpatient pathways (severe disease, pregnancy, failed outpatient, TOA) shift to IV cefoxitin or cefotetan + doxycycline with PO step-down once stable. Tubo-ovarian abscess > 8 cm or non-response by 72 h triggers drainage (Wiesenfeld AJOG 2017). Partner notification, expedited partner therapy where permitted, and HIV / syphilis / hepatitis co-screen run in parallel — long-term sequelae (infertility, ectopic, chronic pain) are reduced but not eliminated by adequate treatment (PEACH JAMA 2002).",
    guideline: "cdc_sti",
    rejected: "Dropping metronidazole from the outpatient regimen was deliberately rejected — anaerobic coverage is preserved in the CDC 2021 update because anaerobes contribute to upper-tract disease and chronic sequelae, and bacterial-vaginosis co-infection drives recurrence. Reflexive IUD removal at PID diagnosis was tempered: ACOG 2022 supports IUD retention if the patient is responding at 48–72 h, because removal does not change outcomes and complicates contraception management." },
  objections: [
    { q: "Why triple coverage — can't ceftriaxone + doxy cover most?",
      a: "PID is polymicrobial: N. gonorrhoeae, C. trachomatis, anaerobes, enteric flora, and bacterial-vaginosis pathogens converge in upper-tract disease — CDC MMWR 2021 [cite:cdc_sti] adds metronidazole because anaerobic coverage reduces TOA progression, chronic pelvic pain, and infertility per Wiesenfeld + ACOG 2022. Dropping metronidazole was actively rejected in the 2021 update — the BV substrate drives recurrence and the empiric triple is the audit-defensible standard." },
    { q: "Why not just azithromycin instead of doxycycline?",
      a: "Azithromycin was dropped from the STI backbone in CDC 2021 [cite:cdc_sti] because macrolide-resistant Mycoplasma genitalium and gonococcal macrolide resistance exceeded tolerable thresholds. Doxycycline 100 mg PO BID × 14 d achieves better intrapelvic concentration and covers M. genitalium reliably. Azithromycin retains a narrow role only in pregnancy and doxycycline allergy, and even then is paired with secondary coverage." },
    { q: "Why retain the IUD — usual teaching says remove?",
      a: "ACOG 2022 + CDC 2021 [cite:cdc_sti] now support IUD retention if the patient is responding at 48–72 h — removal does not change PID outcomes per Tepper (Obstet Gynecol 2013) and complicates contraception management with elevated unintended-pregnancy risk. Reserve removal for non-responders or worsening clinical course at the 72-h reassessment. Reflexive removal at PID diagnosis is no longer the standard." },
    { q: "Why drain TOA > 8 cm — antibiotics alone might work?",
      a: "Wiesenfeld AJOG 2017 [cite:cdc_sti] anchors drainage for TOA > 8 cm or non-response by 72 h — medical-only management has high failure rates with the rupture risk driving emergent laparotomy + sepsis. IR percutaneous drainage or surgical drainage yields culture data, accelerates resolution, and shortens total course. Smaller responding lesions accept medical-only management with serial imaging." },
  ],
  research: {
    headline: "CDC 2021 — CTX + doxy + metro × 14 d for outpatient; TOA needs IV + drainage if > 8 cm or non-response.",
    trials: [
      { name: "Ness CID 2002",
        n: "831",
        question: "Outpatient vs inpatient PID treatment",
        finding: "Outpatient non-inferior for mild-moderate; inpatient for severe + TOA + pregnancy + unable to tolerate PO + failed outpatient",
        bias: "Pre-modern CDC criteria; principle replicated" },
      { name: "PEACH JAMA 2002",
        n: "831",
        question: "Long-term reproductive outcomes after PID treatment",
        finding: "Treatment reduces but does not eliminate infertility + ectopic + chronic pain; partner notification critical for prevention",
        bias: "Same cohort as Ness; outcomes over 7-yr follow-up" },
      { name: "Wiesenfeld AJOG 2017",
        n: "Cohort",
        question: "TOA drainage thresholds",
        finding: "Drainage for TOA > 8 cm or non-response by 72 h; medical management adequate for smaller responding lesions",
        bias: "Observational; imaging-based thresholds" },
    ],
    guidelines: [
      { society: "CDC",
        year: 2021,
        topic: "STI treatment including PID (Workowski)",
        keypoint: "Ceftriaxone 500 mg IM × 1 + doxy 100 mg PO BID + metronidazole 500 mg PO BID × 14 d outpatient" },
      { society: "ACOG",
        year: 2022,
        topic: "Pelvic inflammatory disease",
        keypoint: "Aligned with CDC; partner notification + HIV/STI co-screen + IUD retention if responding" },
    ],
    openQuestions: [
      "IUD removal vs retention in PID — no clear benefit if responding",
      "Routine partner notification adherence — expedited partner therapy (EPT) where permitted",
      "Optimal TOA drainage timing — > 8 cm or non-response by 72 h most agreed",
    ],
  },
};

export default { id: "pid", regimen, decision };
