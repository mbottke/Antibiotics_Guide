/* layer · ans-depth — "More depth" collapsed reference panel.
   Wraps Research, non-tier-1 Surge, SitePenetration, and the
   ctx-irrelevant PedsPreg into a native <details> expander.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js. */

import React from "react";
import { ChevronRight } from "lucide-react";
import { ResearchBlock } from "../ResearchBlock.jsx";
import { SurgeProtocolsBlock } from "../SurgeProtocolsBlock.jsx";
import { SitePenetrationBlock } from "../SitePenetrationBlock.jsx";
import { PedsPregBlock } from "../PedsPregBlock.jsx";

export const depthLayer = {
  id: "ans-depth",
  group: "evidence",
  spineLabel: "Depth",
  when: (shared) => !!(shared._research || shared._surgeOther.length > 0 || shared._siteP.length > 0 || (!shared._ctxPedsPreg && shared._pedsPreg.length > 0)),
  render: (shared) => {
    const { _research, _surgeOther, _siteP, _ctxPedsPreg, _pedsPreg } = shared;
    return (
      <details id="ans-depth" style={{
        marginTop: 8, padding: 0,
        border: "1px solid var(--line)", borderRadius: 8,
        background: "var(--paper2)",
        scrollMarginTop: 96,
      }}>
        {/* Wave 10 — summary picks up rx-focus-halo so keyboard tab focus
            shows the same cyan halo as inputs everywhere else. Adopt-by-
            class only; behavior + structure unchanged. */}
        <summary
          className="rx-focus-halo"
          style={{
            cursor: "pointer", padding: "10px 14px",
            fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700,
            color: "var(--ox)", letterSpacing: ".08em", textTransform: "uppercase",
            listStyle: "none", borderRadius: 8,
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <ChevronRight size={12} aria-hidden /> More depth · evidence + reference
        </summary>
        <div style={{ padding: "0 14px 14px" }}>
          <ResearchBlock research={_research} />
          {_surgeOther.length > 0 && <SurgeProtocolsBlock protocols={_surgeOther} />}
          <SitePenetrationBlock entries={_siteP} />
          {!_ctxPedsPreg && _pedsPreg.length > 0 && <PedsPregBlock entries={_pedsPreg} />}
        </div>
      </details>
    );
  },
};
