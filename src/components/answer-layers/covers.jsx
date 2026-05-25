/* layer · ans-covers — what the regimen covers + deliberate omissions.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js. */

import React from "react";
import { Check, Bug } from "lucide-react";
import { Section } from "../Section.jsx";
import { renderGloss } from "../rich-text.jsx";
import { ORG_BY_ID } from "../../data/organisms.js";

export const coversLayer = {
  id: "ans-covers",
  group: "core",
  spineLabel: "Covers",
  when: () => true,
  render: (shared) => {
    const { s, ans, onDrug, onOrg } = shared;
    return (
      <Section kicker="Covers" icon={Check} glyph="core" id="ans-covers">
        <div style={{ fontSize:13, color:"var(--ink2)", lineHeight:1.6 }}>
          <div style={{ marginBottom:6 }}>
            <span style={{ fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".1em", textTransform:"uppercase", color:"var(--green)", fontWeight:700, marginRight:6 }}>Cover</span>
            {renderGloss(s.cover.empiric, onDrug)}
          </div>
          <div style={{ marginBottom:6 }}>
            <span style={{ fontFamily:"var(--mono)", fontSize:9.5, letterSpacing:".1em", textTransform:"uppercase", color:"var(--ox)", fontWeight:700, marginRight:6 }}>Don't over-cover</span>
            {renderGloss(s.cover.drop, onDrug)}
          </div>
          {ans.bugs.length > 0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:9 }}>
              {ans.bugs.map(b => {
                const o = ORG_BY_ID[b];
                if(!o) return null;
                return (
                  <button key={b} type="button" onClick={() => onOrg && onOrg(b)}
                    style={{
                      display:"inline-flex", alignItems:"center", gap:4,
                      fontSize:11, fontWeight:500, padding:"3px 8px", borderRadius:999,
                      background:"var(--line2)", color:"var(--ink2)", border:"1px solid var(--line)",
                      cursor:"pointer",
                    }}>
                    <Bug size={10}/> {o.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Section>
    );
  },
};
