/* data · diagnostics/tranche-e — Wave 5 PR-6e content tranche.

   ~24 syndromes: skin/soft-tissue/bone (second half) + remaining
   toxin-mediated + immunocompromised host. Authored at the apex
   bar per the schema in the aggregator. Authored in parallel with
   tranche-b/c/d per the plan's multi-agent matrix.

   Schema documented in src/data/diagnostics.js (the aggregator).
   Inpatient Antibiotic Guide — module graph in README.md. */

export const TRANCHE_E_DIAGNOSTICS = {

  /* === Mastitis ========================================================= */
  mastitis: {
    cultures: [
      { sev: "trigger",
        what: "Milk culture (lactational) or aspirate/tissue culture before antibiotics in hospitalized, recurrent, or treatment-failure cases.",
        why:  "Empiric anti-staph covers most lactational mastitis; culture matters when MRSA, failure, or non-lactational disease shifts choice." },
      { sev: "consider",
        what: "Two sets of blood cultures if febrile with sepsis criteria or immunocompromise.",
        why:  "Bacteremia is uncommon but identification narrows therapy and uncovers occult S. aureus seeding." },
    ],
    imaging: [
      { sev: "trigger",
        what: "Breast ultrasound when an abscess is suspected (firm/fluctuant mass, no response at **48–72 h**).",
        why:  "Drainable collections require aspiration or incision; antibiotics alone fail and recurrence is high." },
      { sev: "consider",
        what: "Diagnostic mammography or biopsy for non-lactational mastitis not resolving by 2 weeks.",
        why:  "Inflammatory breast cancer mimics mastitis; persistent disease demands tissue diagnosis to avoid missed malignancy." },
    ],
  },

  /* === Tubo-ovarian abscess ============================================= */
  "tubo-ovarian": {
    cultures: [
      { sev: "required",
        what: "Endocervical NAAT for **N. gonorrhoeae**, **C. trachomatis**, and **M. genitalium**; HIV and syphilis serology at presentation.",
        why:  "TOA is the severe end of the PID spectrum — same STI panel as PID; partner-notification and resistance-guided therapy follow." },
      { sev: "required",
        what: "Two sets of peripheral blood cultures before antibiotics in febrile or septic patients.",
        why:  "Bacteremia identifies anaerobic, GNR, or streptococcal pathogens that change empiric coverage." },
      { sev: "trigger",
        what: "Abscess fluid culture (aerobic + anaerobic) at drainage.",
        why:  "Polymicrobial yield (anaerobes, GNR, strep) guides definitive therapy when empiric coverage fails." },
    ],
    biomarkers: [
      { sev: "required",
        what: "CBC, CRP, lactate, beta-hCG at presentation.",
        why:  "Pregnancy alters imaging/antibiotic choice; lactate flags sepsis and shifts disposition." },
    ],
    imaging: [
      { sev: "required",
        what: "Transvaginal ultrasound first; CT or MRI pelvis when US equivocal or abscess > 5 cm.",
        why:  "US confirms abscess and size; abscess **≥ 7 cm** or failure at 48–72 h triggers drainage." },
    ],
  },

  /* === Mediastinitis ==================================================== */
  mediastinitis: {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures **before antibiotics**.",
        why:  "Bacteremia is common in post-sternotomy and descending mediastinitis; drives targeted therapy and duration." },
      { sev: "required",
        what: "Operative tissue / sternal wound cultures (aerobic, anaerobic, fungal) at debridement.",
        why:  "Polymicrobial yield (S. aureus, GNR, candida) defines definitive coverage after source control." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Lactate, CBC, CRP, procalcitonin at presentation and post-op.",
        why:  "Trends gate ICU support and source-control timing; PCT supports duration decisions after debridement." },
    ],
    imaging: [
      { sev: "required",
        what: "**CT chest with IV contrast** — defines collection, gas, sternal dehiscence, descending extension from neck.",
        why:  "Surgical emergency; CT defines the operative field and extent of necrosis for cardiothoracic consultation." },
      { sev: "trigger",
        what: "TTE (TEE if inconclusive) for post-sternotomy mediastinitis or persistent S. aureus bacteremia.",
        why:  "Mediastinitis extends to pericarditis / endocarditis in 5–15%; missed echocardiogram drives delayed surgical re-intervention." },
    ],
    biopsy: [
      { sev: "trigger",
        what: "Sternal bone or mediastinal tissue for histopathology + culture when osteomyelitis is suspected.",
        why:  "Sternal osteomyelitis extends duration to 6 weeks and may require hardware removal." },
    ],
  },

  /* === Vertebral osteomyelitis ========================================== */
  vertosteo: {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures **before antibiotics**; hold empiric therapy if hemodynamically stable.",
        why:  "Yield 30–60%; pre-antibiotic blood cultures often obviate biopsy and define organism + susceptibilities." },
      { sev: "required",
        what: "**Image-guided biopsy** of disc/vertebra for culture (aerobic, anaerobic, fungal, AFB) when blood cultures negative.",
        why:  "Pathogen identification mandatory for targeted 6-week course; empiric coverage fails 30% of culture-negative disease." },
    ],
    biomarkers: [
      { sev: "required",
        what: "ESR and CRP at baseline and serially — guides response and supports duration decisions.",
        why:  "Failure to halve CRP by week 4 predicts treatment failure; trends are core to oral-switch timing." },
    ],
    imaging: [
      { sev: "required",
        what: "**MRI spine with and without gadolinium** — sensitivity > 95% for discitis and epidural extension.",
        why:  "Defines vertebral, disc, paraspinal, and epidural involvement; epidural collection drives urgent neurosurgical consult." },
      { sev: "trigger",
        what: "Echocardiogram (TTE then TEE) when S. aureus, viridans strep, or enterococcus is recovered.",
        why:  "Endocarditis-associated vertebral osteo occurs in 10–30%; missed IE undertreats and drives relapse." },
    ],
  },

  /* === Orbital cellulitis =============================================== */
  orbital: {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures before antibiotics.",
        why:  "Bacteremia in postseptal disease alters duration and detects S. aureus, including MRSA seeding." },
      { sev: "trigger",
        what: "Sinus aspirate / abscess fluid culture (aerobic + anaerobic) at surgical drainage.",
        why:  "Polymicrobial yield from contiguous sinusitis guides definitive coverage and uncovers anaerobes." },
    ],
    biomarkers: [
      { sev: "required",
        what: "CBC, CRP, glucose at presentation; serial CRP to monitor response.",
        why:  "Hyperglycemia / DKA flags mucormycosis risk; CRP trend tracks response and supports oral-switch timing." },
    ],
    imaging: [
      { sev: "required",
        what: "**CT orbits and sinuses with IV contrast** to distinguish preseptal from postseptal disease and define abscess.",
        why:  "Subperiosteal or orbital abscess drives surgical drainage; visual loss and cavernous-sinus extension demand emergent intervention." },
      { sev: "trigger",
        what: "MRI brain/orbits with contrast when cavernous-sinus thrombosis, intracranial extension, or invasive fungal disease is suspected.",
        why:  "Defines vascular and parenchymal complications that change anticoagulation, surgical, and antifungal decisions." },
    ],
  },

  /* === Ludwig's angina ================================================== */
  ludwig: {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures before antibiotics; airway protection takes precedence.",
        why:  "Identifies streptococci and anaerobes; bacteremia changes duration and supports oral-step-down decisions." },
      { sev: "trigger",
        what: "Operative tissue / pus culture (aerobic + anaerobic) at incision and drainage.",
        why:  "Polymicrobial odontogenic flora (strep, anaerobes) defines definitive coverage when empiric regimen fails." },
    ],
    imaging: [
      { sev: "required",
        what: "**CT neck with IV contrast** to map submandibular spread, airway compromise, and drainable collection.",
        why:  "Defines fascial-space extension into mediastinum (descending mediastinitis), the dominant lethal complication." },
    ],
  },

  /* === Erysipelas ======================================================= */
  erysipelas: {
    cultures: [
      { sev: "consider",
        what: "Two sets of blood cultures only in severe disease (sepsis criteria, immunocompromise, lymphedema with bullae).",
        why:  "Yield is low (~5%) in classic facial/limb erysipelas; severe disease may yield invasive GAS." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "CBC, CRP at baseline if hospitalized; ASO titer rarely useful acutely.",
        why:  "Inflammatory markers track response in inpatient courses; ASO is retrospective and does not guide therapy." },
    ],
    imaging: [
      { sev: "trigger",
        what: "Bedside ultrasound if abscess suspected; CT/MRI only when necrotizing fasciitis enters differential.",
        why:  "Pain-out-of-proportion or rapid spread mandates emergent imaging — necrotizing demands surgery, not just antibiotics." },
    ],
  },

  /* === Lymphangitis ===================================================== */
  lymphangitis: {
    cultures: [
      { sev: "consider",
        what: "Blood cultures in febrile patients with rapid proximal spread or septic features.",
        why:  "Beta-hemolytic strep dominates; bacteremia uncommon but seeds joints and endocardium in immunocompromised hosts." },
      { sev: "trigger",
        what: "Wound / portal culture at inoculation site when accessible (puncture, bite, scratch).",
        why:  "Identifies atypical pathogens (sporothrix, mycobacteria, pasteurella) that change duration and class." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "CBC, CRP at baseline; track response in admitted patients.",
        why:  "Inflammatory trend supports oral-switch timing and identifies under-responders early." },
    ],
    imaging: [
      { sev: "consider",
        what: "Ultrasound for nodal abscess; CT if deep extension or treatment failure suspected.",
        why:  "Suppurative adenitis requires drainage; persistent disease may reflect Bartonella, mycobacteria, or sporothrix." },
    ],
  },

  /* === Hidradenitis suppurativa (infected) ============================== */
  hidradenitis: {
    cultures: [
      { sev: "trigger",
        what: "Aspirate or operative culture of fluctuant nodules / sinus tracts when antibiotics are being considered.",
        why:  "Mixed flora (S. aureus, anaerobes, strep) drives targeted choice; sterile cultures shift to non-infectious management." },
      { sev: "consider",
        what: "MRSA screening swab in recurrent disease or community-MRSA setting.",
        why:  "Recurrent purulent disease is often MRSA; positive nares informs empiric anti-MRSA decision." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "CBC, CRP, HbA1c, smoking status, BMI documented at flare.",
        why:  "Comorbidities drive recurrence; biologic candidacy (adalimumab) hinges on Hurley stage and inflammation burden." },
    ],
    imaging: [
      { sev: "trigger",
        what: "Ultrasound (or MRI) to map sinus tracts, abscesses, and fistulae before surgical planning.",
        why:  "Defines Hurley stage and surgical extent; imaging-guided drainage outperforms blind incision in recurrence." },
    ],
  },

  /* === Infected ulcer (venous / arterial / pressure-stage III–IV) ======= */
  "infected-ulcer": {
    cultures: [
      { sev: "trigger",
        what: "Deep tissue / curettage culture after debridement (NOT superficial swab) when clinical infection present.",
        why:  "Swabs reflect colonization; deep-tissue culture defines pathogen and resistance for targeted therapy." },
      { sev: "trigger",
        what: "Two sets of blood cultures if systemic signs (fever, leukocytosis, sepsis criteria).",
        why:  "Bacteremic chronic-ulcer infection identifies S. aureus, GNR, and anaerobes driving deep extension." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Ankle-brachial index in lower-extremity ulcers; HbA1c, albumin, prealbumin at baseline.",
        why:  "Arterial insufficiency precludes healing without revascularization; nutrition status gates wound recovery." },
    ],
    imaging: [
      { sev: "trigger",
        what: "Plain film first; **MRI** if osteomyelitis suspected (probe-to-bone, ulcer > 2 cm, persistent ESR > 70).",
        why:  "MRI sensitivity > 90% for underlying osteomyelitis; positive imaging extends duration to 6 weeks." },
    ],
    biopsy: [
      { sev: "consider",
        what: "Punch biopsy of non-healing ulcer edges after 3 months to exclude malignancy (Marjolin's ulcer).",
        why:  "Chronic ulcers can transform to SCC; biopsy ends the antibiotic cycle when neoplasia is found." },
    ],
  },

  /* === Perianal abscess ================================================= */
  "perianal-abscess": {
    cultures: [
      { sev: "trigger",
        what: "Abscess fluid culture (aerobic + anaerobic) at drainage in immunocompromised, recurrent, or complex disease.",
        why:  "GNR / anaerobe identification flags fistula-in-ano and Crohn's; sterile pus suggests Crohn's-related disease." },
      { sev: "trigger",
        what: "Two sets of blood cultures if febrile, immunocompromised, or sepsis criteria present.",
        why:  "Bacteremia identifies translocation, deep extension, or Fournier's gangrene early." },
    ],
    biomarkers: [
      { sev: "required",
        what: "CBC, CRP, glucose, lactate at presentation.",
        why:  "Lactate and leukocytosis flag necrotizing extension (Fournier's); hyperglycemia worsens outcomes." },
    ],
    imaging: [
      { sev: "trigger",
        what: "CT or MRI pelvis when deep, recurrent, or supralevator abscess suspected; transrectal US for intersphincteric.",
        why:  "Defines fistula tract and supralevator extension that demand operative drainage rather than bedside I&D." },
    ],
  },

  /* === Severe gastroenteritis =========================================== */
  "severe-gastroenteritis": {
    cultures: [
      { sev: "required",
        what: "Stool culture + multiplex GI PCR panel (BioFire FilmArray GI) when fever, bloody stool, or > 7 days symptoms.",
        why:  "Identifies Salmonella, Shigella, Campylobacter, STEC; STEC mandates AVOIDING antibiotics (HUS risk)." },
      { sev: "required",
        what: "Stool **C. difficile** NAAT/toxin in recent antibiotics or healthcare exposure with ≥ 3 unformed stools/24 h.",
        why:  "CDI mimics severe gastroenteritis; missed CDI drives relapse and toxic megacolon." },
      { sev: "trigger",
        what: "Two sets of peripheral blood cultures in febrile, immunocompromised, or sepsis-criteria patients.",
        why:  "Identifies invasive Salmonella, Campylobacter bacteremia, and listeria — each changes therapy and duration." },
    ],
    biomarkers: [
      { sev: "required",
        what: "BMP, lactate, CBC, lipase at presentation; CRP/procalcitonin support invasive disease.",
        why:  "Volume depletion, AKI, electrolyte derangement gate disposition; lactate flags ischemic mimic." },
    ],
    panels: [
      { sev: "consider",
        what: "Stool ova/parasite × 3 if > 7 days symptoms, immunocompromise, or travel exposure.",
        why:  "Giardia, cryptosporidium, cyclospora missed by routine cultures; PCR panels miss some parasites." },
    ],
    imaging: [
      { sev: "trigger",
        what: "CT abdomen/pelvis with IV contrast when toxic megacolon, ischemia, or perforation suspected.",
        why:  "Distinguishes inflammatory colitis from mesenteric ischemia and identifies surgical complications." },
    ],
  },

  /* === Febrile neutropenia (high-risk) ================================== */
  febneut: {
    cultures: [
      { sev: "required",
        what: "Two sets of blood cultures (one peripheral + one from each lumen of any central line) **before antibiotics**.",
        why:  "Differential time-to-positivity > 2 h confirms catheter-related bacteremia; gates line removal." },
      { sev: "required",
        what: "Urinalysis + urine culture; stool studies if diarrhea; respiratory culture if pulmonary symptoms.",
        why:  "Focal source identified in only ~30% of febrile neutropenia; broad sampling raises diagnostic yield." },
      { sev: "trigger",
        what: "Repeat blood cultures q48h until afebrile or clearance documented.",
        why:  "Persistent fevers with negative cultures at day 4–7 trigger antifungal and CT for occult focus." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Lactate, CBC with differential, CRP, procalcitonin at fever onset and serially.",
        why:  "Standard severity + ICU-disposition workup at fever onset; lactate gates pressors and source-control urgency." },
      { sev: "trigger",
        what: "Serum **galactomannan** + **1,3-β-D-glucan** at day 4–7 of persistent fever on broad-spectrum antibiotics.",
        why:  "IDSA febrile-neutropenia 2018: fungal biomarkers are gated to persistent fever > 4 d, not fever onset — earlier values are non-specific." },
    ],
    panels: [
      { sev: "trigger",
        what: "Rapid blood-culture pathogen panel (BioFire BCID2, Verigene) on first positive bottle.",
        why:  "Cuts time-to-pathogen by 24–36 h; mortality benefit when paired with stewardship in neutropenia." },
      { sev: "trigger",
        what: "**MRSA nares PCR** at admission — negative result has > 99% NPV and permits anti-MRSA de-escalation.",
        why:  "Highest-leverage stewardship test in febneut; turnaround under 2 h on most platforms." },
      { sev: "consider",
        what: "Respiratory viral PCR (influenza, RSV, SARS-CoV-2) in season or pulmonary symptoms.",
        why:  "Viral co-infection changes oseltamivir / paxlovid decisions and may permit antibacterial narrowing." },
    ],
    imaging: [
      { sev: "trigger",
        what: "**CT chest/sinuses/abdomen** at day **4–7** of persistent fever despite broad antibiotics.",
        why:  "Identifies occult mold pneumonia, typhlitis, or hepatosplenic candidiasis driving non-response." },
      { sev: "consider",
        what: "Sinus CT and ENT consult when periorbital pain, facial numbness, or epistaxis suggests invasive mold.",
        why:  "Rhino-orbital mucormycosis and aspergillus demand emergent debridement; delay drives mortality > 50%." },
    ],
  },

  /* === Typhlitis (neutropenic enterocolitis) ============================ */
  typhlitis: {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures before antibiotics; stool **C. difficile** NAAT.",
        why:  "Polymicrobial GNR / anaerobe / enterococcal bacteremia common; CDI mimics and changes therapy." },
      { sev: "consider",
        what: "Stool GI multiplex PCR for invasive pathogens; fungal blood cultures in prolonged neutropenia.",
        why:  "Salmonella, candida, and aspergillus complicate typhlitis; identification escalates antifungal coverage." },
    ],
    biomarkers: [
      { sev: "required",
        what: "CBC, lactate, lipase, CRP, procalcitonin at presentation.",
        why:  "Lactate flags transmural ischemia and perforation risk; lipase distinguishes pancreatic involvement." },
      { sev: "trigger",
        what: "**Galactomannan + 1,3-β-D-glucan** at day 4–7 of persistent fever on broad-spectrum coverage.",
        why:  "Invasive mold complicates typhlitis in prolonged neutropenia; gated to persistent fever per IDSA 2018." },
    ],
    imaging: [
      { sev: "required",
        what: "**CT abdomen/pelvis with IV contrast** — cecal wall > 4 mm thickening is diagnostic.",
        why:  "Defines pneumatosis, perforation, and abscess; pneumatosis with sepsis triggers surgical consultation." },
    ],
  },

  /* === Overwhelming post-splenectomy infection (OPSI) ==================== */
  opsi: {
    cultures: [
      { sev: "required",
        what: "Two sets of blood cultures **but do not delay empiric antibiotics** — first dose within 1 h of suspicion.",
        why:  "Mortality climbs hourly; pre-treatment cultures preferred but never gate the first dose in shock." },
      { sev: "trigger",
        what: "Peripheral blood smear for Howell-Jolly bodies + intraerythrocytic organisms (babesia, malaria).",
        why:  "Confirms asplenic state; identifies parasitic co-infection that demands species-specific therapy." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Lactate, CBC, fibrinogen, D-dimer, platelet count at presentation.",
        why:  "DIC and Waterhouse-Friderichsen are common in pneumococcal/meningococcal OPSI; gates ICU and steroid decisions." },
    ],
    panels: [
      { sev: "trigger",
        what: "Rapid blood-culture pathogen panel (BioFire BCID2) on first positive bottle.",
        why:  "S. pneumoniae, N. meningitidis, H. influenzae identification within hours changes empiric narrowing." },
    ],
    imaging: [
      { sev: "consider",
        what: "Chest radiograph and head CT only after stabilization and empiric antibiotic administration.",
        why:  "Imaging never delays the first dose; useful after to identify pneumonia or meningitis focus." },
    ],
  },

  /* === Candidemia ======================================================= */
  candidemia: {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures **daily until clearance documented** — define day 1 from first negative.",
        why:  "Time-to-clearance defines complicated candidemia and starts the 14-day clock at first negative." },
      { sev: "required",
        what: "Remove and culture every removable central line; culture any candidate focus (urine, CSF, abscess).",
        why:  "Catheter retention is the single largest mortality driver in candidemia; line tip culture supports diagnosis." },
    ],
    biomarkers: [
      { sev: "trigger",
        what: "**1,3-β-D-glucan** baseline and serial; supports diagnosis and tracks response when speciation pending.",
        why:  "Highly sensitive for invasive candidiasis; trend supports duration and identifies treatment failure early." },
    ],
    panels: [
      { sev: "trigger",
        what: "**T2 Candida** panel or rapid PNA-FISH on positive bottle for same-day species identification.",
        why:  "C. glabrata / krusei mandate echinocandin; C. parapsilosis prefers fluconazole — species gates choice." },
    ],
    imaging: [
      { sev: "required",
        what: "**Dilated fundoscopy within 1 week** of diagnosis (repeat if neutropenic at first exam).",
        why:  "Endogenous endophthalmitis in 9–16%; intraocular involvement extends therapy and changes drug penetration." },
      { sev: "required",
        what: "**Transthoracic echo**; TEE if persistent candidemia > 5 days, prosthetic valve, or new murmur.",
        why:  "Endocarditis upgrades duration to 6 weeks plus valve surgery; missed IE drives relapse and mortality." },
      { sev: "trigger",
        what: "CT abdomen/pelvis or MRI when hepatosplenic candidiasis, renal abscess, or vertebral seeding suspected.",
        why:  "Chronic disseminated candidiasis emerges at neutrophil recovery; missed foci drive relapse off-therapy." },
    ],
  },

  /* === Nocardia ========================================================= */
  nocardia: {
    cultures: [
      { sev: "required",
        what: "Tissue / aspirate / BAL for **modified acid-fast stain** and **prolonged-incubation aerobic culture (2–4 weeks)**.",
        why:  "Slow growth misses on routine cultures; lab must be alerted to hold plates and perform modified AFB." },
      { sev: "trigger",
        what: "Two sets of blood cultures with extended incubation if disseminated disease suspected.",
        why:  "Bacteremia rare but identifies disseminated disease that changes regimen and duration." },
    ],
    panels: [
      { sev: "trigger",
        what: "**MALDI-TOF** or 16S rRNA sequencing for species-level identification on growth.",
        why:  "Species predicts susceptibility (N. farcinica TMP-SMX resistance); guides definitive therapy 6–12 months." },
    ],
    imaging: [
      { sev: "required",
        what: "**CT chest** at diagnosis; **MRI brain with contrast** in all pulmonary or disseminated nocardiosis.",
        why:  "CNS dissemination occurs in 20–40% even without symptoms; brain abscess mandates surgical and prolonged therapy." },
      { sev: "trigger",
        what: "CT or MRI of any soft-tissue focus; ophthalmologic exam if visual symptoms.",
        why:  "Cutaneous, ocular, and visceral foci require drainage and extend duration beyond pulmonary disease." },
    ],
    biopsy: [
      { sev: "trigger",
        what: "Tissue biopsy with histopathology + culture when pulmonary nodule or brain lesion not amenable to BAL.",
        why:  "Diagnostic yield highest with tissue; Gomori methenamine silver and modified AFB confirm filamentous branching." },
    ],
  },

  /* === Listeria (CNS / bacteremia) ====================================== */
  listeria: {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures **before antibiotics** plus CSF cultures at LP when meningoencephalitis suspected.",
        why:  "Blood culture yield > 60% in invasive listeriosis; CSF yield lower but Gram stain shows GP rods." },
      { sev: "trigger",
        what: "Notify lab to hold cultures with extended incubation and watch for **tumbling motility** at 25 °C.",
        why:  "Listeria can be misread as diphtheroid contaminant; tumbling motility at room temperature confirms identification." },
    ],
    biomarkers: [
      { sev: "required",
        what: "CBC, CMP, lactate; CSF cell count, glucose, protein, Gram stain at LP.",
        why:  "Listeria CSF often shows monocytic predominance and only modest protein elevation, mimicking viral meningitis." },
    ],
    panels: [
      { sev: "consider",
        what: "Meningoencephalitis multiplex PCR (BioFire ME) on CSF — detects listeria when Gram stain negative.",
        why:  "Same-day identification supports ampicillin (+ gentamicin synergy) start; ceftriaxone alone fails." },
    ],
    imaging: [
      { sev: "trigger",
        what: "**MRI brain with contrast** in suspected rhombencephalitis (brainstem ataxia, cranial nerve palsies).",
        why:  "T2 hyperintensity in brainstem and cerebellum is pathognomonic; identifies abscess that extends duration." },
    ],
  },

  /* === Capnocytophaga (post-bite / asplenic sepsis) ===================== */
  capno: {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures **before antibiotics**; notify lab to hold **5–14 days** with CO₂ enrichment.",
        why:  "Fastidious slow-growing GNR; routine 5-day incubation may miss growth and lose targeted therapy." },
      { sev: "trigger",
        what: "Wound / bite-site culture if accessible; peripheral smear for intracellular GNR in granulocytes.",
        why:  "Smear finding of intracellular fusiform GNR is rapid clue while cultures incubate." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Lactate, CBC, fibrinogen, D-dimer, platelets at presentation.",
        why:  "DIC, purpura fulminans, and Waterhouse-Friderichsen are common in asplenic capno sepsis; mortality > 25%." },
    ],
    imaging: [
      { sev: "consider",
        what: "Echocardiogram if persistent bacteremia or new murmur — capnocytophaga endocarditis is reported.",
        why:  "Endovascular focus changes duration; bedside echo identifies vegetations and pericardial effusion." },
    ],
  },

  /* === Neutropenic pneumonia ============================================ */
  "neutropenic-pna": {
    cultures: [
      { sev: "required",
        what: "Two sets of blood cultures + sputum / induced sputum culture before antibiotic change.",
        why:  "Bacteremic pneumonia in neutropenia identifies GNR and S. aureus driving targeted narrowing." },
      { sev: "trigger",
        what: "**Bronchoscopy with BAL** within 24–48 h if no improvement or imaging suggests mold.",
        why:  "BAL galactomannan, fungal smear/culture, PJP DFA, viral PCR — gates pre-emptive antifungal escalation." },
    ],
    biomarkers: [
      { sev: "required",
        what: "**Serum galactomannan** + **1,3-β-D-glucan** at fever onset and biweekly; BAL galactomannan at bronchoscopy.",
        why:  "Detects invasive aspergillosis 5–14 days before culture; positive serum gates voriconazole start." },
      { sev: "consider",
        what: "Procalcitonin baseline — low values do not exclude bacterial infection in neutropenia.",
        why:  "PCT is less reliable in neutropenia; never use to withhold empiric coverage." },
    ],
    panels: [
      { sev: "trigger",
        what: "Respiratory viral PCR (influenza, RSV, SARS-CoV-2, parainfluenza, metapneumovirus, adenovirus).",
        why:  "Viral pneumonia drives substantial mortality in transplant/heme patients; identification changes therapy." },
      { sev: "consider",
        what: "**MRSA nares PCR** — negative result supports anti-MRSA de-escalation in stable patients.",
        why:  "High-leverage stewardship test; turnaround under 2 h preserves coverage while narrowing safely." },
    ],
    imaging: [
      { sev: "required",
        what: "**CT chest** at diagnosis (CXR misses nodules, halo sign, cavitation in early invasive mold).",
        why:  "Halo and reverse-halo signs are highly suggestive of aspergillus; nodules / cavities trigger BAL." },
    ],
  },

  /* === Solid-organ transplant infection ================================= */
  "sot-infection": {
    cultures: [
      { sev: "required",
        what: "Two sets of blood cultures + source-directed cultures (urine, sputum, BAL, wound, CSF) before antibiotic change.",
        why:  "Polymicrobial and resistant pathogens dominate; pre-antibiotic sampling widens de-escalation window." },
      { sev: "trigger",
        what: "Fungal blood cultures + AFB cultures with extended incubation in fever of unknown source.",
        why:  "Candida, nocardia, mycobacteria, and endemic mycoses are over-represented; lab-alert preserves yield." },
    ],
    biomarkers: [
      { sev: "required",
        what: "**CMV PCR**, **EBV PCR**, **BK PCR**, **1,3-β-D-glucan**, **galactomannan** at fever onset.",
        why:  "Viral reactivation drives febrile syndromes and changes immunosuppression; fungal markers gate pre-emptive antifungals." },
      { sev: "consider",
        what: "Tacrolimus / cyclosporine / sirolimus levels and creatinine — guide immunosuppression reduction.",
        why:  "Drug-drug interactions (azoles, rifamycins) change trough levels and rejection risk." },
    ],
    panels: [
      { sev: "trigger",
        what: "Respiratory viral PCR + multiplex GI PCR + meningoencephalitis PCR per syndrome.",
        why:  "Atypical and reactivated viral pathogens dominate; rapid panels narrow within 1–4 h." },
      { sev: "consider",
        what: "Plasma cell-free DNA metagenomics (Karius) for culture-negative fever at day 3–5.",
        why:  "High yield for fastidious, mycobacterial, and fungal pathogens in immunocompromise; expensive — reserve for refractory." },
    ],
    imaging: [
      { sev: "trigger",
        what: "CT chest + abdomen/pelvis at persistent fever > 72 h; MRI brain for neuro symptoms.",
        why:  "Atypical foci (mold pneumonia, hepatic abscess, brain lesion) drive non-response and demand directed sampling." },
    ],
    biopsy: [
      { sev: "trigger",
        what: "Tissue biopsy of allograft / lesion when reactivation, rejection, or PTLD mimic infection.",
        why:  "Histopathology distinguishes rejection from infection; CMV/EBV immunostains change immunosuppression and antivirals." },
    ],
  },

  /* === Asplenia prophylaxis (acute febrile workup) ====================== */
  "asplenia-prophylaxis": {
    cultures: [
      { sev: "required",
        what: "Two sets of blood cultures **but never delay empiric ceftriaxone** — first dose within 1 h of fever.",
        why:  "Pneumococcal/meningococcal OPSI carries hourly mortality climb; first dose gates survival." },
      { sev: "trigger",
        what: "Peripheral smear for Howell-Jolly bodies + intraerythrocytic organisms (babesia, malaria).",
        why:  "Confirms functional asplenia and identifies parasitic co-infection driving severe disease." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Lactate, CBC, fibrinogen, platelets, DIC panel at presentation.",
        why:  "Coagulopathy and DIC define Waterhouse-Friderichsen; gates ICU and supportive-care escalation." },
    ],
    panels: [
      { sev: "consider",
        what: "Verify pneumococcal, meningococcal, Hib, influenza vaccination status — guides re-immunization after recovery.",
        why:  "Up-to-date immunization is the single largest modifier of recurrence risk in asplenic patients." },
    ],
    imaging: [
      { sev: "consider",
        what: "Chest radiograph and source-directed imaging only after empiric antibiotic administration.",
        why:  "Imaging never delays first-dose antibiotic in asplenic fever; useful afterward for focus identification." },
    ],
  },

  /* === Biologic-associated infection (TNFi / IL-6 / JAKi / B-cell depletion) === */
  "biologic-infection": {
    cultures: [
      { sev: "required",
        what: "Two sets of blood cultures + source-directed cultures before antibiotics; extended-incubation AFB and fungal cultures.",
        why:  "Reactivated TB, endemic mycoses, and atypical mycobacteria dominate biologic-associated infection." },
      { sev: "trigger",
        what: "Sputum / BAL for AFB smear + culture and fungal stain when pulmonary symptoms or biologic includes TNF-α inhibitor.",
        why:  "TNFi reactivates latent TB and granulomatous disease; missed TB drives transmission and miliary disease." },
    ],
    biomarkers: [
      { sev: "required",
        what: "**Quantiferon-TB**, **HBV sAg/sAb/cAb**, **HIV**, **strongyloides serology**, **histo/coccidio** by region.",
        why:  "Establishes reactivation baseline; positives reroute therapy and gate isoniazid / entecavir prophylaxis." },
      { sev: "trigger",
        what: "**1,3-β-D-glucan** + **galactomannan** at fever onset; CMV PCR if rituximab / B-cell depleted.",
        why:  "PJP and invasive mold complicate rituximab and JAKi; CMV reactivation common with B-cell depletion." },
    ],
    panels: [
      { sev: "trigger",
        what: "Respiratory viral PCR + multiplex panels per syndrome; consider Karius for refractory culture-negative fever.",
        why:  "Atypical pathogens (PJP, varicella, CMV) drive non-response; rapid panels gate antiviral/antifungal start." },
    ],
    imaging: [
      { sev: "trigger",
        what: "CT chest at fever onset (mold, TB, PJP nodules invisible on CXR); MRI brain for neuro symptoms.",
        why:  "Crypto, PML, nocardia, TB all present subtly; directed imaging gates biopsy and targeted therapy." },
    ],
  },

  /* === CGD (chronic granulomatous disease) ============================== */
  "cgd-defect": {
    cultures: [
      { sev: "required",
        what: "Tissue / abscess culture (aerobic, anaerobic, fungal, AFB) at drainage — surgical sampling preferred over aspirate.",
        why:  "Catalase-positive organisms (S. aureus, Burkholderia, Serratia, Nocardia, Aspergillus) dominate; tissue yield > aspirate." },
      { sev: "required",
        what: "Two sets of blood cultures with extended incubation + lab-alert for **Burkholderia cepacia** selective plates.",
        why:  "Burkholderia is a CGD-defining pathogen often missed on routine media; specialty plates preserve yield." },
    ],
    biomarkers: [
      { sev: "required",
        what: "**1,3-β-D-glucan** + **galactomannan** at fever onset and biweekly during infection.",
        why:  "Invasive aspergillus is the leading killer in CGD; markers detect mold weeks before culture." },
      { sev: "consider",
        what: "Dihydrorhodamine (DHR) flow cytometry to confirm defect and stratify residual oxidative burst.",
        why:  "Residual NADPH-oxidase activity predicts severity; X-linked vs autosomal subtype guides counseling and transplant timing." },
    ],
    panels: [
      { sev: "trigger",
        what: "**MALDI-TOF** or 16S rRNA on every isolate for species-level identification (Burkholderia, Nocardia, Granulibacter).",
        why:  "Atypical organisms misidentified by phenotypic methods; species drives definitive therapy and duration." },
    ],
    imaging: [
      { sev: "required",
        what: "**CT chest + abdomen** at fever onset; MRI for soft-tissue, liver, or paraspinal abscess.",
        why:  "Granulomatous abscesses (liver, lung, lymph node) define CGD infection; imaging gates surgical drainage." },
    ],
    biopsy: [
      { sev: "trigger",
        what: "Excisional biopsy of suspicious lesion with histopathology + GMS / AFB / Fite stains and culture.",
        why:  "Granulomatous histology + organism-specific stains define the pathogen when cultures are negative or slow." },
    ],
  },

};
