/* engine · case-parser — free-text case description → partial caseState (pure).
   Phase A.1 of the bedside reframe. v1 is regex-only and conservative: the
   parser returns each successfully-matched substring as a "chip" so the Case
   Bar can show exactly what it understood, and exposes whatever it could not
   match as the rump of the input for the user to correct. We never silently
   misinterpret — when in doubt, leave it unmatched and surface a chip.

   Output shape:
     parseCase("72M PNA prior MRSA CrCl 35") →
     {
       patient: { age:72, sex:"M", mrsaRisk:true, scr:<back-calc>, on:true },
       syndrome: "cap",
       chips: [{ kind, label, raw }, ...],   // what the parser claimed
       rump: "..."                            // the input minus claimed spans
     }

   Inpatient Antibiotic Guide — module graph documented in README.md. */

/* ---------- syndrome keyword map ----------
   Ordered: more specific phrases come first so "septic shock" hits sepsis
   (with severe=true) before generic "shock" tokens would match anything
   else. The third tuple element seeds any additional patient flags the
   syndrome name implies (severe for shock, etc.).

   When extending: each pattern must be specific enough that it does NOT
   match a more general syndrome name listed BELOW it. Verified via the
   self-test in tests/case-parser.test.js — every syndrome `name` from
   data/syndromes.js must round-trip to its own id through this map. */
const SYN_KEYWORDS = [
  /* === Sepsis specifics (named patterns before generic shock/sepsis) === */
  [/\b(?:overwhelming\s+)?post-?splenectomy\s+infection\b|\bopsi\b/i, "opsi",            {}],
  [/\basplenia\s*[:\s-]\s*acute|\basplenia\s*(?:prophylaxis|febrile|standby)|acute\s*febrile\s*illness\s*(?:in\s*)?asplen/i, "asplenia-prophylaxis", {}],
  [/\basplenic|asplenia|hyposplenic|hyposplenia|post-?splenectomy/i, "sepsis-asplenia", {}],
  [/\bfebrile\s*neutropenia\b|\bfeb\s*neut\b/i,  "febneut",            {}],
  [/\btyphlitis\b|neutropenic\s*enterocolit/i,   "typhlitis",          {}],
  [/\bneutropenic\s*pneumonia\b|pneumonia\s*in\s*(?:the\s*)?(?:neutropenic|transplant)|transplant\s*pneumonia\b/i, "neutropenic-pna", {}],
  [/\bneutropenic\s*(?:fever|sepsis)\b/i,        "sepsis-neutropenic", {}],
  [/\bsepsis\s+with\s+a\s+toxin|toxin-?mediated\s+pattern/i, "sepsis-toxic",  { severe:true }],
  [/\btoxic\s*shock(?:\s*syndrome)?\b|\btss\b/i, "tss",                { severe:true }],
  [/\bseptic\s*shock\b/i,                        "sepsis",             { severe:true }],
  [/\bsevere\s*sepsis\b/i,                       "sepsis",             { severe:true }],
  [/\bhealthcare-?associated\s*sepsis\b|\bhcap\s*sepsis\b|\bhca[-\s]?sepsis\b|\bhcaq\b/i, "sepsis-hcaq", {}],
  [/\babdominal\s*sepsis\b|\bsepsis.{0,40}abdominal\s*source\b|\bintra-?abdominal\s*sepsis\b/i, "sepsis-abdominal", {}],

  /* === Respiratory === */
  [/\bzoonotic.{0,30}pneumonia\b|\bq\s*fever\b|\bpsittacosis\b|\btularemia\b|\bleptospir/i, "zoonotic-pna", {}],
  [/\bventilator-?associated\s+tracheobronchitis\b|\bvat\b(?!\s*[a-z])/i, "vat",         {}],
  [/\bpost-?obstructive\s*pneumonia\b|\bpostobstructive\s*pne|\bobstructive\s*pneumonia\b/i, "postobstructive", {}],
  [/\bacute\s+(?:bacterial\s+)?tracheobronchit|\bacute\s+bronchitis\b|\bpertussis\b|\btracheobronchit/i, "tracheobronchitis", {}],
  [/\bhap\b|\bvap\b|\bventilator-?associated|hospital-?acquired\s*pne/i, "hap",          {}],
  [/\bcap\b|\bcommunity-?acquired\s*pne/i,       "cap",                {}],
  [/\baspiration\s*pne|aspiration\s*pneumonia\b|\blung\s*abscess\b/i, "aspiration",      {}],
  [/\bsubdural\s*empyema\b/i,                    "subdural-empyema",   {}],   // must precede generic empyema
  [/\bempyema\b|\bparapneumonic\b|\bcomplicated\s*pleural\s*effusion\b/i, "empyema",     {}],
  [/\bcopd\s*exacerb|aecopd\b|\bcopd\s*flare\b/i,"copd",               {}],
  [/\bbronchiectasis\b/i,                        "bronchiectasis",     {}],
  [/\bpneumonia\b|\bpna\b/i,                     "cap",                {}],  // fallback after specifics

  /* === Bloodstream & cardiac === */
  [/\bpersistent\s*mrsa\s*(?:bacterem|bsi)/i,    "persistent-mrsa",    {}],
  [/\bpseudomonas\s*bacterem|\bpseudo\s*bact\b|\bpseudomonal\s*bsi\b/i, "pseudo-bact",   {}],
  [/\bvre\s*bacterem|vancomycin-?resistant\s*entero[a-z]*\s*bacterem/i, "vre-bact", {}],
  [/\bpolymicrobial\s*(?:bacterem|bsi)/i,        "polymicrobial-bact", {}],
  [/\bstreptococcal\s*bacterem|\bstrep\s*bacterem/i, "strep-bact",     {}],
  [/\blemierre\b|\bseptic\s*thrombophlebit/i,    "lemierre",           {}],
  [/\bendophthalmit/i,                           "endophthalmitis",    {}],
  [/\bmycotic\s*(?:\([^)]*\)\s*)?aneurysm\b|\binfected\s*aneurysm\b/i, "mycotic-aneurysm", {}],
  [/\bvascular\s*graft\s*infect|\bcied\s*infect|\blvad\s*infect|\bpacemaker\s*infect|\bicd\s*infect/i, "device-vascular", {}],
  [/\bsab\b|\bstaph(?:ylococcus)?\s*aureus\s*bacterem|\bs\.?\s*aureus\s*bacterem/i, "sab", {}],
  [/\bcons\b|coagulase-?negative\s*staph(?:ylococcal)?\s*(?:bacterem|bsi)|\bs\.?\s*epidermidis\s*bacterem/i, "cons", {}],
  [/\bgnr\s*bacterem|gram-?negative\s*bacterem/i,"gnbact",             {}],
  [/\bcrbsi\b|catheter-?related\s*(?:blood|bsi)|\bclabsi\b/i, "crbsi", {}],
  [/\bpve\b|prosthetic\s*valve\s*(?:endocard|ie\b)|(?:\bie\b|endocard[a-z]*)[\s—\-]+(?:on\s+)?(?:a\s+|the\s+)?prosthetic\s*valve/i, "ie-pve", {}],
  [/\bnve\b|native\s*valve\s*(?:endocard|ie\b)|(?:\bie\b|endocard[a-z]*)[\s—\-]+(?:on\s+)?(?:a\s+|the\s+)?native\s*valve/i, "ie-native", {}],
  [/\b(?:infective\s*)?endocarditis\b|\bie\b(?!\s*\.)/i, "ie",         {}],
  [/\bentero(?:coccal)?\s*bacterem/i,            "entbact",            {}],

  /* === Genitourinary === */
  [/\bemphysematous\s*(?:pyelo|cystit|uti)/i,    "emphysematous-uti",  {}],   // before plain pyelo/cystitis
  [/\burosepsis\b|\bobstructive\s*pyelo|\bobstructed\s*pyelo/i, "urosepsis", { severe:true }],
  [/\basymptomatic\s*bacteriuria\b|\basb\b(?![a-z])|\basymp\s*bact\b/i, "asymp-bact", {}],
  [/\btransplant\s*uti\b|uti\s+in\s+(?:the\s+)?(?:renal\s+)?transplant|renal\s*transplant\s*recipient/i, "transplant-uti", {}],
  [/\bscrotal\s*abscess\b|testicular\s*abscess\b/i, "scrotal-abscess", {}],
  [/\bpid\b|pelvic\s*inflammatory\s*disease\b/i, "pid",                {}],   // listed first so PID's own name (which mentions TOA) routes correctly
  [/\btubo-?ovarian\s*absc/i,                    "tubo-ovarian",       {}],
  [/\brenal\s*abscess\b|perinephric\s*abscess\b|\brenal\s*carbuncle\b/i, "renalabscess", {}],
  [/\bcystitis\b|\bsimple\s*uti\b|\blower\s*uti\b/i, "cystitis",       {}],
  [/\bpyelo(?:nephritis)?\b|\bupper\s*(?:tract|uti)\b|complicated\s*uti\b/i, "pyelo",   {}],
  [/\bcauti\b/i,                                 "cauti",              {}],
  [/\bprostatitis\b/i,                           "prostatitis",        {}],
  [/\bepididymo-?orchit|\bepididymit|\borchitis\b/i, "epididymo",      {}],
  [/\buti\b/i,                                   "cystitis",           {}],

  /* === Intra-abdominal === */
  [/\bsbp\b|\bspontaneous\s*bacterial\s*peritonitis\b/i, "sbp",        {}],
  [/\bpd[-\s]*peritonit|\bperitoneal\s*dialysis[-\s]*(?:associated\s+)?peritonit/i, "pd-peritonitis", {}],
  [/\bpyogenic\s*liver\s*abscess\b|\bliver\s*abscess\b|hepatic\s*abscess\b/i, "liverabscess", {}],
  [/\bsplenic\s*abscess\b/i,                     "splenic-abscess",    {}],
  [/\bappendicitis\b|appendiceal\s*abscess\b/i,  "appendicitis",       {}],
  [/\btoxic\s*megacolon\b|\bfulminant\s*colitis\b|\bsevere\s*colitis\b/i, "toxic-megacolon", {}],
  [/\bmesenteric\s*ischem|bowel\s*ischem|\bbowel\s*perforat|intestinal\s*perforat/i, "mesenteric-isch", {}],
  [/\bcholangitis\b|\bcholecystit/i,             "cholangitis",        {}],
  [/\bdiverticulit/i,                            "diverticulitis",     {}],
  [/\binfected\s*pancreatic\s*necros|pancreatic\s*necros|infected\s*necrotizing\s*pancreatit|\bpancreatic\s*abscess\b/i, "pancreatic", {}],
  [/\bperitonitis\b|\biai\b|\bintra-?abdominal/i,"peritonitis",        {}],

  /* === Skin, soft tissue & bone === */
  [/\bvert(?:ebral)?\s*osteo(?:myelitis)?\b|\bdiscit|\bspond(?:ylo)?discit/i, "vertosteo", {}],
  [/\borbital\s*(?:\([^)]*\)\s*)?cellulit|post-?septal\s*cellulit/i, "orbital",  {}],   // before generic cellulitis
  [/\bludwig|deep\s*neck\s*(?:space\s*)?infect|retropharyngeal\s*abscess\b|parapharyngeal\s*abscess\b/i, "ludwig", {}],
  [/\berysipelas\b/i,                            "erysipelas",         {}],
  [/\blymphangit/i,                              "lymphangitis",       {}],
  [/\bhidradenit/i,                              "hidradenitis",       {}],
  [/\binfected\s*(?:venous|arterial|leg)|(?:venous|arterial|leg).{0,30}ulcer.{0,10}infect|venous\s*stasis\s*ulcer\s*infect/i, "infected-ulcer", {}],
  [/\bperianal\s*abscess\b|perirectal\s*abscess\b|ischiorectal\s*abscess\b/i, "perianal-abscess", {}],
  [/\bfournier\b/i,                              "fournier",           { severe:true }],
  [/\bbursit/i,                                  "bursitis",           {}],
  [/\bpyomyosit/i,                               "pyomyositis",        {}],
  [/\binfected\s*pressure\s*(?:injury|ulcer)|pressure\s*(?:ulcer|injury|sore)\s*infect|\bdecubitus\s*ulcer\s*infect|sacral\s*ulcer\s*infect|\bdecubitus\b/i, "pressure", {}],
  [/\bcapnocytophaga\b|\bcapno\b(?![a-z])/i,     "capno",              {}],   // before "bites" so Capnocytophaga + dog bite resolves correctly
  [/\bbite\s*wound|\b(?:dog|cat|human|animal)\s*bite\b/i, "bites",     {}],
  [/\bmastit|\bbreast\s*abscess\b/i,             "mastitis",           {}],
  [/\bssi\b|surgical\s*site\s*infect|wound\s*infect/i, "ssi",          {}],
  [/\bmediastinit/i,                             "mediastinitis",      {}],
  [/\bcellulitis\b/i,                            "cellulitis",         {}],
  [/\bpurulent\s*ssti\b|\bcutaneous\s*abscess\b|\bskin\s*abscess\b|\bfuruncle\b|\bcarbuncle\b|\bboil\b/i, "purulent", {}],
  [/\bnec(?:rotizing)?\s*(?:fasc|sti|soft-?tissue)|\bnsti\b|\bnf\b(?![a-z])/i, "necfasc", { severe:true }],
  [/\bdfi\b|\bdiabetic\s*foot/i,                 "dfi",                {}],
  [/\bpji\b|\bprosthetic\s*joint/i,              "pji",                {}],
  [/\bseptic\s*arthritis\b|\bnative\s*joint\s*infect/i, "septic-arthritis", {}],
  [/\bosteo(?:myelitis)?\b/i,                    "osteo",              {}],

  /* === CNS === */
  [/\bventriculit/i,                             "ventriculitis",      {}],
  [/\bpost-?(?:nsx|neurosurg)|healthcare-?associated\s*meningitis\b|nosocomial\s*meningitis\b|post-?neurosurgical\s*meningitis\b/i, "post-nsx-meningitis", {}],
  [/\bcavernous\s*sinus\s*thromb|\bseptic\s*cavernous/i, "cavernous-thromb", {}],
  [/\bcsf\s*(?:shunt|drain)|\bshunt\s*infect|\bvp\s*shunt|\bevd\s*infect/i, "shunt-infection", {}],
  [/\bneuroborrelios|neurosyphilis|\blyme\s*meningit|\btabes\s*dorsalis\b/i, "neuro-lyme-syphilis", {}],
  [/\bbrain\s*abscess\b|cerebral\s*abscess\b/i,  "brainabscess",       {}],
  [/\bepidural\s*abscess\b|spinal\s*epidural\s*absc/i, "epidural",     {}],
  [/\bmeningitis\b/i,                            "meningitis",         {}],

  /* === Toxin-mediated & GI === */
  [/\bc[\.\s-]*diff(?:icile)?\b|\bcdi\b(?![a-z])|clostridioides\s*difficile|clostridium\s*difficile/i, "cdiff", {}],
  [/\bgas\s*gangrene\b|clostridial\s*myonecros/i,"gas-gangrene",       { severe:true }],
  [/\btetanus\b/i,                               "tetanus",            {}],
  [/\bbotulism\b/i,                              "botulism",           {}],
  [/\benteric\s*fever\b|\btyphoid\b|\bparatyphoid\b/i, "enteric-fever", {}],
  [/\bsevere\s*(?:bacterial\s*)?gastroenterit|severe\s*diarrhea\b|invasive\s*diarrhea\b|\bshigellos|\bsalmonellos|invasive\s*campylobacter/i, "severe-gastroenteritis", {}],

  /* === Immunocompromised host === */
  [/\bcandidem|\bcandida\s*(?:bsi|bacterem|bloodstream)/i, "candidemia", {}],
  [/\bnocardios|\bnocardia\b/i,                  "nocardia",           {}],
  [/\blisterios|\blisteria\b/i,                  "listeria",           {}],
  [/\bsot\s*infect|solid-?organ\s*transplant|post-?transplant\s*infect|infection\s+in\s+(?:the\s+)?(?:solid-?organ\s+)?transplant/i, "sot-infection", {}],
  [/\bbiologic[s]?\s*(?:infect|therapy|immunotherapy)|targeted\s*immunotherapy|infection\s+on\s+biologic|\btnf\s*(?:inhibitor|alpha)|jak\s*inhibitor\s*infect/i, "biologic-infection", {}],
  [/\bcgd\b|chronic\s*granulomatous\s*disease|defined\s*immune\s*defect|immune\s*defect.{0,20}pathogen|pathogen\s*pattern/i, "cgd-defect", {}],

  /* === Generic fallbacks (last) === */
  [/\bsepsis\b/i,                                "sepsis",             {}],  // generic fallback
];

/* ---------- resistance / risk keywords (free-text patient context) ----------
   These differ from data/risk-keywords.js, which matches tier KEYS like "Add
   MRSA". Here we match patient-description phrases. Positive-context only —
   "no MRSA" returns mrsaRisk=true in v1; the Case Bar surfaces the chip so
   the user can correct it. */
const RISK_PATTERNS = [
  { rx: /\b(?:prior\s+)?mrsa(?:\s+(?:history|isolate|colon|risk))?\b/i, set: { mrsaRisk:true }, label: "MRSA risk" },
  { rx: /\bgram-?positive\s+source\b/i,                                 set: { mrsaRisk:true }, label: "MRSA risk" },
  { rx: /\b(?:prior\s+)?pseudomonas(?:\s+(?:history|isolate|colon|risk))?\b/i, set: { pseudoRisk:true }, label: "Pseudomonas risk" },
  { rx: /\bstructural\s+lung\s+disease\b|\bbronchiectasis\b|\bcf\b/i,   set: { pseudoRisk:true }, label: "Pseudomonas risk" },
  { rx: /\besbl\b/i,                                                    set: { esblRisk:true },  label: "ESBL risk" },
  { rx: /\b(?:cre|kpc|ndm|carbapenem-?resistant)\b/i,                   set: { esblRisk:true },  label: "Resistant-GNR risk" },
  { rx: /\bampc\b/i,                                                    set: { esblRisk:true },  label: "AmpC risk" },
  { rx: /\bsepti?c?\s*shock\b/i,                                        set: { severe:true },    label: "Septic shock" },
  { rx: /\bshock\b/i,                                                   set: { severe:true },    label: "Shock" },
  { rx: /\bicu\b|\bintubated\b|\bvasopressor/i,                         set: { severe:true },    label: "ICU / critical" },
];

/* ---------- β-lactam allergy patterns ----------
   Severity ordered specific-first. "Severe" requires a named SCAR or
   anaphylaxis phrasing; "mild" matches rash / hives / urticaria; otherwise
   any reference to a β-lactam allergy without a severity term defaults to
   mild (the Case Bar lets the user escalate). */
const ALLERGY_PATTERNS = [
  { rx: /\b(?:anaphylax(?:is|y)?|anaphylact(?:ic|oid)?|sjs|dress|tens?\b|stevens-?johnson|angioedema)\b/i, sev: "severe", label: "Severe β-lactam allergy" },
  { rx: /\b(?:rash|hives|urticari|itch)\b[^.,;]{0,40}\b(?:pcn|penicillin|amoxicillin|cephalo?sporin|β?-?lactam|ampicillin)\b/i, sev: "mild", label: "Low-risk β-lactam allergy" },
  { rx: /\b(?:pcn|penicillin|amoxicillin|cephalo?sporin|β?-?lactam|ampicillin)\b[^.,;]{0,40}\b(?:rash|hives|urticari|itch|gi|nausea|vomit)\b/i, sev: "mild", label: "Low-risk β-lactam allergy" },
  { rx: /\b(?:pcn|penicillin|β?-?lactam)\s+(?:allergy|reaction|intoleran)/i, sev: "mild", label: "β-lactam allergy" },
];

/* ---------- hepatic patterns ---------- */
const HEPATIC_PATTERNS = [
  { rx: /\bcp[-\s]?c\b|\bchild[-\s]?pugh\s*c\b/i,   set: "severe",   label: "Child-Pugh C" },
  { rx: /\bcp[-\s]?b\b|\bchild[-\s]?pugh\s*b\b/i,   set: "moderate", label: "Child-Pugh B" },
  { rx: /\bcp[-\s]?a\b|\bchild[-\s]?pugh\s*a\b/i,   set: "none",     label: "Child-Pugh A" },
  { rx: /\bdecompensated\s+cirrhosis\b/i,           set: "severe",   label: "Decompensated cirrhosis" },
  { rx: /\bcirrhosis\b|\bcirrhotic\b/i,             set: "moderate", label: "Cirrhosis" },
];

/* ---------- atomic regexes (kept here so tests can probe them directly) ---- */
const RX = {
  ageSex:  /\b(\d{1,3})\s*([MmFf])\b/,
  age:     /\b(\d{1,3})\s*(?:y\s*\/\s*o|yo|y\.?o\.?|year[s]?\s*old|years?\b)/i,
  sexWord: /\b(male|female)\b/i,
  wtKg:    /\b(\d{2,3}(?:\.\d)?)\s*kg\b/i,
  crcl:    /\b(?:crcl|cr\s*cl|creatinine\s*clearance)\s*[:=]?\s*(\d{1,3}(?:\.\d+)?)\b/i,
  scr:     /\b(?:scr|s\.?cr\.?|creatinine|cr)\s*[:=]?\s*(\d(?:\.\d+)?)\s*(?:mg\/dl|mg)?\b/i,
  hd:      /\b(?:on\s*hd|hemodialys|h\s*\/\s*d|esrd\s*on\s*hd|dialys)/i,
};

/* Push a chip and grow the consumed-span list. */
function _claim(state, raw, chip) {
  if(!raw) return;
  state.chips.push({ ...chip, raw });
  state.spans.push(raw);
}

function _applyToPatient(state, set) {
  Object.assign(state.patient, set);
}

/* Compute the rump: the input minus every claimed substring, collapsed
   to whitespace. Useful for the Case Bar to show "couldn't parse: ..." */
function _rump(text, spans) {
  let s = text;
  for(const span of spans) {
    const idx = s.toLowerCase().indexOf(span.toLowerCase());
    if(idx >= 0) s = s.slice(0, idx) + s.slice(idx + span.length);
  }
  return s.replace(/[\s,;]+/g, " ").trim();
}

function parseCase(text) {
  const state = {
    patient: {},
    syndrome: null,
    chips: [],
    spans: [],
  };
  if(!text || typeof text !== "string") {
    return { patient: state.patient, syndrome: null, chips: [], rump: "" };
  }

  // 1. Demographics — try combined "72M" first, fall back to separate tokens.
  let m;
  if((m = text.match(RX.ageSex))) {
    state.patient.age = +m[1];
    state.patient.sex = m[2].toUpperCase();
    _claim(state, m[0], { kind:"demo", label: `${state.patient.age}${state.patient.sex}` });
  } else {
    if((m = text.match(RX.age)))     { state.patient.age = +m[1]; _claim(state, m[0], { kind:"demo", label: `${m[1]} y` }); }
    if((m = text.match(RX.sexWord))) { const s = m[1][0].toUpperCase(); state.patient.sex = s; _claim(state, m[0], { kind:"demo", label: s === "F" ? "Female" : "Male" }); }
  }
  if((m = text.match(RX.wtKg))) { state.patient.weightKg = +m[1]; _claim(state, m[0], { kind:"demo", label: `${m[1]} kg` }); }

  // 2. Renal function. CrCl is back-calc'd to SCr via inverted Cockcroft-Gault
  // when age + weight + sex are also present (this is the dosing reference).
  // SCr provided directly always wins.
  let parsedCrcl = null;
  if((m = text.match(RX.crcl))) { parsedCrcl = +m[1]; _claim(state, m[0], { kind:"lab", label: `CrCl ${parsedCrcl}` }); }
  if((m = text.match(RX.scr)))  { state.patient.scr = +m[1]; _claim(state, m[0], { kind:"lab", label: `SCr ${m[1]}` }); }
  if(parsedCrcl != null && state.patient.scr == null &&
     state.patient.age != null && state.patient.weightKg != null && state.patient.sex) {
    const coef = state.patient.sex === "F" ? 0.85 : 1.0;
    const scr = ((140 - state.patient.age) * state.patient.weightKg * coef) / (72 * parsedCrcl);
    if(scr > 0.1 && scr < 25) state.patient.scr = Math.round(scr * 10) / 10;
  }

  if(RX.hd.test(text)) {
    const raw = (text.match(RX.hd) || [""])[0];
    state.patient.hd = true;
    _claim(state, raw, { kind:"renal", label: "on HD" });
  }

  // 3. Hepatic — pick the strongest matching pattern, then claim.
  for(const p of HEPATIC_PATTERNS) {
    const mm = text.match(p.rx);
    if(mm) {
      state.patient.hepatic = p.set;
      _claim(state, mm[0], { kind:"hepatic", label: p.label });
      break;
    }
  }

  // 4. Resistance / severity risks — accumulate; multiple may apply.
  for(const p of RISK_PATTERNS) {
    const mm = text.match(p.rx);
    if(mm) {
      _applyToPatient(state, p.set);
      _claim(state, mm[0], { kind:"risk", label: p.label });
    }
  }

  // 5. β-lactam allergy — pick the most specific severity match.
  for(const p of ALLERGY_PATTERNS) {
    const mm = text.match(p.rx);
    if(mm) {
      state.patient.blAllergy = p.sev;
      _claim(state, mm[0], { kind:"allergy", label: p.label });
      break;
    }
  }

  // 6. Syndrome — first keyword wins (specifics are listed first).
  for(const [rx, id, extra] of SYN_KEYWORDS) {
    const mm = text.match(rx);
    if(mm) {
      state.syndrome = id;
      _claim(state, mm[0], { kind:"syndrome", label: id });
      if(extra) _applyToPatient(state, extra);
      break;
    }
  }

  // 7. Mark patient context as "on" if we parsed any patient field — the
  // bedside surface implicitly activates the patient bar.
  if(Object.keys(state.patient).length > 0) state.patient.on = true;

  return {
    patient: state.patient,
    syndrome: state.syndrome,
    chips: state.chips,
    rump: _rump(text, state.spans),
  };
}

export { parseCase, SYN_KEYWORDS, RISK_PATTERNS, ALLERGY_PATTERNS, HEPATIC_PATTERNS, RX };
