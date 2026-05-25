/* layer · ans-opat — outpatient IV pathway.

   Wave 5 PR-8. Module shape documented in _index.js. Sits between
   monitoring and the regional / novel / surge depth layers. Returns
   null when the syndrome has no authored OPAT profile (oral-only
   syndromes correctly miss). */

import React from "react";
import { OPATBlock } from "../OPATBlock.jsx";

export const opatLayer = {
  id: "ans-opat",
  group: "duration",
  spineLabel: "OPAT",
  when: (shared) => !!shared._opat,
  render: (shared) => {
    const { ans, _opat } = shared;
    return (
      <div id="ans-opat" style={{ scrollMarginTop: 96 }}>
        <OPATBlock
          opat={_opat}
          ctx={{ ...ans.ctx, ...ans.d }}
        />
      </div>
    );
  },
};
