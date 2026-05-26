/* layer · ans-covers — what the regimen covers + deliberate omissions.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js.
   Wave 8 W8-A — adopts the asymmetric 65/35 split via Section's `aside`
   slot, AsymmetricCard for the "drop" callout, Sparkle markers on the
   drug-of-choice glosses, and the rail+counter+kineticKicker chrome.
   The narrow column carries the organism list (count + chips). */

import React from "react";
import { Check, Bug } from "lucide-react";
import { Section } from "../Section.jsx";
import { renderGloss } from "../rich-text.jsx";
import { ORG_BY_ID } from "../../data/organisms.js";
import { AsymmetricCard } from "../decor/AsymmetricCard.jsx";
import { Sparkle } from "../decor/Sparkle.jsx";
import { GradientHairline } from "../decor/GradientHairline.jsx";

export const coversLayer = {
  id: "ans-covers",
  group: "core",
  spineLabel: "Covers",
  when: () => true,
  render: (shared) => {
    const { s, ans, onDrug, onOrg, _layerIndex, _layerTotal } = shared;

    /* Build the organism roll-up for the aside slot — count + chips.
       The chips reuse the same onOrg handler the inline prose uses
       so click semantics stay identical. */
    const orgRoll = ans.bugs.map((b) => ORG_BY_ID[b]).filter(Boolean);

    const aside = (
      <div>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 9.5,
          letterSpacing: ".14em", textTransform: "uppercase",
          color: "var(--neon-cyan, var(--ox))", fontWeight: 700,
          marginBottom: 8,
        }}>
          Organisms covered
        </div>
        <div className="rx-mixed-pair" style={{ alignItems: "baseline", marginBottom: 10 }}>
          <span
            className="rx-numeric-mega"
            style={{ fontSize: 48, lineHeight: 1, color: "var(--neon-cyan, var(--ox))" }}
          >
            {orgRoll.length || "—"}
          </span>
          <span className="rx-pair-light" style={{ fontSize: 13 }}>
            {orgRoll.length === 1 ? "target" : "targets"}
          </span>
        </div>
        {orgRoll.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {orgRoll.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => onOrg && onOrg(o.id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 11, fontWeight: 500,
                  padding: "3px 8px", borderRadius: 999,
                  background: "var(--line2)",
                  color: "var(--ink2)",
                  border: "1px solid var(--line)",
                  cursor: "pointer",
                }}
              >
                <Bug size={10} aria-hidden /> {o.label}
              </button>
            ))}
          </div>
        )}
        {(ans.ctx.mrsaRisk || ans.ctx.esblRisk) && (
          <div style={{
            marginTop: 12, paddingTop: 10,
            borderTop: "1px dashed var(--line2)",
            fontFamily: "var(--mono)", fontSize: 10,
            letterSpacing: ".1em", textTransform: "uppercase",
            color: "var(--vivid-red, var(--red))", fontWeight: 700,
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            {/* Wave 10 — promote the flag glyph from a flat sparkle to the
                neon light-ring severity dot. The pulsing red ring carries
                the same hard-stop visual weight as a required-severity
                row, which is the correct register for an MRSA / ESBL flag
                (it CHANGES the regimen, it doesn't decorate it). */}
            {ans.ctx.mrsaRisk && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span className="rx-light-ring-red" aria-hidden />
                MRSA flag
              </span>
            )}
            {ans.ctx.esblRisk && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span className="rx-light-ring-red" aria-hidden />
                ESBL / R-GNR flag
              </span>
            )}
          </div>
        )}
      </div>
    );

    return (
      <Section
        kicker="Covers"
        kineticKicker
        icon={Check}
        glyph="core"
        id="ans-covers"
        rail="COVERAGE"
        accent="cyan"
        artwork="mesh"
        index={_layerIndex}
        total={_layerTotal}
        split
        aside={aside}
      >
        <div style={{ fontSize: 13, color: "var(--ink2)", lineHeight: 1.6 }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontFamily: "var(--mono)", fontSize: 9.5,
              letterSpacing: ".14em", textTransform: "uppercase",
              color: "var(--green)", fontWeight: 700, marginRight: 8,
            }}>
              <Sparkle size={10} color="var(--green)" /> Cover
            </span>
            {renderGloss(s.cover.empiric, onDrug)}
          </div>
          <GradientHairline variant="cyan-blue" style={{ margin: "10px 0 12px" }} />
          <AsymmetricCard
            pattern="tl-br"
            elevation="e0"
            style={{
              padding: "12px 14px",
              background: "var(--ox-softer)",
              borderColor: "var(--ox-line)",
            }}
          >
            <div style={{
              fontFamily: "var(--mono)", fontSize: 9.5,
              letterSpacing: ".14em", textTransform: "uppercase",
              color: "var(--ox)", fontWeight: 700, marginBottom: 6,
            }}>
              Don't over-cover
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink)", lineHeight: 1.55 }}>
              {renderGloss(s.cover.drop, onDrug)}
            </div>
          </AsymmetricCard>
        </div>
      </Section>
    );
  },
};
