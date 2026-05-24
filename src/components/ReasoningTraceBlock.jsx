/* component · ReasoningTraceBlock — Phase D1 reasoning surface.
   Renders the syndrome's authored "why this regimen / which guideline
   governs / why not the alternative" trace inline above DurationBlock
   in the Answer Canvas. Closes the gap between WHAT the regimen is
   (Start now → tiers + cards) and HOW LONG it runs (DurationBlock):
   the user reads "what + why + why not" before they see "how long".

   The block renders three labeled rows:
     - Why this regimen      → rationale.driver
     - Governing guideline   → rationale.guideline (Cite ids resolved inline)
     - Why not the alternative → rationale.rejected

   Citation-id parsing for the guideline row: the authored string may
   embed a citation token like `[cite:cap]`. The token is resolved
   through the existing Cite primitive at render time — keeps citation
   strings authoring-light and means the GUIDELINES registry stays the
   single source of provenance truth (no duplicate citation copy).

   Renders nothing when the syndrome has no rationale yet — Phase D1
   rolls out incrementally (first ~10 syndromes authored at apex bar
   by D1.1; the rest follow). Graceful-fallback contract matches every
   other depth layer (Research, Regional, Novel, Surge, etc.).

   Visual rhythm matches ResearchBlock / CombinedRisksBlock — shared
   Section chrome (kicker outside the panel), oxblood accent, **bold**
   parser for inline emphasis.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { Compass, ArrowRight, BookOpen, MinusCircle } from "lucide-react";
import { Section } from "./Section.jsx";
import { Cite } from "./primitives.jsx";

/* Bold-callout parser — shared shape with ResearchBlock /
   CombinedRisksBlock / RegimenOptions. */
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

/* Inline `[cite:id]` token parser. Splits the segment into runs of
   plain text and resolved Cite elements. Keeps the authored guideline
   string short — the registry holds the body / year / title. */
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

/* Render a rationale string with bold + inline citation resolution. */
function RationaleText({ text, accent, onCite, keyPrefix }) {
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

/* One labeled row — uppercase mono kicker on left, rationale prose on
   the right. Severity-tinted leading icon distinguishes the three rows
   at a glance: driver (Compass / ox), guideline (BookOpen / ox),
   rejected (MinusCircle / ink2 muted). */
function TraceRow({ Icon, label, text, accent, mutedTint, onCite, keyPrefix }) {
  return (
    <li style={{
      display:"grid",
      gridTemplateColumns: "auto 1fr",
      gap: 11,
      alignItems: "flex-start",
      padding: "9px 11px",
      background: mutedTint ? "var(--paper2)" : "var(--paper)",
      border: "1px solid var(--line)",
      borderLeft: "3px solid " + (mutedTint ? "var(--line2)" : accent),
      borderRadius: 7,
    }}>
      <div style={{
        display:"flex", flexDirection:"column", alignItems:"center", gap: 3,
        paddingTop: 1, minWidth: 56,
      }}>
        <Icon size={13} color={mutedTint ? "var(--ink2)" : accent} aria-hidden />
        <span style={{
          fontFamily:"var(--mono)", fontSize: 8.5, fontWeight: 700,
          color: mutedTint ? "var(--ink2)" : accent,
          letterSpacing:".06em", textTransform:"uppercase",
          textAlign:"center", lineHeight: 1.15,
        }}>{label}</span>
      </div>
      <div style={{ fontSize: 12.5, lineHeight: 1.55, color:"var(--ink)", minWidth: 0 }}>
        <RationaleText text={text} accent={accent} onCite={onCite} keyPrefix={keyPrefix} />
      </div>
    </li>
  );
}

function ReasoningTraceBlock({ rationale, onCite }) {
  if(!rationale) return null;
  const { driver, guideline, rejected } = rationale;
  if(!driver && !guideline && !rejected) return null;

  const accent = "var(--ox)";

  return (
    <Section kicker="Why · Reasoning trace" icon={Compass} testId="reasoning-trace-block">
      <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:6 }}>
        {driver && (
          <TraceRow
            Icon={ArrowRight}
            label="Why this regimen"
            text={driver}
            accent={accent}
            onCite={onCite}
            keyPrefix="rt-driver"
          />
        )}
        {guideline && (
          <TraceRow
            Icon={BookOpen}
            label="Governing guideline"
            text={guideline}
            accent={accent}
            onCite={onCite}
            keyPrefix="rt-gl"
          />
        )}
        {rejected && (
          <TraceRow
            Icon={MinusCircle}
            label="Why not the alt"
            text={rejected}
            accent={accent}
            mutedTint
            onCite={onCite}
            keyPrefix="rt-rej"
          />
        )}
      </ul>
    </Section>
  );
}

export { ReasoningTraceBlock };
