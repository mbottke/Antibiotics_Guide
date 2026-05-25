/* component · PkPdBlock — Wave 5 PR-9 PK/PD visualization layer.

   Consumes the FORMULARY.pkpd field added in PR-4 and renders a
   compact horizontal bar per agent showing the clinical target
   (%T > MIC, AUC24/MIC, Cmax/MIC) and the regimen's exposure
   pattern. The visualization is pure CSS — no chart library — so
   it stays cheap to render and matches the rest of the answer-
   canvas's monospace numeric typography.

   The architectural intent: bedside clinicians order extended-
   infusion or weight-based dosing without seeing the kinetic
   curve underneath. PkPdBlock makes the kinetic class visible at
   a glance, anchored to the actual agent in the current regimen.

   PATTERNS (from FORMULARY.pkpd.pattern)
   --------------------------------------
     time-dep    Time above MIC drives killing. β-lactams. Bar
                 shaded across the dosing interval.
     conc-dep    Peak concentration drives killing. Aminoglycosides,
                 daptomycin, metronidazole. Bar with a tall peak
                 marker at start of dosing interval.
     AUC         Area under the curve drives killing. Vancomycin,
                 fluoroquinolones, tetracyclines. Smooth bar
                 spanning the interval — area is the contract.
     time+AUC    Both time and AUC matter (linezolid). Hybrid bar.

   GRACEFUL FALLBACK
   -----------------
   Returns null when no agent in the regimen has authored pkpd
   data. Matches the diagnostics / OPAT / monitoring graceful-
   fallback contract — the layer registry's `when` predicate
   short-circuits before render.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { Activity, Zap } from "lucide-react";
import { Section } from "./Section.jsx";
import { FORMULARY, DRUG_ALIASES } from "../data/drugs.js";

/* FORMULARY-keyed lookup including alias reverse-resolution. */
const _DRUG_BY_NAME = (() => {
  const m = {};
  FORMULARY.forEach(c => c.drugs.forEach(d => { m[d.name] = d; }));
  return m;
})();

function _resolveDrug(name) {
  if(_DRUG_BY_NAME[name]) return _DRUG_BY_NAME[name];
  // Try DRUG_ALIASES reverse map (Spectrum name → FORMULARY name)
  const reverse = Object.keys(DRUG_ALIASES).find(k => DRUG_ALIASES[k] === name);
  if(reverse && _DRUG_BY_NAME[reverse]) return _DRUG_BY_NAME[reverse];
  return null;
}

const PATTERN_LABEL = {
  "time-dep":  "Time-dependent",
  "conc-dep":  "Concentration-dependent",
  "AUC":       "AUC-driven",
  "time+AUC":  "Time + AUC",
};

const PATTERN_COLOR = {
  "time-dep":  "var(--ox)",
  "conc-dep":  "#b91c1c",
  "AUC":       "#7c3aed",
  "time+AUC":  "#0f766e",
};

/* Render the bar — purely CSS. The shape encodes the pattern:
     time-dep: solid uniform band (time above MIC is the target)
     conc-dep: tall left spike (peak/MIC is the target)
     AUC:      smooth uniform tint (area is the target)
     time+AUC: hybrid — spike + tail */
function PkPdBar({ pattern }) {
  const color = PATTERN_COLOR[pattern] || "var(--ink2)";

  if(pattern === "time-dep") {
    return (
      <div style={{
        position: "relative", height: 22,
        background: "linear-gradient(90deg, " + color + " 0%, " + color + " 100%)",
        opacity: 0.85,
        borderRadius: 4,
        border: "1px solid " + color,
      }} aria-hidden />
    );
  }

  if(pattern === "conc-dep") {
    return (
      <div style={{
        position: "relative", height: 22, borderRadius: 4,
        border: "1px solid " + color,
        background: "linear-gradient(90deg, " + color + " 0%, " + color + " 20%, " +
                    "transparent 22%, transparent 100%)",
        overflow: "hidden",
      }} aria-hidden>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: "20%",
          background: color, opacity: 0.85,
        }} />
      </div>
    );
  }

  if(pattern === "AUC") {
    return (
      <div style={{
        position: "relative", height: 22, borderRadius: 4,
        border: "1px solid " + color,
        background: "linear-gradient(180deg, " + color + "55 0%, " + color + "22 100%)",
      }} aria-hidden />
    );
  }

  if(pattern === "time+AUC") {
    return (
      <div style={{
        position: "relative", height: 22, borderRadius: 4,
        border: "1px solid " + color,
        background:
          "linear-gradient(90deg, " + color + " 0%, " + color + " 18%, " +
          color + "55 19%, " + color + "55 100%)",
      }} aria-hidden />
    );
  }

  return (
    <div style={{
      height: 22, background: "var(--paper2)", borderRadius: 4,
      border: "1px solid var(--line)",
    }} aria-hidden />
  );
}

function PkPdRow({ name, pkpd, timeToEffect }) {
  const color = PATTERN_COLOR[pkpd.pattern] || "var(--ink2)";
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "minmax(140px, 28%) 1fr auto",
      gap: 10,
      alignItems: "center",
      padding: "8px 0",
      borderTop: "1px solid var(--line)",
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{name}</div>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 9.5, color,
          letterSpacing: ".05em", textTransform: "uppercase", fontWeight: 700,
        }}>
          {PATTERN_LABEL[pkpd.pattern] || pkpd.pattern || "—"}
        </div>
      </div>

      <div style={{ minWidth: 0 }}>
        <PkPdBar pattern={pkpd.pattern} />
        <div style={{
          fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink2)",
          marginTop: 3, lineHeight: 1.45,
        }}>
          {pkpd.target}
        </div>
      </div>

      {timeToEffect && (
        <div style={{
          fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink2)",
          whiteSpace: "nowrap", textAlign: "right",
          padding: "2px 6px", background: "var(--paper2)",
          border: "1px solid var(--line)", borderRadius: 4,
        }} title="Median time to clinical response">
          Response in {timeToEffect}
        </div>
      )}
    </div>
  );
}

function PkPdBlock({ agents }) {
  if(!Array.isArray(agents) || agents.length === 0) return null;
  const rows = agents
    .map((name) => {
      const drug = _resolveDrug(name);
      if(!drug || !drug.pkpd) return null;
      return { name, pkpd: drug.pkpd, timeToEffect: drug.timeToEffect || null };
    })
    .filter(Boolean);
  if(rows.length === 0) return null;

  return (
    <Section kicker="PK/PD · How killing happens" icon={Activity} testId="pkpd-block">
      <div style={{
        background: "var(--paper2)",
        border: "1px solid var(--line)",
        borderRadius: 7,
        padding: "8px 11px",
        marginBottom: 10,
        fontSize: 11.5, lineHeight: 1.5, color: "var(--ink2)",
      }}>
        Visualizes the kinetic class of each agent in the regimen. The bar shape
        tells you whether to extend the infusion (time-dependent), front-load
        the dose (concentration-dependent), or target an AUC (vancomycin / FQ).
      </div>

      <div>
        {rows.map((row, i) => (
          <PkPdRow
            key={i}
            name={row.name}
            pkpd={row.pkpd}
            timeToEffect={row.timeToEffect}
          />
        ))}
      </div>
    </Section>
  );
}

export { PkPdBlock };
