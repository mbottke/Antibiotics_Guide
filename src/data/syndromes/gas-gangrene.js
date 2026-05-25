/* ===========================================================
   CLOSTRIDIAL MYONECROSIS (GAS GANGRENE) — surgical emergency;
   penicillin + clindamycin; HBO controversial; rapid course. = */

const regimen = {
  "Empiric": [
    {
      rx: /penicillin.*clindamycin|piperacillin|carbapenem/i,
      pickIf: "Gas gangrene (clostridial myonecrosis) — crepitus + rapid spread.",
      whyPick: [
        "**Penicillin + clindamycin + broad coverage** (pip-tazo or carbapenem)",
        "**SURGERY NOW** — debridement to viable tissue / amputation",
        "**Hyperbaric oxygen** adjunctive where available — does NOT delay surgery",
        "**Clindamycin essential** for alpha-toxin suppression — continue until clinically stable",
      ],
      watchOut: [
        { sev: "stop", text: "**Surgery is the treatment** — antibiotics alone uniformly fail; mortality ~25–50% even with timely OR" },
        { sev: "warn", text: "**Pain out of proportion + crepitus + hemorrhagic bullae** → operate on clinical suspicion; don't wait for imaging" },
        { sev: "note", text: "Re-explore q24h until margins clean — clostridial infection extends silently under antibiotic cover" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "10–14 d post-surgical clearance; penicillin + clindamycin; surgical debridement is the treatment.",
    evidence: "IDSA 2014 — surgery + penicillin + clindamycin; HBO adjunct controversial; rapid lethality without surgery",
    branches: [
      { label: "Clostridial myonecrosis confirmed", days: "10–14 d post-op",
        detail: "Penicillin G 4 MU IV q4h + clindamycin 900 mg IV q8h; aggressive serial debridement",
        matchAgent: /penicillin|clindamycin/i },
      { label: "Polymicrobial gas-forming infection", days: "10–14 d",
        detail: "Pip-tazo or carbapenem + clindamycin; cover anaerobes + GNR + GPC" },
      { label: "Post-surgical / traumatic with extensive necrosis", days: "Per surgical adequacy",
        detail: "Continue until debridement complete + clinical resolution; multi-stage surgery typical" },
      { label: "Immunocompromised / underlying malignancy", days: "≥ 14 d post-op",
        detail: "Extended course; consider ID consult; rule out C. septicum + GI source" },
    ],
    stopWhen: [
      "Surgical margins clean on serial debridement",
      "No gas on imaging / re-imaging",
      "Off vasopressors + clinical stability",
      "Wound closing / negative-pressure dressing working",
      "Minimum 10–14 d post final debridement completed",
    ],
    extendIf: [
      { text: "**Persistent surgical disease** — continue until margins clean",
        matchCtx: { severe: true } },
      "Bacteremia confirmed — per pathogen",
      "Underlying malignancy (C. septicum) — colonoscopy workup",
      "Inadequate source control — re-explore + re-debride",
    ],
  },
  monitoring: {
    headline: "Surgical debridement is the cure; penicillin + clindamycin; rule out malignancy if C. septicum.",
    items: [
      { sev: "required", what: "**Emergent surgical debridement** at presentation",
        why: "Mortality without surgery > 90%; antibiotics alone insufficient" },
      { sev: "required", what: "**Serial re-look surgery q12–24h** until margins clean",
        why: "Necrosis extends silently; surgical adequacy is the bedside metric" },
      { sev: "required", what: "**Imaging** — CT or plain film for gas in tissues",
        why: "Diagnostic confirmation; planning surgical extent" },
      { sev: "trigger", what: "**Colonoscopy** if Clostridium septicum identified",
        why: "C. septicum bacteremia / myonecrosis strongly associated with occult colon cancer" },
      { sev: "trigger", what: "**Anti-MRSA agent** if mixed flora suspected",
        why: "Polymicrobial cases include S. aureus; standard part of empiric in U.S.",
        matchCtx: { mrsaRisk: true } },
      { sev: "trigger", what: "**ICU level care** + vasopressor support",
        why: "Septic shock + multi-organ failure common; high-acuity substrate" },
      { sev: "trigger", what: "**Reconstructive surgery referral** after debridement complete",
        why: "Multi-stage closure planning; flap or graft typical" },
      { sev: "consider", what: "Hyperbaric oxygen where institutionally available + non-delaying",
        why: "Evidence weak / contested; NEVER delay surgery for HBO; adjunct only" },
    ],
  },
  rationale: {
    driver: "Gas gangrene is a surgical emergency — C. perfringens (or C. septicum after GI translocation) generates alpha-toxin (phospholipase C) and theta-toxin (perfringolysin O) that lyse muscle and vascular endothelium, producing the characteristic crepitant, anesthetic, necrotic limb with mortality > 90% if surgery is delayed. Therapy is multi-modal: emergent serial debridement to clean margins (the cure), high-dose penicillin G 4 MU IV q4h (cidal vs Clostridium), and clindamycin 900 mg IV q8h to halt ribosomal toxin synthesis at high inocula (the Eagle effect). C. septicum mandates colonoscopy on recovery — strong association with occult colon cancer.",
    guideline: "ssti",
    rejected: "Antibiotic-only or HBO-first management was deliberately rejected — the IDSA 2014 SSTI guideline anchors outcome to operative debridement within hours; antibiotics alone do not penetrate ischemic, gas-laden necrotic muscle. Hyperbaric oxygen is reserved as adjunct only where institutionally available without delay, and Brown (Surg Infect 2014) plus the IDSA 2014 panel agree HBO must never postpone surgery. Penicillin monotherapy without clindamycin was tempered: toxin production continues unless ribosomal synthesis is blocked." },
  objections: [
    { q: "Why both penicillin AND clindamycin — isn't penicillin curative?",
      a: "Clostridium perfringens elaborates alpha-toxin (phospholipase C) and theta-toxin (perfringolysin O) that drive myonecrosis and shock — penicillin is cidal but does not stop ongoing toxin production. Clindamycin blocks bacterial ribosome (50S) and halts toxin synthesis at any inoculum or growth phase per IDSA 2014 [cite:ssti]. Stevens animal models show clindamycin survival benefit over penicillin monotherapy. Combine until clinical resolution + surgical clearance." },
    { q: "Why surgery first — can't antibiotics buy time?",
      a: "Mortality without surgical debridement exceeds 90% — alpha-toxin destroys tissue faster than antibiotic distribution can suppress organism load. IDSA 2014 [cite:ssti] mandates emergent OR within hours, with serial re-look q12-24h until margins are clean. Antibiotics are adjunct; the curative step is removal of devitalized tissue. Hyperbaric oxygen never substitutes for or delays surgery — that delay is the killer." },
    { q: "Why colonoscopy after recovery — patient looks well?",
      a: "Clostridium septicum bacteremia or myonecrosis carries a 50-80% association with occult colorectal malignancy (Bryant CID 2009) — the malignant mucosal breach is the portal. Mandatory colonoscopy + age-appropriate hematologic workup after clinical recovery per IDSA 2014 [cite:ssti]. Missing the underlying tumor at the index admission means a second clostridial event months later, often fatal. This is non-negotiable for any C. septicum isolate." },
    { q: "Why not just pip-tazo — it covers Clostridium and more?",
      a: "Pip-tazo covers Clostridium in vitro but lacks the ribosomal toxin-suppression mechanism that drives the survival benefit in clostridial myonecrosis — the alpha and theta toxin output is what kills, not the inoculum [cite:ssti]. Penicillin G high-dose + clindamycin is the IDSA 2014 standard; pip-tazo monotherapy is appropriate only for polymicrobial gas-forming infection where clostridial component is one of many, and clindamycin should still be added for toxin suppression." },
  ],
  research: {
    headline: "Surgery is the cure; mortality > 90% without; rapid debridement + penicillin + clindamycin; HBO contested.",
    trials: [
      { name: "Stevens IDSA 2014",
        n: "Guideline",
        question: "Gas gangrene optimal management",
        finding: "Surgical debridement within hours + penicillin + clindamycin (toxin suppression); HBO adjunctive only where non-delaying",
        bias: "Guideline; pre-modern HBO RCTs lacking" },
      { name: "Bryant CID 2009",
        n: "Cohort",
        question: "C. septicum vs perfringens outcomes",
        finding: "C. septicum strongly associated with occult colon cancer; mandatory colonoscopy after clinical recovery",
        bias: "Observational; signal consistent across cohorts" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2014,
        topic: "SSTI including gas gangrene (Stevens)",
        keypoint: "Emergent surgery + penicillin + clindamycin; HBO adjunct only if non-delaying" },
    ],
    openQuestions: [
      "HBO clinical benefit — observational support; never delay surgery",
      "C. septicum workup completeness — colonoscopy + hematology evaluation",
      "Optimal post-debridement duration — clinical + surgical-margin driven",
    ],
  },
};

export default { id: "gas-gangrene", regimen, decision };
