/* ===========================================================
   BRAIN ABSCESS — IDSA / SHEA + neurosurgery consensus. 6–8 wk
   IV with aspiration/drainage; immunocompromised needs broader. ====  */

const regimen = {
  "Empiric": [
    {
      rx: /ceftriaxone.*metronidazole|cefepime/i,
      pickIf: "Brain abscess on imaging — empiric while awaiting aspiration cultures.",
      whyPick: [
        "**Ceftriaxone (or cefepime) + metronidazole ± vancomycin**",
        "**Aspiration / drainage** by neurosurgery — diagnostic + therapeutic",
        "**6–8 week course** typical, longer if hardware",
        "Source workup — sinus, ear, dental, endocarditis, pulmonary",
      ],
      watchOut: [
        { sev: "warn", text: "**Don't dose-reduce in CNS** — full-strength dosing required" },
        { sev: "note", text: "Steroids only for mass effect / herniation — don't routinely use" },
      ],
    },
  ],
  "Listeria / Nocardia risk": [
    {
      rx: /ampicillin|TMP-?SMX/i,
      pickIf: "Immunocompromised host — add Listeria + Nocardia coverage.",
      whyPick: [
        "**Add ampicillin** for Listeria — invariably resistant to cephalosporins",
        "**Add high-dose TMP-SMX** for Nocardia — alternative is linezolid (cost / supply)",
        "Workup HIV, transplant, chronic steroid, biologic exposure as substrates",
        "Brain biopsy if no improvement at 1–2 wk — atypical pathogens (TB, fungal, toxoplasmosis) require pivot",
      ],
      watchOut: [
        { sev: "warn", text: "**Nocardia long course — 6–12 months minimum** — ID consult mandatory; speciation drives final regimen" },
        { sev: "warn", text: "**Combination therapy** (TMP-SMX + imipenem ± amikacin) for severe / CNS Nocardia — monotherapy fails in disseminated disease" },
        { sev: "note", text: "Aspergillus and Cryptococcus also fit this substrate — keep imaging + biopsy threshold low if response stalls" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "6–8 wk IV typical; longer if hardware, immunocompromised, or Nocardia / Listeria.",
    evidence: "Society consensus — pathogen-directed long IV course + aspiration / surgical drainage",
    branches: [
      { label: "Bacterial, aspirated + sensitive", days: "6–8 wk",
        detail: "Ceftriaxone + metronidazole ± vancomycin; CNS dosing throughout" },
      { label: "Immunocompromised host (Listeria / Nocardia)", days: "6 wk – 12 mo",
        detail: "Listeria ≥ 6 wk; Nocardia 6–12 mo; add ampicillin (Listeria) or high-dose TMP-SMX (Nocardia)",
        matchAgent: /ampicillin|TMP-?SMX/i },
      { label: "Hardware-associated / postneurosurgical", days: "8 wk minimum",
        detail: "Hardware removal preferred; if retained, suppression considered" },
      { label: "Fungal abscess", days: "Months",
        detail: "Voriconazole / liposomal amphotericin; surgical drainage; ID + neurosurgery" },
    ],
    stopWhen: [
      "Imaging shows abscess resolution or stable scar",
      "Clinical resolution — no new neuro deficits",
      "Inflammatory markers normalizing",
      "Source controlled (sinus / ear / dental / endocarditis)",
      "Minimum 6–8 wk (bacterial) / longer per pathogen completed",
    ],
    extendIf: [
      "Persistent or new abscess on imaging",
      /* "Immunocompromised host" — left without matchCtx because the
         case parser does not yet capture an immune-status field
         (neutropenia, transplant, biologic, chronic steroid). Using
         mrsaRisk / esblRisk as proxies would be clinically misleading
         (resistance-history flags ≠ immune status). Bullet stays
         visible at default emphasis; a future `immunocompromised`
         ctx field would enable proper elevation without text change. */
      "**Immunocompromised host** — extend per pathogen + response",
      "Nocardia / Listeria / fungal pathogen — extend per organism",
      "Hardware retained — suppression considered",
    ],
  },
  monitoring: {
    headline: "Aspiration / drainage early; CNS-dose antibiotics; serial MRI; source workup.",
    items: [
      { sev: "required", what: "**Aspiration / drainage by neurosurgery** — diagnostic + therapeutic",
        why: "Pathogen identification + source control; antibiotic-only fails for most" },
      { sev: "required", what: "**CNS-strength dosing** — never dose-reduce for site",
        why: "Brain abscess penetration requires full-strength + frequent dosing" },
      { sev: "required", what: "**Source workup** — sinus, ear, dental, endocarditis, pulmonary",
        why: "Treating source prevents recurrence; otogenic / sinogenic sources very common" },
      { sev: "trigger", what: "**MRI at 1, 2, 4, 8 weeks** — track resolution",
        why: "Imaging-driven duration; expanding abscess triggers re-aspiration + extended therapy" },
      { sev: "trigger", what: "**Workup HIV / transplant / steroid** for Listeria / Nocardia risk",
        why: "Immunocompromise substrate drives empiric expansion + extended duration; ask explicitly — substrate not captured by ctx" },
      { sev: "trigger", what: "**Anticonvulsant prophylaxis** for cortical / large abscess",
        why: "~30% develop seizures; levetiracetam typical" },
      { sev: "consider", what: "Steroids only for mass effect / herniation",
        why: "Routine steroids worsen abscess pus accumulation; reserve for impending herniation" },
    ],
  },
  rationale: {
    driver: "Brain abscess is antibiotics PLUS drainage — not antibiotics alone. Brouwer (NEJM 2014, n > 10,000) anchors aspiration or excision for any lesion ≥ 2.5 cm because pus pockets do not sterilize with systemic antibiotics, and aspirate culture is the only path to pathogen-directed narrowing. Empiric coverage tracks the source: streptococci + anaerobes for otogenic / sinogenic / dental (ceftriaxone + metronidazole), with vancomycin added for hematogenous or post-traumatic where S. aureus drives. Immunocompromised hosts trigger Listeria (add ampicillin) and Nocardia (add high-dose TMP-SMX) workup. CNS-strength dosing throughout, 6–8 wk IV with serial MRI at 1 / 2 / 4 / 8 wk; oral step-down acceptable when imaging stabilizes (Helweg-Larsen 2012).",
    guideline: "brouwerba",
    rejected: "Antibiotic-only management of a lesion ≥ 2.5 cm was deliberately rejected — Brouwer + ESCMID 2024 both anchor aspiration for both diagnosis (culture is otherwise blind) and decompression, and conservative medical-only management has near-uniform failure at this size. Routine dexamethasone for cortical irritation was tempered: steroids reduce contrast enhancement, worsen abscess pus accumulation, and impair penetration; Mathisen (CID 1997) restricts use to impending herniation. Skipping the immune-status workup in a host with deep-seated abscess was rejected — missed Listeria or Nocardia substrate drives the wrong empiric and is recoverable only by explicit ask." },
  objections: [
    { q: "Why drain at 2.5 cm — can't antibiotics sterilize a small abscess?",
      a: "Brouwer (NEJM 2014, n > 10,000) anchors aspiration or excision at ≥ 2.5 cm because pus pockets do not sterilize with systemic antibiotics at that size, and aspirate culture is the only path to pathogen-directed narrowing [cite:brouwerba]. Cerebritis < 2.5 cm with identified source can be medical-only, but failure rates climb sharply above the threshold and a missed aspirate means weeks of blind empiric coverage." },
    { q: "Why metronidazole on top of ceftriaxone — isn't ceftriaxone enough?",
      a: "Brain abscess is polymicrobial in 30–60% — streptococci plus oral / sinus anaerobes (Prevotella, Fusobacterium, Bacteroides) per Brouwer + Mathisen [cite:brouwerba]. Ceftriaxone has minimal anaerobic activity, so metronidazole is added as the dedicated anaerobe arm. Clindamycin is an alternative but has inferior CNS penetration and higher C. difficile risk, making metronidazole the IDSA-anchored choice." },
    { q: "Why 6–8 wk IV — can't we step down at 2 wk?",
      a: "Brain abscess pus has slow bacterial kinetics + persistent radiographic cavity, and Helweg-Larsen (Clin Neurol Neurosurg 2012) anchors 6–8 wk IV as standard with oral step-down only after imaging stability [cite:brouwerba]. Early step-down before MRI shows cavity collapse risks relapse with resistant flora — the long IV course is non-negotiable and Mathisen CID 1997 confirms shorter courses drove failure." },
    { q: "Why no routine dexamethasone — there's mass effect on MRI?",
      a: "Routine steroids reduce contrast enhancement, worsen abscess pus accumulation, and impair antibiotic penetration per Mathisen CID 1997 [cite:brouwerba]. Dexamethasone is reserved for impending herniation, not for cortical irritation or routine perilesional edema. The risk of masking expansion on serial MRI plus impaired antibiotic delivery outweighs the symptomatic benefit outside the impending-herniation indication." },
  ],
  research: {
    headline: "Surgical aspiration + 6–8 wk IV + serial imaging; otogenic + sinus + hematogenous sources drive pathogen choice.",
    trials: [
      { name: "Brouwer NEJM 2014 cohort",
        n: "10,000+",
        question: "Modern brain abscess epidemiology + outcomes",
        finding: "Mortality 13–24%; otogenic / sinus sources decreasing, hematogenous + immunocompromised increasing; outcomes improved with neurosurgery + MRI",
        bias: "European registry; outcomes vary by access to neurosurgical care" },
      { name: "Helweg-Larsen Clin Neurol Neurosurg 2012",
        n: "Cohort",
        question: "Duration of antibiotic therapy in brain abscess",
        finding: "Standard 6–8 wk IV; oral step-down acceptable in selected with stable imaging",
        bias: "Observational; pathogen + immune status drive individualization" },
      { name: "Mathisen + Johnson CID 1997",
        n: "Cohort",
        question: "Pathogen distribution + empiric strategy in brain abscess",
        finding: "Streptococci + anaerobes dominant in otogenic/sinus; staph + GNR in hematogenous + post-NSx; drives empiric metronidazole + 3GC + vanco",
        bias: "Pre-MRI era; some shifts in modern epidemiology" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2017,
        topic: "Healthcare-associated ventriculitis + meningitis (Tunkel)",
        keypoint: "Includes post-NSx brain abscess; broad empiric + drain management + intraventricular adjunct" },
      { society: "ESCMID",
        year: 2024,
        topic: "European brain abscess guidance",
        keypoint: "Aspiration + biopsy-driven pathogen direction; 6–8 wk IV with serial imaging" },
    ],
    openQuestions: [
      "Optimal oral step-down threshold — imaging stability + clinical response drive timing",
      "Routine anticonvulsant prophylaxis — meta-analyses inconsistent; cortical abscess strong indication",
      "Steroid use for mass effect — limited to impending herniation; routine use worsens outcomes",
    ],
  },
};

export default { id: "brainabscess", regimen, decision };
