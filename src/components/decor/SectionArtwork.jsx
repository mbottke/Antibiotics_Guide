/* component · SectionArtwork — Wave 9 W9 corner decoration primitive.

   Replaces the giant italic-serif numeral watermark that used to live
   in `Section.jsx` (the literal "01", "02", ... in the top-right corner
   at 240px / 50% opacity). The numeral approach reads as magazine
   cliche — every section gets the same big italic numeral and the
   reader stops noticing them as decoration. SectionArtwork swaps the
   numeral for a small (140-160px) chromatic flourish that picks up
   the molten-chrome / mesh / iridescent vocabulary of the bedside
   GradientMeshHero — so the page feels like one design language.

   Each variant is a ~120-160px absolutely-positioned decoration in
   the TOP-RIGHT corner of a Section panel:
     - pointer-events: none (never blocks clicks)
     - aria-hidden: true (decoration, not content)
     - z-index: 0 (sits BEHIND the section body)
     - prefers-reduced-motion: collapses animation to a static frame

   USAGE
     <Section artwork="mesh" accent="cyan">      // default mesh look
     <Section artwork="orb" accent="magenta">    // single iridescent orb
     <Section artwork="chrome-curl" accent="cyan">// SVG ribbon
     <Section artwork="prism" accent="lime">     // overlapping glass shards
     <Section artwork="blank">                   // renders null

   ACCENT MAPPING
     cyan    (default) — neon cyan dominates
     magenta           — hot magenta dominates, cyan/lime support
     lime              — electric lime dominates, cyan/magenta support
     amber             — neon amber dominates, cyan/magenta support

   Inpatient Antibiotic Guide — module graph documented in README.md. */

import React from "react";

/* Accent palette table. Each entry returns a `dominant` color, plus two
   supporting neon stops that round out the gradient. Cyan is the default
   home base of the design language; magenta/lime/amber simply rotate
   which stop carries the saturation. The fallback chain
   (var(--neon-X, var(--ox))) lets the primitive render even before the
   neon-color tokens land in tokens.css. */
const ACCENT_PALETTE = {
  cyan: {
    dominant: "var(--neon-cyan, var(--ox, #00d4ff))",
    support1: "var(--hot-magenta, #ff2e88)",
    support2: "var(--electric-lime, #b8ff3a)",
    soft:     "var(--neon-cyan-soft, rgba(0,212,255,0.35))",
    ring:     "var(--neon-cyan, var(--ox, #00d4ff))",
  },
  magenta: {
    dominant: "var(--hot-magenta, #ff2e88)",
    support1: "var(--neon-cyan, var(--ox, #00d4ff))",
    support2: "var(--electric-lime, #b8ff3a)",
    soft:     "var(--hot-magenta-soft, rgba(255,46,136,0.35))",
    ring:     "var(--hot-magenta, #ff2e88)",
  },
  lime: {
    dominant: "var(--electric-lime, #b8ff3a)",
    support1: "var(--neon-cyan, var(--ox, #00d4ff))",
    support2: "var(--hot-magenta, #ff2e88)",
    soft:     "var(--electric-lime-soft, rgba(184,255,58,0.35))",
    ring:     "var(--electric-lime, #b8ff3a)",
  },
  amber: {
    dominant: "var(--neon-amber, var(--amber, #ffb020))",
    support1: "var(--neon-cyan, var(--ox, #00d4ff))",
    support2: "var(--hot-magenta, #ff2e88)",
    soft:     "var(--neon-amber-soft, rgba(255,176,32,0.35))",
    ring:     "var(--neon-amber, var(--amber, #ffb020))",
  },
};

function resolveAccent(accent) {
  return ACCENT_PALETTE[accent] || ACCENT_PALETTE.cyan;
}

/* ---------- shared keyframes ---------- */
const ARTWORK_KEYFRAMES = `
  @keyframes saMeshDriftA {
    0%, 100% { transform: translate(0, 0); }
    50%      { transform: translate(6%, -5%); }
  }
  @keyframes saMeshDriftB {
    0%, 100% { transform: translate(0, 0); }
    50%      { transform: translate(-7%, 6%); }
  }
  @keyframes saMeshDriftC {
    0%, 100% { transform: translate(0, 0); }
    50%      { transform: translate(5%, 7%); }
  }
  @keyframes saChromePulse {
    0%, 100% { opacity: 0.85; }
    50%      { opacity: 0.55; }
  }
  @media (prefers-reduced-motion: reduce) {
    [data-section-artwork-blob],
    [data-section-artwork-chrome] {
      animation: none !important;
    }
  }
`;

/* ============================================================
   VARIANT · mesh
   A miniature GradientMeshHero — 3 small radial blobs (cyan,
   magenta, lime) inside a 140x140 circular clip with a backdrop
   blur. Slow drift animation per blob, gated by reduced-motion.
   1px iridescent ring around the orb (gradient stroke via a
   double-layered border + masked overlay).
   ============================================================ */
function MeshVariant({ palette }) {
  // Blob colors honor the accent: dominant first, then supports.
  const blobs = [
    { color: palette.dominant, x: "30%", y: "30%", size: "70%", animation: "saMeshDriftA 32s ease-in-out infinite" },
    { color: palette.support1, x: "75%", y: "30%", size: "65%", animation: "saMeshDriftB 38s ease-in-out infinite" },
    { color: palette.support2, x: "50%", y: "75%", size: "60%", animation: "saMeshDriftC 44s ease-in-out infinite" },
  ];
  return (
    <div
      data-section-artwork-variant="mesh"
      style={{
        position: "relative",
        width: 140,
        height: 140,
        borderRadius: "50%",
        overflow: "hidden",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        // Subtle iridescent ring: gradient via a 1px border-image fallback.
        // We layer a border on the inside and a faint outer gradient ring.
        border: "1px solid transparent",
        backgroundImage: `linear-gradient(rgba(255,255,255,0.02), rgba(255,255,255,0.02)),
                          linear-gradient(135deg, ${palette.dominant}, ${palette.support1}, ${palette.support2})`,
        backgroundOrigin: "border-box",
        backgroundClip: "content-box, border-box",
        boxShadow: `0 0 18px -4px ${palette.soft}`,
      }}
    >
      {blobs.map((blob, i) => (
        <div
          key={`mesh-blob-${i}`}
          data-section-artwork-blob
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at ${blob.x} ${blob.y}, ${blob.color} 0%, transparent ${blob.size})`,
            filter: "blur(18px)",
            opacity: 0.75,
            animation: blob.animation,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================
   VARIANT · orb
   A frosted iridescent orb — 130x130 circle with a radial gradient
   stack (cyan -> magenta -> lime), backdrop blur + saturation, a
   1px gradient ring, an inner white highlight (top-left), a soft
   outer accent glow, and a subtle chromatic-aberration before-layer.
   ============================================================ */
function OrbVariant({ palette }) {
  return (
    <div
      data-section-artwork-variant="orb"
      style={{
        position: "relative",
        width: 130,
        height: 130,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%,
                       ${palette.dominant} 0%,
                       ${palette.support1} 30%,
                       ${palette.support2} 60%,
                       transparent 100%)`,
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid transparent",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box",
        boxShadow: `0 0 24px -2px ${palette.soft},
                    inset 0 0 0 1px ${palette.ring}`,
        overflow: "visible",
      }}
    >
      {/* Chromatic-aberration before-layer: 3 offset gradient layers
          shifted by 1-2px. Sits on top of the body, low opacity. */}
      <div
        aria-hidden="true"
        data-section-artwork-aberration
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          pointerEvents: "none",
          background: `
            radial-gradient(circle at 36% 36%, ${palette.dominant} 0%, transparent 55%),
            radial-gradient(circle at 34% 34%, ${palette.support1} 0%, transparent 55%),
            radial-gradient(circle at 35% 35%, ${palette.support2} 0%, transparent 55%)
          `,
          backgroundBlendMode: "screen",
          opacity: 0.18,
          mixBlendMode: "screen",
        }}
      />
      {/* Inner highlight (top-left): white at 25%/25%, 20% opacity radial. */}
      <div
        aria-hidden="true"
        data-section-artwork-highlight
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          pointerEvents: "none",
          background: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.20) 0%, transparent 45%)",
        }}
      />
    </div>
  );
}

/* ============================================================
   VARIANT · chrome-curl
   An SVG flowing chrome ribbon (figure-8 fragment) inside a 160x160
   viewport. Uses a gradient stroke (cyan -> blue -> magenta accent
   rotated) at 2.5px width with a drop-shadow filter for the soft
   glow. Pulse opacity animation gated by reduced-motion.
   ============================================================ */
function ChromeCurlVariant({ palette, accent }) {
  // Unique gradient ID per accent so multiple SectionArtwork instances
  // don't collide on the same defs ID.
  const gradId = `sa-chrome-grad-${accent}`;
  const shadowId = `sa-chrome-shadow-${accent}`;
  return (
    <svg
      data-section-artwork-variant="chrome-curl"
      data-section-artwork-chrome
      width="160"
      height="160"
      viewBox="0 0 160 160"
      aria-hidden="true"
      style={{
        animation: "saChromePulse 2.5s ease-in-out infinite",
        filter: `drop-shadow(0 0 12px ${palette.soft})`,
      }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={palette.dominant} />
          <stop offset="50%"  stopColor={palette.support1} />
          <stop offset="100%" stopColor={palette.support2} />
        </linearGradient>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      {/* Flowing C-curve / figure-8 fragment: ribbons of chrome */}
      <path
        d="M 20 110 C 40 60, 80 40, 110 70 S 150 130, 130 140"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M 30 60 C 60 80, 90 100, 120 50"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

/* ============================================================
   VARIANT · prism
   Three overlapping clip-path quadrilateral shards (~50x80) at
   different rotations (-12, 7, 22 deg). Each carries a subtle
   tinted gradient at 30% opacity, 1px white border at 40%, and
   a faint 45deg refraction overlay line.
   ============================================================ */
function PrismVariant({ palette }) {
  const SHARDS = [
    { rotate: -12, top: 10,  left:  6, tint: palette.dominant },
    { rotate:   7, top: 30,  left: 48, tint: palette.support1 },
    { rotate:  22, top: 60,  left: 22, tint: palette.support2 },
  ];
  return (
    <div
      data-section-artwork-variant="prism"
      style={{
        position: "relative",
        width: 160,
        height: 160,
      }}
    >
      {SHARDS.map((shard, i) => (
        <div
          key={`prism-shard-${i}`}
          data-section-artwork-shard
          aria-hidden="true"
          style={{
            position: "absolute",
            top: shard.top,
            left: shard.left,
            width: 50,
            height: 80,
            transform: `rotate(${shard.rotate}deg)`,
            // Etched-glass border, soft tint, faint refraction line.
            background: `
              linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.35) 50%, transparent 52%),
              linear-gradient(160deg, ${shard.tint} 0%, transparent 80%)
            `,
            opacity: 0.6,
            border: "1px solid rgba(255,255,255,0.4)",
            backdropFilter: "blur(8px) saturate(140%)",
            WebkitBackdropFilter: "blur(8px) saturate(140%)",
            // Tilted quadrilateral via clip-path (gentle parallelogram).
            clipPath: "polygon(15% 0%, 100% 5%, 85% 100%, 0% 95%)",
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================
   Main export.
   Variant is one of "mesh", "orb", "chrome-curl", "prism", "blank".
   accent  is one of "cyan", "magenta", "lime", "amber".
   ============================================================ */
export function SectionArtwork({ variant = "mesh", accent = "cyan", className, style }) {
  if (variant === "blank") return null;

  const palette = resolveAccent(accent);

  let inner = null;
  if (variant === "orb")              inner = <OrbVariant       palette={palette} />;
  else if (variant === "chrome-curl") inner = <ChromeCurlVariant palette={palette} accent={accent} />;
  else if (variant === "prism")       inner = <PrismVariant     palette={palette} />;
  else                                inner = <MeshVariant      palette={palette} />; // default = mesh

  return (
    <div
      aria-hidden="true"
      data-section-artwork
      data-section-artwork-variant-root={variant}
      data-section-artwork-accent={accent}
      className={className}
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: 0,
        pointerEvents: "none",
        userSelect: "none",
        ...style,
      }}
    >
      <style>{ARTWORK_KEYFRAMES}</style>
      {inner}
    </div>
  );
}

export default SectionArtwork;
