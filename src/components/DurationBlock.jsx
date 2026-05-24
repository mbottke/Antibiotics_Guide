/* component · DurationBlock — Phase D2 structured duration content.
   Renders the syndrome-level "when to stop" decision below the
   regimen options in the Answer Canvas. Three parts:

     1. Headline + evidence anchor — the bottom line at a glance
     2. Branches — clinical-state grid (uncomplicated / endocarditis
        / hardware-retained), each with a prominent day-count chip
     3. Stop-when checklist + Extend-if triggers — the discharge
        checklist as a two-column scan

   Renders nothing when the syndrome has no authored content; the
   legacy duration clock in ReassessmentPanel still shows in that
   case from the `syndrome.duration` string parser.

   Visual language matches RegimenOptions: same color palette,
   same **bold** callout parser, same severity vocabulary.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { Clock, Check, AlertTriangle, ArrowUpRight } from "lucide-react";

/* Bold-callout parser. Same as RegimenOptions — splits a string on
   **…** segments and returns chunks the renderer can accent. */
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

function SectionLabel({ icon: Icon, text, color = "var(--ink2)" }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:5, marginBottom:6,
      fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".1em",
      textTransform:"uppercase", fontWeight:700, color,
    }}>
      {Icon && <Icon size={11} aria-hidden />}
      <span>{text}</span>
    </div>
  );
}

function DurationBlock({ duration }) {
  if(!duration) return null;
  const { headline, evidence, branches = [], stopWhen = [], extendIf = [] } = duration;
  if(!headline && branches.length === 0 && stopWhen.length === 0) return null;

  const accent = "var(--ox)";
  const accentBg = "rgba(15, 76, 129, 0.08)";

  return (
    <section
      data-testid="duration-block"
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
        <Clock size={14} color={accent} aria-hidden />
        <span style={{
          fontFamily:"var(--mono)", fontSize:10.5, letterSpacing:".12em",
          textTransform:"uppercase", fontWeight:700, color:"var(--ink)",
        }}>Duration · When to stop</span>
      </div>

      {/* Headline + evidence */}
      {headline && (
        <div style={{
          background: accentBg,
          border: "1px solid var(--ox-line)",
          borderRadius: 7,
          padding: "8px 11px",
          marginBottom: branches.length || stopWhen.length || extendIf.length ? 12 : 0,
        }}>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink)", fontWeight: 600 }}>
            <RichText text={headline} accentColor={accent} />
          </div>
          {evidence && (
            <div style={{ fontSize: 11, lineHeight: 1.45, color: "var(--ink2)", marginTop: 4, fontStyle: "italic" }}>
              <RichText text={evidence} accentColor={accent} />
            </div>
          )}
        </div>
      )}

      {/* Branches — clinical-state grid */}
      {branches.length > 0 && (
        <div style={{ marginBottom: stopWhen.length || extendIf.length ? 12 : 0 }}>
          <SectionLabel text="Course by clinical state" color={accent} />
          <div style={{
            display:"grid",
            gap:7,
            gridTemplateColumns: branches.length === 1 ? "1fr"
              : branches.length === 2 ? "repeat(2, 1fr)"
              : branches.length <= 4 ? "repeat(auto-fit, minmax(180px, 1fr))"
              :                         "repeat(auto-fit, minmax(160px, 1fr))",
          }}>
            {branches.map((b, i) => (
              <div key={i} style={{
                background: "var(--paper2)",
                border: "1px solid var(--line)",
                borderRadius: 7,
                padding: "8px 10px",
                display:"flex", flexDirection:"column", gap:4,
              }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:8, justifyContent:"space-between" }}>
                  <span style={{ fontSize:11.5, fontWeight:600, color:"var(--ink)", lineHeight:1.35 }}>
                    {b.label}
                  </span>
                  <span style={{
                    fontFamily:"var(--mono)", fontSize:14, fontWeight:700,
                    color: accent, background: accentBg,
                    padding: "1px 7px", borderRadius: 5, whiteSpace:"nowrap",
                    border: "1px solid var(--ox-line)",
                  }}>
                    {b.days}{/^\d+$/.test(b.days) ? " d" : ""}
                  </span>
                </div>
                {b.detail && (
                  <div style={{ fontSize: 11, color: "var(--ink2)", lineHeight: 1.45 }}>
                    <RichText text={b.detail} accentColor={accent} accentBg={accentBg} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stop-when + Extend-if — two columns */}
      {(stopWhen.length || extendIf.length) > 0 && (
        <div style={{
          display:"grid",
          gridTemplateColumns: stopWhen.length && extendIf.length ? "1fr 1fr" : "1fr",
          gap: 14,
        }}>
          {stopWhen.length > 0 && (
            <div>
              <SectionLabel icon={Check} text={`Stop when (ALL of)`} color="#0f7a3b" />
              <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:4 }}>
                {stopWhen.map((s, i) => (
                  <li key={i} style={{
                    display:"flex", alignItems:"flex-start", gap:6,
                    fontSize:11.5, lineHeight:1.45, color:"var(--ink2)",
                  }}>
                    <Check size={11} aria-hidden style={{ color:"#0f7a3b", flexShrink: 0, marginTop: 3 }} />
                    <span><RichText text={s} accentColor="#0f7a3b" accentBg="rgba(15, 122, 59, 0.08)" /></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {extendIf.length > 0 && (
            <div>
              <SectionLabel icon={ArrowUpRight} text="Extend if" color="var(--amber)" />
              <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:4 }}>
                {extendIf.map((s, i) => (
                  <li key={i} style={{
                    display:"flex", alignItems:"flex-start", gap:6,
                    fontSize:11.5, lineHeight:1.45, color:"var(--ink2)",
                  }}>
                    <AlertTriangle size={11} aria-hidden style={{ color:"var(--amber)", flexShrink: 0, marginTop: 3 }} />
                    <span><RichText text={s} accentColor="var(--amber)" accentBg="var(--amber-soft)" /></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export { DurationBlock };
