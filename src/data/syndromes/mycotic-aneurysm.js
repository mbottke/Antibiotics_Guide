/* ===========================================================
   MYCOTIC ANEURYSM — infected aortic / peripheral aneurysm;
   surgical repair + 6 wk → lifelong suppression; Salmonella + S. aureus
   dominant. ================================================== */

const regimen = {
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
};

const decision = {
  duration: {
    headline: "Surgical repair + 6 wk IV; chronic suppression for retained graft; Salmonella + S. aureus dominant.",
    evidence: "Society consensus — surgical repair mandatory; antibiotic alone fails; chronic suppression for in-situ repair / retained material",
    branches: [
      { label: "Surgical repair + native graft", days: "6 wk IV + chronic ppx",
        detail: "Per pathogen; cefazolin or vanco or ceftriaxone; ID + vascular surgery",
        matchAgent: /cefazolin|vancomycin|ceftriaxone/i },
      { label: "Endovascular repair (EVAR)", days: "6 wk + indef ppx",
        detail: "Graft is foreign body; lifelong oral suppression; ID-driven choice" },
      { label: "Non-surgical candidate (compassionate suppression)", days: "Indefinite",
        detail: "Lifelong oral suppression; high mortality; goals of care discussion" },
      { label: "Salmonella (non-typhoidal, age > 50 or immunocompromised)", days: "6 wk + lifelong ppx",
        detail: "Ceftriaxone or cipro per sensitivity; mycotic seeding common; surgical repair",
        matchAgent: /ciprofloxacin/i },
      { label: "Bacteremia + abdominal aortic substrate (workup)", days: "Per workup",
        detail: "CT angio + extended antibiotics; high index of suspicion in Salmonella / S. aureus bacteremia" },
    ],
    stopWhen: [
      "Surgical repair complete",
      "Blood cultures cleared",
      "Imaging shows stable repair",
      "Pathogen-specific 6 wk IV completed",
      "Lifelong suppression initiated (if retained material)",
    ],
    extendIf: [
      { text: "**Retained foreign material** — lifelong oral suppression",
        matchCtx: { severe: true } },
      "Non-surgical candidate — chronic suppression + goals of care",
      "Bacteremia persistent — extended IV + re-workup",
      "Recurrent infection — re-imaging + re-intervention",
    ],
  },
  monitoring: {
    headline: "Vascular surgery emergent; CT angio; lifelong suppression for retained graft; Salmonella + age > 50 trigger.",
    items: [
      { sev: "required", what: "**Vascular surgery emergent consult**",
        why: "Rupture risk + surgical repair drives mortality; antibiotic alone fails" },
      { sev: "required", what: "**CT angiography** at presentation",
        why: "Defines aneurysm + adjacent structures + surgical planning" },
      { sev: "required", what: "**Blood cultures × 3** with anaerobic + extended hold",
        why: "Pathogen identification + drives duration; slow-growers possible" },
      { sev: "trigger", what: "**Salmonella + age > 50 → CT angio**",
        why: "Mycotic aneurysm risk; vascular endothelial seeding common in non-typhoidal Salmonella" },
      { sev: "trigger", what: "**S. aureus bacteremia + back pain → CT angio**",
        why: "Mycotic seeding to vertebrae + aorta; high index of suspicion" },
      { sev: "trigger", what: "**Lifelong oral suppression** for retained material",
        why: "Foreign body + biofilm; recurrent rupture without continued antibiotics" },
      { sev: "trigger", what: "**Serial imaging** at 3, 6, 12 mo + annually",
        why: "Detects recurrence + new mycotic foci; standard surveillance" },
      { sev: "consider", what: "**ID + vascular surgery quarterly** for long-term follow-up",
        why: "Coordinated care drives suppression compliance + early detection of recurrence" },
    ],
  },
  rationale: {
    driver: "Mycotic aneurysm is a surgical emergency — rupture risk dominates, and antibiotic-only management uniformly fails (Lee J Vasc Surg 2010). Vascular surgery emergent consult + CT angiography at presentation define the aneurysm + adjacent structures + surgical approach. Open repair or endovascular (EVAR) achieves source control; pathogen-directed IV runs 6 wk minimum, with lifelong oral suppression standard for any retained foreign material (graft, stent-graft). Salmonella + age > 50 and S. aureus bacteremia + back pain are the two highest-yield clinical triggers for CT angio workup. Non-typhoidal Salmonella seeds vascular endothelium preferentially — high index of suspicion in any age > 50 patient with NTS bacteremia.",
    guideline: "ie",
    rejected: "Antibiotic-only management of mycotic aneurysm was deliberately rejected — rupture risk dominates the natural history, and even prolonged appropriate antibiotics cannot reliably stabilize an infected aneurysm without surgical or endovascular repair. Truncated short-course bacteremia management (7–14 d) was tempered: even after successful repair, the perivascular substrate and foreign material burden warrant 6 wk IV minimum + chronic suppression for retained graft material; the 7-d BALANCE bands explicitly exclude endovascular substrate." },
  objections: [
    { q: "Why surgery emergent — extended antibiotics could stabilize it?",
      a: "Mycotic aneurysm is a surgical emergency — Lee (J Vasc Surg 2010) and SVS / AHA 2020 [cite:ie] establish that rupture risk dominates the natural history, and antibiotic-only management uniformly fails to prevent it. Even prolonged appropriate antibiotics cannot stabilize an infected aneurysm without surgical or endovascular repair. Vascular surgery + CT angio at presentation define the aneurysm + surgical approach; delay loses the planned-repair window and concedes to emergency rupture surgery with substantially worse outcomes." },
    { q: "Why 6 wk IV — surgery removed the infected segment?",
      a: "Even after successful surgical or endovascular repair, the perivascular substrate + foreign material burden warrant 6 wk IV minimum per IDSA / SVS guidance [cite:ie] — the BALANCE 7-d band explicitly excludes endovascular substrate [cite:balance], and shorter courses risk graft re-infection + recurrent rupture. Pathogen-directed therapy (Salmonella → cipro or ceftriaxone, S. aureus → cefazolin / vanco) for the full 6 wk minimum; surgical clearance does not shorten the antibiotic clock when foreign material was placed." },
    { q: "Why lifelong suppression for retained graft — drug toxicity over years?",
      a: "Lifelong oral suppression is standard for retained foreign material (EVAR stent-graft, synthetic interposition graft) per SVS / AHA 2020 [cite:ie] — biofilm-resident organisms predict relapse + recurrent rupture without continued antibiotics, and the surgical risk of explant-and-replace often exceeds the suppression risk. Monitor LFTs, renal, drug interactions quarterly; goals-of-care alignment with vascular surgery + ID. Discontinuation can be considered after years of stability with re-imaging surveillance, but is rarely first-line." },
    { q: "Why CT angio for NTS bacteremia in age > 50 — yield seems low?",
      a: "Non-typhoidal Salmonella seeds vascular endothelium preferentially in adults > 50 with atherosclerosis — Hsu (Ann Vasc Surg 2008) [cite:ie] and successor cohorts document substantial mycotic aortic aneurysm prevalence in this substrate, often presenting before rupture as occult focal pain. The yield justifies CT angio at NTS bacteremia diagnosis in age > 50; missing the diagnosis predicts catastrophic rupture. S. aureus bacteremia + back pain is the parallel trigger for staphylococcal aortic + vertebral seeding." },
  ],
  research: {
    headline: "Surgical repair + 6 wk IV; lifelong suppression for retained graft; Salmonella + age > 50 → CT angio.",
    trials: [
      { name: "Hsu Ann Vasc Surg 2008",
        n: "Cohort",
        question: "Salmonella mycotic aortic aneurysm — endovascular vs open repair",
        finding: "Endovascular acceptable for selected; lifelong oral suppression mandatory; mortality reduced with timely repair",
        bias: "Asian cohort; Salmonella prevalence higher" },
      { name: "Lee J Vasc Surg 2010",
        n: "Cohort review",
        question: "Modern mycotic aneurysm epidemiology + outcomes",
        finding: "Surgical repair + 6 wk IV + lifelong oral suppression for retained material; antibiotic-only fails",
        bias: "Observational; outcomes vary by anatomy + comorbidity" },
      { name: "Sorelius Eur J Vasc Endovasc 2014",
        n: "Cohort",
        question: "Endovascular vs open mycotic aortic repair",
        finding: "Endovascular shorter LOS + lower 30-d mortality; lifelong suppression standard for both",
        bias: "Selection bias by anatomy + surgical risk" },
    ],
    guidelines: [
      { society: "SVS / AHA",
        year: 2020,
        topic: "Vascular infection management",
        keypoint: "Surgical repair + extended IV + chronic suppression for retained material; serial imaging surveillance" },
    ],
    openQuestions: [
      "Endovascular vs open repair — selection by anatomy + surgical risk",
      "Lifetime suppression discontinuation — case-by-case after stable years",
      "Routine workup of bacteremia for occult mycotic aneurysm — Salmonella + S. aureus + back pain triggers",
    ],
  },
};

export default { id: "mycotic-aneurysm", regimen, decision };
