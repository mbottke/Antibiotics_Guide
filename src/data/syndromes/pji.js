/* ===========================================================
   PROSTHETIC JOINT INFECTION — IDSA 2013 (Osmon) + DATIPO NEJM 2021. DAIR vs
   1-stage vs 2-stage; rifampin for retained hardware. =========== */

const regimen = {
  "Empiric (post-sampling)": [
    {
      rx: /vancomycin.*antipseudomonal/i,
      pickIf: "PJI suspected — synovial fluid sampled, awaiting cultures.",
      whyPick: [
        "**Vancomycin + antipseudomonal β-lactam** while cultures pending",
        "**Get 3–5 deep tissue cultures** (plus sonication of explanted hardware) before / during surgery",
        "**Surgery strategy** (DAIR vs 1-stage vs 2-stage exchange) drives outcomes more than antibiotic choice",
      ],
      watchOut: [
        { sev: "warn", text: "**Antibiotics before sampling halve yield** — coordinate with surgery; if patient is hemodynamically stable, hold abx until OR sampling" },
        { sev: "warn", text: "**Septic shock or fulminant presentation** overrides the hold-abx rule — empiric coverage immediate",
          matchCtx: { severe: true } },
        { sev: "note", text: "**Alpha-defensin + leukocyte-esterase + synovial cell count** all converge to confirm PJI; one result alone isn't decisive" },
      ],
    },
  ],
  "Staphylococcal + retained hardware": [
    {
      rx: /rifampin/i,
      pickIf: "Staph PJI with retained hardware — DAIR strategy.",
      whyPick: [
        "**β-lactam or vancomycin + RIFAMPIN** — rifampin penetrates biofilm",
        "**Oral step-down** with rifampin-based combination (e.g., rifampin + FQ or doxycycline)",
        "**3 months for hip, 6 months for knee** — total course",
        "Never use rifampin monotherapy — resistance in days",
      ],
      watchOut: [
        { sev: "stop", text: "**Never rifampin monotherapy** — emerges resistant within 1–2 weeks" },
        { sev: "warn", text: "**Many interactions** — anticoagulants, OCPs, statins, immunosuppressants" },
        { sev: "warn", text: "**Hepatotoxicity** — check LFTs" },
        { sev: "note", text: "DAIR best within 4 weeks of symptom onset; later → 2-stage exchange" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "3 mo total (hip) / 6 mo total (knee) for DAIR + retained hardware; 4–6 wk for 2-stage exchange.",
    evidence: "IDSA 2013 (Osmon) + DATIPO NEJM 2021 — strategy-specific durations (3 mo hip / 6 mo knee); rifampin combination central to DAIR",
    branches: [
      { label: "DAIR — retained hardware", days: "3 mo hip / 6 mo knee",
        detail: "Pathogen-directed IV × 2–6 wk + oral step-down with rifampin combo for total duration",
        matchAgent: /rifampin/i },
      { label: "2-stage exchange (explant + spacer + re-implant)", days: "4–6 wk between stages",
        detail: "IV during stage 1 → 4–6 wk minimum → reimplant when cleared" },
      { label: "1-stage exchange", days: "3 mo total",
        detail: "Less common; reserved for selected susceptible organisms + intact soft tissue" },
      { label: "Suppressive (irretrievable hardware)", days: "Lifelong oral",
        detail: "TMP-SMX, doxycycline, or pathogen-directed; ID + ortho ongoing follow-up" },
    ],
    stopWhen: [
      "Pathogen cleared on cultures",
      "ESR + CRP normalizing",
      "Joint pain resolved, function returning",
      "Imaging shows stable or improving findings",
      "Multidisciplinary team agreement on stop",
      "Minimum strategy-specific duration completed",
    ],
    extendIf: [
      "DAIR failure (persistent symptoms / re-collection) — convert to 2-stage exchange",
      { text: "**Severe systemic illness** at presentation — extend per response",
        matchCtx: { severe: true } },
      "Immunocompromised host — extended course or suppression",
      "Multiple organisms / resistant flora — ID-driven extension",
      "Hardware abandonment + chronic infection — lifelong suppression",
    ],
  },
  monitoring: {
    headline: "Pathogen sampling before empirics; rifampin for retained hardware; ESR/CRP trend; multidisciplinary team.",
    items: [
      { sev: "required", what: "**3–5 deep tissue cultures + sonication of explanted hardware**",
        why: "Polymicrobial + biofilm flora; multiple cultures + sonication maximizes yield" },
      { sev: "required", what: "**Multidisciplinary team** — ortho, ID, plastics, anesthesia",
        why: "Surgical strategy + antibiotic plan must be co-decided" },
      { sev: "required", what: "**Rifampin combination** for retained hardware + staph",
        why: "Biofilm penetration; never start until cultures positive; never as monotherapy",
        matchAgent: /rifampin/i },
      { sev: "required", what: "**ESR + CRP at baseline + weekly** during course",
        why: "Decline correlates with response; rising values trigger imaging + surgical re-eval" },
      { sev: "trigger", what: "**Imaging (X-ray + MRI)** at 6 wk + 3 mo intervals",
        why: "Bone-prosthesis interface changes drive surgical re-decisions" },
      { sev: "trigger", what: "**Rifampin LFT + drug-interaction screen**",
        why: "Hepatotoxic + induces CYP3A4 (warfarin, OCPs, statins, immunosuppressants)",
        matchAgent: /rifampin/i },
      { sev: "consider", what: "Patient education on lifelong follow-up",
        why: "PJI recurrence risk persists; symptoms must trigger early presentation" },
    ],
  },
  rationale: {
    driver: "PJI is a hardware-biofilm disease that antibiotics alone cannot sterilize — surgical strategy (DAIR for acute / early infection, 1-stage or 2-stage exchange for chronic) co-determines the antibiotic plan with ortho + ID + plastics. DATIPO (NEJM 2021, n=410) established strategy-specific durations: DAIR retains hardware and runs 3 months total for hip / 6 months for knee with rifampin combination essential for staph (biofilm penetration — Zimmerli 1998 showed 100% vs 58% cure). Two-stage exchange runs 4–6 wk between stages with reimplant when cultures clear. Sonication of explanted prostheses + 3–5 deep tissue cultures maximizes pathogen yield in biofilm flora.",
    guideline: "datipo",
    rejected: "The legacy 6-week course for hip or 2-stage knee PJI was deliberately rejected — DATIPO (NEJM 2021) showed 6 wk inferior to 12 wk in DAIR + retained hardware, supporting the 3-month hip / 6-month knee IDSA durations. Empiric rifampin was tempered: never start as monotherapy or before cultures are positive — rifampin alone selects rapid resistance, and outside the staph + retained-hardware setting it carries hepatotoxicity + CYP3A4 interactions without benefit." },
  objections: [
    { q: "Why 3 mo hip / 6 mo knee for DAIR — DATIPO had options?",
      a: "DATIPO (NEJM 2021, n=410) [cite:datipo] specifically showed 6 wk INFERIOR to 12 wk in DAIR + retained hardware — the longer course had lower treatment failure, supporting the IDSA 2013 (Osmon) 3-mo hip / 6-mo knee durations. The biofilm substrate on retained prosthesis is the driver — antibiotics need extended duration to penetrate and suppress biofilm-embedded organisms. Reserve 6 wk only for 2-stage exchange (between stages, with hardware removed and spacer in place)." },
    { q: "Why rifampin combination — can we use a single agent?",
      a: "Zimmerli (JAMA 1998, n=33) established rifampin + ciprofloxacin 100% cure vs 58% control for staphylococcal PJI with retained hardware — rifampin penetrates the biofilm matrix that vancomycin / β-lactams alone cannot reach. NEVER as monotherapy (selects rapid resistance within days), NEVER before cultures positive [cite:datipo]. Combination drug-interaction screen mandatory (CYP3A4: warfarin, statins, immunosuppressants, OCPs) + LFT monitoring. Outside the staph + retained-hardware setting, rifampin offers no benefit." },
    { q: "Why DAIR over 2-stage — 2-stage is the gold standard?",
      a: "DAIR (debridement, antibiotics, implant retention) is appropriate for acute / early PJI (typically < 3 wk symptoms), stable hardware, susceptible organism, and intact soft tissue — IDSA 2013 (Osmon) endorses with rifampin combination per DATIPO [cite:datipo]. 2-stage exchange remains gold standard for chronic / late infection, biofilm-resistant organism (Pseudomonas, fungal), failed DAIR, or compromised soft tissue. Strategy is co-decided by ortho + ID + plastics based on chronicity, microbiology, and host substrate." },
    { q: "Why sonication of explanted hardware — cultures suffice?",
      a: "Polymicrobial + biofilm flora on explanted prostheses are missed by standard tissue cultures alone — sonication (Trampuz NEJM 2007) disrupts biofilm and increases pathogen yield by 20–30% over swabs or single tissue culture. IDSA 2013 (Osmon) + EBJIS 2024 mandate 3–5 deep tissue cultures + sonication on explants to maximize yield [cite:datipo]. Pathogen identification drives the antibiotic plan; missed pathogen condemns the patient to broad-spectrum failure." },
  ],
  research: {
    headline: "Strategy-specific durations; rifampin combination central to DAIR retained-hardware success.",
    trials: [
      { name: "Zimmerli JAMA 1998",
        n: "33",
        question: "Rifampin combination vs comparator for staph PJI DAIR",
        finding: "Rifampin + ciprofloxacin 100% cure vs 58% control — established rifampin as cornerstone for retained-hardware staph",
        bias: "Small + selected; subsequent observational supports magnitude" },
      { name: "Bernard NEJM 2021 (DATIPO)",
        n: "410",
        question: "6-wk vs 12-wk antibiotic duration after PJI surgery",
        finding: "6 wk inferior to 12 wk for hip + 2-stage knee — supports 3-mo hip / 6-mo knee IDSA durations",
        bias: "Single-country French cohort; subgroups noisy" },
      { name: "Renz NEJM 2020 (OVIVA subset)",
        n: "1,054 (PJI ~30%)",
        question: "Oral vs IV antibiotic for PJI (subset)",
        finding: "Oral non-inferior at 1 y; consistent with overall OVIVA finding for bone + joint infection",
        bias: "Required highly bioavailable oral options; selected PJI types" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2013,
        topic: "PJI (Osmon)",
        keypoint: "DAIR (3 mo hip / 6 mo knee) vs 1-stage vs 2-stage based on chronicity + microbiology; rifampin for staph + retained hardware" },
      { society: "EBJIS / ICM",
        year: 2024,
        topic: "International PJI consensus",
        keypoint: "Aligned with IDSA + DATIPO-supportive longer durations; biofilm-active combination for retained hardware" },
    ],
    openQuestions: [
      "DAIR success rate by chronicity threshold — < 3 wk typically used but variable evidence",
      "Suppressive antibiotic indications + duration — case-by-case; balance risk + benefit",
      "Dual antibiotic combinations beyond rifampin (e.g., fosfomycin) — emerging area",
    ],
  },
};

export default { id: "pji", regimen, decision };
