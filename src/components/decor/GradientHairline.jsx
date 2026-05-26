/* component · GradientHairline — Wave 7 W7-A decorative linework.

   A 1px horizontal divider whose colour is a soft gradient rather than
   a flat rule. Modern app shells (Linear, Vercel, Pitch) lean on this
   trick to suggest depth without committing to a hard border. We use
   it between sections of editorial hero content and at the seam of
   high-emphasis modules where a single solid line would feel heavy.

   The `withDot` variant adds a tiny 8px filled circle at the mid-point
   — a vestigial "knot" in the line — that lets us mark transitions
   inside a single section (e.g., between a question and its answer
   layers) without resorting to a heading or chip.

   Variants map to gradient combinations that match the neon accent
   tokens introduced in Wave 6:
     • default        — neutral, neutral line token
     • cyan-blue      — cool / informational
     • blue-magenta   — deep / decisional
     • magenta-lime   — punchy / call-out

   Tokens use a `var(--ox)` fallback so the component remains rendered
   if a consumer hasn't loaded the neon palette yet.

   USAGE
     <GradientHairline />
     <GradientHairline variant="cyan-blue" withDot />
     <GradientHairline variant="magenta-lime" style={{ margin: "32px 0" }} /> */

import React from "react";

const GRADIENT = {
  default:
    "linear-gradient(90deg, transparent, var(--line), transparent)",
  "cyan-blue":
    "linear-gradient(90deg, transparent, var(--neon-cyan, var(--ox)), var(--electric-blue, var(--ox)), transparent)",
  "blue-magenta":
    "linear-gradient(90deg, transparent, var(--electric-blue, var(--ox)), var(--hot-magenta, var(--ox)), transparent)",
  "magenta-lime":
    "linear-gradient(90deg, transparent, var(--hot-magenta, var(--ox)), var(--electric-lime, var(--ox)), transparent)",
};

export function GradientHairline({
  variant = "default",
  withDot = false,
  className,
  style,
}) {
  const gradient = GRADIENT[variant] || GRADIENT.default;
  return (
    <div
      role="separator"
      aria-hidden="true"
      data-variant={variant}
      className={className}
      style={{
        position: "relative",
        height: 1,
        width: "100%",
        background: gradient,
        margin: "16px 0",
        pointerEvents: "none",
        ...style,
      }}
    >
      {withDot && (
        <span
          data-testid="gradient-hairline-dot"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--neon-cyan, var(--ox))",
            boxShadow: "var(--neon-cyan-glow, 0 0 0 transparent)",
          }}
        />
      )}
    </div>
  );
}

export default GradientHairline;
