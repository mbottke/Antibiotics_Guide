/* layer · ans-state — Reassessment / current-state panel (cultures,
   clinical trajectory, source control). Despite the legacy file
   name, this is not a longitudinal reassessment workflow — it's a
   set of optional state toggles that further narrow the snapshot
   answer when the clinician knows them.

   Wave 5 PR-3 Stage 2. Module shape documented in _index.js. */

import React from "react";
import { ReassessmentPanel } from "../ReassessmentPanel.jsx";

export const stateLayer = {
  id: "ans-state",
  group: "duration",
  spineLabel: "State",
  when: () => true,
  render: (shared) => {
    const { caseState, setCaseState, ans, onDrug, onOrg, _duration } = shared;
    return (
      <div id="ans-state" style={{ scrollMarginTop: 96 }}>
        <ReassessmentPanel
          caseState={caseState}
          setCaseState={setCaseState}
          empiric={ans}
          onDrug={onDrug}
          onOrg={onOrg}
          hasStructuredDuration={!!_duration}
        />
      </div>
    );
  },
};
