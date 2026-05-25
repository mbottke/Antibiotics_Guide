/* ===========================================================
   BOTULISM — neurotoxin-mediated; antitoxin + supportive care;
   antibiotics for wound only (avoid AGs — neuromuscular block). */

const regimen = {
  "Antitoxin (primary)": [
    {
      rx: /antitoxin|BabyBIG/i,
      pickIf: "Suspected botulism — antitoxin is the treatment, not antibiotics.",
      whyPick: [
        "**Equine antitoxin** (adults) or **BabyBIG** (infants) — give EARLY",
        "**Antibiotics are NOT primary** and may worsen infant botulism (toxin release with lysis)",
        "**ICU + ventilator support** for descending paralysis",
        "Notify state health department immediately",
      ],
      watchOut: [
        { sev: "stop", text: "**Antibiotics in infant botulism** can worsen disease (toxin release with cell lysis)" },
        { sev: "warn", text: "**Aminoglycosides** worsen neuromuscular blockade — avoid in confirmed/suspected botulism" },
        { sev: "warn", text: "Wound botulism (IV drug use): debride + give antitoxin first; penicillin G adjunct for clostridial wound clearance" },
        { sev: "note", text: "Equine antitoxin: serum sickness ~9%, anaphylaxis ~2% — keep epi at bedside; defer prick-test only if outbreak triage" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Antitoxin + ICU + ventilator support; antibiotics only for wound botulism (NOT food / infant).",
    evidence: "CDC + WHO — antitoxin neutralizes circulating toxin; antibiotics worsen toxin release in food / infant; aminoglycosides contraindicated",
    branches: [
      { label: "Foodborne botulism", days: "0 d antibiotics",
        detail: "Antitoxin + ICU; antibiotics not indicated; lysis of organisms releases more toxin" },
      { label: "Infant botulism (< 1 yr)", days: "0 d antibiotics",
        detail: "Botulism IG (BabyBIG); antibiotics not indicated; supportive care; resolve over months" },
      { label: "Wound botulism (IVDU or trauma)", days: "10–14 d + debridement",
        detail: "Penicillin G or metronidazole + wound debridement + antitoxin; avoid aminoglycosides",
        matchAgent: /penicillin|metronidazole/i },
      { label: "Iatrogenic / cosmetic toxin overdose", days: "0 d antibiotics",
        detail: "Antitoxin + supportive; no antibiotic role" },
    ],
    stopWhen: [
      "Antitoxin administered",
      "Wound debrided (if wound botulism)",
      "Respiratory + motor recovery sufficient for extubation",
      "Public health reporting completed",
      "Minimum 10–14 d completed (wound botulism only)",
    ],
    extendIf: [
      { text: "**Inadequate wound debridement** — re-explore and extend",
        matchCtx: { severe: true } },
      "Co-infection — per pathogen + source",
      "Prolonged ventilator dependence — supportive care extends",
      "Outbreak / cluster — extended public health investigation",
    ],
  },
  monitoring: {
    headline: "Antitoxin early; ICU + ventilator support; avoid aminoglycosides; report to public health.",
    items: [
      { sev: "required", what: "**Antitoxin (BAT) early** — contact CDC / state health department",
        why: "Neutralizes circulating toxin only; earlier = more benefit; cannot reverse bound toxin" },
      { sev: "required", what: "**ICU admission** + serial respiratory monitoring (VC, NIF)",
        why: "Descending paralysis → respiratory failure; intubate at VC < 30% or NIF > -25" },
      { sev: "required", what: "**Avoid aminoglycosides + clindamycin** — neuromuscular blockade",
        why: "Worsens paralysis; contraindicated regardless of indication" },
      { sev: "required", what: "**Public health reporting** + CDC notification",
        why: "Notifiable; outbreak investigation + source identification + contact prophylaxis" },
      { sev: "trigger", what: "**BabyBIG (botulism IG-IV)** for infant botulism",
        why: "Reduces ICU + hospital stay; obtain via California Department of Public Health" },
      { sev: "trigger", what: "**Wound debridement** for wound botulism",
        why: "Source control eradicates organism + ongoing toxin production" },
      { sev: "trigger", what: "**Stool / serum / wound for toxin assay** at presentation",
        why: "Confirms diagnosis + serotype; CDC reference testing" },
      { sev: "consider", what: "**Prolonged ICU stay** typical — weeks to months for recovery",
        why: "Toxin-bound nerve terminals require regeneration; supportive care long-haul" },
    ],
  },
  rationale: {
    driver: "Botulism is a neurotoxin disease, not a bacterial infection in the conventional sense — C. botulinum toxin cleaves SNARE proteins (SNAP-25, syntaxin, synaptobrevin) at the presynaptic cholinergic terminal, blocking acetylcholine release and producing symmetric, descending flaccid paralysis culminating in respiratory failure. The intervention is multi-modal: early heptavalent equine BAT antitoxin (obtain via CDC; neutralizes circulating, unbound toxin only) + ICU with serial VC/NIF monitoring and elective intubation + supportive care over weeks. Antibiotics are reserved for wound botulism only — penicillin G or metronidazole + debridement — because lysing organisms in the foodborne/infant form releases more toxin.",
    guideline: "cdc_abx",
    rejected: "Empiric antibiotics in foodborne or infant botulism were deliberately rejected — antibiotic-induced organism lysis releases additional intraluminal toxin and worsens disease; the CDC reserves antibacterials for wound botulism after debridement. Aminoglycosides and clindamycin are contraindicated outright in any botulism subtype: both potentiate the presynaptic neuromuscular block and can precipitate respiratory failure (Santos CID 1981, Sobel CID 2005). Waiting for laboratory confirmation before contacting CDC for BAT was rejected — earlier antitoxin is more effective because it cannot reverse toxin already internalized." },
  objections: [
    { q: "Why no antibiotics for foodborne or infant botulism?",
      a: "In foodborne and infant botulism, the toxin is already preformed (food) or produced by gut colonization (infant) — bacterial lysis from antibiotic exposure releases additional intracellular toxin and worsens disease. CDC guidance is supportive care + antitoxin (BAT) or BabyBIG only; antibiotics indicated solely for wound botulism after source control [cite:cdc_abx]. Reflexive empiric antibiotic in suspected foodborne / infant botulism is iatrogenic harm." },
    { q: "Why avoid aminoglycosides and clindamycin specifically?",
      a: "Aminoglycosides and clindamycin both potentiate neuromuscular blockade — aminoglycosides via presynaptic calcium-channel inhibition, clindamycin via post-synaptic effects. In botulism, where BoNT has already cleaved SNARE proteins (SNAP-25, syntaxin, synaptobrevin) and abolished acetylcholine release, this additional blockade accelerates respiratory failure and prolongs ventilator dependence [cite:cdc_abx]. Contraindicated regardless of other indications; use beta-lactams for any concurrent infection." },
    { q: "Why antitoxin early — patient already paralyzed?",
      a: "BAT (heptavalent antitoxin) neutralizes only circulating, unbound BoNT — once toxin internalizes into presynaptic nerve terminals and cleaves SNARE substrates, that nerve ending requires regeneration over weeks-months. Sobel CID 2005 + CDC surveillance show early antitoxin reduces ICU days and ventilator dependence [cite:cdc_abx]; delay locks in additional bound toxin. Give on clinical suspicion via CDC / state health; do not wait for confirmatory toxin assay." },
    { q: "Why public health reporting before confirmation?",
      a: "Botulism is a Tier-1 select agent and immediately notifiable per CDC [cite:cdc_abx] — every case is potentially outbreak-sentinel (contaminated food source, bioterrorism, or shared product). State health and CDC coordinate antitoxin release, source investigation, and contact identification within hours; delaying for confirmatory testing forfeits the outbreak-containment window. Report on clinical suspicion at presentation; the assay is days away and outbreak vectors propagate faster than that." },
  ],
  research: {
    headline: "Antitoxin neutralizes circulating toxin only; aminoglycosides + clindamycin contraindicated (neuromuscular block).",
    trials: [
      { name: "Sobel CID 2005",
        n: "Cohort",
        question: "Adult food + wound botulism epidemiology",
        finding: "Early antitoxin reduces ICU + ventilator days; ~10% mortality with timely treatment; respiratory failure drives outcomes",
        bias: "U.S. surveillance; rare disease + small numbers" },
      { name: "Arnon NEJM 2006 (infant botulism BabyBIG)",
        n: "129",
        question: "Botulism IG-IV (BabyBIG) for infant botulism",
        finding: "Reduced hospital LOS by ~3 wk + mechanical ventilation; FDA-approved + obtained via CA Dept of Public Health",
        bias: "Pediatric-specific; sponsored development" },
    ],
    guidelines: [
      { society: "CDC",
        year: 2024,
        topic: "Botulism management + antitoxin",
        keypoint: "BAT antitoxin via CDC; BabyBIG for infants; avoid AGs + clindamycin (neuromuscular block)" },
    ],
    openQuestions: [
      "Optimal antitoxin timing — earlier = better but works only on unbound toxin",
      "Wound botulism antibiotic duration — penicillin or metronidazole 10–14 d + debridement",
      "Long-term recovery — months typical; some require chronic ventilation",
    ],
  },
};

export default { id: "botulism", regimen, decision };
