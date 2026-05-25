/* data · diagnostics/tranche-b — Wave 5 PR-6c content tranche.

   25 syndromes: sepsis variants + respiratory + bloodstream/cardiac
   (first half). Authored at the apex bar per the schema in the
   aggregator. Authored in parallel with tranche-c/d/e per the
   plan's multi-agent matrix.

   Schema documented in src/data/diagnostics.js (the aggregator).
   Inpatient Antibiotic Guide — module graph in README.md. */

export const TRANCHE_B_DIAGNOSTICS = {

  /* === Sepsis — healthcare-associated / quality-of-life =================== */
  "sepsis-hcaq": {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures **before the first antibiotic dose**; add cultures from every indwelling line.",
        why:  "HCA exposure shifts pathogen mix toward MRSA, Pseudomonas, and ESBL — pre-treatment cultures unlock targeted narrowing." },
      { sev: "required",
        what: "Source-directed cultures (urine, sputum, wound, line tip on removal) at presentation.",
        why:  "HCA sepsis routinely arises from device or wound focus; source culture drives definitive coverage." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Lactate at presentation and at **2–4 h** after resuscitation.",
        why:  "Resuscitation target identical to community sepsis; trend gates ICU disposition and pressor escalation." },
      { sev: "consider",
        what: "Procalcitonin trend to support antibiotic discontinuation in clinical responders.",
        why:  "Useful in HCA exposure where empiric breadth is wide; single values are noisy in critical illness." },
    ],
    panels: [
      { sev: "trigger",
        what: "Rapid blood-culture pathogen panel (BioFire, Verigene) **on first positive bottle**; include resistance markers (mecA, KPC, NDM, vanA).",
        why:  "HCA exposure raises MRSA / CRE pre-test probability; resistance call at hour 4 shifts empiric therapy." },
      { sev: "consider",
        what: "MRSA nares PCR for de-escalation when respiratory source is plausible.",
        why:  "Negative nares carry ~99% NPV for MRSA pneumonia and permit anti-MRSA stop." },
    ],
    imaging: [
      { sev: "trigger",
        what: "Source-directed imaging within the first hour when focus is unclear — CT abdomen/pelvis is highest yield.",
        why:  "Undrained abscess and obstructive uropathy dominate reversible causes of antibiotic failure in HCA sepsis." },
    ],
  },

  /* === Sepsis — neutropenic (febrile neutropenia with hemodynamic compromise) === */
  "sepsis-neutropenic": {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures **plus** one set from each lumen of every indwelling line, before antibiotics.",
        why:  "Differential time-to-positivity from line vs peripheral diagnoses CLABSI; > 2 h (120 min) delta is diagnostic." },
      { sev: "required",
        what: "Urine, sputum, stool culture, and any focal site (skin, mucositis, perianal) before empiric coverage.",
        why:  "Yield is lower in neutropenia but every pre-treatment culture preserves the de-escalation window." },
      { sev: "consider",
        what: "C. difficile NAAT if diarrhea; HSV/CMV PCR for mucositis or pneumonitis.",
        why:  "Neutropenic mucositis often masks viral or C. diff co-infection driving antibiotic refractoriness." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Lactate, CBC with differential, CMP at presentation and daily until ANC recovery.",
        why:  "Absolute neutrophil count gates G-CSF and antifungal additions; lactate trend gates ICU." },
      { sev: "trigger",
        what: "Serum galactomannan twice weekly and beta-D-glucan if fever persists > 96 h on broad-spectrum antibiotics.",
        why:  "Invasive aspergillosis and candidiasis emerge after day 4–7; positive antigen triggers mold-active therapy." },
    ],
    panels: [
      { sev: "trigger",
        what: "Rapid blood-culture pathogen panel (BioFire, T2Candida) **on first positive bottle**.",
        why:  "T2Candida detects candidemia direct from blood within 5 h vs 24–72 h for culture." },
      { sev: "consider",
        what: "Plasma cell-free DNA metagenomics (Karius) at day 4–5 if culture-negative and refractory.",
        why:  "High yield for mold, atypical pathogens, and reactivated viruses in immunocompromise." },
    ],
    imaging: [
      { sev: "trigger",
        what: "CT chest with high-resolution cuts if fever persists > 72 h on empiric therapy.",
        why:  "Halo or reverse-halo signs identify invasive mold pneumonia before chest radiograph turns positive." },
      { sev: "consider",
        what: "CT sinus and abdomen/pelvis if no source after 72 h.",
        why:  "Typhlitis (neutropenic enterocolitis) and invasive sinusitis are characteristic occult sources." },
    ],
  },

  /* === Sepsis — asplenia / OPSI ========================================== */
  "sepsis-asplenia": {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures **before the first dose**; first dose within 1 h — empiric therapy never waits.",
        why:  "OPSI mortality exceeds 50%; pneumococcus, H. influenzae, and N. meningitidis drive overwhelming bacteremia." },
      { sev: "required",
        what: "Peripheral blood smear for Howell-Jolly bodies (confirms functional asplenia) and intra-erythrocytic organisms.",
        why:  "Babesia and malaria mimic sepsis in asplenia and demand different therapy entirely." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Lactate, CBC, DIC panel (PT, PTT, fibrinogen, D-dimer) at presentation.",
        why:  "Purpura fulminans and Waterhouse-Friderichsen progress within hours; DIC dictates protein C and supportive care." },
    ],
    panels: [
      { sev: "trigger",
        what: "Pneumococcal and meningococcal urine/CSF antigen if focal site involvement suspected.",
        why:  "Rapid antigen narrows organism within 1 h and informs household chemoprophylaxis." },
      { sev: "consider",
        what: "Rapid blood-culture pathogen panel **on first positive bottle**.",
        why:  "Same-day pneumococcus vs meningococcus distinction shapes household contact tracing." },
    ],
    imaging: [
      { sev: "consider",
        what: "CT head if AMS, focal deficit, or concern for meningococcal meningitis before LP.",
        why:  "OPSI commonly seeds meninges; imaging triages safety of LP only when neurologic exam abnormal." },
    ],
  },

  /* === Sepsis — toxic shock syndrome (strep / staph) ===================== */
  "sepsis-toxic": {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures; culture from every soft-tissue or mucosal site (vaginal, surgical, wound, throat).",
        why:  "Streptococcal TSS bacteremic in 60%, staphylococcal TSS bacteremic in < 5% — toxin diagnosis is clinical." },
      { sev: "trigger",
        what: "Anaerobic transport tissue culture from any necrotizing soft-tissue focus at debridement.",
        why:  "Group A strep necrotizing fasciitis is the dominant streptococcal TSS focus; surgical pathology drives diagnosis." },
    ],
    biomarkers: [
      { sev: "required",
        what: "CBC, CK, CMP, lactate, fibrinogen, PT/PTT at presentation; recheck CK and Cr q6h.",
        why:  "Multi-organ failure defines TSS; rising CK signals myonecrosis driving emergent surgical exploration." },
      { sev: "consider",
        what: "ASO and anti-DNase B titer if streptococcal TSS suspected but cultures negative.",
        why:  "Supports retrospective diagnosis of strep TSS for IVIG decisions in toxin-mediated disease." },
    ],
    imaging: [
      { sev: "trigger",
        what: "**Emergent CT or MRI** of any soft-tissue focus for fascial-plane gas, fluid, or stranding.",
        why:  "Imaging never delays surgery in necrotizing infection — but it maps extent for the OR team." },
    ],
    biopsy: [
      { sev: "required",
        what: "Surgical exploration and tissue sampling of any necrotizing soft-tissue focus within hours.",
        why:  "Source control with debridement is the single largest determinant of survival in streptococcal TSS." },
    ],
  },

  /* === Sepsis — intra-abdominal source =================================== */
  "sepsis-abdominal": {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures **before antibiotics**.",
        why:  "Bacteremia in complicated intra-abdominal infection ~30%; identifies dominant pathogen for de-escalation." },
      { sev: "required",
        what: "Peritoneal fluid Gram stain and aerobic + anaerobic culture from every drainage or laparotomy.",
        why:  "Polymicrobial yield (E. coli, Bacteroides, Enterococcus) directs definitive narrowing; anaerobic transport essential." },
      { sev: "consider",
        what: "Fungal culture from peritoneal fluid if upper-GI perforation, prior antibiotic exposure, or immunocompromise.",
        why:  "Candida peritonitis present in 20% of upper-GI perforations and recurrent leaks; antifungal threshold matters." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Lactate, lipase, CBC, CMP, coagulation panel at presentation; lactate at 2–4 h post-resuscitation.",
        why:  "Pancreatitis vs perforation distinguished by lipase; lactate trend gates source-control timing." },
    ],
    imaging: [
      { sev: "required",
        what: "**CT abdomen/pelvis with IV contrast** within the first hour to identify drainable focus.",
        why:  "Undrained collection is the dominant reversible cause of antibiotic failure; source control < 12 h cuts mortality." },
      { sev: "trigger",
        what: "Repeat CT at 48–72 h if no clinical response despite appropriate antibiotics.",
        why:  "New abscess or evolving necrosis often emerges after initial drainage; missed focus drives refractory sepsis." },
    ],
  },

  /* === Aspiration pneumonia / pneumonitis ================================ */
  aspiration: {
    cultures: [
      { sev: "trigger",
        what: "Lower respiratory sample (sputum, ETT aspirate, or BAL) in severe disease or treatment failure.",
        why:  "Routine aspiration is polymicrobial; cultures reserved for severe, HCA exposure, or non-responders." },
      { sev: "consider",
        what: "Two sets of peripheral blood cultures in severe disease or sepsis criteria.",
        why:  "Bacteremia in aspiration pneumonia is uncommon (~5–10%) but identifies the pathogen when respiratory cultures fail." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "Procalcitonin to support antibiotic stop in chemical pneumonitis vs bacterial pneumonia.",
        why:  "Pneumonitis (acid injury) does not require antibiotics; low PCT supports 48-h stop." },
    ],
    imaging: [
      { sev: "required",
        what: "Chest radiograph at presentation; CT chest for cavitation, abscess, or empyema concern.",
        why:  "Dependent-lobe infiltrate confirms aspiration; cavitation > 2 cm signals lung abscess needing extended course." },
      { sev: "trigger",
        what: "Modified barium swallow or fiberoptic endoscopic evaluation of swallow before discharge.",
        why:  "Identifies modifiable swallowing deficit; reduces recurrent aspiration that drives readmission." },
    ],
  },

  /* === Empyema =========================================================== */
  empyema: {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures **before antibiotics**.",
        why:  "Bacteremia in empyema ~12–15%; pre-treatment cultures preserve the only definitive pathogen lever." },
      { sev: "required",
        what: "Pleural fluid Gram stain, aerobic + anaerobic culture, and pH/glucose/LDH from every thoracentesis.",
        why:  "Loculation and pH < 7.2 define complicated effusion; cultures drive definitive narrowing." },
      { sev: "consider",
        what: "AFB smear and culture, fungal culture if epidemiologic risk or subacute presentation.",
        why:  "TB empyema and fungal disease mimic bacterial empyema and demand entirely different therapy." },
    ],
    biomarkers: [
      { sev: "required",
        what: "Pleural fluid pH, glucose, LDH, protein at first thoracentesis.",
        why:  "pH < 7.2 or glucose < 40 defines complicated effusion requiring chest-tube drainage." },
    ],
    imaging: [
      { sev: "required",
        what: "CT chest with contrast at presentation; bedside US to guide thoracentesis.",
        why:  "Loculation and parietal pleural enhancement define stage; guide drainage and tPA/DNase decisions." },
      { sev: "trigger",
        what: "Repeat CT at day 3–5 if no drainage improvement or persistent fever.",
        why:  "Persistent loculation drives VATS decortication; missed organization wastes weeks of antibiotics." },
    ],
  },

  /* === COPD exacerbation (infectious) ==================================== */
  copd: {
    cultures: [
      { sev: "consider",
        what: "Sputum Gram stain and culture in severe exacerbation, frequent exacerbators, or prior Pseudomonas.",
        why:  "Routine sputum culture has low yield; reserve for severe disease, structural lung disease, or failure." },
    ],
    biomarkers: [
      { sev: "trigger",
        what: "Procalcitonin at presentation; below 0.25 ng/mL supports withholding or stopping antibiotics in stable patients.",
        why:  "PCT-guided therapy in COPD (PROCAP, RCT data) safely reduces antibiotic days without harm." },
      { sev: "consider",
        what: "Blood eosinophil count to gate corticosteroid response.",
        why:  "Eosinophils > 300 predict steroid response; supports steroid use rather than antibiotic escalation." },
    ],
    panels: [
      { sev: "trigger",
        what: "Respiratory viral PCR (influenza, RSV, SARS-CoV-2) in season or severe exacerbation.",
        why:  "Viral exacerbations are 30–50% of cases; antiviral decisions and isolation depend on detection." },
    ],
    imaging: [
      { sev: "required",
        what: "Chest radiograph at presentation to exclude pneumonia, pneumothorax, and pulmonary edema.",
        why:  "Coexistent pneumonia changes empiric antibiotic choice and duration; pneumothorax is occult in emphysema." },
    ],
  },

  /* === Bronchiectasis exacerbation ======================================= */
  bronchiectasis: {
    cultures: [
      { sev: "required",
        what: "Sputum Gram stain and culture (bacterial + AFB + fungal) **before antibiotics**, with prior culture history reviewed.",
        why:  "Chronic Pseudomonas, NTM, and Aspergillus colonization drive empiric choice; history is the strongest predictor." },
      { sev: "trigger",
        what: "Repeat sputum culture if not improving within 7 days or new symptom phenotype.",
        why:  "Pathogen succession during exacerbation is common; resistant Pseudomonas or NTM emerges on broad therapy." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "CBC, CRP at baseline and during exacerbation to track response.",
        why:  "Inflammatory trend supports duration decisions when symptom resolution is incomplete." },
      { sev: "consider",
        what: "Total IgE and Aspergillus-specific IgE if ABPA suspected.",
        why:  "ABPA mimics bacterial exacerbation; treatment is steroids and antifungals, not antibiotics." },
    ],
    imaging: [
      { sev: "trigger",
        what: "HRCT chest at first exacerbation or when distribution change suspected.",
        why:  "Tree-in-bud or new cavitation suggests NTM or aspergilloma — both shift management entirely." },
    ],
  },

  /* === Ventilator-associated tracheobronchitis (VAT) ===================== */
  vat: {
    cultures: [
      { sev: "required",
        what: "Quantitative ETT aspirate or mini-BAL **before changing antibiotics** to distinguish VAT from VAP.",
        why:  "Quantitative threshold (≥ 10⁵ CFU/mL ETT) separates VAT from colonization and from VAP." },
      { sev: "consider",
        what: "Two sets of peripheral blood cultures if febrile or hemodynamic concern.",
        why:  "Bacteremia from VAT alone is rare; positive cultures suggest VAP or alternate source." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "Procalcitonin trend to support short-course therapy or stop if clinical improvement.",
        why:  "VAT does not progress to VAP in most cases; PCT supports 7-day or shorter courses." },
    ],
    panels: [
      { sev: "consider",
        what: "Multiplex respiratory PCR on ETT sample if rapid de-escalation desired.",
        why:  "Resistance markers gate empiric narrowing 24 h ahead of culture in ICU stewardship." },
    ],
    imaging: [
      { sev: "required",
        what: "Chest radiograph to **exclude new or progressive infiltrate** — that finding upgrades to VAP.",
        why:  "VAT requires absence of pneumonic infiltrate; imaging is the definitional discriminator." },
    ],
  },

  /* === Post-obstructive pneumonia ======================================== */
  postobstructive: {
    cultures: [
      { sev: "required",
        what: "Sputum or BAL culture (bacterial + anaerobic + fungal + AFB) before antibiotics.",
        why:  "Distal-airway anaerobes and fungal colonization complicate empiric choice; AFB rules out TB-driven obstruction." },
      { sev: "consider",
        what: "Two sets of peripheral blood cultures in severe disease or sepsis criteria.",
        why:  "Bacteremia is uncommon but identifies pathogen when bronchoscopic cultures are unobtainable." },
    ],
    imaging: [
      { sev: "required",
        what: "**CT chest with contrast** at presentation to define obstructing lesion and post-obstructive pneumonitis.",
        why:  "Endobronchial tumor, foreign body, or compressive node drives the syndrome; antibiotics alone fail." },
      { sev: "required",
        what: "Bronchoscopy for direct visualization, sampling, and stenting if airway compromise.",
        why:  "Source control via stent or debulking is required for cure; antibiotics palliate without it." },
    ],
    biopsy: [
      { sev: "trigger",
        what: "Endobronchial biopsy of obstructing lesion at bronchoscopy when malignancy suspected.",
        why:  "Histology drives oncology referral; resistant infection prevents healing without tumor diagnosis." },
    ],
  },

  /* === Acute tracheobronchitis (non-ventilator) ========================== */
  tracheobronchitis: {
    cultures: [
      { sev: "consider",
        what: "Sputum culture only in immunocompromised, structural lung disease, or treatment failure.",
        why:  "Routine acute bronchitis is viral; cultures rarely change management outside high-risk hosts." },
    ],
    biomarkers: [
      { sev: "trigger",
        what: "Procalcitonin to support withholding antibiotics in clinically stable disease.",
        why:  "PCT < 0.25 supports the IDSA position that acute bronchitis does not warrant antibiotics." },
    ],
    panels: [
      { sev: "trigger",
        what: "Respiratory viral PCR (influenza, RSV, SARS-CoV-2, pertussis) in season or characteristic features.",
        why:  "Pertussis demands macrolide treatment and contact prophylaxis; influenza demands oseltamivir." },
    ],
    imaging: [
      { sev: "trigger",
        what: "Chest radiograph if fever, abnormal exam, or duration > 3 weeks.",
        why:  "Excludes pneumonia and post-infectious processes that change management entirely." },
    ],
  },

  /* === Zoonotic pneumonia (Q fever, psittacosis, tularemia, plague) ====== */
  "zoonotic-pna": {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures **with laboratory notification** of zoonotic suspicion (biosafety risk).",
        why:  "Brucella, Francisella, and Yersinia pestis are laboratory hazards; pre-notification triggers BSL-3 handling." },
      { sev: "trigger",
        what: "Sputum or BAL culture only when handled in BSL-3 facility.",
        why:  "Tularemia and plague aerosolize during routine plating; cultures contraindicated without containment." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "Liver enzymes, ferritin, and peripheral smear if Q fever or rickettsial disease suspected.",
        why:  "Elevated transaminases and characteristic morulae support diagnosis when culture is hazardous." },
    ],
    panels: [
      { sev: "required",
        what: "Acute and convalescent serology (Coxiella, Chlamydia psittaci, Francisella, Brucella) at 2–4 weeks.",
        why:  "Serology is the primary diagnostic modality for zoonotic atypicals; PCR available for some agents." },
      { sev: "trigger",
        what: "PCR on respiratory or whole blood specimen (where assay available) for rapid diagnosis.",
        why:  "PCR for C. psittaci and Coxiella supports same-day diagnosis when serology is too slow." },
    ],
    imaging: [
      { sev: "required",
        what: "Chest radiograph at presentation; CT chest for complications, cavitation, or pleural disease.",
        why:  "Plague pneumonia cavitates rapidly; Q fever often has diffuse interstitial or multilobar patterns." },
    ],
  },

  /* === Gram-negative bacteremia (GNB, non-bowel-source) ================== */
  gnbact: {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures on detection; repeat **q48h until clearance documented** for resistant or endovascular focus.",
        why:  "Persistent GNB > 48 h is uncommon and signals undrained focus, endovascular infection, or resistance." },
      { sev: "required",
        what: "Source-directed cultures (urine, biliary, line tip on removal) before changing therapy.",
        why:  "Urinary tract is the dominant GNB source; biliary and intra-abdominal foci require imaging and drainage." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "CRP and procalcitonin trend to support oral step-down decisions in stable patients.",
        why:  "Trial data support 7-day GNB courses and oral step-down when source controlled and patient stable." },
    ],
    panels: [
      { sev: "trigger",
        what: "Rapid blood-culture pathogen panel (Verigene, BioFire) **on first positive bottle** with resistance markers.",
        why:  "ESBL (CTX-M), KPC, NDM detection at hour 4 changes empiric to carbapenem or novel β-lactam." },
    ],
    imaging: [
      { sev: "trigger",
        what: "CT abdomen/pelvis or US if no clear source or persistent bacteremia.",
        why:  "Occult abscess, obstructive uropathy, or cholangitis are the dominant reversible causes of persistent GNB." },
    ],
  },

  /* === Coagulase-negative staphylococci (CoNS) — bacteremia ============== */
  cons: {
    cultures: [
      { sev: "required",
        what: "**Two or more** separate blood culture sets positive within 48 h to distinguish true infection from contamination.",
        why:  "Single positive CoNS is contamination in > 80% of cases; two-set positivity is the diagnostic threshold." },
      { sev: "required",
        what: "Differential time-to-positivity between line and peripheral cultures; line-tip culture on removal.",
        why:  "> 2 h (120 min) delta supports CLABSI; line removal with quantitative tip culture confirms source." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "CRP trend if implant or prosthetic involvement suspected.",
        why:  "Indolent CoNS prosthetic infection often presents with mild inflammatory rise; supports retention vs explant decision." },
    ],
    panels: [
      { sev: "trigger",
        what: "Rapid PCR identification on positive bottle to confirm species and mecA.",
        why:  "Methicillin resistance is > 80% in healthcare-associated CoNS; gates vancomycin vs cefazolin." },
    ],
    imaging: [
      { sev: "trigger",
        what: "Echo (TTE first, TEE if prosthetic valve or persistent bacteremia) when ≥ 2 positive sets.",
        why:  "CoNS endocarditis is the dominant prosthetic-valve early IE pathogen; missed diagnosis drives failure." },
    ],
  },

  /* === Enterococcal bacteremia =========================================== */
  entbact: {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures on detection; repeat **q48h until clearance documented**.",
        why:  "Persistent enterococcal bacteremia signals endocarditis, intra-abdominal abscess, or biliary source." },
      { sev: "required",
        what: "Source-directed cultures (urine, biliary, intra-abdominal) and line cultures if applicable.",
        why:  "GU and GI sources dominate; identification of focus drives source-control and ampicillin-vs-vancomycin choice." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "Daily CRP trend if endocarditis under investigation.",
        why:  "Enterococcal IE is subacute; CRP trajectory supports response to combination therapy." },
    ],
    panels: [
      { sev: "trigger",
        what: "Rapid PCR identification (Verigene) on positive bottle for vanA / vanB.",
        why:  "VRE status gates linezolid / daptomycin choice and contact-isolation precautions." },
    ],
    imaging: [
      { sev: "required",
        what: "**Transesophageal echo** (TEE) for community-onset E. faecalis bacteremia, prior IE, or implanted cardiac device.",
        why:  "E. faecalis IE incidence ~15% in community-onset; TEE sensitivity is required for diagnosis." },
      { sev: "trigger",
        what: "CT abdomen/pelvis for unexplained source or persistent bacteremia.",
        why:  "Occult intra-abdominal abscess and biliary obstruction commonly drive enterococcal bacteremia." },
    ],
  },

  /* === CRBSI / CLABSI ==================================================== */
  crbsi: {
    cultures: [
      { sev: "required",
        what: "**Paired** peripheral and central-line blood cultures drawn simultaneously, before antibiotics and before line removal.",
        why:  "Differential time-to-positivity > 2 h (120 min) between line and peripheral cultures is diagnostic." },
      { sev: "required",
        what: "Quantitative line-tip culture (Maki roll-plate, ≥ 15 CFU) on removal if line is pulled.",
        why:  "Confirms catheter as source and pairs with blood culture organism for definitive diagnosis." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "Daily CRP or procalcitonin trend if line salvage attempted with antibiotic lock.",
        why:  "Failure to clear inflammatory markers on lock therapy predicts need for explant." },
    ],
    panels: [
      { sev: "trigger",
        what: "Rapid blood-culture pathogen panel (BioFire, Verigene) **on first positive bottle**.",
        why:  "S. aureus and Candida demand immediate line removal; CoNS may permit lock-therapy salvage." },
    ],
    imaging: [
      { sev: "trigger",
        what: "TEE if S. aureus, Candida, enterococcus, or persistent bacteremia > 72 h after line removal.",
        why:  "Endocarditis in line-associated S. aureus bacteremia ~25%; TEE finding changes duration to 4–6 weeks." },
      { sev: "consider",
        what: "Upper-extremity venous duplex if persistent bacteremia after line removal.",
        why:  "Septic thrombophlebitis of the catheter vein drives persistent positives and may require anticoagulation." },
    ],
  },

  /* === IE — native valve ================================================= */
  "ie-native": {
    cultures: [
      { sev: "required",
        what: "**Three sets** of peripheral blood cultures from separate venipunctures at least 30 minutes apart, before antibiotics.",
        why:  "Continuous bacteremia is the diagnostic fingerprint; three sets achieve > 95% organism detection." },
      { sev: "trigger",
        what: "Extended-incubation and fastidious-organism cultures (HACEK, Bartonella, Coxiella) if culture-negative at day 5.",
        why:  "5–10% of native-valve IE is culture-negative; specialized media and serology identify fastidious pathogens." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "CRP, ESR, complement (C3, C4), urinalysis at presentation and trended.",
        why:  "Immune-complex glomerulonephritis and rheumatoid factor support diagnosis when echo is equivocal." },
    ],
    panels: [
      { sev: "trigger",
        what: "16S rRNA PCR on valve tissue after surgery; serology for Bartonella, Coxiella, Brucella in culture-negative cases.",
        why:  "Identifies organism in 30–50% of culture-negative IE; changes targeted therapy and duration." },
    ],
    imaging: [
      { sev: "required",
        what: "**Transthoracic echo first**; TEE in all adults with high suspicion, negative TTE, or complications.",
        why:  "TEE sensitivity ~95% native vs TTE ~50–70%; defines vegetations, abscess, leaflet destruction." },
      { sev: "trigger",
        what: "Brain MRI and CT chest/abdomen if neurologic symptoms or suspicion of embolic complications.",
        why:  "Septic emboli and mycotic aneurysms drive surgical timing and anticoagulation decisions." },
    ],
    biopsy: [
      { sev: "trigger",
        what: "Valve tissue culture and histology at surgical valve replacement.",
        why:  "Tissue pathogen confirmation guides duration and adjusts therapy if discrepant with blood cultures." },
    ],
  },

  /* === IE — prosthetic valve (PVE) ======================================= */
  "ie-pve": {
    cultures: [
      { sev: "required",
        what: "**Three sets** of peripheral blood cultures from separate venipunctures at least 30 minutes apart, before antibiotics.",
        why:  "PVE is continuous bacteremia; CoNS, S. aureus, and enterococci dominate within the first year." },
      { sev: "trigger",
        what: "Extended-incubation and fastidious-organism cultures if culture-negative at day 5.",
        why:  "Coxiella, Brucella, Bartonella, and fungal PVE require specialized handling and serology." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "CRP, ESR baseline and trended through therapy.",
        why:  "Persistent inflammatory elevation supports incomplete source control and surgical re-evaluation." },
    ],
    panels: [
      { sev: "trigger",
        what: "16S rRNA PCR and broad-range fungal PCR on explanted valve tissue.",
        why:  "PVE culture-negativity is ~10–15%; molecular methods identify organism for targeted therapy." },
    ],
    imaging: [
      { sev: "required",
        what: "**TEE** on every suspected PVE — TTE is inadequate.",
        why:  "Prosthetic material obscures TTE; TEE sensitivity ~90% vs TTE ~50%; defines abscess and dehiscence." },
      { sev: "required",
        what: "**Cardiac CT and 18F-FDG PET-CT** for perivalvular complications and PVE > 3 months post-implant.",
        why:  "PET-CT raises modified Duke sensitivity from 70% to 97% in PVE; identifies abscess and graft involvement." },
      { sev: "trigger",
        what: "Brain MRI and CT chest/abdomen for embolic complications or persistent bacteremia.",
        why:  "Embolic events change surgical timing and anticoagulation; mycotic aneurysms are silent and lethal." },
    ],
    biopsy: [
      { sev: "trigger",
        what: "Explanted valve and any annular abscess tissue for culture, PCR, and histology at surgery.",
        why:  "Tissue diagnosis guides duration after surgical clock reset; molecular methods rescue culture-negative cases." },
    ],
  },

  /* === Lemierre syndrome ================================================== */
  lemierre: {
    cultures: [
      { sev: "required",
        what: "**Two sets** of peripheral blood cultures with **anaerobic bottles**, held for extended incubation.",
        why:  "Fusobacterium necrophorum requires anaerobic culture; routine bottles may miss the dominant pathogen." },
      { sev: "trigger",
        what: "Throat and tonsillar fossa culture if oropharyngeal source visible.",
        why:  "Identifies parapharyngeal abscess source for drainage and confirms F. necrophorum carriage." },
    ],
    biomarkers: [
      { sev: "required",
        what: "CBC, CRP, D-dimer, coagulation panel at presentation; track for septic emboli and DIC.",
        why:  "Internal jugular thrombosis and septic pulmonary emboli define the syndrome; D-dimer supports diagnosis." },
    ],
    imaging: [
      { sev: "required",
        what: "**CT neck with contrast** to confirm internal jugular vein thrombosis and parapharyngeal collection.",
        why:  "IJ thrombosis is pathognomonic; contrast CT outperforms US for deep cervical anatomy." },
      { sev: "required",
        what: "CT chest with contrast for septic pulmonary emboli, cavitation, or empyema.",
        why:  "Septic emboli present in > 80%; cavitary lesions and effusions drive chest-tube and duration decisions." },
    ],
  },

  /* === Endophthalmitis =================================================== */
  endophthalmitis: {
    cultures: [
      { sev: "required",
        what: "**Vitreous tap** for Gram stain, aerobic + anaerobic + fungal culture, **before intravitreal therapy**.",
        why:  "Vitreous is the only definitive sampling site; pre-treatment tap preserves yield and tailors intravitreal regimen." },
      { sev: "required",
        what: "Distinguish **post-operative / post-injection** (CoNS, Bacillus, S. aureus, streptococci) from **endogenous** (Strep, S. aureus, Klebsiella, Candida) — pathogen mix drives intravitreal choice.",
        why:  "Etiologic context entirely reshapes empiric coverage; conflating the two ships the wrong drug to the wrong patient." },
      { sev: "trigger",
        what: "Two sets of peripheral blood cultures **only** if endogenous source suspected (immunocompromise, IVDU, recent bacteremia).",
        why:  "Endogenous endophthalmitis arises from bloodstream seeding; routine BCx in post-op disease is low-yield." },
    ],
    panels: [
      { sev: "consider",
        what: "16S/18S rRNA PCR on vitreous if culture-negative at 48 h.",
        why:  "Molecular methods identify fastidious pathogens and partially-treated cases; changes intravitreal targeting." },
    ],
    imaging: [
      { sev: "required",
        what: "**B-scan ocular ultrasound** at presentation to assess vitritis, retinal detachment, and lens involvement.",
        why:  "Vitreous opacity precludes fundoscopy; US gates vitrectomy vs intravitreal-only management." },
      { sev: "trigger",
        what: "TTE / TEE + abdominal imaging when endogenous source suspected (Klebsiella liver abscess, S. aureus IE).",
        why:  "Endogenous endophthalmitis is a sentinel for a remote septic focus that must be drained or addressed." },
    ],
  },

  /* === Mycotic aneurysm ================================================== */
  "mycotic-aneurysm": {
    cultures: [
      { sev: "required",
        what: "**Two sets** of peripheral blood cultures on detection; repeat q48h until clearance documented.",
        why:  "Endovascular focus drives persistent bacteremia; Salmonella, S. aureus, and streptococci dominate." },
      { sev: "required",
        what: "Aortic or aneurysmal wall tissue culture at surgical resection.",
        why:  "Definitive diagnosis often requires tissue; pathogen-tissue match drives 6–8 week post-operative therapy." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "CRP, ESR baseline and trended to support response to suppressive therapy.",
        why:  "Lifelong suppression decisions in non-resectable mycotic aneurysm depend on inflammatory trend." },
    ],
    imaging: [
      { sev: "required",
        what: "**CT angiography** of the affected vessel — saccular morphology, peri-aortic gas, or rapid expansion is diagnostic.",
        why:  "Rupture risk dictates emergent surgical evaluation; serial imaging tracks expansion on therapy." },
      { sev: "trigger",
        what: "18F-FDG PET-CT for occult mycotic aneurysm when persistent bacteremia and negative initial imaging.",
        why:  "PET-CT detects mural inflammation before structural change emerges on CTA." },
      { sev: "required",
        what: "TEE in every case to exclude concomitant endocarditis.",
        why:  "Endocarditis with septic embolization is a dominant source of mycotic aneurysms." },
    ],
  },

  /* === Vascular-device infection (graft, stent, AICD lead) =============== */
  "device-vascular": {
    cultures: [
      { sev: "required",
        what: "**Two sets** of peripheral blood cultures; repeat **q48h until clearance**.",
        why:  "Continuous bacteremia is the diagnostic hallmark; clearance time defines retention vs explant decision." },
      { sev: "trigger",
        what: "Tissue and device culture at any explant or surgical revision; sonicate explanted hardware.",
        why:  "Sonication culture of explanted hardware raises pathogen yield by 20–30% vs swab culture." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "CRP, ESR trend during therapy; weekly during prolonged courses.",
        why:  "Inflammatory persistence on appropriate therapy suggests retained focus needing surgical revision." },
    ],
    panels: [
      { sev: "trigger",
        what: "16S rRNA PCR on explanted hardware or surrounding tissue.",
        why:  "Identifies organism in culture-negative or partially-treated cases for targeted suppression." },
    ],
    imaging: [
      { sev: "required",
        what: "**18F-FDG PET-CT or CTA** of involved territory for peri-graft inflammation, fluid, or gas.",
        why:  "PET-CT sensitivity ~95% for prosthetic graft infection; distinguishes infection from postoperative changes." },
      { sev: "required",
        what: "TEE for cardiac device infection (lead vegetation, valve involvement).",
        why:  "Lead vegetations gate extraction timing and post-extraction duration." },
    ],
  },

  /* === Persistent MRSA bacteremia ======================================== */
  "persistent-mrsa": {
    cultures: [
      { sev: "required",
        what: "Two sets of peripheral blood cultures **q48h until clearance documented** — persistence defined as positive > 5–7 days.",
        why:  "Time-to-clearance defines complicated MRSA bacteremia and starts the 4–6 week duration clock at first negative." },
      { sev: "required",
        what: "Re-culture every retained source (line, joint, wound, urine) and reassess for occult focus.",
        why:  "Persistent positives demand source re-inventory; undrained abscess and biofilm focus drive failure." },
    ],
    biomarkers: [
      { sev: "trigger",
        what: "Vancomycin AUC₂₄/MIC target 400–600; reflex daptomycin MIC and consider switch if vancomycin MIC > 1 mg/L (creep) or = 2 (borderline).",
        why:  "MIC > 1 mg/L predicts failure even when CLSI calls ≤ 2 susceptible; heteroresistance and seeded foci compound the risk." },
      { sev: "consider",
        what: "Daily CRP trend; lactate if signs of new organ dysfunction.",
        why:  "Inflammatory persistence supports occult focus; new lactate rise drives imaging escalation." },
    ],
    imaging: [
      { sev: "required",
        what: "**TEE** if not yet done; repeat at day 5–7 if initial negative and bacteremia persists.",
        why:  "MRSA IE may not be visible early; serial TEE catches evolving vegetations driving 4–6 week duration." },
      { sev: "required",
        what: "**Whole-body PET-CT or focused MRI** when BCx persist > 5 days.",
        why:  "Identifies occult metastatic focus — vertebral osteomyelitis, psoas abscess, septic emboli, mycotic aneurysm." },
    ],
    biopsy: [
      { sev: "trigger",
        what: "Tissue culture from any newly identified focus at surgical drainage.",
        why:  "Source-control surgery resets the clearance clock; tissue culture confirms pathogen-tissue match." },
    ],
  },

  /* === Pseudo-bacteremia (contamination, false positive) ================= */
  "pseudo-bact": {
    cultures: [
      { sev: "required",
        what: "**Repeat blood cultures** from two separate venipuncture sites before any escalation of therapy.",
        why:  "Single positive of skin-flora organism (CoNS, Corynebacterium, Bacillus, Propionibacterium) is contamination in > 80%." },
      { sev: "trigger",
        what: "Review collection technique, bottle volume, and skin-prep documentation for the index draw.",
        why:  "Identifies systematic phlebotomy issue; contamination clusters drive batch-level quality review." },
    ],
    biomarkers: [
      { sev: "consider",
        what: "CRP and procalcitonin to support a non-infectious clinical picture.",
        why:  "Low biomarkers in a well-appearing patient support contamination over true bacteremia." },
    ],
    panels: [
      { sev: "consider",
        what: "Rapid PCR on positive bottle to confirm organism identity quickly.",
        why:  "Same-day species identification distinguishes Bacillus anthracis (true pathogen) from Bacillus cereus contamination." },
    ],
  },

};
