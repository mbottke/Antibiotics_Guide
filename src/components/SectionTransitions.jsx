/* component · SectionTransitions — Wave 12 narrative-transition layer.

   When the user switches between the 5 SectionNav sections (Syndromes,
   Agents, Organisms, Compare, Principles) the swap should read as a
   connected narrative rather than a jarring tab flip. This module is
   the staging area for the W12 transitions:

     T1. View Transitions API cross-fade (180ms) when supported
     T2. Cyan "ink trail" that flows from the clicked chip across the
         section nav into the entering section's first heading (320ms)
     T3. One-shot 600ms cyan pulse on the freshly-active chip
     T4. Hero reveal cascade re-triggers via `key={sectionId}` on the
         section wrapper (the global `.rx-fade-in-up` :nth-child cascade
         already in app-styles.js carries the visual; we just have to
         force a remount so the cascade fires on every change, not
         just first paint)
     T5. "Returning" inset cyan border on the active chip when the
         user navigates to a section they've already visited

   Every animation is gated by `prefers-reduced-motion`. The mechanism
   intentionally stays decoupled from App.jsx's existing routing —
   `startSectionTransition()` wraps the state-setter call site and
   does all the chrome work; the data layer is untouched.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useReducedMotion } from "./util/useReducedMotion.js";

/* sessionStorage key for visited-section tracking. Snapshot-only —
   clears on tab close, no localStorage = no cross-session leak. */
const VISITED_KEY = "rx-w12-visited-sections";

/* Read the visited set; SSR/jsdom-safe. */
function readVisited() {
  try {
    if(typeof sessionStorage === "undefined") return new Set();
    const raw = sessionStorage.getItem(VISITED_KEY);
    if(!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch(_) { return new Set(); }
}

function writeVisited(set) {
  try {
    if(typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(VISITED_KEY, JSON.stringify(Array.from(set)));
  } catch(_) {}
}

/* useVisitedSections() — track which sections the user has been to
   this tab. Marks the current section as visited on each change. */
function useVisitedSections(section) {
  const [visited, setVisited] = useState(readVisited);
  const isReturning = visited.has(section);

  useEffect(() => {
    setVisited(prev => {
      if(prev.has(section)) return prev;
      const next = new Set(prev);
      next.add(section);
      writeVisited(next);
      return next;
    });
  }, [section]);

  return { visited, isReturning };
}

/* startSectionTransition(setSection, sectionId, opts)
   --------------------------------------------------
   The drop-in wrapper for "the user clicked a section chip". Uses
   document.startViewTransition() when available for the 180ms cross-
   fade; otherwise falls back to an immediate state update.
   `prefers-reduced-motion: reduce` short-circuits to the immediate
   path so the user sees no animation. */
function startSectionTransition(applyChange, opts) {
  const reduced = opts && opts.reduced;
  if(reduced) { applyChange(); return; }
  if(typeof document === "undefined" || typeof document.startViewTransition !== "function") {
    applyChange();
    return;
  }
  try {
    document.startViewTransition(() => {
      applyChange();
    });
  } catch(_) {
    /* Some browsers throw on concurrent transitions — fall back. */
    applyChange();
  }
}

/* SectionInkTrail — a single absolutely-positioned cyan ink line that
   sweeps across the section nav bar from the clicked chip's center
   horizontally to the entering chip's center. The component mounts a
   keyframe animation on the trail element; on completion the trail
   un-mounts. The component owns no state about which chip is active
   — it only knows the from/to anchor rects and fires when the parent
   sets a `trail` prop. */
function SectionInkTrail({ trail }) {
  /* No trail to draw → render nothing. */
  if(!trail) return null;
  const { x1, x2, y, key } = trail;
  const left = Math.min(x1, x2);
  const width = Math.abs(x2 - x1);
  /* The ink fill direction (left→right vs right→left) depends on the
     sweep direction so the brush reads as flowing toward the target. */
  const dir = x2 >= x1 ? "ltr" : "rtl";
  return (
    <span
      key={key}
      aria-hidden="true"
      data-testid="section-nav-ink-trail"
      style={{
        position: "absolute",
        left,
        top: y,
        width,
        height: 2,
        pointerEvents: "none",
        background: dir === "ltr"
          ? "linear-gradient(90deg, rgba(0,212,255,0) 0%, var(--neon-cyan, #00D4FF) 50%, rgba(0,212,255,0) 100%)"
          : "linear-gradient(270deg, rgba(0,212,255,0) 0%, var(--neon-cyan, #00D4FF) 50%, rgba(0,212,255,0) 100%)",
        boxShadow: "0 0 12px 2px rgba(0,212,255,.65)",
        borderRadius: 2,
        opacity: 0,
        animation: "rx-w12-ink-sweep 320ms ease-out forwards",
        transformOrigin: dir === "ltr" ? "left center" : "right center",
      }}
    />
  );
}

/* SectionTransitionShell ------------------------------------------------
   The component App.jsx wraps around its main content. Owns:
     • the visited-section tracker for T5
     • the per-section remount key for T4 (consumer passes section in)
     • the chip-pulse trigger for T3
     • the ink-trail anchor for T2
   It exposes a `navigate(toSection)` callback that's the *single*
   entry point used by SectionNav's onClick. */
function useSectionTransitions({ section, onSectionChange, sectionNavRef }) {
  const reducedMotion = useReducedMotion();
  const [pulseId, setPulseId] = useState(null);
  const [trail, setTrail] = useState(null);
  const trailTimerRef = useRef(null);
  const pulseTimerRef = useRef(null);
  const { isReturning } = useVisitedSections(section);

  useEffect(() => () => {
    if(trailTimerRef.current) clearTimeout(trailTimerRef.current);
    if(pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
  }, []);

  const navigate = useCallback((toSection) => {
    /* No-op when re-clicking the active section — but still fire the
       view-transition wrapper so the call site doesn't have to special-
       case it. */
    if(toSection === section) {
      onSectionChange(toSection);
      return;
    }

    /* T2 — ink-trail anchor calculation. Look up the from + to chip
       rects on the nav element; if either chip isn't found (the
       chips can be filtered by viewport width), skip the trail. */
    if(!reducedMotion && sectionNavRef && sectionNavRef.current) {
      try {
        const navEl = sectionNavRef.current;
        const fromEl = navEl.querySelector(`[data-section-chip="${section}"]`);
        const toEl   = navEl.querySelector(`[data-section-chip="${toSection}"]`);
        if(fromEl && toEl) {
          const navRect  = navEl.getBoundingClientRect();
          const fromRect = fromEl.getBoundingClientRect();
          const toRect   = toEl.getBoundingClientRect();
          /* The trail rides at the bottom of the nav, just above the
             progress-strip line (bottom: 4) so the two effects coexist
             without overlap. */
          setTrail({
            x1: fromRect.left + fromRect.width / 2 - navRect.left,
            x2: toRect.left   + toRect.width   / 2 - navRect.left,
            y: navRect.height - 12,
            key: `${section}->${toSection}-${Date.now()}`,
          });
          if(trailTimerRef.current) clearTimeout(trailTimerRef.current);
          trailTimerRef.current = setTimeout(() => setTrail(null), 360);
        }
      } catch(_) {}
    }

    /* T3 — one-shot pulse on the entering chip. */
    if(!reducedMotion) {
      setPulseId(toSection);
      if(pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = setTimeout(() => setPulseId(null), 640);
    }

    /* T1 — wrap the actual state update in the View Transitions
       API where supported. The state-setter runs inside the callback
       so React's render lands inside the transition. */
    startSectionTransition(() => {
      onSectionChange(toSection);
    }, { reduced: reducedMotion });
  }, [section, onSectionChange, reducedMotion, sectionNavRef]);

  return { navigate, pulseId, trail, isReturning };
}

/* SectionTransitionStyles — global keyframes scoped under .rx-root
   so they don't escape the component. Mounted once via App.jsx. */
const SECTION_TRANSITION_CSS = `
/* W12 · ink-sweep keyframes — 320ms left-to-right (or right-to-
   left) wash across the section nav bar. */
@keyframes rx-w12-ink-sweep {
  0%   { transform: scaleX(0); opacity: 0; }
  20%  { opacity: 1; }
  100% { transform: scaleX(1); opacity: 0; }
}

/* W12 · chip pulse — a 600ms cyan glow on the freshly-active chip
   after a section change. We target the chip via data attribute so
   only the right one lights up. */
@keyframes rx-w12-chip-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.0), 0 6px 18px -4px rgba(0, 212, 255, 0.45); }
  35%  { box-shadow: 0 0 0 8px rgba(0, 212, 255, 0.18), 0 8px 22px -4px rgba(0, 212, 255, 0.6); }
  100% { box-shadow: 0 0 0 14px rgba(0, 212, 255, 0.0), 0 6px 18px -4px rgba(0, 212, 255, 0.45); }
}
[data-section-chip][data-w12-pulse="true"] {
  animation: rx-w12-chip-pulse 600ms ease-out 1;
}

/* W12 · returning chip — 1px inset cyan border on chips the user
   has already visited this session, so the active chip on a back-
   navigation reads as "returning" rather than "fresh". */
[data-section-chip][data-w12-returning="true"][aria-pressed="true"] {
  box-shadow:
    inset 0 0 0 1px rgba(0, 212, 255, 0.55),
    0 6px 18px -4px rgba(0, 212, 255, 0.45),
    0 1px 0 rgba(255,255,255,.10) inset;
}

/* W12 · View Transitions API — soft 180ms cross-fade on the root
   document during a section change. Browsers that don't support
   the API simply ignore these rules. */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 180ms;
  animation-timing-function: ease-out;
}

@media (prefers-reduced-motion: reduce) {
  [data-section-chip][data-w12-pulse="true"] { animation: none !important; }
  ::view-transition-old(root),
  ::view-transition-new(root) { animation-duration: 0.01ms !important; }
}
`;

function SectionTransitionStyles() {
  return <style data-testid="section-transition-styles">{SECTION_TRANSITION_CSS}</style>;
}

export {
  useSectionTransitions,
  SectionInkTrail,
  SectionTransitionStyles,
  startSectionTransition,
  useVisitedSections,
};
