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
      "The trap: a ceftriaxone-susceptible Enterobacter on day 1 becomes " +
      "ceftriaxone-resistant on day 5. β-lactam exposure increases " +
      "muropeptide recycling intermediates → those flip AmpR from repressor " +
      "to activator of ampC transcription. AmpD clears the intermediates and " +
      "keeps AmpC quiet; AmpD-loss mutants give stably derepressed " +
      "(hyperproducing) AmpC. Cefepime evades the trap by poor affinity for " +
      "the AmpC active site (zwitterionic quaternary nitrogen).",
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
      "Class B β-lactamases use Zn²⁺ (subclass B1 has Zn1+Zn2) to coordinate " +
      "a hydroxide attacking the β-lactam ring — no acyl-enzyme intermediate, " +
      "so serine-targeted inhibitors fail. Aztreonam is a monobactam β-lactam: " +
      "its β-lactam ring stands alone, without the fused thiazolidine, " +
      "dihydrothiazine, or pyrroline partner. The MBL active site is shaped " +
      "around that fused bicyclic substrate, so monobactams escape hydrolysis " +
      "(aztreonam still needs avibactam to shield co-resident ESBL/AmpC). " +
      "Cefiderocol's catechol moiety binds ferric iron, hijacking active " +
      "uptake — concentration outflanks hydrolysis.",
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

  /* ============= CLASS — β-lactam family (Wave 5 CL-6 M-1) =============== */

  "Penicillins": {
    title:  "Penicillins — Natural β-lactam transpeptidase inhibitors",
    family: "class",
    alias:  ["penicillin G", "penicillin V", "natural penicillin"],
    summary:
      "Natural penicillins (penicillin G IV, penicillin V oral) — the " +
      "foundational β-lactams. Irreversibly acylate the active-site serine " +
      "of bacterial transpeptidases (PBPs), halting peptidoglycan " +
      "crosslinking and triggering autolysin-mediated lysis. Narrow " +
      "Gram-positive spectrum: streptococci, susceptible enterococci, " +
      "Treponema, oral anaerobes, meningococci. Staphylococci are nearly " +
      "uniformly resistant via β-lactamase production.",
    keypoints: [
      "Streptococcus pyogenes and Treponema pallidum remain 100% penicillin-susceptible — no documented clinical resistance.",
      "Penicillin G dosing: 18–24 million units/day continuous or divided q4h for severe streptococcal disease.",
      "Time-dependent killing: fT>MIC ≥ 50% drives efficacy; extended infusion improves attainment.",
      "Crosses inflamed meninges; remains first-line for neurosyphilis and susceptible meningococcal meningitis.",
      "Non-anaphylactic reported allergy almost always allows cephalosporin or carbapenem use safely.",
    ],
    bedside:
      "When a clinical isolate reads pen-S, narrow back to penicillin G — " +
      "narrower spectrum, faster cidality, and lower collateral C. difficile " +
      "risk than broad β-lactams. The classic example: viridans-group strep " +
      "endocarditis at MIC ≤ 0.12. Penicillin G 18–24 MU/day plus gentamicin " +
      "shortens therapy to two weeks (vs four with ceftriaxone monotherapy) " +
      "per AHA endocarditis guidelines.",
    foundational:
      "Penicillin's β-lactam ring mimics the D-Ala-D-Ala terminus of the " +
      "nascent peptidoglycan pentapeptide. The active-site serine of the " +
      "transpeptidase (PBP) attacks the strained β-lactam carbonyl, forming " +
      "a covalent acyl-enzyme that hydrolyzes only very slowly — effectively " +
      "irreversible. With PBPs disabled, peptidoglycan crosslinking fails; " +
      "the cell wall weakens and endogenous autolysins (LytA in pneumococcus) " +
      "fragment it. Cidality requires active growth — explaining the " +
      "antagonism observed with bacteriostatic partners in some models.",
    papers: [
      { name: "Fleming", year: 1929,
        finding: "Original observation: Penicillium notatum lyses staphylococci on adjacent agar — launched the antibiotic era." },
      { name: "AHA Endocarditis", year: 2015,
        finding: "Penicillin G + gentamicin × 2 weeks cures viridans strep endocarditis at MIC ≤ 0.12 mcg/mL." },
    ],
  },

  "Anti-staphylococcal penicillins": {
    title:  "Anti-staph penicillins — MSSA-targeted isoxazolyl β-lactams",
    family: "class",
    alias:  ["nafcillin", "oxacillin", "anti-staph PCN", "isoxazolyl penicillins"],
    summary:
      "Isoxazolyl penicillins (nafcillin, oxacillin, cloxacillin, " +
      "dicloxacillin, flucloxacillin) — the MSSA workhorses. A bulky " +
      "3-methyl-5-aryl-isoxazole side chain sterically shields the β-lactam " +
      "from staphylococcal β-lactamase while preserving high PBP affinity. " +
      "First-line over vancomycin for MSSA bacteremia: faster sterilization, " +
      "lower mortality, no cross-coverage of MRSA (PBP2a).",
    keypoints: [
      "Nafcillin/oxacillin IV outperform vancomycin for MSSA bacteremia — switch the moment the speciation reports.",
      "Cefazolin is an accepted alternative: better tolerated, no inoculum effect concern for endovascular routine MSSA.",
      "Nafcillin: hepatic clearance, interstitial nephritis risk, vesicant — central line preferred.",
      "Oral dicloxacillin / flucloxacillin: high serum concentrations, used for step-down or mild SSTI.",
      "No activity against Gram-negatives, enterococci, or MRSA — purely an anti-staphylococcal niche agent.",
    ],
    bedside:
      "MSSA bacteremia mortality drops substantially when a β-lactam " +
      "replaces vancomycin within 48 h. McDanel (CID 2017) showed cefazolin " +
      "and nafcillin both outperformed vancomycin (mortality 21% nafcillin " +
      "vs 32% vancomycin). Cefazolin is often preferred for tolerability; " +
      "nafcillin retains the edge in CNS sources due to better penetration. " +
      "Never use anti-staph penicillins empirically before MRSA is excluded.",
    foundational:
      "The β-lactam pharmacophore is identical to penicillin G, but the " +
      "6-acyl side chain carries a bulky 3-methyl-5-phenyl-isoxazole group " +
      "(oxacillin/cloxacillin/dicloxacillin/flucloxacillin) or a " +
      "2-ethoxy-1-naphthyl group (nafcillin). These substitutions sterically " +
      "occlude the active-site cleft of staphylococcal PC1 β-lactamase " +
      "(BlaZ), preventing acylation of the hydrolytic serine, while still " +
      "fitting the larger PBP active sites — preserving target affinity. " +
      "The trade-off: zero activity against PBP2a (MRSA) and no Gram-negative " +
      "penetration through outer-membrane porins.",
    papers: [
      { name: "McDanel et al.", year: 2017,
        finding: "Cefazolin and nafcillin outperformed vancomycin for MSSA bacteremia (21% vs 32% mortality in propensity-matched cohort)." },
      { name: "Loubet et al.", year: 2018,
        finding: "Cefazolin non-inferior to anti-staph penicillins for MSSA bacteremia with fewer adverse events in meta-analysis." },
    ],
  },

  "Aminopenicillins": {
    title:  "Aminopenicillins — Extended-spectrum penicillins",
    family: "class",
    alias:  ["amoxicillin", "ampicillin"],
    summary:
      "Amoxicillin (oral) and ampicillin (IV) — penicillins with an amino " +
      "group on the C6 side chain that confers Gram-negative reach. Cover " +
      "non-β-lactamase E. coli, Proteus mirabilis, Haemophilus, Listeria, " +
      "and enterococci. The drug of choice for Listeria meningitis, " +
      "enterococcal endocarditis, and uncomplicated otitis. β-lactamase-" +
      "producing organisms require a paired inhibitor.",
    keypoints: [
      "Ampicillin (with gentamicin or ceftriaxone) is first-line for E. faecalis endocarditis.",
      "Listeria monocytogenes meningitis: ampicillin 2 g IV q4h plus gentamicin synergy.",
      "Amoxicillin remains first-line for community-acquired otitis, sinusitis, and strep pharyngitis.",
      "Rising E. coli resistance — ~50% community urinary isolates β-lactamase positive in many regions.",
      "Mononucleosis-associated rash with ampicillin is non-allergic; no true penicillin sensitization.",
    ],
    bedside:
      "The ampicillin-ceftriaxone regimen for E. faecalis endocarditis " +
      "(Fernández-Hidalgo 2013) eliminated the need for gentamicin co-therapy " +
      "— equivalent cure rates with markedly less nephrotoxicity. For " +
      "Listeria, every hour of delayed ampicillin in suspected " +
      "rhombencephalitis matters; empirical ampicillin coverage is mandatory " +
      "in adults > 50, immunocompromised, and pregnant patients with possible " +
      "bacterial meningitis.",
    foundational:
      "The amino group at the alpha carbon of the C6 side chain adds a " +
      "positive charge that improves passage through Gram-negative " +
      "outer-membrane porins (OmpF, OmpC), extending the spectrum beyond " +
      "penicillin G. PBP binding remains identical to penicillin G " +
      "(PBP1a/1b/2/3), so killing kinetics and Gram-positive coverage are " +
      "preserved. The amino group, however, leaves the β-lactam fully " +
      "exposed to staphylococcal and TEM/SHV β-lactamases — hence the " +
      "universal pairing with clavulanate or sulbactam for ambulatory " +
      "empiric use.",
    papers: [
      { name: "Fernández-Hidalgo et al.", year: 2013,
        finding: "Ampicillin + ceftriaxone equivalent to ampicillin + gentamicin for E. faecalis endocarditis with less nephrotoxicity." },
      { name: "Mylonakis et al.", year: 1998,
        finding: "Listeria meningitis review: ampicillin plus aminoglycoside reduced mortality vs single agent in severe disease." },
    ],
  },

  "Anti-pseudomonal penicillins": {
    title:  "Anti-pseudomonal penicillins — Acyl/ureido β-lactams",
    family: "class",
    alias:  ["piperacillin", "ureidopenicillin"],
    summary:
      "Piperacillin and ticarcillin — penicillins re-engineered with an " +
      "acyl side chain that traverses the Pseudomonas outer-membrane porin " +
      "OprD. Cover most Enterobacterales, Pseudomonas aeruginosa, and many " +
      "anaerobes. Hydrolyzed by virtually all β-lactamases, so always paired " +
      "with a β-lactamase inhibitor (piperacillin-tazobactam) in clinical " +
      "practice.",
    keypoints: [
      "Piperacillin-tazobactam 4.5 g IV q8h (extended infusion) — workhorse for empiric sepsis.",
      "Ticarcillin is largely retired in the US; piperacillin/tazobactam dominates the class.",
      "Avoid for serious ESBL infection (MERINO) and for AmpC inducers — even on susceptible report.",
      "Extended infusion (BLING-III, MERCY) improves attainment; mortality benefit modest but consistent.",
      "Watch for hypokalemia, platelet dysfunction, and AKI when co-administered with vancomycin.",
    ],
    bedside:
      "Pip-tazo remains the empiric backbone for hospital-acquired sepsis " +
      "where Pseudomonas coverage matters. BLING-III (Dulhunty 2024) " +
      "randomized critically ill patients to continuous vs intermittent " +
      "β-lactam dosing — 90-day mortality 24.9% vs 26.8%, just missing " +
      "significance but consistent with prior meta-analyses. The MERINO " +
      "trap: never use it for confirmed ESBL bacteremia, even if pip-tazo " +
      "MIC reports susceptible — switch to a carbapenem.",
    foundational:
      "The class divides by side-chain chemistry: carboxypenicillins " +
      "(ticarcillin) carry a carboxyl on the alpha carbon; ureidopenicillins " +
      "(piperacillin, mezlocillin, azlocillin) carry a substituted urea. " +
      "Both confer net charge and bulk that allow transit through OprD and " +
      "OmpF porins of Pseudomonas and Enterobacterales — the " +
      "carboxypenicillins less efficiently than the ureidopenicillins. Once " +
      "inside, the same PBP1/2/3 acylation drives lysis. Susceptibility to " +
      "all serine β-lactamases (TEM, SHV, AmpC, ESBL, KPC) mandates pairing " +
      "with tazobactam in modern practice.",
    papers: [
      { name: "BLING-III RCT", year: 2024,
        finding: "Continuous infusion β-lactam in sepsis: 90-day mortality 24.9% vs 26.8% intermittent — narrowly non-significant." },
      { name: "MERCY RCT", year: 2023,
        finding: "Continuous-infusion meropenem vs intermittent in sepsis — no clinical-cure benefit; PK target attainment higher." },
    ],
  },

  "β-lactam/β-lactamase-inhibitor combos": {
    title:  "BLBLI combos — β-lactam plus β-lactamase inhibitor",
    family: "class",
    alias:  ["BLBLI", "β-lactamase inhibitor", "piperacillin-tazobactam", "amoxicillin-clavulanate"],
    summary:
      "A β-lactam paired with an inhibitor that disables the bacterial " +
      "β-lactamase, restoring activity. Older combinations (amox-clav, " +
      "amp-sulbactam, pip-tazo) cover plasmid-encoded class A enzymes; newer " +
      "DBO/boronate pairings (ceftaz-avi, mero-vab, imipenem-rele, " +
      "ceftolozane-tazo) reach KPC, AmpC, OXA-48, and difficult Pseudomonas.",
    keypoints: [
      "Clavulanate, tazobactam, sulbactam — classic suicide inhibitors of class A serine enzymes.",
      "Avibactam (DBO) and relebactam restore activity against KPC and AmpC; vaborbactam covers KPC.",
      "No inhibitor restores activity against metallo-β-lactamases (NDM/VIM/IMP) — zinc, not serine.",
      "Ceftolozane-tazobactam excels against MDR Pseudomonas via stable PBP3 binding.",
      "Ceftaz-avi + aztreonam: the off-label combo for MBL-producing CRE awaiting cefiderocol access.",
    ],
    bedside:
      "These pairings transformed CRE survival. Shields (2017) showed " +
      "ceftaz-avi cut KPC bacteremia mortality from 32% (colistin era) to " +
      "9%. The right inhibitor depends on the right enzyme — KPC → " +
      "avi/vab/rele; OXA-48 → avi only; AmpC → avi or rele; MBL → none, " +
      "aztreonam is the lifeboat. Confirming the carbapenemase identity by " +
      "molecular assay (Xpert Carba-R) before agent selection is now standard.",
    foundational:
      "Suicide inhibitors (clavulanate, sulbactam, tazobactam) carry their " +
      "own β-lactam ring that the bacterial β-lactamase opens, forming a " +
      "covalent acyl-enzyme intermediate that rearranges into an " +
      "inactivating species — the enzyme destroys itself. " +
      "Diazabicyclooctanes (avibactam, relebactam) and cyclic boronates " +
      "(vaborbactam) form reversible carbamate or boronate-ester adducts " +
      "with the active-site serine, blocking turnover without permanent " +
      "enzyme inactivation. None engage metallo-enzymes, whose " +
      "Zn²⁺-coordinated hydroxide mechanism lacks the serine target.",
    papers: [
      { name: "Shields et al.", year: 2017,
        finding: "Ceftaz-avi cut KPC-CRE bacteremia mortality from 32% (colistin) to 9% in propensity-matched cohort." },
      { name: "ASPECT-NP", year: 2019,
        finding: "Ceftolozane-tazo non-inferior to meropenem for ventilated nosocomial pneumonia, signal favoring novel agent." },
    ],
  },

  "1st/2nd-gen cephalosporins": {
    title:  "1st/2nd-gen cephalosporins — MSSA / community Gram-negatives",
    family: "class",
    alias:  ["cefazolin", "cephalexin", "cefuroxime", "first-gen cephalosporin", "second-gen cephalosporin"],
    summary:
      "Early-generation cephalosporins. First-gen (cefazolin, cephalexin) " +
      "target MSSA, streptococci, and some community E. coli/Klebsiella/" +
      "Proteus. Second-gen splits into true cephs (cefuroxime — adds " +
      "Haemophilus and modest Gram-negative gain) and cephamycins (cefoxitin, " +
      "cefotetan — anaerobic coverage including Bacteroides fragilis via " +
      "altered PBP affinity).",
    keypoints: [
      "Cefazolin 2 g IV q8h is gold-standard surgical prophylaxis and MSSA bacteremia therapy.",
      "Cephalexin: oral step-down for MSSA SSTI; high serum levels, simple QID dosing.",
      "Cefuroxime adds H. influenzae and M. catarrhalis to first-gen spectrum — community pneumonia.",
      "Cefoxitin and cefotetan reach Bacteroides — appendicitis and intra-abdominal prophylaxis.",
      "No reliable Pseudomonas, AmpC organisms, ESBL, or MRSA coverage in this generation.",
    ],
    bedside:
      "Cefazolin's quiet dominance: it matches nafcillin for MSSA bacteremia " +
      "with fewer adverse events (Loubet 2018 meta-analysis), beats " +
      "vancomycin handily, and remains the universal surgical-prophylaxis " +
      "backbone — single dose within 60 min of incision (vancomycin within " +
      "120 min) cuts SSI by ~50%. The historical inoculum-effect concern " +
      "for deep MSSA endovascular disease has not borne out in modern " +
      "propensity-matched cohorts.",
    foundational:
      "Cephalosporins share the β-lactam ring fused to a six-membered " +
      "dihydrothiazine (vs penicillin's five-membered thiazolidine), " +
      "conferring greater β-lactamase stability and a different PBP-binding " +
      "profile. First-gen R1 side chains (cefazolin's tetrazolyl-thiomethyl, " +
      "cephalexin's phenyl-glycyl) confer high MSSA PBP affinity and limited " +
      "porin transit. Second-gen cephamycins (cefoxitin, cefotetan) add a " +
      "7α-methoxy substituent that sterically blocks many class A " +
      "β-lactamases — explaining their preserved anaerobic coverage, since " +
      "Bacteroides fragilis relies heavily on chromosomal cephalosporinases.",
    papers: [
      { name: "Loubet et al.", year: 2018,
        finding: "Cefazolin non-inferior to anti-staph penicillins for MSSA bacteremia with fewer adverse drug events." },
      { name: "Bratzler et al.", year: 2013,
        finding: "ASHP surgical-prophylaxis guideline: single-dose cefazolin within 60 min reduces SSI ~50% across procedures." },
    ],
  },

  "3rd/4th/5th-gen cephalosporins": {
    title:  "3rd/4th/5th-gen cephalosporins — Broad / AmpC-stable / anti-MRSA",
    family: "class",
    alias:  ["ceftriaxone", "cefepime", "ceftaroline", "third-gen cephalosporin"],
    summary:
      "Third-gen (ceftriaxone, cefotaxime, ceftazidime) extend Gram-negative " +
      "spectrum via expanded R1 side chains. Fourth-gen cefepime adds AmpC " +
      "stability and Pseudomonas reach with a zwitterionic structure. " +
      "Fifth-gen ceftaroline and ceftobiprole achieve MRSA activity by " +
      "binding the PBP2a allosteric site. None reliably cover ESBL, " +
      "anaerobes, or enterococci.",
    keypoints: [
      "Ceftriaxone 2 g IV daily: gold-standard for pneumococcal meningitis, CAP, gonorrhea, neuro-Lyme.",
      "Ceftazidime: anti-pseudomonal but weak Gram-positive; cefepime preferred when both matter.",
      "Cefepime is the AmpC-stable workhorse (IDSA 2024) — first-line for Enterobacter, Serratia, Citrobacter.",
      "Ceftaroline: the only β-lactam reliably active against MRSA; FDA-approved for SSTI/CAP.",
      "Cefepime neurotoxicity (encephalopathy, NCSE) in renal impairment — dose-reduce aggressively.",
    ],
    bedside:
      "Ceftriaxone is the most-prescribed inpatient β-lactam globally — " +
      "convenient OD dosing, broad utility, and CSF penetration suffice for " +
      "most community pneumonia and meningitis. The AmpC trap (Enterobacter, " +
      "K. aerogenes, Citrobacter, Serratia, M. morganii, P. rettgeri) " +
      "demands cefepime instead — ceftriaxone can fail mid-course as " +
      "inducible AmpC derepresses. Ceftaroline (Corey 2010) restored " +
      "β-lactam access to MRSA but remains a niche second-line agent.",
    foundational:
      "Third-gen R1 side chains (oxyimino group on " +
      "ceftriaxone/cefotaxime/ceftazidime) sterically protect against many " +
      "class A β-lactamases but invite hydrolysis by CTX-M ESBLs. Cefepime's " +
      "quaternary-nitrogen N4-methyl-pyrrolidinium creates a zwitterion that " +
      "traverses outer-membrane porins rapidly and resists AmpC binding. " +
      "Ceftaroline carries a 1,2,4-thiadiazole + pyridinium-thiazole that — " +
      "uniquely — binds an allosteric pocket of MRSA PBP2a, triggering " +
      "conformational opening of the closed active-site cleft so the " +
      "β-lactam can acylate the catalytic serine. Ceftobiprole shares the " +
      "allosteric strategy with slightly broader Gram-negative reach.",
    papers: [
      { name: "Corey et al. (CANVAS)", year: 2010,
        finding: "Ceftaroline non-inferior to vancomycin/aztreonam for complicated SSTI including MRSA — pivotal FDA registration trial." },
      { name: "IDSA AMR-GN", year: 2024,
        finding: "Cefepime preferred over ceftriaxone for moderate AmpC-producer infection; carbapenem for severe disease or shock." },
    ],
  },

  "Carbapenems": {
    title:  "Carbapenems — Broadest-spectrum β-lactams",
    family: "class",
    alias:  ["meropenem", "ertapenem", "imipenem", "carbapenem class"],
    summary:
      "Ertapenem, meropenem, imipenem-cilastatin, doripenem — broadest " +
      "β-lactams in routine use. Hydrolytically stable to most β-lactamases " +
      "including ESBLs and AmpC; bind PBP1/2/3 across both Gram-positive and " +
      "Gram-negative organisms. First-line for serious ESBL infection " +
      "(MERINO), AmpC organism bacteremia, and broad empiric coverage in " +
      "septic shock with prior MDR risk.",
    keypoints: [
      "Meropenem 1–2 g IV q8h (extended infusion) — workhorse for ESBL, AmpC, and polymicrobial sepsis.",
      "Ertapenem OD dosing — outpatient-friendly but no Pseudomonas, Acinetobacter, or enterococcal activity.",
      "Imipenem-cilastatin: paired with renal dehydropeptidase inhibitor; seizure risk in renal impairment.",
      "Defeated by carbapenemases (KPC, NDM, VIM, OXA-48) — switch to ceftaz-avi, mero-vab, or cefiderocol.",
      "Carbapenem-sparing strategies (cefepime for AmpC, fosfomycin for ESBL cystitis) reduce CRE selection.",
    ],
    bedside:
      "MERINO (Harris JAMA 2018) cemented carbapenems as standard for ESBL " +
      "bacteremia: meropenem 4% vs piperacillin-tazobactam 12% 30-day " +
      "mortality. The carbapenem-MIC argument disappears when the inoculum " +
      "is high (endovascular, abscess, deep-tissue). Ertapenem's once-daily " +
      "dose is OPAT-friendly but is wrong for ICU sepsis where Pseudomonas " +
      "matters — meropenem is the broader spectrum default for hospital " +
      "empiric coverage.",
    foundational:
      "Carbapenems share a five-membered ring fused to the β-lactam, with " +
      "the sulfur of penicillin replaced by carbon and an unusual " +
      "trans-6-hydroxyethyl side chain. That stereochemistry sterically " +
      "blocks the active-site serine of most β-lactamases (TEM, SHV, AmpC, " +
      "CTX-M) — the enzyme cannot productively acylate. Carbapenemases " +
      "(class A KPC, class B MBL, class D OXA-48) evolved widened or " +
      "repositioned active-site geometry to accommodate the carbapenem. " +
      "Once inside, carbapenems bind PBP2 (Gram-negatives) and PBP1/3 " +
      "(Gram-positives) with high affinity, driving rapid lysis.",
    papers: [
      { name: "MERINO RCT", year: 2018,
        finding: "Meropenem 4% vs piperacillin-tazobactam 12% mortality for ESBL bacteremia — established carbapenem as standard." },
      { name: "TANGO I", year: 2018,
        finding: "Meropenem-vaborbactam non-inferior to piperacillin-tazobactam for complicated UTI including ESBL pathogens." },
    ],
  },

  "Monobactams": {
    title:  "Monobactams — Aztreonam, the MBL-stable β-lactam",
    family: "class",
    alias:  ["aztreonam", "monobactam class"],
    summary:
      "Aztreonam — the sole clinically available monobactam. A single " +
      "β-lactam ring without a fused partner ring binds PBP3 selectively " +
      "in Gram-negative bacteria. Pseudomonas, Enterobacterales, and " +
      "Haemophilus covered; no Gram-positive or anaerobic activity. " +
      "Crucially, aztreonam IS a β-lactam (monobactam = single β-lactam " +
      "ring) but survives metallo-β-lactamases — the lifeboat against " +
      "NDM/VIM/IMP.",
    keypoints: [
      "Aztreonam 2 g IV q8h — Gram-negative-only β-lactam with anti-pseudomonal activity.",
      "Safe in true IgE-mediated penicillin allergy (no shared R1 side chain except with ceftazidime).",
      "Metallo-β-lactamase-stable: pairs with ceftaz-avi for MBL-producing CRE awaiting cefiderocol.",
      "Hydrolyzed by ESBL, AmpC, KPC, OXA-48 — needs avibactam to shield co-resident enzymes.",
      "No activity against Gram-positives, anaerobes, or Acinetobacter — narrow but reliable.",
    ],
    bedside:
      "Aztreonam fills two narrow niches: severe Gram-negative infection " +
      "in confirmed IgE-mediated penicillin allergy where carbapenem " +
      "cross-reactivity is feared, and MBL-producing CRE where every other " +
      "β-lactam fails. Falcone (2022) reported 24% mortality with ceftaz-avi " +
      "+ aztreonam vs 52% with other regimens for MBL bacteremia. The " +
      "pairing exploits aztreonam's MBL stability while avibactam shields " +
      "it from co-resident class A/C/D serine enzymes.",
    foundational:
      "Aztreonam IS a β-lactam — a monobactam carries a single β-lactam " +
      "ring without the fused thiazolidine (penicillin), dihydrothiazine " +
      "(cephalosporin), or pyrroline (carbapenem) partner. The N1 sulfonate " +
      "replaces the fused-ring carboxylate as the recognition handle for " +
      "PBP3 in Gram-negatives. Metallo-β-lactamase active sites evolved to " +
      "accommodate the bicyclic fused substrates of " +
      "penicillins/cephalosporins/carbapenems — the open Zn²⁺ pocket is " +
      "geometrically tuned to those scaffolds and simply does not " +
      "productively engage a monocyclic monobactam. Aztreonam survives MBL " +
      "hydrolysis on this geometric grounds, not by lacking the β-lactam " +
      "itself.",
    papers: [
      { name: "Falcone et al.", year: 2022,
        finding: "Ceftaz-avi + aztreonam: 24% mortality vs 52% other regimens in MBL-producing CRE bacteremia cohort." },
      { name: "REVISIT trial", year: 2024,
        finding: "Aztreonam-avibactam non-inferior to meropenem ± colistin for serious Gram-negative infection including MBL producers." },
    ],
  },

  /* ============= RESISTANCE — CL-6 M-3 enzymes + target processes ======== */

  "OXA-48": {
    title:  "OXA-48 — Class D oxacillinase carbapenemase",
    family: "resistance",
    alias:  ["OXA-48-like", "blaOXA-48", "Ambler D carbapenemase"],
    summary:
      "Plasmid-borne Ambler class D serine carbapenemase, endemic across " +
      "the Mediterranean, Middle East, and North Africa. Hydrolyzes " +
      "carbapenems weakly but reliably; spares third-generation " +
      "cephalosporins. Treatment hinges on ceftazidime-avibactam — the only " +
      "β-lactamase inhibitor combination that restores activity against OXA-48.",
    keypoints: [
      "Ceftazidime-avibactam is the workhorse — avibactam inhibits OXA-48 carbamylation.",
      "Meropenem-vaborbactam does NOT restore activity against OXA-48 (vaborbactam misses class D).",
      "Imipenem-relebactam also inactive — DBO inhibitor spectrum stops at class A/C.",
      "Ceftriaxone usually still in vitro active — OXA-48 weakly hydrolyzes oxyimino-cephalosporins.",
      "Endemic to Mediterranean rim, Turkey, North Africa; rising in U.S. imported cases.",
    ],
    bedside:
      "Reading 'OXA-48' on a CRE report should immediately steer the regimen " +
      "to ceftazidime-avibactam. The classic trap: clinicians reach for " +
      "meropenem-vaborbactam expecting the same KPC paradigm, but vaborbactam " +
      "(a cyclic boronate) cannot inhibit the class D serine. Co-resident " +
      "ESBL/AmpC enzymes often extend the cephalosporin resistance and " +
      "demand the avibactam shield regardless.",
    foundational:
      "OXA-48 is structurally a class D β-lactamase: an active-site serine " +
      "carbamylated by a nearby lysine, generating the nucleophile that " +
      "attacks the β-lactam carbonyl. Unlike class A KPC, OXA-48's narrow " +
      "active site weakly accommodates carbapenems and excludes most " +
      "expanded-spectrum cephalosporins. Avibactam's diazabicyclooctane core " +
      "reversibly acylates the active-site serine, blocking turnover. " +
      "Vaborbactam and relebactam bind class A/C serines but miss class D " +
      "carbamylated geometry — the chemistry breaks.",
    papers: [
      { name: "IDSA AMR-GN guidance", year: 2024,
        finding: "Ceftazidime-avibactam first-line for OXA-48 CRE; meropenem-vaborbactam and imipenem-relebactam not recommended." },
    ],
  },

  "OXA-23": {
    title:  "OXA-23 — Acinetobacter carbapenemase",
    family: "resistance",
    alias:  ["blaOXA-23", "OXA-23-like", "Acinetobacter OXA"],
    summary:
      "Class D oxacillinase carried on plasmids and chromosomal transposons " +
      "of Acinetobacter baumannii — the dominant carbapenem-resistance " +
      "mechanism in CRAB worldwide. Hydrolyzes imipenem and meropenem. " +
      "Treatment options remain limited: sulbactam-durlobactam (Xacduro, FDA " +
      "May 2023), high-dose ampicillin-sulbactam, or polymyxin combinations.",
    keypoints: [
      "Sulbactam-durlobactam is the targeted FDA-approved option (ATTACK trial 2023).",
      "High-dose ampicillin-sulbactam (9 g sulbactam/day) attacks PBP3 directly.",
      "Cefiderocol is an option but CREDIBLE-CR signaled higher mortality in CRAB subgroup.",
      "Polymyxin/colistin remains a partner, never solo — efficacy data are weak.",
      "Most 'treatment' regimens carry low-quality evidence; mortality remains 40-60%.",
    ],
    bedside:
      "CRAB pneumonia or bacteremia is one of the hardest decisions in ID. " +
      "Until sulbactam-durlobactam approval in 2023, every option was off-label " +
      "or weakly evidenced. The ATTACK trial showed sulbactam-durlobactam plus " +
      "imipenem cut 28-day mortality from 32% to 19% versus colistin plus " +
      "imipenem. Source control, de-escalation when possible, and ID consult " +
      "are non-negotiable.",
    foundational:
      "OXA-23 mirrors OXA-48 mechanistically (class D serine carbamylation) " +
      "but with a hydrophobic active-site bridge that better accommodates " +
      "carbapenem's hydroxyethyl group. Sulbactam is an intrinsic PBP3-binder " +
      "in Acinetobacter — its 'inhibitor' role is actually direct " +
      "antibacterial activity. Durlobactam (a diazabicyclooctane) protects " +
      "sulbactam from co-resident class A/C/D β-lactamases including OXA-23, " +
      "letting sulbactam reach PBP3.",
    papers: [
      { name: "ATTACK RCT", year: 2023,
        finding: "Sulbactam-durlobactam + imipenem vs colistin + imipenem: 19% vs 32% 28-day mortality in CRAB pneumonia/BSI." },
    ],
  },

  "OXA-58": {
    title:  "OXA-58 — Acinetobacter carbapenemase variant",
    family: "resistance",
    alias:  ["blaOXA-58", "OXA-58-like"],
    summary:
      "Less common Acinetobacter baumannii class D carbapenemase; same " +
      "treatment paradigm as OXA-23. Hydrolyzes carbapenems weakly but " +
      "expression on multi-copy plasmids drives clinically meaningful " +
      "resistance. Sulbactam-durlobactam is the targeted option; legacy " +
      "regimens (colistin, tigecycline, high-dose ampicillin-sulbactam) " +
      "carry weak evidence.",
    keypoints: [
      "Sulbactam-durlobactam covers OXA-58 (ATTACK trial enrolled OXA-23/24/58 strains).",
      "High-dose ampicillin-sulbactam targets PBP3 — sulbactam is the active partner.",
      "Cefiderocol is an alternative; watch CREDIBLE-CR CRAB mortality signal.",
      "Less prevalent than OXA-23 but rising — Europe, Asia, Middle East clusters.",
      "Polymyxin/tigecycline combinations are salvage, not first-line, in 2024.",
    ],
    bedside:
      "OXA-58 on a culture report should trigger the same workflow as OXA-23: " +
      "ID consult, source control, sulbactam-durlobactam if available. The " +
      "lab will often type only as 'OXA-23-like / OXA-58-like' — treat the " +
      "phenotype, not the genotype. CRAB mortality without active therapy " +
      "approaches 50%; the targeted novel agent earns its high cost.",
    foundational:
      "OXA-58 shares the carbamylated-lysine class D mechanism but its " +
      "active-site loop architecture differs from OXA-23 — clinically " +
      "equivalent carbapenem hydrolysis, distinct evolutionary lineage. " +
      "Plasmid promoter strength and gene copy number drive expression more " +
      "than enzyme kinetics. Durlobactam restores sulbactam activity by " +
      "shielding the PBP3-binding sulbactam from OXA-58 hydrolysis, the " +
      "same logic as OXA-23.",
    papers: [
      { name: "ATTACK RCT subgroup", year: 2023,
        finding: "OXA-58 strains responded similarly to OXA-23 strains in sulbactam-durlobactam arm; small sample size limits inference." },
    ],
  },

  "CTX-M-15": {
    title:  "CTX-M-15 — Globally dominant ESBL variant",
    family: "resistance",
    alias:  ["blaCTX-M-15", "CTX-M-15 ESBL"],
    summary:
      "The single most prevalent extended-spectrum β-lactamase worldwide, " +
      "carried on IncF plasmids in E. coli ST131 — the pandemic lineage " +
      "driving community-onset ESBL urinary and bloodstream infection. " +
      "Hydrolyzes ceftriaxone and ceftazidime efficiently. Carbapenem is " +
      "first-line for serious infection (MERINO trial).",
    keypoints: [
      "E. coli ST131 carrying CTX-M-15 is the dominant community ESBL clone globally.",
      "Carbapenem (meropenem/ertapenem) is first-line for bacteremia — pip-tazo failed (MERINO).",
      "Ceftolozane-tazobactam and ceftazidime-avibactam are active alternatives in shortage.",
      "Cystitis: oral nitrofurantoin, fosfomycin, or pivmecillinam remain effective.",
      "Travel and prior antibiotic exposure are the dominant acquisition risk factors.",
    ],
    bedside:
      "When the lab reports 'ESBL' on a community-onset E. coli BSI, the " +
      "underlying enzyme is CTX-M-15 in well over 80% of U.S. and European " +
      "cases. The clinical lever is fast carbapenem step-up: MERINO showed " +
      "pip-tazo gave 12% vs 4% 30-day mortality versus meropenem and was " +
      "stopped early for harm. Treat ESBL bacteremia as carbapenem-only " +
      "until source control and clinical stability are achieved.",
    foundational:
      "CTX-M-15 evolved from chromosomal CTX-M-3 by a single Asp240Gly " +
      "substitution that widens the R2 binding pocket — efficient hydrolysis " +
      "of ceftazidime (a bulky aminothiazolyl-oxyimino cephalosporin) added " +
      "to its native cefotaxime activity. The IncF plasmid co-carries " +
      "fluoroquinolone resistance determinants (aac(6')-Ib-cr, qnr) and " +
      "aminoglycoside-modifying enzymes — explains why ST131 strains often " +
      "look broadly resistant. Avibactam, tazobactam, clavulanate restore " +
      "the β-lactam in vitro.",
    papers: [
      { name: "MERINO RCT", year: 2018,
        finding: "Piperacillin-tazobactam non-inferiority to meropenem REJECTED for ESBL BSI; 30-day mortality 12% vs 4%, stopped early." },
    ],
  },

  "PBP2x": {
    title:  "PBP2x — Penicillin-resistant pneumococcus PBP",
    family: "resistance",
    alias:  ["PBP 2x", "PRSP", "penicillin-resistant pneumococcus"],
    summary:
      "Altered penicillin-binding protein in S. pneumoniae driving high-level " +
      "penicillin and cephalosporin resistance (PRSP). Transpeptidase-domain " +
      "mutations lower β-lactam affinity. Drives the meningitis dosing " +
      "doctrine: ceftriaxone 2 g q12h plus vancomycin until susceptibilities " +
      "return, because standard q24h dosing fails at the CSF MIC.",
    keypoints: [
      "Meningitis: ceftriaxone 2 g q12h + vancomycin empiric — q24h underdoses CSF.",
      "Ceftaroline binds PBP2x with restored affinity (treats some PRSP pneumonia).",
      "Pneumonia: standard ceftriaxone 1-2 g q24h adequate unless MIC ≥ 4.",
      "Resistance arises by transformational uptake of streptococcal mosaic PBP DNA.",
      "PBP1a and PBP2b mutations layer onto PBP2x for the highest-MIC strains.",
    ],
    bedside:
      "PBP2x is the difference between a pneumococcal meningitis case who " +
      "survives intact and one who dies. IDSA/ESCMID call for ceftriaxone 2 g " +
      "q12h plus vancomycin empirically in suspected pneumococcal meningitis " +
      "specifically because PBP2x-altered strains have ceftriaxone MICs at " +
      "or above the CSF-attainable concentration on q24h dosing. Step down " +
      "only after susceptibility data return.",
    foundational:
      "PBP2x is a transpeptidase that cross-links the peptidoglycan stem " +
      "peptides during cell-wall synthesis. β-lactams normally acylate its " +
      "active-site serine. PRSP strains carry mosaic pbp2x alleles imported " +
      "horizontally from commensal viridans streptococci; the active-site " +
      "geometry shifts and β-lactam affinity drops 10-100×. Ceftaroline's " +
      "fifth-generation cephalosporin side-chain restores binding to most " +
      "mutant PBP2x — the unique anti-PRSP β-lactam.",
    papers: [
      { name: "IDSA bacterial meningitis", year: 2004,
        finding: "Empiric ceftriaxone 2 g q12h + vancomycin for adult pneumococcal meningitis until susceptibilities confirm β-lactam alone." },
    ],
  },

  "Mosaic PBP": {
    title:  "Mosaic PBP — Gonococcal cephalosporin resistance",
    family: "resistance",
    alias:  ["penA mosaic", "gonococcal mosaic PBP", "ceftriaxone-reduced-susceptibility gonococcus"],
    summary:
      "Neisseria gonorrhoeae horizontally recombines its penA-encoded PBP " +
      "with segments from commensal Neisseria, generating mosaic alleles with " +
      "reduced ceftriaxone and cefixime affinity. Drives the global trend " +
      "toward elevated cephalosporin MICs and the 2021 CDC dose escalation " +
      "to ceftriaxone 500-1000 mg IM single dose.",
    keypoints: [
      "CDC 2021: ceftriaxone 500 mg IM ×1 (1 g if ≥150 kg) — replaced dual therapy.",
      "Azithromycin co-administration dropped (resistance surge + ceftriaxone alone adequate).",
      "Test-of-cure mandatory for pharyngeal gonorrhea and any ceftriaxone failure.",
      "Cefixime no longer first-line — mosaic PBP raises its MIC faster than ceftriaxone.",
      "Emerging XDR strains (FC428, A8806) carry penA-60.001 — global surveillance signal.",
    ],
    bedside:
      "Gonococcal mosaic PBP is the resistance mechanism behind the CDC's " +
      "2021 guideline change from ceftriaxone 250 mg + azithromycin to " +
      "ceftriaxone 500 mg alone (1 g if ≥150 kg). The dose increase compensates " +
      "for the rising mosaic-PBP MIC — empiric coverage still works at " +
      "current U.S. epidemiology but the margin is narrowing. Pharyngeal " +
      "infection demands test-of-cure.",
    foundational:
      "Wild-type gonococcal penA encodes PBP2, the transpeptidase β-lactam " +
      "target. N. gonorrhoeae is naturally transformable and imports DNA " +
      "from commensal N. cinerea, N. flavescens, and N. perflava during " +
      "co-colonization of the oropharynx. The resulting mosaic penA carries " +
      "60-70 amino-acid substitutions clustered in the transpeptidase domain, " +
      "lowering ceftriaxone affinity 5-10×. PenA-60.001 in the FC428 clone " +
      "adds an A311V substitution driving treatment failure cases.",
    papers: [
      { name: "CDC STI Treatment Guidelines", year: 2021,
        finding: "Ceftriaxone 500 mg IM ×1 monotherapy replaced dual therapy; dose doubled to compensate for mosaic-penA MIC drift." },
    ],
  },

  "vanB": {
    title:  "vanB — Inducible vancomycin resistance",
    family: "resistance",
    alias:  ["vanB cluster", "inducible glycopeptide resistance"],
    summary:
      "Inducible vancomycin resistance operon in Enterococcus faecium and " +
      "E. faecalis; plasmid or chromosomal transposon-mediated. Re-engineers " +
      "the peptidoglycan precursor to D-Ala-D-Lac like vanA, but vanS sensor " +
      "responds only to vancomycin (not teicoplanin). Teicoplanin appears " +
      "susceptible in vitro — clinical failure is common.",
    keypoints: [
      "Teicoplanin in vitro susceptible but clinical failure common — do not rely on it.",
      "Treatment mirrors vanA: daptomycin 8-12 mg/kg or linezolid for VRE bacteremia.",
      "vanS-vanR senses vancomycin; teicoplanin fails to trigger expression in vitro only.",
      "Predominantly E. faecium; clonal hospital outbreaks (CC17) drive U.S. epidemiology.",
      "PCR (Verigene, GeneXpert) distinguishes vanA vs vanB on blood cultures.",
    ],
    bedside:
      "The in vitro teicoplanin susceptibility on a vanB VRE report is a " +
      "trap. Clinical experience (mostly European, where teicoplanin is " +
      "available) shows therapeutic failure as the vanB operon induces under " +
      "treatment pressure. Treat vanB exactly like vanA: daptomycin 8-12 " +
      "mg/kg for bacteremia, linezolid for pulmonary or CNS disease, " +
      "ampicillin if E. faecalis (preserves susceptibility).",
    foundational:
      "The vanB gene cluster encodes vanS_B (a histidine kinase sensor), " +
      "vanR_B (response regulator), vanH_B (D-lactate dehydrogenase), " +
      "vanB (D-Ala-D-Lac ligase), and vanX_B (D,D-dipeptidase). Vancomycin " +
      "binding to nascent peptidoglycan induces vanS_B autophosphorylation, " +
      "triggering operon expression. The substituted D-Ala-D-Lac terminus " +
      "loses one hydrogen bond to vancomycin, dropping affinity 1000-fold. " +
      "vanS_B fails to recognize teicoplanin's longer lipid tail in vitro.",
  },

  "vanD": {
    title:  "vanD — Constitutive vancomycin resistance",
    family: "resistance",
    alias:  ["vanD cluster", "constitutive vancomycin resistance"],
    summary:
      "Chromosomally encoded, constitutively expressed vancomycin resistance " +
      "operon in sporadic Enterococcus faecium isolates. Lower-level " +
      "resistance than vanA (vancomycin MIC 16-64); teicoplanin variably " +
      "affected. Rare globally and not transferable — the chromosomal " +
      "location limits horizontal spread but makes detection harder.",
    keypoints: [
      "Constitutive expression — no induction needed, no susceptible window.",
      "Vancomycin MIC typically 16-64; teicoplanin MIC 2-32, variable in vitro.",
      "Treatment mirrors vanA/vanB: daptomycin or linezolid for serious infection.",
      "Chromosomal location means no plasmid spread — sporadic, not clonal.",
      "vanD strains have an inactive D,D-dipeptidase, forcing constitutive D-Ala-D-Lac.",
    ],
    bedside:
      "vanD is the third van phenotype clinicians may encounter, mostly via " +
      "reference lab reports. The clinical bottom line: treat as any other " +
      "high-level VRE — daptomycin 8-12 mg/kg for bacteremia, linezolid for " +
      "pulmonary or CNS disease. The low-level MIC (16-64) makes the lab " +
      "report sometimes ambiguous — confirm with E-test or molecular probe " +
      "before assuming susceptibility.",
    foundational:
      "vanD operon mirrors the vanA gene cluster (vanH_D, vanD, vanX_D) but " +
      "carries a frameshifted, inactive D,D-dipeptidase that cannot destroy " +
      "the native D-Ala-D-Ala precursor. The cell compensates by losing " +
      "the native D-Ala-D-Ala-ligase (ddl_D-frameshifted), forcing " +
      "obligatory D-Ala-D-Lac wall synthesis — hence constitutive expression " +
      "without inducer. The biochemical lesion is permanent rather than " +
      "regulated, which paradoxically lowers the MIC versus inducible vanA.",
  },

  "Lipid II binding": {
    title:  "Lipid II binding — Glycopeptide target site",
    family: "resistance",
    alias:  ["glycopeptide target", "D-Ala-D-Ala", "peptidoglycan precursor binding"],
    summary:
      "The D-Ala-D-Ala terminus of the lipid-II peptidoglycan precursor — " +
      "the binding site for vancomycin, teicoplanin, dalbavancin, telavancin, " +
      "and oritavancin. Five hydrogen bonds anchor vancomycin to the " +
      "substrate, blocking transpeptidation and transglycosylation. vanA/B/D " +
      "substitute D-Ala-D-Lac, losing one bond and 1000-fold affinity.",
    keypoints: [
      "Vancomycin H-bonds via 5 contacts to D-Ala-D-Ala terminus — the binding fingerprint.",
      "D-Ala-D-Lac substitution (vanA/B/D) loses 1 bond, affinity drops 1000×.",
      "Lipoglycopeptides (dalba, tela, orita) add membrane anchor for higher potency.",
      "Oritavancin uniquely also binds D-Ala-D-Lac with retained activity vs vanA.",
      "Long-acting agents (dalba, orita) leverage tail-anchored membrane residence.",
    ],
    bedside:
      "Understanding lipid-II binding explains both why vancomycin works " +
      "(blocks both transpeptidation and transglycosylation by physically " +
      "occluding the substrate) and why VRE defeats it (one hydrogen bond " +
      "lost = 1000× affinity drop). It also predicts which next-generation " +
      "glycopeptides retain activity: oritavancin's secondary binding mode " +
      "to lipid-II's pentaglycine bridge survives vanA substitution.",
    foundational:
      "Lipid II is the membrane-anchored peptidoglycan precursor: " +
      "undecaprenyl-pyrophosphate-MurNAc-(L-Ala-D-iGlu-L-Lys-D-Ala-D-Ala)-GlcNAc. " +
      "Glycopeptide antibiotics form a heptapeptide cup that hydrogen-bonds " +
      "to the D-Ala-D-Ala backbone amides — five bonds for vancomycin, more " +
      "for teicoplanin via additional sugars. The bound antibiotic physically " +
      "blocks both transpeptidase and transglycosylase access. " +
      "Lipoglycopeptides add a hydrophobic tail that anchors in the bacterial " +
      "membrane, raising local concentration and prolonging half-life.",
  },

  "Transpeptidation": {
    title:  "Transpeptidation — β-lactam target reaction",
    family: "resistance",
    alias:  ["PBP transpeptidation", "cell-wall cross-linking", "DD-transpeptidase"],
    summary:
      "The peptidoglycan cross-linking reaction catalyzed by penicillin-" +
      "binding proteins (PBPs) — the universal β-lactam target. PBPs use " +
      "an active-site serine to release the terminal D-Ala of the donor " +
      "stem peptide and form a bond to the acceptor diaminopimelate or " +
      "lysine. β-lactams mimic D-Ala-D-Ala and trap the PBP as a covalent " +
      "acyl-enzyme.",
    keypoints: [
      "β-lactam ring geometry mimics the D-Ala-D-Ala substrate of the transpeptidase.",
      "Active-site serine attacks the β-lactam carbonyl, forming a stable acyl-enzyme.",
      "Resistance mechanisms: PBP2a (MRSA), PBP2x (PRSP), mosaic penA (gonococcus).",
      "Cefiderocol, ceftaroline, ceftobiprole engineered for altered-PBP affinity.",
      "Each species carries 4-8 PBPs; bactericidal activity targets PBP1/2/3.",
    ],
    bedside:
      "Transpeptidation is the reaction every β-lactam blocks — penicillins, " +
      "cephalosporins, carbapenems, monobactams. Understanding it explains " +
      "the divergent therapy across staphylococcal, pneumococcal, and " +
      "gonococcal resistance: same target reaction, different PBP isoforms " +
      "mutated, different β-lactams that restore binding. PBP affinity " +
      "differences also drive bactericidal vs bacteriostatic profiles within " +
      "the β-lactam class.",
    foundational:
      "PBPs are DD-transpeptidases: the active-site serine attacks the donor " +
      "stem peptide's D-Ala-D-Ala bond, displacing the terminal D-Ala and " +
      "forming an acyl-enzyme intermediate. A nearby amino group on the " +
      "acceptor peptidoglycan strand (meso-DAP in Gram-negatives, L-Lys via " +
      "pentaglycine in S. aureus) attacks this intermediate, releasing the " +
      "cross-linked product. β-lactams' fused four-membered ring strains " +
      "the C-N bond into the geometry of the D-Ala-D-Ala transition state, " +
      "trapping the PBP irreversibly acylated.",
  },

  /* ============= RESISTANCE — efflux, porins, uptake (Wave 5 CL-6 M-4) === */

  "MexAB-OprM": {
    title:  "MexAB-OprM — Pseudomonas RND efflux pump",
    family: "resistance",
    alias:  ["RND efflux", "Pseudomonas multi-drug efflux"],
    summary:
      "Tripartite resistance-nodulation-division (RND) efflux pump in " +
      "Pseudomonas aeruginosa: MexA periplasmic adapter, MexB inner-membrane " +
      "transporter, OprM outer-membrane channel. Constitutively expressed at " +
      "baseline; nalB / mexR loss-of-function mutants hyperproduce the system " +
      "and elevate MICs to β-lactams, fluoroquinolones, tetracyclines, " +
      "macrolides, and chloramphenicol simultaneously.",
    keypoints: [
      "Tripartite assembly: MexA adapter, MexB transporter, OprM outer-membrane channel.",
      "Broad substrate range: β-lactams, FQs, tetracyclines, macrolides, chloramphenicol.",
      "Hyperexpression via mexR / nalB loss-of-function mutations during therapy.",
      "Proton-motive-force-driven; substrates captured from periplasm or membrane bilayer.",
      "Combines with AmpC and OprD loss to give pan-β-lactam Pseudomonas resistance.",
    ],
    bedside:
      "MexAB-OprM is why mid-course MIC creep in Pseudomonas bacteremia is " +
      "common: cefepime or pip-tazo selects nalB mutants that hyperexpress " +
      "the pump and lift MICs across multiple classes at once. Combination " +
      "therapy (β-lactam + aminoglycoside or FQ) for the first 48–72 h slows " +
      "the on-treatment emergence; de-escalate after culture and clinical " +
      "stability. Surveillance MICs at 72 h catch the shift before clinical failure.",
    foundational:
      "RND efflux pumps are proton-antiporters: the inner-membrane MexB " +
      "subunit uses the proton-motive force to capture substrates from the " +
      "periplasmic face or membrane bilayer and shuttle them through the " +
      "OprM channel directly into the external medium, bypassing the periplasm. " +
      "MexA wraps the assembly into a continuous conduit. Substrate promiscuity " +
      "comes from a large hydrophobic binding pocket that recognizes shape and " +
      "lipophilicity rather than a specific pharmacophore.",
  },

  "OprD loss": {
    title:  "OprD loss — Pseudomonas carbapenem porin",
    family: "resistance",
    alias:  ["OprD2", "porin OprD", "imipenem porin loss"],
    summary:
      "OprD is the basic-amino-acid / carbapenem-selective outer-membrane " +
      "porin of Pseudomonas aeruginosa. Loss-of-function mutations or " +
      "transcriptional downregulation raise imipenem MICs roughly 16-fold; " +
      "meropenem is less dependent on OprD. Combined with derepressed AmpC " +
      "the phenotype becomes clinical carbapenem resistance without any " +
      "carbapenemase gene.",
    keypoints: [
      "Imipenem-selective porin — meropenem uses additional entry routes.",
      "Loss alone gives ~16-fold imipenem MIC rise; meropenem rises ~4-fold.",
      "AmpC derepression plus OprD loss = clinical pan-carbapenem resistance.",
      "Frame-shift, IS-element insertion, or nfxC downregulation all observed.",
      "Mechanism for carbapenem resistance without any acquired carbapenemase gene.",
    ],
    bedside:
      "OprD loss is the silent reason a Pseudomonas isolate carbapenem-tests " +
      "resistant on a unit with zero carbapenemase carriage. Phenotype: " +
      "imipenem-R, meropenem-intermediate, ceftazidime-S. Switch to a " +
      "ceftolozane-tazobactam or ceftazidime-avibactam regimen — these bypass " +
      "the porin issue entirely. Carbapenemase PCR will be negative; that " +
      "does not mean the strain is carbapenem-treatable.",
    foundational:
      "OprD is a 16-stranded β-barrel porin selective for basic amino acids " +
      "and small zwitterionic carbapenems whose dimensions match the channel " +
      "constriction zone. Imipenem traverses almost exclusively via OprD; " +
      "meropenem additionally uses OpdP and other channels. Insertion-sequence " +
      "disruption of the oprD ORF, or downregulation by mexT activation " +
      "(nfxC phenotype), closes the entry route. Outer-membrane permeability " +
      "becomes the rate-limiting step and MICs rise even though AmpC and " +
      "PBP affinity are unchanged.",
  },

  "mgrB lipid-A modification": {
    title:  "mgrB inactivation — colistin resistance",
    family: "resistance",
    alias:  ["colistin resistance", "mgrB inactivation", "phoPQ derepression"],
    summary:
      "mgrB encodes a small membrane peptide that negatively regulates the " +
      "PhoPQ two-component system. Inactivation of mgrB (insertion sequence, " +
      "premature stop, deletion) DEREPRESSES PhoPQ, which activates PmrAB and " +
      "the arnBCADTEF operon, decorating lipid A with L-Ara4N. The cationic " +
      "sugar masks the negative charge polymyxins need to bind. Classic in " +
      "Klebsiella pneumoniae KPC-CRE.",
    keypoints: [
      "mgrB is a NEGATIVE regulator — inactivation DEREPRESSES PhoPQ signaling.",
      "Derepressed PhoPQ → PmrAB → arnBCADTEF → L-Ara4N decoration of lipid A.",
      "L-Ara4N masks lipid A's negative charge; polymyxin electrostatic binding fails.",
      "Predominantly Klebsiella, often on a KPC-CRE background — last-line agent lost.",
      "IS5-like insertions in mgrB are the commonest inactivating lesion clinically.",
    ],
    bedside:
      "Colistin-resistant KPC-CRE is the dead-end isolate. mgrB inactivation " +
      "is the dominant route, and once present, polymyxin-based salvage is " +
      "dead. Confirm the carbapenemase identity and pivot to ceftazidime- " +
      "avibactam, meropenem-vaborbactam, or cefiderocol depending on " +
      "susceptibility. Plasmid-borne mcr-1 (phosphoethanolamine-transferase) " +
      "is the second route — clinically the same problem, different gene.",
    foundational:
      "PhoPQ senses low Mg²⁺, low pH, and antimicrobial peptides. The " +
      "phosphorylated PhoP response regulator activates pmrAB, which drives " +
      "the arnBCADTEF cluster: ArnA + ArnB synthesize UDP-L-Ara4N, ArnT " +
      "transfers it onto the lipid A 4'-phosphate. The added 4-amino-4-deoxy- " +
      "L-arabinose neutralizes the lipid A phosphate charge that polymyxins " +
      "and cationic antimicrobial peptides electrostatically engage. mgrB " +
      "normally restrains this signaling; its loss is constitutive lipid A " +
      "remodeling.",
  },

  "MLSB methylation": {
    title:  "MLSB methylation — erm 23S rRNA methylase",
    family: "resistance",
    alias:  ["erm", "23S A2058 methylation", "macrolide methylase"],
    summary:
      "erm-family methyltransferases monomethylate or dimethylate adenine " +
      "A2058 of the 23S rRNA in the 50S subunit's peptidyl-transferase exit " +
      "tunnel. Methylation sterically blocks the shared binding pocket for " +
      "Macrolides, Lincosamides, and Streptogramin B antibiotics — the MLSB " +
      "cross-resistance phenotype. Expression is either inducible (D-test " +
      "positive) or constitutive.",
    keypoints: [
      "Single methylation event at 23S A2058 confers cross-resistance to M, L, S-B.",
      "Inducible erm: macrolide induces; clindamycin appears susceptible but fails.",
      "D-test (erythromycin disk next to clindamycin) flattens the clinda zone if inducible.",
      "Constitutive erm: clindamycin-R outright; reliably flagged by routine AST.",
      "erm(A), erm(B), erm(C) dominate in staphylococci, streptococci, enterococci.",
    ],
    bedside:
      "The single most common clindamycin trap: an apparently susceptible " +
      "clindamycin MIC on an erythromycin-resistant S. aureus or GAS isolate " +
      "is inducibly resistant if the D-test flattens. Treating necrotizing " +
      "fasciitis or staphylococcal toxic shock with clindamycin in that " +
      "setting risks on-therapy failure as the population selects for " +
      "constitutive expression. Every micro lab runs the D-test by default; read it.",
    foundational:
      "The 50S ribosome peptidyl-transferase exit tunnel narrows at 23S " +
      "domain V. Macrolides (14-, 15-, 16-membered lactones), lincosamides " +
      "(clindamycin), and streptogramin B (quinupristin) all dock at " +
      "overlapping sites flanking adenine 2058. erm methyltransferases add " +
      "one or two methyl groups to A2058's N6 amine; the methyl group " +
      "sterically excludes the antibiotic ring. Inducible expression uses a " +
      "leader peptide whose ribosome-stalling on a low-dose macrolide " +
      "switches mRNA folding to expose the erm start codon.",
  },

  "cfr": {
    title:  "cfr — 23S A2503 methylase (PhLOPSa)",
    family: "resistance",
    alias:  ["cfr gene", "23S A2503 methylation", "PhLOPSa resistance"],
    summary:
      "cfr (chloramphenicol-florfenicol resistance) encodes a radical-SAM " +
      "rRNA methyltransferase that adds a methyl group to C8 of adenine " +
      "A2503 in the 23S rRNA. The modification sits in the peptidyl- " +
      "transferase center and confers PhLOPSa cross-resistance: Phenicols, " +
      "Lincosamides, Oxazolidinones, Pleuromutilins, Streptogramin A. " +
      "Plasmid-mobile; the dominant transferable linezolid-resistance hot spot.",
    keypoints: [
      "Single A2503 methylation gives cross-resistance to five antibiotic classes.",
      "Plasmid-borne — horizontally transferable across staphylococci and enterococci.",
      "Dominant cause of transferable linezolid resistance worldwide.",
      "Distinct from erm A2058 methylation; the two confer non-overlapping resistance.",
      "Surveillance signal: an unexplained linezolid-R enterococcus warrants cfr PCR.",
    ],
    bedside:
      "A linezolid-resistant enterococcus or staphylococcus on therapy is " +
      "almost always cfr-mediated (transferable) or a 23S G2576T point " +
      "mutation (vertical). Plasmid-borne cfr is the public-health worry: " +
      "it spreads. Pivot to tedizolid (may retain partial activity), " +
      "daptomycin, or quinupristin-dalfopristin depending on the species and " +
      "site. Notify infection control — cfr outbreaks have closed wards.",
    foundational:
      "Cfr is a radical-S-adenosylmethionine (SAM) enzyme: a [4Fe-4S] " +
      "cluster reductively cleaves SAM to a 5'-deoxyadenosyl radical that " +
      "abstracts a hydrogen from C8 of A2503, then transfers a methyl group " +
      "from a second SAM. The C8-methyl projects into the peptidyl-transferase " +
      "A-site cleft where phenicols, oxazolidinones, lincosamides, " +
      "pleuromutilins, and streptogramin A all dock. One modification, five " +
      "drug classes blocked — a remarkable resistance return on a single " +
      "methylation event.",
  },

  "gyrA / parC mutations": {
    title:  "gyrA / parC — fluoroquinolone target mutations",
    family: "resistance",
    alias:  ["FQ resistance", "quinolone target mutation", "gyrA QRDR"],
    summary:
      "Fluoroquinolones inhibit DNA gyrase (gyrA/gyrB) and topoisomerase IV " +
      "(parC/parE). Resistance arises from point mutations in the quinolone- " +
      "resistance-determining region (QRDR): gyrA codons 83 and 87 " +
      "(E. coli numbering), parC codons 80 and 84. Single mutations give " +
      "intermediate MICs; double mutants give high-level resistance. PMQR " +
      "genes (qnr, aac(6')-Ib-cr) add lower-level plasmid-borne resistance.",
    keypoints: [
      "gyrA QRDR codons 83 (Ser→Leu) and 87 (Asp→Asn) are the canonical hot spots.",
      "parC QRDR codons 80 and 84 are the topoisomerase IV counterparts.",
      "Single mutation: intermediate MIC; gyrA + parC double mutant: high-level resistance.",
      "PMQR (qnr, aac(6')-Ib-cr, qepA) is plasmid-borne and gives lower-level resistance.",
      "Gram-negatives mutate gyrA first; Gram-positives mutate parC first.",
    ],
    bedside:
      "A ciprofloxacin MIC at the susceptibility breakpoint on an E. coli " +
      "or Pseudomonas isolate often hides a single QRDR mutation that " +
      "selects for the second mutation under FQ pressure — and on-therapy " +
      "MIC creep follows. For Pseudomonas bacteremia or pyelonephritis with " +
      "borderline FQ MICs, avoid monotherapy. PMQR carriage drives " +
      "low-grade resistance that breeds the high-grade chromosomal mutants.",
    foundational:
      "Fluoroquinolones bind the gyrase-DNA cleavage complex, trapping " +
      "double-strand DNA breaks. The QRDR is a helix lining the drug-binding " +
      "pocket; substitution of bulky aliphatic for the wild-type Ser-83 or " +
      "of asparagine for the negatively charged Asp-87 disrupts the water- " +
      "metal-ion bridge that quinolones use to coordinate the active-site " +
      "magnesium. Stepwise selection: a first mutation modestly raises MIC, " +
      "antibiotic exposure selects survivors that acquire a second mutation, " +
      "and clinical resistance emerges.",
  },

  "Siderophore iron acquisition": {
    title:  "Siderophore uptake — cefiderocol Trojan horse",
    family: "resistance",
    alias:  ["cefiderocol uptake", "Trojan-horse cephalosporin", "TonB-dependent uptake"],
    summary:
      "Cefiderocol is a siderophore-conjugated cephalosporin: a catechol " +
      "moiety mimics the bacterial siderophore enterobactin, binds ferric " +
      "iron, and is actively imported via TonB-dependent outer-membrane " +
      "iron transporters (PiuA, CirA, FiuA). Active uptake bypasses porin " +
      "loss and efflux entirely, achieving periplasmic concentrations that " +
      "outpace β-lactamase hydrolysis.",
    keypoints: [
      "Catechol side chain chelates Fe³⁺; ferric-cefiderocol complex hijacks iron uptake.",
      "TonB-dependent transporters (PiuA, CirA, FiuA) pull the drug into the periplasm.",
      "Bypasses porin loss and RND efflux — the two Gram-negative permeability defenses.",
      "Active against MBL-producing CRE, CRAB, and Stenotrophomonas.",
      "Resistance: PBP3 mutations (mainly Enterobacterales) or iron-transporter loss.",
    ],
    bedside:
      "Cefiderocol is the unimolecular answer to MBL-producing CRE, " +
      "carbapenem-resistant Acinetobacter, and difficult Stenotrophomonas. " +
      "The CREDIBLE-CR signal of higher mortality in the CRAB subgroup " +
      "tempered enthusiasm but the agent remains the cleanest Trojan-horse " +
      "strategy clinically available. Failure to respond should prompt " +
      "PBP3 mutation suspicion and ID consultation.",
    foundational:
      "Bacteria scavenge iron with siderophores — high-affinity Fe³⁺ " +
      "chelators secreted into the environment then re-imported via outer- " +
      "membrane TonB-dependent transporters (TBDTs). The TBDT-ligand " +
      "complex is energized by the inner-membrane TonB-ExbBD system, which " +
      "transduces proton-motive force across the periplasm. Cefiderocol's " +
      "catechol moiety mimics enterobactin chemistry; the ferric-drug " +
      "complex docks at PiuA, CirA, or FiuA and is pulled into the periplasm " +
      "where the cephalosporin engages PBP3.",
  },

  "Porin loss (Enterobacterales)": {
    title:  "OmpF / OmpC loss — Enterobacterales porin",
    family: "resistance",
    alias:  ["OmpF loss", "OmpC loss", "Enterobacterales porin loss"],
    summary:
      "Downregulation or loss of the major Enterobacterales porins OmpF " +
      "and OmpC narrows β-lactam entry into the periplasm in Klebsiella, " +
      "E. coli, and Enterobacter. Alone, it raises MICs modestly. Combined " +
      "with AmpC hyperproduction or ESBL carriage, periplasmic drug " +
      "concentrations crash below the β-lactamase saturation threshold — " +
      "the phenotypic signature of much non-carbapenemase CRE.",
    keypoints: [
      "OmpF is the larger, more permeable trimer; OmpC narrows under osmotic stress.",
      "Porin loss alone gives 2- to 4-fold β-lactam MIC rise — clinically modest solo.",
      "Combined with AmpC or ESBL, porin loss tips a susceptible isolate into resistance.",
      "Non-carbapenemase CRE often combines porin loss with ESBL/AmpC + outer-membrane defects.",
      "Regulated by EnvZ-OmpR two-component system; mutations or IS insertions both observed.",
    ],
    bedside:
      "A Klebsiella isolate with elevated carbapenem MIC but negative " +
      "carbapenemase PCR is the textbook porin-loss case. The phenotype " +
      "still warrants carbapenem-stewardship caution: high-dose, extended- " +
      "infusion meropenem may succeed in mild disease, but for bacteremia " +
      "or shock pivot to a novel β-lactam or pair with an aminoglycoside. " +
      "Susceptibility reports lag the periplasmic reality.",
    foundational:
      "Enterobacterales express two major non-specific porins as " +
      "homotrimers in the outer membrane: OmpF (larger, hydrophilic, " +
      "preferred under low osmolarity) and OmpC (smaller pore, dominant " +
      "under high osmolarity). β-lactams diffuse through these channels " +
      "into the periplasm. Loss-of-function or transcriptional downregulation " +
      "via the EnvZ-OmpR two-component sensor narrows the entry rate. " +
      "Coupled with periplasmic β-lactamase production, the steady-state " +
      "periplasmic drug concentration falls below the PBP-binding threshold.",
  },

  "Efflux MATE / SMR": {
    title:  "MATE / SMR efflux — secondary transporters",
    family: "resistance",
    alias:  ["NorM", "QacA", "SMR family efflux"],
    summary:
      "Two secondary-active efflux families beyond the RND pumps. " +
      "Multidrug And Toxic compound Extrusion (MATE; e.g., NorM in " +
      "S. aureus and V. cholerae) uses Na⁺ or H⁺ antiport. Small Multidrug " +
      "Resistance (SMR; QacA/B in staphylococci, EmrE in E. coli) uses " +
      "proton antiport on a minimalist four-helix bundle. Substrate range: " +
      "quaternary-ammonium biocides, dyes, some fluoroquinolones.",
    keypoints: [
      "MATE pumps (NorM, MepA) Na⁺ or H⁺ antiport; FQs, dyes, aminoglycosides.",
      "SMR pumps (QacA/B, EmrE) — smallest known efflux family, four-helix bundle.",
      "Plasmid-borne qac genes link biocide tolerance to clinical antibiotic resistance.",
      "Subclinical drivers of stepwise FQ-MIC creep alongside QRDR mutations.",
      "Chlorhexidine-tolerant S. aureus typically carries qacA/B on staphylococcal plasmids.",
    ],
    bedside:
      "The clinical relevance is indirect but real: hospital biocide " +
      "stewardship (chlorhexidine bathing protocols) selects for qacA/B- " +
      "carrying staphylococci that may co-carry mecA. Universal " +
      "chlorhexidine bathing in the ICU is still net-positive, but " +
      "rising biocide MICs deserve surveillance. For the individual " +
      "patient: MATE/SMR contribute marginally to FQ MIC creep but rarely drive failure.",
    foundational:
      "MATE family transporters fold into a 12-transmembrane-helix bundle " +
      "and use the inwardly directed Na⁺ or H⁺ gradient to drive substrate " +
      "expulsion via a rocker-switch alternating-access mechanism. SMR " +
      "transporters are the smallest known antibiotic-efflux pumps — only " +
      "four transmembrane helices assembled as antiparallel homodimers, " +
      "using proton antiport. Both families share broad substrate " +
      "promiscuity for cationic and lipophilic compounds, including " +
      "quaternary-ammonium biocides such as benzalkonium chloride.",
  },

  "MIC inoculum effect": {
    title:  "Inoculum effect — in-vitro MIC rises with cell density",
    family: "resistance",
    alias:  ["high-inoculum effect", "inoculum-dependent MIC"],
    summary:
      "Phenomenon where the measured MIC rises substantially as the " +
      "starting bacterial inoculum increases above the CLSI-standardized " +
      "5 × 10⁵ CFU/mL. The canonical example is piperacillin-tazobactam " +
      "versus ESBL-producing E. coli or Klebsiella: standard-inoculum MIC " +
      "may report susceptible, but a 10⁷ CFU/mL abscess inoculum overwhelms " +
      "tazobactam's β-lactamase inhibition. Drives clinical failures.",
    keypoints: [
      "MIC rises ≥ 8-fold when inoculum increases from 10⁵ to 10⁷ CFU/mL.",
      "Pip-tazo vs ESBL is the canonical case — MERINO documented the clinical harm.",
      "Mechanism: high-inoculum β-lactamase output saturates the inhibitor.",
      "Abscesses, endocarditis vegetations, biofilms run effective inocula > 10⁹ CFU/g.",
      "Not captured by routine AST; the 'susceptible' label hides the source-level reality.",
    ],
    bedside:
      "The most under-appreciated reason 'in-vitro-susceptible' regimens " +
      "fail in deep-source infections. A pip-tazo-S ESBL E. coli BSI on " +
      "the report can fail clinically because the source (intra-abdominal " +
      "abscess, obstructed pyelonephritis) carries an inoculum that " +
      "consumes tazobactam. The lesson: source-control the high-inoculum " +
      "compartment, and for ESBL bacteremia use a carbapenem regardless of MIC.",
    foundational:
      "CLSI standardizes broth microdilution at 5 × 10⁵ CFU/mL precisely " +
      "because the inoculum effect is mechanism-dependent and would " +
      "otherwise scramble cross-lab MIC comparisons. β-lactams suffer the " +
      "largest inoculum effect because periplasmic β-lactamase output " +
      "scales linearly with cell density; at high inoculum the enzyme " +
      "burst rapidly hydrolyzes the drug before it can saturate PBPs. " +
      "Inhibitor-protected β-lactams (pip-tazo, amox-clav) lose ratio " +
      "advantage when inhibitor concentration becomes the limiting reagent.",
    papers: [
      { name: "MERINO RCT", year: 2018,
        finding: "Pip-tazo for ESBL BSI: 12% vs 4% mortality vs meropenem; high-inoculum effect implicated." },
    ],
  },

  "Daptomycin surfactant sequestration": {
    title:  "Daptomycin surfactant binding — pulmonary failure",
    family: "resistance",
    alias:  ["daptomycin pulmonary failure", "surfactant binding"],
    summary:
      "Daptomycin is a calcium-bound lipopeptide that inserts into bacterial " +
      "membranes via its hydrophobic decanoyl tail. In the alveolus, " +
      "pulmonary surfactant (phosphatidylcholine + phosphatidylglycerol) " +
      "forms micellar structures that sequester the calcium-bound drug, " +
      "dropping bioavailability at the alveolar surface by more than 90%. " +
      "Daptomycin is therefore CONTRAINDICATED for pneumonia.",
    keypoints: [
      "Surfactant phosphatidylcholine micelles sequester the calcium-daptomycin complex.",
      "Alveolar bioavailability drops > 90% — drug cannot reach pulmonary pathogens.",
      "Silverman 2005 J Infect Dis is the mechanistic landmark for this finding.",
      "Pneumonia is a hard contraindication; bacteremia with pulmonary metastasis is fine.",
      "Linezolid or ceftaroline are the appropriate MRSA-pneumonia alternatives.",
    ],
    bedside:
      "The single most high-yield daptomycin pearl: never use it for " +
      "pneumonia. A MRSA bacteremia with hematogenous pulmonary nodules " +
      "still treats fine with daptomycin (the bug is in the vasculature, " +
      "not the alveolus). True bacterial pneumonia requires linezolid " +
      "(best lung penetration) or ceftaroline. Mis-prescription of " +
      "daptomycin for HCAP is a recurring board-question hazard and a real-world error.",
    foundational:
      "Daptomycin's mechanism requires a four-molecule oligomer to assemble " +
      "in the bacterial membrane, depolarize it via potassium efflux, and " +
      "trigger membrane dysfunction. The decanoyl tail and calcium coordination " +
      "are essential to membrane insertion. Pulmonary surfactant lipids " +
      "phosphatidylcholine (PC) and phosphatidylglycerol (PG) form " +
      "thermodynamically favored micelles around the calcium-lipopeptide " +
      "complex; the drug is sequestered in surfactant rather than partitioning " +
      "into bacterial membranes. The block is purely physical, not enzymatic.",
    papers: [
      { name: "Silverman et al. J Infect Dis", year: 2005,
        finding: "Pulmonary surfactant inhibits daptomycin in vitro and explains clinical pneumonia failures." },
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
