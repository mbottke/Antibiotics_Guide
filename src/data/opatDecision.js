/* data · opatDecision — Wave 5 PR-8 outpatient parenteral therapy layer.

   The structured "can this patient finish IV at home / SNF" surface.
   Per-syndrome OPAT_PROFILES that replace the legacy general-OPAT
   primer in content.js (which becomes a Principles-page-only render
   in PR-8b) with bedside-actionable decisions: eligibility criteria,
   the right vascular access, agent-by-agent OPAT-suitability with
   route + dosing + per-agent monitoring, and the post-discharge
   monitoring plan.

   ARCHITECTURAL INTENT
   --------------------
   OPAT decisions are syndrome-specific. "Can this patient go on a
   PICC for the rest of their course?" depends on:
     • the focus (endocarditis demands TEE confirmation before OPAT;
       liver abscess demands documented drainage)
     • the agent (q24h is the OPAT-friendly cadence; continuous
       infusion via elastomeric pump for time-dependent β-lactams)
     • the patient (CrCl stability, hepatic stability, social support)
     • the host (immunocompromise gates more frequent monitoring)

   A flat "OPAT principles" list cannot answer "should this SAB
   patient finish at home?" PR-8a moves the decision per-syndrome.

   SHAPE
   -----
   OPAT_PROFILES[syndromeId] = {
     eligibility: [{ what, why, sev: required|trigger|consider, matchCtx? }],
     access:      "PICC" | "midline" | "port" | "none",
     // access notes — what dwell time + line type the typical
     // course implies (PICC for > 7 days; midline 1–4 weeks;
     // port for indefinite or chronic; none = oral step-down expected)
     agents:      [{
       name,         // canonical FORMULARY drug name (validated by audit)
       route,        // "IV q24h" | "Continuous infusion" | "IM" | etc.
       dose,         // "1–2 g IV q24h" — typical adult OPAT dose
       monitoring,   // "Weekly CMP" — agent-level OPAT lab cadence
       note?,        // optional one-liner (allergy alternative,
                     //   compatibility note, pump-required, etc.)
     }],
     monitoring:  [{ what, why, sev, matchCtx? }],
     // syndrome-level monitoring on top of agent-level — what the
     // home/SNF team must order weekly to keep the patient safe.
   };

   The four sections render in the OPATBlock as: eligibility chips,
   access badge, agents table, monitoring checklist. Visual language
   matches MonitoringBlock + DiagnosticsBlock — one severity grammar
   across the canvas (required / trigger / consider).

   GRACEFUL FALLBACK
   -----------------
   Syndromes without an OPAT profile render no OPATBlock. Oral-only
   syndromes (cystitis, oral cellulitis) correctly return null — the
   Reassessment IV→PO surface handles the "switch to oral" decision.

   SEED CONTENT (PR-8a)
   --------------------
   8 IV-extended syndromes — those with the highest OPAT-eligible
   volume + the highest clinical leverage:
     • sab        — 14 d (uncomplicated) or 4–6 wk (complicated)
     • ie         — 4–6 wk; POET-eligible partial oral step-down
     • ie-pve     — ≥ 6 wk; usually IV throughout
     • osteo      — 6 wk; OVIVA permits PO step-down at 2 wk
     • vertosteo  — 6 wk; same OVIVA principle
     • pji        — 6–12 wk; rifampin oral adjunct for retained hardware
     • liverabscess — 2–6 wk; drain + IV→PO step-down
     • brainabscess — 6–8 wk; rare candidate for full OPAT, IV core
                       course usually inpatient or SNF

   PR-8b-c will broaden to all 60–70 IV-eligible syndromes per the
   decision-locked comprehensive coverage scope.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

import { FORMULARY } from "./drugs.js";

/* Build the canonical FORMULARY name set once so the audit can verify
   every `agents[].name` round-trips to a real drug — drift between
   OPAT regimens and the engine is a silent-prescribing bug. */
const _FORMULARY_NAMES = new Set(FORMULARY.flatMap(c => c.drugs.map(d => d.name)));

const OPAT_PROFILES = {

  /* === SAB · S. aureus bacteremia ============================== */
  sab: {
    eligibility: [
      { sev: "required",
        what: "TEE documenting absence of endocarditis (or completed IE course if positive).",
        why:  "Endocarditis upgrades duration to 6 weeks; TEE rules out vegetation that TTE misses." },
      { sev: "required",
        what: "Documented clearance — repeat BCx negative — before OPAT discharge.",
        why:  "Persistent bacteremia is the definition of complicated SAB; never finish at home with positive BCx." },
      { sev: "required",
        what: "Removable focus controlled (line out, abscess drained, joint washed) prior to OPAT.",
        why:  "Retained focus drives 30-day relapse; source control is non-negotiable for outpatient course." },
      { sev: "trigger",
        what: "ID consult to follow OPAT course weekly — IDSA documents 50% mortality reduction.",
        why:  "ID involvement improves echo completion, duration adherence, and complication detection." },
    ],
    access: "PICC",
    agents: [
      { name: "Cefazolin",          route: "IV q8h or continuous infusion via pump",
        dose: "2 g IV q8h (or 6–8 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "First-line for MSSA — outperforms nafcillin on tolerability and OPAT logistics." },
      { name: "Nafcillin / oxacillin", route: "IV q4h or continuous infusion via pump",
        dose: "2 g IV q4h (or 12 g/24 h CI)",
        monitoring: "Weekly CBC + CMP + LFT",
        note: "Reserve for cefazolin allergy or CNS-involved MSSA; hepatotoxicity and phlebitis are common." },
      { name: "Vancomycin (IV)",    route: "IV q8–12h",
        dose: "Dose by AUC — target AUC/MIC 400–600",
        monitoring: "Weekly AUC + CMP",
        note: "MRSA workhorse; logistics harder than q24h agents but tolerable on home pump." },
      { name: "Daptomycin",         route: "IV q24h",
        dose: "8–10 mg/kg IV q24h (≥10 for complicated)",
        monitoring: "Weekly CK + CMP",
        note: "MRSA bacteremia salvage or vancomycin intolerance; never for pneumonia source." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + BMP + LFT + drug-specific level (AUC for vanco, CK for dapto).",
        why:  "Catches AKI, hepatotoxicity, cytopenias before they end the course; baseline + weekly is the contract." },
      { sev: "required",
        what: "Documented repeat BCx clearance prior to OPAT; clinical check-in at week 1 and week 2.",
        why:  "30-day relapse is the dominant failure mode; early detection prevents readmission with metastatic seeding." },
      { sev: "trigger",
        what: "PET-CT or focused MRI if fevers recur or BCx re-positive during OPAT.",
        why:  "Identifies the occult endovascular focus, vertebral osteomyelitis, or septic emboli." },
    ],
  },

  /* === IE · native-valve infective endocarditis =============== */
  ie: {
    eligibility: [
      { sev: "required",
        what: "Stable hemodynamics and no acute heart failure on the IV regimen for ≥ 10–14 days.",
        why:  "POET (2019) randomized only stable left-sided IE patients to partial oral; instability rules OPAT out." },
      { sev: "required",
        what: "Surgical consultation completed — repair or no-surgery decision documented.",
        why:  "OPAT does not substitute for surgery; the indication for valve replacement is independent of the antibiotic plan." },
      { sev: "trigger",
        what: "Consider POET-style partial oral step-down after 10–14 d IV in selected stable left-sided IE.",
        why:  "POET demonstrated non-inferiority for partial oral completion; saves 4 weeks of line dwell." },
    ],
    access: "PICC",
    agents: [
      { name: "Ceftriaxone",        route: "IV q24h",
        dose: "2 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "Penicillin-susceptible viridans / S. gallolyticus — the OPAT-ideal cadence." },
      { name: "Cefazolin",          route: "IV q8h or continuous infusion",
        dose: "2 g IV q8h (or 6 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "MSSA native-valve endocarditis; q8h is the OPAT compromise vs nafcillin q4h." },
      { name: "Ampicillin",         route: "IV q4h or continuous infusion via pump",
        dose: "2 g IV q4h (or 12 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "Enterococcal IE; pair with ceftriaxone 2 g q12h for the synergy regimen (avoids gent oto/nephrotoxicity)." },
      { name: "Vancomycin (IV)",    route: "IV q8–12h",
        dose: "Dose by AUC — target AUC/MIC 400–600",
        monitoring: "Weekly AUC + CMP",
        note: "MRSA IE or severe β-lactam allergy; complicates OPAT logistics but feasible." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + BMP + LFT + drug levels; CRP trend for stewardship signal.",
        why:  "Long IV courses select for cytopenias, AKI, hepatitis; routine surveillance catches them early." },
      { sev: "trigger",
        what: "Repeat TTE at end of therapy; consider TEE if clinical signs of progression.",
        why:  "Documents cure and identifies new vegetation, abscess, or valve dysfunction prompting surgery." },
    ],
  },

  /* === IE-PVE · prosthetic-valve endocarditis ================= */
  "ie-pve": {
    eligibility: [
      { sev: "required",
        what: "Surgical evaluation completed; high-risk PVE (mechanical valve, large vegetation, paravalvular abscess) typically operated.",
        why:  "PVE has higher mortality and higher surgical threshold than NVE; OPAT after surgery is the common pattern." },
      { sev: "consider",
        what: "Outpatient completion only after ≥ 2 weeks inpatient response and documented stability.",
        why:  "Earlier transition is high-risk; staphylococcal PVE in particular demands prolonged inpatient observation." },
    ],
    access: "PICC",
    agents: [
      { name: "Vancomycin (IV)",    route: "IV q8–12h",
        dose: "Dose by AUC — target AUC/MIC 400–600",
        monitoring: "Weekly AUC + CMP",
        note: "Backbone for staphylococcal PVE; combined with rifampin (oral) plus gentamicin (inpatient phase)." },
      { name: "Daptomycin",         route: "IV q24h",
        dose: "≥ 10 mg/kg IV q24h",
        monitoring: "Weekly CK + CMP",
        note: "Vancomycin intolerance or persistent bacteremia; combination with ceftaroline often used." },
      { name: "Ceftriaxone",        route: "IV q24h",
        dose: "2 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "Streptococcal PVE; OPAT-ideal cadence." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + BMP + LFT + drug levels; surveillance BCx if fever recurs.",
        why:  "Relapse in PVE is severe — early detection drives re-operation decisions and outcomes." },
      { sev: "trigger",
        what: "End-of-therapy TEE and cardiac CT or PET-CT in selected cases.",
        why:  "Documents cure and detects residual paravalvular complications that prompt surgery." },
    ],
  },

  /* === Osteomyelitis · native (OVIVA cohort) ================== */
  osteo: {
    eligibility: [
      { sev: "required",
        what: "Definitive surgical debridement completed when surgical course indicated.",
        why:  "OVIVA cohort enrolled post-debridement patients; antibiotic alone does not eradicate osteomyelitis." },
      { sev: "trigger",
        what: "OVIVA pathway — oral step-down at 2 weeks is non-inferior to full 6-week IV.",
        why:  "Lancet 2019 RCT; saves 4 weeks of line dwell + cuts CRBSI risk substantially." },
      { sev: "consider",
        what: "Consider full OPAT IV course when oral options are limited (resistant organism, malabsorption, allergy).",
        why:  "Some resistant Gram-negative or MRSA bone disease cannot bridge to oral; full IV via OPAT remains valid." },
    ],
    access: "PICC",
    agents: [
      { name: "Cefazolin",          route: "IV q8h or continuous infusion",
        dose: "2 g IV q8h (or 6 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "MSSA bone disease; q8h CI via pump is the OPAT-friendly form." },
      { name: "Ceftriaxone",        route: "IV q24h",
        dose: "2 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "Streptococcal or susceptible-Enterobacterales bone disease." },
      { name: "Ertapenem",          route: "IV q24h",
        dose: "1 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "ESBL Enterobacterales; q24h is the OPAT-ideal cadence among carbapenems." },
      { name: "Vancomycin (IV)",    route: "IV q12h",
        dose: "Dose by AUC — target AUC/MIC 400–600",
        monitoring: "Weekly AUC + CMP",
        note: "MRSA bone disease; harder OPAT logistics than q24h agents." },
      { name: "Daptomycin",         route: "IV q24h",
        dose: "6–10 mg/kg IV q24h",
        monitoring: "Weekly CK + CMP",
        note: "MRSA or VRE bone disease; q24h is OPAT-ideal." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + BMP + LFT + drug levels for 6 weeks (or oral step-down per OVIVA).",
        why:  "Long IV courses select toxicity; routine labs catch hepatotoxicity and AKI." },
      { sev: "trigger",
        what: "ESR/CRP trend at presentation and at end of therapy.",
        why:  "Falling inflammatory markers support cure; rising or static prompts imaging to look for retained focus." },
    ],
  },

  /* === Vertebral osteomyelitis / discitis ===================== */
  vertosteo: {
    eligibility: [
      { sev: "required",
        what: "Image-guided or surgical biopsy with pathogen identified before OPAT (when feasible).",
        why:  "Empiric coverage without identification is high-failure; biopsy is the highest-yield pathogen source." },
      { sev: "trigger",
        what: "Neurologic exam stable; no progressive deficit or epidural abscess on imaging.",
        why:  "Neurologic deterioration is a surgical indication; OPAT cannot rescue a compressive cord injury." },
    ],
    access: "PICC",
    agents: [
      { name: "Ceftriaxone",        route: "IV q24h",
        dose: "2 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "Streptococcal or susceptible-GNR vertebral osteomyelitis." },
      { name: "Cefazolin",          route: "IV q8h or CI via pump",
        dose: "2 g IV q8h (or 6 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "MSSA vertebral osteomyelitis." },
      { name: "Vancomycin (IV)",    route: "IV q12h",
        dose: "Dose by AUC — target AUC/MIC 400–600",
        monitoring: "Weekly AUC + CMP",
        note: "MRSA vertebral osteomyelitis." },
      { name: "Daptomycin",         route: "IV q24h",
        dose: "6 mg/kg IV q24h (8–10 if MRSA persistent)",
        monitoring: "Weekly CK + CMP",
        note: "MRSA or VRE; q24h is OPAT-ideal." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + BMP + LFT + drug levels; ESR/CRP trend.",
        why:  "6-week course needs ongoing surveillance; falling inflammatory markers support response." },
      { sev: "trigger",
        what: "End-of-therapy MRI when symptoms persist or new neurologic findings appear.",
        why:  "Documents cure / identifies residual abscess or instability requiring surgical revision." },
    ],
  },

  /* === Prosthetic joint infection ============================= */
  pji: {
    eligibility: [
      { sev: "required",
        what: "Surgical plan committed — DAIR (debridement + implant retention), one-stage, or two-stage exchange.",
        why:  "Cure requires addressing the implant; antibiotic alone is suppression, not cure." },
      { sev: "required",
        what: "Pathogen identified from operative cultures before OPAT.",
        why:  "Empiric long-course IV is high-failure; multiple operative cultures are the highest-yield pathogen source." },
      { sev: "trigger",
        what: "Staphylococcal DAIR — add **rifampin** orally for biofilm penetration on retained hardware.",
        why:  "Rifampin is the only agent reliably active against biofilm staphylococci; never monotherapy due to rapid resistance." },
    ],
    access: "PICC",
    agents: [
      { name: "Cefazolin",          route: "IV q8h or CI via pump",
        dose: "2 g IV q8h (or 6 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "MSSA PJI core; pair with rifampin PO for DAIR." },
      { name: "Vancomycin (IV)",    route: "IV q12h",
        dose: "Dose by AUC — target AUC/MIC 400–600",
        monitoring: "Weekly AUC + CMP",
        note: "MRSA PJI core; pair with rifampin PO for DAIR." },
      { name: "Daptomycin",         route: "IV q24h",
        dose: "6 mg/kg IV q24h",
        monitoring: "Weekly CK + CMP",
        note: "MRSA or VRE PJI; combination with rifampin standard for DAIR." },
      { name: "Ceftriaxone",        route: "IV q24h",
        dose: "2 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "Streptococcal PJI." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + BMP + LFT + drug levels through total course (often 12 weeks for DAIR).",
        why:  "Long courses select toxicity; rifampin specifically demands LFT and drug-interaction surveillance." },
      { sev: "trigger",
        what: "ESR/CRP trend through completion; clinical exam for sinus tract / wound dehiscence.",
        why:  "Falling markers support cure; rising prompts re-operation decision. Wound failure is a failure-mode signal." },
    ],
  },

  /* === Pyogenic liver abscess ================================== */
  liverabscess: {
    eligibility: [
      { sev: "required",
        what: "Drainage completed (percutaneous or surgical) before OPAT — duration follows drainage adequacy.",
        why:  "Antibiotics alone fail in liver abscess > 5 cm; drainage is the primary therapy." },
      { sev: "trigger",
        what: "IV→PO step-down at 2–3 weeks for stable patients on a high-bioavailability oral regimen (FQ + metronidazole).",
        why:  "Shortens line dwell + CRBSI risk; total course often 4–6 weeks with PO completion." },
    ],
    access: "PICC",
    agents: [
      { name: "Ceftriaxone",        route: "IV q24h",
        dose: "2 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "Pair with metronidazole PO for anaerobic cover; q24h is OPAT-ideal." },
      { name: "Piperacillin-tazobactam", route: "Continuous or extended infusion via pump",
        dose: "4.5 g IV q8h extended infusion (or 13.5 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "Broader Gram-negative + anaerobic; pump logistics required for time-dependent killing." },
      { name: "Ertapenem",          route: "IV q24h",
        dose: "1 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "ESBL Enterobacterales; q24h OPAT-ideal." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + CMP + LFT through course; imaging at 2–4 weeks documenting resolution.",
        why:  "LFTs track both the infection and the drug; imaging closure is the cure endpoint." },
      { sev: "consider",
        what: "Repeat drainage if collection re-accumulates or fever recurs.",
        why:  "Source control is iterative; missed re-accumulation drives 30-day failure." },
    ],
  },

  /* === Septic arthritis · native joint (non-gonococcal) ======== */
  "septic-arthritis": {
    eligibility: [
      { sev: "required",
        what: "Source control completed — arthroscopy, arthrotomy, or serial taps draining the joint.",
        why:  "Antibiotic alone fails in pus-loaded native joints; surgical washout drives bacterial-load reduction and cartilage rescue." },
      { sev: "required",
        what: "Pathogen identified from synovial fluid or blood cultures before OPAT transition.",
        why:  "Empiric IV at home is high-failure; targeted therapy from culture data shortens course and prevents collateral damage." },
      { sev: "trigger",
        what: "Clinical response by day 5–7 — falling joint pain, effusion, and CRP.",
        why:  "Non-response at the 1-week mark prompts repeat imaging and surgical reassessment before sending home." },
    ],
    access: "PICC",
    agents: [
      { name: "Cefazolin",          route: "IV q8h or CI via pump",
        dose: "2 g IV q8h (or 6 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "MSSA septic arthritis workhorse; q8h CI via pump is the OPAT-friendly form." },
      { name: "Nafcillin / oxacillin", route: "IV q4h or continuous infusion via pump",
        dose: "2 g IV q4h (or 12 g/24 h CI)",
        monitoring: "Weekly CBC + CMP + LFT",
        note: "Reserve for cefazolin allergy; phlebitis and hepatotoxicity make OPAT logistics harder." },
      { name: "Vancomycin (IV)",    route: "IV q8–12h",
        dose: "Dose by AUC — target AUC/MIC 400–600",
        monitoring: "Weekly AUC + CMP",
        note: "MRSA native-joint arthritis; AUC-guided dosing reduces nephrotoxicity." },
      { name: "Ceftriaxone",        route: "IV q24h",
        dose: "2 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "Streptococci or susceptible Enterobacterales; OPAT-ideal cadence." },
      { name: "Daptomycin",         route: "IV q24h",
        dose: "6–8 mg/kg IV q24h",
        monitoring: "Weekly CK + CMP",
        note: "MRSA salvage or vancomycin intolerance; q24h is OPAT-ideal." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + BMP + LFT + drug levels through the 2–4 week course.",
        why:  "Bactericidal IV courses select cytopenias and AKI; routine surveillance catches them before they end therapy." },
      { sev: "trigger",
        what: "Repeat joint aspiration if fever or effusion recurs; ESR/CRP trend at end of therapy.",
        why:  "Re-accumulation prompts re-washout; rising inflammatory markers identify the patient who needs surgical reassessment." },
    ],
  },

  /* === Diabetic foot infection · moderate-severe (IWGDF/IDSA) === */
  dfi: {
    eligibility: [
      { sev: "required",
        what: "Vascular assessment + revascularization decision documented before committing to OPAT course.",
        why:  "Perfusion is the rate-limiting step; antibiotics cannot heal an ischemic foot — bypass / endovascular precedes OPAT." },
      { sev: "required",
        what: "Surgical debridement + offloading plan in place; bone biopsy for suspected osteomyelitis.",
        why:  "IWGDF 2023 anchors cure on source control and pressure offload; antibiotic alone fails the chronic-ulcer patient." },
      { sev: "trigger",
        what: "Multi-disciplinary follow-up — podiatry / vascular / ID weekly for the OPAT course.",
        why:  "DFI relapse and limb loss track inversely with team-based care; OPAT without the team is a fail-safe pattern." },
    ],
    access: "PICC",
    agents: [
      { name: "Piperacillin-tazobactam", route: "Continuous or extended infusion via pump",
        dose: "4.5 g IV q8h extended (or 13.5 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "Broad polymicrobial cover for moderate-severe DFI; pump logistics support time-dependent killing." },
      { name: "Ertapenem",          route: "IV q24h",
        dose: "1 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "ESBL Enterobacterales or no Pseudomonas risk; q24h is OPAT-ideal among carbapenems." },
      { name: "Ceftriaxone",        route: "IV q24h",
        dose: "2 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "Pair with metronidazole PO for anaerobes when Pseudomonas risk is absent." },
      { name: "Vancomycin (IV)",    route: "IV q8–12h",
        dose: "Dose by AUC — target AUC/MIC 400–600",
        monitoring: "Weekly AUC + CMP",
        note: "MRSA component; combine with a Gram-negative agent for polymicrobial cover." },
      { name: "Daptomycin",         route: "IV q24h",
        dose: "6–8 mg/kg IV q24h",
        monitoring: "Weekly CK + CMP",
        note: "MRSA bone disease component or vancomycin intolerance; q24h OPAT-ideal." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + BMP + LFT + drug levels; glycemic control trended through therapy.",
        why:  "Hyperglycemia drives infection persistence; labs catch toxicity and metabolic decompensation alike." },
      { sev: "trigger",
        what: "Wound assessment at each visit; repeat imaging at 4–6 weeks for bone involvement.",
        why:  "Falling wound size + resolving marrow edema document cure; failure prompts re-debridement or amputation discussion." },
    ],
  },

  /* === Pyomyositis · pyogenic muscle abscess ==================== */
  pyomyositis: {
    eligibility: [
      { sev: "required",
        what: "Image-guided or surgical drainage of identifiable abscess completed before OPAT.",
        why:  "Crum 2004 series: drainage is the cure step; S. aureus pyomyositis without drainage relapses in 20–40%." },
      { sev: "required",
        what: "Concurrent S. aureus bacteremia workup — blood cultures + TTE — completed before discharge.",
        why:  "75–95% are S. aureus; metastatic seeding (endocarditis, vertebral osteomyelitis) reclassifies the duration and the access plan." },
      { sev: "trigger",
        what: "Tropical pyomyositis or immunocompromised host — broaden empiric cover for Gram-negatives.",
        why:  "Differential widens beyond S. aureus in tropical/immunocompromised cases; narrow once cultures return." },
    ],
    access: "PICC",
    agents: [
      { name: "Cefazolin",          route: "IV q8h or CI via pump",
        dose: "2 g IV q8h (or 6 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "MSSA pyomyositis workhorse; matches the SAB regimen when concurrent bacteremia present." },
      { name: "Nafcillin / oxacillin", route: "IV q4h or continuous infusion via pump",
        dose: "2 g IV q4h (or 12 g/24 h CI)",
        monitoring: "Weekly CBC + CMP + LFT",
        note: "Reserve for cefazolin allergy; harder OPAT logistics on q4h cadence." },
      { name: "Vancomycin (IV)",    route: "IV q8–12h",
        dose: "Dose by AUC — target AUC/MIC 400–600",
        monitoring: "Weekly AUC + CMP",
        note: "MRSA pyomyositis; AUC-guided dosing on home pump is feasible." },
      { name: "Daptomycin",         route: "IV q24h",
        dose: "8–10 mg/kg IV q24h",
        monitoring: "Weekly CK + CMP",
        note: "MRSA salvage or vancomycin intolerance; q24h cadence is OPAT-ideal." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + BMP + LFT + drug levels through the 2–4 week IV course.",
        why:  "Standard IV-course surveillance — cytopenias, AKI, and hepatotoxicity are the dominant ending events." },
      { sev: "trigger",
        what: "Repeat MRI if fever recurs or pain rebounds; repeat BCx if concurrent SAB was present.",
        why:  "Re-accumulation prompts repeat drainage; persistent bacteremia upgrades to complicated SAB management." },
    ],
  },

  /* === Septic bursitis · olecranon / prepatellar =============== */
  bursitis: {
    eligibility: [
      { sev: "required",
        what: "Bursal aspiration or incision-and-drainage completed; deep joint extension excluded on exam.",
        why:  "Septic bursitis is a superficial process; deep extension upgrades the case to septic arthritis with longer course." },
      { sev: "trigger",
        what: "Refractory course at 1 week — bursectomy referral and re-imaging to exclude deeper focus.",
        why:  "Most cases clear in 10–14 d with drainage + IV; non-response signals retained focus or resistant organism." },
      { sev: "consider",
        what: "Stable patient on oral-bioavailable agent — consider IV→PO step-down at day 3–5.",
        why:  "Superficial bursitis is a strong candidate for short-IV-then-oral pathway; saves line dwell and CRBSI risk." },
    ],
    access: "midline",
    agents: [
      { name: "Cefazolin",          route: "IV q8h",
        dose: "2 g IV q8h",
        monitoring: "Weekly CBC + CMP",
        note: "MSSA septic bursitis workhorse; short course makes midline access appropriate." },
      { name: "Nafcillin / oxacillin", route: "IV q4h",
        dose: "2 g IV q4h",
        monitoring: "Weekly CBC + CMP + LFT",
        note: "Reserve for cefazolin allergy; q4h cadence rare for short bursitis course." },
      { name: "Vancomycin (IV)",    route: "IV q12h",
        dose: "Dose by AUC — target AUC/MIC 400–600",
        monitoring: "Weekly AUC + CMP",
        note: "MRSA septic bursitis; switch upgrades access to PICC if course extends." },
      { name: "Ceftriaxone",        route: "IV q24h",
        dose: "2 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "Streptococcal bursitis; OPAT-ideal cadence on midline." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + CMP + drug-specific levels through the short 10–14 day course.",
        why:  "Short course but still IV — baseline + weekly catches cytopenias and AKI before completion." },
      { sev: "trigger",
        what: "Clinical exam for residual fluctuance or sinus tract at end of therapy.",
        why:  "Persistent fluctuance signals retained loculation and need for bursectomy or repeat drainage." },
    ],
  },

  /* === Mediastinitis · post-sternotomy or descending ============ */
  mediastinitis: {
    eligibility: [
      { sev: "required",
        what: "Surgical debridement + NPWT (or muscle-flap closure) committed; antibiotics adjunctive.",
        why:  "Mortality tracks source control; antibiotic alone in undrained mediastinitis is uniformly fatal." },
      { sev: "required",
        what: "Hemodynamic + respiratory stability documented for ≥ 2 weeks before OPAT consideration.",
        why:  "Mediastinitis decompensates rapidly; early OPAT misses recurrent sepsis and re-operation triggers." },
      { sev: "trigger",
        what: "Operative cultures identify pathogen — MSSA/MRSA dominant post-sternotomy; polymicrobial in descending cases.",
        why:  "Empiric long-course IV at home is high-failure; targeted therapy from operative cultures shortens and narrows the course." },
    ],
    access: "port",
    agents: [
      { name: "Cefazolin",          route: "IV q8h or CI via pump",
        dose: "2 g IV q8h (or 6 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "MSSA post-sternotomy mediastinitis; port supports the 4–6 week course." },
      { name: "Vancomycin (IV)",    route: "IV q8–12h",
        dose: "Dose by AUC — target AUC/MIC 400–600",
        monitoring: "Weekly AUC + CMP",
        note: "MRSA post-sternotomy mediastinitis; AUC-guided dosing on home pump." },
      { name: "Daptomycin",         route: "IV q24h",
        dose: "8–10 mg/kg IV q24h",
        monitoring: "Weekly CK + CMP",
        note: "MRSA salvage or vancomycin intolerance; q24h is OPAT-ideal for long course." },
      { name: "Piperacillin-tazobactam", route: "Continuous or extended infusion via pump",
        dose: "4.5 g IV q8h extended (or 13.5 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "Descending polymicrobial mediastinitis; broad cover via pump logistics." },
      { name: "Meropenem",          route: "IV q8h",
        dose: "1 g IV q8h",
        monitoring: "Weekly CBC + CMP",
        note: "ESBL or resistant Gram-negative component; broadest reasonable workhorse." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + BMP + LFT + drug levels through the 4–6 week course; wound surveillance at each visit.",
        why:  "Long IV courses select toxicity; sternal wound dehiscence is the failure-mode signal that mandates re-operation." },
      { sev: "trigger",
        what: "Repeat chest CT at 4 weeks for residual collection; ESR/CRP trend documenting response.",
        why:  "Re-accumulation is the dominant relapse pattern; imaging closure plus falling markers is the cure endpoint." },
    ],
  },

  /* === Brain abscess ========================================== */
  brainabscess: {
    eligibility: [
      { sev: "required",
        what: "Neurosurgical drainage (or stereotactic aspiration) of lesions ≥ 2.5 cm completed.",
        why:  "Pathogen identification + decompression are the foundation; antibiotics never substitute." },
      { sev: "required",
        what: "Neurologic stability for ≥ 2 weeks inpatient before OPAT consideration.",
        why:  "Brain abscess is the highest-stakes OPAT — neurologic deterioration is rapid and irreversible." },
      { sev: "consider",
        what: "Most brain abscess courses complete in SNF or inpatient rehab rather than home OPAT.",
        why:  "Frequent neuro checks + serial imaging are difficult outside structured care environments." },
    ],
    access: "PICC",
    agents: [
      { name: "Ceftriaxone",        route: "IV q12h (meningitic dosing)",
        dose: "2 g IV q12h",
        monitoring: "Weekly CBC + CMP",
        note: "Pair with metronidazole PO for anaerobes; standard backbone for streptococcal/oral-flora brain abscess." },
      { name: "Meropenem",          route: "IV q8h",
        dose: "2 g IV q8h (CNS dosing)",
        monitoring: "Weekly CBC + CMP",
        note: "Broad coverage incl. ESBL and anaerobes; CNS dose is double the standard." },
      { name: "Vancomycin (IV)",    route: "IV q8–12h",
        dose: "Dose by AUC — target AUC/MIC 400–600 (CNS upper range)",
        monitoring: "Weekly AUC + CMP",
        note: "MRSA or PRSP brain abscess." },
      { name: "Metronidazole",      route: "Oral or IV q8h",
        dose: "500 mg PO/IV q8h",
        monitoring: "Weekly CMP",
        note: "Anaerobic backbone; oral substitutes IV without bioavailability loss." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + BMP + LFT + drug levels; serial brain MRI every 2–4 weeks documenting resolution.",
        why:  "Imaging cure endpoint is essential — clinical response can mask radiographic progression." },
      { sev: "trigger",
        what: "Re-image immediately for any neurologic change.",
        why:  "Re-accumulation or new lesion mandates repeat neurosurgical intervention." },
    ],
  },

  /* === Mycotic (infected) aneurysm ============================ */
  "mycotic-aneurysm": {
    eligibility: [
      { sev: "required",
        what: "Vascular surgery consultation completed; surgical resection of the infected aneurysm is the curative step.",
        why:  "Antibiotics alone do not eradicate vascular infection; rupture and mortality are high without resection." },
      { sev: "required",
        what: "Pathogen identified by blood cultures or operative cultures before transitioning to OPAT.",
        why:  "Empiric long-course IV is high-failure; pathogen-directed therapy is mandatory for organism-specific duration." },
      { sev: "trigger",
        what: "Lifelong oral suppression when a prosthetic graft cannot be removed or patient is non-operative.",
        why:  "Retained infected hardware demands chronic suppression to prevent recrudescence and rupture." },
      { sev: "consider",
        what: "Repeat CT angiography at 2 and 6 weeks to document aneurysm stability.",
        why:  "Expansion or new pseudoaneurysm signals failure and demands urgent surgical re-evaluation." },
    ],
    access: "PICC",
    agents: [
      { name: "Cefazolin",          route: "IV q8h or continuous infusion via pump",
        dose: "2 g IV q8h (or 6 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "MSSA mycotic aneurysm; pair with surgical resection for cure." },
      { name: "Vancomycin (IV)",    route: "IV q8–12h",
        dose: "Dose by AUC — target AUC/MIC 400–600",
        monitoring: "Weekly AUC + CMP",
        note: "MRSA mycotic aneurysm; AUC-guided dosing required for OPAT." },
      { name: "Daptomycin",         route: "IV q24h",
        dose: "8–10 mg/kg IV q24h",
        monitoring: "Weekly CK + CMP",
        note: "MRSA or VRE mycotic aneurysm; q24h is OPAT-ideal." },
      { name: "Ceftriaxone",        route: "IV q24h",
        dose: "2 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "Streptococcal, HACEK, or susceptible-Enterobacterales mycotic aneurysm; OPAT-ideal cadence." },
      { name: "Ertapenem",          route: "IV q24h",
        dose: "1 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "ESBL Enterobacterales mycotic aneurysm; q24h is OPAT-ideal." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + BMP + LFT + drug levels; surveillance BCx if fever recurs.",
        why:  "Cytopenias and AKI from long courses; recurrent bacteremia signals graft re-seeding." },
      { sev: "trigger",
        what: "CT angiography at 2 and 6 weeks; vascular surgery re-evaluation if aneurysm expands.",
        why:  "Documents stability; expansion or new pseudoaneurysm prompts urgent surgical intervention." },
    ],
  },

  /* === Device-related vascular infection ====================== */
  "device-vascular": {
    eligibility: [
      { sev: "required",
        what: "Removable device removed (line out, AV graft excised, IVD explanted) before OPAT begins.",
        why:  "Retained hardware drives 30-day relapse; source control is non-negotiable for outpatient course." },
      { sev: "required",
        what: "Endocarditis excluded by TEE for staphylococcal or fungal device-related infection.",
        why:  "Endovascular focus upgrades duration to 4–6 weeks; TEE rules out occult vegetation." },
      { sev: "required",
        what: "Documented blood culture clearance before transition to home OPAT therapy.",
        why:  "Persistent bacteremia defines complicated infection; never finish at home with positive cultures." },
      { sev: "trigger",
        what: "Add rifampin PO when hardware cannot be removed (retained CIED, LVAD, vascular graft).",
        why:  "Rifampin penetrates biofilm; never monotherapy due to rapid resistance emergence." },
      { sev: "trigger",
        what: "ID consult to follow OPAT course weekly for device-related infections.",
        why:  "ID involvement improves echo completion, duration adherence, and relapse detection." },
    ],
    access: "PICC",
    agents: [
      { name: "Cefazolin",          route: "IV q8h or continuous infusion via pump",
        dose: "2 g IV q8h (or 6 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "MSSA device-related bacteremia; pair with rifampin PO if hardware retained." },
      { name: "Vancomycin (IV)",    route: "IV q8–12h",
        dose: "Dose by AUC — target AUC/MIC 400–600",
        monitoring: "Weekly AUC + CMP",
        note: "MRSA device-related infection; AUC-guided; pair with rifampin PO if retained." },
      { name: "Daptomycin",         route: "IV q24h",
        dose: "8–10 mg/kg IV q24h",
        monitoring: "Weekly CK + CMP",
        note: "MRSA or VRE device-related infection; q24h is OPAT-ideal." },
      { name: "Ceftriaxone",        route: "IV q24h",
        dose: "2 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "Streptococcal or susceptible-Enterobacterales device-related infection; OPAT-ideal cadence." },
      { name: "Cefepime",           route: "IV q8h or extended infusion via pump",
        dose: "2 g IV q8h",
        monitoring: "Weekly CBC + CMP",
        note: "Pseudomonas or AmpC device-related infection; extended infusion improves PK/PD." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + BMP + LFT + drug levels through the 14-day course.",
        why:  "Catches AKI, hepatotoxicity, and cytopenias early; baseline plus weekly is the contract." },
      { sev: "required",
        what: "Repeat BCx clearance documented before OPAT; clinical check-in at week 1.",
        why:  "30-day relapse is dominant failure mode for staphylococcal device-related infections." },
      { sev: "trigger",
        what: "TEE or PET-CT if fevers recur or BCx re-positive during OPAT course.",
        why:  "Identifies occult endocarditis, septic emboli, or persistent device-related focus." },
    ],
  },

  /* === Acute cholangitis · post-ERCP drainage ================== */
  cholangitis: {
    eligibility: [
      { sev: "required",
        what: "Biliary drainage achieved — ERCP, PTC, or surgical decompression — before OPAT transition.",
        why:  "Antibiotics alone fail obstructed biliary tree; drainage is the cure step." },
      { sev: "required",
        what: "Clinical and biochemical response (defervescence, falling bilirubin) before discharge to OPAT.",
        why:  "Tokyo Guidelines anchor 4–7 day course on drainage adequacy; non-response signals retained stone." },
      { sev: "trigger",
        what: "Blood and bile cultures targeted before transition; narrow once organism identified.",
        why:  "Empiric broad-spectrum at home is high-failure; pathogen-directed shortens course and toxicity." },
    ],
    access: "midline",
    agents: [
      { name: "Ceftriaxone",        route: "IV q24h",
        dose: "2 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "Streptococci + susceptible Enterobacterales; pair with metronidazole PO for anaerobic cover." },
      { name: "Piperacillin-tazobactam", route: "Continuous or extended infusion via pump",
        dose: "4.5 g IV q8h extended (or 13.5 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "High-risk biliary sepsis or healthcare-exposed; pump logistics for time-dependent killing." },
      { name: "Ertapenem",          route: "IV q24h",
        dose: "1 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "ESBL Enterobacterales; q24h is OPAT-ideal among carbapenems." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + CMP + LFT through the 4–7 day course; bilirubin trend documents drainage adequacy.",
        why:  "Rising LFTs signal retained stone or stricture failure prompting repeat ERCP." },
      { sev: "trigger",
        what: "Repeat imaging (US or MRCP) if fever recurs or LFTs plateau.",
        why:  "Re-accumulation or missed stone is the dominant relapse pattern requiring repeat drainage." },
    ],
  },

  /* === Pleural empyema · post-drainage IV tail ================= */
  empyema: {
    eligibility: [
      { sev: "required",
        what: "Pleural drainage completed — chest tube placement or VATS — before OPAT transition.",
        why:  "Antibiotics alone fail loculated empyema; drainage drives bacterial-load reduction and lung re-expansion." },
      { sev: "required",
        what: "Imaging shows resolving collection and lung re-expansion before discharge.",
        why:  "Trapped lung or persistent collection signals incomplete source control and need for VATS." },
      { sev: "trigger",
        what: "Intrapleural tPA/DNase course (MIST-2) completed when fibrinopurulent stage encountered.",
        why:  "MIST-2 improved drainage and reduced surgical referral; complete the lytic course before OPAT." },
    ],
    access: "PICC",
    agents: [
      { name: "Ampicillin-sulbactam", route: "IV q6h",
        dose: "3 g IV q6h",
        monitoring: "Weekly CBC + CMP",
        note: "Community-acquired empyema with anaerobic + streptococcal cover; standard backbone." },
      { name: "Ceftriaxone",        route: "IV q24h",
        dose: "2 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "Pair with metronidazole PO for anaerobes; OPAT-ideal cadence." },
      { name: "Piperacillin-tazobactam", route: "Continuous or extended infusion via pump",
        dose: "4.5 g IV q8h extended (or 13.5 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "Healthcare-associated or polymicrobial; pump logistics for time-dependent killing." },
      { name: "Vancomycin (IV)",    route: "IV q8–12h",
        dose: "Dose by AUC — target AUC/MIC 400–600",
        monitoring: "Weekly AUC + CMP",
        note: "MRSA empyema; combine with Gram-negative agent for polymicrobial cover." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + BMP + LFT + drug levels through the 2–4 week course.",
        why:  "Long IV courses select cytopenias and AKI; baseline plus weekly is the contract." },
      { sev: "trigger",
        what: "Repeat chest imaging at 2 and 4 weeks; thoracic surgery referral if collection persists.",
        why:  "Persistent collection or trapped lung mandates VATS decortication for cure." },
    ],
  },

  /* === Hospital-acquired pneumonia · post-discharge IV tail ===== */
  hap: {
    eligibility: [
      { sev: "required",
        what: "Clinical and radiographic response demonstrated before transition to outpatient IV completion.",
        why:  "BALANCE supports 7-day course; OPAT scenario reserved for refractory or multi-pathogen cases." },
      { sev: "required",
        what: "Sputum or bronchoscopic pathogen identified before OPAT transition.",
        why:  "Empiric broad-spectrum at home is high-failure; pathogen-directed shortens course and toxicity." },
      { sev: "consider",
        what: "Most HAP completes inpatient — OPAT IV tail is uncommon and reserved for resistant pathogen cases.",
        why:  "Standard 7-day course typically finishes before discharge; document rationale when extending." },
    ],
    access: "midline",
    agents: [
      { name: "Piperacillin-tazobactam", route: "Continuous or extended infusion via pump",
        dose: "4.5 g IV q8h extended (or 13.5 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "Pseudomonas + Enterobacterales cover; pump logistics for time-dependent killing." },
      { name: "Cefepime",           route: "IV q8h extended infusion via pump",
        dose: "2 g IV q8h",
        monitoring: "Weekly CBC + CMP",
        note: "Pseudomonas or AmpC HAP; extended infusion improves PK/PD." },
      { name: "Meropenem",          route: "IV q8h",
        dose: "1 g IV q8h",
        monitoring: "Weekly CBC + CMP",
        note: "ESBL or resistant Gram-negative HAP; extended infusion preferred." },
      { name: "Vancomycin (IV)",    route: "IV q8–12h",
        dose: "Dose by AUC — target AUC/MIC 400–600",
        monitoring: "Weekly AUC + CMP",
        note: "MRSA HAP; AUC-guided dosing reduces nephrotoxicity in pump-and-discharge logistics." },
      { name: "Linezolid",          route: "IV/PO q12h",
        dose: "600 mg IV/PO q12h",
        monitoring: "Weekly CBC",
        note: "Pulmonary MRSA alternative; 100% bioavailability enables IV→PO step-down." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + BMP + LFT + drug levels through completion of the short IV tail.",
        why:  "Cytopenias and AKI dominate toxicity; routine surveillance catches them early." },
      { sev: "trigger",
        what: "Repeat chest imaging if clinical worsening or persistent fever during OPAT.",
        why:  "Non-response signals resistant organism or empyema requiring re-evaluation." },
    ],
  },

  /* === Aspiration pneumonia · necrotizing / lung abscess ======== */
  aspiration: {
    eligibility: [
      { sev: "required",
        what: "Necrotizing component or lung abscess physiology documented on imaging before extended IV.",
        why:  "Simple aspiration completes inpatient; extended IV reserved for cavitary or abscess physiology." },
      { sev: "required",
        what: "Drainage of large abscesses (> 5 cm) completed when feasible before OPAT.",
        why:  "Large abscesses fail antibiotic-alone therapy; percutaneous drainage drives cure." },
      { sev: "trigger",
        what: "IV→PO step-down at 2–3 weeks for stable patients on high-bioavailability oral regimen.",
        why:  "Shortens line dwell and CRBSI risk; total course often 4–8 weeks with PO completion." },
    ],
    access: "PICC",
    agents: [
      { name: "Ampicillin-sulbactam", route: "IV q6h",
        dose: "3 g IV q6h",
        monitoring: "Weekly CBC + CMP",
        note: "Community-acquired aspiration with oral-flora anaerobic cover; standard backbone." },
      { name: "Piperacillin-tazobactam", route: "Continuous or extended infusion via pump",
        dose: "4.5 g IV q8h extended (or 13.5 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "Healthcare-associated or severe necrotizing; pump logistics for time-dependent killing." },
      { name: "Ceftriaxone",        route: "IV q24h",
        dose: "2 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "Pair with metronidazole PO for anaerobes; OPAT-ideal cadence." },
      { name: "Ertapenem",          route: "IV q24h",
        dose: "1 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "ESBL Enterobacterales or no Pseudomonas risk; q24h is OPAT-ideal." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + BMP + LFT + drug levels through the 2–4 week course.",
        why:  "Long IV courses select cytopenias and AKI; baseline plus weekly is the contract." },
      { sev: "trigger",
        what: "Repeat chest imaging at 4 weeks documenting cavity resolution; bronchoscopy if non-response.",
        why:  "Cavity closure is the cure endpoint; persistence prompts evaluation for endobronchial obstruction." },
    ],
  },

  /* === Spontaneous bacterial peritonitis · post-discharge tail == */
  sbp: {
    eligibility: [
      { sev: "required",
        what: "Diagnostic paracentesis confirmed SBP (PMN ≥ 250) and pathogen targeted by culture data.",
        why:  "SBP diagnosis demands ascites cell count; empiric extended IV without diagnosis is inappropriate." },
      { sev: "consider",
        what: "Standard 5-day course typically completes inpatient; OPAT for SBP is rare and case-specific.",
        why:  "Short-course efficacy proven; document rationale when extending to outpatient IV." },
      { sev: "trigger",
        what: "Albumin 1.5 g/kg day 1 then 1 g/kg day 3 reduces hepatorenal syndrome in selected patients.",
        why:  "Sort 1999 trial: albumin reduces mortality in SBP with renal dysfunction or bilirubin > 4." },
    ],
    access: "midline",
    agents: [
      { name: "Ceftriaxone",        route: "IV q24h",
        dose: "2 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "Standard SBP backbone; OPAT-ideal cadence on midline for short tail." },
      { name: "Ertapenem",          route: "IV q24h",
        dose: "1 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "ESBL Enterobacterales or healthcare-associated SBP; q24h OPAT-ideal." },
      { name: "Piperacillin-tazobactam", route: "Continuous or extended infusion via pump",
        dose: "4.5 g IV q8h extended (or 13.5 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "Healthcare-associated or nosocomial SBP requiring broader cover; pump logistics required." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + CMP + LFT through the short IV tail; daily renal function early.",
        why:  "Hepatorenal syndrome is the dominant complication; rising creatinine prompts albumin and re-evaluation." },
      { sev: "trigger",
        what: "Repeat paracentesis at 48 h if no clinical response; check PMN drop ≥ 25%.",
        why:  "Inadequate PMN drop signals resistant organism or secondary peritonitis requiring surgical evaluation." },
    ],
  },

  /* === Complicated diverticulitis · post-drainage =============== */
  diverticulitis: {
    eligibility: [
      { sev: "required",
        what: "Abscess drained percutaneously or surgically before OPAT transition.",
        why:  "STOP-IT validates 4-day post-source-control course; antibiotics alone fail undrained collections." },
      { sev: "required",
        what: "Clinical response demonstrated — defervescence, falling WBC — before discharge.",
        why:  "Non-response signals retained focus or perforation requiring surgical re-evaluation." },
      { sev: "trigger",
        what: "STOP-IT pathway — 4 days post-source-control non-inferior to longer courses.",
        why:  "Sawyer 2015 NEJM: fixed-duration post-drainage course matches clinically-guided longer therapy." },
    ],
    access: "midline",
    agents: [
      { name: "Piperacillin-tazobactam", route: "Continuous or extended infusion via pump",
        dose: "4.5 g IV q8h extended (or 13.5 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "Broad polymicrobial cover for complicated diverticulitis; pump logistics required." },
      { name: "Ertapenem",          route: "IV q24h",
        dose: "1 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "ESBL Enterobacterales or no Pseudomonas risk; q24h is OPAT-ideal." },
      { name: "Ceftriaxone",        route: "IV q24h",
        dose: "2 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "Pair with metronidazole PO for anaerobes; OPAT-ideal cadence for short tail." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + CMP through the short 4-day post-drainage course.",
        why:  "Short course but still IV; baseline plus weekly catches cytopenias and AKI." },
      { sev: "trigger",
        what: "Repeat CT imaging if fever recurs or WBC rises during OPAT.",
        why:  "Re-accumulation prompts repeat drainage; missed perforation requires urgent surgical evaluation." },
    ],
  },

  /* === Infected pancreatic necrosis · post-drainage ============= */
  pancreatic: {
    eligibility: [
      { sev: "required",
        what: "Source control via step-up approach — percutaneous drainage then minimally invasive necrosectomy.",
        why:  "PANTER (Dutch step-up) demonstrated lower mortality and morbidity vs primary open necrosectomy." },
      { sev: "required",
        what: "Pathogen identified from drainage cultures before transitioning to OPAT.",
        why:  "Empiric long-course IV at home is high-failure; pathogen-directed shortens course and toxicity." },
      { sev: "trigger",
        what: "ID + surgical + interventional radiology multidisciplinary follow-up through OPAT course.",
        why:  "Pancreatic necrosis is iterative source control; missed re-accumulation drives 30-day failure." },
    ],
    access: "PICC",
    agents: [
      { name: "Meropenem",          route: "IV q8h",
        dose: "1 g IV q8h",
        monitoring: "Weekly CBC + CMP",
        note: "Pancreatic penetration plus broad GNR + anaerobe cover; workhorse for infected necrosis." },
      { name: "Piperacillin-tazobactam", route: "Continuous or extended infusion via pump",
        dose: "4.5 g IV q8h extended (or 13.5 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "Alternative for susceptible organism; pump logistics for time-dependent killing." },
      { name: "Ertapenem",          route: "IV q24h",
        dose: "1 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "ESBL Enterobacterales without Pseudomonas; q24h is OPAT-ideal." },
      { name: "Vancomycin (IV)",    route: "IV q8–12h",
        dose: "Dose by AUC — target AUC/MIC 400–600",
        monitoring: "Weekly AUC + CMP",
        note: "Enterococcal or MRSA component; combine with Gram-negative agent." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + BMP + LFT + drug levels through the 2–4 week course; nutritional status trended.",
        why:  "Long IV courses select toxicity; pancreatic necrosis catabolism demands nutritional surveillance." },
      { sev: "trigger",
        what: "Repeat CT at 2 and 4 weeks documenting collection resolution; repeat drainage if re-accumulation.",
        why:  "Iterative source control is the rule; missed re-accumulation drives sepsis recurrence." },
    ],
  },

  /* === PD peritonitis · ISPD 2022 IV adjunct course ============ */
  "pd-peritonitis": {
    eligibility: [
      { sev: "required",
        what: "Intraperitoneal antibiotics initiated as first-line per ISPD 2022; IV adjunct when bacteremic or severe.",
        why:  "IP route achieves highest peritoneal levels; IV reserved for bacteremic or refractory cases." },
      { sev: "required",
        what: "PD effluent cultures sent before therapy; targeted regimen at 48–72 h based on identification.",
        why:  "Empiric broad cover is appropriate initially; failure to narrow drives resistance and tube loss." },
      { sev: "trigger",
        what: "Catheter removal for refractory, fungal, or relapsing peritonitis per ISPD criteria.",
        why:  "Antibiotic salvage fails biofilm-laden catheters; timely removal preserves peritoneal membrane function." },
      { sev: "consider",
        what: "S. aureus or Pseudomonas peritonitis — extend total course to 3 weeks per ISPD.",
        why:  "Higher relapse rates with these pathogens justify extended course beyond standard 2-week regimen." },
    ],
    access: "midline",
    agents: [
      { name: "Cefazolin",          route: "Intraperitoneal or IV q24h",
        dose: "15–20 mg/kg IP q24h in one exchange",
        monitoring: "Weekly CBC + CMP",
        note: "First-line Gram-positive cover per ISPD 2022; combine with ceftazidime for Gram-negative." },
      { name: "Ceftazidime",        route: "Intraperitoneal or IV q24h",
        dose: "1–1.5 g IP q24h in one exchange",
        monitoring: "Weekly CBC + CMP",
        note: "First-line Gram-negative cover per ISPD 2022; pair with cefazolin for empiric regimen." },
      { name: "Vancomycin (IV)",    route: "Intraperitoneal q5d or IV",
        dose: "15–30 mg/kg IP q5d (loading)",
        monitoring: "Weekly AUC + CMP",
        note: "MRSA risk or β-lactam allergy; IP dosing follows residual renal function." },
      { name: "Cefepime",           route: "IV q12h or IP",
        dose: "1 g IP q24h or 2 g IV q12h",
        monitoring: "Weekly CBC + CMP",
        note: "Pseudomonas PD peritonitis; extend course to 3 weeks per ISPD." },
    ],
    monitoring: [
      { sev: "required",
        what: "Effluent cell count at days 3 and 5; weekly CBC + CMP + drug levels through course.",
        why:  "Persistent cloudy effluent signals failure; effluent < 100 PMN by day 5 supports response." },
      { sev: "trigger",
        what: "Repeat effluent culture if cloudy at day 5; consider catheter removal for relapse.",
        why:  "Refractory peritonitis (no response by day 5) mandates catheter removal to preserve membrane." },
    ],
  },

  /* === Complicated pyelonephritis · IV tail to OPAT ============ */
  pyelo: {
    eligibility: [
      { sev: "required",
        what: "Source control addressed — obstruction relieved, stones removed, abscess drained when present.",
        why:  "Antibiotics alone fail obstructed urinary tract; urology consult before committing to extended IV." },
      { sev: "required",
        what: "Pathogen identified by urine and/or blood cultures before transitioning to OPAT.",
        why:  "Empiric extended IV at home is high-failure; pathogen-directed shortens course and toxicity." },
      { sev: "trigger",
        what: "IV→PO step-down for fluoroquinolone-susceptible Enterobacterales after clinical response.",
        why:  "High oral bioavailability of FQs and TMP-SMX supports early IV→PO transition in stable patients." },
    ],
    access: "midline",
    agents: [
      { name: "Ceftriaxone",        route: "IV q24h",
        dose: "1–2 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "Susceptible Enterobacterales; OPAT-ideal cadence on midline for short course." },
      { name: "Ertapenem",          route: "IV q24h",
        dose: "1 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "ESBL Enterobacterales; q24h is OPAT-ideal among carbapenems." },
      { name: "Cefepime",           route: "IV q12h",
        dose: "2 g IV q12h",
        monitoring: "Weekly CBC + CMP",
        note: "Pseudomonas or AmpC pyelonephritis; extended infusion improves PK/PD." },
      { name: "Aztreonam",          route: "IV q8h",
        dose: "2 g IV q8h",
        monitoring: "Weekly CBC + CMP",
        note: "Severe β-lactam allergy; Gram-negative only — confirm susceptibility before OPAT." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + CMP + drug levels through the 7–14 day course.",
        why:  "Cytopenias and AKI dominate toxicity; baseline plus weekly is the contract." },
      { sev: "trigger",
        what: "Repeat imaging if fever or flank pain persists beyond 72 h on appropriate therapy.",
        why:  "Missed obstruction, abscess, or emphysematous pyelonephritis prompts urgent urology re-evaluation." },
    ],
  },

  /* === Complicated CAUTI · catheter-associated UTI ============= */
  cauti: {
    eligibility: [
      { sev: "required",
        what: "Catheter removed or exchanged before initiating definitive therapy when feasible.",
        why:  "IDSA 2010: biofilm-laden catheters drive relapse; removal at therapy start improves cure rates." },
      { sev: "required",
        what: "Pathogen identified by post-exchange urine culture before extended IV course.",
        why:  "Empiric broad-spectrum at home is high-failure; pathogen-directed shortens course and toxicity." },
      { sev: "trigger",
        what: "ID consult for resistant Gram-negatives (ESBL, CRE, DTR-Pseudomonas) requiring OPAT.",
        why:  "Resistant pathogens demand careful agent selection and monitoring; ID oversight improves outcomes." },
    ],
    access: "midline",
    agents: [
      { name: "Ertapenem",          route: "IV q24h",
        dose: "1 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "ESBL Enterobacterales; q24h is OPAT-ideal among carbapenems." },
      { name: "Cefepime",           route: "IV q8h extended infusion via pump",
        dose: "2 g IV q8h",
        monitoring: "Weekly CBC + CMP",
        note: "Pseudomonas or AmpC CAUTI; extended infusion improves PK/PD." },
      { name: "Ceftriaxone",        route: "IV q24h",
        dose: "1–2 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "Susceptible Enterobacterales; OPAT-ideal cadence for short course." },
      { name: "Vancomycin (IV)",    route: "IV q12h",
        dose: "Dose by AUC — target AUC/MIC 400–600",
        monitoring: "Weekly AUC + CMP",
        note: "Enterococcal CAUTI; AUC-guided dosing reduces nephrotoxicity." },
      { name: "Meropenem",          route: "IV q8h",
        dose: "1 g IV q8h",
        monitoring: "Weekly CBC + CMP",
        note: "ESBL with Pseudomonas risk or severely ill patient; extended infusion preferred." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + CMP + drug levels through the 7–14 day course.",
        why:  "Cytopenias and AKI dominate toxicity; baseline plus weekly is the contract." },
      { sev: "trigger",
        what: "Repeat urine culture if fever persists or recurs; repeat imaging for upper-tract involvement.",
        why:  "Persistent positivity signals retained catheter biofilm or upper-tract focus requiring re-evaluation." },
    ],
  },

  /* === Healthcare-associated ventriculitis · post-EVD ========== */
  ventriculitis: {
    eligibility: [
      { sev: "required",
        what: "EVD removed, exchanged, or externalized when feasible per IDSA 2017 guidance.",
        why:  "Biofilm-laden EVD drives relapse; device exchange at therapy start improves CSF sterilization." },
      { sev: "required",
        what: "CSF pathogen identified before extended course; sterilization of CSF documented before OPAT.",
        why:  "Empiric long IV at home is high-failure; CSF sterility is the OPAT-transition gate." },
      { sev: "consider",
        what: "Pure OPAT often not viable — most courses complete inpatient or in skilled-nursing facility.",
        why:  "Intraventricular dosing, frequent neuro checks, and CSF monitoring difficult outside structured care." },
      { sev: "trigger",
        what: "ID + neurosurgery co-management mandatory through entire course.",
        why:  "Ventriculitis is highest-stakes CNS OPAT; co-management improves CSF sterilization and outcomes." },
    ],
    access: "PICC",
    agents: [
      { name: "Meropenem",          route: "IV q8h (CNS dosing)",
        dose: "2 g IV q8h",
        monitoring: "Weekly CBC + CMP",
        note: "Broad Gram-negative + anaerobic cover; CNS dose is double the standard." },
      { name: "Vancomycin (IV)",    route: "IV q8–12h plus intraventricular",
        dose: "AUC-guided IV + 5–20 mg IVT q24h",
        monitoring: "Weekly AUC + CSF levels",
        note: "MRSA or coag-neg staph ventriculitis; intraventricular dosing via EVD per IDSA 2017." },
      { name: "Cefepime",           route: "IV q8h",
        dose: "2 g IV q8h",
        monitoring: "Weekly CBC + CMP",
        note: "Pseudomonas or AmpC ventriculitis; pair with intraventricular agent as needed." },
      { name: "Ceftazidime",        route: "IV q8h",
        dose: "2 g IV q8h",
        monitoring: "Weekly CBC + CMP",
        note: "Pseudomonas ventriculitis; alternative to cefepime when susceptibility documented." },
      { name: "Daptomycin",         route: "IV q24h",
        dose: "10 mg/kg IV q24h",
        monitoring: "Weekly CK + CMP",
        note: "VRE or MRSA salvage; poor CSF penetration — combine with intraventricular agent." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + BMP + LFT + drug levels; serial CSF sampling documenting sterility.",
        why:  "CSF sterilization is the cure endpoint; ongoing positivity prompts regimen escalation." },
      { sev: "trigger",
        what: "Repeat brain MRI for clinical deterioration; neurosurgery re-evaluation for hydrocephalus.",
        why:  "Re-accumulation, ventriculomegaly, or new lesion mandates urgent neurosurgical intervention." },
    ],
  },

  /* === Lemierre syndrome · F. necrophorum septic thrombophlebitis */
  lemierre: {
    eligibility: [
      { sev: "required",
        what: "Imaging confirms internal jugular vein septic thrombophlebitis before extended IV course.",
        why:  "Diagnostic anchor for Lemierre; CT or US documenting IJ thrombosis defines the syndrome." },
      { sev: "required",
        what: "Septic pulmonary emboli evaluation completed before OPAT transition.",
        why:  "Pulmonary embolic burden modifies prognosis and may require additional drainage or surgery." },
      { sev: "trigger",
        what: "Anticoagulation decision documented case-by-case per ID + hematology input.",
        why:  "No RCT guidance; anticoagulation considered for clot propagation or persistent fever despite antibiotics." },
      { sev: "trigger",
        what: "Drain any metastatic abscess (lung, joint, liver) before extended IV course.",
        why:  "Metastatic seeding is common; undrained foci drive relapse and prolong fever." },
    ],
    access: "PICC",
    agents: [
      { name: "Piperacillin-tazobactam", route: "Continuous or extended infusion via pump",
        dose: "4.5 g IV q8h extended (or 13.5 g/24 h CI)",
        monitoring: "Weekly CBC + CMP",
        note: "Broad cover including F. necrophorum and oropharyngeal flora; pump logistics required." },
      { name: "Ampicillin-sulbactam", route: "IV q6h",
        dose: "3 g IV q6h",
        monitoring: "Weekly CBC + CMP",
        note: "Standard backbone with anaerobic cover; alternative to pip-tazo." },
      { name: "Meropenem",          route: "IV q8h",
        dose: "1 g IV q8h",
        monitoring: "Weekly CBC + CMP",
        note: "Severe cases or β-lactamase-producing strains; broadest reasonable workhorse." },
      { name: "Metronidazole",      route: "IV/PO q8h",
        dose: "500 mg IV/PO q8h",
        monitoring: "Weekly CMP",
        note: "Anaerobic adjunct; combine with β-lactam for synergy against F. necrophorum." },
      { name: "Ceftriaxone",        route: "IV q24h",
        dose: "2 g IV q24h",
        monitoring: "Weekly CBC + CMP",
        note: "Pair with metronidazole; OPAT-ideal cadence for the long 4–6 week course." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + BMP + LFT + drug levels through the 4–6 week course.",
        why:  "Long IV courses select cytopenias and AKI; baseline plus weekly is the contract." },
      { sev: "trigger",
        what: "Repeat neck imaging at 4 weeks; chest imaging for new septic emboli or empyema.",
        why:  "Thrombus resolution and embolic burden track response; new findings prompt re-evaluation." },
    ],
  },

  /* === Persistent MRSA bacteremia (ARREST salvage) ============ */
  "persistent-mrsa": {
    eligibility: [
      { sev: "required",
        what: "MRSA bacteremia persistent > 7 days on appropriate vancomycin with confirmed source control.",
        why:  "Persistence defines treatment failure; salvage regimen demands the ARREST or alternative combination strategy." },
      { sev: "required",
        what: "TEE, PET-CT, and ophthalmology completed to identify occult metastatic focus.",
        why:  "Occult endocarditis, septic emboli, or endophthalmitis drive persistence; surgery often required." },
      { sev: "required",
        what: "ID consult mandatory; weekly OPAT follow-up documented before transition.",
        why:  "Persistent MRSA bacteremia is the highest-stakes OPAT scenario; ID oversight non-negotiable." },
      { sev: "trigger",
        what: "Geriak ARREST regimen — daptomycin plus ceftaroline — preferred salvage (JAMA Intern Med 2019).",
        why:  "Trial halted early for mortality reduction; combination overcomes vancomycin failure." },
      { sev: "consider",
        what: "Source control completed (line removal, valve surgery, abscess drainage) before OPAT discharge.",
        why:  "Retained focus drives ongoing positivity; antibiotics alone cannot rescue uncontrolled source." },
    ],
    access: "PICC",
    agents: [
      { name: "Daptomycin",         route: "IV q24h",
        dose: "10 mg/kg IV q24h",
        monitoring: "Weekly CK + CMP",
        note: "ARREST backbone; high-dose for persistent MRSA bacteremia. Hold for myopathy." },
      { name: "Ceftaroline",        route: "IV q8h",
        dose: "600 mg IV q8h",
        monitoring: "Weekly CBC + CMP",
        note: "ARREST partner; β-lactam with MRSA activity. Pair with daptomycin for synergy." },
      { name: "Vancomycin (IV)",    route: "IV q8–12h",
        dose: "Dose by AUC — target AUC/MIC 400–600",
        monitoring: "Weekly AUC + CMP",
        note: "Comparator arm; persistent MRSA on vanco is failure — transition to ARREST." },
      { name: "Trimethoprim-sulfamethoxazole", route: "IV q6–8h or PO",
        dose: "8–12 mg/kg/day TMP IV/PO div q6–8h",
        monitoring: "Weekly CMP + CBC",
        note: "Salvage alternative; monitor for hyperkalemia, AKI, and marrow suppression." },
    ],
    monitoring: [
      { sev: "required",
        what: "Weekly CBC + BMP + LFT + CK + AUC vanco if dual-glycopeptide regimen.",
        why:  "Daptomycin myopathy and AKI dominate toxicity; CK trend is the early warning signal." },
      { sev: "required",
        what: "Documented BCx clearance and clinical check-in at week 1 and week 2.",
        why:  "Re-positivity in persistent MRSA mandates surgical re-evaluation and regimen escalation." },
      { sev: "trigger",
        what: "PET-CT or repeat TEE if fevers recur or BCx re-positive during OPAT.",
        why:  "Identifies new metastatic focus, valve vegetation, or septic thrombus driving persistence." },
    ],
  },

};

/* Lookup helper — used by OPATBlock. Returns null for syndromes without
   an authored profile (oral-only, supportive care, etc.). Mirrors the
   diagnostics / monitoring helpers for accessor consistency. */
function getOPATForSyndrome(synId) {
  return OPAT_PROFILES[synId] || null;
}

/* Audit helper — every agents[].name in every profile must round-trip
   to a FORMULARY canonical name. Drift here is a prescribing bug
   (the engine cannot dose what the profile names). */
function getFormularyValidationErrors() {
  const errors = [];
  for(const synId of Object.keys(OPAT_PROFILES)) {
    const profile = OPAT_PROFILES[synId];
    if(!Array.isArray(profile.agents)) continue;
    for(let i = 0; i < profile.agents.length; i++) {
      const ag = profile.agents[i];
      if(!_FORMULARY_NAMES.has(ag.name)) {
        errors.push(`[${synId}].agents[${i}].name "${ag.name}" not in FORMULARY`);
      }
    }
  }
  return errors;
}

export { OPAT_PROFILES, getOPATForSyndrome, getFormularyValidationErrors };
