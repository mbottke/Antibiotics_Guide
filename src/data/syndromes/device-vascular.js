/* ===========================================================
   VASCULAR DEVICE INFECTION — port, line, graft, AVF. =========== */

const regimen = {
  "Empiric": [
    {
      rx: /vancomycin.*antipseudomonal|cefepime|piperacillin/i,
      pickIf: "Vascular device infection (port, line, graft, AVF) — empiric.",
      whyPick: [
        "**Vancomycin + antipseudomonal β-lactam** until cultures back",
        "**Remove the device** — biofilm renders antibiotics ineffective for cure",
        "Workup **endocarditis (TEE)** + metastatic foci — vascular-device infection often seeds",
      ],
      watchOut: [
        { sev: "warn", text: "**Device retention rarely succeeds** outside CoNS with stable patient + lock therapy — counsel realistic salvage rate (~20–30%)" },
        { sev: "warn", text: "**S. aureus / Pseudomonas / Candida / persistent bacteremia** → device MUST come out; no salvage" },
        { sev: "note", text: "Time to positivity > 2 h difference between line + peripheral cultures supports line source" },
      ],
    },
  ],
  "Definitive": [
    {
      rx: /removal|hardware|rifampin/i,
      pickIf: "Confirmed device infection — complete removal preferred.",
      whyPick: [
        "**Complete device removal** + pathogen-directed therapy — standard of care",
        "**Rifampin** for staph if hardware MUST be retained (transplant graft, prosthetic valve replacement contraindicated)",
        "Long course post-removal: **2–6 weeks** by organism + complications",
        "Coordinate with vascular surgery + ID for re-implantation timing",
      ],
      watchOut: [
        { sev: "stop", text: "**Rifampin monotherapy never** — emerges resistant within 1–2 weeks; always combine with active agent" },
        { sev: "warn", text: "**Rifampin interactions** — warfarin (↓ INR), OCPs, statins, immunosuppressants, antiretrovirals — drug-list review before start" },
        { sev: "note", text: "Suppressive oral therapy lifelong for irretrievable hardware (consult ID for regimen / monitoring)" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Per device + pathogen; explant typical; rifampin for retained hardware.",
    evidence: "Society consensus — explant drives outcomes; suppression for irretrievable",
    branches: [
      { label: "Port / line removed + targeted", days: "Per pathogen",
        detail: "Per CRBSI / SAB / CoNS bands depending on organism" },
      { label: "Graft / AVF / pacer-lead retained", days: "≥ 6 wk + rifampin",
        detail: "Add rifampin for staph; surgical removal preferred",
        matchAgent: /rifampin/i },
      { label: "Endocarditis-related device", days: "Per IE bands",
        detail: "TEE; surgery; per IE protocols" },
      { label: "Lifelong suppressive (irretrievable)", days: "Indefinite",
        detail: "Per ID + vascular surgery; oral monotherapy" },
    ],
    stopWhen: [
      "Device removed or stabilized on suppression",
      "Blood cultures cleared",
      "Afebrile",
      "Imaging shows resolution",
      "Minimum pathogen-specific duration completed",
    ],
    extendIf: [
      { text: "**Hardware retained** — extend per ID + vascular",
        matchCtx: { severe: true } },
      "Endocarditis — per IE bands",
      "Mycotic aneurysm — repair + extend",
      "Persistent BCx post-removal — endovascular workup",
    ],
  },
  monitoring: {
    headline: "Remove device when possible; rifampin for retained staph hardware; TEE.",
    items: [
      { sev: "required", what: "**Remove device** when feasible",
        why: "Biofilm + virulence drive failure with hardware in place" },
      { sev: "required", what: "**Vascular surgery consult** for graft / AVF / lead infection",
        why: "Surgical removal often necessary; complex revisions" },
      { sev: "required", what: "**TEE** for endocarditis / endovascular workup",
        why: "Standard for line + device-associated bacteremia" },
      { sev: "trigger", what: "**Rifampin combination** for staph + retained hardware",
        why: "Biofilm penetration; never empiric; LFT + interactions",
        matchAgent: /rifampin/i },
      { sev: "trigger", what: "**Lifelong suppression** if device irretrievable",
        why: "ID + vascular surgery decision; oral monotherapy" },
      { sev: "consider", what: "**Workup endocarditis source** for any device + bacteremia",
        why: "Hardware seeding from endocarditis vs vice-versa" },
    ],
  },
  rationale: {
    driver: "Vascular graft / CIED / LVAD / pacemaker infection is a hardware-biofilm disease — explant is the curative path, and antibiotics alone fail when the device stays in. Vascular surgery + ID coordination is mandatory at presentation; TEE is standard to identify endocarditis or lead-vegetation. Staphylococcal hardware retention requires rifampin combination (biofilm penetration; Zimmerli principle) plus a long IV β-lactam or vancomycin, with the minimum duration ≥ 6 wk and surgical removal preferred whenever feasible. Lifelong oral suppression is reserved for irretrievable hardware where the surgical risk outweighs the suppression risk — a case-by-case ID + vascular surgery + cardiac surgery decision.",
    guideline: "ie",
    rejected: "Empiric continuation of broad systemic therapy without surgical evaluation was deliberately rejected — biofilm on prosthetic material is not penetrated by systemic-alone dosing, and delayed explant in retrievable devices worsens outcomes substantially. Empiric rifampin before culture data was tempered: rifampin retains its role only for confirmed staph + retained hardware, and starting before susceptibilities are back risks rapid resistance selection on what may turn out to be a non-staph or fully removable infection." },
  objections: [
    { q: "Why explant the device — antibiotics alone might work?",
      a: "Vascular graft, CIED, LVAD, and pacemaker infection is a hardware-biofilm disease — explant is the curative path per AHA / HRS scientific statements and IDSA 2018 [cite:ie]. Antibiotic-only management fails when the device stays in because biofilm renders systemic-alone dosing inadequate, and the relapse rate is substantial. Vascular / cardiac surgery consultation is mandatory at presentation; delayed explant in retrievable devices worsens outcomes. Reserve antibiotic-only with lifelong suppression for genuinely irretrievable hardware (high surgical risk, anatomically inaccessible)." },
    { q: "Why rifampin for retained staph hardware — ARREST said no?",
      a: "The ARREST verdict (Lancet 2018, n=770) [cite:arrest] applies to native-valve SAB without hardware — rifampin retains its role in staphylococcal infection with retained prosthetic material per Zimmerli's biofilm principle and IDSA / AHA 2015 [cite:ie]. The drug penetrates biofilm-embedded staphylococci that vancomycin or β-lactam alone cannot reach. The cost-benefit flips when foreign material is the source: the drug-interaction + AE cost is justified by the biofilm-penetration benefit that does not exist in native-valve disease." },
    { q: "Why lifelong oral suppression — patient dependence concerns?",
      a: "Lifelong oral suppression is reserved for genuinely irretrievable hardware where surgical removal risk outweighs the suppression risk — a case-by-case ID + vascular surgery + cardiac surgery decision per IDSA 2018 [cite:ie]. Without continued antibiotics, relapse + recurrent rupture occur reliably from biofilm-resident organisms; with suppression, stability is achievable for years. Goals-of-care alignment, monitoring for drug toxicity (LFTs, renal), and quarterly ID follow-up are mandatory; suppression is a structured commitment, not a casual prescription." },
    { q: "Why TEE for any device + bacteremia — yield seems low?",
      a: "Device-associated bacteremia carries substantial endocarditis + lead-vegetation prevalence per AHA 2015 [cite:ie] — TEE finds vegetations that TTE misses in roughly one-third of cases, and identifies lead infection vs pocket infection vs endocarditis, each of which changes management. The procedural risk is low; the false-negative cost (missed IE → inadequate duration → relapse with hardware seeding) is high. TEE is standard at presentation, not selective; lead-extraction decisions depend on it." },
  ],
  research: {
    headline: "Explant drives outcomes; rifampin for retained staph hardware; lifelong suppression for irretrievable.",
    trials: [
      { name: "Karchmer Heart 1993",
        n: "Cohort",
        question: "Hardware retention vs explant outcomes",
        finding: "Explant when feasible; rifampin combination critical for retained staph; lifelong suppression for irretrievable",
        bias: "Pre-modern hardware; principle holds" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2018,
        topic: "Vascular device infection",
        keypoint: "Explant; rifampin for retained staph; TEE workup for source" },
    ],
    openQuestions: [
      "Lifetime suppression discontinuation — long-term stability",
      "Rifampin in MRSA-VDI — observational support",
    ],
  },
};

export default { id: "device-vascular", regimen, decision };
