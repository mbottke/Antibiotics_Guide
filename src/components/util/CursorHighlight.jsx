/* component/util · CursorHighlight — Wave 6 W6-B aesthetic.

   Adopt-by-replacing wrapper for cursor-aware microinteractions. Any
   existing block can become cursor-aware by wrapping its outer div:

     // before
     <div className="rx-card"> ... </div>

     // after
     <CursorHighlight className="rx-card"> ... </CursorHighlight>

   The wrapper renders three layers:
     1. a positioned host that carries the CSS custom properties
        (`--cursor-x`, `--cursor-y`, `--cursor-active`) updated by the
        hook on mousemove,
     2. an absolutely-positioned overlay (`pointer-events: none`) that
        paints a soft radial gradient at the cursor position — this is
        the visible glow,
     3. a relative child container that re-stacks the children on top
        of the overlay so the gradient sits behind content.

   The default color is `rgba(122, 27, 30, 0.10)` — soft oxblood at
   10% alpha, matching the brand spine. The default radius is 120px.

   Accessibility:
     - The overlay carries `aria-hidden` and `pointer-events: none` —
       it never appears to assistive tech and never intercepts clicks.
     - On `prefers-reduced-motion: reduce` and `(pointer: coarse)`,
       the hook short-circuits — the overlay still mounts but never
       receives `--cursor-active: 1`, so it stays invisible. */
import React, { useRef } from "react";
import { useCursorHighlight } from "./useCursorHighlight.js";

const DEFAULT_COLOR = "rgba(122, 27, 30, 0.10)";
const DEFAULT_RADIUS = 120;
const FADE_TRANSITION = "opacity 200ms cubic-bezier(0.16, 1, 0.3, 1)";

export function CursorHighlight({
  children,
  color = DEFAULT_COLOR,
  radius = DEFAULT_RADIUS,
  className = "",
  style,
  enabled = true,
  ...rest
}) {
  const ref = useRef(null);
  useCursorHighlight(ref, { enabled });

  const hostStyle = {
    position: "relative",
    overflow: "hidden",
    "--cursor-highlight-color": color,
    "--cursor-highlight-radius": radius + "px",
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
  };

  return (
    <div
      ref={ref}
      className={("rx-cursor-highlight " + className).trim()}
      style={hostStyle}
      {...rest}
    >
      <div aria-hidden="true" style={overlayStyle} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
