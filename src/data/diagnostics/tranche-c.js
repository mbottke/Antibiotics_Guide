/* data · diagnostics/tranche-c — Wave 5 PR-6d content tranche.

   24 syndromes: bloodstream (second half — VRE, polymicrobial, strep) +
   genitourinary (cystitis through transplant-UTI) + intra-abdominal
   (peritonitis through mesenteric ischemia). Authored at the apex bar
   per the schema in the aggregator. Authored in parallel with
   tranche-b/d/e per the plan's multi-agent matrix.

   Schema documented in src/data/diagnostics.js (the aggregator).
   Inpatient Antibiotic Guide — module graph in README.md. */

export const TRANCHE_C_DIAGNOSTICS = {

  /* === VRE bacteremia ==================================================== */
  "vre-bact": {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures on detection AND **q48–72h until clearance**; culture every retained line.",
        why:  "Time-to-clearance defines complicated VRE bacteremia and starts the duration clock at first negative." },
      { sev: "trigger",
        what: "Source cultures (urine, wound, intra-abdominal drain) when a non-line focus is suspected.",
        why:  "VRE rarely seeds endovascular tissue; the true reservoir is usually gut translocation or biliary/urinary source." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "Daily CRP trend supports response monitoring; lactate if hemodynamic instability.",
        why:  "Inflammatory markers track response in immunocompromised hosts where fever curves are blunted." },
    ],
    panels: [
      { sev: "required",
        what: "Rapid PCR (Verigene BC-GP, BioFire BCID2) on positive bottle to confirm **vanA/vanB** within 1–2 h.",
        why:  "Distinguishes VRE from VSE same-day and gates daptomycin / linezolid vs ampicillin." },
      { sev: "trigger",
        what: "Daptomycin susceptibility (MIC) with reflex to high-dose strategy when MIC > 2 mg/L.",
        why:  "Dapto-non-susceptible VRE is rising; MIC > 2 supports 10–12 mg/kg dosing or combination therapy." },
    ],
    imaging: [
      { sev: "trigger",
        what: "TTE in all VRE bacteremia; **TEE** if persistent positives, prosthetic valve, or unexplained metastatic focus.",
        why:  "Enterococcal endocarditis upgrades duration to 6 weeks and may require valve surgery." },
      { sev: "consider",
        what: "CT abdomen/pelvis for unexplained persistent bacteremia to find biliary, hepatic, or pelvic source.",
        why:  "Undrained gut-derived source drives persistence; imaging finds the reservoir when blood cultures stay positive." },
    ],
  },

  /* === Polymicrobial bacteremia ========================================== */
  "polymicrobial-bact": {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures at detection AND from every accessible source (drain, wound, urine, line tip).",
        why:  "Polymicrobial bacteremia almost always reflects an undrained focus — source identification dominates outcome." },
      { sev: "trigger",
        what: "Anaerobic blood culture bottles + extended incubation when gut or pelvic source plausible.",
        why:  "Bacteroides, Fusobacterium grow slowly; standard 5-day incubation misses ~10% of anaerobic bacteremia." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Lactate at presentation and 2–4 h after resuscitation; LFTs and lipase to screen biliary / pancreatic source.",
        why:  "Polymicrobial bacteremia is a high-mortality sepsis phenotype; early lactate gates pressor and ICU decisions." },
    ],
    panels: [
      { sev: "trigger",
        what: "Rapid multiplex panel (BioFire BCID2) on first positive bottle.",
        why:  "Detects multiple organisms simultaneously and resistance markers; accelerates broad-coverage choices." },
    ],
    imaging: [
      { sev: "required",
        what: "**CT abdomen/pelvis with contrast** within 6 h to identify abscess, perforation, or obstructive uropathy.",
        why:  "Polymicrobial bacteremia without an obvious focus is intra-abdominal until proven otherwise; drainage is curative." },
    ],
  },

  /* === Strep bacteremia (viridans, group A, B, C, G) ===================== */
  "strep-bact": {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures on detection AND **q48h until clearance** for viridans-group or group B/G.",
        why:  "Streptococcal bacteremia carries endocarditis risk that scales with persistence; clearance defines duration clock." },
      { sev: "trigger",
        what: "Source cultures (skin, joint, pharynx, urine) when clinical focus suggests pyogenic streptococci.",
        why:  "Group A streptococcal bacteremia from skin/soft tissue mandates necrotizing-infection screening." },
    ],
    biomarkers: [
      { sev: "trigger",
        what: "CK + creatinine + lactate when group A strep with cellulitis or muscle pain — screen for necrotizing fasciitis.",
        why:  "Group A strep bacteremia with CK rise demands emergent surgical exploration; antibiotics alone fail myonecrosis." },
    ],
    panels: [
      { sev: "trigger",
        what: "Rapid PCR identification (Verigene, BioFire BCID2) on positive bottle to distinguish viridans vs S. bovis vs GAS.",
        why:  "S. gallolyticus (bovis) bacteremia mandates colonoscopy; viridans drives endocarditis workup; species shifts source hunt." },
    ],
    imaging: [
      { sev: "required",
        what: "TTE first; **TEE** in viridans-group, S. gallolyticus, or persistent positives — endocarditis suspicion is high.",
        why:  "Viridans-group bacteremia carries ~40–60% endocarditis risk; missed IE drives valvular destruction and emboli." },
      { sev: "trigger",
        what: "Colonoscopy after recovery when S. gallolyticus (bovis) identified.",
        why:  "S. gallolyticus bacteremia carries 25–50% prevalence of colorectal neoplasm — diagnostic yield is the standard of care." },
    ],
  },

  /* === Cystitis (uncomplicated UTI) ====================================== */
  cystitis: {
    cultures: [
      { sev: "consider",
        what: "Urine culture in recurrent cystitis, treatment failure, pregnancy, or atypical presentation; not routinely in uncomplicated young women.",
        why:  "Empiric therapy is highly effective in uncomplicated cystitis; cultures preserve diagnostic yield for failure cases." },
      { sev: "trigger",
        what: "Urine culture **before antibiotics** in male patients, diabetes, or recent antibiotic exposure.",
        why:  "Resistance prevalence is high enough in these groups that culture-guided therapy changes management." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Urinalysis with reflex microscopy — **pyuria + nitrites + leukocyte esterase** at presentation.",
        why:  "Absence of pyuria makes UTI unlikely; nitrite-positive supports Enterobacterales empiric coverage." },
    ],
  },

  /* === CAUTI — catheter-associated UTI =================================== */
  cauti: {
    cultures: [
      { sev: "required",
        what: "Urine culture from a **freshly placed catheter** (not the indwelling line) before antibiotics.",
        why:  "Indwelling-line samples reflect biofilm colonization; fresh catheter or mid-stream voided sample defines true infection." },
      { sev: "trigger",
        what: "Two sets of peripheral blood cultures when sepsis criteria, fever, or hemodynamic instability.",
        why:  "Bacteremic CAUTI is common and identifies resistant organisms; blood cultures yield ~25% in symptomatic disease." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "Urinalysis to confirm pyuria; lactate when systemic illness suspected.",
        why:  "Pyuria is required for CAUTI diagnosis; bacteriuria without pyuria is colonization, not infection." },
    ],
    imaging: [
      { sev: "trigger",
        what: "CT abdomen/pelvis when no clinical improvement at 48–72 h to screen obstruction or abscess.",
        why:  "Failure of CAUTI to respond to appropriate therapy usually reflects an obstructive or drainable focus." },
    ],
  },

  /* === Prostatitis (acute bacterial) ===================================== */
  prostatitis: {
    cultures: [
      { sev: "required",
        what: "Mid-stream urine culture **before antibiotics**; avoid prostatic massage in acute disease (bacteremia risk).",
        why:  "Acute bacterial prostatitis is Enterobacterales-dominant; urine culture yields the pathogen in > 80%." },
      { sev: "trigger",
        what: "Two sets of peripheral blood cultures when fever, sepsis criteria, or immunocompromise.",
        why:  "Acute prostatitis with systemic features carries ~10–20% bacteremia rate; identifies resistant organisms." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "PSA at baseline can rise dramatically — do not interpret for cancer screening for at least 6 weeks.",
        why:  "Acute inflammation drives PSA elevation; misinterpretation prompts unnecessary biopsy." },
    ],
    imaging: [
      { sev: "trigger",
        what: "Transrectal US or pelvic MRI when fever persists > 36 h on appropriate therapy — screen prostatic abscess.",
        why:  "Prostatic abscess complicates ~2–5% of acute prostatitis; requires drainage and longer duration." },
    ],
  },

  /* === Epididymo-orchitis ================================================ */
  epididymo: {
    cultures: [
      { sev: "required",
        what: "**Urine NAAT** for N. gonorrhoeae + C. trachomatis in men < 35 y; urine culture in older men or post-instrumentation.",
        why:  "Age-stratified etiology is the apex stewardship lever: STI coverage vs Enterobacterales drives completely different regimens." },
      { sev: "trigger",
        what: "Two sets of peripheral blood cultures when sepsis criteria, scrotal abscess, or systemic toxicity.",
        why:  "Severe epididymo-orchitis with bacteremia identifies the pathogen when local cultures are equivocal." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "Urinalysis with pyuria; CRP trend if hospitalized.",
        why:  "Pyuria supports infection vs torsion; CRP tracks response when symptoms are slow to resolve." },
    ],
    imaging: [
      { sev: "required",
        what: "**Scrotal Doppler ultrasound** — distinguishes torsion (surgical emergency) from epididymo-orchitis.",
        why:  "Missed torsion costs the testicle within 6 h; Doppler is the definitive bedside discriminator." },
      { sev: "trigger",
        what: "Repeat US when abscess or failure to improve at 72 h on appropriate therapy.",
        why:  "Scrotal abscess requires surgical drainage; antibiotics alone fail an undrained collection." },
    ],
  },

  /* === Renal / perinephric abscess ======================================= */
  renalabscess: {
    cultures: [
      { sev: "required",
        what: "Urine culture + two sets of peripheral blood cultures **before antibiotics**.",
        why:  "Bacteremic renal abscess is common (~50%); paired urine + blood yields the pathogen in > 80%." },
      { sev: "required",
        what: "**Aspirate culture** at percutaneous drainage — Gram stain, aerobic, anaerobic, AFB if risk factors.",
        why:  "Tissue/aspirate culture is the highest-yield pathogen source and gates targeted definitive therapy." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Lactate, CBC, CMP at presentation; **lactate trend** after resuscitation.",
        why:  "Defines urosepsis vs uncomplicated abscess and drives ICU disposition; tracks resuscitation adequacy." },
    ],
    imaging: [
      { sev: "required",
        what: "**CT abdomen/pelvis with contrast** to define abscess size, location, and obstruction.",
        why:  "Drives drainage decision: collections > 3 cm and obstructive disease require percutaneous or surgical drainage." },
      { sev: "trigger",
        what: "Repeat CT or US at 5–7 days when clinical response is incomplete.",
        why:  "Persistent or expanding collection mandates re-drainage; obstructed kidney requires urgent decompression." },
    ],
  },

  /* === PID — pelvic inflammatory disease ================================= */
  pid: {
    cultures: [
      { sev: "required",
        what: "**Endocervical / vaginal NAAT** for N. gonorrhoeae + C. trachomatis + M. genitalium at presentation.",
        why:  "Etiologic identification gates partner notification and resistance-guided therapy; CDC standard of care." },
      { sev: "trigger",
        what: "Two sets of peripheral blood cultures in severe PID, tubo-ovarian abscess, or systemic toxicity.",
        why:  "Severe PID with sepsis criteria identifies polymicrobial gut flora and resistant Enterobacterales." },
    ],
    biomarkers: [
      { sev: "required",
        what: "**Urine or serum hCG** at presentation in every reproductive-age patient.",
        why:  "Pregnancy is the differential anchor — ectopic must be excluded and changes antibiotic choice." },
      { sev: "consider",
        what: "CRP and ESR if hospitalized; HIV + syphilis screen per CDC.",
        why:  "PID is a sentinel STI diagnosis; co-infection screening is the standard adjunct." },
    ],
    imaging: [
      { sev: "trigger",
        what: "Transvaginal ultrasound (or pelvic MRI) when **tubo-ovarian abscess** is on the differential.",
        why:  "TOA > 7 cm or failure to respond at 48–72 h often requires drainage; imaging is the gating test." },
    ],
  },

  /* === Urosepsis ========================================================= */
  urosepsis: {
    cultures: [
      { sev: "required",
        what: "Urine culture + **two sets of peripheral blood cultures before the first antibiotic dose** (when not delaying therapy in shock).",
        why:  "Bacteremic urosepsis is common (~25–40%); pre-treatment cultures are the only reliable de-escalation lever." },
      { sev: "required",
        what: "Repeat blood cultures q48h until clearance when bacteremia documented.",
        why:  "Persistent positives at 72 h point to undrained obstructive source — re-image and re-drain." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Lactate at presentation and 2–4 h after resuscitation; CBC, CMP including creatinine.",
        why:  "Lactate trend gates pressor and ICU decisions; AKI from obstructive uropathy drives nephrology and urology involvement." },
      { sev: "consider",
        what: "Procalcitonin trend supports antibiotic discontinuation but never gates initiation.",
        why:  "PCT-guided de-escalation supported in critical illness; single values noisy and never delay empirics." },
    ],
    panels: [
      { sev: "trigger",
        what: "Rapid blood-culture pathogen panel (BioFire, Verigene) on first positive bottle.",
        why:  "Identifies ESBL / KPC markers 24 h before culture; gates carbapenem vs broader empiric strategy.",
        matchCtx: { esblRisk: true } },
    ],
    imaging: [
      { sev: "required",
        what: "**CT abdomen/pelvis** within 6 h (or renal US if contrast contraindicated) to screen obstruction and abscess.",
        why:  "Obstructive urosepsis is a urologic emergency; missed obstruction drives mortality despite appropriate antibiotics." },
    ],
  },

  /* === Asymptomatic bacteriuria ========================================== */
  "asymp-bact": {
    cultures: [
      { sev: "required",
        what: "Reserve urine culture for **pregnancy** (screen at 12–16 weeks) and **pre-urologic procedure** with mucosal trauma — **do not order in any other asymptomatic patient**, including delirium, falls, foul urine, or catheter change.",
        why:  "IDSA 2019: these are the only two indications where treating ASB changes outcomes; ordering outside them drives the cascade to harm." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "Pyuria + bacteriuria without symptoms is **colonization**, not infection — do not treat on UA alone.",
        why:  "Symptoms gate treatment; treating ASB drives resistance and C. difficile without improving outcomes." },
    ],
  },

  /* === Emphysematous UTI (cystitis / pyelonephritis) ===================== */
  "emphysematous-uti": {
    cultures: [
      { sev: "required",
        what: "Urine culture + two sets of peripheral blood cultures **before antibiotics**.",
        why:  "Bacteremia rates exceed 50%; pre-treatment cultures define the gas-producing pathogen (usually E. coli, Klebsiella)." },
      { sev: "required",
        what: "Aspirate / drainage fluid culture if percutaneous drainage performed.",
        why:  "Tissue culture confirms gas-producing organism and resistance pattern; pairs with blood for definitive therapy." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Glucose (HbA1c if non-diabetic), lactate, creatinine at presentation; lactate trend after resuscitation.",
        why:  "Diabetes is present in > 90%; hyperglycemia drives fermentation and gas production — glucose control is therapeutic." },
    ],
    imaging: [
      { sev: "required",
        what: "**CT abdomen/pelvis without contrast** at presentation — gas in renal parenchyma or collecting system defines diagnosis and class.",
        why:  "Huang–Tseng class drives nephrectomy vs percutaneous drainage vs medical management; CT is the apex test." },
    ],
  },

  /* === Transplant UTI (kidney transplant recipient) ====================== */
  "transplant-uti": {
    cultures: [
      { sev: "required",
        what: "Urine culture + two sets of peripheral blood cultures **before antibiotics** in every febrile transplant recipient.",
        why:  "Bacteremic UTI in transplant carries higher mortality and graft loss; resistance prevalence demands culture-guided therapy." },
      { sev: "trigger",
        what: "Repeat urine culture at 7–14 days after completion to document clearance.",
        why:  "Test-of-cure is reasonable in transplant given relapse risk; relapse mandates imaging and longer therapy." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Creatinine, **calcineurin-inhibitor trough** (tacro / cyclosporine), CBC at presentation.",
        why:  "Sepsis disturbs immunosuppression levels; CNI dose adjustment prevents toxicity and rejection." },
      { sev: "consider",
        what: "BK virus PCR if hematuria, persistent renal dysfunction, or no bacterial growth.",
        why:  "BK nephropathy mimics bacterial UTI and demands immunosuppression reduction, not antibiotics." },
    ],
    imaging: [
      { sev: "trigger",
        what: "Renal allograft US or CT when fever persists > 72 h, sepsis, or obstruction suspected.",
        why:  "Transplanted kidney is denervated — obstruction presents late; imaging is the only sensitive screen." },
    ],
  },

  /* === Scrotal abscess =================================================== */
  "scrotal-abscess": {
    cultures: [
      { sev: "required",
        what: "**Aspirate / drainage culture** at incision — Gram stain, aerobic, anaerobic.",
        why:  "Polymicrobial gut/skin flora is typical; tissue culture is the highest-yield pathogen source." },
      { sev: "trigger",
        what: "Two sets of peripheral blood cultures when sepsis criteria, diabetes, or immunocompromise.",
        why:  "Fournier-spectrum disease begins as scrotal abscess; blood cultures identify resistant or unusual organisms." },
    ],
    biomarkers: [
      { sev: "trigger",
        what: "Glucose, lactate, CK, LRINEC score when Fournier gangrene on the differential.",
        why:  "LRINEC ≥ 6 plus clinical concern mandates emergent surgical exploration; antibiotics alone fail." },
    ],
    imaging: [
      { sev: "required",
        what: "**Scrotal ultrasound** to confirm abscess and exclude testicular involvement; CT pelvis if Fournier suspected.",
        why:  "US distinguishes abscess from cellulitis; CT defines tissue extent when necrotizing infection plausible." },
    ],
  },

  /* === Secondary peritonitis (perforation, anastomotic leak) ============= */
  peritonitis: {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures **before antibiotics**; intra-operative peritoneal cultures at source control.",
        why:  "Polymicrobial bacteremia is common; tissue / fluid culture defines resistance and adequacy of empiric coverage." },
      { sev: "consider",
        what: "Add fungal culture (and 1,3-β-D-glucan if available) for **upper-GI perforation**, **recurrent / persistent leak**, or **post-operative peritonitis** on broad-spectrum therapy.",
        why:  "Candida peritonitis is meaningful in upper-GI source and recurrent leaks; missed antifungal coverage drives mortality." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Lactate at presentation and 2–4 h after resuscitation; CBC, CMP, lipase, LFTs.",
        why:  "Lactate gates pressors and source-control timing; lipase / LFTs identify pancreatic or biliary source." },
    ],
    imaging: [
      { sev: "required",
        what: "**CT abdomen/pelvis with contrast** within 6 h to identify perforation, free air, or undrained collection.",
        why:  "Source control timing (< 6–12 h) is the dominant determinant of survival; imaging gates surgical urgency." },
    ],
  },

  /* === SBP — spontaneous bacterial peritonitis =========================== */
  sbp: {
    cultures: [
      { sev: "required",
        what: "**Diagnostic paracentesis before antibiotics** — inoculate ≥ 10 mL ascitic fluid into blood-culture bottles at bedside.",
        why:  "Bedside bottle inoculation raises yield from ~50% to ~80%; pre-treatment sampling preserves diagnostic value." },
      { sev: "required",
        what: "Two sets of peripheral blood cultures at presentation.",
        why:  "Bacteremia accompanies ~50% of SBP; blood cultures often yield when ascitic culture is negative." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Ascitic fluid **PMN count** — ≥ 250 cells/mm³ defines SBP and triggers empiric therapy.",
        why:  "PMN count is the diagnostic anchor; treat immediately on PMN ≥ 250 without waiting for culture results." },
      { sev: "required",
        what: "Creatinine, bilirubin, INR, lactate; MELD components.",
        why:  "Hepatorenal syndrome complicates ~30% of SBP; albumin (1.5 g/kg day 1, 1 g/kg day 3) is gated by Cr and bilirubin." },
    ],
    imaging: [
      { sev: "trigger",
        what: "Abdominal US or CT when secondary peritonitis (perforation, abscess) is on the differential — polymicrobial fluid, multiple isolates, glucose < 50.",
        why:  "Secondary peritonitis demands surgical source control; treating as SBP misses the perforation." },
    ],
  },

  /* === Diverticulitis ==================================================== */
  diverticulitis: {
    cultures: [
      { sev: "trigger",
        what: "Two sets of peripheral blood cultures in complicated disease (Hinchey ≥ II), sepsis criteria, or immunocompromise.",
        why:  "Bacteremia identifies the pathogen in complicated disease; uncomplicated diverticulitis rarely yields cultures." },
    ],
    biomarkers: [
      { sev: "required",
        what: "CBC, CMP, **CRP**, lactate at presentation.",
        why:  "CRP > 150 mg/L predicts complicated disease and abscess; lactate gates urgency of source control." },
    ],
    imaging: [
      { sev: "required",
        what: "**CT abdomen/pelvis with contrast** at presentation — defines Hinchey class, abscess size, free air.",
        why:  "Hinchey class drives the entire management algorithm: outpatient PO vs admission vs percutaneous drainage vs surgery." },
      { sev: "trigger",
        what: "Colonoscopy 6–8 weeks after recovery in first episode or atypical features.",
        why:  "Diverticulitis can mask underlying colorectal neoplasm; interval colonoscopy is the standard adjunct." },
    ],
  },

  /* === Infected pancreatic necrosis ====================================== */
  pancreatic: {
    cultures: [
      { sev: "required",
        what: "**Image-guided FNA or drainage culture** of necrotic collection — Gram stain, aerobic, anaerobic, fungal.",
        why:  "Definitive diagnosis of infected necrosis; gates step-up drainage and pathogen-targeted therapy." },
      { sev: "trigger",
        what: "Two sets of peripheral blood cultures when fever, sepsis, or clinical deterioration after week 2.",
        why:  "Bacteremia from infected necrosis identifies the organism when FNA is not yet feasible." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Lactate, CBC, CRP, procalcitonin trend; lipase at baseline.",
        why:  "**Procalcitonin > 3.5 ng/mL or PCT trend** discriminates infected from sterile necrosis better than CRP (~85% specificity)." },
    ],
    imaging: [
      { sev: "required",
        what: "**Contrast-enhanced CT abdomen** at presentation and serially — defines necrosis extent and gas (pathognomonic for infection).",
        why:  "Gas in necrotic tissue is pathognomonic; CT also gates step-up drainage strategy (PCD → endoscopic → surgical)." },
      { sev: "trigger",
        what: "MRCP or EUS for biliary stone disease as the inciting cause.",
        why:  "Gallstone pancreatitis demands ERCP + cholecystectomy; missed stones drive recurrence." },
    ],
  },

  /* === Liver abscess (pyogenic and amebic) =============================== */
  liverabscess: {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures + **percutaneous aspirate culture** (Gram stain, aerobic, anaerobic).",
        why:  "Bacteremia in ~50% of pyogenic liver abscess; aspirate culture is the highest-yield pathogen source." },
      { sev: "trigger",
        what: "**Stool ova/parasite + serum Entamoeba serology** when amebic abscess plausible (travel, MSM, single right-lobe lesion).",
        why:  "Amebic abscess responds to metronidazole alone; drainage rarely needed and aspirate is sterile." },
    ],
    biomarkers: [
      { sev: "required",
        what: "LFTs, CBC, CMP, lactate; HbA1c (diabetes drives Klebsiella liver abscess syndrome).",
        why:  "Klebsiella pneumoniae K1/K2 liver abscess with diabetes carries 10–15% metastatic seeding risk (eye, brain, lung)." },
    ],
    imaging: [
      { sev: "required",
        what: "**CT abdomen with contrast** (or contrast-enhanced US) — defines size, number, drainability.",
        why:  "Collections > 3–5 cm typically require percutaneous drainage; CT gates surgical vs interventional radiology consult." },
      { sev: "trigger",
        what: "Dilated fundoscopy + brain MRI when Klebsiella K1/K2 isolated with diabetes.",
        why:  "Metastatic endophthalmitis and brain abscess are characteristic complications; early detection preserves vision." },
    ],
  },

  /* === Appendicitis ====================================================== */
  appendicitis: {
    cultures: [
      { sev: "trigger",
        what: "Two sets of peripheral blood cultures when perforation, abscess, or sepsis criteria.",
        why:  "Uncomplicated appendicitis rarely yields cultures; complicated disease identifies resistance and gut flora." },
      { sev: "trigger",
        what: "Intra-operative peritoneal / abscess fluid culture in perforated or complicated appendicitis.",
        why:  "Polymicrobial yield supports definitive coverage when empiric therapy must continue post-op." },
    ],
    biomarkers: [
      { sev: "required",
        what: "CBC with differential, CRP, lactate; **urine hCG** in reproductive-age women.",
        why:  "WBC and CRP support Alvarado / pediatric appendicitis scores; hCG excludes ectopic pregnancy." },
    ],
    imaging: [
      { sev: "required",
        what: "**CT abdomen/pelvis with contrast** (or US first in children / pregnancy) at presentation.",
        why:  "Distinguishes simple vs complicated appendicitis; gates non-operative management vs urgent appendectomy." },
    ],
  },

  /* === PD peritonitis (peritoneal dialysis) ============================== */
  "pd-peritonitis": {
    cultures: [
      { sev: "required",
        what: "PD effluent — **cell count + differential + Gram stain + culture** (≥ 50 mL inoculated into blood-culture bottles).",
        why:  "ISPD: WBC > 100 with > 50% PMN defines peritonitis; bottle inoculation raises culture yield from ~50% to ~90%." },
      { sev: "trigger",
        what: "Two sets of peripheral blood cultures when systemic sepsis or refractory disease.",
        why:  "Bacteremic PD peritonitis is uncommon; presence flags catheter colonization or alternate source." },
    ],
    biomarkers: [
      { sev: "required",
        what: "PD effluent **PMN count > 100 cells/mm³ with > 50% neutrophils** anchors diagnosis and gates empiric therapy.",
        why:  "ISPD diagnostic criterion; treat immediately on cell count without waiting for culture." },
    ],
    imaging: [
      { sev: "trigger",
        what: "CT abdomen when polymicrobial growth, anaerobes, or failure to clear at day 5 — screen secondary peritonitis.",
        why:  "Polymicrobial growth or persistent peritonitis often reflects perforation; surgical consult and catheter removal indicated." },
    ],
  },

  /* === Splenic abscess =================================================== */
  "splenic-abscess": {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures + **aspirate culture** at percutaneous drainage.",
        why:  "Hematogenous seeding is the dominant mechanism; blood + aspirate cultures yield the pathogen in > 80%." },
      { sev: "trigger",
        what: "TB-specific cultures and HIV testing when risk factors or atypical course.",
        why:  "Mycobacterial splenic abscess in HIV is a distinct entity with months-long therapy." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "CBC, CMP, lactate; blood film for malaria when travel history.",
        why:  "Splenic abscess from endocarditis or parasitic disease shifts workup substantially." },
    ],
    imaging: [
      { sev: "required",
        what: "**CT abdomen with contrast** (or US) — defines size, number, drainability.",
        why:  "Collections > 3 cm typically require percutaneous drainage; multiple small lesions favor splenectomy after antibiotic loading." },
      { sev: "required",
        what: "**TEE** when endocarditis on the differential — splenic abscess is a classic embolic complication.",
        why:  "Splenic abscess from IE upgrades duration to 6 weeks and may require valve surgery." },
    ],
  },

  /* === Toxic megacolon =================================================== */
  "toxic-megacolon": {
    cultures: [
      { sev: "required",
        what: "**Stool C. difficile NAAT** + standard enteric pathogen panel; two sets of peripheral blood cultures.",
        why:  "C. difficile is the dominant infectious cause; IBD-associated toxic megacolon still warrants infection workup." },
    ],
    biomarkers: [
      { sev: "required",
        what: "CBC, CMP, lactate, **albumin, CRP**; venous gas for acidosis.",
        why:  "Albumin < 2.5 + lactate rise + WBC ≥ 15 define fulminant C. difficile and gate colectomy decision." },
    ],
    imaging: [
      { sev: "required",
        what: "**Abdominal radiograph or CT abdomen** — colonic dilation > 6 cm (or cecum > 9 cm) confirms diagnosis.",
        why:  "Toxic megacolon is a surgical emergency; serial imaging gates colectomy timing — mortality > 50% if delayed." },
    ],
  },

  /* === Mesenteric ischemia =============================================== */
  "mesenteric-isch": {
    cultures: [
      { sev: "trigger",
        what: "Two sets of peripheral blood cultures when sepsis, peritonitis, or transmural infarction suspected.",
        why:  "Bacterial translocation drives polymicrobial bacteremia in late mesenteric ischemia; identifies gut flora." },
    ],
    biomarkers: [
      { sev: "required",
        what: "**Lactate** at presentation and serially; CBC, CMP, lipase, LDH, venous gas.",
        why:  "Lactate rise is the diagnostic anchor; **normal lactate does not exclude early ischemia**, rising lactate mandates laparotomy." },
    ],
    imaging: [
      { sev: "required",
        what: "**CT angiography abdomen/pelvis** within the first hour — arterial + venous phases define occlusion site.",
        why:  "CTA is the apex test: distinguishes embolic (SMA), thrombotic, non-occlusive, and venous ischemia — each drives different therapy." },
      { sev: "trigger",
        what: "Diagnostic laparoscopy or laparotomy when peritonitis, lactate rise, or transmural infarction on CTA.",
        why:  "Bowel viability assessment is surgical; resection of infarcted segment is the only durable intervention." },
    ],
  },

};
