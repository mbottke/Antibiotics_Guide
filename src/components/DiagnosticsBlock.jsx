/* component · DiagnosticsBlock — Wave 5 PR-6 diagnostic stewardship.

   Renders the "what to order before / alongside empiric therapy"
   surface. Sits BEFORE the regimen in the Answer Canvas (workup
   precedes empiric — a contract). Visual language and severity
   vocabulary mirror MonitoringBlock so the entire app speaks one
   severity grammar.

   Categories rendered in fixed order: cultures → biomarkers →
   panels → imaging → biopsy. Empty / missing categories are
   skipped silently; the block renders null when no categories
   are populated.

   Severity (identical to MonitoringBlock):
     required → red "REQUIRED" badge (must-order)
     trigger  → amber "TRIGGER" badge (conditional)
     consider → muted "CONSIDER" badge (optional escalation)

   matchCtx items get a left-border accent + "MATCHES" chip when
   the patient ctx fires the predicate — never hidden, only
   elevated (the safety contract documented in monitoringBlock).

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { FlaskConical } from "lucide-react";
import { Section } from "./Section.jsx";
import { matchesCtx } from "../engines/ctxMatch.js";
import { RichText } from "./util/richText.jsx";
import { severityStyle } from "./util/severityStyle.js";

const CATEGORY_LABELS = {
  cultures:   "Cultures",
  biomarkers: "Biomarkers",
  panels:     "Rapid panels",
  imaging:    "Imaging",
  biopsy:     "Biopsy / tissue",
};

const CATEGORY_ORDER = ["cultures", "biomarkers", "panels", "imaging", "biopsy"];

function itemMatchesCtx(item, ctx) {
  return !!(item.matchCtx && matchesCtx(item.matchCtx, ctx));
}

function DiagnosticItem({ item, matched }) {
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
      {/* W10 · neon light-ring leads the severity column so this block
          speaks the same severity grammar as MonitoringBlock /
          OPATBlock — three deliberate glow levels above the icon. */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        paddingTop: 1,
      }}>
        <span className={
          item.sev === "required" ? "rx-light-ring-red"
          : item.sev === "trigger" ? "rx-light-ring-amber"
          : "rx-light-ring-cyan"
        } aria-hidden style={{ width: 6, height: 6, borderWidth: 1.5, marginBottom: 1, opacity: 0.85 }} />
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
            <RichText text={item.what} accentColor={sty.color} accentBg={sty.bg !== "transparent" ? sty.bg : undefined} />
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

function DiagnosticsBlock({ diagnostics, ctx }) {
  if(!diagnostics) return null;

  const accent = "var(--ox)";
  const accentBg = "rgba(15, 76, 129, 0.08)";

  /* Filter to non-empty categories, preserving the canonical order. */
  const sections = CATEGORY_ORDER
    .map(key => ({ key, items: Array.isArray(diagnostics[key]) ? diagnostics[key] : [] }))
    .filter(s => s.items.length > 0);

  if(sections.length === 0) return null;

  const matchedTotal = sections.reduce((sum, s) =>
    sum + s.items.filter(i => itemMatchesCtx(i, ctx)).length, 0);

  return (
    <Section kicker="Workup · What to order first" icon={FlaskConical} glyph="core" testId="diagnostics-block">
      {matchedTotal > 0 && (
        <div style={{ marginBottom: 10, display: "flex", justifyContent: "flex-end" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontFamily: "var(--mono)", fontSize: 9, letterSpacing: ".08em",
            textTransform: "uppercase", fontWeight: 600, color: accent,
            background: accentBg, padding: "2px 7px", borderRadius: 4,
            border: "1px solid var(--ox-line)",
          }}>
            {/* Wave 10 — cyan light-ring on the matches counter, matching
                MonitoringBlock + OPATBlock so the entire "matched for
                this patient" grammar speaks with one neon dot. */}
            <span className="rx-light-ring-cyan" aria-hidden style={{ width: 8, height: 8 }} />
            {matchedTotal} {matchedTotal === 1 ? "match" : "matches"} for selection
          </span>
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {sections.map(({ key, items }) => {
          /* Within each category, surface matched items first (still
             visible alongside the rest — never hidden). */
          const decorated = items.map(i => ({ item: i, matched: itemMatchesCtx(i, ctx) }));
          decorated.sort((a, b) => (b.matched ? 1 : 0) - (a.matched ? 1 : 0));
          return (
            <div key={key}>
              <div style={{
                fontFamily: "var(--mono)", fontSize: 9.5, fontWeight: 700,
                color: "var(--ink2)", letterSpacing: ".08em",
                textTransform: "uppercase", marginBottom: 6,
              }}>
                {CATEGORY_LABELS[key]}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 5 }}>
                {decorated.map((d, i) => (
                  <DiagnosticItem key={`${key}-${i}`} item={d.item} matched={d.matched} />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

export { DiagnosticsBlock };
