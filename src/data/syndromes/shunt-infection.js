/* ===========================================================
   SHUNT INFECTION — CSF / VP / VA. Explant + reimplant standard. = */

const regimen = {
  "Empiric": [
    {
      rx: /vancomycin.*cefepime|intraventricular/i,
      pickIf: "Suspected ventriculoperitoneal shunt infection.",
      whyPick: [
        "**Vancomycin + cefepime / meropenem**",
        "**Externalize or remove the shunt** — definitive; salvage rarely succeeds with biofilm intact",
        "**Intraventricular vancomycin** if refractory or post-explant CSF positive",
        "Long course depends on organism + hardware management; 10–14 d post-clearance typical",
      ],
      watchOut: [
        { sev: "warn", text: "**CoNS most common** but most virulent organisms (S. aureus, Pseudomonas, GNR) absolutely require explant; lock therapy rarely succeeds" },
        { sev: "note", text: "Re-implantation timing: typically 7–14 d post-sterilization; coordinate with neurosurgery" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "10–14 d post-CSF-clearance after explant; reimplantation 7–14 d post-sterilization.",
    evidence: "IDSA 2017 — explant-driven; reimplant when CSF sterile + clinically stable",
    branches: [
      { label: "Explant + EVD, CSF clearing", days: "10–14 d post-clearance",
        detail: "From first negative CSF after explant; reimplant after clearance + stability" },
      { label: "Hardware retained (rare)", days: "Indefinite",
        detail: "Suppressive oral therapy + ID + neurosurgery; lock therapy rarely succeeds" },
      { label: "S. aureus / gram-negative", days: "14 d + IVT if refractory",
        detail: "More aggressive than CoNS; consider intraventricular addition (IVT)" },
    ],
    stopWhen: [
      "CSF cultures negative ≥ 48 h",
      "CSF cell count normalizing",
      "Neurologic exam stable",
      "Hardware re-implanted (if applicable)",
      "Minimum 10–14 d post-clearance completed",
    ],
    extendIf: [
      "Persistent CSF positivity — intraventricular addition + extend",
      { text: "**S. aureus / gram-negative / mixed** — more aggressive course",
        matchCtx: { severe: true } },
      "Hardware retention impossible to explant — suppressive therapy",
      "Concurrent abscess / cerebritis — extend per source",
    ],
  },
  monitoring: {
    headline: "Explant preferred; CSF sampling daily; reimplant when sterile + stable.",
    items: [
      { sev: "required", what: "**Explant / externalize** at presentation when possible",
        why: "Biofilm + foreign-body kinetics; systemic antibiotics rarely cure with hardware in place" },
      { sev: "required", what: "**Daily CSF sampling** until sterilization",
        why: "Drives reimplantation timing + duration calc" },
      { sev: "required", what: "**Neurosurgery + ID partnership** for reimplant decision",
        why: "Timing balance: clearance vs hydrocephalus risk during EVD period" },
      { sev: "trigger", what: "**Intraventricular antibiotic** for refractory CSF positivity",
        why: "Preservative-free vanco / aminoglycoside; neurosurgery delivery + monitoring" },
      { sev: "trigger", what: "**MRI** for cerebritis / abscess complication",
        why: "Drives extended-course decision + additional drainage" },
      { sev: "consider", what: "**Suppressive oral therapy** if explant impossible",
        why: "Lifelong; ID + neurosurgery + patient counseling on recurrence risk" },
    ],
  },
  rationale: {
    driver: "CSF shunt / EVD infection is a two-stage explant + reimplant disease — Tunkel IDSA 2017 anchors removal at diagnosis, EVD bridge during CSF sterilization, and reimplantation only after confirmed clearance and clinical stability. CoNS (~50%) and S. aureus (~25%) dominate, so empirics are vancomycin + cefepime or meropenem at CNS-strength dosing, narrowed on CSF + drain-tip culture. Rifampin combination is used for retained staphylococcal hardware where explant is impossible. Duration is 10–14 d post-CSF-clearance after explant, longer for S. aureus or Gram-negative organisms. Lifelong oral suppression is the path for truly irretrievable hardware after multidisciplinary ID + neurosurgery decision-making.",
    guideline: "mono",
    rejected: "Salvage therapy with retained shunt was deliberately rejected outside the rare irretrievable substrate — Tunkel 2017 documents salvage rates < 30% with retained hardware versus > 90% cure with two-stage explant + reimplant, and biofilm + foreign-body kinetics make systemic antibiotics alone inadequate. Lock therapy as a routine first-line approach was tempered: it rarely succeeds in CSF hardware and is reserved for explant-contraindicated patients. Counting duration from the day of presentation was rejected — the 10–14 d clock starts at the first negative CSF after explant, not at diagnosis, because the substrate is not under control until hardware is out." },
  objections: [
    { q: "Why explant — CoNS is low-virulence, can't we suppress?",
      a: "Tunkel IDSA 2017 documents salvage rates < 30% with retained hardware versus > 90% cure with two-stage explant + EVD bridge + reimplant, even for low-virulence CoNS [cite:mono]. Biofilm on the silicone shunt renders systemic antibiotics inadequate regardless of organism virulence; CoNS persistence drives recurrence and chronic CSF inflammation. Lifelong suppression is reserved for the rare truly irretrievable hardware after multidisciplinary ID + neurosurgery review." },
    { q: "Why empiric vanco + cefepime when CoNS dominates?",
      a: "CoNS accounts for ~50% but S. aureus (~25%) and Gram-negatives (~15%) make up the rest per Tunkel 2017, and missing GNR / MRSA empirically drives early deterioration before drain-tip culture returns at 48–72 h [cite:mono]. Vancomycin + cefepime / meropenem at CNS-strength dosing covers the full distribution; narrowing to vanco-only or rifampin combination happens on culture data, not at empiric start." },
    { q: "Why rifampin add-on for retained staphylococcal hardware?",
      a: "Rifampin penetrates staphylococcal biofilm and has demonstrated salvage signal when explant is impossible — Tunkel IDSA 2017 anchors its addition to a primary anti-staphylococcal agent (vancomycin or anti-staph β-lactam) specifically for the retained-hardware substrate where biofilm is the dominant treatment barrier [cite:mono]. It is never monotherapy due to rapid resistance, and is omitted when explant is achievable because biofilm becomes irrelevant once the foreign body is out." },
    { q: "Why start the 10-14 d clock at first negative CSF after explant?",
      a: "The substrate is not under source control until hardware is out and CSF is sterile — Tunkel 2017 anchors the clock at first negative CSF post-explant because biofilm shedding can drive positive cultures for 24–72 h after removal [cite:mono]. Counting from presentation risks stopping during active infection on retained hardware; counting from explant alone misses the lag to sterilization. Daily CSF cultures gate the start point." },
  ],
  research: {
    headline: "Explant + reimplant standard; CoNS / S. aureus dominant; rifampin for retained hardware; lifelong suppression for irretrievable.",
    trials: [
      { name: "Tunkel IDSA 2017",
        n: "Guideline",
        question: "Modern shunt infection management",
        finding: "Two-stage explant + reimplant after CSF sterilization; rifampin for retained staph; lifelong oral suppression if irretrievable",
        bias: "Guideline synthesis" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2017,
        topic: "Shunt + EVD infection (Tunkel)",
        keypoint: "Explant + reimplant; rifampin for retained staph; intraventricular for refractory" },
    ],
    openQuestions: [
      "Reimplant timing — clinical + CSF sterilization driven",
      "Optimal oral suppression agent for irretrievable",
    ],
  },
};

export default { id: "shunt-infection", regimen, decision };
