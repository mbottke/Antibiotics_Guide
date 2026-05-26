/* spectrum · self-contained antibiogram matrix (data + chart + styles, IIFE).
   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { BookOpen, Crosshair, Expand, Eye, EyeOff, Filter, Info, Layers, Microscope, Minimize2, RotateCcw, Search, Star, X } from "lucide-react";
import { ORGS, ORG_BY_ID } from "../data/organisms.js";
import { useReducedMotion } from "../components/util/useReducedMotion.js";

/* W12 · Hover-delay hook ----------------------------------------------
   200/240/80 ms enter-leave delays for the cell scout tooltip. Returns
   a hovered-key string and stable enter/leave callbacks. The delays
   are bypassed when reduced motion is preferred — hover-in still
   reveals the tooltip but with no animation; hover-out clears
   immediately. Coarse-pointer devices (no real hover) get an instant
   path because mouseenter doesn't reliably fire there. */
function useHoverDelay(opts) {
  const enterMs = opts && opts.enterMs != null ? opts.enterMs : 240;
  const leaveMs = opts && opts.leaveMs != null ? opts.leaveMs : 80;
  const [key, setKey] = useState(null);
  const tRef = useRef(null);
  const clear = useCallback(() => {
    if(tRef.current) { clearTimeout(tRef.current); tRef.current = null; }
  }, []);
  const enter = useCallback((k) => {
    clear();
    if(enterMs <= 0) { setKey(k); return; }
    tRef.current = setTimeout(() => { setKey(k); tRef.current = null; }, enterMs);
  }, [enterMs, clear]);
  const leave = useCallback(() => {
    clear();
    if(leaveMs <= 0) { setKey(null); return; }
    tRef.current = setTimeout(() => { setKey(null); tRef.current = null; }, leaveMs);
  }, [leaveMs, clear]);
  useEffect(() => () => clear(), [clear]);
  return { key, enter, leave };
}

/* ============================================================================
   PORTED 49x49 SPECTRUM-OF-ACTIVITY CHART (self-contained, .sx- namespaced)
   Wrapped in a closure so its ORGS/CLASSES/Glyph/etc. cannot collide with the
   guide's module-level identifiers. Returns a controlled bundle: the component
   plus the read-only vocabularies/activity matrix the cross-tab drawers and the
   ORG_XWALK integrity check consume. This is a deliberate export, not a leak —
   the inner identifiers (ORGS, CLASSES, Glyph, …) stay scoped to the closure.
   ========================================================================== */
const SPECTRUM = (function(){
const CSS1 = `
/* Tokens (incl. --star-soft and the --sg-* supergroup tints) come from :root via
   src/styles/tokens.css. This block keeps only .sx-root's applied base styles. */
.sx-root{
  font-family:var(--sans); color:var(--ink); background:var(--paper);
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility; line-height:1.55; min-height:100%;
}
.sx-root *,.sx-root *::before,.sx-root *::after{box-sizing:border-box;}
.sx-mono{font-family:var(--mono); font-variant-numeric:tabular-nums;}
.sx-root :focus-visible{outline:2px solid var(--ox); outline-offset:2px; border-radius:3px;}
@media (prefers-reduced-motion: reduce){ .sx-root *{transition-duration:.01ms!important; animation-duration:.01ms!important;} }
.sx-wrap{max-width:1320px; margin:0 auto; padding:0 20px;}

/* header */
.sx-header{background:var(--panel); border-bottom:1px solid var(--line);}
.sx-headrow{display:flex; align-items:flex-start; gap:14px; padding:18px 0 16px;}
.sx-mark{width:40px;height:40px;border-radius:10px;background:var(--ox);color:#fff;display:flex;align-items:center;justify-content:center;flex:0 0 auto;}
.sx-kicker{font-family:var(--mono); font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:var(--ox); font-weight:600;}
.sx-title{font-family:var(--serif); font-weight:600; font-size:25px; letter-spacing:-.015em; margin:1px 0 0; line-height:1.06;}
.sx-sub{color:var(--muted); font-size:12.5px; margin:4px 0 0; max-width:88ch; line-height:1.5;}
.sx-disc{display:flex; gap:9px; align-items:flex-start; background:var(--ox-soft); border:1px solid var(--ox-line); border-radius:9px; padding:9px 13px; margin:2px 0 0; font-size:12px; color:var(--ox-deep); line-height:1.5;}
.sx-disc svg{flex:0 0 auto; margin-top:1px;}

/* controls bar */
.sx-controls{position:sticky; top:0; z-index:40; background:rgba(251,250,248,.96); backdrop-filter:saturate(140%) blur(8px); -webkit-backdrop-filter:saturate(140%) blur(8px); border-bottom:1px solid var(--line); padding:11px 0;}
.sx-ctrlrow{display:flex; align-items:center; gap:10px 14px; flex-wrap:wrap;}
.sx-searchwrap{position:relative; display:flex; align-items:center;}
.sx-search{font-family:var(--sans); font-size:13px; border:1px solid var(--line); background:var(--panel); border-radius:999px; padding:7px 30px 7px 32px; width:210px; color:var(--ink); transition:border-color .15s, box-shadow .15s;}
.sx-search:focus{border-color:var(--ox); outline:none; box-shadow:0 0 0 3px var(--ox-softer);}
.sx-search::placeholder{color:var(--faint);}
.sx-search-i{position:absolute; left:11px; color:var(--muted); display:flex; pointer-events:none;}
.sx-search-x{position:absolute; right:7px; background:none; border:none; cursor:pointer; color:var(--muted); padding:3px; display:flex;}
.sx-ctrl-lab{font-family:var(--mono); font-size:9.5px; letter-spacing:.13em; text-transform:uppercase; color:var(--muted); font-weight:600; display:flex; align-items:center; gap:6px;}
.sx-pillrow{display:flex; gap:5px; flex-wrap:wrap;}
.sx-pill{font-size:11.5px; font-weight:600; padding:5px 11px; border-radius:999px; border:1px solid var(--line); background:var(--panel); color:var(--ink2); cursor:pointer; transition:all .12s; white-space:nowrap; display:inline-flex; align-items:center; gap:6px;}
.sx-pill:hover{border-color:var(--ox-line);}
.sx-pill[data-on="true"]{background:var(--ox); color:#fff; border-color:var(--ox);}
.sx-pill .sw{width:8px;height:8px;border-radius:50%;}
.sx-toggle{font-size:11.5px; font-weight:600; padding:5px 11px; border-radius:999px; border:1px solid var(--line); background:var(--panel); color:var(--ink2); cursor:pointer; display:inline-flex; align-items:center; gap:6px; transition:all .12s;}
.sx-toggle[data-on="true"]{background:var(--ink); color:#fff; border-color:var(--ink);}
.sx-toggle svg{width:13px;height:13px;}
.sx-reset{margin-left:auto; font-size:11.5px; font-weight:600; padding:5px 11px; border-radius:999px; border:1px solid var(--line); background:var(--panel); color:var(--ink2); cursor:pointer; display:inline-flex; align-items:center; gap:6px;}
.sx-reset:hover{border-color:var(--ox); color:var(--ox);}

/* legend */
.sx-legend{background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:14px 16px; margin:18px 0 14px;}
.sx-legtitle{font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); font-weight:600; margin:0 0 11px; display:flex; align-items:center; gap:8px;}
.sx-leggrid{display:grid; grid-template-columns:repeat(auto-fill,minmax(232px,1fr)); gap:9px 20px;}
.sx-legitem{display:flex; align-items:flex-start; gap:10px; font-size:12px; color:var(--ink2); line-height:1.4;}
.sx-legitem b{color:var(--ink); font-weight:600;}
.sx-legitem .sx-gly{flex:0 0 auto; margin-top:1px;}
.sx-legmeta{display:flex; flex-wrap:wrap; gap:8px 18px; margin-top:12px; padding-top:11px; border-top:1px solid var(--line2); font-size:11.5px; color:var(--muted);}
.sx-legmeta .mi{display:flex; align-items:center; gap:7px;}
.sx-railsamp{width:11px;height:13px;border-radius:2px;flex:0 0 auto;}
.sx-cidal{width:13px;height:13px;border-radius:50%;border:2px solid var(--ink);flex:0 0 auto;}
.sx-static{width:13px;height:13px;border-radius:50%;border:2px dashed var(--muted);flex:0 0 auto;}
`;

const CSS2 = `
/* ---------------- MATRIX ---------------- */
.sx-mxwrap{position:relative; overflow:auto; border:1px solid var(--line); border-radius:12px; background:var(--panel); max-height:78vh; -webkit-overflow-scrolling:touch;}
.sx-mx{border-collapse:separate; border-spacing:0; font-size:12px; width:100%;}
.sx-mx th,.sx-mx td{padding:0; text-align:center;}

/* top-left frozen corner */
.sx-corner{position:sticky; left:0; top:0; z-index:8; background:var(--panel); border-right:2px solid var(--line); border-bottom:1px solid var(--line); text-align:left; vertical-align:bottom; min-width:208px;}
.sx-cornlab{padding:0 12px 9px; font-family:var(--mono); font-size:9.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); font-weight:600;}
.sx-cornlab b{color:var(--ink); display:block; font-size:11px; letter-spacing:0; text-transform:none; font-family:var(--sans);}

/* supergroup header row (top, sticky) */
.sx-sghead{}
.sx-sgth{position:sticky; top:0; z-index:6; height:30px; font-family:var(--mono); font-size:9.5px; letter-spacing:.1em; text-transform:uppercase; font-weight:700; padding:7px 6px 6px; border-bottom:2px solid currentColor; border-left:1px solid var(--line2); white-space:nowrap;}

/* organism header row (sticky, below supergroup) */
.sx-orghead{}
.sx-orgth{position:sticky; top:30px; z-index:5; vertical-align:bottom; border-bottom:1px solid var(--line); border-left:1px solid var(--line2); background:var(--panel);}
.sx-orgbtn{border:none; background:none; cursor:pointer; font-family:var(--sans); font-weight:600; font-size:11px; color:var(--ink2); padding:8px 2px 7px; writing-mode:vertical-rl; transform:rotate(180deg); height:158px; line-height:1.12; white-space:nowrap; width:100%; transition:color .12s;}
.sx-orgbtn:hover{color:var(--ox);}
.sx-orgbtn em{font-style:italic;}
.sx-orgbtn small{font-weight:400; color:var(--muted); font-size:9.5px;}
.sx-col-on .sx-orgbtn{color:var(--ox); font-weight:700;}
.sx-col-on{background:var(--ox-softer);}

/* class band row */
.sx-classrow td{ text-align:left; }
.sx-classband{position:sticky; left:0; z-index:3; display:flex; align-items:center; gap:9px; padding:6px 12px 5px; background:var(--line3); border-top:1px solid var(--line); border-bottom:1px solid var(--line2);}
.sx-classname{font-family:var(--mono); font-size:9.5px; letter-spacing:.11em; text-transform:uppercase; color:var(--ox); font-weight:700;}
.sx-classmech{font-size:10.5px; color:var(--muted); font-weight:500;}
.sx-classrail{width:9px;height:14px;border-radius:2px;flex:0 0 auto;}

/* agent label cell (frozen left) */
.sx-lab{position:sticky; left:0; z-index:2; background:var(--panel); border-right:2px solid var(--line); border-top:1px solid var(--line2); text-align:left; min-width:208px; max-width:240px;}
.sx-labinner{display:flex; align-items:stretch; gap:0;}
.sx-labrail{width:4px; flex:0 0 auto;}
.sx-labtx{padding:7px 10px 7px 9px; flex:1; min-width:0;}
.sx-labbtn{border:none; background:none; cursor:pointer; text-align:left; padding:0; width:100%; font-family:var(--sans);}
.sx-labname{font-weight:600; font-size:12.5px; color:var(--ink); line-height:1.18; display:flex; align-items:center; gap:6px;}
.sx-labname:hover{color:var(--ox);}
.sx-killmark{flex:0 0 auto;}
.sx-labsub{font-size:10px; color:var(--muted); font-family:var(--mono); letter-spacing:.01em; margin-top:1px; line-height:1.25;}
.sx-labbadges{display:flex; gap:3px; margin-top:3px; flex-wrap:wrap;}
.sx-rtbadge{font-family:var(--mono); font-size:8.5px; font-weight:600; letter-spacing:.05em; padding:1px 4px; border-radius:3px; background:var(--line2); color:var(--muted);}
.sx-rtbadge.po{background:var(--green-soft); color:var(--green);}

/* body cells */
.sx-mx tbody tr{border:none;}
.sx-cell{height:30px; border-top:1px solid var(--line2); border-left:1px solid var(--line2); transition:background .08s;}
.sx-cell.xrow{background:var(--ox-softer);}
.sx-cell.xcol{background:var(--ox-softer);}
.sx-cell.xhit{background:var(--ox-soft);}
.sx-row-on .sx-cell{background:var(--ox-softer);}
.sx-row-on .sx-lab{background:var(--ox-soft);}
.sx-cell.dim{opacity:.16;}

/* glyphs — fill fraction encodes activity magnitude */
.sx-gly{display:inline-block; width:17px; height:17px; border-radius:50%; position:relative; vertical-align:middle;}
.sx-gly.lv-first{background:var(--ox); border:1px solid var(--ox);}
.sx-gly.lv-sec{background:conic-gradient(var(--ox) 0 50%, var(--ox-softer) 0); border:1.5px solid var(--ox-line);}
.sx-gly.lv-var{background:conic-gradient(var(--ox) 0 25%, var(--ox-softer) 0); border:1.5px dashed var(--ox-line);}
.sx-gly.lv-none{background:var(--paper); border:1.5px solid var(--line);}
.sx-gly.lv-intr{background:var(--paper); border:1.5px solid var(--line);}
.sx-gly.lv-intr::after{content:""; position:absolute; left:50%; top:1px; bottom:1px; width:1.5px; background:var(--faint); transform:rotate(45deg); transform-origin:center;}
.sx-gly.lv-na{width:10px;height:2px;border-radius:1px;background:var(--line); }
.sx-gly .sx-star{position:absolute; top:-5px; right:-6px; color:var(--star); display:flex; filter:drop-shadow(0 0 1px #fff);}
.sx-gly.lv-na .sx-star{display:none;}

/* footnotes */
.sx-fnwrap{margin:22px 0 0;}
.sx-h3{font-family:var(--serif); font-size:18px; font-weight:600; margin:26px 0 12px; display:flex; align-items:center; gap:9px; letter-spacing:-.01em;}
.sx-h3 .ic{color:var(--ox); display:flex;}
.sx-fngrid{display:grid; grid-template-columns:1fr 1fr; gap:12px;}
@media (max-width:820px){.sx-fngrid{grid-template-columns:1fr;}}
.sx-fncard{background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:13px 15px;}
.sx-fncard h4{margin:0 0 7px; font-size:12.5px; font-weight:700; color:var(--ink); display:flex; align-items:center; gap:7px;}
.sx-fncard h4 .n{font-family:var(--mono); font-size:10px; color:#fff; background:var(--ox); width:18px;height:18px;border-radius:50%; display:flex;align-items:center;justify-content:center; flex:0 0 auto;}
.sx-fncard p{margin:0; font-size:12px; color:var(--ink2); line-height:1.5;}
.sx-fncard p + p{margin-top:6px;}
.sx-fncard b{color:var(--ink); font-weight:600;}
.sx-fncard em{font-style:italic;}

.sx-srcwrap{margin-top:16px; background:var(--paper2); border:1px solid var(--line); border-radius:10px; padding:13px 16px;}
.sx-srcwrap .h{font-family:var(--mono); font-size:9.5px; letter-spacing:.13em; text-transform:uppercase; color:var(--muted); font-weight:600; margin-bottom:7px;}
.sx-srclist{display:flex; flex-wrap:wrap; gap:6px 8px;}
.sx-srctag{font-size:11px; color:var(--ink2); background:var(--panel); border:1px solid var(--line); border-radius:6px; padding:3px 8px;}
.sx-srctag b{color:var(--ox); font-weight:600;}

.sx-foot{margin:20px 0 60px; font-size:11px; color:var(--muted); line-height:1.6;}
.sx-foot b{color:var(--ink2);}

/* tooltip */
.sx-tip{position:fixed; z-index:90; pointer-events:none; max-width:300px; background:var(--ink); color:#fff; border-radius:9px; padding:9px 12px; font-size:12px; line-height:1.45; box-shadow:0 12px 30px -8px rgba(0,0,0,.4); transform:translate(-50%,-100%); margin-top:-10px;}
.sx-tip .tt-h{font-weight:700; font-size:12.5px; margin-bottom:2px;}
.sx-tip .tt-h em{font-style:italic;}
.sx-tip .tt-lv{font-family:var(--mono); font-size:9.5px; letter-spacing:.08em; text-transform:uppercase; color:#E9C6B8; font-weight:600;}
.sx-tip .tt-note{margin-top:5px; color:#EDE7DF; font-size:11.5px;}
.sx-tip::after{content:""; position:absolute; left:50%; bottom:-6px; transform:translateX(-50%); border:6px solid transparent; border-top-color:var(--ink); border-bottom:0;}

.sx-count{font-size:11.5px; color:var(--muted); margin:0 0 9px; font-family:var(--mono);}

@media print{
  .sx-controls,.sx-search,.sx-reset{display:none!important;}
  .sx-mxwrap{max-height:none; overflow:visible;}
  .sx-root{background:#fff;}
}

/* ============================================================
   Wave 9 W9 · SPECTRUM matrix creative chrome
   ----------------------------------------------------------
   Visual-only refresh — the data + cell semantics are PRESERVED.
   Every cell still resolves the same activity level, the row +
   column identity is unchanged, click and hover handlers are
   untouched. We layer:
     • Asymmetric 4/0/4/0 cell corners (very tight)
     • Iridescent gradient top border on column headers
     • Glass / frosted backdrop on row headers
     • Cyan halo for hovered row + column header pair
     • Inset shadow on cells carrying coverage (lv-first / lv-sec)
     • Neon light-ring upgrade to the coverage glyph
     • Mesh corner accent on the top-left frozen corner
   The new selectors are ADDITIVE — they share specificity with the
   existing .sx-* classes and inherit when the data model wins.
   ============================================================ */
.sx-cell{ border-radius:4px 0 4px 0; }
.sx-mx tbody tr td:first-child.sx-lab{ border-radius:0 12px 0 12px; }

/* Iridescent gradient border on column (organism) headers */
.sx-orgth{
  background-image: linear-gradient(180deg, var(--panel) 0, var(--panel) 100%),
                    linear-gradient(90deg, var(--neon-cyan, #00D4FF), var(--hot-magenta, #ff3b9a), var(--electric-lime, #a6e22e), var(--neon-cyan, #00D4FF));
  background-clip: padding-box, border-box;
  background-origin: padding-box, border-box;
  border-top: 1.5px solid transparent;
}
@media (prefers-reduced-motion: no-preference){
  .sx-orgth{ animation: sx-irid-shift 18s linear infinite; background-size: 100% 100%, 400% 100%; }
  @keyframes sx-irid-shift { 0% { background-position: 0 0, 0 0; } 100% { background-position: 0 0, 400% 0; } }
}

/* Frosted glass treatment on row (agent) labels */
.sx-lab{
  background: linear-gradient(180deg, rgba(252,251,248,0.86), rgba(252,251,248,0.74));
  backdrop-filter: saturate(140%) blur(8px);
  -webkit-backdrop-filter: saturate(140%) blur(8px);
}
.sx-row-on .sx-lab{
  background: linear-gradient(180deg, rgba(0,212,255,0.10), rgba(0,212,255,0.04));
  box-shadow: inset 3px 0 0 var(--neon-cyan, #00D4FF), 0 0 18px -6px var(--neon-cyan, #00D4FF);
}

/* Cyan halo for hovered/active column header (drug-name) */
.sx-orgth.sx-col-on{
  background: var(--neon-cyan-soft, rgba(0, 212, 255, 0.12));
  box-shadow: inset 0 -3px 0 var(--neon-cyan, #00D4FF), 0 0 18px -6px var(--neon-cyan, #00D4FF);
}
.sx-orgth.sx-col-on .sx-orgbtn{ color: var(--neon-cyan, var(--ox)); font-weight: 700; }

/* Subtle inset depression for cells with active coverage. We can't
   target a class on the cell from a CSS-only approach (the glyph
   level is rendered inside the cell as a child), so we use :has
   when available — graceful no-op otherwise. */
.sx-cell:has(.sx-gly.lv-first), .sx-cell:has(.sx-gly.lv-sec){
  box-shadow: inset 0 0 0 1px rgba(15, 76, 129, 0.06), inset 0 -2px 4px rgba(15, 76, 129, 0.08);
}

/* Neon light-ring upgrade for the first-line coverage glyph */
.sx-gly.lv-first{
  background: radial-gradient(circle at 50% 50%, var(--neon-cyan, var(--ox)) 0 35%, var(--ox) 36% 70%, transparent 71%);
  border: 2px solid transparent;
  background-clip: padding-box;
  box-shadow: 0 0 8px -1px var(--neon-cyan, var(--ox)), 0 0 0 1px rgba(0, 212, 255, 0.35);
}
.xhit .sx-gly.lv-first{
  box-shadow: 0 0 14px var(--neon-cyan, var(--ox)), 0 0 0 2px rgba(0, 212, 255, 0.6);
}

/* MeshWash corner accent — paints a soft cyan/magenta gradient in
   the top-left frozen corner where row + column headers meet. */
.sx-corner{
  background:
    radial-gradient(circle at 16px 16px, var(--neon-cyan-soft, rgba(0, 212, 255, 0.18)) 0%, transparent 60%),
    radial-gradient(circle at 80% 80%, rgba(255, 59, 154, 0.10) 0%, transparent 65%),
    var(--panel);
  border-radius: 12px 0 0 0;
}
.sx-corner::after{
  content:"";
  position: absolute;
  top: 4px; right: 4px;
  width: 14px; height: 14px;
  background: conic-gradient(from 0deg, var(--neon-cyan, var(--ox)), var(--hot-magenta, var(--ox)), var(--electric-lime, var(--ox)), var(--neon-cyan, var(--ox)));
  border-radius: 50%;
  opacity: 0.65;
  pointer-events: none;
}
.sx-corner{ position: sticky; }

/* ============================================================
   Wave 12 W12 · SPECTRUM interaction-depth chrome
   ----------------------------------------------------------
   Adds: click-to-lock cell crosshair, hover scout tooltip,
   Cmd/Ctrl multi-cell compare panel, legend chrome upgrade,
   per-column sparkline. All chrome — zero data changes. Every
   motion gated by prefers-reduced-motion below.
   ============================================================ */

/* Cell-lock — when a single cell is clicked we lock the cross-
   hair to that {row,col} pair. The locked cell carries a
   stronger cyan glow + persistent inset shadow. The "× clear"
   pill sits in its top-right corner. */
.sx-cell.cell-locked{
  position: relative;
  z-index: 1;
  background: rgba(0, 212, 255, 0.18);
  box-shadow:
    inset 0 0 0 1.5px var(--neon-cyan, var(--ox)),
    inset 0 0 14px -2px rgba(0, 212, 255, 0.45),
    0 0 22px -4px var(--neon-cyan, var(--ox));
}
.sx-cell-clear{
  position: absolute;
  top: -6px; right: -6px;
  width: 16px; height: 16px;
  border-radius: 50%;
  border: 1px solid var(--neon-cyan, var(--ox));
  background: var(--panel);
  color: var(--neon-cyan, var(--ox));
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer;
  padding: 0; line-height: 0;
  box-shadow: 0 0 8px -2px var(--neon-cyan, var(--ox));
  z-index: 2;
}
.sx-cell-clear:hover{ background: var(--neon-cyan, var(--ox)); color: var(--panel); }
@media (prefers-reduced-motion: no-preference){
  .sx-cell.cell-locked{ animation: sx-cell-pulse 1800ms ease-in-out infinite; }
  @keyframes sx-cell-pulse {
    0%, 100% { box-shadow: inset 0 0 0 1.5px var(--neon-cyan, var(--ox)), inset 0 0 14px -2px rgba(0, 212, 255, 0.45), 0 0 22px -4px var(--neon-cyan, var(--ox)); }
    50%      { box-shadow: inset 0 0 0 1.5px var(--neon-cyan, var(--ox)), inset 0 0 20px -2px rgba(0, 212, 255, 0.6),  0 0 30px -4px var(--neon-cyan, var(--ox)); }
  }
}

/* Scout tooltip — 200×88px glass-diffuse, fixed-positioned
   above (or below) the hovered cell. Decoupled from the
   existing follow-cursor tooltip (.sx-tip) so both can coexist
   without overlap; the scout sits anchored to the cell. */
.sx-scout{
  position: fixed;
  z-index: 91;
  width: 220px;
  min-height: 88px;
  padding: 10px 12px;
  border-radius: 14px 4px 14px 4px;
  background: rgba(252, 251, 248, 0.78);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  border: 1px solid rgba(0, 212, 255, 0.35);
  box-shadow: 0 18px 40px -10px rgba(15, 76, 129, 0.28), 0 0 22px -8px var(--neon-cyan, var(--ox));
  pointer-events: none;
  color: var(--ink);
  font-size: 11.5px; line-height: 1.45;
}
.sx-scout-h{ font-weight: 700; font-size: 12px; color: var(--ink); display: flex; align-items: center; gap: 6px; }
.sx-scout-h em{ font-style: italic; color: var(--ink2); font-weight: 600; }
.sx-scout-h .sx-scout-star{ color: var(--star, #d4a017); flex: 0 0 auto; }
.sx-scout-meta{ margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px 8px; font-family: var(--mono); font-size: 10px; letter-spacing: .04em; color: var(--muted); text-transform: uppercase; }
.sx-scout-meta b{ color: var(--neon-cyan, var(--ox)); font-weight: 700; }
.sx-scout-note{ margin-top: 6px; color: var(--ink2); font-size: 11px; }
@media (prefers-reduced-motion: no-preference){
  .sx-scout{ animation: sx-scout-in 180ms ease-out; }
  @keyframes sx-scout-in {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
}

/* Multi-cell compare dock — bottom-right glass panel that
   accumulates Cmd/Ctrl-clicked cells (max 4). */
.sx-cmpdock{
  position: fixed;
  right: 18px; bottom: 18px;
  z-index: 92;
  width: 280px;
  padding: 12px 14px 10px;
  border-radius: 14px 4px 14px 4px;
  background: rgba(252, 251, 248, 0.82);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  border: 1px solid rgba(0, 212, 255, 0.40);
  box-shadow: 0 24px 50px -12px rgba(15, 76, 129, 0.32), 0 0 28px -6px var(--neon-cyan, var(--ox));
  color: var(--ink);
}
.sx-cmpdock-h{
  display: flex; align-items: center; justify-content: space-between;
  font-family: var(--mono); font-size: 9.5px; letter-spacing: .14em;
  text-transform: uppercase; color: var(--neon-cyan, var(--ox)); font-weight: 700;
  margin-bottom: 8px;
}
.sx-cmpdock-h button{
  background: none; border: none; cursor: pointer; color: var(--muted);
  padding: 2px; display: flex; align-items: center;
}
.sx-cmpdock-h button:hover{ color: var(--ink); }
.sx-cmpdock-list{ display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.sx-cmpdock-item{
  display: flex; align-items: center; justify-content: space-between;
  gap: 6px; padding: 5px 8px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 6px 2px 6px 2px;
  font-size: 11.5px;
}
.sx-cmpdock-item .sx-cmpdock-pair{ flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--ink); }
.sx-cmpdock-item em{ font-style: italic; color: var(--ink2); }
.sx-cmpdock-item button{
  background: none; border: none; cursor: pointer; color: var(--muted); padding: 0; display: flex;
}
.sx-cmpdock-item button:hover{ color: var(--red, #c0392b); }
.sx-cmpdock-cta{
  width: 100%;
  font-size: 11.5px; font-weight: 700;
  padding: 7px 10px;
  border-radius: 7px 2px 7px 2px;
  border: 1px solid var(--neon-cyan, var(--ox));
  background: linear-gradient(135deg, var(--ox-deep, #0B0F14) 0%, var(--ox, #1F2937) 60%, var(--neon-cyan, #00D4FF) 180%);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 14px -4px rgba(0, 212, 255, 0.45);
}
.sx-cmpdock-cta:hover{ box-shadow: 0 6px 18px -4px rgba(0, 212, 255, 0.65); }
.sx-cmpdock-cta:disabled{ opacity: .5; cursor: not-allowed; }
@media (prefers-reduced-motion: no-preference){
  .sx-cmpdock{ animation: sx-cmpdock-in 220ms ease-out; }
  @keyframes sx-cmpdock-in {
    from { opacity: 0; transform: translateY(8px) scale(.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
}

/* Legend chrome upgrade — wrap the existing legend in the
   shared glass-diffuse + 14/4 asymmetric radius. Severity
   dots get a per-tone light-ring. */
.sx-legend{
  background: linear-gradient(180deg, rgba(252, 251, 248, 0.92), rgba(252, 251, 248, 0.78));
  backdrop-filter: saturate(160%) blur(10px);
  -webkit-backdrop-filter: saturate(160%) blur(10px);
  border-radius: 14px 4px 14px 4px;
  border: 1px solid rgba(0, 212, 255, 0.22);
  box-shadow: 0 8px 24px -10px rgba(15, 76, 129, 0.20);
}
.sx-legend .sx-legitem .sx-gly{
  box-shadow: 0 0 6px -1px var(--neon-cyan-soft, rgba(0, 212, 255, 0.35));
}
.sx-legend .sx-legitem .sx-gly.lv-first{
  box-shadow: 0 0 10px -1px var(--neon-cyan, var(--ox)), 0 0 0 1px rgba(0, 212, 255, 0.5);
}
.sx-legend .sx-legitem .sx-gly.lv-sec{
  box-shadow: 0 0 8px -1px var(--amber-line, rgba(217, 119, 6, 0.45));
}
.sx-legend .sx-legitem .sx-gly.lv-var{
  box-shadow: 0 0 6px -1px var(--red-line, rgba(192, 57, 43, 0.35));
}
.sx-doc-marker{
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11.5px; color: var(--ink2);
  padding: 4px 10px;
  background: var(--panel);
  border: 1px solid var(--star, rgba(212, 160, 23, 0.45));
  border-radius: 999px;
  margin-top: 6px;
}
.sx-doc-marker svg{ color: var(--star, #d4a017); }
.sx-doc-marker b{ color: var(--ink); font-weight: 700; }

/* Per-column sparkline — 8px-tall SVG at the bottom of each
   drug column showing coverage density. The stroke colour
   reflects the active count: high=cyan, mid=amber, low=faint. */
.sx-sparkrow td{ padding: 0; border-top: 1px solid var(--line2); }
.sx-spark-cell{ padding: 2px 1px 3px; }
.sx-spark{ display: block; width: 100%; height: 8px; }
.sx-spark-left{
  position: sticky; left: 0; z-index: 2;
  background: linear-gradient(180deg, rgba(252,251,248,0.86), rgba(252,251,248,0.74));
  border-right: 2px solid var(--line);
  padding: 2px 12px;
  font-family: var(--mono); font-size: 9.5px;
  letter-spacing: .12em; text-transform: uppercase;
  color: var(--muted); font-weight: 600;
}

/* ---------------- FULLSCREEN MODE ----------------
   When the user clicks "Fullscreen", the SpectrumChart root takes the
   whole viewport. The header, footnotes, sources, and disclaimer
   collapse so the 49-column matrix gets every available pixel of
   vertical space. On a wide display the matrix fits without
   horizontal scroll; vertical scroll is no longer bounded by 78vh. */
.sx-full{position:fixed; inset:0; z-index:1000; background:var(--paper); overflow:auto; padding:0;}
.sx-full .sx-header{display:none;}
.sx-full .sx-fnwrap,
.sx-full .sx-srcwrap,
.sx-full .sx-foot{display:none;}
/* In fullscreen the wrap padding shrinks so the table reaches edge to edge. */
.sx-full .sx-wrap{max-width:none; padding:8px 12px;}
.sx-full .sx-controls{padding:8px 12px 0; position:sticky; top:0; background:var(--paper); z-index:20; border-bottom:1px solid var(--line2);}
/* Critical: in fullscreen the matrix container uses the remaining
   viewport height instead of the global 78vh cap. The subtract accounts
   for the sticky controls + legend strip above (~280px). */
.sx-full .sx-mxwrap{max-height:calc(100vh - 280px);}
/* The corner + sticky org header need to remain on top of the
   fullscreen overlay's stacking context. */
.sx-full .sx-corner,.sx-full .sx-sgth,.sx-full .sx-orgth{background:var(--panel);}
`;

/* ===================== DATA ===================== */
const SUPERGROUPS = [{"id": "gp", "label": "Gram-positive", "tint": "--sg-gp", "bg": "--sg-gp-bg"}, {"id": "ent", "label": "Enterobacterales", "tint": "--sg-ent", "bg": "--sg-ent-bg"}, {"id": "nf", "label": "Non-fermenters", "tint": "--sg-nf", "bg": "--sg-nf-bg"}, {"id": "fas", "label": "Fastidious / zoonotic GN", "tint": "--sg-fas", "bg": "--sg-fas-bg"}, {"id": "ana", "label": "Anaerobes", "tint": "--sg-ana", "bg": "--sg-ana-bg"}, {"id": "atyp", "label": "Atypical / intracellular", "tint": "--sg-atyp", "bg": "--sg-atyp-bg"}, {"id": "spz", "label": "Spirochetes & zoonoses", "tint": "--sg-spz", "bg": "--sg-spz-bg"}];
const ORGS = [{"id": "spn", "label": "S. pneumoniae", "italic": true, "sub": "PCN-S", "sg": "gp"}, {"id": "spnr", "label": "S. pneumoniae", "italic": true, "sub": "PCN-R / MDR", "sg": "gp"}, {"id": "vgs", "label": "Viridans strep", "italic": false, "sub": "S. mitis grp", "sg": "gp"}, {"id": "bhs", "label": "β-hemolytic strep", "italic": false, "sub": "A/B/C/G", "sg": "gp"}, {"id": "mssa", "label": "S. aureus — MSSA", "italic": false, "sub": "", "sg": "gp"}, {"id": "mrsa", "label": "S. aureus — MRSA", "italic": false, "sub": "", "sg": "gp"}, {"id": "cons", "label": "Coag-neg staph", "italic": false, "sub": "S. epidermidis", "sg": "gp"}, {"id": "efs", "label": "E. faecalis", "italic": true, "sub": "", "sg": "gp"}, {"id": "efm", "label": "E. faecium", "italic": true, "sub": "amp-S", "sg": "gp"}, {"id": "vre", "label": "E. faecium — VRE", "italic": true, "sub": "", "sg": "gp"}, {"id": "lis", "label": "Listeria", "italic": true, "sub": "L. monocytogenes", "sg": "gp"}, {"id": "cory", "label": "Coryneform / Cutibacterium", "italic": false, "sub": "GP rods", "sg": "gp"}, {"id": "nocard", "label": "Nocardia", "italic": true, "sub": "aerobic actinomycete", "sg": "gp"}, {"id": "eco", "label": "E. coli", "italic": true, "sub": "wild-type", "sg": "ent"}, {"id": "kpn", "label": "K. pneumoniae", "italic": true, "sub": "wild-type", "sg": "ent"}, {"id": "pmir", "label": "Proteus / Providencia / Morganella", "italic": true, "sub": "Morganellaceae", "sg": "ent"}, {"id": "ampc", "label": "Enterobacter / Serratia / Citrobacter", "italic": true, "sub": "AmpC inducible", "sg": "ent"}, {"id": "esbl", "label": "ESBL Enterobacterales", "italic": false, "sub": "CTX-M", "sg": "ent"}, {"id": "cre", "label": "CRE — KPC / OXA-48", "italic": false, "sub": "serine", "sg": "ent"}, {"id": "crem", "label": "CRE — MBL", "italic": false, "sub": "NDM/VIM/IMP", "sg": "ent"}, {"id": "sal", "label": "Salmonella / Shigella", "italic": true, "sub": "enteric", "sg": "ent"}, {"id": "psa", "label": "P. aeruginosa", "italic": true, "sub": "susceptible", "sg": "nf"}, {"id": "psdtr", "label": "P. aeruginosa — DTR", "italic": true, "sub": "diff-to-treat", "sg": "nf"}, {"id": "ab", "label": "Acinetobacter baumannii", "italic": true, "sub": "CRAB", "sg": "nf"}, {"id": "sm", "label": "Stenotrophomonas", "italic": true, "sub": "S. maltophilia", "sg": "nf"}, {"id": "bcc", "label": "Burkholderia cepacia", "italic": true, "sub": "complex", "sg": "nf"}, {"id": "hi", "label": "Haemophilus influenzae", "italic": true, "sub": "", "sg": "fas"}, {"id": "mc", "label": "Moraxella catarrhalis", "italic": true, "sub": "", "sg": "fas"}, {"id": "ng", "label": "Neisseria gonorrhoeae", "italic": true, "sub": "", "sg": "fas"}, {"id": "nm", "label": "Neisseria meningitidis", "italic": true, "sub": "", "sg": "fas"}, {"id": "past", "label": "Pasteurella multocida", "italic": true, "sub": "bite", "sg": "fas"}, {"id": "eik", "label": "Eikenella / Capnocytophaga", "italic": true, "sub": "bite / HACEK", "sg": "fas"}, {"id": "camp", "label": "Campylobacter jejuni", "italic": true, "sub": "enteric / zoonotic", "sg": "fas"}, {"id": "vib", "label": "Vibrio vulnificus", "italic": true, "sub": "wound / sepsis", "sg": "fas"}, {"id": "bfrag", "label": "Bacteroides fragilis grp", "italic": true, "sub": "GN anaerobe", "sg": "ana"}, {"id": "oana", "label": "Oral GN anaerobes", "italic": false, "sub": "Prevotella/Fusobacterium", "sg": "ana"}, {"id": "gpana", "label": "GP anaerobes", "italic": false, "sub": "Peptostrep/Clostridium", "sg": "ana"}, {"id": "actino", "label": "Actinomyces", "italic": true, "sub": "GP anaerobe", "sg": "ana"}, {"id": "cdiff", "label": "Clostridioides difficile", "italic": true, "sub": "", "sg": "ana"}, {"id": "myc", "label": "Mycoplasma / Chlamydophila", "italic": true, "sub": "", "sg": "atyp"}, {"id": "leg", "label": "Legionella", "italic": true, "sub": "L. pneumophila", "sg": "atyp"}, {"id": "rick", "label": "Rickettsia / Anaplasma / Ehrlichia", "italic": true, "sub": "tick-borne", "sg": "atyp"}, {"id": "trep", "label": "Treponema pallidum", "italic": true, "sub": "syphilis", "sg": "spz"}, {"id": "borr", "label": "Borrelia", "italic": true, "sub": "Lyme", "sg": "spz"}, {"id": "lepto", "label": "Leptospira", "italic": true, "sub": "", "sg": "spz"}, {"id": "bruc", "label": "Brucella", "italic": true, "sub": "", "sg": "spz"}, {"id": "fran", "label": "Francisella tularensis", "italic": true, "sub": "tularemia", "sg": "spz"}, {"id": "bart", "label": "Bartonella", "italic": true, "sub": "", "sg": "spz"}, {"id": "cox", "label": "Coxiella burnetii", "italic": true, "sub": "Q fever", "sg": "spz"}];
const ORG_SG = {"spn": "gp", "spnr": "gp", "vgs": "gp", "bhs": "gp", "mssa": "gp", "mrsa": "gp", "cons": "gp", "efs": "gp", "efm": "gp", "vre": "gp", "lis": "gp", "cory": "gp", "nocard": "gp", "eco": "ent", "kpn": "ent", "pmir": "ent", "ampc": "ent", "esbl": "ent", "cre": "ent", "crem": "ent", "sal": "ent", "psa": "nf", "psdtr": "nf", "ab": "nf", "sm": "nf", "bcc": "nf", "hi": "fas", "mc": "fas", "ng": "fas", "nm": "fas", "past": "fas", "eik": "fas", "camp": "fas", "vib": "fas", "bfrag": "ana", "oana": "ana", "gpana": "ana", "actino": "ana", "cdiff": "ana", "myc": "atyp", "leg": "atyp", "rick": "atyp", "trep": "spz", "borr": "spz", "lepto": "spz", "bruc": "spz", "fran": "spz", "bart": "spz", "cox": "spz"};
const SG_MEMBERS = {"gp": ["spn", "spnr", "vgs", "bhs", "mssa", "mrsa", "cons", "efs", "efm", "vre", "lis", "cory", "nocard"], "ent": ["eco", "kpn", "pmir", "ampc", "esbl", "cre", "crem", "sal"], "nf": ["psa", "psdtr", "ab", "sm", "bcc"], "fas": ["hi", "mc", "ng", "nm", "past", "eik", "camp", "vib"], "ana": ["bfrag", "oana", "gpana", "actino", "cdiff"], "atyp": ["myc", "leg", "rick"], "spz": ["trep", "borr", "lepto", "bruc", "fran", "bart", "cox"]};
const CLASSES = [{"name": "Penicillins", "mech": "Cell wall · PBP", "rail": "--blue", "agents": [{"name": "Penicillin G", "sub": "natural penicillin", "cidal": true, "route": "IV", "c": {"spn": "first", "spnr": "var", "vgs": "first", "bhs": "first", "mssa": "none", "mrsa": "none", "cons": "none", "efs": "sec", "efm": "none", "vre": "none", "lis": "sec", "cory": "sec", "eco": "intr", "pmir": "intr", "ampc": "intr", "esbl": "intr", "cre": "intr", "crem": "intr", "sal": "intr", "psa": "intr", "psdtr": "intr", "ab": "intr", "sm": "intr", "bcc": "intr", "hi": "none", "mc": "none", "ng": "var", "nm": "first", "past": "first", "eik": "first", "bfrag": "none", "oana": "var", "gpana": "first", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "intr", "nocard": "none", "camp": "none", "vib": "none", "actino": "first", "trep": "first", "borr": "sec", "lepto": "first", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["bhs", "vgs", "nm", "trep", "actino"], "notes": {"spnr": "Penicillin-resistant pneumococcus (altered PBP2x) — use ceftriaxone ± vancomycin.", "efs": "Active but bacteriostatic vs enterococci; add an aminoglycoside/ceftriaxone for endocarditis synergy.", "bfrag": "B. fragilis produces a β-lactamase — penicillin is inactive.", "nm": "Drug of choice for penicillin-susceptible meningococcus.", "ng": "Widespread penicillinase — no longer reliable for gonococcus.", "past": "Pasteurella is penicillin-susceptible — penicillin/amoxicillin preferred.", "trep": "Drug of choice for all stages of syphilis; no clinical penicillin resistance.", "lepto": "Penicillin G or ceftriaxone for severe leptospirosis; doxycycline for mild disease/prophylaxis.", "actino": "Drug of choice (high-dose, prolonged) for actinomycosis; aminopenicillins equivalent."}}, {"name": "Ampicillin / amoxicillin", "sub": "aminopenicillin", "cidal": true, "route": "IV/PO", "c": {"spn": "first", "spnr": "var", "vgs": "first", "bhs": "first", "mssa": "none", "mrsa": "none", "cons": "none", "efs": "first", "efm": "var", "vre": "none", "lis": "first", "cory": "sec", "eco": "var", "pmir": "var", "ampc": "intr", "esbl": "none", "cre": "none", "crem": "none", "sal": "sec", "psa": "intr", "psdtr": "intr", "ab": "intr", "sm": "intr", "bcc": "intr", "hi": "var", "mc": "none", "ng": "var", "nm": "first", "past": "first", "eik": "first", "bfrag": "none", "oana": "var", "gpana": "first", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "intr", "nocard": "none", "camp": "var", "vib": "var", "actino": "first", "trep": "sec", "borr": "first", "lepto": "first", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["efs", "lis"], "notes": {"efs": "Drug of choice for E. faecalis (with ceftriaxone or gentamicin synergy for endocarditis).", "lis": "Drug of choice for Listeria — cephalosporins have no activity.", "ampc": "Enterobacter/Serratia/Citrobacter intrinsically resistant (chromosomal AmpC).", "eco": "E. coli ampicillin resistance now common — confirm susceptibility.", "hi": "Active only against β-lactamase-negative H. influenzae.", "kpn": "Klebsiella is intrinsically ampicillin/amoxicillin-resistant (chromosomal SHV penicillinase); a β-lactamase inhibitor or other agent is required."}}, {"name": "Amoxicillin-clavulanate", "sub": "+ β-lactamase inhibitor", "cidal": true, "route": "PO", "c": {"spn": "first", "spnr": "var", "vgs": "first", "bhs": "first", "mssa": "first", "mrsa": "none", "cons": "var", "efs": "first", "efm": "var", "vre": "none", "lis": "first", "cory": "sec", "eco": "sec", "pmir": "sec", "ampc": "intr", "esbl": "none", "cre": "none", "crem": "none", "sal": "sec", "psa": "intr", "psdtr": "intr", "ab": "intr", "sm": "intr", "bcc": "intr", "hi": "first", "mc": "first", "ng": "var", "nm": "first", "past": "first", "eik": "first", "bfrag": "first", "oana": "first", "gpana": "first", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "sec", "nocard": "var", "camp": "var", "vib": "none", "actino": "first", "trep": "na", "borr": "first", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["past", "eik"], "notes": {"mrsa": "No MRSA activity — clavulanate does not restore anti-MRSA activity.", "bfrag": "Clavulanate restores activity vs β-lactamase–producing B. fragilis.", "past": "Drug of choice for animal/human bite wounds (Pasteurella, Eikenella, oral anaerobes, skin flora).", "ampc": "Inducible AmpC hydrolyzes the combination — not reliable."}}, {"name": "Ampicillin-sulbactam", "sub": "+ β-lactamase inhibitor", "cidal": true, "route": "IV", "c": {"spn": "first", "spnr": "var", "vgs": "first", "bhs": "first", "mssa": "first", "mrsa": "none", "cons": "var", "efs": "first", "efm": "var", "vre": "none", "lis": "first", "cory": "sec", "eco": "sec", "pmir": "sec", "ampc": "intr", "esbl": "none", "cre": "none", "crem": "none", "sal": "sec", "psa": "intr", "psdtr": "intr", "ab": "sec", "sm": "intr", "bcc": "intr", "hi": "first", "mc": "first", "ng": "var", "nm": "first", "past": "first", "eik": "first", "bfrag": "first", "oana": "first", "gpana": "first", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "sec", "nocard": "var", "camp": "none", "vib": "none", "actino": "first", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["ab"], "notes": {"ab": "Sulbactam has intrinsic Acinetobacter activity — high-dose ampicillin-sulbactam is an IDSA CRAB option (sulbactam-durlobactam preferred).", "bfrag": "Covers B. fragilis and oral anaerobes.", "mrsa": "No MRSA activity."}}, {"name": "Nafcillin / oxacillin", "sub": "antistaphylococcal penicillin", "cidal": true, "route": "IV", "c": {"spn": "first", "spnr": "var", "vgs": "first", "bhs": "first", "mssa": "first", "mrsa": "none", "cons": "var", "efs": "none", "efm": "none", "vre": "none", "lis": "none", "cory": "none", "eco": "intr", "pmir": "intr", "ampc": "intr", "esbl": "intr", "cre": "intr", "crem": "intr", "sal": "intr", "psa": "intr", "psdtr": "intr", "ab": "intr", "sm": "intr", "bcc": "intr", "hi": "intr", "mc": "intr", "ng": "intr", "nm": "intr", "past": "intr", "eik": "intr", "bfrag": "none", "oana": "none", "gpana": "var", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "intr", "nocard": "none", "camp": "intr", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["mssa"], "notes": {"mssa": "Drug of choice for MSSA (with cefazolin) — β-lactams beat vancomycin for MSSA.", "mrsa": "By definition resistant (PBP2a).", "efs": "No enterococcal activity.", "lis": "No Listeria activity."}}, {"name": "Piperacillin-tazobactam", "sub": "antipseudomonal + inhibitor", "cidal": true, "route": "IV", "c": {"spn": "first", "spnr": "var", "vgs": "first", "bhs": "first", "mssa": "first", "mrsa": "none", "cons": "var", "efs": "first", "efm": "var", "vre": "none", "lis": "sec", "cory": "none", "eco": "first", "pmir": "first", "ampc": "var", "esbl": "var", "cre": "none", "crem": "none", "sal": "sec", "psa": "first", "psdtr": "var", "ab": "var", "sm": "intr", "bcc": "intr", "hi": "first", "mc": "first", "ng": "sec", "nm": "first", "past": "first", "eik": "first", "bfrag": "first", "oana": "first", "gpana": "first", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "first", "nocard": "none", "camp": "none", "vib": "sec", "actino": "first", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["psa"], "notes": {"esbl": "In-vitro active but INFERIOR to a carbapenem for serious ESBL infection (MERINO) — do not use even if susceptible.", "ampc": "Inducible AmpC can derepress — cefepime or a carbapenem preferred.", "mrsa": "No MRSA activity.", "sm": "Stenotrophomonas intrinsically resistant (L1/L2)."}}]}, {"name": "Cephalosporins", "mech": "Cell wall · PBP", "rail": "--blue", "agents": [{"name": "Cefazolin", "sub": "1st generation", "cidal": true, "route": "IV", "c": {"spn": "first", "spnr": "var", "vgs": "first", "bhs": "first", "mssa": "first", "mrsa": "none", "cons": "var", "efs": "intr", "efm": "intr", "vre": "intr", "lis": "intr", "cory": "none", "eco": "sec", "pmir": "sec", "ampc": "intr", "esbl": "none", "cre": "none", "crem": "none", "sal": "none", "psa": "intr", "psdtr": "intr", "ab": "intr", "sm": "intr", "bcc": "intr", "hi": "intr", "mc": "intr", "ng": "intr", "nm": "intr", "past": "intr", "eik": "intr", "bfrag": "intr", "oana": "intr", "gpana": "none", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "sec", "nocard": "none", "camp": "intr", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["mssa"], "notes": {"mssa": "Drug of choice for MSSA; preferred surgical prophylaxis; unique side chain — usually safe in penicillin allergy.", "efs": "Cephalosporins have NO enterococcal activity (intrinsic).", "eco": "Covers community E. coli/Klebsiella/Proteus ('PEcK').", "lis": "Cephalosporins miss Listeria (intrinsic)."}}, {"name": "Cefuroxime", "sub": "2nd generation", "cidal": true, "route": "IV/PO", "c": {"spn": "first", "spnr": "var", "vgs": "first", "bhs": "first", "mssa": "first", "mrsa": "none", "cons": "var", "efs": "intr", "efm": "intr", "vre": "intr", "lis": "intr", "cory": "none", "eco": "sec", "pmir": "sec", "ampc": "intr", "esbl": "none", "cre": "none", "crem": "none", "sal": "sec", "psa": "intr", "psdtr": "intr", "ab": "intr", "sm": "intr", "bcc": "intr", "hi": "first", "mc": "first", "ng": "sec", "nm": "sec", "past": "sec", "eik": "sec", "bfrag": "intr", "oana": "var", "gpana": "var", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "sec", "nocard": "none", "camp": "intr", "vib": "none", "actino": "none", "trep": "na", "borr": "first", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": [], "notes": {"hi": "Adds reliable H. influenzae / Moraxella over first generation.", "ampc": "Avoid for AmpC inducers."}}, {"name": "Cefoxitin / cefotetan", "sub": "cephamycin (2nd gen)", "cidal": true, "route": "IV", "c": {"spn": "sec", "spnr": "var", "vgs": "sec", "bhs": "sec", "mssa": "sec", "mrsa": "none", "cons": "none", "efs": "intr", "efm": "intr", "vre": "intr", "lis": "intr", "cory": "none", "eco": "sec", "pmir": "sec", "ampc": "intr", "esbl": "none", "cre": "none", "crem": "none", "sal": "none", "psa": "intr", "psdtr": "intr", "ab": "intr", "sm": "intr", "bcc": "intr", "hi": "sec", "mc": "sec", "ng": "sec", "nm": "sec", "past": "none", "eik": "none", "bfrag": "sec", "oana": "sec", "gpana": "none", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "sec", "nocard": "none", "camp": "intr", "vib": "none", "actino": "sec", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": [], "notes": {"bfrag": "Cephamycins retain some B. fragilis activity (resistance rising) — colorectal prophylaxis.", "ampc": "Potent AmpC inducer — avoid vs Enterobacter group.", "psa": "No antipseudomonal activity."}}, {"name": "Ceftriaxone / cefotaxime", "sub": "3rd generation", "cidal": true, "route": "IV", "c": {"spn": "first", "spnr": "sec", "vgs": "first", "bhs": "first", "mssa": "sec", "mrsa": "none", "cons": "none", "efs": "intr", "efm": "intr", "vre": "intr", "lis": "intr", "cory": "none", "eco": "first", "pmir": "first", "ampc": "var", "esbl": "none", "cre": "none", "crem": "none", "sal": "first", "psa": "intr", "psdtr": "intr", "ab": "none", "sm": "intr", "bcc": "none", "hi": "first", "mc": "first", "ng": "first", "nm": "first", "past": "first", "eik": "first", "bfrag": "intr", "oana": "var", "gpana": "none", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "first", "nocard": "sec", "camp": "intr", "vib": "first", "actino": "sec", "trep": "sec", "borr": "first", "lepto": "first", "bruc": "var", "fran": "none", "bart": "sec", "cox": "none"}, "doc": ["spn", "ng", "nm"], "notes": {"ng": "Ceftriaxone is the drug of choice for gonorrhea.", "spnr": "At meningitis doses covers most penicillin-resistant pneumococci; add vancomycin empirically for meningitis.", "ampc": "Avoid for AmpC inducers — risk of treatment-emergent derepression.", "psa": "No antipseudomonal activity (use ceftazidime/cefepime).", "lis": "No Listeria activity.", "vib": "Third-generation cephalosporin combined with doxycycline (or a fluoroquinolone) for V. vulnificus."}}, {"name": "Ceftazidime", "sub": "3rd gen · antipseudomonal", "cidal": true, "route": "IV", "c": {"spn": "var", "spnr": "none", "vgs": "var", "bhs": "var", "mssa": "none", "mrsa": "none", "cons": "none", "efs": "intr", "efm": "intr", "vre": "intr", "lis": "intr", "cory": "none", "eco": "first", "pmir": "first", "ampc": "var", "esbl": "none", "cre": "none", "crem": "none", "sal": "sec", "psa": "first", "psdtr": "var", "ab": "none", "sm": "intr", "bcc": "sec", "hi": "first", "mc": "first", "ng": "first", "nm": "first", "past": "sec", "eik": "sec", "bfrag": "intr", "oana": "none", "gpana": "none", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "first", "nocard": "none", "camp": "intr", "vib": "sec", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["psa"], "notes": {"psa": "Antipseudomonal; poor Gram-positive coverage.", "sm": "No longer tested/recommended for S. maltophilia (breakpoint withdrawn).", "bcc": "One of few agents with Burkholderia activity.", "mssa": "Poor staphylococcal activity — not for Gram-positive infection."}}, {"name": "Cefepime", "sub": "4th generation", "cidal": true, "route": "IV", "c": {"spn": "first", "spnr": "sec", "vgs": "first", "bhs": "first", "mssa": "first", "mrsa": "none", "cons": "none", "efs": "intr", "efm": "intr", "vre": "intr", "lis": "intr", "cory": "none", "eco": "first", "pmir": "first", "ampc": "first", "esbl": "var", "cre": "none", "crem": "none", "sal": "first", "psa": "first", "psdtr": "var", "ab": "var", "sm": "intr", "bcc": "sec", "hi": "first", "mc": "first", "ng": "first", "nm": "first", "past": "sec", "eik": "sec", "bfrag": "intr", "oana": "none", "gpana": "none", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "first", "nocard": "var", "camp": "intr", "vib": "sec", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["ampc"], "notes": {"ampc": "IDSA 2024 preferred agent for moderate-risk AmpC inducers (E. cloacae, K. aerogenes, C. freundii) — stable to AmpC; old MIC 4–8 caution withdrawn.", "esbl": "Variable; not preferred for serious ESBL infection — use a carbapenem.", "psa": "Reliable antipseudomonal plus Gram-positive (MSSA/strep) coverage."}}, {"name": "Ceftaroline", "sub": "5th gen · anti-MRSA", "cidal": true, "route": "IV", "c": {"spn": "first", "spnr": "first", "vgs": "first", "bhs": "first", "mssa": "first", "mrsa": "first", "cons": "sec", "efs": "sec", "efm": "none", "vre": "none", "lis": "none", "cory": "sec", "eco": "sec", "pmir": "sec", "ampc": "none", "esbl": "none", "cre": "none", "crem": "none", "sal": "sec", "psa": "intr", "psdtr": "intr", "ab": "intr", "sm": "intr", "bcc": "intr", "hi": "first", "mc": "first", "ng": "sec", "nm": "sec", "past": "sec", "eik": "sec", "bfrag": "intr", "oana": "var", "gpana": "var", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "sec", "nocard": "none", "camp": "intr", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["mrsa"], "notes": {"mrsa": "The only β-lactam with reliable MRSA activity (binds PBP2a); salvage for refractory MRSA bacteremia.", "efm": "No E. faecium activity (some E. faecalis).", "psa": "No antipseudomonal activity."}}, {"name": "Cefiderocol", "sub": "siderophore cephalosporin", "cidal": true, "route": "IV", "c": {"spn": "intr", "spnr": "intr", "vgs": "intr", "bhs": "intr", "mssa": "intr", "mrsa": "intr", "cons": "intr", "efs": "intr", "efm": "intr", "vre": "intr", "lis": "intr", "cory": "intr", "eco": "first", "pmir": "first", "ampc": "first", "esbl": "first", "cre": "first", "crem": "first", "sal": "first", "psa": "first", "psdtr": "first", "ab": "first", "sm": "first", "bcc": "sec", "hi": "sec", "mc": "sec", "ng": "none", "nm": "none", "past": "none", "eik": "none", "bfrag": "intr", "oana": "intr", "gpana": "intr", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "first", "nocard": "none", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["crem", "ab", "sm"], "notes": {"crem": "Stable to ALL carbapenemase classes including metallo-β-lactamases (NDM/VIM/IMP) — a key MBL-CRE option.", "ab": "Active vs carbapenem-resistant Acinetobacter; reserve agent.", "sm": "Active vs S. maltophilia.", "mssa": "No Gram-positive or anaerobic activity — aerobic Gram-negatives only."}}]}, {"name": "Novel β-lactam / β-lactamase-inhibitor", "mech": "Cell wall · PBP + inhibitor", "rail": "--blue", "agents": [{"name": "Ceftolozane-tazobactam", "sub": "antipseudomonal BL/BLI", "cidal": true, "route": "IV", "c": {"spn": "var", "spnr": "none", "vgs": "var", "bhs": "var", "mssa": "none", "mrsa": "none", "cons": "none", "efs": "none", "efm": "none", "vre": "none", "lis": "none", "cory": "none", "eco": "first", "pmir": "sec", "ampc": "var", "esbl": "first", "cre": "none", "crem": "none", "sal": "sec", "psa": "first", "psdtr": "first", "ab": "none", "sm": "intr", "bcc": "none", "hi": "intr", "mc": "intr", "ng": "intr", "nm": "intr", "past": "intr", "eik": "intr", "bfrag": "var", "oana": "var", "gpana": "none", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "first", "nocard": "none", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["psdtr"], "notes": {"psdtr": "Reserved for difficult-to-treat Pseudomonas; most active antipseudomonal BL/BLI.", "esbl": "Active vs ESBL but preserve for Pseudomonas/polymicrobial indications.", "cre": "No carbapenemase coverage."}}, {"name": "Ceftazidime-avibactam", "sub": "BL/BLI · KPC, OXA-48", "cidal": true, "route": "IV", "c": {"spn": "var", "spnr": "none", "vgs": "var", "bhs": "var", "mssa": "none", "mrsa": "none", "cons": "none", "efs": "none", "efm": "none", "vre": "none", "lis": "none", "cory": "none", "eco": "first", "pmir": "first", "ampc": "first", "esbl": "first", "cre": "first", "crem": "none", "sal": "first", "psa": "first", "psdtr": "first", "ab": "none", "sm": "sec", "bcc": "sec", "hi": "intr", "mc": "intr", "ng": "intr", "nm": "intr", "past": "intr", "eik": "intr", "bfrag": "intr", "oana": "intr", "gpana": "intr", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "first", "nocard": "none", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["cre"], "notes": {"cre": "Covers KPC and OXA-48 carbapenemases — a first-line CRE option.", "crem": "Does NOT cover metallo-β-lactamases (NDM/VIM/IMP) — add aztreonam.", "sm": "Active as part of ceftazidime-avibactam + aztreonam for S. maltophilia."}}, {"name": "Meropenem-vaborbactam", "sub": "carbapenem/BLI · KPC", "cidal": true, "route": "IV", "c": {"spn": "first", "spnr": "sec", "vgs": "first", "bhs": "first", "mssa": "first", "mrsa": "none", "cons": "none", "efs": "var", "efm": "none", "vre": "none", "lis": "sec", "cory": "none", "eco": "first", "pmir": "first", "ampc": "first", "esbl": "first", "cre": "first", "crem": "none", "sal": "first", "psa": "sec", "psdtr": "none", "ab": "var", "sm": "intr", "bcc": "sec", "hi": "first", "mc": "first", "ng": "first", "nm": "first", "past": "first", "eik": "first", "bfrag": "first", "oana": "first", "gpana": "first", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "first", "nocard": "none", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["cre"], "notes": {"cre": "Vaborbactam restores meropenem vs KPC — first-line KPC-CRE option.", "crem": "No OXA-48 or metallo-β-lactamase activity.", "sm": "Intrinsically resistant (L1 carbapenemase)."}}, {"name": "Imipenem-relebactam", "sub": "carbapenem/BLI · KPC, DTR-Pa", "cidal": true, "route": "IV", "c": {"spn": "first", "spnr": "sec", "vgs": "first", "bhs": "first", "mssa": "first", "mrsa": "none", "cons": "none", "efs": "sec", "efm": "none", "vre": "none", "lis": "sec", "cory": "none", "eco": "first", "pmir": "sec", "ampc": "first", "esbl": "first", "cre": "first", "crem": "none", "sal": "first", "psa": "first", "psdtr": "first", "ab": "none", "sm": "intr", "bcc": "none", "hi": "first", "mc": "first", "ng": "first", "nm": "first", "past": "first", "eik": "first", "bfrag": "first", "oana": "first", "gpana": "first", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "first", "nocard": "sec", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["cre", "psdtr"], "notes": {"cre": "Relebactam restores imipenem vs KPC; also DTR-Pseudomonas.", "crem": "No metallo-β-lactamase or OXA-48 coverage.", "ab": "Acinetobacter not reliably covered.", "pmir": "Morganellaceae have intrinsically higher imipenem MICs."}}, {"name": "Sulbactam-durlobactam", "sub": "anti-CRAB BL/BLI", "cidal": true, "route": "IV", "c": {"spn": "intr", "spnr": "intr", "vgs": "intr", "bhs": "intr", "mssa": "intr", "mrsa": "intr", "cons": "intr", "efs": "intr", "efm": "intr", "vre": "intr", "lis": "intr", "cory": "intr", "eco": "var", "pmir": "none", "ampc": "none", "esbl": "none", "cre": "none", "crem": "none", "sal": "none", "psa": "none", "psdtr": "none", "ab": "first", "sm": "none", "bcc": "none", "hi": "intr", "mc": "intr", "ng": "intr", "nm": "intr", "past": "intr", "eik": "intr", "bfrag": "intr", "oana": "intr", "gpana": "intr", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "var", "nocard": "none", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["ab"], "notes": {"ab": "Durlobactam restores sulbactam vs carbapenem-resistant Acinetobacter — IDSA-preferred CRAB therapy (with a carbapenem).", "mssa": "Narrow Acinetobacter-directed agent."}}]}, {"name": "Carbapenems & monobactam", "mech": "Cell wall · PBP", "rail": "--blue", "agents": [{"name": "Ertapenem", "sub": "carbapenem (no anti-Pseudomonas)", "cidal": true, "route": "IV", "c": {"spn": "first", "spnr": "sec", "vgs": "first", "bhs": "first", "mssa": "first", "mrsa": "none", "cons": "none", "efs": "none", "efm": "none", "vre": "none", "lis": "sec", "cory": "none", "eco": "first", "pmir": "first", "ampc": "first", "esbl": "first", "cre": "none", "crem": "none", "sal": "first", "psa": "intr", "psdtr": "intr", "ab": "intr", "sm": "intr", "bcc": "none", "hi": "first", "mc": "first", "ng": "first", "nm": "first", "past": "first", "eik": "first", "bfrag": "first", "oana": "first", "gpana": "first", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "first", "nocard": "var", "camp": "var", "vib": "none", "actino": "sec", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["esbl"], "notes": {"esbl": "Stable to ESBLs — convenient once-daily ESBL workhorse without antipseudomonal pressure.", "psa": "NO antipseudomonal activity (key difference from meropenem); also no Acinetobacter/enterococcus.", "efs": "No enterococcal activity."}}, {"name": "Meropenem / imipenem / doripenem", "sub": "carbapenem (antipseudomonal)", "cidal": true, "route": "IV", "c": {"spn": "first", "spnr": "sec", "vgs": "first", "bhs": "first", "mssa": "first", "mrsa": "none", "cons": "var", "efs": "sec", "efm": "none", "vre": "none", "lis": "first", "cory": "sec", "eco": "first", "pmir": "first", "ampc": "first", "esbl": "first", "cre": "none", "crem": "none", "sal": "first", "psa": "first", "psdtr": "var", "ab": "var", "sm": "intr", "bcc": "sec", "hi": "first", "mc": "first", "ng": "first", "nm": "first", "past": "first", "eik": "first", "bfrag": "first", "oana": "first", "gpana": "first", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "first", "nocard": "sec", "camp": "sec", "vib": "sec", "actino": "first", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["esbl"], "notes": {"esbl": "First-line for serious ESBL infection (MERINO).", "sm": "S. maltophilia intrinsically carbapenem-resistant (L1 metallo-β-lactamase).", "efm": "No E. faecium activity; E. faecalis variable (imipenem better).", "cre": "By definition reduced — CRE requires novel agents.", "lis": "Active vs Listeria (meropenem)."}}, {"name": "Aztreonam", "sub": "monobactam", "cidal": true, "route": "IV", "c": {"spn": "intr", "spnr": "intr", "vgs": "intr", "bhs": "intr", "mssa": "intr", "mrsa": "intr", "cons": "intr", "efs": "intr", "efm": "intr", "vre": "intr", "lis": "intr", "cory": "intr", "eco": "first", "pmir": "first", "ampc": "var", "esbl": "var", "cre": "var", "crem": "sec", "sal": "first", "psa": "first", "psdtr": "var", "ab": "none", "sm": "none", "bcc": "none", "hi": "first", "mc": "first", "ng": "sec", "nm": "sec", "past": "none", "eik": "none", "bfrag": "intr", "oana": "intr", "gpana": "intr", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "first", "nocard": "none", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": [], "notes": {"crem": "Stable to metallo-β-lactamases — paired with ceftazidime-avibactam for MBL-CRE.", "mssa": "No Gram-positive or anaerobic activity (aerobic Gram-negatives only); safe in severe penicillin allergy.", "esbl": "Hydrolyzed by ESBLs/AmpC — needs avibactam to be reliable."}}]}, {"name": "Fluoroquinolones", "mech": "DNA gyrase / topoisomerase IV", "rail": "--violet", "agents": [{"name": "Ciprofloxacin", "sub": "fluoroquinolone", "cidal": true, "route": "IV/PO", "c": {"spn": "var", "spnr": "var", "vgs": "var", "bhs": "var", "mssa": "var", "mrsa": "none", "cons": "none", "efs": "var", "efm": "none", "vre": "none", "lis": "none", "cory": "none", "eco": "sec", "pmir": "sec", "ampc": "sec", "esbl": "var", "cre": "none", "crem": "none", "sal": "first", "psa": "first", "psdtr": "var", "ab": "var", "sm": "var", "bcc": "none", "hi": "first", "mc": "first", "ng": "var", "nm": "sec", "past": "sec", "eik": "sec", "bfrag": "intr", "oana": "intr", "gpana": "intr", "cdiff": "na", "myc": "first", "leg": "first", "rick": "none", "kpn": "sec", "nocard": "var", "camp": "var", "vib": "first", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "var", "fran": "first", "bart": "var", "cox": "var"}, "doc": ["psa"], "notes": {"spn": "Inadequate pneumococcal activity — not for CAP monotherapy.", "psa": "Best oral antipseudomonal agent.", "ng": "Resistance now widespread — not recommended for gonorrhea.", "sal": "Useful for invasive Salmonella/Shigella where susceptible."}}, {"name": "Levofloxacin", "sub": "respiratory fluoroquinolone", "cidal": true, "route": "IV/PO", "c": {"spn": "first", "spnr": "first", "vgs": "sec", "bhs": "sec", "mssa": "var", "mrsa": "none", "cons": "none", "efs": "var", "efm": "none", "vre": "none", "lis": "sec", "cory": "none", "eco": "sec", "pmir": "sec", "ampc": "sec", "esbl": "var", "cre": "none", "crem": "none", "sal": "first", "psa": "first", "psdtr": "var", "ab": "var", "sm": "first", "bcc": "sec", "hi": "first", "mc": "first", "ng": "var", "nm": "sec", "past": "sec", "eik": "sec", "bfrag": "none", "oana": "var", "gpana": "var", "cdiff": "na", "myc": "first", "leg": "first", "rick": "none", "kpn": "sec", "nocard": "var", "camp": "var", "vib": "first", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "var", "fran": "first", "bart": "none", "cox": "sec"}, "doc": ["myc", "leg", "sm"], "notes": {"spn": "Respiratory fluoroquinolone — reliable pneumococcal activity.", "leg": "Preferred (with azithromycin) for Legionella.", "sm": "A component option for S. maltophilia.", "psa": "Has antipseudomonal activity (unlike moxifloxacin)."}}, {"name": "Moxifloxacin", "sub": "respiratory fluoroquinolone", "cidal": true, "route": "IV/PO", "c": {"spn": "first", "spnr": "first", "vgs": "sec", "bhs": "sec", "mssa": "var", "mrsa": "none", "cons": "none", "efs": "var", "efm": "none", "vre": "none", "lis": "sec", "cory": "none", "eco": "sec", "pmir": "sec", "ampc": "sec", "esbl": "var", "cre": "none", "crem": "none", "sal": "sec", "psa": "none", "psdtr": "none", "ab": "none", "sm": "var", "bcc": "none", "hi": "first", "mc": "first", "ng": "var", "nm": "sec", "past": "sec", "eik": "sec", "bfrag": "var", "oana": "var", "gpana": "var", "cdiff": "na", "myc": "first", "leg": "first", "rick": "none", "kpn": "sec", "nocard": "var", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "sec", "bart": "none", "cox": "sec"}, "doc": ["myc", "leg"], "notes": {"psa": "NO reliable Pseudomonas activity (unlike levo/cipro).", "bfrag": "Some anaerobic activity but inadequate for serious intra-abdominal anaerobes.", "eco": "Inadequate urinary concentrations — avoid for UTI."}}, {"name": "Delafloxacin", "sub": "anti-MRSA fluoroquinolone", "cidal": true, "route": "IV/PO", "c": {"spn": "first", "spnr": "first", "vgs": "sec", "bhs": "first", "mssa": "first", "mrsa": "first", "cons": "sec", "efs": "var", "efm": "none", "vre": "none", "lis": "none", "cory": "none", "eco": "sec", "pmir": "sec", "ampc": "sec", "esbl": "var", "cre": "none", "crem": "none", "sal": "sec", "psa": "sec", "psdtr": "none", "ab": "none", "sm": "var", "bcc": "none", "hi": "first", "mc": "first", "ng": "sec", "nm": "sec", "past": "sec", "eik": "sec", "bfrag": "var", "oana": "var", "gpana": "var", "cdiff": "na", "myc": "first", "leg": "first", "rick": "none", "kpn": "sec", "nocard": "none", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["mrsa"], "notes": {"mrsa": "Fluoroquinolone with MRSA activity (approved for ABSSSI and CABP).", "psa": "Some antipseudomonal activity."}}]}, {"name": "Aminoglycosides", "mech": "30S ribosome (irreversible)", "rail": "--green", "agents": [{"name": "Gentamicin / tobramycin", "sub": "aminoglycoside", "cidal": true, "route": "IV", "c": {"spn": "none", "spnr": "none", "vgs": "none", "bhs": "none", "mssa": "var", "mrsa": "var", "cons": "none", "efs": "var", "efm": "var", "vre": "var", "lis": "var", "cory": "none", "eco": "first", "pmir": "first", "ampc": "first", "esbl": "var", "cre": "var", "crem": "var", "sal": "sec", "psa": "first", "psdtr": "var", "ab": "var", "sm": "intr", "bcc": "intr", "hi": "sec", "mc": "none", "ng": "none", "nm": "none", "past": "none", "eik": "none", "bfrag": "intr", "oana": "intr", "gpana": "intr", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "first", "nocard": "none", "camp": "sec", "vib": "var", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "first", "fran": "first", "bart": "sec", "cox": "none"}, "doc": ["fran"], "notes": {"efs": "Synergy ONLY (with a cell-wall agent) for enterococcal/staph endocarditis — no useful monotherapy.", "mssa": "Synergy/adjunct only, not monotherapy.", "bfrag": "No anaerobic activity — uptake is oxygen-dependent.", "psa": "Antipseudomonal; tobramycin slightly more active vs Pseudomonas.", "sm": "Stenotrophomonas intrinsically resistant.", "fran": "Aminoglycoside (streptomycin or gentamicin) is first-line for severe tularemia; β-lactams are ineffective."}}, {"name": "Amikacin", "sub": "aminoglycoside (broadest)", "cidal": true, "route": "IV", "c": {"spn": "none", "spnr": "none", "vgs": "none", "bhs": "none", "mssa": "var", "mrsa": "var", "cons": "none", "efs": "var", "efm": "var", "vre": "var", "lis": "var", "cory": "none", "eco": "first", "pmir": "first", "ampc": "first", "esbl": "first", "cre": "var", "crem": "var", "sal": "sec", "psa": "first", "psdtr": "var", "ab": "var", "sm": "intr", "bcc": "intr", "hi": "sec", "mc": "none", "ng": "none", "nm": "none", "past": "none", "eik": "none", "bfrag": "intr", "oana": "intr", "gpana": "intr", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "first", "nocard": "first", "camp": "sec", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "sec", "fran": "sec", "bart": "none", "cox": "none"}, "doc": [], "notes": {"esbl": "Most stable aminoglycoside to enzymatic modification — retains activity vs many ESBL/AmpC isolates.", "ab": "Adjunct option for Acinetobacter.", "sm": "Intrinsically resistant."}}, {"name": "Plazomicin", "sub": "next-gen aminoglycoside", "cidal": true, "route": "IV", "c": {"spn": "none", "spnr": "none", "vgs": "none", "bhs": "none", "mssa": "var", "mrsa": "var", "cons": "none", "efs": "var", "efm": "var", "vre": "var", "lis": "none", "cory": "none", "eco": "first", "pmir": "sec", "ampc": "first", "esbl": "first", "cre": "first", "crem": "var", "sal": "sec", "psa": "var", "psdtr": "none", "ab": "var", "sm": "intr", "bcc": "intr", "hi": "none", "mc": "none", "ng": "none", "nm": "none", "past": "none", "eik": "none", "bfrag": "intr", "oana": "intr", "gpana": "intr", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "first", "nocard": "none", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["cre"], "notes": {"cre": "Engineered aminoglycoside stable to most modifying enzymes — a CRE option (cUTI).", "crem": "Inactivated by 16S-rRNA methyltransferases (often co-carried with NDM) — variable for MBL.", "psa": "Limited antipseudomonal activity."}}]}, {"name": "Tetracyclines & glycylcyclines", "mech": "30S ribosome (reversible)", "rail": "--teal", "agents": [{"name": "Doxycycline", "sub": "tetracycline", "cidal": false, "route": "IV/PO", "c": {"spn": "sec", "spnr": "sec", "vgs": "sec", "bhs": "sec", "mssa": "sec", "mrsa": "sec", "cons": "sec", "efs": "none", "efm": "none", "vre": "none", "lis": "none", "cory": "sec", "eco": "var", "pmir": "intr", "ampc": "var", "esbl": "var", "cre": "none", "crem": "none", "sal": "none", "psa": "intr", "psdtr": "intr", "ab": "var", "sm": "sec", "bcc": "sec", "hi": "sec", "mc": "sec", "ng": "none", "nm": "none", "past": "first", "eik": "sec", "bfrag": "var", "oana": "var", "gpana": "var", "cdiff": "na", "myc": "first", "leg": "sec", "rick": "first", "kpn": "var", "nocard": "var", "camp": "var", "vib": "first", "actino": "sec", "trep": "sec", "borr": "first", "lepto": "first", "bruc": "first", "fran": "first", "bart": "first", "cox": "first"}, "doc": ["rick", "myc", "borr", "lepto", "bruc", "bart", "cox", "vib"], "notes": {"rick": "Drug of choice for Rickettsia, Anaplasma, Ehrlichia and tick-borne illness (also Q fever, brucellosis).", "pmir": "Proteus intrinsically tetracycline-resistant.", "psa": "Pseudomonas intrinsically resistant (efflux).", "mrsa": "Useful oral option for CA-MRSA skin infection.", "borr": "Doxycycline, amoxicillin, or cefuroxime are co-equal oral options for early Lyme; ceftriaxone for neurologic/cardiac disease.", "bruc": "Doxycycline for ≥6 weeks combined with rifampin or an aminoglycoside (gentamicin/streptomycin) to prevent relapse.", "bart": "Doxycycline (± rifampin) for most Bartonella disease; add gentamicin for endocarditis.", "cox": "First-line for acute Q fever; chronic disease adds hydroxychloroquine (not an antibacterial).", "vib": "Doxycycline plus a third-generation cephalosporin (ceftriaxone/cefotaxime) for V. vulnificus wound sepsis; a fluoroquinolone is an alternative."}}, {"name": "Minocycline", "sub": "tetracycline", "cidal": false, "route": "IV/PO", "c": {"spn": "sec", "spnr": "sec", "vgs": "sec", "bhs": "sec", "mssa": "sec", "mrsa": "sec", "cons": "sec", "efs": "none", "efm": "none", "vre": "var", "lis": "none", "cory": "sec", "eco": "var", "pmir": "intr", "ampc": "var", "esbl": "var", "cre": "none", "crem": "none", "sal": "none", "psa": "intr", "psdtr": "intr", "ab": "sec", "sm": "first", "bcc": "sec", "hi": "sec", "mc": "sec", "ng": "none", "nm": "none", "past": "first", "eik": "sec", "bfrag": "var", "oana": "var", "gpana": "var", "cdiff": "na", "myc": "first", "leg": "sec", "rick": "first", "kpn": "var", "nocard": "sec", "camp": "var", "vib": "sec", "actino": "sec", "trep": "var", "borr": "sec", "lepto": "na", "bruc": "sec", "fran": "sec", "bart": "sec", "cox": "none"}, "doc": ["sm"], "notes": {"sm": "IDSA-preferred S. maltophilia agent (with TMP-SMX); FDA-cleared breakpoints.", "ab": "Activity vs Acinetobacter (combination).", "pmir": "Proteus intrinsically resistant; Serratia resistant to tetracycline/doxycycline but susceptible to minocycline."}}, {"name": "Tigecycline", "sub": "glycylcycline", "cidal": false, "route": "IV", "c": {"spn": "first", "spnr": "first", "vgs": "sec", "bhs": "first", "mssa": "first", "mrsa": "first", "cons": "sec", "efs": "first", "efm": "first", "vre": "first", "lis": "sec", "cory": "sec", "eco": "first", "pmir": "intr", "ampc": "first", "esbl": "first", "cre": "sec", "crem": "sec", "sal": "sec", "psa": "intr", "psdtr": "intr", "ab": "sec", "sm": "sec", "bcc": "sec", "hi": "sec", "mc": "sec", "ng": "none", "nm": "none", "past": "sec", "eik": "sec", "bfrag": "first", "oana": "first", "gpana": "first", "cdiff": "na", "myc": "sec", "leg": "sec", "rick": "sec", "kpn": "first", "nocard": "var", "camp": "var", "vib": "none", "actino": "sec", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": [], "notes": {"psa": "Pseudomonas intrinsically resistant.", "pmir": "Proteus/Providencia/Morganella intrinsically resistant.", "mrsa": "Broad MDR coverage (MRSA, VRE, CRE, CRAB, anaerobes) but bacteriostatic with low serum levels — AVOID for bacteremia and UTI; FDA mortality warning.", "cre": "Activity vs CRE (often combination)."}}, {"name": "Eravacycline", "sub": "fluorocycline", "cidal": false, "route": "IV", "c": {"spn": "first", "spnr": "first", "vgs": "sec", "bhs": "first", "mssa": "first", "mrsa": "first", "cons": "sec", "efs": "first", "efm": "first", "vre": "first", "lis": "sec", "cory": "sec", "eco": "first", "pmir": "intr", "ampc": "first", "esbl": "first", "cre": "sec", "crem": "sec", "sal": "sec", "psa": "intr", "psdtr": "intr", "ab": "first", "sm": "sec", "bcc": "sec", "hi": "sec", "mc": "sec", "ng": "none", "nm": "none", "past": "sec", "eik": "sec", "bfrag": "first", "oana": "first", "gpana": "first", "cdiff": "na", "myc": "sec", "leg": "sec", "rick": "sec", "kpn": "first", "nocard": "var", "camp": "var", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": [], "notes": {"ab": "Most potent tetracycline-class agent vs MDR Acinetobacter (2–4× tigecycline).", "psa": "No Pseudomonas activity.", "pmir": "Morganellaceae intrinsically resistant.", "mrsa": "Broad MDR Gram-positive/negative coverage (MRSA/VRE/ESBL/CRE); approved for cIAI."}}, {"name": "Omadacycline", "sub": "aminomethylcycline", "cidal": false, "route": "IV/PO", "c": {"spn": "first", "spnr": "first", "vgs": "sec", "bhs": "first", "mssa": "sec", "mrsa": "sec", "cons": "sec", "efs": "sec", "efm": "sec", "vre": "sec", "lis": "sec", "cory": "sec", "eco": "sec", "pmir": "intr", "ampc": "var", "esbl": "var", "cre": "none", "crem": "none", "sal": "none", "psa": "intr", "psdtr": "intr", "ab": "var", "sm": "var", "bcc": "none", "hi": "sec", "mc": "sec", "ng": "none", "nm": "none", "past": "sec", "eik": "sec", "bfrag": "var", "oana": "var", "gpana": "var", "cdiff": "na", "myc": "first", "leg": "sec", "rick": "sec", "kpn": "sec", "nocard": "none", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": [], "notes": {"spn": "Approved for community-acquired pneumonia and skin infection; oral and IV.", "psa": "No Pseudomonas activity.", "pmir": "Morganellaceae intrinsically resistant."}}]}, {"name": "Macrolide & lincosamide", "mech": "50S ribosome", "rail": "--ochre", "agents": [{"name": "Azithromycin / clarithromycin", "sub": "macrolide", "cidal": false, "route": "IV/PO", "c": {"spn": "var", "spnr": "var", "vgs": "var", "bhs": "sec", "mssa": "none", "mrsa": "none", "cons": "none", "efs": "none", "efm": "none", "vre": "none", "lis": "none", "cory": "none", "eco": "intr", "pmir": "intr", "ampc": "intr", "esbl": "intr", "cre": "intr", "crem": "intr", "sal": "sec", "psa": "intr", "psdtr": "intr", "ab": "intr", "sm": "intr", "bcc": "intr", "hi": "sec", "mc": "first", "ng": "sec", "nm": "sec", "past": "none", "eik": "none", "bfrag": "none", "oana": "var", "gpana": "var", "cdiff": "na", "myc": "first", "leg": "first", "rick": "none", "kpn": "intr", "nocard": "none", "camp": "first", "vib": "none", "actino": "var", "trep": "var", "borr": "sec", "lepto": "sec", "bruc": "none", "fran": "none", "bart": "first", "cox": "var"}, "doc": ["myc", "leg", "camp"], "notes": {"spn": "Pneumococcal macrolide resistance common — not monotherapy for invasive disease.", "leg": "Azithromycin (or a respiratory FQ) for Legionella.", "myc": "Reliable for Mycoplasma/Chlamydophila atypical pneumonia.", "sal": "Azithromycin effective in vivo for typhoid even when in-vitro testing suggests otherwise.", "camp": "Macrolide is first-line for Campylobacter enteritis; fluoroquinolone resistance is now common, and Campylobacter is intrinsically cephalosporin-resistant — use an aminoglycoside or carbapenem for bacteremia.", "bart": "Azithromycin for cat-scratch lymphadenitis."}}, {"name": "Clindamycin", "sub": "lincosamide", "cidal": false, "route": "IV/PO", "c": {"spn": "sec", "spnr": "var", "vgs": "sec", "bhs": "first", "mssa": "first", "mrsa": "var", "cons": "var", "efs": "intr", "efm": "intr", "vre": "intr", "lis": "none", "cory": "sec", "eco": "intr", "pmir": "intr", "ampc": "intr", "esbl": "intr", "cre": "intr", "crem": "intr", "sal": "intr", "psa": "intr", "psdtr": "intr", "ab": "intr", "sm": "intr", "bcc": "intr", "hi": "none", "mc": "none", "ng": "none", "nm": "none", "past": "none", "eik": "none", "bfrag": "var", "oana": "sec", "gpana": "sec", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "intr", "nocard": "none", "camp": "none", "vib": "none", "actino": "sec", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": [], "notes": {"bhs": "Adjunct for toxin suppression in invasive group A strep / necrotizing infection (Eagle effect).", "mrsa": "CA-MRSA option if D-test negative (inducible resistance); high C. difficile risk.", "bfrag": "Rising B. fragilis resistance — metronidazole more reliable.", "efs": "No enterococcal activity."}}]}, {"name": "Glyco- / lipo- / oxazolidinone / streptogramin — anti-Gram-positive", "mech": "Cell wall / membrane / 50S", "rail": "--plum", "agents": [{"name": "Vancomycin (IV)", "sub": "glycopeptide", "cidal": true, "route": "IV", "c": {"spn": "first", "spnr": "first", "vgs": "first", "bhs": "first", "mssa": "first", "mrsa": "first", "cons": "first", "efs": "sec", "efm": "sec", "vre": "none", "lis": "sec", "cory": "first", "eco": "intr", "pmir": "intr", "ampc": "intr", "esbl": "intr", "cre": "intr", "crem": "intr", "sal": "intr", "psa": "intr", "psdtr": "intr", "ab": "intr", "sm": "intr", "bcc": "intr", "hi": "intr", "mc": "intr", "ng": "intr", "nm": "intr", "past": "intr", "eik": "intr", "bfrag": "intr", "oana": "intr", "gpana": "sec", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "intr", "nocard": "none", "camp": "none", "vib": "none", "actino": "var", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["mrsa"], "notes": {"mrsa": "Workhorse for MRSA; target AUC/MIC 400–600.", "vre": "VRE by definition resistant (vanA/vanB).", "eco": "No Gram-negative activity — too large for the outer membrane (intrinsic).", "cdiff": "ORAL vancomycin treats C. difficile (not absorbed); IV vancomycin does NOT.", "cory": "Reliable for resistant Gram-positive rods (Corynebacterium, Cutibacterium)."}}, {"name": "Daptomycin", "sub": "cyclic lipopeptide", "cidal": true, "route": "IV", "c": {"spn": "first", "spnr": "first", "vgs": "first", "bhs": "first", "mssa": "first", "mrsa": "first", "cons": "first", "efs": "first", "efm": "first", "vre": "first", "lis": "sec", "cory": "sec", "eco": "intr", "pmir": "intr", "ampc": "intr", "esbl": "intr", "cre": "intr", "crem": "intr", "sal": "intr", "psa": "intr", "psdtr": "intr", "ab": "intr", "sm": "intr", "bcc": "intr", "hi": "intr", "mc": "intr", "ng": "intr", "nm": "intr", "past": "intr", "eik": "intr", "bfrag": "intr", "oana": "intr", "gpana": "var", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "intr", "nocard": "none", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["vre"], "notes": {"vre": "Bactericidal Gram-positive agent — first-line for VRE bacteremia (≥10 mg/kg).", "mrsa": "Alternative to vancomycin for MRSA bacteremia.", "spn": "Inactivated by pulmonary surfactant — NEVER use for pneumonia.", "eco": "No Gram-negative activity (intrinsic)."}}, {"name": "Linezolid / tedizolid", "sub": "oxazolidinone", "cidal": false, "route": "IV/PO", "c": {"spn": "first", "spnr": "first", "vgs": "first", "bhs": "first", "mssa": "first", "mrsa": "first", "cons": "first", "efs": "first", "efm": "first", "vre": "first", "lis": "sec", "cory": "first", "eco": "intr", "pmir": "intr", "ampc": "intr", "esbl": "intr", "cre": "intr", "crem": "intr", "sal": "intr", "psa": "intr", "psdtr": "intr", "ab": "intr", "sm": "intr", "bcc": "intr", "hi": "intr", "mc": "intr", "ng": "intr", "nm": "intr", "past": "intr", "eik": "intr", "bfrag": "var", "oana": "var", "gpana": "var", "cdiff": "na", "myc": "none", "leg": "none", "rick": "none", "kpn": "intr", "nocard": "first", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["vre"], "notes": {"vre": "First-line oral/IV option for VRE; ~100% oral bioavailability.", "mrsa": "Preferred for MRSA pneumonia (penetrates lung; daptomycin cannot).", "eco": "No Gram-negative activity.", "cory": "Also active vs Nocardia and some mycobacteria; cytopenias >14 d, serotonin-syndrome risk.", "nocard": "Universally active against Nocardia (~100% susceptible) — useful oral salvage and for sulfa-allergic patients."}}, {"name": "Lipoglycopeptides", "sub": "dalba / orita / telavancin", "cidal": true, "route": "IV", "c": {"spn": "first", "spnr": "first", "vgs": "first", "bhs": "first", "mssa": "first", "mrsa": "first", "cons": "first", "efs": "sec", "efm": "var", "vre": "var", "lis": "sec", "cory": "first", "eco": "intr", "pmir": "intr", "ampc": "intr", "esbl": "intr", "cre": "intr", "crem": "intr", "sal": "intr", "psa": "intr", "psdtr": "intr", "ab": "intr", "sm": "intr", "bcc": "intr", "hi": "intr", "mc": "intr", "ng": "intr", "nm": "intr", "past": "intr", "eik": "intr", "bfrag": "none", "oana": "none", "gpana": "var", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "intr", "nocard": "none", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": [], "notes": {"mrsa": "Long-acting Gram-positive agents — dalbavancin/oritavancin give single- or two-dose ABSSSI regimens.", "vre": "Oritavancin active vs vanA VRE; dalbavancin not.", "eco": "No Gram-negative activity."}}, {"name": "Quinupristin-dalfopristin", "sub": "streptogramin", "cidal": true, "route": "IV", "c": {"spn": "sec", "spnr": "sec", "vgs": "sec", "bhs": "sec", "mssa": "sec", "mrsa": "sec", "cons": "sec", "efs": "none", "efm": "sec", "vre": "sec", "lis": "none", "cory": "sec", "eco": "intr", "pmir": "intr", "ampc": "intr", "esbl": "intr", "cre": "intr", "crem": "intr", "sal": "intr", "psa": "intr", "psdtr": "intr", "ab": "intr", "sm": "intr", "bcc": "intr", "hi": "intr", "mc": "intr", "ng": "intr", "nm": "intr", "past": "intr", "eik": "intr", "bfrag": "none", "oana": "none", "gpana": "none", "cdiff": "na", "myc": "sec", "leg": "none", "rick": "none", "kpn": "intr", "nocard": "none", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": [], "notes": {"efs": "NOT active vs E. faecalis (only E. faecium).", "vre": "Active vs E. faecium VRE; significant myalgia/arthralgia — largely supplanted."}}]}, {"name": "Other agents", "mech": "various — see agent", "rail": "--slate", "agents": [{"name": "Trimethoprim-sulfamethoxazole", "sub": "folate synthesis", "cidal": true, "route": "IV/PO", "c": {"spn": "var", "spnr": "var", "vgs": "none", "bhs": "none", "mssa": "first", "mrsa": "first", "cons": "sec", "efs": "none", "efm": "none", "vre": "none", "lis": "sec", "cory": "sec", "eco": "sec", "pmir": "sec", "ampc": "sec", "esbl": "var", "cre": "none", "crem": "none", "sal": "sec", "psa": "intr", "psdtr": "intr", "ab": "var", "sm": "first", "bcc": "first", "hi": "sec", "mc": "sec", "ng": "none", "nm": "none", "past": "none", "eik": "none", "bfrag": "intr", "oana": "intr", "gpana": "intr", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "sec", "nocard": "first", "camp": "none", "vib": "sec", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "sec", "fran": "none", "bart": "var", "cox": "var"}, "doc": ["sm", "nocard"], "notes": {"sm": "Drug of choice for S. maltophilia.", "mrsa": "Reliable oral CA-MRSA option; also covers Nocardia and PJP.", "bcc": "One of few agents active vs Burkholderia cepacia.", "psa": "No Pseudomonas activity.", "bhs": "Unreliable vs group A strep — not for streptococcal cellulitis.", "nocard": "Sulfonamides are the backbone of nocardiosis therapy; severe/CNS disease adds amikacin + imipenem or ceftriaxone. Susceptibility is species-dependent — speciate and test."}}, {"name": "Metronidazole", "sub": "nitroimidazole", "cidal": true, "route": "IV/PO", "c": {"spn": "intr", "spnr": "intr", "vgs": "intr", "bhs": "intr", "mssa": "intr", "mrsa": "intr", "cons": "intr", "efs": "intr", "efm": "intr", "vre": "intr", "lis": "intr", "cory": "intr", "eco": "intr", "pmir": "intr", "ampc": "intr", "esbl": "intr", "cre": "intr", "crem": "intr", "sal": "intr", "psa": "intr", "psdtr": "intr", "ab": "intr", "sm": "intr", "bcc": "intr", "hi": "intr", "mc": "intr", "ng": "intr", "nm": "intr", "past": "intr", "eik": "intr", "bfrag": "first", "oana": "first", "gpana": "var", "cdiff": "sec", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "intr", "nocard": "none", "camp": "none", "vib": "none", "actino": "intr", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["bfrag"], "notes": {"bfrag": "Drug of choice for B. fragilis and Gram-negative anaerobes (below the diaphragm).", "gpana": "Variable vs Gram-positive anaerobes — Actinomyces and Cutibacterium are resistant.", "cdiff": "Oral metronidazole is now a fallback for mild C. difficile only; IV added in fulminant disease.", "mssa": "No aerobic activity (intrinsic — requires anaerobic nitroreduction).", "actino": "Actinomyces is intrinsically resistant to metronidazole — the key contrast with Bacteroides in the same group."}}, {"name": "Fosfomycin", "sub": "MurA (early cell wall)", "cidal": true, "route": "PO", "c": {"spn": "var", "spnr": "none", "vgs": "none", "bhs": "none", "mssa": "var", "mrsa": "var", "cons": "none", "efs": "sec", "efm": "var", "vre": "var", "lis": "none", "cory": "none", "eco": "first", "pmir": "var", "ampc": "var", "esbl": "sec", "cre": "var", "crem": "var", "sal": "none", "psa": "var", "psdtr": "none", "ab": "none", "sm": "none", "bcc": "none", "hi": "intr", "mc": "intr", "ng": "intr", "nm": "intr", "past": "intr", "eik": "intr", "bfrag": "intr", "oana": "intr", "gpana": "intr", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "var", "nocard": "none", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": [], "notes": {"eco": "Single-dose oral therapy for E. coli cystitis, including many ESBL producers (lower tract only).", "esbl": "Useful oral option for ESBL cystitis.", "vre": "Retains activity vs many enterococci including VRE (cystitis).", "psa": "Variable; not reliable for Pseudomonas."}}, {"name": "Nitrofurantoin", "sub": "urinary (multiple targets)", "cidal": true, "route": "PO", "c": {"spn": "none", "spnr": "none", "vgs": "none", "bhs": "none", "mssa": "var", "mrsa": "var", "cons": "var", "efs": "first", "efm": "sec", "vre": "sec", "lis": "none", "cory": "none", "eco": "first", "pmir": "intr", "ampc": "var", "esbl": "sec", "cre": "var", "crem": "var", "sal": "none", "psa": "intr", "psdtr": "intr", "ab": "intr", "sm": "intr", "bcc": "intr", "hi": "intr", "mc": "intr", "ng": "intr", "nm": "intr", "past": "intr", "eik": "intr", "bfrag": "intr", "oana": "intr", "gpana": "intr", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "var", "nocard": "none", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": [], "notes": {"eco": "First-line for uncomplicated E. coli cystitis — urine-concentrated only, no tissue/blood levels (not for pyelonephritis or bacteremia).", "pmir": "Proteus intrinsically resistant.", "esbl": "Option for ESBL cystitis (lower tract only).", "psa": "Pseudomonas intrinsically resistant.", "efs": "Reliable for enterococcal cystitis incl. many VRE."}}, {"name": "Chloramphenicol", "sub": "50S ribosome", "cidal": false, "route": "IV/PO", "c": {"spn": "sec", "spnr": "sec", "vgs": "sec", "bhs": "sec", "mssa": "sec", "mrsa": "var", "cons": "var", "efs": "sec", "efm": "var", "vre": "var", "lis": "sec", "cory": "sec", "eco": "sec", "pmir": "var", "ampc": "var", "esbl": "var", "cre": "none", "crem": "none", "sal": "sec", "psa": "intr", "psdtr": "intr", "ab": "var", "sm": "var", "bcc": "var", "hi": "sec", "mc": "sec", "ng": "sec", "nm": "first", "past": "sec", "eik": "sec", "bfrag": "sec", "oana": "sec", "gpana": "sec", "cdiff": "na", "myc": "sec", "leg": "sec", "rick": "sec", "kpn": "sec", "nocard": "none", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "sec", "bart": "none", "cox": "none"}, "doc": [], "notes": {"nm": "Alternative for meningococcus in severe β-lactam allergy.", "mssa": "Very broad but limited by aplastic anemia / marrow suppression — reserve.", "psa": "No Pseudomonas activity."}}, {"name": "Rifampin", "sub": "RNA polymerase · ADJUNCT only", "cidal": true, "route": "IV/PO", "c": {"spn": "sec", "spnr": "sec", "vgs": "sec", "bhs": "sec", "mssa": "sec", "mrsa": "sec", "cons": "sec", "efs": "none", "efm": "none", "vre": "none", "lis": "none", "cory": "sec", "eco": "intr", "pmir": "intr", "ampc": "intr", "esbl": "intr", "cre": "intr", "crem": "intr", "sal": "intr", "psa": "intr", "psdtr": "intr", "ab": "intr", "sm": "intr", "bcc": "intr", "hi": "sec", "mc": "sec", "ng": "sec", "nm": "first", "past": "none", "eik": "none", "bfrag": "var", "oana": "var", "gpana": "var", "cdiff": "na", "myc": "none", "leg": "sec", "rick": "none", "kpn": "intr", "nocard": "none", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "first", "fran": "none", "bart": "sec", "cox": "none"}, "doc": [], "notes": {"mrsa": "NEVER monotherapy (rapid resistance) — adjunct for prosthetic-material/biofilm staph infection (PJI, PVE).", "nm": "Used for meningococcal prophylaxis.", "leg": "Occasionally added in severe Legionella (debated).", "eco": "Gram-negative enterics intrinsically resistant."}}, {"name": "Colistin / polymyxin B", "sub": "membrane · last resort", "cidal": true, "route": "IV", "c": {"spn": "intr", "spnr": "intr", "vgs": "intr", "bhs": "intr", "mssa": "intr", "mrsa": "intr", "cons": "intr", "efs": "intr", "efm": "intr", "vre": "intr", "lis": "intr", "cory": "intr", "eco": "sec", "pmir": "intr", "ampc": "sec", "esbl": "sec", "cre": "sec", "crem": "sec", "sal": "sec", "psa": "sec", "psdtr": "sec", "ab": "sec", "sm": "none", "bcc": "intr", "hi": "none", "mc": "none", "ng": "intr", "nm": "intr", "past": "none", "eik": "none", "bfrag": "intr", "oana": "intr", "gpana": "intr", "cdiff": "na", "myc": "intr", "leg": "intr", "rick": "intr", "kpn": "sec", "nocard": "none", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": [], "notes": {"pmir": "Proteus, Providencia, Morganella and Serratia are intrinsically polymyxin-resistant.", "cre": "Last-resort for carbapenem-resistant GNR — nephro/neurotoxic; largely supplanted by novel β-lactams.", "bcc": "Burkholderia cepacia intrinsically resistant.", "sm": "Not reliable for Stenotrophomonas.", "mssa": "No Gram-positive or anaerobic activity (intrinsic)."}}, {"name": "Lefamulin", "sub": "pleuromutilin · 50S · CABP", "cidal": false, "route": "IV/PO", "c": {"spn": "first", "spnr": "first", "vgs": "sec", "bhs": "sec", "mssa": "sec", "mrsa": "sec", "cons": "sec", "efs": "none", "efm": "none", "vre": "none", "lis": "none", "cory": "sec", "eco": "intr", "pmir": "intr", "ampc": "intr", "esbl": "intr", "cre": "intr", "crem": "intr", "sal": "intr", "psa": "intr", "psdtr": "intr", "ab": "intr", "sm": "intr", "bcc": "intr", "hi": "sec", "mc": "sec", "ng": "sec", "nm": "none", "past": "none", "eik": "none", "bfrag": "var", "oana": "var", "gpana": "var", "cdiff": "na", "myc": "first", "leg": "first", "rick": "none", "kpn": "intr", "nocard": "none", "camp": "none", "vib": "none", "actino": "none", "trep": "na", "borr": "na", "lepto": "na", "bruc": "none", "fran": "none", "bart": "none", "cox": "none"}, "doc": ["myc"], "notes": {"spn": "Approved for community-acquired bacterial pneumonia (pneumococcus, atypicals, H. influenzae); oral and IV.", "myc": "Reliable atypical coverage.", "ng": "Investigated for gonorrhea."}}]}];
const SCALE = [{"k": "first", "glyph": "lv-first", "label": "Reliable / first-line-eligible", "desc": "Dependable activity against typical isolates; appropriate to use where clinically indicated."}, {"k": "sec", "glyph": "lv-sec", "label": "Active — alternative / second-line", "desc": "Useful activity but not the preferred agent (spectrum, potency, toxicity, or stewardship)."}, {"k": "var", "glyph": "lv-var", "label": "Variable / inducible / susceptibility-dependent", "desc": "Activity is unreliable — emerging resistance, inducible enzymes, or strain-dependent; confirm with testing."}, {"k": "none", "glyph": "lv-none", "label": "No useful activity", "desc": "Acquired or typical resistance; not a treatment option."}, {"k": "intr", "glyph": "lv-intr", "label": "Intrinsic resistance", "desc": "The organism is inherently resistant — structural or enzymatic; the agent cannot work regardless of testing."}, {"k": "na", "glyph": "lv-na", "label": "Not clinically applicable", "desc": "Not a treatment relationship considered for this organism."}];
const FOOTNOTES = [{"h": "★ marks a drug of choice, not merely activity", "b": "A filled circle means the agent is reliably active. The gold star is reserved for organisms where this agent is a preferred first choice — e.g., nafcillin/cefazolin for MSSA, ampicillin for Listeria and E. faecalis, ceftriaxone for gonococcus, doxycycline for tick-borne and most zoonotic disease, penicillin G for syphilis and actinomycosis, TMP-SMX for Nocardia and Stenotrophomonas, vancomycin for MRSA."}, {"h": "Intrinsic vs acquired resistance", "b": "A slashed open circle (intrinsic) means the organism is inherently impervious — vancomycin cannot cross a Gram-negative outer membrane; aztreonam has no Gram-positive target; Proteus, Serratia and the Morganellaceae are inherently polymyxin- and tetracycline-resistant; Actinomyces is inherently metronidazole-resistant; Campylobacter is inherently cephalosporin-resistant. A plain open circle (no useful activity) more often reflects acquired resistance or a spectrum gap. An intrinsic gap will never be overcome by a susceptible report."}, {"h": "'Susceptible in vitro' is not always 'use it'", "b": "Piperacillin-tazobactam frequently tests susceptible against ESBL producers, yet the MERINO trial showed inferiority to meropenem for ESBL bacteremia. Cephalosporins may test susceptible against AmpC inducers (Enterobacter, Serratia, Citrobacter) but risk treatment-emergent derepression — cefepime or a carbapenem is preferred (IDSA 2024). The chart encodes these as variable for that reason."}, {"h": "The resistant-Gram-negative escape hierarchy", "b": "KPC/OXA-48 → ceftazidime-avibactam, meropenem-vaborbactam, or imipenem-relebactam. Metallo-β-lactamase (NDM/VIM/IMP) → cefiderocol, or ceftazidime-avibactam plus aztreonam. Carbapenem-resistant Acinetobacter → sulbactam-durlobactam (with a carbapenem). Stenotrophomonas → two of TMP-SMX, minocycline, cefiderocol, or levofloxacin. These define the reserve-agent columns."}, {"h": "Static vs cidal and the site of infection", "b": "Bactericidal agents (solid ring in the agent label) are preferred for endocarditis, meningitis, and neutropenia. Bacteriostatic agents (dashed ring) are adequate for most other infections. Tigecycline and the glycylcyclines are bacteriostatic with low serum levels — broad on paper but inappropriate for bacteremia or urinary infection. Daptomycin is bactericidal but inactivated by pulmonary surfactant — never for pneumonia. Linezolid penetrates lung where daptomycin fails."}, {"h": "This is a spectrum map, not a susceptibility report", "b": "Cells reflect expected/intrinsic activity against typical isolates from authoritative references — they are a teaching and empiric-reasoning aid. Local resistance can differ substantially. Always defer to the organism's own susceptibility result and your local antibiogram before treating."}];
const SOURCES = [{"t": "Intrinsic resistance / expected resistant phenotypes", "src": "EUCAST"}, {"t": "AMR Gram-negative guidance 2024 (ciae403)", "src": "IDSA"}, {"t": "Antimicrobial & organism monographs (StatPearls, PubMed)", "src": "NCBI / NLM"}, {"t": "CAP, HAP/VAP, AMR & zoonotic treatment guidelines", "src": "ATS / IDSA / CDC"}, {"t": "Cefiderocol, glycylcycline, Nocardia & Vibrio primary data", "src": "PMC / CID / JAC / AAC"}, {"t": "Cell-wall, ribosomal & membrane pharmacology", "src": "standard references"}];

/* ===================== PRIMITIVES ===================== */
const SG_BY_ID = Object.fromEntries(SUPERGROUPS.map(s => [s.id, s]));
const ORG_BY_ID = Object.fromEntries(ORGS.map(o => [o.id, o]));
const RAIL_VAR = { "--blue":"var(--blue)","--violet":"#5B3A82","--green":"#2F6D4A","--teal":"#1F6B6B","--ochre":"#8A5A12","--plum":"#5A4A6B","--slate":"#4A5568" };

function railColor(r){ return RAIL_VAR[r] || "var(--muted)"; }

function Glyph({ level, star, showIntr }) {
  let lv = level;
  if (lv === "intr" && !showIntr) lv = "none";
  return (
    <span className={"sx-gly lv-" + lv}>
      {star && lv !== "na" && <span className="sx-star"><Star size={9} fill="currentColor" /></span>}
    </span>
  );
}

function OrgName({ o }) {
  return <span>{o.italic ? <em>{o.label}</em> : o.label}{o.sub ? <small> {o.sub}</small> : null}</span>;
}

function RouteBadges({ route }) {
  const parts = route.split("/");
  return (
    <span className="sx-labbadges">
      {parts.includes("IV") && <span className="sx-rtbadge">IV</span>}
      {parts.includes("PO") && <span className="sx-rtbadge po">PO</span>}
    </span>
  );
}

/* ===================== MAIN ===================== */
function SpectrumChart() {
  const [q, setQ] = useState("");
  const [sgOn, setSgOn] = useState(() => SUPERGROUPS.map(s => s.id));
  const [clsOn, setClsOn] = useState(() => CLASSES.map(c => c.name));
  const [hoverRow, setHoverRow] = useState(null);
  const [hoverCol, setHoverCol] = useState(null);
  const [lockRow, setLockRow] = useState(null);
  const [lockCol, setLockCol] = useState(null);
  const [showIntr, setShowIntr] = useState(true);
  const [tip, setTip] = useState(null);
  /* W12 · click-to-lock cell crosshair. `lockCell` is {agent,org}
     or null. When set, the crosshair stays painted until the cell
     is clicked again or another cell is clicked. The locked cell
     gains a stronger glow + a tiny "× clear" pill. */
  const [lockCell, setLockCell] = useState(null);
  /* W12 · scout tooltip — 200×88px glass-diffuse pop-over anchored
     above (or below) a hovered cell. 240ms enter, 80ms leave; both
     bypassed by reduced motion. The hovered cell rect drives the
     positioning so the tip can flip below when the cell is in the
     top row. Decoupled from the existing follow-cursor `tip`. */
  const reducedMotion = useReducedMotion();
  const scoutDelays = reducedMotion
    ? { enterMs: 0, leaveMs: 0 }
    : { enterMs: 240, leaveMs: 80 };
  const scout = useHoverDelay(scoutDelays);
  const [scoutPayload, setScoutPayload] = useState(null);
  /* W12 · multi-cell compare list (max 4). Cmd/Ctrl-click a cell
     to add; click the dock "Compare" CTA to jump to the regimens
     compare panel pre-filled. */
  const [compareCells, setCompareCells] = useState([]);
  /* Fullscreen mode — lifts the 49×~80 matrix out of the page flow into a
     position:fixed overlay so the table can take the entire viewport. The
     legend / footnotes / sources collapse so the matrix has all the vertical
     real estate. On a wide monitor (≥1920px) the matrix fits without
     horizontal scroll; on narrower screens horizontal scroll remains but
     vertical scroll is no longer bounded by max-height:78vh. */
  const [fullscreen, setFullscreen] = useState(false);
  React.useEffect(() => {
    if(!fullscreen || typeof document === "undefined") return;
    const onKey = (e) => { if(e.key === "Escape") setFullscreen(false); };
    document.addEventListener("keydown", onKey);
    // Prevent body scroll behind the overlay.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [fullscreen]);

  const ql = q.trim().toLowerCase();
  const qOrgs = useMemo(() => {
    if (!ql) return [];
    return ORGS.filter(o => (o.label + " " + o.sub).toLowerCase().includes(ql)).map(o => o.id);
  }, [ql]);
  const qAgents = useMemo(() => {
    if (!ql) return new Set();
    const s = new Set();
    CLASSES.forEach(c => c.agents.forEach(a => { if ((a.name + " " + a.sub + " " + c.name).toLowerCase().includes(ql)) s.add(a.name); }));
    return s;
  }, [ql]);

  const visOrgs = useMemo(() => ORGS.filter(o =>
    sgOn.includes(o.sg) && (qOrgs.length === 0 || qOrgs.includes(o.id))
  ), [sgOn, qOrgs]);

  const visClasses = useMemo(() => CLASSES
    .filter(c => clsOn.includes(c.name))
    .map(c => ({ ...c, agents: c.agents.filter(a => qAgents.size === 0 || qAgents.has(a.name)) }))
    .filter(c => c.agents.length > 0)
  , [clsOn, qAgents]);

  const nAgents = visClasses.reduce((n, c) => n + c.agents.length, 0);

  const lockActive = lockRow || lockCol || lockCell;
  const toggleSg = (id) => setSgOn(s => s.includes(id) ? (s.length > 1 ? s.filter(x => x !== id) : s) : [...s, id]);
  const toggleCls = (n) => setClsOn(s => s.includes(n) ? (s.length > 1 ? s.filter(x => x !== n) : s) : [...s, n]);
  const reset = () => {
    setQ(""); setSgOn(SUPERGROUPS.map(s => s.id)); setClsOn(CLASSES.map(c => c.name));
    setLockRow(null); setLockCol(null); setLockCell(null); setCompareCells([]);
  };

  /* W12 · cell click handler. Cmd/Ctrl-click adds to the compare
     list (max 4); a bare click toggles the lock-cell crosshair.
     Locked-cell click again unlocks. The keyboard/coarse-pointer
     path skips entry animation but the behaviour is identical. */
  const onCellClick = (e, agent, org) => {
    if(e.metaKey || e.ctrlKey) {
      e.preventDefault();
      setCompareCells(prev => {
        const exists = prev.findIndex(c => c.agent === agent.name && c.orgId === org.id);
        if(exists >= 0) return prev.filter((_, i) => i !== exists);
        if(prev.length >= 4) return prev;
        return [...prev, { agent: agent.name, sub: agent.sub, orgId: org.id, orgLabel: org.label, orgItalic: !!org.italic, orgSub: org.sub || "", lv: agent.c[org.id], cls: undefined }];
      });
      return;
    }
    setLockCell(prev => {
      if(prev && prev.agent === agent.name && prev.orgId === org.id) return null;
      return { agent: agent.name, sub: agent.sub, orgId: org.id, orgLabel: org.label, orgItalic: !!org.italic, orgSub: org.sub || "", lv: agent.c[org.id] };
    });
    /* Locking a cell also sets the row+column highlight so the
       crosshair persists exactly as the spec asks. */
    setHoverRow(agent.name); setHoverCol(org.id);
  };

  const enterCell = (e, agent, cls, org) => {
    setHoverRow(agent.name); setHoverCol(org.id);
    const lv = agent.c[org.id];
    const meta = SCALE.find(s => s.k === lv);
    setTip({
      x: e.clientX, y: e.clientY,
      org, agent: agent.name, sub: agent.sub,
      lvLabel: meta ? meta.label : lv,
      note: agent.notes[org.id] || ""
    });
    /* W12 scout — only fire for cells with non-zero coverage
       (anything other than "none"/"intr"/"na"). The rect of the
       <td> is captured immediately so the scout can sit anchored
       above (or below for top-row cells). */
    if(lv && lv !== "none" && lv !== "intr" && lv !== "na") {
      const cell = e.currentTarget;
      const r = cell.getBoundingClientRect();
      const key = agent.name + "::" + org.id;
      setScoutPayload({
        key, agent: agent.name, sub: agent.sub,
        org, lvLabel: meta ? meta.label : lv, lv,
        star: agent.doc.includes(org.id),
        note: agent.notes[org.id] || "",
        cellTop: r.top, cellBottom: r.bottom, cellLeft: r.left, cellWidth: r.width,
      });
      scout.enter(key);
    } else {
      scout.leave();
      setScoutPayload(null);
    }
  };
  const moveCell = (e) => setTip(t => t ? { ...t, x: e.clientX, y: e.clientY } : t);
  const leaveCell = () => {
    if (!lockActive) { setHoverRow(null); setHoverCol(null); }
    /* If a cell is locked, restore its crosshair coordinates so
       the locked highlight stays put after a sibling hover-out. */
    if(lockCell) { setHoverRow(lockCell.agent); setHoverCol(lockCell.orgId); }
    setTip(null);
    scout.leave();
  };

  /* W12 · compare dock helpers. */
  const removeCompare = (idx) => setCompareCells(prev => prev.filter((_, i) => i !== idx));
  const clearCompare = () => setCompareCells([]);

  /* W12 · per-column coverage count for the sparkline. Counts
     agents covering each visible organism column — used to colour
     the column's bottom sparkline strip. */
  const colCoverage = useMemo(() => {
    const m = {};
    ORGS.forEach(o => { m[o.id] = 0; });
    CLASSES.forEach(c => c.agents.forEach(a => {
      ORGS.forEach(o => {
        const lv = a.c[o.id];
        if(lv === "first" || lv === "sec") m[o.id] += 1;
      });
    }));
    return m;
  }, []);

  const sgVisCount = (sgid) => visOrgs.filter(o => o.sg === sgid).length;

  return (
    <div className={"sx-root" + (fullscreen ? " sx-full" : "")} role={fullscreen ? "dialog" : undefined} aria-modal={fullscreen ? "true" : undefined} aria-label={fullscreen ? "Spectrum matrix — fullscreen view" : undefined}>
      <style>{CSS1 + CSS2}</style>

      <header className="sx-header">
        <div className="sx-wrap">
          <div className="sx-headrow">
            <div className="sx-mark"><Microscope size={20} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sx-kicker">Reference · Antibacterial</div>
              <h1 className="sx-title">Spectrum of Antibacterial Activity</h1>
              <p className="sx-sub">{CLASSES.reduce((n,c)=>n+c.agents.length,0)} agents across {SUPERGROUPS.length} taxonomic groups and {ORGS.length} organism columns. Coverage is encoded by fill fraction (more fill = more reliable activity); the slash marks intrinsic resistance; the gold star marks a drug of choice. A teaching and empiric-reasoning map of expected activity — not a substitute for the susceptibility report.</p>
            </div>
          </div>
        </div>
      </header>

      <div className="sx-controls">
        <div className="sx-wrap sx-ctrlrow">
          <div className="sx-searchwrap">
            <span className="sx-search-i"><Search size={15} /></span>
            <input className="sx-search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search agent or organism" />
            {q && <button className="sx-search-x" onClick={() => setQ("")} aria-label="Clear search"><X size={14} /></button>}
          </div>
          <span className="sx-ctrl-lab"><Layers size={12} /> Groups</span>
          <div className="sx-pillrow">
            {SUPERGROUPS.map(s => (
              <button key={s.id} className="sx-pill" data-on={sgOn.includes(s.id)} onClick={() => toggleSg(s.id)}
                style={sgOn.includes(s.id) ? { background: "var(--" + s.tint.slice(2) + ")", borderColor: "var(--" + s.tint.slice(2) + ")" } : {}}>
                <span className="sw" style={{ background: sgOn.includes(s.id) ? "#fff" : "var(--" + s.tint.slice(2) + ")" }} />{s.label}
              </button>
            ))}
          </div>
          <button className="sx-toggle" data-on={showIntr} onClick={() => setShowIntr(v => !v)} title="Distinguish intrinsic resistance from acquired/no activity">
            {showIntr ? <Eye size={13} /> : <EyeOff size={13} />} Intrinsic R
          </button>
          <button className="sx-toggle" data-on={fullscreen} onClick={() => setFullscreen(v => !v)} title={fullscreen ? "Exit fullscreen (Esc)" : "Expand the matrix to use the full screen"}>
            {fullscreen ? <Minimize2 size={13} /> : <Expand size={13} />} {fullscreen ? "Exit fullscreen" : "Fullscreen"}
          </button>
          {(q || sgOn.length < SUPERGROUPS.length || clsOn.length < CLASSES.length || lockActive) &&
            <button className="sx-reset" onClick={reset}><RotateCcw size={13} /> Reset</button>}
        </div>
        <div className="sx-wrap sx-ctrlrow" style={{ marginTop: 8 }}>
          <span className="sx-ctrl-lab"><Filter size={12} /> Classes</span>
          <div className="sx-pillrow">
            {CLASSES.map(c => (
              <button key={c.name} className="sx-pill" data-on={clsOn.includes(c.name)} onClick={() => toggleCls(c.name)}>
                <span className="sw" style={{ background: clsOn.includes(c.name) ? "#fff" : railColor(c.rail) }} />
                {c.name.length > 30 ? c.name.slice(0, 28) + "…" : c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sx-wrap">
        <Legend showIntr={showIntr} />
        <p className="sx-count">{nAgents} agents × {visOrgs.length} organisms shown{lockActive ? " · focus locked (click again to release)" : ""}</p>

        <div className="sx-mxwrap">
          <table className="sx-mx">
            <thead>
              <tr className="sx-sghead">
                <th className="sx-corner" rowSpan={2} style={{ top: 0 }}>
                  <div className="sx-cornlab">Mechanism class<b>Agent \\ Organism</b></div>
                </th>
                {SUPERGROUPS.filter(s => sgVisCount(s.id) > 0).map(s => (
                  <th key={s.id} className="sx-sgth" colSpan={sgVisCount(s.id)}
                    style={{ top: 0, color: "var(--" + s.tint.slice(2) + ")", background: "var(--" + s.bg.slice(2) + ")" }}>
                    {s.label}
                  </th>
                ))}
              </tr>
              <tr className="sx-orghead">
                {visOrgs.map(o => {
                  const on = hoverCol === o.id || lockCol === o.id;
                  return (
                    <th key={o.id} className={"sx-orgth" + (on ? " sx-col-on" : "")} style={{ top: 30 }}>
                      <button className="sx-orgbtn" onClick={() => setLockCol(lockCol === o.id ? null : o.id)}
                        onMouseEnter={() => !lockActive && setHoverCol(o.id)} onMouseLeave={() => !lockActive && setHoverCol(null)}>
                        {o.italic ? <em>{o.label}</em> : o.label}{o.sub ? <small> · {o.sub}</small> : null}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {visClasses.map(cls => (
                <React.Fragment key={cls.name}>
                  <tr className="sx-classrow">
                    <td colSpan={visOrgs.length + 1} style={{ padding: 0 }}>
                      <div className="sx-classband">
                        <span className="sx-classrail" style={{ background: railColor(cls.rail) }} />
                        <span className="sx-classname">{cls.name}</span>
                        <span className="sx-classmech">· {cls.mech}</span>
                      </div>
                    </td>
                  </tr>
                  {cls.agents.map(a => {
                    const rowOn = hoverRow === a.name || lockRow === a.name;
                    return (
                      <tr key={a.name} className={rowOn ? "sx-row-on" : ""}>
                        <td className="sx-lab">
                          <div className="sx-labinner">
                            <span className="sx-labrail" style={{ background: railColor(cls.rail) }} />
                            <div className="sx-labtx">
                              <button className="sx-labbtn" onClick={() => setLockRow(lockRow === a.name ? null : a.name)}
                                onMouseEnter={() => !lockActive && setHoverRow(a.name)} onMouseLeave={() => !lockActive && setHoverRow(null)}>
                                <span className="sx-labname">
                                  {a.name}
                                  <span className="sx-killmark" title={a.cidal ? "Bactericidal" : "Bacteriostatic"}>
                                    <span className={a.cidal ? "sx-cidal" : "sx-static"} style={{ width: 11, height: 11, display: "inline-block" }} />
                                  </span>
                                </span>
                                <span className="sx-labsub">{a.sub}</span>
                              </button>
                              <RouteBadges route={a.route} />
                            </div>
                          </div>
                        </td>
                        {visOrgs.map(o => {
                          const lv = a.c[o.id];
                          const star = a.doc.includes(o.id);
                          const xr = hoverRow === a.name, xc = hoverCol === o.id;
                          const cellLocked = lockCell && lockCell.agent === a.name && lockCell.orgId === o.id;
                          /* The dim mask now also honours the locked cell:
                             when lockCell is set, only the cell at that
                             {row,col} stays bright. */
                          const dim = lockActive && !(
                            (lockRow ? lockRow === a.name : true) &&
                            (lockCol ? lockCol === o.id : true) &&
                            (lockCell ? (lockCell.agent === a.name && lockCell.orgId === o.id) : true)
                          );
                          let cn = "sx-cell";
                          if (xr && xc) cn += " xhit"; else if (xr) cn += " xrow"; else if (xc) cn += " xcol";
                          if (dim) cn += " dim";
                          if (cellLocked) cn += " cell-locked";
                          const inCompare = compareCells.some(c => c.agent === a.name && c.orgId === o.id);
                          return (
                            <td key={o.id} className={cn} style={cellLocked ? { position: "relative" } : undefined}
                              onMouseEnter={e => enterCell(e, a, cls, o)} onMouseMove={moveCell} onMouseLeave={leaveCell}
                              onClick={e => onCellClick(e, a, o)}
                              aria-pressed={cellLocked ? "true" : undefined}
                              data-in-compare={inCompare ? "true" : undefined}>
                              <Glyph level={lv} star={star} showIntr={showIntr} />
                              {cellLocked && (
                                <button
                                  type="button"
                                  className="sx-cell-clear"
                                  aria-label="Clear locked cell"
                                  title="Clear locked cell"
                                  onClick={(ev) => { ev.stopPropagation(); setLockCell(null); }}
                                >
                                  <X size={9} />
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
              {/* W12 · per-column coverage sparkline. One 8px-tall SVG
                  strip per visible organism column showing how many
                  agents in the full formulary cover it. Cyan = high,
                  amber = mid, faint line = low. Pure SVG, static —
                  reduced-motion-safe by construction (no animation). */}
              <tr className="sx-sparkrow" aria-hidden="true">
                <td className="sx-spark-left">Coverage</td>
                {visOrgs.map(o => {
                  const n = colCoverage[o.id] || 0;
                  const tone = n >= 16 ? "var(--neon-cyan, var(--ox))"
                            : n >= 8  ? "var(--amber, #d97706)"
                            : "var(--line)";
                  /* 24-wide viewbox; the bar fills 0-24 with width
                     proportional to coverage, ramped through sqrt
                     so low/high counts spread visibly. */
                  const w = Math.max(2, Math.min(24, Math.sqrt(Math.max(0, n)) * 6));
                  return (
                    <td key={o.id} className="sx-spark-cell"
                        title={`${n} agents cover ${o.label}${o.sub ? " · " + o.sub : ""}`}>
                      <svg className="sx-spark" viewBox="0 0 24 8" preserveAspectRatio="none">
                        <rect x="0" y="3" width="24" height="2" fill="var(--line2)" rx="1" />
                        <rect x="0" y="2" width={w} height="4" fill={tone} rx="1" />
                      </svg>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="sx-fnwrap">
          <h3 className="sx-h3"><span className="ic"><BookOpen size={18} /></span>How to read the spectrum chart</h3>
          <div className="sx-fngrid">
            {FOOTNOTES.map((f, i) => (
              <div className="sx-fncard" key={i}>
                <h4><span className="n">{i + 1}</span>{f.h}</h4>
                <p>{f.b}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="sx-srcwrap">
          <div className="h">Primary sources</div>
          <div className="sx-srclist">
            {SOURCES.map((s, i) => (
              <span key={i} className="sx-srctag"><b>{s.src}</b> · {s.t}</span>
            ))}
          </div>
        </div>

        <p className="sx-foot">
          <b>Spectrum of Antibacterial Activity.</b> Adult clinical microbiology reference. Cells encode expected/intrinsic activity against typical isolates and drug-of-choice status — a teaching and empiric-reasoning aid, not a susceptibility report. Local resistance varies; always defer to the organism's own susceptibility result and your institutional antibiogram. Antibacterials only — antifungal, antiviral, antimycobacterial and antiparasitic agents are out of scope. Clinical content reflects sources current to the build date and will drift; reconfirm against live guidelines before treating.
        </p>
      </div>

      {tip && (
        <div className="sx-tip" style={{ left: tip.x, top: tip.y }}>
          <div className="tt-h">{tip.agent} <span style={{ opacity: .7 }}>×</span> <OrgName o={tip.org} /></div>
          <div className="tt-lv">{tip.lvLabel}</div>
          {tip.note && <div className="tt-note">{tip.note}</div>}
        </div>
      )}

      {/* W12 · scout tooltip — visible only while the hover-delay
          hook has resolved on the current cell. Positions itself
          above (or below for top-row cells) the anchor cell. */}
      {scout.key && scoutPayload && scout.key === scoutPayload.key && (() => {
        const SCOUT_W = 220, SCOUT_H = 96, GAP = 10;
        const aboveTop = scoutPayload.cellTop - SCOUT_H - GAP;
        const flipBelow = aboveTop < 8;
        const top = flipBelow
          ? scoutPayload.cellBottom + GAP
          : aboveTop;
        const centeredLeft = scoutPayload.cellLeft + (scoutPayload.cellWidth / 2) - (SCOUT_W / 2);
        const vw = (typeof window !== "undefined") ? window.innerWidth : 1280;
        const left = Math.max(8, Math.min(vw - SCOUT_W - 8, centeredLeft));
        return (
          <div className="sx-scout" role="status" aria-live="polite" style={{ left, top }}>
            <div className="sx-scout-h">
              {scoutPayload.star && <Star size={12} className="sx-scout-star" aria-label="Drug of choice" />}
              <span>{scoutPayload.agent}</span>
            </div>
            <div className="sx-scout-h" style={{ marginTop: 2, fontWeight: 600, fontSize: 11.5 }}>
              <span style={{ color: "var(--muted)", fontSize: 10, marginRight: 4 }}>vs</span>
              <OrgName o={scoutPayload.org} />
            </div>
            <div className="sx-scout-meta">
              <span><b>{scoutPayload.lvLabel}</b></span>
              {scoutPayload.star && <span>Drug of choice</span>}
            </div>
            {scoutPayload.note && (
              <div className="sx-scout-note">{scoutPayload.note}</div>
            )}
          </div>
        );
      })()}

      {/* W12 · multi-cell compare dock. Docks bottom-right when the
          user has Cmd/Ctrl-clicked any cells. Max 4. The CTA jumps
          the user to the regimens compare panel — implemented as a
          hashchange to #t=regimens so the existing tab/section
          router picks it up without us reaching across modules. */}
      {compareCells.length > 0 && (
        <div className="sx-cmpdock" role="region" aria-label="Spectrum compare selection">
          <div className="sx-cmpdock-h">
            <span>Compare · {compareCells.length}/4</span>
            <button type="button" onClick={clearCompare} aria-label="Clear compare list" title="Clear all">
              <X size={12} />
            </button>
          </div>
          <div className="sx-cmpdock-list">
            {compareCells.map((c, i) => {
              const orgFull = (c.orgItalic ? <em>{c.orgLabel}</em> : c.orgLabel);
              return (
                <div key={c.agent + "::" + c.orgId} className="sx-cmpdock-item">
                  <span className="sx-cmpdock-pair">
                    {c.agent} <span style={{ color: "var(--muted)" }}>×</span> {orgFull}
                  </span>
                  <button type="button" onClick={() => removeCompare(i)} aria-label={`Remove ${c.agent} × ${c.orgLabel}`}>
                    <X size={11} />
                  </button>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="sx-cmpdock-cta"
            disabled={compareCells.length < 2}
            title={compareCells.length < 2 ? "Add at least 2 cells (Cmd/Ctrl-click)" : "Compare in detail"}
            onClick={() => {
              /* Stash the selection on window for the regimens panel
                 to read; jump tabs via a hashchange so the App.jsx
                 hash-state router does the section switch for us. */
              try {
                if(typeof window !== "undefined") {
                  window.__spectrumCompareSelection = compareCells.map(c => ({
                    agent: c.agent, orgId: c.orgId, orgLabel: c.orgLabel, lv: c.lv,
                  }));
                  const h = "#t=regimens";
                  if(window.location.hash !== h) window.location.hash = h;
                }
              } catch(_) {}
            }}>
            Compare in detail →
          </button>
        </div>
      )}
    </div>
  );
}

function Legend({ showIntr }) {
  return (
    <div className="sx-legend">
      <div className="sx-legtitle"><Info size={13} /> How to read each cell</div>
      <div className="sx-leggrid">
        {SCALE.map(s => (
          <div className="sx-legitem" key={s.k}>
            <Glyph level={s.k} star={false} showIntr={true} />
            <span><b>{s.label}.</b> {s.desc}</span>
          </div>
        ))}
        <div className="sx-legitem">
          <Glyph level="first" star={true} showIntr={true} />
          <span><b>Drug of choice.</b> Gold star — a preferred first-line agent for that organism, beyond merely active.</span>
        </div>
      </div>
      <div className="sx-legmeta">
        <span className="mi"><span className="sx-cidal" /> Bactericidal</span>
        <span className="mi"><span className="sx-static" /> Bacteriostatic</span>
        <span className="mi"><span className="sx-rtbadge">IV</span> Intravenous</span>
        <span className="mi"><span className="sx-rtbadge po">PO</span> Oral available</span>
        <span className="mi"><span className="sx-railsamp" style={{ background: "var(--blue)" }} /> Left rail = mechanism class</span>
        <span className="mi"><Crosshair size={13} color="var(--ox)" /> Hover to cross-highlight · click an agent or organism to lock focus</span>
      </div>
      {/* W12 · drug-of-choice inline marker. The gold-star glyph is
          already meaningful in the matrix; this banner explains it
          in the legend so a first-time visitor can decode it. */}
      <div className="sx-doc-marker" title="Gold star marks a drug of choice">
        <Star size={12} fill="currentColor" />
        <span><b>Drug of choice:</b> gold star marks a preferred first-line agent</span>
      </div>
    </div>
  );
}

return { Chart: SpectrumChart, ORGS, CLASSES, SCALE, ORG_BY_ID, SG_BY_ID, ORG_SG, SUPERGROUPS };
})();

/* Re-expose the component under its historical name (consumed in renderSpectrum)
   and the read-only spectrum data for the cross-tab drawers + integrity suite. */
const SpectrumChartFull = SPECTRUM.Chart;

const SPX_ORGS    = SPECTRUM.ORGS;

          // 49-organism vocabulary [{id,label,italic,sub,sg}]
const SPX_CLASSES = SPECTRUM.CLASSES;

       // class → agents[] with per-organism activity map `c`
const SPX_SCALE   = SPECTRUM.SCALE;

         // level legend [{k,label,desc}]
const SPX_ORG_BY  = SPECTRUM.ORG_BY_ID;

     // id → organism
const SPX_SG_BY   = SPECTRUM.SG_BY_ID;

      // supergroup id → {label,tint,bg}
/* Flat agent list across all classes — the drug-drawer's spectrum lookup. */
const SPX_AGENTS  = SPX_CLASSES.flatMap(cl => cl.agents.map(a => ({ ...a, cls:cl.name, rail:cl.rail, mech:cl.mech })));

export { SPECTRUM, SpectrumChartFull, SPX_ORGS, SPX_CLASSES, SPX_SCALE, SPX_ORG_BY, SPX_SG_BY, SPX_AGENTS };
