/* component/util · useBedsideFlow — Wave 12 central bedside flow microstates.

   This hook tracks the user's macro phase across the bedside surface and
   exposes a small reactive bag of booleans so visual ambient cues elsewhere
   (CaseBar, AnswerCanvas, ReassessmentPanel, GradientMeshHero) can react.

   The hook is *purely visual*. It never gates behavior — it only emits
   "are we currently typing?", "have we been idle for 15s?", "did the user
   scroll past 40% of the answer?". The components that consume it then
   layer in ambient pulses, mesh intensification, sparkle overlays, etc.

   Every emitted phase is reduced-motion aware via the `reducedMotion` field;
   consumers should suppress their animation when `reducedMotion` is true.

   PHASES (top-level)
     awaiting  — case bar visible, user has not typed yet, no syndrome
     typing    — case bar input has focus and ≥1 character entered
     applied   — answer canvas mounted (syndrome set)
     idle      — answer canvas visible, user has been still ≥ 10s (cue CTA)

   SUB-FLAGS
     deepScroll      — user has scrolled past ≥ 40% of the document
     deepRest        — user has been still on the answer canvas ≥ 15s
                       (drives mesh intensification — separate from `idle`
                       which fires earlier at 10s)
     freshType       — user has just typed their VERY FIRST character into
                       a fresh CaseBar (one-shot, never repeats per session)
     findingApplied  — bumped each time a reassessment finding flips a state;
                       consumers can watch this value to fire a one-shot
                       highlight choreography.

   API
     const flow = useBedsideFlow({ hasSyndrome });
     // flow.phase         — "awaiting" | "typing" | "applied" | "idle"
     // flow.reducedMotion — boolean (from useReducedMotion)
     // flow.deepScroll    — boolean
     // flow.deepRest      — boolean
     // flow.freshType     — boolean (one-shot)
     // flow.findingApplied — number (counter — bump to signal)
     // flow.signalFinding() — call from ReassessmentPanel when a state flips
     // flow.notifyTyping(hasText)   — call from CaseBar onChange / onFocus
     // flow.notifyApplied()         — call from BedsideShell on apply
     // flow.notifyAwaiting()        — call from BedsideShell when edit reopens

   IMPLEMENTATION
     The hook attaches one passive document-level listener bag for activity
     (`scroll`, `pointerdown`, `pointermove`, `keydown`) that resets two
     timers: the 10s idle timer + the 15s deep-rest timer. Listeners are
     `{ passive: true }` so they never block. The hook also installs a
     scroll listener that flips `deepScroll` once the user crosses 40% of
     scrollY/document height; the flag clears on scroll back to top.

     The hook does NOT use setTimeout chains; each phase has at most ONE
     scheduled timer at a time, cleared on next activity.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "./useReducedMotion.js";

const IDLE_MS = 10000;
const DEEP_REST_MS = 15000;
const DEEP_SCROLL_THRESHOLD = 0.4;
const FIRST_CHAR_FLAG = "abxguide_w12_freshtype_v1";

function _readFreshFlag() {
  if(typeof window === "undefined" || !window.sessionStorage) return false;
  try {
    return window.sessionStorage.getItem(FIRST_CHAR_FLAG) === "1";
  } catch(e) { return false; }
}

function _writeFreshFlag() {
  if(typeof window === "undefined" || !window.sessionStorage) return;
  try {
    window.sessionStorage.setItem(FIRST_CHAR_FLAG, "1");
  } catch(e) { /* quota / disabled — ignore */ }
}

export function useBedsideFlow({ hasSyndrome } = {}) {
  const reducedMotion = useReducedMotion();

  /* Phase ladder. The hook resolves to one of four states; consumers
     match against this string to decide whether to render their cue. */
  const [phase, setPhase] = useState(hasSyndrome ? "applied" : "awaiting");

  /* Sub-flags. These are NOT exclusive with `phase` — a user can be in
     `applied` and `deepScroll=true` at the same time, for example. */
  const [deepScroll, setDeepScroll] = useState(false);
  const [deepRest, setDeepRest] = useState(false);
  /* `freshType` is one-shot per page session and persisted in
     sessionStorage so it doesn't fire on every CaseBar mount during the
     same tab life. Initial value reads the flag. */
  const [freshTypeFired, setFreshTypeFired] = useState(() => _readFreshFlag());
  const [freshType, setFreshType] = useState(false);
  const [findingApplied, setFindingApplied] = useState(0);

  /* Track typing internally so the awaiting → typing transition only
     fires once the user actually enters a character. */
  const [hasText, setHasText] = useState(false);

  const idleTimerRef = useRef(null);
  const restTimerRef = useRef(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  /* Sync `phase` to the `hasSyndrome` prop. When a syndrome lands we
     drop into `applied`; when it clears we go back to `awaiting`. */
  useEffect(() => {
    if(hasSyndrome) {
      setPhase("applied");
    } else {
      setPhase(hasText ? "typing" : "awaiting");
    }
  }, [hasSyndrome, hasText]);

  /* Activity-driven idle timer. Active only when the answer canvas is on
     screen (`applied` or `idle`). On any activity we reset both timers
     and revert to `applied` if currently `idle`. */
  useEffect(() => {
    if(typeof window === "undefined") return undefined;
    if(reducedMotion) return undefined;
    if(!hasSyndrome) return undefined;

    const resetIdle = () => {
      if(idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if(restTimerRef.current) clearTimeout(restTimerRef.current);
      if(phaseRef.current === "idle") setPhase("applied");
      setDeepRest(false);
      idleTimerRef.current = window.setTimeout(() => {
        if(phaseRef.current === "applied") setPhase("idle");
      }, IDLE_MS);
      restTimerRef.current = window.setTimeout(() => {
        setDeepRest(true);
      }, DEEP_REST_MS);
    };

    /* Wire the listeners. Passive to keep scroll smooth. */
    const events = ["scroll", "pointerdown", "pointermove", "keydown", "wheel", "touchstart"];
    events.forEach(ev => window.addEventListener(ev, resetIdle, { passive: true }));

    /* Kick off the initial timers as soon as the answer mounts. */
    resetIdle();

    return () => {
      events.forEach(ev => window.removeEventListener(ev, resetIdle));
      if(idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if(restTimerRef.current) clearTimeout(restTimerRef.current);
    };
  }, [hasSyndrome, reducedMotion]);

  /* Scroll-progress tracker for deepScroll. The threshold is a single
     boundary, not a hysteresis pair — once crossed the flag stays true
     until the user scrolls back below the threshold. */
  useEffect(() => {
    if(typeof window === "undefined") return undefined;
    if(!hasSyndrome) {
      setDeepScroll(false);
      return undefined;
    }
    const onScroll = () => {
      const scrollH = (document.documentElement.scrollHeight || 0) - (window.innerHeight || 0);
      if(scrollH <= 0) {
        setDeepScroll(false);
        return;
      }
      const ratio = (window.scrollY || 0) / scrollH;
      setDeepScroll(ratio >= DEEP_SCROLL_THRESHOLD);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasSyndrome]);

  /* === imperative notify-style API ===
     Components push state into the hook via these callbacks. We avoid
     deep prop wiring by keeping these stable (useCallback). */

  const notifyTyping = useCallback((nextHasText) => {
    setHasText(!!nextHasText);
    if(nextHasText && !freshTypeFired) {
      setFreshType(true);
      setFreshTypeFired(true);
      _writeFreshFlag();
      /* Auto-clear the one-shot flag after the animation duration so
         consumers can re-render without the ring stuck on. */
      if(typeof window !== "undefined") {
        window.setTimeout(() => setFreshType(false), 400);
      }
    }
  }, [freshTypeFired]);

  const notifyApplied = useCallback(() => {
    setPhase("applied");
    setHasText(false);
  }, []);

  const notifyAwaiting = useCallback(() => {
    setPhase("awaiting");
    setHasText(false);
  }, []);

  const signalFinding = useCallback(() => {
    setFindingApplied(n => n + 1);
  }, []);

  return {
    phase,
    reducedMotion,
    deepScroll,
    deepRest,
    freshType,
    findingApplied,
    notifyTyping,
    notifyApplied,
    notifyAwaiting,
    signalFinding,
  };
}

export default useBedsideFlow;
