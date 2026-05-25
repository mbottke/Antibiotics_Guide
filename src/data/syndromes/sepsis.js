/* data · syndromes/sepsis — community / undifferentiated sepsis.
   Surviving Sepsis 2021 + BALANCE 2024 drive the duration story.
   Source control is the determining factor; antibiotic duration is
   the second decision behind it.

   Migrated from regimenContent.js + syndromeDecision.js in Wave 5
   PR-1 (sentinel pattern). Module shape documented in cystitis.js.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

const regimen = {
  "Broad empiric": [
    {
      rx: /antipseudomonal|piperacillin|cefepime|meropenem/i,
      pickIf: "Septic shock / severe sepsis — pick ONE β-lactam, give in Hour-1.",
      whyPick: [
        "**Pip-tazo** — broadest community cover (gut anaerobes + Pseudomonas)",
        "**Cefepime** — cleanest Pseudomonas; no anaerobes; pair with metronidazole if gut source",
        "**Meropenem** — pick if **prior ESBL** or recent broad β-lactam exposure",
        "All three: **extended-infusion** at MIC ≥ 4 mg/L; **load full dose** even with AKI",
        "Add **vancomycin** for hypotension, indwelling line, prior MRSA, recent admission",
      ],
      watchOut: [
        { sev: "stop", text: "**Anaphylaxis to penicillin** — cefepime/meropenem OK; pip-tazo avoid" },
        { sev: "warn", text: "**Pip-tazo + vancomycin → AKI** signal (RR ~1.5); use cefepime if renal-fragile" },
        { sev: "warn", text: "**Cefepime neurotoxicity** if CrCl < 60 and dose not reduced — myoclonus, NCSE" },
        { sev: "warn", text: "**Meropenem ↓ valproate levels** by 60–90% — seizure risk in epilepsy" },
        { sev: "note", text: "**De-escalate at 48–72 h** once cultures back; don't ride the broad regimen" },
      ],
    },
  ],
  "Add MRSA": [
    {
      rx: /vancomycin|linezolid/i,
      pickIf: "Hypotension, indwelling line, prior MRSA, or recent hospitalization.",
      whyPick: [
        "**Vancomycin** — first-line; cheap, bactericidal, IDSA AUC 400–600 target",
        "**Linezolid** alternative for **VRE** coverage or vancomycin failure / intolerance",
        "Load **25–30 mg/kg ABW** vancomycin once for septic shock — don't underdose",
        "Stop the MRSA agent at 48 h if MRSA nares **negative** and no source",
      ],
      watchOut: [
        { sev: "warn", text: "**Vanco + pip-tazo AKI signal** — monitor SCr q24h; consider cefepime backbone" },
        { sev: "warn", text: "**Vanco AUC > 600** — nephrotoxicity rises sharply; trough alone underdoses" },
        { sev: "stop", text: "**Linezolid + SSRI/MAOI** — serotonin syndrome; stop SSRI or switch agent" },
        { sev: "warn", text: "**Linezolid > 14 d** — cytopenias, peripheral + optic neuropathy, lactic acidosis" },
        { sev: "note", text: "**MRSA nares PCR NPV ~96%** for pneumonia — discontinue early if negative" },
      ],
    },
  ],
  "Add resistant-GNR cover": [
    {
      rx: /carbapenem|novel/i,
      pickIf: "Prior ESBL/CRE/Pseudomonas isolate, recent abroad travel, ICU exposure.",
      whyPick: [
        "**Meropenem** — ESBL workhorse; bactericidal, CSF-penetrating, broadly used",
        "**Ceftolozane-tazo / ceftaz-avi / imipenem-relebactam** — for DTR-Pseudomonas, KPC-CRE",
        "Pick the **novel β-lactam** that matches the colonizing mechanism (KPC vs MBL vs OXA)",
        "Get ID on board early — drug selection determines mortality in CRE bacteremia",
      ],
      watchOut: [
        { sev: "warn", text: "**Meropenem ↓ valproate** by 60–90% — never combine in epilepsy" },
        { sev: "warn", text: "**Imipenem seizure** risk in CrCl < 30; meropenem cleaner" },
        { sev: "stop", text: "**MBL producers** (NDM, IMP, VIM) — ceftaz-avi inactive; aztreonam + ceftaz-avi or cefiderocol" },
        { sev: "note", text: "**Carbapenem-sparing** in ESBL UTI: pip-tazo at MIC ≤ 16 acceptable (MERINO debate)" },
        { sev: "note", text: "**Antibiogram-driven** — never empiric without colonization data or ID input" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "7 d after source control for most bacteremic sepsis; longer if endovascular / immunocompromised / undrained.",
    evidence: "BALANCE 2024 (NEJM) — 7 vs 14 d non-inferior in controlled-source GNR bacteremia; Yahav 2019 same pattern",
    branches: [
      { label: "Source controlled, stable bacteremia", days: "7 d",
        detail: "From first negative BCx; BALANCE bands cover community + healthcare GNR bacteremia" },
      { label: "Endovascular / undrained source", days: "14–28 d",
        detail: "From source control if achievable; otherwise from clinical clearance; ID input drives the call" },
      { label: "Immunocompromised host", days: "14 d",
        detail: "Neutropenia, transplant, biologic — extend to cover delayed clearance + relapse risk" },
      { label: "Septic shock — slower kinetics", days: "10–14 d",
        detail: "Persistent SIRS / vasopressor need at day 5 → consider extended course + source reassessment" },
    ],
    stopWhen: [
      "Source controlled (drainage / removal / source-directed therapy)",
      "All blood cultures negative ≥ 48 h",
      "Afebrile ≥ 48 h",
      "Off vasopressors; lactate normalized",
      "Clinical improvement (WBC trending, end-organ recovery)",
      "Minimum 7 d from first negative BCx if bacteremic",
    ],
    extendIf: [
      "Persistent bacteremia > 48 h on appropriate therapy",
      "Undrained / unidentified source",
      { text: "**Endocarditis or endovascular infection** confirmed — 4–6 wk regimen replaces sepsis duration" },
      { text: "**Severe shock / multi-organ failure** at presentation — extend to 10–14 d",
        matchCtx: { severe: true } },
      /* "Immunocompromised host" — bullet stays visible at default
         emphasis. No matchCtx because the case parser does not yet
         capture an immune-status field (neutropenia, transplant,
         biologic, chronic steroid). Adding a future `immunocompromised`
         ctx field would enable elevation here without changing the
         text. Using mrsaRisk / esblRisk as proxies would be
         clinically misleading (resistance-history flags ≠ immune
         status), per PR #11 review feedback. */
      "**Immunocompromised host** — neutropenia, transplant, biologic; extend minimum to 14 d",
    ],
  },
  monitoring: {
    headline: "BCx q48h, lactate trend, source workup, narrow-on-cultures by day 3.",
    items: [
      { sev: "required", what: "**Blood cultures q48h** until clearance documented",
        why: "Persistent BCx triggers endovascular workup + source re-search" },
      { sev: "required", what: "**Lactate clearance** within first 6 h; serial monitoring until normalized",
        why: "Lactate trend predicts mortality independent of antibiotic response" },
      { sev: "required", what: "**Source workup** — imaging, line/catheter assessment, surgical eval as indicated",
        why: "Antibiotic failure most often reflects untreated source, not wrong drug" },
      { sev: "required", what: "**Narrow + de-escalate at 48–72 h** on culture data",
        why: "Continued broad therapy drives resistance + collateral damage without benefit" },
      { sev: "trigger", what: "**TEE within 5–7 d** if S. aureus / enterococcal / candidemia",
        why: "Endocarditis changes duration to 4–6 wk + may need surgery",
        matchAgent: /vancomycin|cefazolin|ampicillin|daptomycin/i },
      { sev: "trigger", what: "**Daily SCr** while on vanco + pip-tazo (AKI signal)",
        why: "Combination AKI rate RR ~1.5; consider cefepime substitution",
        matchCtx: { any: [{ crcl: { lt: 60 } }, { age: { gte: 75 } }] } },
      { sev: "trigger", what: "**Bedside dialysis coordination** for HD patients on antibiotics",
        why: "Dialytic clearance fundamentally alters dosing; ID + nephrology partnership",
        matchCtx: { hd: true } },
      { sev: "consider", what: "Procalcitonin trend (Q48h) if duration debate at day 5+",
        why: "Falling PCT supports shorter course; rising PCT supports source re-eval" },
      { sev: "consider", what: "MRSA nares PCR at presentation — guides empiric narrowing",
        why: "Negative result enables early vanco stop in non-pneumonic sepsis",
        matchAgent: /vancomycin/i },
    ],
  },
  rationale: {
    driver: "Sepsis mortality is driven by speed + adequacy of early therapy plus source control — every hour delay raises mortality, and inadequate empiric coverage doubles it. The empiric backbone covers the substrate (community → broad β-lactam; HCAQ → anti-pseudomonal + MRSA); duration follows BALANCE — 7 d for source-controlled GNR bacteremia, longer only if endovascular, undrained, or immunocompromised. Daily reassessment with mandated de-escalation at 48–72 h is the stewardship contract.",
    guideline: "ssc",
    rejected: "Empiric vancomycin + pip-tazo is deliberately tempered when alternatives fit — the combination roughly doubles AKI risk vs cefepime + vancomycin without survival benefit. Reflexive 14-d duration was rejected by BALANCE: 7 d non-inferior in controlled-source GNR bacteremia, so the default is now short with a defined stop date." },
  objections: [
    { q: "Why 7 d and not 14 d for bacteremic sepsis?",
      a: "BALANCE (NEJM 2025, n=3,608) established 7 d non-inferior to 14 d for 90-d mortality (14.5% vs 14.4%) in source-controlled bloodstream infection, including most GNR bacteremia [cite:balance]. The default is now short with a defined stop date once source is controlled. Reserve 14+ d only for endovascular focus, undrained source, S. aureus bacteremia, or immunocompromise — where BALANCE excluded patients." },
    { q: "Why vanco + cefepime instead of vanco + pip-tazo?",
      a: "Observational data (Luther 2018 meta, Schreier 2022) show vanco + pip-tazo roughly doubles AKI vs vanco + cefepime or vanco + meropenem, with no survival benefit — debate continues over assay interference vs true injury [cite:ssc]. When both broad-Gram-negative and MRSA cover are needed, cefepime is the safer β-lactam pairing. Reserve pip-tazo when anaerobic coverage is the decisive feature." },
    { q: "Why broad empirics — can't we wait for cultures?",
      a: "Surviving Sepsis 2021 mandates antibiotics within 1 h of suspected septic shock (Class I) — Kumar's 2006 cohort showed each hour delay raises mortality ~7%, and inadequate empiric coverage roughly doubles it [cite:ssc]. The empiric breadth is matched to the substrate (community → ceftriaxone backbone; HCAQ → anti-pseudomonal + MRSA) and narrowed aggressively at 48-72 h on culture data — daily de-escalation review is the stewardship contract." },
    { q: "Why MRSA cover empirically in a stable host?",
      a: "MRSA cover is added empirically only when risk factors are present — recent broad antibiotic exposure (90 d), prior MRSA isolate, healthcare exposure, IVDU, or septic shock with skin/soft-tissue source [cite:ssc]. Reflexive vancomycin in low-risk community sepsis invites AKI from the pip-tazo combination without clinical benefit. MRSA nares PCR (NPV ~96% for non-pulmonary sources) enables 24-48 h vanco stop when negative." },
  ],
  research: {
    headline: "BALANCE 2024 established 7-day non-inferiority in controlled-source GNR bacteremia; source control remains paramount.",
    trials: [
      { name: "BALANCE NEJM 2024",
        n: "3,608",
        question: "7 vs 14 d antibiotic duration in GNR bacteremia",
        finding: "7 d non-inferior to 14 d at the 4% margin for 90-d mortality; supports short course in controlled-source sepsis",
        bias: "Excluded immunocompromised + endovascular focus; results don't generalize there" },
      { name: "Yahav CID 2019",
        n: "604",
        question: "7 vs 14 d in GNR bacteremia (Israeli cohort)",
        finding: "7 d non-inferior; first major RCT in short-course GNR bacteremia; foundation for BALANCE design",
        bias: "Single-region cohort; underrepresented Pseudomonas + ESBL" },
      { name: "Surviving Sepsis Campaign 2021",
        n: "Guideline",
        question: "Hour-1 antibiotic delivery + bundle compliance",
        finding: "Hour-1 antibiotic + lactate + cultures + 30 ml/kg fluid + vasopressors — each component independently associated with reduced mortality",
        bias: "Bundle compliance + selection effects; mortality benefit replicated across registries" },
      { name: "PROCESS / ARISE / PROMISE 2014–15",
        n: "4,179 (combined)",
        question: "Early goal-directed therapy vs usual care",
        finding: "EGDT non-superior in modern usual care; shifted focus to early antibiotics + lactate + fluids without invasive monitoring",
        bias: "Replicated across three continents; high-quality evidence" },
    ],
    guidelines: [
      { society: "SSC",
        year: 2021,
        topic: "Surviving Sepsis Campaign (Evans)",
        keypoint: "Hour-1 antibiotics + 30 ml/kg fluid + vasopressors for MAP < 65; norepinephrine first-line vasopressor" },
      { society: "IDSA",
        year: 2024,
        topic: "Empiric antibiotic selection in sepsis (Tamma)",
        keypoint: "Tailor empiric coverage to local antibiogram + host risk; de-escalate at 48–72 h on culture data" },
      { society: "ATS",
        year: 2023,
        topic: "Sepsis quality bundles",
        keypoint: "Implementation of bundles drives population-level mortality reduction; CMS SEP-1 metric standardizes" },
    ],
    openQuestions: [
      "Vasopressin as first-line vs norepinephrine — observational + small RCTs suggest equivalent",
      "Restrictive vs liberal fluid resuscitation — CLOVERS 2023 showed no difference; practice evolving",
      "Procalcitonin-guided de-escalation — modest LOS benefit; not standard despite multiple RCTs",
    ],
  },
};

export default { id: "sepsis", regimen, decision };
