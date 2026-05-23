/* root · InpatientAbxGuide — composes every layer, injects styles, owns app state.
   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Activity, Stethoscope, LayoutGrid, Pill, Droplets, TrendingDown,
  Clock, AlertTriangle, BookOpen, Search, ChevronRight, Calculator,
  X, Info, ShieldCheck, FlaskConical, Microscope, Syringe,
  ListChecks, ArrowRight, Beaker, Wind, Bug, Bone,
  Brain, HeartPulse, Slice, Star, GitBranch, Crosshair,
  Layers, Network, ShieldAlert, Hospital, Scissors, CornerDownRight,
  Check, Plus, Zap, Soup, Flame,
  Filter, Eye, EyeOff, RotateCcw,
} from "lucide-react";
import { CSS, CSS2, CSS3, CSS4, CSS5 } from "./styles/app-styles";
import { PatientContextBar, DrugCard, OrgCard, RegimenCard, TrialCard, RapidDxTimeout, IVtoPO, MrsaCell, CmpCell, SpectrumCompare } from "./components/cards";
import { ClassChip, TermChip, renderRx, renderGloss, renderRich } from "./components/rich-text";
import { Num, Cite, Ev, BugTag, SectionDisc, Drawer, PDot, ToxDot, CardCopyButton, DoseAdjustBar, ChildPughScorer } from "./components/primitives";
import { BedsideShell } from "./components/BedsideShell";
import { penChips, allergyGuidance, interactionsForAgent, regimenInteractions, synEvidence, classData, glossData } from "./engines/clinical";
import { buildRegimen, regimenAgents, refineAgents, refineOptionGroups, refineRegimen, deescalationPlan } from "./engines/regimen";
import { _looseFind, drugLookup, orgLookup, _spxFor, drugCoversOrg, drugRoute } from "./engines/lookup";
import { checkIntegrity, integrityLine } from "./engines/integrity";
import { resolveDrug, computeDose, agentsInRx, adjustmentsForAgent, doseAdjustments, cockcroftGault, ckdEpi2021, weightDescriptors, childPughComponentPoints, childPugh, bandFor, deriveCtx } from "./engines/dosing";
import { SPECTRUM, SpectrumChartFull, SPX_ORGS, SPX_CLASSES, SPX_SCALE, SPX_ORG_BY, SPX_SG_BY, SPX_AGENTS } from "./spectrum/Spectrum";
import { RISK_KW } from "./data/risk-keywords";
import { CAT_ICONS, SYN_ICON, FORM_ICON, TREE_ICON, RDX_ICON, TABS } from "./data/ui-maps";
import { ALLERGY_INTRO, ALLERGY, SPECIAL_POP, PROPHYLAXIS, OPAT, SEPSIS_FLOW, TREES, RAPID_DX, TIMEOUT_ITEMS, IVPO_CRITERIA, PO_AGENTS, GLOSSARY, GLOSS_KEYS, GLOSS_TOKEN } from "./data/content";
import { GUIDELINES, REFS, EVOLVING, TRIAL_DETAIL, DURATIONS, DUR_MAX, DUR_REF, DUR_BY_DX, CLOCK, VERSION, REVIEWED } from "./data/evidence";
import { SYNDROMES, SYN_CATS, SRC_CONTROL, SYN_GUIDE, DIRECTED } from "./data/syndromes";
import { RENAL_DOSING, WEIGHT_DOSING, _wtKey, _wtLabel, HEPATIC_DOSING, HD_DOSING, DOSE_AGENTS, _ADJ_META, CP_COMPONENTS } from "./data/dosing";
import { FORMULARY, DRUG_NAMES, FORM_FLAT, DRUG_ALIASES, DRUG_CLASSES, RANK_LAB, CLASS_KEYS, RX_TOKEN, AGENT_RX, PEN_SITES, PEN, PEN_SITE_LABEL, TOX_COLS, SAFE, TOX_LABEL, RENAL_TRIGGERS, TDM, INTERACTIONS, DRUG_IX } from "./data/drugs";
import { ORGS, ORG_BY_ID, ORG_XWALK, ORG_DIR_HINT, MX_CLASSES, MX, LADDER, MECH, MRSA_MATRIX, MRSA_LEGEND, GNR_MATRIX, MRSA_CELL, CMP_ORGS, CMP_LVL } from "./data/organisms";
import { _normd, _coretok, _escRe, _gloWrap, slug, _cmpActive, _vancoIsEnteral, _agentMatchTokens } from "./lib/util";

export default function InpatientAbxGuide() {
  /* ---- 4.2 · shareable deep-state via URL hash (no browser storage) ----
     Encodes tab + open syndrome + patient context so a link reopens the exact
     view — e.g. #t=empiric&syn=hap&ctx=70:90:175:2.2:M:severe:hd reopens the HAP
     card with this patient loaded. Read once on init; written back on change.

     Phase 0 extension: the hash now also encodes case-state stub fields
     (cultures, day-of-therapy, start date) for forward-compat with Phases
     A–B. Old links remain valid — every new key is optional. */
  const _hashState = (() => {
    try {
      const h = new URLSearchParams((window.location.hash || "").replace(/^#/, ""));
      const out = {};
      const t = h.get("t");
      if(t && TABS.some(x => x.id === t)) out.tab = t;
      const syn = h.get("syn");
      if(syn && SYNDROMES.some(x => x.id === syn)) out.openSyn = syn;
      const c = h.get("ctx");
      if(c){
        const [age,wt,ht,scr,sex,hep,hd] = c.split(":");
        out.ctx = { age:+age||65, weightKg:+wt||80, heightCm:+ht||170, scr:+scr||1.0,
          sex: sex==="F"?"F":"M", hepatic:["none","moderate","severe"].includes(hep)?hep:"none",
          hd: hd==="hd", on:true };
      }
      const cul = h.get("cul");
      if(cul) out.cultures = cul === "pending" ? { status:"pending", organism:null } : { status:"back", organism:cul };
      const day = h.get("day");
      if(day && !Number.isNaN(+day)) out.dayOfTx = +day;
      const sd = h.get("sd");
      if(sd && /^\d{4}-\d{2}-\d{2}$/.test(sd)) out.startDate = sd;
      const cl = h.get("cl");   // clinical bitfield: 1=stable, 2=absorbing, 4=sourceControlled
      if(cl && !Number.isNaN(+cl)){
        const n = +cl;
        out.clinical = { stable:!!(n&1), absorbing:!!(n&2), sourceControlled:!!(n&4) };
      }
      return out;
    } catch(e){ return {}; }
  })();
  /* Phase 0.2 · bedside-mode flag — read from URL search params, not hash, so
     it is independent of the deep-state hash sync. Visiting `?bedside=1` mounts
     the Bedside shell stub; the default URL serves the classic 11-tab UI
     unchanged. The toggle in BedsideShell flips back to classic without a
     reload. Phase E flips the default to bedside and removes the flag. */
  const _modeFromUrl = (() => {
    try {
      const q = new URLSearchParams(window.location.search);
      return q.get("bedside") === "1" ? "bedside" : "classic";
    } catch(e){ return "classic"; }
  })();
  const [mode, setMode] = useState(_modeFromUrl);
  const [tab, setTab] = useState(_hashState.tab || "approach");
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQ, setCmdQ] = useState("");
  const [cmdIdx, setCmdIdx] = useState(0);
  const [openSyn, setOpenSyn] = useState(_hashState.openSyn || "sepsis");
  const [synCat, setSynCat] = useState("all");
  const [selSyn, setSelSyn] = useState(_hashState.openSyn || "sepsis");   // B2 regimen-builder selection
  const openRegimen = (id) => setDrawer({ kind:"regimen", key: id || selSyn });
  /* D4b · formulary filters */
  const [fmCover, setFmCover] = useState("");   // outer org id or ""
  const [fmRoute, setFmRoute] = useState("all"); // all | iv | po
  const [pickOrg, setPickOrg] = useState(null);
  const [pickDrug, setPickDrug] = useState(null);
  const [openOrg, setOpenOrg] = useState(null);
  /* ---- A2 · unified case state (Phase 0.1 · patient → caseState) ----
     The single source of truth for everything case-driven. Patient (the old
     `ctx`) is nested under `caseState.patient`; the remaining fields drive
     Phase A (Case Bar) and Phase B (Reassessment workflow):
       · syndrome     — id of the actively selected presentation, or null
       · cultures     — { status: "pending"|"back", organism: orgId|null }
       · clinical     — { stable, absorbing, sourceControlled } booleans
                        feeding the 48–72 h reassessment workflow
       · dayOfTx      — integer day of therapy, or null
       · startDate    — ISO yyyy-mm-dd string, or null
     The `ctx` / `setCtxField` / `setCpField` shims below preserve the exact
     API every downstream component and engine currently uses, so this rename
     ships with zero behavior change. */
  const [caseState, setCaseState] = useState({
    patient: {
      on:false, age:65, weightKg:80, heightCm:170, scr:1.0, sex:"M",
      mrsaRisk:false, pseudoRisk:false, esblRisk:false, severe:false, blAllergy:"none", // none|mild|severe
      hepatic:"none", hd:false, // hepatic: none|moderate|severe (Child-Pugh proxy); hd: intermittent hemodialysis
      cp:{ bili:"", alb:"", inr:"", ascites:"", enceph:"" }, // Child-Pugh scorer inputs (drives hepatic when complete)
      ..._hashState.ctx,
    },
    syndrome:  _hashState.openSyn || null,
    cultures:  _hashState.cultures || { status:"pending", organism:null },
    clinical:  _hashState.clinical || { stable:false, absorbing:false, sourceControlled:false },
    dayOfTx:   _hashState.dayOfTx ?? null,
    startDate: _hashState.startDate || null,
  });
  /* Compatibility shims — every existing reference to `ctx` and the two
     setters reads/writes `caseState.patient` transparently. Removing these
     in a later phase requires migrating every call site; for Phase 0 they
     are how we get zero-behavior-change. */
  const ctx = caseState.patient;
  const setCtx = (updater) => setCaseState(c => ({
    ...c,
    patient: typeof updater === "function" ? updater(c.patient) : updater,
  }));
  const setCtxField = (k, v) => setCaseState(c => ({ ...c, patient: { ...c.patient, [k]: v } }));
  // Set one Child-Pugh component and, when all five are present, auto-set the hepatic stage.
  const setCpField = (k, v) => setCaseState(c => {
    const cp = { ...c.patient.cp, [k]: v };
    const res = childPugh(cp);
    return res
      ? { ...c, patient: { ...c.patient, cp, hepatic:res.stage } }
      : { ...c, patient: { ...c.patient, cp } };
  });
  /* Knowledge-graph drawer (Phase B): { kind:"drug"|"org"|"trial", key } | null */
  const [drawer, setDrawer] = useState(null);
  const openDrug  = (name) => {
    // Dead-link guard (§3.2): only open a monograph when drugLookup resolves to
    // real content. An unresolved name is a no-op rather than an empty drawer —
    // every caller (rx chips, matrices, directed cells, compare) is protected here.
    const lk = drugLookup(name);
    if(!lk || !(lk.form || lk.spx || lk.pen || lk.tox)) return;
    setDrawer({ kind:"drug", key:name });
  };
  const openOrgDrawer = (id) => setDrawer({ kind:"org", key:id });
  const openTrial = (id)   => setDrawer({ kind:"trial", key:id });

  /* ---- command palette index ---- */
  const index = useMemo(() => {
    const items = [];
    TABS.forEach(t => items.push({ kind:"View", name:t.label, sub:"Section", icon:t.icon, go:() => setTab(t.id) }));
    SYNDROMES.forEach(s => items.push({ kind:"Empiric", name:s.name, sub:(SYN_CATS.find(c=>c.id===s.cat)||{}).label||"Syndrome", icon:(SYN_ICON[s.icon]||Stethoscope), go:() => { setTab("empiric"); setSynCat("all"); setOpenSyn(s.id); } }));
    FORMULARY.forEach(cl => cl.drugs.forEach(dr => items.push({ kind:"Drug", name:dr.name, sub:cl.cls, icon:Pill, go:() => setDrawer({ kind:"drug", key:dr.name }) })));
    ORGS.forEach(o => items.push({ kind:"Organism", name:o.label, sub:"Organism card", icon:Bug, go:() => setDrawer({ kind:"org", key:o.id }) }));
    DIRECTED.forEach(g => g.items.forEach(o => items.push({ kind:"Directed", name:o.org, sub:"Directed-therapy row", icon:Crosshair, go:() => { setTab("directed"); setOpenOrg(slug(o.org)); } })));
    return items;
  }, []);
  const cmdResults = useMemo(() => {
    const q = cmdQ.trim().toLowerCase();
    if (!q) return index.slice(0, 8);
    return index.filter(i => (i.name + " " + i.sub + " " + i.kind).toLowerCase().includes(q)).slice(0, 24);
  }, [cmdQ, index]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCmdOpen(o => !o); setCmdQ(""); setCmdIdx(0); }
      else if (e.key === "Escape") setCmdOpen(false);
      else if (cmdOpen && e.key === "ArrowDown") { e.preventDefault(); setCmdIdx(i => Math.min(i + 1, cmdResults.length - 1)); }
      else if (cmdOpen && e.key === "ArrowUp") { e.preventDefault(); setCmdIdx(i => Math.max(i - 1, 0)); }
      else if (cmdOpen && e.key === "Enter") { const r = cmdResults[cmdIdx]; if (r) { r.go(); setCmdOpen(false); } }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cmdOpen, cmdResults, cmdIdx]);

  /* ---- scroll the chosen organism into view on the Directed tab ---- */
  useEffect(() => {
    if (tab !== "directed" || !openOrg) return;
    const el = document.getElementById("dir-" + openOrg);
    if (!el) return;
    const reduce = typeof window !== "undefined" && window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  }, [tab, openOrg]);

  /* ---- referential-integrity self-check (author-time; console only) ----
     The check itself lives in engines/integrity.js so the exact same computation
     is a hard CI gate (tests/integrity.test.js). Here it runs once on mount and
     logs; invisible to end users. info() when clean, warn() on any drift. */
  useEffect(() => {
    const result = checkIntegrity();
    if (result.ok) console.info(integrityLine(result));
    else console.warn(integrityLine(result));
  }, []);

  /* ---- derived patient quantities: one transform, memoized ---- */
  const d = useMemo(() => deriveCtx(ctx), [ctx]);
  const crcl = d.crcl, crclBand = d.crclBand;

  /* 4.2 · write deep-state back to the URL hash (debounced via effect deps).
     Phase 0 extension: also encode the case-state stub fields (cultures,
     dayOfTx, startDate) when populated. The classic UI does not populate
     them, so default behavior emits the same hash as before. */
  useEffect(() => {
    try {
      const p = new URLSearchParams();
      if(tab && tab !== "approach") p.set("t", tab);
      if(tab === "empiric" && openSyn) p.set("syn", openSyn);
      if(ctx.on) p.set("ctx", [Math.round(+ctx.age)||"", Math.round(+ctx.weightKg)||"",
        Math.round(+ctx.heightCm)||"", ctx.scr, ctx.sex, ctx.hepatic, ctx.hd?"hd":"nohd"].join(":"));
      const cul = caseState.cultures;
      if(cul && cul.status === "back" && cul.organism) p.set("cul", cul.organism);
      if(caseState.dayOfTx != null) p.set("day", String(caseState.dayOfTx));
      if(caseState.startDate) p.set("sd", caseState.startDate);
      const cli = caseState.clinical;
      if(cli){
        const bits = (cli.stable?1:0) | (cli.absorbing?2:0) | (cli.sourceControlled?4:0);
        if(bits) p.set("cl", String(bits));
      }
      const next = p.toString();
      const cur = (window.location.hash || "").replace(/^#/, "");
      if(next !== cur) window.history.replaceState(null, "", next ? "#"+next : window.location.pathname + window.location.search);
    } catch(e){ /* hash sync is best-effort */ }
  }, [tab, openSyn, ctx, caseState.cultures, caseState.dayOfTx, caseState.startDate, caseState.clinical]);

  /* dose(name): renally-adjusted dose for THIS patient, or null when context is
     off / agent has no structured rule → caller renders the static string. */
  const dose = (name) => computeDose(name, { on: ctx.on, crcl: d.crcl });

  const go = (fn) => { fn(); setCmdOpen(false); };

  /* ============ TAB: APPROACH ============ */
  const renderApproach = () => (
    <>
      <h2 className="rx-h2">Principles of empiric antibacterial therapy</h2>
      <p className="rx-lede">Empiric therapy is a structured wager under uncertainty: cover the plausible pathogens broadly enough to be safe, then narrow that breadth as rapidly as the data permit. The reasoning sequence proceeds from site and host to spectrum — never the reverse.</p>
      <SectionDisc />

      <div className="rx-quick">
        <div className="rx-qc"><div className="k"><Zap size={13}/> A time-limited bridge</div><div className="b">In septic shock, deliver effective therapy within <b>one hour</b>. Empiric breadth is provisional — reassess against culture data at <b>48&ndash;72 hours</b> in every case.</div></div>
        <div className="rx-qc"><div className="k"><Crosshair size={13}/> Source determines all</div><div className="b">The probable organisms, the appropriate agent, and the treatment duration each follow from the <b>anatomic source</b>. An undrained focus is not salvaged by any antibiotic.</div></div>
        <div className="rx-qc"><div className="k"><TrendingDown size={13}/> De-escalation is standard</div><div className="b">Narrowing to the single most targeted agent does <b>not</b> compromise outcomes; it reduces resistance selection, toxicity, and <i>C. difficile</i> risk.</div></div>
      </div>

      <h3 className="rx-h3"><span className="ic"><ListChecks size={18}/></span>The empiric reasoning sequence</h3>
      <p className="rx-stepb" style={{margin:"0 0 16px"}}>Seven questions, addressed in order. Each constrains the next: the anatomic source predicts the flora, the flora and host define the spectrum, and the spectrum and site determine the agent and its dose.</p>
      <div className="rx-spine">
        {[
          ["Is this infection, and is it severe?","Distinguish infection from colonization and from non-infectious inflammation. Establish whether sepsis or septic shock is present, as this sets both the urgency and the required breadth. Obtain cultures before antibiotics whenever doing so will not delay therapy in shock."],
          ["What is the anatomic source?","The source predicts the likely flora and dictates the regimen. Commit to the most probable site and cover its characteristic pathogens; an unstated source is an unstated organism list."],
          ["What are the likely organisms?","From the source and host, enumerate the realistic pathogens. Cover what is plausible rather than everything conceivable. The spectrum matrix and syndrome cards make this explicit."],
          ["What are the host's resistance risks?","Prior resistant isolates, recent antimicrobial exposure or hospitalization, indwelling devices, immunosuppression, and relevant travel raise the empiric ceiling. The local antibiogram calibrates the remainder."],
          ["Which agent, and at what dose?","Select the narrowest agent that reliably covers the plausible pathogens. Dose for the site of infection (central nervous system, bone, deep focus) and for renal function, while giving a full first dose regardless of clearance."],
          ["When and how will therapy be narrowed?","Pre-commit to reassessment at 48\u201372 hours: culture data and clinical trajectory guide de-escalation to a single targeted agent, intravenous-to-oral conversion, and discontinuation of redundant coverage."],
          ["What is the duration and the stop date?","Establish an evidence-based duration at the outset. Most courses are shorter than traditional practice; document the stop date in the plan rather than deferring indefinitely."],
        ].map(([h,b],i) => (
          <div className="rx-step" key={i}>
            <div className="rx-stepnum rx-mono">{i+1}</div>
            <div className="rx-steph">{h}</div>
            <p className="rx-stepb">{b}</p>
          </div>
        ))}
      </div>

      <h3 className="rx-h3"><span className="ic"><Activity size={18}/></span>Sepsis and septic shock: the first-hour sequence</h3>
      <div className="rx-tflow" tabIndex={0} role="group" aria-label="Sepsis first-hour sequence (scrollable)">
        {SEPSIS_FLOW.map((s,i) => (
          <div className="rx-tflow-step" key={i}>
            <div className={"rx-tflow-box " + (s.kind || "")}>
              <div className="rx-tflow-lab rx-mono">{s.lab}</div>
              <div className="rx-tflow-tx">{s.tx}</div>
            </div>
            {i < SEPSIS_FLOW.length - 1 && <span className="rx-tflow-arrow"><ArrowRight size={18}/></span>}
          </div>
        ))}
      </div>

      <h3 className="rx-h3"><span className="ic"><GitBranch size={18}/></span>Indications to broaden or to withhold coverage</h3>
      <div className="rx-trig">
        <div className="rx-card rx-trigcard">
          <h4><span className="ic"><Plus size={15}/></span>Broaden coverage when</h4>
          <ul>
            <li><b>MRSA:</b> prior MRSA, purulent or device-associated source, severe sepsis, or high local prevalence &rarr; add vancomycin (linezolid for pulmonary infection).</li>
            <li><b>Pseudomonas:</b> neutropenia, structural lung disease, HAP/VAP, or recent broad-spectrum exposure &rarr; antipseudomonal &beta;-lactam.</li>
            <li><b>ESBL / resistant GNR:</b> prior isolate or high-prevalence exposure &rarr; empiric carbapenem.</li>
            <li><b>Septic shock:</b> the broadest defensible regimen with full loading doses within the hour.</li>
          </ul>
        </div>
        <div className="rx-card rx-trigcard">
          <h4><span className="ic"><Check size={15}/></span>Withhold or de-escalate when</h4>
          <ul>
            <li><b>No MRSA risk:</b> empiric vancomycin is not reflexive &mdash; it adds nephrotoxicity and an acute kidney injury signal alongside piperacillin-tazobactam.</li>
            <li><b>No Pseudomonas risk:</b> a narrower &beta;-lactam (ceftriaxone) suffices and spares antipseudomonal selection pressure.</li>
            <li><b>Cultures returned:</b> narrow to the single most targeted active agent at 48&ndash;72 hours.</li>
            <li><b>Stable and absorbing:</b> convert intravenous to oral therapy and set the stop date.</li>
          </ul>
        </div>
      </div>

      <h3 className="rx-h3"><span className="ic"><Layers size={18}/></span>Core decision algorithms</h3>
      <p className="rx-stepb" style={{margin:"0 0 12px"}}>Four high-frequency decisions, each reducible to a single pivotal branch. Use the summary below for rapid reference; the full algorithm follows.</p>
      <div className="rx-algindex">
        {TREES.map(tree => {
          const TI = TREE_ICON[tree.icon] || GitBranch;
          return (
            <a key={tree.id} href={"#alg-" + tree.id} className="rx-algchip"
               onClick={(e)=>{ e.preventDefault(); const el=document.getElementById("alg-"+tree.id); if(el) el.scrollIntoView({behavior:"smooth", block:"start"}); }}>
              <span className="rx-algchip-ic"><TI size={15}/></span>
              <span className="rx-algchip-tx"><span className="t">{tree.title}</span><span className="d">{tree.pivot}</span></span>
            </a>
          );
        })}
      </div>
      {TREES.map(tree => {
        const TI = TREE_ICON[tree.icon] || GitBranch;
        return (
          <div key={tree.id} id={"alg-" + tree.id} style={{margin:"0 0 18px", scrollMarginTop:"16px"}}>
            <h4 className="rx-h4"><span className="ic"><TI size={15}/></span>{tree.title}</h4>
            <p className="rx-stepb" style={{margin:"0 0 10px"}}>{tree.intro}</p>
            <div className="rx-tree">
              {tree.nodes.map((node,ni) => (
                <div className="rx-tnode" key={ni}>
                  <div className="rx-tq"><span className="dot rx-mono">{ni+1}</span><span className="q">{node.q}</span></div>
                  <div className="rx-tbranches">
                    {node.branches.map((br,bi) => (
                      <div className="rx-tbranch" key={bi}>
                        <span className="rx-tcond"><CornerDownRight size={12}/> {br.cond}</span>
                        <div className="rx-trx">{br.rx}</div>
                        <div className="rx-twhy">{br.why}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <RapidDxTimeout onCite={(id)=>openTrial(id)} />
    </>
  );

  /* ============ TAB: EMPIRIC ============ */
  const renderEmpiric = () => {
    const cats = [{ id:"all", label:"All" }].concat(SYN_CATS);
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
          <button className="rx-builder-go" onClick={()=>openRegimen(selSyn)}><Crosshair size={14}/> Assemble regimen</button>
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
                          {s.bugs.map(b => <BugTag key={b} id={b} onClick={(id)=>openOrgDrawer(id)} />)}
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

                        <div className="rx-cardfoot">
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
  };

  /* ============ TAB: DIRECTED ============ */
  const renderDirected = () => (
    <>
      <h2 className="rx-h2">Directed therapy: organism in hand</h2>
      <p className="rx-lede">Once the Gram stain, culture, or rapid molecular result identifies the organism, selection narrows to the most targeted effective agent. Each row gives the first-line choice, the principal alternative, and the caveat that most often alters management.</p>
      <div className="rx-callout"><Info size={15}/><span>Definitive therapy is almost always narrower than the empiric regimen. The resistant-Gram-negative rows follow IDSA guidance <Cite id="amrgn" onClick={(cid)=>openTrial(cid)} />; confirm the carbapenemase type for CRE &mdash; it changes the agent.</span></div>

      <div style={{overflowX:"auto"}}>
        <table className="rx-dirtable">
          <thead><tr><th>Organism</th><th>First choice</th><th>Alternative</th><th>Caveat that matters</th></tr></thead>
          <tbody>
            {DIRECTED.map(g => (
              <React.Fragment key={g.grp}>
                <tr className="rx-dirgrp"><td colSpan={4}>{g.grp}</td></tr>
                {g.items.map((o,i) => (
                  <tr key={i} id={"dir-"+slug(o.org)} className={openOrg===slug(o.org)?"rx-dirhi":""}>
                    <td className="tddorg" data-l="Organism"><span className="rx-dirorg">{o.org}<span className="sub">{o.sub}</span></span></td>
                    <td data-l="First choice" className="rx-dirfirst">{renderRich(o.first, openDrug)}</td>
                    <td data-l="Alternative" className="rx-diralt">{renderGloss(o.alt, openDrug)}</td>
                    <td data-l="Caveat" className="rx-dircav">{renderGloss(o.cav, openDrug)}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="rx-h3"><span className="ic"><Crosshair size={18}/></span>MRSA agent selection by site</h3>
      <p className="rx-lede" style={{marginBottom:10}}>Choosing among the anti-MRSA agents is a site decision before it is a susceptibility decision — the body compartment rules out agents the antibiogram would still call &ldquo;susceptible.&rdquo;</p>
      <div style={{overflowX:"auto"}}>
        <table className="rx-mxtable">
          <thead>
            <tr><th className="rx-mx-ag">Agent</th>{MRSA_MATRIX.cols.map(c => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {MRSA_MATRIX.rows.map(r => (
              <tr key={r.ag}>
                <td className="rx-mx-ag"><button className="rx-fname-link" onClick={()=>openDrug(r.ag)} title="Open the drug monograph">{r.ag.split(" / ")[0]}</button></td>
                {r.c.map((v,i) => <td key={i} className="rx-mx-c"><MrsaCell v={v} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rx-mxlegend">
        {MRSA_LEGEND.map(l => <span key={l.k} className="rx-mxleg-item"><MrsaCell v={l.k} /> {l.t}</span>)}
      </div>
      <ul className="rx-mxnotes">
        {MRSA_MATRIX.rows.map(r => <li key={r.ag}><b>{r.ag.split(" / ")[0]}:</b> {renderGloss(r.note, openDrug)}</li>)}
      </ul>

      <h3 className="rx-h3"><span className="ic"><Network size={18}/></span>Gram-negative backbone by resistance mechanism</h3>
      <p className="rx-lede" style={{marginBottom:10}}>Match the agent to the carbapenemase or resistance mechanism, not the MIC alone <Cite id="amrgn" onClick={(cid)=>openTrial(cid)} />. Confirm the mechanism before committing a reserve agent.</p>
      <div style={{overflowX:"auto"}}>
        <table className="rx-gnrtable">
          <thead><tr><th>Mechanism</th><th>First-line</th><th>Alternative</th><th>Caveat that matters</th></tr></thead>
          <tbody>
            {GNR_MATRIX.map((r,i) => (
              <tr key={i}>
                <td data-l="Mechanism"><span className="rx-gnr-m">{renderGloss(r.m, openDrug)}</span></td>
                <td data-l="First-line" className="rx-gnr-first">{renderGloss(r.first, openDrug)}</td>
                <td data-l="Alternative" className="rx-gnr-alt">{renderGloss(r.alt, openDrug)}</td>
                <td data-l="Caveat" className="rx-gnr-cav">{renderGloss(r.cav, openDrug)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  /* ============ TAB: REFERENCE ============ */
  const renderReference = () => {
    const selOrg = pickOrg, selDrug = pickDrug;
    const selHint = selOrg ? ("Showing activity against " + (ORG_BY_ID[selOrg]||{}).label + " — ★ marks a drug of choice.")
      : selDrug ? ("Showing the spectrum of " + selDrug + ".") : "";
    const _fmMatch = (dr) => {
      if (fmRoute === "iv" && !/iv/i.test(drugRoute(dr.name))) return false;
      if (fmRoute === "po" && !/po/i.test(drugRoute(dr.name))) return false;
      if (fmCover && !drugCoversOrg(dr.name, fmCover)) return false;
      return true;
    };
    const fmClasses = FORMULARY.map(cl => ({ ...cl, drugs: cl.drugs.filter(_fmMatch) })).filter(cl => cl.drugs.length);
    const fmTotal = fmClasses.reduce((n, cl) => n + cl.drugs.length, 0);
    const fmActive = fmRoute !== "all" || !!fmCover;
    return (
      <>
        <h2 className="rx-h2">Reference</h2>
        <p className="rx-lede">The spectrum matrix, the formulary, the β-lactamase resistance ladder, and the allergy cross-reactivity map — the look-up layer beneath the syndrome and organism views.</p>

        <h3 className="rx-h3"><span className="ic"><LayoutGrid size={18}/></span>Spectrum of activity</h3>
        <div className="rx-card" style={{display:"flex",gap:"14px",alignItems:"flex-start"}}>
          <div className="rx-accicon" style={{flex:"0 0 auto"}}><Microscope size={18}/></div>
          <div style={{minWidth:0}}>
            <div style={{fontWeight:700,fontSize:"14.5px",marginBottom:"3px"}}>
              The full spectrum chart now lives in the <button className="rx-tag t-ox clk" onClick={()=>setTab("spectrum")}>Spectrum tab</button>
            </div>
            <p style={{margin:0,fontSize:"12.5px",color:"var(--ink2)",lineHeight:1.55}}>
              {selHint
                ? selHint + " Open the Spectrum tab to see the full 49-agent \u00d7 49-organism map."
                : "The compact grid here has been replaced by a 49-agent \u00d7 49-organism interactive matrix that separates intrinsic from acquired resistance, marks drugs of choice, and carries the MIC / breakpoint / antibiogram primer."}
            </p>
            {(selOrg || selDrug) && (
              <button className="rx-resetbtn" style={{marginLeft:0,marginTop:"10px"}} onClick={()=>{setPickOrg(null);setPickDrug(null);}}><X size={13}/> Clear selection</button>
            )}
          </div>
        </div>

        <h3 className="rx-h3"><span className="ic"><Pill size={18}/></span>Formulary</h3>
        {ctx.on && <p className="rx-fnote-ctx"><Activity size={13}/> Doses below are adjusted for the active patient (CrCl <Num>{d.crcl ?? "—"}</Num> mL/min). Standard dose shown struck through where it changes.</p>}

        <div className="rx-fmbar">
          <span className="rx-fmbar-lab"><Filter size={13}/> Filter</span>
          <label className="rx-fmbar-field">
            <span>Covers</span>
            <select value={fmCover} onChange={e=>setFmCover(e.target.value)}>
              <option value="">Any organism</option>
              {ORGS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </label>
          <div className="rx-fmbar-seg" role="group" aria-label="Route">
            {[["all","All"],["iv","IV"],["po","PO"]].map(([k,lab]) => (
              <button key={k} aria-pressed={fmRoute===k} className={fmRoute===k?"on":""} onClick={()=>setFmRoute(k)}>{lab}</button>
            ))}
          </div>
          <span className="rx-fmbar-count"><Num>{fmTotal}</Num> of <Num>{FORM_FLAT.length}</Num> agents</span>
          {fmActive && <button className="rx-resetbtn" onClick={()=>{ setFmCover(""); setFmRoute("all"); }}><RotateCcw size={13}/> Clear</button>}
        </div>
        {fmCover && <p className="rx-fmbar-note">Showing agents with first- or second-line activity against <b>{(ORG_BY_ID[fmCover]||{}).label}</b> (derived from the spectrum matrix). Confirm against the local antibiogram.</p>}

        {fmTotal === 0
          ? <p className="rx-dc-muted" style={{padding:"8px 2px"}}>No formulary agent matches these filters. <button className="rx-dc-druglink" onClick={()=>{ setFmCover(""); setFmRoute("all"); }}>Clear filters</button>.</p>
          : fmClasses.map(cl => {
          const FI = FORM_ICON[cl.icon] || Pill;
          return (
            <div key={cl.cls}>
              <div className="rx-classhdr"><span className="ic"><FI size={15}/></span>{cl.cls}</div>
              <table className="rx-ftable">
                <thead><tr><th>Agent</th><th>Typical adult IV dose</th><th>Renal</th><th>Decision-changing pearl</th></tr></thead>
                <tbody>
                  {cl.drugs.map(dr => {
                    const adj = dose(dr.name);
                    return (
                    <tr key={dr.name}>
                      <td className="tdname" data-l="Agent">
                        <button className="rx-fname rx-fname-link" onClick={()=>openDrug(dr.name)} title="Open the drug monograph">{dr.name}</button>
                        <div className="rx-fspec">{dr.spec}</div>
                      </td>
                      <td data-l="Dose">
                        {adj && adj.kind === "band" && adj.changed ? (
                          <span className="rx-fdose-wrap">
                            <span className="rx-fdose rx-fdose-adj"><Num>{adj.adjusted}</Num></span>
                            <s className="rx-fdose-was"><Num>{adj.normal}</Num></s>
                            {adj.note && <span className="rx-fdose-note">{adj.note}</span>}
                          </span>
                        ) : adj && adj.kind === "band" && !adj.changed ? (
                          <span className="rx-fdose-wrap"><span className="rx-fdose"><Num>{dr.dose}</Num></span><span className="rx-fdose-tag rx-tag-ok">unchanged at CrCl {crcl}</span></span>
                        ) : adj && adj.kind === "level" ? (
                          <span className="rx-fdose-wrap"><span className="rx-fdose">{adj.adjusted}</span>{adj.note && <span className="rx-fdose-note">{adj.note}</span>}</span>
                        ) : (
                          <span className="rx-fdose"><Num>{dr.dose}</Num></span>
                        )}
                      </td>
                      <td data-l="Renal"><span className="rx-frenal">{dr.renal}</span></td>
                      <td data-l="Pearl"><span className="rx-fpearl">{dr.pearl}</span></td>
                    </tr>
                  );})}
                </tbody>
              </table>
            </div>
          );
        })}

        <h3 className="rx-h3"><span className="ic"><Network size={18}/></span>The β-lactamase resistance ladder</h3>
        <p className="rx-lede" style={{marginBottom:6}}>Gram-negative resistance reads as a ladder of enzymes. Each rung defeats the agents below it and demands a specific escape — the organizing logic behind the resistant-GNR rows in Directed therapy.</p>
        <div className="rx-rung" style={{gridTemplateColumns:"1fr",marginBottom:6}}>
          <div className="rx-rung-grad" />
        </div>
        <div className="rx-ladder">
          {LADDER.map(r => (
            <div className="rx-rung" key={r.n}>
              <div className="rx-rung-rail"><div className="rx-rung-dot rx-mono">{r.n}</div><div className="rx-rung-line" /></div>
              <div className="rx-rung-body">
                <div className="rx-rung-name">{r.name} <span className="rx-rung-mech">{r.mech}</span></div>
                <div className="rx-rung-intensity" style={{["--w"]:r.intensity+"%"}} />
                <div className="rx-rung-detail">{r.detail}</div>
                <div className="rx-rung-agents">
                  {r.survive.map((a,ai) => <span key={ai} className="rx-tag t-ox">{a}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3 className="rx-h3"><span className="ic"><ShieldCheck size={18}/></span>β-lactam allergy cross-reactivity</h3>
        <div className="rx-callout"><Info size={15}/><span>{ALLERGY_INTRO}</span></div>
        <table className="rx-allergy">
          <thead><tr><th>Agent</th><th>Cross-reactivity</th><th>Shared structure / practical note</th></tr></thead>
          <tbody>
            {ALLERGY.map((a,i) => {
              const m = { hi:["xr-hi","xrd-hi","Higher"], lo:["xr-lo","xrd-lo","Low"], none:["xr-none","xrd-none","Negligible"] }[a.xreact];
              return (
                <tr key={i}>
                  <td><b>{a.a}</b></td>
                  <td><span className={"rx-xreact "+m[0]}><span className={"rx-xdot "+m[1]}/>{m[2]}</span><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{a.shares}</div></td>
                  <td>{a.note}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

      <h3 className="rx-h3"><span className="ic"><ShieldCheck size={18}/></span>Penicillin-allergy delabeling &mdash; reclaiming first-line &beta;-lactams</h3>
      <p className="rx-lede" style={{maxWidth:"82ch"}}>
        Roughly 10% of inpatients carry a penicillin-allergy label, yet <b>~90&ndash;95% are not truly allergic</b> &mdash;
        most have lost any IgE response over time or never had one. The label drives second-line agents, more
        vancomycin and fluoroquinolones, more <i>C. difficile</i>, and worse outcomes. Risk-stratify every label; the
        cross-reactivity map above shows that true penicillin&ndash;cephalosporin overlap is low (~1&ndash;2%) and is driven by
        <b> R1 side-chain similarity</b>, not the shared &beta;-lactam ring.
      </p>
      <div className="rx-tree" style={{marginTop:"4px"}}>
        <div className="rx-tier alt">
          <div className="rx-tierlab">Low-risk / unverified history</div>
          <div className="rx-rx">Proceed &mdash; use the indicated &beta;-lactam (cephalosporin); consider <b>direct oral amoxicillin challenge</b> to delabel</div>
          <div className="rx-rxnote">Isolated GI intolerance, remote/vague reaction, family history only, &ldquo;unknown,&rdquo; or non-allergic symptoms. Cefazolin&rsquo;s unique side chain makes it safe in nearly all penicillin allergy.</div>
        </div>
        <div className="rx-tier">
          <div className="rx-tierlab">Moderate-risk (benign IgE-suggestive)</div>
          <div className="rx-rx">Graded challenge (test dose) &mdash; or refer for penicillin skin testing</div>
          <div className="rx-rxnote">Remote urticaria or a reaction whose features are unclear. A two-step graded challenge under observation is reasonable; an unrelated-side-chain cephalosporin can usually be given directly.</div>
        </div>
        <div className="rx-tier sev">
          <div className="rx-tierlab">High-risk &mdash; do NOT challenge</div>
          <div className="rx-rx">Avoid the culprit and side-chain&ndash;related agents; ID/allergy referral</div>
          <div className="rx-rxnote">Anaphylaxis or recent severe IgE reaction &rarr; avoid and test before any re-exposure. <b>Severe cutaneous adverse reactions</b> (SJS/TEN, DRESS, AGEP), drug-induced hemolytic anemia, serum sickness, or organ involvement are an <b>absolute contraindication</b> to re-exposure &mdash; never challenge.</div>
        </div>
      </div>
      <div className="rx-callout"><Info size={15}/><span>Practical defaults: a documented penicillin allergy almost never precludes <b>cefazolin</b> (surgical prophylaxis, MSSA) or an unrelated-side-chain cephalosporin/carbapenem; <b>aztreonam</b> is safe in severe penicillin allergy (but shares a side chain with ceftazidime). Delabeling the low-risk majority is one of the highest-yield stewardship acts on the wards.</span></div>

      </>
    );
  };

  /* ============ TAB: DOSE ============ */
  const renderDose = () => (
    <>
      <h2 className="rx-h2">Dosing, renal adjustment & monitoring</h2>
      <p className="rx-lede">Correct dosing is as consequential as correct drug selection. Estimate clearance, identify which agents track renal function, and apply the rules that override the calculator: the loading dose, the site of infection, and body habitus.</p>

      <div className="rx-calc">
        <div className="rx-card">
          <h4 className="rx-h4"><span className="ic"><Calculator size={15}/></span>Patient &amp; clearance</h4>
          <div className="rx-field2">
            <div className="rx-field">
              <label>Age <span className="rx-mono" style={{color:"var(--muted)"}}>years</span></label>
              <input type="number" value={ctx.age} onChange={e=>setCtxField("age", e.target.value)} min="1" max="120"
                aria-invalid={d.errors.includes("age")} />
            </div>
            <div className="rx-field">
              <label>Sex</label>
              <div className="rx-seg">
                <button aria-pressed={ctx.sex==="M"} onClick={()=>setCtxField("sex","M")}>Male</button>
                <button aria-pressed={ctx.sex==="F"} onClick={()=>setCtxField("sex","F")}>Female</button>
              </div>
            </div>
          </div>
          <div className="rx-field2">
            <div className="rx-field">
              <label>Weight <span className="rx-mono" style={{color:"var(--muted)"}}>kg</span></label>
              <input type="number" value={ctx.weightKg} onChange={e=>setCtxField("weightKg", e.target.value)} min="1" max="400"
                aria-invalid={d.errors.includes("weight")} />
            </div>
            <div className="rx-field">
              <label>Height <span className="rx-mono" style={{color:"var(--muted)"}}>cm</span></label>
              <input type="number" value={ctx.heightCm} onChange={e=>setCtxField("heightCm", e.target.value)} min="120" max="220"
                aria-invalid={d.errors.includes("height")} />
            </div>
          </div>
          <div className="rx-field">
            <label>Serum creatinine <span className="rx-mono" style={{color:"var(--muted)"}}>mg/dL</span></label>
            <input type="number" step="0.1" value={ctx.scr} onChange={e=>setCtxField("scr", e.target.value)} min="0.1" max="25"
              aria-invalid={d.errors.includes("creatinine") || d.errors.includes("crcl-implausible")} />
          </div>
          <div className="rx-field2">
            <div className="rx-field">
              <label>Hepatic function <span className="rx-mono" style={{color:"var(--muted)"}}>Child-Pugh</span></label>
              <div className="rx-seg rx-seg-3">
                <button aria-pressed={ctx.hepatic==="none"} onClick={()=>setCtxField("hepatic","none")}>A / Normal</button>
                <button aria-pressed={ctx.hepatic==="moderate"} onClick={()=>setCtxField("hepatic","moderate")}>CP-B</button>
                <button aria-pressed={ctx.hepatic==="severe"} onClick={()=>setCtxField("hepatic","severe")}>CP-C</button>
              </div>
            </div>
            <div className="rx-field">
              <label>Renal replacement</label>
              <div className="rx-seg">
                <button aria-pressed={!ctx.hd} onClick={()=>setCtxField("hd", false)}>None</button>
                <button aria-pressed={ctx.hd} onClick={()=>setCtxField("hd", true)}>Intermittent HD</button>
              </div>
            </div>
          </div>
          <ChildPughScorer cp={ctx.cp} onField={setCpField} hepatic={ctx.hepatic} />
          <button className={"rx-ctxtoggle" + (ctx.on ? " on" : "")} aria-pressed={ctx.on}
            onClick={()=>setCtxField("on", !ctx.on)} disabled={!d.valid && !ctx.on}>
            {ctx.on ? <><Check size={15}/> Context applied — doses adjusted across the guide</>
                    : <><Activity size={15}/> Apply as patient context</>}
          </button>
          <p className="rx-fieldnote">When applied, the formulary shows <i>this</i> patient&rsquo;s renally-adjusted dose with the standard dose struck through, the bar above stays visible across tabs, and the empiric selector prefills host-resistance risks.</p>
        </div>
        <div>
          <div className="rx-result">
            <div className="num rx-num">{d.crcl==null ? "—" : d.crcl}</div>
            <div className="unit">mL/min · Cockcroft-Gault <span style={{opacity:.7}}>(the dosing standard)</span></div>
            {crclBand && <div className="band"><span style={{width:8,height:8,borderRadius:"50%",background:crclBand.c,display:"inline-block"}}/>{crclBand.t}</div>}
            <div className="eq">CrCl = (140 − age) × wt / (72 × SCr){ctx.sex==="F" ? " × 0.85" : ""}</div>
            {d.ckd != null && (
              <div className="rx-result-sub">
                CKD-EPI 2021 (race-free): <Num>{d.ckd}</Num> mL/min/1.73m²
                {d.discordant && <span className="disc"> · diverges from C-G at this habitus — dose by C-G, but flag</span>}
              </div>
            )}
          </div>

          {d.errors.length > 0 && (
            <div className="rx-disc" style={{marginTop:14}}>
              <AlertTriangle size={16}/>
              <span><b>Check inputs.</b> {(() => {
                const lbl = { age:"age (1–120 y)", weight:"weight (1–400 kg)", creatinine:"serum creatinine (0.1–25 mg/dL)", height:"height (90–250 cm)", "crcl-implausible":"this creatinine yields an implausible clearance (>250 mL/min) — recheck the value or use a minimum SCr of 0.8–1.0 in low-muscle-mass patients" };
                return d.errors.map(e => lbl[e] || e).join("; ");
              })()}. No clearance is shown until inputs are physiologically plausible.</span>
            </div>
          )}

          {d.arc && (
            <div className="rx-callout rx-callout-amber" style={{marginTop:14}}>
              <Zap size={16}/>
              <span><b>Augmented renal clearance (CrCl &gt; 130).</b> Standard doses may <b>under</b>-expose — consider extended or continuous β-lactam infusion and level-guided dosing. This is the young-trauma / hyperdynamic-sepsis underdosing trap that fixed renal tables never surface.</span>
            </div>
          )}

          {d.wt && (
            <div className="rx-card rx-wtcard" style={{marginTop:14}}>
              <div className="rx-wt-head">Body-weight descriptors</div>
              <div className="rx-wt-grid">
                <div className="rx-wt-cell"><span className="k">TBW</span><span className="v"><Num>{Math.round(d.wt.tbw)}</Num> kg</span></div>
                <div className="rx-wt-cell"><span className="k">IBW</span><span className="v"><Num>{Math.round(d.wt.ibw)}</Num> kg</span></div>
                <div className="rx-wt-cell"><span className="k">AdjBW</span><span className="v"><Num>{Math.round(d.wt.adjbw)}</Num> kg</span></div>
              </div>
              <p className="rx-wt-rule">
                Dose <b>vancomycin loading on actual (TBW)</b>; <b>aminoglycosides on adjusted (AdjBW)</b> when TBW exceeds IBW.
                {d.wt.tbw < d.wt.ibw && <> Here TBW is below IBW — dose by <b>actual</b> weight.</>}
              </p>
              {d.vanco && (
                <div className="rx-wt-vanco">
                  <div>Vancomycin load 20–25 mg/kg × actual = <Num>{d.vanco.lo}</Num>–<Num>{d.vanco.hi}</Num> mg{d.vanco.hi >= 3000 && " (capped ~3 g)"}.</div>
                  <div style={{marginTop:5}}>
                    {d.vanco.byLevels
                      ? <>Maintenance <b>by levels</b> — {ctx.hd ? "dose after each dialysis session; " : "CrCl too low or unavailable for a population estimate; "}target AUC 400–600 with pharmacy.</>
                      : <>Maintenance estimate <b>{d.vanco.mLo}–{d.vanco.mHi} mg {d.vanco.interval}</b> (15–20 mg/kg{d.vanco.capped && ", per-dose ~2 g cap"}) targeting AUC 400–600.{d.vanco.arc && <> ARC — expect higher requirement; sample early.</>}</>}
                  </div>
                  <div className="rx-wt-vanco-note">Population starting estimate, not a substitute for level-guided (Bayesian or two-level) AUC dosing. Confirm with pharmacy and adjust to levels.</div>
                </div>
              )}
              {d.amino && (
                <div className="rx-wt-vanco" style={{background:"var(--green-soft)", borderColor:"var(--green-line)", color:"var(--green)"}}>
                  <div>Gentamicin / tobramycin extended-interval 7 mg/kg × {d.amino.wtBasis} = <Num>{d.amino.dose}</Num> mg
                    {d.amino.byLevels
                      ? <>, then <b>by levels</b>{ctx.hd ? " (redose by pre-dialysis level)" : " (CrCl too low for a fixed interval)"}.</>
                      : <> <b>{d.amino.interval}</b>.</>}</div>
                  <div className="rx-wt-vanco-note" style={{borderTopColor:"var(--green-line)"}}>Extended-interval estimate (concentration-dependent killing). Confirm with a nomogram-timed level; avoid in evolving AKI. Use synergy dosing — not this — for enterococcal/staphylococcal endocarditis.</div>
                </div>
              )}
            </div>
          )}

          <div className="rx-callout" style={{marginTop:14}}><Info size={15}/><span>Cockcroft-Gault is the <b>dosing</b> reference (it is what drug labels were validated against), not an eGFR for staging CKD. CKD-EPI is shown alongside for staging; when the two diverge at weight or age extremes, dose by C-G but flag it. In unstable AKI no steady-state estimate is reliable — dose conservatively and monitor.</span></div>
        </div>
      </div>

      <h3 className="rx-h3"><span className="ic"><TrendingDown size={18}/></span>Which agents track renal function</h3>
      <div className="rx-card" style={{padding:0,overflow:"hidden"}}>
        <table className="rx-rentable">
          <thead><tr><th>Agent</th><th>Adjustment principle</th></tr></thead>
          <tbody>{RENAL_TRIGGERS.map((r,i)=>(<tr key={i}><td style={{fontWeight:600,whiteSpace:"nowrap"}}>{r[0]}</td><td>{r[1]}</td></tr>))}</tbody>
        </table>
      </div>
      <div className="rx-callout"><AlertTriangle size={15}/><span><b>The first dose is a full dose.</b> Loading doses are driven by volume of distribution, not clearance — never reduce or skip the first (loading) dose for renal impairment. Adjust the <i>maintenance</i> doses that follow.</span></div>

      <h3 className="rx-h3"><span className="ic"><FlaskConical size={18}/></span>Therapeutic drug monitoring</h3>
      <div className="rx-2col">
        {TDM.map((t,i)=>(
          <div className="rx-card" key={i}>
            <div style={{fontWeight:700,fontSize:14}}>{t.d}</div>
            <div className="rx-mono" style={{fontSize:12,color:"var(--ox)",margin:"3px 0 7px"}}>{t.t}</div>
            <div style={{fontSize:13,color:"var(--ink2)",lineHeight:1.5}}>{t.note}</div>
          </div>
        ))}
      </div>

      <h3 className="rx-h3"><span className="ic"><Info size={18}/></span>When the calculator is not enough</h3>
      <div className="rx-2col">
        {SPECIAL_POP.map((s,i)=>(
          <div className="rx-card rx-mini" key={i}>
            <h4><span className="ic"><Info size={15}/></span>{s.h}</h4>
            <ul>{s.pts.map((p,pi)=><li key={pi}>{p}</li>)}</ul>
          </div>
        ))}
      </div>
    </>
  );

  /* ============ TAB: COURSE ============ */
  const renderCourse = () => (
    <>
      <h2 className="rx-h2">Duration, de-escalation, and step-down</h2>
      <p className="rx-lede">Evidence-based courses are shorter than traditional practice, with most durations now defined by randomized trials. Fix the duration at the outset, start the clock at the appropriate moment, and convert to oral therapy once the criteria are met.</p>

      <h3 className="rx-h3"><span className="ic"><Clock size={18}/></span>Evidence-based durations</h3>
      <div className="rx-card" style={{padding:0,overflow:"hidden"}}>
        <table className="rx-durtable">
          <thead><tr><th>Indication</th><th style={{width:170}}>Course</th><th>Days</th><th>Evidence</th></tr></thead>
          <tbody>
            {DURATIONS.map(g => (
              <React.Fragment key={g.group}>
                <tr className="rx-durgroup"><td colSpan={4}>{g.group}</td></tr>
                {g.rows.map((r,i)=>(
                  <tr key={i}>
                    <td><div style={{fontWeight:600}}>{r.dx}</div>{r.ext && <div className="rx-durext">{r.ext}</div>}</td>
                    <td>
                      <div className="rx-barwrap" title={r.days + " days"}>
                        <div className="rx-barbase" style={{width:Math.min(100,(r.base/DUR_MAX)*100)+"%"}} />
                        {r.max>r.base && <div className="rx-barext" style={{left:(r.base/DUR_MAX)*100+"%",width:((r.max-r.base)/DUR_MAX)*100+"%"}} />}
                      </div>
                    </td>
                    <td><span className="rx-durdays">{r.days}</span></td>
                    <td><Ev kind={r.ev} />{r.trial && <div style={{fontSize:10,color:"var(--muted)",fontFamily:"var(--mono)",marginTop:3}}>{r.trial}</div>}{(DUR_BY_DX[r.dx]||{}).ref && <div style={{marginTop:4}}><Cite id={DUR_BY_DX[r.dx].ref} onClick={(cid)=>openTrial(cid)} /></div>}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rx-2col" style={{marginTop:18}}>
        <div className="rx-card rx-mini">
          <h4><span className="ic"><Clock size={15}/></span>Start the clock correctly</h4>
          <ul>{CLOCK.map((c,i)=><li key={i}><b>{c[0]}:</b> {c[1]}</li>)}</ul>
        </div>
        <IVtoPO onDrug={openDrug} />
      </div>

      <h3 className="rx-h3"><span className="ic"><TrendingDown size={18}/></span>De-escalation discipline</h3>
      <div className="rx-card rx-mini">
        <ul>
          <li><b>Reassess at 48–72 h in every patient.</b> Cultures and clinical trajectory drive the narrowing decision at a scheduled review.</li>
          <li><b>Narrow to one targeted agent.</b> De-escalation does not worsen outcomes and reduces resistance, C. difficile, and toxicity.</li>
          <li><b>Stop redundant coverage.</b> Drop empiric vancomycin at 48 h if MRSA is not isolated; collapse double Gram-negative coverage to a single active agent.</li>
          <li><b>Source control takes precedence over spectrum.</b> Apparent failure most often reflects an undrained focus rather than a resistant organism — re-image before escalating.</li>
          <li><b>Procalcitonin can support stopping</b> in respiratory infection and sepsis, but never gates starting therapy.</li>
        </ul>
      </div>

      <h3 className="rx-h3"><span className="ic"><Hospital size={18}/></span>Outpatient parenteral antimicrobial therapy</h3>
      <p className="rx-lede" style={{marginBottom:10}}>{OPAT.intro}</p>
      <div className="rx-2col">
        <div className="rx-card rx-mini">
          <h4><span className="ic"><Check size={15}/></span>Candidate criteria</h4>
          <ul>{OPAT.criteria.map((c,i)=><li key={i}>{c}</li>)}</ul>
        </div>
        <div className="rx-card" style={{padding:0,overflow:"hidden"}}>
          <table className="rx-rentable">
            <thead><tr><th>Agent</th><th>OPAT role</th></tr></thead>
            <tbody>{OPAT.agents.map((a,i)=>(<tr key={i}><td style={{fontWeight:600,whiteSpace:"nowrap"}}>{a[0]}</td><td>{a[1]}</td></tr>))}</tbody>
          </table>
        </div>
      </div>
      <div className="rx-callout"><Info size={15}/><span>{OPAT.oral}</span></div>

      <h3 className="rx-h3"><span className="ic"><ArrowRight size={18}/></span>Intravenous-to-oral conversion: bioavailability as the determinant</h3>
      <p className="rx-lede" style={{maxWidth:"82ch"}}>
        The instinct to keep a stable patient on IV antibiotics is rarely justified. Several oral agents achieve
        serum levels indistinguishable from IV; for these, switching once the patient is improving shortens length of
        stay, removes line risk, and does not compromise cure &mdash; trials such as <b>POET</b> (endocarditis) and
        <b>OVIVA</b> (bone &amp; joint) extended early oral therapy even into deep-seated infection. The agent&rsquo;s
        oral bioavailability, not the severity label, decides whether the switch is sound.
      </p>
      <div className="rx-card" style={{padding:0,overflow:"hidden"}}>
        <table className="rx-rentable">
          <thead><tr><th>Agent</th><th>Oral F</th><th>IV : PO</th><th>Note</th></tr></thead>
          <tbody>
            <tr><td style={{fontWeight:600}}>Levofloxacin / moxifloxacin</td><td className="rx-mono">~99%</td><td className="rx-mono">1 : 1</td><td>Essentially complete &mdash; switch is seamless.</td></tr>
            <tr><td style={{fontWeight:600}}>Ciprofloxacin</td><td className="rx-mono">~70%</td><td className="rx-mono">400 IV &asymp; 500&ndash;750 PO</td><td>Separate from di-/trivalent cations by 2&ndash;4 h.</td></tr>
            <tr><td style={{fontWeight:600}}>Linezolid</td><td className="rx-mono">~100%</td><td className="rx-mono">1 : 1</td><td>No advantage to IV once tolerating enteral.</td></tr>
            <tr><td style={{fontWeight:600}}>Metronidazole</td><td className="rx-mono">~100%</td><td className="rx-mono">1 : 1</td><td>Reserve IV for the patient who cannot take oral.</td></tr>
            <tr><td style={{fontWeight:600}}>TMP-SMX</td><td className="rx-mono">~90&ndash;100%</td><td className="rx-mono">1 : 1</td><td>Same exposure orally; watch K&#8314; and creatinine.</td></tr>
            <tr><td style={{fontWeight:600}}>Doxycycline</td><td className="rx-mono">~90&ndash;100%</td><td className="rx-mono">1 : 1</td><td>Take with water, sit upright (esophagitis).</td></tr>
            <tr><td style={{fontWeight:600}}>Fluconazole (cross-ref)</td><td className="rx-mono">~90%</td><td className="rx-mono">1 : 1</td><td>Antifungal &mdash; same principle; see the antifungal reference.</td></tr>
            <tr><td style={{fontWeight:600}}>Clindamycin</td><td className="rx-mono">~90%</td><td className="rx-mono">~1 : 1</td><td>Reliable oral step-down for soft-tissue/toxin indications.</td></tr>
            <tr><td style={{fontWeight:600}}>Azithromycin</td><td className="rx-mono">~37%</td><td className="rx-mono">1 : 1</td><td>Low serum but tissue/intracellular driven &mdash; dosed 1:1 by design.</td></tr>
            <tr><td style={{fontWeight:600}}>Rifampin</td><td className="rx-mono">high</td><td className="rx-mono">1 : 1</td><td>Adjunct only; take on an empty stomach.</td></tr>
            <tr><td style={{fontWeight:600}}>&beta;-lactams (amoxicillin, cephalexin, cefuroxime/cefpodoxime)</td><td className="rx-mono">~50&ndash;90%</td><td className="rx-mono">dose up</td><td>Lower/variable F &mdash; adequate for step-down in stable patients to complete a course, not for the unstable.</td></tr>
          </tbody>
        </table>
      </div>
      <div className="rx-2col" style={{marginTop:"14px"}}>
        <div className="rx-mini">
          <h4><span className="ic"><Check size={16}/></span>Switch when all are true</h4>
          <ul>
            <li>Hemodynamically <b>stable and improving</b>; afebrile &asymp;24&ndash;48 h.</li>
            <li><b>Functioning, absorbing GI tract</b> and able to take oral.</li>
            <li>An oral agent with <b>adequate bioavailability and spectrum</b> for the pathogen.</li>
            <li><b>Source controlled</b> (drained/debrided) where applicable.</li>
          </ul>
        </div>
        <div className="rx-mini">
          <h4><span className="ic"><AlertTriangle size={16}/></span>Keep IV (or individualize) for</h4>
          <ul>
            <li>Endovascular infection, <b>CNS infection</b>, and undrained deep collections (unless an OVIVA/POET-type oral strategy is deliberately chosen with ID).</li>
            <li>Malabsorption, ileus, vomiting, or unreliable enteral access.</li>
            <li>No oral option with adequate F against the organism (e.g., most Pseudomonas outside the fluoroquinolones).</li>
          </ul>
        </div>
      </div>

    </>
  );

  /* ============ TAB: ADJUNCTS & EVIDENCE ============ */
  const renderAdjuncts = () => (
    <>
      <h2 className="rx-h2">Adjuncts & evidence</h2>
      <p className="rx-lede">Surgical prophylaxis (prevention, not treatment), the explicit scope boundary of this reference, and the primary sources behind every recommendation.</p>

      <h3 className="rx-h3"><span className="ic"><Scissors size={18}/></span>Surgical antimicrobial prophylaxis</h3>
      <p className="rx-lede" style={{marginBottom:10}}>{PROPHYLAXIS.intro}</p>
      <div className="rx-2col" style={{marginBottom:16}}>
        <div className="rx-card rx-mini">
          <h4><span className="ic"><ListChecks size={15}/></span>Principles</h4>
          <ul>{PROPHYLAXIS.principles.map((p,i)=><li key={i}><b>{p[0]}:</b> {p[1]}</li>)}</ul>
        </div>
        <div className="rx-card" style={{padding:0,overflow:"hidden"}}>
          <table className="rx-rentable">
            <thead><tr><th>Procedure</th><th>Agent</th></tr></thead>
            <tbody>{PROPHYLAXIS.table.map((r,i)=>(<tr key={i}><td style={{fontWeight:600}}>{r[0]}</td><td>{r[1]}</td></tr>))}</tbody>
          </table>
        </div>
      </div>

      <h3 className="rx-h3"><span className="ic"><Layers size={18}/></span>Scope of this reference</h3>
      <div className="rx-2col">
        <div className="rx-card rx-mini">
          <h4><span className="ic"><Check size={15}/></span>In scope</h4>
          <ul>
            <li>Adult, hospital-based <b>antibacterial</b> selection, dosing, and duration</li>
            <li>Empiric and directed therapy across {SYNDROMES.length} inpatient syndromes</li>
            <li>Resistant Gram-negative strategy (IDSA 2024) and the resistance ladder</li>
            <li>Surgical prophylaxis and OPAT as the bordering blur outward</li>
          </ul>
        </div>
        <div className="rx-card rx-mini">
          <h4><span className="ic"><X size={15}/></span>Deliberately out of scope</h4>
          <ul>
            <li><b>Antifungals</b> (candidemia, invasive mold, PJP) — a separate reference</li>
            <li><b>Antivirals</b> (HSV, CMV, influenza, hepatitis, HIV) — a separate reference</li>
            <li>Antimycobacterial and antiparasitic therapy</li>
            <li>Pediatric and neonatal dosing; pregnancy-specific regimens</li>
          </ul>
        </div>
      </div>
      <div className="rx-callout"><Info size={15}/><span>Where a regimen above references an antifungal (empiric candidemia coverage in sepsis, neutropenic enterocolitis, persistent febrile neutropenia), the pointer is intentional — the agent and dose live in the antifungal reference.</span></div>

      <h3 className="rx-h3"><span className="ic"><TrendingDown size={18}/></span>What&rsquo;s changing</h3>
      <p className="rx-lede" style={{marginBottom:10}}>Fronts where the evidence is actively moving — flagged so the guidance above is read with its half-life in mind.</p>
      <div className="rx-evolve">
        {EVOLVING.map((e,i)=>(
          <div className="rx-evcard" key={i}>
            <div className="evh">{e.h}{e.ref && <Cite id={e.ref} onClick={(cid)=>openTrial(cid)} />}</div>
            <p className="evb">{e.b}</p>
            <span className="evdir">{e.dir}</span>
          </div>
        ))}
      </div>

      <h3 className="rx-h3"><span className="ic"><BookOpen size={18}/></span>Primary sources</h3>
      <div className="rx-card" style={{padding:"4px 4px"}}>
        <table className="rx-reftable">
          <tbody>
            {REFS.map((r,i)=>(
              <tr key={i} className="rx-refrow" tabIndex={0} role="button"
                onClick={()=>openTrial(r.id)}
                onKeyDown={e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); openTrial(r.id); } }}
                title="Open the evidence card">
                <td style={{width:130}}><span className="rx-reftag">{r.tag}</span></td>
                <td><div style={{fontWeight:600,fontSize:13}}>{r.t}</div><div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>{r.src}</div></td>
                <td className="rx-refchev"><ChevronRight size={15}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="rx-h3"><span className="ic"><Plus size={18}/></span>Combination therapy: established synergy versus unsupported use</h3>
      <p className="rx-lede" style={{maxWidth:"82ch"}}>
        Adding a second agent is justified by a specific mechanism &mdash; documented synergy, guaranteeing one active
        drug against a resistant organism before susceptibilities return, or toxin suppression. Continued reflexively
        after the culture is back, it adds toxicity, cost, <i>C. difficile</i>, and resistance pressure without benefit.
      </p>
      <div className="rx-2col">
        <div className="rx-mini">
          <h4><span className="ic"><Check size={16}/></span>Where combination is supported</h4>
          <ul>
            <li><b>Enterococcal endocarditis</b> &mdash; ampicillin + ceftriaxone (E. faecalis) or ampicillin + gentamicin: documented bactericidal synergy.</li>
            <li><b>Empiric severe / neutropenic Pseudomonas</b> &mdash; two antipseudomonals empirically to raise the odds of one active agent, then <b>de-escalate to monotherapy</b> once susceptible.</li>
            <li><b>Necrotizing GAS / toxic shock</b> &mdash; &beta;-lactam + clindamycin for toxin suppression (Eagle effect).</li>
            <li><b>Prosthetic-material staph</b> (PJI, PVE, hardware) &mdash; add <b>rifampin</b> for biofilm (never alone).</li>
            <li><b>MBL-producing CRE</b> &mdash; ceftazidime-avibactam + aztreonam; selected MDR-GNR combinations.</li>
          </ul>
        </div>
        <div className="rx-mini">
          <h4><span className="ic"><X size={16}/></span>Where combination is not supported</h4>
          <ul>
            <li><b>Double Gram-negative coverage continued after susceptibilities</b> &mdash; no outcome benefit once one active agent is confirmed; de-escalate.</li>
            <li><b>&beta;-lactam + aminoglycoside &ldquo;synergy&rdquo; for Gram-negative bacteremia</b> &mdash; no mortality benefit, more nephrotoxicity.</li>
            <li><b>Redundant anaerobic cover</b> &mdash; metronidazole added to a carbapenem or piperacillin-tazobactam that already covers anaerobes.</li>
            <li><b>Empiric vancomycin continued</b> without MRSA evidence; &ldquo;broader is better&rdquo; as a reflex.</li>
          </ul>
        </div>
      </div>
      <div className="rx-callout"><TrendingDown size={15}/><span>The discipline is symmetrical with empiric breadth: start broad enough to be safe, then <b>de-escalate to the narrowest single agent the susceptibilities allow</b> &mdash; combination therapy earns its place only by a named mechanism, not by anxiety.</span></div>

    </>
  );


  const renderSpectrum = () => (
    <div>
      <h2 className="rx-h2">Spectrum of activity</h2>
      <p className="rx-lede">
        A 49-agent &times; 49-organism map of <i>expected</i> activity &mdash; the intrinsic and typical
        phenotype of each organism against each agent, drawn from EUCAST expected-resistant-phenotype
        tables, IDSA 2024 AMR guidance, and primary spectrum data. Fill fraction encodes the magnitude of
        activity and, critically, separates <b>intrinsic</b> resistance (a structural or enzymatic wall that no
        susceptibility report will breach) from <b>acquired</b> resistance and ordinary spectrum gaps. Hover to
        cross-highlight a drug&times;bug pair; click to lock focus. The gold star marks a drug of choice, not
        merely activity. This is a reasoning and teaching aid &mdash; not a substitute for the isolate&rsquo;s own
        susceptibilities or your local antibiogram.
      </p>

      <SpectrumCompare onDrug={(n)=>openDrug(n)} />

      <SpectrumChartFull />

      <h3 className="rx-h3"><span className="ic"><FlaskConical size={18} /></span>From spectrum to susceptibility &mdash; reading the data that drives the choice</h3>
      <p className="rx-lede" style={{maxWidth:"82ch"}}>
        The chart above is a population statement: what an agent <i>should</i> do against a typical member of a
        species. The decision at the bedside is governed by two further layers &mdash; the isolate&rsquo;s measured
        MIC interpreted against a breakpoint, and the local antibiogram that tells you how often that interpretation
        holds in your hospital. Spectrum, MIC, and antibiogram are three different questions; conflating them is a
        common source of error.
      </p>

      <div className="rx-2col">
        <div className="rx-mini">
          <h4><span className="ic"><Layers size={16} /></span>The minimum inhibitory concentration</h4>
          <ul>
            <li>The <b>MIC</b> is the lowest concentration (&micro;g/mL) that suppresses visible growth in vitro &mdash; a potency measurement, not a probability of cure. It is meaningful only relative to the <b>breakpoint</b>.</li>
            <li>A breakpoint is set by integrating the MIC distribution (the wild-type cutoff, ECOFF), achievable drug exposure (PK/PD target attainment at the labeled dose), and clinical outcome data. <b>Lower MIC does not mean &ldquo;better drug&rdquo;</b> across agents &mdash; only within the same agent against the same bug.</li>
            <li>Comparing MICs <i>between</i> drugs is meaningless: a vancomycin MIC of 1 and a ceftriaxone MIC of 1 are not equivalent. Always read MIC against that agent&rsquo;s breakpoint.</li>
          </ul>
        </div>
        <div className="rx-mini">
          <h4><span className="ic"><Info size={16} /></span>Susceptibility categories: S, I, SDD, and R</h4>
          <ul>
            <li><b>S (susceptible):</b> likely to respond at the standard dose.</li>
            <li><b>SDD (susceptible-dose-dependent):</b> success requires a dosing regimen that maximizes exposure (e.g., cefepime for Enterobacterales, levofloxacin) &mdash; an explicit instruction to push the dose, not a hedge.</li>
            <li><b>I (susceptible, increased exposure):</b> CLSI/EUCAST have redefined &ldquo;I&rdquo; to mean the agent works <i>if</i> exposure is high (high dose, or a site that concentrates drug such as urine) &mdash; it is no longer &ldquo;intermediate / borderline.&rdquo;</li>
            <li><b>R (resistant):</b> unlikely to respond at any achievable dose.</li>
          </ul>
        </div>
      </div>

      <div className="rx-callout">
        <Info size={16} />
        <span>
          <b>CLSI vs EUCAST.</b> US labs report CLSI breakpoints; much of Europe uses EUCAST. They differ for several
          agents (notably the antipseudomonal &beta;-lactams and some Enterobacterales), so a single MIC can read S
          under one system and I/R under the other. Breakpoints are also revised downward over time &mdash; older
          &ldquo;susceptible&rdquo; cefepime/piperacillin-tazobactam results predating the revisions can mislead.
          Know which system your lab uses and its revision date.
        </span>
      </div>

      <h4 className="rx-h4"><span className="ic"><AlertTriangle size={15} /></span>&ldquo;Susceptible in vitro&rdquo; is not always &ldquo;use it&rdquo;</h4>
      <table className="rx-allergy" style={{marginTop:"6px"}}>
        <thead><tr><th style={{width:"24%"}}>Trap</th><th style={{width:"38%"}}>What the lab may report</th><th>Why it can still fail</th></tr></thead>
        <tbody>
          <tr>
            <td><b>ESBL + piperacillin-tazobactam</b></td>
            <td>Often tests susceptible</td>
            <td><b>MERINO</b> showed piperacillin-tazobactam inferior to meropenem for ESBL bacteremia despite in-vitro susceptibility. Use a carbapenem for serious ESBL infection regardless of the S.</td>
          </tr>
          <tr>
            <td><b>AmpC inducers + 3rd-gen cephalosporin</b></td>
            <td>Initial S to ceftriaxone</td>
            <td>Enterobacter, Serratia, Citrobacter, K. aerogenes can <b>derepress AmpC on therapy</b> and emerge resistant. IDSA 2024 prefers cefepime (moderate-risk) or a carbapenem &mdash; treat by mechanism, not the first report.</td>
          </tr>
          <tr>
            <td><b>Inoculum effect</b></td>
            <td>S at standard inoculum</td>
            <td>At the high bacterial burden of an abscess, endocarditis vegetation, or undrained collection, MIC rises sharply (classic for cefazolin vs some MSSA, &beta;-lactams vs ESBL). <b>Source control</b> matters as much as the antibiogram.</td>
          </tr>
          <tr>
            <td><b>Heteroresistance</b></td>
            <td>S on routine testing</td>
            <td>A resistant subpopulation below the limit of detection (e.g., colistin, some &beta;-lactams vs CRE) can be selected on therapy. Suspect it when a &ldquo;susceptible&rdquo; agent fails clinically.</td>
          </tr>
          <tr>
            <td><b>Site mismatch</b></td>
            <td>S systemically</td>
            <td>Susceptibility assumes the drug reaches the site. Daptomycin is S vs S. pneumoniae but inactivated in lung; moxifloxacin is S vs E. coli but never concentrates in urine; first-generation cephalosporins do not enter CSF. See the Penetration tab.</td>
          </tr>
        </tbody>
      </table>

      <h4 className="rx-h4"><span className="ic"><Activity size={15} /></span>Reading the antibiogram &mdash; how local data recalibrates every empiric choice</h4>
      <ul className="rx-pearls">
        <li>The cumulative antibiogram reports <b>%S</b> for each bug&times;drug pair over a year at your institution. It is the bridge from the population spectrum above to <i>your</i> patients. A drug that is &ldquo;reliable&rdquo; on the chart but runs 65&ndash;75% S locally is not empiric monotherapy.</li>
        <li><b>The &ge;80&ndash;90% rule:</b> for empiric monotherapy of a serious infection, choose an agent with roughly &ge;80&ndash;90% local susceptibility against the likely pathogen; below that, add coverage or pick another agent until cultures return.</li>
        <li>Antibiograms are <b>unit- and source-specific</b>: ICU and urine isolates resist more than ward and blood isolates. Use the syndrome-appropriate stratum (a urinary antibiogram for cystitis, not the hospital-wide composite) where available.</li>
        <li>They report only the <b>first isolate per patient</b> and exclude duplicates, so they understate resistance in chronically colonized or device patients &mdash; weight the individual&rsquo;s prior cultures heavily.</li>
        <li><b>Combination antibiograms</b> (the added %S from a second agent) justify empiric double Gram-negative coverage where single-agent %S is inadequate, and identify when a second drug adds nothing.</li>
      </ul>
      <div className="rx-callout">
        <Crosshair size={16} />
        <span>
          Bottom line: read the chart for <i>what is possible</i>, the breakpoint-interpreted MIC for <i>what this isolate is</i>,
          and the local antibiogram for <i>how often you can trust it empirically</i> &mdash; then de-escalate to the
          narrowest agent the susceptibilities allow.
        </span>
      </div>
    </div>
  );


  const renderPenetration = () => (
    <div>
      <h2 className="rx-h2">Tissue penetration &amp; PK/PD</h2>
      <p className="rx-lede">
        Spectrum answers <i>can the drug kill this organism;</i> penetration and PK/PD answer <i>can it do so at the
        site, at this dose.</i> A susceptible report is necessary but not sufficient &mdash; daptomycin is inactivated
        in the lung, moxifloxacin never reaches urine, first-generation cephalosporins do not enter CSF, and
        aminoglycosides fail in the abscess they were prescribed for. The matrix below is expected adult penetration
        at usual systemic doses into an infected (inflamed) site; the cards translate the three killing patterns into
        the appropriate dosing strategy.
      </p>

      <div className="rx-mtxwrap">
        <table className="rx-mtx">
          <thead>
            <tr>
              <th className="corner"><div className="cl">Agent &nbsp;&middot;&nbsp; site &rarr;</div></th>
              {PEN_SITES.map(s => (
                <th key={s.k}><div className="rx-mtx-colh">{s.label}{s.sub?" \u00b7 "+s.sub:""}</div></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PEN.map((r,i) => r.band ? (
              <tr key={"b"+i} className="band"><td colSpan={PEN_SITES.length+1}>{r.band}</td></tr>
            ) : (
              <tr key={r.ag}>
                <td className="lab">{r.ag}{r.sub ? <small>{r.sub}</small> : null}</td>
                {PEN_SITES.map(s => (
                  <td key={s.k} className="rx-cell2"><PDot lv={r.c[s.k]} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rx-mtxleg">
        <span className="li"><span className="rx-dot d-good" /> Good / reliable</span>
        <span className="li"><span className="rx-dot d-mod" /> Moderate / dose-dependent</span>
        <span className="li"><span className="rx-dot d-poor" /> Poor / inadequate</span>
        <span className="li"><span className="rx-dot d-var" /> Variable</span>
        <span className="li"><span className="rx-dot d-na" /> Not applicable</span>
      </div>
      <p className="rx-mxnote" style={{fontSize:"12px",color:"var(--muted)",lineHeight:1.6,marginTop:"12px"}}>
        Hover any cell for the qualitative grade. &ldquo;CNS&rdquo; assumes meningeal inflammation and meningitis dosing;
        many agents that read &ldquo;good&rdquo; there are inadequate without inflammation. Penetration is necessary but
        not sufficient &mdash; abscesses still require drainage, and undrained foci defeat even well-penetrating agents.
      </p>

      <h3 className="rx-h3"><span className="ic"><Activity size={18} /></span>Three patterns of bacterial killing and their dosing implications</h3>
      <p className="rx-lede" style={{maxWidth:"82ch"}}>
        Every antibacterial maximizes one of three PK/PD indices. Knowing which one tells you whether to chase a high
        peak, a long time above MIC, or a large daily exposure &mdash; and whether the &ldquo;obvious&rdquo; dosing change helps
        or wastes drug.
      </p>
      <div className="rx-axis">
        <div className="rx-axiscard">
          <div className="ax-k">Concentration-dependent</div>
          <div className="ax-t">Chase the peak</div>
          <div className="ax-pd">target: Cmax/MIC &amp; AUC/MIC</div>
          <ul>
            <li><b>Aminoglycosides</b> &mdash; once-daily / extended-interval dosing maximizes Cmax/MIC and exploits the post-antibiotic effect while limiting time-dependent nephro-/ototoxicity.</li>
            <li><b>Fluoroquinolones</b> &mdash; AUC/MIC &asymp;125 (Gram-negative), &asymp;30&ndash;40 (pneumococcus); a true once-daily class.</li>
            <li><b>Daptomycin, polymyxins, metronidazole</b> &mdash; also peak/AUC-driven.</li>
            <li>A prolonged <b>post-antibiotic effect</b> is what makes interval dosing safe.</li>
          </ul>
        </div>
        <div className="rx-axiscard">
          <div className="ax-k">Time-dependent</div>
          <div className="ax-t">Stay above MIC</div>
          <div className="ax-pd">target: %fT&gt;MIC</div>
          <ul>
            <li><b>&beta;-lactams</b> &mdash; efficacy tracks the fraction of the interval free drug exceeds the MIC: penicillins &asymp;50%, cephalosporins &asymp;60&ndash;70%, carbapenems &asymp;40%.</li>
            <li><b>Extended (3&ndash;4 h) or continuous infusion</b> of cefepime, piperacillin-tazobactam, and meropenem raises %fT&gt;MIC for high-MIC organisms and the critically ill &mdash; more effective than a larger bolus.</li>
            <li>Little post-antibiotic effect against Gram-negatives &mdash; missed/late doses matter.</li>
          </ul>
        </div>
        <div className="rx-axiscard">
          <div className="ax-k">AUC-dependent</div>
          <div className="ax-t">Total daily exposure</div>
          <div className="ax-pd">target: 24-h AUC/MIC</div>
          <ul>
            <li><b>Vancomycin</b> &mdash; AUC/MIC <b>400&ndash;600</b> (2020 ASHP/IDSA): dose to AUC, not trough; a <b>loading dose</b> (25&ndash;30 mg/kg) reaches target faster in serious MRSA disease.</li>
            <li><b>Linezolid, tetracyclines, azithromycin, clindamycin</b> &mdash; time-dependent with prolonged post-antibiotic effect, so total AUC governs.</li>
            <li>Loading doses also apply to colistin and (functionally) to extended-infusion &beta;-lactams in sepsis where the volume of distribution is expanded.</li>
          </ul>
        </div>
      </div>
      <div className="rx-callout">
        <Info size={16} />
        <span>
          Two corollaries the matrix cannot show: in the <b>expanded volume of distribution</b> of sepsis, standard doses
          under-expose &mdash; loading doses and, for &beta;-lactams, prolonged infusions matter most exactly when the patient
          is sickest; and <b>source control</b> (drainage, device removal, debridement) changes the PK/PD problem more than
          any dose adjustment, because it collapses the bacterial inoculum the drug must cover.
        </span>
      </div>
    </div>
  );


  const renderMechanisms = () => (
    <div>
      <h2 className="rx-h2">Mechanism &amp; resistance map</h2>
      <p className="rx-lede">
        Every class attacks one molecular target; resistance is the organism&rsquo;s counter-move against that exact
        target. Pairing the two explains cross-resistance (why MLS<sub>B</sub> links macrolides, clindamycin, and
        streptogramins), why a single rpoB mutation defeats rifampin monotherapy, and why glycylcyclines were built to
        outflank classic tetracycline efflux. It also fixes the cidal&ndash;static distinction that governs agent choice in
        endocarditis, meningitis, and neutropenia.
      </p>

      <table className="rx-ftable" style={{marginTop:"6px"}}>
        <thead>
          <tr>
            <th style={{width:"22%"}}>Class</th>
            <th style={{width:"30%"}}>Molecular target &amp; action</th>
            <th style={{width:"10%"}}>Kill</th>
            <th>Principal resistance escape</th>
          </tr>
        </thead>
        <tbody>
          {MECH.map((r,i) => r.band ? (
            <tr key={"b"+i} className="rx-dirgrp"><td colSpan={4}>{r.band}</td></tr>
          ) : (
            <tr key={r.cls}>
              <td data-l="Class" className="tdname"><span className="rx-fname">{r.cls}</span></td>
              <td data-l="Target">{r.tgt}{r.hook ? <div className="rx-fpearl" style={{marginTop:"4px"}}>{r.hook}</div> : null}</td>
              <td data-l="Kill"><span className={"rx-tag "+(r.kill.indexOf("cidal")===0?"t-ox":"t-neutral")}>{r.kill}</span></td>
              <td data-l="Resistance"><span className="rx-frenal">{r.res}</span></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="rx-h3"><span className="ic"><ShieldAlert size={18} /></span>Mechanisms of resistance: four routes of escape</h3>
      <div className="rx-2col">
        <div className="rx-mini">
          <h4><span className="ic"><FlaskConical size={16} /></span>1 &middot; Inactivate the drug (enzymatic)</h4>
          <ul>
            <li><b>&beta;-lactamases</b> hydrolyze the &beta;-lactam ring &mdash; penicillinase &rarr; ESBL &rarr; AmpC &rarr; carbapenemase, the dominant Gram-negative threat.</li>
            <li><b>Aminoglycoside-modifying enzymes</b> and <b>chloramphenicol acetyltransferase</b> chemically disable the drug.</li>
            <li>Counter-move: a <b>&beta;-lactamase inhibitor</b> (avibactam, vaborbactam, durlobactam) or a structurally protected agent.</li>
          </ul>
        </div>
        <div className="rx-mini">
          <h4><span className="ic"><Network size={16} /></span>2 &middot; Alter / protect the target</h4>
          <ul>
            <li><b>PBP2a</b> (MRSA), <b>mosaic/altered PBP</b> (penicillin-R pneumococcus, gonococcus).</li>
            <li><b>D-Ala-D-Lac</b> precursor (vanA/vanB &rarr; VRE); <b>23S/rRNA methylation</b> (erm, cfr); <b>QRDR</b> and <b>rpoB</b> point mutations.</li>
            <li>Counter-move: an agent that binds the modified target (ceftaroline for PBP2a) or a different target entirely.</li>
          </ul>
        </div>
        <div className="rx-mini">
          <h4><span className="ic"><X size={16} /></span>3 &middot; Deny access (efflux + porin loss)</h4>
          <ul>
            <li><b>Efflux pumps</b> (tet, mef, RND systems) and <b>porin loss</b> reduce intracellular drug &mdash; central to <b>Pseudomonas</b> and <b>CRE</b> multidrug phenotypes.</li>
            <li>Often combine with a low-level enzyme to cross a breakpoint &mdash; the basis of much &ldquo;variable&rdquo; activity in the spectrum chart.</li>
            <li>Counter-move: high exposure, or the siderophore route (cefiderocol &ldquo;Trojan horse&rdquo; uptake).</li>
          </ul>
        </div>
        <div className="rx-mini">
          <h4><span className="ic"><CornerDownRight size={16} /></span>4 &middot; Bypass the pathway</h4>
          <ul>
            <li>Target <b>overproduction</b> or an <b>alternative enzyme</b> (sul/dfr in folate synthesis) outruns the drug.</li>
            <li>Auxotrophy / exogenous folate uptake circumvents folate antagonists.</li>
            <li>Counter-move: <b>sequential blockade</b> (TMP-SMX hits two folate steps) raises the bar for bypass.</li>
          </ul>
        </div>
      </div>

      <div className="rx-callout">
        <Info size={16} />
        <span>
          <b>Cidal vs static is a site question, not a ranking.</b> Bactericidal agents (&beta;-lactams, vancomycin,
          daptomycin, aminoglycosides, fluoroquinolones, metronidazole, rifampin) are preferred where host defenses
          cannot finish the job &mdash; <b>endocarditis, meningitis, profound neutropenia.</b> Bacteriostatic agents
          (tetracyclines, macrolides, clindamycin, linezolid, oxazolidinones) are fully adequate for most other
          infections, and linezolid&rsquo;s lung penetration outweighs its static label in MRSA pneumonia.
        </span>
      </div>

      <h3 className="rx-h3"><span className="ic"><Activity size={18}/></span>Pharmacokinetic-pharmacodynamic targets</h3>
      <p className="rx-lede" style={{marginBottom:12}}>Killing pattern decides dosing strategy — the same total daily dose succeeds or fails depending on how it is distributed across the interval.</p>
      <div className="rx-pkpd-grid">
        <div className="rx-pkpd-card">
          <div className="rx-pkpd-h"><Clock size={14}/> Time-dependent</div>
          <div className="rx-pkpd-tgt">Target: <b>%fT &gt; MIC</b></div>
          <div className="rx-pkpd-ag">β-lactams — carbapenems ~40%, penicillins ~50%, cephalosporins ~60–70%</div>
          <div className="rx-pkpd-do">Maximise time above MIC: <b>extended or continuous infusion</b> and more frequent dosing. Minimal Gram-negative post-antibiotic effect, so a trough that dips below MIC lets regrowth begin.</div>
        </div>
        <div className="rx-pkpd-card">
          <div className="rx-pkpd-h"><TrendingDown size={14}/> Concentration-dependent</div>
          <div className="rx-pkpd-tgt">Target: <b>C<sub>max</sub> / MIC</b></div>
          <div className="rx-pkpd-ag">Aminoglycosides (C<sub>max</sub>/MIC ~8–10), daptomycin</div>
          <div className="rx-pkpd-do">Drive the peak: <b>once-daily, extended-interval</b> dosing. A long post-antibiotic effect covers the trough and limits toxicity.</div>
        </div>
        <div className="rx-pkpd-card">
          <div className="rx-pkpd-h"><Activity size={14}/> Exposure (AUC)-dependent</div>
          <div className="rx-pkpd-tgt">Target: <b>AUC / MIC</b></div>
          <div className="rx-pkpd-ag">Vancomycin (AUC/MIC 400–600), fluoroquinolones (~125 GNR · 30–40 GP), linezolid</div>
          <div className="rx-pkpd-do">Total daily exposure governs effect: <b>AUC-guided</b> dosing — Bayesian for vancomycin — beats trough-only targeting <Cite id="vanco" onClick={(cid)=>openTrial(cid)} />.</div>
        </div>
      </div>
      <div className="rx-2col" style={{marginTop:16}}>
        <div className="rx-card rx-mini">
          <h4><span className="ic"><Clock size={15}/></span>Post-antibiotic effect</h4>
          <ul>
            <li><b>Long PAE</b> — aminoglycosides and fluoroquinolones against Gram-negatives suppress regrowth after levels fall, the rationale for extended-interval dosing.</li>
            <li><b>Minimal PAE</b> — β-lactams against Gram-negatives demand concentrations above MIC for most of the interval; never let the schedule lapse.</li>
          </ul>
        </div>
        <div className="rx-card rx-mini">
          <h4><span className="ic"><AlertTriangle size={15}/></span>Inoculum effect</h4>
          <ul>
            <li>A high bacterial burden raises the effective MIC and can defeat an agent that tests susceptible — cefazolin against high-inoculum MSSA (type-A β-lactamase), pip-tazo against high-inoculum ESBL.</li>
            <li>Implication: <b>source control</b> plus a reliable cidal agent for deep, high-burden foci — do not lean on a borderline agent at a large inoculum.</li>
          </ul>
        </div>
      </div>
      <div className="rx-callout"><Info size={15}/><span>The first (loading) dose is volume-of-distribution-driven and full regardless of clearance; augmented renal clearance and obesity both reshape these targets — the <b>Dose</b> tab applies them to the active patient.</span></div>
    </div>
  );


  const ICMAP_INT = { FlaskConical:FlaskConical, Brain:Brain, HeartPulse:HeartPulse, Droplets:Droplets, X:X, Beaker:Beaker };
  const renderSafety = () => (
    <div>
      <h2 className="rx-h2">Adverse effects, monitoring &amp; interactions</h2>
      <p className="rx-lede">
        Toxicity decides as many regimens as spectrum does. The matrix maps the dominant organ-system harms by class;
        the cards below give the monitoring that catches them and the high-yield interactions that change a regimen
        before it starts. A filled square is a notable or boxed-warning concern, amber is moderate / dose- or
        duration-dependent, and the light square is low / class-typical.
      </p>

      <div className="rx-mtxwrap">
        <table className="rx-mtx">
          <thead>
            <tr>
              <th className="corner"><div className="cl">Agent &nbsp;&middot;&nbsp; toxicity &rarr;</div></th>
              {TOX_COLS.map(c => <th key={c.k}><div className="rx-mtx-colh">{c.label}</div></th>)}
            </tr>
          </thead>
          <tbody>
            {SAFE.map((r,i) => r.band ? (
              <tr key={"b"+i} className="band"><td colSpan={TOX_COLS.length+1}>{r.band}</td></tr>
            ) : (
              <tr key={r.ag}>
                <td className="lab">{r.ag}{r.note ? <small style={{whiteSpace:"normal",fontFamily:"var(--sans)",fontSize:"10.5px",lineHeight:1.35}}>{r.note}</small> : null}</td>
                {TOX_COLS.map(c => <td key={c.k} className="rx-cell2"><ToxDot lv={r.c[c.k]} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rx-mtxleg">
        <span className="li"><span className="tox-d tx-hi" /> Notable / boxed-warning</span>
        <span className="li"><span className="tox-d tx-mod" /> Moderate / dose- or duration-dependent</span>
        <span className="li"><span className="tox-d tx-lo" /> Low / class-typical</span>
        <span className="li"><span className="tx-dot-txt">&middot;</span> Not characteristic</span>
      </div>

      <h3 className="rx-h3"><span className="ic"><Syringe size={18} /></span>Monitoring that catches harm early</h3>
      <div className="rx-2col">
        <div className="rx-mini">
          <h4><span className="ic"><Calculator size={16} /></span>Drug levels</h4>
          <ul>
            <li><b>Vancomycin</b> &mdash; dose to <b>AUC/MIC 400&ndash;600</b> (Bayesian or two-level); troughs alone overshoot toward nephrotoxicity.</li>
            <li><b>Aminoglycosides</b> &mdash; extended-interval levels (or peak/trough); follow renal function and audiometry on prolonged courses.</li>
            <li><b>Some &beta;-lactams</b> &mdash; therapeutic drug monitoring is emerging for the critically ill (cefepime neurotoxicity, target attainment).</li>
          </ul>
        </div>
        <div className="rx-mini">
          <h4><span className="ic"><Activity size={16} /></span>Labs &amp; clinical surveillance</h4>
          <ul>
            <li><b>Linezolid</b> &mdash; weekly CBC; ask about vision/neuropathy beyond 2 weeks.</li>
            <li><b>Daptomycin</b> &mdash; weekly CPK; hold statins; watch for eosinophilic pneumonia.</li>
            <li><b>TMP-SMX</b> &mdash; potassium and creatinine within days; CBC on long courses.</li>
            <li><b>Rifampin / nafcillin / chloramphenicol</b> &mdash; LFTs (and CBC for chloramphenicol).</li>
            <li><b>Fluoroquinolones, macrolides</b> &mdash; baseline ECG + electrolytes when stacking QT risk.</li>
          </ul>
        </div>
      </div>

      <h3 className="rx-h3"><span className="ic"><AlertTriangle size={18} /></span>High-yield interactions</h3>
      <div className="rx-trig">
        {INTERACTIONS.map((it,i) => { const IC = ICMAP_INT[it.ic] || Info; return (
          <div key={i} className="rx-trigcard rx-card">
            <h4><span className="ic"><IC size={15} /></span>{it.h}</h4>
            <p style={{margin:"2px 0 0",fontSize:"12.5px",color:"var(--ink2)",lineHeight:1.55}}>{it.b}</p>
          </div>
        ); })}
      </div>

      <div className="rx-callout">
        <Info size={16} />
        <span>
          Two safety levers sit outside the matrix: <b>renal dose adjustment</b> (cefepime, carbapenems, aminoglycosides,
          vancomycin, TMP-SMX, nitrofurantoin, colistin all accumulate) and <b>duration</b> &mdash; linezolid marrow and
          optic toxicity, metronidazole neuropathy, and aminoglycoside oto-/nephrotoxicity are all duration-driven, so
          the shortest effective course is itself a safety intervention.
        </span>
      </div>

      <h3 className="rx-h3"><span className="ic"><ShieldAlert size={18}/></span>Hepatic dosing &amp; special populations</h3>
      <p className="rx-lede" style={{marginBottom:10}}>Most antibacterials are renally cleared, so hepatic adjustment is the exception — but a handful carry real liver considerations that the renal-dosing reflex misses.</p>
      <div className="rx-card" style={{padding:0,overflow:"hidden"}}>
        <table className="rx-heptable">
          <thead><tr><th>Agent</th><th>Hepatic consideration</th></tr></thead>
          <tbody>
            {[
              ["Nafcillin / oxacillin","Largely biliary/hepatic elimination — useful when renal function is poor, but hepatotoxicity and interstitial nephritis."],
              ["Ceftriaxone","Dual biliary + renal elimination; biliary sludging/pseudolithiasis. Caution in combined hepatic and renal failure."],
              ["Metronidazole","Reduce dose in severe hepatic impairment (Child-Pugh C) — it accumulates."],
              ["Clindamycin","Hepatic metabolism; caution and monitoring in severe liver disease."],
              ["Tigecycline","Reduce the maintenance dose in Child-Pugh C."],
              ["Rifampin","Hepatotoxic and a potent CYP3A inducer — monitor LFTs and anticipate drug interactions."],
              ["Chloramphenicol","Reduce in hepatic failure; dose-related marrow suppression."],
            ].map(([ag,c]) => (
              <tr key={ag}>
                <td className="rx-hep-ag"><button className="rx-fname-link" onClick={()=>openDrug(ag)} title="Open the drug monograph">{ag}</button></td>
                <td className="rx-hep-c">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rx-callout" style={{marginTop:14}}>
        <Info size={16}/>
        <span>
          <b>Pregnancy and lactation</b> sit outside this adult inpatient reference. As broad orientation only — not a substitute for an obstetric-pharmacy source or LactMed — β-lactams, azithromycin, and clindamycin are generally regarded as compatible, whereas fluoroquinolones, tetracyclines, and (near term or first trimester) trimethoprim-sulfamethoxazole are generally avoided. Confirm every choice against a dedicated resource.
        </span>
      </div>
    </div>
  );

  const TABRENDER = { approach:renderApproach, empiric:renderEmpiric, directed:renderDirected, reference:renderReference, spectrum:renderSpectrum, penetration:renderPenetration, mechanisms:renderMechanisms, dose:renderDose, safety:renderSafety, course:renderCourse, adjuncts:renderAdjuncts };

  /* ============ BEDSIDE MODE (Phase A · Case Bar + Answer Canvas) ============
     `?bedside=1` mounts the bedside shell. The classic UI is fully preserved
     below — this is an additive surface, not a replacement. CSS5 carries the
     `.rx-bedside`-scoped mobile-first density rules added in Phase A.3. */
  if(mode === "bedside") {
    return (
      <>
        <style>{CSS + CSS2 + CSS3 + CSS4 + CSS5}</style>
        <BedsideShell caseState={caseState} setCaseState={setCaseState} onExit={() => setMode("classic")} />
      </>
    );
  }

  /* ============ RETURN ============ */
  return (
    <div className="rx-root">
      <style>{CSS + CSS2 + CSS3 + CSS4}</style>

      <header className="rx-header">
        <div className="rx-wrap">
          <div className="rx-headrow">
            <div className="rx-mark"><Microscope size={20} /></div>
            <div className="rx-brand">
              <div className="rx-kicker">Inpatient · Antibacterial</div>
              <h1 className="rx-title">Antibacterial Reference & Selection Engine</h1>
              <p className="rx-sub">Adult hospital medicine · empiric → directed → reference · generic agents only</p>
            </div>
            <div className="rx-searchwrap">
              <span className="rx-search-i"><Search size={15} /></span>
              <input className="rx-search" placeholder="Search  ⌘K" onFocus={()=>{setCmdOpen(true);setCmdQ("");setCmdIdx(0);}} readOnly />
            </div>
          </div>
          <nav className="rx-nav" role="tablist">
            {TABS.map(t => {
              const TI = t.icon;
              return (
                <button key={t.id} className="rx-tab" aria-current={tab===t.id} role="tab" onClick={()=>setTab(t.id)}>
                  <TI /> {t.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <PatientContextBar ctx={ctx} d={d}
        onClear={()=>setCtxField("on", false)}
        onJump={()=>setTab("dose")} />

      {cmdOpen && (
        <div className="rx-cmd-overlay" onClick={()=>setCmdOpen(false)}>
          <div className="rx-cmd" onClick={e=>e.stopPropagation()}>
            <div className="rx-cmd-head">
              <Search size={18} color="var(--muted)" />
              <input autoFocus value={cmdQ} onChange={e=>{setCmdQ(e.target.value);setCmdIdx(0);}} placeholder="Jump to a syndrome, drug, organism, or section…" />
              <span className="rx-cmd-esc">ESC</span>
            </div>
            <div className="rx-cmd-list">
              {cmdResults.length === 0 && <div className="rx-cmd-empty">No matches for “{cmdQ}”</div>}
              {cmdResults.map((r,i) => {
                const RI = r.icon || ChevronRight;
                return (
                  <button key={i} className="rx-cmd-item" data-active={i===cmdIdx} onMouseEnter={()=>setCmdIdx(i)} onClick={()=>go(r.go)}>
                    <span className="rx-cmd-ic"><RI size={15} /></span>
                    <span className="rx-cmd-tx"><span className="nm">{r.name}</span><span className="ct">{r.kind} · {r.sub}</span></span>
                    <ChevronRight size={15} color="var(--faint)" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Drawer
        open={!!drawer}
        onClose={()=>setDrawer(null)}
        kicker={drawer ? (drawer.kind === "drug" ? "Drug monograph" : drawer.kind === "org" ? "Organism card" : drawer.kind === "regimen" ? "Assembled empiric regimen" : drawer.kind === "trial" ? "Evidence" : "") : ""}
        icon={drawer ? (drawer.kind === "drug" ? Pill : drawer.kind === "regimen" ? Crosshair : drawer.kind === "trial" ? BookOpen : Bug) : undefined}
        title={drawer ? (drawer.kind === "org" ? ((ORG_BY_ID[drawer.key]||{}).label || drawer.key) : drawer.kind === "regimen" ? ((SYNDROMES.find(s=>s.id===drawer.key)||{}).name || drawer.key) : drawer.kind === "trial" ? ((TRIAL_DETAIL[drawer.key]||{}).short || (GUIDELINES[drawer.key]||{}).body || drawer.key) : drawer.key) : ""}>
        {drawer && drawer.kind === "drug" && (
          <DrugCard name={drawer.key} doseFn={dose}
            onSpectrum={(n)=>{ setTab("spectrum"); setPickDrug(n); setPickOrg(null); setDrawer(null); }}
            onSyndrome={(id)=>{ setTab("empiric"); setSynCat("all"); setOpenSyn(id); setDrawer(null); }}
            onOrg={(id)=>openOrgDrawer(id)} />
        )}
        {drawer && drawer.kind === "org" && (
          <OrgCard id={drawer.key}
            onSpectrum={(id)=>{ setTab("spectrum"); setPickOrg(id); setPickDrug(null); setDrawer(null); }}
            onSyndrome={(id)=>{ setTab("empiric"); setSynCat("all"); setOpenSyn(id); setDrawer(null); }}
            onDrug={(n)=>openDrug(n)} />
        )}
        {drawer && drawer.kind === "regimen" && (
          <RegimenCard synId={drawer.key} ctx={{ ...ctx, crcl:d.crcl }} doseFn={dose}
            onDrug={(n)=>openDrug(n)}
            onOrg={(id)=>openOrgDrawer(id)}
            onCite={(id)=>openTrial(id)}
            onFull={(id)=>{ setTab("empiric"); setSynCat("all"); setOpenSyn(id); setDrawer(null); }} />
        )}
        {drawer && drawer.kind === "trial" && <TrialCard id={drawer.key} />}
      </Drawer>

      <main className="rx-main">
        <div className="rx-wrap">
          {(TABRENDER[tab] || renderApproach)()}
          <div className="rx-foot">
            <b>Inpatient Antibacterial Reference & Selection Engine.</b> Built for adult hospital medicine and board preparation. Decision support only — not a substitute for the local antibiogram, current primary guidelines, clinical pharmacy, or infectious-diseases consultation. Antibacterials only; antifungal and antiviral therapy are out of scope. Doses assume normal organ function and serious infection — verify every order. Clinical content reflects sources current to the build date and will drift; reconfirm against the live guidelines.
            <div style={{marginTop:8,fontFamily:"var(--mono)",fontSize:"10.5px",letterSpacing:".04em",color:"var(--muted)"}}>Version {VERSION} · clinical review {REVIEWED} · {SYNDROMES.length} syndromes · {DIRECTED.reduce((n,g)=>n+g.items.length,0)} directed organisms · {REFS.length} primary sources</div>
          </div>
        </div>
      </main>
    </div>
  );
}
