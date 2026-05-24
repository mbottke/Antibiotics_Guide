/* component · SyndromesSection — Wave 2 IA Phase B2 (Syndromes).
   Self-contained extraction of the empiric-by-syndrome catalog that
   previously lived inline in App.jsx as renderEmpiric().

   Renders:
     · executable regimen builder (presentation + β-lactam allergy + risk tags)
     · category filter bar (All / SIRS / CNS / Pulmonary / …)
     · accordion of every syndrome card with tiered regimens, cover-list,
       organism chips, duration + evidence, de-escalation block, and pearls
     · "Open as case" deep-link into decide mode

   Hash-synced state (synCat, openSyn) is owned by the parent so URL
   round-tripping stays at the App level. Internal-only state (selSyn for
   the builder selector) is local because it never appears in the hash.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState } from "react";
import {
  Stethoscope, Clock, ChevronRight, GitBranch, Crosshair,
  Check, Plus,
} from "lucide-react";
import { renderRich, renderGloss } from "../components/rich-text";
import { Num, Cite, Ev, BugTag, CardCopyButton, DoseAdjustBar } from "../components/primitives";
import { synEvidence } from "../engines/clinical";
import { CAT_ICONS, SYN_ICON } from "../data/ui-maps";
import { SYNDROMES, SYN_CATS, SRC_CONTROL } from "../data/syndromes";

function SyndromesSection({
  caseState, setCaseState,
  ctx, d, dose,
  openDrug, openOrg, openTrial, openRegimen,
  setMode, setTab,
  synCat, setSynCat,
  openSyn, setOpenSyn,
}) {
  // Builder selector — local UI state only (never hash-synced). Seeds from
  // the currently expanded card so the builder reflects the user's focus.
  const [selSyn, setSelSyn] = useState(openSyn || "sepsis");

  const setCtxField = (k, v) =>
    setCaseState(c => ({ ...c, patient: { ...c.patient, [k]: v } }));

  // openRegimen is supplied by the parent in normal use; when omitted the
  // builder button falls back to the deep-link path (decide mode + syndrome).
  const handleAssemble = (id) => {
    const target = id || selSyn;
    if (typeof openRegimen === "function") {
      openRegimen(target);
      return;
    }
    setCaseState(cs => ({ ...cs, syndrome: target }));
    setMode && setMode("decide");
  };

  const cats = [{ id: "all", label: "All" }].concat(SYN_CATS);
  const list = synCat === "all" ? SYNDROMES : SYNDROMES.filter(s => s.cat === synCat);
  const catCount = id => id === "all" ? SYNDROMES.length : SYNDROMES.filter(s => s.cat === id).length;

  return (
    <>
      <h2 className="rx-h2">Empiric therapy by syndrome</h2>
      <p className="rx-lede">{SYNDROMES.length} inpatient presentations, each with tiered regimens, what to cover (and what to deliberately omit), target organisms, an evidence-based duration, and the de-escalation move. Generic agents at serious-infection doses; tap an organism to jump to the spectrum matrix.</p>

      {/* ---- B2 · executable regimen builder ---- */}
      <div className="rx-builder">
        <div className="rx-builder-h"><GitBranch size={15}/> Build an empiric regimen</div>
        <p className="rx-builder-sub">Pick a presentation and set host-resistance risks — these write to the patient context, so the assembled regimen and its doses follow {ctx.on ? <>the active patient (CrCl <Num>{d.crcl ?? "—"}</Num>)</> : "the bar above once you apply a patient"}.</p>
        <div className="rx-builder-grid">
          <label className="rx-builder-field">
            <span>Presentation</span>
            <select value={selSyn} onChange={e=>setSelSyn(e.target.value)}>
              {SYN_CATS.map(cat => (
                <optgroup key={cat.id} label={cat.label}>
                  {SYNDROMES.filter(s=>s.cat===cat.id).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </optgroup>
              ))}
            </select>
          </label>
          <label className="rx-builder-field">
            <span>β-lactam allergy</span>
            <select value={ctx.blAllergy} onChange={e=>setCtxField("blAllergy", e.target.value)}>
              <option value="none">None</option>
              <option value="mild">Low-risk / delayed</option>
              <option value="severe">Severe / anaphylaxis</option>
            </select>
          </label>
        </div>
        <div className="rx-builder-risks">
          <span className="rx-builder-rlab">Host risks</span>
          {[["mrsaRisk","MRSA"],["pseudoRisk","Pseudomonas"],["esblRisk","ESBL / R-GNR"],["severe","Severe / shock"]].map(([k,lab]) => (
            <button key={k} className={"rx-tag clk " + (ctx[k] ? "t-ox" : "t-neutral")} aria-pressed={!!ctx[k]} onClick={()=>setCtxField(k, !ctx[k])}>
              {ctx[k] ? <Check size={11}/> : <Plus size={11}/>} {lab}
            </button>
          ))}
        </div>
        <button className="rx-builder-go" onClick={()=>handleAssemble(selSyn)}><Crosshair size={14}/> Assemble regimen</button>
      </div>

      <div className="rx-mxbar" style={{marginBottom:18}}>
        {cats.map(c => (
          <button key={c.id} className={"rx-tag clk " + (synCat === c.id ? "t-ox" : "t-neutral")} onClick={() => setSynCat(c.id)}>
            {c.label}<span className="rx-catn">{catCount(c.id)}</span>
          </button>
        ))}
      </div>

      {SYN_CATS.filter(c => synCat === "all" || c.id === synCat).map(cat => {
        const items = list.filter(s => s.cat === cat.id);
        if (!items.length) return null;
        const CI = CAT_ICONS[cat.icon] || Stethoscope;
        return (
          <div key={cat.id}>
            <div className="rx-syscat"><span className="ic"><CI size={13}/></span>{cat.label}</div>
            {items.map(s => {
              const open = openSyn === s.id;
              const SI = SYN_ICON[s.icon] || Stethoscope;
              return (
                <div className="rx-acc" data-open={open} key={s.id}>
                  <button className="rx-accbtn" onClick={() => setOpenSyn(open ? null : s.id)} aria-expanded={open}>
                    <span className="rx-accicon"><SI size={17}/></span>
                    <span className="rx-accmain">
                      <span className="rx-accname">{s.name}</span>
                      {open
                        ? <span className="rx-accline">{s.line}</span>
                        : <span className="rx-accprev"><span className="k">{s.tiers[0].k}</span> {s.tiers[0].rx}</span>}
                    </span>
                    <span className="rx-accchev"><ChevronRight size={18}/></span>
                  </button>
                  {open && (
                    <div className="rx-accbody">
                      {SRC_CONTROL[s.id] && (
                        <div className="rx-srcctrl" role="note">
                          <Crosshair size={15} />
                          <span><b>Source control is the therapy; antibiotics are adjunctive.</b> {SRC_CONTROL[s.id]}</span>
                        </div>
                      )}
                      {s.tiers.map((t,ti) => (
                        <div className={"rx-tier " + (t.sev ? "sev" : ti>0 ? "alt" : "")} key={ti}>
                          <div className="rx-tierlab">
                            {t.k}
                            {t.sev && <span className="rx-pref pref-1">severe / first-hour</span>}
                          </div>
                          <p className="rx-rx">{renderRich(t.rx, openDrug)}</p>
                          <DoseAdjustBar rx={t.rx} ctx={ctx} d={d} onDrug={openDrug} synId={s.id} />
                          {t.note && <p className="rx-rxnote">{renderGloss(t.note, openDrug)}</p>}
                        </div>
                      ))}

                      <div className="rx-coverrow">
                        <div className="rx-coverbox"><div className="h">Cover</div><div className="t">{renderGloss(s.cover.empiric, openDrug)}</div></div>
                        <div className="rx-coverbox"><div className="h">Don't / instead</div><div className="t">{renderGloss(s.cover.drop, openDrug)}</div></div>
                      </div>

                      <div className="rx-metarow">
                        <span className="lab">Target organisms</span>
                      </div>
                      <div className="rx-bugs">
                        {s.bugs.map(b => <BugTag key={b} id={b} onClick={(id)=>openOrg(id)} />)}
                      </div>

                      <div className="rx-metarow" style={{marginTop:14}}>
                        <span><span className="lab">Duration</span> <span className="rx-durpill"><Clock size={13}/> {s.duration}</span></span>
                        {(() => { const e = synEvidence(s); return e ? (
                          <span><span className="lab">Evidence</span> {e.ev && <Ev kind={e.ev} />} <Cite id={e.ref} onClick={(cid)=>openTrial(cid)} /></span>
                        ) : null; })()}
                      </div>

                      <div className="rx-coverbox" style={{marginTop:12,background:"var(--ox-softer)",borderColor:"var(--ox-line)"}}>
                        <div className="h" style={{color:"var(--ox)"}}>De-escalation</div>
                        <div className="t">{renderGloss(s.deesc, openDrug)}</div>
                      </div>

                      <ul className="rx-pearls">
                        {s.pearls.map((p,pi) => <li key={pi} dangerouslySetInnerHTML={{__html:p.replace(/\*\*(.+?)\*\*/g,"<b>$1</b>")}} />)}
                      </ul>

                      <div className="rx-cardfoot" style={{ gap: 10 }}>
                        <button
                          type="button"
                          className="rx-tag t-ox clk"
                          onClick={() => {
                            setCaseState(cs => ({ ...cs, syndrome: s.id }));
                            setMode && setMode("decide");
                          }}
                          title="Open this syndrome in decide mode with the current patient context"
                          style={{ marginRight: "auto" }}>
                          <Crosshair size={12} style={{ verticalAlign: "-1px", marginRight: 4 }} />
                          Open as case
                        </button>
                        <CardCopyButton syn={s} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}

export { SyndromesSection };
