/* component · NotchedBanner — Wave 9 W9 decorative shape.

   A severity banner with clipped corners — top-left and bottom-right
   corners cut diagonally at 45deg. The shape reads as "warning tape"
   or "industrial label" and gives the severity grammar (required /
   trigger / consider / stable / info) a more deliberate physical
   presence than a flat rounded rect.

   Implementation uses CSS `clip-path: polygon(...)` so the cut is
   honest geometry rather than a faked overlay; box-shadow + border
   work alongside the clip without being clipped themselves only
   because the polygon describes the visible region — a small visual
   compromise that buys cross-browser support without SVG.

   Variants map onto the project's existing semantic color tokens:
     required  — vivid-red    (hard-stop, must-do)
     trigger   — neon-amber   (conditional, branch-dependent)
     consider  — electric-blue (optional escalation / soft signal)
     stable    — electric-lime (resolution / green-light)
     info      — neon-cyan    (neutral informational)

   Inner anatomy:
     • 28×28 gradient icon tile on the left (rounded, faint glow)
     • 13px sans-serif primary label (uppercase weight-700)
     • optional 11px mono small-caps secondary line

   USAGE
     <NotchedBanner severity="required" label="Reassess at 48–72 h" />
     <NotchedBanner severity="trigger" label="MRSA risk" secondary="Add vancomycin" />
     <NotchedBanner severity="info" label="Bioavailability">…</NotchedBanner>

   Inpatient Antibiotic Guide — module graph documented in README.md. */

import React from "react";

const NOTCH = 12;
const CLIP_PATH = `polygon(${NOTCH}px 0, 100% 0, 100% calc(100% - ${NOTCH}px), calc(100% - ${NOTCH}px) 100%, 0 100%, 0 ${NOTCH}px)`;

const VARIANT = {
  // W12 a11y · banner TEXT (`color`) must clear 4.5:1 on the pale tinted
  // bg, so the readable label uses the darker semantic counterpart
  // (red / amber / ox / stable-sage). The neon hue continues to drive
  // the tile gradient + outer glow (decorative roles), which is where
  // the look-here pop actually lives.
  required: {
    color: "var(--red, #d33)",
    bg:    "var(--red-soft, rgba(211, 51, 51, 0.08))",
    line:  "var(--red-line, rgba(211, 51, 51, 0.32))",
    glow:  "0 0 0 1px rgba(211, 51, 51, 0.18), 0 6px 18px -8px rgba(211, 51, 51, 0.45)",
    tileGradient: "linear-gradient(135deg, var(--vivid-red, #d33), var(--red, #d33))",
  },
  trigger: {
    color: "var(--amber, #c89)",
    bg:    "var(--amber-soft, rgba(200, 137, 51, 0.08))",
    line:  "var(--amber-line, rgba(200, 137, 51, 0.32))",
    glow:  "0 0 0 1px rgba(200, 137, 51, 0.18), 0 6px 18px -8px rgba(200, 137, 51, 0.45)",
    tileGradient: "linear-gradient(135deg, var(--neon-amber, #f3a83a), var(--amber, #c89))",
  },
  consider: {
    color: "var(--ox, #0F4C81)",
    bg:    "var(--blue-soft, rgba(15, 76, 129, 0.08))",
    line:  "var(--blue-line, rgba(15, 76, 129, 0.32))",
    glow:  "0 0 0 1px rgba(15, 76, 129, 0.16), 0 6px 18px -8px rgba(15, 76, 129, 0.4)",
    tileGradient: "linear-gradient(135deg, var(--electric-blue, #2D7EF7), var(--ox, #0F4C81))",
  },
  stable: {
    color: "var(--stable-sage, var(--green, #2c7a4a))",
    bg:    "var(--green-soft, rgba(44, 122, 74, 0.08))",
    line:  "var(--green-line, rgba(44, 122, 74, 0.32))",
    glow:  "0 0 0 1px rgba(44, 122, 74, 0.16), 0 6px 18px -8px rgba(44, 122, 74, 0.4)",
    tileGradient: "linear-gradient(135deg, var(--electric-lime, #a6e22e), var(--green, #2c7a4a))",
  },
  info: {
    color: "var(--ox, #0F4C81)",
    bg:    "var(--neon-cyan-soft, rgba(0, 212, 255, 0.10))",
    line:  "var(--neon-cyan-line, rgba(0, 212, 255, 0.32))",
    glow:  "0 0 0 1px rgba(0, 212, 255, 0.18), 0 6px 18px -8px rgba(0, 212, 255, 0.4)",
    tileGradient: "linear-gradient(135deg, var(--neon-cyan, #00D4FF), var(--electric-blue, #2D7EF7))",
  },
};

export function NotchedBanner({
  severity = "info",
  label,
  secondary,
  icon,                  // optional React node — rendered inside the 28×28 tile
  children,              // optional body content rendered below the label row
  className,
  style,
  notch = NOTCH,
  ...rest
}) {
  const v = VARIANT[severity] || VARIANT.info;
  /* Bad-prop tolerance — non-finite or negative notch falls back to the
     default so a stray NaN doesn't break the clip-path geometry. */
  const safeNotch = (typeof notch === "number" && Number.isFinite(notch) && notch >= 0) ? notch : NOTCH;
  const clip = safeNotch === NOTCH
    ? CLIP_PATH
    : `polygon(${safeNotch}px 0, 100% 0, 100% calc(100% - ${safeNotch}px), calc(100% - ${safeNotch}px) 100%, 0 100%, 0 ${safeNotch}px)`;

  return (
    <div
      data-severity={severity}
      data-notched-banner=""
      className={className}
      style={{
        position: "relative",
        background: v.bg,
        color: v.color,
        clipPath: clip,
        WebkitClipPath: clip,
        padding: "10px 14px",
        boxShadow: v.glow,
        // The clip-path eats the natural border, so we paint a 1px
        // inset frame using an outline + inset box-shadow combo on
        // a pseudo-free surface. We accept that the cut corners do
        // not carry the line; that's the look.
        transition: "box-shadow var(--duration-fast, .12s) var(--ease-out, ease-out)",
        ...style,
      }}
      {...rest}
    >
      <div style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
      }}>
        <span
          data-testid="notched-banner-tile"
          aria-hidden="true"
          style={{
            flex: "0 0 auto",
            width: 28,
            height: 28,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px 2px 8px 2px",
            background: v.tileGradient,
            color: "#fff",
            boxShadow: "0 2px 8px -2px rgba(0,0,0,0.25)",
          }}
        >
          {icon || null}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          {label && (
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              lineHeight: 1.3,
              color: v.color,
              letterSpacing: "0.005em",
            }}>{label}</div>
          )}
          {secondary && (
            <div style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1.4,
              color: "var(--ink2, #555)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginTop: 2,
            }}>{secondary}</div>
          )}
        </div>
      </div>
      {children && (
        <div style={{
          marginTop: 8,
          fontSize: 12,
          lineHeight: 1.5,
          color: "var(--ink, #1c1c1c)",
        }}>{children}</div>
      )}
    </div>
  );
}

export default NotchedBanner;
