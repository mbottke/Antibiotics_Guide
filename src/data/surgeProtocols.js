/* data · surgeProtocols — Phase K surge / outbreak alert layer.
   Surfaces emerging pathogens, bioterror agents, regional outbreaks,
   and novel resistance phenotypes that require recognition + reporting
   + specific empiric strategy beyond standard antimicrobial logic.

   The clinical contract: distinguish "rare but critical" from "rare
   and irrelevant" — these are the conditions where misdiagnosis
   costs lives and where the standard syndrome decision blocks alone
   would underprepare a clinician.

   SHAPE
   -----
   SURGE_PROTOCOLS[i] = {
     id:        "kebab-case-stable-id",
     pathogen:  "string — organism / disease name",
     category:  "bioterror" | "emerging" | "regional-outbreak" | "novel-resistance",
     epi:       "string — when to suspect; exposure history",
     clinical:  "string — presentation triggers",
     empiric:   "string — initial antibiotic strategy",
     publicHealth: "string — reporting + isolation + contacts",
     antitoxin: "string — antitoxin / antiviral / specific therapy",
     syndromes: ["syndrome-id"],  // which syndromes this can present as
     severity:  "tier-1" | "high" | "watch",  // bioterror tier-1 highlights
     evidence:  "string — CDC / WHO source",
   };

   USAGE
   -----
     import { SURGE_PROTOCOLS, getSurgeForSyndrome } from "./surgeProtocols.js";
     const surges = getSurgeForSyndrome(syndromeId);

   Inpatient Antibiotic Guide — module graph documented in README.md. */

const SURGE_PROTOCOLS = [
  /* ===== Tier-1 select agents (CDC bioterror) ===== */
  {
    id: "anthrax-inhalational",
    pathogen: "Bacillus anthracis (inhalational anthrax)",
    category: "bioterror",
    epi: "Bioterror exposure; rare in industrial / agricultural workers; CDC Tier 1 select agent",
    clinical: "Biphasic — 2-d flu-like prodrome → fulminant respiratory failure with mediastinal widening on CXR (pathognomonic)",
    empiric: "Cipro 400 mg IV q8h OR doxy 100 mg IV q12h + 1-2 additional bactericidal (linezolid / clindamycin / meropenem) + antitoxin (raxibacumab or obiltoxaximab)",
    publicHealth: "**Notifiable** — emergent CDC + state health + FBI for confirmed bioterror; alert lab pre-collection (BSL-3); post-exposure prophylaxis × 60 d for contacts (cipro / doxy + vaccination series)",
    antitoxin: "Raxibacumab (monoclonal) or obiltoxaximab (monoclonal); both block protective-antigen binding; CDC-recommended adjunct",
    syndromes: ["zoonotic-pna", "cap", "sepsis", "meningitis"],
    severity: "tier-1",
    evidence: "CDC anthrax + USAMRIID 2014; outbreak response infrastructure",
  },
  {
    id: "plague-pneumonic",
    pathogen: "Yersinia pestis (pneumonic plague)",
    category: "bioterror",
    epi: "Endemic foci U.S. Southwest + global; bioterror; flea / aerosol transmission",
    clinical: "Severe pneumonia + hemoptysis + sepsis; rapid progression; airborne transmission to contacts",
    empiric: "Streptomycin 1 g IM q12h OR gentamicin 5 mg/kg q24h OR cipro 400 mg IV q12h OR doxy 100 mg IV q12h × 10-14 d",
    publicHealth: "**Notifiable** — emergent CDC + state health; respiratory isolation; post-exposure prophylaxis × 7 d for contacts",
    antitoxin: "No antitoxin; supportive ICU care",
    syndromes: ["zoonotic-pna", "sepsis", "lymphangitis"],
    severity: "tier-1",
    evidence: "CDC plague + WHO outbreak surveillance",
  },
  {
    id: "tularemia-pulmonary",
    pathogen: "Francisella tularensis (pulmonary tularemia)",
    category: "bioterror",
    epi: "Aerosol exposure (lab worker, bioterror, hunter/trapper); animal contact (rabbits, rodents)",
    clinical: "Pulmonary or ulceroglandular; high fever + cough + pneumonia + lymphadenopathy",
    empiric: "Streptomycin or gentamicin (cidal preferred) × 10 d; cipro / doxy alternatives × 14 d",
    publicHealth: "**Notifiable** — CDC + state health; alert lab (BSL-3); no human-human transmission; PEP not routine",
    antitoxin: "No antitoxin",
    syndromes: ["zoonotic-pna", "cap", "lymphangitis"],
    severity: "tier-1",
    evidence: "CDC tularemia + WHO",
  },
  {
    id: "botulism-foodborne",
    pathogen: "Clostridium botulinum (foodborne / wound / iatrogenic)",
    category: "bioterror",
    epi: "Home-canned food; honey (infant); wound (IVDU); bioterror; CDC Tier 1",
    clinical: "Descending symmetric flaccid paralysis + cranial nerve palsies + intact mental status; respiratory failure",
    empiric: "BAT (botulism antitoxin) early — neutralizes circulating toxin only; ICU + ventilator support; antibiotics for wound only (penicillin / metronidazole — NOT aminoglycosides or clindamycin)",
    publicHealth: "**Notifiable** — CDC notification 24/7 + state health; antitoxin via CDC; outbreak investigation + source identification",
    antitoxin: "BAT (heptavalent botulinum antitoxin) via CDC; BabyBIG for infant; specific antitoxin neutralizes circulating toxin (not bound)",
    syndromes: ["botulism"],
    severity: "tier-1",
    evidence: "CDC botulism 24/7 + Tier 1 select agent",
  },

  /* ===== Emerging viral / atypical (scope-adjacent) ===== */
  {
    id: "mpox-clade-i",
    pathogen: "Mpox (Monkeypox) — clade I outbreak (DRC + Africa)",
    category: "emerging",
    epi: "Clade I emerging from DRC + Central African outbreak; clade IIb (global 2022) ongoing; sexual + household contact",
    clinical: "Vesiculopustular rash (often anogenital), fever, lymphadenopathy; severe in immunocompromised + HIV + pregnancy",
    empiric: "Tecovirimat (TPOXX) for severe / immunocompromised — antiviral, not antibiotic; supportive otherwise",
    publicHealth: "**Notifiable** — CDC + state health; respiratory + contact precautions; ring vaccination JYNNEOS for close contacts",
    antitoxin: "Tecovirimat (oral or IV); vaccinia immune globulin (VIG) for severe",
    syndromes: ["cellulitis", "purulent"],
    severity: "high",
    evidence: "CDC mpox + WHO PHEIC declarations 2022 + 2024",
  },
  {
    id: "covid-novel-variant",
    pathogen: "SARS-CoV-2 (novel variant surveillance)",
    category: "emerging",
    epi: "Ongoing pandemic surveillance; immune-escape variants + chronic shedders + cluster outbreaks",
    clinical: "Respiratory + multisystem; bacterial superinfection drives ICU; antibiotics adjunct only",
    empiric: "Nirmatrelvir-ritonavir for outpatient high-risk; remdesivir for inpatient with O2 needs; dexamethasone for severe; standard antibiotic empiric for bacterial superinfection per CAP / HAP",
    publicHealth: "**Notifiable** — CDC + state health; respiratory precautions per institutional protocol",
    antitoxin: "Nirmatrelvir-ritonavir (Paxlovid) outpatient; remdesivir + dexamethasone inpatient; bebtelovimab withdrawn (variant escape)",
    syndromes: ["cap", "hap", "tracheobronchitis", "sepsis", "sepsis-hcaq", "neutropenic-pna"],
    severity: "watch",
    evidence: "CDC COVID + WHO PHEIC 2020-2023; ongoing surveillance",
  },
  {
    id: "mers-cov",
    pathogen: "MERS-CoV (Middle East respiratory syndrome)",
    category: "emerging",
    epi: "Arabian Peninsula travel; camel exposure; hospital-acquired clusters",
    clinical: "Severe pneumonia + ARDS + AKI; case-fatality ~34%",
    empiric: "Supportive care + dexamethasone (if ARDS); standard bacterial empiric for superinfection per CAP / HAP; no specific antiviral approved",
    publicHealth: "**Notifiable** — WHO IHR + CDC; respiratory + contact precautions",
    antitoxin: "No specific antiviral; research-stage monoclonals + remdesivir studied",
    syndromes: ["cap", "hap", "sepsis-hcaq"],
    severity: "watch",
    evidence: "CDC MERS + WHO travel advisory",
  },
  {
    id: "ebola-marburg",
    pathogen: "Ebola / Marburg virus (filovirus hemorrhagic fever)",
    category: "emerging",
    epi: "West / Central African travel; healthcare workers; outbreak-context",
    clinical: "Fever + GI symptoms → hemorrhagic phase + multi-organ failure; case-fatality 25-90%",
    empiric: "Supportive care; monoclonal antibodies (inmazeb / ebanga for Ebola Zaire); standard bacterial empiric per sepsis bands",
    publicHealth: "**Notifiable** — WHO IHR + CDC + emergency response; strict isolation (negative-pressure + PAPR + double-glove + face-shield)",
    antitoxin: "Inmazeb (atoltivimab/maftivimab/odesivimab) + ebanga (ansuvimab) for Ebola Zaire; rVSV-ZEBOV vaccine",
    syndromes: ["sepsis", "severe-gastroenteritis", "sepsis-hcaq"],
    severity: "tier-1",
    evidence: "WHO + CDC outbreak response protocols",
  },

  /* ===== Novel resistance phenotypes ===== */
  {
    id: "ndm-cre-rising",
    pathogen: "NDM-producing CRE (metallo-β-lactamase)",
    category: "novel-resistance",
    epi: "Rising in U.S. (especially S. Asia-linked); hospital outbreaks; community emerging",
    clinical: "Pan-resistant Gram-negative bacteremia, UTI, pneumonia; clinical failure of all carbapenems + most β-lactams",
    empiric: "Cefiderocol monotherapy OR ceftazidime-avibactam + aztreonam combo; ID + carbapenemase typing mandatory; contact precautions",
    publicHealth: "Institutional outbreak surveillance + contact tracing + cohorting; CDC AR Lab Network reporting",
    antitoxin: "Cefiderocol or ceftazidime-avibactam + aztreonam; mechanism-typing essential",
    syndromes: ["gnbact", "urosepsis", "hap", "peritonitis", "sepsis-hcaq"],
    severity: "high",
    evidence: "CDC AR Investments + IDSA AMR-GN 2024",
  },
  {
    id: "candida-auris-outbreak",
    pathogen: "Candida auris (MDR yeast)",
    category: "novel-resistance",
    epi: "ICU / LTACH outbreaks + global spread; environmental persistence; resistant to azole (~90%) + echinocandin (~30%) + amphotericin (~30%)",
    clinical: "Candidemia, line infection, UTI, wound infection; mortality > 30% with bloodstream",
    empiric: "Echinocandin first-line if susceptible (caspofungin / micafungin); combination for resistant; ID + infection-control coordination",
    publicHealth: "**Notifiable** — CDC + state health; strict isolation (private room + contact precautions + environmental disinfection); cluster surveillance",
    antitoxin: "Echinocandin first-line; antifungal scope note — see dedicated reference",
    syndromes: ["candidemia", "neutropenic-pna", "endophthalmitis", "sepsis-hcaq"],
    severity: "high",
    evidence: "CDC C. auris outbreak surveillance 2016-present",
  },
  {
    id: "mcr-1-colistin-resistance",
    pathogen: "MCR-1 plasmid-mediated colistin resistance",
    category: "novel-resistance",
    epi: "Global spread since 2015; agricultural-medical transfer; community + healthcare; emerging U.S.",
    clinical: "Pan-resistant Gram-negative (especially CRE + Pseudomonas) where colistin was last-line",
    empiric: "Per mechanism + susceptibility — cefiderocol, ceftaz-avi + aztreonam, mero-vabor; ID + ICU + carbapenemase typing essential",
    publicHealth: "Institutional outbreak tracking; CDC AR Lab Network; environmental + agricultural sources",
    antitoxin: "Mechanism-typing + targeted novel β-lactam per resistance pattern",
    syndromes: ["gnbact", "hap", "sepsis-hcaq", "pseudo-bact"],
    severity: "high",
    evidence: "CDC AR + WHO antimicrobial resistance surveillance",
  },

  /* ===== Outbreak-context food/water-borne (regional surge) ===== */
  {
    id: "cholera-outbreak",
    pathogen: "Vibrio cholerae (cholera)",
    category: "regional-outbreak",
    epi: "Travel to endemic regions (Africa, South Asia, Haiti); recent global surge 2022-24; outbreaks linked to conflict + climate",
    clinical: "Severe rice-water diarrhea + hypovolemic shock; rapid dehydration",
    empiric: "Oral / IV rehydration is the cure; doxy 300 mg PO × 1 OR azithro 1 g PO × 1 for severe (reduces duration)",
    publicHealth: "**Notifiable** — WHO IHR + CDC + state health; outbreak source investigation",
    antitoxin: "Aggressive rehydration (ORS or IV); cholera vaccine for outbreak/travel",
    syndromes: ["severe-gastroenteritis"],
    severity: "high",
    evidence: "WHO cholera 2023 PHEIC consideration + CDC",
  },
  {
    id: "drug-resistant-typhoid-pakistan",
    pathogen: "XDR Salmonella Typhi (Pakistan + India)",
    category: "regional-outbreak",
    epi: "Pakistan outbreak since 2016; spread to S. Asia + travelers; resistant to FQ + ceftriaxone + ampicillin + TMP-SMX",
    clinical: "Severe typhoid fever from S. Asia travel; XDR strain requires carbapenem",
    empiric: "Meropenem or azithro for XDR; FQ resistance > 90% in endemic — avoid empiric FQ from S. Asia",
    publicHealth: "**Notifiable** — CDC + state health; outbreak investigation",
    antitoxin: "Dexamethasone for severe (Hoffman regimen, NEJM 1984)",
    syndromes: ["enteric-fever"],
    severity: "high",
    evidence: "Trivedi Lancet ID 2020 + CDC + Pakistan surveillance",
  },
  {
    id: "marburg-rwanda-2024",
    pathogen: "Marburg virus (Rwanda outbreak 2024)",
    category: "regional-outbreak",
    epi: "Rwanda outbreak 2024 + East African focus; healthcare-worker cluster; bat reservoir",
    clinical: "Filovirus hemorrhagic fever similar to Ebola; case-fatality 25-90%",
    empiric: "Supportive care; no licensed monoclonal yet (sabizabulin / remdesivir / monoclonals in trials)",
    publicHealth: "**Notifiable** — WHO IHR + CDC; strict isolation",
    antitoxin: "No licensed monoclonal; research-stage agents",
    syndromes: ["sepsis", "severe-gastroenteritis"],
    severity: "tier-1",
    evidence: "WHO Marburg 2024 outbreak alert",
  },
];

/* Return surge / outbreak protocols relevant to a syndrome. Filters
   by syndromes[] index match. Returns ordered by severity tier
   (tier-1 → high → watch). */
function getSurgeForSyndrome(synId) {
  if(!synId) return [];
  const matches = SURGE_PROTOCOLS.filter(s => s.syndromes && s.syndromes.includes(synId));
  const sevRank = { "tier-1": 0, high: 1, watch: 2 };
  return matches.slice().sort((a, b) => (sevRank[a.severity] ?? 9) - (sevRank[b.severity] ?? 9));
}

export { SURGE_PROTOCOLS, getSurgeForSyndrome };
