/* component · MonitoringBlock — Phase D2 structured monitoring
   content. Renders the "what to check" decision below the duration
   block in the Answer Canvas. Three severity tiers:

     - required  · red label "REQUIRED" — must-do, hard-stop if
                    missed (BCx q48h in SAB, AUC for vanco, TEE)
     - trigger   · amber label "TRIGGER" — conditional (PET-CT if
                    BCx > 72 h, CK weekly on dapto, MRI for back
                    pain in SAB)
     - consider  · muted label "CONSIDER" — optional escalation
                    (MRSA nares PCR, ophthalmology eval)

   The component renders nothing when the syndrome has no authored
   monitoring content — falls back gracefully on the existing UI
   (the regimen-content warn cards still cover drug-level monitoring
   like "CK weekly on dapto").

   Visual language matches DurationBlock and RegimenOptions for
   consistency: same **bold** parser, same severity color system.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { Activity } from "lucide-react";
import { Section } from "./Section.jsx";
import { matchesCtx } from "../engines/ctxMatch.js";
import { RichText } from "./util/richText.jsx";
import { severityStyle } from "./util/severityStyle.js";

/* Does this item match the current cross-section selection?
   Returns true when ANY of:
     - item.matchAgent regex matches ANY agent across all tiers' picks
       (Phase D3.1 multi-tier aggregation — pickedAgents is the union),
     - item.matchBranch[] includes the active duration branch label,
     - item.matchCtx declarative predicate evaluates true against the
       patient ctx (Phase D3.4 patient-state-aware elevation).
   Items with NONE of these tags are unconditionally relevant — they
   render at the default emphasis regardless of selection (which is
   the desired behavior: agnostic items are always shown). */
function itemMatchesSelection(item, pickedAgents, pickedBranch, ctx) {
  let matched = false;
  if(item.matchAgent && pickedAgents.some(a => item.matchAgent.test(a))) matched = true;
  if(item.matchBranch && pickedBranch && item.matchBranch.includes(pickedBranch)) matched = true;
  if(item.matchCtx && matchesCtx(item.matchCtx, ctx)) matched = true;
  return matched;
}

function MonitoringItem({ item, matched }) {
  const sty = severityStyle(item.sev || "consider");
  /* When matched, the item gets a left accent stripe + slightly
     deeper background tint + "MATCHES" chip so it leaps out of the
     list. We never HIDE the others — that would be unsafe — we
     just elevate the relevant ones. */
  return (
    <li style={{
      display:"grid",
      gridTemplateColumns: "auto 1fr",
      gap: 9,
      alignItems: "flex-start",
      padding: "7px 9px",
      background: sty.bg,
      border: "1px solid " + sty.line,
      borderLeft: "3px solid " + (matched ? sty.color : sty.line),
      borderRadius: 6,
      boxShadow: matched ? "inset 0 0 0 1px " + sty.line : "none",
      transition: "border-color .12s, box-shadow .12s",
    }}>
      {/* Severity badge — W10 · the required/trigger/consider tiers each
          get a neon light-ring leading the column so the severity ladder
          reads as three deliberate glow levels (red alert / amber
          escalation / cyan consider) on top of the existing icon-color
          channel. Layout untouched (still 12px icon + 8px mono label). */}
      <div style={{
        display:"flex", flexDirection:"column", alignItems:"center", gap:3,
        paddingTop: 1,
      }}>
        <span className={
          item.sev === "required" ? "rx-light-ring-red"
          : item.sev === "trigger" ? "rx-light-ring-amber"
          : "rx-light-ring-cyan"
        } aria-hidden style={{ width: 6, height: 6, borderWidth: 1.5, marginBottom: 1, opacity: 0.85 }} />
        <sty.Icon size={12} color={sty.color} aria-hidden />
        <span style={{
          fontFamily:"var(--mono)", fontSize:8, fontWeight:700,
          color: sty.color, letterSpacing:".06em", whiteSpace:"nowrap",
        }}>
          {sty.label}
        </span>
      </div>

      {/* What + why */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap: 8 }}>
          <div style={{ fontSize:11.5, lineHeight:1.5, color:"var(--ink)", fontWeight: matched ? 600 : 500, flex: 1 }}>
            <RichText text={item.what} accentColor={sty.color} accentBg={sty.bg !== "transparent" ? sty.bg : undefined} />
          </div>
          {matched && (
            <span style={{
              flex: "0 0 auto",
              fontFamily:"var(--mono)", fontSize:8, fontWeight:700,
              color:"#fff", background: sty.color,
              padding: "2px 5px", borderRadius: 3,
              letterSpacing:".06em", textTransform:"uppercase",
              whiteSpace:"nowrap",
            }}>Matches</span>
          )}
        </div>
        {item.why && (
          <div style={{ fontSize:10.5, lineHeight:1.5, color:"var(--ink2)", marginTop: 2 }}>
            <RichText text={item.why} accentColor={sty.color} />
          </div>
        )}
      </div>
    </li>
  );
}

function MonitoringBlock({ monitoring, pickedAgents = [], pickedBranch, ctx }) {
  if(!monitoring) return null;
  const { headline, items = [] } = monitoring;
  if(!headline && items.length === 0) return null;

  const accent = "var(--ox)";
  const accentBg = "rgba(15, 76, 129, 0.08)";

  // Group items by severity for visual layering, then within each
  // group surface matched items first (still visible but elevated).
  const decorated = items.map(i => ({ item: i, matched: itemMatchesSelection(i, pickedAgents, pickedBranch, ctx) }));
  const matchedCount = decorated.filter(d => d.matched).length;
  const bySeverity = (sev) => decorated
    .filter(d => (d.item.sev || "consider") === sev)
    .sort((a, b) => (b.matched ? 1 : 0) - (a.matched ? 1 : 0));
  const required = bySeverity("required");
  const trigger  = bySeverity("trigger");
  const consider = bySeverity("consider");

  /* Render through the shared Section so the kicker + box chrome
     match every other section on the page. The "N matches for
     selection" chip lives in the kicker row (right of the label)
     as the only section-level adornment. */
  return (
    <Section kicker="Monitoring · What to check" icon={Activity} glyph="core" testId="monitoring-block">
      {matchedCount > 0 && (
        <div style={{ marginBottom: headline || items.length ? 10 : 0, display:"flex", justifyContent:"flex-end" }}>
          <span style={{
            display:"inline-flex", alignItems:"center", gap:6,
            fontFamily:"var(--mono)", fontSize:9, letterSpacing:".08em",
            textTransform:"uppercase", fontWeight:600, color: accent,
            background: accentBg, padding:"2px 7px", borderRadius:4,
            border:"1px solid var(--ox-line)",
          }}>
            {/* Wave 10 — cyan light-ring announces "live filter is active"
                with the same neon-dot vocabulary the rest of the canvas
                uses for severity tier dots. Reduced-motion drops the ring's
                pulse; the dot stays visible. */}
            <span className="rx-light-ring-cyan" aria-hidden style={{ width: 8, height: 8 }} />
            {matchedCount} {matchedCount === 1 ? "match" : "matches"} for selection
          </span>
        </div>
      )}

      {/* Headline — Wave 10: rx-glass-bleed adds the inner cyan edge-light
          on the headline panel so the bottom-line monitoring directive
          carries the same frosted-glass register as the rest of the
          Wave 9 surfaces. The headline keeps its accent background; the
          bleed is additive (only the inner edge picks up the cyan glow). */}
      {headline && (
        <div className="rx-glass-bleed" style={{
          background: accentBg,
          border: "1px solid var(--ox-line)",
          borderRadius: 7,
          padding: "8px 11px",
          marginBottom: items.length ? 12 : 0,
        }}>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink)", fontWeight: 600, position: "relative", zIndex: 2 }}>
            <RichText text={headline} accentColor={accent} />
          </div>
        </div>
      )}

      {/* Items grouped by severity. Within each severity bucket, matched
          items float to the top (still visible alongside the rest — never
          hidden). The "MATCHES" chip on a matched row, plus the elevated
          left-border accent, makes the relevant items leap out. */}
      {items.length > 0 && (
        <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:5 }}>
          {required.map((d, i) => <MonitoringItem key={"r"+i} item={d.item} matched={d.matched} />)}
          {trigger .map((d, i) => <MonitoringItem key={"t"+i} item={d.item} matched={d.matched} />)}
          {consider.map((d, i) => <MonitoringItem key={"c"+i} item={d.item} matched={d.matched} />)}
        </ul>
      )}
    </Section>
  );
}

export { MonitoringBlock };
