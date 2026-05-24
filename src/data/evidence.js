/* data · guidelines, references, trials, durations, version stamp.
   Inpatient Antibiotic Guide — module graph documented in README.md. */
/* ev: rct | guide | obs ; base/max in days for the bar; ext = what extends it */
const DURATIONS = [
  { group:"Respiratory", rows:[
    { dx:"Community-acquired pneumonia", base:5, max:5, days:"5", ev:"rct", trial:"", ext:"Minimum 5 d; stop once afebrile 48–72 h and clinically stable. Extend only for complications — empyema, abscess, or a resistant/non-fermenting organism. Procalcitonin may support stopping but does not gate initiation." },
    { dx:"HAP / VAP", base:7, max:7, days:"7", ev:"rct", trial:"", ext:"7 d even for non-fermenting GNR (Pseudomonas, Acinetobacter) if responding — no mortality penalty vs longer courses. Extend only for empyema, abscess, or an undrained focus." },
    { dx:"Aspiration pneumonia", base:5, max:7, days:"5–7", ev:"guide", trial:"", ext:"True aspiration pneumonitis often needs no antibiotics. Lung abscess or necrotizing pneumonia: extend to weeks, guided by radiographic resolution." },
    { dx:"Lung abscess / necrotizing pneumonia", base:21, max:42, days:"3–6 wk", ev:"obs", trial:"", ext:"Continue until the cavity has resolved or stabilized on imaging; oral step-down once stable. Drainage if large or not responding." },
    { dx:"Empyema / complicated parapneumonic effusion", base:14, max:28, days:"2–4 wk", ev:"guide", trial:"", ext:"Duration follows source control — chest-tube drainage ± intrapleural tPA/DNase, or VATS. Antibiotics alone do not sterilize an undrained space." },
    { dx:"Legionella pneumonia", base:7, max:10, days:"7–10", ev:"guide", trial:"", ext:"Up to 14–21 d in immunocompromised or severe disease; fluoroquinolone or azithromycin." },
    { dx:"COPD exacerbation (bacterial)", base:5, max:5, days:"5", ev:"rct", trial:"", ext:"5 d for those meeting Anthonisen criteria; antibiotics not indicated for all exacerbations." },
  ]},
  { group:"Bloodstream / cardiac", rows:[
    { dx:"Gram-negative bacteremia (uncomplicated)", base:7, max:7, days:"7", ev:"rct", trial:"BALANCE", ext:"7 d equals 14 d in stable responders with source control (BALANCE, NEJM 2025). Excludes endovascular source, undrained focus, and non-fermenters without control." },
    { dx:"S. aureus bacteremia (uncomplicated)", base:14, max:14, days:"14", ev:"guide", trial:"", ext:"Clock starts at the first negative blood culture. Requires echocardiography, documented clearance, removable focus controlled, and no metastatic seeding. ID consultation improves survival." },
    { dx:"S. aureus bacteremia (complicated)", base:28, max:42, days:"4–6 wk", ev:"guide", trial:"", ext:"Endocarditis, metastatic foci, prosthetic material, or persistent bacteremia >72 h. 6 wk for endocarditis or vertebral involvement." },
    { dx:"Coagulase-negative staph bacteremia", base:7, max:14, days:"5–14", ev:"obs", trial:"", ext:"Often a contaminant — require ≥2 positive sets or a retained line. With a removable catheter pulled: 5–7 d; with retained hardware, longer." },
    { dx:"Enterococcal bacteremia", base:7, max:14, days:"7–14", ev:"obs", trial:"", ext:"Uncomplicated catheter/urinary source 7–14 d after control; endocarditis evaluation if a valve, prosthesis, or persistent positives." },
    { dx:"Candidemia (scope note)", base:14, max:14, days:"≥14", ev:"guide", trial:"", ext:"Antifungal — see a dedicated antifungal reference. ≥14 d from first negative culture; echinocandin first-line, remove the line, dilated fundoscopy. Listed here only because it co-occurs in line/neutropenic workups." },
    { dx:"CRBSI (catheter-related bloodstream infection)", base:7, max:14, days:"7–14", ev:"guide", trial:"", ext:"Remove the catheter. Duration counts from the first negative culture and depends on organism: uncomplicated CoNS 5–7 d, S. aureus ≥14 d, Candida ≥14 d, GNR 7–14 d." },
    { dx:"Infective endocarditis — native, viridans/strep", base:28, max:28, days:"2–4 wk", ev:"guide", trial:"", ext:"Penicillin-susceptible viridans/S. gallolyticus: 4 wk (2 wk with gentamicin synergy in selected uncomplicated cases)." },
    { dx:"Infective endocarditis — native, staph/enterococcus", base:42, max:42, days:"6 wk", ev:"guide", trial:"", ext:"6 wk for S. aureus and enterococcal native-valve disease. Partial oral completion is reasonable in stable, controlled left-sided IE (POET)." },
    { dx:"Infective endocarditis — prosthetic valve", base:42, max:42, days:"≥6 wk", ev:"guide", trial:"", ext:"≥6 wk; staphylococcal PVE adds rifampin plus gentamicin and frequently requires surgery." },
    { dx:"Lemierre syndrome", base:28, max:42, days:"4–6 wk", ev:"obs", trial:"", ext:"Septic thrombophlebitis of the internal jugular (Fusobacterium). Prolonged course; anticoagulation is individualized." },
  ]},
  { group:"Genitourinary", rows:[
    { dx:"Acute uncomplicated cystitis", base:3, max:5, days:"3–5", ev:"rct", trial:"", ext:"Nitrofurantoin 5 d, TMP-SMX 3 d, fosfomycin single dose. Fluoroquinolone-sparing. Do not treat asymptomatic bacteriuria outside pregnancy or pre-urologic procedures." },
    { dx:"Pyelonephritis / complicated UTI", base:5, max:7, days:"5–7", ev:"rct", trial:"", ext:"Fluoroquinolone 5–7 d, β-lactam 7 d, TMP-SMX 7–14 d. Bacteremic GNR UTI: 7 d in responders (BALANCE)." },
    { dx:"CAUTI", base:7, max:7, days:"7", ev:"guide", trial:"", ext:"7 d with prompt response; 10–14 d if delayed response. Remove or exchange the catheter — the device is the source." },
    { dx:"Acute bacterial prostatitis", base:14, max:28, days:"2–4 wk", ev:"guide", trial:"", ext:"Fluoroquinolone or TMP-SMX, chosen for prostatic penetration. 4–6 wk if evolving to chronic prostatitis." },
    { dx:"Perinephric / renal abscess", base:14, max:21, days:"2–3 wk", ev:"obs", trial:"", ext:"Drainage for collections >3–5 cm; duration guided by drainage adequacy and clinical/radiographic response." },
    { dx:"Epididymo-orchitis", base:10, max:14, days:"10–14", ev:"guide", trial:"", ext:"Coverage targets enteric GNR (older men) or N. gonorrhoeae/C. trachomatis (younger, sexually active)." },
  ]},
  { group:"Intra-abdominal", rows:[
    { dx:"Complicated intra-abdominal infection (source controlled)", base:4, max:4, days:"4", ev:"rct", trial:"STOP-IT", ext:"~4 d after adequate source control regardless of the older 7–10 d convention (STOP-IT). Longer only if source control is incomplete." },
    { dx:"Acute diverticulitis (uncomplicated)", base:0, max:5, days:"0–5", ev:"rct", trial:"", ext:"Antibiotics may be omitted in selected uncomplicated cases (AVOD, DIABOLO). Abscess >3–4 cm: drain. 4 d after control if complicated." },
    { dx:"Pyogenic liver abscess", base:14, max:42, days:"2–6 wk", ev:"obs", trial:"", ext:"Drain percutaneously and aspirate for culture. 2–3 wk IV then oral step-down; total duration guided by size and resolution on imaging." },
    { dx:"Spontaneous bacterial peritonitis", base:5, max:7, days:"5–7", ev:"guide", trial:"", ext:"Third-generation cephalosporin. Add albumin (1.5 g/kg day 1, 1 g/kg day 3) when creatinine >1, BUN >30, or bilirubin >4 — reduces renal failure and mortality." },
    { dx:"Acute cholangitis", base:4, max:7, days:"4–7", ev:"rct", trial:"", ext:"~4 d after biliary decompression (ERCP) achieves source control (Tokyo Guidelines). Bacteremic: complete by organism." },
    { dx:"Infected pancreatic necrosis", base:14, max:28, days:"2–4 wk", ev:"obs", trial:"", ext:"Delay intervention when possible; step-up drainage/debridement once walled off. Duration follows the procedure, not a fixed calendar." },
  ]},
  { group:"Skin, soft tissue & bone", rows:[
    { dx:"Cellulitis (uncomplicated)", base:5, max:6, days:"5–6", ev:"rct", trial:"", ext:"5–6 d in those improving; extend to ~10 d only if slow response. Elevate the limb and treat tinea/edema to prevent recurrence." },
    { dx:"Cutaneous abscess", base:0, max:7, days:"0–7", ev:"rct", trial:"", ext:"Incision and drainage is the treatment. Adjunctive TMP-SMX or clindamycin (5–7 d) improves cure for larger abscesses or surrounding cellulitis." },
    { dx:"Diabetic foot (soft tissue, mod/severe)", base:7, max:14, days:"1–2 wk", ev:"guide", trial:"", ext:"~1–2 wk after debridement; shorter than legacy courses (IWGDF/IDSA 2023). Soft tissue only — see osteomyelitis row if bone involved." },
    { dx:"Necrotizing soft-tissue infection", base:7, max:14, days:"variable", ev:"guide", trial:"", ext:"Continue until no further debridement is required and the patient is stable; typically until 48–72 h after the last operative debridement. Surgery — not antibiotics — drives outcome. Add clindamycin for toxin suppression in GAS/clostridial disease." },
    { dx:"Animal / human bite", base:5, max:14, days:"5–14", ev:"guide", trial:"", ext:"Prophylaxis 3–5 d for fresh high-risk wounds; established infection 5–14 d. Amoxicillin-clavulanate covers Pasteurella, Eikenella, and oral anaerobes." },
    { dx:"Septic bursitis", base:14, max:21, days:"2–3 wk", ev:"obs", trial:"", ext:"Often S. aureus; aspirate to confirm. Longer than cellulitis given the avascular bursal space." },
    { dx:"Osteomyelitis (native)", base:42, max:42, days:"6 wk", ev:"rct", trial:"OVIVA", ext:"≥6 wk; oral is non-inferior to IV after initial control (OVIVA). Clock starts at definitive debridement when surgical." },
    { dx:"Vertebral osteomyelitis / discitis", base:42, max:42, days:"6 wk", ev:"rct", trial:"", ext:"6 wk is non-inferior to 12 wk in pyogenic vertebral osteomyelitis (Bernard, Lancet 2015), provided the organism is identified and the patient responds." },
    { dx:"Spinal epidural abscess", base:42, max:56, days:"6–8 wk", ev:"obs", trial:"", ext:"Surgical decompression for neurologic deficit. Longer when associated vertebral osteomyelitis is present." },
    { dx:"Diabetic foot osteomyelitis", base:21, max:42, days:"3–6 wk", ev:"guide", trial:"", ext:"3 wk after minor amputation with a positive proximal bone margin; up to 6 wk if no resection (IWGDF/IDSA 2023). ~1 wk if all infected bone is resected." },
    { dx:"Septic arthritis (native)", base:14, max:28, days:"2–4 wk", ev:"guide", trial:"", ext:"Plus repeated joint drainage (arthrocentesis, arthroscopy, or arthrotomy). Gonococcal arthritis: 7–14 d. Longer for prosthetic joints." },
    { dx:"Prosthetic joint infection", base:42, max:84, days:"6–12 wk", ev:"guide", trial:"", ext:"DAIR or one-/two-stage exchange. Staphylococcal PJI with retained hardware adds rifampin; total course often 3 months. Biofilm is not sterilized by antibiotics alone." },
  ]},
  { group:"Central nervous system", rows:[
    { dx:"Bacterial meningitis — pneumococcal", base:10, max:14, days:"10–14", ev:"guide", trial:"", ext:"CNS dosing (e.g., ceftriaxone 2 g q12h, vancomycin to higher AUC). Adjunctive dexamethasone with/before the first dose in suspected pneumococcal disease." },
    { dx:"Bacterial meningitis — meningococcal", base:7, max:7, days:"7", ev:"guide", trial:"", ext:"7 d; arrange post-exposure prophylaxis for close contacts." },
    { dx:"Bacterial meningitis — H. influenzae", base:7, max:10, days:"7–10", ev:"guide", trial:"", ext:"7–10 d with CNS dosing." },
    { dx:"Bacterial meningitis — Listeria", base:21, max:28, days:"≥3 wk", ev:"guide", trial:"", ext:"≥21 d (often longer with rhombencephalitis or abscess); ampicillin ± gentamicin. Add ampicillin empirically in age >50 or impaired cell-mediated immunity." },
    { dx:"Brain abscess", base:42, max:56, days:"6–8 wk", ev:"obs", trial:"", ext:"Aspirate/excise lesions ≥2.5 cm for diagnosis and decompression. IV course then oral step-down with serial imaging." },
  ]},
  { group:"Other / toxin-mediated", rows:[
    { dx:"C. difficile infection (initial)", base:10, max:10, days:"10", ev:"guide", trial:"", ext:"Fidaxomicin preferred (IDSA/SHEA 2021) or oral vancomycin; metronidazole only if neither available. Recurrence: tapered/pulsed vancomycin or fidaxomicin; consider bezlotoxumab/FMT." },
    { dx:"Streptococcal toxic shock / GAS", base:14, max:14, days:"≥14", ev:"guide", trial:"", ext:"Penicillin plus clindamycin (toxin suppression); add IVIG in shock and pursue source control. Duration follows the focus." },
    { dx:"Streptococcal pharyngitis (GAS)", base:10, max:10, days:"10", ev:"guide", trial:"", ext:"Penicillin or amoxicillin 10 d for rheumatic-fever prevention (5 d clinically adequate for symptoms but shorter for prophylaxis aims)." },
    { dx:"Febrile neutropenia", base:7, max:14, days:"variable", ev:"guide", trial:"", ext:"Continue empiric coverage until ANC recovery and afebrile; tailor to any documented infection. Do not stop solely on a falling count if a source persists." },
  ]},
];

/* Bar scale derived from the data (floor 42 d) — never clips when a longer course is added. */
const DUR_MAX = Math.max(42, ...DURATIONS.flatMap(g => g.rows.map(r => r.max)));

/* Duration row → guideline registry id (provenance rendered in the Evidence column). */
const DUR_REF = {
  "Community-acquired pneumonia":"cap", "HAP / VAP":"hapvap", "Legionella pneumonia":"cap",
  "Gram-negative bacteremia (uncomplicated)":"balance",
  "S. aureus bacteremia (uncomplicated)":"ie", "S. aureus bacteremia (complicated)":"ie",
  "CRBSI (catheter-related bloodstream infection)":"crbsi_g",
  "Infective endocarditis — native, viridans/strep":"ie",
  "Infective endocarditis — native, staph/enterococcus":"ie",
  "Infective endocarditis — prosthetic valve":"ie",
  "Pyelonephritis / complicated UTI":"balance",
  "Complicated intra-abdominal infection (source controlled)":"stopit",
  "Acute diverticulitis (uncomplicated)":"avod",
  "Spontaneous bacterial peritonitis":"aasld",
  "Cellulitis (uncomplicated)":"ssti", "Cutaneous abscess":"ssti",
  "Necrotizing soft-tissue infection":"ssti",
  "Diabetic foot (soft tissue, mod/severe)":"dfi", "Diabetic foot osteomyelitis":"dfi",
  "Osteomyelitis (native)":"oviva", "Vertebral osteomyelitis / discitis":"vosteo",
  "C. difficile infection (initial)":"cdi", "Febrile neutropenia":"fn",
};

/* Flat lookup: dx name → { ...row, group, ref }. Single source of truth for
   duration evidence — both the Course-tab table and the syndrome cards read
   from this, so the evidence tier and citation can never drift between them. */
const DUR_BY_DX = (() => {
  const m = {};
  DURATIONS.forEach(g => g.rows.forEach(r => { m[r.dx] = { ...r, group:g.group, ref:DUR_REF[r.dx] || null }; }));
  return m;
})();

const CLOCK = [
  ["Most bacteremias","From the day of adequate source control / effective therapy"],
  ["S. aureus bacteremia","From the FIRST negative blood culture (repeat q48h until clearance)"],
  ["Endocarditis","From the first negative culture; surgical cases may restart at valve replacement"],
  ["Osteomyelitis","From definitive surgical debridement (or start of therapy if managed medically)"],
  ["Intra-abdominal","From the day of source control (drainage / surgery), per STOP-IT"],
  ["Diabetic foot osteomyelitis","From amputation/resection if bone margin clear; from therapy start if no resection"],
];

/* ===================== DATA: REFERENCES ===================== */
/* ===================== BUILD / VERSION STAMP ===================== */
/* Single source of truth for the version + review date rendered in the footer. */
const VERSION  = "3.1";

const REVIEWED = "2026-05";

   // ISO year-month of last clinical review

/* ===================== DATA: GUIDELINE / EVIDENCE REGISTRY =====================
   One keyed registry is the single source of truth for provenance. The visible
   references list (REFS) is DERIVED from it, and recommendations cite by `id`
   via the <Cite> component — so a guideline year is edited in exactly one place
   and propagates everywhere. `strength` is optional (not every source maps to a
   single graded recommendation). `kind`: guide | rct.                          */
const GUIDELINES = {
  amrgn:    { body:"IDSA",          year:2024, kind:"guide", title:"Treatment of Antimicrobial-Resistant Gram-Negative Infections (ESBL-E, AmpC-E, CRE, DTR-P. aeruginosa, CRAB, S. maltophilia)", cite:"Clin Infect Dis · Tamma et al. · ciae403", strength:"Strong / living guidance" },
  cap:      { body:"ATS/IDSA",      year:2019, kind:"guide", title:"Diagnosis and Treatment of Adults with Community-Acquired Pneumonia", cite:"Am J Respir Crit Care Med · Metlay et al." },
  hapvap:   { body:"ATS/IDSA",      year:2016, kind:"guide", title:"Management of Hospital-Acquired and Ventilator-Associated Pneumonia", cite:"Clin Infect Dis · Kalil et al." },
  balance:  { body:"NEJM",          year:2025, kind:"rct",   title:"Antibiotic Treatment for 7 versus 14 Days in Bloodstream Infections (BALANCE)", cite:"Daneman, Rishu et al. · 392:1065" },
  stopit:   { body:"NEJM",          year:2015, kind:"rct",   title:"STOP-IT: Short-Course Antimicrobial Therapy for Intra-abdominal Infection", cite:"Sawyer et al. · 372:1996" },
  oviva:    { body:"NEJM",          year:2019, kind:"rct",   title:"OVIVA: Oral versus Intravenous Antibiotics for Bone and Joint Infection", cite:"Li et al. · 380:425" },
  poet:     { body:"NEJM",          year:2019, kind:"rct",   title:"POET: Partial Oral versus Intravenous Antibiotic Treatment of Endocarditis", cite:"Iversen et al. · 380:415" },
  merino:   { body:"JAMA",          year:2018, kind:"rct",   title:"MERINO: Piperacillin-Tazobactam vs Meropenem for Ceftriaxone-Resistant E. coli / K. pneumoniae Bacteremia", cite:"Harris et al. · 320:984" },
  dfi:      { body:"IWGDF/IDSA",    year:2023, kind:"guide", title:"Diagnosis and Treatment of Diabetes-Related Foot Infections", cite:"Clin Infect Dis · Senneville et al. · ciad527" },
  cdi:      { body:"IDSA/SHEA",     year:2021, kind:"guide", title:"Clostridioides difficile Infection in Adults (Focused Update) — fidaxomicin preferred", cite:"Clin Infect Dis · Johnson et al." },
  ssti:     { body:"IDSA",          year:2014, kind:"guide", title:"Diagnosis and Management of Skin and Soft Tissue Infections", cite:"Clin Infect Dis · Stevens et al." },
  ie:       { body:"ESC / AHA",     year:2023, kind:"guide", title:"Management of Infective Endocarditis", cite:"Eur Heart J · Delgado et al. / AHA Scientific Statement" },
  vanco:    { body:"ASHP/IDSA",     year:2020, kind:"guide", title:"Therapeutic Monitoring of Vancomycin (AUC/MIC 400–600)", cite:"Am J Health-Syst Pharm · Rybak et al." },
  ssc:      { body:"SCCM/ESICM",    year:2021, kind:"guide", title:"Surviving Sepsis Campaign: Management of Sepsis and Septic Shock", cite:"Crit Care Med · Evans et al." },
  fn:       { body:"IDSA",          year:2018, kind:"guide", title:"Use of Antimicrobials in Neutropenic Patients with Cancer (with NCCN updates)", cite:"Clin Infect Dis · Freifeld / Taplitz et al." },
  proph:    { body:"ASHP/IDSA/SIS", year:2013, kind:"guide", title:"Clinical Practice Guidelines for Antimicrobial Prophylaxis in Surgery", cite:"Am J Health-Syst Pharm · Bratzler et al." },
  crbsi_g:  { body:"IDSA",          year:2009, kind:"guide", title:"Diagnosis and Management of Intravascular Catheter-Related Infection", cite:"Clin Infect Dis · Mermel et al." },
  avod:     { body:"Br J Surg",     year:2012, kind:"rct",   title:"AVOD / DIABOLO: Antibiotics versus no antibiotics in uncomplicated acute diverticulitis", cite:"Chabok et al.; Daniels et al. (DIABOLO, 2017)" },
  aasld:    { body:"AASLD",         year:2021, kind:"guide", title:"Diagnosis, Evaluation, and Management of Ascites and Spontaneous Bacterial Peritonitis", cite:"Hepatology · Biggins et al." },
  vosteo:   { body:"Lancet",        year:2015, kind:"rct",   title:"6 vs 12 weeks of antibiotic therapy for pyogenic vertebral osteomyelitis", cite:"Bernard et al. · 385:875" },
  mono:     { body:"NCBI / NLM",    year:null, kind:"guide", title:"PubMed, Bookshelf, and StatPearls antimicrobial monographs (open-access)", cite:"ncbi.nlm.nih.gov" },
  stew:     { body:"IDSA / SHEA",   year:2016, kind:"guide", title:"Implementing an Antibiotic Stewardship Program — de-escalation and avoidance of redundant coverage", cite:"Clin Infect Dis · Barlam et al." },

  /* ===== Phase F additions — landmark trials & guidelines cited in
     the per-syndrome research panels (research.trials + research.guidelines
     across syndromeDecision.js). Indexed by stable id for <Cite> use. ===== */
  capecod:  { body:"NEJM",          year:2023, kind:"rct",   title:"CAPE-COD: Hydrocortisone in Severe Community-Acquired Pneumonia", cite:"Dequin et al. · 388:1931" },
  mist2:    { body:"NEJM",          year:2011, kind:"rct",   title:"MIST-2: Intrapleural tPA + DNase for Pleural Infection", cite:"Rahman et al. · 365:518" },
  pneuma:   { body:"JAMA",          year:2003, kind:"rct",   title:"PneumA: 8 vs 15 Days of Antibiotic Therapy for Ventilator-Associated Pneumonia", cite:"Chastre et al. · 290:2588" },
  diabolo:  { body:"Br J Surg",     year:2017, kind:"rct",   title:"DIABOLO: Observation vs Antibiotic Treatment for Uncomplicated Acute Diverticulitis", cite:"Daniels et al. · 104:52" },
  coda:     { body:"NEJM",          year:2020, kind:"rct",   title:"CODA: Antibiotics versus Appendectomy for Acute Appendicitis", cite:"Flum / CODA Collaborative · 383:1907" },
  datipo:   { body:"NEJM",          year:2021, kind:"rct",   title:"DATIPO: 6 vs 12 Weeks of Antibiotic Therapy After Prosthetic Joint Infection Surgery", cite:"Bernard et al. · 384:1991" },
  fmt:      { body:"NEJM",          year:2013, kind:"rct",   title:"Duodenal Infusion of Donor Feces for Recurrent C. difficile (Stopped early for efficacy)", cite:"van Nood et al. · 368:407" },
  modify:   { body:"NEJM",          year:2017, kind:"rct",   title:"MODIFY I/II: Bezlotoxumab for the Prevention of Recurrent C. difficile Infection", cite:"Wilcox et al. · 376:305" },
  ser109:   { body:"NEJM",          year:2022, kind:"rct",   title:"ECOSPOR III (SER-109 / Vowst): Oral Microbiome Therapeutic for Recurrent C. difficile", cite:"Feuerstadt et al. · 386:220" },
  degans:   { body:"NEJM",          year:2002, kind:"rct",   title:"Adjunctive Dexamethasone in Adults with Bacterial Meningitis", cite:"de Gans + van de Beek · 347:1549" },
  talan:    { body:"JAMA",          year:2000, kind:"rct",   title:"Ciprofloxacin 7-day vs TMP-SMX 14-day for Pyelonephritis in Women", cite:"Talan et al. · 283:1583" },
  patch:    { body:"BMJ",           year:2018, kind:"rct",   title:"PATCH I/II: Penicillin Prophylaxis for Recurrent Cellulitis", cite:"Thomas et al. · cellulitis prophylaxis" },
  pallin:   { body:"Clin Infect Dis", year:2013, kind:"rct", title:"Cephalexin alone vs Cephalexin + TMP-SMX for Uncomplicated Cellulitis", cite:"Pallin et al. · 56:1754" },
  dutchstepup: { body:"NEJM",       year:2010, kind:"rct",   title:"Dutch Step-Up Approach (PANTER): Minimally Invasive Step-Up vs Open Necrosectomy for Pancreatic Necrosis", cite:"van Santvoort et al. · 362:1491" },
  propatria: { body:"Lancet",       year:2008, kind:"rct",   title:"PROPATRIA: Probiotic Prophylaxis in Predicted Severe Acute Pancreatitis (increased mortality)", cite:"Besselink et al. · 371:651" },
  reduce:   { body:"JAMA",          year:2013, kind:"rct",   title:"REDUCE: 5-day vs 14-day Prednisone in COPD Exacerbations", cite:"Leuppi et al. · 309:2223" },
  ease:     { body:"NEJM",          year:2012, kind:"rct",   title:"EASE: Early Surgery in Infective Endocarditis with Large Vegetations", cite:"Kang et al. · 366:2466" },
  arrest:   { body:"Lancet",        year:2018, kind:"rct",   title:"ARREST: Adjunctive Rifampicin for S. aureus Bacteremia (no mortality benefit)", cite:"Thwaites et al. · 391:668" },
  tokyo:    { body:"J Hepatobiliary Pancreat Sci", year:2018, kind:"guide", title:"Tokyo Guidelines (TG18) for Diagnosis and Severity Grading of Acute Cholangitis", cite:"Kiriyama / Yokoe et al." },
  hoffman:  { body:"NEJM",          year:1984, kind:"rct",   title:"High-Dose Dexamethasone (Hoffman regimen) in Severe Typhoid Fever", cite:"Hoffman + Punjabi et al. · 310:82" },
  wongehec: { body:"NEJM",          year:2000, kind:"obs",   title:"Antibiotic Treatment of Children with E. coli O157:H7 and Hemolytic-Uremic Syndrome Risk", cite:"Wong et al. · 342:1930" },
  taplitzfn: { body:"J Clin Oncol", year:2018, kind:"guide", title:"Outpatient Management of Fever and Neutropenia (ASCO / IDSA Joint Update)", cite:"Taplitz et al. · 36:1443" },
  mascc:    { body:"J Clin Oncol",  year:2000, kind:"guide", title:"MASCC Risk Score for Stratifying Febrile Neutropenia", cite:"Klastersky et al. · 18:3038" },
  vfneo:    { body:"NEJM",          year:2018, kind:"rct",   title:"SECURE: Isavuconazole vs Voriconazole for Invasive Aspergillosis", cite:"Maertens et al. · 387:760" },
  mermel:   { body:"Clin Infect Dis", year:2009, kind:"guide", title:"IDSA Catheter-Related Bloodstream Infection Management Algorithm", cite:"Mermel et al." },
  cdc_abx:  { body:"CDC",           year:2024, kind:"guide", title:"Tier-1 Select Agents (Anthrax, Plague, Tularemia, Q fever) Treatment + Public Health Reporting", cite:"cdc.gov/anthrax" },
  brouwerba: { body:"NEJM",         year:2014, kind:"obs",   title:"Modern Brain Abscess Epidemiology + Outcomes", cite:"Brouwer + Tunkel · 371:447" },
  darouicheea: { body:"NEJM",       year:2006, kind:"obs",   title:"Spinal Epidural Abscess: Modern Management Review", cite:"Darouiche · 355:2012" },
  fishman:  { body:"NEJM",          year:2007, kind:"obs",   title:"Infection in Solid-Organ Transplant Recipients", cite:"Fishman · 357:2601" },
  cdc_acip: { body:"CDC ACIP",      year:2024, kind:"guide", title:"Adult + Asplenia Immunization Schedule", cite:"cdc.gov/vaccines/schedules/hcp/imz/adult" },
  davies_bsh: { body:"Br J Haematol", year:2011, kind:"guide", title:"BSH Asplenia / Hyposplenia Management Guidance", cite:"Davies et al. · 155:308" },
  bisharat: { body:"Lancet Infect Dis", year:2001, kind:"obs", title:"OPSI Epidemiology + Outcomes Cohort Review", cite:"Bisharat et al. · 1:230" },
  acg_pancreatitis: { body:"ACG",   year:2024, kind:"guide", title:"Acute Pancreatitis Clinical Practice Guideline Update", cite:"Crockett et al. (ACG)" },
  iwgdf_idsa: { body:"IWGDF / IDSA", year:2023, kind:"guide", title:"International Diabetes-Related Foot Infection Joint Guidance", cite:"Senneville + Lipsky" },
  cdc_sti:  { body:"CDC",           year:2021, kind:"guide", title:"CDC STI Treatment Guidelines (incl. PID)", cite:"Workowski et al. · MMWR" },
};

/* Visible source list is derived from the registry — never hand-maintained. */
const REFS = Object.entries(GUIDELINES).map(([id, g]) => ({
  id, tag: g.year ? `${g.body} ${g.year}` : g.body, t: g.title, src: g.cite,
}));

/* ===================== DATA: EVOLVING FRONTS ("what's changing") ===================== */
/* Honest flags on the moving edges of the evidence. dir = current direction. */
const EVOLVING = [
  { h:"Cefepime is now preferred for moderate-risk AmpC", ref:"amrgn",
    b:"IDSA withdrew the old caution against cefepime at MIC 4\u20138 for Enterobacter, K. aerogenes, and C. freundii. Cefepime is stable to AmpC and preferred over a carbapenem for moderate-risk inducers, sparing carbapenem pressure.",
    dir:"Settled in current guidance" },
  { h:"Piperacillin-tazobactam + vancomycin AKI signal",
    b:"Observational data link the combination to more acute kidney injury than vancomycin with cefepime or meropenem; whether this is true injury or creatinine-assay interference remains debated. Where both broad Gram-negative and MRSA cover are needed, an alternative \u03b2-lactam pairing is reasonable.",
    dir:"Contested \u2014 avoid the pairing when alternatives fit" },
  { h:"Metallo-\u03b2-lactamase CRE is rising", ref:"amrgn",
    b:"NDM/VIM/IMP prevalence is increasing in the US. These hydrolyze all carbapenems and resist avibactam, vaborbactam, and relebactam alone \u2014 cefiderocol, or ceftazidime-avibactam plus aztreonam, are the current routes. Carbapenemase typing now changes the agent.",
    dir:"Increasing \u2014 type the carbapenemase" },
  { h:"Durations keep shortening", ref:"balance",
    b:"Seven days equalled 14 for bloodstream infection (BALANCE), ~4 days suffices after intra-abdominal source control (STOP-IT), and oral step-down is non-inferior for bone/joint (OVIVA) and left-sided endocarditis (POET). The default is now short with a defined stop date.",
    dir:"Trend \u2014 fix the stop date upfront" },
  { h:"Steroids in severe CAP \u2014 practice-changing", ref:"capecod",
    b:"CAPE-COD (NEJM 2023, n=800) showed hydrocortisone 200 mg/d \u00d7 4\u20138 d reduces 28-day mortality in severe non-shock CAP (6.2% vs 11.9%). Excluded influenza + immunocompromised. Where steroid was historically debated, severe non-influenza CAP now has a defined survival benefit.",
    dir:"Settled \u2014 dose for severe CAP without influenza" },
  { h:"Antibiotic-free observation for selected uncomplicated infection", ref:"diabolo",
    b:"DIABOLO (Br J Surg 2017) and AVOD (2012) established that uncomplicated diverticulitis often resolves without antibiotics. CODA (NEJM 2020) showed antibiotic-only management non-inferior at 90 d for acute appendicitis (\u224830% required appendectomy at 5 y). Stewardship displaces reflex prescription.",
    dir:"Established \u2014 shared decision-making for selected" },
  { h:"Oral step-down expanding beyond bone\u00b7joint", ref:"poet",
    b:"OVIVA proved oral is non-inferior for bone\u00b7joint; POET extended this to stabilized left-sided endocarditis. Outpatient parenteral therapy (OPAT) pathways increasingly substitute for inpatient IV completion. SABATO (2023) suggests the principle applies even to uncomplicated S. aureus bacteremia after initial IV.",
    dir:"Expanding \u2014 select for stable, bioavailable, reliable follow-up" },
  { h:"Microbiome therapeutics for recurrent CDI", ref:"ser109",
    b:"After van Nood (2013, stopped early for FMT efficacy), SER-109 (NEJM 2022; FDA-approved as Vowst 2023) and Rebyota establish standardized oral / per-rectal microbiome products as alternatives to FMT for recurrent C. difficile. Bezlotoxumab (MODIFY) adjunct for high-risk recurrence.",
    dir:"New \u2014 standardized products replacing traditional FMT" },
  { h:"EHEC: antibiotic contraindication holds firm", ref:"wongehec",
    b:"Wong (NEJM 2000) showed \u224810x HUS risk in pediatric EHEC + antibiotic exposure; adult signal consistent. Bloody diarrhea workup must exclude EHEC before any antibiotic decision. Stewardship displaces empiric treatment of acute bloody diarrhea.",
    dir:"Settled \u2014 confirm EHEC status before treating" },
  { h:"Severe pancreatitis: no antibiotic prophylaxis", ref:"propatria",
    b:"PROPATRIA (Lancet 2008) showed probiotic prophylaxis increased mortality in severe pancreatitis. Villatoro (Cochrane 2010) confirmed no benefit of prophylactic antibiotics in sterile necrosis. Treatment is reserved for documented infected necrosis (FNA or gas-on-imaging); step-up drainage (Dutch step-up, NEJM 2010) is the modern intervention.",
    dir:"Settled \u2014 no prophylaxis in sterile necrosis" },
];

/* ============================================================================
   v3 · C4 — TRIAL / GUIDELINE EVIDENCE CARDS
   Turns every <Cite> and primary-source row into an openable card. Design /
   result / bottom-line are concise original summaries (not quotations) for the
   landmark trials and living guidance that change bedside decisions; keys are
   validated against GUIDELINES by the integrity suite.
   ========================================================================== */
const TRIAL_DETAIL = {
  balance: { short:"BALANCE", design:"Multicentre RCT, 3608 hospitalised patients with bloodstream infection; 7 vs 14 days of treatment.", result:"90-day mortality non-inferior for 7 days (about 14.5% vs 14.4%).", bottom:"Seven days suffices for most bacteraemia once the source is controlled; extend only for specific pathogens or foci (e.g., S. aureus, endovascular, undrained focus)." },
  stopit:  { short:"STOP-IT", design:"RCT, 518 patients with complicated intra-abdominal infection and adequate source control; fixed ~4 days vs therapy continued to 2 days past physiologic normalisation.", result:"No difference in surgical-site infection, recurrence, or death.", bottom:"After source control, a short fixed course (~4 days) equals a longer symptom-guided one." },
  oviva:   { short:"OVIVA", design:"RCT, 1054 patients with bone and joint infection; oral vs intravenous antibiotics for the first 6 weeks.", result:"Oral non-inferior for treatment failure at 1 year.", bottom:"Early oral step-down is appropriate for most bone and joint infection when a suitable oral agent and reliable follow-up exist." },
  poet:    { short:"POET", design:"RCT, 400 patients with stabilised left-sided endocarditis; continued IV vs partial oral completion.", result:"Oral step-down non-inferior on the composite outcome and durable at extended follow-up.", bottom:"Selected, stabilised endocarditis can finish therapy orally with structured monitoring." },
  merino:  { short:"MERINO", design:"RCT, ceftriaxone-resistant E. coli / K. pneumoniae bacteraemia; piperacillin-tazobactam vs meropenem.", result:"30-day mortality higher with piperacillin-tazobactam (12.3% vs 3.7%); stopped early.", bottom:"Use a carbapenem for serious ESBL bloodstream infection — in-vitro susceptibility to pip-tazo does not make it equivalent." },
  amrgn:   { short:"IDSA AMR-GN", design:"Living IDSA guidance on resistant Gram-negative infection.", result:"Preferred agents track the mechanism: ESBL → carbapenem; AmpC → cefepime or carbapenem; KPC-CRE → ceftazidime-avibactam or meropenem-vaborbactam; metallo-CRE → cefiderocol or ceftazidime-avibactam + aztreonam; DTR-Pseudomonas → ceftolozane-tazobactam or ceftazidime-avibactam; CRAB → sulbactam-durlobactam-based; S. maltophilia → TMP-SMX-based.", bottom:"Match the agent to the carbapenemase / resistance mechanism, not the MIC alone." },
  ssc:     { short:"Surviving Sepsis", design:"SCCM/ESICM consensus guideline.", result:"Early adequate antibiotics, cultures and lactate, fluids, and vasopressors to MAP ≥ 65; antibiotics within 1 hour for shock.", bottom:"Speed and adequacy of early therapy plus source control drive survival; reassess and de-escalate daily." },
  vanco:   { short:"Vancomycin AUC", design:"ASHP/IDSA/PIDS/SIDP consensus on vancomycin monitoring.", result:"AUC/MIC 400–600 (Bayesian or two-level) supersedes trough-only targeting.", bottom:"Target AUC; trough-only goals of 15–20 overshoot the nephrotoxic threshold." },
  cdi:     { short:"IDSA/SHEA CDI", design:"Focused-update guideline for C. difficile infection.", result:"Fidaxomicin or oral vancomycin preferred over metronidazole; bezlotoxumab or FMT for recurrence.", bottom:"Metronidazole is now reserved for when neither preferred oral agent is available." },
};

export { GUIDELINES, REFS, EVOLVING, TRIAL_DETAIL, DURATIONS, DUR_MAX, DUR_REF, DUR_BY_DX, CLOCK, VERSION, REVIEWED };
