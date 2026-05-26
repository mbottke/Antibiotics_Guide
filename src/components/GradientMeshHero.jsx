/* component · GradientMeshHero — Wave 7 W7-A aesthetic.

   An animated mesh-gradient hero block for the Inpatient Antibiotic Guide's
   Answer Canvas. Where EditorialHero is the magazine spread, this is the
   Stripe.com / Vercel.com / Linear.app school: a slowly-drifting field of
   soft colored blurs behind sharp, oversized typography. Composition:

     1. Mesh background — 5 absolutely-positioned radial-gradient blobs in
        the new mesh-* palette (cyan / blue / magenta / lime), each drifting
        at its own ease-in-out cadence between 28s and 44s. Pointer-events
        disabled; blur(48px) per blob produces the diffused mesh feel.
     2. Glass fog — an optional backdrop-filtered scrim with near-white
        tint that softens the mesh into a readable fog beneath typography.
     3. Typography — a mono kicker in neon cyan, an oversized sans display
        headline (the "BIG type moment"), an italic serif standfirst, and
        a row of glassmorphic patient chips.
     4. Decorative numeral — a 240px italic numeric anchored top-right at
        8% opacity, in neon cyan; pure decoration, aria-hidden.
     5. Bottom hairline — a 1px transparent→cyan→transparent gradient
        line acting as the bottom border of the block.

   The mesh blobs use CSS-only animation; users with `prefers-reduced-motion`
   see a static gradient (the keyframes resolve to `none`). All neon and
   mesh tokens reference CSS variables that the parallel neon-color-reframe
   agent introduces; if any are missing the property simply falls back to
   nothing, never throwing. Pointer-events on every decorative layer are
   `none` so the typography stack remains the only interactive surface.

   USAGE
     <GradientMeshHero
       kicker="01 / Bedside"
       counter="01 / 17"
       syndromeName="Sepsis / septic shock"
       syndromeLine="Empiric pip-tazo within the first hour; narrow at 48 h."
       patientChips={[
         { label: "72M",     tone: "neutral" },
         { label: "CrCl 35", tone: "cyan" },
         { label: "MRSA",    tone: "amber" },
       ]}
       decorativeNumber="1"
       onEditCase={() => setEditing(true)}
     />

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useEffect, useRef } from "react";
import { Pencil } from "lucide-react";
import { useTilt } from "./util/useTilt.js";

/* ---------- mesh blob configuration ----------
   Five radial-gradient blobs at distinct origin points, each with its
   own keyframed drift. Sizes are stop-percentages on the radial gradient
   (the point at which it fades to transparent), tuned so blobs overlap
   to form a fluid mesh rather than reading as discrete shapes. */
const BLOBS = [
  { color: "var(--mesh-cyan-anchor)",    x: "15%", y: "20%", size: "45%", animation: "meshDriftA 28s ease-in-out infinite" },
  { color: "var(--mesh-blue-anchor)",    x: "85%", y: "10%", size: "50%", animation: "meshDriftB 36s ease-in-out infinite" },
  { color: "var(--mesh-magenta-anchor)", x: "75%", y: "75%", size: "40%", animation: "meshDriftC 32s ease-in-out infinite" },
  { color: "var(--mesh-lime-anchor)",    x: "20%", y: "85%", size: "35%", animation: "meshDriftD 40s ease-in-out infinite" },
  { color: "var(--mesh-cyan-anchor)",    x: "50%", y: "50%", size: "60%", animation: "meshDriftE 44s ease-in-out infinite" },
];

/* ---------- chip palette ----------
   Glassmorphic chip tones; each maps to a text color + an outline color.
   When the neon-* tokens aren't present on the branch (e.g., during CI
   before the parallel neon-color-reframe agent lands), the fallback to
   the existing ox/amber/red token family keeps every chip visible. */
const CHIP_TONES = {
  // W12 a11y · chip TEXT must meet body-text contrast on the glassmorphic
  // paper-ish background. Neon hues live in the BORDERS (decorative role —
  // glow, accent line); the readable label uses the darker semantic
  // counterpart (ox / amber / red / stable-sage / ink2) so contrast holds.
  cyan:    { color: "var(--ox)",            border: "var(--neon-cyan-line, var(--ox-line))" },
  amber:   { color: "var(--amber)",         border: "var(--neon-amber-line, var(--amber-line))" },
  red:     { color: "var(--red)",           border: "var(--vivid-red-line, var(--red-line))" },
  lime:    { color: "var(--stable-sage)",   border: "var(--electric-lime-line, var(--ox-line))" },
  neutral: { color: "var(--ink2)",          border: "var(--line)" },
};

/* ---------- keyframes ----------
   Each blob drifts on its own translate cycle. Amplitudes stay between
   ±5% and ±10% so the mesh feels alive but never frantic — a slow exhale
   rather than a swirl. The `prefers-reduced-motion` block zeroes every
   animation; the blob then sits at its static origin point. */
const MESH_KEYFRAMES = `
  @keyframes meshDriftA {
    0%, 100% { transform: translate(0%, 0%); }
    50%      { transform: translate(8%, -6%); }
  }
  @keyframes meshDriftB {
    0%, 100% { transform: translate(0%, 0%); }
    50%      { transform: translate(-7%, 9%); }
  }
  @keyframes meshDriftC {
    0%, 100% { transform: translate(0%, 0%); }
    50%      { transform: translate(-9%, -8%); }
  }
  @keyframes meshDriftD {
    0%, 100% { transform: translate(0%, 0%); }
    50%      { transform: translate(10%, 5%); }
  }
  @keyframes meshDriftE {
    0%, 100% { transform: translate(0%, 0%) scale(1); }
    50%      { transform: translate(5%, -5%) scale(1.04); }
  }
  @media (prefers-reduced-motion: reduce) {
    [data-mesh-blob] { animation: none !important; }
  }
`;

export function GradientMeshHero({
  kicker,
  counter,
  syndromeName,
  syndromeLine,
  patientChips,
  onEditCase,
  decorativeNumber,
  className,
  ...rest
}) {
  const chips = Array.isArray(patientChips) ? patientChips : [];
  const kickerText = kicker || "Bedside / The Answer";

  // Wave 9 · subtle 3D tilt + cursor-driven mesh blob shift on hover.
  // The hero leans 3 degrees toward the cursor (intensity tuned LOW so
  // the typography never reads as warped) and each mesh blob translates
  // ~6% opposite the cursor via the --mesh-x / --mesh-y CSS vars below.
  const heroRef = useRef(null);
  useTilt(heroRef, { intensity: 3, perspective: 1400 });

  useEffect(() => {
    const el = heroRef.current;
    if(!el) return undefined;
    if(typeof window === "undefined" || !window.matchMedia) return undefined;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    if(window.matchMedia("(pointer: coarse)").matches) return undefined;
    el.style.setProperty("--mesh-x", "0%");
    el.style.setProperty("--mesh-y", "0%");
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      if(r.width === 0 || r.height === 0) return;
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      // ±6% inverted (opposite cursor = depth illusion).
      el.style.setProperty("--mesh-x", (-px * 6).toFixed(2) + "%");
      el.style.setProperty("--mesh-y", (-py * 6).toFixed(2) + "%");
    };
    const onLeave = () => {
      el.style.setProperty("--mesh-x", "0%");
      el.style.setProperty("--mesh-y", "0%");
    };
    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave, { passive: true });
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      data-gradient-mesh-hero="true"
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "56px 44px 48px",
        // Subtle paper-to-cyan diagonal wash; the mesh blobs sit on top
        // and provide the real chroma. color-mix lets the wash stay
        // soft even on terminals where neon-cyan-soft is undefined.
        background:
          "linear-gradient(135deg, var(--paper) 0%, color-mix(in srgb, var(--paper) 92%, var(--neon-cyan-soft, var(--ox-softer)) 8%) 100%)",
        borderRadius: 24,
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow-e2), 0 0 0 1px rgba(0,212,255,.04)",
        // `isolation: isolate` confines the mesh blobs' stacking context
        // so their blur/translate never escapes the hero card.
        isolation: "isolate",
      }}
      {...rest}
    >
      {/* Mesh keyframes — scoped to this component via a <style> tag so
          the page doesn't need a global CSS edit. The reduced-motion
          query lives inside the same block. */}
      <style>{MESH_KEYFRAMES}</style>

      {/* MESH BACKGROUND LAYER ----------------------------------------------
           Five radial blobs, each absolutely positioned across the hero,
           blurred and animated independently. pointer-events:none keeps
           the typography layer the sole interactive surface. */}
      {BLOBS.map((blob, i) => (
        <div
          key={`blob-${i}`}
          data-mesh-blob
          aria-hidden="true"
          style={{
            position: "absolute",
            // Wave 9 · the inset reaches into the hero by the cursor-
            // driven --mesh-x / --mesh-y offset so the blobs shift
            // gently opposite the pointer for a depth illusion.
            top: "var(--mesh-y, 0%)",
            left: "var(--mesh-x, 0%)",
            right: "calc(-1 * var(--mesh-x, 0%))",
            bottom: "calc(-1 * var(--mesh-y, 0%))",
            pointerEvents: "none",
            background: `radial-gradient(circle at ${blob.x} ${blob.y}, ${blob.color} 0%, transparent ${blob.size})`,
            filter: "blur(48px)",
            animation: blob.animation,
            willChange: "transform",
            transition: "top var(--duration-slow, 300ms) var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)), left var(--duration-slow, 300ms) var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)), right var(--duration-slow, 300ms) var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)), bottom var(--duration-slow, 300ms) var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1))",
            zIndex: 0,
          }}
        />
      ))}

      {/* GLASS FOG LAYER ----------------------------------------------------
           A backdrop-filtered scrim that softens the mesh into a readable
           haze. Opacity .6 lets enough mesh chroma through to remain
           visible; saturate(140%) brings back the color the blur eats. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "rgba(255,255,255,0.35)",
          backdropFilter: "blur(80px) saturate(140%)",
          WebkitBackdropFilter: "blur(80px) saturate(140%)",
          opacity: 0.6,
          zIndex: 1,
        }}
      />

      {/* DECORATIVE NUMERAL -------------------------------------------------
           A massive italic numeric in neon cyan, anchored top-right at
           ~8% opacity. Pointer-events disabled; pure ornament. */}
      {decorativeNumber !== undefined && decorativeNumber !== null && decorativeNumber !== "" && (
        <div
          aria-hidden="true"
          data-mesh-decorative-numeral
          style={{
            position: "absolute",
            top: -24,
            right: 24,
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 240,
            fontWeight: 700,
            lineHeight: 1,
            color: "var(--neon-cyan, var(--ox))",
            opacity: 0.08,
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 2,
          }}
        >
          {decorativeNumber}
        </div>
      )}

      {/* CONTENT STACK ------------------------------------------------------
           All real content lives above the mesh + glass + decorative
           layers. zIndex 3 keeps it on top; relative positioning lets
           the absolute decorations layer beneath. */}
      <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          {/* Mono kicker + optional counter — the small-caps orienter
              at the top of the spread. Default text fires when the
              parent doesn't pass a `kicker` prop. */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: ".24em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "var(--ox)",
              marginBottom: 22,
            }}
          >
            <span data-mesh-kicker>{kickerText}</span>
            {counter && (
              <>
                <span aria-hidden="true" style={{ opacity: 0.4 }}>·</span>
                <span data-mesh-counter style={{ color: "var(--ink2)" }}>{counter}</span>
              </>
            )}
          </div>

          {/* Display headline — the BIG type moment. Sans-serif, 800
              weight, tight tracking, ~0.96 line-height. The mesh fades
              behind; this is what the eye lands on first. */}
          <h1
            style={{
              fontFamily: "var(--sans)",
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: "-.028em",
              lineHeight: 0.96,
              color: "var(--ink)",
              margin: 0,
            }}
          >
            {syndromeName}
          </h1>

          {/* Italic serif standfirst — the syndrome `.line` as editorial
              deck under the headline. max-width 60ch keeps line length
              readable. */}
          {syndromeLine && (
            <p
              style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: 18,
                fontWeight: 400,
                lineHeight: 1.5,
                color: "var(--ink2)",
                margin: "18px 0 0",
                maxWidth: "60ch",
              }}
            >
              {syndromeLine}
            </p>
          )}

          {/* Glassmorphic patient chips — rgba white background + neon
              border + backdrop-blur. Each chip's tone pulls from the
              CHIP_TONES map; unknown tones fall through to neutral. */}
          {chips.length > 0 && (
            <div
              style={{
                marginTop: 26,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 8,
              }}
            >
              {chips.map((chip, i) => {
                const tone = CHIP_TONES[chip.tone] || CHIP_TONES.neutral;
                const Icon = chip.icon || null;
                return (
                  <span
                    key={`chip-${i}`}
                    data-mesh-chip-tone={chip.tone || "neutral"}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "5px 12px",
                      borderRadius: 999,
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: ".05em",
                      color: tone.color,
                      background: "rgba(255,255,255,0.55)",
                      backdropFilter: "blur(12px) saturate(160%)",
                      WebkitBackdropFilter: "blur(12px) saturate(160%)",
                      border: `1px solid ${tone.border}`,
                      boxShadow: "var(--shadow-e0), inset 0 1px 0 rgba(255,255,255,0.6)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {Icon ? <Icon size={11} aria-hidden /> : null}
                    {chip.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT-ALIGNED EDIT BUTTON ----------------------------------------
             Mirrors EditorialHero's affordance; only renders when the
             parent passes an `onEditCase` callback. */}
        {onEditCase && (
          <div style={{ flex: "0 0 auto", paddingTop: 4 }}>
            <button
              type="button"
              onClick={onEditCase}
              title="Edit the case"
              aria-label="Edit case"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--mono)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "var(--ox)",
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(12px) saturate(160%)",
                WebkitBackdropFilter: "blur(12px) saturate(160%)",
                border: "1px solid var(--neon-cyan-line, var(--ox-line))",
                borderRadius: 999,
                padding: "8px 14px",
                cursor: "pointer",
                boxShadow: "var(--shadow-e1)",
              }}
            >
              <Pencil size={11} aria-hidden />
              Edit case
            </button>
          </div>
        )}
      </div>

      {/* BOTTOM GRADIENT HAIRLINE -------------------------------------------
           A 1px transparent→cyan→transparent gradient line as the bottom
           border. Sits above the mesh + glass; opacity .45 keeps it as
           a subtle finish rather than a hard rule. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, var(--neon-cyan, var(--ox)), transparent)",
          opacity: 0.45,
          pointerEvents: "none",
          zIndex: 4,
        }}
      />
    </section>
  );
}

export default GradientMeshHero;
