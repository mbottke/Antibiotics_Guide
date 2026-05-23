/* component · reusable UI primitives (Num, Cite, Drawer, dose-adjust bar, ...).
   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState, useEffect, useRef } from "react";
import { Activity, AlertTriangle, ArrowRight, Bug, Calculator, Check, ChevronRight, ListChecks, X } from "lucide-react";
import { GUIDELINES } from "../data/evidence.js";
import { ORG_BY_ID } from "../data/organisms.js";
import { SRC_CONTROL } from "../data/syndromes.js";
import { childPugh, childPughComponentPoints, doseAdjustments } from "../engines/dosing.js";
import { CP_COMPONENTS, _ADJ_META } from "../data/dosing.js";

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

function BugTag({ id, onClick }) {
  const o = ORG_BY_ID[id];
  if (!o) return null;            /* graceful for users; the integrity check warns at author time */
  return (
    <button className="rx-tag t-neutral clk" onClick={() => onClick && onClick(id)} title={"Open the organism card"}>
      <Bug size={11} /> {o.label}
    </button>
  );
}

/* Provenance chip — the single rendering path for "where does this come from?".
   Looks up the guideline registry by id; renders nothing if the id is missing
   (the integrity check reports any dangling ids at author time). */
function Cite({ id, onClick }) {
  const g = GUIDELINES[id];
  if (!g) return null;
  const label = g.year ? `${g.body} \u2019${String(g.year).slice(2)}` : g.body;
  return (
    <span className={"rx-cite" + (onClick ? " cl" : "")}
      title={`${g.body}${g.year ? " " + g.year : ""} \u2014 ${g.title}`}
      onClick={onClick ? () => onClick(id) : undefined}>
      {label}
    </span>
  );
}

function Ev({ kind }) {
  const map = { rct:["ev-rct","RCT"], guide:["ev-guide","Guideline"], obs:["ev-obs","Observational"] };
  const [c, t] = map[kind] || map.guide;
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
   by the global root rule. */
function Drawer({ open, onClose, title, kicker, icon:Icon, children, width }){
  const panelRef = useRef(null);
  const lastFocus = useRef(null);
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
  return (
    <div className="rx-drawer-overlay" onClick={onClose}>
      <div className="rx-drawer" role="dialog" aria-modal="true" aria-label={title}
        ref={panelRef} tabIndex={-1} onClick={e => e.stopPropagation()}
        style={width ? { width:`min(${width}px, 96vw)` } : undefined}>
        <div className="rx-drawer-head">
          <div className="rx-drawer-titles">
            {kicker && <div className="rx-drawer-kicker">{kicker}</div>}
            <div className="rx-drawer-title">{Icon ? <Icon size={18} /> : null}<span>{title}</span></div>
          </div>
          <button className="rx-drawer-x" onClick={onClose} aria-label="Close panel"><X size={18} /></button>
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

/* ---- matrix cell primitives (penetration / safety) ---- */
const PDot = ({ lv }) => { const m={good:"d-good",mod:"d-mod",poor:"d-poor",var:"d-var",na:"d-na"}; return <span className={"rx-dot "+(m[lv]||"d-poor")} aria-label={lv} title={({good:"good penetration",mod:"moderate",poor:"poor / inadequate",var:"variable",na:"not applicable"})[lv]} />; };

const ToxDot = ({ lv }) => lv ? <span className={"tox-d "+(lv==="hi"?"tx-hi":lv==="mod"?"tx-mod":"tx-lo")} title={({hi:"notable / boxed concern",mod:"moderate",lo:"low / class-typical"})[lv]} /> : <span className="tx-dot-txt">&middot;</span>;

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
  return (
    <button className="rx-cardcopy" onClick={onCopy} title="Copy this card as a plain-text note">
      {copied ? <><Check size={13}/> Copied</> : <><ListChecks size={13}/> Copy as note</>}
    </button>
  );
}

export { Num, Cite, Ev, BugTag, SectionDisc, Drawer, PDot, ToxDot, CardCopyButton, DoseAdjustBar, ChildPughScorer };
