/* ===========================================================
   POST-NEUROSURGICAL MENINGITIS / VENTRICULITIS — drain-related
   or post-craniotomy; gram-negative + staphylococci; broad
   spectrum + intraventricular adjunct in select cases. ======== */

const regimen = {
  "Empiric": [
    {
      rx: /vancomycin.*cefepime|vancomycin.*meropenem/i,
      pickIf: "Meningitis following neurosurgery or CSF leak.",
      whyPick: [
        "**Vancomycin + cefepime / meropenem** (CNS dosing)",
        "**Remove hardware / repair CSF leak** — source control essential",
        "Common organisms: **CoNS, S. aureus, Pseudomonas, Acinetobacter**",
        "Add intraventricular vanco / aminoglycoside for refractory cases",
      ],
      watchOut: [
        { sev: "warn", text: "**Cefepime neurotoxicity** in CrCl < 60 — dose-reduce; myoclonus, NCSE can mimic meningitis itself",
          matchCtx: { crcl: { lt: 60 } } },
        { sev: "warn", text: "**Meropenem ↓ valproate** by 60–90% — switch valproate or use cefepime if epileptic" },
        { sev: "note", text: "**MDR organisms** (Acinetobacter, ESBL Klebsiella) more common in post-NSx; novel β-lactams if prior resistant isolate" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "10–21 d per pathogen; cover GNR + staph; remove infected drain; intraventricular antibiotics in select cases.",
    evidence: "IDSA 2017 healthcare-associated ventriculitis — drain removal + broad initial + pathogen-targeted; intraventricular as adjunct",
    branches: [
      { label: "EVD-associated, GNR (E. coli, Klebsiella)", days: "10–14 d",
        detail: "Meropenem or cefepime + intraventricular gentamicin or colistin if needed; drain removal",
        matchAgent: /meropenem|cefepime/i },
      { label: "Coagulase-negative staph (shunt-associated)", days: "10–14 d + shunt removal",
        detail: "Vancomycin + rifampin; shunt removal + EVD bridge then re-shunt",
        matchAgent: /vancomycin|rifampin/i },
      { label: "S. aureus / MRSA", days: "14 d + shunt removal",
        detail: "Vancomycin + linezolid or daptomycin alternative; AUC monitoring",
        matchAgent: /linezolid|daptomycin/i },
      { label: "P. aeruginosa or MDR GNR", days: "14–21 d",
        detail: "Per sensitivity — cefepime, meropenem, ceftazidime-avibactam, ceftolozane-tazobactam; intraventricular adjunct",
        matchAgent: /ceftazidime-?avibactam|ceftolozane/i },
      { label: "Empiric, awaiting pathogen", days: "Per pathogen after data",
        detail: "Vancomycin + meropenem broad; narrow on CSF + drain culture data" },
    ],
    stopWhen: [
      "CSF cultures cleared",
      "CSF profile normalizing",
      "Drain removed or shunt re-implanted",
      "Afebrile + clinical recovery",
      "Pathogen-specific minimum duration met",
    ],
    extendIf: [
      { text: "**Persistent positive CSF cultures** — drain removal + re-target",
        matchCtx: { severe: true } },
      "Shunt retained — extend per neurosurgery + ID",
      "Brain abscess co-existing — per brain abscess bands",
      "MDR pathogen — extend per sensitivity + ID",
    ],
  },
  monitoring: {
    headline: "Remove infected drain; broad initial then narrow; intraventricular adjunct for MDR or persistent.",
    items: [
      { sev: "required", what: "**Remove or replace infected drain / shunt**",
        why: "Source control; biofilm prevents antibiotic-only cure" },
      { sev: "required", what: "**Daily CSF cultures + cell count + glucose**",
        why: "Track clearance + sterilization; persistent positives drive escalation" },
      { sev: "required", what: "**Neurosurgery consult** at presentation",
        why: "Drain management + shunt revision require neurosurgical coordination" },
      { sev: "trigger", what: "**Intraventricular antibiotics** for MDR or persistent positive CSF",
        why: "Adjunct for inadequate CSF penetration; gentamicin / colistin / vancomycin; ID-driven dosing",
        matchBranch: ["P. aeruginosa or MDR GNR"] },
      { sev: "trigger", what: "**MRI brain** to rule out abscess or ventriculitis extent",
        why: "Coexisting brain abscess drives extension + surgical consideration" },
      { sev: "trigger", what: "**ID consult** at presentation",
        why: "Pathogen + duration + intraventricular dosing complex" },
      { sev: "trigger", what: "**Re-shunting decision** after sterilization",
        why: "Timing balances infection clearance + hydrocephalus management" },
      { sev: "consider", what: "**Workup ventriculostomy bundle compliance**",
        why: "EVD-bundle measures reduce infection incidence" },
    ],
  },
  rationale: {
    driver: "Post-neurosurgical / nosocomial meningitis is not community pneumococcal meningitis — Tunkel IDSA 2017 anchors a broader empiric that covers nosocomial GNR (including P. aeruginosa) plus staphylococci because the substrate is post-craniotomy, EVD, or post-trauma rather than hematogenous community spread. Empirics are vancomycin + cefepime or meropenem at full CNS-strength dosing, with carbapenem reserved for ESBL / AmpC risk and ceftazidime-avibactam / ceftolozane-tazobactam for documented MDR Pseudomonas. Drain removal is the dominant outcome lever; intraventricular antibiotic adjunct (preservative-free vancomycin or aminoglycoside / colistin) is added for MDR or persistent CSF positivity. Duration is 10–21 d pathogen-directed after CSF clearance.",
    guideline: "mono",
    rejected: "Empiric ceftriaxone + vancomycin (the community-meningitis combination) was deliberately rejected in the post-neurosurgical substrate — ceftriaxone misses Pseudomonas and many nosocomial GNR, and Tunkel 2017 anchors anti-pseudomonal β-lactam (cefepime or meropenem) as the empiric backbone. Adjunctive dexamethasone (de Gans 2002) was tempered: the mortality benefit is specific to community pneumococcal meningitis, and routine steroid use in post-neurosurgical meningitis lacks support and may worsen hardware-associated infection. Skipping drain removal in a retained-hardware infection was rejected — systemic antibiotics alone do not sterilize biofilm-laden devices." },
  objections: [
    { q: "Why cefepime instead of ceftriaxone — the meningitis standard?",
      a: "Post-neurosurgical meningitis is a nosocomial substrate, not hematogenous community pneumococcal disease — Tunkel IDSA 2017 anchors anti-pseudomonal β-lactam (cefepime or meropenem) as the empiric backbone because ceftriaxone misses Pseudomonas and many nosocomial Gram-negatives [cite:mono]. Ceftriaxone-empiric in this substrate risks 24–72 h of inadequate Gram-negative coverage before culture data; cefepime narrows trivially to ceftriaxone once a susceptible organism is documented." },
    { q: "Why empiric MRSA cover — community MRSA prevalence is low?",
      a: "Post-craniotomy and EVD substrate have S. aureus + CoNS as dominant Gram-positive pathogens with MRSA prevalence often ≥ 30% in neurosurgical ICU centers per Tunkel 2017 and Beer Lancet Neurol 2008 [cite:mono]. Vancomycin at CNS-strength AUC 400–600 is the empiric default until CSF + drain-tip culture returns at 48–72 h [cite:vanco]. Missing MRSA in this window risks ventriculitis extension and hardware-associated relapse." },
    { q: "Why not give dexamethasone — works for bacterial meningitis?",
      a: "De Gans NEJM 2002 dexamethasone mortality benefit is specific to community pneumococcal meningitis with mortality reduction 25→15% [cite:degans]. In the post-neurosurgical substrate the dominant organisms are nosocomial Gram-negatives plus staphylococci, the pathophysiology is hardware-biofilm rather than subarachnoid cytokine cascade, and routine steroid use lacks support and may worsen hardware-associated infection by impairing the local immune response — Tunkel 2017 omits it." },
    { q: "Why remove the EVD — can't we give intraventricular antibiotics?",
      a: "Tunkel IDSA 2017 documents that drain removal is the dominant outcome lever because biofilm renders systemic antibiotics inadequate; intraventricular vancomycin / gentamicin / colistin is adjunctive when explant is impossible or CSF cultures persist positive, not a substitute for source control [cite:mono]. Retained-hardware salvage rates are < 30% versus > 90% cure with explant + EVD bridge + reimplantation — the device IS the infection substrate." },
  ],
  research: {
    headline: "IDSA 2017 — drain removal mandatory; intraventricular antibiotics for MDR / persistent positive CSF; broad → narrow on data.",
    trials: [
      { name: "Tunkel IDSA 2017",
        n: "Guideline",
        question: "Healthcare-associated ventriculitis + meningitis",
        finding: "Drain / shunt removal + broad initial + targeted antibiotic post-culture; intraventricular adjunct for MDR or non-response",
        bias: "Guideline synthesis" },
      { name: "Beer Lancet Neurol 2008",
        n: "Cohort review",
        question: "EVD-related ventriculitis prevention + outcomes",
        finding: "EVD-bundle adherence reduces incidence; pathogen-directed 10–21 d post-removal; intraventricular adjunct for refractory",
        bias: "Pre-modern bundle era; principles validated" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2017,
        topic: "Healthcare-associated ventriculitis + meningitis (Tunkel)",
        keypoint: "Remove drain / shunt; pathogen-directed; intraventricular for MDR or persistent positive CSF" },
    ],
    openQuestions: [
      "Intraventricular dosing — gentamicin / colistin / vancomycin agent-specific",
      "Optimal duration after CSF sterilization — 10–14 d typical",
      "Re-shunting timing — sterilization + clinical stability driven",
    ],
  },
};

export default { id: "post-nsx-meningitis", regimen, decision };
