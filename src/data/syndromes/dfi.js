/* ===========================================================
   SSTI · DIABETIC FOOT INFECTION — IDSA 2023. Tissue depth drives
   duration; bone involvement → osteo duration. ==================== */

const regimen = {
  "Mild": [
    {
      rx: /cephalexin|cefazolin/i,
      pickIf: "Mild diabetic foot infection (no systemic signs, < 2 cm cellulitis, no bone exposure).",
      whyPick: [
        "**Cephalexin / cefazolin** — covers strep + MSSA",
        "**Add MRSA cover** (TMP-SMX or doxy) if MRSA colonized or recent abx",
        "**Wound care + offloading** drive outcomes — antibiotics alone fail without these",
        "**1–2 week course** for mild infection",
      ],
      watchOut: [
        { sev: "warn", text: "**Probe-to-bone** positive → osteomyelitis; bone biopsy + longer course" },
        { sev: "note", text: "X-ray, MRI for suspicion of underlying osteo" },
      ],
    },
  ],
  "Moderate–severe": [
    {
      rx: /piperacillin|ceftriaxone.*metronidazole|vancomycin/i,
      pickIf: "Moderate-severe DFI — systemic signs, deep tissue, ischemia, or rapid progression.",
      whyPick: [
        "**Pip-tazo** OR **ceftriaxone + metronidazole** — broad coverage",
        "Add **vancomycin** if MRSA risk or septic",
        "**Vascular surgery** — assess perfusion; revascularize if needed",
        "**Debridement** of necrotic tissue — surgery often needed",
      ],
      watchOut: [
        { sev: "warn", text: "**Osteomyelitis common** — get bone biopsy if doubt" },
        { sev: "note", text: "2–4 week course for soft tissue; 4–6 wk if bone involved" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "1–2 wk mild, 2–4 wk moderate, 4–6 wk if osteo; vascular + offloading drive outcomes.",
    evidence: "IDSA 2023 — tissue-depth-stratified duration; osteo handled per bone-infection bands",
    branches: [
      { label: "Mild (no systemic, no deep tissue)", days: "1–2 wk",
        detail: "Oral cephalexin / amox-clav; outpatient management feasible" },
      { label: "Moderate / severe (deep tissue, systemic)", days: "2–4 wk",
        detail: "Pip-tazo + vancomycin; vascular + surgical consult" },
      { label: "Osteomyelitis present (probe-to-bone +)", days: "4–6 wk",
        detail: "From last surgical debridement / amputation; oral step-down per OVIVA in selected" },
      { label: "Limb-threatening / sepsis", days: "Per source",
        detail: "Emergent vascular + surgical management; antibiotic duration secondary to revascularization" },
    ],
    stopWhen: [
      "Clinical resolution of cellulitis / drainage",
      "Bone biopsy negative (if osteo treated)",
      "Wound healing trajectory established",
      "Vascular status assessed / optimized",
      "Offloading + glycemic control in place",
      "Minimum tissue-depth duration completed",
    ],
    extendIf: [
      { text: "**Limb-threatening or systemic toxicity** — extend per source + vascular consult",
        matchCtx: { severe: true } },
      "Bone involvement (probe-to-bone + or MRI positive) — extend to osteo duration",
      "Recurrent infection at same site — workup retained foreign body / inadequate prior debridement",
      "Charcot neuroarthropathy + active infection — complex multi-team management",
    ],
  },
  monitoring: {
    headline: "Probe-to-bone test, vascular assessment, offloading, multidisciplinary team coordination.",
    items: [
      { sev: "required", what: "**Probe-to-bone test** at presentation + bone biopsy if positive",
        why: "Probe-to-bone has 87% PPV for osteomyelitis; biopsy + culture drives directed therapy" },
      { sev: "required", what: "**Vascular assessment** — ABI, pulses, perfusion; revascularization if indicated",
        why: "Inadequate perfusion prevents healing regardless of antibiotic" },
      { sev: "required", what: "**Offloading** — total contact cast, removable boot, surgical offloading",
        why: "Continued pressure prevents healing; non-negotiable for plantar wounds" },
      { sev: "required", what: "**Multidisciplinary team** — podiatry, vascular, ID, endocrinology, wound care",
        why: "Team-based care has documented mortality + limb-salvage benefit" },
      { sev: "trigger", what: "**MRI foot** if osteo suspected on probe-to-bone or plain film",
        why: "Sensitive for bone marrow edema, joint involvement, abscess drainage targets" },
      { sev: "trigger", what: "**Surgical debridement** for moderate-severe + necrotic tissue",
        why: "Source control essential; antibiotics alone fail with necrosis present",
        matchCtx: { severe: true } },
      { sev: "consider", what: "**Glycemic control** — HbA1c trend, basal-bolus optimization",
        why: "Hyperglycemia impairs healing + immune function; adjunctive to all other measures" },
    ],
  },
  rationale: {
    driver: "DFI duration is tissue-depth stratified per IWGDF/IDSA 2023 — mild soft-tissue 1–2 wk; moderate/severe 2–4 wk; osteomyelitis 4–6 wk (or ~1 wk if all infected bone resected, 3 wk after minor amputation with positive proximal bone margin). Empiric coverage matches presentation: outpatient mild → oral cephalexin or amox-clav for strep + staph; moderate/severe → pip-tazo + vancomycin to cover MRSA + GNR + anaerobes; narrow on culture. Probe-to-bone has ~87% PPV for osteomyelitis and triggers bone biopsy for targeted long course. Antibiotics fail without revascularization, offloading, and glycemic control — the multidisciplinary team (podiatry, vascular, ID, endocrinology, wound care) drives limb salvage.",
    guideline: "dfi",
    rejected: "The legacy 4–6 wk course for moderate DFI without osteomyelitis was deliberately rejected — IWGDF/IDSA 2023 explicitly shortened to 1–2 wk for soft-tissue-only disease, and prolonged courses select for resistance without changing healing. Routine empiric anti-Pseudomonas coverage was tempered: reserved for prior Pseudomonas isolate, severe infection with warm-climate exposure, or extensive maceration — reflexive pip-tazo in mild outpatient cases is unjustified breadth." },
  objections: [
    { q: "Why 1–2 wk for mild DFI — legacy was 4 wk?",
      a: "IWGDF / IDSA 2023 [cite:iwgdf_idsa] [cite:dfi] explicitly shortened mild soft-tissue DFI to 1–2 wk — Senneville and the modern evidence base showed prolonged courses select for resistance without changing healing. The legacy 4–6 wk course conflated soft-tissue infection with osteomyelitis; tissue-depth stratification is the audit-defensible model now. Reserve 4–6 wk only for confirmed osteomyelitis (probe-to-bone + or MRI positive), and shorten further (~1 wk) if all infected bone is resected." },
    { q: "Why not anti-pseudomonal cover routinely — diabetics are sicker?",
      a: "IWGDF / IDSA 2023 [cite:iwgdf_idsa] reserves anti-pseudomonal coverage (pip-tazo) for prior Pseudomonas isolate, severe infection with warm-climate exposure, extensive maceration, or limb-threatening disease — community DFI is overwhelmingly strep + staph + enteric GNR in mild / moderate presentation. Reflexive pip-tazo in mild outpatient DFI is unjustified breadth that drives resistance + AKI; oral cephalexin or amox-clav is appropriate first-line for mild outpatient management." },
    { q: "Why oral step-down for osteo — DFI osteo seems serious?",
      a: "OVIVA (NEJM 2019, n=1,054) [cite:oviva] included DFI osteomyelitis subset and showed oral non-inferior to IV at 1-year treatment failure with ~75% reduction in line complications. IWGDF / IDSA 2023 [cite:iwgdf_idsa] endorses oral step-down for compliant patients with a highly bioavailable agent (FQ, TMP-SMX, linezolid for MRSA) matched to bone-biopsy organism. Reserve continued IV for limb-threatening sepsis, intolerance of oral, or no bioavailable target. Stewardship + LOS gains are real." },
    { q: "Why probe-to-bone test — MRI is more sensitive?",
      a: "Probe-to-bone test has ~87% PPV for osteomyelitis in DFI per Lavery / Lipsky, is bedside-immediate, and drives the decision to obtain bone biopsy + extend course to 4–6 wk per IWGDF / IDSA 2023 [cite:iwgdf_idsa]. MRI is sensitive but lags and may not be available immediately; probe-to-bone + ESR > 70 is a strong combined signal. Bone biopsy + culture before empirics (when stable) drives targeted long-course therapy; empiric therapy halves culture yield." },
  ],
  research: {
    headline: "IDSA 2023 stratifies by tissue depth + osteo; offloading + vascular assessment + glycemic control drive outcomes.",
    trials: [
      { name: "Senneville IDSA 2023",
        n: "Guideline",
        question: "Modern diabetic foot infection management",
        finding: "Tissue-depth-stratified duration + multidisciplinary team (ID + endo + vascular + podiatry) drives outcomes",
        bias: "Guideline synthesis; some debate about empiric coverage breadth" },
      { name: "OVIVA NEJM 2019 (Li)",
        n: "1,054",
        question: "Oral vs IV antibiotic for bone + joint infection (incl. DFI osteo subset)",
        finding: "Oral non-inferior at 1 y; DFI osteo subset showed equivalent outcomes with reduced line burden",
        bias: "Required highly bioavailable oral options" },
      { name: "Lipsky CID 2012",
        n: "Cohort",
        question: "Treatment intensity stratification by infection severity",
        finding: "Mild → outpatient PO; moderate → IV ± admission; severe → IV + admission + vascular + surgery; aligns with IDSA 2023",
        bias: "Observational; pre-modern β-lactam alternatives" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2023,
        topic: "Diabetic foot infection (Senneville)",
        keypoint: "Tissue-depth + osteo stratified duration; biopsy-driven pathogen direction; multidisciplinary team" },
      { society: "IWGDF",
        year: 2023,
        topic: "International Working Group Diabetic Foot",
        keypoint: "Aligned with IDSA; emphasizes offloading + vascular assessment + glycemic optimization" },
    ],
    openQuestions: [
      "Optimal duration in osteomyelitis with retained dead bone — surgical debridement drives",
      "Oral step-down threshold in moderate disease — institutional variation",
      "Routine biopsy vs deep tissue culture — biopsy preferred for osteo",
    ],
  },
};

export default { id: "dfi", regimen, decision };
