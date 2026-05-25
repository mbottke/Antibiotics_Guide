/* ===========================================================
   TYPHLITIS / NEUTROPENIC ENTEROCOLITIS — emergent in ANC < 500;
   broad-spectrum + supportive; surgery for perforation. ===== */

const regimen = {
  "Empiric": [
    {
      rx: /piperacillin|meropenem/i,
      pickIf: "Neutropenic enterocolitis (RLQ pain, fever, ANC < 500).",
      whyPick: [
        "**Pip-tazo or meropenem** — anaerobic + Pseudomonas coverage",
        "**Supportive care + bowel rest + NPO** drives recovery; granulocyte support indirectly via ANC recovery",
        "**Surgery threshold** — perforation, persistent bleeding, abscess, refractory pain despite ANC recovery",
      ],
      watchOut: [
        { sev: "warn", text: "**Differentiate from C. difficile** — symptom overlap; test stool early, treat empirically if pretest probability high" },
        { sev: "warn", text: "**G-CSF / pegfilgrastim** to shorten neutropenia is adjunctive — coordinate with oncology" },
        { sev: "note", text: "CT scan defines mural thickening + pericecal fluid; serial imaging if non-response in 48–72 h" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Until ANC recovers + clinical resolution; broad anti-pseudomonal + anaerobic; surgery for perforation.",
    evidence: "IDSA + oncology consensus — typhlitis in ANC < 500 high-mortality; broad-spectrum + bowel rest + surgery for failure",
    branches: [
      { label: "Typhlitis without perforation, responding", days: "Until ANC recovers",
        detail: "Pip-tazo or meropenem + bowel rest + supportive; reassess at ANC recovery",
        matchAgent: /piperacillin|meropenem/i },
      { label: "Persistent fever > 5 d on broad", days: "Add antifungal",
        detail: "Add empiric mold-active (echinocandin or vori or ampho); CT chest + abdomen" },
      { label: "Perforation / surgical emergency", days: "10–14 d + surgery",
        detail: "Emergent laparotomy + ICU; mortality high; ID + surgical oncology" },
      { label: "C. difficile co-infection (common)", days: "Per CDI bands",
        detail: "Oral vancomycin or fidaxomicin in addition to IV broad-spectrum typhlitis cover" },
      { label: "CMV reactivation (post-transplant)", days: "Per CMV bands",
        detail: "Ganciclovir or foscarnet; coordinate with transplant ID" },
    ],
    stopWhen: [
      "ANC > 500 + sustained for ≥ 48 h",
      "Afebrile + clinical recovery",
      "Bowel function returning + tolerating diet",
      "Imaging shows resolution",
      "Minimum 10–14 d completed (if perforation / surgery)",
    ],
    extendIf: [
      { text: "**Persistent neutropenia** — extend per recovery + clinical resolution",
        matchCtx: { severe: true } },
      "Perforation or abscess — surgical + extended",
      "Invasive fungal infection — per IFI bands",
      "GVHD or rejection — coordinate with transplant team",
    ],
  },
  monitoring: {
    headline: "CT abdomen at presentation; bowel rest; surgery for perforation; empiric antifungal for persistent fever.",
    items: [
      { sev: "required", what: "**CT abdomen / pelvis at presentation**",
        why: "Defines cecal / colonic wall thickening; identifies perforation + abscess + free air" },
      { sev: "required", what: "**Bowel rest + NG decompression** for severe disease",
        why: "Reduces bacterial translocation + intraluminal pressure; supportive core" },
      { sev: "required", what: "**Surgical consult** at presentation if severe / perforated",
        why: "Mortality high without surgery in perforation; serial reassessment if non-operative" },
      { sev: "required", what: "**Broad-spectrum coverage** — anti-pseudomonal + anaerobic + GPC",
        why: "Polymicrobial translocation; pip-tazo or meropenem + vancomycin per MRSA risk" },
      { sev: "trigger", what: "**C. difficile testing** at presentation",
        why: "Co-infection common; changes therapy + isolation" },
      { sev: "trigger", what: "**Empiric antifungal** if persistent fever > 5 d on broad",
        why: "Mold-active for invasive fungal infection in prolonged neutropenia",
        matchAgent: /caspofungin|micafungin|voriconazole|amphotericin/i },
      { sev: "trigger", what: "**G-CSF for ANC recovery acceleration**",
        why: "Reduces neutropenia duration; coordinate with oncology" },
      { sev: "trigger", what: "**Avoid colonoscopy / sigmoidoscopy in severe disease**",
        why: "Perforation risk in inflamed cecal wall; defer until ANC recovery" },
      { sev: "consider", what: "**ICU level care** for septic shock + multi-organ failure",
        why: "High-acuity substrate; pressor support + ventilation common" },
    ],
  },
  rationale: {
    driver: "Typhlitis (neutropenic enterocolitis) is a translocation disease driven by mucosal injury in profound neutropenia (ANC < 500) — chemotherapy-induced cecal/ileal breach lets enteric flora seed the bowel wall, producing polymicrobial transmural inflammation with mortality 30–50% in severe disease. Therapy combines broad anti-pseudomonal + anaerobic + Gram-positive cover (pip-tazo or meropenem, plus vancomycin if MRSA risk) per the IDSA 2018 neutropenic-fever framework, bowel rest with NG decompression, and CT abdomen at presentation to identify pneumatosis or perforation. Persistent fever > 96 h triggers empiric mold-active antifungal. Surgery is reserved for perforation or non-response; ANC recovery is the inflection point.",
    guideline: "fn",
    rejected: "Reflexive early laparotomy in non-perforated typhlitis was deliberately rejected — operating into profoundly neutropenic, edematous bowel carries prohibitive mortality, and Bow (CID 1998) plus the IDSA 2018 framework favor conservative management until ANC recovers, reserving surgery for perforation or non-response. Colonoscopy in active severe disease was tempered: the inflamed cecal wall is at high perforation risk; testing is deferred until ANC recovery. Empiric antifungal at admission was rejected — IDSA reserves mold-active therapy for persistent fever > 96 h on broad antibacterial coverage." },
  objections: [
    { q: "Why not surgery up front for severe typhlitis?",
      a: "Operating on neutropenic bowel (ANC < 500) without perforation has historically worsened outcomes — friable inflamed cecal wall, poor healing, and high anastomotic-leak rates. IDSA febrile neutropenia guidance [cite:fn] reserves emergent laparotomy for perforation, free air, uncontrolled bleed, or clinical deterioration on broad-spectrum therapy. Bowel rest + broad anti-pseudomonal + supportive care + serial reassessment is the bridge to ANC recovery; surgery is the bail-out, not first-line." },
    { q: "Why pip-tazo plus vanco — can't we narrow up front?",
      a: "Typhlitis is polymicrobial mucosal translocation in a neutropenic host — enteric GNR (including Pseudomonas), anaerobes, enterococci, and skin / line organisms (including MRSA) all contribute. IDSA 2018 [cite:fn] mandates anti-pseudomonal beta-lactam (pip-tazo, cefepime, or meropenem) plus vancomycin when MRSA risk or line involvement present. Narrowing before culture data + ANC recovery exposes the host to inadequate empiric coverage; the mortality slope from undercoverage in neutropenia is steep." },
    { q: "Why empiric antifungal at day 5 — patient still on broad?",
      a: "Persistent fever > 96 h on broad-spectrum antibacterial in profound neutropenia has a 30-40% rate of invasive fungal infection (Candida, Aspergillus, Mucor) — IDSA 2018 [cite:fn] mandates empiric mold-active therapy (echinocandin if Candida-dominant risk, voriconazole or liposomal amphotericin if mold risk). CT chest + abdomen to localize. Waiting for biopsy confirmation in this substrate loses days; empiric coverage at the 96-h trigger is the established standard." },
    { q: "Why test for C. difficile in every typhlitis admission?",
      a: "CDI co-infection with typhlitis is common — both occur in heavily-exposed neutropenic hosts, share symptoms (diarrhea, abdominal pain, fever, leukocytosis-of-recovery), and CDI changes therapy + isolation immediately. IDSA / SHEA 2021 [cite:cdi] testing threshold is liberal in this substrate; missed CDI means ongoing toxin-driven colitis under broad antibacterials that select for further C. difficile expansion. Stool PCR or GDH + toxin EIA at admission is standard." },
  ],
  research: {
    headline: "Broad anti-pseudomonal + ANC recovery + surgical for perforation; CT abdomen first; empiric antifungal for persistent fever.",
    trials: [
      { name: "Bow CID 1998",
        n: "Cohort",
        question: "Typhlitis (neutropenic enterocolitis) outcomes",
        finding: "Mortality 30–50% in severe disease; broad-spectrum + surgical for perforation drive outcomes; ANC recovery critical",
        bias: "Pre-modern oncology; supportive measures improved" },
      { name: "Freifeld IDSA 2010 / 2018",
        n: "Guideline",
        question: "Neutropenic fever including typhlitis",
        finding: "Anti-pseudomonal β-lactam first-line; broaden + empiric antifungal at 96 h persistent; surgery for perforation / non-response",
        bias: "Guideline synthesis" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2018,
        topic: "Neutropenic fever (Taplitz update)",
        keypoint: "Broad-spectrum + CT abdomen + surgical consult; empiric antifungal at 96 h" },
    ],
    openQuestions: [
      "Surgical thresholds — perforation + non-response by 96 h most agreed",
      "Routine antifungal empiric — IDSA reserves for persistent fever",
      "Optimal duration after ANC recovery — 7+ d post-recovery typical",
    ],
  },
};

export default { id: "typhlitis", regimen, decision };
