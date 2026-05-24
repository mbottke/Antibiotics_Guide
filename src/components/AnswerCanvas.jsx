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
import {
  Activity, AlertTriangle, ArrowRight, BookOpen, Bug, Calculator, Check,
  ChevronRight, Clock, Crosshair, Edit, FlaskConical, ListChecks, Pencil,
  Plus, Scissors, ShieldAlert, ShieldCheck, Stethoscope, TrendingDown,
} from "lucide-react";
import { composeAnswer } from "../engines/regimen.js";
import { computeDose, deriveCtx, doseAdjustments } from "../engines/dosing.js";
import { allergyGuidance } from "../engines/clinical.js";
import { AGENT_RX } from "../data/drugs.js";
import { ORG_BY_ID } from "../data/organisms.js";
import { renderGloss, renderRich } from "./rich-text.jsx";
import { Cite, DecisionTag, Ev } from "./primitives.jsx";
import { RegimenOptions } from "./RegimenOptions.jsx";
import { tierHasContent } from "../data/regimenContent.js";
import { splitRegimenOptions } from "../engines/regimenOptions.js";
import { ReassessmentPanel } from "./ReassessmentPanel.jsx";
import { DurationBlock } from "./DurationBlock.jsx";
import { MonitoringBlock } from "./MonitoringBlock.jsx";
import { getSyndromeDuration, getSyndromeMonitoring } from "../data/syndromeDecision.js";

/* ---------- refinement → footnote mapping ----------
   For each refinement step in composeAnswer.refinement.steps, decide
   whether it can be attached inline (single named agent that appears in
   the prose) or must be shown as a leader annotation above the line
   (cross-cutting steps like "Vancomycin + pip-tazo" combos or
   "β-lactam Gram-negative cover" substitutions where the named subject
   isn't a single agent in the rx text). */
function _attachRefinements(steps) {
  const inline = [];   // [{ rx, step, idx }]
  const leader = [];   // [{ step, idx }]
  steps.forEach((step, i) => {
    const idx = i + 1;
    const match = AGENT_RX.find(a => a.canon === step.agent);
    if(match) inline.push({ rx: new RegExp(match.rx.source, "i"), step, idx });
    else leader.push({ step, idx });
  });
  return { inline, leader };
}

const _TONE_FOR = {
  eliminate:  { state: "avoid",    decoration: "line-through", label: "Avoid" },
  substitute: { state: "avoid",    decoration: "line-through", label: "Swap" },
  flag:       { state: "adjusted", decoration: "none",         label: "Flag" },
  note:       { state: "start",    decoration: "none",         label: "Note" },
};

/* The inline footnote marker rendered immediately after a refinement-named
   agent in the rx prose. Numbered, color-tinted by severity, and tied to
   the reason list beneath the line by index. */
function FootMark({ idx, step }) {
  const tone = _TONE_FOR[step.type] || _TONE_FOR.note;
  const color = step.sev === "high" ? "var(--ox)" : step.sev === "med" ? "var(--amber)" : "var(--ink2)";
  return (
    <sup style={{
      display:"inline-flex", alignItems:"center", justifyContent:"center",
      minWidth:14, height:14, padding:"0 4px", marginLeft:3,
      fontSize:9, fontFamily:"var(--mono)", fontWeight:700,
      color:"#fff", background:color, borderRadius:7, verticalAlign:"super",
      lineHeight:1,
    }} title={tone.label + ": " + step.reason}>{idx}</sup>
  );
}

/* renderRichWithFootnotes — walks the rendered rich-text output and
   injects FootMark elements after each agent-name match that has an
   attached refinement. Preserves ClassChip and TermChip popovers; only
   string nodes are searched. */
/* Phase D1 — option-card text renderer. Same footnote-marker attachment
   as renderRichWithFootnotes, but skips the rich-text drug/class chip
   pass so the resulting nodes contain no focusable descendants. Lets
   the OptionCard stay a proper <button role="radio"> without violating
   the nested-interactive axe rule. Phase D2 reintroduces drug/class
   drill from inside cards through a different mechanism (likely a
   per-card "details" affordance, not inline chips). */
function renderFootnotesOnly(text, inlineRefinements) {
  if(typeof text !== "string") return text;
  if(!inlineRefinements || !inlineRefinements.length) return text;
  const out = [];
  let key = 0, remaining = text;
  const usedSteps = new Set();
  while(remaining.length) {
    let best = null;
    for(const ent of inlineRefinements) {
      if(usedSteps.has(ent.idx)) continue;
      ent.rx.lastIndex = 0;
      const m = ent.rx.exec(remaining);
      if(m && (!best || m.index < best.match.index)) best = { match: m, ent };
    }
    if(!best) { out.push(remaining); break; }
    const { match, ent } = best;
    if(match.index > 0) out.push(remaining.slice(0, match.index));
    const tone = _TONE_FOR[ent.step.type] || _TONE_FOR.note;
    out.push(
      <span key={"rf" + (key++)} style={{ textDecoration: tone.decoration, textDecorationColor: "var(--ox)" }}>
        {match[0]}
      </span>
    );
    out.push(<FootMark key={"fm" + (key++)} idx={ent.idx} step={ent.step} />);
    usedSteps.add(ent.idx);
    remaining = remaining.slice(match.index + match[0].length);
  }
  return out;
}

function renderRichWithFootnotes(text, onDrug, inlineRefinements) {
  const base = renderRich(text, onDrug);
  if(!Array.isArray(base) || !inlineRefinements.length) return base;
  const out = [];
  let key = 0;
  for(const node of base) {
    if(typeof node !== "string") {
      out.push(React.cloneElement(node, { key: "rn" + (key++) }));
      continue;
    }
    let remaining = node;
    const usedSteps = new Set();
    while(remaining.length) {
      // Find earliest match across all agent regexes, skipping refinements
      // already attached (footnote each agent only once per line).
      let best = null;
      for(const ent of inlineRefinements) {
        if(usedSteps.has(ent.idx)) continue;
        ent.rx.lastIndex = 0;
        const m = ent.rx.exec(remaining);
        if(m && (!best || m.index < best.match.index)) best = { match: m, ent };
      }
      if(!best) { out.push(remaining); break; }
      const { match, ent } = best;
      if(match.index > 0) out.push(remaining.slice(0, match.index));
      const tone = _TONE_FOR[ent.step.type] || _TONE_FOR.note;
      out.push(
        <span key={"rf" + (key++)} style={{ textDecoration: tone.decoration, textDecorationColor: "var(--ox)" }}>
          {match[0]}
        </span>
      );
      out.push(<FootMark key={"fm" + (key++)} idx={ent.idx} step={ent.step} />);
      usedSteps.add(ent.idx);
      remaining = remaining.slice(match.index + match[0].length);
    }
  }
  return out;
}

/* ---------- section primitives ---------- */
function Section({ kicker, title, icon: Icon, children, sticky }) {
  return (
    <section style={{ marginBottom: 18 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom: 10 }}>
        {kicker && (
          <span style={{
            fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".14em",
            textTransform: "uppercase", color: "var(--ox)", fontWeight: 700,
            display:"inline-flex", alignItems:"center", gap:6,
          }}>
            {Icon && <Icon size={12} />} {kicker}
          </span>
        )}
        {title && (
          <h3 style={{ fontFamily:"var(--serif)", fontSize:17, fontWeight:600, margin:0, color:"var(--ink)" }}>
            {title}
          </h3>
        )}
      </div>
      <div style={{
        background:"var(--panel)", border:"1px solid var(--line)", borderRadius:12,
        padding:16, ...(sticky ? { borderTop:"3px solid var(--ox)" } : {}),
      }}>
        {children}
      </div>
    </section>
  );
}

/* ---------- the rendered rx line + footnote list ---------- */
function RxLine({ tier, kind, refinements, onDrug, ctx, d, synId, onAgentSelect }) {
  // Split refinements into inline-attachable vs leader-display.
  const { inline, leader } = useMemo(() => _attachRefinements(refinements), [refinements]);
  const tierColor = kind === "add" ? "var(--amber)" : "var(--ox)";
  const tierLabel = kind === "add" ? "Add" : "Core";
  const tierBg = kind === "add" ? "var(--amber-soft)" : "var(--ox-soft)";
  const tierLine = kind === "add" ? "var(--amber-line)" : "var(--ox-line)";
  return (
    <div style={{ marginBottom: kind === "add" ? 12 : 10 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom: 6 }}>
        <span style={{
          fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".1em",
          textTransform:"uppercase", fontWeight:700, color: tierColor,
          background: tierBg, border:`1px solid ${tierLine}`, borderRadius:5,
          padding:"2px 8px",
        }}>
          {kind === "add" ? <><Plus size={9} style={{verticalAlign:"-1px", marginRight:3}}/>{tierLabel}</> : tierLabel}
        </span>
        <span style={{ fontSize:13, fontWeight:600, color:"var(--ink)" }}>{tier.k}</span>
        {tier.why && <span style={{ fontSize:11.5, color:"var(--muted)" }}>· added because {tier.why}</span>}
      </div>
      {/* Phase D1.5 — multi-option presentation with per-card decision
          content + selection-narrowed dose adjustments. The tier's rx
          prose is split into discrete options; each card surfaces the
          drug fragment, the authored Why-pick / Watch-out content for
          this option, and the patient-specific dose adjustments
          computed against the SELECTED drug only. Footnote markers
          from the refinement engine ride through renderFootnotesOnly
          (no nested interactive chips). */}
      <RegimenOptions
        rx={tier.rx}
        accent={kind === "add" ? "add" : "core"}
        renderText={(text) => renderFootnotesOnly(text, inline)}
        synId={synId}
        tierLabel={tier.k}
        ctx={ctx}
        d={d}
        onSelectionChange={onAgentSelect}
      />
      {/* Suppress the tier-level italic note when per-card content
          exists for this tier — the cards subsume the note's content
          and presenting both creates the redundancy the user flagged.
          When no per-card content is authored yet, the note remains
          as the fallback explanation. */}
      {tier.note && !tierHasContent(synId, tier.k, tier.rx, splitRegimenOptions) && (
        <div style={{ fontSize:12, color:"var(--ink2)", marginTop:4, lineHeight:1.5, fontStyle:"italic" }}>
          {renderGloss(tier.note, onDrug)}
        </div>
      )}

      {/* Phase D1.5 — the tier-level dose-adjustment chip strip moved
          inside each option card (PerOptionDoseChips). The chips now
          narrow to the selected drug instead of summing across the
          whole tier, so selecting nitrofurantoin doesn't show
          adjustments for fosfomycin / TMP-SMX. */}

      {/* Leader-annotation refinements (cross-cutting; can't be inlined) appear under the line. */}
      {leader.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {leader.map(({ step, idx }) => (
            <RefinementRow key={idx} idx={idx} step={step} onDrug={onDrug} />
          ))}
        </div>
      )}

      {/* Inline-attached refinement reasons, numbered to match the FootMarks above. */}
      {inline.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {inline.map(({ step, idx }) => (
            <RefinementRow key={idx} idx={idx} step={step} onDrug={onDrug} />
          ))}
        </div>
      )}
    </div>
  );
}

function RefinementRow({ idx, step, onDrug }) {
  const tone = _TONE_FOR[step.type] || _TONE_FOR.note;
  const stateColor = step.sev === "high" ? "var(--ox)" : step.sev === "med" ? "var(--amber)" : "var(--ink2)";
  return (
    <div style={{
      display:"flex", gap:8, alignItems:"flex-start",
      fontSize:12, color:"var(--ink2)", lineHeight:1.55,
      padding:"6px 10px",
      background: step.sev === "high" ? "var(--ox-softer)" : "var(--paper2)",
      border:`1px solid ${step.sev === "high" ? "var(--ox-line)" : "var(--line)"}`,
      borderRadius:7, marginBottom:5,
    }}>
      <sup style={{
        display:"inline-flex", alignItems:"center", justifyContent:"center",
        minWidth:16, height:16, padding:"0 5px",
        fontSize:9.5, fontFamily:"var(--mono)", fontWeight:700,
        color:"#fff", background: stateColor, borderRadius:8, flex:"0 0 auto",
        marginTop:1,
      }}>{idx}</sup>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2, flexWrap:"wrap" }}>
          <span style={{
            fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".08em",
            textTransform:"uppercase", fontWeight:700, color: stateColor,
          }}>{tone.label}</span>
          <span style={{ fontWeight:600, color:"var(--ink)", fontSize:12.5 }}>
            {step.type === "substitute" && step.replacement
              ? <><span style={{ textDecoration:"line-through", opacity:.6 }}>{step.agent}</span>{" "}<ArrowRight size={10} style={{verticalAlign:"-1px"}}/>{" "}<b>{step.replacement}</b></>
              : <span style={{ textDecoration: step.type === "eliminate" ? "line-through" : "none", opacity: step.type === "eliminate" ? .6 : 1 }}>{step.agent}</span>}
          </span>
        </div>
        <div>{renderGloss(step.reason, onDrug)} {step.cite && <Cite id={step.cite} />}</div>
      </div>
    </div>
  );
}

/* ---------- the canvas itself ---------- */
function AnswerCanvas({ caseState, setCaseState, onEditCase, onDrug, onOrg, onCite }) {
  const ans = useMemo(() => composeAnswer(caseState), [caseState]);
  const [copied, setCopied] = useState(false);

  /* Phase D2 cross-section selection state. Two interlocking signals:
       pickedAgent  — the agent picked in any RegimenOptions card
                      (core or add tier; latest pick wins, scoped to
                      this syndrome render)
       pickedBranch — the duration branch the clinician clicked in
                      DurationBlock; null when no manual selection

     DurationBlock + MonitoringBlock both consume these signals;
     selections in either propagate downstream so monitoring items
     tagged with matchAgent / matchBranch leap out as MATCHES. The
     state is intentionally local to AnswerCanvas — it's ephemeral
     UI exploration, not part of the persisted caseState. */
  const [pickedAgent, setPickedAgent] = useState(null);
  const [pickedBranch, setPickedBranch] = useState(null);

  /* Effective branch: the explicit pickedBranch when the user has
     clicked one, otherwise the branch whose matchAgent regex matches
     the currently-picked agent. This way, picking the Fosfomycin
     regimen card auto-derives the Fosfomycin duration branch for
     downstream monitoring matchBranch filtering — without forcing
     the user to also click the duration branch. */
  const effectiveBranch = useMemo(() => {
    if(pickedBranch) return pickedBranch;
    if(!pickedAgent || !ans?.syndrome) return null;
    const dur = getSyndromeDuration(ans.syndrome.id);
    if(!dur?.branches) return null;
    const match = dur.branches.find(b => b.matchAgent && b.matchAgent.test(pickedAgent));
    return match ? match.label : null;
  }, [pickedAgent, pickedBranch, ans]);

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

  return (
    <div style={{ marginTop: 6 }}>
      {/* Header strip — syndrome name, risks, edit-case affordance */}
      <div data-bedside-header-strip="true" style={{
        display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12,
        padding:"14px 18px", background:"var(--ox-softer)", border:"1px solid var(--ox-line)",
        borderRadius:12, marginBottom: 16,
      }}>
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ fontFamily:"var(--mono)", fontSize:10, letterSpacing:".14em", textTransform:"uppercase", color:"var(--ox)", fontWeight:700, marginBottom:3 }}>
            <Crosshair size={11} style={{ verticalAlign:"-1px", marginRight:5 }}/>The answer
          </div>
          <div style={{ fontFamily:"var(--serif)", fontSize:21, fontWeight:600, color:"var(--ink)", letterSpacing:"-.01em", lineHeight:1.2 }}>
            {s.name}
          </div>
          <div style={{ fontSize:12.5, color:"var(--ink2)", marginTop:5, lineHeight:1.5 }}>
            {s.line}
            {ans.ctx.on && (
              <>
                {" · "}<b>{ans.ctx.age}{ans.ctx.sex}</b>
                {ans.d.crcl != null && <>, CrCl <b>{ans.d.crcl}</b></>}
                {riskLabels.length > 0 && <>, risks <b>{riskLabels.join(", ")}</b></>}
                {ans.ctx.blAllergy && ans.ctx.blAllergy !== "none" && <>, {ans.ctx.blAllergy === "severe" ? "severe" : "low-risk"} β-lactam allergy</>}
              </>
            )}
          </div>
        </div>
        {onEditCase && (
          <button type="button" onClick={onEditCase} title="Edit the case"
            style={{
              display:"inline-flex", alignItems:"center", gap:5, flex:"0 0 auto",
              fontFamily:"var(--mono)", fontSize:11, letterSpacing:".08em", textTransform:"uppercase",
              color:"var(--ox)", background:"var(--panel)", border:"1px solid var(--ox-line)", borderRadius:999,
              padding:"5px 11px", cursor:"pointer",
            }}>
            <Pencil size={11}/> Edit
          </button>
        )}
      </div>

      {/* Source control banner — when applicable, leads the answer. */}
      {ans.sourceControl && (
        <div style={{
          display:"flex", gap:10, alignItems:"flex-start",
          padding:"12px 14px", background:"var(--ox-soft)", border:"1px solid var(--ox-line)",
          borderRadius:10, marginBottom: 16, fontSize:12.5, color:"var(--ox-deep)", lineHeight:1.55,
        }}>
          <Crosshair size={15} style={{ flex:"0 0 auto", marginTop:1, color:"var(--ox)" }} />
          <div>
            <b>Source control is the therapy; antibiotics are adjunctive.</b> {ans.sourceControl}
          </div>
        </div>
      )}

      {/* START NOW — the regimen. Latest pick across any tier (core or
          add) wins as the cross-section pickedAgent; downstream blocks
          (DurationBlock, MonitoringBlock) light their matchAgent items. */}
      <Section kicker="Start now" icon={Crosshair} sticky>
        <RxLine kind="core" tier={ans.core} refinements={coreRefinements} onDrug={onDrug}
          ctx={ans.ctx} d={ans.d} synId={s.id}
          onAgentSelect={setPickedAgent} />
        {ans.adds.map((a, i) => (
          <RxLine key={i} kind="add" tier={a} refinements={[]} onDrug={onDrug}
            ctx={ans.ctx} d={ans.d} synId={s.id}
            onAgentSelect={setPickedAgent} />
        ))}

        {/* Allergy guardrail — quick read above the dose calc */}
        {allergy && (
          <div style={{
            display:"flex", gap:9, alignItems:"flex-start",
            padding:"10px 12px", background: allergy.tone === "ox" ? "var(--ox-soft)" : "var(--amber-soft)",
            border: `1px solid ${allergy.tone === "ox" ? "var(--ox-line)" : "var(--amber-line)"}`,
            borderRadius:8, fontSize:12, color: allergy.tone === "ox" ? "var(--ox-deep)" : "var(--amber)",
            lineHeight:1.55, marginTop:8,
          }}>
            <ShieldAlert size={14} style={{ flex:"0 0 auto", marginTop:1 }} />
            <div><b>{allergy.head}.</b> {allergy.body}</div>
          </div>
        )}

        {/* Patient-specific dose summary — surfaced beneath the regimen when context is on. */}
        {ans.ctx.on && ans.empiricAgents.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop:"1px dashed var(--line2)" }}>
            <div style={{ fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".1em", textTransform:"uppercase", color:"var(--muted)", fontWeight:600, marginBottom:7 }}>
              <Calculator size={11} style={{ verticalAlign:"-1px", marginRight:5 }}/>Dosing for this patient
              {ans.d.crcl != null && <span style={{ marginLeft:8, color:"var(--ink2)", textTransform:"none", letterSpacing:0, fontFamily:"var(--sans)", fontSize:11.5 }}>CrCl {ans.d.crcl} mL/min</span>}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:6 }}>
              {ans.empiricAgents.map(n => {
                const a = dose(n);
                const stat = (a && (a.kind === "band" || a.kind === "level") && a.adjusted) ? a.adjusted : (a ? a.normal : null);
                const changed = a && a.kind === "band" && a.changed;
                return (
                  <div key={n} style={{
                    display:"flex", justifyContent:"space-between", alignItems:"center", gap:8,
                    padding:"5px 10px", background: changed ? "var(--decision-adjusted-bg)" : "var(--paper2)",
                    border:`1px solid ${changed ? "var(--decision-adjusted-line)" : "var(--line)"}`, borderRadius:6,
                    fontSize:12, fontFamily:"var(--mono)",
                  }}>
                    <button type="button" onClick={() => onDrug && onDrug(n)}
                      style={{ fontFamily:"var(--sans)", fontSize:12.5, fontWeight:600, color:"var(--ink)",
                        background:"none", border:"none", cursor:"pointer", padding:0, textAlign:"left", minWidth:0, overflow:"hidden", textOverflow:"ellipsis" }}>
                      {n.split(" / ")[0]}
                    </button>
                    <span style={{ color: changed ? "var(--decision-adjusted)" : "var(--ink2)", fontWeight:600, whiteSpace:"nowrap" }}>{stat || ""}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize:11, color:"var(--muted)", fontStyle:"italic", marginTop:7 }}>
              First (loading) doses are full doses regardless of clearance — adjustments are maintenance only.
            </div>
          </div>
        )}
      </Section>

      {/* COVERS & DELIBERATE OMISSIONS */}
      <Section kicker="Covers" icon={Check}>
        <div style={{ fontSize:13, color:"var(--ink2)", lineHeight:1.6 }}>
          <div style={{ marginBottom:6 }}>
            <span style={{ fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".1em", textTransform:"uppercase", color:"var(--green)", fontWeight:700, marginRight:6 }}>Cover</span>
            {renderGloss(s.cover.empiric, onDrug)}
          </div>
          <div style={{ marginBottom:6 }}>
            <span style={{ fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".1em", textTransform:"uppercase", color:"var(--ox)", fontWeight:700, marginRight:6 }}>Don't over-cover</span>
            {renderGloss(s.cover.drop, onDrug)}
          </div>
          {ans.bugs.length > 0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:9 }}>
              {ans.bugs.map(b => {
                const o = ORG_BY_ID[b];
                if(!o) return null;
                return (
                  <button key={b} type="button" onClick={() => onOrg && onOrg(b)}
                    style={{
                      display:"inline-flex", alignItems:"center", gap:4,
                      fontSize:11, fontWeight:500, padding:"3px 8px", borderRadius:999,
                      background:"var(--line2)", color:"var(--ink2)", border:"1px solid var(--line)",
                      cursor:"pointer",
                    }}>
                    <Bug size={10}/> {o.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Section>

      {/* STOP AT 48-72 H */}
      <Section kicker="Stop at 48–72 h" icon={TrendingDown}>
        <div style={{ fontSize:13, color:"var(--ink2)", lineHeight:1.6, marginBottom: ans.deesc.length ? 12 : 0 }}>
          {renderGloss(s.deesc, onDrug)}
        </div>
        {ans.deesc.length > 0 && (
          <div>
            <div style={{ fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".1em", textTransform:"uppercase", color:"var(--muted)", fontWeight:600, marginBottom:7 }}>
              <Crosshair size={11} style={{ verticalAlign:"-1px", marginRight:5 }}/>Narrow by organism
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {ans.deesc.slice(0, 6).map(row => (
                <div key={row.id} style={{
                  display:"flex", gap:9, alignItems:"flex-start",
                  padding:"7px 10px", background:"var(--paper2)", border:"1px solid var(--line)",
                  borderRadius:7, fontSize:12, lineHeight:1.5,
                }}>
                  <button type="button" onClick={() => onOrg && onOrg(row.id)}
                    style={{
                      flex:"0 0 auto", display:"inline-flex", alignItems:"center", gap:4,
                      fontSize:11, fontWeight:600, color:"var(--ox)", background:"var(--ox-softer)",
                      border:"1px solid var(--ox-line)", borderRadius:5, padding:"3px 7px",
                      cursor:"pointer", whiteSpace:"nowrap",
                    }}>
                    <Bug size={10}/> {row.label}
                  </button>
                  <div style={{ flex:1, minWidth:0 }}>
                    {row.targets.length > 0
                      ? row.targets.map((t, i) => (
                          <div key={i} style={{ marginBottom: i < row.targets.length - 1 ? 4 : 0 }}>
                            {t.sub && row.targets.length > 1 && (
                              <span style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--muted)", marginRight:6 }}>{t.sub}</span>
                            )}
                            <ArrowRight size={10} style={{ verticalAlign:"-1px", color:"var(--muted)", margin:"0 4px" }}/>
                            {renderRich(t.first, onDrug)}
                          </div>
                        ))
                      : row.docFallback.length > 0 && (
                          <span>
                            <ArrowRight size={10} style={{ verticalAlign:"-1px", color:"var(--muted)", marginRight:4 }}/>
                            {row.docFallback.map((n, i) => (
                              <React.Fragment key={n}>
                                {i ? ", " : ""}
                                <button type="button" onClick={() => onDrug && onDrug(n)}
                                  style={{ background:"none", border:"none", padding:0, color:"var(--ox)", fontWeight:600, cursor:"pointer", textDecoration:"underline", textDecorationStyle:"dotted", textUnderlineOffset:2 }}>
                                  {n}
                                </button>
                              </React.Fragment>
                            ))}
                          </span>
                        )}
                    {row.stop.length > 0 && (
                      <div style={{ fontSize:11, color:"var(--muted)", marginTop:4 }}>
                        <Scissors size={10} style={{ verticalAlign:"-1px", marginRight:4 }}/>
                        Lets you stop: {row.stop.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* DURATION + MONITORING (Phase D2) — structured decision content
          authored in syndromeDecision.js. Render only when content exists;
          falls back to the legacy narrative Duration section below
          (which is suppressed in that case to avoid duplication). The
          regimen cards say what to start; these blocks say when to stop
          and what to check.

          Cross-section linking: pickedAgent (from RegimenOptions cards
          above) implicitly lights the matching duration branch via
          matchAgent regex; pickedBranch (from clicking a duration
          branch) propagates to MonitoringBlock so items tagged with
          matchBranch surface as MATCHES. Both signals also drive the
          MonitoringBlock matchAgent highlighting. */}
      <DurationBlock
        duration={getSyndromeDuration(s.id)}
        pickedAgent={pickedAgent}
        pickedBranch={pickedBranch}
        onBranchSelect={setPickedBranch}
      />
      <MonitoringBlock
        monitoring={getSyndromeMonitoring(s.id)}
        pickedAgent={pickedAgent}
        pickedBranch={effectiveBranch}
      />

      {/* CURRENT STATE — snapshot inputs (cultures, clinical trajectory,
          source control) that refine the regimen. Despite the legacy file
          name, this is not a longitudinal reassessment workflow — it is a
          set of optional state toggles that further narrow the snapshot
          answer when the clinician knows them. */}
      <ReassessmentPanel
        caseState={caseState}
        setCaseState={setCaseState}
        empiric={ans}
        onDrug={onDrug}
        onOrg={onOrg}
      />

      {/* DURATION + EVIDENCE — legacy narrative duration section. Suppressed
          when the syndrome has authored structured DurationBlock content
          (rendered above ReassessmentPanel), to avoid duplicating the same
          fact in two places. The structured block carries the same string
          inside its headline + branches with richer affordances. */}
      {!getSyndromeDuration(s.id) && (
        <Section kicker="Duration" icon={Clock}>
          <div style={{ fontSize:13.5, color:"var(--ink)", lineHeight:1.55 }}>
            {s.duration}
            {ans.evidence && (
              <span style={{ marginLeft:8 }}>
                {ans.evidence.ev && <Ev kind={ans.evidence.ev} />}{" "}
                <Cite id={ans.evidence.ref} onClick={(cid) => onCite && onCite(cid)} />
              </span>
            )}
          </div>
        </Section>
      )}

      {/* PEARLS — short, scannable. */}
      {ans.pearls.length > 0 && (
        <Section kicker="Pearls" icon={Activity}>
          <ul style={{ margin:0, padding:"0 0 0 18px", fontSize:12.5, color:"var(--ink2)", lineHeight:1.6 }}>
            {ans.pearls.map((p, i) => (
              <li key={i} style={{ marginBottom:5 }} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>") }} />
            ))}
          </ul>
        </Section>
      )}

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
    </div>
  );
}

export { AnswerCanvas, composeAnswer };
