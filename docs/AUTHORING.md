# Authoring apex-quality syndrome content

The Inpatient Antibiotic Guide is built on a non-negotiable quality
contract: **every authored syndrome surface must be apex-quality**.
This file is the canonical reference that defines what apex quality
means, the data shapes content lives in, the visual + behavioural
contracts the renderer enforces, and the process for adding new
syndromes at scale.

There are no exceptions to the apex bar. A half-authored syndrome is
worse than no content at all because it leaves a clinician at the
bedside with a card that *looks* authoritative but skips the deciding
fact. If you can't author a tier at apex quality (you don't have the
clinical conviction yet, the evidence isn't settled, the data isn't
gathered), leave it unauthored — the fallback path renders a usable
narrative regimen view that doesn't pretend to more than it knows.

---

## Table of contents

1. [The apex-quality contract](#the-apex-quality-contract)
2. [Per-card content (`regimenContent.js`)](#per-card-content-regimencontentjs)
3. [Duration + monitoring (`syndromeDecision.js`)](#duration--monitoring-syndromedecisionjs)
4. [Cross-section linking tags](#cross-section-linking-tags)
5. [Patient-state-aware tags (`matchCtx`)](#patient-state-aware-tags-matchctx)
6. [Combined-regimen risks (`combinedRisks.js`)](#combined-regimen-risks-combinedrisksjs)
7. [Style + voice contract](#style--voice-contract)
8. [Severity vocabulary](#severity-vocabulary)
9. [Citation + evidence](#citation--evidence)
10. [Authoring a new syndrome — process](#authoring-a-new-syndrome--process)
11. [The content-audit CI gate](#the-content-audit-ci-gate)
12. [Anti-patterns that fail review](#anti-patterns-that-fail-review)

---

## The apex-quality contract

For every authored card, branch, or item, the clinician at the
bedside must get:

- **A killer fact** — the single number, cutoff, class advantage, or
  evidence anchor that distinguishes this choice. Bolded.
- **A do-not-use trigger** — the condition that ends the
  conversation (renal cutoff, allergy class, pregnancy stage, drug
  interaction that kills).
- **A concrete next step** — what to monitor, when to repeat
  cultures, what triggers extension. Numbers, not adjectives.

If a card or item doesn't deliver all three, it doesn't ship.

### What apex looks like (positive example)

```js
{
  rx: /nitrofurantoin/i,
  pickIf: "Uncomplicated cystitis, CrCl ≥ 30, no fever or flank pain.",
  whyPick: [
    "**IDSA-preferred** for 40+ years and counting",
    "**60× urinary concentration** with minimal systemic exposure",
    "**< 5% national E. coli resistance** despite decades of use",
    "Spares gut + vaginal flora — lowest collateral damage",
    "Safe in 1st & 2nd trimester pregnancy",
  ],
  watchOut: [
    { sev: "stop", text: "**CrCl < 30** — urine concentration drops below MIC",
      matchCtx: { crcl: { lt: 30 } } },
    { sev: "stop", text: "**Pyelonephritis** / fever / flank pain — zero tissue penetration",
      matchCtx: { severe: true } },
    { sev: "stop", text: "**Term pregnancy (≥ 38 wk)** — neonatal hemolysis risk" },
    { sev: "stop", text: "**G6PD deficiency** — acute hemolysis" },
    { sev: "warn", text: "**Long courses (months)** — pulmonary fibrosis, hepatotoxicity" },
  ],
},
```

Every bullet has a bolded killer fact. Every watchOut has a concrete
trigger condition. The two bullets where a ctx field maps cleanly
carry `matchCtx` so the bedside surface lights them when the
patient's state matches.

### What's NOT apex (rejected example)

```js
{
  rx: /nitrofurantoin/i,
  pickIf: "Cystitis treatment.",                                    // too vague
  whyPick: [
    "Generally effective for most UTIs",                            // hedged
    "Has been used for many years",                                 // no number
    "Limited resistance",                                            // unspecific
  ],
  watchOut: [
    { sev: "warn", text: "May cause GI side effects" },             // not deciding
    { sev: "note", text: "Consider monitoring in renal failure" },  // weasel
  ],
},
```

Every line fails the contract: no killer fact, hedged language,
no concrete trigger condition. This would be rejected by the
content-audit gate.

---

## Per-card content (`regimenContent.js`)

Card decision content lives in `src/data/regimenContent.js` under
`REGIMEN_CONTENT[syndromeId][tierLabel]`. Each tier is an array of
matchers, tried in order — the first match wins, so order from
most-specific to least-specific.

### Required fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `rx` | `RegExp` | ✓ | Pattern tested against the splitter-output card text |
| `pickIf` | string | ✓ | ≤ 22 words. The 5-second verdict |
| `whyPick` | string[] | ✓ | 3–5 bullets. ≤ 14 words each. ≥ 1 must contain `**bold**` |
| `watchOut` | object[] | ✓ | ≥ 3 entries. See below |

### `watchOut` entry shape

```ts
{
  sev: "stop" | "warn" | "note",   // required
  text: string,                     // required, ≤ 22 words
  matchAgent?: RegExp,              // optional cross-section tag
  matchBranch?: string[],           // optional cross-section tag
  matchCtx?: object,                // optional ctx predicate (see § 5)
}
```

### `rx` pattern tips

- The splitter produces strings like `"fosfomycin 3 g PO × 1"`. Your
  `rx` is tested against that text.
- Use the lowercased drug name as the anchor: `/nitrofurantoin/i`.
- For class-level matchers, use the class noun: `/carbapenem/i`,
  `/aminoglycoside/i`.
- More-specific matchers come first in the tier array.

---

## Duration + monitoring (`syndromeDecision.js`)

Structured "when to stop / what to check" content lives in
`src/data/syndromeDecision.js` under `SYNDROME_DECISION[syndromeId]`.

### Shape

```ts
SYNDROME_DECISION[id] = {
  duration: {
    headline: string,                  // ≤ 22 words; chart-ready
    evidence: string,                  // trial / guideline anchor
    branches: [                        // ≥ 1 entry
      {
        label: string,                 // clinical state name
        days: string,                  // ALWAYS with explicit units
        detail: string,                // day-1 anchor + qualifiers
        matchAgent?: RegExp,
      },
    ],
    stopWhen: string[],                // ≤ 8 items, AND-joined
    extendIf: (string | { text, matchCtx? })[],  // mixed shape allowed
  },
  monitoring: {
    headline: string,
    items: [                           // severity-grouped at render
      {
        sev: "required" | "trigger" | "consider",
        what: string,                  // the order / check / threshold
        why: string,                   // ≤ 22 words clinical rationale
        matchAgent?: RegExp,
        matchBranch?: string[],
        matchCtx?: object,
      },
    ],
  },
};
```

### The `days` safety contract

> **Every `days` value carries an explicit unit string.**

| Allowed | Forbidden | Reason |
|---|---|---|
| `"5 d"` | `"5"` | Bare integer renders as `"5 d"` historically but ambiguity is a hazard |
| `"1 dose"` | `"1"` | Fosfomycin is one dose, not one day — life-and-death distinction |
| `"5–7 d"` | `"5–7"` | Range must carry the unit |
| `"4–6 wk"` | `"4–6"` | Weeks vs days has changed mortality outcomes |
| `"≥ 42 d"` | `"≥ 42"` | Same |
| `"Indefinite"` | `"-"` | Conveys lifelong suppression for retained hardware |

The content-audit gate rejects any `branch.days` that doesn't match
the unit-string contract.

### Severity vocabulary (monitoring items)

- `required` — must-do, hard-stop if missed (red label).
  Reserved for items where omission is itself a documented mortality
  signal (TEE in SAB; ID consult in SAB; AUC for vanco).
- `trigger` — conditional / "if X then do Y" (amber label).
- `consider` — optional escalation; useful to know (muted label).

---

## Cross-section linking tags

Tags let a single user action ripple through the page. The renderer
elevates matched items with a visible "MATCHES" or "FIRES NOW" chip
+ left accent stripe + sort-to-top within their severity bucket.
Items WITHOUT any tag are unconditionally relevant — they always
render at default emphasis.

### `matchAgent: RegExp`

Fires when ANY agent picked across ANY tier matches the pattern.
Use the class name where multiple drugs share the rule:

```js
matchAgent: /vancomycin|daptomycin/i        // any anti-MRSA agent
matchAgent: /piperacillin|meropenem/i       // anti-pseudomonal β-lactam
matchAgent: /aminoglycoside|gentamicin/i    // any AG
```

### `matchBranch: string[]`

Exact-match against the duration branch label currently active
(explicit click OR auto-derived from picked agent + `branch.matchAgent`,
OR from the Source-controlled chip). Use the FULL branch label:

```js
matchBranch: ["Endocarditis confirmed (native)",
              "Endocarditis (prosthetic valve)"]
```

### Cross-section never hides

The renderer only ELEVATES matched items; non-matching items remain
visible at default emphasis. This is the safety contract. A hidden
required check because the user picked a different card is worse
than a noisy list.

---

## Patient-state-aware tags (`matchCtx`)

Declarative JSON predicates that fire on the current patient ctx.
Items get visually elevated with a "FIRES NOW" chip when the
predicate evaluates true.

### Supported comparators

| Comparator | Example | Meaning |
|---|---|---|
| `{ lt: N }` | `{ crcl: { lt: 30 } }` | `ctx.crcl < 30` |
| `{ lte: N }` | `{ age: { lte: 18 } }` | `ctx.age <= 18` |
| `{ gt: N }` | `{ age: { gt: 65 } }` | `ctx.age > 65` |
| `{ gte: N }` | `{ scr: { gte: 1.5 } }` | `ctx.scr >= 1.5` |
| `{ eq: N }` | `{ age: { eq: 18 } }` | `ctx.age === 18` |
| `{ between: [lo, hi] }` | `{ crcl: { between: [30, 60] } }` | inclusive range |
| `{ in: [...] }` | `{ hepStage: { in: ["B", "C"] } }` | set membership |
| bare value | `{ hd: true }`, `{ blAllergy: "severe" }` | equality |

### Composition

- Multiple keys in one object are **AND**-ed:
  ```js
  matchCtx: { crcl: { lt: 60 }, severe: true }
  // ctx.crcl < 60  AND  ctx.severe === true
  ```
- **OR** via `{ any: [...] }`:
  ```js
  matchCtx: { any: [{ crcl: { lt: 30 } }, { hd: true }] }
  // ctx.crcl < 30  OR  ctx.hd === true
  ```

### Common ctx fields

| Field | Source | Type |
|---|---|---|
| `crcl` | Case-parser CrCl input or back-calculated from SCr+demographics | number |
| `age` | Case-parser demographics | number |
| `weight` | Case-parser demographics | number |
| `scr` | Case-parser labs | number |
| `sex` | Case-parser demographics | `"M"` \| `"F"` |
| `hd` | Case-parser "HD" / "dialysis" keyword | boolean |
| `severe` | Case-parser shock/ICU/severe-sepsis keywords | boolean |
| `mrsaRisk` | Case-parser MRSA-related keywords | boolean |
| `pseudoRisk` | Case-parser Pseudomonas-related keywords | boolean |
| `esblRisk` | Case-parser ESBL/CRE keywords | boolean |
| `blAllergy` | Case-parser β-lactam allergy keywords | `"severe"` \| `"mild"` \| `null` |
| `hepStage` | Case-parser Child-Pugh keywords | `"A"` \| `"B"` \| `"C"` \| `null` |

### Safety contract

- Unknown ctx fields → predicate fails silently (returns false,
  never throws). The content-audit gate catches typos at PR time.
- Predicates are **JSON-serializable plain objects**, NEVER
  functions. This is enforced so the per-syndrome content modules
  can move across module boundaries safely and the audit linter can
  scan their shape.

---

## Combined-regimen risks (`combinedRisks.js`)

Cross-agent interactions detected when multiple regex tags ALL match
at least one entry in the union of picked agents. These are
**cross-cutting** — they apply to any syndrome where the agent pair
fires.

### Shape

```ts
{
  id: "kebab-case-stable-id",
  agents: RegExp[],            // ALL must match (AND-semantics)
  sev: "stop" | "warn" | "note",
  headline: string,            // chart-ready sentence
  detail: string,              // what to do; ≤ 30 words
  evidence?: string,           // optional citation anchor
}
```

### When to add a rule

A new rule must clear **all** of:

- The interaction is published / society-recommended (not "I read
  it in a tweet").
- It changes management at the bedside (substitute, hold, monitor,
  escalate workup).
- It's not already adequately surfaced by the existing per-card
  `watchOut` text in 100% of the syndromes where the pair could fire.

If the third criterion fails — i.e. one card already covers it
clearly when picked — adding a combined-risks row is redundant.

---

## Style + voice contract

### Word budget

| Field | Max | Why |
|---|---|---|
| `pickIf` | 22 words | 5-second elevator pitch |
| `whyPick` bullet | 14 words | Scannable as a list |
| `watchOut.text` | 22 words | Single thought, single trigger |
| `extendIf` entry | 22 words | Mirror watchOut |
| `monitoring.what` | 22 words | The order itself |
| `monitoring.why` | 22 words | The clinical rationale |

### Voice rules

- **Declarative, not hedged.** "Renal-dose required" not "Consider
  renal dosing".
- **Numbers, not adjectives.** "CrCl < 30" not "renal impairment";
  "≥ 38 wk" not "late pregnancy"; "AUC 400–600" not "appropriate
  level".
- **Bold the killer fact.** Use `**...**` around the single number,
  cutoff, class advantage, or evidence anchor that makes the line
  decision-grade.
- **No personal pronouns.** "Don't" instead of "you shouldn't".
- **Active voice.** "Pip-tazo + vanco → AKI" not "AKI is caused by
  the combination".

### Bold-callout grammar

The renderer parses `**...**` and accents the wrapped text in the
entry's severity color. Bold the SINGLE element that drives the
decision:

- ✅ `"**CrCl < 30** — urine concentration drops below MIC"`
- ✅ `"**MIC > 1.5** by E-test → consider daptomycin"`
- ❌ `"**CrCl < 30 — urine concentration drops below MIC**"` (whole
  sentence bolded loses emphasis)
- ❌ `"avoid **nitrofurantoin** in renal impairment"` (drug name is
  obvious from context; bold should mark the decision driver)

---

## Severity vocabulary

| Surface | `stop` (red) | `warn` (amber) | `note` (muted) | `required` (red) | `trigger` (amber) | `consider` (muted) |
|---|---|---|---|---|---|---|
| watchOut | hard contraindication | important interaction or spectrum gap | useful context, not action-forcing | — | — | — |
| Monitoring items | — | — | — | must-do, mortality signal if missed | conditional / if-X-then-Y | optional escalation |
| Combined risks | do-not-combine | requires action | clinically relevant, routine | — | — | — |

**`stop` and `required` are scarce.** Reserve them for items where
omission is itself a hazard. Diluting them by overuse trains the
clinician's eye to skip them.

---

## Citation + evidence

Evidence anchors live in `duration.evidence`, `combinedRisk.evidence`,
and in compressed form inside `whyPick` bullets. Use:

- Trial name + year + finding (compressed): `"BALANCE 2024 — 7 vs 14 d
  non-inferior in controlled-source GNR bacteremia"`
- Guideline + year + summary: `"IDSA 2010 — 5-day nitrofurantoin
  equals 7-day"`
- Multiple references: `"Luther 2018, Bellos 2020 — meta-analyses"`

**Don't fabricate citations.** If the evidence is observational /
expert-consensus / undecided, say so:

- ✅ `"Observational signal RR ~1.5; mechanism debated"`
- ✅ `"Society-consensus; no RCT"`
- ❌ `"NEJM 2024 study"` (when no such study exists)

---

## Authoring a new syndrome — process

### Step 1: Add the syndrome to `syndromes.js`

`src/data/syndromes.js` is the source of truth for the syndrome's
ID, name, organisms, tier structure, and legacy duration narrative.
Add the new entry there first (this PR is the integrity-foundation
PR).

### Step 2: Author the regimen card content

Add the entry to `src/data/regimenContent.js` under
`REGIMEN_CONTENT[<id>][<tierLabel>]`. Write 1 matcher per option
the splitter produces (verify with the inline `node` probe pattern
from existing PRs).

### Step 3: Author the duration + monitoring content

Add the entry to `src/data/syndromeDecision.js` under
`SYNDROME_DECISION[<id>]`. Required fields per § 3. Branches must
carry explicit units. Add `matchAgent` / `matchBranch` / `matchCtx`
tags wherever a ctx field or sibling selection should elevate the
item.

### Step 4: Run the audit

```bash
npm run content:audit
```

The audit reports per-syndrome coverage and flags any entry that
violates the apex bar (missing fields, wrong shapes, wordcount
violations, malformed predicates, etc.). The audit is also a CI
gate — PRs with audit failures don't merge.

### Step 5: Visual review

```bash
npm run dev
# Navigate to your syndrome via the Case Bar or URL hash
```

Confirm at the bedside surface:

- Cards render with the right matchers
- Duration branches render in the right order with explicit units
- Monitoring items severity-group cleanly
- Cross-section selection (pick a card, click a branch) elevates
  the right items
- A ctx-loaded patient (e.g. low CrCl, severe, HD) elevates the
  matchCtx-tagged items
- Allergy-triggered ctx (anaphylaxis) banners the β-lactam cards

### Step 6: Open the PR

Follow the standard squash-merge pattern. CI runs the audit + the
existing render + a11y gates. Merge when green.

---

## The content-audit CI gate

The audit (`tests/content-audit.test.js`) is a hard CI gate. It
enforces the apex contract automatically so reviewers don't have to
manually verify every word-count, every required field, every
predicate shape.

### What it checks

- **Coverage**: every syndrome in `syndromes.js` either has content
  authored at apex bar OR is explicitly opted out (a follow-up PR
  to be authored). The audit reports per-syndrome status.
- **`pickIf`**: ≤ 22 words; ends with period or punctuation.
- **`whyPick`**: 3–5 bullets; each ≤ 14 words; at least one with
  `**bold**` markup.
- **`watchOut`**: ≥ 3 entries; valid `sev`; each `text` ≤ 22 words;
  at least one with `**bold**` markup.
- **`duration.headline`**: present; ≤ 22 words.
- **`duration.branches`**: ≥ 1; each branch has label, days
  (matching unit-string contract), detail; days never bare integer.
- **`duration.stopWhen`**: ≥ 3 items.
- **`duration.extendIf`**: ≥ 2 items (string or `{text, matchCtx?}`).
- **`monitoring.headline`**: present.
- **`monitoring.items`**: ≥ 3; each has valid `sev`, non-empty
  `what`, non-empty `why`.
- **`matchAgent`**: compiles as a regex.
- **`matchBranch`**: every label string matches an actual branch in
  the same syndrome's `duration.branches`.
- **`matchCtx`**: predicate shape valid (keys in known ctx set;
  comparator keys known; `between` is `[number, number]`).

### Running the audit locally

```bash
npm run content:audit           # full report
npm run content:audit -- <id>   # focus on one syndrome
```

---

## Anti-patterns that fail review

These trigger audit failures or human-reviewer rejection:

### "It's clinically obvious" (omitting the killer fact)

❌ `whyPick: ["Effective for cystitis", "Well-tolerated"]`
✅ `whyPick: ["**60× urinary concentration** with minimal systemic exposure", "**< 5% national E. coli resistance** despite decades of use"]`

### Hedging language

❌ `"Consider monitoring CrCl"`, `"May cause hyperkalemia"`,
   `"Could be useful in renal disease"`
✅ `"**Monitor SCr q24h**; pull AG ASAP after synergy phase"`

### Bare numbers without context

❌ `days: "5"`, `days: "1"`, `days: "Indefinite"` (rendered as "Indefinite" — OK)
✅ `days: "5 d"`, `days: "1 dose"`, `days: "Indefinite"`

### `matchCtx` referencing fields that don't exist

The audit catches this at CI. Use only the documented ctx fields
in § 5 unless extending the parser in the same PR.

### "Reserved for severe" (without saying what severe means)

❌ `"Reserve for severe disease"`
✅ `"Reserve for septic shock or ICU-level care"` + `matchCtx: { severe: true }`

### Walls of unbolded text

The `**bold**` markup carries the visual deciding-fact contract. If
a bullet has no bold callout, it's either filler (delete) or the
deciding fact isn't yet identified (find it before merging).

### Citations without verification

If you can't name the trial / guideline / year, don't fake it. The
phrase "society-consensus" is honest and useful; an unverified
citation that gets propagated is a clinical hazard.

---

## Process for scaling beyond one syndrome at a time

The architecture is designed so adding content scales linearly:

1. **One file per syndrome** is the eventual target layout
   (per-syndrome content modules — see roadmap). For now, content is
   in three shared files (`regimenContent.js`, `syndromeDecision.js`,
   `combinedRisks.js`). The per-syndrome module migration is a
   future PR; until then, the apex contract is enforced on whatever
   layout we have.
2. **The audit is the source of truth** — author against the gate,
   not against intuition. If the audit passes and the visual review
   passes, the content ships.
3. **Reuse the cross-section + ctx vocabulary** — every new
   syndrome should add tags wherever ctx fields or sibling
   selections drive a real decision. Items without tags are still
   useful, but ctx-tagged content is the differentiator.

---

## Quick reference: minimum viable apex entry

For a hypothetical new syndrome `myinfection`:

```js
// src/data/regimenContent.js
"myinfection": {
  "First-line": [
    {
      rx: /preferred-drug/i,
      pickIf: "Standard case, no contraindications.",
      whyPick: [
        "**Killer fact #1** with bolded driver",
        "**Killer fact #2** ...",
        "**Killer fact #3** ...",
      ],
      watchOut: [
        { sev: "stop", text: "**Hard contraindication trigger** — why" },
        { sev: "warn", text: "**Important interaction** — why" },
        { sev: "note", text: "Useful context (no decision change)" },
      ],
    },
  ],
},

// src/data/syndromeDecision.js
"myinfection": {
  duration: {
    headline: "X days standard; extended if Y.",
    evidence: "Guideline / trial citation, year",
    branches: [
      { label: "Standard", days: "7 d",
        detail: "From first effective dose; minimum X" },
      { label: "Complicated", days: "14 d",
        detail: "Add Y days for Z" },
    ],
    stopWhen: [
      "Criterion 1",
      "Criterion 2",
      "Criterion 3",
    ],
    extendIf: [
      "Trigger 1",
      "Trigger 2",
    ],
  },
  monitoring: {
    headline: "What to check at a glance.",
    items: [
      { sev: "required", what: "**Specific order**",
        why: "Why it matters at this site" },
      { sev: "trigger", what: "Conditional order if X",
        why: "What X means clinically",
        matchCtx: { severe: true } },
      { sev: "consider", what: "Optional escalation",
        why: "When it changes management" },
    ],
  },
},
```

This is the FLOOR — the minimum that passes the audit. Apex bar
is to push every entry past it: more bullets where they add value,
matchAgent / matchBranch / matchCtx tags wherever they apply,
evidence anchors on every duration.

---

_If the apex contract conflicts with completion deadline pressure,
the apex contract wins. Leave the entry unauthored rather than
shipping below-bar content. The Reference layer's narrative
fallback exists for exactly this case._
