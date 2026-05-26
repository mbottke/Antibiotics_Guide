/* component · SyndromesSection — Wave 8 W8 EDITORIAL GALLERY pass.
   Self-contained extraction of the empiric-by-syndrome catalog that
   previously lived inline in App.jsx as renderEmpiric().

   Wave 8 W8 rewrite: cinematic hero with sparkle-replaced glyph, decorative
   watermark letter, KPI stat tiles, sticky pill-rail of category filters
   with a progress strip, 3-up editorial grid of asymmetric-radius cards,
   per-category headers with mono kicker + italic display + lede, optional
   left rail with rotated mini-TOC and risk-filter chips, oversized
   decorative numerals, staggered fade-in reveal, CTA-grade patient-context
   chips, and a beautiful empty state.

   Information architecture, filter logic, click handlers, and hash-synced
   state are UNCHANGED from the previous pass — this surface is wired the
   same way as it has always been; the rewrite is purely visual.

   Renders:
     · executable regimen builder (presentation + β-lactam allergy + risk tags)
     · cinematic hero with sparkle glyph, watermark "S", gradient hairline
     · KPI stat tiles (count of syndromes / categories / tiers)
     · sticky category pill-rail with cyan progress strip
     · optional 220px left rail (≥1100px) — vertical mini-TOC + risk chips
     · per-category subhead (mono kicker, italic display, lede, big numeral)
     · editorial 3-up grid of asymmetric-radius syndrome cards
     · expanded card body — tiered regimens, cover-list, organism chips,
       duration + evidence, de-escalation block, pearls, footer
     · "Open as case" deep-link into decide mode
     · empty-state presentation when filters yield no syndromes

   Hash-synced state (synCat, openSyn) is owned by the parent so URL
   round-tripping stays at the App level. Internal-only state (selSyn for
   the builder selector, riskFilters for the side-rail multi-select) is
   local because it never appears in the hash.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState, useMemo } from "react";
import {
  Stethoscope, Clock, ChevronRight, GitBranch, Crosshair,
  Check, Plus,
} from "lucide-react";
import { renderRich, renderGloss } from "../components/rich-text";
import { Num, Cite, Ev, BugTag, CardCopyButton, DoseAdjustBar } from "../components/primitives";
import { synEvidence } from "../engines/clinical";
import { CAT_ICONS, SYN_ICON } from "../data/ui-maps";
import { SYNDROMES, SYN_CATS, SRC_CONTROL } from "../data/syndromes";
import { Sparkle } from "../components/decor/Sparkle";
import { WatermarkLetter } from "../components/decor/WatermarkLetter";
import { MeshWash } from "../components/decor/MeshWash";
import { GradientHairline } from "../components/decor/GradientHairline";
import { Stripes } from "../components/decor/Stripes";

// Risk-filter taxonomy for the left rail. Each entry maps a chip label
// onto a predicate over the syndrome's tags / categories so we can filter
// the visible list without mutating any data. The predicate is exclusive
// of category — both the category chip and the risk chip must accept the
// syndrome for it to render.
const RISK_FILTERS = [
  { id: "severe",   label: "Severe / shock", test: s => (s.tags || []).includes("severe") || s.cat === "sepsis" },
  { id: "icu",      label: "ICU",            test: s => (s.tags || []).includes("icu") || (s.tiers || []).some(t => t.sev) },
  { id: "source",   label: "Source control", test: s => Boolean(SRC_CONTROL[s.id]) },
  { id: "highvol",  label: "Polymicrobial",  test: s => Array.isArray(s.bugs) && s.bugs.length >= 4 },
  { id: "evidence", label: "Evidence-graded", test: s => Boolean(synEvidence(s)) },
];

// Padded integer for the editorial numeral watermark — "01", "02", etc.
const pad2 = (n) => String(n).padStart(2, "0");

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
  // Multi-select risk filter — used by the left-rail risk chips. Each entry
  // is a RISK_FILTERS id. An empty Set means no filter active.
  const [riskFilters, setRiskFilters] = useState(() => new Set());

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
  const catCount = id => id === "all" ? SYNDROMES.length : SYNDROMES.filter(s => s.cat === id).length;

  // Compose category + risk filters. The category select narrows by `cat`,
  // then we further filter by every active risk predicate (AND semantics).
  // Risk filtering is purely additive — flipping no risk chips yields the
  // same list as the prior version of this surface.
  const list = useMemo(() => {
    const base = synCat === "all" ? SYNDROMES : SYNDROMES.filter(s => s.cat === synCat);
    if (riskFilters.size === 0) return base;
    const preds = RISK_FILTERS.filter(r => riskFilters.has(r.id)).map(r => r.test);
    return base.filter(s => preds.every(p => p(s)));
  }, [synCat, riskFilters]);

  // KPI metrics for the cinematic hero stat row.
  const synCount = SYNDROMES.length;
  const catCountAll = SYN_CATS.length;
  const tierCount = useMemo(
    () => SYNDROMES.reduce((acc, s) => acc + ((s.tiers || []).length), 0),
    []
  );

  // Heuristic for "high-volume" syndromes (>= 4 target organisms) — gets a
  // small sparkle beside the name to draw the eye on dense scans.
  const isHighVolume = (s) => Array.isArray(s.bugs) && s.bugs.length >= 4;

  // Visible category coverage — drives the cyan progress strip under the
  // pill rail. When "All" is selected we show 100%; otherwise the single
  // active category is 1/N of the rail's content.
  const railProgressPct = synCat === "all" ? 100 : Math.round((1 / catCountAll) * 100);

  // Which categories actually render? Used by the left-rail mini-TOC so
  // we don't show ghost entries for categories that the current filter
  // has emptied out.
  const visibleCats = useMemo(() => {
    return SYN_CATS.filter(c => {
      if (synCat !== "all" && c.id !== synCat) return false;
      return list.some(s => s.cat === c.id);
    });
  }, [synCat, list]);

  const toggleRisk = (id) => {
    setRiskFilters(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearAllFilters = () => {
    setSynCat("all");
    setRiskFilters(new Set());
  };

  return (
    <>
      {/* ============================================================
          BLOCK 1 · CINEMATIC HERO
          96px italic-serif "Syndromes" wordmark with sparkle replacing
          the trailing 's', italic-serif standfirst clamped to 52ch, a
          240px watermark letter floated top-right, and a 3-stop gradient
          hairline that ties the cyan / blue / magenta accent palette
          together below.
          ============================================================ */}
      <header
        style={{
          position: "relative",
          marginBottom: 28,
          paddingTop: 8,
          paddingRight: 32,
          overflow: "hidden",
        }}
      >
        {/* Wave 9 W9 · molten chrome behind the Syndromes hero. cyan-magenta-lime
            palette anchors this surface in the brand's most saturated chord. */}
        <MeshWash variant="full" intensity="soft" palette="cyan-magenta-lime" />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 18,
            position: "relative",
            zIndex: 1,
          }}
        >
          <span
            aria-hidden
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: ".28em",
              textTransform: "uppercase",
              color: "var(--neon-cyan, var(--ox))",
              fontWeight: 700,
            }}
          >
            Reference · Editorial Gallery
          </span>
          <Sparkle size={12} color="var(--hot-magenta, var(--ox))" />
        </div>

        {/* Wordmark — 96px italic serif with sparkle replacing the trailing 's' */}
        <h2
          style={{
            position: "relative",
            zIndex: 1,
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(56px, 9vw, 96px)",
            letterSpacing: "-.03em",
            lineHeight: 0.95,
            margin: "0 0 18px",
            color: "var(--ink)",
            display: "inline-flex",
            alignItems: "baseline",
            gap: 4,
          }}
        >
          <span>Syndrome</span>
          <Sparkle
            size={56}
            color="var(--neon-cyan, var(--ox))"
            style={{ transform: "translateY(-4px)" }}
          />
        </h2>

        <p
          style={{
            position: "relative",
            zIndex: 1,
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 19,
            lineHeight: 1.5,
            color: "var(--ink2)",
            margin: 0,
            maxWidth: "52ch",
          }}
        >
          Browse by category. Drill into empiric coverage, severity, risk
          factors, and decision tree.
        </p>

        {/* 3-stop gradient hairline divider — cyan → blue → magenta */}
        <div
          aria-hidden
          style={{
            position: "relative",
            zIndex: 1,
            height: 1,
            marginTop: 28,
            background:
              "linear-gradient(90deg, transparent 0%, var(--neon-cyan, var(--ox)) 25%, var(--electric-blue, var(--ox)) 50%, var(--hot-magenta, var(--ox)) 75%, transparent 100%)",
            opacity: 0.55,
          }}
        />
      </header>

      {/* ============================================================
          BLOCK 2 · ANIMATED COUNTER STATS
          A row of three KPI tiles immediately under the hero. Each tile
          carries an asymmetric 14/4 radius, a paper2 → ox-softer gradient
          background, and a cyan numeral in the .rx-numeric-mega style
          (italic serif, tabular-nums) for the value.
          ============================================================ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 36,
        }}
      >
        {[
          { value: synCount, label: "Syndromes", note: "indexed empiric protocols" },
          { value: catCountAll, label: "Categories", note: "anatomic + host axes" },
          { value: tierCount, label: "Regimen tiers", note: "with dose adjustment" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="rx-fade-in-up"
            style={{
              position: "relative",
              overflow: "hidden",
              /* W12 viewport density · was a fixed "20px 22px"; at 768px the
                 stat tile crowds two short numerals against an inflated frame
                 (22px gutter on each side ≈ 18% of the tile width). Clamp
                 trims to 14/16 at the narrow end while staying at 20/22 on
                 a 1440-wide canvas. */
              padding: "clamp(14px, 1.6vw, 20px) clamp(16px, 1.8vw, 22px)",
              background:
                "linear-gradient(135deg, var(--paper2) 0%, var(--ox-softer, var(--paper)) 100%)",
              border: "1px solid var(--line)",
              borderTopLeftRadius: 14,
              borderTopRightRadius: 4,
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 14,
              boxShadow: "var(--shadow-e1)",
              animationDelay: `${i * 60}ms`,
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 54,
                height: 2,
                background:
                  "linear-gradient(90deg, var(--neon-cyan, var(--ox)) 0%, transparent 100%)",
                opacity: 0.85,
              }}
            />
            <div
              style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontWeight: 600,
                fontSize: 48,
                lineHeight: 1,
                color: "var(--neon-cyan, var(--ox))",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-.02em",
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: "var(--mono)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "var(--ink)",
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                marginTop: 4,
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: 13,
                color: "var(--ink2)",
              }}
            >
              {stat.note}
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================
          BLOCK 9 · PATIENT-CONTEXT CTA CHIPS (BUILDER)
          The executable regimen builder with CTA-grade asymmetric chips —
          when active the chip carries a cyan-deep → cyan-bright gradient
          plus a cyan glow halo; when inactive it sits on var(--paper) with
          a var(--line) hairline and var(--ink2) text. Hover lifts 2px and
          warms the border to cyan.
          ============================================================ */}
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
        <div
          className="rx-builder-risks"
          style={{
            position: "relative",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Stripes
            variant="cyan"
            angle={135}
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, opacity: 0.08, borderRadius: 8, pointerEvents: "none" }}
          />
          <span className="rx-builder-rlab" style={{ position: "relative" }}>Host risks</span>
          {[["mrsaRisk", "MRSA"], ["pseudoRisk", "Pseudomonas"], ["esblRisk", "ESBL / R-GNR"], ["severe", "Severe / shock"]].map(([k, lab]) => {
            const on = !!ctx[k];
            return (
              <button
                key={k}
                className="rx-cta-glow rx-lift"
                aria-pressed={on}
                onClick={() => setCtxField(k, !ctx[k])}
                style={{
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: on ? "#fff" : "var(--ink2)",
                  background: on
                    ? "linear-gradient(135deg, var(--ox, var(--ink)) 0%, var(--neon-cyan, var(--ox)) 100%)"
                    : "var(--paper)",
                  border: `1px solid ${on ? "var(--neon-cyan, var(--ox))" : "var(--line)"}`,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 2,
                  borderBottomLeftRadius: 2,
                  borderBottomRightRadius: 8,
                  cursor: "pointer",
                  boxShadow: on
                    ? "var(--shadow-e1), var(--neon-cyan-glow, 0 0 24px rgba(0,212,255,0.35))"
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

      {/* ============================================================
          BLOCK 3 · CATEGORY PILL RAIL with progress strip
          A sticky horizontal rail of asymmetric-radius chips. Active chip
          gets a cyan-deep → cyan-bright gradient + cyan glow + a 2px
          translateY lift; inactive sits on transparent + ink2 with a thin
          line border. Below the rail a 2px strip shows what fraction of
          the categories is currently displayed.
          ============================================================ */}
      <div
        style={{
          position: "sticky",
          top: 60,
          zIndex: 5,
          background: "linear-gradient(180deg, var(--paper) 0%, color-mix(in srgb, var(--paper) 92%, transparent) 100%)",
          paddingTop: 12,
          paddingBottom: 12,
          marginLeft: -8,
          marginRight: -8,
          marginBottom: 32,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <div
          className="rx-mxbar"
          role="tablist"
          aria-label="Syndrome categories"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            paddingLeft: 8,
            paddingRight: 8,
          }}
        >
          {cats.map(c => {
            const active = synCat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSynCat(c.id)}
                aria-pressed={active}
                role="tab"
                className="rx-lift"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: active ? "#fff" : "var(--ink2)",
                  background: active
                    ? "linear-gradient(135deg, var(--ox, var(--ink)) 0%, var(--neon-cyan, var(--ox)) 100%)"
                    : "transparent",
                  border: `1px solid ${active ? "var(--neon-cyan, var(--ox))" : "var(--line)"}`,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 2,
                  borderBottomLeftRadius: 2,
                  borderBottomRightRadius: 8,
                  cursor: "pointer",
                  transform: active ? "translateY(-2px)" : "translateY(0)",
                  boxShadow: active
                    ? "var(--shadow-e1), var(--neon-cyan-glow, 0 0 24px rgba(0,212,255,0.35))"
                    : "none",
                  opacity: active ? 1 : 0.86,
                  transition: "all var(--duration-fast) var(--ease-out)",
                }}
              >
                {c.label}
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    color: active ? "rgba(255,255,255,0.85)" : "var(--ink2)",
                    opacity: active ? 1 : 0.65,
                  }}
                >
                  {catCount(c.id)}
                </span>
              </button>
            );
          })}
        </div>
        {/* Progress strip — shows current category coverage at a glance. */}
        <div
          aria-hidden
          style={{
            position: "relative",
            height: 2,
            marginTop: 10,
            marginLeft: 8,
            marginRight: 8,
            background: "var(--line)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: `${railProgressPct}%`,
              background:
                "linear-gradient(90deg, var(--neon-cyan, var(--ox)) 0%, var(--electric-blue, var(--ox)) 100%)",
              transition: "width var(--duration-base) var(--ease-out)",
              boxShadow: "0 0 8px var(--neon-cyan, var(--ox))",
            }}
          />
        </div>
      </div>

      {/* ============================================================
          BLOCK 6 · ASYMMETRIC TWO-COLUMN LAYOUT
          A 220px left rail (only ≥1100px) carries a rotated mini-TOC of
          the visible categories plus a "Filter by risk" chip panel. The
          main grid takes the remaining space. We use plain CSS grid via
          inline style + an @media-style fallback by sniffing window — the
          layout collapses to a single column on narrower viewports, which
          inline style cannot express, so we use a CSS class combined with
          a one-shot <style> tag.
          ============================================================ */}
      <style>{`
        .syn-asym { display: grid; grid-template-columns: 1fr; gap: 32px; }
        @media (min-width: 1100px) {
          .syn-asym { grid-template-columns: 220px minmax(0, 1fr); }
          .syn-asym-rail { position: sticky; top: 132px; align-self: start; }
        }
      `}</style>

      <div className="syn-asym">
        {/* --- LEFT RAIL --------------------------------------------- */}
        <aside className="syn-asym-rail" aria-label="Syndrome filters">
          {/* Mini-TOC — rotated mono labels of every visible category */}
          <div
            style={{
              padding: "16px 14px",
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderTopLeftRadius: 14,
              borderTopRightRadius: 4,
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 14,
              marginBottom: 16,
              boxShadow: "var(--shadow-e1)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: "var(--ink2)",
                marginBottom: 10,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Sparkle size={9} color="var(--neon-cyan, var(--ox))" />
              On this page
            </div>
            <ol
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {visibleCats.length === 0 && (
                <li
                  style={{
                    fontFamily: "var(--serif)",
                    fontStyle: "italic",
                    fontSize: 12,
                    color: "var(--ink2)",
                    opacity: 0.7,
                  }}
                >
                  no categories shown
                </li>
              )}
              {visibleCats.map((c, i) => (
                <li key={c.id} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: ".14em",
                      color: "var(--neon-cyan, var(--ox))",
                      fontVariantNumeric: "tabular-nums",
                      minWidth: 18,
                    }}
                  >
                    {pad2(i + 1)}
                  </span>
                  <a
                    href={`#syn-cat-${c.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setSynCat(c.id);
                    }}
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: ".14em",
                      textTransform: "uppercase",
                      color: synCat === c.id ? "var(--neon-cyan, var(--ox))" : "var(--ink2)",
                      textDecoration: "none",
                      lineHeight: 1.4,
                    }}
                  >
                    {c.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>

          {/* Risk-filter panel — multi-select chip toggles */}
          <div
            style={{
              padding: "16px 14px",
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderTopLeftRadius: 14,
              borderTopRightRadius: 4,
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 14,
              boxShadow: "var(--shadow-e1)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: "var(--ink2)",
                marginBottom: 12,
              }}
            >
              Filter by risk
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {RISK_FILTERS.map((rf) => {
                const on = riskFilters.has(rf.id);
                return (
                  <button
                    key={rf.id}
                    type="button"
                    onClick={() => toggleRisk(rf.id)}
                    aria-pressed={on}
                    style={{
                      padding: "5px 10px",
                      fontFamily: "var(--mono)",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                      color: on ? "#fff" : "var(--ink2)",
                      background: on
                        ? "linear-gradient(135deg, var(--ox, var(--ink)) 0%, var(--neon-cyan, var(--ox)) 100%)"
                        : "transparent",
                      border: `1px solid ${on ? "var(--neon-cyan, var(--ox))" : "var(--line)"}`,
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 2,
                      borderBottomLeftRadius: 2,
                      borderBottomRightRadius: 8,
                      cursor: "pointer",
                      boxShadow: on ? "var(--neon-cyan-glow, none)" : "none",
                      transition: "all var(--duration-fast) var(--ease-out)",
                    }}
                  >
                    {rf.label}
                  </button>
                );
              })}
            </div>
            {riskFilters.size > 0 && (
              <button
                type="button"
                onClick={() => setRiskFilters(new Set())}
                style={{
                  marginTop: 12,
                  padding: 0,
                  background: "transparent",
                  border: "none",
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  fontSize: 12,
                  color: "var(--neon-cyan, var(--ox))",
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                clear risk filters
              </button>
            )}
          </div>
        </aside>

        {/* --- MAIN CONTENT ----------------------------------------- */}
        <div>
          {list.length === 0 ? (
            /* =====================================================
               BLOCK 10 · EMPTY STATE
               When filters yield no results, render a cinematic empty
               state instead of a void. 200px italic serif "?", a
               headline, an italic-serif standfirst, and a cyan-gradient
               CTA pill to clear all filters.
               ===================================================== */
            <div
              style={{
                position: "relative",
                padding: "56px 24px 64px",
                textAlign: "center",
                background:
                  "linear-gradient(135deg, var(--paper2) 0%, var(--ox-softer, var(--paper)) 100%)",
                border: "1px solid var(--line)",
                borderTopLeftRadius: 18,
                borderTopRightRadius: 4,
                borderBottomLeftRadius: 4,
                borderBottomRightRadius: 18,
                overflow: "hidden",
              }}
            >
              <div
                aria-hidden
                style={{
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 200,
                  lineHeight: 1,
                  color: "var(--ox-soft, var(--neon-cyan-soft))",
                  marginBottom: 8,
                }}
              >
                ?
              </div>
              <h3
                style={{
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 32,
                  letterSpacing: "-.02em",
                  margin: "0 0 10px",
                  color: "var(--ink)",
                }}
              >
                Nothing to show under this filter
              </h3>
              <p
                style={{
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  fontSize: 16,
                  color: "var(--ink2)",
                  margin: "0 0 24px",
                  lineHeight: 1.55,
                }}
              >
                Clear filters or pick a different category.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="rx-lift"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 22px",
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "#fff",
                  background:
                    "linear-gradient(135deg, var(--ox, var(--ink)) 0%, var(--neon-cyan, var(--ox)) 100%)",
                  border: "1px solid var(--neon-cyan, var(--ox))",
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 2,
                  borderBottomLeftRadius: 2,
                  borderBottomRightRadius: 8,
                  cursor: "pointer",
                  boxShadow:
                    "var(--shadow-e1), var(--neon-cyan-glow, 0 0 24px rgba(0,212,255,0.35))",
                }}
              >
                <Crosshair size={13} /> Clear filters
              </button>
            </div>
          ) : (
            SYN_CATS.filter(c => synCat === "all" || c.id === synCat).map((cat, catIdx) => {
              const items = list.filter(s => s.cat === cat.id);
              if (!items.length) return null;
              const CI = CAT_ICONS[cat.icon] || Stethoscope;
              // Categories with 4+ items get a richer subhead — italic
              // serif display with kicker, lede, and big decorative numeral.
              const richHead = items.length >= 4;

              // A short editorial lede per category — derived from a static
              // mapping so we don't touch the data file. Falls back to a
              // generic line if we don't have copy for a category yet.
              const ledeMap = {
                sepsis: "When the host is failing — start broad, narrow fast, and act on source.",
                resp:   "Airway and parenchymal infection — pathogen and severity drive the regimen.",
                blood:  "Bloodstream and endovascular disease — duration and echo, not breadth.",
                gu:     "Genitourinary infection — anatomy and resistance shape the empiric.",
                abd:    "Intra-abdominal sepsis — source control is the therapy.",
                ssti:   "Skin, soft tissue, and bone — depth and host determine the floor.",
                cns:    "CNS infection — get the LP, start the regimen, image as needed.",
                tox:    "Toxin-mediated illness — antibiotics modulate, supportive care saves.",
                immuno: "The immunocompromised host — assume more, treat broader, taper carefully.",
              };
              const lede = ledeMap[cat.id] || `Empiric coverage for ${cat.label.toLowerCase()}.`;

              return (
                <section
                  key={cat.id}
                  id={`syn-cat-${cat.id}`}
                  style={{
                    position: "relative",
                    marginBottom: 56,
                  }}
                >
                  {/* Wave 9 W9 · removed the per-category 200px italic
                      numeral watermark. The page hero "S" watermark
                      stays as the spread's editorial signature; the
                      per-category numerals were magazine-cliche and
                      muted the actual subhead beneath. If we want a
                      corner flourish here later, drop in a
                      <SectionArtwork variant="mesh" /> with position
                      adjustments — but right now the kicker + lede
                      carries the section structure clearly enough. */}

                  {richHead ? (
                    /* ====== BLOCK 5 · CATEGORY SECTION HEAD ======
                       Mono "CATEGORY · 01" kicker, 36px italic-serif
                       display title with a cyan dot and a 32px gradient
                       hairline as a leader, italic-serif lede underneath. */
                    <header
                      style={{
                        position: "relative",
                        zIndex: 1,
                        marginBottom: 22,
                        maxWidth: "62ch",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: ".24em",
                          textTransform: "uppercase",
                          color: "var(--ink2)",
                          marginBottom: 10,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span>Category · {pad2(catIdx + 1)}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "var(--neon-cyan, var(--ox))",
                            boxShadow:
                              "0 0 12px var(--neon-cyan, var(--ox))",
                            flex: "0 0 auto",
                          }}
                        />
                        <span
                          aria-hidden
                          style={{
                            width: 32,
                            height: 1,
                            background:
                              "linear-gradient(90deg, var(--neon-cyan, var(--ox)) 0%, transparent 100%)",
                            flex: "0 0 auto",
                          }}
                        />
                        <h3
                          style={{
                            fontFamily: "var(--serif)",
                            fontStyle: "italic",
                            fontWeight: 700,
                            fontSize: "clamp(28px, 3.4vw, 36px)",
                            letterSpacing: "-.02em",
                            lineHeight: 1.05,
                            color: "var(--ink)",
                            margin: 0,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <CI size={22} style={{ color: "var(--electric-blue, var(--ox))" }} />
                          {cat.label}
                          <Sparkle size={11} color="var(--neon-cyan, var(--ox))" style={{ opacity: 0.9, marginLeft: 2 }} />
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontStyle: "normal",
                              fontSize: 12,
                              fontWeight: 600,
                              color: "var(--ink2)",
                              letterSpacing: ".12em",
                              opacity: 0.6,
                              marginLeft: 4,
                            }}
                          >
                            {items.length}
                          </span>
                        </h3>
                      </div>
                      <p
                        className="rx-dropcap-cyan"
                        style={{
                          fontFamily: "var(--serif)",
                          fontStyle: "italic",
                          fontSize: 15,
                          lineHeight: 1.55,
                          color: "var(--ink2)",
                          margin: "10px 0 0",
                          paddingLeft: 28,
                        }}
                      >
                        {lede}
                      </p>
                    </header>
                  ) : (
                    /* slim subhead — same DNA as before for small groups */
                    <div
                      className="rx-syscat"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontFamily: "var(--mono)",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: ".18em",
                        textTransform: "uppercase",
                        color: "var(--ink2)",
                        margin: "0 0 16px",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      <span
                        className="ic"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          background:
                            "linear-gradient(135deg, var(--neon-cyan-soft, var(--line3)), transparent)",
                          color: "var(--electric-blue, var(--ox))",
                        }}
                      >
                        <CI size={13} />
                      </span>
                      {cat.label}
                      <span
                        style={{
                          marginLeft: 4,
                          color: "var(--ink2)",
                          opacity: 0.55,
                          fontWeight: 500,
                        }}
                      >
                        {items.length}
                      </span>
                    </div>
                  )}

                  {/* ============================================
                      BLOCK 4 · EDITORIAL 3-UP GRID
                      auto-fit / minmax(320px, 1fr) keeps the cards on a
                      print-grade rhythm. Each <article> carries the
                      asymmetric 18/4/18/4 radius, a 42px cyan accent
                      strip in the top-left, an italic-serif category
                      kicker, a serif syndrome name, a mono uppercase
                      data row, hover lift and slide-in "View →" affordance.
                      ============================================ */}
                  <div
                    style={{
                      position: "relative",
                      zIndex: 1,
                      display: "grid",
                      gap: 24,
                      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    }}
                  >
                    {items.map((s, sIdx) => {
                      const open = openSyn === s.id;
                      const SI = SYN_ICON[s.icon] || Stethoscope;
                      const highVol = isHighVolume(s);
                      const agentCount = (s.tiers || []).length;
                      const bugCount = (s.bugs || []).length;
                      // Estimate drug count from tier strings — a simple
                      // proxy that counts comma-separated agents per tier.
                      const drugCount = (s.tiers || []).reduce(
                        (acc, t) =>
                          acc +
                          ((String(t.rx || "").match(/\+|\bor\b|,/g) || []).length + 1),
                        0
                      );
                      // Stagger reveal — cap at 400ms so late cards don't drag.
                      const delay = Math.min(sIdx * 50, 400);

                      return (
                        <article
                          className="rx-acc rx-lift rx-fade-in-up syn-card rx-card-interactive rx-glow-lift"
                          data-open={open}
                          key={s.id}
                          style={{
                            position: "relative",
                            overflow: "hidden",
                            background: "var(--panel)",
                            border: "1px solid var(--line)",
                            borderTopLeftRadius: 18,
                            borderTopRightRadius: 4,
                            borderBottomLeftRadius: 4,
                            borderBottomRightRadius: 18,
                            boxShadow: open ? "var(--shadow-e3)" : "var(--shadow-e1)",
                            minWidth: 0,
                            animationDelay: `${delay}ms`,
                          }}
                        >
                          {/* 42px cyan accent strip in the top-left corner */}
                          <div
                            aria-hidden
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: 42,
                              height: 3,
                              background:
                                "linear-gradient(90deg, var(--neon-cyan, var(--ox)) 0%, transparent 100%)",
                              borderTopLeftRadius: 18,
                              pointerEvents: "none",
                              opacity: 0.9,
                              zIndex: 2,
                            }}
                          />
                          {/* faint magenta accent on the opposite corner */}
                          <div
                            aria-hidden
                            style={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              width: 36,
                              height: 36,
                              background:
                                "linear-gradient(315deg, var(--hot-magenta-soft, transparent), transparent 70%)",
                              borderBottomRightRadius: 18,
                              pointerEvents: "none",
                              opacity: 0.6,
                            }}
                          />

                          <button
                            className="rx-accbtn syn-card-btn"
                            onClick={() => setOpenSyn(open ? null : s.id)}
                            aria-expanded={open}
                            style={{
                              position: "relative",
                              padding: "22px 22px 20px",
                              background: "transparent",
                              border: "none",
                              width: "100%",
                              textAlign: "left",
                              cursor: "pointer",
                            }}
                          >
                            <span
                              className="rx-accicon"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 28,
                                height: 28,
                                borderRadius: 8,
                                background:
                                  "linear-gradient(135deg, var(--electric-blue-soft, var(--ox-softer)), transparent)",
                                color: "var(--electric-blue, var(--ox))",
                              }}
                            >
                              <SI size={18} />
                            </span>
                            <span className="rx-accmain syn-card-main" style={{ minWidth: 0 }}>
                              {/* italic-serif category kicker — 16px */}
                              <span
                                className="syn-card-kicker"
                                style={{
                                  display: "block",
                                  fontFamily: "var(--serif)",
                                  fontStyle: "italic",
                                  fontWeight: 500,
                                  fontSize: 14,
                                  color: "var(--ink2)",
                                  marginBottom: 4,
                                  transition:
                                    "transform var(--duration-base) var(--ease-out)",
                                }}
                              >
                                {cat.label}
                              </span>
                              <span
                                className="rx-accname syn-card-name"
                                style={{
                                  fontFamily: "var(--serif)",
                                  fontSize: "clamp(20px, 2.2vw, 26px)",
                                  fontWeight: 700,
                                  letterSpacing: "-.014em",
                                  color: "var(--ink)",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 8,
                                  lineHeight: 1.15,
                                }}
                              >
                                {s.name}
                                {highVol && (
                                  <Sparkle
                                    size={12}
                                    color="var(--hot-magenta, var(--ox))"
                                    style={{ opacity: 0.85 }}
                                  />
                                )}
                              </span>

                              {/* mono uppercase data row */}
                              <span
                                aria-hidden
                                style={{
                                  display: "flex",
                                  gap: 12,
                                  marginTop: 10,
                                  fontFamily: "var(--mono)",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  letterSpacing: ".14em",
                                  textTransform: "uppercase",
                                  color: "var(--ink2)",
                                  opacity: 0.78,
                                  fontVariantNumeric: "tabular-nums",
                                }}
                              >
                                <span><span style={{ color: "var(--neon-cyan, var(--ox))", fontWeight: 700 }}>{agentCount}</span> tier{agentCount === 1 ? "" : "s"}</span>
                                <span style={{ opacity: 0.4 }}>·</span>
                                <span><span style={{ color: "var(--neon-cyan, var(--ox))", fontWeight: 700 }}>{drugCount}</span> drug{drugCount === 1 ? "" : "s"}</span>
                                <span style={{ opacity: 0.4 }}>·</span>
                                <span><span style={{ color: "var(--neon-cyan, var(--ox))", fontWeight: 700 }}>{bugCount}</span> bug{bugCount === 1 ? "" : "s"}</span>
                              </span>

                              {!open && (
                                <span
                                  className="rx-accprev"
                                  style={{
                                    display: "block",
                                    marginTop: 12,
                                    lineHeight: 1.55,
                                    color: "var(--ink2)",
                                  }}
                                >
                                  <span className="k">{s.tiers[0].k}</span> {s.tiers[0].rx}
                                </span>
                              )}
                              {open && (
                                <span
                                  className="rx-accline"
                                  style={{
                                    display: "block",
                                    marginTop: 12,
                                    lineHeight: 1.55,
                                  }}
                                >
                                  {s.line}
                                </span>
                              )}

                              {/* slide-in "View →" affordance — only when collapsed */}
                              {!open && (
                                <span
                                  className="syn-card-view"
                                  aria-hidden
                                  style={{
                                    position: "absolute",
                                    bottom: 14,
                                    right: 18,
                                    fontFamily: "var(--mono)",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    letterSpacing: ".14em",
                                    textTransform: "uppercase",
                                    color: "var(--neon-cyan, var(--ox))",
                                    opacity: 0,
                                    transform: "translateX(-8px)",
                                    transition:
                                      "opacity var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out)",
                                    pointerEvents: "none",
                                  }}
                                >
                                  View →
                                </span>
                              )}
                            </span>
                            <span className="rx-accchev">
                              <ChevronRight size={18} />
                            </span>
                          </button>

                          {open && (
                            <div
                              className="rx-accbody"
                              style={{ padding: "0 22px 22px", position: "relative" }}
                            >
                              {SRC_CONTROL[s.id] && (
                                <div className="rx-srcctrl" role="note">
                                  <Crosshair size={15} />
                                  <span>
                                    <b>Source control is the therapy; antibiotics are adjunctive.</b> {SRC_CONTROL[s.id]}
                                  </span>
                                </div>
                              )}
                              {s.tiers.map((t, ti) => (
                                <div className={"rx-tier " + (t.sev ? "sev" : ti > 0 ? "alt" : "")} key={ti}>
                                  <div className="rx-tierlab">
                                    {ti === 0 && <Sparkle size={11} color="var(--neon-cyan, var(--ox))" style={{ marginRight: 6, verticalAlign: "-1px" }} />}
                                    {t.k}
                                    {t.sev && <span className="rx-pref pref-1">severe / first-hour</span>}
                                  </div>
                                  <p className="rx-rx" style={{ lineHeight: 1.6, marginBottom: 14 }}>{renderRich(t.rx, openDrug)}</p>
                                  <DoseAdjustBar rx={t.rx} ctx={ctx} d={d} onDrug={openDrug} synId={s.id} />
                                  {t.note && <p className="rx-rxnote" style={{ lineHeight: 1.6, marginBottom: 14 }}>{renderGloss(t.note, openDrug)}</p>}
                                </div>
                              ))}

                              <div className="rx-coverrow">
                                <div className="rx-coverbox">
                                  <div className="h">Cover</div>
                                  <div className="t" style={{ lineHeight: 1.55 }}>{renderGloss(s.cover.empiric, openDrug)}</div>
                                </div>
                                <div className="rx-coverbox">
                                  <div className="h">Don't / instead</div>
                                  <div className="t" style={{ lineHeight: 1.55 }}>{renderGloss(s.cover.drop, openDrug)}</div>
                                </div>
                              </div>

                              <div className="rx-metarow">
                                <span className="lab">Target organisms</span>
                              </div>
                              <div className="rx-bugs">
                                {s.bugs.map(b => <BugTag key={b} id={b} onClick={(id) => openOrg(id)} />)}
                              </div>

                              <div className="rx-metarow" style={{ marginTop: 14 }}>
                                <span>
                                  <span className="lab">Duration</span>{" "}
                                  <span className="rx-durpill"><Clock size={13} /> {s.duration}</span>
                                </span>
                                {(() => {
                                  const e = synEvidence(s);
                                  return e ? (
                                    <span>
                                      <span className="lab">Evidence</span>{" "}
                                      {e.ev && <Ev kind={e.ev} />}{" "}
                                      <Cite id={e.ref} onClick={(cid) => openTrial(cid)} />
                                    </span>
                                  ) : null;
                                })()}
                              </div>

                              <div className="rx-coverbox" style={{ marginTop: 12, background: "var(--ox-softer)", borderColor: "var(--ox-line)" }}>
                                <div className="h" style={{ color: "var(--ox)" }}>De-escalation</div>
                                <div className="t" style={{ lineHeight: 1.6 }}>{renderGloss(s.deesc, openDrug)}</div>
                              </div>

                              <GradientHairline variant="cyan-blue" style={{ margin: "16px 0 8px", opacity: 0.6 }} />

                              <ul className="rx-pearls" style={{ lineHeight: 1.6 }}>
                                {s.pearls.map((p, pi) => <li key={pi} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>") }} />)}
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
                                  style={{ marginRight: "auto" }}
                                >
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
                </section>
              );
            })
          )}
        </div>
      </div>

      {/* ============================================================
          Hover affordances for the editorial cards. We keep them in a
          one-shot <style> block because the hover-driven inset hairline
          + kicker shift + "View →" reveal can't be expressed inline.
          The .rx-lift hover already gives us the -2px translate; here
          we layer on a cyan inset, the kicker x-shift, and the View
          slide-in.
          ============================================================ */}
      <style>{`
        .syn-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-e3),
                      inset 0 0 0 1px color-mix(in srgb, var(--neon-cyan, var(--ox)) 32%, transparent);
        }
        .syn-card:hover .syn-card-kicker {
          transform: translateX(3px);
          color: var(--neon-cyan, var(--ox));
        }
        .syn-card:hover .syn-card-view {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .syn-card:hover { transform: none; }
          .syn-card:hover .syn-card-kicker { transform: none; }
          .syn-card:hover .syn-card-view { opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </>
  );
}

export { SyndromesSection };
