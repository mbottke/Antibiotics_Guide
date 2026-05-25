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
       currentRegimen: ["Cefepime", "Vancomycin (IV)"] | null,
       findings: [{ kind: "culture", organism: "esbl" }, ...],
       chips: [{ kind, label, raw }, ...],   // what the parser claimed
       rump: "..."                            // the input minus claimed spans
     }

   Wave 5 PR-5c adds three engine-feeding extractors on top of the v1
   chip surface:

     • currentRegimen  Drug names extracted from "on X", "started on Y",
                       "day N of Z", "switched to Q", and "broadened to R"
                       phrases. Resolved via DRUG_RX_UNION (derived from
                       AGENT_RX — no duplication) so the parser sees the
                       same canonical names the regimen engine reasons
                       over. Fed to composeAnswer's optional second
                       parameter to seed de-escalation analysis.

     • findings        Snapshot-refine triggers for refineOnNewFinding:
                         "BCx grew ESBL E. coli"  → culture (org=esbl)
                         "despite cefepime"       → deterioration
                         "source controlled"      → source-controlled
                       Each finding carries the original phrase so the
                       Reassessment panel can render the chip with the
                       user's own words.

     • new risk chips  "recent hospital stay" → hcaqRisk
                       "peritoneal dialysis"  → onPD
                       Lone "fever" without a more specific syndrome is
                       surfaced as a soft chip but NEVER routed to a
                       syndrome — it must not swallow febrile-neutropenia,
                       TSS, or any other specific febrile pattern.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

import { AGENT_RX } from "../data/drugs.js";

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
  [/\bgram-?negative\s*sepsis\b|\bgnr\s*sepsis\b/i, "sepsis", { esblRisk: true }],

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
  { rx: /\brecent(?:ly)?\s+(?:hospital(?:ized|ization|\s+stay|\s+admit(?:ted|ssion)?)|admitted|discharged)\b|\b(?:prior|recent)\s+admission\b|\b30-?day\s+(?:admit|readmit)/i,
    set: { hcaqRisk:true },    label: "Recent healthcare contact" },
  { rx: /\bperitoneal\s+dialysis\b|\bon\s+pd\b(?![a-z])|\bpd\s+catheter\b/i,
    set: { onPD:true },        label: "On peritoneal dialysis" },
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

/* ---------- DRUG_RX_UNION — drug-name detector derived from AGENT_RX --------
   Wave 5 PR-5c · the parser sees drugs through the SAME registry the regimen
   engine reasons over. This eliminates the drift trap called out in the plan:
   a new agent added to AGENT_RX is automatically visible to both the engine
   AND the parser without a second source edit.

   findDrugs(text) scans the input and returns canonical FORMULARY names in
   AGENT_RX-declaration order (specific-first), deduplicated. Used to populate
   currentRegimen from "on X" / "started on Y" / "despite Z" tails. */
const DRUG_RX_UNION = {
  findDrugs(text){
    if(!text || typeof text !== "string") return [];
    const out = [];
    AGENT_RX.forEach(({ rx, canon }) => {
      if(rx.test(text) && !out.includes(canon)) out.push(canon);
    });
    return out;
  },
};

/* ---------- ORG_KEYWORDS — organism phrasing → outer-14 organism id --------
   Wave 5 PR-5c · only used inside culture-finding contexts ("BCx grew ..."
   etc.) so the same word ("ESBL") that flags a colonization risk earlier in
   the input is also recognized as an isolate identity later. Specifics
   (ESBL / KPC / NDM) precede generals (E. coli / klebsiella) so the more
   informative tag wins.

   The id space matches the 14 outer organisms in data/organisms.js — the
   same vocabulary refineOnNewFinding's culture path consumes via orgLookup. */
const ORG_KEYWORDS = [
  [/\besbl(?:[-\s]?(?:e|producing|positive))?\b/i,                   "esbl"],
  [/\bkpc\b|\boxa-?48\b|carbapenemase[-\s]producing\s+enterobac/i,   "cre"],
  [/\bndm\b|\bvim\b|\bimp\b(?![a-z])|metallo-?β?-?lactamase|\bmbl\b/i, "cre"],
  [/\bcre\b|carbapenem-?resistant\s+enterobac/i,                     "cre"],
  [/\bampc\b/i,                                                      "ampc"],
  [/\bmrsa\b/i,                                                      "mrsa"],
  [/\bmssa\b/i,                                                      "mssa"],
  [/\bvre\b|vancomycin-?resistant\s+entero/i,                        "vre"],
  [/\bpseudomonas\s*aeruginosa\b|\bpseudomonas\b|\bpsa\b/i,          "pseudo"],
  [/\bacinetobacter\b|\bcrab\b|\ba\.?\s*baumannii\b/i,               "crab"],
  [/\bstenotrophomonas\b|\bs\.?\s*maltophilia\b/i,                   "steno"],
  [/\be\.?\s*coli\b|\bescherichia\s*coli\b|\bklebsiella\b|\bproteus\b|enterobact[a-z]*/i, "entero"],
  [/\be\.?\s*faecium\b|enterococcus\s+faecium/i,                     "vre"],
  [/\be\.?\s*faecalis\b|enterococcus\s+faecalis\b|\benterococcus\b/i,"efaecalis"],
  [/\bpneumococcus\b|s\.?\s*pneumoniae\b|streptococcus\s+pneumoniae|group\s+a\s+strep|\bstrep(?:tococcal|tococcus)?\b/i, "strep"],
  [/\bs\.?\s*aureus\b|staph(?:ylococcus)?\s+aureus/i,                "mssa"],
  [/\bbacteroides\b|\banaerobe[s]?\b/i,                              "anaerobe"],
  [/\blegionella\b|\bmycoplasma\b|\bchlamydia\b|atypical/i,          "atypical"],
];

function _detectOrgs(text){
  if(!text || typeof text !== "string") return [];
  const out = [];
  ORG_KEYWORDS.forEach(([rx, id]) => {
    if(rx.test(text) && !out.includes(id)) out.push(id);
  });
  return out;
}

/* ---------- FINDING_RX — snapshot-refine triggers from free text ----------
   Wave 5 PR-5c · each match produces a finding object the Reassessment panel
   feeds into refineOnNewFinding. Capture groups are intentionally permissive
   (greedy to end-of-clause); narrowing happens via DRUG_RX_UNION / _detectOrgs
   so a misplaced word never crashes the parser.

   Order matters: CULTURE_RX must match before ON_REG_RX so "BCx grew X on
   day 2 of cefepime" gets the culture finding AND the current regimen — the
   two patterns work on disjoint text slices because the culture-tail is
   consumed before regimen detection runs.

   ON_REG_RX is intentionally NOT used to set findings; it only seeds the
   currentRegimen array. The clinical finding is the culture/deterioration/
   source-control event — the regimen is just context. */
const CULTURE_RX  = /\b(?:bcx|ucx|ecx|(?:blood|sputum|urine|endotracheal|tissue|wound|csf|peritoneal)\s+(?:cultures?|cx)|cultures?)\s+(?:grew|positive\s+for|with)\s+([^.;\n]+)/i;
const ON_REG_RX   = /\b(?:currently\s+on|started\s+on|switched\s+to|broad(?:ened)?\s+to|on\s+day\s+\d+\s+of|day\s+\d+\s+of|getting|receiving|on)\s+([^.;\n]+)/gi;
const DESPITE_RX  = /\bdespite\s+([^.;\n]+)/i;
const SRC_CTRL_RX = /\bsource[-\s]controll?ed\b|\bdrained\b|\bsource\s+controll?\b/i;
const FEVER_RX    = /\bfever(?:ish|s)?\b|\bfebrile\b|\bt\s*max\b|\btemp(?:erature)?\s*[≥>=]\s*3\d/i;

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
    currentRegimen: null,
    findings: [],
    chips: [],
    spans: [],
  };
  if(!text || typeof text !== "string") {
    return { patient: state.patient, syndrome: null, currentRegimen: null, findings: [], chips: [], rump: "" };
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

  // 7. Cultures — "BCx grew ESBL E. coli" / "sputum cx positive for MRSA".
  // Run BEFORE the regimen extractor so the post-"grew" tail does not get
  // double-consumed by ON_REG_RX (which would also match "on" mid-tail).
  let cultureTail = null;
  {
    const cm = text.match(CULTURE_RX);
    if(cm){
      cultureTail = cm[1];
      _claim(state, cm[0], { kind:"finding", label:`Culture: ${cm[1].trim()}` });
      const orgs = _detectOrgs(cm[1]);
      if(orgs.length){
        orgs.forEach(orgId => state.findings.push({ kind:"culture", organism: orgId, raw: cm[0] }));
      } else {
        // organism not in our vocabulary — still flag the finding shape so the
        // Reassessment panel can prompt the user to pick from the org picker.
        state.findings.push({ kind:"culture", organism: null, raw: cm[0] });
      }
    }
  }

  // 8. Current regimen — "on X" / "started on Y" / "day N of Z" / "switched to Q".
  // Multiple "on" phrases may co-occur in one description ("on cefepime and
  // vancomycin, started on metronidazole today"); we collect each tail and
  // run DRUG_RX_UNION against the union.
  {
    const tails = [];
    // Reset lastIndex — ON_REG_RX is /g/.
    ON_REG_RX.lastIndex = 0;
    let onm;
    while((onm = ON_REG_RX.exec(text)) !== null){
      const tail = onm[1];
      // Skip the culture tail so "BCx grew X on day 2 of cefepime" doesn't
      // re-match the post-"grew" segment for currentRegimen.
      if(cultureTail && cultureTail.includes(tail)) continue;
      tails.push(tail);
    }
    const despMatch = text.match(DESPITE_RX);
    if(despMatch) tails.push(despMatch[1]);
    if(tails.length){
      const allDrugs = [];
      tails.forEach(t => DRUG_RX_UNION.findDrugs(t).forEach(d => {
        if(!allDrugs.includes(d)) allDrugs.push(d);
      }));
      if(allDrugs.length){
        state.currentRegimen = allDrugs;
        _claim(state, allDrugs.join(", "), { kind:"regimen", label:`On: ${allDrugs.join(", ")}` });
      }
    }
    if(despMatch){
      state.findings.push({ kind:"deterioration", raw: despMatch[0] });
      _claim(state, despMatch[0], { kind:"finding", label:`Despite: ${despMatch[1].trim()}` });
    }
  }

  // 9. Source-control finding — "source controlled" / "drained".
  {
    const sm = text.match(SRC_CTRL_RX);
    if(sm){
      state.findings.push({ kind:"source-controlled", raw: sm[0] });
      _claim(state, sm[0], { kind:"finding", label:"Source controlled" });
    }
  }

  // 10. Lone-fever last-resort. Surfaces a soft chip but NEVER assigns a
  // syndrome — the plan's architectural trap: lone "fever" must not swallow
  // febrile-neutropenia / TSS / shock / any specific syndrome. Fires only
  // when no syndrome has been identified AND no severe/shock context was
  // already set; the chip prompts the user to add a more specific tag.
  if(!state.syndrome && !state.patient.severe){
    const fm = text.match(FEVER_RX);
    if(fm){
      _claim(state, fm[0], { kind:"finding", label:"Fever — needs source" });
    }
  }

  // 11. Mark patient context as "on" if we parsed any patient field — the
  // bedside surface implicitly activates the patient bar.
  if(Object.keys(state.patient).length > 0) state.patient.on = true;

  return {
    patient: state.patient,
    syndrome: state.syndrome,
    currentRegimen: state.currentRegimen,
    findings: state.findings,
    chips: state.chips,
    rump: _rump(text, state.spans),
  };
}

export { parseCase, SYN_KEYWORDS, RISK_PATTERNS, ALLERGY_PATTERNS, HEPATIC_PATTERNS, RX, DRUG_RX_UNION, ORG_KEYWORDS };
