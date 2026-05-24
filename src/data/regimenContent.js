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
          { sev: "stop", text: "**CrCl < 30** — urine concentration drops below MIC" },
          { sev: "stop", text: "**Pyelonephritis** / fever / flank pain — zero tissue penetration" },
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
          "Oral, narrow-ish spectrum — better stewardship than fluoroquinolones",
          "Useful when nitrofurantoin fails (CrCl < 30) AND TMP-SMX is out",
          "Acceptable in pregnancy across all trimesters",
        ],
        watchOut: [
          { sev: "warn", text: "**Cure rates 5–15 pp lower** than first-line; higher relapse" },
          { sev: "warn", text: "Do **not extend beyond 7 days** — no benefit, amplifies collateral resistance" },
          { sev: "note", text: "Cross-reactivity with **severe** penicillin allergy ~1%; rash alone is not a contraindication" },
          { sev: "note", text: "Promotes **C. difficile** and ESBL selection more than nitrofurantoin / fosfomycin" },
        ],
      },
      {
        rx: /amoxicillin-?clavulanate|augmentin/i,
        pickIf: "Cephalosporins contraindicated and antibiogram supports empiric use.",
        whyPick: [
          "Oral, well-absorbed, covers most community E. coli **when antibiogram allows**",
          "Useful when both cephalosporins and first-line trio are out",
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
          { sev: "note", text: "Cross-reactivity with severe penicillin allergy ~1%" },
          { sev: "warn", text: "Dose-reduce in CrCl < 50 — 1 g q8h or 2 g q12h" },
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
        pickIf: "Confirmed oxacillin-susceptible CoNS.",
        whyPick: [
          "**Cefazolin** when susceptible — narrower, less toxic than vanco",
          "Same MSSA principles apply — cefazolin > nafcillin for non-CNS",
        ],
        watchOut: [
          { sev: "note", text: "Verify susceptibilities on multiple isolates before narrowing" },
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
          "**Amp + ceftriaxone × 6 weeks** — preferred over amp+gent",
          "Equivalent cure, far less renal toxicity",
        ],
        watchOut: [
          { sev: "stop", text: "**HLAR isolates** — amp+ceftriaxone is required (amp+gent ineffective)" },
        ],
      },
    ],
    "Viridans strep": [
      {
        rx: /penicillin|ceftriaxone/i,
        pickIf: "Viridans strep IE — PCN-susceptible.",
        whyPick: [
          "**Penicillin G or ceftriaxone × 4 weeks** for native valve",
          "**2 weeks with gentamicin** for selected uncomplicated cases",
          "Search for colonic source if S. gallolyticus",
        ],
        watchOut: [
          { sev: "note", text: "Tolerance / relative-resistance bands — repeat MIC if non-response" },
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
          "Surgery threshold lower in PVE",
        ],
        watchOut: [
          { sev: "note", text: "Multidisciplinary IE team — surgery + ID + cardiology" },
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
          "Cover age-appropriate flora (enteric vs STI)",
          "**Fournier's risk** if necrotic spread — emergency",
        ],
        watchOut: [
          { sev: "stop", text: "**Fournier's** — emergent surgery + broad coverage" },
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
          "Use 25% albumin (concentrated, low-volume)",
        ],
        watchOut: [
          { sev: "warn", text: "Volume overload — careful in cardiac dysfunction" },
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
          { sev: "note", text: "Routine packing of small abscesses is unnecessary — increases pain without benefit" },
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
          "Add β-lactam (cephalexin) if extensive cellulitis component",
        ],
        watchOut: [
          { sev: "warn", text: "Recurrent abscesses → decolonization (mupirocin nares, chlorhexidine baths)" },
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
          "**Penicillin + clindamycin** — narrow but maintain toxin suppression",
          "**Continue clindamycin** for full toxin-suppression (don't stop early)",
          "**IVIG** for streptococcal TSS — survival benefit",
        ],
        watchOut: [
          { sev: "warn", text: "Don't drop clindamycin until clinically stable + tissue cultures growing only GAS" },
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
          "Short course post-drainage (3–7 d) usually sufficient",
        ],
        watchOut: [
          { sev: "note", text: "Hardware involvement → extended therapy + surgery consult" },
        ],
      },
    ],
    "GI/GU/biliary surgery": [
      {
        rx: /ceftriaxone.*metronidazole|piperacillin/i,
        pickIf: "SSI from contaminated surgery — cover GNR + anaerobes.",
        whyPick: [
          "**Ceftriaxone + metronidazole** OR **pip-tazo**",
          "**Source control** (drainage, washout) drives outcomes",
          "Tailor by cultures of deep tissue / fluid",
        ],
        watchOut: [
          { sev: "warn", text: "Mesh / hardware infections — often need removal" },
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
          "**FQ or TMP-SMX or doxy + metronidazole or clindamycin**",
          "Need two-drug combo to cover Pasteurella + anaerobes adequately",
        ],
        watchOut: [
          { sev: "warn", text: "Doxycycline doesn't cover Eikenella well — combine with metronidazole" },
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
          "**Drainage** (needle or surgical) + anti-staph including MRSA cover",
          "Vancomycin if hospitalized; TMP-SMX or clindamycin PO if outpatient",
        ],
        watchOut: [
          { sev: "warn", text: "Recurrence common — incomplete drainage" },
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
          { sev: "note", text: "Prophylactic penicillin for recurrent leg erysipelas (PATCH trials)" },
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
          "**Cefazolin or antistreptococcal penicillin**",
          "Add MRSA cover **only if purulent**",
        ],
        watchOut: [
          { sev: "note", text: "Sporotrichoid pattern (gardeners) — think Sporothrix; itraconazole" },
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
          "**Wound care + offloading + vascular assessment** drive outcomes",
          "Broaden for deep / limb-threatening infection (pip-tazo + vanco)",
        ],
        watchOut: [
          { sev: "note", text: "Treat infection, not colonization — culture only if clinical signs" },
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
          { sev: "warn", text: "Rifampin only after cultures positive — induces resistance" },
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
          "**Cipro** oral step-down advantage (bone penetration)",
        ],
        watchOut: [
          { sev: "warn", text: "Source: workup UTI / endocarditis as origin" },
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
          { sev: "stop", text: "**Delay in cord-compression** = permanent deficit; surgery NOW" },
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
          "**Ceftriaxone × 7 d** (IV → IM)",
          "Drainage rarely needed — antibiotics alone usually clear",
          "**Treat partner + screen for other STIs** (HIV, syphilis, chlamydia)",
        ],
        watchOut: [
          { sev: "warn", text: "Disseminated gonococcal: tenosynovitis + pustular rash + arthritis triad" },
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
          "**Get 3–5 deep tissue cultures** (incl. sonication if removed) before / during surgery",
          "Surgery strategy (DAIR vs 1-stage vs 2-stage) drives outcomes",
        ],
        watchOut: [
          { sev: "warn", text: "**Antibiotics before sampling halve yield** — coordinate with surgery" },
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
          { sev: "warn", text: "**MRI** to define collection — exam often misses early disease" },
        ],
      },
    ],
    "Directed (MSSA)": [
      {
        rx: /cefazolin|nafcillin/i,
        pickIf: "MSSA confirmed pyomyositis.",
        whyPick: [
          "**Cefazolin** — narrow, BID, lower toxicity",
          "2–4 week course depending on collection size + clinical response",
        ],
        watchOut: [
          { sev: "note", text: "Image at 2 wk if clinical plateau" },
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
          "**Add ampicillin 2 g IV q4h** for Listeria",
          "Listeria invariably resistant to cephalosporins",
          "**TMP-SMX alternative** for severe PCN allergy",
          "All other agents (ceftriaxone, vanco, dex) per standard meningitis",
        ],
        watchOut: [
          { sev: "warn", text: "**Listeria + cephalosporin alone = treatment failure**" },
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
          "**Intraventricular vancomycin** 10–20 mg daily, or aminoglycoside",
          "Coordinate with neurosurgery for delivery",
        ],
        watchOut: [
          { sev: "warn", text: "Intraventricular dosing requires careful technique + concentration control" },
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
          "**Add ampicillin** for Listeria",
          "**Add high-dose TMP-SMX** for Nocardia",
          "Workup HIV, transplant, chronic steroid",
        ],
        watchOut: [
          { sev: "note", text: "Nocardia long course — 6–12 months; ID consult" },
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
          "**Emergent MRI** of entire spine — skip lesions common",
          "**Surgical decompression** for deficit or non-improvement",
          "6 weeks IV typical",
        ],
        watchOut: [
          { sev: "stop", text: "**Neurologic deficit = surgical emergency** — delay risks permanent paraplegia" },
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
          "**Vancomycin + ceftriaxone (or cefepime) + metronidazole**",
          "**Neurosurgical drainage** is the treatment",
          "Source control — sinus / ear / dental",
          "Long course: 4–6 weeks",
        ],
        watchOut: [
          { sev: "stop", text: "**Drainage emergency** — mass effect + herniation risk" },
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
          "**Remove hardware / repair CSF leak**",
          "Common organisms: CoNS, S. aureus, Pseudomonas, Acinetobacter",
        ],
        watchOut: [
          { sev: "warn", text: "Cefepime neurotoxicity in renal impairment" },
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
          "**Anticoagulation** controversial — selective use",
          "Source workup — sinusitis, dental, facial cellulitis",
          "**ENT / neurosurgery** consult immediately",
        ],
        watchOut: [
          { sev: "stop", text: "**Mucormycosis** in diabetic / immunocompromised — amphotericin + emergent debridement" },
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
          "**Externalize or remove the shunt** — definitive",
          "**Intraventricular vancomycin** if refractory",
          "Long course depends on organism + hardware management",
        ],
        watchOut: [
          { sev: "note", text: "CoNS most common — biofilm renders salvage difficult without explant" },
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
          "**Vancomycin + clindamycin ± β-lactam**",
          "**Clindamycin suppresses toxin** — keep until source confirmed",
          "**Source control** — remove tampon, drain, debride",
          "**IVIG** for streptococcal TSS — mortality benefit",
        ],
        watchOut: [
          { sev: "stop", text: "Source removal delayed → shock persists" },
        ],
      },
    ],
    "Directed (GAS)": [
      {
        rx: /penicillin.*clindamycin/i,
        pickIf: "Streptococcal TSS confirmed.",
        whyPick: [
          "**Penicillin + clindamycin × 14 d** — combined cidal + toxin suppression",
          "**IVIG 1–2 g/kg** day 1 (consider repeat)",
        ],
        watchOut: [
          { sev: "note", text: "Notify ICU + ID early — high mortality despite optimal therapy" },
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
          "**SURGERY NOW** — debridement / amputation",
          "Hyperbaric oxygen adjunctive (not delay surgery)",
        ],
        watchOut: [
          { sev: "stop", text: "**Surgery is the treatment** — antibiotics alone fail" },
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
          "**Metronidazole 500 mg IV q8h × 7–10 d**",
          "**Tetanus immune globulin (TIG)** + tetanus vaccine are primary",
          "**Wound debridement** essential",
          "ICU for autonomic + muscular control",
        ],
        watchOut: [
          { sev: "note", text: "Vaccinate post-recovery — tetanus does not confer immunity" },
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
          { sev: "stop", text: "**Antibiotics in infant botulism** can worsen disease (toxin release)" },
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
          "**Cefepime 2 g IV q8h** — pseudomonal cover, narrow vs carbapenem",
          "Stop at 48 h if afebrile + ANC recovering + cultures negative",
        ],
        watchOut: [
          { sev: "warn", text: "Cefepime neurotoxicity if renal-dose missed" },
        ],
      },
      {
        rx: /piperacillin/i,
        pickIf: "Mucositis or typhlitis — anaerobic cover advantageous.",
        whyPick: [
          "**Adds anaerobic cover** — useful in mucositis / typhlitis",
          "Single-agent broad coverage",
        ],
        watchOut: [
          { sev: "warn", text: "Pip-tazo + vanco AKI signal" },
        ],
      },
      {
        rx: /meropenem/i,
        pickIf: "Prior ESBL, recent broad β-lactam, or critically ill.",
        whyPick: [
          "**ESBL workhorse**",
          "Broad single agent",
        ],
        watchOut: [
          { sev: "warn", text: "Promotes CRE — narrow ASAP" },
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
          "**Stop within 48 h** if cultures negative",
        ],
        watchOut: [
          { sev: "warn", text: "Aminoglycoside duration > 72 h → nephrotoxicity rises" },
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
          "Supportive care + bowel rest",
          "**Surgery threshold** — perforation, persistent bleeding, abscess",
        ],
        watchOut: [
          { sev: "warn", text: "**Differentiate from C. diff** — overlap in symptoms; test stool" },
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
          "**TMP-SMX** orally for 6–12 months",
          "**Linezolid** alternative (but expensive + long-term toxicity)",
        ],
        watchOut: [
          { sev: "warn", text: "Linezolid > 1 month — cytopenias, neuropathy" },
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
          "**Ampicillin 2 g IV q4h × ≥21 d** (longer for CNS)",
          "Add **gentamicin** for synergy in severe disease (controversial)",
          "Workup immunocompromise + pregnancy",
        ],
        watchOut: [
          { sev: "warn", text: "**Cephalosporins inactive** — never use alone" },
        ],
      },
    ],
    "Severe penicillin allergy": [
      {
        rx: /TMP-?SMX/i,
        pickIf: "Listeria with severe penicillin allergy.",
        whyPick: [
          "**High-dose TMP-SMX 5 mg/kg IV q6h**",
          "Limited data but the alternative",
        ],
        watchOut: [
          { sev: "warn", text: "Hyperkalemia, AKI — monitor" },
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
          "**Amp-sulbactam or pip-tazo** standard",
          "**Carbapenem** for severe sepsis",
          "**Mortality high** in asplenic — emergency",
        ],
        watchOut: [
          { sev: "stop", text: "**DIC + purpura fulminans** — fast supportive care" },
        ],
      },
    ],
  },

  "neutropenic-pna": {
    "Bacterial empiric": [
      {
        rx: /antipseudomonal|vancomycin/i,
        pickIf: "Pneumonia in neutropenic patient.",
        whyPick: [
          "**Antipseudomonal β-lactam + vancomycin** if MRSA risk",
          "**Workup fungal** (Aspergillus, Mucor) and viral (CMV, RSV) — broad workup",
          "Consider PJP if HIV / steroid + acute hypoxia + bilateral diffuse",
        ],
        watchOut: [
          { sev: "warn", text: "Workup fungal early — biomarkers (galactomannan, β-D-glucan) + chest CT" },
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
          "**Ceftriaxone 2 g IV** at triage",
          "Add vancomycin if meningitis suspected",
          "**Standing prescription** at home for self-administration during fever",
        ],
        watchOut: [
          { sev: "stop", text: "Don't wait for cultures" },
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
          "**Treat the characteristic pathogens** for the defect",
          "**CGD** — Staph, Burkholderia, Aspergillus, Nocardia",
          "**Hypogammaglobulinemia** — encapsulated organisms",
          "ID consult — disease-specific guidance",
        ],
        watchOut: [
          { sev: "warn", text: "**Burkholderia cepacia in CGD** — multi-drug resistant; treat aggressively" },
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
          "**One active antipseudomonal agent** — equivalent to combination therapy",
          "Cefepime, pip-tazo, meropenem, or ceftaz — pick by site + susceptibility",
          "**Extended-infusion β-lactam** improves PK/PD",
          "**Combination unnecessary** in most cases (no mortality benefit over monotherapy)",
        ],
        watchOut: [
          { sev: "warn", text: "**Persistence** → search source; consider second agent for synergy" },
        ],
      },
    ],
    "DTR-Pseudomonas": [
      {
        rx: /ceftolozane|ceftazidime-?avibactam|imipenem-?relebactam/i,
        pickIf: "Difficult-to-treat Pseudomonas (resistant to all 1st-line antipseudomonals).",
        whyPick: [
          "**Ceftolozane-tazo** — first-choice DTR-Pseudomonas",
          "**Ceftaz-avi or imipenem-relebactam** alternatives by mechanism",
          "**Cefiderocol** salvage for ceftolozane-resistant",
          "**ID consult mandatory** — match drug to resistance mechanism",
        ],
        watchOut: [
          { sev: "warn", text: "**Cost ~$1k+/day** — stewardship review" },
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
          "**Pip-tazo or carbapenem** — covers all three classes",
          "**Source control** drives outcomes — find the gut perforation",
          "Tailor to cultures once back",
        ],
        watchOut: [
          { sev: "warn", text: "Surgery consult if source not obvious — perforation often subtle on initial imaging" },
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
          "**Penicillin G or ceftriaxone** — narrow + cheap",
          "Workup endocarditis for viridans / S. gallolyticus",
          "**S. gallolyticus → colonoscopy** for colon cancer",
        ],
        watchOut: [
          { sev: "note", text: "GAS bacteremia → workup for necrotizing infection / TSS" },
        ],
      },
    ],
    "Severe / toxic (group A)": [
      {
        rx: /penicillin.*clindamycin/i,
        pickIf: "Severe GAS bacteremia, TSS, or necrotizing soft-tissue source.",
        whyPick: [
          "**Penicillin + clindamycin** — cidal + toxin suppression",
          "**IVIG** for confirmed streptococcal TSS",
          "Source control — debridement if NF",
        ],
        watchOut: [
          { sev: "stop", text: "**Surgical source control** drives mortality more than antibiotics" },
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
          "Workup endocarditis — TEE",
        ],
        watchOut: [
          { sev: "warn", text: "Device retention rarely succeeds outside CoNS with stable patient + lock therapy" },
        ],
      },
    ],
    "Definitive": [
      {
        rx: /removal|hardware|rifampin/i,
        pickIf: "Confirmed device infection — complete removal preferred.",
        whyPick: [
          "**Complete device removal** + pathogen-directed therapy",
          "**Rifampin** for staph if hardware MUST be retained",
          "Long course post-removal: 2–6 weeks by organism + complications",
        ],
        watchOut: [
          { sev: "warn", text: "Rifampin interactions + never as monotherapy" },
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
          "**Amp-sulbactam, pip-tazo, or carbapenem** — covers Fusobacterium + anaerobes",
          "**Long course 4–6 weeks** IV",
          "Anticoagulation controversial — case-by-case",
          "Workup metastatic septic emboli — lung, joint, brain",
        ],
        watchOut: [
          { sev: "warn", text: "Septic pulmonary emboli common — get CT chest" },
        ],
      },
    ],
    "Penicillin allergy": [
      {
        rx: /carbapenem|metronidazole.*cephalosporin/i,
        pickIf: "Lemierre's with severe penicillin allergy.",
        whyPick: [
          "**Carbapenem** OR **metronidazole + 3rd-gen cephalosporin**",
        ],
        watchOut: [
          { sev: "note", text: "Clindamycin alternative but resistance rising in Fusobacterium" },
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
          "**Vitrectomy** if vision worse than hand-motion (EVS criteria)",
          "**Get cultures** from vitreous tap before drug administration",
        ],
        watchOut: [
          { sev: "stop", text: "**Time = vision** — call ophthalmology immediately" },
        ],
      },
    ],
    "Endogenous / systemic": [
      {
        rx: /systemic.*vancomycin|antipseudomonal/i,
        pickIf: "Endogenous endophthalmitis from bloodstream source.",
        whyPick: [
          "**Systemic vancomycin + antipseudomonal β-lactam**",
          "**Treat the bloodstream source** — K. pneumoniae liver abscess classic",
          "Antifungal (echinocandin) for Candida endophthalmitis",
        ],
        watchOut: [
          { sev: "warn", text: "**Workup K. pneumoniae liver abscess** — classic source" },
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
          "**Vancomycin + antipseudomonal β-lactam**",
          "**Surgical debridement + sternal closure / flap** drives outcomes",
          "Long course: 4–6 weeks IV",
        ],
        watchOut: [
          { sev: "stop", text: "Surgical debridement is the treatment — antibiotics adjunctive" },
        ],
      },
    ],
    "Descending necrotizing": [
      {
        rx: /piperacillin|carbapenem/i,
        pickIf: "Descending necrotizing mediastinitis from oropharyngeal source.",
        whyPick: [
          "**Pip-tazo or carbapenem** — polymicrobial + anaerobes",
          "**Emergent surgical drainage** — cervical + thoracic",
        ],
        watchOut: [
          { sev: "stop", text: "Surgery urgent — mortality high with delay" },
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
          "**Surgical / endovascular repair** essential",
          "Workup endocarditis source",
        ],
        watchOut: [
          { sev: "stop", text: "Rupture risk → emergent vascular surgery" },
        ],
      },
    ],
    "Definitive": [
      {
        rx: /pathogen-?directed|repair/i,
        pickIf: "Organism identified + repair planned.",
        whyPick: [
          "**Pathogen-directed IV therapy + repair**",
          "Long course: 6+ weeks IV",
          "Lifelong oral suppression if hardware retained",
        ],
        watchOut: [
          { sev: "warn", text: "Suppression decision per ID + vascular surgery" },
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
          "**Ceftriaxone + doxycycline + metronidazole** — CDC 2021",
          "**Doxycycline IV** if oral not tolerated; switch to oral when stable",
          "**Drainage** for TOA > 7–8 cm or non-responding",
          "**14-day total course**",
        ],
        watchOut: [
          { sev: "warn", text: "Screen for HIV, syphilis, GC/CT — treat partners" },
          { sev: "note", text: "Long-term sequelae: infertility, chronic pain, ectopic pregnancy" },
        ],
      },
    ],
    "Tubo-ovarian abscess": [
      {
        rx: /drainage|abscess/i,
        pickIf: "TOA large (> 7–8 cm) or not responding to antibiotics.",
        whyPick: [
          "**Add drainage** for large or non-responding collections",
          "Surgery for ruptured TOA",
        ],
        watchOut: [
          { sev: "stop", text: "Ruptured TOA → surgical emergency" },
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
          "**ENT consult** for sinus drainage",
          "**Ophthalmology** for vision monitoring",
        ],
        watchOut: [
          { sev: "stop", text: "**Vision loss / cavernous sinus extension** — surgical emergency" },
        ],
      },
    ],
    "Severe / intracranial extension": [
      {
        rx: /vancomycin.*meropenem/i,
        pickIf: "Orbital infection with intracranial extension or abscess.",
        whyPick: [
          "**Vancomycin + meropenem** (CNS dosing)",
          "**Emergent ophthal + ENT + neurosurgery**",
        ],
        watchOut: [
          { sev: "stop", text: "Mucormycosis in diabetic — amphotericin + debridement" },
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
          "**Amp-sulbactam or pip-tazo** — oral flora coverage",
          "Add **vancomycin** if MRSA risk / immunocompromised",
          "**Airway management priority** — fiberoptic intubation in OR",
          "**ENT or OMFS** for drainage",
        ],
        watchOut: [
          { sev: "stop", text: "**Airway loss is the killer** — secure early; don't wait for stridor" },
        ],
      },
    ],
    "Severe / immunocompromised": [
      {
        rx: /piperacillin.*vancomycin/i,
        pickIf: "Severe Ludwig with sepsis or immunocompromised host.",
        whyPick: [
          "**Pip-tazo + vancomycin** — broader for resistant flora",
          "**Emergent ENT / OMFS** for drainage",
        ],
        watchOut: [
          { sev: "warn", text: "Necrotizing soft-tissue extension — surgical exploration low threshold" },
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
