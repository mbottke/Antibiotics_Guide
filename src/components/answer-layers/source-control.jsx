/* layer · ans-source-control — leads the answer when the syndrome
   demands surgical drainage / device removal / mechanical control.
   Surfaceless (no spine chip); pure banner above ans-start.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js. */

import React from "react";
import { Crosshair } from "lucide-react";

export const sourceControlLayer = {
  id: "ans-source-control",
  group: "core",
  spineLabel: null,
  when: (shared) => !!shared.ans.sourceControl,
  render: (shared) => {
    const { ans } = shared;
    if (!ans.sourceControl) return null;
    return (
      <div style={{
        display:"flex", gap:10, alignItems:"flex-start",
        padding:"12px 14px", background:"var(--ox-soft)", border:"1px solid var(--ox-line)",
        borderRadius:10, marginBottom: 16, fontSize:12.5, color:"var(--ox-deep)", lineHeight:1.55,
      }}>
        <Crosshair size={15} style={{ flex:"0 0 auto", marginTop:1, color:"var(--ox)" }} />
        <div>
          <b>Source control is the therapy; antibiotics are adjunctive.</b> {ans.sourceControl}
        </div>
      </div>
    );
  },
};
