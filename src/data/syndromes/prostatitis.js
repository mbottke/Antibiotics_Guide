/* ===========================================================
   PROSTATITIS — IDSA + AUA. 4 wk acute; 6 wk chronic for
   bacterial prostatitis. Long courses, tissue penetration matter. */

const regimen = {
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
};

const decision = {
  duration: {
    headline: "4 wk acute bacterial prostatitis; 6 wk chronic; FQ or TMP-SMX for prostatic penetration.",
    evidence: "AUA + IDSA — long-course tissue-penetrating agent; FQ resistance rising in community E. coli",
    branches: [
      { label: "Acute bacterial prostatitis", days: "4 wk",
        detail: "Ceftriaxone IV initial → oral FQ or TMP-SMX; long course for prostatic tissue penetration",
        matchAgent: /ciprofloxacin|levofloxacin|TMP-?SMX/i },
      { label: "Chronic bacterial prostatitis", days: "6 wk",
        detail: "Oral FQ or TMP-SMX × 6 wk; recurrence common; ID + urology partnership" },
      { label: "Acute + bacteremia / prostatic abscess", days: "4–6 wk + drainage",
        detail: "IV initial + drainage (transurethral or transrectal); duration from drainage day" },
    ],
    stopWhen: [
      "Symptom resolution (urinary, perineal pain, fever)",
      "Cultures cleared (urine, prostatic secretions)",
      "PSA + WBC normalizing",
      "Tolerating oral therapy",
      "Minimum 4 wk acute / 6 wk chronic completed",
    ],
    extendIf: [
      "Prostatic abscess identified — drainage + extension",
      "Bacteremia or systemic sepsis — extend per source",
      { text: "**Resistant organism** identified — ID + susceptibility-driven extension",
        matchCtx: { esblRisk: true } },
      "Recurrence at < 6 wk post-completion — chronic bacterial prostatitis suspected",
    ],
  },
  monitoring: {
    headline: "Avoid prostatic massage in acute; TRUS for abscess workup; long-course tissue-penetrating agent.",
    items: [
      { sev: "required", what: "**Avoid prostatic massage / instrumentation** in acute disease — bacteremia risk",
        why: "Acute inflammation + massage triggers systemic seeding" },
      { sev: "required", what: "**Tissue-penetrating oral agent** for step-down — FQ or TMP-SMX only",
        why: "β-lactams have poor prostatic penetration; cephalexin / amox-clav inadequate" },
      { sev: "trigger", what: "**Transrectal ultrasound** for abscess workup",
        why: "Prostatic abscess complicates ~10% of acute disease; drainage indication" },
      { sev: "trigger", what: "**Pre- + post-massage urine cultures** in chronic workup",
        why: "Meares-Stamey test localizes infection to prostate vs urethra/bladder" },
      { sev: "trigger", what: "**Urology consult** for chronic, recurrent, or abscess presentations",
        why: "Surgical drainage, transurethral resection considerations" },
      { sev: "consider", what: "**Pelvic floor PT** for chronic prostatitis / pelvic pain syndrome",
        why: "Often non-bacterial; PT + alpha-blockers help when antibiotics inadequate" },
    ],
  },
  rationale: {
    driver: "Acute bacterial prostatitis demands a tissue-penetrating long course because the inflamed prostate transiently admits agents that the chronic gland excludes — fluoroquinolone (ciprofloxacin or levofloxacin) or TMP-SMX for 4 weeks is the AUA / EAU 2024 standard, with IV ceftriaxone initially when bacteremic. β-lactams have poor prostatic penetration once inflammation subsides and are inadequate for step-down (Naber 2008). Chronic disease extends to 6 weeks (Lipsky CID 2010); rising FQ-resistance in community E. coli (> 30% in many U.S. centers) increasingly pushes toward susceptibility-driven TMP-SMX. Prostatic abscess on TRUS triggers drainage plus extended duration; massage in acute disease seeds bacteremia and is contraindicated.",
    guideline: "balance",
    rejected: "Short-course β-lactam regimens were deliberately rejected — cephalexin and amox-clav do not penetrate the chronic prostate, and Lipsky + AUA 2024 anchor FQ or TMP-SMX as the only adequate step-down options. Reflexive empiric FQ without local-antibiogram review was tempered: > 30% FQ-resistance in many U.S. community E. coli isolates now mandates pre-treatment susceptibility-driven choice, and stewardship favors a documented sensitivity before committing to a 4-to-6-week course." },
  objections: [
    { q: "Why oral cephalexin step-down is wrong — it covers E. coli?",
      a: "Cephalexin and amox-clav have poor prostatic-tissue penetration once acute inflammation subsides — Naber 2008 and Lipsky CID 2010 [cite:mono] document subtherapeutic prostatic concentrations and high relapse rates with β-lactam step-down. Only fluoroquinolone (cipro / levo) or TMP-SMX achieve adequate intraprostatic levels for the 4-wk acute and 6-wk chronic courses [cite:balance]. β-lactam step-down here is audit-failed." },
    { q: "Why 4 weeks not 2 — patient feels better?",
      a: "Acute bacterial prostatitis tissue concentration drops as inflammation resolves, and a 2-wk course relapses to chronic disease in 25–50% per Lipsky CID 2010 [cite:mono]. AUA / EAU 2024 anchor 4 wk acute, 6 wk chronic as the standard because relapsed chronic prostatitis is far harder to eradicate. Symptomatic improvement at 2 wk is necessary but not sufficient — the prostate clock is longer than the symptom clock [cite:stew]." },
    { q: "Why avoid prostatic massage in acute disease?",
      a: "Acute prostatic inflammation + mechanical manipulation triggers bacteremia and septic shock — Naber 2008 documents this as a non-negotiable contraindication during the acute phase [cite:mono]. Diagnostic massage (Meares-Stamey 4-glass test) is appropriate only for chronic prostatitis workup once the acute infection has cleared. Defer massage; image with TRUS instead if abscess is suspected." },
  ],
  research: {
    headline: "4 wk acute / 6 wk chronic; FQ + TMP-SMX preferred for prostatic penetration; rising resistance drives empiric pivot.",
    trials: [
      { name: "Naber Int J Antimicrob Agents 2008",
        n: "Cohort",
        question: "Modern prostatitis classification + treatment outcomes",
        finding: "Categories I–IV (NIH); acute bacterial = aggressive; chronic bacterial = long course + tissue-penetrating agent",
        bias: "Pre-modern resistance; FQ-resistant E. coli now > 30% in many U.S. centers" },
      { name: "Lipsky Clin Infect Dis 2010",
        n: "Cohort",
        question: "FQ vs TMP-SMX duration for chronic prostatitis",
        finding: "6 wk vs 4 wk improved cure; rising community FQ resistance affects choice; locally driven antibiogram critical",
        bias: "Heterogeneous baseline severity" },
    ],
    guidelines: [
      { society: "AUA",
        year: 2024,
        topic: "Acute + chronic bacterial prostatitis",
        keypoint: "4 wk acute, 6 wk chronic; FQ or TMP-SMX based on local resistance; urology for chronic / recurrent" },
      { society: "EAU",
        year: 2024,
        topic: "European urological infections",
        keypoint: "Aligned with AUA + IDSA; emphasizes Meares-Stamey localization for chronic workup" },
    ],
    openQuestions: [
      "FQ-resistant prostatitis empiric choice — limited tissue-penetrating alternatives",
      "Optimal duration in chronic + relapsing — case-by-case extension",
      "Prostatic abscess drainage thresholds — > 1 cm typical surgical indication",
    ],
  },
};

export default { id: "prostatitis", regimen, decision };
