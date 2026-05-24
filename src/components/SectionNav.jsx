/* component · SectionNav — Phase B1 of the Wave 2 reference restructure.
   The 5-section primary nav that replaces the flat 11-tab bar. Sits
   ABOVE the section-scoped tab sub-nav so the user picks the question
   class first ("Am I looking up a syndrome? An agent? An organism?")
   and then narrows inside the section.

   Visual rhythm matches SurfaceBar (the surface/mode picker above):
   pill-shaped buttons in a horizontal row, active = filled oxford blue,
   inactive = outlined. Each button shows the section icon + label and
   carries a title-tooltip with the section's hint.

   Mobile (< 760 px): the row scrolls horizontally rather than wrapping,
   so the nav stays compact on phones. Keyboard: Tab through, Enter or
   Space to select. ⌘K palette indexes section names too (Phase B7).

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { SECTIONS } from "../data/sections.js";

function SectionNav({ section, onSection }) {
  return (
    <nav
      role="tablist"
      aria-label="Reference sections"
      data-testid="section-nav"
      style={{
        background: "var(--paper)",
        borderBottom: "1px solid var(--line)",
      }}>
      <div
        className="rx-section-nav-row"
        style={{
          maxWidth: 1180, margin: "0 auto",
          padding: "10px 22px",
          display: "flex", alignItems: "center", gap: 6,
          overflowX: "auto",
          scrollbarWidth: "thin",
        }}>
        <span style={{
          fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".14em",
          textTransform: "uppercase", color: "var(--muted)", fontWeight: 600,
          flex: "0 0 auto", marginRight: 4,
        }}>Section</span>
        {SECTIONS.map(s => {
          const active = section === s.id;
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`section-${s.id}`}
              title={s.hint}
              onClick={() => onSection && onSection(s.id)}
              style={{
                flex: "0 0 auto",
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: "var(--sans)", fontSize: 13, fontWeight: active ? 700 : 500,
                color: active ? "#fff" : "var(--ink2)",
                background: active ? "var(--ox)" : "transparent",
                border: "1px solid " + (active ? "var(--ox)" : "var(--line)"),
                borderRadius: 8,
                padding: "6px 12px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background .12s, color .12s, border-color .12s",
              }}>
              <Icon size={14} aria-hidden /> {s.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export { SectionNav };
