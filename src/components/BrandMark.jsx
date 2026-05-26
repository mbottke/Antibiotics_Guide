/* component · BrandMark — Wave 6 W6-B signature visual identity.
   Wave 8 W8 chrome pass — added cyan backlight + pixel-grid backdrop +
   italic serif subtitle to make the mark POP at 1-second-of-landing.

   The small mark + wordmark that lives in the global header. Designed
   to read as "wow that's a tasteful little detail" at 24px and still
   carry weight at 40px. Single inline SVG, no external assets.

   ICON CHOICE — hex molecular bond (Option C)
   A six-vertex ring evoking the β-lactam motif central to most useful
   antibiotics. One corner vertex is filled to anchor the eye; the ring
   itself is drawn as a single stroked path in `var(--ox)`. At small
   sizes the filled vertex reads as a "spark" / a point of decision —
   the moment a clinician picks the right agent.

   The shape is mathematically clean: a regular hexagon inscribed in
   a 24-unit viewBox, centered, with stroke-width 1.6 so it holds up
   visually when scaled down to a 20px icon block.

   W8 CHROME · BACKLIGHT
   The whole mark now sits on a soft cyan drop-shadow halo that turns
   the hex into a tiny glowing object — the kind of detail you notice
   on the first paint even without thinking about it. The icon block
   itself carries a 5×4 pixel-grid backdrop (a repeating radial gradient
   of cyan dots at 12% alpha) — a near-invisible texture that gives the
   mark "physical presence" without distracting from the geometry.

   W8 CHROME · ITALIC SERIF SUBTITLE
   The subtitle was previously mono-uppercased. Mono read as "label";
   italic serif reads as "editorial" — the typographic voice we want
   the rest of the chrome to inherit. Mono is now reserved for kickers
   and keyboard chips (e.g. ⌘K, Esc).

   WORDMARK
   Two-line treatment: serif Lora title + italic serif subtitle. The
   typographic contrast (semibold serif title against italic serif
   caption) gives the mark the editorial feel of a masthead while
   staying self-consciously clinical.

   USAGE
     <BrandMark />                                  // default: 28px icon + full title + subtitle
     <BrandMark size="small" />                     // 20px icon — for compact headers
     <BrandMark hideSubtitle />                     // title only
     <BrandMark subtitle="v0.1 · preview" />        // custom caption
     <BrandMark as="a" href="/" aria-label="Home" /> // polymorphic root

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";

const DEFAULT_SUBTITLE = "A clinical decision-support tool";

const SIZE_MAP = {
  small:   { box: 20, title: 12.5, sub: 9,    gap: 8  },
  default: { box: 28, title: 14,   sub: 10,   gap: 10 },
  large:   { box: 40, title: 20,   sub: 11.5, gap: 14 },
};

/* The cyan pixel-grid backdrop. A repeating radial gradient of small
   cyan dots laid out on a 5×4 grid, painted at low alpha so it reads
   as "texture" rather than "pattern." The size + spacing are tuned so
   each dot is 1px at small mark sizes and 1.5px at large — the grid
   feels like printed paper, not a tile. */
const PIXEL_GRID_BG =
  "radial-gradient(circle at 25% 25%, rgba(0, 212, 255, 0.18) 0.6px, transparent 0.8px)," +
  "radial-gradient(circle at 75% 75%, rgba(0, 212, 255, 0.12) 0.6px, transparent 0.8px)";

const PIXEL_GRID_SIZE = "5px 5px, 5px 5px";

/* Hex-ring mark. Drawn at 24×24 internal coords (with 2px breathing
   room baked into the vertex math) so the perceived weight matches
   adjacent type. The vertex at top-right (index 1) is filled to give
   the ring a "decision point" — the spark of choosing the right
   regimen. Stroke values tuned for legibility down to 18px on retina. */
function HexMark({ box }) {
  // Regular hexagon, flat-top, centered at (12,12), radius 9.5.
  // Vertex indices: 0=right, 1=top-right, 2=top-left, 3=left, 4=bottom-left, 5=bottom-right.
  const cx = 12, cy = 12, r = 9.5;
  const verts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6; // flat-top hexagon
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  const ringD =
    `M ${verts[0][0].toFixed(2)} ${verts[0][1].toFixed(2)} ` +
    verts.slice(1).map(([x, y]) => `L ${x.toFixed(2)} ${y.toFixed(2)}`).join(" ") +
    " Z";
  // The "spark" vertex sits at the top-right — index 1.
  const spark = verts[1];

  return (
    <svg
      width={box}
      height={box}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", flex: "0 0 auto", overflow: "visible" }}
    >
      <defs>
        {/* The "decision spark" sits inside a soft cyan glow — visible
            at retina sizes as a tiny halo on the filled vertex. */}
        <radialGradient id="bm-spark-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(0, 212, 255, 0.55)" />
          <stop offset="55%"  stopColor="rgba(0, 212, 255, 0.18)" />
          <stop offset="100%" stopColor="rgba(0, 212, 255, 0)" />
        </radialGradient>
        {/* Cyan-deep → cyan-bright gradient for the ring stroke. */}
        <linearGradient id="bm-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="var(--ox-deep, #0B0F14)" />
          <stop offset="55%"  stopColor="var(--ox, #1F2937)" />
          <stop offset="100%" stopColor="var(--neon-cyan, #00D4FF)" />
        </linearGradient>
      </defs>
      {/* Faintest backing wash — a near-invisible blush that gives the
          ring a subtle anchor without breaking the off-white surface. */}
      <circle cx={cx} cy={cy} r={r - 0.5} fill="var(--ox-softer)" />
      {/* Inner connector — two thin lines crossing the ring's center,
          evoking the β-lactam fusion bond. Drawn at 35% opacity so they
          recede beside the ring itself. */}
      <line
        x1={verts[3][0]} y1={verts[3][1]}
        x2={verts[0][0]} y2={verts[0][1]}
        stroke="var(--ox-line)"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      {/* The ring itself — gradient stroke from graphite into cyan so
          the mark feels lit-from-within rather than flat. */}
      <path
        d={ringD}
        fill="none"
        stroke="url(#bm-ring-grad)"
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Spark halo — cyan glow centred on the filled vertex. */}
      <circle
        cx={spark[0]}
        cy={spark[1]}
        r="3.6"
        fill="url(#bm-spark-glow)"
      />
      {/* The "decision spark" — a filled vertex at top-right. */}
      <circle
        cx={spark[0]}
        cy={spark[1]}
        r="1.85"
        fill="var(--neon-cyan, var(--ox-deep))"
      />
      {/* A small inner highlight on the spark — gives it a jewel-like
          finish at retina sizes without becoming fussy at 14px. */}
      <circle
        cx={spark[0] - 0.4}
        cy={spark[1] - 0.4}
        r="0.55"
        fill="var(--paper)"
        opacity="0.85"
      />
    </svg>
  );
}

export function BrandMark({
  subtitle,
  size = "default",
  hideSubtitle = false,
  as: As = "div",
  ...rest
}) {
  const dims = SIZE_MAP[size] || SIZE_MAP.default;
  const showSub = !hideSubtitle;
  const subText = subtitle ?? DEFAULT_SUBTITLE;

  // When rendered as an anchor or button we need to neutralise default
  // UA styling so the mark composites cleanly into any header surface.
  const isInteractive = As === "a" || As === "button";

  return (
    <As
      data-testid="brand-mark"
      {...rest}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: dims.gap,
        textDecoration: "none",
        color: "inherit",
        background: "transparent",
        border: 0,
        padding: 0,
        font: "inherit",
        cursor: isInteractive ? "pointer" : "default",
        transition: "opacity var(--duration-fast) var(--ease-out)",
        /* The cyan backlight — a soft drop-shadow halo around the whole
            mark wrapper. drop-shadow (not box-shadow) so it traces the
            silhouette of the hex itself, including the text glyphs, for
            a unified "lit from below" presence. */
        filter:
          "drop-shadow(0 0 14px rgba(0, 212, 255, 0.18)) " +
          "drop-shadow(0 1px 0 rgba(0, 212, 255, 0.08))",
        ...(rest.style || {}),
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: dims.box,
          height: dims.box,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "0 0 auto",
          position: "relative",
          /* 5×4 pixel-grid backdrop painted INSIDE the icon block — gives
              the hex something to sit on rather than floating in space. */
          background: PIXEL_GRID_BG,
          backgroundSize: PIXEL_GRID_SIZE,
          backgroundColor: "rgba(0, 212, 255, 0.03)",
          /* Asymmetric corners — every chrome surface in W8 uses this
              8/3 motif so the brand block reads as part of the same
              system as the nav chips and drawer panels. */
          borderRadius: size === "small" ? "5px 2px 5px 2px" : "8px 3px 8px 3px",
          /* Subtle cyan inner ring + soft halo around the block itself. */
          boxShadow:
            "inset 0 0 0 1px rgba(0, 212, 255, 0.18), " +
            "0 0 22px rgba(0, 212, 255, 0.22)",
        }}
      >
        <HexMark box={dims.box - 4} />
      </span>
      <span
        style={{
          display: "inline-flex",
          flexDirection: "column",
          minWidth: 0,
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontFamily: "var(--serif)",
            fontSize: dims.title,
            fontWeight: 600,
            color: "var(--ink)",
            letterSpacing: "-0.005em",
            lineHeight: 1.1,
            whiteSpace: "nowrap",
          }}
        >
          Inpatient Antibiotic Guide
        </span>
        {showSub && (
          <span
            data-testid="brand-mark-subtitle"
            style={{
              /* W8 chrome: italic serif overrides the previous mono.
                  Mono now lives only on labels + keyboard chips. */
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              fontSize: dims.sub,
              fontWeight: 500,
              color: "var(--ink2)",
              letterSpacing: "0.005em",
              textTransform: "none",
              lineHeight: 1.4,
              marginTop: 2,
              whiteSpace: "nowrap",
            }}
          >
            {subText}
          </span>
        )}
      </span>
    </As>
  );
}

export default BrandMark;
