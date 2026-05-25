/* layer · ans-monitoring — what to check (BCx, lactate, AUC, etc.).

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js. */

import React from "react";
import { MonitoringBlock } from "../MonitoringBlock.jsx";

export const monitoringLayer = {
  id: "ans-monitoring",
  group: "duration",
  spineLabel: "Monitor",
  when: (shared) => !!shared._monitoring,
  render: (shared) => {
    const { ans, _monitoring, pickedAgents, effectiveBranch } = shared;
    return (
      <div id="ans-monitoring" style={{ scrollMarginTop: 96 }}>
        <MonitoringBlock
          monitoring={_monitoring}
          pickedAgents={pickedAgents}
          pickedBranch={effectiveBranch}
          ctx={{ ...ans.ctx, ...ans.d }}
        />
      </div>
    );
  },
};
