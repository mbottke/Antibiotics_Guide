/* component · CombinedRisksBlock — Phase D3.2 cross-agent risk
   detection panel. Renders ONLY when the union of agents picked
   across all regimen tiers fires at least one entry in
   combinedRisks.js (AND-semantics: every regex in a risk's `agents`
   array must match at least one picked agent).

   Sits between Start-now and Duration in the Answer Canvas — the
   place a clinician would naturally check after picking their
   regimen but before committing to duration / monitoring. Rendered
   nothing → invisible, so it doesn't add chrome to the page
   baseline.

   Visual language matches the rest of D2: same Section chrome,
   same severity vocab (stop → red, warn → amber, note → muted).
   Uses the inline **bold** parser shared with regimenContent /
   syndromeDecision.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { AlertTriangle, Link2, ShieldAlert, Info } from "lucide-react";
import { Section } from "./Section.jsx";
import { detectCombinedRisks } from "../data/combinedRisks.js";
import { parseBold, RichText } from "./util/richText.jsx";
import { GradientHairline } from "./decor/GradientHairline.jsx";

/* Shared bold-callout parser — same shape used in DurationBlock /
   MonitoringBlock / RegimenOptions. */
/* Severity → visual style. Mirrors the watchOut palette from
   RegimenOptions / MonitoringBlock so the whole app speaks one
   severity vocabulary. */
function severityStyle(sev) {
  if(sev === "stop") return {
    Icon: ShieldAlert,
    label: "DO NOT COMBINE",
    color: "#b91c1c",
    bg: "rgba(185, 28, 28, 0.08)",
    line: "rgba(185, 28, 28, 0.25)",
  };
  if(sev === "warn") return {
    Icon: AlertTriangle,
    label: "WARN",
    color: "var(--amber)",
    bg: "var(--amber-soft)",
    line: "var(--amber-line)",
  };
  return {
    Icon: Info,
    label: "NOTE",
    color: "var(--ink2)",
    bg: "var(--paper2)",
    line: "var(--line)",
  };
}

function RiskRow({ risk }) {
  const sty = severityStyle(risk.sev || "note");
  return (
    <li style={{
      display:"grid",
      gridTemplateColumns: "auto 1fr",
      gap: 11,
      alignItems: "flex-start",
      padding: "9px 11px",
      background: sty.bg,
      border: "1px solid " + sty.line,
      borderLeft: "3px solid " + sty.color,
      /* Medium-surface 10/3 — shared rhythm with the other row primitives
         (objections, reasoning trace, duration branches). */
      borderRadius: "10px 3px 10px 3px",
    }}>
      {/* Severity badge column */}
      <div style={{
        display:"flex", flexDirection:"column", alignItems:"center", gap:3,
        paddingTop: 1,
      }}>
        <sty.Icon size={14} color={sty.color} aria-hidden />
        <span style={{
          fontFamily:"var(--mono)", fontSize:8, fontWeight:700,
          color: sty.color, letterSpacing:".06em", whiteSpace:"nowrap",
        }}>
          {sty.label}
        </span>
      </div>

      {/* Headline + detail + evidence */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize:12.5, fontWeight:600, lineHeight:1.4, color:"var(--ink)" }}>
          <RichText text={risk.headline} accentColor={sty.color} accentBg={sty.bg !== "transparent" ? sty.bg : undefined} />
        </div>
        {risk.detail && (
          <div style={{ fontSize:11.5, lineHeight:1.5, color:"var(--ink2)", marginTop: 4 }}>
            <RichText text={risk.detail} accentColor={sty.color} />
          </div>
        )}
        {risk.evidence && (
          <div style={{ fontSize:10.5, lineHeight:1.4, color:"var(--muted)", marginTop: 3, fontStyle:"italic" }}>
            <RichText text={risk.evidence} accentColor={sty.color} />
          </div>
        )}
      </div>
    </li>
  );
}

function CombinedRisksBlock({ pickedAgents = [] }) {
  const risks = detectCombinedRisks(pickedAgents);
  if(risks.length === 0) return null;

  /* Wave 12 W12 · severity-bucketed layout when ≥ 8 risks fire.
     Severity order is stop ↘ warn ↘ note; between each non-empty
     bucket we render a quiet cyan-blue hairline so the eye gets a
     breath at the severity wall. Below 8 the existing single list
     stays — the rhythm is fine when the list is short. */
  const stopBucket = risks.filter(r => r.sev === "stop");
  const warnBucket = risks.filter(r => r.sev === "warn");
  const noteBucket = risks.filter(r => !["stop", "warn"].includes(r.sev));
  const useBuckets = risks.length >= 8;

  return (
    <Section kicker={`Combined-regimen risks · ${risks.length} firing`} icon={Link2} testId="combined-risks-block">
      <div style={{ fontSize:11.5, color:"var(--ink2)", marginBottom:10, fontStyle:"italic" }}>
        Cross-agent interactions detected from the agents picked across the tiers above. Items fire only when both agents are selected — pick a different card to clear.
      </div>
      {!useBuckets && (
        <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:6 }}>
          {risks.map(r => <RiskRow key={r.id} risk={r} />)}
        </ul>
      )}
      {useBuckets && (
        <>
          {stopBucket.length > 0 && (
            <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:6 }}>
              {stopBucket.map(r => <RiskRow key={r.id} risk={r} />)}
            </ul>
          )}
          {stopBucket.length > 0 && (warnBucket.length > 0 || noteBucket.length > 0) && (
            <GradientHairline variant="cyan-blue" style={{ opacity: .4, margin: "24px 0" }} />
          )}
          {warnBucket.length > 0 && (
            <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:6 }}>
              {warnBucket.map(r => <RiskRow key={r.id} risk={r} />)}
            </ul>
          )}
          {warnBucket.length > 0 && noteBucket.length > 0 && (
            <GradientHairline variant="cyan-blue" style={{ opacity: .4, margin: "24px 0" }} />
          )}
          {noteBucket.length > 0 && (
            <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:6 }}>
              {noteBucket.map(r => <RiskRow key={r.id} risk={r} />)}
            </ul>
          )}
        </>
      )}
    </Section>
  );
}

export { CombinedRisksBlock };
