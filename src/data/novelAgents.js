/* data · novelAgents — Phase I newer-agent profile layer. Captures
   structured "when to reach for the new drug" guidance for agents
   that have entered clinical practice in the last 5–10 years and
   carry specific use-cases, mechanism caveats, and resistance
   considerations beyond what the legacy syndromes capture.

   The clinical contract: surface novel-agent decision-points that
   would otherwise live scattered across regimen cards. Newer agents
   are often the right answer for resistant infections but carry
   distinct spectra, mechanisms, and pitfalls that materially
   change choice. Examples: ceftolozane-tazo for DTR-Pseudomonas;
   ceftazidime-avibactam for KPC-CRE; meropenem-vaborbactam for
   KPC-only; cefiderocol for metallo-CRE / CRAB.

   SHAPE
   -----
   NOVEL_AGENTS[i] = {
     id:          "kebab-case-stable-id",
     agent:       "string — drug name",
     class:       "string — pharmacologic class",
     approved:    "year — FDA / EMA approval",
     spectrum:    "string — what it covers + does NOT cover",
     useCases:    ["string — specific clinical indication"],
     mechanism:   "string — how it works + mechanism-specific caveat",
     resistance:  "string — emerging resistance pattern",
     pitfalls:    ["string — clinical caveat / dosing quirk"],
     dosing:      "string — adult IV standard dose",
     syndromes:   ["syndrome-id"],  // where this agent often surfaces
     evidence:    "string — pivotal trial + result",
   };

   USAGE
   -----
     import { NOVEL_AGENTS, getNovelForSyndrome } from "./novelAgents.js";
     const agents = getNovelForSyndrome(syndromeId);

   Inpatient Antibiotic Guide — module graph documented in README.md. */

const NOVEL_AGENTS = [
  /* ===== Novel β-lactam / β-lactamase inhibitor combinations ===== */
  {
    id: "ceftolozane-tazo",
    agent: "Ceftolozane-tazobactam",
    class: "Cephalosporin + β-lactamase inhibitor",
    approved: 2014,
    spectrum: "DTR Pseudomonas aeruginosa (preferred); ESBL Enterobacteriaceae; NOT active vs KPC / metallo / OXA-48",
    useCases: [
      "DTR / MDR Pseudomonas bacteremia, pneumonia, complicated UTI / IAI",
      "Severe Pseudomonas infections when β-lactam / FQ susceptibility lost",
    ],
    mechanism: "Cell-wall synthesis inhibitor; tazobactam protects against most β-lactamases except KPC + metallo + OXA-48",
    resistance: "Resistance mutations (porin loss + efflux upregulation) emerging at ≤ 5% of clinical Pseudomonas isolates",
    pitfalls: [
      "Renal-adjusted dosing (CrCl < 50 reduce; HD specific)",
      "NOT for KPC-CRE — use ceftaz-avi or mero-vabor instead",
      "Higher pneumonia dose (3 g q8h) per ASPECT-NP",
    ],
    dosing: "1.5–3 g IV q8h (3 g for HAP / VAP per ASPECT-NP); renal-adjusted",
    syndromes: ["pseudo-bact", "hap", "vat", "neutropenic-pna", "urosepsis", "sepsis-hcaq", "peritonitis"],
    evidence: "ASPECT-NP NEJM 2019 — non-inferior to mero in HAP/VAP; RECAPTURE 2019 — UTI",
  },
  {
    id: "ceftazidime-avibactam",
    agent: "Ceftazidime-avibactam",
    class: "Cephalosporin + non-β-lactam BLI",
    approved: 2015,
    spectrum: "KPC-CRE (preferred); OXA-48 CRE; ESBL; DTR-Pseudomonas; NOT active vs metallo-CRE alone",
    useCases: [
      "KPC-CRE bacteremia, pneumonia, UTI, IAI (first-line per IDSA AMR-GN 2024)",
      "OXA-48 CRE",
      "Metallo-CRE in combination with aztreonam (paired regimen)",
    ],
    mechanism: "Avibactam diazabicyclooctane BLI — covers Ambler A + C + some D; does NOT cover metallo (Ambler B)",
    resistance: "KPC mutations driving avibactam resistance emerging at < 5%; mechanism-typing critical",
    pitfalls: [
      "Combine with aztreonam for metallo-CRE — neither alone effective",
      "Renal-adjusted dosing",
      "NOT cidal against Acinetobacter (intrinsic + acquired)",
    ],
    dosing: "2.5 g IV q8h (extended infusion); renal-adjusted",
    syndromes: ["gnbact", "urosepsis", "hap", "vat", "peritonitis", "sepsis-hcaq", "transplant-uti"],
    evidence: "RECAPTURE + REPRISE + REPROVE NEJM 2018–19; IDSA AMR-GN 2024",
  },
  {
    id: "meropenem-vaborbactam",
    agent: "Meropenem-vaborbactam",
    class: "Carbapenem + non-β-lactam BLI",
    approved: 2017,
    spectrum: "KPC-CRE (preferred); NOT active vs metallo / OXA-48 / Acinetobacter",
    useCases: [
      "KPC-CRE bacteremia, UTI, IAI when ceftaz-avi resistance emerging or unavailable",
      "Severe KPC-Enterobacteriaceae infections",
    ],
    mechanism: "Vaborbactam boronic acid BLI — covers Ambler A (KPC) + C; does NOT cover OXA-48 or metallo",
    resistance: "Resistance < 5% but emerging; narrower spectrum than ceftaz-avi",
    pitfalls: [
      "Less broad than ceftaz-avi — pathogen-typing matters",
      "NOT for OXA-48 or metallo",
      "Higher cost vs. older β-lactams",
    ],
    dosing: "4 g IV q8h (extended infusion); renal-adjusted",
    syndromes: ["gnbact", "urosepsis", "hap", "peritonitis", "sepsis-hcaq"],
    evidence: "TANGO-I + TANGO-II NEJM 2018 — non-inferior in CRE infections; IDSA AMR-GN 2024",
  },
  {
    id: "imipenem-relebactam",
    agent: "Imipenem-cilastatin-relebactam",
    class: "Carbapenem + non-β-lactam BLI",
    approved: 2019,
    spectrum: "KPC-CRE + DTR-Pseudomonas; NOT active vs metallo / OXA-48",
    useCases: [
      "DTR-Pseudomonas bacteremia, pneumonia (alternative to ceftolozane-tazo)",
      "KPC-CRE (alternative to ceftaz-avi)",
    ],
    mechanism: "Relebactam BLI similar to avibactam — Ambler A + C",
    resistance: "Similar to other novel β-lactams; mechanism-typing essential",
    pitfalls: [
      "Renal-adjusted dosing",
      "NOT for metallo or OXA-48",
      "Higher imipenem dose drives seizure risk in elderly + renal failure",
    ],
    dosing: "1.25 g IV q6h (extended infusion); renal-adjusted",
    syndromes: ["gnbact", "pseudo-bact", "urosepsis", "hap", "peritonitis", "sepsis-hcaq"],
    evidence: "RESTORE-IMI 1 + 2 (CID 2020) — non-inferior in IAI + UTI; IDSA AMR-GN 2024",
  },
  {
    id: "cefiderocol",
    agent: "Cefiderocol",
    class: "Siderophore cephalosporin",
    approved: 2019,
    spectrum: "Metallo-CRE (NDM, VIM, IMP); CRAB; pan-resistant Pseudomonas; broad GNR including S. maltophilia",
    useCases: [
      "Metallo-CRE infections (only agent with monotherapy activity)",
      "CRAB pneumonia + bacteremia",
      "DTR-Pseudomonas when ceftolozane-tazo + ceftaz-avi resistant",
      "Pan-resistant Gram-negative salvage",
    ],
    mechanism: "Iron-acquisition pathway exploiter — uses bacterial siderophore-Fe transport to enter periplasm; stable to all known β-lactamases",
    resistance: "Emerging resistance < 5% currently; iron-acquisition pathway mutations + PBP-3 mutations",
    pitfalls: [
      "CREDIBLE-CR signal of increased mortality in some subgroups (Acinetobacter) — controversial",
      "Iron-overloaded patients — emerging concerns; ID + ICU coordination",
      "Renal-adjusted dosing",
    ],
    dosing: "2 g IV q8h (extended infusion 3 h); renal-adjusted",
    syndromes: ["gnbact", "hap", "vat", "sepsis-hcaq", "pseudo-bact", "neutropenic-pna"],
    evidence: "CREDIBLE-CR + APEKS-cUTI + APEKS-NP Lancet ID 2020-21; IDSA AMR-GN 2024",
  },
  {
    id: "sulbactam-durlobactam",
    agent: "Sulbactam-durlobactam",
    class: "β-lactam + non-β-lactam BLI",
    approved: 2023,
    spectrum: "Carbapenem-resistant Acinetobacter baumannii (CRAB) — first-line per IDSA AMR-GN 2024",
    useCases: [
      "CRAB bacteremia + pneumonia",
      "Pan-resistant Acinetobacter salvage",
    ],
    mechanism: "Sulbactam targets Acinetobacter PBP3; durlobactam protects sulbactam from β-lactamases",
    resistance: "Resistance currently low but emerging; pathogen-typing essential",
    pitfalls: [
      "ONLY for Acinetobacter — narrow spectrum",
      "Limited real-world experience",
      "Renal-adjusted dosing",
    ],
    dosing: "1 g IV q6h (each component); renal-adjusted",
    syndromes: ["hap", "vat", "sepsis-hcaq"],
    evidence: "XACDURO Lancet ID 2023 — first-line CRAB",
  },

  /* ===== Novel anti-MRSA / anti-Gram-positive ===== */
  {
    id: "ceftaroline",
    agent: "Ceftaroline",
    class: "Fifth-generation cephalosporin",
    approved: 2010,
    spectrum: "MRSA; MSSA; S. pneumoniae (incl. PRSP); Strep + Enterococcus faecalis; NOT VRE / Pseudomonas / Acinetobacter",
    useCases: [
      "MRSA bacteremia salvage (combination with daptomycin)",
      "MRSA SSTI + CAP (FDA-approved)",
      "Persistent MRSA bacteremia per IDSA 2011",
    ],
    mechanism: "PBP-2a-targeting cephalosporin — binds MRSA-specific transpeptidase",
    resistance: "MIC creep in some MRSA isolates; resistance < 1% currently",
    pitfalls: [
      "Renal-adjusted dosing",
      "Limited Gram-negative spectrum — pair with β-lactam for serious GNR",
      "Eosinophilic pneumonia signal reported",
    ],
    dosing: "600 mg IV q12h (q8h for persistent MRSA salvage)",
    syndromes: ["persistent-mrsa", "sab", "cellulitis", "purulent", "cap", "pyomyositis"],
    evidence: "Geriak AAC 2019 + ACTIVE-NA 2024 — combination with daptomycin in persistent MRSA",
  },
  {
    id: "dalbavancin",
    agent: "Dalbavancin",
    class: "Lipoglycopeptide",
    approved: 2014,
    spectrum: "MRSA; MSSA; Strep; VanA-VRE (some); NOT GNR",
    useCases: [
      "MRSA SSTI single-dose outpatient therapy",
      "MRSA bacteremia / endocarditis IV-to-discharge transition",
      "OPAT alternative — replaces daily vanco infusions",
    ],
    mechanism: "Cell-wall lipoglycopeptide; long half-life (~14 d) — once-weekly or single-dose",
    resistance: "VanA Enterococcus resistance possible; resistance overall < 1%",
    pitfalls: [
      "Half-life > 2 wk — adverse-event resolution slow",
      "No renal adjustment typically needed (long half-life buffers fluctuation)",
      "Limited data for endocarditis (off-label salvage growing)",
    ],
    dosing: "1500 mg IV × 1 (or 1000 mg × 1 then 500 mg × 1 week later)",
    syndromes: ["sab", "cellulitis", "purulent", "osteo", "ie-native"],
    evidence: "DISCOVER 1 + 2 NEJM 2014 — SSTI; observational extension in bacteremia + bone/joint",
  },
  {
    id: "oritavancin",
    agent: "Oritavancin",
    class: "Lipoglycopeptide",
    approved: 2014,
    spectrum: "MRSA; VRE (some); Strep; NOT GNR",
    useCases: [
      "MRSA SSTI single-dose therapy",
      "Outpatient bacteremia transition (off-label growing)",
    ],
    mechanism: "Cell-wall lipoglycopeptide with multiple mechanisms; very long half-life (~14 d)",
    resistance: "Resistance < 1%; VanA VRE variable activity",
    pitfalls: [
      "Interferes with coagulation assays (artifactual aPTT prolongation × 5 d)",
      "Single-dose 1200 mg long half-life",
      "No renal adjustment typically",
    ],
    dosing: "1200 mg IV × 1",
    syndromes: ["cellulitis", "purulent"],
    evidence: "SOLO 1 + 2 NEJM 2014 — SSTI",
  },

  /* ===== Novel antifungals (scope-note only — antifungals out of formal scope) ===== */
  {
    id: "isavuconazole",
    agent: "Isavuconazole",
    class: "Triazole antifungal",
    approved: 2015,
    spectrum: "Aspergillus; Mucor / Rhizopus; broad-spectrum mold + yeast",
    useCases: [
      "Invasive aspergillosis (alternative to voriconazole — better tolerability)",
      "Mucormycosis (preferred over amphotericin in some institutions)",
    ],
    mechanism: "Ergosterol synthesis inhibition; oral + IV bioavailability ~98%",
    resistance: "Aspergillus azole resistance emerging in some regions (Netherlands, Europe); pathogen-typing matters",
    pitfalls: [
      "Drug interactions less severe than voriconazole (no CYP2C19 effect)",
      "Antifungal scope note — see dedicated reference",
      "Loading dose required",
    ],
    dosing: "200 mg q8h × 6 doses (load) then 200 mg q24h",
    syndromes: ["neutropenic-pna", "orbital", "endophthalmitis"],
    evidence: "SECURE + VITAL NEJM 2018 — non-inferior to voriconazole in invasive aspergillosis",
  },

  /* ===== Novel oral agents ===== */
  {
    id: "tedizolid",
    agent: "Tedizolid",
    class: "Oxazolidinone (next-gen linezolid)",
    approved: 2014,
    spectrum: "MRSA; Strep; Enterococcus (incl. VRE)",
    useCases: [
      "MRSA SSTI — once-daily oral or IV; 6-day course",
    ],
    mechanism: "Protein synthesis inhibitor — newer-generation oxazolidinone",
    resistance: "Cross-resistance with linezolid; resistance < 1%",
    pitfalls: [
      "Less thrombocytopenia + serotonin syndrome risk vs linezolid",
      "Shorter standard course (6 d for SSTI)",
      "No GNR coverage",
    ],
    dosing: "200 mg IV/PO q24h × 6 d",
    syndromes: ["cellulitis", "purulent"],
    evidence: "ESTABLISH 1 + 2 — SSTI non-inferiority vs linezolid",
  },
  {
    id: "delafloxacin",
    agent: "Delafloxacin",
    class: "Anionic fluoroquinolone",
    approved: 2017,
    spectrum: "MRSA + MSSA + Strep + GNR + atypical; lower QTc + safer-substrate profile than other FQs",
    useCases: [
      "MRSA SSTI alternative to vancomycin / linezolid",
      "CABP (community-acquired bacterial pneumonia)",
    ],
    mechanism: "Anionic FQ with different binding profile — penetrates acidic environments (abscess) better",
    resistance: "Cross-resistance with other FQs in many isolates; surveillance ongoing",
    pitfalls: [
      "Lower QTc signal vs older FQs — not zero, monitor in substrate-rich",
      "Class FQ tendinopathy + neuropathy + aortic warnings still apply",
      "Renal-adjusted dosing",
    ],
    dosing: "300 mg IV q12h or 450 mg PO q12h",
    syndromes: ["cellulitis", "purulent", "cap"],
    evidence: "PROCEED + DEFINE-SSSI — SSTI non-inferior to vancomycin / aztreonam",
  },
  {
    id: "lefamulin",
    agent: "Lefamulin",
    class: "Pleuromutilin",
    approved: 2019,
    spectrum: "CAP-typical + atypical (Mycoplasma, Legionella, Chlamydophila); MSSA + Strep",
    useCases: [
      "CAP outpatient or hospital — alternative for patients failing first-line or intolerant",
      "Atypical pneumonia",
    ],
    mechanism: "Protein synthesis inhibitor — pleuromutilin class first systemic agent",
    resistance: "Very low resistance currently; novel-class advantage",
    pitfalls: [
      "QTc prolongation — monitor in substrate-rich",
      "IV + PO availability",
      "No MRSA, GNR, or Pseudomonas coverage",
    ],
    dosing: "150 mg IV q12h × 5–7 d, or 600 mg PO q12h",
    syndromes: ["cap", "tracheobronchitis"],
    evidence: "LEAP 1 + 2 — CAP non-inferior to moxifloxacin",
  },
  {
    id: "omadacycline",
    agent: "Omadacycline",
    class: "Aminomethylcycline (tetracycline derivative)",
    approved: 2018,
    spectrum: "MRSA + MSSA + Strep + Enterococcus + tetracycline-resistant strains; CAP atypicals; some Mycobacterium",
    useCases: [
      "CAP outpatient or hospital (especially tetracycline-resistant)",
      "MRSA SSTI alternative",
      "Mycobacterium abscessus (off-label growing)",
    ],
    mechanism: "Protein synthesis inhibitor — designed to overcome tetracycline-resistance mechanisms",
    resistance: "Limited cross-resistance with older tetracyclines; favorable profile",
    pitfalls: [
      "GI intolerance (nausea/vomiting) common",
      "IV + PO availability",
      "Limited Pseudomonas / GNR resistance penetration",
    ],
    dosing: "100 mg IV q12h × 2 d then 100 mg q24h, or 300 mg PO q24h",
    syndromes: ["cap", "cellulitis", "purulent"],
    evidence: "OPTIC + OASIS 1 + 2 — CAP + SSTI non-inferior to moxifloxacin / linezolid",
  },
  {
    id: "tebipenem",
    agent: "Tebipenem HBr",
    class: "Oral carbapenem (FDA review)",
    approved: "pending",
    spectrum: "Oral activity against ESBL + AmpC Enterobacteriaceae; first oral carbapenem",
    useCases: [
      "Complicated UTI / pyelonephritis with ESBL — oral alternative to IV ertapenem",
      "Outpatient transition for ESBL UTI",
    ],
    mechanism: "Oral prodrug carbapenem — bioavailability ~60%",
    resistance: "Cross-resistance with other carbapenems",
    pitfalls: [
      "NOT yet FDA-approved (under review as of 2024)",
      "Concerns about driving carbapenem resistance via outpatient use",
      "Not for serious bacteremic / endovascular infection",
    ],
    dosing: "600 mg PO q8h (pending approval)",
    syndromes: ["pyelo", "urosepsis", "cystitis"],
    evidence: "ADAPT-PO NEJM 2022 — non-inferior to IV ertapenem in cUTI",
  },
];

/* Return novel agents relevant to a syndrome. Filters by syndromes[]
   index match. Returns ordered by approval year (newest first) so
   the most cutting-edge options surface first. */
function getNovelForSyndrome(synId) {
  if(!synId) return [];
  const matches = NOVEL_AGENTS.filter(a => a.syndromes && a.syndromes.includes(synId));
  return matches.slice().sort((a, b) => {
    const ay = typeof a.approved === "number" ? a.approved : 0;
    const by = typeof b.approved === "number" ? b.approved : 0;
    return by - ay;
  });
}

export { NOVEL_AGENTS, getNovelForSyndrome };
