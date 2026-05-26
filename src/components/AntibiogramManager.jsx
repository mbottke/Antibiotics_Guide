/* component · AntibiogramManager — Phase E3 settings panel.
   Lists all loaded antibiograms (seed + user-uploaded), shows the
   currently active one, and provides upload-CSV / preview / save /
   delete / switch / download affordances.

   Rendered as a modal overlay so it can be opened from anywhere
   (the gear in AntibiogramBlock, the Principles section, or the
   header). Closes on backdrop click + Escape.

   Wave 10 W10 forms/inputs atomized pass — every text input, date
   input, and textarea in the upload panel adopts asymmetric 10/3
   corners, glass-diffuse fill, italic-serif placeholders, cyan
   focus halo. Form rows alternate subtle zebra (5% alpha) for
   legibility. The Save antibiogram CTA upgrades to the chrome
   treatment with magnetic pull + sheen + ripple.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState, useRef, useEffect } from "react";
import { Hospital, Upload, Trash2, Check, Download, X, AlertCircle, FileText } from "lucide-react";
import { parseAntibiogramCSV, serializeAntibiogramCSV } from "../engines/antibiogramParser.js";
import { useMagnetic } from "./util/useMagnetic.js";
import { useRipple } from "./util/useRipple.js";
import { GradientHairline } from "./decor/GradientHairline.jsx";

/* W10 · scoped chrome for AntibiogramManager fields. */
const W10_ABM_CSS = `
[data-w10-abm] .rx-w10-input,
[data-w10-abm] .rx-w10-textarea {
  font-family: var(--sans);
  font-size: 12.5px;
  color: var(--ink);
  background: linear-gradient(135deg,
    rgba(255,255,255,0.78) 0%,
    rgba(245,250,253,0.58) 100%);
  backdrop-filter: blur(10px) saturate(160%);
  -webkit-backdrop-filter: blur(10px) saturate(160%);
  border: 1px solid var(--line);
  border-radius: 10px 3px 10px 3px;
  padding: 9px 11px;
  outline: none;
  transition: border-color .15s var(--ease-out, ease), box-shadow .18s var(--ease-out, ease);
}
[data-w10-abm] .rx-w10-input::placeholder,
[data-w10-abm] .rx-w10-textarea::placeholder {
  font-family: var(--serif);
  font-style: italic;
  color: var(--muted);
  opacity: .72;
}
[data-w10-abm] .rx-w10-textarea::placeholder {
  /* Mono-style placeholder kept for CSV examples — the textarea content
      is monospace data, so the placeholder echoes that voice. */
  font-family: var(--mono);
  font-style: normal;
}
[data-w10-abm] .rx-w10-input:hover,
[data-w10-abm] .rx-w10-textarea:hover { border-color: var(--ox-line); }
[data-w10-abm] .rx-w10-input:focus-visible,
[data-w10-abm] .rx-w10-textarea:focus-visible {
  border-color: var(--neon-cyan, var(--ox-bright));
  box-shadow:
    0 0 0 2px var(--neon-cyan, var(--ox-bright)),
    0 0 18px color-mix(in srgb, var(--neon-cyan, var(--ox-bright)) 30%, transparent);
}
[data-w10-abm] .rx-w10-cta {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px 14px;
  border-radius: 10px 3px 10px 3px;
  border: 1px solid color-mix(in srgb, var(--ox-deep, var(--ox)) 70%, transparent);
  color: #fff;
  font-family: var(--mono); font-size: 10.5px; font-weight: 700;
  letter-spacing: .06em; text-transform: uppercase;
  cursor: pointer; overflow: hidden; isolation: isolate;
  background: linear-gradient(180deg,
    var(--ox-deep, #0B0F14) 0%,
    var(--ox, #1F2937) 35%,
    var(--ox, #1F2937) 55%,
    var(--ox-deep, #0B0F14) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.20),
    inset 0 -1px 0 rgba(0,0,0,0.30),
    0 6px 14px -4px rgba(11,15,20,0.45),
    0 0 16px -6px color-mix(in srgb, var(--neon-cyan, var(--ox-bright)) 45%, transparent);
  transition: box-shadow .18s var(--ease-out, ease), transform .12s var(--ease-out, ease);
}
[data-w10-abm] .rx-w10-cta::after {
  content: ""; position: absolute; top: 0; left: -120%;
  width: 60%; height: 100%;
  background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.40) 50%, transparent 100%);
  transform: skewX(-18deg); pointer-events: none;
  transition: left 600ms cubic-bezier(0.16, 1, 0.3, 1);
}
[data-w10-abm] .rx-w10-cta:hover::after { left: 140%; }
[data-w10-abm] .rx-w10-cta:hover {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.30),
    0 10px 22px -6px rgba(11,15,20,0.55),
    0 0 24px -4px color-mix(in srgb, var(--neon-cyan, var(--ox-bright)) 55%, transparent);
}
[data-w10-abm] .rx-w10-cta:active { transform: translateY(1px); }
[data-w10-abm] .rx-w10-cta:disabled {
  opacity: .5; cursor: not-allowed;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 2px 4px rgba(11,15,20,0.20);
}
[data-w10-abm] .rx-w10-cta:focus-visible {
  outline: 2px solid var(--neon-cyan, var(--ox-bright));
  outline-offset: 2px;
}
[data-w10-abm] .rx-w10-ghost {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: var(--mono); font-size: 10.5px; font-weight: 700;
  letter-spacing: .06em; text-transform: uppercase;
  color: var(--ink2); background: transparent;
  border: 1px solid color-mix(in srgb, var(--neon-cyan, var(--ox-bright)) 30%, var(--line));
  border-radius: 10px 3px 10px 3px;
  padding: 7px 11px; cursor: pointer;
  transition: color .18s var(--ease-out, ease), border-color .18s var(--ease-out, ease), background .18s var(--ease-out, ease);
}
[data-w10-abm] .rx-w10-ghost:hover {
  color: var(--neon-cyan, var(--ox));
  border-color: var(--neon-cyan, var(--ox));
  background: color-mix(in srgb, var(--neon-cyan, var(--ox-bright)) 6%, transparent);
}
[data-w10-abm] .rx-w10-ghost:disabled {
  opacity: .5; cursor: not-allowed;
}
@media (prefers-reduced-motion: reduce) {
  [data-w10-abm] .rx-w10-cta::after,
  [data-w10-abm] .rx-w10-cta,
  [data-w10-abm] .rx-w10-ghost,
  [data-w10-abm] .rx-w10-input,
  [data-w10-abm] .rx-w10-textarea { transition: none !important; }
}
`;
function _ensureAbmStyles() {
  if(typeof document === "undefined") return;
  if(document.querySelector("style[data-w10-abm-styles]")) return;
  const tag = document.createElement("style");
  tag.setAttribute("data-w10-abm-styles", "");
  tag.textContent = W10_ABM_CSS;
  document.head.appendChild(tag);
}

function Backdrop({ onClose, children }) {
  useEffect(() => {
    if(typeof document === "undefined") return;
    const onKey = (e) => { if(e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Antibiogram manager"
      onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(20, 20, 20, 0.42)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "5vh 16px",
        overflowY: "auto",
      }}>
      {children}
    </div>
  );
}

function AntibiogramCard({ ab, active, onSelect, onDelete, onDownload }) {
  return (
    <li style={{
      display: "grid", gap: 6,
      padding: "10px 12px",
      background: active ? "rgba(15, 76, 129, 0.08)" : "var(--paper2)",
      border: "1px solid " + (active ? "var(--ox)" : "var(--line)"),
      borderRadius: 7,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
            {ab.name}
            {ab.isSeed && (
              <span style={{
                marginLeft: 7,
                fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700,
                color: "var(--ink2)", background: "var(--paper)",
                padding: "1px 5px", borderRadius: 3,
                letterSpacing: ".06em",
              }}>SEED</span>
            )}
            {active && (
              <span style={{
                marginLeft: 7,
                fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700,
                color: "#fff", background: "var(--ox)",
                padding: "1px 5px", borderRadius: 3,
                letterSpacing: ".06em",
              }}>ACTIVE</span>
            )}
          </div>
          {ab.subtitle && (
            <div style={{ fontSize: 11, color: "var(--ink2)", marginTop: 1, fontStyle: "italic" }}>
              {ab.subtitle}
            </div>
          )}
          {ab.period && (ab.period.from || ab.period.to) && (
            <div style={{ fontSize: 10.5, color: "var(--ink2)", fontFamily: "var(--mono)", marginTop: 2 }}>
              {ab.period.from} → {ab.period.to} · {ab.organisms.length} organism{ab.organisms.length === 1 ? "" : "s"}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {!active && (
            <button type="button" onClick={() => onSelect(ab.id)} title="Set as active antibiogram"
              style={_btnStyle("primary")}>
              <Check size={11} aria-hidden /> Activate
            </button>
          )}
          <button type="button" onClick={() => onDownload(ab)} title="Download as CSV"
            style={_btnStyle("ghost")}>
            <Download size={11} aria-hidden /> CSV
          </button>
          {!ab.isSeed && (
            <button type="button" onClick={() => onDelete(ab.id)} title="Delete this antibiogram"
              style={_btnStyle("danger")}>
              <Trash2 size={11} aria-hidden /> Delete
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function _btnStyle(variant) {
  const map = {
    primary: { color: "#fff", bg: "var(--ox)", border: "var(--ox)" },
    ghost:   { color: "var(--ox)", bg: "var(--panel)", border: "var(--ox-line)" },
    danger:  { color: "#b91c1c", bg: "var(--panel)", border: "rgba(185, 28, 28, 0.4)" },
  };
  const m = map[variant] || map.ghost;
  return {
    display: "inline-flex", alignItems: "center", gap: 4,
    fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
    letterSpacing: ".06em", textTransform: "uppercase",
    color: m.color, background: m.bg,
    border: "1px solid " + m.border, borderRadius: 4,
    padding: "3px 7px", cursor: "pointer",
    whiteSpace: "nowrap",
  };
}

function UploadPanel({ onSave }) {
  const [name, setName] = useState("");
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);
  const saveBtnRef = useRef(null);
  useMagnetic(saveBtnRef, { strength: 0.22, range: 90 });
  useRipple(saveBtnRef);

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCsvText(String(reader.result || ""));
      if(!name) setName(f.name.replace(/\.csv$/i, ""));
    };
    reader.readAsText(f);
  };

  const onPreview = () => {
    const meta = {
      name: name || "Custom antibiogram",
      period: { from: periodFrom, to: periodTo },
      source: "User upload",
    };
    const r = parseAntibiogramCSV(csvText, meta);
    setPreview(r.antibiogram);
    setErrors(r.errors);
  };

  const onConfirmSave = () => {
    if(!preview) return;
    onSave(preview);
    setName(""); setPeriodFrom(""); setPeriodTo(""); setCsvText("");
    setPreview(null); setErrors([]);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div style={{
      marginTop: 14, padding: 14,
      border: "1px solid color-mix(in srgb, var(--neon-cyan, var(--ox-bright)) 22%, var(--line))",
      /* W10 · asymmetric 12/3 — matches the panel system. */
      borderRadius: "12px 3px 12px 3px",
      background: "linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(245,250,253,0.45) 100%)",
      backdropFilter: "blur(12px) saturate(160%)",
      WebkitBackdropFilter: "blur(12px) saturate(160%)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
        <Upload size={13} color="var(--neon-cyan, var(--ox))" aria-hidden />
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: "var(--ink)", letterSpacing: ".08em", textTransform: "uppercase" }}>
          Add an antibiogram (CSV)
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
        <input
          type="text"
          className="rx-w10-input"
          placeholder="Hospital name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Hospital name"
        />
        <input
          type="date"
          className="rx-w10-input"
          placeholder="Period from"
          value={periodFrom}
          onChange={(e) => setPeriodFrom(e.target.value)}
          aria-label="Period from"
        />
        <input
          type="date"
          className="rx-w10-input"
          placeholder="Period to"
          value={periodTo}
          onChange={(e) => setPeriodTo(e.target.value)}
          aria-label="Period to"
        />
      </div>
      {/* W10 · gradient hairline separator between group blocks. */}
      <GradientHairline variant="cyan-blue" style={{ margin: "0 0 12px" }} />
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
        <label className="rx-w10-ghost" style={{ cursor: "pointer" }}>
          <FileText size={11} aria-hidden /> Choose CSV file…
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={onFile} style={{ display: "none" }} />
        </label>
        <span style={{ fontSize: 10.5, color: "var(--ink2)" }}>
          or paste CSV below
        </span>
      </div>
      <textarea
        className="rx-w10-textarea"
        value={csvText}
        onChange={(e) => setCsvText(e.target.value)}
        placeholder={"Organism,# of Isolates,Cefazolin,Ceftriaxone,Meropenem\nEscherichia coli,500,78,90,100\n..."}
        aria-label="CSV content"
        rows={5}
        style={{
          width: "100%", boxSizing: "border-box",
          fontFamily: "var(--mono)", fontSize: 11.5, lineHeight: 1.55,
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={onPreview} disabled={!csvText.trim()} className="rx-w10-ghost">
          Preview
        </button>
        <button ref={saveBtnRef} type="button" onClick={onConfirmSave} disabled={!preview}
          className="rx-w10-cta rx-magnetic rx-ripple">
          <Check size={11} aria-hidden /> Save antibiogram
        </button>
      </div>
      {errors && errors.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0", display: "grid", gap: 3 }}>
          {errors.slice(0, 10).map((e, i) => (
            <li key={"err-" + i} style={{
              fontSize: 10.5, color: "var(--amber)",
              display: "flex", gap: 5, alignItems: "baseline",
            }}>
              <AlertCircle size={10} aria-hidden style={{ flex: "0 0 auto" }} />
              <span>row {e.row}{e.column != null ? "/col " + e.column : ""}: {e.message}</span>
            </li>
          ))}
          {errors.length > 10 && (
            <li style={{ fontSize: 10.5, color: "var(--ink2)" }}>
              + {errors.length - 10} more parse note{errors.length - 10 === 1 ? "" : "s"}
            </li>
          )}
        </ul>
      )}
      {preview && (
        <div style={{ marginTop: 10, padding: "8px 10px", background: "var(--panel)", border: "1px solid var(--ox-line)", borderRadius: 5 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink)" }}>
            Preview · {preview.name}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--ink2)", marginTop: 2 }}>
            {preview.organisms.length} organism row{preview.organisms.length === 1 ? "" : "s"} parsed · click <i>Save antibiogram</i> to commit.
          </div>
        </div>
      )}
    </div>
  );
}

const _inputStyle = {
  fontFamily: "var(--sans)", fontSize: 12,
  padding: "5px 8px", color: "var(--ink)",
  background: "var(--panel)", border: "1px solid var(--line)",
  borderRadius: 4,
};

function AntibiogramManager({ open, onClose, antibiograms, activeId, onSelect, onSave, onDelete }) {
  _ensureAbmStyles();
  if(!open) return null;

  const downloadCSV = (ab) => {
    if(typeof window === "undefined") return;
    const csv = serializeAntibiogramCSV(ab);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (ab.name || "antibiogram").replace(/\s+/g, "_") + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Backdrop onClose={onClose}>
      <div
        data-w10-abm=""
        style={{
          background: "var(--panel)",
          border: "1px solid var(--ox-line)",
          /* W10 · asymmetric 18/4 to match panel system. */
          borderRadius: "18px 4px 18px 4px",
          boxShadow: "0 24px 48px -12px rgba(15,23,42,0.25), 0 8px 16px -4px rgba(15,23,42,0.15)",
          maxWidth: 720,
          width: "100%",
          padding: 20,
        }}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 14, gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Hospital size={18} color="var(--ox)" aria-hidden />
            <h2 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: 19, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.005em" }}>
              Antibiogram manager
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close antibiogram manager"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 28, height: 28,
              color: "var(--ink2)", background: "transparent",
              border: "1px solid var(--line)", borderRadius: 6, cursor: "pointer",
            }}>
            <X size={14} aria-hidden />
          </button>
        </div>

        {/* Intro */}
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--ink2)", lineHeight: 1.55 }}>
          Your active antibiogram drives the local-resistance overlay on every syndrome page.
          Switch hospitals here when you cover a different site, or upload a CSV to add a new institution.
          Periods + provenance display alongside every %S — clinicians need to evaluate the number.
        </p>

        {/* List */}
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
          {antibiograms.map(ab => (
            <AntibiogramCard
              key={ab.id}
              ab={ab}
              active={ab.id === activeId}
              onSelect={onSelect}
              onDelete={onDelete}
              onDownload={downloadCSV}
            />
          ))}
        </ul>

        <UploadPanel onSave={onSave} />
      </div>
    </Backdrop>
  );
}

export { AntibiogramManager };
