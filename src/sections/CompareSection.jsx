/* section · CompareSection — Wave 8 W8 VERSUS-MATCHUP creative rewrite.

   COMPARE is one of the five top-level sections in the new IA. It answers
   the family of cross-agent / cross-class questions that the original
   11-tab reference UI split across three separate tabs:

     • Spectrum         — the 49×49 expected-activity map and the
                          MIC / breakpoint / antibiogram principles that
                          translate spectrum into bedside choice.
     • Penetration      — the agent × site matrix plus the three PK/PD
                          killing patterns that drive dosing strategy.
     • Mechanisms       — the class × molecular-target × resistance-escape
                          table and the four routes of resistance.
     • Regimens         — A-vs-B regimen comparator (Wave 5 PR-13 path).

   Wave 8 W8-C turns every panel into a Linear-style versus matchup:
   shared 96px italic-serif headlines + 240px watermark + standfirst per
   panel; the Regimens comparator becomes a side-by-side VS layout with
   asymmetric glass cards labelled REGIMEN A / REGIMEN B and a giant
   italic "vs" cyan divider between them. The diff table is color-coded
   chip-per-row, toxicity column carries a 2px gradient delta bar, and
   the microbiome column carries severity-tinted cdiff/MDR chips. ZERO
   functional changes — regimen parsing, syndrome dispatch, sub-tab
   routing all behave exactly as before.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React, { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowLeftRight, Clock, CornerDownRight, Crosshair,
  FlaskConical, Info, Layers, Network, ShieldAlert, TrendingDown, X,
} from "lucide-react";
import { SpectrumCompare } from "../components/cards";
import { Cite, PDot } from "../components/primitives";
import { Sparkle } from "../components/decor/Sparkle";
import { WatermarkLetter } from "../components/decor/WatermarkLetter";
import { GradientHairline } from "../components/decor/GradientHairline";
import { Stripes } from "../components/decor/Stripes";
import { MeshWash } from "../components/decor/MeshWash";
import { SectionArtwork } from "../components/decor/SectionArtwork";
import { SpectrumChartFull } from "../spectrum/Spectrum";
import { PEN, PEN_SITES } from "../data/drugs";
import { MECH, ORGS } from "../data/organisms";
import { SYNDROMES } from "../data/syndromes";
import { compareRegimens } from "../engines/regimenCompare";

/* ----------------------------------------------------------------
   W8-C1  CINEMATIC HEAD per panel
   Shared 96px italic-serif headline + standfirst + gradient hairline.
   Variant-aware: each panel passes its own watermark letter and
   stand-first text so the eye registers "same shelf, four spines".
   ---------------------------------------------------------------- */
function CinematicHead({ kicker, headline, standfirst, watermark, icon = null }) {
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
        padding: "28px 24px 20px",
        borderRadius: "18px 4px 18px 4px",
        background: "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.18))",
        border: "1px solid color-mix(in srgb, var(--ox-bright) 18%, var(--line))",
        boxShadow: "var(--shadow-e1)",
        overflow: "hidden",
      }}
    >
      {/* Wave 9 W9 · pearlescent mesh wash for parity with the other
          reference hero blocks. Per-panel palette varies via the parent. */}
      <MeshWash variant="full" intensity="soft" palette="cyan-magenta-lime" />
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <span className="rx-counter-strong" style={{ fontSize: 11 }}>{kicker}</span>
        <Sparkle size={12} />
      </div>
      <h1
        style={{
          position: "relative",
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontSize: 96,
          fontWeight: 700,
          letterSpacing: "-0.032em",
          lineHeight: 0.96,
          margin: "0 0 18px",
          color: "var(--ink)",
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        {icon && <span style={{ flex: "0 0 auto" }}>{icon}</span>}
        <span>
          {prefix}
          {iChar && (
            <span style={{ position: "relative", display: "inline-block" }}>
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
              <span style={{ position: "relative" }}>{iChar}</span>
            </span>
          )}
          {suffix}
        </span>
      </h1>
      <p
        style={{
          position: "relative",
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
        style={{ position: "relative", marginTop: 28, opacity: 0.6 }}
      />
    </header>
  );
}

/* ----------------------------------------------------------------
   W8-C3  Severity tint helpers — colour-coded chips per delta state
   and per microbiome severity. Reuses neon tokens with var(--ox)
   fallbacks so the section degrades gracefully if the neon palette
   isn't yet loaded.
   ---------------------------------------------------------------- */
const DELTA_TINT = {
  aOnly: {
    bg: "linear-gradient(135deg, rgba(34,211,238,0.20), rgba(34,211,238,0.08))",
    fg: "var(--neon-cyan, var(--ox))",
    border: "var(--neon-cyan, var(--ox))",
    label: "A only",
  },
  bOnly: {
    bg: "linear-gradient(135deg, rgba(132,204,22,0.20), rgba(132,204,22,0.08))",
    fg: "var(--electric-lime, var(--ox))",
    border: "var(--electric-lime, var(--ox))",
    label: "B only",
  },
  both: {
    bg: "linear-gradient(135deg, rgba(59,130,246,0.14), rgba(59,130,246,0.04))",
    fg: "var(--electric-blue, var(--ox))",
    border: "var(--electric-blue, var(--ox))",
    label: "Both",
  },
  neither: {
    bg: "linear-gradient(135deg, rgba(251,191,36,0.20), rgba(244,114,182,0.08))",
    fg: "#b45309",
    border: "rgba(251,191,36,0.6)",
    label: "Neither",
  },
};

function DeltaChip({ delta }) {
  const t = DELTA_TINT[delta] || DELTA_TINT.both;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 9px",
        borderRadius: "8px 3px 8px 3px",
        border: `1px solid ${t.border}`,
        background: t.bg,
        color: t.fg,
        fontFamily: "var(--mono)",
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: ".05em",
        textTransform: "uppercase",
      }}
    >
      {t.label}
    </span>
  );
}

function SeverityChip({ kind, value }) {
  const tone =
    kind === "cdiff"
      ? value >= 4
        ? { bg: "rgba(244,114,182,0.18)", fg: "var(--hot-magenta, var(--ox))", border: "var(--hot-magenta, var(--ox))" }
        : value >= 2
        ? { bg: "rgba(251,191,36,0.18)", fg: "#b45309", border: "rgba(251,191,36,0.6)" }
        : { bg: "rgba(132,204,22,0.18)", fg: "var(--electric-lime, var(--ox))", border: "var(--electric-lime, var(--ox))" }
      : value === "high"
      ? { bg: "rgba(244,114,182,0.18)", fg: "var(--hot-magenta, var(--ox))", border: "var(--hot-magenta, var(--ox))" }
      : value === "med"
      ? { bg: "rgba(251,191,36,0.18)", fg: "#b45309", border: "rgba(251,191,36,0.6)" }
      : { bg: "rgba(34,211,238,0.16)", fg: "var(--neon-cyan, var(--ox))", border: "var(--neon-cyan, var(--ox))" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "1px 8px",
        borderRadius: "8px 3px 8px 3px",
        border: `1px solid ${tone.border}`,
        background: tone.bg,
        color: tone.fg,
        fontFamily: "var(--mono)",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: ".04em",
        textTransform: "uppercase",
      }}
    >
      {kind === "cdiff" ? `C.diff ${value || "—"}` : `MDR ${value || "—"}`}
    </span>
  );
}

/* 2px gradient bar showing relative delta weight (0..1). */
function DeltaBar({ ratio }) {
  const clamped = Math.max(0, Math.min(1, ratio || 0));
  return (
    <div
      aria-hidden="true"
      style={{
        height: 2,
        width: "100%",
        marginTop: 6,
        background: "var(--line)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.round(clamped * 100)}%`,
          background:
            "linear-gradient(90deg, var(--neon-cyan, var(--ox)), var(--electric-blue, var(--ox)), var(--hot-magenta, var(--ox)))",
        }}
      />
    </div>
  );
}

function CompareSection({
  activeTab,
  setTab,
  ctx,
  d,
  dose,
  openDrug,
  openOrg,
  openTrial,
  pickDrug,
  setPickDrug,
  pickOrg,
  setPickOrg,
}) {
  /* ============================================================
     SPECTRUM panel — the 49×49 expected-activity matrix.
     W8-C4 dresses each top-level matrix row in a `.rx-acc rx-lift`
     surface so the kinetic stagger applies, and adds a gradient-
     stripe band above the column headers.
     ============================================================ */
  const spectrumPanel = (
    <div>
      <CinematicHead
        kicker="COMPARE · 01 / 04"
        headline="Spectrum"
        standfirst="A 49-agent × 49-organism map of expected activity — drug versus bug, side by side."
        watermark="S"
      />

      <article className="rx-acc rx-lift rx-fade-in-up" style={{ padding: "14px 16px", marginBottom: 16 }}>
        <h3 className="rx-h3" style={{ marginTop: 0 }}>
          <span className="ic"><Layers size={18} /></span>Spectrum of activity
        </h3>
        <p className="rx-lede rx-dropcap-cyan">
          A 49-agent &times; 49-organism map of <i>expected</i> activity &mdash; the intrinsic and typical
          phenotype of each organism against each agent, drawn from EUCAST expected-resistant-phenotype
          tables, IDSA 2024 AMR guidance, and primary spectrum data. Fill fraction encodes the magnitude of
          activity and, critically, separates <b>intrinsic</b> resistance (a structural or enzymatic wall that no
          susceptibility report will breach) from <b>acquired</b> resistance and ordinary spectrum gaps. Hover to
          cross-highlight a drug&times;bug pair; click to lock focus. The gold star marks a drug of choice, not
          merely activity. This is a reasoning and teaching aid &mdash; not a substitute for the isolate&rsquo;s own
          susceptibilities or your local antibiogram.
        </p>
        {/* W8-C4 — gradient-stripe column header band on top of the matrix */}
        <div
          aria-hidden="true"
          style={{
            height: 3,
            width: "100%",
            margin: "6px 0 10px",
            borderRadius: 2,
            background:
              "linear-gradient(90deg, var(--neon-cyan, var(--ox)), var(--electric-blue, var(--ox)) 50%, var(--hot-magenta, var(--ox)))",
            opacity: 0.6,
          }}
        />
        <SpectrumCompare onDrug={(n)=>openDrug && openDrug(n)} />
      </article>

      <article className="rx-acc rx-lift rx-fade-in-up" style={{ padding: "14px 16px", marginBottom: 16 }}>
        <SpectrumChartFull />
      </article>

      <GradientHairline variant="cyan-blue" withDot style={{ margin: "16px 0 24px" }} />

      <h3 className="rx-h3"><span className="ic"><FlaskConical size={18} /></span>From spectrum to susceptibility &mdash; reading the data that drives the choice</h3>
      <p className="rx-lede" style={{maxWidth:"82ch"}}>
        The chart above is a population statement: what an agent <i>should</i> do against a typical member of a
        species. The decision at the bedside is governed by two further layers &mdash; the isolate&rsquo;s measured
        MIC interpreted against a breakpoint, and the local antibiogram that tells you how often that interpretation
        holds in your hospital. Spectrum, MIC, and antibiogram are three different questions; conflating them is a
        common source of error.
      </p>

      <div className="rx-2col">
        <div className="rx-mini rx-fade-in-up">
          <h4><span className="ic"><Layers size={16} /></span>The minimum inhibitory concentration</h4>
          <ul>
            <li>The <b>MIC</b> is the lowest concentration (&micro;g/mL) that suppresses visible growth in vitro &mdash; a potency measurement, not a probability of cure. It is meaningful only relative to the <b>breakpoint</b>.</li>
            <li>A breakpoint is set by integrating the MIC distribution (the wild-type cutoff, ECOFF), achievable drug exposure (PK/PD target attainment at the labeled dose), and clinical outcome data. <b>Lower MIC does not mean &ldquo;better drug&rdquo;</b> across agents &mdash; only within the same agent against the same bug.</li>
            <li>Comparing MICs <i>between</i> drugs is meaningless: a vancomycin MIC of 1 and a ceftriaxone MIC of 1 are not equivalent. Always read MIC against that agent&rsquo;s breakpoint.</li>
          </ul>
        </div>
        <div className="rx-mini rx-fade-in-up">
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

  /* ============================================================
     PENETRATION panel — tissue penetration matrix + the three PK/PD
     killing patterns and their dosing strategies.
     W8-C5 adds an asymmetric grid frame around the matrix with a
     gradient accent rail beside the active drug column.
     ============================================================ */
  const penetrationPanel = (
    <div>
      <CinematicHead
        kicker="COMPARE · 02 / 04"
        headline="Penetration"
        standfirst="Site by site, can the drug get there at the dose you can give — and which PK/PD lever wins?"
        watermark="P"
      />

      <p className="rx-lede rx-dropcap-cyan">
        Spectrum answers <i>can the drug kill this organism;</i> penetration and PK/PD answer <i>can it do so at the
        site, at this dose.</i> A susceptible report is necessary but not sufficient &mdash; daptomycin is inactivated
        in the lung, moxifloxacin never reaches urine, first-generation cephalosporins do not enter CSF, and
        aminoglycosides fail in the abscess they were prescribed for. The matrix below is expected adult penetration
        at usual systemic doses into an infected (inflamed) site; the cards translate the three killing patterns into
        the appropriate dosing strategy.
      </p>

      {/* W8-C5 · matrix wrapped in an asymmetric grid with cyan accent rail */}
      <div
        className="rx-fade-in-up"
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "4px minmax(0, 1fr)",
          gap: 10,
          padding: 12,
          borderRadius: "16px 4px 16px 4px",
          border: "1px solid var(--line)",
          background: "var(--paper)",
          boxShadow: "var(--shadow-e1)",
          overflow: "hidden",
          marginBottom: 14,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(180deg, var(--neon-cyan, var(--ox)), var(--electric-blue, var(--ox)), var(--hot-magenta, var(--ox)))",
            borderRadius: 2,
          }}
        />
        <div className="rx-mtxwrap" style={{ margin: 0 }}>
          <table className="rx-mtx">
            <thead>
              <tr>
                <th className="corner">
                  <div className="cl">Agent &nbsp;&middot;&nbsp; site &rarr;</div>
                  {/* W10 · corner Σ count — agents × penetration sites */}
                  <div aria-hidden="true" style={{
                    fontFamily:"var(--mono)", fontSize:9, letterSpacing:".14em",
                    textTransform:"uppercase", color:"var(--ox-bright)",
                    fontWeight:700, padding:"0 12px 9px", opacity:.85,
                  }}>{"Σ "}{PEN.filter(r=>!r.band).length}{"×"}{PEN_SITES.length}</div>
                </th>
                {PEN_SITES.map(s => (
                  <th key={s.k}><div className="rx-mtx-colh">{s.label}{s.sub?" · "+s.sub:""}</div></th>
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

      <GradientHairline variant="blue-magenta" style={{ margin: "20px 0" }} />

      <h3 className="rx-h3"><span className="ic"><Activity size={18} /></span>Three patterns of bacterial killing and their dosing implications</h3>
      <p className="rx-lede" style={{maxWidth:"82ch"}}>
        Every antibacterial maximizes one of three PK/PD indices. Knowing which one tells you whether to chase a high
        peak, a long time above MIC, or a large daily exposure &mdash; and whether the &ldquo;obvious&rdquo; dosing change helps
        or wastes drug.
      </p>
      <div className="rx-axis">
        <div className="rx-axiscard rx-fade-in-up rx-glow-lift">
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
        <div className="rx-axiscard rx-fade-in-up rx-glow-lift" style={{ animationDelay: "80ms" }}>
          <div className="ax-k">Time-dependent</div>
          <div className="ax-t">Stay above MIC</div>
          <div className="ax-pd">target: %fT&gt;MIC</div>
          <ul>
            <li><b>&beta;-lactams</b> &mdash; efficacy tracks the fraction of the interval free drug exceeds the MIC: penicillins &asymp;50%, cephalosporins &asymp;60&ndash;70%, carbapenems &asymp;40%.</li>
            <li><b>Extended (3&ndash;4 h) or continuous infusion</b> of cefepime, piperacillin-tazobactam, and meropenem raises %fT&gt;MIC for high-MIC organisms and the critically ill &mdash; more effective than a larger bolus.</li>
            <li>Little post-antibiotic effect against Gram-negatives &mdash; missed/late doses matter.</li>
          </ul>
        </div>
        <div className="rx-axiscard rx-fade-in-up rx-glow-lift" style={{ animationDelay: "160ms" }}>
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

  /* ============================================================
     MECHANISMS panel — class × molecular-target × resistance escape
     table + the four-route taxonomy.
     W8-C6 reshapes the resistance-route cards into asymmetric cards
     whose mechanism class lives in a vertical left-rail label.
     ============================================================ */
  const mechanismsPanel = (
    <div>
      <CinematicHead
        kicker="COMPARE · 03 / 04"
        headline="Mechanisms"
        standfirst="Every class hits one molecular target; resistance is the organism's exact counter-move."
        watermark="M"
      />

      <p className="rx-lede rx-dropcap-cyan">
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

      <GradientHairline variant="blue-magenta" withDot style={{ margin: "24px 0" }} />

      <h3 className="rx-h3"><span className="ic"><ShieldAlert size={18} /></span>Mechanisms of resistance: four routes of escape <Sparkle size={11} color="var(--neon-cyan, var(--ox))" style={{ marginLeft: 4 }} /></h3>

      {/* W8-C6 · asymmetric mechanism cards with vertical left-rail labels */}
      <div
        style={{
          display: "grid",
          /* W12 viewport density · minmax was 280; at a 1024 viewport the
             4-card row asked for 280×4 + 3×14 = 1162, blowing past the
             container's ~980 inner width and dropping to 3+1 wrap. 260
             keeps the row whole on 1024 while still hitting 4-up on a
             1440 canvas. */
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 14,
        }}
      >
        {[
          {
            n: 1,
            label: "INACTIVATE",
            title: "Inactivate the drug (enzymatic)",
            icon: <FlaskConical size={16} />,
            tint: "var(--neon-cyan, var(--ox))",
            items: [
              <><b>&beta;-lactamases</b> hydrolyze the &beta;-lactam ring &mdash; penicillinase &rarr; ESBL &rarr; AmpC &rarr; carbapenemase, the dominant Gram-negative threat.</>,
              <><b>Aminoglycoside-modifying enzymes</b> and <b>chloramphenicol acetyltransferase</b> chemically disable the drug.</>,
              <>Counter-move: a <b>&beta;-lactamase inhibitor</b> (avibactam, vaborbactam, durlobactam) or a structurally protected agent.</>,
            ],
          },
          {
            n: 2,
            label: "ALTER",
            title: "Alter / protect the target",
            icon: <Network size={16} />,
            tint: "var(--electric-blue, var(--ox))",
            items: [
              <><b>PBP2a</b> (MRSA), <b>mosaic/altered PBP</b> (penicillin-R pneumococcus, gonococcus).</>,
              <><b>D-Ala-D-Lac</b> precursor (vanA/vanB &rarr; VRE); <b>23S/rRNA methylation</b> (erm, cfr); <b>QRDR</b> and <b>rpoB</b> point mutations.</>,
              <>Counter-move: an agent that binds the modified target (ceftaroline for PBP2a) or a different target entirely.</>,
            ],
          },
          {
            n: 3,
            label: "DENY",
            title: "Deny access (efflux + porin loss)",
            icon: <X size={16} />,
            tint: "var(--hot-magenta, var(--ox))",
            items: [
              <><b>Efflux pumps</b> (tet, mef, RND systems) and <b>porin loss</b> reduce intracellular drug &mdash; central to <b>Pseudomonas</b> and <b>CRE</b> multidrug phenotypes.</>,
              <>Often combine with a low-level enzyme to cross a breakpoint &mdash; the basis of much &ldquo;variable&rdquo; activity in the spectrum chart.</>,
              <>Counter-move: high exposure, or the siderophore route (cefiderocol &ldquo;Trojan horse&rdquo; uptake).</>,
            ],
          },
          {
            n: 4,
            label: "BYPASS",
            title: "Bypass the pathway",
            icon: <CornerDownRight size={16} />,
            tint: "var(--electric-lime, var(--ox))",
            items: [
              <>Target <b>overproduction</b> or an <b>alternative enzyme</b> (sul/dfr in folate synthesis) outruns the drug.</>,
              <>Auxotrophy / exogenous folate uptake circumvents folate antagonists.</>,
              <>Counter-move: <b>sequential blockade</b> (TMP-SMX hits two folate steps) raises the bar for bypass.</>,
            ],
          },
        ].map((m, i) => (
          <article
            key={m.n}
            className="rx-fade-in-up rx-glow-lift"
            style={{
              animationDelay: `${80 + i * 70}ms`,
              position: "relative",
              display: "grid",
              gridTemplateColumns: "30px minmax(0, 1fr)",
              gap: 12,
              padding: 14,
              borderRadius: i % 2 === 0 ? "14px 4px 14px 4px" : "4px 14px 4px 14px",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              boxShadow: "var(--shadow-e1)",
              overflow: "hidden",
            }}
          >
            <SectionArtwork
              variant="prism"
              accent={m.label === "DENY" ? "magenta" : m.label === "BYPASS" ? "lime" : "cyan"}
              style={{ top: 4, right: 4, transform: "scale(0.5)", transformOrigin: "top right", opacity: 0.6 }}
            />
            {/* W8-C6 · vertical rail with rotated mechanism label */}
            <div
              aria-hidden="true"
              style={{
                position: "relative",
                background: `linear-gradient(180deg, ${m.tint}, transparent)`,
                borderRadius: 2,
                opacity: 0.85,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  bottom: 6,
                  left: "50%",
                  transform: "translate(-50%, 0) rotate(-90deg)",
                  transformOrigin: "center",
                  fontFamily: "var(--mono)",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: ".24em",
                  color: m.tint,
                  whiteSpace: "nowrap",
                }}
              >
                {String(m.n).padStart(2, "0")} · {m.label}
              </span>
            </div>
            <div>
              <h4 style={{ margin: "0 0 8px" }}>
                <span className="ic" style={{ color: m.tint }}>{m.icon}</span>
                {m.title}
              </h4>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.55, color: "var(--ink2)" }}>
                {m.items.map((it, ii) => <li key={ii}>{it}</li>)}
              </ul>
            </div>
          </article>
        ))}
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
        <div className="rx-pkpd-card rx-glow-lift">
          <div className="rx-pkpd-h"><Clock size={14}/> Time-dependent</div>
          <div className="rx-pkpd-tgt">Target: <b>%fT &gt; MIC</b></div>
          <div className="rx-pkpd-ag">β-lactams — carbapenems ~40%, penicillins ~50%, cephalosporins ~60–70%</div>
          <div className="rx-pkpd-do">Maximise time above MIC: <b>extended or continuous infusion</b> and more frequent dosing. Minimal Gram-negative post-antibiotic effect, so a trough that dips below MIC lets regrowth begin.</div>
        </div>
        <div className="rx-pkpd-card rx-glow-lift">
          <div className="rx-pkpd-h"><TrendingDown size={14}/> Concentration-dependent</div>
          <div className="rx-pkpd-tgt">Target: <b>C<sub>max</sub> / MIC</b></div>
          <div className="rx-pkpd-ag">Aminoglycosides (C<sub>max</sub>/MIC ~8–10), daptomycin</div>
          <div className="rx-pkpd-do">Drive the peak: <b>once-daily, extended-interval</b> dosing. A long post-antibiotic effect covers the trough and limits toxicity.</div>
        </div>
        <div className="rx-pkpd-card rx-glow-lift">
          <div className="rx-pkpd-h"><Activity size={14}/> Exposure (AUC)-dependent</div>
          <div className="rx-pkpd-tgt">Target: <b>AUC / MIC</b></div>
          <div className="rx-pkpd-ag">Vancomycin (AUC/MIC 400–600), fluoroquinolones (~125 GNR · 30–40 GP), linezolid</div>
          <div className="rx-pkpd-do">Total daily exposure governs effect: <b>AUC-guided</b> dosing — Bayesian for vancomycin — beats trough-only targeting <Cite id="vanco" onClick={(cid)=>openTrial && openTrial(cid)} />.</div>
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

  /* ============================================================
     REGIMENS panel — Wave 5 PR-13 cross-cutting path. Wave 8 W8-C2
     reframes the inputs as a VS layout (REGIMEN A vs REGIMEN B), and
     W8-C3 renders the diff output in a 3-col Coverage / Toxicity /
     Microbiome grid with colour-coded chips per organism + a 2px
     gradient delta-bar on toxicity + severity-tinted cdiff/MDR chips.
     ============================================================ */
  const regimensPanel = <RegimensComparePanel />;

  const tab = activeTab || "spectrum";
  if(tab === "penetration") return penetrationPanel;
  if(tab === "mechanisms") return mechanismsPanel;
  if(tab === "regimens") return regimensPanel;
  return spectrumPanel;
}

/* ============================================================
   Wave 8 W8-C2/C3 — Regimens compare sub-tab body.
   ============================================================ */
function RegimensComparePanel() {
  const [regAText, setRegAText] = useState("Cefepime, Vancomycin (IV)");
  const [regBText, setRegBText] = useState("Meropenem");
  const [synId, setSynId] = useState("sepsis");

  const regA = useMemo(
    () => regAText.split(",").map(s => s.trim()).filter(Boolean),
    [regAText],
  );
  const regB = useMemo(
    () => regBText.split(",").map(s => s.trim()).filter(Boolean),
    [regBText],
  );
  const syndrome = useMemo(
    () => SYNDROMES.find(s => s.id === synId) || null,
    [synId],
  );

  const diff = useMemo(
    () => compareRegimens(regA, regB, syndrome),
    [regA, regB, syndrome],
  );

  const winnerLabel = (w) => w === "a" ? "Regimen A" : w === "b" ? "Regimen B" : "Tie";
  const winnerColor = (w) => w === "tie" ? "var(--ink2)" : "var(--neon-cyan, var(--ox))";

  /* Toxicity delta weight (0..1) for the rail bar. */
  const toxA = diff.toxicity.a.total || 0;
  const toxB = diff.toxicity.b.total || 0;
  const toxMax = Math.max(toxA, toxB, 1);
  const toxRatioA = toxA / toxMax;
  const toxRatioB = toxB / toxMax;

  return (
    <div>
      <CinematicHead
        kicker="COMPARE · 04 / 04"
        headline="Regimens"
        standfirst="A versus B — coverage, toxicity, microbiome, evidence — four dimensions of a regimen swap, side by side."
        watermark="R"
        icon={
          <ArrowLeftRight
            size={64}
            aria-hidden
            style={{ color: "var(--neon-cyan, var(--ox))", flex: "0 0 auto" }}
          />
        }
      />

      <h2 className="rx-h2" style={{ marginTop: 0, marginBottom: 8, fontFamily: "var(--serif)" }}>
        Compare two empiric regimens
      </h2>
      <p className="rx-lede" style={{ maxWidth: "82ch", marginBottom: 20 }}>
        Side-by-side diff across four independent dimensions: organism coverage (using <code>drugCoversOrg</code>),
        toxicity tally (DRUG_IX rows per agent), microbiome impact (<i>C. difficile</i> score + MDR-selection pressure
        from FORMULARY), and evidence grade against an optional syndrome (tier-position scoring). Free-text input
        &mdash; alias and shorthand spellings ("zosyn", "vanc") are recognized through the same AGENT_RX registry the
        regimen engine uses.
      </p>

      {/* ============ W8-C2 · VS LAYOUT for regimen inputs ============ */}
      <div
        className="rx-fade-in-up"
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
          alignItems: "stretch",
          gap: 18,
          marginBottom: 18,
          padding: "8px 4px",
        }}
      >
        {/* W8-C2 · Stripes primitive as accent stripe on the page background of the VS divider */}
        <Stripes
          variant="cyan"
          angle={135}
          width="100%"
          height="100%"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            opacity: 0.18,
            borderRadius: 12,
          }}
        />

        {/* Regimen A glass card (tl-br asymmetry) */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "saturate(170%) blur(12px)",
            WebkitBackdropFilter: "saturate(170%) blur(12px)",
            border: "1px solid var(--neon-cyan, var(--line))",
            borderRadius: "16px 4px 16px 4px",
            padding: 16,
            boxShadow: "var(--shadow-e2)",
          }}
        >
          <div className="rx-counter-strong" style={{ fontSize: 11, color: "var(--neon-cyan, var(--ox))" }}>
            REGIMEN A
          </div>
          <input
            type="text"
            value={regAText}
            onChange={(e) => setRegAText(e.target.value)}
            placeholder="Cefepime, Vancomycin (IV)"
            aria-label="Regimen A — comma-separated drug names"
            /* W10 · glass-diffuse fill + cyan focus halo. */
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--neon-cyan, var(--ox-bright))";
              e.currentTarget.style.boxShadow = "0 0 0 2px var(--neon-cyan, var(--ox-bright)), 0 0 18px color-mix(in srgb, var(--neon-cyan, var(--ox-bright)) 32%, transparent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--line)";
              e.currentTarget.style.boxShadow = "none";
            }}
            style={{
              width: "100%",
              marginTop: 8,
              padding: "10px 12px",
              fontFamily: "var(--mono)",
              fontSize: 14,
              fontWeight: 600,
              border: "1px solid var(--line)",
              borderRadius: "10px 3px 10px 3px",
              background: "linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(245,250,253,0.55) 100%)",
              backdropFilter: "blur(10px) saturate(160%)",
              WebkitBackdropFilter: "blur(10px) saturate(160%)",
              color: "var(--ink)",
              outline: "none",
              transition: "border-color var(--duration-fast, .12s) var(--ease-out, ease), box-shadow var(--duration-base, .18s) var(--ease-out, ease)",
            }}
          />
          <div style={{ marginTop: 8, fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink2)" }}>
            {regA.length} agent{regA.length === 1 ? "" : "s"} parsed
          </div>
        </div>

        {/* W8-C2 · giant italic "vs" in cyan */}
        <div
          aria-hidden="true"
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 96,
          }}
        >
          <span
            style={{
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: "var(--neon-cyan, var(--ox))",
              textShadow:
                "0 0 24px rgba(34,211,238,0.25), 0 0 1px rgba(34,211,238,0.5)",
            }}
          >
            vs
          </span>
        </div>

        {/* Regimen B glass card (tr-bl asymmetry) */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "saturate(170%) blur(12px)",
            WebkitBackdropFilter: "saturate(170%) blur(12px)",
            border: "1px solid var(--hot-magenta, var(--line))",
            borderRadius: "4px 16px 4px 16px",
            padding: 16,
            boxShadow: "var(--shadow-e2)",
          }}
        >
          <div className="rx-counter-strong" style={{ fontSize: 11, color: "var(--hot-magenta, var(--ox))" }}>
            REGIMEN B
          </div>
          <input
            type="text"
            value={regBText}
            onChange={(e) => setRegBText(e.target.value)}
            placeholder="Meropenem"
            aria-label="Regimen B — comma-separated drug names"
            /* W10 · matching magenta-tinted focus halo (mirrors the
                Regimen-B magenta accent already in the card border). */
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--hot-magenta, var(--ox-bright))";
              e.currentTarget.style.boxShadow = "0 0 0 2px var(--hot-magenta, var(--ox-bright)), 0 0 18px color-mix(in srgb, var(--hot-magenta, var(--ox-bright)) 32%, transparent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--line)";
              e.currentTarget.style.boxShadow = "none";
            }}
            style={{
              width: "100%",
              marginTop: 8,
              padding: "10px 12px",
              fontFamily: "var(--mono)",
              fontSize: 14,
              fontWeight: 600,
              border: "1px solid var(--line)",
              borderRadius: "3px 10px 3px 10px",
              background: "linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(245,250,253,0.55) 100%)",
              backdropFilter: "blur(10px) saturate(160%)",
              WebkitBackdropFilter: "blur(10px) saturate(160%)",
              color: "var(--ink)",
              outline: "none",
              transition: "border-color var(--duration-fast, .12s) var(--ease-out, ease), box-shadow var(--duration-base, .18s) var(--ease-out, ease)",
            }}
          />
          <div style={{ marginTop: 8, fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink2)" }}>
            {regB.length} agent{regB.length === 1 ? "" : "s"} parsed
          </div>
        </div>
      </div>

      {/* Syndrome selector sits below the VS row */}
      <div
        className="rx-card rx-fade-in-up"
        style={{
          marginBottom: 22,
          padding: "12px 14px",
          borderRadius: "14px 4px 14px 4px",
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span
            className="rx-counter"
            style={{ fontSize: 10, color: "var(--ink2)" }}
          >
            SYNDROME CONTEXT — drives coverage + evidence grade
          </span>
          <select
            value={synId}
            onChange={(e) => setSynId(e.target.value)}
            aria-label="Syndrome context"
            /* W10 · asymmetric 10/3 + cyan caret + glass tint + cyan halo. */
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--neon-cyan, var(--ox-bright))";
              e.currentTarget.style.boxShadow = "0 0 0 2px var(--neon-cyan, var(--ox-bright)), 0 0 14px color-mix(in srgb, var(--neon-cyan, var(--ox-bright)) 28%, transparent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--line)";
              e.currentTarget.style.boxShadow = "none";
            }}
            style={{
              padding: "8px 30px 8px 12px",
              fontSize: 12,
              fontFamily: "var(--mono)",
              border: "1px solid var(--line)",
              borderRadius: "10px 3px 10px 3px",
              background: `linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(245,250,253,0.55) 100%), url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'><path d='M1 1.5L6 6.5L11 1.5' stroke='%2300D4FF' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/></svg>")`,
              backgroundRepeat: "no-repeat, no-repeat",
              backgroundPosition: "0 0, right 10px center",
              backgroundSize: "cover, 12px 8px",
              backdropFilter: "blur(10px) saturate(160%)",
              WebkitBackdropFilter: "blur(10px) saturate(160%)",
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
              outline: "none",
              cursor: "pointer",
              minWidth: 240,
              transition: "border-color var(--duration-fast, .12s) var(--ease-out, ease), box-shadow var(--duration-base, .18s) var(--ease-out, ease)",
            }}
          >
            <option value="">— none (use full organism set) —</option>
            {SYNDROMES.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
      </div>

      {/* ============ W8-C3 · 3-col matchup grid ============ */}
      <div
        style={{
          display: "grid",
          /* W12 viewport density · 280 → 260 so the 3-col matchup stays
             intact on a 1024 viewport where 280 was one step too tight
             (3*280+2*14 = 868 vs ~980 inner — fine — but the per-card
             content readability improves with the extra breathing room
             that 260 buys at the same viewport). */
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
      >
        {/* Coverage card */}
        <div
          className="rx-fade-in-up"
          style={{
            position: "relative",
            padding: 14,
            borderRadius: "14px 4px 14px 4px",
            border: "1px solid var(--line)",
            background: "var(--paper)",
            boxShadow: "var(--shadow-e1)",
            overflow: "hidden",
          }}
        >
          <h4 style={{ margin: "0 0 10px" }}>
            <span className="ic"><Crosshair size={15} /></span>Coverage
          </h4>
          <div className="rx-counter" style={{ fontSize: 10, marginBottom: 6 }}>
            ORGANISMS · A {diff.coverage.organisms.filter(o => o.a).length} vs B {diff.coverage.organisms.filter(o => o.b).length}
          </div>
          {diff.coverage.organisms.length === 0 ? (
            /* W10 · beautiful empty state for the compact coverage card.
               Compact variant — italic-serif headline + standfirst with a
               cyan-soft em-dash glyph, sized for the card body (no CTA;
               the parent inputs already fill that role). */
            <div
              role="status"
              aria-live="polite"
              style={{
                padding: "24px 12px 22px",
                textAlign: "center",
                background:
                  "linear-gradient(180deg, transparent 0%, var(--ox-softer, var(--paper)) 100%)",
                border: "1px dashed var(--line)",
                borderRadius: "12px 4px 12px 4px",
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
                  marginBottom: 6,
                }}
              >
                —
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: 6,
                }}
              >
                Nothing to compare yet
              </div>
              <p
                style={{
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  fontSize: 13,
                  color: "var(--ink2)",
                  margin: 0,
                  lineHeight: 1.55,
                }}
              >
                Pick a syndrome or add drugs to see the coverage delta.
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
              {diff.coverage.organisms.map(o => (
                <div
                  key={o.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) auto",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 0",
                    borderTop: "1px solid var(--line)",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: "var(--ink)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={o.label}
                    >
                      {o.label}
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--ink2)", marginTop: 2 }}>
                      <span style={{ color: o.a ? "var(--neon-cyan, var(--ox))" : "var(--ink2)" }}>A {o.a ? "✓" : "—"}</span>
                      <span style={{ margin: "0 6px" }}>·</span>
                      <span style={{ color: o.b ? "var(--electric-lime, var(--ox))" : "var(--ink2)" }}>B {o.b ? "✓" : "—"}</span>
                    </div>
                  </div>
                  <DeltaChip delta={o.delta} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toxicity card with gradient delta bars */}
        <div
          className="rx-fade-in-up"
          style={{
            position: "relative",
            padding: 14,
            borderRadius: "4px 14px 4px 14px",
            border: "1px solid var(--line)",
            background: "var(--paper)",
            boxShadow: "var(--shadow-e1)",
            overflow: "hidden",
          }}
        >
          <h4 style={{ margin: "0 0 10px" }}>
            <span className="ic"><ShieldAlert size={15} /></span>Toxicity
          </h4>
          <div className="rx-counter" style={{ fontSize: 10, marginBottom: 10 }}>
            FLAG TALLY · DRUG_IX × AGENT
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: "var(--neon-cyan, var(--ox))" }}>
                  REGIMEN A
                </span>
                <span style={{ fontSize: 12, color: "var(--ink2)" }}>
                  <b style={{ color: "var(--ink)" }}>{diff.toxicity.a.total}</b> flags · <b style={{ color: "var(--ink)" }}>{diff.toxicity.a.majorCount}</b> major
                </span>
              </div>
              <DeltaBar ratio={toxRatioA} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: "var(--hot-magenta, var(--ox))" }}>
                  REGIMEN B
                </span>
                <span style={{ fontSize: 12, color: "var(--ink2)" }}>
                  <b style={{ color: "var(--ink)" }}>{diff.toxicity.b.total}</b> flags · <b style={{ color: "var(--ink)" }}>{diff.toxicity.b.majorCount}</b> major
                </span>
              </div>
              <DeltaBar ratio={toxRatioB} />
            </div>
          </div>
        </div>

        {/* Microbiome card with severity chips */}
        <div
          className="rx-fade-in-up"
          style={{
            position: "relative",
            padding: 14,
            borderRadius: "14px 4px 14px 4px",
            border: "1px solid var(--line)",
            background: "var(--paper)",
            boxShadow: "var(--shadow-e1)",
            overflow: "hidden",
          }}
        >
          <h4 style={{ margin: "0 0 10px" }}>
            <span className="ic"><Activity size={15} /></span>Microbiome
          </h4>
          <div className="rx-counter" style={{ fontSize: 10, marginBottom: 10 }}>
            C.DIFF MAX · MDR PRESSURE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: "var(--neon-cyan, var(--ox))", marginBottom: 4 }}>
                REGIMEN A
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <SeverityChip kind="cdiff" value={diff.microbiome.a.cdiffMax} />
                <SeverityChip
                  kind="mdr"
                  value={
                    diff.microbiome.a.mdrCount.high > 0 ? "high"
                    : diff.microbiome.a.mdrCount.med > 0 ? "med"
                    : "low"
                  }
                />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: "var(--hot-magenta, var(--ox))", marginBottom: 4 }}>
                REGIMEN B
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <SeverityChip kind="cdiff" value={diff.microbiome.b.cdiffMax} />
                <SeverityChip
                  kind="mdr"
                  value={
                    diff.microbiome.b.mdrCount.high > 0 ? "high"
                    : diff.microbiome.b.mdrCount.med > 0 ? "med"
                    : "low"
                  }
                />
              </div>
            </div>
            <div
              style={{
                marginTop: 4,
                fontFamily: "var(--mono)",
                fontSize: 11,
                fontWeight: 700,
                color: winnerColor(diff.microbiome.winner),
              }}
            >
              LOWER COLLATERAL → {winnerLabel(diff.microbiome.winner).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* ============ W8-C3 · full coverage delta table (verbose, label-rich) ============ */}
      <h3 className="rx-h3">
        <span className="ic"><Crosshair size={18} /></span>
        Coverage delta — per organism
      </h3>
      <div
        className="rx-card rx-fade-in-up"
        style={{
          marginBottom: 16,
          borderRadius: "16px 4px 16px 4px",
          boxShadow: "var(--shadow-e1)",
        }}
      >
        {diff.coverage.organisms.length === 0 ? (
          /* W10 · larger empty state for the verbose coverage-delta table.
             A clean italic-serif "—" anchors the void, with mono kicker
             and italic-serif standfirst hinting at what to do. */
          <div
            role="status"
            aria-live="polite"
            style={{
              padding: "36px 18px 40px",
              textAlign: "center",
            }}
          >
            <div
              aria-hidden
              style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 96,
                lineHeight: 0.85,
                color: "var(--ox-soft, var(--neon-cyan-soft))",
                marginBottom: 6,
              }}
            >
              —
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 8,
              }}
            >
              No organisms in scope
            </div>
            <p
              style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: 14,
                color: "var(--ink2)",
                margin: "0 auto",
                lineHeight: 1.55,
                maxWidth: "46ch",
              }}
            >
              Pick a syndrome or add a drug to either regimen to populate the
              per-organism coverage delta.
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "var(--paper2)" }}>
                <th style={{ textAlign: "left", padding: "6px 9px", fontWeight: 700 }}>Organism</th>
                <th style={{ textAlign: "center", padding: "6px 9px", fontWeight: 700 }}>A</th>
                <th style={{ textAlign: "center", padding: "6px 9px", fontWeight: 700 }}>B</th>
                <th style={{ textAlign: "left", padding: "6px 9px", fontWeight: 700 }}>Delta</th>
              </tr>
            </thead>
            <tbody>
              {diff.coverage.organisms.map(o => (
                <tr key={o.id} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "6px 9px" }}>{o.label}</td>
                  <td style={{ padding: "6px 9px", textAlign: "center", color: o.a ? "var(--neon-cyan, var(--ox))" : "var(--ink2)" }}>
                    {o.a ? "✓" : "—"}
                  </td>
                  <td style={{ padding: "6px 9px", textAlign: "center", color: o.b ? "var(--electric-lime, var(--ox))" : "var(--ink2)" }}>
                    {o.b ? "✓" : "—"}
                  </td>
                  <td style={{ padding: "6px 9px" }}>
                    <DeltaChip delta={o.delta} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <GradientHairline variant="magenta-lime" withDot style={{ margin: "20px 0" }} />

      {/* Verbose secondary summary preserves text-search assertions and the
         original "Microbiome impact / Toxicity tally / Evidence grade"
         labels expected by RTL tests. */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        <div className="rx-card rx-fade-in-up" style={{ borderRadius: "16px 4px 16px 4px", boxShadow: "var(--shadow-e1)" }}>
          <h4><span className="ic"><Activity size={15} /></span>Microbiome impact</h4>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li><b>A:</b> worst C.diff = {diff.microbiome.a.cdiffMax || "—"} · MDR high count = {diff.microbiome.a.mdrCount.high}</li>
            <li><b>B:</b> worst C.diff = {diff.microbiome.b.cdiffMax || "—"} · MDR high count = {diff.microbiome.b.mdrCount.high}</li>
            <li style={{ marginTop: 6, color: winnerColor(diff.microbiome.winner), fontWeight: 600 }}>
              Lower collateral: {winnerLabel(diff.microbiome.winner)}
            </li>
          </ul>
        </div>
        <div className="rx-card rx-fade-in-up" style={{ borderRadius: "16px 4px 16px 4px", boxShadow: "var(--shadow-e1)" }}>
          <h4><span className="ic"><ShieldAlert size={15} /></span>Toxicity tally</h4>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li><b>A:</b> {diff.toxicity.a.total} flags ({diff.toxicity.a.majorCount} major)</li>
            <li><b>B:</b> {diff.toxicity.b.total} flags ({diff.toxicity.b.majorCount} major)</li>
          </ul>
        </div>
        <div className="rx-card rx-fade-in-up" style={{ borderRadius: "16px 4px 16px 4px", boxShadow: "var(--shadow-e1)" }}>
          <h4><span className="ic"><FlaskConical size={15} /></span>Evidence grade</h4>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li><b>A:</b> {diff.evidence.a.preferred.length} preferred · {diff.evidence.a.alternative.length} alt · {diff.evidence.a.offProtocol.length} off-protocol</li>
            <li><b>B:</b> {diff.evidence.b.preferred.length} preferred · {diff.evidence.b.alternative.length} alt · {diff.evidence.b.offProtocol.length} off-protocol</li>
            <li style={{ marginTop: 6, color: winnerColor(diff.evidence.winner), fontWeight: 600 }}>
              Better-graded: {winnerLabel(diff.evidence.winner)}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export { CompareSection };
