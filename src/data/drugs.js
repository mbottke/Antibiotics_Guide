/* data · formulary, drug classes/aliases, penetration, toxicity, interactions.
   Inpatient Antibiotic Guide — module graph documented in README.md. */
import { _escRe } from "../lib/util";

/* ===================== DATA: FORMULARY ===================== */
/* Typical adult IV doses, normal renal function, serious infection.          */
const FORMULARY = [
  { cls:"Penicillins", icon:"pill", drugs:[
    { name:"Penicillin G", spec:"natural penicillin", dose:"2–4 million units IV q4h", renal:"Reduce in CrCl <10", pearl:"Streptococci, syphilis, susceptible enterococci. Largely a directed-therapy agent." },
    { name:"Ampicillin", spec:"aminopenicillin", dose:"2 g IV q4–6h", renal:"CrCl 10–50: q6–8h; <10: q12h", pearl:"Enterococcus and Listeria. Synergy with ceftriaxone for E. faecalis endocarditis." },
    { name:"Ampicillin-sulbactam", spec:"+ inhibitor", dose:"3 g IV q6h (high-dose for CRAB: 27 g/day)", renal:"CrCl 15–29: q12h; <15: q24h", pearl:"Adds anaerobes and many Acinetobacter; high-dose forms used as CRAB alternative." },
    { name:"Nafcillin / oxacillin", spec:"antistaphylococcal penicillin", dose:"2 g IV q4h", renal:"No adjustment (hepatic)", pearl:"MSSA. Vesicant, hepatotoxicity, interstitial nephritis — cefazolin often better tolerated." },
    { name:"Piperacillin-tazobactam", spec:"antipseudomonal + inhibitor", dose:"4.5 g IV q6h, or extended infusion q8h", renal:"CrCl 20–40: 3.375 g q6h; <20: 2.25 g q6h", pearl:"Broad incl. Pseudomonas + anaerobes. Inferior to carbapenem for serious ESBL (MERINO). Vanc co-administration raises AKI signal." },
  ]},
  { cls:"Cephalosporins", icon:"pill", drugs:[
    { name:"Cefazolin", spec:"1st generation", dose:"2 g IV q8h", renal:"CrCl 10–34: q12h; <10: q24h", pearl:"MSSA + strep + surgical prophylaxis. Unique side chain — usually safe in penicillin allergy." },
    { name:"Ceftriaxone", spec:"3rd generation", dose:"1–2 g IV q24h (2 g q12h for meningitis)", renal:"No adjustment", pearl:"CAP, pyelonephritis, SBP. No Pseudomonas, anaerobe, or enterococcus. Avoid for AmpC inducers." },
    { name:"Ceftazidime", spec:"3rd gen, antipseudomonal", dose:"2 g IV q8h", renal:"CrCl 30–50: q12h; 10–30: q24h", pearl:"Antipseudomonal, poor Gram-positive cover; supplanted by cefepime. No longer used for S. maltophilia." },
    { name:"Cefepime", spec:"4th generation", dose:"2 g IV q8h (serious GNR / neutropenia)", renal:"CrCl 30–60: q12h; 11–29: q24h", pearl:"Pseudomonas + broad GNR + preferred for moderate-risk AmpC (IDSA 2024). Neurotoxicity if underdosed for renal function." },
    { name:"Ceftaroline", spec:"anti-MRSA cephalosporin", dose:"600 mg IV q8–12h", renal:"CrCl 30–50: 400 mg q12h; 15–30: 300 mg q12h", pearl:"Only β-lactam with MRSA activity; salvage for refractory MRSA bacteremia." },
  ]},
  { cls:"Carbapenems & monobactam", icon:"shield", drugs:[
    { name:"Ertapenem", spec:"carbapenem", dose:"1 g IV q24h", renal:"CrCl <30: 500 mg q24h", pearl:"ESBL workhorse for non-Pseudomonas infection. No Pseudomonas, Acinetobacter, or enterococcus." },
    { name:"Meropenem", spec:"antipseudomonal carbapenem", dose:"1 g IV q8h (2 g q8h for CNS)", renal:"CrCl 26–50: q12h; 10–25: 500 mg q12h", pearl:"Broadest workhorse incl. Pseudomonas + ESBL + anaerobes. Lower seizure risk than imipenem." },
    { name:"Aztreonam", spec:"monobactam", dose:"2 g IV q8h", renal:"CrCl 10–30: 50%; <10: 25%", pearl:"Gram-negative only. Safe in severe penicillin allergy (except prior ceftazidime reaction); pairs with ceftazidime-avibactam for MBL-CRE." },
  ]},
  { cls:"Novel reserve agents (IDSA 2024)", icon:"micro", drugs:[
    { name:"Ceftolozane-tazobactam", spec:"antipseudomonal", dose:"1.5–3 g IV q8h (extended infusion)", renal:"Adjust per CrCl", pearl:"Reserved for DTR-Pseudomonas; active vs ESBL but preserve for Pseudomonas/polymicrobial." },
    { name:"Ceftazidime-avibactam", spec:"KPC / OXA-48", dose:"2.5 g IV q8h (extended infusion)", renal:"Adjust per CrCl", pearl:"KPC and OXA-48 CRE, DTR-Pseudomonas. NOT metallo-β-lactamases — add aztreonam for NDM/VIM." },
    { name:"Meropenem-vaborbactam", spec:"KPC", dose:"4 g IV q8h (extended infusion)", renal:"Adjust per CrCl", pearl:"KPC-producing CRE; vaborbactam does not cover OXA-48 or MBL." },
    { name:"Imipenem-relebactam", spec:"KPC / DTR-Pseudomonas", dose:"1.25 g IV q6h", renal:"Adjust per CrCl", pearl:"KPC-CRE and DTR-Pseudomonas alternative; no MBL or OXA-48 coverage." },
    { name:"Cefiderocol", spec:"siderophore cephalosporin", dose:"2 g IV q8h (extended infusion)", renal:"Adjust per CrCl", pearl:"MBL-CRE, DTR-Pseudomonas, CRAB, S. maltophilia. Trojan-horse iron uptake; true last-line." },
    { name:"Sulbactam-durlobactam", spec:"anti-CRAB (2023)", dose:"1 g/1 g IV q6h (with carbapenem)", renal:"Adjust per CrCl", pearl:"Preferred for CRAB combined with imipenem or meropenem; superior to colistin-based regimens." },
  ]},
  { cls:"Fluoroquinolones", icon:"flask", drugs:[
    { name:"Ciprofloxacin", spec:"fluoroquinolone", dose:"400 mg IV q8–12h / 500–750 mg PO q12h", renal:"CrCl <30: q18–24h", pearl:"Best Gram-negative/Pseudomonas FQ; weak vs S. pneumoniae — not CAP monotherapy." },
    { name:"Levofloxacin", spec:"respiratory FQ", dose:"750 mg IV/PO q24h", renal:"CrCl 20–49: 750 mg q48h; <20: 750 once then 500 q48h", pearl:"CAP + Pseudomonas + S. maltophilia option. Excellent oral bioavailability for IV→PO." },
    { name:"Moxifloxacin", spec:"respiratory FQ", dose:"400 mg IV/PO q24h", renal:"No adjustment", pearl:"Best Gram-positive/anaerobe FQ but NO reliable Pseudomonas and inadequate urinary levels. QT." },
  ]},
  { cls:"Glycopeptide, lipopeptide & oxazolidinone", icon:"syringe", drugs:[
    { name:"Vancomycin (IV)", spec:"glycopeptide", dose:"Load 20–25 mg/kg, then 15–20 mg/kg q8–12h; target AUC/MIC 400–600", renal:"Dose by levels/AUC; extend interval as CrCl falls; HD post-dialysis", pearl:"AUC-guided monitoring lowers nephrotoxicity vs trough-only. Load on actual body weight; never skip the load for renal impairment." },
    { name:"Daptomycin", spec:"lipopeptide", dose:"8–10 mg/kg IV q24h (≥10 for VRE bacteremia)", renal:"CrCl <30 or HD: q48h", pearl:"MRSA/VRE bacteremia. NEVER for pneumonia (surfactant). Weekly CK; hold for myopathy." },
    { name:"Linezolid", spec:"oxazolidinone", dose:"600 mg IV/PO q12h", renal:"No adjustment", pearl:"100% oral bioavailability; pulmonary MRSA + VRE. Cytopenias >14 d, serotonin syndrome with SSRIs, lactic acidosis." },
  ]},
  { cls:"Other agents", icon:"beaker", drugs:[
    { name:"Clindamycin", spec:"lincosamide", dose:"600–900 mg IV q8h", renal:"No adjustment", pearl:"Toxin suppression in necrotizing/toxic-shock. High C. difficile risk; D-test for inducible MRSA resistance." },
    { name:"Metronidazole", spec:"nitroimidazole", dose:"500 mg IV/PO q8h", renal:"No adjustment (reduce in severe hepatic disease)", pearl:"Anaerobes + protozoa. Disulfiram reaction with alcohol; neuropathy with prolonged use." },
    { name:"Trimethoprim-sulfamethoxazole", spec:"folate inhibitor", dose:"8–12 mg/kg/day (TMP) IV/PO div q6–8h (severe)", renal:"CrCl 15–30: 50%; <15: avoid", pearl:"MRSA, S. maltophilia, Nocardia, PJP. Hyperkalemia, AKI, marrow suppression, sulfa allergy." },
    { name:"Doxycycline / minocycline", spec:"tetracycline", dose:"100 mg IV/PO q12h", renal:"No adjustment", pearl:"Atypicals, CA-MRSA SSTI, tick-borne; minocycline for S. maltophilia/CRAB. Photosensitivity." },
    { name:"Azithromycin", spec:"macrolide", dose:"500 mg IV/PO q24h", renal:"No adjustment", pearl:"Atypical coverage in CAP. QT prolongation; pneumococcal macrolide resistance common." },
    { name:"Gentamicin / amikacin", spec:"aminoglycoside", dose:"Gent 5–7 mg/kg IV q24h (extended-interval)", renal:"Interval by levels; avoid/extend in renal impairment", pearl:"GNR synergy. Concentration-dependent killing; nephro/ototoxic — monitor levels." },
    { name:"Polymyxin B / colistin", spec:"polymyxin", dose:"Weight-based; load then maintenance", renal:"Colistin adjusted per CrCl; polymyxin B not", pearl:"Last-resort for CRE/CRAB/DTR-Pseudomonas. Nephrotoxic, neurotoxic; now largely replaced by novel β-lactam agents." },
  ]},
];

/* Canonical drug-identity registry. FORMULARY is the single source of truth for
   which drug names exist; every other drug-keyed structure (RENAL_DOSING,
   WEIGHT_DOSING, HEPATIC_DOSING, HD_DOSING, DRUG_IX, DRUG_ALIASES) must key on a
   name in this set or alias to one. The integrity check enforces this so a
   rename or typo in any one table fails loudly instead of silently de-linking. */
const DRUG_NAMES = new Set(FORMULARY.flatMap(c => c.drugs.map(dr => dr.name)));

/* ===================== DATA: DOSING / TDM / CRRT ===================== */
const RENAL_TRIGGERS = [
  ["Vancomycin","Dose entirely by AUC/levels; interval extends as CrCl falls; HD: redose post-dialysis"],
  ["Cefepime","Reduce/extend < CrCl 60; neurotoxicity from accumulation (myoclonus, encephalopathy, seizures)"],
  ["Piperacillin-tazobactam","Reduce < CrCl 40; extended-infusion preserves time-above-MIC"],
  ["Meropenem","Reduce < CrCl 50; seizure risk if accumulated"],
  ["Aminoglycosides","Extend interval by levels; avoid in evolving AKI"],
  ["TMP-SMX","Halve < CrCl 30; avoid < 15; watch hyperkalemia"],
  ["Levofloxacin / ciprofloxacin","Extend interval < CrCl 30–50"],
  ["No adjustment","Ceftriaxone, nafcillin, metronidazole, clindamycin, linezolid, doxycycline, azithromycin, moxifloxacin"],
];

const TDM = [
  { d:"Vancomycin", t:"AUC/MIC 400–600 (Bayesian or two-level)", note:"AUC-guided over trough-only — lowers nephrotoxicity. Trough 15–20 is a surrogate, now deprecated. Load 20–25 mg/kg on actual body weight." },
  { d:"Aminoglycosides", t:"Extended-interval (peak/MIC) or traditional peak/trough", note:"Concentration-dependent. Extended-interval: high dose, nomogram-timed level. Trough must be low to limit toxicity." },
  { d:"Beta-lactams (severe GNR)", t:"Time above MIC", note:"Extended/continuous infusion optimizes attainment in critical illness, augmented renal clearance, and high-MIC organisms." },
];

/* Drug-name normalization across tabs: FORMULARY name → Spectrum agent name
   (only where they differ). Validated both directions in the integrity suite. */
const DRUG_ALIASES = {
  "Meropenem":"Meropenem / imipenem / doripenem",
  "Ampicillin":"Ampicillin / amoxicillin",
  "Ceftriaxone":"Ceftriaxone / cefotaxime",
  "Linezolid":"Linezolid / tedizolid",
  "Azithromycin":"Azithromycin / clarithromycin",
  "Gentamicin / amikacin":"Gentamicin / tobramycin",
  "Doxycycline / minocycline":"Doxycycline",
  "Polymyxin B / colistin":"Colistin / polymyxin B",
};

const PEN_SITES = [
  {k:"cns",  label:"CNS / CSF",      sub:"inflamed"},
  {k:"lung", label:"Lung / ELF",     sub:""},
  {k:"bone", label:"Bone & joint",   sub:""},
  {k:"ur",   label:"Urine",          sub:""},
  {k:"pros", label:"Prostate",       sub:""},
  {k:"bile", label:"Bile",           sub:""},
  {k:"absc", label:"Abscess",        sub:"low-pH / necrotic"},
  {k:"intra",label:"Intracellular",  sub:""},
  {k:"eye",  label:"Vitreous",       sub:"systemic"},
];

const PEN = [
  {band:"\u03b2-lactams"},
  {ag:"Penicillin / ampicillin", sub:"", c:{cns:"mod",lung:"good",bone:"mod",ur:"good",pros:"poor",bile:"mod",absc:"poor",intra:"poor",eye:"poor"}},
  {ag:"Nafcillin / oxacillin", sub:"MSSA", c:{cns:"mod",lung:"good",bone:"mod",ur:"good",pros:"poor",bile:"good",absc:"poor",intra:"poor",eye:"poor"}},
  {ag:"Cefazolin", sub:"1st gen", c:{cns:"poor",lung:"good",bone:"good",ur:"good",pros:"poor",bile:"mod",absc:"mod",intra:"poor",eye:"poor"}, note:"Does NOT enter CSF \u2014 never for meningitis; excellent bone levels for MSSA osteomyelitis."},
  {ag:"Ceftriaxone", sub:"3rd gen", c:{cns:"good",lung:"good",bone:"mod",ur:"good",pros:"poor",bile:"good",absc:"mod",intra:"poor",eye:"poor"}},
  {ag:"Ceftazidime", sub:"antipseudomonal", c:{cns:"good",lung:"good",bone:"mod",ur:"good",pros:"poor",bile:"mod",absc:"mod",intra:"poor",eye:"mod"}, note:"Intravitreal ceftazidime is the Gram-negative arm of empiric endophthalmitis therapy."},
  {ag:"Cefepime", sub:"4th gen", c:{cns:"good",lung:"good",bone:"mod",ur:"good",pros:"poor",bile:"mod",absc:"mod",intra:"poor",eye:"poor"}},
  {ag:"Piperacillin-tazobactam", sub:"", c:{cns:"poor",lung:"good",bone:"mod",ur:"good",pros:"poor",bile:"good",absc:"mod",intra:"poor",eye:"poor"}},
  {ag:"Meropenem", sub:"antipseudomonal carbapenem", c:{cns:"good",lung:"good",bone:"mod",ur:"good",pros:"poor",bile:"mod",absc:"mod",intra:"poor",eye:"poor"}, note:"CNS dosing is doubled (2 g q8h) \u2014 imipenem avoided in CNS for seizure risk."},
  {ag:"Ertapenem", sub:"no anti-Pseudomonas", c:{cns:"poor",lung:"good",bone:"mod",ur:"good",pros:"poor",bile:"mod",absc:"mod",intra:"poor",eye:"poor"}},
  {ag:"Aztreonam", sub:"monobactam", c:{cns:"good",lung:"good",bone:"mod",ur:"good",pros:"poor",bile:"mod",absc:"mod",intra:"poor",eye:"poor"}},
  {band:"Fluoroquinolones"},
  {ag:"Ciprofloxacin", sub:"", c:{cns:"mod",lung:"good",bone:"good",ur:"good",pros:"good",bile:"good",absc:"good",intra:"good",eye:"mod"}},
  {ag:"Levofloxacin", sub:"respiratory", c:{cns:"mod",lung:"good",bone:"good",ur:"good",pros:"good",bile:"good",absc:"good",intra:"good",eye:"mod"}},
  {ag:"Moxifloxacin", sub:"respiratory", c:{cns:"mod",lung:"good",bone:"good",ur:"poor",pros:"good",bile:"good",absc:"good",intra:"good",eye:"mod"}, note:"Not renally concentrated \u2014 do NOT use for UTI."},
  {band:"Aminoglycosides"},
  {ag:"Gentamicin / tobramycin / amikacin", sub:"", c:{cns:"poor",lung:"poor",bone:"mod",ur:"good",pros:"poor",bile:"poor",absc:"poor",intra:"poor",eye:"mod"}, note:"Poor ELF and inactivated at the low pH/anaerobic milieu of abscess and lung; needs intraventricular dosing for CNS. Intravitreal amikacin used in endophthalmitis."},
  {band:"Tetracyclines"},
  {ag:"Doxycycline", sub:"", c:{cns:"mod",lung:"good",bone:"mod",ur:"poor",pros:"good",bile:"good",absc:"mod",intra:"good",eye:"mod"}},
  {ag:"Tigecycline", sub:"glycylcycline", c:{cns:"poor",lung:"mod",bone:"mod",ur:"poor",pros:"mod",bile:"good",absc:"good",intra:"good",eye:"poor"}, note:"Very high tissue but LOW serum/urine levels \u2014 avoid bacteremia and UTI."},
  {band:"Macrolide / lincosamide"},
  {ag:"Azithromycin", sub:"", c:{cns:"poor",lung:"good",bone:"mod",ur:"poor",pros:"mod",bile:"good",absc:"mod",intra:"good",eye:"poor"}},
  {ag:"Clindamycin", sub:"", c:{cns:"poor",lung:"good",bone:"good",ur:"poor",pros:"mod",bile:"good",absc:"good",intra:"good",eye:"poor"}},
  {band:"Anti-Gram-positive"},
  {ag:"Vancomycin (IV)", sub:"glycopeptide", c:{cns:"mod",lung:"mod",bone:"mod",ur:"good",pros:"poor",bile:"poor",absc:"mod",intra:"poor",eye:"poor"}, note:"Variable ELF and CSF penetration \u2014 high AUC dosing needed for CNS/pneumonia; intravitreal for Gram-positive endophthalmitis."},
  {ag:"Daptomycin", sub:"lipopeptide", c:{cns:"poor",lung:"na",bone:"good",ur:"good",pros:"poor",bile:"poor",absc:"good",intra:"mod",eye:"poor"}, note:"Inactivated by pulmonary surfactant \u2014 NEVER for pneumonia."},
  {ag:"Linezolid", sub:"oxazolidinone", c:{cns:"good",lung:"good",bone:"good",ur:"mod",pros:"good",bile:"mod",absc:"good",intra:"good",eye:"good"}, note:"Outstanding tissue penetration including lung, bone, CNS \u2014 ~100% oral bioavailability."},
  {band:"Other"},
  {ag:"Trimethoprim-sulfamethoxazole", sub:"", c:{cns:"good",lung:"good",bone:"mod",ur:"good",pros:"good",bile:"mod",absc:"mod",intra:"good",eye:"mod"}},
  {ag:"Metronidazole", sub:"", c:{cns:"good",lung:"good",bone:"good",ur:"good",pros:"good",bile:"good",absc:"good",intra:"good",eye:"mod"}, note:"Penetrates virtually all sites including CSF and abscess \u2014 backbone of brain-abscess regimens."},
  {ag:"Rifampin", sub:"ADJUNCT", c:{cns:"good",lung:"good",bone:"good",ur:"good",pros:"good",bile:"good",absc:"good",intra:"good",eye:"good"}, note:"Penetrates biofilm and intracellular compartments \u2014 the reason it is added (never alone) for prosthetic-material staph infection."},
  {ag:"Fosfomycin", sub:"", c:{cns:"mod",lung:"mod",bone:"mod",ur:"good",pros:"mod",bile:"poor",absc:"poor",intra:"poor",eye:"poor"}},
  {ag:"Nitrofurantoin", sub:"urinary only", c:{cns:"na",lung:"na",bone:"na",ur:"good",pros:"poor",bile:"na",absc:"na",intra:"na",eye:"na"}, note:"Concentrates in urine only \u2014 no tissue or serum levels (cystitis only; not pyelonephritis or bacteremia)."},
  {ag:"Colistin / polymyxin B", sub:"last resort", c:{cns:"poor",lung:"poor",bone:"poor",ur:"good",pros:"poor",bile:"poor",absc:"poor",intra:"poor",eye:"poor"}, note:"Poor ELF \u2014 inhaled colistin is used as an adjunct; intraventricular for CNS."},
];

const TOX_COLS = [
  {k:"qt",label:"QT prolongation"},{k:"renal",label:"Nephrotoxicity"},{k:"hep",label:"Hepatotoxicity"},
  {k:"marrow",label:"Marrow / cytopenia"},{k:"neuro",label:"Neuro / seizure"},{k:"tendon",label:"Tendon / MSK"},
  {k:"sero",label:"Serotonergic"},{k:"cdi",label:"C. difficile risk"},{k:"g6pd",label:"G6PD hemolysis"},{k:"sjs",label:"DRESS / SJS"},
];

const SAFE = [
  {band:"\u03b2-lactams"},
  {ag:"Penicillins / aminopenicillins", c:{qt:"",renal:"mod",hep:"lo",marrow:"lo",neuro:"mod",tendon:"",sero:"",cdi:"hi",g6pd:"",sjs:"mod"}, note:"Interstitial nephritis (immune); seizures at high dose in renal failure; type-I allergy is the headline risk."},
  {ag:"Nafcillin / oxacillin", c:{qt:"",renal:"mod",hep:"mod",marrow:"lo",neuro:"",tendon:"",sero:"",cdi:"hi",g6pd:"",sjs:"lo"}, note:"Nafcillin \u2192 hepatotoxicity & phlebitis; oxacillin \u2192 interstitial nephritis."},
  {ag:"Piperacillin-tazobactam", c:{qt:"",renal:"mod",hep:"lo",marrow:"lo",neuro:"",tendon:"",sero:"",cdi:"hi",g6pd:"",sjs:"lo"}, note:"Additive AKI signal with vancomycin (largely creatinine-based, debated); platelet dysfunction at high dose."},
  {ag:"Cephalosporins (most)", c:{qt:"",renal:"lo",hep:"lo",marrow:"lo",neuro:"lo",tendon:"",sero:"",cdi:"hi",g6pd:"",sjs:"mod"}, note:"Ceftriaxone \u2192 biliary sludge/pseudolithiasis, immune hemolysis, kernicterus in neonates (avoid with calcium)."},
  {ag:"Cefepime", c:{qt:"",renal:"lo",hep:"lo",marrow:"lo",neuro:"hi",tendon:"",sero:"",cdi:"hi",g6pd:"",sjs:"lo"}, note:"Cefepime neurotoxicity \u2014 encephalopathy, myoclonus, non-convulsive status \u2014 in renal impairment / underdosed CrCl. Renally dose-adjust."},
  {ag:"Carbapenems", c:{qt:"",renal:"lo",hep:"lo",marrow:"lo",neuro:"hi",tendon:"",sero:"",cdi:"hi",g6pd:"",sjs:"lo"}, note:"Imipenem lowers the seizure threshold most (avoid in CNS infection / renal failure); meropenem safer. Lowers valproate levels."},
  {ag:"Aztreonam", c:{qt:"",renal:"lo",hep:"lo",marrow:"lo",neuro:"",tendon:"",sero:"",cdi:"mod",g6pd:"",sjs:"lo"}, note:"Very low toxicity; no cross-reactivity with penicillins (except ceftazidime shares a side chain)."},
  {band:"Anti-Gram-positive"},
  {ag:"Vancomycin (IV)", c:{qt:"",renal:"hi",hep:"",marrow:"lo",neuro:"",tendon:"",sero:"",cdi:"",g6pd:"",sjs:"mod"}, note:"Dose-related nephrotoxicity (worse with pip-tazo / aminoglycosides); infusion reaction (rate-related, not allergy); DRESS; prolonged-use neutropenia. Monitor AUC."},
  {ag:"Daptomycin", c:{qt:"",renal:"",hep:"",marrow:"",neuro:"mod",tendon:"hi",sero:"",cdi:"",g6pd:"",sjs:""}, note:"CPK elevation / myopathy \u2014 check CPK weekly, hold statins; rare eosinophilic pneumonia; peripheral neuropathy."},
  {ag:"Linezolid / tedizolid", c:{qt:"",renal:"",hep:"lo",marrow:"hi",neuro:"hi",tendon:"",sero:"hi",cdi:"",g6pd:"",sjs:""}, note:"Thrombocytopenia/anemia beyond ~14 days (weekly CBC); peripheral & optic neuropathy with prolonged use; reversible MAO inhibition \u2192 serotonin syndrome and tyramine reactions; lactic acidosis."},
  {band:"Aminoglycosides"},
  {ag:"Gentamicin / tobramycin / amikacin", c:{qt:"",renal:"hi",hep:"",marrow:"",neuro:"mod",tendon:"",sero:"",cdi:"",g6pd:"",sjs:""}, note:"Nephrotoxicity (usually reversible) and OTOtoxicity (vestibular/cochlear, often irreversible \u2014 the dose-limiting harm); neuromuscular blockade. Monitor levels & renal function."},
  {band:"Fluoroquinolones"},
  {ag:"Ciprofloxacin / levofloxacin / moxifloxacin", c:{qt:"hi",renal:"lo",hep:"mod",marrow:"",neuro:"hi",tendon:"hi",sero:"",cdi:"hi",g6pd:"mod",sjs:"mod"}, note:"Class boxed warnings: tendinitis/rupture, peripheral neuropathy, CNS effects (delirium, seizure), aortic aneurysm/dissection; QT (moxi > levo > cipro); dysglycemia; high CDI risk. Reserve when alternatives exist."},
  {band:"Other agents"},
  {ag:"Macrolides (azithro / clarithro)", c:{qt:"hi",renal:"",hep:"mod",marrow:"",neuro:"",tendon:"",sero:"",cdi:"mod",g6pd:"",sjs:""}, note:"QT prolongation; clarithromycin is a strong CYP3A4 inhibitor (statin, calcineurin-inhibitor, DOAC interactions); pyloric stenosis in neonates."},
  {ag:"Clindamycin", c:{qt:"",renal:"",hep:"lo",marrow:"",neuro:"",tendon:"",sero:"",cdi:"hi",g6pd:"",sjs:"lo"}, note:"Among the highest C. difficile risk per course; common GI."},
  {ag:"Trimethoprim-sulfamethoxazole", c:{qt:"",renal:"mod",hep:"mod",marrow:"mod",neuro:"",tendon:"",sero:"",cdi:"mod",g6pd:"hi",sjs:"hi"}, note:"Hyperkalemia + (pseudo-)creatinine rise; cytopenias/megaloblastic; the classic DRESS/SJS-TEN agent; hemolysis in G6PD deficiency; potentiates warfarin, sulfonylureas, methotrexate."},
  {ag:"Doxycycline / tetracyclines", c:{qt:"",renal:"",hep:"lo",marrow:"",neuro:"",tendon:"",sero:"",cdi:"lo",g6pd:"",sjs:"lo"}, note:"Photosensitivity, pill esophagitis, GI; dental staining/skeletal effects in young children & pregnancy (doxycycline short courses now considered acceptable for rickettsial disease)."},
  {ag:"Tigecycline", c:{qt:"",renal:"",hep:"mod",marrow:"",neuro:"",tendon:"",sero:"",cdi:"",g6pd:"",sjs:""}, note:"Severe nausea/vomiting; pancreatitis; FDA all-cause mortality warning \u2014 avoid in bacteremia."},
  {ag:"Metronidazole", c:{qt:"",renal:"",hep:"lo",marrow:"",neuro:"hi",tendon:"",sero:"",cdi:"",g6pd:"",sjs:""}, note:"Cumulative peripheral neuropathy and (rare) encephalopathy/cerebellar toxicity with prolonged use; disulfiram-like reaction with alcohol; metallic taste."},
  {ag:"Rifampin (adjunct)", c:{qt:"",renal:"lo",hep:"hi",marrow:"lo",neuro:"",tendon:"",sero:"",cdi:"",g6pd:"",sjs:"lo"}, note:"Hepatotoxicity; orange body fluids; potent CYP inducer (huge interaction list \u2014 see below); flu-like syndrome and thrombocytopenia with intermittent dosing."},
  {ag:"Nitrofurantoin", c:{qt:"",renal:"",hep:"mod",marrow:"",neuro:"mod",tendon:"",sero:"",cdi:"",g6pd:"hi",sjs:""}, note:"Acute (hypersensitivity) and chronic pulmonary fibrosis; peripheral neuropathy (avoid CrCl < 30); hemolysis in G6PD deficiency; hepatotoxicity."},
  {ag:"Colistin / polymyxin B", c:{qt:"",renal:"hi",hep:"",marrow:"",neuro:"mod",tendon:"",sero:"",cdi:"",g6pd:"",sjs:""}, note:"Dose-limiting nephrotoxicity; neuromuscular blockade/paresthesias."},
  {ag:"Chloramphenicol", c:{qt:"",renal:"",hep:"",marrow:"hi",neuro:"",tendon:"",sero:"",cdi:"",g6pd:"mod",sjs:""}, note:"Idiosyncratic aplastic anemia and dose-related marrow suppression; gray-baby syndrome \u2014 a reserve agent."},
];

const INTERACTIONS = [
  {h:"Rifampin \u2014 potent CYP3A4/2C/P-gp inducer", b:"Drops levels of warfarin and DOACs, azole antifungals, calcineurin inhibitors (tacrolimus/cyclosporine), oral contraceptives, many antiretrovirals/HCV agents, methadone, and corticosteroids. Anticipate failure of co-therapy; never give as monotherapy.", ic:"FlaskConical"},
  {h:"Linezolid + serotonergics", b:"Reversible MAO inhibition \u2192 serotonin syndrome with SSRIs/SNRIs, TCAs, tramadol, meperidine, triptans, and methylene blue. Screen the med list before starting; observe a washout where feasible.", ic:"Brain"},
  {h:"QT stacking", b:"Fluoroquinolones (moxi > levo > cipro) and macrolides add to azoles, ondansetron, methadone, antipsychotics, and antiarrhythmics. Check a baseline ECG, electrolytes (K\u207a/Mg\u00b2\u207a), and avoid combining QT-prolonging agents in at-risk patients.", ic:"HeartPulse"},
  {h:"Warfarin potentiation", b:"TMP-SMX, metronidazole, fluconazole, and macrolides raise the INR (CYP2C9 inhibition + flora disruption). Increase INR monitoring; pre-empt dose reduction with TMP-SMX and metronidazole.", ic:"Droplets"},
  {h:"Di-/trivalent cation chelation", b:"Fluoroquinolones and tetracyclines bind Ca, Mg, Al, Fe, zinc, sucralfate, and dairy \u2192 markedly reduced oral absorption. Separate dosing by 2\u20134 h (give the antibiotic first), or use the IV route.", ic:"X"},
  {h:"TMP-SMX metabolic interactions", b:"Hyperkalemia with ACEi/ARB/spironolactone; hypoglycemia with sulfonylureas; methotrexate toxicity (additive antifolate); warfarin potentiation. High-risk in the elderly with renal impairment.", ic:"Beaker"},
];

const PEN_SITE_LABEL = Object.fromEntries(PEN_SITES.map(s => [s.k, s.label]));

const TOX_LABEL = Object.fromEntries(TOX_COLS.map(c => [c.k, c.label]));

const FORM_FLAT = FORMULARY.flatMap(c => c.drugs.map(dr => dr.name));

/* ============================================================================
   B3 · EMPIRIC AUTO-ASSEMBLY — context-driven regimen refinement
   Takes the assembled regimen (core + triggered add-ons) and applies the
   transformations a clinician would otherwise do by hand: substitute around a
   β-lactam allergy, de-escalate a nephrotoxic pairing, and strip redundant
   double coverage. Every step is conservative, carries succinct reasoning and a
   citation, and is rendered as a reviewable decision trail. The engine never
   silently rewrites — eliminations and substitutions are shown with their why.

   AGENT_RX: the antibacterial-property registry the rules reason over. `bl` is
   the β-lactam flag; aztreonam is deliberately bl:false (no penicillin cross-
   reactivity — the one safe β-lactam-class agent in severe allergy). `ana` =
   reliable anaerobic coverage; `apsa` = antipseudomonal; `mrsa` = anti-MRSA. */
const AGENT_RX = [
  { rx:/piperacillin-tazobactam|pip-?tazo|zosyn/i,            canon:"Piperacillin-tazobactam", bl:true,  ana:true,  apsa:true },
  { rx:/ampicillin-sulbactam|unasyn/i,                        canon:"Ampicillin-sulbactam",    bl:true,  ana:true },
  { rx:/amoxicillin-clavulanate|amox-?clav|augmentin/i,       canon:"Amoxicillin-clavulanate", bl:true,  ana:true },
  { rx:/\bmeropenem\b|\bimipenem\b|\bdoripenem\b/i,           canon:"Meropenem",               bl:true,  ana:true,  apsa:true },
  { rx:/\bertapenem\b/i,                                      canon:"Ertapenem",               bl:true,  ana:true },
  { rx:/cefepime/i,                                           canon:"Cefepime",                bl:true,  apsa:true },
  { rx:/ceftazidime(?!-)/i,                                   canon:"Ceftazidime",             bl:true,  apsa:true },
  { rx:/ceftriaxone|cefotaxime/i,                             canon:"Ceftriaxone",             bl:true },
  { rx:/cefazolin/i,                                          canon:"Cefazolin",               bl:true },
  { rx:/\bnafcillin\b|\boxacillin\b/i,                        canon:"Nafcillin / oxacillin",   bl:true },
  { rx:/\bampicillin\b(?!-)/i,                                canon:"Ampicillin",              bl:true },
  { rx:/penicillin\s*g|\bpenicillin\b/i,                      canon:"Penicillin G",            bl:true },
  { rx:/aztreonam/i,                                          canon:"Aztreonam",               bl:false, apsa:true }, // safe in severe β-lactam allergy
  { rx:/metronidazole|flagyl/i,                               canon:"Metronidazole",           ana:true },
  { rx:/vancomycin/i,                                         canon:"Vancomycin (IV)",         mrsa:true },
  { rx:/daptomycin/i,                                         canon:"Daptomycin",              mrsa:true },
  { rx:/linezolid|tedizolid/i,                                canon:"Linezolid / tedizolid",   mrsa:true },
  { rx:/moxifloxacin/i,                                       canon:"Moxifloxacin",            ana:true },
  { rx:/levofloxacin/i,                                       canon:"Levofloxacin",            apsa:true },
  { rx:/ciprofloxacin/i,                                      canon:"Ciprofloxacin",           apsa:true },
];

/* ============================================================================
   v3 · HIGH-YIELD INTERACTION LAYER (Tier 0 per-drug + Tier 1 regimen pair-scan)
   Deliberately bounded: the inpatient antibacterial interactions that actually
   cause harm — not a comprehensive checker. Two consumers share one dataset:
     • Tier 0 — DRUG_IX by agent → a flag on the DrugCard.
     • Tier 1 — within-regimen pair scan + host-factor cautions → RegimenCard.
   Honest framing in the UI: "high-yield interactions / screening aid," never
   "complete." Pharmacy review and a full checker remain the source of truth.

   Each record:
     agents:  canonical formulary names it applies to (resolved via regimenAgents)
     tag:     short mechanism label
     sev:     "major" | "moderate"
     with:    what it interacts with (free text — drugs or a mechanism class)
     mech:    one-line mechanism + management
     pairKey: optional — agents sharing the same pairKey form a regimen-pair flag
              (e.g., two QT-prolongers, two nephrotoxins)
     host:    optional — a patient-side co-factor that should prompt review even
              without a second antibacterial in the regimen
   ========================================================================== */
const DRUG_IX = [
  { agents:["Linezolid"], tag:"Serotonergic", sev:"major",
    with:"SSRIs/SNRIs, MAOIs, tramadol, methylene blue",
    mech:"Reversible MAO inhibition → serotonin syndrome. Avoid the combination or hold the serotonergic agent; if unavoidable, monitor closely and limit duration.",
    host:"serotonergic" },
  { agents:["Linezolid"], tag:"Myelosuppression", sev:"moderate",
    with:"duration >14 d, baseline cytopenias, other marrow suppressants",
    mech:"Dose- and duration-dependent thrombocytopenia/anemia. Check CBC weekly; reassess need beyond 14 days." },
  { agents:["Ciprofloxacin","Levofloxacin","Moxifloxacin"], tag:"QT prolongation", sev:"moderate",
    with:"azoles, macrolides, ondansetron, antipsychotics, methadone",
    mech:"Additive QT prolongation → torsades risk. Avoid stacking QT agents; correct K⁺/Mg²⁺; ECG if multiple risk factors.",
    pairKey:"qt", host:"qt" },
  { agents:["Azithromycin"], tag:"QT prolongation", sev:"moderate",
    with:"fluoroquinolones, antipsychotics, methadone, ondansetron",
    mech:"Additive QT prolongation. Avoid stacking; correct electrolytes; ECG if multiple risk factors.",
    pairKey:"qt", host:"qt" },
  { agents:["Ciprofloxacin"], tag:"CYP1A2 inhibitor", sev:"moderate",
    with:"theophylline, tizanidine, caffeine, clozapine",
    mech:"Ciprofloxacin inhibits CYP1A2 — tizanidine is contraindicated; theophylline/clozapine levels rise." },
  { agents:["Rifampin"], tag:"CYP3A inducer", sev:"major",
    with:"DOACs, warfarin, azoles, many antiretrovirals, tacrolimus, oral contraceptives, methadone",
    mech:"Potent CYP3A4/P-gp induction lowers levels of a wide range of co-meds. Review the full med list before starting; choose non-inducing alternatives where possible.",
    host:"cyp3a" },
  { agents:["Trimethoprim-sulfamethoxazole"], tag:"Warfarin / INR", sev:"major",
    with:"warfarin",
    mech:"Inhibits CYP2C9 and displaces warfarin → marked INR rise/bleeding. Anticipate dose reduction and check INR within a few days." },
  { agents:["Trimethoprim-sulfamethoxazole"], tag:"Hyperkalemia", sev:"moderate",
    with:"ACEi/ARB, spironolactone, K⁺ supplements",
    mech:"Trimethoprim blocks the distal tubule ENaC (amiloride-like) → hyperkalemia, especially with other K⁺-raising agents or renal impairment. Monitor K⁺.",
    pairKey:"hyperK", host:"hyperK" },
  { agents:["Trimethoprim-sulfamethoxazole"], tag:"Sulfonylurea / glucose", sev:"moderate",
    with:"sulfonylureas, methotrexate",
    mech:"Potentiates sulfonylureas (hypoglycemia) and methotrexate toxicity (additive antifolate). Monitor glucose; avoid with high-dose methotrexate." },
  { agents:["Metronidazole"], tag:"Warfarin / INR", sev:"major",
    with:"warfarin",
    mech:"Inhibits warfarin metabolism → INR rise. Monitor INR; anticipate dose reduction." },
  { agents:["Metronidazole"], tag:"Disulfiram reaction", sev:"moderate",
    with:"alcohol, alcohol-containing solutions",
    mech:"Disulfiram-like reaction with ethanol — counsel abstinence during and 3 days after therapy." },
  { agents:["Vancomycin (IV)"], tag:"Nephrotoxicity", sev:"moderate",
    with:"piperacillin-tazobactam, aminoglycosides, IV contrast, NSAIDs",
    mech:"Additive nephrotoxicity — the vancomycin + piperacillin-tazobactam combination raises AKI rates. Monitor renal function; weigh cefepime/meropenem as the β-lactam partner.",
    pairKey:"nephro", host:"nephro" },
  { agents:["Gentamicin / amikacin"], tag:"Nephro/ototoxicity", sev:"major",
    with:"vancomycin, loop diuretics, IV contrast, other nephrotoxins",
    mech:"Additive nephro- and ototoxicity. Use shortest course, level-guided dosing; avoid stacking nephrotoxins.",
    pairKey:"nephro", host:"nephro" },
  { agents:["Daptomycin"], tag:"Myopathy / statin", sev:"moderate",
    with:"statins",
    mech:"Additive CK rise/rhabdomyolysis risk. Check CK weekly; consider holding the statin during therapy." },
];

/* ============================================================================
   v3 · CLASS POPOVERS — class-as-stand-in → preferred specific agents
   Where a regimen names a drug class ("antipseudomonal β-lactam") instead of a
   specific agent, the phrase becomes an interactive chip: hover, click, or
   keyboard-open a bubble of preferred agents ranked by role, each opening its
   monograph. Applied to rx (regimen) lines only — not the explanatory notes.
   ========================================================================== */
const DRUG_CLASSES = {
  "antipseudomonal β-lactam": { title:"Antipseudomonal β-lactam",
    blurb:"The antipseudomonal backbone — choose by the local Pseudomonas antibiogram and resistance risk.",
    agents:[
      ["Piperacillin-tazobactam","preferred","Broadest workhorse; adds anaerobic cover. Avoid for known ESBL (MERINO)."],
      ["Cefepime","preferred","Stable to AmpC; pair with metronidazole when anaerobic cover is needed."],
      ["Meropenem / imipenem / doripenem","reserve","For ESBL or critical illness — carbapenem-sparing otherwise."],
      ["Ceftazidime","alternative","Antipseudomonal but poor Gram-positive cover; usually combined."],
    ] },
  "antipseudomonal carbapenem": { title:"Antipseudomonal carbapenem",
    blurb:"Carbapenems with antipseudomonal activity — first-line for serious ESBL infection.",
    agents:[
      ["Meropenem / imipenem / doripenem","preferred","First-line for serious ESBL infection; meropenem has the best CNS profile."],
      ["Imipenem-relebactam","reserve","Adds KPC-CRE and DTR-Pseudomonas — reserve agent."],
    ] },
  "carbapenem": { title:"Carbapenem",
    blurb:"Choose by whether antipseudomonal cover is required.",
    agents:[
      ["Ertapenem","preferred","Once-daily ESBL workhorse; NO Pseudomonas or Acinetobacter cover."],
      ["Meropenem / imipenem / doripenem","preferred","Antipseudomonal; meropenem preferred for CNS infection."],
    ] },
  "respiratory fluoroquinolone": { title:"Respiratory fluoroquinolone",
    blurb:"Fluoroquinolones with reliable pneumococcal activity for CAP and atypicals.",
    agents:[
      ["Levofloxacin","preferred","Pneumococcus + atypicals + Pseudomonas; ~99% oral bioavailability."],
      ["Moxifloxacin","preferred","Best Gram-positive / anaerobe FQ; NO reliable Pseudomonas and inadequate urinary levels."],
    ] },
  "respiratory fq": { alias:"respiratory fluoroquinolone" },
  "antipseudomonal fluoroquinolone": { title:"Antipseudomonal fluoroquinolone",
    blurb:"Fluoroquinolones with reliable Pseudomonas activity — a second Gram-negative agent.",
    agents:[
      ["Ciprofloxacin","preferred","Best Gram-negative / Pseudomonas FQ; weak against pneumococcus."],
      ["Levofloxacin","preferred","Antipseudomonal and respiratory; ~99% oral bioavailability."],
    ] },
  "antipseudomonal fq": { alias:"antipseudomonal fluoroquinolone" },
  "fluoroquinolone": { title:"Fluoroquinolone",
    blurb:"Match the agent to the target organism and site.",
    agents:[
      ["Ciprofloxacin","preferred","Best Gram-negative / Pseudomonas FQ; weak against pneumococcus."],
      ["Levofloxacin","preferred","Respiratory + Pseudomonas + S. maltophilia."],
      ["Moxifloxacin","alternative","Best Gram-positive / anaerobe; no Pseudomonas, poor urinary levels."],
    ] },
  "antistaphylococcal penicillin": { title:"Antistaphylococcal penicillin",
    blurb:"β-lactams of choice for MSSA — superior to vancomycin for susceptible isolates.",
    agents:[
      ["Nafcillin / oxacillin","preferred","Drug of choice for MSSA bacteraemia and endocarditis."],
      ["Cefazolin","preferred","Equivalent for MSSA; better tolerated, convenient dosing, usually safe in penicillin allergy."],
    ] },
  "anti-mrsa agent": { title:"Anti-MRSA agent",
    blurb:"Choose by site — lung penetration, endovascular activity, and toxicity differ.",
    agents:[
      ["Vancomycin (IV)","preferred","Workhorse across sites; target AUC/MIC 400–600."],
      ["Daptomycin","preferred","Bacteraemia / endocarditis / bone; NOT pneumonia (surfactant inactivation)."],
      ["Linezolid","preferred","Best for MRSA pneumonia; bacteriostatic — not for endovascular infection."],
      ["Ceftaroline","alternative","Only β-lactam with MRSA activity; salvage for refractory bacteraemia."],
    ] },
  "anti-mrsa cover": { alias:"anti-mrsa agent" },
  "glycopeptide": { title:"Glycopeptide",
    blurb:"Vancomycin is the workhorse; long-acting lipoglycopeptides enable single-dose regimens.",
    agents:[
      ["Vancomycin (IV)","preferred","AUC-guided MRSA workhorse."],
      ["Lipoglycopeptides","alternative","Dalbavancin / oritavancin — single- or two-dose ABSSSI options."],
    ] },
  "third-generation cephalosporin": { title:"Third-generation cephalosporin",
    blurb:"Workhorse for community Gram-negatives, pneumococcus, and meningitis (with vancomycin).",
    agents:[
      ["Ceftriaxone / cefotaxime","preferred","Once-daily; covers pneumococcus, Enterobacterales, and Neisseria."],
      ["Ceftazidime","alternative","Antipseudomonal 3rd-generation but poor Gram-positive cover."],
    ] },
  "aminoglycoside": { title:"Aminoglycoside",
    blurb:"Synergy or a second Gram-negative agent; concentration-dependent, once-daily dosing.",
    agents:[
      ["Gentamicin / tobramycin","preferred","Gram-positive synergy; tobramycin slightly better against Pseudomonas."],
      ["Amikacin","alternative","Broadest — most stable to modifying enzymes (many ESBL / AmpC)."],
    ] },
  "macrolide": { title:"Macrolide",
    blurb:"Atypical coverage in CAP, paired with a β-lactam.",
    agents:[
      ["Azithromycin","preferred","Atypical coverage, once-daily IV/PO. Pneumococcal macrolide resistance is common — not monotherapy."],
    ] },
  "second gnr agent": { title:"Second Gram-negative agent",
    blurb:"The second antipseudomonal agent for double cover in severe disease — use a different class than the β-lactam.",
    agents:[
      ["Gentamicin / tobramycin","preferred","The usual second agent; synergy and broadened empiric cover."],
      ["Ciprofloxacin","alternative","Best oral antipseudomonal FQ; rising resistance — confirm susceptibility."],
      ["Amikacin","alternative","When aminoglycoside resistance is a concern."],
    ] },
  "antipseudomonal agent": { alias:"second gnr agent" },
};

const RANK_LAB = { preferred:"Preferred", alternative:"Alt", reserve:"Reserve" };

const CLASS_KEYS = Object.keys(DRUG_CLASSES).sort((a,b) => b.length - a.length);

const RX_TOKEN = new RegExp("(\\*\\*(.+?)\\*\\*)|((?:" + CLASS_KEYS.map(_escRe).join("|") + ")s?)", "gi");

export { FORMULARY, DRUG_NAMES, FORM_FLAT, DRUG_ALIASES, DRUG_CLASSES, RANK_LAB, CLASS_KEYS, RX_TOKEN, AGENT_RX, PEN_SITES, PEN, PEN_SITE_LABEL, TOX_COLS, SAFE, TOX_LABEL, RENAL_TRIGGERS, TDM, INTERACTIONS, DRUG_IX };
