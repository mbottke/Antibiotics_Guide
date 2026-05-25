/* layer · ans-objections — pharmacist's predictable pushback, pre-answered.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js. */

import React from "react";
import { ObjectionsBlock } from "../ObjectionsBlock.jsx";

export const objectionsLayer = {
  id: "ans-objections",
  group: "risks",
  spineLabel: "Challenge",
  when: (shared) => shared._objections && shared._objections.length > 0,
  render: (shared) => (
    <div id="ans-objections" style={{ scrollMarginTop: 96 }}>
      <ObjectionsBlock objections={shared._objections} onCite={shared.onCite} />
    </div>
  ),
};
