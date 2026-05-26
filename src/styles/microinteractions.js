/* styles · microinteractions — Wave 7 W7-A motion + microinteraction utilities.
   Inpatient Antibiotic Guide — module graph documented in README.md.

   A library of small but unmistakable interaction effects that components
   can adopt by adding a className:

     .rx-magnetic        — cursor-magnetic button (pair with useMagnetic)
     .rx-gradient-border — animated gradient ring on hover/focus-within
     .rx-shine-sweep     — diagonal shine animation on hover
     .rx-ripple          — click ripple host (pair with useRipple)
     .rx-ripple-fx       — individual ripple element (injected by hook)
     .rx-glow-trail      — soft radial glow following mouse via custom props
     .rx-fade-in-up      — utility for staggered entry animation

   All effects are gated by a `prefers-reduced-motion: reduce` guard at the
   bottom of the module. Components do not adopt these yet — that is the
   integrator's job. The CSS string is exported and injected by App.jsx
   alongside CSS / CSS2 / CSS3 / CSS4 / CSS5. */

const MICRO = `
/* .rx-magnetic — cursor-magnetic button; useMagnetic sets translate3d via JS. */
.rx-magnetic{
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

/* .rx-gradient-border — animated gradient ring border on hover/focus-within. */
.rx-gradient-border{
  position: relative;
  isolation: isolate;
}
.rx-gradient-border::before{
  content: "";
  position: absolute;
  inset: -1px;
  background: linear-gradient(135deg, var(--neon-cyan, var(--ox)), var(--electric-blue, var(--ox)), var(--hot-magenta, var(--ox)));
  border-radius: inherit;
  z-index: -1;
  opacity: 0;
  transition: opacity 200ms var(--ease-out);
}
.rx-gradient-border:hover::before,
.rx-gradient-border:focus-within::before{
  opacity: 1;
}

/* .rx-shine-sweep — diagonal shine animation that sweeps across on hover. */
.rx-shine-sweep{
  position: relative;
  overflow: hidden;
}
.rx-shine-sweep::after{
  content: "";
  position: absolute; top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%);
  transition: left 480ms cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}
.rx-shine-sweep:hover::after{
  left: 130%;
}

/* .rx-ripple — click ripple host; useRipple injects .rx-ripple-fx children. */
.rx-ripple{
  position: relative;
  overflow: hidden;
}
/* .rx-ripple-fx — individual ripple span, animates and self-removes. */
.rx-ripple-fx{
  position: absolute;
  border-radius: 50%;
  background: var(--neon-cyan-soft, rgba(0, 212, 255, 0.18));
  transform: scale(0);
  animation: rx-ripple-expand 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  pointer-events: none;
}
@keyframes rx-ripple-expand{
  to { transform: scale(4); opacity: 0; }
}

/* .rx-glow-trail — soft radial glow that follows --mx/--my custom props. */
.rx-glow-trail{
  position: relative;
}
.rx-glow-trail::before{
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(120px circle at var(--mx, 50%) var(--my, 50%), var(--neon-cyan-soft, rgba(0, 212, 255, 0.10)), transparent 65%);
  opacity: var(--mactive, 0);
  pointer-events: none;
  transition: opacity 200ms var(--ease-out);
}

/* .rx-fade-in-up — staggered entry animation (translateY + opacity). */
@keyframes rx-fade-in-up{
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.rx-fade-in-up{
  animation: rx-fade-in-up 480ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* .rx-card-spotlight — Wave 9 cursor-following radial spotlight overlay.
   Pair with useCursorHighlight (sets --cursor-x/--cursor-y/--cursor-active)
   OR with the global delegated handler in App.jsx that attaches to every
   .rx-card-interactive surface. The ::before pseudo-element paints a soft
   neon-cyan halo at the pointer position. */
.rx-card-spotlight{
  position: relative;
  isolation: isolate;
}
.rx-card-spotlight::before{
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(220px circle at var(--cursor-x, 50%) var(--cursor-y, 50%),
    color-mix(in srgb, var(--ox-bright) 14%, transparent) 0%,
    transparent 60%);
  opacity: var(--cursor-active, 0);
  transition: opacity var(--duration-base, 200ms) var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1));
  pointer-events: none;
  z-index: 0;
}
.rx-card-spotlight > *{ position: relative; z-index: 1; }

/* .rx-tilt-host — Wave 9 3D tilt host marker.
   Hooks (useTilt / SpotlightCard) write inline transforms; this class
   ensures the host is set up for 3D rendering and gets a smooth reset
   transition when the cursor leaves. The hook ALSO sets transform-style
   inline, so this class is a CSS-only "I'm tilt-capable" hint. */
.rx-tilt-host{
  transform-style: preserve-3d;
  will-change: transform;
}

/* .rx-depth-3 — Wave 9 layered depth shadow stack.
   Three stacked shadows + an asymmetric cyan side-glow simulate a true
   3D depth pop, as if the card were lifted off the page and lit from
   the right. Pairs with .rx-card. */
.rx-depth-3{
  box-shadow:
    0 1px 2px rgba(11,15,20,0.08),
    0 8px 16px -4px rgba(11,15,20,0.12),
    0 24px 48px -12px rgba(11,15,20,0.18),
    8px 0 24px -8px rgba(0,212,255,0.18);
}

/* Counter-parallax for card content on hover — the OUTER card lifts,
   while the INNER content drifts -1px the other way so it reads as if
   it's floating on a glass pane above the surface. Use with
   .rx-card-interactive (or any card marked with --card-content-shift). */
.rx-card-interactive{ --card-content-shift: 0px; }
.rx-card-interactive:hover{ --card-content-shift: -1px; }
.rx-card-interactive:hover > *{
  transform: translateY(var(--card-content-shift));
  transition: transform var(--duration-base, 200ms) var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1));
}

/* Reduced-motion guards — disable all motion + leave gradient/glow off. */
@media (prefers-reduced-motion: reduce){
  .rx-magnetic, .rx-shine-sweep::after, .rx-fade-in-up{
    animation: none !important;
    transition: none !important;
  }
  .rx-glow-trail::before, .rx-gradient-border::before, .rx-card-spotlight::before{
    transition: none !important;
    opacity: 0 !important;
  }
  .rx-tilt-host{ transform: none !important; }
  .rx-card-interactive:hover > *{ transform: none !important; transition: none !important; }
}

/* Coarse-pointer guard — no cursor on touch devices, so the spotlight
   would never light up anyway. Hide it explicitly so the empty radial
   gradient doesn't ship a wasted compositor layer. */
@media (pointer: coarse){
  .rx-card-spotlight::before{ display: none; }
  .rx-tilt-host{ transform: none !important; }
}
`;

export { MICRO };
