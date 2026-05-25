/* layer · ans-surge — tier-1 surge protocols (bioterror / VHF / Ebola).
   Always-visible when present; non-tier-1 surge entries collapse with
   the reference layers inside ans-depth.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js. */

import React from "react";
import { SurgeProtocolsBlock } from "../SurgeProtocolsBlock.jsx";

export const surgeLayer = {
  id: "ans-surge",
  group: "local",
  spineLabel: "Surge",
  when: (shared) => shared._surgeTier1.length > 0,
  render: (shared) => (
    <div id="ans-surge" style={{ scrollMarginTop: 96 }}>
      <SurgeProtocolsBlock protocols={shared._surgeTier1} />
    </div>
  ),
};
