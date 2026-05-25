/* component/util · useReducedMotion — runtime detection of the OS-level
   accessibility preference for reduced motion.

   The global CSS rule in app-styles.js already shortens every CSS
   transition / animation to 0.01ms when the user prefers reduced
   motion. This hook is the JS-side companion for cases where motion
   is driven by JS, not CSS (e.g., a setTimeout-based carousel
   auto-advance, a JS-orchestrated spine pulse on refinement).

   USAGE
     const reducedMotion = useReducedMotion();
     useEffect(() => {
       if(reducedMotion) return;
       // schedule animation
     }, [reducedMotion]);

   Listens to changes (system preference can flip while the tab is
   open). SSR-safe — returns `false` when `window` is undefined. */
import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function _read() {
  if(typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia(QUERY).matches;
  } catch(e) {
    return false;
  }
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(_read);

  useEffect(() => {
    if(typeof window === "undefined" || !window.matchMedia) return undefined;
    const mql = window.matchMedia(QUERY);
    const onChange = (e) => setReduced(!!e.matches);
    // Modern API
    if(typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
    // Legacy fallback (Safari < 14)
    if(typeof mql.addListener === "function") {
      mql.addListener(onChange);
      return () => mql.removeListener(onChange);
    }
    return undefined;
  }, []);

  return reduced;
}
