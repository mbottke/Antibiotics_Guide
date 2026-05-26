# Inpatient Antibiotic Guide

Inpatient Antibacterial Reference & Selection Engine for adult hospital medicine —
empiric regimen assembly, context-driven refinement, organism-directed
de-escalation, the 49×49 spectrum matrix, patient-specific dosing, and a bedside
answer canvas with snapshot-only course updates.

> **Decision support only.** Not a substitute for the local antibiogram, current
> primary guidelines, clinical pharmacy, or infectious-diseases consultation.
> Antibacterials only. Verify every order.

This repository is the build-tooled home for what was previously a single ~7,500-line
artifact. Phases 1–4 (build / tokens / module split / CI) and Wave 5 (bedside
reframe + content stewardship) are merged. Waves 6 → 10 layered a comprehensive
visual + interaction overhaul on top — neon-cyan reframe, magazine typography,
mesh-gradient heroes, chrome + frosted-glass utilities, cursor-driven 3D motion,
asymmetric card geometry, and atomized polish across every surface. **Wave 11** is
in flight on `claude/upbeat-maxwell-Zv3On` (PR #140).

---

## Quick start

```bash
npm install
npm run dev        # Vite dev server (regenerates tokens first)
npm run build      # production build to dist/  (regenerates tokens first)
npm run preview    # serve the production build
npm run tokens     # regenerate src/styles/tokens.css from tokens/tokens.json
npm run typecheck  # tsc --noEmit (strict on .ts/.tsx; App.jsx is allowJs, unchecked)
npm run test       # Vitest — unit + integrity + RTL (no browser, ~20s)
npm run test:e2e   # Playwright — render + a11y vs production build
npm run verify     # the full gate chain CI runs
```

Requires Node 18+.

---

## Architecture

```
inpatient-abx-guide/
├── index.html                      # Vite entry; loads Lora / DM Sans / IBM Plex Mono via <link>
├── vite.config.ts
├── tsconfig.json                   # allowJs:true, checkJs:false (incremental TS)
├── tsconfig.node.json
├── tokens/
│   └── tokens.json                 # ← SINGLE SOURCE OF TRUTH for the design system
├── scripts/
│   └── build-tokens.mjs            # tokens.json → src/styles/tokens.css
└── src/
    ├── main.tsx                    # imports tokens.css, mounts <App/>
    ├── App.jsx                     # root — composes every layer, injects styles, owns app state
    ├── lib/
    │   └── util.js                 # pure string/token/route helpers — DAG layer 0
    ├── data/                       # pure tables (import lib + lucide only)
    │   ├── organisms.js            #   organisms, resistance, MRSA/GNR matrices, compare
    │   ├── drugs.js                #   formulary, classes/aliases, penetration, tox, interactions
    │   ├── dosing.js               #   renal/weight/hepatic/HD tables + adjustment metadata
    │   ├── syndromes/              #   per-syndrome content modules + _index aggregator (Wave 5 PR-1/2)
    │   ├── syndromeDecision.js     #   decision content (duration, monitoring, rationale, objections)
    │   ├── regimenContent.js       #   empiric prose + tiers per syndrome
    │   ├── diagnostics.js          #   diagnostic stewardship per syndrome (Wave 5 PR-6)
    │   ├── mechanisms.js           #   class + resistance mechanism content (Wave 5 PR-7)
    │   ├── opatDecision.js         #   OPAT eligibility / access / agents per syndrome (Wave 5 PR-8)
    │   ├── evidence.js             #   guidelines, refs, trials, durations, version
    │   ├── content.js              #   allergy, special pops, prophylaxis, OPAT (legacy), trees, glossary
    │   ├── risk-keywords.js        #   host/resistance risk patterns for the selector
    │   ├── combinedRisks.js        #   risk synthesis for the answer canvas
    │   ├── regionalResistance.js / novelAgents.js / surgeProtocols.js / sitePenetration.js / pedsPregDosing.js
    │   ├── sections.js             #   5-section IA registry (Syndromes / Agents / Organisms / Compare / Principles)
    │   └── ui-maps.js              #   icon maps + tab definitions
    ├── engines/                    # pure logic (import lib + data + spectrum) — browser-free testable
    │   ├── dosing.js               #   dose computation + renal/hepatic/weight derivation
    │   ├── lookup.js               #   knowledge-graph lookups (drug↔monograph, organism, spectrum)
    │   ├── regimen.js              #   empiric assembly, refineOnNewFinding, organism-directed de-escalation
    │   ├── regimenCompare.js       #   four-dimensional symmetric regimen vs regimen diff (Wave 5 PR-5b)
    │   ├── regimenOptions.js       #   multi-option presentation + microbiome sort
    │   ├── case-parser.js          #   free-text → caseState parser w/ DRUG_RX_UNION (Wave 5 PR-5c)
    │   ├── ctxMatch.js             #   matchCtx predicate evaluator (every "matched X" elevation)
    │   ├── clinical.js             #   penetration, allergy, interactions, evidence, class/glossary
    │   ├── integrity.js            #   referential self-check — shared by App (console) + CI (gate)
    │   └── antibiogramStore.js     #   localStorage CRUD for BYO antibiograms (Wave 4)
    ├── sections/                   # the 5-section reference IA (each is a magazine spread)
    │   ├── SyndromesSection.jsx    #   editorial gallery — 3-up grid, sticky filter rail, KPI tiles
    │   ├── AgentsSection.jsx       #   Apple-style spec sheet — formulary / dose / safety
    │   ├── OrganismsSection.jsx    #   field-guide — taxonomic rail + directed therapy + MRSA/GNR
    │   ├── CompareSection.jsx      #   spectrum / penetration / mechanisms / regimens compare
    │   └── PrinciplesSection.jsx   #   magazine essay — approach / course / adjuncts
    ├── components/                 # JSX (import lib + data + engines + react/lucide)
    │   ├── AnswerCanvas.jsx        #   bedside answer surface — Wave 5 PR-3 layer registry + Wave 8 W8-A reframe
    │   ├── answer-layers/          #   18+ layer modules (covers / start / deesc / duration / monitoring / opat / pkpd / diagnostics / pearls / reasoning / research / objections / novel / surge / peds-preg / regional / microbiome / antibiogram / mechanism)
    │   ├── BedsideShell.jsx        #   bedside surface — ChromeBand wrapper, density toggle, settings
    │   ├── OutpatientShell.jsx     #   placeholder (Wave 11)
    │   ├── SurfaceBar.jsx          #   inpatient ↔ outpatient × reference ↔ decide
    │   ├── SectionNav.jsx          #   5-section nav chip rail (cyan progress strip)
    │   ├── ScrollHeader.jsx        #   sticky chrome band — frosts on scroll + 2px gradient progress
    │   ├── GlobalScrollProgress.jsx #  viewport-fixed scroll progress bar
    │   ├── BrandMark.jsx           #   gradient compass + cyan halo + pixel-grid backdrop
    │   ├── DensityToggle.jsx       #   compact / comfortable / spacious chrome pill
    │   ├── FontSizeControl.jsx     #   glass track + italic-serif % display
    │   ├── CaseBar.jsx             #   structured + free-text case input (chrome shell)
    │   ├── PatientContextStrip.jsx #   horizontal patient-context chip rail
    │   ├── ReassessmentPanel.jsx   #   "Current state" snapshot — what changed today
    │   ├── RegimenOptions.jsx      #   multi-option presentation w/ microbiome chips + tilt
    │   ├── AntibiogramBlock.jsx    #   per-syndrome %S overlay
    │   ├── AntibiogramManager.jsx  #   chrome shell editor for BYO antibiograms
    │   ├── DiagnosticsBlock.jsx / OPATBlock / PkPdBlock / MonitoringBlock / DurationBlock / ReasoningTraceBlock / ResearchBlock / RegionalResistanceBlock / NovelAgentsBlock / SurgeProtocolsBlock / PedsPregBlock / CombinedRisksBlock / ObjectionsBlock / MechanismBlock / EmptySection
    │   ├── MechanismDrawer.jsx     #   drawer w/ glass-card body — summary / keypoints / bedside / foundational / papers
    │   ├── DecisionAttributionDrawer.jsx # stepped numeral cards — trace the refinement chain
    │   ├── SettingsModal.jsx       #   glass modal — typography / microbiome sort / shortcuts
    │   ├── KeyboardShortcutsOverlay.jsx # `?` glass overlay — grouped chrome key chips
    │   ├── OnboardingModal.jsx     #   first-visit 3-step welcome (SpotlightCard tilt)
    │   ├── Section.jsx             #   shared section chrome (kicker / icon tile / counter / rail / artwork / split aside / decorative numeral)
    │   ├── SectionGlyph.jsx        #   SVG fleurons (decorative editorial marks)
    │   ├── FootMark.jsx            #   refinement footnote marker (opens DecisionAttributionDrawer)
    │   ├── RxLine.jsx              #   regimen line w/ dose chips + chrome FootMark
    │   ├── decor/                  #   decorative primitives
    │   │   ├── GradientHairline.jsx   #   1px cyan→magenta→lime divider, 4 variants
    │   │   ├── AsymmetricCard.jsx     #   18/4 vs 4/18 alternating corner pattern
    │   │   ├── DottedGrid.jsx         #   ambient dot grid backdrop
    │   │   ├── Stripes.jsx            #   diagonal accent stripe overlay (cyan / magenta / lime / neutral)
    │   │   ├── Sparkle.jsx            #   4-point sparkle SVG — drug-of-choice / special markers
    │   │   ├── WatermarkLetter.jsx    #   oversized italic-serif letter (decorative; removed from heroes in W9)
    │   │   ├── GradientMeshHero.jsx   #   5-blob drifting mesh gradient + glass-fog scrim
    │   │   ├── MeshWash.jsx           #   reusable mesh-wash backdrop (full / band / corner / ambient) × 4 palettes
    │   │   ├── SectionArtwork.jsx     #   140-160px corner decoration (mesh / orb / chrome-curl / prism / blank)
    │   │   ├── NotchedBanner.jsx      #   clipped-corner severity banner (required / trigger / consider / stable / info)
    │   │   ├── StickySubTOC.jsx       #   sticky sub-table-of-contents (pill row or vertical rail)
    │   │   ├── SpotlightCard.jsx      #   wrapper — cursor highlight + tilt
    │   │   └── MiniTOC.jsx            #   right-rail mini TOC (IntersectionObserver-tracked, future page-rail)
    │   ├── util/                   #   small composable hooks
    │   │   ├── useDensity.js          #   data-density attr on documentElement (localStorage)
    │   │   ├── useScrollProgress.js   #   rAF-coalesced scroll listener (returns {scrolled, progress})
    │   │   ├── useCursorHighlight.js  #   cursor-following CSS-var spotlight (--cursor-x/y/-active)
    │   │   ├── useMagnetic.js         #   gentle cursor pull on element
    │   │   ├── useRipple.js           #   pointer-down expand effect
    │   │   ├── useTilt.js             #   cursor-driven 3D perspective tilt
    │   │   ├── useParallaxScroll.js   #   z-axis parallax on scroll
    │   │   ├── useReducedMotion.js    #   prefers-reduced-motion media-query hook
    │   │   ├── useFocusTrap.js        #   WCAG 2.4.3 focus trap for drawers/modals
    │   │   ├── richText.jsx           #   parseBold + RichText shared primitives
    │   │   └── severityStyle.js       #   shared severity → token mapping
    │   ├── primitives.jsx          #   Num, Cite, Ev, BugTag, PDot, ToxDot, CardCopyButton, Drawer (legacy), DoseAdjustBar, ChildPughScorer, SectionDisc
    │   ├── rich-text.jsx           #   ClassChip + TermChip popovers (drug class + resistance terms → mechanism drawer)
    │   └── cards.jsx               #   regimen, drug, organism, trial, IV→PO, MrsaCell, CmpCell, SpectrumCompare
    ├── spectrum/
    │   └── Spectrum.jsx            #   49×49 antibiogram matrix (self-contained IIFE — data + chart + chrome)
    └── styles/
        ├── tokens.css              # GENERATED — do not hand-edit
        ├── app-styles.js           # CSS / CSS2 / CSS3 / CSS4 / CSS5 / CSS_W10 — base app stylesheet
        ├── kinetic-type.js         # KINETIC — display / counter / numeric-mega / weight-shift / mixed-pair / letter-reveal / dropcap-cyan
        ├── microinteractions.js    # MICRO — rx-magnetic / rx-gradient-border / rx-shine-sweep / rx-ripple / rx-glow-trail / rx-fade-in-up
        └── glass.js                # GLASS (W9) — rx-glass-bleed / rx-iridescent-border / rx-chrome-cta / rx-mercury-backdrop / rx-glass-diffuse / rx-light-ring-* / rx-glow-lift / rx-gloss / rx-focus-halo

tests/                              # Vitest — unit + integrity + audit + RTL (61 files, 4829 tests, ~20s)
e2e/                                # Playwright — render + a11y vs production build (desktop Chromium)
.github/workflows/ci.yml            # CI: typecheck + unit/integrity + build + e2e
vitest.config.ts                    # node environment; jsdom opt-in per-file via docblock
playwright.config.ts                # builds + previews dist, single chromium project (mobile pruned in #139)
```

### The module graph

`lib → data → engines → components/sections → root`. **`lib`** depends on nothing;
**`data`** imports only `lib` (+ `lucide`); **`engines`** import `lib`+`data`+`spectrum`
and contain **no JSX** (the clinical logic — dose math, lookups, assembly,
refinement, regimen compare, case parsing — is unit/snapshot-testable without a
browser); **`components` + `sections`** import everything below them;
**`App.jsx`** composes the graph. `spectrum/Spectrum.jsx` is a self-contained IIFE.

`decor/` and `util/` are leaf modules under `components/`: they import React /
lucide / `tokens` only, no business logic. Every animation hook respects
`prefers-reduced-motion`; every cursor-driven hook also no-ops on `pointer: coarse`.

The split used an AST-driven extractor (TypeScript compiler API) that moved exact
symbol spans and auto-wired imports/exports, re-running the full integrity +
render gate after every module.

---

## Design system — the aesthetic vocabulary

The original Brand Kit B (oxblood maroon) was repainted at the token layer in
Wave 7 W7-B. Variable names were preserved — every component consuming `var(--ox)`
keeps working — but values now resolve to a modern editorial graphite + neon-cyan
palette. The contract holds; the brand reads differently.

### Color tokens (138 total — see `tokens/tokens.json`)

**Neutral cascade** (cool slate, replaces warm-cream):
- `--paper` `#FAFAFC` · `--paper2` `#F2F3F7` · `--panel` `#FFFFFF`
- `--ink` `#0B0F14` · `--ink2` `#2E3440` · `--muted` `#5F6473` · `--faint` `#9499A8`
- `--line` `#E2E5EC` · `--line2` `#EDEFF4` · `--line3` `#F6F7FA`

**Primary accent (`--ox*` — repainted in W7-B)**:
- `--ox` `#1F2937` (deep graphite/slate, 12:1 on paper)
- `--ox-deep` `#0B0F14` (near-black for emphasis)
- `--ox-bright` `#00D4FF` (true neon cyan — decorative role)
- `--ox-soft` `#E5F8FC` (cyan wash) · `--ox-softer` `#F4FBFD` · `--ox-line` `#B8E2EE`

**Neon family** (W7-A — the everywhere "look-here" palette):
- `--neon-cyan` `#00D4FF` + `-soft` / `-line` / `-glow`
- `--electric-blue` `#3D7AFF` + `-soft` / `-line` (evidence / trials)
- `--hot-magenta` `#FF3DBC` + `-soft` / `-line` (special / edge-case)
- `--electric-lime` `#86CC1F` + `-soft` / `-line` (stable / IV→PO eligible)
- `--neon-amber` `#FFB627` + `-soft` / `-line` (trigger / caution)
- `--vivid-red` `#FF3358` + `-soft` / `-line` / `-glow` (required / hard-stop)

**Mesh anchors** (W7-A — radial-gradient stops for `GradientMeshHero` + `MeshWash`):
- `--mesh-cyan-anchor` · `--mesh-blue-anchor` · `--mesh-magenta-anchor` · `--mesh-lime-anchor`

**Chrome / steel** (W9 — for chrome-CTA gradients):
- `--steel-light` `#D6DBE3` · `--steel-mid` `#8D95A3` · `--steel-dark` `#3B4252`
- `--gloss-top` (iOS-icon top wash) · `--mercury-ripple-a/-b/-c` (drifting modal layers)

**Semantic** (preserved for clinical content channels):
- `--decision-{start,adjusted,avoid,pending}` · `--evidence-blue` · `--consider-ochre` · `--stable-sage`
- `--amber` `#D97706` (crisp) · `--green` `#10B981` (emerald) · `--blue` `#3B82F6` (electric) · `--red` `#B91C1C` (hard-stop)
- `--sg-*` supergroup tints (gram-positive / Enterobacterales / non-fermenters / fastidious / anaerobes / atypicals / spirochetes)

**Shadows + glows**:
- `--shadow-e0` (hairline) → `--shadow-e7` (deepest, with cyan-tinted halo)
- `--shadow-drawer` · `--shadow-glow-ox` (cyan focus ring + outer halo)

**Motion**:
- `--duration-fast` (120ms) · `--duration-base` (180ms) · `--duration-slow` (320ms)
- `--ease-out` (cubic-bezier(0.16, 1, 0.3, 1)) · `--ease-in-out`

**Spacing** (W6-B density grid):
- `--block-pad` (14px 16px) · `--block-pad-tight` (9px 11px)
- `--block-gap` (12px) · `--block-gap-tight` (6px)

**Fonts**:
- `--serif` Lora (display + italic standfirsts)
- `--sans` DM Sans (body)
- `--mono` IBM Plex Mono (numerals + uppercase labels)

### Stylesheet modules

Five inline-CSS blocks (`CSS` / `CSS2` / `CSS3` / `CSS4` / `CSS5` / `CSS_W10` in
`app-styles.js`) carry the base app stylesheet — typography ramp (`.rx-display` /
`.rx-h1`–`.rx-h4` / `.rx-lede` / `.rx-eyebrow`), card primitives (`.rx-card` with
18/4 asymmetric corners + auto cyan accent strip + hover lift), accordions,
decision-tree nodes, data tables, decision-tag tiles, etc. Every primitive picks
up a fade-in-up cascade with `:nth-child` stagger.

Three companion modules layer on top:

- **`KINETIC`** (`kinetic-type.js`) — magazine type vocabulary: `.rx-display-mega`
  (84px), `.rx-display-xl` (64px), `.rx-display-l` (48px), `.rx-numeric-mega`
  (italic-serif tabular-numerics, cyan), `.rx-counter` / `.rx-counter-strong`,
  `.rx-mixed-pair`, `.rx-weight-shift`, `.rx-letter-reveal`, `.rx-underline-accent`,
  `.rx-dropcap-cyan`.
- **`MICRO`** (`microinteractions.js`) — motion primitives: `.rx-magnetic`,
  `.rx-gradient-border`, `.rx-shine-sweep`, `.rx-ripple` (+ `.rx-ripple-fx`),
  `.rx-glow-trail`, `.rx-fade-in-up`.
- **`GLASS`** (`glass.js` — W9) — chrome physics: `.rx-glass-bleed` (inner edge cyan
  glow on frosted panels), `.rx-iridescent-border` (hue-rotating gradient ring),
  `.rx-chrome-cta` (metallic gradient pill with shimmer sweep + ripple),
  `.rx-mercury-backdrop` (drifting modal scrim), `.rx-glass-diffuse` (heavy frosted
  panel), `.rx-light-ring-{red,amber,cyan}` (neon severity dots), `.rx-glow-lift`
  (spring-overshoot hover with cyan glow trail), `.rx-gloss` (iOS-icon top sheen),
  `.rx-focus-halo` (cyan focus + 24px halo + 36px outer ring).

All animations respect `prefers-reduced-motion: reduce` via global `@media` rules.

### Decor primitives (`src/components/decor/`)

Composable visual pieces that consume the design system without owning state:

- **`GradientHairline`** — 1px cyan-magenta-lime divider; 4 variants; replaces flat 1px borders
- **`Sparkle`** — 4-point neon star; canonical drug-of-choice / "considered" marker
- **`DottedGrid`** — 1px @ low-alpha radial-gradient backdrop
- **`Stripes`** — diagonal `repeating-linear-gradient` accent (cyan / magenta / lime / neutral)
- **`AsymmetricCard`** — wrapper with `tl-br` / `tr-bl` / `all-soft` radius patterns
- **`GradientMeshHero`** — 5-blob drifting mesh + glass-fog scrim + glassmorphic chips (bedside hero)
- **`MeshWash`** — reusable mesh backdrop (full / band / corner / ambient × cyan-magenta-lime / cyan-blue / lime-amber / cyan-only)
- **`SectionArtwork`** — 140-160px corner decoration (mesh / orb / chrome-curl / prism / blank); replaced the giant italic numerals removed in W9
- **`NotchedBanner`** — clipped-corner severity banner with iridescent border + cyan glow (required / trigger / consider / stable / info)
- **`SpotlightCard`** — wraps `useCursorHighlight` + `useTilt` for cursor-driven 3D lift
- **`StickySubTOC`** — IntersectionObserver-tracked sub-section TOC (pill row or rotated rail)
- **`MiniTOC`** — sticky right-rail TOC; primitive shipped, future page-rail integration

### Interaction physics

The bedside surface (and every `.rx-card-interactive`) auto-picks-up:

- **Cursor spotlight** — a single global delegated `mousemove` listener in `App.jsx`
  walks `closest('.rx-card-interactive')` and writes `--cursor-x/y/-active` CSS vars.
  CSS `::after` radial-gradient on each card renders the spotlight. Gated by
  reduced-motion + coarse-pointer.
- **Magnetic CTAs** — rAF-coalesced `mousemove` applies up to 8px pull to every
  `.rx-cta-glow` within an 80px radius.
- **Tilt** — `useTilt` hook on `GradientMeshHero` + `RegimenOptions` cards; cursor
  position drives `perspective(1000px) rotate3d(...)` with `transform-style:
  preserve-3d`. Pointer-driven mesh-blob shift on the hero (blobs move ±6%
  opposite the cursor).
- **Parallax** — `useParallaxScroll` on `WatermarkLetter` for editorial drop-caps
  that drift on scroll.
- **Scroll progress** — viewport-top 2px cyan→blue→magenta gradient strip; the
  bedside spine bar's frosted-glass intensifies as the user scrolls past it.

---

## Roadmap

| Phase | Scope | Status |
|------|-------|--------|
| **1 — Build** | Vite + React + TS shell; single entry; fonts via `<link>` | ✅ done |
| **2 — Tokens** | Consolidate the duplicated token blocks into `tokens.json` → `build-tokens.mjs` → `tokens.css` | ✅ done |
| **3 — Split** | Extract `lib/` + `data/` → `engines/` → `components/` (strict DAG) | ✅ done |
| **4 — CI** | `integrity` · `render` · `a11y` gates on every push/PR | ✅ done |
| **Wave 5 — Bedside reframe** | Per-syndrome modules · Answer Canvas layer registry · refinement engine · diagnostics / OPAT / mechanisms / pkpd / microbiome / regimen compare · RTL harness · closeout | ✅ merged |
| **Wave 6 W6-D — First-impression** | Onboarding modal · keyboard-shortcuts overlay · settings modal | ✅ merged |
| **Wave 6 W6-B — Visual leap** | Typography ramp · semantic palette · paper-texture · cursor-highlight · section glyphs · brand-mark · editorial hero · context strip · 7-agent aesthetic integration | ✅ merged |
| **Wave 7 W7-A — Neon reframe** | 11-agent deployment · kinetic typography · gradient mesh hero · scroll header · density toggle · mini-TOC · decor primitives · motion microinteractions · all section refreshes | ✅ merged (#138) |
| **Wave 7 W7-B — Token repaint** | `--ox*` → graphite + cyan · paper/ink/line cool-neutral · amber/green/blue electric · shadow ramp + cyan glow | ✅ merged (#140 foundation) |
| **Wave 8 — Magazine rewrites** | 5-agent · Answer Canvas reframe (vertical rail + KINETIC + 65/35 splits) · Syndromes editorial gallery · Agents spec-sheet · Compare VS layout · Principles + Organisms magazine · chrome / drawers / modals | 🟦 PR #140 |
| **Wave 9 — Chrome physics + cursor 3D** | 5-agent · SectionArtwork primitive (removes literal numeral watermarks) · GLASS module (edge-bleed / iridescent borders / chrome CTAs / mercury backdrops / light-rings) · cursor-spotlight + tilt + parallax · MeshWash adoption · NotchedBanner + StickySubTOC + spectrum overhaul · hero watermark cleanup | 🟦 PR #140 |
| **Wave 10 — Atomized polish** | 7-agent · answer-layer adoption · chips + tags + badges · forms + inputs · data tables · drawer / modal internals · empty states + density audit · section internals | 🟦 PR #140 |
| **Wave 11 — Polish continuation** | Typography + spacing rationalization · neglected surfaces · interaction-state consistency · iconography sweep | 🟦 in flight |

The Wave 5 PR ledger (~30 individual PRs covering per-syndrome modules + content
tranches + RTL + closeout) is preserved verbatim in the git history; this README
summarizes by phase.

---

## What "Wave 7 → Wave 10" actually changed

The user-facing surface looks fundamentally different from the Phase 4 baseline:

**Color** — every place that used oxblood maroon now reads as deep graphite slate
with neon-cyan accents. The literal token names didn't change (`--ox*` are still
the universal accent contract) so 59 components × 196 occurrences flipped with a
single token-layer repaint. Paper / ink / line went from warm-cream to
cool-neutral. Amber (`#8A5A12` → `#D97706`), green (`#2F5D3A` → `#10B981`), blue
(`#2B4C66` → `#3B82F6`) all moved to crisp electric variants.

**Shape** — every card primitive (`.rx-card`, `.rx-acc`, `.rx-tnode`, `.rx-qc`)
adopted 14-18px / 3-4px asymmetric corners with auto-painted cyan top-left
accent strips. Tables (formulary, allergy, MRSA, GNR, penetration, toxicity,
49×49 spectrum) followed.

**Motion** — every primitive fades-in-up with `:nth-child` stagger on first
paint. Cursor follows cards with a CSS-driven spotlight. Primary CTAs are
magnetic. Hero mesh blobs drift on their own cadences and respond to cursor
position. Tilts on regimen options. Scroll-driven blur intensification on the
spine bar. Reduced-motion gated end-to-end.

**Chrome** — frosted-glass condensing top bar. Drawer panels with backdrop-blur
20px overlays, 4px cyan top strips, 24/4 asymmetric corners. Modal scrims
animate slow mercury ripples. Every focus state carries a cyan halo.

**Typography** — `.rx-h1` / `.rx-h2` / `.rx-h3` clamp(min, vw, max) for
responsive editorial display. Section heroes use 96px italic-serif. `.rx-lede`
collapsed to italic-serif standfirst at 17-19px. `.rx-dropcap-cyan` on first
paragraphs of long sections. `.rx-numeric-mega` on every clinical metric (CrCl,
MIC, dose, %S).

**Hierarchy** — `Section.jsx` carries optional `index` / `total` for a "01 / 17"
counter, `rail` for a 90°-rotated mono left-rail label, `kineticKicker` for big
type kickers, `accent` (cyan / magenta / lime / amber) for palette switching,
`split` + `aside` for 65/35 metadata grids, `artwork` for corner decoration
(mesh / orb / chrome-curl / prism / blank). The bedside vertical spine docks to
the left edge on viewports ≥ 1280px.

**Information density** — Wave 10 ran a cross-surface audit; 6 empty states
became editorial moments, font-size half-step orphans collapsed, line-heights
unified to 1.55-1.65 on body and 1.04-1.2 on display, sibling-card gaps
standardized, padding ranges enforced. Larger rebalances flagged as TODOs
rather than rewritten.

---

## Testing

`npm run verify` runs the full gate chain — exactly what CI runs:
`typecheck → unit (+ integrity + RTL) → build → e2e (render + a11y)`.

```bash
npm run typecheck   # tsc --noEmit (strict on .ts/.tsx; App.jsx is allowJs)
npm run test        # Vitest — 4829 tests across 61 files (no browser, ~20s)
npm run test:e2e    # Playwright — render + a11y vs production build (desktop Chromium)
npm run verify      # all of the above, in CI order
```

**Unit + integrity + RTL (Vitest, `tests/`).**

- `integrity.test.js` — the **single source of truth** for content integrity.
  Every syndrome category, organism bug-id, duration/guideline id, org/drug
  cross-walk entry, dose-table agent, interaction-layer agent, and
  source-control key must resolve; syndrome ids unique.
- `dosing.test.js` — Cockcroft-Gault bands + 0.85 female coefficient, CKD-EPI
  monotonicity, augmented-clearance flagging, vancomycin loading-vs-maintenance,
  HD level-guided routing, Child-Pugh classing.
- `lookup.test.js` — coverage truth table (vancomycin covers MRSA, ceftriaxone
  doesn't; antipseudomonals cover *P. aeruginosa*, metronidazole doesn't).
- `regimen.test.js` — risk-driven empiric assembly + de-escalation.
- `regimenCompare.test.js` — four-dimensional symmetric diff.
- `case-parser-corpus.test.js` — 50-utterance parser-coverage corpus.
- `content-audit.test.js` — apex schema gates for every authored surface
  (regimenContent, syndromeDecision, combinedRisks, FORMULARY
  pkpd/microbiome, diagnostics, mechanisms, OPAT) + R3 typo-resistance probes.
- `answerCanvas-layers.test.js` + `layers-invariants.test.js` — LAYERS registry
  shape, group enum, id-order snapshot, predicate behavior.
- `tests/rtl/` — `// @vitest-environment jsdom` component sentinels for every
  major bedside block + new Wave 7-10 primitives:
  `gradientMeshHero`, `meshWash`, `sectionArtwork`, `notchedBanner`,
  `stickySubTOC`, `spotlightCard`, `densityToggle`, `miniTOC`, `scrollHeader`,
  `useScrollProgress`, `useTilt`, `useParallaxScroll`, `useMagnetic`,
  `useRipple`, `dottedGrid`, `sparkle`, `stripes`, `watermarkLetter`,
  `gradientHairline`, `glassUtilities`, `brandMark`, `editorialHero`,
  `paperTexture`, `sectionGlyph`, `patientContextStrip`, `cursorHighlight`,
  every Wave 5 block + drawer.

**Render + a11y (Playwright, `e2e/`).** Builds the app and serves the
**production** `dist` via `vite preview`, runs against **desktop Chromium**
(mobile pruned in #139 — every check is viewport-agnostic). CI budget ~6-8
min. Asserts:

- The assembled-regimen drawer renders for every category fixture with **zero
  console errors / uncaught exceptions**.
- The clean integrity line logs on load.
- **No primary surface overflows its viewport horizontally** (catches layout
  bugs axe + error-listening miss).
- `@axe-core/playwright` (WCAG 2.1 A/AA) on approach / empiric / spectrum /
  open-drawer surfaces + keyboard-focus assertion.

---

## Deployment (GitHub Pages)

The app is a pure client-side bundle with **relative asset paths** (`vite base:
"./"`) and **hash-based navigation**, so it deploys to a Pages project site
(`https://<user>.github.io/<repo>/`) with no `base` edit and no SPA 404-fallback.

`.github/workflows/deploy.yml` builds and publishes on every push to `main`;
`dist/` is never committed. One-time setup:

1. Push the repo to GitHub (the `deploy.yml` workflow ships in `.github/workflows/`).
2. In the repo: **Settings → Pages → Build and deployment → Source = GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab). The deploy
   job prints the live URL; thereafter every push to `main` redeploys.

To keep the link physician-only, share the URL directly rather than advertising
it — a project-site URL is public but unguessable, and the repo can stay private
(Pages still serves). For true access control, host behind an authenticated
provider instead.

---

## License / provenance

Internal clinical-education tooling. Clinical content reflects sources current
to the build date and will drift — reconfirm against live guidelines before any
bedside use.
