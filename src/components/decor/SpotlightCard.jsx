/* component/decor · SpotlightCard — Wave 9 combined cursor highlight + tilt wrapper.

   Adopt-by-replacing wrapper that combines the Wave-6 cursor highlight
   with the Wave-9 3D tilt. Use it where a single card needs the full
   premium-microinteraction treatment without per-component glue:

     <SpotlightCard variant="cyan" tilt intensity={6}>
       <h3>title</h3> <p>body</p>
     </SpotlightCard>

   The wrapper renders:
     1. a positioned host carrying the cursor CSS custom properties
        + the 3D tilt transform (via useTilt),
     2. an absolutely-positioned spotlight overlay (`pointer-events: none`)
        whose radial-gradient paints at --cursor-x/--cursor-y,
     3. a relative-z child container that stacks above the overlay.

   Variants:
     cyan     — neon-cyan tint (default)
     magenta  — hot-magenta tint
     lime     — fluorescent-lime tint

   `intensity` (1–10) scales BOTH the tilt rotation AND the spotlight
   radius — a 10 means stronger lean + a bigger halo. Default 5.

   Accessibility:
     - Spotlight + tilt are hook-gated by prefers-reduced-motion + coarse
       pointer. The wrapper still mounts but stays flat / dark on those
       configurations.
     - Overlay carries aria-hidden + pointer-events:none. */
import React, { useRef } from "react";
import { useCursorHighlight } from "../util/useCursorHighlight.js";
import { useTilt } from "../util/useTilt.js";

const VARIANT_COLOR = {
  cyan:    "color-mix(in srgb, var(--neon-cyan, var(--ox-bright)) 16%, transparent)",
  magenta: "color-mix(in srgb, var(--hot-magenta, var(--ox-bright)) 16%, transparent)",
  lime:    "color-mix(in srgb, var(--fluo-lime, var(--ox-bright)) 16%, transparent)",
};

const FADE_TRANSITION = "opacity 200ms cubic-bezier(0.16, 1, 0.3, 1)";

export function SpotlightCard({
  children,
  variant = "cyan",
  tilt = true,
  intensity = 5,
  className = "",
  style,
  enabled = true,
  ...rest
}) {
  const ref = useRef(null);
  // Clamp intensity to [1,10] and derive both spotlight + tilt amounts.
  const i = Math.max(1, Math.min(10, intensity));
  const tiltDeg = i * 1.2;         // intensity 5 → 6deg
  const spotRadius = 160 + i * 16; // intensity 5 → 240px
  const color = VARIANT_COLOR[variant] || VARIANT_COLOR.cyan;

  useCursorHighlight(ref, { enabled });
  useTilt(ref, { intensity: tiltDeg, enabled: enabled && tilt });

  const hostStyle = {
    position: "relative",
    overflow: "hidden",
    "--cursor-highlight-color": color,
    "--cursor-highlight-radius": spotRadius + "px",
    "--cursor-x": "50%",
    "--cursor-y": "50%",
    "--cursor-active": 0,
    ...style,
  };

  const overlayStyle = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background:
      "radial-gradient(var(--cursor-highlight-radius) circle at "
      + "var(--cursor-x) var(--cursor-y), "
      + "var(--cursor-highlight-color) 0%, transparent 60%)",
    opacity: "var(--cursor-active)",
    transition: FADE_TRANSITION,
    borderRadius: "inherit",
  };

  return (
    <div
      ref={ref}
      data-spotlight-variant={variant}
      data-spotlight-tilt={tilt ? "true" : "false"}
      className={("rx-spotlight-card " + className).trim()}
      style={hostStyle}
      {...rest}
    >
      <div aria-hidden="true" style={overlayStyle} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

export default SpotlightCard;
