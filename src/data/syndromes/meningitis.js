/* ===========================================================
   MENINGITIS — IDSA 2004 (Tunkel) + 2017 HCA-ventriculitis addendum. Duration by
   pathogen; dexamethasone + Hour-1 antibiotic delivery. ========== */

const regimen = {
  "18–50, immunocompetent": [
    {
      rx: /ceftriaxone.*vancomycin|dexamethasone/i,
      pickIf: "Adult community-acquired meningitis, immunocompetent, age 18–50.",
      whyPick: [
        "**Ceftriaxone 2 g IV q12h + vancomycin + dexamethasone** within Hour-1",
        "**Dexamethasone** 0.15 mg/kg q6h BEFORE or WITH first antibiotic dose — pneumococcal mortality benefit",
        "Vancomycin covers PCN/cefotaxime-resistant pneumococcus",
        "**Don't delay antibiotics for CT** — give now, image later if indicated",
        "**Repeat LP** at 24–36 h if vancomycin used (to confirm sterilization)",
      ],
      watchOut: [
        { sev: "stop", text: "**Antibiotic delay = mortality** — give within 1 h of suspicion" },
        { sev: "stop", text: "**Dex AFTER first dose** = no benefit (must precede or coincide with abx)" },
        { sev: "warn", text: "Cefepime / meropenem if recent neurosurgery / penetrating trauma" },
        { sev: "note", text: "CT before LP only for: focal deficit, papilledema, immunocompromised, hx CNS dz, new seizure, AMS" },
      ],
    },
  ],
  ">50 or impaired immunity": [
    {
      rx: /ampicillin/i,
      pickIf: "Age > 50, alcoholic, immunocompromised, or pregnant — Listeria coverage.",
      whyPick: [
        "**Add ampicillin 2 g IV q4h** for Listeria — never assume cephalosporin alone covers",
        "**Listeria invariably resistant to cephalosporins** — every reported case missed by single-cephalosporin therapy",
        "**TMP-SMX 5 mg/kg q6–8h IV** alternative for severe PCN allergy",
        "All other agents (ceftriaxone, vanco, dex) per standard meningitis regimen",
      ],
      watchOut: [
        { sev: "stop", text: "**Listeria + cephalosporin alone = treatment failure** — ampicillin essential whenever age > 50 or immunocompromise" },
        { sev: "warn", text: "**Pregnancy at any age** = Listeria-risk substrate — add ampicillin",
          matchCtx: { any: [{ age: { gte: 50 } }] } },
        { sev: "note", text: "**Workup HIV + steroid + transplant + alcohol** as Listeria-risk substrates if not already documented" },
      ],
    },
  ],
  "Post-neurosurgical / penetrating": [
    {
      rx: /vancomycin.*cefepime|vancomycin.*meropenem/i,
      pickIf: "Post-neurosurgery, penetrating trauma, or CSF shunt-related meningitis.",
      whyPick: [
        "**Vancomycin + cefepime or meropenem** — covers nosocomial GNR + Pseudomonas + Staph",
        "**Remove the device** (shunt, drain) for source control",
        "Intraventricular vanco/gent for refractory ventriculitis",
      ],
      watchOut: [
        { sev: "warn", text: "Cefepime neurotoxicity in CrCl < 60 — dose-reduce" },
        { sev: "warn", text: "Meropenem ↓ valproate" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Pathogen-driven: meningococcus 7 d, pneumococcus 10–14 d, Listeria ≥ 21 d, GNR / nosocomial 21+ d.",
    evidence: "IDSA 2004 (Tunkel) + 2017 HCA-ventriculitis addendum — pathogen-specific durations; longer for GNR / Listeria / abscess substrate",
    branches: [
      { label: "Neisseria meningitidis", days: "7 d",
        detail: "Penicillin G or ceftriaxone; close-contact prophylaxis to household + healthcare exposure" },
      { label: "Streptococcus pneumoniae", days: "10–14 d",
        detail: "Ceftriaxone + vancomycin until susceptibility; dexamethasone × 4 d (with first abx dose)" },
      { label: "Listeria monocytogenes", days: "≥ 21 d",
        detail: "Ampicillin ± gentamicin synergy first 7–14 d; longer for rhombencephalitis (≥ 6 wk)",
        matchAgent: /ampicillin/i },
      { label: "GNR / post-neurosurgical / shunt", days: "21–28 d",
        detail: "Vancomycin + cefepime / meropenem; remove hardware; longer if abscess substrate" },
      { label: "Group B Streptococcus (neonatal / elderly)", days: "14–21 d",
        detail: "Penicillin G; longer for ventriculitis / abscess substrate" },
    ],
    stopWhen: [
      "Afebrile ≥ 48 h",
      "Mental status returning to baseline / improving",
      "CSF cell count + protein + glucose normalizing on repeat LP (if done)",
      "Blood cultures cleared (if bacteremic)",
      "No new neurologic deficit / seizure / focal sign",
      "Minimum pathogen-specific duration reached",
    ],
    extendIf: [
      { text: "**Cerebritis / abscess** on imaging — extend per source",
        matchCtx: { severe: true } },
      "Persistent CSF positivity at repeat LP (rare with appropriate therapy)",
      "Ventriculitis complication — add intraventricular agent + extend",
      { text: "**Immunocompromised host** — extend to upper band of pathogen-specific range" },
      { text: "**Post-neurosurgical** + hardware retained — duration extends per ID input",
        matchCtx: { severe: true } },
    ],
  },
  monitoring: {
    headline: "Dex with first abx dose; repeat LP at 36–48 h if vanco-treated; pathogen-specific narrowing.",
    items: [
      { sev: "required", what: "**Dexamethasone 0.15 mg/kg q6h** WITH or BEFORE first antibiotic dose",
        why: "Pneumococcal meningitis mortality benefit; ineffective if given AFTER first dose" },
      { sev: "required", what: "**Antibiotic delivery within 1 hour** of suspicion",
        why: "Mortality climbs sharply with delay; don't wait for CT to give first dose" },
      { sev: "required", what: "**Repeat LP at 36–48 h** if treating with vancomycin or atypical organism",
        why: "Confirms sterilization; positive at 48 h triggers escalation",
        matchAgent: /vancomycin/i },
      { sev: "required", what: "**Vanco AUC 400–600** with CNS-strength dosing",
        why: "CNS penetration limited; underdosing risks failure, overdosing risks AKI",
        matchAgent: /vancomycin/i },
      { sev: "required", what: "**Daily neuro exam** — mental status, focal signs, seizure activity",
        why: "Worsening signs trigger imaging + neurosurgical consult; ventriculitis / abscess complications" },
      { sev: "trigger", what: "**Cefepime neurotoxicity surveillance** in CrCl < 60 — myoclonus / NCSE",
        why: "Cefepime accumulates with renal impairment; symptoms mimic meningitis worsening",
        matchAgent: /cefepime/i,
        matchCtx: { crcl: { lt: 60 } } },
      { sev: "trigger", what: "**Public-health notification + contact prophylaxis** for meningococcus",
        why: "Mandatory reporting + household / close-contact rifampin or ceftriaxone prophylaxis" },
      { sev: "trigger", what: "**Pregnancy + immunocompromise screen** for Listeria substrate",
        why: "Listeria empiric coverage (ampicillin) needed in pregnancy / age > 50 / immunocompromise" },
      { sev: "consider", what: "**MRI brain** at 7–10 d for cerebritis / abscess complications",
        why: "Early imaging not routinely indicated; later imaging guides extended-course decisions" },
      { sev: "consider", what: "Hearing assessment + audiology referral on discharge",
        why: "Pneumococcal meningitis hearing loss in ~10%; early detection enables aid fitting" },
    ],
  },
  rationale: {
    driver: "Empiric ceftriaxone 2 g q12h + vancomycin (CNS dosing, AUC 400–600) covers pneumococcus + meningococcus; ampicillin is added in age > 50, pregnancy, alcoholism, or immunocompromise to cover Listeria. Dexamethasone 0.15 mg/kg q6h × 4 d MUST be given WITH or BEFORE the first antibiotic dose — de Gans (NEJM 2002) showed unfavourable outcomes 25 → 15% with pneumococcal disease as the driver. Antibiotics within 1 h of suspicion; do not delay for CT.",
    guideline: "degans",
    rejected: "Dexamethasone given AFTER the first antibiotic dose is deliberately NOT recommended — the cytokine cascade has already fired, and the mortality / neurologic-outcome benefit is lost. Empiric coverage without ampicillin in age > 50 or impaired cell-mediated immunity was rejected: Listeria has no β-lactam susceptibility to ceftriaxone, and missed coverage is uniformly fatal." },
  objections: [
    { q: "Why ampicillin when ceftriaxone covers everything else?",
      a: "Listeria monocytogenes is intrinsically resistant to all cephalosporins — ceftriaxone has no activity against it. Empiric ampicillin (or TMP-SMX in β-lactam allergy) is added in age > 50, pregnancy, alcoholism, hematologic malignancy, transplant, or impaired cell-mediated immunity per IDSA / ESCMID guidance [cite:degans]. Missed Listeria coverage in a susceptible host is uniformly fatal — the cost of adding ampicillin is trivial compared to that miss." },
    { q: "Why dex BEFORE — can't we give it after the first dose?",
      a: "De Gans + van de Beek (NEJM 2002, n=301) showed dexamethasone 10 mg q6h × 4 d reduces unfavorable outcomes from 25% to 15% in bacterial meningitis (pneumococcal subgroup drove benefit) — BUT only when given WITH or BEFORE the first antibiotic dose [cite:degans]. After the first dose, bacterial lysis has already triggered the cytokine cascade and the benefit is lost. Timing is mechanism-mandated, not arbitrary." },
    { q: "Why not wait for CT before LP and antibiotics?",
      a: "Surviving Sepsis logic applies — antibiotics within 1 h of suspicion; do not delay for CT or LP per IDSA guidance [cite:degans]. CT is required before LP only for focal deficit, papilledema, immunocompromise, seizure, or altered mental status with no obvious cause — and even then, draw blood cultures, give empiric antibiotics + dexamethasone first, then image. The mortality slope with antibiotic delay is steep." },
    { q: "Why 10-14 d for pneumococcus — IDSA range allows 10?",
      a: "Pneumococcal meningitis duration is pathogen-driven (IDSA 2004 Tunkel): 10-14 d is standard, with the 10-d floor reserved for penicillin-susceptible strains and rapid CSF clearance, and 14 d for higher-MIC strains, complicated course, or vancomycin-treated pending susceptibility [cite:degans]. Repeat LP at 36-48 h confirms sterilization in vancomycin-treated cases; persistent positivity triggers extended duration + workup for ventriculitis / abscess." },
  ],
  research: {
    headline: "Hour-1 antibiotics + dexamethasone for pneumococcal — both established mortality + neuro-outcome benefit.",
    trials: [
      { name: "de Gans + van de Beek NEJM 2002",
        n: "301",
        question: "Dexamethasone in bacterial meningitis",
        finding: "Dex 10 mg q6h × 4 d (started with/before antibiotics) reduced unfavorable outcome 25 → 15%; pneumococcal subset drove benefit",
        bias: "European cohort; HIV-negative; resource-limited setting may differ" },
      { name: "Auburtin Crit Care Med 2006",
        n: "156",
        question: "Time-to-antibiotic in pneumococcal meningitis",
        finding: "Each hour delay ↑ unfavorable outcome OR ~1.1 — Hour-1 antibiotic delivery is the standard",
        bias: "Observational; selection bias for sicker patients getting faster care" },
      { name: "Brouwer Lancet ID 2015",
        n: "13,000 (meta)",
        question: "Adjunctive dexamethasone — long-term outcomes",
        finding: "Hearing loss + neurologic sequelae reduced; mortality benefit replicated only in pneumococcal subgroup",
        bias: "Heterogeneous endpoint definitions across trials" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2004,
        topic: "Bacterial meningitis (Tunkel)",
        keypoint: "Empiric ceftriaxone + vancomycin + ampicillin (if Listeria risk); dexamethasone before/with antibiotics" },
      { society: "European Federation",
        year: 2016,
        topic: "European bacterial meningitis (van de Beek)",
        keypoint: "Aligned with IDSA; emphasizes Hour-1 antibiotic delivery + bundle compliance" },
      { society: "IDSA",
        year: 2017,
        topic: "Healthcare-associated ventriculitis + meningitis",
        keypoint: "Drain-related infections — drain removal + broad spectrum + intraventricular adjunct for MDR" },
    ],
    openQuestions: [
      "Adjunctive dexamethasone in HIV+ meningitis — CASA 2024 supports cautious use",
      "Adjunctive glycerol — initially promising; LANCET ID 2020 meta-analysis equivocal",
      "Repeat LP for response monitoring — practice varies; not standard unless non-response",
    ],
  },
};

export default { id: "meningitis", regimen, decision };
