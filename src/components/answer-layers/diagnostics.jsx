/* layer · ans-diagnostics — workup before empiric (what to order).

   Wave 5 PR-6. Module shape documented in _index.js. Renders BEFORE
   the Start section per the plan: workup precedes empiric. Returns
   null when the syndrome has no authored diagnostics — graceful
   fallback contract identical to monitoring / duration / research. */

import React from "react";
import { DiagnosticsBlock } from "../DiagnosticsBlock.jsx";

export const diagnosticsLayer = {
  id: "ans-diagnostics",
  group: "core",
  spineLabel: "Workup",
  when: (shared) => !!shared._diagnostics,
  render: (shared) => {
    const { ans, _diagnostics } = shared;
    return (
      <div id="ans-diagnostics" style={{ scrollMarginTop: 96 }}>
        <DiagnosticsBlock
          diagnostics={_diagnostics}
          ctx={{ ...ans.ctx, ...ans.d }}
        />
      </div>
    );
  },
};
