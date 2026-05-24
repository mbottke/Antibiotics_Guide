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

function MonitoringItem({ item }) {
  const sty = severityStyle(item.sev || "consider");
  return (
    <li style={{
      display:"grid",
      gridTemplateColumns: "auto 1fr",
      gap: 9,
      alignItems: "flex-start",
      padding: "7px 9px",
      background: sty.bg,
      border: "1px solid " + sty.line,
      borderRadius: 6,
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
        <div style={{ fontSize:11.5, lineHeight:1.5, color:"var(--ink)", fontWeight: 500 }}>
          <RichText text={item.what} accentColor={sty.color} accentBg={sty.bg !== "transparent" ? sty.bg : undefined} />
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

function MonitoringBlock({ monitoring }) {
  if(!monitoring) return null;
  const { headline, items = [] } = monitoring;
  if(!headline && items.length === 0) return null;

  const accent = "var(--ox)";
  const accentBg = "rgba(15, 76, 129, 0.08)";

  // Group items by severity for visual layering
  const required = items.filter(i => i.sev === "required");
  const trigger  = items.filter(i => i.sev === "trigger");
  const consider = items.filter(i => i.sev === "consider");

  return (
    <section
      data-testid="monitoring-block"
      style={{
        background:"var(--panel)",
        border:"1px solid var(--line)",
        borderRadius:10,
        padding:"14px 16px",
        marginTop: 12,
      }}>
      {/* Title strip */}
      <div style={{
        display:"flex", alignItems:"center", gap:7, marginBottom:10,
        paddingBottom:8, borderBottom:"1px solid var(--line)",
      }}>
        <Activity size={14} color={accent} aria-hidden />
        <span style={{
          fontFamily:"var(--mono)", fontSize:10.5, letterSpacing:".12em",
          textTransform:"uppercase", fontWeight:700, color:"var(--ink)",
        }}>Monitoring · What to check</span>
      </div>

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

      {/* Items grouped by severity */}
      {items.length > 0 && (
        <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:5 }}>
          {required.map((it, i) => <MonitoringItem key={"r"+i} item={it} />)}
          {trigger .map((it, i) => <MonitoringItem key={"t"+i} item={it} />)}
          {consider.map((it, i) => <MonitoringItem key={"c"+i} item={it} />)}
        </ul>
      )}
    </section>
  );
}

export { MonitoringBlock };
