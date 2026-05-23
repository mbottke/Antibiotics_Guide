/* data · host/resistance risk keyword patterns for the empiric selector.
   Inpatient Antibiotic Guide — module graph documented in README.md. */
/* Host/resistance risk keywords consumed by the empiric selector (engines/regimen.js). */
const RISK_KW = {
  mrsaRisk:   /mrsa|gram-positive|staph/i,
  pseudoRisk: /pseudomon|antipseudomonal/i,
  esblRisk:   /esbl|resistant|gnr|carbapenem|novel|cre|ampc/i,
  severe:     /severe|shock|icu|necrot|surg|toxin|emergency/i,
};

export { RISK_KW };
