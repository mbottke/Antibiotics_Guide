/* layer · ans-pedspreg — pediatric + pregnancy dosing notes. Gated on
   ctx pregnancy or pediatric age; adults don't need this layer on
   screen. The spineLabel function flips between "Pregnancy" and
   "Pediatrics" depending on ctx.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js. */

import React from "react";
import { PedsPregBlock } from "../PedsPregBlock.jsx";

export const pedsPregLayer = {
  id: "ans-pedspreg",
  group: "special",
  spineLabel: (shared) => shared.ans.ctx.pregnancy ? "Pregnancy" : "Pediatrics",
  when: (shared) => shared._pedsPregShow.length > 0,
  render: (shared) => (
    <div id="ans-pedspreg" style={{ scrollMarginTop: 96 }}>
      <PedsPregBlock entries={shared._pedsPregShow} />
    </div>
  ),
};
