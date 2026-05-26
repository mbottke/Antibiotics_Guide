/* component · SyndromesSection — Wave 2 IA Phase B2 (Syndromes).
   Self-contained extraction of the empiric-by-syndrome catalog that
   previously lived inline in App.jsx as renderEmpiric().

   Wave 7 W7-B refresh: glass cards with hover lift, gradient corner
   accents, neon focus glow, category chips with considered tone
   palette, oversized display kicker. Information architecture
   unchanged; this is purely a visual+motion refresh.

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

// Small inline sparkle glyph — same path used elsewhere in the W7
// aesthetic for the kicker beside mono labels and high-volume cards.
const SparkleGlyph = ({ size = 12, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={style}>
    <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" fill="currentColor"/>
  </svg>
);

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

  // Heuristic for "high-volume" syndromes (>= 4 target organisms) — gets a
  // small sparkle beside the name to draw the eye on dense scans.
  const isHighVolume = (s) => Array.isArray(s.bugs) && s.bugs.length >= 4;

  return (
    <>
      {/* ---- W7-B · cinematic heading area ---- */}
      <header style={{ marginBottom: 36 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
          <span aria-hidden style={{
            fontFamily:"var(--mono)", fontSize:11, letterSpacing:".24em",
            textTransform:"uppercase", color:"var(--neon-cyan, var(--ox))",
            fontWeight:700,
          }}>Syndromes</span>
          <SparkleGlyph size={12} style={{ color:"var(--neon-cyan, var(--ox))" }} />
        </div>
        <h2 style={{
          fontFamily:"var(--serif)", fontSize:48, fontWeight:700,
          letterSpacing:"-.024em", lineHeight:1.04,
          margin:"0 0 12px", color:"var(--ink)",
        }}>Empiric therapy by syndrome</h2>
        <p style={{
          fontFamily:"var(--serif)", fontStyle:"italic", fontSize:17,
          color:"var(--ink2)", lineHeight:1.55, margin:0, maxWidth:"62ch",
        }}>
          Empiric therapy organized by syndrome — {SYNDROMES.length} entries across {SYN_CATS.length} categories. Click a chip to filter by patient context, or open a card to see the regimen.
        </p>
        <div aria-hidden style={{
          height:1, marginTop:28,
          background:"linear-gradient(90deg, transparent, var(--neon-cyan, var(--ox)) 30%, var(--electric-blue, var(--ox)) 50%, var(--hot-magenta, var(--ox)) 70%, transparent)",
          opacity:0.5,
        }} />
      </header>

      {/* ---- B2 · executable regimen builder ---- */}
      <div className="rx-builder" style={{ marginBottom: 32 }}>
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
        <div className="rx-builder-risks" style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:8 }}>
          <span className="rx-builder-rlab">Host risks</span>
          {[["mrsaRisk","MRSA"],["pseudoRisk","Pseudomonas"],["esblRisk","ESBL / R-GNR"],["severe","Severe / shock"]].map(([k,lab]) => {
            const on = !!ctx[k];
            return (
              <button
                key={k}
                className="rx-cta-glow"
                aria-pressed={on}
                onClick={()=>setCtxField(k, !ctx[k])}
                style={{
                  display:"inline-flex", alignItems:"center", gap:5,
                  padding:"6px 14px",
                  fontFamily:"var(--mono)", fontSize:11, fontWeight:700,
                  letterSpacing:".06em", textTransform:"uppercase",
                  color: on ? "#fff" : "var(--ink2)",
                  background: on ? "var(--neon-cyan, var(--ox))" : "var(--panel)",
                  border: `1px solid ${on ? "var(--neon-cyan, var(--ox))" : "var(--line)"}`,
                  borderRadius: 999, cursor:"pointer",
                  boxShadow: on
                    ? "var(--shadow-e1), var(--neon-cyan-glow, none)"
                    : "var(--shadow-e0)",
                  transition: "transform var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out)",
                }}
              >
                {on ? <Check size={11}/> : <Plus size={11}/>} {lab}
              </button>
            );
          })}
        </div>
        <button className="rx-builder-go" onClick={()=>handleAssemble(selSyn)}><Crosshair size={14}/> Assemble regimen</button>
      </div>

      {/* ---- W7-B · category filter chips (delicate, gradient-active) ---- */}
      <div
        className="rx-mxbar"
        style={{
          display:"flex", flexWrap:"wrap", gap:8,
          marginBottom: 32,
        }}
      >
        {cats.map(c => {
          const active = synCat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSynCat(c.id)}
              aria-pressed={active}
              style={{
                display:"inline-flex", alignItems:"center", gap:6,
                padding:"5px 12px",
                fontFamily:"var(--mono)", fontSize:11, fontWeight:600,
                letterSpacing:".08em", textTransform:"uppercase",
                color: active ? "var(--ink)" : "var(--ink2)",
                background: active ? "var(--panel)" : "transparent",
                border: `1px solid ${active ? "var(--electric-blue, var(--ox))" : "var(--line)"}`,
                borderRadius: 999, cursor:"pointer",
                boxShadow: active ? "var(--shadow-e1), var(--electric-blue-glow, none)" : "none",
                opacity: active ? 1 : 0.78,
                transition: "all var(--duration-fast) var(--ease-out)",
              }}
            >
              {c.label}
              <span style={{
                fontFamily:"var(--mono)", fontSize:10,
                color: active ? "var(--electric-blue, var(--ox))" : "var(--ink2)",
                opacity: active ? 1 : 0.7,
                marginLeft: 2,
              }}>{catCount(c.id)}</span>
            </button>
          );
        })}
      </div>

      {SYN_CATS.filter(c => synCat === "all" || c.id === synCat).map(cat => {
        const items = list.filter(s => s.cat === cat.id);
        if (!items.length) return null;
        const CI = CAT_ICONS[cat.icon] || Stethoscope;
        return (
          <div key={cat.id} style={{ marginBottom: 36 }}>
            {/* category section header — mono kicker with icon, tighter than h2 */}
            <div
              className="rx-syscat"
              style={{
                display:"flex", alignItems:"center", gap:8,
                fontFamily:"var(--mono)", fontSize:11, fontWeight:700,
                letterSpacing:".18em", textTransform:"uppercase",
                color:"var(--ink2)", margin:"0 0 16px",
              }}
            >
              <span
                className="ic"
                style={{
                  display:"inline-flex", alignItems:"center", justifyContent:"center",
                  width:22, height:22, borderRadius:6,
                  background:"linear-gradient(135deg, var(--neon-cyan-soft, var(--line3)), transparent)",
                  color:"var(--electric-blue, var(--ox))",
                }}
              >
                <CI size={13}/>
              </span>
              {cat.label}
              <span style={{
                marginLeft: 4, color:"var(--ink2)", opacity:0.55, fontWeight:500,
              }}>{items.length}</span>
            </div>

            {/* card grid — generous gap, asymmetric radii, hover lift */}
            <div style={{
              display:"grid", gap:24,
              gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",
            }}>
              {items.map(s => {
                const open = openSyn === s.id;
                const SI = SYN_ICON[s.icon] || Stethoscope;
                const highVol = isHighVolume(s);
                return (
                  <article
                    className="rx-acc rx-lift"
                    data-open={open}
                    key={s.id}
                    style={{
                      background:"var(--panel)",
                      border:"1px solid var(--line)",
                      borderTopLeftRadius:16, borderTopRightRadius:4,
                      borderBottomLeftRadius:4, borderBottomRightRadius:16,
                      boxShadow: open ? "var(--shadow-e3)" : "var(--shadow-e1)",
                      position:"relative", overflow:"hidden",
                      transition:"transform var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)",
                      // grid items can default to min-width:auto which lets long
                      // content blow out the column; clamp to 0 so the card
                      // honors the grid track.
                      minWidth: 0,
                    }}
                  >
                    {/* gradient corner accent (top-left, decorative) */}
                    <div aria-hidden style={{
                      position:"absolute", top:0, left:0,
                      width:36, height:36,
                      background:"linear-gradient(135deg, var(--neon-cyan-soft, var(--ox-softer)), transparent 70%)",
                      borderTopLeftRadius:16,
                      pointerEvents:"none",
                    }} />
                    {/* faint accent on the opposite corner — mirrors the asymmetric radii */}
                    <div aria-hidden style={{
                      position:"absolute", bottom:0, right:0,
                      width:36, height:36,
                      background:"linear-gradient(315deg, var(--hot-magenta-soft, transparent), transparent 70%)",
                      borderBottomRightRadius:16,
                      pointerEvents:"none", opacity: 0.6,
                    }} />

                    <button
                      className="rx-accbtn"
                      onClick={() => setOpenSyn(open ? null : s.id)}
                      aria-expanded={open}
                      style={{
                        position:"relative",
                        padding:"20px 22px",
                        background:"transparent",
                        border:"none",
                        width:"100%",
                        textAlign:"left",
                        cursor:"pointer",
                      }}
                    >
                      <span
                        className="rx-accicon"
                        style={{
                          display:"inline-flex", alignItems:"center", justifyContent:"center",
                          width:28, height:28, borderRadius:8,
                          background:"linear-gradient(135deg, var(--electric-blue-soft, var(--ox-softer)), transparent)",
                          color:"var(--electric-blue, var(--ox))",
                        }}
                      >
                        <SI size={17}/>
                      </span>
                      <span className="rx-accmain" style={{ minWidth: 0 }}>
                        <span
                          className="rx-accname"
                          style={{
                            fontFamily:"var(--serif)",
                            fontSize:19, fontWeight:700,
                            letterSpacing:"-.012em",
                            color:"var(--ink)",
                            display:"inline-flex", alignItems:"center", gap:6,
                          }}
                        >
                          {s.name}
                          {highVol && (
                            <SparkleGlyph
                              size={11}
                              style={{ color:"var(--hot-magenta, var(--ox))", opacity:0.85 }}
                            />
                          )}
                        </span>
                        {open
                          ? <span className="rx-accline" style={{ lineHeight:1.55 }}>{s.line}</span>
                          : <span
                              className="rx-accprev"
                              style={{ lineHeight:1.55, color:"var(--ink2)" }}
                            >
                              <span className="k">{s.tiers[0].k}</span> {s.tiers[0].rx}
                            </span>}
                      </span>
                      <span className="rx-accchev"><ChevronRight size={18}/></span>
                    </button>
                    {open && (
                      <div
                        className="rx-accbody"
                        style={{ padding:"0 22px 22px", position:"relative" }}
                      >
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
                            <p className="rx-rx" style={{ lineHeight:1.55 }}>{renderRich(t.rx, openDrug)}</p>
                            <DoseAdjustBar rx={t.rx} ctx={ctx} d={d} onDrug={openDrug} synId={s.id} />
                            {t.note && <p className="rx-rxnote" style={{ lineHeight:1.55 }}>{renderGloss(t.note, openDrug)}</p>}
                          </div>
                        ))}

                        <div className="rx-coverrow">
                          <div className="rx-coverbox"><div className="h">Cover</div><div className="t" style={{ lineHeight:1.55 }}>{renderGloss(s.cover.empiric, openDrug)}</div></div>
                          <div className="rx-coverbox"><div className="h">Don't / instead</div><div className="t" style={{ lineHeight:1.55 }}>{renderGloss(s.cover.drop, openDrug)}</div></div>
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
                          <div className="t" style={{ lineHeight:1.55 }}>{renderGloss(s.deesc, openDrug)}</div>
                        </div>

                        <ul className="rx-pearls" style={{ lineHeight:1.55 }}>
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
                  </article>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

export { SyndromesSection };
