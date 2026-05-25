/* ===========================================================
   VENTRICULITIS — CSF shunt / drain associated; intraventricular
   antibiotics for refractory. ===================================== */

const regimen = {
  "Empiric": [
    {
      rx: /vancomycin.*cefepime|vancomycin.*meropenem/i,
      pickIf: "Ventriculitis — CSF pleocytosis + drain / shunt + fever.",
      whyPick: [
        "**Vancomycin + cefepime or meropenem** (CNS dosing)",
        "**Remove EVD / shunt** if possible — biofilm",
        "Add **intraventricular vancomycin** if refractory",
        "Long course: **2–3 weeks** after CSF sterilization",
      ],
      watchOut: [
        { sev: "warn", text: "**Get CSF Gram stain + culture daily** until sterile" },
        { sev: "note", text: "Coordinate with neurosurgery + ID" },
      ],
    },
  ],
  "Refractory": [
    {
      rx: /intraventricular/i,
      pickIf: "Persistent CSF positivity despite IV therapy.",
      whyPick: [
        "**Intraventricular vancomycin 10–20 mg daily**, or aminoglycoside via Ommaya / EVD",
        "Coordinate with neurosurgery for delivery — they own the access",
        "**Daily CSF Gram stain + culture + cell count** until clearance documented (≥48 h)",
      ],
      watchOut: [
        { sev: "warn", text: "**Intraventricular dosing requires careful technique + concentration control** — over-concentration causes seizures + chemical ventriculitis" },
        { sev: "warn", text: "**Preservative-free formulations only** — preservatives are neurotoxic intrathecally" },
        { sev: "note", text: "Document trough CSF level + clinical response; consider stopping at 14 d post-clearance" },
      ],
    },
    {
      rx: /aminoglycoside/i,
      pickIf: "GNR ventriculitis when intraventricular delivery preferred.",
      whyPick: [
        "**Intraventricular gentamicin or amikacin** for GNR not clearing on IV alone",
        "Doses are SMALL (mg, not mg/kg) — preservative-free formulations",
        "Neurosurgery handles delivery and CSF sampling",
      ],
      watchOut: [
        { sev: "warn", text: "**Preservative-free only** — preservatives are neurotoxic intrathecally" },
        { sev: "warn", text: "Get peak/trough from CSF, not blood, to guide dosing" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "2–3 wk after CSF sterilization; shunt removal preferred; intraventricular for refractory.",
    evidence: "IDSA 2017 — CSF-confirmed duration post-clearance; explant drives outcomes",
    branches: [
      { label: "Standard bacterial, shunt removed", days: "2–3 wk post-clearance",
        detail: "Vancomycin + cefepime / meropenem; CSF cultures daily until sterile" },
      { label: "Hardware retained", days: "3–4 wk + IVT",
        detail: "Add intraventricular vancomycin or aminoglycoside; longer course; IVT = intraventricular" },
      { label: "Gram-negative ventriculitis", days: "3 wk minimum",
        detail: "Cefepime / meropenem; check CSF penetration; intraventricular if refractory" },
    ],
    stopWhen: [
      "CSF cultures negative ≥ 48 h",
      "CSF cell count + glucose normalizing on repeat LP / drain sample",
      "Neurologic exam stable / improving",
      "Hardware decision finalized (removed vs retained)",
      "Minimum 2–3 wk post-clearance completed",
    ],
    extendIf: [
      "Persistent CSF positivity — switch to intraventricular + extend",
      { text: "**Hardware retained** — extend per ID + neurosurgery",
        matchCtx: { severe: true } },
      "Concurrent abscess / cerebritis — extend per source",
      "Multidrug-resistant GNR — extend per ID input",
    ],
  },
  monitoring: {
    headline: "Daily CSF cultures + cell count; explant shunt preferred; intraventricular for refractory.",
    items: [
      { sev: "required", what: "**Daily CSF Gram stain + culture + cell count** until clearance",
        why: "Persistent positivity triggers intraventricular addition + extended course" },
      { sev: "required", what: "**Explant / externalize shunt** if possible",
        why: "Biofilm renders systemic-only therapy inadequate; salvage rarely succeeds" },
      { sev: "required", what: "**CNS-strength dosing** + neurosurgery partnership",
        why: "Standard systemic doses inadequate; coordinate intraventricular delivery" },
      { sev: "trigger", what: "**Intraventricular vancomycin / aminoglycoside** for refractory",
        why: "Preservative-free formulations; CSF level guides; neurosurgery delivers" },
      { sev: "trigger", what: "**MRI** for cerebritis / abscess / extension",
        why: "Complications drive extended course + drainage decisions" },
      { sev: "consider", what: "Lock-therapy attempts for stable patient + CoNS + lock-amenable hardware",
        why: "Rarely successful but considered case-by-case for explant-contraindicated patients" },
    ],
  },
  rationale: {
    driver: "Healthcare-associated ventriculitis is a biofilm + hardware problem — Tunkel IDSA 2017 anchors drain or shunt removal as the dominant outcome lever because systemic antibiotics alone do not sterilize foreign-body-associated CSF infection. Empiric coverage at presentation is vancomycin + cefepime or meropenem (broad GNR + staphylococci) at full CNS-strength dosing, with daily CSF Gram stain + culture + cell count driving narrowing. Duration is 2–3 wk after CSF sterilization, extending to 3–4 wk plus intraventricular adjunct (preservative-free vancomycin or aminoglycoside / colistin) when hardware is retained or CSF positivity persists. Re-shunting timing balances confirmed sterilization with hydrocephalus risk during the EVD bridge period.",
    guideline: "mono",
    rejected: "Systemic-only therapy with hardware retained was deliberately rejected — IDSA 2017 + Beer (Lancet Neurol 2008) anchor explant or externalization as standard, because biofilm renders systemic antibiotics inadequate and salvage rates with retained hardware are < 30%. Standard-dose systemic antibiotics without CNS-strength dosing were tempered: ventricular penetration is poor without aggressive dosing plus, in MDR or refractory cases, intraventricular adjunct delivered by neurosurgery. Stopping at 2 wk without confirmed CSF sterilization was rejected — the 2–3 wk clock starts at clearance, not at presentation, and persistent positivity always triggers escalation." },
  objections: [
    { q: "Why pull the EVD or shunt — can't IV antibiotics sterilize it?",
      a: "Tunkel IDSA 2017 documents salvage rates < 30% with retained hardware versus > 90% cure with explant or externalization, because biofilm on the silicone surface renders systemic antibiotics inadequate at sub-MIC concentrations even with full CNS-strength dosing [cite:mono]. Hardware removal IS the source-control step — antibiotics are adjunctive. Suppressive lock therapy is reserved for the rare irretrievable-hardware substrate after multidisciplinary review." },
    { q: "Why intraventricular antibiotics — IV vanco / cefepime can't reach?",
      a: "Systemic vancomycin achieves only 10–30% of serum levels in ventricular CSF even at AUC 400–600, and cefepime / meropenem similarly underperform when meningeal inflammation wanes [cite:vanco]. For MDR Gram-negatives or persistent CSF positivity, IDSA 2017 anchors preservative-free intraventricular vancomycin (5–20 mg/d) or aminoglycoside / colistin delivered by neurosurgery through the EVD — concentration in CSF, not serum, is what kills the organism [cite:mono]." },
    { q: "Why start the 2-3 wk clock at CSF clearance, not at diagnosis?",
      a: "The 2–3 wk duration band is post-sterilization because the substrate is not under control until cultures clear — Tunkel 2017 explicit on this point [cite:mono]. Counting from presentation risks stopping during active ventricular infection with persistent positives, driving relapse with resistant flora. Daily CSF Gram stain + culture + cell count gates the clock start, and persistent positivity at 48–72 h always triggers intraventricular escalation, not duration shortening." },
  ],
  research: {
    headline: "IDSA 2017 — drain removal mandatory; intraventricular adjunct for MDR / refractory; daily CSF cultures.",
    trials: [
      { name: "Tunkel IDSA 2017",
        n: "Guideline",
        question: "Healthcare-associated ventriculitis modern management",
        finding: "Remove drain + 10–21 d post-removal; intraventricular antibiotics for refractory or MDR; CSF cultures daily",
        bias: "Guideline synthesis" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2017,
        topic: "Ventriculitis / shunt infection (Tunkel)",
        keypoint: "Drain or shunt removal; pathogen-directed; intraventricular for MDR" },
    ],
    openQuestions: [
      "Re-shunting timing — sterilization + stability driven",
      "Optimal intraventricular agent — gentamicin / colistin / vancomycin",
    ],
  },
};

export default { id: "ventriculitis", regimen, decision };
