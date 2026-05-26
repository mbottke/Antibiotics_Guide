/* component · DensityToggle (Wave 7 W7-A) — three-state segmented pill
   that flips between compact / comfortable / spacious. Drives a
   `data-density` attribute on <html> via the useDensity hook so the
   App-level CSS can react with attribute selectors.

   Visual: three pill-shaped buttons joined as a single segmented
   control. Active = neon-cyan fill (with var(--ox) fallback) + white
   ink; inactive = transparent + var(--ink2). Mono uppercase labels
   keep the rhythm of the surrounding chrome.

   Behavior:
     • aria-pressed on the active button (role="group" wrapper).
     • Clicking writes the value through useDensity, which persists
       to localStorage and updates documentElement.
     • Reduced-motion users get no transition.

   Pure presentational — no integration. The integrator places this
   wherever the bedside shell wants a density affordance.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { useDensity } from "./util/useDensity.js";
import { useReducedMotion } from "./util/useReducedMotion.js";

const OPTIONS = [
  { value: "compact",     label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "spacious",    label: "Spacious" },
];

function DensityToggle({ className, style }) {
  const { density, setDensity } = useDensity();
  const reducedMotion = useReducedMotion();

  const transition = reducedMotion
    ? "none"
    : "background var(--duration-fast, 120ms) var(--ease-out, ease-out), color var(--duration-fast, 120ms) var(--ease-out, ease-out), border-color var(--duration-fast, 120ms) var(--ease-out, ease-out)";

  return (
    <div
      role="group"
      aria-label="Density"
      data-testid="density-toggle"
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0,
        border: "1px solid var(--line)",
        borderRadius: 999,
        padding: 2,
        background: "var(--paper, transparent)",
        ...(style || {}),
      }}>
      {OPTIONS.map((opt) => {
        const active = density === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            data-density-value={opt.value}
            onClick={() => setDensity(opt.value)}
            style={{
              flex: "0 0 auto",
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              fontWeight: active ? 700 : 500,
              color: active ? "#fff" : "var(--ink2)",
              background: active ? "var(--neon-cyan, var(--ox))" : "transparent",
              border: "1px solid " + (active ? "var(--neon-cyan, var(--ox))" : "transparent"),
              borderRadius: 999,
              padding: "5px 12px",
              cursor: "pointer",
              transition,
              boxShadow: active ? "var(--neon-cyan-glow, 0 0 0 transparent)" : "none",
            }}>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export { DensityToggle };
export default DensityToggle;
