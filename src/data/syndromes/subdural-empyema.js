/* ===========================================================
   SUBDURAL EMPYEMA — surgical emergency from sinus/otitis spread. */

const regimen = {
  "Empiric": [
    {
      rx: /vancomycin.*ceftriaxone.*metronidazole|cefepime/i,
      pickIf: "Subdural empyema — typically from sinusitis or otitis spread.",
      whyPick: [
        "**Vancomycin + ceftriaxone (or cefepime) + metronidazole** — CNS dosing",
        "**Neurosurgical drainage** is the treatment — antibiotics adjunctive",
        "Source control — sinus / ear / dental",
        "Long course: 4–6 weeks",
      ],
      watchOut: [
        { sev: "stop", text: "**Drainage emergency** — mass effect + herniation risk; neurosurgery within hours" },
        { sev: "warn", text: "**Seizures** in ~30% — load antiepileptic prophylaxis (levetiracetam) if cortical involvement on imaging" },
        { sev: "note", text: "Streptococcus anginosus group (milleri) common — extends post-drainage course to 6+ weeks even after sterilization" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "4–6 wk IV after surgical drainage; source control of sinus / ear / dental.",
    evidence: "Society consensus — neurosurgical drainage essential; pathogen-directed long IV course",
    branches: [
      { label: "Bacterial, drained + targeted", days: "4–6 wk",
        detail: "Vancomycin + ceftriaxone (or cefepime) + metronidazole; CNS dosing" },
      { label: "Post-neurosurgical / penetrating", days: "6–8 wk",
        detail: "Cover nosocomial GNR + Staph; hardware decision per neurosurgery" },
      { label: "Streptococcus anginosus / milleri group", days: "6+ wk",
        detail: "Especially destructive; extended course even after sterilization" },
    ],
    stopWhen: [
      "Imaging shows empyema resolution",
      "Neurologic exam at baseline / improving",
      "Inflammatory markers normalizing",
      "Source controlled (sinus / ear / dental)",
      "Minimum 4–6 wk completed",
    ],
    extendIf: [
      { text: "**Streptococcus anginosus group** — extend by ≥ 2 wk regardless of clearance",
        matchCtx: { severe: true } },
      "Recurrent collection on imaging — re-drainage + extend",
      "Cortical venous thrombosis complication — anticoagulation decision",
      "Hardware retained — suppression considered",
    ],
  },
  monitoring: {
    headline: "Emergent neurosurgery; sinus/ear/dental source control; seizure prophylaxis.",
    items: [
      { sev: "required", what: "**Emergent neurosurgical drainage** — within hours",
        why: "Mass effect + herniation risk; antibiotic-only fails universally" },
      { sev: "required", what: "**Source workup + control** — sinus / ear / dental",
        why: "Untreated source = recurrence; ENT + dental consults" },
      { sev: "required", what: "**Daily neuro exam** + seizure surveillance",
        why: "~30% develop seizures; cortical irritation common" },
      { sev: "trigger", what: "**Levetiracetam prophylaxis** for cortical involvement",
        why: "Seizure prevention; standard for at-risk presentations" },
      { sev: "trigger", what: "**MRI venogram** if cortical-vein thrombosis suspected",
        why: "Complication of subdural empyema; anticoagulation decision-driver" },
      { sev: "consider", what: "Repeat MRI at 2 + 4 + 8 wk intervals",
        why: "Image-driven duration; persistent collection drives re-drainage + extension" },
    ],
  },
  rationale: {
    driver: "Subdural empyema is a neurosurgical emergency that does not sterilize medically — pus in the subdural space causes mass effect, cortical irritation, and herniation, and Brouwer (Lancet Neurol 2014) confirms that emergent drainage within hours is the dominant outcome lever. Source is sinusitis or otitis in the majority, so ENT + dental source workup runs in parallel with neurosurgical evacuation. Empirics cover streptococci (including the destructive S. anginosus / milleri group), anaerobes, and S. aureus: vancomycin + ceftriaxone (or cefepime) + metronidazole at CNS-strength dosing for 4–6 wk after drainage, extending to 6+ wk for anginosus-group disease which is especially destructive even after culture clearance.",
    guideline: "mono",
    rejected: "Antibiotic-only management of established subdural empyema was deliberately rejected — Brouwer + IDSA 2017 anchor emergent neurosurgical evacuation because mass effect plus cortical inflammation drives herniation, and medical-only management has near-uniform failure. Standard-dose systemic antibiotics without CNS-strength dosing were tempered: subdural penetration is poor without aggressive dosing, and underdosing risks recurrence after drainage. Stopping at 4 wk in anginosus-group disease was rejected — this organism is destructive enough that empiric extension to ≥ 6 wk regardless of CSF clearance is the standard, with serial MRI driving the actual stop date." },
  objections: [
    { q: "Why emergent neurosurgery — can broad antibiotics alone work?",
      a: "Subdural empyema is pus in a non-collapsible space with mass effect plus cortical irritation — Brouwer (Lancet Neurol 2014) confirms emergent drainage within hours is the dominant outcome lever, and medical-only management has near-uniform failure with high herniation mortality [cite:brouwerba]. Antibiotics are adjunctive; the neurosurgical evacuation IS the source-control step. Even small collections in eloquent territory mandate craniotomy or burr-hole drainage." },
    { q: "Why metronidazole on top of vancomycin + ceftriaxone?",
      a: "Sinusitis and otitis are the dominant sources of subdural empyema, seeding oral / sinus polymicrobial flora including obligate anaerobes (Prevotella, Fusobacterium, Bacteroides) per Brouwer Lancet Neurol 2014 [cite:brouwerba]. Ceftriaxone has minimal anaerobic activity and vancomycin none, so metronidazole is mandatory as the dedicated anaerobe arm at CNS-strength dosing. Missing anaerobes is a known recurrence driver after drainage." },
    { q: "Why extend to 6+ wk for S. anginosus when CSF clears at 4?",
      a: "The S. anginosus / milleri group is especially destructive in CNS collections — it forms recurrent loculated abscesses even after culture-confirmed sterilization, and society consensus per IDSA 2017 anchors empiric extension to ≥ 6 wk regardless of CSF clearance [cite:mono]. Serial MRI rather than CSF cultures drives the actual stop date because persistent radiographic collection without organism recovery still indicates active disease at this pathogen." },
  ],
  research: {
    headline: "Emergent neurosurgical drainage + 4-6 wk IV; source from sinus/otitis spread; mortality < 10% with timely surgery.",
    trials: [
      { name: "Brouwer Lancet Neurol 2014",
        n: "Cohort review",
        question: "Modern subdural empyema outcomes",
        finding: "Surgical drainage + targeted antibiotics drive mortality reduction; sinusitis + otitis dominant sources",
        bias: "European cohort" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2017,
        topic: "CNS empyema management",
        keypoint: "Emergent neurosurgery + 4-6 wk targeted; cortical-vein thrombosis workup" },
    ],
    openQuestions: [
      "Anticoagulation in cortical-vein thrombosis — controversial",
      "Optimal repeat-imaging schedule — clinical + radiographic driven",
    ],
  },
};

export default { id: "subdural-empyema", regimen, decision };
