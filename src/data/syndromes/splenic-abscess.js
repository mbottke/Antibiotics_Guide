/* ===========================================================
   SPLENIC ABSCESS — rare; bacteremic seeding; drainage +
   splenectomy + broad antibiotics; high mortality. =========== */

const regimen = {
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
};

const decision = {
  duration: {
    headline: "4–6 wk IV + drainage / splenectomy; broad initial then narrow; high mortality without source control.",
    evidence: "Society consensus — splenectomy or percutaneous drainage drives outcome; antibiotic alone fails; bacteremic seeding common",
    branches: [
      { label: "Bacterial (S. aureus, Strep, enteric GNR)", days: "4–6 wk + drainage",
        detail: "Per pathogen; vancomycin + ceftriaxone or pip-tazo empiric; surgical or IR drainage",
        matchAgent: /piperacillin|ceftriaxone|vancomycin/i },
      { label: "Salmonella (immunocompromised, HIV)", days: "4–6 wk",
        detail: "Ceftriaxone or cipro per sensitivity; HIV workup + extended course",
        matchAgent: /ciprofloxacin/i },
      { label: "Candida (fungemia, immunocompromised)", days: "6 wk + drainage",
        detail: "Echinocandin then fluconazole per sensitivity; per IFI bands",
        matchAgent: /caspofungin|fluconazole|micafungin/i },
      { label: "Endocarditis source", days: "Per IE bands + abscess",
        detail: "Per IE bands for total duration; drainage + splenectomy" },
      { label: "Splenectomy required", days: "2 wk post-op",
        detail: "When IR drainage fails or splenic preservation infeasible; broad coverage post-op per source" },
    ],
    stopWhen: [
      "Drainage / splenectomy complete",
      "Blood cultures cleared",
      "Afebrile + clinical recovery",
      "Imaging shows resolution",
      "Pathogen-specific minimum 4–6 wk completed",
    ],
    extendIf: [
      { text: "**Inadequate drainage** — surgical splenectomy + extend",
        matchCtx: { severe: true } },
      "Endocarditis source — per IE bands",
      "Immunocompromised host — extend per ID",
      "Fungal pathogen — per IFI bands",
    ],
  },
  monitoring: {
    headline: "IR or surgical drainage drives outcome; broad initial then narrow; OPSI ppx after splenectomy.",
    items: [
      { sev: "required", what: "**IR or surgical drainage** at presentation",
        why: "Source control — antibiotic alone fails; percutaneous preferred if amenable" },
      { sev: "required", what: "**Blood cultures × 2 + abscess culture**",
        why: "Pathogen identification drives narrowing; bacteremic seeding common" },
      { sev: "required", what: "**CT abdomen with contrast** at presentation",
        why: "Defines extent + multiple loci + drainage planning" },
      { sev: "trigger", what: "**Echo (TEE)** if S. aureus or Strep — rule out endocarditis",
        why: "Splenic abscess + bacteremic substrate; IE source workup mandatory" },
      { sev: "trigger", what: "**HIV workup + immune workup** for Salmonella",
        why: "Salmonella splenic abscess marker for cellular immune compromise" },
      { sev: "trigger", what: "**Splenectomy** if IR drainage fails or multiloculated",
        why: "Definitive source control; post-op OPSI prophylaxis required" },
      { sev: "trigger", what: "**Post-splenectomy vaccination + standby antibiotic** (OPSI ppx)",
        why: "Per asplenia-prophylaxis bands; pneumococcal + meningococcal + Hib + amoxicillin" },
      { sev: "consider", what: "**Workup endovascular focus** if persistent bacteremia",
        why: "Mycotic aneurysm + IE + line infection drive recurrence" },
    ],
  },
  rationale: {
    driver: "Splenic abscess is rare, high-mortality (14–47%), and most often arises from bacteremic seeding — antibiotic therapy alone fails, and percutaneous or surgical drainage drives outcome (Lardiere 2009: PCD first-line for unilocular ≥ 5 cm, splenectomy for multiloculated or PCD failure). Empirics cover S. aureus + streptococcus + enteric GNR — pip-tazo or ceftriaxone + vancomycin — and narrow on abscess + blood culture for a 4–6 wk total course. Bacteremic S. aureus or strep mandates TEE to exclude IE as a source. Salmonella splenic abscess flags cell-mediated immune compromise → HIV workup. Post-splenectomy OPSI prophylaxis (pneumococcal + meningococcal + Hib vaccines + standby amoxicillin) is non-negotiable.",
    guideline: "stopit",
    rejected: "Empiric splenectomy as first-line was deliberately rejected — percutaneous drainage is appropriate for unilocular accessible collections ≥ 5 cm, preserves the spleen, and avoids the lifelong OPSI risk that comes with asplenia. Antibiotic-only management of an organized splenic abscess was rejected outright: mortality without source control is unacceptably high, and antibiotics alone cannot sterilize a contained collection — drainage is non-negotiable." },
  objections: [
    { q: "Why PCD first — splenectomy is definitive source control?",
      a: "Lardiere (World J Surg 2009) established percutaneous drainage first-line for accessible unilocular splenic abscesses ≥ 5 cm — preserves the spleen, avoids the lifelong OPSI risk of asplenia [cite:bisharat], and pairs with 4–6 wk targeted antibiotics for durable cure. Splenectomy is reserved for multiloculated collections, PCD failure, or hemodynamic instability. Reflexive upfront splenectomy in a salvageable case carries the OPSI cost without offsetting benefit; spleen preservation is the modern audit-defensible standard." },
    { q: "Why TEE for bacteremic — splenic abscess is local?",
      a: "Splenic abscess most often arises from bacteremic seeding — S. aureus or Streptococcus on blood culture mandates TEE to exclude IE as the source per AHA 2015 + IDSA SAB 2011 [cite:ie]. A missed IE source converts a 4–6 wk splenic-abscess course into the wrong treatment paradigm with potentially lethal endovascular focus left untreated. TEE is non-negotiable for bacteremic gram-positive substrate; positive findings shift to IE bands + surgical decision for valve disease." },
    { q: "Why mandatory OPSI prophylaxis after splenectomy?",
      a: "Overwhelming post-splenectomy infection (Bisharat Lancet ID 2001) [cite:bisharat] carries 50–70% mortality without prevention — pneumococcal (PCV15 + PPSV23), meningococcal (MenACWY + MenB), and Hib vaccines per CDC ACIP 2024 [cite:cdc_acip] + BSH 2011 [cite:davies_bsh] are mandatory, ideally 2 wk pre-splenectomy or as soon as possible post-op. Standby antibiotic (amoxicillin or cefuroxime) for fever + medical-alert documentation completes the bundle. Skipping prophylaxis after splenectomy is below standard of care." },
    { q: "Why HIV workup for Salmonella splenic abscess?",
      a: "Salmonella splenic abscess is a marker of cell-mediated immune compromise — disproportionately seen in untreated HIV, hematologic malignancy, and other T-cell-deficient hosts [cite:bisharat]. HIV workup at presentation catches treatable underlying disease that drives recurrence + opportunistic comorbidity. Extended ceftriaxone or cipro course (4–6 wk) pairs with drainage; immune restoration drives durable outcome. The screen cost is trivial; missed diagnosis condemns the patient to recurrent invasive disease." },
  ],
  research: {
    headline: "PCD or surgical drainage drives outcome; Salmonella seeding common in immunocompromised; OPSI ppx mandatory post-splenectomy.",
    trials: [
      { name: "Lardiere World J Surg 2009",
        n: "Cohort review",
        question: "PCD vs splenectomy in splenic abscess",
        finding: "PCD first-line for unilocular ≥ 5 cm; splenectomy for multiloculated or PCD failure; mortality 14–47%",
        bias: "Heterogeneous severity + comorbidity" },
      { name: "Lee Clin Gastro Hepatol 2008",
        n: "Cohort",
        question: "Hypervirulent K. pneumoniae splenic abscess",
        finding: "Metastatic foci common (endophthalmitis, meningitis); screening + extended duration in K1/K2 + diabetic substrate",
        bias: "Asian cohort; rising in Western centers" },
    ],
    guidelines: [
      { society: "Society consensus",
        year: 2017,
        topic: "Splenic abscess management",
        keypoint: "PCD first-line; splenectomy for multiloculated; broad → narrow on cultures; post-splenectomy OPSI ppx mandatory" },
    ],
    openQuestions: [
      "Optimal PCD duration — 2–4 wk drainage typical",
      "Hypervirulent K. pneumoniae screening — ophtho + brain MRI",
      "Salmonella HIV workup — modifiable cell-mediated immunity",
    ],
  },
};

export default { id: "splenic-abscess", regimen, decision };
