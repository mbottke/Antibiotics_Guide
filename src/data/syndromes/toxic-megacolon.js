/* ===========================================================
   TOXIC MEGACOLON — severe CDI or IBD; emergent surgery
   candidate; aggressive medical + ICU + surgical coordination. */

const regimen = {
  "Empiric": [
    {
      rx: /vancomycin.*metronidazole|fulminant/i,
      pickIf: "C. difficile fulminant with toxic megacolon or shock.",
      whyPick: [
        "**Oral/NG vancomycin 500 mg q6h + IV metronidazole 500 mg q8h**",
        "Add **rectal vancomycin** (500 mg in 100 mL NS as enema) if ileus",
        "**Surgery consult immediately** — subtotal colectomy if no response 24–48 h",
        "Add broad coverage if perforation suspected",
      ],
      watchOut: [
        { sev: "stop", text: "**Don't delay surgery** in toxic megacolon — mortality climbs hourly" },
        { sev: "warn", text: "Anti-diarrheal / opiate / anticholinergic — STOP all" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Aggressive medical + emergent surgical consult; per underlying (CDI vs IBD); ICU + colorectal surgery.",
    evidence: "ACG + IDSA — fulminant CDI or severe IBD complication; medical 48–72 h trial then surgery; mortality > 30% without timely surgery",
    branches: [
      { label: "Fulminant CDI", days: "Per CDI bands + surgery",
        detail: "Oral vancomycin 500 mg q6h + IV metronidazole + rectal vancomycin; emergent surgical consult",
        matchAgent: /vancomycin|metronidazole/i },
      { label: "Severe ulcerative colitis flare", days: "Per IBD + surgery",
        detail: "IV steroids + infliximab or cyclosporine; emergent surgical consult; GI + colorectal" },
      { label: "Refractory medical management (48–72 h)", days: "Emergent colectomy",
        detail: "Subtotal colectomy + ileostomy; preserves rectum for future reconstruction" },
      { label: "Perforation / sepsis", days: "Emergent colectomy",
        detail: "Emergent surgery + broad-spectrum + ICU; per intra-abdominal + sepsis bands",
        matchAgent: /piperacillin|meropenem/i },
    ],
    stopWhen: [
      "Surgical or medical resolution",
      "Colonic dilation resolved on serial imaging",
      "Afebrile + hemodynamically stable",
      "Underlying disease controlled (CDI eradicated or IBD in remission)",
      "Pathogen / disease-specific course completed",
    ],
    extendIf: [
      { text: "**Refractory medical management** — emergent surgery",
        matchCtx: { severe: true } },
      "Perforation — emergent surgery + sepsis bands",
      "Recurrent CDI post-recovery — per CDI recurrence bands",
      "Underlying IBD — long-term immunomodulation",
    ],
  },
  monitoring: {
    headline: "Colorectal surgery emergent; serial abdominal imaging; medical trial 48–72 h then surgery if refractory.",
    items: [
      { sev: "required", what: "**Colorectal surgery emergent consult**",
        why: "Surgery is the rescue; delay drives mortality; serial reassessment if non-operative trial" },
      { sev: "required", what: "**Serial abdominal X-ray or CT** q6–12h",
        why: "Colonic dilation > 6 cm + clinical deterioration → surgery; tracks medical response" },
      { sev: "required", what: "**ICU admission** + aggressive fluid resuscitation",
        why: "Distributive shock + electrolyte derangements; high-acuity substrate" },
      { sev: "trigger", what: "**Underlying-disease specific therapy** — oral vanco + IV metro (CDI) or IV steroids + biologic (IBD)",
        why: "Treat the cause; both pathways have evidence-based escalation" },
      { sev: "trigger", what: "**Avoid antimotility agents + opiates + anticholinergics**",
        why: "Worsen dilation + delay diagnosis of perforation; absolute avoidance" },
      { sev: "trigger", what: "**Emergent colectomy** if non-response by 48–72 h",
        why: "Mortality rises sharply with delay; subtotal colectomy + ileostomy standard" },
      { sev: "trigger", what: "**Broad-spectrum coverage if perforation suspected**",
        why: "Per intra-abdominal bands; cover anaerobes + GNR + GPC; pip-tazo or carbapenem" },
      { sev: "consider", what: "**FMT** for recurrent CDI post-recovery",
        why: "Reduces recurrence in fulminant CDI survivors; per CDI bands" },
    ],
  },
  rationale: {
    driver: "Toxic megacolon is a surgical-readiness ICU problem — Sayedy (World J Gastrointest Surg 2010) + Ananthakrishnan (Gut 2008) anchor a 48–72 h medical trial with explicit surgical reassessment thereafter, because mortality climbs > 30% with delayed colectomy. Fulminant CDI substrate gets oral vancomycin 500 mg q6h + IV metronidazole + rectal vancomycin (per IDSA / SHEA 2021); severe IBD flare gets IV steroids plus rescue infliximab or cyclosporine with GI + colorectal coordination. Refractory disease or perforation triggers emergent subtotal colectomy + end ileostomy, preserving the rectum for future reconstruction. Antimotility agents, opiates, and anticholinergics are absolutely contraindicated — they worsen dilation and delay perforation diagnosis.",
    guideline: "cdi",
    rejected: "Extended medical trial beyond 72 h without surgical reassessment was deliberately rejected — Ananthakrishnan + ACG 2021 anchor surgical timing on lactate, WBC, and radiographic dilation rather than a fixed clock, because each hour of delay compounds mortality. Antimotility agents for symptom control were absolutely rejected: loperamide, opiates, and anticholinergics mask the dilation trajectory and delay the perforation alarm, so the avoidance is non-negotiable regardless of patient discomfort." },
  objections: [
    { q: "Why PO vanco for fulminant CDI when ileus prevents PO?",
      a: "Fulminant CDI with ileus shifts to oral vancomycin 500 mg q6h via NG tube + rectal vancomycin enemas (500 mg in 100 mL saline q6h) plus IV metronidazole — IDSA / SHEA 2021 [cite:cdi] anchors this combination because IV vancomycin does NOT achieve colonic concentration and is ineffective. The rectal route delivers intracolonic drug directly. Fidaxomicin remains preferred when ileus is partial; the combined regimen rescues those with full ileus." },
    { q: "Why surgical consult at 24–48 h — give medical longer?",
      a: "Ananthakrishnan Gut 2008 [cite:cdi] showed mortality > 30% with delayed colectomy, and ACG 2021 anchors surgical reassessment on lactate, WBC, and radiographic dilation rather than a fixed clock. Subtotal colectomy + end ileostomy at 48–72 h non-response preserves the rectum for future reconstruction; waiting for perforation drives mortality past 50%. Colorectal surgery at the table, not on consult — the surgical alarm is symptom + lab + imaging-based [cite:ssc]." },
    { q: "Why avoid loperamide for symptomatic diarrhea control?",
      a: "Antimotility agents (loperamide, opiates, anticholinergics) are absolutely contraindicated in toxic megacolon — they mask the dilation trajectory and delay perforation alarm per IDSA / SHEA 2021 [cite:cdi]. Patient comfort cannot override the surgical safety gate. ACG 2021 retains this as non-negotiable regardless of distress. Hold all motility-slowing drugs at diagnosis; treat distress with anti-emetics and decompression instead." },
    { q: "Why broad pip-tazo if perforation suspected?",
      a: "Perforation converts toxic megacolon into intra-abdominal sepsis with polymicrobial peritoneal contamination — pip-tazo or carbapenem covers the GNR + anaerobe + enterococcal substrate per STOP-IT-aligned IAI bands [cite:stopit]. The CDI-targeted vancomycin / fidaxomicin must continue in parallel — neither covers the other [cite:cdi]. Source control via emergent colectomy is the dominant lever; antibiotics are adjunctive." },
  ],
  research: {
    headline: "Medical 48–72 h trial then colectomy; avoid antimotility + opiates; mortality > 30% without timely surgery.",
    trials: [
      { name: "Sayedy World J Gastrointest Surg 2010",
        n: "Cohort review",
        question: "Toxic megacolon — CDI vs IBD substrate outcomes",
        finding: "Medical trial 48–72 h appropriate; emergent subtotal colectomy + ileostomy if non-response or perforation",
        bias: "Single-center; signal replicated" },
      { name: "Ananthakrishnan Gut 2008",
        n: "Cohort",
        question: "CDI-related fulminant colitis colectomy outcomes",
        finding: "Mortality > 30% without timely colectomy; lactate + WBC + radiographic dilation drive surgical timing",
        bias: "U.S. cohort; signal replicated internationally" },
    ],
    guidelines: [
      { society: "ACG",
        year: 2021,
        topic: "Fulminant CDI + toxic megacolon (Kelly)",
        keypoint: "Combined oral vanco + IV metro + emergent surgical consult; FMT post-recovery for recurrent" },
    ],
    openQuestions: [
      "Optimal medical trial duration — 48–72 h most agreed",
      "Steroid use in IBD-driven toxic megacolon — biologic alternative",
      "Antimotility absolute contraindication — opiates + anticholinergics",
    ],
  },
};

export default { id: "toxic-megacolon", regimen, decision };
