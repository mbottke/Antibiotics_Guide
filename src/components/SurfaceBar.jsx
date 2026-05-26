/* component · SurfaceBar — Phase C top-level navigation reframe.
   Wave 8 W8 chrome pass — frosted strip background, asymmetric chip
   corners (matching the SectionNav rail below), cyan-gradient active
   state with neon glow, and a hairline gradient bottom border so the
   bar feels like part of one continuous chrome system.

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

/* W8 chrome — the same gradient used everywhere on active surfaces. */
const ACTIVE_BG =
  "linear-gradient(135deg," +
  " var(--ox-deep, #0B0F14) 0%," +
  " var(--ox, #1F2937) 50%," +
  " var(--neon-cyan, #00D4FF) 240%)";

/* Hairline cyan gradient — a 1px bottom border at low alpha. Provides
   the same visual cue as a frosted-glass header without dominating
   the eye. */
const HAIRLINE_BG =
  "linear-gradient(90deg," +
  " transparent 0%," +
  " rgba(0, 212, 255, 0.45) 18%," +
  " rgba(61, 122, 255, 0.45) 50%," +
  " rgba(255, 61, 188, 0.30) 82%," +
  " transparent 100%)";

function _btn({ active, disabled, showSoon, label, hint, Icon, onClick, leading }){
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-disabled={disabled || undefined}
      title={hint}
      className={"rx-magnetic rx-shine-sweep" + (disabled ? "" : " rx-ripple")}
      style={{
        display:"inline-flex", alignItems:"center", gap:6,
        fontFamily:"var(--sans)", fontSize:12.5, fontWeight: active ? 700 : 500,
        color: active ? "#fff" : disabled ? "var(--faint)" : "var(--ink2)",
        background: active ? ACTIVE_BG : "var(--paper)",
        border:"1px solid " + (active ? "var(--neon-cyan, var(--ox-deep))" : "var(--line)"),
        /* Asymmetric: leading chip has soft-left/sharp-right; trailing
            chip mirrors. Matches the W8 chrome 8/3 vocabulary. */
        borderRadius: leading ? "10px 3px 3px 10px" : "3px 10px 10px 3px",
        padding:"7px 14px",
        cursor: disabled ? "not-allowed" : "pointer",
        marginLeft: leading ? 0 : -1,
        whiteSpace:"nowrap",
        boxShadow: active
          ? "0 6px 18px -4px rgba(0, 212, 255, 0.50), 0 1px 0 rgba(255,255,255,.10) inset"
          : "none",
        transition:"background var(--duration-base, .18s) var(--ease-out, ease), color var(--duration-base, .18s) var(--ease-out, ease), border-color var(--duration-base, .18s) var(--ease-out, ease), box-shadow var(--duration-base, .18s) var(--ease-out, ease), transform var(--duration-base, .18s) var(--ease-out, ease)",
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
        /* Frosted strip — soft white wash with cyan tint and a slight
            blur. The hairline below is painted as a separate absolute
            element so it can carry the gradient. */
        background:"rgba(250, 250, 252, 0.86)",
        backdropFilter: "saturate(180%) blur(14px)",
        WebkitBackdropFilter: "saturate(180%) blur(14px)",
        borderBottom: "1px solid transparent",
        position: "relative",
      }}>
      <div style={{
        maxWidth:1180, margin:"0 auto",
        padding:"8px 22px",
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
      {/* 1px gradient hairline along the bottom edge — provides the
          chrome system's cyan accent without a full border. */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0, right: 0, bottom: 0,
          height: 1,
          background: HAIRLINE_BG,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export { SurfaceBar };
