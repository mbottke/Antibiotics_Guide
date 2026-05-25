/* component/util · useCursorHighlight — Wave 6 W6-B aesthetic.

   Attaches a cursor-following radial-gradient highlight to a DOM ref.
   The effect is the JS pump for an Apple/Vercel/Linear-style "card
   that breathes under the cursor" microinteraction — a soft oxblood
   halo that follows the mouse, painted via a `::before` or sibling
   overlay element whose `background-image` reads two CSS custom
   properties (`--cursor-x`, `--cursor-y`) updated on mousemove.

   The host element must have `position: relative`. The hook adds
   three CSS custom properties to the host's inline style:
     --cursor-x        — px offset from the host's left edge
     --cursor-y        — px offset from the host's top edge
     --cursor-active   — 1 while pointer is inside, 0 on leave
                         (consume via `opacity: var(--cursor-active)`
                          on the overlay so the fade is CSS-driven)

   Accessibility:
     - prefers-reduced-motion: reduce  → no-op (no listeners attached)
     - pointer: coarse                 → no-op (touch devices)

   The hook never blocks pointer events on the host — listeners are
   passive mousemove / mouseleave only. Click semantics on the host
   are preserved; the overlay element painted by the wrapper component
   carries `pointer-events: none` so it never intercepts taps.

   USAGE
     const ref = useRef(null);
     useCursorHighlight(ref);
     <div ref={ref} style={{ position: "relative" }}> ... </div>

     // gate by external state
     useCursorHighlight(ref, { enabled: !isDragging });

   See `CursorHighlight.jsx` for the ergonomic wrapper that paints the
   overlay and surfaces a `color` + `radius` prop. */
import { useEffect } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const COARSE_POINTER_QUERY = "(pointer: coarse)";

function _matches(query) {
  if(typeof window === "undefined" || !window.matchMedia) return false;
  try { return window.matchMedia(query).matches; }
  catch(e) { return false; }
}

/**
 * Attaches a cursor-following radial-gradient highlight to a DOM ref.
 *
 * @param {React.RefObject<HTMLElement>} ref
 * @param {Object} [opts]
 * @param {boolean} [opts.enabled=true] — gate the effect
 */
export function useCursorHighlight(ref, opts) {
  const enabled = opts && opts.enabled === false ? false : true;

  useEffect(() => {
    const el = ref && ref.current;
    if(!el) return undefined;
    /* Reset --cursor-active on every disabled / preference-mismatch
       early-exit. Without this, a card that was highlighted on the
       last mousemove keeps its glow forever when the effect is
       subsequently gated off (Codex P2 finding on #136). The mouse-
       leave handler can't run because the listener was removed by
       the prior effect cleanup. */
    if(!enabled || _matches(REDUCED_MOTION_QUERY) || _matches(COARSE_POINTER_QUERY)) {
      el.style.setProperty("--cursor-active", "0");
      return undefined;
    }

    const onMove = (e) => {
      // getBoundingClientRect is safe in jsdom (returns zeros) and in
      // the browser. We read on every move — cheap, no rAF needed for
      // a 120px gradient; the browser already throttles paints.
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty("--cursor-x", x + "px");
      el.style.setProperty("--cursor-y", y + "px");
      el.style.setProperty("--cursor-active", "1");
    };
    const onLeave = () => {
      el.style.setProperty("--cursor-active", "0");
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      /* Reset active state on cleanup so a re-render that flips the
         effect off doesn't leave the host inline-styled highlighted. */
      el.style.setProperty("--cursor-active", "0");
    };
  }, [ref, enabled]);
}
