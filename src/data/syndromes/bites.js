/* ===========================================================
   ANIMAL & HUMAN BITE WOUNDS — Pasteurella (cat / dog),
   Eikenella (human), polymicrobial; amox-clav is workhorse. = */

const regimen = {
  "Standard": [
    {
      rx: /amoxicillin-?clavulanate|ampicillin-?sulbactam/i,
      pickIf: "Mammalian bite (dog, cat, human) needing prophylaxis or treatment.",
      whyPick: [
        "**Amox-clav** PO or **amp-sulbactam** IV — covers Pasteurella, oral anaerobes, MSSA",
        "**Prophylaxis 3–5 d** for: deep, hand/face, immunocompromised, joint/tendon, cat or human bites",
        "Cat bites: high Pasteurella risk — always treat",
        "Human bites: Eikenella + anaerobes — always treat",
      ],
      watchOut: [
        { sev: "warn", text: "**Tetanus update + rabies risk assessment** mandatory" },
        { sev: "warn", text: "Hand bites → splint, elevate, hand surgery consult — closed-fist injuries devastate" },
        { sev: "note", text: "Cefuroxime + metronidazole if PCN allergy alternative" },
      ],
    },
  ],
  "Penicillin allergy": [
    {
      rx: /fluoroquinolone|TMP-?SMX|metronidazole|clindamycin/i,
      pickIf: "Severe PCN allergy — combination needed for full coverage.",
      whyPick: [
        "**FQ or TMP-SMX or doxycycline** for aerobic / Pasteurella coverage",
        "**+ metronidazole or clindamycin** for anaerobic coverage — bite flora polymicrobial",
        "Two-drug combo essential — no single non-β-lactam adequately covers Pasteurella + anaerobes",
        "Confirm anaphylaxis history before defaulting to non-β-lactam — many penicillin allergies are mislabeled",
      ],
      watchOut: [
        { sev: "warn", text: "**Doxycycline ± clindamycin misses Eikenella** in human bites — pair with metronidazole or use FQ" },
        { sev: "warn", text: "**FQ tendinopathy / QT / dysglycemia** — counsel elderly + check QT meds list" },
        { sev: "note", text: "**Allergy delabeling** is the right longer-term move — refer to allergy/immunology" },
      ],
    },
  ],
};

const decision = {
  duration: {
    headline: "Amox-clav 3–5 d prophylaxis; 7–14 d if established infection; deep / hand always treat.",
    evidence: "IDSA 2014 + Cochrane — prophylaxis for high-risk bites (cat, hand, deep, immunocompromised); established infection 7–14 d",
    branches: [
      { label: "Low-risk bite, not infected", days: "0 d",
        detail: "Wound care + irrigation; tetanus + rabies risk assessment; observe for signs of infection" },
      { label: "Prophylaxis (cat bite, hand, deep, immunocompromised)", days: "3–5 d",
        detail: "Amox-clav 875 mg BID; alternative doxy + metronidazole if PCN allergy",
        matchAgent: /amoxicillin-?clavulanate/i },
      { label: "Established infection (cellulitis, purulence)", days: "7–14 d",
        detail: "Amox-clav PO or amp-sulbactam IV; cover Pasteurella (cat/dog) + Eikenella (human)" },
      { label: "Deep / joint / tendon involvement", days: "14–21 d",
        detail: "IV ampi-sulbactam or ertapenem; surgical washout for tenosynovitis; hand surgery consult" },
      { label: "Capnocytophaga (asplenic / immunocompromised)", days: "Per sepsis bands",
        detail: "Severe sepsis — per OPSI + sepsis bands; ceftriaxone or pip-tazo + ID" },
    ],
    stopWhen: [
      "Wound healing + no purulent drainage",
      "Cellulitis resolved",
      "Afebrile",
      "Hand function preserved (if hand bite)",
      "Tetanus + rabies prophylaxis addressed",
      "Minimum 3–5 d (prophylaxis) or 7–14 d (infection) completed",
    ],
    extendIf: [
      { text: "**Tenosynovitis / joint involvement** — surgical + extend",
        matchCtx: { severe: true } },
      "Bacteremia confirmed — per pathogen + source",
      "Capnocytophaga sepsis (asplenic) — per OPSI bands",
      "Inadequate wound care or retained tooth fragment",
    ],
  },
  monitoring: {
    headline: "Irrigate copiously; tetanus + rabies risk assessment; never close cat bites; hand surgery for deep.",
    items: [
      { sev: "required", what: "**Copious irrigation** with saline at presentation",
        why: "Mechanical reduction of bacterial load; single highest-impact wound care step" },
      { sev: "required", what: "**Tetanus prophylaxis** review + booster if indicated",
        why: "Bite wounds are tetanus-prone; standard ATS prophylaxis" },
      { sev: "required", what: "**Rabies risk assessment** for animal bites",
        why: "Public health reporting + post-exposure prophylaxis decisions; species + exposure + animal availability" },
      { sev: "trigger", what: "**Hand surgery consult** for hand bites + deep wounds",
        why: "Tenosynovitis + closed-space infection require surgical washout; hand function preservation" },
      { sev: "trigger", what: "**Cover Pasteurella** for cat / dog bites + Eikenella for human",
        why: "Amox-clav covers both + anaerobes; clinda + cipro misses Pasteurella; pick agent carefully" },
      { sev: "trigger", what: "**Do NOT primarily close cat bites** + most hand bites",
        why: "High infection rate; delayed closure or secondary intention; cosmetic-driven closure on face OK" },
      { sev: "trigger", what: "**HIV + hepatitis B/C prophylaxis** for human bite + blood exposure",
        why: "Bloodborne pathogen risk assessment; PEP if indicated" },
      { sev: "consider", what: "**Imaging** if FB suspected (tooth fragment, dirt)",
        why: "Retained FB drives persistent infection; X-ray or US" },
    ],
  },
  rationale: {
    driver: "Amox-clav is the workhorse — it covers the bite-specific pathogens (Pasteurella in cat / dog, Eikenella in human) plus oral anaerobes + skin GPC in a single agent. Prophylaxis × 3–5 d is indicated for high-risk wounds (cat bites, hand bites, deep / puncture wounds, immunocompromised host); established infection runs 7–14 d, and deep / joint / tendon involvement extends to 14–21 d with hand-surgery washout (IDSA 2014 / Stevens). Tetanus prophylaxis + rabies risk assessment + closure decisions (do NOT primarily close cat / hand bites) carry equal clinical weight.",
    guideline: "ssti",
    rejected: "Clindamycin + ciprofloxacin or cephalexin alone were deliberately rejected as primary empirics — both miss Pasteurella (cephalexin) or Eikenella (clinda + cipro misses Pasteurella, and Eikenella is intrinsically resistant to clindamycin), and IDSA 2014 documents treatment failures with these regimens. Primary surgical closure of cat or hand bites was rejected: infection rates are prohibitive, and delayed closure or secondary intention is the safer default. Withholding tetanus booster or rabies risk assessment was tempered — bites are tetanus-prone and rabies is a public-health priority." },
  objections: [
    { q: "Why amoxicillin-clavulanate for every bite — not just cephalexin?",
      a: "Bites are polymicrobial: oral anaerobes plus Pasteurella multocida (cats/dogs) and Eikenella corrodens (humans). Cephalexin misses Pasteurella and Eikenella; amox-clav covers both plus anaerobes in one agent. IDSA 2014 endorses amox-clav as the empiric standard for prophylaxis and established infection [cite:ssti]." },
    { q: "Why prophylaxis for some bites but not others?",
      a: "Prophylaxis is indicated for cat bites (deep puncture, high Pasteurella rate), hand/face/genital bites, bites with crush injury, immunocompromised hosts, and bites near prosthetic joints. Low-risk superficial dog bites in healthy hosts may be observed with wound care alone. Tetanus and rabies assessment separate from antibiotic decision [cite:ssti]." },
    { q: "What if the patient is penicillin-allergic?",
      a: "Doxycycline plus metronidazole, or moxifloxacin monotherapy, cover Pasteurella, Eikenella, and oral anaerobes. Avoid cephalexin plus metronidazole (misses Pasteurella reliably). Clarify allergy history — many labeled allergies tolerate cephalosporins; true IgE-mediated penicillin allergy warrants the alternatives above [cite:ssti]." },
  ],
  research: {
    headline: "Amox-clav workhorse covers Pasteurella + Eikenella + anaerobes; tetanus + rabies risk assessment + hand surgery for deep.",
    trials: [
      { name: "Talan IDSA 2014 / Stevens",
        n: "Guideline",
        question: "Modern bite wound management",
        finding: "Amox-clav covers Pasteurella (cat/dog) + Eikenella (human); 3–5 d prophylaxis for high-risk; 7–14 d for established infection",
        bias: "Guideline synthesis" },
    ],
    guidelines: [
      { society: "IDSA",
        year: 2014,
        topic: "Bite wound infections (Stevens)",
        keypoint: "Amox-clav; do NOT primarily close cat / hand bites; tetanus + rabies + HIV/HBV assessment" },
    ],
    openQuestions: [
      "Capnocytophaga workup in asplenic + dog bite — high-risk",
      "Closure decisions — cat / hand / face differ",
    ],
  },
};

export default { id: "bites", regimen, decision };
