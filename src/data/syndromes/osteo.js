/* ===========================================================
   OSTEOMYELITIS — IDSA 2015. 6 weeks IV standard; OVIVA enables
   oral step-down at 1-2 weeks in selected. ======================== */

const regimen = {
  "Empiric (await bone culture)": [
    {
      rx: /vancomycin.*β-?lactam|vancomycin.*antipseudomonal|cefepime|ceftriaxone/i,
      pickIf: "Acute osteomyelitis — empiric while bone biopsy / culture pending.",
      whyPick: [
        "**Vancomycin + antipseudomonal/GNR β-lactam** (cefepime if Pseudo risk, ceftriaxone if not)",
        "**Hold antibiotics until bone biopsy** if stable — culture yield drops 40% with prior abx",
        "**6 weeks IV** standard; oral step-down once organism known",
        "Source control — debridement for sequestrum / hardware",
      ],
      watchOut: [
        { sev: "warn", text: "**Empiric therapy halves culture yield** — biopsy first if patient stable" },
        { sev: "note", text: "OVIVA trial: oral step-down at 1–2 wk non-inferior to all-IV in selected cases" },
      ],
    },
  ],
  "Directed": [
    {
      rx: /cefazolin|nafcillin|organism|MSSA/i,
      pickIf: "Organism identified — narrow + 6-week course.",
      whyPick: [
        "**Cefazolin or nafcillin** for MSSA",
        "**Vancomycin or daptomycin** for MRSA",
        "**Cipro / TMP-SMX / clindamycin** for oral step-down per susceptibilities",
        "**Add rifampin** for staph + retained hardware",
      ],
      watchOut: [
        { sev: "warn", text: "**Rifampin only after cultures positive** — induces resistance fast; never start empirically" },
        { sev: "warn", text: "**ESR / CRP trend** more reliable than imaging for response — re-image only at 4–6 wk or on clinical deterioration" },
        { sev: "note", text: "Oral step-down candidates: cipro / TMP-SMX / clindamycin / linezolid — pick by bone penetration + susceptibilities (OVIVA non-inferiority)" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "6 wk total minimum; OVIVA enables oral step-down at 1–2 wk in selected hosts.",
    evidence: "IDSA 2015 + OVIVA 2019 — oral step-down non-inferior in selected; total duration unchanged",
    branches: [
      { label: "Acute hematogenous, organism known", days: "6 wk total",
        detail: "Pathogen-directed IV for 2 wk minimum + oral step-down per OVIVA criteria" },
      { label: "Chronic / refractory", days: "Extended + surgery",
        detail: "Surgical debridement essential; antibiotics adjunctive; sequestrectomy" },
      { label: "Hardware-retained MSSA/MRSA", days: "≥ 6 wk + rifampin",
        detail: "Add rifampin once cultures positive; never empirically (resistance)",
        matchAgent: /rifampin/i },
      { label: "Vertebral osteo with deficit", days: "Per vertosteo",
        detail: "Emergent MRI + spine surgery if neuro deficit; treat per vertosteo bands" },
    ],
    stopWhen: [
      "Bone biopsy negative on completion (selected cases)",
      "ESR + CRP normalizing",
      "Clinical resolution — pain, function returning",
      "Imaging stable or improving (radiographic lag normal)",
      "Hardware decision finalized (retain vs explant)",
      "Minimum 6 wk completed",
    ],
    extendIf: [
      "Inadequate source control — retained sequestrum, hardware infection",
      "Recurrent symptoms during oral step-down — return to IV",
      { text: "**Immunocompromised host** — extend per response",
        matchCtx: { severe: true } },
      "MRSA + persistent symptoms — switch to dapto or linezolid salvage",
    ],
  },
  monitoring: {
    headline: "Bone biopsy first when stable; OVIVA oral step-down; ESR/CRP weekly; image only if non-response.",
    items: [
      { sev: "required", what: "**Bone biopsy + culture BEFORE empirics** when patient stable",
        why: "Empiric therapy halves culture yield; targeted therapy drives outcomes" },
      { sev: "required", what: "**Weekly ESR + CRP trend**",
        why: "Inflammatory marker decline correlates with response; imaging lags clinically" },
      { sev: "required", what: "**Oral step-down via OVIVA criteria** — non-inferior in selected",
        why: "Reduces line complications + length of stay; criteria include compliance + susceptibility" },
      { sev: "trigger", what: "**Repeat imaging at 4–6 wk** only if no clinical response",
        why: "Radiographic lag normal; image-driven extension without clinical change rarely helpful" },
      { sev: "trigger", what: "**Rifampin combination** for staph + retained hardware",
        why: "Biofilm penetration; never empiric; monitor LFTs + drug interactions",
        matchAgent: /rifampin/i },
      { sev: "trigger", what: "**Surgical debridement** if sequestrum / abscess / hardware infection",
        why: "Source control accelerates response; antibiotic alone fails in chronic disease" },
      { sev: "consider", what: "Hyperbaric oxygen for refractory chronic osteo",
        why: "Adjunctive evidence; institutional availability varies" },
    ],
  },
  rationale: {
    driver: "Native osteomyelitis treatment hinges on bone biopsy BEFORE empirics (when the patient is stable) — empiric therapy halves culture yield and condemns the patient to broad-spectrum therapy for the full 6 wk. Total duration is 6 wk minimum from definitive debridement: MSSA → cefazolin or nafcillin; MRSA → vancomycin (AUC 400–600); GNR → ceftriaxone or cefepime per susceptibilities and bone penetration. OVIVA (NEJM 2019, n=1,054) established oral non-inferior to IV at 1-year treatment failure, with ~75% reduction in line complications — most patients now step down to oral after initial control once a highly bioavailable agent is available.",
    guideline: "oviva",
    rejected: "Reflexive 12-week IV courses were deliberately rejected — OVIVA established oral step-down non-inferior at 1 year for bone + joint infection, and prolonged IV exposure drives line infections, AKI, and thromboembolism without efficacy benefit. Empiric rifampin combination was tempered: rifampin is added ONLY for staph with retained hardware after cultures are positive, never as monotherapy or empirically — single-agent rifampin selects rapid resistance, and routine combination outside the hardware setting offers no advantage." },
  objections: [
    { q: "Why oral step-down — IV has always been the standard for bone?",
      a: "OVIVA (NEJM 2019, n=1,054) [cite:oviva] established oral non-inferior to IV at 1-year treatment failure across bone + joint infections — with ~75% reduction in line-related complications (DVT, line sepsis, AKI). The total course remains 6 wk, but the IV phase is shortened to initial stabilization (typically 1–2 wk) before stepping down to a highly bioavailable oral agent matched to the bone-biopsy organism. Reserve continued IV for inability to tolerate oral, no bioavailable target, or unstable disease." },
    { q: "Why biopsy before empirics — patient is symptomatic?",
      a: "Empiric antibiotics halve bone-biopsy culture yield per IDSA 2015 — condemning the patient to a 6-week broad-spectrum course rather than targeted therapy [cite:vosteo]. When the patient is hemodynamically stable, biopsy first (image-guided or open), then start empirics. The 24–48 h delay is acceptable in stable disease; the downstream stewardship + outcome benefit is documented. Reserve empiric-first for septic or unstable patients where waiting is unsafe." },
    { q: "Why not add rifampin empirically — biofilm is everywhere?",
      a: "Rifampin combination is reserved for confirmed staphylococcal osteo with RETAINED hardware (Zimmerli 1998: rifampin + cipro 100% cure vs 58% control) — never empirically and never as monotherapy [cite:vosteo]. Single-agent rifampin selects rapid resistance within days; combination outside the staph + hardware setting carries hepatotoxicity + CYP3A4 interactions (warfarin, statins, immunosuppressants) without benefit. Wait for culture-positive staph + retained hardware before adding." },
    { q: "Why 6 wk minimum — that seems arbitrary?",
      a: "IDSA 2015 (Berbari) anchors 6 wk as the minimum total course for native osteomyelitis from definitive debridement, supported by Park (PLoS One 2019 meta) and OVIVA outcomes [cite:oviva]. Shorter courses carry higher relapse; longer courses don't improve outcomes in responders. Extension applies for inadequate source control (retained sequestrum, undrained abscess), persistent ESR/CRP elevation, or immunocompromise. The 6-wk floor is gated by AND-joined clinical response, not arbitrary." },
  ],
  research: {
    headline: "OVIVA — oral non-inferior to IV at 1-y treatment failure; debridement drives outcomes in chronic disease.",
    trials: [
      { name: "OVIVA NEJM 2019 (Li)",
        n: "1,054",
        question: "Oral vs IV for bone + joint infection",
        finding: "Oral non-inferior at 1-y treatment failure; ~75% reduction in IV-line complications",
        bias: "Required highly bioavailable oral options" },
      { name: "Bernard Lancet 2015 (vert subset)",
        n: "351",
        question: "6 vs 12 wk vertebral osteo",
        finding: "6 wk non-inferior; foundation of modern duration",
        bias: "French cohort" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2015,
        topic: "Native + vertebral osteomyelitis (Berbari)",
        keypoint: "6 wk standard + biopsy-driven pathogen direction; OVIVA-supportive oral step-down" },
    ],
    openQuestions: [
      "OVIVA threshold + criteria — case-by-case",
      "Rifampin combination thresholds — hardware retention",
    ],
  },
};

export default { id: "osteo", regimen, decision };
