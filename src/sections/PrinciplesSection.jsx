/* section · PrinciplesSection — PRINCIPLES section of the 5-section IA.
   Renders the union of the legacy renderApproach + renderCourse +
   renderAdjuncts tabs (approach / course / adjuncts) selected by the
   `activeTab` prop, which the parent's section sub-nav controls.

   Wave 8 W8 · MAGAZINE REWRITE
   ----------------------------
   This is a full editorial pass on top of the W7 foundation. The
   information architecture is unchanged — every list, table, tree,
   and reference still renders — but the chrome is now magazine-grade:

     P1  · 96px italic-serif HERO with 240px italic "P" watermark,
            italic standfirst, and 3-stop gradient hairline divider.
     P2  · Sub-tab indicator rail (approach / course / adjuncts) as
            a glass container with asymmetric 14/4 radius. Active
            tab uses a cyan-deep → cyan-bright gradient with glow;
            inactive tabs are transparent with ink2 type.
     P3  · The seven-step reasoning sequence renders as an asymmetric
            60/40 split per card — 64px italic-serif step numeral in
            cyan-soft outline (text-stroke + transparent fill) on the
            left, prose on the right. Each card has a cyan accent
            strip across the top and lifts on hover.
     P4  · The sepsis first-hour flow is now a horizontal scroll
            deck of 280px asymmetric cards joined by a gradient
            horizontal track; gradient accent dots mark each step.
     P5  · Each of the four decision trees is wrapped in a glass
            container with a vertical mono left-rail running "DECISION
            TREE / 0n" rotated 90deg, asymmetric 18/4 outer radius,
            and --shadow-e2.
     P6  · OPAT, IV→PO, PROPHYLAXIS, EVOLVING all get the magazine
            sub-section head: mono kicker, 36px italic-serif headline,
            cyan accent dot, 32px gradient hairline starter, italic
            serif lede beneath.
     P7  · The references list is a 2-col masonry grid of citation
            cards; year on the left in cyan numeric-mega, italic
            serif title + body + journal on the right. Hover lift +
            cyan border.

   Cross-section constraints:
     · `.rx-fade-in-up` is applied to article children with stagger
       delay via inline animationDelay so the panel reveals in cadence.
     · Decor primitives (GradientHairline, Sparkle, WatermarkLetter,
       DottedGrid as backdrop, Stripes as accent) are reached for in
       the hero + sub-section heads.
     · Kinetic type — `.rx-display-l`, `.rx-counter`, `.rx-numeric-mega`,
       `.rx-mixed-pair` — is used wherever a number wants to sing.

   Zero functional changes; zero new props; zero new data. The component
   surface (prop signature, exported name, rendered DOM ids like
   #alg-<id>) is byte-stable so the command palette, section-nav,
   and deep-link scrolling all continue to work as before.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import {
  Activity, AlertTriangle, ArrowRight, BookOpen, Check, ChevronRight,
  Clock, CornerDownRight, Crosshair, GitBranch, Hospital, Info,
  Layers, ListChecks, Plus, Scissors, TrendingDown, X, Zap,
} from "lucide-react";
import { Cite, Ev, SectionDisc } from "../components/primitives";
import { IVtoPO, RapidDxTimeout } from "../components/cards";
import { SEPSIS_FLOW, PROPHYLAXIS, OPAT, TREES } from "../data/content";
import { TREE_ICON } from "../data/ui-maps";
import { EVOLVING, REFS, DURATIONS, DUR_MAX, DUR_BY_DX, CLOCK } from "../data/evidence";
import { SYNDROMES } from "../data/syndromes";
import { GradientHairline } from "../components/decor/GradientHairline";
import { Sparkle } from "../components/decor/Sparkle";
import { WatermarkLetter } from "../components/decor/WatermarkLetter";
import { DottedGrid } from "../components/decor/DottedGrid";
import { Stripes } from "../components/decor/Stripes";
import { MeshWash } from "../components/decor/MeshWash";
import { StickySubTOC } from "../components/decor/StickySubTOC";
import { NotchedBanner } from "../components/decor/NotchedBanner";
import { SceneBreak } from "../components/decor/SceneBreak";

/* ============================================================
   Wave 8 W8 · magazine design tokens (with W7 fallbacks)
   The neon palette graduated from accent to primary in W7; the W8
   editorial rewrite leans into the cyan spectrum with deep / bright
   stops for gradient surfaces (the active sub-tab, the per-card
   accent strip, the watermark, the citation-card border).
   ============================================================ */
const CYAN_DEEP    = "var(--electric-blue, var(--w7-neon, var(--ox)))";
const CYAN_BRIGHT  = "var(--neon-cyan, var(--w7-neon, var(--ox)))";
const CYAN_SOFT    = "var(--neon-cyan-soft, rgba(0, 212, 255, 0.10))";
const CYAN_LINE    = "var(--neon-cyan-line, rgba(0, 212, 255, 0.32))";
const CYAN_GLOW    = "var(--neon-cyan-glow, 0 0 24px rgba(0, 212, 255, 0.35))";

const W7_NEON   = "var(--w7-neon, var(--ox-bright, #9B2D2F))";
const W7_KICKER = "var(--w7-kicker, var(--muted, #6E675E))";
const W7_LINE   = "var(--w7-hairline, var(--ox-line, #E2C7C4))";
const W7_GLASS_BG     = "var(--w7-glass-bg, rgba(255, 255, 255, 0.72))";
const W7_GLASS_BORDER = "var(--w7-glass-border, var(--line, #E6E0D8))";
const W7_GLASS_SHADOW = "var(--w7-glass-shadow, 0 2px 8px rgba(15, 23, 42, 0.04), 0 12px 32px -16px rgba(15, 23, 42, 0.10))";

/* Static descriptors for the three sub-panels — used by the magazine
   hero, the sub-tab indicator rail, and the "you are here" counter.
   Keeping the metadata in one tuple keeps the three panels in lockstep
   if the IA grows. */
const W8_SUBTABS = [
  { id: "approach", n: "01", label: "Approach",  hint: "Reasoning sequence" },
  { id: "course",   n: "02", label: "Course",    hint: "Duration · de-escalation" },
  { id: "adjuncts", n: "03", label: "Adjuncts",  hint: "Prophylaxis · evidence" },
];

/* ============================================================
   W8 · P1 — MAGAZINE HERO
   96px italic serif title, 240px italic "P" watermark dropped into
   the top-right margin, italic-serif standfirst, 3-stop gradient
   hairline divider. The dotted grid sits behind the hero as a faint
   atmospheric backdrop. The whole header is positioned so the
   absolutely-positioned watermark and grid stay in scope.
   ============================================================ */
function W8MagazineHero({ kicker, title, standfirst, watermark = "P", counter }) {
  return (
    <header
      className="rx-fade-in-up rx-magazine-hero"
      style={{
        position: "relative",
        margin: "0 0 36px",
        padding: "32px 28px 24px",
        overflow: "hidden",
        borderRadius: "18px 4px 18px 4px",
        background: "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.18))",
        border: `1px solid ${W7_GLASS_BORDER}`,
        boxShadow: W7_GLASS_SHADOW,
      }}
    >
      {/* Wave 9 W9 · pearlescent / liquid-metal wash behind the Principles
          hero. cyan-only palette so it reads as cool-chrome rather than
          the saturated chord on Syndromes. Matches the editorial weight
          of the other reference heroes. */}
      <MeshWash variant="full" intensity="soft" palette="cyan-only" />
      <DottedGrid size={28} opacity={0.35} />

      <div style={{ position: "relative" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.22em",
          textTransform: "uppercase", color: W7_KICKER, marginBottom: 18,
        }}>
          <span aria-hidden="true" style={{
            display: "inline-block", width: 8, height: 8, borderRadius: 999,
            background: CYAN_BRIGHT,
            boxShadow: `0 0 0 3px ${CYAN_SOFT}, ${CYAN_GLOW}`,
          }}/>
          <span>{kicker}</span>
          <Sparkle size={11} color={CYAN_BRIGHT} />
          {counter && (
            <>
              <span aria-hidden="true" style={{ opacity: 0.45 }}>·</span>
              <span className="rx-counter" style={{ fontSize: 11, color: W7_KICKER }}>{counter}</span>
            </>
          )}
        </div>

        <h1 style={{
          fontFamily: "var(--serif)", fontStyle: "italic",
          fontSize: "clamp(56px, 9vw, 96px)", lineHeight: 0.94,
          letterSpacing: "-0.028em", fontWeight: 700,
          margin: "0 0 18px", color: "var(--ink)",
          maxWidth: "16ch",
        }}>{title}</h1>

        <p style={{
          fontFamily: "var(--serif)", fontStyle: "italic",
          fontSize: 20, lineHeight: 1.5, color: "var(--ink2)",
          margin: "0 0 24px", maxWidth: "62ch",
        }}>{standfirst}</p>

        {/* 3-stop gradient hairline divider */}
        <div aria-hidden="true" style={{
          height: 2, width: "100%",
          background: `linear-gradient(90deg, ${CYAN_BRIGHT} 0%, ${CYAN_DEEP} 38%, ${W7_LINE} 70%, transparent 100%)`,
          borderRadius: 2,
          opacity: 0.88,
        }}/>
      </div>
    </header>
  );
}

/* ============================================================
   W8 · P2 — SUB-TAB INDICATOR RAIL
   A glass container with 14/4 asymmetric radii hosts three pills:
   active uses a cyan-deep → cyan-bright gradient and cyan glow;
   inactive sit transparent with ink2 type. This is presentation
   only — the routing is owned by App.jsx; the rail mirrors the
   parent's `activeTab` so the section reads as self-contained.
   ============================================================ */
function W8SubTabRail({ activeTab }) {
  return (
    <nav
      className="rx-fade-in-up"
      aria-label="Principles sub-section indicator"
      style={{
        position: "relative",
        margin: "0 0 32px",
        padding: 6,
        borderRadius: "14px 4px 14px 4px",
        background: "rgba(255, 255, 255, 0.55)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${W7_GLASS_BORDER}`,
        boxShadow: W7_GLASS_SHADOW,
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        animationDelay: "60ms",
      }}
    >
      {W8_SUBTABS.map(t => {
        const active = t.id === activeTab;
        return (
          <div
            key={t.id}
            data-active={active ? "true" : "false"}
            aria-current={active ? "page" : undefined}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "12px 16px",
              borderRadius: "10px 2px 10px 2px",
              background: active
                ? `linear-gradient(135deg, ${CYAN_DEEP} 0%, ${CYAN_BRIGHT} 100%)`
                : "transparent",
              boxShadow: active ? CYAN_GLOW : "none",
              color: active ? "#fff" : "var(--ink2)",
              transition: "background var(--duration-base, 180ms) var(--ease-out, ease), color var(--duration-base, 180ms) var(--ease-out, ease), box-shadow var(--duration-base, 180ms) var(--ease-out, ease)",
            }}
          >
            <span style={{
              fontFamily: "var(--mono)", fontSize: 10,
              letterSpacing: "0.22em", textTransform: "uppercase",
              opacity: active ? 0.92 : 0.7,
            }}>{t.n}</span>
            <span style={{
              fontFamily: "var(--serif)", fontStyle: "italic",
              fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em",
              flex: 1, textAlign: "center",
            }}>{t.label}</span>
            <span style={{
              fontFamily: "var(--mono)", fontSize: 10,
              letterSpacing: "0.08em", opacity: 0.78,
              display: "none",
            }} className="rx-subtab-hint">{t.hint}</span>
            {active && <Sparkle size={10} color="#fff" style={{ opacity: 0.95 }} />}
          </div>
        );
      })}
    </nav>
  );
}

/* ============================================================
   W8 · P6 — MAGAZINE SUB-SECTION HEAD
   Mono kicker · cyan accent dot · 32px gradient hairline starter ·
   36px italic-serif sub-headline · italic-serif lede beneath.
   Replaces the previous W7SubHead in editorial weight.
   ============================================================ */
function W8SubHead({ kicker, title, lede, icon, id, important = false }) {
  return (
    <div id={id} className="rx-fade-in-up" style={{ margin: "40px 0 18px", position: "relative", scrollMarginTop: "100px" }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.22em",
        textTransform: "uppercase", color: W7_KICKER, marginBottom: 12,
      }}>
        <span aria-hidden="true" style={{
          display: "inline-block", width: 8, height: 8, borderRadius: 999,
          background: CYAN_BRIGHT,
          boxShadow: `0 0 0 3px ${CYAN_SOFT}, 0 0 10px ${CYAN_LINE}`,
        }}/>
        {kicker}
      </div>
      {/* 32px gradient hairline starter — runs only as far as the kicker */}
      <div aria-hidden="true" style={{
        height: 2, width: 88, borderRadius: 2,
        background: `linear-gradient(90deg, ${CYAN_BRIGHT}, ${CYAN_DEEP} 60%, transparent)`,
        marginBottom: 12,
      }}/>
      <h3 style={{
        fontFamily: "var(--serif)", fontStyle: "italic",
        fontSize: "clamp(28px, 3.2vw, 36px)", lineHeight: 1.16,
        letterSpacing: "-0.018em", margin: 0, fontWeight: 700,
        color: "var(--ink)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        {icon && <span style={{ color: "var(--ox)", display: "inline-flex" }}>{icon}</span>}
        {title}
        {important && <Sparkle size={13} color={CYAN_BRIGHT} style={{ marginLeft: 6, opacity: 0.95 }} />}
      </h3>
      {lede && (
        <p
          className="rx-dropcap-cyan"
          style={{
            fontFamily: "var(--serif)", fontStyle: "italic",
            fontSize: 16, lineHeight: 1.6, color: "var(--ink2)",
            margin: "12px 0 0", maxWidth: "70ch",
          }}
        >{lede}</p>
      )}
    </div>
  );
}

/* Glass-style container with asymmetric radii — soft elevation panel
   used to host decision trees, sepsis flow, and similar visually
   prominent blocks. Inherited from the W7 foundation. */
function W7Glass({ children, flip = false, style = {}, ...rest }) {
  const radii = flip
    ? { borderRadius: "4px 16px 4px 16px" }
    : { borderRadius: "16px 4px 16px 4px" };
  return (
    <div style={{
      background: W7_GLASS_BG,
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      border: `1px solid ${W7_GLASS_BORDER}`,
      boxShadow: W7_GLASS_SHADOW,
      /* W12 viewport density · clamp the glass-card gutter so 768-wide
         devices don't waste a full 20px frame around terse content. */
      padding: "clamp(14px, 1.6vw, 20px)",
      ...radii,
      ...style,
    }} {...rest}>{children}</div>
  );
}

/* ============================================================
   W8 · P3 — REASONING SPINE STEP CARD
   60/40 asymmetric split — 40% left rail with a 64px italic-serif
   numeral rendered as text-stroke + transparent fill (so the digit
   reads as outlined silhouette); 60% right column with the heading
   and prose. Cyan accent strip across the top. 14/4 asymmetric
   radius. Hover lifts the card by 3px and adds cyan glow.
   ============================================================ */
function W8StepCard({ index, heading, body, delay = 0 }) {
  const [hover, setHover] = React.useState(false);
  return (
    <article
      className="rx-step rx-fade-in-up rx-card-interactive"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "minmax(0, 40fr) minmax(0, 60fr)",
        gap: 24,
        padding: "22px 22px 22px 22px",
        marginTop: 14,
        background: "rgba(255,255,255,0.78)",
        border: `1px solid ${W7_GLASS_BORDER}`,
        borderRadius: "14px 4px 14px 4px",
        boxShadow: hover
          ? `${W7_GLASS_SHADOW}, ${CYAN_GLOW}`
          : W7_GLASS_SHADOW,
        transform: hover ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 220ms var(--ease-out, ease), box-shadow 220ms var(--ease-out, ease)",
        animationDelay: `${delay}ms`,
        overflow: "hidden",
      }}
    >
      {/* Cyan accent strip across the top of each card */}
      <span aria-hidden="true" style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${CYAN_BRIGHT}, ${CYAN_DEEP} 55%, transparent)`,
      }} />

      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "flex-start",
        gap: 10, paddingTop: 6,
      }}>
        <span
          aria-hidden="true"
          /* W12 a11y TODO · this decorative 64px outlined ordinal trips
             axe-core because color:transparent computes as the paper bg
             (1.03:1). aria-hidden does NOT exempt SC 1.4.3 in axe's
             colour-contrast rule. A clean fix is an architectural one:
             render the outlined glyph as an inline SVG (graphical, not
             text), or move the numeral into a CSS pseudo-element. Both
             are larger than this audit's scope — flagged for follow-up. */
          style={{
            fontFamily: "var(--serif)", fontStyle: "italic",
            fontSize: 64, lineHeight: 0.9, fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "transparent",
            WebkitTextStroke: `1.5px ${CYAN_BRIGHT}`,
            display: "inline-block",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        {/* W12 a11y · 10px muted text was 4.4:1 against the panel bg
            (just under 4.5:1) — bumped to --ink2 (~13:1) so the tiny
            mono counter clears AA at its current size. */}
        <span className="rx-counter" style={{ fontSize: 10, color: "var(--ink2)" }}>
          STEP / {String(index + 1).padStart(2, "0")} OF 07
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
        <h4 style={{
          fontFamily: "var(--serif)", fontSize: 19, fontWeight: 700,
          letterSpacing: "-0.01em", lineHeight: 1.28, margin: 0,
          color: "var(--ink)",
        }}>{heading}</h4>
        <p style={{
          fontFamily: "var(--serif)", fontSize: 15, lineHeight: 1.6,
          color: "var(--ink2)", margin: 0,
        }}>{body}</p>
      </div>
    </article>
  );
}

/* ============================================================
   W8 · P4 — SEPSIS FIRST-HOUR FLOW (horizontal scroll deck)
   Each step is a 280px asymmetric card with a gradient accent dot,
   joined by a 2px gradient horizontal track. The active step (always
   the first by default for the static flow) carries a cyan glow and
   sits 3px above its peers.
   ============================================================ */
function W8SepsisFlowDeck() {
  return (
    <div className="rx-fade-in-up" style={{ position: "relative", margin: "0 0 8px" }}>
      {/* Gradient horizontal track */}
      <div aria-hidden="true" style={{
        position: "absolute", left: 12, right: 12, top: 56, height: 2,
        background: `linear-gradient(90deg, ${CYAN_BRIGHT}, ${CYAN_DEEP} 30%, ${W7_LINE} 70%, transparent)`,
        borderRadius: 2, opacity: 0.7,
        pointerEvents: "none",
      }}/>
      <div
        role="group"
        tabIndex={0}
        aria-label="Sepsis first-hour sequence (scrollable)"
        style={{
          display: "flex", gap: 18, overflowX: "auto",
          paddingBottom: 10, paddingTop: 0,
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {SEPSIS_FLOW.map((s, i) => {
          const isStart = s.kind === "start";
          const isEnd   = s.kind === "end";
          const accent  = isStart ? CYAN_BRIGHT : isEnd ? CYAN_DEEP : CYAN_BRIGHT;
          return (
            <article
              key={i}
              className={isStart ? "rx-glass-bleed rx-iridescent-border rx-glow-lift" : "rx-glass-bleed rx-glow-lift"}
              style={{
                position: "relative",
                flex: "0 0 280px",
                scrollSnapAlign: "start",
                padding: "16px 18px 18px",
                background: "rgba(255,255,255,0.82)",
                border: `1px solid ${isStart ? CYAN_LINE : W7_GLASS_BORDER}`,
                borderRadius: i % 2 === 0 ? "14px 4px 14px 4px" : "4px 14px 4px 14px",
                boxShadow: isStart
                  ? `${W7_GLASS_SHADOW}, ${CYAN_GLOW}`
                  : W7_GLASS_SHADOW,
                transform: isStart ? "translateY(-3px)" : "translateY(0)",
                transition: "transform var(--duration-base, 180ms) var(--ease-out, ease)",
              }}
            >
              <div style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
              }}>
                <span aria-hidden="true" style={{
                  display: "inline-block", width: 14, height: 14, borderRadius: 999,
                  background: `linear-gradient(135deg, ${CYAN_BRIGHT}, ${CYAN_DEEP})`,
                  boxShadow: isStart ? CYAN_GLOW : "none",
                  flex: "0 0 14px",
                }} />
                <span className="rx-counter" style={{ fontSize: 10, color: accent }}>
                  {String(i + 1).padStart(2, "0")} / {String(SEPSIS_FLOW.length).padStart(2, "0")}
                </span>
              </div>
              <h5 style={{
                fontFamily: "var(--serif)", fontStyle: "italic",
                fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em",
                lineHeight: 1.2, margin: "0 0 6px", color: "var(--ink)",
              }}>{s.lab}</h5>
              <p style={{
                fontFamily: "var(--serif)", fontSize: 13, lineHeight: 1.5,
                color: "var(--ink2)", margin: 0,
              }}>{s.tx}</p>
              {i < SEPSIS_FLOW.length - 1 && (
                <span aria-hidden="true" style={{
                  position: "absolute",
                  right: -14, top: 56, transform: "translateY(-50%)",
                  color: "var(--ox)", display: "inline-flex",
                  filter: "drop-shadow(0 0 6px rgba(0,212,255,0.4))",
                }}>
                  <ArrowRight size={18}/>
                </span>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   W8 · P5 — DECISION-TREE GLASS WRAPPER
   The tree itself uses the existing .rx-tnode shapes (asymmetric
   14/4 from the foundation). The wrapper adds: rgba glass background,
   18/4 asymmetric outer radius, --shadow-e2 elevation, and a vertical
   mono left-rail label running 90deg-rotated that reads
   "DECISION TREE / 0n". The rail sits in a 32px gutter so the body
   columns are not affected.
   ============================================================ */
function W8TreeContainer({ index, total, children }) {
  return (
    <div className="rx-fade-in-up" style={{
      position: "relative",
      paddingLeft: 36,
      animationDelay: `${index * 60}ms`,
    }}>
      <span aria-hidden="true" style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: 28,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--mono)", fontSize: 10,
        letterSpacing: "0.34em", textTransform: "uppercase",
        color: W7_KICKER,
        writingMode: "vertical-rl",
        transform: "rotate(180deg)",
        userSelect: "none",
      }}>
        DECISION TREE · {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
      <span aria-hidden="true" style={{
        position: "absolute", left: 14, top: 8, bottom: 8, width: 2,
        background: `linear-gradient(180deg, ${CYAN_BRIGHT}, ${CYAN_DEEP} 40%, transparent)`,
        borderRadius: 2,
        opacity: 0.7,
      }} />
      <div style={{
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: `1px solid ${W7_GLASS_BORDER}`,
        boxShadow: "var(--shadow-e2)",
        borderRadius: "18px 4px 18px 4px",
        /* W12 viewport density · clamp 22 → 16 at the narrow end so the
           glass panel stays generous on a 1440 canvas but tightens up on a
           768-wide phablet where 22px chewed the readable text column. */
        padding: "clamp(16px, 1.8vw, 22px)",
      }}>
        {children}
      </div>
    </div>
  );
}

/* ============================================================
   W8 · P7 — CITATION CARD (2-col masonry)
   Asymmetric 14/4 radius. Left: year in cyan numeric-mega. Right:
   italic serif title + author/journal in mono. Hover lift + cyan
   border + cyan glow.
   ============================================================ */
function W8CitationCard({ id, year, body, title, journal, onOpen, delay = 0 }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={() => onOpen(id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="rx-fade-in-up rx-glass-diffuse"
      style={{
        textAlign: "left",
        display: "grid",
        gridTemplateColumns: "minmax(78px, 96px) 1fr",
        gap: 18,
        padding: "16px 18px",
        background: "rgba(255,255,255,0.82)",
        border: `1px solid ${hover ? CYAN_LINE : W7_GLASS_BORDER}`,
        borderRadius: "14px 4px 14px 4px",
        boxShadow: hover ? `${W7_GLASS_SHADOW}, ${CYAN_GLOW}` : W7_GLASS_SHADOW,
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 220ms var(--ease-out, ease), box-shadow 220ms var(--ease-out, ease), border-color 220ms var(--ease-out, ease)",
        cursor: "pointer",
        font: "inherit",
        color: "inherit",
        appearance: "none",
        WebkitAppearance: "none",
        breakInside: "avoid",
        marginBottom: 14,
        animationDelay: `${delay}ms`,
      }}
      aria-label={`Open evidence card for ${title}`}
    >
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", paddingTop: 2 }}>
        <span
          className="rx-numeric-mega"
          style={{
            fontSize: 42,
            color: "var(--ox)",
            lineHeight: 1,
            letterSpacing: "-0.01em",
          }}
        >
          {year || "—"}
        </span>
        <span className="rx-counter" style={{ marginTop: 8, fontSize: 10, color: W7_KICKER }}>
          {body}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
        <h5 style={{
          fontFamily: "var(--serif)", fontStyle: "italic",
          fontSize: 15, fontWeight: 700, lineHeight: 1.3,
          margin: 0, color: "var(--ink)", letterSpacing: "-0.005em",
        }}>{title}</h5>
        <span style={{
          fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink2)",
          lineHeight: 1.5,
        }}>{journal}</span>
        <span style={{
          fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.16em",
          textTransform: "uppercase", color: "var(--ox)",
          display: "inline-flex", alignItems: "center", gap: 4, marginTop: 2,
        }}>
          Open evidence card <ChevronRight size={12}/>
        </span>
      </div>
    </button>
  );
}

function PrinciplesSection({
  activeTab,            // "approach" | "course" | "adjuncts" — controlled by App's sub-nav
  setTab,               // handler to switch sub-tab (kept for signature symmetry)
  ctx, d, dose,         // patient context + derived quantities + dose() lookup (signature symmetry)
  openDrug, openOrg, openTrial,
}) {
  /* ====================================================================
     PANEL: APPROACH — Editorial layout of the empiric reasoning sequence,
     the sepsis first-hour deck, the broaden/withhold pair, and the four
     decision trees. */
  const approachPanel = (
    <>
      <W8MagazineHero
        kicker="PRINCIPLES · APPROACH"
        title="Empiric principles"
        standfirst="The reasoning sequence behind every empiric regimen. Severity → source → spectrum → adjustment."
        watermark="P"
        counter="01 / 03"
      />
      {/* W12 · removed redundant W8SubTabRail — duplicated App.jsx sub-tab strip */}
      <SectionDisc />

      {/* W9 · Sticky sub-TOC for in-section navigation across the
          four long sub-sections of the approach panel. */}
      <StickySubTOC items={[
        { id: "sub-approach-sequence", label: "Sequence" },
        { id: "sub-approach-sepsis",   label: "Sepsis first hour" },
        { id: "sub-approach-trigger",  label: "Broaden / withhold" },
        { id: "sub-approach-algos",    label: "Algorithms" },
      ]} />

      <div className="rx-quick rx-fade-in-up" style={{ animationDelay: "120ms" }}>
        <div className="rx-qc"><div className="k"><Zap size={13}/> A time-limited bridge</div><div className="b">In septic shock, deliver effective therapy within <b>one hour</b>. Empiric breadth is provisional — reassess against culture data at <b>48&ndash;72 hours</b> in every case.</div></div>
        <div className="rx-qc"><div className="k"><Crosshair size={13}/> Source determines all</div><div className="b">The probable organisms, the appropriate agent, and the treatment duration each follow from the <b>anatomic source</b>. An undrained focus is not salvaged by any antibiotic.</div></div>
        <div className="rx-qc"><div className="k"><TrendingDown size={13}/> De-escalation is standard</div><div className="b">Narrowing to the single most targeted agent does <b>not</b> compromise outcomes; it reduces resistance selection, toxicity, and <i>C. difficile</i> risk.</div></div>
      </div>

      {/* ---- P3 · Reasoning spine (asymmetric stepped cards) ---- */}
      <W8SubHead
        id="sub-approach-sequence"
        kicker="SEQUENCE · 01"
        icon={<ListChecks size={20}/>}
        title="The empiric reasoning sequence"
        lede="Seven questions, addressed in order. Each constrains the next: the anatomic source predicts the flora, the flora and host define the spectrum, and the spectrum and site determine the agent and its dose."
        important
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {[
          ["Is this infection, and is it severe?","Distinguish infection from colonization and from non-infectious inflammation. Establish whether sepsis or septic shock is present, as this sets both the urgency and the required breadth. Obtain cultures before antibiotics whenever doing so will not delay therapy in shock."],
          ["What is the anatomic source?","The source predicts the likely flora and dictates the regimen. Commit to the most probable site and cover its characteristic pathogens; an unstated source is an unstated organism list."],
          ["What are the likely organisms?","From the source and host, enumerate the realistic pathogens. Cover what is plausible rather than everything conceivable. The spectrum matrix and syndrome cards make this explicit."],
          ["What are the host's resistance risks?","Prior resistant isolates, recent antimicrobial exposure or hospitalization, indwelling devices, immunosuppression, and relevant travel raise the empiric ceiling. The local antibiogram calibrates the remainder."],
          ["Which agent, and at what dose?","Select the narrowest agent that reliably covers the plausible pathogens. Dose for the site of infection (central nervous system, bone, deep focus) and for renal function, while giving a full first dose regardless of clearance."],
          ["When and how will therapy be narrowed?","Pre-commit to reassessment at 48–72 hours: culture data and clinical trajectory guide de-escalation to a single targeted agent, intravenous-to-oral conversion, and discontinuation of redundant coverage."],
          ["What is the duration and the stop date?","Establish an evidence-based duration at the outset. Most courses are shorter than traditional practice; document the stop date in the plan rather than deferring indefinitely."],
        ].map(([h, b], i) => (
          <W8StepCard key={i} index={i} heading={h} body={b} delay={140 + i * 50} />
        ))}
      </div>

      {/* Wave 12 W12 · breathing room between the reasoning sequence and
          the sepsis first-hour deck — they are sibling chapters of the
          Approach panel and the ornament dingbat lets the eye reset. */}
      <SceneBreak variant="ornament" style={{ margin: "24px 0 12px" }} />

      {/* ---- P4 · Sepsis first-hour horizontal scroll deck ---- */}
      <W8SubHead
        id="sub-approach-sepsis"
        kicker="SEQUENCE · 02"
        icon={<Activity size={20}/>}
        title="Sepsis and septic shock: the first-hour sequence"
        lede="A five-step bridge from recognition to a defined stop date. Scroll horizontally on narrow viewports — each card snaps into position."
      />
      <W8SepsisFlowDeck />

      {/* ---- Trigger pair (broaden / withhold) ---- */}
      <W8SubHead
        id="sub-approach-trigger"
        kicker="DECISION"
        icon={<GitBranch size={20}/>}
        title="Indications to broaden or to withhold coverage"
        lede="Adding a layer is justified by a named risk; withholding it is justified by the absence of that risk."
      />
      {/* W9 · Notched-corner severity banners frame the broaden/withhold
          pair with an "industrial label" treatment. Decorative only —
          the existing trigger cards still carry the full body content. */}
      <div className="rx-fade-in-up" style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        marginBottom: 14,
      }}>
        <NotchedBanner
          severity="trigger"
          label="When to broaden"
          secondary="Add a named layer for a named risk"
          icon={<Plus size={15} aria-hidden="true" />}
        />
        <NotchedBanner
          severity="stable"
          label="When to withhold"
          secondary="Absent risk · spare the broad agent"
          icon={<Check size={15} aria-hidden="true" />}
        />
      </div>
      <div className="rx-trig rx-fade-in-up">
        <div className="rx-card rx-trigcard">
          <h4><span className="ic"><Plus size={15}/></span>Broaden coverage when</h4>
          <ul>
            <li><b>MRSA:</b> prior MRSA, purulent or device-associated source, severe sepsis, or high local prevalence &rarr; add vancomycin (linezolid for pulmonary infection).</li>
            <li><b>Pseudomonas:</b> neutropenia, structural lung disease, HAP/VAP, or recent broad-spectrum exposure &rarr; antipseudomonal &beta;-lactam.</li>
            <li><b>ESBL / resistant GNR:</b> prior isolate or high-prevalence exposure &rarr; empiric carbapenem.</li>
            <li><b>Septic shock:</b> the broadest defensible regimen with full loading doses within the hour.</li>
          </ul>
        </div>
        <div className="rx-card rx-trigcard">
          <h4><span className="ic"><Check size={15}/></span>Withhold or de-escalate when</h4>
          <ul>
            <li><b>No MRSA risk:</b> empiric vancomycin is not reflexive &mdash; it adds nephrotoxicity and an acute kidney injury signal alongside piperacillin-tazobactam.</li>
            <li><b>No Pseudomonas risk:</b> a narrower &beta;-lactam (ceftriaxone) suffices and spares antipseudomonal selection pressure.</li>
            <li><b>Cultures returned:</b> narrow to the single most targeted active agent at 48&ndash;72 hours.</li>
            <li><b>Stable and absorbing:</b> convert intravenous to oral therapy and set the stop date.</li>
          </ul>
        </div>
      </div>

      {/* ---- P5 · Decision trees in glass containers with rotated rail ---- */}
      <W8SubHead
        id="sub-approach-algos"
        kicker="ALGORITHMS"
        icon={<Layers size={20}/>}
        title="Core decision algorithms"
        lede="Four high-frequency decisions, each reducible to a single pivotal branch. Use the chip index for rapid jump-to; the full algorithm follows."
      />
      <div className="rx-algindex rx-fade-in-up">
        {TREES.map(tree => {
          const TI = TREE_ICON[tree.icon] || GitBranch;
          return (
            <a key={tree.id} href={"#alg-" + tree.id} className="rx-algchip"
               onClick={(e)=>{ e.preventDefault(); const el=document.getElementById("alg-"+tree.id); if(el) el.scrollIntoView({behavior:"smooth", block:"start"}); }}>
              <span className="rx-algchip-ic"><TI size={15}/></span>
              <span className="rx-algchip-tx"><span className="t">{tree.title}</span><span className="d">{tree.pivot}</span></span>
            </a>
          );
        })}
      </div>
      {TREES.map((tree, idx) => {
        const TI = TREE_ICON[tree.icon] || GitBranch;
        return (
          <div key={tree.id} id={"alg-" + tree.id} style={{margin: "26px 0 18px", scrollMarginTop: "16px"}}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginBottom: 10,
            }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 36, height: 36, borderRadius: "10px 2px 10px 2px",
                background: `linear-gradient(135deg, ${CYAN_DEEP}, ${CYAN_BRIGHT})`,
                color: "#fff", boxShadow: CYAN_GLOW,
              }}>
                <TI size={18}/>
              </span>
              <div>
                <span className="rx-counter" style={{ fontSize: 10, color: W7_KICKER }}>
                  ALGORITHM · {String(idx + 1).padStart(2, "0")} / {String(TREES.length).padStart(2, "0")}
                </span>
                <h4 style={{
                  fontFamily: "var(--serif)", fontStyle: "italic",
                  fontSize: 24, fontWeight: 700, letterSpacing: "-0.012em",
                  margin: "2px 0 0", color: "var(--ink)", lineHeight: 1.2,
                }}>{tree.title}</h4>
              </div>
            </div>
            <p style={{
              fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 15,
              lineHeight: 1.55, color: "var(--ink2)", margin: "0 0 12px",
              maxWidth: "68ch", paddingLeft: 48,
            }}>{tree.intro}</p>
            <W8TreeContainer index={idx} total={TREES.length}>
              <div className="rx-tree">
                {tree.nodes.map((node, ni) => (
                  <div className="rx-tnode" key={ni}>
                    <div className="rx-tq"><span className="dot rx-mono">{ni+1}</span><span className="q">{node.q}</span></div>
                    <div className="rx-tbranches">
                      {node.branches.map((br, bi) => (
                        <div className="rx-tbranch" key={bi}>
                          <span className="rx-tcond"><CornerDownRight size={12} aria-hidden style={{ color: "var(--ox)" }}/> {br.cond}</span>
                          <div className="rx-trx">{br.rx}</div>
                          <div className="rx-twhy">{br.why}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </W8TreeContainer>
          </div>
        );
      })}

      <div className="rx-diag-divider" aria-hidden="true" />
      <RapidDxTimeout onCite={(id)=>openTrial(id)} />
    </>
  );

  /* ====================================================================
     PANEL: COURSE — Duration, de-escalation, OPAT, iv→PO. All sub-section
     heads carry the new W8 magazine treatment. */
  const coursePanel = (
    <>
      <W8MagazineHero
        kicker="PRINCIPLES · COURSE"
        title="Duration & step-down"
        standfirst="Evidence-based courses are shorter than traditional practice. Fix the duration at the outset; start the clock at the appropriate moment; convert to oral therapy once the criteria are met."
        watermark="C"
        counter="02 / 03"
      />
      {/* W12 · removed redundant W8SubTabRail — duplicated App.jsx sub-tab strip */}

      {/* W9 · Sticky sub-TOC across the four long sub-sections of the
          course panel. */}
      <StickySubTOC items={[
        { id: "sub-course-duration", label: "Duration" },
        { id: "sub-course-narrow",   label: "De-escalation" },
        { id: "sub-course-opat",     label: "OPAT" },
        { id: "sub-course-ivpo",     label: "IV → PO" },
      ]} />

      <W8SubHead
        id="sub-course-duration"
        kicker="DURATION"
        icon={<Clock size={20}/>}
        title="Evidence-based durations"
        lede="Most courses are set by randomized trial — the bar charts read against a common 42-day ceiling so the contrast is immediate."
        important
      />
      <div className="rx-card rx-fade-in-up" style={{padding: 0, overflow: "hidden"}}>
        <table className="rx-durtable">
          <thead><tr><th>Indication</th><th style={{width: 170}}>Course</th><th>Days</th><th>Evidence</th></tr></thead>
          <tbody>
            {DURATIONS.map(g => (
              <React.Fragment key={g.group}>
                <tr className="rx-durgroup"><td colSpan={4}>{g.group}</td></tr>
                {g.rows.map((r, i) => (
                  <tr key={i}>
                    <td><div style={{fontWeight: 600}}>{r.dx}</div>{r.ext && <div className="rx-durext">{r.ext}</div>}</td>
                    <td>
                      <div className="rx-barwrap" title={r.days + " days"}>
                        <div className="rx-barbase" style={{width: Math.min(100, (r.base / DUR_MAX) * 100) + "%"}} />
                        {r.max > r.base && <div className="rx-barext" style={{left: (r.base / DUR_MAX) * 100 + "%", width: ((r.max - r.base) / DUR_MAX) * 100 + "%"}} />}
                      </div>
                    </td>
                    <td><span className="rx-durdays">{r.days}</span></td>
                    <td><Ev kind={r.ev} />{r.trial && <div style={{fontSize: 10, color: "var(--muted)", fontFamily: "var(--mono)", marginTop: 3}}>{r.trial}</div>}{(DUR_BY_DX[r.dx] || {}).ref && <div style={{marginTop: 4}}><Cite id={DUR_BY_DX[r.dx].ref} onClick={(cid)=>openTrial(cid)} /></div>}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rx-2col rx-fade-in-up" style={{marginTop: 18}}>
        <div className="rx-card rx-mini">
          <h4><span className="ic"><Clock size={15}/></span>Start the clock correctly</h4>
          <ul>{CLOCK.map((c, i) => <li key={i}><b>{c[0]}:</b> {c[1]}</li>)}</ul>
        </div>
        <IVtoPO onDrug={openDrug} />
      </div>

      <W8SubHead
        id="sub-course-narrow"
        kicker="NARROW"
        icon={<TrendingDown size={20}/>}
        title="De-escalation discipline"
        lede="A scheduled 48–72 hour reassessment is mandatory — the moment the empiric breadth is paid down."
      />
      {/* W9 · Asymmetric 1fr / clamp side-by-side — wider main card,
          narrow metadata aside with severity banners on wide viewports. */}
      <div className="rx-fade-in-up" style={{
        display: "grid",
        gridTemplateColumns: "1fr clamp(180px, 28vw, 320px)",
        gap: 16,
        alignItems: "start",
      }}>
        <div className="rx-card rx-mini" style={{ minWidth: 0 }}>
          <ul>
            <li><b>Reassess at 48–72 h in every patient.</b> Cultures and clinical trajectory drive the narrowing decision at a scheduled review.</li>
            <li><b>Narrow to one targeted agent.</b> De-escalation does not worsen outcomes and reduces resistance, C. difficile, and toxicity.</li>
            <li><b>Stop redundant coverage.</b> Drop empiric vancomycin at 48 h if MRSA is not isolated; collapse double Gram-negative coverage to a single active agent.</li>
            <li><b>Source control takes precedence over spectrum.</b> Apparent failure most often reflects an undrained focus rather than a resistant organism — re-image before escalating.</li>
            <li><b>Procalcitonin can support stopping</b> in respiratory infection and sepsis, but never gates starting therapy.</li>
          </ul>
        </div>
        <aside style={{ display: "grid", gap: 10 }}>
          <NotchedBanner
            severity="required"
            label="48–72 h gate"
            secondary="Scheduled reassessment"
            icon={<Clock size={14} aria-hidden="true" />}
          />
          <NotchedBanner
            severity="trigger"
            label="Apparent failure?"
            secondary="Re-image before escalating"
            icon={<AlertTriangle size={14} aria-hidden="true" />}
          />
          <NotchedBanner
            severity="stable"
            label="One targeted agent"
            secondary="De-escalate, don't broaden"
            icon={<Check size={14} aria-hidden="true" />}
          />
        </aside>
      </div>

      {/* ---- P6 · OPAT sub-section head ---- */}
      <W8SubHead
        id="sub-course-opat"
        kicker="OPAT"
        icon={<Hospital size={20}/>}
        title="Outpatient parenteral antimicrobial therapy"
        lede={OPAT.intro}
      />
      {/* W9 · Notched severity banner introducing the OPAT eligibility
          frame. Decorative only — the candidate criteria card retains
          the full body content. */}
      <NotchedBanner
        severity="required"
        label="Stable, definitive plan, working access"
        secondary="OPAT preconditions"
        icon={<Hospital size={15} aria-hidden="true" />}
        style={{ marginBottom: 12 }}
      />
      <div className="rx-2col rx-fade-in-up">
        <div className="rx-card rx-mini">
          <h4><span className="ic"><Check size={15}/></span>Candidate criteria</h4>
          <ul>{OPAT.criteria.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>
        <div className="rx-card" style={{padding: 0, overflow: "hidden"}}>
          <table className="rx-rentable">
            <thead><tr><th>Agent</th><th>OPAT role</th></tr></thead>
            <tbody>{OPAT.agents.map((a, i) => (<tr key={i}><td style={{fontWeight: 600, whiteSpace: "nowrap"}}>{a[0]}</td><td>{a[1]}</td></tr>))}</tbody>
          </table>
        </div>
      </div>
      <div className="rx-callout"><Info size={15}/><span>{OPAT.oral}</span></div>
      <div className="rx-diag-divider" aria-hidden="true" />

      {/* Wave 12 W12 · phrase break before IV → PO. The previous epoch
          was about durations and OPAT logistics; the next is about how
          we actually move the patient off the drip. "when to step down"
          announces the change in frame. */}
      <SceneBreak variant="phrase" mark="when to step down" style={{ margin: "20px 0 14px" }} />

      {/* ---- P6 · IV → PO sub-section head ---- */}
      <W8SubHead
        id="sub-course-ivpo"
        kicker="IV → PO"
        icon={<ArrowRight size={20}/>}
        title="Intravenous-to-oral conversion: bioavailability as the determinant"
        lede="The agent's oral bioavailability, not the severity label, decides whether the switch is sound. POET (endocarditis) and OVIVA (bone & joint) extended early oral therapy even into deep-seated infection."
      />
      <div className="rx-card rx-fade-in-up" style={{padding: 0, overflow: "hidden"}}>
        <table className="rx-rentable">
          <thead><tr><th>Agent</th><th>Oral F</th><th>IV : PO</th><th>Note</th></tr></thead>
          <tbody>
            <tr><td style={{fontWeight: 600}}>Levofloxacin / moxifloxacin</td><td className="rx-mono">~99%</td><td className="rx-mono">1 : 1</td><td>Essentially complete &mdash; switch is seamless.</td></tr>
            <tr><td style={{fontWeight: 600}}>Ciprofloxacin</td><td className="rx-mono">~70%</td><td className="rx-mono">400 IV &asymp; 500&ndash;750 PO</td><td>Separate from di-/trivalent cations by 2&ndash;4 h.</td></tr>
            <tr><td style={{fontWeight: 600}}>Linezolid</td><td className="rx-mono">~100%</td><td className="rx-mono">1 : 1</td><td>No advantage to IV once tolerating enteral.</td></tr>
            <tr><td style={{fontWeight: 600}}>Metronidazole</td><td className="rx-mono">~100%</td><td className="rx-mono">1 : 1</td><td>Reserve IV for the patient who cannot take oral.</td></tr>
            <tr><td style={{fontWeight: 600}}>TMP-SMX</td><td className="rx-mono">~90&ndash;100%</td><td className="rx-mono">1 : 1</td><td>Same exposure orally; watch K&#8314; and creatinine.</td></tr>
            <tr><td style={{fontWeight: 600}}>Doxycycline</td><td className="rx-mono">~90&ndash;100%</td><td className="rx-mono">1 : 1</td><td>Take with water, sit upright (esophagitis).</td></tr>
            <tr><td style={{fontWeight: 600}}>Fluconazole (cross-ref)</td><td className="rx-mono">~90%</td><td className="rx-mono">1 : 1</td><td>Antifungal &mdash; same principle; see the antifungal reference.</td></tr>
            <tr><td style={{fontWeight: 600}}>Clindamycin</td><td className="rx-mono">~90%</td><td className="rx-mono">~1 : 1</td><td>Reliable oral step-down for soft-tissue/toxin indications.</td></tr>
            <tr><td style={{fontWeight: 600}}>Azithromycin</td><td className="rx-mono">~37%</td><td className="rx-mono">1 : 1</td><td>Low serum but tissue/intracellular driven &mdash; dosed 1:1 by design.</td></tr>
            <tr><td style={{fontWeight: 600}}>Rifampin</td><td className="rx-mono">high</td><td className="rx-mono">1 : 1</td><td>Adjunct only; take on an empty stomach.</td></tr>
            <tr><td style={{fontWeight: 600}}>&beta;-lactams (amoxicillin, cephalexin, cefuroxime/cefpodoxime)</td><td className="rx-mono">~50&ndash;90%</td><td className="rx-mono">dose up</td><td>Lower/variable F &mdash; adequate for step-down in stable patients to complete a course, not for the unstable.</td></tr>
          </tbody>
        </table>
      </div>
      <div className="rx-2col rx-fade-in-up" style={{marginTop: "14px"}}>
        <div className="rx-mini">
          <h4><span className="ic"><Check size={16}/></span>Switch when all are true</h4>
          <ul>
            <li>Hemodynamically <b>stable and improving</b>; afebrile &asymp;24&ndash;48 h.</li>
            <li><b>Functioning, absorbing GI tract</b> and able to take oral.</li>
            <li>An oral agent with <b>adequate bioavailability and spectrum</b> for the pathogen.</li>
            <li><b>Source controlled</b> (drained/debrided) where applicable.</li>
          </ul>
        </div>
        <div className="rx-mini">
          <h4><span className="ic"><AlertTriangle size={16}/></span>Keep IV (or individualize) for</h4>
          <ul>
            <li>Endovascular infection, <b>CNS infection</b>, and undrained deep collections (unless an OVIVA/POET-type oral strategy is deliberately chosen with ID).</li>
            <li>Malabsorption, ileus, vomiting, or unreliable enteral access.</li>
            <li>No oral option with adequate F against the organism (e.g., most Pseudomonas outside the fluoroquinolones).</li>
          </ul>
        </div>
      </div>
    </>
  );

  /* ====================================================================
     PANEL: ADJUNCTS & EVIDENCE — Prophylaxis, scope, evolving fronts,
     the citation grid, and the combination-therapy pair. */
  const adjunctsPanel = (
    <>
      <W8MagazineHero
        kicker="PRINCIPLES · ADJUNCTS"
        title="Adjuncts & evidence"
        standfirst="Surgical prophylaxis (prevention, not treatment), the explicit scope boundary of this reference, and the primary sources behind every recommendation."
        watermark="A"
        counter="03 / 03"
      />
      {/* W12 · removed redundant W8SubTabRail — duplicated App.jsx sub-tab strip */}

      {/* W9 · Sticky sub-TOC across the five long sub-sections of the
          adjuncts panel. */}
      <StickySubTOC items={[
        { id: "sub-adj-prophy", label: "Prophylaxis" },
        { id: "sub-adj-scope",  label: "Scope" },
        { id: "sub-adj-evol",   label: "Evolving" },
        { id: "sub-adj-refs",   label: "References" },
        { id: "sub-adj-combo",  label: "Combination" },
      ]} />

      {/* ---- P6 · PROPHYLAXIS sub-section head ---- */}
      <W8SubHead
        id="sub-adj-prophy"
        kicker="PROPHYLAXIS"
        icon={<Scissors size={20}/>}
        title="Surgical antimicrobial prophylaxis"
        lede={PROPHYLAXIS.intro}
        important
      />
      <div className="rx-2col rx-fade-in-up" style={{marginBottom: 16}}>
        <div className="rx-card rx-mini">
          <h4><span className="ic"><ListChecks size={15}/></span>Principles</h4>
          <ul>{PROPHYLAXIS.principles.map((p, i) => <li key={i}><b>{p[0]}:</b> {p[1]}</li>)}</ul>
        </div>
        <div className="rx-card" style={{padding: 0, overflow: "hidden"}}>
          <table className="rx-rentable">
            <thead><tr><th>Procedure</th><th>Agent</th></tr></thead>
            <tbody>{PROPHYLAXIS.table.map((r, i) => (<tr key={i}><td style={{fontWeight: 600}}>{r[0]}</td><td>{r[1]}</td></tr>))}</tbody>
          </table>
        </div>
      </div>

      <W8SubHead
        id="sub-adj-scope"
        kicker="SCOPE"
        icon={<Layers size={20}/>}
        title="Scope of this reference"
        lede="What this surface covers and what it deliberately defers to a sibling reference."
      />
      <div className="rx-2col rx-fade-in-up">
        <div className="rx-card rx-mini">
          <h4><span className="ic"><Check size={15}/></span>In scope</h4>
          <ul>
            <li>Adult, hospital-based <b>antibacterial</b> selection, dosing, and duration</li>
            <li>Empiric and directed therapy across {SYNDROMES.length} inpatient syndromes</li>
            <li>Resistant Gram-negative strategy (IDSA 2024) and the resistance ladder</li>
            <li>Surgical prophylaxis and OPAT as the bordering blur outward</li>
          </ul>
        </div>
        <div className="rx-card rx-mini">
          <h4><span className="ic"><X size={15}/></span>Deliberately out of scope</h4>
          <ul>
            <li><b>Antifungals</b> (candidemia, invasive mold, PJP) — a separate reference</li>
            <li><b>Antivirals</b> (HSV, CMV, influenza, hepatitis, HIV) — a separate reference</li>
            <li>Antimycobacterial and antiparasitic therapy</li>
            <li>Pediatric and neonatal dosing; pregnancy-specific regimens</li>
          </ul>
        </div>
      </div>
      <div className="rx-callout"><Info size={15}/><span>Where a regimen above references an antifungal (empiric candidemia coverage in sepsis, neutropenic enterocolitis, persistent febrile neutropenia), the pointer is intentional — the agent and dose live in the antifungal reference.</span></div>

      {/* ---- P6 · EVOLVING sub-section head ---- */}
      <W8SubHead
        id="sub-adj-evol"
        kicker="EVOLVING"
        icon={<TrendingDown size={20}/>}
        title="What's changing"
        lede="Fronts where the evidence is actively moving — flagged so the guidance above is read with its half-life in mind."
      />
      <div className="rx-evolve rx-fade-in-up">
        {EVOLVING.map((e, i) => (
          <div className="rx-evcard rx-glow-lift" key={i} style={{ animationDelay: `${i * 40}ms` }}>
            <div className="evh">{e.h}{e.ref && <Cite id={e.ref} onClick={(cid)=>openTrial(cid)} />}</div>
            <p className="evb">{e.b}</p>
            <span className="evdir">{e.dir}</span>
          </div>
        ))}
      </div>

      {/* ---- P7 · REFERENCES masonry grid of citation cards ---- */}
      <W8SubHead
        id="sub-adj-refs"
        kicker="REFERENCES"
        icon={<BookOpen size={20}/>}
        title="Primary sources"
        lede={`${REFS.length} guidelines, trials, and consensus statements behind the recommendations on this page. Click a year to open the evidence card.`}
      />
      <Stripes variant="cyan" width={120} height={6} style={{ margin: "0 0 18px" }} />
      <div
        className="rx-fade-in-up"
        style={{
          columnCount: 2,
          columnGap: 18,
          columnFill: "balance",
        }}
      >
        {REFS.map((r, i) => {
          // r.tag is e.g. "IDSA 2024" — split off the year so the
          // citation card's left rail can display it standalone.
          const m = (r.tag || "").match(/^(.*?)\s*(\d{4})\s*$/);
          const body = m ? m[1] : r.tag;
          const year = m ? m[2] : "";
          return (
            <W8CitationCard
              key={r.id}
              id={r.id}
              year={year}
              body={body || "—"}
              title={r.t}
              journal={r.src}
              onOpen={openTrial}
              delay={Math.min(i * 30, 600)}
            />
          );
        })}
      </div>
      <GradientHairline variant="cyan-blue" withDot style={{ margin: "32px 0 24px" }} />

      <W8SubHead
        id="sub-adj-combo"
        kicker="COMBINATION"
        icon={<Plus size={20}/>}
        title="Combination therapy: established synergy versus unsupported use"
        lede="Adding a second agent is justified by a specific mechanism — synergy, guaranteeing one active drug against resistance, or toxin suppression. Reflexive continuation after culture-return is harm."
      />
      <div className="rx-2col rx-fade-in-up">
        <div className="rx-mini">
          <h4><span className="ic"><Check size={16}/></span>Where combination is supported</h4>
          <ul>
            <li><b>Enterococcal endocarditis</b> &mdash; ampicillin + ceftriaxone (E. faecalis) or ampicillin + gentamicin: documented bactericidal synergy.</li>
            <li><b>Empiric severe / neutropenic Pseudomonas</b> &mdash; two antipseudomonals empirically to raise the odds of one active agent, then <b>de-escalate to monotherapy</b> once susceptible.</li>
            <li><b>Necrotizing GAS / toxic shock</b> &mdash; &beta;-lactam + clindamycin for toxin suppression (Eagle effect).</li>
            <li><b>Prosthetic-material staph</b> (PJI, PVE, hardware) &mdash; add <b>rifampin</b> for biofilm (never alone).</li>
            <li><b>MBL-producing CRE</b> &mdash; ceftazidime-avibactam + aztreonam; selected MDR-GNR combinations.</li>
          </ul>
        </div>
        <div className="rx-mini">
          <h4><span className="ic"><X size={16}/></span>Where combination is not supported</h4>
          <ul>
            <li><b>Double Gram-negative coverage continued after susceptibilities</b> &mdash; no outcome benefit once one active agent is confirmed; de-escalate.</li>
            <li><b>&beta;-lactam + aminoglycoside &ldquo;synergy&rdquo; for Gram-negative bacteremia</b> &mdash; no mortality benefit, more nephrotoxicity.</li>
            <li><b>Redundant anaerobic cover</b> &mdash; metronidazole added to a carbapenem or piperacillin-tazobactam that already covers anaerobes.</li>
            <li><b>Empiric vancomycin continued</b> without MRSA evidence; &ldquo;broader is better&rdquo; as a reflex.</li>
          </ul>
        </div>
      </div>
      <div className="rx-callout"><TrendingDown size={15}/><span>The discipline is symmetrical with empiric breadth: start broad enough to be safe, then <b>de-escalate to the narrowest single agent the susceptibilities allow</b> &mdash; combination therapy earns its place only by a named mechanism, not by anxiety.</span></div>

      {/* Wave 12 W12 · end-of-panel signal closes the Principles read. */}
      <SceneBreak variant="minimal" style={{ margin: "36px 0 6px" }} />
      <div className="rx-counter" style={{
        textAlign: "center",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: ".24em",
        color: "var(--ink2)",
        textTransform: "uppercase",
        opacity: 0.7,
        marginBottom: 8,
      }}>
        end of principles
      </div>
    </>
  );

  if (activeTab === "course") return coursePanel;
  if (activeTab === "adjuncts") return adjunctsPanel;
  return approachPanel;
}

export { PrinciplesSection };
