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

  /* ===========================================================
     SSTI · CELLULITIS — IDSA 2014 (Stevens). 5 d standard for
     non-purulent if responding; longer for purulent + MRSA. ====== */
  cellulitis: {
    duration: {
      headline: "5 d standard for uncomplicated; 7–10 d if slow response, purulent, or MRSA-confirmed.",
      evidence: "IDSA 2014 — 5 d standard; Tansarli 2018 meta-analysis supports short course",
      branches: [
        { label: "Uncomplicated, clinical response", days: "5 d",
          detail: "Cefazolin / cephalexin; counts from first effective dose; AND-joined stop criteria",
          matchAgent: /cefazolin|cephalexin|dicloxacillin/i },
        { label: "Slow response or extensive", days: "7–10 d",
          detail: "Extend per clinical trajectory; reassess source + workup unusual organisms" },
        { label: "Purulent + MRSA-confirmed", days: "7–14 d",
          detail: "Vancomycin or TMP-SMX/doxy; longer if bacteremic or deep extension",
          matchAgent: /vancomycin|TMP-?SMX|doxycycline|clindamycin/i },
        { label: "Lymphangitic / erysipelas type", days: "5 d",
          detail: "Penicillin / cefazolin; strep-dominant disease responds quickly" },
      ],
      stopWhen: [
        "Erythema borders receding (mark + monitor)",
        "Afebrile ≥ 24–48 h",
        "WBC normalizing",
        "Pain decreasing",
        "Tolerating oral therapy",
        "Minimum 5 d completed",
      ],
      extendIf: [
        { text: "**Slow response by 48–72 h** — workup deeper infection / wrong organism",
          matchCtx: { severe: true } },
        "Purulent component / abscess → I&D + MRSA cover",
        "Bacteremia confirmed — extend per source",
        "Lymphedema / venous stasis substrate — prophylaxis consideration after resolution",
      ],
    },
    monitoring: {
      headline: "Mark erythema borders; reassess at 48–72 h; MRSA cover only for purulent component.",
      items: [
        { sev: "required", what: "**Mark erythema borders** + date — daily progression check",
          why: "Objective measure of response; spread despite antibiotic triggers re-workup" },
        { sev: "required", what: "**Reassess at 48–72 h** — fever, pain, oral tolerance",
          why: "Non-response by 72 h triggers MRSA cover, imaging for deep infection, or workup for atypical organism" },
        { sev: "trigger", what: "**Add MRSA cover** if purulent component, IVDU, or no response at 72 h",
          why: "Non-purulent cellulitis is strep-dominant; reflexive MRSA cover overused (IDSA 2014)",
          matchCtx: { mrsaRisk: true } },
        { sev: "trigger", what: "**Image (US / MRI)** if deep infection suspected",
          why: "Necrotizing fasciitis, abscess, osteomyelitis — surgical decision drivers" },
        { sev: "trigger", what: "**Treat predisposing tinea pedis** — interdigital fissures are entry portal",
          why: "Topical antifungal prevents recurrent leg cellulitis" },
        { sev: "consider", what: "**Prophylactic penicillin** for recurrent erysipelas (PATCH trials)",
          why: "Reduces time-to-next episode in lymphedema / venous stasis substrate" },
      ],
    },
  },

  /* ===========================================================
     SSTI · NECROTIZING FASCIITIS — surgical emergency; antibiotics
     adjunct. Clindamycin until toxin-producing strep excluded. ===  */
  necfasc: {
    duration: {
      headline: "Continue IV until clinically clear; clindamycin until toxin-producing organism excluded.",
      evidence: "IDSA 2014 + society consensus — no fixed duration; surgical adequacy drives course",
      branches: [
        { label: "Polymicrobial type I (gut/perineal)", days: "Until clear",
          detail: "Pip-tazo or carbapenem + vancomycin + clindamycin; continue until clinical + surgical resolution" },
        { label: "Group A strep type II (limb)", days: "10–14 d post-surgical",
          detail: "Penicillin + clindamycin; IVIG for streptococcal TSS" },
        { label: "Vibrio / Aeromonas (water exposure)", days: "10–14 d",
          detail: "Doxycycline + ceftriaxone; salt water (Vibrio) vs fresh (Aeromonas) drives speciation" },
      ],
      stopWhen: [
        "Surgical margins clean on serial debridement",
        "Afebrile ≥ 48 h",
        "Off vasopressors; clinical stability",
        "Wound closing / negative-pressure dressing working",
        "Cultures cleared / appropriate narrowing complete",
      ],
      extendIf: [
        { text: "**Persistent surgical disease** — continue until margins are clean",
          matchCtx: { severe: true } },
        "Streptococcal TSS — extend clindamycin + IVIG per response",
        "Bacteremia — duration drives per pathogen",
        "Immunocompromised host — extended course typical",
      ],
    },
    monitoring: {
      headline: "Surgical re-look q24h until margins clean; clindamycin until toxin-producer excluded; IVIG for strep TSS.",
      items: [
        { sev: "required", what: "**Surgical re-look every 24 h** until margins are clean",
          why: "Necrosis extends silently under antibiotic cover; surgical adequacy is the bedside metric" },
        { sev: "required", what: "**Continue clindamycin** until toxin-producing strep / Clostridium excluded by culture",
          why: "Ribosomal block suppresses exotoxin production; cidal antibiotic alone insufficient in TSS" },
        { sev: "trigger", what: "**IVIG 1 g/kg day 1, 0.5 g/kg days 2–3** only if streptococcal TSS confirmed",
          why: "Mortality benefit limited to GAS toxic-shock (observational + small RCTs); not indicated in polymicrobial type I",
          matchBranch: ["Group A strep type II (limb)"] },
        { sev: "trigger", what: "**Anti-MRSA agent** (vancomycin or linezolid) if MRSA-risk substrate",
          why: "Community MRSA can present as necrotizing infection; standard part of empiric in U.S.",
          matchCtx: { mrsaRisk: true } },
        { sev: "consider", what: "Hyperbaric oxygen for clostridial myonecrosis where institutionally available",
          why: "Evidence weak / contested; NEVER delay surgical debridement; not standard of care" },
        { sev: "consider", what: "Reconstructive surgery referral for closure after debridement complete",
          why: "Flap / graft / negative-pressure dressing — multi-stage closure planning" },
      ],
    },
  },

  /* ===========================================================
     SSTI · DIABETIC FOOT INFECTION — IDSA 2023. Tissue depth drives
     duration; bone involvement → osteo duration. ==================== */
  dfi: {
    duration: {
      headline: "1–2 wk mild, 2–4 wk moderate, 4–6 wk if osteo; vascular + offloading drive outcomes.",
      evidence: "IDSA 2023 — tissue-depth-stratified duration; osteo handled per bone-infection bands",
      branches: [
        { label: "Mild (no systemic, no deep tissue)", days: "1–2 wk",
          detail: "Oral cephalexin / amox-clav; outpatient management feasible" },
        { label: "Moderate / severe (deep tissue, systemic)", days: "2–4 wk",
          detail: "Pip-tazo + vancomycin; vascular + surgical consult" },
        { label: "Osteomyelitis present (probe-to-bone +)", days: "4–6 wk",
          detail: "From last surgical debridement / amputation; oral step-down per OVIVA in selected" },
        { label: "Limb-threatening / sepsis", days: "Per source",
          detail: "Emergent vascular + surgical management; antibiotic duration secondary to revascularization" },
      ],
      stopWhen: [
        "Clinical resolution of cellulitis / drainage",
        "Bone biopsy negative (if osteo treated)",
        "Wound healing trajectory established",
        "Vascular status assessed / optimized",
        "Offloading + glycemic control in place",
        "Minimum tissue-depth duration completed",
      ],
      extendIf: [
        { text: "**Limb-threatening or systemic toxicity** — extend per source + vascular consult",
          matchCtx: { severe: true } },
        "Bone involvement (probe-to-bone + or MRI positive) — extend to osteo duration",
        "Recurrent infection at same site — workup retained foreign body / inadequate prior debridement",
        "Charcot neuroarthropathy + active infection — complex multi-team management",
      ],
    },
    monitoring: {
      headline: "Probe-to-bone test, vascular assessment, offloading, multidisciplinary team coordination.",
      items: [
        { sev: "required", what: "**Probe-to-bone test** at presentation + bone biopsy if positive",
          why: "Probe-to-bone has 87% PPV for osteomyelitis; biopsy + culture drives directed therapy" },
        { sev: "required", what: "**Vascular assessment** — ABI, pulses, perfusion; revascularization if indicated",
          why: "Inadequate perfusion prevents healing regardless of antibiotic" },
        { sev: "required", what: "**Offloading** — total contact cast, removable boot, surgical offloading",
          why: "Continued pressure prevents healing; non-negotiable for plantar wounds" },
        { sev: "required", what: "**Multidisciplinary team** — podiatry, vascular, ID, endocrinology, wound care",
          why: "Team-based care has documented mortality + limb-salvage benefit" },
        { sev: "trigger", what: "**MRI foot** if osteo suspected on probe-to-bone or plain film",
          why: "Sensitive for bone marrow edema, joint involvement, abscess drainage targets" },
        { sev: "trigger", what: "**Surgical debridement** for moderate-severe + necrotic tissue",
          why: "Source control essential; antibiotics alone fail with necrosis present",
          matchCtx: { severe: true } },
        { sev: "consider", what: "**Glycemic control** — HbA1c trend, basal-bolus optimization",
          why: "Hyperglycemia impairs healing + immune function; adjunctive to all other measures" },
      ],
    },
  },

  /* ===========================================================
     SSTI · SURGICAL SITE INFECTION — IDSA 2014. STOP-IT for deep
     organ-space; superficial may need only drainage. =============== */
  ssi: {
    duration: {
      headline: "Drainage + 4 d for organ-space (STOP-IT); 3–7 d superficial; longer if hardware retained.",
      evidence: "STOP-IT 2015 — 4 d post-drainage non-inferior in complicated IAI; SSI follows same principle",
      branches: [
        { label: "Superficial / incisional", days: "3–7 d",
          detail: "Cefazolin or MRSA agent by local flora; often drainage alone suffices" },
        { label: "Deep / organ-space, drained", days: "4 d post-drainage",
          detail: "STOP-IT bands; ceftriaxone + metronidazole or pip-tazo" },
        { label: "Hardware-associated SSI", days: "≥ 6 wk + rifampin",
          detail: "Per ortho / vascular / cardiothoracic protocol; rifampin for staph + retained hardware",
          matchAgent: /rifampin/i },
        { label: "Necrotizing post-op", days: "Per necfasc",
          detail: "Treat per necrotizing fasciitis bands; surgical re-look essential" },
      ],
      stopWhen: [
        "Source controlled (drainage, surgical revision)",
        "Afebrile ≥ 24 h",
        "Wound healing or appropriate negative-pressure dressing",
        "WBC normalizing",
        "Minimum tissue-depth duration completed",
      ],
      extendIf: [
        "Hardware retained — extend per ortho / vascular / cardio protocol",
        { text: "**Septic at presentation** — extend per sepsis bands",
          matchCtx: { severe: true } },
        "Inadequate source control — extend until controlled",
        "Recurrent infection at same site — workup retained foreign body",
      ],
    },
    monitoring: {
      headline: "Open the incision early; cultures of deep tissue (not surface); hardware decision driven.",
      items: [
        { sev: "required", what: "**Open the incision early** for superficial SSI — drainage > antibiotics",
          why: "Source control is the inflection point; antibiotics adjunct" },
        { sev: "required", what: "**Deep-tissue cultures**, not surface swabs",
          why: "Surface swabs reflect colonization; deep cultures drive directed therapy" },
        { sev: "required", what: "**Surgical consult** for organ-space SSI or hardware retention",
          why: "Re-exploration vs hardware removal decisions are surgical" },
        { sev: "trigger", what: "**Image (US / CT)** for organ-space or fluid collection workup",
          why: "Undrained collections drive antibiotic failure; imaging targets drainage" },
        { sev: "trigger", what: "**Add rifampin** for staph + retained hardware",
          why: "Biofilm penetration; never start until cultures positive to prevent resistance",
          matchAgent: /rifampin/i },
        { sev: "consider", what: "Negative-pressure dressing for large or organ-space wounds",
          why: "Improves healing rates + reduces secondary procedures" },
      ],
    },
  },

  /* ===========================================================
     SSTI · FOURNIER'S GANGRENE — perineal necrotizing emergency. == */
  fournier: {
    duration: {
      headline: "Continue IV until surgical clearance; clindamycin throughout for toxin suppression.",
      evidence: "Society consensus — surgical-driven; no fixed duration; mortality 20–40% with delay",
      branches: [
        { label: "Standard polymicrobial", days: "Until clear",
          detail: "Pip-tazo + vancomycin + clindamycin; serial debridement to clean margins" },
        { label: "Clostridial confirmed", days: "10–14 d post-clearance",
          detail: "Penicillin + clindamycin + broad coverage; hyperbaric oxygen if available" },
        { label: "Severe sepsis / shock at presentation", days: "Extended",
          detail: "Per ICU + ID + surgery; long-course typical given mortality" },
      ],
      stopWhen: [
        "Surgical margins clean on serial debridement",
        "Afebrile ≥ 48 h",
        "Off vasopressors; clinical recovery",
        "Wound closing or negative-pressure dressing controlling",
        "Diverting colostomy / urinary diversion in place if needed",
      ],
      extendIf: [
        { text: "**Persistent surgical disease** — continue until margins clean",
          matchCtx: { severe: true } },
        "Bacteremia confirmed — extend per source",
        "Streptococcal TSS — clindamycin + IVIG for full course",
        "Reconstructive surgery planning — extend per multi-stage closure",
      ],
    },
    monitoring: {
      headline: "Surgery within hours; serial debridement q24h; ICU + ID + urology + general surgery team.",
      items: [
        { sev: "required", what: "**Emergent surgical debridement within hours** of presentation",
          why: "Mortality climbs 10% per hour of delay; clinical suspicion alone justifies OR" },
        { sev: "required", what: "**Serial debridement q24h** until margins are clean",
          why: "Necrosis extends through fascial planes silently under antibiotic cover" },
        { sev: "required", what: "**ICU + multi-team coordination** — urology, general surgery, ID",
          why: "Multi-organ failure common; team-based care drives outcomes" },
        { sev: "trigger", what: "**Diverting colostomy** for perineal involvement",
          why: "Fecal contamination perpetuates infection + impairs wound healing",
          matchCtx: { severe: true } },
        { sev: "trigger", what: "**Suprapubic catheter** for urinary diversion",
          why: "Indwelling urethral catheter risk in penile / scrotal involvement" },
        { sev: "consider", what: "Hyperbaric oxygen for clostridial component",
          why: "Adjunctive only; never delay surgery; institutional availability varies" },
      ],
    },
  },

  /* ===========================================================
     OSTEOMYELITIS — IDSA 2015. 6 weeks IV standard; OVIVA enables
     oral step-down at 1-2 weeks in selected. ======================== */
  osteo: {
    duration: {
      headline: "6 wk total minimum; OVIVA enables oral step-down at 1–2 wk in selected hosts.",
      evidence: "IDSA 2015 + OVIVA 2019 — oral step-down non-inferior in selected; total duration unchanged",
      branches: [
        { label: "Acute hematogenous, organism known", days: "6 wk total",
          detail: "Pathogen-directed IV for 2 wk minimum + oral step-down per OVIVA criteria" },
        { label: "Chronic / refractory", days: "Extended + surgery",
          detail: "Surgical debridement essential; antibiotics adjunctive; sequestrectomy" },
        { label: "Hardware-retained MSSA/MRSA", days: "≥ 6 wk + rifampin",
          detail: "Add rifampin once cultures positive; never empirically (resistance)",
          matchAgent: /rifampin/i },
        { label: "Vertebral osteo with deficit", days: "Per vertosteo",
          detail: "Emergent MRI + spine surgery if neuro deficit; treat per vertosteo bands" },
      ],
      stopWhen: [
        "Bone biopsy negative on completion (selected cases)",
        "ESR + CRP normalizing",
        "Clinical resolution — pain, function returning",
        "Imaging stable or improving (radiographic lag normal)",
        "Hardware decision finalized (retain vs explant)",
        "Minimum 6 wk completed",
      ],
      extendIf: [
        "Inadequate source control — retained sequestrum, hardware infection",
        "Recurrent symptoms during oral step-down — return to IV",
        { text: "**Immunocompromised host** — extend per response",
          matchCtx: { severe: true } },
        "MRSA + persistent symptoms — switch to dapto or linezolid salvage",
      ],
    },
    monitoring: {
      headline: "Bone biopsy first when stable; OVIVA oral step-down; ESR/CRP weekly; image only if non-response.",
      items: [
        { sev: "required", what: "**Bone biopsy + culture BEFORE empirics** when patient stable",
          why: "Empiric therapy halves culture yield; targeted therapy drives outcomes" },
        { sev: "required", what: "**Weekly ESR + CRP trend**",
          why: "Inflammatory marker decline correlates with response; imaging lags clinically" },
        { sev: "required", what: "**Oral step-down via OVIVA criteria** — non-inferior in selected",
          why: "Reduces line complications + length of stay; criteria include compliance + susceptibility" },
        { sev: "trigger", what: "**Repeat imaging at 4–6 wk** only if no clinical response",
          why: "Radiographic lag normal; image-driven extension without clinical change rarely helpful" },
        { sev: "trigger", what: "**Rifampin combination** for staph + retained hardware",
          why: "Biofilm penetration; never empiric; monitor LFTs + drug interactions",
          matchAgent: /rifampin/i },
        { sev: "trigger", what: "**Surgical debridement** if sequestrum / abscess / hardware infection",
          why: "Source control accelerates response; antibiotic alone fails in chronic disease" },
        { sev: "consider", what: "Hyperbaric oxygen for refractory chronic osteo",
          why: "Adjunctive evidence; institutional availability varies" },
      ],
    },
  },

  /* ===========================================================
     VERTEBRAL OSTEOMYELITIS — IDSA 2015 (Berbari). 6 weeks IV;
     neurologic deficit changes everything. =========================== */
  vertosteo: {
    duration: {
      headline: "6 wk IV minimum; emergent surgery + extend if cord compression or epidural abscess.",
      evidence: "IDSA 2015 — biopsy-first + 6 wk targeted IV; OVIVA-style step-down in selected",
      branches: [
        { label: "S. aureus, no deficit", days: "6 wk",
          detail: "Cefazolin / nafcillin (MSSA) or vancomycin (MRSA) × 6 wk; oral step-down via OVIVA" },
        { label: "Gram-negative / Pseudomonas", days: "6 wk",
          detail: "Ceftriaxone, cefepime, or ciprofloxacin per susceptibilities + bone penetration" },
        { label: "TB / brucella / fungal", days: "9–12 mo+",
          detail: "Long-course per specific pathogen; ID + culture-driven; multidrug regimens" },
        { label: "Epidural abscess + neuro deficit", days: "≥ 6 wk + surgery",
          detail: "Emergent MRI + decompression + targeted therapy" },
      ],
      stopWhen: [
        "Pain resolved, function returning",
        "ESR + CRP normalizing",
        "Imaging stable or improving",
        "No new neurologic deficit",
        "Minimum 6 wk targeted IV (or appropriate step-down) completed",
      ],
      extendIf: [
        { text: "**Epidural abscess or cord compression** — emergent surgery + extend",
          matchCtx: { severe: true } },
        "TB / brucella / fungal — extend per pathogen-specific guideline",
        "Bacteremia + osteo together — extend per longest applicable duration",
        "Immunocompromised host — extend per response",
        "Inadequate source control on imaging at 4–6 wk",
      ],
    },
    monitoring: {
      headline: "MRI before biopsy; biopsy yield-first; ESR/CRP weekly; daily neuro exam if deficit at risk.",
      items: [
        { sev: "required", what: "**MRI spine** at presentation — defines abscess, cord involvement, extent",
          why: "Drives surgical decision + biopsy targeting" },
        { sev: "required", what: "**Image-guided bone biopsy** when stable, BEFORE empiric antibiotics",
          why: "Empiric therapy halves yield; biopsy enables targeted long-course" },
        { sev: "required", what: "**Daily neuro exam** if epidural abscess or cord-compromise risk",
          why: "Progression of deficit triggers emergent surgical decompression",
          matchCtx: { severe: true } },
        { sev: "required", what: "**Weekly ESR + CRP** during course",
          why: "Inflammatory marker decline drives confidence in completing course at 6 wk" },
        { sev: "trigger", what: "**Spine surgery consult** for instability, deficit, or non-response",
          why: "Surgical fusion / decompression for selected cases",
          matchCtx: { severe: true } },
        { sev: "trigger", what: "**TB / brucella / fungal workup** if epidemiologic risk",
          why: "Pyogenic-mimicking organisms need different regimen + duration" },
        { sev: "consider", what: "Oral step-down at 2 wk per OVIVA in compliant patients",
          why: "Non-inferior in selected; reduces line burden" },
      ],
    },
  },

  /* ===========================================================
     SEPTIC ARTHRITIS — IDSA 2010. Drainage essential; 2-4 wk
     IV typical; gonococcal narrow band. ============================== */
  "septic-arthritis": {
    duration: {
      headline: "2–4 wk targeted; drainage essential; gonococcal narrows to 7 d.",
      evidence: "Society consensus — pathogen + drainage adequacy drive duration; gonococcal is the short outlier",
      branches: [
        { label: "S. aureus / gram-positive, drained", days: "2–4 wk",
          detail: "Cefazolin (MSSA) or vancomycin (MRSA) × 2–4 wk per response + joint involvement" },
        { label: "Gram-negative, drained", days: "2–3 wk",
          detail: "Ceftriaxone or cefepime per susceptibilities + joint penetration" },
        { label: "Gonococcal arthritis", days: "7 d",
          detail: "Ceftriaxone × 7 d (IV → IM); drainage rarely needed; partner treatment + STI screen" },
        { label: "Prosthetic-joint infection", days: "Per PJI",
          detail: "Treat per PJI protocol; surgical strategy drives medical management" },
      ],
      stopWhen: [
        "Joint inflammation resolving",
        "Synovial WBC declining on repeat tap",
        "Cultures cleared",
        "Range of motion returning",
        "Functional milestones met (PT progressing)",
        "Minimum 2 wk completed (longer for staph)",
      ],
      extendIf: [
        { text: "**Inadequate drainage** — repeat arthrotomy / arthroscopic washout",
          matchCtx: { severe: true } },
        "Bacteremia + arthritis together — extend per longest applicable duration",
        "Prosthetic joint involvement — treat per PJI protocol",
        "Recurrent effusion + cell-count rise — return to drainage + extension",
        "Immunocompromised host — extend per response",
      ],
    },
    monitoring: {
      headline: "Joint aspiration + drainage; serial cell counts; PT early; partner treatment for GC.",
      items: [
        { sev: "required", what: "**Joint aspiration + drainage** is the treatment",
          why: "Antibiotics alone insufficient; arthroscopic or open drainage drives outcome" },
        { sev: "required", what: "**Synovial fluid culture + Gram stain** at presentation",
          why: "Pathogen-directed therapy critical; cell count > 50,000 supports infection" },
        { sev: "required", what: "**Repeat aspiration / drainage** if effusion re-accumulates",
          why: "Serial drainage controls infection; persistent collection is treatment failure" },
        { sev: "trigger", what: "**Treat partner + STI screen** if gonococcal",
          why: "Standard public-health practice; reporting + contact tracing",
          matchBranch: ["Gonococcal arthritis"] },
        { sev: "trigger", what: "**Imaging (MRI)** if osteomyelitis or abscess suspected",
          why: "Adjacent osteomyelitis extends duration to bone-infection bands" },
        { sev: "trigger", what: "**Physical therapy early** — passive range first, active as tolerated",
          why: "Joint stiffness sequela is common; early PT preserves function" },
        { sev: "consider", what: "Hip / shoulder involvement — surgical drainage > arthroscopy",
          why: "Anatomy + complete drainage drive surgical approach" },
      ],
    },
  },

  /* ===========================================================
     PROSTHETIC JOINT INFECTION — IDSA 2013 + 2024 update. DAIR vs
     1-stage vs 2-stage; rifampin for retained hardware. =========== */
  pji: {
    duration: {
      headline: "3 mo total (hip) / 6 mo total (knee) for DAIR + retained hardware; 4–6 wk for 2-stage exchange.",
      evidence: "IDSA 2013 + 2024 update — strategy-specific durations; rifampin combination central to DAIR",
      branches: [
        { label: "DAIR — retained hardware", days: "3 mo hip / 6 mo knee",
          detail: "Pathogen-directed IV × 2–6 wk + oral step-down with rifampin combo for total duration",
          matchAgent: /rifampin/i },
        { label: "2-stage exchange (explant + spacer + re-implant)", days: "4–6 wk between stages",
          detail: "IV during stage 1 → 4–6 wk minimum → reimplant when cleared" },
        { label: "1-stage exchange", days: "3 mo total",
          detail: "Less common; reserved for selected susceptible organisms + intact soft tissue" },
        { label: "Suppressive (irretrievable hardware)", days: "Lifelong oral",
          detail: "TMP-SMX, doxycycline, or pathogen-directed; ID + ortho ongoing follow-up" },
      ],
      stopWhen: [
        "Pathogen cleared on cultures",
        "ESR + CRP normalizing",
        "Joint pain resolved, function returning",
        "Imaging shows stable or improving findings",
        "Multidisciplinary team agreement on stop",
        "Minimum strategy-specific duration completed",
      ],
      extendIf: [
        "DAIR failure (persistent symptoms / re-collection) — convert to 2-stage exchange",
        { text: "**Severe systemic illness** at presentation — extend per response",
          matchCtx: { severe: true } },
        "Immunocompromised host — extended course or suppression",
        "Multiple organisms / resistant flora — ID-driven extension",
        "Hardware abandonment + chronic infection — lifelong suppression",
      ],
    },
    monitoring: {
      headline: "Pathogen sampling before empirics; rifampin for retained hardware; ESR/CRP trend; multidisciplinary team.",
      items: [
        { sev: "required", what: "**3–5 deep tissue cultures + sonication of explanted hardware**",
          why: "Polymicrobial + biofilm flora; multiple cultures + sonication maximizes yield" },
        { sev: "required", what: "**Multidisciplinary team** — ortho, ID, plastics, anesthesia",
          why: "Surgical strategy + antibiotic plan must be co-decided" },
        { sev: "required", what: "**Rifampin combination** for retained hardware + staph",
          why: "Biofilm penetration; never start until cultures positive; never as monotherapy",
          matchAgent: /rifampin/i },
        { sev: "required", what: "**ESR + CRP at baseline + weekly** during course",
          why: "Decline correlates with response; rising values trigger imaging + surgical re-eval" },
        { sev: "trigger", what: "**Imaging (X-ray + MRI)** at 6 wk + 3 mo intervals",
          why: "Bone-prosthesis interface changes drive surgical re-decisions" },
        { sev: "trigger", what: "**Rifampin LFT + drug-interaction screen**",
          why: "Hepatotoxic + induces CYP3A4 (warfarin, OCPs, statins, immunosuppressants)",
          matchAgent: /rifampin/i },
        { sev: "consider", what: "Patient education on lifelong follow-up",
          why: "PJI recurrence risk persists; symptoms must trigger early presentation" },
      ],
    },
  },

  /* ===========================================================
     PYELONEPHRITIS — IDSA 2010 (Gupta) + 2024 update. 7 d FQ for
     uncomplicated; 10–14 d β-lactam; carbapenem path for ESBL. ===  */
  pyelo: {
    duration: {
      headline: "7 d FQ for uncomplicated; 10–14 d β-lactam; carbapenem for ESBL — outpatient feasible in many.",
      evidence: "IDSA 2010 + Tansarli 2018 meta — 7 d FQ non-inferior to 14 d; β-lactam needs 10–14 d",
      branches: [
        { label: "Uncomplicated, FQ-treated", days: "7 d",
          detail: "Cipro/levo; outpatient acceptable if afebrile + tolerating oral + reliable follow-up",
          matchAgent: /ciprofloxacin|levofloxacin/i },
        { label: "β-lactam-treated", days: "10–14 d",
          detail: "Ceftriaxone → oral cefpodoxime / amox-clav; longer course than FQ" },
        { label: "Complicated / ESBL", days: "10–14 d carbapenem",
          detail: "Ertapenem (outpatient) or meropenem (severe); ID for novel β-lactams if resistant",
          matchAgent: /ertapenem|meropenem/i },
        { label: "Pregnancy", days: "10–14 d",
          detail: "Ceftriaxone IV then oral cephalexin / amox-clav; FQ contraindicated",
          matchAgent: /cephalexin/i },
      ],
      stopWhen: [
        "Afebrile ≥ 48 h",
        "Flank pain resolving; nausea / vomiting cleared",
        "WBC normalizing",
        "Tolerating oral therapy + adequate intake",
        "Source / obstruction relieved if present",
        "Minimum 7 d FQ / 10–14 d β-lactam completed",
      ],
      extendIf: [
        { text: "**Urinary obstruction / stone / hydronephrosis** — relieve obstruction + extend",
          matchCtx: { severe: true } },
        "Renal / perinephric abscess on imaging — drainage + extend per source",
        { text: "**ESBL / CRE / MDR organism** confirmed — broaden + extend to 14 d",
          matchCtx: { esblRisk: true } },
        "Bacteremia confirmed — extend per organism (7–14 d typical)",
        "Immunocompromised host — extend per response",
      ],
    },
    monitoring: {
      headline: "Urine + blood cultures, imaging if no response by 72 h, urologic eval for obstruction.",
      items: [
        { sev: "required", what: "**Urine culture + susceptibilities** before empirics",
          why: "Narrowing on susceptibilities at 48–72 h drives stewardship + outcome" },
        { sev: "required", what: "**Blood cultures** if febrile + systemic signs",
          why: "Bacteremia in ~25%; positive culture drives broader workup + duration" },
        { sev: "required", what: "**Imaging (CT or US)** if no clinical response by 72 h",
          why: "Obstruction, abscess, emphysematous change — surgical / interventional decisions" },
        { sev: "trigger", what: "**Urology consult** for obstructed kidney + sepsis",
          why: "Decompression (stent, nephrostomy) is the inflection point for severe disease",
          matchCtx: { severe: true } },
        { sev: "trigger", what: "**Workup ESBL / MDR organism** if recurrent or recent broad antibiotics",
          why: "Empiric pivot to carbapenem; ID consult for resistant flora",
          matchCtx: { esblRisk: true } },
        { sev: "consider", what: "Workup for predisposing factors — stone disease, reflux, neurogenic bladder",
          why: "Recurrence prevention; urology follow-up for ongoing risk" },
      ],
    },
  },

  /* ===========================================================
     CAUTI — IDSA 2009 + 2010 update. 7 d standard; remove
     catheter if possible. =========================================== */
  cauti: {
    duration: {
      headline: "7 d if prompt resolution; 10–14 d if delayed response or catheter retained.",
      evidence: "IDSA 2010 — 7 d for prompt response, 10–14 d for delayed; remove or change catheter if possible",
      branches: [
        { label: "Prompt response, catheter removed", days: "7 d",
          detail: "Removal / change of catheter is essential; antibiotic course from change day",
          matchAgent: /ceftriaxone|ciprofloxacin/i },
        { label: "Delayed response or catheter retained", days: "10–14 d",
          detail: "Catheter biofilm prolongs treatment; switch catheter at start of therapy" },
        { label: "ESBL / Pseudomonas / MDR", days: "10–14 d",
          detail: "Cefepime, pip-tazo, or carbapenem per susceptibilities",
          matchAgent: /cefepime|piperacillin|meropenem/i },
      ],
      stopWhen: [
        "Afebrile ≥ 48 h",
        "Urinary symptoms resolved (when assessable)",
        "WBC normalizing",
        "Catheter removed or changed",
        "Source controlled (obstruction relieved)",
        "Minimum 7 d completed",
      ],
      extendIf: [
        "Catheter cannot be removed or changed",
        { text: "**Pseudomonas / ESBL / MDR** identified — extend per organism",
          matchCtx: { esblRisk: true } },
        "Bacteremia confirmed — extend per source",
        { text: "**Septic shock** at presentation — extend per ICU + response",
          matchCtx: { severe: true } },
      ],
    },
    monitoring: {
      headline: "Remove or change catheter; treat ASB only in pregnancy / pre-procedure; minimize catheter days.",
      items: [
        { sev: "required", what: "**Remove or change the urinary catheter** if at all possible",
          why: "Biofilm renders antibiotics partially effective; new catheter = better drainage" },
        { sev: "required", what: "**Treat asymptomatic bacteriuria only** in pregnancy or pre-urologic procedure",
          why: "ASB treatment in catheterized patients drives resistance without benefit (IDSA 2019)" },
        { sev: "required", what: "**Urine culture from new catheter** if cultures needed",
          why: "Cultures from old catheter reflect biofilm colonization, not bladder infection" },
        { sev: "trigger", what: "**Imaging** if no response by 72 h or sepsis",
          why: "Obstruction, abscess, papillary necrosis drive surgical / interventional decisions" },
        { sev: "trigger", what: "**Catheter-day reduction protocol** — daily review of catheter necessity",
          why: "Each catheter day adds infection risk; bladder retraining + intermittent cath alternatives" },
        { sev: "consider", what: "**Bladder scan + intermittent cath** alternatives for chronic catheter patients",
          why: "Reduces ongoing infection risk + improves quality of life" },
      ],
    },
  },

  /* ===========================================================
     PROSTATITIS — IDSA + AUA. 4 wk acute; 6 wk chronic for
     bacterial prostatitis. Long courses, tissue penetration matter. */
  prostatitis: {
    duration: {
      headline: "4 wk acute bacterial prostatitis; 6 wk chronic; FQ or TMP-SMX for prostatic penetration.",
      evidence: "AUA + IDSA — long-course tissue-penetrating agent; FQ resistance rising in community E. coli",
      branches: [
        { label: "Acute bacterial prostatitis", days: "4 wk",
          detail: "Ceftriaxone IV initial → oral FQ or TMP-SMX; long course for prostatic tissue penetration",
          matchAgent: /ciprofloxacin|levofloxacin|TMP-?SMX/i },
        { label: "Chronic bacterial prostatitis", days: "6 wk",
          detail: "Oral FQ or TMP-SMX × 6 wk; recurrence common; ID + urology partnership" },
        { label: "Acute + bacteremia / prostatic abscess", days: "4–6 wk + drainage",
          detail: "IV initial + drainage (transurethral or transrectal); duration from drainage day" },
      ],
      stopWhen: [
        "Symptom resolution (urinary, perineal pain, fever)",
        "Cultures cleared (urine, prostatic secretions)",
        "PSA + WBC normalizing",
        "Tolerating oral therapy",
        "Minimum 4 wk acute / 6 wk chronic completed",
      ],
      extendIf: [
        "Prostatic abscess identified — drainage + extension",
        "Bacteremia or systemic sepsis — extend per source",
        { text: "**Resistant organism** identified — ID + susceptibility-driven extension",
          matchCtx: { esblRisk: true } },
        "Recurrence at < 6 wk post-completion — chronic bacterial prostatitis suspected",
      ],
    },
    monitoring: {
      headline: "Avoid prostatic massage in acute; TRUS for abscess workup; long-course tissue-penetrating agent.",
      items: [
        { sev: "required", what: "**Avoid prostatic massage / instrumentation** in acute disease — bacteremia risk",
          why: "Acute inflammation + massage triggers systemic seeding" },
        { sev: "required", what: "**Tissue-penetrating oral agent** for step-down — FQ or TMP-SMX only",
          why: "β-lactams have poor prostatic penetration; cephalexin / amox-clav inadequate" },
        { sev: "trigger", what: "**Transrectal ultrasound** for abscess workup",
          why: "Prostatic abscess complicates ~10% of acute disease; drainage indication" },
        { sev: "trigger", what: "**Pre- + post-massage urine cultures** in chronic workup",
          why: "Meares-Stamey test localizes infection to prostate vs urethra/bladder" },
        { sev: "trigger", what: "**Urology consult** for chronic, recurrent, or abscess presentations",
          why: "Surgical drainage, transurethral resection considerations" },
        { sev: "consider", what: "**Pelvic floor PT** for chronic prostatitis / pelvic pain syndrome",
          why: "Often non-bacterial; PT + alpha-blockers help when antibiotics inadequate" },
      ],
    },
  },

  /* ===========================================================
     UROSEPSIS — bacteremic UTI; source control + sepsis bands. === */
  urosepsis: {
    duration: {
      headline: "7 d controlled-source bacteremic UTI (BALANCE); longer if abscess, obstruction, or ESBL.",
      evidence: "BALANCE 2024 — 7 d non-inferior in controlled-source UTI bacteremia; ID for resistant flora",
      branches: [
        { label: "Source controlled (drained, obstruction relieved)", days: "7 d",
          detail: "From first negative BCx; BALANCE bands apply" },
        { label: "Inadequate source control", days: "10–14 d",
          detail: "Obstructed kidney, undrained abscess, retained catheter" },
        { label: "ESBL / MDR organism", days: "10–14 d",
          detail: "Carbapenem or novel β-lactam; ID input",
          matchAgent: /ertapenem|meropenem|ceftolozane|ceftazidime-?avibactam/i },
      ],
      stopWhen: [
        "Source controlled (obstruction relieved, abscess drained, catheter changed)",
        "Blood cultures cleared ≥ 48 h",
        "Afebrile ≥ 48 h, off vasopressors",
        "Urinary symptoms resolved (when assessable)",
        "Renal function stable / improving",
        "Minimum 7 d from first negative BCx",
      ],
      extendIf: [
        { text: "**Urinary obstruction / stone / hydronephrosis** — relieve + extend",
          matchCtx: { severe: true } },
        "Renal or perinephric abscess — drainage + extension",
        { text: "**ESBL / CRE / MDR organism** — extend per ID input",
          matchCtx: { esblRisk: true } },
        "Persistent bacteremia > 72 h on appropriate therapy",
      ],
    },
    monitoring: {
      headline: "Source-control imaging first 24 h; urology consult for obstruction; broad empirics until cultures back.",
      items: [
        { sev: "required", what: "**Imaging (CT or US) within 24 h** to rule out obstruction / abscess",
          why: "Source control is the inflection point; antibiotics fail with obstruction" },
        { sev: "required", what: "**Blood + urine cultures** before first dose",
          why: "Empiric therapy halves yield; targeted therapy at 48 h drives outcomes" },
        { sev: "required", what: "**Urology consult** for obstructed sepsis — decompression (stent / nephrostomy)",
          why: "Decompression within hours of sepsis recognition drives mortality reduction",
          matchCtx: { severe: true } },
        { sev: "trigger", what: "**Repeat BCx at 48 h** to confirm clearance",
          why: "Persistent bacteremia triggers endocarditis workup + extended course" },
        { sev: "trigger", what: "**Daily SCr** + AKI surveillance",
          why: "Sepsis + obstruction + nephrotoxic antibiotics drive AKI risk",
          matchCtx: { any: [{ crcl: { lt: 60 } }, { age: { gte: 75 } }] } },
        { sev: "consider", what: "**MRSA / Enterococcus / Pseudomonas cover** if healthcare exposure",
          why: "Empiric broadening in HCAQ patients; narrow on cultures" },
      ],
    },
  },

  /* ===========================================================
     EPIDIDYMO-ORCHITIS — CDC 2021 STI + UTI guidelines. ============ */
  epididymo: {
    duration: {
      headline: "10 d ceftriaxone+doxy for STI etiology; 10–14 d FQ for enteric pathogens.",
      evidence: "CDC 2021 STI + AUA — pathogen-driven; rule out testicular torsion in acute presentation",
      branches: [
        { label: "STI etiology (GC/Chlamydia, age < 35)", days: "10 d",
          detail: "Ceftriaxone IM single dose + doxycycline 100 mg PO BID × 10 d; treat partner",
          matchAgent: /doxycycline/i },
        { label: "Enteric etiology (age ≥ 35, insertive anal sex, instrumentation)", days: "10–14 d",
          detail: "FQ (levofloxacin / ciprofloxacin) × 10–14 d; rule out underlying GU pathology",
          matchAgent: /levofloxacin|ciprofloxacin/i },
        { label: "Mixed / unclear etiology", days: "10–14 d",
          detail: "Cover both STI + enteric: ceftriaxone + doxy + FQ; reassess on cultures" },
      ],
      stopWhen: [
        "Scrotal pain + swelling resolving",
        "Afebrile ≥ 24 h",
        "Cultures cleared (urine, urethral if applicable)",
        "Partner treated (if STI etiology)",
        "Minimum 10 d (STI) / 10–14 d (enteric) completed",
      ],
      extendIf: [
        "Abscess identified — drainage + extension",
        { text: "**Necrosis or Fournier's progression** — surgical emergency",
          matchCtx: { severe: true } },
        "Underlying GU pathology — extend per workup",
        "Failed first-line — switch agent + extend",
      ],
    },
    monitoring: {
      headline: "Rule out testicular torsion first; treat partner for STI; workup GU pathology for enteric.",
      items: [
        { sev: "required", what: "**Rule out testicular torsion** — ultrasound with Doppler if acute presentation",
          why: "Torsion is surgical emergency; missing it costs the testicle" },
        { sev: "required", what: "**Treat sexual partner(s)** for STI etiology + 7-day abstinence",
          why: "Standard CDC public-health protocol; reduces reinfection + spread" },
        { sev: "required", what: "**Test for HIV, syphilis, hepatitis B/C** at presentation",
          why: "Co-infection screening; sexual-health visit opportunity" },
        { sev: "trigger", what: "**Urology workup** for enteric etiology — BPH, urethral stricture, neurogenic bladder",
          why: "Predisposing factors drive recurrence; address underlying" },
        { sev: "trigger", what: "**Scrotal ultrasound** if abscess suspected or no response by 72 h",
          why: "Drainage targets + rules out testicular involvement / necrosis" },
        { sev: "consider", what: "**Scrotal elevation + NSAIDs** for symptom management",
          why: "Reduces edema + pain; adjunctive to antibiotics" },
      ],
    },
  },

  /* ===========================================================
     RENAL / PERINEPHRIC ABSCESS — drainage + 4–6 wk. ============== */
  renalabscess: {
    duration: {
      headline: "4–6 wk total (2 wk IV + oral step-down) for drained abscess; longer if undrained.",
      evidence: "Society consensus — drainage essential for > 3–5 cm; antibiotic course from drainage day",
      branches: [
        { label: "Drained renal abscess", days: "4–6 wk total",
          detail: "2 wk IV minimum + 2–4 wk oral step-down; agent per susceptibilities" },
        { label: "Perinephric abscess", days: "6 wk + drainage",
          detail: "Often requires surgical or percutaneous drainage; longer course typical" },
        { label: "Hematogenous S. aureus seeding", days: "4–6 wk + TEE",
          detail: "TEE + endocarditis workup; treat per S. aureus bacteremia bands" },
      ],
      stopWhen: [
        "Imaging shows abscess resolution",
        "Cultures cleared",
        "Afebrile ≥ 1 week + clinical improvement",
        "WBC + inflammatory markers normalizing",
        "Minimum 4–6 wk total completed",
      ],
      extendIf: [
        "Undrained abscess > 3 cm",
        { text: "**Hematogenous S. aureus** seeding — TEE + endocarditis workup",
          matchCtx: { mrsaRisk: true } },
        "Diabetic / immunocompromised host — extend per response",
        "Recurrent abscess — workup for predisposing GU pathology",
      ],
    },
    monitoring: {
      headline: "Percutaneous drainage ≥ 3 cm; image-driven duration; endocarditis workup if S. aureus.",
      items: [
        { sev: "required", what: "**Percutaneous drainage** for abscess ≥ 3–5 cm",
          why: "Antibiotic-only management adequate only for small abscesses; drainage speeds resolution" },
        { sev: "required", what: "**Serial imaging at 2–4 wk intervals**",
          why: "Image-driven duration; persistent collection extends therapy + re-drainage decisions" },
        { sev: "required", what: "**Urology consult** for predisposing factors — stones, reflux, neurogenic bladder",
          why: "Underlying pathology drives recurrence prevention" },
        { sev: "trigger", what: "**TEE + endocarditis workup** if hematogenous S. aureus",
          why: "Endovascular source seeds kidney; missed = treatment failure",
          matchCtx: { mrsaRisk: true } },
        { sev: "trigger", what: "**Diabetic ketoacidosis surveillance** if diabetic + abscess",
          why: "Emphysematous changes + DKA → emergent surgical decompression" },
        { sev: "consider", what: "Step-down oral agent: cipro, TMP-SMX per susceptibilities",
          why: "Long IV courses → line complications; oral step-down at 2 wk standard" },
      ],
    },
  },

  /* ===========================================================
     EMPHYSEMATOUS UTI — surgical emergency in diabetics. ============ */
  "emphysematous-uti": {
    duration: {
      headline: "Surgical / urologic emergency; nephrectomy + 2–4 wk antibiotics for severe.",
      evidence: "Society consensus — type-stratified outcomes; type 1 (parenchymal) = nephrectomy frequently",
      branches: [
        { label: "Mild gas (collecting system only)", days: "2–3 wk",
          detail: "Pip-tazo or carbapenem + drainage / stent; nephrectomy if no response",
          matchAgent: /piperacillin|meropenem/i },
        { label: "Severe parenchymal involvement", days: "Nephrectomy + 4 wk",
          detail: "Mortality 25–50%; emergent surgery + extended antibiotic course" },
        { label: "Bilateral or transplant kidney", days: "Extended",
          detail: "Renal-preserving approaches; multidisciplinary team essential" },
      ],
      stopWhen: [
        "Imaging shows resolution of gas + parenchymal changes",
        "Cultures cleared",
        "Afebrile ≥ 1 week",
        "Renal function stabilized (or replacement therapy if needed)",
        "Glycemic control optimized",
      ],
      extendIf: [
        { text: "**Parenchymal extension** (type 1) — surgical emergency",
          matchCtx: { severe: true } },
        "Diabetic ketoacidosis or hyperosmolar state — complex co-management",
        "Bilateral involvement — extend per response + renal preservation",
        "Persistent gas on imaging at 2 wk — drainage / surgery escalation",
      ],
    },
    monitoring: {
      headline: "Emergent urology / surgery; glycemic control; DKA surveillance; multidisciplinary team.",
      items: [
        { sev: "required", what: "**Emergent urology / surgery consult** at presentation",
          why: "Type 1 parenchymal involvement → nephrectomy often required" },
        { sev: "required", what: "**DKA / hyperosmolar surveillance + correction**",
          why: "Underlying metabolic decompensation drives outcomes; co-management mandatory" },
        { sev: "required", what: "**Imaging (CT preferred) within hours** of suspicion",
          why: "Type stratification (parenchymal vs collecting system) drives surgical decision" },
        { sev: "trigger", what: "**Drainage / stenting** for collecting-system disease",
          why: "Decompression may preserve kidney if parenchyma intact" },
        { sev: "trigger", what: "**Nephrectomy** for parenchymal disease + sepsis",
          why: "Mortality 25–50% with parenchymal involvement; surgical emergency",
          matchCtx: { severe: true } },
        { sev: "consider", what: "**Glycemic control protocol** post-acute phase",
          why: "Recurrence prevention; HbA1c < 7 reduces re-infection risk" },
      ],
    },
  },

  /* ===========================================================
     BRAIN ABSCESS — IDSA / SHEA + neurosurgery consensus. 6–8 wk
     IV with aspiration/drainage; immunocompromised needs broader. ====  */
  brainabscess: {
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
  },

  /* ===========================================================
     EPIDURAL ABSCESS — emergent surgical decompression for deficit. = */
  epidural: {
    duration: {
      headline: "6 wk IV minimum; emergent surgery for deficit; pathogen-directed long course.",
      evidence: "Society consensus — surgical decompression + 6 wk IV; longer if vertebral osteo involved",
      branches: [
        { label: "S. aureus, drained + targeted", days: "6 wk",
          detail: "MSSA: cefazolin/nafcillin; MRSA: vancomycin or daptomycin; from drainage" },
        { label: "GNR (rare)", days: "6 wk",
          detail: "Ceftriaxone / cefepime per susceptibilities" },
        { label: "Concurrent vertebral osteomyelitis", days: "6–8 wk + surgery",
          detail: "Combined epidural + osteo treatment; longer per response" },
      ],
      stopWhen: [
        "Imaging shows abscess resolution",
        "Neurologic exam stable or improving",
        "Inflammatory markers normalizing",
        "Cultures cleared",
        "Minimum 6 wk completed",
      ],
      extendIf: [
        { text: "**Concurrent vertebral osteomyelitis** — extend to longest applicable duration",
          matchCtx: { severe: true } },
        "Persistent / recurrent abscess on serial MRI",
        "Incomplete surgical drainage — re-explore",
        "Immunocompromised host — extend per response",
      ],
    },
    monitoring: {
      headline: "Emergent surgical decompression for deficit; whole-spine MRI for skip lesions; long IV course.",
      items: [
        { sev: "required", what: "**Emergent surgical decompression** for neurologic deficit",
          why: "Time to decompression is the inflection point; minutes-to-hours determine outcome",
          matchCtx: { severe: true } },
        { sev: "required", what: "**Whole-spine MRI** at presentation — skip lesions in 15–30%",
          why: "Missing skip lesions causes treatment failure + late deficit" },
        { sev: "required", what: "**Daily neuro exam** — sensory level, motor strength, sphincter function",
          why: "Progressing deficit drives emergent re-imaging + surgical re-look" },
        { sev: "required", what: "**Repeat blood cultures at 48 h** — confirm clearance",
          why: "Persistent bacteremia triggers endocarditis + endovascular workup" },
        { sev: "trigger", what: "**ESR + CRP weekly** during course",
          why: "Decline confirms response; rising values trigger re-imaging" },
        { sev: "consider", what: "Steroids — controversial; reserve for cord edema with deficit",
          why: "Anti-inflammatory benefit unproven; case-by-case neurosurgery decision" },
      ],
    },
  },

  /* ===========================================================
     SUBDURAL EMPYEMA — surgical emergency from sinus/otitis spread. */
  "subdural-empyema": {
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
  },

  /* ===========================================================
     CAVERNOUS SINUS THROMBOSIS — facial/sinus infection + cranial
     nerve deficits. Anticoagulation controversial. ================== */
  "cavernous-thromb": {
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
  },

  /* ===========================================================
     VENTRICULITIS — CSF shunt / drain associated; intraventricular
     antibiotics for refractory. ===================================== */
  ventriculitis: {
    duration: {
      headline: "2–3 wk after CSF sterilization; shunt removal preferred; intraventricular for refractory.",
      evidence: "IDSA 2017 — CSF-confirmed duration post-clearance; explant drives outcomes",
      branches: [
        { label: "Standard bacterial, shunt removed", days: "2–3 wk post-clearance",
          detail: "Vancomycin + cefepime / meropenem; CSF cultures daily until sterile" },
        { label: "Hardware retained", days: "3–4 wk + IVT",
          detail: "Add intraventricular vancomycin or aminoglycoside; longer course; IVT = intraventricular" },
        { label: "Gram-negative ventriculitis", days: "3 wk minimum",
          detail: "Cefepime / meropenem; check CSF penetration; intraventricular if refractory" },
      ],
      stopWhen: [
        "CSF cultures negative ≥ 48 h",
        "CSF cell count + glucose normalizing on repeat LP / drain sample",
        "Neurologic exam stable / improving",
        "Hardware decision finalized (removed vs retained)",
        "Minimum 2–3 wk post-clearance completed",
      ],
      extendIf: [
        "Persistent CSF positivity — switch to intraventricular + extend",
        { text: "**Hardware retained** — extend per ID + neurosurgery",
          matchCtx: { severe: true } },
        "Concurrent abscess / cerebritis — extend per source",
        "Multidrug-resistant GNR — extend per ID input",
      ],
    },
    monitoring: {
      headline: "Daily CSF cultures + cell count; explant shunt preferred; intraventricular for refractory.",
      items: [
        { sev: "required", what: "**Daily CSF Gram stain + culture + cell count** until clearance",
          why: "Persistent positivity triggers intraventricular addition + extended course" },
        { sev: "required", what: "**Explant / externalize shunt** if possible",
          why: "Biofilm renders systemic-only therapy inadequate; salvage rarely succeeds" },
        { sev: "required", what: "**CNS-strength dosing** + neurosurgery partnership",
          why: "Standard systemic doses inadequate; coordinate intraventricular delivery" },
        { sev: "trigger", what: "**Intraventricular vancomycin / aminoglycoside** for refractory",
          why: "Preservative-free formulations; CSF level guides; neurosurgery delivers" },
        { sev: "trigger", what: "**MRI** for cerebritis / abscess / extension",
          why: "Complications drive extended course + drainage decisions" },
        { sev: "consider", what: "Lock-therapy attempts for stable patient + CoNS + lock-amenable hardware",
          why: "Rarely successful but considered case-by-case for explant-contraindicated patients" },
      ],
    },
  },

  /* ===========================================================
     SHUNT INFECTION — CSF / VP / VA. Explant + reimplant standard. = */
  "shunt-infection": {
    duration: {
      headline: "10–14 d post-CSF-clearance after explant; reimplantation 7–14 d post-sterilization.",
      evidence: "IDSA 2017 — explant-driven; reimplant when CSF sterile + clinically stable",
      branches: [
        { label: "Explant + EVD, CSF clearing", days: "10–14 d post-clearance",
          detail: "From first negative CSF after explant; reimplant after clearance + stability" },
        { label: "Hardware retained (rare)", days: "Indefinite",
          detail: "Suppressive oral therapy + ID + neurosurgery; lock therapy rarely succeeds" },
        { label: "S. aureus / gram-negative", days: "14 d + IVT if refractory",
          detail: "More aggressive than CoNS; consider intraventricular addition (IVT)" },
      ],
      stopWhen: [
        "CSF cultures negative ≥ 48 h",
        "CSF cell count normalizing",
        "Neurologic exam stable",
        "Hardware re-implanted (if applicable)",
        "Minimum 10–14 d post-clearance completed",
      ],
      extendIf: [
        "Persistent CSF positivity — intraventricular addition + extend",
        { text: "**S. aureus / gram-negative / mixed** — more aggressive course",
          matchCtx: { severe: true } },
        "Hardware retention impossible to explant — suppressive therapy",
        "Concurrent abscess / cerebritis — extend per source",
      ],
    },
    monitoring: {
      headline: "Explant preferred; CSF sampling daily; reimplant when sterile + stable.",
      items: [
        { sev: "required", what: "**Explant / externalize** at presentation when possible",
          why: "Biofilm + foreign-body kinetics; systemic antibiotics rarely cure with hardware in place" },
        { sev: "required", what: "**Daily CSF sampling** until sterilization",
          why: "Drives reimplantation timing + duration calc" },
        { sev: "required", what: "**Neurosurgery + ID partnership** for reimplant decision",
          why: "Timing balance: clearance vs hydrocephalus risk during EVD period" },
        { sev: "trigger", what: "**Intraventricular antibiotic** for refractory CSF positivity",
          why: "Preservative-free vanco / aminoglycoside; neurosurgery delivery + monitoring" },
        { sev: "trigger", what: "**MRI** for cerebritis / abscess complication",
          why: "Drives extended-course decision + additional drainage" },
        { sev: "consider", what: "**Suppressive oral therapy** if explant impossible",
          why: "Lifelong; ID + neurosurgery + patient counseling on recurrence risk" },
      ],
    },
  },

  /* ===========================================================
     SEPSIS — Febrile neutropenic. IDSA 2018 (Taplitz). 7 d standard
     once afebrile + ANC > 500 + source-controlled. ================= */
  "sepsis-neutropenic": {
    duration: {
      headline: "7 d once afebrile ≥ 48 h + ANC recovering; longer if documented bacteremia or source.",
      evidence: "IDSA 2018 (Taplitz) — discontinue when afebrile + ANC > 500; longer for documented infection",
      branches: [
        { label: "FUO, response by 48 h, ANC recovering", days: "7 d",
          detail: "Stop empirics when afebrile + ANC recovering (ANC > 500); no documented source" },
        { label: "Documented bacteremia", days: "7–14 d",
          detail: "BALANCE bands apply; from first negative BCx; pathogen-driven duration" },
        { label: "Documented deep infection (pneumonia, abscess)", days: "Per source",
          detail: "Treat per source-specific bands; ANC recovery doesn't shorten" },
        { label: "Persistent fever, ANC < 500", days: "Continue + workup",
          detail: "Add antifungal at day 4–7; reassess for occult source; ID consult" },
      ],
      stopWhen: [
        "Afebrile ≥ 48 h",
        "ANC > 500 and rising",
        "Cultures negative or appropriately treated",
        "Source controlled (line removed, abscess drained)",
        "Clinical improvement (off pressors, end-organ recovery)",
        "Minimum 7 d for documented infection",
      ],
      extendIf: [
        { text: "**Persistent fever** at day 4–7 → workup occult fungal / viral / abscess",
          matchCtx: { severe: true } },
        "Documented organism — extend per pathogen + source",
        "ANC < 100 + persistent fever — empiric antifungal addition",
        "Concurrent line / catheter retained — line removal preferred",
      ],
    },
    monitoring: {
      headline: "Daily BCx + fever curve + ANC; antifungal at day 4-7 persistent fever; line removal threshold low.",
      items: [
        { sev: "required", what: "**Blood cultures daily** until clearance / defervescence",
          why: "Documents pathogen + sterilization; positive at 48 h triggers source hunt" },
        { sev: "required", what: "**Daily ANC trend + fever curve**",
          why: "Trajectory drives duration decisions + antifungal trigger" },
        { sev: "required", what: "**Source workup** at day 2–3 if persistent fever",
          why: "Imaging, line assessment, fungal biomarkers (galactomannan, β-D-glucan)" },
        { sev: "trigger", what: "**Empiric antifungal** at day 4–7 persistent fever (caspofungin / voriconazole)",
          why: "Invasive fungal disease in 10–15% of persistent FUO; mortality benefit if early",
          matchCtx: { severe: true } },
        { sev: "trigger", what: "**Line removal** for line-related bacteremia or persistent positivity",
          why: "Biofilm + line source most common; antibiotic-only fails with hardware in place" },
        { sev: "trigger", what: "**G-CSF / pegfilgrastim** per protocol",
          why: "Shortens neutropenic period; reduces infection-related mortality" },
        { sev: "consider", what: "**Antiviral coverage** (CMV / influenza / COVID) if hemato/onc substrate",
          why: "Viral co-infection drives empiric failure; pcr panel + serology" },
      ],
    },
  },

  /* ===========================================================
     SEPSIS — Asplenia / hyposplenia. OPSI emergency. ============== */
  "sepsis-asplenia": {
    duration: {
      headline: "14 d standard for asplenic bacteremia; ceftriaxone IV → step-down by organism.",
      evidence: "Society consensus — long-course given fulminant kinetics; pneumococcal vaccine + counseling",
      branches: [
        { label: "Stable, susceptible organism", days: "10–14 d",
          detail: "Ceftriaxone IV → oral step-down per susceptibilities",
          matchAgent: /ceftriaxone/i },
        { label: "Septic shock at presentation", days: "14 d",
          detail: "Broaden empirics; add vancomycin if resistant pneumococcus or meningitis",
          matchAgent: /vancomycin/i },
        { label: "Capnocytophaga (animal exposure)", days: "14–21 d",
          detail: "Pip-tazo or carbapenem; DIC + purpura fulminans risk; ICU early",
          matchAgent: /piperacillin|carbapenem/i },
      ],
      stopWhen: [
        "Afebrile ≥ 48 h, off vasopressors",
        "Blood cultures cleared ≥ 48 h",
        "Clinical recovery (end-organ, WBC, lactate)",
        "Vaccination plan documented (PCV, MenACWY, Hib)",
        "Standing home antibiotic prescription provided",
        "Minimum 10–14 d completed",
      ],
      extendIf: [
        { text: "**Capnocytophaga + DIC / purpura fulminans** — extend per response",
          matchCtx: { severe: true } },
        "Meningitis complication — extend per meningitis bands",
        "Hardware retained / endovascular foci — extend per source",
        "Functional asplenia (SCD, post-XRT, celiac) — same protocol",
      ],
    },
    monitoring: {
      headline: "Treat at triage (no culture wait); vaccinate post-acute; standing home prescription.",
      items: [
        { sev: "required", what: "**First dose at triage** — don't wait for cultures",
          why: "Mortality 40–70% if delayed; minutes matter in OPSI" },
        { sev: "required", what: "**Vaccination plan** — PCV20 or PCV13+PPSV23, MenACWY, Hib (if not vaccinated)",
          why: "Prevention of subsequent OPSI; long-term immunity strategy" },
        { sev: "required", what: "**Standing home antibiotic prescription** at discharge",
          why: "Patient self-administers amox-clav (or alt) at first fever; bridge to ED" },
        { sev: "trigger", what: "**Capnocytophaga workup** if dog / cat / animal exposure",
          why: "Fulminant DIC pattern; ICU + ID partnership; emergent broad coverage" },
        { sev: "trigger", what: "**Counsel on functional asplenia substrate** — SCD, post-XRT, celiac",
          why: "Same OPSI risk profile; same prevention + treatment protocol" },
        { sev: "consider", what: "**Annual influenza + COVID vaccination**",
          why: "Reduces secondary bacterial infection risk; standard prevention" },
      ],
    },
  },

  /* ===========================================================
     SEPSIS — Toxic shock (staph / strep). Source control + IVIG. == */
  "sepsis-toxic": {
    duration: {
      headline: "14 d clindamycin + targeted antibiotic; IVIG for streptococcal TSS; source control essential.",
      evidence: "IDSA + society consensus — clindamycin for toxin suppression; IVIG mortality benefit in GAS-TSS",
      branches: [
        { label: "Streptococcal TSS confirmed", days: "14 d",
          detail: "Penicillin + clindamycin × 14 d; IVIG 1 g/kg + 0.5 g/kg ×2",
          matchAgent: /penicillin|clindamycin/i },
        { label: "Staphylococcal TSS confirmed", days: "10–14 d",
          detail: "Vancomycin (or nafcillin if MSSA) + clindamycin; source removal essential" },
        { label: "Empiric pre-confirmation", days: "Until pathogen known",
          detail: "Vancomycin + pip-tazo + clindamycin; narrow on cultures + clinical clues" },
      ],
      stopWhen: [
        "Afebrile ≥ 48 h",
        "Off vasopressors",
        "Source removed (tampon, foreign body, abscess drained)",
        "Cultures cleared",
        "Rash desquamation / clinical resolution",
        "Minimum 10–14 d completed",
      ],
      extendIf: [
        { text: "**Streptococcal TSS with necrotizing infection** — extend per necfasc",
          matchCtx: { severe: true } },
        "Persistent shock / multi-organ failure — extend per ICU course",
        "Source not removed — failure to clear without it",
        "Bacteremia + endocarditis workup — extend per source",
      ],
    },
    monitoring: {
      headline: "Source removal + IVIG for GAS; clindamycin for toxin; ICU partnership.",
      items: [
        { sev: "required", what: "**Source removal** — tampon, foreign body, abscess drainage",
          why: "Source control is the inflection point; antibiotic alone fails with source in place" },
        { sev: "required", what: "**Continue clindamycin** until toxin-producing organism excluded",
          why: "Ribosomal block suppresses TSST-1 + streptococcal exotoxin; cidal antibiotic alone insufficient" },
        { sev: "required", what: "**ICU + ID consult** at presentation",
          why: "Multi-organ failure typical; team coordination drives mortality" },
        { sev: "trigger", what: "**IVIG 1 g/kg day 1, 0.5 g/kg days 2–3** only for streptococcal TSS confirmed",
          why: "Mortality benefit specific to GAS-TSS; not indicated for staphylococcal TSS",
          matchBranch: ["Streptococcal TSS confirmed"] },
        { sev: "trigger", what: "**Workup necrotizing infection** if streptococcal",
          why: "Necrotizing fasciitis frequent companion of GAS-TSS; surgical exploration low threshold" },
        { sev: "consider", what: "**Public-health notification** + contact prophylaxis for invasive GAS",
          why: "Mandatory reporting + household close-contact prophylaxis per CDC" },
      ],
    },
  },

  /* ===========================================================
     SEPSIS — Intra-abdominal source. STOP-IT bands + source control. */
  "sepsis-abdominal": {
    duration: {
      headline: "4 d post-source-control for community IAI (STOP-IT); 7–10 d if HCAQ or inadequate control.",
      evidence: "STOP-IT 2015 — 4 d non-inferior post-adequate-source-control IAI",
      branches: [
        { label: "Community IAI, source controlled", days: "4 d",
          detail: "Pip-tazo or ceftriaxone+metronidazole or ertapenem; from source-control day" },
        { label: "HCAQ IAI or shock", days: "7–10 d",
          detail: "Broaden empirics; pip-tazo or carbapenem; ICU + ID partnership" },
        { label: "Source not fully controllable", days: "10–14 d",
          detail: "Undrained collections, anastomotic leak, partial resection" },
        { label: "Fungal peritonitis confirmed", days: "≥ 14 d echinocandin",
          detail: "Echinocandin ± azole step-down; per Candida species + susceptibility",
          matchAgent: /echinocandin|caspofungin|micafungin|anidulafungin|fluconazole/i },
      ],
      stopWhen: [
        "Source controlled (drainage, surgery, leak repair)",
        "Afebrile ≥ 48 h, off vasopressors",
        "Bowel function returning, oral intake tolerated",
        "WBC trending, lactate normalized",
        "Imaging shows resolution / stable drained collection",
        "Minimum 4 d post-source-control",
      ],
      extendIf: [
        { text: "**Healthcare-associated** flora or recent broad antibiotics",
          matchCtx: { esblRisk: true } },
        "Undrained / uncontrolled source",
        { text: "**Septic shock** at presentation — extend per response",
          matchCtx: { severe: true } },
        "Fungal peritonitis — echinocandin × 14+ d",
        "Anastomotic leak — surgical re-exploration + extend",
      ],
    },
    monitoring: {
      headline: "Source-control review at 72 h; STOP-IT bands; echinocandin for upper-GI + post-op.",
      items: [
        { sev: "required", what: "**Source-control review at 48–72 h** — imaging, drain function, surgical re-eval",
          why: "Antibiotic failure most often source-control failure" },
        { sev: "required", what: "**Narrow on culture data** at 48–72 h",
          why: "Continued broad therapy drives resistance + collateral damage" },
        { sev: "required", what: "**Daily clinical assessment** + lactate trend",
          why: "Worsening signs trigger imaging + surgical re-eval; STOP-IT bands assume response" },
        { sev: "trigger", what: "**Echinocandin** for upper-GI perforation, postop leak, recurrent IAI",
          why: "Candida overgrowth common; carries mortality penalty if missed",
          matchBranch: ["Fungal peritonitis confirmed"] },
        { sev: "trigger", what: "**Repeat CT** at day 4–5 if no clinical improvement",
          why: "Undrained collections, leak, abscess evolution — drainage targets" },
        { sev: "trigger", what: "**Surgical re-exploration** for anastomotic leak / non-responsive collection",
          why: "Antibiotic alone fails with surgical complications",
          matchCtx: { severe: true } },
      ],
    },
  },

  /* ===========================================================
     INFECTIVE ENDOCARDITIS — IDSA / AHA 2015. Pathogen-driven
     4-6 wk IV; surgery for failure / complications. ================ */
  ie: {
    duration: {
      headline: "4–6 wk IV pathogen-driven; surgery for HF / abscess / persistent BCx / large veg / embolic events.",
      evidence: "IDSA / AHA 2015 — pathogen-specific bands; multidisciplinary IE team drives surgical decisions",
      branches: [
        { label: "Viridans strep / S. gallolyticus (native)", days: "4 wk",
          detail: "Penicillin G or ceftriaxone × 4 wk; 2 wk + gent regimen for low-risk uncomplicated",
          matchAgent: /penicillin|ceftriaxone/i },
        { label: "Enterococcal native (amp+ceftriaxone)", days: "6 wk",
          detail: "Ampicillin + ceftriaxone (Fernández-Hidalgo 2013); HLAR-status drives regimen choice" },
        { label: "Staphylococcal native", days: "6 wk",
          detail: "MSSA: cefazolin/nafcillin; MRSA: vancomycin or daptomycin" },
        { label: "Prosthetic valve (PVE)", days: "≥ 6 wk + surgery often",
          detail: "Vancomycin + cefepime + rifampin × 6+ wk; surgery threshold lower",
          matchAgent: /rifampin/i },
        { label: "Culture-negative", days: "4–6 wk",
          detail: "Empiric vancomycin + ceftriaxone (or ampicillin-sulbactam); workup HACEK / Bartonella / Q fever" },
      ],
      stopWhen: [
        "Blood cultures cleared ≥ 48 h",
        "Clinical improvement (afebrile, peripheral signs receding)",
        "Echo shows stable or improved vegetation",
        "No new embolic events",
        "Renal / inflammatory markers normalizing",
        "Minimum 4–6 wk pathogen-specific duration completed",
      ],
      extendIf: [
        { text: "**Surgery needed** (HF, abscess, large veg, persistent BCx, embolic event) — extend post-op",
          matchCtx: { severe: true } },
        "Persistent bacteremia > 5 d on appropriate therapy",
        "Mycotic aneurysm complication",
        "PVE with abscess / dehiscence — surgery + extend",
        "Drug-resistant pathogen — ID-driven extension",
      ],
    },
    monitoring: {
      headline: "Multidisciplinary IE team; TEE early; daily BCx until cleared; embolic surveillance.",
      items: [
        { sev: "required", what: "**Multidisciplinary IE team** — ID, cardiology, cardiac surgery",
          why: "Society guideline-mandated; drives surgical timing + medical optimization" },
        { sev: "required", what: "**TEE at presentation** + repeat for changes",
          why: "Veg size, abscess, leaflet perforation drive surgical decisions" },
        { sev: "required", what: "**Daily blood cultures until clearance**",
          why: "Persistent bacteremia at 5 d triggers surgical consult + workup" },
        { sev: "required", what: "**Embolic surveillance** — neuro exam, splinter hemorrhages, Roth spots",
          why: "Embolic events change surgical timing + drive extra workup" },
        { sev: "trigger", what: "**Brain MRI** for new neuro symptoms — septic embolus / mycotic aneurysm",
          why: "Affects anticoagulation + surgical timing" },
        { sev: "trigger", what: "**Workup HACEK / Bartonella / Q fever** for culture-negative",
          why: "Specific organisms need specific drugs; serology + targeted PCR" },
        { sev: "trigger", what: "**Surgery within 1 week** for HF, large veg (> 10 mm + embolic), persistent BCx",
          why: "Class I indication per AHA 2015; delay worsens mortality",
          matchCtx: { severe: true } },
        { sev: "consider", what: "Dental + ENT workup for source",
          why: "Identify entry portal; address underlying source" },
      ],
    },
  },

  /* ===========================================================
     IE — Native valve (organism-specific). ========================== */
  "ie-native": {
    duration: {
      headline: "4–6 wk pathogen-driven; viridans short course possible; surgical IE team essential.",
      evidence: "IDSA / AHA 2015 — native-valve durations + 2 wk gent synergy for selected viridans",
      branches: [
        { label: "Viridans / gallolyticus, PCN-sensitive", days: "4 wk",
          detail: "Penicillin G or ceftriaxone × 4 wk; 2 wk regimen with gent for uncomplicated low-risk" },
        { label: "Enterococcal (amp+ceftriaxone preferred)", days: "6 wk",
          detail: "HLAR-status check; amp + ceftriaxone replaces amp + gent for most" },
        { label: "MSSA", days: "6 wk",
          detail: "Cefazolin or nafcillin × 6 wk; surgery for complications" },
        { label: "MRSA", days: "6 wk",
          detail: "Vancomycin (AUC 400-600) or daptomycin 8–10 mg/kg × 6 wk" },
      ],
      stopWhen: [
        "Blood cultures cleared ≥ 48 h",
        "Echo stable / improving",
        "Clinical resolution",
        "No new embolic events / HF",
        "Minimum 4–6 wk completed",
      ],
      extendIf: [
        { text: "**Surgery needed** — extend post-op",
          matchCtx: { severe: true } },
        "Persistent bacteremia > 5 d",
        "Mycotic aneurysm complication",
        "Drug-resistant pathogen — ID-driven",
      ],
    },
    monitoring: {
      headline: "Multidisciplinary IE team; daily BCx; TEE; embolic surveillance.",
      items: [
        { sev: "required", what: "**IE team** (ID + cardiology + cardiac surgery)",
          why: "Mandated by AHA / IDSA guidelines" },
        { sev: "required", what: "**TEE within 24–48 h**",
          why: "Vegetation characterization + abscess assessment drives surgery decisions" },
        { sev: "required", what: "**Daily blood cultures until clearance**",
          why: "Persistent positivity at 5 d triggers surgical reconsideration" },
        { sev: "trigger", what: "**Brain MRI** for neurologic symptoms",
          why: "Septic embolism + mycotic aneurysm workup" },
        { sev: "trigger", what: "**Surgery within 1 wk** for HF, large vegetation + embolus, persistent BCx",
          why: "Mortality benefit with appropriately timed surgery",
          matchCtx: { severe: true } },
        { sev: "consider", what: "Dental + ENT workup for source",
          why: "Address entry portal" },
      ],
    },
  },

  /* ===========================================================
     IE — Prosthetic valve (PVE). Rifampin + gent + extended duration. */
  "ie-pve": {
    duration: {
      headline: "≥ 6 wk IV; rifampin for staphylococcal; gent for synergy first 2 wk; surgery threshold low.",
      evidence: "IDSA / AHA 2015 — PVE-specific bands with rifampin + aminoglycoside; surgery frequent",
      branches: [
        { label: "Staphylococcal PVE", days: "≥ 6 wk",
          detail: "Vanco / β-lactam + RIFAMPIN × 6+ wk + gent × 2 wk synergy; surgery often",
          matchAgent: /rifampin/i },
        { label: "Enterococcal / streptococcal PVE", days: "≥ 6 wk",
          detail: "Same agents as native valve but longer; surgery threshold lower" },
        { label: "Culture-negative PVE", days: "6 wk empiric",
          detail: "Vancomycin + cefepime + rifampin; workup atypicals" },
      ],
      stopWhen: [
        "BCx cleared ≥ 48 h",
        "Echo stable / improving",
        "Clinical resolution",
        "Surgery completed (if needed)",
        "No new complications",
        "Minimum 6 wk completed",
      ],
      extendIf: [
        { text: "**Persistent bacteremia > 5 d** — emergent surgery",
          matchCtx: { severe: true } },
        "Abscess / dehiscence — surgery + extend",
        "Mycotic aneurysm",
        "Recurrent embolic events",
      ],
    },
    monitoring: {
      headline: "Surgery threshold lower; rifampin LFT + interactions; gent trough monitoring; embolic surveillance.",
      items: [
        { sev: "required", what: "**Cardiac surgery consult at presentation** — surgery threshold lower in PVE",
          why: "Early-PVE (< 1 year) almost always needs replacement; late-PVE selective" },
        { sev: "required", what: "**Rifampin LFTs + drug-interaction review**",
          why: "Hepatotoxic; CYP3A4 inducer (warfarin, OCPs, statins, immunosuppressants)",
          matchAgent: /rifampin/i },
        { sev: "required", what: "**Gentamicin trough + audiometry** (first 2 wk only)",
          why: "Nephrotoxicity + ototoxicity; limit to synergy window" },
        { sev: "required", what: "**Daily blood cultures until clearance**",
          why: "Persistent BCx is the inflection point for surgery" },
        { sev: "trigger", what: "**Brain MRI** for neurologic symptoms",
          why: "Mycotic aneurysm + embolic workup" },
        { sev: "trigger", what: "**Emergent surgery** for HF, abscess, dehiscence, persistent BCx",
          why: "Class I indication; delay worsens mortality",
          matchCtx: { severe: true } },
        { sev: "consider", what: "Long-term suppression decisions if hardware retained",
          why: "Lifelong oral per ID + cardiac surgery" },
      ],
    },
  },

  /* ===========================================================
     CRBSI — Catheter-related bloodstream infection. ============== */
  crbsi: {
    duration: {
      headline: "Pathogen-driven 7-14 d for short-term lines (S. aureus 14 d min, CoNS 7 d); line out for severe.",
      evidence: "IDSA 2009 — pathogen-specific bands + line management decision algorithm",
      branches: [
        { label: "CoNS, line removed", days: "7 d",
          detail: "Short course post-line-removal; longer if persistent positivity",
          matchAgent: /vancomycin/i },
        { label: "S. aureus, line removed", days: "14 d minimum",
          detail: "TEE + endocarditis workup; from first negative BCx" },
        { label: "Gram-negative", days: "7–14 d",
          detail: "Per organism + susceptibilities; line removal for persistence" },
        { label: "Candidemia", days: "14 d post-clearance",
          detail: "Echinocandin → fluconazole step-down; ophthal exam mandatory",
          matchAgent: /echinocandin|caspofungin|micafungin|anidulafungin|fluconazole/i },
        { label: "Line retained (lock therapy)", days: "10–14 d + lock",
          detail: "Salvage only for CoNS + stable patient + no shock; lock + systemic" },
      ],
      stopWhen: [
        "Line removed or sterilized via lock therapy",
        "Blood cultures cleared ≥ 48 h",
        "Afebrile ≥ 48 h",
        "No metastatic foci",
        "Endocarditis workup negative if S. aureus",
        "Minimum pathogen-specific duration completed",
      ],
      extendIf: [
        { text: "**S. aureus + endocarditis** — extend per IE bands",
          matchCtx: { mrsaRisk: true } },
        "Persistent bacteremia > 72 h post-line removal",
        "Endovascular complication (septic thrombus, mycotic aneurysm)",
        { text: "**Pseudomonas / Candida / persistent BCx** — line MUST come out",
          matchCtx: { severe: true } },
      ],
    },
    monitoring: {
      headline: "Pull the line for severe organisms; TEE for S. aureus; ophth for candida; repeat BCx.",
      items: [
        { sev: "required", what: "**Remove the line** for S. aureus / Pseudomonas / Candida / persistent BCx",
          why: "No salvage attempt for these; biofilm + virulence drive failure" },
        { sev: "required", what: "**Differential time-to-positivity** (line vs peripheral cultures)",
          why: "> 2 h difference favors line source; documents diagnosis" },
        { sev: "required", what: "**TEE for S. aureus bacteremia**",
          why: "Endocarditis in 15–25%; changes duration to 4–6 wk" },
        { sev: "required", what: "**Ophthalmology consult for candidemia**",
          why: "Endogenous endophthalmitis in ~5–15%; vision-threatening if missed",
          matchBranch: ["Candidemia"] },
        { sev: "trigger", what: "**Repeat blood cultures at 48 h**",
          why: "Persistent positivity triggers line removal + endocarditis workup" },
        { sev: "trigger", what: "**ID consult for persistent / complicated bacteremia**",
          why: "Mortality benefit; complex cases require specialty input" },
        { sev: "consider", what: "**Lock therapy attempt** only for CoNS + stable + lock-amenable",
          why: "Limited indication; failure rate substantial",
          matchBranch: ["Line retained (lock therapy)"] },
      ],
    },
  },

  /* ===========================================================
     FEBRILE NEUTROPENIA — IDSA 2018 (Taplitz). Stop at ANC > 500
     + afebrile + cultures negative. ================================ */
  febneut: {
    duration: {
      headline: "Stop empirics when afebrile + ANC > 500; longer for documented infection.",
      evidence: "IDSA 2018 (Taplitz) — early-stop strategy; documented infection drives pathogen-specific duration",
      branches: [
        { label: "FUO, defervescence by 48 h", days: "Until ANC recovers",
          detail: "Stop empirics at afebrile + ANC > 500; no documented source" },
        { label: "Documented bacteremia", days: "Per pathogen",
          detail: "Treat per source-specific bands; BALANCE 7 d for GNR controlled" },
        { label: "Documented deep infection", days: "Per source",
          detail: "Pneumonia, abscess, line infection — per source-specific bands" },
        { label: "Persistent fever, ANC < 500", days: "Continue + workup",
          detail: "Empiric antifungal at day 4–7; reassess for occult source" },
      ],
      stopWhen: [
        "Afebrile ≥ 48 h",
        "ANC > 500 and rising",
        "Cultures negative or appropriately treated",
        "Source controlled (line removed, abscess drained)",
        "Clinical recovery",
        "Minimum 7 d for documented infection",
      ],
      extendIf: [
        { text: "**Persistent fever at day 4–7** — fungal workup + empiric antifungal",
          matchCtx: { severe: true } },
        "Documented organism — extend per pathogen",
        "ANC < 100 + prolonged neutropenia — extended course",
        "Line / hardware retained",
      ],
    },
    monitoring: {
      headline: "Daily BCx + fever + ANC; fungal workup day 4-7; G-CSF per protocol.",
      items: [
        { sev: "required", what: "**Blood cultures daily** until clearance / defervescence",
          why: "Documents pathogen + sterilization" },
        { sev: "required", what: "**Daily ANC + fever curve**",
          why: "Trajectory drives duration decisions + antifungal trigger" },
        { sev: "required", what: "**Source workup** at day 2–3 if persistent",
          why: "Imaging, line assessment, fungal biomarkers, viral PCR" },
        { sev: "trigger", what: "**Empiric antifungal at day 4–7** (caspofungin / voriconazole)",
          why: "Invasive fungal disease in 10–15%; mortality benefit if early" },
        { sev: "trigger", what: "**G-CSF / pegfilgrastim** per oncology protocol",
          why: "Shortens neutropenic period; reduces mortality" },
        { sev: "trigger", what: "**Line removal** for line-related or persistent bacteremia",
          why: "Biofilm + line source most common; antibiotic-only fails" },
        { sev: "consider", what: "**Antiviral coverage** (CMV / influenza / COVID)",
          why: "Viral co-infection drives empiric failure; PCR panel" },
      ],
    },
  },

  /* ===========================================================
     OPSI — Overwhelming post-splenectomy infection. ============== */
  opsi: {
    duration: {
      headline: "10–14 d ceftriaxone for stable; 14 d + vanco for shock/meningitis; OPSI = emergency.",
      evidence: "Society consensus — minutes matter; pneumococcal + Hib + meningococcal coverage",
      branches: [
        { label: "Stable encapsulated bacteremia", days: "10–14 d",
          detail: "Ceftriaxone IV → oral step-down per susceptibilities",
          matchAgent: /ceftriaxone/i },
        { label: "Septic shock / meningitis", days: "14 d",
          detail: "Ceftriaxone + vancomycin + dexamethasone if meningitis suspected" },
        { label: "Capnocytophaga (animal exposure)", days: "14–21 d",
          detail: "Pip-tazo or carbapenem; DIC + purpura fulminans risk",
          matchAgent: /piperacillin|carbapenem/i },
      ],
      stopWhen: [
        "Afebrile ≥ 48 h, off vasopressors",
        "Blood cultures cleared ≥ 48 h",
        "Clinical recovery",
        "Vaccination plan documented",
        "Standing home antibiotic prescription provided",
        "Minimum 10–14 d completed",
      ],
      extendIf: [
        { text: "**Capnocytophaga + DIC** — extend per response",
          matchCtx: { severe: true } },
        "Meningitis complication — extend per meningitis bands",
        "Endovascular / metastatic foci",
        "Functional asplenia — same protocol",
      ],
    },
    monitoring: {
      headline: "Treat at triage; vaccinate; standing home prescription; counsel lifelong.",
      items: [
        { sev: "required", what: "**First dose within minutes** of suspicion — don't wait for cultures",
          why: "Mortality 40–70% if delayed" },
        { sev: "required", what: "**Vaccinate** PCV20 or PCV13+PPSV23, MenACWY, Hib",
          why: "Long-term prevention of recurrent OPSI" },
        { sev: "required", what: "**Standing home antibiotic prescription** (amox-clav or similar)",
          why: "Patient self-administers at first fever; bridges to ED" },
        { sev: "trigger", what: "**Capnocytophaga workup** if animal exposure",
          why: "Fulminant DIC pattern in asplenic" },
        { sev: "trigger", what: "**Counsel lifelong** — every fever = ED visit; medical alert bracelet",
          why: "Lifelong risk; patient education drives outcomes" },
        { sev: "consider", what: "**Annual flu + COVID vaccination**",
          why: "Reduces secondary bacterial infection risk" },
      ],
    },
  },

  /* ===========================================================
     GRAM-NEGATIVE BACTEREMIA — BALANCE 7 d if source controlled. = */
  gnbact: {
    duration: {
      headline: "7 d for source-controlled GNR bacteremia (BALANCE); 10-14 d for ESBL/CRE or uncontrolled.",
      evidence: "BALANCE 2024 (NEJM) — 7 vs 14 d non-inferior in source-controlled bacteremia",
      branches: [
        { label: "Source controlled, susceptible", days: "7 d",
          detail: "From first negative BCx; BALANCE bands apply" },
        { label: "ESBL / AmpC / KPC", days: "10–14 d",
          detail: "Carbapenem or novel β-lactam; ID input mandatory",
          matchAgent: /ertapenem|ceftolozane|ceftazidime-?avibactam|imipenem-?relebactam/i },
        { label: "Persistent bacteremia / inadequate source", days: "14–28 d",
          detail: "From first negative BCx after source control achieved" },
        { label: "Endovascular / hardware seeding", days: "≥ 4 wk",
          detail: "Endocarditis workup; TEE; hardware management drives total" },
      ],
      stopWhen: [
        "Source controlled",
        "Blood cultures negative ≥ 48 h",
        "Afebrile ≥ 48 h",
        "Speciation + susceptibility narrowing complete",
        "No new metastatic foci",
        "Minimum 7 d (BALANCE) completed",
      ],
      extendIf: [
        { text: "**ESBL / CRE / DTR-Pseudomonas** — extend per ID",
          matchCtx: { esblRisk: true } },
        "Persistent bacteremia > 72 h",
        "Endovascular seeding / hardware retained",
        { text: "**Septic shock + MDR substrate** — extend per response",
          matchCtx: { severe: true } },
      ],
    },
    monitoring: {
      headline: "BALANCE 7 d for controlled-source; narrow on culture data; ID for resistant flora.",
      items: [
        { sev: "required", what: "**Blood cultures q48h until clearance**",
          why: "Persistent BCx triggers source hunt + endovascular workup" },
        { sev: "required", what: "**Narrow on culture data** at 48-72 h",
          why: "Continued broad therapy drives resistance + collateral damage" },
        { sev: "required", what: "**Source control workup** — line, urinary, abdominal, lung",
          why: "Source identification + control is the inflection point" },
        { sev: "trigger", what: "**Add carbapenem or novel β-lactam** for ESBL / CRE",
          why: "MERINO 2018: pip-tazo inferior to meropenem for ESBL bacteremia",
          matchCtx: { esblRisk: true } },
        { sev: "trigger", what: "**TEE if endovascular foci suspected**",
          why: "GNR endocarditis rare but consequential; workup persistent bacteremia" },
        { sev: "consider", what: "**Procalcitonin trend** for duration debate at day 5",
          why: "Falling PCT supports BALANCE-style early stop" },
      ],
    },
  },

  /* ===========================================================
     COAGULASE-NEGATIVE STAPHYLOCOCCAL BACTEREMIA — distinguish
     true infection from contaminant. ================================ */
  cons: {
    duration: {
      headline: "7 d if true infection + line out; longer if hardware retained or endovascular.",
      evidence: "IDSA 2009 — pathogen-specific bands; multiple positive cultures + line/hardware = true infection",
      branches: [
        { label: "True infection, line removed", days: "7 d",
          detail: "Vancomycin (most CoNS are methicillin-resistant) post-line removal",
          matchAgent: /vancomycin/i },
        { label: "Oxacillin-susceptible CoNS, line out", days: "5–7 d",
          detail: "Cefazolin or nafcillin; same MSSA principles" },
        { label: "Hardware retained (lock therapy)", days: "10–14 d + lock",
          detail: "Only for selected stable patients; salvage rate ~50–70%" },
        { label: "S. lugdunensis (treat as S. aureus)", days: "14 d minimum",
          detail: "Hypervirulent CoNS; TEE + endocarditis workup; 14 d like SAB" },
      ],
      stopWhen: [
        "Multiple cultures cleared",
        "Line removed or successfully locked",
        "Clinical improvement",
        "Echo negative if appropriate",
        "Minimum 5-7 d completed",
      ],
      extendIf: [
        { text: "**S. lugdunensis** — treat as S. aureus regardless of phenotype",
          matchCtx: { mrsaRisk: true } },
        "Hardware retained — extend per lock + clinical",
        "Endocarditis or endovascular seeding",
        "Persistent positivity on lock therapy — explant",
      ],
    },
    monitoring: {
      headline: "Distinguish contamination from infection; multiple cultures; line removal preferred.",
      items: [
        { sev: "required", what: "**Multiple positive cultures + symptoms** = true infection",
          why: "Single positive CoNS culture often contamination; >50% in practice" },
        { sev: "required", what: "**Remove the line / device** when feasible",
          why: "Biofilm renders systemic-only therapy inadequate" },
        { sev: "required", what: "**Identify S. lugdunensis** if isolated — treat as S. aureus",
          why: "Hypervirulent; missed = treatment failure" },
        { sev: "trigger", what: "**TEE if persistent bacteremia or device-related**",
          why: "Endocarditis workup; CoNS PVE common with prosthetic valves" },
        { sev: "trigger", what: "**Lock therapy attempt** only for CoNS + stable + lock-amenable",
          why: "Documented salvage success; limited indication",
          matchBranch: ["Hardware retained (lock therapy)"] },
        { sev: "consider", what: "Workup for prosthetic-material infection (valves, leads, grafts)",
          why: "CoNS biofilm on hardware drives recurrence" },
      ],
    },
  },

  /* ===========================================================
     ENTEROCOCCAL BACTEREMIA — IDSA + AHA. Ampicillin for amp-S;
     daptomycin or linezolid for VRE; long course for IE. =========== */
  entbact: {
    duration: {
      headline: "7-14 d uncomplicated; 6 wk if endocarditis; daptomycin high-dose for VRE bacteremia.",
      evidence: "IDSA / AHA — pathogen-specific; ampicillin still preferred for amp-S; VRE = dapto-HD or linezolid",
      branches: [
        { label: "E. faecalis (amp-S), line out", days: "7–14 d",
          detail: "Ampicillin or penicillin G; from first negative BCx" },
        { label: "Enterococcal endocarditis", days: "6 wk",
          detail: "Amp + ceftriaxone (preferred over amp+gent); per IE bands" },
        { label: "E. faecium / VRE", days: "7–14 d",
          detail: "Daptomycin 10–12 mg/kg HD or linezolid; ID consult",
          matchAgent: /daptomycin|linezolid/i },
        { label: "Persistent VRE bacteremia", days: "Extended + combo",
          detail: "Add β-lactam (ceftaroline or ampicillin) for synergy; salvage" },
      ],
      stopWhen: [
        "Blood cultures cleared ≥ 48 h",
        "Afebrile ≥ 48 h",
        "Line / source controlled",
        "Echo negative (or per IE bands if positive)",
        "Minimum 7-14 d completed",
      ],
      extendIf: [
        { text: "**Endocarditis** — extend to IE bands",
          matchCtx: { severe: true } },
        "Persistent bacteremia > 72 h on appropriate therapy",
        "Hardware retained",
        "HLAR isolate — adjust regimen but duration unchanged",
      ],
    },
    monitoring: {
      headline: "Susceptibility-driven; HLAR check; dapto HD for VRE; TEE if persistent.",
      items: [
        { sev: "required", what: "**Susceptibility testing** — amp, vanc, HLAR, dapto MIC",
          why: "Pathogen-specific therapy critical; HLAR drives gent vs ceftriaxone choice" },
        { sev: "required", what: "**Repeat blood cultures** at 48 h",
          why: "Persistent positivity = endocarditis / source workup" },
        { sev: "trigger", what: "**TEE if persistent bacteremia or community-acquired**",
          why: "Enterococcal IE in 20-30% of bacteremic; changes duration" },
        { sev: "trigger", what: "**Daptomycin high-dose (10-12 mg/kg)** for VRE bacteremia",
          why: "Standard band; CK weekly + statin hold",
          matchBranch: ["E. faecium / VRE"] },
        { sev: "trigger", what: "**Add ceftaroline or ampicillin** for persistent VRE",
          why: "Synergy salvage; ID-driven combination",
          matchBranch: ["Persistent VRE bacteremia"] },
        { sev: "consider", what: "Source workup — colon, urinary, biliary",
          why: "Enterococcal seeding from GI/GU tract" },
      ],
    },
  },

  /* ===========================================================
     PERSISTENT MRSA BACTEREMIA — salvage protocols. ================ */
  "persistent-mrsa": {
    duration: {
      headline: "Extend per source + endovascular workup; salvage with dapto+ceftaroline if vanco-failing.",
      evidence: "Society consensus — persistent ≥ 7 d on vanco triggers salvage; surgical source control",
      branches: [
        { label: "Vanco-failing, source control achievable", days: "≥ 4 wk salvage",
          detail: "Switch to daptomycin 10 mg/kg ± ceftaroline; from first negative BCx",
          matchAgent: /daptomycin|ceftaroline/i },
        { label: "Endocarditis confirmed", days: "≥ 6 wk + surgery",
          detail: "Per IE bands; surgery threshold low for persistent" },
        { label: "Endovascular foci / mycotic aneurysm", days: "Extended + repair",
          detail: "Surgical repair + 6+ wk; ID + vascular surgery" },
      ],
      stopWhen: [
        "Blood cultures cleared ≥ 48 h",
        "Source identified + controlled",
        "Endovascular workup complete (TEE / PET-CT)",
        "Surgery completed if indicated",
        "Minimum 4-6 wk completed",
      ],
      extendIf: [
        { text: "**Endocarditis** — per IE bands",
          matchCtx: { severe: true } },
        "Mycotic aneurysm — surgical repair + extended",
        "Hardware retained — suppression or removal",
        "Persistent BCx on salvage — ID emergency",
      ],
    },
    monitoring: {
      headline: "Salvage with dapto+ceftaroline; PET-CT for occult source; surgery for endovascular.",
      items: [
        { sev: "required", what: "**Daptomycin 10 mg/kg + ceftaroline** for vanco failure",
          why: "Synergistic killing; mortality benefit in observational salvage data",
          matchBranch: ["Vanco-failing, source control achievable"] },
        { sev: "required", what: "**TEE + PET-CT** for occult source workup",
          why: "Persistent MRSA bacteremia has occult source in 30–50%" },
        { sev: "required", what: "**ID consult mandatory**",
          why: "Salvage protocols complex; mortality benefit with specialty input" },
        { sev: "trigger", what: "**Surgical consult for endovascular / abscess**",
          why: "Source control essential for cure" },
        { sev: "trigger", what: "**MRI spine + brain** for metastatic foci",
          why: "Vertebral osteo + brain abscess common; changes duration" },
        { sev: "consider", what: "**CK weekly + statin hold** on daptomycin",
          why: "Rhabdomyolysis risk; reversible if caught early" },
      ],
    },
  },

  /* ===========================================================
     PSEUDOMONAS BACTEREMIA — single antipseudomonal sufficient. == */
  "pseudo-bact": {
    duration: {
      headline: "7-14 d single antipseudomonal; novel β-lactams for DTR-Pseudomonas.",
      evidence: "Yahav 2019 — 7 d acceptable for uncomplicated; DTR-Pseudo per IDSA 2024 update",
      branches: [
        { label: "Susceptible, source controlled", days: "7-14 d",
          detail: "Cefepime, pip-tazo, meropenem, or ceftazidime; extended infusion if MIC ≥ 4" },
        { label: "DTR-Pseudomonas (CRPa)", days: "10–14 d",
          detail: "Ceftolozane-tazo, ceftaz-avi, or imipenem-relebactam per mechanism",
          matchAgent: /ceftolozane|ceftazidime-?avibactam|imipenem-?relebactam/i },
        { label: "Endocarditis / endovascular", days: "≥ 6 wk",
          detail: "Per IE bands; surgery often needed for Pseudomonas IE" },
        { label: "Cystic fibrosis exacerbation", days: "10–14 d",
          detail: "Often combination therapy; tobramycin / colistin adjunct" },
      ],
      stopWhen: [
        "Blood cultures cleared ≥ 48 h",
        "Source controlled",
        "Afebrile ≥ 48 h",
        "Clinical recovery (off pressors, lactate normal)",
        "Minimum 7 d (BALANCE-style) completed",
      ],
      extendIf: [
        { text: "**DTR / CRPa** — extend per ID",
          matchCtx: { esblRisk: true } },
        "Persistent bacteremia > 72 h",
        { text: "**Endocarditis / mycotic aneurysm** — extend per IE",
          matchCtx: { severe: true } },
        "Cystic fibrosis chronic colonization — long course typical",
      ],
    },
    monitoring: {
      headline: "Susceptibility-driven choice; combination unnecessary in most; ID for DTR.",
      items: [
        { sev: "required", what: "**Susceptibility testing** — cefepime, pip-tazo, meropenem, ceftazidime + novels",
          why: "Mechanism-driven novel β-lactam choice for DTR" },
        { sev: "required", what: "**Single antipseudomonal sufficient** in most",
          why: "Combination therapy lacks mortality benefit; drives toxicity" },
        { sev: "trigger", what: "**Novel β-lactam selection** per resistance mechanism",
          why: "KPC → ceftaz-avi or imipenem-rele; MBL → cefiderocol; OXA → cefiderocol or polymyxin",
          matchBranch: ["DTR-Pseudomonas (CRPa)"] },
        { sev: "trigger", what: "**ID consult mandatory** for DTR-Pseudomonas",
          why: "Mechanism-matched drug + dosing critical" },
        { sev: "trigger", what: "**TEE + endocarditis workup** if persistent bacteremia",
          why: "Pseudomonas IE rare but high-mortality" },
        { sev: "consider", what: "**Source workup** — line, lung, urinary, abdominal",
          why: "Identify + control source for cure" },
      ],
    },
  },

  /* ===========================================================
     VRE BACTEREMIA — daptomycin high-dose vs linezolid. ============ */
  "vre-bact": {
    duration: {
      headline: "7-14 d daptomycin HD or linezolid; longer for endocarditis or persistent.",
      evidence: "IDSA / society consensus — dapto-HD preferred; linezolid alternative",
      branches: [
        { label: "Uncomplicated, source controlled", days: "7-14 d",
          detail: "Daptomycin 10-12 mg/kg HD or linezolid 600 mg q12h",
          matchAgent: /daptomycin|linezolid/i },
        { label: "Persistent on monotherapy", days: "Extended + combo",
          detail: "Add ampicillin or ceftaroline for synergy; salvage" },
        { label: "VRE endocarditis", days: "≥ 6 wk",
          detail: "Per IE bands; surgery often needed; combination therapy" },
      ],
      stopWhen: [
        "Blood cultures cleared ≥ 48 h",
        "Source controlled",
        "Afebrile",
        "Echo negative (or per IE bands)",
        "Minimum 7-14 d completed",
      ],
      extendIf: [
        { text: "**Endocarditis** — per IE bands",
          matchCtx: { severe: true } },
        "Persistent bacteremia — combo salvage",
        "Hardware retained — suppression or removal",
        "Immunocompromised host — extend per response",
      ],
    },
    monitoring: {
      headline: "Dapto HD vs linezolid; combo for refractory; CK + cytopenia surveillance.",
      items: [
        { sev: "required", what: "**Daptomycin 10-12 mg/kg HD** for bacteremia (NOT 4-6 mg/kg)",
          why: "High-dose required for VRE; standard dose under-treats",
          matchBranch: ["Uncomplicated, source controlled"] },
        { sev: "required", what: "**CK weekly + statin hold** on daptomycin",
          why: "Rhabdomyolysis risk increases with HD dosing + statin combo" },
        { sev: "required", what: "**CBC weekly** on linezolid > 14 d",
          why: "Cytopenias + peripheral neuropathy + lactic acidosis with prolonged use" },
        { sev: "trigger", what: "**TEE + endocarditis workup**",
          why: "VRE IE seeds prosthetic + native valves" },
        { sev: "trigger", what: "**Combination salvage** (dapto + amp or ceftaroline)",
          why: "Synergy for persistent / refractory; ID-driven",
          matchBranch: ["Persistent on monotherapy"] },
        { sev: "consider", what: "**Source workup** — GI, GU, line",
          why: "Enterococcal translocation from gut common" },
      ],
    },
  },

  /* ===========================================================
     POLYMICROBIAL BACTEREMIA — gut/abdominal source typical. ====== */
  "polymicrobial-bact": {
    duration: {
      headline: "7-14 d per dominant organism + source control; abdominal source most common.",
      evidence: "Society consensus — pathogen + source-specific; STOP-IT bands when abdominal",
      branches: [
        { label: "Abdominal source + source controlled", days: "4-7 d post-control",
          detail: "Pip-tazo or carbapenem; STOP-IT bands apply" },
        { label: "GU source", days: "7-14 d",
          detail: "Per urosepsis bands + susceptibilities" },
        { label: "Skin/SSTI source", days: "Per SSTI bands",
          detail: "Often Group A strep + S. aureus; treat per source" },
        { label: "Inadequate source / unknown", days: "14 d minimum",
          detail: "Empiric broad spectrum; ID + surgical workup" },
      ],
      stopWhen: [
        "Source controlled",
        "Blood cultures cleared ≥ 48 h",
        "Afebrile",
        "Speciation + narrowing complete",
        "Imaging shows resolution",
        "Minimum 7 d completed",
      ],
      extendIf: [
        "Inadequate source control",
        { text: "**Septic shock** — extend per ICU course",
          matchCtx: { severe: true } },
        "Resistant organisms — extend per ID",
        "Recurrent / chronic source — workup",
      ],
    },
    monitoring: {
      headline: "Source-control imaging early; broad coverage initially; narrow per cultures.",
      items: [
        { sev: "required", what: "**Source workup imaging** within 24 h",
          why: "Source control is the inflection point" },
        { sev: "required", what: "**Broad coverage initially** — pip-tazo + vanco typical",
          why: "Polymicrobial implies multiple pathogen classes" },
        { sev: "required", what: "**Narrow on culture data** at 48-72 h",
          why: "Multiple organisms simplify on speciation; stewardship-critical" },
        { sev: "trigger", what: "**Surgical consult** for abdominal / abscess source",
          why: "Definitive drainage / debridement" },
        { sev: "trigger", what: "**Echinocandin** if upper-GI perf / postop / immunocompromised",
          why: "Candida co-infection drives mortality if missed" },
        { sev: "consider", what: "**Workup endocarditis** if persistent BCx",
          why: "Polymicrobial IE rare but reported" },
      ],
    },
  },

  /* ===========================================================
     STREPTOCOCCAL BACTEREMIA — penicillin-susceptible vs toxic. == */
  "strep-bact": {
    duration: {
      headline: "10-14 d for PCN-susceptible; per IE / TSS / necfasc bands for complications.",
      evidence: "Society consensus — penicillin G or ceftriaxone first-line; longer for IE",
      branches: [
        { label: "PCN-susceptible, no complications", days: "10-14 d",
          detail: "Penicillin G or ceftriaxone; viridans/anginosus/gallolyticus" },
        { label: "S. gallolyticus + colonoscopy workup", days: "14 d + workup",
          detail: "Treat + colonoscopy for colon cancer (25-80% association)" },
        { label: "Severe / toxic GAS", days: "10-14 d + clinda",
          detail: "Penicillin + clindamycin; per TSS bands if shock",
          matchAgent: /clindamycin/i },
        { label: "Streptococcal IE", days: "4-6 wk per IE",
          detail: "Per IE bands; 2 wk regimen + gent for uncomplicated low-risk" },
      ],
      stopWhen: [
        "Blood cultures cleared ≥ 48 h",
        "Afebrile",
        "Clinical recovery",
        "Echo negative (or per IE bands)",
        "Source workup complete",
        "Minimum 10-14 d completed",
      ],
      extendIf: [
        { text: "**Endocarditis** — per IE bands",
          matchCtx: { severe: true } },
        { text: "**Streptococcal TSS** — per TSS bands + IVIG",
          matchCtx: { severe: true } },
        "Necrotizing infection — per necfasc bands",
        "Mycotic aneurysm",
      ],
    },
    monitoring: {
      headline: "TEE for IE workup; colonoscopy for S. gallolyticus; necrotizing workup for GAS.",
      items: [
        { sev: "required", what: "**TEE for IE workup**",
          why: "Strep IE common; veg + duration drivers" },
        { sev: "required", what: "**Colonoscopy** if S. gallolyticus",
          why: "25-80% associated with colon cancer / polyps" },
        { sev: "trigger", what: "**Necrotizing infection workup** if GAS",
          why: "GAS + TSS + necrotizing infection common cluster" },
        { sev: "trigger", what: "**IVIG for streptococcal TSS confirmed**",
          why: "Mortality benefit specific to GAS-TSS",
          matchBranch: ["Severe / toxic GAS"] },
        { sev: "trigger", what: "**Clindamycin for toxin suppression** if GAS/TSS",
          why: "Ribosomal block reduces exotoxin; continue 5+ d after stable" },
        { sev: "consider", what: "**Source workup** — skin, abscess, sinus, dental",
          why: "Identify entry portal for prevention" },
      ],
    },
  },

  /* ===========================================================
     VASCULAR DEVICE INFECTION — port, line, graft, AVF. =========== */
  "device-vascular": {
    duration: {
      headline: "Per device + pathogen; explant typical; rifampin for retained hardware.",
      evidence: "Society consensus — explant drives outcomes; suppression for irretrievable",
      branches: [
        { label: "Port / line removed + targeted", days: "Per pathogen",
          detail: "Per CRBSI / SAB / CoNS bands depending on organism" },
        { label: "Graft / AVF / pacer-lead retained", days: "≥ 6 wk + rifampin",
          detail: "Add rifampin for staph; surgical removal preferred",
          matchAgent: /rifampin/i },
        { label: "Endocarditis-related device", days: "Per IE bands",
          detail: "TEE; surgery; per IE protocols" },
        { label: "Lifelong suppressive (irretrievable)", days: "Indefinite",
          detail: "Per ID + vascular surgery; oral monotherapy" },
      ],
      stopWhen: [
        "Device removed or stabilized on suppression",
        "Blood cultures cleared",
        "Afebrile",
        "Imaging shows resolution",
        "Minimum pathogen-specific duration completed",
      ],
      extendIf: [
        { text: "**Hardware retained** — extend per ID + vascular",
          matchCtx: { severe: true } },
        "Endocarditis — per IE bands",
        "Mycotic aneurysm — repair + extend",
        "Persistent BCx post-removal — endovascular workup",
      ],
    },
    monitoring: {
      headline: "Remove device when possible; rifampin for retained staph hardware; TEE.",
      items: [
        { sev: "required", what: "**Remove device** when feasible",
          why: "Biofilm + virulence drive failure with hardware in place" },
        { sev: "required", what: "**Vascular surgery consult** for graft / AVF / lead infection",
          why: "Surgical removal often necessary; complex revisions" },
        { sev: "required", what: "**TEE** for endocarditis / endovascular workup",
          why: "Standard for line + device-associated bacteremia" },
        { sev: "trigger", what: "**Rifampin combination** for staph + retained hardware",
          why: "Biofilm penetration; never empiric; LFT + interactions",
          matchAgent: /rifampin/i },
        { sev: "trigger", what: "**Lifelong suppression** if device irretrievable",
          why: "ID + vascular surgery decision; oral monotherapy" },
        { sev: "consider", what: "**Workup endocarditis source** for any device + bacteremia",
          why: "Hardware seeding from endocarditis vs vice-versa" },
      ],
    },
  },

  /* ===========================================================
     TRANSPLANT UTI — recurrent, atypical pathogens, drug interactions. */
  "transplant-uti": {
    duration: {
      headline: "7-14 d per pathogen + immunosuppression; treat asymptomatic in first 3 months post-tx.",
      evidence: "AST 2019 — early post-tx ASB treated; later asymptomatic not treated; longer course for resistant",
      branches: [
        { label: "Early post-tx (< 3 mo), symptomatic", days: "10-14 d",
          detail: "Treat aggressively; broad empiric until cultures back; carbapenem if prior MDR" },
        { label: "Late post-tx, symptomatic", days: "7-14 d",
          detail: "Per non-transplant UTI bands; tailor to local antibiogram + prior cultures" },
        { label: "ESBL / MDR (common in recurrent)", days: "10-14 d",
          detail: "Carbapenem or novel β-lactam; ID consult",
          matchAgent: /ertapenem|meropenem/i },
        { label: "Asymptomatic bacteriuria (early post-tx)", days: "5-7 d",
          detail: "Treat in first 3 mo post-tx; do NOT treat later asymptomatic" },
      ],
      stopWhen: [
        "Cultures cleared",
        "Symptoms resolved",
        "Renal function stable",
        "Immunosuppression unchanged or addressed",
        "Minimum 7-14 d completed",
      ],
      extendIf: [
        { text: "**Resistant organism / MDR** — extend per ID",
          matchCtx: { esblRisk: true } },
        "Inadequate source control (obstruction, abscess)",
        "Bacteremia — extend per source",
        "Recurrent infection — workup anatomic/immune",
      ],
    },
    monitoring: {
      headline: "Coordinate with transplant ID; check drug interactions; early-post-tx ASB treated.",
      items: [
        { sev: "required", what: "**Coordinate with transplant ID** at presentation",
          why: "Drug-immunosuppressant interactions complex; specialty input critical" },
        { sev: "required", what: "**Drug interaction screen** — cyclosporine, tacrolimus, sirolimus levels",
          why: "FQ ↑ tacrolimus levels; rifampin ↓; many critical interactions" },
        { sev: "required", what: "**Treat asymptomatic bacteriuria** in first 3 mo post-tx",
          why: "AST 2019 — early post-tx period high-risk; later asymptomatic not treated" },
        { sev: "trigger", what: "**Imaging if no response by 72 h**",
          why: "Obstruction, abscess, graft involvement" },
        { sev: "trigger", what: "**Workup graft pyelonephritis** — graft tenderness, fever, dysuria",
          why: "Renal-transplant pyelonephritis presents differently; image early" },
        { sev: "consider", what: "**BK virus workup** if culture-negative pyuria",
          why: "BK reactivation common in transplant + dysuria" },
      ],
    },
  },

  /* ===========================================================
     ASPIRATION PNEUMONIA / LUNG ABSCESS — chemical pneumonitis vs
     bacterial superinfection; anaerobes overstated, GNR + oral
     strep dominate; abscess 3–6 wk + drainage if possible. ====== */
  aspiration: {
    duration: {
      headline: "5–7 d uncomplicated; 3–6 wk for lung abscess until cavity resolves on imaging.",
      evidence: "Mandell 2007 + ATS 2019 — anaerobic coverage overstated for hospital aspiration; abscess driven by source control + cavity resolution",
      branches: [
        { label: "Chemical pneumonitis (witnessed, no fever / leukocytosis by 48 h)", days: "0 d",
          detail: "Observe without antibiotics; treat only if fever / leukocytosis / new infiltrate persist > 48 h" },
        { label: "Community-acquired aspiration pneumonia", days: "5–7 d",
          detail: "Per CAP; anaerobic coverage NOT routinely needed unless poor dentition + putrid sputum" },
        { label: "Hospital-acquired aspiration + polymicrobial", days: "7 d",
          detail: "Per HAP / VAP; cover GNR + MRSA per risk; de-escalate on cultures",
          matchAgent: /piperacillin|cefepime|meropenem/i },
        { label: "Lung abscess (cavitary, putrid)", days: "3–6 wk",
          detail: "Until cavity resolves on serial imaging; oral step-down acceptable when stable; drainage if accessible",
          matchAgent: /clindamycin|amoxicillin-?clavulanate|metronidazole/i },
        { label: "Necrotizing aspiration + immunocompromised", days: "≥ 6 wk",
          detail: "ID + thoracic surgery; consider mold workup; per pathogen" },
      ],
      stopWhen: [
        "Afebrile ≥ 48 h",
        "Stable oxygenation + work of breathing",
        "Imaging shows cavity resolution (if abscess)",
        "Oral step-down complete + tolerating",
        "Source — dental, GERD, dysphagia — addressed or workup booked",
        "Minimum 5–7 d (uncomplicated) or 3–6 wk (abscess) completed",
      ],
      extendIf: [
        { text: "**Lung abscess / cavitary disease** — until radiographic resolution",
          matchCtx: { severe: true } },
        "Empyema co-existing — per empyema bands + drainage",
        "Immunocompromised host — extend per pathogen + ANC / immune recovery",
        "Inadequate drainage or anatomic obstruction (mass, foreign body)",
        "MDR / non-fermenting GNR — per culture + ID",
      ],
    },
    monitoring: {
      headline: "Imaging at 4–6 wk for abscess; dysphagia workup; oral hygiene + GERD review.",
      items: [
        { sev: "required", what: "**Dysphagia / swallow evaluation** by speech pathology",
          why: "Recurrence prevention — modifiable risk in stroke / dementia / neuromuscular hosts" },
        { sev: "required", what: "**Repeat imaging at 4–6 wk** if abscess or cavity",
          why: "Cavity persistence > 6 wk drives workup for malignancy / TB / mold",
          matchBranch: ["Lung abscess (cavitary, putrid)"] },
        { sev: "trigger", what: "**Drainage** — IR or thoracic surgery — for abscess > 6 cm or non-response",
          why: "Source control accelerates resolution; large or peripheral abscesses amenable to percutaneous drain" },
        { sev: "trigger", what: "**Dental + oral hygiene review** in lung abscess",
          why: "Poor dentition drives recurrence + putrid anaerobic burden" },
        { sev: "trigger", what: "**Avoid empiric anaerobic coverage** in hospital aspiration without abscess / putrid sputum",
          why: "Anaerobic coverage overstated; collateral damage; favor narrower regimen" },
        { sev: "trigger", what: "**Bronchoscopy** if mass, foreign body, or non-response by day 7",
          why: "Post-obstructive pneumonia + retained foreign body mimic refractory aspiration" },
        { sev: "consider", what: "Procalcitonin trend if duration debate at day 5",
          why: "Falling PCT in clinical responder supports stopping" },
        { sev: "consider", what: "**Mold / fungal workup** if immunocompromised + non-response",
          why: "Aspergillus or mucor can mimic bacterial abscess in immunocompromised" },
      ],
    },
  },

  /* ===========================================================
     EMPYEMA / COMPLICATED PARAPNEUMONIC EFFUSION — drainage is
     the treatment; antibiotics adjunctive. MIST-2 (intrapleural
     tPA + DNase). 2–4 wk per organism + drainage. ============== */
  empyema: {
    duration: {
      headline: "2–4 wk total + chest tube drainage ± intrapleural fibrinolytics; longer for cavitary or BPF.",
      evidence: "ACCP 2000 + MIST-2 2011 — tPA + DNase reduces surgery in loculated empyema; duration drainage-anchored, not fixed",
      branches: [
        { label: "Uncomplicated parapneumonic effusion (free-flowing, sterile)", days: "Per CAP / HAP",
          detail: "Per primary pneumonia bands; drainage usually not needed" },
        { label: "Complicated parapneumonic / early empyema (loculated)", days: "2–3 wk + drainage",
          detail: "Chest tube + consider intrapleural tPA / DNase per MIST-2; IV → PO on resolution" },
        { label: "Frank empyema (pus, organisms on Gram stain)", days: "3–4 wk + drainage",
          detail: "Drainage mandatory; surgical decortication if loculated + non-response by 7 d",
          matchAgent: /ampicillin-?sulbactam|piperacillin|ceftriaxone/i },
        { label: "Anaerobic / putrid (poor dentition, aspiration source)", days: "3–4 wk + drainage",
          detail: "Cover anaerobes — metronidazole or clindamycin; drainage + source",
          matchAgent: /metronidazole|clindamycin|amoxicillin-?clavulanate/i },
        { label: "TB empyema / aspergillus / unusual pathogens", days: "Per pathogen",
          detail: "TB ≥ 6 mo; aspergillus per IFI bands; ID-driven" },
      ],
      stopWhen: [
        "Chest tube removed + lung re-expanded",
        "Afebrile ≥ 48 h + WBC normalizing",
        "Imaging shows resolution / stable post-drainage",
        "Oral step-down complete",
        "Minimum 2–4 wk total + drainage criteria met",
      ],
      extendIf: [
        { text: "**Loculated / trapped lung** — extend per drainage + surgical decision",
          matchCtx: { severe: true } },
        "Bronchopleural fistula — extend per thoracic surgery",
        "TB or fungal — per pathogen-specific bands",
        "Inadequate source control — re-drainage or VATS / decortication",
      ],
    },
    monitoring: {
      headline: "Drainage drives outcome; intrapleural tPA + DNase for loculated; thoracic surgery early.",
      items: [
        { sev: "required", what: "**Chest tube drainage** at presentation",
          why: "Source control — antibiotics alone fail in loculated / frank empyema" },
        { sev: "required", what: "**Thoracic surgery consult** at presentation",
          why: "Early VATS / decortication if loculated or non-response by 7 d" },
        { sev: "required", what: "**Pleural fluid culture + Gram stain + pH + glucose + LDH**",
          why: "pH < 7.2, glucose < 40, or positive Gram defines empyema; drives drainage decision" },
        { sev: "trigger", what: "**Intrapleural tPA 10 mg + DNase 5 mg BID × 3 d** for loculated",
          why: "MIST-2 — reduces surgical referral by ~30%; do not use either agent alone" },
        { sev: "trigger", what: "**Repeat imaging at 24–48 h post-drainage** to assess re-expansion",
          why: "Trapped lung or persistent loculation drives surgical escalation" },
        { sev: "trigger", what: "**Avoid aminoglycosides** for primary therapy",
          why: "Inactivated in low-pH pleural pus; poor penetration" },
        { sev: "consider", what: "**Workup TB / fungal** if non-response or atypical presentation",
          why: "TB + aspergillus empyema mimic bacterial; pathogen-specific therapy" },
        { sev: "consider", what: "**Bronchoscopy** if endobronchial obstruction suspected",
          why: "Post-obstructive empyema from tumor / foreign body drives recurrence" },
      ],
    },
  },

  /* ===========================================================
     COPD EXACERBATION — Anthonisen criteria; 5 d standard; longer
     for bronchiectasis substrate or P. aeruginosa. ============= */
  copd: {
    duration: {
      headline: "5 d for most bacterial AECOPD; longer for bronchiectasis substrate or P. aeruginosa.",
      evidence: "GOLD 2024 + Falagas 2008 meta — 5 d non-inferior to longer courses; antibiotics benefit purulent + Anthonisen-1 / 2",
      branches: [
        { label: "Anthonisen type 1 or 2 + purulent sputum", days: "5 d",
          detail: "Macrolide or doxy or amox-clav per local antibiogram; no clear winner head-to-head",
          matchAgent: /azithromycin|doxycycline|amoxicillin-?clavulanate/i },
        { label: "Severe exacerbation requiring ICU / NIV", days: "5–7 d",
          detail: "Extend by 2 d for ICU substrate; cover P. aeruginosa if frequent exacerbations / prior cultures",
          matchAgent: /piperacillin|cefepime|levofloxacin/i },
        { label: "P. aeruginosa colonized / cultured", days: "10–14 d",
          detail: "Cipro or levo or β-lactam; per prior sensitivity; eradication not the goal in chronic colonization" },
        { label: "Bronchiectasis overlap", days: "Per bronchiectasis bands",
          detail: "Treat per bronchiectasis exacerbation; longer courses" },
        { label: "Non-purulent / Anthonisen type 3 alone", days: "0 d",
          detail: "Antibiotics not indicated; manage with steroids + bronchodilators ± non-invasive ventilation" },
      ],
      stopWhen: [
        "Sputum purulence resolved",
        "Dyspnea returned to baseline",
        "Oxygenation stable off acute escalation",
        "Steroid course complete or tapering",
        "Minimum 5 d (uncomplicated) or pathogen-specific course completed",
      ],
      extendIf: [
        { text: "**P. aeruginosa** cultured or colonized with risk factors",
          matchCtx: { pseudoRisk: true } },
        "Bronchiectasis substrate — longer per bronchiectasis bands",
        "ICU / NIV severity — extend to 5–7 d",
        "Inadequate response by day 3 — re-eval pathogen, viral cause, embolus",
      ],
    },
    monitoring: {
      headline: "Anthonisen criteria for antibiotic decision; steroids 5 d; avoid antibiotics for non-purulent.",
      items: [
        { sev: "required", what: "**Anthonisen criteria** — ↑ dyspnea + ↑ sputum + ↑ purulence",
          why: "Antibiotics benefit 2-of-3 (esp. if purulence); skip in type 3 alone" },
        { sev: "required", what: "**Prednisone 40 mg × 5 d** (REDUCE trial)",
          why: "5 d non-inferior to 14 d; reduces readmission + length of stay" },
        { sev: "required", what: "**Sputum culture** if frequent exacerbations or prior P. aeruginosa",
          why: "Pseudomonal colonization drives antibiotic choice + duration" },
        { sev: "trigger", what: "**Cover P. aeruginosa** if prior cultures + risk factors",
          why: "Frequent exacerbations + structural disease + prior antibiotics predict P. aeruginosa",
          matchCtx: { pseudoRisk: true } },
        { sev: "trigger", what: "**NIV / BiPAP** for hypercapnic respiratory failure",
          why: "Reduces intubation + mortality in COPD exacerbation with respiratory acidosis" },
        { sev: "trigger", what: "**Re-eval at 72 h** if non-response — viral, embolus, heart failure, pneumothorax",
          why: "Mimics drive treatment failure — image + d-dimer + BNP indicated" },
        { sev: "consider", what: "**Influenza / RSV / COVID PCR** in season",
          why: "Viral exacerbations common; antivirals change course if early" },
        { sev: "consider", what: "**Smoking cessation counseling + pulmonary rehab referral**",
          why: "Highest-impact long-term interventions; addressable at every admission" },
      ],
    },
  },

  /* ===========================================================
     BRONCHIECTASIS EXACERBATION — 14 d standard; per pathogen
     (Pseudomonas eradication); inhaled antibiotics adjunctive. = */
  bronchiectasis: {
    duration: {
      headline: "14 d for most bronchiectasis exacerbations; longer for P. aeruginosa eradication or NTM.",
      evidence: "BTS 2019 + Chalmers — 14 d standard; eradication of first P. aeruginosa isolate reduces colonization",
      branches: [
        { label: "Standard bronchiectasis exacerbation", days: "14 d",
          detail: "Cover per prior sputum cultures; oral if mild, IV if severe",
          matchAgent: /amoxicillin-?clavulanate|doxycycline|azithromycin/i },
        { label: "P. aeruginosa — first isolate (eradication attempt)", days: "14 d IV + 3 mo inhaled",
          detail: "IV cipro / β-lactam × 14 d then inhaled tobi or colistin × 3 mo per BTS",
          matchAgent: /ciprofloxacin|tobramycin|colistin/i },
        { label: "P. aeruginosa — chronic colonization, exacerbation", days: "14 d",
          detail: "Per sensitivity; eradication not goal; consider inhaled suppressive maintenance" },
        { label: "Non-tuberculous mycobacteria (MAC, abscessus)", days: "≥ 12 mo macrolide-based",
          detail: "Per ATS / IDSA 2020 NTM bands; ID-driven combination" },
        { label: "Aspergillus / ABPA overlap", days: "Per ABPA bands",
          detail: "Steroids ± itraconazole; not standard antibiotic course" },
      ],
      stopWhen: [
        "Sputum volume + purulence returned to baseline",
        "Dyspnea + cough returned to baseline",
        "Afebrile",
        "CRP / WBC normalizing if elevated",
        "Minimum 14 d completed (most pathogens)",
      ],
      extendIf: [
        { text: "**First P. aeruginosa isolate** — extend per eradication protocol",
          matchCtx: { pseudoRisk: true } },
        "NTM identified — per ATS / IDSA NTM bands",
        "ABPA / aspergillus overlap — per ABPA bands",
        "Inadequate response — re-eval pathogen + airway clearance + adherence",
      ],
    },
    monitoring: {
      headline: "Sputum culture every exacerbation; airway clearance; eradication on first P. aeruginosa.",
      items: [
        { sev: "required", what: "**Sputum culture** with every exacerbation",
          why: "Pathogen drift over time — P. aeruginosa, S. aureus, NTM drive choice" },
        { sev: "required", what: "**Airway clearance therapy** — PEP, vest, postural drainage",
          why: "Non-pharmacologic backbone; antibiotic course alone often inadequate" },
        { sev: "required", what: "**Eradication attempt on first P. aeruginosa isolate**",
          why: "First isolate eradication reduces transition to chronic colonization",
          matchBranch: ["P. aeruginosa — first isolate (eradication attempt)"] },
        { sev: "trigger", what: "**NTM workup** — AFB sputum × 3 + HRCT if recurrent or mod-severe",
          why: "MAC + abscessus common; underdiagnosed; pathogen-specific treatment" },
        { sev: "trigger", what: "**Macrolide maintenance** if ≥ 3 exacerbations / yr (without NTM)",
          why: "BAT trial + EMBRACE — macrolide ↓ exacerbations; QTc + LFT monitoring",
          matchAgent: /azithromycin/i },
        { sev: "trigger", what: "**Inhaled antibiotic maintenance** for chronic P. aeruginosa + frequent exacerbations",
          why: "Inhaled tobramycin / colistin / aztreonam reduces bacterial burden + exacerbation rate" },
        { sev: "trigger", what: "**Etiology workup** if new diagnosis — CF, PCD, immune deficiency, ABPA, NTM",
          why: "20–30% of bronchiectasis has identifiable + treatable etiology" },
        { sev: "consider", what: "**Pulmonary rehab + vaccinations** — flu, pneumococcal, COVID, RSV",
          why: "Reduce exacerbations + improve functional status" },
      ],
    },
  },

  /* ===========================================================
     VAT — Ventilator-associated tracheobronchitis. Treatment
     controversial; reduces VAP progression in select cohorts. == */
  vat: {
    duration: {
      headline: "7 d if treated; controversial — reserve for purulent secretions + clinical change without infiltrate.",
      evidence: "Nseir 2008 — IV antibiotics for VAT reduced VAP progression + ICU LOS; broader treatment debated",
      branches: [
        { label: "VAT with purulent secretions + no infiltrate (treat)", days: "7 d",
          detail: "Cover per ETA culture + local antibiogram; de-escalate aggressively",
          matchAgent: /piperacillin|cefepime|meropenem/i },
        { label: "VAT in immunocompromised / progressive disease", days: "7–10 d",
          detail: "Lower threshold to treat + extend; ID input" },
        { label: "Colonization without clinical change (do not treat)", days: "0 d",
          detail: "Positive ETA without fever / leukocytosis / clinical decline is colonization; avoid antibiotics" },
        { label: "MDR / non-fermenting GNR (P. aeruginosa, Acineto)", days: "7–10 d",
          detail: "Per sensitivity; high recurrence; consider inhaled adjunct" },
      ],
      stopWhen: [
        "Purulent secretions resolved",
        "Ventilator settings stable / improving",
        "No new infiltrate",
        "Afebrile + WBC normalizing",
        "Minimum 7 d completed (if treated)",
      ],
      extendIf: [
        { text: "**MDR / non-fermenting GNR** — extend per pathogen + ID",
          matchCtx: { pseudoRisk: true } },
        "Progression to VAP — per VAP bands",
        "Immunocompromised — extend per ID",
        "Inadequate response — re-eval pathogen + diagnosis (atelectasis, secretions vs infection)",
      ],
    },
    monitoring: {
      headline: "Treat only purulent + clinical change; avoid for colonization; monitor for VAP progression.",
      items: [
        { sev: "required", what: "**Distinguish VAT from colonization** — clinical + radiographic",
          why: "Treating colonization drives MDR + collateral damage without benefit" },
        { sev: "required", what: "**Daily CXR or LUS** to detect VAP progression",
          why: "New infiltrate = VAP, not VAT; changes treatment + duration" },
        { sev: "required", what: "**ETA / sputum culture** before starting",
          why: "Pathogen-directed therapy; de-escalation at 48–72 h on data" },
        { sev: "trigger", what: "**Inhaled colistin or tobramycin** for MDR GNR adjunct",
          why: "Improves clinical cure in MDR VAT with limited safety data",
          matchAgent: /colistin|tobramycin/i },
        { sev: "trigger", what: "**De-escalation at 48–72 h** on culture data",
          why: "Continued broad therapy drives MDR + collateral; narrow aggressively" },
        { sev: "trigger", what: "**Sub-glottic suction + oral hygiene + HOB elevation**",
          why: "VAP-bundle measures reduce VAT and VAP incidence" },
        { sev: "consider", what: "**Avoid treatment in low-risk colonization** — no fever, leukocytosis, infiltrate, or decline",
          why: "Antibiotic stewardship — treatment in pure colonization rarely benefits" },
      ],
    },
  },

  /* ===========================================================
     POST-OBSTRUCTIVE PNEUMONIA — distal to bronchial obstruction
     (tumor, foreign body, mucus plug). Drainage is the cure. === */
  postobstructive: {
    duration: {
      headline: "Per CAP / HAP for episode; recurrence inevitable without obstruction relief — bronchoscopy mandatory.",
      evidence: "Society consensus — antibiotic course mirrors community / hospital pneumonia; durable cure requires obstruction relief",
      branches: [
        { label: "Acute episode + planned bronchoscopy / stent / RT", days: "7–10 d",
          detail: "Per CAP / HAP bands; extend slightly while planning definitive intervention",
          matchAgent: /piperacillin|cefepime|ceftriaxone/i },
        { label: "Necrotizing or cavitary post-obstructive", days: "3–6 wk",
          detail: "Per cavitary pneumonia bands; treat until cavity resolves" },
        { label: "Anaerobic / putrid sputum (poor dentition + obstruction)", days: "3–6 wk",
          detail: "Cover anaerobes — metronidazole, clinda, or amox-clav",
          matchAgent: /metronidazole|clindamycin|amoxicillin-?clavulanate/i },
        { label: "Recurrent without obstruction relief", days: "Per episode + suppress",
          detail: "Recurrence cycle; involve thoracic onc + IR; chronic suppression rarely durable" },
      ],
      stopWhen: [
        "Afebrile ≥ 48 h + clinical recovery",
        "Imaging shows resolution distal to obstruction",
        "Obstruction relief plan in place (bronchoscopy, stent, RT)",
        "Oral step-down complete",
        "Minimum 7–10 d (or longer per cavity) completed",
      ],
      extendIf: [
        { text: "**Cavitary / necrotizing** distal disease",
          matchCtx: { severe: true } },
        "Empyema co-existing — per empyema bands + drainage",
        "Persistent obstruction without relief — extend or chronic suppression",
        "Immunocompromised host — extend per ID",
      ],
    },
    monitoring: {
      headline: "Bronchoscopy + tumor workup mandatory; antibiotic alone never durably cures; thoracic onc.",
      items: [
        { sev: "required", what: "**Bronchoscopy + biopsy** at first episode",
          why: "Identifies obstruction etiology — tumor, foreign body, mucus plug, stricture" },
        { sev: "required", what: "**Thoracic oncology + IR consult** for definitive obstruction relief",
          why: "Stent, debulking, RT, or surgery — drives recurrence prevention" },
        { sev: "required", what: "**CT chest with contrast** to characterize obstruction + cavity",
          why: "Defines anatomy + drives bronchoscopy + intervention planning" },
        { sev: "trigger", what: "**Cover anaerobes** if putrid sputum or poor dentition",
          why: "Stagnant secretions distal to obstruction harbor anaerobes" },
        { sev: "trigger", what: "**Workup for empyema** if effusion present",
          why: "Post-obstructive effusions often complicated; drainage if loculated" },
        { sev: "trigger", what: "**Palliative care + goals of care** if metastatic / unresectable",
          why: "Recurrence inevitable; symptom-focused approach often appropriate" },
        { sev: "consider", what: "**Chronic suppression** if obstruction cannot be relieved",
          why: "Reserve for select cases; rarely durable; collateral risk" },
        { sev: "consider", what: "**Pulmonary rehab + smoking cessation**",
          why: "Functional optimization + risk reduction across underlying disease" },
      ],
    },
  },

  /* ===========================================================
     ACUTE TRACHEOBRONCHITIS (non-ventilated) — predominantly
     viral; antibiotics rarely indicated; pertussis exception. == */
  tracheobronchitis: {
    duration: {
      headline: "Antibiotics rarely indicated — most cases viral; treat pertussis + bacterial-confirmed only.",
      evidence: "ACP 2016 — antibiotics not recommended for uncomplicated acute bronchitis; harms exceed benefits in viral disease",
      branches: [
        { label: "Acute uncomplicated bronchitis (viral)", days: "0 d",
          detail: "Symptomatic care only; cough persists 2–3 wk normally; antibiotics not indicated" },
        { label: "Pertussis confirmed or strongly suspected", days: "5 d",
          detail: "Azithromycin × 5 d; reduces transmission but minimal symptom benefit beyond 1 wk illness",
          matchAgent: /azithromycin/i },
        { label: "Mycoplasma or chlamydophila confirmed", days: "5–7 d",
          detail: "Doxycycline or macrolide; symptom benefit modest",
          matchAgent: /doxycycline/i },
        { label: "Bacterial superinfection (purulent + persistent + new fever)", days: "5–7 d",
          detail: "Per CAP-light or sinopulmonary infection; document indication" },
        { label: "Underlying COPD / bronchiectasis exacerbation", days: "Per substrate",
          detail: "Per COPD or bronchiectasis bands; standalone tracheobronchitis rarely applies in chronic lung disease" },
      ],
      stopWhen: [
        "Course completed (if treated)",
        "Cough resolved or returning to baseline",
        "Afebrile",
        "No bacterial superinfection signal",
        "Transmission isolation lifted (pertussis)",
      ],
      extendIf: [
        { text: "**Bacterial superinfection** confirmed by culture + clinical change",
          matchCtx: { severe: true } },
        "Underlying COPD / bronchiectasis — per substrate bands",
        "Immunocompromised host — lower threshold to treat + extend",
        "Inadequate response — re-image for pneumonia",
      ],
    },
    monitoring: {
      headline: "Symptomatic care; antibiotics rarely indicated; pertussis exposure + transmission focus.",
      items: [
        { sev: "required", what: "**Antibiotic stewardship** — explain natural history (cough 2–3 wk)",
          why: "Acute bronchitis is viral; antibiotics drive resistance + side effects without benefit" },
        { sev: "required", what: "**Pertussis PCR** if cough > 2 wk or paroxysmal / post-tussive emesis",
          why: "Public health reporting + post-exposure prophylaxis + isolation drive transmission control" },
        { sev: "required", what: "**Image (CXR) if fever, tachycardia, focal exam, or hypoxia**",
          why: "Rule out pneumonia — changes diagnosis + duration + escalation" },
        { sev: "trigger", what: "**Symptomatic care** — bronchodilators if wheezing, lozenges, hydration",
          why: "Mainstay of care; sets expectations + reduces antibiotic pressure" },
        { sev: "trigger", what: "**Pertussis post-exposure prophylaxis** for household + close contacts",
          why: "Public health — azithro × 5 d for contacts; protects infants + immunocompromised" },
        { sev: "trigger", what: "**Influenza + COVID PCR** in season",
          why: "Antivirals change course if early; isolation planning" },
        { sev: "consider", what: "**Smoking cessation counseling**",
          why: "Highest-impact intervention; addressable at every visit" },
        { sev: "consider", what: "**Vaccinations review** — flu, COVID, pertussis (Tdap), pneumococcal",
          why: "Prevention reduces recurrent bronchitis incidence" },
      ],
    },
  },

  /* ===========================================================
     ZOONOTIC & ATYPICAL PNEUMONIA — Q fever, psittacosis, tularemia,
     plague, leptospira. Doxycycline / FQ workhorse; specific durations. */
  "zoonotic-pna": {
    duration: {
      headline: "Pathogen-specific durations — doxycycline backbone for most; pulmonary tularemia / plague distinct.",
      evidence: "CDC + Mandell — doxycycline first-line for Q fever, psittacosis, ehrlichia; FQ alternative; plague + tularemia per specific bands",
      branches: [
        { label: "Q fever pneumonia (acute, Coxiella burnetii)", days: "14 d",
          detail: "Doxycycline 100 mg BID; longer (12–18 mo + HCQ) if chronic / endocarditis",
          matchAgent: /hydroxychloroquine/i },
        { label: "Psittacosis (Chlamydophila psittaci, bird exposure)", days: "10–14 d",
          detail: "Doxycycline first-line; macrolide alternative; exposure history is the diagnostic key" },
        { label: "Pulmonary tularemia (Francisella tularensis)", days: "10–14 d",
          detail: "Cipro 10–14 d, or doxycycline / streptomycin / gentamicin 14 d; tier 1 select agent — alert lab + public health",
          matchAgent: /streptomycin/i },
        { label: "Pneumonic plague (Yersinia pestis)", days: "10–14 d",
          detail: "Streptomycin or gentamicin or cipro or doxy; isolate + report; post-exposure prophylaxis × 7 d for contacts",
          matchAgent: /gentamicin/i },
        { label: "Leptospirosis with pulmonary hemorrhage", days: "7 d",
          detail: "Ceftriaxone or doxy or PCN; ICU support; ID + nephrology",
          matchAgent: /ceftriaxone/i },
        { label: "Anthrax (inhalational, Bacillus anthracis)", days: "60 d + combination",
          detail: "Cipro or doxy + clinda + raxibacumab/obiltoxaximab per CDC; post-exposure prophylaxis × 60 d",
          matchAgent: /raxibacumab|obiltoxaximab/i },
      ],
      stopWhen: [
        "Pathogen-specific duration completed",
        "Clinical recovery + afebrile",
        "Imaging stable / resolving",
        "Public health reporting completed (notifiable diseases)",
        "Contacts notified + prophylaxis given as indicated",
      ],
      extendIf: [
        { text: "**Chronic Q fever / endocarditis** — 12–18 mo + hydroxychloroquine",
          matchCtx: { severe: true } },
        "Inhalational anthrax — 60 d + combination + antitoxin",
        "Plague / tularemia — bioterror context, escalate per CDC",
        "Immunocompromised — extend per ID",
      ],
    },
    monitoring: {
      headline: "Exposure history is the diagnostic key; report notifiable diseases; doxycycline workhorse.",
      items: [
        { sev: "required", what: "**Exposure history** — animals, travel, vectors, occupation",
          why: "Birds → psittacosis; livestock → Q fever / brucella; ticks → ehrlichia / RMSF; rabbits → tularemia" },
        { sev: "required", what: "**Public health reporting** for plague, anthrax, tularemia, Q fever",
          why: "Notifiable; tier 1 select agents drive lab + contact tracing response" },
        { sev: "required", what: "**Alert lab before sending** for plague / tularemia / anthrax",
          why: "BSL-3 organisms; lab worker exposure risk; specimen handling requirements" },
        { sev: "trigger", what: "**Post-exposure prophylaxis** for plague / anthrax close contacts",
          why: "Doxy or cipro × 7 d (plague) or 60 d (anthrax); protects contacts" },
        { sev: "trigger", what: "**Echo + chronic Q fever workup** if persistent fever > 6 mo",
          why: "Chronic Q fever endocarditis high mortality; 12–18 mo doxy + HCQ" },
        { sev: "trigger", what: "**Antitoxin (raxibacumab / obiltoxaximab)** for inhalational anthrax",
          why: "CDC-recommended adjunct to combination antibiotics" },
        { sev: "consider", what: "**Serology + PCR** for confirmation",
          why: "Most zoonotic pneumonia diagnoses confirmed retrospectively by paired serology" },
        { sev: "consider", what: "**ID consult** at presentation",
          why: "Unusual pathogens; specific therapeutic and reporting requirements" },
      ],
    },
  },

  /* ===========================================================
     PNEUMONIA IN NEUTROPENIC / TRANSPLANT HOST — broad bacterial
     + mold + viral coverage; ANC recovery drives duration. ====== */
  "neutropenic-pna": {
    duration: {
      headline: "Broad bacterial + mold + viral coverage; duration anchored to pathogen + ANC / immune recovery.",
      evidence: "IDSA 2018 + EORTC — empiric anti-pseudomonal + mold-active workup; duration per pathogen + ≥ 7 d after ANC > 500",
      branches: [
        { label: "Bacterial CAP / HAP equivalent + ANC recovering", days: "7–14 d",
          detail: "Per CAP / HAP bands; extend until ≥ 5 d after ANC > 500 + clinical recovery",
          matchAgent: /piperacillin|cefepime|meropenem/i },
        { label: "Invasive pulmonary aspergillosis (IPA) confirmed / probable", days: "6–12 wk",
          detail: "Voriconazole first-line; isavuconazole alternative; per EORTC criteria + ANC + steroid trajectory",
          matchAgent: /voriconazole|isavuconazole|posaconazole/i },
        { label: "PJP (Pneumocystis jirovecii)", days: "21 d",
          detail: "TMP-SMX × 21 d; add steroids if PaO₂ < 70 or A-a > 35; secondary prophylaxis after",
          matchAgent: /trimethoprim-?sulfamethoxazole|sulfamethoxazole/i },
        { label: "CMV pneumonitis", days: "≥ 14 d + VL clear",
          detail: "Ganciclovir or foscarnet until viral load undetectable + ≥ 14 d total; reduce immunosuppression per transplant ID",
          matchAgent: /ganciclovir|foscarnet/i },
        { label: "Mucormycosis (Rhizopus, Mucor)", days: "Per IFI bands + surgery",
          detail: "Liposomal amphotericin + surgical debridement; ID + thoracic surgery",
          matchAgent: /amphotericin|isavuconazole|posaconazole/i },
        { label: "Persistent neutropenic fever + non-response", days: "Until ANC recovers",
          detail: "Add empiric antifungal (echinocandin or vori or ampho) per IDSA + image-driven workup; continue until ANC > 500 + clinical resolution" },
      ],
      stopWhen: [
        "Pathogen identified + pathogen-specific duration met",
        "ANC > 500 + sustained for ≥ 48 h",
        "Afebrile + clinical recovery",
        "Imaging shows resolution / stability",
        "Antifungal prophylaxis transitioned per protocol",
      ],
      extendIf: [
        { text: "**Persistent neutropenia / immunosuppression** — extend until recovery + clinical resolution",
          matchCtx: { severe: true } },
        "Invasive fungal infection — per IFI bands (weeks to months)",
        "Cavitary or necrotizing — per cavitary bands + surgery",
        "GVHD or rejection — coordinate with transplant team",
      ],
    },
    monitoring: {
      headline: "ID + transplant consult; galactomannan + BDG; CT chest early; mold-active empiric for persistent fever.",
      items: [
        { sev: "required", what: "**ID + transplant team consult** at presentation",
          why: "Pathogen + drug interaction + immunosuppression management requires specialist input" },
        { sev: "required", what: "**CT chest within 24 h** of presentation",
          why: "Halo / reverse halo / cavitation predict mold; CXR insensitive in neutropenic host" },
        { sev: "required", what: "**Serum galactomannan + 1,3-β-D-glucan** twice weekly",
          why: "Serial monitoring drives mold-active escalation + duration in IPA" },
        { sev: "required", what: "**Bronchoscopy + BAL** if non-diagnostic CT or empiric failure by 96 h",
          why: "Targeted pathogen identification — bacterial, mold, viral, PJP" },
        { sev: "trigger", what: "**Empiric antifungal** if persistent fever ≥ 96 h on broad antibiotics",
          why: "IDSA 2018 — empiric mold-active therapy reduces breakthrough IFI",
          matchAgent: /voriconazole|isavuconazole|caspofungin|micafungin|amphotericin/i },
        { sev: "trigger", what: "**Reduce immunosuppression** if feasible per transplant team",
          why: "Single highest-impact intervention in transplant pneumonia outcome" },
        { sev: "trigger", what: "**Voriconazole TDM** — trough 1–5.5 mg/L for IPA",
          why: "Sub-target drives failure; supra-target drives toxicity; check at day 5",
          matchAgent: /voriconazole/i },
        { sev: "trigger", what: "**Steroids for PJP** if PaO₂ < 70 or A-a gradient > 35",
          why: "Mortality benefit in moderate-severe PJP; taper over 21 d",
          matchBranch: ["PJP (Pneumocystis jirovecii)"] },
        { sev: "consider", what: "**Respiratory viral panel** — RSV, flu, COVID, parainfluenza, metapneumo",
          why: "Common in transplant + can drive bacterial / fungal superinfection" },
        { sev: "consider", what: "**Secondary prophylaxis** after PJP / IPA / mucor per pathogen",
          why: "Recurrence high without prophylaxis during ongoing immunosuppression" },
      ],
    },
  },

  /* ===========================================================
     PURULENT SSTI / CUTANEOUS ABSCESS — I&D is the treatment;
     antibiotics adjunctive; MRSA-dominant in U.S. ============== */
  purulent: {
    duration: {
      headline: "I&D is the cure; antibiotics adjunct for fever / systemic signs / large / surrounding cellulitis.",
      evidence: "IDSA 2014 + Talan 2016 NEJM — TMP-SMX after I&D ↑ cure rate ~7%; small simple abscesses heal with drainage alone",
      branches: [
        { label: "Simple abscess < 2 cm, drained, no cellulitis", days: "0 d",
          detail: "I&D alone; antibiotics not required; ensure follow-up + return precautions" },
        { label: "Abscess + surrounding cellulitis / systemic signs", days: "5–7 d",
          detail: "TMP-SMX or doxy or clinda; cover MRSA empirically; cefazolin for MSSA-confirmed",
          matchAgent: /trimethoprim-?sulfamethoxazole|doxycycline|clindamycin/i },
        { label: "Recurrent MRSA / household clusters", days: "7 d + decolonization",
          detail: "Treat + decolonize: mupirocin nares + chlorhexidine wash × 5–10 d; household coordination" },
        { label: "Diabetic / immunocompromised / large > 5 cm", days: "7–14 d",
          detail: "Extend per host + size; lower threshold to IV + ID consult" },
      ],
      stopWhen: [
        "Abscess drained + wound healing / packed",
        "Surrounding erythema resolved or receding",
        "Afebrile + systemic signs cleared",
        "Tolerating oral therapy",
        "Minimum course completed if antibiotics started",
      ],
      extendIf: [
        { text: "**Bacteremia** confirmed — extend per pathogen + source",
          matchCtx: { severe: true } },
        "Inadequate drainage — re-I&D or IR drain for deep / loculated",
        { text: "**Immunocompromised host** — extend per ID + host substrate",
          matchCtx: { severe: true } },
        "Recurrent disease — decolonization + screen contacts",
      ],
    },
    monitoring: {
      headline: "I&D drives outcome; culture pus; decolonize for recurrent; antibiotics adjunct not primary.",
      items: [
        { sev: "required", what: "**I&D** at presentation — primary treatment",
          why: "Source control — antibiotics alone fail for established abscess > 2 cm" },
        { sev: "required", what: "**Wound culture** from drained pus",
          why: "MRSA-dominant in U.S.; pathogen-directed therapy if non-response or recurrence" },
        { sev: "trigger", what: "**Decolonization** for recurrent disease — mupirocin + chlorhexidine",
          why: "Reduces recurrence; coordinate with household contacts for cluster outbreaks" },
        { sev: "trigger", what: "**MRSA cover empirically** when antibiotics indicated",
          why: "Community MRSA dominates U.S. purulent SSTI; TMP-SMX / doxy / clinda are first-line",
          matchCtx: { mrsaRisk: true } },
        { sev: "trigger", what: "**Bedside US** if collection vs. cellulitis ambiguous",
          why: "Identifies drainable fluid; avoids unnecessary I&D in pure cellulitis" },
        { sev: "trigger", what: "**Wound packing + dressing changes** + follow-up in 48 h",
          why: "Recurrence common without adequate cavity collapse; ensures completion of drainage" },
        { sev: "consider", what: "**Hidradenitis / pilonidal workup** for recurrent abscesses in characteristic sites",
          why: "Underlying disease drives recurrence; different long-term management" },
        { sev: "consider", what: "**Antibiotic stewardship** — skip antibiotics for small drained abscess without systemic signs",
          why: "IDSA 2014 + outcome data — drainage alone sufficient; avoids selection pressure" },
      ],
    },
  },

  /* ===========================================================
     PYOMYOSITIS — primary muscle infection; S. aureus dominant;
     imaging-guided drainage; longer courses for deep abscess. = */
  pyomyositis: {
    duration: {
      headline: "3–4 wk total — drainage + IV → oral step-down on response; longer if multifocal or persistent abscess.",
      evidence: "IDSA + tropical medicine reviews — S. aureus 75–95% of cases; MRI early; drainage is curative",
      branches: [
        { label: "Single drained abscess, immunocompetent", days: "21 d",
          detail: "IV → PO step-down on response; cefazolin for MSSA, vancomycin / linezolid for MRSA",
          matchAgent: /cefazolin|nafcillin|oxacillin/i },
        { label: "MRSA-confirmed", days: "21–28 d",
          detail: "Vancomycin or linezolid or daptomycin; AUC for vanco; PO step-down to clinda or doxy when stable",
          matchAgent: /vancomycin|linezolid|daptomycin/i },
        { label: "Multifocal / immunocompromised", days: "4–6 wk",
          detail: "ID consult; serial imaging; cover MRSA + GNR initially; narrow on cultures" },
        { label: "Tropical pyomyositis (endemic exposure)", days: "3–4 wk",
          detail: "S. aureus dominant; MRI early; rule out HIV + diabetes as substrate" },
        { label: "Persistent abscess despite drainage", days: "Per IR + ID",
          detail: "Repeat drainage; consider biofilm + retained necrotic tissue; surgical washout" },
      ],
      stopWhen: [
        "Abscess drained + no residual collection on imaging",
        "Afebrile ≥ 48 h + clinical recovery",
        "Inflammatory markers (CRP, WBC) trending normal",
        "Oral step-down complete + tolerating",
        "Minimum 21 d (single) or 28+ d (MRSA / multifocal) completed",
      ],
      extendIf: [
        { text: "**Multifocal disease** or persistent abscess on serial imaging",
          matchCtx: { severe: true } },
        "Bacteremia confirmed — per SAB bands if S. aureus",
        "Immunocompromised host — extend per ID + immune status",
        "Inadequate drainage — repeat IR or surgical",
      ],
    },
    monitoring: {
      headline: "MRI early; drainage drives outcome; SAB workup if S. aureus; HIV + diabetes screen for new diagnosis.",
      items: [
        { sev: "required", what: "**MRI of affected muscle group** at presentation",
          why: "Defines abscess vs. phlegmon; guides drainage planning; tracks response" },
        { sev: "required", what: "**Drainage** — IR or surgical — for any organized abscess",
          why: "Source control — antibiotics alone fail in established muscle abscess" },
        { sev: "required", what: "**Blood cultures × 2** at presentation",
          why: "S. aureus bacteremia common; if positive, treat per SAB bands (longer course + TEE)" },
        { sev: "trigger", what: "**HIV + diabetes screen** in new diagnosis (especially tropical)",
          why: "Underlying immunosuppression common substrate; addressable" },
        { sev: "trigger", what: "**Repeat MRI** at week 2–3 if non-response",
          why: "Persistent or new abscess drives re-drainage; tracks response objectively" },
        { sev: "trigger", what: "**Vancomycin AUC 400–600** for MRSA",
          why: "Therapeutic monitoring drives efficacy + reduces AKI",
          matchAgent: /vancomycin/i },
        { sev: "trigger", what: "**Compartment pressures** if extensive disease + pain out of proportion",
          why: "Compartment syndrome risk in extensive pyomyositis; surgical emergency" },
        { sev: "consider", what: "**Oral step-down** to clinda / doxy / linezolid when stable",
          why: "Reduces line complications + length of stay; outpatient completion feasible" },
      ],
    },
  },

  /* ===========================================================
     SEPTIC BURSITIS — olecranon / prepatellar; S. aureus
     dominant; aspirate + antibiotics; surgical for resistant. == */
  bursitis: {
    duration: {
      headline: "10–14 d antibiotics + aspiration; surgical bursectomy if persistent or recurrent.",
      evidence: "Society consensus — aspiration + 10–14 d antibiotics adequate for most; bursectomy for failure",
      branches: [
        { label: "Olecranon / prepatellar, drained, clinical response", days: "10–14 d",
          detail: "Cefazolin / cephalexin for MSSA; vancomycin / TMP-SMX for MRSA; IV → PO when stable",
          matchAgent: /cefazolin|cephalexin|dicloxacillin/i },
        { label: "MRSA-confirmed", days: "10–14 d",
          detail: "Vancomycin then PO clinda or doxy or TMP-SMX",
          matchAgent: /vancomycin|trimethoprim-?sulfamethoxazole|doxycycline/i },
        { label: "Immunocompromised / chronic disease", days: "14–21 d",
          detail: "Lower threshold to IV; longer course; ID input for unusual organisms" },
        { label: "Persistent / recurrent — bursectomy", days: "10–14 d post-op",
          detail: "Surgical bursectomy + IV antibiotics post-op; ortho consult" },
      ],
      stopWhen: [
        "Bursa decompressed + fluid resolving",
        "Erythema + tenderness resolved",
        "Afebrile",
        "Range of motion returning to baseline",
        "Minimum 10–14 d completed",
      ],
      extendIf: [
        { text: "**Persistent / recurrent** disease — surgical bursectomy",
          matchCtx: { severe: true } },
        "Bacteremia confirmed — per SAB bands if S. aureus",
        "Immunocompromised host — extend per ID",
        "Penetrating injury / FB — surgical exploration",
      ],
    },
    monitoring: {
      headline: "Aspirate at presentation; culture fluid; serial exam for response; bursectomy for failure.",
      items: [
        { sev: "required", what: "**Aspirate bursa** at presentation — diagnostic + therapeutic",
          why: "Cell count + culture confirm infection; drainage accelerates response" },
        { sev: "required", what: "**Fluid culture + Gram stain**",
          why: "S. aureus dominant; pathogen-directed therapy + MRSA detection drive choice" },
        { sev: "required", what: "**Differentiate from gout / pseudogout** — crystal exam",
          why: "Inflammatory bursitis mimics infection; antibiotics not indicated in crystal disease" },
        { sev: "trigger", what: "**Surgical bursectomy** if persistent or recurrent",
          why: "Failure of medical therapy; ortho consult for definitive management" },
        { sev: "trigger", what: "**Re-aspirate at 48–72 h** if non-response",
          why: "Re-accumulation + persistent infection; guides escalation" },
        { sev: "trigger", what: "**Vancomycin AUC** if MRSA empiric / confirmed",
          why: "Therapeutic monitoring drives efficacy",
          matchAgent: /vancomycin/i },
        { sev: "consider", what: "**Address occupational trauma** — kneeling pads, elbow protection",
          why: "Prevention of recurrence in housemaid's knee / student's elbow" },
        { sev: "consider", what: "**Workup chronic disease** — gout, RA, dialysis — for recurrent disease",
          why: "Underlying substrate drives recurrence; modifiable" },
      ],
    },
  },

  /* ===========================================================
     INFECTED PRESSURE INJURY — staging-driven; debridement +
     offloading; antibiotics only for cellulitis / sepsis. ====== */
  pressure: {
    duration: {
      headline: "Antibiotics ONLY for cellulitis / bacteremia / osteo; debridement + offloading drive cure.",
      evidence: "NPUAP + IDSA — surface colonization is universal in stage 3/4; antibiotics for invasive infection only",
      branches: [
        { label: "Colonization without cellulitis (stage 3/4 ulcer)", days: "0 d",
          detail: "Antibiotics NOT indicated; topical care, debridement, offloading; bacterial growth on swab is colonization" },
        { label: "Surrounding cellulitis, no systemic signs", days: "7 d",
          detail: "Per cellulitis bands; cefazolin / vancomycin per MRSA risk; debridement + offloading core" },
        { label: "Sepsis from pressure injury source", days: "7–14 d",
          detail: "Broad coverage — MRSA + GNR + anaerobes; per culture; ID consult" },
        { label: "Underlying osteomyelitis confirmed (MRI / bone bx)", days: "Per osteo bands",
          detail: "Per chronic osteo bands — 4–6 wk IV / oral with bioavailability; debridement of dead bone",
          matchAgent: /vancomycin|ceftriaxone|cefepime|piperacillin/i },
      ],
      stopWhen: [
        "Cellulitis resolved + systemic signs cleared",
        "Wound debrided + offloading in place",
        "Source addressed — pressure relief, nutrition, moisture control",
        "Course completed for invasive infection (if any)",
        "No bacteremia or osteo on workup",
      ],
      extendIf: [
        { text: "**Osteomyelitis** confirmed — extend per osteo bands",
          matchCtx: { severe: true } },
        "Bacteremia confirmed — extend per source pathogen",
        "Sepsis trajectory — per sepsis bands",
        "Inadequate debridement — surgical revision",
      ],
    },
    monitoring: {
      headline: "Antibiotic stewardship — colonization ≠ infection; debridement + offloading + nutrition; MRI for osteo.",
      items: [
        { sev: "required", what: "**Stewardship** — surface swab growth alone is NOT an indication to treat",
          why: "Stage 3/4 ulcers universally colonized; antibiotics drive resistance without benefit absent invasive signs" },
        { sev: "required", what: "**Pressure relief / offloading** + air-loss surface",
          why: "Without offloading, no antibiotic course succeeds; specialty bed + repositioning q2h" },
        { sev: "required", what: "**Wound care + sharp debridement** for slough / necrotic tissue",
          why: "Debridement is the primary intervention; surgical / enzymatic / mechanical" },
        { sev: "trigger", what: "**Deep tissue / bone culture** if osteo suspected (probe-to-bone, exposed bone)",
          why: "Surface swab misleading; deep culture drives pathogen-directed therapy" },
        { sev: "trigger", what: "**MRI** if osteomyelitis suspected",
          why: "Gold standard for osteo diagnosis + planning surgical extent" },
        { sev: "trigger", what: "**Nutrition consult + protein supplementation**",
          why: "Wound healing is protein-dependent; albumin / pre-albumin drive outcomes" },
        { sev: "trigger", what: "**Wound clinic / wound nurse referral**",
          why: "Specialized care drives healing + outpatient follow-up planning" },
        { sev: "consider", what: "**Negative-pressure wound therapy** for stage 3/4 cavities",
          why: "Accelerates granulation; complement to debridement + offloading" },
      ],
    },
  },

  /* ===========================================================
     ANIMAL & HUMAN BITE WOUNDS — Pasteurella (cat / dog),
     Eikenella (human), polymicrobial; amox-clav is workhorse. = */
  bites: {
    duration: {
      headline: "Amox-clav 3–5 d prophylaxis; 7–14 d if established infection; deep / hand always treat.",
      evidence: "IDSA 2014 + Cochrane — prophylaxis for high-risk bites (cat, hand, deep, immunocompromised); established infection 7–14 d",
      branches: [
        { label: "Low-risk bite, not infected", days: "0 d",
          detail: "Wound care + irrigation; tetanus + rabies risk assessment; observe for signs of infection" },
        { label: "Prophylaxis (cat bite, hand, deep, immunocompromised)", days: "3–5 d",
          detail: "Amox-clav 875 mg BID; alternative doxy + metronidazole if PCN allergy",
          matchAgent: /amoxicillin-?clavulanate/i },
        { label: "Established infection (cellulitis, purulence)", days: "7–14 d",
          detail: "Amox-clav PO or amp-sulbactam IV; cover Pasteurella (cat/dog) + Eikenella (human)" },
        { label: "Deep / joint / tendon involvement", days: "14–21 d",
          detail: "IV ampi-sulbactam or ertapenem; surgical washout for tenosynovitis; hand surgery consult" },
        { label: "Capnocytophaga (asplenic / immunocompromised)", days: "Per sepsis bands",
          detail: "Severe sepsis — per OPSI + sepsis bands; ceftriaxone or pip-tazo + ID" },
      ],
      stopWhen: [
        "Wound healing + no purulent drainage",
        "Cellulitis resolved",
        "Afebrile",
        "Hand function preserved (if hand bite)",
        "Tetanus + rabies prophylaxis addressed",
        "Minimum 3–5 d (prophylaxis) or 7–14 d (infection) completed",
      ],
      extendIf: [
        { text: "**Tenosynovitis / joint involvement** — surgical + extend",
          matchCtx: { severe: true } },
        "Bacteremia confirmed — per pathogen + source",
        "Capnocytophaga sepsis (asplenic) — per OPSI bands",
        "Inadequate wound care or retained tooth fragment",
      ],
    },
    monitoring: {
      headline: "Irrigate copiously; tetanus + rabies risk assessment; never close cat bites; hand surgery for deep.",
      items: [
        { sev: "required", what: "**Copious irrigation** with saline at presentation",
          why: "Mechanical reduction of bacterial load; single highest-impact wound care step" },
        { sev: "required", what: "**Tetanus prophylaxis** review + booster if indicated",
          why: "Bite wounds are tetanus-prone; standard ATS prophylaxis" },
        { sev: "required", what: "**Rabies risk assessment** for animal bites",
          why: "Public health reporting + post-exposure prophylaxis decisions; species + exposure + animal availability" },
        { sev: "trigger", what: "**Hand surgery consult** for hand bites + deep wounds",
          why: "Tenosynovitis + closed-space infection require surgical washout; hand function preservation" },
        { sev: "trigger", what: "**Cover Pasteurella** for cat / dog bites + Eikenella for human",
          why: "Amox-clav covers both + anaerobes; clinda + cipro misses Pasteurella; pick agent carefully" },
        { sev: "trigger", what: "**Do NOT primarily close cat bites** + most hand bites",
          why: "High infection rate; delayed closure or secondary intention; cosmetic-driven closure on face OK" },
        { sev: "trigger", what: "**HIV + hepatitis B/C prophylaxis** for human bite + blood exposure",
          why: "Bloodborne pathogen risk assessment; PEP if indicated" },
        { sev: "consider", what: "**Imaging** if FB suspected (tooth fragment, dirt)",
          why: "Retained FB drives persistent infection; X-ray or US" },
      ],
    },
  },

  /* ===========================================================
     MASTITIS & BREAST ABSCESS — lactational vs non-lactational;
     S. aureus dominant; continue breastfeeding; drain abscess. = */
  mastitis: {
    duration: {
      headline: "10–14 d antibiotics + continued breastfeeding / pumping; drain abscess; longer for granulomatous.",
      evidence: "ABM 2022 + IDSA — continue breastfeeding (safe for infant); abscess drainage drives cure; cover S. aureus",
      branches: [
        { label: "Lactational mastitis, no abscess", days: "10–14 d",
          detail: "Dicloxacillin / cephalexin; vanco / TMP-SMX if MRSA risk; continue breastfeeding / pumping",
          matchAgent: /dicloxacillin|cephalexin|cefazolin/i },
        { label: "Lactational abscess (drained)", days: "10–14 d",
          detail: "Aspiration + antibiotics; surgical I&D if loculated; continue breastfeeding contralateral" },
        { label: "Non-lactational / sub-areolar (smoker, diabetes)", days: "10–14 d",
          detail: "Cover anaerobes + S. aureus — amox-clav or clinda; recurrence common; surgical excision for fistula",
          matchAgent: /amoxicillin-?clavulanate|clindamycin/i },
        { label: "Granulomatous mastitis (idiopathic)", days: "Per pathology",
          detail: "Steroids + extended drainage; rule out TB / sarcoid / IGM; breast surgery + ID" },
        { label: "MRSA-confirmed", days: "10–14 d",
          detail: "Vancomycin then TMP-SMX or clinda PO; pediatrician input for nursing infant safety",
          matchAgent: /vancomycin|trimethoprim-?sulfamethoxazole/i },
      ],
      stopWhen: [
        "Erythema + tenderness resolved",
        "Abscess drained + cavity healing",
        "Afebrile",
        "Breastfeeding restored (if lactational)",
        "Minimum 10–14 d completed",
      ],
      extendIf: [
        { text: "**Granulomatous mastitis** — extended steroid course per pathology",
          matchCtx: { severe: true } },
        "Persistent abscess — repeat drainage or surgical excision",
        "MRSA bacteremia — per SAB bands",
        "Sub-areolar fistula — surgical excision",
      ],
    },
    monitoring: {
      headline: "US for abscess; continue breastfeeding; needle aspiration before surgical I&D; rule out IBC if non-response.",
      items: [
        { sev: "required", what: "**Bedside US** if abscess suspected",
          why: "Identifies drainable collection; guides needle aspiration vs. surgical drainage" },
        { sev: "required", what: "**Continue breastfeeding / pumping** unless infant ill",
          why: "Effective drainage; safe for infant; abrupt weaning drives engorgement + abscess" },
        { sev: "required", what: "**Needle aspiration** before surgical I&D when feasible",
          why: "Less morbid; preserves breastfeeding; effective for most lactational abscesses" },
        { sev: "trigger", what: "**Cover MRSA** if recurrent, severe, or community MRSA prevalent",
          why: "Increasing MRSA in lactational mastitis; TMP-SMX safe for infant > 2 mo",
          matchCtx: { mrsaRisk: true } },
        { sev: "trigger", what: "**Inflammatory breast cancer workup** if non-response by 1 week",
          why: "IBC mimics mastitis (peau d'orange, redness); biopsy if non-response — DO NOT delay" },
        { sev: "trigger", what: "**Smoking cessation** for non-lactational / sub-areolar disease",
          why: "Modifiable risk; reduces recurrence + need for surgical excision" },
        { sev: "trigger", what: "**TB / sarcoid / IGM workup** for granulomatous disease",
          why: "Different treatment paradigms — antibiotics alone fail in granulomatous mastitis" },
        { sev: "consider", what: "**Lactation consultant** referral for technique + comfort",
          why: "Improves drainage + continuation of breastfeeding; reduces recurrence" },
      ],
    },
  },

  /* ===========================================================
     ERYSIPELAS — superficial dermis + lymphatics; strep-dominant;
     PCN-class workhorse; prophylaxis for recurrent. ============ */
  erysipelas: {
    duration: {
      headline: "5 d penicillin for uncomplicated; longer for atypical or slow response; prophylaxis for recurrent.",
      evidence: "IDSA 2014 + PATCH trials — 5 d adequate for uncomplicated; PCN prophylaxis reduces recurrence in lymphedema",
      branches: [
        { label: "Uncomplicated, clinical response", days: "5 d",
          detail: "Penicillin V / amoxicillin / cefazolin; strep-dominant + rapid response typical",
          matchAgent: /penicillin|amoxicillin|cefazolin/i },
        { label: "Slow response / extensive / bullous", days: "7–10 d",
          detail: "Extend per trajectory; reassess for deeper infection or atypical organism" },
        { label: "Recurrent (≥ 2 episodes / yr) on prophylaxis", days: "5 d + chronic ppx",
          detail: "PCN V 250 mg BID or benzathine PCN q4wk per PATCH; treat tinea pedis as entry portal" },
        { label: "PCN allergy", days: "5 d",
          detail: "Cephalexin (no severe PCN allergy) or clindamycin or macrolide; doxycycline alternative",
          matchAgent: /clindamycin|azithromycin|cephalexin/i },
      ],
      stopWhen: [
        "Erythema borders receding (mark + monitor)",
        "Afebrile ≥ 24–48 h",
        "Pain decreasing",
        "Tolerating oral therapy",
        "Tinea pedis / entry portal addressed",
        "Minimum 5 d completed",
      ],
      extendIf: [
        { text: "**Slow response by 48–72 h** — reassess deeper infection",
          matchCtx: { severe: true } },
        "Lymphedema substrate — start chronic suppression",
        "Bullous / hemorrhagic disease — workup superinfection",
        "Bacteremia confirmed — per pathogen",
      ],
    },
    monitoring: {
      headline: "Mark borders; PCN-class workhorse; treat tinea as entry portal; PATCH prophylaxis for recurrent.",
      items: [
        { sev: "required", what: "**Mark erythema borders** + date — daily progression check",
          why: "Objective measure of response; spread despite antibiotic triggers re-workup" },
        { sev: "required", what: "**Elevation + compression** for lower-extremity disease",
          why: "Reduces edema + accelerates clearance; standard adjunct" },
        { sev: "required", what: "**Treat tinea pedis** as entry portal",
          why: "Interdigital fissures are common portal; topical antifungal prevents recurrence" },
        { sev: "trigger", what: "**PCN prophylaxis** (PATCH) for ≥ 2 episodes / yr",
          why: "PCN V 250 mg BID reduces recurrence by ~50% in lymphedema / venous stasis substrate" },
        { sev: "trigger", what: "**Reassess at 48–72 h** if no response",
          why: "Non-response triggers MRSA cover, imaging for deeper infection, or workup for atypical organism" },
        { sev: "trigger", what: "**Workup lymphedema** in recurrent disease",
          why: "Modifiable substrate; compression + skin care reduces recurrence" },
        { sev: "consider", what: "**Differentiate from cellulitis** — sharp raised border + St. Anthony's fire",
          why: "Distinguishes superficial vs. deep dermal; pure erysipelas more PCN-responsive" },
        { sev: "consider", what: "**Skin care education** — moisturize, avoid trauma",
          why: "Prevention of recurrence; addressable at every visit" },
      ],
    },
  },

  /* ===========================================================
     ACUTE LYMPHANGITIS — streptococcal proximal spread; PCN
     workhorse; short course; sporotrichoid for nodular. ======== */
  lymphangitis: {
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
  },

  /* ===========================================================
     HIDRADENITIS SUPPURATIVA (acute flare) — chronic immune-mediated;
     antibiotics adjunctive; biologics + surgical core. ========= */
  hidradenitis: {
    duration: {
      headline: "10–14 d antibiotics for acute flare; chronic suppression + adalimumab + surgery for definitive control.",
      evidence: "Dermatology consensus — combination antibiotics for moderate-severe; adalimumab approved for Hurley II/III; antibiotics adjunctive",
      branches: [
        { label: "Mild flare, single lesion", days: "10–14 d",
          detail: "Doxycycline 100 mg BID or clindamycin; topical clindamycin adjunct",
          matchAgent: /doxycycline/i },
        { label: "Moderate-severe (Hurley II/III)", days: "10–12 wk combination",
          detail: "Clindamycin + rifampin 10–12 wk; coordinate with derm; biologic candidate evaluation",
          matchAgent: /rifampin/i },
        { label: "Acute abscess (drained)", days: "7–10 d post-I&D",
          detail: "I&D + short course; consider deroofing for recurrent sites; surgical referral" },
        { label: "Refractory / Hurley III", days: "Per derm + surgery",
          detail: "Adalimumab + surgical excision (wide local or deroofing); chronic suppression" },
      ],
      stopWhen: [
        "Flare resolved (acute episode)",
        "Drainage / I&D wound healing",
        "Combination course completed (if moderate-severe)",
        "Chronic regimen / biologic plan in place",
        "Surgical plan documented if Hurley II/III",
      ],
      extendIf: [
        { text: "**Hurley II/III with sinus tracts / scarring** — combination + surgical referral",
          matchCtx: { severe: true } },
        "Recurrent disease — chronic suppression + biologic",
        "Secondary bacterial infection — extend per pathogen",
        "Pilonidal / perianal involvement — surgical excision",
      ],
    },
    monitoring: {
      headline: "Dermatology + biologic consult for moderate-severe; surgical for refractory; address smoking + obesity.",
      items: [
        { sev: "required", what: "**Dermatology referral** for moderate-severe disease",
          why: "Chronic immune-mediated; long-term management requires specialty care; biologic candidate evaluation" },
        { sev: "required", what: "**Hurley staging** at presentation — I (nodules) / II (sinus tracts) / III (interconnected)",
          why: "Drives treatment intensity + surgical decision" },
        { sev: "trigger", what: "**Combination clinda + rifampin × 10–12 wk** for moderate-severe",
          why: "Disease-modifying course; reduces lesion count + inflammation",
          matchAgent: /clindamycin|rifampin/i },
        { sev: "trigger", what: "**Adalimumab evaluation** for Hurley II/III",
          why: "FDA-approved; significant reduction in flare frequency + lesion count" },
        { sev: "trigger", what: "**Surgical excision / deroofing** for chronic sinus tracts",
          why: "Definitive for localized disease; complement to medical therapy" },
        { sev: "trigger", what: "**Smoking cessation + weight management**",
          why: "Strongest modifiable risk factors; smoking ↑ flare rate + severity" },
        { sev: "consider", what: "**Topical clindamycin + chlorhexidine wash** for chronic suppression",
          why: "Reduces colonization + flare frequency" },
        { sev: "consider", what: "**Hormonal + metabolic workup** — PCOS, insulin resistance",
          why: "Common comorbidities; addressable" },
      ],
    },
  },

  /* ===========================================================
     INFECTED VENOUS / ARTERIAL LEG ULCER — colonization vs
     infection distinction; address substrate disease. ========== */
  "infected-ulcer": {
    duration: {
      headline: "Antibiotics ONLY for cellulitis / bacteremia / osteo; compression + wound care drive cure.",
      evidence: "Wound society + IDSA — colonization is universal in chronic ulcers; antibiotics for invasive infection only",
      branches: [
        { label: "Colonization without cellulitis", days: "0 d",
          detail: "Antibiotics NOT indicated; topical wound care, compression (venous), revascularization (arterial)" },
        { label: "Surrounding cellulitis, no systemic signs", days: "7 d",
          detail: "Per cellulitis bands; cefazolin / cephalexin; vanco for MRSA risk",
          matchAgent: /cefazolin|cephalexin/i },
        { label: "Sepsis from ulcer source", days: "7–14 d",
          detail: "Broad — MRSA + GNR + anaerobes — narrow on cultures; ID consult" },
        { label: "Underlying osteomyelitis (probe-to-bone, MRI)", days: "Per osteo bands",
          detail: "Per chronic osteo bands; debridement + 4–6 wk pathogen-directed" },
        { label: "Diabetic foot ulcer (refer to diabetic-foot syndrome)", days: "Per diabetic-foot bands",
          detail: "Distinct algorithm — see diabetic-foot syndrome" },
      ],
      stopWhen: [
        "Cellulitis resolved + systemic signs cleared",
        "Wound bed clean + granulating",
        "Substrate addressed — compression (venous) or revascularization (arterial)",
        "Course completed for invasive infection (if any)",
        "No osteo or bacteremia on workup",
      ],
      extendIf: [
        { text: "**Osteomyelitis** confirmed — extend per osteo bands",
          matchCtx: { severe: true } },
        "Bacteremia confirmed — per source pathogen",
        "Inadequate vascular supply — revascularization + extend",
        "Recurrent infection — workup arterial / venous insufficiency",
      ],
    },
    monitoring: {
      headline: "Stewardship — colonization ≠ infection; compression + revascularization core; rule out osteo.",
      items: [
        { sev: "required", what: "**Stewardship** — surface swab growth alone is NOT an indication to treat",
          why: "Chronic ulcers universally colonized; antibiotics drive resistance without benefit absent invasive signs" },
        { sev: "required", what: "**Compression therapy** for venous ulcers — 30–40 mmHg",
          why: "Single highest-impact intervention; healing-rate driver" },
        { sev: "required", what: "**Vascular assessment + ABI** for arterial ulcers",
          why: "Arterial insufficiency requires revascularization; healing impossible without flow" },
        { sev: "trigger", what: "**Deep tissue / bone culture** if osteo suspected (probe-to-bone, exposed bone)",
          why: "Surface swab misleading; deep culture drives pathogen-directed therapy" },
        { sev: "trigger", what: "**MRI** if osteomyelitis suspected",
          why: "Gold standard for osteo diagnosis + planning surgical extent" },
        { sev: "trigger", what: "**Sharp debridement** for slough / necrotic tissue",
          why: "Removes biofilm + non-viable tissue; mechanical / surgical / enzymatic" },
        { sev: "trigger", what: "**Wound clinic referral** for chronic ulcers",
          why: "Specialized care drives healing; complex multi-modal management" },
        { sev: "consider", what: "**Nutrition + glycemic optimization**",
          why: "Wound healing is protein + glycemic-dependent; modifiable" },
      ],
    },
  },

  /* ===========================================================
     TSS — Streptococcal & Staphylococcal toxic shock. Source
     control + clindamycin + IVIG (GAS); supportive care; rapid
     escalation. ATS / IDSA + CDC case definitions. ============= */
  tss: {
    duration: {
      headline: "10–14 d after source controlled + shock resolved; clindamycin until toxin-producer excluded.",
      evidence: "IDSA 2014 + CDC — no fixed duration; source control + clindamycin + IVIG for confirmed GAS-TSS drive outcome",
      branches: [
        { label: "Streptococcal TSS (GAS) confirmed", days: "10–14 d",
          detail: "Penicillin + clindamycin + IVIG; source control critical (debridement, drainage, FB removal)",
          matchAgent: /penicillin/i },
        { label: "Staphylococcal TSS (menstrual or non-menstrual)", days: "10–14 d",
          detail: "Anti-staph + clindamycin; remove tampon / FB / packing; vancomycin until MSSA confirmed",
          matchAgent: /vancomycin|nafcillin|oxacillin|cefazolin/i },
        { label: "Severe (refractory shock, multi-organ failure)", days: "≥ 14 d + ICU",
          detail: "Combination + IVIG + aggressive source control; ECMO if needed; ID + CC consult" },
        { label: "Probable / culture-negative", days: "10–14 d empiric",
          detail: "Cover GAS + S. aureus + clinda; treat empirically pending culture data" },
      ],
      stopWhen: [
        "Source controlled — wound debrided, FB removed, drainage adequate",
        "Off vasopressors ≥ 48 h",
        "Afebrile + multi-organ dysfunction resolving",
        "Cultures negative or appropriately treated",
        "Minimum 10–14 d completed after source control",
      ],
      extendIf: [
        { text: "**Persistent source** — surgical or anatomic — extend until controlled",
          matchCtx: { severe: true } },
        "Bacteremia confirmed — per pathogen + source",
        "Necrotizing infection co-existing — per necfasc bands",
        "Multi-organ failure persisting — per ICU + ID",
      ],
    },
    monitoring: {
      headline: "Source control mandatory; clindamycin for toxin suppression; IVIG for confirmed GAS-TSS.",
      items: [
        { sev: "required", what: "**Source control** — surgical debridement, FB removal, drainage",
          why: "Antibiotics alone fail; mortality benefit anchored to source eradication" },
        { sev: "required", what: "**Clindamycin 900 mg IV q8h** until toxin-producer excluded",
          why: "Ribosomal block suppresses exotoxin production; cidal agent alone insufficient" },
        { sev: "required", what: "**Blood cultures × 2 + wound / source cultures**",
          why: "Identifies pathogen + drives narrowing; differentiates GAS vs S. aureus toxic shock" },
        { sev: "trigger", what: "**IVIG 1 g/kg day 1, 0.5 g/kg days 2–3** for confirmed streptococcal TSS",
          why: "Mortality benefit limited to GAS-TSS (observational + small RCTs); not for S. aureus TSS",
          matchBranch: ["Streptococcal TSS (GAS) confirmed"] },
        { sev: "trigger", what: "**Remove tampon / vaginal packing** for menstrual TSS",
          why: "Foreign body harbors toxin-producing organism; removal is source control" },
        { sev: "trigger", what: "**Aggressive fluid resuscitation + vasopressors**",
          why: "Distributive shock from superantigen-driven cytokine storm" },
        { sev: "trigger", what: "**Workup necrotizing fasciitis** if GAS + extremity involvement",
          why: "GAS-TSS + necrotizing infection common cluster; surgical exploration low threshold" },
        { sev: "consider", what: "**Hyperbaric oxygen** if clostridial component (rarely indicated)",
          why: "Evidence weak; reserve for clostridial myonecrosis; never delay surgery" },
      ],
    },
  },

  /* ===========================================================
     CLOSTRIDIAL MYONECROSIS (GAS GANGRENE) — surgical emergency;
     penicillin + clindamycin; HBO controversial; rapid course. = */
  "gas-gangrene": {
    duration: {
      headline: "10–14 d post-surgical clearance; penicillin + clindamycin; surgical debridement is the treatment.",
      evidence: "IDSA 2014 — surgery + penicillin + clindamycin; HBO adjunct controversial; rapid lethality without surgery",
      branches: [
        { label: "Clostridial myonecrosis confirmed", days: "10–14 d post-op",
          detail: "Penicillin G 4 MU IV q4h + clindamycin 900 mg IV q8h; aggressive serial debridement",
          matchAgent: /penicillin|clindamycin/i },
        { label: "Polymicrobial gas-forming infection", days: "10–14 d",
          detail: "Pip-tazo or carbapenem + clindamycin; cover anaerobes + GNR + GPC" },
        { label: "Post-surgical / traumatic with extensive necrosis", days: "Per surgical adequacy",
          detail: "Continue until debridement complete + clinical resolution; multi-stage surgery typical" },
        { label: "Immunocompromised / underlying malignancy", days: "≥ 14 d post-op",
          detail: "Extended course; consider ID consult; rule out C. septicum + GI source" },
      ],
      stopWhen: [
        "Surgical margins clean on serial debridement",
        "No gas on imaging / re-imaging",
        "Off vasopressors + clinical stability",
        "Wound closing / negative-pressure dressing working",
        "Minimum 10–14 d post final debridement completed",
      ],
      extendIf: [
        { text: "**Persistent surgical disease** — continue until margins clean",
          matchCtx: { severe: true } },
        "Bacteremia confirmed — per pathogen",
        "Underlying malignancy (C. septicum) — colonoscopy workup",
        "Inadequate source control — re-explore + re-debride",
      ],
    },
    monitoring: {
      headline: "Surgical debridement is the cure; penicillin + clindamycin; rule out malignancy if C. septicum.",
      items: [
        { sev: "required", what: "**Emergent surgical debridement** at presentation",
          why: "Mortality without surgery > 90%; antibiotics alone insufficient" },
        { sev: "required", what: "**Serial re-look surgery q12–24h** until margins clean",
          why: "Necrosis extends silently; surgical adequacy is the bedside metric" },
        { sev: "required", what: "**Imaging** — CT or plain film for gas in tissues",
          why: "Diagnostic confirmation; planning surgical extent" },
        { sev: "trigger", what: "**Colonoscopy** if Clostridium septicum identified",
          why: "C. septicum bacteremia / myonecrosis strongly associated with occult colon cancer" },
        { sev: "trigger", what: "**Anti-MRSA agent** if mixed flora suspected",
          why: "Polymicrobial cases include S. aureus; standard part of empiric in U.S.",
          matchCtx: { mrsaRisk: true } },
        { sev: "trigger", what: "**ICU level care** + vasopressor support",
          why: "Septic shock + multi-organ failure common; high-acuity substrate" },
        { sev: "trigger", what: "**Reconstructive surgery referral** after debridement complete",
          why: "Multi-stage closure planning; flap or graft typical" },
        { sev: "consider", what: "Hyperbaric oxygen where institutionally available + non-delaying",
          why: "Evidence weak / contested; NEVER delay surgery for HBO; adjunct only" },
      ],
    },
  },

  /* ===========================================================
     TETANUS — wound-acquired; immunoglobulin + spasm control +
     wound debridement; antibiotics for organism eradication. == */
  tetanus: {
    duration: {
      headline: "Metronidazole 7–10 d + tetanus IG + wound debridement + spasm control + ICU support.",
      evidence: "WHO + CDC — metronidazole preferred over penicillin (GABA antagonism risk); IG neutralizes circulating toxin only",
      branches: [
        { label: "Generalized tetanus (suspected or confirmed)", days: "7–10 d",
          detail: "Metronidazole 500 mg IV q6h; tetanus IG 3000–6000 units IM; wound debridement",
          matchAgent: /metronidazole/i },
        { label: "Neonatal tetanus", days: "10–14 d",
          detail: "Metronidazole + IG + ICU support; high mortality; resource setting drives prognosis" },
        { label: "Localized tetanus (limb)", days: "7–10 d",
          detail: "Same regimen; may progress to generalized; observe closely" },
        { label: "Cephalic tetanus (head wound, cranial nerve)", days: "7–10 d",
          detail: "Same regimen + airway management; cranial nerve VII involvement common" },
      ],
      stopWhen: [
        "Spasms resolved + neurologic recovery",
        "Tetanus IG administered",
        "Wound debrided + healing",
        "Active immunization series initiated (disease does NOT confer immunity)",
        "Minimum 7–10 d completed",
      ],
      extendIf: [
        { text: "**Persistent spasms** or autonomic instability — extend supportive care",
          matchCtx: { severe: true } },
        "Inadequate wound debridement — re-explore",
        "Co-infection — per pathogen + source",
        "ICU course prolonged — extend per response",
      ],
    },
    monitoring: {
      headline: "IG neutralizes circulating toxin; metronidazole eradicates organism; ICU for spasm + autonomic control.",
      items: [
        { sev: "required", what: "**Tetanus IG 3000–6000 units IM** at presentation",
          why: "Neutralizes circulating toxin; does NOT affect bound toxin; give early" },
        { sev: "required", what: "**Wound debridement** — remove devitalized tissue + FB",
          why: "Eradicates organism + spores; source control alongside antibiotics" },
        { sev: "required", what: "**ICU admission** + benzodiazepine for spasm control",
          why: "Autonomic instability + respiratory failure common; airway often needed" },
        { sev: "required", what: "**Active immunization series** (disease does NOT confer immunity)",
          why: "Tdap or Td series at presentation + 4 wk + 6 mo; lifelong protection requires vaccination" },
        { sev: "trigger", what: "**Magnesium infusion** for autonomic instability",
          why: "Adjunct for sympathetic storm; titrate to clinical effect" },
        { sev: "trigger", what: "**Airway / mechanical ventilation** for laryngospasm or respiratory failure",
          why: "Spasms can cause sudden airway obstruction; early intubation safer" },
        { sev: "trigger", what: "**Avoid penicillin** if benzo-resistant spasms (GABA antagonism)",
          why: "Metronidazole preferred; penicillin may worsen spasms in severe cases" },
        { sev: "consider", what: "**Quiet, dark room** to reduce trigger-evoked spasms",
          why: "Stimulus reduction reduces spasm frequency; supportive measure" },
      ],
    },
  },

  /* ===========================================================
     BOTULISM — neurotoxin-mediated; antitoxin + supportive care;
     antibiotics for wound only (avoid AGs — neuromuscular block). */
  botulism: {
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
  },

  /* ===========================================================
     ENTERIC FEVER (typhoid / paratyphoid) — Salmonella Typhi /
     Paratyphi; ceftriaxone or azithro; resistance rising. ===== */
  "enteric-fever": {
    duration: {
      headline: "10–14 d for most; longer if complicated (perforation, bacteremia); MDR + XDR strains drive choice.",
      evidence: "IDSA + WHO — ceftriaxone or azithromycin first-line; FQ resistance common in S. Asia; XDR Pakistan / India outbreaks",
      branches: [
        { label: "Uncomplicated, susceptible strain", days: "10–14 d",
          detail: "Ceftriaxone 2 g IV q24h or azithromycin 1 g PO daily; PO step-down on response",
          matchAgent: /ceftriaxone|azithromycin/i },
        { label: "Severe (sepsis / typhoid encephalopathy)", days: "10–14 d + dexamethasone",
          detail: "Ceftriaxone + dexamethasone (Hoffman regimen — reduces mortality in severe disease)" },
        { label: "MDR / XDR strain (Pakistan, India)", days: "10–14 d",
          detail: "Carbapenem (meropenem) + azithro; per local sensitivity; coordinate with travel medicine",
          matchAgent: /meropenem/i },
        { label: "Complicated (perforation, GI bleed)", days: "14–21 d + surgery",
          detail: "Surgical + broad-spectrum + ICU; per intra-abdominal bands" },
        { label: "Chronic carrier (gallbladder colonization)", days: "4–6 wk + cholecystectomy",
          detail: "Cipro or amox-clav × 4–6 wk; cholecystectomy for stones + persistent carrier" },
      ],
      stopWhen: [
        "Afebrile ≥ 5 d",
        "Clinical recovery + tolerating oral",
        "Stool / blood cultures cleared",
        "Public health reporting completed",
        "Minimum 10–14 d completed",
      ],
      extendIf: [
        { text: "**Complicated** — perforation, GI bleed, severe sepsis",
          matchCtx: { severe: true } },
        "MDR / XDR strain — extend per pathogen + ID",
        "Relapse (5–10% incidence) — second 14 d course",
        "Chronic carrier — cholecystectomy + extended antibiotics",
      ],
    },
    monitoring: {
      headline: "Travel history; ceftriaxone or azithro empiric; report; serial cultures; cholecystectomy for carriers.",
      items: [
        { sev: "required", what: "**Travel history** — South Asia, sub-Saharan Africa, Latin America",
          why: "Enteric fever almost exclusively imported in U.S.; drives diagnostic + empiric choice" },
        { sev: "required", what: "**Blood + stool cultures** before antibiotics",
          why: "Pathogen identification + sensitivity drives therapy; serial cultures track clearance" },
        { sev: "required", what: "**Public health reporting** — notifiable disease",
          why: "Outbreak investigation + contact tracing + carrier identification" },
        { sev: "trigger", what: "**Dexamethasone (Hoffman regimen)** for severe disease",
          why: "Mortality benefit in typhoid encephalopathy / shock; 3 mg/kg load then 1 mg/kg q6h × 8 doses" },
        { sev: "trigger", what: "**Surgical consult** if perforation suspected (acute abdomen)",
          why: "Perforation week 3–4 of illness; surgical emergency + broad-spectrum coverage" },
        { sev: "trigger", what: "**Avoid FQs empirically** in S. Asia exposure",
          why: "FQ resistance > 90% in Pakistan / India; ceftriaxone or azithro first-line" },
        { sev: "trigger", what: "**Workup chronic carrier** at 12 mo if stool / urine positive",
          why: "1–4% become chronic carriers; gallbladder colonization drives outbreaks" },
        { sev: "consider", what: "**Vaccination counseling** for future travel",
          why: "Ty21a oral or ViCPS injectable; recommended for endemic-area travel" },
      ],
    },
  },

  /* ===========================================================
     SEVERE BACTERIAL GASTROENTERITIS — Shigella, Campy, Salmonella,
     Yersinia, EHEC. Most don't need antibiotics; severe + invasive
     do; avoid AB in EHEC (HUS risk). =========================== */
  "severe-gastroenteritis": {
    duration: {
      headline: "Most don't need antibiotics; treat severe / invasive / immunocompromised; AVOID in EHEC (HUS risk).",
      evidence: "IDSA 2017 — selective antibiotic use; benefit modest; EHEC contraindicated; resistance + carriage prolongation",
      branches: [
        { label: "Mild-moderate, immunocompetent", days: "0 d antibiotics",
          detail: "Hydration + supportive care; self-limited; antibiotics rarely change course" },
        { label: "Shigella (invasive, dysentery)", days: "3 d",
          detail: "Azithromycin or ceftriaxone or cipro per sensitivity; treat all symptomatic Shigella",
          matchAgent: /azithromycin/i },
        { label: "Campylobacter (severe / immunocompromised)", days: "3–5 d",
          detail: "Azithromycin first-line; FQ resistance ↑ globally" },
        { label: "Non-typhoidal Salmonella (severe / immunocompromised)", days: "7–14 d",
          detail: "Ceftriaxone or cipro per sensitivity; longer in HIV / immunocompromised",
          matchAgent: /ceftriaxone/i },
        { label: "EHEC / STEC (suspected or confirmed)", days: "0 d antibiotics",
          detail: "Antibiotics CONTRAINDICATED — increase HUS risk via toxin release; supportive only" },
        { label: "Cholera (Vibrio cholerae)", days: "Single dose doxy",
          detail: "Doxycycline 300 mg PO × 1 or azithro 1 g × 1; aggressive ORS / IV hydration",
          matchAgent: /doxycycline/i },
      ],
      stopWhen: [
        "Diarrhea resolving",
        "Hydration restored",
        "Afebrile",
        "Stool cultures cleared (if invasive)",
        "Course completed (if treated)",
      ],
      extendIf: [
        { text: "**Bacteremia** confirmed — per pathogen",
          matchCtx: { severe: true } },
        "Immunocompromised / HIV — extended Salmonella course",
        "Endovascular focus (Salmonella + aorta) — per mycotic aneurysm bands",
        "Inadequate hydration — IV + electrolyte correction",
      ],
    },
    monitoring: {
      headline: "Selective antibiotic use; EHEC contraindicated; hydration is the core; report outbreaks.",
      items: [
        { sev: "required", what: "**Avoid antibiotics in EHEC / STEC** — HUS risk",
          why: "Antibiotic-induced toxin release; HUS in 10–15% of pediatric STEC + antibiotic exposure" },
        { sev: "required", what: "**Stool culture + Shiga toxin / EHEC PCR** if bloody diarrhea",
          why: "EHEC must be excluded before any antibiotic decision in bloody diarrhea" },
        { sev: "required", what: "**Hydration** — oral or IV — is the core treatment",
          why: "Most morbidity is volume / electrolyte; antibiotics secondary" },
        { sev: "trigger", what: "**Treat all symptomatic Shigella**",
          why: "Reduces transmission + symptom duration; community-acquired resistance rising" },
        { sev: "trigger", what: "**Extended Salmonella course in HIV / immunocompromised**",
          why: "Recurrence + bacteremia risk; 14 d standard, longer per response" },
        { sev: "trigger", what: "**Mycotic aneurysm workup** for non-typhoidal Salmonella + age > 50",
          why: "Endovascular seeding; CT aorta if persistent bacteremia or risk substrate" },
        { sev: "trigger", what: "**Public health reporting** — Salmonella, Shigella, Vibrio, EHEC",
          why: "Notifiable; outbreak investigation + source identification" },
        { sev: "consider", what: "**Avoid antimotility agents** in invasive disease",
          why: "Prolongs toxin exposure + bacterial contact; supportive in non-invasive only" },
      ],
    },
  },

  /* ===========================================================
     TYPHLITIS / NEUTROPENIC ENTEROCOLITIS — emergent in ANC < 500;
     broad-spectrum + supportive; surgery for perforation. ===== */
  typhlitis: {
    duration: {
      headline: "Until ANC recovers + clinical resolution; broad anti-pseudomonal + anaerobic; surgery for perforation.",
      evidence: "IDSA + oncology consensus — typhlitis in ANC < 500 high-mortality; broad-spectrum + bowel rest + surgery for failure",
      branches: [
        { label: "Typhlitis without perforation, responding", days: "Until ANC recovers",
          detail: "Pip-tazo or meropenem + bowel rest + supportive; reassess at ANC recovery",
          matchAgent: /piperacillin|meropenem/i },
        { label: "Persistent fever > 5 d on broad", days: "Add antifungal",
          detail: "Add empiric mold-active (echinocandin or vori or ampho); CT chest + abdomen" },
        { label: "Perforation / surgical emergency", days: "10–14 d + surgery",
          detail: "Emergent laparotomy + ICU; mortality high; ID + surgical oncology" },
        { label: "C. difficile co-infection (common)", days: "Per CDI bands",
          detail: "Oral vancomycin or fidaxomicin in addition to IV broad-spectrum typhlitis cover" },
        { label: "CMV reactivation (post-transplant)", days: "Per CMV bands",
          detail: "Ganciclovir or foscarnet; coordinate with transplant ID" },
      ],
      stopWhen: [
        "ANC > 500 + sustained for ≥ 48 h",
        "Afebrile + clinical recovery",
        "Bowel function returning + tolerating diet",
        "Imaging shows resolution",
        "Minimum 10–14 d completed (if perforation / surgery)",
      ],
      extendIf: [
        { text: "**Persistent neutropenia** — extend per recovery + clinical resolution",
          matchCtx: { severe: true } },
        "Perforation or abscess — surgical + extended",
        "Invasive fungal infection — per IFI bands",
        "GVHD or rejection — coordinate with transplant team",
      ],
    },
    monitoring: {
      headline: "CT abdomen at presentation; bowel rest; surgery for perforation; empiric antifungal for persistent fever.",
      items: [
        { sev: "required", what: "**CT abdomen / pelvis at presentation**",
          why: "Defines cecal / colonic wall thickening; identifies perforation + abscess + free air" },
        { sev: "required", what: "**Bowel rest + NG decompression** for severe disease",
          why: "Reduces bacterial translocation + intraluminal pressure; supportive core" },
        { sev: "required", what: "**Surgical consult** at presentation if severe / perforated",
          why: "Mortality high without surgery in perforation; serial reassessment if non-operative" },
        { sev: "required", what: "**Broad-spectrum coverage** — anti-pseudomonal + anaerobic + GPC",
          why: "Polymicrobial translocation; pip-tazo or meropenem + vancomycin per MRSA risk" },
        { sev: "trigger", what: "**C. difficile testing** at presentation",
          why: "Co-infection common; changes therapy + isolation" },
        { sev: "trigger", what: "**Empiric antifungal** if persistent fever > 5 d on broad",
          why: "Mold-active for invasive fungal infection in prolonged neutropenia",
          matchAgent: /caspofungin|micafungin|voriconazole|amphotericin/i },
        { sev: "trigger", what: "**G-CSF for ANC recovery acceleration**",
          why: "Reduces neutropenia duration; coordinate with oncology" },
        { sev: "trigger", what: "**Avoid colonoscopy / sigmoidoscopy in severe disease**",
          why: "Perforation risk in inflamed cecal wall; defer until ANC recovery" },
        { sev: "consider", what: "**ICU level care** for septic shock + multi-organ failure",
          why: "High-acuity substrate; pressor support + ventilation common" },
      ],
    },
  },

  /* ===========================================================
     NOCARDIOSIS — gram-positive filamentous; cell-mediated immune
     deficits; TMP-SMX backbone; CNS workup mandatory; long course. */
  nocardia: {
    duration: {
      headline: "6–12 mo + CNS workup mandatory; TMP-SMX backbone; combination IV for severe / disseminated.",
      evidence: "IDSA + ATS — TMP-SMX or sulfadiazine first-line; species-driven sensitivity; CNS involvement extends to 12 mo",
      branches: [
        { label: "Pulmonary, immunocompetent", days: "6 mo",
          detail: "TMP-SMX 5–10 mg/kg TMP component PO; PO step-down after initial IV if severe",
          matchAgent: /trimethoprim-?sulfamethoxazole|sulfadiazine/i },
        { label: "Disseminated / immunocompromised", days: "12 mo",
          detail: "TMP-SMX + imipenem or amikacin × 6 wk IV then PO; ID-driven combination",
          matchAgent: /imipenem|amikacin/i },
        { label: "CNS involvement (brain abscess)", days: "12 mo",
          detail: "TMP-SMX + imipenem + ceftriaxone or linezolid; neurosurgical drainage if large",
          matchAgent: /linezolid|meropenem/i },
        { label: "Cutaneous primary, immunocompetent", days: "3 mo",
          detail: "TMP-SMX or minocycline; rule out dissemination + CNS imaging at presentation" },
        { label: "Severe sulfa allergy", days: "6–12 mo",
          detail: "Linezolid or imipenem-based per sensitivity; species ID critical; ID-driven" },
      ],
      stopWhen: [
        "Clinical + imaging resolution",
        "CNS workup completed + cleared",
        "Pathogen-specific minimum duration met (6 mo / 12 mo)",
        "Immunosuppression unchanged or improved",
        "No recurrence over follow-up period",
      ],
      extendIf: [
        { text: "**CNS involvement** — extend to 12 mo + surgical drainage if large",
          matchCtx: { severe: true } },
        "Persistent immunosuppression — extend per host status",
        "Drug toxicity (TMP-SMX) — switch agent + extend per response",
        "Recurrence after stop — re-induction + indefinite suppression in some hosts",
      ],
    },
    monitoring: {
      headline: "TMP-SMX backbone; brain imaging mandatory; species ID + sensitivity; CBC + LFT + Cr on TMP-SMX.",
      items: [
        { sev: "required", what: "**Brain MRI** at presentation regardless of symptoms",
          why: "CNS involvement ~30% in disseminated; changes duration + escalates monitoring" },
        { sev: "required", what: "**Species identification + sensitivity** (16S, MALDI-TOF)",
          why: "Sensitivity drives therapy — N. farcinica intrinsic resistance to multiple agents; species-specific patterns critical" },
        { sev: "required", what: "**ID consult** at presentation",
          why: "Long course + drug interactions + immunosuppression management requires specialist input" },
        { sev: "trigger", what: "**Combination IV induction × 6 wk** for severe / disseminated",
          why: "TMP-SMX + carbapenem or amikacin; transition to PO when stable",
          matchAgent: /imipenem|amikacin|meropenem/i },
        { sev: "trigger", what: "**CBC + LFT + Cr weekly** on TMP-SMX",
          why: "Bone marrow suppression + hyperkalemia + AKI common at high doses" },
        { sev: "trigger", what: "**Reduce immunosuppression** if feasible per primary team",
          why: "Cell-mediated immunity defect drives disease; modifiable substrate in many" },
        { sev: "trigger", what: "**Linezolid alternative** for sulfa allergy or refractory",
          why: "Excellent CNS penetration; MAO-inhibitor + cytopenias on extended use",
          matchAgent: /linezolid/i },
        { sev: "consider", what: "**Workup HIV + cell-mediated immunity defect**",
          why: "Nocardiosis is a marker for cellular immune compromise" },
      ],
    },
  },

  /* ===========================================================
     LISTERIOSIS — Listeria monocytogenes; ampicillin + gentamicin
     synergy; pregnancy / neonate / elderly / immunocompromised. = */
  listeria: {
    duration: {
      headline: "Ampicillin + gentamicin × 21 d (bacteremia) or 21+ d (CNS / endocarditis); TMP-SMX if PCN-allergic.",
      evidence: "IDSA + society consensus — ampicillin synergy with gentamicin; cephalosporins INACTIVE; pregnant + neonate + elderly + immunocompromised",
      branches: [
        { label: "Bacteremia, immunocompetent", days: "14–21 d",
          detail: "Ampicillin 2 g IV q4h × 14–21 d ± gentamicin first 7 d for synergy",
          matchAgent: /ampicillin/i },
        { label: "Meningitis / rhombencephalitis", days: "21+ d",
          detail: "Ampicillin + gentamicin × 21–28 d; longer in rhombencephalitis / brain abscess",
          matchAgent: /gentamicin/i },
        { label: "Endocarditis", days: "4–6 wk",
          detail: "Ampicillin + gentamicin × 4–6 wk; surgical valve replacement common" },
        { label: "Pregnancy (with or without fetal compromise)", days: "14 d",
          detail: "Ampicillin 2 g IV q4h × 14 d; gentamicin avoided if non-bacteremic; neonate workup post-delivery" },
        { label: "PCN allergy (severe)", days: "Per syndrome",
          detail: "TMP-SMX (only alternative with evidence); meropenem alternative; ID-driven",
          matchAgent: /trimethoprim-?sulfamethoxazole|meropenem/i },
      ],
      stopWhen: [
        "Blood cultures cleared",
        "Afebrile + clinical resolution",
        "CSF normalized (if meningitis)",
        "Echo workup completed (if bacteremia)",
        "Pathogen-specific minimum duration met",
      ],
      extendIf: [
        { text: "**Rhombencephalitis / brain abscess** — extend per imaging",
          matchCtx: { severe: true } },
        "Endocarditis confirmed — 4–6 wk + surgery",
        "Immunocompromised — extend per ID + host status",
        "Persistent bacteremia — re-workup + extend",
      ],
    },
    monitoring: {
      headline: "Ampicillin first-line — cephalosporins INACTIVE; LP if any neuro sign; food safety counseling.",
      items: [
        { sev: "required", what: "**Cephalosporins INACTIVE** — replace empiric ceftriaxone with ampicillin",
          why: "Intrinsic cephalosporin resistance; standard ceftriaxone empiric meningitis regimen misses Listeria" },
        { sev: "required", what: "**LP at any neuro sign** — meningitis, headache, altered mental status, ataxia",
          why: "Rhombencephalitis presents with cranial nerve / cerebellar signs; CSF + MRI needed" },
        { sev: "required", what: "**Blood cultures × 2** at presentation",
          why: "Bacteremia common; drives duration + workup" },
        { sev: "trigger", what: "**Add gentamicin for synergy first 7 d** in serious disease",
          why: "Animal + observational data support synergy; balance with nephrotoxicity",
          matchAgent: /gentamicin/i },
        { sev: "trigger", what: "**Public health reporting** — notifiable disease",
          why: "Outbreak investigation + source tracing — deli meats, soft cheese, melons" },
        { sev: "trigger", what: "**Food safety counseling** — pregnant / immunocompromised hosts",
          why: "Avoid deli meats, unpasteurized dairy, soft cheese, melon; reduces recurrence + transmission" },
        { sev: "trigger", what: "**Fetal monitoring + neonate workup** in pregnancy",
          why: "Vertical transmission — neonatal listeriosis high mortality; OB + NICU coordination" },
        { sev: "consider", what: "**Echo for bacteremia** to rule out endocarditis",
          why: "Endocarditis incidence ~7% in listerial bacteremia; drives 4–6 wk + surgery" },
      ],
    },
  },

  /* ===========================================================
     CAPNOCYTOPHAGA INFECTION — dog bite + asplenic / alcoholic;
     fulminant sepsis; ceftriaxone or pip-tazo; high mortality. = */
  capno: {
    duration: {
      headline: "14 d for bacteremia; longer for IE / meningitis; aggressive resuscitation in asplenic + alcoholic hosts.",
      evidence: "Society consensus — Capnocytophaga canimorsus after dog bite causes fulminant sepsis in asplenic / cirrhotic; PCN or ceftriaxone first-line",
      branches: [
        { label: "Bacteremia, immunocompetent", days: "14 d",
          detail: "Penicillin G or ampicillin or ceftriaxone; treat per sensitivity",
          matchAgent: /penicillin|ceftriaxone/i },
        { label: "Severe sepsis (asplenic / cirrhotic / immunocompromised)", days: "14–21 d",
          detail: "Pip-tazo or carbapenem broad initially + ICU; high mortality without rapid escalation",
          matchAgent: /piperacillin|meropenem/i },
        { label: "Endocarditis", days: "4–6 wk",
          detail: "Per IE bands; ceftriaxone or amp-sulbactam; valve surgery for vegetation / failure" },
        { label: "Meningitis (rare)", days: "21 d",
          detail: "Ceftriaxone + dexamethasone per meningitis bands" },
        { label: "Local wound infection only", days: "7–10 d",
          detail: "Amox-clav PO; per bite wound bands; ID consult if asplenic" },
      ],
      stopWhen: [
        "Blood cultures cleared",
        "Afebrile + off vasopressors",
        "DIC / purpura fulminans resolved",
        "Source addressed — wound, asplenic status, alcoholic state",
        "Pathogen-specific minimum duration met",
      ],
      extendIf: [
        { text: "**Asplenic / cirrhotic substrate** — extend per host + clinical course",
          matchCtx: { severe: true } },
        "Endocarditis — per IE bands",
        "Purpura fulminans / DIC — supportive + extended",
        "Inadequate source control — wound debridement",
      ],
    },
    monitoring: {
      headline: "Asplenic + dog bite triggers high-risk admission; aggressive resuscitation; pneumovax for asplenic.",
      items: [
        { sev: "required", what: "**Aggressive resuscitation** for septic shock in asplenic host",
          why: "Mortality > 30% in asplenic Capnocytophaga sepsis; rapid escalation life-saving" },
        { sev: "required", what: "**Dog bite history** — single largest risk factor",
          why: "~75% of Capnocytophaga sepsis cases have dog exposure; asks about lick / bite / scratch" },
        { sev: "required", what: "**Blood cultures × 2** at presentation",
          why: "Slow-growing organism — hold cultures 7+ d; alert lab to extend incubation" },
        { sev: "trigger", what: "**ICU admission** + vasopressor support for septic shock",
          why: "Fulminant course in high-risk hosts; line + pressor support common" },
        { sev: "trigger", what: "**Purpura fulminans / DIC monitoring**",
          why: "DIC + symmetric peripheral gangrene common; coag panel + supportive measures" },
        { sev: "trigger", what: "**Pneumococcal + meningococcal + Hib vaccination review** for asplenic",
          why: "Standard asplenia prophylaxis reduces future fulminant episodes" },
        { sev: "trigger", what: "**Standby amoxicillin** prescription for asplenic with dog bite",
          why: "Early self-treatment of febrile bite reduces sepsis incidence" },
        { sev: "consider", what: "**Workup HIV + chronic alcoholic / hepatic disease**",
          why: "Common substrate; addressable comorbidities" },
      ],
    },
  },

  /* ===========================================================
     SOT INFECTION — solid-organ transplant; time-from-tx + organ-
     specific patterns; drug interactions + reduce IS. ========== */
  "sot-infection": {
    duration: {
      headline: "Per pathogen + time-from-tx; coordinate with transplant ID; drug interactions + reduce IS.",
      evidence: "AST 2019 + IDSA — early (< 1 mo) bacterial / nosocomial; intermediate (1–6 mo) opportunistic; late (> 6 mo) community + community-acquired",
      branches: [
        { label: "Early (< 1 mo) — nosocomial + surgical site", days: "Per pathogen + source",
          detail: "Bacterial / MDR — cover per local antibiogram; per syndrome bands (UTI, pneumonia, SSI)" },
        { label: "Intermediate (1–6 mo) — opportunistic", days: "Per pathogen",
          detail: "CMV, PJP, fungal, BK virus — per pathogen-specific bands; coordinate with transplant ID" },
        { label: "Late (> 6 mo) — community + community-acquired", days: "Per syndrome bands",
          detail: "Per community-acquired pneumonia / UTI / SSTI bands; CMV reactivation if reduced IS" },
        { label: "Rejection episode + infection co-existing", days: "Per pathogen + IS",
          detail: "Coordinate transplant team + ID; balance treatment + IS reduction; adjust IS regimen during recovery" },
        { label: "Severe sepsis (any time point)", days: "Per pathogen + source",
          detail: "Broad empiric coverage; aggressive resuscitation; ICU + ID",
          matchAgent: /piperacillin|meropenem|cefepime/i },
      ],
      stopWhen: [
        "Pathogen identified + pathogen-specific duration met",
        "Cultures cleared",
        "Afebrile + clinical recovery",
        "Drug levels + interactions managed",
        "IS regimen stabilized",
      ],
      extendIf: [
        { text: "**Immunocompromised / high IS burden** — extend per ID + host status",
          matchCtx: { severe: true } },
        "Invasive fungal — per IFI bands (weeks to months)",
        "Rejection — coordinate with transplant team",
        "Drug interaction limits options — extend per ID",
      ],
    },
    monitoring: {
      headline: "Transplant ID + transplant team consult; drug interactions + IS reduction critical.",
      items: [
        { sev: "required", what: "**Transplant ID + transplant team consult** at presentation",
          why: "Drug interactions + IS management + organ-specific patterns require specialist input" },
        { sev: "required", what: "**Drug interaction screen** — tacrolimus, sirolimus, cyclosporine levels",
          why: "FQ ↑ tacrolimus; rifampin ↓; azoles ↑; many critical interactions" },
        { sev: "required", what: "**Time-from-tx + organ-specific pathogens**",
          why: "Drives differential diagnosis + empiric choice; early bacterial vs intermediate opportunistic vs late community" },
        { sev: "trigger", what: "**Reduce IS if feasible** per transplant team",
          why: "Single highest-impact intervention in transplant infection outcome" },
        { sev: "trigger", what: "**Workup CMV + EBV + BK virus** in intermediate-period fever",
          why: "Reactivation common; specific therapies — ganciclovir, rituximab, IS reduction" },
        { sev: "trigger", what: "**Prophylaxis adherence + breakthrough** review",
          why: "PJP, CMV, fungal prophylaxis often discontinued / missed; breakthrough common" },
        { sev: "trigger", what: "**Organ-specific imaging** — chest CT, abdominal US, allograft US",
          why: "Allograft pathology often presents subtly; imaging earlier than non-transplant" },
        { sev: "consider", what: "**Vaccination review** — live vaccines contraindicated post-tx",
          why: "Inactivated vaccines safe; live vaccines avoided; family + household vaccinations important" },
      ],
    },
  },

  /* ===========================================================
     ASPLENIA: ACUTE FEBRILE ILLNESS — OPSI risk; ceftriaxone +
     vancomycin empiric; standby antibiotic + prophylaxis. ===== */
  "asplenia-prophylaxis": {
    duration: {
      headline: "Ceftriaxone + vancomycin empiric; per pathogen + source; OPSI prophylaxis + vaccination review.",
      evidence: "IDSA + ASH — encapsulated organism risk; OPSI mortality > 50%; lifelong vaccination + standby antibiotic strategy",
      branches: [
        { label: "Acute febrile illness, no clear source", days: "Empiric per culture",
          detail: "Ceftriaxone 2 g IV q24h + vancomycin per institutional MRSA risk; broaden if shock; narrow on culture data",
          matchAgent: /ceftriaxone|vancomycin/i },
        { label: "OPSI / fulminant sepsis", days: "10–14 d per pathogen",
          detail: "Broad empiric — pip-tazo or carbapenem + vancomycin + ICU; per pathogen after cultures",
          matchAgent: /piperacillin|meropenem/i },
        { label: "Pneumococcal bacteremia / pneumonia", days: "10–14 d",
          detail: "Ceftriaxone or PCN per sensitivity; per CAP / bacteremia bands" },
        { label: "Capnocytophaga (dog bite exposure)", days: "Per capno bands",
          detail: "Per Capnocytophaga syndrome bands" },
        { label: "Babesiosis (tick exposure)", days: "Per parasitemia",
          detail: "Atovaquone + azithromycin or clinda + quinine; exchange transfusion if > 10% parasitemia" },
      ],
      stopWhen: [
        "Pathogen identified + treated per source",
        "Afebrile + clinical recovery",
        "Standby antibiotic prescription written",
        "Vaccination status reviewed + updated",
        "Discharge education on OPSI risk completed",
      ],
      extendIf: [
        { text: "**OPSI / fulminant course** — extended ICU + per pathogen",
          matchCtx: { severe: true } },
        "Endocarditis — per IE bands",
        "Meningitis — per meningitis bands",
        "Babesiosis — extended per parasitemia clearance",
      ],
    },
    monitoring: {
      headline: "ER fever = OPSI until proven otherwise; vaccinate + standby antibiotic; medical alert ID.",
      items: [
        { sev: "required", what: "**ER fever workup as OPSI** until proven otherwise",
          why: "OPSI mortality > 50% if delayed; treat first, investigate after; aggressive resuscitation" },
        { sev: "required", what: "**Pneumococcal vaccination** — PCV20 or PCV15 + PPSV23 series",
          why: "Encapsulated organism is the modal OPSI pathogen; up-to-date schedule mandatory" },
        { sev: "required", what: "**Meningococcal + Hib vaccination** — per CDC asplenia schedule",
          why: "Other encapsulated organisms; ACWY + B + Hib protect against second-tier OPSI pathogens" },
        { sev: "required", what: "**Standby antibiotic prescription** — amoxicillin or amox-clav",
          why: "Self-treatment of any febrile illness; immediate dose + ER visit reduces mortality" },
        { sev: "trigger", what: "**Daily prophylaxis** in children + first 2 yr post-splenectomy + immunocompromised",
          why: "Penicillin V or amoxicillin BID; ASH 2014 recommends in high-risk subgroups" },
        { sev: "trigger", what: "**Travel medicine + malaria + babesiosis counseling**",
          why: "Encapsulated organism + protozoal risks elevated; pre-travel ID consult" },
        { sev: "trigger", what: "**Medical alert bracelet + wallet card**",
          why: "Alerts ER staff to OPSI risk + accelerates empiric coverage" },
        { sev: "consider", what: "**Annual flu + COVID + RSV vaccines**",
          why: "Influenza drives bacterial superinfection in asplenic; routine adult immunization" },
      ],
    },
  },

  /* ===========================================================
     INFECTION ON BIOLOGIC / TARGETED IMMUNOTHERAPY — TNFi, JAKi,
     anti-CD20, anti-IL-6, checkpoint inhibitors; specific pathogen
     patterns by mechanism. ==================================== */
  "biologic-infection": {
    duration: {
      headline: "Per pathogen + agent mechanism; hold biologic during active infection; coordinate with prescriber.",
      evidence: "Rheum + onc consensus — TNFi → granulomatous (TB, histo, coccidio); anti-CD20 → encapsulated + viral; checkpoint → ICI colitis mimics CDI",
      branches: [
        { label: "TNF-α inhibitor + granulomatous infection (TB, histo, coccidio)", days: "Per pathogen",
          detail: "Per TB / endemic mycosis bands; hold TNFi until controlled; ID + rheum coordination" },
        { label: "Anti-CD20 + bacterial / encapsulated infection", days: "Per pathogen + source",
          detail: "IVIG if hypogammaglobulinemia + recurrent; per infection bands" },
        { label: "JAK inhibitor + viral reactivation (HSV, VZV, HBV)", days: "Per pathogen",
          detail: "Antiviral per pathogen; HBV reactivation requires hold + suppressive antivirals" },
        { label: "Checkpoint inhibitor + ICI colitis (NOT CDI alone)", days: "Steroids ± infliximab",
          detail: "Distinguish from infection; steroid + immunomodulator if severe; per ICI toxicity bands" },
        { label: "Severe sepsis on any biologic", days: "Per pathogen + source",
          detail: "Broad empiric + hold biologic + ICU; coordinate with primary team",
          matchAgent: /piperacillin|meropenem|cefepime/i },
      ],
      stopWhen: [
        "Pathogen identified + treated per source",
        "Afebrile + clinical recovery",
        "Biologic resumption decision documented with prescriber",
        "Latent infection workup completed (TB, HBV) if not done",
        "Pathogen-specific minimum duration met",
      ],
      extendIf: [
        { text: "**Severe / disseminated** opportunistic infection — extend per ID",
          matchCtx: { severe: true } },
        "Latent TB / hepatitis B reactivation — extended antiviral / TB therapy",
        "Persistent immunosuppression — extend per host status",
        "Drug interactions limit options — extend per ID",
      ],
    },
    monitoring: {
      headline: "Hold biologic during infection; agent-mechanism drives differential; rheum / onc coordination.",
      items: [
        { sev: "required", what: "**Hold biologic** during active infection",
          why: "Continued biologic during infection delays recovery + increases dissemination risk" },
        { sev: "required", what: "**Document agent + mechanism** — TNFi vs anti-CD20 vs JAKi vs ICI",
          why: "Mechanism drives differential — granulomatous vs encapsulated vs viral vs ICI toxicity" },
        { sev: "required", what: "**Coordinate with prescriber** (rheum, onc, GI)",
          why: "Resumption decision requires balance of disease activity + infection resolution" },
        { sev: "trigger", what: "**Latent TB workup** before TNFi (IGRA + CXR)",
          why: "TNFi reactivates latent TB — standard pre-treatment screen; treat latent before starting" },
        { sev: "trigger", what: "**HBV screen + suppression** on rituximab or JAKi or anti-CD20",
          why: "Reactivation high mortality; HBsAg + anti-HBc screen; entecavir / TDF prophylaxis if positive" },
        { sev: "trigger", what: "**Differentiate ICI colitis from CDI**",
          why: "ICI colitis treated with steroids + infliximab; CDI treated with vancomycin / fidaxomicin; both possible together",
          matchBranch: ["Checkpoint inhibitor + ICI colitis (NOT CDI alone)"] },
        { sev: "trigger", what: "**Vaccination review** — inactivated safe, live contraindicated",
          why: "Standard during long-term biologic therapy; flu, pneumococcal, COVID, HBV" },
        { sev: "consider", what: "**Endemic mycosis exposure** review for TNFi (histo, coccidio, blasto)",
          why: "Disseminated disease in TNFi-exposed; geographic + occupational history" },
      ],
    },
  },

  /* ===========================================================
     DEFINED IMMUNE DEFECT: PATHOGEN PATTERNS — CGD, CVID, HIV,
     complement, neutropenia — specific organisms by defect. === */
  "cgd-defect": {
    duration: {
      headline: "Per defect + pathogen; defect-specific organism patterns; prophylaxis + immune-reconstitution.",
      evidence: "PIDTC + JMF — CGD → catalase-positive (S. aureus, Burkholderia, Serratia, Nocardia, Aspergillus); CVID → encapsulated; complement → Neisseria",
      branches: [
        { label: "CGD + catalase-positive infection", days: "Per pathogen",
          detail: "Often weeks–months; S. aureus → per SSTI / SAB bands; Aspergillus → per IFI; lifetime TMP-SMX + itraconazole + IFN-γ ppx",
          matchAgent: /trimethoprim-?sulfamethoxazole|itraconazole/i },
        { label: "CVID + encapsulated infection", days: "Per pathogen",
          detail: "Per pathogen bands; IVIG replacement therapy + treat acute infection" },
        { label: "Complement defect (terminal) + meningococcus", days: "Per meningitis bands",
          detail: "Per meningitis bands; eculizumab + ppx if on complement-inhibitor for PNH / aHUS" },
        { label: "Hyper-IgE / Job + S. aureus + Aspergillus", days: "Per pathogen",
          detail: "TMP-SMX prophylaxis; per SSTI / pneumonia bands" },
        { label: "Severe combined immunodeficiency (SCID)", days: "Per pathogen + HSCT",
          detail: "Per pathogen; HSCT curative; lifelong PJP prophylaxis until immune reconstitution" },
      ],
      stopWhen: [
        "Pathogen identified + pathogen-specific duration met",
        "Cultures cleared / imaging resolution",
        "Prophylaxis regimen documented + resumed",
        "Immunology consult + workup completed",
        "Family screening + counseling addressed",
      ],
      extendIf: [
        { text: "**Disseminated / refractory** infection in immune defect host",
          matchCtx: { severe: true } },
        "CGD + invasive aspergillosis — voriconazole + IFN-γ extended",
        "CVID + chronic infection — IVIG + extended antibiotics",
        "Family screening + transplant decision — extend ppx until decision",
      ],
    },
    monitoring: {
      headline: "Defect-specific organism + workup; immunology consult; prophylaxis + IVIG + IFN-γ as indicated.",
      items: [
        { sev: "required", what: "**Identify the defect** — CGD, CVID, complement, hyper-IgE, SCID",
          why: "Drives differential, empiric therapy, and prophylaxis; sometimes diagnosed by infection pattern itself" },
        { sev: "required", what: "**Immunology consult** at presentation",
          why: "Coordinated long-term management; family screening; transplant decision" },
        { sev: "required", what: "**Pathogen-specific workup** — catalase-positive (CGD), encapsulated (CVID), Neisseria (complement)",
          why: "Defect-organism patterns predict pathogen; expedites empiric choice" },
        { sev: "trigger", what: "**CGD prophylaxis** — TMP-SMX + itraconazole + IFN-γ",
          why: "Reduces infection incidence by ~50%; lifetime in confirmed CGD",
          matchAgent: /trimethoprim-?sulfamethoxazole|itraconazole/i },
        { sev: "trigger", what: "**CVID — IVIG replacement** therapy",
          why: "Replaces deficient immunoglobulin; reduces infection rate + severity" },
        { sev: "trigger", what: "**Complement defect + on eculizumab — meningococcal vaccination + ppx**",
          why: "Drug-induced complement defect; pre-treatment vaccination + standby penicillin" },
        { sev: "trigger", what: "**Genetic counseling + family screening**",
          why: "Inherited defects; family at risk; transplant or gene therapy may be curative" },
        { sev: "consider", what: "**Specialty center referral** — primary immunodeficiency clinic",
          why: "Coordinated multi-disciplinary care; trial enrollment for emerging therapies" },
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
