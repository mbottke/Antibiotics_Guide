# Inpatient Antibiotic Guide

Inpatient Antibacterial Reference & Selection Engine for adult hospital medicine —
empiric regimen assembly, context-driven refinement, organism-directed
de-escalation, the spectrum matrix, and patient-specific dosing.

> **Decision support only.** Not a substitute for the local antibiogram, current
> primary guidelines, clinical pharmacy, or infectious-diseases consultation.
> Antibacterials only. Verify every order.

This repository is the build-tooled home for what was previously a single ~7,500-line
artifact. It is being migrated in phases (see [Roadmap](#roadmap)); **Phases 1–4 are
complete. Wave 5 is in flight** — see [Wave 5 status](#wave-5--bedside-reframe-in-flight).

---

## Quick start

```bash
npm install
npm run dev        # Vite dev server (regenerates tokens first)
npm run build      # production build to dist/  (regenerates tokens first)
npm run preview    # serve the production build
npm run tokens     # regenerate src/styles/tokens.css from tokens/tokens.json
npm run typecheck  # tsc --noEmit (checks .tsx/.ts; App.jsx is allowJs, unchecked)
```

Requires Node 18+.

---

## Architecture

```
inpatient-abx-guide/
├── index.html                  # Vite entry; loads fonts via <link>
├── vite.config.ts
├── tsconfig.json               # allowJs:true, checkJs:false (incremental TS)
├── tsconfig.node.json
├── tokens/
│   └── tokens.json             # ← SINGLE SOURCE OF TRUTH for the design system
├── scripts/
│   └── build-tokens.mjs        # tokens.json → src/styles/tokens.css
└── src/
    ├── main.tsx                # imports tokens.css, mounts <App/>
    ├── App.jsx                 # root — composes every layer, injects styles, owns app state
    ├── lib/
    │   └── util.js             # pure string/token/route helpers — DAG layer 0
    ├── data/                   # pure tables (import lib + lucide only)
    │   ├── organisms.js        #   organisms, resistance, MRSA/GNR matrices, compare
    │   ├── drugs.js            #   formulary, classes/aliases, penetration, tox, interactions
    │   ├── dosing.js           #   renal/weight/hepatic/HD tables + adjustment metadata
    │   ├── syndromes.js        #   syndrome defs, categories, source-control, directed therapy
    │   ├── evidence.js         #   guidelines, refs, trials, durations, version
    │   ├── content.js          #   allergy, special pops, prophylaxis, OPAT, trees, glossary
    │   ├── risk-keywords.js    #   host/resistance risk patterns for the selector
    │   └── ui-maps.js          #   icon maps + tab definitions
    ├── engines/                # pure logic (import lib + data + spectrum) — browser-free testable
    │   ├── dosing.js           #   dose computation + renal/hepatic/weight derivation
    │   ├── lookup.js           #   knowledge-graph lookups (drug↔monograph, organism, spectrum)
    │   ├── regimen.js          #   empiric assembly, refinement, organism-directed de-escalation
    │   ├── clinical.js         #   penetration, allergy, interactions, evidence, class/glossary
    │   └── integrity.js        #   referential self-check — shared by App (console) + CI (gate)
    ├── components/             # JSX (import lib + data + engines + react/lucide)
    │   ├── primitives.jsx      #   Num, Cite, Drawer, dose-adjust bar, Child-Pugh scorer, …
    │   ├── rich-text.jsx       #   drug-class + glossary inline popover renderers
    │   └── cards.jsx           #   regimen, drug, organism, trial, IV→PO, compare cards
    ├── spectrum/
    │   └── Spectrum.jsx        # self-contained antibiogram matrix (data + chart + styles, IIFE)
    └── styles/
        ├── tokens.css          # GENERATED — do not hand-edit
        └── app-styles.js       # app CSS strings injected by the root (.rx-root scope)

tests/                         # Vitest — pure engine + integrity suites (no browser)
e2e/                           # Playwright — render + a11y gates (vs the production build)
.github/workflows/ci.yml       # CI: typecheck + unit/integrity, then render + a11y
vitest.config.ts               # node environment
playwright.config.ts           # builds + previews dist, single chromium project
```

### The module graph (Phase 3)

What was a single 7,469-line `App.jsx` is now 19 modules on a strict dependency DAG —
`lib → data → engines → components → root`. **`lib`** depends on nothing; **`data`**
imports only `lib` (+ `lucide`); **`engines`** import `lib`+`data`+`spectrum` and contain
**no JSX** (the clinical logic — dose math, lookups, assembly, de-escalation — now
unit/snapshot-testable without a browser); **`components`** import everything below them;
**`App.jsx`** composes the graph. `spectrum/Spectrum.jsx` was already a self-contained
IIFE and was lifted out whole. The split used an AST-driven extractor (TypeScript
compiler API) that moved exact symbol spans and auto-wired imports/exports, re-running the
full integrity + render gate after every module.

### The design-token system (Phase 2)

The Bottke Clinical Design System (Brand Kit B — oxblood) was previously defined
**twice** as inline CSS custom properties: once on `.rx-root` (main app) and once on
`.sx-root` (the spectrum module, which additionally carried `--star-soft` and the
seven `--sg-*` supergroup tints). Two copies meant silent-drift risk.

Now there is one source — [`tokens/tokens.json`](tokens/tokens.json) — and a build
step that emits every token onto `:root`:

```
tokens/tokens.json  ──(scripts/build-tokens.mjs)──▶  src/styles/tokens.css  ──(import)──▶  :root
```

- The CSS variable name is each token's **leaf key verbatim** (`ox-deep` → `--ox-deep`),
  so the existing variable contract is preserved exactly. Group nesting in the JSON is
  for human organisation only.
- The build **errors** on a missing `$value` or any duplicate variable name — the guard
  that makes a single source enforceable.
- `.rx-root` / `.sx-root` keep their *applied* base styles (font-family, colour,
  background); they no longer declare tokens. Both inherit from `:root`.

To change a colour or font: edit `tokens.json`, run `npm run tokens` (or any `npm run
dev`/`build`, which do it for you), commit both files.

> **Migration was verified** by diffing the computed value of all 44 variables on both
> `.rx-root` and `.sx-root` against the pre-migration build: **zero regressions** across
> 26 colours × 2 scopes, the 15 spectrum extras, and the 3 font stacks. (The `.sx-root`
> serif/mono fallback stacks were intentionally unified to match `.rx-root` — a no-op
> unless the primary webfont fails to load.)

### Incremental TypeScript

`App.jsx` is admitted via `allowJs` and **not** type-checked yet (`checkJs: false`).
New files (`main.tsx`, and everything extracted in Phase 3) are fully checked under
`strict`. The build itself uses esbuild (via Vite) and does not gate on types; run
`npm run typecheck` to check explicitly.

---

## Roadmap

| Phase | Scope | Status |
|------|-------|--------|
| **1 — Build** | Vite + React + TS shell; single entry; fonts via `<link>` | ✅ done |
| **2 — Tokens** | Consolidate the duplicated token blocks into `tokens.json` → `build-tokens.mjs` → `tokens.css` | ✅ done |
| **3 — Split** | Extract `lib/` + `data/` → `engines/` → `components/` (strict DAG) | ✅ done |
| **4 — CI** | `integrity` · `render` · `a11y` gates on every push/PR | ✅ done |
| **Wave 5 — Bedside reframe** | Snapshot consult, layered depth, content stewardship, multi-agent authoring | 🟦 in flight |

**Phase 3** is complete: the monolith is now 19 modules on the `lib → data → engines →
components → root` DAG. Each layer was extracted and verified green independently. The
highest-leverage win is realised — `engines/` is pure and JSX-free, so the
regimen-refinement, de-escalation, and dosing outputs are now **snapshot-testable without
a browser**, and a data edit that changes a clinical recommendation will surface as a
reviewable diff in the PR.

**Phase 4** is complete: the three checks used by hand during development now run in CI
(`.github/workflows/ci.yml`) and locally via `npm run verify`. See [Testing](#testing).

---

## Wave 5 — bedside reframe (in flight)

Wave 5 closes the qualitative gaps that the prior phases could not: a **snapshot
consult** (no saved state, no longitudinal chart), **depth on demand** (drill from a
chip into the mechanism / trial / regional resistance behind it), **graded evidence**,
**ad-hoc course updates** that merge ephemerally into the Answer Canvas, and tighter
cross-section navigation. The cardinal constraint is **snapshot-only**: refinement
patches live in component state, never `caseState`, never the URL hash, never
localStorage.

### Status snapshot

| PR | Title | State |
|----|-------|-------|
| #92 | PR-1 · per-syndrome content sentinels (cystitis / cap / sepsis) | ✅ merged |
| #93 | PR-2 · mass migration of remaining 103 syndromes to per-file modules | ✅ merged |
| #94 | PR-3 · `AnswerCanvas` layer registry (Stage 0 → 1 → 2; 18 layer modules) | ✅ merged |
| #95 | PR-4 · `FORMULARY` pkpd / timeToEffect / cdiffScore / mdrPressure / kinetics | ✅ merged |
| #96 | PR-5a · `composeAnswer(currentRegimen)` + `refineOnNewFinding` engine | ✅ merged |
| #97 | PR-5b · `regimenCompare` four-dimensional symmetric diff | ✅ merged |
| #98 | PR-5c · `case-parser` `DRUG_RX_UNION` + `currentRegimen` / `findings` + 50-utterance corpus | ✅ merged |
| #99 | PR-6a · diagnostics-stewardship foundation + 10 sentinel syndromes | 🟦 draft |
| —   | PR-6b–f · diagnostics content tranches (parallel agents, ~107 syndromes) | ⏳ queued |
| —   | PR-7 / PR-8 / PR-9 / PR-10 · mechanisms · OPAT · PK/PD · microbiome chips | ⏳ planned |
| —   | PR-11 · React Testing Library harness | ⏳ planned |
| —   | PR-12 / PR-13 / PR-14 · navigation simplification + cross-cutting paths + attribution drawer | ⏳ planned |

### Test surface

`npm run test` covers **16 files, 3,389 unit + integrity + audit tests**. Notable
Wave 5 additions:

- `tests/answerCanvas-layers.test.js` — LAYERS registry shape contract.
- `tests/refineOnNewFinding.test.js` — snapshot-refine engine determinism + purity.
- `tests/regimenCompare.test.js` — four-dimensional symmetry + winner contracts.
- `tests/case-parser-corpus.test.js` — 50-utterance parser-coverage corpus (≥ 47 must
  route to a meaningful caseState; current 49/50).
- `tests/content-audit.test.js` — apex schema gates for every authored surface
  (regimenContent, syndromeDecision, combinedRisks, FORMULARY pkpd/microbiome,
  diagnostics).

### Architectural traps locked in by the audit

The Wave 5 PRs explicitly closed three drift risks the prior structure invited:

1. **DRUG_KEYWORDS derives from `AGENT_RX`** (case-parser.js, PR-5c) — the parser and
   the regimen engine see the same canonical drug names by construction; a new agent
   added to one is automatically visible to the other.
2. **`LAYERS` predicates + render functions are colocated** (answer-layers/, PR-3) —
   `when(shared)` and `render(shared)` consume the same bag, so the spine chip and the
   rendered block can never disagree about visibility.
3. **`matchCtx` only elevates, never hides** (ctxMatch.js + every authored layer) —
   hiding important monitoring / diagnostics based on partial information would lose
   orders that matter; matching items get a left-border accent + chip and float to the
   top within their severity bucket.

Detailed plan in `/root/.claude/plans/create-a-plan-for-gleaming-locket.md` (durable
through compactions). PRs are merged via a hybrid workflow — architectural changes
through draft → AI review → human review → merge; mechanical content tranches direct
to main after `npm run verify` + AI review.

---

## Testing

`npm run verify` runs the full gate chain — exactly what CI runs:
`typecheck → unit (+ integrity) → build → e2e (render + a11y)`.

```bash
npm run typecheck   # tsc --noEmit (strict on .ts/.tsx; App.jsx is allowJs)
npm run test        # Vitest — pure engine + integrity suites (no browser)
npm run test:e2e    # Playwright — render + a11y gates against the production build
npm run verify      # all of the above, in CI order
```

**Unit + integrity (Vitest, `tests/`, ~0.5 s).** The split made the clinical logic
pure, so it is now tested directly with no DOM:

- `integrity.test.js` — the **single source of truth** for content integrity. The same
  `checkIntegrity()` that logs the on-mount console line in `App.jsx` is asserted here
  as a hard gate: every syndrome category, organism bug-id, duration/guideline id,
  org/drug cross-walk entry, dose-table agent (must resolve to a non-empty monograph via
  `drugLookup`), interaction-layer agent, and source-control key must resolve, and
  syndrome ids must be unique. A content edit that dangles a reference fails the build
  with a precise message instead of opening an empty drawer at the bedside.
- `dosing.test.js` — Cockcroft–Gault bands and the 0.85 female coefficient, CKD-EPI
  monotonicity, augmented-clearance flagging, vancomycin loading-vs-maintenance and
  HD level-guided routing, Child–Pugh A/C classing.
- `lookup.test.js` — the coverage truth table the de-escalation logic rests on
  (`Vancomycin` covers MRSA, `Ceftriaxone` does not; antipseudomonals cover *P.
  aeruginosa*, metronidazole does not), with route/case tolerance.
- `regimen.test.js` — risk-driven empiric assembly (right flags add the right tiers,
  monotonically, each with a reason), and the de-escalation suggester's "lets you stop"
  set (an empiric agent is stoppable iff it has no activity against the confirmed organism).

**Render + a11y (Playwright, `e2e/`).** `playwright.config.ts` builds the app and serves
the **production** `dist` via `vite preview`, and runs every spec against **two projects —
desktop Chrome and mobile (Pixel 5, 393 px)** — so the responsive layout is tested, not
just asserted to exist:

- `render.spec.ts` — opens the assembled-regimen drawer for a representative syndrome
  from every category (plus de-escalation), asserting the drawer renders real content
  with **zero console errors / uncaught exceptions**; that the clean integrity line logs
  on load; and that **no primary surface overflows its viewport horizontally** (the
  high-value mobile check — axe and error-listening don't catch layout overflow).
- `a11y.spec.ts` — `@axe-core/playwright` (WCAG 2.1 A/AA) on the approach, empiric,
  spectrum, and open-drawer surfaces, plus a keyboard-focus assertion.

Standing these gates up surfaced and fixed real defects that were shipping:

- **a11y (six AA defects):** four sub-threshold contrast cases (`--faint`/opacity on body
  text), an unlabeled comparison `<select>`, and a non-keyboard-scrollable region.
- **mobile (two overflow defects):** the rapid-diagnostics grid (`repeat(3,1fr)`) never
  collapsed below its 680 px breakpoint, and the empiric builder's syndrome/allergy
  `<select>`s set an intrinsic min-width from their long option text that blew the
  two-column grid past the viewport. Both fixed by following the existing breakpoint
  convention (collapse to one column) plus `minmax(0,1fr)` tracks and `min-width:0` /
  `width:100%` on the controls so they shrink to their container.

---

## Deployment (GitHub Pages)

The app is a pure client-side bundle with **relative asset paths** (`vite base: "./"`)
and **hash-based navigation**, so it deploys to a Pages project site
(`https://<user>.github.io/<repo>/`) with no `base` edit and no SPA 404-fallback.

`.github/workflows/deploy.yml` builds and publishes on every push to `main`; `dist/` is
never committed. One-time setup:

1. Push the repo to GitHub (the `deploy.yml` workflow ships in `.github/workflows/`).
2. In the repo: **Settings → Pages → Build and deployment → Source = GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab). The deploy job
   prints the live URL; thereafter every push to `main` redeploys.

To keep the link physician-only, share the URL directly rather than advertising it — a
project-site URL is public but unguessable, and the repo can stay private (Pages still
serves). For true access control, host behind an authenticated provider instead (see
below).

### Why Pages here, and when another host is better

GitHub Pages is the right default for this project: it's free, the repo is already there,
and a static client-only app is exactly what Pages serves well. Other hosts add value only
for specific needs:

| Host | Advantage over Pages | Relevant here? |
|---|---|---|
| **Netlify / Vercel** | Per-PR **deploy previews** (every pull request gets its own URL); password protection without auth code; instant rollbacks; drag-and-drop deploy of a `dist/` folder | Useful if you want reviewers to see a branch before merge, or want a password gate. Not required for a single shared review URL. |
| **Vercel** | First-class if you later add any server-side piece (API routes, auth) | Only if the app stops being purely static. |
| **Cloudflare Pages** | Fastest global edge; generous free tier | Marginal for a small reviewer group. |

For "deploy what's on `main`, share one link with colleagues," Pages is sufficient and
lowest-friction. The clearest reason to reach for Netlify/Vercel would be **deploy
previews** (review a change before it lands) or a **password gate** without building auth.

---

## License / provenance

Internal clinical-education tooling. Clinical content reflects sources current to the
build date and will drift — reconfirm against live guidelines before any bedside use.
