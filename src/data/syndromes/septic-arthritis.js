/* ===========================================================
   SEPTIC ARTHRITIS — IDSA 2010. Drainage essential; 2-4 wk
   IV typical; gonococcal narrow band. ============================== */

const regimen = {
  "Empiric": [
    {
      rx: /vancomycin.*ceftriaxone|antipseudomonal/i,
      pickIf: "Acute septic arthritis — empiric until Gram stain / culture back.",
      whyPick: [
        "**Vancomycin + ceftriaxone** — covers S. aureus + strep + GNR",
        "**Drainage** is the actual treatment (arthroscopy or arthrotomy)",
        "**Repeat aspiration** if no surgical drainage and persistent disease",
        "**3–4 week course**, longer for hardware or atypical organisms",
      ],
      watchOut: [
        { sev: "stop", text: "**Drainage delay** = joint destruction; ortho consult now" },
        { sev: "warn", text: "Crystals + bacteria can coexist — don't dismiss as gout if any suspicion" },
        { sev: "note", text: "Gonococcal: ceftriaxone × 7 d, often no drainage" },
      ],
    },
  ],
  "Gonococcal": [
    {
      rx: /ceftriaxone/i,
      pickIf: "Gonococcal arthritis — sexually active, migratory polyarthritis, tenosynovitis, rash.",
      whyPick: [
        "**Ceftriaxone × 7 d** (IV → IM step-down once stable)",
        "Drainage rarely needed — antibiotics alone usually clear",
        "**Treat partner + screen for other STIs** (HIV, syphilis, chlamydia, hepatitis B/C)",
        "**Add doxycycline 100 mg BID × 7 d** for empiric chlamydia co-treatment if not yet tested",
      ],
      watchOut: [
        { sev: "warn", text: "**Disseminated gonococcal triad**: tenosynovitis + pustular rash + arthritis — treat as DGI even before culture confirms" },
        { sev: "warn", text: "**Rising ceftriaxone resistance** in some regions (Asia-Pacific) — culture-confirm + susceptibilities; consider azithromycin combo per CDC update" },
        { sev: "note", text: "Test-of-cure 7–14 d post-treatment if symptoms persist; report cases per state public-health requirements" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "2–4 wk targeted; drainage essential; gonococcal narrows to 7 d.",
    evidence: "Society consensus — pathogen + drainage adequacy drive duration; gonococcal is the short outlier",
    branches: [
      { label: "S. aureus / gram-positive, drained", days: "2–4 wk",
        detail: "Cefazolin (MSSA) or vancomycin (MRSA) × 2–4 wk per response + joint involvement" },
      { label: "Gram-negative, drained", days: "2–3 wk",
        detail: "Ceftriaxone or cefepime per susceptibilities + joint penetration" },
      { label: "Gonococcal arthritis", days: "7 d",
        detail: "Ceftriaxone × 7 d (IV → IM); drainage rarely needed; partner treatment + STI screen" },
      { label: "Prosthetic-joint infection", days: "Per PJI",
        detail: "Treat per PJI protocol; surgical strategy drives medical management" },
    ],
    stopWhen: [
      "Joint inflammation resolving",
      "Synovial WBC declining on repeat tap",
      "Cultures cleared",
      "Range of motion returning",
      "Functional milestones met (PT progressing)",
      "Minimum 2 wk completed (longer for staph)",
    ],
    extendIf: [
      { text: "**Inadequate drainage** — repeat arthrotomy / arthroscopic washout",
        matchCtx: { severe: true } },
      "Bacteremia + arthritis together — extend per longest applicable duration",
      "Prosthetic joint involvement — treat per PJI protocol",
      "Recurrent effusion + cell-count rise — return to drainage + extension",
      "Immunocompromised host — extend per response",
    ],
  },
  monitoring: {
    headline: "Joint aspiration + drainage; serial cell counts; PT early; partner treatment for GC.",
    items: [
      { sev: "required", what: "**Joint aspiration + drainage** is the treatment",
        why: "Antibiotics alone insufficient; arthroscopic or open drainage drives outcome" },
      { sev: "required", what: "**Synovial fluid culture + Gram stain** at presentation",
        why: "Pathogen-directed therapy critical; cell count > 50,000 supports infection" },
      { sev: "required", what: "**Repeat aspiration / drainage** if effusion re-accumulates",
        why: "Serial drainage controls infection; persistent collection is treatment failure" },
      { sev: "trigger", what: "**Treat partner + STI screen** if gonococcal",
        why: "Standard public-health practice; reporting + contact tracing",
        matchBranch: ["Gonococcal arthritis"] },
      { sev: "trigger", what: "**Imaging (MRI)** if osteomyelitis or abscess suspected",
        why: "Adjacent osteomyelitis extends duration to bone-infection bands" },
      { sev: "trigger", what: "**Physical therapy early** — passive range first, active as tolerated",
        why: "Joint stiffness sequela is common; early PT preserves function" },
      { sev: "consider", what: "Hip / shoulder involvement — surgical drainage > arthroscopy",
        why: "Anatomy + complete drainage drive surgical approach" },
    ],
  },
  rationale: {
    driver: "Native septic arthritis is a drainage-first disease — joint aspiration + arthrotomy, arthroscopy, or serial therapeutic taps controls the infection; antibiotics alone fail. Empiric coverage targets S. aureus + streptococcus (cefazolin or vancomycin if MRSA risk) with anti-GNR added for elderly, immunocompromised, or healthcare-exposed hosts; targeted therapy narrows on synovial culture. Standard duration is 2–4 wk depending on pathogen and drainage adequacy. Gonococcal arthritis is the short outlier: 7 d of ceftriaxone, rarely needs drainage, and mandates partner notification + full STI screening. Early physical therapy (passive then active) preserves function — joint stiffness is the dominant long-term sequela.",
    guideline: "oviva",
    rejected: "Prolonged 4–6 wk IV courses for uncomplicated native septic arthritis were deliberately tempered — by the OVIVA principle, oral step-down is appropriate once initial drainage is complete and the patient is stable, with a bioavailable agent matched to the organism. Routine empiric anti-Pseudomonas coverage was rejected: reserved for IV drug use, immunocompromise, or prior Pseudomonas isolate, and reflexive pip-tazo in community native joint infection wastes breadth without changing outcomes." },
  objections: [
    { q: "Why drainage essential — antibiotics with high doses won't work?",
      a: "Native septic arthritis is a drainage-first disease — joint aspiration + arthrotomy, arthroscopy, or serial therapeutic taps controls the bacterial burden that antibiotics cannot reach in synovial fluid alone. Geirsson (Lancet ID 2014) established open / arthroscopic drainage equivalent; serial aspiration acceptable for small accessible joints. IDSA 2010 + EULAR 2020 align with IDSA SSTI principles [cite:ssti]. Antibiotic-only management in established septic arthritis carries ~30% residual joint dysfunction (Bardin ARD 2003), driven primarily by inadequate source control." },
    { q: "Why 2–4 wk — can we step down oral earlier per OVIVA?",
      a: "OVIVA (NEJM 2019, n=1,054) [cite:oviva] included native septic arthritis subset and supports oral step-down once initial drainage is adequate and the patient is stable with a bioavailable agent matched to organism. Total duration is 2–4 wk depending on pathogen + drainage adequacy; the IV phase is shortened to initial control. Reserve continued IV for inability to tolerate oral, no bioavailable target, polyarticular disease, or concurrent bacteremia per SAB bands." },
    { q: "Why only 7 d for gonococcal — that's a third the standard?",
      a: "Gonococcal arthritis is the short outlier per IDSA + CDC STI 2021 [cite:cdc_sti] — ceftriaxone 1 g IV q24h converted to IM, 7 d total typically suffices because N. gonorrhoeae lacks the destructive synovial enzyme profile of S. aureus, drainage is rarely required, and the organism clears rapidly with cephalosporin. Mandatory adjuncts: partner notification + full STI screen (HIV, chlamydia, syphilis, hep B/C). Extend beyond 7 d only for atypical / endocarditis-pattern disease." },
    { q: "Why not anti-pseudomonal cover empirically?",
      a: "Routine anti-pseudomonal coverage for community native septic arthritis was deliberately tempered — Pseudomonas is reserved for IV drug use, immunocompromise, prior Pseudomonas isolate, or healthcare exposure. Community native septic arthritis is overwhelmingly S. aureus + streptococcus; cefazolin empiric covers MSSA, vancomycin added only when MRSA risk factors present [cite:ssti]. Reflexive pip-tazo in community disease wastes spectrum without changing outcomes." },
  ],
  research: {
    headline: "Drainage + targeted antibiotics drive outcomes; gonococcal is the short outlier (7 d ceftriaxone).",
    trials: [
      { name: "Geirsson Lancet ID 2014",
        n: "Cohort",
        question: "Optimal drainage strategy (open vs arthroscopic vs serial aspiration)",
        finding: "Open or arthroscopic drainage equivalent; serial aspiration acceptable for selected small joints",
        bias: "Observational; joint-specific anatomy drives choice" },
      { name: "IDSA 2010 consensus",
        n: "Guideline",
        question: "Duration in native joint septic arthritis",
        finding: "2–4 wk IV typical; pathogen + drainage adequacy + bacteremia drive specific course length",
        bias: "Guideline synthesis predates short-course revolution" },
      { name: "Bardin / Combe ARD 2003",
        n: "Cohort",
        question: "Long-term functional outcomes after septic arthritis",
        finding: "30% have residual joint dysfunction; early PT + complete drainage are modifiable factors",
        bias: "Observational; outcomes vary by joint + delay-to-diagnosis" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2010,
        topic: "Native joint septic arthritis",
        keypoint: "Drainage + targeted antibiotic; 2–4 wk standard; 7 d for gonococcal" },
      { society: "EULAR",
        year: 2020,
        topic: "European septic arthritis management",
        keypoint: "Aligned with IDSA; emphasizes early PT for functional preservation" },
    ],
    openQuestions: [
      "Optimal duration in gonococcal — short course (7 d) supported, longer reserved for atypical presentations",
      "Oral step-down in native septic arthritis — extrapolated from OVIVA; institutional variation",
      "Adjunctive steroid use — small studies suggest faster pain resolution; not standard",
    ],
  },
};

export default { id: "septic-arthritis", regimen, decision };
