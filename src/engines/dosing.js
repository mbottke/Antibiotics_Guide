/* engine · dose computation + renal/hepatic/weight context derivation (pure).
   Inpatient Antibiotic Guide — module graph documented in README.md. */
import { CP_COMPONENTS, DOSE_AGENTS, HD_DOSING, HEPATIC_DOSING, RENAL_DOSING, WEIGHT_DOSING, _wtKey, _wtLabel } from "../data/dosing.js";
import { DRUG_ALIASES } from "../data/drugs.js";
import { _vancoIsEnteral } from "../lib/util.js";

/* resolveDrug: canonicalize any cross-tab display name to a RENAL_DOSING key. */
function resolveDrug(name){
  if(!name) return name;
  if(RENAL_DOSING[name]) return name;
  // reverse spectrum→formulary alias (DRUG_ALIASES defined below)
  const hit = Object.keys(DRUG_ALIASES).find(k => DRUG_ALIASES[k] === name);
  return hit || name;
}

/* Pure dose computation. Returns null → caller renders the static string unchanged.
   ctx must carry { on:boolean, crcl:number|null }. */
function computeDose(drugName, ctx){
  const d = RENAL_DOSING[drugName] || RENAL_DOSING[resolveDrug(drugName)];
  if(!d || !ctx || !ctx.on || ctx.crcl == null) return null;
  if(d.flat)  return { adjusted:d.normal, normal:d.normal, note:d.note, kind:"flat" };
  if(d.maint) return { adjusted:`Load ${d.load}; then ${d.maint}`, normal:d.normal, note:d.note, kind:"level" };
  const band = (d.bands||[]).find(([lo,hi]) => ctx.crcl >= lo && ctx.crcl < hi);
  if(!band) return null;
  return { adjusted:band[2], normal:d.normal, note:d.note, kind:"band", changed: band[2] !== d.normal };
}

/* Scan a rx string → ordered, de-duplicated list of canonical agent keys present. */
function agentsInRx(text){
  if(typeof text !== "string") return [];
  const low = text.toLowerCase(); const found = []; const used = [];
  DOSE_AGENTS.forEach(([spelling, key]) => {
    if(found.includes(key)) return;
    let from = 0, idx;
    while((idx = low.indexOf(spelling, from)) !== -1){
      const before = idx === 0 ? " " : low[idx-1];
      const after  = low[idx+spelling.length] || " ";
      const wb = /[^a-z]/.test(before) && /[^a-z]/.test(after);
      // not already inside a longer match we recorded
      const overlap = used.some(([s,e]) => idx < e && (idx+spelling.length) > s);
      if(wb && !overlap){ found.push(key); used.push([idx, idx+spelling.length]); break; }
      from = idx + spelling.length;
    }
  });
  return found;
}

/* For one agent + ctx, return the triggered adjustments (or [] if none).
   Each: { kind:"renal"|"weight"|"hepatic"|"hd", label, value, note?, agent }. */
function adjustmentsForAgent(key, ctx, d){
  const out = [];
  const crcl = ctx && ctx.on ? (d && d.crcl != null ? d.crcl : (ctx.crcl != null ? ctx.crcl : null)) : null;

  // RENAL — only when the band differs from the normal/default dose
  const rd = RENAL_DOSING[key];
  if(rd && crcl != null && !rd.flat && !rd.maint){
    const band = (rd.bands||[]).find(([lo,hi]) => crcl >= lo && crcl < hi);
    if(band && band[2] !== rd.normal){
      out.push({ kind:"renal", agent:key, label:`CrCl ${crcl}`, value:band[2], note:rd.note });
    }
  }

  // WEIGHT — compute patient-specific mg from the weight descriptors
  const wd = WEIGHT_DOSING[key];
  if(wd && d && d.wt){
    const wkg = d.wt[_wtKey[wd.basis]];
    if(wkg > 0){
      const lo = Math.round(wd.mgPerKg[0] * wkg), hiRaw = Math.round(wd.mgPerKg[1] * wkg);
      const cap = wd.capMg ? Math.min(wd.capMg, hiRaw) : hiRaw;
      const capped = wd.capMg && hiRaw > wd.capMg;
      const range = lo === cap ? `${lo} mg` : `${lo}–${cap} mg`;
      out.push({ kind:"weight", agent:key, label:wd.label,
        value:`${range}${capped ? " (capped)" : ""}`,
        basis:`${wd.mgPerKg[0]}–${wd.mgPerKg[1]} mg/kg × ${Math.round(wkg)} kg ${_wtLabel[wd.basis]}`,
        note:`${wd.mgPerKg[0]}–${wd.mgPerKg[1]} mg/kg × ${Math.round(wkg)} kg ${_wtLabel[wd.basis]}. ${wd.note}` });
    }
  }

  // HEPATIC — when the patient's stage meets the agent's trigger
  const hp = HEPATIC_DOSING[key];
  if(hp && ctx && ctx.on && ctx.hepatic && ctx.hepatic !== "none"){
    const order = { moderate:1, severe:2 };
    if((order[ctx.hepatic]||0) >= (order[hp.min]||9)){
      out.push({ kind:"hepatic", agent:key, label: hp.min === "severe" ? "Child-Pugh C" : "Hepatic impairment", value:hp.text });
    }
  }

  // HEMODIALYSIS — timing/supplement note
  const hdn = HD_DOSING[key];
  if(hdn && ctx && ctx.on && ctx.hd){
    out.push({ kind:"hd", agent:key, label:"On HD", value:hdn });
  }

  return out;
}

/* Top-level: rx string + ctx → all triggered adjustments across its agents.
   `synId` lets route-context override token wording (e.g., C. diff vancomycin). */
function doseAdjustments(rxText, ctx, d, synId){
  if(!ctx || !ctx.on) return [];
  const keys = agentsInRx(rxText);
  const enteralVanco = _vancoIsEnteral(rxText, synId);
  const all = [];
  keys.forEach(k => {
    // Oral/enteral vancomycin (C. diff): not systemically absorbed — drop IV-only adjustments.
    if(k === "Vancomycin (IV)" && enteralVanco) return;
    adjustmentsForAgent(k, ctx, d).forEach(a => all.push(a));
  });
  return all;
}

/* ---- A2 · CLINICAL-MATH HELPERS (pure) -----------------------------------
   All return null on invalid input so callers can render an explicit state. */
function cockcroftGault(age, weightKg, scr, sex){
  const a=+age, w=+weightKg, s=+scr;
  if(!(a>0) || !(w>0) || !(s>0)) return null;
  let v = ((140 - a) * w) / (72 * s);
  if(sex === "F") v *= 0.85;
  return v;
}

/* CKD-EPI 2021 (race-free) — eGFR in mL/min/1.73m². The two diverge at weight
   and age extremes; C-G remains the drug-dosing standard. */
function ckdEpi2021(scr, age, sex){
  const s=+scr, a=+age;
  if(!(s>0) || !(a>0)) return null;
  const female = sex === "F";
  const k = female ? 0.7 : 0.9, alpha = female ? -0.241 : -0.302;
  let e = 142 * Math.pow(Math.min(s/k,1), alpha) * Math.pow(Math.max(s/k,1), -1.200) * Math.pow(0.9938, a);
  if(female) e *= 1.012;
  return e;
}

/* Devine IBW + adjusted BW. inchesOver5ft from height in cm. */
function weightDescriptors(heightCm, weightKg, sex){
  const h=+heightCm, w=+weightKg;
  if(!(h>0) || !(w>0)) return null;
  const inchesOver5ft = Math.max(0, (h - 152.4) / 2.54);
  const ibw = (female=> (female?45.5:50) + 2.3*inchesOver5ft)(sex==="F");
  const adjbw = ibw + 0.4 * (w - ibw);
  return { tbw:w, ibw, adjbw };
}

function childPughComponentPoints(comp, raw){
  if(comp.kind === "num"){
    const v = parseFloat(raw);
    if(!(v > 0)) return null;
    return comp.pts(v);
  }
  const o = comp.opts.find(o => o[0] === raw);
  return o ? o[2] : null;
}

function childPugh(cp){
  if(!cp) return null;
  let total = 0;
  for(const comp of CP_COMPONENTS){
    const p = childPughComponentPoints(comp, cp[comp.key]);
    if(p == null) return null;        // incomplete → no class yet
    total += p;
  }
  const cls = total <= 6 ? "A" : total <= 9 ? "B" : "C";
  // Map class → the dosing-relevant hepatic stage used across the engine.
  const stage = cls === "A" ? "none" : cls === "B" ? "moderate" : "severe";
  const band = cls === "A" ? { t:"Class A — well-compensated", c:"var(--green)" }
             : cls === "B" ? { t:"Class B — significant impairment", c:"var(--amber)" }
             :               { t:"Class C — decompensated", c:"var(--ox)" };
  return { total, cls, stage, band };
}

/* CrCl → clinical band (color is paired with text everywhere it renders). */
function bandFor(crcl){
  if(crcl == null) return null;
  if(crcl >= 90) return { t:"Normal", c:"var(--green)" };
  if(crcl >= 60) return { t:"Mild reduction", c:"var(--green)" };
  if(crcl >= 30) return { t:"Moderate — adjust doses", c:"var(--amber)" };
  if(crcl >= 15) return { t:"Severe — major adjustment", c:"var(--ox-bright)" };
  return { t:"Kidney failure — specialist dosing", c:"var(--ox)" };
}

/* deriveCtx: the single transform from raw inputs → every derived quantity the
   UI shows. Owns ALL state-coverage (§9.3): each invalid input is named in
   `errors`; CrCl is never NaN/Infinity/blank, ARC and discordance are flagged. */
function deriveCtx(ctx){
  const errors = [];
  const age=+ctx.age, w=+ctx.weightKg, s=+ctx.scr, h=+ctx.heightCm;
  if(!(age>0) || age>120) errors.push("age");
  if(!(w>0)  || w>400)    errors.push("weight");
  if(!(s>0)  || s>25)     errors.push("creatinine");
  if(h && (h<90 || h>250)) errors.push("height");
  let crcl = cockcroftGault(age, w, s, ctx.sex);
  if(crcl != null){
    crcl = Math.round(crcl);
    if(crcl > 250){ errors.push("crcl-implausible"); }
  }
  const ckd  = ckdEpi2021(s, age, ctx.sex);
  const wt   = weightDescriptors(h, w, ctx.sex);
  const impl = errors.includes("crcl-implausible");
  const arc  = crcl != null && crcl > 130 && !impl;
  /* Vancomycin: actual-weight loading range + a POPULATION maintenance ESTIMATE
     (15–20 mg/kg/dose, per-dose cap ~2 g) with the interval set by the
     Cockcroft-Gault band, targeting AUC/MIC 400–600. This is an empiric starting
     point only — it is explicitly NOT a substitute for level-guided (Bayesian or
     two-level) AUC dosing, and is suppressed to "by levels" on HD or when CrCl is
     unavailable. The render carries that caveat. */
  const vanco = (w>0 && w<=400) ? (() => {
    const lo = Math.round(20*w), hi = Math.min(3000, Math.round(25*w));
    const mLo = Math.min(2000, Math.round(15*w)), mHi = Math.min(2000, Math.round(20*w));
    const eff = impl ? null : crcl;
    let interval = null, byLevels = false;
    if(ctx.hd)            byLevels = true;          // dose after dialysis, by levels
    else if(eff == null)  byLevels = true;          // no reliable CrCl
    else if(eff >= 90)    interval = "q8\u201312h";
    else if(eff >= 50)    interval = "q12h";
    else if(eff >= 30)    interval = "q24h";
    else if(eff >= 15)    interval = "q24\u201348h";
    else                  byLevels = true;          // CrCl <15 / not on HD → by levels
    return { lo, hi, mLo, mHi, interval, byLevels, capped: mHi >= 2000, arc };
  })() : null;
  /* Aminoglycoside (gentamicin/tobramycin) extended-interval ESTIMATE: 7 mg/kg on
     the dosing weight (adjusted BW when obese, else actual), interval by the
     Cockcroft-Gault nomogram (≥60 → q24h, 40–59 → q36h, 20–39 → q48h, <20 / HD →
     single dose then by levels). Concentration-dependent killing with a
     post-antibiotic effect is what permits the extended interval. Empiric start
     only — confirm with a nomogram-timed level; avoid in evolving AKI. */
  const amino = (w>0 && w<=400 && wt) ? (() => {
    const dosingWt = (wt.tbw > wt.ibw) ? wt.adjbw : wt.tbw;   // AdjBW in obesity, else actual
    const wtBasis  = (wt.tbw > wt.ibw) ? "adjusted BW" : "actual BW";
    const dose = Math.round(7 * dosingWt);
    const eff = impl ? null : crcl;
    let interval = null, byLevels = false;
    if(ctx.hd)            byLevels = true;
    else if(eff == null)  byLevels = true;
    else if(eff >= 60)    interval = "q24h";
    else if(eff >= 40)    interval = "q36h";
    else if(eff >= 20)    interval = "q48h";
    else                  byLevels = true;
    return { dose, wtBasis, interval, byLevels };
  })() : null;
  return {
    crcl: impl ? null : crcl,
    crclRaw: crcl,
    crclBand: impl ? null : bandFor(crcl),
    ckd: ckd != null ? Math.round(ckd) : null,
    wt, arc, vanco, amino, errors,
    valid: errors.length === 0 && crcl != null,
    discordant: (!impl && crcl != null && ckd != null) ? Math.abs(crcl - Math.round(ckd)) >= 25 : false,
  };
}

export { resolveDrug, computeDose, agentsInRx, adjustmentsForAgent, doseAdjustments, cockcroftGault, ckdEpi2021, weightDescriptors, childPughComponentPoints, childPugh, bandFor, deriveCtx };
