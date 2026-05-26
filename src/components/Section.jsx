/* component · Section — shared section chrome.
   Renders the kicker (small uppercase mono label with optional icon)
   OUTSIDE the panel box, then the panel itself (rounded border,
   padding, optional sticky orange top stripe). All page sections —
   Start now, Stop at 48–72 h, Duration, Monitoring, Current state,
   Pearls — render through this so the visual rhythm stays constant
   and the only thing that differs between sections is the content.

   Extracted from AnswerCanvas in Phase D2 v3 to enforce consistent
   formatting across the page: prior to this, DurationBlock and
   MonitoringBlock invented their own internal title strips, which
   broke the kicker-outside-the-box pattern and looked inconsistent.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { SectionGlyph } from "./SectionGlyph.jsx";

function Section({ kicker, title, icon: Icon, glyph, children, sticky, testId, id }) {
  return (
    <section data-testid={testId} id={id} style={{ marginBottom: 22, scrollMarginTop: 96 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: 12 }}>
        {/* Wave 6 W6-B integration · SectionGlyph fleuron sits to the
            left of the kicker text when a group is provided. Decorative,
            aria-hidden — adds editorial-magazine character without
            crowding the label. */}
        {glyph && <SectionGlyph group={glyph} size={14} />}
        {kicker && (
          <span className="rx-eyebrow" style={{
            display:"inline-flex", alignItems:"center", gap:6, margin: 0,
          }}>
            {Icon && <Icon size={12} />} {kicker}
          </span>
        )}
        {title && (
          <h3 style={{ fontFamily:"var(--serif)", fontSize:18, fontWeight:600, margin:0, color:"var(--ink)", letterSpacing:"-.012em" }}>
            {title}
          </h3>
        )}
      </div>
      <div style={{
        background:"var(--panel)", border:"1px solid var(--line)", borderRadius:14,
        padding: sticky ? "20px 20px 18px" : 18,
        boxShadow: sticky ? "var(--shadow-e2)" : "var(--shadow-e1)",
        transition: "box-shadow var(--duration-base) var(--ease-out)",
        ...(sticky ? {
          borderTop:"3px solid var(--ox)",
        } : {}),
      }}>
        {children}
      </div>
    </section>
  );
}

export { Section };
