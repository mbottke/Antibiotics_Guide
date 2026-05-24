/* data · pedsPregDosing — Phase J pediatric weight-based dosing +
   pregnancy considerations. Scope-note layer for an adult-focused
   reference: surfaces the modifications that pediatric or pregnant
   patients would require, so the clinician doesn't apply adult
   dosing inappropriately.

   The clinical contract: this is a *reference + handoff* layer.
   For active pediatric or pregnant patient management, this guide
   is NOT the primary resource (the explicit out-of-scope statement
   in the footer reinforces). But surfacing the key modifications
   prevents harm when an adult inpatient turns out to be peripartum
   or when a young patient is admitted to an adult service.

   SHAPE
   -----
   PEDS_PREG_DOSING[i] = {
     id:        "kebab-case-stable-id",
     agent:     "string — drug name (matches AGENT_RX where possible)",
     pedsDose:  "string — pediatric mg/kg dosing + max",
     pedsNotes: "string — age cutoffs, formulation issues",
     pregCategory: "Category B/C/D/X (legacy FDA) or PLLR descriptor",
     pregNotes: "string — trimester-specific concerns, alternatives",
     pregSafe:  "yes" | "caution" | "avoid",  // simplified bedside flag
     syndromes: ["syndrome-id"],  // which syndromes commonly use this
     evidence:  "string — guideline / source",
   };

   USAGE
   -----
     import { PEDS_PREG_DOSING, getPedsPregForSyndrome } from "./pedsPregDosing.js";
     const dosing = getPedsPregForSyndrome(syndromeId);

   Inpatient Antibiotic Guide — module graph documented in README.md. */

const PEDS_PREG_DOSING = [
  /* ===== β-lactams ===== */
  {
    id: "amoxicillin-peds-preg",
    agent: "Amoxicillin",
    pedsDose: "25–45 mg/kg/d divided BID/TID (max 875 mg/dose); high-dose 80–90 mg/kg/d for AOM / pneumonia",
    pedsNotes: "Liquid 250 mg/5 ml available; safe from neonate (limited use)",
    pregCategory: "B (legacy) — first-line in pregnancy",
    pregNotes: "Safe across all trimesters; standard treatment for ASB + cystitis + GBS prophylaxis in pregnancy",
    pregSafe: "yes",
    syndromes: ["cystitis", "asymp-bact", "cap"],
    evidence: "AAP / IDSA + ACOG",
  },
  {
    id: "amox-clav-peds-preg",
    agent: "Amoxicillin-clavulanate",
    pedsDose: "25–45 mg/kg/d amox component divided BID; high-dose 90 mg/kg/d for resistant AOM",
    pedsNotes: "Diarrhea / GI intolerance common; ES (extra-strength) formulation for high-dose",
    pregCategory: "B (legacy) — generally safe",
    pregNotes: "Safe; first-line for bite wounds + bacterial sinusitis; minor GI effects",
    pregSafe: "yes",
    syndromes: ["cystitis", "asymp-bact", "bites", "cellulitis", "pyelo"],
    evidence: "AAP + ACOG + IDSA bite wound 2014",
  },
  {
    id: "ceftriaxone-peds-preg",
    agent: "Ceftriaxone",
    pedsDose: "50–100 mg/kg/d IV q12-24h (meningitis 100 mg/kg/d); max 4 g/d",
    pedsNotes: "NOT for neonates < 28 d — calcium precipitation contraindication (FDA Black Box); use cefotaxime",
    pregCategory: "B (legacy) — safe",
    pregNotes: "First-line for pyelonephritis + GBS-resistant cystitis + STI / PID in pregnancy",
    pregSafe: "yes",
    syndromes: ["pyelo", "urosepsis", "meningitis", "pid", "cap", "enteric-fever"],
    evidence: "AAP + ACOG + CDC STI 2021",
  },
  {
    id: "cefazolin-peds-preg",
    agent: "Cefazolin",
    pedsDose: "50–100 mg/kg/d IV divided q8h",
    pedsNotes: "Standard MSSA + perioperative ppx",
    pregCategory: "B (legacy) — safe",
    pregNotes: "First-line MSSA + cellulitis; standard perioperative ppx in pregnancy",
    pregSafe: "yes",
    syndromes: ["cellulitis", "sab", "ssi", "mastitis", "pyelo"],
    evidence: "AAP + ACOG + ASHP perioperative 2013",
  },
  {
    id: "cefepime-peds-preg",
    agent: "Cefepime",
    pedsDose: "100–150 mg/kg/d IV divided q8-12h (meningitis 150 mg/kg/d); max 6 g/d",
    pedsNotes: "First-line empiric for febrile neutropenia + nosocomial pneumonia in peds",
    pregCategory: "B (legacy) — limited data but considered safe",
    pregNotes: "Acceptable for severe infection; renal dose adjustment more conservative",
    pregSafe: "yes",
    syndromes: ["febneut", "hap", "sepsis-neutropenic", "urosepsis", "sepsis-hcaq"],
    evidence: "AAP + IDSA FN 2018",
  },
  {
    id: "piperacillin-tazo-peds-preg",
    agent: "Piperacillin-tazobactam",
    pedsDose: "300–400 mg/kg/d piperacillin component IV divided q6-8h",
    pedsNotes: "Cover Pseudomonas + anaerobes; standard for febrile neutropenia + complicated IAI",
    pregCategory: "B (legacy) — safe",
    pregNotes: "Acceptable for severe IAI / sepsis in pregnancy; renal-adjusted",
    pregSafe: "yes",
    syndromes: ["peritonitis", "sepsis-abdominal", "hap", "febneut", "cholangitis"],
    evidence: "AAP + IDSA SIS 2017",
  },
  {
    id: "meropenem-peds-preg",
    agent: "Meropenem",
    pedsDose: "60 mg/kg/d IV divided q8h (meningitis 120 mg/kg/d); max 6 g/d",
    pedsNotes: "First-line ESBL + serious GNR in peds",
    pregCategory: "B (legacy) — safe",
    pregNotes: "Acceptable for severe / ESBL infection in pregnancy; standard CNS dose for meningitis",
    pregSafe: "yes",
    syndromes: ["gnbact", "meningitis", "sepsis-abdominal", "urosepsis", "enteric-fever"],
    evidence: "AAP + IDSA AMR-GN 2024",
  },

  /* ===== Anti-MRSA agents ===== */
  {
    id: "vancomycin-peds-preg",
    agent: "Vancomycin",
    pedsDose: "60–80 mg/kg/d IV divided q6h; AUC 400–600 target",
    pedsNotes: "Higher mg/kg dosing than adults due to faster clearance; AUC monitoring preferred",
    pregCategory: "C (legacy) — limited data; usually safe",
    pregNotes: "Safe across pregnancy for MRSA; AUC monitoring + renal-adjusted; standard for invasive MRSA",
    pregSafe: "caution",
    syndromes: ["sab", "cellulitis", "purulent", "meningitis", "persistent-mrsa", "endophthalmitis"],
    evidence: "AAP + ASHP/IDSA vanco 2020",
  },
  {
    id: "clindamycin-peds-preg",
    agent: "Clindamycin",
    pedsDose: "20–40 mg/kg/d divided q6-8h",
    pedsNotes: "Useful for community MRSA SSTI in peds; D-test for inducible resistance",
    pregCategory: "B (legacy) — safe",
    pregNotes: "Safe; useful for community MRSA SSTI; alternative for PCN-allergic + GBS prophylaxis",
    pregSafe: "yes",
    syndromes: ["cellulitis", "purulent", "necfasc", "tss", "pyomyositis"],
    evidence: "AAP + ACOG",
  },
  {
    id: "tmp-smx-peds-preg",
    agent: "TMP-SMX",
    pedsDose: "8–12 mg/kg/d TMP component divided q12h",
    pedsNotes: "NOT for neonates < 2 mo (kernicterus risk); cover MRSA SSTI + PJP",
    pregCategory: "C/D (legacy) — AVOID first trimester + last 6 wk; safe 2nd trimester for documented infection",
    pregNotes: "Avoid 1st trimester (folate antagonist → NTD risk) and term (kernicterus risk); 2nd trimester acceptable for documented infection",
    pregSafe: "avoid",
    syndromes: ["cystitis", "asymp-bact", "purulent", "neutropenic-pna"],
    evidence: "AAP + ACOG + CDC PJP 2024",
  },

  /* ===== Fluoroquinolones — AVOID in peds + pregnancy ===== */
  {
    id: "ciprofloxacin-peds-preg",
    agent: "Ciprofloxacin",
    pedsDose: "20–30 mg/kg/d divided q12h (limited use)",
    pedsNotes: "**Avoid routine peds use** — articular cartilage damage signal; reserved for specific (CF Pseudomonas, anthrax exposure, MDR)",
    pregCategory: "C (legacy) — generally AVOID; bone/cartilage developmental concerns",
    pregNotes: "**AVOID** in pregnancy — animal data show cartilage damage; reserved for specific indications (anthrax post-exposure)",
    pregSafe: "avoid",
    syndromes: ["cystitis", "pyelo", "urosepsis", "prostatitis", "enteric-fever"],
    evidence: "AAP + ACOG + FDA warning",
  },
  {
    id: "levofloxacin-peds-preg",
    agent: "Levofloxacin",
    pedsDose: "8–10 mg/kg q24h (limited use)",
    pedsNotes: "Same caveat as ciprofloxacin; cartilage development concern",
    pregCategory: "C (legacy) — AVOID",
    pregNotes: "**AVOID** in pregnancy — same FQ-class concerns",
    pregSafe: "avoid",
    syndromes: ["cap", "pyelo", "urosepsis", "prostatitis"],
    evidence: "AAP + ACOG + FDA warning",
  },

  /* ===== Tetracyclines — AVOID in peds + pregnancy ===== */
  {
    id: "doxycycline-peds-preg",
    agent: "Doxycycline",
    pedsDose: "2–4 mg/kg/d divided q12h; > 8 yr ok",
    pedsNotes: "**Avoid < 8 yr** — tooth staining (older teaching); 2014 AAP allows short course (≤ 21 d) for selected indications (RMSF, Lyme, anthrax)",
    pregCategory: "D (legacy) — AVOID",
    pregNotes: "**AVOID** in pregnancy — tooth + bone development concerns; exception: post-exposure anthrax prophylaxis if no alternative",
    pregSafe: "avoid",
    syndromes: ["cap", "pid", "cellulitis", "epididymo", "zoonotic-pna"],
    evidence: "AAP 2014 (limited short-course OK) + ACOG",
  },

  /* ===== Macrolides ===== */
  {
    id: "azithromycin-peds-preg",
    agent: "Azithromycin",
    pedsDose: "10 mg/kg load + 5 mg/kg/d (max 500 mg / 250 mg respectively); 30 mg/kg × 1 for pertussis",
    pedsNotes: "Safe from infancy; pertussis treatment + ppx; AOM short course",
    pregCategory: "B (legacy) — safe",
    pregNotes: "Safe; first-line for chlamydia / cervicitis / pertussis exposure / atypical pneumonia",
    pregSafe: "yes",
    syndromes: ["cap", "pid", "epididymo", "tracheobronchitis", "severe-gastroenteritis"],
    evidence: "AAP + ACOG + CDC STI 2021",
  },

  /* ===== Nitrofurantoin / fosfomycin — UTI-specific ===== */
  {
    id: "nitrofurantoin-peds-preg",
    agent: "Nitrofurantoin",
    pedsDose: "5–7 mg/kg/d divided q6h",
    pedsNotes: "First-line peds cystitis; avoid in renal impairment",
    pregCategory: "B → AVOID term (legacy)",
    pregNotes: "Safe 1st-2nd trimesters; **AVOID at term** (hemolytic anemia in newborn + G6PD); first-line pregnancy cystitis until 36 wk",
    pregSafe: "caution",
    syndromes: ["cystitis", "asymp-bact"],
    evidence: "AAP + ACOG + IDSA UTI 2010",
  },
  {
    id: "fosfomycin-peds-preg",
    agent: "Fosfomycin",
    pedsDose: "Limited peds use; not first-line",
    pedsNotes: "Single 3 g sachet for cystitis (peds use limited)",
    pregCategory: "B (legacy) — safe",
    pregNotes: "Safe; single 3 g sachet for cystitis in pregnancy; useful for ESBL-resistant + nitrofurantoin-allergic",
    pregSafe: "yes",
    syndromes: ["cystitis", "asymp-bact"],
    evidence: "AAP + ACOG",
  },

  /* ===== Metronidazole ===== */
  {
    id: "metronidazole-peds-preg",
    agent: "Metronidazole",
    pedsDose: "30 mg/kg/d divided q6-8h",
    pedsNotes: "Safe in peds; CDI + IAI + protozoal",
    pregCategory: "B (legacy) — caution 1st trimester",
    pregNotes: "Generally safe; 1st trimester data mixed (older animal studies); CDC 2021 supports use in trichomoniasis + BV in pregnancy",
    pregSafe: "caution",
    syndromes: ["cdiff", "peritonitis", "diverticulitis", "appendicitis", "tetanus"],
    evidence: "AAP + ACOG + CDC STI 2021",
  },

  /* ===== Aminoglycosides ===== */
  {
    id: "gentamicin-peds-preg",
    agent: "Gentamicin",
    pedsDose: "7.5 mg/kg/d divided q8h or 5 mg/kg q24h",
    pedsNotes: "Safe in peds; nephrotoxicity + ototoxicity monitoring",
    pregCategory: "D (legacy) — fetal ototoxicity concern",
    pregNotes: "**Use only for serious infection** — fetal cranial nerve VIII (auditory) toxicity in 2nd-3rd trimester; aminoglycoside not first-line in pregnancy",
    pregSafe: "caution",
    syndromes: ["pyelo", "urosepsis", "ie-native", "listeria"],
    evidence: "AAP + ACOG + FDA",
  },

  /* ===== Antifungal scope-note (out of formal scope but relevant) ===== */
  {
    id: "fluconazole-peds-preg",
    agent: "Fluconazole",
    pedsDose: "6–12 mg/kg/d (depends on indication)",
    pedsNotes: "Safe in peds; thrush / esophageal candidiasis common",
    pregCategory: "D (legacy) — AVOID high-dose 1st trimester",
    pregNotes: "**AVOID > 150 mg/d in 1st trimester** (NTD + cardiac malformation); single 150 mg dose for vaginal candidiasis acceptable; antifungal scope note — see dedicated reference",
    pregSafe: "avoid",
    syndromes: ["candidemia"],
    evidence: "AAP + ACOG + FDA warnings",
  },
];

/* Return peds/preg dosing relevant to a syndrome. Filters by
   syndromes[] index match. Returns ordered alphabetically by
   agent for consistent surfacing. */
function getPedsPregForSyndrome(synId) {
  if(!synId) return [];
  const matches = PEDS_PREG_DOSING.filter(d => d.syndromes && d.syndromes.includes(synId));
  return matches.slice().sort((a, b) => a.agent.localeCompare(b.agent));
}

export { PEDS_PREG_DOSING, getPedsPregForSyndrome };
