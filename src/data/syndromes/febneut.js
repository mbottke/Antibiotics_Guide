/* ===========================================================
   FEBRILE NEUTROPENIA — IDSA 2018 (Taplitz). Stop at ANC > 500
   + afebrile + cultures negative. ================================ */

const regimen = {
  "Empiric monotherapy": [
    {
      rx: /cefepime/i,
      pickIf: "Febrile neutropenia, hemodynamically stable, no ESBL history.",
      whyPick: [
        "**IDSA first-line monotherapy** (Taplitz 2018)",
        "**Cefepime 2 g IV q8h** — pseudomonal cover, narrower than carbapenem",
        "**Stop at 48 h** if afebrile + ANC recovering + cultures negative",
        "Stewardship-friendly — preserves carbapenems for documented ESBL",
      ],
      watchOut: [
        { sev: "warn", text: "**Cefepime neurotoxicity** if CrCl < 60 and dose not reduced — myoclonus, NCSE",
          matchCtx: { crcl: { lt: 60 } } },
        { sev: "warn", text: "**No anaerobic cover** — add metronidazole for mucositis / typhlitis / abdominal source" },
        { sev: "note", text: "MRSA cover should NOT be added empirically (Taplitz 2018) — wait for catheter / skin / pneumonia trigger" },
      ],
    },
    {
      rx: /piperacillin/i,
      pickIf: "Mucositis or typhlitis — anaerobic cover advantageous.",
      whyPick: [
        "**Adds anaerobic cover** — useful in mucositis / typhlitis / abdominal source",
        "**Single-agent broad coverage** — gut anaerobes + Pseudomonas in one drug",
        "**Equivalent efficacy** to cefepime in stable febrile neutropenia trials",
      ],
      watchOut: [
        { sev: "warn", text: "**Pip-tazo + vanco AKI signal** — favor cefepime backbone if vanco co-administered" },
        { sev: "warn", text: "Promotes **VRE selection** more than cefepime (anaerobic kill — gut flora disruption)" },
        { sev: "note", text: "ESBL inoculum effect — switch to meropenem if not improving by 72 h on appropriate dose" },
      ],
    },
    {
      rx: /meropenem/i,
      pickIf: "Prior ESBL, recent broad β-lactam, or critically ill.",
      whyPick: [
        "**ESBL workhorse** — reliable killing where pip-tazo / cefepime fail",
        "**Broad single-agent** — gut anaerobes + Pseudomonas + most enterococci",
        "**First-line in septic shock** while colonization / culture data return",
      ],
      watchOut: [
        { sev: "warn", text: "**↓ valproate by 60–90%** — never combine in epilepsy" },
        { sev: "warn", text: "**Promotes CRE selection** — narrow ASAP once cultures back; document stewardship indication" },
        { sev: "note", text: "Reserve for true ESBL / septic shock indication; non-CRE settings should default to cefepime / pip-tazo" },
      ],
    },
  ],
  "Add agents by indication": [
    {
      rx: /vancomycin|aminoglycoside/i,
      pickIf: "Catheter source, SSTI, pneumonia, septic shock, or known resistant GNR.",
      whyPick: [
        "**Add vancomycin** for catheter / skin / pneumonia / shock — NOT reflexively",
        "**Add aminoglycoside** for hemodynamic instability or known resistant GNR",
        "**Stop within 48 h** if cultures negative — every day of empiric breadth drives resistance + toxicity",
      ],
      watchOut: [
        { sev: "warn", text: "**Aminoglycoside duration > 72 h** → nephrotoxicity + ototoxicity rise sharply; pull at synergy band end" },
        { sev: "warn", text: "**Reflexive vanco use** without indication → AKI + VRE selection without clinical benefit (Taplitz 2018)" },
        { sev: "note", text: "MRSA nares PCR negative → safe to drop vanco early; treat negative result as actionable evidence" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Stop empirics when afebrile + ANC > 500; longer for documented infection.",
    evidence: "IDSA 2018 (Taplitz) — early-stop strategy; documented infection drives pathogen-specific duration",
    branches: [
      { label: "FUO, defervescence by 48 h", days: "Until ANC recovers",
        detail: "Stop empirics at afebrile + ANC > 500; no documented source" },
      { label: "Documented bacteremia", days: "Per pathogen",
        detail: "Treat per source-specific bands; BALANCE 7 d for GNR controlled" },
      { label: "Documented deep infection", days: "Per source",
        detail: "Pneumonia, abscess, line infection — per source-specific bands" },
      { label: "Persistent fever, ANC < 500", days: "Continue + workup",
        detail: "Empiric antifungal at day 4–7; reassess for occult source" },
    ],
    stopWhen: [
      "Afebrile ≥ 48 h",
      "ANC > 500 and rising",
      "Cultures negative or appropriately treated",
      "Source controlled (line removed, abscess drained)",
      "Clinical recovery",
      "Minimum 7 d for documented infection",
    ],
    extendIf: [
      { text: "**Persistent fever at day 4–7** — fungal workup + empiric antifungal",
        matchCtx: { severe: true } },
      "Documented organism — extend per pathogen",
      "ANC < 100 + prolonged neutropenia — extended course",
      "Line / hardware retained",
    ],
  },
  monitoring: {
    headline: "Daily BCx + fever + ANC; fungal workup day 4-7; G-CSF per protocol.",
    items: [
      { sev: "required", what: "**Blood cultures daily** until clearance / defervescence",
        why: "Documents pathogen + sterilization" },
      { sev: "required", what: "**Daily ANC + fever curve**",
        why: "Trajectory drives duration decisions + antifungal trigger" },
      { sev: "required", what: "**Source workup** at day 2–3 if persistent",
        why: "Imaging, line assessment, fungal biomarkers, viral PCR" },
      { sev: "trigger", what: "**Empiric antifungal at day 4–7** (caspofungin / voriconazole)",
        why: "Invasive fungal disease in 10–15%; mortality benefit if early" },
      { sev: "trigger", what: "**G-CSF / pegfilgrastim** per oncology protocol",
        why: "Shortens neutropenic period; reduces mortality" },
      { sev: "trigger", what: "**Line removal** for line-related or persistent bacteremia",
        why: "Biofilm + line source most common; antibiotic-only fails" },
      { sev: "consider", what: "**Antiviral coverage** (CMV / influenza / COVID)",
        why: "Viral co-infection drives empiric failure; PCR panel" },
    ],
  },
  rationale: {
    driver: "Febrile neutropenia (single temp ≥ 38.3 °C or sustained ≥ 38.0 °C with ANC < 500) is treated as bacteremia until proven otherwise — the chemo-injured GI mucosal barrier seeds Gram-negative organisms within hours, and Pseudomonas drives historical mortality. IDSA 2018 (Taplitz) anchors monotherapy anti-pseudomonal β-lactam (cefepime, pip-tazo, or meropenem) within an hour as the empiric backbone; vancomycin is added selectively for shock, line/skin source, or known MRSA. MASCC ≥ 21 + clinical stability + reliable follow-up identifies a low-risk subset eligible for oral outpatient management (Klastersky JCO 2000; Taplitz ASCO 2018). Persistent fever > 96 h triggers fungal workup (galactomannan, β-D-glucan, CT) + empiric mold-active antifungal.",
    guideline: "fn",
    rejected: "Routine empiric vancomycin in every febrile-neutropenic admission was deliberately rejected — IDSA 2018 reserves it for septic shock, line/skin source, or known MRSA colonization, and reflexive inclusion drives AKI on the pip-tazo combination without mortality benefit. Hospitalization of every febrile-neutropenic patient was tempered — MASCC ≥ 21 + clinical stability supports outpatient oral fluoroquinolone + amox-clav management (Taplitz ASCO 2018), and indiscriminate admission consumes resources and exposes patients to nosocomial flora. Reflexive antifungal at admission was rejected: the 96-h trigger is anchored to invasive fungal disease prevalence rising only with prolonged unresolved fever." },
  objections: [
    { q: "Why anti-pseudomonal β-lactam empirically — even when stable?",
      a: "Febrile neutropenia is treated as bacteremia until proven otherwise — the chemo-injured GI mucosal barrier seeds Gram-negative pathogens within hours, and Pseudomonas drives historical mortality per IDSA 2018 (Taplitz) [cite:fn]. Cefepime, pip-tazo, or meropenem within an hour of presentation is the survival lever. Monotherapy is adequate for the majority; combination therapy (β-lactam + aminoglycoside) does not add survival benefit in stable presentations per Cometta + multiple meta-analyses, and adds nephrotoxicity." },
    { q: "Why hospitalize every FN — MASCC ≥ 21 supports outpatient?",
      a: "Klastersky JCO 2000 (MASCC) [cite:mascc] and Taplitz ASCO 2018 [cite:taplitzfn] established that MASCC score ≥ 21 + clinical stability + reliable follow-up identifies a low-risk subset eligible for outpatient oral ciprofloxacin + amox-clav management with non-inferior outcomes and reduced cost. Indiscriminate inpatient admission of every FN consumes resources and exposes the patient to nosocomial flora. Risk-stratify at presentation; the low-risk pathway is evidence-based." },
    { q: "Why no routine empiric vancomycin?",
      a: "IDSA 2018 [cite:fn] reserves vanco for septic shock, suspected line / skin / soft-tissue source, hemodynamic instability, or known MRSA colonization — Cometta NEJM 2003 and subsequent trials show routine vanco addition does not improve mortality and increases AKI on the pip-tazo combination. Use MRSA nares PCR and risk-based criteria to gate addition. De-escalate at 48 h if cultures negative and clinically stable." },
    { q: "Why mold-active antifungal at 96 h — not earlier?",
      a: "Maertens NEJM 2018 [cite:vfneo] and EORTC / MSGERC 2020 anchor the 96-h trigger because invasive fungal disease occupies only 10–15% of persistent FUO. Pre-emptive antifungal at admission selects resistant Candida + drives hepatotoxicity without survival benefit per IDSA 2018 [cite:fn]. At 96 h of persistent fever despite anti-pseudomonal cover, add echinocandin or voriconazole + galactomannan + β-D-glucan + chest CT. Galactomannan-driven pre-emptive strategies are an emerging alternative." },
  ],
  research: {
    headline: "Stop at ANC > 500 + afebrile + cultures negative; oral step-down feasible in low-risk; antifungal at 96 h.",
    trials: [
      { name: "Taplitz IDSA 2018",
        n: "Guideline",
        question: "Modern febrile neutropenia management",
        finding: "Stop empirics when ANC > 500 + afebrile + cultures negative even before ANC recovery; documented infection drives pathogen-specific duration",
        bias: "Guideline synthesis" },
      { name: "Mikulska Lancet ID 2019",
        n: "Meta",
        question: "Empiric duration after defervescence in febrile neutropenia",
        finding: "Early stop (ANC < 500 still neutropenic but afebrile 72 h + cultures negative) non-inferior to long course",
        bias: "Pooled trials with heterogeneous severity" },
      { name: "Klastersky J Clin Oncol 2000 (MASCC)",
        n: "Cohort",
        question: "Risk-stratification for outpatient febrile neutropenia management",
        finding: "MASCC score ≥ 21 + clinical stability → outpatient oral management feasible; reduced cost without worsened outcomes",
        bias: "Pre-modern risk stratification; broadly validated" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2018,
        topic: "Neutropenic fever (Taplitz update)",
        keypoint: "Anti-pseudomonal β-lactam first-line; risk-stratified outpatient option; antifungal at 96 h persistent" },
      { society: "ASCO",
        year: 2018,
        topic: "Oncology neutropenia management",
        keypoint: "Aligned with IDSA; G-CSF for prevention; MASCC risk stratification" },
    ],
    openQuestions: [
      "Optimal duration after ANC recovery — 5 vs 7 d post-recovery debated",
      "Oral step-down threshold in stable febrile neutropenia — practice varies",
      "Routine vancomycin add — IDSA reserves for shock + skin / line source",
    ],
  },
};

export default { id: "febneut", regimen, decision };
