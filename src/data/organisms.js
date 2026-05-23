/* data · organisms, resistance mechanisms, MRSA/GNR matrices, agent comparison.
   Inpatient Antibiotic Guide — module graph documented in README.md. */
const ORGS = [
  { id:"strep", label:"Strep / S. pneumoniae", grp:"gpc" },
  { id:"mssa", label:"MSSA", grp:"gpc" },
  { id:"mrsa", label:"MRSA", grp:"gpc" },
  { id:"efaecalis", label:"E. faecalis", grp:"gpc" },
  { id:"vre", label:"E. faecium / VRE", grp:"gpc" },
  { id:"entero", label:"Enterobacterales (WT)", grp:"gnr" },
  { id:"esbl", label:"ESBL-E", grp:"gnr" },
  { id:"ampc", label:"AmpC-E", grp:"gnr" },
  { id:"pseudo", label:"P. aeruginosa", grp:"gnr" },
  { id:"cre", label:"CRE", grp:"res" },
  { id:"crab", label:"Acinetobacter (CRAB)", grp:"res" },
  { id:"steno", label:"S. maltophilia", grp:"res" },
  { id:"anaerobe", label:"Anaerobes (B. fragilis)", grp:"ana" },
  { id:"atypical", label:"Atypicals", grp:"atp" },
];

/* f=reliable/first-line activity · p=partial/variable/not-preferred · n=none */
/* pref[] = organisms for which THIS agent is a drug of choice (★)            */
const MX_CLASSES = [
  { cls:"Penicillins", rows:[
    { name:"Penicillin G", tag:"natural penicillin",
      c:{strep:"f",mssa:"n",mrsa:"n",efaecalis:"p",vre:"n",entero:"n",esbl:"n",ampc:"n",pseudo:"n",cre:"n",crab:"n",steno:"n",anaerobe:"p",atypical:"n"}, pref:["strep"] },
    { name:"Ampicillin", tag:"aminopenicillin",
      c:{strep:"f",mssa:"n",mrsa:"n",efaecalis:"f",vre:"n",entero:"p",esbl:"n",ampc:"n",pseudo:"n",cre:"n",crab:"n",steno:"n",anaerobe:"p",atypical:"n"}, pref:["efaecalis"] },
    { name:"Amoxicillin-clavulanate", tag:"+ inhibitor (PO)",
      c:{strep:"f",mssa:"f",mrsa:"n",efaecalis:"f",vre:"n",entero:"p",esbl:"n",ampc:"n",pseudo:"n",cre:"n",crab:"n",steno:"n",anaerobe:"f",atypical:"n"}, pref:[] },
    { name:"Ampicillin-sulbactam", tag:"+ inhibitor",
      c:{strep:"f",mssa:"f",mrsa:"n",efaecalis:"f",vre:"n",entero:"p",esbl:"n",ampc:"n",pseudo:"n",cre:"n",crab:"p",steno:"n",anaerobe:"f",atypical:"n"}, pref:[] },
    { name:"Nafcillin / oxacillin", tag:"antistaphylococcal penicillin",
      c:{strep:"f",mssa:"f",mrsa:"n",efaecalis:"n",vre:"n",entero:"n",esbl:"n",ampc:"n",pseudo:"n",cre:"n",crab:"n",steno:"n",anaerobe:"n",atypical:"n"}, pref:["mssa"] },
    { name:"Piperacillin-tazobactam", tag:"antipseudomonal + inhibitor",
      c:{strep:"f",mssa:"f",mrsa:"n",efaecalis:"f",vre:"n",entero:"f",esbl:"p",ampc:"p",pseudo:"f",cre:"n",crab:"p",steno:"n",anaerobe:"f",atypical:"n"}, pref:[] },
  ]},
  { cls:"Cephalosporins", rows:[
    { name:"Cefazolin", tag:"1st generation",
      c:{strep:"f",mssa:"f",mrsa:"n",efaecalis:"n",vre:"n",entero:"p",esbl:"n",ampc:"n",pseudo:"n",cre:"n",crab:"n",steno:"n",anaerobe:"n",atypical:"n"}, pref:["mssa"] },
    { name:"Ceftriaxone", tag:"3rd generation",
      c:{strep:"f",mssa:"f",mrsa:"n",efaecalis:"n",vre:"n",entero:"f",esbl:"n",ampc:"n",pseudo:"n",cre:"n",crab:"n",steno:"n",anaerobe:"n",atypical:"n"}, pref:["strep"] },
    { name:"Ceftazidime", tag:"3rd gen, antipseudomonal",
      c:{strep:"p",mssa:"n",mrsa:"n",efaecalis:"n",vre:"n",entero:"f",esbl:"n",ampc:"n",pseudo:"f",cre:"n",crab:"n",steno:"n",anaerobe:"n",atypical:"n"}, pref:[] },
    { name:"Cefepime", tag:"4th generation",
      c:{strep:"f",mssa:"f",mrsa:"n",efaecalis:"n",vre:"n",entero:"f",esbl:"p",ampc:"f",pseudo:"f",cre:"n",crab:"n",steno:"n",anaerobe:"n",atypical:"n"}, pref:["ampc"] },
    { name:"Ceftaroline", tag:"anti-MRSA cephalosporin",
      c:{strep:"f",mssa:"f",mrsa:"f",efaecalis:"p",vre:"n",entero:"f",esbl:"n",ampc:"n",pseudo:"n",cre:"n",crab:"n",steno:"n",anaerobe:"n",atypical:"n"}, pref:[] },
  ]},
  { cls:"Carbapenems & monobactam", rows:[
    { name:"Ertapenem", tag:"carbapenem (no Pseudomonas)",
      c:{strep:"f",mssa:"f",mrsa:"n",efaecalis:"n",vre:"n",entero:"f",esbl:"f",ampc:"f",pseudo:"n",cre:"n",crab:"n",steno:"n",anaerobe:"f",atypical:"n"}, pref:["esbl"] },
    { name:"Meropenem", tag:"antipseudomonal carbapenem",
      c:{strep:"f",mssa:"f",mrsa:"n",efaecalis:"p",vre:"n",entero:"f",esbl:"f",ampc:"f",pseudo:"f",cre:"n",crab:"p",steno:"n",anaerobe:"f",atypical:"n"}, pref:["esbl"] },
    { name:"Aztreonam", tag:"monobactam (GN only)",
      c:{strep:"n",mssa:"n",mrsa:"n",efaecalis:"n",vre:"n",entero:"f",esbl:"p",ampc:"p",pseudo:"f",cre:"p",crab:"n",steno:"p",anaerobe:"n",atypical:"n"}, pref:[] },
  ]},
  { cls:"Novel β-lactam / β-lactamase-inhibitor agents (reserve)", rows:[
    { name:"Ceftolozane-tazobactam", tag:"antipseudomonal",
      c:{strep:"p",mssa:"n",mrsa:"n",efaecalis:"n",vre:"n",entero:"f",esbl:"f",ampc:"p",pseudo:"f",cre:"n",crab:"n",steno:"n",anaerobe:"p",atypical:"n"}, pref:["pseudo"] },
    { name:"Ceftazidime-avibactam", tag:"KPC / OXA-48 active",
      c:{strep:"p",mssa:"n",mrsa:"n",efaecalis:"n",vre:"n",entero:"f",esbl:"f",ampc:"f",pseudo:"f",cre:"f",crab:"n",steno:"f",anaerobe:"n",atypical:"n"}, pref:["cre"] },
    { name:"Meropenem-vaborbactam", tag:"KPC active",
      c:{strep:"f",mssa:"f",mrsa:"n",efaecalis:"p",vre:"n",entero:"f",esbl:"f",ampc:"f",pseudo:"p",cre:"f",crab:"n",steno:"n",anaerobe:"f",atypical:"n"}, pref:["cre"] },
    { name:"Imipenem-relebactam", tag:"KPC / DTR-Pseudomonas",
      c:{strep:"f",mssa:"f",mrsa:"n",efaecalis:"p",vre:"n",entero:"f",esbl:"f",ampc:"f",pseudo:"f",cre:"f",crab:"n",steno:"n",anaerobe:"f",atypical:"n"}, pref:[] },
    { name:"Cefiderocol", tag:"siderophore cephalosporin",
      c:{strep:"n",mssa:"n",mrsa:"n",efaecalis:"n",vre:"n",entero:"f",esbl:"f",ampc:"f",pseudo:"f",cre:"f",crab:"f",steno:"f",anaerobe:"n",atypical:"n"}, pref:["crab"] },
    { name:"Sulbactam-durlobactam", tag:"anti-CRAB",
      c:{strep:"n",mssa:"n",mrsa:"n",efaecalis:"n",vre:"n",entero:"p",esbl:"n",ampc:"n",pseudo:"n",cre:"n",crab:"f",steno:"n",anaerobe:"n",atypical:"n"}, pref:["crab"] },
  ]},
  { cls:"Fluoroquinolones", rows:[
    { name:"Ciprofloxacin", tag:"fluoroquinolone",
      c:{strep:"p",mssa:"p",mrsa:"n",efaecalis:"p",vre:"n",entero:"p",esbl:"p",ampc:"p",pseudo:"f",cre:"n",crab:"p",steno:"p",anaerobe:"n",atypical:"f"}, pref:[] },
    { name:"Levofloxacin", tag:"respiratory fluoroquinolone",
      c:{strep:"f",mssa:"p",mrsa:"n",efaecalis:"p",vre:"n",entero:"p",esbl:"p",ampc:"p",pseudo:"f",cre:"n",crab:"p",steno:"f",anaerobe:"n",atypical:"f"}, pref:["atypical"] },
    { name:"Moxifloxacin", tag:"respiratory fluoroquinolone",
      c:{strep:"f",mssa:"p",mrsa:"n",efaecalis:"p",vre:"n",entero:"p",esbl:"n",ampc:"n",pseudo:"n",cre:"n",crab:"n",steno:"n",anaerobe:"p",atypical:"f"}, pref:["atypical"] },
  ]},
  { cls:"Tetracyclines & aminoglycosides", rows:[
    { name:"Doxycycline / minocycline", tag:"tetracycline",
      c:{strep:"p",mssa:"p",mrsa:"p",efaecalis:"n",vre:"n",entero:"p",esbl:"n",ampc:"n",pseudo:"n",cre:"n",crab:"p",steno:"f",anaerobe:"p",atypical:"f"}, pref:["atypical"] },
    { name:"Gentamicin / amikacin", tag:"aminoglycoside",
      c:{strep:"n",mssa:"p",mrsa:"n",efaecalis:"p",vre:"p",entero:"f",esbl:"p",ampc:"p",pseudo:"f",cre:"p",crab:"p",steno:"n",anaerobe:"n",atypical:"n"}, pref:[] },
  ]},
  { cls:"Anti-Gram-positive agents", rows:[
    { name:"Vancomycin (IV)", tag:"glycopeptide",
      c:{strep:"f",mssa:"f",mrsa:"f",efaecalis:"p",vre:"n",entero:"n",esbl:"n",ampc:"n",pseudo:"n",cre:"n",crab:"n",steno:"n",anaerobe:"n",atypical:"n"}, pref:["mrsa"] },
    { name:"Daptomycin", tag:"lipopeptide (not lung)",
      c:{strep:"f",mssa:"f",mrsa:"f",efaecalis:"f",vre:"f",entero:"n",esbl:"n",ampc:"n",pseudo:"n",cre:"n",crab:"n",steno:"n",anaerobe:"n",atypical:"n"}, pref:["vre"] },
    { name:"Linezolid", tag:"oxazolidinone",
      c:{strep:"f",mssa:"f",mrsa:"f",efaecalis:"f",vre:"f",entero:"n",esbl:"n",ampc:"n",pseudo:"n",cre:"n",crab:"n",steno:"n",anaerobe:"p",atypical:"n"}, pref:["vre"] },
    { name:"Clindamycin", tag:"lincosamide",
      c:{strep:"f",mssa:"f",mrsa:"p",efaecalis:"n",vre:"n",entero:"n",esbl:"n",ampc:"n",pseudo:"n",cre:"n",crab:"n",steno:"n",anaerobe:"p",atypical:"n"}, pref:[] },
  ]},
  { cls:"Other agents", rows:[
    { name:"Azithromycin", tag:"macrolide",
      c:{strep:"p",mssa:"n",mrsa:"n",efaecalis:"n",vre:"n",entero:"n",esbl:"n",ampc:"n",pseudo:"n",cre:"n",crab:"n",steno:"n",anaerobe:"n",atypical:"f"}, pref:["atypical"] },
    { name:"Trimethoprim-sulfamethoxazole", tag:"folate inhibitor",
      c:{strep:"n",mssa:"f",mrsa:"f",efaecalis:"n",vre:"n",entero:"p",esbl:"p",ampc:"p",pseudo:"n",cre:"n",crab:"p",steno:"f",anaerobe:"n",atypical:"n"}, pref:["steno"] },
    { name:"Metronidazole", tag:"nitroimidazole",
      c:{strep:"n",mssa:"n",mrsa:"n",efaecalis:"n",vre:"n",entero:"n",esbl:"n",ampc:"n",pseudo:"n",cre:"n",crab:"n",steno:"n",anaerobe:"f",atypical:"n"}, pref:["anaerobe"] },
    { name:"Polymyxin B / colistin", tag:"polymyxin (last resort)",
      c:{strep:"n",mssa:"n",mrsa:"n",efaecalis:"n",vre:"n",entero:"p",esbl:"p",ampc:"p",pseudo:"p",cre:"p",crab:"p",steno:"n",anaerobe:"n",atypical:"n"}, pref:[] },
  ]},
];

// flatten for convenience
const MX = MX_CLASSES.flatMap(c => c.rows.map(r => ({ ...r, cls:c.cls })));

/* ===================== DATA: RESISTANCE LADDER ===================== */
const LADDER = [
  { n:"1", name:"Penicillinase", mech:"narrow-spectrum β-lactamase", intensity:14,
    detail:"Staphylococcal and broad-host penicillinases hydrolyze penicillins. Defeated by a β-lactamase inhibitor or an antistaphylococcal penicillin.",
    survive:["Nafcillin / cefazolin (staph)","Amoxicillin-clavulanate","Ampicillin-sulbactam"] },
  { n:"2", name:"ESBL", mech:"extended-spectrum β-lactamase (CTX-M)", intensity:34,
    detail:"Hydrolyzes penicillins and most cephalosporins incl. ceftriaxone. The carbapenem is the workhorse; pip-tazo is inferior despite in-vitro activity (MERINO).",
    survive:["Ertapenem / meropenem","(cystitis) nitrofurantoin, TMP-SMX"] },
  { n:"3", name:"AmpC", mech:"inducible cephalosporinase", intensity:48,
    detail:"Chromosomal, inducible in Enterobacter, K. aerogenes, C. freundii. Inactivates 3rd-gen cephalosporins via derepression; cefepime is stable and now preferred (IDSA 2024).",
    survive:["Cefepime (preferred)","Carbapenem (high inoculum)"] },
  { n:"4", name:"KPC / OXA-48", mech:"serine carbapenemase", intensity:72,
    detail:"Hydrolyzes carbapenems. Restored by avibactam (KPC + OXA-48), vaborbactam or relebactam (KPC). The first rung where novel β-lactam/inhibitor agents are essential.",
    survive:["Ceftazidime-avibactam","Meropenem-vaborbactam","Imipenem-relebactam"] },
  { n:"5", name:"Metallo-β-lactamase", mech:"NDM / VIM / IMP (zinc-dependent)", intensity:90,
    detail:"Hydrolyzes all carbapenems and is NOT inhibited by avibactam/vaborbactam/relebactam. Aztreonam is stable to MBLs but needs avibactam to evade companion enzymes.",
    survive:["Ceftazidime-avibactam + aztreonam","Cefiderocol"] },
  { n:"6", name:"Non-fermenter resistance", mech:"DTR-Pseudomonas / CRAB / S. maltophilia", intensity:100,
    detail:"Intrinsic + acquired multidrug resistance in non-fermenting GNRs. Each organism has a distinct preferred agent; the siderophore cephalosporin reaches the broadest set.",
    survive:["DTR-PsA: ceftolozane-tazobactam / ceftazidime-avibactam / imipenem-relebactam","CRAB: sulbactam-durlobactam + carbapenem","S. maltophilia: TMP-SMX / minocycline / cefiderocol"] },
];

/* ---- A3 · TWO-VOCABULARY BRIDGE ------------------------------------------
   Outer 14-organism ids (syndrome bugs[] / BugTag) → Spectrum 49-organism ids.
   Validated in the integrity suite; the prerequisite for the organism drawer,
   compare mode, and derived coverage booleans. */
const ORG_XWALK = {
  strep:["spn","spnr","vgs","bhs"], mssa:["mssa"], mrsa:["mrsa"], efaecalis:["efs"],
  vre:["vre","efm"], entero:["eco","kpn","pmir"], esbl:["esbl"], ampc:["ampc"],
  pseudo:["psa"], cre:["cre","crem"], crab:["ab"], steno:["sm"],
  anaerobe:["bfrag","oana","gpana"], atypical:["myc","leg","rick"],
};

const ORG_BY_ID = Object.fromEntries(ORGS.map(o => [o.id, o]));

const MECH = [
  {band:"Cell-wall & membrane synthesis"},
  {cls:"Penicillins / cephalosporins / carbapenems / monobactam", tgt:"Penicillin-binding proteins (transpeptidases) \u2014 block peptidoglycan cross-linking", kill:"cidal", res:"Enzymatic hydrolysis (penicillinase \u2192 ESBL \u2192 AmpC \u2192 carbapenemase); altered PBP target (PBP2a = MRSA, PBP2x = penicillin-R pneumococcus, mosaic PBP = gonococcus); porin loss + efflux (Pseudomonas, CRE)", hook:"The \u03b2-lactamase escalation is the single most important resistance ladder \u2014 see the Reference tab."},
  {cls:"Glycopeptides (vancomycin)", tgt:"Binds the D-Ala-D-Ala terminus of the peptidoglycan precursor (substrate, not an enzyme)", kill:"cidal", res:"Target re-engineering to D-Ala-D-Lac (vanA/vanB \u2192 VRE); thickened cell wall sequestering drug (VISA)", hook:"Too large to cross the Gram-negative outer membrane \u2014 intrinsically Gram-positive only."},
  {cls:"Lipopeptide (daptomycin)", tgt:"Calcium-dependent insertion into the cytoplasmic membrane \u2192 depolarization", kill:"cidal", res:"Membrane charge / phospholipid changes (mprF, cls); cross-tolerance with vancomycin", hook:"Inactivated by pulmonary surfactant \u2014 a functional, not genetic, failure in pneumonia."},
  {cls:"Fosfomycin", tgt:"MurA (enolpyruvyl transferase) \u2014 the earliest committed step of cell-wall synthesis", kill:"cidal", res:"murA mutation; fos-family modifying enzymes; loss of GlpT/UhpT uptake transporters", hook:"Unique target \u2014 no cross-resistance with \u03b2-lactams."},
  {cls:"Polymyxins (colistin)", tgt:"Disrupt the LPS / lipid A of the outer membrane", kill:"cidal", res:"Lipid A modification (pmrAB, mgrB); plasmid-borne mcr genes", hook:"Last-resort for MDR Gram-negatives; mcr is the mobile-colistin-resistance threat."},
  {band:"Protein synthesis \u2014 30S ribosome"},
  {cls:"Aminoglycosides", tgt:"30S (irreversible) \u2014 codon misreading", kill:"cidal", res:"Aminoglycoside-modifying enzymes (AAC/ANT/APH); 16S-rRNA methyltransferases (armA/rmtB \u2014 pan-aminoglycoside, often with NDM); reduced uptake", hook:"Uptake is oxygen-dependent \u2014 inactive against anaerobes and in the abscess."},
  {cls:"Tetracyclines / glycylcyclines", tgt:"30S (reversible) \u2014 block aminoacyl-tRNA docking", kill:"static", res:"Efflux (tet(A)); ribosomal protection (tet(M)) \u2014 both evaded by tigecycline / eravacycline", hook:"Glycylcyclines were designed to outflank classic tet resistance."},
  {band:"Protein synthesis \u2014 50S ribosome"},
  {cls:"Macrolides", tgt:"50S / 23S rRNA \u2014 block elongation", kill:"static", res:"erm rRNA methylation (MLS\u2098 \u2014 macrolide-lincosamide-streptogramin co-resistance); mef efflux", hook:"Pneumococcal macrolide resistance is now too common for monotherapy of invasive disease."},
  {cls:"Lincosamide (clindamycin)", tgt:"50S / 23S rRNA \u2014 overlapping macrolide site", kill:"static", res:"Inducible erm (the D-test) \u2014 can emerge to clindamycin during therapy of erythromycin-resistant staph", hook:"D-test positive \u21d2 do not use clindamycin even if it tests susceptible."},
  {cls:"Oxazolidinones (linezolid / tedizolid)", tgt:"50S \u2014 prevent assembly of the 70S initiation complex", kill:"static", res:"23S rRNA mutation; cfr methyltransferase (also confers phenicol/lincosamide/streptogramin/pleuromutilin resistance)", hook:"No cross-resistance with other ribosomal agents \u2014 a unique initiation-step mechanism."},
  {cls:"Streptogramins / phenicol", tgt:"50S \u2014 peptidyl transferase / elongation", kill:"static \u2192 cidal (combo)", res:"vat acetyltransferases (streptogramin); CAT acetyltransferase (chloramphenicol)", hook:"Chloramphenicol limited by marrow toxicity; reserve agents."},
  {band:"Nucleic-acid synthesis & folate"},
  {cls:"Fluoroquinolones", tgt:"DNA gyrase (Gram-negative) and topoisomerase IV (Gram-positive)", kill:"cidal", res:"QRDR point mutations (gyrA / parC); plasmid qnr; efflux; aac(6\u2032)-Ib-cr bifunctional enzyme", hook:"Stepwise mutation \u2014 one mutation shifts MIC, two confer frank resistance."},
  {cls:"Folate antagonists (TMP-SMX)", tgt:"Sequential blockade: sulfonamide \u2192 dihydropteroate synthase; trimethoprim \u2192 dihydrofolate reductase", kill:"cidal (synergistic)", res:"Acquired sul / dfr genes; target overproduction", hook:"Two sequential steps give synergy and slow resistance \u2014 the rationale for the fixed combination."},
  {cls:"Nitroimidazole (metronidazole)", tgt:"Reduced nitro-radical causes DNA strand breaks \u2014 requires anaerobic activation", kill:"cidal", res:"nim nitroreductase genes (still uncommon)", hook:"Needs anaerobic nitroreduction \u2014 no aerobic activity at all (intrinsic)."},
  {cls:"Rifamycins (rifampin) \u2014 ADJUNCT", tgt:"DNA-dependent RNA polymerase \u03b2-subunit (rpoB)", kill:"cidal", res:"Single rpoB point mutation \u2014 emerges rapidly with monotherapy", hook:"NEVER monotherapy; the biofilm/intracellular adjunct for prosthetic-material staph infection."},
];

/* outer org id → keyword(s) that identify its DIRECTED row(s) */
const ORG_DIR_HINT = {
  strep:["streptococcus pneumoniae","group a strep","other strept"], mssa:["— mssa"], mrsa:["— mrsa"],
  efaecalis:["faecalis"], vre:["faecium"], entero:["e. coli / klebsiella"],
  esbl:["esbl-producing"], ampc:["ampc-e"], pseudo:["pseudomonas aeruginosa"], cre:["cre —"],
  crab:["acinetobacter"], steno:["stenotrophomonas"], anaerobe:["bacteroides"],
  atypical:["legionella"],
};

/* ============================================================================
   v3 · D2 — DECISION MATRICES
   Two consolidated selection grids: the right anti-MRSA agent by site, and the
   Gram-negative backbone by resistance mechanism (IDSA AMR-GN 2024). Cells pair
   colour with a glyph + legend so meaning never rides on colour alone.
   ========================================================================== */
const MRSA_MATRIX = {
  cols: ["Bacteraemia / IE", "Pneumonia", "SSTI", "Bone & joint", "CNS"],
  rows: [
    { ag:"Vancomycin (IV)", c:["pref","alt","pref","pref","pref"], note:"The workhorse across sites; target AUC/MIC 400–600. Lung penetration is modest, so linezolid is often preferred for MRSA pneumonia." },
    { ag:"Daptomycin", c:["pref","avoid","pref","pref","alt"], note:"High-dose (8–10 mg/kg) for endovascular infection or vancomycin failure / high MIC. Inactivated by pulmonary surfactant — never for pneumonia." },
    { ag:"Linezolid", c:["avoid","pref","pref","alt","alt"], note:"Bacteriostatic — not for endovascular infection. Best lung penetration for MRSA pneumonia; cytopenias beyond 14 days and serotonin-syndrome risk." },
    { ag:"Ceftaroline", c:["alt","pref","pref","alt","alt"], note:"The only β-lactam with MRSA activity; salvage (usually in combination) for refractory MRSA bacteraemia, and a first-rate CABP / SSTI option." },
    { ag:"Trimethoprim-sulfamethoxazole", c:["avoid","na","alt","alt","na"], note:"Oral CA-MRSA skin infection and oral step-down for bone; not for bacteraemia." },
    { ag:"Doxycycline / minocycline", c:["avoid","na","alt","na","na"], note:"Oral CA-MRSA skin option only." },
  ],
};

const MRSA_LEGEND = [
  { k:"pref", t:"Preferred" }, { k:"alt", t:"Alternative" }, { k:"avoid", t:"Avoid / inadequate" }, { k:"na", t:"Not applicable" },
];

const GNR_MATRIX = [
  { m:"Wild-type Enterobacterales", first:"Ceftriaxone (narrow further by site)", alt:"Cefazolin · fluoroquinolone · TMP-SMX", cav:"De-escalate from empiric breadth once susceptibilities return." },
  { m:"ESBL producers", first:"Carbapenem — ertapenem (stable, no antipseudomonal pressure) or meropenem if severe", alt:"Cystitis: nitrofurantoin · TMP-SMX · aminoglycoside", cav:"Piperacillin-tazobactam is inferior even when susceptible in vitro (MERINO)." },
  { m:"AmpC inducers (E. cloacae, K. aerogenes, C. freundii)", first:"Cefepime (stable to AmpC) or a carbapenem", alt:"Fluoroquinolone · TMP-SMX by susceptibility", cav:"Avoid ceftriaxone and pip-tazo — risk of treatment-emergent derepression." },
  { m:"CRE — KPC", first:"Ceftazidime-avibactam · meropenem-vaborbactam · imipenem-relebactam", alt:"Cefiderocol", cav:"Confirm the carbapenemase type — it changes the agent." },
  { m:"CRE — metallo-β-lactamase (NDM / VIM / IMP)", first:"Cefiderocol, or ceftazidime-avibactam + aztreonam", alt:"—", cav:"MBLs hydrolyse all β-lactams except aztreonam; avibactam shields aztreonam from co-resident enzymes." },
  { m:"CRE — OXA-48", first:"Ceftazidime-avibactam", alt:"Cefiderocol", cav:"Vaborbactam and relebactam do NOT restore activity against OXA-48." },
  { m:"DTR Pseudomonas aeruginosa", first:"Ceftolozane-tazobactam · ceftazidime-avibactam", alt:"Cefiderocol · imipenem-relebactam", cav:"Avoid aminoglycoside monotherapy; choose the novel agent by susceptibility." },
  { m:"CRAB (carbapenem-resistant Acinetobacter)", first:"Sulbactam-durlobactam, usually with a carbapenem", alt:"High-dose ampicillin-sulbactam · minocycline · cefiderocol · polymyxin combination", cav:"Combination therapy; reserve agents — speciate and test susceptibility." },
  { m:"Stenotrophomonas maltophilia", first:"TMP-SMX or minocycline", alt:"Levofloxacin · cefiderocol · ceftazidime-avibactam + aztreonam", cav:"Intrinsically carbapenem-resistant (L1 metallo-β-lactamase)." },
];

const MRSA_CELL = {
  pref:  { cls:"mx-pref",  glyph:"check", lab:"Preferred" },
  alt:   { cls:"mx-alt",   glyph:"dot",   lab:"Alternative" },
  avoid: { cls:"mx-avoid", glyph:"x",     lab:"Avoid / inadequate" },
  na:    { cls:"mx-na",    glyph:"dash",  lab:"Not applicable" },
};

/* ============================================================================
   v3 · D1 — COMPARE TWO AGENTS
   An additive side-by-side read of two agents across high-yield organisms,
   computed from the spectrum data. Divergent rows (one active, one not) are
   flagged — the fastest way to see what swapping agents actually costs.
   ========================================================================== */
const CMP_ORGS = ["spn","mssa","mrsa","efs","vre","eco","kpn","esbl","ampc","cre","psa","psdtr","ab","sm","bfrag","leg"];

const CMP_LVL = {
  first: { cls:"cl-first", ab:"F", t:"Reliable / first-line" },
  sec:   { cls:"cl-sec",   ab:"2", t:"Active — secondary" },
  var:   { cls:"cl-var",   ab:"V", t:"Variable" },
  intr:  { cls:"cl-intr",  ab:"R", t:"Intrinsic resistance" },
  none:  { cls:"cl-none",  ab:"–", t:"No useful activity" },
  na:    { cls:"cl-na",    ab:"–", t:"Not applicable" },
};

export { ORGS, ORG_BY_ID, ORG_XWALK, ORG_DIR_HINT, MX_CLASSES, MX, LADDER, MECH, MRSA_MATRIX, MRSA_LEGEND, GNR_MATRIX, MRSA_CELL, CMP_ORGS, CMP_LVL };
