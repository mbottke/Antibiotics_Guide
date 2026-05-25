/* ===========================================================
   SSTI · SURGICAL SITE INFECTION — IDSA 2014. STOP-IT for deep
   organ-space; superficial may need only drainage. =============== */

const regimen = {
  "Superficial / clean": [
    {
      rx: /cefazolin|MRSA|incision/i,
      pickIf: "Superficial SSI from clean surgery (skin closure, no GI/GU/biliary).",
      whyPick: [
        "**Open the incision** — drainage is primary",
        "**Cefazolin or anti-MRSA agent** by local flora",
        "Short course post-drainage (**3–7 d**) usually sufficient",
      ],
      watchOut: [
        { sev: "warn", text: "**Open the incision** — pus + erythema with no fluctuance still needs source release; antibiotics alone fail" },
        { sev: "note", text: "**Hardware / mesh involvement** → extended therapy + surgical re-look; assume biofilm" },
      ],
    },
  ],
  "GI/GU/biliary surgery": [
    {
      rx: /ceftriaxone.*metronidazole|piperacillin/i,
      pickIf: "SSI from contaminated surgery — cover GNR + anaerobes.",
      whyPick: [
        "**Ceftriaxone + metronidazole** OR **pip-tazo** — both cover the resident flora",
        "**Source control** (drainage, washout) drives outcomes — antibiotics adjunctive",
        "Tailor by deep-tissue/fluid culture results within 48–72 h",
      ],
      watchOut: [
        { sev: "warn", text: "**Mesh / hardware infections** — usually need explant; antibiotics alone rarely cure biofilm" },
        { sev: "warn", text: "**Anastomotic leak** drives a fundamentally different problem — surgical re-exploration not just antibiotics" },
        { sev: "note", text: "Step-down to oral on cultures + clinical stability; STOP-IT-style 4-day post-source-control regimens sufficient" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Drainage + 4 d for organ-space (STOP-IT); 3–7 d superficial; longer if hardware retained.",
    evidence: "STOP-IT 2015 — 4 d post-drainage non-inferior in complicated IAI; SSI follows same principle",
    branches: [
      { label: "Superficial / incisional", days: "3–7 d",
        detail: "Cefazolin or MRSA agent by local flora; often drainage alone suffices" },
      { label: "Deep / organ-space, drained", days: "4 d post-drainage",
        detail: "STOP-IT bands; ceftriaxone + metronidazole or pip-tazo" },
      { label: "Hardware-associated SSI", days: "≥ 6 wk + rifampin",
        detail: "Per ortho / vascular / cardiothoracic protocol; rifampin for staph + retained hardware",
        matchAgent: /rifampin/i },
      { label: "Necrotizing post-op", days: "Per necfasc",
        detail: "Treat per necrotizing fasciitis bands; surgical re-look essential" },
    ],
    stopWhen: [
      "Source controlled (drainage, surgical revision)",
      "Afebrile ≥ 24 h",
      "Wound healing or appropriate negative-pressure dressing",
      "WBC normalizing",
      "Minimum tissue-depth duration completed",
    ],
    extendIf: [
      "Hardware retained — extend per ortho / vascular / cardio protocol",
      { text: "**Septic at presentation** — extend per sepsis bands",
        matchCtx: { severe: true } },
      "Inadequate source control — extend until controlled",
      "Recurrent infection at same site — workup retained foreign body",
    ],
  },
  monitoring: {
    headline: "Open the incision early; cultures of deep tissue (not surface); hardware decision driven.",
    items: [
      { sev: "required", what: "**Open the incision early** for superficial SSI — drainage > antibiotics",
        why: "Source control is the inflection point; antibiotics adjunct" },
      { sev: "required", what: "**Deep-tissue cultures**, not surface swabs",
        why: "Surface swabs reflect colonization; deep cultures drive directed therapy" },
      { sev: "required", what: "**Surgical consult** for organ-space SSI or hardware retention",
        why: "Re-exploration vs hardware removal decisions are surgical" },
      { sev: "trigger", what: "**Image (US / CT)** for organ-space or fluid collection workup",
        why: "Undrained collections drive antibiotic failure; imaging targets drainage" },
      { sev: "trigger", what: "**Add rifampin** for staph + retained hardware",
        why: "Biofilm penetration; never start until cultures positive to prevent resistance",
        matchAgent: /rifampin/i },
      { sev: "consider", what: "Negative-pressure dressing for large or organ-space wounds",
        why: "Improves healing rates + reduces secondary procedures" },
    ],
  },
  rationale: {
    driver: "SSI is fundamentally a source-control disease — opening the incision early is the inflection point, antibiotics are adjunctive. Superficial / incisional SSI often resolves with drainage alone; deep / organ-space SSI follows STOP-IT (NEJM 2015) — 4 d post-drainage non-inferior to symptom-guided in adequately controlled infection. Empirics target the operative site flora (cefazolin or per local antibiogram; pip-tazo + vancomycin for organ-space colorectal / hepatobiliary substrate). Hardware-retained SSI extends to ≥ 6 wk with adjunctive rifampin once cultures positive — the biofilm rule.",
    guideline: "stopit",
    rejected: "Reflexive 10–14 d empiric courses for drained SSI were deliberately rejected — STOP-IT 2015 established that 4 d post-source-control is non-inferior to symptom-guided therapy in complicated intra-abdominal infection, and the SSI subset follows the same principle. Empiric antibiotics for superficial incisional SSI without surrounding cellulitis or systemic signs were tempered: drainage alone is often sufficient (Stevens IDSA 2014), and antibiotics drive resistance + C. difficile without changing wound trajectory." },
  objections: [
    { q: "Why open and drain rather than escalating antibiotics?",
      a: "Surgical site infections are source-control problems; antibiotics fail when pus and devitalized tissue remain. Open the wound, drain, and debride — then antibiotics treat surrounding cellulitis, not the cavity. STOP-IT showed ~4 days post-adequate-source-control suffices for intra-abdominal SSI without escalating spectrum [cite:stopit]." },
    { q: "Why only 4–7 days after drainage — surgeons want 10–14?",
      a: "STOP-IT (n=518) randomized fixed ~4 d vs symptom-guided therapy after adequate source control and found no difference in recurrence, SSI, or death. Longer courses select for resistance and Clostridioides difficile without outcome benefit. Anchor duration to source control adequacy, not arbitrary tradition [cite:stopit]." },
    { q: "Why not broad gram-negative cover for every wound infection?",
      a: "Superficial SSI after clean surgery is staph/strep-dominant; gram-negatives matter only after GI/GU/biliary procedures or in immunocompromised hosts. Reflexive carbapenem use drives resistance. Match spectrum to surgical site and tailor on culture per stewardship principles [cite:stew]." },
  ],
  research: {
    headline: "Drainage + STOP-IT-aligned 4 d for organ-space; hardware-retained needs rifampin; pathogen + depth-driven choice.",
    trials: [
      { name: "Stevens IDSA 2014",
        n: "Guideline",
        question: "Modern SSI categorization + treatment",
        finding: "Superficial: drainage often sufficient; deep / organ-space: drainage + per STOP-IT 4 d; hardware retention extends per device-infection bands",
        bias: "Guideline synthesis" },
      { name: "STOP-IT NEJM 2015 (Sawyer, deep SSI subset)",
        n: "518 (subset)",
        question: "Fixed 4-d antibiotics for organ-space SSI with adequate source control",
        finding: "4 d non-inferior to symptom-guided; supports short course post-drainage",
        bias: "Required adequate source control" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2014,
        topic: "SSTI + SSI (Stevens)",
        keypoint: "Source-control-anchored short course; drainage drives outcome; rifampin for staph + retained hardware" },
      { society: "ACS / SIS",
        year: 2017,
        topic: "Surgical site infection prevention",
        keypoint: "Aligned with IDSA + WHO; emphasizes perioperative bundle + glycemic control" },
    ],
    openQuestions: [
      "Optimal duration with retained hardware — case-by-case, often 6 wk + rifampin",
      "Negative-pressure dressing benefit — supportive but specific indications variable",
      "Routine vs targeted reconstructive surgery referral — institutional variation",
    ],
  },
};

export default { id: "ssi", regimen, decision };
