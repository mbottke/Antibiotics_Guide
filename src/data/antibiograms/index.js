/* data · antibiograms registry — Phase E central index.
   Owns the canonical agent + organism vocabularies that every
   antibiogram (seed or user-uploaded) must speak, and the seed
   registry that ships with the app.

   The CSV parser, overlay engine, and management UI all read from
   the maps here so the contract stays in one place: rename a
   canonical key in this file and the rest of Phase E follows
   without per-call-site touch-ups.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

import { ILH_ANTIBIOGRAM } from "./ilh.js";

/* ===================== CANONICAL AGENT VOCABULARY =====================
   Stable canonical agent keys (lowercase, hyphenated) + the set of
   human-language aliases the CSV parser will accept. Every alias
   below must resolve unambiguously to exactly one canonical key.
   Drug abbreviations follow CLSI / IDSA conventions. */
const ANTIBIOGRAM_AGENTS = {
  // Penicillins
  "ampicillin":              { aliases: ["amp", "ampicillin"], display: "Ampicillin" },
  "amoxicillin-clavulanate": { aliases: ["amox/clav", "amox-clav", "augmentin", "amc", "amoxicillin/clavulanate", "amoxicillin-clavulanate"], display: "Amoxicillin-clavulanate" },
  "ampicillin-sulbactam":    { aliases: ["amp/sulb", "amp-sulb", "unasyn", "sam", "ampicillin/sulbactam", "ampicillin-sulbactam"], display: "Ampicillin-sulbactam" },
  "piperacillin-tazobactam": { aliases: ["pip/tazo", "pip-tazo", "zosyn", "tzp", "piperacillin/tazobactam", "piperacillin-tazobactam"], display: "Piperacillin-tazobactam" },
  "penicillin":              { aliases: ["pen", "penicillin", "penicillin g", "pcn"], display: "Penicillin" },
  "oxacillin":               { aliases: ["oxa", "oxacillin", "methicillin"], display: "Oxacillin" },

  // Cephalosporins
  "cefazolin":               { aliases: ["cfz", "cefazolin", "ancef", "kefzol"], display: "Cefazolin" },
  "cefuroxime":              { aliases: ["cxm", "cefuroxime", "zinacef"], display: "Cefuroxime" },
  "ceftriaxone":             { aliases: ["cro", "ceftriaxone", "rocephin"], display: "Ceftriaxone" },
  "ceftazidime":             { aliases: ["caz", "ceftazidime", "fortaz"], display: "Ceftazidime" },
  "cefepime":                { aliases: ["fep", "cefepime", "maxipime"], display: "Cefepime" },

  // Carbapenems + monobactam
  "ertapenem":               { aliases: ["etp", "ertapenem", "invanz"], display: "Ertapenem" },
  "meropenem":               { aliases: ["mem", "mero", "meropenem", "merrem"], display: "Meropenem" },
  "aztreonam":               { aliases: ["atm", "aztreonam", "azactam"], display: "Aztreonam" },

  // Fluoroquinolones
  "ciprofloxacin":           { aliases: ["cip", "ciprofloxacin", "cipro"], display: "Ciprofloxacin" },
  "levofloxacin":            { aliases: ["lev", "levo", "levofloxacin", "levaquin"], display: "Levofloxacin" },

  // Aminoglycosides
  "gentamicin":              { aliases: ["gen", "gentamicin", "garamycin"], display: "Gentamicin" },
  "tobramycin":              { aliases: ["tob", "tobramycin", "nebcin"], display: "Tobramycin" },
  "gentamicin-synergy":      { aliases: ["gen-syn", "gentamicin synergy", "gentamicin-synergy", "gentamicin (synergy)"], display: "Gentamicin synergy" },

  // Glycopeptide
  "vancomycin":              { aliases: ["van", "vanc", "vancomycin"], display: "Vancomycin" },

  // Lincosamide + macrolides
  "clindamycin":              { aliases: ["cli", "clindamycin", "cleocin"], display: "Clindamycin" },
  "erythromycin":             { aliases: ["ery", "erythromycin"], display: "Erythromycin" },

  // Tetracyclines
  "doxycycline":              { aliases: ["dox", "doxycycline", "vibramycin"], display: "Doxycycline" },
  "tetracycline":             { aliases: ["tet", "tetracycline"], display: "Tetracycline" },

  // Urinary
  "nitrofurantoin":           { aliases: ["nft", "macrobid", "nitrofurantoin"], display: "Nitrofurantoin" },

  // Folate
  "tmp-smx":                  { aliases: ["sxt", "tmp/smx", "tmp-smx", "trimethoprim/sulfamethoxazole", "trimethoprim-sulfamethoxazole", "bactrim", "septra", "co-trimoxazole"], display: "TMP-SMX" },
};

/* ===================== CANONICAL ORGANISM MAP =====================
   Maps lab-report organism strings (case-insensitive, whitespace-loose)
   to a canonical species + the ORG_BY_ID bucket the overlay engine
   uses to bridge syndrome `bugs[]` arrays.

   Gram bucket → orgId mapping:
     entero    · wild-type Enterobacterales (E. coli, K. pneumoniae,
                 K. oxytoca, P. mirabilis)
     ampc      · AmpC inducers (Enterobacter, K. aerogenes,
                 Citrobacter freundii)
     pseudo    · P. aeruginosa
     mssa/mrsa · S. aureus by methicillin status
     efaecalis · E. faecalis (ampicillin-susceptible)
     strep     · S. pneumoniae / viridans / other streptococci */
const ANTIBIOGRAM_ORGANISMS = {
  // Wild-type Enterobacterales
  "escherichia coli":         { species: "Escherichia coli", orgId: "entero", gram: "neg" },
  "e. coli":                  { species: "Escherichia coli", orgId: "entero", gram: "neg" },
  "ecoli":                    { species: "Escherichia coli", orgId: "entero", gram: "neg" },
  "klebsiella pneumoniae":    { species: "Klebsiella pneumoniae", orgId: "entero", gram: "neg" },
  "k. pneumoniae":            { species: "Klebsiella pneumoniae", orgId: "entero", gram: "neg" },
  "klebsiella oxytoca":       { species: "Klebsiella oxytoca", orgId: "entero", gram: "neg" },
  "k. oxytoca":               { species: "Klebsiella oxytoca", orgId: "entero", gram: "neg" },
  "proteus mirabilis":        { species: "Proteus mirabilis", orgId: "entero", gram: "neg" },
  "p. mirabilis":             { species: "Proteus mirabilis", orgId: "entero", gram: "neg" },

  // AmpC inducers
  "enterobacter hormaechei":  { species: "Enterobacter hormaechei", orgId: "ampc", gram: "neg" },
  "enterobacter cloacae":     { species: "Enterobacter cloacae", orgId: "ampc", gram: "neg" },
  "enterobacter species":     { species: "Enterobacter species", orgId: "ampc", gram: "neg" },
  "klebsiella (enterobacter) aerogenes": { species: "Klebsiella aerogenes", orgId: "ampc", gram: "neg" },
  "klebsiella aerogenes":     { species: "Klebsiella aerogenes", orgId: "ampc", gram: "neg" },
  "k. aerogenes":             { species: "Klebsiella aerogenes", orgId: "ampc", gram: "neg" },
  "citrobacter freundii":     { species: "Citrobacter freundii", orgId: "ampc", gram: "neg" },

  // Non-fermenter
  "pseudomonas aeruginosa":   { species: "Pseudomonas aeruginosa", orgId: "pseudo", gram: "neg" },
  "p. aeruginosa":            { species: "Pseudomonas aeruginosa", orgId: "pseudo", gram: "neg" },

  // Gram-positive
  "staphylococcus aureus - mssa": { species: "MSSA", orgId: "mssa", gram: "pos" },
  "s. aureus mssa":           { species: "MSSA", orgId: "mssa", gram: "pos" },
  "mssa":                     { species: "MSSA", orgId: "mssa", gram: "pos" },
  "staphylococcus aureus - mrsa": { species: "MRSA", orgId: "mrsa", gram: "pos" },
  "s. aureus mrsa":           { species: "MRSA", orgId: "mrsa", gram: "pos" },
  "mrsa":                     { species: "MRSA", orgId: "mrsa", gram: "pos" },
  "enterococcus faecalis":    { species: "Enterococcus faecalis", orgId: "efaecalis", gram: "pos" },
  "e. faecalis":              { species: "Enterococcus faecalis", orgId: "efaecalis", gram: "pos" },
  "enterococcus faecium":     { species: "Enterococcus faecium", orgId: "vre", gram: "pos" },
  "e. faecium":               { species: "Enterococcus faecium", orgId: "vre", gram: "pos" },
  "streptococcus pneumoniae": { species: "Streptococcus pneumoniae", orgId: "strep", gram: "pos" },
  "s. pneumoniae":            { species: "Streptococcus pneumoniae", orgId: "strep", gram: "pos" },
};

/* ===================== SEED REGISTRY ===================== */
const SEED_ANTIBIOGRAMS = [ILH_ANTIBIOGRAM];

/* Build lookup tables. Done at module-load time — cheap and lets the
   parser do O(1) alias → canonical lookups. */
const _AGENT_ALIAS_TO_CANONICAL = (() => {
  const m = {};
  for(const [canon, def] of Object.entries(ANTIBIOGRAM_AGENTS)) {
    m[canon] = canon;
    for(const a of (def.aliases || [])) m[a.toLowerCase()] = canon;
  }
  return m;
})();

const _ORG_ALIAS_TO_DEF = (() => {
  const m = {};
  for(const [k, def] of Object.entries(ANTIBIOGRAM_ORGANISMS)) {
    m[k.toLowerCase()] = def;
  }
  return m;
})();

/* ===================== HELPERS ===================== */

/* Resolve an agent string (alias / canonical / display) to the canonical
   key, or null if no match. Whitespace + case insensitive. */
function resolveAgentKey(s) {
  if(!s) return null;
  const norm = String(s).trim().toLowerCase().replace(/\s+/g, " ");
  return _AGENT_ALIAS_TO_CANONICAL[norm] || null;
}

/* Resolve an organism string to its canonical definition
   ({ species, orgId, gram }), or null. */
function resolveOrganism(s) {
  if(!s) return null;
  const norm = String(s).trim().toLowerCase().replace(/\s+/g, " ");
  if(_ORG_ALIAS_TO_DEF[norm]) return _ORG_ALIAS_TO_DEF[norm];
  // Try stripping a trailing footnote symbol (†, *, ‡, ¶)
  const stripped = norm.replace(/[†*‡¶]+\s*$/u, "").trim();
  if(stripped && _ORG_ALIAS_TO_DEF[stripped]) return _ORG_ALIAS_TO_DEF[stripped];
  return null;
}

/* Return all rows from an antibiogram that map to the given orgId
   (e.g. "entero" returns E. coli + K. pneumoniae + K. oxytoca +
   P. mirabilis when called against the ILH antibiogram). */
function rowsForOrgId(antibiogram, orgId) {
  if(!antibiogram || !Array.isArray(antibiogram.organisms)) return [];
  return antibiogram.organisms.filter(r => r.orgId === orgId);
}

/* Look up a %S value with optional context. Context "urine" prefers the
   "<agent>:urine" key if present; "meningitis" prefers "<agent>:meningitis";
   otherwise the bare canonical key. Returns null when neither is present. */
function getSusceptibility(row, agentKey, context) {
  if(!row || !row.susceptibility) return null;
  const s = row.susceptibility;
  if(context && Object.prototype.hasOwnProperty.call(s, agentKey + ":" + context)) {
    return s[agentKey + ":" + context];
  }
  if(Object.prototype.hasOwnProperty.call(s, agentKey)) return s[agentKey];
  return null;
}

/* Return all known canonical agent keys (for UI dropdowns + validators). */
function listAgents() {
  return Object.keys(ANTIBIOGRAM_AGENTS);
}

/* Return all known canonical organism aliases (for UI lookup). */
function listOrganisms() {
  return Object.keys(ANTIBIOGRAM_ORGANISMS);
}

/* Get the seed antibiograms shipped with the app. */
function getSeedAntibiograms() {
  return SEED_ANTIBIOGRAMS.slice();
}

/* Get a specific seed by id. */
function getSeedAntibiogram(id) {
  return SEED_ANTIBIOGRAMS.find(a => a.id === id) || null;
}

export {
  ANTIBIOGRAM_AGENTS,
  ANTIBIOGRAM_ORGANISMS,
  SEED_ANTIBIOGRAMS,
  ILH_ANTIBIOGRAM,
  resolveAgentKey,
  resolveOrganism,
  rowsForOrgId,
  getSusceptibility,
  listAgents,
  listOrganisms,
  getSeedAntibiograms,
  getSeedAntibiogram,
};
