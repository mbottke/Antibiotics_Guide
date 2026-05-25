/* ===========================================================
   SEPSIS — Febrile neutropenic. IDSA 2018 (Taplitz). 7 d standard
   once afebrile + ANC > 500 + source-controlled. ================= */

const regimen = {
  "Empiric monotherapy": [
    {
      rx: /cefepime/i,
      pickIf: "Hemodynamically stable febrile neutropenia, no prior ESBL.",
      whyPick: [
        "**IDSA first-line** monotherapy in febrile neutropenia (2018)",
        "**Excellent Pseudomonas** coverage, narrower than carbapenem",
        "No anaerobic activity — preserves gut microbiome more than pip-tazo",
        "**Renally cleared** — easy dose adjustment in tumor-lysis AKI",
      ],
      watchOut: [
        { sev: "warn", text: "**Cefepime neurotoxicity** if CrCl < 60 and dose not reduced" },
        { sev: "warn", text: "**No anaerobic cover** — add metronidazole for typhlitis / mucositis" },
        { sev: "note", text: "Stop at 48 h if afebrile, ANC recovering, cultures negative (per IDSA)" },
      ],
    },
    {
      rx: /piperacillin/i,
      pickIf: "Mucositis, typhlitis, or any suspicion of gut translocation.",
      whyPick: [
        "**Adds anaerobic cover** — useful in mucositis / typhlitis / abdominal source",
        "Equivalent efficacy to cefepime in stable febrile neutropenia",
        "Single agent covers gut anaerobes + Pseudomonas in one drug",
      ],
      watchOut: [
        { sev: "warn", text: "**Pip-tazo + vanco AKI** — if adding vanco, prefer cefepime backbone" },
        { sev: "warn", text: "Promotes **VRE selection** more than cefepime (anaerobic kill)" },
        { sev: "note", text: "ESBL inoculum effect — switch to meropenem if not improving" },
      ],
    },
    {
      rx: /meropenem/i,
      pickIf: "Prior ESBL, prior broad β-lactam in last 90 d, or critically ill.",
      whyPick: [
        "**ESBL workhorse** — reliable killing where pip-tazo / cefepime fail",
        "Covers gut anaerobes; broadest single-agent option",
        "Use in **septic shock** while colonization data return",
      ],
      watchOut: [
        { sev: "warn", text: "**↓ valproate** by 60–90% — never combine in epilepsy" },
        { sev: "warn", text: "Promotes **CRE selection** — narrow ASAP once cultures back" },
        { sev: "note", text: "Reserve for true ESBL / sepsis indication — stewardship-sensitive" },
      ],
    },
  ],
  "Add MRSA / resistant cover": [
    {
      rx: /vancomycin|MRSA|resistant/i,
      pickIf: "Catheter source, SSTI, pneumonia, hypotension, or hard MRSA colonization.",
      whyPick: [
        "**Add vancomycin** for the indications above — NOT for reflexive empiric breadth",
        "Add **resistant-GNR cover** by colonization history (carbapenem or novel β-lactam)",
        "**Stop the MRSA agent at 48 h** if cultures negative and source unidentified",
      ],
      watchOut: [
        { sev: "warn", text: "Reflexive vanco use → AKI + VRE selection without clinical benefit" },
        { sev: "warn", text: "**Linezolid > 14 d** in neutropenia worsens thrombocytopenia" },
        { sev: "note", text: "MRSA nares PCR negative → safe to drop vanco early" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "7 d once afebrile ≥ 48 h + ANC recovering; longer if documented bacteremia or source.",
    evidence: "IDSA 2018 (Taplitz) — discontinue when afebrile + ANC > 500; longer for documented infection",
    branches: [
      { label: "FUO, response by 48 h, ANC recovering", days: "7 d",
        detail: "Stop empirics when afebrile + ANC recovering (ANC > 500); no documented source" },
      { label: "Documented bacteremia", days: "7–14 d",
        detail: "BALANCE bands apply; from first negative BCx; pathogen-driven duration" },
      { label: "Documented deep infection (pneumonia, abscess)", days: "Per source",
        detail: "Treat per source-specific bands; ANC recovery doesn't shorten" },
      { label: "Persistent fever, ANC < 500", days: "Continue + workup",
        detail: "Add antifungal at day 4–7; reassess for occult source; ID consult" },
    ],
    stopWhen: [
      "Afebrile ≥ 48 h",
      "ANC > 500 and rising",
      "Cultures negative or appropriately treated",
      "Source controlled (line removed, abscess drained)",
      "Clinical improvement (off pressors, end-organ recovery)",
      "Minimum 7 d for documented infection",
    ],
    extendIf: [
      { text: "**Persistent fever** at day 4–7 → workup occult fungal / viral / abscess",
        matchCtx: { severe: true } },
      "Documented organism — extend per pathogen + source",
      "ANC < 100 + persistent fever — empiric antifungal addition",
      "Concurrent line / catheter retained — line removal preferred",
    ],
  },
  monitoring: {
    headline: "Daily BCx + fever curve + ANC; antifungal at day 4-7 persistent fever; line removal threshold low.",
    items: [
      { sev: "required", what: "**Blood cultures daily** until clearance / defervescence",
        why: "Documents pathogen + sterilization; positive at 48 h triggers source hunt" },
      { sev: "required", what: "**Daily ANC trend + fever curve**",
        why: "Trajectory drives duration decisions + antifungal trigger" },
      { sev: "required", what: "**Source workup** at day 2–3 if persistent fever",
        why: "Imaging, line assessment, fungal biomarkers (galactomannan, β-D-glucan)" },
      { sev: "trigger", what: "**Empiric antifungal** at day 4–7 persistent fever (caspofungin / voriconazole)",
        why: "Invasive fungal disease in 10–15% of persistent FUO; mortality benefit if early",
        matchCtx: { severe: true } },
      { sev: "trigger", what: "**Line removal** for line-related bacteremia or persistent positivity",
        why: "Biofilm + line source most common; antibiotic-only fails with hardware in place" },
      { sev: "trigger", what: "**G-CSF / pegfilgrastim** per protocol",
        why: "Shortens neutropenic period; reduces infection-related mortality" },
      { sev: "consider", what: "**Antiviral coverage** (CMV / influenza / COVID) if hemato/onc substrate",
        why: "Viral co-infection drives empiric failure; pcr panel + serology" },
    ],
  },
  rationale: {
    driver: "Profound neutropenia (ANC < 500) plus septic shock is the highest-acuity neutropenic-fever phenotype — translocation across chemo-injured mucosa seeds Gram-negative bacteremia within hours, and Pseudomonas is the historical mortality driver. IDSA 2018 (Taplitz / Freifeld) mandates monotherapy anti-pseudomonal β-lactam (cefepime, pip-tazo, or meropenem) within an hour, with vancomycin added selectively for septic shock, line-associated infection, skin/soft-tissue source, or MRSA colonization — NOT routinely. Empiric mold-active antifungal (echinocandin or voriconazole) is added at 96 h of persistent fever per Maertens (NEJM 2018) when invasive fungal disease occupies 10–15% of unresolved FUO. ANC recovery is the inflection point — G-CSF / pegfilgrastim per oncology protocol.",
    guideline: "fn",
    rejected: "Reflexive empiric vancomycin in every neutropenic-sepsis presentation was deliberately rejected — IDSA 2018 reserves vanco for shock, skin or line source, or known MRSA colonization, and routine inclusion drives AKI on the pip-tazo combination without mortality benefit. Empiric antifungal at admission was tempered — the 96-h trigger is anchored to invasive fungal prevalence rising only with prolonged unresolved fever (EORTC / MSGERC 2020); pre-emptive antifungal at admission selects resistant Candida and increases hepatotoxicity. Stopping empirics on ANC recovery alone, without afebrile criteria, was rejected." },
  objections: [
    { q: "Why empiric anti-pseudomonal β-lactam — even in stable presentations?",
      a: "Profound neutropenia (ANC < 500) plus fever is treated as Pseudomonas bacteremia until proven otherwise — chemo-injured GI mucosa seeds Gram-negative organisms within hours, and Pseudomonas drives historical mortality per IDSA 2018 [cite:fn]. Cefepime, pip-tazo, or meropenem within an hour is the survival lever, with vanco added selectively for shock, line source, or MRSA colonization. Withholding anti-pseudomonal cover pending culture data costs hours during the highest-mortality window." },
    { q: "Why no empiric vanco in stable neutropenic sepsis?",
      a: "IDSA 2018 [cite:fn] explicitly does NOT recommend routine empiric vancomycin — it reserves vanco for septic shock, suspected line or skin/soft-tissue source, hemodynamic instability, or known MRSA colonization. Reflexive inclusion on pip-tazo drives AKI without mortality benefit (Cometta NEJM 2003), and prolonged empiric vanco selects VRE. Use MRSA nares PCR + risk-based criteria to gate addition; de-escalate at 48 h if cultures negative + clinically stable." },
    { q: "Why wait 96 h before empiric mold-active antifungal?",
      a: "Maertens NEJM 2018 (SECURE) [cite:vfneo] and EORTC / MSGERC 2020 anchor the 96-h trigger because invasive fungal disease occupies only 10–15% of persistent neutropenic FUO, and pre-emptive antifungal at admission selects resistant Candida + drives hepatotoxicity without survival benefit per IDSA 2018 [cite:fn]. At 96 h of persistent fever despite anti-pseudomonal cover, add an echinocandin or voriconazole + galactomannan + chest CT. Galactomannan-driven pre-emptive strategies are an emerging alternative to time-based escalation." },
    { q: "Why echinocandin not fluconazole for empiric Candida cover?",
      a: "IDSA candidiasis guidance and the febrile-neutropenia algorithm [cite:fn] favor echinocandin (caspofungin, micafungin, anidulafungin) over fluconazole for empiric candidemia or invasive candidiasis in the unstable or azole-exposed host — fluconazole misses C. glabrata + C. krusei and has weaker activity at high inoculum. Echinocandins are cidal against most Candida, well-tolerated in renal and hepatic dysfunction, and have minimal drug interactions vs azoles. De-escalate to fluconazole once species + susceptibilities confirm a fluconazole-susceptible isolate." },
  ],
  research: {
    headline: "IDSA 2018 mandates anti-pseudomonal empiric; antifungal escalation at 96 h drives outcomes in persistent fever.",
    trials: [
      { name: "Freifeld IDSA 2010 / 2018",
        n: "Guideline",
        question: "Empiric strategy in febrile neutropenia",
        finding: "Single-agent anti-pseudomonal β-lactam adequate for low-risk; add vanco for shock + line infection + skin/soft-tissue; empiric antifungal at 96 h persistent fever",
        bias: "Guideline synthesis; risk-stratified" },
      { name: "Maertens NEJM 2018",
        n: "545",
        question: "Isavuconazole vs voriconazole for invasive aspergillosis (incl. neutropenic)",
        finding: "Isavuconazole non-inferior with fewer hepatic + visual AEs; CYP3A4 interactions less prominent",
        bias: "Industry-sponsored; isolated subgroup analyses" },
      { name: "EORTC / MSGERC 2020",
        n: "Consensus",
        question: "Invasive fungal disease criteria + empiric antifungal strategy",
        finding: "Galactomannan + 1,3-β-D-glucan + CT halo guide empiric vs targeted therapy; mold-active for persistent fever",
        bias: "Consensus criteria; subset clinical applicability" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2018,
        topic: "Neutropenic fever (Freifeld update)",
        keypoint: "Anti-pseudomonal β-lactam first-line; add vanco selectively; antifungal at 96 h persistent fever" },
      { society: "ASCO",
        year: 2018,
        topic: "Oncology neutropenia management",
        keypoint: "Risk-stratified outpatient vs inpatient management; G-CSF for prevention" },
    ],
    openQuestions: [
      "Optimal duration after ANC recovery — 5 vs 7 d post-recovery; institutional variation",
      "Empiric antifungal class selection — echinocandin vs azole vs amphotericin debated",
      "De-escalation timing — varies by clinical stability + culture data + neutrophil trajectory",
    ],
  },
};

export default { id: "sepsis-neutropenic", regimen, decision };
