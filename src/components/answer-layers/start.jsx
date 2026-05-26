/* layer · ans-start — the regimen itself. Each tier (Core / Add MRSA /
   Add resistant-GNR cover / etc.) renders through RxLine; allergy
   guidance and patient-specific dose summary follow.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js.
   Wave 8 W8-A — adopts asymmetric 70/30 split (regimen | dosing aside),
   AsymmetricCard wrappers around the tier cards (alternating tl-br /
   tr-bl), Sparkle on the FIRST item ("Start now"), and the rail label
   + section counter. Numeric values (CrCl, doses) wrap in rx-numeric-
   mega so the digits read as the editorial moment they deserve. */

import React from "react";
import { Crosshair, Calculator, ShieldAlert } from "lucide-react";
import { Section } from "../Section.jsx";
import { RxLine } from "../RxLine.jsx";
import { AsymmetricCard } from "../decor/AsymmetricCard.jsx";
import { Sparkle } from "../decor/Sparkle.jsx";
import { GradientHairline } from "../decor/GradientHairline.jsx";

export const startLayer = {
  id: "ans-start",
  group: "core",
  spineLabel: "Start",
  when: () => true,
  render: (shared) => {
    const {
      ans, allergy, coreRefinements, onDrug, onOpenMechanism, dose,
      setTierPick, s, _layerIndex, _layerTotal,
    } = shared;

    /* Build the asymmetric dosing aside — narrow column with CrCl
       headline + tabular doses. Only renders when the case is
       "ctx.on" (clinical context populated). */
    const aside = ans.ctx.on && ans.empiricAgents.length > 0 ? (
      <div>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 9.5,
          letterSpacing: ".14em", textTransform: "uppercase",
          color: "var(--neon-cyan, var(--ox))", fontWeight: 700,
          marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 6,
        }}>
          <Calculator size={11} aria-hidden /> This patient
        </div>
        {ans.d.crcl != null && (
          <div className="rx-mixed-pair" style={{ alignItems: "baseline", marginBottom: 14 }}>
            <span
              className="rx-numeric-mega"
              style={{ fontSize: 56, lineHeight: 1, color: ans.d.crcl < 30 ? "var(--amber)" : "var(--neon-cyan, var(--ox))" }}
            >
              {ans.d.crcl}
            </span>
            <span className="rx-pair-light" style={{ fontSize: 12, color: "var(--ink2)" }}>
              CrCl mL/min
            </span>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ans.empiricAgents.map((n) => {
            const a = dose(n);
            const stat = (a && (a.kind === "band" || a.kind === "level") && a.adjusted) ? a.adjusted : (a ? a.normal : null);
            const changed = a && a.kind === "band" && a.changed;
            return (
              <div key={n} style={{
                display: "flex", flexDirection: "column", gap: 2,
                padding: "6px 10px",
                background: changed ? "var(--decision-adjusted-bg)" : "var(--paper2)",
                border: `1px solid ${changed ? "var(--decision-adjusted-line)" : "var(--line)"}`,
                borderRadius: "6px 2px 6px 2px",
              }}>
                <button
                  type="button"
                  onClick={() => onDrug && onDrug(n)}
                  style={{
                    fontFamily: "var(--sans)", fontSize: 12.5, fontWeight: 600,
                    color: "var(--ink)", background: "none", border: "none",
                    cursor: "pointer", padding: 0, textAlign: "left",
                    minWidth: 0, overflow: "hidden", textOverflow: "ellipsis",
                  }}
                >
                  {n.split(" / ")[0]}
                </button>
                <span style={{
                  fontFamily: "var(--mono)", fontSize: 11.5,
                  color: changed ? "var(--decision-adjusted)" : "var(--ink2)",
                  fontWeight: 600, overflowWrap: "anywhere",
                }}>
                  {stat || ""}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 10.5, color: "var(--muted)", fontStyle: "italic", marginTop: 9, lineHeight: 1.45 }}>
          Loading doses are full; adjustments are maintenance only.
        </div>
      </div>
    ) : null;

    /* The Core RxLine is the visual lede — wrap it in an AsymmetricCard
       tl-br and pin a Sparkle next to it. Subsequent Add tiers wrap in
       alternating tl-br / tr-bl cards. */
    const allTiers = [{ tier: ans.core, refinements: coreRefinements, kind: "core" }]
      .concat(ans.adds.map((a) => ({ tier: a, refinements: [], kind: "add" })));

    return (
      <Section
        kicker="Start now"
        kineticKicker
        icon={Crosshair}
        glyph="core"
        sticky
        id="ans-start"
        rail="START NOW"
        accent="cyan"
        artwork="mesh"
        index={_layerIndex}
        total={_layerTotal}
        split={!!aside}
        aside={aside}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {allTiers.map((entry, i) => {
            const pattern = i % 2 === 0 ? "tl-br" : "tr-bl";
            return (
              <AsymmetricCard
                key={`${entry.kind}-${i}`}
                pattern={pattern}
                elevation="e0"
                className={i === 0 ? "rx-glow-lift" : undefined}
                style={{
                  padding: "10px 12px",
                  background: i === 0 ? "var(--ox-softer)" : "var(--paper2)",
                  borderColor: i === 0 ? "var(--ox-line)" : "var(--line)",
                  position: "relative",
                }}
              >
                {i === 0 && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: -8, left: -8,
                      width: 22, height: 22,
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      background: "var(--neon-cyan, var(--ox))",
                      borderRadius: "50%",
                      boxShadow: "var(--neon-cyan-glow, 0 0 0 transparent)",
                    }}
                  >
                    <Sparkle size={14} color="#fff" />
                  </span>
                )}
                <RxLine
                  kind={entry.kind}
                  tier={entry.tier}
                  refinements={entry.refinements}
                  onDrug={onDrug}
                  onOpenMechanism={onOpenMechanism}
                  ctx={ans.ctx}
                  d={ans.d}
                  synId={s.id}
                  onAgentSelect={setTierPick(entry.tier.k)}
                />
              </AsymmetricCard>
            );
          })}
        </div>
        {allergy && (
          <>
            {/* Wave 10 — gradient hairline separates the regimen tiers from
                the allergy callout. Without it the callout reads as another
                tier card; the hairline tells the eye "this is metadata about
                the regimen, not part of it." */}
            <GradientHairline
              variant={allergy.tone === "ox" ? "cyan-blue" : "magenta-lime"}
              style={{ margin: "12px 0 10px" }}
            />
            <div style={{
              display: "flex", gap: 9, alignItems: "flex-start",
              padding: "10px 12px",
              background: allergy.tone === "ox" ? "var(--ox-soft)" : "var(--amber-soft)",
              border: `1px solid ${allergy.tone === "ox" ? "var(--ox-line)" : "var(--amber-line)"}`,
              borderRadius: "10px 3px 10px 3px",
              fontSize: 12,
              color: allergy.tone === "ox" ? "var(--ox-deep)" : "var(--amber)",
              lineHeight: 1.55,
            }}>
              <ShieldAlert size={14} aria-hidden style={{ flex: "0 0 auto", marginTop: 1 }} />
              <div><b>{allergy.head}.</b> {allergy.body}</div>
            </div>
          </>
        )}
      </Section>
    );
  },
};
