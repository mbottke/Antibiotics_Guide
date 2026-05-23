/* data · renal/weight/hepatic/HD dosing tables + adjustment metadata.
   Inpatient Antibiotic Guide — module graph documented in README.md. */
/* ============================================================================
   v3 INFRASTRUCTURE — single sources of truth that later features consume
   ----------------------------------------------------------------------------
   COLOR SEMANTICS (locked — audited in the integrity suite, never decorative):
     ox    (--ox)    → caution · avoid · severe · first-hour / escalation
     green (--green) → preferred · first-line · RCT-grade evidence · "good"
     amber (--amber) → adjust · moderate · dose/duration-dependent · observational
     blue  (--blue)  → informational · guideline-grade evidence · neutral context
   Every status pairs color with an icon AND text (never color-as-only-channel).
   ========================================================================== */

/* ---- A1 · DOSE ENGINE -----------------------------------------------------
   Renal dosing lives in ONE place. Keys are FORMULARY drug names. `bands` are
   [CrCl_low_inclusive, CrCl_high_EXCLUSIVE, doseString] and tile 0→Infinity.
   `maint` agents are level-guided (no band dosing). `flat` agents do not track
   renal function — surfaced as an explicit teaching point, not silence. Agents
   absent here fall back to their free-text `renal` string unchanged. */
const RENAL_DOSING = {
  "Cefepime": { normal:"2 g q8h", bands:[[60,Infinity,"2 g q8h"],[30,60,"2 g q12h"],[11,30,"2 g q24h"],[0,11,"1 g q24h"]], note:"Accumulation → neurotoxicity (myoclonus, encephalopathy, non-convulsive seizures). Underdosing for renal function is the trap, not overdosing." },
  "Piperacillin-tazobactam": { normal:"4.5 g q6h", bands:[[40,Infinity,"4.5 g q6h"],[20,40,"3.375 g q6h"],[0,20,"2.25 g q6h"]], note:"Give as extended (3–4 h) infusion to preserve %fT>MIC at any band." },
  "Meropenem": { normal:"1 g q8h", bands:[[51,Infinity,"1 g q8h"],[26,51,"1 g q12h"],[10,26,"500 mg q12h"],[0,10,"500 mg q24h"]], note:"Seizure risk if accumulated; 2 g q8h for CNS regardless of band." },
  "Ertapenem": { normal:"1 g q24h", bands:[[30,Infinity,"1 g q24h"],[0,30,"500 mg q24h"]] },
  "Cefazolin": { normal:"2 g q8h", bands:[[35,Infinity,"2 g q8h"],[11,35,"2 g q12h"],[0,11,"2 g q24h"]] },
  "Ceftazidime": { normal:"2 g q8h", bands:[[50,Infinity,"2 g q8h"],[30,50,"2 g q12h"],[10,30,"2 g q24h"],[0,10,"2 g q48h"]] },
  "Ampicillin": { normal:"2 g q4h", bands:[[50,Infinity,"2 g q4h"],[10,50,"2 g q6h"],[0,10,"2 g q12h"]] },
  "Ampicillin-sulbactam": { normal:"3 g q6h", bands:[[30,Infinity,"3 g q6h"],[15,30,"3 g q12h"],[0,15,"3 g q24h"]] },
  "Ceftaroline": { normal:"600 mg q12h", bands:[[50,Infinity,"600 mg q12h"],[30,50,"400 mg q12h"],[15,30,"300 mg q12h"],[0,15,"200 mg q12h"]] },
  "Aztreonam": { normal:"2 g q8h", bands:[[30,Infinity,"2 g q8h"],[10,30,"1 g q8h"],[0,10,"500 mg q8h"]] },
  "Ciprofloxacin": { normal:"400 mg q8h", bands:[[30,Infinity,"400 mg q8h"],[0,30,"400 mg q24h"]] },
  "Levofloxacin": { normal:"750 mg q24h", bands:[[50,Infinity,"750 mg q24h"],[20,50,"750 mg q48h"],[0,20,"500 mg q48h (after a 750 mg load)"]] },
  "Trimethoprim-sulfamethoxazole": { normal:"Full TMP dose", bands:[[30,Infinity,"Full TMP dose"],[15,30,"Reduce dose ~50%"],[0,15,"Avoid"]], note:"Watch hyperkalemia + creatinine rise within days; reduction is by TMP component." },
  "Daptomycin": { normal:"8–10 mg/kg q24h", bands:[[30,Infinity,"8–10 mg/kg q24h"],[0,30,"8–10 mg/kg q48h"]], note:"Dose by actual body weight; weekly CK. Never for pneumonia (surfactant)." },
  "Vancomycin (IV)": { load:"20–25 mg/kg actual BW (cap ~3 g)", maint:"AUC/level-guided (AUC/MIC 400–600)", normal:"AUC-guided", note:"Do not band-dose. Full loading dose regardless of renal function; maintenance interval extends as CrCl falls." },
  "Gentamicin / amikacin": { load:"5–7 mg/kg (gentamicin) extended-interval, adjusted BW", maint:"interval set by levels — avoid in evolving AKI", normal:"5–7 mg/kg q24h", note:"Concentration-dependent; dose on adjusted body weight in obesity, follow levels + renal function." },
};

/* ============================================================================
   v3 · AUTOMATIC DOSE-ADJUSTMENT ENGINE
   Goal: collapse the mental steps between "the card's default dose" and "the
   dose THIS patient should get." For any regimen line, detect the named agents
   and surface — inline, only when the active context actually changes the dose —
   the renal band, the weight-based computed milligrams, the hepatic caution,
   and the hemodialysis timing. The canonical guideline prose is never rewritten;
   adjustments render as explicit, sourced annotations beside it.

   Evidence honesty: every adjustment is read from a structured table
   (RENAL_DOSING already validated in the integrity suite; WEIGHT_DOSING and
   HEPATIC_DOSING below). The engine never invents a number a table does not
   contain — when data is absent it stays silent rather than guessing.
   ========================================================================== */

/* Weight-based agents: which body weight drives the dose, and the mg/kg rule.
   `compute` returns the patient-specific milligrams from the weight descriptors
   that deriveCtx already produces (tbw / ibw / adjbw). */
const WEIGHT_DOSING = {
  "Vancomycin (IV)": { basis:"actual", mgPerKg:[20,25], capMg:3000, kind:"load",
    label:"Loading dose", note:"Full loading dose regardless of renal function; cap ~3 g. Maintenance is AUC/level-guided." },
  "Daptomycin": { basis:"actual", mgPerKg:[8,10], kind:"daily",
    label:"Daily dose", note:"Dose by actual body weight (8–10 mg/kg; up to 10–12 for enterococcal/refractory). Weekly CK." },
  "Gentamicin / amikacin": { basis:"adjusted", mgPerKg:[5,7], kind:"daily",
    label:"Extended-interval dose", note:"Gentamicin/tobramycin 5–7 mg/kg on adjusted body weight; interval set by levels. Avoid in evolving AKI." },
};

const _wtKey = { actual:"tbw", adjusted:"adjbw", ideal:"ibw" };

const _wtLabel = { actual:"actual BW", adjusted:"adjusted BW", ideal:"ideal BW" };

/* Hepatic adjustment directives (Child-Pugh proxy). `min` = lowest stage that
   triggers: "moderate" (Child-Pugh B) or "severe" (C). Structured from the
   Safety-tab hepatic table plus the high-yield inpatient additions. */
const HEPATIC_DOSING = {
  "Metronidazole":   { min:"severe",   text:"Reduce dose in severe hepatic impairment (Child-Pugh C) — accumulates." },
  "Tigecycline":     { min:"severe",   text:"Reduce maintenance dose in Child-Pugh C (initial 100 mg, then 25 mg q12h)." },
  "Clindamycin":     { min:"severe",   text:"Hepatic metabolism — caution and LFT monitoring in severe liver disease." },
  "Chloramphenicol": { min:"moderate", text:"Reduce in hepatic impairment; dose-related marrow suppression." },
  "Rifampin":        { min:"moderate", text:"Hepatotoxic and a potent CYP3A inducer — monitor LFTs; anticipate interactions." },
  "Nafcillin / oxacillin": { min:"severe", text:"Largely biliary elimination — give with caution in combined hepatic dysfunction; intrinsic hepatotoxicity." },
  "Ceftriaxone":     { min:"severe",   text:"Combined hepatic + renal failure: cap at 2 g/day and monitor; biliary pseudolithiasis." },
};

/* Agents that need a timed dose AFTER intermittent hemodialysis (the common,
   high-yield ones; HD removes a meaningful fraction). */
const HD_DOSING = {
  "Vancomycin (IV)":            "Redose by post-HD level; many units give a fixed supplement after each session.",
  "Cefepime":                   "Dose after HD on dialysis days; HD clears a substantial fraction.",
  "Piperacillin-tazobactam":    "Give a supplemental dose after HD.",
  "Meropenem":                  "Dose after HD on dialysis days.",
  "Ceftazidime":                "Dose after HD; supplement after each session.",
  "Ampicillin":                 "Dose after HD.",
  "Ampicillin-sulbactam":       "Dose after HD.",
  "Aztreonam":                  "Give a supplemental dose after HD.",
  "Levofloxacin":               "Dose after HD on dialysis days; no supplement needed otherwise.",
  "Daptomycin":                 "Dose after HD; thrice-weekly post-HD dosing is an option.",
  "Gentamicin / amikacin":      "Dose after HD by level; HD removes a large fraction.",
  "Trimethoprim-sulfamethoxazole": "Reduce dose; give after HD on dialysis days.",
};

/* The agent vocabulary the scanner can recognize in free-text rx lines, longest
   names first so "Ampicillin-sulbactam" wins over "Ampicillin". Each maps to its
   canonical key across the dosing tables. Aliases cover the prose spellings that
   differ from the table key (e.g., "nafcillin", "oxacillin", "tobramycin"). */
const DOSE_AGENTS = (() => {
  const keys = new Set([
    ...Object.keys(RENAL_DOSING), ...Object.keys(WEIGHT_DOSING),
    ...Object.keys(HEPATIC_DOSING), ...Object.keys(HD_DOSING),
  ]);
  const entries = [];
  keys.forEach(k => {
    // expand "A / b" names into each spelling, all pointing at the canonical key
    k.split(" / ").forEach(part => entries.push([part.replace(/\s*\(IV\)\s*/i, "").trim(), k]));
    entries.push([k.replace(/\s*\(IV\)\s*/i, "").trim(), k]);
  });
  // explicit prose aliases → canonical key
  const alias = {
    "nafcillin":"Nafcillin / oxacillin", "oxacillin":"Nafcillin / oxacillin",
    "tobramycin":"Gentamicin / amikacin", "gentamicin":"Gentamicin / amikacin", "amikacin":"Gentamicin / amikacin",
    "vancomycin":"Vancomycin (IV)", "tmp-smx":"Trimethoprim-sulfamethoxazole", "trimethoprim-sulfamethoxazole":"Trimethoprim-sulfamethoxazole",
    "pip-tazo":"Piperacillin-tazobactam", "piperacillin-tazobactam":"Piperacillin-tazobactam",
  };
  Object.entries(alias).forEach(([a,k]) => entries.push([a,k]));
  // dedupe by lowercase spelling, keep canonical; sort longest-first
  const seen = new Map();
  entries.forEach(([spelling,k]) => { const s = spelling.toLowerCase(); if(s && !seen.has(s)) seen.set(s,k); });
  return [...seen.entries()].sort((a,b) => b[0].length - a[0].length);
})();

const _ADJ_META = {
  renal:   { tag:"RENAL",   cls:"adj-renal" },
  weight:  { tag:"WEIGHT",  cls:"adj-weight" },
  hepatic: { tag:"HEPATIC", cls:"adj-hepatic" },
  hd:      { tag:"HD",      cls:"adj-hd" },
};

/* Child-Pugh score (the basis for the CP-A/B/C hepatic classification).
   Five components, each scored 1–3; total 5–6 = A, 7–9 = B, 10–15 = C.
   Components encode their own 1/2/3 thresholds so the UI and the score stay in
   one place. `bili` mg/dL, `alb` g/dL, `inr` unitless; `ascites` and `enceph`
   are categorical (none | mild | severe). Returns null until all five are set. */
const CP_COMPONENTS = [
  { key:"bili",    label:"Total bilirubin",   unit:"mg/dL", kind:"num",
    pts:v => (v < 2 ? 1 : v <= 3 ? 2 : 3),
    bands:["< 2", "2–3", "> 3"] },
  { key:"alb",     label:"Albumin",           unit:"g/dL",  kind:"num",
    pts:v => (v > 3.5 ? 1 : v >= 2.8 ? 2 : 3),
    bands:["> 3.5", "2.8–3.5", "< 2.8"] },
  { key:"inr",     label:"INR",               unit:"",      kind:"num",
    pts:v => (v < 1.7 ? 1 : v <= 2.3 ? 2 : 3),
    bands:["< 1.7", "1.7–2.3", "> 2.3"] },
  { key:"ascites", label:"Ascites",           unit:"",      kind:"cat",
    opts:[["none","None",1],["mild","Mild / diuretic-controlled",2],["severe","Moderate–severe / refractory",3]] },
  { key:"enceph",  label:"Encephalopathy",    unit:"",      kind:"cat",
    opts:[["none","None",1],["mild","Grade 1–2",2],["severe","Grade 3–4",3]] },
];

export { RENAL_DOSING, WEIGHT_DOSING, _wtKey, _wtLabel, HEPATIC_DOSING, HD_DOSING, DOSE_AGENTS, _ADJ_META, CP_COMPONENTS };
