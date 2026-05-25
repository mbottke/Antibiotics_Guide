/* component · RxLine — multi-tier regimen line with refinement footnotes.

   The rendered rx line + footnote list. Each tier (Core / Add MRSA /
   Add resistant-GNR cover / etc.) gets one RxLine. Refinements
   produced by the engine (allergy substitutions, nephrotoxic
   pairings, redundant-coverage drops) are split into:

     · INLINE — single named agent that appears in the prose; attached
       as a numbered footnote marker immediately after the agent name.
     · LEADER — cross-cutting refinements that can't be inlined (e.g.
       "β-lactam Gram-negative cover" where no single agent name is
       in the rx text); rendered as an annotated row beneath the line.

   Both groups link back to the FootMark numbering through their
   `idx` field.

   Wave 5 PR-3 Stage 2 — extracted from AnswerCanvas.jsx so each
   answer-layer module can import it directly. The components in
   this file have no knowledge of the layer registry; they are
   primitive UI building blocks.

   Inpatient Antibiotic Guide — module graph documented in README.md. */

import React, { useMemo } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { DecisionAttributionDrawer } from "./DecisionAttributionDrawer.jsx";
import { AGENT_RX } from "../data/drugs.js";
import { renderGloss, renderRich } from "./rich-text.jsx";
import { Cite } from "./primitives.jsx";
import { RegimenOptions } from "./RegimenOptions.jsx";
import { tierHasContent } from "../data/regimenContent.js";
import { splitRegimenOptions } from "../engines/regimenOptions.js";

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
   the reason list beneath the line by index.

   Wave 5 PR-14: by default, FootMark is INTERACTIVE — it opens
   DecisionAttributionDrawer on click. When passed `interactive={false}`,
   it renders as a plain non-focusable <sup> with tooltip-only fallback.

   The `interactive=false` path is mandatory inside OptionCard render
   (which uses renderFootnotesOnly), because OptionCard is itself a
   `<button role="radio">` and nested interactive controls violate the
   axe nested-button rule + break radio-group keyboard semantics.
   The contract is enforced at the renderFootnotesOnly call site. */
function FootMark({ idx, step, interactive = true }) {
  const tone = _TONE_FOR[step.type] || _TONE_FOR.note;
  const color = step.sev === "high" ? "var(--ox)" : step.sev === "med" ? "var(--amber)" : "var(--ink2)";
  const supStyle = {
    display:"inline-flex", alignItems:"center", justifyContent:"center",
    minWidth:14, height:14, padding:"0 4px", marginLeft:3,
    fontSize:9, fontFamily:"var(--mono)", fontWeight:700,
    color:"#fff", background:color, borderRadius:7, verticalAlign:"super",
    lineHeight:1, border:"none",
  };
  if(!interactive) {
    return (
      <sup style={supStyle} title={`${tone.label}: ${step.reason}`}>{idx}</sup>
    );
  }
  /* Clickable trace-decision affordance. Self-contained state + drawer
     overlay; the drawer is rendered through a React portal so a click on
     its backdrop never bubbles to a surrounding interactive ancestor
     (Codex review #109 — backdrop click was changing the selected
     regimen when the drawer was opened from inside an option card). */
  const [open, setOpen] = React.useState(false);
  /* Use a real <button> rather than `<sup role="button">` — proper
     semantic element, Space-key activation works correctly without
     extra preventDefault dance, and the visual presentation is a
     superscript via `verticalAlign:"super"` on the inline style. */
  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(true); }}
        title={`Trace decision — ${tone.label}: ${step.reason}`}
        aria-label={`Trace decision · ${tone.label} on ${step.agent}`}
        style={{ ...supStyle, cursor:"pointer", appearance:"none" }}
      >
        {idx}
      </button>
      <DecisionAttributionDrawer
        step={step}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

/* Phase D1 — option-card text renderer. Same footnote-marker attachment
   as renderRichWithFootnotes, but skips the rich-text drug/class chip
   pass so the resulting nodes contain no focusable descendants. Lets
   the OptionCard stay a proper <button role="radio"> without violating
   the nested-interactive axe rule. Phase D2 reintroduces drug/class
   drill from inside cards through a different mechanism (likely a
   per-card "details" affordance, not inline chips).

   Wave 5 PR-14: passes `interactive={false}` on FootMark for the same
   reason — clickable FootMark inside an option-card button would nest
   buttons. The trace-decision drawer is still reachable from any line-
   prose FootMark (renderRichWithFootnotes path). */
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
    out.push(<FootMark key={"fm" + (key++)} idx={ent.idx} step={ent.step} interactive={false} />);
    usedSteps.add(ent.idx);
    remaining = remaining.slice(match.index + match[0].length);
  }
  return out;
}

/* renderRichWithFootnotes — walks the rendered rich-text output and
   injects FootMark elements after each agent-name match that has an
   attached refinement. Preserves ClassChip and TermChip popovers; only
   string nodes are searched. */
function renderRichWithFootnotes(text, onDrug, inlineRefinements, onOpenMechanism) {
  const base = renderRich(text, onDrug, onOpenMechanism);
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

/* ---------- the rendered rx line + footnote list ---------- */
function RxLine({ tier, kind, refinements, onDrug, onOpenMechanism, ctx, d, synId, onAgentSelect }) {
  // Split refinements into inline-attachable vs leader-display.
  const { inline, leader } = useMemo(() => _attachRefinements(refinements), [refinements]);
  const tierColor = kind === "add" ? "var(--amber)" : "var(--ox)";
  const tierLabel = kind === "add" ? "Add" : "Core";
  const tierBg = kind === "add" ? "var(--amber-soft)" : "var(--ox-soft)";
  const tierLine = kind === "add" ? "var(--amber-line)" : "var(--ox-line)";
  return (
    <div style={{ marginBottom: kind === "add" ? 14 : 12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom: 8 }}>
        <span style={{
          fontFamily:"var(--mono)", fontSize:10, letterSpacing:".1em",
          textTransform:"uppercase", fontWeight:700, color: tierColor,
          background: tierBg, border:`1px solid ${tierLine}`, borderRadius:5,
          padding:"3px 9px",
        }}>
          {kind === "add" ? <><Plus size={10} style={{verticalAlign:"-1px", marginRight:3}}/>{tierLabel}</> : tierLabel}
        </span>
        <span style={{ fontSize:14.5, fontWeight:700, color:"var(--ink)", letterSpacing:"-.005em" }}>{tier.k}</span>
        {tier.why && <span style={{ fontSize:12, color:"var(--muted)" }}>· added because {tier.why}</span>}
      </div>
      {/* Phase D1.5 — multi-option presentation with per-card decision
          content + selection-narrowed dose adjustments. */}
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
          exists for this tier — the cards subsume the note's content. */}
      {tier.note && !tierHasContent(synId, tier.k, tier.rx, splitRegimenOptions) && (
        <div style={{ fontSize:12, color:"var(--ink2)", marginTop:4, lineHeight:1.5, fontStyle:"italic" }}>
          {renderGloss(tier.note, onDrug, onOpenMechanism)}
        </div>
      )}
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

function RefinementRow({ idx, step, onDrug, onOpenMechanism }) {
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
        <div>{renderGloss(step.reason, onDrug, onOpenMechanism)} {step.cite && <Cite id={step.cite} />}</div>
      </div>
    </div>
  );
}

export { RxLine, RefinementRow, _attachRefinements, _TONE_FOR, FootMark, renderFootnotesOnly, renderRichWithFootnotes };
