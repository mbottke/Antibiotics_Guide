/* styles · app CSS strings injected by the root (.rx-root scope).
   Inpatient Antibiotic Guide — module graph documented in README.md. */
/* ============================================================================
   INPATIENT ANTIBACTERIAL REFERENCE & SELECTION ENGINE
   Adult, hospital-based. Generic names only. Antibacterials only — antifungals
   and antivirals are deliberately out of scope (separate references).
   Brand Kit B: Lora (display) · DM Sans (body) · IBM Plex Mono (numerals) ·
   oxblood accent. A bedside reasoning tool, never a substitute for the local
   antibiogram, current primary guidelines, clinical pharmacy, or ID consult.
   Clinical content verified against: IDSA AMR Guidance 2024 (ciae403),
   ATS/IDSA CAP 2019 & HAP/VAP 2016, IWGDF/IDSA DFI 2023, IDSA/SHEA CDI 2021,
   ESC/AHA endocarditis, ASHP/IDSA vancomycin 2020, BALANCE 2025, STOP-IT,
   OVIVA, and standard pharmacology references (NCBI/NLM).
   ========================================================================== */

const CSS = `
/* Design tokens (--paper, --ox, --sans, …) are provided globally on :root by
   src/styles/tokens.css, generated from tokens/tokens.json. Fonts are loaded via
   <link> in index.html. This block keeps only .rx-root's applied base styles. */
.rx-root{
  font-family:var(--sans); color:var(--ink); background:var(--paper);
  -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
  text-rendering:optimizeLegibility;
  line-height:1.55; min-height:100%;
}
.rx-root *,.rx-root *::before,.rx-root *::after{box-sizing:border-box;}
/* Mono — tabular numerals + opt-in stylistic alternates ("cv01" = alt
   one, "cv09" = alt zero on IBM Plex Mono). Browsers silently ignore
   any feature the active font doesn't ship, so this is graceful. */
.rx-mono{font-family:var(--mono); font-variant-numeric:tabular-nums; font-feature-settings:"tnum","cv01","cv09";}
.rx-serif{font-family:var(--serif);}
.rx-root :focus-visible{outline:2px solid var(--ox-bright); outline-offset:3px; border-radius:5px; box-shadow:0 0 0 5px color-mix(in srgb, var(--ox-bright) 22%, transparent), 0 0 18px -2px var(--ox-bright);}
/* Selection wash — cyan-tinted to match the new accent family. */
.rx-root ::selection{background:var(--ox-soft); color:var(--ox-deep);}

/* Wave 7 W7-B · cinematic mount cascade.
   Every card-primitive surface (.rx-card, .rx-acc, .rx-tnode, .rx-qc) fades-
   in-up on first paint with a staggered :nth-child delay, so the canvas
   materializes in beats rather than flashing flat. Reduced-motion gated. */
@keyframes rxFadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes rxGlowPulse { 0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--ox-bright) 28%, transparent); } 50% { box-shadow: 0 0 0 8px color-mix(in srgb, var(--ox-bright) 0%, transparent); } }
@keyframes rxShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
.rx-root .rx-card,
.rx-root .rx-acc,
.rx-root .rx-tnode,
.rx-root .rx-qc { animation: rxFadeInUp var(--duration-base, 180ms) var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1)) both; }
.rx-root .rx-card:nth-child(2),
.rx-root .rx-acc:nth-child(2),
.rx-root .rx-tnode:nth-child(2)  { animation-delay: 40ms; }
.rx-root .rx-card:nth-child(3),
.rx-root .rx-acc:nth-child(3),
.rx-root .rx-tnode:nth-child(3)  { animation-delay: 80ms; }
.rx-root .rx-card:nth-child(4),
.rx-root .rx-acc:nth-child(4),
.rx-root .rx-tnode:nth-child(4)  { animation-delay: 120ms; }
.rx-root .rx-card:nth-child(5),
.rx-root .rx-acc:nth-child(5)    { animation-delay: 160ms; }
.rx-root .rx-card:nth-child(6),
.rx-root .rx-acc:nth-child(6)    { animation-delay: 200ms; }

/* Wave 9 W9 · molten-chrome ambient backdrop on the bedside surface.
   The earlier dot-grid backdrop (radial-gradient dots @ 4% ink, 28px
   grid) is replaced by a <MeshWash variant="ambient"> mounted inside
   BedsideShell so the bedside reference reads as the same molten cyan
   field the GradientMeshHero introduced. The dots remain layered at
   1% opacity for fine-grain texture — the mesh provides the chroma,
   the dots provide the "intentional grid system" affordance. */
.rx-root .rx-bedside-container {
  position: relative;
  background-image: radial-gradient(circle at center, color-mix(in srgb, var(--ink) 2%, transparent) 0.7px, transparent 1.1px);
  background-size: 28px 28px;
  background-position: 0 0;
}

/* Wave 9 W9 · `.rx-mesh-wash-soft` utility — a low-opacity scrim wrap
   for any consumer that wants the molten-chrome wash WITHOUT having
   to mount the React component. Pairs with the MeshWash JSX primitive
   for cases where the surface is non-React (e.g. a bare HTML island in
   the docs site or a static skeleton). The class only handles the
   wrapper positioning + soft alpha; the blobs themselves still need to
   be drawn by JS or by adding child gradient layers. */
.rx-mesh-wash-soft {
  position: relative;
  isolation: isolate;
}
.rx-mesh-wash-soft > [data-mesh-wash] {
  opacity: 0.6;
}

/* Wave 7 W7-B · diagonal gradient hairline. Between any two adjacent
   .rx-section / .rx-card siblings we drop a 1px transparent → cyan →
   transparent gradient at low alpha, replacing default 1px solid lines
   with a more deliberate divider. Available as .rx-gh-divider for opt-in. */
.rx-gh-divider { height: 1px; background: linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--ox-bright) 28%, transparent) 50%, transparent 100%); border: 0; margin: 22px 0; }
.rx-gh-divider-strong { height: 2px; background: linear-gradient(90deg, transparent 0%, var(--ox-bright) 50%, transparent 100%); border: 0; margin: 28px 0; opacity: .8; }

/* ─────────────────────────────── Wave 6 W6-B · motion + reveal ────────────────
   Two keyframes, three reveal classes, two interaction utilities. Building
   blocks for the "Apple-level" feel without an animation library. Every
   duration + easing flows through CSS variables so the OS-level reduced-motion
   rule below collapses them simultaneously.

   USAGE
     <div className="rx-reveal">      ← fade + rise on mount (~320ms)
     <div className="rx-reveal-fast"> ← faster (~180ms) for inner content
     <div className="rx-fade">        ← pure fade-in for chip elevations
     <div className="rx-lift">        ← elevates on hover/focus
     <button className="rx-cta-glow"> ← oxblood glow on focus
   Apply selectively — these are accents, not blanket styles. */
@keyframes rx-fade-rise{
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rx-fade-in{
  from { opacity: 0; }
  to   { opacity: 1; }
}
.rx-reveal      { animation: rx-fade-rise var(--duration-slow) var(--ease-out) both; }
.rx-reveal-fast { animation: rx-fade-rise var(--duration-base) var(--ease-out) both; }
.rx-fade        { animation: rx-fade-in var(--duration-base) var(--ease-out) both; }
.rx-lift        { transition: transform var(--duration-base) var(--ease-out), box-shadow var(--duration-base) var(--ease-out), border-color var(--duration-base) var(--ease-out), color var(--duration-base) var(--ease-out); }
.rx-lift:hover  { transform: translateY(-2px); box-shadow: var(--shadow-e2), 0 0 0 1px color-mix(in srgb, var(--ox-bright) 24%, transparent); border-color: color-mix(in srgb, var(--line) 40%, var(--ox-bright) 60%); color: var(--ox-bright); }
.rx-lift:focus-visible { transform: translateY(-2px); box-shadow: var(--shadow-e3), 0 0 0 2px color-mix(in srgb, var(--ox-bright) 30%, transparent); }
.rx-cta-glow:focus-visible { box-shadow: var(--shadow-glow-ox); }

@media (prefers-reduced-motion: reduce){
  .rx-root *,.rx-root *::before,.rx-root *::after{transition-duration:.01ms!important; animation-duration:.01ms!important; scroll-behavior:auto!important;}
  /* Wave 6 W6-B · global motion reduction across portal-mounted modals + drawers
     (SettingsModal, KeyboardShortcutsOverlay, OnboardingModal, MechanismDrawer,
     DecisionAttributionDrawer all render into document.body — outside .rx-root).
     Honors the OS-level a11y preference end-to-end. */
  [role="dialog"] *,[role="dialog"] *::before,[role="dialog"] *::after,
  [aria-modal="true"] *,[aria-modal="true"] *::before,[aria-modal="true"] *::after{
    transition-duration:.01ms!important; animation-duration:.01ms!important;
  }
  /* Reveal classes — collapse to no-op so the content appears immediately. */
  .rx-reveal,.rx-reveal-fast,.rx-fade{ animation: none!important; }
  .rx-lift:hover,.rx-lift:focus-visible{ transform: none!important; }
}
.rx-wrap{max-width:1180px; margin:0 auto; padding:0 22px;}

/* ----------------------------- HEADER + NAV ----------------------------- */
.rx-header{position:sticky; top:0; z-index:50; background:rgba(251,250,248,.94);
  backdrop-filter:saturate(140%) blur(9px); -webkit-backdrop-filter:saturate(140%) blur(9px); border-bottom:1px solid var(--line);}
.rx-headrow{display:flex; align-items:center; gap:14px; padding:12px 0 10px;}
/* Wave 7 W7-B · the brand block becomes a gradient compass.
   Diagonal cyan-deep → cyan-bright gradient + cyan halo + a tiny
   inner highlight to read as a backlit chip. */
.rx-mark{width:40px;height:40px;border-radius:12px 3px 12px 3px;background:linear-gradient(135deg, var(--ox-deep) 0%, var(--ox) 50%, var(--ox-bright) 240%);color:#fff;display:flex;align-items:center;justify-content:center;flex:0 0 auto;box-shadow:0 1px 0 rgba(255,255,255,.08) inset, 0 0 0 1px var(--ox-deep), 0 0 28px -8px var(--ox-bright);position:relative;overflow:hidden;}
.rx-mark::after{content:""; position:absolute; inset:0; background:radial-gradient(circle at 75% 110%, color-mix(in srgb, var(--ox-bright) 55%, transparent) 0%, transparent 55%); pointer-events:none;}
.rx-brand{min-width:0; flex:1;}
.rx-kicker{font-family:var(--mono); font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:var(--ox); font-weight:600;}
.rx-title{font-family:var(--serif); font-weight:600; font-size:20px; letter-spacing:-.01em; margin:0; line-height:1.08;}
.rx-sub{color:var(--muted); font-size:11.5px; margin:1px 0 0;}
.rx-searchwrap{position:relative; display:flex; align-items:center; flex:0 0 auto;}
.rx-search{font-family:var(--sans); font-size:13.5px; border:1px solid var(--line); background:var(--panel);
  border-radius:999px; padding:8px 32px 8px 34px; width:210px; color:var(--ink); transition:border-color .15s, width .2s, box-shadow .15s;}
.rx-search:focus{border-color:var(--ox-bright); width:264px; outline:none; box-shadow:0 0 0 4px color-mix(in srgb, var(--ox-bright) 22%, transparent), 0 0 18px -4px var(--ox-bright);}
.rx-search::placeholder{color:var(--faint);}
.rx-search-i{position:absolute; left:11px; color:var(--muted); pointer-events:none; display:flex;}
.rx-search-x{position:absolute; right:8px; background:none; border:none; cursor:pointer; color:var(--muted); padding:3px; display:flex;}
.rx-nav{display:flex; gap:2px; overflow-x:auto; scrollbar-width:none; padding-bottom:1px;}
.rx-nav::-webkit-scrollbar{display:none;}
.rx-tab{flex:0 0 auto; display:flex; align-items:center; gap:7px; border:none; background:none; cursor:pointer;
  font-family:var(--sans); font-size:12.5px; font-weight:500; color:var(--muted); padding:9px 13px 11px;
  border-bottom:2px solid transparent; white-space:nowrap; transition:color .15s;}
.rx-tab:hover{color:var(--ink);}
.rx-tab[aria-current="true"]{color:var(--ox); border-bottom-color:var(--ox); font-weight:600;}
.rx-tab svg{width:15px; height:15px; flex:0 0 auto;}
.rx-tab .rx-tabn{font-family:var(--mono); font-size:9.5px; opacity:.5; margin-right:1px;}

/* command palette */
.rx-cmd-overlay{position:fixed; inset:0; z-index:100; background:rgba(27,25,22,.34); backdrop-filter:blur(2px); display:flex; align-items:flex-start; justify-content:center; padding-top:11vh;}
.rx-cmd{width:min(620px,92vw); background:var(--panel); border:1px solid var(--line); border-radius:14px; box-shadow:0 24px 60px -12px rgba(27,25,22,.35); overflow:hidden;}
.rx-cmd-head{display:flex; align-items:center; gap:10px; padding:14px 16px; border-bottom:1px solid var(--line2);}
.rx-cmd-head input{flex:1; border:none; outline:none; font-family:var(--sans); font-size:16px; color:var(--ink); background:none;}
.rx-cmd-head input::placeholder{color:var(--faint);}
.rx-cmd-esc{font-family:var(--mono); font-size:10px; color:var(--muted); border:1px solid var(--line); border-radius:5px; padding:2px 6px;}
.rx-cmd-list{max-height:54vh; overflow-y:auto; padding:6px;}
.rx-cmd-item{display:flex; align-items:center; gap:11px; padding:9px 11px; border-radius:8px; cursor:pointer; border:none; background:none; width:100%; text-align:left;}
.rx-cmd-item:hover,.rx-cmd-item[data-active="true"]{background:var(--ox-soft);}
.rx-cmd-ic{width:28px; height:28px; border-radius:7px; background:var(--line2); color:var(--ox); display:flex; align-items:center; justify-content:center; flex:0 0 auto;}
.rx-cmd-item[data-active="true"] .rx-cmd-ic{background:var(--panel);}
.rx-cmd-tx{flex:1; min-width:0;}
.rx-cmd-tx .nm{font-size:13.5px; font-weight:600; line-height:1.2;}
.rx-cmd-tx .ct{font-size:11px; color:var(--muted); font-family:var(--mono); letter-spacing:.04em; text-transform:uppercase;}
.rx-cmd-empty{padding:28px; text-align:center; color:var(--muted); font-size:13px;}

/* ----------------------------- LAYOUT ----------------------------- */
.rx-main{padding:26px 0 80px;}
/* ─────────────────────────── Editorial type ramp ────────────────────────────
   Wave 6 W6-B aesthetic · magazine / Apple-keynote rhythm + breath.

   The serif display ramp leans on Lora's drawing — slightly tighter
   tracking at larger sizes, slightly tighter line-height so headings
   sit as a single optical block before the body text begins.

   USAGE
     .rx-display          — rare full-page or hero showstopper (56px serif)
     .rx-h1               — page-level title (42px serif)
     .rx-h2               — section-level heading (28px serif)
     .rx-h3               — sub-section, inline-flex icon slot (20px serif)
     .rx-h4               — small sans heading, inline-flex icon (13.5px sans)
     .rx-lede             — long-form intro paragraph (16px, max 78ch)
     .rx-byline           — italic serif standfirst / standalone caption
     .rx-eyebrow          — mono uppercase kicker label (10.5px)
     .rx-overline         — quieter eyebrow for nested sections (9.5px)
     .rx-numeric-display  — italic serif tabular numerals for durations / MICs
     .rx-num / .rx-dose / .rx-mic — inline numeric data rows (kept)
     .rx-dropcap          — opt-in magazine-grade first-letter (.rx-dropcap)
   These classes are additive — existing call sites continue to work. */
/* Wave 7 W7-B · cinematic ramp. h1 70px / h2 44px / h3 28px responsive.
   Every section heading lands with editorial weight. The tracking ramps
   tighter as size grows — classic display-type discipline. */
.rx-display{font-family:var(--serif); font-size:clamp(48px, 6.5vw, 72px); font-weight:600; letter-spacing:-.032em; line-height:0.98; color:var(--ink); margin:0 0 16px;}
.rx-h1{font-family:var(--serif); font-size:clamp(40px, 5vw, 56px); font-weight:600; letter-spacing:-.028em; line-height:1.04; color:var(--ink); margin:0 0 14px;}
.rx-h2{font-family:var(--serif); font-size:clamp(30px, 3.8vw, 44px); font-weight:600; letter-spacing:-.024em; line-height:1.06; color:var(--ink); margin:0 0 10px;}
.rx-h3{font-family:var(--serif); font-size:clamp(22px, 2.3vw, 28px); font-weight:600; letter-spacing:-.018em; line-height:1.2; color:var(--ink); margin:40px 0 16px; display:flex; align-items:center; gap:14px;}
.rx-h3::before{content:""; display:inline-block; width:32px; height:2px; background:linear-gradient(90deg, var(--ox-bright) 0%, transparent 100%); flex:0 0 auto;}
.rx-h3 .ic{color:var(--ox-bright); display:flex;}
.rx-h4{font-family:var(--sans); font-size:14px; font-weight:700; letter-spacing:.005em; line-height:1.35; margin:20px 0 10px; display:flex; align-items:center; gap:8px;}
.rx-h4 .ic{color:var(--ox-bright); display:flex;}
.rx-lede{color:var(--ink2); font-family:var(--serif); font-style:italic; font-weight:400; font-size:19px; margin:0 0 28px; max-width:62ch; line-height:1.5;}
.rx-byline{font-family:var(--serif); font-style:italic; font-weight:400; font-size:16px; color:var(--ink2); line-height:1.5; max-width:62ch; margin:0;}
.rx-eyebrow{font-family:var(--mono); font-size:10.5px; font-weight:700; letter-spacing:.22em; text-transform:uppercase; color:var(--ox); margin:0 0 8px; display:inline-flex; align-items:center; gap:6px;}
.rx-overline{font-family:var(--mono); font-size:9.5px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); margin:0 0 6px;}
.rx-numeric-display{font-family:var(--serif); font-style:italic; font-variant-numeric:tabular-nums; font-feature-settings:"tnum"; font-size:18px; font-weight:500; letter-spacing:-.01em; color:var(--ink);}
/* Numeric data — dose strings, mg/kg, ml/min, MIC values, half-life
   columns. Tabular figures lock the column position so eyes scan
   vertical numeric stacks without micro-saccades. */
.rx-num,.rx-dose,.rx-mic,[data-tabular="true"]{font-variant-numeric:tabular-nums; font-feature-settings:"tnum"; letter-spacing:-.002em;}
/* Optional first-letter dropcap — opt-in only. Apply to a paragraph
   when a single feature lead deserves a magazine-grade entrance. */
.rx-dropcap::first-letter{font-family:var(--serif); font-weight:600; font-style:italic; font-size:3.6em; line-height:0.82; float:left; padding-right:10px; padding-top:8px; color:var(--ox-bright); background:linear-gradient(180deg, var(--ox-bright) 0%, var(--ox) 100%); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;}
.rx-disc{display:flex; gap:12px; align-items:flex-start; background:linear-gradient(135deg, var(--ox-softer) 0%, var(--ox-soft) 100%); border:1px solid var(--ox-line); border-left:3px solid var(--ox-bright);
  border-radius:14px 4px 14px 4px; padding:14px 16px; margin:0 0 24px; font-size:12.5px; color:var(--ox-deep); line-height:1.55; box-shadow:var(--shadow-e1);}
.rx-disc svg{flex:0 0 auto; margin-top:1px;}
/* Wave 6 W6-B · card elevation polish.
   .rx-card was a flat surface (1px border, no shadow). Adds a barely-
   perceptible resting elevation (shadow-e1) and an interactive class
   that lifts on hover/focus. The lift uses 1px translate to feel
   tactile without being noisy. */
/* Wave 7 W7-B · asymmetric-radii cards everywhere. The 16/4 corner pattern
   is the single shape change that ripples across every screen — every
   regimen option, decision branch, monitoring block, table wrapper picks
   it up automatically. Hover lifts + cyan border-color transition + cyan
   inset hairline reads as "alive under the cursor". */
.rx-card{position:relative; background:var(--panel); border:1px solid var(--line); border-radius:18px 4px 18px 4px; padding:22px; box-shadow:var(--shadow-e1); transition:box-shadow var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out), border-color var(--duration-base) var(--ease-out);}
.rx-card::before{content:""; position:absolute; top:0; left:0; width:42px; height:2px; background:linear-gradient(90deg, var(--ox-bright) 0%, transparent 100%); border-radius:18px 0 0 0; opacity:0.6; pointer-events:none; transition:opacity var(--duration-base) var(--ease-out), width var(--duration-base) var(--ease-out);}
.rx-card.rx-card-interactive{cursor:pointer;}
.rx-card.rx-card-interactive:hover{box-shadow:var(--shadow-e2), 0 0 0 1px color-mix(in srgb, var(--ox-bright) 28%, transparent); transform:translateY(-3px); border-color:color-mix(in srgb, var(--line) 40%, var(--ox-bright) 60%);}
.rx-card.rx-card-interactive:hover::before{opacity:1; width:72px;}
.rx-card.rx-card-interactive:focus-within{box-shadow:var(--shadow-e3), 0 0 0 2px color-mix(in srgb, var(--ox-bright) 30%, transparent);}
/* Wave 9 · auto-spotlight on every interactive card. The ::after pseudo
   reads --cursor-x / --cursor-y / --cursor-active that the global
   App.jsx delegated mousemove handler writes onto each .rx-card-interactive
   host as the pointer moves. Reduced-motion + coarse-pointer both kill
   the overlay below. */
.rx-card.rx-card-interactive::after{content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none; background:radial-gradient(220px circle at var(--cursor-x, 50%) var(--cursor-y, 50%), color-mix(in srgb, var(--ox-bright) 14%, transparent) 0%, transparent 60%); opacity:var(--cursor-active, 0); transition:opacity var(--duration-base) var(--ease-out); z-index:0;}
.rx-card.rx-card-interactive > *{position:relative; z-index:1;}
@media (prefers-reduced-motion: reduce){
  .rx-card.rx-card-interactive::after{opacity:0 !important; transition:none !important;}
}
@media (pointer: coarse){
  .rx-card.rx-card-interactive::after{display:none;}
}
.rx-callout{background:linear-gradient(135deg, var(--blue-soft) 0%, color-mix(in srgb, var(--blue-soft) 70%, var(--paper) 30%) 100%); border:1px solid var(--blue-line); border-left:3px solid var(--blue); border-radius:14px 4px 14px 4px; padding:14px 16px; font-size:12.5px; color:var(--blue); display:flex; gap:12px; align-items:flex-start; line-height:1.55; margin:18px 0; box-shadow:var(--shadow-e1);}
.rx-callout svg{flex:0 0 auto; margin-top:1px;}

/* Wave 9 W9 · diagonal hairline divider — a 1px line at 4deg, sitting
   between sibling panels in place of (some) horizontal dividers. The
   diagonal is intentionally subtle: enough to read as "designed",
   never enough to misalign the panels above/below. Gradient runs
   transparent → cyan → transparent so the line dissolves at the
   edges and never hits a hard pixel against the page background. */
.rx-diag-divider{position:relative; height:18px; margin:18px 0; pointer-events:none;}
.rx-diag-divider::before{content:""; position:absolute; left:6%; right:6%; top:50%; height:1px; background:linear-gradient(90deg, transparent, var(--neon-cyan, var(--ox)), transparent); opacity:0.55; transform:rotate(-4deg); transform-origin:center;}
.rx-diag-divider::after{content:""; position:absolute; left:50%; top:50%; width:6px; height:6px; border-radius:50%; background:var(--neon-cyan, var(--ox)); transform:translate(-50%, -50%); box-shadow:0 0 8px var(--neon-cyan, var(--ox)); opacity:0.7;}
@media (prefers-reduced-motion: reduce){ .rx-diag-divider::before{opacity:0.4;} }

/* ----------------------------- TAGS + CHIPS ----------------------------- */
/* Wave 6 W6-B · chip polish. Pill chips get a hairline shadow at rest
   (so the eye sees them as "tactile" rather than painted-on), and a
   smooth ease-out for the hover-brightness shift. Active state lifts
   to shadow-e1 for a sense of being grasped. */
/* Wave 7 W7-B · tags adopt the same asymmetric shape system at chip-scale. */
.rx-tag{display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:600; padding:4px 10px; border-radius:8px 2px 8px 2px; line-height:1.3; letter-spacing:.01em; white-space:nowrap; box-shadow:var(--shadow-e0); transition:filter var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out);}
.rx-tag.clk{cursor:pointer;}
.rx-tag.clk:hover{filter:brightness(1.05); box-shadow:var(--shadow-e1), 0 0 0 1px color-mix(in srgb, var(--ox-bright) 22%, transparent); transform:translateY(-1px);}
.rx-tag.clk:active{transform:translateY(0.5px);}
.rx-tag.clk:focus-visible{box-shadow:var(--shadow-glow-ox);}
.t-ox{background:var(--ox-soft); color:var(--ox); border:1px solid var(--ox-line);}
.t-amber{background:var(--amber-soft); color:var(--amber); border:1px solid var(--amber-line);}
.t-green{background:var(--green-soft); color:var(--green); border:1px solid var(--green-line);}
.t-blue{background:var(--blue-soft); color:var(--blue); border:1px solid var(--blue-line);}
.t-neutral{background:var(--line2); color:var(--ink2); border:1px solid var(--line);}
.t-ghost{background:transparent; color:var(--muted); border:1px dashed var(--line);}

/* evidence-strength chips */
.rx-ev{display:inline-flex; align-items:center; gap:4px; font-family:var(--mono); font-size:9.5px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; padding:2px 7px; border-radius:5px; white-space:nowrap;}
.ev-rct{background:var(--green-soft); color:var(--green); border:1px solid var(--green-line);}
.ev-guide{background:var(--blue-soft); color:var(--blue); border:1px solid var(--blue-line);}
.ev-obs{background:var(--amber-soft); color:var(--amber); border:1px solid var(--amber-line);}
.rx-ev .dot{width:5px; height:5px; border-radius:50%; background:currentColor;}

/* preference markers */
.rx-pref{display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; padding:2px 7px; border-radius:5px;}
.pref-1{background:var(--ox); color:#fff;}
.pref-2{background:var(--amber-soft); color:var(--amber); border:1px solid var(--amber-line);}
.pref-3{background:var(--line2); color:var(--muted); border:1px solid var(--line);}
.pref-avoid{background:#fff; color:var(--ox-deep); border:1px solid var(--ox-line); text-decoration:line-through; text-decoration-thickness:1px;}
`;

const CSS2 = `
/* ----------------------------- QUICK CARDS ----------------------------- */
.rx-quick{display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin:0 0 26px;}
@media (max-width:780px){.rx-quick{grid-template-columns:1fr;}}
.rx-qc{background:var(--panel); border:1px solid var(--line); border-top:3px solid var(--ox); border-radius:14px 4px 14px 4px; padding:15px 17px;}
.rx-qc .k{font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--ox); font-weight:700; display:flex; align-items:center; gap:7px;}
.rx-qc .k svg{color:var(--ox);}
.rx-qc .b{font-size:13px; margin-top:8px; line-height:1.5; color:var(--ink2);}
.rx-qc .b b{color:var(--ink); font-weight:600;}

/* ----------------------------- STEP SPINE ----------------------------- */
.rx-spine{position:relative; margin-left:6px; padding-left:34px;}
.rx-spine::before{content:""; position:absolute; left:14px; top:12px; bottom:12px; width:2px; background:linear-gradient(180deg, var(--ox-bright) 0%, var(--ox-line) 40%, var(--line) 100%);}
.rx-step{position:relative; margin:0 0 19px;}
.rx-stepnum{position:absolute; left:-36px; top:-2px; width:32px; height:32px; border-radius:10px 3px 10px 3px; background:linear-gradient(135deg, var(--ox-deep) 0%, var(--ox) 60%, var(--ox-bright) 220%);
  color:#fff; font-family:var(--mono); font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 0 4px var(--paper), 0 4px 14px -4px var(--ox-bright);}
.rx-steph{font-weight:600; font-size:15px; margin:3px 0 3px;}
.rx-stepb{font-size:13.5px; color:var(--ink2); margin:0; line-height:1.55;}
.rx-stepb code{font-family:var(--mono); font-size:12px; background:var(--line2); padding:1px 5px; border-radius:4px; color:var(--ox);}

/* trigger grid */
.rx-trig{display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:6px;}
@media (max-width:720px){.rx-trig{grid-template-columns:1fr;}}
.rx-trigcard h4{margin:0 0 9px; font-size:13.5px; font-weight:700; display:flex; align-items:center; gap:7px;}
.rx-trigcard h4 .ic{color:var(--ox); display:flex;}
.rx-trigcard ul{margin:0; padding-left:18px; font-size:13px; color:var(--ink2); line-height:1.5;}
.rx-trigcard li{margin:0 0 5px;}
.rx-trigcard li b{color:var(--ink); font-weight:600;}

/* ----------------------------- DECISION TREE ----------------------------- */
.rx-tree{margin:14px 0 8px;}
.rx-tnode{border:1px solid var(--line); border-radius:14px 4px 14px 4px; background:var(--panel); overflow:hidden; margin:0 0 4px;}
.rx-tq{padding:15px 18px; background:linear-gradient(135deg, var(--ox-softer) 0%, var(--ox-soft) 100%); border-bottom:1px solid var(--ox-line); display:flex; align-items:center; gap:12px;}
.rx-tq .dot{width:28px;height:28px;border-radius:9px 3px 9px 3px;background:linear-gradient(135deg, var(--ox-deep) 0%, var(--ox-bright) 220%);color:#fff;font-family:var(--mono);font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;flex:0 0 auto; box-shadow:0 2px 8px -2px var(--ox-bright);}
.rx-tq .q{font-weight:600; font-size:14px; color:var(--ink);}
.rx-tbranches{display:grid; grid-template-columns:1fr 1fr; }
@media (max-width:680px){.rx-tbranches{grid-template-columns:1fr;}}
.rx-tbranch{padding:12px 16px; border-right:1px solid var(--line2); border-top:1px solid var(--line2);}
.rx-tbranch:last-child{border-right:none;}
.rx-tcond{display:inline-flex; align-items:center; gap:6px; font-family:var(--mono); font-size:10px; letter-spacing:.06em; text-transform:uppercase; font-weight:600; color:var(--ox); margin-bottom:6px;}
.rx-trx{font-size:13.5px; font-weight:600; color:var(--ink); line-height:1.4;}
.rx-twhy{font-size:12px; color:var(--muted); margin-top:4px; line-height:1.5;}
.rx-tflow{display:flex; align-items:stretch; gap:0; flex-wrap:nowrap; overflow-x:auto; padding:4px 0 10px; scrollbar-width:thin;}
.rx-tflow-step{flex:0 0 auto; display:flex; align-items:center; gap:0;}
.rx-tflow-box{background:var(--panel); border:1px solid var(--line); border-radius:9px; padding:10px 13px; min-width:150px; max-width:210px;}
.rx-tflow-box.start{background:var(--ox-soft); color:var(--ink); border-color:var(--ox); border-left-width:3px;}
.rx-tflow-box.start .rx-tflow-lab{color:var(--ox); opacity:1;}
.rx-tflow-box.end{background:var(--ox-soft); border-color:var(--ox-line);}
.rx-tflow-lab{font-family:var(--mono); font-size:9px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); margin-bottom:3px;}
.rx-tflow-tx{font-size:12.5px; font-weight:600; line-height:1.3;}
.rx-tflow-arrow{flex:0 0 auto; color:var(--faint); padding:0 8px; display:flex; align-items:center;}

/* ----------------------------- SYNDROME ACCORDION ----------------------------- */
.rx-syscat{font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); font-weight:600; margin:24px 0 9px; display:flex; align-items:center; gap:9px;}
.rx-syscat::after{content:""; flex:1; height:1px; background:var(--line);}
.rx-syscat .ic{color:var(--ox); display:flex;}
.rx-acc{border:1px solid var(--line); border-radius:14px 4px 14px 4px; overflow:hidden; margin:0 0 8px; background:var(--panel);}
.rx-acc[data-open="true"]{border-color:var(--ox-line); box-shadow:0 1px 0 var(--ox-softer);}
.rx-accbtn{width:100%; display:flex; align-items:center; gap:13px; padding:13px 15px; background:none; border:none; cursor:pointer; text-align:left;}
.rx-accbtn:hover{background:var(--line3);}
.rx-accicon{flex:0 0 auto; width:34px; height:34px; border-radius:8px; background:var(--ox-soft); color:var(--ox); display:flex; align-items:center; justify-content:center;}
.rx-accmain{flex:1; min-width:0;}
.rx-accname{display:block; font-weight:600; font-size:14.5px; line-height:1.25;}
.rx-accline{display:block; font-size:12px; color:var(--muted); margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
.rx-accprev{display:block; font-size:12px; color:var(--ink2); margin-top:3px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; line-height:1.3;}
.rx-accprev .k{font-family:var(--mono); font-size:9px; letter-spacing:.06em; text-transform:uppercase; color:var(--ox); font-weight:600; background:var(--ox-softer); border-radius:4px; padding:1px 6px; margin-right:7px;}
.rx-accchev{flex:0 0 auto; color:var(--muted); transition:transform .2s;}
.rx-acc[data-open="true"] .rx-accchev{transform:rotate(90deg); color:var(--ox);}
.rx-accbody{padding:6px 16px 18px; border-top:1px solid var(--line2);}
.rx-tier{border-left:3px solid var(--ox); padding:1px 0 1px 13px; margin:13px 0;}
.rx-tier.sev{border-left-color:var(--ox-deep);}
.rx-tier.alt{border-left-color:var(--amber);}
.rx-tierlab{font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); font-weight:600; display:flex; align-items:center; gap:8px; flex-wrap:wrap;}
.rx-rx{font-size:14px; margin:4px 0 0; font-weight:500; line-height:1.45;}
.rx-rx b{font-weight:700;}
.rx-rxnote{font-size:12.5px; color:var(--muted); margin:3px 0 0; line-height:1.5;}
.rx-coverrow{display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:14px 0 2px;}
@media (max-width:560px){.rx-coverrow{grid-template-columns:1fr;}}
.rx-coverbox{background:var(--line3); border:1px solid var(--line2); border-radius:9px; padding:10px 12px;}
.rx-coverbox .h{font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ox); font-weight:600; margin-bottom:3px;}
.rx-coverbox .t{font-size:12.5px; color:var(--ink2); line-height:1.5;}
.rx-metarow{display:flex; flex-wrap:wrap; gap:6px 16px; margin:14px 0 2px; font-size:12.5px; align-items:baseline;}
.rx-metarow .lab{font-family:var(--mono); font-size:9.5px; letter-spacing:.11em; text-transform:uppercase; color:var(--muted); font-weight:600; margin-right:2px;}
.rx-bugs{display:flex; flex-wrap:wrap; gap:6px; margin:6px 0 0;}
.rx-pearls{margin:13px 0 0; padding:0; list-style:none; font-size:13px;}
.rx-pearls li{position:relative; padding-left:18px; margin:0 0 6px; color:var(--ink2); line-height:1.5;}
.rx-pearls li::before{content:""; position:absolute; left:3px; top:8px; width:5px; height:5px; border-radius:50%; background:var(--ox);}
.rx-pearls li b{color:var(--ink); font-weight:600;}
.rx-durpill{display:inline-flex; align-items:center; gap:6px; font-size:13px; color:var(--ink2);}
`;

const CSS3 = `
/* ----------------------------- SPECTRUM MATRIX ----------------------------- */
.rx-mxwrap{overflow-x:auto; border:1px solid var(--line); border-radius:12px; background:var(--panel); -webkit-overflow-scrolling:touch;}
.rx-mx{border-collapse:separate; border-spacing:0; font-size:12.5px; min-width:880px; width:100%;}
.rx-mx th,.rx-mx td{padding:0; text-align:center;}
.rx-mx thead th{position:sticky; top:0; background:var(--panel); z-index:2; vertical-align:bottom;}
.rx-mx .corner{text-align:left; vertical-align:bottom; position:sticky; left:0; z-index:3; background:var(--panel); border-right:1px solid var(--line);}
.rx-cornlab{font-family:var(--mono); font-size:9.5px; letter-spacing:.09em; text-transform:uppercase; color:var(--muted); padding:0 12px 10px; font-weight:600;}
.rx-grp-th{font-family:var(--mono); font-size:9px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); font-weight:600; padding:7px 4px 3px; border-bottom:1px solid var(--line2);}
.rx-colbtn{border:none; background:none; cursor:pointer; font-family:var(--sans); font-weight:600; font-size:11px; color:var(--ink2);
  padding:9px 3px; writing-mode:vertical-rl; transform:rotate(180deg); height:150px; line-height:1.12; white-space:nowrap; transition:color .15s; width:100%;}
.rx-colbtn:hover{color:var(--ox);}
.rx-col-active .rx-colbtn{color:var(--ox);}
.rx-col-active{background:var(--ox-soft);}
.rx-rowbtn{border:none; background:none; cursor:pointer; font-family:var(--sans); font-weight:600; font-size:12.5px; color:var(--ink); text-align:left; padding:7px 12px 7px 14px; width:100%; transition:color .15s; line-height:1.16;}
.rx-rowbtn:hover{color:var(--ox);}
.rx-rowbtn small{display:block; font-weight:400; font-size:10px; color:var(--muted); font-family:var(--mono); letter-spacing:.01em; margin-top:1px;}
.rx-mx tbody tr{border-top:1px solid var(--line2);}
.rx-mx tbody tr.rx-classband td{background:var(--line3); font-family:var(--mono); font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:var(--ox); font-weight:600; text-align:left; padding:5px 14px; position:sticky; left:0;}
.rx-mx td.lab{text-align:left; border-right:1px solid var(--line); position:sticky; left:0; background:var(--panel); z-index:1; min-width:188px;}
.rx-cell{height:33px; position:relative;}
.rx-glyph{display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; border-radius:50%; position:relative;}
.g-full{background:var(--ox);}
.g-part{background:transparent; border:2px solid var(--ox); position:relative; overflow:hidden;}
.g-part::after{content:""; position:absolute; left:-1px; top:-1px; bottom:-1px; width:50%; background:var(--ox);}
.g-none{background:transparent; border:1.5px solid var(--line);}
.rx-star{position:absolute; top:-4px; right:-5px; color:var(--star); display:flex; filter:drop-shadow(0 0 1px #fff);}
.rx-cell.dim{opacity:.14;}
.rx-cell.hot{background:var(--ox-soft);}
.rx-row-active td.lab{background:var(--ox-soft);}
.rx-row-active{background:var(--ox-soft);}
.rx-mxbar{display:flex; flex-wrap:wrap; gap:13px 20px; align-items:center; margin:14px 0 2px; font-size:12.5px; color:var(--ink2);}
.rx-mxbar .li{display:flex; align-items:center; gap:8px;}
.rx-resetbtn{margin-left:auto; border:1px solid var(--line); background:var(--panel); cursor:pointer; font-family:var(--sans); font-size:12px; font-weight:600; color:var(--ink2); padding:6px 12px; border-radius:999px; display:flex; align-items:center; gap:6px;}
.rx-resetbtn:hover{border-color:var(--ox); color:var(--ox);}
.rx-mxnote{font-size:12px; color:var(--muted); margin:13px 0 0; line-height:1.6;}
.rx-selhint{font-size:12.5px; color:var(--ox); font-weight:600; margin:0 0 10px; min-height:18px;}

/* ----------------------------- DIRECTED bug-to-drug ----------------------------- */
.rx-dirtable{width:100%; border-collapse:collapse; font-size:13px; background:var(--panel); border:1px solid var(--line); border-radius:12px; overflow:hidden;}
.rx-dirtable thead th{font-family:var(--mono); font-size:9.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); text-align:left; padding:9px 13px; background:var(--line2); border-bottom:1px solid var(--line); font-weight:600;}
.rx-dirtable td{padding:11px 13px; border-bottom:1px solid var(--line2); vertical-align:top; line-height:1.5;}
.rx-dirtable tr:last-child td{border-bottom:none;}
.rx-dirtable tbody tr:hover{background:var(--line3);}
.rx-dirgrp td{background:var(--ox-softer); font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ox); font-weight:600; padding:7px 13px;}
.rx-dirorg{font-weight:700; font-size:13.5px; font-style:italic;}
.rx-dirorg .sub{font-style:normal; font-weight:400; font-size:11px; color:var(--muted); font-family:var(--mono); display:block; margin-top:2px; letter-spacing:.02em;}
.rx-dirfirst{font-weight:600; color:var(--ink);}
.rx-diralt{color:var(--ink2);}
.rx-dircav{font-size:12px; color:var(--muted);}
@media (max-width:860px){
  .rx-dirtable thead{display:none;}
  .rx-dirtable,.rx-dirtable tbody,.rx-dirtable tr,.rx-dirtable td{display:block; width:100%;}
  .rx-dirtable tr{border-bottom:1px solid var(--line); padding:5px 0;}
  .rx-dirtable td{border:none; padding:4px 14px;}
  .rx-dirtable td::before{content:attr(data-l); display:block; font-family:var(--mono); font-size:9px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); margin-bottom:2px;}
  .rx-dirtable td.tddorg::before{display:none;}
  .rx-dirgrp td{display:block;}
}

/* ----------------------------- RESISTANCE LADDER ----------------------------- */
.rx-ladder{display:flex; flex-direction:column; gap:0; margin:14px 0;}
.rx-rung{display:grid; grid-template-columns:46px 1fr; gap:0; position:relative;}
.rx-rung-rail{position:relative; display:flex; flex-direction:column; align-items:center;}
.rx-rung-dot{width:32px; height:32px; border-radius:10px 3px 10px 3px; background:linear-gradient(135deg, var(--ox-deep) 0%, var(--ox) 60%, var(--ox-bright) 220%); color:#fff; font-family:var(--mono); font-weight:700; font-size:12px; display:flex; align-items:center; justify-content:center; z-index:1; margin-top:14px; flex:0 0 auto; box-shadow:0 4px 12px -3px var(--ox-bright);}
.rx-rung-line{position:absolute; top:14px; bottom:-14px; width:2px; background:var(--ox-line); left:50%; transform:translateX(-50%);}
.rx-rung:last-child .rx-rung-line{display:none;}
.rx-rung-body{padding:12px 0 12px 14px;}
.rx-rung-name{font-weight:700; font-size:14px; color:var(--ink); display:flex; align-items:baseline; gap:8px; flex-wrap:wrap;}
.rx-rung-mech{font-size:11px; color:var(--muted); font-family:var(--mono); letter-spacing:.02em;}
.rx-rung-detail{font-size:12.5px; color:var(--ink2); margin:5px 0 7px; line-height:1.5;}
.rx-rung-agents{display:flex; flex-wrap:wrap; gap:5px;}
.rx-rung-grad{height:5px; border-radius:3px; margin:2px 0 0; background:linear-gradient(90deg,var(--green) 0%,var(--amber) 55%,var(--ox) 100%);}
.rx-rung-intensity{width:var(--w,20%); height:5px; border-radius:3px; background:var(--ox);}

/* ----------------------------- ALLERGY MAP ----------------------------- */
.rx-allergy{width:100%; border-collapse:collapse; font-size:12.5px; background:var(--panel); border:1px solid var(--line); border-radius:12px; overflow:hidden;}
.rx-allergy th{font-family:var(--mono); font-size:9.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); padding:9px 11px; background:var(--line2); text-align:left; font-weight:600; border-bottom:1px solid var(--line);}
.rx-allergy td{padding:10px 11px; border-bottom:1px solid var(--line2); vertical-align:top; line-height:1.45;}
.rx-allergy tr:last-child td{border-bottom:none;}
.rx-xreact{display:inline-flex; align-items:center; gap:5px; font-weight:600; font-size:11.5px;}
.xr-hi{color:var(--ox);} .xr-lo{color:var(--green);} .xr-none{color:var(--muted);}
.rx-xdot{width:8px;height:8px;border-radius:50%;display:inline-block;}
.xrd-hi{background:var(--ox);} .xrd-lo{background:var(--amber);} .xrd-none{background:var(--green);}

/* ----------------------------- FORMULARY ----------------------------- */
.rx-classhdr{font-family:var(--serif); font-size:16px; font-weight:600; margin:26px 0 9px; display:flex; align-items:center; gap:9px;}
.rx-classhdr .ic{width:26px; height:26px; border-radius:6px; background:var(--ox-soft); color:var(--ox); display:flex; align-items:center; justify-content:center;}
.rx-ftable{width:100%; border-collapse:collapse; font-size:13px; background:var(--panel); border:1px solid var(--line); border-radius:12px; overflow:hidden;}
.rx-ftable thead th{font-family:var(--mono); font-size:9.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); text-align:left; padding:9px 13px; background:var(--line2); border-bottom:1px solid var(--line); font-weight:600;}
.rx-ftable td{padding:11px 13px; border-bottom:1px solid var(--line2); vertical-align:top;}
.rx-ftable tr:last-child td{border-bottom:none;}
.rx-ftable tbody tr:hover{background:var(--line3);}
.rx-fname{font-weight:600; font-size:13.5px;}
.rx-fspec{font-size:11px; color:var(--muted); margin-top:2px;}
.rx-fdose{font-family:var(--mono); font-size:11.5px; color:var(--ink2); line-height:1.4;}
.rx-frenal{font-size:12px; color:var(--ink2); line-height:1.45;}
.rx-fpearl{font-size:12px; color:var(--muted); line-height:1.45;}
@media (max-width:860px){
  .rx-ftable thead{display:none;}
  .rx-ftable,.rx-ftable tbody,.rx-ftable tr,.rx-ftable td{display:block; width:100%;}
  .rx-ftable tr{border-bottom:1px solid var(--line); padding:5px 0;}
  .rx-ftable td{border:none; padding:4px 14px;}
  .rx-ftable td::before{content:attr(data-l); display:block; font-family:var(--mono); font-size:9px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); margin-bottom:1px;}
  .rx-ftable td.tdname::before{display:none;}
}

/* ----------------------------- CALCULATOR + DOSE ----------------------------- */
.rx-calc{display:grid; grid-template-columns:1fr 1fr; gap:24px; align-items:start;}
@media (max-width:760px){.rx-calc{grid-template-columns:1fr;}}
.rx-field{margin:0 0 13px;}
.rx-field label{display:flex; justify-content:space-between; align-items:baseline; font-size:12.5px; font-weight:600; margin:0 0 5px;}
.rx-field input[type=number]{width:100%; font-family:var(--mono); font-size:14px; padding:9px 11px; border:1px solid var(--line); border-radius:8px; background:var(--panel); color:var(--ink);}
.rx-field input:focus{border-color:var(--ox); outline:none; box-shadow:0 0 0 3px var(--ox-softer);}
.rx-seg{display:flex; gap:6px;}
.rx-seg button{flex:1; padding:8px; border:1px solid var(--line); background:var(--panel); border-radius:8px; cursor:pointer; font-family:var(--sans); font-size:13px; font-weight:600; color:var(--ink2);}
.rx-seg button[aria-pressed="true"]{background:var(--ox); color:#fff; border-color:var(--ox);}
.rx-result{background:var(--ox-soft); border:1px solid var(--ox-line); border-top:3px solid var(--ox); color:var(--ink); border-radius:12px; padding:22px 20px; text-align:center;}
.rx-result .num{font-family:var(--mono); font-size:46px; font-weight:600; line-height:1; letter-spacing:-.02em; color:var(--ox-deep);}
.rx-result .unit{font-family:var(--mono); font-size:13px; color:var(--muted); margin-top:4px;}
.rx-result .band{display:inline-flex; align-items:center; gap:6px; margin-top:13px; font-size:13px; font-weight:600; padding:5px 13px; border-radius:999px; background:var(--panel); border:1px solid var(--ox-line); color:var(--ink) !important;}
.rx-result .eq{font-family:var(--mono); font-size:10.5px; color:var(--muted); margin-top:13px; line-height:1.5;}
.rx-rentable{width:100%; border-collapse:collapse; font-size:12.5px;}
.rx-rentable th{font-family:var(--mono); font-size:9.5px; letter-spacing:.09em; text-transform:uppercase; color:var(--muted); text-align:left; padding:8px 10px; border-bottom:1px solid var(--line);}
.rx-rentable td{padding:9px 10px; border-bottom:1px solid var(--line2); vertical-align:top; line-height:1.45;}

/* ----------------------------- DURATION ----------------------------- */
.rx-durtable{width:100%; border-collapse:collapse; font-size:13px;}
.rx-durtable th{font-family:var(--mono); font-size:9.5px; letter-spacing:.09em; text-transform:uppercase; color:var(--muted); text-align:left; padding:8px 12px; border-bottom:1px solid var(--line);}
.rx-durtable td{padding:11px 12px; border-bottom:1px solid var(--line2); vertical-align:middle;}
.rx-durgroup td{background:var(--line2); font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ox); font-weight:600; padding:7px 12px;}
.rx-barwrap{position:relative; height:11px; background:var(--line2); border-radius:6px; width:150px; overflow:hidden;}
.rx-barbase{position:absolute; left:0; top:0; bottom:0; background:var(--ox); border-radius:6px;}
.rx-barext{position:absolute; top:0; bottom:0; background:repeating-linear-gradient(45deg,var(--ox-line),var(--ox-line) 3px,var(--ox-softer) 3px,var(--ox-softer) 6px);}
.rx-durdays{font-family:var(--mono); font-weight:600; font-size:12px; white-space:nowrap;}
.rx-durext{font-size:11px; color:var(--muted); margin-top:3px; line-height:1.4;}

/* generic 2-col mini grid */
.rx-2col{display:grid; grid-template-columns:1fr 1fr; gap:14px;}
@media (max-width:760px){.rx-2col{grid-template-columns:1fr;}}
.rx-mini h4{margin:0 0 9px; font-size:14px; font-weight:700; display:flex; align-items:center; gap:8px;}
.rx-mini h4 .ic{color:var(--ox); display:flex;}
.rx-mini ul{margin:0; padding-left:17px; font-size:13px; color:var(--ink2); line-height:1.5;}
.rx-mini li{margin:0 0 6px;}
.rx-mini li b{font-weight:600; color:var(--ink);}

/* references */
.rx-reftable{width:100%; border-collapse:collapse; font-size:13px;}
.rx-reftable td{padding:10px 12px; border-bottom:1px solid var(--line2); vertical-align:top;}
.rx-reftag{font-family:var(--mono); font-size:11px; color:var(--ox); font-weight:600; white-space:nowrap;}

.rx-empty{text-align:center; color:var(--muted); font-size:13.5px; padding:46px 0;}
.rx-foot{border-top:1px solid var(--line); margin-top:42px; padding-top:18px; font-size:11.5px; color:var(--muted); line-height:1.65;}
.rx-foot b{color:var(--ink2);}

@media print{
  .rx-header,.rx-nav,.rx-searchwrap,.rx-resetbtn,.rx-cmd-overlay{display:none!important;}
  .rx-root{background:#fff;}
  .rx-card,.rx-acc,.rx-mxwrap,.rx-dirtable,.rx-ftable{break-inside:avoid; box-shadow:none;}
  .rx-main{padding:0;}
}
`;

/* ===================== DATA: SPECTRUM MATRIX ===================== */
/* grp: gpc | gnr | res | ana | atp  — used for column grouping rules        */
const CSS4 = `
/* ---- generic reference matrices: penetration / mechanism / safety ---- */
.rx-mtxwrap{overflow-x:auto; border:1px solid var(--line); border-radius:12px; background:var(--panel); -webkit-overflow-scrolling:touch; margin:14px 0;}
.rx-mtx{border-collapse:separate; border-spacing:0; font-size:12px; min-width:780px; width:100%;}
.rx-mtx th,.rx-mtx td{padding:0; text-align:center;}
.rx-mtx thead th{position:sticky; top:0; background:var(--panel); z-index:2; vertical-align:bottom;}
.rx-mtx .corner{position:sticky; left:0; z-index:3; background:var(--panel); border-right:1px solid var(--line); text-align:left; vertical-align:bottom;}
.rx-mtx .corner .cl{font-family:var(--mono); font-size:9px; letter-spacing:.09em; text-transform:uppercase; color:var(--muted); font-weight:600; padding:0 12px 9px;}
.rx-mtx-colh{font-family:var(--sans); font-weight:600; font-size:10.5px; color:var(--ink2); writing-mode:vertical-rl; transform:rotate(180deg); padding:9px 4px; height:124px; line-height:1.1; white-space:nowrap;}
.rx-mtx td.lab{position:sticky; left:0; background:var(--panel); z-index:1; text-align:left; border-right:1px solid var(--line); min-width:176px; padding:7px 12px; font-weight:600; color:var(--ink); line-height:1.16;}
.rx-mtx td.lab small{display:block; font-weight:400; font-size:10px; color:var(--muted); font-family:var(--mono); margin-top:1px; letter-spacing:.01em;}
.rx-mtx tbody tr{border-top:1px solid var(--line2);}
.rx-mtx tbody tr:hover{background:var(--line3);}
.rx-mtx tr.band td{background:var(--line3); font-family:var(--mono); font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:var(--ox); font-weight:600; text-align:left; padding:5px 12px; position:sticky; left:0;}
.rx-cell2{height:30px; position:relative;}
.rx-dot{display:inline-flex; width:16px; height:16px; border-radius:50%; align-items:center; justify-content:center; vertical-align:middle;}
.d-good{background:var(--ox);}
.d-mod{background:transparent; border:2px solid var(--ox); overflow:hidden; position:relative;}
.d-mod::after{content:""; position:absolute; left:-1px; top:-1px; bottom:-1px; width:50%; background:var(--ox);}
.d-poor{background:transparent; border:1.5px solid var(--line2); box-shadow:inset 0 0 0 1px var(--line);}
.d-var{background:transparent; border:2px dashed var(--amber);}
.d-na{width:9px; height:2px; background:var(--faint); border-radius:2px;}
.tox-d{display:inline-block; width:14px; height:14px; border-radius:4px; vertical-align:middle;}
.tx-hi{background:var(--ox);}
.tx-mod{background:var(--amber);}
.tx-lo{background:var(--line2); box-shadow:inset 0 0 0 1px var(--line);}
.tx-dot-txt{font-family:var(--mono); font-size:9px; color:var(--faint);}
.rx-mtxleg{display:flex; flex-wrap:wrap; gap:10px 18px; font-size:12px; color:var(--ink2); margin:12px 0 0; align-items:center;}
.rx-mtxleg .li{display:flex; align-items:center; gap:7px;}
.rx-axis{display:grid; grid-template-columns:1fr 1fr 1fr; gap:13px; margin:14px 0;}
@media (max-width:820px){.rx-axis{grid-template-columns:1fr;}}
.rx-axiscard{border:1px solid var(--line); border-radius:14px 4px 14px 4px; padding:14px 15px; background:var(--panel);}
.rx-axiscard .ax-k{font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ox); font-weight:600;}
.rx-axiscard .ax-t{font-weight:700; font-size:14px; margin:4px 0 2px;}
.rx-axiscard .ax-pd{font-family:var(--mono); font-size:11px; color:var(--ink2); margin:2px 0 8px;}
.rx-axiscard ul{margin:0; padding-left:16px; font-size:12.5px; color:var(--ink2); line-height:1.5;}
.rx-axiscard li{margin:0 0 5px;} .rx-axiscard li b{color:var(--ink); font-weight:600;}

/* ---- provenance cite chip (single-source-of-truth registry) ---- */
.rx-cite{display:inline-flex; align-items:center; gap:4px; font-family:var(--mono); font-size:9px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; padding:2px 6px; border-radius:5px; background:var(--blue-soft); color:var(--blue); border:1px solid var(--blue-line); white-space:nowrap; cursor:help; vertical-align:middle;}
.rx-cite.cl{cursor:pointer; transition:filter .12s;} .rx-cite.cl:hover{filter:brightness(.96);}

/* ---- derived category counts in the syndrome filter bar ---- */
.rx-catn{font-family:var(--mono); font-size:9.5px; font-weight:600; opacity:.75; margin-left:5px;}

/* ---- "what's changing" evolving-evidence cards ---- */
.rx-evolve{display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:6px 0 4px;}
@media (max-width:780px){.rx-evolve{grid-template-columns:1fr;}}
.rx-evcard{border:1px solid var(--amber-line); background:var(--amber-soft); border-radius:14px 4px 14px 4px; padding:13px 15px;}
.rx-evcard .evh{display:flex; align-items:center; gap:8px; font-weight:700; font-size:13px; color:var(--amber); margin:0 0 5px;}
.rx-evcard .evh svg{flex:0 0 auto;}
.rx-evcard .evb{font-size:12.5px; color:var(--ink2); line-height:1.5; margin:0;}
.rx-evcard .evdir{display:inline-block; font-family:var(--mono); font-size:9px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--ox); margin-top:7px;}

/* ---- directed-therapy row scroll-to highlight ---- */
.rx-dirtable tr.rx-dirhi td{background:var(--ox-softer); animation:rxflash 1.8s ease-out;}
@keyframes rxflash{0%{background:var(--ox-soft);}100%{background:var(--ox-softer);}}
@media (prefers-reduced-motion: reduce){.rx-dirtable tr.rx-dirhi td{animation:none;}}

/* ============================ v3 · PHASE A ============================ */
/* tabular numerals (the single lever for column-aligned doses/clearance) */
.rx-num{font-family:var(--mono); font-variant-numeric:tabular-nums; font-feature-settings:"tnum"; letter-spacing:-.01em;}

/* ---- amber callout variant (adjust / dose-dependent) ---- */
.rx-callout-amber{background:var(--amber-soft); border-color:var(--amber-line); color:var(--amber);}

/* ---- persistent patient-context bar ---- */
.rx-ctxbar{position:sticky; top:0; z-index:46; background:var(--ox-deep); color:#fff; border-bottom:1px solid rgba(0,0,0,.15);
  animation:rxctxin .26s cubic-bezier(.2,.7,.2,1);}
@keyframes rxctxin{from{transform:translateY(-100%);}to{transform:translateY(0);}}
@media (prefers-reduced-motion: reduce){.rx-ctxbar{animation:none;}}
.rx-ctxbar-inner{display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding:8px 22px;}
.rx-ctxbar-lab{display:inline-flex; align-items:center; gap:6px; font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; font-weight:600; opacity:.92; margin-right:2px;}
.rx-ctxchip{display:inline-flex; align-items:center; gap:5px; background:rgba(255,255,255,.13); border:1px solid rgba(255,255,255,.18);
  border-radius:999px; padding:3px 10px; font-size:11.5px; line-height:1.3; color:#fff; white-space:nowrap;}
.rx-ctxchip .rx-num{color:#fff;}
button.rx-ctxchip{cursor:pointer; font-family:var(--sans); transition:background .14s;}
button.rx-ctxchip:hover{background:rgba(255,255,255,.22);}
.rx-ctxchip-band{border-left:3px solid var(--bandc, #fff); padding-left:8px;}
.rx-ctxchip-arc{background:var(--amber); border-color:var(--amber);}
.rx-ctxchip-warn{background:var(--ox-bright); border-color:var(--ox-bright);}
.rx-ctxchip-risk{background:rgba(255,255,255,.08); border-style:dashed; font-size:11px; opacity:.95;}
.rx-ctxbar-clear{margin-left:auto; display:inline-flex; align-items:center; gap:5px; background:none; border:1px solid rgba(255,255,255,.3);
  color:#fff; border-radius:999px; padding:4px 11px; font-family:var(--sans); font-size:11.5px; font-weight:600; cursor:pointer; transition:background .14s;}
.rx-ctxbar-clear:hover{background:rgba(255,255,255,.16);}
.rx-ctxbar .rx-ctxbar-clear:focus-visible,.rx-ctxbar button:focus-visible{outline:2px solid #fff; outline-offset:2px;}

/* ---- shared drawer primitive ---- */
.rx-drawer-overlay{position:fixed; inset:0; z-index:120; background:rgba(27,25,22,.42); backdrop-filter:blur(2px);
  display:flex; justify-content:flex-end; animation:rxfade .2s ease;}
@keyframes rxfade{from{opacity:0;}to{opacity:1;}}
.rx-drawer{width:min(560px,96vw); max-width:96vw; height:100%; background:var(--paper); border-left:1px solid var(--line);
  box-shadow:-24px 0 60px -20px rgba(27,25,22,.4); display:flex; flex-direction:column; animation:rxslide .26s cubic-bezier(.2,.7,.2,1);}
@keyframes rxslide{from{transform:translateX(28px); opacity:.4;}to{transform:translateX(0); opacity:1;}}
@media (prefers-reduced-motion: reduce){.rx-drawer-overlay,.rx-drawer{animation:none;}}
.rx-drawer-head{display:flex; align-items:flex-start; gap:12px; padding:18px 20px 14px; border-bottom:1px solid var(--line); background:var(--panel);}
.rx-drawer-titles{flex:1; min-width:0;}
.rx-drawer-kicker{font-family:var(--mono); font-size:9.5px; letter-spacing:.16em; text-transform:uppercase; color:var(--ox); font-weight:600; margin-bottom:3px;}
.rx-drawer-title{font-family:var(--serif); font-size:19px; font-weight:600; letter-spacing:-.01em; display:flex; align-items:center; gap:9px; line-height:1.15;}
.rx-drawer-title svg{color:var(--ox); flex:0 0 auto;}
.rx-drawer-x{flex:0 0 auto; width:32px; height:32px; border-radius:8px; border:1px solid var(--line); background:var(--paper); color:var(--ink2);
  cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .14s,color .14s;}
.rx-drawer-x:hover{background:var(--ox-soft); color:var(--ox); border-color:var(--ox-line);}
.rx-drawer-body{flex:1; overflow-y:auto; padding:18px 20px 28px;}

/* ---- dose-tab calculator additions ---- */
.rx-field2{display:grid; grid-template-columns:1fr 1fr; gap:12px;}
.rx-field input[aria-invalid="true"]{border-color:var(--ox-bright); box-shadow:0 0 0 3px var(--ox-softer);}
.rx-ctxtoggle{margin-top:14px; width:100%; display:inline-flex; align-items:center; justify-content:center; gap:8px;
  border:1px solid var(--ox-line); background:var(--ox-soft); color:var(--ox); cursor:pointer;
  font-family:var(--sans); font-size:13px; font-weight:600; padding:11px 14px; border-radius:10px; transition:background .15s,color .15s,border-color .15s;}
.rx-ctxtoggle:hover{background:var(--ox-softer);}
.rx-ctxtoggle.on{background:var(--ox); color:#fff; border-color:var(--ox);}
.rx-ctxtoggle:disabled{opacity:.5; cursor:not-allowed;}
.rx-fieldnote{font-size:11.5px; color:var(--muted); line-height:1.5; margin:9px 2px 0;}

/* Child-Pugh scorer */
.rx-cp{border:1px solid var(--line); border-radius:14px 4px 14px 4px; background:var(--panel); margin:0 0 13px; overflow:hidden;}
.rx-cp-head{display:flex; align-items:center; gap:10px; width:100%; background:none; border:none; padding:11px 13px; cursor:pointer; text-align:left; font-family:var(--sans);}
.rx-cp-head:hover{background:var(--ox-softer);}
.rx-cp-head:focus-visible{outline:2px solid var(--ox); outline-offset:-2px;}
.rx-cp-headl{display:flex; align-items:center; gap:7px; font-size:13px; font-weight:600; color:var(--ink);}
.rx-cp-headl svg{color:var(--ox);}
.rx-cp-badge{margin-left:auto; font-size:11.5px; font-family:var(--mono); padding:3px 9px; border-radius:999px; border:1px solid; background:var(--paper);}
.rx-cp-hint{margin-left:auto; font-size:11px; color:var(--muted); font-style:italic;}
.rx-cp-chev{color:var(--muted); transition:transform .16s;}
.rx-cp-chev.open{transform:rotate(90deg);}
@media (prefers-reduced-motion: reduce){.rx-cp-chev{transition:none;}}
.rx-cp-body{padding:6px 13px 13px; border-top:1px solid var(--line2);}
.rx-cp-grid{display:flex; flex-direction:column;}
.rx-cp-row{display:grid; grid-template-columns:128px 1fr 24px; align-items:center; gap:12px; padding:9px 0; border-bottom:1px solid var(--line3);}
.rx-cp-row:last-child{border-bottom:none;}
.rx-cp-lab{font-size:12.5px; font-weight:600; color:var(--ink2); line-height:1.25;}
.rx-cp-unit{font-weight:400; color:var(--muted); font-size:10.5px;}
.rx-cp-numwrap{display:flex; align-items:center; gap:10px; min-width:0;}
.rx-cp-num{width:74px; flex:0 0 auto; padding:6px 9px; border:1px solid var(--line); border-radius:7px; font-family:var(--mono); font-size:13px; background:var(--paper); color:var(--ink);}
.rx-cp-num:focus-visible{outline:2px solid var(--ox); outline-offset:0; border-color:var(--ox);}
.rx-cp-bands{display:flex; gap:5px; flex-wrap:wrap; min-width:0;}
.rx-cp-band{font-size:11px; color:var(--muted); font-family:var(--mono); padding:2px 7px; border-radius:6px; border:1px solid var(--line2); white-space:nowrap;}
.rx-cp-band sup{color:var(--faint); font-weight:600; margin-left:1px;}
.rx-cp-band.on{background:var(--ox-soft); color:var(--ox); border-color:var(--ox-line); font-weight:600;}
.rx-cp-band.on sup{color:var(--ox);}
.rx-cp-seg{display:flex; gap:5px; flex-wrap:wrap;}
.rx-cp-seg button{font-size:11px; padding:5px 9px; border:1px solid var(--line); border-radius:7px; background:var(--paper); color:var(--ink2); cursor:pointer; font-family:var(--sans); line-height:1.2;}
.rx-cp-seg button sup{color:var(--faint); font-weight:600; margin-left:2px;}
.rx-cp-seg button:hover{border-color:var(--ox-line);}
.rx-cp-seg button:focus-visible{outline:2px solid var(--ox); outline-offset:0;}
.rx-cp-seg button.on{background:var(--ox-soft); color:var(--ox); border-color:var(--ox); font-weight:600;}
.rx-cp-seg button.on sup{color:var(--ox);}
.rx-cp-pts{flex:0 0 auto; text-align:center; font-size:14px; font-weight:600; color:var(--ink);}
.rx-cp-pts.empty{color:var(--faint); font-weight:400;}
.rx-cp-foot{margin-top:12px;}
.rx-cp-scale{font-size:11px; color:var(--muted); text-align:center; letter-spacing:.02em;}
.rx-cp-result{display:flex; align-items:center; gap:13px; padding:11px 14px; border:1px solid; border-radius:9px; background:var(--paper);}
.rx-cp-total{font-size:30px; font-weight:600; line-height:1; flex:0 0 auto;}
.rx-cp-rtx{display:flex; flex-direction:column; gap:3px;}
.rx-cp-rtx b{font-size:13.5px;}
.rx-cp-rsub{font-size:11.5px; color:var(--muted); line-height:1.45;}
@media (max-width:560px){.rx-cp-row{grid-template-columns:1fr 24px; grid-template-areas:"lab pts" "ctl ctl";}
  .rx-cp-lab{grid-area:lab;} .rx-cp-pts{grid-area:pts;} .rx-cp-numwrap,.rx-cp-seg{grid-area:ctl;}}
.rx-result-sub{font-size:12px; color:var(--ink2); margin-top:10px; font-family:var(--sans); line-height:1.5;}
.rx-result-sub .disc{color:var(--amber); font-weight:600;}
.rx-wtcard{padding:14px 16px;}
.rx-wt-head{font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ox); font-weight:600; margin-bottom:9px;}
.rx-wt-grid{display:grid; grid-template-columns:repeat(3,1fr); gap:8px;}
.rx-wt-cell{background:var(--paper2); border:1px solid var(--line2); border-radius:8px; padding:8px 10px; display:flex; flex-direction:column; gap:2px;}
.rx-wt-cell .k{font-family:var(--mono); font-size:9.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); font-weight:600;}
.rx-wt-cell .v{font-size:15px; font-weight:600;}
.rx-wt-rule{font-size:12px; color:var(--ink2); line-height:1.5; margin:10px 0 0;}
.rx-wt-vanco{font-size:12px; color:var(--ox); background:var(--ox-softer); border:1px solid var(--ox-line); border-radius:8px; padding:8px 10px; margin-top:10px; line-height:1.45;}
.rx-wt-vanco-note{font-size:10.5px; color:var(--muted); margin-top:6px; padding-top:6px; border-top:1px solid var(--ox-line); line-height:1.4;}

/* ============================ v3 · PHASE B1 ============================ */
/* formulary: clickable drug name + ctx-adjusted dose */
.rx-fname-link{font:inherit; font-weight:700; font-size:13px; color:var(--ink); background:none; border:none; padding:0; cursor:pointer; text-align:left; border-bottom:1px dotted var(--ox-line); transition:color .14s;}
.rx-fname-link:hover{color:var(--ox); border-bottom-color:var(--ox);}
.rx-fnote-ctx{display:inline-flex; align-items:center; gap:7px; font-size:12px; color:var(--ox); background:var(--ox-softer); border:1px solid var(--ox-line); border-radius:8px; padding:7px 11px; margin:-4px 0 14px;}
.rx-fdose-wrap{display:flex; flex-direction:column; gap:2px;}
.rx-fdose-adj{font-family:var(--mono); font-size:11.5px; font-weight:600; color:var(--ox); line-height:1.35;}
.rx-fdose-was{font-family:var(--mono); font-size:10.5px; color:var(--faint); text-decoration:line-through;}
.rx-fdose-note{font-size:10.5px; color:var(--amber); line-height:1.35;}
.rx-fdose-tag{font-family:var(--mono); font-size:9px; letter-spacing:.06em; text-transform:uppercase; color:var(--muted);}
.rx-fdose-tag.rx-tag-ok{color:var(--green);}

/* drawer cards */
.rx-dc{font-size:13px; color:var(--ink2); line-height:1.55;}
.rx-dc-sub{font-size:12px; color:var(--muted); margin:0 0 14px; line-height:1.5;}
.rx-dc-sec{padding:13px 0; border-top:1px solid var(--line2);}
.rx-dc-sec:first-of-type{border-top:none; padding-top:2px;}
.rx-dc-h{display:flex; align-items:center; gap:7px; font-family:var(--mono); font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--ox); font-weight:600; margin-bottom:8px;}
.rx-dc-h svg{flex:0 0 auto;}
.rx-dc-hsub{font-family:var(--sans); letter-spacing:0; text-transform:none; color:var(--muted); font-weight:400; font-size:11px;}
.rx-dc-dose{background:var(--paper2); border:1px solid var(--line2); border-radius:9px; padding:11px 13px; font-size:13.5px;}
.rx-dc-dose-adj{font-family:var(--mono); font-weight:600; color:var(--ox); font-size:13.5px;}
.rx-dc-dosetag{font-family:var(--mono); font-size:9px; letter-spacing:.05em; text-transform:uppercase; color:var(--ox); background:var(--ox-soft); border-radius:4px; padding:1px 6px; vertical-align:middle;}
.rx-dc-renal{font-size:12px; color:var(--ink2); margin-top:6px;}
.rx-dc-note{display:flex; gap:6px; align-items:flex-start; font-size:11.5px; color:var(--amber); margin-top:7px; line-height:1.4;}
.rx-dc-note svg{flex:0 0 auto; margin-top:2px;}
.rx-dc-note2{font-size:12px; color:var(--muted); margin-top:6px; line-height:1.5;}
.rx-dc-line{font-size:12.5px; margin:5px 0; line-height:1.5;}
.rx-dc-line .rx-star{color:var(--star); vertical-align:-1px;}
.rx-dc-ul{margin:8px 0 0; padding-left:18px; font-size:12px; color:var(--ink2); line-height:1.5;}
.rx-dc-ul li{margin:3px 0;}
.rx-dc-chips{display:flex; flex-wrap:wrap; gap:6px;}
.rx-dc-btn{margin-top:11px; display:inline-flex; align-items:center; gap:7px; font-family:var(--sans); font-size:12px; font-weight:600; color:var(--ox); background:var(--ox-soft); border:1px solid var(--ox-line); border-radius:8px; padding:7px 12px; cursor:pointer; transition:background .14s;}
.rx-dc-btn:hover{background:var(--ox-softer);}
.rx-dc-muted{color:var(--muted); font-size:12px;}
.rx-dc-dir{background:var(--paper2); border:1px solid var(--line2); border-radius:9px; padding:11px 13px; margin-bottom:9px;}
.rx-dc-dir-org{font-weight:700; font-size:13px; font-style:italic; color:var(--ink);}
.rx-dc-dir-org .sub{font-style:normal; font-weight:400; font-size:11px; color:var(--muted); margin-left:6px;}
.rx-dc-dir-first{font-size:12.5px; color:var(--green); margin-top:5px;}
.rx-dc-dir-alt{font-size:12px; color:var(--ink2); margin-top:3px;}
.rx-dc-dir-cav{display:flex; gap:6px; align-items:flex-start; font-size:11.5px; color:var(--ox); margin-top:6px; line-height:1.4;}
.rx-dc-dir-cav svg{flex:0 0 auto; margin-top:2px;}
.rx-dc-druglink{font:inherit; font-size:12.5px; color:var(--ox); background:none; border:none; padding:0; cursor:pointer; text-decoration:underline; text-decoration-color:var(--ox-line); text-underline-offset:2px;}
.rx-dc-druglink:hover{text-decoration-color:var(--ox);}
.rx-cidal-w{color:var(--ox); font-weight:600;}
.rx-static-w{color:var(--muted);}

/* ============================ v3 · PHASE B2 ============================ */
/* regimen builder panel */
.rx-builder{border:1px solid var(--ox-line); background:linear-gradient(180deg,var(--ox-softer),var(--paper)); border-radius:13px; padding:16px 18px; margin-bottom:20px;}
.rx-builder-h{display:flex; align-items:center; gap:8px; font-family:var(--serif); font-size:16px; font-weight:600; color:var(--ink); margin-bottom:4px;}
.rx-builder-h svg{color:var(--ox);}
.rx-builder-sub{font-size:12px; color:var(--ink2); line-height:1.5; margin:0 0 13px;}
.rx-builder-grid{display:grid; grid-template-columns:minmax(0,1.7fr) minmax(0,1fr); gap:12px; margin-bottom:11px;}
@media (max-width:560px){.rx-builder-grid{grid-template-columns:1fr;}}
.rx-builder-field{display:flex; flex-direction:column; gap:5px; min-width:0;}
.rx-builder-field span{font-family:var(--mono); font-size:9.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); font-weight:600;}
.rx-builder-field select{font-family:var(--sans); font-size:13px; color:var(--ink); background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:9px 11px; cursor:pointer; width:100%; max-width:100%; min-width:0;}
.rx-builder-field input{font-family:var(--sans); font-size:13px; color:var(--ink); background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:9px 11px; width:100%; max-width:100%; min-width:0; box-sizing:border-box;}
.rx-builder-field select:focus-visible,.rx-builder-field input:focus-visible{outline:2px solid var(--ox); outline-offset:1px;}
.rx-builder-risks{display:flex; flex-wrap:wrap; align-items:center; gap:7px; margin-bottom:14px;}
.rx-builder-rlab{font-family:var(--mono); font-size:9.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); font-weight:600; margin-right:2px;}
.rx-builder-go{display:inline-flex; align-items:center; gap:8px; font-family:var(--sans); font-size:13px; font-weight:600; color:#fff; background:var(--ox); border:1px solid var(--ox); border-radius:9px; padding:10px 16px; cursor:pointer; transition:background .14s;}
.rx-builder-go:hover{background:var(--ox-deep);}

/* regimen card (in drawer) */
.rx-reg-core{background:var(--ox-softer); border:1px solid var(--ox-line); border-radius:9px; padding:12px 14px;}
.rx-reg-k{font-family:var(--mono); font-size:9.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--ox); font-weight:600; margin-bottom:5px;}
.rx-reg-rx{font-size:14px; font-weight:600; color:var(--ink); line-height:1.45;}
.rx-reg-note{font-size:11.5px; color:var(--ink2); line-height:1.5; margin-top:6px;}
.rx-reg-add{background:var(--paper2); border:1px solid var(--line2); border-left:3px solid var(--ox); border-radius:8px; padding:10px 13px; margin-bottom:8px;}
.rx-reg-k-add{display:inline-flex; align-items:center; gap:5px;}
.rx-reg-dose{display:flex; flex-direction:column; gap:6px;}
.rx-reg-doserow{display:flex; align-items:baseline; justify-content:space-between; gap:12px; padding:6px 10px; background:var(--paper2); border:1px solid var(--line2); border-radius:7px;}
.rx-reg-doseval{font-family:var(--mono); font-size:12px; font-weight:600; color:var(--ink2);}
.rx-reg-doseval.adj{color:var(--ox);}
.rx-reg-cover{font-size:12.5px; color:var(--ink2); line-height:1.5; margin-bottom:7px;}
.rx-reg-omit{font-size:12.5px; color:var(--ink2); line-height:1.5;}
.rx-reg-cover .lab{display:inline-block; font-family:var(--mono); font-size:8.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--green); font-weight:600; margin-right:6px; vertical-align:1px;}
.rx-reg-omit .lab{display:inline-block; font-family:var(--mono); font-size:8.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--ox); font-weight:600; margin-right:6px; vertical-align:1px;}
.rx-reg-deesc{display:flex; gap:7px; align-items:flex-start; font-size:12.5px; color:var(--ink2); line-height:1.5; margin-top:7px; background:var(--blue-soft); border:1px solid var(--blue-line); border-radius:8px; padding:9px 11px;}
.rx-reg-deesc svg{flex:0 0 auto; margin-top:2px; color:var(--blue);}
.rx-reg-guard{display:flex; gap:8px; align-items:flex-start; font-size:12px; color:var(--green); background:var(--green-soft); border:1px solid var(--green-line); border-radius:9px; padding:11px 13px; line-height:1.5; margin-top:16px; min-width:0; overflow-wrap:anywhere;}
.rx-reg-guard svg{flex:0 0 auto; margin-top:1px;}
.rx-reg-actions{display:flex; gap:9px; margin-top:13px; flex-wrap:wrap;}
.rx-dc-btn-ghost{color:var(--ink2); background:var(--panel); border-color:var(--line);}
.rx-dc-btn-ghost:hover{background:var(--line3);}

/* ============================ v3 · PHASE C4 ============================ */
.rx-trial-title{font-family:var(--serif); font-size:15px; font-weight:600; color:var(--ink); line-height:1.35;}
.rx-trial-cite{font-family:var(--mono); font-size:11px; color:var(--muted); margin-top:5px; line-height:1.45;}
.rx-cite.cl{cursor:pointer; transition:background .14s,color .14s;}
.rx-cite.cl:hover{background:var(--ox-soft); color:var(--ox);}
.rx-cite.cl:focus-visible{outline:2px solid var(--ox); outline-offset:1px;}
.rx-refrow{cursor:pointer; transition:background .13s;}
.rx-refrow:hover{background:var(--ox-softer);}
.rx-refrow:focus-visible{outline:2px solid var(--ox); outline-offset:-2px;}
.rx-refchev{width:26px; color:var(--faint); text-align:right; padding-right:10px;}
.rx-refrow:hover .rx-refchev{color:var(--ox);}

/* ============================ v3 · PHASE C2 ============================ */
.rx-rdx-grid{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; margin-bottom:6px;}
@media (max-width:680px){.rx-rdx-grid{grid-template-columns:1fr;}}
.rx-rdx-card{background:var(--panel); border:1px solid var(--line); border-radius:14px 4px 14px 4px; padding:14px 15px;}
.rx-rdx-h{display:flex; align-items:center; gap:8px; font-family:var(--sans); font-size:13.5px; font-weight:700; color:var(--ink); margin-bottom:7px;}
.rx-rdx-h svg{color:var(--ox); flex:0 0 auto;}
.rx-rdx-lead{font-size:12.5px; font-weight:600; color:var(--ink2); line-height:1.45; margin-bottom:9px;}
.rx-rdx-points{margin:0; padding:0; list-style:none;}
.rx-rdx-points li{position:relative; padding-left:15px; margin:0 0 6px; font-size:12px; color:var(--muted); line-height:1.5;}
.rx-rdx-points li:last-child{margin-bottom:0;}
.rx-rdx-points li::before{content:""; position:absolute; left:2px; top:7px; width:4px; height:4px; border-radius:50%; background:var(--ox);}
.rx-rdx-points li b{color:var(--ink2); font-weight:600;}

/* 48–72 h reassessment — reference criteria list (not a checklist) */
.rx-criteria{margin:0; padding:0; list-style:none;}
.rx-criterion{display:flex; align-items:flex-start; gap:12px; padding:11px 14px; border:1px solid var(--line2); border-left:3px solid var(--ox); border-radius:9px; background:var(--panel); margin-bottom:7px;}
.rx-criterion:last-child{margin-bottom:0;}
.rx-criterion-n{flex:0 0 auto; width:22px; height:22px; border-radius:50%; background:var(--ox-soft); color:var(--ox); border:1px solid var(--ox-line); font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center; margin-top:1px;}
.rx-criterion-tx{display:flex; flex-direction:column; gap:3px; min-width:0;}
.rx-criterion-tx .t{font-size:13.5px; font-weight:600; color:var(--ink); line-height:1.35;}
.rx-criterion-tx .d{font-size:12px; color:var(--muted); line-height:1.5;}

/* algorithm at-a-glance navigator */
.rx-algindex{display:grid; grid-template-columns:1fr 1fr; gap:9px; margin:0 0 18px;}
@media (max-width:680px){.rx-algindex{grid-template-columns:1fr;}}
.rx-algchip{display:flex; align-items:center; gap:11px; padding:11px 14px; border:1px solid var(--line); border-left:3px solid var(--ox); border-radius:9px; background:var(--panel); text-decoration:none; transition:background .12s, border-color .12s, box-shadow .12s;}
.rx-algchip:hover{background:var(--ox-softer); box-shadow:0 1px 0 var(--ox-softer);}
.rx-algchip-ic{flex:0 0 auto; width:30px; height:30px; border-radius:7px; background:var(--ox-soft); color:var(--ox); display:flex; align-items:center; justify-content:center;}
.rx-algchip-tx{display:flex; flex-direction:column; gap:2px; min-width:0;}
.rx-algchip-tx .t{font-size:13px; font-weight:700; color:var(--ink); line-height:1.25;}
.rx-algchip-tx .d{font-size:11.5px; color:var(--muted); line-height:1.35;}
/* ============================ v3 · PHASE D3 ============================ */
.rx-ivpo{display:flex; flex-direction:column;}
.rx-ivpo-intro{font-size:12.5px; color:var(--ink2); margin:0 0 10px; line-height:1.45;}
.rx-criteria-tight .rx-criterion{padding:8px 12px; margin-bottom:6px;}
.rx-criteria-tight .rx-criterion-tx .t{font-size:12.5px; font-weight:500;}
.rx-ivpo-agents{margin-top:12px;}
.rx-ivpo-alab{display:block; font-family:var(--mono); font-size:9px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); font-weight:600; margin-bottom:7px;}
.rx-ivpo-f{font-family:var(--mono); font-size:9px; opacity:.8; margin-left:3px;}

/* ============================ v3 · PHASE D2 ============================ */
/* MRSA agent-by-site matrix */
.rx-mxtable{width:100%; border-collapse:separate; border-spacing:0; font-size:12.5px; min-width:560px;}
.rx-mxtable thead th{font-family:var(--mono); font-size:9.5px; letter-spacing:.06em; text-transform:uppercase; color:var(--muted); font-weight:600; text-align:center; padding:9px 8px; border-bottom:1px solid var(--line); vertical-align:bottom; line-height:1.2;}
.rx-mxtable th.rx-mx-ag{text-align:left; padding-left:13px;}
.rx-mxtable td{border-bottom:1px solid var(--line2); padding:8px;}
.rx-mxtable td.rx-mx-ag{text-align:left; padding-left:13px; white-space:nowrap;}
.rx-mxtable td.rx-mx-c{text-align:center;}
.rx-mxtable tbody tr:hover td{background:var(--ox-softer);}
.rx-mxcell{display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:7px;}
.rx-mxcell.mx-pref{color:#fff; background:var(--green);}
.rx-mxcell.mx-alt{color:var(--blue); background:var(--blue-soft); border:1px solid var(--blue-line);}
.rx-mxcell.mx-avoid{color:#fff; background:var(--ox);}
.rx-mxcell.mx-na{color:var(--faint); background:transparent;}
.rx-mxdot{width:8px; height:8px; border-radius:50%; background:currentColor;}
.rx-mxdash{width:9px; height:2px; border-radius:2px; background:currentColor; opacity:.6;}
.rx-mxlegend{display:flex; flex-wrap:wrap; gap:16px; margin:11px 2px 0; font-size:11.5px; color:var(--ink2);}
.rx-mxleg-item{display:inline-flex; align-items:center; gap:7px;}
.rx-mxnotes{margin:13px 0 0; padding-left:18px; font-size:12px; color:var(--ink2); line-height:1.55;}
.rx-mxnotes li{margin:4px 0;}
.rx-mxnotes li b{color:var(--ink); font-weight:600;}

/* GNR mechanism table */
.rx-gnrtable{width:100%; border-collapse:collapse; font-size:12.5px; min-width:640px;}
.rx-gnrtable thead th{font-family:var(--mono); font-size:9.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); font-weight:600; text-align:left; padding:9px 13px; background:var(--line2); border-bottom:1px solid var(--line);}
.rx-gnrtable td{padding:11px 13px; border-bottom:1px solid var(--line2); vertical-align:top; line-height:1.45;}
.rx-gnrtable tbody tr:hover td{background:var(--ox-softer);}
.rx-gnr-m{font-weight:700; font-size:12.5px; color:var(--ink);}
.rx-gnr-first{color:var(--green); font-weight:600;}
.rx-gnr-alt{color:var(--ink2);}
.rx-gnr-cav{color:var(--ox); font-size:12px;}

/* ============================ v3 · PHASE D4 ============================ */
.rx-fmbar{display:flex; flex-wrap:wrap; align-items:center; gap:10px 14px; padding:11px 14px; background:var(--panel); border:1px solid var(--line); border-radius:14px 4px 14px 4px; margin:-2px 0 8px;}
.rx-fmbar-lab{display:inline-flex; align-items:center; gap:6px; font-family:var(--mono); font-size:9.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); font-weight:600;}
.rx-fmbar-field{display:inline-flex; align-items:center; gap:7px; font-size:12px; color:var(--ink2);}
.rx-fmbar-field span{font-family:var(--mono); font-size:9.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); font-weight:600;}
.rx-fmbar-field select{font-family:var(--sans); font-size:12.5px; color:var(--ink); background:var(--paper); border:1px solid var(--line); border-radius:7px; padding:6px 9px; cursor:pointer;}
.rx-fmbar-field select:focus-visible{outline:2px solid var(--ox); outline-offset:1px;}
.rx-fmbar-seg{display:inline-flex; border:1px solid var(--line); border-radius:7px; overflow:hidden;}
.rx-fmbar-seg button{font-family:var(--sans); font-size:12px; font-weight:600; color:var(--ink2); background:var(--paper); border:none; padding:6px 12px; cursor:pointer; border-right:1px solid var(--line); transition:background .13s,color .13s;}
.rx-fmbar-seg button:last-child{border-right:none;}
.rx-fmbar-seg button.on{background:var(--ox); color:#fff;}
.rx-fmbar-seg button:focus-visible{outline:2px solid var(--ox); outline-offset:-2px;}
.rx-fmbar-count{font-family:var(--mono); font-size:11px; color:var(--muted); margin-left:auto;}
.rx-fmbar-note{font-size:12px; color:var(--ink2); line-height:1.5; margin:0 2px 12px;}
.rx-fmbar-note b{color:var(--ink);}

/* ============================ v3 · PHASE C4-PKPD ============================ */
.rx-pkpd-grid{display:grid; grid-template-columns:repeat(3,1fr); gap:12px;}
.rx-pkpd-card{background:var(--panel); border:1px solid var(--line); border-top:3px solid var(--ox); border-radius:14px 4px 14px 4px; padding:14px 15px;}
.rx-pkpd-h{display:flex; align-items:center; gap:7px; font-family:var(--sans); font-size:13px; font-weight:700; color:var(--ink); margin-bottom:7px;}
.rx-pkpd-h svg{color:var(--ox); flex:0 0 auto;}
.rx-pkpd-tgt{font-family:var(--mono); font-size:12px; color:var(--ox); margin-bottom:7px;}
.rx-pkpd-ag{font-size:11.5px; color:var(--muted); line-height:1.45; margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid var(--line2);}
.rx-pkpd-do{font-size:12px; color:var(--ink2); line-height:1.5;}

/* ============================ v3 · PHASE D1 ============================ */
.rx-cmp{border:1px solid var(--line); border-radius:13px; background:var(--panel); padding:15px 16px; margin:0 0 18px;}
.rx-cmp-head{display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:12px;}
.rx-cmp-h{display:flex; align-items:center; gap:8px; font-family:var(--serif); font-size:16px; font-weight:600; color:var(--ink);}
.rx-cmp-h svg{color:var(--ox);}
.rx-cmp-diff{font-family:var(--mono); font-size:11px; color:var(--ox); font-weight:600;}
.rx-cmp-pickers{display:flex; align-items:center; gap:12px; margin-bottom:14px;}
.rx-cmp-pick{flex:1; min-width:0; display:flex; gap:6px;}
.rx-cmp-sel{flex:1; min-width:0; font-family:var(--sans); font-size:12.5px; color:var(--ink); background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:8px 10px; cursor:pointer;}
.rx-cmp-sel:focus-visible{outline:2px solid var(--ox); outline-offset:1px;}
.rx-cmp-open{flex:0 0 auto; width:34px; border:1px solid var(--line); background:var(--paper); color:var(--ink2); border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .14s,color .14s;}
.rx-cmp-open:hover{background:var(--ox-soft); color:var(--ox); border-color:var(--ox-line);}
.rx-cmp-vs{font-family:var(--mono); font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); font-weight:600; flex:0 0 auto;}
.rx-cmptable{width:100%; border-collapse:collapse; font-size:12.5px;}
.rx-cmptable thead th{font-family:var(--mono); font-size:9.5px; letter-spacing:.06em; text-transform:uppercase; color:var(--muted); font-weight:600; text-align:left; padding:7px 8px; border-bottom:1px solid var(--line);}
.rx-cmptable thead th:not(:first-child){text-align:center; width:96px;}
.rx-cmptable td{padding:6px 8px; border-bottom:1px solid var(--line2); text-align:center;}
.rx-cmptable td.rx-cmp-org{text-align:left; font-weight:500; color:var(--ink); font-style:italic;}
.rx-cmptable tr.rx-cmp-div td{background:var(--amber-soft);}
.rx-cmptable tr.rx-cmp-div td.rx-cmp-org{font-weight:700;}
.rx-cmp-flag{font-style:normal; color:var(--amber); font-weight:700; margin-left:7px; font-family:var(--mono);}
.rx-cmpcell{display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:6px; font-family:var(--mono); font-size:11px; font-weight:700;}
.rx-cmpcell.cl-first{background:var(--green); color:#fff;}
.rx-cmpcell.cl-sec{background:var(--blue-soft); color:var(--blue); border:1px solid var(--blue-line);}
.rx-cmpcell.cl-var{background:var(--amber-soft); color:var(--amber); border:1px solid var(--amber-line);}
.rx-cmpcell.cl-intr{background:var(--ox); color:#fff;}
.rx-cmpcell.cl-none,.rx-cmpcell.cl-na{background:transparent; color:var(--faint);}
.rx-cmp-legend{display:flex; flex-wrap:wrap; gap:14px; margin-top:12px; font-size:11px; color:var(--ink2);}
.rx-cmp-leg{display:inline-flex; align-items:center; gap:6px;}

/* ============================ v3 · PHASE D5 ============================ */
.rx-heptable{width:100%; border-collapse:collapse; font-size:12.5px;}
.rx-heptable thead th{font-family:var(--mono); font-size:9.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); font-weight:600; text-align:left; padding:9px 14px; background:var(--line2); border-bottom:1px solid var(--line);}
.rx-heptable td{padding:10px 14px; border-bottom:1px solid var(--line2); vertical-align:top; line-height:1.45;}
.rx-heptable tbody tr:last-child td{border-bottom:none;}
.rx-heptable tbody tr:hover td{background:var(--ox-softer);}
.rx-hep-ag{white-space:nowrap; width:170px;}
.rx-hep-c{color:var(--ink2);}

/* ===================== v3 · CLASS POPOVERS (rx chips) ===================== */
.rx-clschip{ border-bottom:1px dashed var(--ox); color:var(--ox); cursor:pointer; border-radius:3px; padding:0 1px; transition:background .12s; }
.rx-clschip:hover, .rx-clschip.on{ background:var(--ox-softer); }
.rx-clschip:focus-visible{ outline:2px solid var(--ox); outline-offset:2px; }
.rx-clspop{ position:fixed; z-index:200; width:320px; max-width:92vw; background:var(--paper); border:1px solid var(--line); border-radius:12px;
  box-shadow:0 18px 48px -16px rgba(27,25,22,.45), 0 2px 8px -2px rgba(27,25,22,.18); padding:12px 13px; display:block; animation:rxclpop .12s ease; }
@keyframes rxclpop{ from{opacity:0;} to{opacity:1;} }
.rx-clspop.up{ transform:translateY(-100%); }
@media (prefers-reduced-motion: reduce){ .rx-clspop{ animation:none; } }
.rx-clspop-h{ display:block; font-family:var(--sans); font-weight:700; font-size:12.5px; color:var(--ink); }
.rx-clspop-blurb{ display:block; font-size:11.5px; color:var(--muted); line-height:1.45; margin:4px 0 9px; }
.rx-clspop-list{ display:flex; flex-direction:column; gap:3px; }
.rx-clspop-ag{ display:flex; align-items:flex-start; gap:9px; text-align:left; width:100%; background:none; border:none; border-radius:8px; padding:7px 8px; cursor:pointer; transition:background .12s; }
.rx-clspop-ag:hover{ background:var(--ox-softer); }
.rx-clspop-ag:focus-visible{ outline:2px solid var(--ox); outline-offset:-2px; }
.rx-clspop-ag > svg{ margin-left:auto; align-self:center; color:var(--faint); flex:0 0 auto; }
.rx-clspop-ag:hover > svg{ color:var(--ox); }
.rx-clspop-rank{ flex:0 0 auto; font-family:var(--mono); font-size:8.5px; letter-spacing:.05em; text-transform:uppercase; font-weight:700; border-radius:5px; padding:3px 6px; margin-top:1px; min-width:54px; text-align:center; }
.rx-clspop-rank.r-preferred{ background:var(--green); color:#fff; }
.rx-clspop-rank.r-alternative{ background:var(--blue-soft); color:var(--blue); border:1px solid var(--blue-line); }
.rx-clspop-rank.r-reserve{ background:var(--amber-soft); color:var(--amber); border:1px solid var(--amber-line); }
.rx-clspop-txt{ display:flex; flex-direction:column; gap:2px; min-width:0; }
.rx-clspop-txt .n{ font-size:12.5px; font-weight:600; color:var(--ink); line-height:1.25; }
.rx-clspop-txt .w{ font-size:11px; color:var(--muted); line-height:1.4; }

/* ---- term glossary chips (definitions) ---- */
.rx-termchip{ border-bottom:1px dotted var(--muted); cursor:help; border-radius:3px; padding:0 1px; transition:background .12s; }
.rx-termchip:hover, .rx-termchip.on{ background:var(--line3); }
.rx-termchip:focus-visible{ outline:2px solid var(--ox); outline-offset:2px; }
.rx-glosspop{ width:300px; }
.rx-gloss-ab{ display:block; font-family:var(--mono); font-size:10px; letter-spacing:.04em; color:var(--ox); font-weight:600; margin-top:2px; }
.rx-gloss-see{ display:flex; align-items:center; gap:6px; font-size:11px; color:var(--muted); margin-top:9px; padding-top:8px; border-top:1px solid var(--line2); }
.rx-gloss-see svg{ flex:0 0 auto; color:var(--faint); }

/* ===================== v3 · DOSE-ADJUSTMENT BAR ===================== */
.rx-adjbar{ display:flex; flex-wrap:wrap; align-items:baseline; gap:8px 12px; margin:7px 0 2px; padding:8px 11px;
  background:var(--ox-softer); border:1px solid var(--ox-line); border-left:3px solid var(--ox); border-radius:8px; }
.rx-adjbar-lab{ display:inline-flex; align-items:center; gap:4px; font-family:var(--mono); font-size:9px; letter-spacing:.1em; text-transform:uppercase; color:var(--ox); font-weight:700; flex:0 0 auto; }
.rx-adjbar-lab svg{ flex:0 0 auto; }
.rx-adjbar-items{ display:flex; flex-wrap:wrap; gap:6px 8px; }
.rx-adj{ display:inline-flex; flex-wrap:wrap; align-items:center; gap:5px; font-size:12px; line-height:1.3; background:var(--paper); border:1px solid var(--line2); border-radius:7px; padding:3px 7px 3px 4px; }
.rx-adj-tag{ font-family:var(--mono); font-size:7.5px; letter-spacing:.05em; font-weight:700; color:#fff; border-radius:4px; padding:2px 4px; flex:0 0 auto; }
.adj-renal .rx-adj-tag{ background:var(--ox); }
.adj-weight .rx-adj-tag{ background:var(--blue); }
.adj-hepatic .rx-adj-tag{ background:var(--amber); }
.adj-hd .rx-adj-tag{ background:var(--ink2); }
.rx-adj-ag{ font-weight:600; color:var(--ink); background:none; border:none; padding:0; cursor:pointer; border-bottom:1px dotted var(--muted); }
.rx-adj-ag:hover{ color:var(--ox); border-bottom-color:var(--ox); }
.rx-adj-ag:focus-visible{ outline:2px solid var(--ox); outline-offset:2px; border-radius:2px; }
.rx-adj-lab{ font-family:var(--mono); font-size:10.5px; color:var(--muted); }
.rx-adj-arr{ color:var(--faint); flex:0 0 auto; }
.rx-adj-val{ font-weight:600; color:var(--ox-deep); font-variant-numeric:tabular-nums; }
.adj-hepatic .rx-adj-val, .adj-hd .rx-adj-val{ font-weight:500; color:var(--ink2); font-size:11.5px; }
.rx-adj-basis{ flex-basis:100%; font-family:var(--mono); font-size:9.5px; letter-spacing:.01em; color:var(--muted); line-height:1.3; padding-left:2px; }
.rx-adj-basis::before{ content:"↳ "; color:var(--blue); font-family:var(--sans); }

/* ===================== v3 · SOURCE-CONTROL BANNER ===================== */
.rx-srcctrl{ display:flex; align-items:flex-start; gap:10px; margin:0 0 14px; padding:11px 13px;
  background:var(--ox-soft); border:1px solid var(--ox-line); border-left:3px solid var(--ox); border-radius:9px;
  font-size:12.5px; line-height:1.5; color:var(--ink); }
.rx-srcctrl svg{ flex:0 0 auto; color:var(--ox); margin-top:1px; }
.rx-srcctrl b{ color:var(--ox-deep); }

/* ===================== v3 · REGIMEN REASONING TRAIL ===================== */
.rx-reg-why{ display:flex; align-items:flex-start; gap:6px; margin-top:6px; font-size:11.5px; color:var(--green); font-style:italic; line-height:1.4; }
.rx-reg-why svg{ flex:0 0 auto; margin-top:2px; color:var(--green); }
.rx-dc-h-quiet{ color:var(--muted) !important; }
.rx-reg-omit{ display:flex; align-items:baseline; gap:8px; flex-wrap:wrap; padding:6px 0; border-bottom:1px dashed var(--line2); font-size:12px; }
.rx-reg-omit:last-child{ border-bottom:none; }
.rx-reg-omit-k{ font-weight:600; color:var(--ink2); }
.rx-reg-omit-why{ color:var(--muted); font-size:11.5px; }

/* B3 · auto-assembly refinement decision trail */
.rx-rf{ margin-top:4px; }
.rx-rf-step{ display:flex; align-items:flex-start; gap:10px; padding:9px 11px; border:1px solid var(--line2); border-left-width:3px; border-radius:8px; margin-bottom:7px; background:var(--paper2); }
.rx-rf-step.high{ border-left-color:var(--ox); background:var(--ox-softer); }
.rx-rf-step.med{ border-left-color:var(--amber); }
.rx-rf-step.low{ border-left-color:var(--blue); }
.rx-rf-ic{ flex:0 0 auto; margin-top:1px; }
.rx-rf-step.high .rx-rf-ic{ color:var(--ox); }
.rx-rf-step.med .rx-rf-ic{ color:var(--amber); }
.rx-rf-step.low .rx-rf-ic{ color:var(--blue); }
.rx-rf-body{ min-width:0; flex:1; }
.rx-rf-head{ font-size:12.5px; line-height:1.4; color:var(--ink); }
.rx-rf-verb{ font-family:var(--mono); font-size:8.5px; letter-spacing:.1em; text-transform:uppercase; font-weight:700; padding:2px 6px; border-radius:5px; margin-right:7px; vertical-align:1px; }
.rx-rf-step.high .rx-rf-verb{ background:var(--ox); color:#fff; }
.rx-rf-step.med .rx-rf-verb{ background:var(--amber); color:#3a2a00; }
.rx-rf-step.low .rx-rf-verb{ background:var(--blue); color:#fff; }
.rx-rf-ag{ font-weight:600; color:var(--ink); }
.rx-rf-strike{ text-decoration:line-through; text-decoration-color:var(--ox); color:var(--muted); }
.rx-rf-to{ color:var(--muted); margin:0 5px; }
.rx-rf-reason{ font-size:11.5px; color:var(--ink2); line-height:1.45; margin-top:4px; }
.rx-rf-reason .rx-cite{ margin-left:5px; }
.rx-rf-clean{ display:flex; align-items:center; gap:8px; font-size:12px; color:var(--green); padding:9px 11px; border:1px solid var(--green-line); background:var(--green-soft); border-radius:8px; }
.rx-rf-final{ margin-top:9px; padding:10px 12px; border:1px solid var(--ox-line); border-radius:8px; background:var(--paper); }
.rx-rf-final-lab{ font-family:var(--mono); font-size:8.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ox); font-weight:600; margin-bottom:4px; }
.rx-rf-final-rx{ font-size:13px; color:var(--ink); line-height:1.5; }

/* ===================== B4 · DE-ESCALATION SUGGESTER ===================== */
.rx-deesc-sug{ margin-top:12px; border:1px solid var(--ox-line); border-radius:9px; background:var(--paper); overflow:hidden; }
.rx-deesc-sug-h{ display:flex; align-items:center; gap:7px; flex-wrap:wrap; padding:8px 12px; background:var(--ox-softer); border-bottom:1px solid var(--ox-line);
  font-family:var(--mono); font-size:10px; letter-spacing:.1em; text-transform:uppercase; font-weight:700; color:var(--ox); }
.rx-deesc-sug-h svg{ color:var(--ox); flex:0 0 auto; }
.rx-deesc-sug-sub{ font-family:var(--sans); font-size:10.5px; letter-spacing:0; text-transform:none; font-weight:500; color:var(--muted); }
.rx-deesc-row{ display:grid; grid-template-columns:minmax(116px, 158px) 1fr; gap:11px; padding:9px 12px; border-bottom:1px solid var(--line2); align-items:start; }
.rx-deesc-row:last-child{ border-bottom:none; }
.rx-deesc-org{ display:inline-flex; align-items:flex-start; gap:5px; font-size:12px; font-weight:600; color:var(--ink);
  background:none; border:none; padding:0; cursor:pointer; text-align:left; line-height:1.35; }
.rx-deesc-org svg{ flex:0 0 auto; margin-top:2px; color:var(--muted); }
.rx-deesc-org:hover{ color:var(--ox); }
.rx-deesc-org:hover svg{ color:var(--ox); }
.rx-deesc-org:focus-visible{ outline:2px solid var(--ox); outline-offset:2px; border-radius:4px; }
.rx-deesc-detail{ min-width:0; display:flex; flex-direction:column; gap:7px; }
.rx-deesc-narrow{ font-size:12px; color:var(--ink); line-height:1.45; }
.rx-deesc-variant{ display:inline-block; font-family:var(--mono); font-size:8px; letter-spacing:.05em; text-transform:uppercase; color:var(--muted);
  background:var(--paper2); border:1px solid var(--line2); border-radius:4px; padding:1px 5px; margin-right:6px; vertical-align:1.5px; }
.rx-deesc-to svg{ color:var(--ox); vertical-align:-2px; margin-right:3px; }
.rx-deesc-cav{ display:block; font-size:11px; color:var(--ink2); line-height:1.42; margin-top:3px; }
.rx-deesc-cav-derived{ color:var(--muted); font-style:italic; }
.rx-deesc-stop{ display:flex; align-items:flex-start; gap:5px; font-size:11px; color:var(--muted); line-height:1.4; }
.rx-deesc-stop svg{ flex:0 0 auto; margin-top:2px; color:var(--amber); }
.rx-deesc-stop b{ color:var(--ink2); font-weight:600; }
.rx-deesc-drug{ background:none; border:none; padding:0; font:inherit; color:var(--ox); font-weight:600; cursor:pointer;
  text-decoration:underline; text-decoration-color:var(--ox-line); text-underline-offset:2px; }
.rx-deesc-drug:hover{ text-decoration-color:var(--ox); }
.rx-deesc-drug:focus-visible{ outline:2px solid var(--ox); outline-offset:2px; border-radius:3px; }
@media (max-width:520px){ .rx-deesc-row{ grid-template-columns:1fr; gap:5px; } }

/* ===================== v3 · CARD COPY-OUT ===================== */
.rx-cardfoot{ display:flex; justify-content:flex-end; margin-top:14px; padding-top:12px; border-top:1px solid var(--line2); }
.rx-cardcopy{ display:inline-flex; align-items:center; gap:6px; font-family:var(--sans); font-size:11.5px; font-weight:600; color:var(--ink2);
  background:var(--paper2); border:1px solid var(--line); border-radius:7px; padding:6px 11px; cursor:pointer; transition:background .12s, border-color .12s; }
.rx-cardcopy:hover{ background:var(--ox-softer); border-color:var(--ox-line); color:var(--ox); }
.rx-cardcopy:focus-visible{ outline:2px solid var(--ox); outline-offset:2px; }
.rx-cardcopy svg{ flex:0 0 auto; }

/* ===================== v3 · INTERACTION LAYER ===================== */
.rx-ix-list{ display:flex; flex-direction:column; gap:8px; }
.rx-ix{ display:flex; flex-direction:column; gap:3px; padding:9px 11px; border-radius:8px; border:1px solid var(--line2); background:var(--paper2); border-left:3px solid var(--muted); }
.rx-ix-major{ border-left-color:var(--ox); background:var(--ox-softer); }
.rx-ix-moderate{ border-left-color:var(--amber); }
.rx-ix-head{ display:flex; align-items:center; gap:7px; flex-wrap:wrap; }
.rx-ix-sev{ font-family:var(--mono); font-size:8px; letter-spacing:.06em; text-transform:uppercase; font-weight:700; color:#fff; border-radius:4px; padding:2px 5px; flex:0 0 auto; }
.rx-ix-sev-major{ background:var(--ox); }
.rx-ix-sev-moderate{ background:var(--amber); }
.rx-ix-tag{ font-family:var(--sans); font-size:11.5px; font-weight:700; color:var(--ink); }
.rx-ix-pair{ font-family:var(--mono); font-size:8.5px; letter-spacing:.05em; text-transform:uppercase; color:var(--ox); background:var(--ox-softer); border:1px solid var(--ox-line); border-radius:4px; padding:1px 5px; }
.rx-ix-ag{ font-family:var(--sans); font-size:11.5px; font-weight:700; color:var(--ink); background:none; border:none; padding:0; cursor:pointer; border-bottom:1px dotted var(--muted); }
.rx-ix-ag:hover{ color:var(--ox); border-bottom-color:var(--ox); }
.rx-ix-ag:focus-visible{ outline:2px solid var(--ox); outline-offset:2px; }
.rx-ix-with{ font-size:11.5px; color:var(--ink2); }
.rx-ix-with b{ color:var(--ink); font-weight:600; }
.rx-ix-mech{ font-size:11.5px; color:var(--muted); line-height:1.45; }
.rx-ix-singles{ margin-top:10px; }
.rx-ix-singles-lab{ font-size:11px; color:var(--muted); font-style:italic; margin-bottom:6px; }
`;

/* ============================================================================
   CSS5 · Bedside-mode scope (Phase A.3 · mobile-first density pass).
   The Phase A surfaces (Case Bar, Answer Canvas) use scoped inline styles
   for most rendering; this block adds the responsive rules and touch-
   friendly affordances that can't be expressed inline cleanly. Scoped to
   `.rx-bedside` so it never leaks into the classic UI.
   ========================================================================== */
const CSS5 = `
/* ─────────────────────────────── Wave 6 W6-B · paper texture + ambient ────────
   Adds two additive ambient layers to the bedside surface so the page reads
   as high-quality printed paper rather than a screen:

     Layer 1 — SVG noise grain. A 240×240 fractalNoise tile painted at very
     low alpha through ::before, multiplied into the surface so the warm
     paper tones bleed through. Data-URI'd so no asset request. Effective
     opacity ≤8% (0.045 wrapper × subtle alpha LUT in the SVG itself).

     Layer 2 — radial ambient gradient. A barely-visible warm wash from the
     top-left (--ox-soft) and a cooler paper2 pool from the bottom-right.
     Lifts the page off pure flat color without competing with content.

   Both layers sit at z-index: -1 on ::before / ::after pseudos and are
   contained by isolation:isolate on .rx-bedside so they never bleed into
   ancestors. Content (.rx-bedside-container and everything inside) stays
   above by virtue of normal stacking on positioned elements.

   Honors prefers-reduced-motion implicitly — neither layer animates, both
   are static decoration that stays put regardless of motion preference. */
.rx-bedside{
  padding: 32px 22px 80px;
  min-height: 100vh;
  position: relative;
  isolation: isolate;
}
.rx-bedside::before{
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='0 .04 .04 .06 .04 0'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 240px 240px;
  background-repeat: repeat;
  mix-blend-mode: multiply;
  opacity: 0.045;
}
.rx-bedside::after{
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image:
    radial-gradient(ellipse 80% 50% at 20% 0%, color-mix(in srgb, var(--ox-soft) 20%, transparent) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 100% 100%, color-mix(in srgb, var(--paper2) 50%, transparent) 0%, transparent 70%);
}
.rx-bedside :focus-visible{ outline: 2px solid var(--ox); outline-offset: 2px; border-radius: 3px; }

/* The Case Bar's free-text input must shrink to the viewport on narrow
   screens — its parent uses flex so this forces it to honour the
   container width. */
.rx-bedside input[type="text"]{ width: 100%; min-width: 0; }

/* Touch targets — bedside is phones-in-a-coat-pocket; bring buttons up to
   ~38 px tappable height on mobile. The classic UI keeps its tighter
   desktop spacing since it has the room. */
@media (max-width: 540px){
  .rx-bedside{ padding: 20px 14px 60px; }
  .rx-bedside button{ min-height: 38px; }
  .rx-bedside button[aria-label="Clear input"]{ min-height: 36px; }
  /* The header row (Classic-mode + Bedside label) can run out of room — wrap. */
  .rx-bedside h1{ font-size: 26px !important; }
  /* The answer-header strip's syndrome name + Edit button should stack rather
     than overflow on the narrowest devices. The strip uses inline flex with
     a gap; this lets it wrap. */
  .rx-bedside [data-bedside-header-strip]{ flex-wrap: wrap; }
}

/* Phase A5 — split-editor side-rail. When the user clicks Edit on an
   established case, the Case Bar slides in as a fixed-width rail on the
   left while the Answer Canvas keeps the rest of the screen. On narrow
   viewports (< 880 px) the layout stacks so the rail and answer don't
   crush each other; the rail is then a sticky strip above the canvas.
   This replaces the prior modal-flip behaviour, where editing hid the
   answer entirely and the user lost their reference point. */
.rx-bedside-split{
  display: grid;
  grid-template-columns: minmax(320px, 360px) 1fr;
  gap: 18px;
  align-items: start;
}
.rx-bedside-split .rx-bedside-rail{
  position: sticky;
  top: 12px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 14px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
}
@media (max-width: 880px){
  .rx-bedside-split{ grid-template-columns: 1fr; }
  .rx-bedside-split .rx-bedside-rail{
    position: static;
    max-height: none;
  }
}

/* Honour reduced motion (the global rx-root rule applies inside this scope
   already via inheritance). */
@media (prefers-reduced-motion: reduce){
  .rx-bedside *,
  .rx-bedside *::before,
  .rx-bedside *::after{ transition-duration: .01ms !important; animation-duration: .01ms !important; }
}

/* ─────────────────────────────── Wave 6 W6-B · print stylesheet ───────────────
   When a clinician prints (or saves as PDF) an answer canvas they get a
   typographically considered handoff page — not the screen UI with
   throwaway buttons and oxblood headers blasted into ink. Strip every
   interactive affordance, retain content + structure, narrow margins.
   Tested visually via Cmd/Ctrl+P; not in the e2e gate. */
@media print {
  /* High-contrast monochrome bias; let serif headings and body do the
     hierarchy work without color. */
  .rx-bedside,.rx-root{ background:#fff!important; color:#111!important; }
  .rx-bedside *{ background:transparent!important; box-shadow:none!important; }
  /* Suppress the paper-texture + ambient pseudo-elements on print —
     the printer renders real paper; we don't need a simulation. */
  .rx-bedside::before,.rx-bedside::after{ display:none!important; }
  /* Hide UI chrome that has no meaning on paper. */
  .rx-bedside-rail,.rx-header,.rx-nav,.rx-builder,.rx-toolbar,
  [data-bedside-header-strip] button,
  .rx-bedside-container > div:first-child > div:nth-child(1),
  .rx-bedside-container > div:first-child > div:nth-child(2),
  button,[role="button"]:not([data-print-keep]){ display:none!important; }
  /* Keep severity coding readable without color saturation. */
  .rx-tag,.rx-chip{ border:1px solid #333!important; background:transparent!important; color:#111!important; box-shadow:none!important; }
  /* Section chrome → underline only. */
  [data-testid$="-block"],section{ border:none!important; padding:0!important; margin:0 0 12pt 0!important; }
  /* Page breaks avoid orphaning a kicker from its body. */
  h1,h2,h3,h4,.rx-h1,.rx-h2,.rx-h3,.rx-h4{ break-after:avoid-page; page-break-after:avoid; }
  /* Footer-style disclaimer prepended below the answer. */
  .rx-bedside-container::after{
    content:"Inpatient Antibiotic Guide · Decision support only. Verify every order against the local antibiogram and clinical pharmacy. Generated " attr(data-print-date);
    display:block; margin-top:18pt; padding-top:8pt; border-top:1pt solid #333;
    font-size:9pt; color:#444; font-style:italic;
  }
}
`;

export { CSS, CSS2, CSS3, CSS4, CSS5 };
