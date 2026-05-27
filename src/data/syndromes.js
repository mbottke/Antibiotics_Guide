/* data · syndrome definitions, categories, source-control, directed therapy.
   Inpatient Antibiotic Guide — module graph documented in README.md. */
/* ===================== DATA: DIRECTED (bug -> drug) ===================== */
const DIRECTED = [
  { grp:"Gram-positive cocci", items:[
    { org:"Staphylococcus aureus — MSSA", sub:"methicillin-susceptible",
      first:"Cefazolin 2 g IV q8h, or nafcillin/oxacillin 2 g IV q4h",
      alt:"Cefazolin preferred for tolerability; nafcillin if CNS source (better penetration debated)",
      cav:"Beta-lactams are SUPERIOR to vancomycin — switch off vancomycin the moment MSSA is confirmed. Never leave vancomycin running for MSSA." },
    { org:"Staphylococcus aureus — MRSA", sub:"methicillin-resistant",
      first:"Vancomycin (AUC/MIC 400–600), or daptomycin 8–10 mg/kg IV q24h (non-pulmonary)",
      alt:"Ceftaroline (salvage / persistent bacteremia); linezolid for pneumonia/non-bacteremic",
      cav:"Daptomycin NEVER for pneumonia (surfactant). Vancomycin MIC ≥2 or failure → switch to daptomycin. Add nothing reflexively — ID consult for persistent bacteremia." },
    { org:"Coagulase-negative staphylococci", sub:"S. epidermidis etc.",
      first:"Vancomycin IV (most are methicillin-resistant)",
      alt:"Cefazolin/nafcillin if oxacillin-susceptible and a true infection",
      cav:"Usually a blood-culture contaminant — require multiple positive sets or a device source before treating. Suspect line/hardware." },
    { org:"Streptococcus pneumoniae", sub:"& other streptococci",
      first:"Penicillin G or ceftriaxone (penicillin-susceptible); ceftriaxone empirically",
      alt:"Levofloxacin/moxifloxacin; vancomycin added for CNS until susceptibility known",
      cav:"Macrolide resistance is common — do not use azithromycin monotherapy for invasive pneumococcal disease." },
    { org:"Enterococcus faecalis", sub:"ampicillin-susceptible",
      first:"Ampicillin (or penicillin G); add ceftriaxone or gentamicin for endocarditis synergy",
      alt:"Vancomycin if penicillin-allergic",
      cav:"Cephalosporins have NO enterococcal activity. Ampicillin + ceftriaxone is the preferred synergy for E. faecalis endocarditis (avoids aminoglycoside toxicity)." },
    { org:"Enterococcus faecium / VRE", sub:"vancomycin-resistant",
      first:"Daptomycin 8–12 mg/kg IV q24h, or linezolid 600 mg q12h",
      alt:"Daptomycin for bacteremia; linezolid for pneumonia/UTI or daptomycin failure",
      cav:"Ampicillin usually inactive against E. faecium. Daptomycin dose-creep for VRE bacteremia (≥10 mg/kg) per emerging data; monitor CK." },
    { org:"Group A Streptococcus", sub:"S. pyogenes",
      first:"Penicillin G or ampicillin",
      alt:"Add clindamycin for toxin suppression in invasive/necrotizing disease",
      cav:"Always penicillin-susceptible. Clindamycin is adjunctive (Eagle effect / toxin), not a substitute for the beta-lactam." },
  ]},
  { grp:"Enterobacterales (Gram-negative)", items:[
    { org:"E. coli / Klebsiella — wild-type", sub:"non-resistant",
      first:"Ceftriaxone; cefazolin for cystitis",
      alt:"Fluoroquinolone or TMP-SMX by susceptibility for oral step-down",
      cav:"De-escalate broad empiric agents to ceftriaxone once susceptibility confirms wild-type." },
    { org:"ESBL-producing Enterobacterales", sub:"CTX-M etc.",
      first:"Carbapenem — ertapenem (no Pseudomonas) or meropenem (serious/critically ill)",
      alt:"Cystitis: nitrofurantoin or TMP-SMX. Pyelo/cUTI: TMP-SMX, cipro, or levo if susceptible",
      cav:"Pip-tazo is INFERIOR to meropenem for ESBL bacteremia (MERINO) — do not use even if susceptible in vitro. Cephamycins not recommended." },
    { org:"AmpC-E (moderate-risk inducers)", sub:"Enterobacter, K. aerogenes, C. freundii",
      first:"Cefepime (IDSA 2024 preferred)",
      alt:"Carbapenem if high inoculum or critically ill; TMP-SMX or FQ for step-down",
      cav:"Avoid ceftriaxone / 3rd-gen cephalosporins — risk of treatment-emergent derepression. The old caution against cefepime at MIC 4–8 has been withdrawn." },
  ]},
  { grp:"Non-fermenters & resistant Gram-negatives", items:[
    { org:"Pseudomonas aeruginosa", sub:"susceptible",
      first:"Cefepime, piperacillin-tazobactam, ceftazidime, or meropenem (one active agent)",
      alt:"Ciprofloxacin/levofloxacin for oral step-down; tobramycin/amikacin adjunct",
      cav:"Definitive therapy is a SINGLE active agent once susceptibility is known — routine double coverage does not improve outcomes outside empiric shock." },
    { org:"DTR Pseudomonas aeruginosa", sub:"difficult-to-treat resistance",
      first:"Ceftolozane-tazobactam, ceftazidime-avibactam, or imipenem-relebactam (by susceptibility)",
      alt:"Cefiderocol; consider combination only if no single susceptible agent",
      cav:"DTR = nonsusceptible to all of pip-tazo, ceftazidime, cefepime, aztreonam, carbapenems, and FQs. Reserve novel agents; obtain susceptibilities." },
    { org:"CRE — KPC or OXA-48", sub:"serine carbapenemase",
      first:"Ceftazidime-avibactam, meropenem-vaborbactam, or imipenem-relebactam",
      alt:"Cefiderocol; meropenem-vaborbactam favored for KPC",
      cav:"Confirm carbapenemase type — it changes the agent. OXA-48 covered by ceftazidime-avibactam but not by vaborbactam/relebactam." },
    { org:"CRE — metallo-β-lactamase", sub:"NDM, VIM, IMP",
      first:"Ceftazidime-avibactam PLUS aztreonam, or cefiderocol monotherapy",
      alt:"Cefiderocol preferred where available; MBL prevalence rising in the US",
      cav:"MBLs hydrolyze all carbapenems and are NOT inhibited by avibactam/vaborbactam/relebactam alone — the aztreonam combination evades the MBL." },
    { org:"Acinetobacter baumannii (CRAB)", sub:"carbapenem-resistant",
      first:"Sulbactam-durlobactam PLUS a carbapenem (imipenem or meropenem)",
      alt:"High-dose ampicillin-sulbactam (27 g/day) + a second agent (minocycline, polymyxin B, or cefiderocol) if sulbactam-durlobactam unavailable",
      cav:"Combination therapy for moderate-to-severe disease. Carbapenem monotherapy, rifamycins, and nebulized antibiotics are NOT recommended. Distinguish colonization from infection." },
    { org:"Stenotrophomonas maltophilia", sub:"intrinsically resistant",
      first:"Two of: TMP-SMX, minocycline, cefiderocol, or levofloxacin (TMP-SMX & minocycline preferred)",
      alt:"Ceftazidime-avibactam + aztreonam is an alternative preferred combination",
      cav:"Ceftazidime is no longer tested or recommended (intrinsic L1/L2 β-lactamases). Often a colonizer — confirm true infection. Cefiderocol needs a partner agent at least initially." },
  ]},
  { grp:"Anaerobes & atypicals", items:[
    { org:"Bacteroides fragilis", sub:"& other anaerobes",
      first:"Metronidazole (below diaphragm); piperacillin-tazobactam or carbapenem if part of broad regimen",
      alt:"Ampicillin-sulbactam, amoxicillin-clavulanate; clindamycin (rising resistance)",
      cav:"Increasing clindamycin resistance among B. fragilis — metronidazole remains reliable. Cefepime/ceftriaxone need metronidazole added." },
    { org:"Legionella / Mycoplasma / Chlamydophila", sub:"atypical pneumonia",
      first:"Respiratory fluoroquinolone (levofloxacin/moxifloxacin) or azithromycin",
      alt:"Doxycycline",
      cav:"Beta-lactams are inactive against atypicals (no cell wall / intracellular). Severe Legionella favors a fluoroquinolone." },
    { org:"Listeria monocytogenes", sub:"meningitis / bacteremia",
      first:"Ampicillin (high dose) + gentamicin for synergy in severe disease",
      alt:"TMP-SMX for severe penicillin allergy",
      cav:"Cephalosporins do NOT cover Listeria — the reason ampicillin is added empirically at age >50 or in impaired cell-mediated immunity." },
    { org:"Nocardia species", sub:"immunocompromised",
      first:"High-dose TMP-SMX; add imipenem and/or amikacin for severe/disseminated/CNS disease",
      alt:"Linezolid (reliably active); susceptibility-guided, species varies",
      cav:"Prolonged therapy (months to a year); send speciation and susceptibilities. CNS involvement mandates combination therapy." },
  ]},
];

/* ===================== DATA: SYNDROMES ===================== */
const SYN_CATS = [
  { id:"sepsis", label:"Sepsis", icon:"pulse" },
  { id:"resp", label:"Respiratory", icon:"lung" },
  { id:"blood", label:"Bloodstream & cardiac", icon:"heart" },
  { id:"gu", label:"Genitourinary", icon:"drop" },
  { id:"abd", label:"Intra-abdominal", icon:"soup" },
  { id:"ssti", label:"Skin, soft tissue & bone", icon:"slice" },
  { id:"cns", label:"Central nervous system", icon:"brain" },
  { id:"tox", label:"Toxin-mediated & GI", icon:"flame" },
  { id:"immuno", label:"Immunocompromised host", icon:"shield" },
];

/* Syndromes where definitive cure depends on a procedure, not the antibiotic.
   The value names the specific intervention; the banner leads the card so the
   point is seen before the regimen. Undrained pus / retained hardware /
   undebrided necrosis defeats any drug. */
const SRC_CONTROL = {
  empyema:       "Drain the pleural space \u2014 chest tube, and intrapleural tPA/DNase or VATS for loculated or organizing collections.",
  aspiration:    "A true lung abscess that fails to drain bronchially, or any empyema, needs drainage; antibiotics alone treat only simple aspiration pneumonitis.",
  liverabscess:  "Percutaneous or surgical drainage of pyogenic collections \u2014 aspirate for culture and decompression; amebic abscesses are the exception (treat medically).",
  cholangitis:   "Biliary decompression (ERCP) is the priority \u2014 antibiotics buy time but do not relieve obstruction.",
  diverticulitis:"Drain abscesses > 3\u20134 cm percutaneously; operate for perforation, obstruction, or failure of medical therapy.",
  peritonitis:   "Secondary peritonitis demands a source procedure \u2014 perforation repair, abscess drainage, or removal of the infected focus.",
  pancreatic:    "Delay intervention when possible; drain or debride infected necrosis by a step-up approach (percutaneous/endoscopic before surgical) once walled off.",
  necfasc:       "Emergent surgical debridement is the intervention that saves the limb and life \u2014 antibiotics never substitute for the OR. Repeat exploration until the tissue is clean.",
  fournier:      "Immediate, often serial surgical debridement \u2014 the diagnosis is a surgical emergency.",
  pyomyositis:   "Drain the abscess once it forms; early phlegmon may respond to antibiotics alone, but a discrete collection must be evacuated.",
  ludwig:        "Secure the airway first; decompress/drain the floor of mouth and neck spaces surgically when fluctuant.",
  mediastinitis: "Surgical debridement and mediastinal drainage \u2014 with sternal wound infection, hardware removal as indicated.",
  brainabscess:  "Aspirate or excise abscesses \u2265 2.5 cm (and most others) for diagnosis and decompression \u2014 neurosurgical drainage guides both organism and therapy.",
  orbital:       "Drain a subperiosteal or orbital abscess surgically when large, vision-threatening, or not improving on antibiotics.",
  crbsi:         "Remove the infected catheter \u2014 retention drives relapse, especially with S. aureus, Pseudomonas, Candida, or a tunnel-tract infection.",
  pji:           "Cure requires addressing the implant \u2014 debridement with retention, one-/two-stage exchange, or removal; biofilm on retained hardware is not sterilized by antibiotics alone.",
};

const SYNDROMES = [
  { id:"sepsis", cat:"sepsis", icon:"pulse", name:"Sepsis / Septic Shock (empiric, source unknown)",
    line:"Surviving Sepsis · broad then narrow fast",
    tiers:[
      { k:"Broad empiric", rx:"Antipseudomonal β-lactam (piperacillin-tazobactam, cefepime, or meropenem) ± vancomycin", note:"Within 1 hour for septic shock. Choice driven by suspected source, prior cultures, and local antibiogram." },
      { k:"Add MRSA", rx:"Vancomycin or linezolid", note:"Gram-positive source, prior MRSA, line/skin source, or critical illness. Remove if cultures do not support it.", sev:false },
      { k:"Add resistant-GNR cover", rx:"Carbapenem (ESBL risk) or novel agent by colonization history", note:"Tailor to prior resistant isolates; add an echinocandin (antifungal guide) for candidemia risk." },
    ],
    cover:{ empiric:"The most likely source pathogens plus resistant organisms by local epidemiology and patient history", drop:"Broad empiric therapy is a starting point, not an endpoint — daily de-escalation is mandatory." },
    bugs:["entero","pseudo","esbl","mrsa","strep","anaerobe"],
    duration:"Set by source and pathogen; most controlled-source bacteremias need 7 days (BALANCE). Avoid open-ended courses.",
    deesc:"Reassess daily. De-escalation to a narrower agent does not worsen outcomes and reduces resistance/toxicity; procalcitonin trends can support stopping.",
    pearls:[
      "Blood cultures before antibiotics whenever it does not delay therapy in shock.",
      "The first dose is a full loading dose regardless of renal function — adjust subsequent doses, never the first.",
      "Hunt for an undrained source before escalating spectrum for apparent failure." ] },

  { id:"sepsis-hcaq", cat:"sepsis", icon:"pulse", name:"Healthcare-Associated Sepsis",
    line:"Recent hospitalization, devices, or prior resistant isolates raise the empiric ceiling",
    tiers:[
      { k:"Broad empiric", rx:"Antipseudomonal β-lactam (cefepime, piperacillin-tazobactam, or meropenem) + vancomycin", note:"Carbapenem if prior ESBL; choice anchored to the patient's own prior cultures and the unit antibiogram." },
      { k:"Resistant-GNR risk", rx:"Carbapenem, or a novel β-lactam/β-lactamase-inhibitor by colonization history", note:"Prior CRE/DTR-Pseudomonas colonization drives the agent; add an echinocandin (antifungal guide) for candidemia risk.", sev:true },
    ],
    cover:{ empiric:"Resistant Enterobacterales, Pseudomonas, MRSA, and Candida proportionate to prior isolates and exposures", drop:"Empiric carbapenem or novel agent once susceptibilities exclude resistant organisms — de-escalate aggressively." },
    bugs:["pseudo","esbl","mrsa","cre","entero"],
    duration:"Source- and pathogen-specific; controlled-source bacteremia 7 days (BALANCE).",
    deesc:"Prior cultures are the single best guide — review them at presentation. Narrow at 48–72 h on current susceptibilities.",
    pearls:[
      "A patient's own prior resistant isolate is the strongest predictor of the current organism — pull the microbiology history first.",
      "Healthcare exposure is not a reason for indefinite breadth; de-escalate on the same schedule as community sepsis." ] },

  { id:"sepsis-neutropenic", cat:"sepsis", icon:"pulse", name:"Neutropenic Sepsis",
    line:"Fever with ANC < 500 — a medical emergency; antibiotics within the hour",
    tiers:[
      { k:"Empiric monotherapy", rx:"Antipseudomonal β-lactam — cefepime 2 g IV q8h, piperacillin-tazobactam 4.5 g q6h, or meropenem 1 g q8h", note:"Monotherapy is standard; do not add an aminoglycoside or vancomycin reflexively." },
      { k:"Add MRSA / resistant cover", rx:"Add vancomycin for catheter infection, skin/soft-tissue source, pneumonia, or hemodynamic instability; add resistant-GNR cover by colonization", note:"Add an echinocandin (antifungal guide) for persistent fever after 4–7 days or documented candidemia.", sev:true },
    ],
    cover:{ empiric:"Enterobacterales, Pseudomonas, viridans streptococci; MRSA and Candida only with specific risk", drop:"Routine empiric vancomycin — it does not improve outcomes and is removed at 48 h without a Gram-positive indication." },
    bugs:["pseudo","entero","strep","mrsa"],
    duration:"Continue until ANC recovery and afebrile; tailor to any documented infection.",
    deesc:"Do not stop empiric coverage solely because fever resolves if the patient remains neutropenic without a clear source; reassess vancomycin at 48 h.",
    pearls:[
      "Time-to-antibiotic is the outcome-determining variable — treat before imaging or a full workup.",
      "Persistent fever after 4–7 days of broad antibacterials prompts an antifungal and a hunt for an occult focus (see an antifungal reference)." ] },

  { id:"sepsis-asplenia", cat:"sepsis", icon:"pulse", name:"Sepsis in the Asplenic / Hyposplenic Patient",
    line:"Fulminant encapsulated-organism sepsis — the OPSI emergency",
    tiers:[
      { k:"Empiric", rx:"Ceftriaxone 2 g IV q12h (cover encapsulated organisms and possible meningitis) + vancomycin", note:"Vancomycin for cephalosporin-resistant pneumococcus until susceptibilities return. Treat at the first suspicion — deterioration is measured in hours." },
    ],
    cover:{ empiric:"S. pneumoniae, H. influenzae, N. meningitidis; Capnocytophaga after a dog bite; Babesia/malaria in the right exposure", drop:"Any delay — empiric therapy precedes confirmation in the asplenic patient with fever." },
    bugs:["strep","entero"],
    duration:"Pathogen-specific once identified; treat through clinical resolution with source control as needed.",
    deesc:"Narrow to the organism; ensure vaccination and patient education on standby antibiotics at discharge.",
    pearls:[
      "Overwhelming post-splenectomy infection carries high mortality and progresses within hours — empiric ceftriaxone cannot wait for confirmation.",
      "Capnocytophaga canimorsus sepsis follows dog bites in asplenic or cirrhotic hosts — amoxicillin-clavulanate or a carbapenem covers it." ] },

  { id:"sepsis-toxic", cat:"sepsis", icon:"pulse", name:"Sepsis with a Toxin-Mediated Pattern",
    line:"Shock out of proportion to local findings — suspect toxic shock or necrotizing infection",
    tiers:[
      { k:"Empiric", rx:"Broad β-lactam (piperacillin-tazobactam or a carbapenem) + vancomycin + clindamycin", note:"Clindamycin suppresses toxin production in group A streptococcal and staphylococcal disease; vancomycin covers MRSA pending cultures." },
    ],
    cover:{ empiric:"Group A Streptococcus, S. aureus (incl. MRSA), Clostridium species; mixed flora in necrotizing infection", drop:"Antibiotics as sole therapy — necrotizing infection and undrained foci require emergent source control." },
    bugs:["strep","mssa","mrsa","anaerobe"],
    duration:"Driven by source control; group A strep / staphylococcal toxic shock typically ≥14 days with focus clearance.",
    deesc:"Continue clindamycin until the patient is stable and toxin-driven physiology has resolved; add IVIG in refractory streptococcal toxic shock.",
    pearls:[
      "Pain out of proportion, rapidly spreading erythema, or hypotension with a trivial-appearing wound mandates immediate surgical evaluation for necrotizing infection.",
      "Clindamycin is added for its anti-toxin (Eagle-effect-sparing) action, not its spectrum — the β-lactam still does the killing." ] },

  { id:"sepsis-abdominal", cat:"sepsis", icon:"pulse", name:"Sepsis with a Suspected Abdominal Source",
    line:"Undifferentiated sepsis with peritoneal signs, an acute abdomen, or a biliary picture",
    tiers:[
      { k:"Empiric", rx:"Piperacillin-tazobactam 4.5 g IV q6h (extended infusion), or a carbapenem if prior ESBL; add vancomycin if healthcare-associated", note:"Covers enteric Gram-negatives, anaerobes, and streptococci. Imaging and source control (drainage, ERCP, or laparotomy) are as urgent as the antibiotic." },
      { k:"Add antifungal risk", rx:"Add an echinocandin (antifungal guide) for upper-GI perforation, postoperative leak, or recurrent intra-abdominal infection", note:"Candida coverage is justified for these specific sources, not for community-acquired peritonitis.", sev:true },
    ],
    cover:{ empiric:"Enterobacterales, anaerobes (Bacteroides), enterococci, and streptococci of enteric origin; Candida by source", drop:"Empiric antifungal or anti-enterococcal coverage in community-acquired disease without the specific risks — and antibiotics as a substitute for drainage." },
    bugs:["entero","anaerobe","efaecalis","esbl"],
    duration:"~4 days after adequate source control (STOP-IT); longer if control is incomplete.",
    deesc:"The microbiology points to the source — pursue cross-sectional imaging early and narrow once cultures and the anatomic diagnosis return.",
    pearls:[
      "An abdominal source is the most common occult driver of undifferentiated sepsis — image the abdomen and pelvis early.",
      "Source control resets the duration clock; a prolonged antibiotic course does not compensate for an undrained collection." ] },

  { id:"cap", cat:"resp", durKey:"Community-acquired pneumonia", icon:"lung", name:"Community-Acquired Pneumonia (CAP)",
    line:"Inpatient, non-severe vs severe/ICU · ATS/IDSA 2019",
    tiers:[
      { k:"Inpatient, non-ICU", rx:"Ceftriaxone 1–2 g IV q24h + azithromycin 500 mg q24h", note:"Or respiratory fluoroquinolone monotherapy (levofloxacin 750 mg or moxifloxacin 400 mg) where allergy or stewardship favors it." },
      { k:"Severe / ICU", rx:"β-lactam (ceftriaxone or ampicillin-sulbactam) + azithromycin, OR β-lactam + respiratory FQ", note:"Add MRSA (vancomycin/linezolid) and antipseudomonal coverage only with validated risk factors or prior respiratory isolation.", sev:true },
    ],
    cover:{ empiric:"S. pneumoniae, H. influenzae, atypicals (Legionella, Mycoplasma, Chlamydophila)", drop:"Routine MRSA and Pseudomonas coverage — the HCAP category is abandoned; cover only with locally validated risk factors." },
    bugs:["strep","atypical","mssa"],
    duration:"Minimum 5 days; stop when afebrile 48–72 h and stable. Most uncomplicated CAP needs no more than 5 days.",
    deesc:"De-escalate per culture; stop atypical coverage if Legionella antigen and respiratory PCR negative and a typical pathogen identified. IV→PO once stable and absorbing.",
    pearls:[
      "Procalcitonin should not gate the decision to start in CAP — initiate empirically; it can support stopping.",
      "Obtain pneumococcal and Legionella urinary antigens in severe disease.",
      "MRSA/Pseudomonas risk = prior isolation, recent hospitalization with IV antibiotics, or locally validated factors — not the discarded HCAP label." ] },

  { id:"hap", cat:"resp", durKey:"HAP / VAP", icon:"lung", name:"HAP / VAP",
    line:"Hospital-acquired & ventilator-associated · ATS/IDSA 2016",
    tiers:[
      { k:"Empiric backbone", rx:"Antipseudomonal β-lactam: piperacillin-tazobactam 4.5 g q6h (extended infusion), cefepime 2 g q8h, or meropenem 1 g q8h", note:"One antipseudomonal agent in most; double Pseudomonas coverage only with high resistance risk or shock." },
      { k:"Add MRSA", rx:"Vancomycin (AUC) or linezolid 600 mg q12h", note:"Prior MRSA, IV antibiotics within 90 days, ICU/unit MRSA >10–20%, or critical illness. Linezolid preferred for lung (daptomycin inactivated by surfactant)." },
      { k:"Double GNR (high risk)", rx:"Add an aminoglycoside or antipseudomonal FQ to the β-lactam", note:"Structural lung disease, prior resistant GNR, or shock; de-escalate to one active agent once susceptibilities return.", sev:true },
    ],
    cover:{ empiric:"Pseudomonas, Enterobacterales (incl. ESBL/AmpC by local rates), MRSA, S. aureus", drop:"Linezolid over daptomycin for pulmonary MRSA — daptomycin is inactivated by surfactant." },
    bugs:["pseudo","entero","esbl","ampc","mrsa","mssa"],
    duration:"7 days for most VAP/HAP — non-inferior to longer, even for non-fermenting GNR in responders.",
    deesc:"Reassess at 48–72 h with cultures; narrow to the single most targeted agent, drop MRSA coverage if negative, stop the second GNR agent.",
    pearls:[
      "Use extended-infusion β-lactams for severe GNR infection to optimize time-above-MIC.",
      "Obtain a lower respiratory culture (ideally pre-treatment) to enable de-escalation.",
      "Apply MRSA and double antipseudomonal coverage only with validated risk factors (prior resistant isolate, structural lung disease, recent broad antibiotics, or high unit prevalence), then narrow at 48–72 h." ] },

  { id:"aspiration", cat:"resp", durKey:"Aspiration pneumonia", icon:"lung", name:"Aspiration Pneumonia / Lung Abscess",
    line:"Community vs hospital aspiration",
    tiers:[
      { k:"Community-acquired aspiration", rx:"Ceftriaxone or ampicillin-sulbactam", note:"Routine anaerobic coverage is largely abandoned for uncomplicated aspiration pneumonitis/pneumonia." },
      { k:"Abscess / empyema / necrotizing", rx:"Ampicillin-sulbactam or piperacillin-tazobactam (anaerobic coverage indicated)", note:"True abscess and necrotizing disease still warrant anaerobic coverage and drainage.", sev:true },
    ],
    cover:{ empiric:"Oral streptococci, Enterobacterales; anaerobes for abscess/empyema/necrotizing disease", drop:"Anaerobic coverage for simple aspiration is no longer routine — reserve for abscess, empyema, or putrid sputum." },
    bugs:["strep","anaerobe","entero"],
    duration:"5–7 days for aspiration pneumonia; lung abscess for weeks until radiographic improvement.",
    deesc:"Narrow per culture; abscess favors prolonged therapy guided by imaging response.",
    pearls:[
      "Distinguish aspiration pneumonitis (chemical, often no antibiotics) from bacterial aspiration pneumonia.",
      "Add metronidazole or use a β-lactam/β-lactamase-inhibitor when anaerobes are genuinely implicated." ] },

  { id:"empyema", cat:"resp", durKey:"Empyema / complicated parapneumonic effusion", icon:"lung", name:"Parapneumonic Effusion / Empyema",
    line:"Complicated effusion requiring drainage",
    tiers:[
      { k:"Community empyema", rx:"Ceftriaxone + metronidazole, or ampicillin-sulbactam", note:"Cover streptococci (incl. S. anginosus group) and anaerobes." },
      { k:"Hospital / post-procedural", rx:"Vancomycin + piperacillin-tazobactam", note:"Cover MRSA and Pseudomonas after instrumentation or hospitalization.", sev:true },
    ],
    cover:{ empiric:"Streptococci (S. anginosus group), anaerobes, S. aureus; GNR/Pseudomonas in healthcare-associated", drop:"Antibiotics do not substitute for chest-tube/surgical drainage — source control is decisive." },
    bugs:["strep","anaerobe","mssa","mrsa","pseudo"],
    duration:"2–4 weeks, guided by drainage adequacy and clinical response.",
    deesc:"Drainage is the priority; narrow antibiotics per pleural fluid and blood cultures.",
    pearls:[
      "An undrained empyema will defeat any antibiotic — early thoracostomy ± intrapleural fibrinolytics or VATS.",
      "S. anginosus group streptococci are classic empyema/abscess formers." ] },

  { id:"copd", cat:"resp", durKey:"COPD exacerbation (bacterial)", icon:"lung", name:"COPD Exacerbation (bacterial)",
    line:"Acute exacerbation with bacterial features",
    tiers:[
      { k:"Standard", rx:"Aminopenicillin/β-lactamase inhibitor, doxycycline, or a macrolide", note:"Reserve antibiotics for increased dyspnea + sputum volume + purulence, or mechanical ventilation." },
      { k:"Pseudomonas risk", rx:"Antipseudomonal coverage (e.g., levofloxacin or β-lactam)", note:"Frequent exacerbations, prior Pseudomonas, severe airflow limitation, recent broad antibiotics.", sev:false },
    ],
    cover:{ empiric:"H. influenzae, M. catarrhalis, S. pneumoniae; Pseudomonas in advanced disease", drop:"Not every exacerbation is bacterial — apply the cardinal-symptom criteria before treating." },
    bugs:["strep","atypical"],
    duration:"5 days.",
    deesc:"Short course; reassess need for antibiotics against the symptom criteria.",
    pearls:[
      "Bronchodilators and corticosteroids are the core therapy; antibiotics are adjunctive in selected exacerbations.",
      "Procalcitonin may help limit antibiotic use in borderline exacerbations." ] },

  { id:"bronchiectasis", cat:"resp", icon:"lung", name:"Bronchiectasis Exacerbation",
    line:"Chronic airway disease with a known colonizing flora",
    tiers:[
      { k:"No Pseudomonas history", rx:"Amoxicillin-clavulanate or a respiratory fluoroquinolone, guided by prior sputum", note:"Cover H. influenzae and S. pneumoniae; align with the patient's prior cultures." },
      { k:"Pseudomonas colonized", rx:"Antipseudomonal therapy — ciprofloxacin orally, or an antipseudomonal β-lactam if severe", note:"Sputum culture history is the best guide; treat for 14 days in exacerbations.", sev:false },
    ],
    cover:{ empiric:"H. influenzae, S. pneumoniae, and Pseudomonas in the colonized patient", drop:"Empiric antipseudomonal coverage when no prior Pseudomonas isolate exists." },
    bugs:["strep","entero","pseudo"],
    duration:"10–14 days — longer than for ordinary lower respiratory infection given the chronic, colonized airway.",
    deesc:"Send sputum at every exacerbation to track the colonizing flora and resistance; airway clearance is central.",
    pearls:[
      "The prior sputum culture predicts the current exacerbation's organism more reliably than empiric guesswork.",
      "Pseudomonas colonization warrants longer courses and shapes future empiric choices." ] },

  { id:"vat", cat:"resp", icon:"lung", name:"Ventilator-Associated Tracheobronchitis",
    line:"Airway infection without new infiltrate — a distinct entity from VAP",
    tiers:[
      { k:"Targeted (if treated)", rx:"Organism-directed therapy by endotracheal aspirate; antipseudomonal cover if colonized", note:"Treatment is selective — reserved for systemic signs without pneumonia; many cases need none.", sev:false },
    ],
    cover:{ empiric:"Pseudomonas, Enterobacterales, S. aureus reflecting ventilator-circuit flora", drop:"Routine antibiotics for every positive aspirate — distinguish colonization from infection." },
    bugs:["pseudo","entero","mrsa"],
    duration:"Short (around 7 days) when treatment is indicated; reassess the need at 48–72 h.",
    deesc:"The decision to treat at all is the key step; a positive aspirate without a new infiltrate or systemic signs is often colonization.",
    pearls:[
      "By definition there is no new radiographic infiltrate — its presence reclassifies the patient as VAP.",
      "Treating tracheobronchitis may reduce progression to VAP in selected patients, but indiscriminate treatment selects resistance." ] },

  { id:"postobstructive", cat:"resp", icon:"lung", name:"Post-Obstructive Pneumonia",
    line:"Pneumonia distal to an obstructing lesion (tumor, foreign body, mucus plug)",
    tiers:[
      { k:"Empiric", rx:"β-lactam/β-lactamase inhibitor (ampicillin-sulbactam or piperacillin-tazobactam) to cover anaerobes", note:"Relief of the obstruction is the definitive intervention; antibiotics manage the acute infection." },
    ],
    cover:{ empiric:"Oral and respiratory anaerobes, streptococci, and Enterobacterales behind the obstruction", drop:"Reliance on antibiotics alone — recurrent infection persists until the obstruction is relieved (bronchoscopy, stent, or resection)." },
    bugs:["strep","anaerobe","entero"],
    duration:"Variable; guided by relief of the obstruction and radiographic response. Recurrence is the rule until the lesion is addressed.",
    deesc:"Pursue the underlying lesion — recurrent same-lobe pneumonia in an adult is malignancy until proven otherwise.",
    pearls:[
      "Recurrent pneumonia in the same lobe demands bronchoscopy to exclude an obstructing tumor.",
      "Antibiotic duration follows source control — here, relief of the obstruction." ] },

  { id:"tracheobronchitis", cat:"resp", icon:"lung", name:"Acute Bacterial Tracheobronchitis (non-ventilated)",
    line:"Bacterial bronchitis in a patient without chronic lung disease",
    tiers:[
      { k:"Selective therapy", rx:"Most acute bronchitis is viral and needs no antibiotics; treat documented pertussis with a macrolide", note:"Reserve antibiotics for pertussis, an underlying chronic lung condition, or a documented bacterial cause." },
    ],
    cover:{ empiric:"Predominantly viral; Bordetella pertussis and atypicals when bacterial", drop:"Antibiotics for uncomplicated acute bronchitis in a healthy adult — they do not shorten illness and select resistance." },
    bugs:["atypical","strep"],
    duration:"None for viral bronchitis; 5 days (macrolide) for pertussis or atypical infection.",
    deesc:"The default is no antibiotic; confirm a bacterial indication before treating.",
    pearls:[
      "Acute bronchitis in a healthy adult is overwhelmingly viral — antibiotics are a stewardship failure point.",
      "A paroxysmal cough with post-tussive emesis or a whoop suggests pertussis; treat and trace contacts." ] },

  { id:"zoonotic-pna", cat:"resp", icon:"lung", name:"Zoonotic & Atypical Pneumonia",
    line:"Exposure-driven causes: Q fever, psittacosis, tularemia, leptospirosis",
    tiers:[
      { k:"Empiric by exposure", rx:"Doxycycline 100 mg PO/IV BID covers Coxiella, Chlamydia psittaci, and tularemia; add a fluoroquinolone or aminoglycoside for severe tularemia", note:"History of animal, bird, or environmental exposure drives the differential and the agent." },
    ],
    cover:{ empiric:"Coxiella burnetii (Q fever), Chlamydia psittaci (psittacosis), Francisella tularensis, Leptospira", drop:"Standard CAP coverage alone when the exposure history points to a zoonotic cause that doxycycline targets." },
    bugs:["atypical"],
    duration:"Doxycycline 14–21 days for most; longer for Q-fever endocarditis (months, with hydroxychloroquine).",
    deesc:"Serologic and exposure history confirm the diagnosis; doxycycline is the unifying empiric agent.",
    pearls:[
      "Take an exposure history — birds (psittacosis), parturient animals or unpasteurized dairy (Q fever), rabbits or ticks (tularemia).",
      "Doxycycline covers most of this differential and is the reason to ask the exposure question early." ] },

  { id:"gnbact", cat:"blood", durKey:"Gram-negative bacteremia (uncomplicated)", icon:"heart", name:"Gram-Negative Bacteremia",
    line:"Source-controlled, uncomplicated · BALANCE",
    tiers:[
      { k:"Empiric", rx:"Antipseudomonal β-lactam (cefepime or piperacillin-tazobactam) pending source/susceptibility", note:"Narrow rapidly once the organism and source are known." },
      { k:"Directed", rx:"Narrowest active agent — e.g., ceftriaxone for susceptible E. coli", note:"Carbapenem for ESBL; cefepime for AmpC; single active agent for Pseudomonas." },
    ],
    cover:{ empiric:"Enterobacterales, Pseudomonas by source and risk", drop:"Routine double Gram-negative coverage for definitive therapy — one active agent suffices once susceptible." },
    bugs:["entero","esbl","ampc","pseudo"],
    duration:"7 days for uncomplicated, source-controlled GNR bacteremia — equivalent to 14 days (BALANCE).",
    deesc:"Step down to oral fluoroquinolone or TMP-SMX if susceptible, absorbing, and source controlled — high-bioavailability oral therapy completes treatment.",
    pearls:[
      "BALANCE excluded S. aureus, endovascular sources, and severe immunocompromise — do not apply 7 days to those.",
      "Identify and control the source (urinary, biliary, line) — it governs both agent and duration.",
      "Repeat blood cultures are not routinely required in Gram-negative bacteremia that responds, unlike S. aureus bacteremia where documented clearance is mandatory." ] },

  { id:"sab", cat:"blood", icon:"heart", name:"S. aureus Bacteremia (SAB)",
    line:"Always treated as a serious, complication-prone infection",
    tiers:[
      { k:"MSSA", rx:"Cefazolin 2 g IV q8h, or nafcillin/oxacillin 2 g IV q4h", note:"β-lactam is SUPERIOR to vancomycin for MSSA — switch off vancomycin once MSSA is confirmed." },
      { k:"MRSA", rx:"Vancomycin (AUC/MIC 400–600) or daptomycin 8–10 mg/kg IV q24h", note:"Daptomycin if vancomycin MIC ≥2 or failing; ceftaroline as salvage for persistent bacteremia.", sev:true },
    ],
    cover:{ empiric:"S. aureus — MSSA vs MRSA drives the agent; never treat as a contaminant", drop:"Vancomycin for confirmed MSSA — it is inferior to a β-lactam." },
    bugs:["mssa","mrsa"],
    duration:"14 days (uncomplicated) from the first negative culture; 4–6 weeks if complicated (endocarditis, metastatic foci, prosthesis, persistent bacteremia).",
    deesc:"Uncomplicated requires ALL of: negative follow-up cultures within 2–4 d, defervescence within 72 h, no prosthesis/endocarditis, no metastatic focus. Otherwise it is complicated.",
    pearls:[
      "Mandatory bundle: repeat blood cultures q48h until clearance, echocardiography, ID consultation, and source removal.",
      "ID consultation independently lowers SAB mortality — obtain it on every case.",
      "Never step SAB down to oral therapy in the way Gram-negative bacteremia allows." ] },

  { id:"cons", cat:"blood", durKey:"Coagulase-negative staph bacteremia", icon:"heart", name:"Coagulase-Negative Staph Bacteremia",
    line:"Contaminant vs true device-associated infection",
    tiers:[
      { k:"True infection", rx:"Vancomycin IV", note:"Most CoNS are methicillin-resistant; treat only genuine infection (multiple positive sets, device source)." },
      { k:"Oxacillin-susceptible", rx:"Cefazolin or nafcillin", note:"If confirmed susceptible and a true infection.", sev:false },
    ],
    cover:{ empiric:"S. epidermidis and other CoNS — usually hardware/line-associated", drop:"Treating a single positive set without a source — most are skin contaminants." },
    bugs:["mrsa","mssa"],
    duration:"Depends on source/device; 5–7 days after line removal for uncomplicated catheter-related infection.",
    deesc:"Confirm true infection before committing; remove or exchange the implicated device.",
    pearls:[
      "Require ≥2 positive sets or a clear device source before treating CoNS.",
      "Persistent CoNS bacteremia signals retained hardware or endovascular infection." ] },

  { id:"entbact", cat:"blood", durKey:"Enterococcal bacteremia", icon:"heart", name:"Enterococcal Bacteremia",
    line:"E. faecalis vs E. faecium / VRE",
    tiers:[
      { k:"E. faecalis (amp-S)", rx:"Ampicillin (or penicillin G)", note:"Add ceftriaxone or gentamicin for synergy if endocarditis." },
      { k:"E. faecium / VRE", rx:"Daptomycin 8–12 mg/kg IV q24h, or linezolid 600 mg q12h", note:"Daptomycin for bacteremia; linezolid for UTI/pneumonia or daptomycin failure.", sev:true },
    ],
    cover:{ empiric:"Enterococci — cephalosporins have NO activity; identify species and resistance", drop:"Cephalosporins entirely — they never cover enterococci." },
    bugs:["efaecalis","vre"],
    duration:"7–14 days for uncomplicated; longer with endocarditis or persistent bacteremia.",
    deesc:"Speciate and test ampicillin/vancomycin susceptibility early; evaluate for endocarditis if a valve or persistent.",
    pearls:[
      "E. faecalis is usually ampicillin-susceptible; E. faecium frequently is not.",
      "Only daptomycin and linezolid reliably cover VRE; daptomycin dose-creep (≥10 mg/kg) for VRE bacteremia, monitoring CK." ] },

  { id:"ie", cat:"blood", icon:"heart", name:"Infective Endocarditis",
    line:"Native vs prosthetic valve · empiric coverage bridges to organism-directed, valve-specific therapy",
    tiers:[
      { k:"Native valve, empiric (acute)", rx:"Vancomycin + ceftriaxone", note:"Covers S. aureus (incl. MRSA), streptococci, enterococci, and HACEK while cultures are pending. Narrow the moment the organism and susceptibilities return." },
      { k:"Prosthetic valve, empiric", rx:"Vancomycin + gentamicin + cefepime, plus rifampin once staphylococci confirmed on a prosthetic valve", note:"Rifampin is added only after bacteremia clears and only for prosthetic-material staphylococcal infection — never as initial monotherapy adjunct.", sev:true },
      { k:"Viridans / S. gallolyticus (PCN-S)", rx:"Penicillin G or ceftriaxone (± gentamicin for 2-week synergy in selected uncomplicated native-valve cases)", note:"Penicillin-susceptible streptococcal native-valve IE has the best prognosis of the IE organisms." },
      { k:"Enterococcal", rx:"Ampicillin + ceftriaxone (preferred), or ampicillin + gentamicin", note:"Ampicillin-ceftriaxone avoids aminoglycoside nephrotoxicity and covers high-level-gentamicin-resistant E. faecalis." },
    ],
    cover:{ empiric:"S. aureus (MSSA/MRSA), viridans and other streptococci, enterococci, HACEK; coagulase-negative staph and Cutibacterium on prosthetic valves", drop:"Empiric coverage once the blood-culture organism and susceptibilities are known — IE is a culture-driven, narrow-when-able diagnosis." },
    bugs:["mssa","mrsa","strep","efaecalis"],
    duration:"Organism- and valve-specific: penicillin-susceptible viridans native-valve 2–4 wk; staphylococcal/enterococcal native-valve 6 wk; any prosthetic-valve IE ≥6 wk. Clock starts at the first negative blood culture.",
    deesc:"Speciate and obtain MICs early; narrow to the most targeted regimen. Partial oral completion is reasonable in stable, source-controlled left-sided IE after an initial IV period (POET).",
    pearls:[
      "Obtain three sets of blood cultures from separate sites before antibiotics, and echocardiography (TEE if TTE is non-diagnostic or prosthetic valve).",
      "Early surgery is indicated for heart failure, uncontrolled infection, or large mobile vegetations with embolization — antibiotics alone do not address valve destruction.",
      "Prosthetic-valve staphylococcal IE requires the rifampin-plus-aminoglycoside combination and frequently surgery; obtain cardiac surgery and ID involvement early.",
      "S. gallolyticus (bovis) bacteremia or IE mandates colonoscopy to exclude colorectal neoplasia." ] },

  { id:"crbsi", cat:"blood", durKey:"CRBSI (catheter-related bloodstream infection)", icon:"heart", name:"Catheter-Related Bloodstream Infection (CRBSI)",
    line:"Line removal + organism-directed therapy",
    tiers:[
      { k:"Empiric", rx:"Vancomycin (cover MRSA/CoNS) ± antipseudomonal β-lactam if critically ill/neutropenic", note:"Add Gram-negative coverage by severity and risk." },
      { k:"Directed", rx:"Tailor to organism; remove the catheter for S. aureus, Pseudomonas, Candida, or persistent bacteremia", note:"Salvage with antibiotic lock only for selected long-term lines with susceptible low-virulence organisms.", sev:true },
    ],
    cover:{ empiric:"CoNS, S. aureus, Enterobacterales, Pseudomonas, Candida (antifungal guide)", drop:"Catheter salvage for S. aureus / Pseudomonas / Candida — these mandate removal." },
    bugs:["mrsa","mssa","entero","pseudo"],
    duration:"From the first negative culture: short (5–7 d) for uncomplicated CoNS after removal; 14+ d for S. aureus; longer if complicated.",
    deesc:"Remove the line for virulent organisms; de-escalate to the narrowest agent once the organism is known.",
    pearls:[
      "Differential time-to-positivity (line vs peripheral) supports the catheter as source.",
      "S. aureus CRBSI is managed as SAB — echo, clearance cultures, ID consult." ] },

  { id:"ie-native", cat:"blood", durKey:"Infective endocarditis — native, staph/enterococcus", icon:"heart", name:"Infective Endocarditis — Native Valve",
    line:"ESC 2023 / AHA · organism-directed",
    tiers:[
      { k:"MSSA", rx:"Cefazolin or nafcillin/oxacillin × 6 weeks", note:"Do NOT add gentamicin for staphylococcal native-valve endocarditis — toxicity without benefit." },
      { k:"MRSA", rx:"Vancomycin or daptomycin (high dose, 8–10 mg/kg) × 6 weeks", note:"No routine rifampin or gentamicin for native-valve staph IE." },
      { k:"Enterococcal", rx:"Ampicillin + ceftriaxone × 6 weeks", note:"Preferred synergy for E. faecalis — avoids aminoglycoside nephrotoxicity; ampicillin + gentamicin is an alternative.", sev:false },
      { k:"Viridans strep", rx:"Penicillin G or ceftriaxone × 4 weeks", note:"Gentamicin not needed when the β-lactam is fully active." },
    ],
    cover:{ empiric:"Acute, awaiting cultures: vancomycin + ceftriaxone; tailor immediately to organism", drop:"Gentamicin in staphylococcal native-valve IE — it adds renal toxicity without benefit." },
    bugs:["mssa","mrsa","efaecalis","strep"],
    duration:"6 weeks for staph/enterococcal; 4 weeks for many streptococcal cases. Clock starts at the first negative culture.",
    deesc:"Narrow to organism-specific therapy once cultures and susceptibilities return; obtain early surgical evaluation for the standard indications.",
    pearls:[
      "Surgery indications: heart failure, uncontrolled infection (abscess/fistula), and prevention of embolism (large mobile vegetation).",
      "Rifampin is reserved for prosthetic material — it has no role in native-valve disease." ] },

  { id:"ie-pve", cat:"blood", durKey:"Infective endocarditis — prosthetic valve", icon:"heart", name:"Infective Endocarditis — Prosthetic Valve",
    line:"Foreign-material IE · add rifampin",
    tiers:[
      { k:"Staphylococcal PVE", rx:"Vancomycin (or β-lactam if MSSA) + rifampin + gentamicin × ≥6 weeks", note:"Rifampin is used ONLY in the presence of prosthetic/foreign material; gentamicin for the first 2 weeks." },
      { k:"Enterococcal / streptococcal PVE", rx:"As native valve but ≥6 weeks", note:"Ampicillin + ceftriaxone for enterococcus; penicillin/ceftriaxone for strep.", sev:true },
    ],
    cover:{ empiric:"Early PVE: vancomycin + cefepime/gentamicin + rifampin (staph, GNR, including healthcare organisms)", drop:"Rifampin monotherapy or rifampin without an established backbone — always companion therapy, started after bacteremia clears." },
    bugs:["mrsa","mssa","efaecalis","strep"],
    duration:"≥6 weeks; gentamicin limited to the first 2 weeks for staphylococcal PVE.",
    deesc:"Cardiac surgery consultation early — PVE frequently requires valve replacement.",
    pearls:[
      "Add rifampin only after bloodstream bacterial burden is controlled, to limit resistance emergence.",
      "Early (<1 yr) PVE skews toward staphylococci and nosocomial GNR; late PVE resembles community native-valve disease." ] },

  { id:"cystitis", cat:"gu", durKey:"Acute uncomplicated cystitis", icon:"drop", name:"Acute Uncomplicated Cystitis",
    line:"Lower-tract infection, non-pregnant, no systemic features",
    tiers:[
      { k:"First-line", rx:"Nitrofurantoin 100 mg PO BID \u00d7 5 d, or fosfomycin 3 g PO \u00d7 1, or TMP-SMX DS BID \u00d7 3 d", note:"Fluoroquinolone-sparing agents preferred. Avoid nitrofurantoin if CrCl < 30 (inadequate urinary levels) or if early pyelonephritis is suspected. Use TMP-SMX only where local E. coli resistance is < 20%." },
      { k:"Second-line", rx:"\u03b2-lactam \u2014 cefpodoxime, cefdinir, or amoxicillin-clavulanate \u00d7 5\u20137 d", note:"Lower cure rates than first-line; reserve fluoroquinolones for when no other oral option fits.", sev:false },
    ],
    cover:{ empiric:"E. coli and other Enterobacterales; rarely Staphylococcus saprophyticus", drop:"Do not extend to Pseudomonas or ESBL coverage without a culture reason \u2014 and never treat asymptomatic bacteriuria outside pregnancy or pre-urologic procedures." },
    bugs:["entero"],
    duration:"3\u20135 days \u2014 nitrofurantoin 5 d, TMP-SMX 3 d, fosfomycin single dose.",
    deesc:"Tailor to the urine culture; most cases need no follow-up culture if symptoms resolve.",
    pearls:[
      "Asymptomatic bacteriuria is not treated except in pregnancy or before an invasive urologic procedure \u2014 a positive culture without symptoms is not cystitis.",
      "Pyuria alone does not define infection; correlate with symptoms.",
      "Recurrent cystitis warrants a different work-up, not broader antibiotics." ] },

  { id:"pyelo", cat:"gu", durKey:"Pyelonephritis / complicated UTI", icon:"drop", name:"Pyelonephritis / Complicated UTI",
    line:"Inpatient upper-tract / complicated infection",
    tiers:[
      { k:"Empiric", rx:"Ceftriaxone 1 g IV q24h", note:"Antipseudomonal β-lactam (cefepime/pip-tazo) if prior resistant GNR, recent instrumentation, or critical illness." },
      { k:"ESBL risk / directed", rx:"Carbapenem (ertapenem or meropenem)", note:"For known ESBL or high-risk; step down to oral FQ or TMP-SMX by susceptibility.", sev:false },
    ],
    cover:{ empiric:"E. coli and other Enterobacterales; Pseudomonas and ESBL by risk", drop:"Nitrofurantoin and fosfomycin — inadequate tissue/renal levels for pyelonephritis or bacteremia." },
    bugs:["entero","esbl","pseudo","efaecalis"],
    duration:"5–7 days — fluoroquinolone 5–7 d, β-lactam 7 d; bacteremic GNR UTI 7 d (BALANCE).",
    deesc:"Switch to targeted oral therapy (FQ, TMP-SMX, or β-lactam) once afebrile and absorbing.",
    pearls:[
      "Image for obstruction/abscess if no improvement by 48–72 h — an obstructed, infected system needs drainage.",
      "Avoid moxifloxacin for UTI — inadequate urinary concentrations.",
      "Switch to oral therapy guided by susceptibilities once afebrile and tolerating intake; most pyelonephritis does not require the full course intravenously." ] },

  { id:"cauti", cat:"gu", durKey:"CAUTI", icon:"drop", name:"Catheter-Associated UTI (CAUTI)",
    line:"Symptomatic, with catheter present/recent",
    tiers:[
      { k:"Empiric", rx:"Ceftriaxone, or antipseudomonal β-lactam by risk", note:"Tailor to prior urine cultures and local resistance." },
    ],
    cover:{ empiric:"Enterobacterales, Pseudomonas, enterococci; resistant GNR with prolonged catheterization", drop:"Treating asymptomatic bacteriuria/pyuria — only symptomatic CAUTI warrants therapy." },
    bugs:["entero","pseudo","esbl","efaecalis"],
    duration:"7 days with prompt response; up to 10–14 days if delayed response.",
    deesc:"Remove or exchange the catheter — source control improves cure and shortens therapy.",
    pearls:[
      "Pyuria alone does not distinguish colonization from infection in a catheterized patient.",
      "Do not culture or treat asymptomatic catheterized patients (except pre-urologic-procedure or pregnancy)." ] },

  { id:"prostatitis", cat:"gu", durKey:"Acute bacterial prostatitis", icon:"drop", name:"Acute Bacterial Prostatitis",
    line:"Febrile UTI in men with prostatic source",
    tiers:[
      { k:"Empiric", rx:"Ceftriaxone IV, then oral fluoroquinolone or TMP-SMX", note:"FQ and TMP-SMX achieve prostatic penetration for the oral phase." },
    ],
    cover:{ empiric:"Enterobacterales (E. coli predominant); consider N. gonorrhoeae/C. trachomatis if STI risk", drop:"Short UTI-length courses — prostatic infection needs prolonged, penetrating therapy." },
    bugs:["entero","esbl"],
    duration:"14–28 days, reflecting prostatic penetration and relapse risk.",
    deesc:"Transition to a penetrating oral agent guided by culture once stable.",
    pearls:[
      "Avoid vigorous prostate massage in acute prostatitis — bacteremia risk.",
      "Persistent symptoms suggest prostatic abscess — image and drain." ] },

  { id:"epididymo", cat:"gu", durKey:"Epididymo-orchitis", icon:"drop", name:"Epididymo-orchitis",
    line:"Pathogens stratify by age and sexual history",
    tiers:[
      { k:"Sexually active (<35 y or at risk)", rx:"Ceftriaxone 500 mg IM ×1 + doxycycline 100 mg PO BID ×10 d", note:"Targets N. gonorrhoeae and C. trachomatis; treat partners and test for other sexually transmitted infections." },
      { k:"Enteric organisms (older men, insertive anal intercourse, instrumentation)", rx:"Fluoroquinolone (levofloxacin 500 mg PO daily) ×10–14 d", note:"Enterobacterales predominate; align with local resistance and any urine culture.", sev:false },
    ],
    cover:{ empiric:"N. gonorrhoeae and C. trachomatis in younger or at-risk men; Enterobacterales in older men and after instrumentation", drop:"Empiric anti-pseudomonal or broad coverage absent a specific risk." },
    bugs:["entero"],
    duration:"10 days for sexually transmitted causes; 10–14 days for enteric organisms.",
    deesc:"Tailor to urine culture and nucleic-acid amplification results; image for abscess or torsion if not improving.",
    pearls:[
      "Exclude testicular torsion first in acute scrotal pain — a surgical emergency, not an antibiotic problem.",
      "A reactive hydrocele or persistent swelling that fails therapy warrants ultrasound to exclude abscess." ] },

  { id:"renalabscess", cat:"gu", durKey:"Perinephric / renal abscess", icon:"drop", name:"Perinephric / Renal Abscess",
    line:"Suppurative upper-tract infection",
    tiers:[
      { k:"Empiric", rx:"Antipseudomonal β-lactam ± vancomycin (if hematogenous S. aureus suspected)", note:"Enterobacterales for ascending; S. aureus for hematogenous seeding." },
    ],
    cover:{ empiric:"Enterobacterales (ascending); S. aureus (hematogenous); Pseudomonas by risk", drop:"Antibiotics alone for a sizeable abscess — percutaneous or surgical drainage is usually required." },
    bugs:["entero","esbl","mssa","pseudo"],
    duration:"2–3 weeks or longer, guided by drainage and imaging response.",
    deesc:"Source control via drainage; narrow per culture.",
    pearls:[
      "Hematogenous renal abscess (renal carbuncle) is classically S. aureus — cover Gram-positives.",
      "Larger abscesses (>3–5 cm) generally need drainage." ] },

  { id:"peritonitis", cat:"abd", durKey:"Complicated intra-abdominal infection (source controlled)", icon:"soup", name:"Secondary Peritonitis / Intra-abdominal Infection",
    line:"Perforation, surgical/complicated IAI · STOP-IT",
    tiers:[
      { k:"Community-acquired", rx:"Ceftriaxone + metronidazole, or piperacillin-tazobactam, or ertapenem", note:"Cover Enterobacterales + anaerobes; ertapenem if ESBL risk." },
      { k:"Healthcare-associated / severe", rx:"Piperacillin-tazobactam or meropenem ± vancomycin", note:"Broaden for Pseudomonas, resistant GNR, and enterococci; add antifungal coverage by risk (separate guide).", sev:true },
    ],
    cover:{ empiric:"Enterobacterales, anaerobes (B. fragilis); Pseudomonas/enterococci/resistant GNR in healthcare-associated", drop:"Prolonged courses after good source control — ~4 days suffices (STOP-IT)." },
    bugs:["entero","anaerobe","esbl","pseudo","efaecalis"],
    duration:"~4 days after adequate source control (STOP-IT); longer only if source not controlled.",
    deesc:"Source control is paramount; the antibiotic clock starts at drainage/surgery. Narrow per intra-operative cultures.",
    pearls:[
      "Inadequate source control — not antibiotic choice — is the usual reason for failure.",
      "Routine empiric enterococcal/antifungal coverage only in healthcare-associated, severe, or postoperative disease.",
      "Duration is ~4 days after adequate source control (STOP-IT); a longer course substitutes for source control it cannot replace." ] },

  { id:"sbp", cat:"abd", durKey:"Spontaneous bacterial peritonitis", icon:"soup", name:"Spontaneous Bacterial Peritonitis (SBP)",
    line:"Ascites, PMN ≥250/mm³",
    tiers:[
      { k:"Empiric", rx:"Ceftriaxone 1–2 g IV q24h", note:"Piperacillin-tazobactam or carbapenem for healthcare-associated/nosocomial or recent β-lactam exposure." },
      { k:"Add albumin", rx:"Albumin 1.5 g/kg day 1, 1 g/kg day 3", note:"Reduces hepatorenal syndrome and mortality — especially with creatinine >1, BUN >30, or bilirubin >4.", sev:false },
    ],
    cover:{ empiric:"Enterobacterales (E. coli, Klebsiella), streptococci; resistant GNR in nosocomial SBP", drop:"Aminoglycosides — nephrotoxicity is poorly tolerated in cirrhosis." },
    bugs:["entero","strep","esbl"],
    duration:"5–7 days.",
    deesc:"Narrow per ascitic-fluid and blood cultures; start secondary prophylaxis after recovery.",
    pearls:[
      "Diagnosis is ascitic PMN ≥250/mm³ — treat empirically before culture returns.",
      "The albumin pairing reduces renal failure and mortality and is a core part of therapy.",
      "Secondary peritonitis (multiple organisms, free air, or surgical pathology on imaging) is a different disease requiring source control — not the third-generation cephalosporin used for spontaneous bacterial peritonitis." ] },

  { id:"cholangitis", cat:"abd", durKey:"Acute cholangitis", icon:"soup", name:"Acute Cholangitis / Cholecystitis",
    line:"Biliary sepsis · Tokyo Guidelines",
    tiers:[
      { k:"Empiric", rx:"Ceftriaxone + metronidazole, or piperacillin-tazobactam", note:"Add antipseudomonal/resistant-GNR coverage for healthcare-associated or prior biliary instrumentation." },
    ],
    cover:{ empiric:"Enterobacterales, enterococci, anaerobes (esp. with biliary-enteric anastomosis)", drop:"Medical therapy without drainage in obstructive cholangitis — ERCP/decompression is decisive." },
    bugs:["entero","anaerobe","efaecalis","esbl","pseudo"],
    duration:"~4–7 days after biliary drainage achieves source control.",
    deesc:"Biliary drainage (ERCP) is the source control; antibiotic clock starts there. Narrow per bile/blood cultures.",
    pearls:[
      "Charcot triad / Reynolds pentad signals the need for urgent decompression.",
      "Cover enterococci and anaerobes when a biliary-enteric anastomosis or stent is present." ] },

  { id:"diverticulitis", cat:"abd", durKey:"Acute diverticulitis (uncomplicated)", icon:"soup", name:"Complicated Diverticulitis",
    line:"Abscess, perforation, or systemic toxicity",
    tiers:[
      { k:"Inpatient/complicated", rx:"Ceftriaxone + metronidazole, or piperacillin-tazobactam, or ertapenem", note:"Cover Enterobacterales + anaerobes; broaden for healthcare-associated disease." },
    ],
    cover:{ empiric:"Enterobacterales, anaerobes (B. fragilis)", drop:"Antibiotics for uncomplicated diverticulitis are increasingly omitted in selected outpatients — but complicated/inpatient disease is treated." },
    bugs:["entero","anaerobe","esbl"],
    duration:"~4 days after source control for complicated disease; abscess >3–4 cm needs drainage.",
    deesc:"Percutaneous drainage of larger abscesses; narrow per response and cultures.",
    pearls:[
      "Uncomplicated diverticulitis may be managed without antibiotics in selected immunocompetent outpatients (AGA).",
      "Complicated disease (abscess, perforation, obstruction) is the inpatient, antibiotic-treated phenotype." ] },

  { id:"pancreatic", cat:"abd", durKey:"Infected pancreatic necrosis", icon:"soup", name:"Infected Pancreatic Necrosis",
    line:"Late infection of necrotizing pancreatitis",
    tiers:[
      { k:"Documented infection", rx:"Carbapenem (meropenem/imipenem), or metronidazole + a penetrating fluoroquinolone", note:"Reserve for proven/strongly suspected infected necrosis — agents with pancreatic penetration." },
    ],
    cover:{ empiric:"Enterobacterales, anaerobes, enterococci; gut-derived flora", drop:"Prophylactic antibiotics in sterile necrosis — not indicated and select for resistance/fungi." },
    bugs:["entero","anaerobe","efaecalis","esbl"],
    duration:"Guided by source control (step-up drainage/necrosectomy) and response.",
    deesc:"The step-up approach (drainage before necrosectomy) drives outcomes; narrow per cultures.",
    pearls:[
      "Suspect infected necrosis with clinical deterioration at 1–2 weeks or gas in the collection.",
      "Carbapenems and fluoroquinolones penetrate pancreatic necrosis better than many alternatives." ] },

  { id:"cellulitis", cat:"ssti", durKey:"Cellulitis (uncomplicated)", icon:"slice", name:"Cellulitis (non-purulent)",
    line:"Diffuse, non-purulent · β-hemolytic strep + MSSA",
    tiers:[
      { k:"Standard", rx:"Cefazolin 2 g IV q8h (or oral cephalexin on step-down)", note:"Non-purulent cellulitis is predominantly streptococcal; routine MRSA coverage is unnecessary." },
      { k:"Add MRSA", rx:"Add vancomycin / TMP-SMX / doxycycline", note:"Penetrating trauma, prior MRSA, IVDU, or systemic toxicity.", sev:false },
    ],
    cover:{ empiric:"β-hemolytic streptococci, MSSA", drop:"Routine MRSA coverage for simple non-purulent cellulitis — reserve for specific risks." },
    bugs:["strep","mssa","mrsa"],
    duration:"5 days; extend to ~10 only if not improving.",
    deesc:"Elevate the limb, mark the border, and treat predisposing edema/tinea; switch to oral once improving.",
    pearls:[
      "Bilateral lower-extremity 'cellulitis' is usually stasis dermatitis — reconsider the diagnosis.",
      "Early apparent worsening (24–48 h) often reflects normal inflammatory progression, not treatment failure.",
      "Non-purulent cellulitis is predominantly streptococcal — empiric MRSA coverage is not required without purulence, penetrating trauma, or specific risk factors." ] },

  { id:"purulent", cat:"ssti", durKey:"Cutaneous abscess", icon:"slice", name:"Purulent SSTI / Cutaneous Abscess",
    line:"Abscess, furuncle, carbuncle · I&D first",
    tiers:[
      { k:"Drainage", rx:"Incision & drainage — the definitive treatment", note:"Many small drained abscesses need no antibiotics in immunocompetent hosts." },
      { k:"Add MRSA coverage", rx:"TMP-SMX or doxycycline (PO); vancomycin if inpatient/severe", note:"For surrounding cellulitis, systemic signs, immunocompromise, or failed I&D.", sev:false },
    ],
    cover:{ empiric:"S. aureus including CA-MRSA", drop:"Reflexive antibiotics after I&D of a small, uncomplicated abscess in a well host." },
    bugs:["mrsa","mssa"],
    duration:"5–7 days when antibiotics are indicated.",
    deesc:"Culture purulent material to guide therapy; oral agents suffice for most.",
    pearls:[
      "I&D is the intervention; antibiotics are adjunctive and add benefit mainly with cellulitis or systemic signs.",
      "CA-MRSA is the dominant pathogen of purulent SSTI in much of the US." ] },

  { id:"necfasc", cat:"ssti", durKey:"Necrotizing soft-tissue infection", icon:"slice", name:"Necrotizing Soft-Tissue Infection",
    line:"Surgical emergency · do not wait for imaging",
    tiers:[
      { k:"Immediate", rx:"SURGICAL debridement NOW + vancomycin + piperacillin-tazobactam + clindamycin", note:"Broad coverage plus clindamycin for toxin suppression; surgery is the definitive therapy.", sev:true },
      { k:"Group A strep / Clostridium confirmed", rx:"Penicillin + clindamycin", note:"Narrow once monomicrobial streptococcal/clostridial disease is confirmed; continue clindamycin for toxin.", sev:false },
    ],
    cover:{ empiric:"Polymicrobial (Enterobacterales, anaerobes, streptococci) or group A strep / Clostridium; MRSA empirically", drop:"Any delay to the operating room — mortality rises hourly; imaging must not postpone debridement." },
    bugs:["strep","anaerobe","entero","mrsa"],
    duration:"Continue until no further debridement is required and the patient is clinically stable.",
    deesc:"Repeat exploration until viable margins; narrow antibiotics per operative cultures. Clindamycin suppresses exotoxin (Eagle effect).",
    pearls:[
      "Pain out of proportion, rapid spread, bullae, crepitus, and systemic toxicity are the red flags.",
      "IVIG is sometimes used in streptococcal toxic-shock-associated necrotizing infection — adjunctive and debated." ] },

  { id:"dfi", cat:"ssti", durKey:"Diabetic foot (soft tissue, mod/severe)", icon:"slice", name:"Diabetic Foot Infection",
    line:"Severity-staged · IWGDF/IDSA 2023",
    tiers:[
      { k:"Mild", rx:"Cover MSSA + streptococci (e.g., cephalexin/cefazolin; add MRSA agent by risk)", note:"Often oral; 1–2 weeks." },
      { k:"Moderate–severe", rx:"Piperacillin-tazobactam, or ceftriaxone + metronidazole; add vancomycin for MRSA risk", note:"Broaden for Pseudomonas only with risk (maceration, warm climate, prior isolation).", sev:true },
    ],
    cover:{ empiric:"S. aureus (always) + streptococci; Enterobacterales/anaerobes in chronic/severe; Pseudomonas by risk", drop:"Routine Pseudomonas coverage — add only with specific risk factors." },
    bugs:["mssa","mrsa","strep","entero","anaerobe","pseudo"],
    duration:"Mild soft-tissue 1–2 wk; moderate/severe ~10 d after debridement; osteomyelitis 3 wk after minor amputation with positive margin, 6 wk without resection.",
    deesc:"Debride and obtain deep/bone cultures (not swabs); many cases finish on oral therapy. Assess perfusion (PAD).",
    pearls:[
      "Empiric therapy must always cover MSSA; bone biopsy is the gold standard for osteomyelitis.",
      "2023 durations are markedly shorter than legacy courses — do not over-treat soft-tissue infection.",
      "Probe-to-bone positivity or an exposed bone, combined with elevated inflammatory markers, raises the probability of osteomyelitis and changes both duration and the need for surgical sampling." ] },

  { id:"ssi", cat:"ssti", icon:"slice", name:"Surgical Site Infection",
    line:"Incisional vs organ-space · source by operative site",
    tiers:[
      { k:"Superficial / clean", rx:"Open the incision ± cefazolin or anti-MRSA agent", note:"Many superficial SSIs need drainage ± short antibiotics keyed to skin flora." },
      { k:"GI/GU/biliary surgery", rx:"Cover Gram-negatives + anaerobes (e.g., ceftriaxone + metronidazole or pip-tazo)", note:"Flora reflect the operative field; add MRSA coverage by risk.", sev:false },
    ],
    cover:{ empiric:"Staphylococci/streptococci (clean cases); add enteric GNR + anaerobes for GI/GU/biliary procedures", drop:"Treating without opening/draining the wound — source control comes first." },
    bugs:["mssa","mrsa","strep","entero","anaerobe"],
    duration:"Short, source-control-driven; often days once drained.",
    deesc:"Open and drain; culture; narrow per result and operative site.",
    pearls:[
      "Early fulminant SSI (<48 h) suggests group A strep or Clostridium — explore urgently.",
      "Match empiric flora to the operative site, not a generic skin regimen." ] },

  { id:"osteo", cat:"ssti", durKey:"Osteomyelitis (native)", icon:"bone", name:"Osteomyelitis (native)",
    line:"Hematogenous or contiguous · OVIVA",
    tiers:[
      { k:"Empiric (await bone culture)", rx:"Vancomycin + an antipseudomonal/GNR β-lactam (cefepime or ceftriaxone by risk)", note:"Hold antibiotics for bone biopsy when feasible and the patient is stable." },
      { k:"Directed", rx:"Organism-specific (e.g., cefazolin/nafcillin for MSSA)", note:"Tailor to bone culture; oral step-down once controlled.", sev:false },
    ],
    cover:{ empiric:"S. aureus (most common); GNR/Pseudomonas in contiguous/vascular disease", drop:"Empiric breadth once a bone-culture organism is known — narrow aggressively." },
    bugs:["mssa","mrsa","entero","pseudo"],
    duration:"≥6 weeks; OVIVA showed oral non-inferior to IV after initial control.",
    deesc:"Bone culture guides therapy; high-bioavailability oral agents can complete the course (OVIVA). Surgical debridement for sequestra/hardware.",
    pearls:[
      "Whenever stable, obtain a bone biopsy before antibiotics — surface/swab cultures mislead.",
      "OVIVA reframed bone/joint infection: appropriate oral therapy equals IV for the bulk of the course." ] },

  { id:"septic-arthritis", cat:"ssti", durKey:"Septic arthritis (native)", icon:"bone", name:"Septic Arthritis (native joint)",
    line:"Drain + organism-directed therapy",
    tiers:[
      { k:"Empiric", rx:"Vancomycin + ceftriaxone (or antipseudomonal β-lactam by risk)", note:"Cover S. aureus + streptococci; ceftriaxone also covers gonococcus in young, sexually active adults." },
      { k:"Gonococcal", rx:"Ceftriaxone", note:"Disseminated gonococcal arthritis responds rapidly; tailor accordingly.", sev:false },
    ],
    cover:{ empiric:"S. aureus, streptococci; N. gonorrhoeae in young adults; GNR by host", drop:"Antibiotics without joint drainage — repeated aspiration or arthroscopic washout is essential." },
    bugs:["mssa","mrsa","strep","entero"],
    duration:"3–4 weeks (longer for prosthetic joints), with adequate drainage.",
    deesc:"Serial drainage drives outcome; narrow per synovial-fluid and blood cultures.",
    pearls:[
      "Send synovial fluid for cell count, Gram stain, culture, and crystals — gout/pseudogout mimics.",
      "A prosthetic joint changes the entire approach — see prosthetic joint infection." ] },

  { id:"pji", cat:"ssti", durKey:"Prosthetic joint infection", icon:"bone", name:"Prosthetic Joint Infection (PJI)",
    line:"Biofilm disease · surgery + rifampin (staph)",
    tiers:[
      { k:"Empiric (post-sampling)", rx:"Vancomycin + an antipseudomonal β-lactam", note:"Hold antibiotics until intra-operative cultures when feasible." },
      { k:"Staphylococcal + retained hardware", rx:"β-lactam or vancomycin + RIFAMPIN, then rifampin-based oral combination", note:"Rifampin penetrates biofilm but only as companion therapy with debridement (DAIR) or implant retention.", sev:true },
    ],
    cover:{ empiric:"Staphylococci (incl. CoNS), streptococci; GNR by host and surgical history", drop:"Rifampin monotherapy — resistance emerges rapidly; always combine." },
    bugs:["mrsa","mssa","strep","entero"],
    duration:"≥6 weeks IV/oral backbone; staph with retained hardware often 3 months total (rifampin combination).",
    deesc:"Surgical strategy (DAIR vs one-/two-stage exchange) defines the regimen and duration; coordinate with orthopedics + ID.",
    pearls:[
      "Add rifampin only after the wound is closed/controlled and bacteremia cleared, to protect against resistance.",
      "Sonication of explanted hardware improves microbiologic yield." ] },

  { id:"pyomyositis", cat:"ssti", icon:"slice", name:"Pyomyositis",
    line:"Purulent skeletal-muscle infection",
    tiers:[
      { k:"Empiric", rx:"Vancomycin (cover MRSA)", note:"Add Gram-negative coverage in immunocompromised or if GNR suspected." },
      { k:"Directed (MSSA)", rx:"Cefazolin or nafcillin", note:"Narrow once S. aureus susceptibility is known.", sev:false },
    ],
    cover:{ empiric:"S. aureus (incl. MRSA) predominates; GNR in immunocompromised hosts", drop:"Empiric breadth once S. aureus is confirmed — most cases are monomicrobial staph." },
    bugs:["mssa","mrsa","strep"],
    duration:"2–3 weeks with drainage; longer if extensive or bacteremic.",
    deesc:"Drain abscesses (image-guided/surgical); narrow per culture.",
    pearls:[
      "Tropical pyomyositis classically affects large muscle groups (thigh, gluteal) in healthy hosts.",
      "MRI defines extent and identifies drainable collections." ] },

  { id:"bursitis", cat:"ssti", durKey:"Septic bursitis", icon:"slice", name:"Septic Bursitis",
    line:"Olecranon / prepatellar · usually S. aureus",
    tiers:[
      { k:"Empiric", rx:"Cover S. aureus — anti-staph β-lactam; add MRSA agent by risk", note:"Aspirate the bursa for diagnosis and decompression." },
    ],
    cover:{ empiric:"S. aureus (most), β-hemolytic streptococci", drop:"Joint-level intensity — superficial bursitis is distinct from septic arthritis and is often managed orally." },
    bugs:["mssa","mrsa","strep"],
    duration:"1–3 weeks depending on response and aspiration findings.",
    deesc:"Serial aspiration; oral step-down for the typical immunocompetent patient.",
    pearls:[
      "Distinguish from septic arthritis — bursitis spares deep joint motion and is more superficial.",
      "Often follows local trauma or kneeling/leaning occupations." ] },

  { id:"pressure", cat:"ssti", icon:"slice", name:"Infected Pressure Injury",
    line:"Stage III–IV ulcer with invasive infection",
    tiers:[
      { k:"Empiric (systemic infection)", rx:"Broad coverage: piperacillin-tazobactam ± vancomycin", note:"Polymicrobial — staphylococci, streptococci, Enterobacterales, anaerobes." },
    ],
    cover:{ empiric:"Polymicrobial: S. aureus, streptococci, Enterobacterales, anaerobes", drop:"Treating colonization — all chronic wounds grow organisms; treat only invasive infection or systemic signs." },
    bugs:["mssa","mrsa","strep","entero","anaerobe"],
    duration:"Driven by debridement and whether underlying osteomyelitis is present.",
    deesc:"Debridement, pressure offloading, and wound care are central; antibiotics treat invasive infection, not the wound surface.",
    pearls:[
      "Probe-to-bone and imaging assess for underlying osteomyelitis, which lengthens therapy.",
      "Surface-swab cultures reflect colonizers — obtain deep tissue at debridement." ] },

  { id:"fournier", cat:"ssti", icon:"slice", name:"Fournier Gangrene",
    line:"Necrotizing infection of the perineum — surgical emergency",
    tiers:[
      { k:"Immediate", rx:"SURGICAL debridement NOW + piperacillin-tazobactam (or carbapenem) + vancomycin + clindamycin", note:"Broad polymicrobial coverage + MRSA + clindamycin for toxin; emergent wide debridement.", sev:true },
    ],
    cover:{ empiric:"Polymicrobial — Enterobacterales, anaerobes, streptococci, staphylococci", drop:"Delay to the operating room — a perineal necrotizing infection behaves like necrotizing fasciitis elsewhere." },
    bugs:["entero","anaerobe","strep","mrsa"],
    duration:"Until debridement is complete and the patient is stable.",
    deesc:"Repeated debridement; narrow per operative cultures. Identify diabetes/immunosuppression and source (anorectal, urogenital).",
    pearls:[
      "A perineal variant of necrotizing soft-tissue infection — same urgency, same toxin-suppression rationale (clindamycin).",
      "Often arises from an anorectal or urogenital source requiring its own control." ] },

  { id:"bites", cat:"ssti", durKey:"Animal / human bite", icon:"slice", name:"Animal & Human Bite Wounds",
    line:"Pasteurella · Eikenella · Capnocytophaga",
    tiers:[
      { k:"Standard", rx:"Amoxicillin-clavulanate (PO) or ampicillin-sulbactam (IV)", note:"Covers Pasteurella (cats/dogs), Eikenella (human), oral anaerobes, and skin flora in one agent." },
      { k:"Penicillin allergy", rx:"A fluoroquinolone or TMP-SMX/doxycycline PLUS metronidazole or clindamycin", note:"Must retain Pasteurella/Eikenella plus anaerobic coverage — cephalexin or clindamycin alone is inadequate.", sev:false },
    ],
    cover:{ empiric:"Pasteurella multocida (cat/dog), Eikenella corrodens (human), streptococci, staphylococci, oral anaerobes; Capnocytophaga in asplenia", drop:"First-generation cephalosporins or clindamycin alone — they miss Pasteurella and Eikenella respectively." },
    bugs:["strep","mssa","anaerobe"],
    duration:"Prophylaxis 3–5 days; established infection 5–14 days; longer if joint/bone involved.",
    deesc:"Irrigate and debride; do not primarily close most bite wounds (except selected facial). Update tetanus; assess rabies for animal bites.",
    pearls:[
      "Cat bites are deep puncture wounds with high Pasteurella infection rates — treat/prophylax readily.",
      "Capnocytophaga canimorsus causes fulminant sepsis in asplenic/cirrhotic patients after dog bites — β-lactam/β-lactamase-inhibitor covers it.",
      "Clenched-fist 'fight bite' injuries seed the MCP joint with Eikenella — image and explore." ] },

  { id:"mastitis", cat:"ssti", icon:"slice", name:"Mastitis & Breast Abscess",
    line:"Lactational and non-lactational",
    tiers:[
      { k:"Lactational mastitis", rx:"Dicloxacillin or cephalexin (PO); cover MRSA (TMP-SMX/clindamycin) by risk", note:"Continue breastfeeding/milk removal — effective drainage is therapeutic." },
      { k:"Breast abscess", rx:"Drainage (needle/surgical) + anti-staph therapy incl. MRSA coverage", note:"Non-lactational/subareolar abscess is often mixed with anaerobes — add anaerobic coverage.", sev:false },
    ],
    cover:{ empiric:"S. aureus (incl. MRSA) predominates; non-lactational adds anaerobes/mixed flora", drop:"Stopping milk removal — continued drainage is part of the treatment, not a contraindication." },
    bugs:["mssa","mrsa","strep","anaerobe"],
    duration:"10–14 days; abscess duration tied to drainage adequacy.",
    deesc:"Ultrasound to identify a drainable abscess; culture purulence to direct MRSA therapy.",
    pearls:[
      "Inflammatory breast carcinoma can masquerade as non-resolving mastitis — biopsy if it fails to clear.",
      "Recurrent subareolar abscess (Zuska disease) is associated with smoking and tends to be polymicrobial." ] },

  { id:"meningitis", cat:"cns", icon:"brain", name:"Bacterial Meningitis",
    line:"Empiric by age/host · do not delay therapy or steroids",
    tiers:[
      { k:"18–50, immunocompetent", rx:"Ceftriaxone 2 g IV q12h + vancomycin + dexamethasone", note:"Dexamethasone 0.15 mg/kg q6h with/just before the first dose; continue only if pneumococcal." },
      { k:">50 or impaired immunity", rx:"Add ampicillin 2 g IV q4h for Listeria", note:"Cephalosporins miss Listeria — essential at age extremes and with impaired cell-mediated immunity.", sev:true },
      { k:"Post-neurosurgical / penetrating", rx:"Vancomycin + cefepime or meropenem", note:"Cover Pseudomonas, nosocomial GNR, and hardware staphylococci.", sev:false },
    ],
    cover:{ empiric:"S. pneumoniae, N. meningitidis; Listeria (age/host); nosocomial GNR + staph (post-surgical)", drop:"Any delay for imaging/LP — give antibiotics + dexamethasone first, draw cultures, then image if indicated." },
    bugs:["strep","entero","pseudo"],
    duration:"Pneumococcus 10–14 d; meningococcus 7 d; Listeria ≥21 d; H. influenzae 7 d.",
    deesc:"Stop vancomycin if not penicillin/cephalosporin-resistant pneumococcus; stop dexamethasone if not pneumococcal. Use CNS dosing throughout.",
    pearls:[
      "Dexamethasone improves outcomes in pneumococcal meningitis — give with or before the first antibiotic dose.",
      "CNS dosing is non-negotiable: ceftriaxone 2 g q12h, meropenem 2 g q8h.",
      "Add ampicillin for Listeria when age >50 or cell-mediated immunity is impaired; do not delay therapy or dexamethasone for imaging or lumbar puncture." ] },

  { id:"ventriculitis", cat:"cns", icon:"brain", name:"Healthcare-Associated Ventriculitis",
    line:"Shunt/drain or post-neurosurgical infection",
    tiers:[
      { k:"Empiric", rx:"Vancomycin + cefepime or meropenem", note:"Cover staphylococci (incl. CoNS), Cutibacterium, and nosocomial GNR/Pseudomonas." },
      { k:"Refractory", rx:"Add intraventricular vancomycin or an aminoglycoside", note:"For inadequate CSF response despite systemic therapy and device management.", sev:true },
    ],
    cover:{ empiric:"CoNS, S. aureus, Cutibacterium acnes, nosocomial GNR/Pseudomonas", drop:"Retaining the infected device — hardware removal/externalization is usually required for cure." },
    bugs:["mrsa","mssa","pseudo","entero"],
    duration:"Guided by CSF clearance and device management; typically 10–14+ days after cultures clear.",
    deesc:"Remove or externalize the shunt/drain; narrow per CSF culture and serial CSF parameters.",
    pearls:[
      "Cutibacterium acnes is an indolent shunt pathogen — hold cultures long enough to recover it.",
      "Intraventricular therapy is reserved for refractory cases and is unlicensed/expert-guided." ] },

  { id:"brainabscess", cat:"cns", durKey:"Brain abscess", icon:"brain", name:"Brain Abscess",
    line:"Empiric by source · drainage + prolonged therapy",
    tiers:[
      { k:"Empiric", rx:"Ceftriaxone (or cefepime) + metronidazole ± vancomycin", note:"Metronidazole for anaerobes; vancomycin if S. aureus/post-procedural; cefepime/meropenem if Pseudomonas risk." },
      { k:"Listeria / Nocardia risk", rx:"Add ampicillin (Listeria) or high-dose TMP-SMX (Nocardia)", note:"In immunocompromised hosts, broaden to these organisms.", sev:false },
    ],
    cover:{ empiric:"Streptococci (incl. S. anginosus), anaerobes, Enterobacterales; S. aureus (post-procedural); Nocardia/Listeria (immunocompromised)", drop:"Medical therapy alone for a sizeable abscess — aspiration/excision provides diagnosis and source control." },
    bugs:["strep","anaerobe","entero","mssa"],
    duration:"6–8 weeks (often IV then oral), guided by serial imaging.",
    deesc:"Neurosurgical aspiration both diagnoses and decompresses; narrow per culture. Steroids only for significant mass effect.",
    pearls:[
      "Identify the source (contiguous sinus/otogenic, hematogenous, post-surgical) — it predicts the flora.",
      "S. anginosus group streptococci are notorious abscess formers." ] },

  { id:"epidural", cat:"cns", durKey:"Spinal epidural abscess", icon:"brain", name:"Spinal Epidural Abscess",
    line:"Neurosurgical emergency · S. aureus predominates",
    tiers:[
      { k:"Empiric", rx:"Vancomycin + an antipseudomonal/GNR β-lactam (cefepime or ceftriaxone by risk)", note:"Cover MRSA + Gram-negatives; obtain cultures (blood + operative) before/at decompression where feasible." },
    ],
    cover:{ empiric:"S. aureus (incl. MRSA) predominant; streptococci; GNR by host (IVDU, instrumentation)", drop:"Watchful waiting with a neurologic deficit — emergent decompression preserves function." },
    bugs:["mrsa","mssa","strep","entero","pseudo"],
    duration:"≥6 weeks (often longer with vertebral osteomyelitis).",
    deesc:"Surgical decompression for deficit or instability; narrow per culture. MRI the entire spine — skip lesions occur.",
    pearls:[
      "Classic triad (fever, back pain, neurologic deficit) is present in a minority — maintain suspicion.",
      "Frequently coexists with vertebral osteomyelitis/discitis, extending duration." ] },

  { id:"subdural-empyema", cat:"cns", icon:"brain", name:"Subdural Empyema",
    line:"Suppuration in the subdural space — a neurosurgical emergency",
    tiers:[
      { k:"Empiric", rx:"Vancomycin + ceftriaxone (or cefepime) + metronidazole", note:"Cover streptococci (incl. anginosus group), staphylococci, and anaerobes from a sinus/otogenic source; urgent neurosurgical drainage." },
    ],
    cover:{ empiric:"Streptococcus anginosus group, staphylococci, anaerobes, and aerobic Gram-negatives from a contiguous sinus or ear source", drop:"Medical management alone — surgical evacuation is the definitive therapy." },
    bugs:["strep","mssa","mrsa","anaerobe"],
    duration:"3–6 weeks after drainage, guided by serial imaging.",
    deesc:"Identify and treat the contiguous source (sinusitis, otitis, mastoiditis); anticonvulsant prophylaxis is common.",
    pearls:[
      "Rapid neurologic deterioration distinguishes subdural empyema from a simple abscess — emergent drainage cannot wait.",
      "Most cases are complications of sinusitis or otitis — image and treat the primary source." ] },

  { id:"post-nsx-meningitis", cat:"cns", icon:"brain", name:"Healthcare-Associated / Post-Neurosurgical Meningitis",
    line:"After neurosurgery, head trauma, or device placement — different flora from community meningitis",
    tiers:[
      { k:"Empiric", rx:"Vancomycin + cefepime or meropenem (CNS dosing)", note:"Cover staphylococci (incl. MRSA), Cutibacterium, and resistant Gram-negatives including Pseudomonas; ceftazidime if meropenem not used." },
    ],
    cover:{ empiric:"Staphylococci, Cutibacterium acnes, Enterobacterales, and Pseudomonas reflecting nosocomial flora", drop:"The community-meningitis regimen — post-neurosurgical flora is staphylococcal and resistant-GNR predominant." },
    bugs:["mssa","mrsa","pseudo","entero"],
    duration:"10–14 days from the first sterile CSF; hardware removal frequently required.",
    deesc:"Remove or externalize infected hardware; CSF cultures and cell-count trends guide therapy.",
    pearls:[
      "Post-neurosurgical meningitis is staphylococcal and Gram-negative — empiric vancomycin plus an antipseudomonal agent, not ceftriaxone alone.",
      "Cure usually requires removing the infected device; antibiotics rarely sterilize retained hardware." ] },

  { id:"cavernous-thromb", cat:"cns", icon:"brain", name:"Septic Cavernous Sinus Thrombosis",
    line:"Septic thrombosis from a facial, sinus, or dental source",
    tiers:[
      { k:"Empiric", rx:"Vancomycin + ceftriaxone + metronidazole (CNS dosing)", note:"S. aureus predominates; cover streptococci and anaerobes from the contiguous source. Anticoagulation is considered case-by-case." },
    ],
    cover:{ empiric:"S. aureus (incl. MRSA), streptococci, anaerobes from a facial/sinus/dental focus", drop:"Narrow coverage before the source and organism are known — S. aureus is the leading cause." },
    bugs:["mssa","mrsa","strep","anaerobe"],
    duration:"3–4 weeks; longer with complications.",
    deesc:"Treat the primary source (sinusitis, facial infection); anticoagulation is individualized and controversial.",
    pearls:[
      "Cranial-nerve palsies (III, IV, V1–2, VI) with proptosis and a facial/sinus source point to cavernous sinus thrombosis.",
      "Never squeeze facial furuncles in the danger triangle — a classic source of this complication." ] },

  { id:"shunt-infection", cat:"cns", icon:"brain", name:"CSF Shunt / Drain Infection",
    line:"Infected ventriculoperitoneal shunt or external ventricular drain",
    tiers:[
      { k:"Empiric", rx:"Vancomycin + cefepime or meropenem; consider intraventricular vancomycin/aminoglycoside per neurosurgery", note:"Coagulase-negative staph and S. aureus predominate. Cure requires hardware removal and externalization." },
    ],
    cover:{ empiric:"Coagulase-negative staphylococci, S. aureus, Cutibacterium, and Gram-negatives", drop:"Antibiotics with the hardware retained — shunt removal/externalization is standard of care." },
    bugs:["mssa","mrsa","entero","pseudo"],
    duration:"Typically 10–14 days after CSF sterilization, then reimplantation; varies by organism.",
    deesc:"Serial CSF sampling from the externalized drain guides therapy and timing of reimplantation.",
    pearls:[
      "Shunt infection usually requires removing the hardware, treating, and then placing a new shunt — antibiotics alone rarely cure.",
      "Cutibacterium acnes is a slow-growing, easily dismissed shunt pathogen — hold cultures long enough to recover it." ] },

  { id:"neuro-lyme-syphilis", cat:"cns", icon:"brain", name:"Neuroborreliosis / Neurosyphilis",
    line:"Spirochetal CNS infection — exposure and serology driven",
    tiers:[
      { k:"Neuroborreliosis (Lyme)", rx:"Ceftriaxone 2 g IV q24h (or oral doxycycline in selected cases)", note:"For meningitis, cranial neuritis, or radiculopathy in the right epidemiologic setting." },
      { k:"Neurosyphilis", rx:"Aqueous penicillin G 18–24 million units/day IV ×10–14 d", note:"Confirmed by CSF analysis with reactive serology; desensitize penicillin-allergic patients rather than substitute.", sev:false },
    ],
    cover:{ empiric:"Borrelia burgdorferi or Treponema pallidum, established by serology and CSF findings", drop:"Empiric broad antibacterial therapy — these are diagnosis-then-treat spirochetal infections." },
    bugs:["atypical"],
    duration:"10–14 days (IV ceftriaxone or penicillin) for both, by indication.",
    deesc:"Diagnosis precedes therapy here; confirm with serology and CSF before committing to a prolonged spirochetal regimen.",
    pearls:[
      "Penicillin is the only proven therapy for neurosyphilis — penicillin-allergic patients should be desensitized, not given an alternative.",
      "Lyme radiculopathy (Bannwarth syndrome) and a lymphocytic CSF pleocytosis in an endemic exposure point to neuroborreliosis." ] },

  { id:"tss", cat:"tox", durKey:"Streptococcal toxic shock / GAS", icon:"flame", name:"Toxic Shock Syndrome",
    line:"Staphylococcal or streptococcal · toxin-driven",
    tiers:[
      { k:"Empiric", rx:"Vancomycin + clindamycin ± a β-lactam (e.g., piperacillin-tazobactam)", note:"Clindamycin suppresses toxin synthesis; β-lactam provides bactericidal coverage. Add IVIG in severe streptococcal TSS.", sev:true },
      { k:"Directed (GAS)", rx:"Penicillin + clindamycin", note:"Narrow once group A strep confirmed; continue clindamycin for toxin suppression.", sev:false },
    ],
    cover:{ empiric:"S. aureus or group A Streptococcus (toxin-mediated)", drop:"A β-lactam alone — it does not halt toxin production; clindamycin is the key adjunct." },
    bugs:["mrsa","mssa","strep"],
    duration:"Typically 10–14 days; driven by source control.",
    deesc:"Find and control the source (remove tampon/packing, debride, drain). Clindamycin (Eagle effect) blunts exotoxin even at high bacterial loads.",
    pearls:[
      "IVIG is a reasonable adjunct in severe streptococcal TSS and necrotizing infection (debated, observational).",
      "The clindamycin rationale is toxin suppression — retain it even after narrowing the β-lactam." ] },

  { id:"cdiff", cat:"tox", durKey:"C. difficile infection (initial)", icon:"flame", name:"Clostridioides difficile Infection",
    line:"IDSA/SHEA 2021 · fidaxomicin first-line",
    tiers:[
      { k:"Initial episode", rx:"Fidaxomicin 200 mg PO BID × 10 d (preferred); oral vancomycin 125 mg QID × 10 d (acceptable)", note:"Fidaxomicin lowers recurrence; metronidazole only for mild disease if neither is available." },
      { k:"Fulminant", rx:"Oral/NG vancomycin 500 mg QID + IV metronidazole 500 mg q8h (± rectal vancomycin if ileus)", note:"Surgical consultation for toxic megacolon / perforation.", sev:true },
      { k:"Recurrence", rx:"Fidaxomicin (standard or extended-pulsed), or tapered/pulsed vancomycin; consider bezlotoxumab / FMT", note:"Bezlotoxumab reduces recurrence in high-risk patients.", sev:false },
    ],
    cover:{ empiric:"C. difficile toxin-mediated colitis", drop:"Metronidazole as routine first-line — demoted to a fallback for mild disease only." },
    bugs:["anaerobe"],
    duration:"10 days for initial; tapered/pulsed regimens longer for recurrence.",
    deesc:"Stop the inciting antibiotic where possible; avoid anti-motility agents in severe disease. Isolate (contact precautions, soap-and-water hand hygiene).",
    pearls:[
      "Fidaxomicin's advantage is durability (lower recurrence), not initial cure rate.",
      "Do not test or treat asymptomatic carriers or formed stool — a positive PCR without diarrhea is colonization.",
      "Stop the inciting antibiotic whenever possible, avoid antimotility agents in acute disease, and assess for fulminant colitis (ileus, megacolon, shock) requiring combination therapy and surgical consultation." ] },

  { id:"gas-gangrene", cat:"tox", icon:"flame", name:"Clostridial Myonecrosis (Gas Gangrene)",
    line:"Fulminant Clostridium perfringens muscle necrosis — surgical emergency",
    tiers:[
      { k:"Empiric", rx:"Penicillin G + clindamycin, plus broad coverage (piperacillin-tazobactam or carbapenem) until mixed infection excluded", note:"Clindamycin suppresses toxin production; emergent, aggressive surgical debridement is the decisive intervention." },
    ],
    cover:{ empiric:"Clostridium perfringens and other clostridia; mixed flora until excluded", drop:"Any delay to the operating room — antibiotics are adjunctive to debridement." },
    bugs:["anaerobe","strep"],
    duration:"Until repeated debridement achieves clean margins and the patient stabilizes; typically ≥10–14 days.",
    deesc:"Surgery drives survival; hyperbaric oxygen is adjunctive where available and does not delay debridement.",
    pearls:[
      "Crepitus, exquisite pain, and a rapidly spreading bronze/dusky skin change with systemic toxicity signal clostridial myonecrosis — operate immediately.",
      "Penicillin plus clindamycin pairs killing with toxin suppression; the β-lactam does the killing." ] },

  { id:"tetanus", cat:"tox", icon:"flame", name:"Tetanus",
    line:"Clostridium tetani toxin-mediated disease — antibiotics are adjunctive",
    tiers:[
      { k:"Antimicrobial (adjunct)", rx:"Metronidazole 500 mg IV q8h", note:"The mainstays are wound debridement, human tetanus immune globulin, toxin neutralization, and supportive care (spasm and autonomic control). Antibiotics are secondary." },
    ],
    cover:{ empiric:"Clostridium tetani at the wound — but disease is toxin-mediated, not invasive", drop:"Reliance on antibiotics to treat the syndrome — immunoglobulin, wound care, and supportive ICU management are primary." },
    bugs:["anaerobe"],
    duration:"Metronidazole 7–10 days; the clinical course is governed by toxin clearance and supportive care.",
    deesc:"Debride the wound, give immune globulin, and provide active immunization (disease does not confer immunity).",
    pearls:[
      "Tetanus is a clinical diagnosis treated with antitoxin, wound care, and spasm control — metronidazole is a minor adjunct.",
      "Surviving tetanus does not immunize — vaccinate during recovery." ] },

  { id:"botulism", cat:"tox", icon:"flame", name:"Botulism",
    line:"Descending flaccid paralysis from Clostridium botulinum toxin",
    tiers:[
      { k:"Antitoxin (primary)", rx:"Equine botulinum antitoxin (or BabyBIG for infants) — give early; antibiotics are NOT primary", note:"Antibiotics are avoided in infant botulism (lysis may release more toxin) and add little in foodborne disease; antitoxin and respiratory support are the treatment." },
    ],
    cover:{ empiric:"Clostridium botulinum toxin — the disease is intoxication, not infection", drop:"Aminoglycosides and antibiotics in infant botulism — they can worsen neuromuscular blockade or release toxin." },
    bugs:["anaerobe"],
    duration:"No fixed antibiotic course; recovery depends on antitoxin timing and ventilatory support.",
    deesc:"Source-specific (wound botulism may warrant penicillin/metronidazole after antitoxin); report to public health immediately.",
    pearls:[
      "Symmetric descending paralysis with bulbar onset and clear sensorium suggests botulism — give antitoxin without waiting for confirmation.",
      "Avoid aminoglycosides, which potentiate the neuromuscular block." ] },

  { id:"enteric-fever", cat:"tox", icon:"flame", name:"Enteric Fever (Typhoid / Paratyphoid)",
    line:"Systemic Salmonella Typhi / Paratyphi infection in the returning traveler",
    tiers:[
      { k:"Empiric", rx:"Ceftriaxone 2 g IV q24h; azithromycin for uncomplicated disease", note:"Fluoroquinolone resistance is now widespread (South Asia) — empiric ceftriaxone or azithromycin is preferred over ciprofloxacin." },
    ],
    cover:{ empiric:"Salmonella enterica serovars Typhi and Paratyphi", drop:"Empiric fluoroquinolone for travelers from high-resistance regions." },
    bugs:["entero"],
    duration:"7–14 days (ceftriaxone 10–14 d; azithromycin 7 d for uncomplicated disease).",
    deesc:"De-escalate to oral by susceptibility once defervescence begins; report to public health.",
    pearls:[
      "Take a travel history — fluoroquinolone resistance in S. Typhi from South Asia makes empiric ceftriaxone or azithromycin the safer choice.",
      "Relapse and chronic biliary carriage occur; persistent or recurrent disease warrants evaluation of the gallbladder." ] },

  { id:"severe-gastroenteritis", cat:"tox", icon:"flame", name:"Severe Bacterial Gastroenteritis",
    line:"Most acute diarrhea needs no antibiotics — treat selectively",
    tiers:[
      { k:"Selective therapy", rx:"Azithromycin for invasive/febrile dysentery (Campylobacter, Shigella, non-Typhi Salmonella in high-risk hosts)", note:"Avoid antibiotics in suspected Shiga-toxin E. coli (STEC) — they increase the risk of hemolytic uremic syndrome." },
    ],
    cover:{ empiric:"Campylobacter, Shigella, non-typhoidal Salmonella, invasive E. coli", drop:"Antibiotics for suspected Shiga-toxin-producing E. coli (O157) — they raise HUS risk." },
    bugs:["entero"],
    duration:"3–5 days when treatment is indicated; rehydration is the mainstay.",
    deesc:"Most bacterial gastroenteritis is self-limited — reserve antibiotics for severe, febrile, dysenteric, or high-risk-host disease.",
    pearls:[
      "Bloody diarrhea without fever, especially with a low platelet count or rising creatinine, raises STEC/HUS — withhold antibiotics and antimotility agents.",
      "Non-typhoidal Salmonella is treated only in infants, the elderly, the immunocompromised, or those with endovascular risk — treatment otherwise prolongs shedding." ] },

  { id:"febneut", cat:"immuno", durKey:"Febrile neutropenia", icon:"shield", name:"Febrile Neutropenia",
    line:"ANC <500 + fever · empiric within 1 hour",
    tiers:[
      { k:"Empiric monotherapy", rx:"Cefepime 2 g IV q8h, piperacillin-tazobactam 4.5 g q6h, or meropenem", note:"Antipseudomonal β-lactam monotherapy is standard for high-risk neutropenia." },
      { k:"Add agents by indication", rx:"Add vancomycin (line/skin/severe sepsis/pneumonia) or an aminoglycoside (resistant GNR/instability)", note:"Add antifungal therapy for persistent fever >4–7 d (separate guide).", sev:true },
    ],
    cover:{ empiric:"Enterobacterales, Pseudomonas; Gram-positives (line/mucositis); resistant GNR by colonization", drop:"Routine empiric vancomycin — add only for specific indications, then stop at 48 h if cultures are negative." },
    bugs:["pseudo","entero","esbl","mrsa","mssa","strep"],
    duration:"Continue until ANC recovery and afebrile; tailor to any documented infection.",
    deesc:"Use a validated risk tool (e.g., MASCC) to identify low-risk candidates for oral/outpatient therapy. De-escalate vancomycin at 48 h if not indicated.",
    pearls:[
      "Door-to-antibiotic within 1 hour is the quality metric — do not wait for the count to be confirmed.",
      "Persistent fever despite broad antibiotics → evaluate for invasive fungal infection and undrained foci." ] },

  { id:"typhlitis", cat:"immuno", icon:"shield", name:"Neutropenic Enterocolitis (Typhlitis)",
    line:"Right-lower-quadrant syndrome in neutropenia",
    tiers:[
      { k:"Empiric", rx:"Piperacillin-tazobactam or meropenem (anaerobic + Pseudomonas coverage)", note:"Single broad agent covering gut flora incl. anaerobes and Pseudomonas." },
    ],
    cover:{ empiric:"Enterobacterales, Pseudomonas, anaerobes, enterococci; gut-derived flora", drop:"Routine surgery — most cases are managed medically; operate for perforation/uncontrolled bleeding/necrosis." },
    bugs:["entero","pseudo","anaerobe","efaecalis"],
    duration:"Until neutrophil recovery and resolution of symptoms.",
    deesc:"Bowel rest, supportive care; add antifungal coverage if persistent. Surgery is reserved for complications.",
    pearls:[
      "Suspect with neutropenia + fever + right-lower-quadrant pain; CT shows bowel-wall thickening (cecum).",
      "Ensure anaerobic coverage — a gap if a non-anaerobic β-lactam is chosen." ] },

  { id:"opsi", cat:"immuno", icon:"shield", name:"Overwhelming Post-Splenectomy Infection (OPSI)",
    line:"Encapsulated-organism sepsis in asplenia",
    tiers:[
      { k:"Empiric", rx:"Ceftriaxone 2 g IV (add vancomycin for resistant pneumococcus / severe sepsis)", note:"Cover encapsulated organisms emergently — fulminant course over hours." },
    ],
    cover:{ empiric:"S. pneumoniae (most), H. influenzae, N. meningitidis; Capnocytophaga after dog bite", drop:"Any delay — OPSI kills within hours; treat at first suspicion in an asplenic patient." },
    bugs:["strep","entero"],
    duration:"Guided by documented infection (typically ≥7–14 days for bacteremia).",
    deesc:"Narrow per culture; reinforce prevention (vaccination against encapsulated organisms, standby antibiotics, patient education).",
    pearls:[
      "Asplenic/hyposplenic patients should hold standby amoxicillin-clavulanate and seek urgent care for any fever.",
      "Vaccinate against pneumococcus, meningococcus, and H. influenzae type b — ideally before elective splenectomy." ] },

  { id:"candidemia", cat:"immuno", icon:"shield", name:"Candidemia (scope note)",
    line:"Antifungal scope note — see dedicated reference; surfaced here because it co-presents with line/neutropenic sepsis",
    tiers:[
      { k:"Empiric", rx:"Echinocandin (caspofungin 70 mg load → 50 mg q24h, or micafungin 100 mg q24h)",
        note:"Antifungal — out of formal scope of this antibacterial reference. Echinocandin first-line per IDSA 2016 (Pappas); de-escalate to fluconazole if susceptible Candida albicans + clinically stable." },
    ],
    cover:{ empiric:"Candida spp. — antifungal not antibacterial; remove line + dilated fundoscopy + ≥ 14 d from first negative culture", drop:"Antibacterial regimen alone — fungemia does not respond" },
    bugs:[],
    duration:"≥ 14 d from first negative blood culture (IDSA 2016).",
    deesc:"De-escalate echinocandin → fluconazole if isolate susceptible + clinically stable + non-neutropenic.",
    pearls:[
      "**Remove the line** — line removal independently improves survival.",
      "**Dilated fundoscopy** within 1 wk — endogenous endophthalmitis in ~10%.",
      "**Echo** — Candida endocarditis prevalence is rising in IVDU + line cohorts." ] },

  { id:"tubo-ovarian", cat:"ssti", icon:"shield", name:"Tubo-Ovarian Abscess",
    line:"Pelvic abscess complicating PID; drainage + IV antibiotic + gyn surgery",
    tiers:[
      { k:"Empiric", rx:"Ceftriaxone 1 g IV q24h + doxycycline 100 mg PO BID + metronidazole 500 mg IV/PO q8h (or cefotetan + doxy alternative)",
        note:"Per CDC 2021 STI inpatient regimen for severe PID with TOA. Drainage for TOA > 8 cm or non-response by 72 h." },
    ],
    cover:{ empiric:"N. gonorrhoeae, C. trachomatis, polymicrobial enteric anaerobes + GNR + GBS", drop:"Outpatient regimen — TOA mandates inpatient + drainage decision" },
    bugs:["entero","strep"],
    duration:"14 d total (IV → PO step-down on clinical improvement); longer if drainage delayed.",
    deesc:"De-escalate per cultures; transition to oral when afebrile + clinical improvement; gyn surgery + IR coordination for drainage.",
    pearls:[
      "**Drain for TOA > 8 cm** or non-response by 72 h — IR or surgical.",
      "**Partner notification + STI screen** (HIV, syphilis, hepatitis) mandatory.",
      "**Pelvic US or CT** at presentation to distinguish uncomplicated PID from TOA." ] },

  { id:"nocardia", cat:"immuno", icon:"shield", name:"Nocardiosis",
    line:"Pulmonary, CNS, or disseminated · cell-mediated defect",
    tiers:[
      { k:"Severe / disseminated / CNS", rx:"High-dose TMP-SMX + imipenem (± amikacin)", note:"Multidrug induction for severe disease pending speciation/susceptibilities." },
      { k:"Localized / step-down", rx:"TMP-SMX (or linezolid) guided by susceptibilities", note:"Linezolid is reliably active across species when sulfa is not tolerated.", sev:false },
    ],
    cover:{ empiric:"Nocardia species — send speciation and susceptibilities; species predicts the pattern", drop:"Short courses — relapse is common; therapy runs months." },
    bugs:["atypical"],
    duration:"6–12 months (longer with CNS or immunosuppression); image the brain in pulmonary/disseminated disease.",
    deesc:"Tailor to species and susceptibilities; reduce immunosuppression where possible.",
    pearls:[
      "Always image the CNS in pulmonary or disseminated nocardiosis — occult brain abscesses are common and change therapy.",
      "Linezolid is uniformly active and useful for sulfa-intolerant patients (watch cytopenias on prolonged use)." ] },

  { id:"listeria", cat:"immuno", icon:"shield", name:"Listeriosis",
    line:"Bacteremia / rhombencephalitis · ampicillin-based",
    tiers:[
      { k:"Empiric / directed", rx:"Ampicillin 2 g IV q4h (high dose); add gentamicin for synergy in severe disease/CNS", note:"The reason ampicillin is added to empiric meningitis regimens at age >50 or impaired immunity." },
      { k:"Severe penicillin allergy", rx:"High-dose TMP-SMX", note:"The principal alternative when ampicillin cannot be used.", sev:false },
    ],
    cover:{ empiric:"Listeria monocytogenes", drop:"Cephalosporins — they have NO Listeria activity, the classic empiric gap." },
    bugs:["atypical"],
    duration:"Bacteremia ≥2 weeks; CNS (meningitis/rhombencephalitis) ≥3–4 weeks; longer in immunocompromised.",
    deesc:"Confirm with blood/CSF cultures; reduce immunosuppression where feasible.",
    pearls:[
      "Affects neonates, pregnancy, age >50, and impaired cell-mediated immunity — the at-risk groups define empiric coverage.",
      "Rhombencephalitis (brainstem) is a distinctive Listeria presentation requiring prolonged therapy." ] },

  { id:"capno", cat:"immuno", icon:"shield", name:"Capnocytophaga Infection",
    line:"Fulminant sepsis after dog/cat exposure in asplenia",
    tiers:[
      { k:"Empiric / directed", rx:"Ampicillin-sulbactam or piperacillin-tazobactam (β-lactam/β-lactamase-inhibitor); carbapenem for severe sepsis", note:"β-lactamase-inhibitor combinations cover the β-lactamase-producing strains." },
    ],
    cover:{ empiric:"Capnocytophaga canimorsus (dog/cat oral flora)", drop:"Underestimating severity in asplenic/cirrhotic hosts — the course can be fulminant (purpura fulminans, DIC)." },
    bugs:["anaerobe"],
    duration:"≥2 weeks for bacteremia; longer with endovascular or metastatic complications.",
    deesc:"Narrow per culture (fastidious, slow-growing — alert the lab); supportive care for sepsis/DIC.",
    pearls:[
      "Classic story: fulminant sepsis days after a dog bite/lick in an asplenic, cirrhotic, or alcohol-use-disorder patient.",
      "Overlaps with the bite-wound and OPSI cards — β-lactam/β-lactamase-inhibitor coverage bridges all three." ] },

  { id:"neutropenic-pna", cat:"immuno", icon:"shield", name:"Pneumonia in the Neutropenic / Transplant Host",
    line:"Broader differential — resistant bacteria plus fungi and viruses (scope-bridged)",
    tiers:[
      { k:"Bacterial empiric", rx:"Antipseudomonal β-lactam (cefepime, piperacillin-tazobactam, or meropenem) + vancomycin if risk", note:"Add an echinocandin or mold-active azole (antifungal guide) for persistent fever or nodular/halo infiltrates; pursue early bronchoscopy and BAL." },
    ],
    cover:{ empiric:"Pseudomonas and resistant Enterobacterales, S. aureus; Aspergillus, PJP, and respiratory viruses by host and imaging", drop:"A bacterial-only frame in the persistently febrile neutropenic host — broaden the differential to fungi and viruses." },
    bugs:["pseudo","entero","mrsa"],
    duration:"Until neutrophil recovery and clinical/radiographic resolution; pathogen-specific once identified.",
    deesc:"Early bronchoscopy with BAL changes management; halo or reverse-halo signs on CT suggest invasive mold (see an antifungal reference).",
    pearls:[
      "Nodules with a halo sign in a neutropenic patient suggest invasive aspergillosis — antibacterials will not treat it.",
      "Diffuse infiltrates with hypoxia out of proportion in a lymphopenic, non-prophylaxed host raise Pneumocystis — a non-bacterial cause requiring TMP-SMX." ] },

  { id:"sot-infection", cat:"immuno", icon:"shield", name:"Infection in the Solid-Organ Transplant Recipient",
    line:"Net immunosuppression and timeline shape the differential",
    tiers:[
      { k:"Bacterial empiric", rx:"Broad coverage by suspected source and the recipient's prior resistant isolates; antipseudomonal β-lactam for severe sepsis", note:"Timeline matters: nosocomial/donor-derived early, opportunistic (1–6 months), community plus late opportunistic thereafter. Mind calcineurin-inhibitor interactions." },
    ],
    cover:{ empiric:"Resistant Enterobacterales, Pseudomonas, S. aureus; opportunistic pathogens (CMV, Nocardia, fungi) by timeline — non-bacterial causes are scope-bridged", drop:"A community frame for the timeline-specific opportunistic infections — match the differential to time since transplant." },
    bugs:["pseudo","entero","esbl","mrsa"],
    duration:"Source- and pathogen-specific; often longer given impaired clearance.",
    deesc:"Reduce or adjust immunosuppression in concert with the transplant team; watch fluoroquinolone/azole/macrolide interactions with calcineurin inhibitors.",
    pearls:[
      "The time-since-transplant interval predicts the pathogen class — nosocomial early, opportunistic at 1–6 months, community plus late opportunistic after.",
      "Many transplant infections are non-bacterial (CMV, Nocardia, invasive fungi) — antibacterials are only part of the differential." ] },

  { id:"asplenia-prophylaxis", cat:"immuno", icon:"shield", name:"Asplenia: Acute Febrile Illness",
    line:"Every fever in the asplenic patient is a potential emergency",
    tiers:[
      { k:"Empiric", rx:"Ceftriaxone 2 g IV (cover encapsulated organisms); add vancomycin if severe or meningitis suspected", note:"Treat at the first fever — encapsulated-organism sepsis in asplenia progresses within hours (see the asplenic-sepsis card for the shock presentation)." },
    ],
    cover:{ empiric:"S. pneumoniae, H. influenzae, N. meningitidis; Capnocytophaga after dog exposure", drop:"A wait-and-see approach — empiric therapy precedes confirmation in the febrile asplenic patient." },
    bugs:["strep","entero"],
    duration:"Pathogen-specific; complete the course for the identified organism.",
    deesc:"Confirm vaccination status, prescribe standby antibiotics, and educate on early presentation.",
    pearls:[
      "Asplenic patients should carry standby amoxicillin-clavulanate and seek care immediately with any fever.",
      "Ensure pneumococcal, meningococcal, and Hib vaccination — prevention is the most effective intervention." ] },

  { id:"biologic-infection", cat:"immuno", icon:"shield", name:"Infection on Biologic / Targeted Immunotherapy",
    line:"TNF inhibitors, rituximab, JAK inhibitors and others unmask specific risks",
    tiers:[
      { k:"Empiric", rx:"Source-directed antibacterial coverage; hold the biologic during acute infection", note:"The agent dictates the risk: TNF inhibitors → granulomatous reactivation (TB, endemic fungi, Listeria); anti-CD20 → encapsulated organisms, hepatitis B, PML; complement inhibitors → Neisseria." },
    ],
    cover:{ empiric:"Standard pyogenic pathogens plus agent-specific risks (intracellular, encapsulated, or Neisseria) — many are non-bacterial and scope-bridged", drop:"A generic frame — the specific biologic narrows the high-risk pathogen list." },
    bugs:["strep","mssa","mrsa","entero","atypical"],
    duration:"Source- and pathogen-specific; hold immunotherapy until the infection is controlled.",
    deesc:"Screen for and address agent-specific risks (latent TB and hepatitis B before TNF/anti-CD20; meningococcal vaccination before complement inhibitors).",
    pearls:[
      "Eculizumab and other complement inhibitors sharply raise meningococcal risk — vaccinate and counsel on prophylaxis.",
      "TNF inhibitors reactivate tuberculosis, endemic mycoses, and Listeria — a febrile patient on a TNF inhibitor needs a broadened, often non-bacterial, differential." ] },

  { id:"cgd-defect", cat:"immuno", icon:"shield", name:"Defined Immune Defect: Pathogen Patterns",
    line:"The defect predicts the organism — neutrophil, complement, humoral, or cellular",
    tiers:[
      { k:"Empiric by defect", rx:"Source-directed therapy informed by the defect's characteristic pathogens", note:"Neutrophil defects → catalase-positive bacteria and molds; complement → encapsulated and Neisseria; humoral → encapsulated; cellular → intracellular bacteria, viruses, fungi." },
    ],
    cover:{ empiric:"Defect-specific pathogen classes — many non-bacterial and scope-bridged", drop:"An undifferentiated empiric frame when a defined immune defect points to specific organisms." },
    bugs:["strep","mssa","entero","atypical"],
    duration:"Pathogen-specific; often prolonged with impaired host clearance.",
    deesc:"Match the workup to the defect; involve immunology and ID for recurrent or unusual infections.",
    pearls:[
      "Recurrent catalase-positive (S. aureus, Serratia, Nocardia) and mold infections suggest chronic granulomatous disease.",
      "Recurrent Neisseria infection points to a terminal complement deficiency — test the complement pathway." ] },

  { id:"lemierre", cat:"blood", durKey:"Lemierre syndrome", icon:"heart", name:"Lemierre Syndrome / Septic Thrombophlebitis",
    line:"Fusobacterium necrophorum · oropharyngeal source + internal jugular thrombophlebitis + septic emboli",
    tiers:[
      { k:"Empiric", rx:"Ampicillin-sulbactam or piperacillin-tazobactam (or a carbapenem)", note:"Cover Fusobacterium and oral anaerobes; add metronidazole if a narrower β-lactam is used." },
      { k:"Penicillin allergy", rx:"Carbapenem, or metronidazole + a third-generation cephalosporin", note:"Some F. necrophorum produce β-lactamase — include a BLI or metronidazole.", sev:false },
    ],
    cover:{ empiric:"Fusobacterium necrophorum, oral anaerobes, streptococci", drop:"Anticoagulation is not routine — reserve for clot propagation or persistent emboli." },
    bugs:["anaerobe","strep"],
    duration:"3–6 weeks (prolonged; guided by metastatic foci and source control).",
    pearls:[
      "Suspect in a young adult with pharyngitis followed by neck pain/swelling and septic pulmonary emboli.",
      "CT of the neck and chest confirms internal jugular thrombosis and embolic infarcts.",
      "Drain abscesses and metastatic collections — source control drives duration." ] },

  { id:"endophthalmitis", cat:"blood", icon:"heart", name:"Infective Endophthalmitis",
    line:"Post-procedural, hematogenous (endogenous), or post-traumatic · sight-threatening emergency",
    tiers:[
      { k:"Intravitreal (definitive)", rx:"Intravitreal vancomycin + ceftazidime (or amikacin) ± vitrectomy", note:"Immediate ophthalmology; intravitreal therapy is the definitive route — systemic antibiotics alone do not reach the vitreous.", sev:true },
      { k:"Endogenous / systemic", rx:"Add systemic vancomycin + antipseudomonal β-lactam; treat the bloodstream source", note:"Endogenous disease implies bacteremia/fungemia — find and treat the primary focus.", sev:false },
    ],
    cover:{ empiric:"Coag-negative staph & streptococci (post-cataract); S. aureus, Pseudomonas; Bacillus (trauma)", drop:"Systemic antibiotics do not substitute for intravitreal therapy." },
    bugs:["mrsa","strep","pseudo"],
    duration:"Guided by intravitreal response and any systemic source.",
    pearls:[
      "Vision-threatening — escalate to ophthalmology within hours, not days.",
      "Endogenous endophthalmitis is a marker of occult bacteremia or candidemia; obtain blood cultures and search for the source." ] },

  { id:"mediastinitis", cat:"ssti", icon:"slice", name:"Acute Mediastinitis",
    line:"Post-sternotomy deep sternal wound infection, or descending necrotizing (oropharyngeal) mediastinitis",
    tiers:[
      { k:"Post-sternotomy", rx:"Vancomycin + antipseudomonal β-lactam (cefepime or piperacillin-tazobactam)", note:"Cover staphylococci (incl. MRSA) and nosocomial Gram-negatives; surgical debridement is mandatory.", sev:true },
      { k:"Descending necrotizing", rx:"Piperacillin-tazobactam or a carbapenem (polymicrobial + anaerobes)", note:"Odontogenic/oropharyngeal source — broad anaerobic + streptococcal cover with urgent surgical drainage.", sev:true },
    ],
    cover:{ empiric:"S. aureus (incl. MRSA), Gram-negative rods, oral anaerobes/streptococci (descending)", drop:"Antibiotics do not replace surgical debridement and mediastinal drainage." },
    bugs:["mrsa","pseudo","anaerobe"],
    duration:"≥4–6 weeks; longer with sternal osteomyelitis or retained hardware.",
    pearls:[
      "Post-sternotomy mediastinitis is a surgical emergency — debridement, drainage, and often muscle-flap reconstruction.",
      "Sternal osteomyelitis extends duration; operative cultures guide narrowing." ] },

  { id:"mycotic-aneurysm", cat:"blood", icon:"heart", name:"Mycotic (Infected) Aneurysm",
    line:"Infected arterial wall · S. aureus, Salmonella, streptococci · high rupture risk",
    tiers:[
      { k:"Empiric", rx:"Vancomycin + ceftriaxone (S. aureus, streptococci, Salmonella)", note:"Add antipseudomonal cover by risk; tailor to blood cultures and operative specimens." },
      { k:"Definitive", rx:"Pathogen-directed IV therapy + surgical / endovascular repair", note:"Source control (resection/repair, debridement) is essential — antibiotics alone rarely cure.", sev:false },
    ],
    cover:{ empiric:"Staphylococcus aureus, Salmonella, streptococci", drop:"Brief courses fail — relapse and rupture risk demand prolonged therapy plus surgery." },
    bugs:["mrsa","strep"],
    duration:"≥6 weeks IV after repair; lifelong suppression if a graft is retained.",
    pearls:[
      "Salmonella has a tropism for atherosclerotic aortic intima — endovascular infection in Salmonella bacteremia mandates aortic imaging.",
      "Engage vascular surgery early; consider lifelong suppression with retained prosthetic graft material." ] },

  { id:"pid", cat:"gu", icon:"drop", name:"Pelvic Inflammatory Disease / Tubo-ovarian Abscess",
    line:"Ascending genital-tract infection · gonococcus, chlamydia, anaerobes, enterics",
    tiers:[
      { k:"Inpatient (severe / TOA)", rx:"Ceftriaxone + doxycycline + metronidazole", note:"IV until clinical improvement; metronidazole covers anaerobes when a tubo-ovarian abscess is present." },
      { k:"Tubo-ovarian abscess", rx:"Add drainage for large or non-responding collections", note:"Image-guided or surgical drainage if no response in 48–72 h or a large abscess.", sev:false },
    ],
    cover:{ empiric:"N. gonorrhoeae, C. trachomatis, anaerobes, Enterobacterales, streptococci", drop:"Do not omit anaerobic/abscess cover when a TOA is present." },
    bugs:["anaerobe","entero"],
    duration:"14 days total (IV step-down to oral doxycycline + metronidazole).",
    pearls:[
      "Treat empirically on minimal clinical criteria — the cost of missed PID is infertility.",
      "Test and treat partners; screen for concurrent STIs and HIV." ] },

  { id:"urosepsis", cat:"gu", icon:"drop", name:"Urosepsis / Obstructive Pyelonephritis",
    line:"Sepsis from a urinary source — drainage of an obstructed system is the priority",
    tiers:[
      { k:"Empiric", rx:"Ceftriaxone 1–2 g IV q24h; antipseudomonal β-lactam (cefepime or piperacillin-tazobactam) if healthcare-associated or prior resistant isolate", note:"Carbapenem if prior ESBL. An obstructed, infected collecting system requires emergent decompression — antibiotics do not relieve obstruction." },
    ],
    cover:{ empiric:"Enterobacterales (E. coli, Klebsiella, Proteus), with ESBL/Pseudomonas by risk", drop:"Reliance on antibiotics alone with an obstructing stone — percutaneous nephrostomy or ureteral stent is the therapy." },
    bugs:["entero","esbl","pseudo"],
    duration:"7 days for bacteremic GNR urinary source in responders with drainage (BALANCE); longer if source control is delayed.",
    deesc:"Image early for obstruction (CT or ultrasound); narrow to the urine and blood culture organism.",
    pearls:[
      "An obstructed, infected kidney is a urologic emergency — decompress within hours; antibiotics buy time but do not drain.",
      "Bacteremic urinary-source GNR completes in 7 days once the system is drained and the patient responds." ] },

  { id:"asymp-bact", cat:"gu", icon:"drop", name:"Asymptomatic Bacteriuria",
    line:"A positive urine culture without urinary symptoms — usually not treated",
    tiers:[
      { k:"Treat only when indicated", rx:"Treat in pregnancy and before an invasive urologic procedure; otherwise do not treat", note:"Targeted short course (e.g., nitrofurantoin or a β-lactam in pregnancy) only for the validated indications." },
    ],
    cover:{ empiric:"Enterobacterales — but treatment is the exception, not the rule", drop:"Antibiotics for a positive culture without symptoms outside pregnancy or pre-urologic procedures — treatment causes harm and selects resistance." },
    bugs:["entero","esbl"],
    duration:"None unless indicated; pregnancy 4–7 days, then a test of cure.",
    deesc:"The core decision is whether to treat at all — pyuria, odor, or chronic catheter colonization are not indications.",
    pearls:[
      "Treating asymptomatic bacteriuria does not prevent symptomatic infection and increases resistance and C. difficile — the validated exceptions are pregnancy and pre-urologic surgery.",
      "Delirium with a positive urine culture but no urinary symptoms is rarely UTI — look for another cause before attributing it to the urine." ] },

  { id:"emphysematous-uti", cat:"gu", icon:"drop", name:"Emphysematous Pyelonephritis / Cystitis",
    line:"Gas-forming upper- or lower-tract infection, predominantly in diabetics",
    tiers:[
      { k:"Empiric", rx:"Antipseudomonal β-lactam (piperacillin-tazobactam or cefepime) with prompt urologic involvement", note:"Gas within the renal parenchyma is a surgical emergency — drainage or, in severe cases, nephrectomy may be required." },
    ],
    cover:{ empiric:"E. coli and Klebsiella (gas-forming Enterobacterales); Pseudomonas by risk", drop:"Medical management alone in extensive parenchymal gas — source control determines survival." },
    bugs:["entero","esbl","pseudo"],
    duration:"Prolonged (often weeks), guided by drainage adequacy and radiographic resolution.",
    deesc:"CT defines the extent of gas and the need for percutaneous drainage versus nephrectomy; control glucose.",
    pearls:[
      "Almost exclusively a disease of poorly controlled diabetes — gas on imaging changes this from a medical to a surgical problem.",
      "Percutaneous drainage with antibiotics has improved outcomes; emergent nephrectomy is reserved for the most extensive disease." ] },

  { id:"transplant-uti", cat:"gu", icon:"drop", name:"UTI in the Renal Transplant Recipient",
    line:"The allograft is denervated and immunosuppressed — a low threshold and broader differential",
    tiers:[
      { k:"Empiric", rx:"Antipseudomonal β-lactam or a carbapenem by prior cultures and local resistance", note:"Transplant recipients carry resistant Enterobacterales frequently; align with their own microbiology and adjust immunosuppression-interacting agents." },
    ],
    cover:{ empiric:"Enterobacterales (often resistant), Pseudomonas, Enterococcus; consider BK and adenovirus when sterile pyuria", drop:"Narrow empiric coverage when the recipient's prior cultures show resistant organisms." },
    bugs:["entero","esbl","pseudo","efaecalis"],
    duration:"Longer than in immunocompetent hosts; 10–14 days for upper-tract or allograft involvement.",
    deesc:"Mind drug interactions — fluoroquinolones and TMP-SMX interact with calcineurin inhibitors and raise potassium.",
    pearls:[
      "Graft pyelonephritis can present with allograft tenderness and a rising creatinine rather than classic flank pain.",
      "Sterile pyuria in a transplant recipient should prompt consideration of BK virus and other non-bacterial causes." ] },

  { id:"scrotal-abscess", cat:"gu", icon:"drop", name:"Scrotal / Testicular Abscess",
    line:"Suppurative complication of epididymo-orchitis requiring drainage",
    tiers:[
      { k:"Empiric + drainage", rx:"Antipseudomonal or enteric GNR coverage by age and risk, plus surgical drainage or orchiectomy", note:"An established abscess will not resolve on antibiotics alone; urology drains or, when the testis is destroyed, performs orchiectomy." },
    ],
    cover:{ empiric:"Enterobacterales in older men; sexually transmitted organisms in younger men", drop:"Antibiotics without drainage once an abscess has formed." },
    bugs:["entero"],
    duration:"10–14 days after drainage; longer if extensive.",
    deesc:"Ultrasound confirms the abscess and excludes torsion or infarction; tailor to culture.",
    pearls:[
      "An abscess is a source-control problem — antibiotics are adjunctive to drainage.",
      "Persistent pain and swelling despite appropriate antibiotics for epididymo-orchitis should prompt scrotal ultrasound." ] },

  { id:"device-vascular", cat:"blood", icon:"heart", name:"Vascular Graft & CIED / LVAD Infection",
    line:"Prosthetic vascular graft, pacemaker/ICD, or LVAD infection · biofilm + device retention",
    tiers:[
      { k:"Empiric", rx:"Vancomycin + antipseudomonal β-lactam (cefepime or piperacillin-tazobactam)", note:"Cover staphylococci (incl. MRSA) and Gram-negatives including Pseudomonas; tailor to cultures." },
      { k:"Definitive", rx:"Complete device/hardware removal + pathogen-directed therapy (add rifampin for staph if hardware retained)", note:"Cure usually requires explant; rifampin is the biofilm adjunct (never monotherapy) when removal is impossible.", sev:false },
    ],
    cover:{ empiric:"Coag-negative staph, S. aureus (incl. MRSA), Gram-negative rods, Pseudomonas; Cutibacterium (CIED)", drop:"Hardware retention without removal usually fails — plan explant." },
    bugs:["mrsa","mssa","pseudo"],
    duration:"4–6 weeks IV after device removal; longer or suppression if retained.",
    pearls:[
      "CIED infection requires complete system extraction (leads + generator) plus antibiotics — antibiotics alone fail.",
      "LVAD driveline infections are often chronically suppressed until transplant; involve the VAD team and ID early." ] },

  { id:"persistent-mrsa", cat:"blood", icon:"heart", name:"Persistent MRSA Bacteremia",
    line:"Positive cultures beyond 72 h on appropriate vancomycin — a distinct management problem",
    tiers:[
      { k:"Salvage", rx:"Daptomycin 8–10 mg/kg IV q24h, often combined with ceftaroline", note:"Switch off vancomycin; the daptomycin-plus-ceftaroline combination is the most-used salvage regimen for refractory MRSA bacteremia." },
    ],
    cover:{ empiric:"MRSA with reduced vancomycin susceptibility or an uncontrolled focus", drop:"Continued vancomycin monotherapy when cultures remain positive at 72 h — persistence signals a source or an agent problem." },
    bugs:["mrsa"],
    duration:"At least 4–6 weeks, treated as complicated bacteremia; the clock restarts at the first negative culture.",
    deesc:"Persistence is a prompt to hunt for a metastatic or undrained focus (endocarditis, abscess, septic thrombophlebitis), not simply to extend the same therapy.",
    pearls:[
      "Persistent bacteremia is a source problem until proven otherwise — repeat echocardiography and image for occult foci.",
      "Check the vancomycin AUC and the MIC; rising MIC or AUC failure is the trigger to change agents." ] },

  { id:"pseudo-bact", cat:"blood", icon:"heart", name:"Pseudomonas Bacteremia",
    line:"High-mortality Gram-negative bacteremia demanding active antipseudomonal therapy",
    tiers:[
      { k:"Susceptible", rx:"One active antipseudomonal agent — cefepime, piperacillin-tazobactam, meropenem, or ceftazidime, dose-optimized", note:"Definitive monotherapy with a confirmed-active agent is appropriate; routine double coverage is not required once susceptibility is known." },
      { k:"DTR-Pseudomonas", rx:"Ceftolozane-tazobactam, ceftazidime-avibactam, or imipenem-relebactam per susceptibilities", note:"Difficult-to-treat resistance requires a novel β-lactam chosen on the susceptibility panel; involve ID.", sev:true },
    ],
    cover:{ empiric:"P. aeruginosa, including difficult-to-treat strains by local epidemiology", drop:"Empiric double antipseudomonal coverage as a permanent strategy — it is a bridge until susceptibilities return." },
    bugs:["pseudo"],
    duration:"7 days for uncomplicated, source-controlled bacteremia in responders (BALANCE); longer for endovascular or undrained sources.",
    deesc:"Use dose-optimized (extended-infusion) β-lactam dosing; narrow to monotherapy once an active agent is confirmed.",
    pearls:[
      "Empiric double coverage improves the odds of an active agent at the outset but is collapsed to one active drug once susceptibilities return.",
      "Source matters — pneumonia and undrained foci carry worse outcomes than a removable line." ] },

  { id:"vre-bact", cat:"blood", icon:"heart", name:"VRE Bacteremia",
    line:"Vancomycin-resistant Enterococcus faecium bloodstream infection",
    tiers:[
      { k:"First-line", rx:"Daptomycin 10–12 mg/kg IV q24h (high dose) or linezolid 600 mg q12h", note:"Daptomycin for bacteremia (dose up to reduce emergence of resistance, monitoring CK); linezolid is bacteriostatic but an option, especially for non-bloodstream sources." },
    ],
    cover:{ empiric:"E. faecium, vancomycin-resistant; speciate and confirm resistance genotype", drop:"Cephalosporins and most β-lactams entirely — enterococci are intrinsically resistant." },
    bugs:["vre"],
    duration:"7–14 days for uncomplicated; longer with endocarditis or persistent bacteremia.",
    deesc:"Remove the line and seek the source; check daptomycin MIC, which can rise on therapy.",
    pearls:[
      "Daptomycin dose-creep (10–12 mg/kg) reduces the emergence of daptomycin resistance in VRE bacteremia.",
      "Distinguish true infection from colonization — VRE from a non-sterile site rarely warrants treatment." ] },

  { id:"polymicrobial-bact", cat:"blood", icon:"heart", name:"Polymicrobial Bacteremia",
    line:"More than one organism in the blood — usually a gut, biliary, or deep abscess source",
    tiers:[
      { k:"Empiric", rx:"Piperacillin-tazobactam or a carbapenem (covers enteric GNR, anaerobes, and streptococci)", note:"Polymicrobial bacteremia points to a breached gut or an undrained collection — pursue imaging and source control." },
    ],
    cover:{ empiric:"Enterobacterales, anaerobes, streptococci, and enterococci reflecting an abdominal or pelvic source", drop:"A purely Gram-positive regimen — the mixed flora signals an enteric or deep-abscess source." },
    bugs:["entero","anaerobe","strep","efaecalis"],
    duration:"Driven by source control; 4 days after adequate control for an intra-abdominal source (STOP-IT).",
    deesc:"The microbiology is a clue to the source — polymicrobial growth should trigger cross-sectional imaging of the abdomen and pelvis.",
    pearls:[
      "Polymicrobial bacteremia is a source diagnosis as much as a microbiologic one — find the breach or the abscess.",
      "Candida in a polymicrobial set raises gut perforation or a contaminated line — see an antifungal reference." ] },

  { id:"strep-bact", cat:"blood", icon:"heart", name:"Streptococcal Bacteremia",
    line:"Viridans, β-hemolytic, and S. gallolyticus bloodstream infection",
    tiers:[
      { k:"Penicillin-susceptible", rx:"Penicillin G or ceftriaxone", note:"Most streptococci remain exquisitely penicillin-susceptible; narrow promptly from any empiric vancomycin." },
      { k:"Severe / toxic (group A)", rx:"Penicillin + clindamycin", note:"Add clindamycin for toxin suppression in invasive group A streptococcal disease; pursue source control.", sev:false },
    ],
    cover:{ empiric:"Viridans group, β-hemolytic (A/B/C/G), and S. gallolyticus streptococci", drop:"Continued empiric vancomycin once a penicillin-susceptible streptococcus is identified." },
    bugs:["strep"],
    duration:"10–14 days for uncomplicated bacteremia; longer with endocarditis or a deep focus.",
    deesc:"Echocardiography for viridans or persistent streptococcal bacteremia; narrow to penicillin once susceptible.",
    pearls:[
      "S. gallolyticus (formerly S. bovis) bacteremia mandates colonoscopy to exclude colorectal neoplasia and evaluation for endocarditis.",
      "Viridans streptococcal bacteremia in a neutropenic patient can cause a severe shock/ARDS syndrome — do not dismiss it as a contaminant." ] },

  { id:"vertosteo", cat:"ssti", durKey:"Vertebral osteomyelitis / discitis", icon:"bone", name:"Vertebral Osteomyelitis / Discitis",
    line:"Hold antibiotics for the biopsy unless septic · long course",
    tiers:[
      { k:"Stable — culture first", rx:"Obtain blood cultures and image-guided biopsy BEFORE antibiotics; treat once a pathogen is named", note:"In the hemodynamically stable patient, empiric therapy before sampling lowers culture yield and changes nothing acutely.", sev:false },
      { k:"MSSA / MRSA (most common)", rx:"MSSA: cefazolin or nafcillin · MRSA: vancomycin (AUC-guided) or daptomycin", note:"S. aureus is the leading cause; add rifampin only when hardware is retained.", sev:false },
      { k:"Gram-negative / Pseudomonas", rx:"Ceftriaxone; cefepime or ciprofloxacin when Pseudomonas is likely", note:"More common with a urinary source, injection drug use, and in the elderly.", sev:false },
      { k:"Septic / neurologic deficit", rx:"Empiric vancomycin + cefepime now; emergent MRI and spine surgery referral", note:"A new or progressive deficit raises epidural abscess — a surgical emergency that overrides the culture-first rule.", sev:true },
    ],
    cover:{ empiric:"S. aureus including MRSA, with Gram-negative rods and streptococci by host", drop:"Empiric breadth before biopsy in the stable patient — culture-directed therapy is the rule." },
    bugs:["mssa","mrsa","strep","entero","pseudo"],
    duration:"6 weeks from the start of effective therapy; high-bioavailability oral step-down is non-inferior (OVIVA). Longer with undrained abscess or retained hardware.",
    deesc:"Narrow to the blood or biopsy isolate; convert to oral once stable per OVIVA. Track CRP and the clinical course rather than repeat MRI alone.",
    pearls:[
      "**Get the pathogen first** — blood cultures plus image-guided biopsy before antibiotics whenever the patient is stable.",
      "**Epidural abscess** is the feared extension; a new neurologic deficit is a surgical emergency.",
      "**MRI** is the imaging standard — plain films lag by weeks." ] },

  { id:"liverabscess", cat:"abd", durKey:"Pyogenic liver abscess", icon:"soup", name:"Pyogenic Liver Abscess",
    line:"Drainage is treatment · cover enterics + anaerobes",
    tiers:[
      { k:"Empiric + drainage", rx:"Ceftriaxone + metronidazole (or piperacillin-tazobactam) with percutaneous drainage", note:"Drainage is therapeutic; antibiotics alone rarely clear a collection larger than 3–5 cm.", sev:false },
      { k:"Hypervirulent Klebsiella", rx:"Ceftriaxone; screen for metastatic spread to the eye and CNS", note:"Monomicrobial K. pneumoniae abscess in diabetic or East-Asian patients seeds endophthalmitis and meningitis — examine for metastatic foci.", sev:false },
    ],
    cover:{ empiric:"Enteric Gram-negatives (Klebsiella, E. coli), anaerobes, and Streptococcus anginosus group", drop:"Routine antifungal or antipseudomonal cover without a specific risk factor." },
    bugs:["entero","anaerobe","strep","esbl"],
    duration:"4–6 weeks total, stepping down to oral after drainage and clinical response; longer if incompletely drained.",
    deesc:"Narrow to blood and aspirate cultures; oral step-down once drained and improving.",
    pearls:[
      "**Drainage is the treatment** — antibiotics are adjunctive for any sizeable collection.",
      "**Hypervirulent Klebsiella** — hunt for endophthalmitis and CNS seeding in diabetic patients.",
      "**Strep anginosus group** abscess should prompt a search for a second, occult source." ] },

  { id:"appendicitis", cat:"abd", icon:"soup", name:"Acute Appendicitis (complicated)",
    line:"Perforated or abscess-forming appendicitis — antibiotics plus source control",
    tiers:[
      { k:"Empiric", rx:"Ceftriaxone + metronidazole, or piperacillin-tazobactam, or ertapenem", note:"Cover enteric Gram-negatives and anaerobes. Appendectomy or, for a contained phlegmon/abscess, drainage with interval appendectomy." },
    ],
    cover:{ empiric:"Enterobacterales, anaerobes (Bacteroides), and streptococci of enteric origin", drop:"Routine antipseudomonal or antifungal coverage in community-acquired disease." },
    bugs:["entero","anaerobe","strep"],
    duration:"Uncomplicated after appendectomy: 24 h or less. Complicated/perforated with source control: ~4 days (STOP-IT).",
    deesc:"Source control resets the clock; uncomplicated appendicitis needs little or no postoperative antibiotic.",
    pearls:[
      "Selected uncomplicated appendicitis can be managed with antibiotics alone, though many recur and undergo later appendectomy.",
      "A periappendiceal abscess is drained percutaneously with interval appendectomy rather than immediate surgery." ] },

  { id:"pd-peritonitis", cat:"abd", icon:"soup", name:"Peritoneal Dialysis-Associated Peritonitis",
    line:"Cloudy effluent in a PD patient — intraperitoneal antibiotics are first-line",
    tiers:[
      { k:"Empiric (intraperitoneal)", rx:"Intraperitoneal vancomycin + ceftazidime (or an aminoglycoside), dosed per ISPD", note:"Intraperitoneal dosing achieves high local levels; cover Gram-positives and Gram-negatives until the effluent culture returns." },
    ],
    cover:{ empiric:"Coagulase-negative staph and S. aureus (touch contamination); Enterobacterales and Pseudomonas", drop:"Systemic-only therapy as the default — the intraperitoneal route is standard for PD peritonitis." },
    bugs:["mssa","mrsa","entero","pseudo"],
    duration:"2–3 weeks depending on organism; remove the catheter for refractory, fungal, or Pseudomonas peritonitis.",
    deesc:"Effluent cell count and culture guide therapy; persistent cloudy effluent at day 5 signals catheter removal.",
    pearls:[
      "Diagnosis is effluent WBC >100/µL with >50% neutrophils plus symptoms — send effluent for cell count and culture before treating.",
      "Refractory, relapsing, fungal, or Pseudomonas PD peritonitis mandates catheter removal — antibiotics will not clear a colonized catheter." ] },

  { id:"splenic-abscess", cat:"abd", icon:"soup", name:"Splenic Abscess",
    line:"Often hematogenous (endocarditis) — drainage or splenectomy plus antibiotics",
    tiers:[
      { k:"Empiric", rx:"Broad-spectrum coverage (piperacillin-tazobactam or ceftriaxone + metronidazole) + vancomycin if endovascular source", note:"Source is frequently embolic from endocarditis; evaluate the heart and pursue drainage or splenectomy." },
    ],
    cover:{ empiric:"Streptococci and staphylococci (hematogenous); enteric organisms and anaerobes (contiguous)", drop:"Medical therapy alone for a discrete abscess — percutaneous drainage or splenectomy is usually required." },
    bugs:["strep","mssa","mrsa","entero","anaerobe"],
    duration:"Several weeks, guided by drainage and the underlying source (e.g., full endocarditis course if embolic).",
    deesc:"Hunt for the source — splenic abscess is endocarditis until proven otherwise; obtain echocardiography.",
    pearls:[
      "A splenic abscess should trigger an endocarditis evaluation — many are septic emboli.",
      "Vaccinate against encapsulated organisms when splenectomy is performed." ] },

  { id:"toxic-megacolon", cat:"abd", icon:"soup", name:"Toxic Megacolon (severe colitis)",
    line:"Colonic dilatation with systemic toxicity — frequently fulminant C. difficile",
    tiers:[
      { k:"Empiric", rx:"Oral vancomycin 500 mg q6h + IV metronidazole 500 mg q8h (fulminant C. difficile); add broad coverage for perforation risk", note:"Combination therapy for fulminant C. difficile; surgical consultation for colectomy if progressing." },
    ],
    cover:{ empiric:"C. difficile (most common); enteric flora if perforation supervenes", drop:"Antimotility agents — they precipitate or worsen megacolon." },
    bugs:["anaerobe","entero"],
    duration:"At least 14 days for fulminant C. difficile; longer if complicated.",
    deesc:"Daily surgical assessment — rising lactate, worsening dilatation, or perforation mandates colectomy.",
    pearls:[
      "Fulminant C. difficile (ileus, megacolon, shock) is treated with high-dose oral vancomycin plus IV metronidazole, not oral metronidazole alone.",
      "Avoid antimotility agents and opioids, which can precipitate megacolon in colitis." ] },

  { id:"mesenteric-isch", cat:"abd", icon:"soup", name:"Bowel Ischemia / Perforation",
    line:"Translocation and peritoneal soiling after ischemic or perforated bowel",
    tiers:[
      { k:"Empiric", rx:"Piperacillin-tazobactam or a carbapenem (enteric GNR + anaerobes); add vancomycin if healthcare-associated", note:"Antibiotics are adjunctive to emergent surgical management of the ischemic or perforated segment." },
    ],
    cover:{ empiric:"Enterobacterales, anaerobes, enterococci; Candida in upper-GI perforation or postoperative leak", drop:"Reliance on antibiotics without surgical control of the ischemic or perforated bowel." },
    bugs:["entero","anaerobe","efaecalis"],
    duration:"~4 days after source control (STOP-IT); longer if control is incomplete or there is ongoing soilage.",
    deesc:"Source control is everything; add empiric antifungal coverage for upper-GI perforation or postoperative leak (see an antifungal reference).",
    pearls:[
      "Upper-GI (gastroduodenal) perforation and postoperative leaks justify empiric Candida coverage, unlike most community intra-abdominal infection.",
      "The duration clock starts at definitive source control, not at the first dose." ] },

  { id:"orbital", cat:"ssti", icon:"slice", name:"Orbital (Post-septal) Cellulitis",
    line:"Vision-threatening · cover sinus flora + MRSA",
    tiers:[
      { k:"Empiric", rx:"Vancomycin + ceftriaxone (or ampicillin-sulbactam) + metronidazole", note:"Usually spreads from ethmoid sinusitis — cover streptococci, S. aureus including MRSA, and respiratory anaerobes.", sev:false },
      { k:"Severe / intracranial extension", rx:"Vancomycin + meropenem; emergent ophthalmology and ENT", note:"Subperiosteal or orbital abscess and cavernous sinus thrombosis are the vision- and life-threatening complications.", sev:true },
    ],
    cover:{ empiric:"Streptococci (incl. anginosus), S. aureus including MRSA, H. influenzae, respiratory anaerobes", drop:"This breadth for pre-septal (peri-orbital) cellulitis — a milder, often outpatient entity." },
    bugs:["strep","mssa","mrsa","anaerobe"],
    duration:"IV until afebrile and clearly improving, then oral to complete 2–3 weeks; longer with a drained abscess.",
    deesc:"Separate post-septal (proptosis, ophthalmoplegia, pain on eye movement on CT) from pre-septal disease; narrow per culture or surgery and step down when stable.",
    pearls:[
      "**Post- versus pre-septal** is the pivotal distinction — post-septal needs CT, IV therapy, and possible surgery.",
      "**Ophthalmoplegia, proptosis, or vision change** signals orbital involvement until proven otherwise.",
      "**Cavernous sinus thrombosis** is the catastrophic extension — watch for bilateral signs and cranial neuropathies." ] },

  { id:"ludwig", cat:"ssti", icon:"slice", name:"Ludwig's Angina / Deep Neck Space Infection",
    line:"Airway first · odontogenic, polymicrobial",
    tiers:[
      { k:"Empiric", rx:"Ampicillin-sulbactam (or piperacillin-tazobactam); add vancomycin with MRSA risk", note:"Odontogenic and polymicrobial — viridans streptococci plus oral anaerobes. Airway protection precedes everything else.", sev:false },
      { k:"Severe / immunocompromised", rx:"Piperacillin-tazobactam + vancomycin; emergent ENT or OMFS for drainage", note:"Secure the airway early; imaging and antibiotics never delay surgical drainage of a deep-neck collection.", sev:true },
    ],
    cover:{ empiric:"Viridans / anginosus streptococci, oral anaerobes (Prevotella, Fusobacterium), S. aureus by risk", drop:"Routine antipseudomonal or MRSA cover without a specific risk factor." },
    bugs:["strep","anaerobe","mssa","mrsa"],
    duration:"2–3 weeks — IV until source-controlled and improving, then oral.",
    deesc:"Airway and drainage are the priorities; narrow to operative cultures and step down to amoxicillin-clavulanate once stable.",
    pearls:[
      "**The airway is the emergency** — bilateral submandibular swelling, tongue elevation, and a muffled voice; involve anaesthesia early.",
      "**Odontogenic source** in most cases — dental evaluation and drainage.",
      "**Descending mediastinitis** is the lethal extension along the fascial planes of the neck." ] },

  { id:"erysipelas", cat:"ssti", icon:"slice", name:"Erysipelas",
    line:"Sharply demarcated, raised, superficial dermal streptococcal infection",
    tiers:[
      { k:"First-line", rx:"Penicillin (oral or IV) or cefazolin", note:"Almost always β-hemolytic streptococcal — narrow-spectrum penicillin is appropriate; MRSA coverage is not required without purulence." },
    ],
    cover:{ empiric:"β-hemolytic streptococci (groups A, C, G)", drop:"Empiric MRSA coverage — erysipelas is streptococcal and responds to penicillin." },
    bugs:["strep"],
    duration:"5 days; extend to ~10 days if slow to respond.",
    deesc:"Distinguish from cellulitis by the raised, sharply demarcated border; treat predisposing edema and tinea to prevent recurrence.",
    pearls:[
      "The sharply demarcated, elevated border distinguishes erysipelas (upper dermis) from cellulitis (deeper dermis/subcutis).",
      "Recurrent erysipelas warrants treating the portal of entry — interdigital tinea and lymphedema." ] },

  { id:"lymphangitis", cat:"ssti", icon:"slice", name:"Acute Lymphangitis",
    line:"Ascending red streaking from a distal portal of entry",
    tiers:[
      { k:"First-line", rx:"Cefazolin or an antistreptococcal penicillin; add MRSA coverage only if purulent", note:"Predominantly β-hemolytic streptococcal; treat the inciting wound." },
    ],
    cover:{ empiric:"β-hemolytic streptococci; S. aureus if purulent or wound-associated", drop:"Reflexive broad coverage — uncomplicated lymphangitis is streptococcal." },
    bugs:["strep","mssa"],
    duration:"5–10 days depending on response and source control.",
    deesc:"Identify and treat the portal of entry; mark the proximal margin to track progression.",
    pearls:[
      "Tender red streaks tracking proximally toward regional nodes are the hallmark — find the distal wound.",
      "Nodular (sporotrichoid) lymphangitis suggests Sporothrix, Nocardia, or Mycobacterium marinum — a different, non-empiric workup." ] },

  { id:"hidradenitis", cat:"ssti", icon:"slice", name:"Hidradenitis Suppurativa (acute flare)",
    line:"Inflammatory follicular disease — not a primary infection",
    tiers:[
      { k:"Acute flare", rx:"Drainage of fluctuant lesions; antibiotics (doxycycline, or clindamycin + rifampin) for secondary infection or moderate disease", note:"Antibiotics target secondary infection and inflammation, not a single causative organism; chronic disease needs dermatology and possibly biologics." },
    ],
    cover:{ empiric:"Mixed skin flora and anaerobes in secondarily infected lesions", drop:"An expectation of cure with antibiotics alone — this is an inflammatory disease, not a simple infection." },
    bugs:["mssa","strep","anaerobe"],
    duration:"Short courses for acute secondary infection; chronic suppressive regimens are dermatology-directed.",
    deesc:"Incise and drain acutely fluctuant lesions; refer for definitive medical or surgical management of recurrent disease.",
    pearls:[
      "Hidradenitis is a follicular occlusion disorder — recurrent abscesses in the axillae and groin are not ordinary furunculosis.",
      "Definitive control often requires biologics or surgery, not repeated antibiotic courses." ] },

  { id:"infected-ulcer", cat:"ssti", icon:"slice", name:"Infected Venous / Arterial Leg Ulcer",
    line:"Chronic wounds are colonized — treat infection, not colonization",
    tiers:[
      { k:"Infected (systemic or local signs)", rx:"Cover streptococci and S. aureus (cephalexin, or doxycycline/TMP-SMX if MRSA risk); broaden for deep or limb-threatening infection", note:"Treat only with signs of infection — increasing pain, erythema, warmth, purulence, or systemic features. Compression and wound care are central for venous ulcers." },
    ],
    cover:{ empiric:"β-hemolytic streptococci and S. aureus; polymicrobial including GNR/anaerobes in deep or chronic wounds", drop:"Antibiotics for a colonized but non-infected ulcer — surface swabs grow flora that need not be treated." },
    bugs:["strep","mssa","mrsa","entero","anaerobe"],
    duration:"7–14 days for soft-tissue infection; reassess for underlying osteomyelitis if non-healing.",
    deesc:"Address the underlying physiology — compression for venous, revascularization assessment for arterial; debride devitalized tissue.",
    pearls:[
      "A positive surface swab from a chronic ulcer reflects colonization — treat the patient's signs, not the culture.",
      "A non-healing ulcer over a bony prominence warrants evaluation for underlying osteomyelitis." ] },

  { id:"perianal-abscess", cat:"ssti", icon:"slice", name:"Perianal / Perirectal Abscess",
    line:"Drainage is the treatment; antibiotics are selective",
    tiers:[
      { k:"Drainage ± antibiotics", rx:"Incision and drainage; add coverage (amoxicillin-clavulanate or ciprofloxacin + metronidazole) for cellulitis, systemic signs, immunocompromise, or deep/supralevator extension", note:"Simple drained perianal abscess in a healthy host often needs no antibiotics; deep or complicated disease does." },
    ],
    cover:{ empiric:"Enteric Gram-negatives, anaerobes, and streptococci of perineal origin", drop:"Antibiotics in place of drainage — an undrained abscess will not resolve." },
    bugs:["entero","anaerobe","strep"],
    duration:"None to 5–7 days after drainage depending on host and extent.",
    deesc:"Image (MRI) for suspected deep/supralevator or fistulizing disease; evaluate for Crohn disease in recurrent cases.",
    pearls:[
      "A simple, well-drained perianal abscess in an immunocompetent patient may need no antibiotics at all.",
      "Recurrent or complex perianal abscesses and fistulae raise Crohn disease — pursue the underlying diagnosis." ] },
];

/* syndrome id → the guideline/trial that anchors its duration or strategy
   (only unambiguous mappings; absent → no evidence chip rendered) */
const SYN_GUIDE = {
  sepsis:"ssc", cap:"cap", hap:"hapvap", aspiration:"cap", gnbact:"balance",
  sab:"balance", crbsi:"balance", peritonitis:"stopit", cholangitis:"stopit",
  diverticulitis:"stopit", cellulitis:"ssti", purulent:"ssti", necfasc:"ssti",
  dfi:"dfi", osteo:"oviva", pji:"oviva", vertosteo:"oviva", meningitis:"ssc", cdiff:"cdi",
  febneut:"fn", typhlitis:"fn", entbact:"amrgn",
  bites:"ssti", mastitis:"ssti", pyomyositis:"ssti", bursitis:"ssti", pressure:"ssti", tss:"ssti", fournier:"ssti",
};

export { SYNDROMES, SYN_CATS, SRC_CONTROL, SYN_GUIDE, DIRECTED };
