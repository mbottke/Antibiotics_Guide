/* ===========================================================
   NEUROBORRELIOSIS / NEUROSYPHILIS — CNS spirochete; CSF
   confirmation + parenteral therapy; long courses + serial
   follow-up. ================================================== */

const regimen = {
  "Neuroborreliosis (Lyme)": [
    {
      rx: /ceftriaxone|doxycycline/i,
      pickIf: "Confirmed neuroborreliosis (CSF + serology criteria met).",
      whyPick: [
        "**Ceftriaxone 2 g IV q24h × 14–28 d** — CNS Lyme",
        "**Oral doxycycline** non-inferior in selected European data for facial palsy / radiculitis",
        "Persistent fatigue post-treatment ≠ active infection — don't re-treat",
      ],
      watchOut: [
        { sev: "warn", text: "**Jarisch-Herxheimer** reaction within hours of first dose" },
        { sev: "stop", text: "**\"Chronic Lyme\"** — no evidence base for prolonged courses" },
      ],
    },
  ],
  "Neurosyphilis": [
    {
      rx: /penicillin/i,
      pickIf: "Neurosyphilis (CSF VDRL+, or syphilis + neurologic signs).",
      whyPick: [
        "**Aqueous penicillin G 18–24 MU/day IV × 10–14 d** — IDSA + CDC standard",
        "**Procaine penicillin IM + probenecid PO** acceptable alternative",
        "Desensitize PCN-allergic — no alternative is equally effective",
        "**Repeat CSF VDRL** at 6 months for treatment response",
      ],
      watchOut: [
        { sev: "warn", text: "**Jarisch-Herxheimer** — fever, hypotension within 24 h" },
        { sev: "warn", text: "Workup HIV always — co-infection common" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Neuro-Lyme: ceftriaxone or doxy 14–28 d; neurosyphilis: PCN G 10–14 d; CSF + serology drive diagnosis.",
    evidence: "IDSA 2020 Lyme + CDC STI 2021 — parenteral for CNS disease in both; doxycycline non-inferior in Lyme (Halperin); serial CSF VDRL for syphilis",
    branches: [
      { label: "Neuroborreliosis (meningitis / radiculitis / facial palsy)", days: "14–21 d",
        detail: "Ceftriaxone 2 g IV q24h × 14–21 d or doxycycline 200 mg PO BID × 14–21 d (IDSA 2020)",
        matchAgent: /doxycycline/i },
      { label: "Lyme encephalopathy / late neuroborreliosis", days: "28 d",
        detail: "Ceftriaxone × 28 d; ID-driven extended course for late / persistent symptoms" },
      { label: "Neurosyphilis (any stage)", days: "10–14 d IV PCN",
        detail: "Aqueous PCN G 18–24 MU/d × 10–14 d (3–4 MU IV q4h or continuous infusion)",
        matchAgent: /penicillin/i },
      { label: "Ocular / otosyphilis", days: "10–14 d IV PCN",
        detail: "Same as neurosyphilis — treat as CNS disease; ophtho + ENT coordination" },
      { label: "PCN allergy + neurosyphilis", days: "10–14 d (desensitize)",
        detail: "Desensitization preferred; ceftriaxone 2 g IV q24h × 10–14 d as alternative",
        matchAgent: /ceftriaxone/i },
    ],
    stopWhen: [
      "CSF profile normalizing (cell count, protein)",
      "Clinical recovery — neurologic exam stable / improving",
      "Serologic response — RPR titer ≥ 4-fold decline (syphilis)",
      "Treponemal CSF VDRL trending (if positive initially)",
      "Pathogen-specific minimum duration met",
    ],
    extendIf: [
      { text: "**Persistent CSF abnormalities** at 6 mo — re-treat",
        matchCtx: { severe: true } },
      "HIV co-infection — extend follow-up + monitor RPR closely",
      "Late or persistent symptoms — extended course per ID",
      "Inadequate serologic response — repeat treatment",
    ],
  },
  monitoring: {
    headline: "LP for CSF analysis + VDRL / Lyme PCR; HIV + STI co-screen; serial RPR + CSF; partner notification.",
    items: [
      { sev: "required", what: "**LP at presentation** — CSF cell count, protein, VDRL, Lyme PCR / index",
        why: "CNS confirmation drives treatment intensity + duration + monitoring" },
      { sev: "required", what: "**HIV + STI co-screen**",
        why: "Co-infection common — drives extended monitoring + alters management" },
      { sev: "required", what: "**Serum RPR + treponemal** + Lyme serology (paired acute/convalescent)",
        why: "Establishes baseline for response monitoring; RPR ≥ 4× decline = treatment success" },
      { sev: "trigger", what: "**Partner notification** for syphilis",
        why: "Public health reporting + contact tracing + EPT where permitted" },
      { sev: "trigger", what: "**Repeat LP at 6 mo** if neurosyphilis or HIV+",
        why: "Sterilization confirmation; persistent CSF abnormalities → re-treatment" },
      { sev: "trigger", what: "**Jarisch-Herxheimer prophylaxis counseling** — fever / rigors after first dose",
        why: "Common in syphilis treatment; supportive measures; not a drug allergy" },
      { sev: "trigger", what: "**Avoid steroids in Lyme** — no benefit + may prolong",
        why: "Steroids not standard; ID-driven only if specific indication" },
      { sev: "consider", what: "**PCN desensitization** for severe PCN allergy + neurosyphilis",
        why: "PCN preferred; desensitization standard in pregnancy + neurosyphilis" },
      { sev: "consider", what: "**Lyme post-treatment symptoms counseling**",
        why: "PTLDS common after treatment; not chronic infection; no benefit from extended antibiotics" },
    ],
  },
  rationale: {
    driver: "Neuro-Lyme and neurosyphilis are CNS spirochete diseases with serology + CSF-confirmed pathways. For neuroborreliosis, IDSA 2020 (Lantos) anchors ceftriaxone 2 g IV q24h × 14–21 d OR oral doxycycline 200 mg PO BID — Halperin (Neurology 2010) confirms doxy non-inferior, simplifying outpatient transitions. For neurosyphilis, CDC 2021 (Workowski) anchors aqueous PCN G 18–24 MU/d × 10–14 d as first-line, with desensitization preferred over ceftriaxone alternative when PCN-allergic; HIV + STI co-screening is mandatory. Repeat LP at 6 mo verifies CSF response (cell count + protein normalizing, RPR ≥ 4× decline); partner notification + Jarisch-Herxheimer counseling are part of the bundle.",
    guideline: "cdc_sti",
    rejected: "Extended courses of antibiotics for post-treatment Lyme disease syndrome (PTLDS) were deliberately rejected — Halperin + IDSA 2020 are emphatic that PTLDS is not chronic infection, and Klempner (NEJM 2001) plus subsequent RCTs show no benefit from prolonged antibiotics with measurable harms (line infections, C. difficile). Single-dose benzathine PCN for neurosyphilis was rejected: CSF penetration is inadequate, and Workowski + Marra (CID 2008) anchor aqueous PCN G IV. Skipping HIV co-screen in any syphilis presentation was rejected — co-infection drives extended monitoring and reactive treatment changes." },
  objections: [
    { q: "Why desensitize PCN-allergic patients — ceftriaxone is alternative?",
      a: "CDC 2021 (Workowski) and IDSA mandate PCN desensitization for neurosyphilis in PCN-allergic patients because aqueous PCN G 18–24 MU/d × 10–14 d has no equivalent CSF-active alternative with proven outcome data [cite:cdc_sti]. Ceftriaxone 2 g IV q24h is listed as alternative but Marra CID 2008 anchors PCN G as first-line; in pregnancy and HIV co-infection, desensitization is non-negotiable because failure costs vertical transmission or accelerated CNS progression." },
    { q: "Why not benzathine PCN for neurosyphilis — works for primary?",
      a: "Single-dose benzathine penicillin achieves inadequate CSF penetration and Workowski CDC MMWR 2021 plus Marra CID 2008 explicitly anchor aqueous PCN G 18–24 MU/d IV × 10–14 d (3–4 MU IV q4h or continuous infusion) as the only regimen with proven CNS sterilization [cite:cdc_sti]. Benzathine is reserved for primary, secondary, and early latent disease without CNS involvement — using it for neurosyphilis is a documented treatment failure pathway." },
    { q: "Why no extended antibiotics for PTLDS — patient still has symptoms?",
      a: "Halperin Neurology 2010 and IDSA 2020 (Lantos) are emphatic that post-treatment Lyme disease syndrome is NOT chronic infection — Klempner NEJM 2001 plus subsequent RCTs show zero benefit from prolonged antibiotic courses, with measurable harms including line-associated bacteremia and C. difficile [cite:cdc_sti]. Symptoms post-treatment require supportive management and functional rehabilitation, not antibiotic re-exposure. Doxycycline 14–21 d completes adequate therapy for neuroborreliosis." },
    { q: "Why mandatory HIV co-screen with every syphilis case?",
      a: "HIV co-infection drives extended monitoring and reactive treatment changes — CDC 2021 anchors HIV testing in every syphilis presentation because co-infection accelerates CNS progression, alters serologic response thresholds (RPR ≥ 4× decline), and mandates repeat LP at 6 mo to confirm sterilization [cite:cdc_sti]. Missing HIV in a syphilis presentation costs the patient both diseases — the screen is universal, not risk-stratified." },
  ],
  research: {
    headline: "IDSA 2020 Lyme + CDC STI 2021; doxy non-inferior to ceftriaxone in neuroborreliosis; PCN desensitization preferred for neurosyphilis.",
    trials: [
      { name: "Halperin Neurology 2010 (Lyme)",
        n: "Cohort review",
        question: "Modern neuroborreliosis treatment",
        finding: "Ceftriaxone or doxycycline 14–21 d both effective; PTLDS not chronic infection — no extended antibiotic benefit",
        bias: "Pre-IDSA-2020 but principles align" },
      { name: "Marra CID 2008 (neurosyphilis)",
        n: "Cohort",
        question: "PCN-G or ceftriaxone for neurosyphilis",
        finding: "PCN G aqueous 18–24 MU/d × 10–14 d; ceftriaxone alternative; serial CSF VDRL + RPR for response",
        bias: "Mostly HIV+ cohort; signal generalizes" },
      { name: "Workowski CDC MMWR 2021",
        n: "Guideline",
        question: "Modern STI + neurosyphilis treatment",
        finding: "PCN G first-line; ceftriaxone alternative; serial CSF/RPR follow-up at 6 mo; HIV co-screen mandatory",
        bias: "CDC consensus" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2020,
        topic: "Lyme disease (Lantos update)",
        keypoint: "Doxycycline non-inferior to ceftriaxone; 14–21 d standard; PTLDS counseling — no chronic antibiotic" },
      { society: "CDC",
        year: 2021,
        topic: "Neurosyphilis treatment (Workowski)",
        keypoint: "PCN G aqueous 18–24 MU/d × 10–14 d; desensitization for severe PCN allergy; serial CSF" },
    ],
    openQuestions: [
      "PTLDS treatment — no benefit from extended antibiotic; supportive only",
      "HIV+ neurosyphilis duration — repeat LP at 6 mo standard",
      "Optimal CSF endpoint — VDRL negativity vs cell count normalization",
    ],
  },
};

export default { id: "neuro-lyme-syphilis", regimen, decision };
