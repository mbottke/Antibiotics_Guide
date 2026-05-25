/* data · diagnostics — Wave 5 PR-6 diagnostic stewardship layer.

   The structured "what to order before / alongside empiric therapy"
   surface, sitting BEFORE the regimen in the Answer Canvas (workup
   precedes empiric — a contract). Mirrors the syndromeDecision.js
   schema verbatim: per-syndrome dictionary, graceful-fallback
   accessor, severity-tagged items with the same word caps and
   matchCtx predicate vocabulary used by MonitoringBlock.

   The architectural intent: the Answer Canvas should never start at
   "here's what to give" before answering "here's what to ORDER right
   now." Antimicrobial stewardship begins at the workup, not at the
   prescription. Cultures sent before the first dose; biomarkers
   anchoring duration; rapid panels that change the regimen at hour 4;
   imaging that distinguishes "drainable focus" from "antibiotics
   alone" — every empiric answer rests on these orders.

   SHAPE
   -----
   DIAGNOSTICS[syndromeId] = {
     cultures:   [{ what, why, sev, matchCtx? }],   // BCx, ECx, UCx, tissue
     biomarkers: [{ what, why, sev, matchCtx? }],   // lactate, procal, WBC
     panels:     [{ what, why, sev, matchCtx? }],   // BioFire, Verigene, Karius
     imaging:    [{ what, why, sev, matchCtx? }],   // CT, US, MRI, echo
     biopsy:     [{ what, why, sev, matchCtx? }],   // tissue, drainage
   };

   Every category is OPTIONAL — a syndrome may carry just cultures +
   biomarkers (cystitis), or the full five (sepsis). Empty / missing
   categories are skipped in render; null entry means "no authored
   diagnostics" and DiagnosticsBlock renders nothing.

   SEVERITY VOCABULARY
   -------------------
   Identical to MonitoringBlock — one severity language across the
   entire Answer Canvas:

     "required" — must-order, hard-stop if missed. Renders red
                  "REQUIRED" badge. Use for: blood cultures before
                  antibiotics in suspected bacteremia, MRI for spinal
                  epidural abscess on neuro deficit, etc.

     "trigger"  — conditional "if X then order Y". Renders amber
                  "TRIGGER" badge. Use for: PET-CT if BCx persist >
                  72 h, repeat lumbar puncture for persistent fever
                  in meningitis, echo on staphylococcal bacteremia.

     "consider" — optional escalation. Renders muted "CONSIDER"
                  badge. Use for: MRSA nares PCR for de-escalation
                  decision, rapid PCR panel where pre-test probability
                  is intermediate, broncho-alveolar lavage in
                  immunocompromised CAP.

   WRITING THE CONTENT
   -------------------
   what
     - Concrete and ordered. "Two sets of peripheral blood cultures
       before first antibiotic dose" not "consider blood cultures."
     - Numbers, not adjectives. ≤ 28 words.
     - **bold** highlights parsed by DiagnosticsBlock for the same
       visual emphasis system as MonitoringBlock.

   why
     - The clinical reasoning in one sentence. ≤ 26 words.
     - What changes about management if positive / negative.

   matchCtx (optional)
     - The same declarative predicate evaluated by ctxMatch.js the
       monitoring items use. When the patient ctx matches, the item
       gets a left-border accent + "MATCHES" chip in render.
     - Never hides items — only elevates them. Safety contract:
       hiding important workup based on partial information would
       lose orders that matter.

   GRACEFUL FALLBACK
   -----------------
   Syndromes without an entry render no DiagnosticsBlock. The Answer
   Canvas simply proceeds from the Start section into Covers as
   before. The file fills in over time without breaking anything.

   Wave 5 PR-6a ships the sentinel 10: the highest-volume syndromes
   that anchor the most clinical decisions (sepsis, CAP, HAP, SAB,
   IE, meningitis, pyelo, cellulitis, cholangitis, CDI). PR-6b-f
   author the remaining ~107 syndromes in parallel tranches per the
   plan's multi-agent matrix.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

const DIAGNOSTICS = {

  /* === Sepsis / septic shock — empiric umbrella, broad workup ============= */
  sepsis: {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures **before the first antibiotic dose** (when it does not delay therapy in shock).",
        why:  "Yield drops sharply after the first dose; pre-treatment cultures are the only reliable directed-therapy lever." },
      { sev: "required",
        what: "Source-directed cultures (urine, sputum, CSF, wound, line) before empiric coverage when accessible.",
        why:  "Every culture sent before exposure widens the de-escalation window over the next 48–72 h." },
      { sev: "trigger",
        what: "Repeat blood cultures q48h until clearance when bacteremia documented.",
        why:  "Persistent positives at 72 h change management — endovascular focus, abscess, or resistant organism." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Lactate at presentation and at **2–4 h** after resuscitation.",
        why:  "Resuscitation target; trending lactate guides fluid + pressor decisions and gates ICU disposition." },
      { sev: "consider",
        what: "Procalcitonin trend can support stopping antibiotics but never gates initiation in shock.",
        why:  "PCT-guided de-escalation is supported by RCTs (SAPS, ProACT); single values are noisy in critical illness." },
    ],
    panels: [
      { sev: "trigger",
        what: "Rapid blood-culture pathogen panel (BioFire FilmArray, Verigene) **on first positive bottle**.",
        why:  "Cuts time-to-organism by 24–36 h; documented mortality benefit when paired with stewardship review." },
      { sev: "consider",
        what: "Plasma cell-free DNA metagenomics (Karius) for culture-negative sepsis at day 3–5.",
        why:  "Yield highest for endovascular and fungal infection; expensive and slow — reserve for refractory cases." },
    ],
    imaging: [
      { sev: "trigger",
        what: "Source-directed imaging within the first hour when the focus is unclear — CT abdomen/pelvis is highest yield.",
        why:  "Undrained abscess and obstructive uropathy are the dominant reversible causes of antibiotic failure." },
      { sev: "consider",
        what: "Bedside echo if endovascular source is plausible (S. aureus, enterococcus, prior valve).",
        why:  "Vegetations and pericardial collections change duration and surgical consultation." },
    ],
  },

  /* === CAP — community-acquired pneumonia ================================ */
  cap: {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures in severe CAP (ICU, sepsis criteria, or pre-existing structural lung disease).",
        why:  "Bacteremia in severe CAP is uncommon (~10%) but identification narrows therapy and detects S. aureus or GNR." },
      { sev: "trigger",
        what: "Sputum Gram stain + culture when a good-quality sample is obtainable before antibiotics.",
        why:  "Helps in severe CAP, prior MRSA / Pseudomonas, structural lung disease, or treatment failure." },
      { sev: "required",
        what: "Urinary antigen for **S. pneumoniae** and **Legionella** in severe / ICU CAP (ATS/IDSA 2019).",
        why:  "Severe CAP demands antigen testing to catch atypicals empiric coverage may miss; outcome data supports the rule." },
      { sev: "consider",
        what: "Same urinary antigen panel in moderate CAP with epidemiologic risk (recent travel, hotel/cruise exposure, outbreak).",
        why:  "Legionella antigen only detects serogroup 1 (~70–80% of disease); negative does not rule out." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "Procalcitonin to support antibiotic discontinuation, never to gate initiation.",
        why:  "PCT below 0.25 ng/mL in clinical improvement supports a 5-day course; do not withhold empiric therapy." },
    ],
    panels: [
      { sev: "trigger",
        what: "Respiratory viral PCR (influenza, RSV, SARS-CoV-2, others per platform) in season or severe disease.",
        why:  "Viral co-infection changes oseltamivir / paxlovid decisions; pure viral pneumonia may permit early stop." },
      { sev: "consider",
        what: "MRSA nares PCR — a negative result has ~99% NPV for MRSA pneumonia and permits anti-MRSA de-escalation.",
        why:  "One of the highest-yield stewardship tests; turnaround under 2 h on most platforms." },
    ],
    imaging: [
      { sev: "required",
        what: "Chest radiograph at presentation; CT chest when CXR is non-diagnostic or for complications.",
        why:  "Distinguishes lobar consolidation, cavitation, effusion, and abscess — each drives different decisions." },
      { sev: "trigger",
        what: "Bedside lung ultrasound or CT for suspected parapneumonic effusion or empyema.",
        why:  "Drainable collections demand chest tube + intrapleural tPA/DNase — antibiotics alone fail." },
    ],
  },

  /* === HAP / VAP ======================================================== */
  hap: {
    cultures: [
      { sev: "required",
        what: "Lower respiratory tract sample (endotracheal aspirate, mini-BAL, or BAL) **before changing antibiotics**.",
        why:  "Quantitative culture refines diagnosis and drives de-escalation; pre-change samples preserve yield." },
      { sev: "required",
        what: "Two sets of peripheral blood cultures.",
        why:  "Bacteremia in HAP/VAP (~15%) identifies the pathogen even when respiratory cultures are non-contributory." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "Procalcitonin trend to support 7-day stop in clinical responders.",
        why:  "PCT supports the shorter-course IDSA 2016 recommendation; no benefit for initiation decisions." },
    ],
    panels: [
      { sev: "trigger",
        what: "Multiplex respiratory PCR (BioFire Pneumonia panel) on ETT/BAL sample on day 1.",
        why:  "Resistance markers (mecA, KPC, NDM) shift empiric therapy 18–24 h before culture; high stewardship leverage." },
    ],
    imaging: [
      { sev: "required",
        what: "Chest radiograph (or CT in equivocal cases) demonstrating new or progressive infiltrate.",
        why:  "Required for the diagnostic definition; CT distinguishes empyema, abscess, or alternative diagnoses." },
    ],
  },

  /* === SAB — S. aureus bacteremia ======================================== */
  sab: {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures on detection AND **q48h until clearance documented**.",
        why:  "Time-to-clearance defines complicated SAB and starts the 14-day clock at first negative." },
      { sev: "required",
        what: "Culture every retained line / device + the source (wound, joint, urine) accessible.",
        why:  "Source identification is the largest determinant of cure; retained foci drive recurrence." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "Daily CRP trend supports response monitoring but never gates duration.",
        why:  "CRP fall lags clinical response; useful in complex cases when symptoms are obscured." },
    ],
    panels: [
      { sev: "trigger",
        what: "Rapid PCR identification (Verigene, Xpert MRSA/SA) on positive bottle within 1–2 h.",
        why:  "Distinguishes MSSA from MRSA same-day, gating cefazolin / nafcillin vs vancomycin." },
    ],
    imaging: [
      { sev: "required",
        what: "Echocardiogram in every SAB — **TEE unless very-low-risk** by VIRSTA / POSITIVE score; TTE alone is insufficient when risk is elevated.",
        why:  "TEE sensitivity ~95% vs TTE ~50% in SAB; 2023 AHA endorses risk-stratified TTE-first only for the lowest-risk subgroup." },
      { sev: "trigger",
        what: "Whole-body PET-CT or focused MRI if BCx persist > 72 h or there is unexplained metastatic seeding.",
        why:  "Identifies occult endovascular focus, vertebral osteomyelitis, septic emboli, or psoas abscess." },
      { sev: "consider",
        what: "Dilated fundoscopy when ophthalmologic symptoms or persistent bacteremia.",
        why:  "Endogenous endophthalmitis warrants intravitreal therapy and substantially longer systemic course." },
    ],
    biopsy: [
      { sev: "trigger",
        what: "Tissue or vegetation culture when source surgery occurs (debridement, valve replacement).",
        why:  "Pathogen-tissue match confirms responsible focus and guides duration after surgical clock reset." },
    ],
  },

  /* === IE — infective endocarditis ====================================== */
  ie: {
    cultures: [
      { sev: "required",
        what: "Three sets of peripheral blood cultures from separate venipunctures at least 30 minutes apart, before antibiotics.",
        why:  "Continuous bacteremia is the diagnostic fingerprint; multiple sets quantify endovascular focus." },
      { sev: "trigger",
        what: "Extended-incubation / fastidious-organism cultures if HACEK or culture-negative IE suspected.",
        why:  "HACEK, Brucella, Tropheryma whipplei, and Bartonella require specialized handling or serology." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "CRP, ESR baseline + trend; rheumatoid factor (positive in subacute IE).",
        why:  "Inflammatory markers support diagnosis when echo is equivocal; rheumatoid factor common in subacute disease." },
    ],
    panels: [
      { sev: "consider",
        what: "16S rRNA PCR on valve tissue after surgery; serology for Bartonella, Coxiella, Brucella in culture-negative cases.",
        why:  "Identifies organism in 30–50% of culture-negative IE; changes targeted therapy and duration." },
    ],
    imaging: [
      { sev: "required",
        what: "Transthoracic echo first; **TEE** in all adults with high suspicion or negative/equivocal TTE.",
        why:  "TEE sensitivity ~95% native, ~90% prosthetic vs TTE ~50–70%; defines vegetations, abscess, leaflet integrity." },
      { sev: "trigger",
        what: "Cardiac CT or **FDG-PET/CT** for prosthetic-valve IE > 3 months — major Duke-ISCVID 2023 criterion.",
        why:  "FDG-PET/CT was upgraded to a major criterion in 2023 Duke-ISCVID; identifies perivalvular abscess + pseudoaneurysm that change surgical timing." },
      { sev: "trigger",
        what: "Brain MRI in left-sided IE with neurologic symptoms (mycotic aneurysm, septic emboli).",
        why:  "Embolic events change anticoagulation, surgical timing, and risk-of-rebleed calculus." },
    ],
  },

  /* === Bacterial meningitis ============================================= */
  meningitis: {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures + **CSF Gram stain, culture, cell count, glucose, protein** at LP.",
        why:  "CSF defines the diagnosis; blood cultures yield pathogen in 50–80% of pneumococcal meningitis." },
      { sev: "trigger",
        what: "Repeat LP at 24–48 h for refractory pneumococcal meningitis or unexpected clinical course.",
        why:  "Documents sterilization and confirms susceptibility-guided regimen is working." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "Serum procalcitonin > 2 ng/mL supports bacterial over viral meningitis (PPV ~85%).",
        why:  "Useful when CSF Gram stain is negative and the bacterial / viral distinction is clinically uncertain." },
    ],
    panels: [
      { sev: "trigger",
        what: "Meningoencephalitis multiplex PCR (BioFire ME) on CSF when culture-negative or partially treated.",
        why:  "Detects 14 pathogens incl. HSV / VZV / enterovirus; turnaround ~1 h supports same-day decisions." },
    ],
    imaging: [
      { sev: "trigger",
        what: "**Head CT before LP** only when focal neurologic signs, papilledema, immunocompromise, seizure, or AMS.",
        why:  "IDSA criteria — most adults can safely undergo LP without imaging; CT delays first-dose antibiotic." },
      { sev: "trigger",
        what: "MRI brain with contrast for refractory disease, suspected ventriculitis, or abscess.",
        why:  "Identifies parenchymal involvement that extends therapy and may require neurosurgical drainage." },
    ],
  },

  /* === Pyelonephritis / complicated UTI ================================= */
  pyelo: {
    cultures: [
      { sev: "required",
        what: "Urine culture and Gram stain **before antibiotics** in every patient.",
        why:  "Empiric resistance is high enough that culture-guided narrowing changes therapy in 30–50% of cases." },
      { sev: "required",
        what: "Two sets of peripheral blood cultures in pyelonephritis with sepsis criteria, immunocompromise, or hospitalization.",
        why:  "Bacteremic GNR pyelo is common (~25% inpatients); blood culture identification accelerates targeted therapy." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "Lactate if febrile or hemodynamic concern.",
        why:  "Distinguishes pyelo with sepsis (urosepsis) from uncomplicated pyelo — drives ICU disposition." },
    ],
    panels: [
      { sev: "consider",
        what: "Rapid resistance-marker PCR on urine (where available) for ESBL / KPC where local prevalence is high.",
        why:  "Drives empiric carbapenem decisions 24 h before culture; depends on lab availability." },
    ],
    imaging: [
      { sev: "trigger",
        what: "CT abdomen/pelvis (or renal US) when obstruction, abscess, or no response within 48–72 h is suspected.",
        why:  "Obstructive pyelonephritis is a urologic emergency; perinephric abscess > 3 cm requires drainage." },
    ],
  },

  /* === Cellulitis ======================================================= */
  cellulitis: {
    cultures: [
      { sev: "consider",
        what: "Blood cultures only in severe cellulitis (immunocompromise, sepsis criteria, water exposure, animal/human bite).",
        why:  "Yield is low (~5%) in uncomplicated cellulitis; risk-stratification preserves diagnostic value." },
      { sev: "trigger",
        what: "Tissue/aspirate culture for purulent collections, recurrent disease, or treatment failure.",
        why:  "Identifies the pathogen and resistance pattern when empiric Gram-positive cover fails or recurs." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "CBC, CRP baseline if hospitalized; CK if necrotizing infection is on the differential.",
        why:  "Inflammatory markers track response in inpatient courses; CK > 600 raises concern for myonecrosis." },
    ],
    imaging: [
      { sev: "trigger",
        what: "Bedside ultrasound for occult abscess; CT or MRI if necrotizing fasciitis is suspected.",
        why:  "Drainable collections change management entirely; necrotizing requires emergent surgery — imaging never delays it." },
    ],
  },

  /* === Cholangitis ====================================================== */
  cholangitis: {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures **before antibiotics**.",
        why:  "Bacteremia in acute cholangitis is common (~40%); blood cultures often the highest-yield pathogen source." },
      { sev: "trigger",
        what: "Bile culture obtained at ERCP / PTC source-control procedure.",
        why:  "Polymicrobial yield supports definitive coverage; pairs with blood culture for resistance pattern." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Liver enzymes, total bilirubin, lactate at presentation.",
        why:  "Defines Tokyo Guidelines severity grading and gates urgent vs delayed biliary drainage." },
    ],
    imaging: [
      { sev: "required",
        what: "RUQ ultrasound first; MRCP or CT when ductal anatomy is unclear or stone burden assessment needed.",
        why:  "Establishes biliary dilation and stones; drainage timing (urgent < 24 h vs early < 48 h) follows from this." },
    ],
  },

  /* === C. difficile infection =========================================== */
  cdiff: {
    cultures: [
      { sev: "required",
        what: "Stool **NAAT (PCR)** or 2-step algorithm (GDH antigen + toxin EIA) only in patients with ≥ 3 unformed stools in 24 h.",
        why:  "Testing formed stool drives over-diagnosis of colonization; symptomatic-only testing preserves PPV." },
      { sev: "trigger",
        what: "Do NOT repeat testing within 7 days of an initial result, and do NOT test for cure.",
        why:  "Stewardship contract; toxin shedding outlasts symptoms and drives unnecessary additional courses." },
    ],
    biomarkers: [
      { sev: "required",
        what: "WBC, creatinine, albumin, lactate at diagnosis — define **severe** vs non-severe per IDSA 2017/2021.",
        why:  "Severity (WBC ≥ 15, Cr ≥ 1.5×, albumin < 2.5) gates fidaxomicin / vancomycin choice and IV vs PO route." },
    ],
    imaging: [
      { sev: "trigger",
        what: "CT abdomen/pelvis when fulminant disease, toxic megacolon, or ileus is suspected.",
        why:  "Toxic megacolon (colonic dilation > 6 cm) is a surgical emergency; delay drives mortality > 50%." },
    ],
  },

};

/* Lookup helper — used by DiagnosticsBlock. Returns null when the syndrome
   has no authored content, which signals the component to render nothing.
   Mirrors getSyndromeDuration / getSyndromeMonitoring / etc. for consistency
   across the depth-layer accessor pattern. */
function getDiagnosticsForSyndrome(synId) {
  return DIAGNOSTICS[synId] || null;
}

export { DIAGNOSTICS, getDiagnosticsForSyndrome };
