/* component · reusable UI primitives (Num, Cite, Drawer, dose-adjust bar, ...).
   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState, useEffect, useRef } from "react";
import { Activity, AlertTriangle, ArrowRight, Bug, Calculator, Check, ChevronRight, ListChecks, X } from "lucide-react";
import { GUIDELINES } from "../data/evidence.js";
import { ORG_BY_ID } from "../data/organisms.js";
import { SRC_CONTROL } from "../data/syndromes.js";
import { childPugh, childPughComponentPoints, doseAdjustments } from "../engines/dosing.js";
import { CP_COMPONENTS, _ADJ_META } from "../data/dosing.js";
import { useReducedMotion } from "./util/useReducedMotion.js";
import { useRipple } from "./util/useRipple.js";
import { Sparkle } from "./decor/Sparkle.jsx";

/* DoseAdjustBar — renders the triggered adjustments for one rx line beneath the
   verbatim prose. Silent when nothing is triggered. Agent names open monographs. */
function DoseAdjustBar({ rx, ctx, d, onDrug, synId }){
  const adj = doseAdjustments(rx, ctx, d, synId);
  if(!adj.length) return null;
  return (
    <div className="rx-adjbar" role="note" aria-label="Patient-specific dose adjustments">
      <span className="rx-adjbar-lab"><Activity size={11}/> For this patient</span>
      <span className="rx-adjbar-items">
        {adj.map((a, i) => {
          const meta = _ADJ_META[a.kind] || _ADJ_META.renal;
          const agentShort = a.agent.split(" / ")[0].replace(/\s*\(IV\)\s*/i, "");
          return (
            <span key={i} className={"rx-adj " + meta.cls} title={a.note || a.value}>
              <span className="rx-adj-tag">{meta.tag}</span>
              <button type="button" className="rx-adj-ag" onClick={() => onDrug && onDrug(a.agent)}
                title={"Open " + agentShort + " monograph"}>{agentShort}</button>
              <span className="rx-adj-lab">{a.label}</span>
              {(a.kind === "renal" || a.kind === "weight") && <ArrowRight size={11} className="rx-adj-arr"/>}
              <span className="rx-adj-val">{a.value}</span>
              {a.basis && <span className="rx-adj-basis">{a.basis}</span>}
            </span>
          );
        })}
      </span>
    </div>
  );
}

/* Outer Glyph removed — it was unused; the Spectrum module defines its own. */

function BugTag({ id, onClick, doc }) {
  const o = ORG_BY_ID[id];
  if (!o) return null;            /* graceful for users; the integrity check warns at author time */
  /* W10 · adopt .rx-glow-lift on the asymmetric organism chip for the
     spring-style hover + cyan glow trail. The `doc` prop opts the chip
     into a drug-of-choice marker (small Sparkle in neon-cyan) sat
     directly before the label — used by tier-1 / DoC rows. */
  return (
    <button className="rx-tag t-neutral clk rx-glow-lift" onClick={() => onClick && onClick(id)} title={"Open the organism card"}>
      <Bug size={11} /> {doc ? <Sparkle size={11} color="var(--neon-cyan, var(--ox))" style={{ marginRight: 1 }} /> : null}{o.label}
    </button>
  );
}

/* Provenance chip — the single rendering path for "where does this come from?".
   Looks up the guideline registry by id; renders nothing if the id is missing
   (the integrity check reports any dangling ids at author time). */
function Cite({ id, onClick }) {
  const g = GUIDELINES[id];
  if (!g) return null;
  /* W10 \u00b7 split the year into its own italic-serif tabular-numeric span
     in neon-cyan so the publication body and year scan as two distinct
     fields. Inline style so it doesn't depend on a stylesheet edit. */
  return (
    <span className={"rx-cite" + (onClick ? " cl" : "")}
      title={`${g.body}${g.year ? " " + g.year : ""} \u2014 ${g.title}`}
      onClick={onClick ? () => onClick(id) : undefined}>
      {g.body}
      {g.year && (
        <span style={{
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontVariantNumeric: "tabular-nums",
          color: "var(--neon-cyan, var(--ox-bright, var(--ox)))",
          marginLeft: 4,
        }}>{"\u2019" + String(g.year).slice(2)}</span>
      )}
    </span>
  );
}

function Ev({ kind }) {
  const map = { rct:["ev-rct","RCT"], guide:["ev-guide","Guideline"], obs:["ev-obs","Observational"] };
  const [c, t] = map[kind] || map.guide;
  /* W10 · promote highest-tier evidence (RCT) with an inline chrome
     gradient (ox-deep → ox-bright) + cyan-tinted border + outer halo,
     so the strongest evidence visually outranks guideline /
     observational. Lower tiers keep the existing flat palette. */
  if (kind === "rct") {
    return (
      <span className={"rx-ev " + c}
        style={{
          color: "#fff",
          background: "linear-gradient(135deg, var(--ox-deep, var(--ox)) 0%, var(--ox-bright, var(--ox)) 100%)",
          border: "1px solid color-mix(in srgb, var(--neon-cyan, var(--ox-bright)) 45%, transparent)",
          boxShadow: "0 0 10px -3px color-mix(in srgb, var(--neon-cyan, var(--ox-bright)) 55%, transparent)",
        }}>
        <span className="dot" style={{ background: "#fff" }} />{t}
      </span>
    );
  }
  return <span className={"rx-ev " + c}><span className="dot" />{t}</span>;
}

function SectionDisc() {
  return (
    <div className="rx-disc">
      <AlertTriangle size={16} />
      <span><b>Decision support, not a protocol.</b> <b>Adult</b> inpatient <b>antibacterials only</b> — antifungal, antiviral, antimycobacterial, and antiparasitic therapy are out of scope, as are pediatric, neonatal, and pregnancy-specific regimens. Doses assume normal renal/hepatic function and serious infection. The <b>local antibiogram and the organism's own susceptibility result supersede</b> any spectrum shown here. Always reconcile with current primary guidelines, clinical pharmacy, and ID consultation, and verify every dose before ordering.</span>
    </div>
  );
}

/* Tabular-figure numeral wrapper (§7/§8) — the single lever for column-aligned
   doses, clearances, AUC, and %F. Renders monospace with tabular figures. */
function Num({ children, className }){
  return <span className={"rx-num" + (className ? " " + className : "")}>{children}</span>;
}

/* ---- A3 · SHARED DRAWER PRIMITIVE -----------------------------------------
   One accessible right-side sheet reused by the drug card, organism card,
   selector output, and trial cards. role=dialog + aria-modal, focus-trap,
   Esc-to-close (capture phase so it pre-empts the ⌘K handler), return-focus to
   the trigger on close. Slide animation is auto-disabled under reduced-motion
   by the global root rule.

   Wave 10 W10 · the legacy reference drawer adopts the shared chrome
   vocabulary via additive inline styles + class names — the global
   .rx-drawer- CSS stays untouched (W10 constraint). The overlay gets
   .rx-mercury-backdrop; the panel paints .rx-glass-diffuse with 22/4
   asymmetric outer corners, a 4px cyan top strip, and (motion-permitting)
   a soft .rx-glow-trail entrance. The close button becomes a chrome pill
   with a ripple. */
const _DRAWER_TOP_STRIP_BG =
  "linear-gradient(90deg," +
  " var(--neon-cyan, var(--ox))," +
  " var(--electric-blue, var(--ox))," +
  " var(--hot-magenta, var(--ox)))";

function Drawer({ open, onClose, title, kicker, icon:Icon, children, width }){
  const panelRef = useRef(null);
  const lastFocus = useRef(null);
  const closeBtnRef = useRef(null);
  const reducedMotion = useReducedMotion();
  useRipple(closeBtnRef);
  useEffect(() => {
    if(!open) return;
    lastFocus.current = (typeof document !== "undefined") ? document.activeElement : null;
    const el = panelRef.current;
    const sel = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
    const focusables = () => el ? Array.from(el.querySelectorAll(sel)).filter(n => n.offsetParent !== null || n === el) : [];
    const f = focusables();
    (f[0] || el) && (f[0] || el).focus();
    const onKey = (e) => {
      if(e.key === "Escape"){ e.stopPropagation(); e.preventDefault(); onClose(); return; }
      if(e.key === "Tab"){
        const fs = focusables(); if(!fs.length){ e.preventDefault(); return; }
        const first = fs[0], last = fs[fs.length - 1];
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      const lf = lastFocus.current;
      if(lf && typeof lf.focus === "function") lf.focus();
    };
  }, [open, onClose]);
  if(!open) return null;
  const panelClass = "rx-drawer rx-glass-diffuse" + (reducedMotion ? "" : " rx-glow-trail");
  const panelExtra = {
    /* W10 chrome — 22/4 asymmetric outer corners (rounded on the leading
        edge where the panel meets the viewport, sharp on the inboard
        seam). The 4px cyan top strip is painted via an absolute span
        below — we leave the panel border-top alone so the strip lays
        cleanly across the full top edge. */
    borderRadius: "22px 4px 22px 4px",
    overflow: "hidden",
    position: "relative",
  };
  const panelStyle = width
    ? { width: `min(${width}px, 96vw)`, ...panelExtra }
    : panelExtra;
  return (
    <div className="rx-drawer-overlay rx-mercury-backdrop" onClick={onClose}>
      <div className={panelClass} role="dialog" aria-modal="true" aria-label={title}
        ref={panelRef} tabIndex={-1} onClick={e => e.stopPropagation()}
        style={panelStyle}>
        {/* 4px cyan top strip — chrome family signature. */}
        <span aria-hidden="true" style={{
          position: "absolute", left: 0, right: 0, top: 0,
          height: 4, background: _DRAWER_TOP_STRIP_BG,
          borderTopLeftRadius: 22, pointerEvents: "none",
          zIndex: 2,
        }} />
        <div className="rx-drawer-head rx-glass-bleed" style={{ position: "relative" }}>
          <div className="rx-drawer-titles">
            {kicker && <div className="rx-drawer-kicker">{kicker}</div>}
            <div className="rx-drawer-title">{Icon ? <Icon size={18} /> : null}<span>{title}</span></div>
          </div>
          <button
            ref={closeBtnRef}
            className="rx-drawer-x rx-magnetic rx-shine-sweep rx-ripple rx-focus-halo"
            onClick={onClose}
            aria-label="Close panel"
            style={{
              borderRadius: 999,
              background: "rgba(0, 212, 255, 0.08)",
              borderColor: "var(--neon-cyan-line, var(--ox-line))",
              color: "var(--ink)",
            }}
          ><X size={16} /></button>
        </div>
        <div className="rx-drawer-body">{children}</div>
      </div>
    </div>
  );
}

/* ---- CHILD-PUGH SCORER ----------------------------------------------------
   Makes the CP-A/B/C classification self-explaining and self-computing. Five
   components, each scored 1–3; the running total maps to a class and auto-sets
   the hepatic dosing stage. Numeric components (bilirubin, albumin, INR) take a
   value and show which band it falls in; categorical components (ascites,
   encephalopathy) are segmented. */
function ChildPughScorer({ cp, onField, hepatic }){
  const [open, setOpen] = React.useState(false);
  const res = childPugh(cp);
  return (
    <div className="rx-cp">
      <button className="rx-cp-head" aria-expanded={open} onClick={()=>setOpen(o=>!o)}>
        <span className="rx-cp-headl"><Calculator size={14}/> Determine Child-Pugh class</span>
        {res
          ? <span className="rx-cp-badge" style={{color:res.band.c, borderColor:res.band.c}}><b>Class {res.cls}</b> · {res.total} pts</span>
          : <span className="rx-cp-hint">enter the five components</span>}
        <ChevronRight size={15} className={"rx-cp-chev" + (open ? " open" : "")} />
      </button>
      {open && (
        <div className="rx-cp-body">
          <div className="rx-cp-grid">
            {CP_COMPONENTS.map(comp => {
              const pts = childPughComponentPoints(comp, cp[comp.key]);
              return (
                <div className="rx-cp-row" key={comp.key}>
                  <div className="rx-cp-lab">{comp.label}{comp.unit && <span className="rx-cp-unit rx-mono"> {comp.unit}</span>}</div>
                  {comp.kind === "num" ? (
                    <div className="rx-cp-numwrap">
                      <input type="number" step="0.1" min="0" className="rx-cp-num" value={cp[comp.key]}
                        aria-label={comp.label}
                        onChange={e=>onField(comp.key, e.target.value)} />
                      <div className="rx-cp-bands">
                        {comp.bands.map((b,i)=>(
                          <span key={i} className={"rx-cp-band" + (pts===i+1 ? " on" : "")}>{b}<sup>{i+1}</sup></span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rx-cp-seg">
                      {comp.opts.map(([val,lab,p])=>(
                        <button key={val} aria-pressed={cp[comp.key]===val}
                          className={cp[comp.key]===val ? "on" : ""}
                          onClick={()=>onField(comp.key, val)}>{lab}<sup>{p}</sup></button>
                      ))}
                    </div>
                  )}
                  <div className={"rx-cp-pts rx-mono" + (pts ? "" : " empty")}>{pts || "·"}</div>
                </div>
              );
            })}
          </div>
          <div className="rx-cp-foot">
            {res ? (
              <div className="rx-cp-result" style={{borderColor:res.band.c}}>
                <span className="rx-cp-total rx-mono" style={{color:res.band.c}}>{res.total}</span>
                <span className="rx-cp-rtx"><b style={{color:res.band.c}}>Child-Pugh {res.band.t}</b><span className="rx-cp-rsub">5–6 = A · 7–9 = B · 10–15 = C. The hepatic toggle has been set to match.</span></span>
              </div>
            ) : (
              <div className="rx-cp-scale rx-mono">5–6 = A · 7–9 = B · 10–15 = C</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- matrix cell primitives (penetration / safety) ----
   W10 · the existing .rx-dot / .tox-d glyphs are kept as the structural
   shape; the neon light-ring utility (cyan/amber/red) is layered as a
   second className so the dot reads as a glowing neon ring at the
   matrix scale. Each variant maps to a severity tier:
     PDot:   good→cyan, mod/var→amber, poor→red, na→(no ring)
     ToxDot: hi→red, mod→amber, lo→cyan
   `na` and the empty ToxDot ("·") keep their muted treatment so absence
   of data doesn't pretend to be a status. */
const _PDOT_RING = { good: "rx-light-ring-cyan", mod: "rx-light-ring-amber", var: "rx-light-ring-amber", poor: "rx-light-ring-red" };
const PDot = ({ lv }) => {
  const m={good:"d-good",mod:"d-mod",poor:"d-poor",var:"d-var",na:"d-na"};
  const ring = _PDOT_RING[lv];
  return <span className={"rx-dot "+(m[lv]||"d-poor")+(ring ? " " + ring : "")} aria-label={lv} title={({good:"good penetration",mod:"moderate",poor:"poor / inadequate",var:"variable",na:"not applicable"})[lv]} />;
};

const _TOXDOT_RING = { hi: "rx-light-ring-red", mod: "rx-light-ring-amber", lo: "rx-light-ring-cyan" };
const ToxDot = ({ lv }) => lv ? <span className={"tox-d "+(lv==="hi"?"tx-hi":lv==="mod"?"tx-mod":"tx-lo")+" "+(_TOXDOT_RING[lv]||"")} title={({hi:"notable / boxed concern",mod:"moderate",lo:"low / class-typical"})[lv]} /> : <span className="tx-dot-txt">&middot;</span>;

/* DecisionTag — semantic decision-channel chip for the Bedside answer canvas.
   Four states aligned to the --decision-* tokens: start (green, go as written),
   adjusted (amber, renal/weight/substitution), avoid (oxblood, contraindicated
   here), pending (neutral, awaiting data). Self-styling so it does not require
   a CSS edit per consumer — Phase 0 ships the primitive; later phases compose
   it into dose rows, refinement footnotes, and culture-state chips. */
const _DECISION_STATES = {
  start:    { label: "Start",    role: "go as written" },
  adjusted: { label: "Adjusted", role: "modified for this patient" },
  avoid:    { label: "Avoid",    role: "contraindicated here" },
  pending:  { label: "Pending",  role: "awaiting data" },
};
function DecisionTag({ state = "start", children, title }) {
  const meta = _DECISION_STATES[state] || _DECISION_STATES.start;
  const bg = `var(--decision-${state}-bg)`;
  const fg = `var(--decision-${state})`;
  const bd = `var(--decision-${state}-line)`;
  return (
    <span
      className={"rx-decision rx-decision-" + state}
      title={title || meta.role}
      aria-label={(typeof children === "string" ? children + " — " : "") + meta.role}
      style={{
        display:"inline-flex", alignItems:"center", gap:5,
        fontSize:"11px", fontWeight:600, lineHeight:1.3, letterSpacing:".01em",
        padding:"3px 8px", borderRadius:999, whiteSpace:"nowrap",
        color:fg, background:bg, border:`1px solid ${bd}`,
      }}>
      {children || meta.label}
    </span>
  );
}

/* Copy a syndrome card as a plain-text note for the EHR. Stand-alone so the
   inline card render stays clean; mirrors the RegimenCard copy affordance. */
function CardCopyButton({ syn }){
  const [copied, setCopied] = React.useState(false);
  const build = () => {
    const s = syn;
    const lines = [s.name, s.line, ""];
    s.tiers.forEach(t => lines.push(`${t.k}: ${t.rx}${t.note ? `  (${t.note})` : ""}`));
    lines.push("");
    lines.push(`Covers: ${s.cover.empiric}`);
    lines.push(`Avoid / instead: ${s.cover.drop}`);
    lines.push(`Duration: ${s.duration}`);
    lines.push(`48–72 h: ${s.deesc}`);
    if(SRC_CONTROL[s.id]) lines.push(`Source control: ${SRC_CONTROL[s.id]}`);
    return lines.join("\n");
  };
  const onCopy = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1800); };
    try { (navigator.clipboard && navigator.clipboard.writeText) ? navigator.clipboard.writeText(build()).then(done, done) : done(); }
    catch(e){ done(); }
  };
  /* W10 · adopt .rx-shine-sweep + .rx-magnetic on the copy affordance
     so the chrome pill sweeps a diagonal sheen on hover and reads as a
     first-class CTA. The existing .rx-cardcopy class keeps the
     layout/typography contract; the additive classes are the only
     visual change so light/dark variants stay consistent. */
  return (
    <button className="rx-cardcopy rx-shine-sweep rx-magnetic" onClick={onCopy} title="Copy this card as a plain-text note">
      {copied ? <><Check size={13}/> Copied</> : <><ListChecks size={13}/> Copy as note</>}
    </button>
  );
}

export { Num, Cite, Ev, BugTag, SectionDisc, Drawer, PDot, ToxDot, CardCopyButton, DoseAdjustBar, ChildPughScorer, DecisionTag };
