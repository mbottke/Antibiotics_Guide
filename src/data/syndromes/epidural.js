/* ===========================================================
   EPIDURAL ABSCESS — emergent surgical decompression for deficit. = */

const regimen = {
  "Empiric": [
    {
      rx: /vancomycin.*cefepime|vancomycin.*ceftriaxone/i,
      pickIf: "Spinal epidural abscess — back pain + fever + neurologic deficit.",
      whyPick: [
        "**Vancomycin + cefepime / ceftriaxone** — S. aureus dominant",
        "**Emergent whole-spine MRI** — skip lesions in 15–30%, missing them changes management",
        "**Surgical decompression** for deficit or non-improvement at 24–48 h",
        "**6 weeks IV** typical; longer if vertebral osteomyelitis underlies",
      ],
      watchOut: [
        { sev: "stop", text: "**Neurologic deficit = surgical emergency** — delay risks permanent paraplegia; OR within hours, not days" },
        { sev: "warn", text: "**Skip lesions** common — image the entire spine, not just symptomatic level" },
        { sev: "note", text: "Repeat blood cultures at 48 h; persistent bacteremia → endocarditis workup + extend course" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "6 wk IV minimum; emergent surgery for deficit; pathogen-directed long course.",
    evidence: "Society consensus — surgical decompression + 6 wk IV; longer if vertebral osteo involved",
    branches: [
      { label: "S. aureus, drained + targeted", days: "6 wk",
        detail: "MSSA: cefazolin/nafcillin; MRSA: vancomycin or daptomycin; from drainage" },
      { label: "GNR (rare)", days: "6 wk",
        detail: "Ceftriaxone / cefepime per susceptibilities" },
      { label: "Concurrent vertebral osteomyelitis", days: "6–8 wk + surgery",
        detail: "Combined epidural + osteo treatment; longer per response" },
    ],
    stopWhen: [
      "Imaging shows abscess resolution",
      "Neurologic exam stable or improving",
      "Inflammatory markers normalizing",
      "Cultures cleared",
      "Minimum 6 wk completed",
    ],
    extendIf: [
      { text: "**Concurrent vertebral osteomyelitis** — extend to longest applicable duration",
        matchCtx: { severe: true } },
      "Persistent / recurrent abscess on serial MRI",
      "Incomplete surgical drainage — re-explore",
      "Immunocompromised host — extend per response",
    ],
  },
  monitoring: {
    headline: "Emergent surgical decompression for deficit; whole-spine MRI for skip lesions; long IV course.",
    items: [
      { sev: "required", what: "**Emergent surgical decompression** for neurologic deficit",
        why: "Time to decompression is the inflection point; minutes-to-hours determine outcome",
        matchCtx: { severe: true } },
      { sev: "required", what: "**Whole-spine MRI** at presentation — skip lesions in 15–30%",
        why: "Missing skip lesions causes treatment failure + late deficit" },
      { sev: "required", what: "**Daily neuro exam** — sensory level, motor strength, sphincter function",
        why: "Progressing deficit drives emergent re-imaging + surgical re-look" },
      { sev: "required", what: "**Repeat blood cultures at 48 h** — confirm clearance",
        why: "Persistent bacteremia triggers endocarditis + endovascular workup" },
      { sev: "trigger", what: "**ESR + CRP weekly** during course",
        why: "Decline confirms response; rising values trigger re-imaging" },
      { sev: "consider", what: "Steroids — controversial; reserve for cord edema with deficit",
        why: "Anti-inflammatory benefit unproven; case-by-case neurosurgery decision" },
    ],
  },
  rationale: {
    driver: "Spinal epidural abscess is a time-critical neurosurgical problem — Patel (J Neurosurg Spine 2014) shows time-to-decompression and pre-op deficit duration are the dominant outcome predictors, with delay > 24 h after deficit driving permanent loss. Darouiche (NEJM 2006) anchors emergent surgical decompression for any progressing or established neurologic deficit, with medical-only management reserved for stable, deficit-free patients under close MRI + neuro-exam surveillance. Whole-spine MRI is mandatory at presentation — Reihsaus (Neurosurg Rev 2000) documents skip lesions in 15–30%, and missing them is the dominant late-deficit failure. Empiric coverage targets S. aureus (~60% of cases): vancomycin + ceftriaxone or cefepime; pathogen-directed 6 wk IV minimum, extending to 6–8 wk if concurrent vertebral osteomyelitis.",
    guideline: "darouicheea",
    rejected: "Medical-only management of an epidural abscess with neurologic deficit was deliberately rejected — Darouiche + Patel both show that delay past the deficit window drives permanent loss, and conservative therapy is reserved for the deficit-free, stable patient under close MRI surveillance. Partial-spine MRI to localize the lesion was tempered: Reihsaus + IDSA Berbari 2015 anchor whole-spine MRI because skip lesions in 15–30% are missed otherwise, and the missed lesion is the dominant cause of late deficit. Empiric coverage without vancomycin was rejected because S. aureus dominates and MRSA cover is the default until species + susceptibility return." },
  objections: [
    { q: "Why emergent decompression — can't we try antibiotics first?",
      a: "Patel (J Neurosurg Spine 2014) and Darouiche (NEJM 2006) both show time-to-decompression and pre-op deficit duration are the dominant outcome predictors, with delay > 24 h after deficit onset driving permanent neurologic loss [cite:darouicheea]. Antibiotic-only management is reserved for the deficit-free, stable patient under close MRI + q4h neuro surveillance. Once weakness or sphincter dysfunction appears, the window narrows to hours — surgery is the inflection point, not the antibiotic." },
    { q: "Why empiric vancomycin when MRSA is < 30% locally?",
      a: "S. aureus accounts for ~60% of spinal epidural abscess cases per Reihsaus (Neurosurg Rev 2000, n=915 meta), and MRSA prevalence even at modest community rates makes MSSA-only β-lactam empiric coverage a coin flip until culture data return [cite:darouicheea]. Missed MRSA in the 24–72 h before species ID drives extension and late deficit; vancomycin de-escalates trivially to cefazolin once MSSA is documented." },
    { q: "Why whole-spine MRI — symptom level localizes the lesion?",
      a: "Reihsaus + IDSA Berbari 2015 document skip lesions in 15–30% of spinal epidural abscess — non-contiguous secondary collections at remote vertebral levels that mimic primary lesions and drive late deficit when missed [cite:darouicheea]. The clinical symptom level reflects only the cord-compressing lesion, not the silent skip site that becomes the dominant focus after primary decompression. Whole-spine MRI is mandatory at presentation, not a luxury." },
    { q: "Why 6 wk IV minimum when OVIVA allows oral step-down?",
      a: "OVIVA validated oral step-down for bone + joint infection after initial IV control, but spinal epidural abscess with associated vertebral osteomyelitis (the majority) follows the longer 6–8 wk pathogen-directed band per IDSA Berbari 2015 [cite:darouicheea]. Early oral transition without confirmed clinical + radiographic + inflammatory-marker response risks recurrence at the surgical bed; 6 wk is the floor, and serial ESR / CRP plus MRI drive the extension decision." },
  ],
  research: {
    headline: "Emergent surgical decompression for neurologic deficit; 6 wk IV pathogen-directed; S. aureus dominant.",
    trials: [
      { name: "Darouiche NEJM 2006",
        n: "Cohort review",
        question: "Modern spinal epidural abscess management",
        finding: "Emergent surgical decompression for deficit reduces permanent deficit; medical-only acceptable for stable without deficit + close monitoring",
        bias: "Single-author review; outcomes vary by access to neurosurgery" },
      { name: "Patel J Neurosurg Spine 2014",
        n: "Cohort",
        question: "Outcome predictors in spinal epidural abscess",
        finding: "Time-to-decompression + pre-op deficit duration predict outcome; delay > 24 h with deficit drives permanent loss",
        bias: "Observational; case mix variation" },
      { name: "Reihsaus Neurosurg Rev 2000",
        n: "915 (meta)",
        question: "Epidural abscess outcomes by pathogen + management",
        finding: "S. aureus ~60% of cases; vancomycin empiric for MRSA-prevalent regions; pathogen-directed 6 wk IV standard",
        bias: "Older cohort; modern MRSA epidemiology shifts" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2015,
        topic: "Vertebral osteomyelitis + epidural abscess (Berbari)",
        keypoint: "Pathogen-driven 6 wk minimum; emergent surgery for deficit; medical-only for stable + close monitoring" },
      { society: "BSAC",
        year: 2024,
        topic: "British CNS infection",
        keypoint: "Aligned with IDSA; emphasizes vertebral osteo evaluation + ESR/CRP serial monitoring" },
    ],
    openQuestions: [
      "Optimal medical-only management protocol — close MRI + neurologic monitoring required",
      "Steroid use for cord edema — case-by-case; benefit unproven",
      "Oral step-down feasibility — extrapolated from OVIVA; institutional variation",
    ],
  },
};

export default { id: "epidural", regimen, decision };
