/* component/util · FocusReveal — Wave 6 W6-B mount-reveal wrapper.

   Wraps any child in a tasteful fade + rise on mount. Reads
   `prefers-reduced-motion` and disables the animation when the OS
   preference asks for it; the underlying CSS rule also collapses
   the animation under reduced-motion, so the JS guard is belt +
   braces (the JS guard skips even the no-op transition tick on
   re-renders).

   USAGE
     <FocusReveal>
       <Section ... />
     </FocusReveal>

     // delayed (e.g., stagger inside a list)
     <FocusReveal delay={120}>
       <Card />
     </FocusReveal>

     // tighter — for inner content that should reveal faster
     <FocusReveal variant="fast">{children}</FocusReveal>

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useEffect, useState } from "react";

const VARIANT_CLASS = {
  default: "rx-reveal",
  fast:    "rx-reveal-fast",
  fade:    "rx-fade",
};

/* Inline reduced-motion check. Once useReducedMotion ships in a
   separate Wave 6 PR (claude/w6-onboarding-motion) we'll consolidate
   the two; for now this branch is self-contained so the visual-polish
   kit can ship without dependency ordering. */
function _useReducedMotionLocal() {
  const [reduced, setReduced] = useState(() => {
    if(typeof window === "undefined" || !window.matchMedia) return false;
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
    catch(e) { return false; }
  });
  useEffect(() => {
    if(typeof window === "undefined" || !window.matchMedia) return undefined;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e) => setReduced(!!e.matches);
    if(typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
    if(typeof mql.addListener === "function") {
      mql.addListener(onChange);
      return () => mql.removeListener(onChange);
    }
    return undefined;
  }, []);
  return reduced;
}

export function FocusReveal({ children, variant = "default", delay = 0, as: As = "div", style, ...rest }) {
  const reduced = _useReducedMotionLocal();
  const cls = reduced ? "" : (VARIANT_CLASS[variant] || VARIANT_CLASS.default);
  const finalStyle = (delay && !reduced)
    ? { ...style, animationDelay: `${delay}ms` }
    : style;
  return (
    <As className={cls} style={finalStyle} {...rest}>
      {children}
    </As>
  );
}
