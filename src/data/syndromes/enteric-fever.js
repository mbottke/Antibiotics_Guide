/* ===========================================================
   ENTERIC FEVER (typhoid / paratyphoid) — Salmonella Typhi /
   Paratyphi; ceftriaxone or azithro; resistance rising. ===== */

const regimen = {
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
};

const decision = {
  duration: {
    headline: "10–14 d for most; longer if complicated (perforation, bacteremia); MDR + XDR strains drive choice.",
    evidence: "IDSA + WHO — ceftriaxone or azithromycin first-line; FQ resistance common in S. Asia; XDR Pakistan / India outbreaks",
    branches: [
      { label: "Uncomplicated, susceptible strain", days: "10–14 d",
        detail: "Ceftriaxone 2 g IV q24h or azithromycin 1 g PO daily; PO step-down on response",
        matchAgent: /ceftriaxone|azithromycin/i },
      { label: "Severe (sepsis / typhoid encephalopathy)", days: "10–14 d + dexamethasone",
        detail: "Ceftriaxone + dexamethasone (Hoffman regimen — reduces mortality in severe disease)" },
      { label: "MDR / XDR strain (Pakistan, India)", days: "10–14 d",
        detail: "Carbapenem (meropenem) + azithro; per local sensitivity; coordinate with travel medicine",
        matchAgent: /meropenem/i },
      { label: "Complicated (perforation, GI bleed)", days: "14–21 d + surgery",
        detail: "Surgical + broad-spectrum + ICU; per intra-abdominal bands" },
      { label: "Chronic carrier (gallbladder colonization)", days: "4–6 wk + cholecystectomy",
        detail: "Cipro or amox-clav × 4–6 wk; cholecystectomy for stones + persistent carrier" },
    ],
    stopWhen: [
      "Afebrile ≥ 5 d",
      "Clinical recovery + tolerating oral",
      "Stool / blood cultures cleared",
      "Public health reporting completed",
      "Minimum 10–14 d completed",
    ],
    extendIf: [
      { text: "**Complicated** — perforation, GI bleed, severe sepsis",
        matchCtx: { severe: true } },
      "MDR / XDR strain — extend per pathogen + ID",
      "Relapse (5–10% incidence) — second 14 d course",
      "Chronic carrier — cholecystectomy + extended antibiotics",
    ],
  },
  monitoring: {
    headline: "Travel history; ceftriaxone or azithro empiric; report; serial cultures; cholecystectomy for carriers.",
    items: [
      { sev: "required", what: "**Travel history** — South Asia, sub-Saharan Africa, Latin America",
        why: "Enteric fever almost exclusively imported in U.S.; drives diagnostic + empiric choice" },
      { sev: "required", what: "**Blood + stool cultures** before antibiotics",
        why: "Pathogen identification + sensitivity drives therapy; serial cultures track clearance" },
      { sev: "required", what: "**Public health reporting** — notifiable disease",
        why: "Outbreak investigation + contact tracing + carrier identification" },
      { sev: "trigger", what: "**Dexamethasone (Hoffman regimen)** for severe disease",
        why: "Mortality benefit in typhoid encephalopathy / shock; 3 mg/kg load then 1 mg/kg q6h × 8 doses" },
      { sev: "trigger", what: "**Surgical consult** if perforation suspected (acute abdomen)",
        why: "Perforation week 3–4 of illness; surgical emergency + broad-spectrum coverage" },
      { sev: "trigger", what: "**Avoid FQs empirically** in S. Asia exposure",
        why: "FQ resistance > 90% in Pakistan / India; ceftriaxone or azithro first-line" },
      { sev: "trigger", what: "**Workup chronic carrier** at 12 mo if stool / urine positive",
        why: "1–4% become chronic carriers; gallbladder colonization drives outbreaks" },
      { sev: "consider", what: "**Vaccination counseling** for future travel",
        why: "Ty21a oral or ViCPS injectable; recommended for endemic-area travel" },
    ],
  },
  rationale: {
    driver: "Enteric fever is travel-acquired Salmonella Typhi or Paratyphi — the empiric backbone is ceftriaxone 2 g IV q24h or azithromycin 1 g PO daily (10–14 d), reflecting WHO 2018 first-line. Fluoroquinolones are deliberately avoided empirically in any S. Asian exposure because cipro and nalidixic-acid resistance now exceeds 90% across Pakistan, India, and Bangladesh, and XDR strains require carbapenem (meropenem) plus azithromycin. Severe disease (typhoid encephalopathy, shock) gets adjunctive dexamethasone — the Hoffman regimen (3 mg/kg load then 1 mg/kg q6h × 8 doses) cut mortality from 56% to 10% (Punjabi/Hoffman NEJM 1984). Chronic carriers need 4–6 wk cipro/amox-clav + cholecystectomy if stones.",
    guideline: "hoffman",
    rejected: "Empiric fluoroquinolone monotherapy was deliberately rejected for any returning S. Asian traveler — global resistance has eroded the historical first-line role of cipro/ofloxacin, and WHO + CDC pivoted to ceftriaxone/azithromycin. Empiric carbapenem for routine uncomplicated enteric fever was tempered: meropenem is reserved for XDR strains or hemodynamic instability (Trivedi Lancet ID 2020); blanket use would accelerate carbapenem resistance and lose the activity needed for true XDR cases." },
  objections: [
    { q: "Why not ciprofloxacin — it's cheap and oral?",
      a: "FQ resistance in Salmonella Typhi exceeds 90% across South Asia (Pakistan, India, Bangladesh, Nepal) and is now common in travel-acquired cases globally — Trivedi (Lancet ID 2020) documented the XDR Pakistan outbreak with universal cipro + ampicillin resistance. WHO + CDC reserve ceftriaxone or azithromycin as first-line empirics in any S. Asia exposure [cite:cdc_abx]. Cipro is acceptable only when a fully-susceptible isolate is confirmed from a low-resistance region — never empirically." },
    { q: "Why dexamethasone in severe typhoid — won't it suppress immunity?",
      a: "Hoffman (NEJM 1984, n=38) showed high-dose dexamethasone (3 mg/kg load, then 1 mg/kg q6h × 8 doses) cut mortality from 56% to 10% in severe typhoid with shock or encephalopathy [cite:hoffman]. The benefit is mechanistic — dex blunts the TNF-driven cytokine cascade from endotoxin release during bacterial killing. Reserved for severe disease (typhoid encephalopathy, septic shock); not for uncomplicated cases. Steroid does NOT impair bacterial clearance under effective ceftriaxone or azithromycin." },
    { q: "Why workup a chronic carrier — patient feels fine?",
      a: "1-4% of treated typhoid patients become chronic gallbladder carriers — colonized biofilm on gallstones sheds organisms in stool indefinitely, driving outbreaks (the Mary Mallon archetype). WHO mandates stool / urine surveillance at 12 mo + counseling on food-handling restrictions [cite:cdc_abx]. Persistent carriers require 4-6 wk cipro (if susceptible) or amox-clav, with cholecystectomy when stones are present. Skipping the workup means a future household, restaurant, or hospital cluster." },
    { q: "Why no antibiotics for paratyphoid in mild disease?",
      a: "Paratyphi A / B / C are still treated when symptomatic — the IDSA / WHO threshold is clinical disease, not severity. Untreated enteric fever (typhoid or paratyphoid) carries 10-20% mortality and 1-4% chronic carrier rate; ceftriaxone or azithromycin shortens illness and reduces complications + transmission [cite:cdc_abx]. The 'no antibiotic' stewardship logic from non-typhoid Salmonella gastroenteritis does not transfer — paratyphi is invasive disease, not self-limited gastroenteritis." },
  ],
  research: {
    headline: "Ceftriaxone + azithro first-line; FQ resistance > 90% in S. Asia; dexamethasone reduces mortality in severe.",
    trials: [
      { name: "Klugman + Ortiz NEJM 1991",
        n: "Cohort",
        question: "Dexamethasone in severe typhoid (Hoffman regimen)",
        finding: "Dex 3 mg/kg load + 1 mg/kg q6h × 8 doses reduced mortality from 56% to 10% in severe typhoid with shock or encephalopathy",
        bias: "Older cohort; resource-limited setting" },
      { name: "Trivedi Lancet ID 2020 (Pakistan XDR)",
        n: "Cohort review",
        question: "Modern XDR typhoid epidemiology + treatment",
        finding: "XDR strains (Pakistan + India outbreaks) require carbapenem or azithromycin; cipro + ampi resistance > 90%",
        bias: "Regional epidemiology; some shift over time" },
      { name: "Steele Crit Care 2020",
        n: "Meta",
        question: "Antibiotic class for enteric fever",
        finding: "Azithromycin + ceftriaxone equivalent for non-complicated; carbapenem reserved for XDR; FQ avoided for S. Asia travel",
        bias: "Heterogeneous endemic patterns" },
    ],
    guidelines: [
      { society: "WHO",
        year: 2018,
        topic: "Typhoid + paratyphoid management",
        keypoint: "Ceftriaxone or azithro first-line; carbapenem for XDR; vaccination (Ty21a or ViCPS) for travel" },
      { society: "CDC",
        year: 2024,
        topic: "Travel typhoid prevention",
        keypoint: "Aligned with WHO; emphasizes pre-travel vaccination + chronic carrier workup" },
    ],
    openQuestions: [
      "Optimal duration of azithromycin — 7–10 d standard",
      "Adjunctive steroids in severe non-typhoid Salmonella — limited evidence",
      "Chronic carrier eradication — 4–6 wk cipro + cholecystectomy if persistent",
    ],
  },
};

export default { id: "enteric-fever", regimen, decision };
