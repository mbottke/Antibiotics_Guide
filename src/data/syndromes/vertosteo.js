/* ===========================================================
   VERTEBRAL OSTEOMYELITIS — IDSA 2015 (Berbari). 6 weeks IV;
   neurologic deficit changes everything. =========================== */

const regimen = {
  "Stable — culture first": [
    {
      rx: /blood\s+cultures|biopsy|culture\s+first/i,
      pickIf: "Stable vertebral osteomyelitis without neurologic deficit — culture-first approach.",
      whyPick: [
        "**Blood cultures + image-guided biopsy BEFORE antibiotics** — IDSA 2015",
        "Antibiotic yield drops dramatically with prior empiric abx",
        "Common pathogens: S. aureus (50%), GNR, streptococci, less commonly Brucella / TB / fungal",
        "**6 weeks IV** once pathogen identified",
      ],
      watchOut: [
        { sev: "warn", text: "**Neurologic deficit** changes plan — empiric coverage + emergent MRI + spine surgery" },
        { sev: "warn", text: "TB and brucella missed if not cultured/serology — long course needed" },
      ],
    },
  ],
  "MSSA / MRSA (most common)": [
    {
      rx: /MSSA|MRSA|cefazolin|nafcillin|vancomycin|daptomycin/i,
      pickIf: "S. aureus vertebral osteomyelitis confirmed by biopsy or blood culture.",
      whyPick: [
        "**MSSA: cefazolin or nafcillin × 6 weeks**",
        "**MRSA: vancomycin (AUC-guided) or daptomycin 8–10 mg/kg × 6 weeks**",
        "**Oral step-down possible** after 2 wk (OVIVA-style) if stable + susceptible",
        "**Rifampin combination** if hardware involved",
      ],
      watchOut: [
        { sev: "warn", text: "**Re-image at 4–6 wk** — radiologic improvement lags clinical" },
        { sev: "note", text: "ESR / CRP trend more useful than imaging for treatment response" },
      ],
    },
  ],
  "Gram-negative / Pseudomonas": [
    {
      rx: /ceftriaxone|cefepime|ciprofloxacin/i,
      pickIf: "GNR or Pseudomonas vertebral osteomyelitis (UTI source common).",
      whyPick: [
        "**Ceftriaxone** for susceptible E. coli / Klebsiella",
        "**Cefepime or cipro** for Pseudomonas",
        "**Cipro** oral step-down advantage — best bone penetration in the class",
      ],
      watchOut: [
        { sev: "warn", text: "**Workup the source** — UTI / endocarditis / endovascular origin; vertebral GNR rarely arises de novo" },
        { sev: "warn", text: "**FQ tendinopathy + QT** — long courses (6 wk) amplify risk; counsel + alternative if elderly + risk factors" },
        { sev: "note", text: "Re-image at 4–6 wk; CRP trend at week 2 is the early signal of response" },
      ],
    },
  ],
  "Septic / neurologic deficit": [
    {
      rx: /vancomycin.*cefepime|MRI|spine\s+surgery/i,
      pickIf: "Vertebral osteomyelitis with epidural abscess or neurologic deficit.",
      whyPick: [
        "**Vancomycin + cefepime NOW** — don't wait for culture in deficit",
        "**Emergent MRI** to define epidural abscess",
        "**Spine surgery** for cord compression or drainable abscess",
        "Neurologic deficit progression = surgical emergency",
      ],
      watchOut: [
        { sev: "stop", text: "**Delay in cord-compression = permanent deficit** — surgery within hours; antibiotics in parallel, not first" },
        { sev: "warn", text: "**Continuous neuro checks** while imaging + surgical workup ongoing — small deficits can become irreversible in hours" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "6 wk IV minimum; emergent surgery + extend if cord compression or epidural abscess.",
    evidence: "IDSA 2015 — biopsy-first + 6 wk targeted IV; OVIVA-style step-down in selected",
    branches: [
      { label: "S. aureus, no deficit", days: "6 wk",
        detail: "Cefazolin / nafcillin (MSSA) or vancomycin (MRSA) × 6 wk; oral step-down via OVIVA" },
      { label: "Gram-negative / Pseudomonas", days: "6 wk",
        detail: "Ceftriaxone, cefepime, or ciprofloxacin per susceptibilities + bone penetration" },
      { label: "TB / brucella / fungal", days: "9–12 mo+",
        detail: "Long-course per specific pathogen; ID + culture-driven; multidrug regimens" },
      { label: "Epidural abscess + neuro deficit", days: "≥ 6 wk + surgery",
        detail: "Emergent MRI + decompression + targeted therapy" },
    ],
    stopWhen: [
      "Pain resolved, function returning",
      "ESR + CRP normalizing",
      "Imaging stable or improving",
      "No new neurologic deficit",
      "Minimum 6 wk targeted IV (or appropriate step-down) completed",
    ],
    extendIf: [
      { text: "**Epidural abscess or cord compression** — emergent surgery + extend",
        matchCtx: { severe: true } },
      "TB / brucella / fungal — extend per pathogen-specific guideline",
      "Bacteremia + osteo together — extend per longest applicable duration",
      "Immunocompromised host — extend per response",
      "Inadequate source control on imaging at 4–6 wk",
    ],
  },
  monitoring: {
    headline: "MRI before biopsy; biopsy yield-first; ESR/CRP weekly; daily neuro exam if deficit at risk.",
    items: [
      { sev: "required", what: "**MRI spine** at presentation — defines abscess, cord involvement, extent",
        why: "Drives surgical decision + biopsy targeting" },
      { sev: "required", what: "**Image-guided bone biopsy** when stable, BEFORE empiric antibiotics",
        why: "Empiric therapy halves yield; biopsy enables targeted long-course" },
      { sev: "required", what: "**Daily neuro exam** if epidural abscess or cord-compromise risk",
        why: "Progression of deficit triggers emergent surgical decompression",
        matchCtx: { severe: true } },
      { sev: "required", what: "**Weekly ESR + CRP** during course",
        why: "Inflammatory marker decline drives confidence in completing course at 6 wk" },
      { sev: "trigger", what: "**Spine surgery consult** for instability, deficit, or non-response",
        why: "Surgical fusion / decompression for selected cases",
        matchCtx: { severe: true } },
      { sev: "trigger", what: "**TB / brucella / fungal workup** if epidemiologic risk",
        why: "Pyogenic-mimicking organisms need different regimen + duration" },
      { sev: "consider", what: "Oral step-down at 2 wk per OVIVA in compliant patients",
        why: "Non-inferior in selected; reduces line burden" },
    ],
  },
  rationale: {
    driver: "Vertebral osteomyelitis treatment hinges on MRI + image-guided biopsy BEFORE empirics — Bernard (Lancet 2015, n=351) established 6 wk non-inferior to 12 wk in pyogenic vertebral osteomyelitis provided the organism is identified. Targeted therapy: MSSA → cefazolin or nafcillin; MRSA → vancomycin; GNR → ceftriaxone or cefepime; TB/brucella/fungal carry distinct long courses (9–12 mo+). Epidural abscess or new neurologic deficit is a surgical emergency — emergent MRI followed by spinal decompression. Oral step-down via OVIVA criteria is appropriate in selected compliant hosts with a highly bioavailable agent and reliable follow-up.",
    guideline: "vosteo",
    rejected: "Reflexive 12-wk courses were deliberately rejected — Bernard established 6 wk non-inferior in pyogenic vertebral osteo with documented organism + clinical response, displacing the legacy long course that drove no efficacy benefit. Empiric antibiotics before biopsy in stable patients were tempered: empiric therapy halves culture yield, condemning the patient to a 6-wk broad-spectrum course rather than a targeted regimen — biopsy first, when neurologic and hemodynamic stability permit, drives stewardship + outcome." },
  objections: [
    { q: "Why 6 wk — legacy was 12 wk?",
      a: "Bernard (Lancet 2015, n=351) [cite:vosteo] established 6 wk non-inferior to 12 wk for pyogenic vertebral osteomyelitis provided the organism is identified and the patient has clinical response — same treatment failure, mortality, and functional recovery. IDSA 2015 endorses 6 wk as standard; Park 2019 meta confirms across subgroups. The 12-wk legacy was empiric tradition without supporting outcome data. Extension applies only for inadequate response, immunocompromise, retained material, or fungal / TB / brucella substrate." },
    { q: "Why biopsy before empirics — antibiotic delay seems dangerous?",
      a: "IDSA 2015 (Berbari) [cite:vosteo] mandates image-guided bone biopsy BEFORE empirics in hemodynamically + neurologically stable patients — empiric therapy halves culture yield, condemning the patient to a 6-wk broad-spectrum course rather than targeted regimen matched to organism. The 24–48 h biopsy delay is acceptable in stable disease. Exception: epidural abscess + neurologic deficit, or sepsis at presentation — empiric-first applies, biopsy at decompression." },
    { q: "Why emergent surgery for epidural abscess — antibiotic trial first?",
      a: "Spinal epidural abscess (Darouiche NEJM 2006) [cite:darouicheea] with new or progressing neurologic deficit is a surgical emergency — emergent MRI followed by neurosurgical decompression within hours, not days. Delay-to-decompression is the strongest predictor of permanent deficit. Antibiotic-only trial is reserved for stable patients without deficit, with close neuro monitoring; any progression triggers surgery. Cord compression doesn't reverse on antibiotics alone." },
    { q: "Why oral step-down — vertebral disease seems higher-stakes?",
      a: "OVIVA (NEJM 2019, n=1,054) [cite:oviva] included vertebral osteomyelitis subset and established oral non-inferior to IV at 1-y treatment failure with substantial line-complication reduction. Select for: compliant patient, identified organism, highly bioavailable oral target (FQ, TMP-SMX, linezolid for MRSA), ESR + CRP trending normal, and reliable ID follow-up. BSAC 2024 endorses early oral switch. Reserve continued IV for unstable disease, no bioavailable agent, or deficit-evolution risk." },
  ],
  research: {
    headline: "OVIVA established oral non-inferiority at 6 wk; debridement + biopsy-driven pathogen direct outcomes.",
    trials: [
      { name: "OVIVA NEJM 2019 (Li)",
        n: "1,054",
        question: "Oral vs IV antibiotic for bone + joint infection",
        finding: "Oral non-inferior at 1-y treatment failure; ~75% reduction in IV-line complications; supports early oral switch",
        bias: "Required highly bioavailable oral options; excluded MRSA-only regimens" },
      { name: "Berbari CID 2015",
        n: "Cohort",
        question: "Native vertebral osteomyelitis duration",
        finding: "6-week IDSA-recommended course; longer course in immunocompromised + retained material",
        bias: "Observational; informs IDSA 2015 guidance" },
      { name: "Park PLoS One 2019",
        n: "Meta",
        question: "Short-course (≤ 4 wk) vs long-course (≥ 6 wk) for vertebral osteo",
        finding: "Short course non-inferior in selected; biopsy-positive pathogen + clinical response drove decision",
        bias: "Heterogeneous severity; under-powered for subgroups" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2015,
        topic: "Vertebral osteomyelitis (Berbari)",
        keypoint: "6-week course; biopsy-driven pathogen direction; oral step-down per OVIVA in selected" },
      { society: "BSAC",
        year: 2024,
        topic: "British osteomyelitis guidance",
        keypoint: "Aligned with IDSA + OVIVA-supportive early oral switch" },
    ],
    openQuestions: [
      "Optimal post-debridement antibiotic duration in chronic osteo — 6 wk standard, longer in immunocompromised",
      "Role of suppressive antibiotics in retained hardware osteo — case-by-case",
      "Rifampin combination — required for staph + retained hardware; harmful + unnecessary otherwise",
    ],
  },
};

export default { id: "vertosteo", regimen, decision };
