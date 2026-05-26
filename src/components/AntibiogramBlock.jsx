/* component · AntibiogramBlock — Phase E3 institution-specific
   resistance overlay. Renders directly above RegionalResistanceBlock
   in AnswerCanvas, surfacing the user's *local* %S for the
   organisms that drive this syndrome's empiric choice and flagging
   any empiric tier whose agent falls below the 80% gate.

   THE READING CONTRACT
   --------------------
   1. Header: "Local antibiogram · <hospital> · <period>" — the
      provenance the clinician needs to evaluate the number.
   2. Tier flags: one chip per empiric tier with worst-case flag
      (ok / borderline / poor / unknown) + issues list when
      borderline-or-worse.
   3. Bug grid: organisms × agents matrix scoped to the syndrome's
      bugs[] × tiers' rx agents. Cells show %S with color-coded
      severity and footnote markers (urine / meningitis / smallN).
   4. "Add another antibiogram" affordance → opens manager.

   Render-nothing contract: returns null when no antibiogram active,
   no bugs in syndrome map to the antibiogram, or no agents in tiers
   appear on the antibiogram. Optional layer; no breaking change.

   Inpatient Antibiotic Guide — module graph documented in README.md. */
import React from "react";
import { Hospital, AlertTriangle, AlertCircle, CheckCircle2, HelpCircle, Settings2 } from "lucide-react";
import { Section } from "./Section.jsx";
import { summarizeSyndrome } from "../engines/antibiogramOverlay.js";
import { ANTIBIOGRAM_AGENTS } from "../data/antibiograms/index.js";

const _FLAG_STYLE = {
  ok: {
    Icon: CheckCircle2,
    label: "OK",
    color: "var(--green, #166534)",
    bg: "rgba(22, 101, 52, 0.08)",
    line: "rgba(22, 101, 52, 0.25)",
  },
  borderline: {
    Icon: AlertCircle,
    label: "BORDERLINE",
    color: "var(--amber)",
    bg: "var(--amber-soft)",
    line: "var(--amber-line)",
  },
  poor: {
    Icon: AlertTriangle,
    label: "POOR",
    color: "#b91c1c",
    bg: "rgba(185, 28, 28, 0.08)",
    line: "rgba(185, 28, 28, 0.30)",
  },
  unknown: {
    Icon: HelpCircle,
    label: "N/A",
    color: "var(--ink2)",
    bg: "var(--paper2)",
    line: "var(--line)",
  },
};

function FlagChip({ flag, size = "md" }) {
  const sty = _FLAG_STYLE[flag] || _FLAG_STYLE.unknown;
  const Icon = sty.Icon;
  const pad = size === "sm" ? "1px 5px" : "2px 7px";
  const fs = size === "sm" ? 8.5 : 9;
  /* W10 · escalating tiers pick up a tinted outer halo so the severity
     ladder reads as three deliberate glow levels rather than three flat
     colored chips. "OK" / "N/A" stay flat — promoting them with halos
     would dilute the "this is critical" signal the red glow carries. */
  const halo = flag === "poor"
    ? "0 0 10px -2px color-mix(in srgb, " + sty.color + " 65%, transparent)"
    : flag === "borderline"
    ? "0 0 8px -2px color-mix(in srgb, " + sty.color + " 50%, transparent)"
    : "none";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontFamily: "var(--mono)", fontSize: fs, fontWeight: 700,
      color: "#fff", background: sty.color,
      padding: pad, borderRadius: 3, letterSpacing: ".06em",
      whiteSpace: "nowrap",
      boxShadow: halo,
    }}>
      <Icon size={size === "sm" ? 8 : 9} aria-hidden /> {sty.label}
    </span>
  );
}

function SusceptibilityCell({ susc, smallN }) {
  if(susc.value == null) {
    return (
      <span title="No data recorded" style={{
        fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink2)",
      }}>—</span>
    );
  }
  const sty = _FLAG_STYLE[susc.flag] || _FLAG_STYLE.unknown;
  const ctx = susc.contextValue != null && susc.contextValue !== susc.defaultValue;
  return (
    <span
      title={(susc.caveat || ("Local %S: " + susc.value + "%")) + (smallN ? " · low isolate count" : "")}
      style={{
        display: "inline-flex", alignItems: "center", gap: 3,
        fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700,
        color: sty.color,
        opacity: smallN ? 0.75 : 1,
      }}>
      {susc.value}
      <span style={{ fontWeight: 500, fontSize: 9 }}>%</span>
      {ctx && <sup style={{ fontSize: 7, color: "var(--ox)", marginLeft: 1 }} aria-label="context breakpoint">‡</sup>}
      {susc.caveat && <sup style={{ fontSize: 7, color: "#b91c1c", marginLeft: 1 }} aria-label="caveat">!</sup>}
    </span>
  );
}

function TierFlagRow({ tier }) {
  const sty = _FLAG_STYLE[tier.worst] || _FLAG_STYLE.unknown;
  return (
    <li style={{
      display: "grid", gap: 4,
      padding: "7px 11px",
      background: sty.bg,
      border: "1px solid " + sty.line,
      borderLeft: "3px solid " + sty.color,
      borderRadius: 5,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink)" }}>
            {tier.label || ("Tier " + (tier.tierIdx + 1))}
          </div>
          {tier.agents.length > 0 && (
            <div style={{ fontSize: 10.5, color: "var(--ink2)", fontFamily: "var(--mono)", letterSpacing: ".02em", marginTop: 2 }}>
              {tier.agents.map(a => (ANTIBIOGRAM_AGENTS[a] && ANTIBIOGRAM_AGENTS[a].display) || a).join(" · ")}
            </div>
          )}
        </div>
        <FlagChip flag={tier.worst} />
      </div>
      {tier.issues && tier.issues.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: "2px 0 0", display: "grid", gap: 2 }}>
          {tier.issues.map((iss, i) => (
            <li key={"iss-" + i} style={{ fontSize: 10.75, lineHeight: 1.45, color: "var(--ink)" }}>
              <span style={{ color: sty.color, fontWeight: 700, marginRight: 4 }}>·</span>{iss}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function CoverageGrid({ coverage }) {
  if(!coverage || coverage.bugRows.length === 0 || coverage.agentsOfInterest.length === 0) {
    return null;
  }
  const agents = coverage.agentsOfInterest;
  return (
    <div
      role="region"
      aria-label="Local susceptibility grid — organisms × agents"
      tabIndex={0}
      style={{ overflowX: "auto", marginTop: 8, border: "1px solid var(--line)", borderRadius: 6 }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--mono)" }}>
        <thead>
          <tr style={{ background: "var(--paper2)" }}>
            <th style={{
              fontSize: 10, fontWeight: 700, color: "var(--ink2)",
              textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--line)",
              textTransform: "uppercase", letterSpacing: ".06em", whiteSpace: "nowrap",
            }}>Organism</th>
            <th style={{
              fontSize: 10, fontWeight: 700, color: "var(--ink2)",
              textAlign: "right", padding: "6px 8px", borderBottom: "1px solid var(--line)",
              textTransform: "uppercase", letterSpacing: ".06em", whiteSpace: "nowrap",
            }}>n</th>
            {agents.map(a => (
              <th key={a} style={{
                fontSize: 9.5, fontWeight: 700, color: "var(--ink2)",
                textAlign: "center", padding: "6px 6px", borderBottom: "1px solid var(--line)",
                textTransform: "uppercase", letterSpacing: ".04em",
              }}>
                {(ANTIBIOGRAM_AGENTS[a] && ANTIBIOGRAM_AGENTS[a].display) || a}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {coverage.bugRows.map((row, idx) => (
            <tr key={row.species + "-" + idx} style={{ borderTop: idx === 0 ? "none" : "1px solid var(--line)" }}>
              <td style={{
                fontSize: 11, fontWeight: 600, color: "var(--ink)",
                padding: "5px 8px", whiteSpace: "nowrap",
                fontFamily: "var(--serif)",
              }}>
                <i>{row.species}</i>
                {row.smallN && <sup title="small isolate count" style={{ fontSize: 8, color: "var(--ink2)", marginLeft: 2 }}>†</sup>}
              </td>
              <td style={{ fontSize: 10, color: "var(--ink2)", padding: "5px 8px", textAlign: "right" }}>
                {row.n || "—"}
              </td>
              {agents.map(a => (
                <td key={a} style={{ padding: "5px 6px", textAlign: "center" }}>
                  <SusceptibilityCell susc={row.agents[a]} smallN={row.smallN} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AntibiogramBlock({ antibiogram, syndrome, onOpenManager }) {
  if(!antibiogram || !syndrome) return null;
  const summary = summarizeSyndrome(antibiogram, syndrome);
  const hasBugRows = summary.coverage.bugRows.length > 0;
  const hasTierFlags = summary.tiers.some(t => t.agents.length > 0);
  if(!hasBugRows && !hasTierFlags) return null;

  return (
    <Section
      kicker={"Local antibiogram · " + antibiogram.name}
      icon={Hospital}
      testId="antibiogram-block"
    >
      {/* Header strip — provenance + manage affordance */}
      <div style={{
        background: "rgba(15, 76, 129, 0.06)",
        border: "1px solid var(--ox-line)",
        borderRadius: 6,
        padding: "7px 10px",
        marginBottom: 10,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 8,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink)" }}>
            {antibiogram.subtitle || antibiogram.name}
          </div>
          {antibiogram.period && (antibiogram.period.from || antibiogram.period.to) && (
            <div style={{ fontSize: 10, color: "var(--ink2)", fontFamily: "var(--mono)", marginTop: 1 }}>
              Period {antibiogram.period.from} → {antibiogram.period.to}
              {antibiogram.source && <> · {antibiogram.source}</>}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {summary.coverage.context && (
            <span style={{
              fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700,
              color: "var(--ox)", background: "var(--paper)",
              padding: "2px 6px", borderRadius: 3,
              border: "1px solid var(--ox-line)",
              letterSpacing: ".08em", textTransform: "uppercase", whiteSpace: "nowrap",
            }}>
              ‡ {summary.coverage.context} breakpoints
            </span>
          )}
          {/* Wave 10 — Manage button promoted from a flat ghost-button to
              the rx-chrome-cta metallic pill so the only call-to-action
              on the antibiogram strip reads as a deliberate affordance
              (it opens a destructive-capable manager). The pill keeps
              the existing onClick + title; only the visual chrome
              changes. We scale down the typography to fit the existing
              header strip's vertical rhythm. */}
          {onOpenManager && (
            <button
              type="button"
              onClick={onOpenManager}
              title="Manage hospital antibiograms"
              className="rx-chrome-cta"
              style={{
                fontSize: 10, padding: "4px 10px", gap: 5,
                letterSpacing: ".06em", textTransform: "uppercase",
                fontFamily: "var(--mono)", borderRadius: "8px 2px 8px 2px",
                flex: "0 0 auto",
              }}>
              <Settings2 size={10} aria-hidden /> Manage
            </button>
          )}
        </div>
      </div>

      {/* Tier flags */}
      {hasTierFlags && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
          {summary.tiers.filter(t => t.agents.length > 0).map(t => (
            <TierFlagRow key={"tier-" + t.tierIdx} tier={t} />
          ))}
        </ul>
      )}

      {/* Coverage grid */}
      <CoverageGrid coverage={summary.coverage} />

      {/* Footer — caveat / missing-orgs note */}
      <div style={{
        marginTop: 8,
        fontSize: 10.5, color: "var(--ink2)", lineHeight: 1.5,
      }}>
        Population-level signals, not patient-specific. Confirm against current culture data and pharmacy ID consultation.
        {summary.coverage.missingOrgs.length > 0 && (
          <> Some likely organisms ({summary.coverage.missingOrgs.join(", ")}) are not represented in this antibiogram — see the regional resistance block below for narrative context.</>
        )}
      </div>
    </Section>
  );
}

export { AntibiogramBlock, FlagChip };
