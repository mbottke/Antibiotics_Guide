/* component · Bedside-mode shell.
   Phase 0 placed this component behind the `?bedside=1` URL flag as a stub.
   Phase A.1 wired the Case Bar; Phase A.2 mounts the Answer Canvas beneath.
   The shell owns the "edit vs view" toggle: once a case has a syndrome, the
   Case Bar collapses to a single-line summary so the Answer Canvas gets
   the full vertical real estate. The user can re-expand by clicking Edit.

   W8 chrome pass — the header strip is now a frosted-glass band that
   condenses on scroll, the global scroll progress strip lives at the very
   top of the viewport, and every chrome button carries the rx-magnetic +
   rx-shine-sweep micro-motion classes.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Search, Settings as SettingsIcon } from "lucide-react";
import { CaseBar } from "./CaseBar.jsx";
import { AnswerCanvas } from "./AnswerCanvas.jsx";
import { FontSizeControl } from "./FontSizeControl.jsx";
import { SettingsModal } from "./SettingsModal.jsx";
import { KeyboardShortcutsOverlay } from "./KeyboardShortcutsOverlay.jsx";
import { OnboardingModal } from "./OnboardingModal.jsx";
import { BrandMark } from "./BrandMark.jsx";
import { DensityToggle } from "./DensityToggle.jsx";
import { ScrollHeader } from "./ScrollHeader.jsx";
import { GlobalScrollProgress } from "./GlobalScrollProgress.jsx";
import { MeshWash } from "./decor/MeshWash.jsx";
import { useDensity } from "./util/useDensity.js";
import { useScrollProgress } from "./util/useScrollProgress.js";
import { useBedsideFlow } from "./util/useBedsideFlow.js";
import { BedsideFlowContext } from "./util/BedsideFlowContext.js";
import { SYNDROMES } from "../data/syndromes.js";

function _synName(id) {
  if(!id) return null;
  const s = SYNDROMES.find(x => x.id === id);
  return s ? s.name : id;
}

/* Wave 12 W12 · bedside flow microstate stylesheet — scoped to the bedside
   surface via the [data-w12-bedside-flow] root attribute so it never
   leaks. Idempotent injection via a one-shot dataset marker on document.head.

   Carries:
     • @keyframes rxW12InputPulse — cyan border tinge every 4s (F1)
     • .rx-w12-pulse-border — applied to the CaseBar input while awaiting
     • @keyframes rxW12FirstRing — 220ms cyan ring expand (F8)
     • .rx-w12-first-ring — overlay span that paints the one-shot ring
     • @keyframes rxW12ApplyLift — fade-out + scale-down for CaseBar (F3)
     • .rx-w12-apply-leave — applied to the CaseBar wrapper on Apply
     • @keyframes rxW12CtaPulse — CTA glow pulse on idle (F4)
     • .rx-w12-cta-pulse — applied to Copy CTA when phase === "idle"
     • @keyframes rxW12ChipPop — 600ms chip pop on first parser match (F2)
     • .rx-w12-chip-pop — applied to a parsed chip when it appears
     • @keyframes rxW12LayerGlow — 800ms cyan inset glow on layer (F5)
     • .rx-w12-layer-glow — applied to a layer when a finding fires
     • .rx-w12-rail-dim — opacity .6 dim on rail dots when deepScroll (F6)
     • .rx-w12-mesh-deepen — opacity bump on hero mesh when deepRest (F7)
     • .rx-w12-intent-dim — opacity .65 on structured chips while typing free text (F9)

   ALL animations honoured by prefers-reduced-motion via the trailing
   @media block. */
const W12_FLOW_CSS = `
@keyframes rxW12InputPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0); }
  50%      { box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.18), 0 0 14px rgba(0, 212, 255, 0.22); }
}
[data-w12-bedside-flow] .rx-w12-pulse-border {
  animation: rxW12InputPulse 4s ease-in-out infinite;
}
[data-w12-bedside-flow] .rx-w12-pulse-border:focus-visible,
[data-w12-bedside-flow] .rx-w12-pulse-border:focus {
  animation: none;
}

@keyframes rxW12FirstRing {
  0%   { opacity: 0.65; transform: scale(1);    }
  100% { opacity: 0;    transform: scale(1.18); }
}
[data-w12-bedside-flow] .rx-w12-first-ring {
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  border: 1.5px solid var(--neon-cyan, var(--ox-bright));
  box-shadow: 0 0 12px var(--neon-cyan, var(--ox-bright));
  pointer-events: none;
  animation: rxW12FirstRing 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  z-index: 10;
}

@keyframes rxW12ApplyLeave {
  0%   { opacity: 1; transform: scale(1);   }
  100% { opacity: 0; transform: scale(0.97); }
}
[data-w12-bedside-flow] .rx-w12-apply-leave {
  animation: rxW12ApplyLeave 220ms cubic-bezier(0.55, 0, 0.1, 1) forwards;
  pointer-events: none;
}

@keyframes rxW12CtaPulse {
  0%, 100% { box-shadow: 0 6px 18px -6px var(--neon-cyan, var(--ox)),
              0 2px 6px -2px rgba(0,0,0,.18),
              inset 0 1px 0 rgba(255,255,255,.22);   }
  50%      { box-shadow: 0 8px 26px -4px var(--neon-cyan, var(--ox)),
              0 4px 10px -2px rgba(0,0,0,.22),
              0 0 0 4px color-mix(in srgb, var(--neon-cyan, var(--ox)) 18%, transparent),
              inset 0 1px 0 rgba(255,255,255,.32); }
}
[data-w12-bedside-flow] .rx-w12-cta-pulse {
  animation: rxW12CtaPulse 1.6s ease-in-out infinite;
}

@keyframes rxW12ChipPop {
  0%   { transform: scale(1);    box-shadow: 0 0 0 0 rgba(0,212,255,0);   }
  35%  { transform: scale(1.05); box-shadow: 0 0 0 4px rgba(0,212,255,.22); }
  100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(0,212,255,0);   }
}
[data-w12-bedside-flow] .rx-w12-chip-pop {
  animation: rxW12ChipPop 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes rxW12LayerGlow {
  0%   { box-shadow: inset 0 0 0 0 rgba(0,212,255,0);   }
  35%  { box-shadow: inset 0 0 24px 4px rgba(0,212,255,.22); }
  100% { box-shadow: inset 0 0 0 0 rgba(0,212,255,0);   }
}
[data-w12-bedside-flow] .rx-w12-layer-glow {
  animation: rxW12LayerGlow 800ms cubic-bezier(0.16, 1, 0.3, 1) both;
  border-radius: 12px;
}

@keyframes rxW12SpineSweep {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0,212,255,0);    }
  50%      { box-shadow: 0 0 0 3px rgba(0,212,255,.35), 0 0 12px rgba(0,212,255,.45); }
}
[data-w12-bedside-flow] .rx-w12-spine-sweep > *:nth-child(1)  { animation: rxW12SpineSweep 320ms ease-out 0ms   both; }
[data-w12-bedside-flow] .rx-w12-spine-sweep > *:nth-child(2)  { animation: rxW12SpineSweep 320ms ease-out 80ms  both; }
[data-w12-bedside-flow] .rx-w12-spine-sweep > *:nth-child(3)  { animation: rxW12SpineSweep 320ms ease-out 160ms both; }
[data-w12-bedside-flow] .rx-w12-spine-sweep > *:nth-child(4)  { animation: rxW12SpineSweep 320ms ease-out 240ms both; }
[data-w12-bedside-flow] .rx-w12-spine-sweep > *:nth-child(5)  { animation: rxW12SpineSweep 320ms ease-out 320ms both; }
[data-w12-bedside-flow] .rx-w12-spine-sweep > *:nth-child(6)  { animation: rxW12SpineSweep 320ms ease-out 400ms both; }
[data-w12-bedside-flow] .rx-w12-spine-sweep > *:nth-child(7)  { animation: rxW12SpineSweep 320ms ease-out 480ms both; }
[data-w12-bedside-flow] .rx-w12-spine-sweep > *:nth-child(8)  { animation: rxW12SpineSweep 320ms ease-out 560ms both; }
[data-w12-bedside-flow] .rx-w12-spine-sweep > *:nth-child(9)  { animation: rxW12SpineSweep 320ms ease-out 640ms both; }
[data-w12-bedside-flow] .rx-w12-spine-sweep > *:nth-child(10) { animation: rxW12SpineSweep 320ms ease-out 720ms both; }

/* F4 inset light-ring pulse on the first severity-required NotchedBanner. */
@keyframes rxW12BannerPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(225,29,72,0); }
  50%      { box-shadow: 0 0 0 3px rgba(225,29,72,.22), 0 0 14px rgba(225,29,72,.28); }
}
[data-w12-bedside-flow] .rx-w12-banner-pulse {
  animation: rxW12BannerPulse 1.8s ease-in-out infinite;
}

/* F6 deep-scroll rail dim — applied to the vertical rail dots when the
   user has crossed 40% of the document. Static state change, no motion. */
[data-w12-bedside-flow][data-w12-deep-scroll="true"] .rx-vertical-rail__item:not([data-active="true"])::before {
  opacity: 0.6;
}

/* F7 deep-rest mesh intensification — bumps mesh blob opacity by 10%
   and saturation by 8%. CSS-only state change; no JS animation. */
[data-w12-bedside-flow][data-w12-deep-rest="true"] [data-gradient-mesh-hero="true"] [data-mesh-blob] {
  filter: blur(48px) saturate(108%);
  opacity: 1.1;
}

/* F9 intent-dim — the structured chips dim while the user is typing into
   the free-text field. CaseBar opt-in via [data-w12-typing="true"] +
   [data-w12-structured-region]. */
[data-w12-bedside-flow] [data-w12-typing="true"] [data-w12-structured-region] {
  opacity: 0.65;
  transition: opacity var(--duration-base, .18s) var(--ease-out, ease-out);
}
[data-w12-bedside-flow] [data-w12-structured-active="true"] [data-w12-free-text] {
  opacity: 0.65;
  transition: opacity var(--duration-base, .18s) var(--ease-out, ease-out);
}

/* Reduced-motion — kill every microstate animation. CSS-only state changes
   (deep-scroll rail dim, deep-rest mesh intensify, intent-dim) are kept
   because they're STATIC, not motion. The brief says: "Reduced-motion: dim
   still applies (it's a static state change), but no pulse." */
@media (prefers-reduced-motion: reduce) {
  [data-w12-bedside-flow] .rx-w12-pulse-border,
  [data-w12-bedside-flow] .rx-w12-first-ring,
  [data-w12-bedside-flow] .rx-w12-apply-leave,
  [data-w12-bedside-flow] .rx-w12-cta-pulse,
  [data-w12-bedside-flow] .rx-w12-chip-pop,
  [data-w12-bedside-flow] .rx-w12-layer-glow,
  [data-w12-bedside-flow] .rx-w12-spine-sweep > *,
  [data-w12-bedside-flow] .rx-w12-banner-pulse {
    animation: none !important;
  }
  [data-w12-bedside-flow][data-w12-deep-rest="true"] [data-gradient-mesh-hero="true"] [data-mesh-blob] {
    filter: blur(48px) saturate(100%);
    opacity: 1;
  }
}
`;
function _ensureW12Styles() {
  if(typeof document === "undefined") return;
  if(document.querySelector("style[data-w12-bedside-flow-styles]")) return;
  const tag = document.createElement("style");
  tag.setAttribute("data-w12-bedside-flow-styles", "");
  tag.textContent = W12_FLOW_CSS;
  document.head.appendChild(tag);
}

/* Hairline gradient — the cyan-line at low alpha used as a bottom border
   under the chrome bar. Painted as a sibling absolute layer so it can
   carry the gradient that a `border-bottom` cannot. */
const HAIRLINE_BG =
  "linear-gradient(90deg," +
  " transparent 0%," +
  " rgba(0, 212, 255, 0.55) 20%," +
  " rgba(61, 122, 255, 0.55) 50%," +
  " rgba(255, 61, 188, 0.40) 80%," +
  " transparent 100%)";

/* The frosted chrome band that wraps every bedside surface. Reads as
   a sticky strip of glass: a 78%-opaque paper wash with backdrop blur
   and a 1px gradient hairline along the bottom edge. Condenses on
   scroll: the brand shrinks and the padding tightens once scrollY
   passes the threshold.

   Builds on ScrollHeader for the sticky + frosted transitions; this
   wrapper just adds the gradient hairline + condense-on-scroll
   behaviour for the brand mark inside. */
function ChromeBand({ children, condensed }) {
  return (
    <ScrollHeader
      threshold={48}
      showProgress={false}
      style={{
        /* Override the default ScrollHeader paper-wash with a
            stronger frosted look: rgba(250,250,252,0.78) + saturate(180%)
            blur(18px). Reads more "glass" than the standard paper-72%. */
        background: condensed
          ? "rgba(250, 250, 252, 0.84)"
          : "rgba(250, 250, 252, 0.72)",
        backdropFilter: "saturate(180%) blur(18px)",
        WebkitBackdropFilter: "saturate(180%) blur(18px)",
        borderBottom: "1px solid transparent",
        marginBottom: 18,
      }}
    >
      {children}
      {/* 1px gradient hairline along the bottom of the band. */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0, right: 0, bottom: 0,
          height: 1,
          background: HAIRLINE_BG,
          opacity: condensed ? 0.9 : 0.5,
          pointerEvents: "none",
          transition: "opacity var(--duration-base, .18s) var(--ease-out, ease-out)",
        }}
      />
    </ScrollHeader>
  );
}

function BedsideShell({ caseState, setCaseState, onExit, onDrug, onOrg, onCite, onOpenPalette, antibiogram, onOpenAntibiogramManager }) {
  _ensureW12Styles();
  /* Edit / view mode. Once a syndrome is set, default to view; the user can
     re-open the Case Bar by clicking Edit. While the Case Bar is open, the
     Answer Canvas stays hidden so the screen has one job at a time. */
  const [editing, setEditing] = useState(!caseState.syndrome);

  /* Wave 12 W12 · bedside flow microstates — central hook. Tracks phase
     across awaiting / typing / applied / idle, plus deepScroll + deepRest
     + freshType + findingApplied. Components consume via context below. */
  const flow = useBedsideFlow({ hasSyndrome: !!caseState.syndrome });

  /* Wave 12 F3 · short-lived flag that triggers the CaseBar fade-out +
     answer-canvas glow-trail choreography. Set by `applyCase` and cleared
     after the choreography duration. */
  const [applyLeaving, setApplyLeaving] = useState(false);

  /* Wave 5 CL-4 · settings modal — gear icon in the global header strip.
     Snapshot contract: site-level preferences land in localStorage (per
     the existing antibiogram pattern); per-syndrome UI state stays in
     component memory. */
  const [settingsOpen, setSettingsOpen] = useState(false);

  /* W8 chrome · drive the condense-on-scroll behaviour of the brand
     mark + chrome row. The threshold is intentionally lower than the
     ScrollHeader frost threshold so the brand starts shrinking before
     the glass settles in. */
  const { scrolled } = useScrollProgress(36);

  const applyCase = (update) => {
    /* Wave 12 F3 · trigger the brief leave choreography for the CaseBar
       only when reduced-motion is OFF AND we're transitioning to a view
       state (i.e. dropping editing mode). The state update for caseState
       + editing happens after a 220ms delay so the leave animation has
       time to play. Reduced-motion path: do the update immediately. */
    const willDropEdit = !!(update.syndrome ?? caseState.syndrome);
    const doUpdate = () => {
      setCaseState(c => ({
        ...c,
        patient: { ...c.patient, ...(update.patient || {}) },
        syndrome: update.syndrome ?? c.syndrome,
      }));
      if(willDropEdit) setEditing(false);
      setApplyLeaving(false);
      flow.notifyApplied();
    };
    if(willDropEdit && !flow.reducedMotion && typeof window !== "undefined") {
      setApplyLeaving(true);
      window.setTimeout(doUpdate, 220);
    } else {
      doUpdate();
    }
  };

  /* Drug / organism / trial chip handlers — provided by App.jsx so the
     decide-mode Answer Canvas can open the same Drawer monograph/organism/
     trial cards that the reference UI uses. The Drawer itself lives in
     App.jsx (hoisted out of the reference-only return) and is mounted in
     both decide and reference branches. */
  const _onDrug = onDrug || (() => {});
  const _onOrg = onOrg || (() => {});
  const _onCite = onCite || (() => {});

  const _synName_ = _synName(caseState.syndrome); // referenced for parity

  useDensity();

  /* Chrome action button — the unified style for every pill in the
     bedside header. Carries the magnetic + shine + ripple micro-motion
     classes so the chrome feels "alive" at first paint. */
  const chromeBtnStyle = (extra = {}) => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".06em",
    color: "var(--ink2)",
    background: "rgba(255, 255, 255, 0.55)",
    border: "1px solid var(--line)",
    /* Asymmetric 8/3 corners — every chrome button in W8 shares this. */
    borderRadius: "8px 3px 8px 3px",
    padding: scrolled ? "4px 9px" : "5px 11px",
    cursor: "pointer",
    transition:
      "padding var(--duration-base, .18s) var(--ease-out, ease-out)," +
      " background var(--duration-base, .18s) var(--ease-out, ease-out)," +
      " border-color var(--duration-base, .18s) var(--ease-out, ease-out)," +
      " box-shadow var(--duration-base, .18s) var(--ease-out, ease-out)",
    ...extra,
  });

  return (
    <BedsideFlowContext.Provider value={flow}>
    <div
      className="rx-root rx-bedside"
      data-w12-bedside-flow=""
      data-w12-phase={flow.phase}
      data-w12-deep-scroll={flow.deepScroll ? "true" : "false"}
      data-w12-deep-rest={flow.deepRest ? "true" : "false"}
    >
      {/* Global cyan-gradient scroll progress strip — sits at the very top
          of the viewport and fills as the user scrolls. */}
      <GlobalScrollProgress />

      {/* Phase D2 responsive container: stays narrow on mobile/tablet
          (max 780 px below 1100 px viewport for typography comfort);
          expands smoothly on wide desktops up to 1480 px so the regimen
          options grid, duration branches grid, and monitoring blocks
          all get the side-by-side real estate they were designed for.
          The `min(96vw, 1480px)` caps the page on ultra-wide displays
          where line lengths would otherwise become unreadable. */}
      <div className="rx-bedside-container" style={{
        maxWidth: "min(96vw, 1480px)",
        margin: "0 auto",
      }}>
        {/* Wave 9 W9 · molten-chrome ambient backdrop. Replaces the
            earlier dot-grid radial-gradient with a faint cyan MeshWash
            anchored to the bedside container. Drift is OFF here to
            keep the GPU budget reserved for the spine bar wash that
            scrolls; this ambient layer is static atmosphere. */}
        <MeshWash
          variant="ambient"
          intensity="soft"
          palette="cyan-only"
          drift={false}
        />
        <ChromeBand condensed={scrolled}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: scrolled ? "6px 0" : "10px 0",
          gap: 12,
          flexWrap: "wrap",
          transition: "padding var(--duration-base, .18s) var(--ease-out, ease-out)",
        }}>
          <button
            type="button"
            onClick={onExit}
            className="rx-magnetic rx-ripple rx-focus-halo"
            style={chromeBtnStyle({
              textTransform: "uppercase",
              color: "var(--muted)",
              background: "transparent",
              borderRadius: 999,
            })}>
            <ArrowLeft size={12} aria-hidden /> Reference
          </button>
          <div style={{ display:"flex", alignItems:"center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end", minWidth: 0 }}>
            {onOpenPalette && (
              <button
                type="button"
                onClick={onOpenPalette}
                aria-label="Search the catalog — drugs, organisms, syndromes (⌘K)"
                className="rx-magnetic rx-ripple rx-focus-halo"
                style={chromeBtnStyle({
                  background: "var(--card, rgba(255,255,255,0.6))",
                })}>
                <Search size={12} aria-hidden />
                <span>Search</span>
                {/* Inline shortcut hint — uses the same asymmetric
                    6/2/6/2 corner vocabulary + mono kicker treatment as
                    the close affordance and the KeyboardShortcutsOverlay
                    key pills, so the ⌘K cue reads as the same chrome
                    grammar in every surface. */}
                <span style={{
                  marginLeft: 4, padding: "1px 6px",
                  borderRadius: "6px 2px 6px 2px",
                  background: "var(--surface, var(--paper2))",
                  border: "1px solid var(--line)",
                  fontFamily: "var(--mono)",
                  fontSize: 10, fontWeight: 700,
                  letterSpacing: ".06em", textTransform: "uppercase",
                  color: "var(--ink2)",
                }}>⌘K</span>
              </button>
            )}
            <FontSizeControl />
            <DensityToggle />
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Open settings"
              title="Settings"
              className="rx-magnetic rx-ripple rx-focus-halo"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: scrolled ? 24 : 28, height: scrolled ? 24 : 28,
                background: "rgba(255, 255, 255, 0.55)",
                border: "1px solid var(--line)",
                /* The single round icon button keeps a perfect circle —
                    asymmetric corners on a circular icon read as a
                    glitch, not as design language. */
                borderRadius: 999,
                cursor: "pointer",
                color: "var(--ink2)",
                transition:
                  "width .18s var(--ease-out, ease-out)," +
                  " height .18s var(--ease-out, ease-out)," +
                  " background .18s var(--ease-out, ease-out)",
              }}
            >
              <SettingsIcon size={13} aria-hidden />
            </button>
            <BrandMark
              size={scrolled ? "small" : "small"}
              subtitle="Bedside · Decision support"
              style={{
                transform: scrolled ? "scale(0.92)" : "scale(1)",
                transformOrigin: "right center",
                transition: "transform .22s var(--ease-out, ease-out)",
              }}
            />
          </div>
        </div>
        </ChromeBand>

        {/* Three states:
            INITIAL — no syndrome yet → full-width "Build the case" intro
              with the Case Bar (onboarding flow).
            EDIT — syndrome set + editing toggled → split layout with the
              Case Bar pinned as a side rail and the Answer Canvas
              continuing to render on the right, so the user never loses
              their reference point while adjusting context.
            VIEW — syndrome set, not editing → Answer Canvas full width. */}
        {editing && !caseState.syndrome && (
          <>
            <LetterRevealHeadline text="Build the case" reducedMotion={flow.reducedMotion} />
            <p style={{ color: "var(--ink2)", fontSize: 14, margin: "0 0 22px", lineHeight: 1.55, maxWidth: "62ch" }}>
              Describe the case in free text, or pick the chips directly. The Answer Canvas
              composes the empiric regimen, refinements, and de-escalation plan once a syndrome is set.
            </p>
            <div className={applyLeaving ? "rx-w12-apply-leave" : undefined}>
              <CaseBar caseState={caseState} onApply={applyCase} onSkip={onExit} />
            </div>
          </>
        )}
        {editing && caseState.syndrome && (
          <div className="rx-bedside-split">
            <aside className="rx-bedside-rail" aria-label="Edit case">
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid var(--line2)",
              }}>
                <div style={{
                  fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".14em",
                  textTransform: "uppercase", color: "var(--ox)", fontWeight: 700,
                }}>
                  Edit case
                </div>
                <button type="button" onClick={() => setEditing(false)}
                  aria-label="Close edit panel and return to answer"
                  className="rx-magnetic rx-shine-sweep rx-ripple"
                  style={{
                    fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".08em",
                    textTransform: "uppercase", color: "var(--muted)",
                    background: "none", border: "1px solid var(--line)", borderRadius: 999,
                    padding: "3px 9px", cursor: "pointer",
                  }}>
                  ✕ Done
                </button>
              </div>
              <div className={applyLeaving ? "rx-w12-apply-leave" : undefined}>
                <CaseBar caseState={caseState} onApply={applyCase} onSkip={() => setEditing(false)} />
              </div>
            </aside>
            <AnswerCanvas
              caseState={caseState}
              setCaseState={setCaseState}
              onEditCase={() => setEditing(true)}
              onDrug={_onDrug}
              onOrg={_onOrg}
              onCite={_onCite}
              antibiogram={antibiogram}
              onOpenAntibiogramManager={onOpenAntibiogramManager}
            />
          </div>
        )}
        {!editing && (
          <AnswerCanvas
            caseState={caseState}
            setCaseState={setCaseState}
            onEditCase={() => setEditing(true)}
            onDrug={_onDrug}
            onOrg={_onOrg}
            onCite={_onCite}
            antibiogram={antibiogram}
            onOpenAntibiogramManager={onOpenAntibiogramManager}
          />
        )}
      </div>

      {/* Wave 5 CL-4 · settings modal — gear-icon companion */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenAntibiogramManager={onOpenAntibiogramManager}
      />

      {/* Wave 6 W6-D · keyboard-shortcut overlay — `?` toggles. Owns its
          own open state via a global keydown listener so it can surface
          from anywhere in the bedside surface without prop drilling. */}
      <KeyboardShortcutsOverlay />

      {/* Wave 6 W6-D · first-visit onboarding overlay. Auto-shows
          the first time a user lands on the bedside surface; persists
          dismissal to localStorage so it never interrupts the
          workflow path again. */}
      <OnboardingModal />
    </div>
    </BedsideFlowContext.Provider>
  );
}

/* Wave 12 F1 · LetterRevealHeadline — splits the headline string into
   per-character spans and toggles the .active class on next-frame so the
   .rx-letter-reveal cascade animates from translateY+opacity to settled.
   Reduced-motion path renders the string statically; useReducedMotion gating
   is handled by the kinetic-type CSS @media block but we also gate the
   className so a class-list assertion can read it. */
function LetterRevealHeadline({ text, reducedMotion }) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    if(reducedMotion) { setActive(true); return undefined; }
    const id = (typeof window !== "undefined") ? window.requestAnimationFrame(() => setActive(true)) : null;
    return () => { if(id != null && typeof window !== "undefined") window.cancelAnimationFrame(id); };
  }, [reducedMotion]);
  return (
    <h1
      className={"rx-letter-reveal" + (active ? " active" : "")}
      style={{ fontFamily: "var(--serif)", fontSize: 30, fontWeight: 600, letterSpacing: "-.014em", margin: "8px 0 6px" }}
    >
      {Array.from(text).map((ch, i) => (
        <span key={i}>{ch === " " ? " " : ch}</span>
      ))}
    </h1>
  );
}

export { BedsideShell };
