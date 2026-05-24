---
title: Execution Plan — UX + Reference + Decide Restructure
author: From multi-agent strategic analysis (2026-05)
status: in-flight
---

# Execution Plan

Authored after the multi-agent strategic analysis identified the
information-architecture, decide-mode-input, and differentiation gaps
that hold the antibiotic guide back from being a tool clinicians
**demand** rather than tolerate. This document is the runbook that
sequences delivery, defines parallelization, and locks acceptance
criteria.

Pair with:
- `WORKFLOW.md` (how to add a syndrome / depth layer)
- `AUTHORING.md` (the content-quality contract)

---

## Positioning lock

> **The only inpatient antibiotic tool that gives the adult hospitalist
> a citation-anchored, branching, defensible regimen in under 90 seconds —
> with the pharmacist's counter-arguments already answered.**

Three deliberate non-goals: full drug-interaction database (Epocrates owns),
peds + outpatient breadth (Sanford), EHR/FHIR plumbing (Epic-procurement).

---

## Wave plan

Four execution waves. Items within a wave parallelize as noted. The 5
phases (A–E) from the strategic plan map onto waves so dependent work
lands in order while independent work runs side-by-side.

### Wave 1 — Foundation + Input redesign (target: 1 week)

Two phases in parallel. They touch different files so no merge conflict.

#### Phase A — Foundation fixes (single-threaded, ~5 d)

UI mechanical wiring. Touches `BedsideShell.jsx`, `AnswerCanvas.jsx`,
`App.jsx` — all the same files, so sequential by me.

| # | Deliverable | Acceptance | Files |
|---|---|---|---|
| A1 | Wire dead chips in decide | clicking a drug name opens drawer; org / cite the same | `BedsideShell.jsx` |
| A2 | Mount global ⌘K in decide | search palette opens with ⌘K / ctrl-K on decide mode | `BedsideShell.jsx` |
| A3 | AnswerCanvas spine | sticky chip strip jumps to: Start now · Covers · Stop · Duration · Monitoring · More depth | `AnswerCanvas.jsx` |
| A4 | Promote regimen visual weight | drug name is the eye-magnet (h2-equivalent typography) | `AnswerCanvas.jsx` |
| A5 | Split-editor Edit Case | edit overlay sits beside answer; chip toggle re-renders live | `BedsideShell.jsx` |
| A6 | Rename "Reference" tab → "Formulary" + redistribute its 4 sections | β-lactamase ladder → Mechanisms; allergy map → Safety; delabeling → Safety; formulary → Reference rename | `App.jsx`, `ui-maps.js` |
| A7 | Reference → Decide deep-link | every syndrome card has "Open as case" → switches mode | `App.jsx` |

Acceptance: e2e suite (62/26 baseline) still passes; no new console errors; ⌘K opens in decide; "Open as case" button works for ≥ 5 syndromes.

#### Phase C — Hybrid case-input redesign (background, ~5 d)

Parallel agent delivers: `caseParser.js` extension (different file from A);
then I wire the wizard UI when A1–A4 land.

| # | Deliverable | Acceptance |
|---|---|---|
| C1 | Extend `SYN_KEYWORDS` from ~40 → 117 syndromes (`caseParser.js`) | `parseCase` returns a syndrome for every catalog entry given a plausible utterance |
| C2 | Replace single-line CaseBar with 2-row hybrid | text field on top + structured wizard below; both bind to caseState |
| C3 | Progressive disclosure wizard | Syndrome / Age / Sex / CrCl-band / Allergy / 4 risk toggles visible default; hepatic / pregnancy / transplant / weight behind disclosure |
| C4 | Recently-used chips | top of CaseBar shows 3–6 chips from localStorage |
| C5 | Wizard-wins-over-parser when manually touched | chip locks with indicator; parser cannot overwrite |

Acceptance: all 117 syndromes reachable from free-text input ≥ 1 alias each;
recently-used chip restores prior case in 1 tap; e2e CaseBar tests still pass.

### Wave 2 — Reference IA restructure (target: 1.5–2 weeks)

Phase B. Heavy structural work. Parallelizable into **6 streams** because each new section is a new file/component.

Coordinator (me): nav skeleton + integration (B1 + B7).
Parallel agents: B2–B6 each draft a self-contained section component.

| # | Deliverable | Owner | Acceptance |
|---|---|---|---|
| B1 | New 5-section left-nav + responsive shell | me | Sections render with placeholder content; URL hash routes to section |
| B2 | SYNDROMES section (faceted catalog) | agent | All 106 syndromes filterable by category; each card renders depth layers inline |
| B3 | AGENTS section | agent | All 49 agents browsable; cards show spectrum / dose / penetration / toxicity |
| B4 | ORGANISMS section | agent | All 49 organisms browsable; cards show directed therapy + resistance trend |
| B5 | COMPARE section | agent | Spectrum × penetration × toxicity matrices; drug-vs-drug picker |
| B6 | PRINCIPLES section | agent | Approach + PK/PD + mechanisms + course + evidence library + EVOLVING |
| B7 | Widen ⌘K search index | me | Indexes 3k+ strings: syndrome bugs / pearls / organism / drug spec / guideline titles / depth-layer headlines |

Acceptance: every fast-answer use case (5 from Agent 3 strategic analysis) solvable in ≤ 2 clicks; old 11-tab routes still 301 to new IA so any existing hash bookmarks survive.

### Wave 3 — Differentiation layer (target: 2–3 weeks)

Phase D. The competitive moat. Two streams.

#### Stream D1 — Reasoning-trace authoring (multi-tranche parallel)

Author 106 syndrome rationales (2–4 sentences each: which patient feature drove the choice + which guideline section + what alternative was rejected). Use the same tranche pattern that shipped Phase F research panels.

| Tranche | Cluster | Count | Owner |
|---|---|---|---|
| D1.1 | High-volume cluster (sepsis, sab, cap, hap, meningitis, cdiff, cellulitis, pyelo, ie, peritonitis) | 10 | agent |
| D1.2 | Abdominal + bone/joint | ~12 | agent |
| D1.3 | Bloodstream / resistance | ~10 | agent |
| D1.4 | Pulmonary tail | ~10 | agent |
| D1.5 | SSTI tail | ~10 | agent |
| D1.6 | Toxin / GI | ~7 | agent |
| D1.7 | Special hosts | ~7 | agent |
| D1.8 | Head/neck + CNS | ~8 | agent |
| D1.9 | GU + abdominal tail | ~12 | agent |
| D1.10 | Final tail | ~20 | agent |

Parallel: 3 agents concurrently (different files? no — same `syndromeDecision.js`; concurrent edits conflict). Run sequentially via background agents; each tranche is small enough to ship as its own PR.

Engine + UI: small (renders the trace inside each tier card or as new top-level block above duration). One-time work, ~2d.

#### Stream D2 — Pharmacist challenge mode (multi-tranche parallel)

Author 106 syndrome objections — the predictable pharmacy/ID pushback ("why not narrower?", "why not oral step-down?", "renal dosing concern?") and pre-answer it inline. Same tranche pattern as D1.

Engine + UI: same shape as research-block + reasoning-trace. ~2d.

#### Stream D3 — Two-way evidence map

Single agent. Build the link graph between `GUIDELINES` (60 entries) and `syndromeDecision.research` (106 panels × ~3 trial citations each ≈ 300 edges). Render: open MERINO → "decisions powered by this trial" list; open pyelo → "trials shaping this recommendation". ~3d.

### Wave 4 — BYO antibiogram (target: 2–3 weeks, defer until D ships)

Phase E. Held until D ships — proves the product model first.

| # | Deliverable | Effort |
|---|---|---|
| E1 | CSV antibiogram parser (start minimal: pathogen × agent → susceptibility %) | 4d |
| E2 | Overlay engine — flag empiric where local resistance > 20% + propose alternatives | 3d |
| E3 | Antibiogram management UI (preview / save / version / share-by-link) | 3d |
| E4 | Persist per-institution antibiogram in localStorage | 1d |

User has indicated their hospital antibiogram will be provided for review and incorporation. Phase E delivers the upload pipe; the user's antibiogram is the proof point.

---

## Multi-agent deployment rules

**Use parallel agents when:**
- Work touches **different files** (no merge conflict)
- Each piece of work has a **self-contained acceptance criterion**
- The aggregate context fits in the session

**Do NOT use parallel agents when:**
- Work touches the **same file** (orchestration cheaper than conflict resolution)
- Coordination overhead exceeds the parallel-time savings
- The work is mostly mechanical wiring (the model is faster than agent briefing)

**Optimal agent count per wave:**
- Wave 1: 1 background agent (C parser) + me on A
- Wave 2: up to 5 concurrent agents on B2–B6 (different files); me coordinates B1 + B7
- Wave 3: up to 3 concurrent agents on D1 tranches (sequential per-file but parallel across files where possible); plus 1 agent each on D2 + D3
- Wave 4: single-threaded (heavy integration work)

---

## Risk register

| Risk | Tier | Mitigation |
|---|---|---|
| Wave 2 reorganization disorients power-users | Medium | Keep ⌘K muscle-memory; old hashes redirect to new IA |
| Reasoning traces are 106-syndrome auth effort | Medium | Tranche pattern proven (shipped 106 research panels same way) |
| Pharmacist objections require clinical accuracy | High | Multi-agent clinical-accuracy review pattern from Tranche 1 of triage — proven to catch errors before ship |
| Sanford/UTD copy "reasoning trace" within 12 months | Medium | Lead with pharmacist mode + case branching — design DNA incumbents lack |
| Subscription competitor reflex ("we already pay for UTD") | High | Free individual tier for trainees — bottom-up demand |
| AI-CDSS narrative wins headlines, deterministic loses | Medium | Position explicitly as defensible / citation-checkable / anti-black-box |
| Multi-agent content authoring drifts from apex contract | Low | 1733 audit gates catch every documented class of contract violation |

---

## Acceptance criteria for "done"

Each phase ships when:
1. **Audit gates green** — `npm run content:audit` passes
2. **Unit suite green** — `npm run test` passes
3. **E2E baseline preserved or improved** — 62/26 pre-existing or better
4. **No new console errors** in the 10 fixture renders
5. **Build clean** — no new warnings (chunk-size warning OK; pre-existing)
6. **PR description** carries a coverage / impact / risk delta

The bar that ships the tool stays the bar that ships the next change.

---

## Decision points

Decisions locked by the user (2026-05):
1. **Parallelize where files don't conflict** — confirmed
2. **All 106 syndromes for D1 + D2 rationales/objections** — confirmed
3. **Hospital antibiogram provided later** — Phase E scoped accordingly

Open decisions (not blocking; will request when reached):
- D2 objection authoring: should agents have access to a "common pharmacist pushback" reference list to draw from, or compose fresh? (Default: compose fresh, then validate with clinical-accuracy agent)
- Wave 4 antibiogram parser scope: CSV-first or PDF-OCR? (Default: CSV-first; PDF later)
- Free trainee tier: implement now or after differentiators ship? (Default: after — protects effort)
