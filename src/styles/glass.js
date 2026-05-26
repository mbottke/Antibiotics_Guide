/* styles · glass — Wave 9 W9 frosted-glass + chrome + iridescence utility module.
   Inpatient Antibiotic Guide — module graph documented in README.md.

   A library of opt-in surface utilities that elevate any panel / button /
   overlay to feel like the Apple Vision Pro lock screen meets Stripe.com:

     .rx-glass-bleed        — edge-light bleed: cyan glow on top/left edges + outer halo
     .rx-iridescent-border  — conic-gradient border that slowly hue-rotates
     .rx-chrome-cta         — vertical metallic gradient pill with sheen + hover shimmer
     .rx-mercury-backdrop   — modal scrim with drifting multi-color ripple
     .rx-glass-diffuse      — frosted "light source behind" panel surface
     .rx-light-ring-red     — neon light-ring severity dot (required)
     .rx-light-ring-amber   — neon light-ring severity dot (trigger)
     .rx-light-ring-cyan    — neon light-ring severity dot (consider)
     .rx-focus-halo         — augmented two-layer cyan halo on focus-visible
     .rx-gloss              — top-edge gloss highlight (iOS app icon shine)
     .rx-glow-lift          — cyan glow-trail card lift on hover (overshoot + settle)

   Every animation is gated by `prefers-reduced-motion: reduce` at the
   bottom of the module. Components do not adopt these by default — adding
   a class to one or two example call sites is fine; mass adoption is a
   follow-up. The CSS string is exported and injected by App.jsx alongside
   CSS / CSS2 / CSS3 / CSS4 / CSS5 / KINETIC / MICRO. */

const GLASS = `
/* === G1 · Edge-bleed glow on frosted panels ============================
   Renders an inner cyan light-bleed gradient (::before) and an outer
   halo + 1px cyan ring (::after). Drop on any panel-like element with
   border-radius — both pseudo-elements inherit it. */
.rx-glass-bleed{
  position: relative;
  isolation: isolate;
}
.rx-glass-bleed::before{
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--ox-bright) 28%, transparent) 0%,
    transparent 35%);
  mix-blend-mode: screen;
  pointer-events: none;
  z-index: 1;
}
.rx-glass-bleed::after{
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--ox-bright) 40%, transparent),
    0 0 24px -4px color-mix(in srgb, var(--ox-bright) 35%, transparent);
  pointer-events: none;
  z-index: 0;
}

/* === G2 · Iridescent border ===========================================
   1.5px conic-gradient ring that hue-rotates cyan → magenta → lime → cyan
   over 8s. Use as a wrapper around any panel: the wrapper gets the class,
   the inner element keeps its own background and inherits border-radius. */
@keyframes rxIridescent{
  to { transform: rotate(360deg); }
}
.rx-iridescent-border{
  position: relative;
  padding: 1.5px;
  border-radius: 16px;
  background: conic-gradient(from 0deg,
    var(--neon-cyan),
    var(--hot-magenta),
    var(--electric-lime),
    var(--neon-cyan));
  background-size: 200% 200%;
  isolation: isolate;
}
.rx-iridescent-border::before{
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: conic-gradient(from 0deg,
    var(--neon-cyan),
    var(--hot-magenta),
    var(--electric-lime),
    var(--neon-cyan));
  animation: rxIridescent 8s linear infinite;
  z-index: -1;
}
.rx-iridescent-border > *{
  background: var(--panel);
  border-radius: inherit;
  display: block;
}

/* === G3 · Chrome CTA pill ==============================================
   Vertical metallic gradient (steel-dark → steel-mid → steel-light band
   at 35% → steel-mid → steel-dark) so a thin lighter "sheen" ridge sits
   one-third of the way down. Asymmetric radius 14/3/14/3, backdrop
   blur(8px). Hover sweeps a translucent diagonal band L→R; active
   compresses with an inset pressed shadow. */
.rx-chrome-cta{
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 14px 3px 14px 3px;
  border: 1px solid color-mix(in srgb, var(--steel-dark) 70%, transparent);
  color: #fff;
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: .01em;
  cursor: pointer;
  overflow: hidden;
  isolation: isolate;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background:
    linear-gradient(180deg,
      var(--steel-dark) 0%,
      var(--steel-mid) 30%,
      var(--steel-light) 35%,
      var(--steel-mid) 42%,
      var(--steel-dark) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.35),
    inset 0 -1px 0 rgba(0,0,0,0.30),
    0 6px 14px -4px rgba(11,15,20,0.45);
  transition:
    box-shadow var(--duration-base, 180ms) var(--ease-out, ease),
    transform var(--duration-fast, 120ms) var(--ease-out, ease);
}
.rx-chrome-cta::after{
  content: "";
  position: absolute;
  top: 0; left: -120%;
  width: 60%; height: 100%;
  background: linear-gradient(110deg,
    transparent 0%,
    rgba(255,255,255,0.45) 50%,
    transparent 100%);
  transform: skewX(-18deg);
  pointer-events: none;
  transition: left 600ms cubic-bezier(0.16, 1, 0.3, 1);
}
.rx-chrome-cta:hover::after{ left: 140%; }
.rx-chrome-cta:hover{
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.45),
    inset 0 -1px 0 rgba(0,0,0,0.30),
    0 10px 22px -6px rgba(11,15,20,0.55),
    0 0 24px -6px color-mix(in srgb, var(--neon-cyan) 35%, transparent);
}
.rx-chrome-cta:active{
  transform: translateY(1px);
  box-shadow:
    inset 0 2px 4px rgba(0,0,0,0.35),
    inset 0 -1px 0 rgba(255,255,255,0.10),
    0 2px 6px -2px rgba(11,15,20,0.45);
}
.rx-chrome-cta:focus-visible{
  outline: 2px solid var(--neon-cyan);
  outline-offset: 2px;
}

/* === G4 · Mercury modal backdrop =======================================
   Replaces flat scrims. Heavy backdrop-filter (blur 24px + saturate 170%)
   plus four overlapping low-alpha radial gradients that drift at 40–60s
   each, mimicking liquid mercury catching ambient room light. */
@keyframes rxMercuryA{
  0%   { transform: translate3d(0%,0%,0) scale(1); }
  50%  { transform: translate3d(8%,-6%,0) scale(1.10); }
  100% { transform: translate3d(0%,0%,0) scale(1); }
}
@keyframes rxMercuryB{
  0%   { transform: translate3d(0%,0%,0) scale(1); }
  50%  { transform: translate3d(-7%,5%,0) scale(1.08); }
  100% { transform: translate3d(0%,0%,0) scale(1); }
}
@keyframes rxMercuryC{
  0%   { transform: translate3d(0%,0%,0) scale(1); }
  50%  { transform: translate3d(5%,7%,0) scale(1.12); }
  100% { transform: translate3d(0%,0%,0) scale(1); }
}
@keyframes rxMercuryD{
  0%   { transform: translate3d(0%,0%,0) scale(1); }
  50%  { transform: translate3d(-6%,-8%,0) scale(1.06); }
  100% { transform: translate3d(0%,0%,0) scale(1); }
}
.rx-mercury-backdrop{
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(15, 23, 42, 0.32);
  backdrop-filter: blur(24px) saturate(170%);
  -webkit-backdrop-filter: blur(24px) saturate(170%);
  overflow: hidden;
  isolation: isolate;
}
.rx-mercury-backdrop::before,
.rx-mercury-backdrop::after{
  content: "";
  position: absolute;
  inset: -20%;
  pointer-events: none;
  background:
    radial-gradient(circle at 22% 28%, var(--mercury-ripple-a) 0%, transparent 38%),
    radial-gradient(circle at 78% 18%, var(--mercury-ripple-b) 0%, transparent 42%);
  animation: rxMercuryA 48s ease-in-out infinite;
  will-change: transform;
}
.rx-mercury-backdrop::after{
  background:
    radial-gradient(circle at 30% 80%, var(--mercury-ripple-c) 0%, transparent 40%),
    radial-gradient(circle at 72% 70%, var(--mercury-ripple-a) 0%, transparent 44%);
  animation: rxMercuryB 56s ease-in-out infinite reverse;
}
/* A second layer of drifting ripples via inner element. Either an inner
   <div class="rx-mercury-layer"/> or the next sibling picks these up. */
.rx-mercury-layer{
  position: absolute; inset: -20%; pointer-events: none;
  background:
    radial-gradient(circle at 55% 45%, var(--mercury-ripple-b) 0%, transparent 36%),
    radial-gradient(circle at 12% 62%, var(--mercury-ripple-c) 0%, transparent 40%);
  animation: rxMercuryC 60s ease-in-out infinite;
}
.rx-mercury-layer + .rx-mercury-layer,
.rx-mercury-layer.alt{
  animation: rxMercuryD 52s ease-in-out infinite reverse;
  background:
    radial-gradient(circle at 80% 50%, var(--mercury-ripple-a) 0%, transparent 38%),
    radial-gradient(circle at 40% 30%, var(--mercury-ripple-b) 0%, transparent 36%);
}

/* === G5 · Inner glass diffusion ========================================
   "Looking through frosted glass with a light source behind". Heavy blur,
   high saturate, soft top-light gradient, hairline white border, deep
   shadow with inner top-edge highlight. */
.rx-glass-diffuse{
  backdrop-filter: blur(28px) saturate(190%);
  -webkit-backdrop-filter: blur(28px) saturate(190%);
  background: linear-gradient(135deg,
    rgba(255,255,255,0.65) 0%,
    rgba(245,250,253,0.45) 100%);
  border: 1px solid rgba(255,255,255,0.5);
  box-shadow:
    0 24px 48px -12px rgba(15,23,42,0.18),
    inset 0 1px 0 rgba(255,255,255,0.5);
}

/* === G6 · Neon light-ring severity dots ================================
   10px circle with 2px gradient border + outer glow + inner highlight.
   Severity-required (red) pulses every 2s. */
@keyframes rxRingPulse{
  0%, 100% { box-shadow:
              0 0 0 2px color-mix(in srgb, var(--vivid-red) 25%, transparent),
              0 0 8px color-mix(in srgb, var(--vivid-red) 55%, transparent); }
  50%      { box-shadow:
              0 0 0 4px color-mix(in srgb, var(--vivid-red) 18%, transparent),
              0 0 14px color-mix(in srgb, var(--vivid-red) 70%, transparent); }
}
.rx-light-ring-red,
.rx-light-ring-amber,
.rx-light-ring-cyan{
  position: relative;
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid;
  vertical-align: middle;
}
.rx-light-ring-red{
  border-color: var(--vivid-red);
  background:
    radial-gradient(circle at 32% 30%, rgba(255,255,255,0.85) 0%, transparent 38%),
    var(--vivid-red);
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--vivid-red) 25%, transparent),
    0 0 8px color-mix(in srgb, var(--vivid-red) 55%, transparent);
  animation: rxRingPulse 2s ease-in-out infinite;
}
.rx-light-ring-amber{
  border-color: var(--neon-amber);
  background:
    radial-gradient(circle at 32% 30%, rgba(255,255,255,0.85) 0%, transparent 38%),
    var(--neon-amber);
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--neon-amber) 25%, transparent),
    0 0 8px color-mix(in srgb, var(--neon-amber) 55%, transparent);
}
.rx-light-ring-cyan{
  border-color: var(--neon-cyan);
  background:
    radial-gradient(circle at 32% 30%, rgba(255,255,255,0.85) 0%, transparent 38%),
    var(--neon-cyan);
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--neon-cyan) 25%, transparent),
    0 0 8px color-mix(in srgb, var(--neon-cyan) 55%, transparent);
}

/* === G7 · Cyan focus halo (two-layer) ==================================
   Augments :focus-visible — a tight 2px cyan border + an inner 24px halo
   AND an outer 36px wider lower-alpha halo for depth. Opt-in: only when
   the input/select/textarea carries the .rx-focus-halo class. */
.rx-focus-halo:focus-visible{
  outline: none;
  border-color: var(--neon-cyan);
  box-shadow:
    0 0 0 2px var(--neon-cyan),
    0 0 24px color-mix(in srgb, var(--neon-cyan) 40%, transparent),
    0 0 36px 6px color-mix(in srgb, var(--neon-cyan) 18%, transparent);
}

/* === G8 · Elevation 4–7 shadows ========================================
   Convenience utilities that map directly to the new tokens. */
.rx-shadow-e4{ box-shadow: var(--shadow-e4); }
.rx-shadow-e5{ box-shadow: var(--shadow-e5); }
.rx-shadow-e6{ box-shadow: var(--shadow-e6); }
.rx-shadow-e7{ box-shadow: var(--shadow-e7); }

/* === G9 · Gloss top-edge highlight =====================================
   ::before fills the top half with a white→transparent gradient at low
   alpha, matching the parent's top corners. Pair with any rounded panel. */
.rx-gloss{
  position: relative;
  isolation: isolate;
}
.rx-gloss::before{
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50%;
  border-radius: inherit;
  background: linear-gradient(180deg,
    var(--gloss-top) 0%,
    rgba(255,255,255,0.10) 70%,
    transparent 100%);
  pointer-events: none;
  z-index: 1;
}

/* === G10 · Card lift with glow trail ===================================
   Hover overshoots a stronger cyan glow then settles to a steady warm
   glow, mimicking inertia. Spring-style cubic-bezier. Opt-in: add
   .rx-glow-lift to any interactive card. */
@keyframes rxGlowOvershoot{
  0%   { box-shadow: var(--shadow-e2),
                     0 0 0 0   color-mix(in srgb, var(--neon-cyan) 0%, transparent); }
  60%  { box-shadow: var(--shadow-e5),
                     0 0 36px 6px color-mix(in srgb, var(--neon-cyan) 55%, transparent); }
  100% { box-shadow: var(--shadow-e4),
                     0 0 20px 2px color-mix(in srgb, var(--neon-cyan) 30%, transparent); }
}
.rx-glow-lift{
  transition:
    transform 600ms cubic-bezier(.2,1.4,.4,1),
    box-shadow 600ms cubic-bezier(.2,1.4,.4,1);
}
.rx-glow-lift:hover{
  transform: translateY(-4px);
  animation: rxGlowOvershoot 600ms cubic-bezier(.2,1.4,.4,1) forwards;
}

/* === Reduced-motion guards ============================================
   Every animation collapses to a static state. Iridescent border stops
   hue-rotating but keeps its colored ring; mercury ripples freeze in
   place; light-ring-red stops pulsing; chrome shimmer + glow overshoot
   become inert. */
@media (prefers-reduced-motion: reduce){
  .rx-iridescent-border::before,
  .rx-mercury-backdrop::before,
  .rx-mercury-backdrop::after,
  .rx-mercury-layer,
  .rx-light-ring-red,
  .rx-glow-lift{
    animation: none !important;
  }
  .rx-chrome-cta::after{
    transition: none !important;
  }
  .rx-glow-lift{
    transition: none !important;
  }
}
`;

export { GLASS };
