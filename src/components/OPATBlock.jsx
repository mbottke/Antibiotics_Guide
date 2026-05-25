/* component · OPATBlock — Wave 5 PR-8 outpatient parenteral therapy.

   Renders the structured "can this patient finish IV at home" surface
   for a syndrome with an authored OPAT_PROFILES entry. Three sections
   stack vertically:

     1. Eligibility — severity-graded chips (required / trigger /
        consider). Same severity grammar as MonitoringBlock /
        DiagnosticsBlock. matchCtx ELEVATES (left-border accent +
        MATCHES chip) but never HIDES.

     2. Access + agents — line-type badge + per-agent table with
        route / dose / monitoring / note. The table is the OPAT-
        specific affordance: scannable rows that map cleanly onto an
        OPAT pharmacist's discharge order.

     3. Monitoring — syndrome-level cadence beyond the agent-level
        labs surfaced in the agents table.

   Returns null when `opat` is null — graceful-fallback contract
   identical to MonitoringBlock / DiagnosticsBlock.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { HomeIcon, Syringe } from "lucide-react";
import { Section } from "./Section.jsx";
import { matchesCtx } from "../engines/ctxMatch.js";
import { RichText } from "./util/richText.jsx";
import { severityStyle } from "./util/severityStyle.js";

const ACCESS_LABEL = {
  PICC:    "PICC",
  midline: "Midline",
  port:    "Implanted port",
  none:    "No central access",
};

function itemMatchesCtx(item, ctx) {
  return !!(item.matchCtx && matchesCtx(item.matchCtx, ctx));
}

function ChecklistItem({ item, matched }) {
  const sty = severityStyle(item.sev || "consider");
  return (
    <li style={{
      display: "grid",
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
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        paddingTop: 1,
      }}>
        <sty.Icon size={12} color={sty.color} aria-hidden />
        <span style={{
          fontFamily: "var(--mono)", fontSize: 8, fontWeight: 700,
          color: sty.color, letterSpacing: ".06em", whiteSpace: "nowrap",
        }}>
          {sty.label}
        </span>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--ink)", fontWeight: matched ? 600 : 500, flex: 1 }}>
            <RichText text={item.what} accentColor={sty.color} />
          </div>
          {matched && (
            <span style={{
              flex: "0 0 auto",
              fontFamily: "var(--mono)", fontSize: 8, fontWeight: 700,
              color: "#fff", background: sty.color,
              padding: "2px 5px", borderRadius: 3,
              letterSpacing: ".06em", textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}>Matches</span>
          )}
        </div>
        {item.why && (
          <div style={{ fontSize: 10.5, lineHeight: 1.5, color: "var(--ink2)", marginTop: 2 }}>
            <RichText text={item.why} accentColor={sty.color} />
          </div>
        )}
      </div>
    </li>
  );
}

function AgentsTable({ agents }) {
  if(!Array.isArray(agents) || agents.length === 0) return null;
  return (
    <table style={{
      width: "100%", minWidth: 480,
      borderCollapse: "collapse", fontSize: 11.5,
      border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden",
    }}>
      <thead>
        <tr style={{ background: "var(--paper2)" }}>
          {["Agent", "Route", "Dose", "Monitoring"].map((h) => (
            <th key={h} style={{
              textAlign: "left", padding: "6px 9px", fontWeight: 700,
              fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: ".08em",
              textTransform: "uppercase", color: "var(--ink2)",
              borderBottom: "1px solid var(--line)",
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {agents.map((ag, i) => (
          <React.Fragment key={i}>
            <tr>
              <td style={{ padding: "8px 9px", borderTop: i ? "1px solid var(--line)" : "none", fontWeight: 600, color: "var(--ink)" }}>
                {ag.name}
              </td>
              <td style={{ padding: "8px 9px", borderTop: i ? "1px solid var(--line)" : "none", color: "var(--ink2)" }}>
                {ag.route}
              </td>
              <td style={{ padding: "8px 9px", borderTop: i ? "1px solid var(--line)" : "none", color: "var(--ink)" }}>
                {ag.dose}
              </td>
              <td style={{ padding: "8px 9px", borderTop: i ? "1px solid var(--line)" : "none", color: "var(--ink2)" }}>
                {ag.monitoring}
              </td>
            </tr>
            {ag.note && (
              <tr>
                <td colSpan={4} style={{
                  padding: "4px 9px 8px", fontSize: 10.5, lineHeight: 1.5,
                  color: "var(--ink2)", fontStyle: "italic",
                }}>
                  <RichText text={ag.note} accentColor="var(--ox)" />
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}

function AccessBadge({ access }) {
  if(!access) return null;
  const label = ACCESS_LABEL[access] || access;
  const isNone = access === "none";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
      letterSpacing: ".06em", textTransform: "uppercase",
      padding: "3px 8px", borderRadius: 5,
      color: isNone ? "var(--ink2)" : "var(--ox)",
      background: isNone ? "var(--paper2)" : "rgba(15, 76, 129, 0.08)",
      border: "1px solid " + (isNone ? "var(--line)" : "var(--ox-line)"),
    }}>
      <Syringe size={11} aria-hidden />
      {label}
    </span>
  );
}

function OPATBlock({ opat, ctx }) {
  if(!opat) return null;

  const accent = "var(--ox)";
  const accentBg = "rgba(15, 76, 129, 0.08)";

  const eligibility = Array.isArray(opat.eligibility) ? opat.eligibility : [];
  const monitoring  = Array.isArray(opat.monitoring) ? opat.monitoring : [];
  const agents      = Array.isArray(opat.agents) ? opat.agents : [];

  const matchedTotal =
    eligibility.filter(i => itemMatchesCtx(i, ctx)).length +
    monitoring.filter(i => itemMatchesCtx(i, ctx)).length;

  if(eligibility.length === 0 && monitoring.length === 0 && agents.length === 0) return null;

  return (
    <Section kicker="OPAT · Outpatient IV pathway" icon={HomeIcon} glyph="duration" testId="opat-block">
      {matchedTotal > 0 && (
        <div style={{ marginBottom: 10, display: "flex", justifyContent: "flex-end" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontFamily: "var(--mono)", fontSize: 9, letterSpacing: ".08em",
            textTransform: "uppercase", fontWeight: 600, color: accent,
            background: accentBg, padding: "2px 7px", borderRadius: 4,
            border: "1px solid var(--ox-line)",
          }}>
            {matchedTotal} {matchedTotal === 1 ? "match" : "matches"} for selection
          </span>
        </div>
      )}

      {/* Eligibility checklist */}
      {eligibility.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontFamily: "var(--mono)", fontSize: 9.5, fontWeight: 700,
            color: "var(--ink2)", letterSpacing: ".08em",
            textTransform: "uppercase", marginBottom: 6,
          }}>
            Eligibility
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 5 }}>
            {eligibility.map((it, i) => (
              <ChecklistItem key={`e-${i}`} item={it} matched={itemMatchesCtx(it, ctx)} />
            ))}
          </ul>
        </div>
      )}

      {/* Access + agents */}
      {(opat.access || agents.length > 0) && (
        <div style={{ marginBottom: 14 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 6,
          }}>
            <span style={{
              fontFamily: "var(--mono)", fontSize: 9.5, fontWeight: 700,
              color: "var(--ink2)", letterSpacing: ".08em",
              textTransform: "uppercase",
            }}>
              Agents
            </span>
            <AccessBadge access={opat.access} />
          </div>
          <div
            role="region"
            aria-label="OPAT agents table — scroll horizontally"
            tabIndex={0}
            style={{
              overflowX: "auto", WebkitOverflowScrolling: "touch",
              /* outline only on keyboard focus (rx-root :focus-visible
                 rule); avoids drawing a ring around the box on click. */
            }}
          >
            <AgentsTable agents={agents} />
          </div>
        </div>
      )}

      {/* Monitoring checklist */}
      {monitoring.length > 0 && (
        <div>
          <div style={{
            fontFamily: "var(--mono)", fontSize: 9.5, fontWeight: 700,
            color: "var(--ink2)", letterSpacing: ".08em",
            textTransform: "uppercase", marginBottom: 6,
          }}>
            OPAT monitoring
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 5 }}>
            {monitoring.map((it, i) => (
              <ChecklistItem key={`m-${i}`} item={it} matched={itemMatchesCtx(it, ctx)} />
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}

export { OPATBlock };
