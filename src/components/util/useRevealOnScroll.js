/* component/util · useRevealOnScroll — Wave 12 ambient choreography.
   Inpatient Antibiotic Guide — module graph documented in README.md.

   Wires the existing `.rx-fade-in-up` :nth-child cascade (which only
   fires on FIRST PAINT) into a scroll-into-view trigger as well. The
   hook attaches an IntersectionObserver to a ref; the first time the
   target enters the viewport, it sets `data-revealed="true"` on the
   element and disconnects the observer. The CSS rules in
   `src/styles/choreography.js` then run the staggered reveal cascade
   on the section's direct interactive children (cards / accordions /
   tnodes / steps).

   Cap: ONE trigger per page-load. The observer disconnects after the
   first intersection so scrolling back to the section does NOT
   re-run the animation — replays would read as glitchy on a
   reference document.

   Gating:
   - `prefers-reduced-motion: reduce` → hook is a no-op. The element
     never gets data-revealed and the CSS cascade never paints. Static
     content remains static.
   - The IntersectionObserver itself is feature-detected; older
     browsers that lack it fall through silently (the existing
     first-paint cascade still works).

   USAGE
     const ref = useRef(null);
     useRevealOnScroll(ref);
     return <section ref={ref} className="rx-section">...</section>;
*/
import { useEffect } from "react";

export function useRevealOnScroll(ref, options = {}) {
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (typeof IntersectionObserver === "undefined") return undefined;
    if (window.matchMedia
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }
    const el = ref && ref.current;
    if (!el) return undefined;

    // Already revealed (HMR / re-mount after scroll-back) — keep it on
    // so subsequent renders don't blink, but don't observe again.
    if (el.getAttribute("data-revealed") === "true") return undefined;

    const obs = new IntersectionObserver(
      (entries) => {
        for (let i = 0; i < entries.length; i++) {
          const e = entries[i];
          if (e.isIntersecting) {
            e.target.setAttribute("data-revealed", "true");
            try { obs.disconnect(); } catch (_) { /* best-effort */ }
            return;
          }
        }
      },
      {
        root: null,
        rootMargin: options.rootMargin || "0px 0px -10% 0px",
        threshold: options.threshold ?? 0.05,
      }
    );

    try { obs.observe(el); } catch (_) { /* best-effort */ }
    return () => { try { obs.disconnect(); } catch (_) { /* best-effort */ } };
  }, [ref, options.rootMargin, options.threshold]);
}

export default useRevealOnScroll;
