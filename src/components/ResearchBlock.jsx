/* component · ResearchBlock — Phase F evidence depth. Surfaces the
   structured `research:` panel that sits alongside duration +
   monitoring in syndromeDecision entries. Three buckets:

     - trials      · landmark RCTs / meta-analyses with year-tagged
                      findings (BALANCE 2024, OVIVA 2019, etc.) — the
                      "what the evidence actually shows" layer
     - guidelines  · major society documents (IDSA, ATS, WHO, CDC,
                      ACG, AHA) with year + bottom-line recommendation
     - openQuestions · actively debated areas where the literature is
                      unsettled — so clinicians know what's NOT
                      definitively answered

   The component renders nothing when the syndrome has no authored
   research panel. The optional field means we can roll out the layer
   incrementally — D2 + Phase F coexist gracefully, with the panel
   appearing on syndromes that have it.

   Visual language matches DurationBlock + MonitoringBlock + Section
   chrome for consistency: same **bold** parser, same accent system.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { BookOpen, FileText, HelpCircle, Microscope } from "lucide-react";
import { Section } from "./Section.jsx";
import { RichText } from "./util/richText.jsx";
import { GradientHairline } from "./decor/GradientHairline.jsx";

/* A single trial card — name + n chip, then question / finding /
   bias caveat in stacked rows. The bias row is muted to signal it's
   a generalizability note, not part of the finding. */
function TrialCard({ trial, accent }) {
  return (
    <li style={{
      display:"grid",
      gap: 4,
      padding: "8px 10px",
      background: "var(--paper2)",
      border: "1px solid var(--line)",
      borderLeft: "3px solid " + accent,
      borderRadius: 6,
    }}>
      <div style={{ display:"flex", alignItems:"baseline", gap: 8, flexWrap:"wrap" }}>
        <span style={{
          fontSize: 12, fontWeight: 700, color: "var(--ink)",
          letterSpacing: "-.005em",
        }}>{trial.name}</span>
        {trial.n !== undefined && (
          <span style={{
            fontFamily:"var(--mono)", fontSize: 9, fontWeight: 600,
            color: "var(--ink2)", background: "var(--paper)",
            padding: "1px 5px", borderRadius: 3,
            border: "1px solid var(--line)",
            whiteSpace: "nowrap",
          }}>n = {trial.n}</span>
        )}
      </div>
      {trial.question && (
        <div style={{ fontSize: 11, lineHeight: 1.5, color: "var(--ink2)", fontStyle: "italic" }}>
          {trial.question}
        </div>
      )}
      <div style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--ink)" }}>
        <RichText text={trial.finding} accentColor={accent} />
      </div>
      {trial.bias && (
        <div style={{
          fontSize: 10.5, lineHeight: 1.5, color: "var(--ink2)",
          paddingTop: 3, borderTop: "1px dashed var(--line)",
        }}>
          <span style={{
            fontFamily:"var(--mono)", fontSize: 8.5, fontWeight: 600,
            color: "var(--ink2)", letterSpacing: ".06em",
            textTransform: "uppercase", marginRight: 6,
          }}>caveat</span>
          {trial.bias}
        </div>
      )}
    </li>
  );
}

/* A single guideline card — society + year chip on left, topic + keypoint
   on right. Compact compared to trial cards since guideline density is
   higher and each card is shorter. */
function GuidelineCard({ guideline, accent }) {
  return (
    <li style={{
      display:"grid",
      gridTemplateColumns: "auto 1fr",
      gap: 10,
      padding: "7px 9px",
      background: "var(--paper)",
      border: "1px solid var(--line)",
      borderRadius: 6,
      alignItems: "flex-start",
    }}>
      <div style={{
        display:"flex", flexDirection:"column", alignItems:"center",
        gap: 1, paddingTop: 1, minWidth: 50,
      }}>
        <span style={{
          fontSize: 10.5, fontWeight: 700, color: accent,
          letterSpacing: "-.005em",
        }}>{guideline.society}</span>
        <span style={{
          fontFamily:"var(--mono)", fontSize: 9, fontWeight: 600,
          color: "var(--ink2)",
        }}>{guideline.year}</span>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "var(--ink2)", fontStyle: "italic" }}>
          {guideline.topic}
        </div>
        <div style={{ fontSize: 11.5, lineHeight: 1.5, color: "var(--ink)", fontWeight: 500, marginTop: 2 }}>
          <RichText text={guideline.keypoint} accentColor={accent} />
        </div>
      </div>
    </li>
  );
}

function ResearchBlock({ research }) {
  if(!research) return null;
  const { headline, trials = [], guidelines = [], openQuestions = [] } = research;
  if(!headline && trials.length === 0 && guidelines.length === 0) return null;

  const accent = "var(--ox)";
  const accentBg = "rgba(15, 76, 129, 0.08)";

  return (
    <Section kicker="Research · Evidence behind the recommendation" icon={BookOpen} glyph="evidence" testId="research-block">
      {/* Headline — the bottom-line interpretation of what the
          literature actually shows. Identical visual treatment to
          monitoring + duration headline rows for consistency. Wave 10
          adds rx-glass-bleed so the headline panel reads with the
          frosted-glass register the rest of the canvas uses. */}
      {headline && (
        <div className="rx-glass-bleed" style={{
          background: accentBg,
          border: "1px solid var(--ox-line)",
          /* Medium-surface 10/3 — shared headline-panel rhythm. */
          borderRadius: "10px 3px 10px 3px",
          padding: "8px 11px",
          marginBottom: (trials.length || guidelines.length || openQuestions.length) ? 12 : 0,
          position: "relative",
        }}>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink)", fontWeight: 600, position: "relative", zIndex: 2 }}>
            <RichText text={headline} accentColor={accent} />
          </div>
        </div>
      )}

      {/* Trials — the "what the studies actually show" bucket.
          Each card carries name + sample size + question + finding +
          bias caveat (when present). Bias row is visually muted to
          signal it's a generalizability note, not part of the result. */}
      {trials.length > 0 && (
        <div style={{ marginBottom: (guidelines.length || openQuestions.length) ? 14 : 0 }}>
          <SubKicker label="Landmark trials" Icon={Microscope} accent={accent} />
          <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:6 }}>
            {trials.map((t, i) => <TrialCard key={"trial-"+i} trial={t} accent={accent} />)}
          </ul>
        </div>
      )}

      {/* Guidelines — society documents. Compact one-line keypoints
          with society + year chip. */}
      {guidelines.length > 0 && (
        <div style={{ marginBottom: openQuestions.length ? 14 : 0 }}>
          <SubKicker label="Society guidelines" Icon={FileText} accent={accent} />
          <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:5 }}>
            {guidelines.map((g, i) => <GuidelineCard key={"gl-"+i} guideline={g} accent={accent} />)}
          </ul>
        </div>
      )}

      {/* Open questions — the "what the literature is still arguing
          about" bucket. Surfaces unsettled areas so clinicians know
          where to expect debate. */}
      {openQuestions.length > 0 && (
        <div>
          <SubKicker label="Open questions" Icon={HelpCircle} accent={accent} />
          <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:4 }}>
            {openQuestions.map((q, i) => (
              <li key={"oq-"+i} style={{
                display:"grid", gridTemplateColumns: "auto 1fr", gap: 8,
                padding: "5px 9px",
                background: "var(--paper2)",
                border: "1px dashed var(--line)",
                borderRadius: 5,
                fontSize: 11, lineHeight: 1.5, color: "var(--ink2)",
                alignItems: "flex-start",
              }}>
                <HelpCircle size={11} color="var(--ink2)" style={{ marginTop: 2 }} aria-hidden />
                <span><RichText text={q} accentColor={accent} /></span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}

/* Small kicker row for each sub-section (trials / guidelines / open
   questions). Mono-typeface label + icon + thin separator below. */
function SubKicker({ label, Icon, accent }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap: 6,
      marginBottom: 6,
      paddingBottom: 4,
      borderBottom: "1px solid var(--line)",
    }}>
      <Icon size={11} color={accent} aria-hidden />
      <span style={{
        fontFamily:"var(--mono)", fontSize: 9.5, fontWeight: 700,
        color: accent, letterSpacing: ".08em", textTransform: "uppercase",
      }}>{label}</span>
    </div>
  );
}

export { ResearchBlock };
