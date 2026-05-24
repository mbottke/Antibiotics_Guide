/* data · syndromeDecision — Phase D2 duration + monitoring depth.
   The structured "when to stop" and "what to check" layer that sits
   below the regimen options in the Answer Canvas. Authored at the
   same apex bar as regimenContent (Phase D1.5): every clinical
   decision point is concrete, evidence-anchored, and severity-
   tagged so a clinician can read the block as a checklist.

   The legacy `syndrome.duration` string field stays as the source
   of truth for the simple duration clock parser in ReassessmentPanel
   (it pulls the first integer and computes a stop date). This file
   adds the *richer* structured content next to it — branches by
   clinical state, stop criteria, extension triggers, monitoring
   items with severity-tagged urgency. The two coexist; the rich
   content augments the clock, doesn't replace it.

   SHAPE
   -----
   SYNDROME_DECISION[syndromeId] = {
     duration: {
       headline: "string — the bottom line, ≤ 20 words",
       evidence: "string — trial / guideline + year + finding",
       branches: [
         {
           label: "string — the clinical state branch label",
           days:  "string — MUST carry explicit units ('5 d', '1 dose',
                  '4–6 wk', 'Indefinite'); units are a safety contract,
                  never render a bare number",
           detail:"string — what counts as day 1 + extension rules",
           matchAgent?: RegExp,  // when picked agent matches, branch
                                 // highlights as the "active" duration
                                 // (cystitis Nitrofurantoin branch lights
                                 // when nitrofurantoin card is picked)
         },
       ],
       stopWhen: [ "criterion 1", "criterion 2", ... ],
       extendIf: [ "trigger 1", ... ],
     },
     monitoring: {
       headline: "string — one-sentence summary",
       items: [
         { sev: "required" | "trigger" | "consider",
           what: "string — the check / order / threshold",
           why:  "string — clinical rationale, ≤ 18 words",
           matchAgent?:  RegExp,    // optional agent filter
           matchBranch?: ["label"], // optional duration-branch filter
         },
       ],
     },
   };

   CROSS-SECTION HIGHLIGHTING
   --------------------------
   When the clinician picks a regimen card (sets pickedAgent) or
   clicks a duration branch (sets pickedBranch), monitoring items
   carrying a `matchAgent` regex or `matchBranch` list that matches
   light up with an accent left-border + "MATCHES" chip. Items
   WITHOUT filter tags are agent/branch-agnostic and render at
   default emphasis regardless of selection.

   Items are never HIDDEN by filtering — safety contract. Hiding
   important checks because the user happened to pick a different
   card would let critical monitoring slip through the cracks.
   Filtering only EMPHASIZES; everything stays visible.

   WRITING THE CONTENT
   -------------------
   duration.headline
     - One sentence. The "write this on the chart" answer.
     - Pick the *modal* case; branches handle the deviations.

   duration.evidence
     - Anchor the headline. Compressed citation form: trial year,
       finding. Examples: "BALANCE 2024 — 7 vs 14 d non-inferior in
       controlled-source GNR bacteremia"; "IDSA 2010 — 5-day
       nitrofurantoin equals 7-day".
     - Skip if there is no trial-grade anchor — say "guideline-level"
       or omit.

   duration.branches
     - One per clinical state that materially changes duration.
     - `days` is rendered as a prominent chip; keep it short
       ("7", "14", "4–6 wk", "indefinite").
     - `detail` carries the day-1 anchor and any qualifier.

   duration.stopWhen
     - The discharge / stop checklist. ≤ 8 items. Every item is
       individually verifiable at the bedside (afebrile, BCx
       negative, source controlled, off pressors).
     - Items are AND-joined: ALL must be true to stop.

   duration.extendIf
     - Triggers that legitimately add days. ≤ 5 items.

   monitoring.headline
     - One sentence. The "what to order today" answer.

   monitoring.items[].sev
     - "required" — must-do, hard-stop if missed. Renders red label
       "REQUIRED". Use for: repeat BCx in S. aureus bacteremia,
       AUC for vancomycin, echo for bacteremia, etc.
     - "trigger" — conditional / "if X then do Y". Renders amber
       label "TRIGGER". Use for: CK weekly on dapto, PET-CT if
       bacteremia persists, etc.
     - "consider" — optional escalation. Renders muted label
       "CONSIDER". Use for: PJP prophylaxis, follow-up imaging
       for abscess response, etc.

   monitoring.items[].what / .why
     - Concrete. "Repeat blood cultures q48h until clearance" not
       "monitor cultures". Numbers, not adjectives.
     - **bold** markers parsed the same way as regimenContent.

   FALLBACK
   --------
   Syndromes without an entry render no DurationBlock /
   MonitoringBlock — the legacy duration string and the
   ReassessmentPanel clock still show. The file fills in over time.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

const SYNDROME_DECISION = {

  /* ===========================================================
     CYSTITIS — uncomplicated lower-tract UTI. Short courses,
     simple monitoring. IDSA 2010 (Gupta). ========================= */
  cystitis: {
    duration: {
      headline: "Match the agent — 3 d TMP-SMX, 5 d nitrofurantoin, single dose fosfomycin.",
      evidence: "IDSA 2010 — agent-specific short courses; no advantage to extension in uncomplicated cystitis",
      branches: [
        { label: "Nitrofurantoin",  days: "5 d",      matchAgent: /nitrofurantoin/i,
          detail: "Full 5-day course; do **not** extend even if late response" },
        { label: "TMP-SMX",         days: "3 d",      matchAgent: /TMP-?\s?SMX|trimethoprim/i,
          detail: "Shortest first-line; covers early pyelo if dx wrong" },
        { label: "Fosfomycin",      days: "1 dose",   matchAgent: /fosfomycin/i,
          detail: "Single 3 g sachet; repeat dosing **does not** improve cure" },
        { label: "β-lactam (cefpodoxime, cefdinir)", days: "5–7 d",
          matchAgent: /cefpodoxime|cefdinir|β-?lactam|amoxicillin-?clavulanate/i,
          detail: "Lower cure than first-line; do not extend beyond 7 d" },
      ],
      stopWhen: [
        "Symptoms resolved (dysuria, urgency, frequency, suprapubic pain)",
        "No fever, no flank pain, no nausea/vomiting",
        "Course completed (5 d / 3 d / single dose by agent)",
      ],
      extendIf: [
        { text: "**Fever or flank pain develops** → treat as pyelonephritis (different drug + 7+ d)",
          matchCtx: { severe: true } },
        "Recurrent within 4 wk → 7-day course + culture-direct",
        "Indwelling catheter unchanged — change catheter first",
      ],
    },
    monitoring: {
      headline: "Symptoms-only follow-up in most; reculture for recurrence within 4 weeks.",
      items: [
        { sev: "required", what: "Symptom check at 48–72 h",
          why: "Persistent symptoms → reculture + alternative agent" },
        { sev: "trigger",  what: "Reculture **if** symptoms persist or recur within 4 wk",
          why: "Identifies resistant organism or upper-tract progression" },
        { sev: "trigger",  what: "**Workup pyelonephritis** if fever / flank / vomiting",
          why: "Lower-tract drug fails; needs IV β-lactam + 7+ d",
          matchBranch: ["Nitrofurantoin", "Fosfomycin"],
          matchCtx: { severe: true } },
        { sev: "consider", what: "Post-treatment urine culture in pregnancy",
          why: "ASB clearance documentation; reduces preterm birth risk" },
      ],
    },
  },

  /* ===========================================================
     S. AUREUS BACTEREMIA — the canonical multi-branch decision.
     Duration ranges from 14 d (uncomplicated) to 4–6 wk
     (endocarditis) to indefinite (hardware retained). IDSA 2011
     + 2024 SAB society guidance. =================================== */
  sab: {
    duration: {
      headline: "14 d uncomplicated; 4–6 wk if endocarditis, metastatic foci, or hardware.",
      evidence: "IDSA 2011 + 2024 — 14 d minimum for any S. aureus bacteremia; longer per complication",
      branches: [
        { label: "Uncomplicated, source controlled", days: "14 d",
          detail: "From **first negative** blood culture; minimum for any S. aureus bacteremia" },
        { label: "Complicated (metastatic foci, persistent BCx)", days: "28–42 d",
          detail: "From first negative BCx; ID + ECHO drive the call" },
        { label: "Endocarditis confirmed (native)", days: "42 d",
          detail: "Full 6 weeks IV (4 wk for selected viridans-like cases, but not S. aureus)" },
        { label: "Endocarditis (prosthetic valve)", days: "≥ 42 d",
          detail: "≥ 6 weeks + rifampin + gent (first 2 wk for synergy)" },
        { label: "Retained hardware", days: "Indefinite",
          detail: "IV course → lifelong oral suppression if hardware cannot be removed" },
      ],
      stopWhen: [
        "All blood cultures negative ≥ 48 h",
        "Afebrile ≥ 48 h",
        "Source identified + controlled (line out, abscess drained)",
        "TEE negative (or low pre-test probability + TTE negative)",
        "No metastatic foci on exam, imaging, or symptoms",
        "Clinical improvement (off pressors, WBC trending down)",
        "Minimum 14 d from first negative BCx",
      ],
      extendIf: [
        "Persistent bacteremia > 48 h on appropriate therapy",
        "TEE positive (vegetation, abscess, leaflet perforation)",
        "Metastatic foci identified (spine, joint, kidney, lung)",
        "Retained intravascular hardware (graft, valve, lead)",
        { text: "**Community-onset MRSA bacteremia** with delayed clearance",
          matchCtx: { mrsaRisk: true } },
        { text: "**Septic shock / critical illness** at presentation — delayed clearance more common",
          matchCtx: { severe: true } },
      ],
    },
    monitoring: {
      headline: "Repeat BCx q48h, TEE within 5–7 d, AUC-guide vanco, search source.",
      items: [
        { sev: "required", what: "Repeat blood cultures **q48h until clearance**",
          why: "Documents sterilization; positive at 48 h triggers TEE + source hunt" },
        { sev: "required", what: "**TTE → TEE** within 5–7 days for any S. aureus bacteremia",
          why: "Endocarditis in ~15–25%; changes duration to 4–6 wk + may need surgery" },
        { sev: "required", what: "**ID consult** for all S. aureus bacteremia",
          why: "Mortality benefit (~20% absolute) — society guideline mandate" },
        { sev: "required", what: "Vancomycin **AUC 400–600** (Bayesian); monitor SCr q24h if **CrCl < 60**",
          why: "Both under- and over-target linked to worse outcomes + AKI",
          matchAgent: /vancomycin/i },
        { sev: "required", what: "Source workup: skin/SSTI, line, joint, spine, lung",
          why: "Untreated source = persistent bacteremia + late metastatic disease" },
        { sev: "required", what: "**Daily SCr** monitoring while on vanco + concurrent nephrotoxic exposure",
          why: "AKI risk amplifies in renal-fragile patients on vanco; early detection enables dose adjustment / agent switch",
          matchCtx: { any: [{ crcl: { lt: 60 } }, { age: { gte: 75 } }] } },
        { sev: "trigger",  what: "**PET-CT or whole-body MRI** if BCx positive > 72 h on appropriate therapy",
          why: "Identifies occult endovascular / visceral source not seen initially",
          matchBranch: ["Complicated (metastatic foci, persistent BCx)", "Endocarditis confirmed (native)", "Endocarditis (prosthetic valve)"] },
        { sev: "trigger",  what: "**CK weekly on daptomycin**; hold statin if possible",
          why: "Rhabdomyolysis risk; reversible if caught early",
          matchAgent: /daptomycin/i },
        { sev: "trigger",  what: "**MRI spine** if back pain or any neurologic finding",
          why: "Vertebral osteomyelitis / epidural abscess in 5–10% of SAB",
          matchBranch: ["Complicated (metastatic foci, persistent BCx)"] },
        { sev: "trigger",  what: "**Rifampin combination** for retained hardware (after BCx clear)",
          why: "Biofilm penetration; never start until cultures positive to avoid resistance",
          matchBranch: ["Retained hardware", "Endocarditis (prosthetic valve)"] },
        { sev: "trigger",  what: "**Bedside HD coordination** — dialytic vanco dosing, ID + nephrology partnership",
          why: "Hemodialysis fundamentally alters vanco kinetics; standard AUC targets do not apply without HD-specific protocols",
          matchCtx: { hd: true } },
        { sev: "consider", what: "MRSA nares PCR if not already done",
          why: "Negative result enables narrowing / early stop of empiric vanco",
          matchAgent: /vancomycin/i },
        { sev: "consider", what: "Ophthalmology for endogenous endophthalmitis if visual symptoms",
          why: "Vision-threatening; classic in hypervirulent K. pneumoniae but also S. aureus" },
      ],
    },
  },

};

/* Lookup helpers — used by DurationBlock + MonitoringBlock. Return
   null when the syndrome has no authored content, which signals the
   components to render nothing (legacy duration clock still shows in
   ReassessmentPanel). */
function getSyndromeDecision(synId) {
  return SYNDROME_DECISION[synId] || null;
}

function getSyndromeDuration(synId) {
  return SYNDROME_DECISION[synId]?.duration || null;
}

function getSyndromeMonitoring(synId) {
  return SYNDROME_DECISION[synId]?.monitoring || null;
}

export { SYNDROME_DECISION, getSyndromeDecision, getSyndromeDuration, getSyndromeMonitoring };
