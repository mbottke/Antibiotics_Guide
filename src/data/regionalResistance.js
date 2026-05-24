/* data · regionalResistance — Phase H antibiogram-driven empiric
   adjustment layer. The structured "what your local resistance is
   doing to your empiric choice" layer that overlays standard
   empiric recommendations from each syndrome.

   The clinical contract: surface region- + setting-specific
   resistance patterns that materially change the empiric strategy.
   Examples: FQ resistance > 90% in South Asia drives enteric-fever
   empiric off FQ; community ESBL > 10% drives carbapenem-sparing
   sequence reconsideration; MRSA prevalence > 50% in community
   purulent SSTI mandates empiric MRSA cover.

   SHAPE
   -----
   REGIONAL_RESISTANCE[i] = {
     id:        "kebab-case-stable-id",
     pathogen:  "string — the organism",
     region:    "string — geographic / institutional setting label",
     pattern:   "string — what's resistant + roughly how much (%)",
     impact:    "string — how the empiric choice changes",
     syndromes: ["syndrome-id", ...]  // which syndromes this affects
                                       // (matches keys in SYNDROME_DECISION)
     severity:  "high" | "moderate" | "watch",  // priority/escalation
     evidence:  "string — surveillance source + year",
   };

   SEVERITY
   --------
   - "high"     · resistance > 50% or with mortality consequences —
                  empiric strategy must change at the bedside
   - "moderate" · 20–50% — antibiogram-driven choice; institutional
                  variation matters
   - "watch"    · emerging / monitoring level — track but don't yet
                  change empiric default

   USAGE
   -----
     import { REGIONAL_RESISTANCE, getRegionalForSyndrome } from "./regionalResistance.js";
     const regional = getRegionalForSyndrome(syndromeId);
     // → array of resistance patterns affecting this syndrome

   Inpatient Antibiotic Guide — module graph documented in README.md. */

const REGIONAL_RESISTANCE = [
  /* ===== Gram-negative resistance ===== */
  {
    id: "esbl-community-rising",
    pathogen: "ESBL-producing E. coli / K. pneumoniae",
    region: "U.S. community + worldwide",
    pattern: "ESBL community prevalence rising 5 → 15-20% over decade; healthcare-associated > 30%",
    impact: "Carbapenem (ertapenem or meropenem) for serious bacteremic ESBL infection (MERINO 2018 — pip-tazo inferior); cefepime for moderate UTI/IAI with confirmed MIC ≤ 2; oral options for cystitis limited (fosfomycin, nitrofurantoin if not bacteremic)",
    syndromes: ["pyelo", "urosepsis", "peritonitis", "cholangitis", "gnbact", "cystitis", "transplant-uti"],
    severity: "high",
    evidence: "CDC EIP + WHO GLASS surveillance + MERINO NEJM 2018",
  },
  {
    id: "cre-metallo-rising",
    pathogen: "Metallo-β-lactamase CRE (NDM, VIM, IMP)",
    region: "U.S. (rising) + S. Asia + Mediterranean endemic",
    pattern: "NDM/VIM/IMP increasing in U.S.; hydrolyzes all carbapenems; resistant to avibactam/vaborbactam/relebactam alone",
    impact: "Cefiderocol monotherapy OR ceftazidime-avibactam + aztreonam for serious infection; ID + carbapenemase typing mandatory; treat blind for metallo if travel/exposure history",
    syndromes: ["gnbact", "urosepsis", "peritonitis", "cholangitis", "sepsis-hcaq", "sepsis-abdominal"],
    severity: "high",
    evidence: "IDSA AMR-GN 2024; CDC AR Investments + EIP",
  },
  {
    id: "fq-resistance-uti",
    pathogen: "E. coli (FQ-resistant)",
    region: "U.S. + global community",
    pattern: "Community E. coli FQ resistance > 20-30% in many U.S. centers, > 50% in S. Asia",
    impact: "Avoid ciprofloxacin / levofloxacin as empiric for cystitis / pyelo / urosepsis where local resistance > 10%; pivot to β-lactam (cefpodoxime, amox-clav for cystitis; ceftriaxone for pyelo) or carbapenem for severe",
    syndromes: ["cystitis", "pyelo", "urosepsis", "transplant-uti", "prostatitis"],
    severity: "high",
    evidence: "CDC ABSSI + IDSA 2010 UTI + AUA 2024",
  },
  {
    id: "campy-fq-global",
    pathogen: "Campylobacter (FQ-resistant)",
    region: "Global (especially Asia + travelers)",
    pattern: "Campylobacter FQ resistance > 50% globally",
    impact: "Azithromycin first-line for severe / immunocompromised Campy gastroenteritis; FQ reserved for confirmed-susceptible isolates",
    syndromes: ["severe-gastroenteritis"],
    severity: "high",
    evidence: "Reller CID 2019; CDC FoodNet",
  },
  {
    id: "typhi-xdr-pakistan",
    pathogen: "Salmonella Typhi (XDR)",
    region: "Pakistan + India + Bangladesh (rising)",
    pattern: "FQ resistance > 90% in endemic S. Asia; XDR strains (resistant to FQ, ceftriaxone, ampicillin, TMP-SMX) emerging since 2016",
    impact: "Empiric carbapenem (meropenem) + azithromycin for severe enteric fever from S. Asia exposure; avoid FQs entirely; coordinate with travel medicine",
    syndromes: ["enteric-fever"],
    severity: "high",
    evidence: "Trivedi Lancet ID 2020 + WHO + Pakistan outbreak surveillance",
  },
  {
    id: "ngo-cipro-resistance",
    pathogen: "Neisseria gonorrhoeae (cipro + cefixime-resistant)",
    region: "U.S. + Asia + Europe",
    pattern: "Cipro resistance > 30%; emerging cefixime + azithromycin resistance",
    impact: "Ceftriaxone 500 mg IM × 1 first-line for gonorrhea (CDC 2021); doxy adjunct for chlamydia co-infection; gepotidacin / zoliflodacin under study for resistant strains",
    syndromes: ["pid", "epididymo", "urosepsis"],
    severity: "high",
    evidence: "CDC STI 2021; WHO GASP",
  },

  /* ===== Gram-positive resistance ===== */
  {
    id: "mrsa-community-uss-ssti",
    pathogen: "S. aureus (MRSA, community)",
    region: "U.S. (variable by region)",
    pattern: "Community MRSA dominant in purulent SSTI in many U.S. centers; nares colonization 1-3% in healthy population",
    impact: "TMP-SMX / doxycycline / clindamycin first-line for purulent SSTI when MRSA prevalence > 20%; cefazolin / cephalexin retain primacy for non-purulent cellulitis (Pallin 2013)",
    syndromes: ["purulent", "cellulitis", "bites", "bursitis", "pyomyositis", "mastitis"],
    severity: "high",
    evidence: "CDC EIP + IDSA SSTI 2014",
  },
  {
    id: "vre-bsi-rising",
    pathogen: "Enterococcus faecium (VRE)",
    region: "U.S. + Europe institutional (variable)",
    pattern: "VRE prevalence in enterococcal bacteremia varies 20-70% by institution",
    impact: "Empiric vancomycin inadequate for VRE bacteremia in high-prevalence settings; consider daptomycin-HD or linezolid empiric; antibiogram-driven institutional choice",
    syndromes: ["entbact", "vre-bact", "polymicrobial-bact"],
    severity: "moderate",
    evidence: "CDC AR + NHSN surveillance",
  },
  {
    id: "macrolide-spn-resistance",
    pathogen: "S. pneumoniae (macrolide-resistant)",
    region: "U.S. + global (variable)",
    pattern: "Macrolide resistance 30-50% in S. pneumoniae globally; FQ resistance < 5%",
    impact: "Avoid azithromycin / clarithromycin monotherapy for severe pneumococcal pneumonia; use β-lactam + macrolide combination (Postma 2015 supports β-lactam alone in moderate); FQ acceptable monotherapy where indicated",
    syndromes: ["cap", "meningitis"],
    severity: "moderate",
    evidence: "CDC ABCs + IDSA CAP 2019",
  },

  /* ===== Non-fermenting GNR resistance ===== */
  {
    id: "pseudo-mdr",
    pathogen: "Pseudomonas aeruginosa (MDR / DTR)",
    region: "Healthcare-associated (variable)",
    pattern: "DTR-Pseudomonas (difficult-to-treat) emerging; resistant to FQ, β-lactam, AG combinations",
    impact: "Ceftolozane-tazobactam OR ceftazidime-avibactam OR imipenem-relebactam per mechanism + susceptibility; cefiderocol for pan-resistant; combination empiric only for severe/neutropenic",
    syndromes: ["pseudo-bact", "hap", "vat", "neutropenic-pna", "urosepsis", "sepsis-hcaq"],
    severity: "high",
    evidence: "IDSA AMR-GN 2024 (Tamma); RECAPTURE 2019",
  },
  {
    id: "acineto-crab",
    pathogen: "Acinetobacter baumannii (CRAB)",
    region: "ICU + healthcare-associated; global rising",
    pattern: "Carbapenem-resistant Acinetobacter (CRAB) increasingly prevalent; pan-resistant strains rising",
    impact: "Sulbactam-durlobactam first-line per IDSA 2024 update; polymyxin combination salvage; cefiderocol alternative; ID + ICU coordination",
    syndromes: ["hap", "vat", "sepsis-hcaq", "neutropenic-pna"],
    severity: "high",
    evidence: "IDSA AMR-GN 2024; XACDURO 2023 sulbactam-durlobactam",
  },
  {
    id: "stenotrophomonas-rising",
    pathogen: "Stenotrophomonas maltophilia",
    region: "ICU + healthcare-associated",
    pattern: "Increasing in chronic ICU/transplant/CF substrate; intrinsically resistant to most β-lactams + carbapenems",
    impact: "TMP-SMX first-line; minocycline / tigecycline / cefiderocol alternatives; do NOT use empiric meropenem expecting Steno coverage",
    syndromes: ["hap", "vat", "neutropenic-pna", "sepsis-hcaq"],
    severity: "moderate",
    evidence: "IDSA AMR-GN 2024",
  },

  /* ===== CDI resistance / virulence ===== */
  {
    id: "cdi-bi-nap1-027",
    pathogen: "Clostridioides difficile (BI/NAP1/027)",
    region: "U.S. + Europe historic; declining",
    pattern: "Hypervirulent NAP1/BI/027 strain declining since peak 2008-12; fidaxomicin preferred over metronidazole (IDSA 2021)",
    impact: "Fidaxomicin or oral vancomycin first-line; metronidazole only when others unavailable; bezlotoxumab adjunct for high-risk recurrence; SER-109 / Vowst for recurrent",
    syndromes: ["cdiff", "toxic-megacolon"],
    severity: "moderate",
    evidence: "CDC + Johnson IDSA/SHEA 2021",
  },

  /* ===== Mycobacterial / fungal resistance ===== */
  {
    id: "ntm-clarithromycin",
    pathogen: "M. abscessus / M. avium complex (MAC)",
    region: "Global; rising in chronic lung disease",
    pattern: "Macrolide resistance + erm gene drives M. abscessus failure; MAC clarithromycin resistance correlates with prior macrolide exposure",
    impact: "ATS/IDSA 2020 NTM combination required (macrolide + amikacin + imipenem / cefoxitin / tigecycline); 12+ mo duration; specialty center referral",
    syndromes: ["bronchiectasis", "neutropenic-pna"],
    severity: "moderate",
    evidence: "ATS/IDSA NTM 2020; Daley CID 2020",
  },

  /* ===== Watch-list emerging ===== */
  {
    id: "cefiderocol-resistance",
    pathogen: "Multiple Gram-negative",
    region: "Global emerging (low currently)",
    pattern: "Cefiderocol resistance emerging in CRAB + NDM-CRE + DTR-Pseudomonas; iron-acquisition pathway mutations",
    impact: "Cefiderocol still first-line for pan-resistant; mechanism-typing + ID consult mandatory for failures; combination therapy for resistant",
    syndromes: ["gnbact", "hap", "vat", "sepsis-hcaq", "neutropenic-pna"],
    severity: "watch",
    evidence: "Emerging surveillance + case series since 2023 approval",
  },
  {
    id: "candida-auris-rising",
    pathogen: "Candida auris",
    region: "U.S. + global rising (institutional outbreaks)",
    pattern: "Multidrug-resistant Candida (azole resistance ~90%, echinocandin ~30%, amphotericin ~30%)",
    impact: "Antifungal scope note — see dedicated reference; echinocandin first-line if susceptible; combination for resistant; strict isolation + outbreak surveillance",
    syndromes: ["candidemia", "neutropenic-pna", "endophthalmitis"],
    severity: "high",
    evidence: "CDC outbreak surveillance + WHO fungal priority list 2022",
  },
];

/* Return regional resistance patterns affecting a syndrome.
   Filters REGIONAL_RESISTANCE by syndrome ID match. Returns
   ordered by severity (high → moderate → watch) so the highest-
   priority alerts render first. */
function getRegionalForSyndrome(synId) {
  if(!synId) return [];
  const matches = REGIONAL_RESISTANCE.filter(r => r.syndromes && r.syndromes.includes(synId));
  const sevRank = { high: 0, moderate: 1, watch: 2 };
  return matches.slice().sort((a, b) => (sevRank[a.severity] ?? 9) - (sevRank[b.severity] ?? 9));
}

export { REGIONAL_RESISTANCE, getRegionalForSyndrome };
