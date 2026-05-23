/* component · Case Bar — Phase A.1 of the bedside reframe.
   The primary input affordance of Bedside mode: free-text first, with a
   chip-builder beneath for direct correction. The bar parses the text with
   the pure case-parser engine and renders every successful match as a chip
   so the user can verify or correct before applying. "Apply" merges the
   parsed result into caseState; the Answer Canvas (Phase A.2) consumes it.
   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState, useMemo } from "react";
import { ArrowRight, Check, GitBranch, RotateCcw, Search, X, Plus, Crosshair } from "lucide-react";
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

const CHIP_TONE = {
  demo:     { fg:"var(--ink)",      bg:"var(--paper2)",       bd:"var(--line)" },
  lab:      { fg:"var(--ox)",       bg:"var(--ox-softer)",    bd:"var(--ox-line)" },
  renal:    { fg:"var(--ox-deep)",  bg:"var(--ox-soft)",      bd:"var(--ox-line)" },
  hepatic:  { fg:"var(--amber)",    bg:"var(--amber-soft)",   bd:"var(--amber-line)" },
  risk:     { fg:"var(--ox)",       bg:"var(--ox-soft)",      bd:"var(--ox-line)" },
  allergy:  { fg:"var(--amber)",    bg:"var(--amber-soft)",   bd:"var(--amber-line)" },
  syndrome: { fg:"#fff",            bg:"var(--ox)",           bd:"var(--ox)" },
};

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

function CaseBar({ caseState, onApply, onSkip }) {
  const [text, setText] = useState("");
  const [touched, setTouched] = useState(false);

  // Parse live so the chip preview updates as the user types. Cheap and pure.
  const parsed = useMemo(() => parseCase(text), [text]);

  // Manual builder state. Initialised from current caseState so the user
  // can refine an already-applied case rather than starting over.
  const cp = caseState && caseState.patient || {};
  const [manSyn, setManSyn] = useState(caseState && caseState.syndrome || "");
  const [manAllergy, setManAllergy] = useState(cp.blAllergy || "none");
  const [manRisks, setManRisks] = useState({
    mrsaRisk:   !!cp.mrsaRisk,
    pseudoRisk: !!cp.pseudoRisk,
    esblRisk:   !!cp.esblRisk,
    severe:     !!cp.severe,
  });

  /* "Apply" merges the parsed result + any manual chip overrides into the
     caseState. The manual chip-builder is the source of truth for whatever
     it has explicitly toggled; the parsed result fills in everything else. */
  const apply = () => {
    setTouched(true);
    const patientUpdate = {
      ...parsed.patient,
      ...manRisks,
      blAllergy: manAllergy !== "none" ? manAllergy : (parsed.patient.blAllergy || "none"),
      on: true,
    };
    onApply && onApply({
      patient: patientUpdate,
      syndrome: manSyn || parsed.syndrome || null,
    });
  };

  const reset = () => {
    setText("");
    setTouched(false);
    setManSyn("");
    setManAllergy("none");
    setManRisks({ mrsaRisk:false, pseudoRisk:false, esblRisk:false, severe:false });
  };

  const synName = _synName(manSyn || parsed.syndrome);
  const canApply = (parsed.patient && Object.keys(parsed.patient).length > 0) || manSyn || Object.values(manRisks).some(Boolean);

  return (
    <div className="rx-builder" style={{ marginBottom: 20 }}>
      <div className="rx-builder-h"><Search size={16} /> Describe the case</div>
      <p className="rx-builder-sub">
        Type the case in shorthand — e.g. <em>"72M PNA prior MRSA CrCl 35"</em>. The parser shows
        exactly what it understood as chips below; correct anything before applying. Or skip
        the text and toggle the chips directly.
      </p>

      <div style={{ display:"flex", gap:8, marginBottom: 10 }}>
        <input
          type="text"
          value={text}
          onChange={e => { setText(e.target.value); setTouched(false); }}
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

      <div className="rx-builder-grid">
        <label className="rx-builder-field">
          <span>Presentation</span>
          <select value={manSyn} onChange={e => setManSyn(e.target.value)}>
            <option value="">— pick a syndrome —</option>
            {SYN_CATS.map(cat => (
              <optgroup key={cat.id} label={cat.label}>
                {SYNDROMES.filter(s => s.cat === cat.id).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="rx-builder-field">
          <span>β-lactam allergy</span>
          <select value={manAllergy} onChange={e => setManAllergy(e.target.value)}>
            <option value="none">None</option>
            <option value="mild">Low-risk / delayed</option>
            <option value="severe">Severe / anaphylaxis</option>
          </select>
        </label>
      </div>

      <div className="rx-builder-risks">
        <span className="rx-builder-rlab">Host risks</span>
        {RISK_KEYS.map(([k, lab]) => (
          <button key={k} type="button"
            className={"rx-tag clk " + (manRisks[k] ? "t-ox" : "t-neutral")}
            aria-pressed={!!manRisks[k]}
            onClick={() => setManRisks(r => ({ ...r, [k]: !r[k] }))}>
            {manRisks[k] ? <Check size={11}/> : <Plus size={11}/>} {lab}
          </button>
        ))}
      </div>

      {synName && (
        <div style={{ fontSize:12, color:"var(--ink2)", marginBottom:12, padding:"6px 10px", background:"var(--ox-softer)", border:"1px solid var(--ox-line)", borderRadius:8 }}>
          <Crosshair size={11} style={{ verticalAlign:"-1px", color:"var(--ox)", marginRight:6 }} />
          Presentation: <b>{synName}</b>
        </div>
      )}

      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
        <button type="button" className="rx-builder-go" onClick={apply} disabled={!canApply}
          style={{ opacity: canApply ? 1 : 0.5, cursor: canApply ? "pointer" : "not-allowed" }}>
          <ArrowRight size={14}/> Apply case
        </button>
        {(text || touched) && (
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
