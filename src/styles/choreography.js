/* styles · choreography — Wave 12 ambient response choreography.
   Inpatient Antibiotic Guide — module graph documented in README.md.

   Extends the Wave 9–11 cursor-spotlight / mesh-blob-shift vocabulary
   into the relationships *between* elements. Six (+ one cursor-trail)
   moves layer onto the existing motion library; each is gated by
   `prefers-reduced-motion: reduce` (and several by `pointer: coarse`)
   so the bedside surface never animates against user preference.

   CSS classes / data-attributes introduced
   ----------------------------------------
     [data-focus-dim="sibling"]     — CH1 focus-mode dim of unhovered siblings
     [data-revealed="true"]         — CH2 scroll-into-view reveal cascade trigger
     [data-just-entered="true"]     — CH3 scene-break pulse on SectionArtwork
     [data-user-idle="true"]        — CH4 ambient mesh intensification (on html root)
     [data-tier-id]/[data-tier-target] — CH5 active-tier co-spotlight
     [data-just-arrived="true"]     — CH6 destination-section MeshWash drift
     [data-trail-active="true"]     — CH7 cursor-trail glow on .rx-chrome-cta

   Every motion declaration here resolves to `none` / `inherit` under
   `(prefers-reduced-motion: reduce)`. Cursor-driven moves (CH1, CH7)
   are additionally gated by `(pointer: coarse)` at the JS layer so the
   listeners never install on touch — the CSS still resolves
   harmlessly because the data-attributes never get set on those
   configurations. */

const CHOREOGRAPHY = `
/* ============================================================
   CH1 · Focus-mode dimming — sibling soften
   ============================================================
   Set by the delegated mouseover listener in App.jsx on every
   .rx-card-interactive sibling within the hovered card's parent.
   Opacity ducks from 1.0 → 0.78 and saturation softens 8% so the
   hovered surface visually "pops" without scaling or shifting. */
[data-focus-dim="sibling"] {
  opacity: 0.78;
  filter: saturate(0.92);
  transition:
    opacity .26s var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)),
    filter  .26s var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1));
}

/* ============================================================
   CH2 · Scroll-triggered reveal cascade within sections
   ============================================================
   The IntersectionObserver in useRevealOnScroll fires
   data-revealed="true" on the Section element when its top edge
   crosses the viewport. The cascade animation runs on the
   section's direct interactive children (cards, accordions,
   tnodes, steps) with a 60ms per-child stagger. Pairs with the
   existing first-paint nth-child stagger in app-styles.js — the
   data-revealed attribute is only set once per page-load so
   scrolling back to a section does NOT re-trigger the animation. */
@keyframes rxRevealUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.rx-section[data-revealed="true"] > div > .rx-card,
.rx-section[data-revealed="true"] > div > .rx-acc,
.rx-section[data-revealed="true"] > div > .rx-tnode,
.rx-section[data-revealed="true"] > div > .rx-step,
.rx-section[data-revealed="true"] [data-w12-reveal-child] {
  animation: rxRevealUp 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
.rx-section[data-revealed="true"] > div > *:nth-child(1)  { animation-delay: 0ms;   }
.rx-section[data-revealed="true"] > div > *:nth-child(2)  { animation-delay: 60ms;  }
.rx-section[data-revealed="true"] > div > *:nth-child(3)  { animation-delay: 120ms; }
.rx-section[data-revealed="true"] > div > *:nth-child(4)  { animation-delay: 180ms; }
.rx-section[data-revealed="true"] > div > *:nth-child(5)  { animation-delay: 240ms; }
.rx-section[data-revealed="true"] > div > *:nth-child(6)  { animation-delay: 300ms; }
.rx-section[data-revealed="true"] > div > *:nth-child(7)  { animation-delay: 360ms; }
.rx-section[data-revealed="true"] > div > *:nth-child(8)  { animation-delay: 420ms; }

/* ============================================================
   CH3 · Scene-break pulse on entering section's artwork
   ============================================================
   When useScrollProgress + section-ref bookkeeping detects that
   a new section has entered the viewport (one-shot, top-edge
   crossing), the section gets data-just-entered="true" for
   ~700ms. The cyan pulse paints across the SectionArtwork in
   the top-right corner — soft outer glow that rises and falls
   in a single 600ms cycle. Cleaned up by the App.jsx effect. */
@keyframes rxScenePulse {
  0%   { box-shadow: 0 0 0 0   color-mix(in srgb, var(--neon-cyan, var(--ox)) 0%,  transparent); opacity: 1.0; }
  35%  { box-shadow: 0 0 32px 4px color-mix(in srgb, var(--neon-cyan, var(--ox)) 55%, transparent); opacity: 1.0; }
  100% { box-shadow: 0 0 0 0   color-mix(in srgb, var(--neon-cyan, var(--ox)) 0%,  transparent); opacity: 1.0; }
}
.rx-section[data-just-entered="true"] [data-section-artwork] {
  animation: rxScenePulse 600ms cubic-bezier(0.16, 1, 0.3, 1) 1;
  border-radius: 16px;
}

/* ============================================================
   CH4 · Idle-state ambient glow
   ============================================================
   The root html element gains data-user-idle="true" via an 8s
   debounced mousemove listener in App.jsx. Mesh-wash + hero
   blobs (both data-mesh-blob and data-mesh-wash-blob)
   intensify their opacity + saturation slightly so the bedside
   surface gains a quiet breath when nobody is touching it.
   Returns to the default state instantly on next mousemove. */
[data-user-idle="true"] [data-mesh-blob],
[data-user-idle="true"] [data-mesh-wash-blob] {
  /* Bug fix · mesh-blob elements carry an inline filter blur(48px) set
     by MeshWash.jsx, which wins over a non-!important stylesheet rule,
     so the saturate(1.08) portion never landed. The idle ambient glow
     needs !important on filter to override the inline style. */
  opacity: 1.0;
  filter: saturate(1.08) blur(48px) !important;
  transition: opacity 1.5s ease-out, filter 1.5s ease-out;
}

/* ============================================================
   CH5 · Active-tier co-spotlight
   ============================================================
   Tier cards in RegimenOptions carry data-tier-id="N"; metadata
   sidebar items mirror with data-tier-target="N". When the
   user hovers / focuses a tier card, matching sidebar items
   brighten + grow a 2px cyan left-edge marker. Uses :has() so
   the relationship works across non-sibling DOM; browsers
   without :has support silently skip (progressive enhancement
   only — never a functional change). */
@supports selector(:has(*)) {
  body:has(.rx-card-interactive[data-tier-id]:hover) [data-tier-target],
  body:has(.rx-card-interactive[data-tier-id]:focus-visible) [data-tier-target] {
    opacity: 0.55;
    transition: opacity .18s var(--ease-out, ease), box-shadow .18s var(--ease-out, ease), color .18s var(--ease-out, ease);
  }
  body:has(.rx-card-interactive[data-tier-id="1"]:hover) [data-tier-target="1"],
  body:has(.rx-card-interactive[data-tier-id="1"]:focus-visible) [data-tier-target="1"],
  body:has(.rx-card-interactive[data-tier-id="2"]:hover) [data-tier-target="2"],
  body:has(.rx-card-interactive[data-tier-id="2"]:focus-visible) [data-tier-target="2"],
  body:has(.rx-card-interactive[data-tier-id="3"]:hover) [data-tier-target="3"],
  body:has(.rx-card-interactive[data-tier-id="3"]:focus-visible) [data-tier-target="3"],
  body:has(.rx-card-interactive[data-tier-id="4"]:hover) [data-tier-target="4"],
  body:has(.rx-card-interactive[data-tier-id="4"]:focus-visible) [data-tier-target="4"] {
    opacity: 1;
    color: var(--ink, currentColor);
    box-shadow: -2px 0 0 var(--neon-cyan, var(--ox));
  }
}

/* ============================================================
   CH6 · Section-arrival drift
   ============================================================
   When the user clicks a spine chip / MiniTOC entry / global
   TOC link, the destination Section gets data-just-arrived="true"
   for 1200ms. The MeshWash blobs inside that section drift
   along an exaggerated path before settling — a 1.2s "the
   surface noticed you arrived" flourish. Cleaned up by the
   App.jsx click handler. */
@keyframes rxArrivalDrift {
  0%   { transform: translate3d(0, 0, 0);    }
  35%  { transform: translate3d(3%, -2%, 0); }
  65%  { transform: translate3d(-2%, 1%, 0); }
  100% { transform: translate3d(0, 0, 0);    }
}
.rx-section[data-just-arrived="true"] [data-mesh-wash-blob],
.rx-section[data-just-arrived="true"] [data-mesh-blob] {
  animation: rxArrivalDrift 1200ms cubic-bezier(0.16, 1, 0.3, 1) 1 !important;
}

/* ============================================================
   CH7 · Cursor-trail glow on chrome CTAs
   ============================================================
   When the cursor enters the orbit (~80px) of a .rx-chrome-cta,
   App.jsx writes --trail-x / --trail-y / --trail-alpha onto the
   button. This rule paints a soft cyan radial gradient at that
   point on the button's ::before layer — riding the existing
   chrome-CTA chrome rather than introducing a new node. The
   opacity comes from --trail-alpha (0..1, distance-attenuated). */
.rx-chrome-cta[data-trail-active="true"]::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: radial-gradient(
    circle 60px at var(--trail-x, 50%) var(--trail-y, 50%),
    color-mix(in srgb, var(--neon-cyan, var(--ox)) 55%, transparent) 0%,
    transparent 70%
  );
  opacity: var(--trail-alpha, 0);
  transition: opacity 160ms var(--ease-out, ease);
  z-index: 1;
  mix-blend-mode: screen;
}

/* ============================================================
   Reduced-motion + coarse-pointer guards
   ============================================================
   The single source of truth for which choreography moves are
   inert. We zero animations / transitions and clear the
   ::before trail layer entirely. JS-side listeners short-
   circuit on the same media queries, so attributes never get
   written in the first place on those configurations — these
   declarations are belt-and-braces. */
@media (prefers-reduced-motion: reduce) {
  [data-focus-dim="sibling"] {
    transition: none !important;
    opacity: 1 !important;
    filter: none !important;
  }
  .rx-section[data-revealed="true"] > div > .rx-card,
  .rx-section[data-revealed="true"] > div > .rx-acc,
  .rx-section[data-revealed="true"] > div > .rx-tnode,
  .rx-section[data-revealed="true"] > div > .rx-step,
  .rx-section[data-revealed="true"] [data-w12-reveal-child] {
    animation: none !important;
  }
  .rx-section[data-just-entered="true"] [data-section-artwork] {
    animation: none !important;
  }
  [data-user-idle="true"] [data-mesh-blob],
  [data-user-idle="true"] [data-mesh-wash-blob] {
    transition: none !important;
    opacity: inherit !important;
    filter: inherit !important;
  }
  .rx-section[data-just-arrived="true"] [data-mesh-wash-blob],
  .rx-section[data-just-arrived="true"] [data-mesh-blob] {
    animation: none !important;
  }
  .rx-chrome-cta[data-trail-active="true"]::before {
    opacity: 0 !important;
    transition: none !important;
  }
}

@media (pointer: coarse) {
  /* Cursor-driven moves are meaningless on touch — JS listeners
     short-circuit, and these rules ensure no stray attribute can
     paint the trail or dim siblings on a tap. */
  [data-focus-dim="sibling"] {
    opacity: 1 !important;
    filter: none !important;
  }
  .rx-chrome-cta[data-trail-active="true"]::before {
    opacity: 0 !important;
  }
}
`;

export { CHOREOGRAPHY };
export default CHOREOGRAPHY;
