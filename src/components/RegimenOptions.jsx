/* component · RegimenOptions — Phase D1 multi-option presentation.
   Replaces the single inline rx prose line inside the Answer Canvas
   with a grid of discrete option cards, one per alternate parsed by
   engines/regimenOptions.splitRegimenOptions. The cards stand side-by-
   side so a clinician can read all options at a glance and pick the
   one that matches the patient — the snapshot-consult workflow.

   Design notes:
   * If the splitter returns one option, render a single card so the
     visual language is consistent (no special "single-option" mode).
   * The tier header (Core/Add badge, tier name, "added because" tag)
     and the tier note live OUTSIDE this component — RegimenOptions
     just renders the option cards. The Answer Canvas keeps its
     existing header logic in RxLine.
   * Each card shows the drug+dose fragment, a route badge (IV/PO/IM),
     and a "Selected" affordance. The first option is selected on
     mount; clicking another card highlights it. Selection is purely
     visual for now — it does not mutate the composed answer. Phase D2
     wires per-option drill-into-Reference.
   * The inline footnote markers (from refineRegimen) are rendered via
     the same renderRichWithFootnotes call the legacy line used, so
     allergy / redundancy / nephrotoxicity footnotes still appear
     attached to the drug they describe — inside whichever card carries
     that drug.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState, useMemo } from "react";
import { Pill, Syringe, Check } from "lucide-react";
import { splitRegimenOptions } from "../engines/regimenOptions.js";

function RouteBadge({ route }) {
  if(!route) return null;
  const parts = route.split(",");
  return (
    <span style={{ display:"inline-flex", gap:4 }}>
      {parts.map((r, i) => {
        const Icon = r === "iv" ? Syringe : Pill;
        return (
          <span key={i} title={"Route: " + r.toUpperCase()} style={{
            display:"inline-flex", alignItems:"center", gap:3,
            fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".06em",
            textTransform:"uppercase", fontWeight:700,
            color: r === "iv" ? "var(--ox)" : "var(--ink2)",
            background: r === "iv" ? "var(--ox-soft)" : "var(--paper2)",
            border:"1px solid " + (r === "iv" ? "var(--ox-line)" : "var(--line)"),
            borderRadius:4, padding:"1px 5px",
          }}>
            <Icon size={9} aria-hidden /> {r}
          </span>
        );
      })}
    </span>
  );
}

function OptionCard({ option, selected, primary, onSelect, renderText, accent }) {
  const accentColor = accent === "add" ? "var(--amber)" : "var(--ox)";
  const accentSoft  = accent === "add" ? "var(--amber-soft)" : "var(--ox-soft)";
  const accentLine  = accent === "add" ? "var(--amber-line)" : "var(--ox-line)";
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      style={{
        textAlign:"left",
        background: selected ? accentSoft : "var(--panel)",
        border: "1px solid " + (selected ? accentLine : "var(--line)"),
        borderRadius:10,
        padding:"11px 12px 10px",
        cursor:"pointer",
        position:"relative",
        transition:"background .12s, border-color .12s, transform .08s",
        boxShadow: selected ? "inset 0 0 0 1px " + accentLine : "none",
        opacity: selected ? 1 : 0.92,
      }}>
      {primary && (
        <div style={{
          position:"absolute", top:-8, left:10,
          fontFamily:"var(--mono)", fontSize:9, letterSpacing:".1em",
          textTransform:"uppercase", fontWeight:700, color:"#fff",
          background: accentColor, borderRadius:4, padding:"1px 6px",
        }}>Recommended</div>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, marginBottom: 4 }}>
        <RouteBadge route={option.route} />
        {selected && (
          <span style={{
            display:"inline-flex", alignItems:"center", gap:3,
            fontFamily:"var(--mono)", fontSize:9, letterSpacing:".06em",
            textTransform:"uppercase", fontWeight:700, color: accentColor,
          }}>
            <Check size={10} aria-hidden /> Selected
          </span>
        )}
      </div>
      <div style={{ fontSize:13.5, lineHeight:1.5, color:"var(--ink)", fontWeight: selected ? 600 : 500 }}>
        {renderText ? renderText(option.text) : option.text}
      </div>
    </button>
  );
}

function RegimenOptions({ rx, accent = "core", renderText }) {
  const options = useMemo(() => splitRegimenOptions(rx), [rx]);
  const [pickedIdx, setPickedIdx] = useState(0);

  if(options.length === 0) return null;
  if(options.length === 1){
    return (
      <div data-testid="regimen-options" style={{ display:"grid", gap:0 }}>
        <OptionCard option={options[0]} selected primary accent={accent}
          onSelect={() => {}} renderText={renderText} />
      </div>
    );
  }

  // Multi-option grid. On mobile (≤640 px the .rx-bedside media query
  // already collapses paddings), the auto-fill column count drops to 1.
  const cols = options.length === 2 ? "repeat(2, 1fr)"
             : options.length === 3 ? "repeat(auto-fit, minmax(180px, 1fr))"
             :                        "repeat(auto-fit, minmax(170px, 1fr))";
  return (
    <div
      role="radiogroup"
      aria-label="Regimen options"
      data-testid="regimen-options"
      style={{
        display:"grid",
        gap:9,
        gridTemplateColumns: cols,
        marginTop: 4,
      }}>
      {options.map((opt, i) => (
        <OptionCard key={i}
          option={opt}
          selected={i === pickedIdx}
          primary={i === 0}
          accent={accent}
          onSelect={() => setPickedIdx(i)}
          renderText={renderText} />
      ))}
    </div>
  );
}

export { RegimenOptions };
