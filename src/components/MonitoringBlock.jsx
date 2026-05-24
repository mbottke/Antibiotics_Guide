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
import { Activity, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Section } from "./Section.jsx";

/* Bold-callout parser. Shared shape with RegimenOptions / DurationBlock. */
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

/* Severity → visual style. Mirrors RegimenOptions' watchOut palette
   so the entire app speaks one severity vocabulary. */
function severityStyle(sev) {
  if(sev === "required") return {
    Icon: CheckCircle2,
    label: "REQUIRED",
    color: "#b91c1c",
    bg: "rgba(185, 28, 28, 0.08)",
    line: "rgba(185, 28, 28, 0.25)",
  };
  if(sev === "trigger") return {
    Icon: AlertTriangle,
    label: "TRIGGER",
    color: "var(--amber)",
    bg: "var(--amber-soft)",
    line: "var(--amber-line)",
  };
  return {
    Icon: Info,
    label: "CONSIDER",
    color: "var(--ink2)",
    bg: "var(--paper2)",
    line: "var(--line)",
  };
}

/* Does this item match the current cross-section selection?
   Returns true when:
     - item.matchAgent regex matches the picked agent, OR
     - item.matchBranch[] includes the picked branch label
   Items with NEITHER tag are agent/branch-agnostic and never count
   as "matched" — they render at the default emphasis regardless of
   selection (which is the desired behavior: agent-agnostic items
   are always relevant). */
function itemMatchesSelection(item, pickedAgent, pickedBranch) {
  let matched = false;
  if(item.matchAgent && pickedAgent && item.matchAgent.test(pickedAgent)) matched = true;
  if(item.matchBranch && pickedBranch && item.matchBranch.includes(pickedBranch)) matched = true;
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
      {/* Severity badge */}
      <div style={{
        display:"flex", flexDirection:"column", alignItems:"center", gap:3,
        paddingTop: 1,
      }}>
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

function MonitoringBlock({ monitoring, pickedAgent, pickedBranch }) {
  if(!monitoring) return null;
  const { headline, items = [] } = monitoring;
  if(!headline && items.length === 0) return null;

  const accent = "var(--ox)";
  const accentBg = "rgba(15, 76, 129, 0.08)";

  // Group items by severity for visual layering, then within each
  // group surface matched items first (still visible but elevated).
  const decorated = items.map(i => ({ item: i, matched: itemMatchesSelection(i, pickedAgent, pickedBranch) }));
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
    <Section kicker="Monitoring · What to check" icon={Activity} testId="monitoring-block">
      {matchedCount > 0 && (
        <div style={{ marginBottom: headline || items.length ? 10 : 0, display:"flex", justifyContent:"flex-end" }}>
          <span style={{
            display:"inline-flex", alignItems:"center", gap:5,
            fontFamily:"var(--mono)", fontSize:9, letterSpacing:".08em",
            textTransform:"uppercase", fontWeight:600, color: accent,
            background: accentBg, padding:"2px 7px", borderRadius:4,
            border:"1px solid var(--ox-line)",
          }}>
            {matchedCount} {matchedCount === 1 ? "match" : "matches"} for selection
          </span>
        </div>
      )}

      {/* Headline */}
      {headline && (
        <div style={{
          background: accentBg,
          border: "1px solid var(--ox-line)",
          borderRadius: 7,
          padding: "8px 11px",
          marginBottom: items.length ? 12 : 0,
        }}>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink)", fontWeight: 600 }}>
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
