/* layer · ans-deesc — de-escalation by organism at 48–72 h.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js.
   Wave 8 W8-A — adopts the rail/numeral/counter editorial chrome, and
   the prose lede gets a kinetic display kicker. Rows wrap in
   AsymmetricCards with alternating tl-br / tr-bl patterns. */

import React from "react";
import { TrendingDown, Crosshair, Bug, ArrowRight, Scissors } from "lucide-react";
import { Section } from "../Section.jsx";
import { renderGloss, renderRich } from "../rich-text.jsx";
import { AsymmetricCard } from "../decor/AsymmetricCard.jsx";

export const deescLayer = {
  id: "ans-deesc",
  group: "core",
  spineLabel: "48–72 h",
  when: () => true,
  render: (shared) => {
    const { s, ans, onDrug, onOrg, _layerIndex, _layerTotal } = shared;
    return (
      <Section
        kicker="Stop at 48–72 h"
        kineticKicker
        icon={TrendingDown}
        glyph="core"
        id="ans-deesc"
        rail="DE-ESCALATION"
        accent="cyan"
        index={_layerIndex}
        total={_layerTotal}
      >
        <div style={{
          fontSize: 13, color: "var(--ink2)", lineHeight: 1.6,
          marginBottom: ans.deesc.length ? 14 : 0,
        }}>
          {renderGloss(s.deesc, onDrug)}
        </div>
        {ans.deesc.length > 0 && (
          <div>
            <div style={{
              fontFamily: "var(--mono)", fontSize: 9.5,
              letterSpacing: ".14em", textTransform: "uppercase",
              color: "var(--muted)", fontWeight: 600, marginBottom: 9,
            }}>
              <Crosshair size={11} style={{ verticalAlign: "-1px", marginRight: 5 }} />
              Narrow by organism
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ans.deesc.slice(0, 6).map((row, i) => (
                <AsymmetricCard
                  key={row.id}
                  pattern={i % 2 === 0 ? "tl-br" : "tr-bl"}
                  elevation="e0"
                  style={{
                    padding: "8px 10px",
                    background: "var(--paper2)",
                  }}
                >
                  <div style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 12, lineHeight: 1.5 }}>
                    <button
                      type="button"
                      onClick={() => onOrg && onOrg(row.id)}
                      style={{
                        flex: "0 0 auto", display: "inline-flex", alignItems: "center", gap: 4,
                        fontSize: 11, fontWeight: 600,
                        color: "var(--ox)", background: "var(--ox-softer)",
                        border: "1px solid var(--ox-line)",
                        borderRadius: 5, padding: "3px 7px",
                        cursor: "pointer", whiteSpace: "nowrap",
                      }}
                    >
                      <Bug size={10} /> {row.label}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {row.targets.length > 0
                        ? row.targets.map((t, j) => (
                            <div key={j} style={{ marginBottom: j < row.targets.length - 1 ? 4 : 0 }}>
                              {t.sub && row.targets.length > 1 && (
                                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginRight: 6 }}>{t.sub}</span>
                              )}
                              <ArrowRight size={10} style={{ verticalAlign: "-1px", color: "var(--muted)", margin: "0 4px" }} />
                              {renderRich(t.first, onDrug)}
                            </div>
                          ))
                        : row.docFallback.length > 0 && (
                            <span>
                              <ArrowRight size={10} style={{ verticalAlign: "-1px", color: "var(--muted)", marginRight: 4 }} />
                              {row.docFallback.map((n, j) => (
                                <React.Fragment key={n}>
                                  {j ? ", " : ""}
                                  <button
                                    type="button"
                                    onClick={() => onDrug && onDrug(n)}
                                    style={{
                                      background: "none", border: "none", padding: 0,
                                      color: "var(--ox)", fontWeight: 600, cursor: "pointer",
                                      textDecoration: "underline", textDecorationStyle: "dotted",
                                      textUnderlineOffset: 2,
                                    }}
                                  >
                                    {n}
                                  </button>
                                </React.Fragment>
                              ))}
                            </span>
                          )}
                      {row.stop.length > 0 && (
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                          <Scissors size={10} style={{ verticalAlign: "-1px", marginRight: 4 }} />
                          Lets you stop: {row.stop.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                </AsymmetricCard>
              ))}
            </div>
          </div>
        )}
      </Section>
    );
  },
};
