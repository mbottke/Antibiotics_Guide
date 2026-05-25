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

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useMemo, useState } from "react";
import { BookOpen, Check, Crosshair, ListChecks, Pencil, ShieldCheck } from "lucide-react";
import { composeAnswer } from "../engines/regimen.js";
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
import { EditorialHero } from "./EditorialHero.jsx";

/* ---------- the canvas itself ---------- */
function AnswerCanvas({ caseState, setCaseState, onEditCase, onDrug, onOrg, onCite, antibiogram, onOpenAntibiogramManager }) {
  const ans = useMemo(() => composeAnswer(caseState), [caseState]);
  const [copied, setCopied] = useState(false);

  /* Wave 5 CL-3 · mechanism drawer state owned at the canvas root.
     Threaded to every rendered ClassChip / TermChip via the shared bag,
     consumed inside `renderText` paths. Click on any class or resistance
     chip with an authored mechanism shows the drawer; the snapshot-only
     contract means the key is component state, never URL or storage. */
  const [mechanismKey, setMechanismKey] = useState(null);
  const _onOpenMechanism = (key) => setMechanismKey(key);
  const _closeMechanism = () => setMechanismKey(null);

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
    return (
      <div style={{
        background:"var(--panel)", border:"1px dashed var(--line)", borderRadius:12,
        padding:"24px 20px", textAlign:"center", color:"var(--muted)", fontSize:13.5,
      }}>
        Pick a syndrome in the Case Bar above to assemble an empiric regimen.
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

  return (
    <div style={{ marginTop: 6 }}>
      <EditorialHero
        syndromeName={s.name}
        syndromeLine={s.line}
        patientChips={patientChips}
        riskLabels={riskLabels}
        onEditCase={onEditCase}
      />

      {_depthCount >= 6 && (
        <div style={{ marginBottom: 14 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600,
            color: "var(--ox)", background: "var(--ox-soft)",
            padding: "3px 8px", borderRadius: 4,
            border: "1px solid var(--ox-line)",
            letterSpacing: ".06em", textTransform: "uppercase",
          }}>
            <BookOpen size={10} aria-hidden /> {_depthCount} depth layers · scroll + expand for full detail
          </span>
        </div>
      )}

      {/* Canvas spine — sticky table-of-contents chip strip. The list
          mirrors the visible sections below and lets users jump straight
          to Duration, Monitor, Risks, etc., on long answers (some have
          9+ layers). Backdrop-blur keeps it readable when content
          scrolls underneath. */}
      {_spineItems.length > 3 && (
        <nav
          aria-label="Answer sections"
          data-bedside-spine="true"
          style={{
            /* Wave 6 W6-B aesthetic · frosted-glass sticky spine.
               Properly saturated + blurred so the bar feels like a
               materialized surface rather than translucent paper. */
            position: "sticky", top: 0, zIndex: 5,
            margin: "-2px -2px 14px",
            padding: "9px 10px",
            background: "color-mix(in srgb, var(--paper) 72%, transparent)",
            backdropFilter: "saturate(170%) blur(16px)",
            WebkitBackdropFilter: "saturate(170%) blur(16px)",
            border: "1px solid var(--line)",
            borderRadius: 12,
            boxShadow: "0 1px 0 rgba(255,255,255,.7) inset, var(--shadow-e1)",
          }}>
          <div style={{
            display: "flex", gap: 6, overflowX: "auto",
            scrollbarWidth: "thin",
          }}>
            {_spineItems.map((item) => (
              <button
                key={item.id}
                type="button"
                /* .rx-lift handles hover/focus elevation entirely via
                   the stylesheet. NO inline box-shadow on the resting
                   state — that would override the cascading rules
                   (Codex finding on #135). The 1px border on var(--panel)
                   is sufficient resting contrast on the frosted-glass
                   surface above. */
                className="rx-lift rx-cta-glow"
                onClick={() => _onSpineClick(item.id)}
                style={{
                  flex: "0 0 auto",
                  fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".04em",
                  color: "var(--ink2)",
                  background: "var(--panel)", border: "1px solid var(--line)",
                  borderRadius: 999, padding: "4px 12px", cursor: "pointer",
                  whiteSpace: "nowrap",
                }}>
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Wave 5 CL-5 · layer-group tab strip (PR-12).
          6 tabs route layers by their `group` field. Default tab =
          Core. Show-all toggles back to the legacy single-scroll
          canvas — the full picture stays one click away. Active tab
          persists per-site to localStorage. */}
      <div role="tablist" aria-label="Answer-canvas groups" style={{
        /* Wave 6 W6-B · framed tab tray. Tabs sit on a paper2
           container with a hairline border + e0 shadow so they
           feel held rather than painted into the page. */
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
              /* .rx-lift + .rx-cta-glow handle hover lift + oxblood
                 focus glow via the stylesheet. No inline box-shadow
                 on resting; the active state's deeper background +
                 oxblood border is the active emphasis. */
              className="rx-lift rx-cta-glow"
              onClick={() => _selectLayerTab(t.id)}
              style={{
                flex: "0 0 auto",
                fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700,
                letterSpacing: ".06em", textTransform: "uppercase",
                color: active ? "#fff" : "var(--ink2)",
                background: active ? "var(--ox)" : "var(--panel)",
                border: `1px solid ${active ? "var(--ox)" : "var(--line)"}`,
                borderRadius: 999,
                padding: "5px 13px", cursor: "pointer",
                transition: "background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)",
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
        {(() => {
          /* Wave 6 W6-B · staggered first-paint reveal. Each visible
             layer cascades in via .rx-reveal-fast with a 60ms ladder
             (clamped at 480ms total) so the page arrives orchestrated
             rather than snapping. Reduced-motion users get no-op via
             the global @media rule. */
          const visible = LAYERS.filter((L) =>
            L.when(_shared) && (layerTab === "all" || L.group === layerTab),
          );
          return visible.map((L, i) => (
            <div
              key={L.id + "-" + i}
              className="rx-reveal-fast"
              style={{ animationDelay: `${Math.min(i * 60, 480)}ms` }}
            >
              {L.render(_shared)}
            </div>
          ));
        })()}
      </div>

      {/* ACTIONS */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:18 }}>
        <button type="button" onClick={copyNote}
          style={{
            display:"inline-flex", alignItems:"center", gap:7,
            fontFamily:"var(--sans)", fontSize:13, fontWeight:600, color:"#fff",
            background:"var(--ox)", border:"1px solid var(--ox)", borderRadius:9,
            padding:"10px 16px", cursor:"pointer",
          }}>
          {copied ? <><Check size={14}/> Copied</> : <><ListChecks size={14}/> Copy as EHR note</>}
        </button>
        <button type="button" onClick={onEditCase}
          style={{
            display:"inline-flex", alignItems:"center", gap:7,
            fontFamily:"var(--sans)", fontSize:13, fontWeight:500, color:"var(--ink2)",
            background:"var(--panel)", border:"1px solid var(--line)", borderRadius:9,
            padding:"10px 16px", cursor:"pointer",
          }}>
          <Pencil size={13}/> Edit case
        </button>
      </div>

      <div style={{
        marginTop:18, padding:"10px 14px", background:"var(--paper2)", border:"1px solid var(--line)",
        borderRadius:8, fontSize:11.5, color:"var(--muted)", lineHeight:1.55, display:"flex", gap:8, alignItems:"flex-start",
      }}>
        <ShieldCheck size={13} style={{ flex:"0 0 auto", marginTop:1 }} />
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
  );
}

export { AnswerCanvas, composeAnswer };
