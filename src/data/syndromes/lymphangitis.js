/* ===========================================================
   ACUTE LYMPHANGITIS — streptococcal proximal spread; PCN
   workhorse; short course; sporotrichoid for nodular. ======== */

const regimen = {
  "First-line": [
    {
      rx: /cefazolin|antistreptococcal|penicillin/i,
      pickIf: "Red streaking from a wound — strep ascending lymphangitis.",
      whyPick: [
        "**Cefazolin or antistreptococcal penicillin** — β-hemolytic strep is the dominant pathogen",
        "**MRSA cover only if purulent** — non-purulent lymphangitis is strep, full stop",
        "**Source the wound** — splinter, animal bite, IV site — address the entry point alongside antibiotics",
      ],
      watchOut: [
        { sev: "warn", text: "**Sporotrichoid pattern** (gardeners, rose-pruners) — think Sporothrix; itraconazole, not antibiotics" },
        { sev: "note", text: "Nocardia and atypical mycobacteria can mimic ascending lymphangitis in immunocompromised — culture/biopsy if no response in 72 h" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "7 d for streptococcal; consider sporotrichoid / nocardial workup if nodular or chronic.",
    evidence: "IDSA + society consensus — acute lymphangitis strep-dominant; nodular pattern → atypical organisms",
    branches: [
      { label: "Acute streptococcal lymphangitis", days: "7 d",
        detail: "Penicillin / cefazolin / cephalexin; rapid response typical",
        matchAgent: /penicillin|cefazolin|cephalexin/i },
      { label: "MRSA-suspected (purulent entry)", days: "7–10 d",
        detail: "TMP-SMX / doxy / clinda; cover MRSA only if purulent or systemic",
        matchAgent: /trimethoprim-?sulfamethoxazole|doxycycline|clindamycin/i },
      { label: "Sporotrichoid (nodular ascending)", days: "3–6 mo",
        detail: "Sporothrix — itraconazole; nocardia — TMP-SMX; mycobacteria — RIPE / per MAC; ID-driven" },
      { label: "Filarial lymphangitis (endemic exposure)", days: "DEC + per ID",
        detail: "Tropical exposure history; diethylcarbamazine; ID + parasitology" },
    ],
    stopWhen: [
      "Lymphangitic streaks resolved",
      "Erythema receding",
      "Afebrile",
      "Entry portal healed / addressed",
      "Minimum 7 d completed (acute) or per atypical course",
    ],
    extendIf: [
      { text: "**Sporotrichoid / atypical pattern** — workup + extended antifungal / antimycobacterial",
        matchCtx: { severe: true } },
      "Nocardia confirmed — per nocardia bands (months)",
      "Bacteremia confirmed — per pathogen",
      "Filarial — per ID + tropical medicine",
    ],
  },
  monitoring: {
    headline: "PCN-class for acute; exposure history; sporotrichoid pattern → atypical workup; treat entry portal.",
    items: [
      { sev: "required", what: "**Identify + treat entry portal** — abrasion, IVDU, tinea, puncture",
        why: "Source eradication prevents recurrence" },
      { sev: "required", what: "**Exposure history** — gardening, water, soil, animals, travel",
        why: "Drives workup for sporothrix (rose thorn), nocardia (soil), mycobacterium marinum (fish tank)" },
      { sev: "required", what: "**Mark proximal extent** + serial exam",
        why: "Tracks ascending spread; proximal lymphadenopathy + bacteremia drives escalation" },
      { sev: "trigger", what: "**Biopsy / aspirate** if nodular ascending pattern",
        why: "Sporotrichoid pattern (nocardia, sporothrix, mycobacterium) needs tissue diagnosis" },
      { sev: "trigger", what: "**Antifungal workup** for nodular / chronic disease",
        why: "Sporothrix endemic; itraconazole long course; ID + dermatology" },
      { sev: "trigger", what: "**Blood cultures** if systemic signs",
        why: "Bacteremia drives extension + workup; SAB if S. aureus" },
      { sev: "consider", what: "**Compression / elevation** as adjunct",
        why: "Reduces edema + accelerates clearance" },
      { sev: "consider", what: "**Lymphedema workup** for recurrent disease",
        why: "Modifiable substrate; same as erysipelas / cellulitis" },
    ],
  },
  rationale: {
    driver: "Acute lymphangitis with ascending streaks is overwhelmingly streptococcal — empiric penicillin, cefazolin, or cephalexin × 7 d resolves typical disease quickly (IDSA 2014 / Stevens). Identifying + treating the entry portal (abrasion, IVDU, tinea, puncture) prevents recurrence; marking the proximal extent allows serial tracking for ascending spread. The diagnostic pivot is nodular ascending pattern (sporotrichoid) — rose-thorn / gardening exposure → sporothrix (itraconazole × 3–6 mo); soil → nocardia (TMP-SMX, months); fish tank / aquaria → Mycobacterium marinum — and these demand biopsy plus atypical workup, not standard β-lactam therapy.",
    guideline: "ssti",
    rejected: "Reflexive β-lactam continuation for a nodular ascending pattern was deliberately rejected — sporothrix, nocardia, and atypical mycobacteria are intrinsically resistant to PCN-class agents, and time-to-correct-diagnosis drives outcome in chronic atypical lymphangitis. Empiric MRSA cover in pure acute strep lymphangitis was tempered: lymphangitic disease is strep-dominant, reflexive MRSA cover drives resistance, and IDSA 2014 reserves MRSA empirics for purulent entry or systemic signs." },
  objections: [
    { q: "Why no broad cover for acute streptococcal lymphangitis?",
      a: "Acute lymphangitis with proximal red streaking is overwhelmingly group A streptococcal; penicillin or cefazolin is curative. Reflexive vancomycin or pip-tazo adds toxicity, cost, and resistance pressure without benefit. Reserve broader cover for purulent component, immunocompromise, or atypical exposure (nodular sporotrichoid pattern) [cite:ssti]." },
    { q: "Why investigate for entry portal even after clinical resolution?",
      a: "Tinea pedis, dermatitis, and venous stasis breaks are common portals; untreated, they drive recurrence. Treating the underlying substrate is the durable intervention. Mark and document the portal; address it as part of discharge planning, not as an afterthought [cite:ssti]." },
    { q: "Why consider nontuberculous mycobacteria or sporotrichosis?",
      a: "Nodular ascending lymphangitis (sporotrichoid pattern) with gardening, aquarium, or fish-handling exposure suggests Sporothrix, Mycobacterium marinum, or Nocardia — not strep. Treatment differs entirely (itraconazole, doxycycline, TMP-SMX). History reframes the diagnosis when classic acute strep pattern doesn't fit [cite:mono]." },
  ],
  research: {
    headline: "Strep-dominant acute lymphangitis; nodular pattern → sporotrichoid workup (sporothrix, nocardia, mycobacterium marinum).",
    trials: [
      { name: "Stevens IDSA 2014",
        n: "Guideline",
        question: "Acute lymphangitis management",
        finding: "PCN-class for acute strep; sporotrichoid pattern → biopsy + ID workup; 7 d short-course standard",
        bias: "Guideline" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2014,
        topic: "Lymphangitis (Stevens)",
        keypoint: "PCN-class for acute strep; sporotrichoid → biopsy + atypical workup" },
    ],
    openQuestions: [
      "Sporotrichoid workup threshold — nodular ascending pattern",
      "Antifungal duration — itraconazole 3-6 mo for sporothrix",
    ],
  },
};

export default { id: "lymphangitis", regimen, decision };
