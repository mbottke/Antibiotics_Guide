/* component/util · useParallaxScroll — Wave 9 z-axis parallax on scroll.

   Translates a DOM ref opposite to the page scroll direction at a
   user-supplied `speed` multiplier, creating the editorial parallax
   effect where decorative elements (watermark letters, oversized
   numerals) drift slower than the body type.

   The hook computes the element's offset from the viewport center on
   every scroll/resize tick and applies a `translate3d(0, dy, 0)` or
   `translate3d(dx, 0, 0)` transform, rAF-coalesced so multiple scroll
   events in the same frame collapse to one DOM write.

   Math:
     centerOffset = elementCenterFromViewportTop - viewportHeight / 2
     translate    = centerOffset * speed * -1

   A positive `speed` drifts the element opposite to scroll (the usual
   "depth" parallax). A speed of 0 disables motion entirely. Suggested
   range: 0.1 - 0.5 (gentle).

   Accessibility:
     - prefers-reduced-motion: reduce  → no-op
     - SSR-safe — bails when window is undefined

   USAGE
     const ref = useRef(null);
     useParallaxScroll(ref);                       // default speed 0.3, y axis
     useParallaxScroll(ref, { speed: 0.5 });
     useParallaxScroll(ref, { speed: 0.2, axis: "x" });
     <span ref={ref}>S</span>

   The hook does NOT clear `will-change`; callers are expected to set
   the parent's containment as appropriate. On unmount the inline
   transform is cleared. */
import { useEffect } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function _matches(query) {
  if(typeof window === "undefined" || !window.matchMedia) return false;
  try { return window.matchMedia(query).matches; }
  catch(e) { return false; }
}

/**
 * Attaches a scroll-driven parallax translate to a DOM ref.
 *
 * @param {React.RefObject<HTMLElement>} ref
 * @param {Object} [opts]
 * @param {number} [opts.speed=0.3]      — translate multiplier (0 disables)
 * @param {"y"|"x"} [opts.axis="y"]      — translate axis
 * @param {boolean} [opts.enabled=true]  — gate the effect
 */
export function useParallaxScroll(ref, opts) {
  const speed = (opts && typeof opts.speed === "number") ? opts.speed : 0.3;
  const axis = (opts && opts.axis === "x") ? "x" : "y";
  const enabled = opts && opts.enabled === false ? false : true;

  useEffect(() => {
    const el = ref && ref.current;
    if(!el) return undefined;
    if(typeof window === "undefined") return undefined;
    if(!enabled || speed === 0 || _matches(REDUCED_MOTION_QUERY)) {
      el.style.transform = "";
      return undefined;
    }

    let frame = 0;
    let scheduled = false;

    const compute = () => {
      scheduled = false;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 0;
      const vw = window.innerWidth || 0;
      const centerY = r.top + r.height / 2;
      const centerX = r.left + r.width / 2;
      const offsetY = centerY - vh / 2;
      const offsetX = centerX - vw / 2;
      const d = (axis === "x" ? offsetX : offsetY) * speed * -1;
      if(axis === "x") {
        el.style.transform = "translate3d(" + d.toFixed(2) + "px, 0, 0)";
      } else {
        el.style.transform = "translate3d(0, " + d.toFixed(2) + "px, 0)";
      }
    };

    const schedule = () => {
      if(scheduled) return;
      scheduled = true;
      frame = window.requestAnimationFrame(compute);
    };

    // Run once on mount so the initial transform reflects current scroll.
    schedule();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if(frame) window.cancelAnimationFrame(frame);
      el.style.transform = "";
    };
  }, [ref, speed, axis, enabled]);
}
