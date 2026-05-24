/* component · ObjectionsBlock — Phase D2 pharmacist's-challenge surface.
   Renders the syndrome's authored objections (predictable pushback +
   pre-authored answers) inline beneath ReasoningTraceBlock so the user
   reads "what + why + why not" (D1) → "the pharmacist's pushback,
   pre-answered" (D2) → "how long" (DurationBlock).

   This is the moat content distinguishing the tool from Sanford / UTD:
   reference apps tell you what to prescribe but leave the bedside
   back-and-forth ("why not cefepime?" / "what about pip-tazo?")
   unanswered. The objection list pre-empts that conversation.

   Data shape: array of `{ q: string, a: string }` pairs on each
   syndrome's `objections:` field. The answer string may carry inline
   `[cite:id]` tokens resolved through the shared Cite primitive.
   Renders nothing on empty / missing data — graceful-fallback
   contract matches every other depth layer.

   Visual rhythm matches ReasoningTraceBlock / ResearchBlock — same
   Section chrome, oxblood accent, **bold** + inline-cite parsers.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { MessageCircleQuestion, ShieldCheck } from "lucide-react";
import { Section } from "./Section.jsx";
import { Cite } from "./primitives.jsx";

/* Bold-callout parser — shared shape with ReasoningTraceBlock /
   ResearchBlock / RegimenOptions. */
function parseBold(text) {
  if(!text) return [];
  const parts = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0, m;
  while((m = re.exec(text)) !== null) {
    if(m.index > last) parts.push({ kind:"text", value: text.slice(last, m.index) });
    parts.push({ kind:"bold", value: m[1] });
    last = m.index + m[0].length;
  }
  if(last < text.length) parts.push({ kind:"text", value: text.slice(last) });
  return parts;
}

/* Inline `[cite:id]` token parser — splits the segment into runs of
   plain text and resolved Cite elements. Mirrors ReasoningTraceBlock's
   resolver so authoring stays consistent across D1 + D2. */
function parseCites(segment, onCite, keyPrefix) {
  const out = [];
  const re = /\[cite:([a-z0-9_-]+)\]/gi;
  let last = 0, m, n = 0;
  while((m = re.exec(segment)) !== null) {
    if(m.index > last) out.push(segment.slice(last, m.index));
    out.push(
      <Cite
        key={`${keyPrefix}-c${n++}`}
        id={m[1]}
        onClick={onCite ? (cid) => onCite(cid) : undefined}
      />
    );
    last = m.index + m[0].length;
  }
  if(last < segment.length) out.push(segment.slice(last));
  return out;
}

/* Render an answer string with bold + inline citation resolution. */
function AnswerText({ text, accent, onCite, keyPrefix }) {
  if(!text) return null;
  return (
    <>
      {parseBold(text).map((p, i) => {
        const nodes = parseCites(p.value, onCite, `${keyPrefix}-${i}`);
        if(p.kind === "bold") {
          return (
            <span key={`${keyPrefix}-b${i}`} style={{ fontWeight: 700, color: accent }}>
              {nodes}
            </span>
          );
        }
        return <span key={`${keyPrefix}-t${i}`}>{nodes}</span>;
      })}
    </>
  );
}

/* One Q&A pair — question as a bold uppercase mono kicker, answer
   below as readable prose with inline citations. Card chrome echoes
   ResearchBlock so visual rhythm stays consistent. */
function ObjectionRow({ q, a, accent, onCite, keyPrefix }) {
  return (
    <li style={{
      display:"grid", gap: 6,
      padding: "9px 11px",
      background: "var(--paper)",
      border: "1px solid var(--line)",
      borderLeft: "3px solid " + accent,
      borderRadius: 7,
    }}>
      <div style={{ display:"flex", gap: 7, alignItems: "flex-start" }}>
        <MessageCircleQuestion size={12} color={accent} aria-hidden
          style={{ marginTop: 2, flex:"0 0 auto" }} />
        <span style={{
          fontFamily:"var(--mono)", fontSize: 10.5, fontWeight: 700,
          color: accent, letterSpacing:".06em", textTransform:"uppercase",
          lineHeight: 1.35,
        }}>{q}</span>
      </div>
      <div style={{
        display:"grid", gridTemplateColumns: "auto 1fr", gap: 7,
        alignItems: "flex-start",
      }}>
        <ShieldCheck size={12} color="var(--ink2)" aria-hidden
          style={{ marginTop: 3, flex:"0 0 auto" }} />
        <div style={{ fontSize: 12.5, lineHeight: 1.55, color:"var(--ink)", minWidth: 0 }}>
          <AnswerText text={a} accent={accent} onCite={onCite} keyPrefix={keyPrefix} />
        </div>
      </div>
    </li>
  );
}

function ObjectionsBlock({ objections, onCite }) {
  if(!objections || !Array.isArray(objections) || objections.length === 0) return null;
  const rows = objections.filter(o => o && o.q && o.a);
  if(rows.length === 0) return null;

  const accent = "var(--ox)";

  return (
    <Section kicker="Challenge · Pharmacist's pushback, pre-answered"
      icon={MessageCircleQuestion} testId="objections-block">
      <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:7 }}>
        {rows.map((o, i) => (
          <ObjectionRow
            key={`obj-${i}`}
            q={o.q}
            a={o.a}
            accent={accent}
            onCite={onCite}
            keyPrefix={`obj-${i}`}
          />
        ))}
      </ul>
    </Section>
  );
}

export { ObjectionsBlock };
