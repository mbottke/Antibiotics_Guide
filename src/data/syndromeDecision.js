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

  /* ===========================================================
     SEPSIS — community / undifferentiated. Surviving Sepsis 2021
     + BALANCE 2024 drive the duration story. Source control is
     the determining factor; antibiotic duration is the second
     decision behind it. =============================================  */
  sepsis: {
    duration: {
      headline: "7 d after source control for most bacteremic sepsis; longer if endovascular / immunocompromised / undrained.",
      evidence: "BALANCE 2024 (NEJM) — 7 vs 14 d non-inferior in controlled-source GNR bacteremia; Yahav 2019 same pattern",
      branches: [
        { label: "Source controlled, stable bacteremia", days: "7 d",
          detail: "From first negative BCx; BALANCE bands cover community + healthcare GNR bacteremia" },
        { label: "Endovascular / undrained source", days: "14–28 d",
          detail: "From source control if achievable; otherwise from clinical clearance; ID input drives the call" },
        { label: "Immunocompromised host", days: "14 d",
          detail: "Neutropenia, transplant, biologic — extend to cover delayed clearance + relapse risk" },
        { label: "Septic shock — slower kinetics", days: "10–14 d",
          detail: "Persistent SIRS / vasopressor need at day 5 → consider extended course + source reassessment" },
      ],
      stopWhen: [
        "Source controlled (drainage / removal / source-directed therapy)",
        "All blood cultures negative ≥ 48 h",
        "Afebrile ≥ 48 h",
        "Off vasopressors; lactate normalized",
        "Clinical improvement (WBC trending, end-organ recovery)",
        "Minimum 7 d from first negative BCx if bacteremic",
      ],
      extendIf: [
        "Persistent bacteremia > 48 h on appropriate therapy",
        "Undrained / unidentified source",
        { text: "**Endocarditis or endovascular infection** confirmed — 4–6 wk regimen replaces sepsis duration" },
        { text: "**Severe shock / multi-organ failure** at presentation — extend to 10–14 d",
          matchCtx: { severe: true } },
        /* "Immunocompromised host" — bullet stays visible at default
           emphasis. No matchCtx because the case parser does not yet
           capture an immune-status field (neutropenia, transplant,
           biologic, chronic steroid). Adding a future `immunocompromised`
           ctx field would enable elevation here without changing the
           text. Using mrsaRisk / esblRisk as proxies would be
           clinically misleading (resistance-history flags ≠ immune
           status), per PR #11 review feedback. */
        "**Immunocompromised host** — neutropenia, transplant, biologic; extend minimum to 14 d",
      ],
    },
    monitoring: {
      headline: "BCx q48h, lactate trend, source workup, narrow-on-cultures by day 3.",
      items: [
        { sev: "required", what: "**Blood cultures q48h** until clearance documented",
          why: "Persistent BCx triggers endovascular workup + source re-search" },
        { sev: "required", what: "**Lactate clearance** within first 6 h; serial monitoring until normalized",
          why: "Lactate trend predicts mortality independent of antibiotic response" },
        { sev: "required", what: "**Source workup** — imaging, line/catheter assessment, surgical eval as indicated",
          why: "Antibiotic failure most often reflects untreated source, not wrong drug" },
        { sev: "required", what: "**Narrow + de-escalate at 48–72 h** on culture data",
          why: "Continued broad therapy drives resistance + collateral damage without benefit" },
        { sev: "trigger", what: "**TEE within 5–7 d** if S. aureus / enterococcal / candidemia",
          why: "Endocarditis changes duration to 4–6 wk + may need surgery",
          matchAgent: /vancomycin|cefazolin|ampicillin|daptomycin/i },
        { sev: "trigger", what: "**Daily SCr** while on vanco + pip-tazo (AKI signal)",
          why: "Combination AKI rate RR ~1.5; consider cefepime substitution",
          matchCtx: { any: [{ crcl: { lt: 60 } }, { age: { gte: 75 } }] } },
        { sev: "trigger", what: "**Bedside dialysis coordination** for HD patients on antibiotics",
          why: "Dialytic clearance fundamentally alters dosing; ID + nephrology partnership",
          matchCtx: { hd: true } },
        { sev: "consider", what: "Procalcitonin trend (Q48h) if duration debate at day 5+",
          why: "Falling PCT supports shorter course; rising PCT supports source re-eval" },
        { sev: "consider", what: "MRSA nares PCR at presentation — guides empiric narrowing",
          why: "Negative result enables early vanco stop in non-pneumonic sepsis",
          matchAgent: /vancomycin/i },
      ],
    },
  },

  /* ===========================================================
     SEPSIS — Healthcare-associated. Prior colonization + recent
     antibiotic exposure expand the empiric breadth and the
     duration considerations. ========================================= */
  "sepsis-hcaq": {
    duration: {
      headline: "7–10 d for controlled-source bacteremia; longer if MDR organism or persistent bacteremia.",
      evidence: "BALANCE 2024 — non-inferiority of 7 d holds in healthcare cohort; ID input for ESBL/CRE durations",
      branches: [
        { label: "Source controlled, susceptible organism", days: "7 d",
          detail: "From first negative BCx; same BALANCE bands as community sepsis" },
        { label: "ESBL / AmpC / KPC bacteremia", days: "10–14 d",
          detail: "Longer course standard; ID input mandatory; carbapenem or novel β-lactam",
          matchAgent: /ceftolozane|ceftazidime-?avibactam|imipenem-?relebactam/i },
        { label: "Persistent bacteremia / line not removed", days: "14–28 d",
          detail: "From first negative BCx after source-control achieved" },
        { label: "Septic shock + MDR substrate", days: "14 d",
          detail: "Extended course standard; ICU + ID partnership; reassess at day 7 for de-escalation feasibility" },
      ],
      stopWhen: [
        "Source controlled (line removed, abscess drained, urinary obstruction relieved)",
        "All blood cultures negative ≥ 48 h",
        "Afebrile ≥ 48 h, off vasopressors",
        "Speciation + susceptibility data narrowing complete",
        "No new metastatic foci on exam / imaging",
        "Minimum 7 d for susceptible organism; 10–14 d for ESBL+",
      ],
      extendIf: [
        { text: "**ESBL / CRE / DTR-Pseudomonas** confirmed — extend minimum to 10–14 d",
          matchCtx: { esblRisk: true } },
        "Persistent bacteremia > 72 h on appropriate therapy",
        "Indwelling hardware retained (catheter, port, valve)",
        { text: "**Septic shock** + MDR substrate — extend to 14 d minimum",
          matchCtx: { severe: true } },
        "Metastatic foci identified — extend per source (osteo 6 wk, IE 4–6 wk, abscess by drainage)",
      ],
    },
    monitoring: {
      headline: "BCx q48h, MDR colonization workup, narrow on speciation, ID partnership early.",
      items: [
        { sev: "required", what: "**Blood cultures q48h** until clearance + speciation",
          why: "Persistent BCx in healthcare cohort triggers MDR workup + source re-search" },
        { sev: "required", what: "**Review prior cultures + colonization history** before narrowing",
          why: "Healthcare-cohort patients carry their own resistance signature; narrow toward known susceptibilities" },
        { sev: "required", what: "**ID consult** for any DTR-Pseudomonas / CRE / ESBL identification",
          why: "Novel β-lactam selection requires mechanism-matched drug — ID-driven",
          matchCtx: { esblRisk: true } },
        { sev: "required", what: "**Source control** — imaging + procedural eval; line removal threshold low",
          why: "Healthcare-acquired bacteremia is line-source until proven otherwise" },
        { sev: "trigger", what: "**Daily SCr** on combination + nephrotoxic exposure",
          why: "Concurrent AKI substrate common in HCAQ patients (contrast, prior abx, age)",
          matchCtx: { any: [{ crcl: { lt: 60 } }, { age: { gte: 75 } }] } },
        { sev: "trigger", what: "**TDM (vancomycin AUC; aminoglycoside trough)** strict in this cohort",
          why: "Higher renal/oto risk + frequent under- or over-dosing in complex hosts",
          matchAgent: /vancomycin|gentamicin|tobramycin|amikacin/i },
        { sev: "trigger", what: "**HD coordination** — dialytic vancomycin / β-lactam adjustment",
          why: "Dialytic clearance reshapes PK fundamentally; nephrology + pharmacy partnership",
          matchCtx: { hd: true } },
        { sev: "consider", what: "Antibiogram-driven adjustments — institution-specific resistance patterns",
          why: "Local data overrides published norms in HCAQ flora" },
      ],
    },
  },

  /* ===========================================================
     CAP — IDSA / ATS 2019 (Metlay). 5 d standard if afebrile +
     stable + tolerating oral; longer for atypicals + complicated. = */
  cap: {
    duration: {
      headline: "5 d standard if afebrile + stable + tolerating oral by 48–72 h; longer for atypicals + complications.",
      evidence: "IDSA / ATS 2019 — 5-day course non-inferior in uncomplicated CAP (Tansarli 2018 meta-analysis)",
      branches: [
        { label: "Uncomplicated CAP, stable + oral", days: "5 d",
          detail: "Counts from first effective dose; criteria for stop are AND-joined (afebrile, oral, stable)" },
        { label: "Severe CAP / ICU + appropriate response", days: "7 d",
          detail: "Extended slightly for ICU substrate; reassess for further extension only on clinical grounds" },
        { label: "Legionella / atypical confirmed", days: "10–14 d",
          detail: "Azithro 5–10 d adequate; FQ 7–14 d standard; longer if immunocompromised",
          matchAgent: /doxycycline/i },
        { label: "Necrotizing / cavitary / abscess", days: "3–6 wk",
          detail: "Treat until radiographic resolution of cavity; drainage if available; oral step-down acceptable" },
      ],
      stopWhen: [
        "Afebrile ≥ 48 h",
        "Stable vitals (RR, HR, SBP normalizing)",
        "Tolerating oral / step-down complete",
        "WBC trending toward normal",
        "Mental status returning to baseline (especially in elderly)",
        "Minimum 5 d completed",
      ],
      extendIf: [
        { text: "**Severe CAP / ICU** at presentation — extend to 7 d minimum",
          matchCtx: { severe: true } },
        { text: "**MRSA / Pseudomonas** identified — extend per pathogen (7–14 d typical)",
          matchCtx: { any: [{ mrsaRisk: true }, { pseudoRisk: true }] } },
        "Cavitary disease, lung abscess, or empyema — 3–6 wk + drainage",
        "Immunocompromised host — extend to 7–10 d minimum",
        "Inadequate response by day 3 — workup for missed pathogen / abscess / wrong drug",
      ],
    },
    monitoring: {
      headline: "Clinical response by 48–72 h; imaging only if non-response; oral step-down when stable.",
      items: [
        { sev: "required", what: "**Clinical reassessment at 48–72 h** — fever, oxygenation, mental status, oral tolerance",
          why: "Non-responders by 72 h require pathogen + diagnosis re-eval, not duration extension alone" },
        { sev: "required", what: "**IV → PO switch** when stable + tolerating oral",
          why: "Earlier step-down reduces line complications + length of stay without affecting outcome" },
        { sev: "trigger", what: "**MRSA nares PCR** if empiric vanco started",
          why: "Negative result enables early vanco stop (NPV ~96% for MRSA pneumonia)",
          matchAgent: /vancomycin|linezolid/i },
        { sev: "trigger", what: "**Repeat imaging** at day 4–7 only if no clinical response",
          why: "Radiographic lag normal; image-driven extension without clinical change rarely helpful" },
        { sev: "trigger", what: "**Steroids 5 d** (dexamethasone 6 mg) for severe CAP without shock — CAPE-COD",
          why: "Severe CAP mortality benefit; not for septic shock alone",
          matchCtx: { severe: true } },
        { sev: "trigger", what: "**Atypical workup** (Legionella urine antigen, mycoplasma PCR) if non-response by 72 h",
          why: "Missed atypical drives empiric β-lactam failure; targeted therapy changes course" },
        { sev: "consider", what: "Procalcitonin trend if duration debate at day 5",
          why: "Falling PCT supports stopping; rising PCT supports re-workup" },
        { sev: "consider", what: "**Influenza / COVID PCR** if seasonally relevant",
          why: "Viral co-infection drives antibiotic non-response; antivirals change course" },
      ],
    },
  },

  /* ===========================================================
     HAP / VAP — IDSA 2016 (Kalil). 7 d for most; extend by
     pathogen + clinical response. =================================== */
  hap: {
    duration: {
      headline: "7 d for most HAP/VAP regardless of pathogen; longer for non-fermenting GNR + immunocompromise.",
      evidence: "PneumA 2003 + IDSA 2016 — 7 d vs 15 d non-inferior; same for Pseudomonas in non-immunocompromised",
      branches: [
        { label: "Standard HAP / VAP, clinical response", days: "7 d",
          detail: "Fixed-duration regimen non-inferior to clinical-guided in most pathogens" },
        { label: "Non-fermenting GNR + immunocompromised", days: "10–14 d",
          detail: "Pseudomonas / Acinetobacter / Stenotrophomonas with immunocompromise; ID-driven",
          matchAgent: /ceftolozane|ceftazidime-?avibactam/i },
        { label: "Necrotizing / cavitary HAP", days: "3–4 wk",
          detail: "Tissue invasion + cavitation extends per radiographic + clinical response" },
        { label: "MRSA bacteremia + HAP source", days: "≥ 14 d",
          detail: "Bacteremia duration drives total; TEE indicated",
          matchAgent: /daptomycin/i },
      ],
      stopWhen: [
        "Afebrile ≥ 48 h",
        "WBC normalizing",
        "Ventilator settings improving (FiO₂, PEEP) if VAP",
        "Cultures negative or appropriately treated",
        "No persistent purulent secretions / new infiltrates",
        "Minimum 7 d completed",
      ],
      extendIf: [
        { text: "**Pseudomonas / Acinetobacter / Stenotrophomonas** + immunocompromised host",
          matchCtx: { pseudoRisk: true } },
        "Necrotizing or cavitary disease on imaging",
        { text: "**MRSA bacteremia + pulmonary source** — bacteremia duration drives total",
          matchCtx: { mrsaRisk: true } },
        "Empyema or lung abscess — add drainage + extend per source",
        "Clinical non-response by day 5 — re-eval pathogen + diagnosis before reflexive extension",
      ],
    },
    monitoring: {
      headline: "CPIS / clinical scores at 72 h; repeat sputum / ETA only if non-response; AUC vanco.",
      items: [
        { sev: "required", what: "**Clinical pulmonary infection score (CPIS)** trend at 72 h",
          why: "CPIS ≤ 6 at 72 h supports shorter course; ≥ 7 supports re-workup" },
        { sev: "required", what: "**Vancomycin AUC 400–600** if MRSA empiric or confirmed",
          why: "Both under- and over-target linked to worse outcomes + AKI; Bayesian preferred",
          matchAgent: /vancomycin/i },
        { sev: "required", what: "**Daily ventilator + sputum assessment** if VAP — settings + purulence",
          why: "Improving settings + decreasing purulent secretions are clinical proxies for response" },
        { sev: "trigger", what: "**Repeat ETA / BAL** if non-response by day 4",
          why: "MDR pathogen evolution + fungal / viral co-pathogens common in VAP" },
        { sev: "trigger", what: "**MRSA nares PCR** at presentation if empiric vanco started",
          why: "Negative result drives early vanco stop (NPV ~96%)",
          matchAgent: /vancomycin|linezolid/i },
        { sev: "trigger", what: "**Daily SCr** on combination + age + renal substrate",
          why: "Vanco + pip-tazo AKI signal; renal-fragile substrate amplifies",
          matchCtx: { any: [{ crcl: { lt: 60 } }, { age: { gte: 75 } }] } },
        { sev: "trigger", what: "**De-escalation review at 48–72 h** on culture data",
          why: "Continued broad therapy in HAP drives MDR resistance + collateral damage" },
        { sev: "consider", what: "Procalcitonin trend if duration debate",
          why: "Falling PCT in HAP supports shorter course" },
        { sev: "consider", what: "Aspergillus galactomannan if immunocompromised + non-response",
          why: "Invasive fungal pneumonia in immunocompromised drives empiric β-lactam failure" },
      ],
    },
  },

  /* ===========================================================
     MENINGITIS — IDSA 2017 (Hooton) + 2024 update. Duration by
     pathogen; dexamethasone + Hour-1 antibiotic delivery. ========== */
  meningitis: {
    duration: {
      headline: "Pathogen-driven: meningococcus 7 d, pneumococcus 10–14 d, Listeria ≥ 21 d, GNR / nosocomial 21+ d.",
      evidence: "IDSA 2017 + 2024 — pathogen-specific durations; longer for GNR / Listeria / abscess substrate",
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
  },

  /* ===========================================================
     C. DIFFICILE INFECTION — IDSA / SHEA 2021 (Johnson). Initial
     vs recurrence drives drug choice; fulminant adds IV metro +
     surgery threshold. =============================================== */
  cdiff: {
    duration: {
      headline: "10 d for initial / first-recurrence (fidaxomicin or vancomycin PO); fulminant requires combo + surgery threshold.",
      evidence: "IDSA / SHEA 2021 — fidaxomicin preferred over vanco; fulminant managed with combo + early surgical consultation",
      branches: [
        { label: "Initial episode, non-fulminant", days: "10 d",
          detail: "Fidaxomicin 200 mg BID × 10 d preferred; PO vancomycin 125 mg QID × 10 d acceptable alternative",
          matchAgent: /fidaxomicin/i },
        { label: "First recurrence", days: "10 d or pulsed",
          detail: "Fidaxomicin × 10 d OR pulsed/tapered vanco × 6–8 wk; bezlotoxumab adjunct for high-risk",
          matchAgent: /bezlotoxumab/i },
        { label: "Fulminant (ileus, megacolon, shock)", days: "10–14 d + OR",
          detail: "PO/NG vancomycin 500 mg QID + IV metronidazole; rectal vanco + early colectomy threshold",
          matchAgent: /metronidazole/i },
        { label: "Multiple recurrences (≥ 2)", days: "FMT + 10 d bridge",
          detail: "Fecal microbiota transplant or bezlotoxumab — long-term recurrence prevention" },
      ],
      stopWhen: [
        "Diarrhea resolved (≤ 3 unformed stools / day baseline)",
        "Afebrile and clinically improved",
        "WBC trending toward normal",
        "Minimum 10 d course completed",
        "No new abdominal pain / distension",
        "Discontinue offending antibiotics from inciting course if possible",
      ],
      extendIf: [
        { text: "**Fulminant disease** (ileus, megacolon, shock) — combo + extend per response",
          matchCtx: { severe: true } },
        "Persistent diarrhea > 7 d despite appropriate therapy — re-eval diagnosis + alternate etiology",
        "Pulsed / tapered course in recurrence — extends total drug exposure to 6–8 wk",
        "Severe colitis on imaging — extend by drainage + surgical eval",
      ],
    },
    monitoring: {
      headline: "Daily clinical assessment; stop offending antibiotics if possible; surgical consult low threshold for fulminant.",
      items: [
        { sev: "required", what: "**Stop offending antibiotics from inciting course** when clinically possible",
          why: "Microbiome recovery essential for cure; continued broad therapy perpetuates dysbiosis" },
        { sev: "required", what: "**Daily clinical assessment** — diarrhea frequency, abdominal exam, WBC, lactate",
          why: "Fulminant disease can evolve quickly; daily reassessment catches escalation early" },
        { sev: "required", what: "**Surgical consult** for fulminant disease at presentation + daily",
          why: "Subtotal colectomy or diverting ileostomy at right window improves mortality",
          matchCtx: { severe: true } },
        { sev: "trigger", what: "**Abdominal imaging (CT)** if abdominal distension / sepsis / no improvement",
          why: "Toxic megacolon, microperforation, pneumatosis — surgical indications" },
        { sev: "trigger", what: "**IV metronidazole + rectal vancomycin** for ileus preventing oral delivery",
          why: "Standard PO vanco useless in ileus; rectal route ensures luminal delivery",
          matchBranch: ["Fulminant (ileus, megacolon, shock)"] },
        { sev: "trigger", what: "**Bezlotoxumab** infusion at first recurrence for high-risk hosts",
          why: "Monoclonal antibody to TcdB; reduces further recurrence ~40% in high-risk",
          matchBranch: ["First recurrence"] },
        { sev: "trigger", what: "**FMT referral** at 2+ recurrences",
          why: "FMT cure rate > 90% in recurrent disease; far superior to repeated antibiotic courses",
          matchBranch: ["Multiple recurrences (≥ 2)"] },
        { sev: "consider", what: "Probiotics — controversial; some evidence for primary + secondary prevention",
          why: "S. boulardii + L. rhamnosus most-studied; institutional variation in practice" },
        { sev: "consider", what: "Infection-control measures — single room, gown + glove, environmental cleaning",
          why: "C. diff spores survive standard hand sanitizer; hand-washing + bleach essential" },
      ],
    },
  },

  /* ===========================================================
     PERITONITIS — secondary / intra-abdominal infection. SIS /
     IDSA 2017. STOP-IT drives the 4-d post-source-control regimen. */
  peritonitis: {
    duration: {
      headline: "4 d after source control for community IAI (STOP-IT); 7–10 d if source not controllable.",
      evidence: "STOP-IT 2015 (NEJM) — 4 vs 8+ d non-inferior in community IAI with adequate source control",
      branches: [
        { label: "Community IAI, source controlled", days: "4 d",
          detail: "From source-control day; STOP-IT bands cover appendicitis, diverticulitis, perforations" },
        { label: "Healthcare-associated / severe", days: "7–10 d",
          detail: "Extended for resistant flora + immunocompromise; broaden empirics accordingly" },
        { label: "Source not fully controllable", days: "10–14 d",
          detail: "Undrained collections, partial resection, ongoing leak; ID + surgery driven" },
        { label: "Fungal peritonitis confirmed", days: "≥ 14 d",
          detail: "Echinocandin × 14 d post-clearance; longer if recurrent or upper-GI source",
          matchAgent: /echinocandin|caspofungin|micafungin|anidulafungin|fluconazole/i },
      ],
      stopWhen: [
        "Source controlled (drainage, surgery, leak repair)",
        "Afebrile ≥ 48 h",
        "WBC trending toward normal; bowel function returning",
        "Tolerating oral / step-down where appropriate",
        "Imaging shows resolution / drained collection",
        "Minimum 4 d post-source-control (community IAI)",
      ],
      extendIf: [
        { text: "**Healthcare-associated** flora or recent antibiotic exposure",
          matchCtx: { esblRisk: true } },
        "Undrained / unidentified source",
        { text: "**Severe sepsis** at presentation — extend per response",
          matchCtx: { severe: true } },
        "Fungal peritonitis confirmed — echinocandin × 14+ d",
        "Persistent or recurrent abscess on imaging",
      ],
    },
    monitoring: {
      headline: "Source-control review at 72 h, cultures drive narrowing, imaging only if non-response.",
      items: [
        { sev: "required", what: "**Source-control review at 48–72 h** — imaging, drain function, surgical reassessment",
          why: "Antibiotic failure is most often source-control failure, not drug failure" },
        { sev: "required", what: "**Narrow on culture data** at 48–72 h",
          why: "Continued broad therapy drives resistance + collateral damage" },
        { sev: "required", what: "**Daily clinical assessment** — abdominal exam, WBC, lactate, sepsis trajectory",
          why: "Worsening signs trigger imaging + surgical re-eval; STOP-IT bands assume response" },
        { sev: "trigger", what: "**Repeat CT abdomen** at day 4–5 if no clinical improvement",
          why: "Undrained collections, anastomotic leak, abscess evolution — drainage targets" },
        { sev: "trigger", what: "**Echinocandin** if upper-GI perforation, post-op leak, or peritoneal Candida",
          why: "Fungal IAI carries mortality penalty if missed; species-driven narrowing later",
          matchBranch: ["Fungal peritonitis confirmed"] },
        { sev: "trigger", what: "**Daily SCr** on vanco + pip-tazo combination",
          why: "Combination AKI signal; switch to cefepime backbone if renal-fragile",
          matchAgent: /vancomycin/i,
          matchCtx: { crcl: { lt: 60 } } },
        { sev: "consider", what: "MRSA nares PCR if empiric vanco added",
          why: "Negative result enables early vanco stop",
          matchAgent: /vancomycin/i },
        { sev: "consider", what: "**Procalcitonin trend** if duration debate at day 4–5",
          why: "Falling PCT supports STOP-IT-style early stop" },
      ],
    },
  },

  /* ===========================================================
     SBP — Spontaneous bacterial peritonitis. AASLD 2021. Cirrhotic
     ascites; albumin reduces HRS + mortality. ====================== */
  sbp: {
    duration: {
      headline: "5 d ceftriaxone for community SBP; broaden + extend for healthcare-associated or non-response.",
      evidence: "AASLD 2021 — 5-day course standard; albumin 1.5/1 g/kg reduces HRS + mortality in high-risk SBP",
      branches: [
        { label: "Community SBP, susceptible", days: "5 d",
          detail: "Ceftriaxone 2 g IV q24h × 5 d; repeat paracentesis at 48 h confirms response",
          matchAgent: /ceftriaxone/i },
        { label: "Healthcare-associated SBP", days: "7–10 d",
          detail: "Broaden to pip-tazo or carbapenem; extend per response + susceptibility data",
          matchAgent: /piperacillin|meropenem|cefepime/i },
        { label: "Secondary peritonitis (mimic SBP)", days: "Per source",
          detail: "Surgical intervention + treat per peritonitis bands — not standard SBP duration" },
      ],
      stopWhen: [
        "Repeat paracentesis at 48 h: PMN drop > 25% from baseline",
        "Afebrile, hemodynamically stable",
        "Renal function stable or improving (HRS not progressing)",
        "Cultures cleared or appropriately treated",
        "Minimum 5 d completed for community SBP",
      ],
      extendIf: [
        { text: "**Inadequate PMN response** at 48-h paracentesis (< 25% drop) — broaden coverage + extend",
          matchCtx: { severe: true } },
        "Healthcare-associated organism identified — extend to 7–10 d",
        "Secondary peritonitis suspected — different treatment paradigm",
        "Spontaneous bacterial empyema co-infection — extend",
      ],
    },
    monitoring: {
      headline: "Repeat paracentesis at 48 h; albumin for HRS prevention; secondary peritonitis workup if no response.",
      items: [
        { sev: "required", what: "**Repeat paracentesis at 48 h** — PMN count + culture",
          why: "PMN drop > 25% confirms response; failure triggers broader coverage + secondary-peritonitis workup" },
        { sev: "required", what: "**Albumin 1.5 g/kg day 1 + 1 g/kg day 3** for high-risk SBP",
          why: "Cr > 1, BUN > 30, bilirubin > 4 → albumin reduces HRS + mortality (Sort 1999 NEJM)" },
        { sev: "required", what: "**Daily SCr** monitoring — HRS surveillance",
          why: "HRS is leading SBP complication; early detection drives albumin + terlipressin response" },
        { sev: "trigger", what: "**Secondary peritonitis workup** if PMN response inadequate + multiple organisms",
          why: "Surgical condition masquerading as SBP — perforation, abscess; CT + surgical consult" },
        { sev: "trigger", what: "**Norfloxacin prophylaxis** post-resolution for recurrence prevention",
          why: "≥ 1 prior SBP episode → 70% recurrence within 1 year without prophylaxis" },
        { sev: "trigger", what: "**Hepatic stage reassessment** — Child-Pugh / MELD score driving transplant candidacy",
          why: "SBP episode marks decompensation; trigger for transplant evaluation if not already listed",
          matchCtx: { hepStage: { in: ["B", "C"] } } },
        { sev: "consider", what: "**Beta-blocker reduction** if HRS develops or hemodynamic instability",
          why: "Non-selective beta-blockers may worsen HRS; case-by-case decision" },
      ],
    },
  },

  /* ===========================================================
     CHOLANGITIS — acute ascending. Tokyo TG18 + IDSA / SIS 2017.
     Source control (ERCP) is the inflection point. ================ */
  cholangitis: {
    duration: {
      headline: "4 d post-drainage for adequate source control; longer if drainage incomplete or healthcare flora.",
      evidence: "Tokyo TG18 + STOP-IT-style 4-d post-source-control regimens; ID input for ESBL/CRE durations",
      branches: [
        { label: "Successful drainage + susceptible organism", days: "4–7 d",
          detail: "From drainage day; ceftriaxone + metronidazole or pip-tazo standard" },
        { label: "Inadequate drainage / persistent obstruction", days: "10–14 d",
          detail: "Surgical re-eval; continue broad coverage until source controlled" },
        { label: "Bacteremic cholangitis", days: "7–10 d",
          detail: "Blood-culture-positive drives duration even with adequate drainage" },
        { label: "ESBL / CRE / healthcare flora", days: "10–14 d",
          detail: "Carbapenem or novel β-lactam; ID input mandatory",
          matchAgent: /ceftolozane|ceftazidime-?avibactam/i },
      ],
      stopWhen: [
        "Source controlled — biliary drainage achieved (ERCP / PTC / surgery)",
        "Afebrile ≥ 48 h",
        "Bilirubin trending toward normal",
        "WBC normalizing",
        "Blood cultures negative ≥ 48 h (if bacteremic)",
        "Minimum 4 d post-drainage for community cholangitis",
      ],
      extendIf: [
        { text: "**Drainage incomplete** or stent malfunction — extend until source controlled",
          matchCtx: { severe: true } },
        { text: "**Bacteremia** confirmed — extend to 7–10 d minimum",
          matchCtx: { severe: true } },
        { text: "**Healthcare-associated** or prior antibiotic exposure — broaden + extend",
          matchCtx: { esblRisk: true } },
        "Recurrent cholangitis episodes — workup for stricture, malignancy, retained stones",
      ],
    },
    monitoring: {
      headline: "ERCP within 24-48 h for severe; daily LFT trend; blood cultures if bacteremic.",
      items: [
        { sev: "required", what: "**ERCP / biliary drainage within 24–48 h** for severe cholangitis",
          why: "Antibiotic therapy alone insufficient with obstruction; source control is the inflection point" },
        { sev: "required", what: "**Daily LFT + bilirubin trend** + clinical assessment",
          why: "Bilirubin decline correlates with drainage adequacy + treatment response" },
        { sev: "required", what: "**Blood cultures at presentation** + repeat at 48 h if bacteremic",
          why: "~25–40% bacteremic; clearance documentation drives duration decisions" },
        { sev: "trigger", what: "**Repeat imaging** if no improvement by day 3–4",
          why: "Stent malfunction, abscess evolution, retained stones — re-drainage targets" },
        { sev: "trigger", what: "**Add vancomycin** if healthcare-associated or persistent bacteremia",
          why: "Enterococcal cholangitis more common in HCAQ; vancomycin or amp + ceftriaxone synergy",
          matchCtx: { esblRisk: true } },
        { sev: "trigger", what: "**Surgical consult** if drainage anatomically impossible or unsuccessful",
          why: "Surgical drainage / decompression when endoscopic / percutaneous fails" },
        { sev: "consider", what: "Workup for primary biliary cause — stricture, choledocholithiasis, malignancy",
          why: "Underlying anatomic / oncologic cause drives recurrence prevention strategy" },
      ],
    },
  },

  /* ===========================================================
     DIVERTICULITIS — uncomplicated vs complicated. DIABOLO trial
     supports observation for uncomplicated in selected patients. == */
  diverticulitis: {
    duration: {
      headline: "4 d post-source-control for complicated; 4–7 d outpatient for uncomplicated; observation OK for selected.",
      evidence: "STOP-IT 2015 (NEJM) for complicated; DIABOLO 2017 for uncomplicated antibiotic-free observation",
      branches: [
        { label: "Complicated, source controlled", days: "4 d",
          detail: "Post-drainage of abscess or post-surgery; STOP-IT bands apply" },
        { label: "Uncomplicated outpatient", days: "4–7 d",
          detail: "Amox-clav or cipro+metronidazole; DIABOLO supports antibiotic-free observation in selected" },
        { label: "Free perforation / peritonitis", days: "7–10 d",
          detail: "Post-surgical exploration; broaden empirics for hospital flora" },
        { label: "Recurrent / chronic disease", days: "Per episode",
          detail: "Treat each episode; surgical consult for elective resection if frequent recurrence" },
      ],
      stopWhen: [
        "Afebrile ≥ 24–48 h",
        "Abdominal pain resolving; bowel function normalizing",
        "WBC trending toward normal",
        "Source controlled (abscess drained, perforation repaired)",
        "Tolerating oral diet (clear → regular advance)",
        "Minimum 4 d completed",
      ],
      extendIf: [
        { text: "**Free perforation** or peritonitis at presentation — extend post-surgery",
          matchCtx: { severe: true } },
        "Undrained abscess > 4 cm — extend until drainage successful",
        "Persistent fever or non-improvement by day 3",
        "Immunocompromised host — lower threshold for extended therapy",
      ],
    },
    monitoring: {
      headline: "Imaging if no response by 72 h; drainage for abscess > 4 cm; colonoscopy after first episode.",
      items: [
        { sev: "required", what: "**Reassess at 48–72 h** — fever, abdominal exam, WBC, oral tolerance",
          why: "Non-responders by 72 h need imaging + drainage / surgical eval" },
        { sev: "required", what: "**Percutaneous drainage** for abscess > 4 cm",
          why: "Source control is decision-critical; antibiotics alone fail with large undrained collections" },
        { sev: "required", what: "**Surgery consult** for free perforation, persistent abscess, recurrent disease",
          why: "Surgical intervention drives outcomes in complicated disease",
          matchCtx: { severe: true } },
        { sev: "trigger", what: "**Repeat imaging** if no improvement by day 3–4",
          why: "Abscess evolution, microperforation, new collections — drainage / surgical re-eval" },
        { sev: "trigger", what: "**Colonoscopy 6 weeks post-episode** (first episode)",
          why: "Rule out malignancy / IBD mimicking diverticulitis; standard of care first-episode" },
        { sev: "consider", what: "Elective sigmoid resection for frequent recurrences or fistula",
          why: "Surgical referral after ≥ 2 episodes; case-by-case decision with colorectal surgery" },
      ],
    },
  },

  /* ===========================================================
     PANCREATIC infection — IAP / APA / ACG / AGA aligned: no
     prophylactic antibiotics in sterile necrosis. =================== */
  pancreatic: {
    duration: {
      headline: "2–3 wk for documented infected necrosis + drainage; no antibiotics for sterile necrosis.",
      evidence: "IAP / APA 2013 + ACG 2024 — no prophylaxis in sterile necrosis; carbapenem if documented infection",
      branches: [
        { label: "Documented infected necrosis", days: "2–3 wk",
          detail: "FNA-confirmed or gas-on-imaging infection; carbapenem ± step-down per cultures",
          matchAgent: /meropenem|imipenem|metronidazole/i },
        { label: "Post-drainage (PCD or surgical)", days: "1–2 wk post-drainage",
          detail: "Step-up approach; continue per clinical + drain output / culture data" },
        { label: "Sterile necrosis", days: "No antibiotics",
          detail: "Prophylactic antibiotics do NOT improve outcomes; increase fungal + MDR risk" },
      ],
      stopWhen: [
        "Documented infection cleared (cultures + imaging)",
        "Afebrile ≥ 48 h",
        "Drainage adequate (output decreasing, drain cultures negative)",
        "Clinical improvement (WBC, lipase trend, oral tolerance)",
        "Imaging shows resolution or stable collections",
      ],
      extendIf: [
        { text: "**Multi-organ failure** at presentation or evolving — extend per ICU + ID input",
          matchCtx: { severe: true } },
        "Fungal infection (Candida) in necrosis — extend per antifungal duration",
        "Repeat drainage / surgical necrosectomy needed",
        "Persistent drain output + positive cultures",
      ],
    },
    monitoring: {
      headline: "FNA / gas-on-imaging confirms infection; step-up drainage; avoid prophylaxis in sterile.",
      items: [
        { sev: "required", what: "**Confirm infection** before starting antibiotics — FNA or gas on imaging",
          why: "Sterile necrosis does NOT benefit from antibiotics; prophylaxis drives MDR + fungal infections" },
        { sev: "required", what: "**Step-up drainage approach** — PCD → endoscopic → surgical",
          why: "Minimally invasive first; PANTER trial supports step-up over upfront surgery" },
        { sev: "required", what: "**Daily clinical + lipase trend** + imaging at 7-14 d intervals",
          why: "Pancreatic infections evolve over weeks; imaging guides drain repositioning + extension" },
        { sev: "trigger", what: "**Antifungal coverage** (echinocandin) if persistent infection + Candida risk",
          why: "Long-course antibiotics + TPN drive Candida overgrowth; FNA-positive guides drug choice" },
        { sev: "trigger", what: "**Surgical consult** for walled-off necrosis or step-up failure",
          why: "Endoscopic necrosectomy or open surgical drainage if percutaneous insufficient" },
        { sev: "consider", what: "**Nutritional support** — enteral preferred over parenteral",
          why: "Enteral nutrition preserves gut barrier + reduces bacterial translocation" },
      ],
    },
  },

  /* ===========================================================
     LIVER ABSCESS — pyogenic; drainage + 4–6 wk total course.
     Hypervirulent K. pneumoniae adds metastatic-screen layer. ===== */
  liverabscess: {
    duration: {
      headline: "4–6 wk total (2 wk IV + 4 wk PO step-down) for pyogenic; longer for hypervirulent K. pneumoniae.",
      evidence: "Society consensus — IV until clinical + imaging response, then oral step-down for total 4–6 wk",
      branches: [
        { label: "Pyogenic, drained + susceptible", days: "4–6 wk total",
          detail: "2 wk IV minimum + 4 wk PO step-down; oral agent per susceptibilities" },
        { label: "Hypervirulent K. pneumoniae", days: "≥ 6 wk + screen",
          detail: "K1/K2 serotypes — endophthalmitis, CNS, lung metastatic; treat per source spread" },
        { label: "Amoebic liver abscess", days: "10 d + luminal agent",
          detail: "Metronidazole 10 d + paromomycin or iodoquinol × 7 d for luminal cyst clearance" },
        { label: "Inadequate drainage", days: "Extended beyond 6 wk",
          detail: "Continue until imaging resolution; re-drainage / surgery considered" },
      ],
      stopWhen: [
        "Imaging shows abscess resolution or stable scar",
        "Afebrile ≥ 1 week with imaging response",
        "WBC + LFTs normalizing",
        "No new metastatic foci on exam / imaging",
        "Minimum 4–6 wk total course completed",
      ],
      extendIf: [
        { text: "**Hypervirulent K. pneumoniae** confirmed — extend + screen metastatic spread",
          matchCtx: { esblRisk: true } },
        "Multiple or large abscesses requiring serial drainage",
        "Streptococcus anginosus group — destructive; longer course typical",
        "Bacteremia at presentation — endocarditis workup + extend per source",
        "Immunocompromised host — extend per case",
      ],
    },
    monitoring: {
      headline: "Percutaneous drainage early; serial imaging at 2-4 wk intervals; endophthalmitis screen if hypervirulent.",
      items: [
        { sev: "required", what: "**Percutaneous drainage** for abscesses ≥ 3–5 cm",
          why: "Antibiotic-only management adequate only for small (< 3 cm) abscesses; drainage speeds resolution" },
        { sev: "required", what: "**Workup colonic source** — colonoscopy if Streptococcus anginosus or hypervirulent Klebsiella",
          why: "Underlying colorectal pathology (cancer, diverticulitis) often the seeding source" },
        { sev: "required", what: "**Serial imaging at 2–4 wk intervals** until resolution",
          why: "Image-driven duration; longer course needed if persistent collection" },
        { sev: "trigger", what: "**Endophthalmitis screen** (ophthalmology eval) if hypervirulent K. pneumoniae",
          why: "K1/K2 serotypes seed eye + CNS + lung; vision-threatening if missed",
          matchBranch: ["Hypervirulent K. pneumoniae"] },
        { sev: "trigger", what: "**TEE** if bacteremic at presentation",
          why: "Endocarditis source workup; changes duration to 4–6 wk IV course" },
        { sev: "trigger", what: "**Amoebic serology** if travel history or epidemiologic risk",
          why: "Amoebic abscess mimics pyogenic; serology + Entamoeba antigen drives drug change",
          matchBranch: ["Amoebic liver abscess"] },
        { sev: "consider", what: "Step-down oral agent: amox-clav, FQ, TMP-SMX per susceptibilities",
          why: "Long IV courses drive line complications; oral step-down at 2 wk standard" },
      ],
    },
  },

  /* ===========================================================
     APPENDICITIS — surgical standard with antibiotic-only
     emerging for selected. CODA + STOP-IT bands. ==================== */
  appendicitis: {
    duration: {
      headline: "Single preop dose for uncomplicated; 4 d postop for perforated (STOP-IT); 10 d antibiotic-only.",
      evidence: "STOP-IT 2015 (perforated) + CODA 2020 (antibiotic-only non-inferior at 90 d, ~30% recurrence at 5 y)",
      branches: [
        { label: "Uncomplicated + prompt appendectomy", days: "Single preop dose",
          detail: "Ceftriaxone + metronidazole or pip-tazo; no postop antibiotics needed if uncomplicated" },
        { label: "Perforated + adequate source control", days: "4 d",
          detail: "Post-surgical course; STOP-IT bands apply" },
        { label: "Abscess / phlegmon (interval appendectomy)", days: "7–10 d",
          detail: "Percutaneous drainage + IV course; interval appendectomy 6–8 wk later" },
        { label: "Antibiotic-only management (selected)", days: "10 d",
          detail: "CODA-eligible patients; ~30% recurrence at 5 y — counsel before opting in" },
      ],
      stopWhen: [
        "Afebrile ≥ 24 h post-surgery",
        "Tolerating oral diet",
        "Wound / drain output appropriate",
        "WBC trending toward normal",
        "No new abdominal findings",
        "Minimum course completed per branch",
      ],
      extendIf: [
        { text: "**Free perforation + peritonitis** — extend per STOP-IT plus clinical state",
          matchCtx: { severe: true } },
        "Postoperative abscess — drainage + extension",
        "Immunocompromised host — lower threshold for extended course",
        "Appendicolith on imaging + antibiotic-only — higher recurrence; consider surgery instead",
      ],
    },
    monitoring: {
      headline: "Surgical management first-line; postop wound + abscess surveillance; colonoscopy ≥ 40 y.",
      items: [
        { sev: "required", what: "**Surgical management within 24 h** for uncomplicated appendicitis",
          why: "Antibiotics + delayed surgery acceptable in CODA-eligible; immediate surgery remains standard" },
        { sev: "required", what: "**Postop daily exam** + WBC trend",
          why: "Wound infection, postop abscess, anastomotic complications surface in first 5–7 d" },
        { sev: "trigger", what: "**CT abdomen** for postop fever / non-improvement",
          why: "Abscess, leak, retained foreign body — drainage / surgical re-eval" },
        { sev: "trigger", what: "**Interval appendectomy** at 6–8 wk for phlegmon / abscess managed nonoperatively",
          why: "Standard practice for delayed surgery after drainage; ID + surgery coordination" },
        { sev: "trigger", what: "**Colonoscopy** if age ≥ 40 y after antibiotic-only management",
          why: "Rule out underlying malignancy mimicking appendicitis" },
        { sev: "consider", what: "Counsel patients on CODA: 30% recurrence at 5 y vs surgical near-zero",
          why: "Patient autonomy choice; surgical option remains available at any time",
          matchBranch: ["Antibiotic-only management (selected)"] },
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
