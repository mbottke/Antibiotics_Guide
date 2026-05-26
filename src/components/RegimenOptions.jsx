/* component · RegimenOptions — Phase D1.5 multi-option presentation
   with per-card decision content. Each card carries:
     * route badge + drug fragment + selection state
     * a one-line "Pick if" verdict — the 5-second elevator pitch
     * "Why pick" bullets (strengths, with **bold** killer facts)
     * "Watch out" bullets with severity icons (stop / warn / note)
     * per-card dose-adjustment chips (renal / hepatic / synergy)
       computed against THIS option only, so selecting nitrofurantoin
       doesn't surface fosfomycin's renal banding.

   The card layout is bulleted/scannable rather than paragraph-style:
   three cards side-by-side at 1100px width have to function as a
   comparison table, and bullets compress the same factual density
   into 30% less vertical space while making the deltas between
   options visually instant.

   Selection emits via onSelectionChange so the wider Answer Canvas
   can narrow downstream sections (e.g. duration block, refinements)
   to the picked drug.

   Bold callout parsing: any `**text**` in pickIf / whyPick bullets
   / watchOut bullets renders as an accented span (orange for whyPick
   / pickIf, the severity color for watchOut). One pass, regex-driven,
   no markdown library — the content layer is plain JS strings.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useTilt } from "./util/useTilt.js";
import { AlertTriangle, Check, Info, Pill, Syringe, XCircle, Zap } from "lucide-react";
import { splitRegimenOptions } from "../engines/regimenOptions.js";
import { lookupOptionContent } from "../data/regimenContent.js";
import { doseAdjustments } from "../engines/dosing.js";
import { matchesCtx } from "../engines/ctxMatch.js";
import { AGENT_RX, DRUG_ALIASES, FORMULARY } from "../data/drugs.js";
import { parseBold, RichText } from "./util/richText.jsx";
import { Sparkle } from "./decor/Sparkle.jsx";

/* Wave 5 PR-10 — microbiome collateral-damage signals.
   FORMULARY lookup keyed by canonical FORMULARY name; AGENT_RX is the
   same regex registry used by the case parser and refine engine, so
   "ceftriaxone" / "ceftriaxone or cefotaxime" / "zosyn" all resolve
   identically here.

   Codex review fix (PR #108): several AGENT_RX canons (e.g.
   "Linezolid / tedizolid", "Amoxicillin-clavulanate") are not
   FORMULARY drug names. DRUG_ALIASES maps FORMULARY → SPX-style
   alias; we reverse it to look up FORMULARY records by either spelling. */
const _DRUG_BY_NAME = (() => {
  const m = {};
  FORMULARY.forEach(c => c.drugs.forEach(d => { m[d.name] = d; }));
  return m;
})();
/* Reverse alias map: alias-name → canonical FORMULARY name. Built once.
   Used as the second fallback when an AGENT_RX canon (e.g.
   "Linezolid / tedizolid") doesn't directly index FORMULARY. */
const _ALIAS_TO_FORMULARY = (() => {
  const m = {};
  Object.keys(DRUG_ALIASES).forEach((k) => { m[DRUG_ALIASES[k]] = k; });
  return m;
})();
/* Match AGENT_RX hits against the regex variants on each FORMULARY drug.
   Slower fallback that walks the regex set if neither direct nor alias
   lookup hits — guarantees no silent drops as long as the canon was
   matched in the source text. */
function _resolveDrug(canon) {
  if(_DRUG_BY_NAME[canon]) return _DRUG_BY_NAME[canon];
  const aliased = _ALIAS_TO_FORMULARY[canon];
  if(aliased && _DRUG_BY_NAME[aliased]) return _DRUG_BY_NAME[aliased];
  const direct = AGENT_RX.find(a => a.canon === canon);
  if(direct) {
    const hit = FORMULARY.find(c => c.drugs.find(d => direct.rx.test(d.name)));
    if(hit) return hit.drugs.find(d => direct.rx.test(d.name));
  }
  return null;
}

function _extractMicrobiomeSignals(optionText) {
  if(typeof optionText !== "string" || !optionText) return null;
  const hits = new Set();
  AGENT_RX.forEach(({ rx, canon }) => { if(rx.test(optionText)) hits.add(canon); });
  if(hits.size === 0) return null;
  let cdiffMax = 0, cdiffSum = 0, scored = 0;
  const mdrCount = { low: 0, med: 0, high: 0 };
  let mdrUnknown = 0;
  for(const name of hits) {
    const d = _resolveDrug(name);
    if(!d) { mdrUnknown++; continue; }
    if(typeof d.cdiffScore === "number") {
      cdiffSum += d.cdiffScore;
      if(d.cdiffScore > cdiffMax) cdiffMax = d.cdiffScore;
      scored++;
    }
    if(d.mdrPressure && Object.prototype.hasOwnProperty.call(mdrCount, d.mdrPressure)) {
      mdrCount[d.mdrPressure]++;
    } else {
      mdrUnknown++;
    }
  }
  if(scored === 0 && Object.values(mdrCount).every(v => v === 0)) return null;
  return {
    cdiffMax,
    cdiffAvg: scored ? cdiffSum / scored : 0,
    mdrTop: mdrCount.high > 0 ? "high" : mdrCount.med > 0 ? "med" : mdrCount.low > 0 ? "low" : null,
  };
}

function MicrobiomeChips({ optionText }) {
  const sig = _extractMicrobiomeSignals(optionText);
  if(!sig) return null;

  const cdiffTone = sig.cdiffMax >= 5 ? { color: "var(--red)", bg: "var(--red-soft)", line: "var(--red-line)" }
                  : sig.cdiffMax >= 4 ? { color: "var(--amber)", bg: "var(--amber-soft)", line: "var(--amber-line)" }
                  : sig.cdiffMax >= 1 ? { color: "var(--ink2)", bg: "var(--paper2)", line: "var(--line)" }
                  : null;

  const mdrTone = sig.mdrTop === "high" ? { color: "var(--red)", bg: "var(--red-soft)", line: "var(--red-line)" }
                : sig.mdrTop === "med"  ? { color: "var(--amber)", bg: "var(--amber-soft)", line: "var(--amber-line)" }
                : sig.mdrTop === "low"  ? { color: "var(--ink2)", bg: "var(--paper2)", line: "var(--line)" }
                : null;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
      {cdiffTone && (
        <span
          title={`C. difficile risk score (1 = lowest, 5 = highest). Regimen worst: ${sig.cdiffMax}.`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 3,
            fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700,
            letterSpacing: ".06em", textTransform: "uppercase",
            color: cdiffTone.color, background: cdiffTone.bg,
            border: "1px solid " + cdiffTone.line,
            padding: "1px 6px", borderRadius: 4,
            whiteSpace: "nowrap",
          }}
        >
          C.diff {sig.cdiffMax}
        </span>
      )}
      {mdrTone && (
        <span
          title={`MDR-selection pressure on gut microbiome. Regimen worst: ${sig.mdrTop}.`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 3,
            fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700,
            letterSpacing: ".06em", textTransform: "uppercase",
            color: mdrTone.color, background: mdrTone.bg,
            border: "1px solid " + mdrTone.line,
            padding: "1px 6px", borderRadius: 4,
            whiteSpace: "nowrap",
          }}
        >
          MDR {sig.mdrTop}
        </span>
      )}
    </span>
  );
}

function RouteBadge({ route }) {
  if(!route) return null;
  const parts = route.split(",");
  return (
    <span style={{ display:"inline-flex", gap:4 }}>
      {parts.map((r, i) => {
        const Icon = r === "iv" ? Syringe : Pill;
        return (
          <span key={i} title={"Route: " + r.toUpperCase()} style={{
            display:"inline-flex", alignItems:"center", gap:3,
            fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".06em",
            textTransform:"uppercase", fontWeight:700,
            color: r === "iv" ? "var(--ox)" : "var(--ink2)",
            background: r === "iv" ? "var(--ox-soft)" : "var(--paper2)",
            border:"1px solid " + (r === "iv" ? "var(--ox-line)" : "var(--line)"),
            borderRadius:4, padding:"1px 5px",
          }}>
            <Icon size={9} aria-hidden /> {r}
          </span>
        );
      })}
    </span>
  );
}

/* Severity-specific bullet icon + color for watchOut entries. */
function severityStyle(sev) {
  if(sev === "stop") return {
    Icon: XCircle,
    color: "var(--red)",
    bg: "var(--red-soft)",
    line: "var(--red-line)",
  };
  if(sev === "warn") return {
    Icon: AlertTriangle,
    color: "var(--amber)",
    bg: "var(--amber-soft)",
    line: "var(--amber-line)",
  };
  return {  // note
    Icon: Info,
    color: "var(--ink2)",
    bg: "transparent",
    line: "transparent",
  };
}

/* Decision content block — bullets + severity icons. Replaces the
   prior paragraph-style layout. Renders nothing if the option has no
   authored content (the card then shows just the drug fragment +
   route + dose chips). */
function DecisionContent({ content, accent, ctx }) {
  if(!content) return null;
  const hasAny = content.pickIf || content.whyPick?.length || content.watchOut?.length;
  if(!hasAny) return null;
  const accentColor = accent === "add" ? "var(--amber)" : "var(--ox)";
  const accentBg    = accent === "add" ? "rgba(217, 119, 6, 0.10)" : "rgba(15, 76, 129, 0.08)";

  return (
    <div style={{ marginTop: 9, display:"grid", gap:9 }}>
      {/* Pick-if verdict — the 5-second elevator pitch */}
      {content.pickIf && (
        <div style={{
          fontSize:11.5, lineHeight:1.45, color:"var(--ink)",
          fontStyle:"italic", fontWeight:500,
          background: accent === "add" ? "var(--amber-soft)" : "var(--ox-soft)",
          border: "1px solid " + (accent === "add" ? "var(--amber-line)" : "var(--ox-line)"),
          borderRadius: 6, padding: "5px 8px",
          display:"flex", alignItems:"flex-start", gap:6,
        }}>
          <Zap size={11} aria-hidden style={{ color: accentColor, flexShrink: 0, marginTop: 2 }} />
          <span><span style={{
            fontFamily:"var(--mono)", fontStyle:"normal", fontWeight:700,
            fontSize:9, letterSpacing:".1em", textTransform:"uppercase",
            color: accentColor, marginRight: 5,
          }}>Pick if</span>
          <RichText text={content.pickIf} accentColor={accentColor} /></span>
        </div>
      )}

      {/* Why-pick bullets — strengths */}
      {content.whyPick?.length > 0 && (
        <div>
          <div style={{
            fontFamily:"var(--mono)", fontSize:9, letterSpacing:".1em",
            textTransform:"uppercase", fontWeight:700,
            color: accentColor, marginBottom: 4,
          }}>Why pick</div>
          <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:3 }}>
            {content.whyPick.map((b, i) => (
              <li key={i} style={{
                display:"flex", alignItems:"flex-start", gap:6,
                fontSize:11.5, lineHeight:1.45, color:"var(--ink2)",
              }}>
                <span aria-hidden style={{
                  flexShrink: 0, marginTop: 6,
                  width: 4, height: 4, borderRadius: "50%",
                  background: accentColor,
                }} />
                <span><RichText text={b} accentColor={accentColor} accentBg={accentBg} /></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Watch-out bullets — cautions with severity icons. Phase D3.4:
          bullets carrying a matchCtx predicate that fires against the
          current patient ctx get elevated — left accent stripe in the
          bullet's severity color, the bullet's own background nudged
          toward that color, and a "FIRES NOW" chip pinned to the row.
          The visual cue is the same vocabulary as MATCHES (D2/D3.2) so
          the entire app speaks one elevation grammar. Never hides
          non-matching bullets — safety contract. */}
      {content.watchOut?.length > 0 && (
        <div>
          <div style={{
            fontFamily:"var(--mono)", fontSize:9, letterSpacing:".1em",
            textTransform:"uppercase", fontWeight:700,
            color:"var(--amber)", marginBottom: 4,
          }}>Watch out</div>
          <ul style={{ listStyle:"none", padding:0, margin:0, display:"grid", gap:3 }}>
            {content.watchOut.map((b, i) => {
              const sty = severityStyle(b.sev || "note");
              const ctxFires = !!(b.matchCtx && matchesCtx(b.matchCtx, ctx));
              return (
                <li key={i} style={{
                  display:"flex", alignItems:"flex-start", gap:6,
                  fontSize:11.5, lineHeight:1.45, color:"var(--ink2)",
                  padding: ctxFires ? "3px 6px" : 0,
                  background: ctxFires
                    ? (sty.bg !== "transparent" ? sty.bg : "var(--paper2)")
                    : "transparent",
                  border: ctxFires ? "1px solid " + sty.line : "none",
                  borderLeft: ctxFires ? "3px solid " + sty.color : "none",
                  borderRadius: ctxFires ? 5 : 0,
                  transition: "background .12s, border-color .12s",
                }}>
                  <sty.Icon size={11} aria-hidden style={{ color: sty.color, flexShrink: 0, marginTop: 3 }} />
                  <span style={{ flex: 1 }}>
                    <RichText text={b.text} accentColor={sty.color} accentBg={sty.bg !== "transparent" ? sty.bg : undefined} />
                  </span>
                  {ctxFires && (
                    <span style={{
                      flex: "0 0 auto",
                      fontFamily:"var(--mono)", fontSize:8, fontWeight:700,
                      color:"#fff", background: sty.color,
                      padding: "2px 5px", borderRadius: 3,
                      letterSpacing:".06em", textTransform:"uppercase",
                      whiteSpace:"nowrap",
                    }}>Fires now</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/* Per-card dose-adjustment chips. Computed against the OPTION text,
   not the whole tier — selecting one card narrows renal / hepatic /
   synergy adjustments to that drug. */
function PerOptionDoseChips({ optionText, ctx, d, synId }) {
  if(!ctx || !ctx.on) return null;
  const adj = doseAdjustments(optionText, ctx, d, synId);
  if(!adj.length) return null;
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop: 9 }}>
      {adj.map((a, i) => (
        <span key={i} style={{
          display:"inline-flex", flexWrap:"wrap", alignItems:"center", gap:4,
          fontSize:10.5, fontWeight:500, padding:"3px 7px", borderRadius:5,
          background:"var(--decision-adjusted-bg)", color:"var(--decision-adjusted)",
          border:"1px solid var(--decision-adjusted-line)",
          fontFamily:"var(--mono)", letterSpacing:".01em",
          maxWidth:"100%", minWidth:0,
        }}>
          <span style={{ fontSize:9, letterSpacing:".08em", textTransform:"uppercase", fontWeight:700 }}>
            {a.kind === "renal" ? "renal" : a.kind === "weight" ? "weight" : a.kind === "hepatic" ? "hepatic" : a.kind === "hd" ? "HD" : a.kind}
          </span>
          <span style={{ fontWeight:600, color:"var(--ink)" }}>{(a.agent || "").split(" / ")[0].replace(/\s*\(IV\)/i, "")}</span>
          <span aria-hidden style={{ color:"var(--decision-adjusted)" }}>→</span>
          <span style={{ fontWeight:600, overflowWrap:"anywhere", minWidth:0 }}>{a.value}</span>
        </span>
      ))}
    </div>
  );
}

/* Title-case the first ASCII letter of an option's text. The splitter
   produces "fosfomycin 3 g PO × 1" for the second/third entries in a
   tier (it just slices after the comma+or), so card titles otherwise
   render with a lowercase leading drug-name letter. Skips non-ASCII
   leads (Greek β, etc.) so "β-lactam..." stays as authored. */
function titleCaseFirst(s) {
  if(!s) return s;
  const c = s.charAt(0);
  if(c >= "a" && c <= "z") return c.toUpperCase() + s.slice(1);
  return s;
}

/* β-lactam detection regex used by Phase D3.3 allergy-driven card
   deprecation. Catches penicillins, cephalosporins, carbapenems, and
   the generic class noun — but DOES NOT include aztreonam (monobactam,
   negligible cross-reactivity with PCN anaphylaxis per IDSA and the
   2022 AAAAI practice parameter). Aztreonam-containing cards therefore
   remain safe even when the patient has documented β-lactam anaphylaxis.
   The regex stays generous (cef\w+ covers all cephalosporin generations
   incl. cefiderocol, ceftolozane-tazobactam, ceftaroline) so new
   members ship safely without code changes. */
const BETA_LACTAM_RX = /\b(?:penicillin|amoxicillin|ampicillin|dicloxacillin|oxacillin|nafcillin|piperacillin|amp-?sulbactam|amox-?clav|augmentin|pip-?tazo|pip-?taz|cef\w+|carbapenem|meropenem|imipenem|ertapenem|doripenem|β-?lactam|cephalosporin|cephamycin)\b/i;

function OptionCard({ option, selected, primary, onSelect, renderText, accent, content, ctx, d, synId }) {
  const accentColor = accent === "add" ? "var(--amber)" : "var(--ox)";
  const accentSoft  = accent === "add" ? "var(--amber-soft)" : "var(--ox-soft)";
  const accentLine  = accent === "add" ? "var(--amber-line)" : "var(--ox-line)";

  // Wave 9 · subtle 3D tilt on the regimen option card. Intensity 4
  // keeps the lean delicate so dense bedside content never reads as
  // skewed; the hook no-ops on reduced-motion + coarse-pointer.
  const cardRef = useRef(null);
  useTilt(cardRef, { intensity: 4 });

  /* Phase D3.3 allergy-driven card deprecation. When the patient has
     documented β-lactam anaphylaxis AND this card contains a β-lactam
     agent (penicillin, cephalosporin, or carbapenem — not aztreonam),
     surface a red top banner across the card. The card stays
     clickable (clinician may know history is unreliable, or plan
     desensitization) but the visual cue is unmissable at bedside.
     Cards containing aztreonam are not flagged because the monobactam
     does not cross-react. */
  const anaphylaxis = ctx?.blAllergy === "severe";
  const containsBetaLactam = BETA_LACTAM_RX.test(option.text);
  const showAllergyBanner = anaphylaxis && containsBetaLactam;

  return (
    <button
      ref={cardRef}
      type="button"
      role="radio"
      aria-checked={selected}
      aria-describedby={showAllergyBanner ? `allergy-warn-${synId}-${option.text.slice(0,20).replace(/\W+/g,"-")}` : undefined}
      onClick={onSelect}
      /* Wave 10 — rx-focus-halo lifts keyboard-focus ring to the same depth
         cyan halo used by all interactive inputs across the canvas, plus
         rx-glow-lift gives the selected card a subtle spring on hover.
         Both classes are inert under reduced-motion / coarse-pointer. */
      className={"rx-focus-halo" + (selected ? " rx-glow-lift" : "")}
      style={{
        textAlign:"left",
        background: selected
          ? (showAllergyBanner ? "rgba(185,28,28,0.06)" : accentSoft)
          : "var(--panel)",
        border: "1px solid " + (selected
          ? (showAllergyBanner ? "rgba(185,28,28,0.35)" : accentLine)
          : (showAllergyBanner ? "rgba(185,28,28,0.25)" : "var(--line)")),
        borderRadius:10,
        padding:"11px 12px 12px",
        cursor:"pointer",
        transition:"background .12s, border-color .12s, transform .08s",
        boxShadow: selected ? "inset 0 0 0 1px " + accentLine : "none",
        opacity: selected ? 1 : 0.94,
      }}>
      {/* Allergy warning banner — D3.3. Spans the full card width with
          negative margins to reach the card border. Reads as a chart
          alert (red strip, white serif uppercase) so it leaps out even
          when the rest of the card content is dense. */}
      {showAllergyBanner && (
        <div
          id={`allergy-warn-${synId}-${option.text.slice(0,20).replace(/\W+/g,"-")}`}
          style={{
            background:"var(--red)", color:"#fff",
            margin:"-11px -12px 8px",
            padding:"4px 10px",
            borderRadius:"10px 10px 0 0",
            fontFamily:"var(--mono)", fontSize:10, fontWeight:700,
            letterSpacing:".06em", textTransform:"uppercase",
            display:"flex", alignItems:"center", justifyContent:"center", gap:6,
          }}>
          <span aria-hidden>⚠</span>
          β-lactam anaphylaxis on file — confirm history before use
        </div>
      )}

      {/* Top metadata strip: route badge(s) on the left, Recommended chip
          inline next to them (instead of an absolute-positioned tab that
          overlapped the card border on prior iterations), and the
          Selected indicator anchored on the right. The Recommended chip
          renders as a fully-bordered pill so it reads as a deliberate
          badge rather than a stuck-on label. */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, marginBottom: 6 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
          <RouteBadge route={option.route} />
          {primary && (
            <span style={{
              display:"inline-flex", alignItems:"center", gap:4,
              fontFamily:"var(--mono)", fontSize:9, letterSpacing:".08em",
              textTransform:"uppercase", fontWeight:700,
              color:"#fff", background: accentColor,
              border: "1px solid " + accentColor,
              borderRadius: 4, padding:"2px 6px",
              whiteSpace:"nowrap",
            }}>
              {/* Wave 10 — Sparkle glyph on the "Recommended" chip so the
                  badge carries the same "considered / curated" mark the
                  drug-of-choice gloss uses elsewhere in the answer-canvas. */}
              <Sparkle size={9} color="#fff" />
              Recommended
            </span>
          )}
          <MicrobiomeChips optionText={option.text} />
        </div>
        {selected && (
          <span style={{
            display:"inline-flex", alignItems:"center", gap:3,
            fontFamily:"var(--mono)", fontSize:9, letterSpacing:".06em",
            textTransform:"uppercase", fontWeight:700, color: accentColor,
          }}>
            <Check size={10} aria-hidden /> Selected
          </span>
        )}
      </div>
      <div style={{ fontSize:15, lineHeight:1.45, color:"var(--ink)", fontWeight: selected ? 700 : 600, letterSpacing:"-.005em" }}>
        {renderText ? renderText(titleCaseFirst(option.text)) : titleCaseFirst(option.text)}
      </div>
      <DecisionContent content={content} accent={accent} ctx={ctx} />
      <PerOptionDoseChips optionText={option.text} ctx={ctx} d={d} synId={synId} />
    </button>
  );
}

function RegimenOptions({ rx, accent = "core", renderText, synId, tierLabel, ctx, d, onSelectionChange }) {
  const options = useMemo(() => splitRegimenOptions(rx), [rx]);

  /* Phase D3.3 recommended-card auto-deflect: when the patient has
     β-lactam anaphylaxis on file and the would-be-recommended (first)
     card contains a β-lactam, shift the Recommended badge to the
     first non-β-lactam card. The badge should never sit on a card
     the patient can't safely receive without affirmative action
     (desensitization, history re-review). Falls back to index 0 when
     no safe option exists (e.g., every card contains a β-lactam —
     in that case the allergy banners on every card make the
     situation visible regardless). */
  const recommendedIdx = useMemo(() => {
    if(ctx?.blAllergy !== "severe") return 0;
    const firstSafe = options.findIndex(o => !BETA_LACTAM_RX.test(o.text));
    return firstSafe >= 0 ? firstSafe : 0;
  }, [options, ctx]);

  const [pickedIdx, setPickedIdx] = useState(recommendedIdx);

  // When the rx changes (new tier) OR the recommendation deflects
  // (allergy state changes), reset the picked card to the new
  // recommendation so the initial visual is coherent.
  useEffect(() => { setPickedIdx(recommendedIdx); }, [rx, recommendedIdx]);

  /* Fire onSelectionChange only when the USER explicitly clicks a
     card — not on initial mount. Without this guard, multi-tier
     syndromes (e.g. SAB with MSSA + MRSA tiers) would race their
     "default to first card" useEffects and whichever instance
     mounted last would silently set pickedAgent in AnswerCanvas
     to a card the clinician never picked, lighting downstream
     monitoring items as MATCHES under false pretenses. The
     "selected" visual state of the first card remains as a
     recommendation cue, but the cross-section signal stays null
     until a real click. */
  const userPicked = (i) => {
    setPickedIdx(i);
    onSelectionChange?.(options[i]?.text || null);
  };

  const contentFor = (text) => lookupOptionContent(synId, tierLabel, text);

  /* Wave 5 PR-10 — opt-in microbiome sort toggle. Default OFF (preserves
     e2e screenshot baselines + clinical autonomy: clinicians pick
     regimen by efficacy first, microbiome impact second). When ON,
     options re-rank by ascending cdiffMax. The recommendation badge
     stays on whichever option was previously recommended — we sort
     the cards, not the recommendation. The choice persists per session
     via localStorage so a site-level preference survives refresh. */
  const [sortByCollateral, setSortByCollateral] = useState(() => {
    try {
      if(typeof window === "undefined") return false;
      const v = window.localStorage?.getItem("ab_microbiome_sort_default");
      return v === "1" || v === "true";
    } catch(e) { return false; }
  });

  const sortByCollateralPersist = (val) => {
    setSortByCollateral(val);
    try {
      if(typeof window === "undefined") return;
      window.localStorage?.setItem("ab_microbiome_sort_default", val ? "1" : "0");
    } catch(e) { /* private-mode storage failure — UI still works */ }
  };

  const orderedOptions = useMemo(() => {
    if(!sortByCollateral) return options.map((o, i) => ({ option: o, originalIndex: i }));
    return options
      .map((o, i) => ({ option: o, originalIndex: i, sig: _extractMicrobiomeSignals(o.text) }))
      .sort((a, b) => {
        const ax = a.sig ? a.sig.cdiffMax : 99;
        const bx = b.sig ? b.sig.cdiffMax : 99;
        if(ax !== bx) return ax - bx;
        return a.originalIndex - b.originalIndex;
      });
  }, [options, sortByCollateral]);

  if(options.length === 0) return null;

  // 1 option → single card; 2 → side-by-side; 3+ → auto-fit grid.
  // Bedside mobile (.rx-bedside) collapses to one column via the
  // existing media query. The minmax floor is generous enough that
  // bulleted content doesn't reflow into illegible columns.
  const cols = options.length === 1 ? "1fr"
             : options.length === 2 ? "repeat(2, 1fr)"
             : options.length === 3 ? "repeat(auto-fit, minmax(240px, 1fr))"
             :                        "repeat(auto-fit, minmax(220px, 1fr))";

  return (
    <div data-testid="regimen-options-wrapper">
      {options.length > 1 && (
        <div style={{
          display: "flex", justifyContent: "flex-end", alignItems: "center",
          gap: 8, marginBottom: 8,
        }}>
          <label style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontFamily: "var(--mono)", fontSize: 9.5, fontWeight: 600,
            color: "var(--ink2)", letterSpacing: ".05em",
            textTransform: "uppercase", cursor: "pointer",
            userSelect: "none",
          }}>
            <input
              type="checkbox"
              checked={sortByCollateral}
              onChange={(e) => sortByCollateralPersist(e.target.checked)}
              aria-label="Rank by collateral damage (C. difficile + MDR pressure)"
              style={{ accentColor: "var(--ox)" }}
            />
            Rank by collateral damage
          </label>
        </div>
      )}
      <div
        role={options.length > 1 ? "radiogroup" : undefined}
        aria-label={options.length > 1 ? "Regimen options" : undefined}
        data-testid="regimen-options"
        style={{
          display:"grid",
          gap:11,
          gridTemplateColumns: cols,
          marginTop: 4,
        }}>
        {orderedOptions.map(({ option: opt, originalIndex }, displayIdx) => (
          <OptionCard key={originalIndex}
            option={opt}
            selected={originalIndex === pickedIdx}
            primary={options.length > 1 && originalIndex === recommendedIdx}
            accent={accent}
            onSelect={() => userPicked(originalIndex)}
            renderText={renderText}
            content={contentFor(opt.text)}
            ctx={ctx}
            d={d}
            synId={synId} />
        ))}
      </div>
    </div>
  );
}

export { RegimenOptions };
