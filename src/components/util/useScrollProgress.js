/* component/util · useScrollProgress — Wave 7 W7-A.

   A small React hook that reports two pieces of state derived from the
   page's vertical scroll position:

     {
       scrolled: boolean   // true once `window.scrollY` exceeds `threshold`
       progress: number    // 0..1 — fraction of the page that has been scrolled
     }

   IMPLEMENTATION NOTES

   The native `scroll` event fires synchronously and often (sometimes
   hundreds of times per second on a smooth-scroll device). To avoid
   doing layout-read work on every event, the listener schedules a
   `requestAnimationFrame` callback and cancels any previously-scheduled
   one — i.e. classic rAF coalescing, no library required.

   `progress` is computed as `scrollY / (scrollHeight - innerHeight)`
   and clamped to the [0, 1] interval; the denominator is `Math.max(1, …)`
   so we never divide by zero on a short page.

   SSR / non-DOM ENVIRONMENTS

   The hook is safe to import in a server bundle: it returns the initial
   `{ scrolled:false, progress:0 }` state without touching `window`, and
   defers all DOM reads to the `useEffect` body (which only runs in the
   browser). The `useEffect` body itself short-circuits when `window`
   is undefined, defensively, so it remains import-safe even if the
   effect is somehow invoked outside a browser context.

   USAGE

     const { scrolled, progress } = useScrollProgress(64);
     // `scrolled` flips true once the user is past 64px from the top
     // `progress` is a 0..1 fraction of total scrollable height

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import { useEffect, useState } from "react";

export function useScrollProgress(threshold = 64) {
  const [state, setState] = useState({ scrolled: false, progress: 0 });

  useEffect(() => {
    if(typeof window === "undefined") return undefined;

    let raf = 0;
    const compute = () => {
      const sy = window.scrollY || window.pageYOffset || 0;
      const doc = document.documentElement;
      const max = Math.max(1, (doc ? doc.scrollHeight : 0) - window.innerHeight);
      const progress = Math.min(1, Math.max(0, sy / max));
      setState({ scrolled: sy > threshold, progress });
    };

    const onScroll = () => {
      if(raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };

    // Prime the state on mount so the first paint reflects the current
    // scrollY (e.g. when the user lands deep-linked to a hash anchor).
    compute();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if(raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [threshold]);

  return state;
}

export default useScrollProgress;
