/* ===========================================================
   LISTERIOSIS — Listeria monocytogenes; ampicillin + gentamicin
   synergy; pregnancy / neonate / elderly / immunocompromised. = */

const regimen = {
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
};

const decision = {
  duration: {
    headline: "Ampicillin + gentamicin × 21 d (bacteremia) or 21+ d (CNS / endocarditis); TMP-SMX if PCN-allergic.",
    evidence: "IDSA + society consensus — ampicillin synergy with gentamicin; cephalosporins INACTIVE; pregnant + neonate + elderly + immunocompromised",
    branches: [
      { label: "Bacteremia, immunocompetent", days: "14–21 d",
        detail: "Ampicillin 2 g IV q4h × 14–21 d ± gentamicin first 7 d for synergy",
        matchAgent: /ampicillin/i },
      { label: "Meningitis / rhombencephalitis", days: "21+ d",
        detail: "Ampicillin + gentamicin × 21–28 d; longer in rhombencephalitis / brain abscess",
        matchAgent: /gentamicin/i },
      { label: "Endocarditis", days: "4–6 wk",
        detail: "Ampicillin + gentamicin × 4–6 wk; surgical valve replacement common" },
      { label: "Pregnancy (with or without fetal compromise)", days: "14 d",
        detail: "Ampicillin 2 g IV q4h × 14 d; gentamicin avoided if non-bacteremic; neonate workup post-delivery" },
      { label: "PCN allergy (severe)", days: "Per syndrome",
        detail: "TMP-SMX (only alternative with evidence); meropenem alternative; ID-driven",
        matchAgent: /trimethoprim-?sulfamethoxazole|meropenem/i },
    ],
    stopWhen: [
      "Blood cultures cleared",
      "Afebrile + clinical resolution",
      "CSF normalized (if meningitis)",
      "Echo workup completed (if bacteremia)",
      "Pathogen-specific minimum duration met",
    ],
    extendIf: [
      { text: "**Rhombencephalitis / brain abscess** — extend per imaging",
        matchCtx: { severe: true } },
      "Endocarditis confirmed — 4–6 wk + surgery",
      "Immunocompromised — extend per ID + host status",
      "Persistent bacteremia — re-workup + extend",
    ],
  },
  monitoring: {
    headline: "Ampicillin first-line — cephalosporins INACTIVE; LP if any neuro sign; food safety counseling.",
    items: [
      { sev: "required", what: "**Cephalosporins INACTIVE** — replace empiric ceftriaxone with ampicillin",
        why: "Intrinsic cephalosporin resistance; standard ceftriaxone empiric meningitis regimen misses Listeria" },
      { sev: "required", what: "**LP at any neuro sign** — meningitis, headache, altered mental status, ataxia",
        why: "Rhombencephalitis presents with cranial nerve / cerebellar signs; CSF + MRI needed" },
      { sev: "required", what: "**Blood cultures × 2** at presentation",
        why: "Bacteremia common; drives duration + workup" },
      { sev: "trigger", what: "**Add gentamicin for synergy first 7 d** in serious disease",
        why: "Animal + observational data support synergy; balance with nephrotoxicity",
        matchAgent: /gentamicin/i },
      { sev: "trigger", what: "**Public health reporting** — notifiable disease",
        why: "Outbreak investigation + source tracing — deli meats, soft cheese, melons" },
      { sev: "trigger", what: "**Food safety counseling** — pregnant / immunocompromised hosts",
        why: "Avoid deli meats, unpasteurized dairy, soft cheese, melon; reduces recurrence + transmission" },
      { sev: "trigger", what: "**Fetal monitoring + neonate workup** in pregnancy",
        why: "Vertical transmission — neonatal listeriosis high mortality; OB + NICU coordination" },
      { sev: "consider", what: "**Echo for bacteremia** to rule out endocarditis",
        why: "Endocarditis incidence ~7% in listerial bacteremia; drives 4–6 wk + surgery" },
    ],
  },
  rationale: {
    driver: "Listeriosis is a host-restricted disease — pregnant women, neonates, age > 50, and impaired cell-mediated immunity (steroids, TNFi, transplant, hematologic malignancy) carry the entire risk profile, and the empiric meningitis regimen of ceftriaxone + vancomycin MISSES Listeria because cephalosporins are intrinsically inactive. Ampicillin 2 g IV q4h is the backbone (or penicillin G); gentamicin × first 7 d for synergy in serious disease (meningitis, rhombencephalitis, endocarditis) per Mylonakis (Medicine 2002). TMP-SMX or meropenem are the only severe-PCN-allergy alternatives with outcome data. Listeriosis is notifiable — public-health reporting, source tracing (deli meats, soft cheese, melons), and food-safety counseling for pregnant + immunocompromised hosts are part of the bundle.",
    guideline: "mono",
    rejected: "Standard ceftriaxone-based empiric meningitis coverage in patients > 50 or immunocompromised was deliberately rejected — IDSA bacterial meningitis guidance and Mylonakis 2002 both anchor ampicillin add-on in any host with cell-mediated-immunity risk, because cephalosporin-only empirics miss Listeria with mortality cost. Omitting gentamicin in serious or CNS disease was tempered — animal + observational synergy data support first-week add-on despite nephrotoxicity. Stopping ampicillin at 14 d for meningitis or rhombencephalitis was rejected: 21+ d is the minimum, longer for brain abscess or rhombencephalitis confirmed on imaging." },
  objections: [
    { q: "Why ampicillin — not ceftriaxone — for suspected Listeria meningitis?",
      a: "Listeria monocytogenes carries intrinsic resistance to all cephalosporins — the standard empiric meningitis regimen of ceftriaxone + vancomycin MISSES Listeria entirely, and Mylonakis Medicine 2002 [cite:mono] plus IDSA bacterial meningitis guidance anchor ampicillin 2 g IV q4h as the backbone. Add ampicillin empirically in any patient > 50 or with impaired cell-mediated immunity (steroids, TNFi, transplant, hematologic malignancy, pregnancy) — the de Gans NEJM 2002 dexamethasone protocol [cite:degans] explicitly preserves the ampicillin add-on in these substrates." },
    { q: "Why add gentamicin if ampicillin is bactericidal?",
      a: "Mylonakis Medicine 2002 [cite:mono] documents in-vivo synergy and lower relapse with ampicillin + gentamicin in severe listeriosis — meningitis, rhombencephalitis, endocarditis. Animal models show enhanced intracellular killing. Use gentamicin for the first 7 d in serious disease, with renal monitoring + trough levels; nephrotoxicity is real but the synergy data + observational mortality benefit support the trade. PCN-allergic alternative is TMP-SMX (or meropenem) — both with outcome data, neither with the synergy signal." },
    { q: "Why 21+ d for Listeria meningitis — bacterial meningitis is 7–14 d?",
      a: "Standard bacterial meningitis durations (Strep pneumo 10–14 d, Neisseria 7 d) don't generalize to Listeria — the organism is intracellular and the disease is often subacute with brainstem (rhombencephalitis) or brain-abscess components per IDSA bacterial meningitis guidance and Mylonakis 2002 [cite:mono]. Treatment of Listeria meningitis runs 21+ d, often longer for rhombencephalitis or abscess, with stopping gated by imaging response + CSF normalization. The shorter durations risk relapse in this substrate." },
    { q: "Why ampicillin in pregnant patients — cephalosporins are safer category?",
      a: "Pregnancy is one of the defining Listeria substrates — vertical transmission with neonatal listeriosis carries 20–50% mortality, and the empiric meningitis regimen must add ampicillin in any pregnant febrile patient per IDSA bacterial meningitis [cite:mono] and CDC Listeria guidance. Ampicillin has decades of pregnancy-safety data. Cephalosporins are not safer here — they are fundamentally inactive against Listeria. Coordinate with OB + NICU for fetal monitoring and neonatal listeriosis workup post-delivery." },
  ],
  research: {
    headline: "Cephalosporins INACTIVE; ampicillin synergy with gentamicin; outbreak surveillance + food safety counseling.",
    trials: [
      { name: "Mylonakis Medicine 2002",
        n: "Cohort",
        question: "Modern listeriosis outcomes + treatment",
        finding: "Ampicillin first-line with cephalosporin resistance intrinsic; gentamicin synergy in severe / immunocompromised",
        bias: "Pre-PCR diagnostic era; principles validated" },
      { name: "CDC Listeria 2022 surveillance",
        n: "National",
        question: "Source attribution + outbreak patterns",
        finding: "Deli meats + soft cheese + melons + sprouts + pre-cut fruits drive outbreaks; reporting + tracing infrastructure essential",
        bias: "U.S. surveillance; regional variation" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2014,
        topic: "Listeriosis empiric coverage",
        keypoint: "Ampicillin first-line; cephalosporins inactive; meropenem alternative for severe PCN allergy" },
      { society: "CDC",
        year: 2022,
        topic: "Listeria prevention + reporting",
        keypoint: "Notifiable; outbreak investigation + food safety counseling for pregnant + immunocompromised" },
    ],
    openQuestions: [
      "Gentamicin synergy duration — first 7 d standard; balance with nephrotoxicity",
      "TMP-SMX vs meropenem for severe PCN allergy — both supported",
      "Optimal CNS therapy duration — 21+ d standard; longer for rhombencephalitis",
    ],
  },
};

export default { id: "listeria", regimen, decision };
