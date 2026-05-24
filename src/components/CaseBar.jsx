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

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState, useMemo, useEffect } from "react";
import { ArrowRight, Check, ChevronDown, ChevronRight, Crosshair, Lock, Plus, RotateCcw, Search, X } from "lucide-react";
import { parseCase } from "../engines/case-parser.js";
import { SYNDROMES, SYN_CATS } from "../data/syndromes.js";

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
          <X size={10} />
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
      <Lock size={9} aria-hidden /> Set
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
  const [text, setText] = useState("");
  const [touchedAny, setTouchedAny] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recent, setRecent] = useState(() => _readRecent());

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
    <div className="rx-builder" style={{ marginBottom: 20 }}>
      <div className="rx-builder-h"><Search size={16} /> Describe the case</div>
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
            <X size={10} />
          </button>
        </div>
      )}

      <div style={{ display:"flex", gap:8, marginBottom: 10 }}>
        <input
          type="text"
          value={text}
          onChange={e => { setText(e.target.value); setTouchedAny(false); }}
          placeholder={EXAMPLES[0]}
          aria-label="Case description (free text)"
          style={{
            flex:1, minWidth:0,
            fontFamily:"var(--sans)", fontSize:14, color:"var(--ink)",
            background:"var(--paper)", border:"1px solid var(--line)", borderRadius:9,
            padding:"10px 13px", outline:"none",
          }}
        />
        {text && (
          <button type="button" onClick={() => setText("")} title="Clear input" aria-label="Clear input"
            style={{ background:"none", border:"1px solid var(--line)", borderRadius:9, padding:"0 12px", cursor:"pointer", color:"var(--muted)" }}>
            <X size={14} />
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
      <div className="rx-builder-grid">
        <label className="rx-builder-field">
          <span>Presentation <LockBadge visible={touched.syndrome} /></span>
          <select value={_eff.syndrome} onChange={e => _setField("syndrome", e.target.value)}>
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
          <select value={_eff.blAllergy} onChange={e => _setField("blAllergy", e.target.value)}>
            <option value="none">None</option>
            <option value="mild">Low-risk / delayed</option>
            <option value="severe">Severe / anaphylaxis</option>
          </select>
        </label>
      </div>

      <div className="rx-builder-grid" style={{ marginTop: 10 }}>
        <label className="rx-builder-field">
          <span>Age <LockBadge visible={touched.age} /></span>
          <input type="number" min="0" max="120" value={_eff.age || ""}
            onChange={e => _setField("age", e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="—" />
        </label>
        <label className="rx-builder-field">
          <span>Sex <LockBadge visible={touched.sex} /></span>
          <select value={_eff.sex || ""} onChange={e => _setField("sex", e.target.value)}>
            <option value="">—</option>
            <option value="M">M</option>
            <option value="F">F</option>
          </select>
        </label>
        <label className="rx-builder-field">
          <span>CrCl (mL/min) <LockBadge visible={touched.crclBand} /></span>
          <select value={touched.crclBand ? manual.crclBand : _initialBand}
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
              <select value={manual.hepatic} onChange={e => _setField("hepatic", e.target.value)}>
                {HEPATIC_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </label>
            <label className="rx-builder-field">
              <span>Weight (kg) <LockBadge visible={touched.weightKg} /></span>
              <input type="number" min="0" max="400" value={manual.weightKg}
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

      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", marginTop: synName ? 0 : 14 }}>
        <button type="button" className="rx-builder-go" onClick={apply} disabled={!canApply}
          style={{ opacity: canApply ? 1 : 0.5, cursor: canApply ? "pointer" : "not-allowed" }}>
          <ArrowRight size={14}/> Apply case
        </button>
        {(text || touchedAny) && (
          <button type="button" onClick={reset}
            style={{ display:"inline-flex", alignItems:"center", gap:5,
              fontFamily:"var(--sans)", fontSize:12, color:"var(--muted)",
              background:"none", border:"1px solid var(--line)", borderRadius:8,
              padding:"8px 12px", cursor:"pointer" }}>
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
