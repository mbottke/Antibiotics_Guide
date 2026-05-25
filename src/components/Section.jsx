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

function Section({ kicker, title, icon: Icon, children, sticky, testId, id }) {
  return (
    <section data-testid={testId} id={id} style={{ marginBottom: 18, scrollMarginTop: 96 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom: 10 }}>
        {kicker && (
          <span style={{
            fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".14em",
            textTransform: "uppercase", color: "var(--ox)", fontWeight: 700,
            display:"inline-flex", alignItems:"center", gap:6,
          }}>
            {Icon && <Icon size={12} />} {kicker}
          </span>
        )}
        {title && (
          <h3 style={{ fontFamily:"var(--serif)", fontSize:17, fontWeight:600, margin:0, color:"var(--ink)" }}>
            {title}
          </h3>
        )}
      </div>
      <div style={{
        background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12,
        padding: sticky ? "18px 18px 16px" : 16,
        /* Wave 6 W6-B · resting card elevation. Subtle by default; the
           "sticky" Start section (anchored first impression) gets the
           e2 shadow + the oxblood top stripe to feel anchored. */
        boxShadow: sticky ? "var(--shadow-e2)" : "var(--shadow-e1)",
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
