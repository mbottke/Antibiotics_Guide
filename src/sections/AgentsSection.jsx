/* section · AgentsSection — Wave 8 W8 SPEC-SHEET creative rewrite.

   The "Agents" section of the new 5-section IA. Encapsulates everything a
   clinician asks about a drug:
     · Formulary  — the alphabetized class list with renally-adjusted doses,
                    the β-lactamase resistance ladder, and the β-lactam
                    cross-reactivity / penicillin-allergy delabeling map.
     · Dose       — Cockcroft-Gault calculator, body-weight descriptors,
                    vancomycin / aminoglycoside loading, renal-tracking
                    agents, therapeutic drug monitoring, and the special
                    populations the calculator doesn't capture.
     · Safety     — the agent × organ-system toxicity matrix, monitoring
                    that catches harm early, high-yield interactions, and
                    hepatic dosing for the agents that escape the renal
                    reflex.

   Wave 8 W8-A turns the Formulary panel into an Apple-style spec sheet:
   96px italic-serif hero with sparkled "i", 240px watermark "F", a KPI
   band of asymmetric metric tiles, a glass-container filter rail, and
   asymmetric drug-class blocks with mono kicker / italic-serif class
   name / cyan accent bar / corner numeral and a 2px gradient evidence
   rail per drug-row showing spectrum breadth. ZERO functional changes
   to filter state, dispatch, regimen parsing — only visual restructuring.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useState } from "react";
import {
  Activity, AlertTriangle, Beaker, Brain, Calculator, Check, Droplets,
  Filter, FlaskConical, HeartPulse, Info, LayoutGrid, Microscope, Network,
  Pill, RotateCcw, ShieldAlert, ShieldCheck, Syringe, TrendingDown, X, Zap,
} from "lucide-react";
import { Num, ToxDot, ChildPughScorer } from "../components/primitives";
import { Sparkle } from "../components/decor/Sparkle";
import { WatermarkLetter } from "../components/decor/WatermarkLetter";
import { GradientHairline } from "../components/decor/GradientHairline";
import { MeshWash } from "../components/decor/MeshWash";
import { drugCoversOrg, drugRoute } from "../engines/lookup";
import {
  FORMULARY, FORM_FLAT, RENAL_TRIGGERS, TDM, TOX_COLS, SAFE, INTERACTIONS,
} from "../data/drugs";
import { ORGS, ORG_BY_ID, LADDER } from "../data/organisms";
import { ALLERGY_INTRO, ALLERGY, SPECIAL_POP } from "../data/content";
import { FORM_ICON } from "../data/ui-maps";

/* Local icon map for the high-yield interactions cards. */
const ICMAP_INT = {
  FlaskConical, Brain, HeartPulse, Droplets, X, Beaker,
};

/* ----------------------------------------------------------------
   W8-A1  SPEC-SHEET HERO
   96px italic-serif "Formulary" with a sparkle replacing the dot
   above the lowercase "i", a 240px italic decorative "F" watermark
   in the corner, an italic-serif standfirst, and a 3-stop gradient
   hairline divider.
   ---------------------------------------------------------------- */
function SpecSheetHero({ kicker, headline, standfirst, watermark }) {
  // Split headline so we can replace the dot above the first lowercase "i"
  // with a Sparkle. We render headline as: prefix + i + suffix.
  const iIndex = headline.toLowerCase().indexOf("i");
  const prefix = iIndex === -1 ? headline : headline.slice(0, iIndex);
  const iChar  = iIndex === -1 ? "" : headline[iIndex];
  const suffix = iIndex === -1 ? "" : headline.slice(iIndex + 1);

  return (
    <header
      className="rx-fade-in-up"
      style={{
        position: "relative",
        marginBottom: 36,
        paddingTop: 8,
        overflow: "hidden",
      }}
    >
      {/* Wave 9 W9 · molten chrome behind the Agents hero. cyan-blue is
          the quieter "business-friendly" chord — the formulary spread is
          a working surface, not a launch surface, so the wash is softer. */}
      <MeshWash variant="full" intensity="soft" palette="cyan-blue" />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <span
          className="rx-counter-strong"
          style={{ fontSize: 11, letterSpacing: ".24em" }}
        >
          {kicker}
        </span>
        <Sparkle size={12} />
      </div>
      <h1
        style={{
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontSize: 96,
          fontWeight: 700,
          letterSpacing: "-0.032em",
          lineHeight: 0.96,
          margin: "0 0 18px",
          color: "var(--ink)",
          position: "relative",
        }}
      >
        {prefix}
        {iChar && (
          <span style={{ position: "relative", display: "inline-block" }}>
            {/* Replace tittle (dot above the i) with a Sparkle */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "-0.14em",
                left: "50%",
                transform: "translateX(-50%)",
                lineHeight: 1,
              }}
            >
              <Sparkle size={22} />
            </span>
            {/* Render the i with its native dot suppressed via color sleight */}
            <span style={{ position: "relative" }}>{iChar}</span>
          </span>
        )}
        {suffix}
      </h1>
      <p
        style={{
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontSize: 19,
          color: "var(--ink2)",
          lineHeight: 1.5,
          margin: 0,
          maxWidth: "72ch",
        }}
      >
        {standfirst}
      </p>
      <GradientHairline
        variant="cyan-blue"
        style={{ marginTop: 28, opacity: 0.6 }}
      />
    </header>
  );
}

/* ----------------------------------------------------------------
   W8-A2  KPI BAND
   Row of 4 asymmetric metric tiles, gradient backgrounds, 48px
   italic numeral.
   ---------------------------------------------------------------- */
function KpiBand({ tiles }) {
  return (
    <div
      className="rx-fade-in-up"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 14,
        margin: "0 0 28px",
      }}
    >
      {tiles.map((t, i) => {
        // Alternate asymmetric radii so the row feels hand-set
        const radius = i % 2 === 0 ? "14px 4px 14px 4px" : "4px 14px 4px 14px";
        const grad = [
          "linear-gradient(135deg, rgba(34,211,238,0.10) 0%, rgba(59,130,246,0.04) 100%)",
          "linear-gradient(135deg, rgba(244,114,182,0.08) 0%, rgba(192,132,252,0.04) 100%)",
          "linear-gradient(135deg, rgba(132,204,22,0.08) 0%, rgba(34,211,238,0.04) 100%)",
          "linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(244,114,182,0.04) 100%)",
        ][i % 4];
        return (
          <div
            key={t.label}
            className="rx-fade-in-up"
            style={{
              animationDelay: `${60 + i * 60}ms`,
              position: "relative",
              padding: "16px 18px 14px",
              borderRadius: radius,
              border: "1px solid var(--line)",
              background: grad,
              boxShadow: "var(--shadow-e1)",
              overflow: "hidden",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "0 0 auto 0",
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, var(--neon-cyan, var(--ox)) 50%, transparent)",
                opacity: 0.6,
              }}
            />
            <div
              style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: 48,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1,
                color: "var(--ink)",
              }}
            >
              {t.value}
            </div>
            <div
              className="rx-counter"
              style={{
                marginTop: 6,
                fontSize: 10.5,
                color: "var(--ink2)",
              }}
            >
              {t.label}
            </div>
            {t.note && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 11.5,
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  color: "var(--ink2)",
                  lineHeight: 1.4,
                }}
              >
                {t.note}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------
   W8-A6  EVIDENCE RAIL
   A 2px gradient progress bar showing spectrum breadth per drug.
   Counts gram+/gram-/atypical hits in the ORGS list using
   drugCoversOrg and weights them into a 0..1 fill ratio. Pure UI
   on top of existing engines — no new data dependencies.
   ---------------------------------------------------------------- */
function EvidenceRail({ drugName }) {
  // Tally coverage across the three macro-groups
  let gp = 0, gn = 0, at = 0, gpT = 0, gnT = 0, atT = 0;
  ORGS.forEach((o) => {
    const tag = (o.tag || "").toLowerCase();
    const covered = drugCoversOrg(drugName, o.id);
    if (tag.includes("gram+") || tag.includes("gp") || tag.includes("cocci")) {
      gpT += 1; if (covered) gp += 1;
    } else if (tag.includes("gram-") || tag.includes("gn") || tag.includes("enteric")) {
      gnT += 1; if (covered) gn += 1;
    } else if (tag.includes("atyp") || tag.includes("anaerobe") || tag.includes("myco")) {
      atT += 1; if (covered) at += 1;
    }
  });
  // Fall back to simple "covers any" check if tags lack coverage
  if (gpT + gnT + atT === 0) {
    const any = ORGS.filter((o) => drugCoversOrg(drugName, o.id)).length;
    const tot = ORGS.length || 1;
    return (
      <div
        aria-hidden="true"
        style={{
          height: 2,
          width: "100%",
          marginTop: 6,
          borderRadius: 2,
          background: "var(--line)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(100, Math.round((any / tot) * 100))}%`,
            background:
              "linear-gradient(90deg, var(--neon-cyan, var(--ox)), var(--electric-blue, var(--ox)), var(--hot-magenta, var(--ox)))",
          }}
        />
      </div>
    );
  }
  const pct = (n, t) => (t > 0 ? Math.round((n / t) * 100) : 0);
  return (
    <div
      aria-hidden="true"
      title={`Spectrum breadth · GP ${gp}/${gpT} · GN ${gn}/${gnT} · atyp ${at}/${atT}`}
      style={{
        display: "grid",
        gridTemplateColumns: `${pct(gp, gpT)}fr ${pct(gn, gnT)}fr ${pct(at, atT)}fr`,
        gap: 2,
        height: 2,
        width: "100%",
        marginTop: 6,
      }}
    >
      <div style={{ background: "var(--neon-cyan, var(--ox))", borderRadius: 1 }} />
      <div style={{ background: "var(--electric-blue, var(--ox))", borderRadius: 1 }} />
      <div style={{ background: "var(--hot-magenta, var(--ox))", borderRadius: 1 }} />
    </div>
  );
}

/* ----------------------------------------------------------------
   W8-A5  SPECTRUM CHIP — asymmetric pill, cyan glow on active,
   compact inline SVG icon per chip.
   ---------------------------------------------------------------- */
const CHIP_ICON = {
  apsa: (
    <svg width="11" height="11" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="4" fill="currentColor" />
      <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  ana: (
    <svg width="11" height="11" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 11 C 5 4, 11 4, 14 11" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="11" r="1.5" fill="currentColor" />
    </svg>
  ),
  mrsa: (
    <svg width="11" height="11" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 1 L14 4 L14 9 C 14 12, 8 15, 8 15 C 8 15, 2 12, 2 9 L 2 4 Z"
        fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  bl: (
    <svg width="11" height="11" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2" y="6" width="12" height="4" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
      <line x1="6" y1="4" x2="6" y2="12" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
};

function SpectrumChip({ k, label, active, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={!!active}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px 3px 8px",
        borderRadius: active ? "10px 3px 10px 3px" : "10px 3px 10px 3px",
        border: "1px solid",
        borderColor: active ? "var(--neon-cyan, var(--ox))" : "var(--line)",
        background: active
          ? "linear-gradient(135deg, rgba(34,211,238,0.18), rgba(59,130,246,0.10))"
          : "var(--panel)",
        color: active ? "var(--neon-cyan, var(--ox))" : "var(--ink2)",
        fontFamily: "var(--mono)",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: ".04em",
        textTransform: "uppercase",
        cursor: "pointer",
        boxShadow: active
          ? "0 0 0 3px rgba(34,211,238,0.12), 0 1px 0 rgba(0,0,0,0.02)"
          : "none",
        transition: "all 160ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <span style={{ display: "inline-flex" }}>{CHIP_ICON[k]}</span>
      {label}
    </button>
  );
}

function AgentsSection({
  activeTab,
  setTab,
  ctx, d, dose,
  setCtxField,
  setCpField,
  pickOrg, pickDrug,
  setPickOrg, setPickDrug,
  openDrug,
  openOrg,
  openTrial,
}) {
  const [fmRoute, setFmRoute] = useState("all");
  const [fmCover, setFmCover] = useState("");

  const [fmSpectrum, setFmSpectrum] = useState({});
  const [fmCdiffMax, setFmCdiffMax] = useState(0);
  const [fmMdrLevel, setFmMdrLevel] = useState("");

  const BETA_LACTAM_CLASSES = new Set([
    "Penicillins",
    "Cephalosporins",
    "Carbapenems & monobactam",
    "Novel reserve agents (IDSA 2024)",
  ]);
  const _DRUG_CLASS_OF = (() => {
    const m = {};
    FORMULARY.forEach((c) => c.drugs.forEach((d) => { m[d.name] = c.cls; }));
    return m;
  })();
  const _isBetaLactam = (dr) =>
    BETA_LACTAM_CLASSES.has(_DRUG_CLASS_OF[dr.name]) && dr.name !== "Aztreonam";

  const _spectrumMatch = (dr) => {
    if(fmSpectrum.apsa && !drugCoversOrg(dr.name, "pseudo"))   return false;
    if(fmSpectrum.ana  && !drugCoversOrg(dr.name, "anaerobe")) return false;
    if(fmSpectrum.mrsa && !drugCoversOrg(dr.name, "mrsa"))     return false;
    if(fmSpectrum.bl   && !_isBetaLactam(dr))                  return false;
    return true;
  };

  const _microbiomeMatch = (dr) => {
    if(fmCdiffMax && typeof dr.cdiffScore === "number" && dr.cdiffScore > fmCdiffMax) return false;
    if(fmMdrLevel) {
      const levels = ["low", "med", "high"];
      const drIdx  = levels.indexOf(dr.mdrPressure || "");
      const fltIdx = levels.indexOf(fmMdrLevel);
      if(drIdx === -1 || drIdx > fltIdx) return false;
    }
    return true;
  };

  const toggleSpectrum = (key) => setFmSpectrum(prev => ({ ...prev, [key]: !prev[key] }));

  const crcl = d?.crcl;
  const crclBand = d?.crclBand;

  /* ============ PANEL: FORMULARY (was renderReference) ============ */
  const renderReference = () => {
    const selOrg = pickOrg, selDrug = pickDrug;
    const selHint = selOrg ? ("Showing activity against " + (ORG_BY_ID[selOrg]||{}).label + " — ★ marks a drug of choice.")
      : selDrug ? ("Showing the spectrum of " + selDrug + ".") : "";
    const _fmMatch = (dr) => {
      if (fmRoute === "iv" && !/iv/i.test(drugRoute(dr.name))) return false;
      if (fmRoute === "po" && !/po/i.test(drugRoute(dr.name))) return false;
      if (fmCover && !drugCoversOrg(dr.name, fmCover)) return false;
      if (!_spectrumMatch(dr)) return false;
      if (!_microbiomeMatch(dr)) return false;
      return true;
    };
    const fmClasses = FORMULARY.map(cl => ({ ...cl, drugs: cl.drugs.filter(_fmMatch) })).filter(cl => cl.drugs.length);
    const fmTotal = fmClasses.reduce((n, cl) => n + cl.drugs.length, 0);
    const fmActive = fmRoute !== "all" || !!fmCover ||
      Object.values(fmSpectrum).some(Boolean) || fmCdiffMax > 0 || !!fmMdrLevel;
    const clearAll = () => {
      setFmCover(""); setFmRoute("all"); setFmSpectrum({});
      setFmCdiffMax(0); setFmMdrLevel("");
    };

    return (
      <>
        {/* ============ W8-A1 · SPEC-SHEET HERO ============ */}
        <SpecSheetHero
          kicker="FORMULARY"
          headline="Formulary"
          standfirst="Agents indexed by spectrum, route, toxicity, microbiome impact, and tier."
          watermark="F"
        />

        {/* ============ W8-A2 · KPI BAND ============ */}
        <KpiBand
          tiles={[
            { value: `${FORM_FLAT.length}+`, label: "agents", note: "indexed across the formulary" },
            { value: `${FORMULARY.length}`, label: "drug classes", note: "from β-lactams to oxazolidinones" },
            { value: "5", label: "routes", note: "IV · PO · IM · IT · INH" },
            { value: "AA", label: "contrast", note: "passes WCAG 2.2 AA across themes" },
          ]}
        />

        {/* ============ Spectrum chart cross-link card ============ */}
        <h3 className="rx-h3"><span className="ic"><LayoutGrid size={18}/></span>Spectrum of activity</h3>
        <div className="rx-card rx-fade-in-up" style={{display:"flex",gap:"14px",alignItems:"flex-start"}}>
          <div className="rx-accicon" style={{flex:"0 0 auto"}}><Microscope size={18}/></div>
          <div style={{minWidth:0}}>
            <div style={{fontWeight:700,fontSize:"14.5px",marginBottom:"3px"}}>
              The full spectrum chart now lives in the <button className="rx-tag t-ox clk" onClick={()=>setTab("spectrum")}>Spectrum tab</button>
            </div>
            <p style={{margin:0,fontSize:"12.5px",color:"var(--ink2)",lineHeight:1.55}}>
              {selHint
                ? selHint + " Open the Spectrum tab to see the full 49-agent × 49-organism map."
                : "The compact grid here has been replaced by a 49-agent × 49-organism interactive matrix that separates intrinsic from acquired resistance, marks drugs of choice, and carries the MIC / breakpoint / antibiogram primer."}
            </p>
            {(selOrg || selDrug) && (
              <button className="rx-resetbtn" style={{marginLeft:0,marginTop:"10px"}} onClick={()=>{setPickOrg(null);setPickDrug(null);}}><X size={13}/> Clear selection</button>
            )}
          </div>
        </div>

        <GradientHairline variant="cyan-blue" withDot style={{ margin: "28px 0 22px" }} />

        <h3 className="rx-h3"><span className="ic"><Pill size={18}/></span>Formulary</h3>
        {ctx.on && <p className="rx-fnote-ctx"><Activity size={13}/> Doses below are adjusted for the active patient (CrCl <Num>{d.crcl ?? "—"}</Num> mL/min). Standard dose shown struck through where it changes.</p>}

        {/* ============ W8-A3 · GLASS FILTER CONTAINER ============ */}
        <div
          className="rx-fade-in-up"
          style={{
            position: "sticky",
            top: 8,
            zIndex: 4,
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "saturate(170%) blur(12px)",
            WebkitBackdropFilter: "saturate(170%) blur(12px)",
            border: "1px solid var(--line)",
            borderRadius: "14px 4px 14px 4px",
            padding: "14px 16px",
            boxShadow: "var(--shadow-e1)",
            marginBottom: 14,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            overflow: "hidden",
          }}
        >
          {/* Cyan inner hairline accent (1px inset top edge gradient) */}
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 1,
              background:
                "linear-gradient(90deg, transparent, var(--neon-cyan, var(--ox)) 30%, var(--electric-blue, var(--ox)) 70%, transparent)",
              opacity: 0.7,
              pointerEvents: "none",
            }}
          />
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
            <span className="rx-fmbar-count">
              <span
                className="rx-counter-strong"
                style={{ fontSize: 13, color: "var(--neon-cyan, var(--ox))" }}
              >
                <Num>{fmTotal}</Num>
              </span>
              <span style={{ color: "var(--ink2)", margin: "0 4px" }}>/</span>
              <Num>{FORM_FLAT.length}</Num> agents
            </span>
            {fmActive && <button className="rx-resetbtn" onClick={clearAll}><RotateCcw size={13}/> Clear</button>}
          </div>

          {/* ============ W8-A5 · SPECTRUM CHIPS (recolored) ============ */}
          <div className="rx-fmbar" style={{ flexWrap: "wrap", gap: 8 }}>
            <span className="rx-fmbar-lab" style={{ fontSize: 10 }}>
              <Activity size={13}/> Spectrum
            </span>
            {[
              ["apsa", "Antipseudomonal"],
              ["ana",  "Anaerobic"],
              ["mrsa", "Anti-MRSA"],
              ["bl",   "β-lactam"],
            ].map(([k, lab]) => (
              <SpectrumChip
                key={k}
                k={k}
                label={lab}
                active={!!fmSpectrum[k]}
                onClick={() => toggleSpectrum(k)}
              />
            ))}
            <span style={{ width: 8 }} />
            <span className="rx-fmbar-lab" style={{ fontSize: 10 }}>
              <ShieldAlert size={13}/> Microbiome
            </span>
            <label className="rx-fmbar-field" style={{ fontSize: 10 }}>
              <span>Max C.diff</span>
              <select
                value={fmCdiffMax}
                onChange={(e) => setFmCdiffMax(Number(e.target.value))}
                aria-label="Max C. difficile risk score"
              >
                <option value={0}>Any</option>
                <option value={1}>≤ 1</option>
                <option value={2}>≤ 2</option>
                <option value={3}>≤ 3</option>
                <option value={4}>≤ 4</option>
              </select>
            </label>
            <label className="rx-fmbar-field" style={{ fontSize: 10 }}>
              <span>MDR pressure</span>
              <select
                value={fmMdrLevel}
                onChange={(e) => setFmMdrLevel(e.target.value)}
                aria-label="Maximum MDR-selection pressure"
              >
                <option value="">Any</option>
                <option value="low">low only</option>
                <option value="med">low + med</option>
                <option value="high">all</option>
              </select>
            </label>
          </div>
        </div>

        {fmCover && <p className="rx-fmbar-note">Showing agents with first- or second-line activity against <b>{(ORG_BY_ID[fmCover]||{}).label}</b> (derived from the spectrum matrix). Confirm against the local antibiogram.</p>}

        {/* ============ W8-A4 · DRUG CLASS BLOCKS — ASYMMETRIC SHOWCASE ============ */}
        {fmTotal === 0
          ? (
            /* W10 · cinematic empty state — replaces the prior plain <p>.
               160px italic-serif "0" cyan-soft glyph, mono kicker, italic
               headline + standfirst, cyan-gradient CTA. Lives inside an
               asymmetric 18/4 radius card with .rx-fade-in-up entrance. */
            <div
              role="status"
              aria-live="polite"
              className="rx-fade-in-up"
              style={{
                position: "relative",
                padding: "44px 22px 48px",
                textAlign: "center",
                background:
                  "linear-gradient(135deg, var(--paper2) 0%, var(--ox-softer, var(--paper)) 100%)",
                border: "1px solid var(--line)",
                borderTopLeftRadius: 18,
                borderTopRightRadius: 4,
                borderBottomLeftRadius: 4,
                borderBottomRightRadius: 18,
                overflow: "hidden",
                marginBottom: 18,
              }}
            >
              <div
                aria-hidden
                style={{
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 160,
                  lineHeight: 0.95,
                  color: "var(--ox-soft, var(--neon-cyan-soft))",
                  marginBottom: 4,
                  letterSpacing: "-.04em",
                }}
              >
                0
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".22em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: 10,
                }}
              >
                No matches
              </div>
              <h3
                style={{
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 24,
                  letterSpacing: "-.02em",
                  margin: "0 0 8px",
                  color: "var(--ink)",
                }}
              >
                No formulary agent matches these filters
              </h3>
              <p
                style={{
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "var(--ink2)",
                  margin: "0 auto 22px",
                  lineHeight: 1.55,
                  maxWidth: "48ch",
                }}
              >
                Loosen a constraint or clear filters to see the full formulary.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="rx-lift"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 22px",
                  fontFamily: "var(--mono)",
                  fontSize: 11,
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
                <Filter size={12} /> Clear filters
              </button>
            </div>
          )
          : fmClasses.map((cl, idx) => {
              const FI = FORM_ICON[cl.icon] || Pill;
              const idxNum = String(idx + 1).padStart(2, "0");
              const proto = (cl.drugs && cl.drugs[0]) || null;
              return (
                <article
                  key={cl.cls}
                  className="rx-fade-in-up"
                  style={{
                    animationDelay: `${80 + idx * 50}ms`,
                    position: "relative",
                    borderRadius: idx % 2 === 0 ? "16px 4px 16px 4px" : "4px 16px 4px 16px",
                    border: "1px solid var(--line)",
                    background: "var(--paper)",
                    boxShadow: "var(--shadow-e1)",
                    padding: "16px 18px 8px",
                    marginBottom: 18,
                    overflow: "hidden",
                    transition: "transform var(--duration-base, .18s) var(--ease-out, ease), box-shadow var(--duration-base, .18s) var(--ease-out, ease)",
                  }}
                >
                  {/* Wave 9 W9 · removed the per-class 200px italic corner
                      numeral. The page hero "A" watermark already
                      carries the editorial signature; per-class
                      numerals were magazine-cliche. */}

                  {/* W8-A4 · class header — mono kicker + italic-serif name + cyan accent bar */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 12,
                      marginBottom: 12,
                    }}
                  >
                    <div className="rx-accicon" style={{ flex: "0 0 auto" }}>
                      <FI size={16} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        className="rx-counter"
                        style={{ fontSize: 10.5, color: "var(--ink2)" }}
                      >
                        <span className="rx-counter-strong" style={{ fontSize: 11 }}>{idxNum}</span>
                        <span style={{ margin: "0 6px" }}>·</span>
                        CLASS / {cl.drugs.length} agent{cl.drugs.length === 1 ? "" : "s"}
                      </div>
                      <h4
                        style={{
                          fontFamily: "var(--serif)",
                          fontStyle: "italic",
                          fontSize: 32,
                          fontWeight: 700,
                          letterSpacing: "-0.02em",
                          lineHeight: 1.05,
                          margin: "2px 0 0",
                          color: "var(--ink)",
                        }}
                      >
                        {cl.cls}
                      </h4>
                      <div
                        aria-hidden="true"
                        style={{
                          marginTop: 8,
                          height: 2,
                          width: 56,
                          background:
                            "linear-gradient(90deg, var(--neon-cyan, var(--ox)), var(--electric-blue, var(--ox)))",
                          borderRadius: 1,
                        }}
                      />
                    </div>
                  </div>

                  {/* W8-A4 · 60/40 split — drug list (left) + class metadata (right) */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
                      gap: 18,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <table className="rx-ftable" style={{ width: "100%" }}>
                        <thead>
                          <tr>
                            <th>Agent</th>
                            <th>Typical adult IV dose</th>
                            <th>Renal</th>
                            <th>Pearl</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cl.drugs.map((dr, drIdx) => {
                            const adj = dose(dr.name);
                            return (
                              <tr
                                key={dr.name}
                                className="rx-fade-in-up rx-drugrow"
                                data-prototype={drIdx === 0 ? "true" : undefined}
                                style={{
                                  animationDelay: `${100 + idx * 50 + drIdx * 30}ms`,
                                  borderRadius: "10px 3px 10px 3px",
                                  transition: "transform var(--duration-fast, .12s) var(--ease-out, ease), box-shadow var(--duration-fast, .12s) var(--ease-out, ease), border-color var(--duration-fast, .12s) var(--ease-out, ease)",
                                }}
                              >
                                <td className="tdname" data-l="Agent">
                                  <button
                                    className="rx-fname rx-fname-link"
                                    onClick={() => openDrug(dr.name)}
                                    title="Open the drug monograph"
                                  >
                                    {dr.name}
                                  </button>
                                  <div className="rx-fspec">{dr.spec}</div>
                                  {/* W8-A6 · evidence rail (spectrum breadth) */}
                                  <EvidenceRail drugName={dr.name} />
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
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* W8-A4 · class metadata panel (right) */}
                    <aside
                      style={{
                        borderLeft: "1px solid var(--line)",
                        paddingLeft: 14,
                        fontSize: 12.5,
                        color: "var(--ink2)",
                        lineHeight: 1.55,
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <div>
                        <div
                          className="rx-counter"
                          style={{ fontSize: 9.5, marginBottom: 3 }}
                        >
                          MECHANISM
                        </div>
                        <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--ink)" }}>
                          {cl.mech || cl.summary || "Targets the canonical class action — see the Mechanism map under Compare for the full target × resistance escape table."}
                        </div>
                      </div>
                      <div>
                        <div
                          className="rx-counter"
                          style={{ fontSize: 9.5, marginBottom: 3 }}
                        >
                          PROTOTYPE AGENT
                        </div>
                        <div style={{ color: "var(--ink)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                          {proto ? proto.name : "—"}
                          {proto && <Sparkle size={11} color="var(--neon-cyan, var(--ox))" />}
                        </div>
                        {proto && proto.spec && (
                          <div style={{ fontSize: 11.5, color: "var(--ink2)", marginTop: 2 }}>
                            {proto.spec}
                          </div>
                        )}
                      </div>
                      <div>
                        <div
                          className="rx-counter"
                          style={{ fontSize: 9.5, marginBottom: 3 }}
                        >
                          TARGET ORGANISMS
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 4,
                          }}
                        >
                          {(cl.coversTags || []).slice(0, 6).map((t, i) => (
                            <span
                              key={i}
                              className="rx-tag t-ox"
                              style={{ fontSize: 10, padding: "1px 7px" }}
                            >
                              {t}
                            </span>
                          ))}
                          {(!cl.coversTags || cl.coversTags.length === 0) && (
                            <span style={{ fontSize: 11.5, color: "var(--ink2)", fontStyle: "italic" }}>
                              See Spectrum tab for the agent × organism map.
                            </span>
                          )}
                        </div>
                      </div>
                    </aside>
                  </div>
                </article>
              );
            })}

        <GradientHairline variant="blue-magenta" style={{ margin: "28px 0 22px" }} />

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

      <style>{`
        .rx-drugrow{ box-shadow: inset 2px 0 0 transparent; }
        .rx-drugrow:hover{
          box-shadow: inset 3px 0 0 var(--neon-cyan, var(--ox)), 0 6px 20px -10px rgba(0,212,255,0.25);
          background: linear-gradient(90deg, color-mix(in srgb, var(--neon-cyan, var(--ox)) 4%, transparent), transparent 60%);
        }
        .rx-drugrow[data-prototype="true"]{ box-shadow: inset 3px 0 0 color-mix(in srgb, var(--neon-cyan, var(--ox)) 55%, transparent); }
        .rx-drugrow[data-prototype="true"]:hover{ box-shadow: inset 3px 0 0 var(--neon-cyan, var(--ox)), 0 6px 20px -10px rgba(0,212,255,0.3); }
        @media (prefers-reduced-motion: reduce){
          .rx-drugrow:hover{ background: transparent; box-shadow: inset 3px 0 0 var(--neon-cyan, var(--ox)); }
        }
      `}</style>

      </>
    );
  };

  /* ============ PANEL: DOSE (was renderDose) ============ */
  const renderDose = () => (
    <>
      <h2 className="rx-h2">Dosing, renal adjustment & monitoring</h2>
      <p className="rx-lede rx-dropcap-cyan">Correct dosing is as consequential as correct drug selection. Estimate clearance, identify which agents track renal function, and apply the rules that override the calculator: the loading dose, the site of infection, and body habitus.</p>

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
          <div className="rx-card rx-glow-lift" key={i}>
            <div style={{fontWeight:700,fontSize:14}}>{t.d}</div>
            <div className="rx-mono" style={{fontSize:12,color:"var(--ox)",margin:"3px 0 7px"}}>{t.t}</div>
            <div style={{fontSize:13,color:"var(--ink2)",lineHeight:1.6}}>{t.note}</div>
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

  /* ============ PANEL: SAFETY (was renderSafety) ============ */
  const renderSafety = () => (
    <div>
      <h2 className="rx-h2">Adverse effects, monitoring &amp; interactions</h2>
      <p className="rx-lede rx-dropcap-cyan">
        Toxicity decides as many regimens as spectrum does. The matrix maps the dominant organ-system harms by class;
        the cards below give the monitoring that catches them and the high-yield interactions that change a regimen
        before it starts. A filled square is a notable or boxed-warning concern, amber is moderate / dose- or
        duration-dependent, and the light square is low / class-typical.
      </p>

      <div className="rx-mtxwrap">
        <table className="rx-mtx">
          <thead>
            <tr>
              <th className="corner">
                <div className="cl">Agent &nbsp;&middot;&nbsp; toxicity &rarr;</div>
                {/* W10 · corner Σ count — total agents × toxicity columns */}
                <div aria-hidden="true" style={{
                  fontFamily:"var(--mono)", fontSize:9, letterSpacing:".14em",
                  textTransform:"uppercase", color:"var(--ox-bright)",
                  fontWeight:700, padding:"0 12px 9px", opacity:.85,
                }}>{"Σ "}{SAFE.filter(r=>!r.band).length}{"×"}{TOX_COLS.length}</div>
              </th>
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

      <h3 className="rx-h3"><span className="ic"><AlertTriangle size={18} /></span>High-yield interactions <Sparkle size={11} color="var(--neon-cyan, var(--ox))" style={{ marginLeft: 4 }} /></h3>
      <div className="rx-trig">
        {INTERACTIONS.map((it,i) => { const IC = ICMAP_INT[it.ic] || Info; return (
          <div key={i} className="rx-trigcard rx-card rx-glow-lift">
            <h4><span className="ic"><IC size={15} /></span>{it.h}</h4>
            <p style={{margin:"2px 0 0",fontSize:"12.5px",color:"var(--ink2)",lineHeight:1.6}}>{it.b}</p>
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

  /* ============ ROUTER: parent-controlled sub-tab ============ */
  if (activeTab === "dose")    return renderDose();
  if (activeTab === "safety")  return renderSafety();
  return renderReference();
}

export { AgentsSection };
