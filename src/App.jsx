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
import { KINETIC } from "./styles/kinetic-type";
import { MICRO } from "./styles/microinteractions";
import { PatientContextBar, DrugCard, OrgCard, RegimenCard, TrialCard, RapidDxTimeout, IVtoPO, MrsaCell, CmpCell, SpectrumCompare } from "./components/cards";
import { ClassChip, TermChip, renderRx, renderGloss, renderRich } from "./components/rich-text";
import { Num, Cite, Ev, BugTag, SectionDisc, Drawer, PDot, ToxDot, CardCopyButton, DoseAdjustBar, ChildPughScorer } from "./components/primitives";
import { BedsideShell } from "./components/BedsideShell";
import { AntibiogramManager } from "./components/AntibiogramManager";
import {
  getAllAntibiograms, getActiveAntibiogram,
  saveUserAntibiogram, deleteUserAntibiogram,
  saveActiveId,
} from "./engines/antibiogramStore.js";
import { SurfaceBar } from "./components/SurfaceBar";
import { SectionNav } from "./components/SectionNav";
import { OutpatientShell } from "./components/OutpatientShell";
import { GlobalScrollProgress } from "./components/GlobalScrollProgress";
import { SECTIONS, SECTION_BY_ID, sectionForTab, firstTabOfSection } from "./data/sections";
import { SyndromesSection } from "./sections/SyndromesSection";
import { AgentsSection } from "./sections/AgentsSection";
import { OrganismsSection } from "./sections/OrganismsSection";
import { CompareSection } from "./sections/CompareSection";
import { PrinciplesSection } from "./sections/PrinciplesSection";
import { penChips, allergyGuidance, interactionsForAgent, regimenInteractions, synEvidence, classData, glossData } from "./engines/clinical";
import { buildRegimen, regimenAgents, refineAgents, refineOptionGroups, refineRegimen, deescalationPlan } from "./engines/regimen";
import { _looseFind, drugLookup, orgLookup, _spxFor, drugCoversOrg, drugRoute } from "./engines/lookup";
import { checkIntegrity, integrityLine } from "./engines/integrity";
import { resolveDrug, computeDose, agentsInRx, adjustmentsForAgent, doseAdjustments, cockcroftGault, ckdEpi2021, weightDescriptors, childPughComponentPoints, childPugh, bandFor, deriveCtx } from "./engines/dosing";
import { SPECTRUM, SpectrumChartFull, SPX_ORGS, SPX_CLASSES, SPX_SCALE, SPX_ORG_BY, SPX_SG_BY, SPX_AGENTS } from "./spectrum/Spectrum";
import { RISK_KW } from "./data/risk-keywords";
import { CAT_ICONS, SYN_ICON, FORM_ICON, TREE_ICON, RDX_ICON, TABS } from "./data/ui-maps";
import { ALLERGY_INTRO, ALLERGY, SPECIAL_POP, PROPHYLAXIS, SEPSIS_FLOW, TREES, RAPID_DX, TIMEOUT_ITEMS, IVPO_CRITERIA, PO_AGENTS, GLOSSARY, GLOSS_KEYS, GLOSS_TOKEN } from "./data/content";
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
      const sec = h.get("sec");
      if(sec && SECTION_BY_ID[sec]) out.section = sec;
      // Legacy bookmark redirect: when the user has a #t=... but no #sec=...,
      // derive section from the tab so old links land in the right section.
      if(!out.section && out.tab) out.section = sectionForTab(out.tab);
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
  /* Phase C · two-axis navigation: surface × mode.
       surface ∈ { "inpatient", "outpatient" }    — clinical setting
       mode    ∈ { "reference", "decide" }        — view within the surface
     Default landing is inpatient + reference (the current 11-tab UI), so
     existing links and bookmarks see no change. The Phase A/B Bedside
     surface is now inpatient + decide. Outpatient is a placeholder for a
     planned build-out and routes to OutpatientShell regardless of mode.
     URL params:
       ?surface=inpatient|outpatient   (default: inpatient)
       ?mode=reference|decide          (default: reference)
       ?bedside=1                      back-compat alias for
                                       surface=inpatient & mode=decide */
  const _navFromUrl = (() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const isBedsideFlag = q.get("bedside") === "1";
      const surface = (() => {
        const s = q.get("surface");
        return s === "outpatient" ? "outpatient" : "inpatient";
      })();
      const mode = (() => {
        if(isBedsideFlag) return "decide";
        const m = q.get("mode");
        return m === "decide" ? "decide" : "reference";
      })();
      return { surface, mode };
    } catch(e){ return { surface:"inpatient", mode:"reference" }; }
  })();
  const [surface, setSurface] = useState(_navFromUrl.surface);
  const [mode, setMode]       = useState(_navFromUrl.mode);
  const [tab, setTab] = useState(_hashState.tab || "approach");
  /* Phase B1 — section state. The 5-section nav sits above the 11-tab nav
     so the user picks the question class first. Selecting a section auto-
     switches the tab to the section's first tab; the tab nav below
     filters to show only tabs belonging to the current section. */
  const [section, setSection] = useState(_hashState.section || sectionForTab(_hashState.tab || "approach"));
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQ, setCmdQ] = useState("");
  const [cmdIdx, setCmdIdx] = useState(0);
  /* Phase E3 + E4 — antibiogram registry + manager modal.
     Backed by localStorage via antibiogramStore: seeds reload from
     code, user uploads persist across sessions, active selection
     restores on next visit. */
  const [antibiograms, setAntibiograms] = useState(() => getAllAntibiograms());
  const [activeAntibiogramId, setActiveAntibiogramId] = useState(() => {
    const active = getActiveAntibiogram();
    return active ? active.id : null;
  });
  const [antibiogramManagerOpen, setAntibiogramManagerOpen] = useState(false);
  const activeAntibiogram = antibiograms.find(a => a.id === activeAntibiogramId) || null;
  // Persist active id whenever it changes so refresh restores it.
  useEffect(() => { saveActiveId(activeAntibiogramId); }, [activeAntibiogramId]);
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

  /* ---- command palette index ----
     Navigation items (View / Empiric / Directed) flip surface to reference
     mode before applying the tab/syndrome target, so the palette routes
     correctly whether the user invoked it from decide mode or reference
     mode. Drug + Organism items just open the Drawer, which is mounted
     in both modes (see drawerEl above) and needs no mode flip. */
  const _navToRef = (fn) => () => { setMode("reference"); fn(); };
  /* Phase B7 — wide ⌘K search index. Each entry carries a hidden `hay`
     field (haystack) of secondary text — bugs, pearls, cover prose,
     drug spec/penetration/toxicity, guideline titles — that the filter
     searches but the result row does not display. The result list
     stays compact (~300 rows) while the searchable surface widens to
     several thousand strings; "fluoroquinolone" finds every drug whose
     class or spec text mentions it, "MERINO" finds the syndrome whose
     research panel cites the trial, etc. */
  const index = useMemo(() => {
    const items = [];
    // Tabs (section labels live in SectionNav above the palette, not here).
    TABS.forEach(t => items.push({
      kind:"View", name:t.label, sub:"Section", icon:t.icon, hay:"",
      go: _navToRef(() => setTab(t.id)),
    }));
    // Syndromes — searchable across category, bugs, pearls, and cover prose.
    SYNDROMES.forEach(s => {
      const bugLabels = (s.bugs || []).map(b => (ORG_BY_ID[b] || {}).label || b).join(" ");
      const pearlsText = (s.pearls || []).join(" ").replace(/<[^>]+>/g, "").replace(/\*\*/g, "");
      const coverText = ((s.cover && s.cover.empiric) || "") + " " + ((s.cover && s.cover.drop) || "");
      items.push({
        kind:"Empiric", name:s.name,
        sub:(SYN_CATS.find(c=>c.id===s.cat)||{}).label||"Syndrome",
        icon:(SYN_ICON[s.icon]||Stethoscope),
        hay: bugLabels + " " + pearlsText + " " + coverText + " " + (s.line || ""),
        go: _navToRef(() => { setTab("empiric"); setSynCat("all"); setOpenSyn(s.id); }),
      });
    });
    // Drugs — searchable across spectrum, penetration, toxicity, class.
    FORMULARY.forEach(cl => cl.drugs.forEach(dr => items.push({
      kind:"Drug", name:dr.name, sub:cl.cls, icon:Pill,
      hay: (dr.spec || "") + " " + (dr.pen || "") + " " + (dr.tox || "") + " " + (dr.pearl || "") + " " + cl.cls,
      go:() => setDrawer({ kind:"drug", key:dr.name }),
    })));
    // Organisms — searchable across resistance trend.
    ORGS.forEach(o => items.push({
      kind:"Organism", name:o.label, sub:"Organism card", icon:Bug,
      hay: (o.trend || "") + " " + (o.note || ""),
      go:() => setDrawer({ kind:"org", key:o.id }),
    }));
    // Directed rows (already indexed by organism name).
    DIRECTED.forEach(g => g.items.forEach(o => items.push({
      kind:"Directed", name:o.org, sub:"Directed-therapy row", icon:Crosshair, hay:"",
      go: _navToRef(() => { setTab("directed"); setOpenOrg(slug(o.org)); }),
    })));
    // Guidelines (Phase B7 addition) — each registered primary source is
    // now its own palette row. Picking one opens the trial drawer with
    // the full title + body + year. Lets the user jump to "MERINO" or
    // "IDSA 2016 HAP/VAP" by title without knowing which syndrome
    // references it.
    Object.entries(GUIDELINES).forEach(([id, g]) => items.push({
      kind:"Guideline",
      name: (g.title || g.body || id).slice(0, 80),
      sub: (g.body || "") + (g.year ? " · " + g.year : ""),
      icon: BookOpen,
      hay: (g.title || "") + " " + (g.body || "") + " " + (g.year || ""),
      go: () => setDrawer({ kind:"trial", key:id }),
    }));
    return items;
  }, []);
  const cmdResults = useMemo(() => {
    const q = cmdQ.trim().toLowerCase();
    if (!q) return index.slice(0, 8);
    return index.filter(i => (i.name + " " + i.sub + " " + i.kind + " " + (i.hay || "")).toLowerCase().includes(q)).slice(0, 24);
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

  /* ---- Wave 9 · global cursor-spotlight on every .rx-card-interactive ----
     One delegated mousemove listener on document, no per-card useEffect
     wiring. As the cursor moves, we walk up from the event target until
     we hit a .rx-card-interactive (closest()) and write --cursor-x /
     --cursor-y / --cursor-active onto that element. mouseout flips the
     active flag back to 0. Reduced-motion + coarse-pointer short-circuit
     so the listener is never installed on those configurations — the CSS
     :hover styling continues to work, just without the cursor halo. */
  useEffect(() => {
    if(typeof window === "undefined" || !window.matchMedia) return undefined;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    if(window.matchMedia("(pointer: coarse)").matches) return undefined;
    let activeEl = null;
    const onMove = (e) => {
      const t = e.target;
      if(!t || typeof t.closest !== "function") return;
      const card = t.closest(".rx-card-interactive");
      if(!card){
        if(activeEl){ activeEl.style.setProperty("--cursor-active", "0"); activeEl = null; }
        return;
      }
      if(activeEl && activeEl !== card){
        activeEl.style.setProperty("--cursor-active", "0");
      }
      const r = card.getBoundingClientRect();
      card.style.setProperty("--cursor-x", (e.clientX - r.left) + "px");
      card.style.setProperty("--cursor-y", (e.clientY - r.top) + "px");
      card.style.setProperty("--cursor-active", "1");
      activeEl = card;
    };
    const onLeaveWindow = () => {
      if(activeEl){ activeEl.style.setProperty("--cursor-active", "0"); activeEl = null; }
    };
    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeaveWindow, { passive: true });
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeaveWindow);
      if(activeEl) activeEl.style.setProperty("--cursor-active", "0");
    };
  }, []);

  /* ---- Wave 9 · global magnetic-pull on every .rx-cta-glow CTA ----
     Single document mousemove computes distance from each .rx-cta-glow
     center; within `range` it applies a translate3d up to `MAX_PULL`
     pixels. The buttons keep their existing CSS hover treatment; this
     just adds a subtle physical "pull" the moment the cursor enters
     their orbit. Reduced-motion + coarse-pointer short-circuit. */
  useEffect(() => {
    if(typeof window === "undefined" || !window.matchMedia) return undefined;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    if(window.matchMedia("(pointer: coarse)").matches) return undefined;
    const RANGE = 80;
    const MAX_PULL = 8;
    let rafId = 0;
    let pendingEvent = null;
    const apply = () => {
      rafId = 0;
      const e = pendingEvent;
      if(!e) return;
      const ctas = document.querySelectorAll(".rx-cta-glow");
      for(let i = 0; i < ctas.length; i++){
        const el = ctas[i];
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if(dist > RANGE){
          if(el.style.transform){ el.style.transform = ""; }
          continue;
        }
        const factor = (RANGE - dist) / RANGE; // 0..1
        const px = Math.max(-MAX_PULL, Math.min(MAX_PULL, dx * 0.25 * factor));
        const py = Math.max(-MAX_PULL, Math.min(MAX_PULL, dy * 0.25 * factor));
        el.style.transition = "transform 200ms cubic-bezier(0.16, 1, 0.3, 1)";
        el.style.transform = "translate3d(" + px.toFixed(2) + "px, " + py.toFixed(2) + "px, 0)";
      }
    };
    const onMove = (e) => {
      pendingEvent = e;
      if(rafId) return;
      rafId = window.requestAnimationFrame(apply);
    };
    document.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      document.removeEventListener("mousemove", onMove);
      if(rafId) window.cancelAnimationFrame(rafId);
      const ctas = document.querySelectorAll(".rx-cta-glow");
      for(let i = 0; i < ctas.length; i++){
        ctas[i].style.transform = "";
        ctas[i].style.transition = "";
      }
    };
  }, []);

  /* ---- derived patient quantities: one transform, memoized ---- */
  const d = useMemo(() => deriveCtx(ctx), [ctx]);
  const crcl = d.crcl, crclBand = d.crclBand;

  /* Phase C · sync surface + mode to URL search params (not the hash, which
     carries the deep tab/syndrome/ctx state). Drops both keys when at the
     defaults so a clean URL stays clean, and preserves any unrelated query
     params the user may have. Also retires the legacy ?bedside=1 flag from
     the URL whenever surface/mode are written — it stays accepted on read
     but does not persist into the rewritten URL. */
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      q.delete("bedside");
      if(surface && surface !== "inpatient") q.set("surface", surface); else q.delete("surface");
      if(mode    && mode    !== "reference") q.set("mode", mode);          else q.delete("mode");
      const next = q.toString();
      const cur = window.location.search.replace(/^\?/, "");
      if(next !== cur){
        const url = window.location.pathname + (next ? "?" + next : "") + window.location.hash;
        window.history.replaceState(null, "", url);
      }
    } catch(e){ /* best-effort */ }
  }, [surface, mode]);

  /* 4.2 · write deep-state back to the URL hash (debounced via effect deps).
     Phase 0 extension: also encode the case-state stub fields (cultures,
     dayOfTx, startDate) when populated. The classic UI does not populate
     them, so default behavior emits the same hash as before. */
  useEffect(() => {
    try {
      const p = new URLSearchParams();
      if(section && section !== "principles") p.set("sec", section);
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
  }, [section, tab, openSyn, ctx, caseState.cultures, caseState.dayOfTx, caseState.startDate, caseState.clinical]);

  /* Keep section synced with tab. Callers that switch the tab directly
     (the ⌘K palette, "Open as case" / "Open spectrum" deep-links from
     drawer cards, etc.) don't know about section — but the section nav
     should still highlight the correct group. Whenever the active tab
     belongs to a different section than the current `section` state,
     update section. Safe because sectionForTab is pure. */
  useEffect(() => {
    const expected = sectionForTab(tab);
    if(expected !== section) setSection(expected);
  }, [tab]);

  /* dose(name): renally-adjusted dose for THIS patient, or null when context is
     off / agent has no structured rule → caller renders the static string. */
  const dose = (name) => computeDose(name, { on: ctx.on, crcl: d.crcl });

  const go = (fn) => { fn(); setCmdOpen(false); };

  /* Phase B integration — each tab is now a thin wrapper around its
     section component. Tabs in the same section reuse the same component
     and pass activeTab so the component renders the correct sub-panel.
     The inline renderXxx functions are removed in this same PR — the
     section components ship the same DOM, classNames, and anchors so
     visual output is identical. */
  const _renderSyndromes = () => (
    <SyndromesSection
      caseState={caseState} setCaseState={setCaseState}
      ctx={ctx} d={d} dose={dose}
      openDrug={openDrug} openOrg={openOrgDrawer} openTrial={openTrial} openRegimen={openRegimen}
      setMode={setMode} setTab={setTab}
      synCat={synCat} setSynCat={setSynCat}
      openSyn={openSyn} setOpenSyn={setOpenSyn}
    />
  );
  const _renderAgents = (activeTab) => (
    <AgentsSection
      activeTab={activeTab} setTab={setTab}
      ctx={ctx} d={d} dose={dose}
      setCtxField={setCtxField} setCpField={setCpField}
      pickOrg={pickOrg} pickDrug={pickDrug}
      setPickOrg={setPickOrg} setPickDrug={setPickDrug}
      openDrug={openDrug} openOrg={openOrgDrawer} openTrial={openTrial}
    />
  );
  const _renderOrganisms = () => (
    <OrganismsSection
      caseState={caseState} setCaseState={setCaseState}
      ctx={ctx} d={d} dose={dose}
      openDrug={openDrug} openOrg={openOrgDrawer} openTrial={openTrial}
      openOrgRow={openOrg} setOpenOrgRow={setOpenOrg}
    />
  );
  const _renderCompare = (activeTab) => (
    <CompareSection
      activeTab={activeTab} setTab={setTab}
      ctx={ctx} d={d} dose={dose}
      openDrug={openDrug} openOrg={openOrgDrawer} openTrial={openTrial}
      pickDrug={pickDrug} setPickDrug={setPickDrug}
      pickOrg={pickOrg} setPickOrg={setPickOrg}
    />
  );
  const _renderPrinciples = (activeTab) => (
    <PrinciplesSection
      activeTab={activeTab} setTab={setTab}
      ctx={ctx} d={d} dose={dose}
      openDrug={openDrug} openOrg={openOrgDrawer} openTrial={openTrial}
    />
  );
  const TABRENDER = {
    approach: () => _renderPrinciples("approach"),
    course:   () => _renderPrinciples("course"),
    adjuncts: () => _renderPrinciples("adjuncts"),
    empiric:  _renderSyndromes,
    directed: _renderOrganisms,
    reference:() => _renderAgents("reference"),
    dose:     () => _renderAgents("dose"),
    safety:   () => _renderAgents("safety"),
    spectrum: () => _renderCompare("spectrum"),
    penetration: () => _renderCompare("penetration"),
    mechanisms:  () => _renderCompare("mechanisms"),
    regimens:    () => _renderCompare("regimens"),
  };

  /* ============ PHASE C · SURFACE × MODE ROUTER ===========================
     Two-axis navigation. Default landing (inpatient + reference) renders
     the existing 11-tab UI byte-identical to the pre-Phase-C app. The
     SurfaceBar is mounted above every branch so the toggle is always
     reachable. The bar is sticky and lives in CSS5's bedside-scoped style
     block; that block is now injected on every branch since the
     surface/mode picker lives across all of them.
     Branches:
       inpatient + decide      → BedsideShell (Phase A/B)
       outpatient + anything   → OutpatientShell placeholder
       inpatient + reference   → the existing classic UI (falls through) */
  const styleTag = <style>{CSS + CSS2 + CSS3 + CSS4 + CSS5 + KINETIC + MICRO}</style>;
  const bar = (
    <SurfaceBar
      surface={surface}
      mode={mode}
      onSurface={(s) => { setSurface(s); if(s === "outpatient") setMode("reference"); }}
      onMode={(m) => setMode(m)}
    />
  );

  /* Command palette overlay — hoisted out of the reference-mode return so
     it mounts in both decide and reference modes. The global ⌘K keydown
     listener (line ~195) already fires across the whole app; previously
     the *overlay* JSX only rendered in reference mode, so pressing ⌘K in
     decide mode flipped state but rendered nothing visible. Now the same
     palette opens regardless of mode and navigation items flip to
     reference mode automatically (see `_navToRef` above). */
  const cmdPaletteEl = cmdOpen ? (
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
  ) : null;

  /* Knowledge-graph drawer — hoisted out of the reference-mode return so it
     mounts in both decide and reference modes. Chip clicks in BedsideShell
     (drug names, organism tokens, trial citations) now resolve to the same
     monograph/organism/trial cards that the reference UI uses. When the user
     opens a drawer in decide mode and then activates a navigation link
     ("View spectrum", "Open syndrome card"), we switch back to reference
     mode and route to the requested tab so the deep link works seamlessly. */
  const _toRef = (fn) => (...args) => { setMode("reference"); fn(...args); };
  const drawerEl = (
    <Drawer
      open={!!drawer}
      onClose={()=>setDrawer(null)}
      kicker={drawer ? (drawer.kind === "drug" ? "Drug monograph" : drawer.kind === "org" ? "Organism card" : drawer.kind === "regimen" ? "Assembled empiric regimen" : drawer.kind === "trial" ? "Evidence" : "") : ""}
      icon={drawer ? (drawer.kind === "drug" ? Pill : drawer.kind === "regimen" ? Crosshair : drawer.kind === "trial" ? BookOpen : Bug) : undefined}
      title={drawer ? (drawer.kind === "org" ? ((ORG_BY_ID[drawer.key]||{}).label || drawer.key) : drawer.kind === "regimen" ? ((SYNDROMES.find(s=>s.id===drawer.key)||{}).name || drawer.key) : drawer.kind === "trial" ? ((TRIAL_DETAIL[drawer.key]||{}).short || (GUIDELINES[drawer.key]||{}).body || drawer.key) : drawer.key) : ""}>
      {drawer && drawer.kind === "drug" && (
        <DrugCard name={drawer.key} doseFn={dose}
          onSpectrum={_toRef((n)=>{ setTab("spectrum"); setPickDrug(n); setPickOrg(null); setDrawer(null); })}
          onSyndrome={_toRef((id)=>{ setTab("empiric"); setSynCat("all"); setOpenSyn(id); setDrawer(null); })}
          onOrg={(id)=>openOrgDrawer(id)} />
      )}
      {drawer && drawer.kind === "org" && (
        <OrgCard id={drawer.key}
          onSpectrum={_toRef((id)=>{ setTab("spectrum"); setPickOrg(id); setPickDrug(null); setDrawer(null); })}
          onSyndrome={_toRef((id)=>{ setTab("empiric"); setSynCat("all"); setOpenSyn(id); setDrawer(null); })}
          onDrug={(n)=>openDrug(n)} />
      )}
      {drawer && drawer.kind === "regimen" && (
        <RegimenCard synId={drawer.key} ctx={{ ...ctx, crcl:d.crcl }} doseFn={dose}
          onDrug={(n)=>openDrug(n)}
          onOrg={(id)=>openOrgDrawer(id)}
          onCite={(id)=>openTrial(id)}
          onFull={_toRef((id)=>{ setTab("empiric"); setSynCat("all"); setOpenSyn(id); setDrawer(null); })} />
      )}
      {drawer && drawer.kind === "trial" && (
        <TrialCard id={drawer.key}
          onSyndrome={_toRef((id)=>{ setTab("empiric"); setSynCat("all"); setOpenSyn(id); setDrawer(null); })} />
      )}
    </Drawer>
  );

  if(surface === "outpatient") {
    return (
      <>
        {styleTag}
        <GlobalScrollProgress />
        {bar}
        <OutpatientShell onSwitchInpatient={() => setSurface("inpatient")} />
      </>
    );
  }

  if(surface === "inpatient" && mode === "decide") {
    return (
      <>
        {styleTag}
        {bar}
        <BedsideShell
          caseState={caseState}
          setCaseState={setCaseState}
          onExit={() => setMode("reference")}
          onDrug={openDrug}
          onOrg={openOrgDrawer}
          onCite={openTrial}
          onOpenPalette={() => { setCmdOpen(true); setCmdQ(""); setCmdIdx(0); }}
          antibiogram={activeAntibiogram}
          onOpenAntibiogramManager={() => setAntibiogramManagerOpen(true)}
        />
        <AntibiogramManager
          open={antibiogramManagerOpen}
          onClose={() => setAntibiogramManagerOpen(false)}
          antibiograms={antibiograms}
          activeId={activeAntibiogramId}
          onSelect={(id) => setActiveAntibiogramId(id)}
          onSave={(ab) => {
            saveUserAntibiogram(ab);
            setAntibiograms(getAllAntibiograms());
            setActiveAntibiogramId(ab.id);
          }}
          onDelete={(id) => {
            deleteUserAntibiogram(id);
            const nextList = getAllAntibiograms();
            setAntibiograms(nextList);
            if(activeAntibiogramId === id) {
              setActiveAntibiogramId(nextList.length ? nextList[0].id : null);
            }
          }}
        />
        {cmdPaletteEl}
        {drawerEl}
      </>
    );
  }

  /* ============ RETURN — inpatient + reference (the classic 11-tab UI) === */
  return (
    <div className="rx-root">
      <style>{CSS + CSS2 + CSS3 + CSS4 + CSS5 + KINETIC + MICRO}</style>

      <GlobalScrollProgress />
      {bar}

      <SectionNav section={section} onSection={(s) => {
        setSection(s);
        // Auto-switch to the section's first tab when the current tab
        // doesn't belong to the picked section. Preserves the active tab
        // when the user re-selects their current section.
        const sec = SECTION_BY_ID[s];
        if(sec && !sec.tabs.includes(tab)) setTab(firstTabOfSection(s));
      }} />

      <header className="rx-header">
        <div className="rx-wrap">
          <div className="rx-headrow">
            <div className="rx-mark"><Microscope size={20} /></div>
            <div className="rx-brand">
              <div className="rx-kicker">Inpatient · Antibacterial · {(SECTION_BY_ID[section] || {}).label}</div>
              <h1 className="rx-title">Antibacterial Reference & Selection Engine</h1>
              <p className="rx-sub">Adult hospital medicine · empiric → directed → reference · generic agents only</p>
            </div>
            <div className="rx-searchwrap">
              <span className="rx-search-i"><Search size={15} /></span>
              <input className="rx-search" placeholder="Search  ⌘K" onFocus={()=>{setCmdOpen(true);setCmdQ("");setCmdIdx(0);}} readOnly />
            </div>
          </div>
          {/* Section-scoped tab sub-nav. Phase B1: filters the 11-tab bar
              to only the tabs that belong to the active section. Click a
              section above (SectionNav) and this sub-nav re-paints with
              that section's tabs. When a section has only one tab, the
              sub-nav hides itself (single-tab nav is visual noise). */}
          {(SECTION_BY_ID[section]?.tabs?.length || 0) > 1 && (
          <nav className="rx-nav" role="tablist" aria-label={`${(SECTION_BY_ID[section] || {}).label} sub-sections`}>
            {TABS.filter(t => (SECTION_BY_ID[section]?.tabs || []).includes(t.id)).map(t => {
              const TI = t.icon;
              return (
                <button key={t.id} className="rx-tab" aria-current={tab===t.id} role="tab" onClick={()=>setTab(t.id)}>
                  <TI /> {t.label}
                </button>
              );
            })}
          </nav>
          )}
        </div>
      </header>

      <PatientContextBar ctx={ctx} d={d}
        onClear={()=>setCtxField("on", false)}
        onJump={()=>setTab("dose")} />

      {cmdPaletteEl}

      {drawerEl}

      <main className="rx-main">
        <div className="rx-wrap">
          {(TABRENDER[tab] || TABRENDER.approach)()}
          <div className="rx-foot">
            <b>Inpatient Antibacterial Reference & Selection Engine.</b> Built for adult hospital medicine and board preparation. Decision support only — not a substitute for the local antibiogram, current primary guidelines, clinical pharmacy, or infectious-diseases consultation. Antibacterials only; antifungal and antiviral therapy are out of scope. Doses assume normal organ function and serious infection — verify every order. Clinical content reflects sources current to the build date and will drift; reconfirm against the live guidelines.
            <div style={{marginTop:8,fontFamily:"var(--mono)",fontSize:"10.5px",letterSpacing:".04em",color:"var(--muted)"}}>Version {VERSION} · clinical review {REVIEWED} · {SYNDROMES.length} syndromes · {DIRECTED.reduce((n,g)=>n+g.items.length,0)} directed organisms · {REFS.length} primary sources</div>
          </div>
        </div>
      </main>
    </div>
  );
}
