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
import { CSS, CSS2, CSS3, CSS4, CSS5, CSS_W10 } from "./styles/app-styles";
import { KINETIC } from "./styles/kinetic-type";
import { MICRO } from "./styles/microinteractions";
import { GLASS } from "./styles/glass";
import { CHOREOGRAPHY } from "./styles/choreography";
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

  /* ====================================================================
     WAVE 12 · AMBIENT RESPONSE CHOREOGRAPHY
     ====================================================================
     Six (+ one cursor-trail) ambient moves that extend the Wave 9–11
     cursor-spotlight + mesh-blob vocabulary into the relationships
     *between* elements. Every move is gated by `prefers-reduced-motion`
     and (where it matters) `pointer: coarse` — the listeners short-
     circuit on those configurations so attributes never get written.
     The CSS counterparts live in `src/styles/choreography.js`. */

  /* ---- CH1 · Focus-mode dimming on sibling .rx-card-interactive ----
     Delegated mouseover/mouseout listener walks `closest(".rx-card-
     interactive")` and toggles `data-focus-dim="sibling"` on the
     hovered card's same-parent siblings that are also interactive
     cards. The CSS in choreography.js ducks their opacity + saturation
     so the hovered surface "pops" by contrast — no scale, no shift,
     just visual focus. Reduced-motion / coarse-pointer short-circuit. */
  useEffect(() => {
    if(typeof window === "undefined" || !window.matchMedia) return undefined;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    if(window.matchMedia("(pointer: coarse)").matches) return undefined;
    let dimmedSet = [];
    const clearAll = () => {
      for(let i = 0; i < dimmedSet.length; i++){
        dimmedSet[i].removeAttribute("data-focus-dim");
      }
      dimmedSet = [];
    };
    const onOver = (e) => {
      const t = e.target;
      if(!t || typeof t.closest !== "function") return;
      const card = t.closest(".rx-card-interactive");
      if(!card){
        clearAll();
        return;
      }
      const parent = card.parentElement;
      if(!parent){ clearAll(); return; }
      // Collect same-tier interactive siblings only.
      const siblings = parent.querySelectorAll(":scope > .rx-card-interactive");
      // If the hovered card matches an already-active set, no churn.
      let needsUpdate = false;
      if(dimmedSet.length !== siblings.length - 1) needsUpdate = true;
      else {
        for(let i = 0; i < dimmedSet.length; i++){
          if(dimmedSet[i] === card){ needsUpdate = true; break; }
        }
      }
      if(!needsUpdate) return;
      clearAll();
      for(let i = 0; i < siblings.length; i++){
        const s = siblings[i];
        if(s === card) continue;
        s.setAttribute("data-focus-dim", "sibling");
        dimmedSet.push(s);
      }
    };
    const onOut = (e) => {
      const to = e.relatedTarget;
      if(!to || typeof to.closest !== "function" || !to.closest(".rx-card-interactive")){
        clearAll();
      }
    };
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });
    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      clearAll();
    };
  }, []);

  /* ---- CH3 · Scene-break pulse on section-arrival via scroll ----
     A single scroll listener (rAF-coalesced) checks every .rx-section
     against the viewport. The first time a section's top crosses an
     entry line ~30% down the viewport, the section gets
     `data-just-entered="true"` for 700ms — the SectionArtwork in the
     corner pulses cyan via the CH3 keyframe. One-shot per section per
     page-load. Gated by reduced-motion. */
  useEffect(() => {
    if(typeof window === "undefined" || !window.matchMedia) return undefined;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const entered = new WeakSet();
    let rafId = 0;
    let pending = false;
    const tick = () => {
      rafId = 0;
      pending = false;
      const sections = document.querySelectorAll(".rx-section");
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const line = vh * 0.30;
      for(let i = 0; i < sections.length; i++){
        const sec = sections[i];
        if(entered.has(sec)) continue;
        const r = sec.getBoundingClientRect();
        // Top edge has crossed the entry line, AND section is still in view.
        if(r.top <= line && r.bottom > 0){
          entered.add(sec);
          sec.setAttribute("data-just-entered", "true");
          // Clear after one pulse cycle.
          window.setTimeout(() => {
            sec.removeAttribute("data-just-entered");
          }, 700);
        }
      }
    };
    const onScroll = () => {
      if(pending) return;
      pending = true;
      rafId = window.requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // Also run once on mount so above-the-fold sections settle without a pulse
    // (they're added to the entered set silently — no flash).
    const sections = document.querySelectorAll(".rx-section");
    const vh = window.innerHeight || document.documentElement.clientHeight;
    for(let i = 0; i < sections.length; i++){
      const r = sections[i].getBoundingClientRect();
      if(r.top < vh * 0.30) entered.add(sections[i]);
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      if(rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  /* ---- CH4 · Idle-state ambient glow + CH7 · CTA cursor-trail ----
     One mousemove listener serves both behaviors:
       · CH4 toggles `<html data-user-idle="true">` after 8s of
         stillness. CSS intensifies mesh-blob opacity + saturation.
         Removed instantly on next mousemove.
       · CH7 paints a soft cyan trail on any .rx-chrome-cta whose
         center is within 80px of the cursor — writes --trail-x,
         --trail-y, --trail-alpha as CSS custom properties on the
         button, and toggles data-trail-active so the ::before layer
         lights up. Both moves are rAF-coalesced into a single frame.
     Gated by reduced-motion + coarse-pointer. */
  useEffect(() => {
    if(typeof window === "undefined" || !window.matchMedia) return undefined;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    if(window.matchMedia("(pointer: coarse)").matches) return undefined;
    const IDLE_MS = 8000;
    const TRAIL_RANGE = 80;
    const root = document.documentElement;
    let idleTimer = 0;
    let trailActive = []; // CTAs currently lit
    let rafId = 0;
    let pendingEv = null;
    const clearTrails = () => {
      for(let i = 0; i < trailActive.length; i++){
        const el = trailActive[i];
        el.removeAttribute("data-trail-active");
        el.style.removeProperty("--trail-x");
        el.style.removeProperty("--trail-y");
        el.style.removeProperty("--trail-alpha");
      }
      trailActive = [];
    };
    const apply = () => {
      rafId = 0;
      const e = pendingEv;
      pendingEv = null;
      if(!e) return;
      // CH7 — recompute CTA trail every frame the mouse moves.
      const ctas = document.querySelectorAll(".rx-chrome-cta");
      const nextActive = [];
      for(let i = 0; i < ctas.length; i++){
        const el = ctas[i];
        const r = el.getBoundingClientRect();
        if(r.width === 0 || r.height === 0) continue;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        // Quick reject — bounding-box-expanded test before sqrt.
        if(Math.abs(dx) > r.width / 2 + TRAIL_RANGE) { if(el.hasAttribute("data-trail-active")){ el.removeAttribute("data-trail-active"); el.style.removeProperty("--trail-alpha"); } continue; }
        if(Math.abs(dy) > r.height / 2 + TRAIL_RANGE){ if(el.hasAttribute("data-trail-active")){ el.removeAttribute("data-trail-active"); el.style.removeProperty("--trail-alpha"); } continue; }
        // Distance to the CTA's edge — approximate via center distance
        // minus half-diagonal. Negative inside CTA → full alpha.
        const dist = Math.hypot(dx, dy);
        const half = Math.hypot(r.width, r.height) / 2;
        const edge = Math.max(0, dist - half);
        if(edge > TRAIL_RANGE){
          if(el.hasAttribute("data-trail-active")){
            el.removeAttribute("data-trail-active");
            el.style.removeProperty("--trail-alpha");
          }
          continue;
        }
        const alpha = (TRAIL_RANGE - edge) / TRAIL_RANGE; // 0..1
        // Local coords inside the button for the radial origin.
        const lx = e.clientX - r.left;
        const ly = e.clientY - r.top;
        el.style.setProperty("--trail-x", lx + "px");
        el.style.setProperty("--trail-y", ly + "px");
        el.style.setProperty("--trail-alpha", alpha.toFixed(3));
        if(!el.hasAttribute("data-trail-active")) el.setAttribute("data-trail-active", "true");
        nextActive.push(el);
      }
      trailActive = nextActive;
    };
    const onMove = (e) => {
      // CH4 — any movement wakes the surface.
      if(root.getAttribute("data-user-idle") === "true"){
        root.removeAttribute("data-user-idle");
      }
      if(idleTimer) window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        root.setAttribute("data-user-idle", "true");
      }, IDLE_MS);
      // CH7 — schedule a single rAF to update trails.
      pendingEv = e;
      if(rafId) return;
      rafId = window.requestAnimationFrame(apply);
    };
    const onLeave = () => {
      clearTrails();
    };
    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave, { passive: true });
    // Start idle countdown immediately so the surface drifts into the idle
    // state even if the user never moves the cursor on first load.
    idleTimer = window.setTimeout(() => {
      root.setAttribute("data-user-idle", "true");
    }, IDLE_MS);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      if(idleTimer) window.clearTimeout(idleTimer);
      if(rafId) window.cancelAnimationFrame(rafId);
      root.removeAttribute("data-user-idle");
      clearTrails();
    };
  }, []);

  /* ---- CH6 · Section-arrival drift on smooth-scroll target ----
     A delegated click listener watches anchor links (#section-id) and
     buttons carrying [data-w12-scroll-target]. When fired, it locates
     the destination .rx-section (either by id or data-toc-section) and
     stamps `data-just-arrived="true"` for 1200ms — the CSS in
     choreography.js drives the MeshWash blobs through a 1.2s arrival
     drift animation before settling. Reduced-motion short-circuits. */
  useEffect(() => {
    if(typeof window === "undefined" || !window.matchMedia) return undefined;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const arrive = (target) => {
      if(!target) return;
      const sec = target.classList && target.classList.contains("rx-section")
        ? target
        : (target.closest && target.closest(".rx-section"));
      if(!sec) return;
      sec.setAttribute("data-just-arrived", "true");
      window.setTimeout(() => sec.removeAttribute("data-just-arrived"), 1200);
    };
    const resolveByHrefOrAttr = (el) => {
      // Explicit data-w12-scroll-target="<id>"
      const attr = el.getAttribute && el.getAttribute("data-w12-scroll-target");
      if(attr){
        return document.getElementById(attr)
          || document.querySelector('[data-toc-section="' + attr + '"]');
      }
      // Hash anchor #id
      const href = el.getAttribute && el.getAttribute("href");
      if(href && href.startsWith("#") && href.length > 1){
        const id = href.slice(1);
        return document.getElementById(id)
          || document.querySelector('[data-toc-section="' + id + '"]');
      }
      return null;
    };
    const onClick = (e) => {
      const t = e.target;
      if(!t || typeof t.closest !== "function") return;
      // MiniTOC / spine chips dispatch through anchor or data-attr;
      // we don't preventDefault — the existing scroll handler runs.
      const trigger = t.closest("a[href^='#'], [data-w12-scroll-target]");
      if(!trigger) return;
      const dest = resolveByHrefOrAttr(trigger);
      if(dest) arrive(dest);
    };
    document.addEventListener("click", onClick, { passive: true });
    return () => document.removeEventListener("click", onClick);
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
  const styleTag = <style>{CSS + CSS2 + CSS3 + CSS4 + CSS5 + KINETIC + MICRO + GLASS + CSS_W10 + CHOREOGRAPHY}</style>;
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
  /* W11 · component-scoped chrome overlay for the command palette.
     Targets only [data-w11-cmd]; all base .rx-cmd styles still apply,
     these declarations layer the Wave 9 glass-diffuse fill, the cyan
     top-strip, asymmetric 22/4 radius, and per-item glow lift. The
     overlay never touches the global stylesheet. */
  const cmdPaletteStyles = `
    [data-w11-cmd] .rx-cmd {
      background: linear-gradient(135deg, rgba(255,255,255,0.86) 0%, rgba(245,250,253,0.74) 100%) !important;
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid var(--ox-line, var(--line)) !important;
      border-radius: 22px 4px 22px 4px !important;
      box-shadow:
        var(--shadow-e5, 0 28px 60px -16px rgba(11,15,20,0.45)),
        inset 0 1px 0 rgba(255,255,255,0.55) !important;
      overflow: hidden;
      position: relative;
    }
    [data-w11-cmd] .rx-cmd::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: linear-gradient(90deg,
        var(--neon-cyan, var(--ox)),
        var(--electric-blue, var(--ox)),
        var(--neon-cyan, var(--ox)));
      pointer-events: none;
      z-index: 2;
    }
    [data-w11-cmd] .rx-cmd-head {
      padding-top: 18px;
    }
    [data-w11-cmd] .rx-cmd-head input:focus {
      outline: none;
    }
    [data-w11-cmd] .rx-cmd-head:focus-within input {
      color: var(--ink);
    }
    [data-w11-cmd] .rx-cmd-head:focus-within {
      box-shadow:
        inset 0 -1px 0 0 var(--neon-cyan, var(--ox)),
        0 0 22px -6px color-mix(in srgb, var(--neon-cyan, var(--ox)) 45%, transparent);
    }
    [data-w11-cmd] .rx-cmd-esc {
      background: linear-gradient(180deg,
        var(--ox-deep, #0B0F14) 0%,
        var(--ox, #1F2937) 100%) !important;
      color: rgba(255,255,255,0.85) !important;
      border: 1px solid color-mix(in srgb, var(--ox-deep, var(--ox)) 70%, transparent) !important;
      border-radius: 6px 2px 6px 2px !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.18),
        0 0 8px -3px color-mix(in srgb, var(--neon-cyan, var(--ox)) 45%, transparent) !important;
    }
    [data-w11-cmd] .rx-cmd-item {
      border-radius: 9px 3px 9px 3px !important;
      transition: background .15s ease, box-shadow .18s ease, border-left-color .15s ease, transform .12s ease;
      border-left: 3px solid transparent;
      padding-left: 8px !important;
    }
    [data-w11-cmd] .rx-cmd-item:hover {
      background: color-mix(in srgb, var(--neon-cyan, var(--ox)) 8%, var(--paper)) !important;
      box-shadow:
        0 6px 14px -8px color-mix(in srgb, var(--neon-cyan, var(--ox)) 50%, transparent),
        inset 0 1px 0 rgba(255,255,255,0.4);
      transform: translateY(-1px);
    }
    [data-w11-cmd] .rx-cmd-item[data-active="true"] {
      background: color-mix(in srgb, var(--neon-cyan, var(--ox)) 10%, var(--paper)) !important;
      border-left-color: var(--neon-cyan, var(--ox));
      box-shadow:
        0 6px 14px -8px color-mix(in srgb, var(--neon-cyan, var(--ox)) 60%, transparent),
        inset 0 1px 0 rgba(255,255,255,0.4);
    }
    [data-w11-cmd] .rx-cmd-ic {
      background: linear-gradient(135deg,
        var(--neon-cyan, var(--ox)) 0%,
        var(--electric-blue, var(--ox)) 100%) !important;
      color: #fff !important;
      border-radius: 8px 3px 8px 3px !important;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.30),
        0 0 10px -2px color-mix(in srgb, var(--neon-cyan, var(--ox)) 55%, transparent) !important;
    }
    [data-w11-cmd] .rx-cmd-item[data-active="true"] .rx-cmd-ic {
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.30),
        0 0 14px -2px color-mix(in srgb, var(--neon-cyan, var(--ox)) 75%, transparent) !important;
    }
    @media (prefers-reduced-motion: reduce) {
      [data-w11-cmd] .rx-cmd-item,
      [data-w11-cmd] .rx-cmd { transition: none !important; }
      [data-w11-cmd] .rx-cmd-item:hover { transform: none !important; }
    }
  `;
  const cmdPaletteEl = cmdOpen ? (
    <div className="rx-cmd-overlay" data-w11-cmd onClick={()=>setCmdOpen(false)}>
      <style>{cmdPaletteStyles}</style>
      <div className="rx-cmd" onClick={e=>e.stopPropagation()}>
        <div className="rx-cmd-head">
          <Search size={18} color="var(--neon-cyan, var(--muted))" />
          <input autoFocus value={cmdQ} onChange={e=>{setCmdQ(e.target.value);setCmdIdx(0);}} placeholder="Jump to a syndrome, drug, organism, or section…" />
          <span className="rx-cmd-esc">ESC</span>
        </div>
        <div className="rx-cmd-list">
          {cmdResults.length === 0 && (
            /* W10 · palette empty state — italic-serif headline +
               hint with cyan-soft glyph; aria-live so the SR users
               hear "no matches" without polling the empty list. */
            <div
              className="rx-cmd-empty"
              role="status"
              aria-live="polite"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "28px 16px 24px",
                textAlign: "center",
              }}
            >
              <div
                aria-hidden
                style={{
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 64,
                  lineHeight: 0.85,
                  color: "var(--ox-soft, var(--neon-cyan-soft))",
                  marginBottom: 4,
                }}
              >
                ?
              </div>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "var(--ink)",
                  marginBottom: 2,
                }}
              >
                No matches for “{cmdQ}”
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10.5,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}
              >
                Try a syndrome, drug, organism, or section
              </div>
            </div>
          )}
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
      <style>{CSS + CSS2 + CSS3 + CSS4 + CSS5 + KINETIC + MICRO + GLASS + CSS_W10 + CHOREOGRAPHY}</style>

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
