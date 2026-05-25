/* ===========================================================
   SOT INFECTION — solid-organ transplant; time-from-tx + organ-
   specific patterns; drug interactions + reduce IS. ========== */

const regimen = {
  "Bacterial empiric": [
    {
      rx: /broad|antipseudomonal/i,
      pickIf: "Solid-organ transplant recipient with bacterial infection.",
      whyPick: [
        "**Tailor to transplant patient's prior cultures + recipient organ**",
        "**Pip-tazo or carbapenem** if severe",
        "Coordinate with transplant ID — many drug-immunosuppressant interactions",
      ],
      watchOut: [
        { sev: "warn", text: "**Cyclosporine / tacrolimus level monitoring** essential during/after abx" },
        { sev: "note", text: "FQ ↑ tacrolimus levels; rifampin ↓ levels dramatically" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Per pathogen + time-from-tx; coordinate with transplant ID; drug interactions + reduce IS.",
    evidence: "AST 2019 + IDSA — early (< 1 mo) bacterial / nosocomial; intermediate (1–6 mo) opportunistic; late (> 6 mo) community + community-acquired",
    branches: [
      { label: "Early (< 1 mo) — nosocomial + surgical site", days: "Per pathogen + source",
        detail: "Bacterial / MDR — cover per local antibiogram; per syndrome bands (UTI, pneumonia, SSI)" },
      { label: "Intermediate (1–6 mo) — opportunistic", days: "Per pathogen",
        detail: "CMV, PJP, fungal, BK virus — per pathogen-specific bands; coordinate with transplant ID" },
      { label: "Late (> 6 mo) — community + community-acquired", days: "Per syndrome bands",
        detail: "Per community-acquired pneumonia / UTI / SSTI bands; CMV reactivation if reduced IS" },
      { label: "Rejection episode + infection co-existing", days: "Per pathogen + IS",
        detail: "Coordinate transplant team + ID; balance treatment + IS reduction; adjust IS regimen during recovery" },
      { label: "Severe sepsis (any time point)", days: "Per pathogen + source",
        detail: "Broad empiric coverage; aggressive resuscitation; ICU + ID",
        matchAgent: /piperacillin|meropenem|cefepime/i },
    ],
    stopWhen: [
      "Pathogen identified + pathogen-specific duration met",
      "Cultures cleared",
      "Afebrile + clinical recovery",
      "Drug levels + interactions managed",
      "IS regimen stabilized",
    ],
    extendIf: [
      { text: "**Immunocompromised / high IS burden** — extend per ID + host status",
        matchCtx: { severe: true } },
      "Invasive fungal — per IFI bands (weeks to months)",
      "Rejection — coordinate with transplant team",
      "Drug interaction limits options — extend per ID",
    ],
  },
  monitoring: {
    headline: "Transplant ID + transplant team consult; drug interactions + IS reduction critical.",
    items: [
      { sev: "required", what: "**Transplant ID + transplant team consult** at presentation",
        why: "Drug interactions + IS management + organ-specific patterns require specialist input" },
      { sev: "required", what: "**Drug interaction screen** — tacrolimus, sirolimus, cyclosporine levels",
        why: "FQ ↑ tacrolimus; rifampin ↓; azoles ↑; many critical interactions" },
      { sev: "required", what: "**Time-from-tx + organ-specific pathogens**",
        why: "Drives differential diagnosis + empiric choice; early bacterial vs intermediate opportunistic vs late community" },
      { sev: "trigger", what: "**Reduce IS if feasible** per transplant team",
        why: "Single highest-impact intervention in transplant infection outcome" },
      { sev: "trigger", what: "**Workup CMV + EBV + BK virus** in intermediate-period fever",
        why: "Reactivation common; specific therapies — ganciclovir, rituximab, IS reduction" },
      { sev: "trigger", what: "**Prophylaxis adherence + breakthrough** review",
        why: "PJP, CMV, fungal prophylaxis often discontinued / missed; breakthrough common" },
      { sev: "trigger", what: "**Organ-specific imaging** — chest CT, abdominal US, allograft US",
        why: "Allograft pathology often presents subtly; imaging earlier than non-transplant" },
      { sev: "consider", what: "**Vaccination review** — live vaccines contraindicated post-tx",
        why: "Inactivated vaccines safe; live vaccines avoided; family + household vaccinations important" },
    ],
  },
  rationale: {
    driver: "SOT infection follows the Fishman time-from-transplant paradigm (NEJM 2007) — early (< 1 mo) is nosocomial / surgical, intermediate (1–6 mo) is opportunistic (CMV, PJP, invasive fungal, BK), and late (> 6 mo) is community-acquired with reactivation. The single highest-impact intervention is IS reduction, coordinated with the transplant team — antibiotic-only management without adjusting the immunosuppressive burden is consistently less effective (Singh Lancet ID 2020). Drug interactions dominate every choice: FQs and azoles raise tacrolimus / sirolimus levels, rifampin slashes them, and many empiric agents need TDM-driven adjustment. Transplant ID consult at presentation is mandated by AST 2019 and ISHLT 2020.",
    guideline: "fishman",
    rejected: "Treating SOT infection identically to immunocompetent infection was deliberately rejected — Fishman 2007 and AST 2019 anchor the differential to time-from-transplant and organ-specific patterns, and empiric coverage must broaden for nosocomial flora early or opportunistic pathogens (CMV, PJP, mold) in the intermediate window. Continuing baseline IS through severe sepsis without transplant-team coordination was tempered — Singh 2020 + AST anchor IS reduction as the single highest-impact intervention. Skipping prophylaxis-adherence review was rejected: breakthrough infection on missed or discontinued PJP / CMV / fungal prophylaxis is common and treatable, but only if recognized." },
  objections: [
    { q: "Why workup CMV / PJP / fungal in transplant fever — not just bacterial?",
      a: "Fishman NEJM 2007 [cite:fishman] time-from-transplant paradigm anchors the differential: early (< 1 mo) is nosocomial + surgical, intermediate (1–6 mo) is opportunistic (CMV, PJP, invasive aspergillosis, BK), and late (> 6 mo) is community with reactivation. AST 2019 mandates simultaneous workup for time-period-appropriate opportunistic pathogens at febrile presentation — empiric anti-bacterial cover alone misses the dominant intermediate-window pathogens. Order CMV PCR, β-D-glucan, galactomannan, BK PCR per window." },
    { q: "Why reduce immunosuppression — won't that drive rejection?",
      a: "Singh Lancet ID 2020 and AST 2019 anchor IS reduction (typically halve antimetabolite, drop steroids to maintenance, hold mTOR inhibitor) as the single highest-impact intervention in severe transplant infection per Fishman [cite:fishman]. Continued mechanism-driven immunosuppression through sepsis delays pathogen clearance and increases dissemination. Rejection risk during a 7–14 d reduction is low when coordinated with the transplant team; un-reduced IS through bacteremia or invasive fungal disease carries substantially higher mortality." },
    { q: "Why check tacrolimus levels before fluconazole or rifampin?",
      a: "Azoles (fluconazole, voriconazole, posaconazole, isavuconazole) inhibit CYP3A4 and raise tacrolimus + sirolimus levels two- to five-fold, driving nephrotoxicity and neurotoxicity; rifampin and rifabutin slash levels to subtherapeutic with rejection risk per Fishman NEJM 2007 [cite:fishman]. AST 2019 anchors mandatory pre-start TDM, empiric dose reduction (typically 50–75% for azoles), and daily levels for the first week. Pharmacy + transplant ID partnership is non-negotiable." },
    { q: "Why not pull the central line in a SOT CRBSI immediately?",
      a: "Standard CRBSI guidance (Mermel IDSA 2009) [cite:crbsi_g] mandates line removal for S. aureus, Pseudomonas, Candida, or persistent bacteremia — and this principle applies to SOT recipients too, often with lower threshold given immunosuppression. Lock-therapy salvage may be considered for tunneled lines with non-virulent organisms and salvage need, but Fishman 2007 [cite:fishman] and AST 2019 anchor early removal for high-virulence pathogens; antibiotic-only management with retained hardware fails predictably in the SOT host." },
  ],
  research: {
    headline: "Time-from-tx + organ-specific patterns drive differential; IS reduction is the single highest-impact intervention.",
    trials: [
      { name: "Fishman NEJM 2007",
        n: "Review",
        question: "Time-from-tx infection paradigm",
        finding: "Early (< 1 mo) nosocomial / surgical; intermediate (1–6 mo) opportunistic (CMV / PJP / fungal / BK); late (> 6 mo) community + reactivation",
        bias: "Pre-modern prophylaxis era; principle holds with adjustments" },
      { name: "AST Infectious Diseases CCT 2019",
        n: "Guideline",
        question: "Comprehensive solid-organ transplant infection management",
        finding: "Coordinated transplant-ID + transplant-team management drives outcomes; drug interactions + IS reduction critical",
        bias: "Guideline synthesis" },
      { name: "Singh Lancet ID 2020",
        n: "Cohort",
        question: "Empiric coverage adequacy in SOT sepsis",
        finding: "Broad coverage + reduce IS + ID consult improves outcomes; antibiotic-only without IS adjustment less effective",
        bias: "Observational; selection bias possible" },
    ],
    guidelines: [
      { society: "AST",
        year: 2019,
        topic: "Transplant infectious diseases (Razonable update)",
        keypoint: "Time-from-tx + organ-specific empiric; drug interactions; IS reduction during severe infection" },
      { society: "ISHLT",
        year: 2020,
        topic: "International heart/lung transplant infection",
        keypoint: "Aligned with AST; emphasizes CMV/EBV/BK virus monitoring + prophylaxis adherence" },
    ],
    openQuestions: [
      "Prophylaxis duration after transplant — CMV / PJP / fungal vary by organ",
      "Optimal IS reduction during sepsis — case-by-case",
      "Vaccination timing pre + post tx — live vaccines contraindicated post-tx",
    ],
  },
};

export default { id: "sot-infection", regimen, decision };
