/* data · syndromes/cap — community-acquired pneumonia.
   IDSA / ATS 2019 (Metlay). 5 d standard if afebrile + stable +
   tolerating oral; longer for atypicals + complicated cases.

   Migrated from regimenContent.js + syndromeDecision.js in Wave 5
   PR-1 (sentinel pattern). Module shape documented in cystitis.js.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

const regimen = {
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
};

const decision = {
  duration: {
    headline: "5 d standard if afebrile + stable + tolerating oral by 48–72 h; longer for atypicals + complications.",
    evidence: "IDSA / ATS 2019 — 5-day course non-inferior in uncomplicated CAP (Tansarli 2018 meta-analysis)",
    branches: [
      { label: "Uncomplicated CAP, stable + oral", days: "5 d",
        detail: "Counts from first effective dose; criteria for stop are AND-joined (afebrile, oral, stable)" },
      { label: "Severe CAP / ICU + appropriate response", days: "7 d",
        detail: "Extended slightly for ICU substrate; reassess for further extension only on clinical grounds" },
      { label: "Legionella / atypical confirmed", days: "10–14 d",
        detail: "Azithro 5–10 d adequate; FQ 7–14 d standard; longer if immunocompromised",
        matchAgent: /doxycycline/i },
      { label: "Necrotizing / cavitary / abscess", days: "3–6 wk",
        detail: "Treat until radiographic resolution of cavity; drainage if available; oral step-down acceptable" },
    ],
    stopWhen: [
      "Afebrile ≥ 48 h",
      "Stable vitals (RR, HR, SBP normalizing)",
      "Tolerating oral / step-down complete",
      "WBC trending toward normal",
      "Mental status returning to baseline (especially in elderly)",
      "Minimum 5 d completed",
    ],
    extendIf: [
      { text: "**Severe CAP / ICU** at presentation — extend to 7 d minimum",
        matchCtx: { severe: true } },
      { text: "**MRSA / Pseudomonas** identified — extend per pathogen (7–14 d typical)",
        matchCtx: { any: [{ mrsaRisk: true }, { pseudoRisk: true }] } },
      "Cavitary disease, lung abscess, or empyema — 3–6 wk + drainage",
      "Immunocompromised host — extend to 7–10 d minimum",
      "Inadequate response by day 3 — workup for missed pathogen / abscess / wrong drug",
    ],
  },
  monitoring: {
    headline: "Clinical response by 48–72 h; imaging only if non-response; oral step-down when stable.",
    items: [
      { sev: "required", what: "**Clinical reassessment at 48–72 h** — fever, oxygenation, mental status, oral tolerance",
        why: "Non-responders by 72 h require pathogen + diagnosis re-eval, not duration extension alone" },
      { sev: "required", what: "**IV → PO switch** when stable + tolerating oral",
        why: "Earlier step-down reduces line complications + length of stay without affecting outcome" },
      { sev: "trigger", what: "**MRSA nares PCR** if empiric vanco started",
        why: "Negative result enables early vanco stop (NPV ~96% for MRSA pneumonia)",
        matchAgent: /vancomycin|linezolid/i },
      { sev: "trigger", what: "**Repeat imaging** at day 4–7 only if no clinical response",
        why: "Radiographic lag normal; image-driven extension without clinical change rarely helpful" },
      { sev: "trigger", what: "**Hydrocortisone 200 mg/d IV × 4–8 d** for severe CAP without shock — CAPE-COD",
        why: "CAPE-COD NEJM 2023 — 28-d mortality 6.2% vs 11.9%; excludes influenza + immunocompromised + septic shock",
        matchCtx: { severe: true } },
      { sev: "trigger", what: "**Atypical workup** (Legionella urine antigen, mycoplasma PCR) if non-response by 72 h",
        why: "Missed atypical drives empiric β-lactam failure; targeted therapy changes course" },
      { sev: "consider", what: "Procalcitonin trend if duration debate at day 5",
        why: "Falling PCT supports stopping; rising PCT supports re-workup" },
      { sev: "consider", what: "**Influenza / COVID PCR** if seasonally relevant",
        why: "Viral co-infection drives antibiotic non-response; antivirals change course" },
    ],
  },
  rationale: {
    driver: "Most CAP is pneumococcus, H. influenzae, or atypicals — empiric ceftriaxone + azithromycin (or a respiratory FQ) cover this substrate for ward patients; severe / ICU adds MRSA + Pseudomonas only when risk factors are present (recent abx, prior MRSA/Pseudo isolate, structural lung disease). Severe non-influenza CAP also gets hydrocortisone 200 mg/d × 4–8 d (CAPE-COD). The 5-day floor holds when the patient is afebrile + stable + tolerating oral by 48–72 h; complications (cavitation, MRSA, Pseudo) extend duration.",
    guideline: "cap",
    rejected: "Empiric vancomycin is deliberately NOT added in stable CAP — baseline MRSA-pneumonia incidence is < 10% absent recent abx exposure, severe COPD, or known colonization; reflexive vanco invites AKI from the pip-tazo combination without clinical benefit. Routine macrolide combination in non-severe ward CAP was tempered by Postma (NEJM 2015) showing β-lactam alone non-inferior." },
  objections: [
    { q: "Why not narrow to amoxicillin alone — atypical coverage matters?",
      a: "For ward-admitted moderate CAP, β-lactam alone (amoxicillin or ceftriaxone) is non-inferior to β-lactam + macrolide per Postma (NEJM 2015, n=2,283) — most U.S. centers retain the combination only for severe / ICU CAP per IDSA / ATS 2019 [cite:cap]. Atypical coverage matters most in severe disease and confirmed Legionella; routine empiric macrolide adds QTc + GI burden without survival benefit at the moderate severity band." },
    { q: "Why 5 d not 7 d — patient still spiking on day 3?",
      a: "The 5-d floor applies only when AND-joined criteria are met by 48-72 h: afebrile, stable vitals, tolerating oral, WBC trending toward normal. A patient still spiking at day 3 fails the stop criteria and triggers re-workup (missed atypical, abscess, wrong organism, viral co-infection), not reflexive extension. Tansarli (2018 meta, n=5,403) backs 5 d in responders [cite:cap]; non-response is its own pivot point." },
    { q: "Why add steroids in severe CAP without shock?",
      a: "CAPE-COD (NEJM 2023, n=800) showed hydrocortisone 200 mg/d × 4-8 d in severe non-shock CAP reduces 28-d mortality from 11.9% to 6.2% [cite:capecod]. Excludes influenza (signal of harm) and immunocompromised; severe sepsis with shock has its own steroid pathway. The signal is settled enough to apply in severe non-influenza CAP — this is one of the few practice-changing CAP results in a decade." },
    { q: "Why MRSA cover only with risk factors?",
      a: "Baseline MRSA pneumonia incidence is < 10% in CAP absent recent broad antibiotics, severe COPD with prior MRSA, or known nasal colonization — IDSA / ATS 2019 reserves empiric vancomycin for risk-positive substrate [cite:cap]. Reflexive vancomycin invites AKI from the pip-tazo combination without survival benefit; MRSA nares PCR enables 24-48 h vanco stop when negative (NPV ~96% for pneumonia)." },
  ],
  research: {
    headline: "5-day short course is non-inferior in stable patients; severe CAP carries CAPE-COD steroid signal.",
    trials: [
      { name: "Tansarli + Mylonakis 2018",
        n: "Meta (5,403)",
        question: "Short-course (≤ 6 d) vs long-course (≥ 7 d) antibiotics for CAP",
        finding: "Short-course non-inferior for clinical cure + mortality; reduced AE incidence",
        bias: "Pooled heterogeneous severity; severe CAP underrepresented" },
      { name: "CAP-IT NEJM 2021",
        n: "824 children",
        question: "3 d vs 7 d amoxicillin in pediatric CAP",
        finding: "3 d non-inferior to 7 d at the lower clinical-failure margin; supports ultra-short in mild pediatric CAP",
        bias: "Pediatric outpatient cohort; not applicable to adult inpatient or severe disease" },
      { name: "CAPE-COD NEJM 2023",
        n: "800",
        question: "Hydrocortisone in severe CAP",
        finding: "200 mg/d × 4–8 d hydrocortisone reduced 28-d mortality 6% vs 12%; benefit limited to severe non-shock cases",
        bias: "French ICU cohort; excluded influenza + immunocompromised — apply selectively" },
      { name: "FLUOROQUINOLONE-CAP (Postma NEJM 2015)",
        n: "2,283",
        question: "Strategy comparison — β-lactam vs β-lactam+macrolide vs FQ",
        finding: "β-lactam alone non-inferior in moderately severe ward-admitted CAP — supports avoidance of routine macrolide combo in non-severe",
        bias: "Severe / ICU CAP excluded; atypical coverage debate continues" },
    ],
    guidelines: [
      { society: "IDSA / ATS",
        year: 2019,
        topic: "CAP in adults (Metlay)",
        keypoint: "5-day standard; combination β-lactam + macrolide for severe; cover MRSA / Pseudo only if risk factors" },
      { society: "BTS",
        year: 2023,
        topic: "CAP update",
        keypoint: "Aligned with IDSA — emphasizes severity scoring (CURB-65 / SMART-COP) for site-of-care + escalation" },
    ],
    openQuestions: [
      "Routine procalcitonin-guided stopping — meta-analyses show modest LOS benefit; not standard",
      "Glucocorticoid use in severe CAP — CAPE-COD supports; influenza + immunocompromised remain excluded",
      "Atypical coverage in moderate CAP — Postma supports β-lactam alone; many U.S. centers still combine",
    ],
  },
};

export default { id: "cap", regimen, decision };
