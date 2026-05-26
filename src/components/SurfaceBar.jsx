/* component · SurfaceBar — Phase C top-level navigation reframe.
   The two-axis primary nav for the antibiotic guide. Sits above every
   other surface so the clinical context (inpatient vs outpatient) and
   the view (reference textbook vs the decide-mode workflow) are always
   one click away. Outpatient is a placeholder for a planned build-out
   and is rendered disabled with a tooltip until that surface ships.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { BookOpen, Crosshair, Hospital, Stethoscope } from "lucide-react";

const SURFACES = [
  // `placeholder` flags a surface that is clickable but only displays a roadmap
  // shell — users can browse to it, but no clinical content lives there yet.
  { id: "inpatient",  label: "Inpatient",  icon: Hospital,    placeholder: false, hint: "Adult hospital medicine — fully built out" },
  { id: "outpatient", label: "Outpatient", icon: Stethoscope, placeholder: true,  hint: "Outpatient guidance — roadmap placeholder; clinical content coming in a future release" },
];

const MODES = [
  { id: "reference", label: "Reference", icon: BookOpen,   hint: "The full 11-tab reference: spectrum, formulary, penetration, mechanisms, dosing, course, safety" },
  { id: "decide",    label: "Decide",    icon: Crosshair,  hint: "Snapshot consult: describe the patient, see multiple regimen options side-by-side with patient-specific refinements" },
];

function _btn({ active, disabled, showSoon, label, hint, Icon, onClick, leading }){
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-disabled={disabled || undefined}
      title={hint}
      style={{
        display:"inline-flex", alignItems:"center", gap:6,
        fontFamily:"var(--sans)", fontSize:12.5, fontWeight: active ? 700 : 500,
        color: active ? "#fff" : disabled ? "var(--faint)" : "var(--ink2)",
        background: active ? "linear-gradient(135deg, var(--ox-deep) 0%, var(--ox) 70%, var(--ox-bright) 240%)" : "transparent",
        border:"1px solid " + (active ? "var(--ox)" : "var(--line)"),
        borderRadius: leading ? "10px 3px 3px 10px" : "3px 10px 10px 3px",
        padding:"6px 12px",
        cursor: disabled ? "not-allowed" : "pointer",
        marginLeft: leading ? 0 : -1,
        whiteSpace:"nowrap",
        boxShadow: active ? "0 4px 14px -4px var(--ox-bright), inset 0 1px 0 rgba(255,255,255,.08)" : "none",
        transition:"background .18s, color .18s, border-color .18s, box-shadow .18s, transform .18s",
      }}>
      <Icon size={13} aria-hidden /> {label}
      {showSoon && <span style={{
        fontFamily:"var(--mono)", fontSize:9, letterSpacing:".06em",
        textTransform:"uppercase",
        color: active ? "#fff" : "var(--muted)",
        background: active ? "rgba(255,255,255,.15)" : "var(--line2)",
        border:"1px solid " + (active ? "rgba(255,255,255,.25)" : "var(--line)"),
        borderRadius:4, padding:"1px 4px", marginLeft:2,
      }}>Soon</span>}
    </button>
  );
}

function SurfaceBar({ surface, mode, onSurface, onMode }) {
  return (
    <div
      role="region"
      aria-label="Surface and mode"
      data-testid="surface-bar"
      style={{
        background:"var(--paper2)",
        borderBottom:"1px solid var(--line)",
      }}>
      <div style={{
        maxWidth:1180, margin:"0 auto",
        padding:"7px 22px",
        display:"flex", alignItems:"center", justifyContent:"space-between", gap:14,
        flexWrap:"wrap",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{
            fontFamily:"var(--mono)", fontSize:10, letterSpacing:".14em",
            textTransform:"uppercase", color:"var(--muted)", fontWeight:600,
          }}>Setting</span>
          <div style={{ display:"flex" }}>
            {SURFACES.map((s, i) => _btn({
              active: surface === s.id,
              disabled: false,
              showSoon: s.placeholder,
              label: s.label, hint: s.hint, Icon: s.icon,
              onClick: () => onSurface && onSurface(s.id),
              leading: i === 0,
            }))}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{
            fontFamily:"var(--mono)", fontSize:10, letterSpacing:".14em",
            textTransform:"uppercase", color:"var(--muted)", fontWeight:600,
          }}>View</span>
          <div style={{ display:"flex" }}>
            {MODES.map((m, i) => _btn({
              active: mode === m.id,
              disabled: surface === "outpatient",
              label: m.label, hint: m.hint, Icon: m.icon,
              onClick: () => onMode && onMode(m.id),
              leading: i === 0,
            }))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { SurfaceBar };
