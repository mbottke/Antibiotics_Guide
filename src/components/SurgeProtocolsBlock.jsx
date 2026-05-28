/* component · SurgeProtocolsBlock — Phase K surge / outbreak alert
   surface. Surfaces emerging pathogens, bioterror agents, regional
   outbreaks, and novel resistance phenotypes that demand recognition,
   reporting, and specific empiric strategy.

   Visual language:
     - tier-1   · red (bioterror / CDC Tier 1 select agent)
     - high     · amber (rapid recognition affects outcome)
     - watch    · muted (surveillance level)

   Each card surfaces:
     - Pathogen + category chip
     - Epi (exposure history)
     - Clinical (presentation triggers)
     - Empiric (initial strategy)
     - Antitoxin (specific therapy if any)
     - Public health (notification + isolation + PEP)
     - Evidence anchor

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { AlertOctagon, AlertTriangle, Eye, Siren } from "lucide-react";
import { Section } from "./Section.jsx";
import { RichText } from "./util/richText.jsx";

function severityStyle(sev) {
  if(sev === "tier-1") return {
    Icon: AlertOctagon,
    label: "TIER 1",
    color: "#b91c1c",
    bg: "rgba(185, 28, 28, 0.08)",
  };
  if(sev === "high") return {
    Icon: AlertTriangle,
    label: "HIGH",
    color: "var(--amber)",
    bg: "var(--amber-soft)",
  };
  return {
    Icon: Eye,
    label: "WATCH",
    color: "var(--ink2)",
    bg: "var(--paper2)",
  };
}

function categoryLabel(c) {
  if(c === "bioterror") return "Bioterror";
  if(c === "emerging") return "Emerging";
  if(c === "regional-outbreak") return "Outbreak";
  if(c === "novel-resistance") return "Novel resistance";
  return c;
}

function SurgeCard({ protocol }) {
  const sty = severityStyle(protocol.severity);
  return (
    <li style={{
      display:"grid",
      gap: 6,
      padding: "10px 12px",
      background: sty.bg,
      border: "1px solid " + sty.color,
      borderLeft: "4px solid " + sty.color,
      borderRadius: 6,
    }}>
      {/* Header — pathogen + category + severity */}
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap: 8, flexWrap:"wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", letterSpacing: "-.005em" }}>
            {protocol.pathogen}
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: sty.color, textTransform: "uppercase", letterSpacing: ".06em", marginTop: 1 }}>
            {categoryLabel(protocol.category)}
          </div>
        </div>
        <span style={{
          flex: "0 0 auto",
          display: "inline-flex", alignItems: "center", gap: 4,
          fontFamily:"var(--mono)", fontSize: 9, fontWeight: 700,
          color: "#fff", background: sty.color,
          padding: "2px 6px", borderRadius: 3,
          letterSpacing: ".06em", whiteSpace: "nowrap",
        }}>
          <sty.Icon size={10} aria-hidden /> {sty.label}
        </span>
      </div>

      {/* Epi + Clinical rows */}
      {protocol.epi && (
        <div style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--ink)" }}>
          <span style={{
            fontFamily:"var(--mono)", fontSize: 9, fontWeight: 600,
            color: "var(--ink2)", letterSpacing: ".06em",
            textTransform: "uppercase", marginRight: 6,
          }}>epi</span>
          <RichText text={protocol.epi} accentColor={sty.color} />
        </div>
      )}
      {protocol.clinical && (
        <div style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--ink)" }}>
          <span style={{
            fontFamily:"var(--mono)", fontSize: 9, fontWeight: 600,
            color: "var(--ink2)", letterSpacing: ".06em",
            textTransform: "uppercase", marginRight: 6,
          }}>clinical</span>
          <RichText text={protocol.clinical} accentColor={sty.color} />
        </div>
      )}

      {/* Empiric strategy — actionable */}
      {protocol.empiric && (
        <div style={{
          fontSize: 11.5, lineHeight: 1.5, color: "var(--ink)",
          padding: "5px 8px",
          background: "var(--paper)",
          borderRadius: 4,
          border: "1px dashed " + sty.color,
        }}>
          <span style={{
            fontFamily:"var(--mono)", fontSize: 9, fontWeight: 700,
            color: sty.color, letterSpacing: ".06em",
            textTransform: "uppercase", marginRight: 6,
          }}>empiric</span>
          <RichText text={protocol.empiric} accentColor={sty.color} />
        </div>
      )}

      {/* Antitoxin */}
      {protocol.antitoxin && (
        <div style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--ink)" }}>
          <span style={{
            fontFamily:"var(--mono)", fontSize: 9, fontWeight: 600,
            color: "var(--ink2)", letterSpacing: ".06em",
            textTransform: "uppercase", marginRight: 6,
          }}>antitoxin</span>
          <RichText text={protocol.antitoxin} accentColor={sty.color} />
        </div>
      )}

      {/* Public health */}
      {protocol.publicHealth && (
        <div style={{
          fontSize: 11, lineHeight: 1.5, color: "var(--ink)",
          padding: "5px 8px",
          background: "rgba(15, 76, 129, 0.06)",
          borderRadius: 4,
          border: "1px solid var(--ox-line)",
        }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontFamily:"var(--mono)", fontSize: 9, fontWeight: 700,
            color: "var(--ox)", letterSpacing: ".06em",
            textTransform: "uppercase", marginRight: 6,
          }}>
            <Siren size={10} color="var(--ox)" aria-hidden /> public health
          </span>
          <RichText text={protocol.publicHealth} accentColor={"var(--ox)"} />
        </div>
      )}

      {/* Evidence */}
      {protocol.evidence && (
        <div style={{
          fontSize: 10, lineHeight: 1.5, color: "var(--ink2)",
        }}>
          <span style={{
            fontFamily:"var(--mono)", fontSize: 8.5, fontWeight: 600,
            color: "var(--ink2)", letterSpacing: ".06em",
            textTransform: "uppercase", marginRight: 6,
          }}>source</span>
          {protocol.evidence}
        </div>
      )}
    </li>
  );
}

function SurgeProtocolsBlock({ protocols }) {
  if(!protocols || protocols.length === 0) return null;

  const accent = "#b91c1c";

  return (
    <Section kicker="Surge + outbreak · Emerging pathogen alerts" icon={Siren} testId="surge-protocols-block">
      <div style={{
        background: "rgba(185, 28, 28, 0.04)",
        border: "1px solid rgba(185, 28, 28, 0.2)",
        /* Medium-surface 10/3 — shared headline-panel rhythm. */
        borderRadius: "10px 3px 10px 3px",
        padding: "8px 11px",
        marginBottom: 10,
      }}>
        <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--ink)", fontWeight: 500 }}>
          Conditions where misrecognition costs lives — bioterror Tier-1 agents, emerging viral pathogens, regional outbreaks, and novel resistance phenotypes. <b>Public-health notification</b> + isolation precautions trigger before treatment optimization.
        </div>
      </div>

      <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:8 }}>
        {protocols.map((p, i) => <SurgeCard key={p.id || ("sp-"+i)} protocol={p} />)}
      </ul>
    </Section>
  );
}

export { SurgeProtocolsBlock };
