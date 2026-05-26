/* component · Case Bar — Phase A.1 / C3 of the bedside reframe.
   The primary input affordance of Bedside mode: free-text first, with a
   progressive-disclosure wizard beneath for direct correction. The bar
   parses the text with the pure case-parser engine and renders every
   successful match as a chip so the user can verify or correct before
   applying. "Apply" merges the parsed result into caseState; the Answer
   Canvas (Phase A.2) consumes it.

   Phase C2/C3 refactor — wizard structure:
     * Free-text input + parsed chip preview (top)
     * Recently-used chips (C4 — pulled from localStorage)
     * Always-visible structured fields: syndrome / age + sex / CrCl band /
       β-lactam allergy / 4 risk toggles
     * "More fields" disclosure: hepatic stage / pregnancy / transplant /
       weight (less-common entries; behind a chevron to keep the default
       form tight)
     * Per-field "manually touched" lock (C5) — any chip the user toggles
       or any input they edit gets a lock icon and is not overwritten by
       subsequent parser updates. Reset clears every lock at once.

   Wave 10 W10 forms/inputs atomized pass — every text input, select,
   number field, and CTA inside the Case Bar adopts the Wave 9
   vocabulary: asymmetric 10/3 input radii, cyan focus halos, glass-
   diffuse field backgrounds, italic-serif placeholders, chrome CTA
   for "Apply case", ghost-outline reset, and a corner mesh wash in
   the panel header. The wrapper itself becomes a glass-diffuse
   panel with an 18/4 asymmetric radius. ZERO functional changes —
   every onChange / state transition is identical.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState, useMemo, useEffect, useRef } from "react";
import { ArrowRight, Check, ChevronDown, ChevronRight, Crosshair, Lock, Plus, RotateCcw, Search, X } from "lucide-react";
import { parseCase } from "../engines/case-parser.js";
import { SYNDROMES, SYN_CATS } from "../data/syndromes.js";
import { useMagnetic } from "./util/useMagnetic.js";
import { useRipple } from "./util/useRipple.js";
import { MeshWash } from "./decor/MeshWash.jsx";

const EXAMPLES = [
  "72M PNA prior MRSA CrCl 35",
  "65F UTI SCr 1.4",
  "septic shock prior ESBL",
  "HAP on HD penicillin rash",
  "neutropenic fever 50M",
];

const RISK_KEYS = [
  ["mrsaRisk",   "MRSA"],
  ["pseudoRisk", "Pseudomonas"],
  ["esblRisk",   "ESBL / R-GNR"],
  ["severe",     "Severe / shock"],
];

const CRCL_BANDS = [
  { id: "",        label: "Unknown",        scr: null },
  { id: "gt60",    label: "> 60",            scr: 0.9 },
  { id: "30to60",  label: "30 – 60",         scr: 1.6 },
  { id: "10to30",  label: "10 – 30",         scr: 2.8 },
  { id: "lt10",    label: "< 10 / dialysis", scr: 5.5 },
];

const HEPATIC_OPTIONS = [
  { id: "none",     label: "None / unknown" },
  { id: "moderate", label: "Child-Pugh B"   },
  { id: "severe",   label: "Child-Pugh C"   },
];

const CHIP_TONE = {
  demo:     { fg:"var(--ink)",      bg:"var(--paper2)",       bd:"var(--line)" },
  lab:      { fg:"var(--ox)",       bg:"var(--ox-softer)",    bd:"var(--ox-line)" },
  renal:    { fg:"var(--ox-deep)",  bg:"var(--ox-soft)",      bd:"var(--ox-line)" },
  hepatic:  { fg:"var(--amber)",    bg:"var(--amber-soft)",   bd:"var(--amber-line)" },
  risk:     { fg:"var(--ox)",       bg:"var(--ox-soft)",      bd:"var(--ox-line)" },
  allergy:  { fg:"var(--amber)",    bg:"var(--amber-soft)",   bd:"var(--amber-line)" },
  syndrome: { fg:"#fff",            bg:"var(--ox)",           bd:"var(--ox)" },
};

const RECENT_KEY = "abxguide_recent_cases_v1";
const RECENT_LIMIT = 5;

/* W10 · component-scoped chrome for every input/select inside the CaseBar
   panel — asymmetric 10/3 corners, glass-diffuse fill, italic-serif
   placeholders, cyan focus halo. Scoped to [data-w10-casebar] so it
   never leaks to other surfaces. Idempotent injection. */
const W10_CASEBAR_CSS = `
[data-w10-casebar] .rx-w10-input,
[data-w10-casebar] .rx-w10-select {
  font-family: var(--sans);
  font-size: 13.5px;
  color: var(--ink);
  background: linear-gradient(135deg,
    rgba(255,255,255,0.72) 0%,
    rgba(245,250,253,0.55) 100%);
  backdrop-filter: blur(12px) saturate(170%);
  -webkit-backdrop-filter: blur(12px) saturate(170%);
  border: 1px solid var(--line);
  border-radius: 10px 3px 10px 3px;
  padding: 10px 12px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  outline: none;
  transition: border-color .15s var(--ease-out, ease), box-shadow .18s var(--ease-out, ease), background .18s var(--ease-out, ease);
}
[data-w10-casebar] .rx-w10-input::placeholder {
  font-family: var(--serif);
  font-style: italic;
  color: var(--muted);
  opacity: .72;
}
[data-w10-casebar] .rx-w10-input:hover,
[data-w10-casebar] .rx-w10-select:hover {
  border-color: var(--ox-line);
}
[data-w10-casebar] .rx-w10-input:focus-visible,
[data-w10-casebar] .rx-w10-select:focus-visible {
  border-color: var(--neon-cyan, var(--ox-bright));
  box-shadow:
    0 0 0 2px var(--neon-cyan, var(--ox-bright)),
    0 0 22px color-mix(in srgb, var(--neon-cyan, var(--ox-bright)) 35%, transparent),
    0 0 36px 6px color-mix(in srgb, var(--neon-cyan, var(--ox-bright)) 16%, transparent);
}
[data-w10-casebar] .rx-w10-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  padding-right: 30px;
  background-image:
    linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(245,250,253,0.55) 100%),
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'><path d='M1 1.5L6 6.5L11 1.5' stroke='%2300D4FF' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/></svg>");
  background-repeat: no-repeat, no-repeat;
  background-position: 0 0, right 11px center;
  background-size: cover, 12px 8px;
}
/* Chrome CTA — Apply case. Vertical metal gradient + sheen + cyan glow,
   pairs with useMagnetic + useRipple on the host. */
[data-w10-casebar] .rx-w10-cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px 3px 12px 3px;
  border: 1px solid color-mix(in srgb, var(--ox-deep, var(--ox)) 70%, transparent);
  color: #fff;
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: .01em;
  cursor: pointer;
  overflow: hidden;
  isolation: isolate;
  background: linear-gradient(180deg,
    var(--ox-deep, #0B0F14) 0%,
    var(--ox, #1F2937) 35%,
    var(--ox, #1F2937) 55%,
    var(--ox-deep, #0B0F14) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.20),
    inset 0 -1px 0 rgba(0,0,0,0.30),
    0 6px 14px -4px rgba(11,15,20,0.45),
    0 0 18px -6px color-mix(in srgb, var(--neon-cyan, var(--ox-bright)) 50%, transparent);
  transition: box-shadow .18s var(--ease-out, ease), transform .12s var(--ease-out, ease);
  will-change: transform;
}
[data-w10-casebar] .rx-w10-cta::after {
  content: "";
  position: absolute;
  top: 0; left: -120%;
  width: 60%; height: 100%;
  background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.40) 50%, transparent 100%);
  transform: skewX(-18deg);
  pointer-events: none;
  transition: left 600ms cubic-bezier(0.16, 1, 0.3, 1);
}
[data-w10-casebar] .rx-w10-cta:hover::after { left: 140%; }
[data-w10-casebar] .rx-w10-cta:hover {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.30),
    inset 0 -1px 0 rgba(0,0,0,0.30),
    0 10px 22px -6px rgba(11,15,20,0.55),
    0 0 28px -4px color-mix(in srgb, var(--neon-cyan, var(--ox-bright)) 55%, transparent);
}
[data-w10-casebar] .rx-w10-cta:active { transform: translateY(1px); }
[data-w10-casebar] .rx-w10-cta:disabled {
  opacity: .5; cursor: not-allowed;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 2px 4px rgba(11,15,20,0.20);
}
[data-w10-casebar] .rx-w10-cta:focus-visible {
  outline: 2px solid var(--neon-cyan, var(--ox-bright));
  outline-offset: 2px;
}
/* Ghost-outline secondary (reset / skip). */
[data-w10-casebar] .rx-w10-ghost {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: var(--sans); font-size: 12; color: var(--ink2);
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--neon-cyan, var(--ox-bright)) 35%, var(--line));
  border-radius: 10px 3px 10px 3px;
  padding: 8px 12px; cursor: pointer;
  transition: color .18s var(--ease-out, ease), border-color .18s var(--ease-out, ease), background .18s var(--ease-out, ease);
}
[data-w10-casebar] .rx-w10-ghost:hover {
  color: var(--neon-cyan, var(--ox));
  border-color: var(--neon-cyan, var(--ox));
  background: color-mix(in srgb, var(--neon-cyan, var(--ox-bright)) 6%, transparent);
}
@media (prefers-reduced-motion: reduce) {
  [data-w10-casebar] .rx-w10-cta::after { transition: none !important; }
  [data-w10-casebar] .rx-w10-cta,
  [data-w10-casebar] .rx-w10-ghost,
  [data-w10-casebar] .rx-w10-input,
  [data-w10-casebar] .rx-w10-select { transition: none !important; }
}
`;
function _ensureCasebarStyles() {
  if(typeof document === "undefined") return;
  if(document.querySelector("style[data-w10-casebar-styles]")) return;
  const tag = document.createElement("style");
  tag.setAttribute("data-w10-casebar-styles", "");
  tag.textContent = W10_CASEBAR_CSS;
  document.head.appendChild(tag);
}

function Chip({ kind, label, onRemove }) {
  const tone = CHIP_TONE[kind] || CHIP_TONE.demo;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      fontSize:11.5, fontWeight:600, lineHeight:1.3,
      padding:"3px 9px", borderRadius:999, whiteSpace:"nowrap",
      color:tone.fg, background:tone.bg, border:`1px solid ${tone.bd}`,
    }}>
      <span>{label}</span>
      {onRemove && (
        <button type="button" onClick={onRemove}
          aria-label={`Remove ${label}`}
          style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
            background:"none", border:"none", padding:0, marginLeft:1, cursor:"pointer", color:"inherit", opacity:.7 }}>
          <X size={10} aria-hidden />
        </button>
      )}
    </span>
  );
}

/* Resolve a parsed syndrome id to its display name. Falls back to the id
   when an unknown id slips through (the integrity check guards against
   data drift, but parser additions can race ahead of syndrome data). */
function _synName(id) {
  if(!id) return null;
  const s = SYNDROMES.find(x => x.id === id);
  return s ? s.name : id;
}

/* Per-field lock badge — shows when the user has manually overridden a
   field, so the parser will not overwrite it on subsequent input. */
function LockBadge({ visible }) {
  if(!visible) return null;
  return (
    <span title="Manually set — parser won't overwrite"
      aria-label="Field manually set"
      style={{
        display:"inline-flex", alignItems:"center", gap:3,
        marginLeft: 6,
        fontFamily:"var(--mono)", fontSize:9, letterSpacing:".06em",
        textTransform:"uppercase", fontWeight:700,
        color:"var(--ox)",
      }}>
      <Lock size={10} aria-hidden /> Set
    </span>
  );
}

/* localStorage helpers — read + write the recently-used cases list.
   The list is an array of snapshot objects: { syndrome, age, sex,
   risks, allergy, ts }. Reads guard against malformed JSON. */
function _readRecent() {
  if(typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if(!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(0, RECENT_LIMIT) : [];
  } catch(e) { return []; }
}

function _writeRecent(arr) {
  if(typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(arr.slice(0, RECENT_LIMIT)));
  } catch(e) { /* quota or disabled — silently ignore */ }
}

/* Human-readable summary of a recent case for the chip label. */
function _recentLabel(r) {
  const parts = [];
  if(r.age) parts.push(r.age + (r.sex || ""));
  if(r.syndrome) parts.push(_synName(r.syndrome) || r.syndrome);
  if(r.risks && r.risks.length) parts.push(r.risks[0]);
  return parts.join(" · ") || "Previous case";
}

function CaseBar({ caseState, onApply, onSkip }) {
  _ensureCasebarStyles();
  const [text, setText] = useState("");
  const [touchedAny, setTouchedAny] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recent, setRecent] = useState(() => _readRecent());
  const applyBtnRef = useRef(null);
  useMagnetic(applyBtnRef, { strength: 0.22, range: 90 });
  useRipple(applyBtnRef);

  // Parse live so the chip preview updates as the user types. Cheap and pure.
  const parsed = useMemo(() => parseCase(text), [text]);

  // Manual builder state. Initialised from current caseState so the user
  // can refine an already-applied case rather than starting over.
  const cp = caseState && caseState.patient || {};
  const _initialBand = (() => {
    if(typeof cp.scr !== "number") return "";
    if(cp.scr >= 5) return "lt10";
    if(cp.scr >= 2.3) return "10to30";
    if(cp.scr >= 1.3) return "30to60";
    return "gt60";
  })();

  const [manual, setManual] = useState({
    syndrome: caseState && caseState.syndrome || "",
    age: cp.age || "",
    sex: cp.sex || "",
    crclBand: _initialBand,
    blAllergy: cp.blAllergy || "none",
    mrsaRisk: !!cp.mrsaRisk,
    pseudoRisk: !!cp.pseudoRisk,
    esblRisk: !!cp.esblRisk,
    severe: !!cp.severe,
    hepatic: cp.hepatic || "none",
    pregnancy: !!cp.pregnancy,
    transplant: !!cp.transplant,
    weightKg: cp.weightKg || "",
  });

  /* Per-field touched map — which manual fields the user has explicitly
     changed. Locked fields are not overwritten by parser proposals; the
     reset button clears every lock at once. The map is keyed by the same
     names as `manual` so the merge step (effective state below) is a
     straight per-field lookup. */
  const [touched, setTouched] = useState({});

  const _setField = (k, v) => {
    setManual(m => ({ ...m, [k]: v }));
    setTouched(t => ({ ...t, [k]: true }));
    setTouchedAny(true);
  };
  const _toggleRisk = (k) => {
    setManual(m => ({ ...m, [k]: !m[k] }));
    setTouched(t => ({ ...t, [k]: true }));
    setTouchedAny(true);
  };

  /* Effective state — what we'd actually apply. Per-field merge: when a
     field is locked (touched=true), the manual value wins; otherwise we
     fall back to the parser, and finally to the current manual default.
     This is the C5 contract: the wizard always wins on fields the user
     has explicitly set, even when they type more text afterward. */
  const _eff = useMemo(() => {
    const winner = (k) => touched[k] ? manual[k] : (parsed.patient[k] != null ? parsed.patient[k] : manual[k]);
    return {
      syndrome:  touched.syndrome ? manual.syndrome : (parsed.syndrome || manual.syndrome),
      age:       winner("age"),
      sex:       winner("sex"),
      blAllergy: winner("blAllergy"),
      mrsaRisk:  winner("mrsaRisk"),
      pseudoRisk:winner("pseudoRisk"),
      esblRisk:  winner("esblRisk"),
      severe:    winner("severe"),
      // Advanced fields — parser doesn't currently emit these; manual only.
      hepatic:    manual.hepatic,
      pregnancy:  manual.pregnancy,
      transplant: manual.transplant,
      weightKg:   manual.weightKg,
    };
  }, [parsed, manual, touched]);

  /* "Apply" merges the effective wizard state into caseState. Locked
     fields (touched) come straight from manual; everything else is the
     parser's proposal. We also derive scr from the chosen CrCl band so
     the dosing engine has a number to work with. */
  const apply = () => {
    setTouchedAny(true);
    const band = CRCL_BANDS.find(b => b.id === (touched.crclBand ? manual.crclBand : _initialBand));
    const patientUpdate = {
      ...parsed.patient,
      age:        _eff.age || undefined,
      sex:        _eff.sex || undefined,
      blAllergy:  _eff.blAllergy !== "none" ? _eff.blAllergy : "none",
      mrsaRisk:   _eff.mrsaRisk,
      pseudoRisk: _eff.pseudoRisk,
      esblRisk:   _eff.esblRisk,
      severe:     _eff.severe,
      hepatic:    _eff.hepatic,
      pregnancy:  _eff.pregnancy,
      transplant: _eff.transplant,
      weightKg:   _eff.weightKg ? Number(_eff.weightKg) : undefined,
      scr:        band && band.scr != null ? band.scr : parsed.patient.scr,
      on: true,
    };
    Object.keys(patientUpdate).forEach(k => patientUpdate[k] === undefined && delete patientUpdate[k]);
    const synId = _eff.syndrome || null;
    onApply && onApply({ patient: patientUpdate, syndrome: synId });

    // Push to recently-used (C4). Snapshot is small + human-readable.
    if(synId || patientUpdate.age) {
      const snap = {
        syndrome: synId,
        age: patientUpdate.age,
        sex: patientUpdate.sex,
        risks: RISK_KEYS.filter(([k]) => patientUpdate[k]).map(([_, lab]) => lab),
        allergy: patientUpdate.blAllergy,
        ts: Date.now(),
      };
      const next = [snap, ...recent.filter(r => r.syndrome !== synId || r.age !== snap.age)].slice(0, RECENT_LIMIT);
      _writeRecent(next);
      setRecent(next);
    }
  };

  const _restoreRecent = (r) => {
    setManual(m => ({
      ...m,
      syndrome: r.syndrome || "",
      age: r.age || "",
      sex: r.sex || "",
      blAllergy: r.allergy || "none",
      mrsaRisk:   r.risks?.includes("MRSA") || false,
      pseudoRisk: r.risks?.includes("Pseudomonas") || false,
      esblRisk:   r.risks?.includes("ESBL / R-GNR") || false,
      severe:     r.risks?.includes("Severe / shock") || false,
    }));
    setTouched({
      syndrome: true, age: true, sex: true, blAllergy: true,
      mrsaRisk: true, pseudoRisk: true, esblRisk: true, severe: true,
    });
    setTouchedAny(true);
  };

  const reset = () => {
    setText("");
    setTouchedAny(false);
    setManual({
      syndrome:"", age:"", sex:"", crclBand:"",
      blAllergy:"none",
      mrsaRisk:false, pseudoRisk:false, esblRisk:false, severe:false,
      hepatic:"none", pregnancy:false, transplant:false, weightKg:"",
    });
    setTouched({});
    setShowAdvanced(false);
  };

  const synName = _synName(_eff.syndrome);
  const canApply = !!(_eff.syndrome || _eff.age || _eff.mrsaRisk || _eff.pseudoRisk || _eff.esblRisk || _eff.severe || (parsed.patient && Object.keys(parsed.patient).length > 0));

  return (
    <div
      className="rx-builder"
      data-w10-casebar=""
      style={{
        marginBottom: 20,
        position: "relative",
        /* W10 · upgrade panel radius from 13px to asymmetric 18/4 to
            match the chip system, and overlay a subtle corner mesh wash
            for premium accent. The base rx-builder still applies its
            background gradient + border. */
        borderRadius: "18px 4px 18px 4px",
        isolation: "isolate",
        overflow: "hidden",
      }}>
      {/* W10 · corner cyan-only mesh wash for top-right accent. */}
      <MeshWash variant="corner" intensity="soft" palette="cyan-only" anchor="top-right" />
      <div className="rx-builder-h" style={{ position: "relative", zIndex: 1 }}><Search size={16} /> Describe the case</div>
      <p className="rx-builder-sub">
        Type the case in shorthand — e.g. <em>"72M PNA prior MRSA CrCl 35"</em>. The parser shows
        exactly what it understood as chips below; correct anything before applying. Or skip
        the text and toggle the chips directly.
      </p>

      {/* Recently-used cases (C4) — top-of-bar restore chips. Visible only
          when localStorage has prior entries. One tap restores the
          full patient context. */}
      {recent.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
          <span style={{
            fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".1em",
            textTransform:"uppercase", color:"var(--muted)", fontWeight:600,
            alignSelf:"center", marginRight:2,
          }}>Recent:</span>
          {recent.map((r, i) => (
            <button key={i} type="button" onClick={() => _restoreRecent(r)}
              title={`Restore: ${_recentLabel(r)}`}
              style={{
                fontSize:11, fontWeight:500, color:"var(--ink2)",
                background:"var(--paper2)", border:"1px solid var(--line)",
                borderRadius:999, padding:"3px 9px", cursor:"pointer",
                whiteSpace:"nowrap",
              }}>
              {_recentLabel(r)}
            </button>
          ))}
          <button type="button" onClick={() => { _writeRecent([]); setRecent([]); }}
            title="Clear recently-used cases"
            aria-label="Clear recently-used cases"
            style={{
              fontFamily:"var(--mono)", fontSize:10, color:"var(--muted)",
              background:"none", border:"none", padding:"3px 6px", cursor:"pointer",
              alignSelf:"center",
            }}>
            <X size={10} aria-hidden />
          </button>
        </div>
      )}

      <div style={{ display:"flex", gap:8, marginBottom: 10, position: "relative", zIndex: 1 }}>
        <input
          type="text"
          className="rx-w10-input"
          value={text}
          onChange={e => { setText(e.target.value); setTouchedAny(false); }}
          placeholder={EXAMPLES[0]}
          aria-label="Case description (free text)"
          style={{ flex:1, minWidth:0, fontSize: 14 }}
        />
        {text && (
          <button type="button" onClick={() => setText("")} title="Clear input" aria-label="Clear input"
            className="rx-w10-ghost"
            style={{ padding: "0 12px" }}>
            <X size={14} aria-hidden />
          </button>
        )}
      </div>

      {!text && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
          <span style={{ fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".1em", textTransform:"uppercase", color:"var(--muted)", fontWeight:600, alignSelf:"center", marginRight:2 }}>Try:</span>
          {EXAMPLES.map(ex => (
            <button key={ex} type="button" onClick={() => setText(ex)}
              style={{
                fontFamily:"var(--mono)", fontSize:11, color:"var(--ox)",
                background:"var(--ox-softer)", border:"1px dashed var(--ox-line)", borderRadius:6,
                padding:"3px 8px", cursor:"pointer", whiteSpace:"nowrap",
              }}>{ex}</button>
          ))}
        </div>
      )}

      {text && (
        <div style={{ margin:"4px 0 14px" }}>
          <div style={{ fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".1em", textTransform:"uppercase", color:"var(--muted)", fontWeight:600, marginBottom:6 }}>
            Parsed
            {parsed.chips.length === 0 && <span style={{ color:"var(--muted)", marginLeft:8, textTransform:"none", letterSpacing:0, fontFamily:"var(--sans)", fontSize:12 }}>nothing recognised yet — keep typing or toggle the chips below</span>}
          </div>
          {parsed.chips.length > 0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {parsed.chips.map((c, i) => (
                <Chip key={i} kind={c.kind} label={c.kind === "syndrome" ? (_synName(c.label) || c.label) : c.label} />
              ))}
            </div>
          )}
          {parsed.rump && (
            <div style={{ marginTop:7, fontSize:11.5, color:"var(--muted)", fontStyle:"italic" }}>
              Couldn't match: "{parsed.rump}" — toggle the chips below if it matters.
            </div>
          )}
        </div>
      )}

      <div style={{ height:1, background:"var(--line2)", margin:"4px 0 14px" }} />

      {/* Default-visible structured fields. C3 progressive disclosure
          shows ~9 fields here (syndrome / age / sex / CrCl band /
          allergy / 4 risk toggles); the less-common entries
          (hepatic / pregnancy / transplant / weight) live behind the
          "More fields" disclosure below. */}
      <div className="rx-builder-grid" style={{ position: "relative", zIndex: 1 }}>
        <label className="rx-builder-field">
          <span>Presentation <LockBadge visible={touched.syndrome} /></span>
          <select className="rx-w10-select" value={_eff.syndrome} onChange={e => _setField("syndrome", e.target.value)}>
            <option value="">— pick a syndrome —</option>
            {SYN_CATS.map(cat => (
              <optgroup key={cat.id} label={cat.label}>
                {SYNDROMES.filter(s => s.cat === cat.id).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="rx-builder-field">
          <span>β-lactam allergy <LockBadge visible={touched.blAllergy} /></span>
          <select className="rx-w10-select" value={_eff.blAllergy} onChange={e => _setField("blAllergy", e.target.value)}>
            <option value="none">None</option>
            <option value="mild">Low-risk / delayed</option>
            <option value="severe">Severe / anaphylaxis</option>
          </select>
        </label>
      </div>

      <div className="rx-builder-grid" style={{ marginTop: 10, position: "relative", zIndex: 1 }}>
        <label className="rx-builder-field">
          <span>Age <LockBadge visible={touched.age} /></span>
          <input className="rx-w10-input" type="number" min="0" max="120" value={_eff.age || ""}
            onChange={e => _setField("age", e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="—" />
        </label>
        <label className="rx-builder-field">
          <span>Sex <LockBadge visible={touched.sex} /></span>
          <select className="rx-w10-select" value={_eff.sex || ""} onChange={e => _setField("sex", e.target.value)}>
            <option value="">—</option>
            <option value="M">M</option>
            <option value="F">F</option>
          </select>
        </label>
        <label className="rx-builder-field">
          <span>CrCl (mL/min) <LockBadge visible={touched.crclBand} /></span>
          <select className="rx-w10-select" value={touched.crclBand ? manual.crclBand : _initialBand}
            onChange={e => _setField("crclBand", e.target.value)}>
            {CRCL_BANDS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </label>
      </div>

      <div className="rx-builder-risks">
        <span className="rx-builder-rlab">Host risks</span>
        {RISK_KEYS.map(([k, lab]) => (
          <button key={k} type="button"
            className={"rx-tag clk " + (_eff[k] ? "t-ox" : "t-neutral")}
            aria-pressed={!!_eff[k]}
            onClick={() => _toggleRisk(k)}>
            {_eff[k] ? <Check size={11}/> : <Plus size={11}/>} {lab}
          </button>
        ))}
      </div>

      {/* Advanced fields — collapsed by default to keep the form tight.
          When the user has a reason to look (hepatic-adjusted dosing,
          pregnancy, transplant, etc.) they get the full toolkit one
          click away. Open state persists for the current session. */}
      <button type="button" onClick={() => setShowAdvanced(v => !v)}
        aria-expanded={showAdvanced}
        style={{
          display:"inline-flex", alignItems:"center", gap:5, marginTop:14,
          fontFamily:"var(--mono)", fontSize:10.5, letterSpacing:".08em",
          textTransform:"uppercase", color:"var(--muted)", fontWeight:600,
          background:"none", border:"none", padding:0, cursor:"pointer",
        }}>
        {showAdvanced ? <ChevronDown size={12}/> : <ChevronRight size={12}/>}
        More fields {!showAdvanced && <span style={{ color:"var(--faint)", textTransform:"none", letterSpacing:0, marginLeft:4 }}>· hepatic, pregnancy, transplant, weight</span>}
      </button>
      {showAdvanced && (
        <div style={{ marginTop: 10, paddingTop: 12, borderTop: "1px dashed var(--line2)" }}>
          <div className="rx-builder-grid">
            <label className="rx-builder-field">
              <span>Hepatic stage <LockBadge visible={touched.hepatic} /></span>
              <select className="rx-w10-select" value={manual.hepatic} onChange={e => _setField("hepatic", e.target.value)}>
                {HEPATIC_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </label>
            <label className="rx-builder-field">
              <span>Weight (kg) <LockBadge visible={touched.weightKg} /></span>
              <input className="rx-w10-input" type="number" min="0" max="400" value={manual.weightKg}
                onChange={e => _setField("weightKg", e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="—" />
            </label>
          </div>
          <div className="rx-builder-risks" style={{ marginTop: 10 }}>
            <span className="rx-builder-rlab">Special host</span>
            <button type="button"
              className={"rx-tag clk " + (manual.pregnancy ? "t-ox" : "t-neutral")}
              aria-pressed={!!manual.pregnancy}
              onClick={() => { setManual(m => ({ ...m, pregnancy: !m.pregnancy })); setTouched(t => ({ ...t, pregnancy: true })); setTouchedAny(true); }}>
              {manual.pregnancy ? <Check size={11}/> : <Plus size={11}/>} Pregnant
            </button>
            <button type="button"
              className={"rx-tag clk " + (manual.transplant ? "t-ox" : "t-neutral")}
              aria-pressed={!!manual.transplant}
              onClick={() => { setManual(m => ({ ...m, transplant: !m.transplant })); setTouched(t => ({ ...t, transplant: true })); setTouchedAny(true); }}>
              {manual.transplant ? <Check size={11}/> : <Plus size={11}/>} Solid-organ transplant
            </button>
          </div>
        </div>
      )}

      {synName && (
        <div style={{ fontSize:12, color:"var(--ink2)", marginTop:14, marginBottom:12, padding:"6px 10px", background:"var(--ox-softer)", border:"1px solid var(--ox-line)", borderRadius:8 }}>
          <Crosshair size={11} style={{ verticalAlign:"-1px", color:"var(--ox)", marginRight:6 }} />
          Presentation: <b>{synName}</b>
        </div>
      )}

      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", marginTop: synName ? 0 : 14, position: "relative", zIndex: 1 }}>
        <button ref={applyBtnRef} type="button"
          className="rx-builder-go rx-w10-cta rx-magnetic rx-ripple"
          onClick={apply} disabled={!canApply}>
          <ArrowRight size={14}/> Apply case
        </button>
        {(text || touchedAny) && (
          <button type="button" onClick={reset} className="rx-w10-ghost">
            <RotateCcw size={12}/> Reset
          </button>
        )}
        {onSkip && (
          <button type="button" onClick={onSkip}
            style={{ marginLeft:"auto",
              display:"inline-flex", alignItems:"center", gap:5,
              fontFamily:"var(--mono)", fontSize:11, letterSpacing:".06em", color:"var(--muted)",
              background:"none", border:"none", padding:"6px 8px", cursor:"pointer" }}>
            Skip to reference <ArrowRight size={11}/>
          </button>
        )}
      </div>
    </div>
  );
}

export { CaseBar };
