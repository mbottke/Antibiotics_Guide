/* layer · ans-duration (structured) — DurationBlock with branches, stopWhen,
   extendIf, and the bidirectional source-controlled bridge.

   Fires when getSyndromeDuration returned a structured object; the
   legacy narrative fallback (duration-legacy.jsx) covers the case
   when this is absent.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js. */

import React from "react";
import { DurationBlock } from "../DurationBlock.jsx";

export const durationLayer = {
  id: "ans-duration",
  group: "duration",
  spineLabel: "Duration",
  when: (shared) => !!shared._duration,
  render: (shared) => {
    const { ans, _duration, pickedAgents, effectiveBranch, handleBranchSelect, startDate, setStartDate } = shared;
    return (
      <div id="ans-duration" style={{ scrollMarginTop: 96 }}>
        <DurationBlock
          duration={_duration}
          pickedAgents={pickedAgents}
          pickedBranch={effectiveBranch}
          onBranchSelect={handleBranchSelect}
          startDate={startDate}
          onStartDateChange={setStartDate}
          ctx={{ ...ans.ctx, ...ans.d }}
        />
      </div>
    );
  },
};
