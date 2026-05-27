/* component · Section — shared section chrome.
   Renders the kicker (small uppercase mono label with optional icon)
   OUTSIDE the panel box, then the panel itself (rounded border,
   padding, optional sticky orange top stripe). All page sections —
   Start now, Stop at 48–72 h, Duration, Monitoring, Current state,
   Pearls — render through this so the visual rhythm stays constant
   and the only thing that differs between sections is the content.

   Extracted from AnswerCanvas in Phase D2 v3 to enforce consistent
   formatting across the page: prior to this, DurationBlock and
   MonitoringBlock invented their own internal title strips, which
   broke the kicker-outside-the-box pattern and looked inconsistent.

   Wave 8 W8-A · Answer Canvas reframe extension.
   ---------------------------------------------
   The Section wrapper now carries the editorial chrome that the
   AnswerCanvas reframe demands:

     • `index` + `total`  — drive a "01 / 17" mono counter pinned
                            top-right of the section header, beside
                            the kicker. (Wave 9 W9 removed the giant
                            italic-serif numeral watermark that used
                            to also derive from `index`; see `artwork`
                            below for the new corner decoration.)
     • `artwork`          — replaces the old giant numeral. One of
                            "mesh" | "orb" | "chrome-curl" | "prism" |
                            "blank" (default). When non-blank, renders
                            a 140-160px SectionArtwork in the top-right
                            corner that picks up the same molten-chrome
                            / mesh / iridescent vocabulary as the
                            bedside GradientMeshHero.
     • `rail`             — vertical 90deg-rotated mono-uppercase
                            label running up the left edge of the
                            section ("COVERAGE", "DURATION", ...).
                            Cyan-accented, .14em letterspaced, sits
                            absolutely positioned outside the panel
                            on viewports wide enough to host it.
     • `kineticKicker`    — promotes the kicker text to the .rx-display-l
                            48px sans display class (from kinetic-type
                            module) instead of the small .rx-eyebrow.
                            Used by hero-y sections to land the BIG
                            type moment.
     • `accent`           — one of "cyan", "magenta", "lime", "amber"
                            (default "cyan"). Drives the icon tile
                            background gradient and the rail color so
                            sections can declare their own palette.
     • `split`            — when an `aside` slot is passed, the panel
                            body becomes a 65/35 grid (CSS grid-template-
                            columns) where the wider column carries
                            `children` and the narrow `aside` carries
                            the metadata column (severity counts,
                            evidence tier, "5 organisms" list, etc.).
                            Collapses to single-column < 900px.
     • `aside`            — JSX rendered into the narrow column when
                            `split` is true.
     • `decor`            — extra absolutely-positioned decoration
                            (Sparkle, AsymmetricCard, etc.) rendered
                            beneath the panel on a low z-index layer.
     • `flatPanel`        — when true, suppresses the default panel
                            background/border/padding so a layer can
                            host its own custom container. Used by
                            layers whose content (MonitoringBlock,
                            DurationBlock) already carries its own
                            chrome.

   The new props are all OPTIONAL — every existing call site continues
   to work unchanged. The kicker-outside-the-box rhythm holds.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useRef, useState, useEffect, useId } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SectionGlyph } from "./SectionGlyph.jsx";
import { SectionArtwork } from "./decor/SectionArtwork.jsx";
import { useRevealOnScroll } from "./util/useRevealOnScroll.js";

/* Read the persisted collapsed flag from sessionStorage. Returns false
   when sessionStorage is unavailable (SSR / privacy-mode) or the key
   is absent / not "1". Snapshot contract: per-syndrome state lives in
   sessionStorage ONLY — NOT localStorage, NOT URL hash — so the
   shareable URL stays decoupled from session-scoped panel state. */
function _readCollapsed(persistKey) {
  if (!persistKey) return false;
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return false;
    return window.sessionStorage.getItem(persistKey) === "1";
  } catch (_e) {
    return false;
  }
}

/* Accent palette — one per `accent` prop value. The `glow` token is
   pulled from the Wave 6 / Wave 7 neon glow ramp with a soft fall-back
   to var(--ox)'s shadow token when neon vars are absent. Every entry
   feeds the icon tile gradient and the rail text color. */
const ACCENT = {
  cyan: {
    rail: "var(--neon-cyan, var(--ox))",
    railSoft: "var(--neon-cyan-soft, var(--ox-soft))",
    tileFrom: "var(--neon-cyan, var(--ox))",
    tileTo: "var(--electric-blue, var(--ox-deep))",
    glow: "0 6px 18px -8px var(--neon-cyan, var(--ox))",
  },
  magenta: {
    rail: "var(--hot-magenta, var(--ox))",
    railSoft: "var(--hot-magenta-soft, var(--ox-soft))",
    tileFrom: "var(--hot-magenta, var(--ox))",
    tileTo: "var(--vivid-red, var(--ox-deep))",
    glow: "0 6px 18px -8px var(--hot-magenta, var(--ox))",
  },
  lime: {
    rail: "var(--electric-lime, var(--ox))",
    railSoft: "var(--electric-lime-soft, var(--ox-soft))",
    tileFrom: "var(--electric-lime, var(--ox))",
    tileTo: "var(--neon-cyan, var(--ox-deep))",
    glow: "0 6px 18px -8px var(--electric-lime, var(--ox))",
  },
  amber: {
    rail: "var(--neon-amber, var(--amber))",
    railSoft: "var(--amber-soft, var(--ox-soft))",
    tileFrom: "var(--neon-amber, var(--amber))",
    tileTo: "var(--vivid-red, var(--ox-deep))",
    glow: "0 6px 18px -8px var(--neon-amber, var(--amber))",
  },
};

/* Pad an integer to "01", "02", ... — keeps the counter aligned. */
function pad2(n) {
  if (n == null || Number.isNaN(Number(n))) return null;
  const v = Math.abs(Number(n) | 0);
  return v < 10 ? `0${v}` : String(v);
}

function Section({
  kicker, title, icon: Icon, glyph, children, sticky, testId, id,
  // Wave 8 W8-A reframe extensions ---------------------------------
  index, total,
  rail,
  kineticKicker = false,
  accent = "cyan",
  split = false,
  aside,
  decor,
  flatPanel = false,
  // Wave 9 W9 · SectionArtwork slot — replaces the old giant italic
  // numeral watermark. Default "blank" renders nothing so existing
  // call sites stay visually unchanged. Consumers opt in with
  // artwork="mesh" | "orb" | "chrome-curl" | "prism".
  artwork = "blank",
  // Wave 14 · per-panel minimize / expand chevron. When `collapsible`
  // is true a small chevron button renders just LEFT of the top-right
  // counter pin. State persists to `sessionStorage[persistKey]` ONLY
  // (NOT localStorage, NOT URL hash — snapshot contract). When
  // collapsed, the panel body is hidden via the `hidden` attribute
  // and an optional `collapsedSummary` slot renders beside the kicker.
  collapsible = false,
  collapsedSummary,
  persistKey,
}) {
  const palette = ACCENT[accent] || ACCENT.cyan;
  const counterText = (pad2(index) && pad2(total)) ? `${pad2(index)} / ${pad2(total)}` : null;

  /* Wave 14 · collapsed state. Source of truth = sessionStorage. The
     initializer reads the key once; an effect re-syncs when the key
     itself changes (e.g. when switching syndromes mid-session) so the
     panel reflects whatever the new key currently says. */
  const [collapsed, setCollapsed] = useState(() => _readCollapsed(persistKey));
  useEffect(() => {
    if (!collapsible) return;
    setCollapsed(_readCollapsed(persistKey));
  }, [persistKey, collapsible]);

  const _bodyId = useId();
  const bodyId = id ? `${id}-body` : `rx-section-body-${_bodyId}`;

  const _toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        if (persistKey && typeof window !== "undefined" && window.sessionStorage) {
          if (next) window.sessionStorage.setItem(persistKey, "1");
          else window.sessionStorage.removeItem(persistKey);
        }
      } catch (_e) { /* ignore quota / privacy-mode errors */ }
      return next;
    });
  };

  const _showChevron = collapsible === true;
  const _isCollapsed = _showChevron && collapsed;

  /* Wave 12 · CH2 — scroll-into-view reveal cascade. The hook attaches
     an IntersectionObserver to the section root; the first time the
     section enters the viewport it sets data-revealed="true" and the
     CSS in src/styles/choreography.js animates the section's direct
     interactive children (rx-card / rx-acc / rx-tnode / rx-step) with
     a 60ms stagger. One-shot per page-load (the observer disconnects
     after firing). Gated by prefers-reduced-motion at the hook level. */
  const sectionRef = useRef(null);
  useRevealOnScroll(sectionRef);

  /* The header strip: rail label sits on the absolute left margin;
     icon tile + kicker (or kinetic display) + glyph + counter sit
     inline. We render the rail label only on roomy viewports via the
     `rx-section-rail` class so it doesn't crash narrow mobile layouts
     — the responsive CSS lives in AnswerCanvas's injected style block.
     The numeral watermark and decor live on z-index 0 behind the panel. */
  return (
    <section
      ref={sectionRef}
      data-testid={testId}
      data-section-accent={accent}
      data-section-split={split ? "true" : "false"}
      id={id}
      className="rx-section"
      style={{
        position: "relative",
        marginBottom: 28,
        scrollMarginTop: 96,
        paddingLeft: 0,
      }}
    >
      {/* Vertical left-rail label — rotated 90deg counter-clockwise,
          mono-uppercase, .14em letterspaced, cyan accent. Positioned
          absolutely outside the panel on roomy viewports. The .rx-section-rail
          class drives the responsive hide/show. */}
      {rail && (
        <span
          aria-hidden="true"
          data-section-rail-label={rail}
          className="rx-section-rail"
          style={{
            position: "absolute",
            left: -36,
            top: 64,
            transform: "rotate(-90deg)",
            transformOrigin: "left top",
            fontFamily: "var(--mono)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: palette.rail,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            opacity: 0.85,
            zIndex: 1,
          }}
        >
          {rail}
        </span>
      )}

      {/* Wave 9 W9 · SectionArtwork slot — replaces the old 240px italic-
          serif numeral watermark that used to anchor top-right. The
          new primitive carries the molten-chrome / mesh / iridescent
          DNA of the bedside GradientMeshHero in a 140-160px corner
          flourish. Pointer-events:none + aria-hidden + z-index:0 keep
          it decorative. Default artwork="blank" renders nothing. */}
      <SectionArtwork variant={artwork} accent={accent} />

      {/* HEADER STRIP --------------------------------------------------- */}
      <div style={{
        position: "relative",
        zIndex: 2,
        display: "flex", alignItems: kineticKicker ? "flex-end" : "center",
        gap: 12,
        marginBottom: 14,
        flexWrap: "wrap",
      }}>
        {/* Icon chip tile — 40x40 asymmetric 10/3 radius, gradient cyan-deep
            → cyan-bright background, white SVG glyph, cyan glow at -8px.
            Only renders when an Icon is provided. */}
        {Icon && (
          <span
            aria-hidden="true"
            data-section-icon-tile
            style={{
              flex: "0 0 auto",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 40, height: 40,
              borderRadius: "10px 3px 10px 3px",
              background: `linear-gradient(135deg, ${palette.tileFrom}, ${palette.tileTo})`,
              color: "#fff",
              boxShadow: palette.glow,
            }}
          >
            <Icon size={18} aria-hidden />
          </span>
        )}

        {/* Wave 6 W6-B integration · SectionGlyph fleuron sits next to the
            kicker text when a group is provided. Decorative, aria-hidden —
            adds editorial-magazine character without crowding the label. */}
        {glyph && <SectionGlyph group={glyph} size={14} />}

        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: 1 }}>
          {kineticKicker && kicker ? (
            <h2
              className="rx-display-l"
              style={{
                margin: 0,
                color: "var(--ink)",
                /* Kinetic display kicker — promotes "Start now" / "Covers"
                   into the 48px BIG-type moment. The rx-display-l class
                   carries the sans-serif weight 700, -.024em tracking. */
              }}
            >
              {kicker}
            </h2>
          ) : (
            kicker && (
              <span className="rx-eyebrow" style={{
                display: "inline-flex", alignItems: "center", gap: 6, margin: 0,
              }}>
                {kicker}
              </span>
            )
          )}
          {title && (
            <h3 style={{
              fontFamily: "var(--serif)", fontSize: 18, fontWeight: 600, margin: 0,
              color: "var(--ink)", letterSpacing: "-.012em",
            }}>
              {title}
            </h3>
          )}
          {/* Wave 14 · collapsed-state inline summary. Only renders when
              the panel is currently collapsed AND a `collapsedSummary`
              prop was supplied. Italic ink2 12px keeps it as quiet
              metadata next to the kicker. */}
          {_isCollapsed && collapsedSummary != null && (
            <span
              data-section-collapsed-summary
              style={{
                fontStyle: "italic",
                color: "var(--ink2)",
                fontSize: 12,
                lineHeight: 1.45,
              }}
            >
              {collapsedSummary}
            </span>
          )}
        </div>

        {/* Wave 14 · minimize / expand chevron. Sits just LEFT of the
            counter pin when both render. 24x24 hit area, 6/2/6/2
            asymmetric radius, .rx-focus-halo for the focus ring. */}
        {_showChevron && (
          <button
            type="button"
            onClick={_toggleCollapsed}
            aria-expanded={!_isCollapsed}
            aria-controls={bodyId}
            aria-label={_isCollapsed ? "Expand section" : "Collapse section"}
            data-section-collapse-toggle
            className="rx-focus-halo"
            style={{
              flex: "0 0 auto",
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              padding: 0,
              borderRadius: "6px 2px 6px 2px",
              background: "var(--panel)",
              border: "1px solid var(--line)",
              color: "var(--ink2)",
              cursor: "pointer",
              transition: "background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)",
            }}
          >
            {_isCollapsed ? <ChevronDown size={14} aria-hidden /> : <ChevronUp size={14} aria-hidden />}
          </button>
        )}

        {/* Top-right counter — "01 / 17" style mono uppercase pin. Only
            renders when index + total are both supplied. */}
        {counterText && (
          <span
            className="rx-counter"
            data-section-counter={counterText}
            style={{
              flex: "0 0 auto",
              alignSelf: "flex-start",
              padding: "3px 8px",
              borderRadius: 4,
              background: palette.railSoft,
              color: palette.rail,
              border: `1px solid ${palette.rail}`,
              borderColor: palette.rail,
              fontWeight: 700,
              opacity: 0.95,
            }}
          >
            {counterText}
          </span>
        )}
      </div>

      {/* DECOR LAYER --------------------------------------------------- */}
      {decor && (
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          {decor}
        </div>
      )}

      {/* PANEL BODY ----------------------------------------------------
          Wave 12 fix · flatPanel + split + aside used to silently drop
          the aside (the flatPanel branch returned before split was
          checked). DurationBlock + MonitoringBlock pass all three; the
          metadata aside (Decision branches · N paths / Reassess targets
          · N items) was invisible. Now flatPanel + split renders the
          grid WITHOUT the panel chrome; non-split flatPanel stays as a
          bare wrapper; non-flatPanel uses the full chrome treatment. */}
      {flatPanel ? (
        split && aside ? (
          <div
            id={bodyId}
            hidden={_isCollapsed}
            data-section-body
            data-section-split-grid
            className="rx-section-split"
            style={{
              position: "relative",
              zIndex: 2,
              display: "grid",
              gridTemplateColumns: "minmax(0, 65fr) minmax(0, 35fr)",
              gap: 20,
              alignItems: "start",
            }}
          >
            <div style={{ minWidth: 0 }}>{children}</div>
            <aside
              data-section-aside
              style={{
                minWidth: 0,
                paddingLeft: 16,
                borderLeft: "1px solid var(--line2)",
                fontSize: 12,
                color: "var(--ink2)",
                lineHeight: 1.55,
              }}
            >
              {aside}
            </aside>
          </div>
        ) : (
          <div id={bodyId} hidden={_isCollapsed} style={{ position: "relative", zIndex: 2 }}>
            {children}
          </div>
        )
      ) : (
        <div
          id={bodyId}
          hidden={_isCollapsed}
          data-section-body
          style={{
            position: "relative",
            zIndex: 2,
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: sticky ? "20px 20px 18px" : 18,
            boxShadow: sticky ? "var(--shadow-e2)" : "var(--shadow-e1)",
            transition: "box-shadow var(--duration-base) var(--ease-out)",
            ...(sticky ? { borderTop: "3px solid var(--ox)" } : {}),
          }}
        >
          {split && aside ? (
            <div
              data-section-split-grid
              className="rx-section-split"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 65fr) minmax(0, 35fr)",
                gap: 20,
                alignItems: "start",
              }}
            >
              <div style={{ minWidth: 0 }}>{children}</div>
              <aside
                data-section-aside
                style={{
                  minWidth: 0,
                  paddingLeft: 16,
                  borderLeft: "1px solid var(--line2)",
                  fontSize: 12,
                  color: "var(--ink2)",
                  lineHeight: 1.55,
                }}
              >
                {aside}
              </aside>
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </section>
  );
}

export { Section };
