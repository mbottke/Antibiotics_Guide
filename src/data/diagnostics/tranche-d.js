/* data · diagnostics/tranche-d — Wave 5 PR-6e content tranche.

   25 syndromes: SSTI/bone/joint first half + full CNS block +
   toxin-mediated first half. Authored at the apex bar per the
   schema in the aggregator. Authored in parallel with tranche-b/c/e
   per the plan's multi-agent matrix.

   Schema documented in src/data/diagnostics.js (the aggregator).
   Inpatient Antibiotic Guide — module graph in README.md. */

export const TRANCHE_D_DIAGNOSTICS = {

  /* === Purulent SSTI / cutaneous abscess ================================= */
  purulent: {
    cultures: [
      { sev: "required",
        what: "**Wound culture from abscess fluid at I&D** — swab the cavity wall, not surface pus.",
        why:  "I&D is the curative step; culture identifies MRSA vs MSSA and detects unusual organisms (water, animal exposure)." },
      { sev: "trigger",
        what: "Two sets of blood cultures if febrile, immunocompromised, or sepsis criteria.",
        why:  "Uncomplicated purulent SSTI rarely bacteremic; positives upgrade to systemic disease and IV therapy." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "CBC, CRP only when systemic features present or hospitalized.",
        why:  "Markers track response when symptoms obscured; not required for outpatient I&D plus oral course." },
    ],
    panels: [
      { sev: "consider",
        what: "MRSA nares PCR for de-escalation when empiric anti-MRSA started.",
        why:  "Negative nares does not exclude SSTI MRSA but supports narrowing if wound culture also negative." },
    ],
    imaging: [
      { sev: "trigger",
        what: "Bedside ultrasound when abscess vs cellulitis is uncertain or to locate deep collections.",
        why:  "Confirms drainable fluid; redirects from antibiotics-only to definitive I&D — the curative step." },
    ],
  },

  /* === Necrotizing soft-tissue infection ================================= */
  necfasc: {
    cultures: [
      { sev: "required",
        what: "**Deep tissue cultures at operative debridement** plus two sets of blood cultures pre-op.",
        why:  "Operative tissue is the only reliable source; surface swabs miss the polymicrobial deep flora driving disease." },
      { sev: "trigger",
        what: "Gram stain of operative tissue at exploration — single Gram-positive cocci raise GAS / clostridial alarm.",
        why:  "Monomicrobial type II disease (GAS, clostridia) drives clindamycin + IVIG decisions same day." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Lactate, WBC, Na, Cr, glucose, CRP, Hb — calculate **LRINEC** (score ≥ 6 high-risk; ≥ 8 strongly predictive).",
        why:  "Supports diagnosis when exam equivocal; never replaces operative exploration if clinical suspicion high." },
    ],
    imaging: [
      { sev: "trigger",
        what: "CT only when diagnosis genuinely uncertain AND patient stable — **imaging never delays OR**.",
        why:  "Gas in fascia, fascial thickening support diagnosis; absence does not exclude — surgery is both diagnostic and therapeutic." },
    ],
    biopsy: [
      { sev: "required",
        what: "**Operative exploration is the definitive diagnostic step** — frozen section if dermal viability uncertain.",
        why:  "Direct visualization of grey, friable fascia with no bleeding clinches diagnosis; debridement is the only cure." },
    ],
  },

  /* === Diabetic foot infection =========================================== */
  dfi: {
    cultures: [
      { sev: "required",
        what: "**Deep tissue or curettage culture after debridement**, not superficial swab.",
        why:  "Swabs pick up colonizers; deep culture identifies the true pathogen and resistance pattern driving therapy." },
      { sev: "trigger",
        what: "Bone biopsy for culture + histopathology when osteomyelitis suspected (probe-to-bone, ulcer > 2 cm or > 6 weeks).",
        why:  "Bone biopsy is the gold standard; changes duration from 1–3 weeks (soft tissue) to 6 weeks (bone)." },
      { sev: "trigger",
        what: "Two sets of blood cultures if systemic signs or moderate-to-severe IDSA grade.",
        why:  "Bacteremia is uncommon but upgrades therapy intensity and gates IV vs oral route." },
    ],
    biomarkers: [
      { sev: "required",
        what: "**ESR > 70** and CRP at baseline — high values support osteomyelitis even with normal radiograph.",
        why:  "ESR > 70 has PPV ~90% for diabetic foot osteomyelitis; trending guides duration in clinical responders." },
      { sev: "required",
        what: "HbA1c, creatinine, vascular assessment (ABI, toe pressure).",
        why:  "Glycemic control and perfusion drive healing; vascular optimization may need to precede definitive therapy." },
    ],
    imaging: [
      { sev: "required",
        what: "Plain radiograph at presentation; repeat at 2–4 weeks if osteomyelitis suspected and initial normal.",
        why:  "Cortical destruction lags 2–4 weeks; serial XR cheap screening before MRI." },
      { sev: "trigger",
        what: "**MRI foot** when osteomyelitis suspected and plain film non-diagnostic — sensitivity ~90%.",
        why:  "Distinguishes soft-tissue infection, abscess, osteomyelitis, Charcot — each demands different management." },
    ],
  },

  /* === Surgical site infection =========================================== */
  ssi: {
    cultures: [
      { sev: "required",
        what: "**Deep wound culture at re-opening / debridement** — aerobic + anaerobic.",
        why:  "Pathogen depends on operative site (skin flora for clean cases; polymicrobial for GI / gyn / head-neck)." },
      { sev: "trigger",
        what: "Two sets of blood cultures if febrile, sepsis criteria, or deep/organ-space SSI.",
        why:  "Bacteremia upgrades therapy and identifies endovascular complications in cardiac/vascular SSI." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "WBC, CRP trend post-op; rising values past day 4 raise SSI concern.",
        why:  "Post-op CRP normally peaks day 2–3 then falls; secondary rise suggests SSI before exam declares it." },
    ],
    imaging: [
      { sev: "trigger",
        what: "CT (site-specific) for deep / organ-space SSI to identify drainable collection.",
        why:  "Source control by IR drainage or re-operation is the curative step; antibiotics alone fail for collections." },
      { sev: "consider",
        what: "Bedside ultrasound for superficial wound collections.",
        why:  "Quick bedside screen for fluid pocket; positive directs to bedside opening, negative reassures." },
    ],
  },

  /* === Osteomyelitis (native) ============================================ */
  osteo: {
    cultures: [
      { sev: "required",
        what: "**Bone biopsy for culture + histopathology before antibiotics** in hematogenous and contiguous OM.",
        why:  "Bone culture is the gold standard; empiric therapy without pathogen risks 6 weeks of wrong drug." },
      { sev: "required",
        what: "Two sets of blood cultures — positive in 50–60% of hematogenous vertebral OM.",
        why:  "Bacteremia identifies the pathogen non-invasively; positive blood culture may obviate biopsy." },
    ],
    biomarkers: [
      { sev: "required",
        what: "**ESR and CRP** at baseline; trend weekly to monthly during therapy.",
        why:  "Failure of ESR / CRP to fall by 50% at 4 weeks suggests undrained focus or inadequate regimen." },
    ],
    panels: [
      { sev: "consider",
        what: "16S rRNA PCR or pathogen-specific PCR on biopsy when cultures negative after empiric exposure.",
        why:  "Recovers pathogen in culture-negative cases (especially Kingella, Bartonella, fastidious organisms)." },
    ],
    imaging: [
      { sev: "required",
        what: "**MRI with contrast** — sensitivity ~95% for vertebral OM; defines epidural and paraspinal extension.",
        why:  "Plain films lag 2–4 weeks; MRI changes both diagnosis and surgical decisions (epidural abscess)." },
      { sev: "trigger",
        what: "CT-guided biopsy when MRI confirms OM but blood cultures negative.",
        why:  "Targets the most enhancing tissue; image-guided yields ~50–70% pathogen recovery." },
    ],
  },

  /* === Septic arthritis (native joint) =================================== */
  "septic-arthritis": {
    cultures: [
      { sev: "required",
        what: "**Arthrocentesis before antibiotics** — synovial fluid Gram stain, culture, cell count, crystals.",
        why:  "Diagnosis and pathogen identification in one step; antibiotic exposure sterilizes fluid within hours." },
      { sev: "required",
        what: "Two sets of peripheral blood cultures — positive in ~50% of bacterial arthritis.",
        why:  "Recovers organism when synovial culture negative; identifies S. aureus driving the systemic picture." },
      { sev: "trigger",
        what: "Gonococcal NAAT (urethral, cervical, pharyngeal, rectal) in sexually active adults < 45.",
        why:  "Disseminated GC requires specific therapy; synovial culture for GC is low-yield (~25%)." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Synovial **WBC > 50,000** (often > 100,000) with > 90% PMNs supports bacterial arthritis.",
        why:  "Cell count gates initial empiric therapy while culture pending; crystals do not rule out infection." },
      { sev: "consider",
        what: "Serum CRP, ESR baseline + trend during therapy.",
        why:  "Tracks response across the 2–4 week course; failure to normalize raises retained focus concern." },
    ],
    imaging: [
      { sev: "trigger",
        what: "MRI or CT when prosthetic joint, deep joint (hip, SI, sternoclavicular), or osteomyelitis suspected.",
        why:  "Deep joints not amenable to exam; MRI defines synovitis, effusion, and contiguous bone involvement." },
    ],
  },

  /* === Prosthetic joint infection ======================================== */
  pji: {
    cultures: [
      { sev: "required",
        what: "**≥ 3 (ideally 5–6) intraoperative tissue / membrane cultures** at debridement or revision.",
        why:  "Multiple samples disambiguate true pathogen from skin contaminant; same organism in ≥ 2 confirms PJI." },
      { sev: "required",
        what: "Synovial fluid aspirate pre-op — cell count, Gram stain, culture, alpha-defensin.",
        why:  "Synovial WBC > 3,000 + PMN > 80% supports PJI per MSIS criteria; aspirate avoids empiric over-treatment." },
      { sev: "trigger",
        what: "Hold antibiotics 2 weeks before aspirate / surgery if clinically safe.",
        why:  "Pre-aspirate antibiotic exposure cuts culture yield by 50%; pathogen identification gates definitive surgery." },
    ],
    biomarkers: [
      { sev: "required",
        what: "**ESR and CRP** — CRP > 10 mg/L or ESR > 30 mm/h are MSIS minor criteria.",
        why:  "Negative inflammatory markers have NPV ~90% for PJI; positive supports diagnosis when aspirate ambiguous." },
      { sev: "consider",
        what: "Synovial alpha-defensin and leukocyte esterase strip — high specificity for PJI.",
        why:  "Alpha-defensin sensitivity ~95%, specificity ~95%; supports diagnosis when other tests equivocal." },
    ],
    panels: [
      { sev: "consider",
        what: "Sonication of explanted hardware with culture — recovers biofilm organisms missed by tissue culture.",
        why:  "Boosts yield by 15–20% over tissue alone; particularly for low-virulence (S. epidermidis, Cutibacterium)." },
    ],
    imaging: [
      { sev: "required",
        what: "Plain radiograph — loosening, osteolysis, periosteal reaction suggest chronic PJI.",
        why:  "Radiographic loosening drives one-stage vs two-stage decision; baseline for follow-up." },
      { sev: "consider",
        what: "Nuclear imaging (WBC scan + sulfur colloid) when diagnosis remains uncertain after aspirate.",
        why:  "Differentiates aseptic loosening from infection in equivocal cases; MRI degraded by hardware artifact." },
    ],
  },

  /* === Pyomyositis ======================================================= */
  pyomyositis: {
    cultures: [
      { sev: "required",
        what: "**Image-guided aspirate or surgical drainage culture** — aerobic, anaerobic, mycobacterial, fungal.",
        why:  "S. aureus dominates (~90%) but tropical, immunocompromised, and chronic cases need broader workup." },
      { sev: "required",
        what: "Two sets of peripheral blood cultures — positive in 5–30%.",
        why:  "Blood culture pathogen may be the only positive; supports therapy when aspirate sterilized by pre-treatment." },
    ],
    biomarkers: [
      { sev: "required",
        what: "CBC, CRP, ESR, **CK** at baseline.",
        why:  "CK often normal early but rises with extensive disease; CRP / ESR trend gates duration." },
      { sev: "consider",
        what: "HIV test in any pyomyositis — strong association with immunosuppression.",
        why:  "Identifies underlying immunodeficiency driving recurrence and changes ART decisions." },
    ],
    imaging: [
      { sev: "required",
        what: "**MRI with contrast** — defines abscess vs phlegmon and guides drainage.",
        why:  "Stage 1 (phlegmon) responds to antibiotics alone; stage 2–3 (abscess) requires drainage." },
      { sev: "trigger",
        what: "CT or ultrasound when MRI unavailable or for image-guided drainage planning.",
        why:  "Bedside US adequate for superficial collections; CT for deep / multifocal disease." },
    ],
  },

  /* === Septic bursitis =================================================== */
  bursitis: {
    cultures: [
      { sev: "required",
        what: "**Bursal fluid aspirate before antibiotics** — Gram stain, culture, cell count, crystals.",
        why:  "Distinguishes septic from crystal / traumatic bursitis; S. aureus dominates (> 80%) when infected." },
      { sev: "trigger",
        what: "Blood cultures only if febrile, immunocompromised, or sepsis features.",
        why:  "Bacteremia uncommon in uncomplicated bursitis; positives signal deep extension or systemic disease." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "Bursal fluid WBC; > 2,000 with PMN predominance supports septic etiology.",
        why:  "Lower threshold than septic joint (closed space without articular cartilage); guides empiric continuation." },
    ],
    imaging: [
      { sev: "consider",
        what: "Ultrasound to characterize collection and guide aspiration when landmarks unclear.",
        why:  "Bedside imaging supports complete drainage; MRI reserved for suspected deep extension or osteomyelitis." },
    ],
  },

  /* === Infected pressure injury ========================================== */
  pressure: {
    cultures: [
      { sev: "required",
        what: "**Deep tissue culture or bone biopsy after debridement** — never surface swab.",
        why:  "Surface flora reflects colonization, not pathogen; deep culture or bone changes therapy in > 50% of cases." },
      { sev: "trigger",
        what: "Two sets of blood cultures if febrile, sepsis features, or suspected osteomyelitis.",
        why:  "Polymicrobial bacteremia identifies the dominant pathogen and gates IV therapy duration." },
    ],
    biomarkers: [
      { sev: "trigger",
        what: "ESR, CRP, albumin — high ESR / CRP raise osteomyelitis concern; albumin tracks nutrition.",
        why:  "Nutritional optimization (albumin, prealbumin) is non-negotiable for wound healing alongside antibiotics." },
    ],
    imaging: [
      { sev: "trigger",
        what: "**MRI pelvis / sacrum** when osteomyelitis suspected (probe-to-bone, exposed bone, non-healing).",
        why:  "Confirms bone involvement that extends therapy from 1–2 weeks (soft tissue) to 6 weeks (bone)." },
      { sev: "consider",
        what: "CT to characterize abscess, sinus tract, deep fluid collection.",
        why:  "Sinus tracts and deep pockets need surgical management; antibiotics alone fail with retained necrotic tissue." },
    ],
  },

  /* === Fournier gangrene ================================================= */
  fournier: {
    cultures: [
      { sev: "required",
        what: "**Deep tissue culture at operative debridement** plus two sets of blood cultures pre-op.",
        why:  "Polymicrobial GI / GU flora drives disease; tissue culture defines pathogen for definitive narrowing." },
      { sev: "trigger",
        what: "Urine culture and rectal swab if GU or GI source suspected as portal.",
        why:  "Identifies source-control target (urinary obstruction, perirectal abscess) that may need separate intervention." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Lactate, WBC, Cr, glucose, CRP, Hb — **Fournier Gangrene Severity Index (FGSI)** at presentation.",
        why:  "FGSI > 9 predicts mortality > 75%; gates ICU disposition and urgency of operative consult." },
    ],
    imaging: [
      { sev: "trigger",
        what: "CT pelvis only if stable AND source unclear — never delay OR for imaging.",
        why:  "Identifies retroperitoneal extension and source (perirectal, GU); surgical debridement is the cure." },
    ],
    biopsy: [
      { sev: "required",
        what: "**Emergent operative debridement is diagnostic and therapeutic** — frozen section if margins uncertain.",
        why:  "Time-to-OR is the single largest survival determinant; every hour of delay raises mortality." },
    ],
  },

  /* === Animal & human bite wounds ======================================== */
  bites: {
    cultures: [
      { sev: "required",
        what: "**Deep wound culture (aerobic + anaerobic) when infected**; superficial swab unhelpful in fresh bites.",
        why:  "Pasteurella, Capnocytophaga (dogs/cats), Eikenella (humans) drive choice; anaerobes universal in deep wounds." },
      { sev: "trigger",
        what: "Two sets of blood cultures if sepsis, asplenia, or immunocompromise (Capnocytophaga risk).",
        why:  "Capnocytophaga sepsis in asplenic / cirrhotic patients carries > 30% mortality; needs early identification." },
    ],
    biomarkers: [
      { sev: "trigger",
        what: "**HIV, HBV, HCV serology** on source (if known) and victim for human bites with blood exposure.",
        why:  "Human bites carry viral transmission risk; baseline + 3/6 month serology guides post-exposure prophylaxis." },
    ],
    panels: [
      { sev: "required",
        what: "Tetanus immunization status; **rabies risk assessment** for animal exposure (species, behavior, vaccination, jurisdiction).",
        why:  "Tetanus prophylaxis (Td/Tdap ± TIG) and rabies PEP (RIG + vaccine series) are time-sensitive parallel decisions on every bite." },
    ],
    imaging: [
      { sev: "trigger",
        what: "Plain radiograph for clenched-fist (fight bite) injuries — assess for fracture, foreign body, joint involvement.",
        why:  "MCP joint penetration in fight bites drives operative washout; tooth fragments retained as foci." },
      { sev: "consider",
        what: "MRI when osteomyelitis or septic arthritis suspected from deep bite penetration.",
        why:  "Late-presenting bites with joint or bone involvement need extended therapy and specialist input." },
    ],
  },

  /* === Healthcare-associated ventriculitis =============================== */
  ventriculitis: {
    cultures: [
      { sev: "required",
        what: "**CSF from EVD/shunt for Gram stain, culture, cell count, glucose, protein** before antibiotics.",
        why:  "CSF is the definitive diagnostic; pathogen profile (CoNS, S. aureus, GNR including Pseudomonas) gates regimen." },
      { sev: "required",
        what: "Two sets of peripheral blood cultures.",
        why:  "Bacteremia upgrades therapy; concordant blood + CSF culture confirms causation vs colonization." },
      { sev: "trigger",
        what: "Repeat CSF at 48–72 h to document sterilization; daily if intraventricular antibiotics dosed.",
        why:  "Persistent positive CSF gates hardware removal and intraventricular therapy escalation." },
    ],
    biomarkers: [
      { sev: "required",
        what: "**CSF lactate > 4 mmol/L** and CSF / serum glucose ratio < 0.4 distinguish infection from chemical irritation.",
        why:  "Post-neurosurgical pleocytosis is non-specific; lactate and glucose ratio differentiate true ventriculitis." },
    ],
    panels: [
      { sev: "consider",
        what: "BioFire ME panel is **not validated** for device CSF — covers only community organisms and misses CoNS, Pseudomonas, Acinetobacter.",
        why:  "A negative panel in ventriculitis creates dangerous false reassurance for de-escalation; relies on quantitative culture + 16S PCR." },
    ],
    imaging: [
      { sev: "trigger",
        what: "**MRI brain with contrast** for ependymal enhancement, abscess, or hydrocephalus.",
        why:  "Identifies complications (loculation, abscess) that require hardware revision or surgical drainage." },
    ],
  },

  /* === Brain abscess ===================================================== */
  brainabscess: {
    cultures: [
      { sev: "required",
        what: "**Stereotactic / open aspiration of abscess** — Gram stain, aerobic/anaerobic culture, fungal, AFB, 16S PCR.",
        why:  "Polymicrobial in 30–60%; pathogen drives 6–8 week therapy and gates surgical re-aspiration." },
      { sev: "required",
        what: "Two sets of peripheral blood cultures.",
        why:  "Positive in ~25% of hematogenous abscess; supports source identification (IE, lung abscess)." },
    ],
    biomarkers: [
      { sev: "trigger",
        what: "HIV test; consider serologies for Toxoplasma, Cysticercus, Bartonella based on epidemiology.",
        why:  "Immunocompromised host expands differential to parasitic, fungal, nocardial — changes empiric regimen." },
    ],
    panels: [
      { sev: "consider",
        what: "16S rRNA PCR on aspirate when culture-negative after empiric exposure.",
        why:  "Recovers pathogen in ~30% of culture-negative cases; targets narrowing during long course." },
    ],
    imaging: [
      { sev: "required",
        what: "**MRI brain with contrast + diffusion** — sensitivity ~95%; DWI restricted in abscess, not tumor.",
        why:  "Distinguishes abscess from neoplasm; defines size, multiplicity, location for surgical planning." },
      { sev: "trigger",
        what: "CT or MRI of suspected primary source (sinuses, teeth, lung, heart).",
        why:  "Contiguous (sinus, dental) vs hematogenous (IE, lung) drives both surgical and primary source intervention." },
      { sev: "trigger",
        what: "**Avoid LP when mass effect present** — herniation risk; abscess aspirate is the diagnostic step, not CSF.",
        why:  "LP is contraindicated with significant mass effect; pathogen comes from operative aspirate, not lumbar puncture." },
    ],
  },

  /* === Spinal epidural abscess =========================================== */
  epidural: {
    cultures: [
      { sev: "required",
        what: "**Two sets of peripheral blood cultures before antibiotics** — positive in 60%.",
        why:  "Hematogenous origin common; blood culture may be the only pathogen source if surgery delayed." },
      { sev: "required",
        what: "CT-guided or operative aspirate culture (aerobic, anaerobic, fungal, AFB).",
        why:  "S. aureus dominates (~65%); tissue culture defines pathogen for 6-week directed therapy." },
    ],
    biomarkers: [
      { sev: "required",
        what: "**ESR and CRP** — almost always elevated (> 90% sensitivity); normal values lower probability.",
        why:  "Combined with risk factors (IVDU, hemodialysis, recent procedure) drives MRI urgency." },
    ],
    imaging: [
      { sev: "required",
        what: "**Emergent MRI whole spine with contrast** — defines extent, cord compression, vertebral OM.",
        why:  "Sensitivity ~95%; neurologic deficit + abscess = emergent decompression — delay risks irreversible paralysis." },
      { sev: "trigger",
        what: "CT myelogram if MRI contraindicated; CT alone is inadequate for cord and epidural space.",
        why:  "Pacemaker / hardware patients still need MRI-equivalent definition; CT misses small but cord-compressing collections." },
      { sev: "trigger",
        what: "**LP contraindicated** when epidural abscess suspected — risk of inoculating CSF and herniation; imaging precedes LP.",
        why:  "Pathogen comes from blood or operative tissue, not lumbar puncture; LP routes infection toward neuraxis." },
    ],
  },

  /* === Subdural empyema ================================================== */
  "subdural-empyema": {
    cultures: [
      { sev: "required",
        what: "**Operative aspiration of empyema** — Gram stain, aerobic / anaerobic / fungal culture, 16S PCR.",
        why:  "Streptococcus anginosus group and anaerobes dominate; tissue culture drives 6-week therapy." },
      { sev: "required",
        what: "Two sets of peripheral blood cultures.",
        why:  "Positive in ~10–20%; supports diagnosis when surgical sampling delayed." },
    ],
    biomarkers: [
      { sev: "required",
        what: "CBC, CRP, glucose; review sinus and otologic exam findings.",
        why:  "Sinusitis / otitis is the source in > 60%; concurrent treatment of primary focus is non-negotiable." },
    ],
    imaging: [
      { sev: "required",
        what: "**MRI brain with contrast + DWI** — defines crescentic collection and parenchymal involvement.",
        why:  "DWI distinguishes empyema from sterile effusion; sensitivity ~95%; gates emergent neurosurgical drainage." },
      { sev: "required",
        what: "CT / MRI sinuses and mastoids to identify primary source.",
        why:  "Source must be addressed surgically alongside cranial drainage; failure to clear primary drives recurrence." },
      { sev: "trigger",
        what: "**LP contraindicated with significant mass effect** — operative aspiration is both diagnostic and therapeutic.",
        why:  "Herniation risk; pathogen identification comes from the collection, not lumbar puncture." },
    ],
  },

  /* === Post-neurosurgical / healthcare-associated meningitis ============= */
  "post-nsx-meningitis": {
    cultures: [
      { sev: "required",
        what: "**CSF Gram stain, culture, cell count, glucose, protein, lactate** before antibiotics.",
        why:  "Healthcare-associated pathogens (CoNS, S. aureus, GNR, Pseudomonas, Acinetobacter) drive broader empiric." },
      { sev: "required",
        what: "Two sets of peripheral blood cultures.",
        why:  "Bacteremia supports causation when CSF Gram negative; identifies systemic complications." },
      { sev: "trigger",
        what: "Repeat CSF at 48–72 h to confirm sterilization; daily if intraventricular antibiotics dosed.",
        why:  "Persistent positive CSF triggers hardware removal and intraventricular escalation." },
    ],
    biomarkers: [
      { sev: "required",
        what: "**CSF lactate > 4 mmol/L** + CSF/serum glucose < 0.4 distinguish infection from post-op chemical meningitis.",
        why:  "Post-operative pleocytosis is non-specific; lactate and glucose ratio differentiate true bacterial meningitis." },
    ],
    panels: [
      { sev: "consider",
        what: "BioFire ME panel is **not validated** for post-neurosurgical CSF — designed for community LP, omits CoNS, Pseudomonas, Acinetobacter.",
        why:  "Negative panel creates false reassurance; nosocomial pathogens not in target set. Quantitative culture + 16S PCR remain the diagnostic anchor." },
    ],
    imaging: [
      { sev: "trigger",
        what: "MRI brain when complications suspected (ventriculitis, abscess, hydrocephalus).",
        why:  "Imaging supports surgical decisions: hardware revision, external drainage, abscess aspiration." },
    ],
  },

  /* === Septic cavernous sinus thrombosis ================================= */
  "cavernous-thromb": {
    cultures: [
      { sev: "required",
        what: "**Two sets of peripheral blood cultures before antibiotics** — positive in ~70%.",
        why:  "S. aureus dominates (~70%); hematogenous source identification gates 4–6 week directed therapy." },
      { sev: "trigger",
        what: "Culture of primary source (sinus aspirate, dental abscess, orbital collection).",
        why:  "Primary source must be drained alongside antibiotics; identifies polymicrobial / anaerobic contribution." },
    ],
    biomarkers: [
      { sev: "required",
        what: "CBC, CRP, ESR, D-dimer; coagulation studies before considering anticoagulation.",
        why:  "Anticoagulation is controversial but commonly used; baseline coags gate decision and monitor bleeding risk." },
    ],
    imaging: [
      { sev: "required",
        what: "**MRI brain with MRV / contrast-enhanced MRV** — defines cavernous sinus filling defect and complications.",
        why:  "MRV sensitivity ~90%; identifies extension to other sinuses, meningitis, abscess, mycotic aneurysm." },
      { sev: "trigger",
        what: "CT venogram if MRI contraindicated; CT sinuses / orbits for primary source.",
        why:  "Sinusitis (sphenoid, ethmoid) and facial cellulitis are the dominant sources requiring drainage." },
    ],
  },

  /* === CSF shunt / drain infection ======================================= */
  "shunt-infection": {
    cultures: [
      { sev: "required",
        what: "**CSF from shunt reservoir / EVD** before antibiotics — Gram stain, culture, cell count, glucose, protein.",
        why:  "CoNS dominates (~40%), then S. aureus and GNR; pathogen drives hardware removal vs salvage decision." },
      { sev: "required",
        what: "Two sets of peripheral blood cultures.",
        why:  "Ventriculoatrial shunts particularly prone to bacteremia; blood culture identifies endovascular complications." },
      { sev: "trigger",
        what: "Culture of explanted hardware (sonication boosts yield) when shunt removed.",
        why:  "Biofilm organisms missed by routine culture; sonication recovers 15–20% more isolates." },
    ],
    biomarkers: [
      { sev: "required",
        what: "**CSF lactate > 4 mmol/L** + glucose ratio < 0.4 distinguish true infection from baseline shunt abnormalities.",
        why:  "Hydrocephalus and chronic shunt presence elevate baseline CSF protein; lactate and glucose ratio more specific." },
    ],
    imaging: [
      { sev: "trigger",
        what: "CT or MRI brain for ventriculitis, abscess, shunt malfunction.",
        why:  "Hydrocephalus / loculation drive emergent EVD placement; abscess requires aspiration." },
      { sev: "consider",
        what: "Abdominal ultrasound / CT for VP shunt — pseudocyst, peritonitis.",
        why:  "Distal infections (peritoneal pseudocyst, pleural collection) need separate drainage decisions." },
    ],
  },

  /* === Neuroborreliosis / neurosyphilis ================================== */
  "neuro-lyme-syphilis": {
    cultures: [
      { sev: "required",
        what: "**Serum Lyme two-tier (EIA + IgM/IgG Western blot)** AND **serum RPR + treponemal-specific test (FTA-ABS or TPPA)**.",
        why:  "Serology is the entry point — culture not routinely used; positive serum mandates CSF workup." },
      { sev: "required",
        what: "**LP with CSF VDRL, cell count, protein, glucose** for neurosyphilis; CSF Lyme antibody index for neuro-Lyme.",
        why:  "CSF VDRL specific (positive confirms) but ~30–70% sensitive; CSF/serum antibody index defines neuro-Lyme." },
    ],
    biomarkers: [
      { sev: "trigger",
        what: "HIV test in all neurosyphilis — co-infection alters therapy and gates ART.",
        why:  "HIV / syphilis co-infection accelerates progression; HIV diagnosis cascades into ART decisions same encounter." },
      { sev: "consider",
        what: "CSF CXCL13 in neuro-Lyme research / equivocal cases — elevated supports active CNS infection.",
        why:  "Adjunct when serology and antibody index disagree; not standard in all labs." },
    ],
    panels: [
      { sev: "consider",
        what: "CSF Borrelia PCR — high specificity, low sensitivity (~10–30%); positive supports diagnosis when serology ambiguous.",
        why:  "Negative PCR does not exclude; positive confirms in early disease or when serology equivocal." },
    ],
    imaging: [
      { sev: "trigger",
        what: "MRI brain with contrast in neurosyphilis with cognitive / focal symptoms (gummas, vasculitis).",
        why:  "Identifies meningovascular complications, gummas, atrophy — supports diagnosis and tracks treatment response." },
    ],
  },

  /* === Toxic shock syndrome ============================================== */
  tss: {
    cultures: [
      { sev: "required",
        what: "**Two sets of peripheral blood cultures + source cultures (wound, vagina, sinus, throat)**.",
        why:  "Staphylococcal TSS often blood-culture-negative (toxin-mediated); streptococcal TSS bacteremic in > 50%." },
      { sev: "required",
        what: "Remove and culture any retained foreign body (tampon, packing, surgical material).",
        why:  "Source removal is therapeutic; retained foci sustain toxin production despite appropriate antibiotics." },
    ],
    biomarkers: [
      { sev: "required",
        what: "CBC, CMP, Cr, AST/ALT, CK, lactate, coagulation — **CDC criteria require multi-organ involvement**.",
        why:  "Multi-organ dysfunction (≥ 3 systems) is diagnostic; severity drives ICU, pressor, and clindamycin decisions." },
    ],
    panels: [
      { sev: "consider",
        what: "TSST-1, enterotoxin testing on isolate at reference labs for atypical / recurrent cases.",
        why:  "Toxin gene confirmation supports epidemiologic investigation; rarely changes acute management." },
    ],
    imaging: [
      { sev: "trigger",
        what: "CT to identify deep source (necrotizing fasciitis, retained packing, sinusitis) when source unclear.",
        why:  "Source control is the single largest survival determinant; imaging finds the focus exam misses." },
    ],
  },

  /* === Gas gangrene / clostridial myonecrosis ============================ */
  "gas-gangrene": {
    cultures: [
      { sev: "required",
        what: "**Deep tissue Gram stain + anaerobic culture at operative debridement** — large gram-positive rods without inflammation.",
        why:  "Clostridium perfringens dominates traumatic / post-op; C. septicum signals occult colonic malignancy." },
      { sev: "required",
        what: "Two sets of peripheral blood cultures pre-op.",
        why:  "Bacteremia common; intravascular hemolysis from alpha-toxin is a fingerprint finding." },
    ],
    biomarkers: [
      { sev: "required",
        what: "CBC (hemolysis), CMP, CK, lactate, haptoglobin, coagulation — **massive CK rise and hemolysis** are red flags.",
        why:  "Intravascular hemolysis and massive myonecrosis define clostridial disease; severity gates hyperbaric and surgical urgency." },
    ],
    imaging: [
      { sev: "trigger",
        what: "**Colonoscopy after recovery if C. septicum identified** — occult colon cancer in > 50%.",
        why:  "C. septicum bacteremia / myonecrosis is a paraneoplastic sentinel; missing the cancer is the cost of skipping the scope." },
      { sev: "trigger",
        what: "Plain XR or CT for gas in tissue — supports diagnosis but **never delays operative debridement**.",
        why:  "Soft-tissue gas is supportive; absence does not exclude — clinical pain out of proportion drives OR." },
    ],
    biopsy: [
      { sev: "required",
        what: "**Emergent operative debridement is diagnostic and curative** — wide excision often required.",
        why:  "Surgical clock is the dominant survival lever; antibiotics and hyperbaric are adjuncts, not replacements." },
    ],
  },

  /* === Tetanus =========================================================== */
  tetanus: {
    cultures: [
      { sev: "consider",
        what: "**Wound culture rarely diagnostic** — C. tetani recovered in < 30% even in clear cases; diagnosis is clinical (trismus, spasms, rigidity).",
        why:  "Negative culture does not exclude; positive does not confirm. Begin treatment (TIG, antitoxin, metronidazole, supportive care) on clinical suspicion." },
    ],
    biomarkers: [
      { sev: "trigger",
        what: "Anti-tetanus IgG titer pre-treatment — protective level (> 0.1 IU/mL) makes diagnosis very unlikely.",
        why:  "Adequate antibody titer at presentation argues strongly against tetanus; useful for ruling out, not in." },
    ],
    imaging: [
      { sev: "consider",
        what: "Imaging only to evaluate complications (aspiration pneumonia, rhabdo-related AKI, fracture from spasms).",
        why:  "No imaging supports the diagnosis itself; secondary injury workup tracks complications during ICU course." },
    ],
  },

  /* === Botulism ========================================================== */
  botulism: {
    cultures: [
      { sev: "required",
        what: "**Stool culture + toxin assay (mouse bioassay)** on stool, serum, gastric aspirate, food, wound.",
        why:  "Toxin in serum / stool is confirmatory; testing arranged through state health department / CDC." },
      { sev: "trigger",
        what: "Wound culture for C. botulinum in wound botulism (especially IVDU black-tar heroin).",
        why:  "Wound botulism increasingly recognized in injection drug users; culture supports diagnosis and source control." },
    ],
    biomarkers: [
      { sev: "required",
        what: "**Botulism is a clinical diagnosis** — bulbar palsies, symmetric descending paralysis, intact sensation, normal mentation.",
        why:  "Antitoxin given on clinical suspicion; toxin assay confirms retrospectively but never gates initial therapy." },
      { sev: "trigger",
        what: "**Edrophonium (Tensilon), nerve conduction studies (EMG)** to distinguish from MG and Guillain-Barré.",
        why:  "EMG shows incremental response to repetitive stimulation in botulism (decremental in MG); distinguishes the differential." },
    ],
    imaging: [
      { sev: "consider",
        what: "MRI brain / spine only to exclude central / spinal cord differential when presentation atypical.",
        why:  "No imaging supports botulism itself; rules out brainstem stroke or transverse myelitis when picture unclear." },
    ],
  },

  /* === Enteric fever (typhoid / paratyphoid) ============================= */
  "enteric-fever": {
    cultures: [
      { sev: "required",
        what: "**Three sets of peripheral blood cultures** in week 1 — highest yield (~80%).",
        why:  "Salmonella Typhi / Paratyphi confirmed by culture; yield falls week 2–3 as bacteremia clears." },
      { sev: "required",
        what: "Stool culture week 2–3 and urine culture week 3–4 — yield rises as blood culture falls.",
        why:  "Time-staggered culture yield; stool / urine positive supports diagnosis when blood culture negative." },
      { sev: "trigger",
        what: "Bone marrow culture if culture-negative after pre-treatment — sensitivity > 90% even after antibiotics.",
        why:  "Highest-yield specimen when patient presented late or after empiric exposure; reserved for diagnostic uncertainty." },
    ],
    biomarkers: [
      { sev: "required",
        what: "CBC (relative bradycardia, leukopenia), LFTs (mild transaminitis), CRP — supportive features.",
        why:  "Relative bradycardia + leukopenia + fever raise pre-test probability and drive empiric coverage." },
    ],
    panels: [
      { sev: "consider",
        what: "Susceptibility testing including **azithromycin, ceftriaxone, ciprofloxacin** — H58 XDR strains widespread.",
        why:  "Fluoroquinolone resistance (DCS) common in South Asia; ceftriaxone first-line empirically pending sensitivities." },
    ],
    imaging: [
      { sev: "trigger",
        what: "CT abdomen for suspected intestinal perforation (week 3+ severe abdominal pain) or hepatosplenic abscess.",
        why:  "Ileal perforation is the dominant surgical complication in week 3; mortality > 25% if missed." },
    ],
  },

};
