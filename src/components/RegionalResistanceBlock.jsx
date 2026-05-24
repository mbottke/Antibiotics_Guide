/* component · RegionalResistanceBlock — Phase H regional antibiogram
   overlay. Surfaces resistance patterns that materially change the
   empiric strategy for the current syndrome.

   Three severity tiers (mirrors WatchOut + Monitoring vocabulary):
     - high     · red — resistance > 50% or mortality consequences
     - moderate · amber — antibiogram-driven; institutional variation
     - watch    · muted — emerging; track but don't yet change empiric

   The component renders nothing when no patterns apply to the
   syndrome. Optional layer; no breaking change for syndromes
   without resistance overlays.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { Globe, AlertTriangle, AlertCircle, Eye } from "lucide-react";
import { Section } from "./Section.jsx";

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

function RichText({ text, accentColor }) {
  return (
    <>
      {parseBold(text).map((p, i) => p.bold ? (
        <span key={i} style={{ fontWeight: 700, color: accentColor }}>{p.text}</span>
      ) : <span key={i}>{p.text}</span>)}
    </>
  );
}

function severityStyle(sev) {
  if(sev === "high") return {
    Icon: AlertTriangle,
    label: "HIGH",
    color: "#b91c1c",
    bg: "rgba(185, 28, 28, 0.08)",
    line: "rgba(185, 28, 28, 0.25)",
  };
  if(sev === "moderate") return {
    Icon: AlertCircle,
    label: "MODERATE",
    color: "var(--amber)",
    bg: "var(--amber-soft)",
    line: "var(--amber-line)",
  };
  return {
    Icon: Eye,
    label: "WATCH",
    color: "var(--ink2)",
    bg: "var(--paper2)",
    line: "var(--line)",
  };
}

function PatternCard({ pattern }) {
  const sty = severityStyle(pattern.severity || "watch");
  return (
    <li style={{
      display:"grid",
      gap: 5,
      padding: "8px 11px",
      background: sty.bg,
      border: "1px solid " + sty.line,
      borderLeft: "3px solid " + sty.color,
      borderRadius: 6,
    }}>
      {/* Header row — pathogen + region + severity chip */}
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap: 8, flexWrap:"wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", letterSpacing: "-.005em" }}>
            {pattern.pathogen}
          </div>
          <div style={{
            fontSize: 10.5, fontWeight: 500, color: "var(--ink2)",
            fontStyle: "italic", marginTop: 1,
          }}>
            {pattern.region}
          </div>
        </div>
        <span style={{
          flex: "0 0 auto",
          fontFamily:"var(--mono)", fontSize: 8.5, fontWeight: 700,
          color: "#fff", background: sty.color,
          padding: "2px 6px", borderRadius: 3,
          letterSpacing: ".06em", whiteSpace: "nowrap",
        }}>{sty.label}</span>
      </div>

      {/* Pattern statement */}
      <div style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--ink)" }}>
        <span style={{
          fontFamily:"var(--mono)", fontSize: 9, fontWeight: 600,
          color: "var(--ink2)", letterSpacing: ".06em",
          textTransform: "uppercase", marginRight: 6,
        }}>pattern</span>
        <RichText text={pattern.pattern} accentColor={sty.color} />
      </div>

      {/* Empiric impact — the actionable line */}
      <div style={{
        fontSize: 11.5, lineHeight: 1.5, color: "var(--ink)",
        background: "var(--paper)",
        padding: "5px 8px",
        borderRadius: 4,
        border: "1px dashed " + sty.line,
      }}>
        <span style={{
          fontFamily:"var(--mono)", fontSize: 9, fontWeight: 700,
          color: sty.color, letterSpacing: ".06em",
          textTransform: "uppercase", marginRight: 6,
        }}>empiric</span>
        <RichText text={pattern.impact} accentColor={sty.color} />
      </div>

      {/* Evidence anchor */}
      {pattern.evidence && (
        <div style={{
          fontSize: 10, lineHeight: 1.5, color: "var(--ink2)",
        }}>
          <span style={{
            fontFamily:"var(--mono)", fontSize: 8.5, fontWeight: 600,
            color: "var(--ink2)", letterSpacing: ".06em",
            textTransform: "uppercase", marginRight: 6,
          }}>source</span>
          {pattern.evidence}
        </div>
      )}
    </li>
  );
}

function RegionalResistanceBlock({ patterns }) {
  if(!patterns || patterns.length === 0) return null;

  const accent = "var(--ox)";
  const accentBg = "rgba(15, 76, 129, 0.08)";

  return (
    <Section kicker="Regional resistance · Antibiogram alerts" icon={Globe} testId="regional-resistance-block">
      <div style={{
        background: accentBg,
        border: "1px solid var(--ox-line)",
        borderRadius: 7,
        padding: "8px 11px",
        marginBottom: 10,
      }}>
        <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--ink)", fontWeight: 500 }}>
          Resistance patterns that materially change the empiric strategy here. Always confirm against your <b>local antibiogram</b> — these are population-level signals, not patient-specific.
        </div>
      </div>

      <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:7 }}>
        {patterns.map((p, i) => <PatternCard key={p.id || ("rp-"+i)} pattern={p} />)}
      </ul>
    </Section>
  );
}

export { RegionalResistanceBlock };
