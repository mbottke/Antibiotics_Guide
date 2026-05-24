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
