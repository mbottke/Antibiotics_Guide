/* component · AntibiogramManager — Phase E3 settings panel.
   Lists all loaded antibiograms (seed + user-uploaded), shows the
   currently active one, and provides upload-CSV / preview / save /
   delete / switch / download affordances.

   Rendered as a modal overlay so it can be opened from anywhere
   (the gear in AntibiogramBlock, the Principles section, or the
   header). Closes on backdrop click + Escape.

   Wave 10 W10 atomized internals pass — the form modal now wears the
   shared drawer/modal chrome vocabulary:
     • 22/4 asymmetric panel corners + 4px cyan top-strip
     • Top header rides a <MeshWash band, palette="cyan-blue">
     • Internal sections (list + upload) become .rx-glass-diffuse
       panels with 14/4 asymmetric corners
     • Section dividers swapped to <GradientHairline variant="cyan-blue">
     • Activate / Save buttons → .rx-chrome-cta with shine + ripple + magnetic
     • Cancel / Delete / Ghost buttons → outlined chrome with focus halo
     • Card "ACTIVE" badge ships with a .rx-light-ring-cyan
     • Overlay scrim swapped to .rx-mercury-backdrop
     • Panel entrance: soft .rx-glow-trail (reduced-motion gated)

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState, useRef, useEffect } from "react";
import { Hospital, Upload, Trash2, Check, Download, X, AlertCircle, FileText } from "lucide-react";
import { parseAntibiogramCSV, serializeAntibiogramCSV } from "../engines/antibiogramParser.js";
import { useRipple } from "./util/useRipple.js";
import { useReducedMotion } from "./util/useReducedMotion.js";
import { MeshWash } from "./decor/MeshWash.jsx";
import { GradientHairline } from "./decor/GradientHairline.jsx";

const TOP_STRIP_BG =
  "linear-gradient(90deg," +
  " var(--neon-cyan, var(--ox))," +
  " var(--electric-blue, var(--ox))," +
  " var(--hot-magenta, var(--ox)))";

const HAIRLINE_BG =
  "linear-gradient(90deg," +
  " transparent 0%," +
  " rgba(0, 212, 255, 0.45) 18%," +
  " rgba(61, 122, 255, 0.45) 50%," +
  " rgba(255, 61, 188, 0.30) 82%," +
  " transparent 100%)";

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
      className="rx-mercury-backdrop"
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "5vh 16px",
        overflowY: "auto",
      }}>
      {children}
    </div>
  );
}

/* Internal section panel — wraps the list + upload form in matching
   glass-diffuse cards so the modal reads as a stack of chrome panels
   rather than a single flat sheet. */
function ManagerSection({ children, style }) {
  return (
    <section
      className="rx-glass-diffuse"
      style={{
        position: "relative",
        borderRadius: "14px 4px 14px 4px",
        padding: "16px 18px",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function AntibiogramCard({ ab, active, onSelect, onDelete, onDownload }) {
  return (
    <li style={{
      display: "grid", gap: 6,
      padding: "10px 12px",
      background: active
        ? "linear-gradient(135deg, rgba(0,212,255,0.10) 0%, rgba(255,255,255,0.55) 100%)"
        : "rgba(255, 255, 255, 0.55)",
      border: "1px solid " + (active ? "var(--neon-cyan, var(--ox))" : "var(--line)"),
      borderLeft: "2px solid " + (active ? "var(--neon-cyan, var(--ox))" : "var(--neon-cyan-line, var(--ox-line))"),
      borderRadius: "10px 3px 10px 3px",
      boxShadow: active ? "inset 0 0 24px -6px rgba(0,212,255,0.32)" : "none",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: "var(--ink)",
            display: "inline-flex", alignItems: "center", gap: 7, flexWrap: "wrap",
          }}>
            {ab.name}
            {ab.isSeed && (
              <span style={{
                fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700,
                color: "var(--ink2)", background: "var(--paper)",
                border: "1px solid var(--line)",
                padding: "1px 6px", borderRadius: 3,
                letterSpacing: ".06em", textTransform: "uppercase",
              }}>SEED</span>
            )}
            {active && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700,
                color: "#fff", background: "var(--ox)",
                padding: "1px 6px", borderRadius: 3,
                letterSpacing: ".06em", textTransform: "uppercase",
              }}>
                <span aria-hidden className="rx-light-ring-cyan" style={{ width: 7, height: 7, borderWidth: 1 }} />
                ACTIVE
              </span>
            )}
          </div>
          {ab.subtitle && (
            <div style={{ fontSize: 11, color: "var(--ink2)", marginTop: 2, fontStyle: "italic", fontFamily: "var(--serif)" }}>
              {ab.subtitle}
            </div>
          )}
          {ab.period && (ab.period.from || ab.period.to) && (
            <div style={{ fontSize: 10.5, color: "var(--ink2)", fontFamily: "var(--mono)", marginTop: 3, letterSpacing: ".04em" }}>
              {ab.period.from} → {ab.period.to} · {ab.organisms.length} organism{ab.organisms.length === 1 ? "" : "s"}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {!active && (
            <ChromeButton variant="primary" onClick={() => onSelect(ab.id)} title="Set as active antibiogram">
              <Check size={11} aria-hidden /> Activate
            </ChromeButton>
          )}
          <ChromeButton variant="ghost" onClick={() => onDownload(ab)} title="Download as CSV">
            <Download size={11} aria-hidden /> CSV
          </ChromeButton>
          {!ab.isSeed && (
            <ChromeButton variant="danger" onClick={() => onDelete(ab.id)} title="Delete this antibiogram">
              <Trash2 size={11} aria-hidden /> Delete
            </ChromeButton>
          )}
        </div>
      </div>
    </li>
  );
}

/* Unified button — primary uses rx-chrome-cta (steel sheen), ghost is
   outlined chrome, danger is outlined red. All carry magnetic + shine
   + ripple + focus-halo for the chrome microinteraction vocabulary. */
function ChromeButton({ variant = "ghost", onClick, title, disabled, children, type = "button" }) {
  const ref = useRef(null);
  useRipple(ref);
  if (variant === "primary") {
    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        title={title}
        disabled={disabled}
        className="rx-chrome-cta rx-magnetic rx-shine-sweep rx-ripple rx-focus-halo"
        style={{
          fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
          letterSpacing: ".08em", textTransform: "uppercase",
          padding: "5px 11px",
          borderRadius: "8px 2px 8px 2px",
          gap: 5,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {children}
      </button>
    );
  }
  const isDanger = variant === "danger";
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="rx-magnetic rx-shine-sweep rx-ripple rx-focus-halo"
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
        letterSpacing: ".08em", textTransform: "uppercase",
        color: isDanger ? "#b91c1c" : "var(--ink)",
        background: isDanger ? "rgba(185, 28, 28, 0.06)" : "rgba(0, 212, 255, 0.06)",
        border: "1px solid " + (isDanger ? "rgba(185, 28, 28, 0.40)" : "var(--neon-cyan-line, var(--ox-line))"),
        borderRadius: "8px 2px 8px 2px",
        padding: "5px 11px",
        cursor: disabled ? "not-allowed" : "pointer",
        whiteSpace: "nowrap",
        opacity: disabled ? 0.5 : 1,
        transition: "background var(--duration-base, .18s) var(--ease-out, ease), border-color var(--duration-base, .18s) var(--ease-out, ease)",
      }}
    >
      {children}
    </button>
  );
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
    <ManagerSection style={{ marginTop: 14 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 9, marginBottom: 12,
      }}>
        <span
          aria-hidden
          style={{
            flex: "0 0 auto",
            width: 28, height: 28,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            borderRadius: "8px 2px 8px 2px",
            background:
              "linear-gradient(135deg," +
              " var(--ox-deep, #0B0F14) 0%," +
              " var(--electric-blue, var(--ox)) 45%," +
              " var(--neon-cyan, #00D4FF) 100%)",
            color: "#fff",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), 0 2px 8px -2px rgba(0,212,255,.45)",
          }}
        >
          <Upload size={13} aria-hidden />
        </span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: "var(--ink2)", letterSpacing: ".14em", textTransform: "uppercase" }}>
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
          className="rx-focus-halo"
          style={_inputStyle}
        />
        <input
          type="date"
          placeholder="Period from"
          value={periodFrom}
          onChange={(e) => setPeriodFrom(e.target.value)}
          aria-label="Period from"
          className="rx-focus-halo"
          style={_inputStyle}
        />
        <input
          type="date"
          placeholder="Period to"
          value={periodTo}
          onChange={(e) => setPeriodTo(e.target.value)}
          aria-label="Period to"
          className="rx-focus-halo"
          style={_inputStyle}
        />
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
        <label style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
          letterSpacing: ".08em", textTransform: "uppercase",
          color: "var(--ink)",
          background: "rgba(0, 212, 255, 0.06)",
          border: "1px solid var(--neon-cyan-line, var(--ox-line))",
          borderRadius: "8px 2px 8px 2px",
          padding: "5px 11px", cursor: "pointer", whiteSpace: "nowrap",
        }}>
          <FileText size={11} aria-hidden /> Choose CSV file…
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={onFile} style={{ display: "none" }} />
        </label>
        <span style={{ fontSize: 10.5, color: "var(--ink2)", fontStyle: "italic", fontFamily: "var(--serif)" }}>
          or paste CSV below
        </span>
      </div>
      <textarea
        value={csvText}
        onChange={(e) => setCsvText(e.target.value)}
        placeholder={"Organism,# of Isolates,Cefazolin,Ceftriaxone,Meropenem\nEscherichia coli,500,78,90,100\n..."}
        aria-label="CSV content"
        rows={5}
        className="rx-focus-halo"
        style={{
          ..._inputStyle, width: "100%", boxSizing: "border-box",
          fontFamily: "var(--mono)", fontSize: 11, lineHeight: 1.5,
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <ChromeButton variant="ghost" onClick={onPreview} disabled={!csvText.trim()}>
          Preview
        </ChromeButton>
        <ChromeButton variant="primary" onClick={onConfirmSave} disabled={!preview}>
          <Check size={11} aria-hidden /> Save antibiogram
        </ChromeButton>
      </div>
      {errors && errors.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 3 }}>
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
        <div style={{
          marginTop: 12, padding: "10px 12px",
          background: "rgba(0, 212, 255, 0.06)",
          border: "1px solid var(--neon-cyan-line, var(--ox-line))",
          borderRadius: "8px 2px 8px 2px",
        }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink)" }}>
            Preview · {preview.name}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--ink2)", marginTop: 2 }}>
            {preview.organisms.length} organism row{preview.organisms.length === 1 ? "" : "s"} parsed · click <i>Save antibiogram</i> to commit.
          </div>
        </div>
      )}
    </ManagerSection>
  );
}

const _inputStyle = {
  fontFamily: "var(--sans)", fontSize: 12,
  padding: "6px 9px", color: "var(--ink)",
  background: "var(--panel)", border: "1px solid var(--line)",
  borderRadius: "6px 2px 6px 2px",
};

function AntibiogramManager({ open, onClose, antibiograms, activeId, onSelect, onSave, onDelete }) {
  const reducedMotion = useReducedMotion();
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
        className={reducedMotion ? "" : "rx-glow-trail rx-fade-in-up"}
        style={{
          position: "relative",
          background: "var(--paper)",
          border: "1px solid var(--line)",
          /* Asymmetric 22/4 corner pair — matches every other modal in
              the chrome family. */
          borderRadius: "22px 4px 22px 4px",
          boxShadow: "var(--shadow-drawer)",
          maxWidth: 760,
          width: "100%",
          padding: "26px 26px 22px",
          outline: "none",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}>
        {/* 4px cyan-gradient top strip. */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0, right: 0, top: 0,
            height: 4,
            background: TOP_STRIP_BG,
            borderTopLeftRadius: 22,
            pointerEvents: "none",
          }}
        />
        {/* Wave 9 W9 · molten-chrome band behind the header — palette
            cyan-blue keeps it calm next to the form fields below. */}
        <MeshWash variant="band" intensity="normal" palette="cyan-blue" />

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 14, gap: 10,
          position: "relative", zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              aria-hidden
              style={{
                flex: "0 0 auto",
                width: 32, height: 32,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                borderRadius: "10px 2px 10px 2px",
                background:
                  "linear-gradient(135deg," +
                  " var(--ox-deep, #0B0F14) 0%," +
                  " var(--electric-blue, var(--ox)) 45%," +
                  " var(--neon-cyan, #00D4FF) 100%)",
                color: "#fff",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), 0 2px 8px -2px rgba(0,212,255,.45)",
              }}
            >
              <Hospital size={16} aria-hidden />
            </span>
            <div>
              <div style={{
                fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 700,
                color: "var(--ink2)", letterSpacing: ".14em",
                textTransform: "uppercase",
              }}>
                Site overlays
              </div>
              <h2 style={{
                margin: 0,
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: 26,
                fontWeight: 500,
                color: "var(--ink)",
                letterSpacing: "-.01em",
                lineHeight: 1.1,
              }}>
                Antibiogram manager
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close antibiogram manager"
            className="rx-magnetic rx-shine-sweep rx-focus-halo"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 32, height: 32,
              color: "var(--ink2)",
              background: "rgba(0, 212, 255, 0.06)",
              border: "1px solid var(--neon-cyan-line, var(--ox-line))",
              borderRadius: 999, cursor: "pointer",
            }}>
            <X size={14} aria-hidden />
          </button>
        </div>

        {/* Gradient hairline under the header. */}
        <span
          aria-hidden="true"
          style={{
            display: "block",
            height: 1,
            background: HAIRLINE_BG,
            margin: "0 0 16px",
            position: "relative", zIndex: 1,
          }}
        />

        {/* Intro */}
        <p style={{
          margin: "0 0 14px", fontSize: 14, color: "var(--ink2)", lineHeight: 1.6,
          fontFamily: "var(--serif)", fontStyle: "italic",
          maxWidth: "62ch",
        }}>
          Your active antibiogram drives the local-resistance overlay on every syndrome page.
          Switch hospitals here when you cover a different site, or upload a CSV to add a new institution.
          Periods + provenance display alongside every %S — clinicians need to evaluate the number.
        </p>

        {/* Section · List */}
        <ManagerSection>
          <div style={{
            fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 700,
            color: "var(--ink2)", letterSpacing: ".14em",
            textTransform: "uppercase", marginBottom: 10,
          }}>
            Available antibiograms
          </div>
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
        </ManagerSection>

        {/* Inter-section divider before the upload form. */}
        <GradientHairline variant="cyan-blue" style={{ margin: "16px 0", opacity: 0.7 }} />

        <UploadPanel onSave={onSave} />
      </div>
    </Backdrop>
  );
}

export { AntibiogramManager };
