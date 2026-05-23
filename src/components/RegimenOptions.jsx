/* component · RegimenOptions — Phase D1.5 multi-option presentation with
   per-card decision content. Each card carries the drug fragment, route
   badge, the apex-quality "Why pick" + "Watch out" content from
   data/regimenContent.js, and any patient-specific dose adjustments
   computed against the selected drug. Selecting a different card
   re-renders all of those — selection is a meaningful clinical action,
   not a visual placebo.

   Design notes:
   * The tier header (Core/Add badge, tier name, "added because" tag)
     and the tier note still live OUTSIDE this component — RegimenOptions
     just renders the option cards plus any per-option content.
   * Each card shows: route badge, drug+dose fragment, the why-pick /
     watch-out micro-content (when authored), the per-option renal /
     hepatic / synergy dose-adjustment chips (filtered to the drugs in
     this option), and a "Selected" affordance.
   * The first option is selected on mount; clicking another card
     re-narrows the surrounding canvas via the `onSelectionChange`
     callback. AnswerCanvas hooks this to narrow its "Dosing for this
     patient" section to the selected drug only.
   * Inline footnote markers from refineRegimen ride through the
     renderText prop; the card-level micro-content is plain prose so it
     stays out of the nested-interactive a11y trap.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState, useMemo, useEffect } from "react";
import { AlertTriangle, Check, Lightbulb, Pill, Syringe } from "lucide-react";
import { splitRegimenOptions } from "../engines/regimenOptions.js";
import { lookupOptionContent } from "../data/regimenContent.js";
import { doseAdjustments } from "../engines/dosing.js";

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

/* Decision content block — the apex-quality micro-content. Lives inside
   each card and only renders when content is authored for this option.
   Layout: vertical stack of two labeled paragraphs. Color-coded so the
   "why pick" reads as a positive cue (orange/Oxford) and the "watch
   out" reads as a hard caution (amber/red-leaning). Compact spacing so
   three cards fit a desktop row at 1100px without truncation. */
function DecisionContent({ content, accent }) {
  if(!content || (!content.whyPick && !content.watchOut)) return null;
  const accentColor = accent === "add" ? "var(--amber)" : "var(--ox)";
  return (
    <div style={{ marginTop: 9, display:"grid", gap:7 }}>
      {content.whyPick && (
        <div>
          <div style={{
            fontFamily:"var(--mono)", fontSize:9, letterSpacing:".1em",
            textTransform:"uppercase", fontWeight:700,
            color: accentColor, marginBottom:3,
            display:"inline-flex", alignItems:"center", gap:4,
          }}>
            <Lightbulb size={10} aria-hidden /> Why pick
          </div>
          <div style={{ fontSize:11.5, lineHeight:1.5, color:"var(--ink2)", fontWeight:400 }}>
            {content.whyPick}
          </div>
        </div>
      )}
      {content.watchOut && (
        <div>
          <div style={{
            fontFamily:"var(--mono)", fontSize:9, letterSpacing:".1em",
            textTransform:"uppercase", fontWeight:700,
            color:"var(--amber)", marginBottom:3,
            display:"inline-flex", alignItems:"center", gap:4,
          }}>
            <AlertTriangle size={10} aria-hidden /> Watch out
          </div>
          <div style={{ fontSize:11.5, lineHeight:1.5, color:"var(--ink2)", fontWeight:400 }}>
            {content.watchOut}
          </div>
        </div>
      )}
    </div>
  );
}

/* Per-card dose-adjustment chips. Computed against the OPTION text, not
   the whole tier — so when the clinician picks one card the renal /
   hepatic / synergy adjustments narrow to that drug. Returns null when
   no adjustments apply or no patient context is on. Chip shape matches
   the legacy tier-level chips (kind kicker + agent + arrow + value)
   so the visual language stays consistent. */
function PerOptionDoseChips({ optionText, ctx, d, synId }) {
  if(!ctx || !ctx.on) return null;
  const adj = doseAdjustments(optionText, ctx, d, synId);
  if(!adj.length) return null;
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop: 9 }}>
      {adj.map((a, i) => (
        <span key={i} style={{
          display:"inline-flex", alignItems:"center", gap:4,
          fontSize:10.5, fontWeight:500, padding:"3px 7px", borderRadius:5,
          background:"var(--decision-adjusted-bg)", color:"var(--decision-adjusted)",
          border:"1px solid var(--decision-adjusted-line)",
          fontFamily:"var(--mono)", letterSpacing:".01em",
        }}>
          <span style={{ opacity:.75, fontSize:9, letterSpacing:".08em", textTransform:"uppercase" }}>
            {a.kind === "renal" ? "renal" : a.kind === "weight" ? "weight" : a.kind === "hepatic" ? "hepatic" : a.kind === "hd" ? "HD" : a.kind}
          </span>
          <span style={{ fontWeight:600, color:"var(--ink)" }}>{(a.agent || "").split(" / ")[0].replace(/\s*\(IV\)/i, "")}</span>
          <span style={{ opacity:.6 }}>→</span>
          <span style={{ fontWeight:600 }}>{a.value}</span>
        </span>
      ))}
    </div>
  );
}

function OptionCard({ option, selected, primary, onSelect, renderText, accent, content, ctx, d, synId }) {
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
        padding:"11px 12px 12px",
        cursor:"pointer",
        position:"relative",
        transition:"background .12s, border-color .12s, transform .08s",
        boxShadow: selected ? "inset 0 0 0 1px " + accentLine : "none",
        opacity: selected ? 1 : 0.94,
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
      <DecisionContent content={content} accent={accent} />
      <PerOptionDoseChips optionText={option.text} ctx={ctx} d={d} synId={synId} />
    </button>
  );
}

function RegimenOptions({ rx, accent = "core", renderText, synId, tierLabel, ctx, d, onSelectionChange }) {
  const options = useMemo(() => splitRegimenOptions(rx), [rx]);
  const [pickedIdx, setPickedIdx] = useState(0);

  // Reset selection when the rx text changes (a new tier or syndrome).
  useEffect(() => { setPickedIdx(0); }, [rx]);

  // Broadcast the active option to the parent so the wider canvas (e.g.
  // "Dosing for this patient") can narrow to the selected drug.
  useEffect(() => {
    if(!onSelectionChange) return;
    const active = options[pickedIdx];
    onSelectionChange(active ? active.text : null);
  }, [pickedIdx, options, onSelectionChange]);

  const contentFor = (text) => lookupOptionContent(synId, tierLabel, text);

  if(options.length === 0) return null;

  // Layout: 1 option → single card; 2 → side-by-side; 3+ → auto-fit grid.
  // On the bedside mobile breakpoint (.rx-bedside) the grid collapses to a
  // single column automatically via the existing media query.
  const cols = options.length === 1 ? "1fr"
             : options.length === 2 ? "repeat(2, 1fr)"
             : options.length === 3 ? "repeat(auto-fit, minmax(220px, 1fr))"
             :                        "repeat(auto-fit, minmax(200px, 1fr))";

  return (
    <div
      role={options.length > 1 ? "radiogroup" : undefined}
      aria-label={options.length > 1 ? "Regimen options" : undefined}
      data-testid="regimen-options"
      style={{
        display:"grid",
        gap:11,
        gridTemplateColumns: cols,
        marginTop: 4,
      }}>
      {options.map((opt, i) => (
        <OptionCard key={i}
          option={opt}
          selected={i === pickedIdx}
          primary={options.length > 1 && i === 0}
          accent={accent}
          onSelect={() => setPickedIdx(i)}
          renderText={renderText}
          content={contentFor(opt.text)}
          ctx={ctx}
          d={d}
          synId={synId} />
      ))}
    </div>
  );
}

export { RegimenOptions };
