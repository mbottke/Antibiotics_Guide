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
