/* ===========================================================
   COAGULASE-NEGATIVE STAPHYLOCOCCAL BACTEREMIA — distinguish
   true infection from contaminant. ================================ */

const regimen = {
  "True infection": [
    {
      rx: /vancomycin/i,
      pickIf: "Multiple positive cultures + line/prosthetic device + symptoms.",
      whyPick: [
        "**Most CoNS are methicillin-resistant** (mecA+)",
        "Vancomycin first-line until oxacillin sensitivity confirmed",
        "**Remove the device** if possible — biofilm renders antibiotics ineffective",
      ],
      watchOut: [
        { sev: "warn", text: "**One positive culture** = likely contaminant — don't treat reflexively" },
        { sev: "note", text: "S. lugdunensis is the exception — treat like S. aureus (highly virulent)" },
      ],
    },
  ],
  "Oxacillin-susceptible": [
    {
      rx: /cefazolin|nafcillin/i,
      pickIf: "Confirmed oxacillin-susceptible CoNS — narrow off vancomycin.",
      whyPick: [
        "**Cefazolin** when susceptible — narrower, less toxic than vanco",
        "Same MSSA principles apply — **cefazolin > nafcillin** for non-CNS",
        "**~25–30% of CoNS** are oxacillin-S — narrowing rate is meaningful for stewardship",
      ],
      watchOut: [
        { sev: "warn", text: "**Verify susceptibility on multiple isolates** before narrowing — heterogeneous resistance possible" },
        { sev: "note", text: "If S. lugdunensis confirmed, treat as S. aureus — TEE + ID consult regardless of phenotype" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "7 d if true infection + line out; longer if hardware retained or endovascular.",
    evidence: "IDSA 2009 — pathogen-specific bands; multiple positive cultures + line/hardware = true infection",
    branches: [
      { label: "True infection, line removed", days: "7 d",
        detail: "Vancomycin (most CoNS are methicillin-resistant) post-line removal",
        matchAgent: /vancomycin/i },
      { label: "Oxacillin-susceptible CoNS, line out", days: "5–7 d",
        detail: "Cefazolin or nafcillin; same MSSA principles" },
      { label: "Hardware retained (lock therapy)", days: "10–14 d + lock",
        detail: "Only for selected stable patients; salvage rate ~50–70%" },
      { label: "S. lugdunensis (treat as S. aureus)", days: "14 d minimum",
        detail: "Hypervirulent CoNS; TEE + endocarditis workup; 14 d like SAB" },
    ],
    stopWhen: [
      "Multiple cultures cleared",
      "Line removed or successfully locked",
      "Clinical improvement",
      "Echo negative if appropriate",
      "Minimum 5-7 d completed",
    ],
    extendIf: [
      { text: "**S. lugdunensis** — treat as S. aureus regardless of phenotype",
        matchCtx: { mrsaRisk: true } },
      "Hardware retained — extend per lock + clinical",
      "Endocarditis or endovascular seeding",
      "Persistent positivity on lock therapy — explant",
    ],
  },
  monitoring: {
    headline: "Distinguish contamination from infection; multiple cultures; line removal preferred.",
    items: [
      { sev: "required", what: "**Multiple positive cultures + symptoms** = true infection",
        why: "Single positive CoNS culture often contamination; >50% in practice" },
      { sev: "required", what: "**Remove the line / device** when feasible",
        why: "Biofilm renders systemic-only therapy inadequate" },
      { sev: "required", what: "**Identify S. lugdunensis** if isolated — treat as S. aureus",
        why: "Hypervirulent; missed = treatment failure" },
      { sev: "trigger", what: "**TEE if persistent bacteremia or device-related**",
        why: "Endocarditis workup; CoNS PVE common with prosthetic valves" },
      { sev: "trigger", what: "**Lock therapy attempt** only for CoNS + stable + lock-amenable",
        why: "Documented salvage success; limited indication",
        matchBranch: ["Hardware retained (lock therapy)"] },
      { sev: "consider", what: "Workup for prosthetic-material infection (valves, leads, grafts)",
        why: "CoNS biofilm on hardware drives recurrence" },
    ],
  },
  rationale: {
    driver: "The diagnostic challenge in CoNS bacteremia is the contaminant rate — a single positive culture is contamination in over 50% of practice, so management hinges on ≥ 2 positive sets plus a plausible source (line, hardware, prosthetic material) plus clinical signs before committing to therapy (Mermel / IDSA 2009). True infection with line removed completes 5–7 d of vancomycin (most CoNS are methicillin-resistant) or cefazolin / nafcillin for the oxacillin-susceptible minority. S. lugdunensis is the critical outlier — hypervirulent CoNS that must be treated as S. aureus (14 d minimum with TEE) regardless of phenotype, because missed identification predicts treatment failure.",
    guideline: "crbsi_g",
    rejected: "Treating every positive CoNS culture as true infection was deliberately rejected — over half are skin contaminants, and committing such patients to 7+ days of vancomycin drives AKI, line exposure, and resistance with no benefit. Empiric prolonged courses with retained hardware were tempered: lock-therapy salvage is appropriate only for selected stable patients with long-term-line-essential indications, and persistent positivity on lock therapy should trigger explant rather than further IV escalation." },
  objections: [
    { q: "Why not treat every positive CoNS culture — feels safer?",
      a: "Single-set CoNS positivity is contamination in over 50% of practice — Beekmann (CID 2005) and Mermel / IDSA 2009 [cite:crbsi_g] require ≥ 2 positive sets plus a plausible source (line, hardware, prosthetic material) plus clinical signs before committing to therapy. Reflexive treatment of every positive set drives unnecessary vancomycin exposure, AKI, line dwell time, and resistance pressure on what was a skin-flora contaminant. The diagnostic rigor is the stewardship intervention; the bar is justified." },
    { q: "Why identify S. lugdunensis — it's still a CoNS species?",
      a: "S. lugdunensis is hypervirulent CoNS that behaves clinically like S. aureus — Anguera (Heart 2005) and IDSA 2011 / 2014 [cite:ssti] establish it as a CoNS species that mandates SAB-style management: 14-d minimum duration, TEE workup, endocarditis surveillance regardless of phenotype. Missed identification predicts treatment failure because the 5–7-d CoNS course under-treats lugdunensis. The microbiology lab must report species, not just 'CoNS' — and the receiver must act on lugdunensis as if it were S. aureus." },
    { q: "Why 5-7 d for true CoNS — should match SAB at 14 d?",
      a: "True CoNS bacteremia with line removal completes 5–7 d of vancomycin (most CoNS are methicillin-resistant) per IDSA 2009 [cite:crbsi_g] — the lower-virulence substrate of typical CoNS (S. epidermidis, S. hominis, S. haemolyticus) does not carry the 15–25% endocarditis risk of S. aureus, and shorter courses match clinical outcomes without the toxicity cost. Extending to 14 d adds vancomycin exposure + AKI without benefit; the species-by-species risk stratification is the principled approach." },
    { q: "Why pull a working tunneled line for CoNS — patient relies on it?",
      a: "Line removal is preferred even for CoNS per Mermel / IDSA 2009 [cite:crbsi_g] — biofilm on hardware drives relapse + persistent positivity, and salvage with lock therapy retains only ~70% success even in the favorable CoNS substrate (Raad CID 2013). Lock therapy is acceptable for clinically stable + long-term-line-essential patients (oncology, hemodialysis), but persistent positivity on lock therapy triggers explant. The default is line out; lock therapy is the exception with documented failure rates." },
  ],
  research: {
    headline: "Distinguish contaminant from true infection (≥ 2 cultures + hardware + clinical); line out is the inflection point.",
    trials: [
      { name: "Mermel CID 2009",
        n: "Guideline",
        question: "CoNS bacteremia management algorithm",
        finding: "≥ 2 positive cultures + line / hardware presence + clinical signs = treat; single positive without hardware = contaminant",
        bias: "Guideline synthesis" },
      { name: "Beekmann CID 2005",
        n: "Cohort",
        question: "True CoNS bacteremia outcomes vs contaminant",
        finding: "Lock therapy successful in ~70% of long-term lines with retained line; hardware retention extends duration",
        bias: "Selection by line type + organism" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2009,
        topic: "Catheter-related bloodstream infection (Mermel)",
        keypoint: "Distinguish contaminant; ≥ 2 cultures + line/hardware + clinical signs = treat; line removal preferred" },
    ],
    openQuestions: [
      "Single-culture CoNS interpretation — clinical judgment-driven",
      "Lock therapy duration + agent — 14 d standard",
      "Echo for CoNS in retained device — case-by-case",
    ],
  },
};

export default { id: "cons", regimen, decision };
