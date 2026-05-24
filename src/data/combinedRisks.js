/* data · combinedRisks — Phase D3.2 cross-agent interaction
   detection. The structured "what fires when these two are picked
   together" layer. Wires off the multi-tier pickedAgents union from
   AnswerCanvas; a risk fires when EVERY regex in its `agents` array
   matches at least one agent in the union.

   The clinical contract: surface combined-regimen warnings that
   would otherwise live buried in individual cards' watchOut text
   and require the clinician to mentally cross-product them. The
   archetypal case is **vancomycin + piperacillin-tazobactam**:
   each card's watchOut mentions the AKI signal, but the warning
   only matters when both are picked together — exactly when it's
   easy to miss.

   SHAPE
   -----
   COMBINED_RISKS[i] = {
     id:       "kebab-case-stable-id",
     agents:   [ /regex/i, /regex/i, ... ],   // ALL must match across
                                              // pickedAgents (AND semantics)
     sev:      "stop" | "warn" | "note",
     headline: "string — what fires, one line",
     detail:   "string — what to do about it; ≤ 30 words",
     evidence: "string — anchor (optional)",
   };

   WRITING THE CONTENT
   -------------------
   agents
     - Each entry is a regex tested against the agent text
       (`splitRegimenOptions` output, e.g. "Cefazolin 2 g IV q8h").
     - Use lowercase-anchored class names where possible
       (/vancomycin/i, /piperacillin/i) — survives dose-string drift.
     - AND semantics across the array — every regex must match.

   sev
     - "stop" — true do-not-combine (linezolid + SSRI → serotonin).
       Use sparingly; reserved for life-threatening interactions.
     - "warn" — important interaction that requires action
       (pip-tazo + vanco AKI; vanco + aminoglycoside additive
       nephrotoxicity). The most common bucket.
     - "note" — clinically relevant but routine
       (managed-interaction class).

   headline / detail
     - Headline reads like a chart-ready sentence.
     - Detail says what to DO (substitute, monitor, hold, dose-adjust).
       Not "consider monitoring"; "monitor SCr q24h".

   evidence
     - Compressed citation: trial name + year + finding, or
       guideline + year. Skip if no anchor exists.

   FUTURE (D3.4 + D3.9)
   --------------------
   The shape is intentionally extensible. Future fields:
     ctx:             function(ctx) => boolean,  // patient state
                                                  // predicate (CrCl,
                                                  // weight, hepatic)
     concurrentMeds?: RegExp,                     // patient med list
                                                  // pattern (SSRI,
                                                  // statin, valproate)
   Entries that depend on those inputs are deferred until those
   data sources land in the case bar.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

const COMBINED_RISKS = [
  {
    id: "vanco-piptazo-aki",
    agents: [ /vancomycin/i, /piperacillin/i ],
    sev: "warn",
    headline: "Vancomycin + Piperacillin-tazobactam → AKI signal",
    detail: "Observational signal RR ~1.5 for AKI vs vancomycin alone; not seen with cefepime backbone. Consider cefepime substitution if CrCl < 60, elderly, baseline AKI, or any other nephrotoxic exposure. Monitor SCr q24h if combination retained.",
    evidence: "Multiple meta-analyses (Luther 2018, Bellos 2020); mechanism debated (acute interstitial nephritis vs SCr-assay artefact)",
  },
  {
    id: "vanco-aminoglycoside",
    agents: [ /vancomycin/i, /(?:gentamicin|tobramycin|amikacin)/i ],
    sev: "warn",
    headline: "Vancomycin + Aminoglycoside → additive nephrotoxicity",
    detail: "Both independently nephrotoxic; combination amplifies risk. Limit aminoglycoside duration to ≤ 14 d (≤ 2 wk for IE synergy band). Monitor SCr daily + AG trough. Pull the AG the moment synergy phase ends.",
    evidence: "Decades of observational data; aminoglycoside synergy indications narrow (HLAR-negative enterococcal IE × 2 wk; selected viridans IE)",
  },
  {
    id: "dapto-vanco",
    agents: [ /daptomycin/i, /vancomycin/i ],
    sev: "note",
    headline: "Daptomycin + Vancomycin — overlapping MRSA coverage",
    detail: "Rarely indicated together except as deliberate salvage for persistent MRSA bacteremia (typically dapto + ceftaroline, not + vanco). Verify intentional combination; otherwise drop one to avoid VRE selection + cost.",
  },
  {
    id: "double-anaerobe",
    agents: [ /(?:piperacillin|amoxicillin-?clavulanate|ampicillin-?sulbactam|carbapenem|meropenem|imipenem|ertapenem)/i, /metronidazole/i ],
    sev: "note",
    headline: "Redundant anaerobic coverage — β-lactam/β-lactamase-inhibitor or carbapenem + metronidazole",
    detail: "Pip-tazo, amox-clav, amp-sulbactam, and carbapenems already cover gut anaerobes adequately. Adding metronidazole rarely adds clinical benefit (CNS abscess is the recognized exception). Drop metronidazole unless C. difficile fulminant therapy is the indication.",
  },
  {
    id: "linezolid-dapto",
    agents: [ /linezolid/i, /daptomycin/i ],
    sev: "warn",
    headline: "Linezolid + Daptomycin — both used as MRSA salvage",
    detail: "Rarely combined except in highly resistant gram-positive (VRE bacteremia with dapto MIC creep). Linezolid is bacteriostatic; combo may antagonize daptomycin's cidal action in endovascular sources. Get ID guidance.",
  },

  /* ---- Phase G expansion · in-regimen drug-drug interactions ---- */

  {
    id: "macrolide-fq-qtc",
    agents: [ /(?:azithromycin|clarithromycin|erythromycin)/i,
              /(?:ciprofloxacin|levofloxacin|moxifloxacin|delafloxacin)/i ],
    sev: "warn",
    headline: "Macrolide + Fluoroquinolone → additive QTc prolongation",
    detail: "Both class-effect QTc-prolonging. Baseline ECG + correct K + Mg + avoid concurrent QTc-prolonging drugs (ondansetron, haloperidol, methadone). Monitor ECG q48h on combination. Moxifloxacin carries the largest signal among FQs.",
    evidence: "FDA class label + multiple pharmacoepi cohorts; absolute risk small but real in substrate-rich patients",
  },
  {
    id: "fq-tigecycline-qtc",
    agents: [ /(?:ciprofloxacin|levofloxacin|moxifloxacin)/i, /tigecycline/i ],
    sev: "note",
    headline: "Fluoroquinolone + Tigecycline → modest additive QTc + GI intolerance",
    detail: "Both can prolong QTc; tigecycline also drives nausea/vomiting. Most often combined in MDR intra-abdominal or polymicrobial salvage — verify intentional combination + check baseline ECG.",
  },
  {
    id: "triple-nephrotoxic",
    agents: [ /vancomycin/i, /piperacillin/i,
              /(?:gentamicin|tobramycin|amikacin|colistin|polymyxin)/i ],
    sev: "stop",
    headline: "Triple nephrotoxic — Vancomycin + Pip-tazo + Aminoglycoside/Polymyxin",
    detail: "Three independently nephrotoxic agents drive AKI substantially. Replace pip-tazo with cefepime AND limit aminoglycoside/polymyxin to ≤ 5 d. If all three must run, ICU-level renal monitoring (SCr q12h, UOP, daily MDRD), and pull the third agent the moment its narrow indication ends.",
    evidence: "Burgess CID 2018 + multiple ICU cohorts; AKI incidence 30-50% in triple-nephrotoxic substrate",
  },
  {
    id: "polymyxin-aminoglycoside",
    agents: [ /(?:colistin|polymyxin)/i, /(?:gentamicin|tobramycin|amikacin)/i ],
    sev: "warn",
    headline: "Polymyxin + Aminoglycoside → additive nephro + ototoxicity",
    detail: "Both severely nephrotoxic + ototoxic. Combine only for documented pan-resistant Gram-negative when no alternative exists. Daily SCr + audiology baseline + drug levels. Consider inhaled polymyxin for pulmonary source to reduce systemic exposure.",
  },
  {
    id: "rifampin-azole",
    agents: [ /rifampin/i, /(?:voriconazole|posaconazole|isavuconazole|fluconazole|itraconazole)/i ],
    sev: "stop",
    headline: "Rifampin + Azole — mutual CYP3A4 interaction",
    detail: "Rifampin INDUCES CYP3A4 → azole levels drop to sub-therapeutic. Treatment failure of invasive fungal infection is the risk. Pick one: drop rifampin (substitute another biofilm-active agent) OR use isavuconazole only with rifampin-level monitoring. Never combine rifampin with voriconazole.",
    evidence: "Vfend / Cresemba / Posaconazole package inserts; documented treatment failures",
  },
  {
    id: "rifampin-linezolid",
    agents: [ /rifampin/i, /linezolid/i ],
    sev: "warn",
    headline: "Rifampin + Linezolid → linezolid level drop via CYP/MAO induction",
    detail: "Rifampin reduces linezolid AUC by ~30-40% via P-gp + uridine glucuronidation. Risk of sub-therapeutic linezolid in MRSA bone/joint salvage. Consider therapeutic drug monitoring (linezolid trough > 2 mg/L) or substitute another agent.",
    evidence: "Egle CID 2005 + multiple PK studies; magnitude varies (20-50%)",
  },
  {
    id: "double-mrsa",
    agents: [ /vancomycin/i, /(?:linezolid|ceftaroline|telavancin|dalbavancin|oritavancin)/i ],
    sev: "note",
    headline: "Redundant MRSA coverage — Vancomycin + alternate anti-MRSA",
    detail: "Two anti-MRSA agents in the same regimen is rarely intentional outside specific salvage scenarios (persistent MRSA bacteremia → vanco + ceftaroline; cardiac PJI → vanco + dapto + rifampin). Verify intent; otherwise drop one to reduce cost + collateral resistance.",
  },
  {
    id: "double-azole",
    agents: [ /(?:voriconazole|fluconazole)/i, /(?:posaconazole|isavuconazole|itraconazole)/i ],
    sev: "warn",
    headline: "Redundant azole coverage — two azoles in regimen",
    detail: "Two azoles is rarely intentional. Likely a transcription error (transitioning from one to another) or unclear indication. Verify pathogen + agent — never combine for invasive fungal treatment outside very specific salvage protocols.",
  },
  {
    id: "carbapenem-bli",
    agents: [ /(?:meropenem|imipenem|doripenem|ertapenem)/i,
              /(?:meropenem-?vaborbactam|imipenem-?relebactam|ceftazidime-?avibactam)/i ],
    sev: "warn",
    headline: "Carbapenem + Carbapenem-BLI combo — verify CRE / MDR intent",
    detail: "Combining a plain carbapenem with a BLI-enhanced carbapenem rarely adds clinical benefit. The BLI combination already covers KPC/OXA producers; adding a second carbapenem doesn't broaden spectrum. Drop the plain carbapenem to reduce cost + collateral.",
  },
  {
    id: "redundant-aminoglycoside",
    agents: [ /gentamicin/i, /(?:tobramycin|amikacin)/i ],
    sev: "warn",
    headline: "Two aminoglycosides — class redundancy + additive toxicity",
    detail: "Aminoglycosides are class-redundant — adding a second doesn't broaden spectrum or improve cure. Both contribute to nephro + ototoxicity. Verify this isn't a transition (one being added before the other is stopped) — otherwise drop one.",
  },
  {
    id: "redundant-tetracycline",
    agents: [ /(?:doxycycline|minocycline|tigecycline|tetracycline|omadacycline)/i,
              /(?:doxycycline|minocycline|tigecycline|tetracycline|omadacycline)/i ],
    sev: "note",
    headline: "Two tetracycline-class — redundant ribosomal coverage",
    detail: "Tetracyclines are class-redundant. Doxycycline + minocycline + tigecycline + omadacycline all hit the 30S ribosome. Combination rarely adds benefit. Verify intent — usually one is intended to taper into the other.",
  },
  {
    id: "valproate-carbapenem",
    agents: [ /(?:meropenem|imipenem|ertapenem|doripenem)/i, /valproate/i ],
    sev: "stop",
    headline: "Carbapenem + Valproate → critical valproate level drop",
    detail: "Carbapenems lower valproate levels by ~60-80% via glucuronidation + transport effects within 24 h. Breakthrough seizures in epilepsy patients. Switch to alternative β-lactam (cefepime, ceftazidime) OR substitute valproate (levetiracetam) — same-class swap insufficient. Coordinate with neurology.",
    evidence: "FDA / Health Canada label warnings; case-series mortality in status epilepticus",
  },
  {
    id: "metronidazole-alcohol",
    agents: [ /metronidazole/i, /alcohol|ethanol/i ],
    sev: "warn",
    headline: "Metronidazole + Alcohol → disulfiram-like reaction",
    detail: "Acetaldehyde accumulation → flushing, nausea, tachycardia, hypotension. Counsel patient to avoid all alcohol-containing products (mouthwash, OTC liquid meds, hand sanitizer ingestion) during treatment + 72 h after. Signal smaller than classic teaching but real in some patients.",
    evidence: "Williams Br J Clin Pharmacol 2000 — magnitude often overstated but reactions documented",
  },
  {
    id: "ceftriaxone-calcium",
    agents: [ /ceftriaxone/i, /calcium|gluconate.*calcium/i ],
    sev: "warn",
    headline: "Ceftriaxone + IV Calcium → precipitation (neonatal contraindication)",
    detail: "Ceftriaxone-calcium precipitates in pulmonary + renal vasculature. Absolute contraindication in neonates < 28 d. In adults, separate infusions by ≥ 48 h (different IV lines preferred). Switch to cefotaxime in neonates needing concurrent calcium therapy.",
    evidence: "FDA Black Box 2007; neonatal mortality reports",
  },
  {
    id: "linezolid-dapto-vre",
    agents: [ /linezolid/i, /daptomycin/i, /vre|vancomycin-?resistant/i ],
    sev: "note",
    headline: "Linezolid + Daptomycin for VRE — verify documented MIC escalation",
    detail: "Combination occasionally appropriate for VRE bacteremia with daptomycin MIC creep (≥ 4 mg/L). Otherwise drop one — linezolid is bacteriostatic and may antagonize daptomycin's cidal effect.",
  },
];

/* Return the list of risks that fire for the given pickedAgents.
   AND semantics across each risk's `agents` array: every regex
   must match at least one entry in pickedAgents. Returns an array
   ordered by severity (stop → warn → note) so the highest-priority
   risks render first. */
function detectCombinedRisks(pickedAgents) {
  if(!pickedAgents || pickedAgents.length === 0) return [];
  /* Risks fire when every regex in the rule's agents array matches
     at least one entry in pickedAgents. The "at least one" semantics
     means a single combo-card text containing both drug names (e.g.,
     sepsis-toxic's "pip-tazo + vancomycin + clindamycin") fires the
     vanco-piptazo rule just as readily as two separate single-drug
     cards from MSSA + MRSA tiers — the clinical reality is identical. */
  const fired = COMBINED_RISKS.filter(r =>
    r.agents.every(rx => pickedAgents.some(a => rx.test(a)))
  );
  const sevRank = { stop: 0, warn: 1, note: 2 };
  return fired.slice().sort((a, b) => (sevRank[a.sev] ?? 9) - (sevRank[b.sev] ?? 9));
}

export { COMBINED_RISKS, detectCombinedRisks };
