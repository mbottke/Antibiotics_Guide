/* component · Section — shared section chrome.

   Wave 7 W7-B aesthetic. Each section is a magazine spread:

     - Asymmetric 18/4 panel with a 64px cyan accent strip at the
       top-left corner.
     - Mono kicker outside the panel (uppercase, .14em letter-spacing,
       cyan accent dot beside the SectionGlyph).
     - Optional `number` prop (string like "01", "02") renders a
       240px italic-serif decorative numeral floated in the top-right
       behind content (8% opacity ink, pointer-events:none, aria-hidden).
     - Optional `railLabel` prop renders a 90deg-rotated mono label
       running up the left edge on viewports ≥ 1100px ("COVERAGE",
       "MONITORING", etc.).
     - On hover, the cyan strip lengthens and a subtle e2 ramp lifts
       the whole panel — same vocabulary as .rx-card-interactive.

   All page sections render through this so the visual rhythm stays
   constant. Inpatient Antibiotic Guide — module graph in README.md. */
import React from "react";
import { SectionGlyph } from "./SectionGlyph.jsx";

function Section({ kicker, title, icon: Icon, glyph, children, sticky, testId, id, number, railLabel }) {
  return (
    <section
      data-testid={testId}
      id={id}
      data-toc-section={id}
      style={{ marginBottom: 28, scrollMarginTop: 104, position: "relative" }}
    >
      {/* Vertical left-rail label — only on wide viewports. Pure decoration
          for the page-edge "magazine" feel; aria-hidden. */}
      {railLabel && (
        <span
          aria-hidden="true"
          className="rx-section-rail"
          style={{
            position: "absolute",
            left: -42, top: 28,
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "var(--ox-bright)",
            fontWeight: 700,
            pointerEvents: "none",
            opacity: 0.85,
          }}
        >
          {railLabel}
        </span>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        {glyph && <SectionGlyph group={glyph} size={16} />}
        {kicker && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8, margin: 0,
            fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 700,
            letterSpacing: ".22em", textTransform: "uppercase",
            color: "var(--ox)",
          }}>
            {Icon && <Icon size={12} aria-hidden />}
            {kicker}
          </span>
        )}
        {number && (
          <span style={{
            marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 10,
            letterSpacing: ".18em", textTransform: "uppercase",
            color: "var(--muted)",
          }}>
            {number}
          </span>
        )}
        {title && (
          <h3 style={{
            fontFamily: "var(--serif)", fontSize: "clamp(20px, 2.1vw, 26px)",
            fontWeight: 600, margin: 0, color: "var(--ink)", letterSpacing: "-.018em",
          }}>
            {title}
          </h3>
        )}
      </div>

      <div
        className="rx-section-panel"
        style={{
          position: "relative",
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: "18px 4px 18px 4px",
          padding: sticky ? "22px 22px 20px" : 20,
          boxShadow: sticky ? "var(--shadow-e2)" : "var(--shadow-e1)",
          transition: "box-shadow var(--duration-base) var(--ease-out), border-color var(--duration-base) var(--ease-out)",
          overflow: "hidden",
          ...(sticky ? { borderTop: "3px solid var(--ox-bright)" } : {}),
        }}
      >
        {/* Cyan accent strip — top-left, 64px wide, fades to transparent. */}
        <span aria-hidden="true" style={{
          position: "absolute", top: 0, left: 0, height: 2, width: 64,
          background: "linear-gradient(90deg, var(--ox-bright) 0%, transparent 100%)",
          borderRadius: "18px 0 0 0",
          pointerEvents: "none",
        }} />

        {/* Decorative numeral — only when `number` is provided. */}
        {number && (
          <span aria-hidden="true" style={{
            position: "absolute",
            top: -56, right: -12,
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 220,
            fontWeight: 600,
            color: "var(--ox-soft)",
            opacity: 0.55,
            lineHeight: 1,
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 0,
          }}>
            {number.replace(/^0/, "")}
          </span>
        )}

        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
      </div>
    </section>
  );
}

export { Section };
