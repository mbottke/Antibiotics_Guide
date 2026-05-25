/* ===========================================================
   EPIDIDYMO-ORCHITIS — CDC 2021 STI + UTI guidelines. ============ */

const regimen = {
  "Sexually active (<35 y or at risk)": [
    {
      rx: /ceftriaxone.*doxycycline/i,
      pickIf: "Sexually active, age < 35 or STI risk factors.",
      whyPick: [
        "**Ceftriaxone IM ×1 + doxycycline 10 d** — covers GC + chlamydia",
        "**Treat partner** — STI screening / treatment is essential",
        "Add **metronidazole** if insertive anal intercourse (enteric organisms possible)",
      ],
      watchOut: [
        { sev: "warn", text: "**Test for HIV + syphilis + GC/CT NAAT** at same visit" },
        { sev: "note", text: "Scrotal pain + age < 35 — always assume STI until proven otherwise" },
      ],
    },
  ],
  "Enteric organisms (older men, insertive anal intercourse, instrumentation)": [
    {
      rx: /fluoroquinolone|levofloxacin/i,
      pickIf: "Older man, anal intercourse, or recent instrumentation.",
      whyPick: [
        "**Levofloxacin 500 mg PO daily × 10–14 d** — covers enteric GNR + atypicals",
        "Tissue penetration into epididymis good",
        "**Workup BPH / urinary retention** if recurrent",
      ],
      watchOut: [
        { sev: "warn", text: "FQ tendinopathy / QT — counsel elderly" },
        { sev: "note", text: "Rule out testicular torsion in acute presentation — ultrasound" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "10 d ceftriaxone+doxy for STI etiology; 10–14 d FQ for enteric pathogens.",
    evidence: "CDC 2021 STI + AUA — pathogen-driven; rule out testicular torsion in acute presentation",
    branches: [
      { label: "STI etiology (GC/Chlamydia, age < 35)", days: "10 d",
        detail: "Ceftriaxone IM single dose + doxycycline 100 mg PO BID × 10 d; treat partner",
        matchAgent: /doxycycline/i },
      { label: "Enteric etiology (age ≥ 35, insertive anal sex, instrumentation)", days: "10–14 d",
        detail: "FQ (levofloxacin / ciprofloxacin) × 10–14 d; rule out underlying GU pathology",
        matchAgent: /levofloxacin|ciprofloxacin/i },
      { label: "Mixed / unclear etiology", days: "10–14 d",
        detail: "Cover both STI + enteric: ceftriaxone + doxy + FQ; reassess on cultures" },
    ],
    stopWhen: [
      "Scrotal pain + swelling resolving",
      "Afebrile ≥ 24 h",
      "Cultures cleared (urine, urethral if applicable)",
      "Partner treated (if STI etiology)",
      "Minimum 10 d (STI) / 10–14 d (enteric) completed",
    ],
    extendIf: [
      "Abscess identified — drainage + extension",
      { text: "**Necrosis or Fournier's progression** — surgical emergency",
        matchCtx: { severe: true } },
      "Underlying GU pathology — extend per workup",
      "Failed first-line — switch agent + extend",
    ],
  },
  monitoring: {
    headline: "Rule out testicular torsion first; treat partner for STI; workup GU pathology for enteric.",
    items: [
      { sev: "required", what: "**Rule out testicular torsion** — ultrasound with Doppler if acute presentation",
        why: "Torsion is surgical emergency; missing it costs the testicle" },
      { sev: "required", what: "**Treat sexual partner(s)** for STI etiology + 7-day abstinence",
        why: "Standard CDC public-health protocol; reduces reinfection + spread" },
      { sev: "required", what: "**Test for HIV, syphilis, hepatitis B/C** at presentation",
        why: "Co-infection screening; sexual-health visit opportunity" },
      { sev: "trigger", what: "**Urology workup** for enteric etiology — BPH, urethral stricture, neurogenic bladder",
        why: "Predisposing factors drive recurrence; address underlying" },
      { sev: "trigger", what: "**Scrotal ultrasound** if abscess suspected or no response by 72 h",
        why: "Drainage targets + rules out testicular involvement / necrosis" },
      { sev: "consider", what: "**Scrotal elevation + NSAIDs** for symptom management",
        why: "Reduces edema + pain; adjunctive to antibiotics" },
    ],
  },
  rationale: {
    driver: "Epididymo-orchitis etiology is age- and exposure-stratified — Workowski (CDC MMWR 2021) anchors ceftriaxone 500 mg IM × 1 + doxycycline 100 mg PO BID × 10 d for the STI-driven substrate (age < 35, sexually active), targeting N. gonorrhoeae + C. trachomatis with partner notification and HIV/STI screen built in. The enteric substrate (age ≥ 35, insertive anal sex, instrumentation, BPH) drives toward fluoroquinolone × 10–14 d with urology workup for predisposing pathology. Testicular torsion is a surgical emergency that must be excluded by Doppler ultrasound before committing to an antibiotic narrative — missing torsion costs the testicle.",
    guideline: "cdc_sti",
    rejected: "Single-agent fluoroquinolone for the under-35 sexually-active patient was deliberately rejected — Workowski + CDC anchor ceftriaxone + doxycycline because rising FQ-resistant gonococci make FQ monotherapy inadequate, and concurrent chlamydial coverage is mandatory. Skipping torsion workup before antibiotics was rejected — Doppler ultrasound for acute scrotal pain is non-negotiable because torsion presents identically and missed diagnosis is uniformly limb-loss (testicular)." },
  objections: [
    { q: "Why not single-agent FQ for under-35 sexually-active?",
      a: "FQ-resistant N. gonorrhoeae is now > 25% in many US regions per CDC MMWR 2021 [cite:cdc_sti], and FQ has no chlamydial activity — so single-agent FQ misses both pathogens in the under-35 STI substrate. Workowski anchors ceftriaxone 500 mg IM × 1 + doxycycline 100 mg PO BID × 10 d as the only adequate STI regimen, with partner notification + HIV / syphilis / hepatitis co-screen [cite:cdc_sti]." },
    { q: "Why Doppler before antibiotics — pain looks like infection?",
      a: "Testicular torsion presents identically to epididymo-orchitis (acute unilateral scrotal pain ± swelling) and the 6-h ischemic window is non-recoverable — Doppler ultrasound is mandatory before committing to an antibiotic narrative [cite:cdc_sti]. Missed torsion = testicular loss. Urology consult at presentation in any acute scrotal pain, especially adolescents and young men; antibiotics never substitute for the imaging gate." },
    { q: "Why doxycycline + ceftriaxone instead of azithromycin?",
      a: "CDC 2021 [cite:cdc_sti] dropped azithromycin from the STI backbone because macrolide-resistant Mycoplasma genitalium and gonococcal macrolide resistance climbed past tolerable thresholds. Doxycycline 100 mg PO BID × 10 d is now the chlamydial / M. genitalium standard, paired with ceftriaxone 500 mg IM × 1 for gonorrhea. Azithromycin retains a narrow role in doxy-allergic or pregnant patients only." },
  ],
  research: {
    headline: "Etiology by age — STI (< 35 yr) vs enteric GNR (≥ 35 yr); CDC 2021 STI guidance + EAU urology align.",
    trials: [
      { name: "Workowski CDC MMWR 2021",
        n: "Guideline",
        question: "STI treatment + epididymo-orchitis empiric",
        finding: "< 35 yr or sexually active: ceftriaxone 500 mg IM + doxy 100 mg PO BID × 10 d; ≥ 35 yr or enteric risk: FQ or TMP-SMX × 10–14 d",
        bias: "CDC consensus" },
      { name: "Tracy Urol Clin North Am 2008",
        n: "Cohort",
        question: "Epididymo-orchitis outcomes by etiology",
        finding: "STI etiology + younger age improves outcomes; enteric GNR + older age has higher complication rate including abscess",
        bias: "Single-center observational" },
    ],
    guidelines: [
      { society: "CDC",
        year: 2021,
        topic: "STI treatment (Workowski)",
        keypoint: "Ceftriaxone + doxy for STI etiology; FQ or TMP-SMX for enteric; partner notification + HIV/STI screen" },
    ],
    openQuestions: [
      "Optimal duration for enteric etiology — 10–14 d standard",
      "Routine scrotal US — only if abscess / torsion suspected or non-response",
      "Sexual partner notification — EPT where legally permitted",
    ],
  },
};

export default { id: "epididymo", regimen, decision };
