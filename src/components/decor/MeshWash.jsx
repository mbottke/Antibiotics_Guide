/* component · MeshWash — Wave 9 W9 molten-chrome background utility.

   A reusable mesh-gradient background primitive that distills the
   GradientMeshHero's signature visual DNA (5 drifting radial-gradient
   blobs in cyan / blue / magenta / lime) into a standalone decorative
   wrapper that any consumer can mount behind their own content.

   Where GradientMeshHero is a full editorial hero block (BIG type,
   chips, edit button), this is JUST the background — the molten
   chrome — so it can ride behind drawer headers, modal bands, the
   bedside container, sticky spine bars, section heroes, and footers.

   Composition
   -----------
   - A wrapper element absolutely positioned to fill its parent,
     overflow:hidden, pointer-events:none, aria-hidden, inheriting
     border-radius so a radiused parent never lets blobs bleed out.
   - 2–5 radial-gradient blobs (variant-dependent), each `filter: blur(48px)`
     with `transform: translate3d(0,0,0)` to stay on the GPU compositor.
   - Drift keyframes scoped to this component via a `<style>` block; the
     `prefers-reduced-motion` media query collapses every keyframe to
     `none` so reduced-motion users see a static gradient.

   USAGE
     // Full mesh behind a section hero
     <div style={{ position: "relative" }}>
       <MeshWash variant="full" intensity="soft" palette="cyan-magenta-lime" />
       <div style={{ position: "relative", zIndex: 1 }}>...content...</div>
     </div>

     // Band wash across the top of a drawer header
     <MeshWash variant="band" intensity="normal" palette="cyan-blue" />

     // Ambient very-faint wash as a page backdrop
     <MeshWash variant="ambient" intensity="soft" palette="cyan-only" drift={false} />

   API
     variant   = "full" | "band" | "corner" | "ambient"  (default "full")
     intensity = "soft" | "normal" | "strong"            (default "normal")
     palette   = "cyan-magenta-lime" | "cyan-blue" | "lime-amber" | "cyan-only"
                                                         (default "cyan-magenta-lime")
     drift     = true | false                            (default true)
     anchor    = "top-right" | "bottom-left" | "top-left" | "bottom-right"
                 (corner variant only; default "top-right")
     className = optional className passthrough
     style     = optional style overrides (merged last; usually unneeded)

   Performance
   -----------
   The 5-blob mesh involves heavy `filter: blur(48px)` — every animated
   blob carries `will-change: transform` and a `translate3d(0,0,0)` to
   force its own GPU layer. In practice the compositor can hold 3-4
   simultaneous MeshWashes at 60fps on a modern laptop; if more are
   mounted (e.g. bedside container + spine bar + drawer + 3 section
   heroes simultaneously visible) the budget tightens. Variant choices
   (`band`, `corner`, `ambient`) intentionally render fewer blobs so
   multiple instances stay cheap. Reduced-motion or `drift={false}`
   removes the animation entirely, dropping GPU cost to a static paint.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useId } from "react";

/* ---------- intensity multipliers ----------
   Each variant's per-blob alpha is multiplied by this factor at render
   time. `soft` ducks the wash so it reads as atmosphere; `strong`
   amplifies it for spine bars + onboarding steps where the molten
   chrome is the point of the surface. */
const INTENSITY_MULT = {
  soft:   0.6,
  normal: 1.0,
  strong: 1.3,
};

/* ---------- palette definitions ----------
   Each palette is an array of CSS color tokens; the variant generators
   below pick the right number of stops to drop into their blob slots.
   All tokens fall back to `var(--ox)` if the neon-* set isn't loaded
   (older branches / CI before the neon-color-reframe agent lands). */
const PALETTES = {
  "cyan-magenta-lime": [
    "var(--mesh-cyan-anchor, var(--neon-cyan, var(--ox)))",
    "var(--mesh-blue-anchor, var(--electric-blue, var(--ox)))",
    "var(--mesh-magenta-anchor, var(--hot-magenta, var(--ox)))",
    "var(--mesh-lime-anchor, var(--electric-lime, var(--ox)))",
    "var(--mesh-cyan-anchor, var(--neon-cyan, var(--ox)))",
  ],
  "cyan-blue": [
    "var(--mesh-cyan-anchor, var(--neon-cyan, var(--ox)))",
    "var(--mesh-blue-anchor, var(--electric-blue, var(--ox)))",
    "var(--neon-cyan-soft, var(--ox-soft))",
  ],
  "lime-amber": [
    "var(--mesh-lime-anchor, var(--electric-lime, var(--ox)))",
    "var(--neon-amber, var(--amber))",
    "var(--neon-cyan-soft, var(--ox-soft))",
  ],
  "cyan-only": [
    "var(--mesh-cyan-anchor, var(--neon-cyan, var(--ox)))",
    "var(--neon-cyan-soft, var(--ox-soft))",
    "var(--mesh-cyan-anchor, var(--neon-cyan, var(--ox)))",
  ],
};

/* ---------- variant → blob layout generators ----------
   Each generator returns an array of blob descriptors. A blob carries:
     color    — CSS color stop (radial origin)
     x, y     — origin point as % of the wash wrapper
     size     — stop-percentage at which the gradient fades to transparent
     animKey  — keyframe name suffix (A..E); maps to MESH_KEYFRAMES below
     alpha    — base alpha multiplier (before intensity)
   The generator receives the palette so each variant pulls colors from
   the right slots in the array. */

function buildBlobsFull(palette) {
  // 5-blob full mesh — mirrors GradientMeshHero. Five drifting blobs
  // spread across the wrapper to form a fluid color field.
  const p = palette;
  return [
    { color: p[0],        x: "15%", y: "20%", size: "45%", animKey: "A", alpha: 1.0 },
    { color: p[1] || p[0], x: "85%", y: "10%", size: "50%", animKey: "B", alpha: 1.0 },
    { color: p[2] || p[0], x: "75%", y: "75%", size: "40%", animKey: "C", alpha: 1.0 },
    { color: p[3] || p[0], x: "20%", y: "85%", size: "35%", animKey: "D", alpha: 1.0 },
    { color: p[4] || p[0], x: "50%", y: "50%", size: "60%", animKey: "E", alpha: 1.0 },
  ];
}

function buildBlobsBand(palette) {
  // 3-blob band — blobs concentrated in the top 80px of the parent. y
  // values all sit at or above 30% so the wash gradient feathers down
  // before reaching the body content beneath the header.
  const p = palette;
  return [
    { color: p[0],        x: "20%", y: "10%", size: "55%", animKey: "A", alpha: 1.0 },
    { color: p[1] || p[0], x: "80%", y: "20%", size: "50%", animKey: "B", alpha: 1.0 },
    { color: p[2] || p[0], x: "50%", y: "30%", size: "45%", animKey: "C", alpha: 0.85 },
  ];
}

function buildBlobsCorner(palette, anchor) {
  // 2-blob corner — anchored to one corner; the wash forms a soft glow
  // emanating from that corner rather than filling the parent.
  const p = palette;
  const positions = {
    "top-right":    [["80%", "20%"], ["95%", "5%"]],
    "top-left":     [["20%", "20%"], ["5%", "5%"]],
    "bottom-right": [["80%", "80%"], ["95%", "95%"]],
    "bottom-left":  [["20%", "80%"], ["5%", "95%"]],
  };
  const [a, b] = positions[anchor] || positions["top-right"];
  return [
    { color: p[0],        x: a[0], y: a[1], size: "55%", animKey: "A", alpha: 1.0 },
    { color: p[1] || p[0], x: b[0], y: b[1], size: "45%", animKey: "C", alpha: 0.9 },
  ];
}

function buildBlobsAmbient(palette) {
  // Ambient — 3 very soft blobs spread across the parent. The base
  // alpha is intentionally 0.35 so even at `intensity=normal` the wash
  // reads as faint atmosphere rather than chroma.
  const p = palette;
  return [
    { color: p[0],        x: "25%", y: "30%", size: "55%", animKey: "A", alpha: 0.35 },
    { color: p[1] || p[0], x: "75%", y: "70%", size: "55%", animKey: "B", alpha: 0.35 },
    { color: p[2] || p[0], x: "50%", y: "50%", size: "70%", animKey: "E", alpha: 0.30 },
  ];
}

const VARIANT_BUILDERS = {
  full:    buildBlobsFull,
  band:    buildBlobsBand,
  corner:  buildBlobsCorner,
  ambient: buildBlobsAmbient,
};

/* ---------- wrapper sizing per variant ----------
   - full / ambient: fill the parent (inset: 0)
   - band: top 80px only — the wash feathers down into the header band
   - corner: 220×220 box anchored to one corner */
function wrapperBoundsFor(variant, anchor) {
  if (variant === "band") {
    return { position: "absolute", top: 0, left: 0, right: 0, height: 80 };
  }
  if (variant === "corner") {
    const sides = {
      "top-right":    { top: 0,    right: 0 },
      "top-left":     { top: 0,    left: 0 },
      "bottom-right": { bottom: 0, right: 0 },
      "bottom-left":  { bottom: 0, left: 0 },
    };
    const side = sides[anchor] || sides["top-right"];
    return { position: "absolute", width: 220, height: 220, ...side };
  }
  // full + ambient
  return { position: "absolute", inset: 0 };
}

/* ---------- keyframes ----------
   Five drift cycles (A..E); each blob carries a unique animation so
   the mesh feels alive without ever syncing into a visible pattern.
   Amplitudes stay ±5–10% so the motion reads as a slow exhale rather
   than a swirl. Reduced-motion zeroes every animation. */
const MESH_KEYFRAMES = `
  @keyframes rxMeshDriftA {
    0%, 100% { transform: translate3d(0%, 0%, 0); }
    50%      { transform: translate3d(8%, -6%, 0); }
  }
  @keyframes rxMeshDriftB {
    0%, 100% { transform: translate3d(0%, 0%, 0); }
    50%      { transform: translate3d(-7%, 9%, 0); }
  }
  @keyframes rxMeshDriftC {
    0%, 100% { transform: translate3d(0%, 0%, 0); }
    50%      { transform: translate3d(-9%, -8%, 0); }
  }
  @keyframes rxMeshDriftD {
    0%, 100% { transform: translate3d(0%, 0%, 0); }
    50%      { transform: translate3d(10%, 5%, 0); }
  }
  @keyframes rxMeshDriftE {
    0%, 100% { transform: translate3d(0%, 0%, 0) scale(1); }
    50%      { transform: translate3d(5%, -5%, 0) scale(1.04); }
  }
  @media (prefers-reduced-motion: reduce) {
    [data-mesh-wash-blob] { animation: none !important; }
  }
`;

/* Drift durations keyed by animKey; same values used by GradientMeshHero
   so the two surfaces feel like the same molten chrome system. */
const DRIFT_DURATIONS = { A: 28, B: 36, C: 32, D: 40, E: 44 };

export function MeshWash({
  variant = "full",
  intensity = "normal",
  palette = "cyan-magenta-lime",
  drift = true,
  anchor = "top-right",
  className,
  style,
}) {
  const wrapId = useId();

  const paletteStops = PALETTES[palette] || PALETTES["cyan-magenta-lime"];
  const intensityMult = INTENSITY_MULT[intensity] ?? 1.0;
  const builder = VARIANT_BUILDERS[variant] || VARIANT_BUILDERS.full;
  const blobs = variant === "corner"
    ? builder(paletteStops, anchor)
    : builder(paletteStops);

  const bounds = wrapperBoundsFor(variant, anchor);

  return (
    <div
      aria-hidden="true"
      data-mesh-wash
      data-mesh-wash-variant={variant}
      data-mesh-wash-intensity={intensity}
      data-mesh-wash-palette={palette}
      className={className}
      style={{
        ...bounds,
        overflow: "hidden",
        pointerEvents: "none",
        // Inherit the parent's border-radius so blobs never poke out of
        // a radiused container (drawer header, modal, hero card).
        borderRadius: "inherit",
        // Z-index 0 keeps the wash behind any sibling content at z-index
        // 1+. Consumers wrap their content at z-index 1 to sit on top.
        zIndex: 0,
        ...style,
      }}
    >
      {/* Scoped keyframes — drop into the document only once per render
          tree by way of the <style> element; the keyframe names are
          shared (rxMeshDrift*) so duplicate definitions don't multiply
          overhead. */}
      <style>{MESH_KEYFRAMES}</style>

      {blobs.map((blob, i) => {
        const alpha = (blob.alpha ?? 1.0) * intensityMult;
        const animation = drift
          ? `rxMeshDrift${blob.animKey} ${DRIFT_DURATIONS[blob.animKey] || 32}s ease-in-out infinite`
          : "none";
        return (
          <div
            key={`${wrapId}-blob-${i}`}
            data-mesh-wash-blob
            data-mesh-wash-blob-index={i}
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              // Each blob is a single radial-gradient at its origin; the
              // `color-mix` lets us scale alpha without losing the token
              // fallback chain when the browser doesn't support color-mix
              // (Safari < 16.4 — falls through to the raw color).
              background: `radial-gradient(circle at ${blob.x} ${blob.y}, color-mix(in srgb, ${blob.color} ${Math.round(Math.min(1, alpha) * 100)}%, transparent) 0%, transparent ${blob.size})`,
              filter: "blur(48px)",
              animation,
              willChange: drift ? "transform" : "auto",
              // translate3d nudges the blob into its own GPU layer even
              // when drift is off, keeping the heavy blur off the CPU.
              transform: drift ? undefined : "translate3d(0, 0, 0)",
            }}
          />
        );
      })}
    </div>
  );
}

export default MeshWash;
