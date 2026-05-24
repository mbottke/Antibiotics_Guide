/* component · PedsPregBlock — Phase J pediatric + pregnancy dosing
   reference overlay. Surfaces weight-based dosing and pregnancy
   safety modifications for syndromes where the standard adult
   regimen doesn't directly apply.

   Visual language:
     - pregSafe "yes"     → green check
     - pregSafe "caution" → amber
     - pregSafe "avoid"   → red

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { Baby, CheckCircle2, AlertTriangle, XCircle, Heart } from "lucide-react";
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

function pregSafetyStyle(s) {
  if(s === "yes") return {
    Icon: CheckCircle2,
    label: "SAFE",
    color: "#14532d",      // darker green: WCAG AA on light-green tinted backgrounds
    bg: "rgba(21, 128, 61, 0.08)",
  };
  if(s === "caution") return {
    Icon: AlertTriangle,
    label: "CAUTION",
    color: "#7c2d12",      // darker amber/brown: WCAG AA on amber-soft
    bg: "var(--amber-soft)",
  };
  return {
    Icon: XCircle,
    label: "AVOID",
    color: "#7f1d1d",      // darker red: WCAG AA on red-tinted backgrounds
    bg: "rgba(185, 28, 28, 0.08)",
  };
}

function DosingCard({ entry }) {
  const sty = pregSafetyStyle(entry.pregSafe);
  return (
    <li style={{
      display:"grid",
      gap: 6,
      padding: "9px 11px",
      background: "var(--paper2)",
      border: "1px solid var(--line)",
      borderLeft: "3px solid " + sty.color,
      borderRadius: 6,
    }}>
      {/* Header — agent + preg safety chip */}
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap: 8, flexWrap:"wrap" }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)", letterSpacing: "-.005em" }}>
          {entry.agent}
        </div>
        <span style={{
          flex: "0 0 auto",
          display: "inline-flex", alignItems: "center", gap: 4,
          fontFamily:"var(--mono)", fontSize: 9, fontWeight: 700,
          color: "#fff", background: sty.color,
          padding: "2px 6px", borderRadius: 3,
          letterSpacing: ".06em", whiteSpace: "nowrap",
        }}>
          <Heart size={9} aria-hidden /> PREG {sty.label}
        </span>
      </div>

      {/* Peds dosing row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 8, alignItems: "flex-start",
        padding: "5px 8px",
        background: "var(--paper)",
        borderRadius: 4,
        border: "1px solid var(--line)",
      }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontFamily:"var(--mono)", fontSize: 9, fontWeight: 700,
          color: "var(--ox)", letterSpacing: ".06em",
          textTransform: "uppercase", paddingTop: 1,
        }}>
          <Baby size={11} color="var(--ox)" aria-hidden /> PEDS
        </span>
        <div style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--ink)" }}>
          <div style={{ fontWeight: 500 }}>{entry.pedsDose}</div>
          {entry.pedsNotes && (
            <div style={{ fontSize: 10.5, color: "var(--ink2)", marginTop: 2 }}>
              <RichText text={entry.pedsNotes} accentColor={sty.color} />
            </div>
          )}
        </div>
      </div>

      {/* Pregnancy row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 8, alignItems: "flex-start",
        padding: "5px 8px",
        background: sty.bg,
        borderRadius: 4,
        border: "1px solid var(--line)",
      }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontFamily:"var(--mono)", fontSize: 9, fontWeight: 700,
          color: sty.color, letterSpacing: ".06em",
          textTransform: "uppercase", paddingTop: 1,
        }}>
          <Heart size={11} color={sty.color} aria-hidden /> PREG
        </span>
        <div style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--ink)" }}>
          <div style={{ fontWeight: 500 }}>{entry.pregCategory}</div>
          {entry.pregNotes && (
            <div style={{ fontSize: 10.5, color: "var(--ink2)", marginTop: 2 }}>
              <RichText text={entry.pregNotes} accentColor={sty.color} />
            </div>
          )}
        </div>
      </div>

      {/* Evidence */}
      {entry.evidence && (
        <div style={{
          fontSize: 10, lineHeight: 1.5, color: "var(--ink2)",
          paddingTop: 2,
        }}>
          <span style={{
            fontFamily:"var(--mono)", fontSize: 8.5, fontWeight: 600,
            color: "var(--ink2)", letterSpacing: ".06em",
            textTransform: "uppercase", marginRight: 6,
          }}>source</span>
          {entry.evidence}
        </div>
      )}
    </li>
  );
}

function PedsPregBlock({ entries }) {
  if(!entries || entries.length === 0) return null;

  const accent = "var(--ox)";
  const accentBg = "rgba(15, 76, 129, 0.08)";

  return (
    <Section kicker="Pediatric + pregnancy · Dosing modifications" icon={Baby} testId="peds-preg-block">
      <div style={{
        background: accentBg,
        border: "1px solid var(--ox-line)",
        borderRadius: 7,
        padding: "8px 11px",
        marginBottom: 10,
      }}>
        <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--ink)", fontWeight: 500 }}>
          <b>Scope note:</b> This guide is adult-focused. Surfacing peds + pregnancy modifications prevents reflexive adult dosing in mixed populations. For active management of pediatric or pregnant patients, consult a dedicated reference (Nelson + Bradley + ACOG).
        </div>
      </div>

      <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:7 }}>
        {entries.map((e, i) => <DosingCard key={e.id || ("pp-"+i)} entry={e} />)}
      </ul>
    </Section>
  );
}

export { PedsPregBlock };
