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

export function useMagnetic(ref, opts = {}) {
  const strength = opts.strength ?? 0.25;
  const range = opts.range ?? 80;

  useEffect(() => {
    const el = ref && ref.current;
    if(!el) return undefined;
    if(typeof window === "undefined") return undefined;
    if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    if(window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return undefined;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if(dist > range) {
        el.style.transform = "translate3d(0, 0, 0)";
        return;
      }
      el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
    };
    const onLeave = () => {
      el.style.transform = "translate3d(0, 0, 0)";
    };

    document.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      el.style.transform = "";
    };
  }, [ref, strength, range]);
}
