---
title: Workflow & Integration Guide
phase: Post-Phase-L (v3.1+)
---

# Workflow & Integration Guide

This document captures the **end-to-end process** for adding new
syndromes / diagnoses to the Inpatient Antibiotic Guide and the
patterns that keep the **9 depth layers** authored in lockstep so
no syndrome ships at less than apex quality.

Pair this with `AUTHORING.md` (the content contract reference). This
guide is procedural — it answers "how do I add a new syndrome and
integrate it everywhere it needs to be?" The authoring doc answers
"what is the quality bar for the content I write?"

---

## Table of contents

1. [The 9-layer architecture](#the-9-layer-architecture)
2. [Data → component → bedside flow](#data--component--bedside-flow)
3. [Adding a new syndrome — the canonical workflow](#adding-a-new-syndrome--the-canonical-workflow)
4. [Tranche-based authoring discipline](#tranche-based-authoring-discipline)
5. [Audit infrastructure as the safety net](#audit-infrastructure-as-the-safety-net)
6. [Cross-section interaction wiring](#cross-section-interaction-wiring)
7. [Clinical decision-making automation patterns](#clinical-decision-making-automation-patterns)
8. [Maintenance: keeping depth current](#maintenance-keeping-depth-current)
9. [The PR / CI workflow](#the-pr--ci-workflow)
10. [Anti-patterns + common failures](#anti-patterns--common-failures)
11. [Future depth dimensions to consider](#future-depth-dimensions-to-consider)

---

## The 9-layer architecture

Every syndrome on the bedside canvas potentially carries **9 distinct
depth layers**. Each layer is independent — has its own data file,
schema, renderer, audit gate, and integration point. Each renders
only when relevant data exists for the syndrome (graceful fallback
is the universal contract).

| # | Layer | Data file | Component | Phase |
|---|---|---|---|---|
| 1 | **Regimen options** | `src/data/regimenContent.js` | `RegimenOptions.jsx` | D1 / D1.5 |
| 2 | **Duration decision** | `src/data/syndromeDecision.js` (`duration`) | `DurationBlock.jsx` | D2 |
| 3 | **Monitoring decision** | `src/data/syndromeDecision.js` (`monitoring`) | `MonitoringBlock.jsx` | D2 |
| 4 | **Research evidence** | `src/data/syndromeDecision.js` (`research`) | `ResearchBlock.jsx` | F |
| 5 | **Combined-regimen risks** | `src/data/combinedRisks.js` | `CombinedRisksBlock.jsx` | D3.2 + G |
| 6 | **Regional resistance** | `src/data/regionalResistance.js` | `RegionalResistanceBlock.jsx` | H |
| 7 | **Novel agent profiles** | `src/data/novelAgents.js` | `NovelAgentsBlock.jsx` | I |
| 8 | **Pediatric + pregnancy** | `src/data/pedsPregDosing.js` | `PedsPregBlock.jsx` | J |
| 9 | **Surge / outbreak** | `src/data/surgeProtocols.js` | `SurgeProtocolsBlock.jsx` | K |
| 10 | **Site penetration / PK** | `src/data/sitePenetration.js` | `SitePenetrationBlock.jsx` | L |

(10 entries — D2 splits into duration + monitoring at the
component level.)

### The graceful-fallback contract

Every layer renders **nothing** when no relevant data exists. The
filter helper in each data module (`getSyndromeResearch`,
`getRegionalForSyndrome`, etc.) returns `null` or `[]` for syndromes
without coverage; the renderer short-circuits at the top of the
function. This means:

- A new syndrome can ship at minimum viable content (just D1.5 and
  D2 layers) and add depth layers iteratively without breaking
  anything.
- Depth-layer authors don't need permission from syndrome authors;
  cross-cutting layers (regional resistance, surge protocols)
  reference syndromes by their stable `id`.
- Tests verify the wiring exists; no schema-strict requirement that
  every layer cover every syndrome.

---

## Data → component → bedside flow

```
┌──────────────────────────────────────────────────────────────┐
│  src/data/syndromes.js                                       │
│   ↓ catalog of 106 syndromes with {id, cat, name}            │
└──────────────────────────────────────────────────────────────┘
                          │
       ┌──────────────────┴──────────────────┐
       │                                     │
       ▼                                     ▼
┌────────────────────────┐    ┌──────────────────────────────┐
│ regimenContent.js      │    │ syndromeDecision.js          │
│  → keyed by syndrome   │    │  → keyed by syndrome         │
│  tier-by-tier cards    │    │  duration + monitoring +     │
│                        │    │  research per syndrome       │
└────────────────────────┘    └──────────────────────────────┘
       │                                     │
       ▼                                     ▼
┌────────────────────────┐    ┌──────────────────────────────┐
│ RegimenOptions.jsx     │    │ DurationBlock + Monitoring + │
│  (Phase D1.5 cards)    │    │ ResearchBlock                │
└────────────────────────┘    └──────────────────────────────┘
       │                                     │
       └────────────────┬────────────────────┘
                        ▼
       ┌────────────────────────────────────┐
       │ Cross-cutting depth layers:        │
       │  - combinedRisks (D3.2 + G)        │
       │  - regionalResistance (H)          │
       │  - novelAgents (I)                 │
       │  - pedsPregDosing (J)              │
       │  - surgeProtocols (K)              │
       │  - sitePenetration (L)             │
       │ Each filtered by syndromes[] list  │
       └────────────────────────────────────┘
                        │
                        ▼
       ┌────────────────────────────────────┐
       │ AnswerCanvas.jsx (mount order)     │
       │  1. RegimenOptions                 │
       │  2. CombinedRisksBlock             │
       │  3. DurationBlock                  │
       │  4. MonitoringBlock                │
       │  5. ResearchBlock                  │
       │  6. RegionalResistanceBlock        │
       │  7. NovelAgentsBlock               │
       │  8. SurgeProtocolsBlock            │
       │  9. PedsPregBlock                  │
       │  10. SitePenetrationBlock          │
       │  11. ReassessmentPanel             │
       └────────────────────────────────────┘
```

---

## Adding a new syndrome — the canonical workflow

A **full integration** of a new syndrome touches up to 10 files but
is built iteratively. The minimum viable shipping state is
**Step 1–4** (catalog + regimen + decision + organisms); Steps 5–9
are depth-layer expansions that can land in follow-up tranches.

### Step 0 — Triage: does it deserve its own syndrome?

Before adding, decide:

- Does the syndrome have a **materially different empiric regimen**
  from the closest existing entry?
- Or a **distinct duration / monitoring contract**?
- Or a **specific organism + drug pairing** that doesn't fold into
  an existing card's branches?

If yes → new syndrome. If the differentiator is just a sub-branch
of an existing one (e.g., "viridans IE 2-wk synergy regimen" vs
"viridans IE 4-wk PCN"), add a branch to the existing entry instead.

### Step 1 — Catalog the syndrome (`src/data/syndromes.js`)

```js
{ id: "your-syndrome-id", cat: "ssti", icon: "slice",
  name: "Your Syndrome Display Name",
  // optional: durKey, regimenKey, etc. — used by legacy lookups
}
```

The `id` is the **stable cross-system key**. Every other layer
references this id. Keep it kebab-case, lowercase, no spaces.

### Step 2 — Author the regimen cards (`src/data/regimenContent.js`)

Use the scaffold script:

```bash
npm run content:scaffold -- your-syndrome-id
```

This generates an apex-compliant template (`pickIf` / `whyPick` /
`watchOut` / tiers) for you to fill at the keyboard. The audit gate
enforces the contract — every card must have ≥ 3 `whyPick`, ≥ 2
`watchOut`, etc.

### Step 3 — Add D2 duration + monitoring (`src/data/syndromeDecision.js`)

Append a new entry. Required fields:

- `duration.headline` — the bottom-line answer (≤ 20 words)
- `duration.evidence` — anchor citation
- `duration.branches[]` — one per clinical state that changes duration
- `duration.stopWhen[]` — discharge / stop checklist (≤ 8)
- `duration.extendIf[]` — triggers that legitimately add days (≤ 5)
- `monitoring.headline` — "what to order today"
- `monitoring.items[]` — severity-tagged checks

Use `matchAgent` regexes, `matchBranch` filters, and `matchCtx`
predicates to wire cross-section selection (see [Cross-section
interaction wiring](#cross-section-interaction-wiring)).

### Step 4 — Add the organism mapping (`src/data/organisms.js`)

If the new syndrome involves organisms not already in the catalog,
add them with `cat` (Gram-pos / Gram-neg / anaerobe / etc.) and
update the syndrome's `directed` slot in syndromes.js if applicable.

### Step 5 — Add the research evidence panel (Phase F)

Append a `research:` sibling under the new syndrome in
syndromeDecision.js:

```js
research: {
  headline: "what the literature actually shows",
  trials: [
    { name: "TRIAL 20YY (Lead Author)", n: 1234,
      question: "...", finding: "...", bias: "..." (optional)
    },
  ],
  guidelines: [
    { society: "IDSA", year: 2024, topic: "...", keypoint: "..." },
  ],
  openQuestions: [ "..." ],
}
```

If new landmark trials are cited, also register them in
`src/data/evidence.js` GUIDELINES so `<Cite>` lookups work
elsewhere in the app.

### Step 6 — Cross-cutting depth layers (optional)

For each of these, ask: does this syndrome materially fire this
rule / pattern / agent?

| Layer | When to add |
|---|---|
| `combinedRisks.js` | If a specific 2-agent combination drives a new interaction (e.g., rifampin + your-syndrome-agent). |
| `regionalResistance.js` | If regional resistance patterns change the empiric — add the syndrome id to the `syndromes[]` field of an existing pattern entry. |
| `novelAgents.js` | If a recently-approved agent is specifically indicated here — add the syndrome id to the agent's `syndromes[]` field. |
| `pedsPregDosing.js` | If pediatric or pregnant patients commonly present with this syndrome — add the syndrome id to relevant agent profiles. |
| `surgeProtocols.js` | If a bioterror agent, emerging pathogen, or outbreak pathogen presents as this syndrome. |
| `sitePenetration.js` | If the syndrome involves a sequestered site (CNS, bone, abscess, prostate, vitreous, etc.) — add the id to the corresponding site's `syndromes[]` field. |

**The pattern is consistent**: cross-cutting layers index by
syndrome id. You add the new id to existing pattern lists rather
than authoring new patterns from scratch.

### Step 7 — Register evidence (`src/data/evidence.js`)

If you cite new trials / guidelines in the research panel, add them
to `GUIDELINES`:

```js
yourkey: { body: "NEJM", year: 2024, kind: "rct",
  title: "Trial Name", cite: "Author et al. · 391:123" },
```

This automatically updates the footer source count + the Adjuncts
tab primary-sources table. No additional wiring needed.

### Step 8 — Update `EVOLVING` fronts (optional)

If this syndrome surfaces a moving evidence front (e.g., "antibiotic
duration keeps shortening"), add or update an entry in
`EVOLVING` in evidence.js.

### Step 9 — Run the audit + verify locally

```bash
npm run content:audit  # 1500+ checks against the contract
npm run test           # full unit suite
npm run typecheck      # tsc --noEmit
npm run build          # production build
npm run test:e2e       # Playwright (slower, but mandatory)
```

The audit catches: missing required fields, chip-length violations,
matchAgent collisions, integer-trap (days field), word-count limits,
severity vocabulary mismatches, unknown ctx fields, year-range
sanity, and more.

### Step 10 — PR + CI

Create a draft PR on a `claude/...` feature branch. CI runs the
verify suite (typecheck + test + build + e2e). When green, mark
ready and merge with squash. Main branch must always be green.

---

## Tranche-based authoring discipline

Large rollouts (like the 13-tranche D2 + F authoring sequence)
follow a strict tranche discipline. Lessons from shipping ~50 PRs
this session:

- **10-syndrome tranches** is the sweet spot — large enough to
  show progress, small enough to keep PRs reviewable and CI fast.
- **One tranche = one PR = one squash-merge commit.** Don't stack
  unrelated changes.
- **Stack tranches by rebasing onto fresh main** after each merge.
  The `git rebase --onto origin/main <parent> <branch>` pattern
  drops squashed commits cleanly.
- **Maintain a coverage running total** in PR descriptions so the
  forward-looking momentum is visible at a glance.
- **Self-audit while authoring.** Run `npm run content:audit`
  before pushing — the 1500+ checks catch most issues before they
  reach reviewers. The most common failures: chip-length > 24
  chars, matchAgent collisions (same regex on multiple branches),
  integer-trap (numeric thresholds in days field).

---

## Audit infrastructure as the safety net

`tests/content-audit.test.js` is the most important file in the
repo. It enforces the apex contract automatically and catches the
errors that humans miss at scale.

**Audit gates we ship today (1500+ checks):**

| Gate | What it catches |
|---|---|
| **Required fields** | Missing `headline`, `branches`, `monitoring.items` per syndrome |
| **Word-count limits** | `pickIf` ≤ 22 words; `monitoring.why` ≤ 18 words; `research.headline` ≤ 30 words |
| **Severity vocabulary** | `sev` must be one of the documented enums |
| **Chip-length** | `branch.days` ≤ 24 chars (renders as a chip) |
| **Explicit units** | Days strings must carry unit (`5 d`, `2 wk`, `Indefinite`); bare integers rejected |
| **Integer-trap** | Every integer in `days` must have a unit within 8 chars; catches "Until ANC > 500" mis-parses |
| **matchAgent disambiguation** | Probes 50 common agents against branches; flags collisions where first-match-wins picks wrong |
| **matchCtx field validation** | Predicate fields must be in `KNOWN_CTX_FIELDS`; comparators must be `lt/lte/gt/gte/eq/between/in` |
| **Research panel shape** | When `research:` is present, trials + guidelines + open-questions must conform |
| **Combined-risks shape** | Each rule must have ≥ 2 agent regexes (AND-semantics), valid severity, word-bound detail |
| **Coverage report** | Logs current `regimenCoveragePct` + `decisionCoveragePct` |

**Adding a new audit rule** is the standard mechanism for closing
a class of bug forever. When PR #16's "Until ANC > 500" misparse
slipped through, we added the integer-trap rule. Now it can never
happen again in any syndrome.

---

## Cross-section interaction wiring

The "bedside picks a card / branch and downstream sections light
up" behavior is the core interaction model. It works through three
declarative filter mechanisms:

### `matchAgent` — regex on picked drug

```js
{ sev: "trigger", what: "**Vancomycin AUC 400–600**",
  why: "...",
  matchAgent: /vancomycin|linezolid/i }
```

Picking a vancomycin card from any tier lights this monitoring
item with a "MATCHES" chip. **Pitfall:** if two branches use
overlapping agent regexes, the first-match-wins resolver picks the
wrong branch silently. The audit's matchAgent disambiguation gate
catches this — probes 50 common agents against all branches and
fails the test if any probe matches > 1 branch.

### `matchBranch` — explicit branch label list

```js
{ sev: "trigger", what: "**IVIG 1 g/kg**",
  matchBranch: ["Streptococcal TSS confirmed"] }
```

Lights this item only when the user clicks the specified branch in
the DurationBlock. Use for items that are branch-specific even
when the picked agent overlaps with other branches.

### `matchCtx` — declarative patient-state predicate

```js
{ sev: "trigger", what: "**Daily SCr**",
  matchCtx: { any: [{ crcl: { lt: 60 } }, { age: { gte: 75 } }] } }
```

Evaluated against the patient's case ctx (parsed from the case
bar). Supports `lt / lte / gt / gte / eq / between / in`
comparators and `{ any: [...] }` OR semantics. Unknown ctx fields
silently fail-safe (return false) but the audit catches the typo
at CI time.

**The contract**: filters EMPHASIZE, never HIDE. A clinician must
always be able to see every item — even ones that don't match
their context — so they can override the system's inference if
needed.

---

## Clinical decision-making automation patterns

The platform automates these decision-making elements without
clinician input:

| Automation | Mechanism | Layer |
|---|---|---|
| **Allergy substitution** | `allergyGuidance` engine; `composeAnswer` produces a refinement.steps[] entry that footnotes the renamed regimen line | Engine (D3.3) |
| **Renal dose adjust** | `doseAdjustments` engine on `ctx.crcl`; surfaces dose-line annotations | Engine (computeDose) |
| **Multi-tier pick aggregation** | `pickedAgents` Set across all tiers feeds combinedRisks + matchAgent | Engine + UI (D3.1) |
| **Combined-regimen risks** | `detectCombinedRisks(pickedAgents)` fires rules with AND-semantics on agent regexes | Data + Engine (D3.2) |
| **Ctx-aware item elevation** | `matchesCtx(predicate, ctx)` evaluates declarative predicates per item | Engine (D3.4) |
| **Cross-section sync** | DurationBlock branch click flows into MonitoringBlock matchBranch; chip click flows back to branch | UI (D2 bridge) |
| **Audit-time disambiguation** | matchAgent collision detector probes 50 common agents | CI gate |
| **Coverage report** | Audit logs `decisionCoveragePct` + `regimenCoveragePct` on every test run | CI gate |

**The principle:** automation reduces the cognitive load on the
clinician without replacing their judgment. Every automated
decision is **visible** (footnote markers + "MATCHES" chips +
warning callouts) and **reversible** (the regimen is editable, the
branches are clickable, the warnings can be acknowledged + bypassed).

---

## Maintenance: keeping depth current

### Quarterly cadence

- **Resistance patterns** (`regionalResistance.js`) — check CDC
  AR Investments + WHO GLASS for shifts in the high-severity
  patterns. ESBL prevalence, FQ resistance, CRE mechanism
  distribution change over time.
- **Novel agents** (`novelAgents.js`) — track new FDA approvals;
  flag pending approvals as "pending" until they ship. Phase out
  agents whose niche is supplanted by newer combinations.
- **Surge / outbreak** (`surgeProtocols.js`) — monitor CDC + WHO
  outbreak alerts; update regional outbreaks (cholera, Marburg,
  XDR typhoid) with current status.

### Annual cadence

- **Research panels** — refresh `research.trials[]` with new
  landmark publications; retire trials whose findings have been
  superseded.
- **Guideline registry** (`evidence.js`) — track society guideline
  updates (IDSA, ATS, AHA, ESC) and update `year` + `cite` fields.
  The footer auto-updates the source count.
- **VERSION bump** in `evidence.js` whenever a substantive
  cross-cutting refresh ships. Format: `major.minor`.

### Triggered cadence

- **New trial flag**: when a landmark trial publishes (e.g., POET,
  OVIVA, BALANCE), add to the corresponding syndrome's research
  panel + the GUIDELINES registry + the EVOLVING fronts.
- **New resistance pattern**: when local surveillance or
  publication flags a new pattern (e.g., metallo-CRE rising in
  region), add to regionalResistance with appropriate severity.
- **Outbreak alert**: when WHO / CDC declares a PHEIC or outbreak,
  add to surgeProtocols with public-health notification details.

### Stale-content detection

The audit reports `decisionCoveragePct` on every run. If a new
syndrome lands in syndromes.js without corresponding regimen +
decision content, coverage drops, signaling unauthored backlog.

Add a quarterly review:

```bash
# Identify syndromes lacking each layer
node -e "
const m = require('./src/data/syndromeDecision.js').SYNDROME_DECISION;
const all = require('./src/data/syndromes.js').SYNDROMES.map(s=>s.id);
for(const id of all) {
  const e = m[id];
  if(!e) console.log('UNAUTHORED:', id);
  else if(!e.research) console.log('NO RESEARCH:', id);
}
"
```

---

## The PR / CI workflow

| Stage | Action |
|---|---|
| **1. Branch** | `git checkout -b claude/phase-X-tranche-N` off main |
| **2. Author** | Use the tranche-based discipline; ≤ 10 syndromes per tranche |
| **3. Self-audit** | `npm run content:audit` + `npm run test` |
| **4. Commit** | Descriptive commit message; cite trials + guidelines added |
| **5. Push** | `git push -u origin <branch>` |
| **6. Draft PR** | Create draft PR with coverage delta + key citations + safety patterns |
| **7. CI** | Wait for `verify` job (typecheck + test + build + e2e) |
| **8. Mark ready** | When CI green, mark ready for review |
| **9. Squash-merge** | Use squash merge with commit title matching tranche convention |
| **10. Rebase next** | `git rebase --onto origin/main <parent> <next-branch>` for stacked work |

**CI safety net**: the `verify` job blocks any push that breaks
typecheck, unit tests, build, or e2e. There is no merge-without-CI
path. When CI fails:
1. Check the failure log via GitHub MCP `get_check_runs`
2. Reproduce locally (`npm run verify`)
3. Fix root cause; never `--no-verify` or skip the gate
4. Push fix; CI re-runs automatically on push

---

## Anti-patterns + common failures

### Authoring anti-patterns

| Anti-pattern | Why it fails |
|---|---|
| **Bare integers in `days`** | parseDurationDays mis-parses "5" as 5 days when intent was "5 weeks" — audit's explicit-unit rule rejects |
| **Clinical thresholds in `days`** | "Until ANC > 500" → 500 calendar days; integer-trap audit rejects |
| **matchAgent overlap across branches** | First-match-wins picks wrong branch silently; matchAgent disambiguation audit rejects |
| **Unknown ctx field in matchCtx** | Predicate silently fails-safe at runtime but audit catches at CI |
| **`whyPick` > 22 words** | Card grows past the bedside scannability threshold; audit rejects |
| **Missing `watchOut`** | Card lacks the do-not-use trigger required by apex contract; audit rejects |
| **Unitless ranges in days** | "5-7" instead of "5–7 d"; audit's range-rejection rule fails |

### Workflow anti-patterns

| Anti-pattern | Why it fails |
|---|---|
| **Half-finished tranches** | "I'll come back to it" rarely happens; ship narrow + complete, not wide + half-done |
| **Stacking unrelated changes in one PR** | Reviewers can't isolate concerns; rollback granularity lost |
| **Skipping the rebase onto fresh main** | Merge conflicts pile up + you lose visibility into what's actually changing |
| **Adding layers to syndromes that don't have D1.5 + D2** | The cross-cutting layer overlays an unauthored baseline → ugly bedside surface |
| **Forgetting the syndromes[] field** | Cross-cutting layer entry is invisible because no syndrome filters select it |

---

## Future depth dimensions to consider

The 9 layers we ship today cover the bedside decision space well
but the architecture is **infinitely extensible**. Each new layer
follows the same pattern (data file + helper + component + audit +
wiring). Candidates for future dimensions:

| Future layer | Why useful | Anchor pattern |
|---|---|---|
| **Cost / formulary** | Surfaces hospital-tier cost; drives stewardship decisions | Profile each agent in a `formulary.js` keyed by class; helper returns cost + alternatives |
| **OPAT pathway** | Outpatient parenteral antibiotic therapy plan + criteria | Per-syndrome OPAT eligibility + chosen agents + monitoring |
| **Antibiogram interop** | Pull from hospital antibiogram CSV or FHIR endpoint | Engine that overlays local resistance on regional + global patterns |
| **EHR push** | Generate order set or note text in standard format | Renderer that emits Epic / Cerner-compatible text |
| **Diagnostic stewardship** | Recommended diagnostic workup gates (panel, biopsy, imaging) | Per-syndrome `diagnostics:` sibling with severity-tagged tests |
| **Microbiome impact** | Per-agent collateral damage score (C. diff selection, MDR pressure) | Profile each agent in `microbiomeImpact.js`; helper for stewardship sort |
| **Drug shortage tracker** | Surfaces current FDA shortage status + alternatives | Periodically-refreshed `drugShortages.js` keyed by agent |
| **Time-to-effect** | Bactericidal vs bacteriostatic kinetics for each agent + site | Profile by agent + site combination |

The pattern for shipping a new layer:

```
1. Create src/data/<new-layer>.js with data + helper
2. Create src/components/<NewLayer>Block.jsx (uses Section chrome)
3. Wire into AnswerCanvas.jsx (import + mount in render order)
4. Add audit validation in tests/content-audit.test.js (optional shape)
5. Document in this file + AUTHORING.md
6. PR + CI + merge
```

The graceful-fallback contract means new layers never break
existing syndromes — they overlay on top.

---

## Quick reference: file map

```
src/
  data/
    syndromes.js              # catalog of 106 syndromes
    organisms.js              # pathogen catalog
    drugs.js                  # agent catalog
    regimenContent.js         # per-syndrome regimen cards (D1.5)
    syndromeDecision.js       # duration + monitoring + research (D2 + F)
    combinedRisks.js          # cross-agent interactions (D3.2 + G)
    regionalResistance.js     # antibiogram alerts (H)
    novelAgents.js            # newer-agent profiles (I)
    pedsPregDosing.js         # peds + pregnancy modifications (J)
    surgeProtocols.js         # outbreak + bioterror (K)
    sitePenetration.js        # site-specific PK matrix (L)
    evidence.js               # GUIDELINES registry + EVOLVING + VERSION

  components/
    AnswerCanvas.jsx          # primary render surface
    RegimenOptions.jsx        # D1.5 cards
    DurationBlock.jsx         # D2
    MonitoringBlock.jsx       # D2
    ResearchBlock.jsx         # F
    CombinedRisksBlock.jsx    # D3.2 + G
    RegionalResistanceBlock.jsx  # H
    NovelAgentsBlock.jsx      # I
    PedsPregBlock.jsx         # J
    SurgeProtocolsBlock.jsx   # K
    SitePenetrationBlock.jsx  # L
    Section.jsx               # shared chrome
    primitives.jsx            # Cite + DecisionTag + Ev

  engines/
    ctxMatch.js               # matchCtx evaluator
    regimen.js                # composeAnswer
    dosing.js                 # computeDose + doseAdjustments
    clinical.js               # allergyGuidance
    regimenOptions.js         # splitRegimenOptions

tests/
  content-audit.test.js       # 1500+ checks — the apex gate
  integrity.test.js           # cross-file consistency
  lookup.test.js              # data-helper sanity
  durationParse.test.js       # days-string parser
  ctxMatch.test.js            # predicate evaluator

scripts/
  new-syndrome.mjs            # scaffold helper

e2e/
  render.spec.ts              # Playwright smoke
  a11y.spec.ts                # axe-core WCAG 2.1 AA
```

---

## Closing principle

Every layer is **independent + composable**. Every layer ships
**audit-protected**. Every layer **renders nothing when unwired**.

This means you can add a new syndrome in 4 files (catalog + regimen
+ decision + organism), and depth grows over time without ever
needing a Big Bang refactor. Conversely, you can add a whole new
depth dimension (a new layer) without touching the existing 9 —
just wire it into AnswerCanvas at the right position in the render
order.

**Quality is preserved by the audit, not by review.** The 1500+
automated checks ensure no PR can ship that violates the contract.
This is what allows tranche-based scaling without quality regression
— a human reviewer would miss things at this volume; the audit
doesn't.
