/* component/util · useTilt — Wave 9 cursor-driven 3D tilt hook.

   Attaches a perspective-based rotateX/rotateY transform to a DOM ref
   so the host element appears to tilt toward the cursor. The effect is
   the Apple/Linear-style "card that leans into the mouse" trick: the
   card pivots a few degrees on each axis as the cursor sweeps over it,
   then springs back to flat on mouseleave.

   The hook computes a 0-1 cursor position within the host's bounding
   rect, then maps that to a rotation around the center:

     rotateX = (0.5 - py) * intensity   // top of card tips forward
     rotateY = (px - 0.5) * intensity   // right of card tips back

   `transform-style: preserve-3d` is set so any 3D child elements (e.g.
   layered shadows, overlays with translateZ) participate in the tilt.

   Accessibility:
     - prefers-reduced-motion: reduce  → no-op
     - pointer: coarse                 → no-op (touch devices)
     - SSR-safe — bails when window is undefined

   USAGE
     const ref = useRef(null);
     useTilt(ref);                                    // defaults intensity=6, perspective=1000
     useTilt(ref, { intensity: 10, perspective: 800 });
     <div ref={ref}> ... </div>

   The hook writes inline `transform` and `transformStyle` on the host.
   On mouseleave it issues one final transition-friendly reset
   (`transform: perspective(...) rotateX(0) rotateY(0)`); a short CSS
   `transition: transform 200ms ease-out` is set inline so the reset
   eases. On unmount both inline properties are cleared. */
import { useEffect } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const COARSE_POINTER_QUERY = "(pointer: coarse)";

function _matches(query) {
  if(typeof window === "undefined" || !window.matchMedia) return false;
  try { return window.matchMedia(query).matches; }
  catch(e) { return false; }
}

/**
 * Attaches a cursor-driven 3D tilt to a DOM ref.
 *
 * @param {React.RefObject<HTMLElement>} ref
 * @param {Object} [opts]
 * @param {number} [opts.intensity=6]    — max rotation in degrees per axis
 * @param {number} [opts.perspective=1000] — perspective distance (px)
 * @param {boolean} [opts.enabled=true]  — gate the effect
 */
export function useTilt(ref, opts) {
  const intensity = (opts && typeof opts.intensity === "number") ? opts.intensity : 6;
  const perspective = (opts && typeof opts.perspective === "number") ? opts.perspective : 1000;
  const enabled = opts && opts.enabled === false ? false : true;

  useEffect(() => {
    const el = ref && ref.current;
    if(!el) return undefined;
    if(!enabled || _matches(REDUCED_MOTION_QUERY) || _matches(COARSE_POINTER_QUERY)) {
      // Ensure host is reset if effect was just disabled.
      el.style.transform = "";
      el.style.transformStyle = "";
      el.style.transition = "";
      return undefined;
    }

    el.style.transformStyle = "preserve-3d";
    el.style.transition = "transform 200ms cubic-bezier(0.16, 1, 0.3, 1)";

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      if(r.width === 0 || r.height === 0) return;
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * intensity;
      const ry = (px - 0.5) * intensity;
      el.style.transform =
        "perspective(" + perspective + "px) rotateX(" + rx.toFixed(3)
        + "deg) rotateY(" + ry.toFixed(3) + "deg)";
    };
    const onLeave = () => {
      el.style.transform =
        "perspective(" + perspective + "px) rotateX(0deg) rotateY(0deg)";
    };

    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave, { passive: true });

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      el.style.transform = "";
      el.style.transformStyle = "";
      el.style.transition = "";
    };
  }, [ref, intensity, perspective, enabled]);
}
