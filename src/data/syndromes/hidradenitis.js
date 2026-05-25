/* ===========================================================
   HIDRADENITIS SUPPURATIVA (acute flare) — chronic immune-mediated;
   antibiotics adjunctive; biologics + surgical core. ========= */

const regimen = {
  "Acute flare": [
    {
      rx: /drainage|doxycycline|clindamycin.*rifampin/i,
      pickIf: "Hidradenitis flare with fluctuant lesions or moderate inflammation.",
      whyPick: [
        "**Drainage of fluctuant lesions** is primary",
        "**Doxycycline** for mild-moderate disease (anti-inflammatory + antibacterial)",
        "**Clindamycin + rifampin × 10 weeks** for moderate-severe",
        "Refer dermatology for chronic management — biologics (adalimumab, secukinumab)",
      ],
      watchOut: [
        { sev: "warn", text: "**Rifampin interactions** — many drugs (warfarin, OCPs)" },
        { sev: "note", text: "Smoking + obesity worsen disease — modifiable factors" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "10–14 d antibiotics for acute flare; chronic suppression + adalimumab + surgery for definitive control.",
    evidence: "Dermatology consensus — combination antibiotics for moderate-severe; adalimumab approved for Hurley II/III; antibiotics adjunctive",
    branches: [
      { label: "Mild flare, single lesion", days: "10–14 d",
        detail: "Doxycycline 100 mg BID or clindamycin; topical clindamycin adjunct",
        matchAgent: /doxycycline/i },
      { label: "Moderate-severe (Hurley II/III)", days: "10–12 wk combination",
        detail: "Clindamycin + rifampin 10–12 wk; coordinate with derm; biologic candidate evaluation",
        matchAgent: /rifampin/i },
      { label: "Acute abscess (drained)", days: "7–10 d post-I&D",
        detail: "I&D + short course; consider deroofing for recurrent sites; surgical referral" },
      { label: "Refractory / Hurley III", days: "Per derm + surgery",
        detail: "Adalimumab + surgical excision (wide local or deroofing); chronic suppression" },
    ],
    stopWhen: [
      "Flare resolved (acute episode)",
      "Drainage / I&D wound healing",
      "Combination course completed (if moderate-severe)",
      "Chronic regimen / biologic plan in place",
      "Surgical plan documented if Hurley II/III",
    ],
    extendIf: [
      { text: "**Hurley II/III with sinus tracts / scarring** — combination + surgical referral",
        matchCtx: { severe: true } },
      "Recurrent disease — chronic suppression + biologic",
      "Secondary bacterial infection — extend per pathogen",
      "Pilonidal / perianal involvement — surgical excision",
    ],
  },
  monitoring: {
    headline: "Dermatology + biologic consult for moderate-severe; surgical for refractory; address smoking + obesity.",
    items: [
      { sev: "required", what: "**Dermatology referral** for moderate-severe disease",
        why: "Chronic immune-mediated; long-term management requires specialty care; biologic candidate evaluation" },
      { sev: "required", what: "**Hurley staging** at presentation — I (nodules) / II (sinus tracts) / III (interconnected)",
        why: "Drives treatment intensity + surgical decision" },
      { sev: "trigger", what: "**Combination clinda + rifampin × 10–12 wk** for moderate-severe",
        why: "Disease-modifying course; reduces lesion count + inflammation",
        matchAgent: /clindamycin|rifampin/i },
      { sev: "trigger", what: "**Adalimumab evaluation** for Hurley II/III",
        why: "FDA-approved; significant reduction in flare frequency + lesion count" },
      { sev: "trigger", what: "**Surgical excision / deroofing** for chronic sinus tracts",
        why: "Definitive for localized disease; complement to medical therapy" },
      { sev: "trigger", what: "**Smoking cessation + weight management**",
        why: "Strongest modifiable risk factors; smoking ↑ flare rate + severity" },
      { sev: "consider", what: "**Topical clindamycin + chlorhexidine wash** for chronic suppression",
        why: "Reduces colonization + flare frequency" },
      { sev: "consider", what: "**Hormonal + metabolic workup** — PCOS, insulin resistance",
        why: "Common comorbidities; addressable" },
    ],
  },
  rationale: {
    driver: "Hidradenitis suppurativa is a chronic immune-mediated disease of the follicular epithelium — antibiotics are adjunctive, not curative. Mild flares get doxycycline or clindamycin × 10–14 d; moderate-severe disease (Hurley II/III) gets combination clindamycin + rifampin × 10–12 wk as disease-modifying therapy (Gulliver JEAD 2016 — reduces lesion count + flare frequency, not just suppressive). Adalimumab is FDA-approved for Hurley II/III, and surgical excision / deroofing addresses chronic sinus tracts. Smoking cessation + weight management are the strongest modifiable risk factors — addressable at every visit.",
    guideline: "ssti",
    rejected: "Treating HS as a simple bacterial abscess disease was deliberately rejected — it is chronic immune-mediated follicular pathology, not primarily infectious, and reflexive short antibiotic courses without dermatology referral + biologic evaluation in moderate-severe disease miss the disease-modifying window. Surgical excision as monotherapy was tempered: medical + surgical combination is standard for Hurley II/III; isolated excision recurs without systemic therapy. Long-term prophylactic monotherapy with single-agent antibiotics drives resistance without the combination's disease-modifying signal." },
  objections: [
    { q: "Why combination clindamycin plus rifampin for 10–12 weeks?",
      a: "Hidradenitis suppurativa is an immune-mediated follicular disease, not a primary infection; Gener and subsequent cohorts show clindamycin-rifampin combination reduces lesion counts and induces remission over 10–12 weeks. Single-agent or short courses underperform. Pair with surgical and biologic therapy (adalimumab) for moderate-severe disease [cite:mono]." },
    { q: "Why not just incise and drain every flare?",
      a: "Simple I&D provides short-term relief but high recurrence; definitive surgical excision or deroofing of sinus tracts is the durable answer for Hurley II–III disease. Antibiotics treat acute infection and suppress inflammation, but cure requires surgery plus immunomodulation. Multidisciplinary care beats serial drainage [cite:mono]." },
    { q: "Why screen for smoking, obesity, and metabolic syndrome?",
      a: "Smoking and obesity are strongly associated with hidradenitis severity and recurrence; weight reduction and smoking cessation reduce disease activity. Metabolic syndrome and depression co-cluster and worsen outcomes. Disease control requires addressing modifiable comorbidities, not just antibiotic prescribing [cite:mono]." },
  ],
  research: {
    headline: "Disease-modifying combination (clinda + rifampin) + adalimumab for moderate-severe; smoking + obesity strongest risk factors.",
    trials: [
      { name: "Gulliver J Eur Acad Dermatol 2016",
        n: "RCT meta",
        question: "Combination clinda + rifampin × 10–12 wk for HS",
        finding: "Reduces lesion count + flare frequency in Hurley II/III; disease-modifying not just suppressive",
        bias: "Heterogeneous severity scoring" },
    ],
    guidelines: [
      { society: "Dermatology consensus",
        year: 2020,
        topic: "Hidradenitis suppurativa",
        keypoint: "Combination antibiotics for moderate; adalimumab for Hurley II/III; surgery for chronic sinus tracts" },
    ],
    openQuestions: [
      "Optimal biologic sequencing — adalimumab → secukinumab",
      "Surgical vs medical for severe — combined typical",
    ],
  },
};

export default { id: "hidradenitis", regimen, decision };
