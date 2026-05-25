/* layer · ans-antibiogram — institution-specific local %S overlay.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js. */

import React from "react";
import { AntibiogramBlock } from "../AntibiogramBlock.jsx";

export const antibiogramLayer = {
  id: "ans-antibiogram",
  group: "local",
  spineLabel: "Local %S",
  when: (shared) => !!shared.antibiogram,
  render: (shared) => (
    <div id="ans-antibiogram" style={{ scrollMarginTop: 96 }}>
      <AntibiogramBlock
        antibiogram={shared.antibiogram}
        syndrome={shared.s}
        onOpenManager={shared.onOpenAntibiogramManager}
      />
    </div>
  ),
};
