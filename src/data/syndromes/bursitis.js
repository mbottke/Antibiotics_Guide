/* ===========================================================
   SEPTIC BURSITIS — olecranon / prepatellar; S. aureus
   dominant; aspirate + antibiotics; surgical for resistant. == */

const regimen = {
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
};

const decision = {
  duration: {
    headline: "10–14 d antibiotics + aspiration; surgical bursectomy if persistent or recurrent.",
    evidence: "Society consensus — aspiration + 10–14 d antibiotics adequate for most; bursectomy for failure",
    branches: [
      { label: "Olecranon / prepatellar, drained, clinical response", days: "10–14 d",
        detail: "Cefazolin / cephalexin for MSSA; vancomycin / TMP-SMX for MRSA; IV → PO when stable",
        matchAgent: /cefazolin|cephalexin|dicloxacillin/i },
      { label: "MRSA-confirmed", days: "10–14 d",
        detail: "Vancomycin then PO clinda or doxy or TMP-SMX",
        matchAgent: /vancomycin|trimethoprim-?sulfamethoxazole|doxycycline/i },
      { label: "Immunocompromised / chronic disease", days: "14–21 d",
        detail: "Lower threshold to IV; longer course; ID input for unusual organisms" },
      { label: "Persistent / recurrent — bursectomy", days: "10–14 d post-op",
        detail: "Surgical bursectomy + IV antibiotics post-op; ortho consult" },
    ],
    stopWhen: [
      "Bursa decompressed + fluid resolving",
      "Erythema + tenderness resolved",
      "Afebrile",
      "Range of motion returning to baseline",
      "Minimum 10–14 d completed",
    ],
    extendIf: [
      { text: "**Persistent / recurrent** disease — surgical bursectomy",
        matchCtx: { severe: true } },
      "Bacteremia confirmed — per SAB bands if S. aureus",
      "Immunocompromised host — extend per ID",
      "Penetrating injury / FB — surgical exploration",
    ],
  },
  monitoring: {
    headline: "Aspirate at presentation; culture fluid; serial exam for response; bursectomy for failure.",
    items: [
      { sev: "required", what: "**Aspirate bursa** at presentation — diagnostic + therapeutic",
        why: "Cell count + culture confirm infection; drainage accelerates response" },
      { sev: "required", what: "**Fluid culture + Gram stain**",
        why: "S. aureus dominant; pathogen-directed therapy + MRSA detection drive choice" },
      { sev: "required", what: "**Differentiate from gout / pseudogout** — crystal exam",
        why: "Inflammatory bursitis mimics infection; antibiotics not indicated in crystal disease" },
      { sev: "trigger", what: "**Surgical bursectomy** if persistent or recurrent",
        why: "Failure of medical therapy; ortho consult for definitive management" },
      { sev: "trigger", what: "**Re-aspirate at 48–72 h** if non-response",
        why: "Re-accumulation + persistent infection; guides escalation" },
      { sev: "trigger", what: "**Vancomycin AUC** if MRSA empiric / confirmed",
        why: "Therapeutic monitoring drives efficacy",
        matchAgent: /vancomycin/i },
      { sev: "consider", what: "**Address occupational trauma** — kneeling pads, elbow protection",
        why: "Prevention of recurrence in housemaid's knee / student's elbow" },
      { sev: "consider", what: "**Workup chronic disease** — gout, RA, dialysis — for recurrent disease",
        why: "Underlying substrate drives recurrence; modifiable" },
    ],
  },
  rationale: {
    driver: "Septic bursitis (olecranon, prepatellar) is overwhelmingly S. aureus — aspiration at presentation is both diagnostic (cell count + Gram stain + crystal exam to exclude gout/pseudogout) and therapeutic, and the 10–14 d antibiotic course tracks drainage adequacy. Empiric: cefazolin or cephalexin for MSSA, vancomycin then PO TMP-SMX/doxy/clindamycin for MRSA; immunocompromised or chronic-disease hosts get 14–21 d with a lower threshold to IV. The bursal space is avascular and slow to clear, which is why duration exceeds simple cellulitis. Persistent or recurrent disease requires surgical bursectomy with ortho consult.",
    guideline: "ssti",
    rejected: "Antibiotic-only treatment without aspiration was deliberately rejected — fluid culture and crystal exam differentiate septic from inflammatory bursitis (gout, pseudogout, RA), and empiric antibiotics for sterile crystal bursitis drive resistance without benefit. Routine MRSA cover absent risk factors was tempered: cefazolin or cephalexin is appropriate first-line in low-risk hosts, and reflexive vancomycin in community bursitis wastes a narrow agent on a usually MSSA disease." },
  objections: [
    { q: "Why mandatory aspiration — antibiotics can be empiric?",
      a: "Aspiration at presentation is both diagnostic (cell count + Gram stain + crystal exam to exclude gout / pseudogout) and therapeutic — empiric antibiotics for sterile crystal bursitis drive resistance without benefit, and missing the crystal diagnosis means the patient remains untreated. IDSA 2014 SSTI [cite:ssti] aligns: fluid analysis differentiates the substrate. Reflexive empiric antibiotics without aspiration in classic olecranon / prepatellar bursitis is below-standard practice. The bedside tap takes minutes; the downstream decision-quality gain is substantial." },
    { q: "Why 10–14 d — cellulitis is 5 d?",
      a: "Bursitis duration exceeds cellulitis because the bursal space is avascular + slow to clear — Stell (Aust Fam Phys 2010) and society consensus support 10–14 d post-aspiration in the immunocompetent host, with extension to 14–21 d for immunocompromise or chronic disease (gout, RA, dialysis). Cellulitis short-course (Hepburn / Tansarli, IDSA 2014) [cite:ssti] doesn't extrapolate — different anatomy, different pharmacokinetic milieu. Persistent or recurrent disease triggers surgical bursectomy + ortho consult." },
    { q: "Why oral cephalexin — should this be IV?",
      a: "Oral cephalexin / dicloxacillin has ~90% bioavailability and matches IV cefazolin for uncomplicated olecranon / prepatellar bursitis without sepsis or systemic toxicity per IDSA 2014 [cite:ssti]. Reserve IV for severe sepsis, inability to tolerate oral, deep / atypical bursa involvement, or failed outpatient therapy. The IV-to-PO step-down is a stewardship win and an outpatient-eligibility gain, not a quality-of-care concession in low-risk hosts." },
    { q: "Why not routine MRSA cover — feels safer?",
      a: "Pallin (CID 2013) [cite:pallin] in cellulitis and IDSA 2014 SSTI [cite:ssti] establish that routine MRSA cover is unjustified in low-risk hosts — septic bursitis is overwhelmingly MSSA, and cefazolin / cephalexin is appropriate first-line in community presentation. Reserve vancomycin or PO TMP-SMX / doxy / clinda for purulent component, IVDU, prior MRSA isolate, prosthetic adjacent material, or non-response at 72 h. Reflexive vancomycin in community bursitis wastes a narrow agent." },
  ],
  research: {
    headline: "Aspirate + culture distinguishes infection from crystal; 10-14 d after drainage; bursectomy for failure.",
    trials: [
      { name: "Stell Aust Fam Phys 2010",
        n: "Cohort review",
        question: "Modern septic bursitis management",
        finding: "Aspirate at presentation drives diagnosis; 10-14 d targeted antibiotic + serial aspiration; bursectomy for failure",
        bias: "Outpatient-focused cohort" },
    ],
    guidelines: [
      { society: "Society consensus",
        year: 2017,
        topic: "Septic bursitis",
        keypoint: "Aspirate + culture; 10-14 d targeted; bursectomy for failure / recurrent" },
    ],
    openQuestions: [
      "Re-aspiration timing — 48-72 h response check",
      "Surgical bursectomy thresholds — failure or recurrence",
    ],
  },
};

export default { id: "bursitis", regimen, decision };
