/* kinetic-type · display typography + kinetic text effects module.
   Modern-minimalist body, maximal display moments. CSS-only — no JS deps.
   Mounted alongside CSS/CSS2/CSS3/CSS4/CSS5 from app-styles.js via App.jsx.
   Cyan accents fall back to var(--ox) when neon tokens are not yet defined. */

const KINETIC = `
/* === Display sizes (magazine-grade numeric mega-display) ============== */

/* 84px sans display, weight 700, tight negative tracking — hero "what is this page" numbers */
.rx-display-mega {
  font-family: var(--sans);
  font-size: 84px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.95;
  color: var(--ink);
}

/* 64px serif display — secondary hero / section opener */
.rx-display-xl {
  font-family: var(--serif);
  font-size: 64px;
  font-weight: 700;
  letter-spacing: -0.032em;
  line-height: 1.0;
  color: var(--ink);
}

/* 48px sans display — large section heading */
.rx-display-l {
  font-family: var(--sans);
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -0.024em;
  line-height: 1.04;
  color: var(--ink);
}

/* 36px serif display — sub-section heading */
.rx-display-m {
  font-family: var(--serif);
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--ink);
}

/* 72px monospace italic stat callout — "17 syndromes", "4-6 wk", "MIC > 2" */
.rx-numeric-mega {
  font-family: var(--mono);
  font-size: 72px;
  font-weight: 600;
  font-style: italic;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  line-height: 1.0;
  color: var(--ox);
}

/* === Section counters ================================================= */

/* "01 / 17" style mono uppercase counter — sits alongside section kicker */
.rx-counter {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.24em;
  color: var(--ink2);
  font-variant-numeric: tabular-nums;
}

/* Bigger 14px cyan-accented counter variant */
.rx-counter-strong {
  font-family: var(--mono);
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.24em;
  color: var(--ox);
  font-variant-numeric: tabular-nums;
}

/* === Animated weight shift (Stripe-style heading-on-hover) ============ */

/* Variable-font weight transition on hover; no-ops if wght axis unsupported */
.rx-weight-shift {
  font-variation-settings: "wght" 600;
  transition: font-variation-settings 0.4s ease-out;
  will-change: font-variation-settings;
}
.rx-weight-shift:hover {
  font-variation-settings: "wght" 800;
}

/* === Mixed-weight pairing (Apple-keynote "42 days") =================== */

/* Inline-flex baseline pairing: <span class="rx-mixed-pair"><span class="rx-pair-bold">42</span><span class="rx-pair-light">days</span></span> */
.rx-mixed-pair {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}
.rx-mixed-pair > .rx-pair-light {
  font-weight: 300;
  color: var(--ink2);
}
.rx-mixed-pair > .rx-pair-bold {
  font-weight: 800;
  color: var(--ink);
  letter-spacing: -0.012em;
}

/* === Kinetic stagger letter reveal (hero entrances) =================== */

/* Wrap each character/word in its own span; toggle .active on the parent to play */
.rx-letter-reveal > * {
  opacity: 0;
  transform: translateY(8px);
  display: inline-block;
}
.rx-letter-reveal.active > * {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.4s var(--ease-out, ease-out), transform 0.4s var(--ease-out, ease-out);
}
.rx-letter-reveal.active > *:nth-child(1)  { transition-delay: 20ms;  }
.rx-letter-reveal.active > *:nth-child(2)  { transition-delay: 40ms;  }
.rx-letter-reveal.active > *:nth-child(3)  { transition-delay: 60ms;  }
.rx-letter-reveal.active > *:nth-child(4)  { transition-delay: 80ms;  }
.rx-letter-reveal.active > *:nth-child(5)  { transition-delay: 100ms; }
.rx-letter-reveal.active > *:nth-child(6)  { transition-delay: 120ms; }
.rx-letter-reveal.active > *:nth-child(7)  { transition-delay: 140ms; }
.rx-letter-reveal.active > *:nth-child(8)  { transition-delay: 160ms; }
.rx-letter-reveal.active > *:nth-child(9)  { transition-delay: 180ms; }
.rx-letter-reveal.active > *:nth-child(10) { transition-delay: 200ms; }
.rx-letter-reveal.active > *:nth-child(11) { transition-delay: 220ms; }
.rx-letter-reveal.active > *:nth-child(12) { transition-delay: 240ms; }
.rx-letter-reveal.active > *:nth-child(13) { transition-delay: 260ms; }
.rx-letter-reveal.active > *:nth-child(14) { transition-delay: 280ms; }
.rx-letter-reveal.active > *:nth-child(15) { transition-delay: 300ms; }
.rx-letter-reveal.active > *:nth-child(16) { transition-delay: 320ms; }

/* === Underline accent (cyan growth on hover, link-style) ============== */

/* Animated 2px cyan underline that grows from 0 → 100% on hover */
.rx-underline-accent {
  background-image: linear-gradient(var(--neon-cyan, var(--ox)), var(--neon-cyan, var(--ox)));
  background-repeat: no-repeat;
  background-position: 0 88%;
  background-size: 0% 2px;
  transition: background-size 0.35s var(--ease-out, ease-out);
}
.rx-underline-accent:hover {
  background-size: 100% 2px;
}

/* === Oversized first-letter (magazine dropcap variant 2) ============== */

/* Serif 4em dropcap with cyan→electric-blue gradient text-fill */
.rx-dropcap-cyan::first-letter {
  font-family: var(--serif);
  font-weight: 700;
  font-size: 4em;
  line-height: 0.82;
  float: left;
  padding-right: 10px;
  padding-top: 4px;
  background: linear-gradient(135deg, var(--neon-cyan, var(--ox)), var(--electric-blue, var(--ox)));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* === Reduced-motion guards ============================================ */

@media (prefers-reduced-motion: reduce) {
  .rx-weight-shift,
  .rx-weight-shift:hover {
    transition: none !important;
  }
  .rx-letter-reveal > *,
  .rx-letter-reveal.active > * {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  .rx-underline-accent {
    transition: none !important;
    background-size: 100% 2px !important;
  }
}
`;

export { KINETIC };
