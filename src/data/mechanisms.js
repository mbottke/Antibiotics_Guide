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
