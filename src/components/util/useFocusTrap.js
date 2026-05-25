/* component/util · useFocusTrap — keep keyboard focus inside an open
   modal drawer, restore focus to the trigger on close.

   Addresses the UI audit's WCAG 2.4.3 / 2.1.2 finding (#1): both Wave 5
   drawers (MechanismDrawer, DecisionAttributionDrawer) opened without
   trapping Tab focus or restoring focus to the trigger on close.

   Behavior:
     • On open: capture document.activeElement as the return target,
       move focus to the first focusable descendant of `ref.current`
       (or `ref.current` itself if no descendant is focusable).
     • While open: a Tab keydown listener on the document loops Tab /
       Shift+Tab inside the focusable set so keyboard users cannot
       escape the modal silently.
     • On close (open flips from true to false): restore focus to the
       previously-captured element, unless it has been unmounted.

   USAGE
   -----
     const ref = useRef(null);
     useFocusTrap(ref, open);
     ...
     {open && <div ref={ref} role="dialog" ...> ... </div>}

   The hook is no-op SSR-safe: when document is undefined, all branches
   short-circuit. */
import { useEffect } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function useFocusTrap(ref, open) {
  useEffect(() => {
    if(!open) return undefined;
    if(typeof document === "undefined") return undefined;

    const trigger = document.activeElement;
    const node = ref.current;

    // Focus the first focusable descendant (or the container itself).
    const focusFirst = () => {
      if(!node) return;
      const focusables = node.querySelectorAll(FOCUSABLE);
      if(focusables.length > 0) {
        focusables[0].focus();
      } else if(typeof node.focus === "function") {
        node.focus();
      }
    };
    focusFirst();

    const onKey = (e) => {
      if(e.key !== "Tab") return;
      if(!node) return;
      const focusables = Array.from(node.querySelectorAll(FOCUSABLE));
      if(focusables.length === 0) { e.preventDefault(); return; }
      const first = focusables[0];
      const last  = focusables[focusables.length - 1];
      if(e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if(!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);

    return () => {
      document.removeEventListener("keydown", onKey, true);
      // Restore focus to the trigger if still in the DOM and focusable.
      if(trigger && typeof trigger.focus === "function"
          && document.contains(trigger)) {
        try { trigger.focus(); } catch(e) { /* node detached mid-close */ }
      }
    };
  }, [open, ref]);
}
