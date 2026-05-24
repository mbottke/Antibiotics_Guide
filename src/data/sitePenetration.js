/* data · sitePenetration — Phase L site-specific drug penetration
   matrix. Surfaces which drugs reach which compartments well enough
   to treat — informs oral step-down decisions, choice between
   agents for sequestered sites (CNS, bone, abscess, prostate),
   and dose intensification (extended infusion).

   The clinical contract: a single bedside surface that answers
   "does this drug get to the site I'm treating?" without requiring
   the clinician to recall multi-tabbed PK tables.

   SHAPE
   -----
   SITE_PENETRATION[site] = {
     site: "string — anatomic compartment",
     description: "string — context",
     drugs: [
       { agent:    "string",
         penetration: "excellent" | "good" | "modest" | "poor",
         note:     "string — pharmacokinetic / dosing implication",
       },
     ],
     pearls: ["string — bedside pearl"],
     syndromes: ["syndrome-id"],
   };

   USAGE
   -----
     import { SITE_PENETRATION, getPenetrationForSyndrome } from "./sitePenetration.js";
     const entries = getPenetrationForSyndrome(syndromeId);

   Inpatient Antibiotic Guide — module graph documented in README.md. */

const SITE_PENETRATION = [
  {
    site: "CNS (CSF)",
    description: "Crosses blood-brain + blood-CSF barriers; inflamed meninges enhance penetration vs intact",
    drugs: [
      { agent: "Ceftriaxone", penetration: "excellent", note: "Standard meningitis dose 2 g IV q12h achieves bactericidal CSF concentrations" },
      { agent: "Cefepime", penetration: "excellent", note: "150 mg/kg/d divided q8h for CNS dosing" },
      { agent: "Meropenem", penetration: "excellent", note: "2 g IV q8h CNS dose; ESBL + Pseudomonas CNS coverage" },
      { agent: "Vancomycin", penetration: "modest", note: "AUC-targeted; CSF / serum ratio ~10-30% inflamed meninges; intraventricular for refractory" },
      { agent: "Ampicillin", penetration: "excellent", note: "Listeria meningitis 2 g IV q4h — cephalosporins inactive against Listeria" },
      { agent: "Metronidazole", penetration: "excellent", note: "Brain abscess + subdural empyema anaerobic coverage" },
      { agent: "TMP-SMX", penetration: "good", note: "Nocardia + Listeria + PJP CNS disease; high-dose for nocardia" },
      { agent: "Linezolid", penetration: "good", note: "Excellent oral bioavailability; PCN-allergic alternative for nocardia + MRSA CNS salvage" },
      { agent: "Daptomycin", penetration: "poor", note: "Do NOT use for meningitis or CNS infection — does not penetrate" },
      { agent: "Aminoglycosides", penetration: "poor", note: "Systemic monotherapy ineffective for CNS; intraventricular use only" },
      { agent: "First-gen cephalosporins (cefazolin, cephalexin)", penetration: "poor", note: "Do NOT cross BBB; inappropriate for meningitis or CNS" },
    ],
    pearls: [
      "Inflammation enhances penetration — early meningitis 2-3x higher CSF levels than late or treated",
      "Steroids decrease BBB inflammation + may reduce subsequent antibiotic penetration (controversial)",
      "Intraventricular antibiotics for refractory ventriculitis — IDSA 2017",
    ],
    syndromes: ["meningitis", "brainabscess", "epidural", "subdural-empyema", "cavernous-thromb", "ventriculitis", "shunt-infection", "post-nsx-meningitis", "neuro-lyme-syphilis", "listeria", "nocardia"],
  },
  {
    site: "Bone + joint",
    description: "Trabecular bone + cortical bone penetration; synovial fluid + biofilm-resistant",
    drugs: [
      { agent: "Clindamycin", penetration: "excellent", note: "Bone:serum ratio > 40%; oral step-down for osteomyelitis" },
      { agent: "Linezolid", penetration: "excellent", note: "Bone:serum > 60%; oral bioavailability ~100%; OVIVA-supported" },
      { agent: "TMP-SMX", penetration: "good", note: "Bone:serum 25-40%; oral step-down for MSSA / MRSA osteo" },
      { agent: "Fluoroquinolones (cipro/levo/moxi)", penetration: "good", note: "Bone:serum > 40%; oral step-down for GNR osteo" },
      { agent: "Rifampin", penetration: "excellent", note: "Biofilm penetration — central to retained-hardware staph; NEVER monotherapy" },
      { agent: "Cefazolin / nafcillin", penetration: "modest", note: "Bone:serum 10-20%; effective at standard IV dose × 6 wk for MSSA" },
      { agent: "Vancomycin", penetration: "modest", note: "Bone:serum 15-30%; effective at AUC-targeted dose × 6 wk for MRSA" },
      { agent: "Daptomycin", penetration: "good", note: "Bone penetration adequate; CK monitoring; alternative for vanco-failure MRSA osteo" },
    ],
    pearls: [
      "OVIVA NEJM 2019: oral non-inferior to IV at 1-y treatment failure for bone + joint infection",
      "Rifampin is mandatory for retained-hardware staph PJI (Zimmerli 1998)",
      "Debridement of dead bone is mandatory — antibiotics alone fail in chronic osteo",
    ],
    syndromes: ["osteo", "vertosteo", "pji", "septic-arthritis", "dfi", "epidural"],
  },
  {
    site: "Lung (epithelial lining fluid)",
    description: "ELF / alveolar macrophages; pulmonary parenchyma + airway secretions",
    drugs: [
      { agent: "Macrolides (azithro, clarithro)", penetration: "excellent", note: "Intracellular concentration > 30x serum; atypical pneumonia + macrophage uptake" },
      { agent: "Fluoroquinolones (levo, moxi)", penetration: "excellent", note: "ELF:serum > 50%; oral CAP first-line" },
      { agent: "Linezolid", penetration: "excellent", note: "ELF:serum > 100%; MRSA pneumonia equivalent to vanco" },
      { agent: "Tetracyclines (doxy)", penetration: "good", note: "ELF:serum > 50%; atypical CAP" },
      { agent: "Ceftriaxone / cefepime", penetration: "good", note: "Standard β-lactam CAP/HAP coverage; extended infusion improves PK/PD" },
      { agent: "Vancomycin", penetration: "modest", note: "ELF:serum ~20-30%; AUC-targeted for MRSA pneumonia; some prefer linezolid" },
      { agent: "Aminoglycosides", penetration: "poor", note: "ELF:serum < 10%; inhaled tobi/colistin for adjunct in MDR Pseudomonas" },
    ],
    pearls: [
      "Inhaled antibiotics (tobramycin, colistin, aztreonam) for adjunct in MDR Pseudomonas + bronchiectasis",
      "Extended-infusion β-lactam improves PK/PD in critically-ill HAP/VAP (DALI 2014)",
      "ELF penetration ≠ clinical efficacy — Postma 2015 showed β-lactam alone non-inferior despite lower atypical coverage",
    ],
    syndromes: ["cap", "hap", "vat", "aspiration", "empyema", "copd", "bronchiectasis", "neutropenic-pna", "tracheobronchitis", "zoonotic-pna", "postobstructive"],
  },
  {
    site: "Urine / urinary tract",
    description: "Renal excretion concentrates urinary levels; bladder vs upper tract penetration differs",
    drugs: [
      { agent: "Nitrofurantoin", penetration: "excellent (urine only)", note: "Concentrates in urine; NOT for upper-tract pyelonephritis or bacteremia" },
      { agent: "Fosfomycin", penetration: "excellent", note: "Single dose 3 g sachet for uncomplicated cystitis; concentrates in urine" },
      { agent: "Fluoroquinolones (cipro, levo)", penetration: "excellent", note: "Bladder + upper tract + prostate; standard pyelo treatment" },
      { agent: "Ceftriaxone / cefepime", penetration: "good", note: "Pyelonephritis + complicated UTI; renal excretion" },
      { agent: "TMP-SMX", penetration: "excellent", note: "Bladder + upper tract; standard short-course cystitis (3 d) + pyelo (7-14 d)" },
      { agent: "Carbapenems", penetration: "good", note: "ESBL pyelonephritis; renal-adjusted dosing" },
      { agent: "Aminoglycosides", penetration: "good", note: "Urinary concentration high; nephrotoxicity limits long-course use" },
    ],
    pearls: [
      "Nitrofurantoin contraindicated in CrCl < 30 — won't achieve urinary levels + risks neuropathy",
      "Bladder-only agents (nitrofurantoin, fosfomycin) inadequate for pyelo or bacteremia",
      "Asymptomatic bacteriuria: do NOT treat outside pregnancy + pre-urologic instrumentation (IDSA 2019)",
    ],
    syndromes: ["cystitis", "pyelo", "urosepsis", "cauti", "transplant-uti", "asymp-bact", "renalabscess", "emphysematous-uti"],
  },
  {
    site: "Prostate",
    description: "Lipophilic agent + ion-trapping concentrates in alkaline prostate fluid; standard agents penetrate poorly",
    drugs: [
      { agent: "Fluoroquinolones (cipro, levo)", penetration: "excellent", note: "Prostate:serum > 100%; ion-trapping in alkaline prostatic fluid" },
      { agent: "TMP-SMX", penetration: "excellent", note: "Standard 6-wk treatment for chronic bacterial prostatitis" },
      { agent: "Tetracyclines (doxy, minocycline)", penetration: "good", note: "Acceptable for chronic prostatitis when FQ resistant" },
      { agent: "Macrolides (azithro)", penetration: "good", note: "Limited use due to spectrum" },
      { agent: "Aminoglycosides", penetration: "poor", note: "Poor prostate penetration; not first-line" },
      { agent: "β-lactams (most)", penetration: "poor", note: "Most β-lactams poor prostatic penetration except ceftaroline; ceftriaxone acceptable for acute prostatitis with normal prostate" },
    ],
    pearls: [
      "Chronic prostatitis 6 wk minimum; FQ or TMP-SMX based on local resistance",
      "Acute prostatitis: inflamed prostate allows β-lactam penetration; chronic requires lipophilic agent",
    ],
    syndromes: ["prostatitis", "epididymo", "urosepsis"],
  },
  {
    site: "Abscess + biofilm",
    description: "Sequestered + low-pH + low-oxygen environments resist multiple drug classes",
    drugs: [
      { agent: "Metronidazole", penetration: "excellent", note: "Activates only in anaerobic environment; ideal for anaerobic abscess" },
      { agent: "Clindamycin", penetration: "excellent", note: "Good abscess penetration + anaerobic coverage" },
      { agent: "Rifampin", penetration: "excellent", note: "Biofilm penetration — central to staph PJI + retained hardware (NEVER alone)" },
      { agent: "Fluoroquinolones", penetration: "good", note: "Decent abscess penetration; bone + joint + retained hardware combinations" },
      { agent: "Vancomycin", penetration: "modest", note: "Slow diffusion into large abscess; drainage critical" },
      { agent: "Aminoglycosides", penetration: "poor", note: "Inactivated in low-pH + low-oxygen abscess; drainage required for efficacy" },
      { agent: "Daptomycin", penetration: "modest", note: "Inactivated by surfactant — NOT for pulmonary abscess; OK for skin/bone" },
    ],
    pearls: [
      "Drainage is the treatment; antibiotics alone fail in established abscess > 2-5 cm",
      "Aminoglycosides inactivated in low-pH pleural empyema — use β-lactam-based regimen",
      "Daptomycin inactivated by pulmonary surfactant — NOT for pneumonia",
    ],
    syndromes: ["liverabscess", "splenic-abscess", "brainabscess", "epidural", "purulent", "pyomyositis", "empyema", "renalabscess", "scrotal-abscess", "perianal-abscess", "tubo-ovarian"],
  },
  {
    site: "Vitreous (eye)",
    description: "Systemic agents reach vitreous poorly; intravitreal injection is primary",
    drugs: [
      { agent: "Vancomycin (intravitreal)", penetration: "excellent", note: "1 mg intravitreal — primary therapy for bacterial endophthalmitis" },
      { agent: "Ceftazidime (intravitreal)", penetration: "excellent", note: "2.25 mg intravitreal — Pseudomonas + GNR coverage" },
      { agent: "Voriconazole (intravitreal)", penetration: "good", note: "Fungal endophthalmitis; oral + intravitreal combination" },
      { agent: "Linezolid (systemic)", penetration: "good", note: "Best systemic anti-MRSA vitreous penetration" },
      { agent: "Vancomycin (systemic)", penetration: "poor", note: "Systemic alone fails — intravitreal mandatory" },
      { agent: "β-lactams (systemic)", penetration: "poor", note: "Systemic alone fails — intravitreal mandatory" },
    ],
    pearls: [
      "EVS 1995 established intravitreal antibiotics as primary therapy for endophthalmitis",
      "Vitrectomy for LP-vision presentation per EVS criteria",
      "Systemic adjunct for endogenous endophthalmitis (treats source)",
    ],
    syndromes: ["endophthalmitis", "orbital"],
  },
  {
    site: "Pleural space",
    description: "Empyema + complicated parapneumonic effusion — low pH + inflammatory fluid",
    drugs: [
      { agent: "Ampicillin-sulbactam", penetration: "good", note: "Standard regimen for empyema; covers anaerobes" },
      { agent: "Piperacillin-tazobactam", penetration: "good", note: "Polymicrobial empyema; covers Pseudomonas + anaerobes" },
      { agent: "Clindamycin", penetration: "excellent", note: "Anaerobic empyema; oral step-down option" },
      { agent: "Metronidazole", penetration: "excellent", note: "Anaerobic adjunct" },
      { agent: "Aminoglycosides", penetration: "poor", note: "Inactivated at low pleural pH — avoid for empyema treatment" },
    ],
    pearls: [
      "Drainage drives outcome — MIST-2 supports intrapleural tPA + DNase combination",
      "pH < 7.2, glucose < 40, or positive Gram = chest tube drainage",
      "Aminoglycosides inactivated in low-pH pus — use β-lactam-based",
    ],
    syndromes: ["empyema", "cap", "aspiration"],
  },
  {
    site: "Intracellular (Legionella, Brucella, Coxiella, Mycobacteria)",
    description: "Pathogens replicate inside macrophages; lipophilic agents required",
    drugs: [
      { agent: "Macrolides (azithro, clarithro)", penetration: "excellent", note: "Intracellular concentration > 30x serum; Legionella + Mycoplasma" },
      { agent: "Tetracyclines (doxy)", penetration: "excellent", note: "Intracellular; Q fever + brucella + Coxiella" },
      { agent: "Fluoroquinolones", penetration: "excellent", note: "Intracellular; Legionella + atypical CAP" },
      { agent: "Rifampin", penetration: "excellent", note: "Intracellular; brucella + mycobacteria; NEVER monotherapy for staph" },
      { agent: "TMP-SMX", penetration: "good", note: "Nocardia + PJP intracellular" },
      { agent: "β-lactams", penetration: "poor", note: "Cell-wall agents extracellular only; do NOT use for intracellular pathogens" },
    ],
    pearls: [
      "β-lactam-only regimen for atypical pneumonia → failure; combine with macrolide or use FQ",
      "Brucella treatment requires 6-wk combination doxy + rifampin or gent",
      "Q fever chronic / endocarditis 12-18 mo doxy + hydroxychloroquine",
    ],
    syndromes: ["cap", "zoonotic-pna", "ie-native", "ie-pve"],
  },
];

/* Return drug penetration entries relevant to a syndrome. Returns
   ordered by syndrome list inclusion. */
function getPenetrationForSyndrome(synId) {
  if(!synId) return [];
  return SITE_PENETRATION.filter(s => s.syndromes && s.syndromes.includes(synId));
}

export { SITE_PENETRATION, getPenetrationForSyndrome };
