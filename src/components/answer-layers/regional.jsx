/* layer · ans-regional — published regional resistance patterns.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js. */

import React from "react";
import { RegionalResistanceBlock } from "../RegionalResistanceBlock.jsx";

export const regionalLayer = {
  id: "ans-regional",
  group: "local",
  spineLabel: "Regional",
  when: (shared) => shared._regional.length > 0,
  render: (shared) => (
    <div id="ans-regional" style={{ scrollMarginTop: 96 }}>
      <RegionalResistanceBlock patterns={shared._regional} />
    </div>
  ),
};
