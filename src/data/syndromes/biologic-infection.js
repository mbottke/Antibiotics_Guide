/* ===========================================================
   INFECTION ON BIOLOGIC / TARGETED IMMUNOTHERAPY — TNFi, JAKi,
   anti-CD20, anti-IL-6, checkpoint inhibitors; specific pathogen
   patterns by mechanism. ==================================== */

const regimen = {
  "Empiric": [
    {
      rx: /source-?directed|hold/i,
      pickIf: "Patient on biologic (TNF-α inhibitor, rituximab, JAK inhibitor) with infection.",
      whyPick: [
        "**Source-directed coverage** — pathogens by biologic class",
        "**Hold the biologic** during acute infection",
        "**Workup atypicals** — TB reactivation (TNF), Pneumocystis, fungi",
      ],
      watchOut: [
        { sev: "warn", text: "**Workup HBV reactivation** in rituximab" },
        { sev: "note", text: "Coordinate with rheumatology / oncology before resuming biologic" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Per pathogen + agent mechanism; hold biologic during active infection; coordinate with prescriber.",
    evidence: "Rheum + onc consensus — TNFi → granulomatous (TB, histo, coccidio); anti-CD20 → encapsulated + viral; checkpoint → ICI colitis mimics CDI",
    branches: [
      { label: "TNF-α inhibitor + granulomatous infection (TB, histo, coccidio)", days: "Per pathogen",
        detail: "Per TB / endemic mycosis bands; hold TNFi until controlled; ID + rheum coordination" },
      { label: "Anti-CD20 + bacterial / encapsulated infection", days: "Per pathogen + source",
        detail: "IVIG if hypogammaglobulinemia + recurrent; per infection bands" },
      { label: "JAK inhibitor + viral reactivation (HSV, VZV, HBV)", days: "Per pathogen",
        detail: "Antiviral per pathogen; HBV reactivation requires hold + suppressive antivirals" },
      { label: "Checkpoint inhibitor + ICI colitis (NOT CDI alone)", days: "Steroids ± infliximab",
        detail: "Distinguish from infection; steroid + immunomodulator if severe; per ICI toxicity bands" },
      { label: "Severe sepsis on any biologic", days: "Per pathogen + source",
        detail: "Broad empiric + hold biologic + ICU; coordinate with primary team",
        matchAgent: /piperacillin|meropenem|cefepime/i },
    ],
    stopWhen: [
      "Pathogen identified + treated per source",
      "Afebrile + clinical recovery",
      "Biologic resumption decision documented with prescriber",
      "Latent infection workup completed (TB, HBV) if not done",
      "Pathogen-specific minimum duration met",
    ],
    extendIf: [
      { text: "**Severe / disseminated** opportunistic infection — extend per ID",
        matchCtx: { severe: true } },
      "Latent TB / hepatitis B reactivation — extended antiviral / TB therapy",
      "Persistent immunosuppression — extend per host status",
      "Drug interactions limit options — extend per ID",
    ],
  },
  monitoring: {
    headline: "Hold biologic during infection; agent-mechanism drives differential; rheum / onc coordination.",
    items: [
      { sev: "required", what: "**Hold biologic** during active infection",
        why: "Continued biologic during infection delays recovery + increases dissemination risk" },
      { sev: "required", what: "**Document agent + mechanism** — TNFi vs anti-CD20 vs JAKi vs ICI",
        why: "Mechanism drives differential — granulomatous vs encapsulated vs viral vs ICI toxicity" },
      { sev: "required", what: "**Coordinate with prescriber** (rheum, onc, GI)",
        why: "Resumption decision requires balance of disease activity + infection resolution" },
      { sev: "trigger", what: "**Latent TB workup** before TNFi (IGRA + CXR)",
        why: "TNFi reactivates latent TB — standard pre-treatment screen; treat latent before starting" },
      { sev: "trigger", what: "**HBV screen + suppression** on rituximab or JAKi or anti-CD20",
        why: "Reactivation high mortality; HBsAg + anti-HBc screen; entecavir / TDF prophylaxis if positive" },
      { sev: "trigger", what: "**Differentiate ICI colitis from CDI**",
        why: "ICI colitis treated with steroids + infliximab; CDI treated with vancomycin / fidaxomicin; both possible together",
        matchBranch: ["Checkpoint inhibitor + ICI colitis (NOT CDI alone)"] },
      { sev: "trigger", what: "**Vaccination review** — inactivated safe, live contraindicated",
        why: "Standard during long-term biologic therapy; flu, pneumococcal, COVID, HBV" },
      { sev: "consider", what: "**Endemic mycosis exposure** review for TNFi (histo, coccidio, blasto)",
        why: "Disseminated disease in TNFi-exposed; geographic + occupational history" },
    ],
  },
  rationale: {
    driver: "Biologic-associated infection is a mechanism-driven differential — TNF-α inhibitors reactivate granulomatous disease (latent TB, histoplasmosis, coccidioidomycosis), anti-CD20 (rituximab) drives encapsulated bacterial + viral infection through hypogammaglobulinemia, JAK inhibitors reactivate VZV + HBV + HSV, and checkpoint inhibitors produce ICI colitis that mimics CDI but requires steroids + infliximab rather than antibacterials (Winthrop CID 2019). The bundled response is to identify the agent + mechanism, hold the biologic, coordinate with the prescribing rheum / onc / GI team, screen for latent TB and HBV that should have been excluded before initiation, and treat the unmasked infection per pathogen-specific bands.",
    guideline: "mono",
    rejected: "Continuing the biologic through active infection was deliberately rejected — Winthrop and the rheum / onc consensus uniformly anchor a hold-and-treat approach because continued mechanism-driven immunosuppression delays recovery and worsens dissemination. Treating ICI colitis as CDI (or vice versa) was tempered — both can coexist, but the toxicity-vs-infection distinction changes the regimen entirely (steroids + infliximab for ICI vs vanco / fidaxomicin for CDI). Skipping pre-treatment latent TB + HBV screening was rejected: TB reactivation on TNFi and HBV reactivation on rituximab or JAKi are both predictable, preventable, and high-mortality." },
  objections: [
    { q: "Why mycobacterial + endemic-mycosis workup on a TNF inhibitor?",
      a: "TNF-α is the central cytokine maintaining granuloma integrity — infliximab, adalimumab, etanercept destabilize existing granulomas and drive reactivation of latent TB, histoplasmosis, coccidioidomycosis, and blastomycosis per Winthrop CID 2019 [cite:mono]. IGRA + CXR are mandatory before initiation, with a low threshold for IGRA / urine antigen / fungal cultures at any febrile presentation on TNFi. Treating undifferentiated fever on a TNFi as routine bacterial workup misses the granulomatous reactivation that drives this class's signature mortality." },
    { q: "Why hold the biologic — won't the underlying disease flare?",
      a: "Continued mechanism-driven immunosuppression during active infection delays pathogen clearance and worsens dissemination — Winthrop and the rheum / onc consensus uniformly recommend hold-and-treat with resumption coordinated with the prescriber once infection is controlled [cite:mono]. Flare-risk is real but secondary; bridging with steroids or short-acting agents is preferable to continuing a TNFi, JAKi, or anti-CD20 through bacteremia or invasive fungal disease. Document the hold and resumption plan to avoid drift." },
    { q: "Why HBV screen before rituximab — patient denies risk factors?",
      a: "Anti-CD20 depletes B-cells for months and drives HBV reactivation rates of 20–50% in HBsAg-positive and 5–10% in anti-HBc-positive patients, with fulminant hepatitis mortality up to 30% per Winthrop CID 2019 [cite:mono] and AGA / ASCO guidance. Risk-factor history is unreliable — universal HBsAg + anti-HBc + anti-HBs screening before rituximab plus entecavir or TDF prophylaxis if positive is standard. JAKi carry a parallel signal for HBV + VZV reactivation. This is preventable, predictable mortality." },
    { q: "Why steroids — not antibiotics — for checkpoint-inhibitor colitis?",
      a: "Checkpoint-inhibitor colitis is immune-mediated tissue injury, not infection — pembrolizumab, nivolumab, ipilimumab unmask anti-self T-cell responses against GI mucosa, and the management algorithm is high-dose methylprednisolone with infliximab or vedolizumab rescue per Winthrop CID 2019 [cite:mono] and ASCO ICI toxicity guidance. Treating ICI colitis as CDI delays effective therapy and progresses to perforation. CDI and ICI colitis can coexist — test for both, but the empiric driver in a checkpoint-exposed patient is toxicity." },
  ],
  research: {
    headline: "Mechanism drives differential; TNFi → latent TB screen; anti-CD20/JAKi → HBV screen; checkpoint → ICI colitis vs CDI.",
    trials: [
      { name: "Winthrop CID 2019",
        n: "Cohort review",
        question: "Modern biologic-associated infection patterns",
        finding: "TNFi → TB + granulomatous; anti-CD20 → encapsulated + viral; JAKi → VZV / HBV reactivation; checkpoint → ICI colitis",
        bias: "Real-world signals consistent across registries" },
    ],
    guidelines: [
      { society: "Rheum / Onc consensus",
        year: 2023,
        topic: "Biologic infection management",
        keypoint: "Hold biologic + reduce IS; latent TB + HBV screen pre-treatment; vaccination review (avoid live)" },
    ],
    openQuestions: [
      "Biologic resumption timing — disease activity vs infection resolution",
      "ICI colitis vs CDI distinction — both can coexist",
    ],
  },
};

export default { id: "biologic-infection", regimen, decision };
