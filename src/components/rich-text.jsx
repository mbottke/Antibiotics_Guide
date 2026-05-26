/* component · rich-text renderers — drug-class + glossary inline popovers.

   Wave 11 W11 atomized polish — the .rx-clspop popover panel picks up
   the Wave 9 chrome grammar via a component-scoped <style> injection:
   glass-diffuse background, asymmetric radius with a 4px cyan top
   strip, and per-list-item cyan light-ring leading dots. The
   "Read the mechanism" footer button picks up the chrome-CTA gradient
   so it reads as the surfaced call-to-action inside the popover. ZERO
   functional changes — the open/close logic, positioning math, and
   keyboard contract are untouched.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, BookOpen, CornerDownRight } from "lucide-react";
import { classData, glossData } from "../engines/clinical.js";
import { RANK_LAB, RX_TOKEN } from "../data/drugs.js";
import { GLOSS_TOKEN } from "../data/content.js";
import { getMechanism } from "../data/mechanisms.js";

/* W11 · component-scoped override layer for .rx-clspop. Targets the
   popovers via the data-w11-clspop attribute that we add below, so
   the override is fully opt-in and never bleeds to other consumers
   of .rx-clspop on other branches. Idempotent injection. */
const W11_CLSPOP_CSS = `
[data-w11-clspop] {
  background: linear-gradient(135deg, rgba(255,255,255,0.86) 0%, rgba(245,250,253,0.74) 100%) !important;
  backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  border: 1px solid var(--ox-line, var(--line)) !important;
  border-radius: 12px 4px 12px 4px !important;
  box-shadow:
    var(--shadow-e3, 0 18px 36px -12px rgba(11,15,20,0.32)),
    inset 0 1px 0 rgba(255,255,255,0.55) !important;
  position: absolute;
  overflow: hidden;
}
[data-w11-clspop]::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg,
    var(--neon-cyan, var(--ox)),
    var(--electric-blue, var(--ox)),
    var(--neon-cyan, var(--ox)));
  pointer-events: none;
}
[data-w11-clspop-item] {
  position: relative;
}
[data-w11-clspop-item]::before {
  content: "";
  position: absolute;
  left: -2px;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--neon-cyan, var(--ox));
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--neon-cyan, var(--ox)) 22%, transparent),
    0 0 8px color-mix(in srgb, var(--neon-cyan, var(--ox)) 40%, transparent);
  pointer-events: none;
}
[data-w11-clspop-mech] {
  background: linear-gradient(180deg,
    var(--ox-deep, #0B0F14) 0%,
    var(--ox, #1F2937) 35%,
    var(--ox, #1F2937) 55%,
    var(--ox-deep, #0B0F14) 100%) !important;
  color: #fff !important;
  border: 1px solid color-mix(in srgb, var(--ox-deep, var(--ox)) 70%, transparent) !important;
  border-radius: 8px 3px 8px 3px !important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.20),
    inset 0 -1px 0 rgba(0,0,0,0.30),
    0 4px 10px -4px rgba(11,15,20,0.45),
    0 0 14px -6px color-mix(in srgb, var(--neon-cyan, var(--ox)) 55%, transparent) !important;
}
@media (prefers-reduced-motion: reduce) {
  [data-w11-clspop] { transition: none !important; }
}
`;
function _ensureClspopStyles() {
  if (typeof document === "undefined") return;
  if (document.querySelector("style[data-w11-clspop-styles]")) return;
  const tag = document.createElement("style");
  tag.setAttribute("data-w11-clspop-styles", "");
  tag.textContent = W11_CLSPOP_CSS;
  document.head.appendChild(tag);
}

/* Wave 5 CL-3 · mechanism wiring. When the chip's phrase resolves through
   getMechanism (drug class for ClassChip, resistance term for TermChip),
   render a "Read the mechanism" button in the popover footer. Clicking it
   calls the threaded onOpenMechanism(key) handler so the parent canvas
   can mount its MechanismDrawer. Graceful fallback: when getMechanism
   returns null, no button is rendered. */
function MechanismFooter({ phrase, onOpenMechanism, onAfter }) {
  if(!onOpenMechanism || !phrase) return null;
  const entry = getMechanism(phrase);
  if(!entry) return null;
  return (
    <button
      type="button"
      className="rx-clspop-mech"
      data-w11-clspop-mech
      title={"Open " + entry.title + " mechanism"}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        marginTop: 8, padding: "7px 10px",
        background: "var(--paper2)", border: "1px solid var(--line)",
        borderRadius: 5, cursor: "pointer",
        fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
        color: "var(--ox)", letterSpacing: ".06em",
        textTransform: "uppercase", width: "100%",
      }}
      onClick={e => { e.stopPropagation(); onOpenMechanism(phrase); if(onAfter) onAfter(); }}
    >
      <BookOpen size={11} aria-hidden />
      <span style={{ flex: 1, textAlign: "left" }}>Read the mechanism</span>
      <ArrowRight size={11} aria-hidden />
    </button>
  );
}

function ClassChip({ phrase, onDrug, onOpenMechanism }){
  _ensureClspopStyles();
  const data = classData(phrase);
  if(!data) return phrase;
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState(null);
  const ref = React.useRef(null), tmr = React.useRef(null);
  const place = () => {
    if(!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const W = 320, vw = window.innerWidth || 1200, vh = window.innerHeight || 800;
    const left = Math.max(12, Math.min(r.left, vw - W - 12));
    const up = r.bottom > vh - 264;
    setPos({ left, y: Math.round(up ? r.top - 6 : r.bottom + 6), up });
  };
  const show = () => { clearTimeout(tmr.current); place(); setOpen(true); };
  const hide = () => { clearTimeout(tmr.current); tmr.current = setTimeout(() => setOpen(false), 130); };
  React.useEffect(() => () => clearTimeout(tmr.current), []);
  React.useEffect(() => {
    if(!open) return;
    const close = () => setOpen(false);
    const onDoc = e => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener("scroll", close, true); window.addEventListener("resize", close);
    document.addEventListener("mousedown", onDoc);
    return () => { window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); document.removeEventListener("mousedown", onDoc); };
  }, [open]);
  return (
    <span ref={ref} className={"rx-clschip" + (open ? " on" : "")} role="button" tabIndex={0}
      aria-haspopup="dialog" aria-expanded={open}
      onMouseEnter={show} onMouseLeave={hide}
      onFocus={show} onBlur={e => { if(!ref.current || !ref.current.contains(e.relatedTarget)) hide(); }}
      onClick={e => { e.stopPropagation(); open ? setOpen(false) : show(); }}
      onKeyDown={e => { if(e.key === "Enter" || e.key === " "){ e.preventDefault(); open ? setOpen(false) : show(); } else if(e.key === "Escape"){ setOpen(false); } }}>
      {phrase}
      {open && pos && (
        <span className={"rx-clspop" + (pos.up ? " up" : "")} data-w11-clspop style={{ left: pos.left + "px", top: pos.y + "px" }}
          role="dialog" aria-label={data.title + " — preferred agents"}
          onMouseEnter={show} onMouseLeave={hide} onClick={e => e.stopPropagation()}>
          <span className="rx-clspop-h" style={{ paddingTop: 6 }}>{data.title}</span>
          {data.blurb && <span className="rx-clspop-blurb">{data.blurb}</span>}
          <span className="rx-clspop-list">
            {data.agents.map(([name, rank, why]) => (
              <button key={name} type="button" className="rx-clspop-ag" data-w11-clspop-item title={"Open " + name + " monograph"}
                onClick={e => { e.stopPropagation(); onDrug && onDrug(name); setOpen(false); }}>
                <span className={"rx-clspop-rank r-" + rank}>{RANK_LAB[rank] || rank}</span>
                <span className="rx-clspop-txt"><span className="n">{name.split(" / ")[0]}</span><span className="w">{why}</span></span>
                <ArrowRight size={13}/>
              </button>
            ))}
          </span>
          <MechanismFooter
            phrase={phrase}
            onOpenMechanism={onOpenMechanism}
            onAfter={() => setOpen(false)}
          />
        </span>
      )}
    </span>
  );
}

function renderRx(text, onDrug, onOpenMechanism){
  if(typeof text !== "string") return text;
  const out = []; let last = 0, m, i = 0; RX_TOKEN.lastIndex = 0;
  while((m = RX_TOKEN.exec(text)) !== null){
    if(m.index > last) out.push(text.slice(last, m.index));
    if(m[1] != null) out.push(<b key={i++}>{m[2]}</b>);
    else out.push(<ClassChip key={i++} phrase={m[3]} onDrug={onDrug} onOpenMechanism={onOpenMechanism} />);
    last = m.index + m[0].length;
    if(m.index === RX_TOKEN.lastIndex) RX_TOKEN.lastIndex++;
  }
  if(last < text.length) out.push(text.slice(last));
  return out;
}

function TermChip({ phrase, onDrug, onOpenMechanism }){
  _ensureClspopStyles();
  const data = glossData(phrase);
  if(!data) return phrase;
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState(null);
  const ref = React.useRef(null), tmr = React.useRef(null);
  const place = () => {
    if(!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const W = 300, vw = window.innerWidth || 1200, vh = window.innerHeight || 800;
    const left = Math.max(12, Math.min(r.left, vw - W - 12));
    const up = r.bottom > vh - 220;
    setPos({ left, y: Math.round(up ? r.top - 6 : r.bottom + 6), up });
  };
  const show = () => { clearTimeout(tmr.current); place(); setOpen(true); };
  const hide = () => { clearTimeout(tmr.current); tmr.current = setTimeout(() => setOpen(false), 130); };
  React.useEffect(() => () => clearTimeout(tmr.current), []);
  React.useEffect(() => {
    if(!open) return;
    const close = () => setOpen(false);
    const onDoc = e => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener("scroll", close, true); window.addEventListener("resize", close);
    document.addEventListener("mousedown", onDoc);
    return () => { window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); document.removeEventListener("mousedown", onDoc); };
  }, [open]);
  return (
    <span ref={ref} className={"rx-termchip" + (open ? " on" : "")} role="button" tabIndex={0}
      aria-haspopup="dialog" aria-expanded={open}
      onMouseEnter={show} onMouseLeave={hide}
      onFocus={show} onBlur={e => { if(!ref.current || !ref.current.contains(e.relatedTarget)) hide(); }}
      onClick={e => { e.stopPropagation(); open ? setOpen(false) : show(); }}
      onKeyDown={e => { if(e.key === "Enter" || e.key === " "){ e.preventDefault(); open ? setOpen(false) : show(); } else if(e.key === "Escape"){ setOpen(false); } }}>
      {phrase}
      {open && pos && (
        <span className={"rx-clspop rx-glosspop" + (pos.up ? " up" : "")} data-w11-clspop style={{ left: pos.left + "px", top: pos.y + "px" }}
          role="dialog" aria-label={data.full}
          onMouseEnter={show} onMouseLeave={hide} onClick={e => e.stopPropagation()}>
          <span className="rx-clspop-h" style={{ paddingTop: 6 }}>{data.full}</span>
          <span className="rx-gloss-ab">{phrase}</span>
          <span className="rx-clspop-blurb" style={{ margin:"6px 0 0" }}>{data.def}</span>
          {data.agent && (
            <button type="button" className="rx-clspop-ag" data-w11-clspop-item style={{ marginTop:8 }} title={"Open " + data.agent[0] + " monograph"}
              onClick={e => { e.stopPropagation(); onDrug && onDrug(data.agent[0]); setOpen(false); }}>
              <span className="rx-clspop-rank r-preferred">Preferred</span>
              <span className="rx-clspop-txt"><span className="n">{data.agent[0].split(" / ")[0]}</span><span className="w">{data.agent[1]}</span></span>
              <ArrowRight size={13}/>
            </button>
          )}
          {data.see && <span className="rx-gloss-see"><CornerDownRight size={12}/> {data.see}</span>}
          <MechanismFooter
            phrase={phrase}
            onOpenMechanism={onOpenMechanism}
            onAfter={() => setOpen(false)}
          />
        </span>
      )}
    </span>
  );
}

function renderGloss(text, onDrug, onOpenMechanism){
  if(typeof text !== "string") return text;
  const out = []; let last = 0, m, i = 0; GLOSS_TOKEN.lastIndex = 0;
  while((m = GLOSS_TOKEN.exec(text)) !== null){
    if(m.index > last) out.push(text.slice(last, m.index));
    if(m[1] != null) out.push(<b key={i++}>{m[2]}</b>);
    else out.push(<TermChip key={i++} phrase={m[3]} onDrug={onDrug} onOpenMechanism={onOpenMechanism} />);
    last = m.index + m[0].length;
    if(m.index === GLOSS_TOKEN.lastIndex) GLOSS_TOKEN.lastIndex++;
  }
  if(last < text.length) out.push(text.slice(last));
  return out;
}

function renderRich(text, onDrug, onOpenMechanism){
  const nodes = renderRx(text, onDrug, onOpenMechanism);
  if(!Array.isArray(nodes)) return nodes;
  const out = []; let k = 0;
  nodes.forEach(n => {
    if(typeof n === "string"){
      const sub = renderGloss(n, onDrug, onOpenMechanism);
      (Array.isArray(sub) ? sub : [sub]).forEach(x => out.push(typeof x === "string" ? x : React.cloneElement(x, { key: "r" + (k++) })));
    } else {
      out.push(React.cloneElement(n, { key: "r" + (k++) }));
    }
  });
  return out;
}

export { ClassChip, TermChip, renderRx, renderGloss, renderRich };
