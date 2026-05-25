/* layer · ans-risks — combined-regimen risks (agent-pair interactions).

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js. */

import React from "react";
import { CombinedRisksBlock } from "../CombinedRisksBlock.jsx";

export const risksLayer = {
  id: "ans-risks",
  group: "risks",
  spineLabel: "Risks",
  when: (shared) => shared.pickedAgents.length > 0,
  render: (shared) => (
    <div id="ans-risks" style={{ scrollMarginTop: 96 }}>
      <CombinedRisksBlock pickedAgents={shared.pickedAgents} />
    </div>
  ),
};
