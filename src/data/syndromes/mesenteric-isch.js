/* ===========================================================
   ACUTE MESENTERIC ISCHEMIA — vascular surgical emergency;
   broad antibiotics adjunctive; revascularization + resection. */

const regimen = {
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
};

const decision = {
  duration: {
    headline: "Emergent vascular intervention + bowel resection; antibiotics adjunctive; broad coverage 5–10 d.",
    evidence: "ACR + vascular surgery — revascularization within 6 h preserves bowel; antibiotic alone fails; high mortality without surgery",
    branches: [
      { label: "Acute embolic / thrombotic (SMA)", days: "5–10 d + revasc",
        detail: "Pip-tazo or carbapenem broad × 5–10 d; emergent vascular + endovascular thrombectomy ± resection",
        matchAgent: /meropenem/i },
      { label: "Non-occlusive mesenteric ischemia (NOMI)", days: "5–10 d + supportive",
        detail: "Treat shock + low CO state; vasodilators (papaverine) + broad antibiotics × 5–10 d" },
      { label: "Venous thrombosis (SMV)", days: "5–10 d + anticoag",
        detail: "Anticoagulation + broad antibiotics; long-term per coagulopathy workup",
        matchAgent: /piperacillin/i },
      { label: "Bowel infarction with perforation", days: "Per intra-abdom",
        detail: "Resection + per intra-abdominal sepsis bands; ICU + ID + surgery" },
    ],
    stopWhen: [
      "Revascularization complete or palliated",
      "Bowel infarction resected",
      "Hemodynamically stable",
      "Inflammatory markers normalizing",
      "Antibiotic course completed (5–10 d)",
    ],
    extendIf: [
      { text: "**Bowel infarction with sepsis** — per intra-abdominal bands",
        matchCtx: { severe: true } },
      "Perforation — extend per source",
      "Persistent ischemia or recurrent thrombosis — vascular + extended antibiotics",
      "Short-bowel syndrome management — nutrition + per ID",
    ],
  },
  monitoring: {
    headline: "Vascular surgery emergent; CT angiography; broad antibiotics adjunctive; anticoagulation per pattern.",
    items: [
      { sev: "required", what: "**Vascular surgery + general surgery emergent consult**",
        why: "Revascularization within 6 h preserves bowel; surgery drives outcome" },
      { sev: "required", what: "**CT angiography** at presentation",
        why: "Defines vascular anatomy + ischemic extent + thrombus / embolus / NOMI pattern" },
      { sev: "required", what: "**ICU admission** + aggressive resuscitation",
        why: "Multi-organ failure common; metabolic acidosis is a late sign" },
      { sev: "trigger", what: "**Endovascular thrombectomy or thrombolysis** for embolic / thrombotic",
        why: "Faster + less morbid than open; ideal for SMA embolus or thrombus" },
      { sev: "trigger", what: "**Anticoagulation for venous thrombosis (SMV)**",
        why: "Long-term anticoagulation reduces recurrence; coag workup for thrombophilia" },
      { sev: "trigger", what: "**Vasodilators (papaverine)** for NOMI",
        why: "Improves splanchnic perfusion in non-occlusive disease" },
      { sev: "trigger", what: "**Second-look laparotomy** at 24 h",
        why: "Re-assesses bowel viability; resects newly necrotic segments" },
      { sev: "consider", what: "**Coagulopathy + cardiac source workup**",
        why: "AF + intracardiac thrombus + thrombophilia drive recurrence; addressable" },
    ],
  },
  rationale: {
    driver: "Acute mesenteric ischemia is a vascular emergency where antibiotics are adjunctive — Kassahun (World J Surg 2008) anchors emergent CT angiography and revascularization (endovascular thrombectomy / thrombolysis for embolic or thrombotic SMA per Bjorck 2017, open surgery for failure) within 6 h to preserve bowel viability, with mortality 50–70% once delay sets in. Broad pip-tazo or carbapenem coverage runs 5–10 d to address translocation-driven sepsis as bowel infarcts, and second-look laparotomy at 24 h re-assesses viability and resects newly necrotic segments. Venous thrombosis (SMV) adds anticoagulation; non-occlusive ischemia (NOMI) responds to splanchnic vasodilators (papaverine) and shock reversal. Bowel perforation escalates to intra-abdominal sepsis bands.",
    guideline: "stopit",
    rejected: "Antibiotic-only management without vascular intervention was deliberately rejected — Kassahun + ACR / SVS 2024 anchor revascularization within 6 h as the dominant outcome lever, and medical-only management has near-uniform failure with bowel infarction. Waiting for metabolic acidosis or peritonitis as the trigger to operate was tempered: acidosis is a late sign and the diagnostic window (CT angiography at presentation, emergent vascular consult) precedes laboratory derangement, so the surgical alarm is symptom + imaging-based rather than lab-driven." },
  objections: [
    { q: "Why emergent revascularization — surely fluids and antibiotics buy time?",
      a: "Acute mesenteric ischemia is a vascular emergency where bowel viability collapses within hours — Kassahun World J Surg 2008 [cite:stopit] anchors revascularization (endovascular thrombectomy or open surgery) within 6 h as the dominant outcome lever, with mortality 50–70% once delay sets in. Antibiotics address translocation-driven sepsis but cannot rescue ischemic bowel. CT angiography at presentation + emergent vascular consult; do not wait for peritonitis or acidosis [cite:ssc]." },
    { q: "Why broad pip-tazo or carbapenem — is sepsis confirmed?",
      a: "Bowel ischemia drives bacterial translocation across the compromised mucosal barrier even before frank perforation — broad pip-tazo or carbapenem × 5–10 d covers the enteric GNR + anaerobe substrate per STOP-IT-aligned IAI logic [cite:stopit]. SSC 2021 [cite:ssc] supports empiric broad coverage in suspected septic foci pending source control. Perforation escalates to intra-abdominal sepsis bands with re-look laparotomy at 24 h [cite:amrgn]." },
    { q: "Why second-look laparotomy at 24 h — bowel was viable initially?",
      a: "Bowel viability post-revascularization evolves over the first 24 h — segments judged viable at the index operation may demarcate as necrotic, and Kassahun + ACR / SVS 2024 [cite:stopit] anchor a planned second-look at 24 h to resect newly necrotic bowel before perforation. This is scheduled, not reactive — waiting for clinical deterioration converts a controlled re-look into emergent sepsis surgery with worse outcomes [cite:ssc]." },
    { q: "Why not wait for acidosis or peritonitis to confirm diagnosis?",
      a: "Acidosis and peritonitis are late signs of mesenteric ischemia — by the time they appear, transmural infarction has occurred and the revascularization window has closed per Kassahun [cite:stopit]. The surgical alarm is symptom + imaging-based (pain out of proportion to exam, AF or thrombophilia substrate, CT-angiographic occlusion), not lab-driven. ACR / SVS 2024 endorses early CT angiography in any suspicion; waiting wastes the salvage window." },
  ],
  research: {
    headline: "Revascularization within 6 h preserves bowel; antibiotics adjunctive; metabolic acidosis is a late sign.",
    trials: [
      { name: "Kassahun World J Surg 2008",
        n: "Cohort review",
        question: "Modern mesenteric ischemia outcomes",
        finding: "Time-to-revascularization < 6 h preserves bowel viability; mortality 50-70% with delay; CT angio + emergent vascular intervention",
        bias: "Pre-modern endovascular era; trend supportive" },
      { name: "Bjorck Eur J Vasc 2017",
        n: "Cohort",
        question: "Endovascular vs open mesenteric revascularization",
        finding: "Endovascular thrombectomy / thrombolysis faster + less morbid; ideal for embolic / thrombotic SMA",
        bias: "Selection by anatomy" },
    ],
    guidelines: [
      { society: "ACR / SVS",
        year: 2024,
        topic: "Acute mesenteric ischemia",
        keypoint: "CT angio + emergent vascular intervention; broad antibiotics adjunctive; second-look laparotomy at 24 h" },
    ],
    openQuestions: [
      "NOMI vs occlusive distinction — supportive vs interventional",
      "Anticoagulation in venous thrombosis — long-term standard",
      "Bowel resection thresholds — viability assessment evolving",
    ],
  },
};

export default { id: "mesenteric-isch", regimen, decision };
