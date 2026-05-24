/* component · AntibiogramManager — Phase E3 settings panel.
   Lists all loaded antibiograms (seed + user-uploaded), shows the
   currently active one, and provides upload-CSV / preview / save /
   delete / switch / download affordances.

   Rendered as a modal overlay so it can be opened from anywhere
   (the gear in AntibiogramBlock, the Principles section, or the
   header). Closes on backdrop click + Escape.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState, useRef, useEffect } from "react";
import { Hospital, Upload, Trash2, Check, Download, X, AlertCircle, FileText } from "lucide-react";
import { parseAntibiogramCSV, serializeAntibiogramCSV } from "../engines/antibiogramParser.js";

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
    <div style={{ marginTop: 14, padding: 12, border: "1px dashed var(--line2)", borderRadius: 8, background: "var(--paper2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
        <Upload size={13} color="var(--ox)" aria-hidden />
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: "var(--ox)", letterSpacing: ".08em", textTransform: "uppercase" }}>
          Add an antibiogram (CSV)
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Hospital name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Hospital name"
          style={_inputStyle}
        />
        <input
          type="date"
          placeholder="Period from"
          value={periodFrom}
          onChange={(e) => setPeriodFrom(e.target.value)}
          aria-label="Period from"
          style={_inputStyle}
        />
        <input
          type="date"
          placeholder="Period to"
          value={periodTo}
          onChange={(e) => setPeriodTo(e.target.value)}
          aria-label="Period to"
          style={_inputStyle}
        />
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
        <label style={{ ..._btnStyle("ghost"), cursor: "pointer" }}>
          <FileText size={11} aria-hidden /> Choose CSV file…
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={onFile} style={{ display: "none" }} />
        </label>
        <span style={{ fontSize: 10.5, color: "var(--ink2)" }}>
          or paste CSV below
        </span>
      </div>
      <textarea
        value={csvText}
        onChange={(e) => setCsvText(e.target.value)}
        placeholder={"Organism,# of Isolates,Cefazolin,Ceftriaxone,Meropenem\nEscherichia coli,500,78,90,100\n..."}
        aria-label="CSV content"
        rows={5}
        style={{
          ..._inputStyle, width: "100%", boxSizing: "border-box",
          fontFamily: "var(--mono)", fontSize: 11, lineHeight: 1.5,
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={onPreview} disabled={!csvText.trim()} style={_btnStyle("ghost")}>
          Preview
        </button>
        <button type="button" onClick={onConfirmSave} disabled={!preview} style={_btnStyle("primary")}>
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
      <div style={{
        background: "var(--panel)",
        border: "1px solid var(--ox-line)",
        borderRadius: 12,
        boxShadow: "0 8px 32px -8px rgba(20, 20, 20, 0.35)",
        maxWidth: 720,
        width: "100%",
        padding: 18,
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
