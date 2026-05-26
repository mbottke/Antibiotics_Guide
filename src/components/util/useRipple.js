/* component/util · useRipple — Wave 7 W7-A motion + microinteractions.

   Attaches a Material-style click ripple to a DOM ref. On pointerdown,
   a circular `.rx-ripple-fx` span is appended to the host, sized to
   cover the longest edge and centered on the cursor. The CSS keyframe
   `rx-ripple-expand` scales it up and fades it out over 600ms; we then
   remove the node after 700ms to keep the DOM clean.

   The host must carry the `.rx-ripple` className so it gets the
   `position: relative; overflow: hidden;` necessary to clip the ripple.

   Accessibility:
     - prefers-reduced-motion: reduce  → no-op (no ripple emitted)
     - SSR-safe — bails when window is undefined
     - pointerdown (not click) so the ripple emits even if the click
       is canceled or the pointer is dragged off before release

   USAGE
     const ref = useRef(null);
     useRipple(ref);
     <button ref={ref} className="rx-ripple"> ... </button> */
import { useEffect } from "react";

export function useRipple(ref) {
  useEffect(() => {
    const el = ref && ref.current;
    if(!el) return undefined;
    if(typeof window === "undefined") return undefined;
    if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const onPointerDown = (e) => {
      const r = el.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "rx-ripple-fx";
      const size = Math.max(r.width, r.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - r.left - size / 2}px`;
      ripple.style.top  = `${e.clientY - r.top  - size / 2}px`;
      el.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    };
    el.addEventListener("pointerdown", onPointerDown);
    return () => el.removeEventListener("pointerdown", onPointerDown);
  }, [ref]);
}
