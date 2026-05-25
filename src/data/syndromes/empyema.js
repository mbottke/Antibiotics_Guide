/* ===========================================================
   EMPYEMA / COMPLICATED PARAPNEUMONIC EFFUSION — drainage is
   the treatment; antibiotics adjunctive. MIST-2 (intrapleural
   tPA + DNase). 2–4 wk per organism + drainage. ============== */

const regimen = {
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
};

const decision = {
  duration: {
    headline: "2–4 wk total + chest tube drainage ± intrapleural fibrinolytics; longer for cavitary or BPF.",
    evidence: "ACCP 2000 + MIST-2 2011 — tPA + DNase reduces surgery in loculated empyema; duration drainage-anchored, not fixed",
    branches: [
      { label: "Uncomplicated parapneumonic effusion (free-flowing, sterile)", days: "Per CAP / HAP",
        detail: "Per primary pneumonia bands; drainage usually not needed" },
      { label: "Complicated parapneumonic / early empyema (loculated)", days: "2–3 wk + drainage",
        detail: "Chest tube + consider intrapleural tPA / DNase per MIST-2; IV → PO on resolution" },
      { label: "Frank empyema (pus, organisms on Gram stain)", days: "3–4 wk + drainage",
        detail: "Drainage mandatory; surgical decortication if loculated + non-response by 7 d",
        matchAgent: /ampicillin-?sulbactam|piperacillin|ceftriaxone/i },
      { label: "Anaerobic / putrid (poor dentition, aspiration source)", days: "3–4 wk + drainage",
        detail: "Cover anaerobes — metronidazole or clindamycin; drainage + source",
        matchAgent: /metronidazole|clindamycin|amoxicillin-?clavulanate/i },
      { label: "TB empyema / aspergillus / unusual pathogens", days: "Per pathogen",
        detail: "TB ≥ 6 mo; aspergillus per IFI bands; ID-driven" },
    ],
    stopWhen: [
      "Chest tube removed + lung re-expanded",
      "Afebrile ≥ 48 h + WBC normalizing",
      "Imaging shows resolution / stable post-drainage",
      "Oral step-down complete",
      "Minimum 2–4 wk total + drainage criteria met",
    ],
    extendIf: [
      { text: "**Loculated / trapped lung** — extend per drainage + surgical decision",
        matchCtx: { severe: true } },
      "Bronchopleural fistula — extend per thoracic surgery",
      "TB or fungal — per pathogen-specific bands",
      "Inadequate source control — re-drainage or VATS / decortication",
    ],
  },
  monitoring: {
    headline: "Drainage drives outcome; intrapleural tPA + DNase for loculated; thoracic surgery early.",
    items: [
      { sev: "required", what: "**Chest tube drainage** at presentation",
        why: "Source control — antibiotics alone fail in loculated / frank empyema" },
      { sev: "required", what: "**Thoracic surgery consult** at presentation",
        why: "Early VATS / decortication if loculated or non-response by 7 d" },
      { sev: "required", what: "**Pleural fluid culture + Gram stain + pH + glucose + LDH**",
        why: "pH < 7.2, glucose < 40, or positive Gram defines empyema; drives drainage decision" },
      { sev: "trigger", what: "**Intrapleural tPA 10 mg + DNase 5 mg BID × 3 d** for loculated",
        why: "MIST-2 — reduces surgical referral by ~30%; do not use either agent alone" },
      { sev: "trigger", what: "**Repeat imaging at 24–48 h post-drainage** to assess re-expansion",
        why: "Trapped lung or persistent loculation drives surgical escalation" },
      { sev: "trigger", what: "**Avoid aminoglycosides** for primary therapy",
        why: "Inactivated in low-pH pleural pus; poor penetration" },
      { sev: "consider", what: "**Workup TB / fungal** if non-response or atypical presentation",
        why: "TB + aspergillus empyema mimic bacterial; pathogen-specific therapy" },
      { sev: "consider", what: "**Bronchoscopy** if endobronchial obstruction suspected",
        why: "Post-obstructive empyema from tumor / foreign body drives recurrence" },
    ],
  },
  rationale: {
    driver: "Empyema is a source-control disease — chest-tube drainage is the treatment and antibiotics are adjunctive. Empiric ampicillin-sulbactam or ceftriaxone covers community-acquired pleural infection (Strep milleri + oral anaerobes); pip-tazo or cefepime for hospital-acquired. Loculated empyema gets intrapleural tPA 10 mg + DNase 5 mg BID × 3 d per MIST-2 (NEJM 2011) — surgical referral fell from 39% to 16% with the combination. Duration is drainage-anchored (2–4 wk total) and tied to lung re-expansion plus clinical recovery, not a fixed calendar.",
    guideline: "mist2",
    rejected: "Streptokinase alone was deliberately rejected — MIST-1 (NEJM 2005, n=454) showed monotherapy fibrinolytic ineffective vs placebo; only the tPA + DNase combination of MIST-2 produces benefit, and neither agent alone is justified. Aminoglycosides are deliberately avoided for primary pleural therapy because activity is lost in the low-pH purulent space, and antibiotics alone without drainage fail in loculated or frank empyema." },
  objections: [
    { q: "Why drainage first — can antibiotics alone sterilize the pleural space?",
      a: "Empyema is a source-control disease — antibiotics alone fail in loculated or frank pleural infection because the low-pH purulent space inactivates concentration-dependent agents and bacterial burden exceeds antibiotic kill. ACCP 2017 + ATS / IDSA [cite:cap] make chest-tube drainage mandatory at presentation; antibiotics are adjunctive. pH < 7.2, glucose < 40, or positive Gram stain defines the empyema indication for tube placement and triggers the 2-4 wk course." },
    { q: "Why tPA + DNase together — can't a single fibrinolytic suffice?",
      a: "MIST-1 (NEJM 2005) showed streptokinase monotherapy ineffective vs placebo. Only MIST-2 (Rahman NEJM 2011, n=210) [cite:mist2] demonstrated intrapleural tPA 10 mg + DNase 5 mg BID × 3 d reduced surgical referral from 39% to 16% — neither agent alone produces the benefit, the combination is essential. tPA breaks fibrin bands; DNase liquefies viscous purulent material. Surgical decortication remains the rescue for treatment failures." },
    { q: "Why avoid aminoglycoside monotherapy for pleural infection?",
      a: "Aminoglycosides are inactivated in the low-pH purulent pleural space — activity is concentration- and oxygen-dependent, and abscess / empyema environments suppress both. ATS / IDSA [cite:cap] guidance avoids aminoglycoside monotherapy for primary pleural infection; ampicillin-sulbactam, ceftriaxone, or piperacillin-tazobactam penetrate adequately and remain active. Reserve aminoglycosides for synergy with a full systemic backbone, not as primary pleural therapy." },
    { q: "Why early surgical decortication for non-response by 7 d?",
      a: "Failure of chest-tube drainage ± intrapleural tPA + DNase by 7 d signals trapped lung or persistent loculation antibiotics cannot reach — BTS + ATS / IDSA [cite:cap] mandate early VATS / decortication for these substrates. Wait-and-see beyond 7 d compounds re-expansion failure and chronic empyema; early surgery shortens hospitalization and prevents bronchopleural fistula. Thoracic surgery consult is mandated at presentation, not at failure [cite:mist2]." },
  ],
  research: {
    headline: "MIST-2 established intrapleural tPA + DNase combination; drainage drives outcome; surgical decortication for failure.",
    trials: [
      { name: "MIST-2 NEJM 2011 (Rahman)",
        n: "210",
        question: "Intrapleural tPA + DNase vs placebo in pleural infection",
        finding: "Combination reduced surgical referral 16% vs 39% placebo; neither agent alone effective — combination essential",
        bias: "Excluded BPF + trapped lung; single-region trial replicated by smaller cohorts" },
      { name: "MIST-1 NEJM 2005",
        n: "454",
        question: "Streptokinase alone in empyema",
        finding: "Streptokinase alone NOT effective vs placebo; framed need for combination (MIST-2)",
        bias: "Highlighted that monotherapy fibrinolytics inadequate" },
      { name: "Davies BTS 2010",
        n: "Guideline",
        question: "Pleural infection management",
        finding: "Drainage + 2–4 wk antibiotics; early VATS for non-response or trapped lung",
        bias: "Pre-MIST-2 but framework holds" },
    ],
    guidelines: [
      { society: "BTS",
        year: 2010,
        topic: "Pleural infection (Davies)",
        keypoint: "Drainage + antibiotics; intrapleural tPA + DNase per MIST-2 for loculated; surgical decortication for failure" },
      { society: "ACCP",
        year: 2017,
        topic: "American pleural infection",
        keypoint: "Aligned with BTS; emphasizes pH-driven drainage decision (< 7.2 + drainage)" },
    ],
    openQuestions: [
      "Optimal tPA dose + DNase combination — MIST-2 protocol most-replicated",
      "Surgical decortication timing — early (5 d) vs delayed approach debated",
      "Antibiotic duration in drained vs undrained empyema — typically 2–4 wk + cavity resolution",
    ],
  },
};

export default { id: "empyema", regimen, decision };
