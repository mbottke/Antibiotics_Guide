/* component · Answer Canvas — Phase A.2 of the bedside reframe.
   The primary output surface of Bedside mode: one composed page per case,
   no horizontal context switching. Receives the case state, calls the pure
   composeAnswer engine, and renders the regimen, refinements, coverage,
   reassessment plan, duration, and pearls in the order a clinician thinks.

   The critical design choice: refinements (allergy substitution,
   nephrotoxic pairing, redundant coverage) are fused into the regimen
   prose as numbered footnote markers, with the numbered reasons rendered
   directly below each line. This collapses what the classic UI presented
   as a separate panel into the place where the user actually reads.

   Wave 8 W8-A — Answer Canvas creative reframe.
   ---------------------------------------------
   This pass is visibly transformative. The 10 moves below are observable
   in the diff vs. the prior Wave 7 baseline:

     1. ASYMMETRIC LAYOUT — covers, monitoring, duration (structured),
        and start layers now host a 65/35 grid via Section's `aside`
        slot. The narrow column carries metadata (organisms, branches,
        reassess targets, CrCl + tabular doses). The hero gets a 240px
        italic-serif decorative numeral (delegated to GradientMeshHero +
        a freshly-added WatermarkLetter overlay).

     2. VERTICAL LEFT-RAIL LABELS — each major Section now renders a
        90deg-rotated mono-uppercase label running up its left edge
        ("COVERAGE", "MONITORING", "DURATION", ...). Cyan-accented,
        .14em letterspaced. Section.jsx owns the rendering; AnswerCanvas
        passes the label as a `rail` prop on each layer's Section.

     3. KINETIC ADOPTION — every section's `kicker` now wears the
        .rx-display-l 48px sans display class (from kinetic-type),
        and a .rx-counter "01 / N" pin sits top-right of each section.
        The hero's `syndromeName` uses the editorial-display chain
        already wired in GradientMeshHero.

     4. ASYMMETRIC CARDS + DECORATIVE PRIMITIVES — AsymmetricCard wraps
        key tier cards with alternating tl-br / tr-bl flip patterns
        down the page. GradientHairline appears between every major
        section (replacing flat dividers). Sparkle markers next to the
        first Start tier, MRSA / ESBL flags, and drug-of-choice chips.
        DottedGrid sits as the backdrop behind the hero only.

     5. SECTION DECORATIVE NUMERALS — Section.jsx renders a 240px italic-
        serif numeral (01, 02, ...) per section at z-index 0 behind the
        panel, derived from `index`.

     6. SPINE → DOCKED VERTICAL LEFT RAIL — on viewports ≥ 1280px the
        spine chip strip switches from a horizontal frosted-glass bar
        into a vertical sticky rail at the page's left edge, with an 8px
        dot + 11px mono label per item. The active item gets a cyan dot
        + cyan label + 2px translateX shift. Below 1280px the original
        frosted-glass strip stays. The toggle is CSS-only, via an
        injected style block + data-attribute selectors.

     7. STAGGERED REVEAL — every direct child of the canvas root carries
        .rx-fade-in-up with cascading `animationDelay: ${i * 60}ms`.
        Children include the hero wrapper, depth-layers banner, spine,
        tab tray, every layer card, the action bar, and the disclaimer
        — the whole canvas arrives orchestrated rather than snapping.

     8. PRIMARY CTA — "Copy as EHR note" now reads as a cyan-glow gradient
        button: linear-gradient(135deg, var(--ox-deep), var(--ox-bright)),
        asymmetric 12/3/12/3 radius, cyan boxShadow + inset highlight,
        hover translateY(-2px). The .rx-shine-sweep class drives the
        cyan highlight sweep on hover.

     9. ICON CHIPS — Section.jsx now renders the section's `icon` inside
        a 40×40 asymmetric (10/3) gradient tile (cyan-deep → cyan-bright,
        white SVG, cyan glow at -8px offset).

    10. NUMERIC EMPHASIS — CrCl, dose bands, branch counts, organism
        counts, duration values all now wear .rx-numeric-mega (italic-
        serif tabular numerics, .04em tracking, color var(--neon-cyan)).
        Adopted across covers, start, monitoring, duration, and
        duration-legacy layers.

   ZERO functional changes — refinement flow, drawer opens, copy-to-
   clipboard, chip click handlers, branch sync all still work. Tests
   continue to pass.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Check, ListChecks, Pencil, ShieldCheck } from "lucide-react";
import { composeAnswer } from "../engines/regimen.js";
import { useBedsideFlowCtx } from "./util/BedsideFlowContext.js";
import { computeDose } from "../engines/dosing.js";
import { allergyGuidance } from "../engines/clinical.js";
import { getRegionalForSyndrome } from "../data/regionalResistance.js";
import { getNovelForSyndrome } from "../data/novelAgents.js";
import { getSurgeForSyndrome } from "../data/surgeProtocols.js";
import { getPenetrationForSyndrome } from "../data/sitePenetration.js";
import { getPedsPregForSyndrome } from "../data/pedsPregDosing.js";
import { getDiagnosticsForSyndrome } from "../data/diagnostics.js";
import { getOPATForSyndrome } from "../data/opatDecision.js";
import {
  getSyndromeDuration, getSyndromeMonitoring, getSyndromeResearch,
  getReasoningForSyndrome, getObjectionsForSyndrome,
} from "../data/syndromeDecision.js";
import { LAYERS } from "./answer-layers/_index.js";
import { MechanismDrawer } from "./MechanismDrawer.jsx";
import { GradientMeshHero } from "./GradientMeshHero.jsx";
import { DottedGrid } from "./decor/DottedGrid.jsx";
import { WatermarkLetter } from "./decor/WatermarkLetter.jsx";
import { GradientHairline } from "./decor/GradientHairline.jsx";
import { MeshWash } from "./decor/MeshWash.jsx";
import { SceneBreak } from "./decor/SceneBreak.jsx";

/* Wave 12 W12 · hierarchical breathing rooms.
   Strategic SceneBreak placements between answer-layer epochs. Each
   entry maps a layer id to the SceneBreak to render BEFORE that layer,
   provided at least one prior layer was rendered (so we never open a
   canvas with a chapter break). Quality > quantity: exactly four
   transitions, mapped to the clinical reasoning epochs:

     · workup     → start         (numeral "02"  before ans-start)
     · empiric    → challenge     (phrase before ans-risks)
     · reassess   → evidence      (phrase before ans-regional)
     · close      → pearls        (ornament before ans-pearls)

   Layers that don't appear in the visible list (e.g. because their
   `when` predicate is false) cause the scene break to no-op — the loop
   only fires it when the marker layer is about to render and at least
   one earlier layer has already rendered. */
const W12_SCENE_BREAKS = {
  "ans-start":    { variant: "numeral",  mark: "02" },
  "ans-risks":    { variant: "phrase",   mark: "on de-escalation" },
  "ans-regional": { variant: "phrase",   mark: "evidence overlay" },
  "ans-pearls":   { variant: "ornament" },
};

/* ---------- W8 reframe stylesheet ----------
   A scoped style block emitted once at the top of the canvas. Carries:

     • `.rx-answer-canvas-root` — the root wrapper that hosts the
       vertical sticky rail at ≥1280px. CSS Grid switches from single-
       column on narrow viewports to a "[rail 200px][content 1fr]"
       layout when there's room for the vertical rail.
     • `.rx-vertical-rail` — the docked vertical rail container,
       sticky at top:100px with 8px dots + 11px mono labels per item.
     • `.rx-vertical-rail__item` — per-spine entry; an 8px dot + label.
     • `.rx-vertical-rail__item[data-active="true"]` — active state
       (cyan dot + cyan label + 2px translateX shift).
     • `.rx-horizontal-spine` — the existing frosted-glass strip.
       Hidden at ≥1280px in favor of the vertical rail.
     • `.rx-section-rail` — vertical 90deg-rotated label on each Section.
       Hidden below 1200px so the section header doesn't collide with
       the rail label.
     • `.rx-cta-ehr` — the cyan-glow gradient primary CTA + hover.
     • `.rx-section-split` — flexes the 65/35 grid back to single-col
       below 900px so the aside doesn't crush on narrow viewports.

   All animations honour prefers-reduced-motion via the kinetic-type +
   microinteractions modules' shared @media guard. */
const W8_STYLES = `
.rx-answer-canvas-root{
  position: relative;
  margin-top: 6px;
}
@media (min-width: 1280px){
  .rx-answer-canvas-root[data-has-vertical-rail="true"]{
    display: grid;
    grid-template-columns: 200px minmax(0, 1fr);
    gap: 28px;
    align-items: start;
  }
  .rx-answer-canvas-root[data-has-vertical-rail="true"] .rx-horizontal-spine{
    display: none;
  }
  .rx-answer-canvas-root[data-has-vertical-rail="true"] .rx-vertical-rail{
    display: flex;
  }
}
.rx-vertical-rail{
  display: none;
  flex-direction: column;
  gap: 10px;
  position: sticky;
  top: 100px;
  padding: 16px 8px 16px 12px;
  border-left: 2px solid var(--line);
  font-family: var(--mono);
}
.rx-vertical-rail__heading{
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--ox);
  margin-bottom: 6px;
  padding-left: 18px;
}
.rx-vertical-rail__item{
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: .04em;
  color: var(--ink2);
  background: none;
  border: none;
  padding: 4px 4px 4px 18px;
  cursor: pointer;
  text-align: left;
  transition: color var(--duration-base, 200ms) var(--ease-out), transform var(--duration-base, 200ms) var(--ease-out);
}
.rx-vertical-rail__item::before{
  content: "";
  position: absolute;
  left: 1px;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--line);
  transform: translate(-50%, -50%);
  transition: background var(--duration-base, 200ms) var(--ease-out), box-shadow var(--duration-base, 200ms) var(--ease-out);
}
.rx-vertical-rail__item:hover{
  color: var(--ink);
}
.rx-vertical-rail__item[data-active="true"]{
  color: var(--ox);
  transform: translateX(2px);
  font-weight: 700;
}
.rx-vertical-rail__item[data-active="true"]::before{
  background: var(--neon-cyan, var(--ox));
  box-shadow: 0 0 0 3px var(--neon-cyan-soft, var(--ox-soft));
}

/* Horizontal spine — Wave 6 W6-B aesthetic preserved. Hidden when the
   vertical rail engages at ≥1280px (see media query above). */
.rx-horizontal-spine{
  position: sticky;
  top: 0;
  z-index: 5;
  margin: -2px -2px 14px;
  padding: 9px 10px;
  background: color-mix(in srgb, var(--paper) 68%, var(--neon-cyan-soft, var(--ox-soft)) 32%);
  -webkit-backdrop-filter: saturate(170%) blur(16px);
  backdrop-filter: saturate(170%) blur(16px);
  border: 1px solid color-mix(in srgb, var(--line) 70%, var(--neon-cyan-line, var(--line)) 30%);
  border-radius: 12px;
  box-shadow: 0 1px 0 rgba(255,255,255,.7) inset, var(--shadow-e1);
}

/* Section rail — keep the rotated label out of narrow viewports so it
   doesn't collide with the section header. */
@media (max-width: 1199px){
  .rx-section-rail{ display: none; }
}

/* Section split grid — collapse below 900px so the aside drops below
   the main column instead of crushing. */
@media (max-width: 899px){
  .rx-section-split{
    grid-template-columns: minmax(0, 1fr) !important;
  }
  [data-section-aside]{
    border-left: none !important;
    padding-left: 0 !important;
    border-top: 1px solid var(--line2) !important;
    padding-top: 14px !important;
    margin-top: 4px !important;
  }
}

/* Primary CTA — cyan-glow gradient "Copy as EHR note" button.
   Background is a 135deg gradient on the existing ox-deep → bright
   tokens (deep oxblood-pink, modern). Asymmetric 12/3/12/3 corners.
   Hover lifts by 2px and expands the glow; .rx-shine-sweep handles
   the diagonal cyan highlight sweep across the button face. */
.rx-cta-ehr{
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--sans);
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: .02em;
  color: #fff;
  background: linear-gradient(135deg, var(--ox-deep), var(--ox-bright, var(--ox)));
  border: 1px solid var(--ox-deep);
  border-radius: 12px 3px 12px 3px;
  padding: 11px 18px;
  cursor: pointer;
  box-shadow:
    0 6px 18px -6px var(--neon-cyan, var(--ox)),
    0 2px 6px -2px rgba(0,0,0,.18),
    inset 0 1px 0 rgba(255,255,255,.22);
  transition:
    transform 200ms cubic-bezier(0.16,1,0.3,1),
    box-shadow 200ms cubic-bezier(0.16,1,0.3,1);
}
.rx-cta-ehr:hover, .rx-cta-ehr:focus-visible{
  transform: translateY(-2px);
  box-shadow:
    0 12px 28px -8px var(--neon-cyan, var(--ox)),
    0 4px 10px -2px rgba(0,0,0,.22),
    inset 0 1px 0 rgba(255,255,255,.28);
  outline: none;
}
@media (prefers-reduced-motion: reduce){
  .rx-cta-ehr, .rx-cta-ehr:hover{ transition: none !important; transform: none !important; }
  .rx-vertical-rail__item{ transition: none !important; transform: none !important; }
}
/* Inter-layer hairlines — between every authored answer-canvas layer
   we drop a GradientHairline with margin 4px 0 20px. On mobile the
   24px combined vertical breather adds up across 8-12 layers, which
   pushes real clinical content off the fold. Tighten to 8px on
   <=720px; the hairline still reads as a soft seam. */
@media (max-width: 720px){
  .rx-answer-layer-hairline{ margin: 2px 0 6px !important; }
}
`;

/* ---------- the canvas itself ---------- */
function AnswerCanvas({ caseState, setCaseState, onEditCase, onDrug, onOrg, onCite, antibiogram, onOpenAntibiogramManager }) {
  const ans = useMemo(() => composeAnswer(caseState), [caseState]);
  const [copied, setCopied] = useState(false);

  /* Wave 12 W12 · pull bedside flow context so we can render the
     transient entrance choreography (F3), the idle CTA pulse (F4), the
     finding-applied glow (F5), and the deep-scroll / deep-rest static
     state ramps (F6 / F7). The context provider lives in BedsideShell. */
  const flow = useBedsideFlowCtx();
  const [entranceGlow, setEntranceGlow] = useState(false);
  const [spineSweep, setSpineSweep] = useState(false);
  /* F5 — when flow.findingApplied bumps, paint a transient cyan inset
     glow over the visible layer that owns the change. Without a precise
     mapping from "which finding fired which layer" we briefly highlight
     the reassessment layer that holds the directed regimen and the
     duration/monitoring layers, which is where reassessment changes land. */
  const [findingGlowToken, setFindingGlowToken] = useState(0);
  const prevFindingRef = useRef(flow.findingApplied);
  useEffect(() => {
    if(flow.findingApplied !== prevFindingRef.current) {
      prevFindingRef.current = flow.findingApplied;
      if(!flow.reducedMotion) {
        setFindingGlowToken(t => t + 1);
      }
    }
  }, [flow.findingApplied, flow.reducedMotion]);

  /* F3 · play a brief entrance glow halo + sequential spine sweep when
     the canvas first mounts under a syndrome. We gate on a single
     useEffect that fires once per AnswerCanvas mount. Reduced-motion path
     leaves both flags false. */
  useEffect(() => {
    if(flow.reducedMotion) return undefined;
    if(typeof window === "undefined") return undefined;
    setEntranceGlow(true);
    setSpineSweep(true);
    const t1 = window.setTimeout(() => setEntranceGlow(false), 360);
    const t2 = window.setTimeout(() => setSpineSweep(false), 1100);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Wave 5 CL-3 · mechanism drawer state owned at the canvas root.
     Threaded to every rendered ClassChip / TermChip via the shared bag,
     consumed inside `renderText` paths. Click on any class or resistance
     chip with an authored mechanism shows the drawer; the snapshot-only
     contract means the key is component state, never URL or storage. */
  const [mechanismKey, setMechanismKey] = useState(null);
  const _onOpenMechanism = (key) => setMechanismKey(key);
  const _closeMechanism = () => setMechanismKey(null);

  /* Wave 8 W8-A · active spine item tracking — drives the vertical
     rail's active dot + label state. Set on click; visual feedback only
     (the page-scroll handler is the source of truth for what's actually
     on screen, but for the W8 reframe we treat click as "intent"). */
  const [activeSpineId, setActiveSpineId] = useState(null);

  /* Wave 5 CL-5 · layer-group tab strip (PR-12).
     The `group` field on every LAYERS entry routes layers into
     6 tabs: Core / Risks / Duration / Local / Special / Evidence.
     Default tab = "all" so the canvas surfaces every authored layer
     on initial load (mirrors the user's "I know it's likely there"
     framing); tab clicks narrow the view to a single group when the
     clinician wants focused reading. State persists in localStorage
     so a user's preferred reading rhythm survives a page refresh. */
  const _readLayerTab = () => {
    try {
      if (typeof window === "undefined") return "all";
      const v = window.localStorage?.getItem("ab_layer_tab");
      return v && /^(core|risks|duration|local|special|evidence|all)$/.test(v) ? v : "all";
    } catch (e) { return "all"; }
  };
  const _writeLayerTab = (v) => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage?.setItem("ab_layer_tab", v);
    } catch (e) {}
  };
  const [layerTab, setLayerTab] = useState(_readLayerTab);
  const _selectLayerTab = (v) => { setLayerTab(v); _writeLayerTab(v); };

  /* Phase D3.1 cross-section selection state — multi-tier aware.
       picksByTier  — { [tierLabel]: agentText | null } — one pick
                      per tier (Core / Add MRSA / Add resistant-GNR
                      cover / etc.). The actual regimen is the UNION
                      of picks across every tier (cefepime + vanco,
                      not just whichever was clicked last). Combined-
                      regimen risk detection (D3.2) runs against this
                      union so pairs like pip-tazo + vanco fire even
                      when picked from separate tiers.
       pickedAgents — the union derived from picksByTier; consumed by
                      every downstream matcher (matchAgent regex on
                      duration branches + monitoring items, combined-
                      risk pair detection).
       pickedBranch — the duration branch the clinician clicked in
                      DurationBlock; null when no manual selection.

     The state is intentionally local to AnswerCanvas — it's
     ephemeral UI exploration, not part of the persisted caseState. */
  const [picksByTier, setPicksByTier] = useState({});
  const [pickedBranch, setPickedBranch] = useState(null);

  const pickedAgents = useMemo(
    () => Object.values(picksByTier).filter(Boolean),
    [picksByTier]
  );

  /* Per-tier pick setter — a curried factory so each RxLine can
     report into its own tier slot without colliding with sibling
     tiers' picks. The tier label is the key (tier.k); null clears
     the pick for that tier (currently unused but supported). */
  const setTierPick = (tierLabel) => (agentText) => {
    setPicksByTier(prev => ({ ...prev, [tierLabel]: agentText }));
  };

  /* Bidirectional bridge: the sourceControlled chip in
     ReassessmentPanel and the matching duration branch represent
     the same clinical fact. When either changes, the other syncs.

     Source-of-truth resolution:
       1. If user manually clicked a duration branch → that wins
          (pickedBranch state).
       2. Else if the sourceControlled chip is checked → light the
          first "uncomplicated / source controlled"-labeled branch.
       3. Else if a regimen agent has matchAgent matching a branch
          → light it (the existing auto-derivation).
     Branches click handler also toggles the chip to keep the two
     UI surfaces consistent; the bridge is symmetric. */
  const sourceControlled = !!caseState.clinical?.sourceControlled;
  const setSourceControlled = (val) => setCaseState(c => ({
    ...c, clinical: { ...(c.clinical || {}), sourceControlled: !!val }
  }));

  const effectiveBranch = useMemo(() => {
    if(pickedBranch) return pickedBranch;
    if(!ans?.syndrome) return null;
    const dur = getSyndromeDuration(ans.syndrome.id);
    if(!dur?.branches) return null;
    if(sourceControlled) {
      const b = dur.branches.find(br => /uncomplicated|source[\s-]?controlled/i.test(br.label));
      if(b) return b.label;
    }
    // Any picked agent whose matchAgent regex hits a branch lights
    // that branch. First match wins — picks from earlier tiers
    // (Core) take precedence over later ones (Add) which matches
    // the visual / clinical reading order.
    for(const agent of pickedAgents) {
      const match = dur.branches.find(b => b.matchAgent && b.matchAgent.test(agent));
      if(match) return match.label;
    }
    return null;
  }, [pickedAgents, pickedBranch, sourceControlled, ans]);

  /* When a branch is clicked, also flip the sourceControlled chip
     to match (set on the source-controlled branch, clear on others).
     This is the second leg of the bidirectional bridge. */
  const handleBranchSelect = (label) => {
    if(label === null) { setPickedBranch(null); return; }
    setPickedBranch(prev => (prev === label ? null : label));
    if(ans?.syndrome) {
      const dur = getSyndromeDuration(ans.syndrome.id);
      const branch = dur?.branches?.find(b => b.label === label);
      const isSourceBranch = branch && /uncomplicated|source[\s-]?controlled/i.test(branch.label);
      setSourceControlled(!!isSourceBranch);
    }
  };

  /* Start date for the duration clock. Was owned by ReassessmentPanel;
     moved here so it can be threaded into DurationBlock (where the
     stop-date math lives) without zigzagging through caseState. */
  const startDate = caseState.startDate || "";
  const setStartDate = (sd) => setCaseState(c => ({ ...c, startDate: sd || null }));

  if(!ans) {
    /* W10 · upgraded the bedside "no syndrome yet" panel from a flat
       dashed box to a cinematic editorial empty state. 160px italic-serif
       "?" cyan-soft glyph, mono kicker, italic-serif headline + standfirst,
       and a hint that the user can dictate or type into the Case Bar above.
       aria-live="polite" so screen readers hear the state transition. */
    return (
      <div
        role="status"
        aria-live="polite"
        className="rx-fade-in-up"
        style={{
          position: "relative",
          padding: "44px 22px 48px",
          textAlign: "center",
          background:
            "linear-gradient(135deg, var(--paper2) 0%, var(--ox-softer, var(--paper)) 100%)",
          border: "1px dashed var(--line)",
          borderTopLeftRadius: 18,
          borderTopRightRadius: 4,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 18,
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 160,
            lineHeight: 0.95,
            color: "var(--ox-soft, var(--neon-cyan-soft))",
            marginBottom: 4,
            letterSpacing: "-.04em",
          }}
        >
          ?
        </div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 10,
          }}
        >
          Awaiting case
        </div>
        <h3
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: "-.02em",
            margin: "0 0 8px",
            color: "var(--ink)",
          }}
        >
          Pick a syndrome to assemble an empiric regimen
        </h3>
        <p
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 15,
            color: "var(--ink2)",
            margin: "0 auto",
            lineHeight: 1.55,
            maxWidth: "46ch",
          }}
        >
          Type or dictate into the Case Bar above — once a syndrome is
          recognised, the regimen, coverage, duration, and pearls compose here.
        </p>
      </div>
    );
  }

  const s = ans.syndrome;
  const allergy = allergyGuidance(ans.ctx.blAllergy);
  const riskLabels = [
    ans.ctx.mrsaRisk && "MRSA",
    ans.ctx.pseudoRisk && "Pseudomonas",
    ans.ctx.esblRisk && "ESBL / R-GNR",
    ans.ctx.severe && "severe / shock",
  ].filter(Boolean);

  // Per-tier refinements: we attach every refinement step to the core line
  // for now; the parser cannot reliably distinguish which add-on a
  // cross-cutting step belongs to. Future work: per-line refinement scope.
  const coreRefinements = ans.refinement.steps;
  const dose = (name) => computeDose(name, { on: ans.ctx.on, crcl: ans.d.crcl });

  /* EHR note builder — re-uses the existing copy semantics from RegimenCard. */
  const copyNote = () => {
    const lines = [
      s.name,
      "",
      `CORE — ${ans.core.k}: ${ans.core.rx}`,
      ...ans.adds.map(a => `ADD — ${a.k}: ${a.rx}`),
      "",
      `Covers: ${s.cover.empiric}`,
      `Avoid / instead: ${s.cover.drop}`,
      `Duration: ${s.duration}`,
      `48–72 h: ${s.deesc}`,
      ans.ctx.on && ans.empiricAgents.length ? `\nDosing @ CrCl ${ans.d.crcl ?? "—"}: ${ans.empiricAgents.map(n => { const a = dose(n); return `${n} ${a && a.adjusted ? a.adjusted : ""}`; }).join("; ")}` : "",
      ans.refinement.steps.length ? `\nRefinements:\n${ans.refinement.steps.map((st, i) => `${i+1}. ${st.type === "substitute" && st.replacement ? `${st.agent} → ${st.replacement}` : st.agent}: ${st.reason}`).join("\n")}` : "",
    ].filter(Boolean);
    const text = lines.join("\n");
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1800); };
    try {
      if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
      else done();
    } catch(e){ done(); }
  };

  /* Phase L+ UX optimization (multi-agent triage): count populated
     depth layers + decide which collapse by default. PedsPreg gated
     on ctx pregnancy or pediatric age — adults don't need it on
     screen. SurgeProtocols tier-1 always-visible; non-tier-1
     collapsed with the reference layers (Research, SitePenetration). */
  const _diagnostics = getDiagnosticsForSyndrome(s.id);
  const _opat = getOPATForSyndrome(s.id);
  const _duration = getSyndromeDuration(s.id);
  const _monitoring = getSyndromeMonitoring(s.id);
  const _research = getSyndromeResearch(s.id);
  const _rationale = getReasoningForSyndrome(s.id);
  const _objections = getObjectionsForSyndrome(s.id);
  const _regional = getRegionalForSyndrome(s.id);
  const _novel = getNovelForSyndrome(s.id);
  const _surge = getSurgeForSyndrome(s.id);
  const _surgeTier1 = _surge.filter(p => p.severity === "tier-1");
  const _surgeOther = _surge.filter(p => p.severity !== "tier-1");
  const _siteP = getPenetrationForSyndrome(s.id);
  const _pedsPreg = getPedsPregForSyndrome(s.id);
  const _ctxPedsPreg = ans.ctx.pregnancy === true || (typeof ans.ctx.age === "number" && ans.ctx.age < 18);
  const _pedsPregShow = _ctxPedsPreg ? _pedsPreg : [];
  const _depthCount = [
    _duration ? 1 : 0,
    _monitoring ? 1 : 0,
    _research ? 1 : 0,
    _regional.length ? 1 : 0,
    _novel.length ? 1 : 0,
    _surge.length ? 1 : 0,
    _siteP.length ? 1 : 0,
    _pedsPreg.length ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  /* Wave 5 PR-3 — layer registry shared bag. The bag below is the
     single source of truth that LAYERS predicates consult; the JSX
     below threads the same locals. Centralizing the bag eliminates
     the drift bug where the spine and the render block could
     disagree about whether a section should be visible (the spine
     was hand-maintained against the same predicates expressed twice).

     Layers consume the bag through `LAYERS[i].when(shared)`. The
     `group` field on each LAYERS entry sets up the PR-12 layer-group
     tab strip (Core / Risks / Duration / Local / Special / Evidence)
     without yet activating it; today the spine still flat-iterates
     every visible layer.

     The shared bag is NOT memoized — its members are already memoized
     where it matters (pickedAgents, effectiveBranch) and the rest are
     cheap references. */
  const _shared = {
    // syndrome + composed answer
    ans, s, ctx: ans.ctx,
    // local UI state + handlers
    pickedAgents, effectiveBranch, handleBranchSelect,
    startDate, setStartDate,
    picksByTier, setTierPick,
    caseState, setCaseState,
    // props threaded through
    antibiogram, onDrug, onOrg, onCite, onOpenAntibiogramManager,
    // Wave 5 CL-3 · mechanism drawer opener — layers/blocks that render
    // free-text through renderRich pass this to ClassChip/TermChip so the
    // "Read the mechanism" footer can wire to the canvas-owned drawer.
    onOpenMechanism: _onOpenMechanism,
    // computed locals consumed by render functions
    allergy, dose, coreRefinements,
    // cached content-accessor results
    _diagnostics,
    _opat,
    _duration, _monitoring, _research, _rationale, _objections,
    _regional, _novel, _surgeTier1, _surgeOther, _siteP, _pedsPreg,
    _ctxPedsPreg, _pedsPregShow,
  };

  /* Phase A3 + Wave 5 PR-3 — Canvas spine, registry-derived. The chip
     strip mirrors the visible major sections; chips are computed by
     walking LAYERS and applying each entry's `when(shared)` predicate
     against the shared bag above. Duplicate ids (e.g. ans-duration is
     emitted by both the structured Duration block and the legacy
     fallback) collapse into a single spine chip — the predicates are
     mutually exclusive so the chip always points at whichever block
     rendered. Without this drift-resistant derivation, a 9-layer
     answer's spine and render block could disagree about visibility. */
  const _spineItems = [];
  const _spineSeenIds = new Set();
  for (const layer of LAYERS) {
    if (!layer.spineLabel) continue;
    if (!layer.when(_shared)) continue;
    if (_spineSeenIds.has(layer.id)) continue;
    _spineSeenIds.add(layer.id);
    const label = typeof layer.spineLabel === "function" ? layer.spineLabel(_shared) : layer.spineLabel;
    _spineItems.push({ id: layer.id, label });
  }
  const _onSpineClick = (id) => {
    setActiveSpineId(id);
    const el = typeof document !== "undefined" ? document.getElementById(id) : null;
    if(!el) return;
    if(el.tagName === "DETAILS" && !el.open) el.open = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* Wave 6 W6-B integration · build the patient-context chip array
     for the EditorialHero. Each chip carries a tone hint so the
     hero can render it with the right semantic color. */
  const patientChips = [];
  if(ans.ctx.on) {
    patientChips.push({ label: `${ans.ctx.age}${ans.ctx.sex}`, tone: "neutral" });
    if(ans.d.crcl != null) {
      patientChips.push({ label: `CrCl ${ans.d.crcl}`, tone: ans.d.crcl < 30 ? "amber" : "ox" });
    }
    riskLabels.forEach((r) => patientChips.push({ label: r, tone: "amber" }));
    if(ans.ctx.blAllergy && ans.ctx.blAllergy !== "none") {
      patientChips.push({
        label: ans.ctx.blAllergy === "severe" ? "severe β-lactam allergy" : "low-risk β-lactam allergy",
        tone: ans.ctx.blAllergy === "severe" ? "red" : "amber",
      });
    }
  }

  /* Wave 8 W8-A · build the visible-layer list once so we can hand each
     layer its `_layerIndex` / `_layerTotal` for the section counter
     ("01 / 12") and decorative numeral. The same list also drives the
     staggered .rx-fade-in-up cascade. */
  const visibleLayers = LAYERS.filter((L) =>
    L.when(_shared) && (layerTab === "all" || L.group === layerTab),
  );
  const visibleTotal = visibleLayers.length;

  /* Wave 8 W8-A · vertical-rail decoration — derive the first letter
     of the syndrome name for the WatermarkLetter overlay behind the
     hero, and the synd-numeric anchor (1 by default; we don't yet
     thread a real position-in-syndrome-set so the visual ornament
     uses the layer count). */
  const heroWatermarkLetter = (s.name || "").trim().charAt(0).toUpperCase() || "A";

  /* Stagger ladder — each direct child of the canvas root gets a
     cascading animationDelay so the page assembles into view rather
     than snapping. 60ms per step, clamped at 480ms so a 12-layer
     answer doesn't make the last item arrive a full second late. */
  let _staggerIndex = 0;
  const _stagger = () => {
    const delay = Math.min(_staggerIndex * 60, 480);
    _staggerIndex += 1;
    return { animationDelay: `${delay}ms` };
  };

  return (
    <>
      <style>{W8_STYLES}</style>

      <div
        className={"rx-answer-canvas-root" + (entranceGlow ? " rx-w12-layer-glow" : "")}
        data-has-vertical-rail={_spineItems.length > 3 ? "true" : "false"}
        data-w12-entrance={entranceGlow ? "true" : "false"}
      >
        {/* VERTICAL RAIL — docked at the left edge ≥1280px. CSS hides
            below that breakpoint; the horizontal frosted-glass strip
            below takes over. The dot+label per item mirrors the spine
            chip strip but reads as a magazine table-of-contents.
            aria-hidden during narrow viewports is handled by display:none. */}
        {_spineItems.length > 3 && (
          <nav
            className="rx-vertical-rail"
            aria-label="Answer sections (vertical rail)"
            data-bedside-vertical-rail="true"
          >
            <div className="rx-vertical-rail__heading">In this answer</div>
            {_spineItems.map((item) => (
              <button
                key={`vrail-${item.id}`}
                type="button"
                className="rx-vertical-rail__item"
                data-active={activeSpineId === item.id ? "true" : "false"}
                onClick={() => _onSpineClick(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        <div style={{ minWidth: 0 }}>
          {/* HERO — wrapped in a positioning context so a DottedGrid
              sits as the backdrop and a WatermarkLetter floats a 240px
              italic-serif initial in the top-right corner. The
              GradientMeshHero retains its own mesh + decorative number
              and is the typographic surface; the DottedGrid + Watermark
              add quiet texture / ornament around it.

              .rx-fade-in-up cascades the entrance per the staggered
              ladder. */}
          <div
            className="rx-fade-in-up"
            style={{ ...(_stagger()), position: "relative", marginBottom: 18 }}
          >
            <DottedGrid
              size={28}
              color="var(--neon-cyan, var(--ox))"
              opacity={0.18}
              style={{ borderRadius: 24, zIndex: 0 }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <GradientMeshHero
                kicker="Bedside / The Answer"
                counter={`01 / ${visibleTotal}`}
                syndromeName={s.name}
                syndromeLine={s.line}
                patientChips={patientChips}
                onEditCase={onEditCase}
              />
            </div>
          </div>

          {/* Depth-layers banner — staggered in. */}
          {_depthCount >= 6 && (
            <div className="rx-fade-in-up" style={{ ...(_stagger()), marginBottom: 14 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600,
                color: "var(--ox)",
                background: "var(--neon-cyan-soft, var(--ox-soft))",
                padding: "3px 8px", borderRadius: 4,
                border: "1px solid var(--neon-cyan-line, var(--ox-line))",
                letterSpacing: ".06em", textTransform: "uppercase",
              }}>
                <BookOpen size={10} aria-hidden /> {_depthCount} depth layers · scroll + expand for full detail
              </span>
            </div>
          )}

          {/* HORIZONTAL SPINE — frosted-glass strip. Visible < 1280px;
              hidden by the .rx-horizontal-spine display:none rule when
              the vertical rail takes over. */}
          {_spineItems.length > 3 && (
            <nav
              aria-label="Answer sections"
              data-bedside-spine="true"
              className="rx-horizontal-spine rx-fade-in-up"
              style={{ ..._stagger(), position: "sticky", top: 0, zIndex: 5 }}
            >
              {/* Wave 9 W9 · molten chrome under the spine bar. As the
                  user scrolls, the sticky spine reads as glass with
                  light moving through it — the band wash sits behind
                  the flat backdrop-filter blur the spine already had. */}
              <MeshWash
                variant="band"
                intensity="strong"
                palette="cyan-magenta-lime"
              />
              <div
                className={spineSweep ? "rx-w12-spine-sweep" : undefined}
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex", gap: 6, overflowX: "auto",
                  scrollbarWidth: "thin",
                }}>
                {_spineItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="rx-lift rx-cta-glow"
                    onClick={() => _onSpineClick(item.id)}
                    style={{
                      flex: "0 0 auto",
                      fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".04em",
                      color: activeSpineId === item.id ? "var(--neon-cyan, var(--ox))" : "var(--ink2)",
                      background: "var(--panel)",
                      border: `1px solid ${activeSpineId === item.id ? "var(--neon-cyan, var(--ox))" : "var(--line)"}`,
                      borderRadius: 999, padding: "4px 12px", cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}>
                    {item.label}
                  </button>
                ))}
              </div>
            </nav>
          )}

          {/* Wave 5 CL-5 · layer-group tab strip (PR-12) — staggered in. */}
          <div
            role="tablist"
            aria-label="Answer-canvas groups"
            className="rx-fade-in-up"
            style={{
              ...(_stagger()),
              display: "flex", gap: 6, overflowX: "auto", flexWrap: "wrap",
              marginBottom: 18, padding: "8px 10px",
              background: "var(--paper2)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              boxShadow: "var(--shadow-e0)",
            }}>
            {[
              { id: "core",     label: "Core" },
              { id: "risks",    label: "Risks" },
              { id: "duration", label: "Duration" },
              { id: "local",    label: "Local" },
              { id: "special",  label: "Special" },
              { id: "evidence", label: "Evidence" },
              { id: "all",      label: "Show all" },
            ].map(t => {
              const active = layerTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`layer-panel-${t.id}`}
                  className="rx-lift rx-cta-glow"
                  onClick={() => _selectLayerTab(t.id)}
                  style={{
                    flex: "0 0 auto",
                    fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700,
                    letterSpacing: ".06em", textTransform: "uppercase",
                    color: active ? "#fff" : "var(--ink2)",
                    background: active ? "var(--neon-cyan, var(--ox))" : "var(--panel)",
                    border: `1px solid ${active ? "var(--neon-cyan, var(--ox))" : "var(--line)"}`,
                    borderRadius: 999,
                    padding: "5px 13px", cursor: "pointer",
                    boxShadow: active ? "var(--neon-cyan-glow, var(--shadow-e2))" : "var(--shadow-e0)",
                    transition: "background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Depth layers — registry-driven. Every layer below the
              header strip and spine is rendered by `LAYERS.map(...)`.
              The order of LAYERS dictates the render order; each entry's
              `when(_shared)` predicate gates visibility, and the
              `render(_shared)` function produces the JSX. The previous
              inline JSX block (~340 LoC, hand-maintained against the
              spine predicates) is gone — drift between spine and
              rendered content is structurally impossible.

              Wave 5 CL-5 — layers are now filtered by `group` when a tab
              other than "all" is active; "all" preserves the full
              single-scroll canvas. */}
          <div role="tabpanel" id={`layer-panel-${layerTab}`} aria-label={`Answer canvas — ${layerTab}`}>
            {visibleLayers.map((L, i) => {
              const layerShared = {
                ..._shared,
                _layerIndex: i + 1,
                _layerTotal: visibleTotal,
              };
              const isLast = i === visibleLayers.length - 1;
              /* Wave 12 W12 · scene-break interpolation. If this layer
                 sits at the start of a new clinical-reasoning epoch AND
                 at least one prior layer rendered, drop a SceneBreak
                 ABOVE it. The mapping is deliberately sparse (4 entries)
                 so the canvas reads as 4 chapters, not 17. */
              const sceneBreak = i > 0 ? W12_SCENE_BREAKS[L.id] : null;
              /* W12 F5 · the reassessment / duration / monitoring layers
                 are the ones whose state flips when a clinician adds a
                 finding. Glow them briefly when the flow's finding token
                 bumps. Other layers stay quiet. */
              const isFindingLayer = /reassess|duration|monitoring/i.test(L.id || "");
              const glowKey = findingGlowToken;
              const glowClass = (
                !flow.reducedMotion && isFindingLayer && glowKey > 0
                  ? " rx-w12-layer-glow"
                  : ""
              );
              return (
                <React.Fragment key={L.id + "-" + i}>
                  {sceneBreak && (
                    <SceneBreak
                      variant={sceneBreak.variant}
                      mark={sceneBreak.mark}
                      kicker={sceneBreak.kicker}
                    />
                  )}
                  <div
                    className={"rx-fade-in-up" + glowClass}
                    style={{ ..._stagger(), borderRadius: 12 }}
                    data-w12-finding-glow={glowClass ? glowKey : 0}
                  >
                    {L.render(layerShared)}
                  </div>
                  {!isLast && !W12_SCENE_BREAKS[visibleLayers[i + 1]?.id] && (
                    <GradientHairline
                      className="rx-answer-layer-hairline"
                      variant={i % 3 === 0 ? "cyan-blue" : i % 3 === 1 ? "blue-magenta" : "default"}
                      withDot={i % 4 === 0}
                      style={{ margin: "4px 0 20px" }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* ACTIONS — primary CTA wears the cyan-glow gradient treatment;
              the .rx-shine-sweep MICRO class drives the hover sweep. */}
          <div
            className="rx-fade-in-up"
            style={{ ..._stagger(), display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}
          >
            <button
              type="button"
              onClick={copyNote}
              className={
                "rx-cta-ehr rx-shine-sweep" +
                (!flow.reducedMotion && flow.phase === "idle" ? " rx-w12-cta-pulse" : "")
              }
              data-w12-cta-state={flow.phase}
            >
              {copied ? <><Check size={14} aria-hidden/> Copied</> : <><ListChecks size={14} aria-hidden/> Copy as EHR note</>}
            </button>
            <button type="button" onClick={onEditCase}
              style={{
                display:"inline-flex", alignItems:"center", gap:7,
                fontFamily:"var(--sans)", fontSize:13, fontWeight:500,
                color:"var(--ox)",
                background:"var(--panel)", border:"1px solid var(--line)", borderRadius:9,
                padding:"10px 16px", cursor:"pointer",
              }}>
              <Pencil size={13} aria-hidden/> Edit case
            </button>
          </div>

          <div
            className="rx-fade-in-up"
            style={{
              ..._stagger(),
              marginTop:18, padding:"10px 14px",
              background:"var(--paper2)", border:"1px solid var(--line)",
              borderRadius:8, fontSize:11.5, color:"var(--muted)", lineHeight:1.55,
              display:"flex", gap:8, alignItems:"flex-start",
            }}>
            <ShieldCheck size={13} aria-hidden style={{ flex:"0 0 auto", marginTop:1, color:"var(--ox)" }} />
            Empiric therapy is a time-limited bridge. Reassess against cultures at 48–72 h and narrow or stop — breadth held longer is harm, not safety. Decision support only; verify every order against the local antibiogram and clinical pharmacy.
          </div>

          {/* Wave 5 CL-3 · MechanismDrawer mounted once at canvas root.
              Any ClassChip or TermChip whose phrase resolves through
              getMechanism() opens this overlay via the shared
              onOpenMechanism callback. Returns null when key is unset
              or unauthored — graceful fallback. */}
          <MechanismDrawer
            mechanismKey={mechanismKey}
            open={!!mechanismKey}
            onClose={_closeMechanism}
          />
        </div>
      </div>
    </>
  );
}

export { AnswerCanvas, composeAnswer };
