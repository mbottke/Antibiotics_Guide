/* layer · ans-pkpd — kinetic-class visualization for the current regimen.

   Wave 5 PR-9. Module shape documented in _index.js. Consumes
   FORMULARY.pkpd from PR-4 — returns null when no agent in the
   regimen has authored kinetic data (graceful-fallback contract).

   Reads agents from shared.pickedAgents when the clinician has
   selected from RegimenOptions, otherwise falls back to the
   composed empiric agents — so the bars track what the clinician
   is actually choosing. */

import React from "react";
import { PkPdBlock } from "../PkPdBlock.jsx";

function _agentsForBlock(shared) {
  const { pickedAgents, ans } = shared;
  if(Array.isArray(pickedAgents) && pickedAgents.length > 0) return pickedAgents;
  return Array.isArray(ans?.empiricAgents) ? ans.empiricAgents : [];
}

export const pkpdLayer = {
  id: "ans-pkpd",
  group: "evidence",
  spineLabel: "PK/PD",
  when: (shared) => {
    const agents = _agentsForBlock(shared);
    if(!agents.length) return false;
    // Cheap pre-check: PkPdBlock filters by FORMULARY membership; rely on
    // the block's own return-null contract. Keep the predicate truthy when
    // we have any agent — the block will render null if none carry pkpd.
    return true;
  },
  render: (shared) => {
    const agents = _agentsForBlock(shared);
    return (
      <div id="ans-pkpd" style={{ scrollMarginTop: 96 }}>
        <PkPdBlock agents={agents} />
      </div>
    );
  },
};
