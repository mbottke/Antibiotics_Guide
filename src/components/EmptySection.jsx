/* component · EmptySection — Wave 6 W6-B thoughtful empty-state surface.

   Render when a section's data layer returns null AND the absence is
   informative (vs trivially hidden). Conveys craft, not absence —
   "this syndrome doesn't surface a regional resistance overlay because
   the regional database has no high-impact patterns flagged" beats
   silently omitting the block.

   Use sparingly. The default is still "render nothing when there's
   nothing to say." This surface is for the cases where a clinician
   might LOOK for the section and need reassurance that it's not
   missing — it's just intentionally quiet for this syndrome.

   USAGE
     <EmptySection
       kicker="Regional resistance"
       icon={Globe}
       reason="No high-impact regional pattern flagged for this syndrome."
     />

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { Info } from "lucide-react";

export function EmptySection({ kicker, icon: Icon = Info, reason, hint }) {
  return (
    <section
      data-testid="empty-section"
      style={{
        marginTop: 16, marginBottom: 16,
        padding: "12px 14px",
        background: "var(--paper2)",
        border: "1px dashed var(--line)",
        borderRadius: 10,
        display: "flex", alignItems: "flex-start", gap: 10,
      }}
    >
      <Icon size={14} aria-hidden style={{ flex: "0 0 auto", marginTop: 2, color: "var(--ink2)" }} />
      <div style={{ minWidth: 0, fontSize: 12.5, lineHeight: 1.55, color: "var(--ink2)" }}>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 9.5, fontWeight: 700,
          letterSpacing: ".1em", textTransform: "uppercase",
          color: "var(--muted)", marginBottom: 4,
        }}>
          {kicker || "Note"}
        </div>
        <div style={{ color: "var(--ink)" }}>{reason}</div>
        {hint && (
          <div style={{
            fontSize: 11.5, color: "var(--muted)", marginTop: 4, fontStyle: "italic",
          }}>{hint}</div>
        )}
      </div>
    </section>
  );
}
