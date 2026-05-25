/* component · NovelAgentsBlock — Phase I newer-agent surface.
   Surfaces drugs that have entered clinical practice in the last
   5–10 years and carry specific use-cases beyond legacy regimens.

   Each card shows:
     - agent + class + approval year chip
     - spectrum (what it covers + does NOT cover)
     - useCases (specific clinical indications)
     - mechanism + resistance signal
     - pitfalls (dosing quirks, contraindications)
     - dosing line
     - pivotal trial citation

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { Beaker, Pill, AlertCircle } from "lucide-react";
import { Section } from "./Section.jsx";
import { RichText } from "./util/richText.jsx";

function AgentCard({ agent }) {
  const accent = "var(--ox)";
  return (
    <li style={{
      display:"grid",
      gap: 6,
      padding: "10px 12px",
      background: "var(--paper2)",
      border: "1px solid var(--line)",
      borderLeft: "3px solid " + accent,
      borderRadius: 6,
    }}>
      {/* Header — agent + class + year chip */}
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap: 8, flexWrap:"wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", letterSpacing: "-.005em" }}>
            {agent.agent}
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 500, color: "var(--ink2)", fontStyle: "italic", marginTop: 1 }}>
            {agent.class}
          </div>
        </div>
        <span style={{
          flex: "0 0 auto",
          fontFamily:"var(--mono)", fontSize: 9, fontWeight: 700,
          color: accent, background: "rgba(15, 76, 129, 0.08)",
          padding: "2px 6px", borderRadius: 3,
          letterSpacing: ".06em", whiteSpace: "nowrap",
          border: "1px solid var(--ox-line)",
        }}>FDA {agent.approved}</span>
      </div>

      {/* Spectrum */}
      <div style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--ink)" }}>
        <span style={{
          fontFamily:"var(--mono)", fontSize: 9, fontWeight: 600,
          color: "var(--ink2)", letterSpacing: ".06em",
          textTransform: "uppercase", marginRight: 6,
        }}>spectrum</span>
        <RichText text={agent.spectrum} accentColor={accent} />
      </div>

      {/* Use cases */}
      {agent.useCases && agent.useCases.length > 0 && (
        <div>
          <div style={{
            fontFamily:"var(--mono)", fontSize: 9, fontWeight: 600,
            color: "var(--ink2)", letterSpacing: ".06em",
            textTransform: "uppercase", marginBottom: 3,
          }}>use cases</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11.5, lineHeight: 1.5, color: "var(--ink)" }}>
            {agent.useCases.map((u, i) => (
              <li key={"uc-"+i} style={{ marginBottom: 2 }}>
                <RichText text={u} accentColor={accent} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mechanism */}
      {agent.mechanism && (
        <div style={{
          fontSize: 11, lineHeight: 1.5, color: "var(--ink2)",
          padding: "4px 8px",
          background: "var(--paper)",
          borderRadius: 4,
          border: "1px dashed var(--line)",
        }}>
          <span style={{
            fontFamily:"var(--mono)", fontSize: 9, fontWeight: 600,
            color: "var(--ink2)", letterSpacing: ".06em",
            textTransform: "uppercase", marginRight: 6,
          }}>mechanism</span>
          {agent.mechanism}
        </div>
      )}

      {/* Pitfalls */}
      {agent.pitfalls && agent.pitfalls.length > 0 && (
        <div>
          <div style={{
            fontFamily:"var(--mono)", fontSize: 9, fontWeight: 700,
            color: "var(--amber)", letterSpacing: ".06em",
            textTransform: "uppercase", marginBottom: 3,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <AlertCircle size={11} color="var(--amber)" aria-hidden /> pitfalls
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, lineHeight: 1.5, color: "var(--ink)" }}>
            {agent.pitfalls.map((p, i) => (
              <li key={"pf-"+i} style={{ marginBottom: 2 }}>
                <RichText text={p} accentColor={"var(--amber)"} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dosing footer */}
      <div style={{
        display: "flex", justifyContent: "space-between", gap: 8,
        paddingTop: 4, borderTop: "1px solid var(--line)",
        fontSize: 10.5, color: "var(--ink2)",
      }}>
        <span><b style={{color:"var(--ink)"}}>Dose:</b> {agent.dosing}</span>
        {agent.evidence && (
          <span style={{ fontSize: 10, fontStyle: "italic", textAlign: "right" }}>{agent.evidence}</span>
        )}
      </div>
    </li>
  );
}

function NovelAgentsBlock({ agents }) {
  if(!agents || agents.length === 0) return null;

  const accent = "var(--ox)";
  const accentBg = "rgba(15, 76, 129, 0.08)";

  return (
    <Section kicker="Novel agents · Newer options for resistant disease" icon={Beaker} testId="novel-agents-block">
      <div style={{
        background: accentBg,
        border: "1px solid var(--ox-line)",
        borderRadius: 7,
        padding: "8px 11px",
        marginBottom: 10,
      }}>
        <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--ink)", fontWeight: 500 }}>
          Drugs in clinical practice since 2010 that target specific resistance mechanisms. <b>Pathogen-typing + ID consult</b> drives selection — these are not blanket empiric replacements.
        </div>
      </div>

      <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:8 }}>
        {agents.map((a, i) => <AgentCard key={a.id || ("ag-"+i)} agent={a} />)}
      </ul>
    </Section>
  );
}

export { NovelAgentsBlock };
