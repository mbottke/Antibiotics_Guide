/* layer · ans-rationale — driver / guideline / rejected reasoning trace.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js. */

import React from "react";
import { ReasoningTraceBlock } from "../ReasoningTraceBlock.jsx";

export const rationaleLayer = {
  id: "ans-rationale",
  group: "risks",
  spineLabel: "Why",
  when: (shared) => !!shared._rationale,
  render: (shared) => (
    <div id="ans-rationale" style={{ scrollMarginTop: 96 }}>
      <ReasoningTraceBlock rationale={shared._rationale} onCite={shared.onCite} />
    </div>
  ),
};
