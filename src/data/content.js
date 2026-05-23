/* data · allergy, special pops, prophylaxis, OPAT, trees, rapid-dx, IV->PO, glossary.
   Inpatient Antibiotic Guide — module graph documented in README.md. */
import { _gloWrap } from "../lib/util.js";

/* ===================== DATA: ALLERGY CROSS-REACTIVITY ===================== */
const ALLERGY_INTRO =
  "About 90% of patients labeled penicillin-allergic tolerate penicillins on testing, and true IgE cross-reactivity between penicillins and cephalosporins is ~1–2% — driven by R1 side-chain similarity, NOT the shared β-lactam ring. A documented non-severe rash is not a contraindication to a structurally dissimilar cephalosporin.";

const ALLERGY = [
  { a:"Amoxicillin / ampicillin", shares:"aminopenicillin R1 chain", xreact:"hi",
    note:"Cross-reacts with cephalosporins sharing the same side chain: cefaclor, cephalexin, cefadroxil, cefprozil." },
  { a:"Cefazolin", shares:"unique R1 side chain", xreact:"none",
    note:"Shares no side chain with any other penicillin or cephalosporin — generally safe even with penicillin allergy; the preferred surgical-prophylaxis and MSSA agent." },
  { a:"Ceftriaxone / cefotaxime / cefepime", shares:"distinct from penicillins", xreact:"lo",
    note:"Negligible cross-reactivity with penicillins; share an R1 chain among themselves and with ceftazidime/aztreonam (cefepime–ceftazidime)." },
  { a:"Ceftazidime ↔ aztreonam", shares:"identical R1 side chain", xreact:"hi",
    note:"These two share a side chain and DO cross-react. Otherwise aztreonam has no cross-reactivity with penicillins or other cephalosporins — the go-to β-lactam in severe penicillin anaphylaxis (except prior ceftazidime reaction)." },
  { a:"Carbapenems", shares:"β-lactam ring only", xreact:"lo",
    note:"Cross-reactivity with penicillins is <1% — historically overstated. Usually tolerated even in penicillin-allergic patients after risk assessment." },
];

const SPECIAL_POP = [
  { h:"Obesity", icon:"info", pts:[
    "Vancomycin loading on ACTUAL body weight (cap ~3 g load); maintenance by levels.",
    "Aminoglycosides on ADJUSTED body weight.",
    "Cefepime, pip-tazo: consider the high end of dosing; underdosing is common in obesity.",
    "Verify weight descriptor (TBW vs AdjBW vs IBW) per drug — a frequent error source." ]},
  { h:"CNS / meningitis dosing", icon:"info", pts:[
    "Ceftriaxone 2 g IV q12h (not q24h).",
    "Meropenem 2 g IV q8h (double the standard dose).",
    "Vancomycin targeted to CNS penetration; consider higher AUC.",
    "Ampicillin 2 g IV q4h for Listeria.",
    "Penetration is poor — maximal dosing is the rule, not the exception." ]},
  { h:"CRRT / intermittent HD", icon:"info", pts:[
    "CRRT clears drug continuously — do NOT use anuric ESRD dosing; under-dosing is common and dangerous.",
    "Cefepime, meropenem, pip-tazo, vancomycin: give near-normal or modestly reduced doses on CRRT — confirm with pharmacy.",
    "Intermittent HD: dose AFTER dialysis for dialyzable drugs (vancomycin, beta-lactams, aminoglycosides).",
    "Loading doses are unchanged by any renal replacement modality." ]},
];

/* ===================== DATA: SURGICAL PROPHYLAXIS ===================== */
const PROPHYLAXIS = {
  intro:"Surgical antimicrobial prophylaxis (ASHP/IDSA/SIS/SHEA). The goal is tissue levels at incision and through the procedure — not treatment. Generic agents only.",
  principles:[
    ["Timing","Within 60 minutes before incision (120 min for vancomycin or a fluoroquinolone)."],
    ["Agent","Cefazolin for most procedures — covers skin flora (staph, strep). Add anaerobic coverage for colorectal/GI."],
    ["MRSA","Add vancomycin for known MRSA colonization or high institutional rates — in addition to cefazolin, not instead."],
    ["Redosing","Intraoperative redose at ~2 half-lives (cefazolin q4h) or after major blood loss."],
    ["Duration","Single dose for most; STOP within 24 h. Continuing prophylaxis postoperatively does not reduce SSI and breeds resistance."],
  ],
  table:[
    ["Cardiac / vascular / orthopedic (clean)","Cefazolin (± vancomycin if MRSA risk)"],
    ["Colorectal / appendectomy","Cefazolin + metronidazole, or cefoxitin, or ertapenem"],
    ["Hysterectomy / cesarean","Cefazolin (cesarean: before incision)"],
    ["Head & neck (clean-contaminated)","Cefazolin + metronidazole, or ampicillin-sulbactam"],
    ["Beta-lactam allergy","Clindamycin or vancomycin (± aminoglycoside / aztreonam for GN coverage)"],
  ],
};

/* ===================== DATA: OPAT ===================== */
const OPAT = {
  intro:"Outpatient parenteral antimicrobial therapy enables completion of IV courses outside hospital. Success hinges on agent selection, vascular access, and monitoring — not just clinical stability.",
  criteria:[
    "Clinically stable, afebrile, source controlled",
    "Defined organism/syndrome with a clear stop date",
    "Reliable vascular access (often PICC) and a monitoring plan",
    "Agent suited to infrequent dosing or continuous infusion",
    "Social support and follow-up arranged (weekly labs, ID oversight)",
  ],
  agents:[
    ["Ceftriaxone","q24h dosing — ideal OPAT agent for susceptible streptococci, MSSA (alternative), Enterobacterales"],
    ["Ertapenem","q24h — ESBL coverage without Pseudomonas pressure"],
    ["Daptomycin","q24h — MRSA/VRE bacteremia, endocarditis; weekly CK"],
    ["Vancomycin","Feasible but needs level monitoring; less convenient than q24h agents"],
    ["Cefepime / pip-tazo","Continuous or extended infusion via pump for Pseudomonas"],
  ],
  oral:"Increasingly, high-bioavailability ORAL therapy replaces OPAT for selected bone/joint (OVIVA) and endocarditis (POET) cases — reassess whether IV is truly required.",
};

/* ===================== DATA: DECISION TREES (static) ===================== */
const SEPSIS_FLOW = [
  { lab:"Recognize", tx:"Sepsis / septic shock; suspected infection + organ dysfunction", kind:"start" },
  { lab:"Act <1 h", tx:"Cultures → broad antibiotic → fluids/pressors; full loading dose regardless of renal function" },
  { lab:"Cover", tx:"Antipseudomonal β-lactam ± MRSA agent, tuned to source + risk + local antibiogram" },
  { lab:"Reassess 48–72 h", tx:"Cultures + trajectory → narrow to the single most targeted active agent" },
  { lab:"Stop", tx:"Set the evidence-based duration; convert IV→PO when criteria met", kind:"end" },
];

const TREES = [
  { id:"empiric", title:"Empiric coverage modifiers", icon:"GitBranch", pivot:"Add a layer only when a named risk is met",
    intro:"Start from the syndrome's core regimen, then add a layer only when a trigger is met. Each added agent should have a stated reason.",
    nodes:[
      { q:"Is MRSA risk present?", branches:[
        { cond:"Yes", rx:"Add vancomycin (AUC) or linezolid", why:"Prior MRSA, purulent/abscess or device source, severe illness, or high unit prevalence. Linezolid (not daptomycin) for lung." },
        { cond:"No", rx:"Withhold anti-MRSA agent", why:"Empiric vancomycin is not reflexive — it adds nephrotoxicity and AKI signal with pip-tazo." },
      ]},
      { q:"Is Pseudomonas risk present?", branches:[
        { cond:"Yes", rx:"Antipseudomonal β-lactam (cefepime, pip-tazo, or meropenem)", why:"Prior Pseudomonas, structural lung disease, neutropenia, HAP/VAP, recent broad antibiotics." },
        { cond:"No", rx:"Narrower β-lactam (e.g., ceftriaxone)", why:"Avoid antipseudomonal pressure when the risk is not earned." },
      ]},
      { q:"Is ESBL / resistant-GNR risk present?", branches:[
        { cond:"Yes", rx:"Carbapenem empirically (ertapenem or meropenem)", why:"Prior ESBL isolate, high-prevalence exposure, recurrent broad antibiotic use; serious ESBL needs a carbapenem (MERINO)." },
        { cond:"No", rx:"Hold the carbapenem", why:"Preserve carbapenems; escalate only on documented risk or culture." },
      ]},
      { q:"Septic shock?", branches:[
        { cond:"Yes", rx:"Broadest justified net + full loading doses within 1 h", why:"Inadequate early therapy raises mortality; breadth is a time-limited bridge, reassessed at 48–72 h." },
        { cond:"No", rx:"Targeted empiric start, deliberate breadth", why:"A stable ward patient allows a narrower, source-directed regimen." },
      ]},
    ]},
  { id:"ssti", title:"Skin & soft-tissue infection", icon:"Slice", pivot:"Purulence and tissue threat set the branch",
    intro:"Purulence and tissue threat drive the branch. Drainage and surgery, not spectrum, define the high-acuity end.",
    nodes:[
      { q:"Is the infection purulent / abscess?", branches:[
        { cond:"Purulent / abscess", rx:"Incision & drainage + cover MRSA (vancomycin, or PO TMP-SMX / doxycycline)", why:"I&D is definitive for a drainable abscess; antibiotics are adjunctive." },
        { cond:"Non-purulent cellulitis", rx:"Cefazolin (β-hemolytic strep + MSSA)", why:"MRSA coverage only with penetrating trauma, prior MRSA, or systemic toxicity." },
      ]},
      { q:"Signs of necrotizing infection?", branches:[
        { cond:"Yes — pain out of proportion, crepitus, bullae, rapid spread", rx:"SURGERY now + vancomycin + pip-tazo + clindamycin (toxin)", why:"Necrotizing infection is a surgical emergency; imaging must not delay debridement." },
        { cond:"No", rx:"Continue syndrome-appropriate therapy", why:"Mark the border; most 24–48 h 'failures' are normal inflammatory progression, not resistance." },
      ]},
    ]},
  { id:"pna", title:"Pneumonia: setting + severity", icon:"Wind", pivot:"Site of acquisition and severity set the breadth",
    intro:"Where it was acquired and how sick the patient is set the breadth. The discarded HCAP label is gone — use validated risk factors.",
    nodes:[
      { q:"Community-acquired or hospital-acquired?", branches:[
        { cond:"CAP, non-severe", rx:"Ceftriaxone + azithromycin (or respiratory FQ)", why:"Covers pneumococcus, H. influenzae, atypicals. No routine MRSA/Pseudomonas." },
        { cond:"HAP / VAP", rx:"Antipseudomonal β-lactam ± MRSA agent ± second GNR agent", why:"Cover Pseudomonas + resistant GNR; add MRSA and double-GNR by risk." },
      ]},
      { q:"Severe / ICU CAP?", branches:[
        { cond:"Yes", rx:"β-lactam + macrolide OR β-lactam + respiratory FQ", why:"Add MRSA/Pseudomonas coverage only with validated risk factors or prior isolation." },
        { cond:"No", rx:"Standard inpatient regimen, 5-day course", why:"Stop at 5 d if afebrile 48–72 h and stable." },
      ]},
    ]},
  { id:"cns", title:"Meningitis: age + host", icon:"Brain", pivot:"Age and host drive Listeria coverage; do not delay therapy",
    intro:"Do not delay therapy or dexamethasone for imaging/LP. Listeria coverage is the age/host-driven branch.",
    nodes:[
      { q:"Age and immune status?", branches:[
        { cond:"18–50, immunocompetent", rx:"Ceftriaxone 2 g q12h + vancomycin + dexamethasone", why:"Pneumococcus + meningococcus; vancomycin for resistant pneumococcus pending susceptibility." },
        { cond:">50 or impaired cell-mediated immunity", rx:"Add ampicillin 2 g q4h for Listeria", why:"Cephalosporins miss Listeria; essential at age extremes and in immunosuppression." },
      ]},
      { q:"Post-neurosurgical / penetrating?", branches:[
        { cond:"Yes", rx:"Vancomycin + cefepime or meropenem", why:"Cover Pseudomonas, nosocomial GNR, and hardware-associated staphylococci." },
        { cond:"No", rx:"Community regimen above", why:"Continue dexamethasone only if pneumococcal." },
      ]},
    ]},
];

/* ============================================================================
   v3 · TERM GLOSSARY POPOVERS — technical shorthand → on-demand definition
   Resistance mechanisms, PK-PD metrics, and process acronyms become chips in
   the SHORT explanatory fields (cover, de-escalation, notes, caveats). Hover /
   click / keyboard reveals the expansion, a one-line definition, and — for
   resistance mechanisms — the preferred agent (links to its monograph).
   Curated to genuinely technical terms; the obvious ones (MRSA, CAP) are left
   alone. Case-sensitive, word-boundaried matching avoids false hits like the
   "cre" inside "increased".
   ========================================================================== */
const GLOSSARY = {
  "ESBL": { full:"Extended-spectrum β-lactamase", def:"Plasmid enzymes (often CTX-M) that hydrolyse penicillins and most cephalosporins, including ceftriaxone.", agent:["Ertapenem","Carbapenem — first-line for serious infection (MERINO)"] },
  "AmpC": { full:"AmpC β-lactamase", def:"Chromosomal, inducible cephalosporinase (Enterobacter, K. aerogenes, C. freundii) that can derepress on ceftriaxone or piperacillin-tazobactam.", agent:["Cefepime","Stable to AmpC"] },
  "CRE": { full:"Carbapenem-resistant Enterobacterales", def:"Resistance via a carbapenemase (KPC, NDM, OXA-48) or porin loss plus ESBL/AmpC — confirm the mechanism.", see:"Gram-negative matrix · Directed tab" },
  "KPC": { full:"Klebsiella pneumoniae carbapenemase", def:"Serine carbapenemase; the commonest CRE mechanism in the United States.", agent:["Meropenem / imipenem / doripenem","Meropenem-vaborbactam or ceftazidime-avibactam restore activity"] },
  "MBL": { full:"Metallo-β-lactamase", def:"Zinc-dependent carbapenemase (NDM, VIM, IMP) that hydrolyses all β-lactams except aztreonam.", agent:["Cefiderocol","Or ceftazidime-avibactam + aztreonam"] },
  "NDM": { alias:"MBL" }, "VIM": { alias:"MBL" }, "IMP": { alias:"MBL" },
  "OXA-48": { full:"OXA-48 carbapenemase", def:"Often low-level carbapenem resistance; not restored by vaborbactam or relebactam.", agent:["Ceftazidime-avibactam","First-line for OXA-48"] },
  "DTR": { full:"Difficult-to-treat resistance", def:"Non-susceptibility to all first-line β-lactams and fluoroquinolones — used for Pseudomonas.", agent:["Ceftolozane-tazobactam","Or ceftazidime-avibactam, by susceptibility"] },
  "CRAB": { full:"Carbapenem-resistant Acinetobacter baumannii", def:"Highly drug-resistant non-fermenter; treat with combination therapy.", agent:["Sulbactam-durlobactam","Usually paired with a carbapenem"] },
  "SDD": { full:"Susceptible-dose-dependent", def:"Active only at a maximised dosing regimen — an explicit instruction to push the dose, not a hedge." },
  "ARC": { full:"Augmented renal clearance", def:"Supranormal creatinine clearance — often young, septic patients — that under-doses renally cleared β-lactams." },
  "PAE": { full:"Post-antibiotic effect", def:"Persistent suppression of regrowth after concentrations fall below MIC — long for aminoglycosides and fluoroquinolones." },
  "ECOFF": { full:"Epidemiological cutoff", def:"The MIC separating wild-type isolates from those with any acquired resistance mechanism." },
  "NPV": { full:"Negative predictive value", def:"Probability that a negative test (e.g., MRSA nasal PCR) truly excludes the organism." },
  "OPAT": { full:"Outpatient parenteral antimicrobial therapy", def:"Completing intravenous therapy outside the hospital." },
  "TDM": { full:"Therapeutic drug monitoring", def:"Level-guided dosing — vancomycin AUC, aminoglycoside peaks and troughs." },
  "CIED": { full:"Cardiac implantable electronic device", def:"Pacemaker or ICD; infection mandates complete system extraction plus antibiotics." },
  "PJI": { full:"Prosthetic joint infection", def:"Device-associated biofilm infection; cure usually needs explant or prolonged suppression." },
  "PVE": { full:"Prosthetic valve endocarditis", def:"Higher-risk endocarditis; add rifampin for staphylococci once bacteraemia clears." },
  "AUC/MIC": { full:"Area-under-curve to MIC ratio", def:"Total daily exposure relative to potency — the vancomycin target is 400–600." },
  "%fT>MIC": { full:"Percent free time above MIC", def:"Fraction of the interval that free drug stays above MIC — the β-lactam target; favours extended infusion." },
  "Cmax/MIC": { full:"Peak-to-MIC ratio", def:"Peak concentration relative to MIC — the aminoglycoside target (~8–10); favours once-daily dosing." },
  "MIC": { full:"Minimum inhibitory concentration", def:"Lowest concentration that suppresses visible growth in vitro — a potency measure, meaningful only against the breakpoint." },
  "AUC": { full:"Area under the concentration–time curve", def:"Total 24-hour drug exposure; the efficacy driver for vancomycin, fluoroquinolones, and linezolid." },
  "GNR": { full:"Gram-negative rods", def:"Aerobic Gram-negative bacilli — Enterobacterales plus the non-fermenters (Pseudomonas, Acinetobacter, Stenotrophomonas)." },
  "VRE": { full:"Vancomycin-resistant enterococci", def:"Usually E. faecium; vanA confers high-level vancomycin resistance. Treat with daptomycin or linezolid.", agent:["Daptomycin","First-line for VRE bacteraemia (≥10 mg/kg)"] },
  "CoNS": { full:"Coagulase-negative staphylococci", def:"Skin flora (e.g., S. epidermidis) — a frequent contaminant, but a true pathogen on prosthetic material and lines." },
  "PBP": { full:"Penicillin-binding protein", def:"The transpeptidases β-lactams inhibit; altered PBPs underlie pneumococcal and gonococcal resistance." },
  "PBP2a": { full:"Penicillin-binding protein 2a", def:"The low-affinity PBP (mecA-encoded) that makes MRSA resistant to all standard β-lactams; ceftaroline is the exception." },
  "mecA": { full:"mecA gene", def:"Encodes PBP2a — the molecular definition of methicillin resistance in staphylococci." },
  "vanA": { full:"vanA gene cluster", def:"Inducible high-level resistance to vancomycin and teicoplanin in enterococci." },
  "vanB": { full:"vanB gene cluster", def:"Vancomycin resistance with retained teicoplanin susceptibility in enterococci." },
  "CTX-M": { full:"CTX-M β-lactamase", def:"The dominant ESBL enzyme family worldwide; preferentially hydrolyses cefotaxime and ceftriaxone." },
  "EUCAST": { full:"European Committee on Antimicrobial Susceptibility Testing", def:"One of the two major breakpoint-setting bodies; breakpoints differ from CLSI for some agents." },
  "CLSI": { full:"Clinical and Laboratory Standards Institute", def:"The US breakpoint-setting body; interpretive categories can differ from EUCAST." },
  "D-test": { full:"D-zone test", def:"Detects inducible clindamycin resistance (erm) in staph/strep — a positive test means clindamycin will fail." },
  "Eagle effect": { full:"Eagle effect", def:"Paradoxical loss of β-lactam efficacy at a high organism burden — the rationale for adding clindamycin in toxin-mediated streptococcal disease." },
  "CABP": { full:"Community-acquired bacterial pneumonia", def:"The bacterial subset of CAP; the labelled indication for several newer oral agents." },
  "ABSSSI": { full:"Acute bacterial skin and skin-structure infection", def:"Regulatory term for moderate–severe skin infection; the trial indication for long-acting lipoglycopeptides." },
  "cUTI": { full:"Complicated urinary tract infection", def:"UTI with a structural/functional abnormality, catheter, or systemic features — the trial indication for many novel Gram-negative agents." },
  "cIAI": { full:"Complicated intra-abdominal infection", def:"Infection extending beyond the hollow viscus, requiring source control alongside antibiotics." },
  "DFI": { full:"Diabetic foot infection", def:"Graded mild–severe; IWGDF/IDSA guidance drives the breadth and duration of therapy." },
  "TSS": { full:"Toxic shock syndrome", def:"Superantigen-mediated shock (S. aureus or group A strep); add clindamycin for toxin suppression." },
  "PJP": { full:"Pneumocystis jirovecii pneumonia", def:"Opportunistic pneumonia in immunocompromised hosts; high-dose TMP-SMX is first-line." },
  "OPSI": { full:"Overwhelming post-splenectomy infection", def:"Fulminant sepsis from encapsulated organisms in asplenic patients — a medical emergency." },
  "IVDU": { full:"Injection drug use", def:"Raises the pretest probability of S. aureus bacteraemia, right-sided endocarditis, and unusual Gram-negatives." },
  "LVAD": { full:"Left ventricular assist device", def:"Mechanical circulatory support; driveline infections are often chronically suppressed until transplant." },
  "PCT": { full:"Procalcitonin", def:"A biomarker whose falling trend can support stopping antibiotics — it never gates starting them." },
};

const GLOSS_KEYS = Object.keys(GLOSSARY).sort((a,b) => b.length - a.length);

const GLOSS_TOKEN = new RegExp("(\\*\\*(.+?)\\*\\*)|(" + GLOSS_KEYS.map(_gloWrap).join("|") + ")", "g");

/* ============================================================================
   v3 · C2 — RAPID DIAGNOSTICS → DE-ESCALATION + 48–72 H TIME-OUT
   Static evidence-anchored rapid-dx panel plus an interactive, resettable
   stewardship checklist (React state only — no browser storage).
   ========================================================================== */
const RAPID_DX = [
  { icon:"Microscope", t:"MRSA nasal PCR", lead:"Negative predictive value ~96–99% for MRSA in pneumonia and most invasive infection.",
    points:[
      "A negative swab is strong evidence to discontinue empiric vancomycin or linezolid — among the highest-yield stewardship actions on the ward.",
      "Predictive value falls with known MRSA colonization, prior MRSA infection, or a deep undrained focus.",
      "Weigh against pretest probability before acting on a negative result.",
    ] },
  { icon:"FlaskConical", t:"Rapid blood-culture identification", lead:"BCID2, Verigene, and T2Bacteria return organism plus key resistance genes hours to a day before conventional susceptibilities.",
    points:[
      "Resistance markers — mecA (MRSA), vanA/B (VRE), CTX-M (ESBL), and KPC/NDM/OXA (carbapenemases) — enable targeting before formal susceptibility testing.",
      "Prompts de-escalation as often as escalation.",
      "Pairing with antimicrobial-stewardship review yields the largest mortality and length-of-stay benefit.",
    ] },
  { icon:"TrendingDown", t:"Procalcitonin", lead:"A falling trend supports discontinuation; a low value does not justify withholding therapy in suspected sepsis.",
    points:[
      "Serial measurement can shorten courses in lower respiratory tract infection and sepsis when the level declines.",
      "A discontinuation aid, not a gate on initiation.",
      "Never delay empiric therapy in shock on the basis of a low procalcitonin.",
    ] },
];

/* Criteria to be satisfied at the 48–72 h reassessment — a reference list of
   declarative standards, not an interactive checklist. */
const TIMEOUT_ITEMS = [
  { k:"dx",     t:"Infection remains the working diagnosis", d:"Cultures, imaging, and clinical trajectory have been re-examined; non-infectious mimics, which surface by 48–72 h, have been excluded." },
  { k:"narrow", t:"Therapy has been narrowed to culture data", d:"Coverage is de-escalated to the narrowest agent active against the identified organism; definitive therapy is almost always narrower than empiric." },
  { k:"mrsa",   t:"Anti-MRSA coverage has been reassessed", d:"A negative MRSA nasal PCR or the absence of MRSA on culture supports discontinuing vancomycin or linezolid." },
  { k:"gnr",    t:"Double or antipseudomonal Gram-negative cover has collapsed to one agent", d:"The second Gram-negative agent and antipseudomonal breadth are withdrawn once susceptibilities permit." },
  { k:"ivpo",   t:"Intravenous-to-oral conversion has been considered", d:"The patient is hemodynamically stable and afebrile, tolerating and absorbing enteral intake, with a suitable high-bioavailability oral agent available." },
  { k:"source", t:"Source control has been achieved", d:"The line is removed, the collection drained, or the focus debrided; antibiotics do not substitute for source control." },
  { k:"stop",   t:"A stop date has been set", d:"The shortest evidence-based duration is committed to now rather than left open-ended." },
];

/* ============================================================================
   v3 · D3 — IV → PO STEP-DOWN WIDGET
   Interactive switch-criteria checklist with a live verdict, plus the
   high-bioavailability oral agents that make intravenous access unnecessary.
   ========================================================================== */
const IVPO_CRITERIA = [
  "Hemodynamically stable and clinically improving",
  "Afebrile or temperature trending down (~24 h)",
  "Tolerating oral / enteral intake with an absorbing gut",
  "A suitable high-bioavailability oral agent matches organism and site",
  "No deep / undrained focus mandating IV — or trial evidence supports oral (OVIVA, POET)",
];

const PO_AGENTS = [
  { n:"Linezolid", f:"~100%" }, { n:"Levofloxacin", f:"~99%" }, { n:"Metronidazole", f:"~100%" },
  { n:"Moxifloxacin", f:"~90%" }, { n:"Trimethoprim-sulfamethoxazole", f:"~90%" },
  { n:"Doxycycline / minocycline", f:">90%" }, { n:"Clindamycin", f:"~90%" }, { n:"Ciprofloxacin", f:"~70%" },
];

export { ALLERGY_INTRO, ALLERGY, SPECIAL_POP, PROPHYLAXIS, OPAT, SEPSIS_FLOW, TREES, RAPID_DX, TIMEOUT_ITEMS, IVPO_CRITERIA, PO_AGENTS, GLOSSARY, GLOSS_KEYS, GLOSS_TOKEN };
