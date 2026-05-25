/* ===========================================================
   CAVERNOUS SINUS THROMBOSIS — facial/sinus infection + cranial
   nerve deficits. Anticoagulation controversial. ================== */

const regimen = {
  "Empiric": [
    {
      rx: /vancomycin.*ceftriaxone.*metronidazole/i,
      pickIf: "Cavernous sinus thrombosis — periorbital infection + cranial nerve deficits.",
      whyPick: [
        "**Vancomycin + ceftriaxone + metronidazole** (CNS dosing)",
        "**Anticoagulation** controversial — selective use after weighing bleed/clot tradeoffs",
        "**Source workup** — sinusitis, dental, facial cellulitis (especially infraorbital triangle)",
        "**ENT / neurosurgery / ophthalmology** consults immediately",
      ],
      watchOut: [
        { sev: "stop", text: "**Mucormycosis** in diabetic / immunocompromised → amphotericin B + emergent surgical debridement; missed = death" },
        { sev: "warn", text: "**Cranial-nerve sweep** (III, IV, V1, V2, VI) at every reassessment — progression is the trigger for repeat imaging + surgical re-look" },
        { sev: "note", text: "Long course 4–6 weeks; monitor for septic emboli to brain/meninges" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "4–6 wk IV; source control of sinus / facial / dental; consider anticoagulation case-by-case.",
    evidence: "Society consensus — long IV course + source control; anticoagulation evidence mixed",
    branches: [
      { label: "S. aureus dominant", days: "4–6 wk",
        detail: "Vancomycin + ceftriaxone + metronidazole; CNS dosing" },
      { label: "Mucormycosis (diabetic / immunocompromised)", days: "Extended + amphotericin",
        detail: "Emergent debridement; liposomal amphotericin B; ID + ENT + ophthalmology",
        matchAgent: /amphotericin/i },
      { label: "Anaerobic / polymicrobial", days: "4–6 wk",
        detail: "Cover oral / dental flora; include metronidazole" },
    ],
    stopWhen: [
      "Cranial nerve deficits resolving or stable",
      "Imaging shows thrombus resolution / stable",
      "Source controlled (sinus / dental drainage)",
      "Cultures cleared",
      "Minimum 4–6 wk completed",
    ],
    extendIf: [
      { text: "**Mucormycosis** confirmed — months of antifungal + serial debridement",
        matchCtx: { severe: true } },
      "Progressive cranial nerve involvement — image + re-eval",
      "Septic embolic foci — extend per metastatic site",
      "Immunocompromised host — extend per response",
    ],
  },
  monitoring: {
    headline: "Cranial-nerve sweep q4h; ENT/ophth/neurosurgery consults; rule out mucormycosis in diabetic.",
    items: [
      { sev: "required", what: "**Cranial-nerve sweep (III, IV, V1, V2, VI) every 4 h**",
        why: "Progression triggers emergent re-imaging + surgical re-look" },
      { sev: "required", what: "**ENT + ophthalmology + neurosurgery** consults",
        why: "Multi-team coordination essential for source control + complication management" },
      { sev: "required", what: "**Source workup** — sinusitis, facial cellulitis, dental",
        why: "Treating source prevents recurrence; address infraorbital triangle infections" },
      { sev: "trigger", what: "**Emergent mucormycosis workup** in diabetic / immunocompromised",
        why: "Mortality 50%+ if missed; biopsy + amphotericin + debridement",
        matchCtx: { severe: true } },
      { sev: "trigger", what: "**Anticoagulation discussion** case-by-case",
        why: "Mixed evidence; weigh thrombus extension vs bleed risk" },
      { sev: "consider", what: "Septic embolic workup — brain MRI, lung CT, echo",
        why: "Disseminated foci change duration + need additional drainage" },
    ],
  },
  rationale: {
    driver: "Septic cavernous sinus thrombosis is facial / sinus / dental infection seeded into the cavernous sinus, with mortality having fallen from > 80% pre-antibiotic to 10–30% with broad coverage plus aggressive source control (Bhatia Lancet 2003). Empiric coverage targets S. aureus (often MRSA), streptococci, and oral / sinus anaerobes: vancomycin + ceftriaxone + metronidazole at CNS-strength dosing, with pip-tazo or meropenem for severe presentations. Cranial nerve III–VI sweep every 4 h, MRI / MRV at presentation, and emergent ENT + ophthalmology + neurosurgery coordination are mandatory. Rhino-orbital-cerebral mucormycosis screen (KOH + biopsy + emergent debridement + liposomal amphotericin) is non-negotiable in DKA or neutropenic hosts.",
    guideline: "ssti",
    rejected: "Routine anticoagulation in septic cavernous sinus thrombosis was deliberately tempered — Bhatia and society consensus document mixed evidence with both propagation prevention and hemorrhagic-complication signals, so the decision is case-by-case with neurosurgery + neurology and not a reflex. Standard-dose systemic antibiotics without CNS-strength dosing were rejected: cavernous-sinus penetration is poor without aggressive dosing, and underdosing drives extension and progressive cranial-nerve loss. Skipping the mucor workup in a diabetic or post-transplant host was rejected — missed rhino-orbital-cerebral mucormycosis is uniformly fatal without emergent debridement plus amphotericin." },
  objections: [
    { q: "Why anticoagulate — isn't there bleed risk in septic thrombosis?",
      a: "Bhatia (Lancet 2003) and society consensus document mixed evidence with both propagation prevention and hemorrhagic-complication signals, so the decision is case-by-case with neurosurgery plus neurology and not reflexive [cite:ssti]. Observational data favor anticoagulation for thrombus propagation prevention in stable patients without intracranial hemorrhage, but the decision must balance worsening cranial-nerve deficits against bleed risk on a per-patient basis — not a default." },
    { q: "Why CNS-strength dosing — cavernous sinus isn't subarachnoid space?",
      a: "Cavernous sinus penetration of vancomycin and β-lactams is comparable to meningeal CSF — underdosing drives thrombus extension, progressive cranial-nerve III–VI loss, and septic embolic seeding per IDSA / Bhatia consensus [cite:ssti]. Standard skin / soft tissue dosing falls below MIC at the infected site; vanco AUC 400–600 and ceftriaxone 2 g q12h are the meningeal-equivalent thresholds, not the cellulitis floor [cite:vanco]." },
    { q: "Why workup mucor in a diabetic patient — it's rare?",
      a: "Rhino-orbital-cerebral mucormycosis is uniformly fatal without emergent ENT debridement plus liposomal amphotericin per IDSA / ECIL-6 guidance [cite:ssti]. DKA and neutropenia / post-transplant substrate raise the pretest probability sharply, and KOH plus biopsy turnaround in hours allows empiric amphotericin start. Missing it costs the patient — bacterial cavernous sinus thrombosis mortality is 10–30%, mucor approaches 50–80% without surgery." },
    { q: "Why add metronidazole — pip-tazo covers anaerobes already?",
      a: "When the empiric is vancomycin + ceftriaxone (the standard CNS backbone), metronidazole is added because ceftriaxone has minimal anaerobic activity and the dental / sinus polymicrobial substrate of cavernous sinus thrombosis demands a dedicated anaerobe arm at CNS-strength dosing [cite:ssti]. If pip-tazo or meropenem is the chosen backbone for severe disease, metronidazole is redundant and not added — Bhatia anchors the choice to the backbone." },
  ],
  research: {
    headline: "Cavernous sinus involvement raises mortality 10-30%; anticoagulation case-by-case; sinusitis dominant source.",
    trials: [
      { name: "Bhatia Lancet 2003",
        n: "Cohort review",
        question: "Modern cavernous sinus thrombosis outcomes",
        finding: "Mortality decreased from > 80% pre-antibiotic to 10-30% with broad coverage + ENT source control; anticoagulation increasingly favored",
        bias: "Pre-modern imaging; signal replicated" },
    ],
    guidelines: [
      { society: "IDSA / society consensus",
        year: 2017,
        topic: "Cavernous sinus thrombosis",
        keypoint: "Broad coverage + ENT consult + ophtho + neurology; anticoagulation case-by-case" },
    ],
    openQuestions: [
      "Anticoagulation indications — propagation vs bleed risk",
      "Steroid role — limited evidence",
    ],
  },
};

export default { id: "cavernous-thromb", regimen, decision };
