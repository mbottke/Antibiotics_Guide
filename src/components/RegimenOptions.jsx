/* component · RegimenOptions — Phase D1.5 multi-option presentation
   with per-card decision content. Each card carries:
     * route badge + drug fragment + selection state
     * a one-line "Pick if" verdict — the 5-second elevator pitch
     * "Why pick" bullets (strengths, with **bold** killer facts)
     * "Watch out" bullets with severity icons (stop / warn / note)
     * per-card dose-adjustment chips (renal / hepatic / synergy)
       computed against THIS option only, so selecting nitrofurantoin
       doesn't surface fosfomycin's renal banding.

   The card layout is bulleted/scannable rather than paragraph-style:
   three cards side-by-side at 1100px width have to function as a
   comparison table, and bullets compress the same factual density
   into 30% less vertical space while making the deltas between
   options visually instant.

   Selection emits via onSelectionChange so the wider Answer Canvas
   can narrow downstream sections (e.g. duration block, refinements)
   to the picked drug.

   Bold callout parsing: any `**text**` in pickIf / whyPick bullets
   / watchOut bullets renders as an accented span (orange for whyPick
   / pickIf, the severity color for watchOut). One pass, regex-driven,
   no markdown library — the content layer is plain JS strings.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState, useMemo, useEffect } from "react";
import { AlertTriangle, Check, Info, Pill, Syringe, XCircle, Zap } from "lucide-react";
import { splitRegimenOptions } from "../engines/regimenOptions.js";
import { lookupOptionContent } from "../data/regimenContent.js";
import { doseAdjustments } from "../engines/dosing.js";

/* Bold-callout parser. Splits a string on **…** segments and returns
   an array of { text, bold } chunks. The renderer wraps bold chunks
   in an accented span keyed to the calling context. */
function parseBold(text) {
  if(!text) return [];
  const parts = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0, m;
  while((m = re.exec(text)) !== null) {
    if(m.index > last) parts.push({ text: text.slice(last, m.index), bold: false });
    parts.push({ text: m[1], bold: true });
    last = m.index + m[0].length;
  }
  if(last < text.length) parts.push({ text: text.slice(last), bold: false });
  return parts;
}

function RichText({ text, accentColor, accentBg }) {
  return (
    <>
      {parseBold(text).map((p, i) => p.bold ? (
        <span key={i} style={{
          fontWeight: 700,
          color: accentColor,
          background: accentBg || "transparent",
          padding: accentBg ? "0 3px" : 0,
          borderRadius: accentBg ? 3 : 0,
        }}>{p.text}</span>
      ) : <span key={i}>{p.text}</span>)}
    </>
  );
}

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

/* Severity-specific bullet icon + color for watchOut entries. */
function severityStyle(sev) {
  if(sev === "stop") return {
    Icon: XCircle,
    color: "#b91c1c",
    bg: "rgba(185, 28, 28, 0.08)",
    line: "rgba(185, 28, 28, 0.25)",
  };
  if(sev === "warn") return {
    Icon: AlertTriangle,
    color: "var(--amber)",
    bg: "var(--amber-soft)",
    line: "var(--amber-line)",
  };
  return {  // note
    Icon: Info,
    color: "var(--ink2)",
    bg: "transparent",
    line: "transparent",
  };
}

/* Decision content block — bullets + severity icons. Replaces the
   prior paragraph-style layout. Renders nothing if the option has no
   authored content (the card then shows just the drug fragment +
   route + dose chips). */
function DecisionContent({ content, accent }) {
  if(!content) return null;
  const hasAny = content.pickIf || content.whyPick?.length || content.watchOut?.length;
  if(!hasAny) return null;
  const accentColor = accent === "add" ? "var(--amber)" : "var(--ox)";
  const accentBg    = accent === "add" ? "rgba(217, 119, 6, 0.10)" : "rgba(15, 76, 129, 0.08)";

  return (
    <div style={{ marginTop: 9, display:"grid", gap:9 }}>
      {/* Pick-if verdict — the 5-second elevator pitch */}
      {content.pickIf && (
        <div style={{
          fontSize:11.5, lineHeight:1.45, color:"var(--ink)",
          fontStyle:"italic", fontWeight:500,
          background: accent === "add" ? "var(--amber-soft)" : "var(--ox-soft)",
          border: "1px solid " + (accent === "add" ? "var(--amber-line)" : "var(--ox-line)"),
          borderRadius: 6, padding: "5px 8px",
          display:"flex", alignItems:"flex-start", gap:6,
        }}>
          <Zap size={11} aria-hidden style={{ color: accentColor, flexShrink: 0, marginTop: 2 }} />
          <span><span style={{
            fontFamily:"var(--mono)", fontStyle:"normal", fontWeight:700,
            fontSize:9, letterSpacing:".1em", textTransform:"uppercase",
            color: accentColor, marginRight: 5,
          }}>Pick if</span>
          <RichText text={content.pickIf} accentColor={accentColor} /></span>
        </div>
      )}

      {/* Why-pick bullets — strengths */}
      {content.whyPick?.length > 0 && (
        <div>
          <div style={{
            fontFamily:"var(--mono)", fontSize:9, letterSpacing:".1em",
            textTransform:"uppercase", fontWeight:700,
            color: accentColor, marginBottom: 4,
          }}>Why pick</div>
          <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:3 }}>
            {content.whyPick.map((b, i) => (
              <li key={i} style={{
                display:"flex", alignItems:"flex-start", gap:6,
                fontSize:11.5, lineHeight:1.45, color:"var(--ink2)",
              }}>
                <span aria-hidden style={{
                  flexShrink: 0, marginTop: 6,
                  width: 4, height: 4, borderRadius: "50%",
                  background: accentColor,
                }} />
                <span><RichText text={b} accentColor={accentColor} accentBg={accentBg} /></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Watch-out bullets — cautions with severity icons */}
      {content.watchOut?.length > 0 && (
        <div>
          <div style={{
            fontFamily:"var(--mono)", fontSize:9, letterSpacing:".1em",
            textTransform:"uppercase", fontWeight:700,
            color:"var(--amber)", marginBottom: 4,
          }}>Watch out</div>
          <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:3 }}>
            {content.watchOut.map((b, i) => {
              const sty = severityStyle(b.sev || "note");
              return (
                <li key={i} style={{
                  display:"flex", alignItems:"flex-start", gap:6,
                  fontSize:11.5, lineHeight:1.45, color:"var(--ink2)",
                }}>
                  <sty.Icon size={11} aria-hidden style={{ color: sty.color, flexShrink: 0, marginTop: 3 }} />
                  <span><RichText text={b.text} accentColor={sty.color} accentBg={sty.bg !== "transparent" ? sty.bg : undefined} /></span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/* Per-card dose-adjustment chips. Computed against the OPTION text,
   not the whole tier — selecting one card narrows renal / hepatic /
   synergy adjustments to that drug. */
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

/* Title-case the first ASCII letter of an option's text. The splitter
   produces "fosfomycin 3 g PO × 1" for the second/third entries in a
   tier (it just slices after the comma+or), so card titles otherwise
   render with a lowercase leading drug-name letter. Skips non-ASCII
   leads (Greek β, etc.) so "β-lactam..." stays as authored. */
function titleCaseFirst(s) {
  if(!s) return s;
  const c = s.charAt(0);
  if(c >= "a" && c <= "z") return c.toUpperCase() + s.slice(1);
  return s;
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
        {renderText ? renderText(titleCaseFirst(option.text)) : titleCaseFirst(option.text)}
      </div>
      <DecisionContent content={content} accent={accent} />
      <PerOptionDoseChips optionText={option.text} ctx={ctx} d={d} synId={synId} />
    </button>
  );
}

function RegimenOptions({ rx, accent = "core", renderText, synId, tierLabel, ctx, d, onSelectionChange }) {
  const options = useMemo(() => splitRegimenOptions(rx), [rx]);
  const [pickedIdx, setPickedIdx] = useState(0);

  useEffect(() => { setPickedIdx(0); }, [rx]);

  useEffect(() => {
    if(!onSelectionChange) return;
    const active = options[pickedIdx];
    onSelectionChange(active ? active.text : null);
  }, [pickedIdx, options, onSelectionChange]);

  const contentFor = (text) => lookupOptionContent(synId, tierLabel, text);

  if(options.length === 0) return null;

  // 1 option → single card; 2 → side-by-side; 3+ → auto-fit grid.
  // Bedside mobile (.rx-bedside) collapses to one column via the
  // existing media query. The minmax floor is generous enough that
  // bulleted content doesn't reflow into illegible columns.
  const cols = options.length === 1 ? "1fr"
             : options.length === 2 ? "repeat(2, 1fr)"
             : options.length === 3 ? "repeat(auto-fit, minmax(240px, 1fr))"
             :                        "repeat(auto-fit, minmax(220px, 1fr))";

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
