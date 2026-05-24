/* data · regimenContent — Phase D1.5 per-option clinical content.
   The single source of truth for the per-card decision content shown
   inside each regimen option in the Answer Canvas. Authored at the
   apex-quality bar: every entry is action-oriented, evidence-aware,
   and dense enough that a clinician can decide between options from
   the card alone — without scrolling, without opening Reference, and
   without re-reading the same fact in three places on the screen.

   SHAPE
   -----
   REGIMEN_CONTENT[syndromeId][tierLabel] is an array of matchers, each
   tested against the option text produced by splitRegimenOptions.
   First match wins, so order entries from most-specific to least-
   specific within each tier.

       {
         rx: /nitrofurantoin/i,             // regex against option text

         pickIf:  "5-second verdict — one sentence.",   // card subtitle

         whyPick: [                          // strengths bullets
           "**Killer fact in bold** plus explanation.",
           "Next bullet…",
         ],

         watchOut: [                         // cautions bullets
           { sev: "stop", text: "**Hard contraindication** — why." },
           { sev: "warn", text: "**Dangerous interaction** — why." },
           { sev: "note", text: "Important to know, not a deal-breaker." },
         ],
       }

   WRITING THE CONTENT
   -------------------
   pickIf
     - One sentence. ≤ 20 words. Reads like a stop-and-decide cue.
     - Compare implicitly to the sibling options ("when nitrofurantoin
       is contraindicated", "shortest course", "best adherence").

   whyPick
     - Bullets, not paragraphs. ≤ 12 words each.
     - **Bold** the single fact that makes this drug the right pick
       (the number, the cutoff, the class advantage).
     - 3–5 bullets per drug. Skip filler.
     - Cite evidence in compressed form ("60× urinary conc",
       "AUC/MIC 400–600", "IDSA 2010").
     - No "consider", "may", "can"; be declarative.

   watchOut[].sev
     - "stop" — hard contraindication, the kind that ends a career
       (renal cutoff, allergy class, pregnancy stage, drug interaction
       that kills). Renders red. Use sparingly — every "stop" should
       be a true do-not-use.
     - "warn" — important interaction or spectrum gap. Renders amber.
     - "note" — useful to know, not action-forcing. Renders muted.

   watchOut[].text
     - **Bold** the cutoff or interaction trigger. Then the why.
     - Concrete numbers. CrCl 30, not "renal impairment". 38 weeks,
       not "late pregnancy".
     - ≤ 18 words per bullet.

   The renderer parses **bold** in any text field and accents it in
   the entry's color (orange for whyPick, amber for watchOut warn /
   note, red for watchOut stop).

   FALLBACK & TIER-NOTE DEDUPE
   ----------------------------
   * Options without an entry render with just the drug fragment +
     route badge + dose chips. The file fills in over time without
     breaking anything that renders.
   * When ANY option in a tier has content authored, AnswerCanvas
     suppresses the tier-level italic `note` to eliminate the
     "card duplicates the note below the cards" redundancy. If the
     note carries non-drug-specific framing that the cards don't
     subsume, fold it into the syndrome's tier rx/note or into one
     of the per-card whyPick lists.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

const REGIMEN_CONTENT = {

  /* ===========================================================
     CYSTITIS — IDSA 2010 (Gupta) defines the first-line trio;
     β-lactams are explicitly worse and reserved for failures
     or contraindications. =========================================== */
  cystitis: {
    "First-line": [
      {
        rx: /nitrofurantoin/i,
        pickIf: "Uncomplicated cystitis, CrCl ≥ 30, no fever or flank pain.",
        whyPick: [
          "**IDSA-preferred** for 40+ years and counting",
          "**60× urinary concentration** with minimal systemic exposure",
          "**< 5% national E. coli resistance** despite decades of use",
          "Spares gut + vaginal flora — lowest collateral damage",
          "Safe in 1st & 2nd trimester pregnancy",
        ],
        watchOut: [
          { sev: "stop", text: "**CrCl < 30** — urine concentration drops below MIC",
            matchCtx: { crcl: { lt: 30 } } },
          { sev: "stop", text: "**Pyelonephritis** / fever / flank pain — zero tissue penetration",
            matchCtx: { severe: true } },
          { sev: "stop", text: "**Term pregnancy (≥ 38 wk)** — neonatal hemolysis risk" },
          { sev: "stop", text: "**G6PD deficiency** — acute hemolysis" },
          { sev: "warn", text: "**Long courses (months)** — pulmonary fibrosis, hepatotoxicity" },
        ],
      },
      {
        rx: /fosfomycin/i,
        pickIf: "Best adherence — one sachet, done. Use when nitrofurantoin is out.",
        whyPick: [
          "**Single 3 g PO dose** — best adherence in the trio",
          "Covers most **ESBL E. coli** and **VRE**",
          "Preserves fluoroquinolones for upper-tract disease",
          "Safe across pregnancy and in **CrCl < 30**",
          "Right pick when nitrofurantoin is contraindicated",
        ],
        watchOut: [
          { sev: "warn", text: "**Cure rate 5–10 pp lower** than 5-day nitrofurantoin" },
          { sev: "stop", text: "**Pyelonephritis / febrile UTI** — lower-tract drug only" },
          { sev: "warn", text: "Diarrhea in **~10%**" },
          { sev: "note", text: "Repeat dosing does **not** improve cystitis outcomes — single dose is the regimen" },
          { sev: "note", text: "Avoid if local E. coli **fosfomycin resistance > 10%**" },
        ],
      },
      {
        rx: /TMP-?\s?SMX|trimethoprim/i,
        pickIf: "Shortest course (3 d). Only first-line that also treats early pyelo.",
        whyPick: [
          "**Shortest course — 3 days PO**",
          "Achieves **urinary + tissue** concentrations (covers early pyelo if dx is wrong)",
          "Cheap, oral, well-tolerated",
          "Pick when local E. coli resistance **< 20%** and no sulfa allergy",
        ],
        watchOut: [
          { sev: "stop", text: "**Local E. coli resistance ≥ 20%** — do not use empirically (check antibiogram)" },
          { sev: "stop", text: "**Sulfa allergy** (SJS/TEN history is absolute)" },
          { sev: "stop", text: "**3rd trimester pregnancy** — kernicterus" },
          { sev: "warn", text: "**Hyperkalemia** with ACE-I, ARB, spironolactone" },
          { sev: "warn", text: "Boosts **warfarin INR**; raises **methotrexate**, **sulfonylureas**, **phenytoin**" },
        ],
      },
    ],
    "Second-line": [
      {
        rx: /β-?lactam|cefpodoxime|cefdinir/i,
        pickIf: "First-line trio is out (CrCl < 30 + sulfa allergy + fosfo unavailable).",
        whyPick: [
          "**Oral narrow-ish spectrum** — better stewardship than fluoroquinolones",
          "Useful when nitrofurantoin fails (CrCl < 30) **AND** TMP-SMX is contraindicated",
          "**Pregnancy-safe across all trimesters** — first-choice when alternatives are out",
          "**Cefpodoxime** has the strongest cystitis data; cefdinir / cefuroxime acceptable substitutes",
        ],
        watchOut: [
          { sev: "warn", text: "**Cure rates 5–15 pp lower** than first-line; higher relapse" },
          { sev: "warn", text: "Do **not extend beyond 7 days** — no benefit, amplifies collateral resistance" },
          { sev: "note", text: "Cross-reactivity with **severe** penicillin allergy ~1%; rash alone is not a contraindication",
            matchCtx: { blAllergy: "severe" } },
          { sev: "note", text: "Promotes **C. difficile** and ESBL selection more than nitrofurantoin / fosfomycin" },
        ],
      },
      {
        rx: /amoxicillin-?clavulanate|augmentin/i,
        pickIf: "Cephalosporins contraindicated and antibiogram supports empiric use.",
        whyPick: [
          "**Oral, well-absorbed** — covers most community E. coli **when antibiogram allows**",
          "Useful when both cephalosporins and the first-line trio are out",
          "**Pregnancy-safe** — broadest-tolerated UTI agent in pregnancy",
        ],
        watchOut: [
          { sev: "stop", text: "**Empiric resistance often > 30%** in community E. coli — verify antibiogram" },
          { sev: "warn", text: "GI intolerance + antibiotic-associated diarrhea common — counsel before starting" },
          { sev: "warn", text: "**Cholestatic hepatitis** — rare but classic, may appear weeks after course" },
        ],
      },
    ],
  },

  /* ===========================================================
     SEPSIS (community / undifferentiated) — Surviving Sepsis 2021.
     The Hour-1 bundle drives empiric breadth: cover Pseudomonas,
     add MRSA by risk, escalate by colonization. The β-lactam
     backbone is a single class recommendation in the source text
     (one card), so the trio comparison lives inside whyPick. ====== */
  sepsis: {
    "Broad empiric": [
      {
        rx: /antipseudomonal|piperacillin|cefepime|meropenem/i,
        pickIf: "Septic shock / severe sepsis — pick ONE β-lactam, give in Hour-1.",
        whyPick: [
          "**Pip-tazo** — broadest community cover (gut anaerobes + Pseudomonas)",
          "**Cefepime** — cleanest Pseudomonas; no anaerobes; pair with metronidazole if gut source",
          "**Meropenem** — pick if **prior ESBL** or recent broad β-lactam exposure",
          "All three: **extended-infusion** at MIC ≥ 4 mg/L; **load full dose** even with AKI",
          "Add **vancomycin** for hypotension, indwelling line, prior MRSA, recent admission",
        ],
        watchOut: [
          { sev: "stop", text: "**Anaphylaxis to penicillin** — cefepime/meropenem OK; pip-tazo avoid" },
          { sev: "warn", text: "**Pip-tazo + vancomycin → AKI** signal (RR ~1.5); use cefepime if renal-fragile" },
          { sev: "warn", text: "**Cefepime neurotoxicity** if CrCl < 60 and dose not reduced — myoclonus, NCSE" },
          { sev: "warn", text: "**Meropenem ↓ valproate levels** by 60–90% — seizure risk in epilepsy" },
          { sev: "note", text: "**De-escalate at 48–72 h** once cultures back; don't ride the broad regimen" },
        ],
      },
    ],
    "Add MRSA": [
      {
        rx: /vancomycin|linezolid/i,
        pickIf: "Hypotension, indwelling line, prior MRSA, or recent hospitalization.",
        whyPick: [
          "**Vancomycin** — first-line; cheap, bactericidal, IDSA AUC 400–600 target",
          "**Linezolid** alternative for **VRE** coverage or vancomycin failure / intolerance",
          "Load **25–30 mg/kg ABW** vancomycin once for septic shock — don't underdose",
          "Stop the MRSA agent at 48 h if MRSA nares **negative** and no source",
        ],
        watchOut: [
          { sev: "warn", text: "**Vanco + pip-tazo AKI signal** — monitor SCr q24h; consider cefepime backbone" },
          { sev: "warn", text: "**Vanco AUC > 600** — nephrotoxicity rises sharply; trough alone underdoses" },
          { sev: "stop", text: "**Linezolid + SSRI/MAOI** — serotonin syndrome; stop SSRI or switch agent" },
          { sev: "warn", text: "**Linezolid > 14 d** — cytopenias, peripheral + optic neuropathy, lactic acidosis" },
          { sev: "note", text: "**MRSA nares PCR NPV ~96%** for pneumonia — discontinue early if negative" },
        ],
      },
    ],
    "Add resistant-GNR cover": [
      {
        rx: /carbapenem|novel/i,
        pickIf: "Prior ESBL/CRE/Pseudomonas isolate, recent abroad travel, ICU exposure.",
        whyPick: [
          "**Meropenem** — ESBL workhorse; bactericidal, CSF-penetrating, broadly used",
          "**Ceftolozane-tazo / ceftaz-avi / imipenem-relebactam** — for DTR-Pseudomonas, KPC-CRE",
          "Pick the **novel β-lactam** that matches the colonizing mechanism (KPC vs MBL vs OXA)",
          "Get ID on board early — drug selection determines mortality in CRE bacteremia",
        ],
        watchOut: [
          { sev: "warn", text: "**Meropenem ↓ valproate** by 60–90% — never combine in epilepsy" },
          { sev: "warn", text: "**Imipenem seizure** risk in CrCl < 30; meropenem cleaner" },
          { sev: "stop", text: "**MBL producers** (NDM, IMP, VIM) — ceftaz-avi inactive; aztreonam + ceftaz-avi or cefiderocol" },
          { sev: "note", text: "**Carbapenem-sparing** in ESBL UTI: pip-tazo at MIC ≤ 16 acceptable (MERINO debate)" },
          { sev: "note", text: "**Antibiogram-driven** — never empiric without colonization data or ID input" },
        ],
      },
    ],
  },

  /* ===========================================================
     SEPSIS — Healthcare-associated. Empirics expand for prior
     resistant flora and instrumentation. =========================== */
  "sepsis-hcaq": {
    "Broad empiric": [
      {
        rx: /antipseudomonal|cefepime|piperacillin|meropenem/i,
        pickIf: "Hospital-onset sepsis or ≥ 90 d ICU / hemodialysis / SNF exposure.",
        whyPick: [
          "**Antipseudomonal β-lactam + vancomycin** is the standard backbone",
          "Pick **meropenem** if prior ESBL or broad β-lactam in last 90 d",
          "**Extended infusion** β-lactam preferred — better PK/PD vs nosocomial GNR",
          "Always pair with **vancomycin** (or linezolid) — MRSA carriage is common",
        ],
        watchOut: [
          { sev: "warn", text: "**Pip-tazo + vanco AKI** — favor cefepime in renal-fragile" },
          { sev: "warn", text: "**Cefepime neurotoxicity** if renal dosing missed" },
          { sev: "stop", text: "Recent CRE colonization — empiric carbapenem may fail; ID consult" },
        ],
      },
    ],
    "Resistant-GNR risk": [
      {
        rx: /carbapenem|novel|β-?lactam/i,
        pickIf: "Prior ESBL, CRE, DTR-Pseudomonas, or recent broad β-lactam.",
        whyPick: [
          "**Meropenem** covers most ESBL; **ceftaz-avi** or **imipenem-relebactam** for KPC-CRE",
          "**Ceftolozane-tazo** for DTR-Pseudomonas — preserves carbapenems",
          "**Cefiderocol** salvage for MBL producers + Acinetobacter / Stenotrophomonas",
          "Match drug to **resistance mechanism**, not just antibiogram MIC",
        ],
        watchOut: [
          { sev: "stop", text: "**MBL CRE** — ceftaz-avi inactive; use aztreonam + ceftaz-avi OR cefiderocol" },
          { sev: "warn", text: "Novel β-lactams cost $1k+/day — get ID stewardship sign-off" },
          { sev: "note", text: "Re-culture every 48 h — switch the moment a narrower active agent appears" },
        ],
      },
    ],
  },

  /* ===========================================================
     SEPSIS — Neutropenic host. IDSA 2018 (Taplitz). Monotherapy
     β-lactam is the standard; add vanco only by indication, not
     reflexively. =================================================== */
  "sepsis-neutropenic": {
    "Empiric monotherapy": [
      {
        rx: /cefepime/i,
        pickIf: "Hemodynamically stable febrile neutropenia, no prior ESBL.",
        whyPick: [
          "**IDSA first-line** monotherapy in febrile neutropenia (2018)",
          "**Excellent Pseudomonas** coverage, narrower than carbapenem",
          "No anaerobic activity — preserves gut microbiome more than pip-tazo",
          "**Renally cleared** — easy dose adjustment in tumor-lysis AKI",
        ],
        watchOut: [
          { sev: "warn", text: "**Cefepime neurotoxicity** if CrCl < 60 and dose not reduced" },
          { sev: "warn", text: "**No anaerobic cover** — add metronidazole for typhlitis / mucositis" },
          { sev: "note", text: "Stop at 48 h if afebrile, ANC recovering, cultures negative (per IDSA)" },
        ],
      },
      {
        rx: /piperacillin/i,
        pickIf: "Mucositis, typhlitis, or any suspicion of gut translocation.",
        whyPick: [
          "**Adds anaerobic cover** — useful in mucositis / typhlitis / abdominal source",
          "Equivalent efficacy to cefepime in stable febrile neutropenia",
          "Single agent covers gut anaerobes + Pseudomonas in one drug",
        ],
        watchOut: [
          { sev: "warn", text: "**Pip-tazo + vanco AKI** — if adding vanco, prefer cefepime backbone" },
          { sev: "warn", text: "Promotes **VRE selection** more than cefepime (anaerobic kill)" },
          { sev: "note", text: "ESBL inoculum effect — switch to meropenem if not improving" },
        ],
      },
      {
        rx: /meropenem/i,
        pickIf: "Prior ESBL, prior broad β-lactam in last 90 d, or critically ill.",
        whyPick: [
          "**ESBL workhorse** — reliable killing where pip-tazo / cefepime fail",
          "Covers gut anaerobes; broadest single-agent option",
          "Use in **septic shock** while colonization data return",
        ],
        watchOut: [
          { sev: "warn", text: "**↓ valproate** by 60–90% — never combine in epilepsy" },
          { sev: "warn", text: "Promotes **CRE selection** — narrow ASAP once cultures back" },
          { sev: "note", text: "Reserve for true ESBL / sepsis indication — stewardship-sensitive" },
        ],
      },
    ],
    "Add MRSA / resistant cover": [
      {
        rx: /vancomycin|MRSA|resistant/i,
        pickIf: "Catheter source, SSTI, pneumonia, hypotension, or hard MRSA colonization.",
        whyPick: [
          "**Add vancomycin** for the indications above — NOT for reflexive empiric breadth",
          "Add **resistant-GNR cover** by colonization history (carbapenem or novel β-lactam)",
          "**Stop the MRSA agent at 48 h** if cultures negative and source unidentified",
        ],
        watchOut: [
          { sev: "warn", text: "Reflexive vanco use → AKI + VRE selection without clinical benefit" },
          { sev: "warn", text: "**Linezolid > 14 d** in neutropenia worsens thrombocytopenia" },
          { sev: "note", text: "MRSA nares PCR negative → safe to drop vanco early" },
        ],
      },
    ],
  },

  /* ===========================================================
     SEPSIS — Asplenia. Encapsulated organisms (pneumococcus,
     H. flu, meningococcus, Capnocytophaga) drive empirics. ===== */
  "sepsis-asplenia": {
    "Empiric": [
      {
        rx: /ceftriaxone/i,
        pickIf: "Any fever + asplenia/hyposplenia — treat as bacteremia until proven otherwise.",
        whyPick: [
          "**Ceftriaxone 2 g IV q12h** (meningitis dose) — covers pneumococcus + Capnocytophaga",
          "Mortality in OPSI **40–70%** — give within **minutes** of suspicion",
          "Add **vancomycin** for resistant pneumococcus / meningitis suspicion",
          "**Counsel patients**: every fever = ED visit; carry standby amox-clav at home",
        ],
        watchOut: [
          { sev: "stop", text: "**Do not wait for cultures** — give first dose at triage" },
          { sev: "warn", text: "Capnocytophaga canimorsus (dog bite + asplenia) → fulminant DIC" },
          { sev: "note", text: "Functional asplenia (SCD, celiac, post-XRT) carries similar risk" },
        ],
      },
    ],
  },

  /* ===========================================================
     SEPSIS — Toxic/streptococcal. Clindamycin for toxin
     suppression is non-negotiable. =================================== */
  "sepsis-toxic": {
    "Empiric": [
      {
        rx: /β-?lactam|piperacillin|carbapenem/i,
        pickIf: "Rapid-onset shock + diffuse erythroderma / soft-tissue pain out of proportion.",
        whyPick: [
          "**β-lactam + vancomycin + clindamycin** — full triple coverage",
          "**Clindamycin** suppresses TSST-1 / streptococcal exotoxin (ribosomal block)",
          "Pip-tazo or carbapenem covers gut translocation + GNR sepsis",
          "Add **IVIG 1–2 g/kg** for streptococcal TSS — mortality benefit",
          "Source control: remove tampon, debride, drain — antibiotics are adjunctive",
        ],
        watchOut: [
          { sev: "stop", text: "**Surgical source control delayed** → mortality climbs hour by hour" },
          { sev: "warn", text: "**Clindamycin diarrhea / C. difficile** — accept the risk in TSS; stop early" },
          { sev: "note", text: "Linezolid alternative to clinda for toxin suppression if clinda resistant" },
        ],
      },
    ],
  },

  /* ===========================================================
     SEPSIS — Abdominal source. SIS/IDSA 2017 (Mazuski). ============ */
  "sepsis-abdominal": {
    "Empiric": [
      {
        rx: /piperacillin/i,
        pickIf: "Community-acquired intra-abdominal sepsis — single agent covers it all.",
        whyPick: [
          "**Single agent** covers enteric GNR + anaerobes + Enterococcus",
          "**Extended infusion** (4-hour) at MIC ≥ 8 in critically ill — better PK/PD",
          "Add **vancomycin** if healthcare-associated or instrumented",
          "Source control (drainage / surgery) is the actual treatment — antibiotics adjunctive",
        ],
        watchOut: [
          { sev: "warn", text: "**Pip-tazo + vanco AKI** — switch to ceftriaxone+metronidazole if renal-fragile" },
          { sev: "warn", text: "ESBL inoculum effect — switch to meropenem if not improving by 72 h" },
          { sev: "note", text: "De-escalate at 48–72 h on culture data — 4–5 d post-source-control is enough (STOP-IT)" },
        ],
      },
      {
        rx: /carbapenem|meropenem|ertapenem/i,
        pickIf: "Prior ESBL, recent broad β-lactam, or healthcare-associated abdominal sepsis.",
        whyPick: [
          "**Reliable ESBL kill** — pip-tazo less reliable at inoculum",
          "Single-agent broad cover (anaerobes + GNR + most enterococci)",
          "**Meropenem** for ICU/shock; **ertapenem** for stable HAI without Pseudomonas risk",
        ],
        watchOut: [
          { sev: "stop", text: "**Ertapenem misses Pseudomonas** — never empiric for septic shock" },
          { sev: "warn", text: "Meropenem ↓ valproate 60–90% — never in epileptics" },
          { sev: "note", text: "Promotes CRE — narrow ASAP on culture data" },
        ],
      },
    ],
    "Add antifungal risk": [
      {
        rx: /echinocandin|antifungal/i,
        pickIf: "Upper-GI perf, postoperative leak, recurrent intra-abdominal infection, TPN, immunosuppressed.",
        whyPick: [
          "**Echinocandin** (caspofungin/micafungin) — broad Candida coverage incl. C. glabrata / krusei",
          "Fluconazole acceptable for C. albicans + stable patient",
          "**Target Candida in peritoneal fluid** — don't wait for blood cultures",
        ],
        watchOut: [
          { sev: "warn", text: "**Fluconazole misses** C. glabrata (intermediate) and C. krusei (resistant)" },
          { sev: "warn", text: "Echinocandins **don't cover** Cryptococcus or molds (Aspergillus)" },
          { sev: "note", text: "Step down to PO fluconazole once species + sensitivities known" },
        ],
      },
    ],
  },

  /* ===========================================================
     CAP — IDSA/ATS 2019 (Metlay). Macrolides for atypical
     coverage; FQs alternative; β-lactams cover S. pneumoniae. ===== */
  cap: {
    "Inpatient, non-ICU": [
      {
        rx: /ceftriaxone.*azithromycin|ceftriaxone\s*\+.*azithromycin/i,
        pickIf: "Hospitalized CAP, no shock, no Pseudomonas / MRSA risk.",
        whyPick: [
          "**IDSA/ATS 2019 first-line** for non-ICU inpatient CAP",
          "Ceftriaxone covers S. pneumoniae (incl. PCN-resistant) + H. influenzae",
          "Azithromycin covers **Mycoplasma, Chlamydia, Legionella**",
          "**Macrolide adjunctive benefit** in pneumococcal bacteremia (immune modulation)",
          "Switch to oral on clinical improvement — same total course (5 d typical)",
        ],
        watchOut: [
          { sev: "warn", text: "**QT prolongation** — check baseline ECG with methadone/ondansetron/quinolones" },
          { sev: "warn", text: "Macrolide-resistant Mycoplasma rising in some regions — clinical failure → switch to FQ" },
          { sev: "note", text: "Duration: **5 days** if afebrile by 48–72 h, stable, oral intake (IDSA)" },
          { sev: "note", text: "Levofloxacin monotherapy is the FQ-allergic / macrolide-intolerant alternative" },
        ],
      },
    ],
    "Severe / ICU": [
      {
        rx: /β-?lactam.*azithromycin|β-?lactam.*macrolide/i,
        pickIf: "ICU CAP — preferred combo for immune modulation in pneumococcal disease.",
        whyPick: [
          "**β-lactam + macrolide** — IDSA-preferred over β-lactam + FQ in ICU CAP",
          "Macrolide associated with **lower mortality** in severe pneumococcal CAP (observational)",
          "Covers atypicals — Legionella is up to **5% of severe CAP**",
          "Use **ampicillin-sulbactam** if aspiration risk (anaerobic cover)",
        ],
        watchOut: [
          { sev: "warn", text: "**QT prolongation** — pair with other QT drugs cautiously" },
          { sev: "warn", text: "If **MRSA risk** (necrotizing CAP, post-influenza, prior MRSA), add vancomycin/linezolid" },
          { sev: "warn", text: "If **Pseudomonas risk** (bronchiectasis, recent abx), use pip-tazo / cefepime backbone" },
          { sev: "note", text: "Don't forget steroids: dexamethasone 6 mg × 5 d in severe CAP without shock (CAPE-COD)" },
        ],
      },
      {
        rx: /respiratory\s+FQ|levofloxacin|moxifloxacin/i,
        pickIf: "Severe penicillin/macrolide allergy, or oral-only option needed for step-down.",
        whyPick: [
          "**Single-agent option** covers pneumococcus + atypicals — useful in PCN-allergic ICU patients",
          "**High oral bioavailability** (~99%) — seamless IV-to-PO switch",
          "Covers Legionella — equivalent to macrolide for atypicals",
        ],
        watchOut: [
          { sev: "warn", text: "**Tendinopathy / aortic dissection** — avoid in elderly + steroids + connective tissue dz" },
          { sev: "warn", text: "**QT prolongation** + dysglycemia in diabetics" },
          { sev: "warn", text: "**Masks TB** — culture if cavitary disease before starting" },
          { sev: "warn", text: "Risk of **C. difficile** higher than β-lactam+macrolide combos" },
          { sev: "note", text: "FDA black box for non-life-threatening infections — reserve for true need" },
        ],
      },
    ],
  },

  /* ===========================================================
     HAP / VAP — IDSA 2016 (Kalil). Antipseudomonal backbone +
     MRSA cover by risk; double GNR only when MDR risk high. ====== */
  hap: {
    "Empiric backbone": [
      {
        rx: /piperacillin/i,
        pickIf: "Standard HAP without ESBL risk; broad enough to cover gut anaerobes.",
        whyPick: [
          "**Antipseudomonal + anaerobic + GNR** in one agent",
          "Extended-infusion **4-hour dosing** at MIC ≥ 4 — improves outcomes in VAP",
          "Preferred when aspiration suspected (anaerobic cover)",
          "Cheapest of the three antipseudomonal β-lactams",
        ],
        watchOut: [
          { sev: "warn", text: "**Pip-tazo + vanco → AKI** — favor cefepime backbone if renal-fragile" },
          { sev: "warn", text: "ESBL inoculum effect — switch to meropenem if not improving" },
          { sev: "note", text: "Duration: **7 days** for most HAP/VAP (PneumA, IDSA) — fixed duration beats clinical judgment" },
        ],
      },
      {
        rx: /cefepime/i,
        pickIf: "HAP without aspiration risk; renal-fragile patient where pip-tazo+vanco AKI feared.",
        whyPick: [
          "**Cleanest pseudomonal β-lactam** — no anaerobes (less VRE selection)",
          "**Avoids the pip-tazo + vanco AKI** signal",
          "Renally cleared — easy adjustment in evolving AKI",
        ],
        watchOut: [
          { sev: "stop", text: "**No anaerobic cover** — add metronidazole if aspiration / abscess" },
          { sev: "warn", text: "**Neurotoxicity** if CrCl < 60 and not dose-reduced (myoclonus, NCSE)" },
          { sev: "note", text: "Equivalent efficacy to pip-tazo in VAP trials with lower nephrotoxicity signal" },
        ],
      },
      {
        rx: /meropenem/i,
        pickIf: "Prior ESBL colonization or broad β-lactam in last 90 days.",
        whyPick: [
          "**Reliable ESBL kill** — pip-tazo/cefepime fail at inoculum",
          "Broadest single-agent (anaerobes + GNR + most enterococci)",
          "Use for **septic shock** while waiting for culture data",
        ],
        watchOut: [
          { sev: "warn", text: "**↓ valproate 60–90%** — never combine in epilepsy" },
          { sev: "warn", text: "Promotes CRE — narrow ASAP once cultures back" },
          { sev: "note", text: "Stewardship-sensitive — document the indication" },
        ],
      },
    ],
    "Add MRSA": [
      {
        rx: /vancomycin/i,
        pickIf: "Prior MRSA, septic shock, recent broad abx, or local MRSA HAP > 10–20%.",
        whyPick: [
          "**First-line MRSA pneumonia** — cheap, bactericidal, AUC-guided",
          "AUC **400–600** target (Bayesian preferred over trough-only)",
          "Load **25–30 mg/kg ABW** in shock — don't underdose hour 1",
        ],
        watchOut: [
          { sev: "warn", text: "**AUC > 600** — sharp nephrotoxicity rise; troughs alone underdose" },
          { sev: "warn", text: "**+ pip-tazo AKI signal** — consider cefepime backbone if renal-fragile" },
          { sev: "warn", text: "**Lung penetration only 17%** of plasma — high target needed" },
          { sev: "note", text: "Linezolid arguable advantage in MRSA pneumonia (lung penetration); meta-analyses mixed" },
        ],
      },
      {
        rx: /linezolid/i,
        pickIf: "Vancomycin failure, MIC > 1, renal-fragile, or AKI-developing.",
        whyPick: [
          "**Superior lung penetration** — alveolar fluid > plasma",
          "**No renal dose adjustment** — same dose in AKI",
          "Oral = IV bioavailability (~100%) — easy step-down",
          "Effective at vanco-MIC creep > 1.5",
        ],
        watchOut: [
          { sev: "stop", text: "**Linezolid + SSRI/MAOI** — serotonin syndrome; stop SSRI or pick another agent" },
          { sev: "warn", text: "**> 14 days** — cytopenias, optic + peripheral neuropathy, lactic acidosis" },
          { sev: "warn", text: "Bacteriostatic — not first-line for **MRSA bacteremia**" },
          { sev: "note", text: "Cost ~$200/day vs vanco ~$10/day — use when indicated, not default" },
        ],
      },
    ],
    "Double GNR (high risk)": [
      {
        rx: /aminoglycoside|fluoroquinolone|FQ/i,
        pickIf: "Septic shock + prior MDR-GNR colonization or known high local resistance.",
        whyPick: [
          "**Add aminoglycoside** (tobramycin) — synergy, rapid bactericidal, no β-lactam cross-resistance",
          "**Add cipro/levo** if aminoglycoside avoided — oral option, easier",
          "**Stop the 2nd agent at 48–72 h** once susceptibilities back — don't ride double cover",
        ],
        watchOut: [
          { sev: "warn", text: "**Aminoglycoside nephro/ototoxicity** — limit to 48–72 h; check trough" },
          { sev: "warn", text: "**FQ tendinopathy / QT** — avoid in elderly + steroids" },
          { sev: "note", text: "Most HAP/VAP guidelines: **single agent suffices** for most — reserve double for true MDR risk" },
        ],
      },
    ],
    "DTR-Pseudomonas / CRAB salvage (IDSA AMR-GN 2024)": [
      {
        rx: /ceftolozane-?tazobactam/i,
        pickIf: "DTR-Pseudomonas confirmed or carbapenem-resistant Pseudomonas HAP/VAP.",
        whyPick: [
          "**First-line for DTR-Pseudomonas** per IDSA AMR-GN 2024",
          "ASPECT-NP NEJM 2019 non-inferior in HAP/VAP",
          "**3 g IV q8h** for pneumonia — higher than UTI dose",
        ],
        watchOut: [
          { sev: "warn", text: "**NOT for KPC / metallo / OXA-48** — use ceftaz-avi or cefiderocol" },
          { sev: "warn", text: "Renal-adjusted dosing — recheck SCr q48h" },
          { sev: "note", text: "ID + carbapenemase typing mandatory" },
        ],
      },
      {
        rx: /ceftazidime-?avibactam/i,
        pickIf: "KPC-CRE or OXA-48-producing GNR HAP/VAP.",
        whyPick: [
          "**First-line for KPC-CRE + OXA-48** per IDSA AMR-GN 2024",
          "Active vs Ambler A + C + some D β-lactamases",
          "**Combine with aztreonam** for metallo-CRE",
        ],
        watchOut: [
          { sev: "warn", text: "**NOT for metallo-CRE alone** — pair with aztreonam or use cefiderocol" },
          { sev: "warn", text: "Resistance mutations emerging at < 5% — TDM if salvage" },
          { sev: "note", text: "Extended-infusion q8h — 2.5 g over 2 h" },
        ],
      },
      {
        rx: /sulbactam-?durlobactam/i,
        pickIf: "Carbapenem-resistant Acinetobacter baumannii (CRAB) HAP/VAP — first-line per IDSA AMR-GN 2024.",
        whyPick: [
          "**XACDURO Lancet ID 2023** — first-line CRAB by IDSA AMR-GN 2024",
          "Sulbactam targets Acinetobacter PBP3; durlobactam protects from β-lactamases",
          "**Replaces polymyxin combinations** for most CRAB",
        ],
        watchOut: [
          { sev: "stop", text: "**Acinetobacter only** — narrow spectrum; not for other GNR" },
          { sev: "warn", text: "Limited real-world experience — coordinate with ID" },
          { sev: "note", text: "1 g IV q6h each component — renal-adjusted" },
        ],
      },
      {
        rx: /cefiderocol/i,
        pickIf: "Pan-resistant Gram-negative (metallo-CRE / CRAB / Stenotrophomonas) salvage.",
        whyPick: [
          "**Siderophore cephalosporin** — exploits bacterial iron-uptake to penetrate",
          "Active vs **metallo-CRE (NDM/VIM/IMP)** — only monotherapy option",
          "Broad GNR including S. maltophilia",
        ],
        watchOut: [
          { sev: "warn", text: "**CREDIBLE-CR signal** of increased mortality in Acinetobacter subset — controversial; consider sulbactam-durlobactam first for CRAB" },
          { sev: "warn", text: "Renal-adjusted; extended infusion 3 h" },
          { sev: "note", text: "Reserve for pan-resistant where no alternative" },
        ],
      },
    ],
  },

  /* ===========================================================
     ASPIRATION pneumonia. Mostly anaerobes + viridans strep. ====== */
  aspiration: {
    "Community-acquired aspiration": [
      {
        rx: /ceftriaxone/i,
        pickIf: "Witnessed aspiration in stable community-dwelling patient.",
        whyPick: [
          "**Modern data** — aspiration pneumonia is largely upper-airway strep, not anaerobic",
          "Ceftriaxone alone usually sufficient — anaerobes overcalled historically",
          "Add metronidazole only if **abscess, empyema, putrid sputum, poor dentition**",
        ],
        watchOut: [
          { sev: "warn", text: "**Aspiration pneumonitis ≠ pneumonia** — chemical injury, NO antibiotics needed 48 h" },
          { sev: "note", text: "Reserve broad anaerobic cover for true cavitary / abscess findings" },
        ],
      },
      {
        rx: /ampicillin-?sulbactam/i,
        pickIf: "Anaerobic risk high (periodontal disease, alcoholic, vomiting witnessed).",
        whyPick: [
          "**Built-in anaerobic** + streptococcal cover — single agent",
          "Covers oral flora better than ceftriaxone in true aspiration",
          "**3 g IV q6h** — extended infusion if critically ill",
        ],
        watchOut: [
          { sev: "warn", text: "**Penicillin allergy** — clindamycin alternative (but C. diff risk)" },
          { sev: "note", text: "Cost-equivalent to ceftriaxone — pick by anaerobic risk profile" },
        ],
      },
    ],
    "Abscess / empyema / necrotizing": [
      {
        rx: /ampicillin-?sulbactam|piperacillin/i,
        pickIf: "Lung abscess, empyema, or necrotizing pneumonia (cavitary).",
        whyPick: [
          "**True anaerobic coverage** required — abscess flora",
          "Pip-tazo if Pseudomonas risk; ampicillin-sulbactam otherwise",
          "**Source control** — image-guided drainage if > 4 cm or no improvement at 7 d",
          "Long course: **3–6 weeks** with PO step-down (amox-clav)",
        ],
        watchOut: [
          { sev: "warn", text: "Penicillin allergy → clindamycin + ceftriaxone (C. diff risk)" },
          { sev: "warn", text: "Suspect **TB / fungal / lung cancer** if cavitary in atypical host" },
          { sev: "note", text: "Treat until **radiographic resolution** of cavity, not just fever resolution" },
        ],
      },
    ],
  },

  /* ===========================================================
     EMPYEMA. Source control = chest tube; antibiotics adjunctive. =  */
  empyema: {
    "Community empyema": [
      {
        rx: /ceftriaxone.*metronidazole|ampicillin-?sulbactam/i,
        pickIf: "Community-acquired empyema — pneumococcus + oral anaerobes.",
        whyPick: [
          "**Ceftriaxone + metronidazole** OR **ampicillin-sulbactam** — equivalent",
          "**Chest tube + fibrinolytics** (tPA + DNase, MIST-2) is the actual treatment",
          "Long course: **2–4 weeks IV** then oral, until radiographic resolution",
        ],
        watchOut: [
          { sev: "stop", text: "**Loculated effusion without drainage → treatment failure** — VATS early" },
          { sev: "warn", text: "Streptococcus anginosus group → especially destructive; long courses" },
          { sev: "note", text: "Don't underdose — penetration into pus is poor; bactericidal levels needed" },
        ],
      },
    ],
    "Hospital / post-procedural": [
      {
        rx: /vancomycin.*piperacillin|piperacillin.*vancomycin/i,
        pickIf: "Post-thoracic surgery / instrumentation; broaden for hospital flora + MRSA.",
        whyPick: [
          "**MRSA + Pseudomonas** coverage essential post-op",
          "Source control (drainage / VATS) drives outcomes",
          "Switch to oral when stable + tubes out + cultures targeted",
        ],
        watchOut: [
          { sev: "warn", text: "**Pip-tazo + vanco AKI** — monitor renal closely" },
          { sev: "note", text: "Get OR thoracic involvement early — antibiotics alone often fail" },
        ],
      },
    ],
  },

  /* ===========================================================
     COPD exacerbation. GOLD 2024 — antibiotics for purulence
     + ≥ 2 cardinal symptoms or ventilatory failure. =============== */
  copd: {
    "Standard": [
      {
        rx: /aminopenicillin|amox/i,
        pickIf: "Outpatient COPD exacerbation, no Pseudomonas risk, no recent abx.",
        whyPick: [
          "**Amox-clavulanate** — covers H. influenzae, Moraxella, S. pneumoniae",
          "**5 days oral** — REDUCE trial showed equivalence to longer courses",
          "Cheap, well-tolerated, oral",
        ],
        watchOut: [
          { sev: "warn", text: "**GI side effects** common; counsel before discharge" },
          { sev: "warn", text: "Cholestatic hepatitis — rare but classic" },
          { sev: "note", text: "Doxycycline / macrolide acceptable alternatives" },
        ],
      },
      {
        rx: /doxycycline/i,
        pickIf: "Penicillin allergy; outpatient setting; no Pseudomonas risk.",
        whyPick: [
          "**Atypical + typical** coverage in one agent",
          "Cheap, oral, well-tolerated",
          "**Anti-inflammatory** properties (sub-MIC) — debated benefit in COPD",
        ],
        watchOut: [
          { sev: "warn", text: "**Photosensitivity** — counsel sun avoidance" },
          { sev: "warn", text: "**Pill esophagitis** — take with full glass of water, upright × 30 min" },
          { sev: "stop", text: "Pregnancy / children < 8 y — tooth staining + bone effects" },
        ],
      },
      {
        rx: /macrolide|azithromycin|clarithromycin/i,
        pickIf: "Penicillin allergy alternative; atypical coverage desired.",
        whyPick: [
          "**Anti-inflammatory** properties — chronic azithro reduces exacerbations (controversial)",
          "Atypical + typical respiratory pathogen cover",
          "Single daily dose — adherence advantage",
        ],
        watchOut: [
          { sev: "warn", text: "**QT prolongation** — check meds list" },
          { sev: "warn", text: "Macrolide resistance in pneumococcus rising regionally" },
          { sev: "note", text: "Long-term azithro for prevention raises NTM + cardiovascular risk" },
        ],
      },
    ],
    "Pseudomonas risk": [
      {
        rx: /levofloxacin|antipseudomonal/i,
        pickIf: "Prior Pseudomonas isolate, FEV1 < 30%, bronchiectasis, recent broad abx.",
        whyPick: [
          "**Levofloxacin 750 mg PO daily** — oral antipseudomonal option",
          "**Ciprofloxacin** alternative — better Pseudomonas, less pneumococcal",
          "IV antipseudomonal β-lactam if hospitalized + severe",
        ],
        watchOut: [
          { sev: "warn", text: "**Tendinopathy, QT, dysglycemia** — black-box risks" },
          { sev: "warn", text: "**Pseudomonas resistance** to FQ rising — culture-direct when possible" },
          { sev: "note", text: "Avoid FQ if recent FQ exposure within 90 d" },
        ],
      },
    ],
  },

  /* ===========================================================
     BRONCHIECTASIS exacerbation. Culture-direct when possible. =  */
  bronchiectasis: {
    "No Pseudomonas history": [
      {
        rx: /amoxicillin-?clavulanate|respiratory.*fluoroquinolone/i,
        pickIf: "Acute exacerbation, no prior Pseudomonas in sputum.",
        whyPick: [
          "**Amox-clav** first-line — covers H. flu, S. pneumoniae, M. cat",
          "**Levofloxacin** if PCN allergy or atypical concern",
          "**14-day course** for bronchiectasis exacerbations (longer than CAP)",
          "Send sputum **before** starting — guide step-down",
        ],
        watchOut: [
          { sev: "warn", text: "**Underdose risk** — bronchiectasis has poor penetration" },
          { sev: "note", text: "Many require chronic suppression — coordinate with pulmonologist" },
        ],
      },
    ],
    "Pseudomonas colonized": [
      {
        rx: /ciprofloxacin|antipseudomonal/i,
        pickIf: "Documented Pseudomonas in sputum; outpatient or stable.",
        whyPick: [
          "**Cipro 750 mg PO BID × 14 d** — oral antipseudomonal option",
          "**IV β-lactam** if severely ill or oral fails — pip-tazo, cefepime, meropenem",
          "Always **culture-direct** — resistance patterns vary widely",
        ],
        watchOut: [
          { sev: "warn", text: "**FQ resistance** in chronic Pseudomonas — rotation strategies common" },
          { sev: "warn", text: "**Tendinopathy / QT / dysglycemia** — black-box risks" },
          { sev: "note", text: "Inhaled tobramycin / aztreonam for chronic suppression (separate decision)" },
        ],
      },
    ],
  },

  /* ===========================================================
     VAT, postobstructive, tracheobronchitis, zoonotic pneumonia
     — narrower clinical scope; targeted entries. =================== */
  vat: {
    "Targeted (if treated)": [
      {
        rx: /organism-?directed|antipseudomonal/i,
        pickIf: "Persistent purulent sputum + tracheal cultures positive WITHOUT pneumonia.",
        whyPick: [
          "**Organism-directed** therapy — don't broadly empiricize",
          "Adds antipseudomonal cover ONLY if prior colonization",
          "**Most VAT does not benefit** from antibiotics — recolonization is rapid",
          "Treat only if **symptomatic + culture-positive + no pneumonia on imaging**",
        ],
        watchOut: [
          { sev: "warn", text: "**Overtreatment** breeds resistance; high false-positive ETA cultures" },
          { sev: "note", text: "Consider VAP if any infiltrate appears — escalate workup" },
        ],
      },
    ],
  },

  postobstructive: {
    "Empiric": [
      {
        rx: /β-?lactam|ampicillin-?sulbactam|piperacillin/i,
        pickIf: "Pneumonia distal to obstructing lesion (tumor, foreign body).",
        whyPick: [
          "**Anaerobic coverage** essential — stagnant secretions = polymicrobial",
          "Pip-tazo or ampicillin-sulbactam — single-agent broad cover",
          "**Relieve the obstruction** — bronch, stent, surgery — antibiotics alone fail",
          "Long course: **2–4 weeks** typical",
        ],
        watchOut: [
          { sev: "stop", text: "**Workup the obstruction** — postobstructive PNA in adult = tumor until proven otherwise" },
          { sev: "note", text: "Aspirated foreign body in kids — different workup" },
        ],
      },
    ],
  },

  tracheobronchitis: {
    "Selective therapy": [
      {
        rx: /macrolide|pertussis|viral/i,
        pickIf: "Most acute bronchitis is viral — antibiotics for documented pertussis only.",
        whyPick: [
          "**Acute bronchitis is viral in >90%** — no antibiotics indicated",
          "Treat **documented pertussis** with macrolide × 5 d (azithro) or 7 d (clarithro)",
          "Treatment for pertussis is for **transmission**, not symptom relief (already in cough phase)",
        ],
        watchOut: [
          { sev: "warn", text: "**No antibiotics** for purulent sputum alone — color doesn't equal bacteria" },
          { sev: "note", text: "Pertussis: notify public health; prophylax close contacts" },
        ],
      },
    ],
  },

  "zoonotic-pna": {
    "Empiric by exposure": [
      {
        rx: /doxycycline/i,
        pickIf: "Atypical pneumonia + zoonotic exposure (birds, livestock, ticks, raw milk).",
        whyPick: [
          "**Doxycycline 100 mg BID** covers Coxiella, C. psittaci, tularemia, Anaplasma",
          "Long-course (14–21 d) for Q fever; longer for chronic Q fever (months)",
          "Add **FQ or aminoglycoside** for severe tularemia",
          "Take exposure history seriously — pneumonia + bird exposure = psittacosis",
        ],
        watchOut: [
          { sev: "stop", text: "**Pregnancy + children** — choose alternative (macrolide for psittacosis)" },
          { sev: "warn", text: "Photosensitivity, pill esophagitis" },
          { sev: "note", text: "Notify ID and public health for confirmed zoonosis" },
        ],
      },
      {
        rx: /fluoroquinolone|aminoglycoside|tularemia/i,
        pickIf: "Severe tularemia (pulmonary or typhoidal) — add aminoglycoside or FQ.",
        whyPick: [
          "**Streptomycin or gentamicin** historically first-line for severe tularemia",
          "**Ciprofloxacin** acceptable alternative — oral bioavailability advantage",
          "Combine with doxycycline for severe disease",
          "Notify state health department — tularemia is reportable + bioterror agent",
        ],
        watchOut: [
          { sev: "warn", text: "Aminoglycoside nephro/ototoxicity — monitor trough" },
          { sev: "warn", text: "FQ resistance reported — confirm susceptibility" },
        ],
      },
    ],
  },

  /* ===========================================================
     GNR BACTEREMIA — empiric and directed. ========================= */
  gnbact: {
    "Empiric": [
      {
        rx: /cefepime|piperacillin|antipseudomonal/i,
        pickIf: "GNR bacteremia, source unclear or culture pending.",
        whyPick: [
          "**Antipseudomonal β-lactam** until species + susceptibilities back",
          "Cefepime or pip-tazo; meropenem if ESBL risk",
          "Source control determines duration — line, abscess, urinary",
        ],
        watchOut: [
          { sev: "warn", text: "Don't ride empiric broad after 48–72 h — narrow on cultures" },
          { sev: "note", text: "**Short-course GNR bacteremia** — 7 d sufficient for uncomplicated (Yahav 2019)" },
        ],
      },
    ],
    "Directed": [
      {
        rx: /ceftriaxone|narrowest/i,
        pickIf: "Identified organism + susceptibilities — narrow.",
        whyPick: [
          "**Ceftriaxone** for susceptible E. coli / Klebsiella / Proteus",
          "**Cefepime** if AmpC-producing (Enterobacter, Serratia, Citrobacter)",
          "**Carbapenem** for ESBL; novel β-lactams for CRE",
          "Oral step-down (FQ, TMP-SMX, β-lactam) per susceptibilities and source",
        ],
        watchOut: [
          { sev: "warn", text: "**AmpC induction** with ceftriaxone in ESCAPPM organisms — use cefepime" },
          { sev: "note", text: "Repeat cultures at 48 h if persistent fever to rule out endovascular" },
        ],
      },
    ],
  },

  /* ===========================================================
     S. AUREUS BACTEREMIA — IDSA 2011 + 2024 SAB guidance.
     Cefazolin > nafcillin debate is settled in MSSA (lower
     toxicity, BID). MRSA = vanco vs dapto with niche-specific
     wins. =========================================================== */
  sab: {
    "MSSA": [
      {
        rx: /cefazolin/i,
        pickIf: "MSSA bacteremia in any non-CNS source — most modern preferred.",
        whyPick: [
          "**Equivalent efficacy** to nafcillin; lower toxicity",
          "**BID dosing** (q8h) vs nafcillin q4h — easier OPAT",
          "Lower rates of **AIN, neutropenia, hepatitis** vs nafcillin",
          "**Inoculum effect** clinically irrelevant outside high-burden endocarditis",
          "First-line for MSSA UTI / SSTI / bacteremia source",
        ],
        watchOut: [
          { sev: "warn", text: "**CNS infections** — nafcillin/oxacillin preferred for meningitis (BBB penetration)" },
          { sev: "note", text: "Cross-reactivity with severe penicillin allergy ~1%",
            matchCtx: { blAllergy: "severe" } },
          { sev: "warn", text: "**Dose-reduce in CrCl < 50** — 1 g q8h or 2 g q12h",
            matchCtx: { crcl: { lt: 50 } } },
        ],
      },
      {
        rx: /nafcillin|oxacillin/i,
        pickIf: "MSSA CNS disease, or cefazolin allergy/intolerance.",
        whyPick: [
          "**Better BBB penetration** — preferred for meningitis / brain abscess",
          "No inoculum effect — preferred in **endocarditis with large vegetations** (debated)",
          "Standard of care for decades, well-studied",
        ],
        watchOut: [
          { sev: "warn", text: "**Acute interstitial nephritis** — eosinophiluria, hold the drug" },
          { sev: "warn", text: "**Neutropenia** with > 14 d courses — check CBC weekly" },
          { sev: "warn", text: "**Hepatitis** — check LFTs at baseline and weekly" },
          { sev: "warn", text: "**Hypokalemia** — high Na load" },
          { sev: "warn", text: "**Q4h dosing** — adherence burden, OPAT difficulty" },
          { sev: "stop", text: "**Drug interactions** — ↓ warfarin, ↓ CCBs (CYP induction)" },
        ],
      },
    ],
    "MRSA": [
      {
        rx: /vancomycin/i,
        pickIf: "First-line MRSA bacteremia; bedside-deliverable, AUC-monitored.",
        whyPick: [
          "**IDSA-preferred** first-line for MRSA bacteremia",
          "**AUC/MIC 400–600** target (Bayesian preferred)",
          "Cheap, bactericidal, broadly available",
          "Load **25–30 mg/kg ABW** in septic shock — first-dose impact matters",
        ],
        watchOut: [
          { sev: "warn", text: "**AUC > 600** — nephrotoxicity climbs sharply; trough alone underdoses" },
          { sev: "warn", text: "**MIC > 1.5** by E-test → consider daptomycin (slower kill, worse outcomes)" },
          { sev: "warn", text: "**+ pip-tazo AKI signal** — consider cefepime backbone if combo therapy" },
          { sev: "warn", text: "**Red-man syndrome** — infuse over ≥ 60 min; antihistamine pre-treat" },
          { sev: "warn", text: "**Renal-fragile (CrCl < 60 or AKI)** — AUC ceiling 600 critical; consider linezolid step-down",
            matchCtx: { crcl: { lt: 60 } } },
          { sev: "note", text: "Repeat blood cultures q48h until clearance" },
        ],
      },
      {
        rx: /daptomycin/i,
        pickIf: "Vanco failure (MIC > 1.5, persistent bacteremia at 7 d, or AKI on vanco).",
        whyPick: [
          "**Rapidly bactericidal** — concentration-dependent killing",
          "**8–10 mg/kg** for bacteremia; higher (10–12) for endocarditis or VRE",
          "**No renal dose adjustment needed** in non-HD (dose by ABW)",
          "**Once-daily** dosing — OPAT-friendly",
        ],
        watchOut: [
          { sev: "stop", text: "**Inactivated by pulmonary surfactant** — NEVER use for pneumonia" },
          { sev: "warn", text: "**CK elevation / rhabdomyolysis** — check CK weekly; hold statin if possible" },
          { sev: "warn", text: "**Eosinophilic pneumonia** — rare but classic; new infiltrate + dyspnea → stop" },
          { sev: "note", text: "Combine with ceftaroline for **persistent MRSA bacteremia** salvage" },
        ],
      },
    ],
  },

  /* ===========================================================
     CONS bacteremia — distinguish contaminant from infection. =  */
  cons: {
    "True infection": [
      {
        rx: /vancomycin/i,
        pickIf: "Multiple positive cultures + line/prosthetic device + symptoms.",
        whyPick: [
          "**Most CoNS are methicillin-resistant** (mecA+)",
          "Vancomycin first-line until oxacillin sensitivity confirmed",
          "**Remove the device** if possible — biofilm renders antibiotics ineffective",
        ],
        watchOut: [
          { sev: "warn", text: "**One positive culture** = likely contaminant — don't treat reflexively" },
          { sev: "note", text: "S. lugdunensis is the exception — treat like S. aureus (highly virulent)" },
        ],
      },
    ],
    "Oxacillin-susceptible": [
      {
        rx: /cefazolin|nafcillin/i,
        pickIf: "Confirmed oxacillin-susceptible CoNS — narrow off vancomycin.",
        whyPick: [
          "**Cefazolin** when susceptible — narrower, less toxic than vanco",
          "Same MSSA principles apply — **cefazolin > nafcillin** for non-CNS",
          "**~25–30% of CoNS** are oxacillin-S — narrowing rate is meaningful for stewardship",
        ],
        watchOut: [
          { sev: "warn", text: "**Verify susceptibility on multiple isolates** before narrowing — heterogeneous resistance possible" },
          { sev: "note", text: "If S. lugdunensis confirmed, treat as S. aureus — TEE + ID consult regardless of phenotype" },
        ],
      },
    ],
  },

  /* ===========================================================
     ENTEROCOCCAL bacteremia. Ampicillin for amp-S; dapto-HD or
     linezolid for VRE. Linezolid is bacteriostatic — caution in
     endovascular. ================================================== */
  entbact: {
    "E. faecalis (amp-S)": [
      {
        rx: /ampicillin|penicillin/i,
        pickIf: "E. faecalis bacteremia, ampicillin susceptible.",
        whyPick: [
          "**Ampicillin first-line** — bactericidal, cheap",
          "**2 g IV q4h** for endovascular / endocarditis sources",
          "Add **ceftriaxone** (synergy) for endocarditis — replaces gentamicin",
        ],
        watchOut: [
          { sev: "warn", text: "**Rule out endocarditis** — TEE if persistent bacteremia, valve disease, or community-acquired" },
          { sev: "note", text: "Ampicillin + ceftriaxone equally effective as amp + gent for IE — far less nephrotoxic" },
        ],
      },
    ],
    "E. faecium / VRE": [
      {
        rx: /daptomycin/i,
        pickIf: "VRE bacteremia (E. faecium typically); first-line in most centers.",
        whyPick: [
          "**High-dose dapto (10–12 mg/kg)** — VRE requires the higher dose band",
          "Rapidly bactericidal — preferred in endovascular sources",
          "Once-daily, OPAT-friendly",
        ],
        watchOut: [
          { sev: "warn", text: "**Dapto MIC creep** in VRE — use highest band; check CK weekly" },
          { sev: "warn", text: "**Rhabdomyolysis** — hold statin if possible" },
          { sev: "stop", text: "**Never for pneumonia** — surfactant inactivation" },
          { sev: "note", text: "Combine with β-lactam for synergy in refractory cases" },
        ],
      },
      {
        rx: /linezolid/i,
        pickIf: "Dapto contraindicated (CK elevation), or VRE pneumonia.",
        whyPick: [
          "**Bacteriostatic but effective** in non-endovascular VRE",
          "**Oral 100% bioavailable** — OPAT advantage",
          "No renal dose adjustment",
        ],
        watchOut: [
          { sev: "warn", text: "**Bacteriostatic** — inferior in endovascular sources (endocarditis)" },
          { sev: "stop", text: "**+ SSRI/MAOI** = serotonin syndrome" },
          { sev: "warn", text: "**Cytopenias, neuropathy** with > 14 d courses" },
          { sev: "warn", text: "**Lactic acidosis** — check serially in long courses" },
        ],
      },
    ],
  },

  /* ===========================================================
     IE — native and prosthetic valve, empiric and pathogen-
     directed. AHA 2015 / ESC 2023. ================================ */
  ie: {
    "Native valve, empiric (acute)": [
      {
        rx: /vancomycin.*ceftriaxone|ceftriaxone.*vancomycin/i,
        pickIf: "Suspected acute native-valve IE before cultures result.",
        whyPick: [
          "**Vancomycin + ceftriaxone** — covers MRSA + most streptococci + HACEK",
          "Vancomycin: AUC 400–600 (load 25–30 mg/kg)",
          "**Get 3 sets of blood cultures** spaced ≥ 1 h apart BEFORE first dose if stable",
          "**TEE** within 24 h — sensitivity for vegetations > TTE",
        ],
        watchOut: [
          { sev: "warn", text: "Empiric broad therapy beyond 5–7 d → narrow on culture data" },
          { sev: "note", text: "Surgery consult early for large veg, abscess, heart failure, persistent bacteremia" },
        ],
      },
    ],
    "Prosthetic valve, empiric": [
      {
        rx: /vancomycin.*gentamicin.*cefepime/i,
        pickIf: "Suspected PVE — fever + prosthetic valve, any timeframe.",
        whyPick: [
          "**Triple coverage** — CoNS (vanco) + Pseudomonas (cefepime) + synergy (gent)",
          "**Add rifampin** once staph confirmed — biofilm penetration",
          "Surgery consult immediate — early-PVE = often needs replacement",
        ],
        watchOut: [
          { sev: "warn", text: "**Gentamicin** trough monitoring — limit to 2 weeks max" },
          { sev: "warn", text: "**Rifampin** — many interactions; never use until staph confirmed" },
          { sev: "warn", text: "Cefepime in CrCl < 60 — dose-reduce, watch neurotoxicity" },
        ],
      },
    ],
    "Viridans / S. gallolyticus (PCN-S)": [
      {
        rx: /penicillin|ceftriaxone/i,
        pickIf: "Viridans strep or S. gallolyticus bacteremia + IE, PCN-susceptible.",
        whyPick: [
          "**Penicillin G or ceftriaxone × 4 weeks** — IDSA standard",
          "**2-week regimen** with gentamicin for uncomplicated native-valve, low-risk patients",
          "**S. gallolyticus → colonoscopy** — 25–80% associated with colon cancer",
        ],
        watchOut: [
          { sev: "warn", text: "**Gentamicin synergy only** — 3 mg/kg/day once daily; limit 2 weeks" },
          { sev: "note", text: "Outpatient OPAT with ceftriaxone once stable" },
        ],
      },
    ],
    "Enterococcal": [
      {
        rx: /ampicillin.*ceftriaxone|ampicillin.*gentamicin/i,
        pickIf: "Enterococcal IE (E. faecalis amp-S preferred regimen).",
        whyPick: [
          "**Ampicillin + ceftriaxone** — preferred over amp+gent (Fernández-Hidalgo 2013)",
          "**Equivalent cure, far less nephrotoxicity** than amp+gent",
          "Treat **6 weeks** — endocarditis duration",
          "Use **amp+gent** if HLAR-negative AND ceftriaxone allergy",
        ],
        watchOut: [
          { sev: "stop", text: "**HLAR enterococcus** (high-level aminoglycoside resistance) → use amp+ceftriaxone, NOT amp+gent" },
          { sev: "warn", text: "**Gent nephro/oto** — avoid amp+gent if alternatives exist" },
        ],
      },
    ],
  },

  /* ===========================================================
     IE — Native and prosthetic, organism-directed. ================= */
  "ie-native": {
    "MSSA": [
      {
        rx: /cefazolin|nafcillin|oxacillin/i,
        pickIf: "MSSA native-valve IE — 6-week course.",
        whyPick: [
          "**Cefazolin** preferred — equivalent efficacy, BID, lower toxicity than nafcillin",
          "**6 weeks IV** — non-negotiable for IE",
          "**No gentamicin** — adds toxicity without outcome benefit",
        ],
        watchOut: [
          { sev: "warn", text: "Nafcillin: AIN, neutropenia, hepatitis with long courses" },
          { sev: "note", text: "Surgery for: HF, abscess, persistent bacteremia, large veg, embolic events" },
        ],
      },
    ],
    "MRSA": [
      {
        rx: /vancomycin|daptomycin/i,
        pickIf: "MRSA native-valve IE — 6-week course.",
        whyPick: [
          "**Vancomycin or daptomycin** — equivalent efficacy in trials",
          "**Daptomycin 8–10 mg/kg** for IE — concentration-dependent killing",
          "Switch to dapto if vanco fails or MIC > 1.5",
          "Surgery indications same as MSSA — don't delay",
        ],
        watchOut: [
          { sev: "warn", text: "**Persistent MRSA bacteremia at 7 d** → salvage with dapto + ceftaroline" },
          { sev: "warn", text: "Dapto: CK weekly, never for pneumonia, eosinophilic PNA" },
        ],
      },
    ],
    "Enterococcal": [
      {
        rx: /ampicillin.*ceftriaxone/i,
        pickIf: "Enterococcal IE (E. faecalis) — preferred amp + ceftriaxone × 6 weeks.",
        whyPick: [
          "**Amp + ceftriaxone × 6 weeks** — preferred over amp + gentamicin (Fernández-Hidalgo 2013)",
          "**Equivalent cure** to amp + gent with **far less nephrotoxicity** — no AG monitoring burden",
          "Workup **HLAR status** at species ID — drives downstream regimen choice",
        ],
        watchOut: [
          { sev: "stop", text: "**HLAR isolates** — amp + ceftriaxone is REQUIRED (amp + gent ineffective)" },
          { sev: "warn", text: "**Amp + gent only** if HLAR-negative AND ceftriaxone allergy — limit gent to 4–6 weeks, monitor trough" },
        ],
      },
    ],
    "Viridans strep": [
      {
        rx: /penicillin|ceftriaxone/i,
        pickIf: "Viridans strep IE — PCN-susceptible.",
        whyPick: [
          "**Penicillin G or ceftriaxone × 4 weeks** for native valve",
          "**2-week regimen with gentamicin** for selected uncomplicated cases (low-risk patient, no embolic events)",
          "**Search for colonic source** if S. gallolyticus — colonoscopy mandatory (25–80% associated with colon cancer)",
        ],
        watchOut: [
          { sev: "warn", text: "**Tolerance / relative-resistance** (MIC 0.12–0.5) — extend regimen and re-test MIC; treat as Streptococcus with reduced PCN susceptibility" },
          { sev: "note", text: "Repeat blood cultures at 48 h — sterilization should be brisk; persistent BCx → escalate workup" },
        ],
      },
    ],
  },

  "ie-pve": {
    "Staphylococcal PVE": [
      {
        rx: /vancomycin.*rifampin|rifampin/i,
        pickIf: "Staphylococcal PVE — rifampin for biofilm + gent for synergy.",
        whyPick: [
          "**Vancomycin/β-lactam + rifampin + gentamicin × ≥6 weeks**",
          "**Rifampin** essential — penetrates biofilm on prosthetic material",
          "**Gentamicin × 2 weeks only** — first 2 weeks for synergy",
          "**Surgical replacement** often needed — early-PVE almost always",
        ],
        watchOut: [
          { sev: "warn", text: "**Rifampin interactions** — many drugs (warfarin, OCPs, antiretrovirals)" },
          { sev: "warn", text: "**Never start rifampin until cultures positive** — induces resistance fast" },
          { sev: "warn", text: "Gent: limit to 2 weeks; check trough" },
        ],
      },
    ],
    "Enterococcal / streptococcal PVE": [
      {
        rx: /native|6\s*weeks/i,
        pickIf: "Enterococcal or streptococcal PVE — same agents, longer duration.",
        whyPick: [
          "**Same regimens as native valve, but ≥ 6 weeks**",
          "**Surgery threshold lower** in PVE — early valve replacement frequent (failure of medical therapy → worse outcomes)",
          "Repeat blood cultures q48h until clearance; persistent BCx > 5 d → emergent surgery candidate",
        ],
        watchOut: [
          { sev: "warn", text: "**Persistent bacteremia > 5 d** on appropriate therapy → emergent surgery + workup new embolic foci" },
          { sev: "note", text: "**Multidisciplinary IE team** — surgery + ID + cardiology drives outcomes; involve all three by day 1" },
        ],
      },
    ],
  },

  /* ===========================================================
     CRBSI — line management is the actual treatment. ============== */
  crbsi: {
    "Empiric": [
      {
        rx: /vancomycin/i,
        pickIf: "Suspected line infection — fever + line, no other source.",
        whyPick: [
          "**Vancomycin** covers MRSA + CoNS (most common organisms)",
          "Add antipseudomonal β-lactam if **neutropenic, ICU, or HD line**",
          "**Pull the line** for S. aureus, Pseudomonas, Candida, or persistent bacteremia",
        ],
        watchOut: [
          { sev: "stop", text: "**S. aureus / Pseudomonas / Candida** — line MUST come out, no salvage" },
          { sev: "warn", text: "Differential time-to-positivity > 2 h between line and peripheral cultures = line source" },
          { sev: "note", text: "Catheter-tip culture only useful with concurrent peripheral culture" },
        ],
      },
    ],
    "Directed": [
      {
        rx: /tailor|directed|organism/i,
        pickIf: "Organism identified — narrow + decide on line.",
        whyPick: [
          "**Narrow to organism** + susceptibilities",
          "**Salvage attempt** (lock therapy) only for CoNS / GNR with intact line + no shock",
          "S. aureus: 14 d minimum from first negative culture; longer if endocarditis ruled in",
        ],
        watchOut: [
          { sev: "warn", text: "Persistent bacteremia 72 h post-line removal → endovascular workup (TEE)" },
          { sev: "note", text: "Echo for S. aureus bacteremia is standard of care" },
        ],
      },
    ],
  },

  /* ===========================================================
     PYELONEPHRITIS — IDSA 2010. Ceftriaxone backbone; carbapenem
     if ESBL risk. FQs lost first-line status to resistance creep. = */
  pyelo: {
    "Empiric": [
      {
        rx: /ceftriaxone/i,
        pickIf: "Acute pyelonephritis, no ESBL risk, no prior carbapenem need.",
        whyPick: [
          "**IDSA-preferred** empiric — covers most community E. coli + Klebsiella + Proteus",
          "**Once-daily IV**, easy OPAT transition",
          "**Switch to oral** at 24–48 h once afebrile: cefpodoxime, cefdinir, or culture-directed",
          "**7-day course** sufficient for most uncomplicated (FQ → 5–7 d trials)",
        ],
        watchOut: [
          { sev: "warn", text: "**Local E. coli ESBL > 10%** in pyelo → consider ertapenem empirically" },
          { sev: "warn", text: "FQs no longer first-line — community E. coli FQ resistance often > 20–30%" },
          { sev: "note", text: "Gallbladder sludge with prolonged use (>2 weeks)" },
        ],
      },
    ],
    "ESBL risk / directed": [
      {
        rx: /carbapenem|ertapenem|meropenem/i,
        pickIf: "Prior ESBL isolate, recent broad β-lactam, or healthcare-associated pyelo.",
        whyPick: [
          "**Ertapenem 1 g IV q24h** — once-daily, OPAT-friendly, covers ESBL",
          "**Meropenem** if Pseudomonas risk (ertapenem misses Pseudo)",
          "**Step down to PO** based on susceptibilities — fosfomycin (lower-tract relapse), TMP-SMX, FQ",
        ],
        watchOut: [
          { sev: "stop", text: "**Ertapenem misses Pseudomonas + Acinetobacter + Enterococcus**" },
          { sev: "warn", text: "Meropenem ↓ valproate 60–90%" },
          { sev: "note", text: "**MERINO trial** — pip-tazo INFERIOR to meropenem for ESBL bacteremia" },
          { sev: "note", text: "**Carbapenem-sparing**: pip-tazo at MIC ≤ 16 in mild ESBL UTI is debated, not endorsed" },
        ],
      },
    ],
  },

  /* ===========================================================
     CAUTI — IDSA 2009. Remove or change catheter; treat ≥7 d. ===  */
  cauti: {
    "Empiric": [
      {
        rx: /ceftriaxone|antipseudomonal/i,
        pickIf: "Symptomatic catheter-associated UTI (fever + localizing or no other source).",
        whyPick: [
          "**Ceftriaxone** if no Pseudomonas risk; antipseudomonal β-lactam if recent hospitalization",
          "**Remove or change the catheter** — biofilm renders antibiotics partially ineffective",
          "**7-day course** if prompt response; **10–14 d** if delayed response",
          "Send urine culture **after catheter change**, not before — biofilm contamination",
        ],
        watchOut: [
          { sev: "stop", text: "**Don't treat asymptomatic bacteriuria** in catheterized patients (except pregnancy / pre-urologic surgery)" },
          { sev: "warn", text: "Pseudomonas common in long-term catheters — empirically cover if hospitalized > 1 wk" },
          { sev: "note", text: "Funguria in catheter usually colonization — remove catheter first, recheck" },
        ],
      },
    ],
  },

  /* ===========================================================
     PROSTATITIS. Long courses; tissue-penetrating drugs. ========== */
  prostatitis: {
    "Empiric": [
      {
        rx: /ceftriaxone|fluoroquinolone|TMP-?SMX/i,
        pickIf: "Acute bacterial prostatitis — IV → oral step-down with tissue-penetrating agent.",
        whyPick: [
          "**Ceftriaxone IV** initially for ill patients",
          "**Step down to FQ (cipro/levo) or TMP-SMX** — only oral classes that achieve prostatic concentrations",
          "**4-week course** for acute bacterial prostatitis",
          "**6 weeks** if chronic bacterial prostatitis (lower seminal vesicle penetration)",
        ],
        watchOut: [
          { sev: "warn", text: "β-lactams have **poor prostatic penetration** — oral step-down to FQ or TMP-SMX, not amox/cephalexin" },
          { sev: "stop", text: "**Massage / instrumentation** in acute prostatitis = bacteremia risk; defer" },
          { sev: "note", text: "Chronic prostatitis often non-infectious — pre/post-massage cultures to confirm" },
        ],
      },
    ],
  },

  /* ===========================================================
     EPIDIDYMO-orchitis — split by age + sexual practice. ========= */
  epididymo: {
    "Sexually active (<35 y or at risk)": [
      {
        rx: /ceftriaxone.*doxycycline/i,
        pickIf: "Sexually active, age < 35 or STI risk factors.",
        whyPick: [
          "**Ceftriaxone IM ×1 + doxycycline 10 d** — covers GC + chlamydia",
          "**Treat partner** — STI screening / treatment is essential",
          "Add **metronidazole** if insertive anal intercourse (enteric organisms possible)",
        ],
        watchOut: [
          { sev: "warn", text: "**Test for HIV + syphilis + GC/CT NAAT** at same visit" },
          { sev: "note", text: "Scrotal pain + age < 35 — always assume STI until proven otherwise" },
        ],
      },
    ],
    "Enteric organisms (older men, insertive anal intercourse, instrumentation)": [
      {
        rx: /fluoroquinolone|levofloxacin/i,
        pickIf: "Older man, anal intercourse, or recent instrumentation.",
        whyPick: [
          "**Levofloxacin 500 mg PO daily × 10–14 d** — covers enteric GNR + atypicals",
          "Tissue penetration into epididymis good",
          "**Workup BPH / urinary retention** if recurrent",
        ],
        watchOut: [
          { sev: "warn", text: "FQ tendinopathy / QT — counsel elderly" },
          { sev: "note", text: "Rule out testicular torsion in acute presentation — ultrasound" },
        ],
      },
    ],
  },

  /* ===========================================================
     RENAL ABSCESS — broad cover + drainage. ======================= */
  renalabscess: {
    "Empiric": [
      {
        rx: /antipseudomonal|vancomycin/i,
        pickIf: "Renal / perinephric abscess — radiologic diagnosis.",
        whyPick: [
          "**Antipseudomonal β-lactam ± vancomycin** if hematogenous S. aureus suspected",
          "**Image-guided drainage** for collections > 5 cm or not improving at 48–72 h",
          "Long course: **4–6 weeks** total; transition to PO when oriented to organism",
        ],
        watchOut: [
          { sev: "warn", text: "**Look for urolithiasis** — often a struvite or obstructed system" },
          { sev: "note", text: "Diabetics: emphysematous pyelonephritis is a distinct emergency — needs urgent decompression" },
        ],
      },
    ],
  },

  /* ===========================================================
     UROSEPSIS, asymptomatic bacteriuria, special UTI categories. = */
  urosepsis: {
    "Empiric": [
      {
        rx: /ceftriaxone|antipseudomonal/i,
        pickIf: "Sepsis + UTI source — start broadly, narrow on cultures.",
        whyPick: [
          "**Ceftriaxone** for community urosepsis; antipseudomonal β-lactam if HCAI",
          "Add **vancomycin** if instrumented or septic shock",
          "**Source control** — relieve obstruction (stent, nephrostomy) if hydronephrosis",
          "Switch to **culture-directed** within 48 h",
        ],
        watchOut: [
          { sev: "stop", text: "**Obstruction + sepsis** = urologic emergency; antibiotics fail without decompression" },
          { sev: "warn", text: "Prior ESBL → use carbapenem empirically" },
          { sev: "note", text: "7-day course standard for uncomplicated bacteremic UTI" },
        ],
      },
    ],
  },

  "asymp-bact": {
    "Treat only when indicated": [
      {
        rx: /pregnancy|urologic|do not/i,
        pickIf: "Pregnancy or pre-invasive urologic procedure ONLY.",
        whyPick: [
          "**Treat in pregnancy** — reduces pyelonephritis and preterm birth",
          "**Treat before urologic procedure** with mucosal trauma (TURP, stone surgery)",
          "**Don't treat** in any other adult — including elderly with delirium",
        ],
        watchOut: [
          { sev: "stop", text: "**Delirium alone is NOT a UTI** in catheterized / elderly — don't treat reflexively" },
          { sev: "stop", text: "Cloudy/smelly urine alone — colonization, not infection" },
          { sev: "warn", text: "Treating ASB in non-indicated populations = drives resistance + C. diff without benefit" },
          { sev: "note", text: "IDSA 2019 strong recommendation against treatment outside the two indications" },
        ],
      },
    ],
  },

  "emphysematous-uti": {
    "Empiric": [
      {
        rx: /antipseudomonal|piperacillin|cefepime/i,
        pickIf: "Gas in renal parenchyma / collecting system — urologic emergency.",
        whyPick: [
          "**Antipseudomonal β-lactam** + urgent urologic intervention",
          "Predominantly diabetic patients; gas-producing E. coli or Klebsiella",
          "**Decompression / nephrostomy / nephrectomy** drives outcomes",
          "Mortality ~25% even with optimal management",
        ],
        watchOut: [
          { sev: "stop", text: "**Antibiotics alone fail** — urology now, not after antibiotics" },
          { sev: "warn", text: "DKA management concurrent — feeds the bacterial growth" },
        ],
      },
    ],
  },

  "transplant-uti": {
    "Empiric": [
      {
        rx: /antipseudomonal|carbapenem/i,
        pickIf: "Renal-transplant UTI — broaden for prior MDR, anticipate ESBL/CRE.",
        whyPick: [
          "**Pick by transplant patient's prior cultures** — they're colonized with resistant flora",
          "**Carbapenem** if ESBL history",
          "**Avoid FQ + immunosuppressants** — interactions (cyclosporine, tacrolimus levels)",
        ],
        watchOut: [
          { sev: "warn", text: "**Coordinate with transplant ID** — antibiotic choice affects graft" },
          { sev: "note", text: "BK virus reactivation in graft — check if culture-negative pyuria" },
        ],
      },
    ],
  },

  "scrotal-abscess": {
    "Empiric + drainage": [
      {
        rx: /antipseudomonal|drainage|orchiectomy/i,
        pickIf: "Scrotal abscess — drainage is the treatment.",
        whyPick: [
          "**Drainage first** — antibiotics are adjunctive",
          "Cover age-appropriate flora (enteric in older; STI in young)",
          "**Fournier's risk** if necrotic spread — emergency",
        ],
        watchOut: [
          { sev: "stop", text: "**Fournier's gangrene** if necrotic spread / crepitus / pain out of proportion — emergent OR + broad coverage + clindamycin" },
          { sev: "warn", text: "**Testicular preservation** drives extent of drainage — urology now, not later, if testicle viability is in question",
            matchCtx: { severe: true } },
          { sev: "note", text: "Diabetic and immunocompromised: lower threshold for broad coverage + early imaging (CT) to delineate extent" },
        ],
      },
    ],
  },

  /* ===========================================================
     PERITONITIS, SBP, intra-abdominal — anaerobic + GNR coverage. = */
  peritonitis: {
    "Community-acquired": [
      {
        rx: /ceftriaxone.*metronidazole|piperacillin|ertapenem/i,
        pickIf: "Community intra-abdominal infection, stable, no prior ESBL.",
        whyPick: [
          "**Ceftriaxone + metronidazole** OR **pip-tazo** OR **ertapenem** — equivalent",
          "**Source control** (drain, surgery) drives outcomes — antibiotics adjunctive",
          "**STOP-IT trial**: 4-day course after source control = 10 days",
          "Avoid empiric Enterococcus / Candida cover in community-acquired",
        ],
        watchOut: [
          { sev: "warn", text: "**Source control delayed** → mortality climbs by the hour" },
          { sev: "note", text: "Ertapenem misses Pseudomonas — community IAI rarely needs it" },
        ],
      },
    ],
    "Healthcare-associated / severe": [
      {
        rx: /piperacillin|meropenem/i,
        pickIf: "Hospital-acquired IAI or critically ill — broaden + cover MRSA.",
        whyPick: [
          "**Pip-tazo or meropenem** for healthcare-associated",
          "Add **vancomycin** for prior MRSA or shock",
          "Empirically cover **Candida** in upper-GI perf / postop / TPN-dependent",
        ],
        watchOut: [
          { sev: "warn", text: "Source control + de-escalation at 48–72 h" },
          { sev: "note", text: "Anti-Candida (echinocandin) if recurrent IAI or peritoneal Candida growth" },
        ],
      },
    ],
  },

  sbp: {
    "Empiric": [
      {
        rx: /ceftriaxone/i,
        pickIf: "Cirrhotic ascites + PMN ≥ 250 in ascitic fluid.",
        whyPick: [
          "**Ceftriaxone 2 g IV q24h** — first-line for community SBP",
          "**5-day course** sufficient (was 10 d, shortened)",
          "**Repeat paracentesis at 48 h** — > 25% PMN drop = response",
        ],
        watchOut: [
          { sev: "warn", text: "**Hospital-acquired SBP / prior antibiotic exposure** → broaden to pip-tazo or meropenem" },
          { sev: "note", text: "PMN < 250 + symptoms / fever → still treat as SBP variant (CNNA)" },
        ],
      },
    ],
    "Add albumin": [
      {
        rx: /albumin/i,
        pickIf: "Cr > 1, BUN > 30, or bilirubin > 4 — high-risk SBP for HRS.",
        whyPick: [
          "**Albumin 1.5 g/kg day 1, 1 g/kg day 3** — Sort 1999 NEJM",
          "**Reduces HRS** and mortality in high-risk SBP",
          "Use **25% albumin** (concentrated, low-volume) — avoids overload risk",
        ],
        watchOut: [
          { sev: "warn", text: "**Volume overload** — caution in cardiac dysfunction; monitor JVP / pulmonary status during infusion" },
          { sev: "warn", text: "**Hyponatremia** can worsen with rapid colloid shift — check electrolytes before + after each dose" },
          { sev: "note", text: "**No albumin benefit** in low-risk SBP (Cr ≤ 1, BUN ≤ 30, bilirubin ≤ 4) — stewardship-sensitive" },
        ],
      },
    ],
  },

  cholangitis: {
    "Empiric": [
      {
        rx: /ceftriaxone.*metronidazole|piperacillin/i,
        pickIf: "Acute ascending cholangitis — Charcot triad or Reynolds pentad.",
        whyPick: [
          "**Ceftriaxone + metronidazole** OR **pip-tazo** — covers gut flora",
          "**ERCP / drainage within 24–48 h** — antibiotics fail without decompression",
          "**4-day post-drainage course** sufficient if source controlled (Tokyo TG18)",
          "Add vancomycin if healthcare-associated or septic shock",
        ],
        watchOut: [
          { sev: "stop", text: "**Source control essential** — antibiotics alone don't drain pus" },
          { sev: "warn", text: "Enterococcus more common in healthcare-associated — pip-tazo covers it" },
          { sev: "note", text: "Repeat blood cultures 48 h post-drainage — clearance expected" },
        ],
      },
    ],
  },

  diverticulitis: {
    "Inpatient/complicated": [
      {
        rx: /ceftriaxone.*metronidazole|piperacillin|ertapenem/i,
        pickIf: "Complicated diverticulitis (abscess, perforation, sepsis) requiring admission.",
        whyPick: [
          "**Ceftriaxone + metronidazole** OR **pip-tazo** OR **ertapenem** — equivalent",
          "**Percutaneous drainage** for abscess > 4 cm",
          "**Surgery** for free perforation / non-improvement / recurrent disease",
          "Uncomplicated outpatient: amox-clav or cipro+metronidazole for 4–7 d (or even none — DIABOLO trial)",
        ],
        watchOut: [
          { sev: "warn", text: "**Free perforation** → emergent surgery, not antibiotics" },
          { sev: "note", text: "Colonoscopy 6 weeks after first episode (rule out cancer)" },
        ],
      },
    ],
  },

  pancreatic: {
    "Documented infection": [
      {
        rx: /carbapenem|meropenem|fluoroquinolone|metronidazole/i,
        pickIf: "Documented infected pancreatic necrosis (FNA-positive or gas on imaging).",
        whyPick: [
          "**Carbapenem (meropenem/imipenem)** — best pancreatic penetration",
          "Alternative: **metronidazole + cipro/levo** — both penetrate well",
          "**No prophylaxis** in sterile necrosis — increases resistant infections without benefit",
          "**Step-up drainage** (PCD → endoscopic/surgical) — open necrosectomy is last resort",
        ],
        watchOut: [
          { sev: "stop", text: "**No empiric antibiotics** for sterile necrosis — IAP/APA, ACG, AGA all agree" },
          { sev: "warn", text: "Fungal infections in long-course antibiotic use — common in necrosis" },
          { sev: "note", text: "Document infection (FNA / gas) before starting — confirms indication" },
        ],
      },
    ],
  },

  liverabscess: {
    "Empiric + drainage": [
      {
        rx: /ceftriaxone.*metronidazole|piperacillin/i,
        pickIf: "Pyogenic liver abscess on imaging.",
        whyPick: [
          "**Ceftriaxone + metronidazole** OR **pip-tazo** — covers enteric flora + anaerobes",
          "**Percutaneous drainage** for abscesses ≥ 3–5 cm",
          "Long course: **4–6 weeks** total (2 wk IV, 4 wk PO)",
          "Workup colonic source — colonoscopy if Streptococcus anginosus or hypervirulent K. pneumoniae",
        ],
        watchOut: [
          { sev: "warn", text: "**Amoebic liver abscess** mimics pyogenic — serology if travel/exposure" },
          { sev: "note", text: "Streptococcus anginosus / milleri group → look for colon cancer or perforation" },
        ],
      },
    ],
    "Hypervirulent Klebsiella": [
      {
        rx: /ceftriaxone|metastatic/i,
        pickIf: "K. pneumoniae liver abscess (often diabetic, Southeast Asian, K1/K2 serotypes).",
        whyPick: [
          "**Ceftriaxone** for susceptible isolates",
          "**Screen for metastatic spread** — endophthalmitis (mandatory ophthal eval), CNS, lung",
          "Long course (4–6 weeks); often requires drainage",
        ],
        watchOut: [
          { sev: "stop", text: "**Endophthalmitis screen mandatory** — vision-threatening if missed" },
          { sev: "warn", text: "Hypervirulent isolates seed brain, eye, lung — workup CNS + chest" },
        ],
      },
    ],
  },

  appendicitis: {
    "Empiric": [
      {
        rx: /ceftriaxone.*metronidazole|piperacillin|ertapenem/i,
        pickIf: "Acute appendicitis — adjunct to surgery, or sole therapy in selected.",
        whyPick: [
          "**Ceftriaxone + metronidazole** OR **pip-tazo** OR **ertapenem**",
          "**Single preop dose** sufficient if uncomplicated and removed promptly",
          "**4 days postop** for perforated (STOP-IT)",
          "Antibiotics-only management (CODA trial) — non-inferior in selected, but ~30% recurrence at 5 y",
        ],
        watchOut: [
          { sev: "warn", text: "**Perforation / abscess** → surgical or percutaneous source control before declaring failure" },
          { sev: "warn", text: "**Antibiotics-alone (CODA trial)** non-inferior at 90 d but ~30% recurrence at 5 y — counsel + plan follow-up",
            matchCtx: { severe: false } },
          { sev: "note", text: "Appendicolith on CT favors surgery — antibiotic-only fails more often" },
        ],
      },
    ],
  },

  "pd-peritonitis": {
    "Empiric (intraperitoneal)": [
      {
        rx: /intraperitoneal|vancomycin.*ceftazidime/i,
        pickIf: "PD patient with cloudy fluid + PMN > 100 in PD effluent.",
        whyPick: [
          "**Intraperitoneal vancomycin + ceftazidime** — ISPD 2022",
          "Add aminoglycoside (gentamicin IP) if cefepime/ceftaz unavailable",
          "**Continuous vs intermittent IP dosing** — both effective; intermittent simpler",
          "**Remove catheter** if not improving by day 5 or for fungal / refractory peritonitis",
        ],
        watchOut: [
          { sev: "warn", text: "**Fungal peritonitis** → remove catheter immediately + antifungal" },
          { sev: "note", text: "Send fluid for cell count, Gram stain, culture — 90% sensitive at higher volume" },
        ],
      },
    ],
  },

  "splenic-abscess": {
    "Empiric": [
      {
        rx: /piperacillin|ceftriaxone.*metronidazole|vancomycin/i,
        pickIf: "Splenic abscess on imaging — drainage + broad antibiotics.",
        whyPick: [
          "**Broad coverage** (pip-tazo or ceftriaxone+metronidazole)",
          "**Vancomycin** if endovascular source suspected (S. aureus seed)",
          "**Splenectomy or percutaneous drainage** — definitive",
          "Workup endocarditis — splenic abscess often septic emboli",
        ],
        watchOut: [
          { sev: "warn", text: "**Echo mandatory** — IE source common" },
          { sev: "note", text: "Post-splenectomy patient needs vaccination + counseling on OPSI" },
        ],
      },
    ],
  },

  "toxic-megacolon": {
    "Empiric": [
      {
        rx: /vancomycin.*metronidazole|fulminant/i,
        pickIf: "C. difficile fulminant with toxic megacolon or shock.",
        whyPick: [
          "**Oral/NG vancomycin 500 mg q6h + IV metronidazole 500 mg q8h**",
          "Add **rectal vancomycin** (500 mg in 100 mL NS as enema) if ileus",
          "**Surgery consult immediately** — subtotal colectomy if no response 24–48 h",
          "Add broad coverage if perforation suspected",
        ],
        watchOut: [
          { sev: "stop", text: "**Don't delay surgery** in toxic megacolon — mortality climbs hourly" },
          { sev: "warn", text: "Anti-diarrheal / opiate / anticholinergic — STOP all" },
        ],
      },
    ],
  },

  "mesenteric-isch": {
    "Empiric": [
      {
        rx: /piperacillin|carbapenem/i,
        pickIf: "Mesenteric ischemia with bowel infarction or transmural inflammation.",
        whyPick: [
          "**Pip-tazo or carbapenem** — gut flora coverage",
          "Add **vancomycin** if healthcare-associated",
          "**Revascularization / resection** drives outcomes — vascular surgery now",
        ],
        watchOut: [
          { sev: "stop", text: "**Time-sensitive** — antibiotics are adjunctive to revascularization" },
          { sev: "warn", text: "Lactic acidosis disproportionate to exam = bowel ischemia" },
        ],
      },
    ],
  },

  /* ===========================================================
     SSTI — IDSA 2014 (Stevens). Cellulitis vs purulent vs
     necrotizing — different bugs, different drugs. ================ */
  cellulitis: {
    "Standard": [
      {
        rx: /cefazolin|cephalexin/i,
        pickIf: "Non-purulent cellulitis — β-hemolytic strep is dominant.",
        whyPick: [
          "**Cefazolin / cephalexin** — covers β-hemolytic strep (the actual bug)",
          "**MRSA cover NOT needed** for non-purulent cellulitis (IDSA 2014)",
          "**5-day course** for mild/moderate; 7–10 d if slow response",
          "**Elevation + treating tinea pedis** prevents recurrence",
        ],
        watchOut: [
          { sev: "warn", text: "**Adding TMP-SMX/dox \"to cover MRSA\"** is overused — no benefit unless purulent or risk factors" },
          { sev: "warn", text: "**Worsening over first 48 h is expected** (immune response) — don't broaden if otherwise improving" },
          { sev: "note", text: "Stasis dermatitis + venous insufficiency mimic cellulitis — assess bilateral, fever, WBC" },
        ],
      },
    ],
    "Add MRSA": [
      {
        rx: /vancomycin|TMP-?SMX|doxycycline/i,
        pickIf: "Purulent component, IVDU, recent MRSA, no β-lactam response at 48–72 h.",
        whyPick: [
          "**Vancomycin** IV for hospitalized; **TMP-SMX or doxy** PO for outpatient",
          "**Don't drop the β-lactam** — strep often coexists",
          "Doxy and TMP-SMX both cover community MRSA well; doxy adds atypicals",
        ],
        watchOut: [
          { sev: "stop", text: "**TMP-SMX** — sulfa allergy, late pregnancy, hyperkalemia risk drugs" },
          { sev: "warn", text: "**Doxycycline** — pregnancy, children < 8 y" },
        ],
      },
    ],
  },

  purulent: {
    "Drainage": [
      {
        rx: /incision|drainage/i,
        pickIf: "Cutaneous abscess — drainage is the definitive treatment.",
        whyPick: [
          "**I&D alone** cures most simple abscesses < 5 cm with no cellulitis",
          "**Add antibiotics** (TMP-SMX or doxy) for: ≥ 5 cm, cellulitis surrounding, fever, immunosuppression, hands/face/genitals",
          "**7-day course** post-drainage for the above",
        ],
        watchOut: [
          { sev: "warn", text: "**Failure to fluctuate → don't drain prematurely** — empiric antibiotics + warm compress while organizing" },
          { sev: "note", text: "**Routine packing of small abscesses is unnecessary** — increases pain without benefit" },
          { sev: "note", text: "**Loop drainage** (versus traditional incision/packing) reduces follow-up burden and is equally effective for moderate abscesses" },
        ],
      },
    ],
    "Add MRSA coverage": [
      {
        rx: /TMP-?SMX|doxycycline|vancomycin/i,
        pickIf: "Abscess with cellulitis, large (>5 cm), systemic signs, or recurrent.",
        whyPick: [
          "**TMP-SMX or doxycycline** PO outpatient",
          "**Vancomycin** IV if hospitalized or severe",
          "Add **β-lactam (cephalexin)** if extensive cellulitis component — covers β-hemolytic strep co-infection",
        ],
        watchOut: [
          { sev: "warn", text: "**Recurrent abscesses** → decolonization protocol (mupirocin nares ×5 d + chlorhexidine baths ×5 d, repeat household members)" },
          { sev: "warn", text: "**TMP-SMX** — sulfa allergy, hyperkalemia risk on ACE-I/ARB, 3rd-trimester pregnancy",
            matchCtx: { any: [{ blAllergy: "severe" }] } },
          { sev: "note", text: "**Doxycycline** — photosensitivity, pill esophagitis; avoid in pregnancy / children < 8 y" },
        ],
      },
    ],
  },

  necfasc: {
    "Immediate": [
      {
        rx: /SURGICAL|vancomycin.*piperacillin|clindamycin/i,
        pickIf: "Necrotizing fasciitis suspected — SURGERY NOW + broad antibiotics + clindamycin.",
        whyPick: [
          "**Surgery is the treatment** — antibiotics adjunctive; debridement within HOURS",
          "**Vancomycin + pip-tazo + clindamycin** — broad bacterial + toxin suppression",
          "**Clindamycin** suppresses streptococcal exotoxin (ribosomal block) — keep until GAS ruled out",
          "**IVIG** for streptococcal TSS (mortality benefit)",
          "Mortality: 20–40% even with optimal surgery + antibiotics",
        ],
        watchOut: [
          { sev: "stop", text: "**Imaging delay = death** — operate on clinical suspicion; don't wait for CT" },
          { sev: "warn", text: "**LRINEC** has poor sensitivity — negative score does NOT rule out NF" },
          { sev: "warn", text: "Pain out of proportion to exam, hard wood-like skin, hemorrhagic bullae, crepitus, anesthesia" },
          { sev: "note", text: "Type 1 (polymicrobial — diabetic/perineal), Type 2 (monomicrobial GAS), Type 3 (Vibrio in salt water)" },
        ],
      },
    ],
    "Group A strep / Clostridium confirmed": [
      {
        rx: /penicillin.*clindamycin/i,
        pickIf: "GAS or Clostridium confirmed — narrow to penicillin + keep clindamycin.",
        whyPick: [
          "**Penicillin G** narrow-spectrum cidal — preferred over broader β-lactam once confirmed",
          "**Continue clindamycin** for full toxin-suppression — don't drop just because narrowed",
          "**IVIG 1–2 g/kg** for streptococcal TSS — mortality benefit (observational + small RCTs)",
          "**Linezolid** alternative to clinda if clinda-resistant or C. diff history (also suppresses toxin)",
        ],
        watchOut: [
          { sev: "warn", text: "**Don't drop clindamycin** until clinically stable + tissue cultures growing only GAS — premature narrowing risks toxin resurgence" },
          { sev: "warn", text: "**Clindamycin → C. difficile** — accept the risk in TSS; switch to linezolid + metronidazole prophylaxis if recurrent C. diff history" },
          { sev: "note", text: "**Surgical re-look every 24 h** until margins clean — necrosis can extend silently under antibiotic coverage" },
        ],
      },
    ],
  },

  dfi: {
    "Mild": [
      {
        rx: /cephalexin|cefazolin/i,
        pickIf: "Mild diabetic foot infection (no systemic signs, < 2 cm cellulitis, no bone exposure).",
        whyPick: [
          "**Cephalexin / cefazolin** — covers strep + MSSA",
          "**Add MRSA cover** (TMP-SMX or doxy) if MRSA colonized or recent abx",
          "**Wound care + offloading** drive outcomes — antibiotics alone fail without these",
          "**1–2 week course** for mild infection",
        ],
        watchOut: [
          { sev: "warn", text: "**Probe-to-bone** positive → osteomyelitis; bone biopsy + longer course" },
          { sev: "note", text: "X-ray, MRI for suspicion of underlying osteo" },
        ],
      },
    ],
    "Moderate–severe": [
      {
        rx: /piperacillin|ceftriaxone.*metronidazole|vancomycin/i,
        pickIf: "Moderate-severe DFI — systemic signs, deep tissue, ischemia, or rapid progression.",
        whyPick: [
          "**Pip-tazo** OR **ceftriaxone + metronidazole** — broad coverage",
          "Add **vancomycin** if MRSA risk or septic",
          "**Vascular surgery** — assess perfusion; revascularize if needed",
          "**Debridement** of necrotic tissue — surgery often needed",
        ],
        watchOut: [
          { sev: "warn", text: "**Osteomyelitis common** — get bone biopsy if doubt" },
          { sev: "note", text: "2–4 week course for soft tissue; 4–6 wk if bone involved" },
        ],
      },
    ],
  },

  ssi: {
    "Superficial / clean": [
      {
        rx: /cefazolin|MRSA|incision/i,
        pickIf: "Superficial SSI from clean surgery (skin closure, no GI/GU/biliary).",
        whyPick: [
          "**Open the incision** — drainage is primary",
          "**Cefazolin or anti-MRSA agent** by local flora",
          "Short course post-drainage (**3–7 d**) usually sufficient",
        ],
        watchOut: [
          { sev: "warn", text: "**Open the incision** — pus + erythema with no fluctuance still needs source release; antibiotics alone fail" },
          { sev: "note", text: "**Hardware / mesh involvement** → extended therapy + surgical re-look; assume biofilm" },
        ],
      },
    ],
    "GI/GU/biliary surgery": [
      {
        rx: /ceftriaxone.*metronidazole|piperacillin/i,
        pickIf: "SSI from contaminated surgery — cover GNR + anaerobes.",
        whyPick: [
          "**Ceftriaxone + metronidazole** OR **pip-tazo** — both cover the resident flora",
          "**Source control** (drainage, washout) drives outcomes — antibiotics adjunctive",
          "Tailor by deep-tissue/fluid culture results within 48–72 h",
        ],
        watchOut: [
          { sev: "warn", text: "**Mesh / hardware infections** — usually need explant; antibiotics alone rarely cure biofilm" },
          { sev: "warn", text: "**Anastomotic leak** drives a fundamentally different problem — surgical re-exploration not just antibiotics" },
          { sev: "note", text: "Step-down to oral on cultures + clinical stability; STOP-IT-style 4-day post-source-control regimens sufficient" },
        ],
      },
    ],
  },

  fournier: {
    "Immediate": [
      {
        rx: /SURGICAL|piperacillin|vancomycin|clindamycin/i,
        pickIf: "Fournier's gangrene — perineal / scrotal necrotizing infection. SURGERY NOW.",
        whyPick: [
          "**Surgical debridement is the treatment** — within HOURS",
          "**Pip-tazo (or carbapenem) + vancomycin + clindamycin** — polymicrobial + toxin",
          "Diversion (colostomy) often needed",
          "Mortality 20–40% — predictors include sepsis, comorbidities, delay to OR",
        ],
        watchOut: [
          { sev: "stop", text: "**Delay to surgery = death** — operate on suspicion" },
          { sev: "warn", text: "Diabetic, immunocompromised, alcoholic — common substrate" },
        ],
      },
    ],
  },

  bites: {
    "Standard": [
      {
        rx: /amoxicillin-?clavulanate|ampicillin-?sulbactam/i,
        pickIf: "Mammalian bite (dog, cat, human) needing prophylaxis or treatment.",
        whyPick: [
          "**Amox-clav** PO or **amp-sulbactam** IV — covers Pasteurella, oral anaerobes, MSSA",
          "**Prophylaxis 3–5 d** for: deep, hand/face, immunocompromised, joint/tendon, cat or human bites",
          "Cat bites: high Pasteurella risk — always treat",
          "Human bites: Eikenella + anaerobes — always treat",
        ],
        watchOut: [
          { sev: "warn", text: "**Tetanus update + rabies risk assessment** mandatory" },
          { sev: "warn", text: "Hand bites → splint, elevate, hand surgery consult — closed-fist injuries devastate" },
          { sev: "note", text: "Cefuroxime + metronidazole if PCN allergy alternative" },
        ],
      },
    ],
    "Penicillin allergy": [
      {
        rx: /fluoroquinolone|TMP-?SMX|metronidazole|clindamycin/i,
        pickIf: "Severe PCN allergy — combination needed for full coverage.",
        whyPick: [
          "**FQ or TMP-SMX or doxycycline** for aerobic / Pasteurella coverage",
          "**+ metronidazole or clindamycin** for anaerobic coverage — bite flora polymicrobial",
          "Two-drug combo essential — no single non-β-lactam adequately covers Pasteurella + anaerobes",
          "Confirm anaphylaxis history before defaulting to non-β-lactam — many penicillin allergies are mislabeled",
        ],
        watchOut: [
          { sev: "warn", text: "**Doxycycline ± clindamycin misses Eikenella** in human bites — pair with metronidazole or use FQ" },
          { sev: "warn", text: "**FQ tendinopathy / QT / dysglycemia** — counsel elderly + check QT meds list" },
          { sev: "note", text: "**Allergy delabeling** is the right longer-term move — refer to allergy/immunology" },
        ],
      },
    ],
  },

  mastitis: {
    "Lactational mastitis": [
      {
        rx: /dicloxacillin|cephalexin/i,
        pickIf: "Lactating woman with mastitis — continue breastfeeding from affected side.",
        whyPick: [
          "**Dicloxacillin or cephalexin × 10–14 d** — covers MSSA (predominant)",
          "**Continue breastfeeding** — improves drainage; safe for infant",
          "Add **TMP-SMX or clindamycin** if MRSA risk (but TMP-SMX caution in neonates < 1 mo)",
          "Frequent feeding / pumping is the actual therapy",
        ],
        watchOut: [
          { sev: "warn", text: "**Abscess** if fluctuant — needle aspiration or surgical drainage" },
          { sev: "note", text: "**Inflammatory breast cancer** mimics — re-evaluate if not resolved at 2 wk" },
        ],
      },
    ],
    "Breast abscess": [
      {
        rx: /drainage|MRSA/i,
        pickIf: "Fluctuant collection in breast — drainage required.",
        whyPick: [
          "**Drainage** (needle aspiration or surgical) + anti-staph including MRSA cover",
          "**Vancomycin** if hospitalized; **TMP-SMX or clindamycin PO** if outpatient",
          "**Ultrasound-guided aspiration** is first-line — repeat q48h if reaccumulation",
          "Continue **breastfeeding from contralateral side** + manual expression on affected side",
        ],
        watchOut: [
          { sev: "warn", text: "**Recurrence common** if incomplete drainage — image-guide and re-aspirate at 48 h" },
          { sev: "warn", text: "**Inflammatory breast cancer** mimics non-lactational abscess — biopsy if non-lactating or post-menopausal" },
          { sev: "note", text: "MRSA decolonization (mupirocin + chlorhexidine) for recurrent lactational abscess in the household" },
        ],
      },
    ],
  },

  erysipelas: {
    "First-line": [
      {
        rx: /penicillin|cefazolin/i,
        pickIf: "Sharp-bordered, raised, fiery red rash — classic erysipelas (strep).",
        whyPick: [
          "**Penicillin** (oral or IV) — strep is the only bug",
          "Cefazolin if PCN intolerance",
          "**No MRSA cover needed** — erysipelas is strep",
          "5–10 day course",
        ],
        watchOut: [
          { sev: "warn", text: "**Lymphedema substrate** — recurrent erysipelas predicts further episodes; address underlying lymphatic compromise" },
          { sev: "note", text: "**Prophylactic penicillin** (PATCH I/II trials) for recurrent leg erysipelas — extends time to next episode" },
        ],
      },
    ],
  },

  lymphangitis: {
    "First-line": [
      {
        rx: /cefazolin|antistreptococcal|penicillin/i,
        pickIf: "Red streaking from a wound — strep ascending lymphangitis.",
        whyPick: [
          "**Cefazolin or antistreptococcal penicillin** — β-hemolytic strep is the dominant pathogen",
          "**MRSA cover only if purulent** — non-purulent lymphangitis is strep, full stop",
          "**Source the wound** — splinter, animal bite, IV site — address the entry point alongside antibiotics",
        ],
        watchOut: [
          { sev: "warn", text: "**Sporotrichoid pattern** (gardeners, rose-pruners) — think Sporothrix; itraconazole, not antibiotics" },
          { sev: "note", text: "Nocardia and atypical mycobacteria can mimic ascending lymphangitis in immunocompromised — culture/biopsy if no response in 72 h" },
        ],
      },
    ],
  },

  hidradenitis: {
    "Acute flare": [
      {
        rx: /drainage|doxycycline|clindamycin.*rifampin/i,
        pickIf: "Hidradenitis flare with fluctuant lesions or moderate inflammation.",
        whyPick: [
          "**Drainage of fluctuant lesions** is primary",
          "**Doxycycline** for mild-moderate disease (anti-inflammatory + antibacterial)",
          "**Clindamycin + rifampin × 10 weeks** for moderate-severe",
          "Refer dermatology for chronic management — biologics (adalimumab, secukinumab)",
        ],
        watchOut: [
          { sev: "warn", text: "**Rifampin interactions** — many drugs (warfarin, OCPs)" },
          { sev: "note", text: "Smoking + obesity worsen disease — modifiable factors" },
        ],
      },
    ],
  },

  "infected-ulcer": {
    "Infected (systemic or local signs)": [
      {
        rx: /cephalexin|doxycycline|TMP-?SMX/i,
        pickIf: "Ulcer with cellulitis or systemic signs — covers strep + MSSA.",
        whyPick: [
          "**Cephalexin** for strep + MSSA cover",
          "**Doxycycline or TMP-SMX** if MRSA risk",
          "**Wound care + offloading + vascular assessment** drive outcomes — antibiotics adjunctive",
          "Broaden for deep / limb-threatening infection (**pip-tazo + vanco**)",
        ],
        watchOut: [
          { sev: "warn", text: "**Treat infection, not colonization** — surface swabs are always positive in chronic ulcers; culture only deep tissue and only if clinical signs of infection" },
          { sev: "warn", text: "**Probe-to-bone positive** → osteomyelitis; get bone biopsy + extend course to 4–6 wk" },
          { sev: "note", text: "Charcot foot, ischemia, immunocompromise change presentation — keep low threshold for advanced imaging (MRI) + multidisciplinary consult" },
        ],
      },
    ],
  },

  "perianal-abscess": {
    "Drainage ± antibiotics": [
      {
        rx: /amoxicillin-?clavulanate|ciprofloxacin.*metronidazole|incision/i,
        pickIf: "Perianal abscess — drainage is primary, antibiotics for selected.",
        whyPick: [
          "**I&D** is definitive — most cases need no antibiotics",
          "**Add antibiotics** (amox-clav or cipro+metronidazole) for: cellulitis, systemic signs, immunocompromise, deep/supralevator extension",
          "**Fistula develops in ~30%** post-drainage — colorectal surgery follow-up",
        ],
        watchOut: [
          { sev: "warn", text: "**Crohn's-associated** disease — different management; GI involvement" },
          { sev: "warn", text: "Supralevator / horseshoe extension → MRI + OR drainage" },
        ],
      },
    ],
  },

  /* ===========================================================
     OSTEOMYELITIS — bone biopsy guides therapy; long course. ===== */
  osteo: {
    "Empiric (await bone culture)": [
      {
        rx: /vancomycin.*β-?lactam|vancomycin.*antipseudomonal|cefepime|ceftriaxone/i,
        pickIf: "Acute osteomyelitis — empiric while bone biopsy / culture pending.",
        whyPick: [
          "**Vancomycin + antipseudomonal/GNR β-lactam** (cefepime if Pseudo risk, ceftriaxone if not)",
          "**Hold antibiotics until bone biopsy** if stable — culture yield drops 40% with prior abx",
          "**6 weeks IV** standard; oral step-down once organism known",
          "Source control — debridement for sequestrum / hardware",
        ],
        watchOut: [
          { sev: "warn", text: "**Empiric therapy halves culture yield** — biopsy first if patient stable" },
          { sev: "note", text: "OVIVA trial: oral step-down at 1–2 wk non-inferior to all-IV in selected cases" },
        ],
      },
    ],
    "Directed": [
      {
        rx: /cefazolin|nafcillin|organism|MSSA/i,
        pickIf: "Organism identified — narrow + 6-week course.",
        whyPick: [
          "**Cefazolin or nafcillin** for MSSA",
          "**Vancomycin or daptomycin** for MRSA",
          "**Cipro / TMP-SMX / clindamycin** for oral step-down per susceptibilities",
          "**Add rifampin** for staph + retained hardware",
        ],
        watchOut: [
          { sev: "warn", text: "**Rifampin only after cultures positive** — induces resistance fast; never start empirically" },
          { sev: "warn", text: "**ESR / CRP trend** more reliable than imaging for response — re-image only at 4–6 wk or on clinical deterioration" },
          { sev: "note", text: "Oral step-down candidates: cipro / TMP-SMX / clindamycin / linezolid — pick by bone penetration + susceptibilities (OVIVA non-inferiority)" },
        ],
      },
    ],
  },

  vertosteo: {
    "Stable — culture first": [
      {
        rx: /blood\s+cultures|biopsy|culture\s+first/i,
        pickIf: "Stable vertebral osteomyelitis without neurologic deficit — culture-first approach.",
        whyPick: [
          "**Blood cultures + image-guided biopsy BEFORE antibiotics** — IDSA 2015",
          "Antibiotic yield drops dramatically with prior empiric abx",
          "Common pathogens: S. aureus (50%), GNR, streptococci, less commonly Brucella / TB / fungal",
          "**6 weeks IV** once pathogen identified",
        ],
        watchOut: [
          { sev: "warn", text: "**Neurologic deficit** changes plan — empiric coverage + emergent MRI + spine surgery" },
          { sev: "warn", text: "TB and brucella missed if not cultured/serology — long course needed" },
        ],
      },
    ],
    "MSSA / MRSA (most common)": [
      {
        rx: /MSSA|MRSA|cefazolin|nafcillin|vancomycin|daptomycin/i,
        pickIf: "S. aureus vertebral osteomyelitis confirmed by biopsy or blood culture.",
        whyPick: [
          "**MSSA: cefazolin or nafcillin × 6 weeks**",
          "**MRSA: vancomycin (AUC-guided) or daptomycin 8–10 mg/kg × 6 weeks**",
          "**Oral step-down possible** after 2 wk (OVIVA-style) if stable + susceptible",
          "**Rifampin combination** if hardware involved",
        ],
        watchOut: [
          { sev: "warn", text: "**Re-image at 4–6 wk** — radiologic improvement lags clinical" },
          { sev: "note", text: "ESR / CRP trend more useful than imaging for treatment response" },
        ],
      },
    ],
    "Gram-negative / Pseudomonas": [
      {
        rx: /ceftriaxone|cefepime|ciprofloxacin/i,
        pickIf: "GNR or Pseudomonas vertebral osteomyelitis (UTI source common).",
        whyPick: [
          "**Ceftriaxone** for susceptible E. coli / Klebsiella",
          "**Cefepime or cipro** for Pseudomonas",
          "**Cipro** oral step-down advantage — best bone penetration in the class",
        ],
        watchOut: [
          { sev: "warn", text: "**Workup the source** — UTI / endocarditis / endovascular origin; vertebral GNR rarely arises de novo" },
          { sev: "warn", text: "**FQ tendinopathy + QT** — long courses (6 wk) amplify risk; counsel + alternative if elderly + risk factors" },
          { sev: "note", text: "Re-image at 4–6 wk; CRP trend at week 2 is the early signal of response" },
        ],
      },
    ],
    "Septic / neurologic deficit": [
      {
        rx: /vancomycin.*cefepime|MRI|spine\s+surgery/i,
        pickIf: "Vertebral osteomyelitis with epidural abscess or neurologic deficit.",
        whyPick: [
          "**Vancomycin + cefepime NOW** — don't wait for culture in deficit",
          "**Emergent MRI** to define epidural abscess",
          "**Spine surgery** for cord compression or drainable abscess",
          "Neurologic deficit progression = surgical emergency",
        ],
        watchOut: [
          { sev: "stop", text: "**Delay in cord-compression = permanent deficit** — surgery within hours; antibiotics in parallel, not first" },
          { sev: "warn", text: "**Continuous neuro checks** while imaging + surgical workup ongoing — small deficits can become irreversible in hours" },
        ],
      },
    ],
  },

  "septic-arthritis": {
    "Empiric": [
      {
        rx: /vancomycin.*ceftriaxone|antipseudomonal/i,
        pickIf: "Acute septic arthritis — empiric until Gram stain / culture back.",
        whyPick: [
          "**Vancomycin + ceftriaxone** — covers S. aureus + strep + GNR",
          "**Drainage** is the actual treatment (arthroscopy or arthrotomy)",
          "**Repeat aspiration** if no surgical drainage and persistent disease",
          "**3–4 week course**, longer for hardware or atypical organisms",
        ],
        watchOut: [
          { sev: "stop", text: "**Drainage delay** = joint destruction; ortho consult now" },
          { sev: "warn", text: "Crystals + bacteria can coexist — don't dismiss as gout if any suspicion" },
          { sev: "note", text: "Gonococcal: ceftriaxone × 7 d, often no drainage" },
        ],
      },
    ],
    "Gonococcal": [
      {
        rx: /ceftriaxone/i,
        pickIf: "Gonococcal arthritis — sexually active, migratory polyarthritis, tenosynovitis, rash.",
        whyPick: [
          "**Ceftriaxone × 7 d** (IV → IM step-down once stable)",
          "Drainage rarely needed — antibiotics alone usually clear",
          "**Treat partner + screen for other STIs** (HIV, syphilis, chlamydia, hepatitis B/C)",
          "**Add doxycycline 100 mg BID × 7 d** for empiric chlamydia co-treatment if not yet tested",
        ],
        watchOut: [
          { sev: "warn", text: "**Disseminated gonococcal triad**: tenosynovitis + pustular rash + arthritis — treat as DGI even before culture confirms" },
          { sev: "warn", text: "**Rising ceftriaxone resistance** in some regions (Asia-Pacific) — culture-confirm + susceptibilities; consider azithromycin combo per CDC update" },
          { sev: "note", text: "Test-of-cure 7–14 d post-treatment if symptoms persist; report cases per state public-health requirements" },
        ],
      },
    ],
  },

  pji: {
    "Empiric (post-sampling)": [
      {
        rx: /vancomycin.*antipseudomonal/i,
        pickIf: "PJI suspected — synovial fluid sampled, awaiting cultures.",
        whyPick: [
          "**Vancomycin + antipseudomonal β-lactam** while cultures pending",
          "**Get 3–5 deep tissue cultures** (plus sonication of explanted hardware) before / during surgery",
          "**Surgery strategy** (DAIR vs 1-stage vs 2-stage exchange) drives outcomes more than antibiotic choice",
        ],
        watchOut: [
          { sev: "warn", text: "**Antibiotics before sampling halve yield** — coordinate with surgery; if patient is hemodynamically stable, hold abx until OR sampling" },
          { sev: "warn", text: "**Septic shock or fulminant presentation** overrides the hold-abx rule — empiric coverage immediate",
            matchCtx: { severe: true } },
          { sev: "note", text: "**Alpha-defensin + leukocyte-esterase + synovial cell count** all converge to confirm PJI; one result alone isn't decisive" },
        ],
      },
    ],
    "Staphylococcal + retained hardware": [
      {
        rx: /rifampin/i,
        pickIf: "Staph PJI with retained hardware — DAIR strategy.",
        whyPick: [
          "**β-lactam or vancomycin + RIFAMPIN** — rifampin penetrates biofilm",
          "**Oral step-down** with rifampin-based combination (e.g., rifampin + FQ or doxycycline)",
          "**3 months for hip, 6 months for knee** — total course",
          "Never use rifampin monotherapy — resistance in days",
        ],
        watchOut: [
          { sev: "stop", text: "**Never rifampin monotherapy** — emerges resistant within 1–2 weeks" },
          { sev: "warn", text: "**Many interactions** — anticoagulants, OCPs, statins, immunosuppressants" },
          { sev: "warn", text: "**Hepatotoxicity** — check LFTs" },
          { sev: "note", text: "DAIR best within 4 weeks of symptom onset; later → 2-stage exchange" },
        ],
      },
    ],
  },

  pyomyositis: {
    "Empiric": [
      {
        rx: /vancomycin/i,
        pickIf: "Pyomyositis with abscess on imaging — typically tropical or immunocompromised.",
        whyPick: [
          "**Vancomycin** — S. aureus (incl. MRSA) is dominant",
          "**Drainage** if abscess > 3 cm or not improving",
          "Workup HIV — common substrate",
        ],
        watchOut: [
          { sev: "warn", text: "**MRI** to define collection — exam often misses early disease, especially deep / iliopsoas locations" },
          { sev: "warn", text: "**HIV + diabetes + IVDU + tropical exposure** are common substrates — workup the host even when bacterial cause is clear" },
          { sev: "note", text: "S. aureus accounts for >90% (USA300 in temperate areas); GAS, salmonella, Burkholderia in tropical exposure" },
        ],
      },
    ],
    "Directed (MSSA)": [
      {
        rx: /cefazolin|nafcillin/i,
        pickIf: "MSSA confirmed pyomyositis.",
        whyPick: [
          "**Cefazolin** — narrow, BID, lower toxicity than nafcillin",
          "**2–4 week course** depending on collection size + clinical response",
          "**Drainage** is the actual treatment for collections > 3 cm — antibiotic course timed from drainage day 0",
        ],
        watchOut: [
          { sev: "warn", text: "**Re-image at 2 wk** if clinical plateau — undetected loculations or new abscesses common" },
          { sev: "note", text: "Long course (>14 d) — monitor CBC + LFTs weekly for cefazolin-induced cytopenia / hepatitis" },
        ],
      },
    ],
  },

  bursitis: {
    "Empiric": [
      {
        rx: /anti-?staph|β-?lactam/i,
        pickIf: "Septic olecranon or prepatellar bursitis (warm, fluctuant, often post-trauma).",
        whyPick: [
          "**Cefazolin** IV or **dicloxacillin / cephalexin** PO — covers S. aureus",
          "**Aspirate first** for Gram stain + culture (joint exam to exclude septic arthritis)",
          "**MRSA cover** (TMP-SMX, doxy) if risk",
          "**Drainage** essential — needle aspiration + immobilization",
        ],
        watchOut: [
          { sev: "warn", text: "Don't aspirate through cellulitic skin" },
          { sev: "note", text: "Crystal disease and infection can coexist — culture even if crystals seen" },
        ],
      },
    ],
  },

  pressure: {
    "Empiric (systemic infection)": [
      {
        rx: /piperacillin|vancomycin/i,
        pickIf: "Infected pressure injury with systemic signs (cellulitis spread, fever, sepsis).",
        whyPick: [
          "**Pip-tazo ± vancomycin** — covers polymicrobial flora + MRSA",
          "**Debridement** drives outcomes — surface swabs are colonization, not infection",
          "**Deep tissue cultures** if osteo suspected",
          "Pressure relief + nutrition are non-antibiotic essentials",
        ],
        watchOut: [
          { sev: "warn", text: "**Surface swabs unhelpful** — always colonized" },
          { sev: "warn", text: "Underlying osteomyelitis common in stage 4 — bone biopsy if extended course planned" },
        ],
      },
    ],
  },

  /* ===========================================================
     CNS infections. IDSA 2017 + 2024. Dex + empiric coverage
     within 1 hour; LP before/with first dose. ====================== */
  meningitis: {
    "18–50, immunocompetent": [
      {
        rx: /ceftriaxone.*vancomycin|dexamethasone/i,
        pickIf: "Adult community-acquired meningitis, immunocompetent, age 18–50.",
        whyPick: [
          "**Ceftriaxone 2 g IV q12h + vancomycin + dexamethasone** within Hour-1",
          "**Dexamethasone** 0.15 mg/kg q6h BEFORE or WITH first antibiotic dose — pneumococcal mortality benefit",
          "Vancomycin covers PCN/cefotaxime-resistant pneumococcus",
          "**Don't delay antibiotics for CT** — give now, image later if indicated",
          "**Repeat LP** at 24–36 h if vancomycin used (to confirm sterilization)",
        ],
        watchOut: [
          { sev: "stop", text: "**Antibiotic delay = mortality** — give within 1 h of suspicion" },
          { sev: "stop", text: "**Dex AFTER first dose** = no benefit (must precede or coincide with abx)" },
          { sev: "warn", text: "Cefepime / meropenem if recent neurosurgery / penetrating trauma" },
          { sev: "note", text: "CT before LP only for: focal deficit, papilledema, immunocompromised, hx CNS dz, new seizure, AMS" },
        ],
      },
    ],
    ">50 or impaired immunity": [
      {
        rx: /ampicillin/i,
        pickIf: "Age > 50, alcoholic, immunocompromised, or pregnant — Listeria coverage.",
        whyPick: [
          "**Add ampicillin 2 g IV q4h** for Listeria — never assume cephalosporin alone covers",
          "**Listeria invariably resistant to cephalosporins** — every reported case missed by single-cephalosporin therapy",
          "**TMP-SMX 5 mg/kg q6–8h IV** alternative for severe PCN allergy",
          "All other agents (ceftriaxone, vanco, dex) per standard meningitis regimen",
        ],
        watchOut: [
          { sev: "stop", text: "**Listeria + cephalosporin alone = treatment failure** — ampicillin essential whenever age > 50 or immunocompromise" },
          { sev: "warn", text: "**Pregnancy at any age** = Listeria-risk substrate — add ampicillin",
            matchCtx: { any: [{ age: { gte: 50 } }] } },
          { sev: "note", text: "**Workup HIV + steroid + transplant + alcohol** as Listeria-risk substrates if not already documented" },
        ],
      },
    ],
    "Post-neurosurgical / penetrating": [
      {
        rx: /vancomycin.*cefepime|vancomycin.*meropenem/i,
        pickIf: "Post-neurosurgery, penetrating trauma, or CSF shunt-related meningitis.",
        whyPick: [
          "**Vancomycin + cefepime or meropenem** — covers nosocomial GNR + Pseudomonas + Staph",
          "**Remove the device** (shunt, drain) for source control",
          "Intraventricular vanco/gent for refractory ventriculitis",
        ],
        watchOut: [
          { sev: "warn", text: "Cefepime neurotoxicity in CrCl < 60 — dose-reduce" },
          { sev: "warn", text: "Meropenem ↓ valproate" },
        ],
      },
    ],
  },

  ventriculitis: {
    "Empiric": [
      {
        rx: /vancomycin.*cefepime|vancomycin.*meropenem/i,
        pickIf: "Ventriculitis — CSF pleocytosis + drain / shunt + fever.",
        whyPick: [
          "**Vancomycin + cefepime or meropenem** (CNS dosing)",
          "**Remove EVD / shunt** if possible — biofilm",
          "Add **intraventricular vancomycin** if refractory",
          "Long course: **2–3 weeks** after CSF sterilization",
        ],
        watchOut: [
          { sev: "warn", text: "**Get CSF Gram stain + culture daily** until sterile" },
          { sev: "note", text: "Coordinate with neurosurgery + ID" },
        ],
      },
    ],
    "Refractory": [
      {
        rx: /intraventricular/i,
        pickIf: "Persistent CSF positivity despite IV therapy.",
        whyPick: [
          "**Intraventricular vancomycin 10–20 mg daily**, or aminoglycoside via Ommaya / EVD",
          "Coordinate with neurosurgery for delivery — they own the access",
          "**Daily CSF Gram stain + culture + cell count** until clearance documented (≥48 h)",
        ],
        watchOut: [
          { sev: "warn", text: "**Intraventricular dosing requires careful technique + concentration control** — over-concentration causes seizures + chemical ventriculitis" },
          { sev: "warn", text: "**Preservative-free formulations only** — preservatives are neurotoxic intrathecally" },
          { sev: "note", text: "Document trough CSF level + clinical response; consider stopping at 14 d post-clearance" },
        ],
      },
      {
        rx: /aminoglycoside/i,
        pickIf: "GNR ventriculitis when intraventricular delivery preferred.",
        whyPick: [
          "**Intraventricular gentamicin or amikacin** for GNR not clearing on IV alone",
          "Doses are SMALL (mg, not mg/kg) — preservative-free formulations",
          "Neurosurgery handles delivery and CSF sampling",
        ],
        watchOut: [
          { sev: "warn", text: "**Preservative-free only** — preservatives are neurotoxic intrathecally" },
          { sev: "warn", text: "Get peak/trough from CSF, not blood, to guide dosing" },
        ],
      },
    ],
  },

  brainabscess: {
    "Empiric": [
      {
        rx: /ceftriaxone.*metronidazole|cefepime/i,
        pickIf: "Brain abscess on imaging — empiric while awaiting aspiration cultures.",
        whyPick: [
          "**Ceftriaxone (or cefepime) + metronidazole ± vancomycin**",
          "**Aspiration / drainage** by neurosurgery — diagnostic + therapeutic",
          "**6–8 week course** typical, longer if hardware",
          "Source workup — sinus, ear, dental, endocarditis, pulmonary",
        ],
        watchOut: [
          { sev: "warn", text: "**Don't dose-reduce in CNS** — full-strength dosing required" },
          { sev: "note", text: "Steroids only for mass effect / herniation — don't routinely use" },
        ],
      },
    ],
    "Listeria / Nocardia risk": [
      {
        rx: /ampicillin|TMP-?SMX/i,
        pickIf: "Immunocompromised host — add Listeria + Nocardia coverage.",
        whyPick: [
          "**Add ampicillin** for Listeria — invariably resistant to cephalosporins",
          "**Add high-dose TMP-SMX** for Nocardia — alternative is linezolid (cost / supply)",
          "Workup HIV, transplant, chronic steroid, biologic exposure as substrates",
          "Brain biopsy if no improvement at 1–2 wk — atypical pathogens (TB, fungal, toxoplasmosis) require pivot",
        ],
        watchOut: [
          { sev: "warn", text: "**Nocardia long course — 6–12 months minimum** — ID consult mandatory; speciation drives final regimen" },
          { sev: "warn", text: "**Combination therapy** (TMP-SMX + imipenem ± amikacin) for severe / CNS Nocardia — monotherapy fails in disseminated disease" },
          { sev: "note", text: "Aspergillus and Cryptococcus also fit this substrate — keep imaging + biopsy threshold low if response stalls" },
        ],
      },
    ],
  },

  epidural: {
    "Empiric": [
      {
        rx: /vancomycin.*cefepime|vancomycin.*ceftriaxone/i,
        pickIf: "Spinal epidural abscess — back pain + fever + neurologic deficit.",
        whyPick: [
          "**Vancomycin + cefepime / ceftriaxone** — S. aureus dominant",
          "**Emergent whole-spine MRI** — skip lesions in 15–30%, missing them changes management",
          "**Surgical decompression** for deficit or non-improvement at 24–48 h",
          "**6 weeks IV** typical; longer if vertebral osteomyelitis underlies",
        ],
        watchOut: [
          { sev: "stop", text: "**Neurologic deficit = surgical emergency** — delay risks permanent paraplegia; OR within hours, not days" },
          { sev: "warn", text: "**Skip lesions** common — image the entire spine, not just symptomatic level" },
          { sev: "note", text: "Repeat blood cultures at 48 h; persistent bacteremia → endocarditis workup + extend course" },
        ],
      },
    ],
  },

  "subdural-empyema": {
    "Empiric": [
      {
        rx: /vancomycin.*ceftriaxone.*metronidazole|cefepime/i,
        pickIf: "Subdural empyema — typically from sinusitis or otitis spread.",
        whyPick: [
          "**Vancomycin + ceftriaxone (or cefepime) + metronidazole** — CNS dosing",
          "**Neurosurgical drainage** is the treatment — antibiotics adjunctive",
          "Source control — sinus / ear / dental",
          "Long course: 4–6 weeks",
        ],
        watchOut: [
          { sev: "stop", text: "**Drainage emergency** — mass effect + herniation risk; neurosurgery within hours" },
          { sev: "warn", text: "**Seizures** in ~30% — load antiepileptic prophylaxis (levetiracetam) if cortical involvement on imaging" },
          { sev: "note", text: "Streptococcus anginosus group (milleri) common — extends post-drainage course to 6+ weeks even after sterilization" },
        ],
      },
    ],
  },

  "post-nsx-meningitis": {
    "Empiric": [
      {
        rx: /vancomycin.*cefepime|vancomycin.*meropenem/i,
        pickIf: "Meningitis following neurosurgery or CSF leak.",
        whyPick: [
          "**Vancomycin + cefepime / meropenem** (CNS dosing)",
          "**Remove hardware / repair CSF leak** — source control essential",
          "Common organisms: **CoNS, S. aureus, Pseudomonas, Acinetobacter**",
          "Add intraventricular vanco / aminoglycoside for refractory cases",
        ],
        watchOut: [
          { sev: "warn", text: "**Cefepime neurotoxicity** in CrCl < 60 — dose-reduce; myoclonus, NCSE can mimic meningitis itself",
            matchCtx: { crcl: { lt: 60 } } },
          { sev: "warn", text: "**Meropenem ↓ valproate** by 60–90% — switch valproate or use cefepime if epileptic" },
          { sev: "note", text: "**MDR organisms** (Acinetobacter, ESBL Klebsiella) more common in post-NSx; novel β-lactams if prior resistant isolate" },
        ],
      },
    ],
  },

  "cavernous-thromb": {
    "Empiric": [
      {
        rx: /vancomycin.*ceftriaxone.*metronidazole/i,
        pickIf: "Cavernous sinus thrombosis — periorbital infection + cranial nerve deficits.",
        whyPick: [
          "**Vancomycin + ceftriaxone + metronidazole** (CNS dosing)",
          "**Anticoagulation** controversial — selective use after weighing bleed/clot tradeoffs",
          "**Source workup** — sinusitis, dental, facial cellulitis (especially infraorbital triangle)",
          "**ENT / neurosurgery / ophthalmology** consults immediately",
        ],
        watchOut: [
          { sev: "stop", text: "**Mucormycosis** in diabetic / immunocompromised → amphotericin B + emergent surgical debridement; missed = death" },
          { sev: "warn", text: "**Cranial-nerve sweep** (III, IV, V1, V2, VI) at every reassessment — progression is the trigger for repeat imaging + surgical re-look" },
          { sev: "note", text: "Long course 4–6 weeks; monitor for septic emboli to brain/meninges" },
        ],
      },
    ],
  },

  "shunt-infection": {
    "Empiric": [
      {
        rx: /vancomycin.*cefepime|intraventricular/i,
        pickIf: "Suspected ventriculoperitoneal shunt infection.",
        whyPick: [
          "**Vancomycin + cefepime / meropenem**",
          "**Externalize or remove the shunt** — definitive; salvage rarely succeeds with biofilm intact",
          "**Intraventricular vancomycin** if refractory or post-explant CSF positive",
          "Long course depends on organism + hardware management; 10–14 d post-clearance typical",
        ],
        watchOut: [
          { sev: "warn", text: "**CoNS most common** but most virulent organisms (S. aureus, Pseudomonas, GNR) absolutely require explant; lock therapy rarely succeeds" },
          { sev: "note", text: "Re-implantation timing: typically 7–14 d post-sterilization; coordinate with neurosurgery" },
        ],
      },
    ],
  },

  "neuro-lyme-syphilis": {
    "Neuroborreliosis (Lyme)": [
      {
        rx: /ceftriaxone|doxycycline/i,
        pickIf: "Confirmed neuroborreliosis (CSF + serology criteria met).",
        whyPick: [
          "**Ceftriaxone 2 g IV q24h × 14–28 d** — CNS Lyme",
          "**Oral doxycycline** non-inferior in selected European data for facial palsy / radiculitis",
          "Persistent fatigue post-treatment ≠ active infection — don't re-treat",
        ],
        watchOut: [
          { sev: "warn", text: "**Jarisch-Herxheimer** reaction within hours of first dose" },
          { sev: "stop", text: "**\"Chronic Lyme\"** — no evidence base for prolonged courses" },
        ],
      },
    ],
    "Neurosyphilis": [
      {
        rx: /penicillin/i,
        pickIf: "Neurosyphilis (CSF VDRL+, or syphilis + neurologic signs).",
        whyPick: [
          "**Aqueous penicillin G 18–24 MU/day IV × 10–14 d** — IDSA + CDC standard",
          "**Procaine penicillin IM + probenecid PO** acceptable alternative",
          "Desensitize PCN-allergic — no alternative is equally effective",
          "**Repeat CSF VDRL** at 6 months for treatment response",
        ],
        watchOut: [
          { sev: "warn", text: "**Jarisch-Herxheimer** — fever, hypotension within 24 h" },
          { sev: "warn", text: "Workup HIV always — co-infection common" },
        ],
      },
    ],
  },

  /* ===========================================================
     C. DIFFICILE — IDSA 2021 (Johnson). Fidaxomicin preferred;
     vancomycin acceptable; fulminant = combo + surgery threshold. = */
  cdiff: {
    "Initial episode": [
      {
        rx: /fidaxomicin/i,
        pickIf: "Initial C. diff episode — IDSA-preferred (2021 update).",
        whyPick: [
          "**IDSA 2021 first-line** (upgraded from vanco)",
          "**Lower recurrence** rate than vanco (~13% vs ~25%)",
          "**Narrow spectrum** — spares gut flora better",
          "**200 mg PO BID × 10 d**",
        ],
        watchOut: [
          { sev: "warn", text: "**Cost barrier** — ~$5,000 / course; may need PA / restricted formulary" },
          { sev: "note", text: "Vancomycin acceptable if fidax unaffordable / unavailable" },
        ],
      },
      {
        rx: /vancomycin/i,
        pickIf: "Initial C. diff when fidaxomicin unavailable or cost-prohibitive.",
        whyPick: [
          "**Oral vancomycin 125 mg PO QID × 10 d** — equivalent cure to fidax",
          "Cheap, broadly available",
          "**Higher recurrence** than fidaxomicin (~25% vs ~13%)",
        ],
        watchOut: [
          { sev: "stop", text: "**IV vancomycin doesn't treat C. diff** — must be oral or rectal" },
          { sev: "warn", text: "Not absorbed orally — minimal systemic side effects" },
          { sev: "note", text: "Don't use metronidazole as first-line anymore (inferior efficacy)" },
        ],
      },
    ],
    "Fulminant": [
      {
        rx: /vancomycin.*metronidazole|oral|NG/i,
        pickIf: "Fulminant C. diff — hypotension, ileus, megacolon, or organ failure.",
        whyPick: [
          "**Oral/NG vancomycin 500 mg q6h + IV metronidazole 500 mg q8h**",
          "**Rectal vancomycin** (500 mg in 100 mL NS retention enema q6h) if ileus",
          "**Surgical consult immediately** — subtotal colectomy if no improvement at 24–48 h",
          "Diverting loop ileostomy + colonic lavage emerging alternative",
        ],
        watchOut: [
          { sev: "stop", text: "**Surgery delay = death** in fulminant disease" },
          { sev: "warn", text: "STOP loperamide, opiates, anticholinergics" },
          { sev: "warn", text: "Avoid PPIs when possible during treatment + post" },
        ],
      },
    ],
    "Recurrence": [
      {
        rx: /fidaxomicin|tapered|pulsed|bezlotoxumab|FMT/i,
        pickIf: "Second or later C. diff episode.",
        whyPick: [
          "**Fidaxomicin** (standard or extended-pulsed) — preferred for first recurrence",
          "**Tapered/pulsed vancomycin** acceptable alternative",
          "**Bezlotoxumab** infusion to prevent further recurrence (high-risk patients)",
          "**FMT** for ≥ 2 recurrences — 80–90% cure rates",
        ],
        watchOut: [
          { sev: "warn", text: "Bezlotoxumab caution in CHF — fluid overload signal" },
          { sev: "note", text: "Refer to GI / ID for FMT planning" },
        ],
      },
    ],
  },

  /* ===========================================================
     Toxin-mediated and special infections. ========================= */
  tss: {
    "Empiric": [
      {
        rx: /vancomycin.*clindamycin|piperacillin/i,
        pickIf: "Toxic shock syndrome — hypotension + rash + multi-organ failure.",
        whyPick: [
          "**Vancomycin + clindamycin ± β-lactam** — broad cover + toxin suppression",
          "**Clindamycin suppresses toxin** (ribosomal block) — keep on board until source confirmed",
          "**Source control** — remove tampon, drain abscess, debride necrotic tissue",
          "**IVIG 1–2 g/kg** for streptococcal TSS — mortality benefit",
        ],
        watchOut: [
          { sev: "stop", text: "**Source removal delayed → shock persists** — even with appropriate antibiotics, source control is the inflection point" },
          { sev: "warn", text: "**Vasopressor escalation** + multi-organ failure typical — early ICU + ID involvement mandatory",
            matchCtx: { severe: true } },
          { sev: "note", text: "Staph vs strep TSS distinguishable late — empiric treats both pathways; narrow on cultures + clinical clues (desquamation favors staph)" },
        ],
      },
    ],
    "Directed (GAS)": [
      {
        rx: /penicillin.*clindamycin/i,
        pickIf: "Streptococcal TSS confirmed.",
        whyPick: [
          "**Penicillin G + clindamycin × 14 d** — combined cidal + toxin suppression",
          "**IVIG 1–2 g/kg day 1** — consider repeat if clinical non-response by 48 h",
          "**Linezolid alternative** to clinda if clinda-resistant or C. diff history",
          "**Surgical re-look every 24 h** for the necrotizing component — silent extension under antibiotics",
        ],
        watchOut: [
          { sev: "warn", text: "**ICU + ID notification within hours** — mortality 30–80% despite optimal therapy" },
          { sev: "warn", text: "**Continue clindamycin × 5 d** even after narrowing — premature stop risks toxin resurgence" },
          { sev: "note", text: "Contacts of severe invasive GAS: prophylaxis per public-health (penicillin or first-gen cephalosporin)" },
        ],
      },
    ],
  },

  "gas-gangrene": {
    "Empiric": [
      {
        rx: /penicillin.*clindamycin|piperacillin|carbapenem/i,
        pickIf: "Gas gangrene (clostridial myonecrosis) — crepitus + rapid spread.",
        whyPick: [
          "**Penicillin + clindamycin + broad coverage** (pip-tazo or carbapenem)",
          "**SURGERY NOW** — debridement to viable tissue / amputation",
          "**Hyperbaric oxygen** adjunctive where available — does NOT delay surgery",
          "**Clindamycin essential** for alpha-toxin suppression — continue until clinically stable",
        ],
        watchOut: [
          { sev: "stop", text: "**Surgery is the treatment** — antibiotics alone uniformly fail; mortality ~25–50% even with timely OR" },
          { sev: "warn", text: "**Pain out of proportion + crepitus + hemorrhagic bullae** → operate on clinical suspicion; don't wait for imaging" },
          { sev: "note", text: "Re-explore q24h until margins clean — clostridial infection extends silently under antibiotic cover" },
        ],
      },
    ],
  },

  tetanus: {
    "Antimicrobial (adjunct)": [
      {
        rx: /metronidazole/i,
        pickIf: "Clinical tetanus — antibiotics are adjunctive.",
        whyPick: [
          "**Metronidazole 500 mg IV q8h × 7–10 d** — preferred over penicillin (penicillin antagonizes GABA, worsening spasm)",
          "**Tetanus immune globulin (TIG) 500 IU IM** + **tetanus toxoid** vaccine are primary",
          "**Wound debridement** essential — remove necrotic tissue + spore reservoir",
          "ICU for autonomic + muscular control — diazepam / magnesium / paralytics PRN",
        ],
        watchOut: [
          { sev: "warn", text: "**Penicillin → worsened spasm** (GABA-antagonist effect at high doses) — avoid in established tetanus" },
          { sev: "warn", text: "**Autonomic instability** kills more than spasm — ICU monitoring + cautious vasopressor titration" },
          { sev: "note", text: "Vaccinate post-recovery — tetanus disease does NOT confer immunity; 3-dose primary series needed" },
        ],
      },
    ],
  },

  botulism: {
    "Antitoxin (primary)": [
      {
        rx: /antitoxin|BabyBIG/i,
        pickIf: "Suspected botulism — antitoxin is the treatment, not antibiotics.",
        whyPick: [
          "**Equine antitoxin** (adults) or **BabyBIG** (infants) — give EARLY",
          "**Antibiotics are NOT primary** and may worsen infant botulism (toxin release with lysis)",
          "**ICU + ventilator support** for descending paralysis",
          "Notify state health department immediately",
        ],
        watchOut: [
          { sev: "stop", text: "**Antibiotics in infant botulism** can worsen disease (toxin release with cell lysis)" },
          { sev: "warn", text: "**Aminoglycosides** worsen neuromuscular blockade — avoid in confirmed/suspected botulism" },
          { sev: "warn", text: "Wound botulism (IV drug use): debride + give antitoxin first; penicillin G adjunct for clostridial wound clearance" },
          { sev: "note", text: "Equine antitoxin: serum sickness ~9%, anaphylaxis ~2% — keep epi at bedside; defer prick-test only if outbreak triage" },
        ],
      },
    ],
  },

  "enteric-fever": {
    "Empiric": [
      {
        rx: /ceftriaxone|azithromycin/i,
        pickIf: "Typhoid / paratyphoid fever — typically returning traveler.",
        whyPick: [
          "**Ceftriaxone 2 g IV q24h** for severe / hospitalized",
          "**Azithromycin** for uncomplicated outpatient",
          "**Cipro resistance widespread** — no longer empiric",
          "**14-day course**",
        ],
        watchOut: [
          { sev: "stop", text: "**FQ resistance in South Asia >75%** — don't use empirically" },
          { sev: "warn", text: "Chronic carrier state in 1–5% — gallbladder reservoir; consider cholecystectomy if recurrent" },
        ],
      },
    ],
  },

  "severe-gastroenteritis": {
    "Selective therapy": [
      {
        rx: /azithromycin/i,
        pickIf: "Invasive diarrhea (bloody, febrile, dysentery) — Shigella, Campylobacter, non-Typhi Salmonella in high-risk.",
        whyPick: [
          "**Azithromycin** preferred — covers Shigella + Campylobacter + Salmonella",
          "FQs have rising resistance",
          "**Don't treat** non-Typhi Salmonella in immunocompetent — prolongs carriage",
        ],
        watchOut: [
          { sev: "stop", text: "**Don't treat EHEC** (E. coli O157) — risk of HUS with antibiotics" },
          { sev: "warn", text: "Most gastroenteritis is viral or self-limited bacterial — supportive care only" },
        ],
      },
    ],
  },

  /* ===========================================================
     Febrile neutropenia + special hosts. =========================== */
  febneut: {
    "Empiric monotherapy": [
      {
        rx: /cefepime/i,
        pickIf: "Febrile neutropenia, hemodynamically stable, no ESBL history.",
        whyPick: [
          "**IDSA first-line monotherapy** (Taplitz 2018)",
          "**Cefepime 2 g IV q8h** — pseudomonal cover, narrower than carbapenem",
          "**Stop at 48 h** if afebrile + ANC recovering + cultures negative",
          "Stewardship-friendly — preserves carbapenems for documented ESBL",
        ],
        watchOut: [
          { sev: "warn", text: "**Cefepime neurotoxicity** if CrCl < 60 and dose not reduced — myoclonus, NCSE",
            matchCtx: { crcl: { lt: 60 } } },
          { sev: "warn", text: "**No anaerobic cover** — add metronidazole for mucositis / typhlitis / abdominal source" },
          { sev: "note", text: "MRSA cover should NOT be added empirically (Taplitz 2018) — wait for catheter / skin / pneumonia trigger" },
        ],
      },
      {
        rx: /piperacillin/i,
        pickIf: "Mucositis or typhlitis — anaerobic cover advantageous.",
        whyPick: [
          "**Adds anaerobic cover** — useful in mucositis / typhlitis / abdominal source",
          "**Single-agent broad coverage** — gut anaerobes + Pseudomonas in one drug",
          "**Equivalent efficacy** to cefepime in stable febrile neutropenia trials",
        ],
        watchOut: [
          { sev: "warn", text: "**Pip-tazo + vanco AKI signal** — favor cefepime backbone if vanco co-administered" },
          { sev: "warn", text: "Promotes **VRE selection** more than cefepime (anaerobic kill — gut flora disruption)" },
          { sev: "note", text: "ESBL inoculum effect — switch to meropenem if not improving by 72 h on appropriate dose" },
        ],
      },
      {
        rx: /meropenem/i,
        pickIf: "Prior ESBL, recent broad β-lactam, or critically ill.",
        whyPick: [
          "**ESBL workhorse** — reliable killing where pip-tazo / cefepime fail",
          "**Broad single-agent** — gut anaerobes + Pseudomonas + most enterococci",
          "**First-line in septic shock** while colonization / culture data return",
        ],
        watchOut: [
          { sev: "warn", text: "**↓ valproate by 60–90%** — never combine in epilepsy" },
          { sev: "warn", text: "**Promotes CRE selection** — narrow ASAP once cultures back; document stewardship indication" },
          { sev: "note", text: "Reserve for true ESBL / septic shock indication; non-CRE settings should default to cefepime / pip-tazo" },
        ],
      },
    ],
    "Add agents by indication": [
      {
        rx: /vancomycin|aminoglycoside/i,
        pickIf: "Catheter source, SSTI, pneumonia, septic shock, or known resistant GNR.",
        whyPick: [
          "**Add vancomycin** for catheter / skin / pneumonia / shock — NOT reflexively",
          "**Add aminoglycoside** for hemodynamic instability or known resistant GNR",
          "**Stop within 48 h** if cultures negative — every day of empiric breadth drives resistance + toxicity",
        ],
        watchOut: [
          { sev: "warn", text: "**Aminoglycoside duration > 72 h** → nephrotoxicity + ototoxicity rise sharply; pull at synergy band end" },
          { sev: "warn", text: "**Reflexive vanco use** without indication → AKI + VRE selection without clinical benefit (Taplitz 2018)" },
          { sev: "note", text: "MRSA nares PCR negative → safe to drop vanco early; treat negative result as actionable evidence" },
        ],
      },
    ],
  },

  typhlitis: {
    "Empiric": [
      {
        rx: /piperacillin|meropenem/i,
        pickIf: "Neutropenic enterocolitis (RLQ pain, fever, ANC < 500).",
        whyPick: [
          "**Pip-tazo or meropenem** — anaerobic + Pseudomonas coverage",
          "**Supportive care + bowel rest + NPO** drives recovery; granulocyte support indirectly via ANC recovery",
          "**Surgery threshold** — perforation, persistent bleeding, abscess, refractory pain despite ANC recovery",
        ],
        watchOut: [
          { sev: "warn", text: "**Differentiate from C. difficile** — symptom overlap; test stool early, treat empirically if pretest probability high" },
          { sev: "warn", text: "**G-CSF / pegfilgrastim** to shorten neutropenia is adjunctive — coordinate with oncology" },
          { sev: "note", text: "CT scan defines mural thickening + pericecal fluid; serial imaging if non-response in 48–72 h" },
        ],
      },
    ],
  },

  opsi: {
    "Empiric": [
      {
        rx: /ceftriaxone/i,
        pickIf: "Asplenic patient + fever — true emergency, treat at triage.",
        whyPick: [
          "**Ceftriaxone 2 g IV** within minutes of arrival",
          "**Add vancomycin** for resistant pneumococcus / meningitis suspicion",
          "Mortality 40–70% if delayed",
          "**Standby home antibiotic** (amox-clav) for these patients",
        ],
        watchOut: [
          { sev: "stop", text: "**No delay for cultures** — first dose at triage" },
          { sev: "warn", text: "Capnocytophaga risk (dog bite + asplenia) → DIC" },
        ],
      },
    ],
  },

  nocardia: {
    "Severe / disseminated / CNS": [
      {
        rx: /TMP-?SMX.*imipenem|amikacin/i,
        pickIf: "Severe or disseminated Nocardia, or CNS involvement.",
        whyPick: [
          "**High-dose TMP-SMX + imipenem** initial",
          "Add **amikacin** for severe / CNS disease",
          "Long course: **6–12 months minimum**",
          "ID + neurosurgery for brain abscess",
        ],
        watchOut: [
          { sev: "warn", text: "Speciation matters — N. farcinica resistant to several agents" },
          { sev: "note", text: "Workup immunocompromise — HIV, transplant, steroid" },
        ],
      },
    ],
    "Localized / step-down": [
      {
        rx: /TMP-?SMX|linezolid/i,
        pickIf: "Localized pulmonary Nocardia, or oral step-down post-induction.",
        whyPick: [
          "**TMP-SMX** PO 6–12 months — primary maintenance therapy",
          "**Linezolid** alternative for TMP-SMX intolerance (cost barrier, toxicity ceiling)",
          "**Combination therapy** if disseminated even on step-down (TMP-SMX + minocycline or linezolid)",
          "ID-led monitoring — relapse common with premature stop",
        ],
        watchOut: [
          { sev: "warn", text: "**Linezolid > 1 month** → cytopenias, peripheral + optic neuropathy, lactic acidosis; CBC q2wk + neuro exam" },
          { sev: "warn", text: "**TMP-SMX long courses** → hyperkalemia, hyponatremia, AKI — check labs q2wk + adjust dose by SCr trend",
            matchCtx: { crcl: { lt: 60 } } },
          { sev: "note", text: "**Speciation matters** — N. brasiliensis treated similarly; N. otitidiscaviarum and N. transvalensis need different regimens (ID input)" },
        ],
      },
    ],
  },

  listeria: {
    "Empiric / directed": [
      {
        rx: /ampicillin/i,
        pickIf: "Listeria infection (bacteremia, meningitis, rhombencephalitis).",
        whyPick: [
          "**Ampicillin 2 g IV q4h** — 21 d bacteremia, 21–28 d CNS, ≥ 6 wk rhombencephalitis",
          "Add **gentamicin** for synergy in severe disease — first 7–14 d only (controversial; observational benefit)",
          "**Workup substrate** — pregnancy, HIV, transplant, chronic steroid, malignancy, age > 50",
          "Notify state health department + traceback food exposure",
        ],
        watchOut: [
          { sev: "stop", text: "**Cephalosporins inactive** — single-agent cephalosporin therapy invariably fails; ampicillin essential" },
          { sev: "warn", text: "**Pregnancy** — Listeria has tropism for placenta; treat aggressively to prevent fetal loss / chorioamnionitis" },
          { sev: "note", text: "Aminoglycoside synergy data weak — limit gent to ≤ 14 d to bound nephro/ototoxicity" },
        ],
      },
    ],
    "Severe penicillin allergy": [
      {
        rx: /TMP-?SMX/i,
        pickIf: "Listeria with severe penicillin allergy.",
        whyPick: [
          "**High-dose TMP-SMX 5 mg/kg IV q6–8h** — best-available alternative",
          "**Limited prospective data** — clinical case series; cure rates lower than ampicillin",
          "**Desensitization to penicillin** is preferred if at all feasible — penicillin remains the standard",
        ],
        watchOut: [
          { sev: "warn", text: "**Hyperkalemia + AKI** — monitor K + SCr q24h on long courses; sulfa rash / SJS history is absolute exclusion" },
          { sev: "warn", text: "**Pregnancy 3rd trimester** → kernicterus risk; never use TMP-SMX late in pregnancy (this is a hard CI for Listeria-PCN-allergy combo)" },
          { sev: "note", text: "Meropenem in vitro active but clinical failures reported; reserve for desensitization-failure salvage" },
        ],
      },
    ],
  },

  capno: {
    "Empiric / directed": [
      {
        rx: /ampicillin-?sulbactam|piperacillin|carbapenem/i,
        pickIf: "Capnocytophaga infection (dog/cat exposure + asplenia/cirrhosis/alcoholism).",
        whyPick: [
          "**Amp-sulbactam or pip-tazo** standard — covers fastidious oral flora",
          "**Carbapenem** for septic shock or asplenic-OPSI presentation",
          "**Mortality 25–60% in asplenic / cirrhotic** — treat as emergency",
          "Source the exposure: dog/cat lick or bite is classic; 1–14 d incubation",
        ],
        watchOut: [
          { sev: "stop", text: "**DIC + purpura fulminans** — fast supportive care + early surgical consult for tissue necrosis" },
          { sev: "warn", text: "**Asplenia / functional asplenia (SCD, post-XRT) + dog exposure** → highest mortality — broaden + ICU early",
            matchCtx: { severe: true } },
          { sev: "note", text: "Counsel asplenic patients: avoid contact with dog saliva, especially abraded skin; standing home antibiotic prescription advisable" },
        ],
      },
    ],
  },

  "neutropenic-pna": {
    "Bacterial empiric": [
      {
        rx: /piperacillin|cefepime|meropenem/i,
        pickIf: "Pneumonia in neutropenic / transplant host with ANC < 500.",
        whyPick: [
          "**Antipseudomonal β-lactam first-line** per IDSA 2018 (Taplitz)",
          "Cefepime or pip-tazo for low-risk; **meropenem if septic shock + ESBL risk + prior broad antibiotics**",
          "**Add vancomycin** at presentation per local MRSA rate + line presence",
          "**CT chest within 24 h** — halo / reverse halo / cavitation predicts mold; CXR insensitive",
        ],
        watchOut: [
          { sev: "warn", text: "**Workup fungal early** — galactomannan (serum + BAL) + β-D-glucan biweekly; CT halo/air-crescent drives mold-active escalation" },
          { sev: "warn", text: "**Viral co-pathogens (CMV, RSV, influenza, COVID)** common — viral PCR panel + serology in parallel" },
          { sev: "note", text: "Bronchoscopy / BAL early unless thrombocytopenia / hypoxia contraindicates — diagnostic yield substantial" },
        ],
      },
    ],
    "MDR-Pseudomonas / CRAB salvage": [
      {
        rx: /ceftolozane-?tazobactam|ceftazidime-?avibactam|cefiderocol|sulbactam-?durlobactam/i,
        pickIf: "DTR-Pseudomonas / KPC-CRE / CRAB / metallo-CRE confirmed or strongly suspected.",
        whyPick: [
          "**Mechanism-typing drives choice** per IDSA AMR-GN 2024",
          "**Ceftolozane-tazo** for DTR-Pseudomonas; **ceftaz-avi** (+ aztreonam) for metallo",
          "**Sulbactam-durlobactam** first-line for CRAB (XACDURO 2023)",
          "**Cefiderocol** for pan-resistant salvage",
        ],
        watchOut: [
          { sev: "warn", text: "**ID consult mandatory** — carbapenemase typing + dose intensity drive outcome" },
          { sev: "warn", text: "Renal-adjusted; TDM where available" },
          { sev: "note", text: "Combine with inhaled tobi/colistin for pulmonary source — adjunct only" },
        ],
      },
    ],
    "Mold-active empiric (persistent fever ≥ 96 h)": [
      {
        rx: /voriconazole|isavuconazole|posaconazole|amphotericin|caspofungin|micafungin/i,
        pickIf: "Persistent neutropenic fever ≥ 96 h on broad antibiotics, OR CT halo/cavitation, OR confirmed mold.",
        whyPick: [
          "**Voriconazole** first-line for IPA — VfR / SECURE; load 6 mg/kg q12h × 2 then 4 mg/kg q12h",
          "**Isavuconazole** alternative — fewer interactions + visual AEs (SECURE 2018)",
          "**Liposomal amphotericin + isavuconazole** for mucormycosis — surgery + ID + thoracic",
          "**Echinocandin** for empiric Candida / breakthrough during azole prophylaxis",
        ],
        watchOut: [
          { sev: "stop", text: "**Vori + rifampin → vori levels drop** below MIC — switch one (CYP3A4 induction)" },
          { sev: "warn", text: "**Voriconazole TDM** trough 1–5.5 mg/L at day 5 — sub-target drives failure, supra drives toxicity" },
          { sev: "warn", text: "**Reduce immunosuppression** per transplant team — single highest-impact intervention" },
          { sev: "note", text: "EORTC/MSGERC 2020 — preemptive (test-driven) vs empiric — institutional protocol" },
        ],
      },
    ],
    "PJP coverage": [
      {
        rx: /trimethoprim-?sulfamethoxazole|sulfamethoxazole/i,
        pickIf: "Hypoxia + bilateral interstitial infiltrate + HIV / chronic steroid / transplant — PJP suspected or confirmed.",
        whyPick: [
          "**TMP-SMX 15–20 mg/kg/d TMP** divided q6–8h × 21 d",
          "**Add steroids** if PaO₂ < 70 or A-a > 35 — prednisone 40 mg BID, then taper",
          "**Secondary prophylaxis** after acute episode — TMP-SMX SS daily during ongoing IS",
        ],
        watchOut: [
          { sev: "warn", text: "**TMP-SMX hyperkalemia + AKI + cytopenias** at high dose — monitor K, SCr, CBC q3 d" },
          { sev: "warn", text: "**Sulfa allergy** — desensitize OR pentamidine 4 mg/kg/d (toxicity profile worse)" },
          { sev: "note", text: "Diagnosis: induced sputum / BAL PCR > silver stain; β-D-glucan supportive" },
        ],
      },
    ],
  },

  "sot-infection": {
    "Bacterial empiric": [
      {
        rx: /broad|antipseudomonal/i,
        pickIf: "Solid-organ transplant recipient with bacterial infection.",
        whyPick: [
          "**Tailor to transplant patient's prior cultures + recipient organ**",
          "**Pip-tazo or carbapenem** if severe",
          "Coordinate with transplant ID — many drug-immunosuppressant interactions",
        ],
        watchOut: [
          { sev: "warn", text: "**Cyclosporine / tacrolimus level monitoring** essential during/after abx" },
          { sev: "note", text: "FQ ↑ tacrolimus levels; rifampin ↓ levels dramatically" },
        ],
      },
    ],
  },

  "asplenia-prophylaxis": {
    "Empiric": [
      {
        rx: /ceftriaxone/i,
        pickIf: "Asplenic patient febrile — empiric until OPSI ruled out.",
        whyPick: [
          "**Ceftriaxone 2 g IV** at triage — encapsulated cover (pneumococcus, H. flu, meningococcus)",
          "Add **vancomycin** if meningitis suspected or septic shock",
          "**Standing home prescription** (amox-clav) for self-administration on any fever",
          "**OPSI mortality 40–70%** with delay — every minute matters",
        ],
        watchOut: [
          { sev: "stop", text: "**Don't wait for cultures** — first dose within minutes of triage; cultures after" },
          { sev: "warn", text: "**Capnocytophaga canimorsus** (dog/cat exposure + asplenia) → fulminant DIC — broaden if any exposure history" },
          { sev: "note", text: "Functional asplenia (SCD, celiac, post-XRT) carries the same risk — treat identically" },
        ],
      },
    ],
  },

  "biologic-infection": {
    "Empiric": [
      {
        rx: /source-?directed|hold/i,
        pickIf: "Patient on biologic (TNF-α inhibitor, rituximab, JAK inhibitor) with infection.",
        whyPick: [
          "**Source-directed coverage** — pathogens by biologic class",
          "**Hold the biologic** during acute infection",
          "**Workup atypicals** — TB reactivation (TNF), Pneumocystis, fungi",
        ],
        watchOut: [
          { sev: "warn", text: "**Workup HBV reactivation** in rituximab" },
          { sev: "note", text: "Coordinate with rheumatology / oncology before resuming biologic" },
        ],
      },
    ],
  },

  "cgd-defect": {
    "Empiric by defect": [
      {
        rx: /source-?directed|defect/i,
        pickIf: "CGD or other primary immunodeficiency — pathogen profile defect-specific.",
        whyPick: [
          "**Treat the characteristic pathogens** for the defect (substrate-specific empiric)",
          "**CGD** — Staph, Burkholderia, Aspergillus, Nocardia, Serratia",
          "**Hypogammaglobulinemia** — encapsulated organisms (pneumococcus, H. flu, meningococcus); IVIG replacement",
          "**Complement deficiency** — recurrent Neisseria; ceftriaxone empiric + meningococcal vaccination",
          "ID consult mandatory — disease-specific guidance + long-term prophylaxis decisions",
        ],
        watchOut: [
          { sev: "warn", text: "**Burkholderia cepacia in CGD** — multi-drug resistant; combination therapy + ID input mandatory" },
          { sev: "warn", text: "**Aspergillus / Mucor risk in CGD** — voriconazole prophylaxis is standard; rule out invasive fungal disease early" },
          { sev: "note", text: "Lifelong TMP-SMX + itraconazole prophylaxis baseline; gamma-interferon decreases infection rate in CGD" },
        ],
      },
    ],
  },

  /* ===========================================================
     Resistance-specific bacteremia entries. ======================== */
  "persistent-mrsa": {
    "Salvage": [
      {
        rx: /daptomycin|ceftaroline/i,
        pickIf: "MRSA bacteremia persisting > 7 d on vancomycin.",
        whyPick: [
          "**Dapto 8–10 mg/kg + ceftaroline** combination — synergy",
          "Or single-agent dapto high-dose (10–12 mg/kg)",
          "**Search for hidden source** — TEE, PET-CT, abscess",
        ],
        watchOut: [
          { sev: "warn", text: "Source control critical — antibiotics alone won't clear endocarditis with veg" },
          { sev: "note", text: "ID consult for all persistent MRSA bacteremia" },
        ],
      },
    ],
  },

  "pseudo-bact": {
    "Susceptible": [
      {
        rx: /cefepime|piperacillin|meropenem|ceftazidime/i,
        pickIf: "Pseudomonas bacteremia, susceptible to standard antipseudomonal agents.",
        whyPick: [
          "**One active antipseudomonal agent** — equivalent to combination therapy (no mortality benefit)",
          "Cefepime, pip-tazo, meropenem, or ceftaz — pick by site + susceptibility + stewardship",
          "**Extended-infusion β-lactam** (4-hour) at MIC ≥ 4 improves PK/PD",
          "**Combination unnecessary** in most cases — combination drives toxicity without benefit",
        ],
        watchOut: [
          { sev: "warn", text: "**Persistence** → search source (line, lung, urinary obstruction); consider second-agent synergy + repeat MIC" },
          { sev: "warn", text: "**Inducible AmpC** in some strains — risk of breakthrough on cephalosporins; meropenem or cefepime preferred if mechanism uncertain" },
          { sev: "note", text: "Duration: 7–14 d for uncomplicated bacteremia (Yahav 2019); longer for endocarditis / immunocompromised" },
        ],
      },
    ],
    "DTR-Pseudomonas": [
      {
        rx: /ceftolozane|ceftazidime-?avibactam|imipenem-?relebactam/i,
        pickIf: "Difficult-to-treat Pseudomonas (resistant to all 1st-line antipseudomonals).",
        whyPick: [
          "**Ceftolozane-tazo** — first-choice DTR-Pseudomonas",
          "**Ceftaz-avi or imipenem-relebactam** alternatives by resistance mechanism",
          "**Cefiderocol** salvage for ceftolozane-resistant or MBL producers",
          "**ID consult mandatory** — match drug to resistance mechanism + colonization history",
        ],
        watchOut: [
          { sev: "warn", text: "**Cost ~$1k+/day** — stewardship review + duration discipline; document outcome-changing indication" },
          { sev: "warn", text: "**Combination + ID consult** if persistent bacteremia on novel agent — emerging resistance documented mid-course in case series" },
          { sev: "note", text: "Match drug to mechanism: KPC → ceftaz-avi or imipenem-relebactam; MBL → cefiderocol or aztreonam + ceftaz-avi; OXA → cefiderocol or polymyxin combo" },
        ],
      },
    ],
  },

  "vre-bact": {
    "First-line": [
      {
        rx: /daptomycin/i,
        pickIf: "VRE bacteremia — daptomycin first-line at most centers.",
        whyPick: [
          "**High-dose daptomycin 10–12 mg/kg** — VRE requires top of dose range",
          "Bactericidal — preferred in endovascular sources",
          "Once-daily, OPAT-friendly",
        ],
        watchOut: [
          { sev: "warn", text: "Dapto MIC creep in VRE — use highest dose band; consider combo for refractory" },
          { sev: "warn", text: "CK monitoring weekly; hold statin if possible" },
          { sev: "stop", text: "Never for pneumonia" },
        ],
      },
      {
        rx: /linezolid/i,
        pickIf: "Dapto contraindicated, VRE pneumonia, or oral step-down needed.",
        whyPick: [
          "**Linezolid 600 mg q12h** — bacteriostatic but effective non-endovascular",
          "Oral = IV bioavailability",
          "No renal dose adjustment",
        ],
        watchOut: [
          { sev: "warn", text: "Bacteriostatic — inferior in endocarditis" },
          { sev: "stop", text: "Serotonin syndrome with SSRI/MAOI" },
          { sev: "warn", text: "Cytopenias, neuropathy, lactic acidosis with > 14 d use" },
        ],
      },
    ],
  },

  "polymicrobial-bact": {
    "Empiric": [
      {
        rx: /piperacillin|carbapenem/i,
        pickIf: "Polymicrobial bacteremia (GNR + anaerobes + strep) — typically gut source.",
        whyPick: [
          "**Pip-tazo or carbapenem** — covers GNR + anaerobes + most streptococci",
          "**Source control** drives outcomes — find the gut perforation / urinary obstruction / abscess",
          "Tailor to cultures once back; species-level data within 48–72 h drives narrowing",
        ],
        watchOut: [
          { sev: "warn", text: "**Surgery consult if source not obvious** — perforation often subtle on initial imaging; serial exam + repeat imaging" },
          { sev: "warn", text: "**Candida + Enterococcus** often missed — broaden to echinocandin + ampicillin if upper-GI / post-op / TPN substrate" },
          { sev: "note", text: "STOP-IT-style 4-day post-source-control regimens sufficient when adequate drainage achieved" },
        ],
      },
    ],
  },

  "strep-bact": {
    "Penicillin-susceptible": [
      {
        rx: /penicillin|ceftriaxone/i,
        pickIf: "Penicillin-susceptible streptococcal bacteremia (viridans, S. gallolyticus, GBS, GAS).",
        whyPick: [
          "**Penicillin G or ceftriaxone** — narrow, cheap, well-studied",
          "**Workup endocarditis** for viridans / S. gallolyticus / S. anginosus group — TEE if any suspicion",
          "**S. gallolyticus → colonoscopy** for colon cancer (25–80% association)",
        ],
        watchOut: [
          { sev: "warn", text: "**GAS bacteremia** → workup for necrotizing infection / TSS — look for soft-tissue source aggressively" },
          { sev: "warn", text: "**S. anginosus (milleri) group** → invariably destructive; image-search for abscess (liver, brain, lung)" },
          { sev: "note", text: "Duration: 14 d uncomplicated; 4–6 wk for endocarditis / deep-tissue source" },
        ],
      },
    ],
    "Severe / toxic (group A)": [
      {
        rx: /penicillin.*clindamycin/i,
        pickIf: "Severe GAS bacteremia, TSS, or necrotizing soft-tissue source.",
        whyPick: [
          "**Penicillin G + clindamycin** — cidal + toxin suppression (ribosomal block)",
          "**IVIG 1–2 g/kg** for confirmed streptococcal TSS — mortality benefit",
          "**Source control** — debridement if NF; drainage if abscess",
          "**Continue clindamycin ≥ 5 d** even after narrowing — premature stop risks toxin resurgence",
        ],
        watchOut: [
          { sev: "stop", text: "**Surgical source control drives mortality** more than antibiotics — operate on clinical suspicion of NF" },
          { sev: "warn", text: "**Linezolid alternative** to clinda if clinda-resistant or C. diff history (also suppresses toxin)" },
          { sev: "note", text: "Notify public health + contact prophylaxis for invasive GAS exposure (household close contacts)" },
        ],
      },
    ],
  },

  "device-vascular": {
    "Empiric": [
      {
        rx: /vancomycin.*antipseudomonal|cefepime|piperacillin/i,
        pickIf: "Vascular device infection (port, line, graft, AVF) — empiric.",
        whyPick: [
          "**Vancomycin + antipseudomonal β-lactam** until cultures back",
          "**Remove the device** — biofilm renders antibiotics ineffective for cure",
          "Workup **endocarditis (TEE)** + metastatic foci — vascular-device infection often seeds",
        ],
        watchOut: [
          { sev: "warn", text: "**Device retention rarely succeeds** outside CoNS with stable patient + lock therapy — counsel realistic salvage rate (~20–30%)" },
          { sev: "warn", text: "**S. aureus / Pseudomonas / Candida / persistent bacteremia** → device MUST come out; no salvage" },
          { sev: "note", text: "Time to positivity > 2 h difference between line + peripheral cultures supports line source" },
        ],
      },
    ],
    "Definitive": [
      {
        rx: /removal|hardware|rifampin/i,
        pickIf: "Confirmed device infection — complete removal preferred.",
        whyPick: [
          "**Complete device removal** + pathogen-directed therapy — standard of care",
          "**Rifampin** for staph if hardware MUST be retained (transplant graft, prosthetic valve replacement contraindicated)",
          "Long course post-removal: **2–6 weeks** by organism + complications",
          "Coordinate with vascular surgery + ID for re-implantation timing",
        ],
        watchOut: [
          { sev: "stop", text: "**Rifampin monotherapy never** — emerges resistant within 1–2 weeks; always combine with active agent" },
          { sev: "warn", text: "**Rifampin interactions** — warfarin (↓ INR), OCPs, statins, immunosuppressants, antiretrovirals — drug-list review before start" },
          { sev: "note", text: "Suppressive oral therapy lifelong for irretrievable hardware (consult ID for regimen / monitoring)" },
        ],
      },
    ],
  },

  /* ===========================================================
     Misc head/neck + vascular + reproductive infections. ========== */
  lemierre: {
    "Empiric": [
      {
        rx: /ampicillin-?sulbactam|piperacillin|carbapenem/i,
        pickIf: "Lemierre's syndrome — septic IJ thrombophlebitis post-pharyngitis (F. necrophorum).",
        whyPick: [
          "**Amp-sulbactam, pip-tazo, or carbapenem** — covers Fusobacterium + anaerobes + strep",
          "**Long course 4–6 weeks IV** then PO step-down to amox-clav",
          "**Anticoagulation controversial** — case-by-case (clot extent, bleeding risk, embolic activity)",
          "**Workup metastatic septic emboli** — lung (most common), joint, brain, liver",
        ],
        watchOut: [
          { sev: "warn", text: "**Septic pulmonary emboli** common (~80%) — get CT chest; image-search for distal embolic foci" },
          { sev: "warn", text: "**ENT involvement** if tonsillar / peritonsillar source — drainage may be needed alongside antibiotics" },
          { sev: "note", text: "Workup MRSA if recent oropharyngeal instrumentation — coverage expands accordingly" },
        ],
      },
    ],
    "Penicillin allergy": [
      {
        rx: /carbapenem|metronidazole.*cephalosporin/i,
        pickIf: "Lemierre's with severe penicillin allergy.",
        whyPick: [
          "**Carbapenem** (meropenem 1 g IV q8h) — single-agent broad coverage",
          "**Metronidazole + 3rd-gen cephalosporin** alternative — covers anaerobes + GNR",
          "**Consider PCN desensitization** for prolonged course if alternatives have toxicity / cost barriers",
          "Long course 4–6 weeks IV either pathway",
        ],
        watchOut: [
          { sev: "warn", text: "**Clindamycin alternative** acceptable but Fusobacterium resistance rising — culture-confirm susceptibility" },
          { sev: "warn", text: "**Carbapenem stewardship** — document allergy + indication; narrow to metronidazole + ceftriaxone if Fusobacterium confirmed and susceptible" },
          { sev: "note", text: "Doxycycline lacks reliable Fusobacterium coverage — don't substitute alone" },
        ],
      },
    ],
  },

  endophthalmitis: {
    "Intravitreal (definitive)": [
      {
        rx: /intravitreal/i,
        pickIf: "Bacterial endophthalmitis — vision-threatening, treat at bedside.",
        whyPick: [
          "**Intravitreal vancomycin + ceftazidime (or amikacin)** — definitive route",
          "**Vitrectomy** if vision worse than hand-motion (EVS criteria) or vitreous opacity",
          "**Vitreous tap + culture BEFORE drug administration** — yields the pathogen + drives narrowing",
        ],
        watchOut: [
          { sev: "stop", text: "**Time = vision** — call ophthalmology immediately; minutes to hours determines outcome" },
          { sev: "warn", text: "**Post-cataract / post-injection endophthalmitis** is the most common cause — review recent ocular procedures + assume bacterial until proven fungal" },
          { sev: "note", text: "Topical antibiotics alone insufficient — intravitreal route mandatory; intravitreal corticosteroid use case-by-case" },
        ],
      },
    ],
    "Endogenous / systemic": [
      {
        rx: /systemic.*vancomycin|antipseudomonal/i,
        pickIf: "Endogenous endophthalmitis from bloodstream source.",
        whyPick: [
          "**Systemic vancomycin + antipseudomonal β-lactam** — covers gram-positive + gram-negative bloodstream source",
          "**Treat the bloodstream source** — K. pneumoniae liver abscess classic; SAB + line + IVDU other substrates",
          "**Antifungal (echinocandin)** for Candida endophthalmitis — common in TPN, IVDU, post-transplant",
          "Intravitreal agents in parallel — systemic alone often inadequate due to blood-eye barrier",
        ],
        watchOut: [
          { sev: "warn", text: "**Workup K. pneumoniae liver abscess** when endogenous + Asian-Pacific demographics — hypervirulent K. pneumoniae classic" },
          { sev: "warn", text: "**Bilateral involvement** at presentation — disseminated infection; broaden + image-search every other foci" },
          { sev: "note", text: "Vitrectomy yield highest within 24 h; later vitrectomy still therapeutic if no improvement" },
        ],
      },
    ],
  },

  mediastinitis: {
    "Post-sternotomy": [
      {
        rx: /vancomycin.*antipseudomonal|cefepime|piperacillin/i,
        pickIf: "Post-cardiac-surgery mediastinitis (deep sternal wound infection).",
        whyPick: [
          "**Vancomycin + antipseudomonal β-lactam** — covers staph + hospital GNR",
          "**Surgical debridement + sternal closure / flap** drives outcomes — antibiotics adjunctive",
          "Long course: **4–6 weeks IV** + step-down depending on hardware + clinical response",
          "Coordinate cardiothoracic + ID + plastics for sternal-flap planning",
        ],
        watchOut: [
          { sev: "stop", text: "**Surgical debridement is the treatment** — antibiotics alone with hardware in place uniformly fail" },
          { sev: "warn", text: "**MRSA + Pseudomonas** drive most cases — broaden if culture pending; narrow when speciated" },
          { sev: "note", text: "Mortality 15–30% even with optimal care; long-term sternal instability common" },
        ],
      },
    ],
    "Descending necrotizing": [
      {
        rx: /piperacillin|carbapenem/i,
        pickIf: "Descending necrotizing mediastinitis from oropharyngeal source.",
        whyPick: [
          "**Pip-tazo or carbapenem** — polymicrobial + anaerobes + GNR",
          "**Emergent surgical drainage** — cervical + thoracic exploration mandatory",
          "**Source the oropharynx** — dental, pharyngeal, retropharyngeal abscess; ENT + OMFS",
          "ICU + airway team; tracheostomy often needed",
        ],
        watchOut: [
          { sev: "stop", text: "**Surgery urgent** — mortality high with delay; descending infection can outpace antibiotics" },
          { sev: "warn", text: "**Repeat surgical exploration** until margins clean — necrosis extends through fascial planes silently" },
          { sev: "note", text: "Add clindamycin for streptococcal toxin suppression if polymicrobial with GAS confirmed" },
        ],
      },
    ],
  },

  "mycotic-aneurysm": {
    "Empiric": [
      {
        rx: /vancomycin.*ceftriaxone/i,
        pickIf: "Suspected mycotic aneurysm (S. aureus, strep, Salmonella).",
        whyPick: [
          "**Vancomycin + ceftriaxone** until cultures",
          "**Surgical / endovascular repair** essential — antibiotics alone fail with rupture risk",
          "**Workup endocarditis source** — TEE; embolic disease often the precedent",
        ],
        watchOut: [
          { sev: "stop", text: "**Rupture risk → emergent vascular surgery** — image immediately + vascular consult by hour 1" },
          { sev: "warn", text: "**Salmonella + S. aureus** most common pathogens — broaden coverage if exposure history suggests salmonella" },
          { sev: "note", text: "Long course 6+ weeks IV; suppression decision per ID + vascular surgery if hardware retained" },
        ],
      },
    ],
    "Definitive": [
      {
        rx: /pathogen-?directed|repair/i,
        pickIf: "Organism identified + repair planned.",
        whyPick: [
          "**Pathogen-directed IV therapy + repair** — surgery + antibiotics are non-substitutable",
          "**Long course: 6+ weeks IV** standard; longer if hardware retained or partial repair",
          "**Lifelong oral suppression** if hardware retained or repair contraindicated",
          "Multidisciplinary follow-up — vascular + ID + cardiology",
        ],
        watchOut: [
          { sev: "warn", text: "**Suppression decision per ID + vascular surgery** — case-by-case; quality-of-life vs late infection risk" },
          { sev: "warn", text: "**Repeat imaging at 3–6 months** to monitor graft + adjacent vessels; new fluid collection / pseudoaneurysm is treatment failure" },
          { sev: "note", text: "Surveillance blood cultures monthly during oral suppression in selected cases" },
        ],
      },
    ],
  },

  pid: {
    "Inpatient (severe / TOA)": [
      {
        rx: /ceftriaxone.*doxycycline.*metronidazole/i,
        pickIf: "Severe PID, TOA, or pregnancy / failed outpatient therapy.",
        whyPick: [
          "**Ceftriaxone + doxycycline + metronidazole** — CDC 2021 guideline",
          "**Doxycycline IV** if oral not tolerated; switch to oral when stable",
          "**Drainage** for TOA > 7–8 cm or non-responding at 48–72 h",
          "**14-day total course** — IV-to-PO transition guided by clinical improvement",
        ],
        watchOut: [
          { sev: "warn", text: "**Screen for HIV, syphilis, GC/CT, hepatitis** — treat partners; mandatory STI screen panel" },
          { sev: "warn", text: "**IUD in place** — generally retain unless severe disease or persistent fever > 72 h on therapy" },
          { sev: "note", text: "Long-term sequelae: infertility (12–18% per episode), chronic pelvic pain, ectopic pregnancy 6× baseline risk" },
        ],
      },
    ],
    "Tubo-ovarian abscess": [
      {
        rx: /drainage|abscess/i,
        pickIf: "TOA large (> 7–8 cm) or not responding to antibiotics.",
        whyPick: [
          "**Add drainage** for large or non-responding collections — IR percutaneous first-line",
          "**Surgery for ruptured TOA** — laparoscopic / open exploration emergent",
          "**Image-guided drainage success rate ~70–90%** in unruptured collections — preferred over surgery when feasible",
        ],
        watchOut: [
          { sev: "stop", text: "**Ruptured TOA → surgical emergency** — sepsis + peritonitis; OR within hours" },
          { sev: "warn", text: "**Persistent fever > 72 h** on appropriate antibiotics → reassess for drainage / repeat imaging" },
          { sev: "note", text: "Post-drainage course continues IV until afebrile + WBC normalizing; total 14+ days standard" },
        ],
      },
    ],
  },

  orbital: {
    "Empiric": [
      {
        rx: /vancomycin.*ceftriaxone|ampicillin-?sulbactam|metronidazole/i,
        pickIf: "Orbital cellulitis (vs preseptal) — proptosis, ophthalmoplegia, pain on EOM.",
        whyPick: [
          "**Vancomycin + ceftriaxone (or amp-sulbactam) + metronidazole**",
          "**Emergent CT orbits** — define abscess + sinus source",
          "**ENT consult** for sinus drainage — ethmoid sinusitis classic origin",
          "**Ophthalmology** for vision monitoring + management",
        ],
        watchOut: [
          { sev: "stop", text: "**Vision loss / cavernous sinus extension** — surgical emergency; serial cranial-nerve exam q4h" },
          { sev: "warn", text: "**Pediatric S. pneumoniae / H. flu / S. aureus** dominate; adult adds MRSA, anaerobes, polymicrobial" },
          { sev: "note", text: "Distinguish from preseptal (no proptosis, no EOM pain) — preseptal needs less aggressive therapy" },
        ],
      },
    ],
    "Severe / intracranial extension": [
      {
        rx: /vancomycin.*meropenem/i,
        pickIf: "Orbital infection with intracranial extension or abscess.",
        whyPick: [
          "**Vancomycin + meropenem** (CNS dosing — full strength, no renal reduction for site)",
          "**Emergent ophthalmology + ENT + neurosurgery** consults — all three within hours",
          "**MRI brain + orbits + venogram** — define cavernous sinus involvement + intracranial abscess",
          "Surgical drainage often required — orbital + paranasal sinus + neurosurgical depending on extent",
        ],
        watchOut: [
          { sev: "stop", text: "**Mucormycosis** in diabetic / immunocompromised → amphotericin B + emergent debridement; missed = death" },
          { sev: "warn", text: "**Cavernous sinus thrombosis** complication — anticoagulation decision case-by-case (clot vs bleed)" },
          { sev: "note", text: "Steroid use only for definite mass effect / herniation; otherwise avoid (worsens fungal disease risk)" },
        ],
      },
    ],
  },

  ludwig: {
    "Empiric": [
      {
        rx: /ampicillin-?sulbactam|piperacillin/i,
        pickIf: "Ludwig's angina — bilateral submandibular cellulitis, airway risk.",
        whyPick: [
          "**Amp-sulbactam or pip-tazo** — oral flora coverage (streptococci + anaerobes)",
          "Add **vancomycin** if MRSA risk / immunocompromised / failed prior antibiotics",
          "**Airway management priority** — fiberoptic intubation in OR; never delay airway for imaging",
          "**ENT or OMFS** for drainage + dental source control",
        ],
        watchOut: [
          { sev: "stop", text: "**Airway loss is the killer** — secure early; don't wait for stridor or impending obstruction" },
          { sev: "warn", text: "**Dental abscess source** in 80% — image-search molar teeth; extraction + drainage at same OR visit" },
          { sev: "note", text: "Bilateral submandibular firmness + elevated tongue + drooling triad → operate first, image second" },
        ],
      },
    ],
    "Severe / immunocompromised": [
      {
        rx: /piperacillin.*vancomycin/i,
        pickIf: "Severe Ludwig with sepsis or immunocompromised host.",
        whyPick: [
          "**Pip-tazo + vancomycin** — broader for resistant flora + MRSA",
          "**Emergent ENT / OMFS** for drainage — multi-space involvement requires surgical exploration",
          "**Consider carbapenem** if prior broad β-lactam exposure or ICU substrate",
          "**ICU + airway team** standing by — tracheostomy may be needed",
        ],
        watchOut: [
          { sev: "warn", text: "**Necrotizing soft-tissue extension** — low threshold for surgical exploration + repeated debridement" },
          { sev: "warn", text: "**Mediastinitis** complication — descending necrotizing infection through fascial planes; CT neck + chest at any spread suspicion" },
          { sev: "note", text: "Diabetic + immunocompromised need lower threshold for broad coverage + early imaging extension" },
        ],
      },
    ],
  },

};

/* Look up content for a given option. Returns the matched entry or
   null. The renderer treats null as "no decision content" and renders
   only the drug fragment + route + dose chips. */
function lookupOptionContent(synId, tierLabel, optionText) {
  const tier = REGIMEN_CONTENT[synId]?.[tierLabel];
  if(!tier || !optionText) return null;
  for(const entry of tier) {
    if(entry.rx.test(optionText)) return entry;
  }
  return null;
}

/* Has-content check for the entire tier — used by AnswerCanvas to
   decide whether to suppress the tier-level italic note (which would
   otherwise duplicate per-card content). Returns true if any option
   in the tier has authored content. */
function tierHasContent(synId, tierLabel, rx, splitFn) {
  const tier = REGIMEN_CONTENT[synId]?.[tierLabel];
  if(!tier || !rx || !splitFn) return false;
  const opts = splitFn(rx);
  return opts.some(o => tier.some(entry => entry.rx.test(o.text)));
}

export { REGIMEN_CONTENT, lookupOptionContent, tierHasContent };
