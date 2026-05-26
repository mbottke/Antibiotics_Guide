/* component · rich-text renderers — drug-class + glossary inline popovers.
   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, BookOpen, CornerDownRight } from "lucide-react";
import { classData, glossData } from "../engines/clinical.js";
import { RANK_LAB, RX_TOKEN } from "../data/drugs.js";
import { GLOSS_TOKEN } from "../data/content.js";
import { getMechanism } from "../data/mechanisms.js";

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
      title={"Open " + entry.title + " mechanism"}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        marginTop: 8, padding: "5px 8px",
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
        <span className={"rx-clspop" + (pos.up ? " up" : "")} style={{ left: pos.left + "px", top: pos.y + "px" }}
          role="dialog" aria-label={data.title + " — preferred agents"}
          onMouseEnter={show} onMouseLeave={hide} onClick={e => e.stopPropagation()}>
          <span className="rx-clspop-h">{data.title}</span>
          {data.blurb && <span className="rx-clspop-blurb">{data.blurb}</span>}
          <span className="rx-clspop-list">
            {data.agents.map(([name, rank, why]) => (
              <button key={name} type="button" className="rx-clspop-ag" title={"Open " + name + " monograph"}
                onClick={e => { e.stopPropagation(); onDrug && onDrug(name); setOpen(false); }}>
                <span className={"rx-clspop-rank r-" + rank}>{RANK_LAB[rank] || rank}</span>
                <span className="rx-clspop-txt"><span className="n">{name.split(" / ")[0]}</span><span className="w">{why}</span></span>
                <ArrowRight size={13} aria-hidden/>
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
        <span className={"rx-clspop rx-glosspop" + (pos.up ? " up" : "")} style={{ left: pos.left + "px", top: pos.y + "px" }}
          role="dialog" aria-label={data.full}
          onMouseEnter={show} onMouseLeave={hide} onClick={e => e.stopPropagation()}>
          <span className="rx-clspop-h">{data.full}</span>
          <span className="rx-gloss-ab">{phrase}</span>
          <span className="rx-clspop-blurb" style={{ margin:"6px 0 0" }}>{data.def}</span>
          {data.agent && (
            <button type="button" className="rx-clspop-ag" style={{ marginTop:8 }} title={"Open " + data.agent[0] + " monograph"}
              onClick={e => { e.stopPropagation(); onDrug && onDrug(data.agent[0]); setOpen(false); }}>
              <span className="rx-clspop-rank r-preferred">Preferred</span>
              <span className="rx-clspop-txt"><span className="n">{data.agent[0].split(" / ")[0]}</span><span className="w">{data.agent[1]}</span></span>
              <ArrowRight size={13}/>
            </button>
          )}
          {data.see && <span className="rx-gloss-see"><CornerDownRight size={12} aria-hidden/> {data.see}</span>}
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
