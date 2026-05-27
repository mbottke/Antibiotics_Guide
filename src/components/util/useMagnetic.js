/* component/util · useMagnetic — Wave 7 W7-A motion + microinteractions.

   Attaches a cursor-magnetic translate effect to a DOM ref. The element
   tracks the cursor within `range` pixels of its center, pulled toward
   the cursor with `strength` factor. The host should also carry the
   `.rx-magnetic` className so the resting / departing motion eases via
   the shared `transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1)`.

   Accessibility:
     - prefers-reduced-motion: reduce  → no-op (no listeners attached)
     - pointer: coarse                 → no-op (touch devices)
     - SSR-safe — bails when window is undefined

   USAGE
     const ref = useRef(null);
     useMagnetic(ref);                       // defaults strength=0.25, range=80
     useMagnetic(ref, { strength: 0.4, range: 120 });
     <button ref={ref} className="rx-magnetic"> ... </button>

   The hook writes `transform: translate3d(Xpx, Ypx, 0)` inline on the
   element. Resting state is `translate3d(0, 0, 0)`. On unmount we clear
   the inline transform so React's later renders are not surprised. */
import { useEffect } from "react";

export function useMagnetic(ref, _opts = {}) {
  // Cursor-magnetic pull on buttons added a document-level mousemove
  // listener per hook instance — N magnetic buttons = N listeners
  // sharing the global pointer stream. With several primary buttons
  // on the bedside surface the recompute storm caused jagged pop /
  // settle behavior. The hook is preserved as a no-op so the `.rx-
  // magnetic` className and ref pattern at call sites keep working;
  // the `.rx-magnetic` CSS still applies a calm transform transition
  // for any other inline transform changes (focus rings, etc.).
  useEffect(() => {
    const el = ref && ref.current;
    if (!el) return undefined;
    el.style.transform = "";
    return undefined;
  }, [ref]);
}
