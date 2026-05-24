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
   syndrome name implies (severe for shock, etc.). */
const SYN_KEYWORDS = [
  [/\bseptic\s*shock\b/i,                        "sepsis",             { severe:true }],
  [/\bsevere\s*sepsis\b/i,                       "sepsis",             { severe:true }],
  [/\bneutropenic\s*(?:fever|sepsis)\b|\bfebrile\s*neutropenia\b/i, "sepsis-neutropenic", {}],
  [/\basplenic|asplenia|post-?splenectomy/i,     "sepsis-asplenia",    {}],
  [/\btoxic\s*shock\b|\btss\b/i,                 "sepsis-toxic",       { severe:true }],
  [/\bhap\b|\bvap\b|\bventilator-?associated|hospital-?acquired\s*pne/i, "hap", {}],
  [/\bcap\b|\bcommunity-?acquired\s*pne/i,       "cap",                {}],
  [/\baspiration\s*pne|lung\s*abscess\b/i,       "aspiration",         {}],
  [/\bempyema\b|\bparapneumonic\b/i,             "empyema",            {}],
  [/\bcopd\s*exacerb|aecopd\b/i,                 "copd",               {}],
  [/\bbronchiectasis\b/i,                        "bronchiectasis",     {}],
  [/\bpneumonia\b|\bpna\b/i,                     "cap",                {}],  // fallback after specifics
  [/\bsab\b|\bstaph(?:ylococcus)?\s*aureus\s*bacterem/i, "sab",        {}],
  [/\bgnr\s*bacterem|gram-?negative\s*bacterem/i,"gnbact",             {}],
  [/\b(?:infective\s*)?endocarditis\b|\bie\b(?!\s*\.)|\bpve\b/i,"ie",  {}],
  [/\bcrbsi\b|catheter-?related\s*(?:blood|bsi)/i,"crbsi",             {}],
  [/\bentero(?:coccal)?\s*bacterem/i,            "entbact",            {}],
  [/\bcystitis\b|\bsimple\s*uti\b|\blower\s*uti\b/i, "cystitis",       {}],
  [/\bpyelo(?:nephritis)?\b/i,                   "pyelo",              {}],
  [/\bcauti\b/i,                                 "cauti",              {}],
  [/\bprostatitis\b/i,                           "prostatitis",        {}],
  [/\buti\b/i,                                   "cystitis",           {}],
  [/\bsbp\b|\bspontaneous\s*bacterial\s*peritonitis\b/i, "sbp",        {}],
  [/\bcholangitis\b/i,                           "cholangitis",        {}],
  [/\bdiverticulitis\b/i,                        "diverticulitis",     {}],
  [/\bperitonitis\b|\biai\b|\bintra-?abdominal/i,"peritonitis",        {}],
  [/\bcellulitis\b/i,                            "cellulitis",         {}],
  [/\bnec(?:rotizing)?\s*(?:fasc|sti)\b|\bnsti\b/i, "necfasc",         { severe:true }],
  [/\bdfi\b|\bdiabetic\s*foot/i,                 "dfi",                {}],
  [/\bosteo(?:myelitis)?\b/i,                    "osteo",              {}],
  [/\bpji\b|\bprosthetic\s*joint/i,              "pji",                {}],
  [/\bseptic\s*arthritis\b/i,                    "septic-arthritis",   {}],
  [/\bmeningitis\b/i,                            "meningitis",         {}],
  [/\bbrain\s*abscess\b/i,                       "brainabscess",       {}],
  [/\bc[\.\s-]*diff(?:icile)?\b|\bcdi\b/i,       "cdiff",              {}],
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
