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
export function useTilt(ref, _opts) {
  // The cursor-driven 3D card tilt was the largest single source of
  // bedside motion noise — every option/regimen card ran its own
  // mousemove listener and rewrote `transform` on every frame, which
  // popped against hover transitions on parent containers and read
  // as jagged on slower devices. The hook is preserved as a no-op so
  // every call site keeps compiling; we still clear any inline
  // transform we may have written on a previous render in case the
  // effect was hot-toggled. The other reduced-motion / coarse-pointer
  // gates are now redundant and left out.
  useEffect(() => {
    const el = ref && ref.current;
    if (!el) return undefined;
    el.style.transform = "";
    el.style.transformStyle = "";
    el.style.transition = "";
    return undefined;
  }, [ref]);
}
