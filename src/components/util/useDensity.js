/* component/util · useDensity — small hook that owns the user's density
   preference (compact / comfortable / spacious) for the bedside guide.

   Persists to localStorage under the key "ab_density" and mirrors the
   current value onto <html data-density="..."> so the App-level CSS
   can react via attribute selectors without React having to re-render
   distant subtrees.

   USAGE
     const { density, setDensity } = useDensity();
     setDensity("compact");      // sets state, writes localStorage,
                                 // and updates documentElement attr.

   SSR-safe: guards `window` and `document`. If localStorage is denied
   (Safari private mode, etc.) the hook silently falls back to in-memory
   state — the toggle still works, the value just doesn't persist. */
import { useEffect, useState } from "react";

const KEY = "ab_density";
const VALID = ["compact", "comfortable", "spacious"];
const DEFAULT = "comfortable";

function _readInitial() {
  if(typeof window === "undefined") return DEFAULT;
  try {
    const stored = window.localStorage && window.localStorage.getItem(KEY);
    if(stored && VALID.indexOf(stored) !== -1) return stored;
  } catch(e) { /* private mode, etc. */ }
  return DEFAULT;
}

export function useDensity() {
  const [density, setDensityState] = useState(_readInitial);

  useEffect(() => {
    if(typeof document === "undefined") return;
    try {
      document.documentElement.setAttribute("data-density", density);
    } catch(e) { /* no-op */ }
    try {
      if(typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(KEY, density);
      }
    } catch(e) { /* no-op */ }
  }, [density]);

  function setDensity(next) {
    if(VALID.indexOf(next) === -1) return;
    setDensityState(next);
  }

  return { density, setDensity };
}
