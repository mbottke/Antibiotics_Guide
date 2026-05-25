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
