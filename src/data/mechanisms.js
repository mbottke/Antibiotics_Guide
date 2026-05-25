/* data · mechanisms — Wave 5 PR-7 foundational-science depth layer.

   The "open the mechanism drawer" surface — keyed by drug-class name
   (rounds-trips through DRUG_CLASSES) OR resistance-mechanism name
   (round-trips through MX_CLASSES / LADDER). Renders the biochemistry
   beneath the regimen: why does AmpC defeat ceftriaxone mid-course?
   why does daptomycin fail in pneumonia? what does avibactam restore
   that vaborbactam doesn't?

   The architectural intent — Wave 5 user research: clinicians want
   to drill from "ESBL → carbapenem" to the Ambler-class biochemistry
   without leaving the Decide surface. This layer carries the science
   one click away from the prescribing decision.

   FILE LAYOUT
   -----------
   This file is the dictionary. The MechanismDrawer.jsx component
   reads through getMechanism(key) and renders the structured fields.
   Authored content lives inline here for PR-7a; future tranches may
   split it (pattern available — mirrors diagnostics).

   SHAPE
   -----
   MECHANISMS[key] = {
     title:        "string — display name (overrides key in render)",
     family:       "class" | "resistance",   // category badge
     summary:      "string — ≤ 60 words, the one-paragraph hook",
     keypoints:    [ "string — ≤ 24 words each", … ],   // 3–6 bullets
     bedside:      "string — ≤ 80 words, the why-it-matters at the bedside",
     foundational: "string — ≤ 100 words, the biochemistry / kinetics",
     papers:       [{ name: "RCT or guideline 2024", year, finding }],   // optional
     alias:        ["string", …]   // optional — additional lookup keys
                                   // (e.g., "AmpC" also looked up as
                                   // "Ambler class C")
   };

   The four prose fields stack in the drawer as expandable sections:
     summary       → always visible header paragraph
     keypoints     → bullets immediately below the header
     bedside       → "Why it matters" subsection
     foundational  → "The biochemistry" subsection (expand-on-demand)
     papers        → "Evidence" tail (optional)

   LOOKUP CONTRACT
   ---------------
   getMechanism(key) → entry | null

   Key resolution (case-insensitive):
     1. Exact MECHANISMS[key]
     2. Any entry whose alias[] includes the key
     3. null — drawer renders nothing (graceful fallback contract)

   Adding a mechanism only requires authoring the entry; the drawer
   reads through this helper so no further wiring is needed.

   SEED CONTENT (PR-7a — 7 entries)
   --------------------------------
     • ESBL                   resistance
     • AmpC                   resistance
     • KPC                    resistance
     • Metallo-β-lactamase    resistance (NDM/VIM/IMP)
     • MRSA / PBP2a           resistance
     • vanA / VRE             resistance
     • Daptomycin             class — the "lipopeptide failure in
                              pneumonia" hook is the single most
                              high-yield mechanistic concept clinicians
                              ask about by name.

   PR-7b-c will broaden to the full enumerated list (17 drug classes
   from DRUG_CLASSES + ~10 resistance mechanisms from MX_CLASSES) per
   the plan's broader-seed decision.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

const MECHANISMS = {

  /* ============= RESISTANCE — β-lactam enzyme ladder ===================== */

  "ESBL": {
    title:  "ESBL — Extended-spectrum β-lactamase",
    family: "resistance",
    alias:  ["extended-spectrum β-lactamase", "Ambler class A", "CTX-M"],
    summary:
      "Plasmid-borne serine β-lactamase (predominantly CTX-M-15 globally) " +
      "that hydrolyzes penicillins and most cephalosporins including " +
      "ceftriaxone and ceftazidime. Avibactam, tazobactam, and clavulanate " +
      "restore the β-lactam in vitro — but in vivo only the carbapenem is " +
      "reliable for serious infection.",
    keypoints: [
      "Mainly E. coli and Klebsiella; CTX-M-15 dominates community-acquired ESBL globally.",
      "Carbapenem (ertapenem or meropenem) is first-line for bacteremia (MERINO trial).",
      "Piperacillin-tazobactam is inferior despite in-vitro susceptibility — do not de-escalate to it.",
      "For ESBL cystitis, oral nitrofurantoin or fosfomycin remains effective (low tissue levels).",
      "Detection drives both the patient regimen and the unit's antibiogram stewardship signal.",
    ],
    bedside:
      "An apparently 'sensitive' pip-tazo MIC report on an ESBL bacteremia " +
      "is a trap. MERINO (JAMA 2018) randomized BSI patients to pip-tazo vs " +
      "meropenem and stopped early for harm in the pip-tazo arm: 12% vs 4% " +
      "mortality. The inoculum effect at the tissue source overwhelms the " +
      "in-vitro MIC — the carbapenem is the workhorse.",
    foundational:
      "CTX-M is a serine β-lactamase (Ambler class A) — nucleophilic serine " +
      "in the active site attacks the β-lactam C2 carbonyl, forming an " +
      "acyl-enzyme intermediate that hydrolyzes to release the inactivated " +
      "antibiotic. CTX-M-15's expanded R1 binding pocket accommodates the " +
      "bulky cephalosporin side chains (oxyimino groups), unlike the parent " +
      "TEM/SHV penicillinases. Inhibitors (tazobactam, clavulanate, avibactam) " +
      "form suicide intermediates that block the active site.",
    papers: [
      { name: "MERINO RCT", year: 2018,
        finding: "Pip-tazo non-inferior to meropenem REJECTED for BSI; mortality 12% vs 4%." },
      { name: "IDSA AMR-GN", year: 2024,
        finding: "Carbapenem first-line for serious ESBL; cystitis-only exception for oral agents." },
    ],
  },

  "AmpC": {
    title:  "AmpC — Chromosomal cephalosporinase",
    family: "resistance",
    alias:  ["Ambler class C", "AmpC cephalosporinase", "inducible AmpC"],
    summary:
      "Chromosomal serine β-lactamase (Ambler class C) carried by Enterobacter " +
      "cloacae complex, K. aerogenes, C. freundii, S. marcescens, M. morganii, " +
      "P. rettgeri, P. stuartii. Inducible — third-gen cephalosporins derepress " +
      "expression mid-course, driving treatment failure. Cefepime is stable to " +
      "AmpC and is preferred per IDSA 2024.",
    keypoints: [
      "Mnemonic SPACE-M: Serratia, Pseudomonas, Acinetobacter, Citrobacter, Enterobacter, Morganella.",
      "Avoid ceftriaxone and pip-tazo — even susceptibility reports can fail mid-course.",
      "Cefepime is preferred for moderate disease; carbapenem for severe.",
      "Risk of derepression highest with E. cloacae complex and K. aerogenes (~20%).",
      "Plasmid-borne AmpC (CMY-2) increasingly seen in E. coli and Klebsiella.",
    ],
    bedside:
      "The classic trap: a ceftriaxone-susceptible Enterobacter on day 1 " +
      "becomes a ceftriaxone-resistant Enterobacter on day 5. The induction " +
      "is mechanistic — β-lactam exposure increases the pool of muropeptide " +
      "recycling intermediates, which displace AmpR's repressor conformation " +
      "and switch it to an activator of ampC transcription. AmpD normally " +
      "clears those intermediates and keeps AmpC repressed; selection of " +
      "AmpD-loss mutants gives stably derepressed (hyperproducing) AmpC. " +
      "Cefepime evades the trap because of poor affinity for the AmpC active " +
      "site (zwitterionic quaternary nitrogen) — substrate, not regulator.",
    foundational:
      "AmpC is a serine β-lactamase but kinetically distinct from class A. " +
      "The active-site serine attacks the β-lactam ring, but the wider " +
      "binding cleft accommodates 7α-substituted cephalosporins (cephamycins) " +
      "that class A enzymes cannot. Avibactam restores activity (ceftaz-avi); " +
      "tazobactam does not. Induction kinetics: β-lactam binds PBP, triggering " +
      "cell-wall fragment recycling, which signals AmpR to derepress AmpC " +
      "expression — a feedback loop that requires no de-novo mutation.",
    papers: [
      { name: "IDSA AMR-GN", year: 2024,
        finding: "Cefepime preferred for moderate AmpC; carbapenem for severe or shock." },
    ],
  },

  "KPC": {
    title:  "KPC — Klebsiella pneumoniae carbapenemase",
    family: "resistance",
    alias:  ["Klebsiella pneumoniae carbapenemase", "Ambler class A carbapenemase", "KPC / OXA-48"],
    summary:
      "Plasmid-borne serine carbapenemase (Ambler class A) that hydrolyzes " +
      "carbapenems plus all earlier β-lactams. The first wave of CRE in the " +
      "US; remains the dominant carbapenemase in much of North America and " +
      "southern Europe. Restored by avibactam, vaborbactam, and relebactam.",
    keypoints: [
      "Three drug options: ceftazidime-avibactam, meropenem-vaborbactam, imipenem-relebactam.",
      "Mortality dropped from ~40% (polymyxin era) to ~10% with ceftaz-avi (Shields 2017).",
      "Resistance to ceftaz-avi emerges via KPC mutations (e.g., D179Y) — surveillance critical.",
      "Carbapenem MIC < 8 may still respond to high-dose extended-infusion meropenem in mild disease.",
      "Always confirm the carbapenemase type — KPC vs OXA-48 vs MBL drives a different agent.",
    ],
    bedside:
      "The transformative moment in MDR Gram-negative care. Before ceftaz-avi " +
      "(2015) and the others, KPC-CRE bacteremia had 40-50% mortality on " +
      "colistin-based combinations. Now < 15% on the novel agents. The single " +
      "decision: confirm the carbapenemase identity before choosing — same " +
      "CRE phenotype can be KPC, OXA-48, NDM, VIM each demanding a different agent.",
    foundational:
      "KPC is structurally a class A β-lactamase like ESBLs, but with a " +
      "widened active-site pocket that accommodates the carbapenem's 6α-1R " +
      "hydroxyethyl group. Avibactam (a diazabicyclooctane) forms a reversible " +
      "carbamate adduct with the active-site serine, blocking turnover. " +
      "Vaborbactam (cyclic boronate) and relebactam (DBO) work similarly. " +
      "These inhibitors share a common limitation: none restore activity " +
      "against the metallo-enzymes (NDM/VIM/IMP) — zinc replaces serine and " +
      "the inhibitor chemistry breaks.",
    papers: [
      { name: "Shields et al.", year: 2017,
        finding: "Ceftaz-avi vs colistin for KPC-CRE: 9% vs 32% 30-day mortality." },
      { name: "TANGO II RCT", year: 2018,
        finding: "Meropenem-vaborbactam superior to best-available therapy for KPC-CRE." },
    ],
  },

  "Metallo-β-lactamase": {
    title:  "MBL — Metallo-β-lactamase (NDM / VIM / IMP)",
    family: "resistance",
    alias:  ["MBL", "NDM", "VIM", "IMP", "Ambler class B", "metallo-β-lactamase"],
    summary:
      "Zinc-dependent β-lactamases (Ambler class B) that hydrolyze all " +
      "β-lactams except aztreonam. NOT inhibited by avibactam, vaborbactam, " +
      "or relebactam. Cefiderocol is the unimolecular option; ceftaz-avi + " +
      "aztreonam exploits aztreonam's MBL stability while avibactam blocks " +
      "co-resident class A/C/D enzymes.",
    keypoints: [
      "NDM-1 emerged from the Indian subcontinent (2008); now globally distributed.",
      "Aztreonam is stable to MBLs but vulnerable to ESBL/AmpC co-resident enzymes.",
      "Ceftaz-avi + aztreonam: avibactam shields aztreonam from the co-resident enzymes.",
      "Cefiderocol delivers itself through TonB-dependent iron transporters (Trojan horse).",
      "Polymyxin remains a last-resort partner; novel agents now first-line.",
    ],
    bedside:
      "The 'every other β-lactam fails' organism. Reading 'MBL' on a culture " +
      "report should immediately collapse the regimen to two options: " +
      "cefiderocol (monotherapy) or ceftaz-avi + aztreonam (combination). " +
      "Add a polymyxin only if you cannot get the novel agent within hours. " +
      "Source control and ID consultation are non-negotiable — MBL-CRE " +
      "mortality without active therapy approaches 60%.",
    foundational:
      "Class B β-lactamases use a Zn²⁺ ion (or two — subclass B1 has " +
      "Zn1+Zn2) to coordinate a hydroxide ion that attacks the β-lactam ring. " +
      "There is no acyl-enzyme intermediate — the chemistry is fundamentally " +
      "different from serine enzymes, which is why serine-targeted inhibitors " +
      "fail. Aztreonam is a monobactam β-lactam — its β-lactam ring stands " +
      "alone without the fused thiazolidine (penicillins), dihydrothiazine " +
      "(cephalosporins), or pyrroline (carbapenems) partner. The MBL active " +
      "site is shaped around that fused bicyclic substrate, so monobactams " +
      "are poor MBL substrates and largely escape hydrolysis (aztreonam still " +
      "needs avibactam to evade co-resident ESBL/AmpC enzymes). Cefiderocol's " +
      "siderophore catechol moiety binds ferric iron, hijacking active uptake " +
      "into the periplasm — concentration outflanks hydrolysis.",
    papers: [
      { name: "CREDIBLE-CR", year: 2021,
        finding: "Cefiderocol non-inferior to best-available for CR-GNR; signal of higher mortality in CRAB subgroup." },
      { name: "Falcone et al.", year: 2022,
        finding: "Ceftaz-avi + aztreonam: 24% mortality vs 52% for other regimens in MBL-CRE BSI." },
    ],
  },

  /* ============= RESISTANCE — non-β-lactam mechanisms ==================== */

  "PBP2a": {
    title:  "PBP2a — The MRSA penicillin-binding protein",
    family: "resistance",
    alias:  ["MRSA", "mecA", "methicillin-resistant Staphylococcus aureus"],
    summary:
      "MRSA expresses an altered penicillin-binding protein (PBP2a, encoded " +
      "by mecA on the SCCmec cassette) with markedly reduced affinity for " +
      "all β-lactams except ceftaroline. Drives the divergent therapy for " +
      "Staphylococcus aureus — cefazolin for MSSA, vancomycin for MRSA — " +
      "and the high mortality of inadequately covered MRSA bacteremia.",
    keypoints: [
      "Vancomycin remains first-line for MRSA bacteremia; AUC/MIC 400–600.",
      "Daptomycin or ceftaroline for vancomycin failure or high-MIC strains.",
      "Linezolid for MRSA pneumonia (best lung penetration); never for endovascular.",
      "Ceftaroline is the only β-lactam with reliable MRSA activity (binds PBP2a allosterically).",
      "PVL toxin (community-acquired MRSA) drives necrotizing pneumonia and skin disease.",
    ],
    bedside:
      "MRSA is now ~30% of US S. aureus isolates. The standard of care for " +
      "MRSA bacteremia is vancomycin AUC-guided dosing (load 20-25 mg/kg, " +
      "target AUC/MIC 400-600). Persistent positives at 72 h or vanco MIC ≥ " +
      "2 should trigger switch to daptomycin 10 mg/kg ± ceftaroline. " +
      "Linezolid is bacteriostatic and contraindicated in endovascular infection " +
      "but is the best lung-penetrating agent — pulmonary MRSA is its niche.",
    foundational:
      "Native staphylococcal PBPs (1, 2, 3, 4) are inactivated by β-lactam " +
      "acylation of their active-site serines. PBP2a is structurally distinct: " +
      "the active-site serine sits in a closed conformation that excludes " +
      "most β-lactams. Ceftaroline binds an allosteric site that triggers " +
      "active-site opening, restoring acylation. SCCmec is a mobile genetic " +
      "element carrying mecA plus its regulators (mecI, mecR1) and a recombinase " +
      "(ccrAB); horizontal transfer between staphylococci is well documented.",
  },

  "vanA": {
    title:  "vanA — Vancomycin resistance in Enterococcus",
    family: "resistance",
    alias:  ["VRE", "vanA", "vancomycin-resistant enterococcus"],
    summary:
      "Inducible operon (vanA on Tn1546) re-engineers the peptidoglycan " +
      "precursor terminus from D-Ala-D-Ala to D-Ala-D-Lac. Vancomycin " +
      "binding affinity drops 1000-fold; clinical resistance is absolute. " +
      "Predominantly E. faecium; E. faecalis remains usually vancomycin-susceptible.",
    keypoints: [
      "Daptomycin 8-12 mg/kg or linezolid first-line for VRE bacteremia.",
      "Ampicillin for E. faecalis is the divergent enterococcal answer.",
      "vanB is teicoplanin-susceptible in vitro but rare in N. America.",
      "GI colonization precedes infection — contact precautions break transmission.",
      "Linezolid trumps dapto in pulmonary and CSF infection; dapto trumps in bacteremia.",
    ],
    bedside:
      "VRE is the second-most-common hospital pathogen by some series. The " +
      "clinical lever: identify it FAST. PCR-based identification (Verigene, " +
      "Xpert vanA/B) on positive bottles cuts time to active therapy by 24-48 h. " +
      "For E. faecium VRE bacteremia, daptomycin 8-12 mg/kg (high-dose) outperforms " +
      "linezolid for clearance; linezolid wins for pulmonary or CSF disease.",
    foundational:
      "The native peptidoglycan precursor terminus is D-Ala-D-Ala, which " +
      "vancomycin binds via five hydrogen bonds. vanA encodes vanS/vanR (the " +
      "two-component induction sensor), vanH (a D-lactate dehydrogenase), " +
      "vanA (a ligase that pairs D-Ala with D-Lac), vanX (a D,D-dipeptidase " +
      "that destroys the native D-Ala-D-Ala precursor), and vanZ. The result: " +
      "vancomycin sees only D-Ala-D-Lac at the cell-wall surface, which forms " +
      "an ester bond rather than the native amide — losing one hydrogen bond " +
      "drops affinity 1000×.",
  },

  /* ============= CLASS — daptomycin (the pulmonary-failure hook) ========= */

  "Daptomycin": {
    title:  "Daptomycin — Lipopeptide membrane depolarizer",
    family: "class",
    alias:  ["lipopeptide"],
    summary:
      "Calcium-dependent insertion into the bacterial cytoplasmic membrane " +
      "drives oligomerization and depolarization — cidal against Gram-positive " +
      "pathogens including MRSA and VRE. Functionally inactivated by pulmonary " +
      "surfactant: not a pneumonia drug, period.",
    keypoints: [
      "MRSA / VRE bacteremia: 8-10 mg/kg; > 10 mg/kg for endocarditis / persistent BSI.",
      "Never for pneumonia — surfactant binding inactivates the drug at the alveolar surface.",
      "Weekly CK + drug-induced eosinophilic pneumonitis surveillance.",
      "Cross-resistance with vancomycin via membrane charge / phospholipid changes (mprF, cls).",
      "Synergistic with β-lactams in some persistent MRSA bacteremia (DAP + ceftaroline).",
    ],
    bedside:
      "The single most-asked mechanism question in the ID consult: why does " +
      "daptomycin fail in pneumonia even when the organism is susceptible? " +
      "Pulmonary surfactant (phosphatidylcholine + lipid components) sequesters " +
      "the lipopeptide before it reaches its target. The drug is concentrated " +
      "in the alveolar surface film, not the bacteria. A real, irreversible, " +
      "mechanistic answer — the textbook 'do not use in pneumonia' rule has a " +
      "physical chemistry behind it.",
    foundational:
      "Daptomycin's tail (decanoic acid) anchors to phosphatidylglycerol in " +
      "the bacterial membrane in a calcium-dependent two-step process: first " +
      "calcium-1 coordinates the heads of two daptomycin monomers, then " +
      "calcium-2 triggers oligomerization into the membrane-spanning pore. " +
      "The depolarization disrupts cell-division machinery; cidal action is " +
      "concentration-dependent (Cmax/MIC ≥ 60 target). Surfactant binding " +
      "occurs at the same lipid-tail recognition step — the drug never " +
      "reaches the bacterium when alveolar surfactant is present.",
    papers: [
      { name: "Silverman et al.", year: 2005,
        finding: "First mechanistic demonstration of surfactant sequestration — explained the failed CAP RCT." },
    ],
  },

};

/* Build alias map once at module load. Case-insensitive lookup against
   both canonical key and any alias[] string. */
const _ALIAS_INDEX = (() => {
  const m = new Map();
  for(const key of Object.keys(MECHANISMS)) {
    m.set(key.toLowerCase(), key);
    const entry = MECHANISMS[key];
    if(Array.isArray(entry.alias)) {
      for(const a of entry.alias) m.set(String(a).toLowerCase(), key);
    }
  }
  return m;
})();

/* Resolve a free-text mechanism / class name to its MECHANISMS entry.
   Case-insensitive. Returns null when nothing matches (drawer renders
   nothing — graceful-fallback contract). */
function getMechanism(key) {
  if(!key || typeof key !== "string") return null;
  const canonical = _ALIAS_INDEX.get(key.toLowerCase());
  return canonical ? MECHANISMS[canonical] : null;
}

/* All authored mechanism keys — used by audit + by future TermChip
   pattern that auto-decorates inline mentions. */
function getAllMechanismKeys() {
  return Object.keys(MECHANISMS);
}

export { MECHANISMS, getMechanism, getAllMechanismKeys };
